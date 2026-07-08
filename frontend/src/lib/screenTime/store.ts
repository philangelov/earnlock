/**
 * useScreenTime — a small reactive mirror of the Screen Time facade (availability, auth status,
 * shielded-selection counts) so any screen shares one source of truth and can trigger the auth
 * prompt. `refresh()` re-reads the synchronous native state (call on focus / after the picker).
 */
import { create } from 'zustand';

import { SCREEN_TIME_AVAILABLE, screenTime } from './index';
import type { AuthStatus, SelectionCount } from './types';

type ScreenTimeState = {
  available: boolean;
  status: AuthStatus;
  selection: SelectionCount;
  authorize: () => Promise<AuthStatus>;
  revoke: () => Promise<void>;
  refresh: () => void;
};

export const useScreenTime = create<ScreenTimeState>((set) => ({
  available: SCREEN_TIME_AVAILABLE,
  status: screenTime.getAuthStatus(),
  selection: screenTime.getSelectionCount(),

  authorize: async () => {
    const status = await screenTime.requestAuthorization();
    set({ status, selection: screenTime.getSelectionCount() });
    return status;
  },
  revoke: async () => {
    await screenTime.revoke();
    set({ status: screenTime.getAuthStatus(), selection: screenTime.getSelectionCount() });
  },
  refresh: () =>
    set({ status: screenTime.getAuthStatus(), selection: screenTime.getSelectionCount() }),
}));
