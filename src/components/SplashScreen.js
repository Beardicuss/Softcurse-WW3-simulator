import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions, Image } from 'react-native';
import useGameStore from '../store/useGameStore';

const { width, height } = Dimensions.get('window');

const Particle = ({ delay, startX, startY, endX, endY, size, hue }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 3500 + Math.random() * 2000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [startX, endX]
    });

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [startY, endY]
    });

    const opacity = anim.interpolate({
        inputRange: [0, 0.2, 0.8, 1],
        outputRange: [0, 0.8, 0.8, 0]
    });

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: size * 2,
                height: size * 2,
                borderRadius: size,
                backgroundColor: hue,
                opacity,
                transform: [{ translateX }, { translateY }],
            }}
        />
    );
};

const SplashScreen = () => {
    const setUiMode = useGameStore(s => s.setUiMode);

    // Timing aligns precisely with simulation:
    // 0 -> 300: black
    // 300 -> 1200: dust in
    // 1000 -> 2200: reveal logo
    // 2200 -> 3800: dust out
    // 3800 -> 4400: fade to black

    const mainOpacity = useRef(new Animated.Value(0)).current;
    const dustOpacity = useRef(new Animated.Value(0)).current;
    const logoGroupOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.88)).current;
    const logoTranslate = useRef(new Animated.Value(10)).current;
    const glowIntensity = useRef(new Animated.Value(0.5)).current;

    const subOpacity = useRef(new Animated.Value(0)).current;
    const subSpacing = useRef(new Animated.Value(12)).current; // simulated using scale

    // Generate 60 larger particles to simulate the canvas dust
    const particles = Array.from({ length: 60 }).map((_, i) => {
        const hue = Math.random() > 0.5 ? '#1e78c8' : '#64c8ff';
        return {
            id: i,
            delay: Math.random() * 2000,
            startX: Math.random() * width,
            startY: Math.random() * height,
            endX: (Math.random() - 0.5) * 300 + Math.random() * width,
            endY: (Math.random() - 0.5) * 300 + Math.random() * height,
            size: Math.random() * 6 + 2,
            hue
        };
    });

    useEffect(() => {
        // Master Container fade
        Animated.sequence([
            Animated.timing(mainOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(6000), // Hold much longer
            Animated.timing(mainOpacity, { toValue: 0, duration: 800, useNativeDriver: true })
        ]).start();

        // Dust Layer Fade In/Out
        Animated.sequence([
            Animated.delay(300),
            Animated.timing(dustOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
            Animated.delay(3500),
            Animated.timing(dustOpacity, { toValue: 0, duration: 1500, useNativeDriver: true })
        ]).start();

        // Main Logo Box Reveal
        Animated.sequence([
            Animated.delay(1200),
            Animated.parallel([
                Animated.timing(logoGroupOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
                Animated.timing(logoScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
                Animated.timing(logoTranslate, { toValue: 0, duration: 1200, useNativeDriver: true })
            ]),
            Animated.delay(2800), // Hold Logo
            Animated.timing(logoGroupOpacity, { toValue: 0, duration: 800, useNativeDriver: true })
        ]).start();

        // Logo continuous glow pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowIntensity, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(glowIntensity, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
            ])
        ).start();

        // Subtitle Fade
        Animated.sequence([
            Animated.delay(2000),
            Animated.timing(subOpacity, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
            Animated.delay(1700),
            Animated.timing(subOpacity, { toValue: 0, duration: 600, useNativeDriver: true })
        ]).start();

        // Transition out
        const timer = setTimeout(() => {
            setUiMode('INTRO');
        }, 6800);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.canvas, { opacity: mainOpacity }]}>

                {/* Dust Background Layer */}
                <Animated.View style={[styles.dustLayer, { opacity: dustOpacity }]}>
                    {particles.map(p => <Particle key={p.id} {...p} />)}
                </Animated.View>

                {/* Simulated ambient light behind the logo */}
                <Animated.View style={[styles.ambientCenterLight, { opacity: glowIntensity }]} />

                <Animated.View
                    style={[
                        styles.centerStage,
                        {
                            opacity: logoGroupOpacity,
                            transform: [
                                { scale: logoScale },
                                { translateY: logoTranslate }
                            ]
                        }
                    ]}
                >
                    {/* The Logo Image */}
                    <View style={styles.logoWrapper}>
                        {/* Glow ring backing */}
                        <Animated.View style={[styles.glowRing, { opacity: glowIntensity }]} />
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.studioText}>SOFTCURSE</Text>

                    <Animated.Text
                        style={[
                            styles.subtitle,
                            { opacity: subOpacity }
                        ]}
                    >
                        STUDIO · PRESENTS
                    </Animated.Text>
                </Animated.View>

            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    canvas: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dustLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    ambientCenterLight: {
        position: 'absolute',
        width: height * 0.8,
        height: height * 0.8,
        borderRadius: height * 0.4,
        backgroundColor: 'rgba(58, 175, 255, 0.08)',
    },
    centerStage: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    logoWrapper: {
        width: 180,
        height: 180,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowRing: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(58, 175, 255, 0.15)',
    },
    logoImage: {
        width: '100%',
        height: '100%',
        zIndex: 1,
        tintColor: '#fff', // Force pure white base for glow
    },
    studioText: {
        fontSize: 32, // Adjusted for mobile screen real estate
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 12,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 11,
        color: '#5599bb',
        letterSpacing: 6,
        fontFamily: 'monospace',
    }
});

export default SplashScreen;
