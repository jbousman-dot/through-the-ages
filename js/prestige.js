// ============================================================
// prestige.js — Era advancement, Heritage Points, heritage bonuses
// ============================================================

// --- Heritage Bonus Definitions ---
const HERITAGE_BONUSES = [
    {
        id: "ancient_memory",
        name: "Ancient Memory",
        icon: "🧠",
        description: "+10% knowledge/sec per level",
        cost: 1,
        maxCount: 10,
    },
    {
        id: "inherited_tools",
        name: "Inherited Tools",
        icon: "🛠️",
        description: "+5 base click power per level",
        cost: 2,
        maxCount: 10,
    },
    {
        id: "cultural_wisdom",
        name: "Cultural Wisdom",
        icon: "📚",
        description: "+2 starting scholars per level",
        cost: 3,
        maxCount: 5,
    },
    {
        id: "swift_progress",
        name: "Swift Progress",
        icon: "⏩",
        description: "-5% all upgrade costs per level",
        cost: 5,
        maxCount: 5,
    },
    {
        id: "deep_roots",
        name: "Deep Roots",
        icon: "🌳",
        description: "+25% offline efficiency per level",
        cost: 8,
        maxCount: 3,
    },
    {
        id: "golden_age",
        name: "Golden Age",
        icon: "🌟",
        description: "x1.5 all knowledge generation per level",
        cost: 15,
        maxCount: 3,
    },
    {
        id: "eternal_library",
        name: "Eternal Library",
        icon: "🏛️",
        description: "Start each era with bonus knowledge",
        cost: 25,
        maxCount: 1,
    },
    {
        id: "timeless_legacy",
        name: "Timeless Legacy",
        icon: "🏆",
        description: "x2 Heritage Points earned",
        cost: 50,
        maxCount: 1,
    },
];

// --- Era Advancement ---

function canAdvanceEra() {
    const era = ERAS[GameState.currentEra];
    return GameState.totalKnowledge >= era.knowledgeToAdvance &&
           GameState.currentEra < ERAS.length - 1;
}

function advanceEra() {
    if (!canAdvanceEra()) return;

    // Calculate Heritage Points earned
    const eraIndex = GameState.currentEra;
    const baseHP = Math.floor(Math.pow(eraIndex + 1, 2));
    const hpEarned = Math.floor(baseHP * (GameState.heritageMultiplier || 1));
    GameState.heritagePoints += hpEarned;
    GameState.totalHeritageEarned += hpEarned;

    GameState.currentEra++;
    GameState.totalPrestiges++;

    // Reset within-era resources
    GameState.knowledge = 0;
    GameState.knowledgePerClick = 1;
    GameState.knowledgePerSecond = 0;
    GameState.scholars = 0;
    GameState.upgrades = {};
    GameState.eraStartTime = Date.now();

    // Eternal Library: start with bonus knowledge
    if ((GameState.heritageSpent.eternal_library || 0) > 0) {
        const era = ERAS[GameState.currentEra];
        // Give 5% of the new era's advancement threshold
        GameState.knowledge = era.knowledgeToAdvance * 0.05;
        GameState.totalKnowledge += GameState.knowledge;
    }

    // Recalculate stats (applies heritage bonuses)
    recalculateStats();

    // Update UI
    updateEraDisplay();
    updateResourceDisplay();
    if (currentTab === "inventions") renderUpgradeList();
    switchTab("main");

    const era = ERAS[GameState.currentEra];
    showToast(`${era.icon} ${era.name}! Earned ${hpEarned} Heritage Points.`, 4000);

    saveGame();
}

// --- Heritage Bonus Logic ---

function getHeritageBonusCost(bonus) {
    return bonus.cost;
}

function getHeritageBonusCount(bonus) {
    return GameState.heritageSpent[bonus.id] || 0;
}

function canAffordHeritage(bonus) {
    return GameState.heritagePoints >= bonus.cost &&
           getHeritageBonusCount(bonus) < bonus.maxCount;
}

function purchaseHeritageBonus(bonus) {
    if (!canAffordHeritage(bonus)) return false;
    GameState.heritagePoints -= bonus.cost;
    GameState.heritageSpent[bonus.id] = (GameState.heritageSpent[bonus.id] || 0) + 1;
    recalculateStats();
    saveGame();
    return true;
}

// Future: Cultural Revolution (prestige layer 2)
function canCulturalRevolution() {
    return false; // Not yet implemented
}

// Future: Collapse & Rebirth (prestige layer 3)
function canCollapse() {
    return false; // Not yet implemented
}
