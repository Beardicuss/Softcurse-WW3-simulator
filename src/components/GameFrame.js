import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

// GameFrame: tactical border overlay
// Replaced Skia Canvas with plain Views — saves one full GPU canvas allocation
function GameFrame() {
  return (
    <View style={styles.frame} pointerEvents="none">
      {/* Corner accent bars */}
      <View style={styles.top} />
      <View style={styles.bottom} />
      <View style={styles.left} />
      <View style={styles.right} />
      {/* Red side indicators */}
      <View style={styles.leftAccent} />
      <View style={styles.rightAccent} />
      {/* Bottom fade handled by bottom bar */}
    </View>
  );
}

const B = 10;
const styles = StyleSheet.create({
  frame: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  top:          { position: 'absolute', top: 0,    left: 0, right: 0,    height: B,  backgroundColor: '#1a252f' },
  bottom:       { position: 'absolute', bottom: 0, left: 0, right: 0,    height: B,  backgroundColor: '#1a252f' },
  left:         { position: 'absolute', top: 0,    left: 0, bottom: 0,   width: B,   backgroundColor: '#1a252f' },
  right:        { position: 'absolute', top: 0,    right: 0, bottom: 0,  width: B,   backgroundColor: '#1a252f' },
  leftAccent:   { position: 'absolute', top: '44%', left: 0,             width: B,   height: 44, backgroundColor: '#e74c3c' },
  rightAccent:  { position: 'absolute', top: '44%', right: 0,            width: B,   height: 44, backgroundColor: '#e74c3c' },
});

export default memo(GameFrame);
