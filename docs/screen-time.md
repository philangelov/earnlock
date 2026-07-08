# Screen Time — setup & running on a real device

EarnLock shields distracting apps with Apple's **Screen Time** stack (FamilyControls ·
DeviceActivity · ManagedSettings) through
[`react-native-device-activity`](https://github.com/kingstinct/react-native-device-activity).

This is **real** now — there is no simulated/demo backend. Screen Time **cannot** run in Expo Go
or the iOS Simulator; it needs a **development build on a physical iPhone**. Off-device the app
still opens, but the Screen Time UI honestly shows "device build required" and blocks nothing.

App identities are privacy-protected by Apple, so the UI is **count-based** ("5 apps &
categories shielded"); apps are chosen through Apple's native FamilyActivity picker.

---

## What you need

- A **Mac with Xcode 16+**.
- A **paid Apple Developer account** ($99/yr). The free tier cannot use the Family Controls
  capability.
- A **physical iPhone on iOS 16.4+** (the SDK 57 toolchain floor; Family Controls itself is 15.1+).
- ~15 minutes.

---

## 1 · Apple Developer portal (one-time)

At <https://developer.apple.com/account> → Certificates, Identifiers & Profiles:

1. **Team ID** — copy it from *Membership* (10 characters, e.g. `A1B2C3D4E5`).
2. **App Group** — *Identifiers → (+) → App Groups*. Create one, e.g.
   `group.com.yourorg.earnlock`. (Shared between the app and its 3 Screen Time extensions.)
3. **Family Controls capability**
   - **Development / running on your own device:** no approval needed — the config plugin adds
     the *Family Controls (Development)* entitlement and Xcode signs it against your team.
   - **TestFlight / App Store distribution:** you must first be granted the
     *Family Controls (Distribution)* entitlement — request it here (can take days):
     <https://developer.apple.com/contact/request/family-controls-distribution>. Do this early.

---

## 2 · Point the app at your identifiers

Edit `frontend/app.json` → set a real bundle id you own (any reverse-DNS you like, but it must be
yours):

```json
"ios": { "bundleIdentifier": "com.yourorg.earnlock" }
```

The Screen Time config plugin is enabled **only** when these env vars are set (so plain
`expo start` never tries to build the extensions). Export them in your shell:

```bash
export EXPO_APPLE_TEAM_ID=A1B2C3D4E5
export EXPO_APP_GROUP=group.com.yourorg.earnlock   # exactly the App Group from step 1.2
```

`frontend/app.config.js` reads them and adds `expo-build-properties` (iOS 16.4 target) + the
`react-native-device-activity` plugin, which generates the entitlement and the three extension
targets (ActivityMonitor, ShieldAction, ShieldConfiguration).

---

## 3 · Prebuild and run on the device

```bash
cd frontend
bun install

# Generates ios/ (+ the Screen Time extension targets) with your team & app group baked in.
EXPO_APPLE_TEAM_ID=$EXPO_APPLE_TEAM_ID EXPO_APP_GROUP=$EXPO_APP_GROUP \
  npx expo prebuild -p ios --clean

# Plug in the iPhone (trust the Mac), then:
npx expo run:ios --device
```

Pick your iPhone when prompted. First build takes a few minutes.

> **Signing in Xcode (if `run:ios` can't sign):** open `ios/earnlockapp.xcworkspace`, and for
> **each** of the 4 targets (the app + the 3 extensions) select *Signing & Capabilities →
> Automatically manage signing → your Team*. Confirm every target lists the **App Group**
> (`group.com.yourorg.earnlock`) and the app + ActivityMonitor target list **Family Controls**.
> Then Run.

---

## 4 · In the app

1. Onboarding → **Lock the distractions** → **Connect Screen Time**. iOS shows the system
   authorization sheet → **Allow**. (You may need to authenticate.)
2. **Choose apps** → Apple's FamilyActivity picker opens → select apps/categories → **Done**.
   The count now shows on Today, Profile, and the Apps screen.
3. When the timer is 0 the selection is **blocked** (opening those apps shows the shield). Tap
   **Earn screen time**, answer the questions, and they unblock for 15 minutes; they re-shield
   when the timer expires.

---

## How it maps to the code

| Concern | Where |
| --- | --- |
| Backend + availability (`isAvailable`) | `src/lib/screenTime/native.ts`, `index.ts` |
| Auth + selection-count state | `src/lib/screenTime/store.ts` (`useScreenTime`) |
| Clock → `blockSelection`/`unblockSelection` | `src/lib/screenTime/enforcement.ts` |
| Native FamilyActivity picker | `src/components/AppSelectionSheet.tsx` (`AppPicker`) |
| Plugin gating (Team ID / App Group) | `frontend/app.config.js` |

Everything shields **one** selection persisted natively under `SELECTION_ID = "earnlock.blocked"`.

---

## Troubleshooting

- **Authorization does nothing / fails** → you're on the Simulator. Use a physical device.
- **Counts stay 0 after picking** → the App Group in your env doesn't match the one on the
  provisioning profile / Xcode capability. They must be identical everywhere.
- **"Missing entitlement" at launch** → the Family Controls capability isn't on the provisioning
  profile. Re-check signing on all 4 targets in Xcode, then rebuild.
- **Re-shield doesn't fire in the background** → expected. The persisted shield holds the lock
  closed; the JS deadline timer only re-arms while foregrounded. For background-exact re-shielding,
  register a `DeviceActivityMonitor` schedule (`startMonitoring` + a threshold action) — a
  follow-up, not required for the earn/unlock loop.
- **Force the off-device UI** on a device build (for screenshots) — there's no demo flag anymore;
  just run it where Screen Time is unavailable, or don't grant authorization.
