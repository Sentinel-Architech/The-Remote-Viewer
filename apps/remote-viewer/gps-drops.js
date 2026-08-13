/**
 * GPS + camera AR field drops.
 * Default rear camera with live distance HUD. Claim → Shop TRV credits.
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

function dropForCell(cid) {
  const seed = DAILY_SEED() + '|' + cid;
  const h = hash32(seed);
  if (h % 100 > 34) return null;
  const [is, js] = cid.split(':').map(Number);
  const lat = (is + 0.5) * CELL;
  const lon = (js + 0.5) * CELL;
  const reward = 5 + (h % 11);
  return { id: DAILY_SEED() + ':' + cid, cell: cid, lat, lon, reward };
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

function bearingDeg(lat1, lon1, lat2, lon2) {
  const toR = (d) => (d * Math.PI) / 180;
  const φ1 = toR(lat1);
  const φ2 = toR(lat2);
  const Δλ = toR(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
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
      if (!drop || claimed.has(drop.id)) continue;
      const dist = haversineM(lat, lon, drop.lat, drop.lon);
      const bearing = bearingDeg(lat, lon, drop.lat, drop.lon);
      found.push({ ...drop, dist, bearing });
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

let arStream = null;
let watchId = null;
let heading = null;

function stopAr() {
  if (watchId != null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (arStream) {
    arStream.getTracks().forEach((t) => t.stop());
    arStream = null;
  }
  window.removeEventListener('deviceorientationabsolute', onOrient);
  window.removeEventListener('deviceorientation', onOrient);
}

function onOrient(e) {
  if (e.absolute && e.alpha != null) heading = e.alpha;
  else if (e.webkitCompassHeading != null) heading = e.webkitCompassHeading;
  else if (e.alpha != null) heading = 360 - e.alpha;
}

function ensureArStyles() {
  if (document.getElementById('ar-field-css')) return;
  const st = document.createElement('style');
  st.id = 'ar-field-css';
  st.textContent = `
    .ar-stage{position:relative;width:100%;aspect-ratio:3/4;max-height:70vh;border-radius:14px;overflow:hidden;background:#000;margin-top:0.65rem}
    .ar-stage video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .ar-hud{position:absolute;inset:0;pointer-events:none;z-index:2}
    .ar-pin{position:absolute;transform:translate(-50%,-50%);pointer-events:auto;min-width:7.5rem;
      padding:0.45rem 0.55rem;border-radius:12px;border:1px solid rgba(110,182,255,0.55);
      background:rgba(6,12,20,0.78);color:#f0f4fa;font-size:0.78rem;text-align:center;backdrop-filter:blur(6px)}
    .ar-pin.near{border-color:#5dffc0;box-shadow:0 0 12px rgba(93,255,192,0.35)}
    .ar-pin strong{display:block;font-size:0.88rem}
    .ar-pin .dist{color:#9aabbf;font-size:0.72rem;margin:0.15rem 0}
    .ar-pin button{margin-top:0.25rem;pointer-events:auto}
    .ar-top{position:absolute;top:0.5rem;left:0.5rem;right:0.5rem;z-index:3;display:flex;justify-content:space-between;gap:0.5rem;pointer-events:none}
    .ar-badge{background:rgba(6,12,20,0.75);border:1px solid #243041;border-radius:999px;padding:0.3rem 0.65rem;font-size:0.72rem;color:#9aabbf}
  `;
  document.head.appendChild(st);
}

function placePin(bearing, dist) {
  const rel = ((bearing - (heading || 0) + 540) % 360) - 180;
  const fov = 60;
  if (Math.abs(rel) > fov) return null;
  const x = 50 + (rel / fov) * 50;
  const y = Math.min(85, Math.max(18, 25 + Math.log10(Math.max(dist, 1) + 1) * 22));
  return { x, y };
}

export function renderFieldUI(toast) {
  const host = document.getElementById('field-panel');
  if (!host) return;
  ensureArStyles();

  host.innerHTML = `
    <h2>Field claim</h2>
    <p class="soft">Default camera AR · live distance. Claim within ~${CLAIM_RADIUS_M}m → Shop credits.</p>
    <p class="soft" id="field-status">Camera & location off</p>
    <div class="actions">
      <button type="button" class="btn primary" id="field-ar">Open AR</button>
      <button type="button" class="btn" id="field-scan">List scan</button>
      <button type="button" class="btn quiet" id="field-stop" hidden>Stop</button>
    </div>
    <div id="ar-root" hidden></div>
    <div id="field-list" style="margin-top:0.75rem"></div>
  `;

  const status = document.getElementById('field-status');
  const list = document.getElementById('field-list');
  const arRoot = document.getElementById('ar-root');
  const stopBtn = document.getElementById('field-stop');

  function paintList(lat, lon, drops) {
    if (!drops.length) {
      list.innerHTML = '<p class="soft">No unclaimed drops nearby today.</p>';
      return;
    }
    list.innerHTML = drops
      .slice(0, 8)
      .map((d) => {
        const near = d.dist <= CLAIM_RADIUS_M;
        return `<div class="card" style="padding:0.75rem;margin:0.4rem 0">
          <div><strong>${d.reward} TRV</strong> · <span class="soft">${Math.round(d.dist)}m</span></div>
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
        const drop = drops.find((x) => x.id === btn.getAttribute('data-claim'));
        const r = claimDrop(drop, lat, lon);
        if (!r.ok) {
          if (r.reason === 'far') toast(`Still ${Math.round(r.dist)}m away`);
          else if (r.reason === 'claimed') toast('Already claimed');
          else toast('Could not claim');
          return;
        }
        toast(`+${r.reward} TRV · ${Math.round(r.dist)}m`);
        const bal = document.getElementById('trv-balance');
        if (bal) bal.textContent = String(r.balance);
        btn.closest('.card')?.remove();
      };
    });
  }

  document.getElementById('field-scan').onclick = () => {
    if (!navigator.geolocation) return toast('GPS not available');
    status.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon, accuracy } = pos.coords;
        status.textContent = `You · ±${Math.round(accuracy)}m`;
        paintList(lat, lon, scanNearby(lat, lon));
      },
      () => {
        status.textContent = 'Location denied';
        toast('Allow location to scan');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
    );
  };

  document.getElementById('field-ar').onclick = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast('Camera not available');
      return;
    }
    if (!navigator.geolocation) {
      toast('GPS not available');
      return;
    }
    try {
      stopAr();
      arStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
    } catch (e) {
      console.error(e);
      toast('Allow camera to open AR');
      return;
    }

    arRoot.hidden = false;
    stopBtn.hidden = false;
    arRoot.innerHTML = `
      <div class="ar-stage">
        <video id="ar-video" playsinline autoplay muted></video>
        <div class="ar-top">
          <span class="ar-badge" id="ar-gps-badge">GPS…</span>
          <span class="ar-badge" id="ar-count-badge">0 drops</span>
        </div>
        <div class="ar-hud" id="ar-hud"></div>
      </div>
    `;
    const video = document.getElementById('ar-video');
    video.srcObject = arStream;
    try {
      await video.play();
    } catch {}

    window.addEventListener('deviceorientationabsolute', onOrient, true);
    window.addEventListener('deviceorientation', onOrient, true);
    if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
      try {
        await DeviceOrientationEvent.requestPermission();
      } catch {}
    }

    status.textContent = 'AR on · rear camera';
    const hud = document.getElementById('ar-hud');
    const gpsBadge = document.getElementById('ar-gps-badge');
    const countBadge = document.getElementById('ar-count-badge');

    let lastDrops = [];
    let lastLat = null;
    let lastLon = null;

    function drawHud() {
      if (!hud || lastLat == null) return;
      const drops = lastDrops.slice(0, 6);
      countBadge.textContent = drops.length + ' drops';
      hud.innerHTML = '';
      drops.forEach((d) => {
        const pos = placePin(d.bearing, d.dist);
        if (!pos) return;
        const near = d.dist <= CLAIM_RADIUS_M;
        const pin = document.createElement('div');
        pin.className = 'ar-pin' + (near ? ' near' : '');
        pin.style.left = pos.x + '%';
        pin.style.top = pos.y + '%';
        pin.innerHTML =
          `<strong>${d.reward} TRV</strong>` +
          `<div class="dist">${Math.round(d.dist)}m away</div>` +
          (near
            ? `<button type="button" class="btn primary" data-ar-claim="${d.id}" style="font-size:0.75rem;padding:0.35rem 0.65rem">Claim</button>`
            : `<div class="dist">Get closer</div>`);
        hud.appendChild(pin);
      });
      hud.querySelectorAll('[data-ar-claim]').forEach((btn) => {
        btn.onclick = (ev) => {
          ev.stopPropagation();
          const drop = lastDrops.find((x) => x.id === btn.getAttribute('data-ar-claim'));
          const r = claimDrop(drop, lastLat, lastLon);
          if (!r.ok) {
            if (r.reason === 'far') toast(`Still ${Math.round(r.dist)}m`);
            else toast('Could not claim');
            return;
          }
          toast(`+${r.reward} TRV · ${Math.round(r.dist)}m`);
          const bal = document.getElementById('trv-balance');
          if (bal) bal.textContent = String(r.balance);
          lastDrops = scanNearby(lastLat, lastLon);
          drawHud();
        };
      });
    }

    setInterval(() => {
      if (arStream) drawHud();
    }, 400);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        lastLat = pos.coords.latitude;
        lastLon = pos.coords.longitude;
        gpsBadge.textContent = `±${Math.round(pos.coords.accuracy || 0)}m`;
        lastDrops = scanNearby(lastLat, lastLon);
        drawHud();
        paintList(lastLat, lastLon, lastDrops);
      },
      () => {
        gpsBadge.textContent = 'GPS denied';
        toast('Allow location for AR distances');
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
  };

  document.getElementById('field-stop').onclick = () => {
    stopAr();
    arRoot.hidden = true;
    arRoot.innerHTML = '';
    stopBtn.hidden = true;
    status.textContent = 'AR stopped';
  };
}
