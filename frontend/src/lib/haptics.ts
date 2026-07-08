/**
 * Thin haptics helper. iOS-only by design (Android/web are no-ops) so call sites stay
 * clean — `haptic.tap()` on any press, `haptic.success()` / `haptic.error()` for outcomes.
 */
import * as Haptics from 'expo-haptics';

const isIOS = process.env.EXPO_OS === 'ios';

export const haptic = {
  /** Light selection tick — buttons, chips, toggles. */
  tap() {
    if (isIOS) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  /** Medium tap — primary CTAs, committing an action. */
  press() {
    if (isIOS) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  /** Selection change — stepper, segmented control, picking an option. */
  select() {
    if (isIOS) Haptics.selectionAsync();
  },
  /** Correct answer / reward earned. */
  success() {
    if (isIOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  /** Wrong answer / blocked action. */
  error() {
    if (isIOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  /** Warning — SOS, destructive confirmation. */
  warning() {
    if (isIOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
};
