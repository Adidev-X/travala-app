// ─── tripStore ───────────────────────────────────────────────────────────────
// Client-side trip data: search results, my trips, saved trips.
// Uses immer middleware so reducers can mutate draft state directly.
// NOT persisted — trips are always fresh-fetched from the API.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { JoinRequest, Trip, VehicleType } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TripSortOption = 'newest' | 'cheapest' | 'rating';
export type TripFilterOption = VehicleType | 'all';

interface TripState {
  // ── State ──────────────────────────────────────────────────────────────────
  myTrips: Trip[];
  savedTrips: Trip[];
  searchResults: Trip[];
  activeFilter: TripFilterOption;
  activeSort: TripSortOption;

  // ── Setters ────────────────────────────────────────────────────────────────
  setMyTrips: (trips: Trip[]) => void;
  setSearchResults: (trips: Trip[]) => void;
  setSavedTrips: (trips: Trip[]) => void;

  // ── Backward compat (legacy field names) ──────────────────────────────────
  /** @deprecated Use searchResults */
  trips: Trip[];
  /** @deprecated Use setSearchResults */
  setTrips: (trips: Trip[]) => void;
  selectedTrip: Trip | null;
  selectTrip: (trip: Trip | null) => void;
  requests: JoinRequest[];
  setRequests: (requests: JoinRequest[]) => void;
  updateRequest: (requestId: string, partial: Partial<JoinRequest>) => void;

  // ── myTrips mutations ─────────────────────────────────────────────────────
  addTrip: (trip: Trip) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  removeTrip: (tripId: string) => void;

  // ── Saved trips ───────────────────────────────────────────────────────────
  /** Adds if not saved, removes if already saved */
  toggleSave: (tripId: string) => void;

  // ── Filter / sort ─────────────────────────────────────────────────────────
  setFilter: (filter: TripFilterOption) => void;
  setSort: (sort: TripSortOption) => void;

  // ── Derived helpers (not state — call inside components) ──────────────────
  isSaved: (tripId: string) => boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTripStore = create<TripState>()(
  devtools(
    immer((set, get) => ({
      myTrips: [],
      savedTrips: [],
      searchResults: [],
      activeFilter: 'all',
      activeSort: 'newest',
      // legacy
      trips: [],
      selectedTrip: null,
      requests: [],

      // ── Setters ────────────────────────────────────────────────────────────
      setMyTrips: (trips: Trip[]) =>
        set(state => { state.myTrips = trips; }, false, 'trips/setMyTrips'),

      setSearchResults: (trips: Trip[]) =>
        set(state => { state.searchResults = trips; state.trips = trips; }, false, 'trips/setSearchResults'),

      setSavedTrips: (trips: Trip[]) =>
        set(state => { state.savedTrips = trips; }, false, 'trips/setSavedTrips'),

      // legacy
      setTrips: (trips: Trip[]) =>
        set(state => { state.trips = trips; state.searchResults = trips; }, false, 'trips/setTrips'),

      selectTrip: (trip: Trip | null) =>
        set(state => { state.selectedTrip = trip; }, false, 'trips/selectTrip'),

      setRequests: (requests: JoinRequest[]) =>
        set(state => { state.requests = requests; }, false, 'trips/setRequests'),

      updateRequest: (requestId: string, partial: Partial<JoinRequest>) =>
        set(
          state => {
            const idx = state.requests.findIndex(r => r.id === requestId);
            if (idx !== -1) Object.assign(state.requests[idx]!, partial);
          },
          false,
          'trips/updateRequest',
        ),

      // ── myTrips mutations ──────────────────────────────────────────────────
      addTrip: (trip: Trip) =>
        set(
          state => { state.myTrips.unshift(trip); },
          false,
          'trips/addTrip',
        ),

      updateTrip: (tripId: string, updates: Partial<Trip>) =>
        set(
          state => {
            const idx = state.myTrips.findIndex(t => t.id === tripId);
            if (idx !== -1) Object.assign(state.myTrips[idx]!, updates);
            const sidx = state.searchResults.findIndex(t => t.id === tripId);
            if (sidx !== -1) Object.assign(state.searchResults[sidx]!, updates);
          },
          false,
          'trips/updateTrip',
        ),

      removeTrip: (tripId: string) =>
        set(
          state => {
            state.myTrips = state.myTrips.filter(t => t.id !== tripId);
          },
          false,
          'trips/removeTrip',
        ),

      // ── Saved trips ────────────────────────────────────────────────────────
      toggleSave: (tripId: string) =>
        set(
          state => {
            const pos = state.savedTrips.findIndex(t => t.id === tripId);
            if (pos !== -1) {
              state.savedTrips.splice(pos, 1);
            } else {
              // Look for the trip in myTrips or searchResults to copy metadata
              const source =
                state.myTrips.find(t => t.id === tripId) ??
                state.searchResults.find(t => t.id === tripId);
              if (source) state.savedTrips.push(source);
            }
          },
          false,
          'trips/toggleSave',
        ),

      // ── Filter / sort ──────────────────────────────────────────────────────
      setFilter: (filter: TripFilterOption) =>
        set(state => { state.activeFilter = filter; }, false, 'trips/setFilter'),

      setSort: (sort: TripSortOption) =>
        set(state => { state.activeSort = sort; }, false, 'trips/setSort'),

      // ── Derived ────────────────────────────────────────────────────────────
      isSaved: (tripId: string) =>
        get().savedTrips.some(t => t.id === tripId),
    })),
    { name: 'TripStore', enabled: __DEV__ },
  ),
);
