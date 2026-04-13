import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

// ─── Form shape ───────────────────────────────────────────────────────────────

export interface ProfileForm {
  name: string;
  city: string;
  whatsapp: string;
  bio: string;
  role: 'rider' | 'traveler';
  avatarUri: string | null;
}

export interface ProfileErrors {
  name?: string;
  city?: string;
  whatsapp?: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProfileSetup(initialPhone = '') {
  const setUser = useAuthStore(s => s.setUser);

  const [form, setForm] = useState<ProfileForm>({
    name: '',
    city: '',
    whatsapp: initialPhone,
    bio: '',
    role: 'traveler',
    avatarUri: null,
  });

  const [errors, setErrors] = useState<ProfileErrors>({});
  const [loading, setLoading] = useState(false);

  // ── handleChange ────────────────────────────────────────────────────────────
  const handleChange = useCallback(
    <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
      setForm(prev => ({ ...prev, [field]: value }));
      // Clear error on change
      if (field in errors) {
        setErrors(prev => { const e = { ...prev }; delete e[field as keyof ProfileErrors]; return e; });
      }
    },
    [errors],
  );

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const newErrors: ProfileErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }
    if (!form.city.trim()) {
      newErrors.city = 'City is required.';
    }
    if (form.whatsapp && !/^[6-9]\d{9}$/.test(form.whatsapp.replace(/\D/g, ''))) {
      newErrors.whatsapp = 'Enter a valid 10-digit WhatsApp number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // ── Image pick ──────────────────────────────────────────────────────────────
  const handleImagePick = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to set a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6, // compress to ~60%
    });

    if (!result.canceled && result.assets.length > 0) {
      handleChange('avatarUri', result.assets[0].uri);
    }
  }, [handleChange]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    if (!validate()) return false;

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        city: form.city.trim(),
        whatsapp: form.whatsapp.replace(/\D/g, '') || undefined,
        bio: form.bio.trim() || undefined,
        role: form.role as UserRole,
        // Photo upload would be handled separately via FormData
      };

      const result = await authService.setupProfile(payload);
      setUser(result.data);
      return true;
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [form, validate, setUser]);

  return { form, errors, loading, handleChange, handleImagePick, handleSubmit };
}

export default useProfileSetup;
