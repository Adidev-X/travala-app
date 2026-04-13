/**
 * components/PageHeader.tsx — Reusable in-page header.
 *
 * Used by screens that opt out of the navigation header (headerShown: false)
 * but still need a consistent header bar with title, back action, and optional actions.
 *
 * Props:
 *   title        — main heading text
 *   subtitle     — optional smaller text below title
 *   showBack     — render 36px circle back button on the left
 *   leftAction   — override left slot with any ReactNode
 *   rightAction  — optional right slot ReactNode
 *   onBack       — callback for back button (defaults to router.back())
 *   noBorder     — suppress bottom 1px divider line
 */
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  noBorder?: boolean;
}

// ─── BackButton helper ────────────────────────────────────────────────────────

interface BackBtnProps { onPress: () => void }
const BackButton = React.memo(function BackButton({ onPress }: BackBtnProps) {
  return (
    <TouchableOpacity
      style={styles.backBtn}
      onPress={onPress}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Ionicons name="chevron-back" size={20} color={COLORS.slate700} />
    </TouchableOpacity>
  );
});

// ─── PageHeader ───────────────────────────────────────────────────────────────

const PageHeader = React.memo(function PageHeader({
  title,
  subtitle,
  showBack = false,
  leftAction,
  rightAction,
  onBack,
  noBorder = false,
}: PageHeaderProps) {
  const router = useRouter();
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }, [onBack, router]);

  return (
    <View style={[styles.container, !noBorder && styles.border]}>
      {/* Left slot */}
      <View style={styles.left}>
        {leftAction !== undefined ? (
          leftAction
        ) : showBack ? (
          <BackButton onPress={handleBack} />
        ) : (
          <View style={styles.leftPlaceholder} />
        )}
      </View>

      {/* Center: title + subtitle */}
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>

      {/* Right slot */}
      <View style={styles.right}>
        {rightAction ?? <View style={styles.rightPlaceholder} />}
      </View>
    </View>
  );
});

export default PageHeader;

const SLOT_WIDTH = 44;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 52 : 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  border: {
    borderBottomWidth: 0, // spec says no border — shadow from SHADOWS only if needed
  },

  // Left slot
  left: {
    width: SLOT_WIDTH,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  leftPlaceholder: {
    width: SLOT_WIDTH,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.xs,
  },

  // Center
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.slate900,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.slate400,
    textAlign: 'center',
    marginTop: 2,
  },

  // Right slot
  right: {
    width: SLOT_WIDTH,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightPlaceholder: {
    width: SLOT_WIDTH,
  },
});
