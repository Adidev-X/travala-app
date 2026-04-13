// ─── locationService ─────────────────────────────────────────────────────────
// City autocomplete and location lookup for RideShare.

import type { ApiResponse } from '../types';
import apiClient from './apiClient';

export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
}

export const locationService = {
  /** Search cities by partial name (min 2 chars) */
  searchCities: async (query: string): Promise<City[]> => {
    const { data } = await apiClient.get<ApiResponse<City[]>>(
      '/locations/cities',
      { params: { q: query, limit: 10 } },
    );
    return data.data;
  },
};
