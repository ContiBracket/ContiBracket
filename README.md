# ContiBracket

An internal office popularity-bracket voting game. Admin creates themed brackets (e.g. "Best Snack"), teammates join via a link, lock a champion prediction, and vote round-by-round until one item wins.

**Stack:** React (CRA) + Tailwind + Framer Motion + Supabase (Postgres) — pure static frontend, deployed to GitHub Pages.

## Live deploy

After this repo finishes deploying via GitHub Actions, the app will be at:
`https://<your-user>.github.io/<this-repo>/`

- Landing:   `https://<your-user>.github.io/<this-repo>/#/`
- Admin:     `https://<your-user>.github.io/<this-repo>/#/admin`  (PIN `4444`)
- Player:    `https://<your-user>.github.io/<this-repo>/#/game/<slug>`
- Office TV: `https://<your-user>.github.io/<this-repo>/#/display/<slug>`

See **[DEPLOY.md](./DEPLOY.md)** for full setup, Supabase SQL, and an operator playbook.

## Local dev

```bash
cd frontend
yarn install
# create frontend/.env with:
#   REACT_APP_SUPABASE_URL=...
#   REACT_APP_SUPABASE_ANON_KEY=sb_publishable_...
#   REACT_APP_ADMIN_PIN=4444
yarn start
```
