// ============================================================
// ui.js — DOM updates, panel switching, animations, toasts
// ============================================================

let currentTab = "main";

// --- Tab Navigation ---
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(`panel-${tab}`).classList.add("active");
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add("active");

    if (tab === "inventions") renderUpgradeList();
    if (tab === "legacy") renderLegacyPanel();
    if (tab === "settings") renderStats();
}

// --- Main Panel Updates ---
function updateResourceDisplay() {
    document.getElementById("knowledge-amount").textContent = formatNumber(GameState.knowledge);
    document.getElementById("knowledge-per-click").textContent = `+${formatNumber(GameState.knowledgePerClick)}/click`;
    document.getElementById("knowledge-per-sec").textContent = `${formatNumber(GameState.knowledgePerSecond)}/sec from scholars`;
    document.getElementById("population-amount").textContent = formatNumber(Math.floor(GameState.population));

    // Era progress
    const era = ERAS[GameState.currentEra];
    const progress = Math.min((GameState.totalKnowledge / era.knowledgeToAdvance) * 100, 100);
    document.getElementById("era-progress-fill").style.width = `${progress}%`;
    document.getElementById("era-progress-text").textContent = `${Math.floor(progress)}%`;

    // Show advance button when ready
    const advBtn = document.getElementById("advance-era-btn");
    if (progress >= 100 && GameState.currentEra < ERAS.length - 1) {
        advBtn.classList.add("visible");
    } else {
        advBtn.classList.remove("visible");
    }
}

function updateEraDisplay() {
    const era = ERAS[GameState.currentEra];
    document.getElementById("era-name").textContent = `${era.icon} ${era.name}`;
    document.getElementById("era-description").textContent = era.description;
    document.body.style.background = era.bgGradient;
    document.documentElement.style.setProperty("--era-color", era.color);

    // Update advance button text
    if (GameState.currentEra < ERAS.length - 1) {
        const nextEra = ERAS[GameState.currentEra + 1];
        document.getElementById("advance-era-text").textContent =
            `Advance to ${nextEra.icon} ${nextEra.name}`;
    }
}

// --- Upgrade List ---
function renderUpgradeList() {
    const container = document.getElementById("upgrade-list");
    const upgrades = getUpgradesForEra(GameState.currentEra);
    container.innerHTML = "";

    for (const upg of upgrades) {
        const count = getUpgradeCount(upg);
        const maxed = isMaxed(upg);
        const cost = getUpgradeCost(upg);
        const affordable = canAfford(upg);

        const card = document.createElement("button");
        card.className = `upgrade-card ${maxed ? "maxed" : ""} ${affordable && !maxed ? "affordable" : ""}`;
        card.disabled = maxed;

        card.innerHTML = `
            <div class="upgrade-icon">${upg.icon}</div>
            <div class="upgrade-info">
                <div class="upgrade-name">${upg.name}</div>
                <div class="upgrade-desc">${upg.description}</div>
                <div class="upgrade-flavor">${upg.flavor}</div>
            </div>
            <div class="upgrade-cost-area">
                ${maxed
                    ? '<span class="upgrade-maxed">MAX</span>'
                    : `<span class="upgrade-cost ${affordable ? '' : 'too-expensive'}">${formatNumber(cost)}</span>`
                }
                <span class="upgrade-count">${count}/${upg.maxCount}</span>
            </div>
        `;

        if (!maxed) {
            card.addEventListener("click", () => {
                if (purchaseUpgrade(upg)) {
                    animatePurchase(card);
                    renderUpgradeList();
                    updateResourceDisplay();
                }
            });
        }

        container.appendChild(card);
    }
}

// --- Click Animation ---
function animateClick(event) {
    const floater = document.createElement("div");
    floater.className = "click-floater";
    floater.textContent = `+${formatNumber(GameState.knowledgePerClick)}`;

    // Position near the click/tap
    const btn = document.getElementById("discover-btn");
    const rect = btn.getBoundingClientRect();
    floater.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 60}px`;
    floater.style.top = `${rect.top - 10}px`;

    document.body.appendChild(floater);
    setTimeout(() => floater.remove(), 800);
}

function animatePurchase(card) {
    card.classList.add("purchase-flash");
    setTimeout(() => card.classList.remove("purchase-flash"), 300);
}

// --- Toast Notifications ---
function showToast(message, duration = 3000) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function showOfflineSummary(seconds, gained) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    let timeStr = "";
    if (hours > 0) timeStr += `${hours}h `;
    timeStr += `${mins}m`;
    showToast(`Welcome back! Your scholars generated ${formatNumber(gained)} knowledge in ${timeStr}.`, 5000);
}

// --- Legacy Panel ---
function renderLegacyPanel() {
    const container = document.getElementById("legacy-content");

    let html = `
        <div class="heritage-header">
            <span class="heritage-icon">🏛️</span>
            <span class="heritage-label">Heritage Points</span>
            <span class="heritage-amount">${GameState.heritagePoints}</span>
        </div>
        <div class="heritage-total">Total earned: ${GameState.totalHeritageEarned}</div>
    `;

    // Heritage bonuses
    html += `<h3 class="legacy-section-title">Heritage Bonuses</h3>`;
    html += `<div class="heritage-bonus-list">`;

    for (const bonus of HERITAGE_BONUSES) {
        const count = getHeritageBonusCount(bonus);
        const maxed = count >= bonus.maxCount;
        const affordable = canAffordHeritage(bonus);

        html += `
            <button class="upgrade-card heritage-card ${maxed ? 'maxed' : ''} ${affordable && !maxed ? 'affordable' : ''}"
                    data-heritage-id="${bonus.id}" ${maxed ? 'disabled' : ''}>
                <div class="upgrade-icon">${bonus.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${bonus.name}</div>
                    <div class="upgrade-desc">${bonus.description}</div>
                </div>
                <div class="upgrade-cost-area">
                    ${maxed
                        ? '<span class="upgrade-maxed">MAX</span>'
                        : `<span class="upgrade-cost ${affordable ? '' : 'too-expensive'}">${bonus.cost} HP</span>`
                    }
                    <span class="upgrade-count">${count}/${bonus.maxCount}</span>
                </div>
            </button>
        `;
    }
    html += `</div>`;

    // Achievements
    html += `<h3 class="legacy-section-title">Achievements (${getAchievementCount()}/${ACHIEVEMENTS.length})</h3>`;
    html += `<div class="achievement-grid">`;

    for (const ach of ACHIEVEMENTS) {
        const unlocked = !!GameState.achievements[ach.id];
        html += `
            <div class="achievement-tile ${unlocked ? 'unlocked' : 'locked'}" title="${unlocked ? ach.name + ': ' + ach.description : '???'}">
                <span class="achievement-icon">${unlocked ? ach.icon : '🔒'}</span>
                <span class="achievement-name">${unlocked ? ach.name : '???'}</span>
            </div>
        `;
    }
    html += `</div>`;

    container.innerHTML = html;

    // Bind heritage purchase handlers
    container.querySelectorAll(".heritage-card:not(.maxed)").forEach(card => {
        card.addEventListener("click", () => {
            const id = card.dataset.heritageId;
            const bonus = HERITAGE_BONUSES.find(b => b.id === id);
            if (bonus && purchaseHeritageBonus(bonus)) {
                animatePurchase(card);
                renderLegacyPanel();
                showToast(`${bonus.icon} ${bonus.name} upgraded!`);
            }
        });
    });
}

function updateLegacyBadge() {
    const badge = document.getElementById("legacy-badge");
    if (!badge) return;
    if (GameState.heritagePoints > 0) {
        badge.textContent = GameState.heritagePoints;
        badge.classList.add("visible");
    } else {
        badge.classList.remove("visible");
    }
}

// --- Settings Panel ---
function renderStats() {
    const stats = document.getElementById("stats-content");
    const elapsed = Math.floor((Date.now() - GameState.startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);

    stats.innerHTML = `
        <div class="stat-row"><span>Total Clicks</span><span>${formatNumber(GameState.totalClicks)}</span></div>
        <div class="stat-row"><span>Total Knowledge</span><span>${formatNumber(GameState.totalKnowledge)}</span></div>
        <div class="stat-row"><span>Knowledge/click</span><span>${formatNumber(GameState.knowledgePerClick)}</span></div>
        <div class="stat-row"><span>Knowledge/sec</span><span>${formatNumber(GameState.knowledgePerSecond)}</span></div>
        <div class="stat-row"><span>Scholars</span><span>${GameState.scholars}</span></div>
        <div class="stat-row"><span>Era</span><span>${ERAS[GameState.currentEra].name}</span></div>
        <div class="stat-row"><span>Heritage Points</span><span>${GameState.heritagePoints} (${GameState.totalHeritageEarned} earned)</span></div>
        <div class="stat-row"><span>Achievements</span><span>${getAchievementCount()}/${ACHIEVEMENTS.length}</span></div>
        <div class="stat-row"><span>Era Advances</span><span>${GameState.totalPrestiges}</span></div>
        <div class="stat-row"><span>Play Time</span><span>${hours}h ${mins}m</span></div>
    `;
}

// --- Leaderboard ---
async function renderLeaderboard() {
    const list = document.getElementById("leaderboard-list");
    list.innerHTML = '<div class="leaderboard-loading">Loading...</div>';

    const entries = await getLeaderboard(20);

    if (entries.length === 0) {
        list.innerHTML = '<div class="leaderboard-empty">No entries yet. Be the first!</div>';
        return;
    }

    let html = '<div class="leaderboard-table">';
    html += '<div class="lb-header"><span>#</span><span>Player</span><span>Era</span><span>Knowledge</span></div>';

    for (const entry of entries) {
        const eraName = ERAS[entry.highestEra] ? ERAS[entry.highestEra].name : "?";
        const highlight = entry.isCurrentUser ? ' lb-current' : '';
        html += `<div class="lb-row${highlight}">
            <span class="lb-rank">${entry.rank}</span>
            <span class="lb-name">${escapeHtml(entry.displayName || 'Anonymous')}</span>
            <span class="lb-era">${eraName}</span>
            <span class="lb-score">${formatNumber(entry.totalKnowledge)}</span>
        </div>`;
    }
    html += '</div>';
    list.innerHTML = html;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Number Formatting ---
function formatNumber(n) {
    if (typeof n !== "number" || isNaN(n)) return "0";
    if (n === Infinity) return "∞";
    if (n < 0) return "-" + formatNumber(-n);
    if (n < 1000) return Math.floor(n * 10) / 10 + "";

    const suffixes = [
        "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc",
        "UDc", "DDc", "TDc", "QaDc", "QiDc", "SxDc", "SpDc", "OcDc", "NoDc", "Vg"
    ];
    const tier = Math.floor(Math.log10(n) / 3);
    if (tier < suffixes.length) {
        const scaled = n / Math.pow(10, tier * 3);
        return scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0) + suffixes[tier];
    }
    return n.toExponential(2);
}
