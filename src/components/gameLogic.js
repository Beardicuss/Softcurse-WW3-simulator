import { REGIONS, ADJ, FD, getTerrain } from '../data/mapData';

export const INITIAL_DATE = new Date(2026, 4, 1); // May 1, 2026

export const UNIT_STATS = {
    infantry:   { atk: 1,  def: 2,  cost: 1,  oil: 0 },
    armor:      { atk: 3,  def: 2,  cost: 3,  oil: 1 },
    air:        { atk: 5,  def: 0,  cost: 5,  oil: 2 },
    // Naval units — only buildable in coastal regions, provide sea-lane bonuses
    destroyer:  { atk: 4,  def: 3,  cost: 4,  oil: 2 },  // fast, anti-sub
    submarine:  { atk: 6,  def: 1,  cost: 5,  oil: 3 },  // high damage, fragile
    carrier:    { atk: 2,  def: 5,  cost: 8,  oil: 4 },  // def powerhouse, boosts air atk
    // TIER 2 units
    bomber:     { atk: 8,  def: 0,  cost: 8,  oil: 4 },  // devastating vs infrastructure, bypasses terrain def bonus
    guerrilla:  { atk: 2,  def: 3,  cost: 2,  oil: 0 },  // cheap, double def in forest/mountain/jungle, insurgency
};

// Coastal regions — can build naval units
export const COASTAL_REGIONS = new Set([
    'alaska','usa','mexico','caribb','colombia','brazil','argentina',
    'greenland','uk','france','spain','italy','balkans','scandinavia',
    'n_africa','w_africa','e_africa','s_africa',
    'turkey','iran','arabia','israel',
    'india','se_asia','indonesia','china_s','korea','japan','taiwan',
    'australia','nz','pacific_i','russia_e','siberia',
]);

// ── WEATHER SYSTEM ─────────────────────────────────────────────────────────────
export const WEATHER_TYPES = [
    { id: 'clear',      label: 'Clear',        emoji: '☀️',  atkMod: 1.0,  defMod: 1.0,  moveMod: 1.0  },
    { id: 'rain',       label: 'Rain',         emoji: '🌧',  atkMod: 0.85, defMod: 0.95, moveMod: 0.85 },
    { id: 'storm',      label: 'Storm',        emoji: '⛈',  atkMod: 0.70, defMod: 1.10, moveMod: 0.70 },
    { id: 'snow',       label: 'Blizzard',     emoji: '❄️',  atkMod: 0.75, defMod: 1.05, moveMod: 0.60 },
    { id: 'heatwave',   label: 'Heatwave',     emoji: '🌡',  atkMod: 0.90, defMod: 0.90, moveMod: 0.95 },
    { id: 'fog',        label: 'Dense Fog',    emoji: '🌫',  atkMod: 0.80, defMod: 1.15, moveMod: 0.80 },
];

export function rollWeather(currentWeather, turn) {
    // Weather has inertia — 60% chance to stay the same
    if (currentWeather && Math.random() < 0.60) return currentWeather;
    const weights = [40, 20, 10, 10, 10, 10]; // clear is most common
    let rand = Math.random() * 100;
    for (let i = 0; i < WEATHER_TYPES.length; i++) {
        rand -= weights[i];
        if (rand <= 0) return WEATHER_TYPES[i].id;
    }
    return 'clear';
}

export function getWeather(id) {
    return WEATHER_TYPES.find(w => w.id === id) || WEATHER_TYPES[0];
}

export function initGame() {
    const rs = {};
    REGIONS.forEach(r => {
        rs[r.id] = {
            faction: "NEUTRAL",
            infantry: Math.floor(Math.random() * 10) + 5,
            armor: Math.floor(Math.random() * 3),
            air: Math.floor(Math.random() * 2),
            bombed: false,
            economy: r.strategic ? 80 : 40,
            stability: 100,
            industry: r.strategic ? 20 : 5
        };
    });

    ["NATO", "EAST", "CHINA", "INDIA", "LATAM"].forEach(fk => {
        Object.entries(FD[fk].starts).forEach(([rid, t]) => {
            if (rs[rid]) {
                rs[rid] = {
                    ...rs[rid],
                    faction: fk,
                    infantry: t,
                    armor: Math.floor(t / 4),
                    air: Math.floor(t / 8),
                    stability: 95
                };
            }
        });
    });

    const fs = {};
    ["NATO", "EAST", "CHINA", "INDIA", "LATAM"].forEach(fk => {
        fs[fk] = {
            nukes: FD[fk].nukes,
            funds: 1000,
            oil: 500,
            supplies: 800,
            stability: 100,
            alertLevel: 1,
            techPoints: 3,        // starting research points
            unlockedTech: [],     // array of tech node IDs
            spyCharges: 2,        // spy/recon action charges (replenish each 5 turns)
        };
    });

    return { rs, fs, date: INITIAL_DATE.getTime() };
}

export function calculateIncome(factionKey, regions, techMods = {}, enemyDebuffMult = 1) {
    let income = FD[factionKey].income || 10;
    let oilProd = 0;

    Object.values(regions).forEach(r => {
        if (r.faction === factionKey) {
            income += Math.floor((r.economy * 0.2) + (r.industry * 0.5));
            if (r.strategic) oilProd += 10;
        }
    });

    // Own tech income bonus
    income = Math.floor(income * (1 + (techMods.incomeBonus || 0)));

    // Enemy CYBER_2 infrastructure virus reduces this faction's income
    income = Math.floor(income * enemyDebuffMult);

    return { income, oilProd };
}

export function calculatePower(region, isAttacking = true) {
    const { infantry = 0, armor = 0, air = 0, destroyer = 0, submarine = 0, carrier = 0 } = region;
    if (isAttacking) {
        return (infantry  * UNIT_STATS.infantry.atk)  +
               (armor     * UNIT_STATS.armor.atk)     +
               (air       * UNIT_STATS.air.atk)       +
               (destroyer * UNIT_STATS.destroyer.atk) +
               (submarine * UNIT_STATS.submarine.atk) +
               (carrier   * UNIT_STATS.carrier.atk)   +
               ((region.bomber    || 0) * UNIT_STATS.bomber.atk)   +
               ((region.guerrilla || 0) * UNIT_STATS.guerrilla.atk);
    } else {
        // Carrier boosts adjacent air defence
        const carrierAirBonus = carrier * 2;
        return (infantry  * UNIT_STATS.infantry.def)  +
               (armor     * UNIT_STATS.armor.def)     +
               (destroyer * UNIT_STATS.destroyer.def) +
               (submarine * UNIT_STATS.submarine.def) +
               (carrier   * UNIT_STATS.carrier.def)   +
               ((region.guerrilla || 0) * UNIT_STATS.guerrilla.def) +
               carrierAirBonus;
    }
}

export function applyCasualties(region, damage) {
    let remainingDamage = damage;
    let { infantry = 0, armor = 0, air = 0, destroyer = 0, submarine = 0, carrier = 0 } = region;

    // Infantry dies first (1 hp each)
    const infLoss = Math.min(infantry, remainingDamage);
    infantry -= infLoss;
    remainingDamage -= infLoss;

    // Submarine dies next (fragile — 1 hp)
    if (remainingDamage > 0) {
        const subLoss = Math.min(submarine, remainingDamage);
        submarine -= subLoss;
        remainingDamage -= subLoss;
    }

    // Destroyer (2 hp each)
    if (remainingDamage > 0) {
        const destLoss = Math.min(destroyer, Math.floor(remainingDamage / 2));
        destroyer -= destLoss;
        remainingDamage -= destLoss * 2;
    }

    // Armor dies next (3 hp each)
    if (remainingDamage > 0) {
        const armorLoss = Math.min(armor, Math.floor(remainingDamage / 3));
        armor -= armorLoss;
        remainingDamage -= armorLoss * 3;
    }

    // Air (2 hp each)
    if (remainingDamage > 0) {
        const airLoss = Math.min(air, Math.floor(remainingDamage / 2));
        air -= airLoss;
        remainingDamage -= airLoss * 2;
    }

    // Carrier dies last (tough — 4 hp)
    if (remainingDamage > 0) {
        const carrierLoss = Math.min(carrier, Math.floor(remainingDamage / 4));
        carrier -= carrierLoss;
    }

    return { infantry, armor, air, destroyer, submarine, carrier };
}

export function doCombat(attRegion, defRegion, ab, db, attackerStability = 100, defenderStability = 100, atkMods = {}, defMods = {}, weather = null, defRegionId = null) {
    const stabilityModA = attackerStability / 100;
    const stabilityModD = defenderStability / 100;

    // Weather modifiers
    const weatherData = weather ? (WEATHER_TYPES.find(w => w.id === weather) || WEATHER_TYPES[0]) : WEATHER_TYPES[0];
    const weatherAtkMod = weatherData.atkMod;
    const weatherDefMod = weatherData.defMod;

    // Bombers bypass terrain defense (strategic bombardment)
    const bomberRatio = Math.min(1, (attRegion.bomber || 0) / Math.max(1, (attRegion.infantry || 0) + (attRegion.armor || 0) + (attRegion.bomber || 0)));
    const terrainBypass = bomberRatio * 0.6; // up to 60% terrain bypass with all-bomber force

    // Terrain modifiers — defender gets home terrain advantage
    const terrain = defRegionId ? getTerrain(defRegionId) : { atkMod: 1.0, defMod: 1.0 };
    const terrainAtkMod = terrain.atkMod;
    const terrainDefMod = terrain.defMod * (1 - terrainBypass);

    const attackingForces = {
        infantry: Math.max(0, attRegion.infantry - 1),
        armor: attRegion.armor,
        air: attRegion.air
    };

    // Tech bonuses for attacker
    const atkTechBonus  = 1 + (atkMods.globalAtkBonus || 0) + (atkMods.airAtkBonus || 0);
    const armorAtkMult  = atkMods.armorAtkMult || 1;
    const defPenetration = atkMods.defPenetration || 0;

    // Tech bonuses for defender
    const defTechBonus = 1 + (defMods.globalDefBonus || 0) + (defMods.armorDefBonus || 0);
    const enemyAtkDebuff = defMods.enemyAtkDebuff || 0; // defender's EW debuffing attacker

    // Effective multipliers
    const effectiveAtkMult = ab * atkTechBonus * (1 - enemyAtkDebuff) * stabilityModA * weatherAtkMod * terrainAtkMod;
    // Guerrilla bonus: double defensive contribution in rough terrain
    const guerrillaTerrainBonus = ['forest','mountain','jungle','tundra'].includes(terrain?.id)
        ? (defRegion.guerrilla || 0) * UNIT_STATS.guerrilla.def  // extra def power
        : 0;
    const effectiveDefMult = db * defTechBonus * (1 - defPenetration) * stabilityModD * weatherDefMod * terrainDefMod;

    // Calculate raw power (armor gets its own multiplier)
    const baseAtkPower =
        (attackingForces.infantry * UNIT_STATS.infantry.atk) +
        (attackingForces.armor   * UNIT_STATS.armor.atk   * armorAtkMult) +
        (attackingForces.air     * UNIT_STATS.air.atk);

    const aPower = baseAtkPower * effectiveAtkMult * (0.7 + Math.random() * 0.6);
    const dPower = (calculatePower(defRegion, false) + guerrillaTerrainBonus) * effectiveDefMult * (0.7 + Math.random() * 0.6);

    const win = aPower > dPower;

    const aDamage = win ? Math.floor(dPower * (0.15 + Math.random() * 0.2)) : Math.floor(dPower * (0.4 + Math.random() * 0.25));
    const dDamage = win ? Math.floor(aPower * (0.5 + Math.random() * 0.3)) : Math.floor(aPower * (0.15 + Math.random() * 0.15));

    return { win, aDamage, dDamage, stabilityDamage: win ? 5 : 15 };
}

export function calculateSupply(regions) {
    const factions = ['NATO', 'EAST', 'CHINA', 'INDIA', 'LATAM'];
    const isolatedRegions = new Set();
    const suppliedRegions = new Set();

    factions.forEach(fk => {
        const owned = Object.keys(regions).filter(rid => regions[rid].faction === fk);
        const hubs = owned.filter(rid => {
            const regDef = REGIONS.find(r => r.id === rid);
            return (regDef && regDef.strategic) || regions[rid].industry >= 10;
        });

        const queue = [...hubs];
        const visited = new Set(hubs);

        while (queue.length > 0) {
            const curr = queue.shift();
            suppliedRegions.add(curr);

            (ADJ[curr] || []).forEach(neighbor => {
                if (regions[neighbor]?.faction === fk && !visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            });
        }

        owned.forEach(rid => {
            if (!suppliedRegions.has(rid)) {
                isolatedRegions.add(rid);
            }
        });
    });

    return isolatedRegions;
}

export function aiScore(fromId, toId, fromD, toD, aiKey, state, pf) {
    let s = 0;
    const atkPower = calculatePower({ ...fromD, infantry: Math.max(0, fromD.infantry - 1) }, true);
    const defPower = calculatePower(toD, false);

    s += (atkPower / Math.max(1, defPower)) * 22;
    const reg = REGIONS.find(r => r.id === toId);
    if (reg?.strategic) s += 28;
    if (toD.faction === "NEUTRAL") s += 20;
    if (toD.faction === pf) {
        s += 25;
        if (defPower < 50) s += 28;
    }
    const surround = (ADJ[toId] || []).filter(x => state[x]?.faction === aiKey).length;
    s += surround * 10;
    const exposed = (ADJ[fromId] || []).filter(x => state[x]?.faction !== aiKey).length;
    s -= exposed * 3;
    return s;
}

export function runAI(aiKey, state, pf) {
    const myIds = Object.entries(state).filter(([, v]) => v.faction === aiKey).map(([k]) => k);
    const moves = [];
    myIds.forEach(fid => {
        const fd = state[fid];
        if (calculatePower(fd, true) < 18) return;
        (ADJ[fid] || []).forEach(tid => {
            const td = state[tid];
            if (!td || td.faction === aiKey) return;
            moves.push({ from: fid, to: tid, score: aiScore(fid, tid, fd, td, aiKey, state, pf) });
        });
    });
    moves.sort((a, b) => b.score - a.score);
    const max = aiKey === "CHINA" ? 5 : aiKey === "EAST" ? 3 : 4;
    const used = new Set();
    const out = [];
    for (const m of moves) {
        if (out.length >= max || used.has(m.from)) continue;
        if (calculatePower(state[m.from], true) < 22) continue;
        used.add(m.from);
        out.push(m);
    }
    return out;
}

// processStability — runs faction-level crisis checks each turn.
// Returns { updatedFactions, updatedRegions } with any applied changes.
export function processStability(factions, regions, turn, log) {
    const updatedFactions = { ...factions };
    const updatedRegions = { ...regions };

    Object.keys(updatedFactions).forEach(fk => {
        const fac = { ...updatedFactions[fk] };
        const ownedIds = Object.keys(updatedRegions).filter(rid => updatedRegions[rid].faction === fk);

        // Natural stability recovery
        fac.stability = Math.min(100, fac.stability + 1);

        // High threat = stability bleed
        const threat = getThreatLevel(fk, updatedRegions);
        if (threat > 200) fac.stability = Math.max(0, fac.stability - 3);
        else if (threat > 100) fac.stability = Math.max(0, fac.stability - 1);

        // Rebellion: very low stability causes a random owned region to flip to NEUTRAL
        if (fac.stability < 25 && ownedIds.length > 1) {
            const weakest = ownedIds
                .filter(rid => updatedRegions[rid].stability < 40)
                .sort((a, b) => updatedRegions[a].stability - updatedRegions[b].stability)[0];
            if (weakest) {
                updatedRegions[weakest] = { ...updatedRegions[weakest], faction: 'NEUTRAL' };
                if (log) log.unshift(`CRISIS: Rebellion — ${weakest.toUpperCase()} has broken away from ${fk}!`);
            }
        }

        // Region stability slowly recovers each turn
        ownedIds.forEach(rid => {
            const r = updatedRegions[rid];
            if (r.stability < 100) {
                updatedRegions[rid] = { ...r, stability: Math.min(100, r.stability + 2) };
            }
        });

        updatedFactions[fk] = fac;
    });

    return { updatedFactions, updatedRegions };
}

export function getThreatLevel(fid, rs) {
    let out = 0;
    for (const rid of Object.keys(rs)) {
        if (rs[rid].faction !== fid) continue;
        const adjs = ADJ[rid] || [];
        for (const n of adjs) {
            if (rs[n] && rs[n].faction !== fid && rs[n].faction !== "NEUTRAL") {
                out += calculatePower(rs[n], true);
            }
        }
    }
    return out;
}
