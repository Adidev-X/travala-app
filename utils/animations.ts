/**
 * utils/animations.ts — RideShare reusable animation presets.
 * All use React Native Animated API only. No Reanimated.
 *
 * Each helper returns { start, stop, reset } for full lifecycle control.
 */
import { Animated, Easing } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnimControl {
  start: (onFinish?: () => void) => void;
  stop: () => void;
  reset: () => void;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function wrapAnim(
  anim: Animated.CompositeAnimation,
  animValue: Animated.Value,
  resetValue: number,
): AnimControl {
  let compositeRef: Animated.CompositeAnimation | null = null;
  return {
    start(onFinish) {
      compositeRef = anim;
      compositeRef.start(({ finished }) => {
        if (finished && onFinish) onFinish();
      });
    },
    stop() {
      compositeRef?.stop();
    },
    reset() {
      compositeRef?.stop();
      animValue.setValue(resetValue);
    },
  };
}

// ─── fadeIn ───────────────────────────────────────────────────────────────────
/**
 * Animates opacity from 0 → 1.
 * @param animValue  Animated.Value starting at 0
 * @param duration   ms (default 300)
 */
export function fadeIn(animValue: Animated.Value, duration = 300): AnimControl {
  return wrapAnim(
    Animated.timing(animValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }),
    animValue,
    0,
  );
}

// ─── fadeOut ──────────────────────────────────────────────────────────────────
/**
 * Animates opacity from current → 0.
 */
export function fadeOut(animValue: Animated.Value, duration = 200): AnimControl {
  return wrapAnim(
    Animated.timing(animValue, {
      toValue: 0,
      duration,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    }),
    animValue,
    1,
  );
}

// ─── slideInBottom ────────────────────────────────────────────────────────────
/**
 * Slides in from below: translateY 60→0 + opacity 0→1 in parallel.
 * Pass a single Animated.Value; get the translateY and opacity interpolations
 * back from the returned object's `transforms` field.
 *
 * Usage:
 *   const anim = useRef(new Animated.Value(0)).current;
 *   const { start } = slideInBottom(anim);
 *   // In JSX: style={{ opacity: anim, transform:[{ translateY: anim.interpolate(...) }] }}
 */
export function slideInBottom(
  animValue: Animated.Value,
  duration = 350,
): AnimControl & {
  opacity: Animated.AnimatedInterpolation<number>;
  translateY: Animated.AnimatedInterpolation<number>;
} {
  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });
  const ctrl = wrapAnim(
    Animated.timing(animValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }),
    animValue,
    0,
  );
  return { ...ctrl, opacity, translateY };
}

// ─── scaleIn ──────────────────────────────────────────────────────────────────
/**
 * Spring scales from 0.9 → 1.0 (for popover/card appear).
 */
export function scaleIn(animValue: Animated.Value): AnimControl {
  return wrapAnim(
    Animated.spring(animValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }),
    animValue,
    0.9,
  );
}

// ─── pressScale ───────────────────────────────────────────────────────────────
/**
 * Scale down to 0.97 on press-in; call pressScaleOut to release.
 * Returns separate pressIn / pressOut helpers.
 */
export function pressScale(animValue: Animated.Value): {
  pressIn: AnimControl;
  pressOut: AnimControl;
} {
  const pressIn = wrapAnim(
    Animated.spring(animValue, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }),
    animValue,
    1,
  );
  const pressOut = wrapAnim(
    Animated.spring(animValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }),
    animValue,
    0.97,
  );
  return { pressIn, pressOut };
}

// ─── shakeX ───────────────────────────────────────────────────────────────────
/**
 * Horizontal shake for error feedback (OTP wrong code, invalid input).
 * Provide a translateX Animated.Value reset to 0.
 */
export function shakeX(animValue: Animated.Value): AnimControl {
  const dur = 60;
  const seq = Animated.sequence([
    Animated.timing(animValue, { toValue: 10,  duration: dur, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: -10, duration: dur, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: 8,   duration: dur, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: -8,  duration: dur, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: 4,   duration: dur, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: 0,   duration: dur, useNativeDriver: true }),
  ]);
  return wrapAnim(seq, animValue, 0);
}

// ─── pulse ────────────────────────────────────────────────────────────────────
/**
 * Infinite scale pulse: 1.0 → 1.06 → 1.0 (for SOS button, attention states).
 * Call stop() + reset() to end the loop.
 */
export function pulse(animValue: Animated.Value, scale = 1.06): AnimControl {
  let loop: Animated.CompositeAnimation | null = null;
  return {
    start() {
      animValue.setValue(1);
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, { toValue: scale, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(animValue, { toValue: 1,     duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ]),
      );
      loop.start();
    },
    stop() {
      loop?.stop();
    },
    reset() {
      loop?.stop();
      animValue.setValue(1);
    },
  };
}

// ─── bookmarkBounce ───────────────────────────────────────────────────────────
/**
 * Bookmark/heart save animation: scale 1 → 1.3 → 0.9 → 1.0 spring bounce.
 */
export function bookmarkBounce(animValue: Animated.Value): AnimControl {
  const seq = Animated.sequence([
    Animated.spring(animValue, {
      toValue: 1.3,
      useNativeDriver: true,
      tension: 400,
      friction: 6,
    }),
    Animated.spring(animValue, {
      toValue: 1.0,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }),
  ]);
  return wrapAnim(seq, animValue, 1);
}

// ─── flashGreen ───────────────────────────────────────────────────────────────
/**
 * Green flash: opacity from 0 → 1 → 0 (for "accepted" feedback on cards).
 * Overlay a View with bg=COLORS.successLight and animate its opacity.
 */
export function flashGreen(animValue: Animated.Value, holdMs = 300): AnimControl {
  const seq = Animated.sequence([
    Animated.timing(animValue, { toValue: 1, duration: 150, useNativeDriver: true }),
    Animated.delay(holdMs),
    Animated.timing(animValue, { toValue: 0, duration: 300, useNativeDriver: true }),
  ]);
  return wrapAnim(seq, animValue, 0);
}

// ─── tabPop ───────────────────────────────────────────────────────────────────
/**
 * Tab icon press pop: scale 0.85 → 1.08 → 1.0 (for tab bar press feedback).
 */
export function tabPop(animValue: Animated.Value): AnimControl {
  const seq = Animated.sequence([
    Animated.spring(animValue, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }),
    Animated.spring(animValue, {
      toValue: 1.08,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }),
    Animated.spring(animValue, {
      toValue: 1.0,
      useNativeDriver: true,
      speed: 40,
      bounciness: 2,
    }),
  ]);
  return wrapAnim(seq, animValue, 1);
}

// ─── postButtonPop ────────────────────────────────────────────────────────────
/**
 * FAB/POST button press: scale 0.92 → 1.08 → 1.0 spring.
 */
export function postButtonPop(animValue: Animated.Value): AnimControl {
  const seq = Animated.sequence([
    Animated.spring(animValue, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }),
    Animated.spring(animValue, {
      toValue: 1.08,
      useNativeDriver: true,
      speed: 30,
      bounciness: 10,
    }),
    Animated.spring(animValue, {
      toValue: 1.0,
      useNativeDriver: true,
      speed: 40,
      bounciness: 2,
    }),
  ]);
  return wrapAnim(seq, animValue, 1);
}
