import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    initGame,
    calculateIncome,
    calculatePower,
    doCombat,
    applyCasualties,
    calculateSupply,
    runAI,
    processStability
} from '../logic/gameLogic';
import { ADJ, FD } from '../data/mapData';

const SAVE_KEY = '@ww3_save_data';
const SETTINGS_KEY = '@ww3_settings_data';

const useGameStore = create((set, get) => ({
    // State
    uiMode: 'SPLASH', // SPLASH, INTRO, MENU, FACTION, GAME
    regions: {},
    factions: {},
    turn: 1,
    date: Date.now(),
    gameLog: [],
    playerFaction: 'NATO',
    selectedRegionId: null,
    isGameOver: false,
    hasSave: false,

    settings: {
        musicVolume: 0.8,
        sfxVolume: 1.0,
        animations: true,
        hardMode: true, // Nightmare mode always active
    },

    // Actions
    setUiMode: (mode) => set({ uiMode: mode }),

    startGame: async (faction) => {
        const { rs, fs, date } = initGame();
        set({
            regions: rs,
            factions: fs,
            date: date,
            playerFaction: faction,
            turn: 1,
            gameLog: [`Campaign started as ${FD[faction].name} `],
            uiMode: 'GAME',
            isGameOver: false,
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
            };
            await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            set({ hasSave: true });
        } catch (e) {
            console.error("Failed to save game", e);
        }
    },

    loadGame: async () => {
        try {
            const data = await AsyncStorage.getItem(SAVE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                set({
                    ...parsed,
                    uiMode: 'GAME',
                    selectedRegionId: null
                });
            }
        } catch (e) {
            console.error("Failed to load game", e);
        }
    },

    checkHasSave: async () => {
        try {
            const data = await AsyncStorage.getItem(SAVE_KEY);
            const settingsData = await AsyncStorage.getItem(SETTINGS_KEY);

            const updates = { hasSave: !!data };
            if (settingsData) {
                updates.settings = JSON.parse(settingsData);
            }

            set(updates);
        } catch (e) {
            console.log("No save exists or error checking");
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

    attack: (fromId, toId) => {
        const state = get();
        const from = state.regions[fromId];
        const to = state.regions[toId];

        if (!from || !to || from.faction !== state.playerFaction || to.faction === state.playerFaction) return;
        if (from.infantry < 2 && from.armor < 1 && from.air < 1) return;

        // Phase 1 Combat with Stability
        const fromF = state.factions[from.faction];
        const toF = state.factions[to.faction];

        const { win, aDamage, dDamage, stabilityDamage } = doCombat(
            from,
            to,
            FD[from.faction].atk,
            FD[to.faction].def,
            from.stability,
            to.stability
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
            gameLog: [`${win ? 'SUCCESS' : 'FAILURE'}: Operation in ${toId.toUpperCase()} `, ...state.gameLog].slice(0, 10)
        });
    },

    buildUnit: (regionId, unitType) => {
        const state = get();
        const region = state.regions[regionId];
        const faction = state.factions[state.playerFaction];

        if (!region || region.faction !== state.playerFaction) return;

        let costFunds = 0;
        let costSupplies = 0;
        let costIndustry = 0;

        if (unitType === 'infantry') {
            costFunds = 50; costSupplies = 20; costIndustry = 0;
        } else if (unitType === 'armor') {
            costFunds = 150; costSupplies = 50; costIndustry = 10;
        } else if (unitType === 'air') {
            costFunds = 300; costSupplies = 100; costIndustry = 25;
        }

        if (faction.funds >= costFunds && faction.supplies >= costSupplies) {
            // Simplified industry check: region needs enough industry
            if (region.industry >= costIndustry) {
                const newFactions = { ...state.factions };
                newFactions[state.playerFaction].funds -= costFunds;
                newFactions[state.playerFaction].supplies -= costSupplies;

                const newRegions = { ...state.regions };
                newRegions[regionId][unitType] = (newRegions[regionId][unitType] || 0) + 1;

                set({
                    factions: newFactions,
                    regions: newRegions,
                    gameLog: [`PRODUCTION: ${unitType.toUpperCase()} deployed in ${regionId.toUpperCase()} `, ...state.gameLog].slice(0, 10)
                });
            } else {
                set({
                    gameLog: [`ERROR: Insufficient Industry in ${regionId.toUpperCase()} `, ...state.gameLog].slice(0, 10)
                });
            }
        } else {
            set({
                gameLog: [`ERROR: Insufficient Funds or Supplies`, ...state.gameLog].slice(0, 10)
            });
        }
    },

    endTurn: () => {
        const state = get();
        const newRegions = { ...state.regions };
        const newFactions = { ...state.factions };
        const newLog = [...state.gameLog];

        // 1. Advance date (1 week)
        const newDate = new Date(state.date);
        newDate.setDate(newDate.getDate() + 7);

        // 2. Economy phase & Upkeep
        Object.keys(newFactions).forEach(fk => {
            const { income, oilProd } = calculateIncome(fk, newRegions);
            const fac = newFactions[fk];
            fac.funds += income;
            fac.oil += oilProd;
            fac.supplies += Math.floor(income / 2);

            // Upkeep Deduction
            const owned = Object.keys(newRegions).filter(rid => newRegions[rid].faction === fk);
            let infCount = 0;
            let armorCount = 0;
            let airCount = 0;

            owned.forEach(rid => {
                infCount += newRegions[rid].infantry || 0;
                armorCount += newRegions[rid].armor || 0;
                airCount += newRegions[rid].air || 0;
            });

            const fundsUpkeep = infCount * 1; // 1 fund per infantry
            const oilUpkeep = (armorCount * 1) + (airCount * 2);

            fac.funds -= fundsUpkeep;
            fac.oil -= oilUpkeep;

            // Penalty for deficit
            if (fac.funds < 0 || fac.oil < 0) {
                fac.stability = Math.max(0, fac.stability - 5);
                fac.funds = Math.max(0, fac.funds);
                fac.oil = Math.max(0, fac.oil);
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

        Object.keys(newRegions).forEach(rid => {
            const isIsolated = isolatedRegions.has(rid);
            newRegions[rid].isolated = isIsolated;

            if (isIsolated && newRegions[rid].faction !== 'NEUTRAL') {
                const r = newRegions[rid];
                const startInf = r.infantry || 0;

                if (r.infantry > 0) r.infantry -= Math.max(1, Math.floor(r.infantry * 0.1));
                if (r.armor > 0) r.armor -= Math.max(1, Math.floor(r.armor * 0.1));
                if (r.air > 0) r.air -= Math.max(1, Math.floor(r.air * 0.1));

                if (startInf > 0 && r.faction === state.playerFaction) {
                    attritionOccurred = true;
                }
            }
        });

        if (attritionOccurred) {
            newLog.unshift(`WARNING: Isolated forces are suffering attrition!`);
        }

        // 2.6 Internal Stability & Crisis Engine
        const stabilityPhase = processStability(newFactions, newRegions, state.turn, newLog);
        Object.assign(newFactions, stabilityPhase.updatedFactions);
        Object.assign(newRegions, stabilityPhase.updatedRegions);

        // 3. AI phase
        const aiFactions = ['EAST', 'CHINA'].filter(f => f !== state.playerFaction);
        aiFactions.forEach(aiKey => {
            const moves = runAI(aiKey, newRegions, state.playerFaction);
            moves.forEach(m => {
                const from = newRegions[m.from];
                const to = newRegions[m.to];
                const { win, aDamage, dDamage } = doCombat(
                    from,
                    to,
                    FD[aiKey].atk,
                    FD[to.faction].def,
                    from.stability,
                    to.stability
                );

                if (win) {
                    const remainingAttackers = applyCasualties({
                        infantry: Math.max(0, from.infantry - 1),
                        armor: from.armor,
                        air: from.air
                    }, aDamage);

                    newRegions[m.to] = {
                        ...to,
                        faction: aiKey,
                        infantry: remainingAttackers.infantry,
                        armor: remainingAttackers.armor,
                        air: remainingAttackers.air,
                        stability: 50
                    };
                    newRegions[m.from] = { ...from, infantry: 1, armor: 0, air: 0 };
                    newLog.unshift(`STRATEGIC LOSS: ${m.to.toUpperCase()} captured by ${FD[aiKey].short} `);
                } else {
                    const remainingAttackers = applyCasualties({
                        infantry: Math.max(0, from.infantry - 1),
                        armor: from.armor,
                        air: from.air
                    }, aDamage);
                    newRegions[m.from] = {
                        ...from,
                        infantry: remainingAttackers.infantry + 1,
                        armor: remainingAttackers.armor,
                        air: remainingAttackers.air
                    };

                    const remainingDefenders = applyCasualties(to, dDamage);
                    newRegions[m.to] = {
                        ...to,
                        infantry: remainingDefenders.infantry,
                        armor: remainingDefenders.armor,
                        air: remainingDefenders.air
                    };
                }
            });
        });

        // Check game over
        const pRegionsCount = Object.values(newRegions).filter(r => r.faction === state.playerFaction).length;
        if (pRegionsCount === 0 || newFactions[state.playerFaction].stability <= 0) {
            set({
                regions: newRegions,
                factions: newFactions,
                isGameOver: true,
                gameLog: ['CRITICAL FAILURE: Command Authority lost.', ...state.gameLog].slice(0, 10)
            });
            // Wipe save on death (?) - optional, let's just let them reload for now.
            get().saveGame();
        } else {
            set({
                regions: newRegions,
                factions: newFactions,
                gameLog: [`Turn ${state.turn} completed.`, ...state.gameLog].slice(0, 10),
                selectedRegionId: null,
                turn: state.turn + 1,
                date: newDate.getTime(),
            });

            // Auto-save every turn
            get().saveGame();
        }
    },

    // New actions for saving/loading
    saveGame: async () => {
        const state = get();
        const stateToSave = {
            regions: state.regions,
            factions: state.factions,
            playerFaction: state.playerFaction,
            turn: state.turn,
            date: state.date,
            gameLog: state.gameLog,
            // Do NOT save selectedRegionId, isGameOver, hasSave, settings
            // Do NOT save actions themselves
        };
        try {
            await AsyncStorage.setItem('game_save', JSON.stringify(stateToSave));
            set({ hasSave: true, gameLog: ['Game saved successfully!', ...state.gameLog].slice(0, 10) });
        } catch (e) {
            console.error("Failed to save game:", e);
            set({ gameLog: ['ERROR: Failed to save game.', ...state.gameLog].slice(0, 10) });
        }
    },

    loadGame: async () => {
        try {
            const savedState = await AsyncStorage.getItem('game_save');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                set({
                    ...parsedState,
                    isGameOver: false, // Ensure game is not over on load
                    selectedRegionId: null, // Clear selected region
                    hasSave: true,
                    uiMode: 'GAME', // Required to switch out of the Main Menu
                    gameLog: ['Game loaded successfully!', ...parsedState.gameLog].slice(0, 10)
                });
                return true;
            } else {
                set({ hasSave: false, gameLog: ['No saved game found.', ...get().gameLog].slice(0, 10) });
                return false;
            }
        } catch (e) {
            console.error("Failed to load game:", e);
            set({ hasSave: false, gameLog: ['ERROR: Failed to load game.', ...get().gameLog].slice(0, 10) });
            return false;
        }
    },

    checkHasSave: async () => {
        try {
            const savedState = await AsyncStorage.getItem('game_save');
            set({ hasSave: !!savedState });
        } catch (e) {
            console.error("Failed to check for save game:", e);
            set({ hasSave: false });
        }
    },

    // Settings actions (example)
    setMusicVolume: (volume) => set(state => ({ settings: { ...state.settings, musicVolume: volume } })),
    setSfxVolume: (volume) => set(state => ({ settings: { ...state.settings, sfxVolume: volume } })),
}));

export default useGameStore;
