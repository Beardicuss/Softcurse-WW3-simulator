import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const ACT_CONFIG = {
    2: {
        label:    'ACT II · GLOBAL WAR',
        sub:      'Full mobilisation declared worldwide.',
        color:    '#e67e22',
        icon:     '⚔',
    },
    3: {
        label:    'ACT III · NUCLEAR ESCALATION',
        sub:      'Nuclear doctrine is now active. Anything is possible.',
        color:    '#9b59b6',
        icon:     '☢',
    },
};

const ActBanner = ({ act, onDone }) => {
    const config = ACT_CONFIG[act];
    if (!config) return null;

    const fadeAnim   = useRef(new Animated.Value(0)).current;
    const slideAnim  = useRef(new Animated.Value(-30)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]),
            Animated.delay(3200),
            Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start(() => onDone?.());
    }, []);

    return (
        <Animated.View style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
            <View style={[styles.bar, { borderColor: config.color }]}>
                <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
                <View style={styles.text}>
                    <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
                    <Text style={styles.sub}>{config.sub}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 500,
        pointerEvents: 'none',
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: 'rgba(6,13,24,0.97)',
        borderWidth: 1,
        borderRadius: 4,
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: width * 0.75,
        shadowColor: '#000',
        shadowOpacity: 0.6,
        shadowRadius: 12,
    },
    icon:  { fontSize: 24 },
    text:  { flex: 1 },
    label: { fontSize: 13, fontWeight: '900', letterSpacing: 2 },
    sub:   { color: '#888', fontSize: 10, marginTop: 2 },
});

export default ActBanner;
