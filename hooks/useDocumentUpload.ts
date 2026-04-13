// ─── useDocumentUpload ────────────────────────────────────────────────────────
// Hook that manages all state and side effects for the document upload screen.
// Image picker uses expo-image-picker with built-in compression
// (maxWidth: 800, quality: 0.8 — per spec).

import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { verificationService } from '../services/verificationService';
import type { DocType, VehicleType } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseDocumentUploadState {
  frontImage: string | null;
  backImage: string | null;
  docNumber: string;
  expiryDate: string;   // ISO date string, e.g. "2027-06-15"
  expiryError: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseDocumentUploadHandlers {
  pickImage: (side: 'front' | 'back') => Promise<void>;
  setDocNumber: (value: string) => void;
  setExpiryDate: (iso: string) => void;
  validateExpiry: (iso: string) => boolean;
  submit: () => Promise<void>;
  resetError: () => void;
}

export type UseDocumentUploadReturn = UseDocumentUploadState &
  UseDocumentUploadHandlers;

// ─── Constants ────────────────────────────────────────────────────────────────

/** Max dimension for compressed image before upload */
const MAX_DIMENSION = 800;
/** JPEG quality 0-1 */
const JPEG_QUALITY = 0.8;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDocumentUpload(
  docType: DocType,
  vehicleType: VehicleType,
): UseDocumentUploadReturn {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [docNumber, setDocNumber] = useState('');
  const [expiryDate, setExpiryDateRaw] = useState('');
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ── Permission helper ──────────────────────────────────────────────────────

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Gallery permission is required to upload documents.');
      return false;
    }
    return true;
  }, []);

  // ── pickImage ──────────────────────────────────────────────────────────────

  const pickImage = useCallback(
    async (side: 'front' | 'back'): Promise<void> => {
      const hasPermission = await ensurePermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: JPEG_QUALITY,
        exif: false,
        base64: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      // If the image is larger than MAX_DIMENSION, scale it down using
      // expo-image-manipulator which is always bundled with expo.
      let finalUri = asset.uri;
      const w = asset.width ?? 0;
      const h = asset.height ?? 0;
      const maxDim = Math.max(w, h);

      if (maxDim > MAX_DIMENSION) {
        try {
          // expo-image-manipulator is available in managed Expo workflows.
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const Manipulator = require('expo-image-manipulator') as {
            manipulateAsync: (
              uri: string,
              actions: { resize: { width: number; height: number } }[],
              options: { compress: number; format: string },
            ) => Promise<{ uri: string }>;
            SaveFormat: { JPEG: string };
          };
          const ratio = MAX_DIMENSION / maxDim;
          const resized = await Manipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: Math.round(w * ratio), height: Math.round(h * ratio) } }],
            { compress: JPEG_QUALITY, format: Manipulator.SaveFormat.JPEG },
          );
          finalUri = resized.uri;
        } catch {
          // expo-image-manipulator not available — use original URI.
        }
      }

      if (side === 'front') {
        setFrontImage(finalUri);
      } else {
        setBackImage(finalUri);
      }
    },
    [ensurePermission],
  );

  // ── validateExpiry ─────────────────────────────────────────────────────────

  const validateExpiry = useCallback((iso: string): boolean => {
    if (!iso) {
      setExpiryError('Expiry date is required.');
      return false;
    }
    const expDate = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(expDate.getTime())) {
      setExpiryError('Invalid date.');
      return false;
    }
    if (expDate < today) {
      setExpiryError('Document has expired. Please upload a valid document.');
      return false;
    }
    setExpiryError(null);
    return true;
  }, []);

  // ── setExpiryDate — validates immediately on change ────────────────────────

  const setExpiryDate = useCallback(
    (iso: string) => {
      setExpiryDateRaw(iso);
      validateExpiry(iso);
    },
    [validateExpiry],
  );

  // ── submit ─────────────────────────────────────────────────────────────────

  const submit = useCallback(async (): Promise<void> => {
    // Guard: images
    if (!frontImage || !backImage) {
      setError('Please upload both front and back images.');
      return;
    }

    // Guard: doc number
    if (!docNumber.trim()) {
      setError('Document number is required.');
      return;
    }

    // Guard: expiry
    const expiryOk = validateExpiry(expiryDate);
    if (!expiryOk) return;

    setLoading(true);
    setError(null);

    try {
      const response = await verificationService.uploadDocument({
        docType,
        vehicleType,
        frontImage,
        backImage,
        docNumber: docNumber.trim(),
        expiryDate,
      });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error ?? 'Upload failed. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [frontImage, backImage, docNumber, expiryDate, docType, vehicleType, validateExpiry]);

  // ── resetError ─────────────────────────────────────────────────────────────

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    frontImage,
    backImage,
    docNumber,
    expiryDate,
    expiryError,
    loading,
    error,
    success,
    // Handlers
    pickImage,
    setDocNumber,
    setExpiryDate,
    validateExpiry,
    submit,
    resetError,
  };
}
