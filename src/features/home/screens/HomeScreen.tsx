import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - Spacing.page * 2 - Spacing.lg) / 2;

const DESTINATIONS = [
  { id: 'shimla', name: 'Shimla', trips: 18, isLive: true, image: 'https://images.unsplash.com/photo-1597079910443-60c43ca4f02f?auto=format&fit=crop&w=800&q=80' },
  { id: 'triund', name: 'Triund Trek', trips: 12, isLive: true, image: 'https://images.unsplash.com/photo-1589136777351-fdc9c9c85215?auto=format&fit=crop&w=800&q=80' },
  { id: 'bir', name: 'Bir Billing', trips: 8, isLive: false, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5947?auto=format&fit=crop&w=800&q=80' },
  { id: 'jaipur', name: 'Jaipur', trips: 24, isLive: false, image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80' },
];

const HOT_DESTINATIONS = [
  { id: 'manali', name: 'Manali Heights', trips: 45, tag: 'Hot Now', size: 'portrait', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80' },
  { id: 'leh', name: 'Leh Ladakh', trips: 31, tag: 'Hot Now', size: 'square', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80' },
  { id: 'spiti', name: 'Spiti Valley', trips: 15, tag: 'Hot Now', size: 'square', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { id: 'goa', name: 'Goa Beaches', trips: 82, tag: 'Hot Now', size: 'horizontal', image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=800&q=80' },
];

const CATEGORIES = [
  { id: 'bike', label: 'Bike (pillion)' },
  { id: 'van', label: 'Van (15-seater)' },
  { id: 'bus', label: 'Big Bus' },
  { id: 'trek', label: 'Trekking + Stay' },
];

function PressableScale({ children, onPress, style }: any) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onPress={onPress}
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Greeting */}
      <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.greetingContainer}>
        <Text style={styles.greetingSubtitle}>Namaste, Maninder!</Text>
        <Text style={styles.greetingTitle}>Ready to share a ride to Shimla?</Text>
      </Animated.View>

      {/* Hero Banner */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.heroContainer}>
        <View style={styles.heroBanner}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544161515-4ad6ce6ca60a?auto=format&fit=crop&w=1200&q=80' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroGradient} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Share the Ride.{'\n'}Split the Cost.</Text>
            <Text style={styles.heroSubtitle}>Van seats • Bike pillion • Big bus • Trekking • Hotels. Save up to 40% instantly.</Text>
          </View>
        </View>

        {/* Floating Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <View style={styles.searchInputRow}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                placeholder="Where to next? Shimla, Manali..."
                placeholderTextColor="#5d3f3c80"
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity style={styles.searchButton} activeOpacity={0.85}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Categories */}
      <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryPill} activeOpacity={0.7}>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Hot Now Bento Grid */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hot Now</Text>
          <View style={styles.trendingBadge}>
            <View style={styles.trendingDot} />
            <Text style={styles.trendingText}>TRENDING</Text>
          </View>
        </View>

        {/* Bento Grid Layout */}
        <View style={styles.bentoGrid}>
          {/* Left column: portrait card */}
          <PressableScale style={styles.bentoPortrait}>
            <Image source={{ uri: HOT_DESTINATIONS[0].image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <View style={styles.bentoOverlay} />
            <View style={styles.bentoTagContainer}>
              <Text style={styles.bentoTag}>{HOT_DESTINATIONS[0].tag}</Text>
            </View>
            <View style={styles.bentoInfo}>
              <Text style={styles.bentoName}>{HOT_DESTINATIONS[0].name}</Text>
              <Text style={styles.bentoTrips}>{HOT_DESTINATIONS[0].trips} active trips</Text>
            </View>
          </PressableScale>

          {/* Right column: two square cards */}
          <View style={styles.bentoRightCol}>
            {[HOT_DESTINATIONS[1], HOT_DESTINATIONS[2]].map((dest) => (
              <PressableScale key={dest.id} style={styles.bentoSquare}>
                <Image source={{ uri: dest.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                <View style={styles.bentoOverlay} />
                <View style={styles.bentoTagContainer}>
                  <Text style={styles.bentoTag}>{dest.tag}</Text>
                </View>
                <View style={styles.bentoInfo}>
                  <Text style={[styles.bentoName, { fontSize: 13 }]}>{dest.name}</Text>
                  <Text style={styles.bentoTrips}>{dest.trips} active trips</Text>
                </View>
              </PressableScale>
            ))}
          </View>
        </View>

        {/* Horizontal card */}
        <PressableScale style={styles.bentoHorizontal}>
          <Image source={{ uri: HOT_DESTINATIONS[3].image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <View style={styles.bentoOverlay} />
          <View style={styles.bentoTagContainer}>
            <Text style={styles.bentoTag}>{HOT_DESTINATIONS[3].tag}</Text>
          </View>
          <View style={styles.bentoInfo}>
            <Text style={styles.bentoName}>{HOT_DESTINATIONS[3].name}</Text>
            <Text style={styles.bentoTrips}>{HOT_DESTINATIONS[3].trips} active trips</Text>
          </View>
        </PressableScale>
      </Animated.View>

      {/* Popular Destinations */}
      <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.section}>
        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
          Popular Destinations{'\n'}Right Now
        </Text>
        <View style={styles.destinationsGrid}>
          {DESTINATIONS.map((dest) => (
            <PressableScale key={dest.id} style={styles.destCard}>
              <Image source={{ uri: dest.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              <View style={[styles.bentoOverlay, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />
              {dest.isLive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
              <View style={styles.destInfo}>
                <Text style={styles.destName}>{dest.name}</Text>
                <Text style={styles.destTrips}>{dest.trips} trips open</Text>
              </View>
            </PressableScale>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  greetingContainer: { paddingHorizontal: Spacing.page, paddingTop: 24, paddingBottom: 16 },
  greetingSubtitle: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 4 },
  greetingTitle: { fontSize: 24, fontWeight: '800', color: Colors.onBackground, lineHeight: 30, letterSpacing: -0.5 },
  heroContainer: { paddingHorizontal: Spacing.page, marginBottom: 56 },
  heroBanner: { height: 300, borderRadius: 28, overflow: 'hidden', position: 'relative', backgroundColor: '#ddd' },
  heroImage: { ...StyleSheet.absoluteFillObject },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0)' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingTop: 80, backgroundColor: 'transparent' },
  heroTitle: { fontSize: 30, fontWeight: '900', color: '#fff', lineHeight: 34, marginBottom: 8 },
  heroSubtitle: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.9)' },
  searchBarContainer: { position: 'absolute', bottom: -28, left: 0, right: 0, paddingHorizontal: 0 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 50,
    padding: 6,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(186,0,20,0.1)',
  },
  searchInputRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 16 },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.onBackground, paddingVertical: 12 },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 50,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginLeft: 8,
  },
  searchButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  categoriesSection: { marginTop: 32, marginBottom: 24 },
  categoriesList: { paddingHorizontal: Spacing.page, gap: 10 },
  categoryPill: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7bdb840',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: Colors.onSurface },
  section: { paddingHorizontal: Spacing.page, marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.onBackground },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#ba001415',
    borderRadius: 50,
  },
  trendingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  trendingText: { fontSize: 9, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  bentoGrid: { flexDirection: 'row', gap: 12, marginBottom: 12, height: CARD_SIZE * 2 + 12 },
  bentoPortrait: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  bentoRightCol: { flex: 1, gap: 12 },
  bentoSquare: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  bentoHorizontal: {
    width: '100%',
    height: CARD_SIZE,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  bentoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  bentoTagContainer: { position: 'absolute', top: 12, left: 12 },
  bentoTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.8)',
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    borderRadius: 50,
    textTransform: 'uppercase',
    letterSpacing: 1,
    overflow: 'hidden',
  },
  bentoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  bentoName: { color: '#fff', fontWeight: '700', fontSize: 14, lineHeight: 18 },
  bentoTrips: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '500' },
  destinationsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  destCard: {
    width: CARD_SIZE,
    height: 200,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  liveBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  destInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    paddingTop: 40,
  },
  destName: { color: '#fff', fontWeight: '700', fontSize: 14, marginBottom: 2 },
  destTrips: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '500' },
});
