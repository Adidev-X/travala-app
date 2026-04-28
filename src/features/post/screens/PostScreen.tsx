import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppInput } from '../../../components/common/AppInput';
import { AppButton } from '../../../components/common/AppButton';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/spacing';

const postRideSchema = z.object({
  from: z.string().min(2, 'Enter a valid location'),
  to: z.string().min(2, 'Enter a destination'),
  date: z.string().min(1, 'Select a date'),
  seats: z.string().min(1, 'Enter number of seats'),
});

type PostRideForm = z.infer<typeof postRideSchema>;

export default function PostScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<PostRideForm>({
    resolver: zodResolver(postRideSchema),
    defaultValues: { from: '', to: '', date: '', seats: '1' },
  });

  const onSubmit = (data: PostRideForm) => {
    Alert.alert('Ride Posted! 🎉', `From ${data.from} to ${data.to} on ${data.date} — ${data.seats} seat(s)`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Share Your Ride</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.card}>
        <View style={styles.form}>
          <Controller
            control={control}
            name="from"
            render={({ field: { onChange, value } }) => (
              <AppInput label="From" placeholder="Your current location" value={value} onChangeText={onChange} />
            )}
          />
          {errors.from && <Text style={styles.error}>{errors.from.message}</Text>}

          <Controller
            control={control}
            name="to"
            render={({ field: { onChange, value } }) => (
              <AppInput label="To" placeholder="Where are you going?" value={value} onChangeText={onChange} />
            )}
          />
          {errors.to && <Text style={styles.error}>{errors.to.message}</Text>}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="date"
                render={({ field: { onChange, value } }) => (
                  <AppInput label="Date" placeholder="DD/MM/YYYY" value={value} onChangeText={onChange} keyboardType="numbers-and-punctuation" />
                )}
              />
              {errors.date && <Text style={styles.error}>{errors.date.message}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="seats"
                render={({ field: { onChange, value } }) => (
                  <AppInput label="Seats" placeholder="1" value={value} onChangeText={onChange} keyboardType="numeric" />
                )}
              />
            </View>
          </View>

          <AppButton label="Post Ride" onPress={handleSubmit(onSubmit)} style={{ marginTop: 8 }} />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.page, paddingTop: 24, marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.onBackground },
  card: {
    marginHorizontal: Spacing.page,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 40,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e7bdb820',
  },
  form: { gap: 20 },
  row: { flexDirection: 'row', gap: 12 },
  error: { fontSize: 11, color: Colors.primary, marginTop: -12, paddingLeft: 16 },
});
