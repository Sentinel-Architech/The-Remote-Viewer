/**
 * TRV PWA boot — SCAFFOLD
 * Not PROVEN as a network client (docs/REALITY.md).
 */

const STORAGE_TUTORIAL = "trv_tutorial_v1_done";
const STORAGE_LEARNING = "trv_learning_v1";

const DEFAULT_LEARNING = {
  version: 1,
  language: "en",
  wakeEnabled: true,
  liveSearchEnabled: true,
  conductOptIn: false,
  formality: "balanced",
  warmth: "medium",
};

function loadLearning() {
  try {
    const raw = localStorage.getItem(STORAGE_LEARNING);
    if (!raw) return { ...DEFAULT_LEARNING };
    return { ...DEFAULT_LEARNING, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_LEARNING };
  }
}

function saveLearning(p) {
  localStorage.setItem(STORAGE_LEARNING, JSON.stringify({ ...p, version: 1 }));
}

function clearAllLocal() {
  localStorage.removeItem(STORAGE_LEARNING);
  localStorage.removeItem(STORAGE_TUTORIAL);
}

function browserPotential() {
  const secure = window.isSecureContext;
  const media = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  let signal = "weak";
  let line = "Browser baseline (T0). Android shell unlocks full probes.";
  if (secure && media) {
    signal = "standard";
    line = "Secure context + media APIs — capable browser path.";
  }
  if (!secure) line = "Insecure context — device APIs limited by the browser.";
  return { signal, line };
}

function showSignal() {
  const { signal, line } = browserPotential();
  const el = document.getElementById("signal-line");
  if (!el) return;
  el.textContent = line;
  el.className = `signal-${signal}`;
}

function showLearning() {
  const el = document.getElementById("learning-line");
  if (!el) return;
  const p = loadLearning();
  el.textContent = `On-device · lang ${p.language} · wake ${p.wakeEnabled ? "on" : "off"} · search ${p.liveSearchEnabled ? "on" : "off"} · conduct opt-in ${p.conductOptIn ? "yes" : "no"}`;
}

function showTutorialIfNeeded() {
  if (localStorage.getItem(STORAGE_TUTORIAL) === "1") return;
  const section = document.getElementById("tutorial");
  const body = document.getElementById("tutorial-body");
  if (!section || !body) return;
  body.innerHTML = `
    <p><strong>What.</strong> Sovereign network for humans — not a feed farm.</p>
    <p><strong>Access.</strong> Free (weaker signal), <strong>$96/year</strong>, or permanent node.</p>
    <p><strong>Creators.</strong> 95% digital · 90% NFT primary · platform 0%.</p>
    <p><strong>Learning.</strong> Adapts on-device. No silent upload of private content. Destroy wipes local memory.</p>
    <p><strong>Safety.</strong> Non-distinguishable deepfake likeness prohibited.</p>
  `;
  section.classList.remove("hidden");
  const btn = document.getElementById("tutorial-done");
  if (btn) {
    btn.onclick = () => {
      localStorage.setItem(STORAGE_TUTORIAL, "1");
      section.classList.add("hidden");
    };
  }
}

async function probeMedia() {
  const out = document.getElementById("probe-line");
  if (!out) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    out.textContent = "Media APIs none — camera/mic not available in this browser.";
    return;
  }
  out.textContent = "Requesting mic (deny to test C3-style degrade)…";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    out.textContent = "Mic probe: ready (permission granted). Voice path can enable.";
  } catch (e) {
    out.textContent =
      "Mic probe: denied or failed — voice features stay off (honest degrade).";
  }
}

showSignal();
showLearning();
showTutorialIfNeeded();

const ent = document.getElementById("entitlement-line");
if (ent) {
  ent.textContent =
    "Entitlement from chain when trv_governance is deployed (Phase 1). Until then: policy paths only.";
}

const resetBtn = document.getElementById("reset-local");
if (resetBtn) {
  resetBtn.onclick = () => {
    clearAllLocal();
    location.reload();
  };
}

const probeBtn = document.getElementById("probe-media");
if (probeBtn) probeBtn.onclick = () => probeMedia();

window.TRV = {
  loadLearning,
  saveLearning,
  clearLearning: () => {
    localStorage.removeItem(STORAGE_LEARNING);
    showLearning();
  },
  clearAllLocal,
  probeMedia,
};
