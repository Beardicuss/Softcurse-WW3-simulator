import React, { memo, useState } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity,
    ScrollView, Dimensions
} from 'react-native';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';
import { TECH_BRANCHES, TECH_NODES, TECH_BY_ID, isExcluded } from '../data/techTree';

const { width, height } = Dimensions.get('window');

const ResearchPanel = ({ onClose }) => {
    const slideAnim = React.useRef(new Animated.Value(30)).current;
    const fadeAnim  = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: IS_LOW_END ? 0 : 180, useNativeDriver: true }),
            Animated.timing(fadeAnim,  { toValue: 1, duration: IS_LOW_END ? 0 : 180, useNativeDriver: true }),
        ]).start();
    }, []);
    const t = useTranslation();
    const playerFaction = useGameStore(s => s.playerFaction);
    const factionData4  = useGameStore(s => s.factions[s.playerFaction]);
    const researchTech  = useGameStore(s => s.researchTech);
    const fac = factionData4;
    const unlocked = fac?.unlockedTech || [];
    const techPoints = fac?.techPoints || 0;

    const [selectedBranch, setSelectedBranch] = useState(TECH_BRANCHES[0].id);

    const branchNodes = TECH_NODES.filter(n => n.branch === selectedBranch)
        .sort((a, b) => a.tier - b.tier);

    const getNodeState = (node) => {
        if (unlocked.includes(node.id)) return 'unlocked';
        if (isExcluded(node.id, unlocked)) return 'excluded';
        const prereqsMet = (node.requires || []).every(r => unlocked.includes(r));
        if (!prereqsMet) return 'locked';
        if (techPoints < node.cost) return 'unaffordable';
        return 'available';
    };

    const branch = TECH_BRANCHES.find(b => b.id === selectedBranch);

    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.panel, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>{t('research.header')}</Text>
                        <Text style={styles.headerSub}>{t('research.subtitle')}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.tpBadge}>
                            <Text style={styles.tpIcon}>⚗</Text>
                            <Text style={styles.tpValue}>{techPoints}</Text>
                            <Text style={styles.tpLabel}> TP</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeTxt}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Branch tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.branchBar}>
                    {TECH_BRANCHES.map(b => {
                        const isActive = b.id === selectedBranch;
                        const branchUnlocked = TECH_NODES.filter(n => n.branch === b.id && unlocked.includes(n.id)).length;
                        return (
                            <TouchableOpacity
                                key={b.id}
                                onPress={() => setSelectedBranch(b.id)}
                                style={[styles.branchTab, isActive && { borderBottomColor: b.color, borderBottomWidth: 2, backgroundColor: `${b.color}18` }]}
                            >
                                <Text style={styles.branchIcon}>{b.icon}</Text>
                                <Text style={[styles.branchLabel, isActive && { color: b.color }]}>{b.label}</Text>
                                {branchUnlocked > 0 && (
                                    <View style={[styles.branchBadge, { backgroundColor: b.color }]}>
                                        <Text style={styles.branchBadgeTxt}>{branchUnlocked}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Branch description strip */}
                <View style={[styles.branchStrip, { borderLeftColor: branch?.color }]}>
                    <Text style={[styles.branchStripIcon]}>{branch?.icon}</Text>
                    <Text style={[styles.branchStripLabel, { color: branch?.color }]}>{branch?.label} Program</Text>
                    <Text style={styles.branchStripSub}>
                        {branchNodes.filter(n => unlocked.includes(n.id)).length}/{branchNodes.length} researched
                    </Text>
                </View>

                {/* Tech nodes — tier pipeline */}
                <ScrollView style={styles.nodeScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.pipeline}>
                        {branchNodes.map((node, idx) => {
                            const nodeState = getNodeState(node);
                            const isUnlocked = nodeState === 'unlocked';
                            const isAvailable = nodeState === 'available';
                            const isExcl = nodeState === 'excluded';

                            return (
                                <View key={node.id} style={styles.nodeRow}>
                                    {/* Connector line - lit if previous node is unlocked */}
                                    {idx > 0 && (
                                        <View style={[
                                            styles.connector,
                                            unlocked.includes(branchNodes[idx - 1].id) && { backgroundColor: branch?.color }
                                        ]} />
                                    )}

                                    <TouchableOpacity
                                        style={[
                                            styles.nodeCard,
                                            isUnlocked   && { borderColor: branch?.color, backgroundColor: `${branch?.color}22` },
                                            isAvailable  && styles.nodeAvailable,
                                            isExcl       && styles.nodeExcluded,
                                            nodeState === 'locked' && styles.nodeLocked,
                                            nodeState === 'unaffordable' && styles.nodeUnaffordable,
                                        ]}
                                        onPress={() => isAvailable && researchTech(node.id)}
                                        disabled={!isAvailable}
                                    >
                                        <View style={styles.nodeTop}>
                                            <View style={styles.nodeTierBadge}>
                                                <Text style={styles.nodeTierTxt}>T{node.tier}</Text>
                                            </View>
                                            <Text style={styles.nodeIcon}>{node.icon}</Text>
                                            <Text style={[styles.nodeName, isUnlocked && { color: branch?.color }]}>{node.name}</Text>
                                            <View style={[styles.nodeCostBadge, isUnlocked && { backgroundColor: '#2ecc71' }, nodeState === 'unaffordable' && { backgroundColor: '#e74c3c44' }]}>
                                                {isUnlocked
                                                    ? <Text style={styles.nodeCostTxt}>✓</Text>
                                                    : <Text style={styles.nodeCostTxt}>⚗{node.cost}</Text>
                                                }
                                            </View>
                                        </View>
                                        <Text style={styles.nodeDesc}>{node.desc}</Text>

                                        {/* Effect pills */}
                                        <View style={styles.effectRow}>
                                            {Object.entries(node.effect).map(([k, v]) => {
                                                if (v === false || v === 0) return null;
                                                const label = formatEffect(k, v);
                                                return (
                                                    <View key={k} style={[styles.effectPill, { borderColor: branch?.color }]}>
                                                        <Text style={[styles.effectTxt, { color: branch?.color }]}>{label}</Text>
                                                    </View>
                                                );
                                            })}
                                        </View>

                                        {isExcl && <Text style={styles.exclNote}>⚠ Locked by mutual exclusion</Text>}
                                        {nodeState === 'locked' && node.requires?.length > 0 && (
                                            <Text style={styles.reqNote}>
                                                Requires: {node.requires.map(r => TECH_BY_ID[r]?.name).join(', ')}
                                            </Text>
                                        )}
                                        {isAvailable && (
                                            <TouchableOpacity style={[styles.researchBtn, { backgroundColor: branch?.color }]} onPress={() => researchTech(node.id)}>
                                                <Text style={styles.researchBtnTxt}>RESEARCH  ⚗{node.cost}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Active tech summary footer */}
                {unlocked.length > 0 && (
                    <View style={styles.activeFooter}>
                        <Text style={styles.activeFooterTitle}>⚡ ACTIVE EFFECTS</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeScroll}>
                            {unlocked.map(id => {
                                const n = TECH_BY_ID[id];
                                if (!n) return null;
                                const br = TECH_BRANCHES.find(b => b.id === n.branch);
                                return (
                                    <View key={id} style={[styles.activeChip, { borderColor: br?.color }]}>
                                        <Text style={styles.activeChipIcon}>{n.icon}</Text>
                                        <Text style={[styles.activeChipName, { color: br?.color }]}>{n.name}</Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

            </Animated.View>
        </View>
    );
};

function formatEffect(key, value) {
    const pct = (v) => `+${Math.round(v * 100)}%`;
    const map = {
        globalAtkBonus:       pct(value) + ' ATK',
        globalDefBonus:       pct(value) + ' DEF',
        armorDefBonus:        pct(value) + ' Armor DEF',
        armorAtkMult:         `Armor ATK ×${value}`,
        armorFreeUpkeep:      'Free Upkeep',
        airAtkBonus:          pct(value) + ' Air ATK',
        airCostMult:          `-${Math.round((1-value)*100)}% Air Cost`,
        freeAirPerStrategic:  `+${value} Free Air/Strategic`,
        enemyAtkDebuff:       `-${Math.round(value*100)}% Enemy ATK`,
        enemyIndustryDebuff:  `-${Math.round(value*100)}% Enemy IND`,
        incomeBonus:          pct(value) + ' Income',
        incomeStealPct:       `Steal ${Math.round(value*100)}% Enemy $`,
        globalCostMult:       `-${Math.round((1-value)*100)}% Unit Cost`,
        defPenetration:       `${Math.round(value*100)}% DEF Bypass`,
        nukeDamageMult:       `Nuke DMG ×${value}`,
        extraNukes:           `+${value} Nukes`,
        nukesSurviveStrike:   'Nuke Survive',
        tacticalNukes:        'Tactical Nukes',
        deadHand:             'Dead Hand Active',
        blackoutCharges:      `+${value} Blackout`,
        orbitalStrikeCharges: `+${value} Orbital Strike`,
        revealAI:             'Reveal AI Moves',
    };
    return map[key] || key;
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center', alignItems: 'center',
        zIndex: 500,
    },
    panel: {
        width: width * 0.95,
        maxHeight: height * 0.88,
        backgroundColor: '#070f1a',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(52,152,219,0.4)',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#0c1828',
        borderBottomWidth: 1, borderBottomColor: 'rgba(52,152,219,0.25)',
    },
    headerLeft: {},
    headerTitle: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
    headerSub:   { color: '#3a5878', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    tpBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(52,152,219,0.15)',
        borderWidth: 1, borderColor: 'rgba(52,152,219,0.4)',
        borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4,
    },
    tpIcon:  { fontSize: 12, marginRight: 4 },
    tpValue: { color: '#3498db', fontSize: 16, fontWeight: '900' },
    tpLabel: { color: '#3a5878', fontSize: 9, fontWeight: '700' },
    closeBtn: { padding: 6 },
    closeTxt: { color: '#4a6278', fontSize: 16, fontWeight: '900' },

    branchBar: {
        backgroundColor: '#0a1520',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    branchTab: {
        paddingHorizontal: 14, paddingVertical: 10,
        alignItems: 'center', flexDirection: 'row', gap: 6,
        borderBottomWidth: 2, borderBottomColor: 'transparent',
        position: 'relative',
    },
    branchIcon:  { fontSize: 14 },
    branchLabel: { color: '#3a5878', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    branchBadge: {
        width: 14, height: 14, borderRadius: 7,
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 4,
    },
    branchBadgeTxt: { color: '#000', fontSize: 8, fontWeight: '900' },

    branchStrip: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 14, paddingVertical: 8,
        borderLeftWidth: 3,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    branchStripIcon:  { fontSize: 16 },
    branchStripLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    branchStripSub:   { color: '#3a5060', fontSize: 9, marginLeft: 'auto' },

    nodeScroll: { flex: 1 },
    pipeline:   { padding: 12, gap: 0 },

    nodeRow:    { position: 'relative' },
    connector:  {
        width: 2, height: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center', marginVertical: 2,
    },

    nodeCard: {
        backgroundColor: '#0c1828',
        borderRadius: 4, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 12, marginBottom: 2,
    },
    nodeAvailable:    { borderColor: 'rgba(52,152,219,0.5)', backgroundColor: '#0d1e30' },
    nodeLocked:       { opacity: 0.45 },
    nodeUnaffordable: { opacity: 0.6 },
    nodeExcluded:     { opacity: 0.35, borderColor: '#e74c3c44' },

    nodeTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    nodeTierBadge: {
        width: 20, height: 20, borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center', justifyContent: 'center',
    },
    nodeTierTxt: { color: '#3a5878', fontSize: 8, fontWeight: '900' },
    nodeIcon:    { fontSize: 16 },
    nodeName:    { flex: 1, color: '#c0d0de', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
    nodeCostBadge: {
        backgroundColor: 'rgba(52,152,219,0.15)',
        borderRadius: 3, paddingHorizontal: 7, paddingVertical: 2,
    },
    nodeCostTxt:  { color: '#3498db', fontSize: 10, fontWeight: '900' },
    nodeDesc:     { color: '#4a6880', fontSize: 10, lineHeight: 15, marginBottom: 8 },

    effectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
    effectPill: {
        borderWidth: 1, borderRadius: 3,
        paddingHorizontal: 6, paddingVertical: 2,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    effectTxt: { fontSize: 8, fontWeight: '900' },

    exclNote: { color: '#e74c3c', fontSize: 9, fontStyle: 'italic', marginTop: 4 },
    reqNote:  { color: '#4a6278', fontSize: 9, fontStyle: 'italic', marginTop: 4 },

    researchBtn: {
        alignItems: 'center', paddingVertical: 7,
        borderRadius: 3, marginTop: 6,
    },
    researchBtnTxt: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },

    activeFooter: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.07)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#060d18',
    },
    activeFooterTitle: {
        color: '#2a4255',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    activeScroll: { flexGrow: 0 },
    activeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderRadius: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    activeChipIcon: { fontSize: 11 },
    activeChipName: { fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
});

export default memo(ResearchPanel);
