# EarnLock — Technical Architecture

> Status: MVP blueprint. This document is the source of truth for how the system
> is put together. The companion docs are [`api-contract.md`](./api-contract.md)
> (endpoint schemas) and [`ui-ux.md`](./ui-ux.md) (design system + screens).

## 1. Product in one paragraph

EarnLock locks distracting apps on a child's iPhone and gives back **screen time as
a currency** that is earned by answering AI-generated multiple-choice quizzes. Answer
correctly → earn seconds → apps unlock until the balance runs out, then they lock again.
Quizzes are generated from the child's grade/subjects or from study material they import.
Extra "hooks" shape behaviour: a once-a-day **SOS** emergency unlock (that raises a quiz
"debt"), a morning **Wake-Up Lock**, and a forced-reading **Learning Mode** on wrong answers.

## 2. Scope of the MVP

- **Platform: iOS only.** The lock mechanism depends on Apple's Family Controls /
  Screen Time frameworks, which have no Android equivalent. Android is explicitly out of
  scope for the MVP. (Everything except the native lock module is cross-platform-capable,
  so the app still runs on web/Android for development, just without real locking.)
- **AI is stubbed for now.** Quiz generation returns **static/dummy questions** behind a
  provider interface. A real model is wired in later without changing the API contract or
  any client code (see §6).

## 3. High-level topology

```
┌─────────────────────────────┐        HTTPS + JWT        ┌──────────────────────────┐
│  /mobile  (Expo SDK 57)      │ ────────────────────────▶ │  /backend  (Flask)       │
│                              │                           │                          │
│  Expo Router (file routes)   │        Supabase JWT       │  JWT middleware (JWKS)   │
│  React Native 0.86 / RN-Web  │ ◀──────────────────────── │  Blueprints per domain   │
│                              │      JSON responses       │  Quiz engine + currency  │
│  Native iOS module (Swift):  │                           │  Question generator (stub)│
│   FamilyControls / Screen    │                           │                          │
│   Time / ManagedSettings     │                           └───────────┬──────────────┘
└──────────────┬───────────────┘                                       │ Postgres (SQL + RLS)
               │                                                        ▼
               │  Screen Time authorization                 ┌──────────────────────────┐
               │  (local, on-device)                        │  Supabase                │
               ▼                                             │   Auth (email/password)  │
        iOS Screen Time API                                  │   PostgreSQL + RLS       │
                                                             └──────────────────────────┘
```

Three independently deployable parts, one contract between them:

1. **Mobile client** — Expo app. Owns UI, local Screen Time enforcement, and calls the
   backend for everything data-related. Never talks to Postgres directly for app logic;
   it only uses Supabase Auth to obtain a JWT.
2. **Backend** — Flask API. Owns all business rules (currency math, SOS debt, wake-up
   status, quiz generation). Validates the Supabase JWT on every protected request and
   reads/writes Postgres.
3. **Supabase** — managed Postgres + Auth. Issues JWTs, stores all persistent data, and
   enforces per-user isolation with Row-Level Security.

**Why the backend owns the currency, not the client:** earned-seconds math and SOS/debt
rules must not be forgeable from a jailbroken or patched client. The client displays the
balance and enforces the lock locally, but the *number* is always authoritative from the
server.

## 4. Repository layout (monorepo)

```
earnlock.app/
├── mobile/                     # the current Expo app moves here
│   ├── src/
│   │   ├── app/                # Expo Router file-based routes
│   │   ├── components/
│   │   ├── constants/theme.ts  # design tokens (see ui-ux.md)
│   │   ├── hooks/
│   │   ├── lib/                # NEW: api client, auth, native bridge wrappers
│   │   └── global.css
│   ├── modules/                # NEW: local Expo native module (Swift)
│   │   └── earnlock-screentime/
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
├── backend/                    # NEW: Flask API
│   ├── app/
│   │   ├── __init__.py         # app factory
│   │   ├── auth/               # JWT middleware, /auth passthrough helpers
│   │   ├── quiz/               # /quiz/generate, /quiz/submit, currency logic
│   │   ├── profile/            # /profile
│   │   ├── knowledge/          # /knowledge import + list
│   │   ├── screentime/         # /screentime/balance
│   │   ├── hooks/              # /sos, /wakeup
│   │   ├── ai/                 # QuestionGenerator interface + DummyGenerator
│   │   └── db/                 # Supabase/Postgres access
│   ├── migrations/             # SQL migrations (checked in)
│   ├── requirements.txt
│   └── README.md
├── docs/                       # this folder
└── README.md                   # how to run both halves
```

> Migration note: the current app currently lives at the repo root (`src/`, `app.json`,
> `package.json`). Step one of implementation is to move it into `mobile/` unchanged.

## 5. Technology stack

### Mobile (`/mobile`)
| Concern | Choice | Version / notes |
|---|---|---|
| Framework | Expo | SDK **57** (`~57.0.1`) — read `docs.expo.dev/versions/v57.0.0` before coding |
| Runtime | React Native / React | 0.86.0 / 19.2.3 |
| Routing | Expo Router | v57, `typedRoutes` + React Compiler enabled |
| Language | TypeScript | ~6.0.3, `strict: true` |
| Package manager | **Bun** | `bun.lock` is authoritative (ignore README's `npm`) |
| Web target | react-native-web | `output: static` |
| Animation | react-native-reanimated | 4.5.0 (already used by `ui/collapsible`) |
| Path aliases | `@/*` → `src/*`, `@/assets/*` → `assets/*` | from `tsconfig.json` |

**Not yet installed, needed:** a data-fetching layer, a Supabase client, and secure token
storage. Recommended additions:
- `@supabase/supabase-js` — Auth only (login/register → JWT).
- `expo-secure-store` — persist the JWT securely.
- A thin `fetch` wrapper in `mobile/src/lib/api.ts` (no need for a heavy client). Optionally
  `@tanstack/react-query` if we want caching/retries for `balance`/`profile`.

### Backend (`/backend`)
| Concern | Choice | Notes |
|---|---|---|
| Framework | **Flask** | app factory + blueprints per domain |
| Auth | Supabase JWT validation | verify signature against Supabase JWKS; no session state |
| CORS | flask-cors | allow the Expo dev origins + production scheme |
| DB access | Supabase Python client or `psycopg` | reads/writes with the service role, RLS enforced for user-scoped queries |
| Config | env vars | `dev`/`prod` split, secrets never committed |
| Tests | pytest | currency edge cases are the priority target |

### Data & Auth
- **Supabase**: PostgreSQL + Auth (email/password). Row-Level Security on every table so a
  user can only ever read/write their own rows.

### Native (iOS, `/mobile/modules/earnlock-screentime`)
- A **local Expo native module in Swift** exposing a clean TypeScript surface. Uses:
  - **FamilyControls** — `AuthorizationCenter.requestAuthorization()` and
    `FamilyActivityPicker` for choosing which apps to lock (the "Blacklist").
  - **ManagedSettings** — apply/remove the shield that actually blocks apps.
  - **DeviceActivity** — schedule the 07:30 Wake-Up Lock and time-limited shields.
- **Requires the Apple Family Controls entitlement**, whose approval is slow. Requesting it
  is a day-one, critical-path task and a potential blocker — surface early if denied.

TypeScript surface (what the rest of the app is allowed to call — no Swift leaks upward):
```ts
requestAuthorization(): Promise<'approved' | 'denied'>
pickApps(): Promise<AppSelectionToken>          // FamilyActivityPicker
lockApps(selection: AppSelectionToken): Promise<void>
unlockApps(): Promise<void>
startShield(durationSeconds: number): Promise<void>   // lock again after time runs out
scheduleWakeUpLock(time: '07:30'): Promise<void>       // DeviceActivitySchedule
```

## 6. AI question generation (pluggable, stubbed now)

The backend defines one interface and swaps the implementation later — the API contract in
[`api-contract.md`](./api-contract.md) does not change when a real model is connected.

```
QuestionGenerator (interface)
  generate(input) -> Question[]
      input: { grade_or_age, focus_subject, material_text?, question_count }
             # source = "profile"  -> material_text = null
             # source = "material" -> material_text = normalized text of a stored material
             # source = "text"     -> material_text = normalized text passed inline
      Question: { prompt, options[4], correct_index, explanation }
  # exact internal contract: api-contract.md "Internal data-interchange contract"

Implementations:
  DummyGenerator   (MVP now)  -> returns curated static questions per subject
  ModelGenerator   (later)    -> wraps a real LLM; same output shape
```

Validation is applied to **every** generator's output, so a real model can't break clients:
exactly 4 options, exactly 1 correct index, no duplicate options, non-empty prompt. On
invalid output: retry once, then fall back to a dummy question. `explanation` is used by
**Learning Mode** and by `/quiz/submit` for wrong answers.

## 7. Core flows

### 7.1 Auth
1. Mobile calls Supabase Auth (`register`/`login`) → receives a **JWT**.
2. JWT is stored in `expo-secure-store`.
3. Every backend request sends `Authorization: Bearer <jwt>`.
4. Backend middleware verifies the signature/expiry against Supabase JWKS and extracts the
   `user_id` (the `sub` claim). No server-side sessions.

### 7.2 Earn screen time (the main loop)
```
Locked State screen shows balance (GET /screentime/balance)
      │  user taps "Start Quiz"
      ▼
POST /quiz/generate  { source: "profile" | "material", ... }
      │  N questions (N = 7 if SOS debt is set, else 5)
      ▼
Client collects answers, wrong answers trigger Learning Mode (10s locked Continue)
      ▼
POST /quiz/submit  { answers[] }
      │  server scores, applies rule (5 correct = 900s, configurable),
      │  credits screentime_balance, clears SOS debt if it was a debt-quiz
      ▼
Result screen shows earned_seconds  ──▶  native startShield(balance) keeps apps
                                          unlocked until the countdown hits 0, then locks
```

### 7.3 SOS (emergency unlock)
`POST /sos` → if not used today: grant 120s emergency unlock and set `sos_debt_flag`.
The next `/quiz/generate` then returns **7** questions instead of 5, and a successful submit
clears the flag. A second SOS the same day is refused.

### 7.4 Wake-Up Lock
Native `DeviceActivitySchedule` shields apps at 07:30. `GET /wakeup/status` says whether the
lock is active today; the user solves 3 questions; `POST /wakeup/complete` marks the day done
and the shield is lifted. Status resets daily.

## 8. Business rules (single source of truth)

These live as **backend config constants** so they can be tuned without a client release.

| Rule | Default | Config key |
|---|---|---|
| Correct answers required for full reward | 5 | `QUIZ_CORRECT_TARGET` |
| Reward for a full correct quiz | 900 s (15 min) | `REWARD_SECONDS` |
| Seconds per correct answer (derived) | 180 s | `REWARD_SECONDS / QUIZ_CORRECT_TARGET` |
| Questions per normal quiz | 5 | `QUIZ_LEN_NORMAL` |
| Questions per SOS-debt quiz | 7 | `QUIZ_LEN_DEBT` |
| SOS emergency unlock | 120 s, once/day | `SOS_SECONDS`, `SOS_DAILY_LIMIT` |
| Wake-Up Lock questions | 3 | `WAKEUP_QUESTIONS` |
| Wake-Up Lock time | 07:30 local | `WAKEUP_TIME` |
| Learning Mode forced-read | 10 s locked Continue | `LEARNING_LOCK_SECONDS` (client) |

### Earned-seconds formula

Reward is **linear per correct answer, capped at the full reward**:

```
seconds_per_correct = REWARD_SECONDS / QUIZ_CORRECT_TARGET          # 900 / 5 = 180 s
earned_seconds      = min(correct_count, QUIZ_CORRECT_TARGET) * seconds_per_correct
```

- Each correct answer is worth `180 s`; a perfect 5-correct quiz yields the full `900 s`.
- The cap means answers beyond `QUIZ_CORRECT_TARGET` earn nothing — so a **7-question
  SOS-debt quiz** still tops out at `900 s`; the extra two questions are pure penalty, not
  extra reward. Getting `>= QUIZ_CORRECT_TARGET` correct also clears the debt flag.
- The formula is expressed in terms of the config constants, so retuning `REWARD_SECONDS`
  or `QUIZ_CORRECT_TARGET` rescales it automatically.

## 9. Data model (owned by Supabase, detailed in api-contract.md)

Five tables, all with RLS keyed on `user_id`:

- **users** `(id, email, grade_or_age, created_at)`
- **profiles** `(user_id, focus_subjects[], sos_debt_flag, last_sos_date, wakeup_completed_date)`
- **knowledge_materials** `(id, user_id, raw_text, source_type, created_at)`
- **screentime_balance** `(user_id, remaining_seconds, updated_at)`
- **quiz_history** `(id, user_id, quiz_id, correct_count, earned_seconds, created_at)`

Full column types, constraints, and the migration approach are in
[`api-contract.md`](./api-contract.md#database-schema).

## 10. Environments & configuration

| Variable | Where | Purpose |
|---|---|---|
| `SUPABASE_URL` | mobile + backend | project URL |
| `SUPABASE_ANON_KEY` | mobile | Auth (login/register) |
| `SUPABASE_SERVICE_ROLE_KEY` | backend only (secret) | privileged DB access |
| `SUPABASE_JWKS_URL` / `SUPABASE_JWT_SECRET` | backend | JWT verification |
| `EARNLOCK_API_URL` | mobile | backend base URL |
| Rule constants (§8) | backend | tunable business rules |

Secrets are provided via env / EAS secrets and are **never** committed. Mobile only ever
holds public keys (anon key); the service role key stays server-side.

## 11. Security notes

- **Server-authoritative currency** — clients cannot mint seconds; all math is server-side.
- **RLS everywhere** — even if the backend has a bug, Postgres refuses cross-user reads.
- **JWT verified per request** — stateless, signature-checked against Supabase JWKS.
- **Screen Time authorization is local** — the native module never sends the app list off
  device beyond what the user chooses to lock.

## 12. Open technical risks

1. **Family Controls entitlement** — Apple approval is slow and can be denied; it gates the
   entire lock feature. Request on day one; have a "demo without real lock" fallback.
2. **On-device testing required** — FamilyControls does not work in the iOS Simulator.
3. **Reanimated 4 + React Compiler** — both are enabled; verify no conflicts with the quiz
   timer/countdown animations.
