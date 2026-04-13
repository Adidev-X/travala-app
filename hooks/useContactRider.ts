// ─── useContactRider ─────────────────────────────────────────────────────────
// Manages all logic for the Contact Rider screen:
//   - hasExistingRequest check on mount
//   - openPhone / openWhatsApp via Linking
//   - sendRequest with loading / success / error states

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { requestService } from '../services/requestService';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UseContactRiderParams {
  tripId: string;
  tripFrom: string;
  tripTo: string;
  tripDate: string;
  riderName: string;
  riderPhone: string;
  riderWhatsapp?: string;
}

export type RequestState = 'idle' | 'loading' | 'sent' | 'error' | 'duplicate';

export interface UseContactRiderReturn {
  // existing-request check
  checkingRequest: boolean;
  alreadyRequested: boolean;
  // send request
  message: string;
  setMessage: (v: string) => void;
  requestState: RequestState;
  requestError: string | null;
  sendRequest: () => Promise<void>;
  // linking handlers
  openPhone: () => Promise<void>;
  openWhatsApp: () => Promise<void>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useContactRider({
  tripId,
  tripFrom,
  tripTo,
  tripDate,
  riderName,
  riderPhone,
  riderWhatsapp,
}: UseContactRiderParams): UseContactRiderReturn {
  const isMounted = useRef(true);

  // ── State ─────────────────────────────────────────────────────────────────
  const [checkingRequest, setCheckingRequest] = useState(true);
  const [alreadyRequested, setAlreadyRequested] = useState(false);
  const [message, setMessage] = useState('');
  const [requestState, setRequestState] = useState<RequestState>('idle');
  const [requestError, setRequestError] = useState<string | null>(null);

  // ── Check existing request on mount ───────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    let cancelled = false;

    (async () => {
      try {
        const exists = await requestService.hasRequest(tripId);
        if (!cancelled && isMounted.current) {
          setAlreadyRequested(exists);
          if (exists) setRequestState('duplicate');
        }
      } catch {
        // silently ignore — UI will allow send; server will reject duplicate
      } finally {
        if (!cancelled && isMounted.current) setCheckingRequest(false);
      }
    })();

    return () => {
      cancelled = true;
      isMounted.current = false;
    };
  }, [tripId]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Normalize a 10-digit Indian number to 91XXXXXXXXXX */
  const normalize = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) return digits;
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  // ── Open phone dialer ─────────────────────────────────────────────────────
  const openPhone = useCallback(async () => {
    const normalized = normalize(riderPhone);
    const url = `tel:+${normalized}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Cannot Open Dialer', 'Your device does not support phone calls.');
      return;
    }
    await Linking.openURL(url);
  }, [riderPhone]);

  // ── Open WhatsApp ─────────────────────────────────────────────────────────
  const openWhatsApp = useCallback(async () => {
    const phone = riderWhatsapp ?? riderPhone;
    const normalized = normalize(phone);
    const template = encodeURIComponent(
      `Hi ${riderName}, I saw your trip on RideShare (${tripFrom} → ${tripTo} on ${tripDate}). I'm interested in joining. Could you share more details?`,
    );
    const url = `whatsapp://send?phone=${normalized}&text=${template}`;

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(
        'WhatsApp Not Found',
        'WhatsApp does not appear to be installed on your device.',
        [{ text: 'OK' }],
      );
      return;
    }
    await Linking.openURL(url);
  }, [riderName, riderPhone, riderWhatsapp, tripDate, tripFrom, tripTo]);

  // ── Send join request ─────────────────────────────────────────────────────
  const sendRequest = useCallback(async () => {
    if (requestState === 'loading' || requestState === 'sent') return;
    if (alreadyRequested || requestState === 'duplicate') {
      Alert.alert('Already Requested', 'You have already sent a join request for this trip.');
      return;
    }

    setRequestState('loading');
    setRequestError(null);

    try {
      await requestService.sendRequest(tripId, message.trim() || undefined);
      if (isMounted.current) {
        setRequestState('sent');
        setAlreadyRequested(true);
      }
    } catch (err: unknown) {
      if (isMounted.current) {
        const msg =
          err instanceof Error ? err.message : 'Failed to send request. Please try again.';
        setRequestError(msg);
        setRequestState('error');
      }
    }
  }, [alreadyRequested, message, requestState, tripId]);

  return {
    checkingRequest,
    alreadyRequested,
    message,
    setMessage,
    requestState,
    requestError,
    sendRequest,
    openPhone,
    openWhatsApp,
  };
}
