import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenWrapper({ children, style }: ScreenWrapperProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff8f7' }} edges={['top']}>
      <View style={[{ flex: 1 }, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
