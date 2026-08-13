/**
 * The Remote Viewer — seamless social client
 * Restored core; avatar upload lives in avatar-boot.js + avatar.js
 */
import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  nip04,
  nip19,
  SimplePool,
} from 'https://esm.sh/nostr-tools@2.10.4';
import { vortexThen } from './vortex.js';

const KEY = 'rv-n3-nsec';
const RELAYS = 'rv-n3-relays';
const FOLLOWS = 'rv-n4-following';
const DRAFTS = 'rv-n4-drafts';
const PROFILE = 'rv-profile';
const SOCIAL_KEY = 'rv-social-links';
const DEFAULT_PATHS = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band'];
const APP_URL = 'https://sentinel-archetecht.github.io/The-Remote-Viewer/';

const SOCIAL_META = {
  x: { label: 'X', base: 'https://x.com/' },
  instagram: { label: 'Instagram', base: 'https://instagram.com/' },
  youtube: { label: 'YouTube', base: 'https://youtube.com/' },
  tiktok: { label: 'TikTok', base: 'https://tiktok.com/@' },
  facebook: { label: 'Facebook', base: 'https://facebook.com/' },
  github: { label: 'GitHub', base: 'https://github.com/' },
  linkedin: { label: 'LinkedIn', base: 'https://linkedin.com/in/' },
  discord: { label: 'Discord', base: '' },
  telegram: { label: 'Telegram', base: 'https://t.me/' },
  reddit: { label: 'Reddit', base: 'https://reddit.com/user/' },
  website: { label: 'Website', base: '' },
};

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

function loadSocial() {
  try {
    return JSON.parse(localStorage.getItem(SOCIAL_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveSocial(obj) {
  localStorage.setItem(SOCIAL_KEY, JSON.stringify(obj));
}

function normalizeSocialUrl(platform, handle) {
  const h = (handle || '').trim();
  if (!h) return '';
  if (/^https?:\/\//i.test(h)) return h;
  const meta = SOCIAL_META[platform];
  if (!meta) return h;
  if (platform === 'discord') return h;
  if (platform === 'website') return h.startsWith('http') ? h : 'https://' + h;
  return (meta.base || '') + h.replace(/^@/, '');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadPaths() {
  const raw = localStorage.getItem(RELAYS);
  if (!raw) return [...DEFAULT_PATHS];
  return raw.split('\n').map((s) => s.trim()).filter(Boolean);
}

function savePaths(list) {
  localStorage.setItem(RELAYS, list.join('\n'));
}

function renderSocialLinks() {
  const el = $('social-links-list');
  if (!el) return;
  const links = loadSocial();
  const keys = Object.keys(links);
  if (!keys.length) {
    el.innerHTML = '<p class="soft" style="margin:0.5rem 0">No social linked yet.</p>';
    return;
  }
  el.innerHTML = keys
    .map((k) => {
      const meta = SOCIAL_META[k] || { label: k };
      const url = links[k];
      return `<div class="id-chip" style="display:flex;justify-content:space-between;gap:0.5rem;align-items:center;margin:0.35rem 0">
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);word-break:break-all;text-decoration:none">
          <strong style="color:var(--text)">${meta.label}</strong> · ${escapeHtml(url)}
        </a>
        <button type="button" class="btn quiet" data-unlink="${k}">Remove</button>
      </div>`;
    })
    .join('');
  el.querySelectorAll('[data-unlink]').forEach((btn) => {
    btn.onclick = () => {
      const links = loadSocial();
      delete links[btn.getAttribute('data-unlink')];
      saveSocial(links);
      renderSocialLinks();
      toast('Unlinked');
    };
  });
}

async function publishProfileAndSocial() {
  const name = $('prof-name')?.value?.trim() || loadProfile().name || '';
  const about = $('prof-about')?.value?.trim() || loadProfile().about || '';
  saveProfileObj({ name, about });
  const sk = loadKey();
  if (!sk) {
    toast('Create a Viewer ID first');
    return false;
  }
  const social = loadSocial();
  const contentObj = {
    name,
    about,
    display_name: name,
    website: social.website || APP_URL,
    trv_social: social,
  };
  if (social.x) contentObj.twitter = social.x;
  if (social.github) contentObj.github = social.github;
  try {
    const pool = new SimplePool();
    const relays = loadPaths();
    const event = finalizeEvent(
      {
        kind: 0,
        created_at: Math.floor(Date.now() / 1000),
        tags: Object.entries(social).map(([k, v]) => ['r', v, k]),
        content: JSON.stringify(contentObj),
      },
      sk
    );
    const pubs = pool.publish(relays, event);
    await Promise.any(pubs.map((p) => p.catch(() => null)));
    pool.close(relays);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function renderFollows() {
  const list = loadFollows();
  const el = $('follow-list');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<p class="soft">No one yet. Paste a friend\'s Viewer ID to follow.</p>';
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
      if ($('post-text')) $('post-text').value = d.text || '';
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

function refreshYou() {
  const sk = loadKey();
  if (!sk) {
    if ($('you-id')) $('you-id').textContent = 'No identity yet';
    if ($('you-status'))
      $('you-status').textContent =
        'Create an ID to post and message. Share it with friends so they can follow you.';
    renderSocialLinks();
    return;
  }
  if ($('you-id')) $('you-id').textContent = npubOf(sk);
  if ($('you-status')) $('you-status').textContent = 'You are ready to post and talk.';
  const prof = loadProfile();
  if ($('prof-name')) $('prof-name').value = prof.name || '';
  if ($('prof-about')) $('prof-about').value = prof.about || '';
  renderFollows();
  renderDrafts();
  renderSocialLinks();
  if ($('paths')) $('paths').value = loadPaths().join('\n');
}

function switchScreen(screenId) {
  document.querySelectorAll('.tabs button').forEach((b) => {
    b.classList.toggle('on', b.getAttribute('data-screen') === screenId);
  });
  document.querySelectorAll('.screen').forEach((s) => {
    s.classList.toggle('on', s.id === screenId);
  });
  if (screenId === 'you') refreshYou();
}

document.querySelectorAll('.tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.screen;
    const current = document.querySelector('.tabs button.on')?.dataset?.screen;
    if (target === current) return;
    vortexThen(() => switchScreen(target), { duration: 720, playSound: true });
  });
});

window.__trvSwitchScreen = (id) => vortexThen(() => switchScreen(id), { duration: 720, playSound: true });
window.__trvVortex = vortexThen;

$('create-id')?.addEventListener('click', () => {
  saveKey(generateSecretKey());
  refreshYou();
  toast('Viewer ID ready — use Share with friends');
});

$('restore-id')?.addEventListener('click', () => {
  const nsec = prompt('Paste your nsec (starts with nsec1\u2026)');
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
  const shareText = `Find me on The Remote Viewer\n${id}\n${APP_URL}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'The Remote Viewer', text: shareText, url: APP_URL });
      toast('Shared');
      return;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
  }
  try {
    await navigator.clipboard.writeText(shareText);
    toast('Invite copied — send to friends');
  } catch {
    prompt('Share this with friends', shareText);
  }
});

$('export-secret')?.addEventListener('click', async () => {
  const nsec = localStorage.getItem(KEY);
  if (!nsec) return toast('No secret on this phone');
  if (!confirm('This shows your PRIVATE key (nsec). Only save offline.')) return;
  try {
    await navigator.clipboard.writeText(nsec);
    toast('Secret copied — store it offline now');
  } catch {
    prompt('BACKUP OFFLINE — do not share', nsec);
  }
});

$('forget-id')?.addEventListener('click', () => {
  if (!confirm('Remove the Viewer ID from this phone?')) return;
  localStorage.removeItem(KEY);
  refreshYou();
  toast('Removed from this phone');
});

$('save-profile')?.addEventListener('click', async () => {
  const name = $('prof-name')?.value?.trim() || '';
  const about = $('prof-about')?.value?.trim() || '';
  saveProfileObj({ name, about });
  if (!loadKey()) {
    toast('Saved on phone — create a Viewer ID to publish');
    return;
  }
  const ok = await publishProfileAndSocial();
  toast(ok ? 'Profile & social published' : 'Saved on phone — publish failed, try again');
});

$('social-add')?.addEventListener('click', () => {
  const platform = $('social-platform')?.value || 'x';
  const handle = $('social-handle')?.value?.trim();
  if (!handle) return toast('Enter a handle or URL');
  const url = normalizeSocialUrl(platform, handle);
  if (!url) return toast('Could not build link');
  const links = loadSocial();
  links[platform] = url;
  saveSocial(links);
  if ($('social-handle')) $('social-handle').value = '';
  renderSocialLinks();
  toast('Linked — tap Publish links so the network sees it');
});

$('social-publish')?.addEventListener('click', async () => {
  const ok = await publishProfileAndSocial();
  toast(ok ? 'Social links published to the network' : 'Publish failed — try again');
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
  if ($('follow-input')) $('follow-input').value = '';
  renderFollows();
  toast('Following');
  loadFeed();
});

$('save-paths')?.addEventListener('click', () => {
  const lines = ($('paths')?.value || '').split('\n').map((s) => s.trim()).filter(Boolean);
  savePaths(lines.length ? lines : DEFAULT_PATHS);
  toast('Paths saved');
});

$('hub-post')?.addEventListener('click', async () => {
  const sk = loadKey();
  if (!sk) return toast('Create your Viewer ID under Viewer Profile first');
  const text = $('hub-post-text')?.value?.trim() || '';
  if (!text) return toast('Write something first');
  try {
    const pool = new SimplePool();
    const relays = loadPaths();
    const event = finalizeEvent(
      { kind: 1, created_at: Math.floor(Date.now() / 1000), tags: [], content: text },
      sk
    );
    const pubs = pool.publish(relays, event);
    await Promise.any(pubs.map((p) => p.catch(() => null)));
    pool.close(relays);
    if ($('hub-post-text')) $('hub-post-text').value = '';
    toast('Posted — friends who follow you can see it');
    loadFeed();
  } catch (e) {
    console.error(e);
    toast('Could not post right now');
  }
});

$('hub-share-invite')?.addEventListener('click', () => $('copy-id')?.click());

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
      '<div class="empty">Create your ID or follow someone first — then posts appear here.</div>';
    return;
  }
  feed.innerHTML = '<div class="empty">Loading…</div>';
  try {
    const pool = new SimplePool();
    const relays = loadPaths();
    const events = await pool.querySync(relays, { kinds: [1], authors, limit: 40 });
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
        return `<article class="post"><div class="who">${who}</div><div class="body">${escapeHtml(ev.content || '')}</div></article>`;
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
    if ($('dm-body')) $('dm-body').value = '';
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
  if (!log) return;
  log.textContent = 'Checking…';
  try {
    const pool = new SimplePool();
    const relays = loadPaths();
    const myPub = pubOf(sk);
    const events = await pool.querySync(relays, { kinds: [4], '#p': [myPub], limit: 30 });
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
    speechSynthesis.speak(
      new SpeechSynthesisUtterance(
        'Welcome to The Remote Viewer. Find each other. Share what you choose.'
      )
    );
  } catch {
    toast('Speech not available on this device');
  }
});

refreshYou();
loadFeed();
