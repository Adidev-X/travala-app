import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import React, { memo } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: boolean;
  backgroundColor?: string;
  keyboardAvoiding?: boolean;
  style?: StyleProp<ViewStyle>;
}

const ScreenWrapper = memo(function ScreenWrapper({
  children,
  scrollable = false,
  padding = true,
  backgroundColor = colors.background,
  keyboardAvoiding = false,
  style,
}: ScreenWrapperProps) {
  const inner = scrollable ? (
    <ScrollView
      contentContainerStyle={[padding && styles.paddedContent]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, padding && styles.padded, style]}>
      {children}
    </View>
  );

  const wrapped = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {inner}
    </KeyboardAvoidingView>
  ) : inner;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />
      {wrapped}
    </SafeAreaView>
  );
});

export default ScreenWrapper;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  fill: { flex: 1 },
  padded: { padding: spacing.md },
  paddedContent: { padding: spacing.md, flexGrow: 1 },
});
