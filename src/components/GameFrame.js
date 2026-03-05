import React, { useState } from 'react';
import { View } from 'react-native';
import { Canvas, Rect, LinearGradient, vec } from '@shopify/react-native-skia';

export default function GameFrame() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const { w: W, h: H } = size;
  const B = 10;

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200 }}
      pointerEvents="none"
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {W > 0 && H > 0 && (
        <Canvas style={{ flex: 1 }}>
          <Rect x={0} y={0} width={W} height={B} color="#1a252f" />
          <Rect x={0} y={H - B} width={W} height={B} color="#1a252f" />
          <Rect x={0} y={0} width={B} height={H} color="#1a252f" />
          <Rect x={W - B} y={0} width={B} height={H} color="#1a252f" />
          <Rect x={0} y={H * 0.44} width={B} height={44} color="#e74c3c" />
          <Rect x={B} y={H * 0.43} width={4} height={52} color="rgba(231,76,60,0.3)" />
          <Rect x={W - B} y={H * 0.44} width={B} height={44} color="#e74c3c" />
          <Rect x={W - B - 4} y={H * 0.43} width={4} height={52} color="rgba(231,76,60,0.3)" />
          <Rect x={B} y={H - B - 38} width={W - B * 2} height={38}>
            <LinearGradient
              start={vec(0, H - B - 38)}
              end={vec(0, H - B)}
              colors={['rgba(8,16,26,0)', 'rgba(8,16,26,0.97)']}
            />
          </Rect>
        </Canvas>
      )}
    </View>
  );
}
