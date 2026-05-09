// ============================================================
// firebase-sync.js — Cloud saves & leaderboards via Firebase
// ============================================================

// Firebase config
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCevgFr7nSqYAbVdy4hw0zjsWP-aaPoyI8",
    authDomain: "through-the-ages-game.firebaseapp.com",
    projectId: "through-the-ages-game",
    storageBucket: "through-the-ages-game.firebasestorage.app",
    messagingSenderId: "591851199763",
    appId: "1:591851199763:web:223f3d31ad3859841b4ee6",
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let currentUser = null;
let cloudSyncEnabled = false;

// --- Initialize Firebase ---
async function initFirebase() {
    try {
        // Import Firebase modules from CDN (loaded via index.html)
        if (typeof firebase === "undefined") {
            console.warn("Firebase SDK not loaded");
            return false;
        }

        firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
        firebaseAuth = firebase.auth();
        firebaseDb = firebase.firestore();

        // Sign in anonymously
        await firebaseAuth.signInAnonymously();

        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                cloudSyncEnabled = true;
                console.log("Firebase auth: anonymous user", user.uid);
                // Load cloud save if newer than local
                loadCloudSave();
            } else {
                currentUser = null;
                cloudSyncEnabled = false;
            }
        });

        return true;
    } catch (e) {
        console.warn("Firebase init failed:", e);
        return false;
    }
}

// --- Cloud Saves ---

async function saveToCloud() {
    if (!cloudSyncEnabled || !currentUser) return;

    try {
        const saveData = {
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
            // Leaderboard display name
            displayName: GameState.displayName || "Anonymous",
        };

        await firebaseDb.collection("saves").doc(currentUser.uid).set(saveData);
    } catch (e) {
        console.warn("Cloud save failed:", e);
    }
}

async function loadCloudSave() {
    if (!cloudSyncEnabled || !currentUser) return;

    try {
        const doc = await firebaseDb.collection("saves").doc(currentUser.uid).get();
        if (!doc.exists) return;

        const cloudData = doc.data();
        const localSave = localStorage.getItem("throughTheAges_save");
        const localData = localSave ? JSON.parse(localSave) : null;

        // Use whichever save is more recent
        const cloudTime = cloudData.lastSave || 0;
        const localTime = localData ? (localData.lastSave || 0) : 0;

        if (cloudTime > localTime) {
            // Cloud save is newer — apply it
            Object.assign(GameState, cloudData);
            GameState.lastTick = Date.now();
            recalculateStats();
            updateEraDisplay();
            updateResourceDisplay();
            if (currentTab === "inventions") renderUpgradeList();
            showToast("Cloud save loaded!", 3000);
        }
    } catch (e) {
        console.warn("Cloud load failed:", e);
    }
}

// --- Leaderboard ---

async function updateLeaderboard() {
    if (!cloudSyncEnabled || !currentUser) return;

    try {
        await firebaseDb.collection("leaderboard").doc(currentUser.uid).set({
            displayName: GameState.displayName || "Anonymous",
            highestEra: GameState.currentEra,
            totalKnowledge: GameState.totalKnowledge,
            totalClicks: GameState.totalClicks,
            totalPrestiges: GameState.totalPrestiges,
            achievementCount: Object.keys(GameState.achievements || {}).length,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } catch (e) {
        console.warn("Leaderboard update failed:", e);
    }
}

async function getLeaderboard(limit = 20) {
    if (!firebaseDb) return [];

    try {
        const snapshot = await firebaseDb.collection("leaderboard")
            .orderBy("highestEra", "desc")
            .orderBy("totalKnowledge", "desc")
            .limit(limit)
            .get();

        return snapshot.docs.map((doc, index) => ({
            rank: index + 1,
            id: doc.id,
            isCurrentUser: currentUser && doc.id === currentUser.uid,
            ...doc.data(),
        }));
    } catch (e) {
        console.warn("Leaderboard fetch failed:", e);
        return [];
    }
}

// --- Periodic Cloud Sync ---
let cloudSaveTimer = 0;
const CLOUD_SAVE_INTERVAL = 60000; // 60 seconds

function tickCloudSync(deltaMs) {
    if (!cloudSyncEnabled) return;
    cloudSaveTimer += deltaMs;
    if (cloudSaveTimer >= CLOUD_SAVE_INTERVAL) {
        cloudSaveTimer = 0;
        saveToCloud();
        updateLeaderboard();
    }
}

// --- Set Display Name ---
function setDisplayName(name) {
    const sanitized = (name || "").trim().substring(0, 20) || "Anonymous";
    GameState.displayName = sanitized;
    saveGame();
    if (cloudSyncEnabled) {
        saveToCloud();
        updateLeaderboard();
    }
}
