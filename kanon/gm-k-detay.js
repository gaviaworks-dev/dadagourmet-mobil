/* Mekân detayı bileşenleri (Gourmet'e özgü; mekân detay A/B/C ekranları ortak kullanır). Her bileşen en yakın kanon ailesinden türer,
   yalnız token kullanır; başındaki tek satır türediği aileyi ve nedenini söyler. Veri: GMV.mekanlar + GMV.mekanDetay (veri/mekan-detay.js, yukle() ile).
   API: GM.mekanDetayVeri · GM.mekanAcik · GM.mekanKimlik · GM.galeriHero · GM.galeriAc · GM.eylemDortlu · GM.editorNot · GM.konumYol · GM.saatTablo
        GM.tazelik · GM.adresKart · GM.rezBar · GM.yildizSec · GM.fotoEkle · GM.ziyaretAkis · GM.degerlendirAkis · GM.rezervasyonAkis · GM.bilgiHatasi
        GM.listeyeEkle · GM.haritadaGoster · GM.mekanEylemBagla · GM.mekanKayit · GM.haritaSheet (+ GM.iskelet('harita-sheet')) */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, at = GM.at, vurgu = GM.vurgu, TK = GM.TK, M = TK.motion, liste = (...a) => a.filter(Boolean).join(' ');
  const bg = src => (src ? ` style="background-image:url('${esc(src)}')"` : '');
  const nokta = s => String(s || '').replace(':', '.');
  const GUN = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  // Saat ekinin ünlü uyumu: 18.00’de, 19.00’da, 18.30’da, 13.00’te
  const ekDe = s => { const [h, m] = String(s).split(':').map(Number), n = m || h || 0, b = n % 10, o = n % 100; const sert = b ? [3, 4, 5].includes(b) : o === 40; const kalin = b ? [6, 9].includes(b) : [0, 10, 30].includes(o); return `’${sert ? 't' : 'd'}${kalin ? 'a' : 'e'}`; };
  // Saat eki dışa açık: GM.saatEki('19:00') → ’da, GM.saatEki('19:00', 'den') → ’dan
  GM.saatEki = (s, tur = 'de') => `${ekDe(s)}${tur === 'den' ? 'n' : ''}`;
  const dk = s => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };

  // ---------- Veri ----------
  GM.mekanDetayVeri = slug => window.GMV?.mekanDetay?.[slug] || {};
  // Açık/kapalı metni: haftalık saat varsa şimdiye göre (gece yarısını aşan kapanış sayılır), yoksa kart verisindeki acik.
  GM.mekanAcik = (m, d = {}) => {
    const s = d.saatler; if (!s) return {acik: m?.acik ?? null, metin: m?.acik == null ? '' : m.acik ? 'Açık' : 'Kapalı'};
    const t = GM.simdi(), g = (t.getDay() + 6) % 7 + 1, su = t.getHours() * 60 + t.getMinutes();
    const aralik = gun => { const x = s[gun]; if (!x) return null; const a = dk(x[0]); let b = dk(x[1]); if (b <= a) b += 1440; return [a, b, x]; };
    const dun = aralik(g === 1 ? 7 : g - 1), bu = aralik(g);
    if (dun && su + 1440 < dun[1]) return {acik: true, metin: `Açık · ${nokta(dun[2][1])}’e kadar`};
    if (bu && su >= bu[0] && su < bu[1]) return {acik: true, metin: bu[2][1] === '00:00' ? 'Açık · gece yarısına kadar' : `Açık · ${nokta(bu[2][1])}${ekDe(bu[2][1])} kapanır`};
    if (bu && su < bu[0]) return {acik: false, metin: `Kapalı · ${nokta(bu[2][0])}${ekDe(bu[2][0])} açılır`, acilis: bu[2][0]};
    for (let i = 1; i <= 7; i++) { const gg = (g - 1 + i) % 7 + 1, x = s[gg]; if (x) return {acik: false, metin: `Kapalı · ${i === 1 ? 'yarın' : GUN[gg - 1]} ${nokta(x[0])}${ekDe(x[0])} açılır`, acilis: x[0]}; }
    return {acik: false, metin: 'Kapalı'};
  };
  // Kullanıcının mekân kayıtları (cihazda): favori, ziyaret, durak, liste. Misafirde yazılmaz (kapı GM.mekanEylemBagla'da).
  GM.mekanKayit = {
    var: (tur, slug) => (GM.durum.oku(`mekan-${tur}`, []) || []).some(x => (x.slug || x) === slug),
    al: (tur, slug) => (GM.durum.oku(`mekan-${tur}`, []) || []).find(x => (x.slug || x) === slug) || null,
    yaz: (tur, slug, kayit) => { const l = (GM.durum.oku(`mekan-${tur}`, []) || []).filter(x => (x.slug || x) !== slug); if (kayit !== false) l.push(typeof kayit === 'object' ? {slug, ...kayit} : {slug}); GM.durum.yaz(`mekan-${tur}`, l); return kayit !== false; },
    cevir: (tur, slug) => GM.mekanKayit.yaz(tur, slug, GM.mekanKayit.var(tur, slug) ? false : {})
  };

  // ---------- Kimlik ve küçük parçalar ----------
  // Konum hiyerarşisi (GM.konumMetin uzun biçiminden türer): Türkiye › İstanbul › Beyoğlu › semt; Michelin/Resy adres satırı ritmi.
  GM.konumYol = (m, o = {}) => { const l = [m.ulke, m.il, m.ilce, m.semt].filter(Boolean); return `<p class="${liste('gm-konum-yol', o.foto && 'is-foto', o.sinif)}">${ik('pin')}<span>${l.map((x, i) => `<span${i === l.length - 1 ? ' class="is-son"' : ''}>${esc(x)}</span>`).join(`<i class="gm-konum-ayrac" aria-hidden="true">›</i>`)}</span></p>`; };
  // Tek meta satırı (docs/YIGILMA-KURALI.md 1 ve 5): [puan] · semt · kategori · ₺ · açık durumu · mutfak · görüntülenme; .gm-tek-satir, sığmazsa yatay kayar.
  // Puan yoksa hiç yazılmaz (uydurulmaz; "Henüz yok" özet kutusunda). o: {puan, konum, kategori, fiyat, durum, mutfak, goz: false → çizme; sinif}
  // Durum kısa biçimi: kapalıyken açılış saati yeter ("18.00’de açılır", kırmızı nokta kapalıyı söyler); açıkken "Açık, 00.00’a kadar".
  const kisaDurum = a => { const t = a.acik === false && a.acilis ? a.metin.replace(/^Kapalı · /, '') : a.metin.replace(' · ', ', '); return t.charAt(0).toLocaleUpperCase('tr') + t.slice(1); };
  GM.mekanMeta = (m, d = {}, o = {}) => {
    const acik = GM.mekanAcik(m, d), nk = '<span class="gm-nokta" aria-hidden="true">·</span>', yer = m.semt || m.ilce || m.il;
    const l = [
      o.puan !== false && m.puan != null ? GM.puan({deger: m.puan}) : '',
      o.konum !== false && yer ? `<span class="gm-mkim-yer">${ik('pin')}${esc(yer)}</span>` : '',
      o.kategori !== false && m.kategori ? `<b>${esc(m.kategori)}</b>` : '',
      o.fiyat !== false && m.fiyat ? GM.fiyat(m.fiyat) : '',
      o.durum !== false && acik.metin ? GM.acikDurum(acik.acik, {metin: kisaDurum(acik)}) : '',
      o.mutfak !== false && m.mutfak?.[0] ? `<span>${esc(m.mutfak[0])}</span>` : '',
      o.goz !== false ? GM.gozSayi(d.goruntulenme) : ''
    ].filter(Boolean);
    return l.length ? `<p class="${liste('gm-mkim-meta gm-tek-satir', o.sinif)}">${l.join(nk)}</p>` : '';
  };
  // Mekân kimlik bloğu (GM.metinBlok ailesi): en çok 3 satır — rozet satırı (isteğe bağlı) · ad · tek meta satırı (GM.mekanMeta).
  // o: {kompakt (rozetsiz), rozetHtml (rozet satırının yerine hazır satır, ör. GM.ayirtSatir), rozetler, meta (GM.mekanMeta seçenekleri), sinif}
  GM.mekanKimlik = (m, d = {}, o = {}) => {
    const roz = o.kompakt ? [] : [...(m.seckiler || []).includes('rota') ? [GM.rozet({metin: 'Dada Route durağı', ikon: 'rota'})] : [], ...(d.editorNotu ? [GM.rozet({metin: 'Editör notu', ikon: 'pen-nib', ton: 'notr'})] : []), ...(o.rozetler || [])];
    const ust = o.rozetHtml ?? (roz.length ? `<div class="gm-mkim-rozet gm-tek-satir">${roz.join('')}</div>` : '');
    return `<header class="${liste('gm-mkim', o.kompakt && 'is-kompakt', o.sinif)}">${ust}<h1 class="gm-t-display">${esc(m.ad)}</h1>${GM.mekanMeta(m, d, o.meta)}</header>`;
  };
  // Haftalık saatler (GM.kunye satır ritminden türer): gün · saat, bugün kalın ve rozetli, kapalı gün soluk.
  GM.saatTablo = (saatler, o = {}) => { const bugun = (GM.simdi().getDay() + 6) % 7 + 1; return `<ul class="${liste('gm-saat-tablo', o.sinif)}">${GUN.map((g, i) => { const x = saatler?.[i + 1], b = i + 1 === bugun; return `<li class="${liste(b && 'is-bugun', !x && 'is-kapali')}"><span>${esc(g)}${b ? `<small class="gm-saat-bugun">Bugün</small>` : ''}</span><b>${x ? `${esc(nokta(x[0]))} – ${esc(nokta(x[1]))}` : 'Kapalı'}</b></li>`; }).join('')}</ul>`; };
  // Bilgi tazeliği (GM.durumRozet + meta): web künye "yakın zamanda doğrulandı" + son güncelleme.
  // Tek satır (yığılma kuralı 1-2): doğrulama rozeti · güncelleme tarihi · (o.hata) sağda "Hata bildir"; "Bilgi hatası bildir" artık tek başına satır olmaz.
  GM.tazelik = (t = {}, o = {}) => {
    const hata = o.hata ? GM.btn({metin: 'Hata bildir', ikon: 'flag', tur: 'text', boyut: 'sm', sinif: 'gm-tazelik-hata', veri: {eylem: 'mk-hata'}, attrs: 'aria-label="Bilgi hatası bildir"'}) : '';
    if (!t.metin) return hata ? `<div class="gm-tazelik">${hata}</div>` : '';
    return `<div class="gm-tazelik"><div class="gm-tazelik-sol gm-tek-satir" title="${esc(t.metin)}">${GM.durumRozet({ton: 'basari', ikon: 'dogrulandi', metin: 'Doğrulandı'})}${t.tarih ? `<small aria-label="Son güncelleme ${esc(t.tarih)}">${esc(t.tarih)}</small>` : ''}</div>${hata}</div>`;
  };
  // Editör kutusu (GM.ipucu ailesi, Resy "Neden seviyoruz"): primary-tint yüzey, kalem ikonu, başlık, kaynak etiketi, alıntı metni.
  GM.editorNot = (o = {}) => `<aside class="${liste('gm-editor', o.sinif)}"><div class="gm-editor-bas"><span class="gm-editor-ikon" aria-hidden="true">${ik(o.ikon || 'pen-nib')}</span><div><small class="gm-t-label">${esc(o.ust || 'Dada Gourmet editörü')}</small><h3>${esc(o.baslik || 'Editör Notu')}</h3></div>${o.etiket ? `<span class="gm-editor-etiket">${esc(o.etiket)}</span>` : ''}</div><p>${vurgu(o.metin || '')}</p></aside>`;
  // 4'lü eşit eylem şeridi (GM.altEylem .gm-bar-ikon ailesi, Michelin): ikon + etiket, basılı hâl primary tint; tek satır etiket.
  GM.eylemDortlu = (l = [], o = {}) => `<div class="${liste('gm-eylem4', o.sinif)}" role="group" aria-label="${esc(o.etiket || 'Mekân eylemleri')}">${l.map(x => `<button type="button" class="gm-eylem4-oge"${x.basili != null ? ` aria-pressed="${!!x.basili}"` : ''}${at({veri: x.veri, git: x.git, attrs: x.attrs})}><span class="gm-eylem4-ikon">${ik(x.ikon)}</span><span class="gm-eylem4-ad" data-ad-normal="${esc(x.ad)}"${x.adBasili ? ` data-ad-basili="${esc(x.adBasili)}"` : ''}>${esc(x.basili && x.adBasili ? x.adBasili : x.ad)}</span></button>`).join('')}</div>`;
  // Adres kartı (web kenar kutusu → GM.kart ailesi): statik mini harita + pin, adres ve telefon satırı, eşit ikili Yol tarifi / Ara.
  GM.adresKart = (m, d = {}, o = {}) => {
    const satir = [d.adres ? {ikon: 'pin', baslik: 'Adres', alt: d.adres} : {ikon: 'pin', baslik: 'Konum', alt: GM.konumMetin(m, 'uzun')}, d.telefon ? {ikon: 'telefon', baslik: 'Telefon', alt: d.telefon} : null].filter(Boolean);
    const dk_ = 0.006;
    return `<article class="${liste('gm-adres', o.sinif)}">${GM.harita({ad: `adres-${m.slug}`, yukseklik: 'var(--gm-size-map-hsm)', etkilesim: false, kontroller: false, sinir: [[m.lng - dk_, m.lat - dk_ * .6], [m.lng + dk_, m.lat + dk_ * .6]], pinler: [{id: m.slug, lng: m.lng, lat: m.lat, secili: true, ad: m.ad}], etiket: `${m.ad} haritada`})}<div class="gm-adres-govde">${GM.satirlar(satir.map(x => ({...x, duz: true})))}${GM.btnIkili({metin: 'Yol tarifi', ikon: 'yon', veri: {eylem: 'mk-yol'}}, d.tel ? {metin: 'Ara', ikon: 'telefon', tur: 'secondary', veri: {eylem: 'mk-ara'}} : {metin: 'Haritada aç', ikon: 'harita', tur: 'secondary', veri: {eylem: 'mk-harita'}}, {sinif: 'gm-adres-eylem'})}</div></article>`;
  };
  // Rezervasyon çubuğu (GM.altEylem ailesi, OpenTable yapışkan bant): solda iki satır bağlam, sağda tek birincil düğme.
  GM.rezBar = (o = {}) => `<div class="gm-bar gm-rezbar"><div class="gm-bar-ic"><div class="gm-rezbar-metin"><b>${o.baslikHtml || esc(o.baslik)}</b>${o.alt ? `<small>${o.altIkon ? ik(o.altIkon) : ''}${esc(o.alt)}</small>` : ''}</div>${GM.btn(o.eylem)}</div></div>`;

  // Kimlik paneli (detay-v2 panel bindirmesinden türer): fotoğraf sahnesinin üstüne r-sheet köşeyle biner; kimlik, eylem şeridi, editör kutusu taşır.
  GM.kimlikPanel = html => `<div class="gm-mb">${html}</div>`;
  // Rota bağlamı (GM.sapma + GM.ipucu tint yüzeyi; Roadtrippers/Watch Duty): "İstanbul – İzmir rotasında · Yol üstü · 1. km".
  GM.rotaBaglam = (o = {}) => `<div class="${liste('gm-hs-baglam', o.sinif)}">${ik(o.ikon || 'rota')}<span><b>${esc(o.baslik)}</b><small class="gm-tek-satir">${o.sapma ? GM.sapma(o.sapma) : ''}${o.alt ? `<span>${esc(o.alt)}</span>` : ''}</small></span></div>`;
  // Fotoğraf şeridi (Google Maps yer kartı; GM.yatay şerit ailesi): ilki geniş, dokununca tüm fotoğraflar.
  GM.fotoSerit = (G = []) => (G.length ? `<div class="gm-hs-fotolar" role="list" aria-label="Fotoğraflar">${G.map((g, i) => `<button type="button" role="listitem" class="gm-hs-foto" data-eylem="mk-galeri" data-id="${i}" aria-label="${esc(g.alt || 'Fotoğraf')}"><span class="gm-photo"${bg(g.src)}></span>${i === 0 && G.length > 1 ? `<small>${ik('galeri')}${G.length}</small>` : ''}</button>`).join('')}</div>` : '');
  // Harita sheet başlığı: kimlik bloğu + sağda yuvarlak ikon düğmeleri; tam durakta küçült düğmesi görünür.
  GM.haritaSheetBas = (kimlik, eylemler = '') => `<div class="gm-hs-bas-ust">${kimlik}<div class="gm-hs-bas-eylem">${GM.ikonBtn({ikon: 'ac', etiket: 'Küçült', tur: 'kutu', sinif: 'gm-hs-kapat', attrs: 'data-hs-kapat'})}${eylemler}</div></div>`;

  // ---------- Galeri ----------
  // Fotoğraf sahnesi (GM.heroAna slayt izinden türer; Michelin/Google Maps): tam genişlik yatay kaydırma, sayaç, alt perde; dokunuş tüm fotoğraflar.
  GM.galeriHero = (o = {}) => { const G = o.gorseller || []; return `<section class="${liste('gm-gh', o.sinif)}" data-gh><div class="gm-gh-iz" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${esc(o.etiket || 'Fotoğraflar, yatay kaydır')}">${G.map((g, i) => `<button type="button" class="gm-gh-kare" data-eylem="mk-galeri" data-id="${i}" aria-label="${esc(g.alt || 'Fotoğraf')} (${i + 1} / ${G.length})"><span class="gm-photo"${bg(g.src)}></span></button>`).join('')}</div><span class="gm-gh-perde" aria-hidden="true"></span>${G.length > 1 ? `<span class="gm-gh-sayac" aria-hidden="true">${ik('galeri')}<span><b data-gh-n>1</b> / ${G.length}</span></span>` : ''}${G.length > 1 ? `<span class="gm-gh-nokta" aria-hidden="true">${G.map((_, i) => `<i${i ? '' : ' class="is-on"'}></i>`).join('')}</span>` : ''}</section>`; };
  // Tüm fotoğraflar (GM.sheet tam + gm-blok-gorsel figür ritmi): alt metinli tek sütun; seçilen fotoğrafa kayar.
  GM.galeriAc = (G = [], i = 0, o = {}) => GM.sheet({baslik: o.baslik || `Fotoğraflar (${G.length})`, tam: true, sinif: 'gm-galeri-sheet', html: `<div class="gm-galeri">${G.map((g, k) => `<figure class="gm-galeri-oge" data-k="${k}"><span class="gm-photo" role="img" aria-label="${esc(g.alt || '')}"${bg(g.src)}></span>${g.alt ? `<figcaption>${esc(g.alt)}</figcaption>` : ''}</figure>`).join('')}</div>`, sonra: d => { if (i > 0) requestAnimationFrame(() => { const g = d.querySelector('.gm-sheet-govde'), f = d.querySelector(`[data-k="${i}"]`); if (g && f) g.scrollTop = f.offsetTop - g.offsetTop; }); }});
  // Galeri sayacı ve noktaları: kaydırma olayı yakalama evresinde (bileşen kendi bağlar; ekran kod yazmaz).
  document.addEventListener('scroll', ev => {
    const iz = ev.target; if (!iz.classList?.contains('gm-gh-iz')) return;
    const n = Math.round(iz.scrollLeft / Math.max(1, iz.clientWidth)), g = iz.closest('[data-gh]');
    const s = g.querySelector('[data-gh-n]'); if (s) s.textContent = n + 1;
    g.querySelectorAll('.gm-gh-nokta i').forEach((x, k) => x.classList.toggle('is-on', k === n));
  }, true);

  // ---------- Form parçaları ----------
  // Yıldız seçici (Gastro DG.puan radyo grubundan türer; Gourmet'te GM.puan gösterim rozetine dönüştüğü için ayrı ad): tek puan 1-5, etiketli.
  const PUAN = ['Çok kötü', 'Kötü', 'İdare eder', 'İyi', 'Harika'];
  GM.yildizSec = (o = {}) => `<div class="${liste('gm-yildiz-sec', o.sinif)}" role="radiogroup" aria-label="${esc(o.etiket || 'Puanın')}" data-ad="${esc(o.ad || 'puan')}" data-deger="${+o.deger || 0}">${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="${n === +o.deger}" aria-label="${n} yıldız, ${PUAN[n - 1]}" data-yildiz="${n}" class="${n <= +o.deger ? 'is-on' : ''}">${ik('yildiz')}</button>`).join('')}<span class="gm-yildiz-etiket" aria-live="polite">${o.deger ? PUAN[o.deger - 1] : esc(o.yer || 'Puan ver')}</span></div>`;
  // Fotoğraf ekle (GM.dosyaAlan ailesi): kare önizlemeler + ekle karosu, en çok n; sayı değişince gm-degisim {ad, deger: adet}.
  GM.fotoEkle = (o = {}) => `<div class="${liste('gm-fe', o.sinif)}" data-ad="${esc(o.ad || 'foto')}" data-en="${+o.en || 3}"><div class="gm-fe-izgara"><label class="gm-fe-ekle">${ik('kamera')}<b>${esc(o.metin || 'Fotoğraf ekle')}</b><small>en fazla ${+o.en || 3}</small><input class="gm-sr" type="file" accept="image/jpeg,image/png,image/webp" multiple></label></div></div>`;
  const feSay = k => k.querySelectorAll('.gm-fe-kare').length;
  const feGuncelle = k => { const n = feSay(k), en = +k.dataset.en; k.querySelector('.gm-fe-ekle').hidden = n >= en; GM.degisim(k, k.dataset.ad, n); };
  document.addEventListener('change', ev => {
    const i = ev.target; if (!i.matches?.('.gm-fe input[type=file]')) return;
    const k = i.closest('.gm-fe'), en = +k.dataset.en, iz = k.querySelector('.gm-fe-izgara'); let fazla = false;
    [...i.files].forEach(f => { if (feSay(k) >= en) { fazla = true; return; } const u = URL.createObjectURL(f); iz.querySelector('.gm-fe-ekle').insertAdjacentHTML('beforebegin', `<span class="gm-fe-kare" data-url="${esc(u)}"><span class="gm-photo"${bg(u)}></span><button type="button" class="gm-fe-sil" aria-label="Fotoğrafı kaldır">${ik('kapat')}</button></span>`); });
    i.value = ''; if (fazla) GM.toast(`En fazla **${en} fotoğraf** ekleyebilirsin`, {tur: 'uyari'}); feGuncelle(k);
  });
  document.addEventListener('click', ev => {
    const s = ev.target.closest?.('.gm-fe-sil'); if (s) { const k = s.closest('.gm-fe'), kare = s.closest('.gm-fe-kare'); URL.revokeObjectURL(kare.dataset.url); kare.remove(); feGuncelle(k); return; }
    const y = ev.target.closest?.('.gm-yildiz-sec [data-yildiz]'); if (!y) return;
    const k = y.closest('.gm-yildiz-sec'), n = +y.dataset.yildiz; k.dataset.deger = n;
    k.querySelectorAll('[data-yildiz]').forEach(b => { b.classList.toggle('is-on', +b.dataset.yildiz <= n); b.setAttribute('aria-checked', +b.dataset.yildiz === n); });
    k.querySelector('.gm-yildiz-etiket').textContent = PUAN[n - 1]; k.classList.remove('is-hata'); GM.titres(6); GM.degisim(k, k.dataset.ad, n);
  });
  // Dada Puan ipucu (GM.bant ailesi): +15 yalnız fotoğraflı değerlendirmede; fotoğraf yokken nasıl kazanılacağını söyler.
  const puanIpucu = foto => `<p class="${liste('gm-dp-ipucu', foto && 'is-kazanildi')}" role="status">${ik('puanDada')}<span>${foto ? '<b>+15 Dada Puan</b> fotoğraflı değerlendirme · onayda hesabına geçer' : 'Puanlama <b>+2</b>, fotoğraf eklersen <b>+15 Dada Puan</b>'}</span></p>`;

  // ---------- Akışlar (sheet) ----------
  // Değerlendirme (web #dgRev, panel DegerlendirmeGonderIstegi): tek yıldız zorunlu, metin 20-5000, fotoğraf ≤3; moderasyonlu; +15 yalnız fotoğraflı.
  const degerSheet = (m, o = {}) => {
    const z = o.ziyaret;
    return GM.sheet({baslik: z ? 'Ziyaretin kaydedildi' : `${m.ad} nasıldı?`, sinif: 'gm-deger-sheet', html: `<div class="gm-yigin">${z ? `<div class="gm-deger-bas">${GM.durumRozet({ton: 'basari', ikon: 'ziyaret', metin: 'Ziyaret Geçmişim’e eklendi'})}<p class="gm-ton-ikincil">İstersen <b>puan ve fotoğraf</b> ekle; başkalarına yol gösterir.</p></div>` : ''}${GM.alan({etiket: 'Puanın', zorunlu: !z, html: GM.yildizSec({ad: 'dg-puan', yer: 'Yıldıza dokun'})})}${GM.alan({etiket: 'Fotoğraflar', html: GM.fotoEkle({ad: 'dg-foto'})})}${GM.input({ad: 'dg-metin', etiket: z ? 'Kısa not' : 'Yorumun', cokSatir: true, zorunlu: !z, yer: 'Ne yedin, nasıldı? Deneyimini yaz…', yardim: z ? 'İsteğe bağlı. Yazarsan değerlendirme olarak denetime gider.' : 'En az 20 karakter. Yorumlar denetim sonrası yayınlanır.'})}<div data-dp>${puanIpucu(false)}</div></div>`,
      altBar: GM.btnIkili({metin: z ? 'Şimdi değil' : 'Vazgeç', attrs: 'data-sheet-kapat'}, {metin: 'Gönder', ikon: 'gonder', veri: {eylem: 'dg-gonder'}}),
      sonra: d => {
        let foto = 0;
        const a = GM.on(d, 'dg-foto', n => { foto = n; d.querySelector('[data-dp]').innerHTML = puanIpucu(n > 0); });
        if (o.fotoAc) setTimeout(() => d.querySelector('.gm-fe input')?.click(), M.sheet);
        const b = GM.eylem(d, 'dg-gonder', () => {
          const p = +d.querySelector('.gm-yildiz-sec').dataset.deger, metin = d.querySelector('[name="dg-metin"]').value.trim();
          if (!z && !p) { d.querySelector('.gm-yildiz-sec').classList.add('is-hata'); GM.toast('Puan vermeden **gönderilemez**', {tur: 'hata'}); return; }
          if (!z && metin.length < 20) { GM.toast('Yorumun **en az 20 karakter** olmalı', {tur: 'hata'}); return; }
          if (z && !p && !foto && !metin) { d.kapat(); return; }
          GM.mekanKayit.yaz('degerlendirme', m.slug, {puan: p, foto, metin, durum: 'inceleniyor'});
          d.kapat();
          GM.toast(foto ? `Değerlendirmen alındı · **+15 Dada Puan** onayda kesinleşir` : 'Değerlendirmen alındı, **denetim sonrası** yayınlanacak', {tur: 'basari'});
        });
        return () => { a(); b(); };
      }});
  };
  GM.degerlendirAkis = (m, o = {}) => degerSheet(m, o);
  // Ziyaret Ettim: tek dokunuş işaretler (Ziyaret Geçmişim), ardından isteğe bağlı puan + fotoğraf sheet'i açılır. Ziyaretin kendisi puan kazandırmaz.
  GM.ziyaretAkis = (m, o = {}) => { GM.mekanKayit.yaz('ziyaret', m.slug, {gun: GM.bugunIso()}); o.degisti?.(); return degerSheet(m, {...o, ziyaret: true}); };

  // Rezervasyon (web rezervasyon penceresi, panel MekanRezervasyonIstegi): 1 Kişi · 2 Tarih & Saat · 3 Onay; takvime ekle, yol tarifi.
  GM.rezervasyonAkis = (m, d = {}, o = {}) => {
    const S = window.GMV?.rezervasyonSecenek || {}, bugun = GM.bugunIso(), r = d.rezervasyon || {};
    const iso = t => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    const ekle = (s, n) => { const t = new Date(`${s}T12:00:00`); t.setDate(t.getDate() + n); return iso(t); };
    const max = ekle(bugun, (S.gunIleri || 14) - 1), gunNo = s => (new Date(`${s}T12:00:00`).getDay() + 6) % 7 + 1;
    const kapali = d.saatler ? Array.from({length: S.gunIleri || 14}, (_, i) => ekle(bugun, i)).filter(s => !d.saatler[gunNo(s)]) : [];
    const ilkAcik = Array.from({length: S.gunIleri || 14}, (_, i) => ekle(bugun, i)).find(s => !kapali.includes(s)) || bugun;
    const v = {kisi: +o.kisi || 2, cocuk: 0, masa: 'farketmez', durum: 'standart', tarih: o.tarih || ilkAcik, saat: o.saat || '', alerjen: '', not: ''};
    // o.slotYok (ekran hâli ?hal=slot-yok): ilk açık gün tamamen dolu; slotlar pasif, sonraki uygun güne geçiş düğmesi çıkar.
    const dolu = o.slotYok ? [ilkAcik] : [];
    const slotlar = t => { if (kapali.includes(t)) return []; const l = r.saatler || S.saatler || []; const sinir = t === bugun ? GM.simdi().getHours() * 60 + GM.simdi().getMinutes() + 60 : -1; return l.map(s => ({saat: s, pasif: dolu.includes(t) || dk(s) < sinir})); };
    const sonrakiGun = t => Array.from({length: S.gunIleri || 14}, (_, i) => ekle(bugun, i)).find(s => s > t && !kapali.includes(s) && !dolu.includes(s) && slotlar(s).some(x => !x.pasif));
    const ad = (l, k) => (l.find(x => x[0] === k) || [])[1] || '';
    const ozet = () => `${v.kisi}${v.kisi >= 8 ? '+' : ''} kişi${v.cocuk ? ` · ${v.cocuk} çocuk` : ''} · ${ad(S.durum, v.durum)}`;
    const adim = (n, ad_) => `<div class="gm-rz-adim">${GM.adimGosterge({adim: n, toplam: 3})}<p class="gm-t-label gm-ton-ikincil">Adım ${n} / 3 · ${esc(ad_)}</p></div>`;
    const kimlik = `<div class="gm-rz-mekan">${GM.gorsel({src: m.kapak, ad: m.ad})}<span class="gm-satir-metin"><b>${esc(m.ad)}</b><small>${esc(GM.konumMetin(m))}</small></span></div>`;
    const hizliSec = () => (S.hizli.includes(v.kisi) ? String(v.kisi) : '');
    const g1 = () => `${adim(1, 'Kişi')}${kimlik}${GM.alan({etiket: 'Kaç kişilik masa?', html: `<div class="gm-yigin-12">${GM.stepper({ad: 'rz-kisi', deger: v.kisi, min: S.kisiMin, max: S.kisiMax, birim: 'kişi', aria: 'Kişi sayısı'})}${GM.cipler({ad: 'rz-hizli', tur: 'tek', serit: false, secili: hizliSec(), etiket: 'Hızlı kişi seçimi', ogeler: S.hizli.map(n => ({metin: n >= 8 ? `${n}+ grup` : String(n), deger: String(n), ikon: n >= 8 ? 'kisi' : null}))})}</div>`})}${GM.alan({etiket: 'Çocuk sayısı (isteğe bağlı)', html: GM.stepper({ad: 'rz-cocuk', deger: v.cocuk, min: 0, max: S.cocukMax, birim: 'çocuk', aria: 'Çocuk sayısı'})})}${GM.alan({etiket: 'Masa tercihi (isteğe bağlı)', html: GM.cipler({ad: 'rz-masa', tur: 'tek', serit: false, secili: v.masa, ogeler: S.masa.map(([k, a, i]) => ({metin: a, deger: k, ikon: i}))})})}${GM.alan({etiket: 'Özel bir durum mu? (isteğe bağlı)', html: GM.cipler({ad: 'rz-durum', tur: 'tek', serit: false, secili: v.durum, ogeler: S.durum.map(([k, a, i]) => ({metin: a, deger: k, ikon: i}))})})}`;
    const slotHtml = () => {
      const l = slotlar(v.tarih), s = sonrakiGun(v.tarih), git_ = s ? GM.btn({metin: `${GM.tarihKisa(s)} için bak`, ikon: 'takvim', tur: 'secondary', boyut: 'sm', veri: {eylem: 'rz-sonraki', id: s}}) : '';
      if (!l.length) return `<div class="gm-yigin-12">${GM.veriYok('Mekân bu gün **kapalı**. Başka bir gün seç.')}${git_}</div>`;
      if (l.every(x => x.pasif)) return `<div class="gm-yigin-12">${GM.slotlar({ad: 'rz-saat', secili: '', gruplar: [{ad: `${GMTakvim.uzun(v.tarih)} · akşam`, slotlar: l}]})}${GM.ipucu({ton: 'uyari', ikon: 'saat', baslik: 'Bu gün boş masa kalmadı', metin: 'Seçtiğin tarihte bütün saatler **dolu**. Başka bir gün seç ya da mekânı arayıp bekleme listesini sor.'})}${git_}</div>`;
      return GM.slotlar({ad: 'rz-saat', secili: v.saat, gruplar: [{ad: `${GMTakvim.uzun(v.tarih)} · akşam`, slotlar: l}]});
    };
    // Gün şeridi (denetim tur 2): ay takvimi yerine 14 günlük tek satır şerit; seçili gün görünür ve vurgulu, kapalı gün pasif; "Tüm takvim" ay görünümünü sheet'te açar.
    const GUNK = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'], AYK = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const gunler = Array.from({length: S.gunIleri || 14}, (_, i) => ekle(bugun, i));
    const gunSerit = () => `<div class="gm-rz-gunler" role="group" aria-label="Gün seç" data-cip-grup="tek" data-ad="rz-tarih">${gunler.map((g, i) => { const t = new Date(`${g}T12:00:00`), kap = kapali.includes(g); return `<button type="button" class="gm-rz-gun" data-cip="${esc(g)}" aria-pressed="${g === v.tarih}" aria-label="${esc(GMTakvim.uzun(g))}${kap ? ', kapalı' : ''}"${kap ? ' disabled' : ''}><small>${i === 0 ? 'Bugün' : GUNK[gunNo(g) - 1]}</small><b>${t.getDate()}</b><small>${kap ? 'Kapalı' : AYK[t.getMonth()]}</small></button>`; }).join('')}</div>`;
    const tarihAlan = () => GM.alan({etiket: 'Tarih', html: `<div class="gm-yigin-8">${gunSerit()}${GM.btn({metin: 'Tüm takvim', ikon: 'takvim', tur: 'text', boyut: 'sm', veri: {eylem: 'rz-takvim-ac'}})}</div>`});
    const g2 = () => `${adim(2, 'Tarih ve saat')}<div data-rz-hata></div><div data-rz-tarih>${tarihAlan()}</div>${GM.alan({etiket: 'Saat', html: `<div data-rz-slot>${slotHtml()}</div>`})}${GM.input({ad: 'rz-alerjen', etiket: 'Alerjen notu (isteğe bağlı)', cokSatir: true, deger: v.alerjen, yer: 'Fıstık, gluten, süt ürünü…', yardim: 'Mekâna rezervasyonla iletilir.'})}${GM.input({ad: 'rz-not', etiket: 'Özel istek (isteğe bağlı)', cokSatir: true, deger: v.not, yer: 'Çocuk sandalyesi, pasta, erişim…'})}`;
    const kunye = () => GM.kunye([{ikon: 'mekan', etiket: 'Mekân', deger: m.ad}, {ikon: 'takvim', etiket: 'Tarih', deger: GMTakvim.uzun(v.tarih)}, {ikon: 'saat', etiket: 'Saat', deger: nokta(v.saat)}, {ikon: 'kisi', etiket: 'Kişi', deger: `${v.kisi}${v.kisi >= 8 ? '+' : ''} kişi${v.cocuk ? ` · ${v.cocuk} çocuk` : ''}`}, ...(v.durum !== 'standart' ? [{ikon: 'festival', etiket: 'Özel durum', deger: ad(S.durum, v.durum)}] : []), ...(v.masa !== 'farketmez' ? [{ikon: 'chair', etiket: 'Masa', deger: ad(S.masa, v.masa)}] : []), ...(v.alerjen ? [{ikon: 'gizlilik', etiket: 'Alerjen', deger: v.alerjen}] : [])]);
    const g3 = () => `<div class="gm-rz-tamam"><span class="gm-rz-isaret" aria-hidden="true">${ik('onay')}</span><h3 class="gm-t-section">Rezervasyon talebin alındı</h3>${GM.durumRozet({ton: 'uyari', ikon: 'saat', metin: 'Onay bekliyor'})}<p class="gm-ton-ikincil">${vurgu(r.not ? r.not.replace('onayıyla', '**onayıyla**') : 'Talebin mekân sahibine iletilir, **onayıyla** kesinleşir.')}</p></div>${kunye()}<p class="gm-dp-ipucu">${ik('puanDada')}<span>Rezervasyon gerçekleşince <b>+25 Dada Puan</b></span></p><div class="gm-ikili">${GM.btn({metin: 'Takvime ekle', ikon: 'takvim', tur: 'secondary', veri: {eylem: 'rz-takvim'}})}${GM.btn({metin: 'Yol tarifi', ikon: 'yon', tur: 'secondary', veri: {eylem: 'mk-yol'}})}</div><div class="gm-rz-tamam-alt">${GM.btn({metin: 'Rezervasyonlarım', ikon: 'rezervasyon', tur: 'text', git: '#/profil/rezervasyonlar', attrs: 'data-sheet-kapat'})}</div>`;
    const ayak = n => (n === 1 ? `<div class="gm-rz-ayak"><p class="gm-rz-ozet"><small>Masa</small><b data-rz-ozet>${esc(ozet())}</b></p>${GM.btn({metin: 'Devam', ikon: 'tumu', veri: {eylem: 'rz-ileri'}})}</div>` : n === 2 ? GM.btnIkili({metin: 'Geri', ikon: 'geri', veri: {eylem: 'rz-geri'}}, {metin: 'Talebi gönder', ikon: 'onay', pasif: !v.saat, veri: {eylem: 'rz-gonder'}}) : GM.btn({metin: 'Tamam', tam: true, attrs: 'data-sheet-kapat'}));
    let n = 1, hataKaldi = !!o.hata;
    return GM.sheet({baslik: 'Rezervasyon talebi', tam: true, sinif: 'gm-rz-sheet', html: `<div class="gm-yigin-24" data-rz-govde>${g1()}</div>`, altBar: `<div data-rz-ayak>${ayak(1)}</div>`, sonra: s => {
      const govde = s.querySelector('[data-rz-govde]'), ay = s.querySelector('[data-rz-ayak]'), kayan = s.querySelector('.gm-sheet-govde');
      const git = k => { n = k; govde.innerHTML = [g1, g2, g3][k - 1](); ay.innerHTML = ayak(k); if (k === 2) gunGoster(); kayan.scrollTop = 0; govde.classList.remove('gm-rz-gecis'); void govde.offsetWidth; govde.classList.add('gm-rz-gecis'); if (k === 3) s.querySelector('.gm-sheet-bas h2').textContent = 'Talep gönderildi'; };
      // Tarih seçimi: slotlar yeniden, şerit (gerekirse) yeniden çizilir ve seçili gün görünür alana kayar.
      const gunGoster = () => requestAnimationFrame(() => { const b = govde.querySelector('.gm-rz-gun[aria-pressed=true]'), k = b?.parentElement; if (b && k) k.scrollTo({left: b.offsetLeft - (k.clientWidth - b.offsetWidth) / 2, behavior: GM.azHareket() ? 'auto' : 'smooth'}); });
      const tarihSec = (x, serit) => { v.tarih = x; v.saat = ''; if (serit) { const t = govde.querySelector('[data-rz-tarih]'); if (t) t.innerHTML = tarihAlan(); } govde.querySelector('[data-rz-slot]').innerHTML = slotHtml(); ay.innerHTML = ayak(2); gunGoster(); };
      const ozetYaz = () => { const e = s.querySelector('[data-rz-ozet]'); if (e) e.textContent = ozet(); };
      const kisiYaz = k => { v.kisi = k; const st = govde.querySelector('[data-ad="rz-kisi"]'); if (st) st.outerHTML = GM.stepper({ad: 'rz-kisi', deger: k, min: S.kisiMin, max: S.kisiMax, birim: 'kişi', aria: 'Kişi sayısı'}); govde.querySelectorAll('[data-ad="rz-hizli"] [data-cip]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cip === hizliSec())); ozetYaz(); };
      const c = [
        GM.on(s, 'rz-kisi', x => { v.kisi = +x; govde.querySelectorAll('[data-ad="rz-hizli"] [data-cip]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cip === hizliSec())); ozetYaz(); }),
        GM.on(s, 'rz-hizli', x => kisiYaz(+x)),
        GM.on(s, 'rz-cocuk', x => { v.cocuk = +x; ozetYaz(); }),
        GM.on(s, 'rz-masa', x => { v.masa = x; }),
        GM.on(s, 'rz-durum', x => { v.durum = x; ozetYaz(); }),
        GM.on(s, 'rz-tarih', x => { tarihSec(x, false); }),
        GM.eylem(s, 'rz-takvim-ac', () => GMTakvim.sec({bugun, secili: v.tarih, min: bugun, max, kapali, baslik: 'Tarih seç'}).then(x => { if (x) tarihSec(x, true); })),
        GM.on(s, 'rz-saat', x => { v.saat = x; ay.innerHTML = ayak(2); }),
        GM.eylem(s, 'rz-sonraki', el => tarihSec(el.dataset.id, true)),
        GM.eylem(s, 'rz-ileri', () => git(2)),
        GM.eylem(s, 'rz-geri', () => { v.alerjen = govde.querySelector('[name="rz-alerjen"]')?.value || ''; v.not = govde.querySelector('[name="rz-not"]')?.value || ''; git(1); }),
        GM.eylem(s, 'rz-gonder', el => {
          v.alerjen = (govde.querySelector('[name="rz-alerjen"]')?.value || '').trim().slice(0, S.alerjenMax); v.not = (govde.querySelector('[name="rz-not"]')?.value || '').trim().slice(0, S.notMax);
          GM.mesgul?.(el, 700);
          // o.hata (ekran hâli ?hal=rez-hata): ilk gönderim sunucuya ulaşmaz; seçimler korunur, hata bandı çıkar, ikinci deneme geçer.
          if (hataKaldi) { setTimeout(() => { hataKaldi = false; const h = govde.querySelector('[data-rz-hata]'); if (h) h.innerHTML = GM.ipucu({ton: 'hata', ikon: 'uyari', baslik: 'Talebin gönderilemedi', metin: 'Bağlantı kurulamadı; seçimlerin duruyor. **Tekrar dene** ya da birazdan yeniden gönder.'}); kayan.scrollTop = 0; GM.toast('Talep **gönderilemedi**', {tur: 'hata'}); GM.titres(20); }, GM.azHareket() ? 0 : 700); return; }
          setTimeout(() => { GM.durum.yaz('rezervasyonlar', [...GM.durum.oku('rezervasyonlar', []), {id: `rz-${Date.now()}`, slug: m.slug, ad: m.ad, ...v, durum: 'talep'}]); git(3); GM.titres(12); }, GM.azHareket() ? 0 : 700);
        }),
        GM.eylem(s, 'rz-takvim', () => {
          const [y, a, g] = v.tarih.split('-'), [h, dd] = v.saat.split(':'), bas = `${y}${a}${g}T${h}${dd}00`, sonH = String(Math.min(23, +h + 2)).padStart(2, '0');
          const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dada Gourmet//TR', 'BEGIN:VEVENT', `UID:${Date.now()}@dadagourmet.com`, `DTSTART:${bas}`, `DTEND:${y}${a}${g}T${sonH}${dd}00`, `SUMMARY:${m.ad} · ${v.kisi} kişi`, `LOCATION:${d.adres || GM.konumMetin(m, 'uzun')}`, 'DESCRIPTION:Dada Gourmet rezervasyon talebi (onay bekliyor)', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
          const u = URL.createObjectURL(new Blob([ics], {type: 'text/calendar'})), l = Object.assign(document.createElement('a'), {href: u, download: `${m.slug}-rezervasyon.ics`}); l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000);
          GM.toast('Takvim dosyası **hazır**', {ikon: 'takvim'});
        })
      ];
      if (o.adim === 2) git(2);
      return () => c.forEach(f => f());
    }});
  };

  // Bilgi hatası bildir (panel MekanBilgiHatasiKonusu): konu (tek seçim) + mesaj; GM.secimler ailesi.
  GM.bilgiHatasi = m => GM.sheet({baslik: 'Bilgi hatası bildir', html: `<div class="gm-yigin">${GM.p(`**${m.ad}** hakkında yanlış bir bilgi mi gördün? Ekibimiz kontrol edip düzeltir.`, {ton: 'ikincil'})}${GM.alan({etiket: 'Konu', html: GM.secimler({ad: 'bh-konu', duzen: 'tek', ogeler: (GMV.rezervasyonSecenek?.hataKonu || []).map(([k, a]) => ({k, ad: a}))})})}${GM.input({ad: 'bh-mesaj', etiket: 'Açıklama (isteğe bağlı)', cokSatir: true, yer: 'Doğrusu nedir?'})}</div>`, altBar: GM.btnIkili({metin: 'Vazgeç', attrs: 'data-sheet-kapat'}, {metin: 'Gönder', veri: {eylem: 'bh-gonder'}}), sonra: d => GM.eylem(d, 'bh-gonder', () => { if (!d.querySelector('.gm-secim-kart[aria-checked=true]')) { GM.toast('Bir **konu** seç', {tur: 'hata'}); return; } d.kapat(); GM.toast('Teşekkürler, bildirimin **ekibe iletildi**', {tur: 'basari'}); })});
  // Listeye ekle (web #mdListPop): Favorilerim + kullanıcının listeleri + yeni liste; GM.secimler + GM.input.
  GM.listeyeEkle = m => { const L = [['favori', 'Favorilerim', 'favori'], ...(GM.durum.oku('listeler', []) || []).map(x => [x.id, x.ad, 'list-ul'])]; return GM.sheet({baslik: 'Listeye ekle', html: `<div class="gm-yigin">${GM.secimler({ad: 'le-liste', duzen: 'tek', secili: GM.mekanKayit.var('favori', m.slug) ? [] : ['favori'], ogeler: [...L.map(([k, a, i]) => ({k, ad: a, ikon: i, alt: k === 'favori' && GM.mekanKayit.var('favori', m.slug) ? 'Bu mekân zaten burada' : null})), {k: 'yeni', ad: 'Yeni liste', ikon: 'ekle'}]})}<div data-le-yeni hidden>${GM.input({ad: 'le-ad', etiket: 'Liste adı', yer: 'Ör. Ege kaçamağı'})}</div></div>`, altBar: GM.btn({metin: 'Ekle', tam: true, veri: {eylem: 'le-ekle'}}), sonra: d => { const a = GM.on(d, 'le-liste', k => { d.querySelector('[data-le-yeni]').hidden = k !== 'yeni'; }); const b = GM.eylem(d, 'le-ekle', () => { const k = d.querySelector('.gm-secim-kart[aria-checked=true]')?.dataset.k; if (!k) { GM.toast('Bir **liste** seç', {tur: 'hata'}); return; } let adi = L.find(x => x[0] === k)?.[1]; if (k === 'yeni') { adi = d.querySelector('[name="le-ad"]').value.trim(); if (!adi) { GM.toast('Listeye bir **ad** ver', {tur: 'hata'}); return; } GM.durum.yaz('listeler', [...(GM.durum.oku('listeler', []) || []), {id: `l-${Date.now()}`, ad: adi}]); } if (k === 'favori') GM.mekanKayit.yaz('favori', m.slug, {}); GM.mekanKayit.yaz('liste', m.slug, {liste: adi}); d.kapat(); GM.toast(`**${adi}** listesine eklendi`, {tur: 'basari'}); document.dispatchEvent(new CustomEvent('gm-mekan-kayit', {detail: {slug: m.slug}})); }); return () => { a(); b(); }; }}); };
  // Haritada göster (web kart eylemi): tam sheet içinde gerçek harita, mekân pini seçili; altta Yol tarifi.
  GM.haritadaGoster = m => GM.sheet({baslik: m.ad, tam: true, sinif: 'gm-hg-sheet', html: GM.harita({ad: `hg-${m.slug}`, yukseklik: '100%', merkez: [m.lng, m.lat], zoom: 14.5, pinler: [{id: m.slug, lng: m.lng, lat: m.lat, secili: true, ad: m.ad}], etiket: `${m.ad} haritada`}), altBar: GM.btn({metin: 'Yol tarifi', ikon: 'yon', tam: true, veri: {eylem: 'mk-yol'}}), sonra: d => GM.eylem(d, 'mk-yol', () => yolTarifi(m))});
  const yolTarifi = m => { window.open(`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`, '_blank', 'noopener'); };

  // ---------- Eylem bağlayıcısı ----------
  // Ekran kökünde data-eylem="mk-*" dokunuşlarını tek yerden işler (A/B/C aynı davranış). Misafirde kayıt gerektirenler GM.uyeDuvar açar.
  // Basılı hâller (aria-pressed) ve etiketler (data-ad-basili) kayıttan yeniden boyanır. o: {galeri, rota:{R, durak}, sonra}
  const KAPI = {
    'mk-kaydet': ['Kaydetmek için üye ol', 'Beğendiğin mekânları **Gurme Favorilerim**’de her cihazda saklamak için üye ol.'],
    'mk-ziyaret': ['Ziyaretini kaydet', '“Ziyaret Ettim” dediğin mekânlar **seyahat günlüğüne** yazılır. 10 saniyede üye ol.'],
    'mk-liste': ['Listelerin için üye ol', 'Mekânları **kendi listelerinde** toplamak için üye ol.'],
    'mk-degerlendir': ['Değerlendirmek için üye ol', 'Puan ve yorumunla **topluluğa yol göster**; fotoğraflı değerlendirmede +15 Dada Puan.'],
    'mk-foto': ['Fotoğraf eklemek için üye ol', 'Fotoğraflı değerlendirme **+15 Dada Puan** kazandırır.'],
    'mk-not': ['Not almak için üye ol', 'Mekânla ilgili **kendi notların** her cihazda seninle olsun.'],
    'mk-rez': ['Rezervasyon için üye ol', 'Masa talebini göndermek ve **onay durumunu** takip etmek için üye ol.']
  };
  GM.mekanEylemBagla = (kok, m, d = {}, o = {}) => {
    const boya = () => {
      const durum = {'mk-kaydet': GM.mekanKayit.var('favori', m.slug), 'mk-ziyaret': GM.mekanKayit.var('ziyaret', m.slug), 'mk-durak': GM.mekanKayit.var('durak', m.slug), 'mk-not': GM.mekanKayit.var('not', m.slug), 'mk-liste': GM.mekanKayit.var('liste', m.slug)};
      Object.entries(durum).forEach(([e, on]) => kok.querySelectorAll(`[data-eylem="${e}"][aria-pressed]`).forEach(b => {
        b.setAttribute('aria-pressed', on); const a = b.querySelector('[data-ad-basili]'); if (a) a.textContent = on ? a.dataset.adBasili : a.dataset.adNormal;
        if (b.dataset.metinBasili) { const sp = b.querySelector('span'); if (sp) sp.textContent = on ? b.dataset.metinBasili : b.dataset.metinNormal; b.classList.toggle('gm-btn--tonlu', on); const i = b.querySelector('.icon'); if (i && b.dataset.ikonBasili) i.className = `icon fa-solid fa-${GM.ikonAd(on ? b.dataset.ikonBasili : b.dataset.ikonNormal)}`; }
        if (e === 'mk-kaydet') b.setAttribute('aria-label', on ? 'Favorilerden çıkar' : 'Favorilere ekle');
      }));
    };
    const kapi = e => { if (GM.uye() || !KAPI[e]) return false; GM.uyeDuvar({baslik: KAPI[e][0], metin: KAPI[e][1]}); return true; };
    const daha = () => GM.sheet({baslik: m.ad, html: GM.satirlar([
      {ikon: 'list-ul', baslik: 'Listeye ekle', veri: {eylem: 'mk-liste'}}, {ikon: 'yildiz', baslik: 'Değerlendir', alt: 'Puan, yorum ve fotoğraf', veri: {eylem: 'mk-degerlendir'}},
      {ikon: 'kamera', baslik: 'Fotoğraf ekle', alt: 'Fotoğraflı değerlendirme +15 Dada Puan', veri: {eylem: 'mk-foto'}}, {ikon: 'harita', baslik: 'Haritada göster', veri: {eylem: 'mk-harita'}},
      {ikon: 'rota', baslik: 'Dada Route’a ekle', alt: 'Güzergâhında durak yap', veri: {eylem: 'mk-durak'}}, ...(d.tel ? [{ikon: 'telefon', baslik: 'İşletmeyi ara', alt: d.telefon, veri: {eylem: 'mk-ara'}}] : []),
      {ikon: 'flag', baslik: 'Bilgi hatası bildir', veri: {eylem: 'mk-hata'}}]), sonra: s => { const h = ev => { const b = ev.target.closest('[data-eylem^="mk-"]'); if (!b) return; s.kapat(); setTimeout(() => calistir(b.dataset.eylem, b), M.sheet); }; s.addEventListener('click', h); return () => s.removeEventListener('click', h); }});
    const calistir = (e, el) => {
      if (kapi(e)) return;
      if (e === 'mk-kaydet') { const on = GM.mekanKayit.cevir('favori', m.slug), duyur = () => document.dispatchEvent(new CustomEvent('gm-mekan-kayit', {detail: {slug: m.slug}})); duyur(); GM.titres(8); GM.toast(on ? `${m.ad} **Gurme Favorilerim**’e eklendi` : 'Favorilerinden çıkarıldı', {ikon: 'favori', eylem: on ? 'Geri al' : undefined, onEylem: () => { GM.mekanKayit.yaz('favori', m.slug, false); boya(); duyur(); }}); }
      else if (e === 'mk-ziyaret') { if (GM.mekanKayit.var('ziyaret', m.slug)) GM.degerlendirAkis(m); else GM.ziyaretAkis(m, {degisti: boya}); }
      else if (e === 'mk-degerlendir') GM.degerlendirAkis(m);
      else if (e === 'mk-foto') GM.degerlendirAkis(m, {fotoAc: true});
      else if (e === 'mk-liste') GM.listeyeEkle(m);
      else if (e === 'mk-paylas') GM.paylas({baslik: m.ad, url: `https://dadagourmet.com/mekan/${m.slug}`, alt: `${m.ad} · ${GM.konumMetin(m)}`});
      else if (e === 'mk-hata') GM.bilgiHatasi(m);
      else if (e === 'mk-rez') { const b = el?.closest('[data-rk]')?.dataset || {}; GM.rezervasyonAkis(m, d, {...(o.rez || {}), saat: el?.dataset.id || '', tarih: el?.dataset.tarih || b.tarih, kisi: b.kisi, adim: el?.dataset.id ? 2 : o.rez?.adim || 1}); }
      else if (e === 'mk-not') GM.notSheet(m, boya);
      else if (e === 'mk-sekme') { const b = kok.querySelector(`.gm-seg button[data-seg="${el?.dataset.id}"]`); if (b) { b.click(); const kap = b.closest('[data-sekme-kap]'), k = kap?.closest('.gm-hs-kaydir,.gm-kaydir'), bar = kap?.querySelector('.gm-sekme-bar'); if (k && kap) k.scrollTo({top: kap.getBoundingClientRect().top - k.getBoundingClientRect().top + k.scrollTop - (parseFloat(getComputedStyle(bar).top) || 0), behavior: GM.azHareket() ? 'auto' : 'smooth'}); } return; }
      else if (e === 'mk-tumfoto') GM.galeriIzgara(o.galeri || [], {baslik: `${m.ad} · fotoğraf turu`});
      else if (e === 'mk-olanak') GM.olanakSheet(o.olanaklar || [], {baslik: 'Bu mekânda neler var'});
      else if (e === 'mk-bilgi') GM.bilgiSheet(el?.dataset.id, m, d);
      else if (e === 'mk-ara') { if (d.tel) location.href = `tel:${d.tel}`; }
      else if (e === 'mk-yol') yolTarifi(m);
      else if (e === 'mk-harita') GM.haritadaGoster(m);
      else if (e === 'mk-galeri') GM.galeriAc(o.galeri || [], +(el?.dataset.id || 0), {baslik: `${m.ad} · fotoğraflar`});
      else if (e === 'mk-tarif') { if (d.tarifler) window.open(d.tarifler.url, '_blank', 'noopener'); }
      else if (e === 'mk-durak') {
        const on = GM.mekanKayit.cevir('durak', m.slug), R = o.rota?.R; GM.titres(10);
        GM.toast(on ? (R ? `**${m.ad}** ${R.ad} rotana eklendi` : `**${m.ad}** Dada Route taslağına eklendi`) : 'Durak rotandan çıkarıldı', {tur: on ? 'basari' : undefined, eylem: on ? 'Geri al' : undefined, onEylem: () => { GM.mekanKayit.yaz('durak', m.slug, false); boya(); }});
      }
      else if (e === 'mk-daha') { daha(); return; }
      boya();
    };
    const h = ev => { const b = ev.target.closest('[data-eylem^="mk-"]'); if (!b || !kok.contains(b)) return; ev.preventDefault(); calistir(b.dataset.eylem, b); };
    const yenile = ev => { if (ev.detail?.slug === m.slug) boya(); };
    // Sekme değişince içerik başı görünür kalsın: çubuk yapışıksa kaydırıcı sekme kabının başına döner (içerik çubuğun altında yarım başlamaz).
    const sekmeBasi = ev => { const kap = ev.target.closest?.('[data-sekme-kap]'); if (!kap || ev.detail?.ad !== kap.dataset.sekmeKap) return; const k = kap.closest('.gm-hs-kaydir,.gm-kaydir'), bar = kap.querySelector('.gm-sekme-bar'); if (!k || !bar) return; const ust = parseFloat(getComputedStyle(bar).top) || 0, y = kap.getBoundingClientRect().top - k.getBoundingClientRect().top + k.scrollTop - ust; if (k.scrollTop > y) k.scrollTo({top: y, behavior: GM.azHareket() ? 'auto' : 'smooth'}); };
    kok.addEventListener('gm-degisim', sekmeBasi);
    kok.addEventListener('click', h); document.addEventListener('gm-mekan-kayit', yenile);
    // Sheet içinden gelen mk-yol (rezervasyon onayı) da aynı işi yapar.
    const sh = ev => { const b = ev.target.closest?.('.gm-sheet [data-eylem="mk-yol"]'); if (b && !b.closest('.gm-hg-sheet') && kok.isConnected && !kok.classList.contains('is-gizli') && GM.aktif()?.el === kok) yolTarifi(m); };
    document.addEventListener('click', sh);
    boya();
    const hs = kok.querySelector('[data-hs]'), hsTemiz = hs ? hsKur(hs, o) : null, yapTemiz = yapisKur(kok), sigTemiz = sigarKur(kok);
    return () => { kok.removeEventListener('gm-degisim', sekmeBasi); kok.removeEventListener('click', h); document.removeEventListener('gm-mekan-kayit', yenile); document.removeEventListener('click', sh); hsTemiz?.(); yapTemiz?.(); sigTemiz?.(); };
  };
  // Yapışma (yığılma kuralı 4, Gastro detay): fotoğrafa binen beyaz panel header'ın altına yaklaştıkça köşe yarıçapı konuma bağlı olarak 24 → 0 iner
  // (son 48 px'te), değdiğinde .is-yapisik (kanon yardımcı) alır; panel zaten tam genişlik. --gm-yapis: 1 = yarım/serbest, 0 = yapışık.
  const yapisKur = kok => {
    const k = kok.querySelector('.gm-kaydir'), p = kok.querySelector('.gm-detay-panel,.gm-mb,.gm-ref-akis.is-bindir'); if (!k || !p) return null;
    const bar = kok.querySelector('.gm-header'), mesafe = TK.space[48];
    const boya = () => { const d = p.getBoundingClientRect().top - (bar ? bar.getBoundingClientRect().bottom : k.getBoundingClientRect().top); p.style.setProperty('--gm-yapis', Math.max(0, Math.min(1, d / mesafe)).toFixed(3)); p.classList.toggle('is-yapisik', d <= 1); };
    k.addEventListener('scroll', boya, {passive: true}); boya();
    return () => k.removeEventListener('scroll', boya);
  };
  // Tek satır şeritleri sığıyorsa sağ solma kalkar (.gm-tek-satir.is-sigar); boyut değişince yeniden ölçülür.
  const sigarKur = kok => {
    const olc = () => kok.querySelectorAll('.gm-tek-satir').forEach(e => { if (e.clientWidth) e.classList.toggle('is-sigar', e.scrollWidth <= e.clientWidth + 1); });
    const g = new ResizeObserver(olc), sek = () => requestAnimationFrame(olc); g.observe(kok); sek(); kok.addEventListener('gm-degisim', sek);
    return () => { g.disconnect(); kok.removeEventListener('gm-degisim', sek); };
  };

  // ---------- Harita üstü detay sheet'i (C) ----------
  // GM.sheet ailesinden türer (tutamak, r-sheet, sh-lg) ama ekranın kendisidir: arkada gerçek harita, önde üç duraklı sürüklenir yüzey
  // (kapalı: başlık · yarım: özet + eylemler · tam: sekmeli içerik). Google Maps / Watch Duty / Roadtrippers D2 kalıbı.
  // o: {harita (GM.harita seçenekleri), sol, sag (yüzen düğmeler html), bas (başlık html), ozet, icerik, etiket}
  GM.haritaSheet = (o = {}) => `<div class="gm-hs-sahne" data-hs data-hs-durak="yarim"><div class="gm-hs-harita">${GM.harita({...o.harita, tam: true, kontroller: false})}<span class="gm-hs-perde" aria-hidden="true"></span></div><div class="gm-hs-ust"><span>${o.sol || ''}</span><span class="gm-hs-ust-sag">${o.sag || ''}</span></div><section class="gm-hs" aria-label="${esc(o.etiket || 'Mekân ayrıntıları')}"><div class="gm-hs-tut"><button type="button" class="gm-hs-tutamak" data-hs-tik aria-label="Ayrıntıları aç ya da kapat"><span></span></button></div><div class="gm-hs-kaydir"><header class="gm-hs-bas">${o.bas || ''}</header><div class="gm-hs-ozet">${o.ozet || ''}</div><div class="gm-hs-icerik">${o.icerik || ''}</div></div></section></div>`;
  const hsKur = (sahne, o = {}) => {
    const hs = sahne.querySelector('.gm-hs'), kay = hs.querySelector('.gm-hs-kaydir'), bas = hs.querySelector('.gm-hs-bas'), oz = hs.querySelector('.gm-hs-ozet'), tut = hs.querySelector('.gm-hs-tut');
    const H = () => hs.offsetHeight, kapaliH = () => tut.offsetHeight + bas.offsetHeight, yarimH = () => Math.min(H() * .62, tut.offsetHeight + bas.offsetHeight + oz.offsetHeight);
    const Y = {kapali: () => H() - kapaliH(), yarim: () => H() - yarimH(), tam: () => 0};
    let durak = 'yarim', y = H(), surukle = null;
    const oran = () => { const a = Y.yarim(), t = Math.max(0, Math.min(1, (a - y) / Math.max(1, a))); return t; };
    const uygula = (anim = false) => {
      hs.style.transition = anim && !GM.azHareket() ? `transform var(--gm-spring-varsayilan-ms) var(--gm-spring-varsayilan),border-radius var(--gm-spring-varsayilan-ms) var(--gm-spring-varsayilan)` : 'none';
      hs.style.transform = `translate3d(0,${Math.round(y)}px,0)`;
      sahne.style.setProperty('--gm-hs-oran', oran().toFixed(3));
      sahne.style.setProperty('--gm-hs-gorunur', `${Math.round(H() - y)}px`);
    };
    const harita = sahne.querySelector('.gm-harita');
    const odakla = () => { const m = harita?._harita, p = o.odak; if (!m || !p) return; m.easeTo({center: p, padding: {top: 64, bottom: Math.min(H() - y, H() * .62) + 24, left: 24, right: 24}, duration: GM.azHareket() ? 0 : TK.motion.page * 2}); };
    const git = (k, anim = true) => {
      durak = k; y = Y[k](); sahne.dataset.hsDurak = k; hs.classList.toggle('is-tam', k === 'tam'); kay.scrollTop = k === 'tam' ? kay.scrollTop : 0;
      hs.querySelector('.gm-hs-tutamak').setAttribute('aria-expanded', k === 'tam'); uygula(anim); if (k !== 'tam') setTimeout(odakla, 60);
    };
    // Giriş: aşağıdan yaylanarak yarım durağa çıkar.
    y = H(); uygula(false); requestAnimationFrame(() => requestAnimationFrame(() => git(o.durak || 'yarim')));
    // MapLibre gelince mekânı görünen alana ortala.
    let deneme = 0; const bekle = setInterval(() => { if (harita?._harita || ++deneme > 40) { clearInterval(bekle); harita?._harita?.once('idle', odakla); } }, 250);
    const sonraki = (yon) => { const s = ['kapali', 'yarim', 'tam'], i = s.indexOf(durak); return s[Math.max(0, Math.min(2, i + yon))]; };
    const bas_ = ev => {
      if (ev.button > 0) return; if (ev.target.closest('button,a,input,textarea,label,.gm-seg,.gm-serit,.gm-hs-foto') && !ev.target.closest('.gm-hs-tutamak')) { if (durak === 'tam' || !ev.target.closest('.gm-hs-bas')) return; }
      if (durak === 'tam' && !ev.target.closest('.gm-hs-tut,.gm-hs-bas') && kay.scrollTop > 0) return;
      surukle = {y0: ev.clientY, x0: ev.clientX, yb: y, t: performance.now(), v: 0, son: ev.clientY, aktif: false, id: ev.pointerId};
    };
    const tasi = ev => {
      if (!surukle || ev.pointerId !== surukle.id) return; const dy = ev.clientY - surukle.y0;
      if (!surukle.aktif) { if (Math.abs(dy) < 6 || Math.abs(dy) < Math.abs(ev.clientX - surukle.x0)) return; if (durak === 'tam' && dy < 0 && !ev.target.closest('.gm-hs-tut,.gm-hs-bas')) { surukle = null; return; } surukle.aktif = true; hs.setPointerCapture?.(ev.pointerId); hs.classList.add('is-surukle'); }
      const t = performance.now(); surukle.v = (ev.clientY - surukle.son) / Math.max(1, t - surukle.t); surukle.son = ev.clientY; surukle.t = t;
      let ny = surukle.yb + dy; const ust = 0, alt = Y.kapali(); if (ny < ust) ny = ust - (ust - ny) * .25; if (ny > alt) ny = alt + (ny - alt) * .25; y = ny; uygula(false); ev.preventDefault();
    };
    const birak = () => {
      if (!surukle) return; const s = surukle; surukle = null; hs.classList.remove('is-surukle'); if (!s.aktif) return;
      if (Math.abs(s.v) > .45) git(sonraki(s.v < 0 ? 1 : -1)); else { const l = ['kapali', 'yarim', 'tam'].map(k => [k, Math.abs(Y[k]() - y)]).sort((a, b) => a[1] - b[1]); git(l[0][0]); }
      GM.titres(4);
    };
    const tik = ev => { if (ev.target.closest('[data-hs-tik]')) { git(durak === 'tam' ? 'yarim' : 'tam'); return; } if (ev.target.closest('[data-hs-kapat]')) { git('yarim'); kay.scrollTop = 0; } };
    // Tam durakta iç kaydırma başa gelip aşağı çekilince yarıma iner (dokunmatik kaydırmayla).
    let kayY = 0; const kaydir = () => { const t = kay.scrollTop; hs.classList.toggle('is-kaydi', t > 4); kayY = t; };
    const boy = new ResizeObserver(() => { sahne.style.setProperty('--gm-hs-bas-h', `${bas.offsetHeight}px`); if (!surukle) { y = Y[durak](); uygula(false); } });
    hs.addEventListener('pointerdown', bas_); window.addEventListener('pointermove', tasi, {passive: false}); window.addEventListener('pointerup', birak); window.addEventListener('pointercancel', birak);
    hs.addEventListener('click', tik); kay.addEventListener('scroll', kaydir, {passive: true}); boy.observe(hs); boy.observe(oz);
    // Sekme ya da eylem tam içeriğe gidiyorsa sheet'i aç.
    const sekme = ev => { if (ev.detail?.ad && durak !== 'tam' && hs.contains(ev.target)) git('tam'); };
    hs.addEventListener('gm-degisim', sekme);
    sahne._hsGit = git;
    return () => { clearInterval(bekle); boy.disconnect(); window.removeEventListener('pointermove', tasi); window.removeEventListener('pointerup', birak); window.removeEventListener('pointercancel', birak); };
  };


  // ================= Referans kalıpları (Görev 4: Michelin, OpenTable, Tock, Airbnb) =================
  // Ekranın veri paketi (A/B/C ile aynı kurallar; ekran dosyaları paylaşır): galeri, rota bağlamı, özellikler, benzer, yakın, etkinlik, il, açık durumu.
  GM.mekanPaket = slug => {
    const m = GM.mekan(slug); if (!m) return null;
    const d = GM.mekanDetayVeri(slug), uzak = x => GM.km([m.lng, m.lat], [x.lng, x.lat]), bugun = GM.bugunIso();
    const galeri = d.galeri?.length ? d.galeri : [m.kapakB || m.kapak].filter(Boolean).map(src => ({src, alt: `${m.ad} kapak fotoğrafı`}));
    const rota = (GMV.rotalar || []).map(R => ({R, d: R.duraklar.find(x => x.slug === slug)})).filter(x => x.d).sort((a, b) => a.d.sapma - b.d.sapma || a.d.km - b.d.km)[0] || null;
    const benzer = (d.benzer || []).map(GM.mekan).filter(Boolean);
    if (benzer.length < 3) GMV.mekanlar.filter(x => x.slug !== slug && x.kapak && !benzer.includes(x) && (x.kategori === m.kategori || x.il === m.il)).sort((a, b) => uzak(a) - uzak(b)).slice(0, 6 - benzer.length).forEach(x => benzer.push(x));
    return {m, d, galeri, rota, benzer, ozellik: [...new Set([...(m.hizmet || []), ...(d.ozellik || [])])],
      yakin: GMV.mekanlar.filter(x => x.slug !== slug && uzak(x) < 4).sort((a, b) => uzak(a) - uzak(b)).slice(0, 8),
      etk: (GMV.etkinlikler || []).filter(e => (e.bit || e.tarih) >= bugun && e.lng != null).map(e => ({e, km: uzak(e)})).sort((a, b) => a.km - b.km).slice(0, 3),
      il: (GMV.ilKimlik || []).find(k => k.ad === m.il), acik: GM.mekanAcik(m, d)};
  };
  // Mekânın bir gündeki slotları (rezervasyon akışıyla aynı kural): kapalı gün boş; bugün için şimdi + 60 dk öncesi pasif.
  GM.mekanSlotlar = (m, d = {}, iso) => {
    const S = window.GMV?.rezervasyonSecenek || {}, bugun = GM.bugunIso(), g = (new Date(`${iso}T12:00:00`).getDay() + 6) % 7 + 1;
    if (d.saatler && !d.saatler[g]) return [];
    const sinir = iso === bugun ? GM.simdi().getHours() * 60 + GM.simdi().getMinutes() + 60 : -1;
    return (d.rezervasyon?.saatler || S.saatler || []).map(s => ({saat: s, pasif: dk(s) < sinir}));
  };
  // Olanaklar: hizmet + nitelik + beslenme adlarını ikonla eşler (web Mekân Özellikleri; Michelin "Facilities", Airbnb "What this place offers").
  const OLANAK_IKON = {Rezervasyon: 'rezervasyon', 'Online Rezervasyon': 'rezervasyon', Teras: 'teras', Bahçe: 'tree', 'Açık Alan': 'tree', 'Wi-Fi': 'wifi', Vejetaryen: 'vegan', Vegan: 'vegan', 'Glutensiz Seçenek': 'glutensiz', Otopark: 'otopark', Vale: 'vale', 'Paket Servis': 'bag-shopping', 'Gel-Al': 'bag-shopping', 'Canlı Müzik': 'music', 'Çocuk Dostu': 'cocuk', 'Evcil Hayvan Dostu': 'evcil', 'Kredi Kartı Geçerli': 'credit-card', 'Engelli Erişimi': 'engelsiz'};
  GM.olanaklar = (v = {}) => [...(v.m?.nitelik || []).map(x => ({ikon: x.ikon, ad: x.ad, dogrulandi: true})), ...(v.ozellik || []).map(ad => ({ikon: OLANAK_IKON[ad] || 'onay', ad}))];
  // Uzun akış (Michelin/Airbnb ilan sayfası; GM.bolumler ailesi, ince ayraçlı tek zemin): [{ust, baslik, html, gri}|html]; o.bindir: galeri üstüne biner.
  GM.refAkis = (l = [], o = {}) => `<div class="${liste('gm-ref-akis', o.bindir && 'is-bindir', o.sinif)}">${l.filter(Boolean).map(x => (typeof x === 'string' ? `<section>${x}</section>` : `<section${x.gri ? ' class="is-gri"' : ''}${x.id ? ` id="${esc(x.id)}"` : ''}>${x.ust ? `<p class="gm-ref-ust">${esc(x.ust)}</p>` : ''}${x.baslik ? `<h2>${esc(x.baslik)}</h2>` : ''}${x.html || ''}</section>`)).join('')}</div>`;
  // Eylem çipleri şeridi (Google Maps yer kartı; GM.cip ailesi, yuvarlak küçük çip): kayan tek satır.
  GM.eylemCipleri = l => `<div class="gm-serit gm-hs-cipler">${l.filter(Boolean).join('')}</div>`;
  // Detay kuyruğu (GM.detay o.kuyruk ile aynı kap): sekmesiz ekranlarda sekmelerin altına.
  GM.detayKuyruk = html => `<div class="gm-detay-icerik"><div class="gm-kuyruk">${html}</div></div>`;
  // Görüntülenme sayacı (Gastro yazar satırı sağındaki göz; GM.mekanKimlik ile aynı biçim). Sayı yoksa çizilmez.
  // Bilgi kartı şeridi (Görev 14/5, Beyar: "Mekân Deneyimi" slider): Gastro/Diet kart şeridi kalıbı — ikon kutusu + başlık + tek satır açıklama; sağda sonraki kart görünür. l: [{ikon, baslik, metin}]
  GM.bilgiKartSerit = (l = [], o = {}) => `<div class="${liste('gm-serit gm-bks', o.sinif)}" role="list" aria-label="${esc(o.etiket || 'Bilgi kartları')}">${l.map(x => `<article class="gm-bks-kart" role="listitem">${GM.ikonKutu({ikon: x.ikon, boyut: 'md'})}<b>${esc(x.baslik)}</b>${x.metin ? `<small>${esc(x.metin)}</small>` : ''}</article>`).join('')}</div>`;
  GM.gozSayi = n => (n ? `<span class="gm-mkim-goz" aria-label="${esc(n)} görüntülenme">${ik('eye')}${esc(GM.sayi(n))}</span>` : '');
  // Alıntı bloğu (Michelin editoryal tipografisi; GM.metinBlok ailesi): featured boyda alıntı, altında kaynak satırı.
  GM.alinti = (o = {}) => `<figure class="gm-alinti"><blockquote>${vurgu(o.metin || '')}</blockquote>${o.kaynak ? `<figcaption>${ik(o.ikon || 'pen-nib')}<span>${esc(o.kaynak)}</span></figcaption>` : ''}</figure>`;
  // Ayırt ediciler satırı (Michelin ayırt edicilik ikonları → Gourmet'in gerçek seçkileri; ödül uydurulmaz): ikon + büyük harf etiket, ince ayraçlı.
  GM.ayirtSatir = (l = []) => (l.length ? `<ul class="gm-ayirt gm-tek-satir" aria-label="Seçkiler">${l.map(x => `<li>${ik(x.ikon)}<span>${esc(x.ad)}</span></li>`).join('')}</ul>` : '');
  // Olanak listesi (GM.kunye ikon-satır ritmi; Michelin olanak ızgarası / Airbnb "neler var"): sutun 1|2, en çok n, fazlası "Tümünü göster" düğmesi.
  GM.olanakListe = (l = [], o = {}) => { const n = o.en || l.length, g = l.slice(0, n); return `<div class="gm-olanak-kap"><ul class="${liste('gm-olanak', o.sutun === 2 && 'is-iki', o.sinif)}">${g.map(x => `<li class="${x.dogrulandi ? 'is-dogru' : ''}">${ik(x.ikon)}<span>${esc(x.ad)}</span>${x.dogrulandi ? `<small>${ik('dogrulandi')}Doğrulandı</small>` : ''}</li>`).join('')}</ul>${l.length > n || o.tumu ? GM.btn({metin: o.tumuMetin || `${l.length} özelliğin tümünü göster`, tur: 'secondary', tam: o.sutun !== 2, veri: {eylem: 'mk-olanak'}}) : ''}</div>`; };
  GM.olanakSheet = (l = [], o = {}) => GM.sheet({baslik: o.baslik || 'Özellikler', html: GM.olanakListe(l)});
  // Etiket şeridi (GM.ozellik çip görünümü; The Infatuation/OpenTable "Şunun için ideal"): bilgi etiketi, dokunulmaz; tek satır, sığmazsa yatay kayar (yığılma kuralı 1).
  GM.etiketBulut = (l = [], o = {}) => (l.length ? `<ul class="${liste('gm-etiket-bulut gm-tek-satir', o.sinif)}">${l.map(x => `<li>${x.ikon ? ik(x.ikon) : ''}<span>${esc(x.ad ?? x)}</span></li>`).join('')}</ul>` : '');
  // Kişisel not (Michelin "Notes"; webde yok, mobil ekstra): cihazda saklanır, kimse görmez.
  GM.notSheet = (m, degisti) => { const k = GM.mekanKayit.al('not', m.slug); return GM.sheet({baslik: 'Notun', html: `<div class="gm-yigin">${GM.p('Yalnız **sen** görürsün. Ne yemek istediğini, kiminle gideceğini yaz.', {ton: 'ikincil'})}${GM.input({ad: 'not-metin', cokSatir: true, deger: k?.metin || '', yer: 'Ör. Teras masası iste, tadım menüsünü dene'})}</div>`, altBar: GM.btnIkili(k ? {metin: 'Notu sil', tur: 'yikici-ikincil', veri: {eylem: 'not-sil'}} : {metin: 'Vazgeç', attrs: 'data-sheet-kapat'}, {metin: 'Kaydet', veri: {eylem: 'not-kaydet'}}), sonra: d => { const a = GM.eylem(d, 'not-kaydet', () => { const t = d.querySelector('[name="not-metin"]').value.trim(); GM.mekanKayit.yaz('not', m.slug, t ? {metin: t} : false); d.kapat(); degisti?.(); GM.toast(t ? 'Notun **kaydedildi**' : 'Not boş, kaydedilmedi', {ikon: 'duzenle'}); }); const b = GM.eylem(d, 'not-sil', () => { GM.mekanKayit.yaz('not', m.slug, false); d.kapat(); degisti?.(); GM.toast('Not silindi'); }); return () => { a(); b(); }; }}); };

  // Rezervasyon kapsülü + slot bandı (OpenTable "Book a table"): kişi · gün · saat seçimi üstte, gün segmenti ve dolu slot çipleri altta.
  // Kök [data-rk] durumu (kisi, tarih) taşır; slot çipi data-eylem="mk-rez" data-id=saat data-tarih → rezervasyon akışı 2. adımda açılır.
  const gunAd = (iso, i) => (i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : GMTakvim.kisa(iso));
  const rkGunler = (n = 3) => { const b = GM.bugunIso(); return Array.from({length: n}, (_, i) => { const t = new Date(`${b}T12:00:00`); t.setDate(t.getDate() + i); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; }); };
  const rkSlot = (m, d, iso) => { const l = GM.mekanSlotlar(m, d, iso).filter(x => !x.pasif); return l.length ? `<div class="gm-rzb-slotlar">${l.map(x => `<button type="button" class="gm-rzb-slot" data-eylem="mk-rez" data-id="${esc(x.saat)}" data-tarih="${esc(iso)}"><b>${esc(nokta(x.saat))}</b><small>Masa</small></button>`).join('')}</div>` : `<p class="gm-rzb-yok">${ik('saat')}<span>Bu gün <b>uygun saat yok</b>; mekân kapalı ya da dolu.</span></p>`; };
  GM.slotBant = (m, d = {}, o = {}) => { const G = rkGunler(o.gun || 3), t = o.tarih || G[0]; return `<section class="${liste('gm-rzb', o.sinif)}" data-rk data-slug="${esc(m.slug)}" data-tarih="${esc(t)}" data-kisi="${+o.kisi || 2}"><div class="gm-rzb-kapsul" role="group" aria-label="Rezervasyon seçimi"><button type="button" data-rk-sec="kisi">${ik('kisi')}<span data-rk-kisi>${+o.kisi || 2} kişi</span></button><button type="button" data-rk-sec="tarih">${ik('takvim')}<span data-rk-tarih>${G.indexOf(t) >= 0 ? 'Başka gün' : esc(GMTakvim.kisa(t))}</span></button><span class="gm-rzb-bilgi">${ik('saat')}<span>${esc(o.not || 'Onayla kesinleşir')}</span></span></div>${GM.segment({ad: 'rk-gun', secili: t, ogeler: G.map((x, i) => ({ad: gunAd(x, i), deger: x}))})}<div data-rk-slot>${rkSlot(m, d, t)}</div><p class="gm-rzb-puan">${ik('puanDada')}<span>Rezervasyon gerçekleşince <b>+25 Dada Puan</b></span></p></section>`; };
  const rkYaz = (kok, m, d, t) => { kok.dataset.tarih = t; kok.querySelector('[data-rk-slot]').innerHTML = rkSlot(m, d, t); const G = rkGunler(3), i = G.indexOf(t); kok.querySelector('[data-rk-tarih]').textContent = i < 0 ? GMTakvim.kisa(t) : 'Başka gün'; kok.querySelectorAll('.gm-seg button').forEach(b => b.setAttribute('aria-selected', b.dataset.seg === t)); GM.segGosterge(kok); };
  document.addEventListener('gm-degisim', ev => { if (ev.detail?.ad !== 'rk-gun') return; const k = ev.target.closest('[data-rk]'), m = k && GM.mekan(k.dataset.slug); if (m) rkYaz(k, m, GM.mekanDetayVeri(m.slug), ev.detail.deger); });
  document.addEventListener('click', ev => {
    const b = ev.target.closest?.('[data-rk-sec]'); if (!b) return; const k = b.closest('[data-rk]'), m = GM.mekan(k.dataset.slug), d = GM.mekanDetayVeri(m.slug);
    if (b.dataset.rkSec === 'tarih') { GM.takvimSheet({ad: 'rk-takvim', baslik: 'Gün seç', secili: k.dataset.tarih, min: GM.bugunIso(), max: rkGunler(14).at(-1)}).then(v => { if (v) rkYaz(k, m, d, v); }); return; }
    GM.sheet({baslik: 'Kaç kişi?', html: GM.alan({etiket: 'Masa', html: `<div class="gm-yigin-12">${GM.stepper({ad: 'rk-kisi', deger: +k.dataset.kisi, min: 1, max: 12, birim: 'kişi', aria: 'Kişi sayısı'})}</div>`}), altBar: GM.btn({metin: 'Tamam', tam: true, attrs: 'data-sheet-kapat'}), sonra: s => GM.on(s, 'rk-kisi', v => { k.dataset.kisi = v; k.querySelector('[data-rk-kisi]').textContent = `${v} kişi`; })});
  });

  // Vitrin başlığı (Tock mekân sayfası; GM.detay banner ailesi): fotoğraf, üstüne binen kare logo karosu, ad, tek meta satırı (o.metaHtml: GM.mekanMeta).
  GM.vitrinBas = (o = {}) => `<header class="${liste('gm-vitrin', o.sinif)}"><div class="gm-vitrin-foto"><span class="gm-photo"${bg(o.gorsel)}></span></div><div class="gm-vitrin-govde"><span class="gm-vitrin-logo" aria-hidden="true">${o.logo ? `<span class="gm-photo"${bg(o.logo)}></span>` : `<b>${esc(String(o.baslik || '?').charAt(0))}</b>`}</span>${o.sag ? `<span class="gm-vitrin-sag">${o.sag}</span>` : ''}<h1 class="gm-t-display">${esc(o.baslik)}</h1>${o.alt ? `<p class="gm-vitrin-alt">${esc(o.alt)}</p>` : ''}${o.metaHtml || (o.meta ? `<p class="gm-vitrin-meta gm-tek-satir">${o.meta}</p>` : '')}</div></header>`;
  // Deneyim bileti (Tock "experience" kartı; GM.kart ailesi): üst kısımda tür + başlık + metin, delikli ayraç, alt koçanda meta ve eylem.
  GM.deneyimBilet = (o = {}) => `<article class="${liste('gm-bilet-d', o.tarih && 'has-tarih', o.gorsel && 'has-foto', o.sinif)}">${o.tarih ? `<div class="gm-bilet-d-tarih">${GM.tarihBlok(o.tarih)}</div>` : ''}${o.gorsel ? `<div class="gm-bilet-d-foto"><span class="gm-photo"${bg(o.gorsel)}></span>${o.rozet ? `<span class="gm-bilet-d-rozet">${esc(o.rozet)}</span>` : ''}</div>` : ''}<div class="gm-bilet-d-ust">${o.etiket ? `<small class="gm-card__category">${o.ikon ? ik(o.ikon) : ''}${esc(o.etiket)}</small>` : ''}<h3>${esc(o.baslik)}</h3>${o.metin ? `<p>${vurgu(o.metin)}</p>` : ''}</div><div class="gm-bilet-d-ayrac" aria-hidden="true"></div><div class="gm-bilet-d-alt"><span class="gm-bilet-d-meta gm-tek-satir">${(o.meta || []).map(x => `<span>${ik(x.ikon)}${esc(x.metin)}</span>`).join('')}</span>${o.eylem ? GM.btn({boyut: 'sm', ...o.eylem}) : ''}</div></article>`;

  // Orta başlık (Airbnb ilan başlığı; GM.metinBlok ailesi): ortalı ad + tek meta satırı (o.metaHtml: GM.mekanMeta, ortalı; sığmazsa kayar).
  GM.ortaBaslik = (o = {}) => `<header class="gm-orta-bas"><h1 class="gm-t-page">${esc(o.baslik)}</h1>${o.alt ? `<p>${esc(o.alt)}</p>` : ''}${o.metaHtml || (o.meta ? `<p class="gm-orta-bas-meta gm-tek-satir">${o.meta}</p>` : '')}</header>`;
  // Öne çıkanlar (Airbnb ikonlu üç madde; GM.satir ailesi, kartsız): büyük ikon + kalın başlık + açıklama.
  GM.oneCikanlar = (l = []) => `<ul class="gm-one-cikan">${l.map(x => `<li>${ik(x.ikon)}<span><b>${esc(x.baslik)}</b>${x.metin ? `<small>${esc(x.metin)}</small>` : ''}</span></li>`).join('')}</ul>`;
  // Kişi satırı (Airbnb "ev sahibi"; GM.satir + GM.avatar): avatar, ad, alt, sağda rozet.
  GM.kisiSatir = (o = {}) => `<div class="gm-kisi-satir">${GM.avatar({ad: o.ad, boyut: o.boyut || 56})}<span class="gm-satir-metin"><b>${esc(o.baslik)}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span>${o.rozet ? GM.rozet({metin: o.rozet, ton: 'notr'}) : ''}${o.sag || ''}</div>`;
  // Fotoğraf turu (Airbnb; GM.sheet tam + ızgara): ilk fotoğraf tam genişlik, kalanlar iki sütun.
  GM.galeriIzgara = (G = [], o = {}) => GM.sheet({baslik: o.baslik || `Fotoğraflar (${G.length})`, tam: true, sinif: 'gm-galeri-sheet', html: `<div class="gm-galeri-izgara">${G.map((g, k) => `<figure class="gm-galeri-izgara-oge${k === 0 || (G.length - 1) % 2 === 1 && k === G.length - 1 ? ' is-genis' : ''}"><span class="gm-photo" role="img" aria-label="${esc(g.alt || '')}"${bg(g.src)}></span></figure>`).join('')}</div>${G.some(g => g.alt) ? `<ol class="gm-galeri-not">${G.map((g, k) => (g.alt ? `<li><b>${k + 1}</b>${esc(g.alt)}</li>` : '')).join('')}</ol>` : ''}`});
  // Bilinmesi gerekenler (Airbnb "Things to know"; GM.satirlar): her satır kendi sheet'ini açar.
  GM.bilgiSheet = (tur, m, d = {}) => {
    const H = {
      rez: ['Rezervasyon koşulları', `${GM.p(d.rezervasyon?.kosul ? `${d.rezervasyon.kosul} **${d.rezervasyon.not}**` : 'Talebin mekân sahibine iletilir, **onayıyla** kesinleşir.')}${GM.kunye([{ikon: 'kisi', etiket: 'Kişi', deger: '1–12 (8+ grup)'}, {ikon: 'takvim', etiket: 'İleri tarih', deger: '14 gün'}, {ikon: 'saat', etiket: 'Slot', deger: '30 dk'}])}`],
      alerjen: ['Alerjen ve beslenme', GM.p(d.alerjen || 'Bu mekân henüz alerjen bilgisi paylaşmadı; hassasiyetin varsa **siparişten önce** mutlaka sor. Rezervasyonda alerjen notu bırakabilirsin.')],
      saat: ['Çalışma saatleri', d.saatler ? GM.saatTablo(d.saatler) : GM.veriYok('Çalışma saatleri **henüz girilmedi**.')]
    }[tur]; if (!H) return null;
    return GM.sheet({baslik: H[0], html: `<div class="gm-yigin">${H[1]}</div>`});
  };

  // Yükleniyor iskeleti 'harita-sheet' (GM.iskelet ailesine yeni tür): harita zemini + yarım sheet içinde başlık, satır, iki düğme.
  const iskEski = GM.iskelet;
  GM.iskelet = (a = 4, b = 'kart') => (a === 'harita-sheet' || b === 'harita-sheet' ? `<div class="gm-isk-hs" aria-busy="true" inert><span class="gm-iskelet is-hs-zemin"></span><div class="gm-isk-hs-sheet"><span class="gm-iskelet is-hs-tut"></span><span class="gm-iskelet is-etiket"></span><span class="gm-iskelet is-baslik"></span><span class="gm-iskelet is-satir is-kisa"></span><span class="gm-isk-hs-iki"><span class="gm-iskelet is-hs-btn"></span><span class="gm-iskelet is-hs-btn"></span></span><span class="gm-isk-hs-iki is-uc"><span class="gm-iskelet is-hs-foto"></span><span class="gm-iskelet is-hs-foto"></span><span class="gm-iskelet is-hs-foto"></span></span></div></div>` : iskEski(a, b));
})();
