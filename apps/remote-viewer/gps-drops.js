/**
 * GPS field drops — claim nearby TRV tokens into Shop credits.
 * Deterministic daily drops on a coarse grid. No server required.
 */
import { getCredits } from './shop.js';

const CLAIMED_KEY = 'rv-gps-claimed';
const CREDITS_KEY = 'rv-trv-credits';
const CELL = 0.001;
const CLAIM_RADIUS_M = 120;
const DAILY_SEED = () => new Date().toISOString().slice(0, 10);

function loadCredits() {
  const n = parseInt(localStorage.getItem(CREDITS_KEY) || '0', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function saveCredits(n) {
  localStorage.setItem(CREDITS_KEY, String(Math.max(0, Math.floor(n))));
}

function loadClaimed() {
  try {
    return JSON.parse(localStorage.getItem(CLAIMED_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveClaimed(list) {
  localStorage.setItem(CLAIMED_KEY, JSON.stringify(list.slice(0, 200)));
}

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function cellId(lat, lon) {
  const i = Math.floor(lat / CELL);
  const j = Math.floor(lon / CELL);
  return `${i}:${j}`;
}

function dropForCell(cid) {
  const seed = DAILY_SEED() + '|' + cid;
  const h = hash32(seed);
  if (h % 100 > 34) return null;
  const [is, js] = cid.split(':').map(Number);
  const lat = (is + 0.5) * CELL;
  const lon = (js + 0.5) * CELL;
  const reward = 5 + (h % 11);
  return {
    id: DAILY_SEED() + ':' + cid,
    cell: cid,
    lat,
    lon,
    reward,
  };
}

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLon = toR(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function scanNearby(lat, lon) {
  const claimed = new Set(loadClaimed());
  const i0 = Math.floor(lat / CELL);
  const j0 = Math.floor(lon / CELL);
  const found = [];
  for (let di = -2; di <= 2; di++) {
    for (let dj = -2; dj <= 2; dj++) {
      const cid = `${i0 + di}:${j0 + dj}`;
      const drop = dropForCell(cid);
      if (!drop) continue;
      if (claimed.has(drop.id)) continue;
      const dist = haversineM(lat, lon, drop.lat, drop.lon);
      found.push({ ...drop, dist });
    }
  }
  found.sort((a, b) => a.dist - b.dist);
  return found;
}

export function claimDrop(drop, lat, lon) {
  if (!drop || !drop.id) return { ok: false, reason: 'missing' };
  const dist = haversineM(lat, lon, drop.lat, drop.lon);
  if (dist > CLAIM_RADIUS_M) return { ok: false, reason: 'far', dist };
  const claimed = loadClaimed();
  if (claimed.includes(drop.id)) return { ok: false, reason: 'claimed' };
  claimed.unshift(drop.id);
  saveClaimed(claimed);
  const next = loadCredits() + drop.reward;
  saveCredits(next);
  return { ok: true, reward: drop.reward, balance: next, dist };
}

export function renderFieldUI(toast) {
  const host = document.getElementById('field-panel');
  if (!host) return;

  host.innerHTML = `
    <h2>Field claim</h2>
    <p class="soft">Use GPS to find nearby TRV drops. Claim within ~${CLAIM_RADIUS_M}m. Credits go to Shop.</p>
    <p class="soft" id="field-status">Location off</p>
    <div class="actions">
      <button type="button" class="btn primary" id="field-scan">Scan nearby</button>
    </div>
    <div id="field-list" style="margin-top:0.75rem"></div>
  `;

  const status = document.getElementById('field-status');
  const list = document.getElementById('field-list');

  document.getElementById('field-scan').onclick = () => {
    if (!navigator.geolocation) {
      toast('GPS not available on this device');
      return;
    }
    status.textContent = 'Locating…';
    list.innerHTML = '';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon, accuracy } = pos.coords;
        status.textContent = `You · ±${Math.round(accuracy)}m`;
        const drops = scanNearby(lat, lon);
        if (!drops.length) {
          list.innerHTML = '<p class="soft">No unclaimed drops in range today. Move and scan again.</p>';
          return;
        }
        list.innerHTML = drops
          .slice(0, 8)
          .map((d) => {
            const near = d.dist <= CLAIM_RADIUS_M;
            return `<div class="card" style="padding:0.75rem;margin:0.4rem 0">
              <div><strong>${d.reward} TRV</strong> · ${Math.round(d.dist)}m away</div>
              <div class="soft" style="font-size:0.78rem">${near ? 'In claim range' : 'Get closer'}</div>
              <div class="actions">
                <button type="button" class="btn ${near ? 'primary' : ''}" data-claim="${d.id}" ${near ? '' : 'disabled'}>
                  ${near ? 'Claim' : 'Too far'}
                </button>
              </div>
            </div>`;
          })
          .join('');

        list.querySelectorAll('[data-claim]').forEach((btn) => {
          btn.onclick = () => {
            const id = btn.getAttribute('data-claim');
            const drop = drops.find((x) => x.id === id);
            const r = claimDrop(drop, lat, lon);
            if (!r.ok) {
              if (r.reason === 'far') toast(`Still ${Math.round(r.dist)}m away`);
              else if (r.reason === 'claimed') toast('Already claimed');
              else toast('Could not claim');
              return;
            }
            toast(`+${r.reward} TRV from the field`);
            const bal = document.getElementById('trv-balance');
            if (bal) bal.textContent = String(r.balance);
            btn.closest('.card')?.remove();
          };
        });
      },
      (err) => {
        console.error(err);
        status.textContent = 'Location denied or unavailable';
        toast('Allow location to scan field drops');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  };
}
