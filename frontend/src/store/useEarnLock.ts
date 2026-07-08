/**
 * EarnLock store — the app's state + the mocked loop logic, lifted from the `Component`
 * class in EarnLock.dc.html. Navigation is handled by expo-router in the screens; this store
 * owns the data and the pure state transitions. Durable progress (onboarding, grade, subjects,
 * blacklist, coins, streak, unlock deadline, SOS/debt) is persisted to AsyncStorage; transient
 * quiz state is not.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { PASTE_EXAMPLE, type SubjectKey } from './content';

/** Screen time granted per completed quiz / per SOS, in milliseconds. */
export const REWARD_MS = 15 * 60_000;
export const SOS_MS = 2 * 60_000;

export type EarnLockState = {
  onboarded: boolean;
  grade: number;
  subj: Record<SubjectKey, boolean>;
  importText: string;
  imported: boolean;
  uploadName: string;
  qIndex: number;
  selected: number | null;
  checked: boolean;
  recapPick: string | null;
  recapChecked: boolean;
  /** Epoch ms until which apps are unlocked; 0 (or past) = locked. */
  unlockUntil: number;
  streak: number;
  coins: number;
  sosUsed: boolean;
  debt: boolean;

  // onboarding
  gradeUp: () => void;
  gradeDown: () => void;
  toggleSubj: (key: SubjectKey) => void;
  setImportText: (text: string) => void;
  pasteExample: () => void;
  setUploadName: (name: string) => void;
  doImport: () => void;
  completeOnboarding: () => void;

  // quiz flow
  pick: (index: number) => void;
  check: () => void;
  nextQuestion: () => void;
  retryQuestion: () => void;
  resetQuizFlow: () => void;
  pickRecap: (word: string) => void;
  checkRecap: () => void;
  retryRecap: () => void;

  // rewards / hooks
  claim: () => void;
  activateSos: () => void;

  // demo utilities
  resetAll: () => void;
};

const initial = {
  onboarded: false,
  grade: 8,
  subj: {
    Math: true,
    History: true,
    Biology: false,
    English: false,
    Physics: false,
    Chemistry: false,
    Geography: false,
    Coding: false,
  } as Record<SubjectKey, boolean>,
  importText: '',
  imported: false,
  uploadName: '',
  qIndex: 0,
  selected: null as number | null,
  checked: false,
  recapPick: null as string | null,
  recapChecked: false,
  unlockUntil: 0,
  streak: 4,
  coins: 220,
  sosUsed: false,
  debt: false,
};

export const useEarnLock = create<EarnLockState>()(
  persist(
    (set) => ({
      ...initial,

      gradeUp: () => set((s) => ({ grade: Math.min(12, s.grade + 1) })),
      gradeDown: () => set((s) => ({ grade: Math.max(1, s.grade - 1) })),
      toggleSubj: (key) => set((s) => ({ subj: { ...s.subj, [key]: !s.subj[key] } })),
      // Editing the inputs invalidates a previous "questions ready" result.
      setImportText: (importText) => set({ importText, imported: false }),
      pasteExample: () => set({ importText: PASTE_EXAMPLE, imported: false }),
      setUploadName: (uploadName) => set({ uploadName, imported: false }),
      doImport: () => set({ imported: true }),
      completeOnboarding: () => set({ onboarded: true }),

      pick: (index) => set((s) => (s.checked ? {} : { selected: index })),
      check: () => set((s) => (s.selected != null ? { checked: true } : {})),
      nextQuestion: () => set((s) => ({ qIndex: s.qIndex + 1, selected: null, checked: false })),
      // Clear the current attempt but keep the question index (used after remediation).
      retryQuestion: () => set({ selected: null, checked: false }),
      resetQuizFlow: () =>
        set({
          qIndex: 0,
          selected: null,
          checked: false,
          recapPick: null,
          recapChecked: false,
        }),
      pickRecap: (word) => set((s) => (s.recapChecked ? {} : { recapPick: word })),
      checkRecap: () => set((s) => (s.recapPick ? { recapChecked: true } : {})),
      // Clear a wrong recap attempt so the learner must get it right before the reward.
      retryRecap: () => set({ recapPick: null, recapChecked: false }),

      claim: () =>
        set((s) => ({
          // Extend the unlock window; stacking on top of any time still remaining.
          unlockUntil: Math.max(Date.now(), s.unlockUntil) + REWARD_MS,
          coins: s.coins + 20,
          // Completing a quiz repays the SOS debt and refreshes the SOS allowance.
          debt: false,
          sosUsed: false,
          qIndex: 0,
          selected: null,
          checked: false,
          recapPick: null,
          recapChecked: false,
        })),
      activateSos: () =>
        set((s) => ({
          sosUsed: true,
          debt: true,
          // Stack on top of any time already earned rather than truncating it.
          unlockUntil: Math.max(Date.now(), s.unlockUntil) + SOS_MS,
        })),

      // Wipe progress back to a fresh first-run state (demo reset).
      resetAll: () => set({ ...initial }),
    }),
    {
      name: 'earnlock-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist durable progress only; quiz-flow state stays transient.
      partialize: (s) => ({
        onboarded: s.onboarded,
        grade: s.grade,
        subj: s.subj,
        importText: s.importText,
        imported: s.imported,
        uploadName: s.uploadName,
        unlockUntil: s.unlockUntil,
        streak: s.streak,
        coins: s.coins,
        sosUsed: s.sosUsed,
        debt: s.debt,
      }),
    },
  ),
);
