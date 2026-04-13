import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize } from '@/constants/typography';
import React, { memo } from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay = memo(function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={colors.primary} />
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
});

export default LoadingOverlay;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 140,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
