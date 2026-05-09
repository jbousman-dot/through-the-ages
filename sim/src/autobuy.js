// ============================================================
// autobuy.js — AI buying strategies for simulation
// ============================================================

import { UPGRADES } from "./data.js";
import { getUpgradeCost } from "./formulas.js";
import { purchaseUpgrade } from "./actions.js";

/**
 * Strategy: "cheapest" — always buy the cheapest available upgrade
 */
function strategyCheapest(state) {
    const eraUpgrades = UPGRADES.filter(u => u.era === state.currentEra);
    let best = null;
    let bestCost = Infinity;

    for (const upg of eraUpgrades) {
        const count = state.upgrades[upg.id] || 0;
        if (count >= upg.maxCount) continue;
        const cost = getUpgradeCost(upg, count);
        if (cost < bestCost && state.knowledge >= cost) {
            best = upg;
            bestCost = cost;
        }
    }

    if (best) purchaseUpgrade(state, best);
}

/**
 * Strategy: "efficient" — buy the upgrade with best value per cost
 * Value = effect magnitude / cost
 */
function strategyEfficient(state) {
    const eraUpgrades = UPGRADES.filter(u => u.era === state.currentEra);
    let best = null;
    let bestRatio = 0;

    for (const upg of eraUpgrades) {
        const count = state.upgrades[upg.id] || 0;
        if (count >= upg.maxCount) continue;
        const cost = getUpgradeCost(upg, count);
        if (state.knowledge < cost) continue;

        // Weight multipliers higher than flat bonuses
        let value = upg.effectValue;
        if (upg.effect === "clickMultiplier" || upg.effect === "autoMultiplier") {
            value = upg.effectValue * 10; // multipliers are much more impactful
        }
        if (upg.effect === "scholar") {
            value = upg.effectValue * 2; // scholars have compounding value
        }

        const ratio = value / cost;
        if (ratio > bestRatio) {
            best = upg;
            bestRatio = ratio;
        }
    }

    if (best) purchaseUpgrade(state, best);
}

/**
 * Strategy: "prioritized" — buy in a smart order:
 * 1. Multipliers first (autoMultiplier > clickMultiplier)
 * 2. Then autoGen (biggest first)
 * 3. Then scholars
 * 4. Then clickPower
 */
function strategyPrioritized(state) {
    const eraUpgrades = UPGRADES.filter(u => u.era === state.currentEra);

    // Priority ordering
    const priorityOrder = ["autoMultiplier", "clickMultiplier", "autoGen", "scholar", "clickPower"];

    for (const effectType of priorityOrder) {
        // Get all upgrades of this type, sorted by effectValue descending
        const candidates = eraUpgrades
            .filter(u => u.effect === effectType && (state.upgrades[u.id] || 0) < u.maxCount)
            .sort((a, b) => b.effectValue - a.effectValue);

        for (const upg of candidates) {
            const count = state.upgrades[upg.id] || 0;
            const cost = getUpgradeCost(upg, count);
            if (state.knowledge >= cost) {
                purchaseUpgrade(state, upg);
                return; // one purchase per tick
            }
        }
    }
}

export const STRATEGIES = {
    cheapest: { name: "cheapest", description: "Always buys cheapest available", fn: strategyCheapest },
    efficient: { name: "efficient", description: "Best value/cost ratio", fn: strategyEfficient },
    prioritized: { name: "prioritized", description: "Smart priority order (multipliers first)", fn: strategyPrioritized },
};

export function autobuy(state, strategyName) {
    const strategy = STRATEGIES[strategyName];
    if (strategy) strategy.fn(state);
}
