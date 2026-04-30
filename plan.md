# ContiBracket — plan.md

## 1) Objectives
- Deliver a polished office bracket game (player join → predict champion → vote round-by-round → animated bracket → winner celebration) backed by Supabase Postgres.
- Provide an admin experience gated by PIN `4444` (office-only) to create/manage games, items, rounds, participants, emails, and exports.
- Support **any item count** using smart bracket generation with BYEs, tie handling, and round advancement.
- Ship with ContiBingo-like visual style (dark/glow cards, motion), theme editor, TV/display mode, and nice-to-haves (upsets, stats, CSV/export).
- End with Supabase SQL schema + RLS setup and **GitHub Pages deployment instructions** (hash routing).

---

## 2) Implementation Steps

### Phase 1 — Core POC (Isolation: Supabase + Bracket Engine) 
**Goal:** prove the failure-prone core works before building UI.

**User stories**
1. As an admin, I can create a game and items for any item count (e.g., 5, 7, 10, 13).
2. As a system, I can generate matches with BYEs and auto-advance correctly.
3. As a participant, I can submit exactly one vote per matchup.
4. As an admin, I can advance rounds and the next round matches are generated correctly.
5. As a system, I can detect ties and apply a configured tie-break mode.

**Steps**
- Web research (quick) on Supabase RLS patterns for “anonymous participants writing rows safely” + public read models.
- Create `supabase_schema.sql` (tables, indexes, constraints) matching the plan; add minimal RLS policies for:
  - public read of games/items/matches (scoped by game)
  - public insert for people/participants/predictions/votes
  - admin-only write policies approximated via a `is_admin_session` flag (PIN UX) **or** relaxed office-mode writes (documented).
- Build a Node/Python POC script (local, minimal):
  - connects using provided URL/key
  - creates a test game + N items
  - runs bracket generation → inserts round 1 matches
  - simulates votes → closes round → advances round → repeats until winner
  - asserts invariants: unique vote constraint, BYE auto-wins, next power-of-two slotting, exactly one final winner.
- Fix schema/policies + bracket logic until POC passes for multiple N values.

**Exit criteria**
- POC script completes successfully for N={2,5,7,10,13,19} and produces a valid champion.

---

### Phase 2 — V1 App Development (Core UX, minimal polish)
**Goal:** build the working app around the proven core; keep admin PIN simple; ensure all core states handled.

**User stories**
1. As a player, I can open a `/#/game/:slug` link, enter my full name once, confirm it, and stay logged in on this device.
2. As a first-time player, I can lock a champion prediction once and see it marked as “Your pick”.
3. As a player, I can vote through all open matchups with clear progress and can’t double-vote.
4. As a player, I can view the full bracket and see my votes/prediction and (if allowed) totals.
5. As an admin, I can create a game, add items, launch/open/close rounds, advance rounds, and end the game.

**Steps**
- Frontend foundation:
  - React app + Tailwind + Framer Motion; HashRouter routes: `/`, `/game/:slug`, `/admin`, `/admin/games/:id`, `/display/:slug`.
  - Supabase client setup via env vars.
  - Local identity: `local_device_id` + saved `person_id`/`participant_id` per game in localStorage.
- Data layer:
  - queries/mutations for people, games, items, participants, predictions, matches, votes.
  - computed “current state” selectors: needs_login / needs_prediction / can_vote / waiting / complete.
- Player UI:
  - Login card + confirmation modal.
  - Prediction grid (basic animation) + confirm lock.
  - Voting flow (one matchup at a time) + progress.
  - Bracket view (MVP rendering; readable rounds/columns).
  - Waiting + Winner screen (basic confetti optional here if quick).
- Admin UI (PIN `4444` gate):
  - Dashboard: list games, create new.
  - Game manager: setup (title/slug/questions/settings), items CRUD + reorder/randomize, preview bracket, controls (open/close/advance/end), participants list.
- Conclude with 1 E2E test pass (create game → join → predict → vote → advance → winner).

**Exit criteria**
- End-to-end flow works for a non-power-of-two bracket with BYEs.

---

### Phase 3 — Feature Expansion (Phase 2+3+4 items from spec)
**Goal:** add quality + polish + exports + theme editor + TV mode; modularize.

**User stories**
1. As an admin, I can add emails to global profiles and copy a BCC list for a game.
2. As a player, I can (when allowed) see vote totals/percentages and optionally voter names for completed matchups.
3. As an admin, I can resolve ties manually and override winners if needed.
4. As an admin, I can customize the game’s visual theme and see a live preview.
5. As an office viewer, I can open `/#/display/:slug` and see a clean animated bracket suitable for TV.

**Steps**
- Admin quality:
  - participant tools: reset prediction, reset vote, remove participant, view votes.
  - tie resolution UI + “Office Drama Mode” reveal animation.
  - email management tables + copy BCC + copy missing email names.
  - duplicate participant merge (by normalized name).
- Visual polish:
  - theme editor persisted to `games.style_json` + “ContiBingo preset”.
  - improved motion: sequential item entrance, matchup transitions, bracket winner slide.
  - winner confetti + “correct predictors” list + copy list.
- Gameplay enhancements:
  - upset label, vote margin, participation stats + prediction distribution.
  - CSV export for participants/votes/correct predictors.
- Conclude with 1 E2E test pass across: anonymous/public voting modes + tie scenario.

**Exit criteria**
- Admin can run a full game with emails/exports, ties, theme customization, and TV display mode.

---

### Phase 4 — Hardening, Edge Cases, Release (GitHub Pages)
**Goal:** stabilize and document deployment.

**User stories**
1. As a player, I can refresh mid-vote and resume without losing progress.
2. As a player, if admin advances while I’m voting, I’m guided to the correct current state.
3. As an admin, I can safely perform destructive actions with warnings and audit visibility.
4. As an admin, I can reopen a completed game if needed.
5. As a maintainer, I can deploy to GitHub Pages reliably with hash routing and Supabase env vars.

**Steps**
- Edge-case handling + UI states:
  - paused games, invalid slug, removed participant, prediction locked, round closed.
  - item edits after live: warn + guardrails.
- Data correctness:
  - tighten constraints/indexes; ensure match status transitions are consistent.
  - optional `game_events` audit log writeouts for admin actions.
- Final testing matrix:
  - N=2,5,7,10,13; ties; BYEs; anonymous vs public; show bracket before voting on/off.
- Deliver deployment docs:
  - `supabase_schema.sql` run steps.
  - GitHub Pages: build, set env vars, deploy via gh-pages/Actions, confirm hash routes.
  - note: admin PIN is UX-only; office-mode RLS posture documented.

---

## 3) Next Actions
1. Implement `supabase_schema.sql` + minimal RLS, run it in Supabase SQL editor.
2. Create POC script (bracket gen + insert matches + vote simulation + round advance) and run against Supabase.
3. Iterate until POC passes for multiple item counts (including BYEs and tie).
4. Scaffold React routes + Supabase client + local identity store.
5. Build V1 player flow screens, then admin create/manage/advance screens.

---

## 4) Success Criteria
- Core gameplay: join (name) → predict (locked) → vote (1 per match) → admin advances → BYEs handled → champion declared.
- Bracket supports any item count; next-power-of-two slotting and automatic BYE advancement works.
- Admin can manage games/items/rounds/participants, resolve ties, export emails/BCC, and view stats.
- Visual style matches ContiBingo vibe (dark, glow, smooth motion) with theme customization + TV mode.
- App deploys to GitHub Pages with hash routing and runs against Supabase using provided URL/key.
