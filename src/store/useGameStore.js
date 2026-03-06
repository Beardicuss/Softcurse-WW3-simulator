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
import { runNightmareAI, recordAILoss } from '../logic/aiLogic';
import { ADJ, FD, REGIONS } from '../data/mapData';
import { TECH_BY_ID, TECH_NODES, isExcluded, computeTechModifiers } from '../data/techTree';

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
    gameOverReason: null,  // 'military' | 'collapse' | 'nuclear' | 'victory'
    act: 1,               // 1 = Cold War, 2 = Global War, 3 = Nuclear Escalation
    actJustChanged: false, // flips true for one render cycle to trigger banner
    hasSave: false,
    nukeUsedThisTurn: false,
    // Nightmare AI persistent memory — one object per AI faction
    aiMemory: { EAST: {}, CHINA: {} },

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
            gameOverReason: null,
            act: 1,
            actJustChanged: false,
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
                act: state.act,
                aiMemory: state.aiMemory,
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
            atkMods, defMods
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

        // Apply tech cost modifier (Ghost Protocol: –25% unit costs)
        const mods = computeTechModifiers(faction?.unlockedTech || []);
        const costMult = mods.globalCostMult || 1;

        let costFunds = 0, costSupplies = 0, costIndustry = 0;
        if (unitType === 'infantry') {
            costFunds = Math.ceil(50  * costMult); costSupplies = Math.ceil(20  * costMult); costIndustry = 0;
        } else if (unitType === 'armor') {
            costFunds = Math.ceil(150 * costMult); costSupplies = Math.ceil(50  * costMult); costIndustry = 10;
        } else if (unitType === 'air') {
            // Also apply airCostMult (Strike Drones)
            const airMult = costMult * (mods.airCostMult || 1);
            costFunds = Math.ceil(300 * airMult); costSupplies = Math.ceil(100 * airMult); costIndustry = 25;
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
                    gameLog: [`PRODUCTION: ${unitType.toUpperCase()} deployed in ${regionId.toUpperCase()} `, ...state.gameLog].slice(0, 10)
                });
            } else {
                set({ gameLog: [`ERROR: Insufficient Industry in ${regionId.toUpperCase()} `, ...state.gameLog].slice(0, 10) });
            }
        } else {
            set({ gameLog: [`ERROR: Insufficient Funds or Supplies`, ...state.gameLog].slice(0, 10) });
        }
    },

    endTurn: () => {
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

        // 2.7 Dead Hand — if player has NUKE_3 and stability < 20%, auto-retaliate vs biggest attacker
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

        // 3. NIGHTMARE AI PHASE
        const aiFactions = ['EAST', 'CHINA'].filter(f => f !== state.playerFaction);
        const newAIMemory = { ...state.aiMemory };

        aiFactions.forEach(aiKey => {
            const memoryIn = newAIMemory[aiKey] || {};

            const { moves, reinforcements, buildOrders, updatedMemory } =
                runNightmareAI(aiKey, newRegions, newFactions, state.playerFaction, memoryIn);

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
                    aiAtkMods, aiDefMods
                );

                if (win) {
                    const remaining = applyCasualties(
                        { infantry: Math.max(0, from.infantry - 1), armor: from.armor, air: from.air },
                        aDamage
                    );
                    newRegions[m.to]   = { ...to, faction: aiKey, ...remaining, stability: 50 };
                    newRegions[m.from] = { ...from, infantry: 1, armor: 0, air: 0 };
                    newLog.unshift(`STRATEGIC LOSS: ${m.to.toUpperCase()} captured by ${FD[aiKey].short}`);
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
                    infantry: { funds: 50,  supplies: 20  },
                    armor:    { funds: 150, supplies: 50  },
                    air:      { funds: 300, supplies: 100 },
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

        // ── Phase 7: Act Progression ─────────────────────────────────────────
        const totalRegions  = Object.keys(newRegions).length;
        const playerRegions = Object.values(newRegions).filter(r => r.faction === state.playerFaction).length;
        const playerStab    = newFactions[state.playerFaction]?.stability ?? 100;
        const playerNukesLeft = newFactions[state.playerFaction]?.nukes ?? 0;

        // Nuke count across ALL factions (world is going nuclear)
        const totalNukesUsed = Object.values(newRegions).filter(r => r.bombed).length;

        // Act 2 triggers: turn 8+ AND player controls >25% OR any faction has <50% stability
        const anyFactionUnstable = Object.values(newFactions).some(f => (f.stability || 100) < 50);
        let newAct = state.act;
        let actJustChanged = false;

        if (state.act === 1 && (state.turn >= 8 || anyFactionUnstable || playerRegions / totalRegions > 0.35)) {
            newAct = 2;
            actJustChanged = true;
            newLog.unshift('⚔ ACT II: GLOBAL WAR — Full mobilisation declared worldwide.');
        }

        // Act 3 triggers: any nuke used (bombed regions exist) OR turn 20+ with high tension
        if (state.act < 3 && (totalNukesUsed > 0 || state.turn >= 20)) {
            newAct = 3;
            actJustChanged = state.act !== 3;
            if (actJustChanged) newLog.unshift('☢ ACT III: ESCALATION — Nuclear doctrine is now active.');
        }

        // Act modifiers — escalating difficulty
        if (newAct >= 2) {
            // Global war: regions slowly destabilise faster
            Object.keys(newRegions).forEach(rid => {
                const r = newRegions[rid];
                if (r.faction !== state.playerFaction && r.stability > 30) {
                    newRegions[rid] = { ...r, stability: Math.max(30, r.stability - 1) };
                }
            });
        }
        if (newAct === 3) {
            // Nuclear age: all factions get slight income boost (arms race)
            Object.keys(newFactions).forEach(fk => {
                newFactions[fk] = { ...newFactions[fk], funds: (newFactions[fk].funds || 0) + 50 };
            });
        }

        // ── Win Condition ─────────────────────────────────────────────────────
        // Victory: control 60% of regions (campaign mode) or 40% (blitz)
        const winThreshold = state.gameMode === 'blitz' ? 0.40 : 0.60;
        const playerControlPct = playerRegions / totalRegions;

        // Check if any AI faction is eliminated (all regions gone)
        const eastGone  = !Object.values(newRegions).some(r => r.faction === 'EAST');
        const chinaGone = !Object.values(newRegions).some(r => r.faction === 'CHINA');
        const allEnemiesGone = ['EAST', 'CHINA']
            .filter(f => f !== state.playerFaction)
            .every(f => !Object.values(newRegions).some(r => r.faction === f));

        const playerWins = playerControlPct >= winThreshold || allEnemiesGone;

        // ── Defeat Conditions ─────────────────────────────────────────────────
        const militaryDefeat = playerRegions === 0;
        const collapseDefeat = playerStab <= 0;
        // Nuclear annihilation: player got nuked AND has no regions left
        const nuclearDefeat  = militaryDefeat && totalNukesUsed > 3;

        if (militaryDefeat || collapseDefeat || playerWins) {
            let reason = 'military';
            if (playerWins)      reason = 'victory';
            else if (nuclearDefeat)  reason = 'nuclear';
            else if (collapseDefeat) reason = 'collapse';

            set({
                regions: newRegions,
                factions: newFactions,
                act: newAct,
                isGameOver: true,
                gameOverReason: reason,
                gameLog: [
                    reason === 'victory'
                        ? `🏆 VICTORY: ${FD[state.playerFaction].name} achieves world domination in ${state.turn} turns!`
                        : 'CRITICAL FAILURE: Command Authority lost.',
                    ...newLog
                ].slice(0, 10),
            });
            get().saveGame();
        } else {
            set({
                regions: newRegions,
                factions: newFactions,
                gameLog: [`Turn ${state.turn} completed.`, ...newLog].slice(0, 10),
                selectedRegionId: null,
                turn: state.turn + 1,
                date: newDate.getTime(),
                nukeUsedThisTurn: false,
                aiMemory: newAIMemory,
                act: newAct,
                actJustChanged,
            });
            get().saveGame();
        }
        } catch (e) {
            console.error('endTurn crashed:', e);
            set({ gameLog: [`ERROR: Turn processing failed — ${e.message}`, ...get().gameLog].slice(0, 10) });
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
            set({ gameLog: [`NUCLEAR: No warheads in stockpile.`, ...state.gameLog].slice(0, 10) });
            return;
        }

        // One nuke per turn
        if (state.nukeUsedThisTurn) {
            set({ gameLog: [`NUCLEAR: Launch protocol already executed this turn.`, ...state.gameLog].slice(0, 10) });
            return;
        }

        const target = state.regions[targetRegionId];
        if (!target) return;
        if (target.faction === state.playerFaction) {
            set({ gameLog: [`NUCLEAR: Cannot target own territory.`, ...state.gameLog].slice(0, 10) });
            return;
        }
        if (target.faction === 'NEUTRAL') {
            set({ gameLog: [`NUCLEAR: Strategic doctrine prohibits striking neutral regions.`, ...state.gameLog].slice(0, 10) });
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
            gameLog: [
                `☢ NUCLEAR STRIKE: ${targetRegionId.toUpperCase()} obliterated.${captureMsg}${mirvMsg}`,
                ...state.gameLog
            ].slice(0, 10),
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
            set({ gameLog: [`RESEARCH: ${node.name} already active.`, ...state.gameLog].slice(0, 10) });
            return;
        }

        // Check points
        if ((fac.techPoints || 0) < node.cost) {
            set({ gameLog: [`RESEARCH: Insufficient tech points (need ${node.cost}).`, ...state.gameLog].slice(0, 10) });
            return;
        }

        // Check prerequisites
        for (const req of node.requires || []) {
            if (!unlocked.includes(req)) {
                const reqNode = TECH_BY_ID[req];
                set({ gameLog: [`RESEARCH: Requires ${reqNode?.name || req} first.`, ...state.gameLog].slice(0, 10) });
                return;
            }
        }

        // Check mutual exclusion
        if (isExcluded(nodeId, unlocked)) {
            set({ gameLog: [`RESEARCH: Blocked by mutual exclusion with existing tech.`, ...state.gameLog].slice(0, 10) });
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
            gameLog: [`RESEARCH COMPLETE: ${node.name} — ${node.desc}`, ...state.gameLog].slice(0, 10),
        });
    },

    orbitalStrike: (targetRegionId) => {
        const state = get();
        const fac = state.factions[state.playerFaction];
        const mods = computeTechModifiers(fac?.unlockedTech || []);
        if ((mods.orbitalStrikeCharges || 0) < 1) {
            set({ gameLog: [`ORBITAL: No charges available. Research Space tier 3.`, ...state.gameLog].slice(0, 10) });
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
            gameLog: [`ORBITAL STRIKE: Kinetic impact on ${targetRegionId.toUpperCase()}!`, ...state.gameLog].slice(0, 10),
        });
    },

    blackoutRegion: (targetRegionId) => {
        const state = get();
        const fac = state.factions[state.playerFaction];
        const mods = computeTechModifiers(fac?.unlockedTech || []);
        if ((mods.blackoutCharges || 0) < 1) {
            set({ gameLog: [`BLACKOUT: No charges. Research E-War tier 3.`, ...state.gameLog].slice(0, 10) });
            return;
        }
        const target = state.regions[targetRegionId];
        if (!target || target.faction === state.playerFaction) return;

        const newRegions = { ...state.regions };
        newRegions[targetRegionId] = { ...target, blackedOut: true, stability: Math.max(0, (target.stability || 100) - 30) };
        set({
            regions: newRegions,
            gameLog: [`E-WAR BLACKOUT: ${targetRegionId.toUpperCase()} grid offline!`, ...state.gameLog].slice(0, 10),
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
                    aiMemory: parsedState.aiMemory || { EAST: {}, CHINA: {} },
                    gameLog: ['Game loaded successfully!', ...(parsedState.gameLog || [])].slice(0, 10)
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

export default useGameStore;

