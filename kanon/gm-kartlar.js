/* Kart ailesi: Gastro ortak-kart.js (DGCard) işaretlemesi ve perde eğrisi. Tarif verisi yerine program/içerik: süre gün, kcal. */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, root = document.documentElement;
  const meta = r => `<span class="gm-meta" role="img" aria-label="${esc(`${r.sureGun} gün${r.ogun ? `, günde ${r.ogun} öğün` : ''}`)}"><span class="gm-meta__time">${ik('takvim')}${esc(r.sureGun)} gün</span>${r.ogun ? `<span class="gm-meta__views">${ik('ogun')}${esc(r.ogun)}</span>` : ''}</span>`;
  const photo = src => `<span class="gm-photo" style="background-image:url('${esc(src)}')"></span>`;
  const text = r => `<a class="gm-card__text" href="${esc(r.git)}"><span class="gm-card__category">${esc(r.kategori)}</span><h3 class="gm-card__title">${esc(r.baslik)}</h3></a>`;
  const visual = (r, cls) => `<a class="${cls}" href="${esc(r.git)}" aria-label="${esc(r.baslik)}" tabindex="-1">${photo(r.gorsel)}</a>`;
  const author = r => (r.alt ? `<div class="gm-author"><span class="gm-author__name">${esc(r.alt)}</span></div>` : '');
  const save = r => `<button class="gm-save" type="button" aria-label="Kaydet" aria-pressed="${!!r.kayitli}" data-eylem="kaydet" data-id="${esc(r.id)}">${ik('kaydet')}</button>`;
  const card = (r, v = '') => `<article class="gm-card${v ? ` gm-card--${v}` : ''}"><div class="gm-card__media">${visual(r, 'gm-card__visual')}${meta(r)}${save(r)}</div><div class="gm-card__body">${text(r)}${author(r)}</div></article>`;
  const feature = r => `<article class="gm-feature"><div class="gm-feature__media">${visual(r, 'gm-feature__visual')}<span class="gm-feature__veil" aria-hidden="true"></span>${meta(r)}${save(r)}<div class="gm-feature__info">${text(r)}${author(r)}</div></div></article>`;
  const tile = r => `<article class="gm-tile"><div class="gm-tile__media">${visual(r, 'gm-tile__visual')}<span class="gm-tile__veil" aria-hidden="true"></span>${meta(r)}${save(r)}<div class="gm-tile__info">${text(r)}${author(r)}</div></div></article>`;
  const kart = (r, tur) => (tur === 'row' ? card(r, 'row') : tur === 'tile' ? tile(r) : tur === 'feature' ? feature(r) : card(r));

  // Ortak geçiş eğrisi: smootherstep, Gastro veils ile aynı.
  const sstep = t => { t = Math.max(0, Math.min(1, t)); return t * t * t * (t * (6 * t - 15) + 10); };
  const tok = () => { const cs = getComputedStyle(root), n = k => parseFloat(cs.getPropertyValue(k)); return {T: n('--gm-veil-top-a') || .35, E: n('--gm-veil-end-a') || .6, lead: n('--gm-veil-lead') || 40, tail: n('--gm-veil-tail') || 32}; };
  // Ana hero perdesi: Gastro 1.0.1 overlay.heroTop ve overlay.heroBottom. Üst kol metnin altına dek sabit, sonra söner; alt kol ilk metinde dolar, alt kenarda en koyu.
  const heroAlfa = (y, h, len, top) => { const {heroTop: U, heroBottom: A} = GM.TK.overlay; const ust = U.alpha * (1 - sstep((y - len) / U.fadeLength)); const alt = y <= top ? A.alphaAtFirstText * sstep((y - (top - A.leadAboveFirstText)) / A.leadAboveFirstText) : A.alphaAtFirstText + (A.alphaEnd - A.alphaAtFirstText) * ((y - top) / Math.max(1, h - top)); return Math.max(ust, alt); };
  const edgeTop = (y, len, t) => t.T * (1 - sstep(y / Math.max(1, len)));
  const edgeBottom = (y, top, t) => t.E * sstep((y - (top - t.lead)) / (t.lead + t.tail));
  const gradient = (h, alpha, marks = []) => { const ys = [...new Set([...Array.from({length: Math.ceil(h / 4) + 1}, (_, i) => Math.min(h, i * 4)), ...marks].map(y => Math.max(0, Math.min(h, Math.round(y)))))].sort((a, c) => a - c); return `linear-gradient(180deg,${ys.map(y => `color-mix(in srgb,var(--gm-overlay) ${(alpha(y) * 100).toFixed(2)}%,transparent) ${y}px`).join(',')})`; };
  const VEIL = [['.gm-tile__media', '.gm-tile__info'], ['.gm-feature__media', '.gm-feature__info'], ['.gm-veil-bottom', '[data-gm-veil-from]']];
  const textTop = el => { const r = document.createRange(); r.selectNodeContents(el); const t = [...r.getClientRects()].filter(x => x.width && x.height).map(x => x.top); return t.length ? Math.min(...t) : el.getBoundingClientRect().top; };
  const veils = (scope = document) => { const t = tok(); for (const [m, s] of VEIL) for (const box of scope.querySelectorAll(m)) { if (box.dataset.perde) continue; const tx = box.querySelector(s), b = box.getBoundingClientRect(); if (!tx || !b.height) continue; const top = textTop(tx) - b.top; box.style.setProperty('--gm-veil', gradient(b.height, y => edgeBottom(y, top, t), [top - t.lead, top + t.tail])); box.dataset.perde = 1; } };
  addEventListener('resize', () => { document.querySelectorAll('[data-perde]').forEach(b => delete b.dataset.perde); veils(); });
  document.fonts?.ready.then(() => veils());
  document.addEventListener('click', e => { const b = e.target.closest('.gm-save'); if (!b) return; e.preventDefault(); const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); GM.toast(on ? 'Kaydedildi' : 'Kayıt kaldırıldı'); });
  window.GMCard = {kart, card, feature, tile, meta, veils, textTop, gradient, edgeTop, edgeBottom, heroAlfa, tokens: tok};
})();
