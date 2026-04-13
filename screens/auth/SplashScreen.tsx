/**
 * SplashScreen — RideShare brand entry screen.
 * WHITE bg, geometric logo mark, fade-in animation.
 */
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

// ─── Geometric logo mark ───────────────────────────────────────────────────
// Circle bg (#1A56DB) + two "head" circles + seat bar = rideshare seats icon
const LogoMark = React.memo(function LogoMark() {
  return (
    <View style={logoStyles.plate}>
      {/* Glow ring */}
      <View style={logoStyles.ring} />
      {/* Person A — left seat */}
      <View style={[logoStyles.head, logoStyles.headLeft]} />
      {/* Person B — right seat */}
      <View style={[logoStyles.head, logoStyles.headRight]} />
      {/* Shared seat bar */}
      <View style={logoStyles.seatBar} />
      {/* Window row above seat */}
      <View style={logoStyles.windowRow}>
        <View style={logoStyles.window} />
        <View style={logoStyles.windowGap} />
        <View style={logoStyles.window} />
      </View>
    </View>
  );
});

const logoStyles = StyleSheet.create({
  plate: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...SHADOWS.lg,
  },
  ring: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  head: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    top: 16,
  },
  headLeft:  { left: 16 },
  headRight: { right: 16 },
  seatBar: {
    position: 'absolute',
    bottom: 20,
    width: 56,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  windowRow: {
    position: 'absolute',
    bottom: 34,
    flexDirection: 'row',
    alignItems: 'center',
  },
  window: {
    width: 22,
    height: 16,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  windowGap: { width: 6 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
const SplashScreen = React.memo(function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    // Fade + slide in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after 2s
    const timer = setTimeout(() => {
      router.replace('/(auth)/enter-phone');
    }, 2200);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, router]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <LogoMark />

        <Text style={styles.brand}>RideShare</Text>
        <Text style={styles.tagline}>Share the road. Share the journey.</Text>
      </Animated.View>

      {/* Footer dot */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </Animated.View>
    </View>
  );
});

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.slate900,
    letterSpacing: -0.5,
    marginTop: 24,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.slate400,
    marginTop: 6,
    letterSpacing: 0.1,
  },
  footer: {
    position: 'absolute',
    bottom: 52,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.slate200,
  },
  dotActive: {
    width: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
});
