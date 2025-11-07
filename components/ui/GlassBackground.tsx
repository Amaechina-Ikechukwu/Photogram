
import { BlurView } from 'expo-blur';
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

type GlassBackgroundProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function GlassBackground({ children, style }: GlassBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
