/**
 * Shop near top of Viewer Profile.
 * Wallet-linked credits, Aurora skins, USD lock panel.
 */
import {
  becomeValidated,
  renderShopUI,
  restoreSkin,
  buyCreditsWithWallet,
  getCredits,
} from './shop.js';
import { renderLockUI } from './lock.js';

const WALLET_KEY = 'rv-wallet-pubkey';

function toastFn(m) {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = m;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }
}

function getProvider() {
  if (window.solana && window.solana.isPhantom) return window.solana;
  if (window.solflare) return window.solflare;
  if (window.solana) return window.solana;
  return null;
}

function savedWallet() {
  return localStorage.getItem(WALLET_KEY) || '';
}

function shortPk(pk) {
  if (!pk || pk.length < 12) return pk || '';
  return pk.slice(0, 4) + '…' + pk.slice(-4);
}

function renderWalletRow() {
  const el = document.getElementById('wallet-status');
  if (!el) return;
  const pk = savedWallet();
  if (pk) {
    el.innerHTML = `Connected: <strong style="color:var(--text)">${shortPk(pk)}</strong>`;
  } else {
    el.textContent = 'No wallet linked to this Viewer profile';
  }
}

async function connectWallet() {
  const provider = getProvider();
  if (!provider) {
    toastFn('Install Phantom or Solflare, then try again');
    return;
  }
  try {
    const res = await provider.connect();
    const pk =
      (res && res.publicKey && res.publicKey.toString && res.publicKey.toString()) ||
      (provider.publicKey && provider.publicKey.toString && provider.publicKey.toString()) ||
      '';
    if (!pk) {
      toastFn('Could not read wallet address');
      return;
    }
    localStorage.setItem(WALLET_KEY, pk);
    renderWalletRow();
    toastFn('Wallet linked to this Viewer profile');
  } catch (e) {
    console.error(e);
    toastFn('Wallet connect cancelled or failed');
  }
}

function disconnectWallet() {
  localStorage.removeItem(WALLET_KEY);
  renderWalletRow();
  toastFn('Wallet unlinked on this phone');
}

function ensureShopUI() {
  const host = document.getElementById('shop-in-profile');
  if (!host) return;

  if (!document.getElementById('shop')) {
    const sec = document.createElement('div');
    sec.id = 'shop';
    sec.innerHTML = `
      <div class="card">
        <h2>Shop</h2>
        <p class="soft">TRV credits · wallet · Aurora looks — parallel to The Sentinel core.</p>
        <p>Your TRV credits: <strong id="trv-balance">0</strong></p>
        <p class="soft" id="validated-status">Not yet a Validated Viewer</p>
        <div class="actions">
          <button type="button" class="btn primary" id="become-validated">Become a Validated Viewer</button>
        </div>
      </div>
      <div class="card">
        <h2>Wallet</h2>
        <p class="soft">Link a Solana wallet to this Viewer profile to buy credits and lock value.</p>
        <p class="soft" id="wallet-status">No wallet linked to this Viewer profile</p>
        <div class="actions">
          <button type="button" class="btn primary" id="wallet-connect">Connect wallet</button>
          <button type="button" class="btn" id="wallet-disconnect">Unlink</button>
        </div>
        <label style="margin-top:0.75rem">Buy TRV credits
          <select id="credit-pack">
            <option value="25">25 credits</option>
            <option value="50">50 credits</option>
            <option value="100">100 credits</option>
            <option value="250">250 credits</option>
          </select>
        </label>
        <div class="actions">
          <button type="button" class="btn primary" id="buy-credits">Buy with linked wallet</button>
        </div>
        <p class="soft" style="font-size:0.8rem;margin-top:0.5rem">L1 records the purchase on this device and binds it to your wallet pubkey. On-chain settlement follows the Solana path used by Path B / locks.</p>
      </div>
      <div class="card" id="lock-panel"></div>
      <div class="card">
        <h2>Aurora Borealis</h2>
        <p class="soft">Redeem credits to customize your UI. More looks unlock as you earn or buy credits.</p>
        <div id="shop-grid"></div>
      </div>`;
    host.appendChild(sec);

    const st = document.createElement('style');
    st.textContent = `
      .shop-item{display:flex;flex-wrap:wrap;gap:.65rem;align-items:center;padding:.75rem;margin:.5rem 0;border:1px solid var(--line);border-radius:14px;background:var(--surface2)}
      .shop-swatch{width:48px;height:48px;border-radius:12px;flex-shrink:0}
      .shop-meta{flex:1;min-width:120px}
      .shop-meta strong{display:block;font-size:.92rem}
      .shop-meta .soft{font-size:.8rem}
      #credit-pack{width:100%;margin-top:.35rem;padding:.65rem .75rem;border-radius:12px;border:1px solid var(--line);background:var(--surface2);color:var(--text);font:inherit}
    `;
    document.head.appendChild(st);
  } else if (!document.getElementById('lock-panel')) {
    const shop = document.getElementById('shop');
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'lock-panel';
    const aurora = shop.querySelector('#shop-grid')?.closest('.card');
    if (aurora) shop.insertBefore(card, aurora);
    else shop.appendChild(card);
  }

  document.querySelectorAll('.tabs button').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('.tabs button').forEach((b) => b.classList.remove('on'));
      document.querySelectorAll('.screen').forEach((s) => s.classList.remove('on'));
      btn.classList.add('on');
      const screen = document.getElementById(btn.dataset.screen);
      if (screen) screen.classList.add('on');
      if (btn.dataset.screen === 'you') {
        renderShopUI(toastFn);
        renderLockUI(toastFn);
        renderWalletRow();
      }
    };
  });

  const become = document.getElementById('become-validated');
  if (become) {
    become.onclick = () => {
      const r = becomeValidated();
      if (!r.ok && r.reason === 'already') toastFn('You are already a Validated Viewer');
      else if (r.ok) toastFn(`Validated · +${r.granted} TRV credits`);
      renderShopUI(toastFn);
      renderLockUI(toastFn);
    };
  }

  const wc = document.getElementById('wallet-connect');
  if (wc) wc.onclick = () => connectWallet();
  const wd = document.getElementById('wallet-disconnect');
  if (wd) wd.onclick = () => disconnectWallet();
  const buy = document.getElementById('buy-credits');
  if (buy) {
    buy.onclick = () => {
      const pack = Number(document.getElementById('credit-pack')?.value || 25);
      const r = buyCreditsWithWallet(pack);
      if (!r.ok) {
        if (r.reason === 'wallet') toastFn('Connect a wallet first');
        else toastFn('Could not buy credits');
        return;
      }
      toastFn(`+${r.granted} TRV credits · linked to ${shortPk(r.wallet)}`);
      renderShopUI(toastFn);
    };
  }

  restoreSkin();
  renderShopUI(() => {});
  renderLockUI(() => {});
  renderWalletRow();
}

ensureShopUI();
