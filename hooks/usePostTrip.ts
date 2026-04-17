// ─── usePostTrip ──────────────────────────────────────────────────────────────
// Manages form state, validation and submission for both FullTour and OneWay
// trip creation forms.  The hook is instantiated once per screen — pass
// `tripType` to select the relevant sub-form and its validation rules.

import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useRef, useState } from 'react';
import { tripService } from '../services/trips';
import type { Trip, TripItineraryDay, TripType, Vehicle } from '../types';

// ─── Form shapes ──────────────────────────────────────────────────────────────

export interface FullTourForm {
  title: string;
  from: string;
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  departureTime: string;   // "HH:MM AM/PM"
  days: number;
  nights: number;
  destinations: string[];  // tour stop tags
  itinerary: TripItineraryDay[];
  stops: string[];         // intermediate halts tags
  restrictions: string;
  seats: number;
  costPerPerson: number;
  ladiesOnly: boolean;
  ac: boolean;
  luggagePolicy: string;
  notes: string;
  photos: string[];        // local file URIs
}

export interface OneWayForm {
  from: string;
  to: string;
  stops: string[];         // intermediate stop tags
  restrictions: string;
  date: string;            // YYYY-MM-DD
  departureTime: string;
  seats: number;
  costPerPerson: number;
  ac: boolean;
  luggagePolicy: string;
  notes: string;
  photos: string[];
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

// ─── Defaults ────────────────────────────────────────────────────────────────

function makeFullTourDefault(vehicle: Vehicle | null): FullTourForm {
  return {
    title: '',
    from: '',
    startDate: '',
    endDate: '',
    departureTime: '',
    days: 1,
    nights: 0,
    destinations: [],
    itinerary: [{ day: 1, description: '' }],
    stops: [],
    restrictions: '',
    seats: 2,
    costPerPerson: 0,
    ladiesOnly: false,
    ac: vehicle?.ac ?? false,
    luggagePolicy: '',
    notes: '',
    photos: [],
  };
}

function makeOneWayDefault(vehicle: Vehicle | null): OneWayForm {
  return {
    from: '',
    to: '',
    stops: [],
    restrictions: '',
    date: '',
    departureTime: '',
    seats: 2,
    costPerPerson: 0,
    ac: vehicle?.ac ?? false,
    luggagePolicy: '',
    notes: '',
    photos: [],
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

function isDateInPast(iso: string): boolean {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function validateFullTour(
  form: FullTourForm,
  vehicle: Vehicle | null,
): FormErrors<FullTourForm> {
  const errors: FormErrors<FullTourForm> = {};

  if (!form.title.trim()) errors.title = 'Trip title is required.';
  if (!form.from.trim()) errors.from = 'Starting point is required.';
  if (form.destinations.length === 0)
    errors.destinations = 'Add at least one destination.';

  if (!isoDateRegex.test(form.startDate))
    errors.startDate = 'Start date must be YYYY-MM-DD.';
  else if (isDateInPast(form.startDate))
    errors.startDate = 'Start date cannot be in the past.';

  if (!isoDateRegex.test(form.endDate))
    errors.endDate = 'End date must be YYYY-MM-DD.';
  else if (form.endDate < form.startDate)
    errors.endDate = 'End date must be on or after start date.';

  if (!form.departureTime.trim())
    errors.departureTime = 'Departure time is required.';

  const maxSeats = vehicle?.seats ?? 12;
  if (form.seats < 1 || form.seats > maxSeats)
    errors.seats = `Seats must be between 1 and ${maxSeats}.`;

  if (form.costPerPerson <= 0)
    errors.costPerPerson = 'Please enter a valid cost (minimum ₹1).';
  else if (form.costPerPerson > 99999)
    errors.costPerPerson = 'Cost cannot exceed ₹99,999.';

  return errors;
}

function validateOneWay(
  form: OneWayForm,
  vehicle: Vehicle | null,
): FormErrors<OneWayForm> {
  const errors: FormErrors<OneWayForm> = {};

  if (!form.from.trim()) errors.from = 'From city is required.';
  if (!form.to.trim()) {
    errors.to = 'To city is required.';
  } else if (form.from.trim().toLowerCase() === form.to.trim().toLowerCase()) {
    // FIX: starting point and destination cannot be the same city
    errors.to = 'Starting point and destination cannot be the same.';
  }

  if (!isoDateRegex.test(form.date))
    errors.date = 'Date must be YYYY-MM-DD.';
  else if (isDateInPast(form.date))
    errors.date = 'Date cannot be in the past.';

  if (!form.departureTime.trim())
    errors.departureTime = 'Departure time is required.';

  const maxSeats = vehicle?.seats ?? 12;
  if (form.seats < 1 || form.seats > maxSeats)
    errors.seats = `Seats must be between 1 and ${maxSeats}.`;

  // FIX: added cost max validation — was only checking > 0, not upper bound
  if (form.costPerPerson <= 0)
    errors.costPerPerson = 'Please enter a valid cost (minimum ₹1).';
  else if (form.costPerPerson > 99999)
    errors.costPerPerson = 'Cost cannot exceed ₹99,999.';

  return errors;
}

// ─── Image picker helper ──────────────────────────────────────────────────────

const MAX_PHOTOS = 5;
const JPEG_QUALITY = 0.8;
const MAX_DIM = 800;

async function pickPhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    quality: JPEG_QUALITY,
    exif: false,
    base64: false,
  });

  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];

  // Optionally resize if expo-image-manipulator is available
  const maxDim = Math.max(asset.width ?? 0, asset.height ?? 0);
  if (maxDim > MAX_DIM) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const M = require('expo-image-manipulator') as {
        manipulateAsync: (
          uri: string,
          a: { resize: { width: number; height: number } }[],
          o: { compress: number; format: string },
        ) => Promise<{ uri: string }>;
        SaveFormat: { JPEG: string };
      };
      const ratio = MAX_DIM / maxDim;
      const resized = await M.manipulateAsync(
        asset.uri,
        [{ resize: { width: Math.round((asset.width ?? 0) * ratio), height: Math.round((asset.height ?? 0) * ratio) } }],
        { compress: JPEG_QUALITY, format: M.SaveFormat.JPEG },
      );
      return resized.uri;
    } catch {
      /* fall through */
    }
  }
  return asset.uri;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UsePostTripReturn<F extends FullTourForm | OneWayForm> {
  form: F;
  errors: FormErrors<F>;
  loading: boolean;
  submitError: string | null;
  // Generic setters
  setField: <K extends keyof F>(key: K, value: F[K]) => void;
  // Tag handlers
  addStop: (stop: string) => void;
  removeStop: (index: number) => void;
  // FullTour-specific
  addDestination: (dest: string) => void;
  removeDestination: (index: number) => void;
  addDay: () => void;
  removeDay: (index: number) => void;
  updateDayDesc: (index: number, desc: string) => void;
  // Photo handlers
  addPhoto: () => Promise<void>;
  removePhoto: (index: number) => void;
  // Submit
  validateForm: () => boolean;
  submit: () => Promise<Trip | null>;
}

export function usePostTrip<T extends TripType>(
  tripType: T,
  vehicle: Vehicle | null,
): UsePostTripReturn<T extends 'full_tour' ? FullTourForm : OneWayForm> {
  type F = T extends 'full_tour' ? FullTourForm : OneWayForm;

  const [form, setForm] = useState<F>(
    () =>
      (tripType === 'full_tour'
        ? makeFullTourDefault(vehicle)
        : makeOneWayDefault(vehicle)) as F,
  );
  const [errors, setErrors] = useState<FormErrors<F>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // FIX: isSubmitting ref prevents double-submit on rapid button taps
  const isSubmitting = useRef(false);

  // ── Generic field setter ──────────────────────────────────────────────────

  const setField = useCallback(
    <K extends keyof F>(key: K, value: F[K]) => {
      setForm(prev => ({ ...prev, [key]: value }));
      // Clear error for that field on change
      setErrors(prev => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  // ── Stop / intermediate halt tags ─────────────────────────────────────────

  const addStop = useCallback((stop: string) => {
    setForm(prev => ({
      ...prev,
      stops: [...(prev.stops as string[]), stop],
    }));
  }, []);

  const removeStop = useCallback((index: number) => {
    setForm(prev => ({
      ...prev,
      stops: (prev.stops as string[]).filter((_, i) => i !== index),
    }));
  }, []);

  // ── FullTour: destination tags ────────────────────────────────────────────

  const addDestination = useCallback((dest: string) => {
    setForm(prev => {
      if (prev === null || !('destinations' in prev)) return prev;
      const ft = prev as unknown as FullTourForm;
      return { ...prev, destinations: [...ft.destinations, dest] } as F;
    });
  }, []);

  const removeDestination = useCallback((index: number) => {
    setForm(prev => {
      if (!('destinations' in prev)) return prev;
      const ft = prev as unknown as FullTourForm;
      return {
        ...prev,
        destinations: ft.destinations.filter((_, i) => i !== index),
      } as F;
    });
  }, []);

  // ── FullTour: itinerary day rows ──────────────────────────────────────────

  const addDay = useCallback(() => {
    setForm(prev => {
      if (!('itinerary' in prev)) return prev;
      const ft = prev as unknown as FullTourForm;
      const nextDay = ft.itinerary.length + 1;
      return {
        ...prev,
        itinerary: [...ft.itinerary, { day: nextDay, description: '' }],
      } as F;
    });
  }, []);

  const removeDay = useCallback((index: number) => {
    setForm(prev => {
      if (!('itinerary' in prev)) return prev;
      const ft = prev as unknown as FullTourForm;
      const filtered = ft.itinerary
        .filter((_, i) => i !== index)
        .map((d, i) => ({ ...d, day: i + 1 }));
      return { ...prev, itinerary: filtered } as F;
    });
  }, []);

  const updateDayDesc = useCallback((index: number, desc: string) => {
    setForm(prev => {
      if (!('itinerary' in prev)) return prev;
      const ft = prev as unknown as FullTourForm;
      const updated = ft.itinerary.map((d, i) =>
        i === index ? { ...d, description: desc } : d,
      );
      return { ...prev, itinerary: updated } as F;
    });
  }, []);

  // ── Photo handlers ────────────────────────────────────────────────────────

  const addPhoto = useCallback(async () => {
    const current = (form.photos as string[]);
    if (current.length >= MAX_PHOTOS) return;
    const uri = await pickPhoto();
    if (!uri) return;
    setForm(prev => ({
      ...prev,
      photos: [...(prev.photos as string[]), uri],
    }));
  }, [form.photos]);

  const removePhoto = useCallback((index: number) => {
    setForm(prev => ({
      ...prev,
      photos: (prev.photos as string[]).filter((_, i) => i !== index),
    }));
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────

  const validateForm = useCallback((): boolean => {
    const errs =
      tripType === 'full_tour'
        ? validateFullTour(form as unknown as FullTourForm, vehicle)
        : validateOneWay(form as unknown as OneWayForm, vehicle);
    setErrors(errs as FormErrors<F>);
    return Object.keys(errs).length === 0;
  }, [form, tripType, vehicle]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const submit = useCallback(async (): Promise<Trip | null> => {
    // FIX: isSubmitting guard prevents double-submit on rapid button taps
    if (isSubmitting.current || loading) return null;
    if (!validateForm()) return null;

    isSubmitting.current = true;
    setLoading(true);
    setSubmitError(null);
    try {
      if (tripType === 'full_tour') {
        const ft = form as unknown as FullTourForm;
        const trip = await tripService.createTrip({
          type: 'full_tour',
          title: ft.title,
          from: ft.from,
          to: ft.destinations[ft.destinations.length - 1] ?? ft.from,
          stops: ft.stops,
          startDate: ft.startDate,
          endDate: ft.endDate,
          departureTime: ft.departureTime,
          seats: ft.seats,
          costPerPerson: ft.costPerPerson,
          vehicle: vehicle ?? {
            id: '',
            type: 'car',
            seats: ft.seats,
            ac: ft.ac,
            rcVerified: false,
            dlVerified: false,
          },
          restrictions: ft.restrictions || undefined,
          notes: ft.notes || undefined,
          photos: ft.photos.length ? ft.photos : undefined,
          itinerary: ft.itinerary.filter(d => d.description.trim()),
          ladiesOnly: ft.ladiesOnly,
          luggagePolicy: ft.luggagePolicy || undefined,
        });
        return trip;
      } else {
        const ow = form as unknown as OneWayForm;
        const trip = await tripService.createTrip({
          type: 'one_way',
          title: `${ow.from} → ${ow.to}`,
          from: ow.from,
          to: ow.to,
          stops: ow.stops,
          startDate: ow.date,
          departureTime: ow.departureTime,
          seats: ow.seats,
          costPerPerson: ow.costPerPerson,
          vehicle: vehicle ?? {
            id: '',
            type: 'car',
            seats: ow.seats,
            ac: ow.ac,
            rcVerified: false,
            dlVerified: false,
          },
          restrictions: ow.restrictions || undefined,
          notes: ow.notes || undefined,
          photos: ow.photos.length ? ow.photos : undefined,
          luggagePolicy: ow.luggagePolicy || undefined,
        });
        return trip;
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to post trip. Try again.';
      setSubmitError(msg);
      return null;
    } finally {
      setLoading(false);
      // FIX: always reset isSubmitting in finally so UI unlocks after error too
      isSubmitting.current = false;
    }
  }, [form, tripType, vehicle, validateForm, loading]);

  // ── Seat max from vehicle ─────────────────────────────────────────────────

  const maxSeats = useMemo(() => vehicle?.seats ?? 12, [vehicle]);
  // Keep seats in bound when vehicle changes
  useMemo(() => {
    if ((form.seats as number) > maxSeats) {
      setForm(prev => ({ ...prev, seats: maxSeats }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSeats]);

  return {
    form,
    errors,
    loading,
    submitError,
    setField,
    addStop,
    removeStop,
    addDestination,
    removeDestination,
    addDay,
    removeDay,
    updateDayDesc,
    addPhoto,
    removePhoto,
    validateForm,
    submit,
  } as UsePostTripReturn<T extends 'full_tour' ? FullTourForm : OneWayForm>;
}
