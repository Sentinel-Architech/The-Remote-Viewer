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

const WELCOME_WORDS =
  'Welcome to The Remote Viewer. Find each other. Share what you choose. Open The Gateway Process when you are ready.';

const $ = (id) => document.getElementById(id);

function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function speakWelcome() {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(WELCOME_WORDS);
    u.rate = 0.95;
    u.pitch = 1;
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  } catch (_) {
    /* silent if speech blocked */
  }
}

function showWelcomeGate() {
  const gate = $('welcome-gate');
  if (!gate) return;
  gate.hidden = false;
  // Browsers often require a user gesture for speech — try on load, and again on Enter/replay
  speakWelcome();
}

function dismissWelcome() {
  const gate = $('welcome-gate');
  if (gate) gate.hidden = true;
  sessionStorage.setItem('rv-welcomed', '1');
}

function loadPaths() {
  try {
    const raw = localStorage.getItem(RELAYS);
    if (raw) {
      const a = JSON.parse(raw);
      if (Array.isArray(a) && a.length) return a;
    }
  } catch (_) {}
  return DEFAULT_PATHS.slice();
}

function savePaths(list) {
  localStorage.setItem(RELAYS, JSON.stringify(list));
}

function parseSk(input) {
  const t = (input || '').trim();
  if (!t) return null;
  if (t.startsWith('nsec1')) {
    const d = nip19.decode(t);
    if (d.type !== 'nsec') throw new Error('That restore code is not valid');
    return d.data;
  }
  if (/^[0-9a-fA-F]{64}$/.test(t)) {
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i++) out[i] = parseInt(t.slice(i * 2, i * 2 + 2), 16);
    return out;
  }
  throw new Error('That restore code is not valid');
}

function getSk() {
  const s = localStorage.getItem(KEY);
  if (!s) return null;
  try {
    return parseSk(s);
  } catch {
    return null;
  }
}

function setSk(sk) {
  localStorage.setItem(KEY, nip19.nsecEncode(sk));
}

function viewerId(sk) {
  return nip19.npubEncode(getPublicKey(sk));
}

function shortId(pkOrNpub) {
  try {
    if (pkOrNpub.startsWith('npub')) return pkOrNpub.slice(0, 12) + '…';
    return nip19.npubEncode(pkOrNpub).slice(0, 12) + '…';
  } catch {
    return String(pkOrNpub).slice(0, 12) + '…';
  }
}

function parsePeer(input) {
  const t = (input || '').trim();
  if (!t) throw new Error('Add their Viewer ID');
  if (t.startsWith('npub1')) {
    const d = nip19.decode(t);
    if (d.type !== 'npub') throw new Error('That ID does not look right');
    return d.data;
  }
  if (/^[0-9a-fA-F]{64}$/.test(t)) return t.toLowerCase();
  throw new Error('That ID does not look right');
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
  localStorage.setItem(DRAFTS, JSON.stringify(list.slice(0, 30)));
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE) || '{}');
  } catch {
    return {};
  }
}

function saveProfile(p) {
  localStorage.setItem(PROFILE, JSON.stringify(p));
}

function refreshYou() {
  const sk = getSk();
  if (!sk) {
    $('you-status').textContent =
      'Create an ID to post and message. It stays on this phone unless you copy it somewhere safe.';
    $('you-id').textContent = 'No identity yet';
    return;
  }
  const id = viewerId(sk);
  $('you-status').textContent = 'You are ready to post and talk.';
  $('you-id').textContent = id;
  const p = loadProfile();
  $('prof-name').value = p.name || '';
  $('prof-about').value = p.about || '';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c])
  );
}

function renderFollows() {
  const list = loadFollows();
  const el = $('follow-list');
  if (!list.length) {
    el.innerHTML = '<p class="soft">No one yet.</p>';
    return;
  }
  el.innerHTML = list
    .map(
      (id, i) =>
        `<div class="person"><code>${escapeHtml(id)}</code>` +
        `<button type="button" class="btn warn" data-unf="${i}">Remove</button></div>`
    )
    .join('');
  el.querySelectorAll('[data-unf]').forEach((btn) => {
    btn.onclick = () => {
      const arr = loadFollows();
      arr.splice(+btn.dataset.unf, 1);
      saveFollows(arr);
      renderFollows();
      toast('Removed');
    };
  });
}

function renderDrafts() {
  const drafts = loadDrafts();
  const el = $('drafts');
  if (!drafts.length) {
    el.innerHTML = '<p class="soft">Nothing saved yet.</p>';
    return;
  }
  el.innerHTML = drafts
    .map((d, i) => {
      return (
        `<div class="post"><div class="body">${escapeHtml((d.text || '').slice(0, 180))}</div>` +
        `<div class="actions">` +
        `<button type="button" class="btn" data-ld="${i}">Load</button>` +
        `<button type="button" class="btn warn" data-dd="${i}">Delete</button></div></div>`
      );
    })
    .join('');
  el.querySelectorAll('[data-ld]').forEach((btn) => {
    btn.onclick = () => {
      const d = loadDrafts()[+btn.dataset.ld];
      if (!d) return;
      $('post-text').value = d.text || '';
      $('post-place').value = d.place || '';
      if (d.place) $('place-wrap').hidden = false;
      toast('Draft loaded');
    };
  });
  el.querySelectorAll('[data-dd]').forEach((btn) => {
    btn.onclick = () => {
      const arr = loadDrafts();
      arr.splice(+btn.dataset.dd, 1);
      saveDrafts(arr);
      renderDrafts();
    };
  });
}

function renderFeed(events) {
  const box = $('feed');
  if (!events.length) {
    box.innerHTML =
      '<div class="empty">No posts yet. Share something, or follow people you trust.</div>';
    return;
  }
  events.sort((a, b) => b.created_at - a.created_at);
  box.innerHTML = events
    .map((ev) => {
      const when = new Date(ev.created_at * 1000).toLocaleString();
      const name = shortId(ev.pubkey);
      let body = ev.content || '';
      let mediaHtml = '';
      let place = '';
      const imgMatch = body.match(/\n\n\[photo\]\n(data:image\/[^\s]+)/);
      const vidMatch = body.match(/\n\n\[video\]\n(data:video\/[^\s]+)/);
      const placeMatch = body.match(/\n\n\[place\] (.+)$/m);
      if (imgMatch) {
        mediaHtml = `<img src="${imgMatch[1]}" alt="">`;
        body = body.replace(imgMatch[0], '');
      }
      if (vidMatch) {
        mediaHtml = `<video controls src="${vidMatch[1]}"></video>`;
        body = body.replace(vidMatch[0], '');
      }
      if (placeMatch) {
        place = placeMatch[1];
        body = body.replace(placeMatch[0], '');
      }
      return (
        `<article class="post">` +
        `<div class="who">${escapeHtml(name)} · ${escapeHtml(when)}</div>` +
        `<div class="body">${escapeHtml(body.trim())}</div>` +
        mediaHtml +
        (place ? `<div class="place">📍 ${escapeHtml(place)}</div>` : '') +
        `</article>`
      );
    })
    .join('');
}

let mediaData = null;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (file.size > 1.6e6) {
      reject(new Error('Please choose a smaller photo or video for now (about 1.5 MB max).'));
      return;
    }
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Could not read that file'));
    r.readAsDataURL(file);
  });
}

function showMediaPreview(dataUrl, kind) {
  const box = $('media-preview');
  box.hidden = false;
  if (kind === 'image') box.innerHTML = `<img src="${dataUrl}" alt="">`;
  else box.innerHTML = `<video controls src="${dataUrl}"></video>`;
}

document.querySelectorAll('.tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.remove('on'));
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('on'));
    btn.classList.add('on');
    $(btn.dataset.screen).classList.add('on');
    if (btn.dataset.screen === 'you') refreshYou();
  });
});

$('create-id').onclick = () => {
  const sk = generateSecretKey();
  setSk(sk);
  refreshYou();
  toast('Your Viewer ID is ready. Copy it and keep a safe backup.');
};

$('restore-id').onclick = () => {
  const raw = prompt('Paste the private restore code you saved');
  if (!raw) return;
  try {
    const sk = parseSk(raw);
    setSk(sk);
    refreshYou();
    toast('Restored');
  } catch (e) {
    toast(e.message || 'Could not restore');
  }
};

$('copy-id').onclick = async () => {
  const sk = getSk();
  if (!sk) return toast('Create your Viewer ID first');
  const id = viewerId(sk);
  try {
    await navigator.clipboard.writeText(id);
    toast('Viewer ID copied');
  } catch {
    toast(id);
  }
};

$('forget-id').onclick = () => {
  if (!confirm('Remove your identity from this phone? Make sure you have a backup first.')) return;
  localStorage.removeItem(KEY);
  refreshYou();
  toast('Removed from this phone');
};

$('save-profile').onclick = () => {
  saveProfile({ name: $('prof-name').value.trim(), about: $('prof-about').value.trim() });
  toast('Profile saved on this phone');
};

$('paths').value = loadPaths().join('\n');
$('save-paths').onclick = () => {
  const list = $('paths')
    .value.split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith('wss://'));
  if (!list.length) return toast('Keep at least one path');
  savePaths(list);
  toast('Saved');
};

$('follow-add').onclick = () => {
  const raw = $('follow-input').value.trim();
  try {
    parsePeer(raw);
    const list = loadFollows();
    if (list.includes(raw)) return toast('Already following');
    list.push(raw);
    saveFollows(list);
    $('follow-input').value = '';
    renderFollows();
    toast('Following');
  } catch (e) {
    toast(e.message);
  }
};

$('post-photo').onchange = async (e) => {
  try {
    const file = e.target.files && e.target.files[0];
    const dataUrl = await readFileAsDataUrl(file);
    if (!dataUrl) return;
    mediaData = { type: 'image', dataUrl };
    showMediaPreview(dataUrl, 'image');
    $('post-video').value = '';
  } catch (err) {
    toast(err.message);
  }
};

$('post-video').onchange = async (e) => {
  try {
    const file = e.target.files && e.target.files[0];
    const dataUrl = await readFileAsDataUrl(file);
    if (!dataUrl) return;
    mediaData = { type: 'video', dataUrl };
    showMediaPreview(dataUrl, 'video');
    $('post-photo').value = '';
  } catch (err) {
    toast(err.message);
  }
};

$('add-place').onclick = () => {
  const wrap = $('place-wrap');
  wrap.hidden = !wrap.hidden;
  if (!wrap.hidden && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!$('post-place').value) {
          $('post-place').value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        }
        toast('Place filled from this device — edit or clear anytime');
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }
};

$('save-draft').onclick = () => {
  const text = $('post-text').value.trim();
  if (!text && !mediaData) return toast('Write something first');
  const drafts = loadDrafts();
  drafts.unshift({ text, place: $('post-place').value.trim(), at: Date.now() });
  saveDrafts(drafts);
  renderDrafts();
  toast('Saved for later');
};

$('share-post').onclick = async () => {
  const sk = getSk();
  if (!sk) return toast('Create your Viewer ID under You first');
  let text = $('post-text').value.trim();
  const place = $('post-place').value.trim();
  if (!text && !mediaData) return toast('Add text, a photo, or a video');
  if (mediaData?.type === 'image') text += `\n\n[photo]\n${mediaData.dataUrl}`;
  if (mediaData?.type === 'video') text += `\n\n[video]\n${mediaData.dataUrl}`;
  if (place) text += `\n\n[place] ${place}`;
  if (text.length > 180000) {
    return toast('That media is still too large to share this way. Try a smaller file.');
  }
  $('share-post').disabled = true;
  toast('Sharing…');
  try {
    const event = finalizeEvent(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: place ? [['location', place]] : [],
        content: text,
      },
      sk
    );
    const paths = loadPaths();
    const pool = new SimplePool();
    const results = await Promise.allSettled(pool.publish(paths, event));
    pool.close(paths);
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    if (ok) {
      toast('Shared');
      $('post-text').value = '';
      $('post-place').value = '';
      mediaData = null;
      $('media-preview').hidden = true;
      $('media-preview').innerHTML = '';
      $('post-photo').value = '';
      $('post-video').value = '';
    } else toast('Could not share right now. Try again later.');
  } catch (e) {
    toast(e.message || 'Could not share');
  } finally {
    $('share-post').disabled = false;
  }
};

$('refresh-home').onclick = async () => {
  const sk = getSk();
  const follows = loadFollows();
  const authors = [];
  if (sk) authors.push(getPublicKey(sk));
  for (const f of follows) {
    try {
      authors.push(parsePeer(f));
    } catch (_) {}
  }
  const uniq = [...new Set(authors)];
  if (!uniq.length) {
    toast('Create your ID or follow someone first');
    return;
  }
  toast('Updating…');
  const paths = loadPaths();
  const pool = new SimplePool();
  try {
    const events = await pool.querySync(paths, {
      kinds: [1],
      authors: uniq,
      since: Math.floor(Date.now() / 1000) - 86400 * 21,
      limit: 50,
    });
    renderFeed(events);
    toast(events.length ? `${events.length} posts` : 'No posts yet');
  } catch (e) {
    toast('Could not refresh');
  } finally {
    pool.close(paths);
  }
};

function dmLog(msg) {
  const el = $('dm-log');
  el.textContent = (el.textContent ? el.textContent + '\n' : '') + msg;
}

$('dm-send').onclick = async () => {
  const sk = getSk();
  if (!sk) return toast('Create your Viewer ID under You first');
  const body = $('dm-body').value.trim();
  if (!body) return toast('Write a message');
  let peer;
  try {
    peer = parsePeer($('dm-to').value);
  } catch (e) {
    return toast(e.message);
  }
  $('dm-send').disabled = true;
  try {
    const ciphertext = await nip04.encrypt(sk, peer, body);
    const event = finalizeEvent(
      {
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['p', peer]],
        content: ciphertext,
      },
      sk
    );
    const paths = loadPaths();
    const pool = new SimplePool();
    const results = await Promise.allSettled(pool.publish(paths, event));
    pool.close(paths);
    const ok = results.some((r) => r.status === 'fulfilled');
    if (ok) {
      toast('Sent');
      $('dm-body').value = '';
      dmLog('Sent');
    } else toast('Message did not go through');
  } catch (e) {
    toast(e.message || 'Could not send');
  } finally {
    $('dm-send').disabled = false;
  }
};

$('dm-inbox').onclick = async () => {
  const sk = getSk();
  if (!sk) return toast('Create your Viewer ID first');
  const pk = getPublicKey(sk);
  const paths = loadPaths();
  const pool = new SimplePool();
  dmLog('Checking…');
  try {
    const events = await pool.querySync(paths, {
      kinds: [4],
      '#p': [pk],
      since: Math.floor(Date.now() / 1000) - 86400 * 7,
      limit: 20,
    });
    if (!events.length) {
      dmLog('No recent messages');
      toast('No recent messages');
    } else {
      events.sort((a, b) => b.created_at - a.created_at);
      for (const ev of events.slice(0, 8)) {
        try {
          const plain = await nip04.decrypt(sk, ev.pubkey, ev.content);
          dmLog(shortId(ev.pubkey) + ': ' + plain.slice(0, 200));
        } catch {
          dmLog(shortId(ev.pubkey) + ': (could not open)');
        }
      }
      toast('Updated');
    }
  } catch {
    toast('Could not check messages');
  } finally {
    pool.close(paths);
  }
};

// Welcome gate
const enterBtn = $('welcome-enter');
const replayBtn = $('welcome-replay');
const hearBtn = $('hear-welcome');
if (enterBtn) {
  enterBtn.onclick = () => {
    speakWelcome();
    dismissWelcome();
  };
}
if (replayBtn) {
  replayBtn.onclick = () => speakWelcome();
}
if (hearBtn) {
  hearBtn.onclick = () => speakWelcome();
}
// Tap anywhere on the gold Gateway link still opens the document;
// also ensure speech can unlock after first gesture on mobile
document.addEventListener(
  'click',
  function unlockSpeechOnce() {
    if (!sessionStorage.getItem('rv-speech-unlocked')) {
      sessionStorage.setItem('rv-speech-unlocked', '1');
      // no-op speak to unlock audio on some mobile browsers
      try {
        const u = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(u);
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
  },
  { once: true, capture: true }
);

// boot
refreshYou();
renderFollows();
renderDrafts();
showWelcomeGate();
