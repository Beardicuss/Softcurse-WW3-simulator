import React, { useEffect, useRef } from 'react';
import {
    View, Text, Animated, TouchableOpacity,
    StyleSheet, Dimensions
} from 'react-native';
import useGameStore from '../store/useGameStore';

const { width, height } = Dimensions.get('window');

const ACT_DATA = {
    2: {
        act:      'ACT II',
        actRu:    'АКТ II',
        title:    'GLOBAL WAR',
        titleRu:  'ГЛОБАЛЬНАЯ ВОЙНА',
        sub:      'The conflict has escaped all containment. Every nation mobilises. The world is at war.',
        subRu:    'Конфликт вышел из-под контроля. Каждая нация мобилизована. Мир охвачен войной.',
        color:    '#e74c3c',
        lines: [
            'Diplomatic channels: CLOSED',
            'All faction AI: UNRESTRICTED',
            'Nuclear doctrine: ACTIVE',
            'Victory threshold: UNCHANGED',
        ],
        linesRu: [
            'Дипломатические каналы: ЗАКРЫТЫ',
            'Все ИИ фракции: БЕЗ ОГРАНИЧЕНИЙ',
            'Ядерная доктрина: АКТИВНА',
            'Порог победы: БЕЗ ИЗМЕНЕНИЙ',
        ],
        icon: '⚔',
    },
    3: {
        act:      'ACT III',
        actRu:    'АКТ III',
        title:    'ESCALATION',
        titleRu:  'ЭСКАЛАЦИЯ',
        sub:      'The nuclear threshold has been crossed. Civilisation teeters on the edge of annihilation.',
        subRu:    'Ядерный порог пройден. Цивилизация балансирует на краю уничтожения.',
        color:    '#9b59b6',
        lines: [
            'Dead Hand system: ARMED',
            'Fallout spreading across all regions',
            'Stability collapse: ACCELERATING',
            'The world is watching. Act quickly.',
        ],
        linesRu: [
            'Система Мёртвой Руки: ВЗВЕДЕНА',
            'Радиоактивное заражение распространяется',
            'Коллапс стабильности: УСКОРЯЕТСЯ',
            'Мир наблюдает. Действуйте быстро.',
        ],
        icon: '☢',
    },
};

const ActCutscene = ({ act, onDismiss }) => {
    const lang  = useGameStore(s => s.settings?.language || 'en');
    const data  = ACT_DATA[act];
    if (!data) return null;

    const ru = lang === 'ru';

    // Animations
    const bg      = useRef(new Animated.Value(0)).current;
    const scanY   = useRef(new Animated.Value(-height)).current;
    const actFade = useRef(new Animated.Value(0)).current;
    const titleY  = useRef(new Animated.Value(30)).current;
    const titleO  = useRef(new Animated.Value(0)).current;
    const subO    = useRef(new Animated.Value(0)).current;
    const lineOs  = data.lines.map(() => useRef(new Animated.Value(0)).current);
    const btnO    = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            // Flash background in
            Animated.timing(bg, { toValue: 1, duration: 300, useNativeDriver: true }),
            // Scan line sweeps down
            Animated.timing(scanY, { toValue: height, duration: 500, useNativeDriver: true }),
            // ACT label fades in
            Animated.timing(actFade, { toValue: 1, duration: 400, useNativeDriver: true }),
            // Title slides up
            Animated.parallel([
                Animated.timing(titleY, { toValue: 0,   duration: 400, useNativeDriver: true }),
                Animated.timing(titleO, { toValue: 1,   duration: 400, useNativeDriver: true }),
            ]),
            // Subtitle
            Animated.timing(subO, { toValue: 1, duration: 300, useNativeDriver: true }),
            // Lines stagger
            Animated.stagger(120, lineOs.map(o =>
                Animated.timing(o, { toValue: 1, duration: 250, useNativeDriver: true })
            )),
            // Button appears
            Animated.timing(btnO, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
    }, []);

    const lines = ru ? data.linesRu : data.lines;

    return (
        <Animated.View style={[styles.overlay, { opacity: bg, backgroundColor: `${data.color}18` }]}>
            {/* Dark base */}
            <View style={styles.darkBase} />

            {/* Scan line */}
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }], backgroundColor: data.color }]} />

            {/* Content */}
            <View style={styles.content}>

                {/* Act label */}
                <Animated.Text style={[styles.actLabel, { opacity: actFade, color: data.color }]}>
                    {data.icon}  {ru ? data.actRu : data.act}
                </Animated.Text>

                {/* Title */}
                <Animated.Text style={[
                    styles.title, { color: data.color },
                    { opacity: titleO, transform: [{ translateY: titleY }] }
                ]}>
                    {ru ? data.titleRu : data.title}
                </Animated.Text>

                {/* Subtitle */}
                <Animated.Text style={[styles.sub, { opacity: subO }]}>
                    {ru ? data.subRu : data.sub}
                </Animated.Text>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: data.color }]} />

                {/* Status lines */}
                {lines.map((line, i) => (
                    <Animated.View key={i} style={[styles.lineRow, { opacity: lineOs[i] }]}>
                        <View style={[styles.lineDot, { backgroundColor: data.color }]} />
                        <Text style={styles.lineText}>{line}</Text>
                    </Animated.View>
                ))}

                {/* Dismiss button */}
                <Animated.View style={{ opacity: btnO, marginTop: 32 }}>
                    <TouchableOpacity
                        style={[styles.btn, { borderColor: data.color }]}
                        onPress={onDismiss}
                    >
                        <Text style={[styles.btnText, { color: data.color }]}>
                            {ru ? 'ПРОДОЛЖИТЬ ▶' : 'CONTINUE ▶'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 500,
        justifyContent: 'center',
        alignItems: 'center',
    },
    darkBase: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(2,4,8,0.96)',
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        opacity: 0.8,
    },
    content: {
        width: width - 48,
        alignItems: 'center',
    },
    actLabel: {
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 6,
        marginBottom: 12,
        opacity: 0.9,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: 4,
        textAlign: 'center',
        marginBottom: 16,
    },
    sub: {
        color: '#7090a0',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    divider: {
        width: 60,
        height: 2,
        marginBottom: 20,
        opacity: 0.6,
    },
    lineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#0a1520',
        paddingHorizontal: 8,
    },
    lineDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginRight: 12,
    },
    lineText: {
        color: '#8090a0',
        fontSize: 11,
        letterSpacing: 1,
    },
    btn: {
        borderWidth: 1,
        paddingVertical: 14,
        paddingHorizontal: 40,
    },
    btnText: {
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 3,
    },
});

export default ActCutscene;
