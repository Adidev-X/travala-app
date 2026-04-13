// ─── TagInput ─────────────────────────────────────────────────────────────────
// Chip-based tag input. Press Enter or comma to add a tag; tap × to remove.
// React.memo + memoised handlers for perf in large forms.

import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import { fontSize, fontWeight } from '../constants/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  maxTags?: number;
  error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const TagInput = memo<TagInputProps>(function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder = 'Add tag…',
  maxTags,
  error,
}) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const canAdd = maxTags === undefined || tags.length < maxTags;

  const commit = useCallback(
    (raw: string) => {
      const value = raw.trim().replace(/,+$/, '').trim();
      if (!value || !canAdd) return;
      // Avoid duplicates (case-insensitive)
      if (tags.some(t => t.toLowerCase() === value.toLowerCase())) {
        setText('');
        return;
      }
      onAdd(value);
      setText('');
    },
    [tags, canAdd, onAdd],
  );

  const handleChangeText = useCallback(
    (val: string) => {
      // Trigger add on comma
      if (val.endsWith(',')) {
        commit(val.slice(0, -1));
      } else {
        setText(val);
      }
    },
    [commit],
  );

  const handleSubmitEditing = useCallback(() => {
    commit(text);
  }, [commit, text]);

  const handleRemove = useCallback(
    (idx: number) => onRemove(idx),
    [onRemove],
  );

  return (
    <View style={[styles.wrapper, error ? styles.wrapperError : null]}>
      {/* Tag chips */}
      {tags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
          keyboardShouldPersistTaps="handled"
        >
          {tags.map((tag, idx) => (
            <View key={`${tag}-${idx}`} style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>
                {tag}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemove(idx)}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Text input */}
      {canAdd && (
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmitEditing}
          placeholder={
            maxTags !== undefined && tags.length >= maxTags
              ? `Max ${maxTags} tags`
              : placeholder
          }
          placeholderTextColor={colors.text.hint}
          blurOnSubmit={false}
          returnKeyType="done"
        />
      )}

      {/* Hint */}
      <Text style={styles.hint}>
        {canAdd
          ? 'Press Enter or comma (,) to add'
          : `Max ${maxTags} tags reached`}
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

export default TagInput;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs + 2,
    backgroundColor: colors.card,
  },
  wrapperError: {
    borderColor: colors.danger,
  },

  chipsScroll: {
    marginBottom: spacing.xs,
  },
  chipsContent: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.primary}18`,
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.primary,
    maxWidth: 120,
  },

  input: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: 2,
  },

  hint: {
    fontSize: 10,
    color: colors.text.hint,
    marginTop: 2,
    marginLeft: 2,
  },

  errorText: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: 4,
  },
});
