/**
 * Native TRV Shop — credits only redeemable here.
 * Aurora Borealis theme family only.
 */

const CREDITS_KEY = 'rv-trv-credits';
const VALIDATED_KEY = 'rv-validated-viewer';
const SKIN_KEY = 'rv-aurora-skin';
const REWARD_ON_VALIDATE = 100;

export const AURORA_SKINS = [
  {
    id: 'borealis-green',
    name: 'Borealis Green',
    cost: 25,
    vars: {
      '--bg': '#040a08',
      '--surface': '#0a1612',
      '--surface2': '#0f201a',
      '--line': '#1a3d32',
      '--text': '#e8fff6',
      '--soft': '#8eb8a8',
      '--accent': '#5dffc0',
      '--warm': '#a8ffce',
    },
  },
  {
    id: 'polar-violet',
    name: 'Polar Violet',
    cost: 25,
    vars: {
      '--bg': '#07060e',
      '--surface': '#120f1c',
      '--surface2': '#1a1528',
      '--line': '#3a2f55',
      '--text': '#f3eeff',
      '--soft': '#b0a3d4',
      '--accent': '#c4a0ff',
      '--warm': '#e0b0ff',
    },
  },
  {
    id: 'ion-gold',
    name: 'Ion Gold',
    cost: 30,
    vars: {
      '--bg': '#0a0804',
      '--surface': '#16120a',
      '--surface2': '#221c10',
      '--line': '#4a3c1e',
      '--text': '#fff8e8',
      '--soft': '#c4b48a',
      '--accent': '#ffd56e',
      '--warm': '#ffe6a0',
    },
  },
  {
    id: 'night-curtain',
    name: 'Night Curtain',
    cost: 35,
    vars: {
      '--bg': '#03060c',
      '--surface': '#0a1020',
      '--surface2': '#121a30',
      '--line': '#243860',
      '--text': '#e8f0ff',
      '--soft': '#8fa8d0',
      '--accent': '#6eb6ff',
      '--warm': '#a0d0ff',
    },
  },
  {
    id: 'crimson-arc',
    name: 'Crimson Arc',
    cost: 40,
    vars: {
      '--bg': '#0c0406',
      '--surface': '#1a0a10',
      '--surface2': '#281018',
      '--line': '#5a2030',
      '--text': '#ffeef2',
      '--soft': '#d0a0b0',
      '--accent': '#ff7a9a',
      '--warm': '#ffb0c0',
    },
  },
];

function loadCredits() {
  const n = parseInt(localStorage.getItem(CREDITS_KEY) || '0', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function saveCredits(n) {
  localStorage.setItem(CREDITS_KEY, String(Math.max(0, Math.floor(n))));
}

export function isValidated() {
  return localStorage.getItem(VALIDATED_KEY) === '1';
}

export function getCredits() {
  return loadCredits();
}

export function becomeValidated() {
  if (isValidated()) return { ok: false, reason: 'already' };
  localStorage.setItem(VALIDATED_KEY, '1');
  const next = loadCredits() + REWARD_ON_VALIDATE;
  saveCredits(next);
  return { ok: true, granted: REWARD_ON_VALIDATE, balance: next };
}

export function getActiveSkinId() {
  return localStorage.getItem(SKIN_KEY) || '';
}

export function applySkin(id) {
  const skin = AURORA_SKINS.find((s) => s.id === id);
  const root = document.documentElement;
  if (!skin) {
    // reset to defaults by removing inline overrides
    [
      '--bg',
      '--surface',
      '--surface2',
      '--line',
      '--text',
      '--soft',
      '--accent',
      '--warm',
    ].forEach((k) => root.style.removeProperty(k));
    localStorage.removeItem(SKIN_KEY);
    return false;
  }
  Object.entries(skin.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem(SKIN_KEY, id);
  return true;
}

export function restoreSkin() {
  const id = getActiveSkinId();
  if (id) applySkin(id);
}

export function redeemSkin(id) {
  const skin = AURORA_SKINS.find((s) => s.id === id);
  if (!skin) return { ok: false, reason: 'unknown' };
  if (!isValidated()) return { ok: false, reason: 'not-validated' };
  const ownedKey = 'rv-owned-skins';
  let owned = [];
  try {
    owned = JSON.parse(localStorage.getItem(ownedKey) || '[]');
  } catch {
    owned = [];
  }
  if (owned.includes(id)) {
    applySkin(id);
    return { ok: true, already: true, balance: loadCredits() };
  }
  const bal = loadCredits();
  if (bal < skin.cost) return { ok: false, reason: 'insufficient', balance: bal, cost: skin.cost };
  saveCredits(bal - skin.cost);
  owned.push(id);
  localStorage.setItem(ownedKey, JSON.stringify(owned));
  applySkin(id);
  return { ok: true, balance: loadCredits() };
}

export function ownedSkins() {
  try {
    return JSON.parse(localStorage.getItem('rv-owned-skins') || '[]');
  } catch {
    return [];
  }
}

export function renderShopUI(toast) {
  const balEl = document.getElementById('trv-balance');
  const valEl = document.getElementById('validated-status');
  const grid = document.getElementById('shop-grid');
  if (balEl) balEl.textContent = String(loadCredits());
  if (valEl) {
    valEl.textContent = isValidated()
      ? 'Validated Viewer — node path active'
      : 'Not yet a Validated Viewer';
  }
  if (!grid) return;

  const owned = ownedSkins();
  const active = getActiveSkinId();

  grid.innerHTML = AURORA_SKINS.map((s) => {
    const has = owned.includes(s.id);
    const on = active === s.id;
    const accent = s.vars['--accent'];
    return (
      `<div class="shop-item" style="border-color:${accent}55">` +
      `<div class="shop-swatch" style="background:linear-gradient(135deg,${s.vars['--bg']},${accent},${s.vars['--warm']})"></div>` +
      `<div class="shop-meta"><strong>${s.name}</strong>` +
      `<span class="soft">${has ? 'Owned' : s.cost + ' TRV'}${on ? ' · Wearing' : ''}</span></div>` +
      `<button type="button" class="btn ${on ? 'primary' : ''}" data-skin="${s.id}">` +
      (on ? 'Wearing' : has ? 'Wear' : 'Redeem') +
      `</button></div>`
    );
  }).join('');

  grid.querySelectorAll('[data-skin]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-skin');
      const r = redeemSkin(id);
      if (!r.ok) {
        if (r.reason === 'not-validated') toast('Become a Validated Viewer first');
        else if (r.reason === 'insufficient') toast('Need more TRV credits');
        else toast('Could not redeem');
        return;
      }
      toast(r.already ? 'Wearing aurora' : 'Redeemed · aurora applied');
      renderShopUI(toast);
    };
  });
}
