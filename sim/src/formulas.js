// ============================================================
// formulas.js — All calculation functions (mirrored from game)
// ============================================================

import { UPGRADES } from "./data.js";

export function getUpgradeCost(upgrade, count) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count));
}

export function recalculateStats(state) {
    let baseClickPower = 1;
    let clickMultiplier = 1;
    let baseAutoGen = 0;
    let autoMultiplier = 1;
    let scholars = 0;

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
        }
    }

    state.knowledgePerClick = baseClickPower * clickMultiplier;
    state.scholars = scholars;
    state.knowledgePerSecond = (baseAutoGen + scholars) * autoMultiplier;
}
