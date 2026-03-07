/**
 * WW3: GLOBAL COLLAPSE — Animated Number
 *
 * Displays a number that smoothly tweens when its value changes.
 * Uses React Native's Animated API (JS thread) — no Reanimated needed.
 * Shows a flash color briefly when the value increases or decreases.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

const AnimatedNumber = ({
    value,
    style,
    duration = 400,
    prefix = '',
    suffix = '',
    flashOnChange = true,
    increaseColor = '#2ecc71',
    decreaseColor = '#e74c3c',
}) => {
    const prevValue   = useRef(value);
    const displayVal  = useRef(value);
    const animVal     = useRef(new Animated.Value(value)).current;
    const flashAnim   = useRef(new Animated.Value(0)).current;
    const [rendered, setRendered] = useState(value);

    useEffect(() => {
        if (value === prevValue.current) return;

        const isIncrease = value > prevValue.current;
        prevValue.current = value;

        // Tween the numeric value
        Animated.timing(animVal, {
            toValue: value,
            duration,
            useNativeDriver: false,
        }).start();

        // Listen to update displayed integer
        const id = animVal.addListener(({ value: v }) => {
            setRendered(Math.round(v));
        });

        // Flash color
        if (flashOnChange) {
            flashAnim.setValue(isIncrease ? 1 : -1);
            Animated.timing(flashAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: false,
            }).start();
        }

        return () => animVal.removeListener(id);
    }, [value]);

    const textColor = flashAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [decreaseColor, (StyleSheet.flatten(style)?.color || '#fff'), increaseColor],
    });

    return (
        <Animated.Text style={[style, flashOnChange ? { color: textColor } : null]}>
            {prefix}{rendered}{suffix}
        </Animated.Text>
    );
};

export default AnimatedNumber;
