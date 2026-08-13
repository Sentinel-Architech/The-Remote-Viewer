/**
 * Avatar boot + protective welcome voice.
 */
import { wireAvatarControls, loadAvatar, renderAvatar } from './avatar.js';
import { wireWelcome } from './welcome.js';
import {
  finalizeEvent,
  nip19,
  SimplePool,
} from 'https://esm.sh/nostr-tools@2.10.4';

const KEY = 'rv-n3-nsec';
const RELAYS = 'rv-n3-relays';
const PROFILE = 'rv-profile';
const SOCIAL_KEY = 'rv-social-links';
const DEFAULT_PATHS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
];
const APP_URL = 'https://sentinel-archetecht.github.io/The-Remote-Viewer/';

function toast(msg) {
  const t = document.getElementById('toast');
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

function loadPaths() {
  const raw = localStorage.getItem(RELAYS);
  if (!raw) return [...DEFAULT_PATHS];
  return raw.split('\n').map((s) => s.trim()).filter(Boolean);
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE) || '{}');
  } catch {
    return {};
  }
}

function loadSocial() {
  try {
    return JSON.parse(localStorage.getItem(SOCIAL_KEY) || '{}');
  } catch {
    return {};
  }
}

async function publishWithPicture() {
  const sk = loadKey();
  if (!sk) return false;
  const avatar = loadAvatar();
  const name =
    document.getElementById('prof-name')?.value?.trim() || loadProfile().name || '';
  const about =
    document.getElementById('prof-about')?.value?.trim() || loadProfile().about || '';
  const social = loadSocial();
  const contentObj = {
    name,
    about,
    display_name: name,
    website: social.website || APP_URL,
    trv_social: social,
  };
  if (avatar) contentObj.picture = avatar;
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

wireAvatarControls(toast);
renderAvatar();
wireWelcome(toast);

document.querySelectorAll('.tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.screen === 'you') setTimeout(renderAvatar, 80);
  });
});

const saveBtn = document.getElementById('save-profile');
if (saveBtn && !saveBtn.dataset.avatarPub) {
  saveBtn.dataset.avatarPub = '1';
  saveBtn.addEventListener(
    'click',
    () => {
      setTimeout(async () => {
        if (!loadAvatar()) return;
        const ok = await publishWithPicture();
        if (ok) toast('Avatar included in published profile');
      }, 400);
    },
    false
  );
}
