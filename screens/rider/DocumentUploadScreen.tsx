// ─── DocumentUploadScreen ─────────────────────────────────────────────────────
// Handles front + back image capture, doc number, expiry date, and submission
// for a single document (RC / DL / Permit).
//
// Route params: { docType: 'rc'|'dl'|'permit', vehicleType }
// Navigate to this screen via: router.push('/(tabs)/trips/document-upload', {
//   docType: 'rc', vehicleType: 'car'
// })

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import type { DocType, VehicleType } from '../../types';

// ─── Static copy ─────────────────────────────────────────────────────────────

const DOC_META: Record<
  DocType,
  {
    title: string;
    numberLabel: string;
    numberPlaceholder: string;
    instructions: string[];
  }
> = {
  rc: {
    title: 'Upload RC Book',
    numberLabel: 'Registration Number',
    numberPlaceholder: 'e.g. MH 04 AB 1234',
    instructions: [
      'Photograph the entire RC book cover + inner page.',
      'Registration number, owner name, and validity must be clearly visible.',
      'Ensure no glare or shadows cover any text.',
      'File must be in JPG/PNG format (max size 5 MB per side).',
    ],
  },
  dl: {
    title: 'Upload Driving Licence',
    numberLabel: 'Licence Number',
    numberPlaceholder: 'e.g. MH0420230012345',
    instructions: [
      'Capture the front (photo side) and back (address + vehicle class) clearly.',
      'Licence number, name, and expiry date must be legible.',
      'Commercial vehicle class (TRANS) must appear for van / bus drivers.',
      'Ensure the document is not expired before uploading.',
    ],
  },
  permit: {
    title: 'Upload Permit / Fitness',
    numberLabel: 'Permit Number',
    numberPlaceholder: 'e.g. TN 01 2024 P 0001',
    instructions: [
      'Upload the commercial / tourist permit issued by the RTO.',
      'All dates and stamp seals must be visible.',
      'For buses, the fitness certificate must also be included on the back side.',
      'Expired permits will be rejected automatically.',
    ],
  },
};

// ─── ImageUploadBox ───────────────────────────────────────────────────────────

interface ImageUploadBoxProps {
  side: 'front' | 'back';
  uri: string | null;
  onPress: () => void;
}

const ImageUploadBox = React.memo<ImageUploadBoxProps>(
  ({ side, uri, onPress }) => (
    <TouchableOpacity
      style={[styles.imageBox, uri ? styles.imageBoxFilled : null]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.imagePreview} resizeMode="cover" />
          <View style={styles.imageOverlay}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.imageOverlayText}>Tap to replace</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.imageIconWrap}>
            <Ionicons name="camera-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.imageLabel}>
            {side === 'front' ? 'Front side' : 'Back side'}
          </Text>
          <Text style={styles.imageSub}>Tap to upload</Text>
        </>
      )}
    </TouchableOpacity>
  ),
);
ImageUploadBox.displayName = 'ImageUploadBox';

// ─── DateRow ──────────────────────────────────────────────────────────────────
// Simple year-month-day input that immediately validates expiry on change.
// Replace with a proper DateTimePicker if preferred.

interface DateRowProps {
  value: string;
  error: string | null;
  onChangeDate: (iso: string) => void;
}

const DateRow = React.memo<DateRowProps>(({ value, error, onChangeDate }) => {
  const handleChange = useCallback(
    (text: string) => {
      // Allow user to type YYYY-MM-DD freely; validate on each key stroke.
      onChangeDate(text);
    },
    [onChangeDate],
  );

  return (
    <View>
      <Text style={styles.fieldLabel}>Expiry Date</Text>
      <TextInput
        style={[styles.textInput, error ? styles.textInputError : null]}
        value={value}
        onChangeText={handleChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.text.hint}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />
      {error ? (
        <View style={styles.fieldErrorRow}>
          <Ionicons name="alert-circle-outline" size={13} color={colors.danger} />
          <Text style={styles.fieldError}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
});
DateRow.displayName = 'DateRow';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DocumentUploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    docType: DocType;
    vehicleType: VehicleType;
  }>();

  const docType = params.docType ?? 'rc';
  const vehicleType = params.vehicleType ?? 'car';
  const meta = DOC_META[docType];

  const {
    frontImage,
    backImage,
    docNumber,
    expiryDate,
    expiryError,
    loading,
    error,
    success,
    pickImage,
    setDocNumber,
    setExpiryDate,
    submit,
  } = useDocumentUpload(docType, vehicleType);

  // Navigate back automatically on success
  useEffect(() => {
    if (success) {
      Alert.alert(
        'Submitted!',
        'Your document has been submitted for review. You will be notified within 24–48 hours.',
        [{ text: 'OK', onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)/trips') }],
      );
    }
  }, [success, router]);

  // Show API error as alert
  useEffect(() => {
    if (error) {
      Alert.alert('Upload Failed', error);
    }
  }, [error]);

  const handlePickFront = useCallback(() => pickImage('front'), [pickImage]);
  const handlePickBack = useCallback(() => pickImage('back'), [pickImage]);

  const canSubmit =
    !!frontImage && !!backImage && !!docNumber.trim() && !!expiryDate && !expiryError;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <Text style={styles.screenTitle}>{meta.title}</Text>
        <Text style={styles.vehicleTag}>
          Vehicle type: <Text style={styles.vehicleTagBold}>{vehicleType.toUpperCase()}</Text>
        </Text>

        {/* ── Instructions ── */}
        <View style={styles.instructionsBox}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="information-circle-outline" size={18} color={colors.secondary} />
            <Text style={styles.instructionsTitle}>What to photograph</Text>
          </View>
          {meta.instructions.map((line, i) => (
            <View key={i} style={styles.instructionRow}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={styles.instructionText}>{line}</Text>
            </View>
          ))}
        </View>

        {/* ── Image upload boxes ── */}
        <Text style={styles.sectionTitle}>Upload Images</Text>
        <View style={styles.imageRow}>
          <ImageUploadBox side="front" uri={frontImage} onPress={handlePickFront} />
          <ImageUploadBox side="back" uri={backImage} onPress={handlePickBack} />
        </View>

        {/* ── Document number ── */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>{meta.numberLabel}</Text>
          <TextInput
            style={styles.textInput}
            value={docNumber}
            onChangeText={setDocNumber}
            placeholder={meta.numberPlaceholder}
            placeholderTextColor={colors.text.hint}
            autoCapitalize="characters"
            returnKeyType="next"
          />
        </View>

        {/* ── Expiry date ── */}
        <View style={styles.fieldWrap}>
          <DateRow
            value={expiryDate}
            error={expiryError}
            onChangeDate={setExpiryDate}
          />
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!canSubmit || loading) && styles.submitBtnDisabled,
          ]}
          onPress={submit}
          disabled={!canSubmit || loading}
          activeOpacity={0.82}
        >
          {loading ? (
            <Text style={styles.submitBtnText}>Uploading…</Text>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Submit for Verification</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── Bottom note ── */}
        <Text style={styles.noteText}>
          Once submitted, documents are reviewed by our team within 24–48 hours.
          You will receive a notification with the result.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },

  screenTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  vehicleTag: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  vehicleTagBold: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary,
  },

  // Instructions
  instructionsBox: {
    backgroundColor: `${colors.secondary}0f`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.secondary}30`,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  instructionsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.secondary,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: 4,
  },
  instructionBullet: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginTop: 1,
  },
  instructionText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  // Images
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  imageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  imageBox: {
    flex: 1,
    height: 140,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  imageBoxFilled: {
    borderStyle: 'solid',
    borderColor: colors.primary,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  imageOverlayText: {
    fontSize: fontSize.xs,
    color: '#fff',
    fontWeight: fontWeight.medium,
  },
  imageIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}14`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  imageLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },
  imageSub: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
    marginTop: 2,
  },

  // Fields
  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: fontSize.md,
    color: colors.text.primary,
    backgroundColor: colors.card,
  },
  textInputError: {
    borderColor: colors.danger,
  },
  fieldErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  fieldError: {
    fontSize: fontSize.xs,
    color: colors.danger,
  },

  // Submit
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },

  noteText: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
    textAlign: 'center',
    lineHeight: 18,
  },
});
