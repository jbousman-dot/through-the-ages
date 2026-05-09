// ============================================================
// upgrades.js — Upgrade definitions and purchase logic
// ============================================================

// Each upgrade: { id, era, name, icon, description, flavor,
//   baseCost, costMultiplier, maxCount,
//   effect(count) → applies effect to GameState }

const UPGRADES = [
    // ========== STONE AGE (era 0) ==========
    {
        id: "sharp_stones",
        era: 0,
        name: "Sharp Stones",
        icon: "🪨",
        description: "+1 knowledge per click",
        flavor: "A keen edge changes everything.",
        baseCost: 10,
        costMultiplier: 1.5,
        maxCount: 10,
        effect: "clickPower",
        effectValue: 1,
    },
    {
        id: "fire",
        era: 0,
        name: "Fire",
        icon: "🔥",
        description: "+0.5 knowledge/sec",
        flavor: "Light against the darkness.",
        baseCost: 25,
        costMultiplier: 1.6,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 0.5,
    },
    {
        id: "language",
        era: 0,
        name: "Language",
        icon: "🗣️",
        description: "x2 click power",
        flavor: "Ideas can now be shared.",
        baseCost: 100,
        costMultiplier: 3,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 2,
    },
    {
        id: "gathering",
        era: 0,
        name: "Gathering",
        icon: "🌿",
        description: "+1 scholar (auto-generates knowledge)",
        flavor: "Organized foraging feeds the tribe.",
        baseCost: 50,
        costMultiplier: 1.8,
        maxCount: 10,
        effect: "scholar",
        effectValue: 1,
    },
    {
        id: "cave_painting",
        era: 0,
        name: "Cave Painting",
        icon: "🎨",
        description: "+2 knowledge/sec",
        flavor: "Recording what we know preserves it.",
        baseCost: 200,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 2,
    },
    {
        id: "tribal_council",
        era: 0,
        name: "Tribal Council",
        icon: "👥",
        description: "x2 all knowledge/sec",
        flavor: "Together, we think further.",
        baseCost: 500,
        costMultiplier: 4,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 2,
    },
    {
        id: "bone_tools",
        era: 0,
        name: "Bone Tools",
        icon: "🦴",
        description: "+3 knowledge per click",
        flavor: "Stronger tools, faster progress.",
        baseCost: 300,
        costMultiplier: 2,
        maxCount: 5,
        effect: "clickPower",
        effectValue: 3,
    },
    {
        id: "hunting",
        era: 0,
        name: "Organized Hunting",
        icon: "🏹",
        description: "+5 knowledge/sec",
        flavor: "The hunt feeds body and mind.",
        baseCost: 600,
        costMultiplier: 2.2,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 5,
    },

    // ========== BRONZE AGE (era 1) ==========
    {
        id: "agriculture",
        era: 1,
        name: "Agriculture",
        icon: "🌾",
        description: "+10 knowledge/sec",
        flavor: "Planting seeds of civilization.",
        baseCost: 50,
        costMultiplier: 1.6,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 10,
    },
    {
        id: "writing",
        era: 1,
        name: "Writing",
        icon: "📜",
        description: "x3 click power",
        flavor: "Knowledge made permanent.",
        baseCost: 200,
        costMultiplier: 3,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 3,
    },
    {
        id: "pottery",
        era: 1,
        name: "Pottery",
        icon: "🏺",
        description: "+5 knowledge per click",
        flavor: "Storing more than just grain.",
        baseCost: 100,
        costMultiplier: 1.7,
        maxCount: 8,
        effect: "clickPower",
        effectValue: 5,
    },
    {
        id: "bronze_working",
        era: 1,
        name: "Bronze Working",
        icon: "⚔️",
        description: "+25 knowledge/sec",
        flavor: "The first alloy transforms society.",
        baseCost: 500,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 25,
    },
    {
        id: "city_walls",
        era: 1,
        name: "City Walls",
        icon: "🧱",
        description: "+3 scholars",
        flavor: "Safety allows deeper thought.",
        baseCost: 800,
        costMultiplier: 2.5,
        maxCount: 3,
        effect: "scholar",
        effectValue: 3,
    },
    {
        id: "wheel",
        era: 1,
        name: "The Wheel",
        icon: "☸️",
        description: "x2 all knowledge/sec",
        flavor: "Progress rolls forward.",
        baseCost: 2000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 2,
    },
    {
        id: "trade_routes",
        era: 1,
        name: "Trade Routes",
        icon: "🐪",
        description: "+50 knowledge/sec",
        flavor: "Exchange breeds innovation.",
        baseCost: 3000,
        costMultiplier: 2.2,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 50,
    },
    {
        id: "mathematics",
        era: 1,
        name: "Mathematics",
        icon: "🔢",
        description: "x3 all knowledge/sec",
        flavor: "The language of the universe.",
        baseCost: 10000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 3,
    },

    // ========== IRON AGE (era 2) ==========
    {
        id: "iron_smelting",
        era: 2,
        name: "Iron Smelting",
        icon: "⚒️",
        description: "+100 knowledge/sec",
        flavor: "Forging a new era.",
        baseCost: 500,
        costMultiplier: 1.7,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 100,
    },
    {
        id: "philosophy",
        era: 2,
        name: "Philosophy",
        icon: "💭",
        description: "+20 knowledge per click",
        flavor: "Questioning everything leads to understanding.",
        baseCost: 1000,
        costMultiplier: 1.8,
        maxCount: 8,
        effect: "clickPower",
        effectValue: 20,
    },
    {
        id: "coinage",
        era: 2,
        name: "Coinage",
        icon: "🪙",
        description: "x2 click power",
        flavor: "Standardized value accelerates exchange.",
        baseCost: 3000,
        costMultiplier: 4,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 2,
    },
    {
        id: "road_network",
        era: 2,
        name: "Road Networks",
        icon: "🛤️",
        description: "+500 knowledge/sec",
        flavor: "All roads lead to knowledge.",
        baseCost: 5000,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 500,
    },
    {
        id: "library",
        era: 2,
        name: "Great Library",
        icon: "📚",
        description: "+10 scholars",
        flavor: "A monument to learning.",
        baseCost: 10000,
        costMultiplier: 3,
        maxCount: 3,
        effect: "scholar",
        effectValue: 10,
    },
    {
        id: "democracy",
        era: 2,
        name: "Democracy",
        icon: "🗳️",
        description: "x3 all knowledge/sec",
        flavor: "The voice of the people.",
        baseCost: 50000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 3,
    },
    {
        id: "navy",
        era: 2,
        name: "Naval Fleet",
        icon: "⛵",
        description: "+2000 knowledge/sec",
        flavor: "Mastering the seas expands horizons.",
        baseCost: 100000,
        costMultiplier: 2.5,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 2000,
    },
    {
        id: "siege_warfare",
        era: 2,
        name: "Siege Engineering",
        icon: "🏗️",
        description: "x5 click power",
        flavor: "Breaking barriers, literal and figurative.",
        baseCost: 200000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 5,
    },
];

// --- Upgrade Logic ---

function getUpgradeCost(upgrade) {
    const count = GameState.upgrades[upgrade.id] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count));
}

function getUpgradeCount(upgrade) {
    return GameState.upgrades[upgrade.id] || 0;
}

function canAfford(upgrade) {
    return GameState.knowledge >= getUpgradeCost(upgrade);
}

function isMaxed(upgrade) {
    return getUpgradeCount(upgrade) >= upgrade.maxCount;
}

function purchaseUpgrade(upgrade) {
    if (isMaxed(upgrade) || !canAfford(upgrade)) return false;

    const cost = getUpgradeCost(upgrade);
    GameState.knowledge -= cost;
    GameState.upgrades[upgrade.id] = (GameState.upgrades[upgrade.id] || 0) + 1;

    recalculateStats();
    return true;
}

function recalculateStats() {
    // Reset to base values
    let baseClickPower = 1;
    let clickMultiplier = 1;
    let baseAutoGen = 0;
    let autoMultiplier = 1;
    let scholars = 0;

    // Apply all purchased upgrades
    for (const upgrade of UPGRADES) {
        const count = getUpgradeCount(upgrade);
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

    GameState.knowledgePerClick = baseClickPower * clickMultiplier;
    GameState.scholars = scholars;
    // Each scholar generates 1 knowledge/sec base
    GameState.knowledgePerSecond = (baseAutoGen + scholars) * autoMultiplier;
}

function getUpgradesForEra(eraIndex) {
    return UPGRADES.filter(u => u.era === eraIndex);
}
