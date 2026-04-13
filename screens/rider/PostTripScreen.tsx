import React, { useState } from 'react';
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

  const handlePost = () => {
    // TODO: validate fields → call tripService.createTrip(...)
  };

  return (
    <ScrollView
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

      {[
        { label: 'Trip Title', value: title, setter: setTitle, placeholder: 'e.g. Delhi → Manali Adventure' },
        { label: 'From', value: from, setter: setFrom, placeholder: 'Departure city' },
        { label: 'To', value: to, setter: setTo, placeholder: 'Destination city' },
        { label: 'Departure Date (YYYY-MM-DD)', value: startDate, setter: setStartDate, placeholder: '2026-05-01' },
        { label: 'Departure Time', value: departureTime, setter: setDepartureTime, placeholder: '07:00 AM' },
        { label: `Seats (max ${config.MAX_SEATS})`, value: seats, setter: setSeats, placeholder: '4', keyboard: 'numeric' as const },
        { label: 'Cost per Person (₹)', value: cost, setter: setCost, placeholder: '1500', keyboard: 'numeric' as const },
      ].map(({ label, value, setter, placeholder, keyboard }) => (
        <View key={label}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.text.hint}
            keyboardType={keyboard ?? 'default'}
            value={value}
            onChangeText={setter}
          />
        </View>
      ))}

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
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semiBold },
});
