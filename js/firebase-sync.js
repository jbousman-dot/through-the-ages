// ============================================================
// firebase-sync.js — Cloud saves & leaderboards via Firebase
//   Auth handled by Cloudflare Access (Google OAuth at the edge)
//   User identity read from CF_Authorization JWT cookie
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
let cfUser = null;       // { email, name, userId }
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

        // Get user identity from Cloudflare Access JWT
        cfUser = getCfAccessUser();

        if (cfUser) {
            cloudSyncEnabled = true;
            console.log("Cloudflare Access user:", cfUser.email);

            // Use email as display name if not already set
            if (!GameState.displayName) {
                GameState.displayName = cfUser.name || cfUser.email.split("@")[0];
            }

            loadCloudSave();
        } else {
            console.log("No Cloudflare Access session — playing offline");
        }

        updateAuthUI();
        return true;
    } catch (e) {
        console.warn("Firebase init failed:", e);
        return false;
    }
}

// --- Read Cloudflare Access JWT ---
function getCfAccessUser() {
    try {
        const cookie = document.cookie.split(";")
            .map(c => c.trim())
            .find(c => c.startsWith("CF_Authorization="));

        if (!cookie) return null;

        const token = cookie.split("=")[1];
        // Decode JWT payload (base64url)
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));

        return {
            email: decoded.email || "",
            name: decoded.name || decoded.email?.split("@")[0] || "Player",
            userId: decoded.sub || decoded.email || "",
            photoURL: decoded.picture || "",
        };
    } catch (e) {
        console.warn("Could not read CF Access JWT:", e);
        return null;
    }
}

// --- Generate a safe document ID from email ---
function getUserDocId() {
    if (!cfUser) return null;
    // Use a hash of the email for the doc ID (Firestore-safe)
    return cfUser.email.replace(/[^a-zA-Z0-9]/g, "_");
}

// --- Update Auth UI ---
function updateAuthUI() {
    const userInfo = document.getElementById("user-info");
    const cloudSaveBtn = document.getElementById("cloud-save-btn");
    const nameInput = document.getElementById("display-name-input");

    if (cfUser) {
        if (cloudSaveBtn) cloudSaveBtn.style.display = "block";
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-profile">
                    ${cfUser.photoURL
                        ? `<img src="${escapeHtmlSync(cfUser.photoURL)}" class="user-avatar" referrerpolicy="no-referrer">`
                        : '<span class="user-avatar-placeholder">👤</span>'}
                    <div class="user-details">
                        <span class="user-name">${escapeHtmlSync(cfUser.name)}</span>
                        <span class="user-email">${escapeHtmlSync(cfUser.email)}</span>
                    </div>
                </div>
            `;
            userInfo.style.display = "flex";
        }
        if (nameInput) nameInput.value = GameState.displayName || cfUser.name || "";
    } else {
        if (cloudSaveBtn) cloudSaveBtn.style.display = "none";
        if (userInfo) {
            userInfo.innerHTML = '<span class="user-offline">Not signed in — playing offline</span>';
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
            displayName: GameState.displayName || cfUser.name || "Anonymous",
            email: cfUser.email,
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
            // First time — push local state to cloud
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
            displayName: GameState.displayName || cfUser.name || "Anonymous",
            photoURL: cfUser.photoURL || "",
            email: cfUser.email,
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

// Stub for signInWithGoogle/signOut (auth handled by Cloudflare Access at the edge)
function signInWithGoogle() {
    // Cloudflare Access handles this — just reload to trigger the auth flow
    window.location.reload();
}
function signOut() {
    // Clear the CF Access session
    window.location.href = "/cdn-cgi/access/logout";
}
