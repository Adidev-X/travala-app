// ─── VerificationScreen ───────────────────────────────────────────────────────
// Status-overview screen for rider document verification.
//
// • Vehicle type selector (Car / Bike / Van / Bus)
// • Verification checklist with per-doc status rows
// • Progress bar (X of Y docs approved)
// • Context-sensitive info banners (All OK / Pending / Rejected)
// • Hard-gate copy: rider cannot post trips until rc + dl are approved

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import DocumentStatusRow from '../../components/DocumentStatusRow';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { verificationService } from '../../services/verificationService';
import type {
    DocType,
    DocumentStatus,
    VehicleType,
    VerificationDocument,
    VerificationStatus,
} from '../../types';

// ─── Vehicle type config ──────────────────────────────────────────────────────

type VehicleOption = { type: VehicleType; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] };

const VEHICLE_OPTIONS: VehicleOption[] = [
  { type: 'car',  label: 'Car',  icon: 'car-outline' },
  { type: 'bike', label: 'Bike', icon: 'bicycle-outline' },
  { type: 'van',  label: 'Van',  icon: 'bus-outline' },
  { type: 'bus',  label: 'Bus',  icon: 'bus-outline' },
];

/** Van + Bus require a Permit on top of RC + DL */
const PERMIT_REQUIRED: VehicleType[] = ['van', 'bus'];

// ─── Banner state derivation ──────────────────────────────────────────────────

type BannerState = 'all_approved' | 'some_rejected' | 'pending' | 'not_started';

function deriveBannerState(
  status: VerificationStatus,
  vehicleType: VehicleType,
): BannerState {
  const permRequired = PERMIT_REQUIRED.includes(vehicleType);
  const docs: DocumentStatus[] = [
    status.rc.status,
    status.dl.status,
    ...(permRequired && status.permit ? [status.permit.status] : []),
  ];

  if (docs.every(s => s === 'approved')) return 'all_approved';
  if (docs.some(s => s === 'rejected'))  return 'some_rejected';
  if (docs.some(s => s === 'pending'))   return 'pending';
  return 'not_started';
}

// ─── Empty / default verification status ─────────────────────────────────────

const EMPTY_DOC: VerificationDocument = { status: 'not_uploaded' };

const DEFAULT_STATUS: VerificationStatus = {
  vehicleType: 'car',
  rc: EMPTY_DOC,
  dl: EMPTY_DOC,
  canPostTrips: false,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface VehicleChipProps {
  option: VehicleOption;
  selected: boolean;
  onPress: (type: VehicleType) => void;
}

const VehicleChip = React.memo<VehicleChipProps>(({ option, selected, onPress }) => {
  const handlePress = useCallback(() => onPress(option.type), [onPress, option.type]);
  return (
    <TouchableOpacity
      style={[styles.vehicleChip, selected && styles.vehicleChipSelected]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <Ionicons
        name={option.icon}
        size={16}
        color={selected ? '#fff' : colors.text.secondary}
      />
      <Text style={[styles.vehicleChipText, selected && styles.vehicleChipTextSelected]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );
});
VehicleChip.displayName = 'VehicleChip';

// ─── ProgressBar ──────────────────────────────────────────────────────────────

interface ProgressBarProps { approved: number; total: number }

const ProgressBar = React.memo<ProgressBarProps>(({ approved, total }) => {
  const pct = total === 0 ? 0 : Math.round((approved / total) * 100);
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>
          {approved} of {total} documents verified
        </Text>
        <Text style={styles.progressPct}>{pct}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` as `${number}%` }]} />
      </View>
    </View>
  );
});
ProgressBar.displayName = 'ProgressBar';

// ─── Banner ───────────────────────────────────────────────────────────────────

interface BannerProps {
  bannerState: BannerState;
  rejectedDocs: { docName: string; reason?: string }[];
}

const Banner = React.memo<BannerProps>(({ bannerState, rejectedDocs }) => {
  if (bannerState === 'all_approved') {
    return (
      <View style={[styles.banner, styles.bannerSuccess]}>
        <Ionicons name="shield-checkmark-outline" size={26} color={colors.success} />
        <View style={styles.bannerText}>
          <Text style={[styles.bannerTitle, { color: colors.success }]}>
            You can now post trips!
          </Text>
          <Text style={styles.bannerBody}>
            All required documents have been verified by our team.
          </Text>
        </View>
      </View>
    );
  }

  if (bannerState === 'pending') {
    return (
      <View style={[styles.banner, styles.bannerInfo]}>
        <Ionicons name="time-outline" size={26} color={colors.secondary} />
        <View style={styles.bannerText}>
          <Text style={[styles.bannerTitle, { color: colors.secondary }]}>
            Under review — 24–48 hours
          </Text>
          <Text style={styles.bannerBody}>
            Our team is reviewing your documents. You will be notified once done.
          </Text>
        </View>
      </View>
    );
  }

  if (bannerState === 'some_rejected') {
    return (
      <View style={[styles.banner, styles.bannerDanger]}>
        <Ionicons name="alert-circle-outline" size={26} color={colors.danger} />
        <View style={styles.bannerText}>
          <Text style={[styles.bannerTitle, { color: colors.danger }]}>
            Action required
          </Text>
          {rejectedDocs.map(d => (
            <Text key={d.docName} style={styles.bannerDangerBody} numberOfLines={2}>
              {d.docName}: {d.reason ?? 'Rejected — please re-upload.'}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  // not_started
  return (
    <View style={[styles.banner, styles.bannerWarning]}>
      <Ionicons name="shield-outline" size={26} color={colors.warning} />
      <View style={styles.bannerText}>
        <Text style={[styles.bannerTitle, { color: colors.warning }]}>
          Verification required
        </Text>
        <Text style={styles.bannerBody}>
          Upload RC Book and Driving Licence to unlock trip posting.
        </Text>
      </View>
    </View>
  );
});
Banner.displayName = 'Banner';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VerificationScreen() {
  const router = useRouter();

  const [verStatus, setVerStatus] = useState<VerificationStatus>(DEFAULT_STATUS);
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [loading, setLoading] = useState(true);
  const [savingVehicle, setSavingVehicle] = useState(false);

  // ── Fetch status on mount ──────────────────────────────────────────────────

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const status = await verificationService.getVerificationStatus();
      setVerStatus(status);
      setVehicleType(status.vehicleType);
    } catch {
      // Network error — keep default / stale state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // ── Vehicle type change ────────────────────────────────────────────────────

  const handleVehicleChange = useCallback(
    async (type: VehicleType) => {
      if (type === vehicleType) return;
      setVehicleType(type);
      setSavingVehicle(true);
      try {
        await verificationService.setVehicleType(type);
        await loadStatus();
      } finally {
        setSavingVehicle(false);
      }
    },
    [vehicleType, loadStatus],
  );

  // ── Navigate to upload screen ──────────────────────────────────────────────

  const handleUpload = useCallback(
    (docType: DocType) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push({
        pathname: '/(tabs)/trips/document-upload' as any,
        params: { docType, vehicleType },
      });
    },
    [router, vehicleType],
  );

  // ── Derive doc list ────────────────────────────────────────────────────────

  const permRequired = PERMIT_REQUIRED.includes(vehicleType);

  interface DocRow {
    docType: DocType;
    docName: string;
    doc: VerificationDocument;
  }

  const docRows: DocRow[] = useMemo(() => {
    const rows: DocRow[] = [
      { docType: 'rc',  docName: 'RC Book',          doc: verStatus.rc },
      { docType: 'dl',  docName: 'Driving Licence',  doc: verStatus.dl },
    ];
    if (permRequired) {
      rows.push({
        docType: 'permit',
        docName: 'Permit / Fitness',
        doc: verStatus.permit ?? EMPTY_DOC,
      });
    }
    return rows;
  }, [verStatus, permRequired]);

  const approvedCount = useMemo(
    () => docRows.filter(r => r.doc.status === 'approved').length,
    [docRows],
  );

  const bannerState = useMemo(
    () => deriveBannerState(verStatus, vehicleType),
    [verStatus, vehicleType],
  );

  const rejectedDocs = useMemo(
    () =>
      docRows
        .filter(r => r.doc.status === 'rejected')
        .map(r => ({ docName: r.docName, reason: r.doc.rejectionReason })),
    [docRows],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading verification status…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Section: Vehicle type ── */}
      <Text style={styles.sectionTitle}>Vehicle Type</Text>
      <View style={styles.vehicleRow}>
        {VEHICLE_OPTIONS.map(opt => (
          <VehicleChip
            key={opt.type}
            option={opt}
            selected={vehicleType === opt.type}
            onPress={handleVehicleChange}
          />
        ))}
      </View>
      {savingVehicle && (
        <Text style={styles.savingText}>Saving vehicle type…</Text>
      )}

      {/* ── Progress bar ── */}
      <ProgressBar approved={approvedCount} total={docRows.length} />

      {/* ── Banner ── */}
      <Banner bannerState={bannerState} rejectedDocs={rejectedDocs} />

      {/* ── Hard-gate notice ── */}
      {!verStatus.canPostTrips && (
        <View style={styles.hardGateBanner}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.warning} />
          <Text style={styles.hardGateText}>
            Trip posting is locked until RC Book and Driving Licence are approved.
          </Text>
        </View>
      )}

      {/* ── Document checklist ── */}
      <Text style={styles.sectionTitle}>Documents</Text>

      {docRows.map(({ docType, docName, doc }) => (
        <DocumentStatusRow
          key={docType}
          docName={docName}
          status={doc.status}
          rejectionReason={doc.rejectionReason}
          onUpload={() => handleUpload(docType)}
          onView={
            doc.status === 'pending' || doc.status === 'approved'
              ? () => handleUpload(docType)
              : undefined
          }
        />
      ))}

      {/* ── Footer note ── */}
      <View style={styles.footerNote}>
        <Ionicons name="information-circle-outline" size={14} color={colors.text.hint} />
        <Text style={styles.footerNoteText}>
          Documents are reviewed within 24 hours. Original documents must match
          vehicle and owner details.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { padding: spacing.md, paddingBottom: spacing.xxl },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  loadingText: { fontSize: fontSize.sm, color: colors.text.hint },

  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  // Vehicle type chips
  vehicleRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  vehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  vehicleChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  vehicleChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  vehicleChipTextSelected: { color: '#fff' },
  savingText: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
    marginBottom: spacing.sm,
  },

  // Progress
  progressWrap: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: { fontSize: fontSize.sm, color: colors.text.secondary },
  progressPct:   { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.primary },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: `${colors.primary}22` },
  progressFill:  { height: 6, borderRadius: 3, backgroundColor: colors.primary },

  // Banners
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
  },
  bannerSuccess: { backgroundColor: `${colors.success}12`, borderColor: `${colors.success}40` },
  bannerInfo:    { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  bannerDanger:  { backgroundColor: `${colors.danger}0d`, borderColor: `${colors.danger}44` },
  bannerWarning: { backgroundColor: `${colors.warning}0d`, borderColor: `${colors.warning}44` },
  bannerText:    { flex: 1 },
  bannerTitle:   { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, marginBottom: 2 },
  bannerBody:    { fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 18 },
  bannerDangerBody: { fontSize: fontSize.xs, color: colors.danger, lineHeight: 17, marginTop: 2 },

  // Hard gate
  hardGateBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: `${colors.warning}14`,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.warning}44`,
  },
  hardGateText: { flex: 1, fontSize: fontSize.xs, color: colors.warning, lineHeight: 17 },

  // Footer
  footerNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.sm },
  footerNoteText: { flex: 1, fontSize: fontSize.xs, color: colors.text.hint, lineHeight: 18 },
});
