/**
 * Demo content — the self-contained "AI + backend" stand-in for the prototype. Everything the
 * UI shows that isn't live loop state (unlock clock, streak, coins) comes from here: subjects,
 * the app blacklist, the quiz material, the Learn course map, and the Insights series. When a
 * real backend is wired in, only this module (and the store's fetch actions) change.
 *
 * Icons are SF Symbol names (rendered by <Sym/>). The palette stays near-monochrome, so subject
 * wells are neutral; only real app marks keep their brand color, and lime is reserved for
 * progress / earned / active states applied by the screens.
 */
import type { SymName } from '@/components/Sym';

/* ------------------------------------------------------------------ learner */

export const LEARNER = {
  name: 'Mia Chen',
  initials: 'MC',
  gradeLabel: 'Grade 8',
  joined: 'Since March 2026',
} as const;

/* ---------------------------------------------------------------- subjects */

export type SubjectKey =
  'Math' | 'Biology' | 'History' | 'English' | 'Physics' | 'Chemistry' | 'Geography' | 'Coding';

export type SubjectDef = { key: SubjectKey; icon: SymName };

export const SUBJECT_DEFS: SubjectDef[] = [
  { key: 'Math', icon: 'function' },
  { key: 'Biology', icon: 'leaf.fill' },
  { key: 'History', icon: 'building.columns.fill' },
  { key: 'English', icon: 'character.book.closed.fill' },
  { key: 'Physics', icon: 'atom' },
  { key: 'Chemistry', icon: 'drop.fill' },
  { key: 'Geography', icon: 'globe.americas.fill' },
  { key: 'Coding', icon: 'chevron.left.forwardslash.chevron.right' },
];

/* -------------------------------------------------------------- quiz material */

export type QuizOption = { e: string; t: string };
export type Question = {
  tag: string;
  q: string;
  opts: QuizOption[];
  answer: number;
  explain: string;
};

export const QUESTIONS: Question[] = [
  {
    tag: 'Biology',
    q: 'Which organelle is the “powerhouse” of the cell?',
    opts: [
      { e: '📦', t: 'Golgi apparatus' },
      { e: '⚡', t: 'Mitochondrion' },
      { e: '🧬', t: 'Nucleus' },
      { e: '🔬', t: 'Ribosome' },
    ],
    answer: 1,
    explain:
      'Mitochondria turn nutrients and oxygen into ATP — the chemical fuel your cells run on. Because they make most of that energy, biologists nickname them the powerhouse of the cell.',
  },
  {
    tag: 'History',
    q: 'In which year did the Berlin Wall fall?',
    opts: [
      { e: '📻', t: '1979' },
      { e: '🧱', t: '1989' },
      { e: '📼', t: '1991' },
      { e: '🚀', t: '1985' },
    ],
    answer: 1,
    explain:
      'On 9 November 1989, eased travel rules and huge peaceful protests brought crowds to the checkpoints and the Berlin Wall was opened — paving the way for German reunification in 1990.',
  },
  {
    tag: 'Physics',
    q: 'What force pulls a dropped apple toward the ground?',
    opts: [
      { e: '🧲', t: 'Magnetism' },
      { e: '🌍', t: 'Gravity' },
      { e: '💨', t: 'Air pressure' },
      { e: '⚡', t: 'Static charge' },
    ],
    answer: 1,
    explain:
      'Gravity is the attraction between masses. Earth’s enormous mass pulls the apple downward at about 9.8 m/s² — the same force that keeps the Moon in orbit.',
  },
  {
    tag: 'Geography',
    q: 'Which is the longest river in the world?',
    opts: [
      { e: '🌊', t: 'Amazon' },
      { e: '🏜️', t: 'Nile' },
      { e: '🐉', t: 'Yangtze' },
      { e: '🦅', t: 'Mississippi' },
    ],
    answer: 1,
    explain:
      'The Nile runs about 6,650 km through north-east Africa. (The Amazon is a very close second and carries far more water — but the Nile edges it on length.)',
  },
];

/** Multiple-choice questions before the fill-in-the-blank recap. */
export const MC_COUNT = QUESTIONS.length;

export const RECAP = {
  tag: 'Recap',
  pre: 'A triangle’s interior angles always add up to',
  post: 'degrees.',
  options: ['90', '180', '360'],
  answer: '180',
} as const;

export const PASTE_EXAMPLE =
  'Photosynthesis: plants use sunlight, water and CO₂ to make glucose and release oxygen. It happens mostly in the chloroplasts, where the green pigment chlorophyll absorbs light energy.';

/* ---------------------------------------------------------------- Learn tab */

export type LessonState = 'done' | 'active' | 'locked';
export type Lesson = { title: string; state: LessonState; minutes: number };

export const COURSE = {
  subject: 'Biology',
  title: 'The Living Cell',
  progress: 0.55, // 0..1
  lessons: [
    { title: 'What cells are', state: 'done', minutes: 4 },
    { title: 'Inside the cell', state: 'done', minutes: 5 },
    { title: 'Energy & mitochondria', state: 'active', minutes: 6 },
    { title: 'Photosynthesis', state: 'locked', minutes: 5 },
    { title: 'Genes & DNA', state: 'locked', minutes: 7 },
  ] as Lesson[],
} as const;

/** Last 7 days of the learning streak (today is last). */
export const STREAK_DAYS: { d: string; done: boolean; today?: boolean }[] = [
  { d: 'M', done: true },
  { d: 'T', done: true },
  { d: 'W', done: true },
  { d: 'T', done: true },
  { d: 'F', done: false },
  { d: 'S', done: true },
  { d: 'S', done: false, today: true },
];

/* ------------------------------------------------------------- Insights tab */

/** Minutes learned per weekday (drives the bar chart; today highlighted). */
export const WEEK_MINUTES: { d: string; min: number }[] = [
  { d: 'M', min: 32 },
  { d: 'T', min: 48 },
  { d: 'W', min: 20 },
  { d: 'T', min: 55 },
  { d: 'F', min: 40 },
  { d: 'S', min: 15 },
  { d: 'S', min: 28 },
];
export const WEEK_TODAY_INDEX = 3;

export type SubjectMastery = { name: string; pct: number };
export const SUBJECT_MASTERY: SubjectMastery[] = [
  { name: 'Math', pct: 88 },
  { name: 'Biology', pct: 72 },
  { name: 'History', pct: 54 },
  { name: 'English', pct: 41 },
];

/** Screen time earned vs. actually spent this week (minutes). */
export const TIME_LEDGER = { earned: 315, spent: 268 };

export const INSIGHT_TOTALS: { label: string; value: string; icon: SymName }[] = [
  { label: 'Questions solved', value: '312', icon: 'checkmark.seal.fill' },
  { label: 'Accuracy', value: '86%', icon: 'target' },
  { label: 'Best streak', value: '11', icon: 'flame.fill' },
  { label: 'Time earned', value: '42h', icon: 'hourglass' },
];
