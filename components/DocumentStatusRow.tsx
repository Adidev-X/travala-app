// ─── DocumentStatusRow ────────────────────────────────────────────────────────
// Memoised row component used in VerificationScreen.
// Shows: document name · coloured status badge · primary action button.

import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import { fontSize, fontWeight } from '../constants/typography';
import type { DocumentStatus } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentStatusRowProps {
  docName: string;
  status: DocumentStatus;
  rejectionReason?: string;
  onUpload: () => void;
  onView?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  DocumentStatus,
  {
    label: string;
    bg: string;
    text: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }
> = {
  not_uploaded: {
    label: 'Not Uploaded',
    bg: colors.statusPending,
    text: colors.statusPendingText,
    icon: 'cloud-upload-outline',
  },
  pending: {
    label: 'Under Review',
    bg: '#DBEAFE',
    text: '#1D4ED8',
    icon: 'time-outline',
  },
  approved: {
    label: 'Approved',
    bg: colors.statusAccepted,
    text: colors.statusAcceptedText,
    icon: 'checkmark-circle-outline',
  },
  rejected: {
    label: 'Rejected',
    bg: colors.statusDeclined,
    text: colors.statusDeclinedText,
    icon: 'close-circle-outline',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

const DocumentStatusRow = memo<DocumentStatusRowProps>(
  ({ docName, status, rejectionReason, onUpload, onView }) => {
    const cfg = STATUS_CONFIG[status];
    const canUpload = status === 'not_uploaded' || status === 'rejected';
    const canView = status === 'pending' || status === 'approved';

    return (
      <View style={styles.container}>
        {/* Left: icon circle + doc name/status */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: cfg.bg + '80' },
          ]}
        >
          <Ionicons name={cfg.icon} size={20} color={cfg.text} />
        </View>

        <View style={styles.info}>
          <Text style={styles.docName}>{docName}</Text>

          {/* Status badge */}
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.text }]}>
              {cfg.label}
            </Text>
          </View>

          {/* Rejection reason */}
          {status === 'rejected' && rejectionReason ? (
            <View style={styles.rejectionRow}>
              <Ionicons
                name="alert-circle-outline"
                size={12}
                color={colors.danger}
              />
              <Text style={styles.rejectionText} numberOfLines={2}>
                {rejectionReason}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Action button */}
        {canUpload && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.uploadBtn]}
            onPress={onUpload}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cloud-upload-outline" size={14} color="#fff" />
            <Text style={styles.uploadBtnText}>
              {status === 'rejected' ? 'Re-upload' : 'Upload'}
            </Text>
          </TouchableOpacity>
        )}

        {canView && onView && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={onView}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="eye-outline" size={14} color={colors.primary} />
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

DocumentStatusRow.displayName = 'DocumentStatusRow';
export default DocumentStatusRow;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },

  info: {
    flex: 1,
    gap: spacing.xs,
  },

  docName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },

  badge: {
    alignSelf: 'flex-start',
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },

  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
  },

  rejectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 2,
  },

  rejectionText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.danger,
    lineHeight: 16,
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginTop: 2,
    flexShrink: 0,
  },

  uploadBtn: {
    backgroundColor: colors.primary,
  },

  uploadBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: '#fff',
  },

  viewBtn: {
    backgroundColor: `${colors.primary}14`,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  viewBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.primary,
  },
});
