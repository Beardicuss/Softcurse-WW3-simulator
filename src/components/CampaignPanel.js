import React, { memo, useState } from 'react';
import {
    View, Text, TouchableOpacity,
    ScrollView, StyleSheet, Dimensions
} from 'react-native';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';
import { CAMPAIGN_MISSIONS } from '../logic/campaignMissions';

const { height } = Dimensions.get('window');
const { width: PW } = Dimensions.get('window');
const IS_LOW_END = PW < 768;

const STATUS_COLOR = {
    locked:   '#2c3a44',
    active:   '#3a9eff',
    complete: '#2ecc71',
    failed:   '#e74c3c',
};

const STATUS_EMOJI = {
    locked:   '🔒',
    active:   '⚔',
    complete: '✅',
    failed:   '✗',
};

const CampaignPanel = ({ onClose }) => {
    const t = useTranslation();
    const lang = useGameStore(s => s.settings?.language || 'en');
    const missionProgress = useGameStore(s => s.missionProgress || {});
    const turn = useGameStore(s => s.turn);
    const [expanded, setExpanded] = useState(null);

    // Sort: active first, then locked by order, then complete
    const sorted = [...CAMPAIGN_MISSIONS].sort((a, b) => {
        const sa = missionProgress[a.id]?.status || 'locked';
        const sb = missionProgress[b.id]?.status || 'locked';
        const order = { active: 0, locked: 1, complete: 2 };
        if (order[sa] !== order[sb]) return order[sa] - order[sb];
        return a.order - b.order;
    });

    const activeMissions  = sorted.filter(m => (missionProgress[m.id]?.status || 'locked') === 'active');
    const lockedMissions  = sorted.filter(m => (missionProgress[m.id]?.status || 'locked') === 'locked');
    const completeMissions = sorted.filter(m => missionProgress[m.id]?.status === 'complete');

    const renderMission = (mission) => {
        const prog = missionProgress[mission.id] || { status: 'locked', objectiveProgress: {} };
        const status = prog.status || 'locked';
        const color  = STATUS_COLOR[status];
        const isExpanded = expanded === mission.id;
        const title = lang === 'ru' ? mission.titleRu : mission.title;
        const briefing = lang === 'ru' ? mission.briefingRu : mission.briefing;
        const rewardDesc = lang === 'ru' ? mission.reward.descRu : mission.reward.desc;

        return (
            <TouchableOpacity
                key={mission.id}
                style={[styles.missionCard, { borderColor: color }]}
                onPress={() => setExpanded(isExpanded ? null : mission.id)}
                activeOpacity={0.8}
            >
                <View style={styles.missionHeader}>
                    <Text style={styles.missionEmoji}>{STATUS_EMOJI[status]}</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.missionTitle, { color }]}>{title}</Text>
                        <Text style={styles.missionOrder}>
                            {t('campaign.missions')} {mission.order}/12
                            {status === 'active' && prog.activatedTurn != null &&
                                `  ·  ${t('common.turn')} ${prog.activatedTurn}`}
                            {status === 'complete' && prog.completedTurn != null &&
                                `  ·  ✓ ${t('common.turn')} ${prog.completedTurn}`}
                        </Text>
                    </View>
                    <Text style={[styles.chevron, { color }]}>{isExpanded ? '▲' : '▼'}</Text>
                </View>

                {isExpanded && (
                    <View style={styles.missionBody}>
                        <Text style={styles.briefing}>{briefing}</Text>

                        <View style={styles.divider} />

                        <Text style={styles.sectionLabel}>{t('campaign.objective').toUpperCase()}</Text>
                        {mission.objectives.map(obj => {
                            const objProgress = prog.objectiveProgress?.[obj.id] ?? 0;
                            const objDesc = lang === 'ru' ? obj.descRu : obj.descEn;
                            const isDone = status === 'complete' ||
                                (obj.type === 'stability_turns' ? objProgress >= obj.target :
                                 objProgress >= obj.target);
                            return (
                                <View key={obj.id} style={styles.objectiveRow}>
                                    <Text style={[styles.objCheck, { color: isDone ? '#2ecc71' : '#555' }]}>
                                        {isDone ? '●' : '○'}
                                    </Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.objDesc, isDone && { color: '#2ecc71' }]}>
                                            {objDesc}
                                        </Text>
                                        {status === 'active' && obj.target > 1 && (
                                            <View style={styles.progressBar}>
                                                <View style={[
                                                    styles.progressFill,
                                                    {
                                                        width: `${Math.min(100, Math.floor((objProgress / obj.target) * 100))}%`,
                                                        backgroundColor: isDone ? '#2ecc71' : color,
                                                    }
                                                ]} />
                                                <Text style={styles.progressText}>
                                                    {objProgress}/{obj.target}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}

                        <View style={styles.divider} />

                        <Text style={styles.sectionLabel}>{t('campaign.reward').toUpperCase()}</Text>
                        <Text style={styles.rewardText}>{rewardDesc}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.panel}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{t('campaign.missions')}</Text>
                    <Text style={styles.subtitle}>
                        {completeMissions.length}/{CAMPAIGN_MISSIONS.length} {t('campaign.complete').toLowerCase()}
                        {'  ·  '}{t('common.turn')} {turn}
                    </Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                {activeMissions.length > 0 && (
                    <>
                        <Text style={styles.groupLabel}>⚔ {t('campaign.active')}</Text>
                        {activeMissions.map(renderMission)}
                    </>
                )}

                {lockedMissions.length > 0 && (
                    <>
                        <Text style={styles.groupLabel}>🔒 UPCOMING</Text>
                        {lockedMissions.slice(0, 3).map(renderMission)}
                    </>
                )}

                {completeMissions.length > 0 && (
                    <>
                        <Text style={styles.groupLabel}>✅ {t('campaign.complete')}</Text>
                        {completeMissions.map(renderMission)}
                    </>
                )}

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    panel: {
        position: 'absolute',
        bottom: 80,
        left: 10,
        right: 10,
        maxHeight: height * 0.78,
        backgroundColor: 'rgba(6,10,18,0.98)',
        borderWidth: 1,
        borderColor: '#1a2a3a',
        zIndex: 60,
        elevation: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1a2a3a',
        backgroundColor: '#0a1018',
    },
    title: {
        color: '#e0eeff',
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
    closeBtn: {
        color: '#5f727d',
        fontSize: 18,
        padding: 4,
    },
    scroll: {
        padding: 12,
    },
    groupLabel: {
        color: '#3a5060',
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: '900',
        marginBottom: 8,
        marginTop: 4,
    },
    missionCard: {
        borderWidth: 1,
        marginBottom: 8,
        backgroundColor: '#08111a',
        overflow: 'hidden',
    },
    missionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 10,
    },
    missionEmoji: {
        fontSize: 16,
        width: 24,
        textAlign: 'center',
    },
    missionTitle: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    missionOrder: {
        color: '#3a5060',
        fontSize: 9,
        letterSpacing: 1,
        marginTop: 2,
    },
    chevron: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    missionBody: {
        paddingHorizontal: 14,
        paddingBottom: 14,
        borderTopWidth: 1,
        borderTopColor: '#0f1c28',
    },
    briefing: {
        color: '#7090a0',
        fontSize: 11,
        lineHeight: 17,
        marginTop: 10,
        marginBottom: 8,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: '#0f1c28',
        marginVertical: 8,
    },
    sectionLabel: {
        color: '#3a5060',
        fontSize: 8,
        letterSpacing: 2,
        fontWeight: '900',
        marginBottom: 6,
    },
    objectiveRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 6,
    },
    objCheck: {
        fontSize: 10,
        marginTop: 2,
    },
    objDesc: {
        color: '#8090a0',
        fontSize: 11,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#111c28',
        marginTop: 4,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        position: 'absolute',
        right: 0,
        top: -10,
        color: '#3a5060',
        fontSize: 8,
    },
    rewardText: {
        color: '#f0a030',
        fontSize: 11,
        fontWeight: '700',
    },
});

export default memo(CampaignPanel);
