// ============================================================
// main.js — Game loop, initialization, event binding
// ============================================================

let lastFrame = 0;
let saveTimer = 0;
const SAVE_INTERVAL = 30000; // 30 seconds
const TICK_RATE = 100; // ms between updates

// --- Game Loop ---
function gameLoop(timestamp) {
    if (!lastFrame) lastFrame = timestamp;
    const delta = (timestamp - lastFrame) / 1000; // seconds
    lastFrame = timestamp;

    // Accumulate resources
    if (GameState.knowledgePerSecond > 0) {
        const gain = GameState.knowledgePerSecond * delta;
        GameState.knowledge += gain;
        GameState.totalKnowledge += gain;
    }

    // Population grows slowly based on knowledge
    GameState.population = Math.log2(GameState.totalKnowledge + 1) * 10;

    // Update UI (throttle to ~10fps for DOM updates)
    saveTimer += delta * 1000;
    updateResourceDisplay();

    // Auto-save
    if (saveTimer >= SAVE_INTERVAL) {
        saveTimer = 0;
        saveGame();
    }

    // Update upgrade affordability if on inventions tab
    if (currentTab === "inventions") {
        renderUpgradeAffordability();
    }

    requestAnimationFrame(gameLoop);
}

function renderUpgradeAffordability() {
    const cards = document.querySelectorAll(".upgrade-card");
    const upgrades = getUpgradesForEra(GameState.currentEra);
    for (let i = 0; i < Math.min(cards.length, upgrades.length); i++) {
        const upg = upgrades[i];
        if (isMaxed(upg)) continue;
        const affordable = canAfford(upg);
        cards[i].classList.toggle("affordable", affordable);
        const costEl = cards[i].querySelector(".upgrade-cost");
        if (costEl) costEl.classList.toggle("too-expensive", !affordable);
    }
}

// --- Click Handler ---
function onDiscover(event) {
    GameState.knowledge += GameState.knowledgePerClick;
    GameState.totalKnowledge += GameState.knowledgePerClick;
    GameState.totalClicks++;

    animateClick(event);
    updateResourceDisplay();

    // Tutorial events
    if (GameState.totalClicks === 1) onTutorialEvent("firstClick");
    if (GameState.knowledge >= 10 && GameState.tutorialStep <= 2) onTutorialEvent("canBuy");
}

// --- Initialization ---
function init() {
    const loaded = loadGame();

    // Bind discover button (prevent double-fire on mobile)
    const discoverBtn = document.getElementById("discover-btn");
    let touchFired = false;
    discoverBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        touchFired = true;
        onDiscover(e);
    }, { passive: false });
    discoverBtn.addEventListener("click", (e) => {
        if (touchFired) { touchFired = false; return; }
        onDiscover(e);
    });

    // Bind tab navigation
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            switchTab(btn.dataset.tab);
            // Tutorial: if switching to inventions for first time
            if (btn.dataset.tab === "inventions") onTutorialEvent("canBuy");
        });
    });

    // Bind advance era button
    document.getElementById("advance-era-btn").addEventListener("click", () => {
        if (canAdvanceEra()) advanceEra();
    });

    // Bind settings buttons
    document.getElementById("save-btn").addEventListener("click", () => {
        saveGame();
        showToast("Game saved!");
    });
    document.getElementById("export-btn").addEventListener("click", exportSave);
    document.getElementById("import-btn").addEventListener("click", () => {
        const data = prompt("Paste your save data:");
        if (data) importSave(data);
    });
    document.getElementById("reset-btn").addEventListener("click", () => {
        if (confirm("Are you sure? This will erase ALL progress!")) {
            resetSave();
        }
    });

    // Tutorial dismiss
    document.getElementById("tutorial-overlay").addEventListener("click", (e) => {
        if (e.target.id === "tutorial-dismiss") {
            completeTutorial();
        }
    });

    // Initial calculations
    recalculateStats();
    updateEraDisplay();
    updateResourceDisplay();
    renderUpgradeList();

    // Start tutorial for new games
    if (!loaded || !GameState.tutorialComplete) {
        initTutorial();
    }

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Wait for DOM
document.addEventListener("DOMContentLoaded", init);
