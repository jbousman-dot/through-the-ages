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

    const cost = getUpgradeCost(upgrade, count);
    if (state.knowledge < cost) return false;

    state.knowledge -= cost;
    state.upgrades[upgrade.id] = count + 1;
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

    state.currentEra++;
    state.knowledge = 0;
    state.knowledgePerClick = 1;
    state.knowledgePerSecond = 0;
    state.scholars = 0;
    state.upgrades = {};
    state.totalPrestiges++;

    recalculateStats(state);
    return true;
}

export function getUpgradesForEra(eraIndex) {
    return UPGRADES.filter(u => u.era === eraIndex);
}
