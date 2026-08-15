/**
 * TRV PWA boot — SCAFFOLD
 */

const STORAGE_TUTORIAL = "trv_tutorial_v1_done";

function browserPotential() {
  const secure = window.isSecureContext;
  const media = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  let signal = "weak";
  let line = "Browser baseline (T0). Install Android shell for full probes.";
  if (secure && media) {
    signal = "standard";
    line = "Secure context + media APIs — capable browser path.";
  }
  if (!secure) line = "Insecure context — some device APIs blocked by the browser.";
  return { signal, line };
}

function showSignal() {
  const { signal, line } = browserPotential();
  const el = document.getElementById("signal-line");
  el.textContent = line;
  el.className = `signal-${signal}`;
}

function showTutorialIfNeeded() {
  if (localStorage.getItem(STORAGE_TUTORIAL) === "1") return;
  const section = document.getElementById("tutorial");
  const body = document.getElementById("tutorial-body");
  body.innerHTML = `
    <p><strong>What this is.</strong> The Remote Viewer is a sovereign network for humans — not a feed farm.</p>
    <p><strong>Access.</strong> Free (weaker signal), <strong>$96/year</strong>, or a permanent node for unlimited human comms.</p>
    <p><strong>Creators.</strong> You keep 95% on digital, 90% on TRV-minted NFTs. Platform fee is 0%.</p>
    <p><strong>Phones & wear.</strong> Any capable phone; wearables optional; Graphene stronger, not required.</p>
    <p><strong>Learning.</strong> Your Sentinel adapts on-device (tone, language). Private content is not silently uploaded for training. Destroy wipes local memory.</p>
    <p><strong>Safety.</strong> Non-distinguishable deepfake likeness is prohibited. Reports stay discrete.</p>
  `;
  section.classList.remove("hidden");
  document.getElementById("tutorial-done").onclick = () => {
    localStorage.setItem(STORAGE_TUTORIAL, "1");
    section.classList.add("hidden");
  };
}

showSignal();
showTutorialIfNeeded();

document.getElementById("entitlement-line").textContent =
  "Entitlement reads from chain when program is deployed (Phase 1).";
