// Local identity helpers — players are identified by name only and saved per-device.

export function getOrCreateDeviceId() {
  const k = 'cb_device_id';
  let v = localStorage.getItem(k);
  if (!v) {
    v = 'dev_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
    localStorage.setItem(k, v);
  }
  return v;
}

export function normalizeName(s) {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// Per-game saved identity
export function getSavedPlayer(gameSlug) {
  try {
    const raw = localStorage.getItem('cb_player_' + gameSlug);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

export function savePlayer(gameSlug, payload) {
  localStorage.setItem('cb_player_' + gameSlug, JSON.stringify(payload));
}

export function clearPlayer(gameSlug) {
  localStorage.removeItem('cb_player_' + gameSlug);
}

// Admin PIN session
export function isAdminUnlocked() {
  return sessionStorage.getItem('cb_admin_ok') === '1';
}
export function unlockAdmin() {
  sessionStorage.setItem('cb_admin_ok', '1');
}
export function lockAdmin() {
  sessionStorage.removeItem('cb_admin_ok');
}

export const ADMIN_PIN = process.env.REACT_APP_ADMIN_PIN || '4444';
