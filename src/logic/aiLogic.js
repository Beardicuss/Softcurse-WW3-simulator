/**
 * WW3: GLOBAL COLLAPSE — Nightmare AI Engine (Phase 6)
 *
 * Three layers:
 *  1. STRATEGIC LAYER  — map analysis, target prioritisation (oil, industry, chokepoints)
 *  2. TACTICAL LAYER   — combined arms, retreat decisions, reinforcement routing
 *  3. MEMORY LAYER     — tracks player build profile, queues counters
 */

import { REGIONS, ADJ, FD } from '../data/mapData';
import { UNIT_STATS, calculatePower, applyCasualties } from './gameLogic';
import { computeTechModifiers } from '../data/techTree';

// ─── Constants ────────────────────────────────────────────────────────────────

// Region strategic value weights (static — based on map design intent)
const REGION_VALUE = {
    // Oil-rich regions (Middle East, Russia, Central Asia)
    iran:       { oil: 30, industry: 15, strategic: true  },
    arabia:     { oil: 35, industry:  5, strategic: false },
    iraq_syria: { oil: 25, industry: 10, strategic: false },
    russia_w:   { oil: 20, industry: 25, strategic: true  },
    russia_e:   { oil: 20, industry: 15, strategic: true  },
    kazakhstan: { oil: 15, industry: 10, strategic: false },
    // Industrial powerhouses
    usa:        { oil: 10, industry: 40, strategic: true  },
    china_n:    { oil:  5, industry: 38, strategic: true  },
    germany:    { oil:  0, industry: 35, strategic: true  },
    japan:      { oil:  0, industry: 32, strategic: true  },
    india:      { oil:  5, industry: 28, strategic: true  },
    uk:         { oil:  5, industry: 30, strategic: true  },
    // Chokepoints / strategic bottlenecks
    turkey:     { oil:  5, industry: 15, strategic: true, chokepoint: true },
    poland:     { oil:  0, industry: 12, strategic: false, chokepoint: true },
    ukraine:    { oil:  5, industry: 18, strategic: true,  chokepoint: true },
    korea:      { oil:  0, industry: 14, strategic: false, chokepoint: true },
    taiwan:     { oil:  0, industry: 12, strategic: false, chokepoint: true },
    pakistan:   { oil:  5, industry: 10, strategic: false, chokepoint: true },
};

// How dangerous is it to send troops from this region?
// (leaving it exposed to counterattack)
function exposureRisk(fromId, regions, aiKey) {
    const neighbors = ADJ[fromId] || [];
    return neighbors.filter(n => {
        const r = regions[n];
        return r && r.faction !== aiKey && r.faction !== 'NEUTRAL';
    }).length;
}

// ─── 1. STRATEGIC LAYER ───────────────────────────────────────────────────────

/**
 * Score a potential attack target. Higher = higher priority.
 * Considers: resource value, encirclement potential, threat to player, chokepoints.
 */
export function strategicScore(fromId, toId, regions, aiKey, playerFaction, aiMemory) {
    const from = regions[fromId];
    const to   = regions[toId];
    if (!from || !to) return -999;

    let score = 0;

    const atkPower = calculatePower({ ...from, infantry: Math.max(0, from.infantry - 1) }, true);
    const defPower = calculatePower(to, false);
    const powerRatio = atkPower / Math.max(1, defPower);

    // ── Power advantage ────────────────────────────────────────────────────
    // Only attack if we have a clear advantage (or are very close)
    if (powerRatio < 0.7) return -999; // refuse suicidal attacks
    score += Math.min(powerRatio, 3.0) * 18; // capped — don't over-reward overkill

    // ── Resource value of target ───────────────────────────────────────────
    const rv = REGION_VALUE[toId];
    if (rv) {
        score += rv.oil      * 0.8; // oil is valuable
        score += rv.industry * 0.6; // industry slightly less urgent
        if (rv.chokepoint) score += 22;
    }

    // ── Dynamic resource value (from live region state) ────────────────────
    const toReg = regions[toId];
    score += (toReg.economy   || 0) * 0.15;
    score += (toReg.industry  || 0) * 0.20;
    if (!toReg.strategic) score -= 5; // slight penalty for non-strategic

    // ── Encirclement bonus — target surrounded by us ───────────────────────
    const surroundCount = (ADJ[toId] || [])
        .filter(n => regions[n]?.faction === aiKey).length;
    score += surroundCount * 12;

    // ── Targeting the player ───────────────────────────────────────────────
    if (to.faction === playerFaction) {
        score += 30;
        // Bonus if player region is weak (good moment to strike)
        if (defPower < 40) score += 25;
        // Extra bonus if this would cut supply lines
        const playerNeighbors = (ADJ[toId] || []).filter(n => regions[n]?.faction === playerFaction);
        if (playerNeighbors.length <= 1) score += 20; // would isolate
    }

    // ── Easy neutral grabs ─────────────────────────────────────────────────
    if (to.faction === 'NEUTRAL') {
        score += 15;
        if (defPower < 15) score += 10; // cheap win
    }

    // ── Exposure risk penalty ──────────────────────────────────────────────
    score -= exposureRisk(fromId, regions, aiKey) * 8;

    // ── Memory layer: avoid regions we've lost before (frustration memory) ─
    if (aiMemory?.recentLosses?.[toId] > 0) {
        score -= aiMemory.recentLosses[toId] * 15;
    }

    // ── Memory layer: prioritise targets that counter player doctrine ──────
    if (aiMemory?.playerDoctrineTarget === toId) score += 20;

    return score;
}

// ─── 2. TACTICAL LAYER ────────────────────────────────────────────────────────

/**
 * Decide whether to attack, consolidate, or reinforce.
 * Returns one of: 'attack' | 'hold' | 'reinforce'
 */
function tacticalDecision(fromId, toId, regions, aiKey) {
    const from = regions[fromId];
    const to   = regions[toId];

    const atkPower = calculatePower({ ...from, infantry: Math.max(0, from.infantry - 1) }, true);
    const defPower = calculatePower(to, false);
    const ratio    = atkPower / Math.max(1, defPower);

    // Combined arms check: does attacker have a mix of unit types?
    const hasCombinedArms = (from.armor || 0) > 0 && (from.infantry || 0) > 2;
    const hasAirSupport   = (from.air   || 0) > 0;

    // Pull back from losing battles
    if (ratio < 0.65) return 'hold';

    // Hold if no combined arms (infantry-only blob attacks are inefficient)
    if (!hasCombinedArms && ratio < 1.1) return 'hold';

    // Commit with confidence if combined arms + air superiority
    if (hasCombinedArms && hasAirSupport && ratio >= 0.9) return 'attack';
    if (ratio >= 1.2) return 'attack';

    return 'hold';
}

/**
 * Find the best region to route reinforcements FROM into a region.
 * Picks the friendly neighbor with the highest available power.
 */
function findReinforcementSource(targetId, regions, aiKey) {
    const neighbors = (ADJ[targetId] || [])
        .filter(n => regions[n]?.faction === aiKey)
        .sort((a, b) => calculatePower(regions[b], true) - calculatePower(regions[a], true));
    return neighbors[0] || null;
}

/**
 * Decide how to build units this turn for an AI faction.
 * Returns { infantry, armor, air } counts to build across owned regions.
 * Uses the memory layer to counter the player's observed doctrine.
 */
export function aiProductionPlan(aiKey, factions, regions, aiMemory) {
    const fac = factions[aiKey];
    if (!fac) return [];

    const funds    = fac.funds    || 0;
    const supplies = fac.supplies || 0;
    const owned    = Object.entries(regions).filter(([, r]) => r.faction === aiKey);

    if (owned.length === 0) return [];

    // Budget allocation strategy
    // Base: split 50% infantry / 30% armor / 20% air
    // Counter-doctrine adjustments from memory layer
    let armorWeight = 0.30;
    let airWeight   = 0.20;
    let infWeight   = 0.50;

    const doctrine = aiMemory?.playerDoctrine || 'balanced';
    if (doctrine === 'armor-heavy') {
        // Player is building lots of armor → build more air (anti-armor)
        airWeight   = 0.45;
        armorWeight = 0.15;
        infWeight   = 0.40;
    } else if (doctrine === 'air-heavy') {
        // Player stacking air → build more armor + infantry (cheaper, endurance)
        armorWeight = 0.45;
        airWeight   = 0.05;
        infWeight   = 0.50;
    } else if (doctrine === 'infantry-heavy') {
        // Player blobs infantry → build armor (counters infantry)
        armorWeight = 0.50;
        airWeight   = 0.20;
        infWeight   = 0.30;
    }

    // Determine eligible industrial regions for armor/air
    const industrialRegions = owned.filter(([, r]) => (r.industry || 0) >= 10).map(([id]) => id);
    const anyRegions        = owned.map(([id]) => id);

    const buildOrders = [];
    let remainingFunds    = funds;
    let remainingSupplies = supplies;

    // Helper: spend as many of a unit type as budget allows
    const buildUnits = (type, costF, costS, costI, maxCount, regionPool) => {
        let built = 0;
        while (built < maxCount && remainingFunds >= costF && remainingSupplies >= costS && regionPool.length > 0) {
            // Pick region with lowest current count of this type (spread units)
            const targetRegion = regionPool
                .filter(rid => (costI === 0 || (regions[rid]?.industry || 0) >= costI))
                .sort((a, b) => (regions[a]?.[type] || 0) - (regions[b]?.[type] || 0))[0];
            if (!targetRegion) break;
            buildOrders.push({ regionId: targetRegion, unitType: type });
            remainingFunds    -= costF;
            remainingSupplies -= costS;
            built++;
        }
    };

    // Infantry is cheap — always buy some
    const infBudget   = Math.floor(funds * infWeight);
    const armorBudget = Math.floor(funds * armorWeight);
    const airBudget   = Math.floor(funds * airWeight);

    const maxInf   = Math.floor(Math.min(infBudget   / 50,  remainingSupplies / 20));
    const maxArmor = Math.floor(Math.min(armorBudget  / 150, remainingSupplies / 50));
    const maxAir   = Math.floor(Math.min(airBudget    / 300, remainingSupplies / 100));

    buildUnits('infantry', 50,  20,  0,  Math.min(maxInf,   6), anyRegions);
    buildUnits('armor',    150, 50,  10, Math.min(maxArmor,  3), industrialRegions.length > 0 ? industrialRegions : anyRegions);
    buildUnits('air',      300, 100, 25, Math.min(maxAir,    2), industrialRegions.length > 0 ? industrialRegions : anyRegions);

    return buildOrders;
}

// ─── 3. MEMORY LAYER ─────────────────────────────────────────────────────────

/**
 * Analyse player's owned regions and deduce their build doctrine.
 * Returns: 'infantry-heavy' | 'armor-heavy' | 'air-heavy' | 'balanced'
 */
export function analysePlayerDoctrine(playerFaction, regions) {
    let totalInf = 0, totalArmor = 0, totalAir = 0;

    Object.values(regions).forEach(r => {
        if (r.faction !== playerFaction) return;
        totalInf   += r.infantry || 0;
        totalArmor += r.armor    || 0;
        totalAir   += r.air      || 0;
    });

    const total = Math.max(1, totalInf + totalArmor * 3 + totalAir * 5); // weight by unit cost
    const armorShare = (totalArmor * 3) / total;
    const airShare   = (totalAir   * 5) / total;
    const infShare   = totalInf        / total;

    if (armorShare > 0.40) return 'armor-heavy';
    if (airShare   > 0.35) return 'air-heavy';
    if (infShare   > 0.70) return 'infantry-heavy';
    return 'balanced';
}

/**
 * Update AI memory after each turn.
 * Tracks: recent losses per region, player doctrine, turn count.
 */
export function updateAIMemory(aiKey, prevMemory = {}, regions, factions, playerFaction) {
    const memory = { ...prevMemory };

    // Decay recent losses (memory fades over ~5 turns)
    const losses = { ...(memory.recentLosses || {}) };
    Object.keys(losses).forEach(rid => {
        losses[rid] = Math.max(0, losses[rid] - 0.2);
        if (losses[rid] < 0.1) delete losses[rid];
    });
    memory.recentLosses = losses;

    // Update player doctrine reading
    memory.playerDoctrine = analysePlayerDoctrine(playerFaction, regions);

    // Find highest-value player region as doctrine target (what the AI wants most)
    const playerRegions = Object.entries(regions).filter(([, r]) => r.faction === playerFaction);
    if (playerRegions.length > 0) {
        const best = playerRegions.sort(([ia, a], [ib, b]) => {
            const va = (REGION_VALUE[ia]?.oil || 0) + (REGION_VALUE[ia]?.industry || 0) + (a.economy || 0);
            const vb = (REGION_VALUE[ib]?.oil || 0) + (REGION_VALUE[ib]?.industry || 0) + (b.economy || 0);
            return vb - va;
        })[0];
        memory.playerDoctrineTarget = best[0];
    }

    memory.turn = (memory.turn || 0) + 1;
    return memory;
}

/**
 * Record a failed attack attempt into AI memory.
 */
export function recordAILoss(aiKey, toId, memory = {}) {
    const losses = { ...(memory.recentLosses || {}) };
    losses[toId] = (losses[toId] || 0) + 1.0;
    return { ...memory, recentLosses: losses };
}

// ─── MAIN AI RUNNER ───────────────────────────────────────────────────────────

/**
 * Full Nightmare AI turn for one faction.
 * Returns { moves, buildOrders, updatedMemory }
 */
export function runNightmareAI(aiKey, regions, factions, playerFaction, aiMemory = {}) {
    const myIds = Object.keys(regions).filter(id => regions[id].faction === aiKey);
    const candidateMoves = [];

    myIds.forEach(fromId => {
        const from = regions[fromId];
        const atkPower = calculatePower(from, true);
        if (atkPower < 15) return; // too weak to attack

        (ADJ[fromId] || []).forEach(toId => {
            const to = regions[toId];
            if (!to || to.faction === aiKey) return;

            const decision = tacticalDecision(fromId, toId, regions, aiKey);
            if (decision === 'hold') return; // tactical layer says no

            const score = strategicScore(fromId, toId, regions, aiKey, playerFaction, aiMemory);
            if (score <= -999) return;

            candidateMoves.push({ from: fromId, to: toId, score, decision });
        });
    });

    // Sort by score descending
    candidateMoves.sort((a, b) => b.score - a.score);

    // Select moves — each region can only attack once, limit total moves per faction
    const maxMoves = aiKey === 'CHINA' ? 6 : aiKey === 'EAST' ? 5 : 4;
    const usedFrom = new Set();
    const usedTo   = new Set();
    const moves    = [];

    for (const m of candidateMoves) {
        if (moves.length >= maxMoves) break;
        if (usedFrom.has(m.from)) continue;
        if (usedTo.has(m.to)) continue; // don't pile 2 stacks on same target

        // Minimum power check (don't send a skeleton crew)
        if (calculatePower(regions[m.from], true) < 20) continue;

        usedFrom.add(m.from);
        usedTo.add(m.to);
        moves.push(m);
    }

    // Reinforcement pass: vulnerable AI regions get reinforced from strong rear regions
    const reinforcements = [];
    myIds.forEach(rid => {
        const r = regions[rid];
        const power = calculatePower(r, false);
        const threat = (ADJ[rid] || [])
            .filter(n => regions[n]?.faction !== aiKey && regions[n]?.faction !== 'NEUTRAL')
            .reduce((sum, n) => sum + calculatePower(regions[n] || {}, true), 0);

        if (threat > power * 1.5) {
            // This region is under serious threat — pull troops from a safe rear region
            const source = findReinforcementSource(rid, regions, aiKey);
            if (source && !usedFrom.has(source)) {
                const sourceR = regions[source];
                const sourceAdjacentToEnemy = (ADJ[source] || [])
                    .some(n => regions[n]?.faction !== aiKey && regions[n]?.faction !== 'NEUTRAL');
                // Only reinforce from a truly safe rear region
                if (!sourceAdjacentToEnemy && calculatePower(sourceR, true) > 30) {
                    reinforcements.push({ from: source, to: rid, isReinforcement: true });
                    usedFrom.add(source);
                }
            }
        }
    });

    // Build plan
    const buildOrders = aiProductionPlan(aiKey, factions, regions, aiMemory);

    // Update memory
    const updatedMemory = updateAIMemory(aiKey, aiMemory, regions, factions, playerFaction);

    return { moves, reinforcements, buildOrders, updatedMemory };
}
