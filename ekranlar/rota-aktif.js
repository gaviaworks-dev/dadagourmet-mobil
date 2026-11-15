/* Dada Route aktif rota katmanı (Görev 12 · patron mimari belgesi 15 Kas: inbox/gorseller/gourmet-mobil/2026-11-15-patron-karar/dada-route-mimari-spesifikasyonu.pdf).
   #/rota/:id    rota-harita: 3 + 4 hibriti. Ferah harita; üstte arama ("A → B boyunca ara") + Yakıtlı / Elektrikli + sayaçlı kategori barı
                 (Ne Yenir? · Ne Alınır? · Geçiş Rehberi · Yol İhtiyaçları); pine dokununca altta yüzen mini kart (+ Ekle: durak km sırasıyla yerleşir);
                 yukarı çekilen çekmece (Google Maps satır dili); sabit alt aksiyon çubuğu Kaydet · Paylaş · Aktar · Yola Çık.
   #/rota/liste/:id rota-liste: aynı satır/rozet diliyle liste görünümü, sonsuz kaydırma.
   #/rota/web/:id   rota-web: masaüstünde kurulan rotayı tek dokunuşla açma.
   Durum: rota-<id> {eklenen: mekân slug, mola: katman kimliği, kat, alt} (rota-ek.js ile ortak) · rota-arac ('yakit'|'ev'; planla ile ortak).
   İlk çizim sorgusu (kare ve derin bağlantı): kat, alt, arac, pin, cekmece. Hâller: ?hal=yukleniyor|hata|konum|cevrimdisi|sinir. */
(() => {
  const R0 = 'istanbul-izmir';
  const rota = ctx => GM.rotaBul(ctx.param?.id) || GM.rotaBul(R0);
  const oku = id => ({eklenen: [], mola: [], kat: 'neYenir', alt: null, ...(GM.durum.oku(`rota-${id}`, null) || {})});
  const yaz = (id, d) => GM.durum.yaz(`rota-${id}`, {...oku(id), ...d});
  const aracOku = () => GM.durum.oku('rota-arac', 'yakit') || 'yakit';
  const SORGU = ['kat', 'alt', 'arac', 'pin', 'cekmece'];
  const KAT_AD = {neYenir: 'Ne Yenir?', neAlinir: 'Ne Alınır?', rehber: 'Geçiş Rehberi', yol: 'Yol İhtiyaçları'};
  const KAT_IKON = {neYenir: 'neYenir', neAlinir: 'neAlinir', rehber: 'cografi', yol: 'yakit'};
  const katIkon = v => (v.kat === 'yol' ? v.K.altBul(v.alt).ikon : KAT_IKON[v.kat]);
  const kmMetin = km => (km < 1 ? 'kalkışta' : `${GM.sayi(Math.round(km))}. km`);
  const paylasUrl = R => `https://dadagourmet.com/dada-route/${R.id}`;
  // Seçili pin ve harita kamerası yeniden çizimde korunur (ekle/çıkar, kategori değişimi haritayı baştan kurar).
  let secim = null, kamera = null, cekDurak = null;  // cekDurak: yeniden çizimde çekmece konumu korunur (Görev 14/20: listeden ekleyince çekmece kapanmasın)

  // Ekran verisi: durum + ilk çizim sorgusu. ?hal=sinir: rota durak sınırına kadar dolu gösterilir (kayda yazılmaz).
  const veri = ctx => {
    const R = rota(ctx), s = ctx.sorgu || {}, d = oku(R.id), arac = ['ev', 'yakit'].includes(s.arac) ? s.arac : aracOku();
    const K = GM.rotaKategori(R, {arac});
    if (s.hal === 'sinir') { d.eklenen = K.ogeler.neYenir.slice(0, GM.ROTA_DURAK_SINIR).map(x => x.id); d.mola = []; }
    const kat = KAT_AD[s.kat] ? s.kat : KAT_AD[d.kat] ? d.kat : 'neYenir', alt = K.altBul(s.alt || d.alt).deger, E = GM.rotaEklenen(d, K);
    const ek = E.reduce((t, x) => t + (x.sapma || 0), 0), cd = s.hal === 'cevrimdisi', indi = GM.rotaPaketler().some(p => p.id === R.id);
    return {R, s, d, K, kat, alt, arac, E, ek, sanal: s.hal === 'sinir', konum: s.hal === 'konum', cd, indi, bos: cd && !indi};
  };
  const pinler = v => {
    const {R, K, kat, alt, arac, E} = v, ek = new Set(E.map(x => x.id));
    const p = x => ({id: x.id, lng: x.lng, lat: x.lat, ad: x.ad, ...(x.tur === 'mekan' ? {} : {tur: x.tur})});
    // Elektrikli araçta şarj noktaları her kategoride soluk katman olarak kalır (belge §3B: şarj öne).
    const sarj = arac === 'ev' && !(kat === 'yol' && alt === 'sarj') ? K.ogeler.yol.filter(k => k.tur === 'sarj' && !ek.has(k.id)).map(x => ({...p(x), soluk: true})) : [];
    return [{id: 'bas', lng: R.cizgi[0][0], lat: R.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic', ad: R.kalkis}, {id: 'son', lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis', ad: R.varis},
      ...(v.bos ? [] : K.liste(kat, alt).filter(x => !ek.has(x.id)).map(p)), ...sarj, ...E.map((x, i) => ({id: x.id, lng: x.lng, lat: x.lat, sira: i + 1, ad: x.ad}))];
  };

  // ---------- Liste parçaları (çekmece ve liste görünümü ortak) ----------
  const katOzet = v => {
    const L = v.K.liste(v.kat, v.alt);
    if (v.kat === 'neYenir') { const y = L.filter(x => x.uzak <= 1).length; return `${GM.sayi(L.length)} sonuç · Yol üstü ${y} · Yola yakın ${L.length - y}`; }
    if (v.kat === 'neAlinir') return `${GM.sayi(L.reduce((t, x) => t + x.urunler.length, 0))} coğrafi işaretli ürün · ${L.length} il`;
    if (v.kat === 'rehber') return `${L.length} il geçişi · coğrafi işaretler TÜRKPATENT kaydı`;
    const a = v.K.altBul(v.alt); return `${a.metin} · ${L.length} nokta${a.deger === 'yakit' ? ' · OpenStreetMap' : ''}${v.arac === 'ev' ? ' · Elektrikli' : ''}`;
  };
  const katBaslik = v => (v.kat === 'yol' ? `Rota boyunca · ${v.K.altBul(v.alt).metin}` : `Rota boyunca · ${KAT_AD[v.kat]}`);
  const katBos = v => {
    if (v.kat === 'neYenir') return GM.bos({ikon: 'mekan', baslik: 'Bu rotada henüz Dada durağı yok', metin: '**Geçiş Rehberi**’nde geçtiğin illerin coğrafi işaretli lezzetleri var.', eylem: {metin: 'Geçiş Rehberi', tur: 'secondary', veri: {eylem: 'kat-sec', id: 'rehber'}}});
    if (v.kat !== 'yol') return GM.bos({ikon: KAT_IKON[v.kat], baslik: 'Bu rotada kayıt yok', metin: 'Geçtiğin illerde bu türde **tescilli ürün** bulunamadı.'});
    const a = v.K.altBul(v.alt), mola = v.K.altBul('mola');
    return a.deger === 'sarj'
      ? GM.bos({ikon: 'sarj', baslik: 'Bu rotada şarj noktası yok', metin: 'Rota koridorunda **şarj istasyonu** kaydı bulunamadı. Yola tam şarjla çık; uzun molayı dinlenme tesisinde ver.', eylem: mola.ogeler.length ? {metin: `Mola durakları · ${mola.ogeler.length}`, ikon: 'dinlenme', tur: 'secondary', veri: {eylem: 'alt-sec', id: 'mola'}} : null})
      : GM.bos({ikon: a.ikon, baslik: `Bu rotada ${a.metin.toLocaleLowerCase('tr')} noktası yok`, metin: 'Rota koridorunda bu türde nokta bulunamadı.'});
  };
  const satirlar = (v, l) => { const ek = new Set(v.E.map(x => x.id)); return l.map(x => GM.yolSatir(x, {eklendi: ek.has(x.id), sira: ek.has(x.id) ? v.E.findIndex(e => e.id === x.id) + 1 : null})); };

  // ---------- Çekmece gövdesi (aşama 2: Komoot özet ve istatistik; belge §3D, §4) ----------
  // Sıra: tek satır metrik → km şeridi + durakların → sapma dağılımı → güzergâh ihtiyaçları → seçili kategorinin listesi (Google Maps satırları).
  const ILK = 6;
  const IHT = [['yakit', 'Yakıt'], ['sarj', 'Şarj'], ['ibadet', 'İbadethane'], ['dinlenme', 'Dinlenme'], ['karavan', 'Karavan']];
  const govde = v => {
    const {R, K, E} = v, L = K.liste(v.kat, v.alt), n = K.ogeler.neYenir.length;
    if (v.bos) return GM.bos({ikon: 'cevrimdisi', baslik: 'Bu rota cihazda yok', metin: 'Bağlantı gelince harita ve duraklar açılır. İnternet çekmeyen yollar için rotayı **önceden indir**.', eylem: {metin: 'Çevrimdışı rotalar', tur: 'secondary', git: '#/rota/cevrimdisi'}});
    const liste = L.length ? GM.yigin([GM.yolSatirlar(satirlar(v, L.slice(0, ILK))), L.length > ILK ? GM.btn({metin: `Tümünü liste görünümünde aç · ${GM.sayi(L.length)}`, ikon: 'list-ul', tur: 'secondary', tam: true, git: `#/rota/liste/${R.id}`}) : ''], 8) : katBos(v);
    const duraklar = E.length ? GM.yolSatirlar(E.map((x, i) => GM.yolSatir(x, {eklendi: true, sira: i + 1}))) : GM.bilgi({metin: 'Haritadaki kartlarda **+ Ekle**’ye dokun; durak kalkış ile varış arasına km sırasıyla yerleşir.'});
    const ihtiyac = IHT.map(([tur, ad]) => ({deger: tur, tur, ad, sayi: K.ogeler.yol.filter(k => k.tur === tur).length}));
    // Görev 14/18: çekmece bölümleri zebra (GM.bolumler / .gm-icerikler kalıbı; çekmecede tam genişlik).
    return GM.bolumler([
      GM.rotaMetrik([{etiket: 'Mesafe', deger: GM.sayi(Math.round(R.km)), birim: 'km'}, {etiket: 'Süre', deger: GM.sure(R.dk + v.ek)}, {etiket: 'Önerilen durak', deger: String(n)}, {etiket: 'Bölgesel lezzet', deger: String(K.lezzet)}]),
      GM.krListe([GM.kmSerit(R, {duraklar: K.ogeler.neYenir, eklenen: E}), duraklar], {ikon: 'rota', baslik: 'Güzergâh', alt: `${(R.iller || []).length} il · ${E.length ? `${E.length} durak · +${v.ek} dk sapma` : 'durak eklenmedi'}`, eylem: GM.btn({metin: 'Saatli plan', ikon: 'saat', tur: 'secondary', boyut: 'sm', git: `#/rota/ozet/${R.id}`})}),
      GM.dagilimCubuk({baslik: 'Sapma dağılımı', alt: `${n} durak · gidiş-dönüş`, ogeler: GM.sapmaDagilim(K.ogeler.neYenir)}),
      GM.krListe([GM.ihtiyacOzet(ihtiyac)], {ikon: 'yakit', tur: 'katman', baslik: 'Güzergâh ihtiyaçları', alt: `Rota koridorunda ${K.ogeler.yol.length} nokta · yakıt OpenStreetMap`}),
      GM.krListe([liste], {ikon: katIkon(v), baslik: katBaslik(v), alt: katOzet(v), eylem: v.kat === 'neYenir' && L.length ? GM.btn({metin: 'Süz', ikon: 'filtre', tur: 'secondary', boyut: 'sm', veri: {eylem: 'filtre'}}) : ''})
    ]);
  };
  const cekmeceBas = v => GM.cekmeceOzet({baslik: `${v.R.kalkis} → ${v.R.varis}`, alt: GM.esc(`${GM.sayi(Math.round(v.R.km))} km · ${GM.sure(v.R.dk + v.ek)} · ${v.E.length ? `${v.E.length} durak` : `${GM.rotaSayi(v.R).onerilen} öneri`}`),
    // Tam konumda (üst panel çekilmişken) haritaya dönüş: başta tek ikon düğme; yarım ve kapalıda gizli.
    eylem: GM.btn({metin: 'Liste', ikon: 'list-ul', tur: 'secondary', boyut: 'sm', git: `#/rota/liste/${v.R.id}`}) + GM.ikonBtn({ikon: 'harita', etiket: 'Haritaya dön', tur: 'kutu', sinif: 'gm-ra-cek-kapat', veri: {eylem: 'cekmece-kapat'}})});
  const aksiyon = R => GM.rotaAksiyon({ogeler: [{ikon: 'kaydet', ad: GM.rotaKayitliMi(R) ? 'Kaydedildi' : 'Kaydet', basili: GM.rotaKayitliMi(R), veri: {eylem: 'rh-kaydet'}}, {ikon: 'paylas', ad: 'Paylaş', veri: {eylem: 'rh-paylas'}}, {ikon: 'navigasyon', ad: 'Aktar', veri: {eylem: 'rh-aktar'}}],
    ana: {metin: 'Yola çık', ikon: 'arac', veri: {eylem: 'rh-yola'}}});

  // Hâller: rota hesaplanıyor (iskelet) · rota çizilemedi (hata + tekrar). Diğerleri ekranın içinde.
  const halEkran = ctx => (ctx.sorgu.hal === 'hata'
    ? GM.hataEkran({tur: 'sunucu', baslik: 'Rota çizilemedi', metin: 'Yol tarifine şu an ulaşılamadı. Rotan ve eklediğin duraklar kayıtlı; biraz sonra tekrar dene.', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: ctx.hash.replace(/[?&]hal=hata/, '')}, ikinciller: [{metin: 'Dada Route’a dön', ikon: 'rota', yerine: '#/rota'}]})
    : ctx.sorgu.hal === 'yukleniyor' ? GM.iskelet('harita-sheet') : null);

  // Navigasyon izni (Co-Pilot ve yaklaşım bildirimi): izinIstemi metni sheet'te.
  const konumIzni = (sonra) => GM.sheet({baslik: 'Konum izni', html: GM.yigin([GM.p('Yol takibi **sıradaki durağa yaklaşınca** seni uyarır. Bunun için yolculuk boyunca konumun gerekir; konum cihazından çıkmaz.'),
    GM.maddeler([['sesli', 'Yaklaşım bildirimi', 'Durağa 3 km kala sesli ve yazılı uyarı'], ['cevrimdisi', 'Çekmeyen yolda da', 'İndirilen rotada konum yerelden izlenir'], ['lock', 'Yalnız yolculukta', 'Yola Çık kapanınca konum izlenmez']])], 16),
  altBar: GM.btnIkili({metin: 'Şimdi değil', attrs: 'data-sheet-kapat'}, {metin: 'İzin ver', ikon: 'konum', veri: {eylem: 'izin-ver'}}),
  sonra: (k, h) => GM.eylem(k, 'izin-ver', () => { h.kapat(); GM.toast('Konum izni verildi · **yaklaşım bildirimi** açık', {tur: 'basari', ikon: 'konum'}); sonra?.(); })});

  // =====================================================================
  // #/rota/:id · aktif rota haritası
  // =====================================================================
  GM.ekran('rota-harita', {
    tur: 'tam', ust: '#/rota', haller: false,
    ciz: ctx => {
      const h = halEkran(ctx); if (h) return h;
      const v = veri(ctx), {R, K, kat, alt, arac} = v, kam = kamera?.rota === R.id ? kamera : null; kamera = null;
      const saat = GM.simdi().toTimeString().slice(0, 5).replace(':', '.');
      const ek = v.cd ? GM.cevrimdisi(v.indi ? 'Çevrimdışı · paketten' : 'Rota cihazda yok', v.indi ? {saat: GM.rotaPaketler().find(p => p.id === R.id)?.tarih || saat} : {})
        : v.E.length >= GM.ROTA_DURAK_SINIR ? GM.bant({ton: 'uyari', ikon: 'durak', metin: `**Durak sınırı doldu · ${v.E.length}/${GM.ROTA_DURAK_SINIR}.** Yeni durak için birini çıkar.`, eylem: {metin: 'Duraklar', veri: {eylem: 'cekmece-tam'}}})
        : v.konum ? GM.bant({ton: 'uyari', ikon: 'konum', metin: '**Konum izni kapalı.** Yaklaşım bildirimi için gerekir.', eylem: {metin: 'İzin ver', veri: {eylem: 'konum-izin'}}}) : '';
      const ust = GM.rotaUst({
        arama: GM.haritaArama({yer: `${R.kalkis} → ${R.varis} boyunca ara`, ad: 'rh-ara'}),
        arac: GM.aracSecim({ad: 'rh-arac', secili: arac}),
        kategori: GM.kesifKategoriler({ad: 'rh-kat', secili: kat, etiket: 'Rota boyunca keşfet', ogeler: K.kat}),
        alt: kat === 'yol' ? GM.cipler({ad: 'rh-alt', tur: 'tek', etiket: 'Yol ihtiyaçları', secili: alt, ogeler: K.alt.map(a => ({deger: a.deger, metin: a.metin, ikon: a.ikon, sayi: a.ogeler.length}))}) : '',
        ek});
      return GM.haritaEkran({
        sinif: 'gm-ra',
        harita: GM.harita({ad: 'rh-h', tam: true, kume: kat === 'neYenir', koridor: true, kontroller: false, cevrimdisi: v.cd, rota: v.bos ? {} : {cizgi: R.cizgi}, pinler: v.bos ? [] : pinler(v), dolgu: {top: kat === 'yol' ? 300 : 256, bottom: 210, left: 80, right: 72}, etiket: `${R.ad} rota haritası`, ...(kam ? {merkez: kam.merkez, zoom: kam.zoom} : {})}),
        ust,
        cekmece: GM.cekmece({ad: 'rh-cekmece', durak: ['kapali', 'yarim', 'tam'].includes(v.s.cekmece) ? v.s.cekmece : (() => { const d = cekDurak?.rota === R.id && !secim ? cekDurak.durak : null; cekDurak = null; return d || (v.bos ? 'yarim' : 'kapali'); })(), bas: cekmeceBas(v), etiket: 'Rota özeti ve duraklar', html: govde(v)}),
        secim: true
      });
    },
    altBar: ctx => (halEkran(ctx) ? '' : aksiyon(rota(ctx))),
    sonra: (kok, ctx) => {
      if (halEkran(ctx)) return null;
      const v = veri(ctx), {R, K} = v, id = R.id;
      const h = kok.querySelector('.gm-harita'), cek = () => kok.querySelector('.gm-kl-cekmece'), hsec = () => kok.querySelector('.gm-kl-hsecim');
      const sorgulu = SORGU.some(k => ctx.sorgu[k] != null);
      // Yeniden çiz: kamera korunur; ilk çizim sorgusu varsa sorgusuz adrese geçilir (durum kazanır), ?hal= korunur.
      const yenile = () => { const m = h?._harita; if (m) kamera = {rota: id, merkez: m.getCenter().toArray(), zoom: m.getZoom()}; const ce = kok.querySelector('.gm-kl-cekmece'); if (ce) cekDurak = {rota: id, durak: ce.dataset.durak}; if (sorgulu) GM.yerine(`#/rota/${id}${ctx.sorgu.hal ? `?hal=${ctx.sorgu.hal}` : ''}`); else GM.tazele(); };
      const kartAc = (pid, o = {}) => {
        const x = K.bul(pid), k = hsec(); if (!x || !k) return;
        const sira = v.E.findIndex(e => e.id === x.id) + 1;
        k.innerHTML = GM.yolSatir(x, {yuzen: true, eklendi: sira > 0, sira: sira || null}); k.classList.add('is-gorunur');
        secim = {rota: id, id: pid};
        GM.cekmeceDurak(cek(), 'kapali');
        if (o.odak === 'sec') GM.haritaSec(h, pid, {zoom: 9}); else if (o.odak) GM.haritaOdak(h, pid);
      };
      const kartKapat = () => { hsec()?.classList.remove('is-gorunur'); secim = null; if (h) GM.haritaOdak(h, ''); };
      const cikarYaz = x => { const d = oku(id); yaz(id, {eklenen: d.eklenen.filter(s => s !== x.id), mola: (d.mola || []).filter(s => s !== x.id)}); };
      const ekle = pid => {
        const x = K.bul(pid); if (!x) return;
        if (v.sanal || v.E.length >= GM.ROTA_DURAK_SINIR) { GM.toast(`Bir rotaya en çok **${GM.ROTA_DURAK_SINIR} durak** eklenir. Yeni durak için birini çıkar.`, {ikon: 'bilgi', eylem: 'Durakları gör', onEylem: () => GM.git(`#/rota/ozet/${id}`)}); return; }
        const d = oku(id);
        if (x.tur === 'mekan') d.eklenen = [...new Set([...d.eklenen, x.id])]; else d.mola = [...new Set([...(d.mola || []), x.id])];
        yaz(id, d); GM.titres?.();
        const n = GM.rotaEklenen(d, K).findIndex(e => e.id === x.id) + 1;
        GM.toast(`**${x.ad}** ${n}. durak oldu · ${kmMetin(x.km)}${x.uzak <= 1 ? ', yol üstü' : `, +${x.sapma} dk`}`, {tur: 'basari', eylem: 'Geri al', onEylem: () => { cikarYaz(x); yenile(); }});
        yenile();
      };
      const cikar = pid => { const x = K.bul(pid); if (!x || v.sanal) return; cikarYaz(x); GM.toast(`**${x.ad}** rotadan çıkarıldı`, {eylem: 'Geri al', onEylem: () => { const d = oku(id); if (x.tur === 'mekan') d.eklenen.push(x.id); else d.mola = [...(d.mola || []), x.id]; yaz(id, d); yenile(); }}); yenile(); };
      const mekanlar = () => GM.rotaMekanlarSheet({rota: R, eklenen: () => oku(id).eklenen, ekle: x => ekle(x.slug), cikar: x => cikar(x.slug)});
      const ilAc = ad => GM.ilSheet({rota: R, il: ad, eklenen: oku(id).eklenen, ekle: x => ekle(x.slug)});
      const yola = () => (v.konum ? konumIzni(() => GM.git(`#/rota/surus/${id}`)) : GM.git(`#/rota/surus/${id}`));
      const c = [
        GM.on(kok, 'rh-kat', k => { const x = [].concat(k)[0]; if (x) yaz(id, {kat: x}); secim = null; yenile(); }),
        GM.on(kok, 'rh-alt', a => { const x = [].concat(a)[0]; if (x) yaz(id, {alt: x}); secim = null; yenile(); }),
        GM.on(kok, 'rh-arac', a => {
          GM.durum.yaz('rota-arac', a); secim = null;
          if (a === 'ev') { yaz(id, {kat: 'yol', alt: 'sarj'}); GM.toast('Elektrikli: **şarj** ve **uzun mola** durakları öne alındı', {ikon: 'sarj'}); }
          else { yaz(id, {alt: 'yakit'}); GM.toast('Yakıtlı: yol ihtiyaçlarında **yakıt** önde', {ikon: 'yakit'}); }
          yenile();
        }),
        GM.on(kok, 'rh-h', pid => { if (pid === 'bas' || pid === 'son') { kartKapat(); return; } kartAc(pid); }),
        GM.on(kok, 'rh-cekmece', d => { if (d !== 'kapali') { hsec()?.classList.remove('is-gorunur'); secim = null; } }),
        GM.eylem(kok, 'durak-ekle', el => ekle(el.dataset.id)),
        GM.eylem(kok, 'durak-cikar', el => cikar(el.dataset.id)),
        GM.eylem(kok, 'kart-kapat', kartKapat),
        GM.eylem(kok, 'il-ac', el => ilAc(el.dataset.id)),
        GM.eylem(kok, 'kat-sec', el => { yaz(id, {kat: el.dataset.id}); yenile(); }),
        GM.eylem(kok, 'alt-sec', el => { yaz(id, {kat: 'yol', alt: el.dataset.id}); yenile(); }),
        GM.eylem(kok, 'filtre', mekanlar),
        GM.eylem(kok, 'konum-izin', () => konumIzni()),
        GM.eylem(kok, 'rh-kaydet', () => GM.rotaKaydet(R, {cevrimdisi: true, degisti: yenile})),
        GM.eylem(kok, 'rh-paylas', () => GM.paylas({baslik: `${R.ad} · Dada Route`, url: paylasUrl(R), alt: `${GM.sayi(Math.round(R.km))} km · ${v.E.length ? `${v.E.length} durak` : GM.rotaSayiMetin(R)}`})),
        GM.eylem(kok, 'rh-aktar', () => GM.aktarSheet({rota: R, duraklar: v.E})),
        GM.eylem(kok, 'rh-yola', yola),
        GM.eylem(kok, 'cekmece-kapat', () => GM.cekmeceDurak(cek(), 'kapali')),
        GM.eylem(kok, 'cekmece-tam', () => GM.cekmeceDurak(cek(), 'tam')),
        // Km şeridindeki numaralı durak ve ihtiyaç hücresi: haritada o nokta / o katman.
        GM.eylem(kok, 'km-durak', el => kartAc(el.dataset.id, {odak: 'sec'})),
        GM.eylem(kok, 'ihtiyac-sec', el => { const t = el.dataset.id; yaz(id, {kat: 'yol', alt: ['dinlenme', 'karavan'].includes(t) ? 'mola' : t}); secim = null; yenile(); })
      ];
      // Çekmece başına dokunuş: kapalı → yarım → tam → yarım (sürüklemeye ek, tek el).
      const basTik = ev => { const t = ev.target.closest('.gm-kl-cekmece-tut'); if (!t || ev.target.closest('button,a')) return; const e = cek(), d = e?.dataset.durak; GM.cekmeceDurak(e, d === 'kapali' ? 'yarim' : d === 'yarim' ? 'tam' : 'yarim'); };
      kok.addEventListener('click', basTik); c.push(() => kok.removeEventListener('click', basTik));
      // Arama kutusu: rota boyunca mekân araması ve 14 hızlı filtre aynı sheet'te (web "Tüm Mekânlar").
      const ara = kok.querySelector('.gm-kl-hara input');
      if (ara) { const f = ev => { ev.preventDefault(); ara.blur(); mekanlar(); }; ara.readOnly = true; ara.addEventListener('focus', f); c.push(() => ara.removeEventListener('focus', f)); }
      // Satıra dokunuş (düğme ve bağlantı dışı): pin seçilir, yüzen kart açılır.
      const tik = ev => { const s = ev.target.closest('.gm-kl-cekmece .gm-ra-satir'); if (!s || ev.target.closest('button,a')) return; kartAc(s.dataset.durak, {odak: 'sec'}); };
      kok.addEventListener('click', tik); c.push(() => kok.removeEventListener('click', tik));
      // Haritada boş yere dokunuş kartı kapatır (sürükleme sayılmaz).
      if (h) { let p0 = null; const pd = ev => { p0 = [ev.clientX, ev.clientY]; }, pu = ev => { if (p0 && !ev.target.closest('[data-pin-id], .gm-kume') && Math.hypot(ev.clientX - p0[0], ev.clientY - p0[1]) < 6 && hsec()?.classList.contains('is-gorunur')) kartKapat(); p0 = null; };
        h.addEventListener('pointerdown', pd); h.addEventListener('pointerup', pu); c.push(() => { h.removeEventListener('pointerdown', pd); h.removeEventListener('pointerup', pu); }); }
      // Açık kart yeniden çizimde geri gelir; ?pin= ilk çizimde kartı açar.
      const ilk = ctx.sorgu.pin || (secim?.rota === id ? secim.id : null);
      if (ilk) kartAc(ilk, {odak: true});
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // #/rota/liste/:id · liste görünümü (Google Maps "rota boyunca" listesi)
  // =====================================================================
  const SAYFA = 8;
  GM.ekran('rota-liste', {
    tur: 'alt', ust: '#/rota',
    baslik: ctx => { const R = rota(ctx); return `${R.kalkis} → ${R.varis}`; },
    ustBar: ctx => ({sag: [{ikon: 'harita', etiket: 'Haritada göster', git: `#/rota/${rota(ctx).id}`}]}),
    iskelet: 'liste',
    bos: {ikon: 'mekan', baslik: 'Bu rotada henüz Dada durağı yok', metin: '**Geçiş Rehberi**’nde geçtiğin illerin coğrafi işaretli lezzetleri var.', eylem: {metin: 'Haritaya dön', ikon: 'harita', git: '#/rota/istanbul-izmir'}},
    cekYenile: () => new Promise(r => setTimeout(r, 600)),
    ciz: ctx => {
      const v = veri(ctx), {K, kat, alt, arac} = v, L = K.liste(kat, alt);
      return GM.bolumler([
        {html: GM.yigin([
          GM.aracSecim({ad: 'rl-arac', secili: arac}),
          GM.cipler({ad: 'rl-kat', tur: 'tek', etiket: 'Kategori', secili: kat, ogeler: K.kat.map(k => ({deger: k.deger, metin: k.metin, ikon: k.ikon, sayi: k.sayi}))}),
          kat === 'yol' ? GM.cipler({ad: 'rl-alt', tur: 'tek', etiket: 'Yol ihtiyaçları', secili: alt, ogeler: K.alt.map(a => ({deger: a.deger, metin: a.metin, ikon: a.ikon, sayi: a.ogeler.length}))}) : ''], 12)},
        {html: L.length
          ? GM.krListe([GM.yolSatirlar(satirlar(v, L.slice(0, SAYFA)))], {ikon: katIkon(v), baslik: katBaslik(v), alt: katOzet(v), eylem: kat === 'neYenir' ? GM.btn({metin: 'Süz', ikon: 'filtre', tur: 'secondary', boyut: 'sm', veri: {eylem: 'filtre'}}) : ''})
          : katBos(v)}
      ]);
    },
    altBar: ctx => aksiyon(rota(ctx)),
    sonra: (kok, ctx) => {
      const v = veri(ctx), {R, K} = v, id = R.id, L = K.liste(v.kat, v.alt);
      const yenile = () => (SORGU.some(k => ctx.sorgu[k] != null) ? GM.yerine(`#/rota/liste/${id}`) : GM.tazele());
      const ekle = pid => {
        const x = K.bul(pid); if (!x) return;
        if (v.E.length >= GM.ROTA_DURAK_SINIR) { GM.toast(`Bir rotaya en çok **${GM.ROTA_DURAK_SINIR} durak** eklenir. Yeni durak için birini çıkar.`, {ikon: 'bilgi'}); return; }
        const d = oku(id); if (x.tur === 'mekan') d.eklenen = [...new Set([...d.eklenen, x.id])]; else d.mola = [...new Set([...(d.mola || []), x.id])];
        yaz(id, d); const n = GM.rotaEklenen(d, K).findIndex(e => e.id === x.id) + 1;
        GM.toast(`**${x.ad}** ${n}. durak oldu · ${kmMetin(x.km)}`, {tur: 'basari', eylem: 'Haritada', onEylem: () => GM.git(`#/rota/${id}?pin=${encodeURIComponent(x.id)}`)}); GM.tazele();
      };
      const cikar = pid => { const d = oku(id); yaz(id, {eklenen: d.eklenen.filter(s => s !== pid), mola: (d.mola || []).filter(s => s !== pid)}); GM.toast('Durak rotadan çıkarıldı'); GM.tazele(); };
      const c = [
        GM.on(kok, 'rl-kat', k => { const x = [].concat(k)[0]; if (x) yaz(id, {kat: x}); yenile(); }),
        GM.on(kok, 'rl-alt', a => { const x = [].concat(a)[0]; if (x) yaz(id, {alt: x}); yenile(); }),
        GM.on(kok, 'rl-arac', a => { GM.durum.yaz('rota-arac', a); if (a === 'ev') yaz(id, {kat: 'yol', alt: 'sarj'}); else yaz(id, {alt: 'yakit'}); yenile(); }),
        GM.eylem(kok, 'durak-ekle', el => ekle(el.dataset.id)),
        GM.eylem(kok, 'durak-cikar', el => cikar(el.dataset.id)),
        GM.eylem(kok, 'il-ac', el => GM.ilSheet({rota: R, il: el.dataset.id, eklenen: oku(id).eklenen, ekle: x => ekle(x.slug)})),
        GM.eylem(kok, 'kat-sec', el => { yaz(id, {kat: el.dataset.id}); yenile(); }),
        GM.eylem(kok, 'alt-sec', el => { yaz(id, {kat: 'yol', alt: el.dataset.id}); yenile(); }),
        GM.eylem(kok, 'filtre', () => GM.rotaMekanlarSheet({rota: R, eklenen: () => oku(id).eklenen, ekle: x => ekle(x.slug), cikar: x => cikar(x.slug)})),
        GM.eylem(kok, 'rh-kaydet', () => GM.rotaKaydet(R, {cevrimdisi: true, degisti: GM.tazele})),
        GM.eylem(kok, 'rh-paylas', () => GM.paylas({baslik: `${R.ad} · Dada Route`, url: paylasUrl(R)})),
        GM.eylem(kok, 'rh-aktar', () => GM.aktarSheet({rota: R, duraklar: v.E})),
        GM.eylem(kok, 'rh-yola', () => GM.git(`#/rota/surus/${id}`))
      ];
      // Satıra dokunuş: haritada o pin, yüzen kart açık.
      const tik = ev => { const s = ev.target.closest('.gm-ra-satir'); if (!s || ev.target.closest('button,a')) return; GM.git(`#/rota/${id}?pin=${encodeURIComponent(s.dataset.durak)}`); };
      kok.addEventListener('click', tik); c.push(() => kok.removeEventListener('click', tik));
      // Sonsuz kaydırma: 8'lik sayfa, alt yükleme göstergesi, sonda "Hepsi bu kadar · N sonuç".
      const kap = kok.querySelector('.gm-ra-satirlar');
      const io = GM.sonsuzListe(kap, L, x => satirlar(v, [x])[0], {sayfa: SAYFA, birim: v.kat === 'neYenir' ? 'mekân' : v.kat === 'yol' ? 'nokta' : 'il'});
      c.push(() => io?.disconnect());
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // #/rota/web/:id · webden gönderilen rota (belge §3A, 1. alternatif)
  // =====================================================================
  GM.ekran('rota-web', {
    tur: 'alt', baslik: 'Webden gönderildi', ust: '#/rota',
    bos: {ikon: 'web', baslik: 'Webden gönderilen rota yok', metin: 'Webde **Dada Route**’ta rotanı çiz, **Telefona gönder**’e dokun; aynı hesapla burada tek dokunuşla açılır.', eylem: {metin: 'Rota planla', ikon: 'rota', git: '#/rota/planla'}},
    ciz: ctx => {
      const W = GM.rotaWebden(); if (!W) return GM.bos({tam: true, ikon: 'web', baslik: 'Webden gönderilen rota yok', metin: 'Webde rotanı çiz, **Telefona gönder**’e dokun.'});
      const R = W.R, D = W.duraklar.slice().sort((a, b) => a.km - b.km), ek = D.reduce((t, d) => t + d.sapma, 0);
      // Durak pinleri her zaman numaralı ve kümesiz (HARİTA-ISARET: sıra > küme). Aynı noktaya düşen duraklar yatay yelpaze olur: harita ölçeğinden
      // (rota sınırı, harita kutusu ≈ 350 × 240, dolgu 32) bir pin genişliği kadar yana kaydırılır; uca 3 km'den yakın durak varsa uç işareti çizilmez.
      const LN = R.cizgi.map(p => p[0]), LT = R.cizgi.map(p => p[1]), cosL = Math.cos((Math.min(...LT) + Math.max(...LT)) / 2 * Math.PI / 180);
      const px = Math.max((Math.max(...LN) - Math.min(...LN)) / (350 - 64), (Math.max(...LT) - Math.min(...LT)) / cosL / (240 - 64)), ARA = 46;
      const grup = []; D.forEach((d, i) => { const g = grup.find(x => x.some(y => Math.hypot((y.d.lng - d.lng) / px, (y.d.lat - d.lat) / cosL / px) < ARA)); (g || (grup[grup.length] = [])).push({d, i}); });
      const duraklar = grup.flatMap(g => g.map((x, j) => ({id: x.d.slug, lng: x.d.lng + (j - (g.length - 1) / 2) * ARA * px, lat: x.d.lat, sira: x.i + 1, ad: x.d.mekan.ad})));
      const harita = GM.harita({ad: 'rw-h', yukseklik: 'var(--gm-size-map-h)', etkilesim: false, kontroller: false, rota: {cizgi: R.cizgi}, dolgu: {top: 32, right: 32, bottom: 32, left: 32},
        pinler: [...(D.some(d => d.km < 3) ? [] : [{lng: R.cizgi[0][0], lat: R.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic'}]), ...(D.some(d => d.km > R.km - 5) ? [] : [{lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis'}]), ...duraklar], etiket: `${R.ad} webden gönderilen rota`});
      const K = GM.rotaKategori(R);
      return GM.bolumler([
        {html: GM.yigin([GM.rehberManset({sinif: 'is-ic', etiket: `${W.cihaz} · ${W.zaman}`, baslik: W.ad, ozet: [`${GM.sayi(Math.round(R.km))} km`, GM.sure(R.dk + ek), `${D.length} durak`]}), harita], 16)},
        {baslik: 'Webde seçtiğin duraklar', html: GM.yolSatirlar(D.map((d, i) => GM.yolSatir(K.bul(d.slug), {eylem: false, sira: i + 1})))},
        {html: GM.bilgi({metin: 'Webde aynı hesapla çizdiğin rota burada açılır. **Rotayı aç** duraklarını haritaya km sırasıyla yerleştirir; rotada önceden eklediğin duraklar korunur.'})}
      ]);
    },
    altBar: () => GM.altEylem({dugmeler: [GM.btnIkili({metin: 'Kaydet', ikon: 'kaydet', veri: {eylem: 'rw-kaydet'}}, {metin: 'Rotayı aç', ikon: 'harita', veri: {eylem: 'rw-ac'}})]}),
    sonra: kok => {
      const W = GM.rotaWebden(); if (!W) return null;
      const c = [
        GM.eylem(kok, 'rw-ac', () => { const d = oku(W.id), once = d.eklenen.length; yaz(W.id, {eklenen: [...new Set([...d.eklenen, ...W.duraklar.map(x => x.slug)])]}); const n = oku(W.id).eklenen.length - once; GM.git(`#/rota/${W.id}`); GM.toast(`Webden gelen rota açıldı · **${n ? `${n} durak eklendi` : 'duraklar zaten rotada'}**`, {tur: 'basari', ikon: 'web'}); }),
        GM.eylem(kok, 'rw-kaydet', () => GM.rotaKaydet(W.R, {cevrimdisi: true, degisti: GM.tazele}))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
