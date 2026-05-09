#!/usr/bin/env node
// ============================================================
// index.js — CLI entry point for Through the Ages simulator
// ============================================================

import { simulateRun, generateReport } from "./src/simulator.js";
import { STRATEGIES } from "./src/autobuy.js";

// --- Parse CLI args ---
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split("=")[1] : defaultVal;
}
const hasFlag = (name) => args.includes(`--${name}`);

const duration = parseInt(getArg("duration", "604800")); // default 7 days
const seed = parseInt(getArg("seed", "42"));
const runAll = hasFlag("all");
const jsonOutput = hasFlag("json");
const profileArg = getArg("profile", "efficient");

// --- Run ---
console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║     THROUGH THE AGES — Simulation Verification         ║");
console.log("╚══════════════════════════════════════════════════════════╝");
console.log();

const profiles = runAll
    ? Object.keys(STRATEGIES)
    : [profileArg];

const allResults = [];

for (const profile of profiles) {
    const startMs = Date.now();
    console.log(`Running ${profile} profile (${formatDuration(duration)}, seed ${seed})...`);

    const result = simulateRun({ duration, strategy: profile, seed });
    const elapsedMs = Date.now() - startMs;

    console.log(`  Done in ${elapsedMs}ms (simulated ${formatDuration(duration)})`);
    console.log();

    if (jsonOutput) {
        allResults.push(result);
    } else {
        console.log(generateReport(result));
        console.log();
    }
}

if (jsonOutput) {
    console.log(JSON.stringify(allResults, null, 2));
}

// --- Summary for --all ---
if (runAll && !jsonOutput) {
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║                   COMPARISON SUMMARY                    ║");
    console.log("╚══════════════════════════════════════════════════════════╝");
    console.log();

    const header = padR("Profile", 15) + padR("Final Era", 12) + padR("KPS", 15) + padR("Clicks", 12) + padR("Advances", 10);
    console.log("  " + header);
    console.log("  " + "─".repeat(64));

    for (const r of profiles) {
        const result = allResults.find(res => res.profile === r) ||
            (() => { const res = simulateRun({ duration, strategy: r, seed }); return res; })();
        // re-fetch from already-computed if json
        // For non-json --all we already printed reports, need results
    }

    // Rerun to get results for comparison (lightweight)
    for (const profile of profiles) {
        const result = simulateRun({ duration, strategy: profile, seed });
        const fs = result.finalState;
        const eraNames = ["Stone", "Bronze", "Iron", "Classical", "Medieval", "Renaissance", "Industrial", "Modern", "Future"];
        console.log("  " +
            padR(profile, 15) +
            padR(eraNames[fs.currentEra] || "?", 12) +
            padR(formatNum(fs.knowledgePerSecond), 15) +
            padR(formatNum(fs.totalClicks), 12) +
            padR(fs.totalPrestiges + "", 10)
        );
    }
    console.log();
}

function formatDuration(s) {
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
}

function padR(s, len) {
    return (s + " ".repeat(len)).slice(0, len);
}

function formatNum(n) {
    if (n < 1000) return Math.floor(n) + "";
    const suffixes = ["", "K", "M", "B", "T"];
    const tier = Math.floor(Math.log10(n) / 3);
    if (tier < suffixes.length) return (n / Math.pow(10, tier * 3)).toFixed(1) + suffixes[tier];
    return n.toExponential(2);
}
