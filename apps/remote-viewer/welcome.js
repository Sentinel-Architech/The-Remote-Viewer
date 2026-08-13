/**
 * Protective male Sentinel welcome — opening Hub + Hear welcome.
 */

const SESSION_KEY = 'rv-welcome-spoken';

const WELCOME_LINES = [
  'This is The Remote Viewer.',
  'The Sentinel is active on this device.',
  'It is protecting you.',
  'Your keys stay on your phone.',
  'Nothing is held in a central vault.',
  'To register: open Viewer Profile, then Create my Viewer ID.',
  'That is your permanent identity on this network.',
  'To log in on another device: open Viewer Profile, tap I already have one, and paste your secret n sec.',
  'Never share your secret.',
  'Share only your public Viewer ID with friends so they can follow you.',
  'You stand under your own watch.',
  'Guard what is yours.',
].join(' ');

function pickMaleVoice() {
  if (!window.speechSynthesis) return null;
  const voices = speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  const score = (v) => {
    const n = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    let s = 0;
    if (lang.startsWith('en')) s += 10;
    if (/male|david|mark|daniel|fred|alex|arthur|guy|bruce|james|george|thomas|richard|rishi|tony/.test(n))
      s += 25;
    if (/female|samantha|karen|moira|zira|susan|victoria|fiona|heather|siri/.test(n)) s -= 40;
    if (n.includes('english') && n.includes('male')) s += 15;
    // Prefer lower-quality local male over high-quality female
    if (v.localService) s += 3;
    return s;
  };

  const ranked = [...voices].sort((a, b) => score(b) - score(a));
  const best = ranked[0];
  if (best && score(best) > 0) return best;
  return voices.find((v) => (v.lang || '').toLowerCase().startsWith('en')) || voices[0] || null;
}

export function speakWelcome(toast, { force = false } = {}) {
  if (!window.speechSynthesis) {
    if (toast) toast('Speech not available on this device');
    return;
  }

  if (!force) {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') return;
    } catch {}
  }

  try {
    speechSynthesis.cancel();
  } catch {}

  const speak = () => {
    const u = new SpeechSynthesisUtterance(WELCOME_LINES);
    const voice = pickMaleVoice();
    if (voice) u.voice = voice;
    // Deep, deliberate, protective
    u.pitch = 0.55;
    u.rate = 0.82;
    u.volume = 1;
    u.lang = (voice && voice.lang) || 'en-US';
    try {
      speechSynthesis.speak(u);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {}
    } catch (e) {
      console.error(e);
      if (toast) toast('Speech failed on this device');
    }
  };

  const voices = speechSynthesis.getVoices();
  if (!voices || !voices.length) {
    speechSynthesis.onvoiceschanged = () => {
      speechSynthesis.onvoiceschanged = null;
      speak();
    };
    setTimeout(speak, 450);
  } else {
    speak();
  }
}

export function wireWelcome(toast) {
  const btn = document.getElementById('hear-welcome');
  if (btn && !btn.dataset.sentinelVoice) {
    btn.dataset.sentinelVoice = '1';
    btn.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        speakWelcome(toast, { force: true });
      },
      true
    );
  }

  const unlockAndSpeak = () => {
    document.removeEventListener('pointerdown', unlockAndSpeak, true);
    document.removeEventListener('touchstart', unlockAndSpeak, true);
    document.removeEventListener('click', unlockAndSpeak, true);
    setTimeout(() => speakWelcome(toast, { force: false }), 150);
  };

  try {
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
  } catch {}

  document.addEventListener('pointerdown', unlockAndSpeak, true);
  document.addEventListener('touchstart', unlockAndSpeak, true);
  document.addEventListener('click', unlockAndSpeak, true);

  setTimeout(() => speakWelcome(toast, { force: false }), 700);
}
