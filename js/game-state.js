// ============================================================
// game-state.js — Central game state and resource management
// ============================================================

const GameState = {
    // --- Resources ---
    knowledge: 0,
    totalKnowledge: 0,       // lifetime total (for era advancement)
    knowledgePerClick: 1,
    knowledgePerSecond: 0,

    // --- Population & Workers ---
    population: 0,
    scholars: 0,             // auto-generate knowledge

    // --- Era ---
    currentEra: 0,           // index into ERAS array
    eraProgress: 0,          // 0-100%

    // --- Prestige currencies ---
    legacy: 0,               // from Cultural Revolution (prestige 2)
    wisdom: 0,               // from Collapse & Rebirth (prestige 3)
    epochs: 0,               // from Transcendence (prestige 4)

    // --- Heritage Points ---
    heritagePoints: 0,
    heritageSpent: {},       // { bonusId: purchaseCount }
    totalHeritageEarned: 0,

    // --- Upgrades purchased ---
    upgrades: {},            // { upgradeId: purchaseCount }

    // --- Achievements ---
    achievements: {},        // { achievementId: unlockTimestamp }

    // --- Computed meta-stats (recalculated, not saved) ---
    costReduction: 0,
    offlineBonus: 0,
    heritageMultiplier: 1,
    globalMultiplier: 1,

    // --- Meta ---
    totalClicks: 0,
    totalPrestiges: 0,
    totalUpgradesPurchased: 0,
    startTime: Date.now(),
    lastSave: Date.now(),
    lastTick: Date.now(),
    eraStartTime: Date.now(),

    // --- Tutorial ---
    tutorialStep: 0,
    tutorialComplete: false,

    // --- Cloud ---
    displayName: "",
};

// Era definitions
const ERAS = [
    {
        name: "Stone Age",
        icon: "🪨",
        description: "Survival through discovery",
        knowledgeToAdvance: 80000,
        color: "#8B7355",
        bgGradient: "linear-gradient(180deg, #2c1810 0%, #4a3728 40%, #6b5340 100%)",
    },
    {
        name: "Bronze Age",
        icon: "⚔️",
        description: "The dawn of civilization",
        knowledgeToAdvance: 4000000,
        color: "#CD7F32",
        bgGradient: "linear-gradient(180deg, #2a1f0e 0%, #5c3d1e 40%, #8b6914 100%)",
    },
    {
        name: "Iron Age",
        icon: "⚒️",
        description: "Empires rise and fall",
        knowledgeToAdvance: 70000000,
        color: "#71797E",
        bgGradient: "linear-gradient(180deg, #1a1a2e 0%, #2d3436 40%, #4a5568 100%)",
    },
    {
        name: "Classical",
        icon: "🏛️",
        description: "Wisdom shapes the world",
        knowledgeToAdvance: 200000000,
        color: "#E8D5B7",
        bgGradient: "linear-gradient(180deg, #1a1a3e 0%, #2d2d5e 40%, #e8d5b7 100%)",
    },
    {
        name: "Medieval",
        icon: "🏰",
        description: "Faith and fortitude",
        knowledgeToAdvance: 7000000000,
        color: "#556B2F",
        bgGradient: "linear-gradient(180deg, #0d1b0e 0%, #2d4a2e 40%, #556B2F 100%)",
    },
    {
        name: "Renaissance",
        icon: "🎨",
        description: "A rebirth of thought",
        knowledgeToAdvance: 50000000000,
        color: "#DAA520",
        bgGradient: "linear-gradient(180deg, #1a0a2e 0%, #3d1f5e 40%, #DAA520 100%)",
    },
    {
        name: "Industrial",
        icon: "🏭",
        description: "The age of machines",
        knowledgeToAdvance: 1e12,
        color: "#708090",
        bgGradient: "linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 40%, #708090 100%)",
    },
    {
        name: "Modern",
        icon: "💻",
        description: "Information transforms everything",
        knowledgeToAdvance: 7e13,
        color: "#4169E1",
        bgGradient: "linear-gradient(180deg, #0a0a2e 0%, #1a1a5e 40%, #4169E1 100%)",
    },
    {
        name: "Future",
        icon: "🚀",
        description: "Beyond the stars",
        knowledgeToAdvance: Infinity,
        color: "#00CED1",
        bgGradient: "linear-gradient(180deg, #0a0a1e 0%, #001a2e 40%, #00CED1 100%)",
    },
];

// --- Save / Load ---
function saveGame() {
    const data = {
        knowledge: GameState.knowledge,
        totalKnowledge: GameState.totalKnowledge,
        knowledgePerClick: GameState.knowledgePerClick,
        knowledgePerSecond: GameState.knowledgePerSecond,
        population: GameState.population,
        scholars: GameState.scholars,
        currentEra: GameState.currentEra,
        legacy: GameState.legacy,
        wisdom: GameState.wisdom,
        epochs: GameState.epochs,
        heritagePoints: GameState.heritagePoints,
        heritageSpent: GameState.heritageSpent,
        totalHeritageEarned: GameState.totalHeritageEarned,
        upgrades: GameState.upgrades,
        achievements: GameState.achievements,
        totalClicks: GameState.totalClicks,
        totalPrestiges: GameState.totalPrestiges,
        totalUpgradesPurchased: GameState.totalUpgradesPurchased,
        startTime: GameState.startTime,
        lastSave: Date.now(),
        lastTick: Date.now(),
        eraStartTime: GameState.eraStartTime,
        tutorialStep: GameState.tutorialStep,
        tutorialComplete: GameState.tutorialComplete,
        displayName: GameState.displayName,
    };
    try {
        localStorage.setItem("throughTheAges_save", JSON.stringify(data));
    } catch (e) {
        console.warn("Save failed:", e);
    }
}

function loadGame() {
    try {
        const raw = localStorage.getItem("throughTheAges_save");
        if (!raw) return false;
        const data = JSON.parse(raw);
        Object.assign(GameState, data);

        // Calculate offline progress (capped at 8 hours)
        const now = Date.now();
        const elapsed = Math.min((now - GameState.lastTick) / 1000, 28800);
        if (elapsed > 5 && GameState.knowledgePerSecond > 0) {
            const offlineEff = 0.5 + (GameState.offlineBonus || 0);
            const offlineGain = GameState.knowledgePerSecond * elapsed * Math.min(offlineEff, 0.95);
            GameState.knowledge += offlineGain;
            GameState.totalKnowledge += offlineGain;
            // Show offline summary after UI is ready
            setTimeout(() => {
                showOfflineSummary(elapsed, offlineGain);
            }, 500);
        }
        GameState.lastTick = now;

        // Sanitize numeric fields against corruption
        const numericFields = ["knowledge","totalKnowledge","knowledgePerClick","knowledgePerSecond",
            "population","scholars","legacy","wisdom","epochs","totalClicks","totalPrestiges",
            "heritagePoints","totalHeritageEarned","totalUpgradesPurchased"];
        for (const f of numericFields) {
            if (typeof GameState[f] !== "number" || isNaN(GameState[f])) GameState[f] = 0;
        }

        return true;
    } catch (e) {
        console.warn("Load failed:", e);
        return false;
    }
}

function resetSave() {
    localStorage.removeItem("throughTheAges_save");
    location.reload();
}

function exportSave() {
    saveGame();
    const raw = localStorage.getItem("throughTheAges_save");
    if (!raw) return;
    const encoded = btoa(raw);
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(encoded)
            .then(() => showToast("Save copied to clipboard!"))
            .catch(() => prompt("Copy your save:", encoded));
    } else {
        prompt("Copy your save:", encoded);
    }
}

function importSave(encoded) {
    try {
        const raw = atob(encoded);
        JSON.parse(raw); // validate
        localStorage.setItem("throughTheAges_save", raw);
        location.reload();
    } catch (e) {
        showToast("Invalid save data!");
    }
}
