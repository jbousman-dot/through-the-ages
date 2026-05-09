// ============================================================
// simulator.js — Core headless simulation engine
// ============================================================

import { createFreshState } from "./state.js";
import { ERAS } from "./data.js";
import { recalculateStats } from "./formulas.js";
import { performClick, canAdvanceEra, advanceEra } from "./actions.js";
import { autobuy } from "./autobuy.js";

const DT_S = 1; // 1-second ticks
const SNAPSHOT_INTERVAL = 60; // snapshot every 60 seconds
const CLICK_RATE = 3; // clicks per second (simulated active player)
const CLICK_FALLOFF_KPS = 50; // stop clicking when auto-gen exceeds this

// Seeded PRNG (Mulberry32)
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function simulateRun({ duration = 86400 * 7, strategy = "efficient", seed = 42 }) {
    const state = createFreshState();
    const rng = mulberry32(seed);

    const snapshots = [];
    const milestones = {};
    const opsThresholds = [1, 10, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12];
    const reachedOps = new Set();

    let elapsed = 0;
    let snapshotAcc = 0;

    // Track state for wall/runaway detection
    const opsHistory = []; // { time, ops }

    recalculateStats(state);

    while (elapsed < duration) {
        elapsed += DT_S;
        snapshotAcc += DT_S;

        // --- Production ---
        if (state.knowledgePerSecond > 0) {
            const gain = state.knowledgePerSecond * DT_S;
            state.knowledge += gain;
            state.totalKnowledge += gain;
        }

        // --- Active clicking (simulated player) ---
        if (state.knowledgePerSecond < CLICK_FALLOFF_KPS) {
            for (let i = 0; i < CLICK_RATE; i++) {
                performClick(state);
            }
        }

        // --- Auto-buy ---
        autobuy(state, strategy);

        // --- Era advancement ---
        if (canAdvanceEra(state)) {
            const fromEra = ERAS[state.currentEra].name;
            advanceEra(state);
            const toEra = ERAS[state.currentEra].name;
            const key = `era_${state.currentEra}`;
            if (!milestones[key]) {
                milestones[key] = {
                    time: elapsed,
                    description: `Advanced from ${fromEra} to ${toEra}`,
                };
            }
        }

        // --- Population ---
        state.population = Math.log2(state.totalKnowledge + 1) * 10;

        // --- OPS threshold tracking ---
        for (const threshold of opsThresholds) {
            if (!reachedOps.has(threshold) && state.knowledgePerSecond >= threshold) {
                reachedOps.add(threshold);
                milestones[`kps_${threshold}`] = {
                    time: elapsed,
                    description: `Reached ${formatBigNumber(threshold)} knowledge/sec`,
                };
            }
        }

        // --- Milestone: first click-based thresholds ---
        if (!milestones.first_upgrade && Object.keys(state.upgrades).length > 0) {
            milestones.first_upgrade = { time: elapsed, description: "Bought first upgrade" };
        }
        if (!milestones.first_auto && state.knowledgePerSecond > 0) {
            milestones.first_auto = { time: elapsed, description: "First auto-generation" };
        }

        // --- OPS history for wall detection ---
        if (snapshotAcc >= SNAPSHOT_INTERVAL) {
            snapshotAcc = 0;
            opsHistory.push({ time: elapsed, ops: state.knowledgePerSecond });

            snapshots.push({
                time: elapsed,
                knowledge: state.knowledge,
                totalKnowledge: state.totalKnowledge,
                kps: state.knowledgePerSecond,
                kpc: state.knowledgePerClick,
                era: state.currentEra,
                eraName: ERAS[state.currentEra].name,
                scholars: state.scholars,
                population: state.population,
                upgrades: { ...state.upgrades },
                totalClicks: state.totalClicks,
                prestiges: state.totalPrestiges,
            });
        }
    }

    return {
        profile: strategy,
        duration,
        seed,
        finalState: { ...state },
        snapshots,
        milestones,
        opsHistory,
    };
}

// --- Analysis Functions ---

export function detectWalls(opsHistory, windowSize = 300, threshold = 0.05) {
    const walls = [];
    if (opsHistory.length < 2) return walls;

    // Look for windows where OPS growth is < threshold (5%)
    for (let i = 0; i < opsHistory.length; i++) {
        const start = opsHistory[i];
        // Skip early game (first 2 minutes)
        if (start.time < 120) continue;

        // Find entry ~windowSize seconds later
        let end = null;
        for (let j = i + 1; j < opsHistory.length; j++) {
            if (opsHistory[j].time >= start.time + windowSize) {
                end = opsHistory[j];
                break;
            }
        }
        if (!end) break;

        const startOps = Math.max(start.ops, 0.001);
        const growth = (end.ops - start.ops) / startOps;

        if (growth < threshold && start.ops > 0) {
            // Check if we already logged a wall overlapping this time
            const lastWall = walls[walls.length - 1];
            if (lastWall && start.time < lastWall.endTime + windowSize) continue;

            walls.push({
                startTime: start.time,
                endTime: end.time,
                stallDuration: end.time - start.time,
                opsAtStart: start.ops,
                opsAtEnd: end.ops,
                growth: (growth * 100).toFixed(2) + "%",
            });
        }
    }
    return walls;
}

export function detectRunaway(opsHistory) {
    const runaways = [];
    for (let i = 1; i < opsHistory.length; i++) {
        const prev = opsHistory[i - 1];
        const curr = opsHistory[i];
        if (prev.ops > 0 && curr.ops / prev.ops > 100) {
            runaways.push({
                time: curr.time,
                prevOps: prev.ops,
                currOps: curr.ops,
                ratio: (curr.ops / prev.ops).toFixed(1) + "x",
            });
        }
    }
    return runaways;
}

export function generateReport(result) {
    const { profile, duration, seed, finalState, milestones, opsHistory, snapshots } = result;
    const walls = detectWalls(opsHistory);
    const runaways = detectRunaway(opsHistory);

    const lines = [];
    const hr = "═".repeat(60);

    lines.push(hr);
    lines.push("  THROUGH THE AGES — SIMULATION HEALTH REPORT");
    lines.push(hr);
    lines.push(`  Profile:    ${profile}`);
    lines.push(`  Duration:   ${formatTime(duration)}`);
    lines.push(`  Seed:       ${seed}`);
    lines.push("");

    // --- Milestones ---
    lines.push("  MILESTONES");
    lines.push("  " + "─".repeat(55));
    const sortedMilestones = Object.entries(milestones)
        .sort((a, b) => a[1].time - b[1].time);
    if (sortedMilestones.length === 0) {
        lines.push("  (none reached)");
    } else {
        for (const [key, m] of sortedMilestones) {
            lines.push(`  ${padRight(formatTime(m.time), 12)} ${m.description}`);
        }
    }
    lines.push("");

    // --- OPS Progression Curve ---
    lines.push("  KPS PROGRESSION (sampled)");
    lines.push("  " + "─".repeat(55));
    const samplePoints = [0, 60, 300, 600, 1800, 3600, 7200, 14400, 43200, 86400, 259200, 604800];
    for (const t of samplePoints) {
        if (t > duration) break;
        const snap = snapshots.find(s => s.time >= t);
        if (snap) {
            lines.push(`  ${padRight(formatTime(snap.time), 12)} ${formatBigNumber(snap.kps)} kps | Era: ${snap.eraName} | Scholars: ${snap.scholars}`);
        }
    }
    lines.push("");

    // --- Walls ---
    lines.push("  PROGRESSION WALLS");
    lines.push("  " + "─".repeat(55));
    if (walls.length === 0) {
        lines.push("  ✅ No significant progression walls detected");
    } else {
        lines.push(`  ⚠️  ${walls.length} wall(s) detected:`);
        for (const w of walls) {
            lines.push(`  ${formatTime(w.startTime)} → ${formatTime(w.endTime)} (${formatTime(w.stallDuration)} stall)`);
            lines.push(`    KPS: ${formatBigNumber(w.opsAtStart)} → ${formatBigNumber(w.opsAtEnd)} (${w.growth} growth)`);
        }
    }
    lines.push("");

    // --- Runaways ---
    lines.push("  RUNAWAY SCALING");
    lines.push("  " + "─".repeat(55));
    if (runaways.length === 0) {
        lines.push("  ✅ No runaway scaling detected");
    } else {
        lines.push(`  ⚠️  ${runaways.length} runaway event(s):`);
        for (const r of runaways) {
            lines.push(`  ${formatTime(r.time)}: ${formatBigNumber(r.prevOps)} → ${formatBigNumber(r.currOps)} (${r.ratio} jump)`);
        }
    }
    lines.push("");

    // --- Final State ---
    lines.push("  FINAL STATE");
    lines.push("  " + "─".repeat(55));
    lines.push(`  Era:              ${ERAS[finalState.currentEra].name} (${finalState.currentEra})`);
    lines.push(`  Knowledge:        ${formatBigNumber(finalState.knowledge)}`);
    lines.push(`  Total Knowledge:  ${formatBigNumber(finalState.totalKnowledge)}`);
    lines.push(`  Knowledge/sec:    ${formatBigNumber(finalState.knowledgePerSecond)}`);
    lines.push(`  Knowledge/click:  ${formatBigNumber(finalState.knowledgePerClick)}`);
    lines.push(`  Scholars:         ${finalState.scholars}`);
    lines.push(`  Population:       ${formatBigNumber(finalState.population)}`);
    lines.push(`  Total Clicks:     ${formatBigNumber(finalState.totalClicks)}`);
    lines.push(`  Era Advances:     ${finalState.totalPrestiges}`);
    lines.push(`  Upgrades Owned:   ${Object.values(finalState.upgrades).reduce((a, b) => a + b, 0)}`);
    lines.push("");

    // --- Upgrade breakdown ---
    lines.push("  UPGRADES PURCHASED");
    lines.push("  " + "─".repeat(55));
    for (const [id, count] of Object.entries(finalState.upgrades)) {
        if (count > 0) lines.push(`  ${padRight(id, 20)} x${count}`);
    }
    lines.push("");

    // --- Health Summary ---
    lines.push(hr);
    const issues = walls.length + runaways.length;
    if (issues === 0) {
        lines.push("  ✅ HEALTH: GOOD — No balance issues detected");
    } else {
        lines.push(`  ⚠️  HEALTH: ${issues} issue(s) found — review walls/runaways above`);
    }
    lines.push(hr);

    return lines.join("\n");
}

// --- Helpers ---

function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    if (seconds < 86400) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    }
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    return `${d}d ${h}h`;
}

function formatBigNumber(n) {
    if (n === Infinity) return "∞";
    if (typeof n !== "number" || isNaN(n)) return "0";
    if (n < 1000) return Math.floor(n * 10) / 10 + "";
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp"];
    const tier = Math.floor(Math.log10(n) / 3);
    if (tier < suffixes.length) {
        const scaled = n / Math.pow(10, tier * 3);
        return scaled.toFixed(scaled < 10 ? 2 : 1) + suffixes[tier];
    }
    return n.toExponential(2);
}

function padRight(str, len) {
    return str + " ".repeat(Math.max(0, len - str.length));
}
