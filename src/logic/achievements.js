/**
 * WW3: GLOBAL COLLAPSE — Achievement System
 * 50 achievements across 6 categories.
 * Each is checked against game state each turn.
 */

export const ACHIEVEMENT_CATEGORIES = [
    { id: 'conquest',    label: 'Conquest',     emoji: '⚔️',  color: '#e74c3c' },
    { id: 'economy',     label: 'Economy',      emoji: '💰',  color: '#f39c12' },
    { id: 'spy',         label: 'Intelligence', emoji: '🕵',  color: '#9b59b6' },
    { id: 'survival',    label: 'Survival',     emoji: '🛡',  color: '#3a9eff' },
    { id: 'nuclear',     label: 'Nuclear',      emoji: '☢',   color: '#e67e22' },
    { id: 'campaign',    label: 'Campaign',     emoji: '🎯',  color: '#f0a030' },
];

export const ACHIEVEMENTS = [
    // ── CONQUEST ────────────────────────────────────────────────────────────
    {
        id: 'first_blood',
        category: 'conquest',
        title: 'First Blood',
        titleRu: 'Первая кровь',
        desc: 'Win your first battle.',
        descRu: 'Выиграйте первое сражение.',
        icon: '⚔️',
        check: (s) => (s.trackedStats?.attacksWon || 0) >= 1,
    },
    {
        id: 'warmonger',
        category: 'conquest',
        title: 'Warmonger',
        titleRu: 'Поджигатель войны',
        desc: 'Launch 50 attacks.',
        descRu: 'Проведите 50 атак.',
        icon: '💥',
        check: (s) => (s.trackedStats?.attacksLaunched || 0) >= 50,
    },
    {
        id: 'unstoppable',
        category: 'conquest',
        title: 'Unstoppable',
        titleRu: 'Непобедимый',
        desc: 'Win 20 battles in a row (win rate ≥ 80% on 25+ attacks).',
        descRu: 'Держите 80%+ побед при 25+ атаках.',
        icon: '🔥',
        check: (s) => s.trackedStats?.attacksLaunched >= 25 &&
            (s.trackedStats?.attacksWon / s.trackedStats?.attacksLaunched) >= 0.80,
    },
    {
        id: 'warlord',
        category: 'conquest',
        title: 'Warlord',
        titleRu: 'Военный властелин',
        desc: 'Capture 30 regions.',
        descRu: 'Захватите 30 регионов.',
        icon: '🗺',
        check: (s) => (s.trackedStats?.totalCaptures || 0) >= 30,
    },
    {
        id: 'blitzkrieg',
        category: 'conquest',
        title: 'Blitzkrieg',
        titleRu: 'Блицкриг',
        desc: 'Capture 5 regions in a single turn.',
        descRu: 'Захватите 5 регионов за один ход.',
        icon: '⚡',
        check: (s) => {
            const t = s.trackedStats?.capturesSinceTurn;
            if (!t) return false;
            return Object.values(t).some(v => v >= 5);
        },
    },
    {
        id: 'world_domination',
        category: 'conquest',
        title: 'World Domination',
        titleRu: 'Мировое господство',
        desc: 'Win a campaign via military victory.',
        descRu: 'Победите в кампании военным путём.',
        icon: '🌍',
        check: (s) => s.gameOverReason === 'victory',
    },
    {
        id: 'tank_general',
        category: 'conquest',
        title: 'Tank General',
        titleRu: 'Танковый генерал',
        desc: 'Build 20 armor units.',
        descRu: 'Постройте 20 бронеединиц.',
        icon: '🪖',
        check: (s) => (s.trackedStats?.builtArmor || 0) >= 20,
    },
    {
        id: 'air_supremacy',
        category: 'conquest',
        title: 'Air Supremacy',
        titleRu: 'Господство в воздухе',
        desc: 'Build 15 air squadrons.',
        descRu: 'Постройте 15 авиаэскадрилий.',
        icon: '✈️',
        check: (s) => (s.trackedStats?.builtAir || 0) >= 15,
    },
    {
        id: 'naval_power',
        category: 'conquest',
        title: 'Naval Superpower',
        titleRu: 'Морская держава',
        desc: 'Build 10 naval units.',
        descRu: 'Постройте 10 морских единиц.',
        icon: '⚓',
        check: (s) => (s.trackedStats?.builtNaval || 0) >= 10,
    },
    {
        id: 'unit_destroyer',
        category: 'conquest',
        title: 'Unit Destroyer',
        titleRu: 'Уничтожитель войск',
        desc: 'Destroy 200 enemy units.',
        descRu: 'Уничтожьте 200 вражеских единиц.',
        icon: '💀',
        check: (s) => (s.trackedStats?.unitsKilled || 0) >= 200,
    },

    // ── ECONOMY ─────────────────────────────────────────────────────────────
    {
        id: 'war_profiteer',
        category: 'economy',
        title: 'War Profiteer',
        titleRu: 'Военный спекулянт',
        desc: 'Accumulate 5000 funds at once.',
        descRu: 'Накопите 5000 средств одновременно.',
        icon: '💰',
        check: (s) => (s.factions?.[s.playerFaction]?.funds || 0) >= 5000,
    },
    {
        id: 'oil_baron',
        category: 'economy',
        title: 'Oil Baron',
        titleRu: 'Нефтяной магнат',
        desc: 'Accumulate 2000 oil at once.',
        descRu: 'Накопите 2000 нефти одновременно.',
        icon: '🛢',
        check: (s) => (s.factions?.[s.playerFaction]?.oil || 0) >= 2000,
    },
    {
        id: 'sanctions_master',
        category: 'economy',
        title: 'Economic Warrior',
        titleRu: 'Экономический воин',
        desc: 'Impose 5 rounds of sanctions.',
        descRu: 'Введите 5 раундов санкций.',
        icon: '🚫',
        check: (s) => (s.trackedStats?.sanctionsUsed || 0) >= 5,
    },
    {
        id: 'trade_empire',
        category: 'economy',
        title: 'Trade Empire',
        titleRu: 'Торговая империя',
        desc: 'Establish 3 active trade routes.',
        descRu: 'Установите 3 активных торговых пути.',
        icon: '📦',
        check: (s) => (s.tradeRoutes || []).filter(r => r.turnsLeft > 0).length >= 3,
    },
    {
        id: 'blockade_master',
        category: 'economy',
        title: 'Blockade Master',
        titleRu: 'Мастер блокады',
        desc: 'Impose 3 naval blockades.',
        descRu: 'Введите 3 морские блокады.',
        icon: '🚢',
        check: (s) => Object.keys(s.blockades || {}).length >= 3,
    },

    // ── INTELLIGENCE ─────────────────────────────────────────────────────────
    {
        id: 'shadow_warrior',
        category: 'spy',
        title: 'Shadow Warrior',
        titleRu: 'Теневой воин',
        desc: 'Perform 10 spy actions.',
        descRu: 'Выполните 10 разведывательных операций.',
        icon: '🕵',
        check: (s) => ((s.trackedStats?.spyReveals || 0) +
                       (s.trackedStats?.spySabotages || 0) +
                       (s.trackedStats?.assassinations || 0)) >= 10,
    },
    {
        id: 'saboteur',
        category: 'spy',
        title: 'Master Saboteur',
        titleRu: 'Мастер диверсий',
        desc: 'Sabotage 8 enemy regions.',
        descRu: 'Диверсии в 8 регионах врага.',
        icon: '💣',
        check: (s) => (s.trackedStats?.spySabotages || 0) >= 8,
    },
    {
        id: 'assassin',
        category: 'spy',
        title: 'Assassin',
        titleRu: 'Убийца',
        desc: 'Assassinate 3 enemy leaders.',
        descRu: 'Ликвидируйте 3 вражеских лидера.',
        icon: '🗡',
        check: (s) => (s.trackedStats?.assassinations || 0) >= 3,
    },
    {
        id: 'ghost',
        category: 'spy',
        title: 'Ghost',
        titleRu: 'Призрак',
        desc: 'Reveal 15 enemy regions.',
        descRu: 'Раскройте 15 регионов врага.',
        icon: '👁',
        check: (s) => (s.trackedStats?.spyReveals || 0) >= 15,
    },

    // ── SURVIVAL ─────────────────────────────────────────────────────────────
    {
        id: 'survivor',
        category: 'survival',
        title: 'Survivor',
        titleRu: 'Выживший',
        desc: 'Survive 20 turns.',
        descRu: 'Выживите 20 ходов.',
        icon: '🛡',
        check: (s) => (s.trackedStats?.turnsPlayed || 0) >= 20,
    },
    {
        id: 'iron_will',
        category: 'survival',
        title: 'Iron Will',
        titleRu: 'Железная воля',
        desc: 'Survive 40 turns.',
        descRu: 'Выживите 40 ходов.',
        icon: '🏔',
        check: (s) => (s.trackedStats?.turnsPlayed || 0) >= 40,
    },
    {
        id: 'last_stand',
        category: 'survival',
        title: 'Last Stand',
        titleRu: 'Последний рубеж',
        desc: 'Recover from below 20% stability.',
        descRu: 'Восстановитесь после падения стабильности ниже 20%.',
        icon: '💪',
        check: (s) => (s.trackedStats?.lowestStability || 100) <= 20 &&
                      (s.factions?.[s.playerFaction]?.stability || 0) >= 50,
    },
    {
        id: 'act_3_survivor',
        category: 'survival',
        title: 'Into the Fire',
        titleRu: 'В огонь',
        desc: 'Reach Act III.',
        descRu: 'Достигните Акта III.',
        icon: '☢',
        check: (s) => (s.trackedStats?.actReached || 1) >= 3,
    },
    {
        id: 'peak_commander',
        category: 'survival',
        title: 'Peak Commander',
        titleRu: 'Выдающийся командир',
        desc: 'Hold 25+ regions at once.',
        descRu: 'Удерживайте 25+ регионов одновременно.',
        icon: '🌐',
        check: (s) => (s.trackedStats?.peakRegions || 0) >= 25,
    },
    {
        id: 'stability_king',
        category: 'survival',
        title: 'Iron Grip',
        titleRu: 'Железная рука',
        desc: 'Maintain stability above 80 for 15 turns.',
        descRu: 'Держите стабильность выше 80 в течение 15 ходов.',
        icon: '👑',
        check: (s) => (s.trackedStats?.lowestStability || 0) >= 80 &&
                      (s.trackedStats?.turnsPlayed || 0) >= 15,
    },

    // ── NUCLEAR ──────────────────────────────────────────────────────────────
    {
        id: 'going_nuclear',
        category: 'nuclear',
        title: 'Going Nuclear',
        titleRu: 'Ядерный вариант',
        desc: 'Launch a nuclear strike.',
        descRu: 'Нанесите ядерный удар.',
        icon: '☢',
        check: (s) => (s.trackedStats?.nukesLaunched || 0) >= 1,
    },
    {
        id: 'doomsday',
        category: 'nuclear',
        title: 'Doomsday',
        titleRu: 'Судный день',
        desc: 'Launch 5 nuclear strikes.',
        descRu: 'Нанесите 5 ядерных ударов.',
        icon: '💣',
        check: (s) => (s.trackedStats?.nukesLaunched || 0) >= 5,
    },
    {
        id: 'orbital_commander',
        category: 'nuclear',
        title: 'Orbital Commander',
        titleRu: 'Орбитальный командир',
        desc: 'Fire 3 orbital strikes.',
        descRu: 'Нанесите 3 орбитальных удара.',
        icon: '🛰',
        check: (s) => (s.trackedStats?.orbitalsFired || 0) >= 3,
    },

    // ── CAMPAIGN ─────────────────────────────────────────────────────────────
    {
        id: 'mission_starter',
        category: 'campaign',
        title: 'On the Front Lines',
        titleRu: 'На передовой',
        desc: 'Complete your first mission.',
        descRu: 'Выполните первую миссию.',
        icon: '🎯',
        check: (s) => (s.trackedStats?.missionsCompleted || 0) >= 1,
    },
    {
        id: 'mission_ace',
        category: 'campaign',
        title: 'Mission Ace',
        titleRu: 'Ас миссий',
        desc: 'Complete 10 missions.',
        descRu: 'Выполните 10 миссий.',
        icon: '🏅',
        check: (s) => (s.trackedStats?.missionsCompleted || 0) >= 10,
    },
    {
        id: 'completionist',
        category: 'campaign',
        title: 'Completionist',
        titleRu: 'Перфекционист',
        desc: 'Complete all 18 missions.',
        descRu: 'Выполните все 18 миссий.',
        icon: '🏆',
        check: (s) => (s.trackedStats?.missionsCompleted || 0) >= 18,
    },
    {
        id: 'speed_run',
        category: 'campaign',
        title: 'Speed Demon',
        titleRu: 'Мастер скорости',
        desc: 'Win in under 25 turns.',
        descRu: 'Победите менее чем за 25 ходов.',
        icon: '⚡',
        check: (s) => s.gameOverReason === 'victory' && s.turn < 25,
    },
    {
        id: 'all_factions',
        category: 'campaign',
        title: 'Globetrotter',
        titleRu: 'Путешественник',
        desc: 'Win with 3 different factions.',
        descRu: 'Победите за 3 разные фракции.',
        icon: '🌎',
        // Checked against leaderboard victories
        check: (s) => {
            const wins = (s.leaderboard || []).filter(e => e.reason === 'victory');
            const factions = new Set(wins.map(e => e.faction));
            return factions.size >= 3;
        },
    },
    {
        id: 'blitz_win',
        category: 'campaign',
        title: 'Blitz Champion',
        titleRu: 'Чемпион блицкрига',
        desc: 'Win a Blitz mode game.',
        descRu: 'Победите в режиме Блицкрига.',
        icon: '⚡',
        check: (s) => s.gameOverReason === 'victory' && s.gameMode === 'blitz',
    },
    {
        id: 'survival_win',
        category: 'campaign',
        title: 'Against All Odds',
        titleRu: 'Вопреки всему',
        desc: 'Win a Survival mode game.',
        descRu: 'Победите в режиме Выживания.',
        icon: '🦾',
        check: (s) => s.gameOverReason === 'victory' && s.gameMode === 'survival',
    },
];

/**
 * Check all achievements against current state and return newly unlocked IDs.
 */
export function checkAchievements(state) {
    const newlyUnlocked = [];
    const already = state.achievements || {};
    for (const ach of ACHIEVEMENTS) {
        if (already[ach.id]) continue; // already unlocked
        try {
            if (ach.check(state)) newlyUnlocked.push(ach.id);
        } catch (e) {
            // ignore check errors
        }
    }
    return newlyUnlocked;
}

/**
 * Calculate score for a completed run.
 */
export function calculateScore(state, reason) {
    const ownedCount = Object.values(state.regions || {})
        .filter(r => r.faction === state.playerFaction).length;
    const totalRegions = Math.max(1, Object.keys(state.regions || {}).length);
    return Math.floor(
        (ownedCount / totalRegions) * 5000 +
        (state.turn || 0) * 10 +
        (state.trackedStats?.attacksWon   || 0) * 15 +
        (state.trackedStats?.totalCaptures || 0) * 20 +
        (state.trackedStats?.missionsCompleted || 0) * 50 +
        (reason === 'victory' ? 10000 : 0)
    );
}
