// ============================================================
// data.js — Game data constants (mirrored from game source)
// ============================================================

export const ERAS = [
    { name: "Stone Age", knowledgeToAdvance: 1000 },
    { name: "Bronze Age", knowledgeToAdvance: 25000 },
    { name: "Iron Age", knowledgeToAdvance: 500000 },
    { name: "Classical", knowledgeToAdvance: 10000000 },
    { name: "Medieval", knowledgeToAdvance: 250000000 },
    { name: "Renaissance", knowledgeToAdvance: 5e9 },
    { name: "Industrial", knowledgeToAdvance: 1e11 },
    { name: "Modern", knowledgeToAdvance: 1e13 },
    { name: "Future", knowledgeToAdvance: Infinity },
];

export const UPGRADES = [
    // ========== STONE AGE (era 0) ==========
    { id: "sharp_stones", era: 0, baseCost: 10, costMultiplier: 1.5, maxCount: 10, effect: "clickPower", effectValue: 1 },
    { id: "fire", era: 0, baseCost: 25, costMultiplier: 1.6, maxCount: 10, effect: "autoGen", effectValue: 0.5 },
    { id: "language", era: 0, baseCost: 100, costMultiplier: 3, maxCount: 1, effect: "clickMultiplier", effectValue: 2 },
    { id: "gathering", era: 0, baseCost: 50, costMultiplier: 1.8, maxCount: 10, effect: "scholar", effectValue: 1 },
    { id: "cave_painting", era: 0, baseCost: 200, costMultiplier: 2.0, maxCount: 5, effect: "autoGen", effectValue: 2 },
    { id: "tribal_council", era: 0, baseCost: 500, costMultiplier: 4, maxCount: 1, effect: "autoMultiplier", effectValue: 2 },
    { id: "bone_tools", era: 0, baseCost: 300, costMultiplier: 2, maxCount: 5, effect: "clickPower", effectValue: 3 },
    { id: "hunting", era: 0, baseCost: 600, costMultiplier: 2.2, maxCount: 5, effect: "autoGen", effectValue: 5 },

    // ========== BRONZE AGE (era 1) ==========
    { id: "agriculture", era: 1, baseCost: 50, costMultiplier: 1.6, maxCount: 10, effect: "autoGen", effectValue: 10 },
    { id: "writing", era: 1, baseCost: 200, costMultiplier: 3, maxCount: 1, effect: "clickMultiplier", effectValue: 3 },
    { id: "pottery", era: 1, baseCost: 100, costMultiplier: 1.7, maxCount: 8, effect: "clickPower", effectValue: 5 },
    { id: "bronze_working", era: 1, baseCost: 500, costMultiplier: 2.0, maxCount: 5, effect: "autoGen", effectValue: 25 },
    { id: "city_walls", era: 1, baseCost: 800, costMultiplier: 2.5, maxCount: 3, effect: "scholar", effectValue: 3 },
    { id: "wheel", era: 1, baseCost: 2000, costMultiplier: 5, maxCount: 1, effect: "autoMultiplier", effectValue: 2 },
    { id: "trade_routes", era: 1, baseCost: 3000, costMultiplier: 2.2, maxCount: 5, effect: "autoGen", effectValue: 50 },
    { id: "mathematics", era: 1, baseCost: 10000, costMultiplier: 5, maxCount: 1, effect: "autoMultiplier", effectValue: 3 },

    // ========== IRON AGE (era 2) ==========
    { id: "iron_smelting", era: 2, baseCost: 500, costMultiplier: 1.7, maxCount: 10, effect: "autoGen", effectValue: 100 },
    { id: "philosophy", era: 2, baseCost: 1000, costMultiplier: 1.8, maxCount: 8, effect: "clickPower", effectValue: 20 },
    { id: "coinage", era: 2, baseCost: 3000, costMultiplier: 4, maxCount: 1, effect: "clickMultiplier", effectValue: 2 },
    { id: "road_network", era: 2, baseCost: 5000, costMultiplier: 2.0, maxCount: 5, effect: "autoGen", effectValue: 500 },
    { id: "library", era: 2, baseCost: 10000, costMultiplier: 3, maxCount: 3, effect: "scholar", effectValue: 10 },
    { id: "democracy", era: 2, baseCost: 50000, costMultiplier: 5, maxCount: 1, effect: "autoMultiplier", effectValue: 3 },
    { id: "navy", era: 2, baseCost: 100000, costMultiplier: 2.5, maxCount: 5, effect: "autoGen", effectValue: 2000 },
    { id: "siege_warfare", era: 2, baseCost: 200000, costMultiplier: 5, maxCount: 1, effect: "clickMultiplier", effectValue: 5 },
];
