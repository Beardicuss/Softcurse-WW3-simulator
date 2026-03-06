import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Dimensions
} from 'react-native';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../logic/achievements';
import { FD } from '../data/mapData';

const { width, height } = Dimensions.get('window');

const REASON_COLORS = {
    victory:  '#f0a030',
    military: '#e74c3c',
    collapse: '#e67e22',
    nuclear:  '#9b59b6',
};

const MODE_LABELS = {
    campaign: 'CAMPAIGN',
    blitz:    'BLITZ',
    survival: 'SURVIVAL',
};

const LeaderboardScreen = ({ onClose }) => {
    const lang         = useGameStore(s => s.settings?.language || 'en');
    const t            = useTranslation();
    const leaderboard  = useGameStore(s => s.leaderboard || []);
    const achievements = useGameStore(s => s.achievements || {});
    const markSeen     = useGameStore(s => s.markAchievementSeen);
    const [tab, setTab] = useState('leaderboard'); // 'leaderboard' | 'achievements'
    const [achCat, setAchCat] = useState('all');

    const ru = lang === 'ru';

    const unlockedCount = Object.keys(achievements).length;
    const totalAch = ACHIEVEMENTS.length;

    const filteredAch = achCat === 'all'
        ? ACHIEVEMENTS
        : ACHIEVEMENTS.filter(a => a.category === achCat);

    return (
        <View style={styles.overlay}>
            <View style={styles.panel}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>
                            {t('lb.title')}
                        </Text>
                        <Text style={styles.subtitle}>
                            {unlockedCount}/{totalAch} {t('lb.unlocked')}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Text style={styles.closeBtnText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab bar */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tab, tab === 'leaderboard' && styles.tabActive]}
                        onPress={() => setTab('leaderboard')}
                    >
                        <Text style={[styles.tabText, tab === 'leaderboard' && styles.tabTextActive]}>
                            🏆 {t('lb.tab.rank')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, tab === 'achievements' && styles.tabActive]}
                        onPress={() => setTab('achievements')}
                    >
                        <Text style={[styles.tabText, tab === 'achievements' && styles.tabTextActive]}>
                            🎖 {t('lb.tab.ach')}
                            {Object.values(achievements).some(a => !a.seen)
                                ? <Text style={{ color: '#e74c3c' }}> ●</Text> : ''}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── LEADERBOARD TAB ── */}
                {tab === 'leaderboard' && (
                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                        {leaderboard.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>🏆</Text>
                                <Text style={styles.emptyText}>
                                    {ru ? 'Нет записей. Завершите игру, чтобы войти в рейтинг.' :
                                         t('lb.empty')}
                                </Text>
                            </View>
                        ) : (
                            leaderboard.map((entry, i) => {
                                const fData = FD[entry.faction] || {};
                                const rLabel = t(`lb.reason.${entry.reason}`) || entry.reason?.toUpperCase();
                                const rColor = REASON_COLORS[entry.reason] || '#aaa';
                                return (
                                    <View key={i} style={[
                                        styles.lbRow,
                                        i === 0 && styles.lbRowFirst,
                                    ]}>
                                        {/* Rank */}
                                        <Text style={[styles.lbRank, i < 3 && { color: ['#f0a030','#c0c0c0','#cd7f32'][i] }]}>
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                        </Text>

                                        {/* Faction */}
                                        <View style={styles.lbFaction}>
                                            <Text style={styles.lbFlag}>{fData.flag}</Text>
                                            <View>
                                                <Text style={[styles.lbFactionName, { color: fData.color || '#fff' }]}>
                                                    {fData.short || entry.faction}
                                                </Text>
                                                <Text style={styles.lbMode}>{MODE_LABELS[entry.gameMode] || 'CAMPAIGN'}</Text>
                                            </View>
                                        </View>

                                        {/* Score */}
                                        <View style={styles.lbScore}>
                                            <Text style={styles.lbScoreNum}>{entry.score?.toLocaleString()}</Text>
                                            <Text style={[styles.lbReason, { color: rColor }]}>{rLabel}</Text>
                                        </View>

                                        {/* Meta */}
                                        <View style={styles.lbMeta}>
                                            <Text style={styles.lbMetaText}>T{entry.turns}</Text>
                                            <Text style={styles.lbMetaText}>{entry.regions}R</Text>
                                            <Text style={styles.lbMetaDate}>{entry.date}</Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                        <View style={{ height: 20 }} />
                    </ScrollView>
                )}

                {/* ── ACHIEVEMENTS TAB ── */}
                {tab === 'achievements' && (
                    <View style={{ flex: 1 }}>
                        {/* Category filter */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.catScroll}
                            contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
                        >
                            <TouchableOpacity
                                style={[styles.catChip, achCat === 'all' && styles.catChipActive]}
                                onPress={() => setAchCat('all')}
                            >
                                <Text style={[styles.catChipText, achCat === 'all' && { color: '#fff' }]}>
                                    ALL ({unlockedCount}/{totalAch})
                                </Text>
                            </TouchableOpacity>
                            {ACHIEVEMENT_CATEGORIES.map(cat => {
                                const catTotal = ACHIEVEMENTS.filter(a => a.category === cat.id).length;
                                const catDone  = ACHIEVEMENTS.filter(a => a.category === cat.id && achievements[a.id]).length;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.catChip, achCat === cat.id && { borderColor: cat.color, backgroundColor: `${cat.color}22` }]}
                                        onPress={() => setAchCat(cat.id)}
                                    >
                                        <Text style={[styles.catChipText, achCat === cat.id && { color: cat.color }]}>
                                            {cat.emoji} {cat.label} ({catDone}/{catTotal})
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Achievement list */}
                        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.achGrid}>
                                {filteredAch.map(ach => {
                                    const unlocked = !!achievements[ach.id];
                                    const unseen   = unlocked && !achievements[ach.id]?.seen;
                                    const cat = ACHIEVEMENT_CATEGORIES.find(c => c.id === ach.category);
                                    return (
                                        <TouchableOpacity
                                            key={ach.id}
                                            style={[
                                                styles.achCard,
                                                unlocked && { borderColor: cat?.color || '#3a9eff', backgroundColor: `${cat?.color || '#3a9eff'}12` },
                                                !unlocked && styles.achCardLocked,
                                            ]}
                                            onPress={() => unlocked && markSeen(ach.id)}
                                            activeOpacity={0.8}
                                        >
                                            {unseen && <View style={styles.unseenDot} />}
                                            <Text style={[styles.achIcon, !unlocked && styles.achIconLocked]}>
                                                {unlocked ? ach.icon : '🔒'}
                                            </Text>
                                            <Text style={[styles.achTitle, unlocked && { color: '#fff' }]}>
                                                {ru ? (ach.titleRu || ach.title) : ach.title}
                                            </Text>
                                            <Text style={styles.achDesc} numberOfLines={2}>
                                                {unlocked
                                                    ? (ru ? (ach.descRu || ach.desc) : ach.desc)
                                                    : (ru ? (ach.descRu || ach.desc) : ach.desc)}
                                            </Text>
                                            {unlocked && achievements[ach.id]?.unlockedAt && (
                                                <Text style={styles.achTurn}>
                                                    {t('lb.ach.unlockedTurn')} {achievements[ach.id].unlockedAt}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.88)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 300,
    },
    panel: {
        width: width - 16,
        height: height * 0.92,
        backgroundColor: '#060c14',
        borderWidth: 1,
        borderColor: '#1a2a3a',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1a2a3a',
        backgroundColor: '#08111c',
    },
    title: {
        color: '#f0a030',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 3,
    },
    subtitle: {
        color: '#3a5060',
        fontSize: 10,
        letterSpacing: 1,
        marginTop: 2,
    },
    closeBtn: { padding: 8 },
    closeBtnText: { color: '#5f727d', fontSize: 20 },

    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#1a2a3a',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#f0a030',
        backgroundColor: 'rgba(240,160,48,0.06)',
    },
    tabText: {
        color: '#3a5060',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    tabTextActive: {
        color: '#f0a030',
    },

    scroll: {
        flex: 1,
        paddingHorizontal: 12,
    },

    // Leaderboard
    lbRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#0a1520',
        gap: 8,
    },
    lbRowFirst: {
        backgroundColor: 'rgba(240,160,48,0.06)',
        borderLeftWidth: 3,
        borderLeftColor: '#f0a030',
        paddingLeft: 8,
    },
    lbRank: {
        width: 32,
        color: '#5f727d',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '900',
    },
    lbFaction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    lbFlag: { fontSize: 18 },
    lbFactionName: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    lbMode: {
        color: '#3a5060',
        fontSize: 9,
        letterSpacing: 1,
    },
    lbScore: {
        alignItems: 'flex-end',
        minWidth: 80,
    },
    lbScoreNum: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    lbReason: {
        fontSize: 8,
        fontWeight: '700',
        letterSpacing: 1,
    },
    lbMeta: {
        alignItems: 'flex-end',
        minWidth: 50,
    },
    lbMetaText: {
        color: '#5f727d',
        fontSize: 9,
        letterSpacing: 1,
    },
    lbMetaDate: {
        color: '#2a3a44',
        fontSize: 8,
    },

    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 32,
    },
    emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.3 },
    emptyText: {
        color: '#3a5060',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Achievements
    catScroll: {
        maxHeight: 46,
        borderBottomWidth: 1,
        borderBottomColor: '#0a1520',
        paddingVertical: 6,
    },
    catChip: {
        borderWidth: 1,
        borderColor: '#1a2a3a',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 2,
    },
    catChipActive: {
        borderColor: '#f0a030',
        backgroundColor: 'rgba(240,160,48,0.15)',
    },
    catChipText: {
        color: '#3a5060',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
    },
    achGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingTop: 12,
    },
    achCard: {
        width: (width - 16 - 24 - 8) / 3,
        padding: 10,
        borderWidth: 1,
        borderColor: '#1a2a3a',
        backgroundColor: '#08111c',
        position: 'relative',
        minHeight: 90,
    },
    achCardLocked: {
        opacity: 0.45,
    },
    unseenDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e74c3c',
    },
    achIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    achIconLocked: {
        opacity: 0.5,
    },
    achTitle: {
        color: '#7090a0',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 3,
    },
    achDesc: {
        color: '#3a5060',
        fontSize: 8,
        lineHeight: 11,
    },
    achTurn: {
        color: '#2a4a5a',
        fontSize: 7,
        marginTop: 4,
        letterSpacing: 1,
    },
});

export default LeaderboardScreen;
