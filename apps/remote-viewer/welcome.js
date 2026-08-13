/**
 * Protective male Sentinel welcome voice.
 * Picks deepest available English male voice; low pitch, steady rate.
 */

const WELCOME_LINES = [
  'This is The Remote Viewer.',
  'You stand under your own watch.',
  'Guard what is yours.',
  'Find your people.',
  'Share only what you choose.',
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
    if (/male|david|mark|daniel|fred|alex|arthur|guy|bruce|james|george|thomas|richard/.test(n)) s += 20;
    if (/female|samantha|karen|moira|zira|susan|victoria|fiona|karen|heather/.test(n)) s -= 30;
    if (/google.*english.*(united states|us)/.test(n) && /male/.test(n)) s += 15;
    if (n.includes('english') && n.includes('male')) s += 12;
    return s;
  };

  const ranked = [...voices].sort((a, b) => score(b) - score(a));
  const best = ranked[0];
  if (best && score(best) > 0) return best;
  // Fallback: any en voice
  return voices.find((v) => (v.lang || '').toLowerCase().startsWith('en')) || voices[0] || null;
}

export function speakWelcome(toast) {
  if (!window.speechSynthesis) {
    if (toast) toast('Speech not available on this device');
    return;
  }

  // Cancel any current speech
  try {
    speechSynthesis.cancel();
  } catch {}

  const speak = () => {
    const u = new SpeechSynthesisUtterance(WELCOME_LINES);
    const voice = pickMaleVoice();
    if (voice) u.voice = voice;
    u.pitch = 0.72; // deeper
    u.rate = 0.88; // steady, deliberate
    u.volume = 1;
    u.lang = (voice && voice.lang) || 'en-US';
    try {
      speechSynthesis.speak(u);
    } catch (e) {
      console.error(e);
      if (toast) toast('Speech failed on this device');
    }
  };

  // Voices often load async on mobile
  const voices = speechSynthesis.getVoices();
  if (!voices || !voices.length) {
    speechSynthesis.onvoiceschanged = () => {
      speechSynthesis.onvoiceschanged = null;
      speak();
    };
    // Fallback if event never fires
    setTimeout(speak, 350);
  } else {
    speak();
  }
}

export function wireWelcome(toast) {
  const btn = document.getElementById('hear-welcome');
  if (!btn || btn.dataset.sentinelVoice) return;
  btn.dataset.sentinelVoice = '1';
  // Capture phase so we override the softer app.js handler
  btn.addEventListener(
    'click',
    (e) => {
      e.stopImmediatePropagation();
      speakWelcome(toast);
    },
    true
  );
}
