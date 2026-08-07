/**
 * Injects Shop tab + Aurora TRV shop if not already in HTML.
 */
import {
  becomeValidated,
  isValidated,
  renderShopUI,
  restoreSkin,
  getCredits,
} from './shop.js';

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
        <p class="soft">Credits only work here. Aurora Borealis looks for your colors and profile — nothing else.</p>
        <p>Your TRV: <strong id="trv-balance">0</strong></p>
        <p class="soft" id="validated-status">Not yet a Validated Viewer</p>
        <div class="actions">
          <button type="button" class="btn primary" id="become-validated">Become a Validated Viewer</button>
        </div>
        <p class="soft" style="margin-top:0.65rem">Opt in as a node. You receive TRV credits for this shop only — not for outside trading.</p>
      </div>
      <div class="card">
        <h2>Aurora Borealis</h2>
        <p class="soft">Redeem credits to wear a northern-lights look. These options only.</p>
        <div id="shop-grid"></div>
      </div>`;
    main.appendChild(sec);

    // minimal styles
    const st = document.createElement('style');
    st.textContent = `
      .shop-item{display:flex;flex-wrap:wrap;gap:.65rem;align-items:center;padding:.75rem;margin:.5rem 0;border:1px solid var(--line);border-radius:14px;background:var(--surface2)}
      .shop-swatch{width:48px;height:48px;border-radius:12px;flex-shrink:0}
      .shop-meta{flex:1;min-width:120px}
      .shop-meta strong{display:block;font-size:.92rem}
      .shop-meta .soft{font-size:.8rem}
    `;
    document.head.appendChild(st);
  }

  // rebind tab clicks for dynamic button
  document.querySelectorAll('.tabs button').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('.tabs button').forEach((b) => b.classList.remove('on'));
      document.querySelectorAll('.screen').forEach((s) => s.classList.remove('on'));
      btn.classList.add('on');
      const screen = document.getElementById(btn.dataset.screen);
      if (screen) screen.classList.add('on');
      if (btn.dataset.screen === 'shop') {
        renderShopUI((m) => {
          const t = document.getElementById('toast');
          if (t) {
            t.textContent = m;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 2600);
          }
        });
      }
    };
  });

  const become = document.getElementById('become-validated');
  if (become) {
    become.onclick = () => {
      const r = becomeValidated();
      const toast = (m) => {
        const t = document.getElementById('toast');
        if (t) {
          t.textContent = m;
          t.classList.add('show');
          setTimeout(() => t.classList.remove('show'), 2800);
        }
      };
      if (!r.ok && r.reason === 'already') {
        toast('You are already a Validated Viewer');
      } else if (r.ok) {
        toast(`Validated · +${r.granted} TRV credits`);
      }
      renderShopUI(toast);
    };
  }

  restoreSkin();
  renderShopUI(() => {});
}

ensureShopUI();
