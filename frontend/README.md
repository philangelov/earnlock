# EarnLock — Frontend

The EarnLock mobile app, built with [Expo](https://expo.dev) SDK 57 and
[Expo Router](https://docs.expo.dev/router/introduction/).

## Get started

```bash
bun install
bun start
```

Open the app in the iOS Simulator, an Android emulator, or Expo Go from the dev-server
menu.

EarnLock shields apps with **real Apple Screen Time** (FamilyControls / DeviceActivity /
ManagedSettings). That stack only runs on a **physical iOS device dev build** — off-device the
app opens but honestly reports "device build required" and blocks nothing. Full step-by-step
setup + run instructions: [`../docs/screen-time.md`](../docs/screen-time.md).

## Design language

Clean, near-monochrome **iOS-native** UI (system font, hairline separators, large titles,
grouped lists) anchored by a single **electric-lime** accent used only for earned time, the
primary action, live progress, and the "unlocked" state.

- `src/theme/tokens.ts` — colors (light/dark), `Radius`, `Space`. **Every color comes from here.**
- `src/theme/type.ts` — the `Type` scale (system font text styles, tabular numerals).
- Lime is a **fill** (`t.accent` with `t.onAccent` text on top); accent-colored text uses the
  contrast-safe `t.accentText`.

## Project structure

- `src/app/` — file-based routes: onboarding (`index` → `setup` → `material` → `apps`), the
  `(tabs)` group (`today` · `learn` · `insights` · `profile`), the quiz flow
  (`quiz` · `recap` · `learning` · `earned`), and modals (`sos`, `locked`).
- `src/components/` — shared UI (Card, Button, List, AppIcon, ProgressRing, Screen, TabScreen, Sym).
- `src/theme/` — tokens, type scale, nav theme, and the theme provider (light/dark toggle).
- `src/store/` — Zustand store (`useEarnLock.ts`) + demo content (`content.ts`).
- `src/lib/screenTime/` — the real Screen Time facade: `native` (react-native-device-activity,
  defensively required), `index` (facade + availability), `store` (auth + selection-count state),
  `enforcement` (earn clock → shield/unshield).

The store persists durable progress to AsyncStorage; quiz-flow state stays transient.

## Validate

```bash
bun run validate   # prettier --check + eslint
bunx tsc --noEmit  # type check
```
