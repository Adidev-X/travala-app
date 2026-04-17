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
  // VALIDATION ADDED: errors Record state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTriggered, setSearchTriggered] = useState(false);

  const debouncedFrom = useDebounce(searchTriggered ? from : '', 500);
  const debouncedTo = useDebounce(searchTriggered ? to : '', 500);
  const debouncedDate = useDebounce(searchTriggered ? date : '', 500);

  const { trips, loading, error } = useTrips({
    from: debouncedFrom,
    to: debouncedTo,
    date: debouncedDate,
  });

  // VALIDATION ADDED: validateForm returns errors Record
  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    // From/To: required, cannot be same
    if (!from.trim()) {
      errs.from = 'Start and destination must be different';
    }
    if (!to.trim()) {
      errs.to = 'Start and destination must be different';
    } else if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      errs.to = 'Start and destination must be different';
    }

    // Date: optional — if provided, cannot be past
    if (date.trim()) {
      const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoRegex.test(date)) {
        errs.date = 'Date cannot be in the past';
      } else {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (d < today) errs.date = 'Date cannot be in the past';
      }
    }

    return errs;
  };

  const handleSearch = () => {
    // VALIDATION ADDED: validate before triggering search
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSearchTriggered(true);
  };

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
          // VALIDATION ADDED: red border on error
          style={[styles.input, errors.from ? { borderColor: colors.danger } : null]}
          placeholder="From city"
          placeholderTextColor={colors.text.hint}
          value={from}
          // VALIDATION ADDED: clear field error on change
          onChangeText={v => { setFrom(v); setErrors(prev => ({ ...prev, from: '', to: '' })); setSearchTriggered(false); }}
        />
        {/* VALIDATION ADDED: inline error display */}
        {errors.from ? <Text style={styles.errorText}>{errors.from}</Text> : null}

        <TextInput
          style={[styles.input, errors.to ? { borderColor: colors.danger } : null]}
          placeholder="To city"
          placeholderTextColor={colors.text.hint}
          value={to}
          onChangeText={v => { setTo(v); setErrors(prev => ({ ...prev, to: '' })); setSearchTriggered(false); }}
        />
        {errors.to ? <Text style={styles.errorText}>{errors.to}</Text> : null}

        <TextInput
          style={[styles.input, errors.date ? { borderColor: colors.danger } : null]}
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor={colors.text.hint}
          value={date}
          onChangeText={v => { setDate(v); setErrors(prev => ({ ...prev, date: '' })); setSearchTriggered(false); }}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}

        {/* VALIDATION ADDED: Search button triggers validateForm */}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
          <Text style={styles.searchBtnText}>Search Trips</Text>
        </TouchableOpacity>
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
  // VALIDATION ADDED: errorText style per spec
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4, marginLeft: 4 },
  // VALIDATION ADDED: search button
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  searchBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semiBold },
  loader: { margin: spacing.lg },
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
