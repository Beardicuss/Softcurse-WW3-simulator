/**
 * WW3: GLOBAL COLLAPSE — Campaign Mission System
 *
 * 12 scripted missions that form a narrative arc.
 * Each mission has: triggers, objectives, rewards, and flavour text.
 * Missions unlock in sequence as the player completes them.
 *
 * Mission structure:
 *   id          — unique string
 *   order       — sequence number (1-12)
 *   title / titleRu
 *   briefing / briefingRu — story text shown when mission activates
 *   objectives  — array of { id, descEn, descRu, type, target, count, progress }
 *   reward      — { funds, oil, supplies, techPoints, stability, desc, descRu }
 *   triggerTurn — turn on which mission becomes available (0 = start)
 *   requires    — missionId that must be complete first (or null)
 */

export const CAMPAIGN_MISSIONS = [

    // ── ACT I: SPARK ──────────────────────────────────────────────────────────

    {
        id: 'mission_01',
        order: 1,
        title:     'First Blood',
        titleRu:   'Первая кровь',
        briefing:  'Intelligence reports enemy forces massing on your border. Establish a forward position before they do. Capture 2 regions to secure your perimeter.',
        briefingRu:'Разведка сообщает о концентрации войск на границе. Займите выгодные позиции первыми. Захватите 2 региона для закрепления периметра.',
        triggerTurn: 1,
        requires: null,
        objectives: [
            {
                id: 'obj_01_capture',
                descEn: 'Capture 2 regions',
                descRu: 'Захватить 2 региона',
                type: 'capture_total',
                target: 2,
                progress: 0,
            }
        ],
        reward: {
            funds: 300,
            oil: 100,
            supplies: 200,
            techPoints: 0,
            stability: 10,
            desc:   '+300 Funds, +100 Oil, +10 Stability',
            descRu: '+300 Средства, +100 Нефть, +10 Стабильность',
        }
    },

    {
        id: 'mission_02',
        order: 2,
        title:     'Industrial Backbone',
        titleRu:   'Промышленный хребет',
        briefing:  'Our war machine needs feeding. Take control of an industrial region and build your first armoured brigade. Steel wins wars.',
        briefingRu:'Наша военная машина требует питания. Захватите промышленный регион и постройте первую бронебригаду. Сталь решает исход войн.',
        triggerTurn: 3,
        requires: 'mission_01',
        objectives: [
            {
                id: 'obj_02_industry',
                descEn: 'Own a region with Industry ≥ 15',
                descRu: 'Владеть регионом с промышленностью ≥ 15',
                type: 'own_region_industry',
                target: 15,
                progress: 0,
            },
            {
                id: 'obj_02_armor',
                descEn: 'Build 2 Armor units',
                descRu: 'Построить 2 бронеединицы',
                type: 'build_unit_armor',
                target: 2,
                progress: 0,
            }
        ],
        reward: {
            funds: 400,
            oil: 150,
            supplies: 0,
            techPoints: 1,
            stability: 0,
            desc:   '+400 Funds, +150 Oil, +1 Tech Point',
            descRu: '+400 Средства, +150 Нефть, +1 Науч. очко',
        }
    },

    {
        id: 'mission_03',
        order: 3,
        title:     'Intelligence Network',
        titleRu:   'Разведывательная сеть',
        briefing:  'We are fighting blind. Establish intelligence operations — use your spy operatives to reveal enemy positions and sabotage at least one enemy facility.',
        briefingRu:'Мы воюем вслепую. Разверните разведывательные операции — используйте агентов для раскрытия позиций врага и диверсии хотя бы на одном объекте.',
        triggerTurn: 5,
        requires: 'mission_02',
        objectives: [
            {
                id: 'obj_03_reveal',
                descEn: 'Use Spy Reveal once',
                descRu: 'Использовать разведку 1 раз',
                type: 'spy_action',
                target: 1,
                progress: 0,
            },
            {
                id: 'obj_03_sabotage',
                descEn: 'Sabotage 1 enemy region',
                descRu: 'Провести диверсию в 1 регионе врага',
                type: 'spy_sabotage',
                target: 1,
                progress: 0,
            }
        ],
        reward: {
            funds: 200,
            oil: 0,
            supplies: 300,
            techPoints: 1,
            stability: 5,
            desc:   '+200 Funds, +300 Supplies, +1 Tech Point',
            descRu: '+200 Средства, +300 Снабжение, +1 Науч. очко',
        }
    },

    {
        id: 'mission_04',
        order: 4,
        title:     'Air Superiority',
        titleRu:   'Господство в воздухе',
        briefing:  'Enemy air forces are disrupting supply lines. Deploy 3 air squadrons and establish control over a strategic region. The sky belongs to us.',
        briefingRu:'Авиация противника нарушает линии снабжения. Разверните 3 авиаэскадрильи и установите контроль над стратегическим регионом. Небо принадлежит нам.',
        triggerTurn: 7,
        requires: 'mission_03',
        objectives: [
            {
                id: 'obj_04_air',
                descEn: 'Have 3 Air units deployed total',
                descRu: 'Иметь 3 авиаединицы развёрнутыми',
                type: 'total_unit_air',
                target: 3,
                progress: 0,
            },
            {
                id: 'obj_04_strategic',
                descEn: 'Control 1 Strategic region',
                descRu: 'Контролировать 1 стратегический регион',
                type: 'own_strategic',
                target: 1,
                progress: 0,
            }
        ],
        reward: {
            funds: 350,
            oil: 200,
            supplies: 100,
            techPoints: 1,
            stability: 8,
            desc:   '+350 Funds, +200 Oil, +1 Tech Point',
            descRu: '+350 Средства, +200 Нефть, +1 Науч. очко',
        }
    },

    // ── ACT II: ESCALATION ────────────────────────────────────────────────────

    {
        id: 'mission_05',
        order: 5,
        title:     'Naval Projection',
        titleRu:   'Морская проекция',
        briefing:  'Enemy fleets are choking our sea lanes. Deploy naval forces from a coastal region and break the blockade. The oceans are the arteries of war.',
        briefingRu:'Флот врага блокирует наши морские коридоры. Разверните морские силы из прибрежного региона и прорвите блокаду. Океаны — это артерии войны.',
        triggerTurn: 12,
        requires: 'mission_04',
        objectives: [
            {
                id: 'obj_05_naval',
                descEn: 'Build 1 Naval unit (Destroyer/Sub/Carrier)',
                descRu: 'Построить 1 морскую единицу',
                type: 'build_naval',
                target: 1,
                progress: 0,
            },
            {
                id: 'obj_05_coastal',
                descEn: 'Own 2 coastal regions',
                descRu: 'Владеть 2 прибрежными регионами',
                type: 'own_coastal',
                target: 2,
                progress: 0,
            }
        ],
        reward: {
            funds: 500,
            oil: 300,
            supplies: 200,
            techPoints: 2,
            stability: 0,
            desc:   '+500 Funds, +300 Oil, +2 Tech Points',
            descRu: '+500 Средства, +300 Нефть, +2 Науч. очка',
        }
    },

    {
        id: 'mission_06',
        order: 6,
        title:     'Technology Race',
        titleRu:   'Технологическая гонка',
        briefing:  'Our adversaries are outpacing us in weapons technology. Invest heavily in research and unlock two technology nodes. Superiority is built in the lab.',
        briefingRu:'Противники опережают нас в военных технологиях. Вложите ресурсы в исследования и разблокируйте два узла технологий. Превосходство строится в лаборатории.',
        triggerTurn: 12,
        requires: 'mission_04',
        objectives: [
            {
                id: 'obj_06_tech',
                descEn: 'Unlock 2 Technology nodes',
                descRu: 'Разблокировать 2 узла технологий',
                type: 'unlock_tech',
                target: 2,
                progress: 0,
            }
        ],
        reward: {
            funds: 200,
            oil: 0,
            supplies: 0,
            techPoints: 3,
            stability: 5,
            desc:   '+200 Funds, +3 Tech Points',
            descRu: '+200 Средства, +3 Науч. очка',
        }
    },

    {
        id: 'mission_07',
        order: 7,
        title:     'Hold the Line',
        titleRu:   'Удержать фронт',
        briefing:  'Enemy forces are pressing hard. Maintain stability above 60 for 5 consecutive turns. A nation that collapses from within cannot win abroad.',
        briefingRu:'Силы врага давят по всем фронтам. Удерживайте стабильность выше 60 в течение 5 ходов подряд. Нация, рухнувшая изнутри, не победит снаружи.',
        triggerTurn: 15,
        requires: 'mission_05',
        objectives: [
            {
                id: 'obj_07_stability',
                descEn: 'Maintain Stability ≥ 60 for 5 turns',
                descRu: 'Удержать стабильность ≥ 60 в течение 5 ходов',
                type: 'stability_turns',
                target: 5,
                progress: 0,
            }
        ],
        reward: {
            funds: 400,
            oil: 100,
            supplies: 400,
            techPoints: 0,
            stability: 15,
            desc:   '+400 Funds, +400 Supplies, +15 Stability',
            descRu: '+400 Средства, +400 Снабжение, +15 Стабильность',
        }
    },

    {
        id: 'mission_08',
        order: 8,
        title:     'Economic Strangulation',
        titleRu:   'Экономическое удушение',
        briefing:  'Cut the enemy off at the source. Apply cyber sanctions against both rival factions and watch their war machine grind to a halt.',
        briefingRu:'Отрежьте врага от источников. Введите кибер-санкции против обеих фракций-соперников и наблюдайте, как их военная машина встаёт.',
        triggerTurn: 18,
        requires: 'mission_06',
        objectives: [
            {
                id: 'obj_08_sanction',
                descEn: 'Apply Sanctions 2 times',
                descRu: 'Применить санкции 2 раза',
                type: 'use_sanction',
                target: 2,
                progress: 0,
            }
        ],
        reward: {
            funds: 600,
            oil: 0,
            supplies: 0,
            techPoints: 1,
            stability: 0,
            desc:   '+600 Funds, +1 Tech Point',
            descRu: '+600 Средства, +1 Науч. очко',
        }
    },

    // ── ACT III: ENDGAME ──────────────────────────────────────────────────────

    {
        id: 'mission_09',
        order: 9,
        title:     'Total War',
        titleRu:   'Тотальная война',
        briefing:  'The gloves are off. Reach Act II and control at least 10 regions. This is no longer a border dispute — it is a war for survival.',
        briefingRu:'Рукавицы сброшены. Достигните Акта II и контролируйте не менее 10 регионов. Это уже не пограничный спор — это война за выживание.',
        triggerTurn: 20,
        requires: 'mission_07',
        objectives: [
            {
                id: 'obj_09_regions',
                descEn: 'Control 10 regions simultaneously',
                descRu: 'Контролировать 10 регионов одновременно',
                type: 'own_regions_total',
                target: 10,
                progress: 0,
            },
            {
                id: 'obj_09_act',
                descEn: 'Reach Act II',
                descRu: 'Достичь Акта II',
                type: 'reach_act',
                target: 2,
                progress: 0,
            }
        ],
        reward: {
            funds: 800,
            oil: 400,
            supplies: 400,
            techPoints: 2,
            stability: 0,
            desc:   '+800 Funds, +400 Oil, +2 Tech Points',
            descRu: '+800 Средства, +400 Нефть, +2 Науч. очка',
        }
    },

    {
        id: 'mission_10',
        order: 10,
        title:     'Nuclear Deterrence',
        titleRu:   'Ядерное сдерживание',
        briefing:  'The enemy is rattling their nuclear arsenal. Ensure your stability stays above 40 while surviving to turn 25. Deterrence is a game of nerves.',
        briefingRu:'Враг бряцает ядерным оружием. Удерживайте стабильность выше 40 до 25-го хода. Сдерживание — игра нервов.',
        triggerTurn: 22,
        requires: 'mission_08',
        objectives: [
            {
                id: 'obj_10_survive',
                descEn: 'Survive to Turn 25',
                descRu: 'Дожить до хода 25',
                type: 'survive_turn',
                target: 25,
                progress: 0,
            },
            {
                id: 'obj_10_stability',
                descEn: 'Stability above 40 at Turn 25',
                descRu: 'Стабильность выше 40 к ходу 25',
                type: 'stability_at_turn',
                target: 40,
                progress: 0,
            }
        ],
        reward: {
            funds: 500,
            oil: 200,
            supplies: 200,
            techPoints: 2,
            stability: 20,
            desc:   '+500 Funds, +2 Tech Points, +20 Stability',
            descRu: '+500 Средства, +2 Науч. очка, +20 Стабильность',
        }
    },

    {
        id: 'mission_11',
        order: 11,
        title:     'The Great Offensive',
        titleRu:   'Великое наступление',
        briefing:  'The time for consolidation is over. Launch a decisive offensive — capture 5 regions within 8 turns. History remembers those who act, not those who wait.',
        briefingRu:'Время консолидации прошло. Начните решающее наступление — захватите 5 регионов за 8 ходов. История помнит тех, кто действует, а не ждёт.',
        triggerTurn: 25,
        requires: 'mission_09',
        objectives: [
            {
                id: 'obj_11_blitz',
                descEn: 'Capture 5 regions within 8 turns',
                descRu: 'Захватить 5 регионов за 8 ходов',
                type: 'capture_in_turns',
                target: 5,
                turnsAllowed: 8,
                progress: 0,
                startTurn: null,
            }
        ],
        reward: {
            funds: 1000,
            oil: 500,
            supplies: 500,
            techPoints: 3,
            stability: 10,
            desc:   '+1000 Funds, +500 Oil, +3 Tech Points',
            descRu: '+1000 Средства, +500 Нефть, +3 Науч. очка',
        }
    },

    {
        id: 'mission_12',
        order: 12,
        title:     'World Domination',
        titleRu:   'Мировое господство',
        briefing:  'The endgame is here. Crush both rival factions and bring the world under your command. Control 60% of all regions. This is what you were built for.',
        briefingRu:'Финал близок. Сокрушите обе фракции-соперника и поставьте мир под своё командование. Контролируйте 60% всех регионов. Для этого вы и созданы.',
        triggerTurn: 30,
        requires: 'mission_10',
        objectives: [
            {
                id: 'obj_12_domination',
                descEn: 'Control 60% of all regions',
                descRu: 'Контролировать 60% всех регионов',
                type: 'domination',
                target: 60,
                progress: 0,
            }
        ],
        reward: {
            funds: 0,
            oil: 0,
            supplies: 0,
            techPoints: 0,
            stability: 0,
            desc:   'Victory — Campaign Complete',
            descRu: 'Победа — Кампания завершена',
        }
    },

];

// ── Mission Progress Evaluator ─────────────────────────────────────────────────

import { REGIONS } from '../data/mapData';
import { COASTAL_REGIONS } from './gameLogic';

export function evaluateMissions(state, missionProgress, trackedStats) {
    const {
        regions, factions, playerFaction,
        turn, actPhase,
    } = state;

    const newProgress = { ...missionProgress };
    const completedNow = [];
    const rewards = [];

    const lang = state.settings?.language || 'en';

    CAMPAIGN_MISSIONS.forEach(mission => {
        const prog = newProgress[mission.id] || {
            status: 'locked',
            objectiveProgress: {},
        };

        // Check unlock
        if (prog.status === 'locked') {
            const turnOk = turn >= mission.triggerTurn;
            const reqOk  = !mission.requires || newProgress[mission.requires]?.status === 'complete';
            if (turnOk && reqOk) {
                prog.status = 'active';
                prog.activatedTurn = turn;
                prog.objectiveProgress = {};
                mission.objectives.forEach(obj => {
                    prog.objectiveProgress[obj.id] = 0;
                    if (obj.type === 'capture_in_turns') {
                        prog.objectiveProgress[`${obj.id}_startTurn`] = turn;
                    }
                });
            }
        }

        if (prog.status !== 'active') {
            newProgress[mission.id] = prog;
            return;
        }

        // Evaluate each objective
        const ownedRegions = Object.entries(regions).filter(([, r]) => r.faction === playerFaction);
        const totalRegions = Object.keys(regions).length;
        const fac = factions[playerFaction] || {};

        let allDone = true;

        mission.objectives.forEach(obj => {
            let val = prog.objectiveProgress[obj.id] || 0;
            let done = false;

            switch (obj.type) {
                case 'capture_total':
                    val = ownedRegions.length;
                    done = val >= obj.target;
                    break;
                case 'own_regions_total':
                    val = ownedRegions.length;
                    done = val >= obj.target;
                    break;
                case 'own_region_industry':
                    val = ownedRegions.some(([, r]) => (r.industry || 0) >= obj.target) ? obj.target : 0;
                    done = val >= obj.target;
                    break;
                case 'build_unit_armor':
                    val = trackedStats?.builtArmor || 0;
                    done = val >= obj.target;
                    break;
                case 'total_unit_air':
                    val = ownedRegions.reduce((s, [, r]) => s + (r.air || 0), 0);
                    done = val >= obj.target;
                    break;
                case 'own_strategic':
                    val = ownedRegions.filter(([id]) => REGIONS.find(r => r.id === id)?.strategic).length;
                    done = val >= obj.target;
                    break;
                case 'spy_action':
                    val = trackedStats?.spyReveals || 0;
                    done = val >= obj.target;
                    break;
                case 'spy_sabotage':
                    val = trackedStats?.spySabotages || 0;
                    done = val >= obj.target;
                    break;
                case 'build_naval':
                    val = trackedStats?.builtNaval || 0;
                    done = val >= obj.target;
                    break;
                case 'own_coastal':
                    val = ownedRegions.filter(([id]) => COASTAL_REGIONS.has(id)).length;
                    done = val >= obj.target;
                    break;
                case 'unlock_tech':
                    val = (fac.unlockedTech || []).length;
                    done = val >= obj.target;
                    break;
                case 'stability_turns':
                    val = (fac.stability || 0) >= 60
                        ? Math.min(obj.target, (prog.objectiveProgress[obj.id] || 0) + 1)
                        : 0;
                    done = val >= obj.target;
                    break;
                case 'use_sanction':
                    val = trackedStats?.sanctionsUsed || 0;
                    done = val >= obj.target;
                    break;
                case 'reach_act':
                    val = actPhase;
                    done = val >= obj.target;
                    break;
                case 'survive_turn':
                    val = turn;
                    done = val >= obj.target;
                    break;
                case 'stability_at_turn':
                    val = turn >= obj.target ? (fac.stability || 0) : 0;
                    done = turn >= 25 && (fac.stability || 0) >= obj.target;
                    break;
                case 'capture_in_turns': {
                    const startT = prog.objectiveProgress[`${obj.id}_startTurn`] || turn;
                    const elapsed = turn - startT;
                    val = trackedStats?.capturesSinceTurn?.[startT] || 0;
                    done = val >= obj.target && elapsed <= (obj.turnsAllowed || 8);
                    if (elapsed > (obj.turnsAllowed || 8) && !done) {
                        // Failed — reset
                        prog.objectiveProgress[`${obj.id}_startTurn`] = turn;
                        val = 0;
                    }
                    break;
                }
                case 'domination': {
                    const pct = Math.floor((ownedRegions.length / totalRegions) * 100);
                    val = pct;
                    done = pct >= obj.target;
                    break;
                }
            }

            prog.objectiveProgress[obj.id] = val;
            if (!done) allDone = false;
        });

        if (allDone) {
            prog.status = 'complete';
            prog.completedTurn = turn;
            completedNow.push(mission);
            rewards.push({ missionId: mission.id, reward: mission.reward });
        }

        newProgress[mission.id] = prog;
    });

    return { newProgress, completedNow, rewards };
}

// Apply mission rewards to factions state
export function applyMissionReward(factions, playerFaction, reward) {
    const newFactions = { ...factions };
    const fac = { ...newFactions[playerFaction] };
    fac.funds      = (fac.funds      || 0) + (reward.funds      || 0);
    fac.oil        = (fac.oil        || 0) + (reward.oil        || 0);
    fac.supplies   = (fac.supplies   || 0) + (reward.supplies   || 0);
    fac.techPoints = (fac.techPoints || 0) + (reward.techPoints || 0);
    fac.stability  = Math.min(100, (fac.stability || 100) + (reward.stability || 0));
    newFactions[playerFaction] = fac;
    return newFactions;
}
