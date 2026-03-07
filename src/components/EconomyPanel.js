import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Shield, Rocket, Plane, Zap, Activity, HardHat, Anchor } from 'lucide-react-native';
import useGameStore from '../store/useGameStore';
import { COASTAL_REGIONS } from '../logic/gameLogic';
import { getTerrain } from '../data/mapData';
import { useTranslation } from '../i18n/i18n';

const { height } = Dimensions.get('window');

const EconomyPanel = ({ onClose }) => {
    const slideAnim = React.useRef(new Animated.Value(30)).current;
    const fadeAnim  = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
            Animated.timing(fadeAnim,  { toValue: 1, duration: 260, useNativeDriver: true }),
        ]).start();
    }, []);
    const t = useTranslation();
    const { factions, playerFaction, regions, selectedRegionId, buildUnit } = useGameStore();

    const factionData = factions[playerFaction];
    const selectedRegion = selectedRegionId ? regions[selectedRegionId] : null;

    if (!factionData) return null;

    const renderUnitCard = (type, icon, name, costF, costS, costI, atk, def, desc) => {
        const canAfford = factionData.funds >= costF && factionData.supplies >= costS;
        const validRegion = selectedRegion && selectedRegion.faction === playerFaction;
        const regionHasInd = validRegion && selectedRegion.industry >= costI;

        const isEnabled = canAfford && validRegion && regionHasInd;

        return (
            <TouchableOpacity
                style={[styles.unitCard, !isEnabled && styles.cardDisabled]}
                disabled={!isEnabled}
                onPress={() => buildUnit(selectedRegionId, type)}
            >
                <View style={styles.cardHeader}>
                    {icon}
                    <Text style={styles.unitName}>{name}</Text>
                </View>

                <View style={styles.costRow}>
                    <Text style={styles.costText}>${costF}</Text>
                    <Text style={styles.costText}>{costS} SUP</Text>
                    <Text style={styles.costText}>{costI} IND</Text>
                </View>

                <View style={styles.statsRow}>
                    <Text style={styles.statText}>ATK: {atk}</Text>
                    <Text style={styles.statText}>DEF: {def}</Text>
                </View>

                {desc && <Text style={{ color: '#556', fontSize: 9, marginTop: 4, fontStyle: 'italic' }}>{desc}</Text>}
                {!validRegion && <Text style={styles.errorText}>{t('economy.selectRegion')}</Text>}
                {validRegion && !regionHasInd && <Text style={styles.errorText}>Requires {costI} Industry</Text>}
            </TouchableOpacity>
        );
    };

    return (
        <Animated.View style={[styles.panel, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('economy.header')}</Text>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.closeBtn}>X</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.globalResources}>
                <View style={styles.resItem}>
                    <Zap size={14} color="#ffd700" />
                    <Text style={styles.resText}>{factionData.funds}</Text>
                </View>
                <View style={styles.resItem}>
                    <Activity size={14} color="#3498db" />
                    <Text style={styles.resText}>{factionData.supplies}</Text>
                </View>
                <View style={styles.resItem}>
                    <HardHat size={14} color="#e67e22" />
                    <Text style={styles.resText}>
                        {selectedRegion && selectedRegion.faction === playerFaction ? selectedRegion.industry : 0} Local IND
                    </Text>
                </View>
            </View>

            <View style={styles.unitsContainer}>
                {renderUnitCard('infantry',  <Shield color="#fff" size={20} />,  'INFANTRY DIVISION',  50,  20,  0,  1, 2)}
                {renderUnitCard('armor',     <Rocket color="#fff" size={20} />,  'ARMORED BRIGADE',    150, 50,  10, 3, 2)}
                {renderUnitCard('air',       <Plane  color="#fff" size={20} />,  'AIR SQUADRON',       300, 100, 25, 5, 0)}
            </View>

            {/* Naval Units — coastal regions only */}
            {selectedRegion && COASTAL_REGIONS.has(selectedRegionId) && (
                <>
                    <Text style={styles.navalHeader}>⚓ NAVAL UNITS — COASTAL REGION</Text>
                    <View style={styles.unitsContainer}>
                        {renderUnitCard('destroyer', <Anchor color="#3498db" size={20} />, 'DESTROYER', 200, 60, 15, 4, 3)}
                        {renderUnitCard('submarine', <Anchor color="#9b59b6" size={20} />, 'SUBMARINE', 250, 80, 20, 6, 1)}
                        {renderUnitCard('carrier',   <Anchor color="#e67e22" size={20} />, 'CARRIER',   500, 150, 30, 2, 5)}
                    </View>
                </>
            )}
            {selectedRegion && !COASTAL_REGIONS.has(selectedRegionId) && selectedRegion.faction === playerFaction && (
                <Text style={styles.navalLocked}>🌊 Naval units require a coastal region</Text>
            )}

            {/* TIER 2 UNITS */}
            <Text style={styles.navalHeader}>⚔ TIER 2 UNITS</Text>
            <View style={styles.unitsContainer}>
                {renderUnitCard('bomber',
                    <Text style={{ fontSize: 18 }}>✈💣</Text>,
                    'STRATEGIC BOMBER',
                    400, 150, 30, 8, 0,
                    'Bypasses terrain defense. Destroys infrastructure. Requires 30 Industry.'
                )}
                {renderUnitCard('guerrilla',
                    <Text style={{ fontSize: 18 }}>🪖</Text>,
                    'GUERRILLA FORCE',
                    100, 30, 0, 2, 3,
                    '2× defense in forest/mountain/jungle/tundra. Cheap insurgency unit.'
                )}
            </View>

            {/* TERRAIN INFO */}
            {selectedRegion && selectedRegion.faction === playerFaction && (() => {
                const terrain = getTerrain(selectedRegionId);
                return (
                    <View style={{ marginTop: 12, padding: 8, backgroundColor: '#0a1520', borderRadius: 6, borderWidth: 1, borderColor: '#1e3a4a' }}>
                        <Text style={{ color: '#7fb3cc', fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>
                            {terrain.emoji} TERRAIN: {terrain.label.toUpperCase()}
                        </Text>
                        <Text style={{ color: '#556677', fontSize: 9, marginTop: 3 }}>
                            ATK ×{terrain.atkMod.toFixed(2)}  DEF ×{terrain.defMod.toFixed(2)}  SUPPLY ×{terrain.supplyMod.toFixed(2)}
                        </Text>
                    </View>
                );
            })()}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    panel: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        width: 350,
        backgroundColor: 'rgba(15, 20, 30, 0.98)',
        borderWidth: 2,
        borderColor: '#3a9eff',
        borderRadius: 12,
        padding: 20,
        maxHeight: height * 0.7,
        zIndex: 50,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.8,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 10 },
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    closeBtn: {
        color: '#888',
        fontSize: 18,
        fontWeight: 'bold',
    },
    globalResources: {
        flexDirection: 'row',
        gap: 15,
        backgroundColor: '#111',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    resItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    resText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    unitsContainer: {
        gap: 10,
    },
    unitCard: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 15,
    },
    cardDisabled: {
        opacity: 0.5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    unitName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    costRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 5,
    },
    costText: {
        color: '#e74c3c',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 15,
    },
    statText: {
        color: '#3498db',
        fontSize: 10,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 10,
        marginTop: 5,
        fontStyle: 'italic',
    },
    navalHeader: {
        color: '#3498db',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: 16,
        marginBottom: 8,
        paddingLeft: 4,
    },
    navalLocked: {
        color: '#445566',
        fontSize: 10,
        marginTop: 12,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

export default EconomyPanel;
