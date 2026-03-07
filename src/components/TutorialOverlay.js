/**
 * WW3: GLOBAL COLLAPSE — First-Run Tutorial System
 *
 * A step-by-step overlay that guides new players through:
 * 1. The map & regions
 * 2. Resources (oil, funds, steel, stability)
 * 3. The bottom nav tabs
 * 4. How to attack
 * 5. End turn
 * 6. Special weapons
 * Dismissed permanently after completion. Skippable at any step.
 */

import React, { memo, useEffect, useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    Dimensions, Animated
} from 'react-native';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Tutorial step definitions ─────────────────────────────────────────────────
const STEPS = [
    {
        id: 'welcome',
        anchor: 'center',
        icon: '🌍',
        titleKey: 'tut.welcome.title',
        bodyKey:  'tut.welcome.body',
    },
    {
        id: 'map',
        anchor: 'top',
        icon: '🗺',
        titleKey: 'tut.map.title',
        bodyKey:  'tut.map.body',
        highlight: 'map',
    },
    {
        id: 'resources',
        anchor: 'top',
        icon: '💰',
        titleKey: 'tut.resources.title',
        bodyKey:  'tut.resources.body',
        highlight: 'hud',
    },
    {
        id: 'select',
        anchor: 'center',
        icon: '👆',
        titleKey: 'tut.select.title',
        bodyKey:  'tut.select.body',
    },
    {
        id: 'attack',
        anchor: 'bottom',
        icon: '⚔',
        titleKey: 'tut.attack.title',
        bodyKey:  'tut.attack.body',
        highlight: 'card',
    },
    {
        id: 'deploy',
        anchor: 'bottom',
        icon: '🛠',
        titleKey: 'tut.deploy.title',
        bodyKey:  'tut.deploy.body',
        highlight: 'nav',
    },
    {
        id: 'research',
        anchor: 'bottom',
        icon: '🔬',
        titleKey: 'tut.research.title',
        bodyKey:  'tut.research.body',
    },
    {
        id: 'endturn',
        anchor: 'bottom',
        icon: '⏩',
        titleKey: 'tut.endturn.title',
        bodyKey:  'tut.endturn.body',
        highlight: 'endturn',
    },
    {
        id: 'stability',
        anchor: 'center',
        icon: '📊',
        titleKey: 'tut.stability.title',
        bodyKey:  'tut.stability.body',
    },
    {
        id: 'nukes',
        anchor: 'center',
        icon: '☢',
        titleKey: 'tut.nukes.title',
        bodyKey:  'tut.nukes.body',
    },
    {
        id: 'done',
        anchor: 'center',
        icon: '🏆',
        titleKey: 'tut.done.title',
        bodyKey:  'tut.done.body',
    },
];

const TOTAL = STEPS.length;

const TutorialOverlay = ({ onDismiss }) => {
    const t    = useTranslation();
    const lang = useGameStore(s => s.settings?.language || 'en');
    const [step, setStep] = useState(0);
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const animateIn = () => {
        slideAnim.setValue(20);
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]).start();
    };

    const animateOut = (cb) => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -20, duration: 180, useNativeDriver: true }),
        ]).start(() => cb?.());
    };

    useEffect(() => { animateIn(); }, []);

    const goNext = () => {
        animateOut(() => {
            if (step >= TOTAL - 1) {
                onDismiss();
            } else {
                setStep(s => s + 1);
                animateIn();
            }
        });
    };

    const skip = () => {
        animateOut(() => onDismiss());
    };

    const cur = STEPS[step];
    const isLast = step === TOTAL - 1;
    const isFirst = step === 0;

    // Card vertical position based on anchor
    const cardStyle = cur.anchor === 'top'
        ? { top: 90 }
        : cur.anchor === 'bottom'
        ? { bottom: 120 }
        : { top: SH * 0.28 };

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            {/* Semi-transparent backdrop — only on welcome/done */}
            {(cur.anchor === 'center') && (
                <View style={styles.backdrop} />
            )}

            {/* Tutorial card */}
            <Animated.View style={[
                styles.card,
                cardStyle,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
                {/* Progress bar */}
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${((step + 1) / TOTAL) * 100}%` }]} />
                </View>

                {/* Step counter */}
                <View style={styles.cardMeta}>
                    <Text style={styles.stepCounter}>{step + 1} / {TOTAL}</Text>
                    <TouchableOpacity onPress={skip} style={styles.skipBtn}>
                        <Text style={styles.skipText}>{t('tut.skip')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Icon + Title */}
                <View style={styles.titleRow}>
                    <Text style={styles.stepIcon}>{cur.icon}</Text>
                    <Text style={styles.stepTitle}>{t(cur.titleKey)}</Text>
                </View>

                {/* Body text */}
                <Text style={styles.stepBody}>{t(cur.bodyKey)}</Text>

                {/* Navigation buttons */}
                <View style={styles.btnRow}>
                    {!isFirst && (
                        <TouchableOpacity style={styles.prevBtn} onPress={() => {
                            animateOut(() => { setStep(s => s - 1); animateIn(); });
                        }}>
                            <Text style={styles.prevBtnText}>← {t('tut.prev')}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.nextBtn, isFirst && { flex: 1 }]}
                        onPress={goNext}
                    >
                        <Text style={styles.nextBtnText}>
                            {isLast ? t('tut.finish') : t('tut.next')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 250,
        pointerEvents: 'box-none',
    },
    backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },

    card: {
        position: 'absolute',
        left: 14, right: 14,
        backgroundColor: '#04090f',
        borderWidth: 1,
        borderColor: '#1a3a4a',
        padding: 0,
        elevation: 20,
    },

    progressTrack: {
        height: 2,
        backgroundColor: '#0a1a28',
    },
    progressFill: {
        height: 2,
        backgroundColor: '#3a9eff',
    },

    cardMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    stepCounter: {
        color: '#2a4a5a',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
    },
    skipBtn: { padding: 4 },
    skipText: {
        color: '#2a4a5a',
        fontSize: 10,
        letterSpacing: 1,
        fontWeight: '700',
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#0a1a28',
    },
    stepIcon: { fontSize: 24 },
    stepTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
        flex: 1,
    },

    stepBody: {
        color: '#5a8090',
        fontSize: 12,
        lineHeight: 20,
        padding: 16,
        paddingTop: 14,
    },

    btnRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 4,
    },
    prevBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#1a3a4a',
    },
    prevBtnText: {
        color: '#3a6070',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    nextBtn: {
        flex: 1,
        backgroundColor: '#3a9eff',
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextBtnText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
    },
});

export default memo(TutorialOverlay);
