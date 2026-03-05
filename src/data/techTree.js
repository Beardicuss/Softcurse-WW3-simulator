// ─────────────────────────────────────────────────────────────────────────────
// TECH TREE DATA
// 7 branches × 3 tiers each. Mutual exclusivity: MISSILES vs CYBER (see below).
// Each node: { id, branch, tier, name, icon, desc, cost, requires, effect }
// effect keys mirror the tech modifier shape used in gameLogic / store.
// ─────────────────────────────────────────────────────────────────────────────

export const TECH_BRANCHES = [
    { id: 'ARMOR',    label: 'Armor',      icon: '🛡', color: '#e67e22' },
    { id: 'DRONE',    label: 'Drones',     icon: '✈', color: '#3498db' },
    { id: 'EW',       label: 'E-War',      icon: '📡', color: '#9b59b6' },
    { id: 'MISSILES', label: 'Missiles',   icon: '🚀', color: '#e74c3c' },
    { id: 'CYBER',    label: 'Cyber',      icon: '💻', color: '#1abc9c' },
    { id: 'SPACE',    label: 'Space',      icon: '🛸', color: '#2980b9' },
    { id: 'NUKE',     label: 'Nuclear',    icon: '☢',  color: '#f39c12' },
];

// MISSILES and CYBER are mutually exclusive — choosing tier-2 of one locks the other
export const MUTUAL_EXCLUSIONS = [
    ['MISSILES_2', 'CYBER_2'],
];

export const TECH_NODES = [
    // ── ARMOR ───────────────────────────────────────────────────────────────
    {
        id: 'ARMOR_1', branch: 'ARMOR', tier: 1,
        name: 'Composite Plating',
        icon: '🛡', cost: 3,
        requires: [],
        desc: 'Improved armor alloys. +15% armor defense.',
        effect: { armorDefBonus: 0.15 },
    },
    {
        id: 'ARMOR_2', branch: 'ARMOR', tier: 2,
        name: 'Active Protection',
        icon: '🛡', cost: 5,
        requires: ['ARMOR_1'],
        desc: 'APS systems deflect missiles. +20% all defense.',
        effect: { globalDefBonus: 0.20 },
    },
    {
        id: 'ARMOR_3', branch: 'ARMOR', tier: 3,
        name: 'Autonomous Tanks',
        icon: '🤖', cost: 8,
        requires: ['ARMOR_2'],
        desc: 'AI-controlled armor. Armor ATK ×2, no oil upkeep.',
        effect: { armorAtkMult: 2.0, armorFreeUpkeep: true },
    },

    // ── DRONE ────────────────────────────────────────────────────────────────
    {
        id: 'DRONE_1', branch: 'DRONE', tier: 1,
        name: 'Recon UAVs',
        icon: '🔭', cost: 3,
        requires: [],
        desc: 'Surveillance drones. +10% attack (better intel).',
        effect: { globalAtkBonus: 0.10 },
    },
    {
        id: 'DRONE_2', branch: 'DRONE', tier: 2,
        name: 'Strike Drones',
        icon: '✈', cost: 5,
        requires: ['DRONE_1'],
        desc: 'Armed UAVs. Air ATK +30%, air cost –20%.',
        effect: { airAtkBonus: 0.30, airCostMult: 0.80 },
    },
    {
        id: 'DRONE_3', branch: 'DRONE', tier: 3,
        name: 'Swarm Protocol',
        icon: '🐝', cost: 8,
        requires: ['DRONE_2'],
        desc: 'Autonomous swarms. +1 free air unit per strategic region per turn.',
        effect: { freeAirPerStrategic: 1 },
    },

    // ── ELECTRONIC WARFARE ───────────────────────────────────────────────────
    {
        id: 'EW_1', branch: 'EW', tier: 1,
        name: 'Jamming Arrays',
        icon: '📡', cost: 3,
        requires: [],
        desc: 'Disrupts enemy comms. Enemy ATK –10% vs your regions.',
        effect: { enemyAtkDebuff: 0.10 },
    },
    {
        id: 'EW_2', branch: 'EW', tier: 2,
        name: 'SIGINT Network',
        icon: '🔊', cost: 5,
        requires: ['EW_1'],
        desc: 'Global signal intercepts. +15% income.',
        effect: { incomeBonus: 0.15 },
    },
    {
        id: 'EW_3', branch: 'EW', tier: 3,
        name: 'Blackout Weapon',
        icon: '⚫', cost: 8,
        requires: ['EW_2'],
        desc: 'Grid attack: once per turn, nullify one enemy region\'s defense.',
        effect: { blackoutCharges: 1 },
    },

    // ── MISSILES ─────────────────────────────────────────────────────────────
    {
        id: 'MISSILES_1', branch: 'MISSILES', tier: 1,
        name: 'Ballistic Program',
        icon: '🚀', cost: 3,
        requires: [],
        desc: 'SRBM development. +20% attack in all engagements.',
        effect: { globalAtkBonus: 0.20 },
    },
    {
        id: 'MISSILES_2', branch: 'MISSILES', tier: 2,
        name: 'Hypersonic Glide',
        icon: '💨', cost: 6,
        requires: ['MISSILES_1'],
        mutuallyExcludes: 'CYBER_2',
        desc: 'Unstoppable re-entry vehicles. Air ATK ×1.5, ignores 50% defense.',
        effect: { airAtkBonus: 0.50, defPenetration: 0.50 },
    },
    {
        id: 'MISSILES_3', branch: 'MISSILES', tier: 3,
        name: 'MIRV Arsenal',
        icon: '☄', cost: 10,
        requires: ['MISSILES_2'],
        desc: 'Multiple warhead delivery. Nuclear strikes devastate entire regions (+50% nuke damage).',
        effect: { nukeDamageMult: 1.50 },
    },

    // ── CYBER ────────────────────────────────────────────────────────────────
    {
        id: 'CYBER_1', branch: 'CYBER', tier: 1,
        name: 'Hacker Cells',
        icon: '💻', cost: 3,
        requires: [],
        desc: 'State-sponsored hackers. Steal 5% of each enemy\'s income each turn.',
        effect: { incomeStealPct: 0.05 },
    },
    {
        id: 'CYBER_2', branch: 'CYBER', tier: 2,
        name: 'Infrastructure Virus',
        icon: '🦠', cost: 6,
        requires: ['CYBER_1'],
        mutuallyExcludes: 'MISSILES_2',
        desc: 'Crippling malware. Enemy industry –20% while active.',
        effect: { enemyIndustryDebuff: 0.20 },
    },
    {
        id: 'CYBER_3', branch: 'CYBER', tier: 3,
        name: 'Ghost Protocol',
        icon: '👻', cost: 10,
        requires: ['CYBER_2'],
        desc: 'Total information dominance. All your unit costs –25%, enemy AI moves visible.',
        effect: { globalCostMult: 0.75, revealAI: true },
    },

    // ── SPACE ────────────────────────────────────────────────────────────────
    {
        id: 'SPACE_1', branch: 'SPACE', tier: 1,
        name: 'Recon Satellites',
        icon: '🛸', cost: 4,
        requires: [],
        desc: 'Orbital surveillance. +10% defense (early warning).',
        effect: { globalDefBonus: 0.10 },
    },
    {
        id: 'SPACE_2', branch: 'SPACE', tier: 2,
        name: 'GPS Denial',
        icon: '🌐', cost: 6,
        requires: ['SPACE_1'],
        desc: 'Jam enemy targeting. Enemy ATK –15% globally.',
        effect: { enemyAtkDebuff: 0.15 },
    },
    {
        id: 'SPACE_3', branch: 'SPACE', tier: 3,
        name: 'Orbital Strike',
        icon: '⚡', cost: 10,
        requires: ['SPACE_2'],
        desc: 'Kinetic bombardment. Once per turn: deal 50 damage to any region.',
        effect: { orbitalStrikeCharges: 1 },
    },

    // ── NUCLEAR ──────────────────────────────────────────────────────────────
    {
        id: 'NUKE_1', branch: 'NUKE', tier: 1,
        name: 'Second Strike',
        icon: '☢', cost: 4,
        requires: [],
        desc: 'Hardened silos. Your nukes survive first strikes. +2 nuke stockpile.',
        effect: { extraNukes: 2, nukesSurviveStrike: true },
    },
    {
        id: 'NUKE_2', branch: 'NUKE', tier: 2,
        name: 'Tactical Warheads',
        icon: '💥', cost: 7,
        requires: ['NUKE_1'],
        desc: 'Battlefield nukes. Can use nukes in combat: instant region capture (costs 1 nuke).',
        effect: { tacticalNukes: true, extraNukes: 3 },
    },
    {
        id: 'NUKE_3', branch: 'NUKE', tier: 3,
        name: 'Dead Hand',
        icon: '💀', cost: 12,
        requires: ['NUKE_2'],
        desc: 'Automated retaliation system. If stability < 20%, auto-launch nukes at attackers.',
        effect: { deadHand: true, extraNukes: 5 },
    },
];

// Build a lookup map for quick access
export const TECH_BY_ID = Object.fromEntries(TECH_NODES.map(n => [n.id, n]));

// Get all nodes for a branch
export const getbranchNodes = (branchId) => TECH_NODES.filter(n => n.branch === branchId);

// Check if a node is locked by mutual exclusion
export const isExcluded = (nodeId, unlockedIds) => {
    for (const [a, b] of MUTUAL_EXCLUSIONS) {
        if (nodeId === a && unlockedIds.includes(b)) return true;
        if (nodeId === b && unlockedIds.includes(a)) return true;
    }
    return false;
};

// Compute the combined tech modifier object for a faction's unlocked nodes
export const computeTechModifiers = (unlockedIds = []) => {
    const mods = {
        globalAtkBonus: 0,
        globalDefBonus: 0,
        armorDefBonus: 0,
        armorAtkMult: 1,
        armorFreeUpkeep: false,
        airAtkBonus: 0,
        airCostMult: 1,
        freeAirPerStrategic: 0,
        enemyAtkDebuff: 0,
        enemyIndustryDebuff: 0,
        incomeBonus: 0,
        incomeStealPct: 0,
        globalCostMult: 1,
        defPenetration: 0,
        nukeDamageMult: 1,
        extraNukes: 0,
        nukesSurviveStrike: false,
        tacticalNukes: false,
        deadHand: false,
        blackoutCharges: 0,
        orbitalStrikeCharges: 0,
        revealAI: false,
    };

    unlockedIds.forEach(id => {
        const node = TECH_BY_ID[id];
        if (!node) return;
        const e = node.effect;
        if (e.globalAtkBonus)       mods.globalAtkBonus       += e.globalAtkBonus;
        if (e.globalDefBonus)       mods.globalDefBonus       += e.globalDefBonus;
        if (e.armorDefBonus)        mods.armorDefBonus        += e.armorDefBonus;
        if (e.armorAtkMult)         mods.armorAtkMult         *= e.armorAtkMult;
        if (e.armorFreeUpkeep)      mods.armorFreeUpkeep       = true;
        if (e.airAtkBonus)          mods.airAtkBonus          += e.airAtkBonus;
        if (e.airCostMult)          mods.airCostMult          *= e.airCostMult;
        if (e.freeAirPerStrategic)  mods.freeAirPerStrategic  += e.freeAirPerStrategic;
        if (e.enemyAtkDebuff)       mods.enemyAtkDebuff       += e.enemyAtkDebuff;
        if (e.enemyIndustryDebuff)  mods.enemyIndustryDebuff  += e.enemyIndustryDebuff;
        if (e.incomeBonus)          mods.incomeBonus          += e.incomeBonus;
        if (e.incomeStealPct)       mods.incomeStealPct       += e.incomeStealPct;
        if (e.globalCostMult)       mods.globalCostMult       *= e.globalCostMult;
        if (e.defPenetration)       mods.defPenetration       += e.defPenetration;
        if (e.nukeDamageMult)       mods.nukeDamageMult       *= e.nukeDamageMult;
        if (e.extraNukes)           mods.extraNukes           += e.extraNukes;
        if (e.nukesSurviveStrike)   mods.nukesSurviveStrike    = true;
        if (e.tacticalNukes)        mods.tacticalNukes         = true;
        if (e.deadHand)             mods.deadHand              = true;
        if (e.blackoutCharges)      mods.blackoutCharges      += e.blackoutCharges;
        if (e.orbitalStrikeCharges) mods.orbitalStrikeCharges += e.orbitalStrikeCharges;
        if (e.revealAI)             mods.revealAI              = true;
    });

    return mods;
};
