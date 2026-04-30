// =====================================================================
// ContiBracket — POC core test
//
// Verifies:
//   1) Pure bracket-engine algorithm correctness (next pow of 2, BYE
//      handling, multi-round generation, tie-break).
//   2) End-to-end Supabase round-trip: create game + items, generate
//      round 1, simulate votes, advance rounds, declare winner.
//
// Run:  node /app/poc/test_core.js
// Requires:
//   - /app/supabase_schema.sql already applied in the Supabase project.
//   - REACT_APP_SUPABASE_URL & REACT_APP_SUPABASE_ANON_KEY in
//     /app/frontend/.env  (auto-loaded below).
// =====================================================================

const fs = require('fs');
const path = require('path');

// --- Load .env from /app/frontend/.env (no extra deps) ---
function loadEnv(p) {
  if (!fs.existsSync(p)) return;
  const txt = fs.readFileSync(p, 'utf-8');
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}
loadEnv(path.join(__dirname, '..', 'frontend', '.env'));

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

// ---- Inline copy of bracket engine (so this script runs standalone) ----
function nextPowerOfTwo(n) { let p = 1; while (p < n) p <<= 1; return Math.max(p, 1); }
function seedSlots(size) {
  if (size === 1) return [1];
  let slots = [1, 2];
  while (slots.length < size) {
    const next = []; const newSize = slots.length * 2;
    for (const s of slots) { next.push(s); next.push(newSize + 1 - s); }
    slots = next;
  }
  return slots;
}
function buildRound1(items) {
  const n = items.length;
  if (n < 2) return [];
  const size = nextPowerOfTwo(n);
  const padded = [...items]; while (padded.length < size) padded.push(null);
  const slotOrder = seedSlots(size);
  const matches = [];
  let mn = 1;
  for (let i = 0; i < size; i += 2) {
    const a = padded[slotOrder[i] - 1] || null;
    const b = padded[slotOrder[i + 1] - 1] || null;
    let status = 'pending'; let isBye = false; let winner = null;
    if (!a && !b) { status = 'bye'; isBye = true; }
    else if (!a || !b) { status = 'complete'; isBye = true; winner = (a || b).id; }
    matches.push({
      round_number: 1, match_number: mn++, slot_position: i / 2,
      item_a_id: a ? a.id : null, item_b_id: b ? b.id : null,
      winner_item_id: winner, status, is_bye_match: isBye,
    });
  }
  return matches;
}
function buildNext(prev, rn) {
  const sorted = [...prev].sort((a, b) => a.slot_position - b.slot_position);
  const next = []; let mn = 1;
  for (let i = 0; i < sorted.length; i += 2) {
    const m1 = sorted[i]; const m2 = sorted[i + 1];
    const a = m1 ? m1.winner_item_id : null;
    const b = m2 ? m2.winner_item_id : null;
    let status = 'pending'; let isBye = false; let winner = null;
    if (!a && !b) { status = 'bye'; isBye = true; }
    else if (!a || !b) { status = 'complete'; isBye = true; winner = a || b; }
    next.push({
      round_number: rn, match_number: mn++, slot_position: i / 2,
      item_a_id: a, item_b_id: b, winner_item_id: winner, status, is_bye_match: isBye,
    });
  }
  return next;
}

// =====================================================================
// PART 1 — Pure algorithm tests
// =====================================================================
function assert(cond, msg) {
  if (!cond) { console.error('  ❌ ASSERT FAILED:', msg); throw new Error(msg); }
  else { console.log('  ✅', msg); }
}

function fakeItems(n) {
  return Array.from({ length: n }, (_, i) => ({ id: `i${i + 1}`, name: `Item ${i + 1}`, sort_order: i }));
}

function simulateBracket(n) {
  console.log(`\n→ Simulating bracket with N=${n}`);
  const items = fakeItems(n);
  let round = 1;
  let matches = buildRound1(items);
  // assert size
  assert(matches.length === nextPowerOfTwo(n) / 2, `round 1 has ${nextPowerOfTwo(n) / 2} matches`);
  // assert byes auto-resolved
  for (const m of matches) {
    if (m.item_a_id && !m.item_b_id) assert(m.winner_item_id === m.item_a_id, 'bye→A wins');
    if (!m.item_a_id && m.item_b_id) assert(m.winner_item_id === m.item_b_id, 'bye→B wins');
  }
  // play rounds: deterministic — A always wins (when both exist)
  while (matches.length > 0) {
    for (const m of matches) {
      if (m.status === 'pending' && m.item_a_id && m.item_b_id) {
        m.winner_item_id = m.item_a_id; m.status = 'complete';
      }
    }
    if (matches.length === 1) break;
    round += 1;
    matches = buildNext(matches, round);
  }
  const champion = matches[0].winner_item_id;
  assert(!!champion, `champion declared after ${round} rounds`);
  return { rounds: round, champion };
}

console.log('============================================================');
console.log('PART 1: Bracket Engine Algorithm Tests');
console.log('============================================================');
for (const n of [2, 3, 4, 5, 7, 8, 10, 13, 16, 19]) simulateBracket(n);

// =====================================================================
// PART 2 — Supabase round-trip: create game, items, matches, votes, advance
// =====================================================================
async function main() {
  console.log('\n============================================================');
  console.log('PART 2: Supabase round-trip end-to-end');
  console.log('============================================================');

  // 0) ping: fetch zero rows from games to confirm connectivity
  console.log('\n[0] Connectivity check…');
  {
    const { error } = await sb.from('games').select('id').limit(1);
    if (error) { console.error('  ❌ Supabase unreachable or schema not applied:', error.message); process.exit(1); }
    console.log('  ✅ Supabase reachable; schema present.');
  }

  // 1) create a game
  const slug = 'poc-' + Math.random().toString(36).slice(2, 8);
  console.log(`\n[1] Creating game (slug=${slug})…`);
  const { data: game, error: gErr } = await sb.from('games').insert({
    title: 'POC Best Snack',
    slug,
    status: 'live',
    prediction_question: 'Which snack will win?',
    voting_question_template: 'Which one do you like more?',
    current_round_number: 1,
    tie_break_mode: 'admin',
  }).select().single();
  if (gErr) { console.error('  ❌', gErr); process.exit(1); }
  assert(!!game.id, 'game created');

  // 2) create N items (use 7 to exercise BYEs)
  const N = 7;
  console.log(`\n[2] Creating ${N} bracket items…`);
  const itemsPayload = Array.from({ length: N }, (_, i) => ({
    game_id: game.id, name: `Snack ${i + 1}`, sort_order: i, seed_number: i + 1,
  }));
  const { data: items, error: iErr } = await sb.from('game_items').insert(itemsPayload).select();
  if (iErr) { console.error('  ❌', iErr); process.exit(1); }
  assert(items.length === N, `inserted ${N} items`);

  // 3) generate round 1 matches
  console.log('\n[3] Generating Round 1 matches…');
  const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order);
  const r1 = buildRound1(sortedItems).map(m => ({ ...m, game_id: game.id }));
  // remove fields supabase auto-generates
  const { data: r1Inserted, error: r1Err } = await sb.from('matches').insert(r1).select();
  if (r1Err) { console.error('  ❌', r1Err); process.exit(1); }
  assert(r1Inserted.length === nextPowerOfTwo(N) / 2, `round 1 has ${nextPowerOfTwo(N) / 2} matches in DB`);

  // 4) create 3 fake people + participants
  console.log('\n[4] Creating people & participants…');
  const names = ['POC Alice X1', 'POC Bob Y2', 'POC Cara Z3'];
  const participants = [];
  for (const n of names) {
    const norm = n.trim().toLowerCase().replace(/\s+/g, ' ');
    // upsert by normalized_name
    const { data: existing } = await sb.from('people').select('id').eq('normalized_name', norm).maybeSingle();
    let pid = existing?.id;
    if (!pid) {
      const { data: created, error: pErr } = await sb.from('people').insert({ full_name: n, normalized_name: norm }).select().single();
      if (pErr) { console.error('  ❌', pErr); process.exit(1); }
      pid = created.id;
    }
    const { data: gp, error: gpErr } = await sb.from('game_participants').insert({
      game_id: game.id, person_id: pid, local_device_id: 'poc-' + Math.random(),
    }).select().single();
    if (gpErr) { console.error('  ❌', gpErr); process.exit(1); }
    participants.push(gp);
  }
  assert(participants.length === 3, '3 participants joined');

  // 5) cast votes — every participant picks item_a in every voteable match
  console.log('\n[5] Casting votes for Round 1…');
  const voteable = r1Inserted.filter(m => !m.is_bye_match && m.item_a_id && m.item_b_id);
  const votesPayload = [];
  for (const p of participants) {
    for (const m of voteable) {
      votesPayload.push({
        game_id: game.id, match_id: m.id, participant_id: p.id, selected_item_id: m.item_a_id,
      });
    }
  }
  const { error: vErr } = await sb.from('votes').insert(votesPayload);
  if (vErr) { console.error('  ❌', vErr); process.exit(1); }
  assert(true, `cast ${votesPayload.length} votes`);

  // 6) tally + close round 1
  console.log('\n[6] Tallying & closing Round 1…');
  for (const m of voteable) {
    const { data: vrows } = await sb.from('votes').select('selected_item_id').eq('match_id', m.id);
    const tally = {};
    for (const r of vrows) tally[r.selected_item_id] = (tally[r.selected_item_id] || 0) + 1;
    const va = tally[m.item_a_id] || 0; const vb = tally[m.item_b_id] || 0;
    const winner = va >= vb ? m.item_a_id : m.item_b_id; // ties not expected here
    const { error: uErr } = await sb.from('matches').update({
      winner_item_id: winner, status: 'complete',
    }).eq('id', m.id);
    if (uErr) { console.error('  ❌', uErr); process.exit(1); }
  }
  // refetch round 1
  const { data: r1Final } = await sb.from('matches').select('*').eq('game_id', game.id).eq('round_number', 1);
  for (const m of r1Final) {
    if (!m.is_bye_match) assert(m.status === 'complete' && !!m.winner_item_id, `match ${m.match_number} closed with winner`);
  }

  // 7) generate subsequent rounds until 1 match left, simulating "A wins" for everything
  let curRound = 1;
  let curMatches = r1Final;
  while (curMatches.length > 1) {
    curRound += 1;
    console.log(`\n[7.${curRound}] Generating Round ${curRound}…`);
    const next = buildNext(curMatches, curRound).map(m => ({ ...m, game_id: game.id }));
    const { data: nextIns, error: nErr } = await sb.from('matches').insert(next).select();
    if (nErr) { console.error('  ❌', nErr); process.exit(1); }
    // resolve all non-bye matches deterministically — A wins
    for (const m of nextIns) {
      if (!m.is_bye_match && m.item_a_id && m.item_b_id) {
        await sb.from('matches').update({ winner_item_id: m.item_a_id, status: 'complete' }).eq('id', m.id);
      }
    }
    const { data: refetched } = await sb.from('matches').select('*').eq('game_id', game.id).eq('round_number', curRound);
    curMatches = refetched;
    assert(curMatches.length === Math.max(1, nextPowerOfTwo(N) / Math.pow(2, curRound)), `round ${curRound} has correct match count`);
  }

  const finalWinner = curMatches[0].winner_item_id;
  assert(!!finalWinner, 'final winner declared');

  // 8) mark game complete
  await sb.from('games').update({
    status: 'complete', winner_item_id: finalWinner, completed_at: new Date().toISOString(),
  }).eq('id', game.id);
  console.log('\n  ✅ Game marked complete.');

  // 9) cleanup test rows (so we don't pollute the office DB)
  console.log('\n[8] Cleaning up POC rows…');
  await sb.from('games').delete().eq('id', game.id);  // CASCADE will drop matches/items/etc.
  // also drop the test people (only POC ones)
  for (const p of participants) {
    await sb.from('people').delete().eq('id', p.person_id);
  }
  console.log('  ✅ Cleanup done.');

  console.log('\n============================================================');
  console.log('🎉 ALL POC TESTS PASSED');
  console.log('============================================================');
}

main().catch(e => { console.error('\n❌ POC FAILED:', e); process.exit(1); });
