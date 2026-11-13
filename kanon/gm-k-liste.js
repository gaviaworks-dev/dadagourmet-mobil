/* Mekân listesi parçaları (ekranlar/mekanlar.js: mekanlar-a, -b, -c). Gastro/Diet'te karşılığı olmayan Gourmet liste parçaları; her biri en yakın kanon ailesinden türer, satır başı yorumda yazılı.
   Veri: GMV.mekanlar[].f = web süzgeç değerleri (GMV.mekanSecenek[grup][].deger, web sayılarıyla birebir). Puan, yorum, görüntülenme uydurulmaz.
   API: GM.MEKAN_GRUPLAR · GM.MEKAN_SIRALA · GM.mekanSuz · GM.mekanSirala · GM.filtreSay · GM.mekanFiltreSheet · GM.konumSecici · GM.konumSheet · GM.konumYaz
        GM.kaydetBagla · GM.cekmece · GM.cekmeceDurak · GM.haritaArama · GM.yuzenDugme · GM.aracSutun · GM.haritaSec · GM.rehberManset · GM.mekanEditoryal · GM.haritaKartlar */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, at = GM.at, liste = (...a) => a.filter(Boolean).join(' ');
  const SEC = () => window.GMV?.mekanSecenek || {};
  const bg = src => (src ? ` style="background-image:url('${esc(src)}')"` : '');

  // ---------- Süzgeç ve sıralama (veri katmanı; Flutter'da depo karşılığı) ----------
  // Web süzgeç grupları sırasıyla (docs/WEB-ENVANTERI.md §2.4); konum üç kademe (şehir, ilçe, semt), ülke tek (Türkiye).
  GM.MEKAN_GRUPLAR = [
    ['il', 'Şehir', 'sehir'], ['ilce', 'İlçe', 'pin'], ['semt', 'Semt', 'durak'],
    ['kategori', 'Mekân kategorisi', 'mekan'], ['konsept', 'Mekân konsepti', 'katman'], ['mutfak', 'Mutfak türü', 'lezzet'],
    ['vesile', 'Deneyim ve kullanım amacı', 'kisi'], ['fiyat', 'Fiyat aralığı', 'fiyat'], ['puan', 'Puan ve değerlendirme', 'yildiz'],
    ['hizmet', 'Hizmet ve özellikler', 'onay'], ['beslenme', 'Beslenme tercihleri', 'vegan'], ['ulasim', 'Ulaşım ve erişilebilirlik', 'engelsiz'],
    ['acik', 'Açık olma durumu', 'saat'], ['seckiler', 'Dada Seçkileri', 'puanDada']
  ];
  const ilAd = d => (SEC().il || []).find(x => x.deger === d)?.ad || d;
  const ilceAd = d => (SEC().ilce || []).find(x => x.deger === d)?.ad || d;
  const etiket = (g, x) => (g === 'ilce' ? `${x.ad}, ${ilAd(x.il)}` : g === 'semt' ? `${x.ad}, ${ilceAd(x.ilce)}` : x.ad);
  // Süzgeç sheet'i grupları: seçenek sayısı web sayısıdır (veriyle birebir); çok kalabalık konum grupları sayıya göre sıralanır.
  GM.mekanFiltreGruplar = () => GM.MEKAN_GRUPLAR.map(([ad, baslik, ikon]) => ({ad, baslik, ikon, ogeler: [...(SEC()[ad] || [])].sort((a, b) => (['il', 'ilce', 'semt'].includes(ad) ? b.sayi - a.sayi : 0)).map(x => ({metin: etiket(ad, x), deger: x.deger, sayi: x.sayi}))})).filter(g => g.ogeler.length);
  // Sıralama (web 8 seçenek). Puan ve yorum verisi yokken sıra Önerilen'e eşittir (web davranışı); En Yakın konum yoksa Önerilen'e düşer.
  GM.MEKAN_SIRALA = [['onerilen', 'Önerilen', 'bul'], ['puan', 'En yüksek puan', 'yildiz'], ['yakin', 'En yakın', 'konum'], ['yeni', 'En yeni', 'takvim'], ['yorum', 'En çok yorumlanan', 'sohbet'], ['fiyat', 'Fiyat: düşükten yükseğe', 'fiyat'], ['acik', 'Şimdi açık', 'saat'], ['rezervasyon', 'Rezervasyon uygunluğu', 'rezervasyon']];
  // secili: {grup: [deger]}; grup içi VEYA, gruplar arası VE. q: ad, kategori, mutfak, konsept, yer içinde (Türkçe katlamalı).
  GM.mekanSuz = (l, secili = {}, q = '') => {
    const k = GM.katla(q.trim()), aktif = Object.entries(secili).filter(([, v]) => v?.length);
    return l.filter(m => aktif.every(([g, v]) => v.some(d => (m.f?.[g] || []).includes(String(d))))
      && (!k || GM.katla([m.ad, m.kategori, ...m.mutfak, ...m.konsept, m.semt, m.ilce, m.il].join(' ')).includes(k)));
  };
  const medyaNo = m => +((m.kapak || '').match(/(\d+)-400/) || [])[1] || 0;
  GM.mekanSirala = (l, tur = 'onerilen', o = {}) => {
    const r = [...l];
    if (tur === 'yakin' && o.konum) return r.sort((a, b) => GM.km(o.konum, [a.lng, a.lat]) - GM.km(o.konum, [b.lng, b.lat]));
    if (tur === 'yeni') return r.sort((a, b) => medyaNo(b) - medyaNo(a));
    if (tur === 'fiyat') return r.sort((a, b) => (a.fiyat || 9) - (b.fiyat || 9));
    if (tur === 'acik') return r.filter(m => m.f?.acik?.includes('simdi'));
    if (tur === 'rezervasyon') return r.filter(m => m.rezervasyon);
    return r;
  };
  GM.filtreSay = secili => Object.values(secili || {}).reduce((s, v) => s + (v?.length || 0), 0);
  // GM.filtreSheet sarmalı: web gruplarının tamamı; alt düğme canlı sonuç sayısını yazar ("48 mekânı göster").
  GM.mekanFiltreSheet = (o = {}) => {
    const say = d => GM.mekanSuz(o.kaynak || GMV.mekanlar, d, o.q || '').length;
    const yaz = d => { const b = [...document.querySelectorAll('[data-filtre-uygula]')].pop(); if (!b) return; const n = say(d); b.querySelector('span').textContent = n ? `${GM.sayi(n)} mekânı göster` : 'Sonuç yok'; b.disabled = !n; };
    return GM.filtreSheet({baslik: 'Filtrele', gruplar: GM.mekanFiltreGruplar(), secili: o.secili, degisti: d => requestAnimationFrame(() => yaz(d)), uygula: d => o.uygula?.(Object.fromEntries(Object.entries(d).filter(([, v]) => v.length)))});
  };

  // ---------- Konum hiyerarşisi: ülke → şehir → ilçe → semt ----------
  // Konum seçici: GM.planlayici kapsülünden türer (tek dokunuşla sheet açan seçim alanı); kırıntı metni + sayı. o: {konum:{il, ilce, semt}, sayi, yuzen}
  GM.konumYaz = (k = {}) => ['Türkiye', k.il && ilAd(k.il), k.ilce && ilceAd(k.ilce), k.semt && (SEC().semt || []).find(x => x.deger === k.semt)?.ad, k.ek].filter(Boolean);
  GM.konumSecici = (o = {}) => { const p = GM.konumYaz(o.konum); return `<button type="button" class="${liste('gm-kl-konum', o.yuzen && 'is-yuzen', o.tur === 'etiket' && 'is-etiket', o.sinif)}" data-eylem="konum" aria-haspopup="dialog" aria-label="${esc(`Konum: ${p.join(', ')}. Değiştir`)}"><span class="gm-kl-konum-ikon">${ik('pin')}</span><span class="gm-kl-konum-yol">${p.map((x, i) => `<span${i === p.length - 1 ? ' class="is-son"' : ''}>${esc(x)}</span>`).join(ik('satirOk', 'gm-kl-konum-ayrac'))}</span>${o.sayi != null ? `<small class="gm-kl-konum-sayi">${esc(GM.sayi(o.sayi))}</small>` : ''}${ik('ac', 'gm-kl-konum-ok')}</button>`; };
  // Konum sheet'i: GM.siralaSheet seçim listesinden türer (gm-choice satırı), kademeli iner; üstte kırıntı, ilk satır "Tüm X". sec({il, ilce, semt}).
  GM.konumSheet = (o = {}) => {
    const S = SEC(); let yol = {...(o.secili || {})};
    if (yol.semt) yol = {il: yol.il, ilce: yol.ilce, semt: yol.semt};
    let gor = {il: yol.il || null, ilce: yol.ilce || null};
    const satir = (x, secili, alt) => `<button type="button" class="gm-choice gm-kl-konum-satir" role="radio" aria-checked="${!!secili}" ${x.at}><span class="gm-choice__label">${esc(x.ad)}</span><span class="gm-option__count">${esc(GM.sayi(x.sayi))}</span>${alt ? ik('satirOk', 'gm-kl-konum-in') : ik('onay')}</button>`;
    const govde = () => {
      const kademe = gor.ilce ? 'semt' : gor.il ? 'ilce' : 'il';
      const ust = kademe === 'il' ? {ad: 'Tüm Türkiye', sayi: GMV.mekanlar.length, k: {}} : kademe === 'ilce' ? {ad: `Tüm ${ilAd(gor.il)}`, sayi: S.il.find(x => x.deger === gor.il)?.sayi, k: {il: gor.il}} : {ad: `Tüm ${ilceAd(gor.ilce)}`, sayi: S.ilce.find(x => x.deger === gor.ilce)?.sayi, k: {il: gor.il, ilce: gor.ilce}};
      const cocuk = (kademe === 'il' ? S.il : kademe === 'ilce' ? S.ilce.filter(x => x.il === gor.il) : S.semt.filter(x => x.ilce === gor.ilce)).slice().sort((a, b) => b.sayi - a.sayi);
      const altVar = x => kademe === 'il' ? S.ilce.some(y => y.il === x.deger) : kademe === 'ilce' ? S.semt.some(y => y.ilce === x.deger) : false;
      const esit = (a, b) => (a.il || '') === (b.il || '') && (a.ilce || '') === (b.ilce || '') && (a.semt || '') === (b.semt || '');
      const kirinti = [['Türkiye', {}], gor.il && [ilAd(gor.il), {il: gor.il}], gor.ilce && [ilceAd(gor.ilce), {il: gor.il, ilce: gor.ilce}]].filter(Boolean);
      return `<nav class="gm-kl-kirinti" aria-label="Konum kademesi">${kirinti.map(([a, k], i) => (i === kirinti.length - 1 ? `<b aria-current="location">${esc(a)}</b>` : `<button type="button" data-kirinti='${esc(JSON.stringify(k))}'>${esc(a)}</button>${ik('satirOk')}`)).join('')}</nav><div class="gm-choice-list" role="radiogroup" aria-label="Konum">${satir({ad: ust.ad, sayi: ust.sayi, at: `data-konum-sec='${esc(JSON.stringify(ust.k))}'`}, esit(yol, ust.k))}${cocuk.map(x => { const k = kademe === 'il' ? {il: x.deger} : kademe === 'ilce' ? {il: gor.il, ilce: x.deger} : {il: gor.il, ilce: gor.ilce, semt: x.deger}; const a = altVar(x); return satir({ad: x.ad, sayi: x.sayi, at: a ? `data-konum-in='${esc(JSON.stringify(k))}'` : `data-konum-sec='${esc(JSON.stringify(k))}'`}, !a && esit(yol, k), a); }).join('')}</div>`;
    };
    return GM.sheet({baslik: 'Konum', tam: true, sinif: 'gm-kl-konum-sheet', html: `<div class="gm-kl-konum-govde">${govde()}</div>`, sonra: (k, h) => {
      const g = k.querySelector('.gm-kl-konum-govde');
      k.addEventListener('click', ev => {
        const s = ev.target.closest('[data-konum-sec]'), i = ev.target.closest('[data-konum-in]'), c = ev.target.closest('[data-kirinti]');
        if (s) { o.sec?.(JSON.parse(s.dataset.konumSec)); h.kapat(); return; }
        const hedef = i ? JSON.parse(i.dataset.konumIn) : c ? JSON.parse(c.dataset.kirinti) : null;
        if (hedef) { gor = {il: hedef.il || null, ilce: hedef.ilce || null}; g.innerHTML = govde(); g.closest('.gm-sheet-govde').scrollTop = 0; }
      });
    }});
  };

  // ---------- Kaydet (favori) ----------
  // Kart kaydet düğmesi (gm-save, kanon kart ailesi) bağlamı: misafirde GM.uyeDuvar açılır, kart değişmez; üyede kanon geçişi + GM.durum'da saklama.
  GM.kayitliMekanlar = () => new Set(GM.durum.oku('favori-mekan', []) || []);
  GM.kaydetBagla = kok => {
    const h = ev => {
      const b = ev.target.closest('.gm-save[data-eylem="kaydet"]'); if (!b || !kok.contains(b)) return;
      if (!GM.uye()) { ev.preventDefault(); ev.stopPropagation(); GM.uyeDuvar({baslik: 'Kaydetmek için üye ol', metin: GM.UYE_KILIT.favoriler.metin}); return; }
      const s = GM.kayitliMekanlar(), id = b.dataset.id; s.has(id) ? s.delete(id) : s.add(id); GM.durum.yaz('favori-mekan', [...s]);
    };
    kok.addEventListener('click', h); return () => kok.removeEventListener('click', h);
  };

  // ---------- Harita üstü liste: 3 duraklı sürüklenebilir çekmece ----------
  // GM.sheet'ten türer (tutamak, sürükle-bırak kuralı, r-sheet, sh-lg) ama katman değil ekran içidir; duraklar kapali · yarim · tam.
  // o: {ad, sayi, birim, alt, eylem (başlık: sayı + alt satır + sağda düğme) ya da bas (hazır html), html (liste), durak}. Değişim: gm-degisim {ad, deger: durak}. Programla: GM.cekmeceDurak(el, durak).
  GM.cekmece = (o = {}) => { const bas = o.bas ?? (o.sayi != null ? `<p class="gm-kl-cekmece-ozet"><b>${esc(GM.sayi(o.sayi))} ${esc(o.birim || 'sonuç')}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</p>${o.eylem || ''}` : ''); return `<section class="${liste('gm-kl-cekmece', o.sinif)}" data-cekmece="${esc(o.ad || 'cekmece')}" data-durak="${esc(o.durak || 'yarim')}" aria-label="${esc(o.etiket || 'Liste')}"><div class="gm-kl-cekmece-tut" data-cekmece-tut><span class="gm-tutamak" aria-hidden="true"></span>${bas ? `<div class="gm-kl-cekmece-bas">${bas}</div>` : ''}</div><div class="gm-kl-cekmece-govde">${o.html || ''}</div></section>`; };
  const DURAK = ['kapali', 'yarim', 'tam'];
  GM.cekmeceDurak = (el, d) => { if (!el || !DURAK.includes(d) || el.dataset.durak === d) return; el.dataset.durak = d; if (d !== 'tam') el.querySelector('.gm-kl-cekmece-govde').scrollTop = 0; GM.degisim(el, el.dataset.cekmece, d); };
  // Sürükleme öteleme uzayında: tam 0, yarım ve kapalı görünür yüksekliği CSS'teki kayıtlı uzunluklardan (--gm-kl-yarim-h, --gm-kl-kapali-h) okunur.
  const ty = el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42;
  const hedefler = el => { const cs = getComputedStyle(el), h = el.offsetHeight, px = n => parseFloat(cs.getPropertyValue(n)) || 0; return {tam: 0, yarim: h - px('--gm-kl-yarim-h'), kapali: h - px('--gm-kl-kapali-h')}; };
  let surukle = null;
  document.addEventListener('pointerdown', ev => {
    const el = ev.target.closest?.('.gm-kl-cekmece'); if (!el || ev.button > 0) return;
    const tut = ev.target.closest('[data-cekmece-tut]'), govde = !tut && el.dataset.durak !== 'tam';
    if (!tut && !govde) return;
    surukle = {el, id: ev.pointerId, sy: ev.clientY, t: performance.now(), t0: ty(el), oynadi: false};
  });
  document.addEventListener('pointermove', ev => {
    const s = surukle; if (!s || ev.pointerId !== s.id) return;
    const dy = ev.clientY - s.sy;
    if (!s.oynadi) { if (Math.abs(dy) < 6) return; s.oynadi = true; s.el.classList.add('is-surukle'); try { s.el.setPointerCapture(s.id); } catch { /* yok */ } }
    const h = hedefler(s.el);
    s.el.style.transform = `translateY(${Math.max(0, Math.min(h.kapali, s.t0 + dy))}px)`;
  });
  const birak = ev => {
    const s = surukle; if (!s || ev.pointerId !== s.id) return; surukle = null;
    if (!s.oynadi) return;
    const el = s.el, dy = ev.clientY - s.sy, v = dy / Math.max(1, performance.now() - s.t), y = s.t0 + dy, h = hedefler(el);
    el.classList.remove('is-surukle'); el.style.transform = '';
    // Bırakılan konuma en yakın durak; hızlı fırlatma yönünde bir durak ilerler (GM.sheet: v > .7 kapatır).
    let d = DURAK.reduce((a, b) => (Math.abs(h[b] - y) < Math.abs(h[a] - y) ? b : a), 'yarim');
    const i = DURAK.indexOf(el.dataset.durak);
    if (Math.abs(v) > .6) d = DURAK[Math.max(0, Math.min(2, i + (v > 0 ? -1 : 1)))];
    if (el.dataset.durak === d) { el.dataset.durak = ''; el.dataset.durak = d; } else GM.cekmeceDurak(el, d);
    const bastir = e => { e.stopPropagation(); e.preventDefault(); }; el.addEventListener('click', bastir, {capture: true, once: true}); setTimeout(() => el.removeEventListener('click', bastir, {capture: true}), 60);
  };
  document.addEventListener('pointerup', birak); document.addEventListener('pointercancel', birak);

  // ---------- Harita üstü yüzen denetimler ----------
  // Harita arama kapsülü (o.filtre:false → süzgeç düğmesiz): GM.listeArac'tan türer (aynı arama girdisi ve rozetli süzgeç düğmesi; GM.filtreSayiYaz bunu da günceller), başında geri düğmesi, kâğıt + sh-md.
  GM.haritaArama = (o = {}) => `<div class="${liste('gm-kl-hara', o.sinif)}">${o.geri === false ? '' : `<button type="button" class="gm-ibtn gm-kl-hara-geri" aria-label="Geri" data-geri>${ik('geri')}</button>`}${GM.arama({yer: o.yer || 'Ara', ad: o.ad, deger: o.deger, sonuc: false, sonEk: o.filtre === false ? '' : `<button class="gm-liste-search-filter${o.filtreSayi ? ' is-active' : ''}" type="button" aria-haspopup="dialog" aria-label="${o.filtreSayi ? `Filtrele, ${esc(o.filtreSayi)} filtre etkin` : 'Filtrele'}" data-eylem="filtre">${ik('filtre')}<span class="gm-badge gm-liste-search-filter__badge">${o.filtreSayi ? esc(o.filtreSayi) : ''}</span></button>`})}</div>`;
  // Yüzen geçiş düğmesi (AllTrails "Map"): GM.btn birincil gövdesinden türer, hap biçimli, sh-lg; ekranda tek ve alt ortada. o: {metin, ikon, veri, git}
  // o.yer: 'sabit' (kaydırılan listenin altında yapışık), 'serbest' (harita düzeninde kendi yuvası). Yoksa yalnız düğme.
  GM.yuzenDugme = (o = {}) => { const b = `<button type="button" class="${liste('gm-kl-yuzen', o.sinif)}"${at(o)}>${ik(o.ikon || 'harita')}<span>${esc(o.metin)}</span>${o.sayi != null ? `<b class="gm-kl-yuzen-sayi">${esc(o.sayi)}</b>` : ''}</button>`; return o.yer ? `<div class="gm-kl-yuzen-yer is-${esc(o.yer)}" data-yuzen>${b}</div>` : b; };
  // Araç sütunu (Watch Duty sağ kenar): GM.harita kontrol kümesinden (gm-harita-kontrol) türer; kâğıt kutu düğmeler, altında kısa ad, isteğe bağlı rozet. l: [{ikon, ad, veri, sayi, secili}]
  GM.aracSutun = (l = [], o = {}) => `<div class="${liste('gm-kl-arac', o.sinif)}" role="toolbar" aria-orientation="vertical" aria-label="${esc(o.etiket || 'Harita araçları')}">${l.map(x => `<button type="button" class="gm-kl-arac-btn"${x.secili != null ? ` aria-pressed="${!!x.secili}"` : ''}${at({veri: x.veri, git: x.git, attrs: x.attrs})} aria-label="${esc(x.etiket || x.ad)}"><span class="gm-kl-arac-ikon">${ik(x.ikon)}${x.sayi ? `<b class="gm-badge">${esc(x.sayi)}</b>` : ''}</span><small>${esc(x.ad)}</small></button>`).join('')}</div>`;
  // Haritada pin seç: GM.haritaOdak'tan türer; pin kümedeyse yakınlaşır, küme yeniden kurulunca seçimi korur.
  GM.haritaSec = (el, id, o = {}) => {
    if (!el) return; const m = el._harita, veri = JSON.parse(el.dataset.harita), p = (veri.pinler || []).find(x => x.id === id);
    const isaretle = () => el.querySelectorAll('.gm-harita-isaret .gm-pin, .gm-harita-ml .gm-pin').forEach(x => x.classList.toggle('is-secili', x.dataset.pin === id));
    isaretle();
    if (!m || !p) return;
    // easeTo önceki hareketi durdururken moveend atar: seçim dinleyicisi yeni hareket başladıktan sonra bağlanır.
    m.easeTo({center: [p.lng, p.lat], zoom: Math.max(m.getZoom(), o.zoom || 13), offset: o.kaydir || [0, 0], duration: GM.azHareket() ? 0 : GM.TK.motion.page * 2});
    m.once('moveend', () => setTimeout(isaretle, 0));
  };

  // Küme dokunuşu: GM.harita kümesi (GM.kume) dokununca o noktaya iki buçuk kademe yakınlaşır (Google Maps); şema kipinde etkisiz.
  document.addEventListener('click', ev => {
    const k = ev.target.closest?.('.gm-harita-ml .gm-kume'); if (!k) return;
    const el = k.closest('.gm-harita'), m = el?._harita; if (!m) return;
    const r = el.getBoundingClientRect(), q = k.getBoundingClientRect();
    m.easeTo({center: m.unproject([q.left + q.width / 2 - r.left, q.top + q.height / 2 - r.top]), zoom: Math.min(m.getZoom() + 2.5, 16), duration: GM.azHareket() ? 0 : GM.TK.motion.page * 2});
  });

  // ---------- Düzen kapları (ekran dosyası ham kap yazmasın) ----------
  // Harita ekranı: tam alan harita + üst kapsül/çip yuvası + araç sütunu + çekmece + seçili kart + alt yuva (kart şeridi) + yüzen düğme. o.alt: üst bar altında (alt ekran).
  GM.haritaEkran = (o = {}) => `<div class="${liste('gm-kl-hekran', o.altEkran && 'is-alt', o.sinif)}">${o.harita || ''}${o.ust ? `<div class="gm-kl-hekran-ust">${o.ust}</div>` : ''}${o.arac || ''}${o.cekmece || ''}${o.secim ? '<div class="gm-kl-hsecim" aria-live="polite"></div>' : ''}${o.alt ? `<div class="gm-kl-hekran-alt">${o.alt}</div>` : ''}${o.yuzen || ''}</div>`;
  // Harita üstü hızlı süzgeç şeridi: GM.cipler (çoklu) şerit kalıbı; başta isteğe bağlı öğe (konum seçici). o: {ad, on, ogeler, secili, etiket}
  GM.haritaCipSerit = (o = {}) => { const sec = [].concat(o.secili ?? []); return `<div class="gm-serit gm-kl-hizli" role="group" data-cip-grup="coklu" data-ad="${esc(o.ad || 'hizli')}" aria-label="${esc(o.etiket || 'Hızlı süzgeçler')}">${o.on || ''}${(o.ogeler || []).map(x => GM.cip({...x, secili: sec.includes(x.deger)})).join('')}</div>`; };
  // Satır listesi ve editoryal liste kabı: sonsuz kaydırma (GM.sonsuz) bu kaba ekler.
  GM.mekanSatirlar = (l = []) => `<div class="gm-kl-satirlar" data-liste>${l.join('')}</div>`;
  GM.editoryalListe = (l = []) => `<div class="gm-kl-ed-liste" data-liste>${l.join('')}</div>`;
  // Liste-v2 içerik kabı kubbesiz ekranda (araç bloğunun altı): gm-liste-icerik dolgusu.
  GM.listeGovde = html => `<div class="gm-liste-icerik" data-kl-sonuc>${html}</div>`;
  // Sonuç yuvası (süzgeç değişince yalnız bu bölüm yeniden çizilir), sonuç kabı (gm-liste-results aralığı), manşet yuvası.
  GM.sonucYuva = html => `<div data-kl-sonuc>${html}</div>`;
  GM.listeSonucKap = html => `<div class="gm-liste-results">${html}</div>`;
  GM.rehberMansetKap = html => `<div data-manset>${html}</div>`;
  // Koleksiyon sekmeleri (The Infatuation "Hit List / Top 25"): GM.segment kaydırmalı, gutter'lı şerit.
  GM.rehberSekme = (o = {}) => `<div class="gm-kl-koleksiyon">${GM.segment({kaydir: true, ...o})}</div>`;

  // ---------- Editoryal liste (son nesil) ----------
  // Rehber manşeti (The Infatuation "Hit List"): GM.kubbe metin dizgesinden türer, fotoğrafsız; üst etiket, display başlık, ince çizgiyle ayrılan özet satırı.
  GM.rehberManset = (o = {}) => `<header class="${liste('gm-kl-manset', o.sinif)}">${o.ust ? `<div class="gm-kl-manset-ust">${o.ust}</div>` : ''}${o.etiket ? `<span class="gm-t-label">${esc(o.etiket)}</span>` : ''}<h1 class="gm-t-display">${esc(o.baslik)}</h1>${o.metin ? `<p class="gm-kl-manset-metin">${GM.vurgu(o.metin)}</p>` : ''}${o.ozet?.length ? `<p class="gm-kl-manset-ozet gm-tek-satir">${o.ozet.map(x => `<span>${x}</span>`).join('<span class="gm-nokta" aria-hidden="true">·</span>')}</p>` : ''}</header>`;
  // Editoryal mekân kartı: GM.mekanKart (gm-card ailesi, aynı gm-save/açık rozeti) türevi; büyük foto (AllTrails) + büyük sıra numarası ve "İdeal" satırı (The Infatuation).
  GM.mekanEditoryal = (m, o = {}) => {
    const git = o.git || `#/mekan/${m.slug}`;
    // Yığılma kuralı (Görev 10): kategori etiketi foto üstünde rozet; altta sıra numarası yanında yalnız ad + tek meta satırı (yer · ₺ · açık · rota ya da rezervasyon). Tanıtım detayda.
    return `<article class="${liste('gm-card gm-kl-ed', o.secili && 'is-secili')}" data-mekan="${esc(m.slug)}"><div class="gm-card__media gm-kl-ed-medya"><a class="gm-card__visual" href="${esc(git)}" data-git="${esc(git)}" tabindex="-1" aria-label="${esc(m.ad)}">${m.kapakB || m.kapak ? `<span class="gm-photo"${bg(m.kapakB || m.kapak)}></span>` : `<span class="gm-photo is-yok" aria-hidden="true">${ik('mekan')}</span>`}</a>${GM.mekanRozet(m)}<button class="gm-save gm-mk-kaydet" type="button" aria-label="Favorilere ekle" aria-pressed="${!!o.kayitli}" data-eylem="kaydet" data-id="${esc(m.slug)}">${ik('favori')}</button></div><a class="gm-kl-ed-govde" href="${esc(git)}" data-git="${esc(git)}">${o.sira != null ? `<span class="gm-kl-ed-sira" aria-label="${esc(o.sira)}. sıra">${esc(String(o.sira).padStart(2, '0'))}</span>` : ''}<span class="gm-kl-ed-metin"><h3 class="gm-kl-ed-ad gm-kirp-1">${esc(m.ad)}</h3>${GM.mekanMetaSatir([GM.mekanPuan(m), GM.mekanYer(m, true), GM.fiyat(m.fiyat), GM.mekanDurumGenis(m, o)])}</span></a></article>`;
  };

  // Harita kart şeridi (harita görünümünde pinle senkron): GM.yatay şeridinden türer, kart genişliği sabit, ortaya oturur. l: GM.mekanKart({tur:'harita'}) dizgeleri
  GM.haritaKartlar = (l = [], o = {}) => `<div class="${liste('gm-kl-hkart', o.sinif)}" data-hkart tabindex="0" aria-label="${esc(o.etiket || 'Haritadaki mekânlar, yatay kaydır')}">${l.join('')}</div>`;
})();

/* Referanslı liste alternatifleri (ekranlar/liste-ref.js: ref-liste-1..4) için parçalar. Her biri en yakın kanon ailesinden türer, satır başı yorumda yazılı.
   API: GM.aralik · GM.filtreHap · GM.secimSheet · GM.mekanForkKart · GM.kisiZaman · GM.mekanSlotSatir · GM.listem · GM.kiyasla · GM.listeSiraSatir · GM.listeOneriSatir · GM.etiketPanel · GM.etiketBaslik · GM.yapiskanArac */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, at = GM.at, liste = (...a) => a.filter(Boolean).join(' ');
  const bg = src => (src ? ` style="background-image:url('${esc(src)}')"` : '');
  const foto = (src, ikon = 'mekan') => (src ? `<span class="gm-photo"${bg(src)}></span>` : `<span class="gm-photo is-yok" aria-hidden="true">${ik(ikon)}</span>`);
  const kaydet = (m, o, kutu) => `<button class="gm-save${kutu ? ' gm-mk-kaydet' : ''}" type="button" aria-label="Favorilere ekle" aria-pressed="${!!o.kayitli}" data-eylem="kaydet" data-id="${esc(m.slug)}">${ik('favori')}</button>`;
  const nokta = '<span class="gm-nokta" aria-hidden="true">·</span>';
  const FIYAT_AD = ['', 'Ekonomik', 'Orta', 'Üst orta', 'Lüks'];
  GM.fiyatAd = n => FIYAT_AD[+n] || '';

  // ---------- Basamaklı kaydırıcı (TheFork "Average rating / price") ----------
  // GM.slider ailesinden türer (aynı gm-degisim, role slider) ama cetvelsiz ve kısa: iz + dolgu + basamak noktaları + altta etiketler. o: {ad, etiket, ogeler:[{deger, metin, kisa}], secili, yardim}
  GM.aralik = (o = {}) => { const l = o.ogeler || [], i = Math.max(0, l.findIndex(x => String(x.deger) === String(o.secili ?? l[0]?.deger))), n = Math.max(1, l.length - 1);
    return `<div class="${liste('gm-kl-aralik', o.sinif)}" data-aralik data-ad="${esc(o.ad || '')}" data-ogeler='${esc(JSON.stringify(l))}' style="--oran:${(i / n).toFixed(3)}"><div class="gm-kl-aralik-bas"><span class="gm-kl-aralik-ad">${esc(o.etiket || '')}</span><b data-aralik-deger>${esc(l[i]?.metin ?? '')}</b></div><input type="range" min="0" max="${n}" step="1" value="${i}" aria-label="${esc(o.etiket || o.ad || '')}" aria-valuetext="${esc(l[i]?.metin ?? '')}"><div class="gm-kl-aralik-olcek" aria-hidden="true">${l.map(x => `<span>${esc(x.kisa ?? x.metin)}</span>`).join('')}</div>${o.yardim ? `<p class="gm-kl-aralik-yardim">${GM.vurgu(o.yardim)}</p>` : ''}</div>`; };
  document.addEventListener('input', ev => {
    const i = ev.target; if (!i.matches?.('[data-aralik] input[type=range]')) return;
    const k = i.closest('[data-aralik]'), l = JSON.parse(k.dataset.ogeler), x = l[+i.value], n = Math.max(1, l.length - 1);
    k.style.setProperty('--oran', (+i.value / n).toFixed(3)); k.querySelector('[data-aralik-deger]').textContent = x.metin; i.setAttribute('aria-valuetext', x.metin);
    GM.degisim(k, k.dataset.ad, x.deger);
  });

  // ---------- Süzgeç hapları (TheFork "Filters / Cuisines / Price" hapları) ----------
  // GM.cip (gm-chip) gövdesinden türer: ikon + ad + (etkin sayı) + aşağı ok; dokununca o grubun sheet'ini açar. o: {metin, ikon, sayi, secili, veri}
  GM.filtreHap = (o = {}) => `<button type="button" class="${liste('gm-chip gm-kl-hap', o.ana && 'is-ana', o.sinif)}" aria-pressed="${!!o.secili}" aria-haspopup="dialog"${at({veri: o.veri, etiket: o.etiket})}>${o.ikon ? ik(o.ikon) : ''}<span>${esc(o.metin)}</span>${o.sayi ? `<b class="gm-kl-hap-sayi">${esc(o.sayi)}</b>` : ''}${o.ok === false ? '' : ik('ac', 'gm-kl-hap-ok')}</button>`;
  // Yapışkan araç bloğu (kubbesiz ekranda üst barın altına yapışan kâğıt şerit): GM.listeArac'ın yapışma kuralından türer. html: arama, kapsül, hap şeridi
  GM.yapiskanArac = html => `<div class="gm-kl-yarac">${html}</div>`;

  // ---------- Bölümlü seçim sheet'i (TheFork "Filters") ----------
  // GM.filtreSheet'ten türer (aynı sabit ikili ayak, canlı sonuç sayısı) ama akordeon yerine alt alta bölümler; içerik ekranın çizdiği kanon kontrolleri (segment, çip, kaydırıcı, adımlayıcı).
  // o: {baslik, d (başlangıç durumu), bos (temizle sonrası durum), ciz: d => html, say: d => n, birim, eylem: n => metin, uygula: d => {}, tam}
  GM.secimSheet = (o = {}) => {
    const kopya = x => JSON.parse(JSON.stringify(x || {}));
    let d = kopya(o.d);
    return GM.sheet({baslik: o.baslik || 'Süzgeçler', tam: o.tam !== false, sinif: 'gm-kl-secim-sheet', html: `<div class="gm-kl-secim" data-secim-govde>${o.ciz(d)}</div>`, altBar: `<div class="gm-ikili">${GM.btn({metin: 'Temizle', tur: 'secondary', veri: {'secim-temizle': 1}})}${GM.btn({metin: 'Göster', veri: {'secim-uygula': 1}})}</div>`, sonra: (k, h) => {
      const g = k.querySelector('[data-secim-govde]');
      const yaz = () => { const b = k.querySelector('[data-secim-uygula]'); if (!o.say) return; const n = o.say(d); b.querySelector('span').textContent = o.eylem ? o.eylem(n) : n ? `${GM.sayi(n)} ${o.birim || 'sonuç'} göster` : 'Sonuç yok'; b.disabled = !n && !o.eylem; };
      k.addEventListener('gm-degisim', ev => { const {ad, deger} = ev.detail || {}; if (!ad) return; d[ad] = deger; o.degisti?.(d, ad, g); yaz(); });
      k.addEventListener('click', ev => {
        if (ev.target.closest('[data-secim-temizle]')) { d = kopya(o.bos); g.innerHTML = o.ciz(d); GM.segGosterge?.(g); yaz(); }
        else if (ev.target.closest('[data-secim-uygula]')) { o.uygula?.(d); h.kapat(); }
      });
      yaz();
    }});
  };

  // Bölüm (GM.secimSheet içinde): ikonlu başlık + kanon kontrolü; bölümler arası ince çizgi.
  GM.secimBolum = (o = {}) => `<section class="gm-kl-secim-bolum"><h3>${o.ikon ? ik(o.ikon) : ''}<span>${esc(o.baslik)}</span></h3>${o.html || ''}</section>`;

  // ---------- TheFork kartı ----------
  // GM.mekanKart (gm-card ailesi, aynı gm-save ve açık rozeti) türevi: geniş foto (16:10), foto üstünde puan kapsülü, altında ad, yer, fiyat seviyesi adıyla, rezervasyon rozeti.
  // Geniş kart durumu: açık/kapalı + rota etiketi (varsa) ya da rezervasyon; tek meta satırında.
  GM.mekanDurumGenis = (m, o = {}) => (o.rota ? [GM.acikDurum(m.acik), GM.rotaEtiket(o.rota, {kisa: true})] : GM.mekanDurum(m, {}, {genis: true}));
  GM.mekanForkKart = (m, o = {}) => { const git = o.git || `#/mekan/${m.slug}`;
    // Yığılma kuralı (Görev 10): kategori etiketi foto üstünde rozet; puan kapsülü yalnız puan varsa; altta ad + tek meta satırı (yer · ₺ · açık · rota ya da rezervasyon).
    return `<article class="gm-card gm-kl-tf" data-mekan="${esc(m.slug)}"><div class="gm-kl-tf-medya"><a class="gm-card__visual" href="${esc(git)}" data-git="${esc(git)}" tabindex="-1" aria-label="${esc(m.ad)}">${foto(m.kapakB || m.kapak)}</a>${GM.mekanRozet(m)}${kaydet(m, o, true)}${m.puan != null ? `<span class="gm-kl-tf-puan">${GM.puan({deger: m.puan})}</span>` : ''}</div><a class="gm-kl-tf-govde" href="${esc(git)}" data-git="${esc(git)}"><h3 class="gm-kl-tf-ad gm-kirp-1">${esc(m.ad)}</h3>${GM.mekanMetaSatir([GM.mekanYer(m, true), GM.fiyat(m.fiyat), GM.mekanDurumGenis(m, o)])}</a></article>`; };

  // ---------- OpenTable: kişi · tarih · saat kapsülü ve talep saatli satır ----------
  // Kapsül: GM.planlayici kapsülünden türer (tek dokunuşla sheet açan seçim alanı), üç bölmeli. o: {kisi, tarih, saat, veri}
  GM.kisiZaman = (o = {}) => `<button type="button" class="${liste('gm-kl-kz', o.sinif)}"${at({veri: o.veri || {eylem: 'kisi-zaman'}})} aria-haspopup="dialog" aria-label="${esc(`${o.kisi} kişi, ${o.tarih}, ${o.saat}. Değiştir`)}"><span>${ik('kisi')}<b>${esc(o.kisi)} kişi</b></span><span>${ik('takvim')}<b>${esc(o.tarih)}</b></span><span>${ik('saat')}<b>${esc(o.saat)}</b></span>${ik('ac', 'gm-kl-kz-ok')}</button>`;
  // Talep saatli satır (OpenTable liste satırı): GM.mekanKart satır ritminden türer; metin solda, foto sağda, altta saat düğmeleri (GM.cip gövdesi) ya da "Bildir".
  // o: {saatler:[{saat, deger}], anlik (online rezervasyon), kapali: 'neden', kayitli}
  GM.mekanSlotSatir = (m, o = {}) => { const git = o.git || `#/mekan/${m.slug}`;
    const slot = o.saatler?.length && !o.kapali
      ? `<div class="gm-kl-slotlar" role="group" aria-label="${esc(`${m.ad} için saat seç`)}">${o.saatler.map(s => `<button type="button" class="gm-kl-slot${o.anlik ? ' is-anlik' : ''}" data-eylem="slot" data-id="${esc(m.slug)}" data-saat="${esc(s.deger)}">${esc(s.saat)}</button>`).join('')}</div><small class="gm-kl-slot-not">${o.anlik ? `${ik('bolt')}Online rezervasyon · anında onay` : `${ik('rezervasyon')}Talep gönderilir · işletme onaylar`}</small>`
      : `<div class="gm-kl-slotlar is-yok"><span class="gm-kl-slot-yok">${ik('saat')}${esc(o.kapali || 'Bu saatte talep alınmıyor')}</span><button type="button" class="gm-kl-slot is-bildir" data-eylem="bildir" data-id="${esc(m.slug)}">${ik('bildirim')}Bildir</button></div>`;
    return `<article class="gm-kl-ot" data-mekan="${esc(m.slug)}"><a class="gm-kl-ot-metin" href="${esc(git)}" data-git="${esc(git)}">${GM.mekanEtiketSpan(m, 'gm-mk-etiket')}<h3 class="gm-kl-ot-ad gm-kirp-1">${esc(m.ad)}</h3>${GM.mekanMetaSatir([GM.mekanPuan(m), GM.mekanYer(m, true), GM.fiyat(m.fiyat), o.rota ? GM.rotaEtiket(o.rota, {kisa: true}) : ''])}</a><a class="gm-kl-ot-foto" href="${esc(git)}" data-git="${esc(git)}" tabindex="-1" aria-label="${esc(m.ad)}">${foto(m.kapak)}</a>${slot}</article>`; };

  // ---------- Beli: kişisel listeler ve karşılaştırmalı sıralama ----------
  // Kişisel liste deposu (Flutter'da yerel depo): gittim (sıralı, en çok sevilen başta) ve gidecegim. Misafirde cihazda, üye olunca hesaba geçer (GM.uyeDuvar akışı).
  GM.listem = {
    oku: t => GM.durum.oku(`liste-${t}`, []) || [],
    yaz: (t, l) => GM.durum.yaz(`liste-${t}`, l),
    var: (t, slug) => GM.listem.oku(t).includes(slug),
    cikar: (t, slug) => GM.listem.yaz(t, GM.listem.oku(t).filter(x => x !== slug)),
    ekle: (t, slug, i) => { const l = GM.listem.oku(t).filter(x => x !== slug); l.splice(i ?? l.length, 0, slug); return GM.listem.yaz(t, l); }
  };
  // Karşılaştırmalı yerleştirme (Beli): yeni mekân, sıralı listedeki mekânlarla ikili sorulur (ikili arama, en çok log2 n soru); puan üretilmez, yalnız sıra.
  // GM.sheet + iki seçim kartı (GM.secimKart oranında, fotoğraflı). o: {yeni: slug, liste: [slug], bitti: i => {}}
  GM.kiyasla = (o = {}) => {
    const l = o.liste || [], yeni = GM.mekan(o.yeni); let a = 0, b = l.length, adim = 0; const toplam = Math.ceil(Math.log2(l.length + 1));
    if (!l.length) { o.bitti?.(0); return null; }
    const kart = (m, k) => `<button type="button" class="gm-kl-kiyas-kart" data-kiyas="${k}"><span class="gm-kl-kiyas-foto">${foto(m.kapak)}</span><b class="gm-kirp-2">${esc(m.ad)}</b><small class="gm-kirp-1">${esc(GM.konumMetin(m))}</small></button>`;
    const govde = () => { const m = GM.mekan(l[Math.floor((a + b) / 2)]); return `<div class="gm-kl-kiyas"><p class="gm-kl-kiyas-soru">Hangisini daha çok sevdin?</p><div class="gm-kl-kiyas-ikili">${kart(yeni, 'yeni')}<span class="gm-kl-kiyas-ya" aria-hidden="true">ya da</span>${kart(m, 'eski')}</div>${GM.ilerleme({oran: adim / Math.max(1, toplam)})}<p class="gm-kl-kiyas-not">${esc(`${adim + 1}. karşılaştırma · en çok ${toplam}`)}</p></div>`; };
    return GM.sheet({baslik: `${yeni.ad} listende kaçıncı?`, html: `<div data-kiyas-govde>${govde()}</div>`, altBar: GM.btn({metin: 'Karar veremedim', tur: 'secondary', tam: true, veri: {kiyas: 'esit'}}), sonra: (k, h) => {
      k.addEventListener('click', ev => {
        const s = ev.target.closest('[data-kiyas]'); if (!s) return;
        const orta = Math.floor((a + b) / 2), v = s.dataset.kiyas;
        if (v === 'esit') { a = b = orta; } else if (v === 'yeni') b = orta; else a = orta + 1;
        adim += 1;
        if (a >= b) { h.kapat(); o.bitti?.(a); return; }
        k.querySelector('[data-kiyas-govde]').innerHTML = govde();
      });
    }});
  };
  // Sıralı liste satırı (Beli "Been"): büyük sıra numarası + küçük foto + ad ve meta + sağda menü. GM.mekanKart satır ritminden türer.
  GM.listeSiraSatir = (m, o = {}) => { const git = o.git || `#/mekan/${m.slug}`; return `<article class="${liste('gm-kl-sira', o.secili && 'is-secili')}" data-mekan="${esc(m.slug)}">${o.sira != null ? `<span class="gm-kl-sira-no">${esc(o.sira)}</span>` : ''}<a class="gm-kl-sira-foto" href="${esc(git)}" data-git="${esc(git)}" tabindex="-1" aria-label="${esc(m.ad)}">${foto(m.kapak)}</a><a class="gm-kl-sira-metin" href="${esc(git)}" data-git="${esc(git)}"><b class="gm-kirp-1">${esc(m.ad)}</b>${GM.mekanMetaSatir([`<span class="gm-mk-tur">${esc(GM.mekanEtiket(m))}</span>`, GM.mekanYer(m), GM.fiyat(m.fiyat)])}</a>${o.eylem || ''}</article>`; };
  // Öneri satırı (Beli "Recs"): GM.listeSiraSatir gövdesi, sağda iki yuvarlak düğme: Gittim (sıralar) · Gideceğim (kaydeder).
  GM.listeOneriSatir = (m, o = {}) => GM.listeSiraSatir(m, {...o, sira: null, eylem: `<span class="gm-kl-sira-eylem">${GM.ikonBtn({ikon: 'circle-check', etiket: o.gittim ? `${m.ad}: gittim (listende)` : `${m.ad}: gittim, sırala`, tur: o.gittim ? 'dolu' : 'kutu', secili: !!o.gittim, veri: {eylem: 'gittim', id: m.slug}})}${GM.ikonBtn({ikon: 'kaydet', etiket: o.gidecegim ? `${m.ad}: gideceklerimde` : `${m.ad}: gideceklerime ekle`, tur: o.gidecegim ? 'dolu' : 'kutu', secili: !!o.gidecegim, veri: {eylem: 'gidecegim', id: m.slug}})}</span>`});

  // ---------- Mapstr: renkli etiketler ----------
  // Etiket paneli (Mapstr sol panel): GM.satirlar listesinden türer; her satırda renkli sayı dairesi, ikon, ad; aria-pressed ile süzer. o: {ogeler:[{id, ad, ikon, renk 1-8, sayi, secili, kisisel}], baslik, alt}
  GM.etiketPanel = (o = {}) => `<aside class="${liste('gm-kl-etp', o.acik && 'is-acik', o.sinif)}" aria-label="${esc(o.baslik || 'Etiketler')}" data-etiket-panel><header class="gm-kl-etp-bas"><span class="gm-satir-metin"><b>${esc(o.baslik || 'Etiketler')}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span>${GM.ikonBtn({ikon: 'kapat', etiket: 'Paneli kapat', veri: {eylem: 'etiket-panel'}})}</header><div class="gm-kl-etp-liste" role="group" aria-label="Etiketle süz">${(o.ogeler || []).map(x => `${x.ayrac ? `<p class="gm-kl-etp-ayrac">${esc(x.ayrac)}</p>` : ''}<button type="button" class="gm-kl-etp-oge gm-kl-et-${esc(x.renk)}" data-etiket="${esc(x.id)}" aria-pressed="${!!x.secili}"><span class="gm-kl-etp-sayi">${esc(x.sayi)}</span>${ik(x.ikon)}<span class="gm-kl-etp-ad">${esc(x.ad)}</span>${ik('onay', 'gm-kl-etp-onay')}</button>`).join('')}</div></aside>`;
  // Etiket başlığı (Mapstr liste görünümü grup başı): renkli daire + ikon + ad + sayı.
  GM.etiketBaslik = (o = {}) => `<h2 class="gm-kl-etb gm-kl-et-${esc(o.renk)}"><span class="gm-kl-etp-sayi">${ik(o.ikon)}</span><span>${esc(o.ad)}</span><small>${esc(GM.sayi(o.sayi))} mekân</small></h2>`;
})();

/* Cila turu (Görev 6) parçaları: Gourmet'e özgü rota bağlamı ve harita alanında arama. */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, liste = (...a) => a.filter(Boolean).join(' ');
  // Mekânın hazır rotalardaki yeri: önerilen duraklardan (GM.rotaOneri, tek kaynak) en az sapmalı olan. {rota:{id, ad}, sapma, km, uzak} ya da null. Bir kez kurulur.
  let dizin = null;
  GM.mekanRotada = slug => {
    if (!dizin) { dizin = new Map(); (window.GMV?.rotalar || []).forEach(r => GM.rotaOneri(r).forEach(d => { const o = dizin.get(d.slug); if (!o || d.sapma < o.sapma) dizin.set(d.slug, {rota: {id: r.id, ad: r.ad}, sapma: d.sapma, km: Math.round(d.km), uzak: d.uzak}); })); }
    return dizin.get(slug) || null;
  };
  // Rota etiketi: GM.sapma rozetinden türer; rota adını da taşır ve rotaya götürür (kart bağlantısı içinde iç içe <a> olmasın diye span role=link) ("Yol üstü · İstanbul – İzmir"). o: {kisa: rota adı yok, foto: fotoğraf üstü}
  GM.rotaEtiket = (b, o = {}) => (b ? `<span role="link" tabindex="0" class="${liste('gm-kl-rotaet', b.uzak <= 1 && 'is-yolustu', o.foto && 'is-foto', o.sinif)}" data-git="#/rota/${esc(b.rota.id)}" aria-label="${esc(`${b.rota.ad} rotasında, ${b.uzak <= 1 ? 'yol üstü' : `${b.sapma} dakika sapma`}`)}">${ik(b.uzak <= 1 ? 'yolUstu' : 'rota')}<b>${b.uzak <= 1 ? 'Yol üstü' : `+${esc(b.sapma)} dk`}</b>${o.kisa ? '' : `<span>${esc(b.rota.ad)}</span>`}</span>` : '');
  // Harita kullanıcı hareketi (sürükleme, yakınlaştırma) bitince fn(sınır); kod hareketlerinde çalışmaz. MapLibre hazır olunca bağlanır.
  GM.haritaHareket = (el, fn) => {
    let iptal = false, m = null; const h = ev => { if (ev.originalEvent) fn(m.getBounds()); };
    const bagla = () => { if (iptal || !el?.isConnected) return; m = el._harita; if (!m) { setTimeout(bagla, 400); return; } m.on('moveend', h); };
    bagla(); return () => { iptal = true; m?.off('moveend', h); };
  };
  // "Bu alanda ara" hapı (Google Maps): GM.yuzenDugme gövdesinin kâğıt hali, harita üstünde ortada.
  GM.alanDugme = (o = {}) => `<button type="button" class="${liste('gm-kl-alan', o.sinif)}" data-eylem="${esc(o.eylem || 'alan-ara')}">${ik(o.ikon || 'ara_')}<span>${esc(o.metin || 'Bu alanda ara')}</span></button>`;
})();
