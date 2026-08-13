/**
 * Sentinel Viewer Memory — device-local only.
 * Learns about the Viewer, asks questions, never leaves the phone
 * unless the Viewer explicitly publishes.
 */

const MEM_KEY = 'rv-sentinel-memory';
const ASK_QUEUE_KEY = 'rv-sentinel-ask-queue';

/** Starter questions the Sentinel uses to learn the Viewer */
const LEARNING_QUESTIONS = [
  { id: 'call_name', text: 'What should the Sentinel call you?' },
  { id: 'purpose', text: 'What are you building or protecting right now?' },
  { id: 'boundaries', text: 'What must never leave this device without your say?' },
  { id: 'focus', text: 'What should Orb prioritize when you ask for help?' },
  { id: 'allies', text: 'Who are the people you trust on this network (names or roles only)?' },
  { id: 'threat', text: 'What are you most careful about online?' },
  { id: 'strength', text: 'What strength should the Sentinel remember about you?' },
  { id: 'location_feel', text: 'Do you want Orb to treat location as private, shared, or never asked?' },
];

export function loadMemory() {
  try {
    const raw = localStorage.getItem(MEM_KEY);
    if (!raw) return { facts: {}, notes: [], updatedAt: null, publicOptIn: false };
    const m = JSON.parse(raw);
    return {
      facts: m.facts || {},
      notes: Array.isArray(m.notes) ? m.notes : [],
      updatedAt: m.updatedAt || null,
      publicOptIn: !!m.publicOptIn,
    };
  } catch {
    return { facts: {}, notes: [], updatedAt: null, publicOptIn: false };
  }
}

export function saveMemory(mem) {
  const next = {
    facts: mem.facts || {},
    notes: (mem.notes || []).slice(-40),
    updatedAt: new Date().toISOString(),
    publicOptIn: !!mem.publicOptIn,
  };
  localStorage.setItem(MEM_KEY, JSON.stringify(next));
  return next;
}

export function setFact(id, value) {
  const mem = loadMemory();
  const v = String(value || '').trim();
  if (!v) {
    delete mem.facts[id];
  } else {
    mem.facts[id] = v;
  }
  return saveMemory(mem);
}

export function addNote(text) {
  const mem = loadMemory();
  const t = String(text || '').trim();
  if (!t) return mem;
  mem.notes.push({ t, at: new Date().toISOString() });
  return saveMemory(mem);
}

export function clearMemory() {
  localStorage.removeItem(MEM_KEY);
  localStorage.removeItem(ASK_QUEUE_KEY);
  return loadMemory();
}

export function setPublicOptIn(on) {
  const mem = loadMemory();
  mem.publicOptIn = !!on;
  return saveMemory(mem);
}

/** Next learning question the Viewer has not answered yet */
export function nextLearningQuestion() {
  const mem = loadMemory();
  for (const q of LEARNING_QUESTIONS) {
    if (!mem.facts[q.id]) return q;
  }
  return null;
}

export function answerLearningQuestion(id, value) {
  return setFact(id, value);
}

/** Compact memory block for Orb context (stays on device) */
export function memoryContextBlock() {
  const mem = loadMemory();
  const lines = [];
  const labels = {
    call_name: 'Name',
    purpose: 'Purpose',
    boundaries: 'Boundaries',
    focus: 'Focus',
    allies: 'Trusted',
    threat: 'Careful about',
    strength: 'Strength',
    location_feel: 'Location policy',
  };
  for (const [k, label] of Object.entries(labels)) {
    if (mem.facts[k]) lines.push(`${label}: ${mem.facts[k]}`);
  }
  if (mem.notes.length) {
    const recent = mem.notes.slice(-3).map((n) => n.t);
    lines.push('Recent notes: ' + recent.join(' | '));
  }
  if (!lines.length) return 'No Viewer memory stored yet on this device.';
  return lines.join('\n');
}

/** Detect "remember this" style input from free-form chat */
export function tryIngestFromQuestion(text) {
  const t = String(text || '').trim();
  const lower = t.toLowerCase();

  // remember: ...
  let m = t.match(/^remember(?:\s+that)?[:\s]+(.+)$/i);
  if (m) {
    addNote(m[1].trim());
    return { ingested: true, kind: 'note', value: m[1].trim() };
  }

  // call me X / my name is X
  m = t.match(/^(?:call me|my name is)\s+(.+)$/i);
  if (m) {
    setFact('call_name', m[1].trim());
    return { ingested: true, kind: 'call_name', value: m[1].trim() };
  }

  // I am building ...
  m = t.match(/^i(?:'m| am) building\s+(.+)$/i);
  if (m) {
    setFact('purpose', m[1].trim());
    return { ingested: true, kind: 'purpose', value: m[1].trim() };
  }

  if (lower === 'forget me' || lower === 'clear memory') {
    clearMemory();
    return { ingested: true, kind: 'clear', value: null };
  }

  return { ingested: false };
}

export function learningQuestionsList() {
  return LEARNING_QUESTIONS.slice();
}

export function memorySummaryForUi() {
  const mem = loadMemory();
  const answered = Object.keys(mem.facts).length;
  const total = LEARNING_QUESTIONS.length;
  return {
    answered,
    total,
    publicOptIn: mem.publicOptIn,
    updatedAt: mem.updatedAt,
    facts: { ...mem.facts },
    notesCount: mem.notes.length,
  };
}
