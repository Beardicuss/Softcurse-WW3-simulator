import React, { memo, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Dimensions
} from 'react-native';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';
import { FD } from '../data/mapData';

const { width } = Dimensions.get('window');
const IS_LOW_END = width < 768;
const slideAnim = null; // panel slide handled by parent

const ALL_FACTIONS = ['NATO', 'EAST', 'CHINA', 'INDIA', 'LATAM'];
const RESOURCE_LABELS = { funds: 'Funds', oil: 'Oil', supplies: 'Supplies', techPoints: 'Tech Pts' };
const RESOURCE_LABELS_RU = { funds: 'Средства', oil: 'Нефть', supplies: 'Снабж.', techPoints: 'Наука' };

const TradePanel = ({ onClose }) => {
    const lang          = useGameStore(s => s.settings?.language || 'en');
    const playerFaction = useGameStore(s => s.playerFaction);
    const factions      = useGameStore(s => s.factions);
    const tradeRoutes   = useGameStore(s => s.tradeRoutes || []);
    const sanctions     = useGameStore(s => s.sanctions || {});
    const blockades     = useGameStore(s => s.blockades || {});
    const selectedRegionId = useGameStore(s => s.selectedRegionId);
    const regions       = useGameStore(s => s.regions);
    const proposeTrade  = useGameStore(s => s.proposeTrade);
    const cancelTrade   = useGameStore(s => s.cancelTrade);
    const imposeSanctions = useGameStore(s => s.imposeSanctions);
    const imposeBlockade  = useGameStore(s => s.imposeBlockade);

    const [tab, setTab] = useState('trade');
    const [tradeTarget, setTradeTarget] = useState(null);
    const [offer, setOffer]   = useState({ resource: 'funds',    amount: 200 });
    const [request, setRequest] = useState({ resource: 'oil', amount: 150 });
    const [msg, setMsg] = useState(null);

    const ru = lang === 'ru';
    const t  = useTranslation();
    const RL = ru ? RESOURCE_LABELS_RU : RESOURCE_LABELS;
    const pFac = factions[playerFaction] || {};
    const aiFactions = ALL_FACTIONS.filter(f => f !== playerFaction && factions[f]);
    const activeRoutes = tradeRoutes.filter(r => r.turnsLeft > 0);

    const doTrade = () => {
        if (!tradeTarget) return setMsg(t('trade.selectFaction'));
        const result = proposeTrade(tradeTarget, offer.resource, offer.amount, request.resource, request.amount);
        setMsg(result.ok ? (t('trade.established')) : result.msg);
        if (result.ok) setTradeTarget(null);
    };

    const doSanction = (targetFaction) => {
        const result = imposeSanctions(targetFaction);
        setMsg(result.ok ? (t('trade.sanctions.imposed')) : result.msg);
    };

    const doBlockade = () => {
        if (!selectedRegionId) return setMsg(t('trade.blockade.selectFirst'));
        const result = imposeBlockade(selectedRegionId);
        setMsg(result.ok ? (t('trade.blockade.imposed')) : result.msg);
    };

    const AmountPicker = ({ value, onChange, max }) => (
        <View style={styles.amountRow}>
            <TouchableOpacity style={styles.amountBtn} onPress={() => onChange(Math.max(50, value - 50))}>
                <Text style={styles.amountBtnText}>–</Text>
            </TouchableOpacity>
            <Text style={styles.amountValue}>{value}</Text>
            <TouchableOpacity style={styles.amountBtn} onPress={() => onChange(Math.min(max || 999, value + 50))}>
                <Text style={styles.amountBtnText}>+</Text>
            </TouchableOpacity>
        </View>
    );

    const ResourcePicker = ({ value, onChange }) => (
        <View style={styles.resRow}>
            {['funds', 'oil', 'supplies'].map(r => (
                <TouchableOpacity
                    key={r}
                    style={[styles.resChip, value === r && styles.resChipActive]}
                    onPress={() => onChange(r)}
                >
                    <Text style={[styles.resChipText, value === r && styles.resChipTextActive]}>
                        {RL[r]}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={styles.overlay}>
            <View style={styles.panel}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{t('trade.title')}</Text>
                    <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                        <Text style={{ color: '#5f727d', fontSize: 18 }}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Resources */}
                <View style={styles.resources}>
                    {['funds', 'oil', 'supplies'].map(r => (
                        <View key={r} style={styles.resItem}>
                            <Text style={styles.resLabel}>{RL[r]}</Text>
                            <Text style={styles.resVal}>{Math.floor(pFac[r] || 0)}</Text>
                        </View>
                    ))}
                </View>

                {/* Tabs */}
                <View style={styles.tabBar}>
                    {['trade', 'sanctions', 'blockade'].map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.tab, tab === t && styles.tabActive]}
                            onPress={() => { setTab(t); setMsg(null); }}
                        >
                            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                                {t === 'trade'
                                    ? (t('trade.tab.trade'))
                                    : t === 'sanctions'
                                    ? (t('trade.tab.sanctions'))
                                    : (t('trade.tab.blockade'))}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {msg && (
                    <Text style={[styles.msgBar, { color: msg.startsWith('✓') ? '#2ecc71' : '#e74c3c' }]}>
                        {msg}
                    </Text>
                )}

                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                    {/* ── TRADE TAB ── */}
                    {tab === 'trade' && (
                        <View style={styles.section}>

                            {/* Active routes */}
                            {activeRoutes.length > 0 && (
                                <View style={styles.subSection}>
                                    <Text style={styles.subTitle}>{t('trade.activeRoutes')}</Text>
                                    {activeRoutes.map(r => (
                                        <View key={r.id} style={styles.routeRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.routeText}>
                                                    {r.offeredAmount} {RL[r.offeredResource]} → {FD[r.toFaction]?.short} for {r.requestedAmount} {RL[r.requestedResource]}
                                                </Text>
                                                <Text style={styles.routeMeta}>{r.turnsLeft} {t('trade.turnsLeft')}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.cancelBtn}
                                                onPress={() => cancelTrade(r.id)}
                                            >
                                                <Text style={styles.cancelBtnText}>✕</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* New trade */}
                            <View style={styles.subSection}>
                                <Text style={styles.subTitle}>{t('trade.newDeal')}</Text>

                                <Text style={styles.fieldLabel}>{t('trade.partner')}</Text>
                                <View style={styles.factionRow}>
                                    {aiFactions.map(f => (
                                        <TouchableOpacity
                                            key={f}
                                            style={[styles.facChip, tradeTarget === f && { borderColor: FD[f]?.color, backgroundColor: `${FD[f]?.color}22` }]}
                                            onPress={() => setTradeTarget(f)}
                                        >
                                            <Text style={{ fontSize: 16 }}>{FD[f]?.flag}</Text>
                                            <Text style={[styles.facChipText, tradeTarget === f && { color: FD[f]?.color }]}>{FD[f]?.short}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.fieldLabel}>{t('trade.youOffer')}</Text>
                                <ResourcePicker value={offer.resource} onChange={r => setOffer(o => ({ ...o, resource: r }))} />
                                <AmountPicker value={offer.amount} onChange={v => setOffer(o => ({ ...o, amount: v }))} max={pFac[offer.resource] || 0} />

                                <Text style={styles.fieldLabel}>{t('trade.youRequest')}</Text>
                                <ResourcePicker value={request.resource} onChange={r => setRequest(o => ({ ...o, resource: r }))} />
                                <AmountPicker value={request.amount} onChange={v => setRequest(o => ({ ...o, amount: v }))} max={500} />

                                <TouchableOpacity style={styles.actionBtn} onPress={doTrade}>
                                    <Text style={styles.actionBtnText}>{t('trade.establish')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* ── SANCTIONS TAB ── */}
                    {tab === 'sanctions' && (
                        <View style={styles.section}>
                            <Text style={styles.subTitle}>{t('trade.sanctions.title')}</Text>
                            <Text style={styles.sectionDesc}>
                                {ru
                                    ? 'Заморозьте 8% средств цели каждый ход на 5 ходов. Стоимость: 400 средств.'
                                    : 'Freeze 8% of a faction\'s funds each turn for 5 turns. Cost: 400 funds.'}
                            </Text>

                            {aiFactions.map(f => {
                                const active = sanctions[f];
                                const fData = FD[f] || {};
                                return (
                                    <View key={f} style={styles.sanctionRow}>
                                        <Text style={{ fontSize: 20 }}>{fData.flag}</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.facName, { color: fData.color }]}>{fData.name}</Text>
                                            {active
                                                ? <Text style={styles.activeSanction}>🚫 {active} {ru ? 'ходов' : 'turns remaining'}</Text>
                                                : <Text style={styles.noSanction}>{t('trade.sanctions.none')}</Text>
                                            }
                                        </View>
                                        {!active && (
                                            <TouchableOpacity
                                                style={[styles.actionBtnSmall, { borderColor: '#e74c3c' }]}
                                                onPress={() => doSanction(f)}
                                            >
                                                <Text style={[styles.actionBtnSmallText, { color: '#e74c3c' }]}>
                                                    {t('trade.sanctions.impose')}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* ── BLOCKADE TAB ── */}
                    {tab === 'blockade' && (
                        <View style={styles.section}>
                            <Text style={styles.subTitle}>{t('trade.blockade.title')}</Text>
                            <Text style={styles.sectionDesc}>
                                {ru
                                    ? 'Блокируйте выбранный регион: -30 нефти в ход на 4 хода. Стоимость: 300 средств.'
                                    : 'Blockade the selected region: -30 oil/turn for 4 turns. Cost: 300 funds.'}
                            </Text>

                            {selectedRegionId && regions[selectedRegionId] && (
                                <View style={styles.selectedRegion}>
                                    <Text style={styles.fieldLabel}>{t('trade.blockade.selected')}</Text>
                                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 }}>
                                        {regions[selectedRegionId]?.name || selectedRegionId.toUpperCase()}
                                    </Text>
                                    <Text style={{ color: '#5f727d', fontSize: 10 }}>
                                        {t('trade.faction')}: {regions[selectedRegionId]?.faction}
                                    </Text>
                                </View>
                            )}

                            {!selectedRegionId && (
                                <View style={styles.hint}>
                                    <Text style={styles.hintText}>
                                        {t('trade.blockade.hint')}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.actionBtn, { borderColor: '#3498db' }]}
                                onPress={doBlockade}
                            >
                                <Text style={[styles.actionBtnText, { color: '#3498db' }]}>
                                    {t('trade.blockade.impose')}
                                </Text>
                            </TouchableOpacity>

                            {/* Active blockades */}
                            {Object.keys(blockades).length > 0 && (
                                <View style={{ marginTop: 16 }}>
                                    <Text style={styles.subTitle}>{t('trade.blockade.active')}</Text>
                                    {Object.entries(blockades).map(([rid, b]) => (
                                        <View key={rid} style={styles.routeRow}>
                                            <Text style={styles.routeText}>
                                                {(regions[rid]?.name || rid).toUpperCase()} — {b.turnsLeft} {ru ? 'ходов' : 'turns'}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

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
        width: width - 20,
        maxHeight: '90%',
        backgroundColor: '#060c14',
        borderWidth: 1,
        borderColor: '#1a2a3a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1a2a3a',
        backgroundColor: '#08111c',
    },
    title: {
        color: '#3a9eff',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 2,
    },
    resources: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#0a1520',
        backgroundColor: '#040a10',
    },
    resItem: { alignItems: 'center' },
    resLabel: { color: '#3a5060', fontSize: 8, letterSpacing: 1, fontWeight: '900' },
    resVal:   { color: '#fff', fontSize: 14, fontWeight: '900' },

    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#0a1520',
    },
    tab: {
        flex: 1,
        paddingVertical: 9,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: '#3a9eff', backgroundColor: 'rgba(58,158,255,0.06)' },
    tabText: { color: '#3a5060', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
    tabTextActive: { color: '#3a9eff' },

    msgBar: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        fontSize: 11,
        fontWeight: '700',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },

    scroll: { flex: 1, padding: 14 },
    section: {},
    subSection: { marginBottom: 20 },
    subTitle: {
        color: '#3a5060',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 3,
        marginBottom: 10,
    },
    sectionDesc: {
        color: '#4a6070',
        fontSize: 10,
        lineHeight: 16,
        marginBottom: 14,
    },
    fieldLabel: {
        color: '#3a5060',
        fontSize: 9,
        letterSpacing: 2,
        fontWeight: '700',
        marginBottom: 6,
        marginTop: 10,
    },
    factionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 4,
    },
    facChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: '#1a2a3a',
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    facChipText: {
        color: '#5f727d',
        fontSize: 10,
        fontWeight: '700',
    },
    resRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
    resChip: {
        flex: 1,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#1a2a3a',
        alignItems: 'center',
    },
    resChipActive: { borderColor: '#3a9eff', backgroundColor: 'rgba(58,158,255,0.15)' },
    resChipText: { color: '#5f727d', fontSize: 10, fontWeight: '700' },
    resChipTextActive: { color: '#3a9eff' },
    amountRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
    amountBtn: {
        width: 32, height: 32,
        borderWidth: 1, borderColor: '#1a2a3a',
        justifyContent: 'center', alignItems: 'center',
    },
    amountBtnText: { color: '#3a9eff', fontSize: 18, fontWeight: '900' },
    amountValue: { color: '#fff', fontSize: 16, fontWeight: '900', minWidth: 50, textAlign: 'center' },

    actionBtn: {
        marginTop: 14,
        borderWidth: 1,
        borderColor: '#3a9eff',
        paddingVertical: 12,
        alignItems: 'center',
    },
    actionBtnText: { color: '#3a9eff', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    actionBtnSmall: {
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    actionBtnSmallText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },

    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#0a1520',
        gap: 8,
    },
    routeText: { color: '#c0d8e8', fontSize: 11 },
    routeMeta: { color: '#3a5060', fontSize: 9, letterSpacing: 1, marginTop: 2 },
    cancelBtn: { padding: 6 },
    cancelBtnText: { color: '#e74c3c', fontSize: 14 },

    sanctionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#0a1520',
    },
    facName: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    activeSanction: { color: '#e74c3c', fontSize: 9, letterSpacing: 1 },
    noSanction: { color: '#2a3a44', fontSize: 9 },

    selectedRegion: {
        borderWidth: 1,
        borderColor: '#3498db',
        padding: 12,
        marginBottom: 12,
        backgroundColor: 'rgba(52,152,219,0.08)',
    },
    hint: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#1a2a3a',
        borderStyle: 'dashed',
        marginBottom: 12,
        alignItems: 'center',
    },
    hintText: { color: '#3a5060', fontSize: 11, textAlign: 'center' },
});

export default memo(TradePanel);
