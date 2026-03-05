import { REGIONS, ADJ, FD } from '../data/mapData';

export const INITIAL_DATE = new Date(2026, 4, 1); // May 1, 2026

export const UNIT_STATS = {
    infantry: { atk: 1, def: 2, cost: 1, oil: 0 },
    armor: { atk: 3, def: 2, cost: 3, oil: 1 },
    air: { atk: 5, def: 0, cost: 5, oil: 2 }
};

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

    ["NATO", "EAST", "CHINA"].forEach(fk => {
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
    ["NATO", "EAST", "CHINA"].forEach(fk => {
        fs[fk] = {
            nukes: FD[fk].nukes,
            funds: 1000,
            oil: 500,
            supplies: 800,
            stability: 100,
            alertLevel: 1 // 1-5
        };
    });

    return { rs, fs, date: INITIAL_DATE.getTime() };
}

export function calculateIncome(factionKey, regions) {
    let income = FD[factionKey].income || 10;
    let oilProd = 0;

    Object.values(regions).forEach(r => {
        if (r.faction === factionKey) {
            income += Math.floor((r.economy * 0.2) + (r.industry * 0.5));
            if (r.strategic) oilProd += 10;
        }
    });

    return { income, oilProd };
}

export function calculatePower(region, isAttacking = true) {
    const { infantry = 0, armor = 0, air = 0 } = region;
    if (isAttacking) {
        return (infantry * UNIT_STATS.infantry.atk) + (armor * UNIT_STATS.armor.atk) + (air * UNIT_STATS.air.atk);
    } else {
        return (infantry * UNIT_STATS.infantry.def) + (armor * UNIT_STATS.armor.def) + (air * UNIT_STATS.air.def);
    }
}

export function applyCasualties(region, damage) {
    let remainingDamage = damage;
    let { infantry = 0, armor = 0, air = 0 } = region;

    // Infantry dies first (1 hp each)
    const infLoss = Math.min(infantry, remainingDamage);
    infantry -= infLoss;
    remainingDamage -= infLoss;

    // Armor dies next (3 hp each)
    if (remainingDamage > 0) {
        const armorLoss = Math.min(armor, Math.floor(remainingDamage / 3));
        armor -= armorLoss;
        remainingDamage -= armorLoss * 3;
    }

    // Air dies last (2 hp each)
    if (remainingDamage > 0) {
        const airLoss = Math.min(air, Math.floor(remainingDamage / 2));
        air -= airLoss;
    }

    return { infantry, armor, air };
}

export function doCombat(attRegion, defRegion, ab, db, attackerStability = 100, defenderStability = 100) {
    const stabilityModA = attackerStability / 100;
    const stabilityModD = defenderStability / 100;

    // Attacker loses 1 infantry staying behind, combat power calculated from the rest
    const attackingForces = {
        infantry: Math.max(0, attRegion.infantry - 1),
        armor: attRegion.armor,
        air: attRegion.air
    };

    const aPower = calculatePower(attackingForces, true) * ab * stabilityModA * (0.7 + Math.random() * 0.6);
    const dPower = calculatePower(defRegion, false) * db * stabilityModD * (0.7 + Math.random() * 0.6);

    const win = aPower > dPower;

    // Abstract damage points
    const aDamage = win ? Math.floor(dPower * (0.15 + Math.random() * 0.2)) : Math.floor(dPower * (0.4 + Math.random() * 0.25));
    const dDamage = win ? Math.floor(aPower * (0.5 + Math.random() * 0.3)) : Math.floor(aPower * (0.15 + Math.random() * 0.15));

    return {
        win,
        aDamage,
        dDamage,
        stabilityDamage: win ? 5 : 15
    };
}

export function calculateSupply(regions) {
    const factions = ['NATO', 'EAST', 'CHINA'];
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
