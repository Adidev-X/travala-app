// ─── Verification Service ─────────────────────────────────────────────────────
// Full multipart upload + status polling for RC / DL / Permit documents.

import type {
    ApiResponse,
    DocumentUploadPayload,
    VehicleType,
    VerificationStatus
} from '../types';
import api from './apiClient';
import { DEMO_VERIFICATION, isDemoMode } from './demoData';

// ─────────────────────────────────────────────────────────────────────────────

export const verificationService = {
  /**
   * Fetch the verified/pending status for all documents belonging to the
   * current rider.  The response now includes per-document rejection reasons
   * and the canonical `canPostTrips` flag that the UI uses as a hard gate.
   */
  getVerificationStatus: async (): Promise<VerificationStatus> => {
    if (isDemoMode()) return DEMO_VERIFICATION;
    const { data } =
      await api.get<ApiResponse<VerificationStatus>>('/verification/status');
    return data.data;
  },

  /**
   * Upload front + back images together with metadata for a single document.
   *
   * Images are passed as local file URIs; the caller (useDocumentUpload hook)
   * must compress them before calling this method.
   *
   * @param payload - docType, vehicleType, frontImage URI, backImage URI,
   *                  docNumber, expiryDate (ISO string)
   */
  uploadDocument: async (
    payload: DocumentUploadPayload,
  ): Promise<ApiResponse<null>> => {
    if (isDemoMode()) return { success: true, data: null, message: 'Demo: document uploaded' };
    const { docType, vehicleType, frontImage, backImage, docNumber, expiryDate } =
      payload;

    const form = new FormData();

    // React-Native FormData accepts { uri, name, type } objects for files.
    form.append('vehicleType', vehicleType);
    form.append('docNumber', docNumber);
    form.append('expiryDate', expiryDate);

    form.append('frontImage', {
      uri: frontImage,
      name: `${docType}_front.jpg`,
      type: 'image/jpeg',
    } as unknown as Blob);

    form.append('backImage', {
      uri: backImage,
      name: `${docType}_back.jpg`,
      type: 'image/jpeg',
    } as unknown as Blob);

    const { data } = await api.post<ApiResponse<null>>(
      `/verification/upload/${docType}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return data;
  },

  /**
   * Set or update the rider's vehicle type.  Called whenever the rider
   * changes the vehicle selector on the Verification screen.
   */
  setVehicleType: async (
    vehicleType: VehicleType,
  ): Promise<ApiResponse<null>> => {
    if (isDemoMode()) return { success: true, data: null, message: 'Demo: vehicle type set' };
    const { data } = await api.patch<ApiResponse<null>>(
      '/verification/vehicle-type',
      { vehicleType },
    );
    return data;
  },
};
