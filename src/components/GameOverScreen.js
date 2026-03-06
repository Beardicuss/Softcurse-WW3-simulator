import React, { useEffect, useRef } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity,
    Animated, Dimensions, ScrollView
} from 'react-native';
import useGameStore from '../store/useGameStore';
import { FD } from '../data/mapData';
import { useTranslation } from '../i18n/i18n';

const { width, height } = Dimensions.get('window');

// ─── Outcome definitions ──────────────────────────────────────────────────────
const OUTCOMES = {
    victory: {
        title:    '🏆 WORLD DOMINATION',
        color:    '#f1c40f',
        glow:     'rgba(241,196,15,0.15)',
        border:   '#f1c40f',
        icon:     '🏆',
        sub:      (faction, turns) => `${FD[faction]?.name || faction} conquers the globe in ${turns} turns.`,
    },
    military: {
        title:    '💀 MILITARY DEFEAT',
        color:    '#e74c3c',
        glow:     'rgba(231,76,60,0.15)',
        border:   '#e74c3c',
        icon:     '💀',
        sub:      () => 'All territory has been lost. The command structure has dissolved.',
    },
    collapse: {
        title:    '🔥 SYSTEMATIC COLLAPSE',
        color:    '#e67e22',
        glow:     'rgba(230,126,34,0.15)',
        border:   '#e67e22',
        icon:     '🔥',
        sub:      () => 'Internal stability reached zero. The government fell from within.',
    },
    nuclear: {
        title:    '☢ NUCLEAR ANNIHILATION',
        color:    '#9b59b6',
        glow:     'rgba(155,89,182,0.15)',
        border:   '#9b59b6',
        icon:     '☢',
        sub:      () => 'The warheads fell. There is nothing left to command.',
    },
};

// ─── Stat row ─────────────────────────────────────────────────────────────────
const StatRow = ({ label, value, color = '#c0c0c0' }) => (
    <View style={styles.statRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
);

// ─── Main component ───────────────────────────────────────────────────────────
const GameOverScreen = () => {
    const {
        gameOverReason, playerFaction, factions, regions,
        turn, act, gameLog, startGame, setUiMode,
    } = useGameStore();

    const outcome = OUTCOMES[gameOverReason] || OUTCOMES.military;
    const fac     = factions[playerFaction] || {};
    const ownedCount = Object.values(regions).filter(r => r.faction === playerFaction).length;
    const totalRegions = Object.keys(regions).length;
    const controlPct = totalRegions > 0 ? Math.round((ownedCount / totalRegions) * 100) : 0;

    // Animated values
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const glowAnim  = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
                Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
            ]),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
                ])
            ),
        ]).start();
    }, []);

    const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });

    return (
        <View style={styles.container}>
            {/* Background pulse */}
            <Animated.View style={[
                styles.bgGlow,
                { backgroundColor: outcome.glow, opacity: glowOpacity }
            ]} />

            <Animated.View style={[
                styles.card,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }], borderColor: outcome.border }
            ]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: outcome.glow }]}>
                    <Text style={styles.headerIcon}>{outcome.icon}</Text>
                    <View>
                        <Text style={[styles.title, { color: outcome.color }]}>{outcome.title}</Text>
                        <Text style={styles.subtitle}>{outcome.sub(playerFaction, turn - 1)}</Text>
                    </View>
                </View>

                {/* Act reached banner */}
                <View style={[styles.actBanner, { borderColor: outcome.border }]}>
                    <Text style={styles.actLabel}>ACT REACHED</Text>
                    <Text style={[styles.actValue, { color: outcome.color }]}>
                        {act === 1 ? 'I · COLD WAR' : act === 2 ? 'II · GLOBAL WAR' : 'III · NUCLEAR ESCALATION'}
                    </Text>
                </View>

                {/* Campaign summary */}
                <View style={styles.summaryBlock}>
                    <Text style={styles.summaryTitle}>CAMPAIGN SUMMARY</Text>
                    <StatRow label="Turns survived:"         value={turn - 1} />
                    <StatRow label="Regions held at end:"   value={`${ownedCount} / ${totalRegions}`} />
                    <StatRow label="Territory control:"     value={`${controlPct}%`} color={outcome.color} />
                    <StatRow label="Faction stability:"     value={`${Math.round(fac.stability || 0)}%`}
                        color={(fac.stability || 0) > 50 ? '#2ecc71' : '#e74c3c'} />
                    <StatRow label="Funds remaining:"       value={`$${fac.funds || 0}`} />
                    <StatRow label="Nukes remaining:"       value={fac.nukes || 0} />
                </View>

                {/* Last log entries */}
                {gameLog?.length > 0 && (
                    <View style={styles.logBlock}>
                        <Text style={styles.logTitle}>FINAL INTELLIGENCE REPORT</Text>
                        {gameLog.slice(0, 3).map((entry, i) => (
                            <Text key={i} style={[styles.logEntry, i === 0 && { color: '#fff' }]}>
                                › {entry}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.menuBtn}
                        onPress={() => setUiMode('MENU')}
                    >
                        <Text style={styles.menuBtnText}>MAIN MENU</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.newGameBtn, { borderColor: outcome.color }]}
                        onPress={() => setUiMode('FACTION')}
                    >
                        <Text style={[styles.newGameBtnText, { color: outcome.color }]}>
                            NEW CAMPAIGN
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.96)',
        justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
    },
    bgGlow: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    },
    card: {
        width: width * 0.88,
        maxHeight: height * 0.88,
        backgroundColor: '#060d18',
        borderWidth: 1.5,
        borderRadius: 6,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.07)',
    },
    headerIcon: { fontSize: 36 },
    title: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
    },
    subtitle: {
        color: '#888',
        fontSize: 11,
        marginTop: 3,
        maxWidth: width * 0.65,
    },
    actBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    actLabel: { color: '#444', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
    actValue: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    summaryBlock: {
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        gap: 8,
    },
    summaryTitle: {
        color: '#3a9eff',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 6,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: { color: '#666', fontSize: 12 },
    statValue:  { fontSize: 12, fontWeight: '700' },
    logBlock: {
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        gap: 5,
    },
    logTitle: {
        color: '#3a9eff',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 6,
    },
    logEntry: { color: '#555', fontSize: 10, lineHeight: 15 },
    actions: {
        flexDirection: 'row',
        gap: 12,
        padding: 18,
    },
    menuBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#333',
        alignItems: 'center',
    },
    menuBtnText: { color: '#666', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    newGameBtn: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 3,
        borderWidth: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    newGameBtnText: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
});

export default GameOverScreen;
