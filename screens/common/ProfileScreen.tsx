import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type MenuItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  route?: string;
  onPress?: () => void;
  danger?: boolean;
};

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  // CLICK FIX: wrap in useCallback — handler closes over logout and router;
  // without it MENU_ITEMS cannot be memoized (stale reference on every render)
  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/enter-phone');
        },
      },
    ]);
  }, [logout, router]);

  // CLICK FIX: memoize MENU_ITEMS so list items don't re-create handlers on every render
  const MENU_ITEMS: MenuItem[] = useMemo(() => [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      onPress: () => router.push({ pathname: '/(tabs)/profile/edit-profile' as any, params: { fromEdit: 'true' } }),
    },
    { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
    { icon: 'shield-checkmark-outline', label: 'Safety', route: '/safety' },
    { icon: 'settings-outline', label: 'Settings', route: '/settings' },
    { icon: 'help-circle-outline', label: 'Help & Support', route: '/help' },
    { icon: 'log-out-outline', label: 'Logout', onPress: handleLogout, danger: true },
  ], [router, handleLogout]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Avatar + Info */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'User'}</Text>
        <Text style={styles.phone}>{user?.phone ?? ''}</Text>
        {user?.city ? <Text style={styles.city}>{user.city}</Text> : null}
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ?? 'traveler'}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatBox label="Role" value={user?.role ?? '—'} />
        <StatBox label="City" value={user?.city ?? '—'} />
        <StatBox label="Member" value={user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : '—'} />
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
            onPress={() => {
              if (item.onPress) { item.onPress(); return; }
              if (item.route) router.push(item.route as Parameters<typeof router.push>[0]);
            }}
            activeOpacity={0.7}>
            <Ionicons
              name={item.icon}
              size={20}
              color={item.danger ? colors.danger : colors.text.secondary}
            />
            <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
              {item.label}
            </Text>
            {!item.danger && (
              <Ionicons name="chevron-forward" size={16} color={colors.text.hint} style={{ marginLeft: 'auto' }} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>RideShare v1.0.0</Text>
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.lg, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  avatarText: { fontSize: 34, fontWeight: fontWeight.bold, color: colors.white },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  phone: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  city: { fontSize: fontSize.sm, color: colors.text.hint, marginTop: 2 },
  roleBadge: { marginTop: spacing.sm, backgroundColor: `${colors.primary}18`, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: 4 },
  roleText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.semiBold, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', margin: spacing.md, gap: spacing.sm },
  statBox: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  statLabel: { fontSize: fontSize.xs, color: colors.text.hint, marginTop: 2 },
  menuCard: { backgroundColor: colors.card, borderRadius: 14, marginHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, gap: spacing.sm },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { fontSize: fontSize.md, color: colors.text.primary },
  menuLabelDanger: { color: colors.danger },
  version: { textAlign: 'center', color: colors.text.hint, fontSize: fontSize.xs, marginTop: spacing.xl },
});
