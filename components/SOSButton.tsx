/**
 * SOSButton — Animated pulsing red circle.
 * Uses React Native's Animated API only (no Reanimated).
 * Two concentric rings pulse outward continuously via Animated.loop.
 */
import colors from '@/constants/colors';
import { fontSize, fontWeight } from '@/constants/typography';
import React, { memo, useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SOSButtonProps {
  onPress: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CORE_SIZE  = 120; // main button diameter
const RING_SIZE  = CORE_SIZE + 40; // first ring
const RING2_SIZE = CORE_SIZE + 80; // second ring

// ─── Component ────────────────────────────────────────────────────────────────

function SOSButton({ onPress }: SOSButtonProps) {
  const pulseAnim  = useRef(new Animated.Value(0)).current;
  const pulse2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger the two rings so ring2 starts mid-cycle
    const ring1 = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    );

    const ring2 = Animated.loop(
      Animated.sequence([
        Animated.delay(750),
        Animated.timing(pulse2Anim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        // Reset without animation so loop can restart cleanly
        Animated.timing(pulse2Anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    ring1.start();
    ring2.start();

    return () => {
      ring1.stop();
      ring2.stop();
    };
  }, [pulse2Anim, pulseAnim]);

  // ring scale: 0.8 → 1 (ring expands from core size outward)
  const ring1Scale = pulseAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0.8, 1],
  });
  const ring1Opacity = pulseAnim.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: [0.6, 0.25, 0],
  });

  const ring2Scale = pulse2Anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0.8, 1],
  });
  const ring2Opacity = pulse2Anim.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: [0.4, 0.15, 0],
  });

  return (
    <Animated.View style={styles.wrapper}>
      {/* Outer pulse ring 2 */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: RING2_SIZE,
            height: RING2_SIZE,
            borderRadius: RING2_SIZE / 2,
            transform: [{ scale: ring2Scale }],
            opacity: ring2Opacity,
          },
        ]}
      />
      {/* Inner pulse ring 1 */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            transform: [{ scale: ring1Scale }],
            opacity: ring1Opacity,
          },
        ]}
      />
      {/* Core button */}
      <TouchableOpacity
        style={styles.core}
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityLabel="SOS emergency button"
        accessibilityRole="button">
        <Text style={styles.label}>SOS</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    width:  RING2_SIZE,
    height: RING2_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    backgroundColor: colors.danger,
  },
  core: {
    width:  CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  label: {
    fontSize:   fontSize.xxl,
    fontWeight: fontWeight.extraBold,
    color:      colors.white,
    letterSpacing: 3,
  },
});

export default memo(SOSButton);
