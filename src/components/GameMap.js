import React, { useMemo, memo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
    Canvas, Circle, Path, Group, Rect, vec,
    LinearGradient, Skia, Paint,
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
    // Selective subscriptions — only re-render when these specific fields change
    // Split regions subscription to minimize redraws:
    // factionMap: faction per region (changes on capture) — drives color rendering
    // regions: full object needed for unit counts + adjacency in isTarget check
    const regions = useGameStore(s => s.regions);
    const playerFaction   = useGameStore(s => s.playerFaction);
    const selectRegion    = useGameStore(s => s.selectRegion);
    const selectedRegionId = useGameStore(s => s.selectedRegionId);

    // ── Low-end device detection (Redmi Note 8 = ~2GB RAM, Snapdragon 665) ───
    const isLowEnd = React.useMemo(() => {
        const { width: W2, height: H2 } = require('react-native').Dimensions.get('window');
        // Heuristic: low DPI or small screen = low-end
        return W2 * H2 < 1280 * 720;
    }, []);

    const visibleRegionsArr = useGameStore(s => s.visibleRegions);
    // Convert array → Set once per change; Set gives O(1) .has() in the render loop
    const visibleRegions = useMemo(
        () => new Set(visibleRegionsArr || []),
        [visibleRegionsArr]
    );

    // Memoized faction fill colors — recomputed only when regions change
    // Faction fingerprint: string that only changes when a capture occurs (not unit movement)
    const factionFingerprint = useMemo(() => {
        if (!regions) return '';
        const keys = Object.keys(regions);
        let fp = '';
        for (let i = 0; i < keys.length; i++) {
            fp += regions[keys[i]].faction[0]; // first char only — fast
        }
        return fp;
    }, [regions]);

    const regionFactionColors = useMemo(() => {
        const out = {};
        Object.entries(regions || {}).forEach(([id, r]) => {
            out[id] = getFactionFill(r.faction);
        });
        return out;
    }, [regions]);

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

        // PRIMARY: SVG shape hit-test — tap directly on territory fill
        let hit = null;
        for (const entry of regionSkiaPaths) {
            if (!entry.skiPath) continue;
            if (entry.skiPath.contains(lx, ly)) {
                hit = entry.id;
                break;
            }
        }

        // FALLBACK: hex node proximity (for small islands / tiny regions)
        if (!hit) {
            let minDist = 28;
            REGIONS.forEach(r => {
                const d = Math.hypot(lx - projectX(r.x), ly - projectY(r.y));
                if (d < minDist) { minDist = d; hit = r.id; }
            });
        }

        if (hit && (!visibleRegions.size || visibleRegions.has(hit))) {
            selectRegion(hit);
        }
    });

    const composed = Gesture.Simultaneous(pinchGesture, panGesture, tapGesture);

    // Adjacency lines — memoised
    // Pre-compute attackable targets as a Set — O(1) lookup in render loop
    const attackableTargets = useMemo(() => {
        if (!selectedRegionId || !regions) return new Set();
        const from = regions[selectedRegionId];
        if (!from || from.faction !== playerFaction) return new Set();
        const targets = new Set();
        (ADJ[selectedRegionId] || []).forEach(n => {
            if (regions[n]?.faction !== playerFaction) targets.add(n);
        });
        return targets;
    }, [selectedRegionId, regions, playerFaction]);

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

    // ── All Skia paths are memoised so they are built ONCE, not every render ──

    // Adjacency curved paths — built once alongside connections
    const connectionPaths = useMemo(() => {
        return connections.map(line => {
            const p = Skia.Path.Make();
            p.moveTo(line.x1, line.y1);
            p.quadTo((line.x1 + line.x2) / 2, (line.y1 + line.y2) / 2 - 12, line.x2, line.y2);
            return { ...line, skiPath: p };
        });
    }, [connections]);

    // Helper — not called during render, only inside other useMemos
    const _makeHex = (cx, cy, radius) => {
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

    // Static hex geometry for every region — built once
    const regionGeometry = useMemo(() => {
        return REGIONS.reduce((acc, r) => {
            const cx = projectX(r.x);
            const cy = projectY(r.y);
            acc[r.id] = {
                cx, cy,
                hexOut: _makeHex(cx, cy, r.r * 2.6),
                hexIn:  _makeHex(cx, cy, r.r * 1.8),
                hexOutSel:    _makeHex(cx, cy, r.r * 2.6), // same path, reused
                hexOutTarget: _makeHex(cx, cy, r.r * 2.6),
                rDot: r.r * 0.55,
                rPulse: r.r * 4.2,
                rTarget: r.r * 4.5,
                rStrategic: r.r * 4.8,
                strategic: r.strategic,
                // Unit icon offsets
                tankOffset:  { x: cx - r.r * 3.5, y: cy + r.r * 1.5, s: r.r * 0.25 },
                jetOffset:   { x: cx,              y: cy - r.r * 3.8, s: r.r * 0.25 },
                shipOffset:  { x: cx + r.r * 3.5,  y: cy + r.r * 1.0, s: r.r * 0.25 },
            };
            return acc;
        }, {});
    }, []);

    // Unit icon paths — built once per region using fixed offsets
    const unitPaths = useMemo(() => {
        const out = {};
        REGIONS.forEach(r => {
            const g = regionGeometry[r.id];

            const makeTank = (cx, cy, sc) => {
                const path = Skia.Path.Make();
                const s = sc * 1.5;
                path.moveTo(cx - 3*s, cy + s);   path.lineTo(cx + 3*s, cy + s);
                path.lineTo(cx + 2*s, cy - s);   path.lineTo(cx - 2*s, cy - s);
                path.close();
                path.moveTo(cx - s, cy - s);      path.lineTo(cx + s, cy - s);
                path.lineTo(cx + s, cy - 2*s);   path.lineTo(cx - s, cy - 2*s);
                path.close();
                path.moveTo(cx + s, cy - 1.5*s); path.lineTo(cx + 4*s, cy - 1.5*s);
                return path;
            };
            const makeJet = (cx, cy, sc) => {
                const path = Skia.Path.Make();
                const s = sc * 1.5;
                path.moveTo(cx, cy - 3*s);
                path.lineTo(cx + s, cy - s);     path.lineTo(cx + 3*s, cy + s);
                path.lineTo(cx + s, cy + s);     path.lineTo(cx + s, cy + 3*s);
                path.lineTo(cx, cy + 2*s);       path.lineTo(cx - s, cy + 3*s);
                path.lineTo(cx - s, cy + s);     path.lineTo(cx - 3*s, cy + s);
                path.lineTo(cx - s, cy - s);     path.close();
                return path;
            };
            const makeShip = (cx, cy, sc) => {
                const path = Skia.Path.Make();
                const s = sc * 1.5;
                path.moveTo(cx - 4*s, cy - s);  path.lineTo(cx + 3*s, cy - s);
                path.lineTo(cx + 4*s, cy + s);  path.lineTo(cx - 3*s, cy + s);
                path.close();
                path.moveTo(cx - s, cy - s);    path.lineTo(cx + s, cy - s);
                path.lineTo(cx + s, cy - 3*s); path.lineTo(cx - s, cy - 3*s);
                path.close();
                return path;
            };

            out[r.id] = {
                tank: makeTank(g.tankOffset.x, g.tankOffset.y, g.tankOffset.s),
                jet:  makeJet(g.jetOffset.x,  g.jetOffset.y,  g.jetOffset.s),
                ship: makeShip(g.shipOffset.x, g.shipOffset.y, g.shipOffset.s),
            };
        });
        return out;
    }, []);

    return (
        <GestureDetector gesture={composed}>
            <Canvas style={styles.canvas}>

                {/* Ocean background */}
                <Rect x={0} y={0} width={SCREEN_WIDTH * 3} height={SCREEN_HEIGHT * 3}>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(SCREEN_WIDTH * 3, SCREEN_HEIGHT * 3)}
                        colors={['#0d1f35', '#071220', '#0f1a2e']}
                    />
                </Rect>

                <Group transform={transform}>

                    {/* ── Faction-colored country shapes ───────────────────── */}
                    <Group>
                        {regionSkiaPaths.map(entry => {
                            if (!entry.skiPath) return null;
                            const isVisible = !visibleRegions?.size || visibleRegions.has(entry.id);
                            const gameRegion = regions[entry.id];
                            const liveFaction = gameRegion?.faction;
                            const isSel = selectedRegionId === entry.id;
                            const isTarget = !isSel && attackableTargets.has(entry.id);

                            if (!isVisible) {
                                return (
                                    <Group key={`map-${entry.id}`}>
                                        {/* Dark fog fill */}
                                        <Path path={entry.skiPath} color="rgba(4,8,14,0.94)" />
                                        {/* Subtle fog border */}
                                        <Path path={entry.skiPath} color="rgba(20,35,55,0.6)"
                                            style="stroke" strokeWidth={0.5} />
                                    </Group>
                                );
                            }

                            const fillColor = liveFaction && FD[liveFaction]
                                ? getFactionFill(liveFaction) : entry.fill;
                            const factionColor = liveFaction && FD[liveFaction]
                                ? FD[liveFaction].color : entry.stroke;

                            return (
                                <Group key={`map-${entry.id}`}>
                                    {/* Glow halo behind selected / target territories */}
                                    {isSel && (
                                        <Path path={entry.skiPath}
                                            color="rgba(80,200,255,0.22)" />
                                    )}
                                    {isTarget && (
                                        <Path path={entry.skiPath}
                                            color="rgba(255,50,50,0.18)" />
                                    )}
                                    {/* Territory fill */}
                                    <Path path={entry.skiPath} color={fillColor} />
                                    {/* Border — thicker + brighter when selected */}
                                    <Path path={entry.skiPath}
                                        color={isSel ? 'rgba(100,220,255,0.95)'
                                            : isTarget ? 'rgba(255,80,80,0.90)'
                                            : factionColor}
                                        style="stroke"
                                        strokeWidth={isSel ? 1.2 : isTarget ? 1.0 : 0.4} />
                                    {/* Strategic territory golden ring on border */}
                                    {REGIONS.find(r => r.id === entry.id)?.strategic && (
                                        <Path path={entry.skiPath}
                                            color="rgba(255,215,0,0.25)"
                                            style="stroke"
                                            strokeWidth={2.5} />
                                    )}
                                </Group>
                            );
                        })}
                    </Group>

                    {/* ── Adjacency lines ──────────────────────────────────── */}
                    {connectionPaths.map(line => (
                        <Path
                            key={line.id}
                            path={line.skiPath}
                            color="rgba(231,76,60,0.5)"
                            style="stroke"
                            strokeWidth={1}
                        />
                    ))}

                    {/* ── Region hex nodes ─────────────────────────────────── */}
                    {REGIONS.map(r => {
                        const rs = regions[r.id];
                        const faction = rs?.faction || 'NEUTRAL';
                        const color = FD[faction]?.color || '#2a3d50';
                        const isSel = selectedRegionId === r.id;
                        const g = regionGeometry[r.id];
                        const up = unitPaths[r.id];
                        const isVisible = !visibleRegions.size || visibleRegions.has(r.id);

                        let isTarget = false;
                        if (selectedRegionId && selectedRegionId !== r.id) {
                            const from = regions[selectedRegionId];
                            if (from?.faction === playerFaction && faction !== playerFaction && isVisible) {
                                isTarget = (ADJ[selectedRegionId] || []).includes(r.id);
                            }
                        }

                        // FOG OF WAR: dark hex (+ ? indicator on high-end only)
                        if (!isVisible) {
                            const qr = r.r * 1.8;
                            return (
                                <Group key={r.id}>
                                    {/* Hex shell */}
                                    <Path path={g.hexOut} color="rgba(4,8,14,0.88)" />
                                    <Path path={g.hexOut} color="rgba(15,28,45,0.7)"
                                        style="stroke" strokeWidth={0.6} />
                                    <Path path={g.hexIn} color="rgba(6,10,18,0.80)" />
                                    {/* ? indicator — only on high-end devices */}
                                    {!isLowEnd && <>
                                        <Circle cx={g.cx} cy={g.cy - qr * 0.15}
                                            r={qr * 0.55}
                                            color="rgba(40,80,110,0.55)"
                                            style="stroke" strokeWidth={qr * 0.18} />
                                        <Circle cx={g.cx} cy={g.cy + qr * 0.55}
                                            r={qr * 0.14}
                                            color="rgba(40,80,110,0.55)" />
                                    </>}
                                </Group>
                            );
                        }

                        return (
                            <Group key={r.id}>
                                {/* Pulse ring on selected node */}
                                {isSel && (
                                    <Circle cx={g.cx} cy={g.cy} r={g.rPulse} color="rgba(100,220,255,0.12)" />
                                )}
                                {/* Target ring on attackable node */}
                                {isTarget && (
                                    <Circle cx={g.cx} cy={g.cy} r={g.rTarget} color="rgba(255,40,40,0.12)" />
                                )}
                                <Path path={g.hexOut} color="rgba(5,12,22,0.55)" />
                                <Path path={g.hexOut} color={isSel ? 'rgba(100,220,255,0.7)' : isTarget ? 'rgba(255,80,80,0.7)' : `${color}66`} style="stroke" strokeWidth={isSel || isTarget ? 1.2 : 0.6} />
                                <Path path={g.hexIn} color={getFactionFill(faction)} />
                                <Path path={g.hexIn} color={color} style="stroke" strokeWidth={1.0} />
                                <Circle cx={g.cx} cy={g.cy} r={g.rDot} color={isSel ? '#ffffff' : `${color}cc`} />
                                {r.strategic && (
                                    <Circle cx={g.cx} cy={g.cy} r={g.rStrategic} color="rgba(255,215,0,0.35)" style="stroke" strokeWidth={0.8} />
                                )}
                                {rs && !isLowEnd && (
                                    <Group>
                                        {rs.armor > 0 && <Path path={up.tank} color="#bdc3c7" style="fill" />}
                                        {rs.air   > 0 && <Path path={up.jet}  color="#3498db" style="fill" />}
                                        {rs.infantry > 0 && <Path path={up.ship} color="#7f8c8d" style="fill" />}
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
        case 'NATO':  return 'rgba(26,74,122,0.82)';
        case 'EAST':  return 'rgba(107,21,21,0.82)';
        case 'CHINA': return 'rgba(100,80,0,0.82)';
        case 'INDIA': return 'rgba(30,100,60,0.82)';
        case 'LATAM': return 'rgba(120,50,120,0.82)';
        default:      return 'rgba(20,35,25,0.72)';
    }
}

const styles = StyleSheet.create({
    canvas: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});

export default memo(GameMap);
