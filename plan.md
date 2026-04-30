# ContiBracket — plan.md (UPDATED)

## 1) Objectives
- ✅ Deliver a polished office bracket game (player join → predict champion → vote round-by-round → animated bracket → winner celebration) backed by **Supabase Postgres**.
- ✅ Provide an admin experience gated by **PIN `4444`** (office-only) to create/manage games, items, rounds, participants, emails, exports, and destructive actions.
- ✅ Support **any item count** using smart bracket generation with BYEs, tie handling, and round advancement (verified across many N values).
- ✅ Ship with ContiBingo-like visual style (dark/glow cards, smooth motion), **theme editor** (presets + live preview), **confetti**, and **TV/display mode**.
- ✅ Provide Supabase SQL schema + **required permissive RLS policies** (needed for `sb_publishable_*` keys) and **GitHub Pages deployment instructions**.

**Current status:** All objectives implemented and verified end-to-end.

---

## 2) Implementation Steps

### Phase 1 — Core POC (Isolation: Supabase + Bracket Engine)
**Goal:** prove the failure-prone core works before building UI.

**User stories**
1. ✅ As an admin, I can create a game and items for any item count (e.g., 5, 7, 10, 13).
2. ✅ As a system, I can generate matches with BYEs and auto-advance correctly.
3. ✅ As a participant, I can submit exactly one vote per matchup.
4. ✅ As an admin, I can advance rounds and the next round matches are generated correctly.
5. ✅ As a system, I can detect ties and apply a configured tie-break mode.

**What was built**
- ✅ `supabase_schema.sql` (tables, indexes, constraints) created.
- ✅ **Office-mode permissive RLS policies** added (required due to Supabase `sb_publishable_*` publishable keys enforcing RLS even when “disabled”).
- ✅ Bracket engine implemented in `/app/frontend/src/lib/bracket.js`:
  - next power-of-two sizing
  - standard seed slot layout
  - BYE auto-advancement
  - next-round generation
  - winner decision helper
- ✅ End-to-end POC script: `/app/poc/test_core.js`
  - creates game/items/matches, simulates votes, closes rounds, advances until winner, then cleans up.

**Exit criteria (met)**
- ✅ POC passed for N={2,3,4,5,7,8,10,13,16,19} with correct BYE handling and a declared champion.

---

### Phase 2 — V1 App Development (Core UX, minimal polish)
**Goal:** build the working app around the proven core; keep admin PIN simple; ensure all core states handled.

**User stories**
1. ✅ Player can open `/#/game/:slug`, enter full name once, confirm, and stay logged in (localStorage per slug).
2. ✅ First-time player locks a champion prediction once and sees it labeled as **“Your pick”**.
3. ✅ Player votes through open matchups with progress UI and one-vote-per-match enforcement.
4. ✅ Player can view full bracket and see results (percentages/totals) when enabled.
5. ✅ Admin can create a game, add items, launch, close rounds, advance rounds, and end/reopen games.

**What was built**
- ✅ React + Tailwind + Framer Motion frontend using **HashRouter** for GitHub Pages compatibility.
- ✅ Pages implemented:
  - ✅ `/#/` Landing
  - ✅ `/#/game/:slug` PlayerGame (login → predict → vote → bracket → waiting → winner)
  - ✅ `/#/admin` AdminGate (PIN)
  - ✅ `/#/admin/dashboard` AdminDashboard
  - ✅ `/#/admin/games/:gameId` AdminGameManager (tabbed)
  - ✅ `/#/display/:slug` DisplayMode (TV)
  - ✅ NotFound
- ✅ Supabase browser client wired via env vars (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`).

**Exit criteria (met)**
- ✅ End-to-end flow works for non-power-of-two brackets with BYEs.

---

### Phase 3 — Feature Expansion (Phase 2+3+4 items from spec)
**Goal:** add quality + polish + exports + theme editor + TV mode; modularize.

**User stories**
1. ✅ Admin can add emails to global profiles and copy a BCC list for a game.
2. ✅ Players can see vote totals/percentages (when enabled).
3. ✅ Admin can resolve ties manually and override winners.
4. ✅ Admin can customize the game’s visual theme and see a live preview.
5. ✅ Office viewer can open `/#/display/:slug` and see a clean bracket view.

**What was built**
- ✅ **Admin quality features**
  - Participants tab: email editor, reset prediction, reset votes, soft-remove/unremove, purge.
  - Copy tools: Copy BCC list, Copy missing emails, Copy correct predictors.
  - CSV export for participants.
  - Votes tab: vote tallies, per-vote clearing, manual “Set as winner” overrides for tie resolution.
- ✅ **Visual polish**
  - Theme editor stored in `games.style_json`.
  - 3 presets: ContiBingo Style (default), Tournament Night Pink, Cool Blue Court.
  - Confetti burst on winner reveal.
  - Polished dark/glow UI across pages.
- ✅ **Gameplay enhancements**
  - Upset detection on bracket view (lower-ranked seed defeats higher-ranked seed).
  - Animated entrances / transitions via Framer Motion.
- ✅ **TV/display mode**
  - Fullscreen bracket view with clear champion indicator.
  - Auto-refresh polling every ~5 seconds.

**Exit criteria (met)**
- ✅ Admin can run full game with emails/exports, ties, theme customization, and TV mode.

---

### Phase 4 — Hardening, Edge Cases, Release (GitHub Pages)
**Goal:** stabilize and document deployment.

**User stories**
1. ✅ Player refreshes mid-flow and resumes (identity stored locally).
2. ✅ Admin advances while players are voting; player sees updated state via polling.
3. ✅ Admin destructive actions have confirmations and safe flows.
4. ✅ Admin can reopen completed game.
5. ✅ Maintainer can deploy to GitHub Pages reliably.

**What was built**
- ✅ Edge-case UI states:
  - Draft / paused / complete / missing bracket states.
  - Waiting screens.
  - Tie state blocks advancing until resolved.
- ✅ Regenerate bracket flow with destructive confirmation.
- ✅ Game events audit logging for key actions (`round_closed`, `round_advanced`, `game_completed`).
- ✅ Deployment documentation written: `/app/DEPLOY.md`
  - Supabase setup instructions
  - Required RLS policy snippet for publishable keys
  - GitHub Pages deploy options (gh-pages branch OR GitHub Actions)
  - Day-to-day office operations playbook
  - Troubleshooting

**Exit criteria (met)**
- ✅ App deployable to GitHub Pages with hash routing and Supabase configuration.

---

## 3) Next Actions
All originally planned build phases are complete.

**Optional future improvements (not required for acceptance):**
1. Add true Supabase Realtime subscriptions for instant TV updates (instead of polling).
2. Implement a more dramatic “Office Drama Mode” reveal animation sequence on results.
3. Tighten RLS security and add proper admin auth if this ever leaves the office/trusted environment.
4. Improve bracket connector lines (currently bracket is column-based without SVG connectors).

---

## 4) Success Criteria
✅ Acceptance criteria met:
- ✅ Admin can create a game with any number of bracket items.
- ✅ Participant can join with only first+last name; persists locally.
- ✅ Participant makes one champion prediction.
- ✅ Participant votes once per matchup per round.
- ✅ Admin can close rounds, resolve ties, and advance rounds.
- ✅ Bracket updates correctly and supports BYEs.
- ✅ Admin can manage participants, save emails globally, and copy BCC list.
- ✅ Admin can export CSV and copy correct predictors.
- ✅ TV/display mode works and is office-screen friendly.
- ✅ Visual style matches the intended ContiBingo-inspired dark/glow vibe.
- ✅ Works with Supabase `sb_publishable_*` keys using permissive office-mode RLS.
- ✅ E2E tested: **57/57 tests passed** (testing_agent_v3 report: `/app/test_reports/iteration_1.json`).
- ✅ Deployment guide present: `/app/DEPLOY.md`.
