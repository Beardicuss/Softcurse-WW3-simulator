import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Canvas, Rect, Path, Skia, LinearGradient, vec, Group
} from '@shopify/react-native-skia';

export default function GameFrame({ activeTab = 0 }) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  const B = 10;
  const RESOURCE_H = 42;
  const TITLE_H = 24;
  const BOT_H = 40; // Kept as it's not explicitly removed and might be used for layout calculations
  const TAB_W = 84;
  const TAB_H_ACT = 24;
  const TAB_H_INACT = 18;
  const TAB_GAP = 4;

  const W = size.w;
  const H = size.h;

  if (W === 0 || H === 0) {
    return (
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200 }}
        pointerEvents="none"
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      />
    );
  }

  const TABS_Y = H - B - BOT_H;
  const TOTAL_W = TAB_W * 4 + TAB_GAP * 3;
  const TABS_X = (W - TOTAL_W) / 2;

  // Inverted trapezoid (wide top, narrow bottom) for hanging title
  const titleTrap = (x, y, w, h) => {
    const inset = w * 0.08;
    const p = Skia.Path.Make();
    p.moveTo(x, y);
    p.lineTo(x + w, y);
    p.lineTo(x + w - inset, y + h);
    p.lineTo(x + inset, y + h);
    p.close();
    return p;
  };

  // Normal trapezoid (narrow top, wide bottom) for bottom tabs
  const trapPath = (x, y, w, h) => {
    const inset = w * 0.15;
    const p = Skia.Path.Make();
    p.moveTo(x + inset, y);
    p.lineTo(x + w - inset, y);
    p.lineTo(x + w, y + h);
    p.lineTo(x, y + h);
    p.close();
    return p;
  };

  const titleW = 280;
  const titleX = (W - titleW) / 2;
  const titleY = B + RESOURCE_H;

  const tabs = [
    { active: activeTab === 0 },
    { active: activeTab === 1 },
    { active: activeTab === 2 },
    { active: activeTab === 3 },
    { active: activeTab === 4 },
  ];

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200 }}
      pointerEvents="none"
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      <Canvas style={{ flex: 1 }}>
        {/* OUTER STEEL BORDER */}
        <Rect x={0} y={0} width={W} height={B} color="#1a252f" />
        <Rect x={0} y={H - B} width={W} height={B} color="#1a252f" />
        <Rect x={0} y={0} width={B} height={H} color="#1a252f" />
        <Rect x={W - B} y={0} width={B} height={H} color="#1a252f" />

        {/* RED ACCENT LEFT */}
        <Rect x={0} y={H * 0.44} width={B} height={44} color="#e74c3c" />
        <Rect x={B} y={H * 0.43} width={4} height={52} color="rgba(231,76,60,0.3)" />

        {/* RED ACCENT RIGHT */}
        <Rect x={W - B} y={H * 0.44} width={B} height={44} color="#e74c3c" />
        <Rect x={W - B - 4} y={H * 0.43} width={4} height={52} color="rgba(231,76,60,0.3)" />



        {/* TRAPEZOID TABS */}
        {tabs.map((tab, i) => {
          const tx = TABS_X + i * (TAB_W + TAB_GAP);
          const th = tab.active ? TAB_H_ACT : TAB_H_INACT;
          const ty = H - B - th; // align bottom flush with the inner edge of border
          const path = trapPath(tx, ty, TAB_W, th);
          return (
            <Group key={i}>
              <Path path={path}>
                {tab.active ? (
                  <LinearGradient
                    start={vec(tx, ty)}
                    end={vec(tx, ty + th)}
                    colors={['#1d2d3d', '#2980b9']}
                  />
                ) : (
                  <LinearGradient
                    start={vec(tx, ty)}
                    end={vec(tx, ty + th)}
                    colors={['#0f171e', '#1a252f']}
                  />
                )}
              </Path>
              {tab.active
                ? <Rect x={tx + TAB_W * 0.15} y={ty} width={TAB_W * 0.7} height={2} color="#3498db" />
                : <Rect x={tx + TAB_W * 0.15} y={ty} width={TAB_W * 0.7} height={1} color="#3f515d" />
              }
            </Group>
          );
        })}
      </Canvas>
    </View>
  );
}
