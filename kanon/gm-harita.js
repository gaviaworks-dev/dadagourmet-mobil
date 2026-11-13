/* Harita ve rota (Gourmet'e özgü; Gastro/Diet'te karşılığı yok). Pin, küme, seçili pin, rota çizgisi, yol üstü koridoru, konum noktası.
   İki katman: önce aynı veriden SVG şema çizilir (anında, ağsız; çevrimdışı paket görünümü de budur), MapLibre yüklenince üstüne gerçek harita solar.
   Altlık: OpenFreeMap positron (web dadagourmet-prototip ile aynı), renkleri Gourmet token'larına çevrilir. Veri © OpenStreetMap katkıcıları.
   API: GM.harita(o) → HTML · GM.pin(o) · GM.kume(o) · GM.konumNokta() · GM.rotaCizgi(o) (statik SVG) · GM.haritaOdak(el, id) · olay gm-degisim {ad, deger: pinId}. */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, TK = GM.TK, liste = (...a) => a.filter(Boolean).join(' ');
  const STIL = 'https://tiles.openfreemap.org/styles/positron';
  const MLJS = 'assets/vendor/maplibre/maplibre-gl.js';
  const KATMAN_IKON = {mekan: 'mekan', neYenir: 'neYenir', neAlinir: 'neAlinir', yakit: 'yakit', sarj: 'sarj', ibadet: 'ibadet', dinlenme: 'dinlenme', karavan: 'karavan', cografi: 'cografi', durak: 'durak', baslangic: 'baslangic', varis: 'varis'};

  // ---------- Pinler (HTML; haritada da, katalogda da aynı işaretleme) ----------
  // tur: mekan | neYenir | neAlinir | yakit | sarj | ibadet | dinlenme | karavan | cografi · etiket: kısa değer (puan, fiyat, mesafe) · sira: rota durak numarası · secili · ad: seçili pin altındaki ad
  GM.pin = (o = {}) => {
    const tur = o.tur || 'mekan', sira = o.sira != null;
    const ic = sira ? `<b class="gm-pin-sira">${esc(o.sira)}</b>` : ik(o.ikon || KATMAN_IKON[tur] || 'pin');
    return `<span class="${liste('gm-pin', `is-${tur}`, o.etiket && 'has-etiket', o.secili && 'is-secili', o.soluk && 'is-soluk', o.kucuk && 'is-kucuk', o.sinif)}"${o.id ? ` data-pin="${esc(o.id)}"` : ''} role="img" aria-label="${esc(o.aria || o.ad || tur)}"><span class="gm-pin-kafa">${ic}${o.etiket ? `<span class="gm-pin-etiket">${esc(o.etiket)}</span>` : ''}</span>${o.secili && o.ad ? `<span class="gm-pin-ad">${esc(o.ad)}</span>` : ''}</span>`;
  };
  GM.kume = (o = {}) => `<span class="${liste('gm-kume', o.n >= 50 ? 'is-lg' : o.n >= 10 ? 'is-md' : 'is-sm', o.sinif)}" role="img" aria-label="${esc(o.n)} mekân"><b>${esc(o.n)}</b></span>`;
  GM.konumNokta = (o = {}) => `<span class="${liste('gm-konum', o.yon != null && 'has-yon', o.sinif)}" style="${o.yon != null ? `--yon:${+o.yon}deg` : ''}" role="img" aria-label="Konumun"><i></i></span>`;

  // ---------- Web Mercator ve SVG şema ----------
  const merc = ([lng, lat]) => { const s = Math.sin(lat * Math.PI / 180); return [(lng + 180) / 360, .5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)]; };
  const sinirBul = o => {
    const nok = [...(o.rota?.cizgi || []), ...(o.rota?.alternatif || []), ...(o.pinler || []).map(p => [p.lng, p.lat]), ...(o.konum ? [o.konum] : [])];
    if (o.sinir) return o.sinir;
    if (nok.length > 1) return [[Math.min(...nok.map(p => p[0])), Math.min(...nok.map(p => p[1]))], [Math.max(...nok.map(p => p[0])), Math.max(...nok.map(p => p[1]))]];
    const m = o.merkez || nok[0] || [28.98, 41.03], d = 0.02;
    return [[m[0] - d, m[1] - d], [m[0] + d, m[1] + d]];
  };
  // Kutuya sığdırma: en/boy oranını koruyan izdüşüm (dolgu px).
  const izdusum = (o, w, h) => {
    const [[a, b], [c, d]] = sinirBul(o), p1 = merc([a, d]), p2 = merc([c, b]), dl = {top: 24, right: 24, bottom: 24, left: 24, ...(o.dolgu || {})};
    const iw = Math.max(1, w - dl.left - dl.right), ih = Math.max(1, h - dl.top - dl.bottom), sx = p2[0] - p1[0] || 1e-6, sy = p2[1] - p1[1] || 1e-6, k = Math.min(iw / sx, ih / sy);
    const ox = dl.left + (iw - sx * k) / 2, oy = dl.top + (ih - sy * k) / 2;
    return ll => { const m = merc(ll); return [ox + (m[0] - p1[0]) * k, oy + (m[1] - p1[1]) * k]; };
  };
  const yolStr = (pts, f) => pts.map((p, i) => { const [x, y] = f(p); return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; }).join('');
  // Statik rota şeması (kart küçük resmi, çevrimdışı görünüm): kâğıt zemin, ince ızgara, koridor, rota, duraklar.
  // Kapak silueti (rota kartı kapağı): seyreltilmiş noktalardan Catmull-Rom ile yumuşak eğri, parıltılı ince çizgi, kalkış halkası + varış pini (web Dada Route motifi), il noktaları.
  const yumusak = pts => { if (pts.length < 3) return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(''); let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]; d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`; } return d; };
  const seyrek = (pts, esik) => { const l = [pts[0]]; pts.forEach((p, i) => { const s0 = l[l.length - 1]; if (i === pts.length - 1 || Math.hypot(p[0] - s0[0], p[1] - s0[1]) >= esik) l.push(p); }); return l; };
  GM.rotaKapakCizgi = (o = {}) => {
    const w = o.w || 280, h = o.h || 180, f = izdusum({...o, dolgu: o.dolgu || {top: 30, right: 24, bottom: 18, left: 24}}, w, h), c = o.rota?.cizgi || [];
    if (c.length < 2) return '';
    const P = seyrek(c.map(f), Math.max(6, Math.min(w, h) / 22)), d = yumusak(P), b = P[0], v = P[P.length - 1], id = `gk${Math.random().toString(36).slice(2, 7)}`;
    const iller = (o.iller || []).map(x => f([x.lng, x.lat])).map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" class="gm-kc-il"/>`).join('');
    return `<svg class="gm-kapak-cizgi" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="var(--gm-on-dark-accent)"/></linearGradient><filter id="${id}p" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs><path d="${d}" class="gm-kc-hale" filter="url(#${id}p)"/><path d="${d}" class="gm-kc-golge"/><path d="${d}" class="gm-kc-cizgi" stroke="url(#${id})"/>${iller}<circle cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r="6.5" class="gm-kc-bas"/><circle cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r="2.6" class="gm-kc-bas-ic"/><g transform="translate(${v[0].toFixed(1)} ${v[1].toFixed(1)})"><path d="M0 0c-1.2-3.4-7.6-8.6-7.6-14.4a7.6 7.6 0 0 1 15.2 0c0 5.8-6.4 11-7.6 14.4z" class="gm-kc-pin"/><circle cx="0" cy="-14.4" r="3" class="gm-kc-pin-ic"/></g></svg>`;
  };
  GM.rotaCizgi = (o = {}) => {
    const w = o.w || 342, h = o.h || 180, f = izdusum(o, w, h), r = o.rota || {};
    const cz = r.cizgi?.length ? yolStr(r.cizgi, f) : '', alt = r.alternatif?.length ? yolStr(r.alternatif, f) : '';
    const durak = (o.pinler || []).map(p => { const [x, y] = f([p.lng, p.lat]); return `<circle class="gm-sema-durak is-${esc(p.tur || 'mekan')}${p.uc ? ' is-uc' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.uc ? 6 : 4.5}"/>`; }).join('');
    return `<svg class="${liste('gm-sema', o.sinif)}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="gm-sema-izgara" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" class="gm-sema-izgara"/></pattern></defs><rect width="${w}" height="${h}" class="gm-sema-zemin"/><rect width="${w}" height="${h}" fill="url(#gm-sema-izgara)"/>${alt ? `<path d="${alt}" class="gm-sema-alt"/>` : ''}${cz ? `<path d="${cz}" class="gm-sema-koridor"/><path d="${cz}" class="gm-sema-kenar"/><path d="${cz}" class="gm-sema-rota"/>` : ''}${durak}</svg>`;
  };

  // ---------- Harita bileşeni ----------
  // o: {ad, merkez, zoom, sinir, dolgu, pinler, kume, rota:{cizgi, alternatif, gecilen}, koridor, konum, yon, stil:'acik'|'koyu', etkilesim, yukseklik, kontroller, sinif, etiket}
  GM.harita = (o = {}) => {
    const veri = {...o}; delete veri.sinif;
    const h = o.yukseklik || '240px';
    return `<div class="${liste('gm-harita', o.stil === 'koyu' && 'is-koyu', o.etkilesim === false && 'is-statik', o.tam && 'is-tam', o.sinif)}" data-c="harita" data-harita='${esc(JSON.stringify(veri))}' style="--gm-harita-h:${esc(h)}" role="region" aria-label="${esc(o.etiket || 'Harita')}"><div class="gm-harita-sema"></div><div class="gm-harita-tuval" aria-hidden="true"></div>${o.kontroller === false ? '' : `<div class="gm-harita-kontrol">${o.konum ? GM.ikonBtn({ikon: 'konum', etiket: 'Konumuma git', tur: 'cam', veri: {'harita-konum': 1}}) : ''}</div>`}<span class="gm-harita-durum" aria-live="polite">${GM.ik('yenile')}<span>Harita yükleniyor</span></span><span class="gm-harita-atif">© OpenStreetMap</span></div>`;
  };

  // SVG şema: harita kutusunun ölçüsüyle çizilir; pinler HTML olarak şemanın üstüne yerleşir (aynı GM.pin).
  const semaCiz = (el, o) => {
    const k = el.querySelector('.gm-harita-sema'), w = el.clientWidth || 342, h = el.clientHeight || 240;
    const f = izdusum(o, w, h);
    const pin = p => { const [x, y] = f([p.lng, p.lat]); return `<span class="gm-harita-isaret" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px" data-pin-id="${esc(p.id || '')}">${GM.pin(p)}</span>`; };
    const pinler = kumele(o.pinler || [], o.kume ? 44 : 0, f).map(p => p.n ? `<span class="gm-harita-isaret" style="left:${p.x.toFixed(1)}px;top:${p.y.toFixed(1)}px">${GM.kume({n: p.n})}</span>` : pin(p.p));
    const kon = o.konum ? (() => { const [x, y] = f(o.konum); return `<span class="gm-harita-isaret" style="left:${x}px;top:${y}px">${GM.konumNokta({yon: o.yon})}</span>`; })() : '';
    k.innerHTML = `${GM.rotaCizgi({...o, w, h, pinler: [], sinif: o.stil === 'koyu' ? 'is-koyu' : ''})}${pinler.join('')}${kon}`;
  };
  // Basit ızgara kümeleme (px): aynı hücredeki mekân pinleri sayıya dönüşür; seçili ve katman pinleri kümelenmez.
  const kumele = (pinler, hucre, f) => {
    if (!hucre) return pinler.map(p => ({p}));
    const kova = new Map(), cikti = [];
    pinler.forEach(p => {
      if (p.secili || (p.tur && p.tur !== 'mekan') || p.sira != null) { cikti.push({p}); return; }
      const [x, y] = f([p.lng, p.lat]), a = `${Math.floor(x / hucre)}:${Math.floor(y / hucre)}`;
      (kova.get(a) || kova.set(a, []).get(a)).push({p, x, y});
    });
    kova.forEach(l => { if (l.length === 1) cikti.unshift({p: l[0].p}); else cikti.unshift({n: l.length, x: l.reduce((s, q) => s + q.x, 0) / l.length, y: l.reduce((s, q) => s + q.y, 0) / l.length}); });
    return cikti;
  };

  // MapLibre bir kez, ilk haritada yüklenir.
  let mlSoz = null;
  const mlYukle = () => mlSoz ||= new Promise((tamam, red) => {
    if (window.maplibregl) { tamam(window.maplibregl); return; }
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'assets/vendor/maplibre/maplibre-gl.css'; document.head.append(css);
    const s = document.createElement('script'); s.src = MLJS; s.onload = () => tamam(window.maplibregl); s.onerror = () => { mlSoz = null; red(new Error('maplibre')); }; document.head.append(s);
  });
  // Altlığı token renklerine çevir: su, park, yol, bina, etiket. Koyu kip sürüş/gece içindir.
  const renk = ad => getComputedStyle(document.documentElement).getPropertyValue(`--gm-${ad}`).trim();
  const boya = (m, koyu) => {
    const R = koyu
      ? {zemin: '#1E1A20', su: '#26303B', park: '#22291F', yol: '#3A343E', yolKenar: '#2A252D', bina: '#29242C', yazi: '#CFC8BE', hale: '#1E1A20', sinir: '#4A4350'}
      : {zemin: '#F5F4F2', su: '#D3E2EA', park: '#E2ECDD', yol: '#FFFFFF', yolKenar: '#E4E1DD', bina: '#ECEAE6', yazi: renk('slate') || '#56514A', hale: '#FFFFFF', sinir: '#C9C4CC'};
    const st = m.getStyle(); if (!st) return;
    st.layers.forEach(l => {
      const id = l.id, set = (p, v) => { try { m.setPaintProperty(id, p, v); } catch { /* katmanda yok */ } };
      if (l.type === 'background') set('background-color', R.zemin);
      else if (/water/.test(id) && l.type === 'fill') set('fill-color', R.su);
      else if (/water/.test(id) && l.type === 'line') set('line-color', R.su);
      else if (/park|wood|grass|landcover|landuse_park/.test(id) && l.type === 'fill') set('fill-color', R.park);
      else if (/building/.test(id) && l.type === 'fill') set('fill-color', R.bina);
      else if (/landuse|landcover/.test(id) && l.type === 'fill') set('fill-color', R.zemin);
      else if (/casing/.test(id) && l.type === 'line') set('line-color', R.yolKenar);
      else if (/highway|road|street|tunnel|bridge|path|minor|major|motorway|trunk|primary|secondary|tertiary/.test(id) && l.type === 'line') set('line-color', R.yol);
      else if (/boundary|admin/.test(id) && l.type === 'line') set('line-color', R.sinir);
      // Etiket dili: Türkçe ad varsa o, yoksa Latin harfli uluslararası ad (Kiril/Arap alfabeli çift satır yok).
      if (l.type === 'symbol' && l.layout?.['text-field']) { try { m.setLayoutProperty(id, 'text-field', ['coalesce', ['get', 'name:tr'], ['get', 'name_int'], ['get', 'name:latin'], ['get', 'name']]); } catch { /* yok */ } }
      if (l.type === 'symbol') { set('text-color', R.yazi); set('text-halo-color', R.hale); if (/poi/.test(id)) { try { m.setLayoutProperty(id, 'visibility', 'none'); } catch { /* yok */ } } }
    });
  };
  const rotaKatman = (m, o, koyu) => {
    const r = o.rota || {}, p = renk('primary') || '#742982', alt = renk('rota-alt') || '#B9A5BE', ince = (o.etkilesim === false ? .7 : 1);
    const ekle = (id, koord) => { if (!koord?.length) return; m.addSource(id, {type: 'geojson', data: {type: 'Feature', geometry: {type: 'LineString', coordinates: koord}}}); };
    ekle('gm-alt', r.alternatif); ekle('gm-rota', r.cizgi); ekle('gm-gecilen', r.gecilen);
    if (r.alternatif?.length) m.addLayer({id: 'gm-alt', type: 'line', source: 'gm-alt', layout: {'line-cap': 'round', 'line-join': 'round'}, paint: {'line-color': alt, 'line-width': 5 * ince, 'line-dasharray': [1.2, 1.4]}});
    if (r.cizgi?.length) {
      if (o.koridor) m.addLayer({id: 'gm-koridor', type: 'line', source: 'gm-rota', layout: {'line-cap': 'round', 'line-join': 'round'}, paint: {'line-color': p, 'line-opacity': .12, 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 14, 9, 34, 13, 90]}});
      m.addLayer({id: 'gm-rota-kenar', type: 'line', source: 'gm-rota', layout: {'line-cap': 'round', 'line-join': 'round'}, paint: {'line-color': koyu ? '#1E1A20' : '#FFFFFF', 'line-width': 9 * ince}});
      m.addLayer({id: 'gm-rota', type: 'line', source: 'gm-rota', layout: {'line-cap': 'round', 'line-join': 'round'}, paint: {'line-color': koyu ? (renk('on-dark-accent') || '#BA94C0') : p, 'line-width': 5 * ince}});
    }
    if (r.gecilen?.length) m.addLayer({id: 'gm-gecilen', type: 'line', source: 'gm-gecilen', layout: {'line-cap': 'round', 'line-join': 'round'}, paint: {'line-color': koyu ? '#5A5260' : '#B8B3AE', 'line-width': 5 * ince}});
  };
  // İşaretler: kümeleme açıksa her hareket sonunda ekran px ızgarasıyla yeniden kurulur (şemadaki kumele ile aynı kural).
  const isaretler = (ml, m, el, o) => {
    let liste = [];
    const ekle = (html, ll, id) => { const d = document.createElement('div'); d.className = 'gm-harita-ml'; if (id) d.dataset.pinId = id; d.innerHTML = html; liste.push(new ml.Marker({element: d, anchor: 'center'}).setLngLat(ll).addTo(m)); };
    const kur = () => {
      liste.forEach(x => x.remove()); liste = [];
      const f = ll => { const q = m.project(ll); return [q.x, q.y]; };
      kumele(o.pinler || [], o.kume ? 44 : 0, f).forEach(x => x.n ? ekle(GM.kume({n: x.n}), m.unproject([x.x, x.y])) : ekle(GM.pin(x.p), [x.p.lng, x.p.lat], x.p.id));
      if (o.konum) ekle(GM.konumNokta({yon: o.yon}), o.konum);
    };
    kur(); if (o.kume) m.on('moveend', kur);
  };
  GM._haritaKur = el => {
    let o; try { o = JSON.parse(el.dataset.harita); } catch { return; }
    const sema = () => semaCiz(el, o);
    sema(); new ResizeObserver(() => { if (!el.classList.contains('is-yuklendi')) sema(); }).observe(el);
    // Pin dokunuşu: şema ve gerçek haritada aynı olay.
    el.addEventListener('click', ev => { const p = ev.target.closest('[data-pin-id]'); if (p && p.dataset.pinId) { GM.haritaOdak(el, p.dataset.pinId); GM.degisim(el, o.ad || 'harita', p.dataset.pinId); } });
    if (o.cevrimdisi || GM.durum.oku('harita-cevrimdisi', false)) { el.classList.add('is-cevrimdisi'); const d = el.querySelector('.gm-harita-durum'); if (d) d.innerHTML = `${GM.ik('cevrimdisi')}<span>Çevrimdışı · indirilen rota</span>`; return; }
    const kur = () => mlYukle().then(ml => {
      if (!el.isConnected) return;
      const koyu = o.stil === 'koyu', b = sinirBul(o), dl = {top: 24, right: 24, bottom: 24, left: 24, ...(o.dolgu || {})};
      const ayar = {container: el.querySelector('.gm-harita-tuval'), style: STIL, attributionControl: false, interactive: o.etkilesim !== false, dragRotate: false, pitchWithRotate: false, fadeDuration: 0};
      if (o.merkez && o.zoom) Object.assign(ayar, {center: o.merkez, zoom: o.zoom}); else Object.assign(ayar, {bounds: b, fitBoundsOptions: {padding: dl}});
      const m = new ml.Map(ayar);
      el._harita = m;
      m.on('styledata', () => { if (!m._gmBoya) { m._gmBoya = 1; boya(m, koyu); } });
      m.on('load', () => { boya(m, koyu); rotaKatman(m, o, koyu); isaretler(ml, m, el, o); });
      m.once('idle', () => { clearTimeout(el._gmGecikme); el.classList.remove('is-gecikti'); el.classList.add('is-yuklendi'); });
      // Karo sunucusu yavaşsa: 6 sn'de rota şeması üstünde "Harita yükleniyor" çipi; 12 sn'de karolar yeniden istenir (şema altlık olarak kalır, ekran boş görünmez).
      el._gmGecikme = setTimeout(() => { if (el.classList.contains('is-yuklendi')) return; el.classList.add('is-gecikti'); el._gmGecikme = setTimeout(() => { if (!el.classList.contains('is-yuklendi')) { try { m.style?.sourceCaches && Object.values(m.style.sourceCaches).forEach(c => c.reload?.()); m.triggerRepaint(); } catch { /* yok */ } } }, 6000); }, 6000);
    }).catch(h => { console.warn('[harita]', h?.message || h); el.classList.add('is-cevrimdisi'); });
    // Görünür olunca kur (uzun listede yüzlerce harita açılmasın).
    const g = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { g.disconnect(); kur(); } }, {rootMargin: '200px'});
    g.observe(el);
  };
  // Seçili pini değiştir: şemada ve gerçek haritada aynı.
  GM.haritaOdak = (el, id) => {
    el.querySelectorAll('.gm-harita-isaret .gm-pin, .gm-harita-ml .gm-pin').forEach(p => p.classList.toggle('is-secili', p.dataset.pin === id));
    const m = el._harita, o = JSON.parse(el.dataset.harita), p = (o.pinler || []).find(x => x.id === id);
    if (m && p && o.etkilesim !== false) m.easeTo({center: [p.lng, p.lat], duration: GM.azHareket() ? 0 : TK.motion.page});
  };

  // Polyline (Google kodlaması, 5 basamak) → [[lng, lat]]; web gömülü OSRM geometrisi bu biçimde.
  GM.polyline = str => { let i = 0, lat = 0, lng = 0; const out = []; while (i < str.length) { for (const k of [0, 1]) { let b, s = 0, r = 0; do { b = str.charCodeAt(i++) - 63; r |= (b & 31) << s; s += 5; } while (b >= 32); const d = r & 1 ? ~(r >> 1) : r >> 1; if (k) lng += d; else lat += d; } out.push([lng / 1e5, lat / 1e5]); } return out; };
  // İki nokta arası km (haversine) ve rotaya en yakın mesafe: "yol üstü" (≤ 1 km) / "yakın" (≤ 10 km) ayrımı ekranda bu ölçüyle yazılır.
  GM.km = (a, b) => { const R = 6371, r = Math.PI / 180, dl = (b[1] - a[1]) * r, dn = (b[0] - a[0]) * r, x = Math.sin(dl / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  GM.rotayaUzaklik = (p, cizgi) => Math.min(...cizgi.map(c => GM.km(p, c)));
})();
