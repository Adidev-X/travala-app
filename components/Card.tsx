import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import React, { memo } from 'react';
import {
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

export interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const AppCard = memo(function AppCard({ children, onPress, style }: AppCardProps) {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
});

export default AppCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
});
