import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { Shield, Shuffle, Skull, Zap, Activity, HardHat, AlertTriangle, Crosshair } from 'lucide-react-native';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';
import { FD } from '../data/mapData';

const { height } = Dimensions.get('window');

const DiplomacyPanel = ({ onClose }) => {
    const slideAnim = React.useRef(new Animated.Value(30)).current;
    const fadeAnim  = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
            Animated.timing(fadeAnim,  { toValue: 1, duration: 260, useNativeDriver: true }),
        ]).start();
    }, []);
    const t = useTranslation();
    const { factions, playerFaction, regions } = useGameStore();
    const factionData = factions[playerFaction];

    // Abstracting store actions for diplomacy
    // In a real expanded version, these would exist directly in useGameStore actions
    const executeTrade = () => {
        useGameStore.setState(s => {
            const fac = s.factions[s.playerFaction];
            if (fac.funds >= 200) {
                fac.funds -= 200;
                fac.oil += 50;
                fac.supplies += 100;
                return {
                    factions: { ...s.factions, [s.playerFaction]: fac },
                    gameLog: [`[DIPLOMACY] Black Market Trade executed. -$200 / +50 OIL / +100 SUP`, ...s.gameLog].slice(0, 10)
                };
            }
            return s;
        });
    };

    const executeSanction = (targetKey) => {
        useGameStore.setState(s => {
            const pf = s.factions[s.playerFaction];
            const tf = s.factions[targetKey];
            if (pf.funds >= 500 && tf) {
                pf.funds -= 500;
                // Instant drain on target's funds & stability to simulate crippling cyber/economic sanctions
                tf.funds = Math.max(0, tf.funds - 400);
                tf.stability -= 15;
                return {
                    factions: { ...s.factions, [s.playerFaction]: pf, [targetKey]: tf },
                    gameLog: [`[DIPLOMACY] Heavy Sanctions applied against ${FD[targetKey].short}. -$500`, ...s.gameLog].slice(0, 10)
                };
            }
            return s;
        });
    };

    const executeProxy = (targetKey) => {
        useGameStore.setState(s => {
            const pf = s.factions[s.playerFaction];
            // Find a random region owned by the target
            const targetRegions = Object.keys(s.regions).filter(rid => s.regions[rid].faction === targetKey);

            if (pf.funds >= 800 && targetRegions.length > 0) {
                pf.funds -= 800;
                const hitRegionId = targetRegions[Math.floor(Math.random() * targetRegions.length)];

                const newRegions = { ...s.regions };
                // Destabilize region and spawn neutral proxy rebels
                newRegions[hitRegionId].stability = Math.max(0, newRegions[hitRegionId].stability - 40);
                newRegions[hitRegionId].infantry = Math.max(1, newRegions[hitRegionId].infantry - 3); // Take out some garrison
                newRegions[hitRegionId].faction = "NEUTRAL"; // It flips neutral/rebel
                newRegions[hitRegionId].infantry += 5; // The rebels spawn

                return {
                    factions: { ...s.factions, [s.playerFaction]: pf },
                    regions: newRegions,
                    gameLog: [`[DIPLOMACY] Proxy Rebels funded in ${hitRegionId.toUpperCase()}! -$800`, ...s.gameLog].slice(0, 10)
                };
            } else if (targetRegions.length === 0) {
                return { gameLog: [`[DIPLOMACY] Target has no regions.`, ...s.gameLog].slice(0, 10) };
            }
            return s;
        });
    };

    if (!factionData) return null;

    const enemies = ['EAST', 'CHINA'].filter(f => f !== playerFaction);

    return (
        <Animated.View style={[styles.panel, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('diplomacy.header')}</Text>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.closeBtn}>X</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.stabRow}>
                <Text style={styles.stabTitle}>{t('diplomacy.stability')}</Text>
                <Text style={[styles.stabValue, factionData.stability < 50 ? { color: '#e74c3c' } : { color: '#2ecc71' }]}>
                    {factionData.stability}%
                </Text>
            </View>

            <ScrollView style={styles.actionsContainer} contentContainerStyle={{ gap: 15, paddingBottom: 20 }}>

                {/* BLACK MARKET */}
                <View style={styles.actionCard}>
                    <View style={styles.cardHeader}>
                        <Shuffle color="#fff" size={20} />
                        <View>
                            <Text style={styles.actionTitle}>{t('diplomacy.tradeBtn')}</Text>
                            <Text style={styles.actionDesc}>Bypass embargoes. Pay a premium for immediate material reserves.</Text>
                        </View>
                    </View>
                    <View style={styles.costRow}>
                        <Text style={styles.costText}>COST: $200</Text>
                        <Text style={styles.gainText}>GAIN: 50 OIL / 100 SUP</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.btn, factionData.funds < 200 && styles.btnDisabled]}
                        disabled={factionData.funds < 200}
                        onPress={executeTrade}
                    >
                        <Text style={styles.btnText}>{t('diplomacy.executeTradeBtn')}</Text>
                    </TouchableOpacity>
                </View>

                {/* SANCTIONS */}
                <View style={[styles.actionCard, { borderColor: '#e67e22' }]}>
                    <View style={styles.cardHeader}>
                        <AlertTriangle color="#e67e22" size={20} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.actionTitle, { color: '#e67e22' }]}>{t('diplomacy.sanctionBtn')}</Text>
                            <Text style={styles.actionDesc}>Launch massive SWIFT/cyber attacks to vaporize enemy funds and cripple morale.</Text>
                        </View>
                    </View>
                    <View style={styles.costRow}>
                        <Text style={styles.costText}>COST: $500</Text>
                        <Text style={styles.gainText}>TARGET: -15 STAB / -$400</Text>
                    </View>

                    <View style={styles.targetRow}>
                        {enemies.map(e => (
                            <TouchableOpacity
                                key={e}
                                style={[styles.btnTarget, factionData.funds < 500 && styles.btnDisabled]}
                                disabled={factionData.funds < 500}
                                onPress={() => executeSanction(e)}
                            >
                                <Text style={styles.btnText}>TARGET {FD[e].short}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* PROXY WARFARE */}
                <View style={[styles.actionCard, { borderColor: '#e74c3c' }]}>
                    <View style={styles.cardHeader}>
                        <Crosshair color="#e74c3c" size={20} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.actionTitle, { color: '#e74c3c' }]}>{t('diplomacy.proxyBtn')}</Text>
                            <Text style={styles.actionDesc}>Arm nationalist militias. Instantly rips a random target region from enemy control, spawning hostiles.</Text>
                        </View>
                    </View>
                    <View style={styles.costRow}>
                        <Text style={styles.costText}>COST: $800</Text>
                        <Text style={styles.gainText}>{t('diplomacy.proxyImpact')}</Text>
                    </View>

                    <View style={styles.targetRow}>
                        {enemies.map(e => (
                            <TouchableOpacity
                                key={e}
                                style={[styles.btnTarget, factionData.funds < 800 && styles.btnDisabled]}
                                disabled={factionData.funds < 800}
                                onPress={() => executeProxy(e)}
                            >
                                <Text style={styles.btnText}>DESTABILIZE {FD[e].short}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

            </ScrollView>
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
        maxHeight: height * 0.75,
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
        color: '#3a9eff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    closeBtn: {
        color: '#888',
        fontSize: 18,
        fontWeight: 'bold',
    },
    stabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#11151c',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#1f2937'
    },
    stabTitle: {
        color: '#ccc',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 10,
        letterSpacing: 1
    },
    stabValue: {
        fontSize: 16,
        fontWeight: '900'
    },
    actionsContainer: {
        marginTop: 5,
    },
    actionCard: {
        backgroundColor: '#11151c',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 15,
        marginBottom: 12,
    },
    actionTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    actionDesc: {
        color: '#888',
        fontSize: 11,
        lineHeight: 16,
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#222'
    },
    costText: {
        color: '#e74c3c',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    gainText: {
        color: '#2ecc71',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    btn: {
        backgroundColor: '#1a2a3a',
        borderWidth: 1,
        borderColor: '#3a9eff',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center'
    },
    btnTarget: {
        flex: 1,
        backgroundColor: '#1a2a3a',
        borderWidth: 1,
        borderColor: '#555',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    btnText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    btnDisabled: {
        opacity: 0.3,
        borderColor: '#333',
    },
    targetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: -4
    }
});

export default DiplomacyPanel;
