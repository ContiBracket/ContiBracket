// Thin Supabase data-access layer specific to ContiBracket.
// All operations are anonymous (no Auth). Office-mode RLS allows full CRUD.

import { supabase } from './supabaseClient';
import { normalizeName, getOrCreateDeviceId } from './identity';

// ----------------- People -----------------
export async function upsertPerson(fullName) {
  const norm = normalizeName(fullName);
  if (!norm) throw new Error('Name required');
  const { data: existing } = await supabase
    .from('people').select('*').eq('normalized_name', norm).maybeSingle();
  if (existing) {
    await supabase.from('people').update({ last_seen_at: new Date().toISOString() }).eq('id', existing.id);
    return existing;
  }
  const { data, error } = await supabase.from('people')
    .insert({ full_name: fullName.trim(), normalized_name: norm }).select().single();
  if (error) throw error;
  return data;
}

// ----------------- Games -----------------
export async function listGames() {
  const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getGameBySlug(slug) {
  const { data, error } = await supabase.from('games').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getGameById(id) {
  const { data, error } = await supabase.from('games').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createGame(payload) {
  const { data, error } = await supabase.from('games').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateGame(id, patch) {
  const { data, error } = await supabase.from('games').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGame(id) {
  const { error } = await supabase.from('games').delete().eq('id', id);
  if (error) throw error;
}

// ----------------- Items -----------------
export async function listItems(gameId) {
  const { data, error } = await supabase.from('game_items').select('*').eq('game_id', gameId).order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createItem(payload) {
  const { data, error } = await supabase.from('game_items').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateItem(id, patch) {
  const { data, error } = await supabase.from('game_items').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteItem(id) {
  const { error } = await supabase.from('game_items').delete().eq('id', id);
  if (error) throw error;
}

// ----------------- Participants -----------------
export async function joinGame(gameId, fullName) {
  const person = await upsertPerson(fullName);
  const deviceId = getOrCreateDeviceId();
  // upsert participant by (game_id, person_id)
  const { data: existing } = await supabase
    .from('game_participants').select('*')
    .eq('game_id', gameId).eq('person_id', person.id).maybeSingle();
  if (existing) {
    await supabase.from('game_participants').update({
      last_seen_at: new Date().toISOString(),
      local_device_id: deviceId,
      is_removed: false,
    }).eq('id', existing.id);
    return { person, participant: existing };
  }
  const { data, error } = await supabase.from('game_participants').insert({
    game_id: gameId, person_id: person.id, local_device_id: deviceId,
  }).select().single();
  if (error) throw error;
  return { person, participant: data };
}

export async function listParticipants(gameId) {
  const { data, error } = await supabase
    .from('game_participants')
    .select('*, people(*)')
    .eq('game_id', gameId)
    .order('joined_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function removeParticipant(participantId) {
  const { error } = await supabase.from('game_participants').update({ is_removed: true }).eq('id', participantId);
  if (error) throw error;
}

export async function unremoveParticipant(participantId) {
  const { error } = await supabase.from('game_participants').update({ is_removed: false }).eq('id', participantId);
  if (error) throw error;
}

export async function deleteParticipant(participantId) {
  const { error } = await supabase.from('game_participants').delete().eq('id', participantId);
  if (error) throw error;
}

// ----------------- Predictions -----------------
export async function getPrediction(gameId, participantId) {
  const { data, error } = await supabase.from('champion_predictions')
    .select('*').eq('game_id', gameId).eq('participant_id', participantId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createPrediction(gameId, participantId, itemId) {
  const { data, error } = await supabase.from('champion_predictions')
    .insert({ game_id: gameId, participant_id: participantId, item_id: itemId }).select().single();
  if (error) throw error;
  return data;
}

export async function deletePrediction(predictionId) {
  const { error } = await supabase.from('champion_predictions').delete().eq('id', predictionId);
  if (error) throw error;
}

export async function listPredictions(gameId) {
  const { data, error } = await supabase.from('champion_predictions').select('*').eq('game_id', gameId);
  if (error) throw error;
  return data || [];
}

// ----------------- Matches -----------------
export async function listMatches(gameId) {
  const { data, error } = await supabase.from('matches').select('*').eq('game_id', gameId).order('round_number').order('match_number');
  if (error) throw error;
  return data || [];
}

export async function insertMatches(matches) {
  const { data, error } = await supabase.from('matches').insert(matches).select();
  if (error) throw error;
  return data;
}

export async function updateMatch(id, patch) {
  const { data, error } = await supabase.from('matches').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMatchesForGame(gameId) {
  const { error } = await supabase.from('matches').delete().eq('game_id', gameId);
  if (error) throw error;
}

// ----------------- Votes -----------------
export async function listVotes(gameId) {
  const { data, error } = await supabase.from('votes').select('*').eq('game_id', gameId);
  if (error) throw error;
  return data || [];
}

export async function castVote(gameId, matchId, participantId, selectedItemId) {
  // upsert via on_conflict
  const { data, error } = await supabase.from('votes')
    .upsert({ game_id: gameId, match_id: matchId, participant_id: participantId, selected_item_id: selectedItemId }, { onConflict: 'match_id,participant_id' })
    .select().single();
  if (error) throw error;
  return data;
}

export async function deleteVotesForParticipantMatch(matchId, participantId) {
  const { error } = await supabase.from('votes').delete().eq('match_id', matchId).eq('participant_id', participantId);
  if (error) throw error;
}

export async function deleteVotesForParticipant(gameId, participantId) {
  const { error } = await supabase.from('votes').delete().eq('game_id', gameId).eq('participant_id', participantId);
  if (error) throw error;
}

export async function deleteVotesForGame(gameId) {
  const { error } = await supabase.from('votes').delete().eq('game_id', gameId);
  if (error) throw error;
}

// ----------------- Private info (admin-only) -----------------
export async function listPrivateInfoMap() {
  const { data, error } = await supabase.from('person_private_info').select('*');
  if (error) throw error;
  const m = {};
  for (const r of (data || [])) m[r.person_id] = r;
  return m;
}

export async function setPersonEmail(personId, email) {
  // upsert
  const { data: existing } = await supabase.from('person_private_info').select('*').eq('person_id', personId).maybeSingle();
  if (existing) {
    const { data, error } = await supabase.from('person_private_info')
      .update({ email, updated_at: new Date().toISOString() })
      .eq('person_id', personId).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('person_private_info')
    .insert({ person_id: personId, email }).select().single();
  if (error) throw error;
  return data;
}

// ----------------- Events (audit) -----------------
export async function logEvent(gameId, type, payload) {
  await supabase.from('game_events').insert({
    game_id: gameId, event_type: type, event_payload_json: payload || {},
  });
}
