import React, { useMemo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Canvas, Circle, Line, Group, vec, Rect, SweepGradient, Path, Skia, LinearGradient } from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    useDerivedValue
} from 'react-native-reanimated';
import { REGIONS, ADJ, FD } from '../data/mapData';
import { WORLD_SVG_PATH } from '../data/worldSvgStr';
import useGameStore from '../store/useGameStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Coordinate projection constants
const MAP_BASE_WIDTH = 140;
const MAP_BASE_HEIGHT = 100;

const GameMap = () => {
    const { regions, playerFaction, selectRegion, selectedRegionId } = useGameStore();

    // Map Transformation State
    // Center the map vertically based on roughly half the estimated available height diff
    const mapRenderedHeight = MAP_BASE_HEIGHT * (SCREEN_WIDTH / MAP_BASE_WIDTH);
    const estCanvasHeight = SCREEN_HEIGHT * 0.7;
    const initialYOffset = Math.max(0, (estCanvasHeight - mapRenderedHeight) / 2);

    const scale = useSharedValue(1.2);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(initialYOffset);

    const savedScale = useSharedValue(1.2);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(initialYOffset);

    // Project coordinates to base space (pre-transformation) with uniform scaling
    const mapScale = SCREEN_WIDTH / MAP_BASE_WIDTH;
    const projectX = (x) => x * mapScale;
    const projectY = (y) => y * mapScale;

    // Derived carefully to prevent scaling to 0 which causes Skia crash
    const transform = useDerivedValue(() => {
        // Safe limits to prevent matrix infinity/NaN
        const safeScale = Math.max(0.2, Math.min(scale.value, 6));
        return [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: safeScale }
        ];
    });

    // Gestures
    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            // Clamp horizontal panning to roughly one screen width out of bounds
            const rawX = savedTranslateX.value + e.translationX;
            translateX.value = Math.max(-SCREEN_WIDTH * 2, Math.min(rawX, SCREEN_WIDTH * 2));

            // Clamp vertical panning
            const rawY = savedTranslateY.value + e.translationY;
            translateY.value = Math.max(-SCREEN_HEIGHT * 2, Math.min(rawY, SCREEN_HEIGHT * 2));
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const tapGesture = Gesture.Tap().onEnd((event) => {
        const { x, y } = event;

        // Reverse transform tap coordinates to find local map coordinates
        // Current transform: Matrix * Point
        // To get untransformed point: Matrix^-1 * transformedPoint
        const localX = (x - translateX.value) / scale.value;
        const localY = (y - translateY.value) / scale.value;

        let closestRegion = null;
        let minDistance = 30;

        REGIONS.forEach(r => {
            const px = projectX(r.x);
            const py = projectY(r.y);
            const dist = Math.sqrt(Math.pow(localX - px, 2) + Math.pow(localY - py, 2));

            if (dist < minDistance) {
                minDistance = dist;
                closestRegion = r.id;
            }
        });

        if (closestRegion) {
            selectRegion(closestRegion);
        }
    });

    const composed = Gesture.Simultaneous(pinchGesture, panGesture, tapGesture);

    // Memoize connections
    const connections = useMemo(() => {
        const lines = [];
        const seen = new Set();
        REGIONS.forEach(r => {
            (ADJ[r.id] || []).forEach(adjId => {
                const pairId = [r.id, adjId].sort().join('-');
                if (!seen.has(pairId)) {
                    const target = REGIONS.find(tr => tr.id === adjId);
                    if (target) {
                        lines.push({ x1: projectX(r.x), y1: projectY(r.y), x2: projectX(target.x), y2: projectY(target.y), id: pairId });
                        seen.add(pairId);
                    }
                }
            });
        });
        return lines;
    }, []);

    // A detailed D3 projection path of the Earth's continents.
    // Ensure we MEMOIZE THIS because compiling a 137KB string to a Skia path every frame WILL CRASH React Native!
    const bgPath = useMemo(() => {
        try {
            return Skia.Path.MakeFromSVGString(WORLD_SVG_PATH) || Skia.Path.Make();
        } catch (e) {
            console.error("Failed to parse map SVG", e);
            return Skia.Path.Make();
        }
    }, []);

    // Helper to generate a slight curve path for the connections
    const createCurvedPath = (x1, y1, x2, y2) => {
        const path = Skia.Path.Make();
        path.moveTo(x1, y1);
        // Create a slight arc by offsetting the control point
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2 - 15; // Arc upward slightly
        path.quadTo(cx, cy, x2, y2);
        return path;
    };

    return (
        <GestureDetector gesture={composed}>
            <Canvas style={styles.canvas}>
                {/* Oceanic Background Gradient */}
                <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(0, SCREEN_HEIGHT)}
                        colors={['#09121d', '#142031', '#050a12']}
                    />
                </Rect>

                <Group transform={transform}>
                    {/* SVG Landmass Background */}
                    {bgPath && (
                        <Path
                            path={bgPath}
                            color="#182c44" // Deep oceanic/land blue from reference image
                            transform={[{ scale: mapScale * 1.05 }, { translateX: -5 }, { translateY: -10 }]}
                        />
                    )}

                    {/* Adjacency Lines */}
                    <Group>
                        {connections.map(line => {
                            const path = createCurvedPath(line.x1, line.y1, line.x2, line.y2);
                            return (
                                <Path
                                    key={line.id}
                                    path={path}
                                    color="rgba(70, 130, 180, 0.25)"
                                    style="stroke"
                                    strokeWidth={1.5}
                                >
                                    <LinearGradient
                                        start={vec(line.x1, line.y1)}
                                        end={vec(line.x2, line.y2)}
                                        colors={["rgba(58, 158, 255, 0.1)", "rgba(58, 158, 255, 0.4)", "rgba(58, 158, 255, 0.1)"]}
                                    />
                                </Path>
                            );
                        })}
                    </Group>

                    {/* Regions */}
                    {REGIONS.map(r => {
                        const regionState = regions[r.id];
                        const faction = regionState?.faction || 'NEUTRAL';
                        const factionColor = FD[faction]?.color || '#333';
                        const isSelected = selectedRegionId === r.id;

                        let isTarget = false;
                        if (selectedRegionId && selectedRegionId !== r.id) {
                            const from = regions[selectedRegionId];
                            if (from?.faction === playerFaction && faction !== playerFaction) {
                                isTarget = (ADJ[selectedRegionId] || []).includes(r.id);
                            }
                        }

                        return (
                            <Group key={r.id}>
                                {/* Node Visuals */}
                                {isSelected ? (
                                    <>
                                        <Circle cx={projectX(r.x)} cy={projectY(r.y)} r={r.r * 2.5} color="rgba(255, 255, 255, 0.4)" style="stroke" strokeWidth={1} />
                                        <Circle cx={projectX(r.x)} cy={projectY(r.y)} r={r.r * 2.8} color="rgba(58, 158, 255, 0.3)" />
                                    </>
                                ) : null}

                                {isTarget && (
                                    <Circle cx={projectX(r.x)} cy={projectY(r.y)} r={r.r * 3.5} color="rgba(255, 50, 50, 0.6)" style="stroke" strokeWidth={2} />
                                )}

                                {/* Outer Metallic Frame (Sci-Fi Hex/Square hybrid look) */}
                                <Rect
                                    x={projectX(r.x) - r.r * 1.8}
                                    y={projectY(r.y) - r.r * 1.8}
                                    width={r.r * 3.6}
                                    height={r.r * 3.6}
                                    color="rgba(150, 160, 175, 0.5)"
                                    style="stroke"
                                    strokeWidth={1}
                                    r={3} // Slight border radius
                                />

                                <Rect
                                    x={projectX(r.x) - r.r * 2.2}
                                    y={projectY(r.y) - r.r * 2.2}
                                    width={r.r * 4.4}
                                    height={r.r * 4.4}
                                    color="rgba(100, 110, 130, 0.3)"
                                    style="stroke"
                                    strokeWidth={0.5}
                                />

                                {/* Inner Faction Core */}
                                <Circle cx={projectX(r.x)} cy={projectY(r.y)} r={r.r * 1.5} color={factionColor} />

                                {/* Center Dot */}
                                <Circle cx={projectX(r.x)} cy={projectY(r.y)} r={r.r * 0.4} color="#fff" />

                                {r.strategic && (
                                    <Circle cx={projectX(r.x)} cy={projectY(r.y)} r={r.r * 2.5} color="#ffd700" style="stroke" strokeWidth={1} />
                                )}
                            </Group>
                        );
                    })}
                </Group>
            </Canvas>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    canvas: {
        flex: 1,
        backgroundColor: '#050a12',
    },
});

export default GameMap;
