// =====================================================================
// ContiBracket — Smart bracket generation
// Pure JS, no Supabase imports. Tested in isolation in /app/poc/test_core.js.
// =====================================================================

// Next power of two >= n
export function nextPowerOfTwo(n) {
  if (n < 1) return 1;
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

// Standard tournament seed slotting: returns an array of seed numbers (1..size)
// arranged so that seed 1 plays seed `size`, seed 2 plays seed `size-1`, etc.,
// and across rounds the top seeds meet only in later rounds.
export function seedSlots(size) {
  if (size === 1) return [1];
  let slots = [1, 2];
  while (slots.length < size) {
    const next = [];
    const newSize = slots.length * 2;
    for (const s of slots) {
      next.push(s);
      next.push(newSize + 1 - s);
    }
    slots = next;
  }
  return slots;
}

// Shuffle helper (Fisher-Yates)
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build round-1 matches for a list of items.
 * @param {Array<{id:string, seed_number?:number, sort_order?:number}>} items
 * @param {'manual'|'random'|'order'} seeding  manual = use seed_number, order = use sort_order, random = shuffle
 * @returns {Array<{round_number, match_number, slot_position, item_a_id, item_b_id, is_bye_match, status}>}
 */
export function buildRound1Matches(items, seeding = 'order') {
  const n = items.length;
  if (n < 2) return [];
  const size = nextPowerOfTwo(n);

  // Order items by seeding strategy
  let ordered;
  if (seeding === 'manual') {
    ordered = [...items].sort((a, b) => {
      const sa = a.seed_number ?? 9999;
      const sb = b.seed_number ?? 9999;
      if (sa !== sb) return sa - sb;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
  } else if (seeding === 'random') {
    ordered = shuffle(items);
  } else {
    ordered = [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  // Pad with nulls (BYEs) to fill to size
  const padded = [...ordered];
  while (padded.length < size) padded.push(null);

  // Slot indices via standard seed layout (1-based seeds → 0-based slot indices)
  const slotOrder = seedSlots(size); // length = size, values 1..size

  // Map slot 1..size → padded[i-1] (where i is the seed-positioning)
  // We'll just zip slotOrder pairs into matchups.
  const matches = [];
  let matchNumber = 1;
  for (let i = 0; i < size; i += 2) {
    const aSeed = slotOrder[i];
    const bSeed = slotOrder[i + 1];
    const a = padded[aSeed - 1] || null;
    const b = padded[bSeed - 1] || null;

    // Determine status & bye flag
    let status = 'pending';
    let isBye = false;
    let winnerItemId = null;
    if (!a && !b) {
      // both byes: still record as a placeholder bye match (helps next-round generation logic)
      status = 'bye';
      isBye = true;
    } else if (!a || !b) {
      status = 'complete';
      isBye = true;
      winnerItemId = (a || b).id;
    }

    matches.push({
      round_number: 1,
      match_number: matchNumber++,
      slot_position: i / 2,
      item_a_id: a ? a.id : null,
      item_b_id: b ? b.id : null,
      winner_item_id: winnerItemId,
      status,
      is_bye_match: isBye,
    });
  }
  return matches;
}

/**
 * Given a completed round (matches with winner_item_id set on every non-bye match
 * — bye matches already have winner_item_id from round-1 generation), produce the
 * next round's match objects. Returns [] if only one match remains (final).
 */
export function buildNextRound(prevRoundMatches, nextRoundNumber) {
  // Sort by slot_position to keep adjacency
  const sorted = [...prevRoundMatches].sort((a, b) => a.slot_position - b.slot_position);
  // Pair adjacent matches
  const nextMatches = [];
  let matchNumber = 1;
  for (let i = 0; i < sorted.length; i += 2) {
    const m1 = sorted[i];
    const m2 = sorted[i + 1];
    const a = m1 ? m1.winner_item_id : null;
    const b = m2 ? m2.winner_item_id : null;
    let status = 'pending';
    let isBye = false;
    let winnerItemId = null;
    if (!a && !b) {
      status = 'bye';
      isBye = true;
    } else if (!a || !b) {
      status = 'complete';
      isBye = true;
      winnerItemId = a || b;
    }
    nextMatches.push({
      round_number: nextRoundNumber,
      match_number: matchNumber++,
      slot_position: i / 2,
      item_a_id: a,
      item_b_id: b,
      winner_item_id: winnerItemId,
      status,
      is_bye_match: isBye,
    });
  }
  return nextMatches;
}

/**
 * Decide a winner for a given match using its votes and tie-break mode.
 * @param {{item_a_id:string,item_b_id:string,seed_a?:number,seed_b?:number}} match
 * @param {{[itemId:string]: number}} voteTally
 * @param {'admin'|'random'|'higher_seed'} tieMode
 * @returns {{winner_item_id:string|null, status:string}}
 */
export function decideMatchWinner(match, voteTally, tieMode = 'admin', seeds = {}) {
  const a = match.item_a_id;
  const b = match.item_b_id;
  if (!a && !b) return { winner_item_id: null, status: 'bye' };
  if (!a || !b) return { winner_item_id: a || b, status: 'complete' };
  const va = voteTally[a] || 0;
  const vb = voteTally[b] || 0;
  if (va > vb) return { winner_item_id: a, status: 'complete' };
  if (vb > va) return { winner_item_id: b, status: 'complete' };
  // tie
  if (tieMode === 'random') {
    return { winner_item_id: Math.random() < 0.5 ? a : b, status: 'complete' };
  }
  if (tieMode === 'higher_seed') {
    const sa = seeds[a] ?? 9999;
    const sb = seeds[b] ?? 9999;
    if (sa < sb) return { winner_item_id: a, status: 'complete' };
    if (sb < sa) return { winner_item_id: b, status: 'complete' };
    // still tied → admin
    return { winner_item_id: null, status: 'tie_needs_resolution' };
  }
  return { winner_item_id: null, status: 'tie_needs_resolution' };
}

// Total number of rounds for an item count
export function totalRounds(itemCount) {
  if (itemCount < 2) return 0;
  return Math.log2(nextPowerOfTwo(itemCount));
}

// Matches that should be voted on (skip byes, skip already complete)
export function activeVoteableMatches(roundMatches) {
  return roundMatches.filter(m => !m.is_bye_match && m.item_a_id && m.item_b_id && m.status !== 'complete');
}
