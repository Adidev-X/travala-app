import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/spacing';

const PROFILE_STATS = [
  { label: 'Rating', val: '4.9', emoji: '⭐' },
  { label: 'Trips', val: '24', emoji: '🗺️' },
  { label: 'Saved', val: '₹4.2k', emoji: '💰' },
];

const MENU_ITEMS = [
  { label: 'Payment Methods', emoji: '💳' },
  { label: 'Security & Privacy', emoji: '🔒' },
  { label: 'Preferences', emoji: '⚙️' },
  { label: 'Help Center', emoji: '💬' },
  { label: 'Sign Out', emoji: '👋', danger: true },
];

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Avatar & Name */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=400&q=80' }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.editBadge} activeOpacity={0.7}>
            <Text style={{ fontSize: 14, color: '#fff' }}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>Maninder Singh</Text>
        <Text style={styles.subtitle}>Verified Explorer • Since 2024</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          {PROFILE_STATS.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={{ fontSize: 16, marginBottom: 4 }}>{stat.emoji}</Text>
              <Text style={styles.statVal}>{stat.val}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Menu */}
      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.menuList}>
        {MENU_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => item.danger && Alert.alert('Sign Out', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Sign Out', style: 'destructive' }])}
          >
            <View style={styles.menuIconBox}>
              <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
            </View>
            <Text style={[styles.menuLabel, item.danger && { color: '#ef4444' }]}>{item.label}</Text>
            <View style={styles.menuArrow}>
              <Text style={{ fontSize: 14, color: Colors.onSurfaceVariant + '60' }}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHeader: { paddingHorizontal: Spacing.page, paddingTop: 24, alignItems: 'center', marginBottom: 32 },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: { width: 120, height: 120, borderRadius: 36, borderWidth: 4, borderColor: '#fff' },
  editBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  name: { fontSize: 24, fontWeight: '900', color: Colors.onBackground, marginBottom: 4 },
  subtitle: { fontSize: 13, fontWeight: '500', color: Colors.onSurfaceVariant + '99' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statVal: { fontSize: 18, fontWeight: '900', color: Colors.onBackground, lineHeight: 22 },
  statLabel: { fontSize: 9, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 1, color: Colors.onSurfaceVariant + '80', marginTop: 2 },
  menuList: { paddingHorizontal: Spacing.page, gap: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIconBox: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  menuArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center' },
});
