/**
 * AppPicker — presents Apple's native FamilyActivity picker via
 * `DeviceActivitySelectionSheetViewPersisted`. This is the ONLY sanctioned way to choose which
 * apps to shield: the selection is auto-persisted natively under `SELECTION_ID` (app identities
 * are privacy-protected — we never see names/icons in JS, only counts), so `blockSelection` and
 * `activitySelectionMetadata` read it straight back.
 *
 * Mounted as a 1×1 invisible anchor; the native side presents the full sheet with Cancel/Done.
 * The module is require()d defensively so importing this file never crashes off-device.
 */
import { SELECTION_ID } from '@/lib/screenTime';

let SheetView: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SheetView = require('react-native-device-activity').DeviceActivitySelectionSheetViewPersisted;
} catch {
  SheetView = null;
}

export const APP_PICKER_AVAILABLE = !!SheetView;

export function AppPicker({
  visible,
  onClose,
  onChange,
}: {
  visible: boolean;
  onClose: () => void;
  /** Fired after the user changes the selection — refresh the mirrored count. */
  onChange: () => void;
}) {
  if (!SheetView || !visible) return null;
  return (
    <SheetView
      style={{ width: 1, height: 1, position: 'absolute' }}
      familyActivitySelectionId={SELECTION_ID}
      includeEntireCategory
      onDismissRequest={onClose}
      onSelectionChange={() => onChange()}
    />
  );
}
