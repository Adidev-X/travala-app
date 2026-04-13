# RideShare — Project Structure Reference

> **Stack:** Expo + expo-router · TypeScript · Zustand · Axios  
> **Rules:** No live GPS · No payments · Alias `@/` maps to project root

---

## Folder Map

```
traval-app/
│
├── app/                          ← expo-router FILE-BASED ROUTES
│   ├── _layout.tsx               ← Root layout + Auth Guard (useAuthStore)
│   ├── index.tsx                 ← Entry: redirects based on role
│   │
│   ├── (auth)/                   ← Auth group (no bottom tabs)
│   │   ├── _layout.tsx
│   │   ├── otp-login.tsx         ← re-exports screens/auth/OTPLoginScreen
│   │   └── profile-setup.tsx     ← re-exports screens/auth/ProfileSetupScreen
│   │
│   ├── (rider)/                  ← Rider tab group
│   │   ├── _layout.tsx           ← BottomTabs: My Trips / Post Trip / Requests
│   │   ├── my-trips.tsx
│   │   ├── post-trip.tsx
│   │   └── requests.tsx
│   │
│   ├── (traveler)/               ← Traveler tab group
│   │   ├── _layout.tsx           ← BottomTabs: Search
│   │   └── search.tsx
│   │
│   ├── trip-detail.tsx           ← Stack screen (params: tripId)
│   ├── traveler-profile.tsx      ← Stack screen (params: userId)
│   ├── notifications.tsx         ← Modal screen
│   ├── settings.tsx              ← Modal screen
│   └── safety.tsx                ← Modal screen
│
├── screens/                      ← ALL SCREEN LOGIC LIVES HERE
│   ├── auth/
│   │   ├── OTPLoginScreen.tsx    ← Phone → OTP flow, uses expo-router useRouter
│   │   └── ProfileSetupScreen.tsx
│   │
│   ├── rider/
│   │   ├── MyTripsScreen.tsx     ← Fetches getMyTrips(), uses tripStore
│   │   ├── PostTripScreen.tsx    ← Form: createTrip()
│   │   └── RequestsScreen.tsx    ← Accept/decline join requests
│   │
│   ├── traveler/
│   │   ├── SearchScreen.tsx      ← useTrips hook + useDebounce
│   │   ├── TripDetailScreen.tsx  ← useLocalSearchParams({ tripId })
│   │   └── TravelerProfileScreen.tsx ← useLocalSearchParams({ userId })
│   │
│   └── common/
│       ├── NotificationsScreen.tsx
│       ├── SettingsScreen.tsx
│       └── SafetyScreen.tsx
│
├── services/                     ← AXIOS API LAYER
│   ├── index.ts                  ← Shared axios instance (interceptors)
│   ├── auth.ts                   ← sendOTP, verifyOTP, setupProfile, logout
│   ├── trips.ts                  ← searchTrips, createTrip, joinRequest, etc.
│   └── verification.ts           ← RC / DL document upload & status
│
├── store/                        ← ZUSTAND STATE
│   ├── index.ts                  ← barrel export
│   ├── authStore.ts              ← user, tokens, isAuthenticated, logout()
│   └── tripStore.ts              ← trips[], myTrips[], requests[], actions
│
├── hooks/                        ← CUSTOM HOOKS
│   ├── index.ts                  ← barrel export
│   ├── useFetch.ts               ← generic axios hook → { data, loading, error, refetch }
│   ├── useDebounce.ts            ← delays value update (default 400ms)
│   └── useTrips.ts               ← search trips + sync to tripStore
│
├── constants/                    ← DESIGN TOKENS & CONFIG
│   ├── colors.ts                 ← primary:#1F4E79, secondary:#2E75B6, etc.
│   ├── spacing.ts                ← xs:4 sm:8 md:16 lg:24 xl:32 xxl:48
│   ├── typography.ts             ← fontSize, fontWeight, lineHeight
│   ├── config.ts                 ← BASE_URL, OTP_TIMEOUT, MAX_SEATS, MAX_PHOTOS
│   └── strings.ts                ← all UI copy (auth, trip, errors, labels)
│
├── types/
│   └── index.ts                  ← User, Vehicle, Trip, JoinRequest,
│                                    VerificationStatus, ApiResponse<T>
│
├── utils/
│   ├── index.ts                  ← barrel export
│   ├── formatDate.ts             ← formatDate(), relativeDateLabel()
│   ├── validatePhone.ts          ← validatePhone(), normalisePhone()
│   └── truncateText.ts           ← truncateText(), titleCase()
│
├── components/
│   └── index.ts                  ← barrel (add reusable components here)
│
└── assets/
    └── images/                   ← app icon, splash, etc. (Expo standard)
```

---

## Import Alias

```ts
// tsconfig.json — @/ maps to project root
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import OTPLoginScreen from '@/screens/auth/OTPLoginScreen';
```

---

## Auth Flow

```
app/index.tsx
  └─ isAuthenticated?
       NO  → Redirect /(auth)/otp-login
       YES → role === 'traveler'?
               YES → Redirect /(traveler)/search
               NO  → Redirect /(rider)/my-trips
```

`app/_layout.tsx` re-runs this check on every segment change via `useAuthGuard()`.

---

## Navigation Rules

| How to navigate | From | Code |
|---|---|---|
| After OTP verify → new user | OTPLoginScreen | `router.replace('/(auth)/profile-setup')` |
| After profile setup | ProfileSetupScreen | `setUser(...)` → auth guard auto-redirects |
| Open trip detail | SearchScreen | `router.push({ pathname: '/trip-detail', params: { tripId: id } })` |
| Open profile | Any screen | `router.push({ pathname: '/traveler-profile', params: { userId: id } })` |
| Open settings/safety | Any tab | `router.push('/settings')` / `router.push('/safety')` |

---

## Key Type Reference

```ts
// types/index.ts

User        { id, name, phone, whatsapp?, city, photo?, bio?, role, createdAt }
Vehicle     { id, type:'car'|'bike'|'van'|'bus', model?, seats, ac, rcVerified, dlVerified }
Trip        { id, riderId, type:'full_tour'|'one_way', title, from, to, stops[],
              startDate, endDate?, departureTime, seats, seatsLeft, costPerPerson,
              vehicle, restrictions?, notes?, photos?, status }
JoinRequest { id, tripId, userId, userName, userPhoto?, userRating,
              status:'pending'|'accepted'|'declined', createdAt }
VerificationStatus { rc, dl, permit?: 'pending'|'approved'|'rejected'|'not_uploaded' }
ApiResponse<T>      { success, data: T, message?, error? }
```

---

## Adding New Things

**New screen:**
1. Create `screens/<group>/NewScreen.tsx`
2. Add `app/<group>/new-screen.tsx` with `export { default } from '@/screens/<group>/NewScreen';`
3. Register in the group's `_layout.tsx` if it's a tab, OR add `<Stack.Screen>` in `app/_layout.tsx`

**New API call:**
- Add method to relevant `services/*.ts` file
- Use the shared `api` instance from `services/index.ts`

**New global state:**
- Add field + action to `store/authStore.ts` or `store/tripStore.ts`
- Or create a new `store/xyzStore.ts` and re-export from `store/index.ts`

**New constant:**
- Add to the relevant file in `constants/`
- All constants are `as const` — TypeScript will infer types automatically
