import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from '../constants/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Component ────────────────────────────────────────────────────────────────

const SkeletonLoader = React.memo<SkeletonLoaderProps>(
  ({ width = '100%', height = 16, borderRadius = 8, style }) => {
    const shimmerAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

    useEffect(() => {
      const loop = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: SCREEN_WIDTH,
          duration: 1200,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }, [shimmerAnim]);

    return (
      <View
        style={[
          styles.base,
          { width: width as number, height, borderRadius },
          style,
        ]}
      >
        {/* Shimmer strip */}
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerAnim }] },
          ]}
        />
      </View>
    );
  }
);

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.shimmer,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    // Soft feathered edges simulated via opacity gradient trick:
    // We taper with opacity since LinearGradient requires an external dep.
    opacity: 0.85,
    borderRadius: 4,
  },
});
