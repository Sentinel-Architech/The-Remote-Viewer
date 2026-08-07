/**
 * The Remote Viewer — N3 messaging (Nostr wire behind native UI)
 * Keys stay in browser localStorage. Never commit nsec.
 */
import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  nip04,
  nip19,
  SimplePool,
} from 'https://esm.sh/nostr-tools@2.10.4';

const KEY_STORAGE = 'rv-n3-nsec';
const RELAY_STORAGE = 'rv-n3-relays';
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
];

function $(id) {
  return document.getElementById(id);
}

function log(msg) {
  const el = $('m-out');
  const line = '[' + new Date().toISOString().slice(11, 19) + '] ' + msg;
  el.textContent = (el.textContent ? el.textContent + '\n' : '') + line;
  el.scrollTop = el.scrollHeight;
}

function loadRelays() {
  try {
    const raw = localStorage.getItem(RELAY_STORAGE);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch (_) {}
  return DEFAULT_RELAYS.slice();
}

function saveRelays(list) {
  localStorage.setItem(RELAY_STORAGE, JSON.stringify(list));
}

function parseSecret(input) {
  const t = (input || '').trim();
  if (!t) return null;
  if (t.startsWith('nsec1')) {
    const dec = nip19.decode(t);
    if (dec.type !== 'nsec') throw new Error('not nsec');
    return dec.data;
  }
  if (/^[0-9a-fA-F]{64}$/.test(t)) {
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i++) out[i] = parseInt(t.slice(i * 2, i * 2 + 2), 16);
    return out;
  }
  throw new Error('expected nsec1… or 64-hex');
}

function skToNsec(sk) {
  return nip19.nsecEncode(sk);
}

function skToNpub(sk) {
  return nip19.npubEncode(getPublicKey(sk));
}

function parsePeer(input) {
  const t = (input || '').trim();
  if (!t) throw new Error('peer required');
  if (t.startsWith('npub1')) {
    const dec = nip19.decode(t);
    if (dec.type !== 'npub') throw new Error('invalid npub');
    return dec.data;
  }
  if (/^[0-9a-fA-F]{64}$/.test(t)) return t.toLowerCase();
  throw new Error('peer must be npub1… or hex pubkey');
}

function getSk() {
  const stored = localStorage.getItem(KEY_STORAGE);
  if (!stored) return null;
  try {
    return parseSecret(stored);
  } catch {
    return null;
  }
}

function setSk(sk) {
  localStorage.setItem(KEY_STORAGE, skToNsec(sk));
}

function refreshKeyUi() {
  const sk = getSk();
  const npubEl = $('m-npub');
  const status = $('m-key-status');
  if (!sk) {
    npubEl.textContent = '(no key)';
    status.textContent = 'Generate or import an nsec to send DMs.';
    $('m-send').disabled = true;
    $('m-inbox').disabled = true;
    return;
  }
  const npub = skToNpub(sk);
  npubEl.textContent = npub;
  status.textContent = 'Key ready · nsec stays in this browser only';
  $('m-send').disabled = false;
  $('m-inbox').disabled = false;
}

export function initMessaging() {
  const relayInput = $('m-relays');
  relayInput.value = loadRelays().join('\n');

  $('m-gen').addEventListener('click', () => {
    const sk = generateSecretKey();
    setSk(sk);
    refreshKeyUi();
    log('Generated new key. Backup nsec offline only. Never git.');
    log('npub ' + skToNpub(sk));
  });

  $('m-import').addEventListener('click', () => {
    const raw = prompt('Paste nsec1… (stored only in this browser)');
    if (!raw) return;
    try {
      const sk = parseSecret(raw);
      setSk(sk);
      refreshKeyUi();
      log('Imported key · npub ' + skToNpub(sk));
    } catch (e) {
      log('Import failed: ' + e.message);
    }
  });

  $('m-forget').addEventListener('click', () => {
    if (!confirm('Remove nsec from this browser?')) return;
    localStorage.removeItem(KEY_STORAGE);
    refreshKeyUi();
    log('Key removed from browser storage.');
  });

  $('m-copy-npub').addEventListener('click', async () => {
    const sk = getSk();
    if (!sk) return;
    const npub = skToNpub(sk);
    try {
      await navigator.clipboard.writeText(npub);
      log('npub copied — paste into Personas if you want it public.');
    } catch {
      log(npub);
    }
  });

  $('m-save-relays').addEventListener('click', () => {
    const list = relayInput.value
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith('wss://'));
    if (!list.length) {
      log('Need at least one wss:// relay');
      return;
    }
    saveRelays(list);
    log('Relays saved: ' + list.length);
  });

  $('m-send').addEventListener('click', async () => {
    const sk = getSk();
    if (!sk) {
      log('No key');
      return;
    }
    const body = $('m-body').value.trim();
    if (!body) {
      log('Empty message');
      return;
    }
    let peerPk;
    try {
      peerPk = parsePeer($('m-to').value);
    } catch (e) {
      log(e.message);
      return;
    }

    const relays = loadRelays();
    $('m-send').disabled = true;
    log('Encrypting (NIP-04)…');

    try {
      const ciphertext = await nip04.encrypt(sk, peerPk, body);
      const event = finalizeEvent(
        {
          kind: 4,
          created_at: Math.floor(Date.now() / 1000),
          tags: [['p', peerPk]],
          content: ciphertext,
        },
        sk
      );

      log('Publishing to ' + relays.length + ' relay(s)…');
      const pool = new SimplePool();
      const pubs = pool.publish(relays, event);
      const results = await Promise.allSettled(pubs);
      let ok = 0;
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          ok++;
          log('OK ' + relays[i]);
        } else {
          log('FAIL ' + relays[i] + ' · ' + (r.reason && r.reason.message ? r.reason.message : String(r.reason)));
        }
      });
      pool.close(relays);
      if (ok > 0) {
        log('Sent · event id ' + event.id.slice(0, 12) + '…');
        $('m-body').value = '';
      } else {
        log('No relay accepted the event.');
      }
    } catch (e) {
      log('Send error: ' + (e.message || e));
    } finally {
      refreshKeyUi();
    }
  });

  $('m-inbox').addEventListener('click', async () => {
    const sk = getSk();
    if (!sk) {
      log('No key');
      return;
    }
    const pk = getPublicKey(sk);
    const relays = loadRelays();
    log('Querying kind:4 DMs (last 3 days)…');
    const pool = new SimplePool();
    const since = Math.floor(Date.now() / 1000) - 86400 * 3;
    try {
      const events = await pool.querySync(relays, {
        kinds: [4],
        '#p': [pk],
        since,
        limit: 20,
      });
      if (!events.length) {
        log('No recent DMs found on these relays.');
      } else {
        events.sort((a, b) => b.created_at - a.created_at);
        for (const ev of events.slice(0, 10)) {
          try {
            const peer = ev.pubkey;
            const plain = await nip04.decrypt(sk, peer, ev.content);
            const from = nip19.npubEncode(peer).slice(0, 18) + '…';
            log('From ' + from + ' · ' + plain.slice(0, 240));
          } catch {
            log('From ' + ev.pubkey.slice(0, 12) + '… · (decrypt failed)');
          }
        }
      }
    } catch (e) {
      log('Inbox error: ' + (e.message || e));
    } finally {
      pool.close(relays);
    }
  });

  refreshKeyUi();
  log('N3 ready · native UI · Nostr wire · nsec browser-local only.');
}
