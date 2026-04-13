/**
 * SafetyScreen — Manual safety tools only.
 * NO GPS. NO location. NO real-time tracking — ever.
 *
 * Sections:
 *  1. Large pulsing SOS button → calls emergency contact or 112
 *  2. Share Trip Details (text-only, no location)
 *  3. Emergency Contacts (AsyncStorage, max 2, add/edit/remove)
 *  4. Safety Tips accordion (3 tips, collapsed by default)
 */
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SOSButton from '@/components/SOSButton';
import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import { useSafety, type EmergencyContact } from '@/hooks/useSafety';
import type { Trip } from '@/types';

// ─── Safety tips ──────────────────────────────────────────────────────────────

interface SafetyTip { id: string; icon: string; title: string; body: string; }

const SAFETY_TIPS: SafetyTip[] = [
  {
    id: 'tip1',
    icon: '📋',
    title: 'Verify before you travel',
    body: 'Always confirm the rider\'s RC and driving licence are verified in their profile. Never board a vehicle with a rider whose documents are not verified.',
  },
  {
    id: 'tip2',
    icon: '📱',
    title: 'Share your trip details',
    body: 'Use the "Share Trip Details" button above to send your route and vehicle information to a trusted person before departure. No app access is needed on their end.',
  },
  {
    id: 'tip3',
    icon: '🤝',
    title: 'Meet in public first',
    body: 'For full-tour trips, arrange a brief meeting in a well-lit public place before the journey starts. Use the in-app contact feature to coordinate.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Tip accordion row
// ─────────────────────────────────────────────────────────────────────────────

const TipRow = memo(function TipRow({ tip }: { tip: SafetyTip }) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    const toValue = open ? 0 : 1;
    Animated.timing(anim, { toValue, duration: 220, useNativeDriver: false }).start();
    setOpen(p => !p);
  }, [open, anim]);

  const maxHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 130] });
  const opacity   = anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] });

  return (
    <View style={tipSty.row}>
      <TouchableOpacity
        style={tipSty.header}
        onPress={toggle}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}>
        <Text style={tipSty.icon}>{tip.icon}</Text>
        <Text style={tipSty.title} numberOfLines={1}>{tip.title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.text.hint} />
      </TouchableOpacity>
      <Animated.View style={{ maxHeight, overflow: 'hidden' }}>
        <Animated.Text style={[tipSty.body, { opacity }]}>{tip.body}</Animated.Text>
      </Animated.View>
    </View>
  );
});

const tipSty = StyleSheet.create({
  row:    { borderBottomWidth: 1, borderBottomColor: colors.border },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  icon:   { fontSize: fontSize.lg, marginRight: spacing.sm },
  title:  { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text.primary },
  body:   { fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 20, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
});

// ─────────────────────────────────────────────────────────────────────────────
//  Contact row
// ─────────────────────────────────────────────────────────────────────────────

interface ContactRowProps {
  contact:  EmergencyContact;
  onEdit:   (c: EmergencyContact) => void;
  onRemove: (id: string) => void;
}

const ContactRow = memo(function ContactRow({ contact, onEdit, onRemove }: ContactRowProps) {
  const confirmRemove = useCallback(() => {
    Alert.alert(
      'Remove contact?',
      `Remove ${contact.name} from emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemove(contact.id) },
      ],
    );
  }, [contact, onRemove]);

  return (
    <View style={ctSty.row}>
      <View style={ctSty.avatar}>
        <Text style={ctSty.avatarText}>{contact.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={ctSty.info}>
        <Text style={ctSty.name}>{contact.name}</Text>
        <Text style={ctSty.meta}>{contact.relation} · {contact.phone}</Text>
      </View>
      <TouchableOpacity onPress={() => onEdit(contact)} style={ctSty.iconBtn} accessibilityLabel="Edit contact">
        <Ionicons name="pencil-outline" size={18} color={colors.secondary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={confirmRemove} style={ctSty.iconBtn} accessibilityLabel="Remove contact">
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
});

const ctSty = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  avatarText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  info:       { flex: 1 },
  name:       { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text.primary },
  meta:       { fontSize: fontSize.sm, color: colors.text.hint, marginTop: 2 },
  iconBtn:    { padding: spacing.sm },
});

// ─────────────────────────────────────────────────────────────────────────────
//  Add / Edit contact modal
// ─────────────────────────────────────────────────────────────────────────────

interface ContactModalProps {
  visible:  boolean;
  initial?: EmergencyContact | null;
  onSave:   (data: Omit<EmergencyContact, 'id'>) => void;
  onClose:  () => void;
}

const EMPTY = { name: '', relation: '', phone: '' };

const ContactModal = memo(function ContactModal({ visible, initial, onSave, onClose }: ContactModalProps) {
  const [form, setForm] = useState(EMPTY);

  React.useEffect(() => {
    if (visible) {
      setForm(initial ? { name: initial.name, relation: initial.relation, phone: initial.phone } : EMPTY);
    }
  }, [visible, initial]);

  const handleSave = useCallback(() => {
    const name     = form.name.trim();
    const relation = form.relation.trim();
    const phone    = form.phone.trim();
    if (!name)                         { Alert.alert('Required', 'Please enter a name.');           return; }
    if (!relation)                     { Alert.alert('Required', 'Please enter the relation.');     return; }
    if (!phone || phone.length < 10)   { Alert.alert('Invalid', 'Enter a valid 10-digit number.'); return; }
    onSave({ name, relation, phone });
  }, [form, onSave]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={mdSty.overlay}>
        <Pressable style={mdSty.backdrop} onPress={onClose} />
        <View style={mdSty.sheet}>
          <View style={mdSty.handle} />
          <Text style={mdSty.heading}>{initial ? 'Edit Contact' : 'Add Emergency Contact'}</Text>

          <Text style={mdSty.label}>Full Name</Text>
          <TextInput style={mdSty.input} placeholder="e.g. Priya Sharma" placeholderTextColor={colors.text.hint}
            value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} autoCapitalize="words" returnKeyType="next" />

          <Text style={mdSty.label}>Relation</Text>
          <TextInput style={mdSty.input} placeholder="e.g. Mother, Friend" placeholderTextColor={colors.text.hint}
            value={form.relation} onChangeText={v => setForm(p => ({ ...p, relation: v }))} autoCapitalize="words" returnKeyType="next" />

          <Text style={mdSty.label}>Phone Number</Text>
          <TextInput style={mdSty.input} placeholder="10-digit mobile number" placeholderTextColor={colors.text.hint}
            value={form.phone} onChangeText={v => setForm(p => ({ ...p, phone: v.replace(/\D/g, '').slice(0, 10) }))}
            keyboardType="phone-pad" maxLength={10} returnKeyType="done" />

          <View style={mdSty.btnRow}>
            <TouchableOpacity style={[mdSty.btn, mdSty.cancelBtn]} onPress={onClose} activeOpacity={0.75}>
              <Text style={mdSty.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[mdSty.btn, mdSty.saveBtn]} onPress={handleSave} activeOpacity={0.75}>
              <Text style={mdSty.saveText}>{initial ? 'Save Changes' : 'Add Contact'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const mdSty = StyleSheet.create({
  overlay:    { flex: 1, justifyContent: 'flex-end' },
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:      { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginVertical: spacing.sm },
  heading:    { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.lg },
  label:      { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.secondary, marginBottom: spacing.xs },
  input:      { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.sm + 4, fontSize: fontSize.md, color: colors.text.primary, backgroundColor: colors.background, marginBottom: spacing.md },
  btnRow:     { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  btn:        { flex: 1, paddingVertical: spacing.sm + 4, borderRadius: 10, alignItems: 'center' },
  cancelBtn:  { borderWidth: 1, borderColor: colors.border },
  cancelText: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text.secondary },
  saveBtn:    { backgroundColor: colors.primary },
  saveText:   { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.white },
});

// ─────────────────────────────────────────────────────────────────────────────
//  Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function SafetyScreen() {
  // Optional serialised Trip passed via route params from trip-detail screen
  const params = useLocalSearchParams<{ tripData?: string }>();
  const trip: Trip | null = (() => {
    try { return params.tripData ? (JSON.parse(params.tripData) as Trip) : null; }
    catch { return null; }
  })();

  const {
    contacts, canAddMore,
    addContact, removeContact, editContact,
    triggerSOS, shareTrip,
  } = useSafety();

  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget,   setEditTarget]   = useState<EmergencyContact | null>(null);

  // ── Contact modal ─────────────────────────────────────────────────────────

  const openAdd = useCallback(() => {
    if (!canAddMore) { Alert.alert('Limit reached', 'You can add at most 2 emergency contacts.'); return; }
    setEditTarget(null);
    setModalVisible(true);
  }, [canAddMore]);

  const openEdit = useCallback((c: EmergencyContact) => {
    setEditTarget(c);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(async (data: Omit<EmergencyContact, 'id'>) => {
    if (editTarget) await editContact(editTarget.id, data);
    else            await addContact(data);
    setModalVisible(false);
  }, [editTarget, addContact, editContact]);

  // ── Share trip ────────────────────────────────────────────────────────────

  const handleShareTrip = useCallback(() => {
    if (!trip) {
      Alert.alert('No active trip', 'Open this screen from a trip detail page to share trip information.');
      return;
    }
    shareTrip(trip);
  }, [trip, shareTrip]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={sty.flex}>
      <ScrollView
        style={sty.container}
        contentContainerStyle={sty.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ①  SOS */}
        <View style={sty.section}>
          <View style={sty.sosBox}>
            <SOSButton onPress={triggerSOS} />
            <Text style={sty.sosSubLabel}>Calls your emergency contact</Text>
            <Text style={sty.sosHint}>
              {contacts.length > 0
                ? `Will call ${contacts[0].name} (${contacts[0].relation})`
                : 'No contact set — will call 112'}
            </Text>
          </View>
        </View>

        {/* ②  Share Trip */}
        <View style={sty.section}>
          <Text style={sty.sectionTitle}>Trip Safety</Text>
          <TouchableOpacity
            style={[sty.shareBtn, !trip && sty.shareBtnOff]}
            onPress={handleShareTrip}
            activeOpacity={0.8}>
            <Ionicons
              name="share-social-outline"
              size={22}
              color={trip ? colors.white : colors.text.hint}
              style={{ marginRight: spacing.sm }}
            />
            <View style={sty.flex}>
              <Text style={[sty.shareBtnLbl, !trip && sty.shareBtnLblOff]}>Share Trip Details</Text>
              <Text style={[sty.shareBtnSub, !trip && { color: colors.text.hint }]} numberOfLines={1}>
                {trip ? `${trip.from} → ${trip.to}  ·  ${trip.startDate.slice(0, 10)}` : 'Open from a trip page to share'}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={sty.noGpsRow}>
            <Ionicons name="location-outline" size={12} color={colors.text.hint} />
            <Text style={sty.noGpsTxt}>  No location data — only route &amp; vehicle info is shared</Text>
          </View>
        </View>

        {/* ③  Emergency Contacts */}
        <View style={sty.section}>
          <View style={sty.sectionRow}>
            <Text style={sty.sectionTitle}>Emergency Contacts</Text>
            <Text style={sty.sectionCount}>{contacts.length}/2</Text>
          </View>
          <View style={sty.card}>
            {contacts.length > 0 ? (
              <>
                <FlatList
                  data={contacts}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <ContactRow contact={item} onEdit={openEdit} onRemove={removeContact} />
                  )}
                  ItemSeparatorComponent={() => <View style={sty.sep} />}
                />
                {canAddMore && <View style={sty.sep} />}
              </>
            ) : (
              <View style={sty.emptyCtBox}>
                <Ionicons name="people-outline" size={32} color={colors.text.hint} />
                <Text style={sty.emptyCtTitle}>No emergency contacts added</Text>
                <Text style={sty.emptyCtHint}>Add up to 2 contacts. SOS will call them first.</Text>
              </View>
            )}
            {canAddMore && (
              <TouchableOpacity style={sty.addCtBtn} onPress={openAdd} activeOpacity={0.75}>
                <Ionicons name="person-add-outline" size={18} color={colors.primary} />
                <Text style={sty.addCtTxt}>Add Contact</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ④  Safety Tips */}
        <View style={sty.section}>
          <Text style={sty.sectionTitle}>Safety Tips</Text>
          <View style={sty.card}>
            {SAFETY_TIPS.map(tip => <TipRow key={tip.id} tip={tip} />)}
          </View>
        </View>

        {/* Footer */}
        <View style={sty.footer}>
          <Ionicons name="shield-checkmark-outline" size={13} color={colors.text.hint} />
          <Text style={sty.footerTxt}>  No location or real-time tracking is ever used by RideShare.</Text>
        </View>
      </ScrollView>

      {/* Modal sits outside ScrollView so keyboard-avoid works correctly */}
      <ContactModal
        visible={modalVisible}
        initial={editTarget}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sty = StyleSheet.create({
  flex:          { flex: 1 },
  container:     { flex: 1, backgroundColor: colors.background },
  content:       { paddingBottom: spacing.xxl },

  section:       { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  sectionRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle:  { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.sm },
  sectionCount:  { fontSize: fontSize.sm, color: colors.text.hint },

  // SOS card
  sosBox:        { alignItems: 'center', paddingVertical: spacing.xl + spacing.md, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  sosSubLabel:   { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text.primary, marginTop: spacing.lg },
  sosHint:       { fontSize: fontSize.sm, color: colors.text.hint, marginTop: spacing.xs },

  // Share
  shareBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md + 2 },
  shareBtnOff:   { backgroundColor: colors.border },
  shareBtnLbl:   { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.white },
  shareBtnLblOff:{ color: colors.text.hint },
  shareBtnSub:   { fontSize: fontSize.xs, color: `${colors.white}BB`, marginTop: 2 },
  noGpsRow:      { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  noGpsTxt:      { fontSize: fontSize.xs, color: colors.text.hint },

  // Card
  card:          { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  sep:           { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },

  // Empty contacts
  emptyCtBox:    { alignItems: 'center', paddingVertical: spacing.xl },
  emptyCtTitle:  { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text.secondary, marginTop: spacing.sm },
  emptyCtHint:   { fontSize: fontSize.sm, color: colors.text.hint, marginTop: spacing.xs, textAlign: 'center', paddingHorizontal: spacing.lg },

  // Add contact
  addCtBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.xs },
  addCtTxt:      { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.primary },

  // Footer
  footer:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, marginTop: spacing.xl },
  footerTxt:     { fontSize: fontSize.xs, color: colors.text.hint },
});
