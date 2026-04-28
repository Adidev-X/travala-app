import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title = 'TripShare' }: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top || 12 }]}>
      <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
        <Text style={{ fontSize: 22 }}>⛰️</Text>
      </TouchableOpacity>
      <Text style={styles.logo}>{title}</Text>
      <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
        <Text style={{ fontSize: 22 }}>🔔</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,248,247,0.85)',
    borderBottomWidth: 0,
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 20, fontWeight: '900', color: Colors.primaryContainer, letterSpacing: -0.5 },
});
