// ============================================================
// formulas.js — All calculation functions (mirrored from game)
// ============================================================

import { UPGRADES } from "./data.js";

export function getUpgradeCost(upgrade, count, costReduction = 0) {
    const base = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count));
    const reduction = Math.min(costReduction, 0.75);
    return Math.max(1, Math.floor(base * (1 - reduction)));
}

export function recalculateStats(state) {
    let baseClickPower = 1;
    let clickMultiplier = 1;
    let baseAutoGen = 0;
    let autoMultiplier = 1;
    let scholars = 0;
    let costReduction = 0;
    let offlineBonus = 0;
    let heritageMultiplier = 1;
    let globalMultiplier = 1;

    for (const upgrade of UPGRADES) {
        const count = state.upgrades[upgrade.id] || 0;
        if (count === 0) continue;

        switch (upgrade.effect) {
            case "clickPower":
                baseClickPower += upgrade.effectValue * count;
                break;
            case "clickMultiplier":
                clickMultiplier *= Math.pow(upgrade.effectValue, count);
                break;
            case "autoGen":
                baseAutoGen += upgrade.effectValue * count;
                break;
            case "autoMultiplier":
                autoMultiplier *= Math.pow(upgrade.effectValue, count);
                break;
            case "scholar":
                scholars += upgrade.effectValue * count;
                break;
            case "costReduction":
                costReduction += upgrade.effectValue * count;
                break;
            case "offlineMultiplier":
                offlineBonus += upgrade.effectValue * count;
                break;
            case "heritageMult":
                heritageMultiplier *= Math.pow(upgrade.effectValue, count);
                break;
            case "globalMultiplier":
                globalMultiplier *= Math.pow(upgrade.effectValue, count);
                break;
        }
    }

    // Apply heritage bonuses
    const hb = state.heritageSpent || {};
    baseClickPower += (hb.inherited_tools || 0) * 5;
    scholars += (hb.cultural_wisdom || 0) * 2;
    costReduction += (hb.swift_progress || 0) * 0.05;
    offlineBonus += (hb.deep_roots || 0) * 0.25;
    for (let i = 0; i < (hb.golden_age || 0); i++) {
        globalMultiplier *= 1.5;
    }
    if ((hb.timeless_legacy || 0) > 0) {
        heritageMultiplier *= 2;
    }
    const ancientMemory = hb.ancient_memory || 0;

    state.knowledgePerClick = baseClickPower * clickMultiplier * globalMultiplier;
    state.scholars = scholars;
    let kps = (baseAutoGen + scholars) * autoMultiplier;
    kps *= (1 + ancientMemory * 0.10);
    state.knowledgePerSecond = kps * globalMultiplier;

    state.costReduction = Math.min(costReduction, 0.75);
    state.offlineBonus = Math.min(offlineBonus, 0.45);
    state.heritageMultiplier = heritageMultiplier;
    state.globalMultiplier = globalMultiplier;
}
