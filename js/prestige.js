// ============================================================
// prestige.js — Era advancement and prestige layer logic
// ============================================================

function canAdvanceEra() {
    const era = ERAS[GameState.currentEra];
    return GameState.totalKnowledge >= era.knowledgeToAdvance &&
           GameState.currentEra < ERAS.length - 1;
}

function advanceEra() {
    if (!canAdvanceEra()) return;

    GameState.currentEra++;

    // Reset within-era resources but keep totalKnowledge
    GameState.knowledge = 0;
    GameState.knowledgePerClick = 1;
    GameState.knowledgePerSecond = 0;
    GameState.scholars = 0;

    // Clear era-specific upgrades (keep upgrades from other systems later)
    // For now, reset all upgrades since we only have era upgrades
    GameState.upgrades = {};

    // Recalculate stats from scratch
    recalculateStats();

    // Update UI
    updateEraDisplay();
    updateResourceDisplay();
    renderUpgradeList();
    switchTab("main");

    const era = ERAS[GameState.currentEra];
    showToast(`Welcome to the ${era.icon} ${era.name}! ${era.description}`, 4000);

    saveGame();
}

// Future: Cultural Revolution (prestige layer 2)
function canCulturalRevolution() {
    // Requires reaching a certain era + total knowledge threshold
    return false; // Not yet implemented
}

// Future: Collapse & Rebirth (prestige layer 3)
function canCollapse() {
    return false; // Not yet implemented
}
