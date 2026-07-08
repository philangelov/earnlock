/**
 * Screen Time facade — a single real backend. There is no demo/simulated mode: shielding is
 * always driven by Apple Screen Time, and off-device the facade simply reports `available:
 * false` so the UI can gate honestly.
 *
 *   import { screenTime, SCREEN_TIME_AVAILABLE } from '@/lib/screenTime';
 */
import { NATIVE_AVAILABLE, SELECTION_ID, nativeScreenTime } from './native';

export const screenTime = nativeScreenTime;
export const SCREEN_TIME_AVAILABLE = NATIVE_AVAILABLE;
export { SELECTION_ID };
export type { AuthStatus, SelectionCount, ScreenTimeFacade } from './types';
