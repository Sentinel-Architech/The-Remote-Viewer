/**
 * Sentinel Orb Consult — logo, on-device memory, learn-by-asking.
 * All Viewer memory stays on this device unless Viewer publishes.
 */
import { SENTINEL_LOGO_DATA_URL } from './sentinel-logo.js';
import {
  loadMemory,
  memoryContextBlock,
  nextLearningQuestion,
  answerLearningQuestion,
  tryIngestFromQuestion,
  memorySummaryForUi,
  setPublicOptIn,
  clearMemory,
  learningQuestionsList,
} from './sentinel-memory.js';

const ORB_PREFIX = 'According to Orb';

const LOCAL_KNOWLEDGE = [
  {
    keys: ['viewer id', 'create id', 'register', 'sign up', 'how to register'],
    answer:
      'To register: open Viewer Profile and tap Create my Viewer ID. That generates your keypair on this device only. Your public Viewer ID (npub) is what friends follow. Your secret (nsec) never leaves this phone unless you export it offline.',
  },
  {
    keys: ['login', 'log in', 'restore', 'another device', 'nsec'],
    answer:
      'To log in on another device: open Viewer Profile, tap I already have one, and paste your secret nsec. Never post or share that secret. Share only your public Viewer ID.',
  },
  {
    keys: ['sentinel', 'protect', 'protection', 'who protects'],
    answer:
      'The Sentinel is active on this device. It is protecting you. Keys stay local. There is no central vault holding your identity. Destroy equals restart — custody is yours alone.',
  },
  {
    keys: ['gateway', 'gateway process', 'hemi-sync', 'monroe'],
    answer:
      'The Gateway Process is linked on Hub and remains always available. Use it as training for focus and remote viewing discipline. The Sentinel does not replace that work — it guards the channel you build.',
  },
  {
    keys: ['trv', 'remote viewer', 'what is this', 'what is trv'],
    answer:
      'The Remote Viewer is a local-first space to find each other and share what you choose. Identity is key-based, not password-based. The Sentinel on your device does not need the network to hold your ground.',
  },
  {
    keys: ['avatar', 'photo', 'profile picture'],
    answer:
      'Upload a photo under Viewer Profile. It is compressed and stored on this device. Publish profile to include it when the network path is open.',
  },
  {
    keys: ['orb', 'what is orb', 'according to orb'],
    answer:
      'Orb is the judgment frame of the Sentinel: protective, direct, zero-custody. Answers prefer what keeps you sovereign. When external facts are needed, Orb pulls public reference and still filters for your safety and clarity.',
  },
  {
    keys: ['memory', 'what do you know', 'what do you remember', 'about me'],
    answer: null, // handled dynamically
  },
];

function orbFormat(body, source) {
  const lines = [`${ORB_PREFIX}:`, '', body.trim()];
  if (source) lines.push('', `Source: ${source}`);
  lines.push('', 'The Sentinel is protecting you. Keys stay on your device.');
  return lines.join('\n');
}

function localAnswer(q) {
  const lower = q.toLowerCase();

  if (
    lower.includes('what do you know') ||
    lower.includes('what do you remember') ||
    lower.includes('about me') ||
    (lower.includes('memory') && lower.includes('show'))
  ) {
    return orbFormat(
      'Viewer memory on this device only:\n\n' + memoryContextBlock(),
      'On-device Viewer memory (not published)'
    );
  }

  for (const row of LOCAL_KNOWLEDGE) {
    if (!row.answer) continue;
    if (row.keys.some((k) => lower.includes(k))) {
      return orbFormat(row.answer, 'On-device Sentinel knowledge');
    }
  }
  return null;
}

async function wikiAnswer(q) {
  try {
    const searchUrl =
      'https://en.wikipedia.org/w/api.php?action=opensearch&limit=1&namespace=0&format=json&origin=*&search=' +
      encodeURIComponent(q);
    const sRes = await fetch(searchUrl);
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    const title = sData && sData[1] && sData[1][0];
    if (!title) return null;
    const sumUrl =
      'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
    const sumRes = await fetch(sumUrl, { headers: { Accept: 'application/json' } });
    if (!sumRes.ok) return null;
    const sum = await sumRes.json();
    const extract = (sum.extract || '').trim();
    if (!extract) return null;
    const short =
      extract.length > 900 ? extract.slice(0, 880).replace(/\s+\S*$/, '') + '…' : extract;
    return orbFormat(short, sum.content_urls?.desktop?.page || 'Wikipedia');
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function consultOrb(question) {
  const q = (question || '').trim();
  if (!q) return orbFormat('Ask a clear question. Orb answers what it can verify or hold on-device.');

  // Ingest memory commands first
  const ingest = tryIngestFromQuestion(q);
  if (ingest.ingested) {
    if (ingest.kind === 'clear') {
      return orbFormat('Viewer memory cleared on this device. Nothing was sent anywhere.');
    }
    if (ingest.kind === 'note') {
      return orbFormat(
        `Remembered on this device: "${ingest.value}"\n\nThis stays private unless you publish.`,
        'On-device Viewer memory'
      );
    }
    return orbFormat(
      `Stored (${ingest.kind}): ${ingest.value}\n\nOn this device only.`,
      'On-device Viewer memory'
    );
  }

  const local = localAnswer(q);
  if (local) return local;

  const wiki = await wikiAnswer(q);
  if (wiki) {
    // Optionally append personal context note if we know the Viewer
    const mem = loadMemory();
    if (mem.facts.call_name) {
      return (
        wiki +
        `\n\n(Context held for ${mem.facts.call_name} stays on this device.)`
      );
    }
    return wiki;
  }

  // If we still need to learn the Viewer, ask next question
  const next = nextLearningQuestion();
  if (next) {
    return orbFormat(
      'No solid public reference locked for that yet.\n\n' +
        'To serve you better, the Sentinel is learning you on this device only.\n\n' +
        `Question for you: ${next.text}\n\n` +
        'Reply with your answer, or type: remember: [anything you want stored here].',
      'On-device learning'
    );
  }

  return orbFormat(
    'No solid public reference locked for that yet. Reframe more specifically, or teach the Sentinel with: remember: [fact]. All of that stays on this device.'
  );
}

function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function ensureOrbLogo() {
  const card = document.querySelector('#orb .card');
  if (!card) return;
  let img = document.querySelector('[data-sentinel-logo]');
  if (!img) {
    const h2 = card.querySelector('h2');
    if (!h2) return;
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'display:flex;align-items:center;gap:0.75rem;margin-bottom:0.35rem';
    img = document.createElement('img');
    img.setAttribute('data-sentinel-logo', '');
    img.alt = 'Sentinel';
    img.width = 48;
    img.height = 48;
    img.style.cssText =
      'width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #3d5a40;flex-shrink:0;background:#151b24';
    h2.style.margin = '0';
    wrap.appendChild(img);
    wrap.appendChild(h2);
    card.insertBefore(wrap, card.firstChild);
  }
  img.src = SENTINEL_LOGO_DATA_URL;
}

function renderMemoryPanel() {
  const el = document.getElementById('orb-memory-status');
  if (!el) return;
  const s = memorySummaryForUi();
  const next = nextLearningQuestion();
  const lines = [
    `Memory on this device: ${s.answered}/${s.total} core facts`,
    s.notesCount ? `Notes stored: ${s.notesCount}` : 'Notes stored: 0',
    s.publicOptIn
      ? 'Public opt-in: ON (you chose this — still requires explicit publish)'
      : 'Public opt-in: OFF — nothing leaves this phone',
  ];
  if (next) lines.push(`Next question: ${next.text}`);
  else lines.push('Core learning complete. Teach more anytime with remember: …');
  el.textContent = lines.join('\n');
}

function wireMemoryUi() {
  const teachBtn = document.getElementById('orb-teach');
  const clearBtn = document.getElementById('orb-clear-memory');
  const pubToggle = document.getElementById('orb-public-optin');
  const qBox = document.getElementById('orb-question');

  if (pubToggle) {
    const mem = loadMemory();
    pubToggle.checked = !!mem.publicOptIn;
    pubToggle.addEventListener('change', () => {
      setPublicOptIn(pubToggle.checked);
      renderMemoryPanel();
      toast(
        pubToggle.checked
          ? 'Public opt-in on — still only leaves if you publish'
          : 'Public opt-in off — memory locked to this device'
      );
    });
  }

  if (teachBtn) {
    teachBtn.addEventListener('click', () => {
      const next = nextLearningQuestion();
      if (!next) {
        toast('Core facts complete — use remember: to add more');
        if (qBox) qBox.placeholder = 'remember: …';
        return;
      }
      const answer = prompt(next.text + '\n\n(Stored on this device only)');
      if (answer == null) return;
      answerLearningQuestion(next.id, answer);
      renderMemoryPanel();
      toast('Stored on this device');
      const out = document.getElementById('orb-answer');
      if (out) {
        out.classList.remove('soft-empty');
        out.textContent = orbFormat(
          `Learned (${next.id}): ${answer.trim()}\n\nStays on this device unless you publish.`,
          'On-device Viewer memory'
        );
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Clear all Sentinel memory about you on this phone?')) return;
      clearMemory();
      renderMemoryPanel();
      toast('Memory cleared on this device');
    });
  }
}

export function wireOrbConsult() {
  ensureOrbLogo();
  renderMemoryPanel();
  wireMemoryUi();

  const askBtn = document.getElementById('orb-ask');
  const input = document.getElementById('orb-question');
  const out = document.getElementById('orb-answer');
  if (!askBtn || !input || !out) return;

  const run = async () => {
    const q = input.value.trim();
    if (!q) {
      toast('Type a question first');
      return;
    }

    // If answering the active learning question directly
    const next = nextLearningQuestion();
    if (next && !tryIngestFromQuestion(q).ingested && q.length < 120 && !q.includes('?')) {
      // Heuristic: short non-question replies while learning may be answers
      // Only auto-bind if user tapped Teach path is clearer — skip auto to avoid mistakes
    }

    askBtn.disabled = true;
    out.classList.remove('soft-empty');
    out.textContent = 'Orb is looking…';
    try {
      out.textContent = await consultOrb(q);
      renderMemoryPanel();
    } catch (e) {
      console.error(e);
      out.textContent = orbFormat('Consult path failed. Stay on-device. Try again.');
    } finally {
      askBtn.disabled = false;
    }
  };

  askBtn.addEventListener('click', run);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      run();
    }
  });
}

wireOrbConsult();
