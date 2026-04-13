/**
 * useSafety — emergency contacts + SOS + trip share logic.
 *
 * NO GPS, NO location, NO real-time tracking.
 * Contacts are persisted in AsyncStorage under key 'safety_contacts'.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Share } from 'react-native';
import type { Trip } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY    = 'safety_contacts';
const MAX_CONTACTS   = 2;
const NATIONAL_EMS   = '112'; // India emergency number

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSafety() {
  const [contacts, setContacts]   = useState<EmergencyContact[]>([]);
  const [loading,  setLoading]    = useState(true);

  // ── Load from AsyncStorage ────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!mounted) return;
        if (raw) {
          try {
            setContacts(JSON.parse(raw) as EmergencyContact[]);
          } catch {
            // corrupt data — reset
            setContacts([]);
          }
        }
      })
      .catch(() => { /* storage unavailable — work in-memory */ })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  // ── Persist helper ────────────────────────────────────────────────────────

  const persist = useCallback(async (next: EmergencyContact[]) => {
    setContacts(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch { /* silently ignore */ }
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addContact = useCallback(
    async (contact: Omit<EmergencyContact, 'id'>): Promise<boolean> => {
      if (contacts.length >= MAX_CONTACTS) {
        Alert.alert('Limit reached', `You can add at most ${MAX_CONTACTS} emergency contacts.`);
        return false;
      }
      const next: EmergencyContact = {
        ...contact,
        id: `ec_${Date.now()}`,
      };
      await persist([...contacts, next]);
      return true;
    },
    [contacts, persist],
  );

  const removeContact = useCallback(
    async (id: string) => {
      await persist(contacts.filter(c => c.id !== id));
    },
    [contacts, persist],
  );

  const editContact = useCallback(
    async (id: string, updates: Partial<Omit<EmergencyContact, 'id'>>) => {
      const next = contacts.map(c => (c.id === id ? { ...c, ...updates } : c));
      await persist(next);
    },
    [contacts, persist],
  );

  // ── SOS ───────────────────────────────────────────────────────────────────

  const triggerSOS = useCallback(() => {
    const primaryContact = contacts[0];
    const targetNumber   = primaryContact?.phone ?? NATIONAL_EMS;
    const targetName     = primaryContact?.name  ?? 'Emergency Services (112)';

    Alert.alert(
      '🚨 Trigger SOS?',
      `This will call ${targetName} immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Call ${targetName}`,
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`tel:${targetNumber}`).catch(() => {
              Alert.alert('Error', 'Unable to open the phone dialer.');
            });
          },
        },
      ],
    );
  }, [contacts]);

  // ── Share Trip ────────────────────────────────────────────────────────────

  const shareTrip = useCallback(async (trip: Trip) => {
    const riderName  = `Rider #${trip.riderId}`; // replace with resolved name if available
    const rcNumber   = trip.vehicle.rcVerified ? '(RC Verified)' : '(RC Pending)';
    const route      = `${trip.from} → ${trip.to}`;
    const date       = trip.startDate.slice(0, 10); // YYYY-MM-DD

    const message =
      `🚗 RideShare Safety Info\n\n` +
      `I am travelling with: ${riderName}\n` +
      `Vehicle: ${trip.vehicle.model ?? trip.vehicle.type.toUpperCase()} ${rcNumber}\n` +
      `Route: ${route}\n` +
      `Date: ${date}`;

    try {
      await Share.share(
        { message, title: 'My Trip Safety Info' },
        { dialogTitle: 'Share Trip Details' },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not open share sheet.';
      Alert.alert('Share failed', msg);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return {
    contacts,
    loading,
    canAddMore: contacts.length < MAX_CONTACTS,
    addContact,
    removeContact,
    editContact,
    triggerSOS,
    shareTrip,
  } as const;
}

export type UseSafetyReturn = ReturnType<typeof useSafety>;
