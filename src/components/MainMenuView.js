import React, { useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Animated,
    Dimensions
} from 'react-native';
import { Play, Settings, BookOpen, Clock, ShieldAlert } from 'lucide-react-native';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';

const { width } = Dimensions.get('window');

const MainMenuView = () => {
    const t = useTranslation();
    const setUiMode = useGameStore(s => s.setUiMode);
    const setGameMode = useGameStore(s => s.setGameMode);
    const [showModeSelect, setShowModeSelect] = React.useState(false);
    const gameMode = useGameStore(s => s.gameMode);
    const hasSave = useGameStore(s => s.hasSave);
    const loadGame = useGameStore(s => s.loadGame);

    // Simple staggered fade in for menu items
    const fadeAnim1 = useRef(new Animated.Value(0)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;
    const fadeAnim3 = useRef(new Animated.Value(0)).current;
    const fadeAnim4 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(150, [
            Animated.timing(fadeAnim1, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(fadeAnim2, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(fadeAnim3, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(fadeAnim4, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Ambient Background Grid Overlay */}
            <View style={styles.gridOverlay}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <View key={`h-${i}`} style={[styles.gridLineH, { top: i * 40 }]} />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                    <View key={`v-${i}`} style={[styles.gridLineV, { left: i * 40 }]} />
                ))}
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <ShieldAlert color="#3a9eff" size={32} opacity={0.8} />
                    <Text style={styles.title}>{t('menu.subtitle')}</Text>
                    <Text style={styles.subtitle}>COMMAND & CONTROL CENTER</Text>
                </View>

                <View style={styles.menuContainer}>
                    <Animated.View style={{ opacity: fadeAnim1, transform: [{ translateX: fadeAnim1.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
                        <TouchableOpacity style={styles.mainButton} onPress={() => setShowModeSelect(true)} activeOpacity={0.8}>
                            <View style={styles.accentBar} />
                            <Play color="#fff" size={20} fill="#fff" />
                            <View style={styles.buttonInfo}>
                                <Text style={styles.buttonTitle}>{t('menu.newGame')}</Text>
                                <Text style={styles.buttonDesc}>Initiate global mobilization protocols</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View style={{ opacity: fadeAnim2, transform: [{ translateX: fadeAnim2.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
                        <TouchableOpacity
                            style={[styles.menuButton, !hasSave && styles.disabled]}
                            disabled={!hasSave}
                            activeOpacity={0.8}
                            onPress={() => loadGame()}
                        >
                            <Clock color={hasSave ? "#3a9eff" : "#555"} size={18} opacity={hasSave ? 0.8 : 1} />
                            <Text style={[styles.menuButtonText, !hasSave && { color: '#555' }]}>LOAD / CONTINUE</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View style={{ opacity: fadeAnim3, transform: [{ translateX: fadeAnim3.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
                        <TouchableOpacity style={styles.menuButton} activeOpacity={0.8} onPress={() => setUiMode('SETTINGS')}>
                            <Settings color="#3a9eff" size={18} opacity={0.8} />
                            <Text style={styles.menuButtonText}>{t('menu.settings')}</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View style={{ opacity: fadeAnim4, transform: [{ translateX: fadeAnim4.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
                        <TouchableOpacity style={styles.menuButton} activeOpacity={0.8}>
                            <BookOpen color="#3a9eff" size={18} opacity={0.8} />
                            <Text style={styles.menuButtonText}>CREDITS / ABOUT</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.version}>v3.1.0 // NIGHTMARE ENGINE</Text>
                    <Text style={styles.copyright}>© 2026 SOFTCURSE INTERACTIVE</Text>
                </View>
            </View>

            {/* Game Mode Selector Modal */}
            {showModeSelect && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 32 }}>
                    <Text style={{ color: '#5f727d', fontSize: 10, letterSpacing: 3, marginBottom: 6 }}>SELECT CAMPAIGN TYPE</Text>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 4, marginBottom: 32 }}>GAME MODE</Text>
                    {[
                        { id: 'campaign', label: 'CAMPAIGN', sub: 'Standard WW3 scenario. Control 60% to win.', color: '#3a9eff' },
                        { id: 'blitz',    label: 'BLITZ',    sub: 'Fast pace. 40% control wins. AI is very aggressive.', color: '#e67e22' },
                        { id: 'survival', label: 'SURVIVAL', sub: 'Start with 1 region. Two AI factions already at war.', color: '#e74c3c' },
                    ].map(mode => (
                        <TouchableOpacity
                            key={mode.id}
                            style={{ width: '100%', marginBottom: 12, padding: 18, borderWidth: 1,
                                borderColor: gameMode === mode.id ? mode.color : '#2c3a44',
                                backgroundColor: gameMode === mode.id ? `${mode.color}22` : 'transparent' }}
                            onPress={() => { setGameMode(mode.id); setShowModeSelect(false); setUiMode('FACTION'); }}
                        >
                            <Text style={{ color: mode.color, fontSize: 14, fontWeight: '900', letterSpacing: 3, marginBottom: 4 }}>{mode.label}</Text>
                            <Text style={{ color: '#8090a0', fontSize: 11 }}>{mode.sub}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={{ marginTop: 8, padding: 14, borderWidth: 1, borderColor: '#2c3a44' }}
                        onPress={() => setShowModeSelect(false)}>
                        <Text style={{ color: '#5f727d', letterSpacing: 2, fontSize: 12 }}>CANCEL</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030508', // Deepest almost-black blue
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
    },
    gridLineH: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#3a9eff',
    },
    gridLineV: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: '#3a9eff',
    },
    content: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: 'space-evenly',
        alignItems: 'center', // Center everything horizontally
    },
    header: {
        alignItems: 'center', // Center text
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 6,
        marginTop: 10,
        textShadowColor: 'rgba(58, 158, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    subtitle: {
        fontSize: 10,
        color: '#888',
        letterSpacing: 6,
        marginTop: 4,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    menuContainer: {
        justifyContent: 'center',
        gap: 12, // Using flex gap for clean spacing
        width: '100%',
        maxWidth: 350, // Constrain width for landscape
        marginVertical: 15,
    },
    mainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(58, 158, 255, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(58, 158, 255, 0.5)',
        overflow: 'hidden',
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: '#3a9eff',
    },
    buttonInfo: {
        marginLeft: 15,
    },
    buttonTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 3,
    },
    buttonDesc: {
        color: '#666',
        fontSize: 10,
        marginTop: 4,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 15,
    },
    menuButtonText: {
        color: '#bbb',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    disabled: {
        opacity: 0.3,
    },
    footer: {
        gap: 5,
        opacity: 0.5,
    },
    version: {
        color: '#888',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    copyright: {
        color: '#666',
        fontSize: 8,
        letterSpacing: 1,
    },
});

export default MainMenuView;
