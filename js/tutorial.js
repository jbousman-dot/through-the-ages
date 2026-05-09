// ============================================================
// tutorial.js — Guided first-time experience
// ============================================================

const TUTORIAL_STEPS = [
    {
        trigger: "start",
        message: "Welcome, elder. Tap **Discover** to generate knowledge for your tribe.",
        highlight: "discover-btn",
    },
    {
        trigger: "firstClick",
        message: "Great! Keep tapping to gather knowledge. You need 10 to buy your first invention.",
        highlight: "discover-btn",
        waitFor: () => GameState.knowledge >= 10,
    },
    {
        trigger: "canBuy",
        message: "You have enough! Switch to **Inventions** to buy Sharp Stones.",
        highlight: "tab-inventions",
    },
    {
        trigger: "boughtFirst",
        message: "Your click is now stronger! Inventions make each discovery more powerful.",
        highlight: null,
    },
    {
        trigger: "showAuto",
        message: "Tip: Some inventions generate knowledge automatically — look for **Gathering** or **Fire**.",
        highlight: null,
        waitFor: () => GameState.knowledge >= 25,
    },
    {
        trigger: "done",
        message: "You're on your way! Keep discovering and inventing to advance through the eras.",
        highlight: null,
    },
];

let tutorialOverlay = null;
let activeWaitInterval = null;

function initTutorial() {
    if (GameState.tutorialComplete) return;

    tutorialOverlay = document.getElementById("tutorial-overlay");
    showTutorialStep(GameState.tutorialStep);
}

function showTutorialStep(stepIndex) {
    if (stepIndex >= TUTORIAL_STEPS.length) {
        completeTutorial();
        return;
    }

    const step = TUTORIAL_STEPS[stepIndex];
    GameState.tutorialStep = stepIndex;

    const bubble = document.getElementById("tutorial-bubble");
    // Convert **text** to <strong>text</strong>
    bubble.innerHTML = step.message.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    tutorialOverlay.classList.add("visible");

    // Highlight element
    document.querySelectorAll(".tutorial-highlight").forEach(el =>
        el.classList.remove("tutorial-highlight")
    );
    if (step.highlight) {
        const el = document.getElementById(step.highlight);
        if (el) el.classList.add("tutorial-highlight");
    }

    // Set up waitFor polling if applicable
    if (activeWaitInterval) { clearInterval(activeWaitInterval); activeWaitInterval = null; }
    if (step.waitFor) {
        activeWaitInterval = setInterval(() => {
            if (step.waitFor()) {
                clearInterval(activeWaitInterval);
                activeWaitInterval = null;
                advanceTutorial();
            }
        }, 500);
    }
}

function advanceTutorial() {
    GameState.tutorialStep++;
    if (GameState.tutorialStep >= TUTORIAL_STEPS.length) {
        completeTutorial();
    } else {
        showTutorialStep(GameState.tutorialStep);
    }
}

function completeTutorial() {
    GameState.tutorialComplete = true;
    if (activeWaitInterval) { clearInterval(activeWaitInterval); activeWaitInterval = null; }
    if (tutorialOverlay) tutorialOverlay.classList.remove("visible");
    document.querySelectorAll(".tutorial-highlight").forEach(el =>
        el.classList.remove("tutorial-highlight")
    );
}

// Called from main.js on relevant events
function onTutorialEvent(eventName) {
    if (GameState.tutorialComplete) return;
    const step = TUTORIAL_STEPS[GameState.tutorialStep];
    if (!step) return;

    if (step.trigger === eventName) {
        advanceTutorial();
    }
}
