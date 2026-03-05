import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Animated
} from 'react-native';
import { ChevronRight, ShieldAlert, Crosshair, Map, Shield } from 'lucide-react-native';
import useGameStore from '../store/useGameStore';
import { FD } from '../data/mapData';

const FactionSelectView = ({ onStart }) => {
    const setUiMode = useGameStore(s => s.setUiMode);
    const [selected, setSelected] = useState(null);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>SELECT ALIGNMENT</Text>
                    <Text style={styles.subtitle}>Choose your superpower for the impending global conflict</Text>
                </View>

                <View style={styles.grid}>
                    {['NATO', 'EAST', 'CHINA'].map(fk => {
                        const isSelected = selected === fk;
                        return (
                            <TouchableOpacity
                                key={fk}
                                activeOpacity={0.8}
                                style={[
                                    styles.card,
                                    { borderColor: isSelected ? FD[fk].color : '#222' },
                                    isSelected && { backgroundColor: `${FD[fk].color}15` }
                                ]}
                                onPress={() => setSelected(fk)}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.flag}>{FD[fk].flag}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.factionName, { color: FD[fk].color }]} numberOfLines={1} adjustsFontSizeToFit>{FD[fk].name}</Text>
                                        <Text style={styles.factionShort}>{fk} COMMAND</Text>
                                    </View>
                                </View>

                                <Text style={styles.desc}>{FD[fk].desc}</Text>

                                <View style={styles.statsContainer}>
                                    <View style={styles.statBox}>
                                        <Crosshair color="#fff" size={10} style={{ marginRight: 2 }} />
                                        <Text style={styles.statLine}>ATK: {FD[fk].atk}x</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Shield color="#fff" size={10} style={{ marginRight: 2 }} />
                                        <Text style={styles.statLine}>DEF: {FD[fk].def}x</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <ShieldAlert color="#e74c3c" size={10} style={{ marginRight: 2 }} />
                                        <Text style={[styles.statLine, { color: '#e74c3c' }]}>NUKES: {FD[fk].nukes}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => setUiMode('MENU')}
                    >
                        <Text style={styles.backText}>BACK</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.startBtn, !selected && { opacity: 0.5 }]}
                        disabled={!selected}
                        onPress={() => {
                            if (selected) onStart(selected);
                        }}
                    >
                        <Text style={styles.startText}>INITIALIZE DEPLOYMENT</Text>
                        <ChevronRight color="#fff" size={20} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050a12',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        marginVertical: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 10,
        letterSpacing: 1,
    },
    grid: {
        flexDirection: 'row',
        gap: 15,
        flex: 1,
        justifyContent: 'center',
    },
    card: {
        flex: 1,
        backgroundColor: '#111',
        borderWidth: 2,
        borderRadius: 12,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    flag: {
        fontSize: 48,
        marginRight: 10,
    },
    factionName: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    factionShort: {
        fontSize: 10,
        color: '#888',
        letterSpacing: 2,
        marginTop: 4,
    },
    desc: {
        fontSize: 14,
        color: '#aaa',
        lineHeight: 22,
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 4,
        backgroundColor: '#000',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#222',
    },
    statBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statLine: {
        color: '#ddd',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    backBtn: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        justifyContent: 'center',
    },
    backText: {
        color: '#888',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    startBtn: {
        flex: 1,
        marginLeft: 20,
        backgroundColor: '#cc0000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        shadowColor: '#cc0000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    startText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
        marginRight: 10,
    }
});

export default FactionSelectView;
