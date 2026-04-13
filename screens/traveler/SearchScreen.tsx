import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import useTrips from '../../hooks/useTrips';
import useDebounce from '../../hooks/useDebounce';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { formatDate } from '../../utils/formatDate';
import strings from '../../constants/strings';
import type { Trip } from '../../types';

export default function SearchScreen() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const debouncedFrom = useDebounce(from, 500);
  const debouncedTo = useDebounce(to, 500);

  const { trips, loading, error } = useTrips({
    from: debouncedFrom,
    to: debouncedTo,
    date,
  });

  const renderItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Text style={styles.tripTitle}>{item.title}</Text>
      <Text style={styles.route}>
        {item.from} → {item.to}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{formatDate(item.startDate)}</Text>
        <Text style={styles.meta}>
          {strings.trip.seatsLeft(item.seatsLeft)}
        </Text>
        <Text style={styles.cost}>₹{item.costPerPerson}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="From city"
          placeholderTextColor={colors.text.hint}
          value={from}
          onChangeText={setFrom}
        />
        <TextInput
          style={styles.input}
          placeholder="To city"
          placeholderTextColor={colors.text.hint}
          value={to}
          onChangeText={setTo}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor={colors.text.hint}
          value={date}
          onChangeText={setDate}
        />
      </View>

      {loading && <ActivityIndicator color={colors.primary} style={styles.loader} />}
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={trips}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={trips.length === 0 && !loading ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>{strings.trip.noTripsFound}</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: {
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  loader: { margin: spacing.lg },
  errorText: { color: colors.danger, textAlign: 'center', margin: spacing.md },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing.xxl },
  emptyText: { color: colors.text.hint, fontSize: fontSize.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    margin: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tripTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  route: { fontSize: fontSize.md, color: colors.text.secondary },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  meta: { fontSize: fontSize.sm, color: colors.text.hint },
  cost: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
});
