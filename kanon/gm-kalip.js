/* Ekran kalıbı çizicileri: Gastro ana-v3, liste-v2, detay-v2 işaretlemesi ve davranışı. Katalog: kanon/README.md §3. */
(() => {
  const GM = window.GM, {esc, ik, at, vurgu, sayi} = GM, TK = GM.TK, M = TK.motion;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const bg = src => (src ? ` style="background-image:url('${esc(src)}')"` : '');
  const noktalar = n => `<span class="gm-pager-dots">${Array.from({length: n}, (_, i) => `<i${i ? '' : ' class="is-on"'}></i>`).join('')}</span>`;

  // ---------- ana-v3 ----------
  // {slaytlar:[{gorsel, etiket, baslik, alt, git}], ustEtiket, baslik | baslikHtml (Gourmet eki: vurgulu kelime <em>), altBaslik, arama:{metin, git}, icerik, perde:'tam'}. Üst bar saydam, gülücük alt kenar.
  GM.heroAna = (o = {}) => {
    const S = o.slaytlar || [], cok = S.length > 1;
    const slayt = (r, i, klon) => `<div class="gm-hero-slide"${klon ? ' data-klon aria-hidden="true" inert' : ` role="group" aria-roledescription="slide" aria-label="${i + 1} / ${S.length}"`}><div class="gm-hero-foto"${bg(r.gorsel)}></div><div class="gm-hero-perde"></div>${r.git ? `<button type="button" class="gm-hero-hit" tabindex="-1" aria-hidden="true" data-git="${esc(r.git)}"></button>` : ''}<div class="gm-hero-info"><div class="gm-hero-copy">${r.etiket ? `<small>${esc(r.etiket)}</small>` : ''}${r.baslik ? `<strong>${esc(r.baslik)}</strong>` : ''}${r.alt ? `<span class="gm-hero-alt">${r.avatar ? `<span class="gm-card-avatar" aria-hidden="true">${esc(String(r.avatar).slice(0, 1).toLocaleUpperCase('tr'))}</span>` : ''}<span class="gm-kirp-1">${esc(r.alt)}</span></span>` : ''}</div></div></div>`;
    return `<section class="${liste('gm-hero gm-gulucuk', o.perde === 'tam' && 'is-perdeli', o.sinif)}" data-c="kalip" data-kalip="hero"><div class="gm-hero-track" role="region" aria-roledescription="carousel" aria-label="${esc(o.etiket || 'Öneriler, yatay kaydır')}" tabindex="0">${S.map((r, i) => slayt(r, i)).join('')}${cok ? slayt(S[0], 0, true) : ''}</div>${o.baslik || o.baslikHtml || o.arama ? `<div class="gm-hero-top">${o.ustEtiket ? `<small class="gm-hero-etiket">${esc(o.ustEtiket)}</small>` : ''}${o.baslikHtml ? `<h1>${o.baslikHtml}</h1>` : o.baslik ? `<h1>${esc(o.baslik)}</h1>` : ''}${o.altBaslik ? `<p>${esc(o.altBaslik)}</p>` : ''}${o.arama ? `<button type="button" class="gm-hero-ara"${at({git: o.arama.git || '#/ara'})}>${ik('ara_')}<span>${esc(o.arama.metin || 'Ara')}</span></button>` : ''}</div>` : ''}${o.icerik ? `<div class="gm-hero-orta">${o.icerik}</div>` : ''}${cok ? `<div class="gm-hero-pager" aria-hidden="true">${noktalar(S.length)}</div>` : ''}</section>`;
  };
  // Alterne gri/beyaz bölümler: [{baslik, eylem, git, html}|html]
  GM.bolumler = l => `<div class="gm-icerikler">${l.filter(Boolean).map(x => (typeof x === 'string' ? `<section>${x}</section>` : `<section${at({id: x.id})}>${x.baslik ? GM.bas(x.baslik, x.eylem ? (typeof x.eylem === 'string' ? {metin: x.eylem, git: x.git} : x.eylem) : null) : ''}${x.html || ''}</section>`)).join('')}</div>`;
  GM.yuzey = html => `<div class="gm-yuzey">${html}</div>`;
  GM.seritKartlar = l => `<div class="gm-strip">${l.map(x => `<button type="button" class="gm-strip-oge"${at(x)}><span class="gm-strip-medya"><span class="gm-photo"${bg(x.gorsel)}></span></span><span class="gm-strip-metin"><b>${esc(x.ad)}</b>${x.alt ? `<small>${esc(x.alt)}</small>` : ''}</span></button>`).join('')}</div>`;
  // Öne çıkan slider: DGCard.slider; gösterge noktaları kartın içinde.
  GM.oneCikan = (l, o = {}) => (l.length === 1 ? l[0] : `<section class="gm-kslider" data-count="${l.length}" data-c="kalip" data-kalip="slider" aria-roledescription="carousel" aria-label="${esc(o.etiket || 'Öne çıkanlar')}"><div class="gm-kslider__track" tabindex="0">${l.map((h, i) => `<div class="gm-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${l.length}">${h}</div>`).join('')}</div><div class="gm-kslider__pager" aria-hidden="true">${noktalar(l.length)}</div></section>`);
  GM.kesikKart = (o = {}) => `<button type="button" class="gm-uzman-ol"${at(o)}>${ik(o.ikon || 'circle-plus')}<b>${esc(o.baslik)}</b>${o.alt ? `<span>${esc(o.alt)}</span>` : ''}</button>`;

  // ---------- liste-v2 ----------
  // Panel başı: arama + filtre, segment, görselli çip şeridi. Yapışır, köşesi düzleşir.
  GM.listeArac = (o = {}) => `<div class="gm-liste-arac">${GM.arama({yer: o.yer || 'Ara', ad: o.ad, deger: o.deger, sonuc: false, sonEk: `<button class="gm-liste-search-filter${o.filtreSayi ? ' is-active' : ''}" type="button" aria-haspopup="dialog" aria-label="${o.filtreSayi ? `Filtrele, ${esc(o.filtreSayi)} filtre etkin` : 'Filtrele'}" data-eylem="filtre">${ik('filtre')}<span class="gm-badge gm-liste-search-filter__badge">${o.filtreSayi ? esc(o.filtreSayi) : ''}</span></button>`})}${o.segment ? `<div class="gm-liste-scope">${o.segment}</div>` : ''}${o.serit ? `<div class="gm-liste-rail">${o.serit}</div>` : ''}</div>`;
  // Filtre sayacı: Gastro liste-v2.js (#filterBadge): rozet metni, is-active ve erişilebilir ad birlikte; 0'da rozet boş kalır (.gm-badge:empty gizler). kok: ekran ya da araç bloğunu içeren öğe.
  GM.filtreSayiYaz = (kok, n) => { const k = +n || 0; (kok?.querySelectorAll?.('.gm-liste-search-filter') || []).forEach(b => { b.classList.toggle('is-active', k > 0); b.setAttribute('aria-label', k ? `Filtrele, ${k} filtre etkin` : 'Filtrele'); const r = b.querySelector('.gm-liste-search-filter__badge') || b.appendChild(Object.assign(document.createElement('span'), {className: 'gm-badge gm-liste-search-filter__badge'})); r.textContent = k ? String(k) : ''; }); };
  const lcip = x => { const mark = x.gorsel ? `<span class="gm-mark"><span class="gm-mark__foto"${bg(x.gorsel)}></span></span>` : x.ikon ? `<span class="gm-mark">${ik(x.ikon)}</span>` : ''; return `<button type="button" class="${liste('gm-kok-chip', x.kapat && 'gm-kok-chip--removable')}"${x.deger != null ? ` data-cip="${esc(x.deger)}" aria-pressed="${!!x.secili}"` : ''}${at(x)}>${mark}<span>${esc(x.metin ?? x.ad)}</span>${x.sayi != null ? `<span class="gm-kok-chip__count">${esc(x.sayi)}</span>` : ''}${x.kapat ? ik('kapat') : ''}</button>`; };
  // Görselli çip şeridi: {ad, tur, ogeler:[{metin, deger, gorsel, ikon, sayi}], secili}
  GM.cipSerit = (o = {}) => { const s = [].concat(o.secili ?? []); return `<div class="gm-kok-chip-rail" data-cip-grup="${o.tur || 'tek'}" data-ad="${esc(o.ad || '')}" role="group"${o.etiket ? ` aria-label="${esc(o.etiket)}"` : ''}>${o.ogeler.map(x => lcip({...x, secili: s.includes(x.deger)})).join('')}</div>`; };
  // Sonuç satırı: {sayi, birim, sirala, gorunum:'izgara'|'liste'}
  // o.on: sayı yerine aynı satırda kontrol, sayıyı kendisi taşır (ör. sayılı konum seçici "Türkiye 203"; yığılma kuralı 2: tek başına satır yok).
  GM.listeDurum = (o = {}) => `<div class="gm-liste-status${o.on ? ' has-on' : ''}">${o.on ? `<div class="gm-liste-status__on">${o.on}</div>` : `<p class="gm-liste-sayi"><b>${esc(sayi(o.sayi))} ${esc(o.birim || 'sonuç')}</b> bulundu</p>`}<div class="gm-liste-status__controls">${o.sirala === false ? '' : `<div class="gm-liste-sort-group"><button type="button" class="gm-liste-sort-button${o.siraliAktif ? ' is-active' : ''}" aria-label="Sırala" data-eylem="sirala">${ik('sirala')}</button></div>`}<div class="gm-gorunum" role="group" aria-label="Görünüm" data-cip-grup="tek" data-ad="${esc(o.ad || 'gorunum')}"><button type="button" data-cip="izgara" aria-pressed="${(o.gorunum || 'izgara') === 'izgara'}" aria-label="Izgara">${ik('table-cells-large')}</button><button type="button" data-cip="liste" aria-pressed="${o.gorunum === 'liste'}" aria-label="Liste">${ik('list')}</button></div></div></div>`;
  GM.listeSonuc = (kartlar, o = {}) => `<div class="gm-liste-results"><div class="${o.gorunum === 'liste' ? 'gm-liste-rows' : 'gm-liste-grid'}">${kartlar.join('')}</div></div>`;
  GM.listeBos = (o = {}) => `<div class="gm-liste-empty"><span class="gm-liste-empty__mark">${ik(o.ikon || 'ara_')}</span><h2 class="gm-t-section">${esc(o.baslik)}</h2>${o.metin ? `<p>${vurgu(o.metin)}</p>` : ''}${o.eylem ? GM.btn(o.eylem) : ''}</div>`;
  GM.listeTema = (o = {}) => `<div class="gm-liste-themes"><div class="gm-liste-themes__inner"><div class="gm-head"><h2 class="gm-liste-themes__title">${esc(o.baslik)}</h2></div><div class="gm-liste-theme-rail">${GM.cipSerit(o)}</div></div></div>`;
  GM.sayfalama = (o = {}) => (o.toplam > 1 ? `<nav class="gm-sayfalama" aria-label="Sayfalar">${Array.from({length: o.toplam}, (_, i) => `<button class="gm-page" type="button" data-eylem="sayfa" data-id="${i + 1}" aria-label="Sayfa ${i + 1}"${o.sayfa === i + 1 ? ' aria-current="page"' : ''}>${i + 1}</button>`).join('')}</nav>` : '');
  // Sıralama sheet'i: {secenekler:[[deger, ad, ikon]], secili, sec}
  GM.siralaSheet = (o = {}) => GM.sheet({baslik: o.baslik || 'Sıralama', html: `<div class="gm-choice-list" role="radiogroup" aria-label="${esc(o.etiket || o.baslik || 'Sıralama')}">${o.secenekler.map(([v, a, i]) => `<button type="button" class="gm-choice" role="radio" aria-checked="${v === o.secili}" data-sirala="${esc(v)}">${i ? `<span class="gm-choice__icon">${ik(i)}</span>` : ''}<span class="gm-choice__label">${esc(a)}</span>${ik('onay')}</button>`).join('')}</div>`, sonra: (k, h) => { k.addEventListener('click', ev => { const b = ev.target.closest('[data-sirala]'); if (b) { o.sec?.(b.dataset.sirala); h.kapat(); } }); }});
  // Filtre sheet'i: Gastro dg-sheet: seçilenler çip şeridi, tek açık akordeon, seçenek satırı, N seçenek daha, sabit iki düğme.
  GM.filtreSheet = (o = {}) => {
    const d = {}; const GORUNUR = 5;
    o.gruplar.forEach(g => { d[g.ad] = [].concat((o.secili || {})[g.ad] ?? g.secili ?? []); });
    const secenek = (g, x, i) => `<label class="gm-option"${i >= GORUNUR ? ' data-extra hidden' : ''}><span class="gm-secim"><input type="${g.tur === 'tek' ? 'radio' : 'checkbox'}" name="${esc(g.ad)}" value="${esc(x.deger)}"${d[g.ad].map(String).includes(String(x.deger)) ? ' checked' : ''}></span>${x.gorsel ? `<span class="gm-mark"><span class="gm-mark__foto"${bg(x.gorsel)}></span></span>` : x.ikon ? `<span class="gm-mark">${ik(x.ikon)}</span>` : ''}<span class="gm-option__label">${esc(x.metin ?? x.ad)}</span>${x.sayi != null ? `<span class="gm-option__count">${esc(x.sayi)}</span>` : ''}</label>`;
    const html = `<div class="gm-sheet__chips gm-kok-chip-rail" data-filtre-cipler></div><div class="gm-sheet__scroll">${o.gruplar.map((g, i) => `<section class="gm-facet${i === 0 ? ' is-open' : ''}"><h3 class="gm-facet__heading"><button type="button" class="gm-facet__head" aria-expanded="${i === 0}">${g.ikon ? `<span class="gm-facet__icon">${ik(g.ikon)}</span>` : ''}<span class="gm-facet__label">${esc(g.baslik)}</span>${ik('ac')}</button></h3><div class="gm-facet__body"><div class="gm-facet__inner">${g.ogeler.map((x, k) => secenek(g, x, k)).join('')}${g.ogeler.length > GORUNUR ? `<button type="button" class="gm-more" data-more="${g.ogeler.length - GORUNUR} seçenek daha" aria-expanded="false">${g.ogeler.length - GORUNUR} seçenek daha ${ik('ac')}</button>` : ''}</div></div></section>`).join('')}</div>`;
    return GM.sheet({baslik: o.baslik || 'Filtrele', tam: true, html, altBar: `<div class="gm-ikili">${GM.btn({metin: 'Temizle', tur: 'secondary', veri: {'filtre-temizle': 1}})}${GM.btn({metin: o.eylem || 'Sonuçları göster', veri: {'filtre-uygula': 1}})}</div>`, sonra: (k, h) => {
      const etiket = (ad, v) => { const g = o.gruplar.find(x => x.ad === ad), x = g.ogeler.find(y => String(y.deger) === String(v)); return x?.metin ?? x?.ad ?? v; };
      const cipCiz = () => { const c = k.querySelector('[data-filtre-cipler]'), l = Object.entries(d).flatMap(([a, vs]) => vs.map(v => [a, v])); c.innerHTML = l.length ? l.map(([a, v]) => lcip({metin: etiket(a, v), kapat: true, attrs: `data-kaldir="${esc(a)}" data-deger="${esc(v)}"`})).join('') : '<span class="gm-sheet__hint">Seçtiğin filtreler burada görünür</span>'; o.degisti?.(d); };
      k.addEventListener('change', ev => { const t = ev.target; if (!t.matches('input')) return; const g = t.name; if (t.type === 'radio') d[g] = [t.value]; else d[g] = t.checked ? [...d[g].filter(x => String(x) !== t.value), t.value] : d[g].filter(x => String(x) !== t.value); cipCiz(); });
      k.addEventListener('click', ev => {
        const f = ev.target.closest('.gm-facet__head');
        if (f) { const s = f.closest('.gm-facet'), on = !s.classList.contains('is-open'); k.querySelectorAll('.gm-facet').forEach(x => { const a = x === s && on; x.classList.toggle('is-open', a); x.querySelector('.gm-facet__head').setAttribute('aria-expanded', a); }); return; }
        const m = ev.target.closest('.gm-more');
        if (m) { const on = m.getAttribute('aria-expanded') !== 'true'; m.setAttribute('aria-expanded', on); m.parentElement.querySelectorAll('[data-extra]').forEach(x => { x.hidden = !on; }); m.innerHTML = `${on ? 'Daha az göster' : m.dataset.more} ${ik(on ? 'chevron-up' : 'ac')}`; return; }
        const r = ev.target.closest('[data-kaldir]');
        if (r) { const a = r.dataset.kaldir, v = r.dataset.deger; d[a] = d[a].filter(x => String(x) !== v); const i = k.querySelector(`input[name="${CSS.escape(a)}"][value="${CSS.escape(v)}"]`); if (i) i.checked = false; cipCiz(); return; }
        if (ev.target.closest('[data-filtre-temizle]')) { Object.keys(d).forEach(x => { d[x] = []; }); k.querySelectorAll('input:checked').forEach(i => { i.checked = false; }); cipCiz(); }
        if (ev.target.closest('[data-filtre-uygula]')) { o.uygula?.(d); h.kapat(); }
      });
      cipCiz();
    }});
  };

  // ---------- detay-v2 ----------
  // Detay başlığı + panel: {gorsel, etiket, baslik, alt, caps:[{ikon, metin}], bas (html, sekmeden önce), sekmeler (GM.detaySekmeler), kuyruk (html)}
  GM.detay = (o = {}) => `<section class="gm-banner is-kart is-detay" data-c="kalip" data-kalip="detay"><div class="gm-banner-foto"${bg(o.gorsel)}></div><span class="gm-banner-golge" aria-hidden="true"></span><div class="gm-banner-metin">${o.etiket ? `<span class="gm-t-label">${esc(o.etiket)}</span>` : ''}<h1 class="gm-t-display">${esc(o.baslik)}</h1>${o.alt ? `<p>${esc(o.alt)}</p>` : ''}${o.caps?.length ? `<div class="gm-caps">${o.caps.map(c => `<span class="gm-cap">${c.ikon ? ik(c.ikon) : ''}<span>${esc(c.metin)}</span></span>`).join('')}</div>` : ''}</div></section><div class="gm-panel gm-detay-panel">${o.bas ? `<div class="gm-detay-bas">${o.bas}</div>` : ''}${o.sekmeler || ''}${o.govde || o.kuyruk ? `<div class="gm-detay-icerik">${o.govde || ''}${o.kuyruk ? `<div class="gm-kuyruk">${o.kuyruk}</div>` : ''}</div>` : ''}</div>`;
  // Özet şeridi: [{ikon, etiket, deger, birim}]
  GM.ozetSerit = l => `<section class="gm-facts"><dl style="--n:${l.length}">${l.map(x => `<div><dt>${x.ikon ? ik(x.ikon) : ''}<span>${esc(x.etiket)}</span></dt><dd>${esc(x.deger)}${x.birim ? `<small>${esc(x.birim)}</small>` : ''}</dd>${x.alt ? `<dd class="gm-facts-alt">${esc(x.alt)}</dd>` : ''}</div>`).join('')}</dl></section>`;
  // Özellik satırı: {on:[{ikon,metin}], etiket:'Özellikler', ogeler:[{ikon,metin}]}
  GM.ozellikSerit = (o = {}) => { const c = x => `<span class="gm-ozellik">${x.ikon ? ik(x.ikon) : ''}<span>${esc(x.metin)}</span></span>`; return `<section class="gm-ozellikler"><div class="gm-ozellik-rail" tabindex="0">${(o.on || []).map(c).join('')}${o.ogeler?.length ? `${o.etiket === false ? '' : `<span class="gm-ozellik-etiket">${esc(o.etiket || 'Özellikler')}</span>`}${o.ogeler.map(c).join('')}` : ''}</div></section>`; };
  // Açıklama: 3 satır + fade + Devamını oku. {metin, satir}
  GM.aciklama = (o = {}) => `<div class="gm-aciklama" data-c="kalip" data-kalip="aciklama" data-satir="${o.satir || 3}"><p class="gm-aciklama-metin">${vurgu(o.metin)}</p><button type="button" class="gm-devam" aria-expanded="false" hidden><span>Devamını oku</span>${ik('ac')}</button></div>`;
  // Yapışkan sekme + paneller: {ad, ogeler:[{ad, deger, sayi, html}], secili, kaydir}
  GM.detaySekmeler = (o = {}) => { const sec = o.secili ?? o.ogeler[0]?.deger; return `<div class="gm-sekme-kap" data-sekme-kap="${esc(o.ad || 'sekme')}"><div class="gm-sekme-bar">${GM.segment({...o, secili: sec, ogeler: o.ogeler.map(({html, ...x}) => x)})}</div><div class="gm-detay-icerik">${o.ogeler.map(x => `<div class="gm-pane" role="tabpanel" data-pane="${esc(x.deger)}"${x.deger === sec ? '' : ' hidden'}>${x.html || ''}</div>`).join('')}</div></div>`; };
  // Bilgi kartı şeridi: [{ikon, baslik, metin, veri}]
  GM.bilgiSerit = l => `<div class="gm-bilgi-rail">${l.map(c => `<button type="button" class="gm-bilgi-kart"${at(c)}><span class="gm-bilgi-bas">${GM.ikonKutu({ikon: c.ikon, boyut: 'md'})}<span class="gm-bilgi-baslik">${esc(c.baslik)}</span></span><span class="gm-bilgi-govde">${vurgu(c.metin)}</span></button>`).join('')}</div>`;
  GM.kunye = l => `<ul class="gm-kunye">${l.map(x => `<li>${ik(x.ikon)}<span>${esc(x.etiket)}</span><b>${esc(x.deger)}</b></li>`).join('')}</ul>`;

  // ---------- Açılış ve karşılama (Gastro acilis.css .ac-s2, .ac-k3) ----------
  const LOGO = 'assets/marka/dadagourmet-beyaz.svg';
  // Eğik üç sütun kolaj; dokunuş data-eylem="gec". Az görsel verilirse sütunları dolduracak kadar yinelenir.
  GM.acilis = (o = {}) => {
    const G = o.gorseller || [], K = G.length ? Array.from({length: 15}, (_, i) => G[i % G.length]) : [];
    const sutun = k => `<div class="gm-ac-sutun">${K.map((g, i) => (i % 3 === k ? `<div class="gm-ac-karo"${bg(g)} data-i="${Math.floor(i / 3) % 5}"></div>` : '')).join('')}</div>`; // Gastro --i: karonun kendi sütunundaki sırası (yukarıdan aşağı 0..4)
    return `<div class="gm-ac" data-c="kalip" data-kalip="acilis"><div class="gm-ac-kolaj" aria-hidden="true">${sutun(0)}${sutun(1)}${sutun(2)}</div><div class="gm-ac-perde"></div><div class="gm-ac-isik" aria-hidden="true"></div><div class="gm-ac-orta"><img class="gm-ac-logo" src="${esc(o.logo || LOGO)}" alt="Dada Gourmet"></div><span class="gm-ac-hilal" aria-hidden="true"></span><button class="gm-ac-dokun" type="button" data-eylem="gec" aria-label="Geç"></button></div>`;
  };
  // Çıkış: kolaj düzleşip dağılır, sonra fn. Bir kez çalışır; dokunuş ve zamanlayıcı birlikte çağırabilir.
  // Çıkışta ilk boyama koyu zemini (index.html gm-ac-koyu) de kalkar.
  GM.acilisCik = (kok, fn) => { const e = kok.querySelector('.gm-ac'); if (!e || e.dataset.cikti) return; e.dataset.cikti = 1; const bit = () => { document.documentElement.classList.remove('gm-ac-koyu'); fn?.(); }; if (GM.azHareket()) { bit(); return; } e.classList.add('is-cikis'); setTimeout(bit, M.base); };
  // Gülücük kapak kalan yüksekliği doldurur: logo üstte, başlık ve metin altta, html beyaz alanda. Alt düğmeler altBar'dadır.
  GM.karsilamaKabuk = (o = {}) => `<div class="gm-ac-k3">${GM.gulucuk({gorsel: o.gorsel, sinif: 'gm-ac-kapak', icerik: `<img class="gm-ac-logo" src="${esc(o.logo || LOGO)}" alt="Dada Gourmet"><div class="gm-ac-metin" data-gm-veil-from><h1 class="gm-t-display">${esc(o.baslik)}</h1>${o.metin ? `<p class="gm-t-body">${vurgu(o.metin)}</p>` : ''}</div>`})}${o.html ? `<div class="gm-ac-alt">${o.html}</div>` : ''}</div>`;

  // ---------- Davranış ----------
  document.addEventListener('click', ev => {
    const b = ev.target.closest?.('.gm-devam'); if (!b) return;
    const k = b.closest('.gm-aciklama'), m = k.querySelector('.gm-aciklama-metin'), on = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', on); b.querySelector('span').textContent = on ? 'Daha az göster' : 'Devamını oku';
    k.classList.toggle('is-kirpik', !on); k.style.setProperty('--gm-aciklama-kapali', on ? `${m.scrollHeight}px` : k.dataset.kapali);
  });
  document.addEventListener('gm-degisim', ev => { const k = ev.target.closest?.('[data-sekme-kap]'); if (!k || ev.detail.ad !== k.dataset.sekmeKap) return; k.querySelectorAll(':scope>.gm-detay-icerik>.gm-pane').forEach(p => { p.hidden = p.dataset.pane !== String(ev.detail.deger); }); });
  const heroBoya = h => { if (!window.GMCard) return; const top = h.getBoundingClientRect().top, H = h.clientHeight; if (!H) return; const ust = h.querySelector('.gm-hero-ara,.gm-hero-top p') || h.querySelector('.gm-hero-top h1'), orta = h.querySelector('.gm-hero-orta'), A = TK.overlay; if (orta) { const r = orta.getBoundingClientRect(); h.style.setProperty('--gm-hero-odak-y', `${Math.round(r.top + r.height / 2 - top)}px`); } const metin = [...h.querySelectorAll('.gm-hero-slide:not([data-klon]) .gm-hero-copy')].map(c => GMCard.textTop(c) - top), tt = metin.length ? Math.min(...metin) : H, len = ust ? ust.getBoundingClientRect().bottom - top : TK.size.header + TK.space[48]; h.style.setProperty('--gm-sahne-perde', GMCard.gradient(H, y => GMCard.heroAlfa(y, H, len, tt), [len, len + A.heroTop.fadeLength, tt - A.heroBottom.leadAboveFirstText, tt])); };
  const heroKur = h => {
    const tr = h.querySelector('.gm-hero-track'), n = tr.querySelectorAll('.gm-hero-slide:not([data-klon])').length, dots = [...h.querySelectorAll('.gm-pager-dots i')];
    const pos = () => Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth));
    tr.addEventListener('scroll', () => { const i = pos() % n; dots.forEach((d, k) => d.classList.toggle('is-on', k === i)); }, {passive: true});
    heroBoya(h);
    if (n > 1 && !GM.azHareket()) { let z = setInterval(() => { if (!h.isConnected) { clearInterval(z); return; } if (h.closest('.is-gizli') || document.hidden) return; const s = pos() + 1; tr.scrollTo({left: s * tr.clientWidth, behavior: 'smooth'}); if (s >= n) setTimeout(() => { tr.scrollTo({left: 0, behavior: 'auto'}); }, M.reveal * 2); }, M.heroAutoplay); tr.addEventListener('pointerdown', () => { clearInterval(z); }, {once: true}); }
  };
  const sliderKur = s => { const tr = s.querySelector('.gm-kslider__track'), pg = s.querySelector('.gm-kslider__pager'), dots = [...pg.querySelectorAll('i')]; s.style.setProperty('--gm-pager-room', `calc(${pg.getBoundingClientRect().width}px + var(--gm-s-12))`); tr.addEventListener('scroll', () => { const w = tr.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(tr).columnGap) || 0), i = Math.max(0, Math.min(dots.length - 1, Math.round(tr.scrollLeft / w))); dots.forEach((d, k) => d.classList.toggle('is-on', k === i)); }, {passive: true}); };
  // Detay yükseklik: blok + alt boşluk + header + 152, en az 320 (Gastro sizeHero); perde üst ve alt kenar eğrisi.
  const detayKur = h => { const c = h.querySelector('.gm-banner-metin'), e = c.firstElementChild, y = Math.round(Math.max(TK.size.banner, c.offsetHeight + TK.spaceAlias.panelOverlap + TK.space[24] + TK.size.header + TK.space[48] * 3 + TK.space[8])); h.style.height = `${y}px`; requestAnimationFrame(() => { const t = GMCard.tokens(), tt = e.getBoundingClientRect().top - h.getBoundingClientRect().top, len = TK.size.header + TK.space[48]; h.dataset.perde = 1; h.style.setProperty('--gm-veil', GMCard.gradient(y, v => Math.max(GMCard.edgeTop(v, len, t), GMCard.edgeBottom(v, tt, t)), [len, tt - t.lead, tt + t.tail])); }); };
  const aciklamaKur = k => { const m = k.querySelector('.gm-aciklama-metin'), lh = parseFloat(getComputedStyle(m).lineHeight) || TK.typography.body.size * TK.typography.body.line, kapali = `${Math.round(lh * +k.dataset.satir)}px`; if (m.scrollHeight > lh * +k.dataset.satir + 2) { k.dataset.kapali = kapali; k.style.setProperty('--gm-aciklama-kapali', kapali); k.classList.add('is-kirpik'); k.querySelector('.gm-devam').hidden = false; } };
  const smoother = t => { t = Math.max(0, Math.min(1, t)); return t * t * t * (t * (6 * t - 15) + 10); };
  // Perde logo çevresinde sabit, alt kenara doğru koyulaşır (Gastro acilis.js boya).
  const acilisKur = e => {
    e.querySelectorAll('.gm-ac-karo').forEach(k => k.style.setProperty('--i', k.dataset.i));
    const p = e.querySelector('.gm-ac-perde'), l = e.querySelector('.gm-ac-logo');
    const boya = () => { const h = p.offsetHeight; if (!h) return; const t = p.getBoundingClientRect().top, r = l.getBoundingClientRect(), s = TK.space[48], d = [[0, .35], [Math.max(h * .32, TK.space[64]), .3], [r.top - t - s, .55], [r.bottom - t + s, .55], [h - s * 2, .8], [h, .9]].sort((a, b) => a[0] - b[0]); p.style.backgroundImage = GMCard.gradient(h, y => { for (let i = 1; i < d.length; i++) { const [y0, a0] = d[i - 1], [y1, a1] = d[i]; if (y <= y1) return a0 + (a1 - a0) * smoother((y - y0) / Math.max(1, y1 - y0)); } return d.at(-1)[1]; }); };
    boya(); l.addEventListener('load', boya); new ResizeObserver(boya).observe(p);
  };
  GM._kalipKur = el => ({hero: heroKur, slider: sliderKur, detay: detayKur, aciklama: aciklamaKur, acilis: acilisKur}[el.dataset.kalip]?.(el));
  // Ekran kaydırması: sahne daralması, foto parallax, yapışan panel başı ve sekme, panel altına giren satırın gizlenmesi.
  GM._kalipKaydir = (g, k, bar) => {
    const y = k.scrollTop, r0 = k.getBoundingClientRect().top, H = bar ? bar.offsetHeight : 0, h = g.el.querySelector('.gm-hero');
    if (h && !GM.azHareket()) { const s = M.sahne, a = Math.min(y, s.limit); h.style.setProperty('--gm-scene-collapse', `${Math.min(a * s.daralma, s.enFazla)}px`); h.querySelectorAll('.gm-hero-foto').forEach(p => { p.style.transform = `translateY(${a * s.kayma}px) scale(${1 - a * s.kucul})`; }); }
    const arac = g.el.querySelector('.gm-liste-arac');
    if (arac) { const st = arac.getBoundingClientRect().top - r0 <= H + .5; arac.classList.toggle('is-stuck', st); const alt = arac.getBoundingClientRect().bottom; g.el.querySelectorAll('.gm-liste-themes__title,.gm-liste-theme-rail,.gm-liste-status').forEach(e => e.classList.toggle('gm-liste-occluded', st && e.getBoundingClientRect().top < alt)); }
    g.el.querySelectorAll('.gm-sekme-bar').forEach(b => b.classList.toggle('is-stuck', b.getBoundingClientRect().top - r0 <= H + .5));
  };
  // Seçim alanı (GM.secAlan): dokununca tek seçimli sheet açar, gizli input'u doldurur ve gm-degisim atar.
  document.addEventListener('click', ev => {
    const b = ev.target.closest?.('[data-sec-alan]'); if (!b) return;
    const alan = b.closest('.gm-alan'), girdi = alan.querySelector('input[type="hidden"]'), sec = JSON.parse(b.dataset.secenekler || '[]');
    GM.siralaSheet({baslik: alan.querySelector('label')?.firstChild?.textContent?.trim() || 'Seç', secenekler: sec.map(([d, m]) => [String(d), m]), secili: girdi.value, sec: v => {
      const m = sec.find(([d]) => String(d) === v); girdi.value = v;
      const sp = b.querySelector('span'); sp.textContent = m ? m[1] : b.dataset.yer; sp.classList.toggle('is-yer', !m);
      GM.degisim(b, b.dataset.secAlan, v);
    }});
  });
  // ---------- Ekran küçük görseli (Ekran kataloğu #/katalog; 11 Kasım, KT) ----------
  // GM.ekranKucuk({src, ad}): telefon oranında (390:844) küçük ekran görüntüsü; satırda GM.satir({sol: GM.ekranKucuk(...)}) ile kullanılır.
  // alt = ekran adı. Görsel yoksa ya da yüklenemezse <img> gizlenir; aynı ölçüde nötr kutu ve ekran ikonu kalır (yazı yok).
  GM.ekranKucuk = (o = {}) => `<span class="gm-ekran-kucuk">${ik('mobile-screen')}${o.src ? `<img src="${esc(o.src)}" alt="${esc(o.ad || '')}" loading="lazy" decoding="async">` : ''}</span>`;
  document.addEventListener('error', e => { const t = e.target; if (t && t.tagName === 'IMG' && t.parentElement?.classList.contains('gm-ekran-kucuk')) t.hidden = true; }, true);
})();
