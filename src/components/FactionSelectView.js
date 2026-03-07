import React, { memo, useState } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity,
    ScrollView, Animated
} from 'react-native';
import { ChevronRight, ShieldAlert, Crosshair, Shield } from 'lucide-react-native';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';
import { FD } from '../data/mapData';

const ALL_FACTIONS = ['NATO', 'EAST', 'CHINA', 'INDIA', 'LATAM'];

const FACTION_DESCS = {
    NATO:  'Technological superiority & economic dominance. Best attack, strong economy.',
    EAST:  'Vast Eurasian territory & nuclear arsenal. Best defense, most nukes.',
    CHINA: "World's largest army & Pacific dominance. Balanced stats, large starts.",
    INDIA: "Rising superpower with nuclear arsenal and massive population. Strong defense.",
    LATAM: "Resource-rich coalition. Lower nukes but high income and territorial spread.",
    INDIA: 'Rising superpower. Strong population base, growing nuclear deterrent.',
    LATAM: 'Resource-rich coalition. Controls critical raw materials, guerrilla doctrine.',
};

const FactionSelectView = ({ onStart }) => {
    const t = useTranslation();
    const setUiMode = useGameStore(s => s.setUiMode);
    const [selected, setSelected] = useState(null);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('faction.selectAlignment')}</Text>
                        <Text style={styles.subtitle}>{t('faction.subtitle')}</Text>
                    </View>

                    {/* 2-column grid */}
                    <View style={styles.grid}>
                        {ALL_FACTIONS.map(fk => {
                            const fd = FD[fk];
                            if (!fd) return null;
                            const isSelected = selected === fk;
                            return (
                                <TouchableOpacity
                                    key={fk}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.card,
                                        { borderColor: isSelected ? fd.color : '#1a2a3a' },
                                        isSelected && { backgroundColor: `${fd.color}18` },
                                        fk === 'LATAM' && ALL_FACTIONS.length % 2 !== 0 && { marginLeft: 'auto', marginRight: 'auto' },
                                    ]}
                                    onPress={() => setSelected(fk)}
                                >
                                    {/* Flag + Name */}
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.flag}>{fd.flag}</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.factionName, { color: fd.color }]} numberOfLines={1} adjustsFontSizeToFit>
                                                {fd.name}
                                            </Text>
                                            <Text style={styles.factionShort}>{fd.short} {t('faction.command')}</Text>
                                        </View>
                                        {isSelected && (
                                            <View style={[styles.selectedBadge, { backgroundColor: fd.color }]}>
                                                <Text style={styles.selectedBadgeText}>✓</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Description */}
                                    <Text style={styles.desc} numberOfLines={2}>
                                        {t(`faction.${fk.toLowerCase()}.desc`) !== `faction.${fk.toLowerCase()}.desc`
                                            ? t(`faction.${fk.toLowerCase()}.desc`)
                                            : (fd.desc || FACTION_DESCS[fk])}
                                    </Text>

                                    {/* Stats */}
                                    <View style={styles.statsContainer}>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statIcon}>⚔</Text>
                                            <Text style={styles.statLine}>{t('stat.atk')} {fd.atk}x</Text>
                                        </View>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statIcon}>🛡</Text>
                                            <Text style={styles.statLine}>{t('stat.def')} {fd.def}x</Text>
                                        </View>
                                        <View style={styles.statBox}>
                                            <Text style={[styles.statLine, { color: '#e74c3c' }]}>☢ {fd.nukes}</Text>
                                        </View>
                                        <View style={styles.statBox}>
                                            <Text style={[styles.statLine, { color: '#f0a030' }]}>💰 {fd.income}/t</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => setUiMode('MENU')}>
                            <Text style={styles.backText}>← {t('faction.back')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.startBtn,
                                !selected && { opacity: 0.4 },
                                selected && { backgroundColor: FD[selected]?.color || '#cc0000' }
                            ]}
                            disabled={!selected}
                            onPress={() => { if (selected) onStart(selected); }}
                        >
                            <Text style={styles.startText}>{t('faction.initialize')}</Text>
                            <ChevronRight color="#fff" size={20} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050a12' },
    content: { padding: 16, paddingBottom: 40 },
    header: { alignItems: 'center', marginVertical: 24 },
    title: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 4 },
    subtitle: { fontSize: 11, color: '#4a6070', marginTop: 8, letterSpacing: 1 },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    card: {
        width: '47%',
        backgroundColor: '#08111c',
        borderWidth: 1.5,
        padding: 14,
        borderRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    flag: { fontSize: 32 },
    factionName: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
    factionShort: { fontSize: 8, color: '#3a5060', letterSpacing: 2, marginTop: 2 },
    selectedBadge: {
        width: 22, height: 22, borderRadius: 11,
        justifyContent: 'center', alignItems: 'center',
    },
    selectedBadgeText: { color: '#fff', fontSize: 12, fontWeight: '900' },
    desc: { fontSize: 10, color: '#5a7080', lineHeight: 15, marginBottom: 10 },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#0a1520',
    },
    statBox: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    statIcon: { fontSize: 9 },
    statLine: { color: '#8090a0', fontSize: 9, fontWeight: '700' },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    backBtn: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#1a2a3a',
        justifyContent: 'center',
    },
    backText: { color: '#4a6070', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    startBtn: {
        flex: 1,
        backgroundColor: '#cc0000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
        elevation: 5,
    },
    startText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
});

export default memo(FactionSelectView);
