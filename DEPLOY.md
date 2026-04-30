# 🏆 ContiBracket — Deploy & Operations Guide

This guide covers everything you need to (a) understand the app, (b) ship it to GitHub Pages, and (c) run office brackets day-to-day.

---

## 1. What's in the box

ContiBracket is a **frontend-only React app** that talks directly to **Supabase Postgres** from the browser. There is no backend service to deploy.

```
/app/
├── frontend/                # The whole app lives here
│   ├── src/
│   │   ├── App.js                   # HashRouter + page routes
│   │   ├── index.css                # Theme tokens (CSS variables)
│   │   ├── lib/
│   │   │   ├── supabaseClient.js    # @supabase/supabase-js setup
│   │   │   ├── db.js                # Data access (CRUD)
│   │   │   ├── bracket.js           # Pure bracket-engine algorithm
│   │   │   ├── bracketService.js    # Generate / advance / tally
│   │   │   └── identity.js          # Local name + admin PIN session
│   │   ├── components/              # GlowCard, BracketView, etc.
│   │   │   └── admin/               # Admin-only tab subcomponents
│   │   └── pages/                   # Landing, PlayerGame, AdminGate,
│   │                                # AdminDashboard, AdminGameManager,
│   │                                # DisplayMode, NotFound
│   └── .env                         # Supabase URL + anon key + PIN
├── poc/test_core.js                 # Standalone POC (Node)
└── supabase_schema.sql              # One-time DB schema
```

### Routes (hash-based for GitHub Pages)
| URL                              | Page                                |
|----------------------------------|-------------------------------------|
| `/#/`                            | Landing                             |
| `/#/game/<slug>`                 | Player flow (join → predict → vote → bracket → winner) |
| `/#/admin`                       | Admin PIN gate                      |
| `/#/admin/dashboard`             | Admin dashboard (list of games)     |
| `/#/admin/games/<gameId>`        | Game manager (Overview / Items / Participants / Votes / Style / Settings / Danger) |
| `/#/display/<slug>`              | TV display mode (no controls)       |

---

## 2. Supabase setup (once)

You already did this during build, but for a clean re-deploy:

1. Create a project at https://supabase.com.
2. Open **SQL Editor → New query**, paste the entire contents of [`/app/supabase_schema.sql`](./supabase_schema.sql), and click **Run**.
3. Then run this **second snippet** (required because new `sb_publishable_*` keys always enforce RLS):

   ```sql
   do $$
   declare
     t text;
     tables text[] := array[
       'people','person_private_info','games','game_items',
       'game_participants','champion_predictions','matches','votes','game_events'
     ];
   begin
     foreach t in array tables loop
       execute format('alter table public.%I enable row level security', t);
       execute format('grant select, insert, update, delete on public.%I to anon, authenticated', t);
       execute format('drop policy if exists "office_all_select" on public.%I', t);
       execute format('drop policy if exists "office_all_insert" on public.%I', t);
       execute format('drop policy if exists "office_all_update" on public.%I', t);
       execute format('drop policy if exists "office_all_delete" on public.%I', t);
       execute format('create policy "office_all_select" on public.%I for select to anon, authenticated using (true)', t);
       execute format('create policy "office_all_insert" on public.%I for insert to anon, authenticated with check (true)', t);
       execute format('create policy "office_all_update" on public.%I for update to anon, authenticated using (true) with check (true)', t);
       execute format('create policy "office_all_delete" on public.%I for delete to anon, authenticated using (true)', t);
     end loop;
   end $$;
   ```

4. From **Settings → API**, copy your **Project URL** and your **publishable** (`sb_publishable_...`) key. Put them into `frontend/.env`:

   ```bash
   REACT_APP_SUPABASE_URL=https://<your-project-ref>.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=sb_publishable_...
   REACT_APP_ADMIN_PIN=4444   # office-only PIN
   ```

> **Security note (already accepted by you):** The PIN gate is UX-only. Anyone who knows your Supabase URL+anon key can technically write to the database. This is fine for an internal office game on a trusted network. If you ever need stricter rules, replace the office-mode RLS policies with conditional ones (e.g., `using (auth.role() = 'authenticated')`).

---

## 3. Deploy to GitHub Pages

### Option A — gh-pages branch (simplest)

1. Initialize a repo and push the `frontend/` folder (or root, your call). Inside `frontend/package.json`, add:

   ```json
   "homepage": "https://<your-org>.github.io/contibracket",
   "scripts": {
     "predeploy": "yarn build",
     "deploy": "gh-pages -d build"
   }
   ```

   …and:
   ```bash
   yarn add -D gh-pages
   ```

2. Build & deploy:

   ```bash
   yarn deploy
   ```

3. In your repo settings → **Pages** → **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `gh-pages` / `(root)`

4. Wait ~30s → visit `https://<your-org>.github.io/contibracket/#/`. ✅

### Option B — GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'yarn'
          cache-dependency-path: frontend/yarn.lock
      - run: cd frontend && yarn install --frozen-lockfile
      - run: cd frontend && yarn build
        env:
          REACT_APP_SUPABASE_URL: ${{ secrets.REACT_APP_SUPABASE_URL }}
          REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.REACT_APP_SUPABASE_ANON_KEY }}
          REACT_APP_ADMIN_PIN: ${{ secrets.REACT_APP_ADMIN_PIN }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/build
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then in **Repo → Settings → Secrets → Actions**, add the three `REACT_APP_*` secrets.
**Pages → Source: GitHub Actions.**

### Hash routing & GitHub Pages

We use `HashRouter` so deep links like `/#/game/best-snack-2026` work without any 404.html hack. ✅

---

## 4. Running an office bracket — day-to-day playbook

### Create
1. Open `/#/admin` → enter **4444**.
2. Click **New game** → fill in title (e.g., "Best Holiday Treat"). Auto-slug.
3. **Bracket items** tab → add items (each can have an image: drag a small PNG/JPG, it'll be auto-resized to ~600px and stored as base64).
4. *(optional)* **Style** tab → tweak colors or pick "Tournament Night Pink".
5. *(optional)* **Settings** tab → toggle anonymous voting, drama mode, etc.
6. **Overview** tab → click **Launch bracket**.

### Share
- Copy player link (top-right of game manager): paste in Slack / Teams.
- Copy TV link → open on the office TV browser → leave it on the cast.

### Run
- Watch the **Round votes / Missing voters** counters on the game header.
- When everyone has voted (or your patience runs out): **Close round N** → if any ties, **Resolve ties** in the Votes tab → **Advance to round N+1**.
- Repeat until: 🎉 *Game complete — champion crowned!*

### After
- **Participants** tab → **Copy BCC list** (email everyone), **Copy correct predictors** (give them a high five), **Export CSV** (analytics).

### Edge handling — what's covered out of the box
- **Any item count** (2 → 32+): smart bracket gen with BYEs auto-advanced.
- **Refreshing mid-vote**: identity persists in `localStorage`; resumes wherever you left off.
- **Closing browser**: same.
- **Admin advances mid-vote**: player UI auto-detects the new round on next poll (every 4s).
- **Tied matches**: flagged, blocks advance until admin decides (or auto by `random` / `higher_seed` if configured).
- **Item edits after launch**: allowed, but use **Regenerate bracket** if you change the lineup substantially.
- **Pause / Reopen / End**: all supported with destructive-action confirmations.
- **Removed participants**: soft-removed (greyed in list), can be re-added; or purge to hard-delete.

---

## 5. Local development

```bash
cd /app/frontend
yarn install
yarn start          # → http://localhost:3000 (auto opens)
```

Make sure `frontend/.env` has the three `REACT_APP_*` vars.

To re-run the bracket-engine + Supabase round-trip POC:

```bash
NODE_PATH=/app/frontend/node_modules node /app/poc/test_core.js
```

---

## 6. Known limits / not implemented

- Live admin dashboard updates use a 4-second poll. If you want push-style realtime (a.k.a. votes appearing instantly on the TV), enable Supabase Realtime on `votes` and `matches` tables (commented snippet at the bottom of `supabase_schema.sql`).
- `participant_link_token` column exists in the schema but is unused (the slug is the link). Reserved for future per-link tokens.
- Office Drama Mode toggle exists in Settings but the per-matchup spotlight reveal is currently rendered as the standard winner glow (no extra spotlight overlay). Easy to extend later.
- The PIN is shipped in the bundle (it's office-only by your choice). To rotate, set `REACT_APP_ADMIN_PIN` and redeploy.

---

## 7. Troubleshooting

**"new row violates row-level security policy"**
→ Re-run the second SQL block in §2 step 3. New publishable keys require explicit policies.

**Blank page on GitHub Pages**
→ Ensure your `homepage` field in `package.json` matches your actual deploy URL exactly.
→ Check browser console for missing env vars (deploy with the env injected).

**Player joined but doesn't appear in admin**
→ Refresh the game manager. Live polling kicks in every ~4s.

---

Built with ❤️ for office tournament nights. Have fun, and may the best snack win.
