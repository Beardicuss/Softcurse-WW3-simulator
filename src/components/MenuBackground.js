/**
 * MenuBackground — animated node network for main menu.
 *
 * Uses React Native Animated (not Skia, not Reanimated shared values in render)
 * so there are zero Reanimated warnings. Each node is an Animated.View dot
 * driven by looping Animated.loop on the JS thread — lightweight on idle screen.
 */
import React, { useRef, useEffect, useMemo } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

function seededRand(seed) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 4294967295;
    };
}

const NODE_COUNT = 20;

// Generate stable node data once at module level
const NODES = (() => {
    const rand = seededRand(77);
    return Array.from({ length: NODE_COUNT }, (_, i) => ({
        id: i,
        x:      rand() * W,
        y:      rand() * H,
        r:      1.5 + rand() * 2.5,
        dx:     (rand() - 0.5) * 28,   // orbit half-width
        dy:     (rand() - 0.5) * 18,   // orbit half-height
        dur:    9000 + rand() * 8000,   // full cycle ms
        accent: rand() > 0.75,
    }));
})();

// Static edges between nearby nodes (computed once)
const EDGES = (() => {
    const edges = [];
    for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
            const dx = NODES[i].x - NODES[j].x;
            const dy = NODES[i].y - NODES[j].y;
            if (Math.sqrt(dx * dx + dy * dy) < W * 0.38) edges.push([i, j]);
        }
    }
    return edges.slice(0, 26);
})();

// One animated node — Animated.loop drives it entirely off render cycle
const Node = React.memo(({ node }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(anim, {
                toValue: 1,
                duration: node.dur,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, node.dx, 0] });
    const translateY = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, node.dy, 0] });
    const size = node.r * 2;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left:  node.x - node.r,
                top:   node.y - node.r,
                width:  size,
                height: size,
                borderRadius: node.r,
                backgroundColor: node.accent ? 'rgba(200,163,92,0.6)' : 'rgba(58,158,255,0.4)',
                transform: [{ translateX }, { translateY }],
            }}
        />
    );
});

// Static grid + edges rendered as a plain View (no animation needed)
const StaticLayer = () => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Horizontal grid lines */}
        {Array.from({ length: 7 }, (_, i) => (
            <View key={`h${i}`} style={[s.gridLine, s.hLine, { top: (H / 7) * i }]} />
        ))}
        {/* Vertical grid lines */}
        {Array.from({ length: 5 }, (_, i) => (
            <View key={`v${i}`} style={[s.gridLine, s.vLine, { left: (W / 5) * i }]} />
        ))}
        {/* Static edge lines between nodes */}
        {EDGES.map(([a, b], i) => {
            const na = NODES[a], nb = NODES[b];
            const dx = nb.x - na.x, dy = nb.y - na.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
                <View
                    key={`e${i}`}
                    style={{
                        position: 'absolute',
                        left: na.x,
                        top:  na.y,
                        width: len,
                        height: 1,
                        backgroundColor: 'rgba(58,158,255,0.09)',
                        transformOrigin: '0 50%',
                        transform: [{ rotate: `${angle}deg` }],
                    }}
                />
            );
        })}
    </View>
);

const MenuBackground = () => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <StaticLayer />
        {NODES.map(node => <Node key={node.id} node={node} />)}
        {/* Centre glow vignette */}
        <View style={s.glow} />
    </View>
);

const s = StyleSheet.create({
    gridLine: { position: 'absolute', backgroundColor: 'rgba(40,80,100,0.15)' },
    hLine:    { left: 0, right: 0, height: StyleSheet.hairlineWidth },
    vLine:    { top: 0, bottom: 0, width:  StyleSheet.hairlineWidth },
    glow: {
        position: 'absolute',
        alignSelf: 'center',
        top: H * 0.25,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(30,60,90,0.18)',
    },
});

export default React.memo(MenuBackground);
