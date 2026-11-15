/* Birleşik arama (#/ara; sahibi: lezzet-ara, Görev 12). Kalıp: Diet ara.js (Gastro arama.html): son aramalar, popüler aramalar, sekmeli sonuç,
 * "Şunu mu demek istedin?" (Türkçe katlama + düzenleme mesafesi, eşik uzunluğun üçte biri), sonuç yok + popüler çipler.
 * Web karşılığı: panel /gourmet-ara (AramaOkumaServisi: Tümü / Mekân / Etkinlik / Lezzet / Rehber sekmeleri, Tümü'de tür blokları + "Tamamını Gör",
 * Popüler aramalar = AramaKayitServisi::SABIT_CIPLER, Son aramalar + Temizle). Mobilde Rota sekmesi eklendi (Dada Route, patron yönü).
 * Kapsam: GMV.mekanlar (203), GMV.etkinlikler (126), GMV.lezzetler (440), GMV.rotalar (7), GMX.sehirler (şehir rehberleri).
 * Yazarken sonuç yuvasında iskelet, 250 ms sonra sonuç (motion.oneri.inputDebounce). Tür sekmesinde 20'lik sonsuz kaydırma + "Hepsi bu kadar".
 * Seçili sekme şeritte her zaman görünür (yeniden çizimde şerit kaydırması korunur, seçili görünmüyorsa yalnız şerit kayar).
 * Kalıcı: 'ara-son' (metin listesi, en çok 6). Dış bağlantı: #/ara?q=metin&sekme=lezzet.
 * Ekrana özgü hâller: ?hal=yaziyor (iskelet) · ?hal=sonuc-yok (“zeytn” → Şunu mu demek istedin? zeytin) · ortak: bos, hata, cevrimdisi (çevrimiçi ekran: bağlantı hatası). */
(() => {
  const SON_EN = 6, GRUP_EN = 3, SAYFA = 20;
  const SEKMELER = [['tumu', 'Tümü'], ['mekan', 'Mekân'], ['etkinlik', 'Etkinlik'], ['lezzet', 'Lezzet'], ['rota', 'Rota'], ['rehber', 'Rehber']];
  const GRUP_AD = {mekan: 'Mekânlar', etkinlik: 'Etkinlikler', lezzet: 'Gurme Lezzetler', rota: 'Rotalar', rehber: 'Şehir Rehberleri'};
  const X = () => window.GMX || {};
  const POPULER = () => X().aramaPopuler || [];
  // Keşif kısayolları: ana sayfanın modül ızgarası (GM.modulKart) dili.
  const KESIF = [
    {ikon: 'rota', baslik: 'Dada Route', alt: 'Yol üstü lezzet durakları', fiil: 'Rota çiz', git: '#/rota', ana: true},
    {ikon: 'bul', baslik: 'Mekân Bul', alt: '4 soruda sana uygun mekân', fiil: 'Başla', git: '#/mekan-bul'},
    {ikon: 'etkinlik', baslik: 'Etkinlikler', alt: 'Gastronomi takvimi', fiil: 'Takvim', git: '#/etkinlikler'},
    {ikon: 'sehir', baslik: 'Şehir Rehberleri', alt: 'Coğrafi işaretli lezzetler', fiil: 'Keşfet', git: '#/rehberler'}
  ];

  const sonlar = () => GM.durum.oku('ara-son', []) || [];
  const sonYaz = q => { if (q.length > 1) GM.durum.yaz('ara-son', [q, ...sonlar().filter(x => GM.katla(x) !== GM.katla(q))].slice(0, SON_EN)); };

  // ---------- Dizin: ilk aramada bir kez kurulur ----------
  const katIkon = ad => (X().lezzetKategori || []).find(k => k.ad === ad)?.ikon || 'book-open';
  let dizin = null;
  const oge = (metinler, baslik, o) => ({m: GM.katla(metinler.filter(Boolean).join(' ')), a: GM.katla(baslik), baslik, ...o});
  const kur = () => ({
    mekan: (GMV.mekanlar || []).map(m => oge([m.ad, m.kategori, ...(m.mutfak || []), ...(m.konsept || []), m.il, m.ilce, m.semt], m.ad, {alt: [m.kategori, m.ilce || m.il].filter(Boolean).join(' · '), gorsel: m.kapak, ikon: 'mekan', git: `#/mekan/${m.slug}`})),
    etkinlik: (GMV.etkinlikler || []).map(e => oge([e.ad, e.tur, e.kategori, e.yer, e.il, e.ozet], e.ad, {alt: [e.tur, e.yer].filter(Boolean).join(' · '), gorsel: e.gorsel, ikon: 'etkinlik', git: `#/etkinlik/${e.slug}`})),
    lezzet: (GMV.lezzetler || []).map(l => oge([l.ad, l.kategori, ...l.etiket, l.ozet], l.ad, {alt: `${l.kategori} · ${l.sure}`, gorsel: l.gorsel, ikon: katIkon(l.kategori), git: `#/lezzet/${l.slug}`})),
    rota: (GMV.rotalar || []).map(r => oge([r.ad, r.tema, r.kalkis, r.varis, ...(r.iller || []).map(i => i.ad)], r.ad, {alt: [`${GM.sayi(Math.round(r.km))} km`, GM.sure(r.dk), r.tema].filter(Boolean).join(' · '), gorsel: GM.rotaKartVeri(r).gorsel || null, ikon: 'rota', git: `#/rota/${r.id}`})),
    rehber: (X().sehirler?.() || []).map(s => oge([s.ad, s.bolge, ...s.tescil.map(t => t.ad)], s.ad, {alt: [s.editor ? 'Editör rehberi' : s.bolge, s.mekan ? `${s.mekan} mekân` : null, s.tescil.length ? `${s.tescil.length} coğrafi işaret` : null].filter(Boolean).join(' · '), gorsel: s.gorsel, ikon: 'sehir', git: `#/rehber/${s.slug}`}))
  });
  const ara = q => {
    dizin ||= kur();
    const t = GM.katla(q).split(/\s+/).filter(Boolean), puan = x => (x.a.startsWith(t[0]) ? 3 : x.a.includes(` ${t[0]}`) ? 2 : x.a.includes(t[0]) ? 1 : 0);
    return Object.fromEntries(Object.entries(dizin).map(([tur, l]) => [tur, l.filter(x => t.every(p => x.m.includes(p))).sort((a, b) => puan(b) - puan(a))]));
  };

  // ---------- "Şunu mu demek istedin?" (Gastro arama.js oneri) ----------
  // Sözlük: dizindeki her başlığın tamamı ve 3+ harfli kelimeleri, popüler aramalar. Sorguya en yakın tek aday; uzaklık eşiği uzunluğun üçte biri.
  let sozluk = null;
  const sozlukKur = () => {
    dizin ||= kur();
    const l = new Map(), ekle = (k, goster) => { if (k.length >= 3 && !l.has(k)) l.set(k, goster); };
    [...POPULER(), ...Object.values(dizin).flat().map(x => x.baslik)].forEach(b => {
      ekle(GM.katla(b), b);
      b.split(/[\s()·,.:;?!'"“”‘’/–-]+/).forEach(w => ekle(GM.katla(w), w.toLocaleLowerCase('tr')));
    });
    return [...l];
  };
  const uzaklik = (a, b) => {
    const d = Array.from({length: b.length + 1}, (_, j) => j);
    for (let i = 1; i <= a.length; i++) { let onceki = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const g = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, onceki + (a[i - 1] === b[j - 1] ? 0 : 1)); onceki = g; } }
    return d[b.length];
  };
  const oneri = q => {
    const k = GM.katla(q).trim();
    if (k.length < 3) return '';
    sozluk ||= sozlukKur();
    let en = '', enD = Infinity;
    for (const [a, goster] of sozluk) { if (Math.abs(a.length - k.length) >= enD) continue; const d = uzaklik(k, a); if (d < enD) { enD = d; en = goster; } }
    return enD > 0 && enD <= Math.max(1, Math.floor(k.length / 3)) ? en : '';
  };

  // ---------- Parçalar ----------
  const satir = (x, q) => GM.satir({sol: GM.gorsel({src: x.gorsel, ikon: x.ikon}), baslik: x.baslik, baslikHtml: GM.vurguluEsles(x.baslik, q), alt: x.alt, git: x.git, attrs: 'data-sonuc', ok: false});
  const liste = (l, q) => GM.satirlar(l.map(x => satir(x, q)));
  const sekmeBar = (s, r) => GM.segment({ad: 'sekme', kaydir: true, etiket: 'Sonuç türü', secili: s.sekme, ogeler: SEKMELER.map(([deger, ad]) => ({ad, deger, sayi: deger === 'tumu' ? undefined : r[deger].length}))});
  const populerCipler = () => GM.cipler({ad: 'populer', serit: false, etiket: 'Popüler aramalar', ogeler: POPULER().map(x => ({metin: x, ikon: 'fire', veri: {eylem: 'terim', id: x}}))});
  const populer = () => GM.bolum({ic: false, baslik: 'Popüler aramalar', html: populerCipler()});
  // Öneri tek çip: soruyla aynı satırda (kural 2: sağı boş tek öğeli satır yok).
  const oneriBolum = s => { const o = oneri(s.q); return o ? `<div class="gm-sira">${GM.p('**Şunu mu demek istedin?**')}${GM.cip({metin: o, ikon: 'ara_', veri: {eylem: 'terim', id: o}})}</div>` : ''; };
  const say = m => GM.p(m, {meta: true, ton: 'ikincil'});
  const bosSonuc = (s, ad) => GM.listeBos({ikon: 'ara_', baslik: `“${s.q}” için sonuç yok`, metin: ad ? `Bu aramayla eşleşen **${ad}** yok. **Tümü** sekmesine ya da başka bir aramaya bakabilirsin.` : 'Farklı bir kelime dene: **mekân konsepti, mutfak, etkinlik adı** ya da bir lezzet başlığı.', eylem: {metin: ad ? 'Tümünü göster' : 'Yeni arama', tur: 'secondary', ikon: ad ? 'layer-group' : 'ara_', veri: {eylem: ad ? 'sekme-ac' : 'yeni-arama', id: 'tumu'}}});
  // Yuva düzeni: sonuç ve iskelet gm-ic içinde; açılış bölümleri GM.bolum (kendi kenar boşluğu). Kaydırmalı şeritler (GM.yatay) gm-yigin
  // ızgarasına konmaz: ızgara kolonu şerit genişliğine açılıp sayfayı yana taşırıyordu.
  const iskelet = () => `<div class="gm-ic">${GM.iskelet(5, 'satir')}</div>`;
  const sonuclar = s => {
    const r = ara(s.q), n = Object.values(r).reduce((t, l) => t + l.length, 0), bar = sekmeBar(s, r);
    if (!n) return `<div class="gm-ic gm-yigin">${bosSonuc(s)}<div class="gm-yigin-24">${oneriBolum(s)}${populer()}</div></div>`;
    if (s.sekme === 'tumu') {
      const gruplar = SEKMELER.slice(1).filter(([d]) => r[d].length).map(([d]) => GM.bolum({ic: false, baslik: GRUP_AD[d], eylem: r[d].length > GRUP_EN ? {html: GM.btn({metin: `Tümü (${GM.sayi(r[d].length)})`, tur: 'text', boyut: 'sm', veri: {eylem: 'sekme-ac', id: d}})} : null, html: liste(r[d].slice(0, GRUP_EN), s.q)}));
      return `<div class="gm-ic gm-yigin">${bar}${say(`**${GM.sayi(n)} sonuç** · “${s.q}” için`)}<div class="gm-yigin-24">${gruplar.join('')}</div></div>`;
    }
    const l = r[s.sekme], ad = GRUP_AD[s.sekme].toLocaleLowerCase('tr');
    if (!l.length) return `<div class="gm-ic gm-yigin">${bar}${bosSonuc(s, ad)}</div>`;
    return `<div class="gm-ic gm-yigin">${bar}${say(`**${GM.sayi(l.length)} sonuç** · ${GRUP_AD[s.sekme]}`)}<div data-ara-liste>${liste(l.slice(0, SAYFA), s.q)}</div></div>`;
  };
  const sonBolum = () => {
    const l = sonlar();
    if (!l.length) return '';
    return GM.bolum({baslik: 'Son aramaların', eylem: {html: GM.btn({metin: 'Temizle', tur: 'text', boyut: 'sm', veri: {eylem: 'son-temizle'}})}, html: GM.satirlar(l.map((x, i) => GM.satirKap({ikon: 'gecmis', baslik: x, veri: {eylem: 'terim', id: x}, ok: false}, GM.ikonBtn({ikon: 'kapat', etiket: `${x} aramasını sil`, veri: {eylem: 'son-sil', id: i}}))))});
  };
  // Açılış: son aramalar, popüler aramalar, keşif kısayolları, öne çıkan şehir rehberi ve en çok okunan yazılar (öneriler).
  const acilis = () => {
    const sehir = (X().sehirler?.() || []).find(x => x.editor), oku = X().lezzetOku || {};
    const yazilar = (GMV.lezzetler || []).filter(l => l.gorsel).sort((a, b) => (oku[a.slug] ?? 9999) - (oku[b.slug] ?? 9999)).slice(0, 6);
    return `${sonBolum()}${GM.bolum({baslik: 'Popüler aramalar', html: populerCipler()})}${GM.bolum({baslik: 'Keşfet', html: GM.modulIzgara(KESIF.map(x => GM.modulKart(x)))})}`
      + (yazilar.length ? GM.bolum({baslik: 'En çok okunan yazılar', eylem: 'Tümü', git: '#/lezzetler?siralama=populer', html: GM.yatay(yazilar.map(l => GM.icerikKart({gorsel: l.gorsel, kategori: (X().lezzetKategori || []).find(k => k.ad === l.kategori)?.kisa || l.kategori, baslik: l.ad, meta: l.sure, git: `#/lezzet/${l.slug}`, sinif: 'gm-ka-puf'})))}) : '')
      + (sehir ? GM.bolum({baslik: 'Şehir rehberi', eylem: 'Tümü', git: '#/rehberler', html: GM.seckiKapak({gorsel: sehir.gorsel, rozet: {ikon: 'rehber', metin: 'Editör rehberi'}, baslik: sehir.ad, alt: `<b>${GM.sayi(sehir.mekan)}</b> mekân · <b>${sehir.ilce}</b> ilçe · <b>${sehir.tescil.length}</b> coğrafi işaret`, git: `#/rehber/${sehir.slug}`})}) : '')
;
  };
  const govde = s => (s.yaziyor ? iskelet() : s.q ? sonuclar(s) : acilis());

  let hataGosterildi = false;
  GM.ekran('ara', {
    tur: 'alt', baslik: 'Ara', iskelet: 'liste', cevrimici: true,
    bos: {ikon: 'ara_', baslik: 'Sonuç yok', metin: 'Aradığını bulamadık. **Farklı bir kelime** dene: mekân, mutfak, etkinlik ya da lezzet.', eylem: {metin: 'Yeni arama', ikon: 'ara_', yerine: '#/ara'}},
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(r => setTimeout(r, GM.azHareket() ? 0 : GM.TK.motion.fast));
    },
    ciz: ctx => {
      if (!ctx.s) {
        const h = ctx.sorgu.hal, q = h === 'sonuc-yok' ? 'zeytn' : h === 'yaziyor' ? (ctx.sorgu.q || 'Urla') : ctx.sorgu.q || '';
        ctx.s = {q, sekme: SEKMELER.some(([d]) => d === ctx.sorgu.sekme) ? ctx.sorgu.sekme : 'tumu', yaziyor: h === 'yaziyor'};
      }
      const s = ctx.s;
      return `<div class="gm-ic">${GM.arama({ad: 'q', yer: 'Mekân, etkinlik, lezzet ya da rota ara', deger: s.q, sonuc: false})}</div><div data-yuva="govde">${govde(s)}</div>`;
    },
    sonra: (kok, ctx) => {
      const s = ctx.s, yer = kok.querySelector('[data-yuva="govde"]'), girdi = kok.querySelector('.gm-arama input');
      if (!yer || !girdi) return null;
      let io = null, zaman = 0;
      // Sekme şeridi yeniden çizilince kaydırması korunur; seçili sekme görünmüyorsa yalnız şerit kaydırılır (sayfa kaymaz).
      const sekmeGoster = x => {
        const sg = yer.querySelector('.gm-seg'); if (!sg) return;
        sg.scrollLeft = x;
        const c = sg.querySelector('[aria-selected=true]'); if (!c) return;
        const r = sg.getBoundingClientRect(), b = c.getBoundingClientRect();
        if (b.left < r.left || b.right > r.right) sg.scrollLeft += b.left - r.left - (sg.clientWidth - c.offsetWidth) / 2;
      };
      // Tür sekmesinde sonsuz kaydırma: ilk 20 çizili, sonrakiler 20'şer; sonda "Hepsi bu kadar · N sonuç".
      const sonsuz = () => {
        io?.disconnect(); io = null;
        const kap = yer.querySelector('[data-ara-liste] > .gm-satirlar');
        if (kap && s.sekme !== 'tumu') io = GM.sonsuzListe(kap, ara(s.q)[s.sekme], x => satir(x, s.q), {sayfa: SAYFA, birim: 'sonuç'});
      };
      const ciz = () => { const x = yer.querySelector('.gm-seg')?.scrollLeft || 0; io?.disconnect(); yer.innerHTML = govde(s); sekmeGoster(x); sonsuz(); };
      const girdiYaz = q => { girdi.value = q; girdi.closest('.gm-girdi')?.classList.toggle('has-text', !!q); };
      const sorgula = q => { s.q = q; s.sekme = 'tumu'; s.yaziyor = false; girdiYaz(q); ciz(); };
      // Yazarken: yuva hemen iskelete geçer, 250 ms sonra sonuç (yeni sorguda sekme Tümü'ye döner).
      const yazildi = () => {
        clearTimeout(zaman);
        const q = girdi.value.trim();
        if (!q) { s.q = ''; s.yaziyor = false; s.sekme = 'tumu'; ciz(); return; }
        if (!s.yaziyor) { s.yaziyor = true; ciz(); }
        zaman = setTimeout(() => { s.q = girdi.value.trim(); s.yaziyor = false; s.sekme = 'tumu'; ciz(); }, GM.TK.motion.oneri.inputDebounce);
      };
      const tus = ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); clearTimeout(zaman); s.q = girdi.value.trim(); s.yaziyor = false; sonYaz(s.q); ciz(); girdi.blur(); };
      // Sonuç seçilince arama geçmişe yazılır; yönlendirmeyi satırın kendi data-git'i yapar.
      const secildi = ev => { if (s.q && ev.target.closest('[data-sonuc]')) sonYaz(s.q); };
      girdi.addEventListener('input', yazildi);
      girdi.addEventListener('keydown', tus);
      yer.addEventListener('click', secildi, true);
      sekmeGoster(0); sonsuz();
      // ?hal=yaziyor: iskelet kare için yerinde kalır; başka durumda boş açılışta klavye odağı.
      const odak = setTimeout(() => { if (!s.q) girdi.focus({preventScroll: true}); }, GM.azHareket() ? 0 : GM.TK.motion.page);
      const baglar = [
        GM.on(kok, 'sekme', v => { s.sekme = v; ciz(); }),
        GM.eylem(kok, 'sekme-ac', el => { s.sekme = el.dataset.id; ciz(); kok.querySelector('.gm-kaydir').scrollTop = 0; }),
        GM.eylem(kok, 'terim', el => { sonYaz(el.dataset.id); sorgula(el.dataset.id); }),
        GM.eylem(kok, 'yeni-arama', () => { sorgula(''); girdi.focus(); }),
        GM.eylem(kok, 'son-sil', el => { GM.durum.yaz('ara-son', sonlar().filter((_, i) => i !== +el.dataset.id)); ciz(); }),
        GM.eylem(kok, 'son-temizle', () => { GM.durum.yaz('ara-son', []); ciz(); GM.toast('Son aramalar **temizlendi**', {ikon: 'gecmis'}); })
      ];
      // Temizle (×) düğmesi input olayı atar → açılış.
      return () => {
        clearTimeout(zaman); clearTimeout(odak); io?.disconnect();
        girdi.removeEventListener('input', yazildi); girdi.removeEventListener('keydown', tus); yer.removeEventListener('click', secildi, true);
        baglar.forEach(c => c());
      };
    }
  });
})();
