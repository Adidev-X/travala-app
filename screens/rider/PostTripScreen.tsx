import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import config from '../../constants/config';

export default function PostTripScreen() {
  const [title, setTitle] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [seats, setSeats] = useState('');
  const [cost, setCost] = useState('');
  const [tripType, setTripType] = useState<'one_way' | 'full_tour'>('one_way');
  const [acAvailable, setAcAvailable] = useState(false);
  const [notes, setNotes] = useState('');
  // VALIDATION ADDED: errors Record state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const scrollRef = useRef<ScrollView>(null);

  // VALIDATION ADDED: validateForm returns Record<string, string>
  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    // Trip title: min 5, max 80 chars
    if (!title.trim() || title.trim().length < 5 || title.trim().length > 80) {
      errs.title = 'Title must be 5-80 characters';
    }

    // From: required
    if (!from.trim()) {
      errs.from = 'Start and destination must be different';
    }

    // To: required, cannot be same as from
    if (!to.trim()) {
      errs.to = 'Start and destination must be different';
    } else if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      errs.to = 'Start and destination must be different';
    }

    // Date: cannot be past
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoRegex.test(startDate)) {
      errs.startDate = 'Date cannot be in the past';
    } else {
      const d = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) errs.startDate = 'Date cannot be in the past';
    }

    // Seats: min 1, max per vehicle
    const seatsNum = parseInt(seats, 10);
    if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > config.MAX_SEATS) {
      errs.seats = 'Invalid seat count';
    }

    // Cost: min 1, max 99999
    const costNum = parseFloat(cost);
    if (isNaN(costNum) || costNum < 1 || costNum > 99999) {
      errs.cost = 'Enter valid cost (min ₹1)';
    }

    return errs;
  };

  const handlePost = () => {
    // VALIDATION ADDED: validate before API call
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // VALIDATION ADDED: scroll to first error
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    // TODO: validate fields → call tripService.createTrip(...)
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Post a Trip</Text>

      {(['one_way', 'full_tour'] as const).map(t => (
        <TouchableOpacity
          key={t}
          style={[styles.typeChip, tripType === t && styles.typeChipActive]}
          onPress={() => setTripType(t)}>
          <Text
            style={[
              styles.typeChipText,
              tripType === t && styles.typeChipTextActive,
            ]}>
            {t === 'one_way' ? 'One Way' : 'Full Tour'}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Trip Title */}
      <Text style={styles.label}>Trip Title</Text>
      <TextInput
        // VALIDATION ADDED: red border on error
        style={[styles.input, errors.title ? { borderColor: colors.danger } : null]}
        placeholder="e.g. Delhi → Manali Adventure"
        placeholderTextColor={colors.text.hint}
        value={title}
        // VALIDATION ADDED: clear field error on change
        onChangeText={v => { setTitle(v); setErrors(prev => ({ ...prev, title: '' })); }}
      />
      {/* VALIDATION ADDED: inline error */}
      {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

      {/* From */}
      <Text style={styles.label}>From</Text>
      <TextInput
        style={[styles.input, errors.from ? { borderColor: colors.danger } : null]}
        placeholder="Departure city"
        placeholderTextColor={colors.text.hint}
        value={from}
        onChangeText={v => { setFrom(v); setErrors(prev => ({ ...prev, from: '', to: '' })); }}
      />
      {errors.from ? <Text style={styles.errorText}>{errors.from}</Text> : null}

      {/* To */}
      <Text style={styles.label}>To</Text>
      <TextInput
        style={[styles.input, errors.to ? { borderColor: colors.danger } : null]}
        placeholder="Destination city"
        placeholderTextColor={colors.text.hint}
        value={to}
        onChangeText={v => { setTo(v); setErrors(prev => ({ ...prev, to: '' })); }}
      />
      {errors.to ? <Text style={styles.errorText}>{errors.to}</Text> : null}

      {/* Date */}
      <Text style={styles.label}>Departure Date (YYYY-MM-DD)</Text>
      <TextInput
        style={[styles.input, errors.startDate ? { borderColor: colors.danger } : null]}
        placeholder="2026-05-01"
        placeholderTextColor={colors.text.hint}
        value={startDate}
        onChangeText={v => { setStartDate(v); setErrors(prev => ({ ...prev, startDate: '' })); }}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />
      {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}

      {/* Departure Time */}
      <Text style={styles.label}>Departure Time</Text>
      <TextInput
        style={styles.input}
        placeholder="07:00 AM"
        placeholderTextColor={colors.text.hint}
        value={departureTime}
        onChangeText={setDepartureTime}
      />

      {/* Seats */}
      <Text style={styles.label}>{`Seats (max ${config.MAX_SEATS})`}</Text>
      <TextInput
        style={[styles.input, errors.seats ? { borderColor: colors.danger } : null]}
        placeholder="4"
        placeholderTextColor={colors.text.hint}
        keyboardType="numeric"
        value={seats}
        onChangeText={v => { setSeats(v); setErrors(prev => ({ ...prev, seats: '' })); }}
      />
      {errors.seats ? <Text style={styles.errorText}>{errors.seats}</Text> : null}

      {/* Cost */}
      <Text style={styles.label}>Cost per Person (₹)</Text>
      <TextInput
        style={[styles.input, errors.cost ? { borderColor: colors.danger } : null]}
        placeholder="1500"
        placeholderTextColor={colors.text.hint}
        keyboardType="numeric"
        value={cost}
        onChangeText={v => { setCost(v); setErrors(prev => ({ ...prev, cost: '' })); }}
      />
      {errors.cost ? <Text style={styles.errorText}>{errors.cost}</Text> : null}

      <View style={styles.row}>
        <Text style={styles.label}>AC Available</Text>
        <Switch
          value={acAvailable}
          onValueChange={setAcAvailable}
          trackColor={{ true: colors.primary }}
        />
      </View>

      <Text style={styles.label}>Notes / Restrictions</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Any luggage rules, pets, smoking policy…"
        placeholderTextColor={colors.text.hint}
        multiline
        numberOfLines={3}
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity style={styles.button} onPress={handlePost} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Post Trip</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  heading: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  typeChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  typeChipText: { color: colors.text.secondary, fontSize: fontSize.sm },
  typeChipTextActive: { color: colors.white },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text.primary,
    backgroundColor: colors.card,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: spacing.sm },
  // VALIDATION ADDED: errorText style per spec
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4, marginLeft: 4 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semiBold },
});
