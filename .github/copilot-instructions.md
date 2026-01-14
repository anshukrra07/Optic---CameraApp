<!-- .github/copilot-instructions.md -->

# Copilot instructions for the Optix React Native app

These are concise, actionable rules to help an AI coding agent be productive in this codebase.

- Project type: React Native (vanilla CLI) app using `react-native` 0.81.x. Main entry: `src/App.tsx`.
- Key areas:
  - UI and screens: `src/components/*` (e.g. `TestScreen`, `Optix.tsx`).
  - Camera subsystem: `src/proCamera/*` (permissions, formats, `ProCamera.tsx`, `formats.ts`, `useCameraLogic.ts`).
  - Utilities: `utils/*` and `src/components/CameraContext.tsx` for cross-cutting state.

- Quick dev workflows (explicit):
  - Start Metro: `npm start` (root). See `README.md` for iOS/Android runner commands.
  - Android: `npm run android` (requires Android SDK + emulator/device).
  - iOS: run `bundle install` once (if CocoaPods missing) then `bundle exec pod install` in `ios/` then `npm run ios`.
  - Postinstall: repository uses `patch-package` (see `package.json`) — don't remove it.

- Code patterns & conventions:
  - TypeScript with React Native types. Files use `.tsx` and `tsconfig.json` is present.
  - Camera logic centralised under `src/proCamera/` — prefer edits here for any camera feature.
  - Prefer using small, well-named hooks (e.g. `useCameraLogic.ts`, `useCameraState.ts`) rather than putting complex logic in components.
  - UI styling uses inline StyleSheet objects (see `src/proCamera/styles.ts` and `src/components/*`). Keep style changes local to components.

- Important integration points:
  - Vision camera: `react-native-vision-camera` usage is concentrated in `ProCamera.tsx` and `UICamera.tsx`.
  - Native modules and pods: changes to native deps require `pod install` in `ios/` and rebuilding the native app.
  - Media saving uses `@react-native-camera-roll/camera-roll` and `react-native-fs`/`react-native-blob-util` in utilities — use these helpers rather than re-implementing.

- Tests & linting:
  - Unit tests run with `npm test` (Jest). There is an example test in `__tests__/App.test.tsx`.
  - Lint with `npm run lint` (ESLint + React Native config).

- When changing the camera or media pipeline, follow this checklist:
  1. Update TypeScript types for any new props or hook returns in `src/proCamera/`.
 2. Ensure permission flow still uses `usePermissions` (see `src/proCamera/usePermissions.ts`).
 3. Run Metro + native rebuilds if native deps changed (`pod install` + `npm run ios` / `npm run android`).

- Examples to reference when editing:
  - Saving photo/video to gallery: `src/components/Optix.tsx` (takePhoto/startRecording handlers).
  - Format selection logic: `src/proCamera/formats.ts` (functions `pickFormat`, `highestSlowMoFormat`).

- Avoid making these assumptions:
  - Do not assume the app uses Expo; it's a plain React Native CLI app with native iOS/Android directories.
  - Do not change `postinstall` / `patch-package` behavior without confirming why the patch exists (see `patches/`).

- If you need to run device-only functionality in unit tests, mock native modules (Vision Camera, CameraRoll) rather than running on a device.

If anything here is unclear or you want more details (CI, release, or a deeper architecture diagram), tell me which area to expand. After your feedback I'll iterate.
