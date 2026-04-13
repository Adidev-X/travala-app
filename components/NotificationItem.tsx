import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import type { Notification, NotificationType } from '@/types';

export interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

// ─── Type → visual config ─────────────────────────────────────────────────────

type IconConfig = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  bg: string;
  color: string;
};

const TYPE_CONFIG: Record<NotificationType, IconConfig> = {
  join_accepted:   { name: 'checkmark-circle', bg: `${colors.success}1A`, color: colors.success },
  join_declined:   { name: 'close-circle',     bg: `${colors.danger}1A`,  color: colors.danger },
  trip_cancelled:  { name: 'ban',              bg: `${colors.danger}1A`,  color: colors.danger },
  doc_approved:    { name: 'shield-checkmark', bg: `${colors.success}1A`, color: colors.success },
  doc_rejected:    { name: 'shield',           bg: `${colors.warning}1A`, color: colors.warning },
  trip_reminder:   { name: 'alarm',            bg: `${colors.secondary}1A`, color: colors.secondary },
};

// ─── Time-ago helper ──────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7)   return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ─── Component ───────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 76; // used by getItemLayout in parent

export { ITEM_HEIGHT };

const NotificationItem = memo(function NotificationItem({
  notification: n,
  onPress,
}: NotificationItemProps) {
  const cfg = TYPE_CONFIG[n.type];

  return (
    <TouchableOpacity
      style={[styles.item, !n.read && styles.itemUnread]}
      onPress={() => onPress(n)}
      activeOpacity={0.75}>
      {/* Left accent bar for unread */}
      {!n.read && <View style={styles.accentBar} />}

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.name} size={20} color={cfg.color} />
      </View>

      {/* Text */}
      <View style={styles.textWrap}>
        <Text style={[styles.title, !n.read && styles.titleUnread]} numberOfLines={1}>
          {n.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>{n.body}</Text>
      </View>

      {/* Time */}
      <Text style={styles.time}>{timeAgo(n.createdAt)}</Text>
    </TouchableOpacity>
  );
});

export default NotificationItem;

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    minHeight: ITEM_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemUnread:  { backgroundColor: `${colors.primary}07` },
  accentBar:   { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: colors.primary, borderRadius: 2 },
  iconWrap:    { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  textWrap:    { flex: 1, marginRight: spacing.sm },
  title:       { fontSize: fontSize.sm, color: colors.text.secondary, marginBottom: 2 },
  titleUnread: { fontWeight: fontWeight.semiBold, color: colors.text.primary },
  body:        { fontSize: fontSize.xs, color: colors.text.hint, lineHeight: 16 },
  time:        { fontSize: fontSize.xs, color: colors.text.hint, alignSelf: 'flex-start', paddingTop: 2 },
});
