/**
 * Injects Shop tab + Aurora TRV shop + USD lock panel.
 */
import {
  becomeValidated,
  renderShopUI,
  restoreSkin,
} from './shop.js';
import { renderLockUI } from './lock.js';

function toastFn(m) {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = m;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2600);
  }
}

function ensureShopUI() {
  const tabs = document.querySelector('.tabs');
  if (tabs && !tabs.querySelector('[data-screen="shop"]')) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.screen = 'shop';
    b.textContent = 'Shop';
    tabs.appendChild(b);
  }

  if (!document.getElementById('shop')) {
    const main = document.querySelector('main');
    if (!main) return;
    const sec = document.createElement('section');
    sec.id = 'shop';
    sec.className = 'screen';
    sec.innerHTML = `
      <div class="card">
        <h2>TRV Shop</h2>
        <p class="soft">Aurora looks and locks live here — parallel to The Sentinel core.</p>
        <p>Your TRV credits: <strong id="trv-balance">0</strong></p>
        <p class="soft" id="validated-status">Not yet a Validated Viewer</p>
        <div class="actions">
          <button type="button" class="btn primary" id="become-validated">Become a Validated Viewer</button>
        </div>
      </div>
      <div class="card" id="lock-panel"></div>
      <div class="card">
        <h2>Aurora Borealis</h2>
        <p class="soft">Redeem credits to wear a northern-lights look. These options only.</p>
        <div id="shop-grid"></div>
      </div>`;
    main.appendChild(sec);

    const st = document.createElement('style');
    st.textContent = `
      .shop-item{display:flex;flex-wrap:wrap;gap:.65rem;align-items:center;padding:.75rem;margin:.5rem 0;border:1px solid var(--line);border-radius:14px;background:var(--surface2)}
      .shop-swatch{width:48px;height:48px;border-radius:12px;flex-shrink:0}
      .shop-meta{flex:1;min-width:120px}
      .shop-meta strong{display:block;font-size:.92rem}
      .shop-meta .soft{font-size:.8rem}
    `;
    document.head.appendChild(st);
  } else if (!document.getElementById('lock-panel')) {
    const shop = document.getElementById('shop');
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'lock-panel';
    const aurora = shop.querySelector('#shop-grid')?.closest('.card');
    if (aurora) shop.insertBefore(card, aurora);
    else shop.appendChild(card);
  }

  document.querySelectorAll('.tabs button').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('.tabs button').forEach((b) => b.classList.remove('on'));
      document.querySelectorAll('.screen').forEach((s) => s.classList.remove('on'));
      btn.classList.add('on');
      const screen = document.getElementById(btn.dataset.screen);
      if (screen) screen.classList.add('on');
      if (btn.dataset.screen === 'shop') {
        renderShopUI(toastFn);
        renderLockUI(toastFn);
      }
    };
  });

  const become = document.getElementById('become-validated');
  if (become) {
    become.onclick = () => {
      const r = becomeValidated();
      if (!r.ok && r.reason === 'already') toastFn('You are already a Validated Viewer');
      else if (r.ok) toastFn(`Validated · +${r.granted} TRV credits`);
      renderShopUI(toastFn);
      renderLockUI(toastFn);
    };
  }

  restoreSkin();
  renderShopUI(() => {});
  renderLockUI(() => {});
}

ensureShopUI();
