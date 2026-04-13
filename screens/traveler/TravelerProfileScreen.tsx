import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import type { User } from '../../types';
import useFetch from '../../hooks/useFetch';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

export default function TravelerProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { data: user, loading, error } = useFetch<User>(`/users/${userId}`);

  if (loading) {
    return <View style={styles.centered}><Text style={styles.hint}>Loading…</Text></View>;
  }

  if (error || !user) {
    return <View style={styles.centered}><Text style={styles.error}>Could not load profile.</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {user.photo ? (
        <Image source={{ uri: user.photo }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.city}>{user.city}</Text>

      {user.bio ? (
        <Text style={styles.bio}>{user.bio}</Text>
      ) : null}

      <View style={styles.row}>
        <InfoChip label="Role" value={user.role} />
        {user.whatsapp ? (
          <InfoChip label="WhatsApp" value={user.whatsapp} />
        ) : null}
      </View>
    </ScrollView>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={chipStyles.chip}>
      <Text style={chipStyles.label}>{label}</Text>
      <Text style={chipStyles.value}>{value}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  label: { fontSize: fontSize.xs, color: colors.text.hint, textTransform: 'uppercase' },
  value: { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text.primary, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { alignItems: 'center', padding: spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: spacing.md },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarInitial: { color: colors.white, fontSize: fontSize.xxxl, fontWeight: fontWeight.bold },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  city: { fontSize: fontSize.md, color: colors.text.secondary, marginTop: spacing.xs },
  bio: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    lineHeight: 22,
  },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  hint: { color: colors.text.hint },
  error: { color: colors.danger },
});
