/**
 * WW3: GLOBAL COLLAPSE — Tooltip System
 *
 * Wrap any element with <Tooltip text="..."> to show a tooltip on long-press.
 * Automatically positions above/below based on available screen space.
 */

import React, { useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    Dimensions, Modal
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

const Tooltip = ({ text, children, style, disabled }) => {
    const [visible, setVisible] = useState(false);
    const [pos, setPos]         = useState({ x: 0, y: 0, w: 0, h: 0 });
    const ref = useRef(null);

    if (!text || disabled) {
        return <View style={style}>{children}</View>;
    }

    const showTooltip = () => {
        ref.current?.measure((fx, fy, w, h, px, py) => {
            setPos({ x: px, y: py, w, h });
            setVisible(true);
        });
    };

    // Tooltip appears above if near bottom of screen, below if near top
    const tipY = pos.y + pos.h + 8 > SH - 100
        ? pos.y - 60
        : pos.y + pos.h + 8;

    const tipX = Math.max(8, Math.min(pos.x + pos.w / 2 - 110, SW - 228));

    return (
        <>
            <TouchableOpacity
                ref={ref}
                style={style}
                activeOpacity={0.8}
                onLongPress={showTooltip}
                delayLongPress={400}
            >
                {children}
            </TouchableOpacity>

            {visible && (
                <Modal
                    transparent
                    animationType="none"
                    visible={visible}
                    onRequestClose={() => setVisible(false)}
                    statusBarTranslucent
                >
                    <TouchableOpacity
                        style={styles.backdrop}
                        activeOpacity={1}
                        onPress={() => setVisible(false)}
                    >
                        <View style={[styles.bubble, { top: tipY, left: tipX }]}>
                            <Text style={styles.bubbleText}>{text}</Text>
                            <View style={styles.arrow} />
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
    },
    bubble: {
        position: 'absolute',
        backgroundColor: '#060f1a',
        borderWidth: 1,
        borderColor: '#1a3a50',
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxWidth: 220,
        elevation: 20,
    },
    bubbleText: {
        color: '#a0c0d0',
        fontSize: 11,
        lineHeight: 17,
    },
    arrow: {
        position: 'absolute',
        bottom: -5,
        left: '50%',
        marginLeft: -4,
        width: 8,
        height: 8,
        backgroundColor: '#060f1a',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#1a3a50',
        transform: [{ rotate: '45deg' }],
    },
});

export default Tooltip;
