// High-level bracket-service helpers used by both player & admin code paths.
// Builds round-1 from items, advances rounds, tallies votes, decides winners.

import { buildRound1Matches, buildNextRound, decideMatchWinner } from './bracket';
import {
  insertMatches, listMatches, listVotes, updateMatch,
  updateGame, deleteMatchesForGame, deleteVotesForGame, listItems, logEvent,
} from './db';

/**
 * Generate Round 1 matches & insert into DB.
 * If the game already has matches, it throws unless force=true (then it nukes prior matches+votes).
 */
export async function generateRound1(gameId, items, seeding = 'order', { force = false } = {}) {
  const existing = await listMatches(gameId);
  if (existing.length > 0) {
    if (!force) throw new Error('Bracket already exists. Use force=true to reset.');
    await deleteVotesForGame(gameId);
    await deleteMatchesForGame(gameId);
  }
  const cleanItems = items.filter((i) => i.is_active !== false);
  const r1 = buildRound1Matches(cleanItems, seeding).map((m) => ({ ...m, game_id: gameId }));
  if (r1.length === 0) throw new Error('Need at least 2 items.');
  const inserted = await insertMatches(r1);
  return inserted;
}

/**
 * Tally votes per match and write winner_item_id + status='complete' for the
 * given round. Tied matches are flagged 'tie_needs_resolution' (or auto-resolved
 * by tie_break_mode if it is 'random' or 'higher_seed').
 */
export async function closeRoundAndTally(gameId, roundNumber, tieBreakMode = 'admin', items = []) {
  const allMatches = await listMatches(gameId);
  const allVotes = await listVotes(gameId);
  const seedsById = {};
  for (const it of items) seedsById[it.id] = it.seed_number || 9999;

  const round = allMatches.filter((m) => m.round_number === roundNumber);
  const updates = [];
  let tieCount = 0;
  for (const m of round) {
    if (m.is_bye_match) continue;
    if (m.status === 'complete') continue;
    const tally = {};
    for (const v of allVotes) if (v.match_id === m.id) tally[v.selected_item_id] = (tally[v.selected_item_id] || 0) + 1;
    const decision = decideMatchWinner(m, tally, tieBreakMode, seedsById);
    if (decision.status === 'tie_needs_resolution') tieCount += 1;
    updates.push({ id: m.id, ...decision });
  }
  for (const u of updates) {
    await updateMatch(u.id, { winner_item_id: u.winner_item_id, status: u.status });
  }
  await logEvent(gameId, 'round_closed', { round: roundNumber, ties: tieCount });
  return { closedCount: updates.length, ties: tieCount };
}

/**
 * Generate the next round from current round's winners. Skips if any match is unresolved.
 */
export async function advanceRound(gameId) {
  const all = await listMatches(gameId);
  if (all.length === 0) throw new Error('No bracket yet.');
  const rounds = [...new Set(all.map((m) => m.round_number))].sort((a, b) => a - b);
  const currentRound = rounds[rounds.length - 1];
  const cur = all.filter((m) => m.round_number === currentRound);
  const unresolved = cur.filter((m) => !m.is_bye_match && m.status !== 'complete');
  if (unresolved.length > 0) throw new Error(`Round ${currentRound} has ${unresolved.length} unresolved matchups.`);
  if (cur.length <= 1) {
    // bracket already at the final
    const finalWinner = cur[0]?.winner_item_id || null;
    if (finalWinner) {
      await updateGame(gameId, { status: 'complete', winner_item_id: finalWinner, completed_at: new Date().toISOString() });
      await logEvent(gameId, 'game_completed', { winner_item_id: finalWinner });
    }
    return { advanced: false, complete: !!finalWinner };
  }
  const next = buildNextRound(cur, currentRound + 1).map((m) => ({ ...m, game_id: gameId }));
  const inserted = await insertMatches(next);
  await updateGame(gameId, { current_round_number: currentRound + 1 });
  await logEvent(gameId, 'round_advanced', { round: currentRound + 1 });
  // If the next round has only 1 match and it is a BYE that already auto-resolves
  if (inserted.length === 1 && inserted[0].is_bye_match && inserted[0].winner_item_id) {
    await updateGame(gameId, { status: 'complete', winner_item_id: inserted[0].winner_item_id, completed_at: new Date().toISOString() });
    return { advanced: true, complete: true };
  }
  return { advanced: true, complete: false };
}

/**
 * Re-fetch convenience.
 */
export async function loadBracketData(gameId) {
  const [items, matches, votes] = await Promise.all([
    listItems(gameId), listMatches(gameId), listVotes(gameId),
  ]);
  const itemsById = {};
  for (const it of items) itemsById[it.id] = it;
  const votesByMatch = {};
  for (const v of votes) {
    votesByMatch[v.match_id] = votesByMatch[v.match_id] || {};
    votesByMatch[v.match_id][v.selected_item_id] = (votesByMatch[v.match_id][v.selected_item_id] || 0) + 1;
  }
  return { items, itemsById, matches, votes, votesByMatch };
}
