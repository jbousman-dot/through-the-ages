// ============================================================
// achievements.js — Achievement definitions, checking, rewards
// ============================================================

const ACHIEVEMENTS = [
    // --- Click Milestones ---
    { id: "first_click", name: "First Step", icon: "👣", description: "Click the Discover button",
      condition: () => GameState.totalClicks >= 1,
      reward: { clickPower: 1 } },
    { id: "century_clicks", name: "Century of Clicks", icon: "💯", description: "Click 100 times",
      condition: () => GameState.totalClicks >= 100,
      reward: { clickMultiplier: 1.5 } },
    { id: "thousand_clicks", name: "Dedicated Scholar", icon: "📚", description: "Click 1,000 times",
      condition: () => GameState.totalClicks >= 1000,
      reward: { clickMultiplier: 2 } },
    { id: "ten_k_clicks", name: "Obsessive Researcher", icon: "🔬", description: "Click 10,000 times",
      condition: () => GameState.totalClicks >= 10000,
      reward: { clickMultiplier: 3 } },

    // --- Knowledge Milestones ---
    { id: "first_thousand", name: "Getting Started", icon: "🌱", description: "Earn 1,000 total knowledge",
      condition: () => GameState.totalKnowledge >= 1000,
      reward: { autoGen: 1 } },
    { id: "millionaire", name: "Knowledge Millionaire", icon: "💰", description: "Earn 1M total knowledge",
      condition: () => GameState.totalKnowledge >= 1e6,
      reward: { autoGen: 100 } },
    { id: "billionaire", name: "Knowledge Billionaire", icon: "💎", description: "Earn 1B total knowledge",
      condition: () => GameState.totalKnowledge >= 1e9,
      reward: { autoMultiplier: 2 } },
    { id: "trillionaire", name: "Knowledge Trillionaire", icon: "👑", description: "Earn 1T total knowledge",
      condition: () => GameState.totalKnowledge >= 1e12,
      reward: { autoMultiplier: 5 } },

    // --- KPS Milestones ---
    { id: "kps_10", name: "Automation Begins", icon: "⚙️", description: "Reach 10 knowledge/sec",
      condition: () => GameState.knowledgePerSecond >= 10,
      reward: { autoGen: 5 } },
    { id: "kps_1000", name: "Knowledge Factory", icon: "🏭", description: "Reach 1,000 knowledge/sec",
      condition: () => GameState.knowledgePerSecond >= 1000,
      reward: { autoGen: 50 } },
    { id: "kps_million", name: "Knowledge Empire", icon: "🌍", description: "Reach 1M knowledge/sec",
      condition: () => GameState.knowledgePerSecond >= 1e6,
      reward: { autoMultiplier: 2 } },
    { id: "kps_billion", name: "Knowledge Singularity", icon: "💥", description: "Reach 1B knowledge/sec",
      condition: () => GameState.knowledgePerSecond >= 1e9,
      reward: { autoMultiplier: 5 } },

    // --- Era Milestones ---
    { id: "era_bronze", name: "Dawn of Civilization", icon: "⚔️", description: "Reach the Bronze Age",
      condition: () => GameState.currentEra >= 1,
      reward: { heritagePoints: 2 } },
    { id: "era_iron", name: "Age of Iron", icon: "⚒️", description: "Reach the Iron Age",
      condition: () => GameState.currentEra >= 2,
      reward: { heritagePoints: 3 } },
    { id: "era_classical", name: "Classical Wisdom", icon: "🏛️", description: "Reach the Classical era",
      condition: () => GameState.currentEra >= 3,
      reward: { heritagePoints: 5 } },
    { id: "era_medieval", name: "Dark Ages", icon: "🏰", description: "Reach the Medieval era",
      condition: () => GameState.currentEra >= 4,
      reward: { heritagePoints: 8 } },
    { id: "era_renaissance", name: "Rebirth", icon: "🎨", description: "Reach the Renaissance",
      condition: () => GameState.currentEra >= 5,
      reward: { heritagePoints: 12 } },
    { id: "era_industrial", name: "Machine Age", icon: "🏭", description: "Reach the Industrial era",
      condition: () => GameState.currentEra >= 6,
      reward: { heritagePoints: 15 } },
    { id: "era_modern", name: "Information Age", icon: "💻", description: "Reach the Modern era",
      condition: () => GameState.currentEra >= 7,
      reward: { heritagePoints: 20 } },
    { id: "era_future", name: "Beyond Time", icon: "🚀", description: "Reach the Future",
      condition: () => GameState.currentEra >= 8,
      reward: { heritagePoints: 50 } },

    // --- Prestige Milestones ---
    { id: "first_prestige", name: "New Beginning", icon: "🔄", description: "Advance an era for the first time",
      condition: () => GameState.totalPrestiges >= 1,
      reward: { heritagePoints: 1 } },
    { id: "veteran", name: "Veteran Explorer", icon: "🎖️", description: "Advance eras 5 times",
      condition: () => GameState.totalPrestiges >= 5,
      reward: { globalMultiplier: 1.5 } },
    { id: "master", name: "Master of Ages", icon: "🏆", description: "Advance eras 10 times",
      condition: () => GameState.totalPrestiges >= 10,
      reward: { globalMultiplier: 2 } },

    // --- Special ---
    { id: "patience", name: "Patient Scholar", icon: "🧘", description: "Return after 4+ hours offline",
      condition: () => false, // checked specially in loadGame
      reward: { autoMultiplier: 1.5 } },
    { id: "upgrade_collector", name: "Master Inventor", icon: "🏅", description: "Purchase 100 total upgrades (lifetime)",
      condition: () => GameState.totalUpgradesPurchased >= 100,
      reward: { autoMultiplier: 2 } },
    { id: "speed_bronze", name: "Speed Runner I", icon: "⏱️", description: "Reach Bronze Age in under 2 minutes",
      condition: () => false, // checked on era advance
      reward: { clickPower: 5 } },
    { id: "speed_classical", name: "Speed Runner II", icon: "⏱️", description: "Reach Classical in under 15 minutes",
      condition: () => false, // checked on era advance
      reward: { heritagePoints: 5 } },
];

// --- Check & Unlock ---

function checkAchievements() {
    let anyUnlocked = false;
    for (const ach of ACHIEVEMENTS) {
        if (GameState.achievements[ach.id]) continue;
        if (ach.condition()) {
            unlockAchievement(ach);
            anyUnlocked = true;
        }
    }
    if (anyUnlocked) recalculateStats();
}

function checkSpeedAchievements() {
    const elapsed = (Date.now() - GameState.eraStartTime) / 1000;
    // These are cumulative time from game start for first playthrough
    const totalElapsed = (Date.now() - GameState.startTime) / 1000;

    if (GameState.currentEra >= 1 && !GameState.achievements.speed_bronze && totalElapsed < 120) {
        unlockAchievement(ACHIEVEMENTS.find(a => a.id === "speed_bronze"));
    }
    if (GameState.currentEra >= 3 && !GameState.achievements.speed_classical && totalElapsed < 900) {
        unlockAchievement(ACHIEVEMENTS.find(a => a.id === "speed_classical"));
    }
}

function unlockAchievement(ach) {
    if (!ach || GameState.achievements[ach.id]) return;
    GameState.achievements[ach.id] = Date.now();

    // Apply one-time rewards
    if (ach.reward.heritagePoints) {
        GameState.heritagePoints += ach.reward.heritagePoints;
        GameState.totalHeritageEarned += ach.reward.heritagePoints;
    }

    showToast(`🏆 Achievement: ${ach.name}!`, 3000);

    // Update legacy badge
    updateLegacyBadge();
}

// --- Aggregate Bonuses (called by recalculateStats) ---

function getAchievementBonuses() {
    const bonuses = {
        clickPower: 0,
        clickMultiplier: 1,
        autoGen: 0,
        autoMultiplier: 1,
        globalMultiplier: 1,
    };

    for (const ach of ACHIEVEMENTS) {
        if (!GameState.achievements[ach.id]) continue;
        const r = ach.reward;
        if (r.clickPower) bonuses.clickPower += r.clickPower;
        if (r.clickMultiplier) bonuses.clickMultiplier *= r.clickMultiplier;
        if (r.autoGen) bonuses.autoGen += r.autoGen;
        if (r.autoMultiplier) bonuses.autoMultiplier *= r.autoMultiplier;
        if (r.globalMultiplier) bonuses.globalMultiplier *= r.globalMultiplier;
    }

    return bonuses;
}

function getAchievementCount() {
    return Object.keys(GameState.achievements).length;
}
