import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/spacing';

const DISCOVER_ITEMS = [
  { id: '1', title: 'Weekend Getaways', desc: 'Short trips within 200km', color: '#3b82f6', image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=400&q=80' },
  { id: '2', title: 'Solo Friendly', desc: 'Safe communities for solo travelers', color: '#8b5cf6', image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=400&q=80' },
  { id: '3', title: 'Budget Friendly', desc: 'Share rides and cut costs', color: '#22c55e', image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80' },
];

export default function DiscoverScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Discover Adventures</Text>
      </Animated.View>

      <View style={styles.list}>
        {DISCOVER_ITEMS.map((item, idx) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(idx * 80).duration(400)}>
            <TouchableOpacity style={styles.card} activeOpacity={0.85}>
              <Image source={{ uri: item.image }} style={styles.cardBg} resizeMode="cover" />
              <View style={styles.cardOverlay} />
              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                </View>
                <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                  <Text style={{ fontSize: 22 }}>🧭</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.page, paddingTop: 24, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.onBackground },
  list: { paddingHorizontal: Spacing.page, gap: 16 },
  card: {
    padding: 24,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#e7bdb830',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 90,
  },
  cardBg: { ...StyleSheet.absoluteFillObject, opacity: 0.08 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)' },
  cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.onSurface, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: Colors.onSurfaceVariant + 'b0' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
