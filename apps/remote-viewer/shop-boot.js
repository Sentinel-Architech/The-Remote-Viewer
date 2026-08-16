/**
 * Shop near top of Viewer Profile.
 * Solana checkout + Aurora + lock + GPS field + NFT mint.
 * 50/50 split, zero simulation, deliberate re-selection (originator 2026-08-16).
 */
import {
  becomeValidated,
  renderShopUI,
  restoreSkin,
  grantCreditsFromPayment,
} from './shop.js';
import { renderLockUI } from './lock.js';
import { renderFieldUI } from './gps-drops.js';
import { renderNftUI } from './shop-nft.js';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from 'https://esm.sh/@solana/web3.js@1.95.4';

const WALLET_KEY = 'rv-wallet-pubkey';
const CREATOR = '9XhGDthCvcDz3tLfTgXRLXx1W48fM5oQtrFTRot3yLYG';
const COMMUNITY_POOL = '555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt';
const RPC = 'https://solana-rpc.publicnode.com';

const PACKS = {
  25: 0.02,
  50: 0.04,
  100: 0.07,
  250: 0.15,
};

function toastFn(m) {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = m;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
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
  const prices = document.getElementById('pack-prices');
  if (prices) {
    prices.textContent = Object.entries(PACKS)
      .map(([c, sol]) => `${c} credits = ${sol} SOL`)
      .join(' · ');
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

async function payWithSolana(credits) {
  const provider = getProvider();
  if (!provider) {
    toastFn('Install Phantom or Solflare first');
    return;
  }
  if (!provider.publicKey && !savedWallet()) {
    await connectWallet();
  }
  if (!provider.publicKey) {
    toastFn('Connect wallet first');
    return;
  }

  const sol = PACKS[credits];
  if (!sol) {
    toastFn('Unknown pack');
    return;
  }

  const lamports = Math.round(sol * LAMPORTS_PER_SOL);
  const buyBtn = document.getElementById('buy-credits');
  if (buyBtn) {
    buyBtn.disabled = true;
    buyBtn.textContent = 'Confirm in wallet…';
  }

  try {
    const connection = new Connection(RPC, 'confirmed');
    const from = provider.publicKey;

    // Exact 50/50 split — zero residual
    const creatorLamports = Math.floor(lamports / 2);
    const poolLamports = lamports - creatorLamports;

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const tx = new Transaction({
      feePayer: from,
      recentBlockhash: blockhash,
    })
      .add(
        SystemProgram.transfer({
          fromPubkey: from,
          toPubkey: new PublicKey(CREATOR),
          lamports: creatorLamports,
        })
      )
      .add(
        SystemProgram.transfer({
          fromPubkey: from,
          toPubkey: new PublicKey(COMMUNITY_POOL),
          lamports: poolLamports,
        })
      );

    let signature;
    if (provider.signAndSendTransaction) {
      const result = await provider.signAndSendTransaction(tx);
      signature = result.signature || result;
    } else {
      const signed = await provider.signTransaction(tx);
      signature = await connection.sendRawTransaction(signed.serialize());
    }

    toastFn('Payment sent — confirming…');
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

    const wallet = from.toString();
    localStorage.setItem(WALLET_KEY, wallet);

    const r = grantCreditsFromPayment({
      amount: credits,
      wallet,
      signature,
      lamports,
    });

    if (!r.ok) {
      if (r.reason === 'duplicate') toastFn('This payment was already credited');
      else toastFn('Payment ok but credit failed — keep the tx id');
      console.warn(r, signature);
    } else {
      toastFn(`+${r.granted} TRV · tx ${String(signature).slice(0, 8)}…`);
      renderShopUI(toastFn);
      renderWalletRow();

      // Force deliberate new selection — no accidental second purchase
      const packSelect = document.getElementById('credit-pack');
      if (packSelect) {
        packSelect.value = '';
        packSelect.selectedIndex = -1;
      }
      if (buyBtn) {
        buyBtn.disabled = true;
        buyBtn.textContent = 'Select a pack first';
      }
    }
  } catch (e) {
    console.error(e);
    const msg = (e && e.message) || String(e);
    if (/User rejected|rejected|cancel/i.test(msg)) toastFn('Payment cancelled');
    else toastFn('Payment failed — try again');
  } finally {
    // Only re-enable if a pack is still selected (i.e. failure path).
    // Success path already forced "Select a pack first".
    if (buyBtn) {
      const packSelect = document.getElementById('credit-pack');
      const hasSelection = packSelect && packSelect.value;
      if (hasSelection) {
        buyBtn.disabled = false;
        buyBtn.textContent = 'Pay with Solana';
      } else {
        buyBtn.disabled = true;
        buyBtn.textContent = 'Select a pack first';
      }
    }
  }
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
        <p class="soft">TRV credits · Solana wallet · Aurora · NFT mint.</p>
        <p>Your TRV credits: <strong id="trv-balance">0</strong></p>
        <p class="soft" id="validated-status">Not yet a Validated Viewer</p>
        <div class="actions">
          <button type="button" class="btn primary" id="become-validated">Become a Validated Viewer</button>
        </div>
      </div>
      <div class="card">
        <h2>Wallet & checkout</h2>
        <p class="soft">Pay SOL on Solana. Credits unlock after the transaction confirms.</p>
        <p class="soft" id="wallet-status">No wallet linked to this Viewer profile</p>
        <div class="actions">
          <button type="button" class="btn primary" id="wallet-connect">Connect wallet</button>
          <button type="button" class="btn" id="wallet-disconnect">Unlink</button>
        </div>
        <label style="margin-top:0.75rem">Buy TRV credits
          <select id="credit-pack">
            <option value="">Select a pack…</option>
            <option value="25">25 credits · 0.02 SOL</option>
            <option value="50">50 credits · 0.04 SOL</option>
            <option value="100">100 credits · 0.07 SOL</option>
            <option value="250">250 credits · 0.15 SOL</option>
          </select>
        </label>
        <p class="soft" id="pack-prices" style="font-size:0.78rem;margin-top:0.35rem"></p>
        <div class="actions">
          <button type="button" class="btn primary" id="buy-credits" disabled>Select a pack first</button>
        </div>
        <p class="soft" style="font-size:0.78rem;margin-top:0.5rem">50 % creator / 50 % Community Pool — SOL only. Credits granted only after confirmed on-chain transfer. Zero simulation.</p>
      </div>
      <div class="card" id="lock-panel"></div>
      <div class="card" id="nft-panel"></div>
      <div class="card">
        <h2>Aurora Borealis</h2>
        <p class="soft">Redeem credits to customize your UI.</p>
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
        renderFieldUI(toastFn);
        renderNftUI(toastFn);
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
      renderNftUI(toastFn);
    };
  }

  const wc = document.getElementById('wallet-connect');
  if (wc) wc.onclick = () => connectWallet();
  const wd = document.getElementById('wallet-disconnect');
  if (wd) wd.onclick = () => disconnectWallet();
  const buy = document.getElementById('buy-credits');
  if (buy) {
    buy.onclick = () => {
      const pack = Number(document.getElementById('credit-pack')?.value || 0);
      if (!pack) {
        toastFn('Select a pack first');
        return;
      }
      payWithSolana(pack);
    };
  }

  // Only enable Pay after user deliberately selects a pack
  const packSelectInit = document.getElementById('credit-pack');
  if (packSelectInit) {
    packSelectInit.addEventListener('change', () => {
      const btn = document.getElementById('buy-credits');
      if (!btn) return;
      const has = !!packSelectInit.value;
      btn.disabled = !has;
      btn.textContent = has ? 'Pay with Solana' : 'Select a pack first';
    });
  }

  restoreSkin();
  renderShopUI(() => {});
  renderLockUI(() => {});
  renderFieldUI(() => {});
  renderNftUI(() => {});
  renderWalletRow();
}

ensureShopUI();
