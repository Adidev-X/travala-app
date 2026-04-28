import React from 'react';
import { Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'ghost';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AppButton({ label, onPress, style, textStyle, variant = 'primary' }: AppButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      style={[
        animatedStyle,
        {
          backgroundColor: variant === 'primary' ? '#ba0014' : 'transparent',
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 16,
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text style={[{ color: '#ffffff', fontWeight: '700', fontSize: 16 }, textStyle]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
