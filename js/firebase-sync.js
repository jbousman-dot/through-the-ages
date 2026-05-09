// ============================================================
// firebase-sync.js — Cloud saves & leaderboards via Firebase
//                     Google OAuth for per-user profiles
// ============================================================

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
let googleProvider = null;

// --- Initialize Firebase ---
async function initFirebase() {
    try {
        if (typeof firebase === "undefined") {
            console.warn("Firebase SDK not loaded");
            return false;
        }

        firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
        firebaseAuth = firebase.auth();
        firebaseDb = firebase.firestore();
        googleProvider = new firebase.auth.GoogleAuthProvider();

        // Listen for auth state changes
        firebaseAuth.onAuthStateChanged((user) => {
            currentUser = user;
            cloudSyncEnabled = !!user;
            updateAuthUI();

            if (user) {
                console.log("Signed in:", user.displayName || user.email);
                // Use Google display name if player hasn't set a custom one
                if (!GameState.displayName && user.displayName) {
                    GameState.displayName = user.displayName;
                }
                loadCloudSave();
            }
        });

        return true;
    } catch (e) {
        console.warn("Firebase init failed:", e);
        return false;
    }
}

// --- Google Sign In / Out ---

async function signInWithGoogle() {
    if (!firebaseAuth || !googleProvider) return;
    try {
        // Use popup for desktop, redirect for mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            await firebaseAuth.signInWithRedirect(googleProvider);
        } else {
            await firebaseAuth.signInWithPopup(googleProvider);
        }
    } catch (e) {
        if (e.code === "auth/popup-closed-by-user") return;
        console.warn("Sign in failed:", e);
        showToast("Sign in failed. Try again.", 3000);
    }
}

async function signOut() {
    if (!firebaseAuth) return;
    try {
        await firebaseAuth.signOut();
        currentUser = null;
        cloudSyncEnabled = false;
        updateAuthUI();
        showToast("Signed out. Playing offline.", 3000);
    } catch (e) {
        console.warn("Sign out failed:", e);
    }
}

// --- Update Auth UI ---
function updateAuthUI() {
    const signInBtn = document.getElementById("sign-in-btn");
    const signOutBtn = document.getElementById("sign-out-btn");
    const userInfo = document.getElementById("user-info");
    const cloudSaveBtn = document.getElementById("cloud-save-btn");
    const nameInput = document.getElementById("display-name-input");

    if (currentUser) {
        if (signInBtn) signInBtn.style.display = "none";
        if (signOutBtn) signOutBtn.style.display = "block";
        if (cloudSaveBtn) cloudSaveBtn.style.display = "block";
        if (userInfo) {
            const name = currentUser.displayName || currentUser.email || "Player";
            const photo = currentUser.photoURL;
            userInfo.innerHTML = `
                <div class="user-profile">
                    ${photo ? `<img src="${photo}" class="user-avatar" referrerpolicy="no-referrer">` : '<span class="user-avatar-placeholder">👤</span>'}
                    <div class="user-details">
                        <span class="user-name">${escapeHtmlSync(name)}</span>
                        <span class="user-email">${escapeHtmlSync(currentUser.email || "")}</span>
                    </div>
                </div>
            `;
            userInfo.style.display = "flex";
        }
        if (nameInput) nameInput.value = GameState.displayName || currentUser.displayName || "";
    } else {
        if (signInBtn) signInBtn.style.display = "block";
        if (signOutBtn) signOutBtn.style.display = "none";
        if (cloudSaveBtn) cloudSaveBtn.style.display = "none";
        if (userInfo) {
            userInfo.innerHTML = '<span class="user-offline">Playing offline</span>';
            userInfo.style.display = "flex";
        }
        if (nameInput) nameInput.value = GameState.displayName || "";
    }
}

function escapeHtmlSync(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
            displayName: GameState.displayName || currentUser.displayName || "Anonymous",
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
        if (!doc.exists) {
            // First time signing in — save current local state to cloud
            saveToCloud();
            updateLeaderboard();
            return;
        }

        const cloudData = doc.data();
        const localSave = localStorage.getItem("throughTheAges_save");
        const localData = localSave ? JSON.parse(localSave) : null;

        const cloudTime = cloudData.lastSave || 0;
        const localTime = localData ? (localData.lastSave || 0) : 0;

        if (cloudTime > localTime) {
            Object.assign(GameState, cloudData);
            GameState.lastTick = Date.now();
            recalculateStats();
            updateEraDisplay();
            updateResourceDisplay();
            if (currentTab === "inventions") renderUpgradeList();
            saveGame(); // Sync to localStorage too
            showToast("Cloud save loaded!", 3000);
        } else if (localTime > cloudTime) {
            // Local is newer — push to cloud
            saveToCloud();
        }
    } catch (e) {
        console.warn("Cloud load failed:", e);
    }
}

// --- Leaderboard ---

async function updateLeaderboard() {
    if (!cloudSyncEnabled || !currentUser) return;

    try {
        const displayName = GameState.displayName || currentUser.displayName || "Anonymous";
        await firebaseDb.collection("leaderboard").doc(currentUser.uid).set({
            displayName: displayName,
            photoURL: currentUser.photoURL || "",
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
const CLOUD_SAVE_INTERVAL = 60000;

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
