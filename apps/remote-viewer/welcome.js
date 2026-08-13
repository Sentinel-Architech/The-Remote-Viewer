/**
 * Protective male Sentinel welcome — plays on opening Hub.
 * Covers register / login methods and states protection clearly.
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
  'To log in on another device: open Viewer Profile, tap I already have one, and paste your secret nsec.',
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
    if (/male|david|mark|daniel|fred|alex|arthur|guy|bruce|james|george|thomas|richard|rishi/.test(n))
      s += 20;
    if (/female|samantha|karen|moira|zira|susan|victoria|fiona|heather|karen/.test(n)) s -= 30;
    if (n.includes('english') && n.includes('male')) s += 12;
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

  if (!force && sessionStorage.getItem(SESSION_KEY) === '1') return;

  try {
    speechSynthesis.cancel();
  } catch {}

  const speak = () => {
    const u = new SpeechSynthesisUtterance(WELCOME_LINES);
    const voice = pickMaleVoice();
    if (voice) u.voice = voice;
    u.pitch = 0.72;
    u.rate = 0.86;
    u.volume = 1;
    u.lang = (voice && voice.lang) || 'en-US';
    u.onend = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {}
    };
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
    setTimeout(speak, 400);
  } else {
    speak();
  }
}

/**
 * Mobile browsers block speech until a user gesture.
 * Strategy: speak on first user tap anywhere, and also on Hear welcome (forced).
 * If a prior gesture exists, speak on Hub open.
 */
export function wireWelcome(toast) {
  const btn = document.getElementById('hear-welcome');
  if (btn && !btn.dataset.sentinelVoice) {
    btn.dataset.sentinelVoice = '1';
    btn.addEventListener(
      'click',
      (e) => {
        e.stopImmediatePropagation();
        speakWelcome(toast, { force: true });
      },
      true
    );
  }

  // Opening-page auto path: first interaction unlocks speech, then we speak once
  const unlockAndSpeak = () => {
    document.removeEventListener('pointerdown', unlockAndSpeak, true);
    document.removeEventListener('touchstart', unlockAndSpeak, true);
    document.removeEventListener('click', unlockAndSpeak, true);
    // Small delay so the gesture is fully registered
    setTimeout(() => speakWelcome(toast, { force: false }), 120);
  };

  // If already spoken this session, skip binding
  try {
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
  } catch {}

  document.addEventListener('pointerdown', unlockAndSpeak, true);
  document.addEventListener('touchstart', unlockAndSpeak, true);
  document.addEventListener('click', unlockAndSpeak, true);

  // Attempt immediate speak (works if browser already has gesture credit)
  setTimeout(() => speakWelcome(toast, { force: false }), 600);
}
