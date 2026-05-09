// ============================================================
// state.js — Fresh game state for simulation
// ============================================================

export function createFreshState() {
    return {
        knowledge: 0,
        totalKnowledge: 0,
        knowledgePerClick: 1,
        knowledgePerSecond: 0,
        population: 0,
        scholars: 0,
        currentEra: 0,
        legacy: 0,
        wisdom: 0,
        epochs: 0,
        upgrades: {},       // { upgradeId: count }
        totalClicks: 0,
        totalPrestiges: 0,
    };
}
