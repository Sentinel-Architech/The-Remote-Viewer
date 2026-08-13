/**
 * Shop NFT mint — $TRV credit-gated.
 * Highest tier: gas waived + 2 free mints / calendar month.
 */
import { getCredits, isValidated, ownedSkins, getActiveSkinId } from './shop.js';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from 'https://esm.sh/@solana/web3.js@1.95.4';

const NFTS_KEY = 'rv-shop-nfts';
const FREE_KEY = 'rv-nft-free-month';
const CREDITS_KEY = 'rv-trv-credits';
const WALLET_KEY = 'rv-wallet-pubkey';
const TREASURY = 'HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv';
const RPC = 'https://solana-rpc.publicnode.com';

const TIER = {
  standard: { id: 'standard', label: 'Standard', cost: 40, gasSol: 0.001, freePerMonth: 0 },
  validated: { id: 'validated', label: 'Validated', cost: 25, gasSol: 0.001, freePerMonth: 0 },
  aurora: { id: 'aurora', label: 'Aurora', cost: 15, gasSol: 0.0005, freePerMonth: 0 },
  highest: { id: 'highest', label: 'Highest', cost: 0, gasSol: 0, freePerMonth: 2 },
};

function loadCredits() {
  const n = parseInt(localStorage.getItem(CREDITS_KEY) || '0', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function saveCredits(n) {
  localStorage.setItem(CREDITS_KEY, String(Math.max(0, Math.floor(n))));
}

function loadNfts() {
  try {
    return JSON.parse(localStorage.getItem(NFTS_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveNfts(list) {
  localStorage.setItem(NFTS_KEY, JSON.stringify(list.slice(0, 100)));
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

function freeUsedThisMonth() {
  try {
    const row = JSON.parse(localStorage.getItem(FREE_KEY) || '{}');
    if (row.month !== monthKey()) return 0;
    return Number(row.used) || 0;
  } catch {
    return 0;
  }
}

function recordFreeMint() {
  const used = freeUsedThisMonth() + 1;
  localStorage.setItem(FREE_KEY, JSON.stringify({ month: monthKey(), used }));
}

export function resolveTier() {
  const validated = isValidated();
  const owned = ownedSkins();
  const hasCrimson = owned.includes('crimson-arc');
  const auroraCount = owned.length;

  if (validated && hasCrimson && auroraCount >= 2) return TIER.highest;
  if (validated && auroraCount >= 1) return TIER.aurora;
  if (validated) return TIER.validated;
  return TIER.standard;
}

function getProvider() {
  if (window.solana && window.solana.isPhantom) return window.solana;
  if (window.solflare) return window.solflare;
  if (window.solana) return window.solana;
  return null;
}

async function payGas(solAmount) {
  if (!solAmount || solAmount <= 0) return { ok: true, signature: null, waived: true };
  const provider = getProvider();
  if (!provider || !provider.publicKey) return { ok: false, reason: 'wallet' };

  const connection = new Connection(RPC, 'confirmed');
  const from = provider.publicKey;
  const to = new PublicKey(TREASURY);
  const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({ feePayer: from, recentBlockhash: blockhash }).add(
    SystemProgram.transfer({ fromPubkey: from, toPubkey: to, lamports })
  );

  let signature;
  if (provider.signAndSendTransaction) {
    const result = await provider.signAndSendTransaction(tx);
    signature = result.signature || result;
  } else {
    const signed = await provider.signTransaction(tx);
    signature = await connection.sendRawTransaction(signed.serialize());
  }
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
  return { ok: true, signature, waived: false };
}

function buildNft({ name, about, tier, free, gasSig, costPaid }) {
  const wallet = localStorage.getItem(WALLET_KEY) || '';
  const id = 'trv-nft-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  return {
    id,
    name: name || 'TRV Mint',
    about: about || '',
    tier: tier.id,
    free: !!free,
    costPaid: costPaid || 0,
    gasWaived: tier.gasSol === 0 || !!free,
    gasSignature: gasSig || null,
    wallet,
    skin: getActiveSkinId() || null,
    mintedAt: Date.now(),
    standard: 'TRV-Shop-NFT-v1',
  };
}

export async function mintShopNft({ name, about }, toast) {
  const tier = resolveTier();
  const freeLeft = Math.max(0, tier.freePerMonth - freeUsedThisMonth());
  const useFree = tier.id === 'highest' && freeLeft > 0;

  let cost = useFree ? 0 : tier.cost;
  const bal = loadCredits();
  if (cost > 0 && bal < cost) {
    return { ok: false, reason: 'credits', need: cost, balance: bal };
  }

  const gasSol = useFree || tier.id === 'highest' ? 0 : tier.gasSol;

  let gas;
  try {
    gas = await payGas(gasSol);
  } catch (e) {
    console.error(e);
    return { ok: false, reason: 'gas' };
  }
  if (!gas.ok) return { ok: false, reason: gas.reason || 'gas' };

  if (cost > 0) saveCredits(bal - cost);
  if (useFree) recordFreeMint();

  const nft = buildNft({
    name,
    about,
    tier,
    free: useFree,
    gasSig: gas.signature,
    costPaid: cost,
  });
  const list = loadNfts();
  list.unshift(nft);
  saveNfts(list);

  const el = document.getElementById('trv-balance');
  if (el) el.textContent = String(loadCredits());

  return { ok: true, nft, tier, free: useFree, freeLeft: useFree ? freeLeft - 1 : freeLeft };
}

export function renderNftUI(toast) {
  const host = document.getElementById('nft-panel');
  if (!host) return;

  const tier = resolveTier();
  const freeLeft = Math.max(0, tier.freePerMonth - freeUsedThisMonth());
  const nfts = loadNfts();

  host.innerHTML = `
    <h2>NFT mint</h2>
    <p class="soft">Mint with $TRV credits. Highest tier: <strong style="color:var(--text)">gas waived</strong> and <strong style="color:var(--text)">2 free mints / month</strong>.</p>
    <p class="soft">Your tier: <strong style="color:var(--text)">${tier.label}</strong>
      ${tier.id === 'highest' ? ` · Free left this month: ${freeLeft}` : ` · Cost: ${tier.cost} TRV · gas ~${tier.gasSol} SOL`}
    </p>
    <label>Name
      <input id="nft-name" maxlength="48" placeholder="Name this mint">
    </label>
    <label>About
      <textarea id="nft-about" maxlength="280" placeholder="Optional note" style="min-height:72px"></textarea>
    </label>
    <div class="actions">
      <button type="button" class="btn primary" id="nft-mint">Mint NFT</button>
    </div>
    <p class="soft" style="font-size:0.78rem;margin-top:0.5rem">Highest tier requires Validated Viewer + Crimson Arc + one other Aurora skin. Gas waive = no SOL fee on mint.</p>
    <div id="nft-list" style="margin-top:0.85rem"></div>
  `;

  const list = document.getElementById('nft-list');
  if (!nfts.length) {
    list.innerHTML = '<p class="soft">No mints yet.</p>';
  } else {
    list.innerHTML = nfts
      .slice(0, 12)
      .map(
        (n) => `<div class="card" style="padding:0.7rem;margin:0.4rem 0">
          <strong>${escapeHtml(n.name)}</strong>
          <div class="soft" style="font-size:0.78rem">${n.tier}${n.free ? ' · free' : ''}${n.gasWaived ? ' · gas waived' : ''} · ${new Date(n.mintedAt).toLocaleString()}</div>
          <div class="soft" style="font-size:0.75rem;word-break:break-all">${n.id}</div>
        </div>`
      )
      .join('');
  }

  const btn = document.getElementById('nft-mint');
  if (btn) {
    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = 'Minting…';
      try {
        const name = document.getElementById('nft-name')?.value?.trim() || 'TRV Mint';
        const about = document.getElementById('nft-about')?.value?.trim() || '';
        const r = await mintShopNft({ name, about }, toast);
        if (!r.ok) {
          if (r.reason === 'credits') toast(`Need ${r.need} TRV credits`);
          else if (r.reason === 'wallet') toast('Connect wallet for gas (or reach Highest tier)');
          else if (r.reason === 'gas') toast('Gas payment failed or cancelled');
          else toast('Mint failed');
          return;
        }
        toast(
          r.free
            ? `Free mint · ${r.freeLeft} free left this month`
            : r.nft.gasWaived
              ? 'Minted · gas waived'
              : 'Minted'
        );
        renderNftUI(toast);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Mint NFT';
      }
    };
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
