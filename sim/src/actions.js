// ============================================================
// actions.js — Game action implementations for simulation
// ============================================================

import { UPGRADES, ERAS } from "./data.js";
import { getUpgradeCost, recalculateStats } from "./formulas.js";

export function performClick(state) {
    state.knowledge += state.knowledgePerClick;
    state.totalKnowledge += state.knowledgePerClick;
    state.totalClicks++;
}

export function purchaseUpgrade(state, upgrade) {
    const count = state.upgrades[upgrade.id] || 0;
    if (count >= upgrade.maxCount) return false;

    const cost = getUpgradeCost(upgrade, count, state.costReduction || 0);
    if (state.knowledge < cost) return false;

    state.knowledge -= cost;
    state.upgrades[upgrade.id] = count + 1;
    state.totalUpgradesPurchased = (state.totalUpgradesPurchased || 0) + 1;
    recalculateStats(state);
    return true;
}

export function canAdvanceEra(state) {
    const era = ERAS[state.currentEra];
    return state.totalKnowledge >= era.knowledgeToAdvance &&
           state.currentEra < ERAS.length - 1;
}

export function advanceEra(state) {
    if (!canAdvanceEra(state)) return false;

    // Calculate Heritage Points
    const eraIndex = state.currentEra;
    const baseHP = Math.floor(Math.pow(eraIndex + 1, 2));
    const hpEarned = Math.floor(baseHP * (state.heritageMultiplier || 1));
    state.heritagePoints = (state.heritagePoints || 0) + hpEarned;
    state.totalHeritageEarned = (state.totalHeritageEarned || 0) + hpEarned;

    state.currentEra++;
    state.totalPrestiges++;

    // Reset within-era resources
    state.knowledge = 0;
    state.knowledgePerClick = 1;
    state.knowledgePerSecond = 0;
    state.scholars = 0;
    state.upgrades = {};

    // Eternal Library bonus
    if ((state.heritageSpent?.eternal_library || 0) > 0) {
        const era = ERAS[state.currentEra];
        if (era.knowledgeToAdvance !== Infinity) {
            state.knowledge = era.knowledgeToAdvance * 0.05;
            state.totalKnowledge += state.knowledge;
        }
    }

    recalculateStats(state);
    return true;
}

export function getUpgradesForEra(eraIndex) {
    return UPGRADES.filter(u => u.era === eraIndex);
}
