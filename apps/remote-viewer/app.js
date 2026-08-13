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
import { vortexThen } from './vortex.js';

const KEY = 'rv-n3-nsec';
const RELAYS = 'rv-n3-relays';
const FOLLOWS = 'rv-n4-following';
const DRAFTS = 'rv-n4-drafts';
const PROFILE = 'rv-profile';
const SOCIAL_KEY = 'rv-social-links';
const DEFAULT_PATHS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
];
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
  localStorage.setItem(PROFILE, JSON.stringify(obj || {}));
}

function loadSocial() {
  try {
    return JSON.parse(localStorage.getItem(SOCIAL_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveSocial(obj) {
  localStorage.setItem(SOCIAL_KEY, JSON.stringify(obj || {}));
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSocialLinks() {
  const el = $('social-links');
  if (!el) return;
  const links = loadSocial();
  const keys = Object.keys(links).filter((k) => links[k]);
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
    if ($('you-id')) $('you-id').textContent = 'No identity yet';
    return;
  }
  if ($('you-id')) $('you-id').textContent = npubOf(sk);
  const prof = loadProfile();
  if ($('prof-name') && !$('prof-name').value) $('prof-name').value = prof.name || '';
  if ($('prof-about') && !$('prof-about').value) $('prof-about').value = prof.about || '';
  renderSocialLinks();
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

// --- Tab switches: high-res vortex + sound on every UI switch ---
document.querySelectorAll('.tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.screen;
    const current = document.querySelector('.tabs button.on')?.dataset?.screen;
    if (target === current) return;
    vortexThen(() => switchScreen(target), { duration: 720, playSound: true });
  });
});

$('create-id')?.addEventListener('click', () => {
  const sk = generateSecretKey();
  saveKey(sk);
  refreshYou();
  toast('Viewer ID ready — use Share with friends');
});

$('restore-id')?.addEventListener('click', () => {
  const nsec = prompt('Paste your nsec (starts with nsec1…)');
  if (!nsec) return;
  try {
    const { type, data } = nip19.decode(nsec.trim());
    if (type !== 'nsec') throw new Error('not nsec');
    saveKey(data);
    refreshYou();
    toast('Identity restored on this device');
  } catch {
    toast('Could not restore that key');
  }
});

$('copy-id')?.addEventListener('click', async () => {
  const sk = loadKey();
  if (!sk) return toast('Create a Viewer ID first');
  const id = npubOf(sk);
  try {
    await navigator.clipboard.writeText(id);
    toast('Viewer ID copied');
  } catch {
    toast(id);
  }
});

$('share-id')?.addEventListener('click', async () => {
  const sk = loadKey();
  if (!sk) return toast('Create a Viewer ID first');
  const id = npubOf(sk);
  const text = `Find me on The Remote Viewer\n${id}\n${APP_URL}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'The Remote Viewer', text, url: APP_URL });
      return;
    } catch {}
  }
  try {
    await navigator.clipboard.writeText(text);
    toast('Invite text copied');
  } catch {
    toast(text);
  }
});

// Keep other existing handlers if present in DOM
$('hub-post')?.addEventListener('click', async () => {
  const sk = loadKey();
  if (!sk) return toast('Create a Viewer ID first');
  const content = $('hub-post-text')?.value?.trim();
  if (!content) return toast('Write something first');
  try {
    const pool = new SimplePool();
    const relays = loadPaths();
    const event = finalizeEvent(
      { kind: 1, created_at: Math.floor(Date.now() / 1000), tags: [], content },
      sk
    );
    const pubs = pool.publish(relays, event);
    await Promise.any(pubs.map((p) => p.catch(() => null)));
    pool.close(relays);
    if ($('hub-post-text')) $('hub-post-text').value = '';
    toast('Posted');
  } catch (e) {
    console.error(e);
    toast('Post failed');
  }
});

$('hub-share-invite')?.addEventListener('click', () => {
  $('share-id')?.click();
});

$('refresh-home')?.addEventListener('click', () => {
  toast('Feed refresh is local-first for now');
});

// Boot
refreshYou();

// Expose for other modules (field claim vault return, etc.)
window.__trvSwitchScreen = (id) => vortexThen(() => switchScreen(id), { duration: 720, playSound: true });
window.__trvVortex = vortexThen;
