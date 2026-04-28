import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/spacing';

const MY_TRIPS = [
  { id: '1', dest: 'Shimla', date: '28 Apr', status: 'Pending', type: 'Van', price: '₹450', image: 'https://images.unsplash.com/photo-1597079910443-60c43ca4f02f?auto=format&fit=crop&w=400&q=80' },
  { id: '2', dest: 'Jaipur', date: '15 May', status: 'Confirmed', type: 'Bike', price: '₹320', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=400&q=80' },
];

export default function TripsScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>My Trips</Text>
      </Animated.View>

      <View style={styles.list}>
        {MY_TRIPS.map((trip, idx) => (
          <Animated.View key={trip.id} entering={FadeInDown.delay(idx * 80).duration(400)}>
            <TouchableOpacity style={styles.card} activeOpacity={0.85}>
              <View style={styles.cardTop}>
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: trip.image }} style={styles.tripImage} resizeMode="cover" />
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.cardInfoRow}>
                    <Text style={styles.destName}>{trip.dest}</Text>
                    <Text style={styles.price}>{trip.price}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>📅 {trip.date}</Text>
                    <Text style={styles.metaText}>👥 {trip.type}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: trip.status === 'Confirmed' ? '#22c55e' : '#f97316' }]} />
                  <Text style={styles.statusText}>{trip.status}</Text>
                </View>
                <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.7}>
                  <Text style={styles.detailsBtnText}>Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {MY_TRIPS.length === 0 && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
            <Text style={styles.emptyText}>No trips planned yet.</Text>
          </View>
        )}
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
    padding: 20,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: '#e7bdb830',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  imageWrapper: { width: 64, height: 64, borderRadius: 18, overflow: 'hidden', backgroundColor: '#f0f0f0', flexShrink: 0 },
  tripImage: { width: '100%', height: '100%' },
  cardInfo: { flex: 1 },
  cardInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  destName: { fontSize: 17, fontWeight: '700', color: Colors.onSurface },
  price: { fontSize: 16, fontWeight: '900', color: Colors.primary },
  metaRow: { flexDirection: 'row', gap: 14 },
  metaText: { fontSize: 11, fontWeight: '600', color: Colors.onSurfaceVariant + '90' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: Colors.onSurfaceVariant + '90' },
  detailsBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: Colors.primary + '10' },
  detailsBtnText: { fontSize: 11, fontWeight: '900', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  empty: { paddingVertical: 80, alignItems: 'center' },
  emptyText: { fontSize: 17, fontWeight: '500', color: Colors.onSurfaceVariant },
});
