// ─── useImagePicker ──────────────────────────────────────────────────────────
// Wraps expo-image-picker with optional compression via expo-image-manipulator.
// Requests permissions, compresses to max-width 800 / quality 0.8.

import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  type?: string;
}

export interface UseImagePickerReturn {
  pickImage: (options?: ImagePicker.ImagePickerOptions) => Promise<PickedImage | null>;
  pickMultiple: (max?: number) => Promise<PickedImage[]>;
  loading: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_WIDTH   = 800;
const QUALITY     = 0.8;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function compressAsset(
  asset: ImagePicker.ImagePickerAsset,
): Promise<PickedImage> {
  const result = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: MAX_WIDTH } }],
    { compress: QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );
  return {
    uri:      result.uri,
    width:    result.width,
    height:   result.height,
    fileSize: asset.fileSize,
    type:     'image/jpeg',
  };
}

async function requestPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useImagePicker(): UseImagePickerReturn {
  const [loading, setLoading] = useState(false);

  const pickImage = useCallback(
    async (
      options?: ImagePicker.ImagePickerOptions,
    ): Promise<PickedImage | null> => {
      const permitted = await requestPermission();
      if (!permitted) return null;

      setLoading(true);
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 1, // we compress ourselves below
          ...options,
        });

        if (result.canceled || result.assets.length === 0) return null;
        return await compressAsset(result.assets[0]!);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const pickMultiple = useCallback(
    async (max: number = 5): Promise<PickedImage[]> => {
      const permitted = await requestPermission();
      if (!permitted) return [];

      setLoading(true);
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          selectionLimit: max,
          quality: 1,
        });

        if (result.canceled) return [];
        return await Promise.all(result.assets.map(compressAsset));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { pickImage, pickMultiple, loading };
}
