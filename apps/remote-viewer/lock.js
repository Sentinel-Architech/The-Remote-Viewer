/**
 * TRV Shop — USD lock as TRV (Solana target)
 * Min 90 days. Roll +90 → small gift tokens.
 * Parallel Service plane only. L1 = local ledger until L2 program.
 */

const LOCKS_KEY = 'rv-trv-locks';
const MS_90 = 90 * 24 * 60 * 60 * 1000;
const GIFT_ON_ROLL = 3; // few tokens — fixed gift, not APY
const USD_PER_TRV = 1; // 1:1 display scaffold until mint policy final

function loadLocks() {
  try {
    return JSON.parse(localStorage.getItem(LOCKS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocks(list) {
  localStorage.setItem(LOCKS_KEY, JSON.stringify(list));
}

export function openLock(usdAmount) {
  const usd = Number(usdAmount);
  if (!Number.isFinite(usd) || usd <= 0) return { ok: false, reason: 'amount' };
  const now = Date.now();
  const trv = usd * USD_PER_TRV;
  const row = {
    id: 'L' + now.toString(36),
    usd,
    trv,
    lockedAt: now,
    unlockAt: now + MS_90,
    rolls: 0,
    giftTotal: 0,
    status: 'locked',
    chain: 'solana', // target ledger
    note: 'L1 local record — Solana program L2',
  };
  const list = loadLocks();
  list.unshift(row);
  saveLocks(list);
  return { ok: true, lock: row };
}

export function rollLock(id) {
  const list = loadLocks();
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return { ok: false, reason: 'missing' };
  const row = list[i];
  if (row.status !== 'locked') return { ok: false, reason: 'status' };
  if (Date.now() < row.unlockAt) return { ok: false, reason: 'early' };
  row.unlockAt = Date.now() + MS_90;
  row.rolls += 1;
  row.giftTotal += GIFT_ON_ROLL;
  row.trv += GIFT_ON_ROLL;
  list[i] = row;
  saveLocks(list);
  return { ok: true, lock: row, gift: GIFT_ON_ROLL };
}

export function unlockLock(id) {
  const list = loadLocks();
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return { ok: false, reason: 'missing' };
  const row = list[i];
  if (Date.now() < row.unlockAt) return { ok: false, reason: 'early' };
  row.status = 'unlocked';
  list[i] = row;
  saveLocks(list);
  return { ok: true, lock: row };
}

function fmtLeft(unlockAt) {
  const ms = unlockAt - Date.now();
  if (ms <= 0) return 'Ready';
  const d = Math.ceil(ms / (24 * 60 * 60 * 1000));
  return d + ' day' + (d === 1 ? '' : 's') + ' left';
}

export function renderLockUI(toast) {
  const host = document.getElementById('lock-panel');
  if (!host) return;

  const list = loadLocks();
  host.innerHTML = `
    <h2>Lock USD as TRV</h2>
    <p class="soft">Lock in the TRV Shop as TRV on Solana. Minimum <strong style="color:var(--text)">90 days</strong>. If you continue another 90 days, a few TRV tokens are added as a gift.</p>
    <label>USD amount
      <input id="lock-usd" type="number" min="1" step="1" placeholder="e.g. 25">
    </label>
    <div class="actions">
      <button type="button" class="btn primary" id="lock-open">Lock for 90 days</button>
    </div>
    <div id="lock-list" style="margin-top:1rem"></div>
  `;

  const listEl = document.getElementById('lock-list');
  if (!list.length) {
    listEl.innerHTML = '<p class="soft">No locks yet.</p>';
  } else {
    listEl.innerHTML = list
      .map((row) => {
        const ready = Date.now() >= row.unlockAt;
        const status =
          row.status === 'unlocked'
            ? 'Unlocked'
            : ready
              ? 'Mature — unlock or continue'
              : fmtLeft(row.unlockAt);
        return (
          `<div class="post">` +
          `<div class="who">${row.usd} USD → ${row.trv} TRV · Solana</div>` +
          `<div class="body">${status}` +
          (row.rolls ? ` · continued ${row.rolls}× · gifts ${row.giftTotal} TRV` : '') +
          `</div>` +
          `<div class="actions">` +
          (row.status === 'locked' && ready
            ? `<button type="button" class="btn primary" data-roll="${row.id}">Continue 90 days (gift)</button>` +
              `<button type="button" class="btn" data-unlock="${row.id}">Unlock</button>`
            : '') +
          `</div></div>`
        );
      })
      .join('');
  }

  const openBtn = document.getElementById('lock-open');
  if (openBtn) {
    openBtn.onclick = () => {
      const usd = document.getElementById('lock-usd').value;
      const r = openLock(usd);
      if (!r.ok) return toast('Enter a USD amount');
      toast('Locked 90 days · TRV on Solana path');
      renderLockUI(toast);
    };
  }

  listEl.querySelectorAll('[data-roll]').forEach((btn) => {
    btn.onclick = () => {
      const r = rollLock(btn.getAttribute('data-roll'));
      if (!r.ok) return toast(r.reason === 'early' ? 'Still within 90 days' : 'Could not continue');
      toast(`Continued +90 days · gift +${r.gift} TRV`);
      renderLockUI(toast);
    };
  });

  listEl.querySelectorAll('[data-unlock]').forEach((btn) => {
    btn.onclick = () => {
      const r = unlockLock(btn.getAttribute('data-unlock'));
      if (!r.ok) return toast(r.reason === 'early' ? 'Still within 90 days' : 'Could not unlock');
      toast('Unlocked');
      renderLockUI(toast);
    };
  });
}
