import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { user, logout } = useAuthStore();

  // CLICK FIX: wrap in useCallback — handler uses logout from store;
  // without it a new function is created on every render, breaking memo children
  const handleLogout = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
          } finally {
            // FIX: logout() returns a Promise — must await to ensure AsyncStorage is cleared before navigation
            await logout();
          }
        },
      },
    ]);
  }, [logout]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account */}
      <Text style={styles.sectionHeading}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name ?? '—'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{user?.phone ?? '—'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>City</Text>
        <Text style={styles.value}>{user?.city ?? '—'}</Text>
      </View>

      {/* Preferences */}
      <Text style={styles.sectionHeading}>Preferences</Text>
      <View style={[styles.card, styles.row]}>
        <Text style={styles.label}>Push Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ true: colors.primary }}
        />
      </View>

      {/* Danger zone */}
      <Text style={styles.sectionHeading}>Account Actions</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  sectionHeading: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text.hint,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: fontSize.sm, color: colors.text.hint },
  value: { fontSize: fontSize.md, color: colors.text.primary, fontWeight: fontWeight.medium, marginTop: 2 },
  logoutBtn: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  logoutText: { color: colors.white, fontWeight: fontWeight.semiBold, fontSize: fontSize.md },
});
