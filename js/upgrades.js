// ============================================================
// upgrades.js — Upgrade definitions and purchase logic
// ============================================================

// Each upgrade: { id, era, name, icon, description, flavor,
//   baseCost, costMultiplier, maxCount,
//   effect(count) → applies effect to GameState }

const UPGRADES = [
    // ========== STONE AGE (era 0) ==========
    {
        id: "sharp_stones",
        era: 0,
        name: "Sharp Stones",
        icon: "🪨",
        description: "+1 knowledge per click",
        flavor: "A keen edge changes everything.",
        baseCost: 10,
        costMultiplier: 1.5,
        maxCount: 10,
        effect: "clickPower",
        effectValue: 1,
    },
    {
        id: "fire",
        era: 0,
        name: "Fire",
        icon: "🔥",
        description: "+0.5 knowledge/sec",
        flavor: "Light against the darkness.",
        baseCost: 25,
        costMultiplier: 1.6,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 0.5,
    },
    {
        id: "language",
        era: 0,
        name: "Language",
        icon: "🗣️",
        description: "x2 click power",
        flavor: "Ideas can now be shared.",
        baseCost: 100,
        costMultiplier: 3,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 2,
    },
    {
        id: "gathering",
        era: 0,
        name: "Gathering",
        icon: "🌿",
        description: "+1 scholar (auto-generates knowledge)",
        flavor: "Organized foraging feeds the tribe.",
        baseCost: 50,
        costMultiplier: 1.8,
        maxCount: 10,
        effect: "scholar",
        effectValue: 1,
    },
    {
        id: "cave_painting",
        era: 0,
        name: "Cave Painting",
        icon: "🎨",
        description: "+2 knowledge/sec",
        flavor: "Recording what we know preserves it.",
        baseCost: 200,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 2,
    },
    {
        id: "tribal_council",
        era: 0,
        name: "Tribal Council",
        icon: "👥",
        description: "x2 all knowledge/sec",
        flavor: "Together, we think further.",
        baseCost: 500,
        costMultiplier: 4,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 2,
    },
    {
        id: "bone_tools",
        era: 0,
        name: "Bone Tools",
        icon: "🦴",
        description: "+3 knowledge per click",
        flavor: "Stronger tools, faster progress.",
        baseCost: 300,
        costMultiplier: 2,
        maxCount: 5,
        effect: "clickPower",
        effectValue: 3,
    },
    {
        id: "hunting",
        era: 0,
        name: "Organized Hunting",
        icon: "🏹",
        description: "+5 knowledge/sec",
        flavor: "The hunt feeds body and mind.",
        baseCost: 600,
        costMultiplier: 2.2,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 5,
    },

    // ========== BRONZE AGE (era 1) ==========
    {
        id: "agriculture",
        era: 1,
        name: "Agriculture",
        icon: "🌾",
        description: "+10 knowledge/sec",
        flavor: "Planting seeds of civilization.",
        baseCost: 50,
        costMultiplier: 1.6,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 10,
    },
    {
        id: "writing",
        era: 1,
        name: "Writing",
        icon: "📜",
        description: "x3 click power",
        flavor: "Knowledge made permanent.",
        baseCost: 200,
        costMultiplier: 3,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 3,
    },
    {
        id: "pottery",
        era: 1,
        name: "Pottery",
        icon: "🏺",
        description: "+5 knowledge per click",
        flavor: "Storing more than just grain.",
        baseCost: 100,
        costMultiplier: 1.7,
        maxCount: 8,
        effect: "clickPower",
        effectValue: 5,
    },
    {
        id: "bronze_working",
        era: 1,
        name: "Bronze Working",
        icon: "⚔️",
        description: "+25 knowledge/sec",
        flavor: "The first alloy transforms society.",
        baseCost: 500,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 25,
    },
    {
        id: "city_walls",
        era: 1,
        name: "City Walls",
        icon: "🧱",
        description: "+3 scholars",
        flavor: "Safety allows deeper thought.",
        baseCost: 800,
        costMultiplier: 2.5,
        maxCount: 3,
        effect: "scholar",
        effectValue: 3,
    },
    {
        id: "wheel",
        era: 1,
        name: "The Wheel",
        icon: "☸️",
        description: "x2 all knowledge/sec",
        flavor: "Progress rolls forward.",
        baseCost: 2000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 2,
    },
    {
        id: "trade_routes",
        era: 1,
        name: "Trade Routes",
        icon: "🐪",
        description: "+50 knowledge/sec",
        flavor: "Exchange breeds innovation.",
        baseCost: 3000,
        costMultiplier: 2.2,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 50,
    },
    {
        id: "mathematics",
        era: 1,
        name: "Mathematics",
        icon: "🔢",
        description: "x3 all knowledge/sec",
        flavor: "The language of the universe.",
        baseCost: 10000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 3,
    },

    // ========== IRON AGE (era 2) ==========
    {
        id: "iron_smelting",
        era: 2,
        name: "Iron Smelting",
        icon: "⚒️",
        description: "+100 knowledge/sec",
        flavor: "Forging a new era.",
        baseCost: 500,
        costMultiplier: 2.0,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 100,
    },
    {
        id: "philosophy",
        era: 2,
        name: "Philosophy",
        icon: "💭",
        description: "+20 knowledge per click",
        flavor: "Questioning everything leads to understanding.",
        baseCost: 1000,
        costMultiplier: 1.8,
        maxCount: 8,
        effect: "clickPower",
        effectValue: 20,
    },
    {
        id: "coinage",
        era: 2,
        name: "Coinage",
        icon: "🪙",
        description: "x2 click power",
        flavor: "Standardized value accelerates exchange.",
        baseCost: 3000,
        costMultiplier: 4,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 2,
    },
    {
        id: "road_network",
        era: 2,
        name: "Road Networks",
        icon: "🛤️",
        description: "+500 knowledge/sec",
        flavor: "All roads lead to knowledge.",
        baseCost: 5000,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 500,
    },
    {
        id: "library",
        era: 2,
        name: "Great Library",
        icon: "📚",
        description: "+10 scholars",
        flavor: "A monument to learning.",
        baseCost: 10000,
        costMultiplier: 3,
        maxCount: 3,
        effect: "scholar",
        effectValue: 10,
    },
    {
        id: "democracy",
        era: 2,
        name: "Democracy",
        icon: "🗳️",
        description: "x3 all knowledge/sec",
        flavor: "The voice of the people.",
        baseCost: 50000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 3,
    },
    {
        id: "navy",
        era: 2,
        name: "Naval Fleet",
        icon: "⛵",
        description: "+2000 knowledge/sec",
        flavor: "Mastering the seas expands horizons.",
        baseCost: 100000,
        costMultiplier: 2.5,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 2000,
    },
    {
        id: "siege_warfare",
        era: 2,
        name: "Siege Engineering",
        icon: "🏗️",
        description: "x5 click power",
        flavor: "Breaking barriers, literal and figurative.",
        baseCost: 200000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 5,
    },

    // ========== CLASSICAL (era 3) ==========
    {
        id: "aqueducts",
        era: 3,
        name: "Aqueducts",
        icon: "🏛️",
        description: "+500 knowledge/sec",
        flavor: "Water flows, civilization grows.",
        baseCost: 2000,
        costMultiplier: 1.7,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 500,
    },
    {
        id: "rhetoric",
        era: 3,
        name: "Rhetoric",
        icon: "🎭",
        description: "+100 knowledge per click",
        flavor: "The art of persuasion.",
        baseCost: 1000,
        costMultiplier: 1.8,
        maxCount: 8,
        effect: "clickPower",
        effectValue: 100,
    },
    {
        id: "roman_law",
        era: 3,
        name: "Roman Law",
        icon: "⚖️",
        description: "x3 click power",
        flavor: "Order from chaos.",
        baseCost: 5000,
        costMultiplier: 4,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 3,
    },
    {
        id: "senate",
        era: 3,
        name: "Senate",
        icon: "🏛️",
        description: "+20 scholars",
        flavor: "Wisdom in governance.",
        baseCost: 8000,
        costMultiplier: 2.5,
        maxCount: 5,
        effect: "scholar",
        effectValue: 20,
    },
    {
        id: "concrete",
        era: 3,
        name: "Roman Concrete",
        icon: "🧱",
        description: "+2,000 knowledge/sec",
        flavor: "Building to last millennia.",
        baseCost: 25000,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 2000,
    },
    {
        id: "republic",
        era: 3,
        name: "Republic",
        icon: "🏳️",
        description: "x3 all knowledge/sec",
        flavor: "Power to the people.",
        baseCost: 100000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 3,
    },
    {
        id: "postal_system",
        era: 3,
        name: "Postal System",
        icon: "📨",
        description: "+5,000 knowledge/sec",
        flavor: "Messages span the empire.",
        baseCost: 500000,
        costMultiplier: 2.2,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 5000,
    },
    {
        id: "colosseum",
        era: 3,
        name: "Colosseum",
        icon: "🏟️",
        description: "x5 click power",
        flavor: "Spectacle inspires greatness.",
        baseCost: 2000000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 5,
    },

    // ========== MEDIEVAL (era 4) ==========
    {
        id: "monasteries",
        era: 4,
        name: "Monasteries",
        icon: "⛪",
        description: "+5,000 knowledge/sec",
        flavor: "Quiet contemplation bears fruit.",
        baseCost: 25000,
        costMultiplier: 2.2,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 5000,
    },
    {
        id: "feudal_system",
        era: 4,
        name: "Feudal System",
        icon: "👑",
        description: "+50 scholars",
        flavor: "Structure from chaos.",
        baseCost: 20000,
        costMultiplier: 2.5,
        maxCount: 5,
        effect: "scholar",
        effectValue: 50,
    },
    {
        id: "cathedrals",
        era: 4,
        name: "Cathedrals",
        icon: "⛪",
        description: "x4 click power",
        flavor: "Reaching toward heaven.",
        baseCost: 50000,
        costMultiplier: 4,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 4,
    },
    {
        id: "guilds",
        era: 4,
        name: "Guilds",
        icon: "⚒️",
        description: "-15% upgrade costs",
        flavor: "Specialized craft, lower prices.",
        baseCost: 100000,
        costMultiplier: 3,
        maxCount: 3,
        effect: "costReduction",
        effectValue: 0.15,
    },
    {
        id: "universities",
        era: 4,
        name: "Universities",
        icon: "🎓",
        description: "+20,000 knowledge/sec",
        flavor: "Formalized learning.",
        baseCost: 500000,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 20000,
    },
    {
        id: "compass",
        era: 4,
        name: "Compass",
        icon: "🧭",
        description: "+500 knowledge per click",
        flavor: "Never lost again.",
        baseCost: 1000000,
        costMultiplier: 1.8,
        maxCount: 8,
        effect: "clickPower",
        effectValue: 500,
    },
    {
        id: "crusades",
        era: 4,
        name: "Crusades",
        icon: "⚔️",
        description: "x4 all knowledge/sec",
        flavor: "Knowledge through conflict.",
        baseCost: 10000000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 4,
    },
    {
        id: "magna_carta",
        era: 4,
        name: "Magna Carta",
        icon: "📜",
        description: "x5 all knowledge/sec",
        flavor: "Rights bound by law.",
        baseCost: 50000000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 5,
    },

    // ========== RENAISSANCE (era 5) ==========
    {
        id: "printing_press",
        era: 5,
        name: "Printing Press",
        icon: "📰",
        description: "+50,000 knowledge/sec",
        flavor: "Ideas spread like wildfire.",
        baseCost: 250000,
        costMultiplier: 2.2,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 50000,
    },
    {
        id: "perspective",
        era: 5,
        name: "Perspective",
        icon: "🎨",
        description: "x5 click power",
        flavor: "Seeing the world anew.",
        baseCost: 200000,
        costMultiplier: 4,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 5,
    },
    {
        id: "banking",
        era: 5,
        name: "Banking",
        icon: "🏦",
        description: "-20% upgrade costs",
        flavor: "Money makes money.",
        baseCost: 500000,
        costMultiplier: 3,
        maxCount: 3,
        effect: "costReduction",
        effectValue: 0.20,
    },
    {
        id: "patronage",
        era: 5,
        name: "Patronage",
        icon: "👑",
        description: "+150 scholars",
        flavor: "Sponsored brilliance.",
        baseCost: 1000000,
        costMultiplier: 2.5,
        maxCount: 5,
        effect: "scholar",
        effectValue: 150,
    },
    {
        id: "scientific_method",
        era: 5,
        name: "Scientific Method",
        icon: "🔬",
        description: "+200,000 knowledge/sec",
        flavor: "Hypothesis. Test. Repeat.",
        baseCost: 10000000,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 200000,
    },
    {
        id: "alchemy",
        era: 5,
        name: "Alchemy",
        icon: "⚗️",
        description: "+2,000 knowledge per click",
        flavor: "Transmuting effort into gold.",
        baseCost: 5000000,
        costMultiplier: 1.8,
        maxCount: 8,
        effect: "clickPower",
        effectValue: 2000,
    },
    {
        id: "observatory",
        era: 5,
        name: "Observatory",
        icon: "🔭",
        description: "+25% offline efficiency",
        flavor: "The stars work while you sleep.",
        baseCost: 50000000,
        costMultiplier: 3,
        maxCount: 3,
        effect: "offlineMultiplier",
        effectValue: 0.25,
    },
    {
        id: "enlightenment",
        era: 5,
        name: "Enlightenment",
        icon: "💡",
        description: "x10 all knowledge/sec",
        flavor: "Reason conquers all.",
        baseCost: 1000000000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 10,
    },

    // ========== INDUSTRIAL (era 6) ==========
    {
        id: "steam_engine",
        era: 6,
        name: "Steam Engine",
        icon: "🚂",
        description: "+500,000 knowledge/sec",
        flavor: "Power beyond muscle.",
        baseCost: 2500000,
        costMultiplier: 2.2,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 500000,
    },
    {
        id: "factory_system",
        era: 6,
        name: "Factory System",
        icon: "🏭",
        description: "+500 scholars",
        flavor: "Production at scale.",
        baseCost: 5000000,
        costMultiplier: 2.5,
        maxCount: 5,
        effect: "scholar",
        effectValue: 500,
    },
    {
        id: "telegraph",
        era: 6,
        name: "Telegraph",
        icon: "📡",
        description: "x5 click power",
        flavor: "Instant communication.",
        baseCost: 10000000,
        costMultiplier: 4,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 5,
    },
    {
        id: "assembly_line",
        era: 6,
        name: "Assembly Line",
        icon: "⚙️",
        description: "-25% upgrade costs",
        flavor: "Efficiency perfected.",
        baseCost: 50000000,
        costMultiplier: 3,
        maxCount: 3,
        effect: "costReduction",
        effectValue: 0.25,
    },
    {
        id: "railroad",
        era: 6,
        name: "Railroad",
        icon: "🚃",
        description: "+2,000,000 knowledge/sec",
        flavor: "Connecting the world.",
        baseCost: 500000000,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 2000000,
    },
    {
        id: "dynamo",
        era: 6,
        name: "Dynamo",
        icon: "⚡",
        description: "+10,000 knowledge per click",
        flavor: "Electrifying discovery.",
        baseCost: 100000000,
        costMultiplier: 1.8,
        maxCount: 8,
        effect: "clickPower",
        effectValue: 10000,
    },
    {
        id: "heritage_museum",
        era: 6,
        name: "Heritage Museum",
        icon: "🏛️",
        description: "x2 Heritage Points on advance",
        flavor: "Preserving what matters.",
        baseCost: 2000000000,
        costMultiplier: 3,
        maxCount: 2,
        effect: "heritageMult",
        effectValue: 2,
    },
    {
        id: "revolution",
        era: 6,
        name: "Industrial Revolution",
        icon: "🔥",
        description: "x20 all knowledge/sec",
        flavor: "The world transformed forever.",
        baseCost: 20000000000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 20,
    },

    // ========== MODERN (era 7) ==========
    {
        id: "electricity_grid",
        era: 7,
        name: "Power Grid",
        icon: "⚡",
        description: "+5,000,000 knowledge/sec",
        flavor: "Light conquers darkness.",
        baseCost: 25000000,
        costMultiplier: 2.2,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 5000000,
    },
    {
        id: "radio",
        era: 7,
        name: "Radio",
        icon: "📻",
        description: "+50,000 knowledge per click",
        flavor: "Broadcasting brilliance.",
        baseCost: 50000000,
        costMultiplier: 1.8,
        maxCount: 8,
        effect: "clickPower",
        effectValue: 50000,
    },
    {
        id: "computers",
        era: 7,
        name: "Computers",
        icon: "💻",
        description: "x10 click power",
        flavor: "Silicon minds assist.",
        baseCost: 500000000,
        costMultiplier: 4,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 10,
    },
    {
        id: "internet",
        era: 7,
        name: "Internet",
        icon: "🌐",
        description: "+2,000 scholars",
        flavor: "All knowledge connected.",
        baseCost: 5000000000,
        costMultiplier: 2.5,
        maxCount: 5,
        effect: "scholar",
        effectValue: 2000,
    },
    {
        id: "satellites",
        era: 7,
        name: "Satellites",
        icon: "🛰️",
        description: "+50,000,000 knowledge/sec",
        flavor: "Orbiting insight.",
        baseCost: 50000000000,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 50000000,
    },
    {
        id: "mass_media",
        era: 7,
        name: "Mass Media",
        icon: "📺",
        description: "x1.5 all knowledge sources",
        flavor: "Information everywhere.",
        baseCost: 10000000000,
        costMultiplier: 3,
        maxCount: 3,
        effect: "globalMultiplier",
        effectValue: 1.5,
    },
    {
        id: "quantum_computing",
        era: 7,
        name: "Quantum Computing",
        icon: "⚛️",
        description: "-30% upgrade costs",
        flavor: "Solving the unsolvable.",
        baseCost: 200000000000,
        costMultiplier: 3,
        maxCount: 3,
        effect: "costReduction",
        effectValue: 0.30,
    },
    {
        id: "singularity",
        era: 7,
        name: "Singularity",
        icon: "💠",
        description: "x50 all knowledge/sec",
        flavor: "Intelligence bootstraps itself.",
        baseCost: 2000000000000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 50,
    },

    // ========== FUTURE (era 8) ==========
    {
        id: "fusion_power",
        era: 8,
        name: "Fusion Power",
        icon: "☢️",
        description: "+500,000,000 knowledge/sec",
        flavor: "The power of stars, tamed.",
        baseCost: 5000000000,
        costMultiplier: 2.2,
        maxCount: 10,
        effect: "autoGen",
        effectValue: 500000000,
    },
    {
        id: "neural_link",
        era: 8,
        name: "Neural Link",
        icon: "🧠",
        description: "+500,000 knowledge per click",
        flavor: "Thought becomes knowledge.",
        baseCost: 10000000000,
        costMultiplier: 1.8,
        maxCount: 8,
        effect: "clickPower",
        effectValue: 500000,
    },
    {
        id: "dyson_sphere",
        era: 8,
        name: "Dyson Sphere",
        icon: "☀️",
        description: "x20 click power",
        flavor: "Harnessing a star.",
        baseCost: 100000000000,
        costMultiplier: 4,
        maxCount: 1,
        effect: "clickMultiplier",
        effectValue: 20,
    },
    {
        id: "matrioshka_brain",
        era: 8,
        name: "Matrioshka Brain",
        icon: "🌌",
        description: "+10,000 scholars",
        flavor: "A computer the size of a star.",
        baseCost: 500000000000,
        costMultiplier: 2.5,
        maxCount: 5,
        effect: "scholar",
        effectValue: 10000,
    },
    {
        id: "warp_drive",
        era: 8,
        name: "Warp Drive",
        icon: "🚀",
        description: "+5,000,000,000 knowledge/sec",
        flavor: "The cosmos within reach.",
        baseCost: 5000000000000,
        costMultiplier: 2.0,
        maxCount: 5,
        effect: "autoGen",
        effectValue: 5000000000,
    },
    {
        id: "time_manipulation",
        era: 8,
        name: "Time Manipulation",
        icon: "⏳",
        description: "x2 all knowledge sources",
        flavor: "Bending time to our will.",
        baseCost: 1000000000000,
        costMultiplier: 3,
        maxCount: 3,
        effect: "globalMultiplier",
        effectValue: 2,
    },
    {
        id: "universal_knowledge",
        era: 8,
        name: "Universal Knowledge",
        icon: "📖",
        description: "x100 all knowledge/sec",
        flavor: "Every question, answered.",
        baseCost: 50000000000000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "autoMultiplier",
        effectValue: 100,
    },
    {
        id: "transcendence_upgrade",
        era: 8,
        name: "Transcendence",
        icon: "✨",
        description: "x3 all knowledge sources",
        flavor: "Beyond mortal understanding.",
        baseCost: 100000000000000,
        costMultiplier: 5,
        maxCount: 1,
        effect: "globalMultiplier",
        effectValue: 3,
    },
];

// --- Upgrade Logic ---

function getUpgradeCost(upgrade) {
    const count = GameState.upgrades[upgrade.id] || 0;
    const base = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count));
    const reduction = Math.min(GameState.costReduction || 0, 0.75);
    return Math.max(1, Math.floor(base * (1 - reduction)));
}

function getUpgradeCount(upgrade) {
    return GameState.upgrades[upgrade.id] || 0;
}

function canAfford(upgrade) {
    return GameState.knowledge >= getUpgradeCost(upgrade);
}

function isMaxed(upgrade) {
    return getUpgradeCount(upgrade) >= upgrade.maxCount;
}

function purchaseUpgrade(upgrade) {
    if (isMaxed(upgrade) || !canAfford(upgrade)) return false;

    const cost = getUpgradeCost(upgrade);
    GameState.knowledge -= cost;
    GameState.upgrades[upgrade.id] = (GameState.upgrades[upgrade.id] || 0) + 1;
    GameState.totalUpgradesPurchased = (GameState.totalUpgradesPurchased || 0) + 1;

    recalculateStats();
    return true;
}

function recalculateStats() {
    // Reset to base values
    let baseClickPower = 1;
    let clickMultiplier = 1;
    let baseAutoGen = 0;
    let autoMultiplier = 1;
    let scholars = 0;
    let costReduction = 0;
    let offlineBonus = 0;
    let heritageMultiplier = 1;
    let globalMultiplier = 1;

    // Apply all purchased upgrades
    for (const upgrade of UPGRADES) {
        const count = getUpgradeCount(upgrade);
        if (count === 0) continue;

        switch (upgrade.effect) {
            case "clickPower":
                baseClickPower += upgrade.effectValue * count;
                break;
            case "clickMultiplier":
                clickMultiplier *= Math.pow(upgrade.effectValue, count);
                break;
            case "autoGen":
                baseAutoGen += upgrade.effectValue * count;
                break;
            case "autoMultiplier":
                autoMultiplier *= Math.pow(upgrade.effectValue, count);
                break;
            case "scholar":
                scholars += upgrade.effectValue * count;
                break;
            case "costReduction":
                costReduction += upgrade.effectValue * count;
                break;
            case "offlineMultiplier":
                offlineBonus += upgrade.effectValue * count;
                break;
            case "heritageMult":
                heritageMultiplier *= Math.pow(upgrade.effectValue, count);
                break;
            case "globalMultiplier":
                globalMultiplier *= Math.pow(upgrade.effectValue, count);
                break;
        }
    }

    // Apply heritage bonuses
    const hb = GameState.heritageSpent || {};
    baseClickPower += (hb.inherited_tools || 0) * 5;
    scholars += (hb.cultural_wisdom || 0) * 2;
    costReduction += (hb.swift_progress || 0) * 0.05;
    offlineBonus += (hb.deep_roots || 0) * 0.25;
    for (let i = 0; i < (hb.golden_age || 0); i++) {
        globalMultiplier *= 1.5;
    }
    if ((hb.timeless_legacy || 0) > 0) {
        heritageMultiplier *= 2;
    }
    // Ancient Memory: boost autoGen by 10% per level (applied after base calc)
    const ancientMemory = hb.ancient_memory || 0;

    // Apply achievement bonuses
    if (typeof getAchievementBonuses === "function") {
        const ab = getAchievementBonuses();
        baseClickPower += ab.clickPower || 0;
        clickMultiplier *= ab.clickMultiplier || 1;
        baseAutoGen += ab.autoGen || 0;
        autoMultiplier *= ab.autoMultiplier || 1;
        globalMultiplier *= ab.globalMultiplier || 1;
    }

    // Compute final values
    GameState.knowledgePerClick = baseClickPower * clickMultiplier * globalMultiplier;
    GameState.scholars = scholars;
    let kps = (baseAutoGen + scholars) * autoMultiplier;
    // Ancient Memory: +10% per level
    kps *= (1 + ancientMemory * 0.10);
    GameState.knowledgePerSecond = kps * globalMultiplier;

    // Store computed meta-stats
    GameState.costReduction = Math.min(costReduction, 0.75);
    GameState.offlineBonus = Math.min(offlineBonus, 0.45); // cap at 95% total (50% base + 45%)
    GameState.heritageMultiplier = heritageMultiplier;
    GameState.globalMultiplier = globalMultiplier;
}

function getUpgradesForEra(eraIndex) {
    return UPGRADES.filter(u => u.era === eraIndex);
}
