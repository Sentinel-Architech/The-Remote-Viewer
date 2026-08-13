/**
 * The Remote Viewer — seamless social client
 * Wire details stay out of the UI language.
 */
import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  nip04,
  nip19,
  SimplePool,
} from 'https://esm.sh/nostr-tools@2.10.4';

const KEY = 'rv-n3-nsec';
const RELAYS = 'rv-n3-relays';
const FOLLOWS = 'rv-n4-following';
const DRAFTS = 'rv-n4-drafts';
const PROFILE = 'rv-profile';
const DEFAULT_PATHS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
];

const $ = (id) => document.getElementById(id);

function toast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function loadKey() {
  const nsec = localStorage.getItem(KEY);
  if (!nsec) return null;
  try {
    const { type, data } = nip19.decode(nsec);
    if (type !== 'nsec') return null;
    return data;
  } catch {
    return null;
  }
}

function saveKey(sk) {
  localStorage.setItem(KEY, nip19.nsecEncode(sk));
}

function pubOf(sk) {
  return getPublicKey(sk);
}

function npubOf(sk) {
  return nip19.npubEncode(pubOf(sk));
}

function loadFollows() {
  try {
    return JSON.parse(localStorage.getItem(FOLLOWS) || '[]');
  } catch {
    return [];
  }
}

function saveFollows(list) {
  localStorage.setItem(FOLLOWS, JSON.stringify(list));
}

function loadDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS) || '[]');
  } catch {
    return [];
  }
}

function saveDrafts(list) {
  localStorage.setItem(DRAFTS, JSON.stringify(list));
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE) || '{}');
  } catch {
    return {};
  }
}

function saveProfileObj(obj) {
  localStorage.setItem(PROFILE, JSON.stringify(obj));
}

function loadPaths() {
  const raw = localStorage.getItem(RELAYS);
  if (!raw) return [...DEFAULT_PATHS];
  return raw.split('\n').map((s) => s.trim()).filter(Boolean);
}

function savePaths(list) {
  localStorage.setItem(RELAYS, list.join('\n'));
}

function refreshYou() {
  const sk = loadKey();
  if (!sk) {
    $('you-id').textContent = 'No identity yet';
    $('you-status').textContent =
      'Create an ID to post and message. It stays on this phone unless you copy it somewhere safe.';
    return;
  }
  $('you-id').textContent = npubOf(sk);
  $('you-status').textContent = 'You are ready to post and talk.';
  const prof = loadProfile();
  if ($('prof-name')) $('prof-name').value = prof.name || '';
  if ($('prof-about')) $('prof-about').value = prof.about || '';
  renderFollows();
  renderDrafts();
  if ($('paths')) $('paths').value = loadPaths().join('\n');
}

function renderFollows() {
  const list = loadFollows();
  const el = $('follow-list');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<p class="soft">No one yet.</p>';
    return;
  }
  el.innerHTML = list
    .map(
      (id) =>
        `<div class="id-chip" style="display:flex;justify-content:space-between;gap:0.5rem;align-items:center">
          <span style="word-break:break-all">${id}</span>
          <button type="button" class="btn quiet" data-unfollow="${id}">Unfollow</button>
        </div>`
    )
    .join('');
  el.querySelectorAll('[data-unfollow]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-unfollow');
      saveFollows(loadFollows().filter((x) => x !== id));
      renderFollows();
      toast('Unfollowed');
    };
  });
}

function renderDrafts() {
  const list = loadDrafts();
  const el = $('drafts');
  if (!el) return;
  if (!list.length) {
    el.textContent = 'Nothing saved yet.';
    return;
  }
  el.innerHTML = list
    .map(
      (d, i) =>
        `<div class="card" style="margin:0.4rem 0;padding:0.75rem">
          <div class="soft" style="font-size:0.8rem">Draft ${i + 1}</div>
          <div style="white-space:pre-wrap;margin:0.35rem 0">${escapeHtml(d.text || '')}</div>
          <button type="button" class="btn" data-draft="${i}">Load</button>
          <button type="button" class="btn quiet" data-del-draft="${i}">Delete</button>
        </div>`
    )
    .join('');
  el.querySelectorAll('[data-draft]').forEach((btn) => {
    btn.onclick = () => {
      const d = loadDrafts()[Number(btn.getAttribute('data-draft'))];
      if (!d) return;
      $('post-text').value = d.text || '';
      toast('Draft loaded');
    };
  });
  el.querySelectorAll('[data-del-draft]').forEach((btn) => {
    btn.onclick = () => {
      const i = Number(btn.getAttribute('data-del-draft'));
      const list = loadDrafts();
      list.splice(i, 1);
      saveDrafts(list);
      renderDrafts();
    };
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>');
}

let mediaDataUrl = null;
let mediaKind = null;

function clearMedia() {
  mediaDataUrl = null;
  mediaKind = null;
  const prev = $('media-preview');
  if (prev) {
    prev.hidden = true;
    prev.innerHTML = '';
  }
  if ($('post-photo')) $('post-photo').value = '';
  if ($('post-video')) $('post-video').value = '';
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function onMedia(file, kind) {
  if (!file) return;
  mediaDataUrl = await readFileAsDataURL(file);
  mediaKind = kind;
  const prev = $('media-preview');
  prev.hidden = false;
  prev.innerHTML =
    kind === 'image'
      ? `<img src="${mediaDataUrl}" alt="">`
      : `<video src="${mediaDataUrl}" controls></video>`;
}

document.querySelectorAll('.tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.remove('on'));
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('on'));
    btn.classList.add('on');
    const screen = document.getElementById(btn.dataset.screen);
    if (screen) screen.classList.add('on');
    if (btn.dataset.screen === 'you') refreshYou();
  });
});

$('create-id')?.addEventListener('click', () => {
  const sk = generateSecretKey();
  saveKey(sk);
  refreshYou();
  toast('Your Viewer ID is ready. Copy it and keep a safe backup.');
});

$('restore-id')?.addEventListener('click', () => {
  const nsec = prompt('Paste your nsec (starts with nsec1…)');
  if (!nsec) return;
  try {
    const { type, data } = nip19.decode(nsec.trim());
    if (type !== 'nsec') throw new Error('not nsec');
    saveKey(data);
    refreshYou();
    toast('Identity restored on this phone');
  } catch {
    toast('That did not look like a valid nsec');
  }
});

$('copy-id')?.addEventListener('click', async () => {
  const sk = loadKey();
  if (!sk) return toast('Create your Viewer ID under Viewer Profile first');
  const id = npubOf(sk);
  try {
    await navigator.clipboard.writeText(id);
    toast('Copied');
  } catch {
    prompt('Copy this ID', id);
  }
});

$('forget-id')?.addEventListener('click', () => {
  if (!confirm('Remove the Viewer ID from this phone? Make sure you have a backup.')) return;
  localStorage.removeItem(KEY);
  refreshYou();
  toast('Removed from this phone');
});

$('save-profile')?.addEventListener('click', () => {
  saveProfileObj({
    name: $('prof-name')?.value?.trim() || '',
    about: $('prof-about')?.value?.trim() || '',
  });
  toast('Profile saved on this phone');
});

$('follow-add')?.addEventListener('click', () => {
  const raw = $('follow-input')?.value?.trim();
  if (!raw) return;
  let id = raw;
  try {
    const d = nip19.decode(raw);
    if (d.type === 'npub') id = raw;
  } catch {}
  const list = loadFollows();
  if (!list.includes(id)) list.push(id);
  saveFollows(list);
  $('follow-input').value = '';
  renderFollows();
  toast('Following');
});

$('save-paths')?.addEventListener('click', () => {
  const lines = ($('paths')?.value || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  savePaths(lines.length ? lines : DEFAULT_PATHS);
  toast('Paths saved');
});

$('add-place')?.addEventListener('click', () => {
  const w = $('place-wrap');
  if (w) w.hidden = !w.hidden;
});

$('post-photo')?.addEventListener('change', (e) => {
  const f = e.target.files?.[0];
  if (f) onMedia(f, 'image');
});

$('post-video')?.addEventListener('change', (e) => {
  const f = e.target.files?.[0];
  if (f) onMedia(f, 'video');
});

$('save-draft')?.addEventListener('click', () => {
  const text = $('post-text')?.value?.trim() || '';
  if (!text && !mediaDataUrl) return toast('Nothing to save');
  const list = loadDrafts();
  list.unshift({ text, mediaDataUrl, mediaKind, place: $('post-place')?.value || '' });
  saveDrafts(list.slice(0, 20));
  renderDrafts();
  toast('Saved for later');
});

$('share-post')?.addEventListener('click', async () => {
  const sk = loadKey();
  if (!sk) return toast('Create your Viewer ID under Viewer Profile first');
  const text = $('post-text')?.value?.trim() || '';
  if (!text && !mediaDataUrl) return toast('Write something or add media');
  const place = $('post-place')?.value?.trim() || '';
  let content = text;
  if (place) content += (content ? '\n\n' : '') + '📍 ' + place;
  // Media is kept local-first in this build; text goes out.
  try {
    const pool = new SimplePool();
    const relays = loadPaths();
    const event = finalizeEvent(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: place ? [['l', place]] : [],
        content,
      },
      sk
    );
    const pubs = pool.publish(relays, event);
    await Promise.any(pubs.map((p) => p.catch(() => null)));
    pool.close(relays);
    $('post-text').value = '';
    if ($('post-place')) $('post-place').value = '';
    clearMedia();
    toast('Shared');
    loadFeed();
  } catch (e) {
    console.error(e);
    toast('Could not share right now');
  }
});

async function loadFeed() {
  const feed = $('feed');
  if (!feed) return;
  const follows = loadFollows();
  const sk = loadKey();
  const authors = [];
  if (sk) authors.push(pubOf(sk));
  for (const f of follows) {
    try {
      const d = nip19.decode(f);
      if (d.type === 'npub') authors.push(d.data);
    } catch {
      if (/^[0-9a-f]{64}$/i.test(f)) authors.push(f);
    }
  }
  if (!authors.length) {
    feed.innerHTML =
      '<div class="empty">Create your ID or follow someone first — then their posts appear here.</div>';
    return;
  }
  feed.innerHTML = '<div class="empty">Loading…</div>';
  try {
    const pool = new SimplePool();
    const relays = loadPaths();
    const events = await pool.querySync(relays, {
      kinds: [1],
      authors,
      limit: 40,
    });
    pool.close(relays);
    events.sort((a, b) => b.created_at - a.created_at);
    if (!events.length) {
      feed.innerHTML = '<div class="empty">No posts yet from you or people you follow.</div>';
      return;
    }
    feed.innerHTML = events
      .map((ev) => {
        let who = ev.pubkey.slice(0, 8) + '…';
        try {
          who = nip19.npubEncode(ev.pubkey).slice(0, 12) + '…';
        } catch {}
        const placeTag = (ev.tags || []).find((t) => t[0] === 'l');
        const place = placeTag ? placeTag[1] : '';
        return `<article class="post">
          <div class="who">${who}</div>
          <div class="body">${escapeHtml(ev.content || '')}</div>
          ${place ? `<div class="place">📍 ${escapeHtml(place)}</div>` : ''}
        </article>`;
      })
      .join('');
  } catch (e) {
    console.error(e);
    feed.innerHTML = '<div class="empty">Could not load the feed right now.</div>';
  }
}

$('refresh-home')?.addEventListener('click', () => loadFeed());

$('dm-send')?.addEventListener('click', async () => {
  const sk = loadKey();
  if (!sk) return toast('Create your Viewer ID under Viewer Profile first');
  const toRaw = $('dm-to')?.value?.trim();
  const body = $('dm-body')?.value?.trim();
  if (!toRaw || !body) return toast('Need their ID and a message');
  let theirPub;
  try {
    const d = nip19.decode(toRaw);
    if (d.type !== 'npub') throw new Error('need npub');
    theirPub = d.data;
  } catch {
    return toast('Paste a valid Viewer ID (npub…)');
  }
  try {
    const ciphertext = await nip04.encrypt(sk, theirPub, body);
    const pool = new SimplePool();
    const relays = loadPaths();
    const event = finalizeEvent(
      {
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['p', theirPub]],
        content: ciphertext,
      },
      sk
    );
    const pubs = pool.publish(relays, event);
    await Promise.any(pubs.map((p) => p.catch(() => null)));
    pool.close(relays);
    $('dm-body').value = '';
    toast('Sent privately');
  } catch (e) {
    console.error(e);
    toast('Could not send');
  }
});

$('dm-inbox')?.addEventListener('click', async () => {
  const sk = loadKey();
  if (!sk) return toast('Create your Viewer ID first');
  const log = $('dm-log');
  log.textContent = 'Checking…';
  try {
    const pool = new SimplePool();
    const relays = loadPaths();
    const myPub = pubOf(sk);
    const events = await pool.querySync(relays, {
      kinds: [4],
      '#p': [myPub],
      limit: 30,
    });
    pool.close(relays);
    if (!events.length) {
      log.textContent = 'No messages yet.';
      return;
    }
    const lines = [];
    for (const ev of events.sort((a, b) => b.created_at - a.created_at)) {
      try {
        const plain = await nip04.decrypt(sk, ev.pubkey, ev.content);
        let from = ev.pubkey.slice(0, 8) + '…';
        try {
          from = nip19.npubEncode(ev.pubkey).slice(0, 16) + '…';
        } catch {}
        lines.push(`From ${from}\n${plain}\n`);
      } catch {
        lines.push('(could not decrypt one message)\n');
      }
    }
    log.textContent = lines.join('\n');
  } catch (e) {
    console.error(e);
    log.textContent = 'Could not check messages.';
  }
});

$('hear-welcome')?.addEventListener('click', () => {
  try {
    const u = new SpeechSynthesisUtterance(
      'Welcome to The Remote Viewer. Find each other. Share what you choose.'
    );
    speechSynthesis.speak(u);
  } catch {
    toast('Speech not available on this device');
  }
});

refreshYou();
loadFeed();
