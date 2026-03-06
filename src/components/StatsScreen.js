import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Dimensions, Animated
} from 'react-native';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';
import { FD } from '../data/mapData';

const { width, height } = Dimensions.get('window');

const BAR_MAX_WIDTH = width * 0.55;

const StatBar = ({ value, max, color = '#3a9eff' }) => {
    const pct = Math.min(1, (value || 0) / Math.max(1, max));
    return (
        <View style={styles.barBg}>
            <View style={[styles.barFill, { width: pct * BAR_MAX_WIDTH, backgroundColor: color }]} />
        </View>
    );
};

const StatRow = ({ label, value, max, color, unit = '' }) => (
    <View style={styles.statRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statRight}>
            {max != null && <StatBar value={value} max={max} color={color} />}
            <Text style={[styles.statValue, color && { color }]}>
                {value}{unit}
            </Text>
        </View>
    </View>
);

const Section = ({ title, children, color = '#3a9eff' }) => (
    <View style={styles.section}>
        <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
            <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
        </View>
        {children}
    </View>
);

const StatsScreen = ({ onClose, isGameOver = false }) => {
    const t = useTranslation();
    const lang = useGameStore(s => s.settings?.language || 'en');
    const trackedStats  = useGameStore(s => s.trackedStats  || {});
    const endStats      = useGameStore(s => s.endStats      || null);
    const missionProgress = useGameStore(s => s.missionProgress || {});
    const playerFaction = useGameStore(s => s.playerFaction);
    const turn          = useGameStore(s => s.turn);
    const actPhase      = useGameStore(s => s.actPhase);
    const factions      = useGameStore(s => s.factions);
    const regions       = useGameStore(s => s.regions);

    const stats = endStats || trackedStats;
    const fac   = factions[playerFaction] || {};
    const ownedCount = Object.values(regions).filter(r => r.faction === playerFaction).length;
    const totalRegions = Object.keys(regions).length;
    const missionsTotal = Object.keys(missionProgress).length;
    const missionsDone  = Object.values(missionProgress).filter(p => p.status === 'complete').length;

    const winRate = stats.attacksLaunched > 0
        ? Math.round((stats.attacksWon / stats.attacksLaunched) * 100)
        : 0;

    const factionColor = FD[playerFaction]?.color || '#3a9eff';

    const LABELS = {
        en: {
            title:          'BATTLE STATISTICS',
            combat:         'COMBAT RECORD',
            attacks:        'Attacks Launched',
            won:            'Attacks Won',
            lost:           'Attacks Lost',
            winRate:        'Win Rate',
            unitsKilled:    'Units Destroyed',
            unitsLost:      'Units Lost',
            nukes:          'Nukes Launched',
            orbitals:       'Orbital Strikes',
            territory:      'TERRITORY CONTROL',
            captures:       'Regions Captured',
            losses:         'Regions Lost',
            peakRegions:    'Peak Regions Held',
            currentRegions: 'Current Regions',
            totalRegions:   'Total Regions',
            production:     'PRODUCTION',
            infantry:       'Infantry Trained',
            armor:          'Armor Deployed',
            air:            'Air Squadrons',
            naval:          'Naval Units',
            intelligence:   'INTELLIGENCE',
            reveals:        'Spy Reveals',
            sabotages:      'Sabotages',
            assassinations: 'Assassinations',
            sanctions:      'Sanctions Applied',
            campaign:       'CAMPAIGN',
            turnsPlayed:    'Turns Survived',
            actReached:     'Act Reached',
            peakStability:  'Peak Stability',
            lowStability:   'Lowest Stability',
            missions:       'Missions Complete',
            close:          'CLOSE',
        },
        ru: {
            title:          'БОЕВАЯ СТАТИСТИКА',
            combat:         'БОЕВОЙ ЖУРНАЛ',
            attacks:        'Атак проведено',
            won:            'Атак выиграно',
            lost:           'Атак проиграно',
            winRate:        'Процент побед',
            unitsKilled:    'Уничтожено войск',
            unitsLost:      'Потеряно войск',
            nukes:          'Ядерных пусков',
            orbitals:       'Орбитальных ударов',
            territory:      'ТЕРРИТОРИАЛЬНЫЙ КОНТРОЛЬ',
            captures:       'Захвачено регионов',
            losses:         'Потеряно регионов',
            peakRegions:    'Макс. регионов',
            currentRegions: 'Текущие регионы',
            totalRegions:   'Всего регионов',
            production:     'ПРОИЗВОДСТВО',
            infantry:       'Пехоты обучено',
            armor:          'Брони развёрнуто',
            air:            'Авиаэскадрилий',
            naval:          'Морских единиц',
            intelligence:   'РАЗВЕДКА',
            reveals:        'Разведок',
            sabotages:      'Диверсий',
            assassinations: 'Ликвидаций',
            sanctions:      'Санкций применено',
            campaign:       'КАМПАНИЯ',
            turnsPlayed:    'Ходов выжито',
            actReached:     'Достигнутый акт',
            peakStability:  'Макс. стабильность',
            lowStability:   'Мин. стабильность',
            missions:       'Миссий выполнено',
            close:          'ЗАКРЫТЬ',
        }
    };
    const L = LABELS[lang] || LABELS.en;

    return (
        <View style={styles.overlay}>
            <View style={styles.panel}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: factionColor }]}>
                    <View>
                        <Text style={styles.factionFlag}>{FD[playerFaction]?.flag}</Text>
                        <Text style={[styles.title, { color: factionColor }]}>{L.title}</Text>
                        <Text style={styles.subtitle}>
                            {FD[playerFaction]?.name}  ·  {L.turnsPlayed}: {stats.turnsPlayed || turn}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Text style={styles.closeBtnText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                    {/* COMBAT */}
                    <Section title={L.combat} color='#e74c3c'>
                        <StatRow label={L.attacks}     value={stats.attacksLaunched || 0} />
                        <StatRow label={L.won}         value={stats.attacksWon      || 0} max={stats.attacksLaunched || 1} color='#2ecc71' />
                        <StatRow label={L.lost}        value={stats.attacksLost     || 0} max={stats.attacksLaunched || 1} color='#e74c3c' />
                        <StatRow label={L.winRate}     value={winRate} unit='%'
                            color={winRate >= 60 ? '#2ecc71' : winRate >= 40 ? '#f39c12' : '#e74c3c'} />
                        <StatRow label={L.unitsKilled} value={stats.unitsKilled || 0} max={Math.max(stats.unitsKilled||0, stats.unitsLost||0, 1)} color='#e74c3c' />
                        <StatRow label={L.unitsLost}   value={stats.unitsLost   || 0} max={Math.max(stats.unitsKilled||0, stats.unitsLost||0, 1)} color='#888' />
                        {(stats.nukesLaunched || 0) > 0 &&
                            <StatRow label={L.nukes}   value={stats.nukesLaunched || 0} color='#9b59b6' />}
                        {(stats.orbitalsFired || 0) > 0 &&
                            <StatRow label={L.orbitals} value={stats.orbitalsFired || 0} color='#f39c12' />}
                    </Section>

                    {/* TERRITORY */}
                    <Section title={L.territory} color='#3a9eff'>
                        <StatRow label={L.captures}       value={stats.totalCaptures || 0} />
                        <StatRow label={L.losses}         value={stats.totalLosses   || 0} />
                        <StatRow label={L.peakRegions}    value={stats.peakRegions   || 0} max={totalRegions} color={factionColor} />
                        {!isGameOver && <StatRow label={L.currentRegions} value={ownedCount} max={totalRegions} color={factionColor} />}
                        <StatRow label={L.totalRegions}   value={totalRegions} />
                    </Section>

                    {/* PRODUCTION */}
                    <Section title={L.production} color='#e67e22'>
                        <StatRow label={L.infantry} value={stats.builtInfantry || 0} max={Math.max(stats.builtInfantry||0,1)} color='#aaa' />
                        <StatRow label={L.armor}    value={stats.builtArmor    || 0} max={Math.max(stats.builtInfantry||0,1)} color='#f39c12' />
                        <StatRow label={L.air}      value={stats.builtAir      || 0} max={Math.max(stats.builtInfantry||0,1)} color='#3498db' />
                        <StatRow label={L.naval}    value={stats.builtNaval    || 0} max={Math.max(stats.builtInfantry||0,1)} color='#1abc9c' />
                    </Section>

                    {/* INTELLIGENCE */}
                    <Section title={L.intelligence} color='#9b59b6'>
                        <StatRow label={L.reveals}        value={stats.spyReveals    || 0} />
                        <StatRow label={L.sabotages}      value={stats.spySabotages  || 0} />
                        <StatRow label={L.assassinations} value={stats.assassinations || 0} />
                        <StatRow label={L.sanctions}      value={stats.sanctionsUsed || 0} />
                    </Section>

                    {/* CAMPAIGN */}
                    <Section title={L.campaign} color='#f0a030'>
                        <StatRow label={L.turnsPlayed}   value={stats.turnsPlayed || turn} />
                        <StatRow label={L.actReached}    value={`ACT ${stats.actReached || actPhase}`} />
                        <StatRow label={L.peakStability} value={stats.peakStability  || 0} max={100} color='#2ecc71' unit='%' />
                        <StatRow label={L.lowStability}  value={stats.lowestStability || 0} max={100}
                            color={(stats.lowestStability||0) > 50 ? '#2ecc71' : '#e74c3c'} unit='%' />
                        <StatRow label={L.missions}      value={`${missionsDone} / ${missionsTotal}`}
                            color={missionsDone === missionsTotal && missionsTotal > 0 ? '#f0a030' : '#aaa'} />
                    </Section>

                    <View style={{ height: 20 }} />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    },
    panel: {
        width: width - 24,
        maxHeight: height * 0.88,
        backgroundColor: '#060c14',
        borderWidth: 1,
        borderColor: '#1a2a3a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 2,
        backgroundColor: '#08111c',
    },
    factionFlag: {
        fontSize: 22,
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 3,
    },
    subtitle: {
        color: '#3a5060',
        fontSize: 10,
        letterSpacing: 1,
        marginTop: 2,
    },
    closeBtn: {
        padding: 8,
    },
    closeBtnText: {
        color: '#5f727d',
        fontSize: 20,
    },
    scroll: {
        padding: 14,
    },
    section: {
        marginBottom: 18,
    },
    sectionHeader: {
        borderLeftWidth: 3,
        paddingLeft: 10,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 3,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#0a1520',
    },
    statLabel: {
        color: '#5a7a8a',
        fontSize: 11,
        flex: 1,
    },
    statRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    barBg: {
        width: 80,
        height: 3,
        backgroundColor: '#0f1e2a',
        borderRadius: 2,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 2,
    },
    statValue: {
        color: '#c0d8e8',
        fontSize: 12,
        fontWeight: '700',
        minWidth: 40,
        textAlign: 'right',
    },
});

export default StatsScreen;
