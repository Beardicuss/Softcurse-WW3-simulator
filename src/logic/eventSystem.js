/**
 * WW3: GLOBAL COLLAPSE — Event & Narrative System
 *
 * Each event has:
 *   id        — unique string
 *   title     — short name shown in log
 *   desc      — flavour text
 *   severity  — 'low' | 'medium' | 'high' | 'critical'
 *   trigger   — function(state) → boolean  (when can this fire?)
 *   weight    — relative probability (higher = more likely when eligible)
 *   effect    — function(state) → { factions, regions, log }
 *   cooldown  — turns before this event can fire again (default 10)
 *   oneTime   — if true, fires only once per campaign
 */

import { ADJ } from '../data/mapData';

// ─── Helper ───────────────────────────────────────────────────────────────────

function ownedBy(regions, faction) {
    return Object.entries(regions).filter(([, r]) => r.faction === faction);
}

function randomOwned(regions, faction) {
    const list = ownedBy(regions, faction);
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

// ─── Event Definitions ────────────────────────────────────────────────────────

export const WORLD_EVENTS = [

    // ── ECONOMIC CRISIS ──────────────────────────────────────────────────────

    {
        id: 'oil_price_spike',
        title: 'Global Oil Price Spike',
        desc: 'International markets reel as oil prices triple overnight. All factions\' operational costs surge. How do you respond?',
        severity: 'high',
        weight: 8,
        cooldown: 15,
        trigger: (state) => state.turn > 5,
        choices: [
            {
                id: 'oil_subsidize',
                label: '💰 Subsidize fuel costs',
                desc: '-$400 but protect your oil reserves',
                effect: ({ factions, regions, playerFaction }) => {
                    const newFactions = { ...factions };
                    Object.keys(newFactions).forEach(fk => {
                        newFactions[fk] = { ...newFactions[fk], oil: Math.max(0, (newFactions[fk].oil || 0) - 120) };
                    });
                    newFactions[playerFaction] = { ...newFactions[playerFaction],
                        oil: (factions[playerFaction].oil || 0),
                        funds: Math.max(0, (newFactions[playerFaction].funds || 0) - 400),
                    };
                    return { factions: newFactions, regions, log: '📈 OIL CRISIS: You subsidize fuel costs (-$400) — your oil reserves protected.' };
                },
            },
            {
                id: 'oil_ration',
                label: '⚙ Ration military fuel',
                desc: 'Stability -8 but save funds',
                effect: ({ factions, regions, playerFaction }) => {
                    const newFactions = { ...factions };
                    Object.keys(newFactions).forEach(fk => {
                        newFactions[fk] = { ...newFactions[fk], oil: Math.max(0, (newFactions[fk].oil || 0) - 120) };
                    });
                    newFactions[playerFaction] = { ...newFactions[playerFaction],
                        stability: Math.max(0, (newFactions[playerFaction].stability || 100) - 8),
                    };
                    return { factions: newFactions, regions, log: '📈 OIL CRISIS: Rationing imposed — stability -8 but funds preserved.' };
                },
            },
            {
                id: 'oil_profiteer',
                label: '🛢 Sell strategic reserves',
                desc: '+$600 but oil -200',
                effect: ({ factions, regions, playerFaction }) => {
                    const newFactions = { ...factions };
                    Object.keys(newFactions).forEach(fk => {
                        newFactions[fk] = { ...newFactions[fk], oil: Math.max(0, (newFactions[fk].oil || 0) - 120) };
                    });
                    newFactions[playerFaction] = { ...newFactions[playerFaction],
                        oil: Math.max(0, (factions[playerFaction].oil || 0) - 200),
                        funds: (newFactions[playerFaction].funds || 0) + 600,
                    };
                    return { factions: newFactions, regions, log: '📈 OIL CRISIS: You sell reserves for profit — +$600 but oil critically depleted.' };
                },
            },
        ],
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            Object.keys(newFactions).forEach(fk => {
                newFactions[fk] = { ...newFactions[fk], oil: Math.max(0, (newFactions[fk].oil || 0) - 120) };
            });
            return { factions: newFactions, regions, log: '📈 OIL CRISIS: Global oil prices surge — all factions lose 120 oil reserves.' };
        },
    },

    {
        id: 'economic_sanctions',
        title: 'International Sanctions',
        desc: 'The UN votes to impose sweeping economic sanctions against the leading aggressor faction.',
        severity: 'high',
        weight: 6,
        cooldown: 20,
        trigger: (state) => state.turn > 8 && state.actPhase >= 2,
        effect: ({ factions, regions, playerFaction }) => {
            // Sanction the faction with most regions (the aggressor)
            const counts = {};
            Object.values(regions).forEach(r => { if (r.faction !== 'NEUTRAL') counts[r.faction] = (counts[r.faction] || 0) + 1; });
            const target = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
            if (!target) return { factions, regions, log: 'SANCTIONS: No valid target.' };
            const newFactions = { ...factions };
            newFactions[target] = { ...newFactions[target], funds: Math.max(0, (newFactions[target].funds || 0) - 400) };
            return {
                factions: newFactions,
                regions,
                log: `🏛 UN SANCTIONS: ${target} sanctioned — loses $400 funds.`,
            };
        },
    },

    {
        id: 'black_market_windfall',
        title: 'Black Market Windfall',
        desc: 'A shadow network of arms dealers floods the market with cheap supplies.',
        severity: 'low',
        weight: 5,
        cooldown: 12,
        trigger: (state) => state.turn > 3,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                supplies: (newFactions[playerFaction].supplies || 0) + 200,
            };
            return {
                factions: newFactions,
                regions,
                log: '💰 BLACK MARKET: Cheap arms supply — gained 200 Supplies.',
            };
        },
    },

    {
        id: 'industrial_strike',
        title: 'Industrial Workers Strike',
        desc: 'Exhausted factory workers across multiple regions down tools, halting production.',
        severity: 'medium',
        weight: 7,
        cooldown: 12,
        trigger: (state) => (state.factions[state.playerFaction]?.stability || 100) < 70,
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            const owned = ownedBy(newRegions, playerFaction);
            let hit = 0;
            owned.forEach(([id, r]) => {
                if (r.industry > 5 && Math.random() < 0.4) {
                    newRegions[id] = { ...r, industry: Math.max(0, r.industry - 8) };
                    hit++;
                }
            });
            return {
                factions,
                regions: newRegions,
                log: `🔧 STRIKE: Industrial action hits ${hit} production centres — industry reduced.`,
            };
        },
    },

    // ── MILITARY EVENTS ───────────────────────────────────────────────────────

    {
        id: 'military_defection',
        title: 'Mass Military Defection',
        desc: 'Low morale causes entire units to abandon their posts or defect to the enemy.',
        severity: 'high',
        weight: 5,
        cooldown: 15,
        trigger: (state) => (state.factions[state.playerFaction]?.stability || 100) < 50,
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            const owned = ownedBy(newRegions, playerFaction);
            let lost = 0;
            owned.forEach(([id, r]) => {
                if (Math.random() < 0.35) {
                    const defectors = Math.max(1, Math.floor((r.infantry || 0) * 0.2));
                    newRegions[id] = { ...r, infantry: Math.max(0, (r.infantry || 0) - defectors) };
                    lost += defectors;
                }
            });
            return {
                factions,
                regions: newRegions,
                log: `💀 DEFECTION: ${lost} infantry units abandon their posts due to collapsing morale.`,
            };
        },
    },

    {
        id: 'guerrilla_uprising',
        title: 'Guerrilla Uprising',
        desc: 'Occupied populations turn to armed resistance, spawning rebel forces in recently conquered territory.',
        severity: 'medium',
        weight: 8,
        cooldown: 10,
        trigger: (state) => {
            const aiRegions = Object.values(state.regions).filter(r => r.faction !== state.playerFaction && r.faction !== 'NEUTRAL');
            return aiRegions.length > 8;
        },
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            // Spawn rebels in a random AI-held region (turns it neutral with garrison)
            const aiOwned = Object.entries(regions).filter(([, r]) => r.faction !== playerFaction && r.faction !== 'NEUTRAL');
            if (aiOwned.length === 0) return { factions, regions, log: '' };
            const [id, r] = aiOwned[Math.floor(Math.random() * aiOwned.length)];
            newRegions[id] = { ...r, faction: 'NEUTRAL', infantry: 8, armor: 0, air: 0, stability: 40 };
            return {
                factions,
                regions: newRegions,
                log: `⚡ UPRISING: Guerrilla forces seize ${id.toUpperCase()} — region reverts to contested.`,
            };
        },
    },

    {
        id: 'arms_cache_discovered',
        title: 'Hidden Arms Cache Discovered',
        desc: 'Intelligence uncovers a vast stockpile of pre-war munitions buried in your territory.',
        severity: 'low',
        weight: 6,
        cooldown: 18,
        oneTime: false,
        trigger: (state) => Object.keys(ownedBy(state.regions, state.playerFaction)).length >= 3,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                supplies: (newFactions[playerFaction].supplies || 0) + 150,
                funds: (newFactions[playerFaction].funds || 0) + 100,
            };
            return {
                factions: newFactions,
                regions,
                log: '🎁 CACHE: Hidden arms cache found — +150 Supplies, +100 Funds.',
            };
        },
    },

    {
        id: 'nuclear_scare',
        title: 'Nuclear False Alarm',
        desc: 'A radar malfunction triggers a full nuclear alert. Global panic destabilises every faction.',
        severity: 'critical',
        weight: 3,
        cooldown: 25,
        oneTime: true,
        trigger: (state) => state.actPhase >= 2 && state.turn > 20,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            Object.keys(newFactions).forEach(fk => {
                newFactions[fk] = { ...newFactions[fk], stability: clamp((newFactions[fk].stability || 100) - 15, 5, 100) };
            });
            return {
                factions: newFactions,
                regions,
                log: '☢ FALSE ALARM: Nuclear alert triggered by radar glitch — all factions lose 15 stability.',
            };
        },
    },

    // ── POLITICAL EVENTS ──────────────────────────────────────────────────────

    {
        id: 'coup_attempt',
        title: 'Coup Attempt',
        desc: 'Hardliners within the military attempt to seize control of the government.',
        severity: 'critical',
        weight: 4,
        cooldown: 20,
        trigger: (state) => (state.factions[state.playerFaction]?.stability || 100) < 40,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                stability: clamp((newFactions[playerFaction].stability || 100) - 25, 5, 100),
                funds: Math.max(0, (newFactions[playerFaction].funds || 0) - 300),
            };
            return {
                factions: newFactions,
                regions,
                log: '🔫 COUP: Internal power struggle erupts — stability -25, funds -300.',
            };
        },
    },

    {
        id: 'popular_rally',
        title: 'Victory Rally',
        desc: 'Recent military successes inspire a wave of patriotic fervour across the homeland.',
        severity: 'low',
        weight: 7,
        cooldown: 10,
        trigger: (state) => {
            const pCount = Object.values(state.regions).filter(r => r.faction === state.playerFaction).length;
            return pCount >= 5 && (state.factions[state.playerFaction]?.stability || 100) > 50;
        },
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                stability: clamp((newFactions[playerFaction].stability || 100) + 12, 0, 100),
            };
            return {
                factions: newFactions,
                regions,
                log: '🎉 RALLY: Victory parade boosts national morale — +12 stability.',
            };
        },
    },

    {
        id: 'war_crimes_tribunal',
        title: 'War Crimes Investigation',
        desc: 'International courts launch an investigation into atrocities committed during the conflict.',
        severity: 'medium',
        weight: 5,
        cooldown: 20,
        trigger: (state) => state.actPhase >= 2 && Object.values(state.regions).filter(r => r.bombed).length >= 2,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                stability: clamp((newFactions[playerFaction].stability || 100) - 10, 0, 100),
                funds: Math.max(0, (newFactions[playerFaction].funds || 0) - 200),
            };
            return {
                factions: newFactions,
                regions,
                log: '⚖ TRIBUNAL: War crimes investigation launched — -10 stability, -200 funds.',
            };
        },
    },

    {
        id: 'diplomatic_breakthrough',
        title: 'Secret Diplomatic Channel',
        desc: 'Back-channel talks yield a temporary ceasefire with one AI faction.',
        severity: 'medium',
        weight: 5,
        cooldown: 20,
        trigger: (state) => state.actPhase === 1 && state.turn > 6,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            // Boost one AI faction stability (they're less aggressive temporarily)
            const aiFaction = ['EAST', 'CHINA'].find(f => f !== playerFaction) || 'EAST';
            newFactions[aiFaction] = {
                ...newFactions[aiFaction],
                stability: clamp((newFactions[aiFaction].stability || 100) + 10, 0, 100),
            };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                funds: (newFactions[playerFaction].funds || 0) + 150,
            };
            return {
                factions: newFactions,
                regions,
                log: `🤝 DIPLOMACY: Secret talks with ${aiFaction} — +150 funds, tensions eased.`,
            };
        },
    },

    // ── NATURAL / INFRASTRUCTURE ──────────────────────────────────────────────

    {
        id: 'infrastructure_collapse',
        title: 'Critical Infrastructure Failure',
        desc: 'Power grid failures cascade across multiple regions, shutting down production.',
        severity: 'high',
        weight: 6,
        cooldown: 15,
        trigger: (state) => state.turn > 10,
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            const owned = ownedBy(newRegions, playerFaction);
            let count = 0;
            owned.forEach(([id, r]) => {
                if (Math.random() < 0.25) {
                    newRegions[id] = { ...r, industry: Math.max(0, (r.industry || 0) - 5) };
                    count++;
                }
            });
            return {
                factions,
                regions: newRegions,
                log: `⚡ BLACKOUT: Infrastructure failure hits ${count} regions — industry reduced.`,
            };
        },
    },

    {
        id: 'disease_outbreak',
        title: 'Disease Outbreak in Frontline Zones',
        desc: 'Unsanitary conditions breed a fast-moving illness that sweeps through forward-deployed units.',
        severity: 'medium',
        weight: 5,
        cooldown: 18,
        trigger: (state) => state.actPhase >= 2,
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            const owned = ownedBy(newRegions, playerFaction);
            let casualties = 0;
            owned.forEach(([id, r]) => {
                if (r.isolated || Math.random() < 0.2) {
                    const loss = Math.max(1, Math.floor((r.infantry || 0) * 0.15));
                    newRegions[id] = { ...r, infantry: Math.max(0, (r.infantry || 0) - loss) };
                    casualties += loss;
                }
            });
            return {
                factions,
                regions: newRegions,
                log: `🦠 OUTBREAK: Disease sweeps frontlines — ${casualties} infantry casualties.`,
            };
        },
    },

    {
        id: 'refugee_crisis',
        title: 'Refugee Crisis',
        desc: 'Millions flee conflict zones, straining your economy and domestic stability.',
        severity: 'medium',
        weight: 6,
        cooldown: 15,
        trigger: (state) => state.actPhase >= 2 && Object.values(state.regions).filter(r => r.faction !== state.playerFaction && r.faction !== 'NEUTRAL').length > 10,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                funds: Math.max(0, (newFactions[playerFaction].funds || 0) - 150),
                stability: clamp((newFactions[playerFaction].stability || 100) - 6, 0, 100),
            };
            return {
                factions: newFactions,
                regions,
                log: '🚶 REFUGEES: Mass displacement strains economy — -150 funds, -6 stability.',
            };
        },
    },

    {
        id: 'tech_espionage',
        title: 'Technology Espionage',
        desc: 'Enemy agents steal classified research data, accelerating their military development.',
        severity: 'medium',
        weight: 5,
        cooldown: 15,
        trigger: (state) => (state.factions[state.playerFaction]?.techPoints || 0) > 2,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            const stolen = Math.min(2, newFactions[playerFaction].techPoints || 0);
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                techPoints: Math.max(0, (newFactions[playerFaction].techPoints || 0) - stolen),
            };
            return {
                factions: newFactions,
                regions,
                log: `🕵 ESPIONAGE: Enemy agents steal ${stolen} tech points from your research programme.`,
            };
        },
    },

    // ── POSITIVE EVENTS ───────────────────────────────────────────────────────

    {
        id: 'foreign_aid',
        title: 'Emergency Foreign Aid',
        desc: 'Allied nations send emergency economic assistance to bolster your war effort.',
        severity: 'low',
        weight: 5,
        cooldown: 20,
        trigger: (state) => (state.factions[state.playerFaction]?.funds || 0) < 200 && state.actPhase <= 2,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                funds: (newFactions[playerFaction].funds || 0) + 350,
                supplies: (newFactions[playerFaction].supplies || 0) + 100,
            };
            return {
                factions: newFactions,
                regions,
                log: '📦 AID: Emergency foreign aid arrives — +350 funds, +100 supplies.',
            };
        },
    },

    {
        id: 'oil_discovery',
        title: 'Strategic Oil Discovery',
        desc: 'Geologists confirm massive untapped oil reserves beneath your territory.',
        severity: 'low',
        weight: 4,
        cooldown: 30,
        oneTime: true,
        trigger: (state) => Object.values(state.regions).filter(r => r.faction === state.playerFaction).length >= 4,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                oil: (newFactions[playerFaction].oil || 0) + 400,
            };
            return {
                factions: newFactions,
                regions,
                log: '🛢 DISCOVERY: Massive oil reserve found — +400 Oil.',
            };
        },
    },

    {
        id: 'veteran_bonus',
        title: 'Battle-Hardened Veterans',
        desc: 'Surviving soldiers become elite warriors through relentless combat experience.',
        severity: 'low',
        weight: 6,
        cooldown: 12,
        trigger: (state) => state.turn > 15 && state.actPhase >= 2,
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            const owned = ownedBy(newRegions, playerFaction);
            let boosted = 0;
            owned.forEach(([id, r]) => {
                if ((r.infantry || 0) >= 5 && Math.random() < 0.3) {
                    newRegions[id] = { ...r, infantry: (r.infantry || 0) + 2 };
                    boosted++;
                }
            });
            return {
                factions,
                regions: newRegions,
                log: `🎖 VETERANS: Battle-hardened troops reinforced in ${boosted} regions (+2 infantry each).`,
            };
        },
    },

];

// ─── Event Runner ─────────────────────────────────────────────────────────────

/**
 * processWorldEvents(state, firedEvents)
 * Runs at the end of each turn, fires 0–2 eligible events.
 *
 * @param state       - current game state snapshot
 * @param firedEvents - Map<eventId, lastTurnFired> for cooldown tracking
 * @returns { updatedFactions, updatedRegions, eventLog, updatedFiredEvents }
 */
export function processWorldEvents(state, firedEvents = {}) {
    const { factions, regions, playerFaction, turn } = state;

    // Find eligible events
    const eligible = WORLD_EVENTS.filter(ev => {
        const lastFired = firedEvents[ev.id] || 0;
        const cooldown = ev.cooldown || 10;
        if (turn - lastFired < cooldown) return false;       // on cooldown
        if (ev.oneTime && lastFired > 0) return false;       // already fired once
        try { return ev.trigger(state); } catch { return false; }
    });

    if (eligible.length === 0) {
        return { updatedFactions: factions, updatedRegions: regions, eventLog: [], updatedFiredEvents: firedEvents };
    }

    // Weighted random selection — pick 1–2 events max per turn
    const totalWeight = eligible.reduce((s, e) => s + (e.weight || 1), 0);
    const pick = () => {
        let rand = Math.random() * totalWeight;
        for (const ev of eligible) {
            rand -= (ev.weight || 1);
            if (rand <= 0) return ev;
        }
        return eligible[0];
    };

    // Only fire 1 event per turn (2 if critical turn: act transitions)
    const maxEvents = state.actPhase > 1 ? 2 : 1;
    const fired = [];
    const usedIds = new Set();
    for (let i = 0; i < maxEvents; i++) {
        const ev = pick();
        if (!ev || usedIds.has(ev.id)) break;
        usedIds.add(ev.id);
        fired.push(ev);
    }

    // Apply effects sequentially
    let curFactions = { ...factions };
    let curRegions  = { ...regions };
    const eventLog  = [];
    const newFiredEvents = { ...firedEvents };

    fired.forEach(ev => {
        try {
            const result = ev.effect({ factions: curFactions, regions: curRegions, playerFaction });
            if (result.factions) curFactions = result.factions;
            if (result.regions)  curRegions  = result.regions;
            if (result.log)      eventLog.push(result.log);
            newFiredEvents[ev.id] = turn;
        } catch (e) {
            console.warn(`Event ${ev.id} effect crashed:`, e);
        }
    });

    return {
        updatedFactions:    curFactions,
        updatedRegions:     curRegions,
        reputationDelta:    fired.reduce((sum, ev) => sum + (ev.reputationDelta || 0), 0),
        eventLog,
        updatedFiredEvents: newFiredEvents,
    };
}

// ─── ADDITIONAL EVENTS (expanding to 50+) ────────────────────────────────────
// Appended to WORLD_EVENTS array via push

WORLD_EVENTS.push(

    // ── WEATHER EVENTS ───────────────────────────────────────────────────────

    {
        id: 'arctic_blizzard',
        title: 'Arctic Blizzard',
        desc: 'A catastrophic blizzard blankets northern territories, freezing supply lines solid.',
        severity: 'high',
        weight: 5,
        cooldown: 18,
        trigger: (state) => state.turn > 4,
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            const arctic = ['scandinavia','russia_w','russia_e','siberia','alaska','canada','greenland'];
            arctic.forEach(id => {
                if (newRegions[id] && newRegions[id].faction === playerFaction) {
                    newRegions[id] = {
                        ...newRegions[id],
                        infantry: Math.max(0, (newRegions[id].infantry || 0) - 2),
                        stability: Math.max(20, (newRegions[id].stability || 100) - 15),
                    };
                }
            });
            return { factions, regions: newRegions, log: '❄️ BLIZZARD: Arctic storm freezes northern supply lines — northern regions lose troops and stability.' };
        },
    },

    {
        id: 'monsoon_floods',
        title: 'Monsoon Season',
        desc: 'Seasonal flooding makes southern regions impassable for armoured units.',
        severity: 'medium',
        weight: 6,
        cooldown: 20,
        trigger: (state) => state.turn > 3,
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            const southern = ['india','se_asia','indonesia','w_africa','e_africa','congo','brazil'];
            let hit = 0;
            southern.forEach(id => {
                if (newRegions[id] && newRegions[id].faction === playerFaction) {
                    const armorLoss = Math.floor((newRegions[id].armor || 0) * 0.2);
                    if (armorLoss > 0) {
                        newRegions[id] = { ...newRegions[id], armor: (newRegions[id].armor || 0) - armorLoss };
                        hit += armorLoss;
                    }
                }
            });
            return { factions, regions: newRegions, log: `🌧 MONSOON: Flooding immobilises armour — ${hit} armoured units lost in southern regions.` };
        },
    },

    {
        id: 'solar_storm',
        title: 'Solar Storm',
        desc: 'A massive geomagnetic event disrupts satellite communications and radar systems worldwide.',
        severity: 'high',
        weight: 3,
        cooldown: 25,
        oneTime: true,
        trigger: (state) => state.turn > 8,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            // All factions lose tech points — comms scrambled
            Object.keys(newFactions).forEach(fk => {
                newFactions[fk] = {
                    ...newFactions[fk],
                    techPoints: Math.max(0, (newFactions[fk].techPoints || 0) - 1),
                    stability: Math.max(0, (newFactions[fk].stability || 100) - 8),
                };
            });
            return { factions: newFactions, regions, log: '🌞 SOLAR STORM: Geomagnetic event wipes comms — all factions lose 1 tech point, -8 stability.' };
        },
    },

    {
        id: 'drought',
        title: 'Regional Drought',
        desc: 'Prolonged drought decimates agricultural output in key territories.',
        severity: 'medium',
        weight: 6,
        cooldown: 14,
        trigger: (state) => state.turn > 5,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                supplies: Math.max(0, (newFactions[playerFaction].supplies || 0) - 180),
                stability: Math.max(0, (newFactions[playerFaction].stability || 100) - 5),
            };
            return { factions: newFactions, regions, log: '🏜 DROUGHT: Food production collapses — -180 supplies, -5 stability.' };
        },
    },

    // ── SPY / INTELLIGENCE EVENTS ─────────────────────────────────────────────

    {
        id: 'spy_network_busted',
        title: 'Intelligence Network Compromised',
        desc: 'Enemy counter-intelligence rolls up your entire spy ring in their territory.',
        severity: 'high',
        weight: 5,
        cooldown: 15,
        trigger: (state) => (state.factions[state.playerFaction]?.spyCharges || 0) > 0 || state.turn > 10,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                spyCharges: 0,
                stability: Math.max(0, (newFactions[playerFaction].stability || 100) - 8),
                funds: Math.max(0, (newFactions[playerFaction].funds || 0) - 100),
            };
            return { factions: newFactions, regions, log: '🕵 BUSTED: Intelligence network compromised — spy charges lost, -8 stability, -100 funds.' };
        },
    },

    {
        id: 'double_agent',
        title: 'Double Agent Revealed',
        desc: 'A mole inside enemy command leaks critical intelligence to your analysts.',
        severity: 'low',
        weight: 5,
        cooldown: 18,
        trigger: (state) => state.turn > 6,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            // Reveal bonus: gain spy charges and funds
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                spyCharges: Math.min(5, (newFactions[playerFaction].spyCharges || 0) + 2),
                funds: (newFactions[playerFaction].funds || 0) + 120,
            };
            return { factions: newFactions, regions, log: '🎭 DOUBLE AGENT: Mole inside enemy HQ — +2 spy charges, +120 funds from stolen data.' };
        },
    },

    {
        id: 'cyber_intrusion_detected',
        title: 'Cyber Intrusion Detected',
        desc: 'Enemy hackers breach your financial systems before being traced and expelled.',
        severity: 'medium',
        weight: 6,
        cooldown: 12,
        trigger: (state) => state.actPhase >= 2,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            const stolen = Math.floor((newFactions[playerFaction].funds || 0) * 0.08);
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                funds: Math.max(0, (newFactions[playerFaction].funds || 0) - stolen),
            };
            return { factions: newFactions, regions, log: `💻 CYBER BREACH: Enemy hackers steal $${stolen} before being expelled.` };
        },
    },

    {
        id: 'intel_windfall',
        title: 'Intercepted Communications',
        desc: 'SIGINT analysts crack enemy encryption, exposing their next offensive plan.',
        severity: 'low',
        weight: 6,
        cooldown: 15,
        trigger: (state) => state.turn > 5,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            // Weaken the most aggressive AI faction
            const aiFactions = ['EAST','CHINA'].filter(f => f !== playerFaction);
            const target = aiFactions[0];
            if (target) {
                newFactions[target] = {
                    ...newFactions[target],
                    stability: Math.max(0, (newFactions[target].stability || 100) - 12),
                };
            }
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                spyCharges: Math.min(5, (newFactions[playerFaction].spyCharges || 0) + 1),
            };
            return { factions: newFactions, regions, log: `📡 SIGINT: Enemy comms cracked — ${target} loses 12 stability, +1 spy charge gained.` };
        },
    },

    // ── NAVAL EVENTS ──────────────────────────────────────────────────────────

    {
        id: 'naval_blockade',
        title: 'Naval Blockade Imposed',
        desc: 'Enemy submarines establish a chokepoint blockade, cutting sea-lane supply routes.',
        severity: 'high',
        weight: 5,
        cooldown: 18,
        trigger: (state) => state.actPhase >= 2,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                oil: Math.max(0, (newFactions[playerFaction].oil || 0) - 150),
                supplies: Math.max(0, (newFactions[playerFaction].supplies || 0) - 120),
            };
            return { factions: newFactions, regions, log: '⚓ BLOCKADE: Naval blockade cuts sea-lanes — -150 oil, -120 supplies.' };
        },
    },

    {
        id: 'carrier_group_deployed',
        title: 'Carrier Strike Group Deployed',
        desc: 'A carrier battle group takes station in strategic waters, projecting massive power.',
        severity: 'low',
        weight: 4,
        cooldown: 20,
        trigger: (state) => {
            const owned = Object.values(state.regions).filter(r => r.faction === state.playerFaction);
            return owned.some(r => (r.carrier || 0) > 0);
        },
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                stability: Math.min(100, (newFactions[playerFaction].stability || 100) + 8),
                funds: (newFactions[playerFaction].funds || 0) + 80,
            };
            return { factions: newFactions, regions, log: '🚢 CARRIER GROUP: Naval projection boosts international standing — +8 stability, +80 funds.' };
        },
    },

    {
        id: 'submarine_sunk',
        title: 'Submarine Lost',
        desc: 'One of your submarines is hunted down and destroyed by enemy ASW forces.',
        severity: 'medium',
        weight: 5,
        cooldown: 12,
        trigger: (state) => {
            const owned = Object.values(state.regions).filter(r => r.faction === state.playerFaction);
            return owned.some(r => (r.submarine || 0) > 0);
        },
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            const withSub = Object.entries(newRegions).find(([, r]) => r.faction === playerFaction && (r.submarine || 0) > 0);
            if (withSub) {
                newRegions[withSub[0]] = { ...withSub[1], submarine: withSub[1].submarine - 1 };
            }
            return { factions, regions: newRegions, log: '🌊 SUBMARINE LOST: ASW forces locate and destroy one of your submarines.' };
        },
    },

    // ── MILITARY ESCALATION ───────────────────────────────────────────────────

    {
        id: 'friendly_fire',
        title: 'Friendly Fire Incident',
        desc: 'A breakdown in battlefield communications results in a catastrophic friendly fire event.',
        severity: 'high',
        weight: 4,
        cooldown: 20,
        trigger: (state) => state.actPhase >= 2 && state.turn > 12,
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            const owned = Object.entries(newRegions).filter(([, r]) => r.faction === playerFaction);
            if (owned.length === 0) return { factions, regions, log: '' };
            const [id, r] = owned[Math.floor(Math.random() * owned.length)];
            const loss = Math.max(2, Math.floor((r.infantry || 0) * 0.25));
            newRegions[id] = { ...r, infantry: Math.max(0, (r.infantry || 0) - loss) };
            const newFactions = { ...factions };
            newFactions[playerFaction] = { ...newFactions[playerFaction], stability: Math.max(0, (newFactions[playerFaction].stability || 100) - 10) };
            return { factions: newFactions, regions: newRegions, log: `💥 FRIENDLY FIRE: Misidentification in ${id.toUpperCase()} — ${loss} infantry lost, -10 stability.` };
        },
    },

    {
        id: 'mercenary_influx',
        title: 'Mercenary Contract',
        desc: 'Private military contractors flood into the conflict zone offering their services.',
        severity: 'low',
        weight: 6,
        cooldown: 14,
        trigger: (state) => (state.factions[state.playerFaction]?.funds || 0) > 400,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            const newRegions = { ...regions };
            newFactions[playerFaction] = { ...newFactions[playerFaction], funds: (newFactions[playerFaction].funds || 0) - 200 };
            const owned = Object.entries(newRegions).filter(([, r]) => r.faction === playerFaction);
            if (owned.length > 0) {
                const [id, r] = owned[Math.floor(Math.random() * owned.length)];
                newRegions[id] = { ...r, infantry: (r.infantry || 0) + 6 };
            }
            return { factions: newFactions, regions: newRegions, log: '🔫 MERCENARIES: Private contractors deployed — -200 funds, +6 infantry.' };
        },
    },

    {
        id: 'munitions_shortage',
        title: 'Critical Munitions Shortage',
        desc: 'Supply chain failures leave frontline units rationing ammunition.',
        severity: 'high',
        weight: 6,
        cooldown: 14,
        trigger: (state) => (state.factions[state.playerFaction]?.supplies || 0) < 300 && state.actPhase >= 2,
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            const owned = Object.entries(newRegions).filter(([, r]) => r.faction === playerFaction);
            let degraded = 0;
            owned.forEach(([id, r]) => {
                if (Math.random() < 0.3) {
                    newRegions[id] = { ...r, stability: Math.max(20, (r.stability || 100) - 12) };
                    degraded++;
                }
            });
            return { factions, regions: newRegions, log: `📦 SHORTAGE: Munitions dry up in ${degraded} regions — stability degraded.` };
        },
    },

    {
        id: 'elite_unit_formed',
        title: 'Elite Special Forces Formed',
        desc: 'Battle-proven veterans are selected for a new special operations brigade.',
        severity: 'low',
        weight: 5,
        cooldown: 20,
        oneTime: false,
        trigger: (state) => state.turn > 10 && Object.values(state.regions).filter(r => r.faction === state.playerFaction && (r.infantry || 0) >= 8).length >= 2,
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            const eligible = Object.entries(newRegions).filter(([, r]) => r.faction === playerFaction && (r.infantry || 0) >= 8);
            if (eligible.length === 0) return { factions, regions, log: '' };
            const [id, r] = eligible[0];
            newRegions[id] = { ...r, infantry: (r.infantry || 0) + 4, armor: (r.armor || 0) + 1 };
            return { factions, regions: newRegions, log: `🎖 SPECIAL FORCES: Elite brigade formed in ${id.toUpperCase()} — +4 infantry, +1 armor.` };
        },
    },

    // ── GEOPOLITICAL ──────────────────────────────────────────────────────────

    {
        id: 'un_resolution',
        title: 'UN Resolution Passed',
        desc: 'The UN Security Council passes a resolution demanding immediate ceasefire.',
        severity: 'medium',
        weight: 5,
        cooldown: 22,
        trigger: (state) => state.actPhase >= 2 && state.turn > 15,
        choices: [
            {
                id: 'un_comply',
                label: '🕊 Comply publicly',
                desc: 'Stability +15, reputation +10',
                effect: ({ factions, regions, playerFaction }) => {
                    const nf = { ...factions };
                    nf[playerFaction] = { ...nf[playerFaction], stability: Math.min(100,(nf[playerFaction].stability||100)+15) };
                    return { factions: nf, regions, log: '🕊 UN RESOLUTION: You comply — stability +15, global standing improves.', reputationDelta: 10 };
                },
            },
            {
                id: 'un_ignore',
                label: '🚫 Ignore it',
                desc: 'No war effect, reputation -15',
                effect: ({ factions, regions }) => ({ factions, regions, log: '🚫 UN RESOLUTION: You ignore the ceasefire — war continues.', reputationDelta: -15 }),
            },
            {
                id: 'un_exploit',
                label: '🎭 Feign compliance',
                desc: 'Reputation +5, +2 spy charges',
                effect: ({ factions, regions, playerFaction }) => {
                    const nf = { ...factions };
                    nf[playerFaction] = { ...nf[playerFaction], spyCharges: (nf[playerFaction].spyCharges||0)+2 };
                    return { factions: nf, regions, log: '🎭 UN FEINT: Covert operatives deployed under cover of compliance.', reputationDelta: 5 };
                },
            },
        ],
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            Object.keys(newFactions).forEach(fk => {
                newFactions[fk] = { ...newFactions[fk], stability: Math.min(100, (newFactions[fk].stability || 100) + 5) };
            });
            return { factions: newFactions, regions, log: '🕊 UN RESOLUTION: Ceasefire resolution passed — all factions gain +5 stability.' };
        },
    },

    {
        id: 'arms_embargo',
        title: 'International Arms Embargo',
        desc: 'Global powers impose an arms embargo on the largest aggressor faction.',
        severity: 'high',
        weight: 4,
        cooldown: 20,
        trigger: (state) => state.actPhase >= 2,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            const aiFacs = ['EAST','CHINA'].filter(f => f !== playerFaction);
            aiFacs.forEach(fk => {
                newFactions[fk] = {
                    ...newFactions[fk],
                    supplies: Math.max(0, (newFactions[fk].supplies || 0) - 200),
                };
            });
            return { factions: newFactions, regions, log: '🚫 EMBARGO: Arms embargo cripples enemy supply chains — -200 supplies each.' };
        },
    },

    {
        id: 'propaganda_victory',
        title: 'Propaganda Campaign Succeeds',
        desc: 'Your information war dominates global media, swaying neutral nations.',
        severity: 'low',
        weight: 6,
        cooldown: 16,
        trigger: (state) => state.turn > 4,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                stability: Math.min(100, (newFactions[playerFaction].stability || 100) + 10),
                funds: (newFactions[playerFaction].funds || 0) + 60,
            };
            // Convert one neutral region near player territory
            const playerOwned = Object.keys(regions).filter(id => regions[id].faction === playerFaction);
            let converted = false;
            for (const pid of playerOwned) {
                const neutralAdj = (ADJ[pid] || []).find(nid => regions[nid]?.faction === 'NEUTRAL' && (regions[nid]?.infantry || 0) <= 6);
                if (neutralAdj && !converted) {
                    regions = { ...regions, [neutralAdj]: { ...regions[neutralAdj], stability: Math.min(100, (regions[neutralAdj].stability || 100) + 20) } };
                    converted = true;
                }
            }
            return { factions: newFactions, regions, log: `📢 PROPAGANDA: Information war success — +10 stability, +60 funds, neutral morale boosted.` };
        },
    },

    {
        id: 'nuclear_test',
        title: 'Enemy Nuclear Test',
        desc: 'A rival faction conducts an underground nuclear test, raising global tension sharply.',
        severity: 'critical',
        weight: 3,
        cooldown: 25,
        trigger: (state) => state.actPhase >= 2 && state.turn > 18,
        choices: [
            {
                id: 'nuke_counter_test',
                label: '☢ Conduct counter-test',
                desc: '+1 nuke, reputation -20',
                effect: ({ factions, regions, playerFaction }) => {
                    const nf = { ...factions };
                    nf[playerFaction] = { ...nf[playerFaction], nukes: (nf[playerFaction].nukes||0)+1 };
                    return { factions: nf, regions, log: '☢ NUCLEAR COUNTER-TEST: +1 tactical nuke. Global alarm spikes.', reputationDelta: -20 };
                },
            },
            {
                id: 'nuke_sanctions',
                label: '📜 Push for sanctions',
                desc: '+$300, reputation +10',
                effect: ({ factions, regions, playerFaction }) => {
                    const nf = { ...factions };
                    nf[playerFaction] = { ...nf[playerFaction], funds: (nf[playerFaction].funds||0)+300 };
                    return { factions: nf, regions, log: '📜 NUCLEAR SANCTIONS: Coalition forms — +$300 allied support.', reputationDelta: 10 };
                },
            },
            {
                id: 'nuke_silence',
                label: '😶 Say nothing',
                desc: 'No cost or gain',
                effect: ({ factions, regions }) => ({ factions, regions, log: '😶 NUCLEAR TEST: Strategic silence noted by all parties.', reputationDelta: 0 }),
            },
        ],
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            Object.keys(newFactions).forEach(fk => {
                newFactions[fk] = { ...newFactions[fk], stability: Math.max(0, (newFactions[fk].stability || 100) - 10) };
            });
            return { factions: newFactions, regions, log: '☢ NUCLEAR TEST: Rival faction detonates warhead underground — global -10 stability.' };
        },
    },

    // ── RESOURCE ──────────────────────────────────────────────────────────────

    {
        id: 'pipeline_sabotage',
        title: 'Pipeline Sabotage',
        desc: 'Saboteurs destroy key fuel infrastructure, triggering an oil supply emergency.',
        severity: 'high',
        weight: 6,
        cooldown: 14,
        trigger: (state) => state.turn > 6,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                oil: Math.max(0, (newFactions[playerFaction].oil || 0) - 200),
            };
            return { factions: newFactions, regions, log: '🔥 SABOTAGE: Pipeline destroyed — -200 oil reserves.' };
        },
    },

    {
        id: 'rare_minerals',
        title: 'Rare Mineral Deposits Found',
        desc: 'Survey teams uncover vast rare earth mineral deposits crucial for advanced weapons.',
        severity: 'low',
        weight: 4,
        cooldown: 25,
        oneTime: true,
        trigger: (state) => Object.values(state.regions).filter(r => r.faction === state.playerFaction).length >= 5,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                techPoints: (newFactions[playerFaction].techPoints || 0) + 3,
                funds: (newFactions[playerFaction].funds || 0) + 200,
            };
            return { factions: newFactions, regions, log: '💎 MINERALS: Rare earth deposits discovered — +3 tech points, +200 funds.' };
        },
    },

    {
        id: 'power_grid_restored',
        title: 'Power Grid Restored',
        desc: 'Engineers complete massive repairs to the national grid, restoring industrial output.',
        severity: 'low',
        weight: 5,
        cooldown: 15,
        trigger: (state) => Object.values(state.regions).some(r => r.faction === state.playerFaction && r.industry < 10),
        effect: ({ factions, regions, playerFaction }) => {
            const newRegions = { ...regions };
            let restored = 0;
            Object.entries(newRegions).forEach(([id, r]) => {
                if (r.faction === playerFaction && r.industry < 10) {
                    newRegions[id] = { ...r, industry: Math.min(20, r.industry + 5) };
                    restored++;
                }
            });
            return { factions, regions: newRegions, log: `⚡ GRID RESTORED: Industrial repairs complete in ${restored} regions — +5 industry each.` };
        },
    },

    {
        id: 'fuel_reserves_found',
        title: 'Strategic Fuel Reserve Discovered',
        desc: 'A massive pre-war fuel cache is found in an abandoned military depot.',
        severity: 'low',
        weight: 5,
        cooldown: 20,
        trigger: (state) => state.turn > 4,
        effect: ({ factions, regions, playerFaction }) => {
            const newFactions = { ...factions };
            newFactions[playerFaction] = {
                ...newFactions[playerFaction],
                oil: (newFactions[playerFaction].oil || 0) + 300,
                supplies: (newFactions[playerFaction].supplies || 0) + 100,
            };
            return { factions: newFactions, regions, log: '🛢 FUEL CACHE: Pre-war depot discovered — +300 oil, +100 supplies.' };
        },
    },

);


// ─── FACTION-SPECIFIC STORY EVENTS ───────────────────────────────────────────
export const FACTION_STORY_EVENTS = {

    NATO: [
        {
            id: 'nato_article5',
            title: 'Article 5 Invoked',
            desc: 'A NATO member state has been attacked. The alliance demands you honor Article 5 and commit forces.',
            turn: 6,
            choices: [
                { id: 'honor', label: '🛡 Honor the commitment', desc: 'Reputation +20, deploy forces to member state',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], funds: Math.max(0, (nf[playerFaction].funds||0)-300) };
                      return { factions: nf, regions, log: '🛡 ARTICLE 5: Forces deployed. Alliance cohesion strengthened.', reputationDelta: 20 };
                  }},
                { id: 'stall', label: '🕰 Delay with diplomacy', desc: 'No cost, reputation -5',
                  effect: ({ factions, regions, playerFaction }) => ({ factions, regions, log: '🕰 ARTICLE 5: Diplomatic stalling buys time — allies grow nervous.', reputationDelta: -5 }) },
            ],
        },
        {
            id: 'nato_tech_lead',
            title: 'Silicon Valley Goes to War',
            desc: 'Major tech corporations offer advanced AI targeting systems to NATO forces exclusively.',
            turn: 10,
            choices: [
                { id: 'accept_ai', label: '🤖 Accept AI systems', desc: '+2 tech points, reputation -5 (militarization concerns)',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], techPoints: (nf[playerFaction].techPoints||0)+2 };
                      return { factions: nf, regions, log: '🤖 AI INTEGRATION: Silicon Valley tech boosts NATO firepower — +2 tech points.', reputationDelta: -5 };
                  }},
                { id: 'reject_ai', label: '🚫 Reject (public backlash risk)', desc: 'Stability +5, no tech',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], stability: Math.min(100, (nf[playerFaction].stability||100)+5) };
                      return { factions: nf, regions, log: '🚫 AI REJECTED: Public relief at restraint — stability +5.', reputationDelta: 10 };
                  }},
            ],
        },
        {
            id: 'nato_internal_crisis',
            title: 'Alliance Fractures',
            desc: 'A key NATO member threatens to withdraw over strategic disagreements.',
            turn: 16,
            choices: [
                { id: 'buy_loyalty', label: '💰 Buy loyalty with aid', desc: '-$500, member stays',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], funds: Math.max(0,(nf[playerFaction].funds||0)-500), stability: Math.min(100,(nf[playerFaction].stability||100)+8) };
                      return { factions: nf, regions, log: '💰 ALLIANCE HELD: Emergency aid package preserves NATO unity.', reputationDelta: 5 };
                  }},
                { id: 'let_leave', label: '🚶 Let them leave', desc: '-2 regions to neutral, stability -10',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nr = { ...regions };
                      const ownedNATO = Object.keys(nr).filter(r => nr[r].faction === playerFaction);
                      if (ownedNATO.length > 3) nr[ownedNATO[Math.floor(Math.random()*ownedNATO.length)]] = { ...nr[ownedNATO[0]], faction: 'NEUTRAL' };
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], stability: Math.max(0,(nf[playerFaction].stability||100)-10) };
                      return { factions: nf, regions: nr, log: '🚶 ALLIANCE FRACTURES: Member withdraws — territory lost, stability -10.' };
                  }},
            ],
        },
    ],

    EAST: [
        {
            id: 'east_wagner',
            title: 'Private Military Contractors',
            desc: 'Mercenary forces offer their services — high capability, high cost, zero accountability.',
            turn: 5,
            choices: [
                { id: 'hire_wagner', label: '⚔ Hire the mercenaries', desc: '+8 infantry in 3 regions, reputation -15',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nr = { ...regions };
                      const owned = Object.keys(nr).filter(r => nr[r].faction === playerFaction).slice(0,3);
                      owned.forEach(r => { nr[r] = { ...nr[r], infantry: (nr[r].infantry||0)+8 }; });
                      return { factions, regions: nr, log: '⚔ MERCENARIES DEPLOYED: Private forces boost 3 regions — +8 infantry each.', reputationDelta: -15 };
                  }},
                { id: 'reject_wagner', label: '🚫 Rely on regular forces', desc: 'Reputation neutral, supply +100',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], supplies: (nf[playerFaction].supplies||0)+100 };
                      return { factions: nf, regions, log: '🚫 MERCS REFUSED: Regular forces receive priority resupply — +100 supplies.', reputationDelta: 5 };
                  }},
            ],
        },
        {
            id: 'east_energy_weapon',
            title: 'Energy as a Weapon',
            desc: 'Your advisors suggest cutting gas supplies to European regions — devastating economically, internationally condemned.',
            turn: 8,
            choices: [
                { id: 'cut_gas', label: '🔌 Cut energy supplies', desc: 'Enemy economy -40 in 4 regions, reputation -25',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nr = { ...regions };
                      ['germany','france','poland','ukraine'].forEach(r => {
                          if (nr[r] && nr[r].faction !== playerFaction) nr[r] = { ...nr[r], economy: Math.max(10,(nr[r].economy||50)-40) };
                      });
                      return { factions, regions: nr, log: '🔌 ENERGY WEAPON: Gas cutoff cripples European economies.', reputationDelta: -25 };
                  }},
                { id: 'keep_gas', label: '🤝 Maintain supply (leverage)', desc: '+$400 in gas revenues',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], funds: (nf[playerFaction].funds||0)+400 };
                      return { factions: nf, regions, log: '🤝 ENERGY LEVERAGE: Continued supply earns +$400 — and goodwill.', reputationDelta: 8 };
                  }},
            ],
        },
        {
            id: 'east_nuclear_doctrine',
            title: 'Nuclear Doctrine Review',
            desc: 'Military command proposes lowering the threshold for tactical nuclear use.',
            turn: 14,
            choices: [
                { id: 'lower_threshold', label: '☢ Approve new doctrine', desc: '+2 nukes, all factions gain +5% fear modifier',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], nukes: (nf[playerFaction].nukes||0)+2 };
                      return { factions: nf, regions, log: '☢ NUCLEAR DOCTRINE: Lowered threshold approved — +2 tactical nukes. World on edge.', reputationDelta: -30 };
                  }},
                { id: 'maintain_doctrine', label: '📋 Maintain existing doctrine', desc: 'Stability +10, no escalation',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], stability: Math.min(100,(nf[playerFaction].stability||100)+10) };
                      return { factions: nf, regions, log: '📋 DOCTRINE HELD: Stability maintained. Strategic restraint noted globally.', reputationDelta: 15 };
                  }},
            ],
        },
    ],

    CHINA: [
        {
            id: 'china_taiwan_ultimatum',
            title: 'Taiwan Ultimatum',
            desc: 'Military command recommends issuing a final ultimatum to Taiwan. The world watches.',
            turn: 6,
            choices: [
                { id: 'issue_ultimatum', label: '📢 Issue the ultimatum', desc: 'Taiwan stability -50, USA enters alert',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nr = { ...regions };
                      if (nr.taiwan) nr.taiwan = { ...nr.taiwan, stability: Math.max(0,(nr.taiwan.stability||100)-50) };
                      const nf = { ...factions };
                      if (nf.NATO) nf.NATO = { ...nf.NATO, stability: Math.max(0,(nf.NATO.stability||100)-10) };
                      return { factions: nf, regions: nr, log: '📢 TAIWAN ULTIMATUM: Crisis escalates — Taiwan destabilized, NATO on alert.', reputationDelta: -20 };
                  }},
                { id: 'back_down', label: '🕊 Strategic patience', desc: '+$500 trade, reputation +10',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], funds: (nf[playerFaction].funds||0)+500 };
                      return { factions: nf, regions, log: '🕊 STRATEGIC PATIENCE: Trade continues — +$500 in economic activity.', reputationDelta: 10 };
                  }},
            ],
        },
        {
            id: 'china_belt_road',
            title: 'Belt & Road Leverage',
            desc: 'Debtor nations offer military access in exchange for debt relief.',
            turn: 9,
            choices: [
                { id: 'accept_bases', label: '🏗 Accept military access', desc: '+1 guerrilla in 4 foreign regions',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nr = { ...regions };
                      const neutral = Object.keys(nr).filter(r => nr[r].faction === 'NEUTRAL').slice(0,4);
                      neutral.forEach(r => { nr[r] = { ...nr[r], guerrilla: (nr[r].guerrilla||0)+1, faction: playerFaction }; });
                      return { factions, regions: nr, log: '🏗 BELT & ROAD: Debtor nations open bases — 4 neutral regions absorbed.', reputationDelta: -5 };
                  }},
                { id: 'cancel_debt', label: '💸 Cancel debt (goodwill)', desc: '-$300, +15 stability',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], funds: Math.max(0,(nf[playerFaction].funds||0)-300), stability: Math.min(100,(nf[playerFaction].stability||100)+15) };
                      return { factions: nf, regions, log: '💸 DEBT CANCELLED: Goodwill surge across developing world — stability +15.', reputationDelta: 15 };
                  }},
            ],
        },
    ],

    INDIA: [
        {
            id: 'india_non_aligned',
            title: 'Non-Alignment Legacy',
            desc: 'Your historic non-aligned status gives leverage — both sides court India.',
            turn: 5,
            choices: [
                { id: 'sell_neutrality', label: '🤝 Play both sides', desc: '+$600 from both blocs, reputation -10',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], funds: (nf[playerFaction].funds||0)+600 };
                      return { factions: nf, regions, log: '🤝 DIPLOMATIC PIVOT: Both superpowers court India — +$600.', reputationDelta: -10 };
                  }},
                { id: 'true_neutral', label: '⚖ Declare neutrality', desc: 'Stability +20, no war crime penalties ever',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], stability: Math.min(100,(nf[playerFaction].stability||100)+20) };
                      return { factions: nf, regions, log: '⚖ NEUTRALITY DECLARED: India steps back — massive stability boost.', reputationDelta: 20 };
                  }},
            ],
        },
        {
            id: 'india_space_program',
            title: 'Satellite Strike Capability',
            desc: 'ISRO has developed dual-use satellites that can target enemy infrastructure.',
            turn: 12,
            choices: [
                { id: 'militarize_space', label: '🛸 Weaponize satellites', desc: '+1 orbital strike charge, reputation -10',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], orbitalCharges: (nf[playerFaction].orbitalCharges||0)+1 };
                      return { factions: nf, regions, log: '🛸 SPACE WEAPONS: ISRO satellites repurposed for war — +1 orbital charge.', reputationDelta: -10 };
                  }},
                { id: 'keep_peaceful', label: '🔭 Keep space peaceful', desc: '+2 tech points',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], techPoints: (nf[playerFaction].techPoints||0)+2 };
                      return { factions: nf, regions, log: '🔭 PEACEFUL SPACE: Scientific focus earns +2 tech points.', reputationDelta: 10 };
                  }},
            ],
        },
    ],

    LATAM: [
        {
            id: 'latam_cartel_alliance',
            title: 'Cartel Networks',
            desc: 'Criminal organizations offer covert logistics and intelligence in exchange for political protection.',
            turn: 4,
            choices: [
                { id: 'accept_cartels', label: '💊 Accept cartel support', desc: '+$500 + spy charges, stability -15, reputation -20',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], funds: (nf[playerFaction].funds||0)+500, spyCharges: (nf[playerFaction].spyCharges||0)+3, stability: Math.max(0,(nf[playerFaction].stability||100)-15) };
                      return { factions: nf, regions, log: '💊 CARTEL ALLIANCE: Covert networks activated — +$500, +3 spy charges. Stability crumbles.', reputationDelta: -20 };
                  }},
                { id: 'reject_cartels', label: '🚓 Refuse and crack down', desc: 'Reputation +15, stability +5',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], stability: Math.min(100,(nf[playerFaction].stability||100)+5) };
                      return { factions: nf, regions, log: '🚓 CARTELS REFUSED: Public crackdown earns legitimacy — stability +5.', reputationDelta: 15 };
                  }},
            ],
        },
        {
            id: 'latam_resource_curse',
            title: 'Resource Windfall',
            desc: 'Vast new lithium deposits discovered. Global powers demand access. What is your price?',
            turn: 8,
            choices: [
                { id: 'nationalize', label: '🏭 Nationalize deposits', desc: '+oil +economy, reputation +5',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], oil: (nf[playerFaction].oil||0)+200, funds: (nf[playerFaction].funds||0)+400 };
                      return { factions: nf, regions, log: '🏭 NATIONALIZATION: Lithium reserves nationalized — +200 oil, +$400.', reputationDelta: 5 };
                  }},
                { id: 'sell_rights', label: '🤝 Sell extraction rights', desc: '+$1000 immediate, economy dependency',
                  effect: ({ factions, regions, playerFaction }) => {
                      const nf = { ...factions };
                      nf[playerFaction] = { ...nf[playerFaction], funds: (nf[playerFaction].funds||0)+1000, stability: Math.max(0,(nf[playerFaction].stability||100)-5) };
                      return { factions: nf, regions, log: '🤝 RESOURCE DEAL: Foreign corporations pay handsomely — +$1000.', reputationDelta: -5 };
                  }},
            ],
        },
    ],
};

