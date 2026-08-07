/**
 * Service learning — each install enables help for this Viewer
 * under Service guidelines. Parallel to The Sentinel core.
 */

const LEARN_KEY = 'rv-service-learning';
const INSTALL_KEY = 'rv-installed-at';

export function isLearningEnabled() {
  const v = localStorage.getItem(LEARN_KEY);
  if (v === null) return true; // install default: enabled
  return v === '1';
}

export function setLearningEnabled(on) {
  localStorage.setItem(LEARN_KEY, on ? '1' : '0');
}

export function markInstall() {
  if (!localStorage.getItem(INSTALL_KEY)) {
    localStorage.setItem(INSTALL_KEY, new Date().toISOString());
  }
  // First install path: learning on
  if (localStorage.getItem(LEARN_KEY) === null) {
    setLearningEnabled(true);
  }
}

export function recordPreference(key, value) {
  if (!isLearningEnabled()) return;
  try {
    const raw = localStorage.getItem('rv-service-prefs') || '{}';
    const prefs = JSON.parse(raw);
    prefs[key] = value;
    prefs.updated = new Date().toISOString();
    localStorage.setItem('rv-service-prefs', JSON.stringify(prefs));
  } catch (_) {}
}

export function initServiceLearningUI() {
  markInstall();

  // Welcome notice line
  const card = document.querySelector('.welcome-card');
  if (card && !document.getElementById('service-learn-note')) {
    const p = document.createElement('p');
    p.id = 'service-learn-note';
    p.style.cssText = 'font-size:0.85rem;color:var(--soft);margin-top:0.75rem';
    p.textContent =
      'Installing enables the Service to learn and grow so it can help you — under the guidelines of the Service. You can change this anytime under You.';
    const actions = card.querySelector('.actions');
    if (actions) card.insertBefore(p, actions);
    else card.appendChild(p);
  }

  // You screen control
  const you = document.getElementById('you');
  if (you && !document.getElementById('service-learn-card')) {
    const div = document.createElement('div');
    div.className = 'card';
    div.id = 'service-learn-card';
    div.innerHTML = `
      <h2>Service help</h2>
      <p class="soft">Each install lets the Service learn and expand to help <strong style="color:var(--text)">you</strong> — according to the guidelines of the Service. This is parallel to The Sentinel on your device; it is not the core.</p>
      <label style="display:flex;align-items:center;gap:0.6rem;margin-top:0.75rem;cursor:pointer">
        <input type="checkbox" id="service-learn-toggle" style="width:auto;margin:0">
        <span>Allow the Service to learn for my benefit</span>
      </label>
      <p class="soft" id="service-learn-status" style="margin-top:0.5rem"></p>
    `;
    you.insertBefore(div, you.firstChild);

    const toggle = document.getElementById('service-learn-toggle');
    const status = document.getElementById('service-learn-status');
    const sync = () => {
      const on = isLearningEnabled();
      toggle.checked = on;
      status.textContent = on
        ? 'On — the Service may adapt help to you under its guidelines.'
        : 'Off — help stays generic; no personal learning.';
    };
    toggle.addEventListener('change', () => {
      setLearningEnabled(toggle.checked);
      sync();
      const t = document.getElementById('toast');
      if (t) {
        t.textContent = toggle.checked ? 'Service learning on' : 'Service learning off';
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2200);
      }
    });
    sync();
  }

  // Soft preference: display name changes
  const name = document.getElementById('prof-name');
  if (name) {
    name.addEventListener('change', () => {
      if (name.value.trim()) recordPreference('displayName', name.value.trim());
    });
  }
}

initServiceLearningUI();
