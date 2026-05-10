// ============================================================
// firebase-sync.js — Cloud saves & leaderboards via Firebase
//   Auth: anonymous-first, optional Google sign-in for cross-device sync
// ============================================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCevgFr7nSqYAbVdy4hw0zjsWP-aaPoyI8",
    authDomain: "through-the-ages-game.firebaseapp.com",
    projectId: "through-the-ages-game",
    storageBucket: "through-the-ages-game.firebasestorage.app",
    messagingSenderId: "591851199763",
    appId: "1:591851199763:web:223f3d31ad3859841b4ee6",
};

let firebaseDb = null;
let firebaseAuth = null;
let googleProvider = null;
let currentAuthUser = null;  // { uid, email, name, photoURL, isAnonymous }
let cloudSyncEnabled = false;

// --- Initialize ---
async function initFirebase() {
    try {
        if (typeof firebase === "undefined") {
            console.warn("Firebase SDK not loaded");
            return false;
        }

        firebase.initializeApp(FIREBASE_CONFIG);
        firebaseDb = firebase.firestore();
        firebaseAuth = firebase.auth();
        googleProvider = new firebase.auth.GoogleAuthProvider();

        // Wait for auth state
        await new Promise((resolve) => {
            const unsub = firebaseAuth.onAuthStateChanged(async (user) => {
                unsub();
                if (user) {
                    currentAuthUser = _mapUser(user);
                } else {
                    // Silent anonymous sign-in — zero friction
                    try {
                        const cred = await firebaseAuth.signInAnonymously();
                        currentAuthUser = _mapUser(cred.user);
                    } catch (e) {
                        console.warn("Anonymous auth failed:", e);
                        currentAuthUser = null;
                    }
                }
                resolve();
            });
        });

        if (currentAuthUser) {
            cloudSyncEnabled = true;
            if (!GameState.displayName && currentAuthUser.name !== "Anonymous") {
                GameState.displayName = currentAuthUser.name;
            }
            loadCloudSave();
        }

        updateAuthUI();
        return true;
    } catch (e) {
        console.warn("Firebase init failed:", e);
        return false;
    }
}

function _mapUser(user) {
    return {
        uid: user.uid,
        email: user.email || "",
        name: user.displayName || (user.email ? user.email.split("@")[0] : "Anonymous"),
        photoURL: user.photoURL || "",
        isAnonymous: user.isAnonymous,
    };
}

// --- Google Sign-In (link anonymous account or fresh sign-in) ---
async function signInWithGoogle() {
    if (!firebaseAuth) return;
    try {
        if (firebaseAuth.currentUser && firebaseAuth.currentUser.isAnonymous) {
            // Link anonymous account to Google — preserves UID and cloud data
            await firebaseAuth.currentUser.linkWithPopup(googleProvider);
            currentAuthUser = _mapUser(firebaseAuth.currentUser);
        } else {
            await firebaseAuth.signInWithPopup(googleProvider);
            currentAuthUser = _mapUser(firebaseAuth.currentUser);
        }
        cloudSyncEnabled = true;
        if (!GameState.displayName || GameState.displayName === "Anonymous") {
            GameState.displayName = currentAuthUser.name;
        }
        updateAuthUI();
        saveToCloud();
        updateLeaderboard();
        showToast("Signed in as " + currentAuthUser.email, 3000);
    } catch (e) {
        if (e.code === "auth/credential-already-in-use") {
            // Google account already linked to a different anonymous account
            if (confirm("This Google account already has a save. Load it? (Current progress will be lost)")) {
                const cred = e.credential;
                await firebaseAuth.signInWithCredential(cred);
                currentAuthUser = _mapUser(firebaseAuth.currentUser);
                cloudSyncEnabled = true;
                await loadCloudSave();
                updateAuthUI();
                showToast("Cloud save loaded!", 3000);
            }
        } else {
            console.warn("Google sign-in failed:", e);
            showToast("Sign-in failed", 3000);
        }
    }
}

function signOut() {
    if (!firebaseAuth) return;
    firebaseAuth.signOut();
    currentAuthUser = null;
    cloudSyncEnabled = false;
    updateAuthUI();
    showToast("Signed out — playing locally", 3000);
}

// --- User Document ID (use Firebase UID directly) ---
function getUserDocId() {
    if (!currentAuthUser) return null;
    return currentAuthUser.uid;
}

// --- Update Auth UI ---
function updateAuthUI() {
    const userInfo = document.getElementById("user-info");
    const cloudSaveBtn = document.getElementById("cloud-save-btn");
    const nameInput = document.getElementById("display-name-input");
    const signInBtn = document.getElementById("sign-in-btn");
    const signOutBtn = document.getElementById("sign-out-btn");

    if (currentAuthUser && !currentAuthUser.isAnonymous) {
        // Signed in with Google
        if (cloudSaveBtn) cloudSaveBtn.style.display = "block";
        if (signInBtn) signInBtn.style.display = "none";
        if (signOutBtn) signOutBtn.style.display = "inline-block";
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-profile">
                    ${currentAuthUser.photoURL
                        ? `<img src="${escapeHtmlSync(currentAuthUser.photoURL)}" class="user-avatar" referrerpolicy="no-referrer">`
                        : '<span class="user-avatar-placeholder">\uD83D\uDC64</span>'}
                    <div class="user-details">
                        <span class="user-name">${escapeHtmlSync(currentAuthUser.name)}</span>
                        <span class="user-email">${escapeHtmlSync(currentAuthUser.email)}</span>
                    </div>
                </div>
            `;
            userInfo.style.display = "flex";
        }
        if (nameInput) nameInput.value = GameState.displayName || currentAuthUser.name || "";
    } else {
        // Anonymous or not signed in
        if (cloudSaveBtn) cloudSaveBtn.style.display = currentAuthUser ? "block" : "none";
        if (signInBtn) signInBtn.style.display = "inline-block";
        if (signOutBtn) signOutBtn.style.display = "none";
        if (userInfo) {
            userInfo.innerHTML = '<span class="user-offline">Playing locally \u2014 sign in to sync across devices</span>';
            userInfo.style.display = "flex";
        }
        if (nameInput) nameInput.value = GameState.displayName || "";
    }
}

function escapeHtmlSync(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// --- Cloud Saves ---

async function saveToCloud() {
    const docId = getUserDocId();
    if (!cloudSyncEnabled || !docId) return;

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
            displayName: GameState.displayName || currentAuthUser.name || "Anonymous",
            email: currentAuthUser.email || "anonymous",
        };

        await firebaseDb.collection("saves").doc(docId).set(saveData);
    } catch (e) {
        console.warn("Cloud save failed:", e);
    }
}

async function loadCloudSave() {
    const docId = getUserDocId();
    if (!cloudSyncEnabled || !docId) return;

    try {
        const doc = await firebaseDb.collection("saves").doc(docId).get();
        if (!doc.exists) {
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
            saveGame();
            showToast("Cloud save loaded!", 3000);
        } else if (localTime > cloudTime) {
            saveToCloud();
        }
    } catch (e) {
        console.warn("Cloud load failed:", e);
    }
}

// --- Leaderboard ---

async function updateLeaderboard() {
    const docId = getUserDocId();
    if (!cloudSyncEnabled || !docId) return;

    try {
        await firebaseDb.collection("leaderboard").doc(docId).set({
            displayName: GameState.displayName || (currentAuthUser ? currentAuthUser.name : "Anonymous"),
            photoURL: currentAuthUser ? currentAuthUser.photoURL : "",
            email: currentAuthUser ? currentAuthUser.email : "",
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

        const currentDocId = getUserDocId();
        return snapshot.docs.map((doc, index) => ({
            rank: index + 1,
            id: doc.id,
            isCurrentUser: currentDocId && doc.id === currentDocId,
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
