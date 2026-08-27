/**
 * The Remote Viewer — N4 signed notes (unranked)
 * Uses same browser nsec as N3 (rv-n3-nsec). Never commit secrets.
 */
import {
  getPublicKey,
  finalizeEvent,
  nip19,
  SimplePool,
} from 'https://esm.sh/nostr-tools@2.10.4';

const KEY_STORAGE = 'rv-n3-nsec';
const RELAY_STORAGE = 'rv-n3-relays';
const FOLLOW_STORAGE = 'rv-n4-following';
const DRAFT_STORAGE = 'rv-n4-drafts';
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
];

function $(id) {
  return document.getElementById(id);
}

function log(msg) {
  const el = $('n-out');
  if (!el) return;
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
  throw new Error('bad key');
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

function loadFollowing() {
  try {
    const raw = localStorage.getItem(FOLLOW_STORAGE);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter((x) => typeof x === 'string');
    }
  } catch (_) {}
  return [];
}

function saveFollowing(list) {
  localStorage.setItem(FOLLOW_STORAGE, JSON.stringify(list));
}

function loadDrafts() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE);
    if (raw) return JSON.parse(raw) || [];
  } catch (_) {}
  return [];
}

function saveDrafts(list) {
  localStorage.setItem(DRAFT_STORAGE, JSON.stringify(list.slice(0, 50)));
}

function npubOf(sk) {
  return nip19.npubEncode(getPublicKey(sk));
}

function shortNpub(pkHex) {
  try {
    return nip19.npubEncode(pkHex).slice(0, 12) + '…';
  } catch {
    return pkHex.slice(0, 12) + '…';
  }
}

function parseNpubOrHex(input) {
  const t = (input || '').trim();
  if (!t) throw new Error('empty');
  if (t.startsWith('npub1')) {
    const dec = nip19.decode(t);
    if (dec.type !== 'npub') throw new Error('invalid npub');
    return dec.data;
  }
  if (/^[0-9a-fA-F]{64}$/.test(t)) return t.toLowerCase();
  throw new Error('need npub1 or hex');
}

function renderFeed(events) {
  const box = $('n-feed');
  if (!events.length) {
    box.innerHTML = '<p class="muted">No notes yet. Publish or refresh feed.</p>';
    return;
  }
  events.sort((a, b) => b.created_at - a.created_at);
  box.innerHTML = events
    .map((ev) => {
      const when = new Date(ev.created_at * 1000).toISOString().replace('T', ' ').slice(0, 16);
      const tags = (ev.tags || [])
        .filter((t) => t[0] === 't')
        .map((t) => t[1])
        .slice(0, 5);
      const tagHtml = tags.map((t) => '<span class="pill">#' + escapeHtml(t) + '</span>').join(' ');
      return (
        '<div class="card" style="margin:0.5rem 0">' +
        '<p class="muted" style="margin:0 0 0.35rem;font-size:0.78rem">' +
        escapeHtml(shortNpub(ev.pubkey)) +
        ' · ' +
        when +
        (tagHtml ? ' · ' + tagHtml : '') +
        '</p>' +
        '<p style="margin:0;white-space:pre-wrap">' +
        escapeHtml(ev.content || '') +
        '</p>' +
        '<p class="muted" style="margin:0.4rem 0 0;font-family:var(--mono);font-size:0.7rem">id ' +
        escapeHtml((ev.id || '').slice(0, 16)) +
        '…</p></div>'
      );
    })
    .join('');
}

function escapeHtml(s) {
  const map = {
    '&': '&' + 'amp;',
    '<': '&' + 'lt;',
    '>': '&' + 'gt;',
    '"': '&' + 'quot;',
    "'": '&' + '#39;',
  };
  return String(s).replace(/[&<>"']/g, (ch) => map[ch] || ch);
}

function renderFollowing() {
  const list = loadFollowing();
  const el = $('n-following-list');
  if (!list.length) {
    el.innerHTML = '<p class="muted">No follows yet. Add npubs to build your unranked feed.</p>';
    return;
  }
  el.innerHTML = list
    .map((np, i) => {
      return (
        '<div class="row" style="margin-top:0.35rem">' +
        '<code style="flex:1;font-size:0.75rem;word-break:break-all">' +
        escapeHtml(np) +
        '</code>' +
        '<button type="button" class="btn danger" data-unf="' +
        i +
        '">Remove</button></div>'
      );
    })
    .join('');
  el.querySelectorAll('[data-unf]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const arr = loadFollowing();
      arr.splice(parseInt(btn.getAttribute('data-unf'), 10), 1);
      saveFollowing(arr);
      renderFollowing();
      log('Removed follow');
    });
  });
}

function renderDrafts() {
  const drafts = loadDrafts();
  const el = $('n-drafts');
  if (!drafts.length) {
    el.innerHTML = '<p class="muted">No local drafts.</p>';
    return;
  }
  el.innerHTML = drafts
    .map((d, i) => {
      return (
        '<div class="card" style="margin:0.4rem 0">' +
        '<p style="margin:0;white-space:pre-wrap">' +
        escapeHtml(d.body || '') +
        '</p>' +
        '<div class="row">' +
        '<button type="button" class="btn" data-load-draft="' +
        i +
        '">Load</button>' +
        '<button type="button" class="btn danger" data-del-draft="' +
        i +
        '">Delete</button></div></div>'
      );
    })
    .join('');
  el.querySelectorAll('[data-load-draft]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const d = loadDrafts()[parseInt(btn.getAttribute('data-load-draft'), 10)];
      if (d) {
        $('n-body').value = d.body || '';
        $('n-tags').value = d.tags || '';
      }
    });
  });
  el.querySelectorAll('[data-del-draft]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const arr = loadDrafts();
      arr.splice(parseInt(btn.getAttribute('data-del-draft'), 10), 1);
      saveDrafts(arr);
      renderDrafts();
    });
  });
}

function refreshKeyGate() {
  const sk = getSk();
  const has = !!sk;
  $('n-post').disabled = !has;
  $('n-refresh').disabled = false;
  $('n-key-hint').textContent = has
    ? 'Signing as ' + npubOf(sk)
    : 'Generate or import a key under Messages first.';
}

export function initNotes() {
  renderFollowing();
  renderDrafts();
  refreshKeyGate();

  // re-check when user switches to Notes tab
  document.querySelectorAll('nav button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('data-tab') === 'notes') refreshKeyGate();
    });
  });

  $('n-follow-add').addEventListener('click', () => {
    const raw = $('n-follow-input').value.trim();
    try {
      parseNpubOrHex(raw); // validate
      const list = loadFollowing();
      const normalized = raw.startsWith('npub1') ? raw : nip19.npubEncode(raw);
      if (list.includes(normalized) || list.includes(raw)) {
        log('Already following');
        return;
      }
      list.push(raw.startsWith('npub1') ? raw : normalized);
      saveFollowing(list);
      $('n-follow-input').value = '';
      renderFollowing();
      log('Following ' + list[list.length - 1].slice(0, 20) + '…');
    } catch (e) {
      log('Follow failed: ' + e.message);
    }
  });

  $('n-save-draft').addEventListener('click', () => {
    const body = $('n-body').value.trim();
    if (!body) {
      log('Empty draft');
      return;
    }
    const drafts = loadDrafts();
    drafts.unshift({ body, tags: $('n-tags').value.trim(), at: Date.now() });
    saveDrafts(drafts);
    renderDrafts();
    log('Draft saved locally');
  });

  $('n-post').addEventListener('click', async () => {
    const sk = getSk();
    if (!sk) {
      log('No key — use Messages tab to generate/import');
      return;
    }
    const body = $('n-body').value.trim();
    if (!body) {
      log('Empty note');
      return;
    }
    const tagRaw = $('n-tags').value.trim();
    const tags = tagRaw
      ? tagRaw
          .split(/[\s,]+/)
          .map((t) => t.replace(/^#/, ''))
          .filter(Boolean)
          .slice(0, 8)
          .map((t) => ['t', t])
      : [];

    $('n-post').disabled = true;
    log('Signing kind:1 note…');
    try {
      const event = finalizeEvent(
        {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags,
          content: body,
        },
        sk
      );
      const relays = loadRelays();
      const pool = new SimplePool();
      const pubs = pool.publish(relays, event);
      const results = await Promise.allSettled(pubs);
      let ok = 0;
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          ok++;
          log('OK ' + relays[i]);
        } else {
          log('FAIL ' + relays[i]);
        }
      });
      pool.close(relays);
      if (ok > 0) {
        log('Published · ' + event.id.slice(0, 12) + '…');
        $('n-body').value = '';
        // optimistic show
        const cur = [];
        try {
          /* leave feed refresh to user */
        } catch (_) {}
        log('Refresh feed to see network copy');
      } else {
        log('No relay accepted note');
      }
    } catch (e) {
      log('Post error: ' + (e.message || e));
    } finally {
      refreshKeyGate();
    }
  });

  $('n-refresh').addEventListener('click', async () => {
    const relays = loadRelays();
    const follows = loadFollowing();
    const sk = getSk();
    const authors = [];
    if (sk) authors.push(getPublicKey(sk));
    for (const np of follows) {
      try {
        authors.push(parseNpubOrHex(np));
      } catch (_) {}
    }
    // dedupe
    const uniq = [...new Set(authors)];
    if (!uniq.length) {
      log('Add a key or follows to load a feed');
      return;
    }
    log('Fetching notes from ' + uniq.length + ' author(s)…');
    const pool = new SimplePool();
    const since = Math.floor(Date.now() / 1000) - 86400 * 14;
    try {
      const events = await pool.querySync(relays, {
        kinds: [1],
        authors: uniq,
        since,
        limit: 40,
      });
      // chronological only — no engagement ranking
      renderFeed(events);
      log('Feed items: ' + events.length + ' (unranked, time order)');
    } catch (e) {
      log('Feed error: ' + (e.message || e));
    } finally {
      pool.close(relays);
    }
  });

  log('N4 ready · unranked signed notes · same key as Messages');
}
