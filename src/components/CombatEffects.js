/**
 * WW3: GLOBAL COLLAPSE — Combat Visual Effects
 *
 * Lightweight Skia canvas overlay drawn on top of the map.
 * Uses react-native-reanimated for animation timing.
 * Renders: explosions, capture pulses, nuke flashes, missile trails.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import {
    Canvas, Circle, Path, Skia, Group,
    LinearGradient, vec,
} from '@shopify/react-native-skia';
import {
    useSharedValue, withTiming, withSequence,
    withDelay, runOnJS, Easing,
} from 'react-native-reanimated';
import { REGIONS } from '../data/mapData';

const { width: W, height: H } = Dimensions.get('window');
const MAP_SCALE = W / 140;
const px = (x) => x * MAP_SCALE;
const py = (y) => y * MAP_SCALE;

// Get screen coords for a region id
function regionCoords(id) {
    const r = REGIONS.find(x => x.id === id);
    if (!r) return { x: W / 2, y: H / 2 };
    return { x: px(r.x), y: py(r.y) };
}

// ─── Single effect entry type ─────────────────────────────────────────────────
// { type: 'explosion'|'capture'|'nuke'|'missile', from?, to?, x, y, color }

const CombatEffects = ({ effects = [], onComplete }) => {
    // One animated value per active effect (up to 8 simultaneous)
    const progA = useSharedValue(0);
    const progB = useSharedValue(0);
    const progC = useSharedValue(0);
    const progD = useSharedValue(0);
    const progE = useSharedValue(0);
    const progF = useSharedValue(0);
    const progG = useSharedValue(0);
    const progH = useSharedValue(0);
    const progs = [progA, progB, progC, progD, progE, progF, progG, progH];

    const runEffect = useCallback((idx, type) => {
        const prog = progs[idx];
        prog.value = 0;
        const duration = type === 'nuke' ? 900 : type === 'missile' ? 600 : 500;
        prog.value = withSequence(
            withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
            withDelay(100, withTiming(0, { duration: 200 }))
        );
    }, []);

    useEffect(() => {
        effects.slice(0, 8).forEach((eff, i) => {
            runEffect(i, eff.type);
        });
    }, [effects]);

    if (!effects || effects.length === 0) return null;

    return (
        <Canvas
            style={{
                position: 'absolute',
                top: 0, left: 0,
                width: W, height: H,
                zIndex: 150,
                pointerEvents: 'none',
            }}
        >
            {effects.slice(0, 8).map((eff, i) => {
                const prog = progs[i];
                const coords = eff.x != null ? { x: eff.x, y: eff.y } : regionCoords(eff.regionId);

                if (eff.type === 'explosion') {
                    return (
                        <Group key={`eff-${i}`}>
                            {/* Outer blast ring */}
                            <Circle
                                cx={coords.x}
                                cy={coords.y}
                                r={prog.value * 40}
                                color={`rgba(255,120,20,${(1 - prog.value) * 0.6})`}
                            />
                            {/* Inner core */}
                            <Circle
                                cx={coords.x}
                                cy={coords.y}
                                r={prog.value * 18}
                                color={`rgba(255,220,80,${(1 - prog.value) * 0.9})`}
                            />
                            {/* Flash white */}
                            <Circle
                                cx={coords.x}
                                cy={coords.y}
                                r={prog.value * 8}
                                color={`rgba(255,255,255,${Math.max(0, 0.8 - prog.value * 0.8)})`}
                            />
                        </Group>
                    );
                }

                if (eff.type === 'capture') {
                    return (
                        <Group key={`eff-${i}`}>
                            {/* Expanding capture ring */}
                            <Circle
                                cx={coords.x}
                                cy={coords.y}
                                r={prog.value * 55}
                                color={`rgba(80,200,255,${(1 - prog.value) * 0.5})`}
                                style="stroke"
                                strokeWidth={3}
                            />
                            <Circle
                                cx={coords.x}
                                cy={coords.y}
                                r={prog.value * 30}
                                color={`rgba(80,200,255,${(1 - prog.value) * 0.3})`}
                            />
                        </Group>
                    );
                }

                if (eff.type === 'nuke') {
                    return (
                        <Group key={`eff-${i}`}>
                            {/* Massive nuke flash */}
                            <Circle
                                cx={coords.x}
                                cy={coords.y}
                                r={prog.value * 120}
                                color={`rgba(255,255,200,${Math.max(0, 0.7 - prog.value * 0.7)})`}
                            />
                            <Circle
                                cx={coords.x}
                                cy={coords.y}
                                r={prog.value * 70}
                                color={`rgba(200,50,0,${(1 - prog.value) * 0.8})`}
                            />
                            <Circle
                                cx={coords.x}
                                cy={coords.y}
                                r={prog.value * 30}
                                color={`rgba(255,255,255,${Math.max(0, 0.9 - prog.value)})`}
                            />
                            {/* Shockwave ring */}
                            <Circle
                                cx={coords.x}
                                cy={coords.y}
                                r={prog.value * 150}
                                color={`rgba(255,180,0,${Math.max(0, 0.4 - prog.value * 0.4)})`}
                                style="stroke"
                                strokeWidth={4}
                            />
                        </Group>
                    );
                }

                if (eff.type === 'defense') {
                    return (
                        <Group key={`eff-${i}`}>
                            {/* Red defensive hit */}
                            <Circle
                                cx={coords.x}
                                cy={coords.y}
                                r={prog.value * 35}
                                color={`rgba(220,40,40,${(1 - prog.value) * 0.55})`}
                            />
                            <Circle
                                cx={coords.x}
                                cy={coords.y}
                                r={prog.value * 15}
                                color={`rgba(255,80,80,${(1 - prog.value) * 0.85})`}
                            />
                        </Group>
                    );
                }

                return null;
            })}
        </Canvas>
    );
};

export default CombatEffects;
