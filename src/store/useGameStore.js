import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    initGame,
    calculateIncome,
    calculatePower,
    doCombat,
    applyCasualties,
    calculateSupply,
    processStability
} from '../logic/gameLogic';
import { runNightmareAI, recordAILoss, findHegemon } from '../logic/aiLogic';
import { rollWeather, getWeather, COASTAL_REGIONS } from '../logic/gameLogic';
import { ADJ, FD, REGIONS, getTerrain } from '../data/mapData';
import { TECH_BY_ID, TECH_NODES, isExcluded, computeTechModifiers } from '../data/techTree';
import { processWorldEvents } from '../logic/eventSystem';
import { evaluateMissions, applyMissionReward, CAMPAIGN_MISSIONS } from '../logic/campaignMissions';
import { _setLang, translate } from '../i18n/i18n';
import { checkAchievements } from '../logic/achievements';

const SAVE_KEY = '@ww3_save_data';
const SETTINGS_KEY = '@ww3_settings_data';

// Safe translate helper for use inside store actions
// Reads language from current state snapshot — never throws
// tl() uses a getter so it only accesses useGameStore AFTER the store is created
// This avoids the circular reference crash during module initialisation
function tl(key, vars = {}) {
    try {
        // getStore is assigned below after useGameStore is created
        const state = typeof getStore === 'function' ? getStore() : null;
        const lang = state?.settings?.language || 'en';
        return translate(key, lang, vars);
    } catch {
        return translate(key, 'en', vars);
    }
}
let getStore = null; // assigned after store creation
let _langUnsubscribe = null;

const useGameStore = create((set, get) => ({
    // State
    uiMode: 'SPLASH', // SPLASH, INTRO, MENU, FACTION, GAME
    undoSnapshot: null, // saved before last destructive action
    undoLabel: null,    // what action was snapshotted
    regions: {},
    factions: {},
    turn: 1,
    date: Date.now(),
    gameLog: [],
    playerFaction: 'NATO',
    selectedRegionId: null,
    isGameOver: false,
    gameOverReason: null,       // 'military' | 'collapse' | 'nuclear' | 'victory'
    actPhase: 1,                // 1 = Tension, 2 = Global War, 3 = Escalation/Nuclear
    actEvents: [],              // log of act transition events shown to player
    hasSave: false,
    nukeUsedThisTurn: false,
    // Nightmare AI persistent memory — one object per AI faction
    aiMemory: { EAST: {}, CHINA: {}, INDIA: {}, LATAM: {} },
    // Diplomacy state
    diplomacy: {
        // peaceTreaties: { 'NATO-EAST': { turnsLeft: 5 }, ... }
        // nonAggressionPacts: Set-like { 'NATO-CHINA': true }
        // alliances: { 'NATO-LATAM': { sharedVision: true } }
        peaceTreaties: {},
        nonAggressionPacts: {},
        alliances: {},
        pendingOffers: [],   // [{ from, to, type, turnsLeft }]
    },

    // Campaign Mission System
    missionProgress: {},       // { missionId: { status, objectiveProgress, activatedTurn, completedTurn } }
    trackedStats: {            // running stats for missions + stats screen
        // Build
        builtArmor: 0,
        builtNaval: 0,
        builtInfantry: 0,
        builtAir: 0,
        // Combat
        attacksLaunched: 0,
        attacksWon: 0,
        attacksLost: 0,
        unitsKilled: 0,
        unitsLost: 0,
        nukesLaunched: 0,
        orbitalsFired: 0,
        // Territory
        totalCaptures: 0,
        totalLosses: 0,
        peakRegions: 0,
        capturesSinceTurn: {},
        // Spy
        spyReveals: 0,
        spySabotages: 0,
        assassinations: 0,
        sanctionsUsed: 0,
        // Economy
        totalFundsEarned: 0,
        totalOilSpent: 0,
        // Survival
        turnsPlayed: 0,
        missionsCompleted: 0,
        peakStability: 100,
        lowestStability: 100,
        actReached: 1,
    },
    endStats: null,            // snapshot of stats at game end

    // ── DEEPER ECONOMY ───────────────────────────────────────────────────────
    tradeRoutes: [],           // [{ id, fromFaction, toFaction, resourceType, amount, turnsLeft }]
    sanctions: {},             // { factionKey: turnsRemaining }
    blockades: {},             // { regionId: { byFaction, turnsLeft } }
    tradeRouteIdCounter: 0,

    // ── ACHIEVEMENTS ─────────────────────────────────────────────────────────
    achievements: {},          // { achievementId: { unlockedAt: turn, seen: false } }
    leaderboard: [],           // [{ faction, score, turns, reason, date }] last 10 runs
    newlyCompletedMissions: [], // missions completed this turn, shown in UI

    // Weather System
    weather: 'clear',         // current global weather id
    weatherHistory: [],       // last 5 weather ids for trend display

    // Spy / Reconnaissance System
    // spyCharges live on each faction object (factions[key].spyCharges)

    // Event & Narrative System
    firedEvents: {},          // { eventId: lastTurnFired }
    activeEventLog: [],       // last 5 event titles shown in UI

    // Fog of War — set of region IDs visible to the player
    visibleRegions: [],  // stored as array; GameMap converts to Set in useMemo

    // Game Mode
    gameMode: 'campaign',     // 'campaign' | 'blitz' | 'survival'

    settings: {
        musicVolume: 0.8,
        sfxVolume: 1.0,
        animations: true,
        hardMode: true, // Nightmare mode always active
        language: 'en',  // 'en' | 'ru'
    },

    // Actions
    setUiMode: (mode) => set({ uiMode: mode }),
    setGameMode: (mode) => set({ gameMode: mode }),

    // ── DEEPER ECONOMY ACTIONS ───────────────────────────────────────────────

    // Establish a trade route: exchange resources between player and another faction
    proposeTrade: (toFaction, offeredResource, offeredAmount, requestedResource, requestedAmount) => {
        const state = get();
        const pFac = { ...state.factions[state.playerFaction] };
        if ((pFac[offeredResource] || 0) < offeredAmount) return { ok: false, msg: 'Insufficient resources' };
        const newFactions = { ...state.factions };
        const tFac = { ...(newFactions[toFaction] || {}) };
        // Deduct from player, add to target
        pFac[offeredResource] = (pFac[offeredResource] || 0) - offeredAmount;
        tFac[offeredResource] = (tFac[offeredResource] || 0) + offeredAmount;
        // Give player the requested resource
        pFac[requestedResource] = (pFac[requestedResource] || 0) + requestedAmount;
        tFac[requestedResource] = Math.max(0, (tFac[requestedResource] || 0) - requestedAmount);
        newFactions[state.playerFaction] = pFac;
        newFactions[toFaction] = tFac;
        const routeId = (state.tradeRouteIdCounter || 0) + 1;
        const newRoute = {
            id: routeId,
            fromFaction: state.playerFaction,
            toFaction,
            offeredResource, offeredAmount,
            requestedResource, requestedAmount,
            establishedTurn: state.turn,
            turnsLeft: 5,  // active for 5 turns, recurring
        };
        set({
            factions: newFactions,
            tradeRoutes: [...(state.tradeRoutes || []), newRoute],
            tradeRouteIdCounter: routeId,
            tradeRoutes: newTradeRoutes,
            sanctions: newSanctions,
            blockades: newBlockades,
            trackedStats: { ...state.trackedStats, sanctionsUsed: state.trackedStats?.sanctionsUsed || 0 },
            gameLog: [`📦 TRADE ROUTE: ${offeredAmount} ${offeredResource} → ${toFaction} for ${requestedAmount} ${requestedResource}.`, ...state.gameLog].slice(0, 8),
        });
        return { ok: true };
    },

    // Cancel a trade route
    cancelTrade: (routeId) => {
        const state = get();
        set({ tradeRoutes: state.tradeRoutes.filter(r => r.id !== routeId) });
    },

    // Impose economic sanctions on a faction (freezes 30% of their income for N turns)
    imposeSanctions: (targetFaction, turns = 5) => {
        const state = get();
        const cost = 400;
        const pFac = state.factions[state.playerFaction];
        if ((pFac?.funds || 0) < cost) return { ok: false, msg: 'Insufficient funds (need 400)' };
        const newFactions = { ...state.factions };
        newFactions[state.playerFaction] = { ...pFac, funds: pFac.funds - cost };
        const newSanctions = { ...state.sanctions, [targetFaction]: turns };
        set({
            factions: newFactions,
            sanctions: newSanctions,
            trackedStats: { ...state.trackedStats, sanctionsUsed: (state.trackedStats?.sanctionsUsed || 0) + 1 },
            gameLog: [`🚫 SANCTIONS: Economic war declared on ${targetFaction} for ${turns} turns. -400 funds.`, ...state.gameLog].slice(0, 8),
        });
        return { ok: true };
    },

    // Naval blockade of a region (cuts its oil/supply income)
    imposeBlockade: (regionId) => {
        const state = get();
        const cost = 300;
        const pFac = state.factions[state.playerFaction];
        const region = state.regions[regionId];
        if (!region) return { ok: false, msg: 'Invalid region' };
        if (region.faction === state.playerFaction) return { ok: false, msg: 'Cannot blockade own region' };
        if ((pFac?.funds || 0) < cost) return { ok: false, msg: 'Insufficient funds (need 300)' };
        const newFactions = { ...state.factions };
        newFactions[state.playerFaction] = { ...pFac, funds: pFac.funds - cost };
        const newBlockades = { ...state.blockades, [regionId]: { byFaction: state.playerFaction, turnsLeft: 4 } };
        set({
            factions: newFactions,
            blockades: newBlockades,
            gameLog: [`⚓ BLOCKADE: Naval blockade imposed on ${regionId.toUpperCase()} for 4 turns. -300 funds.`, ...state.gameLog].slice(0, 8),
        });
        return { ok: true };
    },

    // ── ACHIEVEMENTS ─────────────────────────────────────────────────────────

    unlockAchievement: (id) => {
        const state = get();
        if (state.achievements?.[id]) return; // already unlocked
        const newAch = { ...state.achievements, [id]: { unlockedAt: state.turn, seen: false } };
        set({ achievements: newAch });
    },

    markAchievementSeen: (id) => {
        const state = get();
        const ach = state.achievements?.[id];
        if (!ach) return;
        set({ achievements: { ...state.achievements, [id]: { ...ach, seen: true } } });
    },

    // Submit score to leaderboard on game over
    submitScore: (reason) => {
        const state = get();
        const ownedCount = Object.values(state.regions).filter(r => r.faction === state.playerFaction).length;
        const totalRegions = Object.keys(state.regions).length;
        const score = Math.floor(
            (ownedCount / totalRegions) * 5000 +
            state.turn * 10 +
            (state.trackedStats?.attacksWon || 0) * 15 +
            (state.trackedStats?.totalCaptures || 0) * 20 +
            (reason === 'victory' ? 10000 : 0)
        );
        const entry = {
            faction: state.playerFaction,
            score,
            turns: state.turn,
            regions: ownedCount,
            reason,
            date: new Date().toLocaleDateString(),
            gameMode: state.gameMode,
        };
        const lb = [...(state.leaderboard || []), entry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 15);
        set({ leaderboard: lb });
        get().saveGame();
    },

    startGame: async (faction) => {
        const { rs, fs, date } = initGame();
        const mode = get().gameMode || 'campaign';

        // Apply game mode modifications to starting state
        if (mode === 'survival') {
            // Survival: player keeps only ONE starting region, strips the rest to neutral
            const starts = FD[faction]?.starts || {};
            const startIds = Object.keys(starts);
            const keepId = startIds[0]; // keep first region only
            startIds.slice(1).forEach(rid => {
                if (rs[rid]) {
                    rs[rid] = { ...rs[rid], faction: 'NEUTRAL', infantry: 6, armor: 1, air: 0 };
                }
            });
            // Give the survival player a small bonus to compensate
            fs[faction].funds    = 600;
            fs[faction].supplies = 400;
        } else if (mode === 'blitz') {
            // Blitz: all factions start with more troops, faster escalation
            Object.keys(rs).forEach(rid => {
                if (rs[rid].faction !== 'NEUTRAL') {
                    rs[rid].infantry = Math.floor(rs[rid].infantry * 1.5);
                }
            });
        }

        // Compute initial fog of war
        const initVisible = new Set();
        Object.entries(rs).forEach(([id, r]) => {
            if (r.faction === faction) {
                initVisible.add(id);
                (ADJ[id] || []).forEach(adjId => initVisible.add(adjId));
            }
        });

        set({
            regions: rs,
            factions: fs,
            date: date,
            playerFaction: faction,
            turn: 1,
            gameLog: [tl('log.campaignStart', { faction: FD[faction].name, mode: mode.toUpperCase() })],
            uiMode: 'GAME',
            isGameOver: false,
            gameOverReason: null,
            actPhase: 1,
            actEvents: [],
            firedEvents: {},
            activeEventLog: [],
            selectedRegionId: null
        });

        // Auto-save on new game
        get().saveGame();
    },

    saveGame: async () => {
        try {
            const state = get();
            const saveData = {
                regions: state.regions,
                factions: state.factions,
                turn: state.turn,
                date: state.date,
                playerFaction: state.playerFaction,
                gameLog: state.gameLog,
                isGameOver: state.isGameOver,
                gameOverReason: state.gameOverReason,
                actPhase: state.actPhase,
                actEvents: state.actEvents,
                aiMemory: state.aiMemory,
                firedEvents: state.firedEvents,
                gameMode: state.gameMode,
                missionProgress: state.missionProgress,
                trackedStats: state.trackedStats,
                visibleRegions: Array.from(state.visibleRegions || []),
            };
            await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            set({ hasSave: true });
        } catch (e) {
            console.error("Failed to save game", e);
        }
    },

    updateSettings: async (newSettings) => {
        try {
            const updated = { ...get().settings, ...newSettings };
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
            set({ settings: updated });
        } catch (e) {
            console.error("Failed to save settings", e);
        }
    },

    selectRegion: (id) => {
        const state = get();
        const { selectedRegionId, regions, playerFaction, attack } = state;

        if (selectedRegionId && selectedRegionId !== id) {
            const from = regions[selectedRegionId];
            const to = regions[id];
            const isAdjacent = (ADJ[selectedRegionId] || []).includes(id);

            if (isAdjacent && from.faction === playerFaction && to.faction !== playerFaction) {
                attack(selectedRegionId, id);
                set({ selectedRegionId: null });
                return;
            }
        }

        if (selectedRegionId === id) {
            set({ selectedRegionId: null });
        } else {
            set({ selectedRegionId: id });
        }
    },


    // ── UNDO SYSTEM ────────────────────────────────────────────────────────────
    saveUndoSnapshot: (label) => {
        const s = get();
        if (!s.regions || !s.factions || !s.playerFaction) return;
        try {
            // Shallow-clone each region object (regions themselves are flat value objects)
            const regSnap = {};
            const rkeys = Object.keys(s.regions);
            for (let i = 0; i < rkeys.length; i++) {
                regSnap[rkeys[i]] = { ...s.regions[rkeys[i]] };
            }
            const facSnap = {};
            const fkeys = Object.keys(s.factions);
            for (let i = 0; i < fkeys.length; i++) {
                const f2 = s.factions[fkeys[i]];
                facSnap[fkeys[i]] = { ...f2, unlockedTech: f2.unlockedTech ? [...f2.unlockedTech] : [] };
            }
            set({
                undoSnapshot: {
                    regions:      regSnap,
                    factions:     facSnap,
                    trackedStats: { ...(s.trackedStats || {}) },
                    gameLog:      (s.gameLog || []).slice(0, 8),
                },
                undoLabel: label,
            });
        } catch (e) {
            console.warn('[Undo] snapshot failed:', e.message);
        }
    },

    undoLastAction: () => {
        const s = get();
        if (!s.undoSnapshot) return;
        set({
            regions: s.undoSnapshot.regions,
            factions: s.undoSnapshot.factions,
            trackedStats: s.undoSnapshot.trackedStats,
            gameLog: s.undoSnapshot.gameLog,
            undoSnapshot: null,
            undoLabel: null,
        });
    },


    // ── DIPLOMACY ACTIONS ──────────────────────────────────────────────────────
    offerPeace: (targetFaction) => {
        const state = get();
        const pf = state.playerFaction;
        const key = [pf, targetFaction].sort().join('-');
        const cost = 300; // peace costs funds
        const fac = state.factions[pf];
        if (!fac || fac.funds < cost) return { success: false, reason: 'funds' };

        set(state2 => ({
            diplomacy: {
                ...state2.diplomacy,
                pendingOffers: [
                    ...(state2.diplomacy.pendingOffers || []),
                    { from: pf, to: targetFaction, type: 'peace', turnsLeft: 3 }
                ],
            },
            factions: {
                ...state2.factions,
                [pf]: { ...state2.factions[pf], funds: state2.factions[pf].funds - cost },
            },
            gameLog: [`🤝 ${pf} offers peace to ${targetFaction} — awaiting response...`, ...state2.gameLog].slice(0, 8),
        }));
        return { success: true };
    },

    offerNonAggression: (targetFaction) => {
        const state = get();
        const pf = state.playerFaction;
        const cost = 150;
        const fac = state.factions[pf];
        if (!fac || fac.funds < cost) return { success: false, reason: 'funds' };

        set(state2 => ({
            diplomacy: {
                ...state2.diplomacy,
                pendingOffers: [
                    ...(state2.diplomacy.pendingOffers || []),
                    { from: pf, to: targetFaction, type: 'nonAggression', turnsLeft: 3 }
                ],
            },
            factions: {
                ...state2.factions,
                [pf]: { ...state2.factions[pf], funds: state2.factions[pf].funds - cost },
            },
            gameLog: [`📜 ${pf} proposes non-aggression pact with ${targetFaction}`, ...state2.gameLog].slice(0, 8),
        }));
        return { success: true };
    },

    proposeAlliance: (targetFaction) => {
        const state = get();
        const pf = state.playerFaction;
        const cost = 500;
        const fac = state.factions[pf];
        if (!fac || fac.funds < cost) return { success: false, reason: 'funds' };

        set(state2 => ({
            diplomacy: {
                ...state2.diplomacy,
                pendingOffers: [
                    ...(state2.diplomacy.pendingOffers || []),
                    { from: pf, to: targetFaction, type: 'alliance', turnsLeft: 3 }
                ],
            },
            factions: {
                ...state2.factions,
                [pf]: { ...state2.factions[pf], funds: state2.factions[pf].funds - cost },
            },
            gameLog: [`🤜 ${pf} proposes alliance with ${targetFaction}`, ...state2.gameLog].slice(0, 8),
        }));
        return { success: true };
    },

    backstabAlly: (targetFaction) => {
        // Attack an ally — breaks the alliance, massive stability hit, global condemnation
        const state = get();
        const pf = state.playerFaction;
        const key = [pf, targetFaction].sort().join('-');
        const isAlly = state.diplomacy?.alliances?.[key];
        if (!isAlly) return { success: false, reason: 'notAlly' };

        set(state2 => {
            const newAlliances = { ...state2.diplomacy.alliances };
            delete newAlliances[key];
            return {
                diplomacy: { ...state2.diplomacy, alliances: newAlliances },
                factions: {
                    ...state2.factions,
                    [pf]: {
                        ...state2.factions[pf],
                        stability: Math.max(0, (state2.factions[pf].stability || 100) - 20),
                    },
                },
                gameLog: [
                    `💀 BETRAYAL: ${pf} has backstabbed ${targetFaction}! Stability -20. World condemns the treachery.`,
                    ...state2.gameLog
                ].slice(0, 8),
            };
        });
        return { success: true };
    },

    getDiplomacyStatus: (targetFaction) => {
        const state = get();
        const pf = state.playerFaction;
        const key = [pf, targetFaction].sort().join('-');
        const dip = state.diplomacy || {};
        return {
            hasPeace:       !!(dip.peaceTreaties?.[key]),
            hasNonAgg:      !!(dip.nonAggressionPacts?.[key]),
            isAlly:         !!(dip.alliances?.[key]),
            pendingOffer:   (dip.pendingOffers || []).find(o =>
                (o.from === pf && o.to === targetFaction) ||
                (o.to === pf && o.from === targetFaction)
            ),
            peaceTurnsLeft: dip.peaceTreaties?.[key]?.turnsLeft || 0,
        };
    },

    clearUndoSnapshot: () => set({ undoSnapshot: null, undoLabel: null }),

    attack: (fromId, toId) => {
        const state = get();
        const from = state.regions[fromId];
        const to = state.regions[toId];

        // Validate before snapshotting
        if (!from || !to || from.faction !== state.playerFaction || to.faction === state.playerFaction) return;
        if (from.infantry < 2 && from.armor < 1 && from.air < 1) return;

        // Save undo snapshot only for valid attacks
        get().saveUndoSnapshot('attack');

        const fromFaction = state.factions[from.faction];
        const toFaction = state.factions[to.faction] || {};

        // Get tech modifiers
        const atkMods = computeTechModifiers(fromFaction?.unlockedTech || []);
        const defMods = computeTechModifiers(toFaction?.unlockedTech || []);

        const { win, aDamage, dDamage, stabilityDamage } = doCombat(
            from, to,
            FD[from.faction].atk,
            FD[to.faction]?.def ?? 0.85,
            from.stability ?? 100,
            to.stability ?? 100,
            atkMods, defMods, state.weather, toId
        );

        const newRegions = { ...state.regions };
        const newFactions = { ...state.factions };

        if (win) {
            const remainingAttackers = applyCasualties({
                infantry: Math.max(0, from.infantry - 1),
                armor: from.armor,
                air: from.air
            }, aDamage);

            newRegions[toId] = {
                ...to,
                faction: from.faction,
                infantry: remainingAttackers.infantry,
                armor: remainingAttackers.armor,
                air: remainingAttackers.air,
                stability: Math.max(40, to.stability - stabilityDamage)
            };
            newRegions[fromId] = { ...from, infantry: 1, armor: 0, air: 0 };

            // Capturing region boosts faction stability slightly
            newFactions[from.faction].stability = Math.min(100, newFactions[from.faction].stability + 1);
        } else {
            const remainingAttackers = applyCasualties({
                infantry: Math.max(0, from.infantry - 1),
                armor: from.armor,
                air: from.air
            }, aDamage);

            newRegions[fromId] = {
                ...from,
                infantry: remainingAttackers.infantry + 1, // Add back the 1 that stayed behind
                armor: remainingAttackers.armor,
                air: remainingAttackers.air
            };

            const remainingDefenders = applyCasualties(to, dDamage);
            newRegions[toId] = {
                ...to,
                infantry: remainingDefenders.infantry,
                armor: remainingDefenders.armor,
                air: remainingDefenders.air
            };

            // Failure hurts stability
            newFactions[from.faction].stability = Math.max(0, newFactions[from.faction].stability - 2);
        }

        set({
            regions: newRegions,
            factions: newFactions,
            gameLog: [win ? tl('log.attackSuccess2', { region: toId.toUpperCase() }) : tl('log.attackFailure2', { region: toId.toUpperCase() }), ...state.gameLog].slice(0, 8),
            trackedStats: { ...state.trackedStats,
                attacksLaunched: (state.trackedStats?.attacksLaunched || 0) + 1,
                attacksWon:  (state.trackedStats?.attacksWon  || 0) + (win ? 1 : 0),
                attacksLost: (state.trackedStats?.attacksLost || 0) + (win ? 0 : 1),
                totalCaptures: (state.trackedStats?.totalCaptures || 0) + (win ? 1 : 0),
                unitsKilled: (state.trackedStats?.unitsKilled || 0) + Math.floor(dDamage),
                unitsLost:   (state.trackedStats?.unitsLost   || 0) + Math.floor(aDamage),
            }
        });
    },

    buildUnit: (regionId, unitType) => {
        const state = get();
        const region = state.regions[regionId];
        const faction = state.factions[state.playerFaction];

        if (!region || region.faction !== state.playerFaction) return;

        // Save undo snapshot after validation passes
        get().saveUndoSnapshot('build');

        // Naval units require coastal regions
        if (['destroyer','submarine','carrier'].includes(unitType) && !COASTAL_REGIONS.has(regionId)) {
            set({ gameLog: [tl('log.navalRequired'), ...state.gameLog].slice(0, 8) });
            return;
        }

        // Apply tech cost modifier (Ghost Protocol: –25% unit costs)
        const mods = computeTechModifiers(faction?.unlockedTech || []);
        const costMult = mods.globalCostMult || 1;

        let costFunds = 0, costSupplies = 0, costIndustry = 0;
        if (unitType === 'infantry') {
            costFunds = Math.ceil(50  * costMult); costSupplies = Math.ceil(20  * costMult); costIndustry = 0;
        } else if (unitType === 'armor') {
            costFunds = Math.ceil(150 * costMult); costSupplies = Math.ceil(50  * costMult); costIndustry = 10;
        } else if (unitType === 'air') {
            const airMult = costMult * (mods.airCostMult || 1);
            costFunds = Math.ceil(300 * airMult); costSupplies = Math.ceil(100 * airMult); costIndustry = 25;
        } else if (unitType === 'destroyer') {
            costFunds = Math.ceil(200 * costMult); costSupplies = Math.ceil(60  * costMult); costIndustry = 15;
        } else if (unitType === 'submarine') {
            costFunds = Math.ceil(250 * costMult); costSupplies = Math.ceil(80  * costMult); costIndustry = 20;
        } else if (unitType === 'carrier') {
            costFunds = Math.ceil(500 * costMult); costSupplies = Math.ceil(150 * costMult); costIndustry = 30;
        }

        if (faction.funds >= costFunds && faction.supplies >= costSupplies) {
            if (region.industry >= costIndustry) {
                const newFactions = { ...state.factions };
                newFactions[state.playerFaction] = { ...faction, funds: faction.funds - costFunds, supplies: faction.supplies - costSupplies };

                const newRegions = { ...state.regions };
                newRegions[regionId] = { ...newRegions[regionId], [unitType]: (newRegions[regionId][unitType] || 0) + 1 };

                set({
                    factions: newFactions,
                    regions: newRegions,
                    gameLog: [tl('log.production2', { unit: unitType.toUpperCase(), region: regionId.toUpperCase() }), ...state.gameLog].slice(0, 8)
                });
            } else {
                set({ gameLog: [tl('log.insufficientInd', { region: regionId.toUpperCase() }), ...state.gameLog].slice(0, 8) });
            }
        } else {
            set({ gameLog: [tl('log.insufficientRes'), ...state.gameLog].slice(0, 8) });
        }
    },

    endTurn: () => {
        get().clearUndoSnapshot(); // can't undo across turns
        try {
        const state = get();
        const newRegions = { ...state.regions };
        const newFactions = { ...state.factions };
        const newLog = [...state.gameLog];

        // 1. Advance date (1 week)
        const newDate = new Date(state.date);
        newDate.setDate(newDate.getDate() + 7);

        // 2. Economy phase & Upkeep (with tech modifiers)
        // First compute all factions' tech mods
        const allTechMods = {};
        Object.keys(newFactions).forEach(fk => {
            allTechMods[fk] = computeTechModifiers(newFactions[fk]?.unlockedTech || []);
        });

        Object.keys(newFactions).forEach(fk => {
            const mods = allTechMods[fk];

            // Calculate strongest enemy's industryDebuff against this faction
            const enemyDebuff = Object.keys(newFactions)
                .filter(ek => ek !== fk)
                .reduce((worst, ek) => Math.max(worst, allTechMods[ek]?.enemyIndustryDebuff || 0), 0);
            const enemyDebuffMult = Math.max(0, 1 - enemyDebuff);

            const { income, oilProd } = calculateIncome(fk, newRegions, mods, enemyDebuffMult);
            const fac = newFactions[fk];
            fac.funds += income;
            fac.oil += oilProd;
            fac.supplies += Math.floor(income / 2);

            // Tech: earn 1 research point every 3 turns
            if (state.turn % 3 === 0) {
                fac.techPoints = (fac.techPoints || 0) + 1;
            }

            // Spy charges replenish every 5 turns (max 3)
            if (state.turn % 5 === 0) {
                fac.spyCharges = Math.min(3, (fac.spyCharges || 0) + 1);
            }

            // Naval upkeep (oil cost per naval unit)
            let navalOilCost = 0;
            owned.forEach(rid => {
                navalOilCost += (newRegions[rid].destroyer  || 0) * 2;
                navalOilCost += (newRegions[rid].submarine  || 0) * 3;
                navalOilCost += (newRegions[rid].carrier    || 0) * 4;
            });
            fac.oil = Math.max(0, (fac.oil || 0) - navalOilCost);

            // Tech: Hacker Cells — steal % from each enemy
            if (mods.incomeStealPct > 0) {
                Object.keys(newFactions).forEach(enemyFk => {
                    if (enemyFk === fk) return;
                    const stolen = Math.floor((newFactions[enemyFk].funds || 0) * mods.incomeStealPct);
                    if (stolen > 0) {
                        newFactions[enemyFk].funds = Math.max(0, newFactions[enemyFk].funds - stolen);
                        fac.funds += stolen;
                    }
                });
            }

            // Tech: Swarm Protocol — free air per strategic region
            if (mods.freeAirPerStrategic > 0) {
                const owned = Object.keys(newRegions).filter(rid => newRegions[rid].faction === fk);
                owned.forEach(rid => {
                    const regDef = REGIONS.find(r => r.id === rid);
                    if (regDef?.strategic) {
                        newRegions[rid].air = (newRegions[rid].air || 0) + mods.freeAirPerStrategic;
                    }
                });
            }

            // Upkeep Deduction
            const owned = Object.keys(newRegions).filter(rid => newRegions[rid].faction === fk);
            let infCount = 0, armorCount = 0, airCount = 0;
            owned.forEach(rid => {
                infCount  += newRegions[rid].infantry || 0;
                armorCount += newRegions[rid].armor   || 0;
                airCount  += newRegions[rid].air      || 0;
            });

            const fundsUpkeep = infCount * 1;
            // Tech: Autonomous Tanks removes armor oil upkeep
            const oilUpkeep = (mods.armorFreeUpkeep ? 0 : armorCount * 1) + (airCount * 2);

            fac.funds -= fundsUpkeep;
            fac.oil   -= oilUpkeep;

            if (fac.funds < 0 || fac.oil < 0) {
                fac.stability = Math.max(0, fac.stability - 5);
                fac.funds = Math.max(0, fac.funds);
                fac.oil   = Math.max(0, fac.oil);
            }

            // Deployment (Spawn basic infantry with excess supplies)
            if (owned.length > 0 && fac.supplies >= 50) {
                const deployment = Math.floor(fac.supplies / 50);
                for (let i = 0; i < deployment; i++) {
                    const rid = owned[Math.floor(Math.random() * owned.length)];
                    newRegions[rid].infantry = (newRegions[rid].infantry || 0) + 1;
                }
                fac.supplies = Math.max(0, fac.supplies - (deployment * 50));
            }
        });

        // 2.5 Supply Lines & Attrition
        const isolatedRegions = calculateSupply(newRegions);
        let attritionOccurred = false;

        const regionKeys = Object.keys(newRegions);
        for (let ri = 0; ri < regionKeys.length; ri++) {
            const rid = regionKeys[ri];
            const isIsolated = isolatedRegions.has(rid);
            newRegions[rid].isolated = isIsolated;

            if (isIsolated && newRegions[rid].faction !== 'NEUTRAL') {
                const r = newRegions[rid];
                const startInf = r.infantry || 0;
                const terrain = getTerrain(rid);
                const attritionRate = terrain.supplyMod < 0.8 ? 0.15 : 0.10;

                if (r.infantry > 0) r.infantry = Math.max(0, r.infantry - Math.max(1, Math.floor(r.infantry * attritionRate)));
                if (r.armor > 0)    r.armor    = Math.max(0, r.armor    - Math.max(1, Math.floor(r.armor    * attritionRate)));
                if (r.air > 0)      r.air      = Math.max(0, r.air      - Math.max(1, Math.floor(r.air      * attritionRate)));
                if (r.bomber > 0)   r.bomber   = Math.max(0, r.bomber   - Math.max(1, Math.floor(r.bomber   * attritionRate)));

                if (startInf > 0 && r.faction === state.playerFaction) {
                    attritionOccurred = true;
                }
            }
        }

        if (attritionOccurred) {
            newLog.unshift(tl('log.attrition'));
        }

        // 2.6 Internal Stability & Crisis Engine
        const stabilityPhase = processStability(newFactions, newRegions, state.turn, newLog);
        Object.assign(newFactions, stabilityPhase.updatedFactions);
        Object.assign(newRegions, stabilityPhase.updatedRegions);

        // 2.65 Roll weather
        const newWeather = rollWeather(state.weather, state.turn);
        const newWeatherHistory = [newWeather, ...(state.weatherHistory || [])].slice(0, 5);
        if (newWeather !== state.weather) {
            const wData = getWeather(newWeather);
            newLog.unshift(`${wData.emoji} WEATHER: ${wData.label} — ATK ×${wData.atkMod}, DEF ×${wData.defMod}`);
        }

        // 2.7 World Events
        const eventResult = processWorldEvents(
            {
                factions: newFactions,
                regions: newRegions,
                playerFaction: state.playerFaction,
                turn: state.turn,
                actPhase: newActPhase,
            },
            state.firedEvents || {}
        );
        Object.assign(newFactions, eventResult.updatedFactions);
        Object.assign(newRegions,  eventResult.updatedRegions);
        eventResult.eventLog.forEach(msg => newLog.unshift(msg));
        const newFiredEvents = eventResult.updatedFiredEvents;
        const newActiveEventLog = [...eventResult.eventLog, ...(state.activeEventLog || [])].slice(0, 4);

        // 2.8 Mission Evaluation
        const missionResult = evaluateMissions(
            { regions: newRegions, factions: newFactions, playerFaction: state.playerFaction,
              turn: state.turn, actPhase: newActPhase, settings: state.settings },
            state.missionProgress || {},
            state.trackedStats || {}
        );
        let missionFactions = newFactions;
        const missionLogs = [];
        missionResult.rewards.forEach(({ reward }) => {
            missionFactions = applyMissionReward(missionFactions, state.playerFaction, reward);
        });
        missionResult.completedNow.forEach(m => {
            const lang = state.settings?.language || 'en';
            const title = lang === 'ru' ? m.titleRu : m.title;
            missionLogs.push(`🎯 MISSION COMPLETE: ${title}`);
        });
        missionLogs.forEach(msg => newLog.unshift(msg));
        newFactions = missionFactions;

        // 2.9 Fog of War — recompute visible regions for player
        const newVisible = new Set();
        Object.entries(newRegions).forEach(([id, r]) => {
            if (r.faction === state.playerFaction) {
                newVisible.add(id);
                (ADJ[id] || []).forEach(adjId => newVisible.add(adjId));
            }
        });

        // 2.9 Dead Hand — if player has NUKE_3 and stability < 20%, auto-retaliate vs biggest attacker
        const playerMods = allTechMods[state.playerFaction] || {};
        if (playerMods.deadHand && (newFactions[state.playerFaction]?.stability || 100) < 20) {
            const playerNukes = newFactions[state.playerFaction]?.nukes || 0;
            if (playerNukes > 0) {
                // Find the enemy faction owning the most regions adjacent to player
                const threatScores = {};
                Object.keys(newRegions).forEach(rid => {
                    if (newRegions[rid].faction !== state.playerFaction) return;
                    (ADJ[rid] || []).forEach(nid => {
                        const nf = newRegions[nid]?.faction;
                        if (nf && nf !== state.playerFaction && nf !== 'NEUTRAL') {
                            threatScores[nf] = (threatScores[nf] || 0) + 1;
                        }
                    });
                });
                const topThreat = Object.entries(threatScores).sort((a,b) => b[1]-a[1])[0]?.[0];
                if (topThreat) {
                    // Strike their most valuable region
                    const targets = Object.entries(newRegions)
                        .filter(([,r]) => r.faction === topThreat)
                        .sort(([,a],[,b]) => (b.economy||0) - (a.economy||0));
                    if (targets.length > 0) {
                        const [strikeId, strikeReg] = targets[0];
                        newRegions[strikeId] = {
                            ...strikeReg,
                            infantry: Math.floor((strikeReg.infantry||0) * 0.05),
                            armor: Math.floor((strikeReg.armor||0) * 0.05),
                            air: Math.floor((strikeReg.air||0) * 0.05),
                            stability: 5, bombed: true,
                        };
                        newFactions[state.playerFaction] = {
                            ...newFactions[state.playerFaction],
                            nukes: playerNukes - 1,
                        };
                        newLog.unshift(`☠ DEAD HAND: Automated retaliation — ☢ ${strikeId.toUpperCase()} obliterated!`);
                    }
                }
            }
        }


        // 4. DIPLOMACY PHASE — process pending offers + decay treaties
        const _dip = state.diplomacy || { peaceTreaties: {}, nonAggressionPacts: {}, alliances: {}, pendingOffers: [] };
        const newDiplomacy = {
            peaceTreaties:      { ..._dip.peaceTreaties },
            nonAggressionPacts: { ..._dip.nonAggressionPacts },
            alliances:          { ..._dip.alliances },
            pendingOffers:      (_dip.pendingOffers || []).map(o => ({ ...o })),
        };

        // Process AI responses to pending offers
        (newDiplomacy.pendingOffers || []).forEach(offer => {
            offer.turnsLeft = (offer.turnsLeft || 1) - 1;

            if (offer.turnsLeft <= 0) {
                // AI decides: accept based on relative power + stability
                const aiKey  = offer.from === state.playerFaction ? offer.to : offer.from;
                const aiStab = newFactions[aiKey]?.stability || 100;
                const aiOwned = Object.values(newRegions).filter(r => r.faction === aiKey).length;
                const playerOwned = Object.values(newRegions).filter(r => r.faction === state.playerFaction).length;

                // More likely to accept peace/non-aggression if weaker or unstable
                const acceptProb =
                    offer.type === 'peace'        ? (aiStab < 50 || aiOwned < playerOwned ? 0.75 : 0.35) :
                    offer.type === 'nonAggression' ? (aiStab < 60 ? 0.65 : 0.40) :
                    offer.type === 'alliance'      ? (aiOwned < playerOwned * 0.7 ? 0.55 : 0.20) : 0;

                const key = [offer.from, offer.to].sort().join('-');
                if (Math.random() < acceptProb) {
                    if (offer.type === 'peace') {
                        newDiplomacy.peaceTreaties[key] = { turnsLeft: 8 };
                        newLog.unshift(`✅ ${aiKey} ACCEPTS peace treaty with ${state.playerFaction}! (8 turns)`);
                    } else if (offer.type === 'nonAggression') {
                        newDiplomacy.nonAggressionPacts[key] = true;
                        newLog.unshift(`✅ ${aiKey} ACCEPTS non-aggression pact with ${state.playerFaction}`);
                    } else if (offer.type === 'alliance') {
                        newDiplomacy.alliances[key] = { sharedVision: true };
                        newLog.unshift(`🤜 ${aiKey} ACCEPTS alliance with ${state.playerFaction}!`);
                    }
                } else {
                    newLog.unshift(`❌ ${aiKey} REJECTS ${offer.type} offer from ${state.playerFaction}`);
                }
            }
        });

        // Remove expired offers
        newDiplomacy.pendingOffers = (newDiplomacy.pendingOffers || []).filter(o => o.turnsLeft > 0);

        // Decay peace treaties
        Object.keys(newDiplomacy.peaceTreaties || {}).forEach(key => {
            newDiplomacy.peaceTreaties[key].turnsLeft -= 1;
            if (newDiplomacy.peaceTreaties[key].turnsLeft <= 0) {
                delete newDiplomacy.peaceTreaties[key];
                newLog.unshift(`⚠️ Peace treaty expired — hostilities may resume`);
            }
        });

        // Non-aggression pacts: AI respects them (skip attacks on pact partners)
        // (enforced in runNightmareAI below by passing pact data)

        // 3. NIGHTMARE AI PHASE
        const aiFactions = ['EAST', 'CHINA', 'INDIA', 'LATAM'].filter(f => f !== state.playerFaction);
        const newAIMemory = { ...state.aiMemory };

        aiFactions.forEach(aiKey => {
            const memoryIn = newAIMemory[aiKey] || {};

            const { moves, reinforcements, buildOrders, updatedMemory } =
                runNightmareAI(aiKey, newRegions, newFactions, state.playerFaction, memoryIn, newAIMemory, state.turn || 0);

            // 3a. Execute combat moves
            moves.forEach(m => {
                const from = newRegions[m.from];
                const to   = newRegions[m.to];
                if (!from || !to)               return;
                if (from.faction !== aiKey)     return;

                const toFaction = to.faction || 'NEUTRAL';
                const defStat   = FD[toFaction]?.def ?? 0.85;
                const aiAtkMods = allTechMods[aiKey]    || {};
                const aiDefMods = allTechMods[toFaction] || {};

                const { win, aDamage, dDamage } = doCombat(
                    from, to,
                    FD[aiKey].atk, defStat,
                    from.stability ?? 100,
                    to.stability   ?? 100,
                    aiAtkMods, aiDefMods, newWeather, m.to
                );

                if (win) {
                    const remaining = applyCasualties(
                        { infantry: Math.max(0, from.infantry - 1), armor: from.armor, air: from.air },
                        aDamage
                    );
                    newRegions[m.to]   = { ...to, faction: aiKey, ...remaining, stability: 50 };
                    newRegions[m.from] = { ...from, infantry: 1, armor: 0, air: 0 };
                    newLog.unshift(tl('log.strategicLoss', { region: m.to.toUpperCase(), faction: FD[aiKey].short }));
                } else {
                    // Record loss in AI memory — it will avoid this target next time
                    updatedMemory.recentLosses = updatedMemory.recentLosses || {};
                    updatedMemory.recentLosses[m.to] = (updatedMemory.recentLosses[m.to] || 0) + 1;

                    const remAtk = applyCasualties(
                        { infantry: Math.max(0, from.infantry - 1), armor: from.armor, air: from.air },
                        aDamage
                    );
                    const remDef = applyCasualties(to, dDamage);
                    newRegions[m.from] = { ...from, infantry: remAtk.infantry + 1, armor: remAtk.armor, air: remAtk.air };
                    newRegions[m.to]   = { ...to,   ...remDef };
                }
            });

            // 3b. Execute reinforcements — move troops from safe rear into threatened front
            reinforcements.forEach(r => {
                const src = newRegions[r.from];
                const dst = newRegions[r.to];
                if (!src || !dst) return;
                if (src.faction !== aiKey || dst.faction !== aiKey) return;

                // Transfer half the source troops (keep minimum garrison of 2)
                const transfer = {
                    infantry: Math.floor(Math.max(0, src.infantry - 2) * 0.5),
                    armor:    Math.floor(src.armor * 0.5),
                    air:      Math.floor(src.air   * 0.5),
                };
                newRegions[r.from] = {
                    ...src,
                    infantry: src.infantry - transfer.infantry,
                    armor:    src.armor    - transfer.armor,
                    air:      src.air      - transfer.air,
                };
                newRegions[r.to] = {
                    ...dst,
                    infantry: dst.infantry + transfer.infantry,
                    armor:    dst.armor    + transfer.armor,
                    air:      dst.air      + transfer.air,
                };
            });

            // 3c. Execute AI production orders (doctrine-counter build plan)
            buildOrders.forEach(order => {
                const reg = newRegions[order.regionId];
                const fac = newFactions[aiKey];
                if (!reg || reg.faction !== aiKey || !fac) return;

                const costs = {
                    infantry:  { funds: 50,  supplies: 20  },
                    armor:     { funds: 150, supplies: 50  },
                    air:       { funds: 300, supplies: 100 },
                    bomber:    { funds: 400, supplies: 150, oil: 80 },
                    guerrilla: { funds: 100, supplies: 30  },
                };
                const c = costs[order.unitType];
                if (!c) return;
                if (fac.funds < c.funds || fac.supplies < c.supplies) return;

                newFactions[aiKey] = {
                    ...fac,
                    funds:    fac.funds    - c.funds,
                    supplies: fac.supplies - c.supplies,
                };
                newRegions[order.regionId] = {
                    ...reg,
                    [order.unitType]: (reg[order.unitType] || 0) + 1,
                };
            });

            // Persist updated memory for this faction
            newAIMemory[aiKey] = updatedMemory;
        });

        // ── PHASE 7: 3-ACT PROGRESSION ─────────────────────────────────────
        const totalRegions   = Object.keys(newRegions).length;
        const pRegions       = Object.values(newRegions).filter(r => r.faction === state.playerFaction);
        const pRegionsCount  = pRegions.length;
        const pStability     = newFactions[state.playerFaction]?.stability ?? 100;
        const pFunds         = newFactions[state.playerFaction]?.funds ?? 0;
        const pOil           = newFactions[state.playerFaction]?.oil   ?? 0;
        const newActEvents   = [...(state.actEvents || [])];
        let   newActPhase    = state.actPhase || 1;

        // Count total nukes used across all factions (proxy: turns with bombed regions)
        const totalBombed = Object.values(newRegions).filter(r => r.bombed).length;

        // ── Act 1 → Act 2: Global War trigger ─────────────────────────────
        // Triggers when: player has lost ≥25% of starting regions OR turn ≥15
        const startingRegionCount = Object.keys(FD[state.playerFaction]?.starts || {}).length || 4;
        const regionsLost = startingRegionCount - pRegionsCount;
        if (newActPhase === 1) {
            const act2TurnTrigger = state.gameMode === 'blitz' ? 8 : 15;
            const act2Trigger =
                state.turn >= act2TurnTrigger ||
                regionsLost >= Math.ceil(startingRegionCount * 0.25) ||
                pStability < 65;
            if (act2Trigger) {
                newActPhase = 2;
                newActEvents.push('ACT II — GLOBAL WAR: The conflict has escalated beyond containment. All factions mobilize fully.');
                newLog.unshift(tl('log.actII'));
                // Act 2 effect: AI factions get a one-time combat power boost
                ['EAST', 'CHINA', 'INDIA', 'LATAM'].filter(f => f !== state.playerFaction).forEach(fk => {
                    const owned = Object.keys(newRegions).filter(id => newRegions[id].faction === fk);
                    owned.forEach(rid => {
                        newRegions[rid].infantry = (newRegions[rid].infantry || 0) + 3;
                    });
                    newFactions[fk].funds = (newFactions[fk].funds || 0) + 500;
                });
            }
        }

        // ── Act 2 → Act 3: Escalation/Nuclear trigger ────────────────────
        // Triggers when: nuclear weapons have been used, or turn ≥30, or player <30% regions
        if (newActPhase === 2) {
            const act3Trigger =
                state.turn >= 30 ||
                totalBombed >= 3 ||
                pRegionsCount <= Math.floor(totalRegions * 0.10);
            if (act3Trigger) {
                newActPhase = 3;
                newActEvents.push('ACT III — ESCALATION: The nuclear threshold has been crossed. Civilisation teeters on the edge.');
                newLog.unshift(tl('log.actIII'));
                // Act 3 effect: global stability collapse, all factions lose stability
                Object.keys(newFactions).forEach(fk => {
                    newFactions[fk].stability = Math.max(10, (newFactions[fk].stability || 100) - 20);
                });
            }
        }

        // ── VICTORY CHECK ─────────────────────────────────────────────────
        // Player wins by controlling >60% of all regions
        const victoryThreshold = state.gameMode === 'blitz' ? Math.ceil(totalRegions * 0.40) : Math.ceil(totalRegions * 0.60);
        if (pRegionsCount >= victoryThreshold) {
            set({
                regions: newRegions, factions: newFactions,
                isGameOver: true,
                gameOverReason: 'victory',
                endStats: { ...state.trackedStats, finalTurn: state.turn, finalRegions: pRegionsCount, finalFaction: state.playerFaction, finalActPhase: newActPhase },
                actPhase: newActPhase,
                actEvents: newActEvents,
                gameLog: [
                    `VICTORY: World dominance achieved in ${state.turn} turns. ${FD[state.playerFaction].name} rules the globe.`,
                    ...newLog
                ].slice(0, 8),
            });
            get().submitScore('victory');
            get().saveGame();
            return;
        }

        // ── DEFEAT: MILITARY COLLAPSE ─────────────────────────────────────
        // All player regions lost
        if (pRegionsCount === 0) {
            set({
                regions: newRegions, factions: newFactions,
                isGameOver: true,
                gameOverReason: 'military',
                endStats: { ...state.trackedStats, finalTurn: state.turn, finalRegions: pRegionsCount, finalFaction: state.playerFaction, finalActPhase: newActPhase },
                actPhase: newActPhase,
                actEvents: newActEvents,
                gameLog: [
                    'MILITARY DEFEAT: All territory lost. Command authority dissolved.',
                    ...newLog
                ].slice(0, 8),
            });
            get().submitScore('military');
            get().saveGame();
            return;
        }

        // ── DEFEAT: SYSTEMATIC COLLAPSE ───────────────────────────────────
        // Stability hits zero (internal revolution/surrender)
        if (pStability <= 0) {
            set({
                regions: newRegions, factions: newFactions,
                isGameOver: true,
                gameOverReason: 'collapse',
                endStats: { ...state.trackedStats, finalTurn: state.turn, finalRegions: pRegionsCount, finalFaction: state.playerFaction, finalActPhase: newActPhase },
                actPhase: newActPhase,
                actEvents: newActEvents,
                gameLog: [
                    'SYSTEMATIC COLLAPSE: Internal stability lost. The government falls from within.',
                    ...newLog
                ].slice(0, 8),
            });
            get().submitScore('collapse');
            get().saveGame();
            return;
        }

        // ── DEFEAT: NUCLEAR ANNIHILATION ──────────────────────────────────
        // Act 3 + player economy destroyed + nuked out
        if (newActPhase === 3 && pStability < 15 && pFunds <= 0 && pOil <= 0) {
            set({
                regions: newRegions, factions: newFactions,
                isGameOver: true,
                gameOverReason: 'nuclear',
                endStats: { ...state.trackedStats, finalTurn: state.turn, finalRegions: pRegionsCount, finalFaction: state.playerFaction, finalActPhase: newActPhase },
                actPhase: newActPhase,
                actEvents: newActEvents,
                gameLog: [
                    '☢ NUCLEAR ANNIHILATION: The warheads fell. Nothing remains.',
                    ...newLog
                ].slice(0, 8),
            });
            get().submitScore('nuclear');
            get().saveGame();
            return;
        }

        // ── NORMAL TURN END ───────────────────────────────────────────────
        set({
            regions: newRegions,
            factions: newFactions,
            gameLog: [`Turn ${state.turn} completed.`, ...newLog].slice(0, 8),
            selectedRegionId: null,
            turn: state.turn + 1,
            date: newDate.getTime(),
            nukeUsedThisTurn: false,
            aiMemory: newAIMemory,
            diplomacy: newDiplomacy,
            actPhase: newActPhase,
            actEvents: newActEvents,
            firedEvents: newFiredEvents,
            activeEventLog: newActiveEventLog,
            visibleRegions: Array.from(newVisible),
            weather: newWeather,
            weatherHistory: newWeatherHistory,
            missionProgress: missionResult.newProgress,
            newlyCompletedMissions: missionResult.completedNow,
            trackedStats: {
                ...state.trackedStats,
                turnsPlayed: (state.trackedStats?.turnsPlayed || 0) + 1,
                actReached: Math.max(state.trackedStats?.actReached || 1, newActPhase),
                peakRegions: Math.max(state.trackedStats?.peakRegions || 0, pRegionsCount),
                peakStability: Math.max(state.trackedStats?.peakStability || 0, newFactions[state.playerFaction]?.stability || 0),
                lowestStability: Math.min(state.trackedStats?.lowestStability ?? 100, newFactions[state.playerFaction]?.stability ?? 100),
                missionsCompleted: Object.values(missionResult.newProgress).filter(p => p.status === 'complete').length,
            },
        });
        get().saveGame();
        } catch (e) {
            console.error('endTurn crashed:', e);
            set({ gameLog: [`ERROR: Turn processing failed — ${e.message}`, ...get().gameLog].slice(0, 8) });
        }
    },

    // ── Nuclear Strike — Ultimate Weapon ─────────────────────────────────────
    // Rules:
    //  - Requires at least 1 nuke in stockpile
    //  - Target must be enemy-owned (not player, not neutral)
    //  - Can only strike once per turn (nukeUsedThisTurn flag)
    //  - Base damage: wipes 90% of all units, craters stability to 10, marks bombed
    //  - MISSILES_3 (nukeDamageMult): 100% unit wipe + economy damage
    //  - NUKE_2 (tacticalNukes): can target ANY adjacent enemy region, instantly capture it
    //  - NUKE_3 (deadHand): checked in endTurn, not here
    //  - Enemy loses 10 stability from the shock regardless
    //  - Global tension: every faction's stability drops 3 pts (world reacts)
    launchNuke: (targetRegionId) => {
        const state = get();
        const fac = state.factions[state.playerFaction];
        if (!fac) return;

        // Stockpile check
        if ((fac.nukes || 0) < 1) {
            set({ gameLog: [tl('log.nuclearNoWarheads'), ...state.gameLog].slice(0, 8) });
            return;
        }

        // One nuke per turn
        if (state.nukeUsedThisTurn) {
            set({ gameLog: [tl('log.nuclearAlreadyUsed'), ...state.gameLog].slice(0, 8) });
            return;
        }

        const target = state.regions[targetRegionId];
        if (!target) return;
        if (target.faction === state.playerFaction) {
            set({ gameLog: [tl('log.nuclearOwnTerritory'), ...state.gameLog].slice(0, 8) });
            return;
        }
        if (target.faction === 'NEUTRAL') {
            set({ gameLog: [tl('log.nuclearNeutral'), ...state.gameLog].slice(0, 8) });
            return;
        }

        const mods = computeTechModifiers(fac.unlockedTech || []);

        // NUKE_2 (Tactical Warheads) — can capture adjacent region directly
        // Without it — strike is strategic bombardment only (no capture)
        const isTactical = mods.tacticalNukes === true;

        // Damage calculation
        // Base: 90% unit destruction
        // MISSILES_3 (nukeDamageMult ≥ 1.5): full wipe + economy damage
        const damageMult = mods.nukeDamageMult || 1;
        const isTotal = damageMult >= 1.5;

        const unitSurvivalRate = isTotal ? 0 : 0.08; // 8% survive base, 0% with MIRV
        const newRegions = { ...state.regions };
        const newFactions = { ...state.factions };

        const after = {
            ...target,
            infantry: Math.floor((target.infantry || 0) * unitSurvivalRate),
            armor:    Math.floor((target.armor    || 0) * unitSurvivalRate),
            air:      Math.floor((target.air      || 0) * unitSurvivalRate),
            stability: 10,
            economy: isTotal ? Math.floor((target.economy || 40) * 0.4) : target.economy, // MIRV craters economy
            bombed: true,
        };

        if (isTactical) {
            // Tactical nukes capture the region with 1 garrison infantry
            after.faction = state.playerFaction;
            after.infantry = 1;
            after.armor = 0;
            after.air = 0;
        }

        newRegions[targetRegionId] = after;

        // Deduct nuke from stockpile
        newFactions[state.playerFaction] = { ...fac, nukes: fac.nukes - 1 };

        // Global tension — all factions lose stability (nuclear use destabilizes world)
        Object.keys(newFactions).forEach(fk => {
            if (fk !== state.playerFaction) {
                newFactions[fk] = {
                    ...newFactions[fk],
                    stability: Math.max(0, (newFactions[fk].stability || 100) - 8),
                };
            }
        });
        // Player also suffers some backlash
        newFactions[state.playerFaction] = {
            ...newFactions[state.playerFaction],
            stability: Math.max(0, (newFactions[state.playerFaction].stability || 100) - 3),
        };

        const captureMsg = isTactical ? ' Region captured.' : '';
        const mirvMsg = isTotal ? ' MIRV warheads — total annihilation.' : '';
        set({
            regions: newRegions,
            factions: newFactions,
            nukeUsedThisTurn: true,
            trackedStats: { ...get().trackedStats, nukesLaunched: (get().trackedStats?.nukesLaunched || 0) + 1 },
            gameLog: [
                `☢ NUCLEAR STRIKE: ${targetRegionId.toUpperCase()} obliterated.${captureMsg}${mirvMsg}`,
                ...state.gameLog
            ].slice(0, 8),
        });
    },
    researchTech: (nodeId) => {
        const state = get();
        const fac = state.factions[state.playerFaction];
        if (!fac) return;

        const node = TECH_BY_ID[nodeId];
        if (!node) return;

        const unlocked = fac.unlockedTech || [];

        // Already unlocked
        if (unlocked.includes(nodeId)) {
            set({ gameLog: [tl('log.researchActive', { name: node.name }), ...state.gameLog].slice(0, 8) });
            return;
        }

        // Check points
        if ((fac.techPoints || 0) < node.cost) {
            set({ gameLog: [tl('log.researchNoPoints', { n: node.cost }), ...state.gameLog].slice(0, 8) });
            return;
        }

        // Check prerequisites
        for (const req of node.requires || []) {
            if (!unlocked.includes(req)) {
                const reqNode = TECH_BY_ID[req];
                set({ gameLog: [tl('log.researchRequires', { name: reqNode?.name || req }), ...state.gameLog].slice(0, 8) });
                return;
            }
        }

        // Check mutual exclusion
        if (isExcluded(nodeId, unlocked)) {
            set({ gameLog: [tl('log.researchBlocked'), ...state.gameLog].slice(0, 8) });
            return;
        }

        const newFactions = { ...state.factions };
        newFactions[state.playerFaction] = {
            ...fac,
            techPoints: (fac.techPoints || 0) - node.cost,
            unlockedTech: [...unlocked, nodeId],
            // Apply immediate effects (nukes)
            nukes: (fac.nukes || 0) + (node.effect.extraNukes || 0),
        };

        set({
            factions: newFactions,
            gameLog: [tl('log.researchComplete', { name: node.name }), ...state.gameLog].slice(0, 8),
        });
    },

    // ── Spy Actions ───────────────────────────────────────────────────────────
    // Uses spyCharges from player faction
    // Actions: reveal (fog of war reveal), sabotage, assassinate (stability hit)
    spyReveal: (targetRegionId) => {
        const state = get();
        const fac = state.factions[state.playerFaction];
        if ((fac?.spyCharges || 0) < 1) {
            set({ gameLog: [tl('log.spyNoCharges'), ...state.gameLog].slice(0, 8) });
            return;
        }
        const newFactions = { ...state.factions };
        newFactions[state.playerFaction] = { ...fac, spyCharges: fac.spyCharges - 1 };
        // Reveal the target region and its neighbors for 1 turn
        const newVisible = new Set(state.visibleRegions);
        newVisible.add(targetRegionId);
        (ADJ[targetRegionId] || []).forEach(id => newVisible.add(id));
        set({
            factions: newFactions,
            visibleRegions: Array.from(newVisible),
            trackedStats: { ...state.trackedStats, spyReveals: (state.trackedStats?.spyReveals || 0) + 1 },
            gameLog: [tl('log.spyReveal', { region: targetRegionId.toUpperCase() }), ...state.gameLog].slice(0, 8),
        });
    },

    spySabotage: (targetRegionId) => {
        const state = get();
        const fac = state.factions[state.playerFaction];
        if ((fac?.spyCharges || 0) < 1) {
            set({ gameLog: [tl('log.spyNoCharges'), ...state.gameLog].slice(0, 8) });
            return;
        }
        const target = state.regions[targetRegionId];
        if (!target || target.faction === state.playerFaction) return;

        const newFactions = { ...state.factions };
        newFactions[state.playerFaction] = { ...fac, spyCharges: fac.spyCharges - 1 };
        const newRegions = { ...state.regions };
        // Sabotage: destroy industry and hit stability
        newRegions[targetRegionId] = {
            ...target,
            industry:  Math.max(0, (target.industry  || 0) - 8),
            stability: Math.max(0, (target.stability || 100) - 20),
        };
        set({
            factions: newFactions,
            regions: newRegions,
            trackedStats: { ...state.trackedStats, spySabotages: (state.trackedStats?.spySabotages || 0) + 1 },
            gameLog: [tl('log.spySabotage', { region: targetRegionId.toUpperCase() }), ...state.gameLog].slice(0, 8),
        });
    },

    spyAssassinate: (targetFactionKey) => {
        const state = get();
        const fac = state.factions[state.playerFaction];
        if ((fac?.spyCharges || 0) < 2) {
            set({ gameLog: [`SPY: Assassination requires 2 operative charges.`, ...state.gameLog].slice(0, 8) });
            return;
        }
        const newFactions = { ...state.factions };
        newFactions[state.playerFaction] = { ...fac, spyCharges: fac.spyCharges - 2 };
        // Hit enemy faction stability hard
        newFactions[targetFactionKey] = {
            ...newFactions[targetFactionKey],
            stability: Math.max(0, (newFactions[targetFactionKey].stability || 100) - 30),
            funds: Math.max(0, (newFactions[targetFactionKey].funds || 0) - 200),
        };
        set({
            factions: newFactions,
            trackedStats: { ...state.trackedStats, assassinations: (state.trackedStats?.assassinations || 0) + 1 },
            gameLog: [tl('log.spyAssassinate', { faction: targetFactionKey }), ...state.gameLog].slice(0, 8),
        });
    },

    orbitalStrike: (targetRegionId) => {
        useGameStore.getState && (() => { const s = get(); set({ trackedStats: { ...s.trackedStats, orbitalsFired: (s.trackedStats?.orbitalsFired||0)+1 } }); })();
        const state = get();
        const fac = state.factions[state.playerFaction];
        const mods = computeTechModifiers(fac?.unlockedTech || []);
        if ((mods.orbitalStrikeCharges || 0) < 1) {
            set({ gameLog: [`ORBITAL: No charges available. Research Space tier 3.`, ...state.gameLog].slice(0, 8) });
            return;
        }
        const target = state.regions[targetRegionId];
        if (!target || target.faction === state.playerFaction) return;

        const newRegions = { ...state.regions };
        const damage = 50;
        const after = {
            ...target,
            infantry: Math.max(0, (target.infantry || 0) - Math.floor(damage * 0.6)),
            armor:    Math.max(0, (target.armor    || 0) - Math.floor(damage * 0.2)),
            air:      Math.max(0, (target.air      || 0) - Math.floor(damage * 0.1)),
            stability: Math.max(0, (target.stability || 100) - 20),
        };
        newRegions[targetRegionId] = after;
        set({
            regions: newRegions,
            gameLog: [`ORBITAL STRIKE: Kinetic impact on ${targetRegionId.toUpperCase()}!`, ...state.gameLog].slice(0, 8),
        });
    },

    blackoutRegion: (targetRegionId) => {
        const state = get();
        const fac = state.factions[state.playerFaction];
        const mods = computeTechModifiers(fac?.unlockedTech || []);
        if ((mods.blackoutCharges || 0) < 1) {
            set({ gameLog: [`BLACKOUT: No charges. Research E-War tier 3.`, ...state.gameLog].slice(0, 8) });
            return;
        }
        const target = state.regions[targetRegionId];
        if (!target || target.faction === state.playerFaction) return;

        const newRegions = { ...state.regions };
        newRegions[targetRegionId] = { ...target, blackedOut: true, stability: Math.max(0, (target.stability || 100) - 30) };
        set({
            regions: newRegions,
            gameLog: [`E-WAR BLACKOUT: ${targetRegionId.toUpperCase()} grid offline!`, ...state.gameLog].slice(0, 8),
        });
    },

    // ── Persistence ──────────────────────────────────────────────────────────
    loadGame: async () => {
        try {
            const savedState = await AsyncStorage.getItem(SAVE_KEY);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                set({
                    ...parsedState,
                    isGameOver: false,
                    selectedRegionId: null,
                    nukeUsedThisTurn: false,
                    hasSave: true,
                    uiMode: 'GAME',
                    aiMemory: parsedState.aiMemory || { EAST: {}, CHINA: {}, INDIA: {}, LATAM: {} },
                    visibleRegions: Array.isArray(parsedState.visibleRegions) ? parsedState.visibleRegions : Array.from(parsedState.visibleRegions || []),
                    weather: parsedState.weather || 'clear',
                    weatherHistory: parsedState.weatherHistory || [],
                    firedEvents: parsedState.firedEvents || {},
                    missionProgress: parsedState.missionProgress || {},
                    trackedStats: parsedState.trackedStats || { builtInfantry:0, builtArmor:0, builtAir:0, builtNaval:0, attacksLaunched:0, attacksWon:0, attacksLost:0, unitsKilled:0, unitsLost:0, nukesLaunched:0, orbitalsFired:0, totalCaptures:0, totalLosses:0, peakRegions:0, capturesSinceTurn:{}, spyReveals:0, spySabotages:0, assassinations:0, sanctionsUsed:0, totalFundsEarned:0, totalOilSpent:0, turnsPlayed:0, missionsCompleted:0, peakStability:100, lowestStability:100, actReached:1 },
                    activeEventLog: parsedState.activeEventLog || [],
                    actPhase: parsedState.actPhase || 1,
                    actEvents: parsedState.actEvents || [],
                    gameMode: parsedState.gameMode || 'campaign',
                    gameLog: [tl('log.campaignStart', { faction: '', mode: 'LOAD' }).replace(' — LOAD mode',''), ...(parsedState.gameLog || [])].slice(0, 8)
                });
                return true;
            } else {
                set({ hasSave: false });
                return false;
            }
        } catch (e) {
            console.error("Failed to load game:", e);
            set({ hasSave: false });
            return false;
        }
    },

    checkHasSave: async () => {
        try {
            const savedState = await AsyncStorage.getItem(SAVE_KEY);
            const settingsData = await AsyncStorage.getItem(SETTINGS_KEY);
            const updates = { hasSave: !!savedState };
            if (settingsData) updates.settings = JSON.parse(settingsData);
            set(updates);
        } catch (e) {
            set({ hasSave: false });
        }
    },

    setMusicVolume: (volume) => set(state => ({ settings: { ...state.settings, musicVolume: volume } })),
    setSfxVolume: (volume) => set(state => ({ settings: { ...state.settings, sfxVolume: volume } })),
}));

// Wire up the lazy getter now that the store exists
getStore = () => useGameStore.getState();
// Keep i18n lang in sync — no store import needed in i18n.js (breaks cycle)
_setLang(useGameStore.getState()?.settings?.language || 'en');
useGameStore.subscribe(state => {
    _setLang(state?.settings?.language || 'en');
});

export default useGameStore;

