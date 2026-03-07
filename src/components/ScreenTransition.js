import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

/**
 * Wraps any screen with a fade+slide-in entrance animation.
 * Usage: wrap screen root in <ScreenTransition> ... </ScreenTransition>
 */
const ScreenTransition = ({ children, type = 'fade', duration = 320, delay = 0 }) => {
    const opacity   = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(type === 'slideUp' ? 40 : type === 'slideDown' ? -40 : 0)).current;
    const scale     = useRef(new Animated.Value(type === 'scale' ? 0.96 : 1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1, duration, delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0, duration, delay,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 1, duration, delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[
            styles.container,
            { opacity, transform: [{ translateY }, { scale }] }
        ]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});

export default memo(ScreenTransition);
