-- =====================================================================
-- ContiBracket — Supabase Postgres Schema
-- Run this once in your Supabase Project's SQL editor.
-- (Dashboard → SQL Editor → New query → paste → Run)
--
-- Security posture: This is an internal office app. We do NOT use
-- Supabase Auth for players. All tables are written/read by the anon
-- role directly from the browser. We disable RLS for the listed tables
-- to keep this simple. If you ever need stricter rules, swap to
-- permissive policies. (See bottom of file.)
-- =====================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- people: global person profile (cross-game identity by normalized name)
-- ---------------------------------------------------------------------
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  normalized_name text not null unique,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
create index if not exists idx_people_normalized_name on public.people (normalized_name);

-- ---------------------------------------------------------------------
-- person_private_info: admin-only email/notes (no PII to players)
-- ---------------------------------------------------------------------
create table if not exists public.person_private_info (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null unique references public.people(id) on delete cascade,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_person_private_info_person on public.person_private_info (person_id);

-- ---------------------------------------------------------------------
-- games: a single bracket game
-- ---------------------------------------------------------------------
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  status text not null default 'draft',           -- draft | live | paused | complete
  prediction_question text not null default 'What do you think wins this bracket?',
  voting_question_template text not null default 'Which one do you like more?',
  current_round_number integer not null default 0,
  participant_link_token text,
  anonymous_voting_enabled boolean not null default true,
  show_vote_totals boolean not null default true,
  show_voter_names boolean not null default false,
  show_bracket_before_voting boolean not null default true,
  tie_break_mode text not null default 'admin',   -- admin | random | higher_seed
  drama_mode boolean not null default false,
  style_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  winner_item_id uuid
);
create index if not exists idx_games_slug on public.games (slug);
create index if not exists idx_games_status on public.games (status);

-- ---------------------------------------------------------------------
-- game_items: bracket items
-- ---------------------------------------------------------------------
create table if not exists public.game_items (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  name text not null,
  description text,
  image_url text,                                 -- base64 data URL OR remote URL
  seed_number integer,
  sort_order integer not null default 0,
  color_json jsonb not null default '{}'::jsonb,  -- {bg, text, accent, glow}
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_game_items_game on public.game_items (game_id);
create index if not exists idx_game_items_sort on public.game_items (game_id, sort_order);

-- now we can attach the FK on games.winner_item_id (after game_items exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'games_winner_item_id_fkey'
  ) then
    alter table public.games
      add constraint games_winner_item_id_fkey
      foreign key (winner_item_id) references public.game_items(id) on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- game_participants: a person joined to a game
-- ---------------------------------------------------------------------
create table if not exists public.game_participants (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  local_device_id text,
  is_removed boolean not null default false,
  unique (game_id, person_id)
);
create index if not exists idx_game_participants_game on public.game_participants (game_id);
create index if not exists idx_game_participants_person on public.game_participants (person_id);

-- ---------------------------------------------------------------------
-- champion_predictions: one prediction per (game, participant)
-- ---------------------------------------------------------------------
create table if not exists public.champion_predictions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  participant_id uuid not null references public.game_participants(id) on delete cascade,
  item_id uuid not null references public.game_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (game_id, participant_id)
);
create index if not exists idx_predictions_game on public.champion_predictions (game_id);

-- ---------------------------------------------------------------------
-- matches: round matchups
-- status: pending | open | closed | complete | tie_needs_resolution | bye
-- ---------------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  round_number integer not null,
  match_number integer not null,
  slot_position integer not null default 0,
  item_a_id uuid references public.game_items(id) on delete set null,
  item_b_id uuid references public.game_items(id) on delete set null,
  winner_item_id uuid references public.game_items(id) on delete set null,
  status text not null default 'pending',
  is_bye_match boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_matches_game on public.matches (game_id);
create index if not exists idx_matches_game_round on public.matches (game_id, round_number);

-- ---------------------------------------------------------------------
-- votes: one vote per (match, participant)
-- ---------------------------------------------------------------------
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  participant_id uuid not null references public.game_participants(id) on delete cascade,
  selected_item_id uuid not null references public.game_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (match_id, participant_id)
);
create index if not exists idx_votes_match on public.votes (match_id);
create index if not exists idx_votes_game on public.votes (game_id);
create index if not exists idx_votes_participant on public.votes (participant_id);

-- ---------------------------------------------------------------------
-- game_events: optional audit log
-- ---------------------------------------------------------------------
create table if not exists public.game_events (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete cascade,
  event_type text not null,
  event_payload_json jsonb not null default '{}'::jsonb,
  created_by_admin_id text,
  created_at timestamptz not null default now()
);
create index if not exists idx_game_events_game on public.game_events (game_id);

-- =====================================================================
-- Office-mode Security
-- =====================================================================
-- We disable RLS on all tables so the anon key can read/write directly.
-- This is appropriate for an internal office popularity game where the
-- worst-case is a coworker editing a vote. If you ever need stricter
-- rules, replace these statements with policies.

alter table public.people                  disable row level security;
alter table public.person_private_info     disable row level security;
alter table public.games                   disable row level security;
alter table public.game_items              disable row level security;
alter table public.game_participants       disable row level security;
alter table public.champion_predictions    disable row level security;
alter table public.matches                 disable row level security;
alter table public.votes                   disable row level security;
alter table public.game_events             disable row level security;

-- =====================================================================
-- (Optional) Realtime: enable replication on votes & matches if you
-- want the admin dashboard to update live. You can also do this from
-- Dashboard → Database → Replication.
-- =====================================================================
-- alter publication supabase_realtime add table public.votes;
-- alter publication supabase_realtime add table public.matches;

-- =====================================================================
-- DONE.
-- =====================================================================
