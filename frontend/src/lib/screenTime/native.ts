/**
 * The real Screen Time backend — a thin, defensive wrapper over
 * `react-native-device-activity` (Apple FamilyControls / DeviceActivity / ManagedSettings).
 *
 * The module is require()d inside try/catch so importing this file can never crash a context
 * where the native binding is absent (Expo Go, web). `NATIVE_AVAILABLE` is true only on an iOS
 * device build where `isAvailable()` returns true; every method no-ops safely otherwise.
 *
 * All shielding targets one selection persisted under `SELECTION_ID` (written by the native
 * FamilyActivity picker — see AppSelectionSheet). Locking blocks it, earning time unblocks it.
 */
import Constants from 'expo-constants';
import * as Device from 'expo-device';

import type { AuthStatus, ScreenTimeFacade, SelectionCount } from './types';

export const SELECTION_ID = 'earnlock.blocked';

let RNDA: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('react-native-device-activity');
  RNDA = mod?.default ?? mod;
} catch {
  RNDA = null;
}

function computeAvailable(): boolean {
  try {
    // Real Screen Time needs ALL of: iOS, a physical device (the Simulator can't authorize),
    // the Family Controls entitlement actually configured (app.config.js sets
    // extra.screenTimeEnabled only when EXPO_APPLE_TEAM_ID + EXPO_APP_GROUP are provided), and
    // the native module loaded. Anything short of that → honest "device build required" state,
    // never a Connect button that silently dead-ends.
    if (process.env.EXPO_OS !== 'ios') return false;
    if (!Device.isDevice) return false;
    if (!Constants.expoConfig?.extra?.screenTimeEnabled) return false;
    return !!RNDA && typeof RNDA.isAvailable === 'function' && RNDA.isAvailable();
  } catch {
    return false;
  }
}

export const NATIVE_AVAILABLE = computeAvailable();

function mapStatus(raw: unknown): AuthStatus {
  // Apple: 0 notDetermined, 1 denied, 2 approved (the lib may also return the string enum).
  if (raw === 2 || raw === 'approved') return 'approved';
  if (raw === 1 || raw === 'denied') return 'denied';
  return 'notDetermined';
}

const EMPTY: SelectionCount = { apps: 0, categories: 0, webDomains: 0, total: 0 };

export const nativeScreenTime: ScreenTimeFacade = {
  available: NATIVE_AVAILABLE,
  selectionId: SELECTION_ID,

  getAuthStatus() {
    if (!NATIVE_AVAILABLE) return 'unavailable';
    try {
      return mapStatus(RNDA.getAuthorizationStatus());
    } catch {
      return 'unavailable';
    }
  },

  async requestAuthorization() {
    if (!NATIVE_AVAILABLE) return 'unavailable';
    try {
      await RNDA.requestAuthorization('individual');
    } catch {
      // Can throw if already denied; fall through to reading the definitive status.
    }
    return this.getAuthStatus();
  },

  async revoke() {
    if (!NATIVE_AVAILABLE) return;
    try {
      await RNDA.revokeAuthorization?.();
    } catch {
      // ignore
    }
  },

  getSelectionCount() {
    if (!NATIVE_AVAILABLE) return EMPTY;
    try {
      const m = RNDA.activitySelectionMetadata?.({ activitySelectionId: SELECTION_ID });
      if (!m) return EMPTY;
      const apps = m.applicationCount ?? 0;
      const categories = m.categoryCount ?? 0;
      const webDomains = m.webDomainCount ?? 0;
      return { apps, categories, webDomains, total: apps + categories + webDomains };
    } catch {
      return EMPTY;
    }
  },

  async shield() {
    if (!NATIVE_AVAILABLE) return;
    try {
      await RNDA.blockSelection({ activitySelectionId: SELECTION_ID });
    } catch {
      // nothing selected yet, or not authorized
    }
  },

  async unshield() {
    if (!NATIVE_AVAILABLE) return;
    try {
      await RNDA.unblockSelection({ activitySelectionId: SELECTION_ID });
    } catch {
      // ignore
    }
  },
};
