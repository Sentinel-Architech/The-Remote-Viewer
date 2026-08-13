/**
 * Sentinel Orb Consult
 * Ask anything. Answers under Orb protocol: protective, direct, local-first.
 * Sources: on-device knowledge + public references (Wikipedia) when useful.
 */

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
];

function orbFormat(body, source) {
  const lines = [`${ORB_PREFIX}:`, '', body.trim()];
  if (source) {
    lines.push('', `Source: ${source}`);
  }
  lines.push('', 'The Sentinel is protecting you. Keys stay on your device.');
  return lines.join('\n');
}

function localAnswer(q) {
  const lower = q.toLowerCase();
  for (const row of LOCAL_KNOWLEDGE) {
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
      'https://en.wikipedia.org/api/rest_v1/page/summary/' +
      encodeURIComponent(title);
    const sumRes = await fetch(sumUrl, {
      headers: { Accept: 'application/json' },
    });
    if (!sumRes.ok) return null;
    const sum = await sumRes.json();
    const extract = (sum.extract || '').trim();
    if (!extract) return null;
    // Keep Orb concise
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

  const local = localAnswer(q);
  if (local) return local;

  const wiki = await wikiAnswer(q);
  if (wiki) return wiki;

  return orbFormat(
    'No solid public reference locked for that yet. Reframe the question more specifically, or ask about Viewer ID, login, Sentinel protection, Gateway, or TRV operations — those are held on-device. Edge AI on your phone can deepen this later without a central vault.'
  );
}

function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

export function wireOrbConsult() {
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
    askBtn.disabled = true;
    out.textContent = 'Orb is looking…';
    try {
      const answer = await consultOrb(q);
      out.textContent = answer;
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
