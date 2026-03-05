import React, { useMemo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
    Canvas, Circle, Path, Group, Rect, vec,
    LinearGradient, Skia, Shadow, DashPathEffect
} from '@shopify/react-native-skia';
import Animated, { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { REGIONS, ADJ, FD } from '../data/mapData';
import { REGION_PATHS } from '../data/worldRegionPaths';
import useGameStore from '../store/useGameStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAP_BASE_WIDTH = 140;
const MAP_BASE_HEIGHT = 100;
const MAP_SCALE = SCREEN_WIDTH / MAP_BASE_WIDTH;

const GameMap = () => {
    const { regions, playerFaction, selectRegion, selectedRegionId } = useGameStore();

    const mapRenderedHeight = MAP_BASE_HEIGHT * MAP_SCALE;
    const estCanvasHeight = SCREEN_HEIGHT * 0.7;
    const initialYOffset = Math.max(0, (estCanvasHeight - mapRenderedHeight) / 2);

    const scale = useSharedValue(1.2);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(initialYOffset);
    const savedScale = useSharedValue(1.2);
    const savedTX = useSharedValue(0);
    const savedTY = useSharedValue(initialYOffset);

    const projectX = (x) => x * MAP_SCALE;
    const projectY = (y) => y * MAP_SCALE;

    const transform = useDerivedValue(() => {
        const s = Math.max(0.2, Math.min(scale.value, 6));
        return [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: s },
        ];
    });

    const pinchGesture = Gesture.Pinch()
        .onUpdate(e => { scale.value = savedScale.value * e.scale; })
        .onEnd(() => { savedScale.value = scale.value; });

    const panGesture = Gesture.Pan()
        .onUpdate(e => {
            translateX.value = Math.max(-3000, Math.min(savedTX.value + e.translationX, 3000));
            translateY.value = Math.max(-3000, Math.min(savedTY.value + e.translationY, 3000));
        })
        .onEnd(() => {
            savedTX.value = translateX.value;
            savedTY.value = translateY.value;
        });

    const tapGesture = Gesture.Tap().onEnd(event => {
        const lx = (event.x - translateX.value) / scale.value;
        const ly = (event.y - translateY.value) / scale.value;
        let closest = null, minDist = 35;
        REGIONS.forEach(r => {
            const d = Math.hypot(lx - projectX(r.x), ly - projectY(r.y));
            if (d < minDist) { minDist = d; closest = r.id; }
        });
        if (closest) selectRegion(closest);
    });

    const composed = Gesture.Simultaneous(pinchGesture, panGesture, tapGesture);

    // Adjacency lines — memoised
    const connections = useMemo(() => {
        const lines = [], seen = new Set();
        REGIONS.forEach(r => {
            (ADJ[r.id] || []).forEach(adjId => {
                const key = [r.id, adjId].sort().join('-');
                if (!seen.has(key)) {
                    const t = REGIONS.find(x => x.id === adjId);
                    if (t) lines.push({
                        x1: projectX(r.x), y1: projectY(r.y),
                        x2: projectX(t.x), y2: projectY(t.y),
                        id: key,
                    });
                    seen.add(key);
                }
            });
        });
        return lines;
    }, []);

    // Parse + scale all country SVG paths once — NEVER do this outside useMemo
    const regionSkiaPaths = useMemo(() => {
        return REGION_PATHS.map(entry => {
            try {
                const raw = Skia.Path.MakeFromSVGString(entry.path);
                if (!raw) return { ...entry, skiPath: null };
                const m = Skia.Matrix();
                m.scale(MAP_SCALE, MAP_SCALE);
                raw.transform(m);
                return { ...entry, skiPath: raw };
            } catch {
                return { ...entry, skiPath: null };
            }
        });
    }, []);

    const createCurvedPath = (x1, y1, x2, y2) => {
        const p = Skia.Path.Make();
        p.moveTo(x1, y1);
        p.quadTo((x1 + x2) / 2, (y1 + y2) / 2 - 12, x2, y2);
        return p;
    };

    const createHexPath = (cx, cy, radius) => {
        const p = Skia.Path.Make();
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 6;
            const x = cx + radius * Math.cos(a);
            const y = cy + radius * Math.sin(a);
            i === 0 ? p.moveTo(x, y) : p.lineTo(x, y);
        }
        p.close();
        return p;
    };

    const createTankPath = (cx, cy, scale = 1) => {
        const path = Skia.Path.Make();
        const s = scale * 1.5;
        path.moveTo(cx - 3 * s, cy + 1 * s);
        path.lineTo(cx + 3 * s, cy + 1 * s);
        path.lineTo(cx + 2 * s, cy - 1 * s);
        path.lineTo(cx - 2 * s, cy - 1 * s);
        path.close();
        path.moveTo(cx - 1 * s, cy - 1 * s);
        path.lineTo(cx + 1 * s, cy - 1 * s);
        path.lineTo(cx + 1 * s, cy - 2 * s);
        path.lineTo(cx - 1 * s, cy - 2 * s);
        path.close();
        path.moveTo(cx + 1 * s, cy - 1.5 * s);
        path.lineTo(cx + 4 * s, cy - 1.5 * s);
        return path;
    };

    const createJetPath = (cx, cy, scale = 1) => {
        const path = Skia.Path.Make();
        const s = scale * 1.5;
        path.moveTo(cx, cy - 3 * s); // Nose
        path.lineTo(cx + 1 * s, cy - 1 * s);
        path.lineTo(cx + 3 * s, cy + 1 * s); // Right wing
        path.lineTo(cx + 1 * s, cy + 1 * s);
        path.lineTo(cx + 1 * s, cy + 3 * s); // Tail
        path.lineTo(cx, cy + 2 * s);
        path.lineTo(cx - 1 * s, cy + 3 * s); // Tail
        path.lineTo(cx - 1 * s, cy + 1 * s);
        path.lineTo(cx - 3 * s, cy + 1 * s); // Left wing
        path.lineTo(cx - 1 * s, cy - 1 * s);
        path.close();
        return path;
    };

    const createShipPath = (cx, cy, scale = 1) => {
        const path = Skia.Path.Make();
        const s = scale * 1.5;
        path.moveTo(cx - 4 * s, cy - 1 * s);
        path.lineTo(cx + 3 * s, cy - 1 * s);
        path.lineTo(cx + 4 * s, cy + 1 * s);
        path.lineTo(cx - 3 * s, cy + 1 * s);
        path.close();
        path.moveTo(cx - 1 * s, cy - 1 * s);
        path.lineTo(cx + 1 * s, cy - 1 * s);
        path.lineTo(cx + 1 * s, cy - 3 * s);
        path.lineTo(cx - 1 * s, cy - 3 * s);
        path.close();
        return path;
    };

    return (
        <GestureDetector gesture={composed}>
            <Canvas style={styles.canvas}>

                {/* Ocean background */}
                <Rect x={0} y={0} width={3000} height={3000}>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(3000, 3000)}
                        colors={['#0d1f35', '#071220', '#0f1a2e']}
                    />
                </Rect>

                <Group transform={transform}>

                    {/* ── Faction-colored country shapes ───────────────────── */}
                    <Group>
                        <Shadow dx={0} dy={8} blur={10} color="rgba(0,0,0,0.8)" />
                        {regionSkiaPaths.map(entry => {
                            if (!entry.skiPath) return null;
                            const gameRegion = regions[entry.id];
                            const liveFaction = gameRegion?.faction;
                            const fillColor = liveFaction && FD[liveFaction]
                                ? getFactionFill(liveFaction)
                                : entry.fill;
                            const strokeColor = liveFaction && FD[liveFaction]
                                ? FD[liveFaction].color
                                : entry.stroke;
                            return (
                                <Group key={`map-${entry.id}`}>
                                    <Path path={entry.skiPath} color={fillColor} />
                                    <Path path={entry.skiPath} color={strokeColor} style="stroke" strokeWidth={0.4} />
                                </Group>
                            );
                        })}
                    </Group>

                    {/* ── Adjacency lines ──────────────────────────────────── */}
                    {connections.map(line => {
                        const p = createCurvedPath(line.x1, line.y1, line.x2, line.y2);
                        return (
                            <Path
                                key={line.id}
                                path={p}
                                color="#e74c3c"
                                style="stroke"
                                strokeWidth={1.5}
                            >
                                <DashPathEffect intervals={[4, 4]} />
                                <LinearGradient
                                    start={vec(line.x1, line.y1)}
                                    end={vec(line.x2, line.y2)}
                                    colors={["rgba(255, 100, 100, 0.2)", "rgba(255, 150, 150, 0.8)", "rgba(255, 100, 100, 0.2)"]}
                                />
                            </Path>
                        );
                    })}

                    {/* ── Region hex nodes ─────────────────────────────────── */}
                    {REGIONS.map(r => {
                        const rs = regions[r.id];
                        const faction = rs?.faction || 'NEUTRAL';
                        const color = FD[faction]?.color || '#2a3d50';
                        const isSel = selectedRegionId === r.id;

                        let isTarget = false;
                        if (selectedRegionId && selectedRegionId !== r.id) {
                            const from = regions[selectedRegionId];
                            if (from?.faction === playerFaction && faction !== playerFaction) {
                                isTarget = (ADJ[selectedRegionId] || []).includes(r.id);
                            }
                        }

                        const cx = projectX(r.x);
                        const cy = projectY(r.y);
                        const hexOut = createHexPath(cx, cy, r.r * 2.6);
                        const hexIn = createHexPath(cx, cy, r.r * 1.8);

                        return (
                            <Group key={r.id}>
                                {isSel && (
                                    <>
                                        <Circle cx={cx} cy={cy} r={r.r * 4.2} color="rgba(255,255,255,0.1)" />
                                        <Path path={hexOut} color="rgba(80,200,255,0.9)" style="stroke" strokeWidth={2} />
                                    </>
                                )}
                                {isTarget && (
                                    <>
                                        <Circle cx={cx} cy={cy} r={r.r * 4.5} color="rgba(255,40,40,0.1)" />
                                        <Path path={hexOut} color="rgba(255,60,60,0.95)" style="stroke" strokeWidth={2} />
                                    </>
                                )}
                                <Path path={hexOut} color="rgba(5,12,22,0.65)" />
                                <Path path={hexOut} color={`${color}88`} style="stroke" strokeWidth={0.8} />
                                <Path path={hexIn} color={getFactionFill(faction)} />
                                <Path path={hexIn} color={color} style="stroke" strokeWidth={1.2} />
                                <Circle cx={cx} cy={cy} r={r.r * 0.55} color={isSel ? '#ffffff' : `${color}cc`} />
                                {r.strategic && (
                                    <Circle cx={cx} cy={cy} r={r.r * 4.8} color="rgba(255,215,0,0.35)" style="stroke" strokeWidth={0.8} />
                                )}

                                {/* Unit Icons rendering */}
                                {rs && (
                                    <Group>
                                        {(rs.armor > 0) && (
                                            <Path path={createTankPath(cx - r.r * 3.5, cy + r.r * 1.5, r.r * 0.25)} color="#bdc3c7" style="fill" />
                                        )}
                                        {(rs.air > 0) && (
                                            <Path path={createJetPath(cx, cy - r.r * 3.8, r.r * 0.25)} color="#3498db" style="fill" />
                                        )}
                                        {(rs.infantry > 0) && (
                                            <Path path={createShipPath(cx + r.r * 3.5, cy + r.r * 1, r.r * 0.25)} color="#7f8c8d" style="fill" />
                                        )}
                                    </Group>
                                )}
                            </Group>
                        );
                    })}

                </Group>
            </Canvas>
        </GestureDetector>
    );
};

function getFactionFill(faction) {
    switch (faction) {
        case 'NATO': return 'rgba(26,74,122,0.82)';
        case 'EAST': return 'rgba(107,21,21,0.82)';
        case 'CHINA': return 'rgba(100,80,0,0.82)';
        default: return 'rgba(20,35,25,0.72)';
    }
}

const styles = StyleSheet.create({
    canvas: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});

export default GameMap;
