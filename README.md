# TripShare Native

Expo + React Native app using TypeScript, Expo Router-ready structure, React Query, Zustand, and NativeWind.

## Requirements

- Node.js 20+ (recommended)
- npm 10+
- Expo Go (for Android/iOS testing)

## Install and Run

```bash
npm install
npm start
```

Useful scripts:

- `npm start` - Start Expo development server
- `npm run android` - Open Android
- `npm run ios` - Open iOS
- `npm run web` - Run in browser

## Current Project Structure

```text
travala-app/
  assets/                     # Static assets (images, icons, fonts)
  src/
    app/
      navigation/             # Navigators (Root + Tabs)
      providers/              # Global providers (React Query, etc.)
    components/
      common/                 # Reusable UI components
    constants/                # Colors, spacing, query keys
    features/                 # Feature-first modules (home, trips, profile, etc.)
      discover/
      home/
      post/
      profile/
      trips/
    lib/                      # Shared utilities (axios, query client)
    store/                    # Zustand stores
    types/                    # Shared TypeScript types
  App.tsx
  index.ts
  app.json
  babel.config.js
  metro.config.js
  tailwind.config.js
  package.json
```

## Recommended "Proper" Folder Structure

Use this as the standard as the app grows:

```text
src/
  app/
    navigation/
    providers/
    config/                   # Environment, app-level config
  features/
    <feature-name>/
      api/                    # Feature API calls
      components/             # Feature-specific components
      hooks/                  # Feature hooks
      screens/                # Screen components
      types.ts                # Feature-specific types
  components/
    common/                   # Shared app-wide components
  services/                   # External integrations (analytics, storage)
  lib/                        # Core utilities (http, query client)
  store/                      # Global stores
  constants/                  # Theme constants, keys, enums
  types/                      # Global shared types
  utils/                      # Pure helper functions
```

## Package Overview

### Core

- `expo`, `react`, `react-native`, `typescript`

### Navigation

- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `react-native-screens`
- `react-native-safe-area-context`
- `react-native-gesture-handler`

### State and Data

- `@tanstack/react-query` - server state
- `zustand` - client state
- `axios` - HTTP client

### Forms and Validation

- `react-hook-form`
- `@hookform/resolvers`
- `zod`

### UI and Styling

- `nativewind`
- `tailwindcss`
- `expo-linear-gradient`
- `expo-blur`
- `react-native-svg`

### Platform / Runtime

- `react-native-reanimated`
- `react-native-worklets`
- `react-native-web`
- `expo-status-bar`

### Tooling

- `babel-preset-expo`
- `@types/react`

## Notes

- Keep feature logic inside `src/features/<feature-name>`.
- Keep only reusable components in `src/components/common`.
- Prefer colocating feature API + types + screens to reduce cross-folder coupling.
- Avoid adding business logic directly in navigator files.
