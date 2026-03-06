import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Animated,
    Image
} from 'react-native';
import { TIMELINE_EVENTS } from '../data/mapData';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';

const EventItem = ({ event, isLast, isVisible }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(18)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true })
            ]).start();
        }
    }, [isVisible]);

    return (
        <Animated.View style={[styles.eventRow, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            {/* Year Column */}
            <View style={styles.yearCol}>
                <Text style={[styles.yearText, { color: event.color }]}>{event.year}</Text>
            </View>

            {/* Timeline Node Column */}
            <View style={styles.nodeCol}>
                {/* The vertical line underneath the node in the original design goes from top to bottom. It's rendered absolutely behind the nodes below. */}
                <View style={[
                    styles.nodeCircle,
                    {
                        backgroundColor: `${event.color}18`,
                        borderColor: `${event.color}66`,
                        shadowColor: isVisible ? `${event.color}66` : 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: isVisible ? 1 : 0,
                        shadowRadius: 12,
                        elevation: isVisible ? 6 : 0,
                    }
                ]}>
                    <Text style={styles.eventIcon}>{event.icon}</Text>
                </View>
                {!isLast && <View style={styles.verticalLineSegment} />}
            </View>

            {/* Content Column */}
            <View style={styles.contentCol}>
                <Text style={[styles.eventTitle, { color: event.color }]}>{event.title}</Text>
                <Text style={styles.eventDesc}>{event.desc}</Text>
            </View>
        </Animated.View>
    );
};

const IntroScreen = () => {
    const t = useTranslation();
    const setUiMode = useGameStore(s => s.setUiMode);
    const [visibleIdx, setVisibleIdx] = useState(-1);
    const [done, setDone] = useState(false);
    const [skipped, setSkipped] = useState(false);

    const scrollViewRef = useRef(null);
    const fadeAnimFinal = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (skipped) return;
        let i = 0;
        const interval = setInterval(() => {
            setVisibleIdx(i);
            i++;
            if (i >= TIMELINE_EVENTS.length) {
                clearInterval(interval);
                setTimeout(() => setDone(true), 600);
            }
        }, 620); // Exactly matching 620ms from prototype
        return () => clearInterval(interval);
    }, [skipped]);

    // Auto-scroll when new items render
    useEffect(() => {
        if (visibleIdx >= 0 || done) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [visibleIdx, done]);

    // Animate the final box in
    useEffect(() => {
        if (done) {
            Animated.timing(fadeAnimFinal, {
                toValue: 1,
                duration: 500,
                delay: 200,
                useNativeDriver: true
            }).start();
        }
    }, [done]);

    const handleSkip = () => {
        setSkipped(true);
        setVisibleIdx(TIMELINE_EVENTS.length - 1);
        setTimeout(() => setDone(true), 200);
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    return (
        <View style={styles.container}>
            {/* Header matches prototype precisely */}
            <View style={styles.header}>
                <View style={styles.headerCenter}>
                    <Text style={styles.gameTitle}>{t('intro.title')}</Text>
                    <Text style={styles.gameSubtitle}>{t('intro.subtitle')}</Text>
                </View>
            </View>

            <View style={styles.timelineContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollArea}
                    contentContainerStyle={styles.scrollContent}
                >
                    {TIMELINE_EVENTS.slice(0, Math.max(0, visibleIdx + 1)).map((evt, i) => (
                        <EventItem
                            key={i}
                            event={evt}
                            isLast={i === TIMELINE_EVENTS.length - 1}
                            isVisible={true}
                        />
                    ))}

                    {/* Final Warning Block */}
                    {done && (
                        <Animated.View style={[styles.finalBlock, { opacity: fadeAnimFinal }]}>
                            <Text style={styles.finalEmojis}>⚔️</Text>
                            <Text style={styles.finalHeader}>{t('intro.burnLine')}</Text>
                            <Text style={styles.finalDesc}>
                                Every conflict, every miscalculation, every broken treaty led to this moment.{"\n"}
                                Three superpowers now control the fate of civilization.{"\n"}
                                <Text style={styles.finalHighlight}>{t('intro.youAreOne')}</Text>
                            </Text>
                            <TouchableOpacity style={styles.continueBtn} onPress={() => setUiMode('MENU')}>
                                <Text style={styles.continueText}>{t('intro.enter')}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </ScrollView>
            </View>

            {!done && (
                <TouchableOpacity style={styles.skipOverlay} onPress={handleSkip}>
                    <Text style={styles.skipText}>SKIP &gt;&gt;</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020810',
    },
    header: {
        paddingVertical: 14,
        paddingHorizontal: 30, // Using 30 to approximate 40px in web safely for typical mobile
        borderBottomWidth: 1,
        borderBottomColor: '#0d2030',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#030c18', // Fallback for gradient
    },
    headerCenter: {
        alignItems: 'center',
    },
    gameTitle: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 4,
        color: '#e0eeff',
        lineHeight: 18,
    },
    gameSubtitle: {
        fontSize: 10,
        letterSpacing: 3,
        color: '#2a5a6a',
        marginTop: 6,
    },
    timelineContainer: {
        flex: 1,
        position: 'relative',
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 30,
        paddingVertical: 40,
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
    },
    eventRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 18,
        minHeight: 40,
    },
    yearCol: {
        width: 45, // Adjusted for typical mobile fonts
        alignItems: 'flex-end',
        paddingTop: 3,
    },
    yearText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    nodeCol: {
        width: 42,
        alignItems: 'center',
        paddingTop: 2,
        zIndex: 1,
    },
    nodeCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#020810',
    },
    verticalLineSegment: {
        position: 'absolute',
        top: 24, // Starting exactly below the current circle
        bottom: -18, // Extending through the marginBottom spacing to meet the next circle
        width: 1,
        backgroundColor: '#1a3a4a',
        zIndex: -1,
    },
    eventIcon: {
        fontSize: 12, // Emoji size
    },
    contentCol: {
        flex: 1,
        paddingTop: 2,
    },
    eventTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 3,
        letterSpacing: 1,
    },
    eventDesc: {
        fontSize: 9,
        color: '#7a9aaa',
        lineHeight: 15, // 1.7 proxy
    },
    finalBlock: {
        marginTop: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 34, 0, 0.2)',
        borderRadius: 4,
        backgroundColor: 'rgba(40, 5, 5, 0.5)',
        alignItems: 'center',
    },
    finalEmojis: {
        fontSize: 26,
        marginBottom: 8,
    },
    finalHeader: {
        fontSize: 16,
        letterSpacing: 5,
        color: '#ff4422',
        marginBottom: 6,
        fontWeight: 'bold', // proxy for Cinzel
    },
    finalDesc: {
        fontSize: 9,
        color: '#886655',
        lineHeight: 17, // 1.9 proxy
        marginBottom: 20,
        textAlign: 'center',
    },
    finalHighlight: {
        color: '#cc6633',
        fontWeight: 'bold',
    },
    continueBtn: {
        marginRight: 8,
    },
});

export default IntroScreen;
