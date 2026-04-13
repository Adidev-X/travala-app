import type { ApiResponse, VerificationStatus } from '../types';
import api from './index';

export const verificationService = {
  /** Get current verification status for the logged-in rider */
  getStatus: async (): Promise<VerificationStatus> => {
    const { data } =
      await api.get<ApiResponse<VerificationStatus>>('/verification/status');
    return data.data;
  },

  /**
   * Upload a document image.
   * @param docType - 'rc' | 'dl' | 'permit'
   * @param formData - multipart/form-data with 'file' field
   */
  uploadDocument: async (
    docType: 'rc' | 'dl' | 'permit',
    formData: FormData,
  ): Promise<ApiResponse<null>> => {
    const { data } = await api.post<ApiResponse<null>>(
      `/verification/upload/${docType}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};
