/* Dada Route ekranları (docs/DADA-ROUTE-REFERANS.md §5–6 ana yönleri):
   #/rota (a) merkez: canlı yolculuk (varsa), planlayıcı, webden gelen rota, son rotalar, hazır rotalar, yol katmanları, çevrimdışı/günlük girişleri. Orta düğmenin uzun basışı aynı içeriğin kısa sheet'idir (gm-ui.js).
   #/rota/planla (b) planlama: duraklar (kalkış, ara ≤ 3 panel kuralı, varış), araç Yakıtlı/Elektrikli (web), sapma toleransı, ihtiyaç tercihleri → ?adim=sonuc 3 rota seçeneği.
   #/rota/surus/:id (h) Co-Pilot: koyu durak asistanı; turn-by-turn yok, navigasyon dış haritaya devredilir; ?uyari=1 yaklaşma uyarısı (3–5 km). */
(() => {
  const R0 = () => GM.rotaBul('istanbul-izmir');
  const kapakli = r => GM.rotaKartVeri(r, {gorsel: GM.rotaDuraklari(r).find(d => d.mekan.kapakB)?.mekan.kapakB || GM.rotaDuraklari(r).find(d => d.mekan.kapak)?.mekan.kapak});
  const KATMAN_CIP = [{tur: 'neYenir', metin: 'Ne Yenir?'}, {tur: 'neAlinir', metin: 'Ne Alınır?'}, {tur: 'yakit', metin: 'Yakıt'}, {tur: 'sarj', metin: 'Şarj'}, {tur: 'ibadet', metin: 'İbadethane'}, {tur: 'dinlenme', metin: 'Dinlenme'}, {tur: 'karavan', metin: 'Karavan'}, {tur: 'cografi', metin: 'İl kimliği'}];

  // ---------- (a) Rota merkezi ----------
  GM.ekran('rota', {
    tur: 'sekme', nav: 'rota', baslik: 'Dada Route',
    bos: {ikon: 'rota', baslik: 'Henüz rotan yok', metin: 'İlk rotanı çiz; yol üstündeki **gurme duraklar** rotadan sapma süresiyle gelsin.', eylem: {metin: 'Rota planla', ikon: 'rota', git: '#/rota/planla'}},
    ciz: ctx => {
      const R = R0(), yolda = ctx.sorgu.yolda === '1', D = GM.rotaOneri(R);
      const sira = D.find(d => d.km > 300) || D[0], bal = (R.iller || []).find(i => i.ad === 'Balıkesir');
      const ust = GM.selamBas({gorsel: 'assets/gorsel/hero/sokak-dikey.webp', ust: yolda ? 'Yolculuk sürüyor · İstanbul – İzmir' : 'Dada Route', baslikHtml: yolda ? 'Sıradaki durak <em>yaklaşıyor</em>' : 'Yolun <em>lezzetini</em> planla', html: yolda
        ? GM.canliKart({etiket: 'Co-Pilot açık', baslik: sira.mekan.ad, alt: `Sıradaki durak · ${sira.km}. km · ${sira.mekan.ilce}`, sure: '1 sa 52 dk', ilerleme: bal ? bal.km / R.km : .55, cipler: [{tur: 'yakit', metin: 'Yakıt +2 dk'}, {tur: 'ibadet', metin: 'Mescit +3 dk'}], git: `#/rota/surus/${R.id}`})
        : GM.planlayici({})});
      const son = ['istanbul-bursa', 'izmir-cesme', 'istanbul-ankara'].map(GM.rotaBul).filter(Boolean);
      const hazir = ['istanbul-izmir', 'izmir-cesme', 'ankara-antalya', 'ankara-trabzon', 'istanbul-bursa'].map(GM.rotaBul).filter(Boolean);
      return ust + GM.bolumler([
        {html: GM.webdenRota({ust: 'Webden gönderildi · 2 dk önce', ad: 'İstanbul – Bursa', alt: '3 ara durak · İskender, kestane şekeri, Gemlik zeytini', git: '#/rota/istanbul-bursa'})},
        // Yalnız Gourmet: pilot rotanın lezzet profili (AllTrails profil kalıbı) — durak fotoğrafları km ekseninde, il kimliği düğümleri arada; dokununca kart değişir.
        yolda ? null : {baslik: `Yolun lezzeti · ${R.ad}`, eylem: 'Haritada', git: `#/rota/${R.id}`, html: GM.yigin([GM.p(`**${GM.rotaSayiMetin(R)}**; aradaki illerde coğrafi işaretli lezzetler. Fotoğrafa ya da ile dokun.`), GM.lezzetProfili(R, {duraklar: D, katman: GM.rotaKatmani(R)})], 12)},
        {baslik: 'Son rotaların', eylem: 'Tümü', git: '#/rota/rotalarim', html: GM.satirlar(son.map(r => GM.rotaKart(GM.rotaKartVeri(r), {tur: 'satir'})))},
        {baslik: 'Hazır rotalar', eylem: 'Tümü', git: '#/rota/hazir', html: GM.yatay(hazir.map((r, i) => GM.rotaKart(kapakli(r), {kayitli: i === 1})))},
        {baslik: 'Yol boyunca neler var?', html: GM.yigin([GM.p('Rotanı çizince **gurme durakların** yanında yolun ihtiyaçları da açılır; her biri rotadan **sapma süresiyle** gelir.'), GM.katmanCipler({ad: 'rota-katman-tanit', ogeler: KATMAN_CIP.map((k, i) => ({...k, secili: i < 2}))})], 12)},
        {html: GM.satirlar([{ikon: 'cevrimdisi', baslik: 'Çevrimdışı rotalar', alt: 'İnternet çekmeyen yolda harita, adres ve telefonlar', git: '#/rota/cevrimdisi', ok: true}, {ikon: 'gecmis', baslik: 'Seyahat günlüğü', alt: 'Tamamladığın rotalar ve ziyaret ettiğin duraklar', git: '#/rota/gunluk', ok: true}, {ikon: 'arac', baslik: 'Araç ekranı', alt: 'CarPlay ve Android Auto', git: '#/rota/arac', ok: true}])}
      ]);
    }
  });

  // ---------- (b) Planlama ----------
  // Rota seçenekleri: panelde Google Routes 3 alternatif döner (WEB-ENVANTERI §3.6); süre/km burada prototip örneğidir. Durak sayısı veriden: sapma toleransı içinde kalan mekânlar.
  const SECENEK = () => { const r = R0(), D = GM.rotaDuraklari(r); return [
    {id: 'lezzet', ikon: 'neYenir', ad: 'Lezzet yolu', dk: r.dk + 26, km: Math.round(r.km + 18), alt: `${GM.rotaSayi(r).onerilen} önerilen durak · Bursa üzerinden`},
    {id: 'hizli', ikon: 'bolt', ad: 'En hızlı', dk: r.dk, km: Math.round(r.km), alt: `${GM.rotaSayi(r).yolUstu} yol üstü durak · otoyol`},
    {id: 'sakin', ikon: 'leaf', ad: 'Sakin yol', dk: r.dk + 48, km: Math.round(r.km + 31), alt: 'Ücretli yol yok · köy lokantaları'}]; };
  // Web paritesi (Görev 11): pilot güzergâhlar (panelin 5 TR pilotu), ara durakta tahmini bekleme (15–90 dk), tolerans "Özel km" (2–30, web kaydırıcı), ara durak sınırı 3, Yeni rota.
  const PILOT = ['istanbul-izmir', 'istanbul-ankara', 'ankara-antalya', 'istanbul-bursa', 'izmir-cesme'];
  const pd = () => ({bekle: 45, tol: '10', km: 12, ...(GM.durum.oku('rota-planla', null) || {})});
  const pdYaz = d => GM.durum.yaz('rota-planla', {...pd(), ...d});
  GM.ekran('rota-planla', {
    tur: 'alt', baslik: 'Rota planla', ust: '#/rota',
    ustBar: ctx => (ctx.sorgu.adim === 'sonuc' ? {} : {sag: [{ikon: 'yenile', etiket: 'Yeni rota oluştur', veri: {eylem: 'plan-sifirla'}}]}),
    ciz: ctx => {
      if (ctx.sorgu.adim === 'sonuc') {
        const r = R0();
        return `<div class="gm-ic gm-yigin-24"><div class="gm-yigin-8"><p class="gm-t-label gm-ton-ikincil">İstanbul → İzmir · 1 ara durak</p><h2 class="gm-t-section">3 rota bulundu</h2></div>${GM.harita({ad: 'planla-sonuc', yukseklik: '220px', etkilesim: false, kontroller: false, rota: {cizgi: r.cizgi, alternatif: GM.rotaBul('istanbul-bursa').cizgi}, pinler: [{lng: r.cizgi[0][0], lat: r.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic'}, {lng: r.cizgi.at(-1)[0], lat: r.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis'}]})}${GM.rotaSecenekler(SECENEK(), {secili: 'lezzet', rozet: 'Önerilen'})}${GM.bilgi({ikon: 'bilgi', metin: 'Süreler trafiksiz tahmindir; mola süreleri ayrıca eklenir. Seçeneklerin süre ve km değerleri prototip örneğidir.'})}</div>`;
      }
      const d = pd();
      return `<div class="gm-ic gm-yigin-24">${GM.alan({etiket: 'Pilot güzergâhlar', html: GM.cipler({ad: 'plan-pilot', etiket: 'Pilot güzergâhlar', ogeler: PILOT.map(GM.rotaBul).filter(Boolean).map(r => ({metin: r.ad, ikon: 'rota', git: `#/rota/${r.id}`}))})})}
        ${GM.durakDuzen([{tur: 'bas', ad: 'Konumum', alt: 'Kadıköy, İstanbul', id: 'a'}, {tur: 'ara', ad: 'Bursa', alt: `Bekleme ${d.bekle} dk · +${d.bekle} dk`, id: 'd1'}, {tur: 'son', ad: 'İzmir', alt: 'Alsancak', id: 'b'}], {ekleMetin: 'Ara durak ekle (en çok 3)'})}
        ${GM.alan({etiket: 'Araç', html: GM.segment({ad: 'arac', secili: 'yakit', ogeler: [{ad: 'Yakıtlı', deger: 'yakit', ikon: 'yakit'}, {ad: 'Elektrikli', deger: 'ev', ikon: 'sarj'}]})})}
        ${GM.alan({etiket: 'Duraklar rotadan en çok ne kadar saptırsın?', html: GM.segment({ad: 'tolerans', secili: d.tol, ogeler: [{ad: 'Yol üstü', deger: '0'}, {ad: '5 dk', deger: '5'}, {ad: '10 dk', deger: '10'}, {ad: '20 dk', deger: '20'}, {ad: d.tol === 'ozel' ? `${d.km} km` : 'Özel', deger: 'ozel'}]})})}
        <section class="gm-yigin-8"><p class="gm-t-label gm-ton-ikincil">İhtiyaçlar</p>${GM.toggle({ad: 'mola', ikon: 'dinlenme', etiket: 'Her 2 saatte bir mola öner', alt: 'Dinlenme alanı ya da konaklamalı yeme-içme', secili: true})}${GM.toggle({ad: 'ibadet', ikon: 'cami', etiket: 'Yol üstündeki ibadethaneleri göster', alt: 'Yol ayrım mesafesiyle'})}${GM.toggle({ad: 'alinir', ikon: 'neAlinir', etiket: 'Ne Alınır? duraklarını ekle', alt: 'Yöresel ürün ve kooperatifler', secili: true})}</section></div>`;
    },
    altBar: ctx => (ctx.sorgu.adim === 'sonuc'
      ? GM.altEylem({dugmeler: [{metin: 'Rotayı aç', ikon: 'harita', git: '#/rota/istanbul-izmir', tam: true}]})
      : GM.altEylem({dugmeler: [{metin: 'Rotayı çiz', ikon: 'rota', yerine: '#/rota/planla?adim=sonuc', tam: true}]})),
    sonra: (kok) => {
      const kap = kok.closest('.gm-ekran') || kok, ara = () => kok.querySelectorAll('.gm-dd-satir.is-ara').length;
      // Özel mesafe (web "Rotadan en fazla uzaklık" 2–30 km, varsayılan 12): seçilince sheet açılır.
      const ozelKm = () => GM.sheet({baslik: 'Rotadan en fazla uzaklık', html: GM.yigin([GM.segment({ad: 'plan-km', etiket: 'Kilometre', secili: String(pd().km), ogeler: [2, 5, 8, 12, 20, 30].map(x => ({ad: `${x} km`, deger: String(x)}))}), GM.p('Mekân, rotaya bu mesafeden yakınsa önerilir. Sapma süresi gidiş-dönüş, 55 km/sa ile hesaplanır.', {ton: 'ikincil'})], 12),
        sonra: (k, h) => GM.on(k, 'plan-km', v => { pdYaz({tol: 'ozel', km: +v}); h.kapat(); GM.tazele(); GM.toast(`Rotadan en çok **${v} km** uzaklıktaki mekânlar`, {ikon: 'yon'}); })});
      const c = [GM.eylem(kok, 'durak-ekle', () => (ara() >= 3 ? GM.toast('Bu rotaya en fazla **3 ara durak** ekleyebilirsin. Yeni durak için birini kaldır.', {ikon: 'bilgi'}) : GM.toast('Ara durak için **yer ara** açılır', {ikon: 'pin'}))), GM.eylem(kok, 'durak-sil', () => GM.toast('Durak kaldırıldı', {eylem: 'Geri al'})), GM.eylem(kok, 'durak-degistir', () => GM.toast('Kalkış ve varış **yer değiştirdi**')),
        // Ara durağa dokununca tahmini bekleme (web "Tahmini bekleme" seçimi); kalkış ve varışta yer araması.
        GM.eylem(kok, 'durak-sec', el => (el.closest('.gm-dd-satir')?.classList.contains('is-ara') ? GM.molaSec({ad: 'Bursa', dk: pd().bekle, sec: dk => { pdYaz({bekle: dk}); GM.tazele(); }}) : GM.toast('Yer ara: **şehir, ilçe, semt** ya da nokta', {ikon: 'pin'}))),
        GM.on(kok, 'tolerans', v => (v === 'ozel' ? ozelKm() : pdYaz({tol: v}))),
        GM.eylem(kap, 'plan-sifirla', () => { const once = pd(); GM.durum.yaz('rota-planla', null); GM.tazele(); GM.toast('Yeni rota: duraklar ve seçimler **sıfırlandı**', {eylem: 'Geri al', onEylem: () => { pdYaz(once); GM.tazele(); }}); })];
      return () => c.forEach(f => f());
    }
  });

  // ---------- (h) Co-Pilot ----------
  GM.ekran('rota-surus', {
    tur: 'tam', haller: false,
    ciz: ctx => {
      const R = GM.rotaBul(ctx.param.id) || R0(), D = GM.rotaOneri(R), sira = D.find(d => d.km > 300) || D[0];
      // Demo konumu: sıradaki durağa 3 km kala (uyarı anı); rota üstündeki km'ye göre en yakın çizgi noktası.
      const kumul = [0]; R.cizgi.forEach((p, n) => { if (n) kumul.push(kumul[n - 1] + GM.km(R.cizgi[n - 1], p)); });
      const hedefKm = Math.max(0, sira.km - 3), i = Math.max(1, kumul.findIndex(k => k >= hedefKm)), konum = R.cizgi[i], gecilen = R.cizgi.slice(0, i + 1), kalanKm = Math.round(R.km - hedefKm);
      const kat = GM.rotaKatmani(R).filter(k => k.km > hedefKm).slice(0, 2);
      return `${GM.ustBar({tur: 'modal', baslik: 'Co-Pilot', sag: [{ikon: 'sesli', etiket: 'Sesli uyarılar açık'}]})}${GM.copilot({
        harita: {ad: 'cp-harita', rota: {cizgi: R.cizgi, gecilen}, konum, yon: 200, merkez: konum, zoom: 11.5, pinler: [{lng: sira.lng, lat: sira.lat, sira: 1}]},
        uyari: ctx.sorgu.uyari === '1' ? {baslik: '3 km sonra sağda: ' + sira.mekan.ad, metin: `Rotadan +${sira.sapma} dk. Durmak ister misin?`} : null,
        sirada: {tur: 'mekan', ad: sira.mekan.ad, alt: [sira.mekan.kategori, sira.mekan.ilce].filter(Boolean).join(' · '), gorsel: sira.mekan.kapak, uzak: '3 km', sure: '~4 dk', sapma: sira.sapma},
        yaklasan: kat.map(k => ({tur: k.tur, ad: k.ad, uzak: `${Math.max(1, Math.round(k.km - hedefKm))} km`})),
        cipler: [{tur: 'yakit', metin: 'Yakıt'}, {tur: 'sarj', metin: 'Şarj'}, {tur: 'ibadet', metin: 'Mescit'}, {tur: 'dinlenme', metin: 'Mola'}],
        uclu: [{etiket: 'Varış', deger: '14.10'}, {etiket: 'Kalan', deger: GM.sure(Math.round(kalanKm / R.km * R.dk))}, {etiket: 'Mesafe', deger: `${kalanKm} km`}]
      })}`;
    },
    sonra: kok => {
      const c = [GM.eylem(kok, 'cp-gec', () => GM.toast('Durak geçildi, **sıradaki** gösteriliyor', {eylem: 'Geri al'})), GM.eylem(kok, 'cp-nav', () => GM.sheet({baslik: 'Navigasyonda aç', html: GM.satirlar([{ikon: 'fa-brands fa-google', sol: GM.ikonKutu({ikon: 'map', boyut: 'md'}), baslik: 'Google Haritalar', alt: 'Çok duraklı rota (en çok 9 ara durak)', ok: true}, {sol: GM.ikonKutu({ikon: 'map-location-dot', boyut: 'md'}), baslik: 'Apple Haritalar', alt: 'Sıradaki durağa yol tarifi', ok: true}, {sol: GM.ikonKutu({ikon: 'location-arrow', boyut: 'md'}), baslik: 'Yandex Navigasyon', alt: 'Sıradaki durağa yol tarifi', ok: true}])}))];
      return () => c.forEach(f => f());
    }
  });
})();
/* #/rota/:id (c) Rota haritası + durak çekmecesi (DADA-ROUTE-REFERANS §5c ana yön): tam ekran harita (rota + koridor + yuvarlak pinler; +N dk kartta), üstte rota kapsülü + katman çipleri,
   sağda araç sütunu, altta 3 duraklı çekmece (liste kanonundan GM.cekmece) sekmeleri: Duraklar · Keşfet · İhtiyaçlar · Özet. Kart ↔ pin: GM.haritaSec. */
(() => {
  const KATMAN = [['neYenir', 'Ne Yenir?'], ['yakit', 'Yakıt'], ['sarj', 'Şarj'], ['ibadet', 'İbadethane'], ['dinlenme', 'Dinlenme'], ['karavan', 'Karavan']];
  const durum = id => GM.durum.oku(`rota-${id}`, null) || {eklenen: [], sekme: 'kesfet', katman: ['neYenir', 'sarj', 'ibadet']};
  const yaz = (id, d) => GM.durum.yaz(`rota-${id}`, d);
  // Sürüş süresi rotanın kendi km/dk oranıyla (özet şeridindeki toplamla aynı); sapma 55 km/sa kuralı yalnız durak sapmasıdır.
  const surus = (R, km) => GM.sure(Math.max(1, Math.round(km / R.km * R.dk)));
  // İl geçişi noktası: iller verisinde koordinat yok, km var; rota çizgisinde o km'ye düşen nokta.
  const ilNokta = (R, km) => { const c = R.cizgi, top = c.reduce((a, p, i) => a + (i ? GM.km(c[i - 1], p) : 0), 0), h = km / R.km * top; let t = 0; for (let i = 1; i < c.length; i++) { t += GM.km(c[i - 1], c[i]); if (t >= h) return c[i]; } return c.at(-1); };
  // Haller (haller:false tam ekran): hata ve yükleniyor kanon parçalarıyla; bos = rotada önerilen durak yok.
  const halEkran = ctx => (ctx.sorgu.hal === 'hata' ? GM.hataEkran({tur: 'sunucu', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: ctx.hash.replace(/[?&]hal=hata/, '')}, ikinciller: [{metin: 'Dada Route’a dön', ikon: 'rota', yerine: '#/rota'}]}) : ctx.sorgu.hal === 'yukleniyor' ? GM.iskelet('harita-sheet') : null);
  const veri = R => {
    // Keşif = önerilen gurme duraklar (GM.rotaOneri, her ekranla aynı kaynak).
    const D = GM.rotaDuraklari(R).filter(d => d.mekan.kapak), kesif = GM.rotaOneri(R);
    return {D, kesif, K: GM.rotaKatmani(R)};
  };
  const pinler = (R, v, d) => [
    {id: 'bas', lng: R.cizgi[0][0], lat: R.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic'}, {id: 'son', lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis'},
    ...v.kesif.map(x => ({id: x.slug, lng: x.lng, lat: x.lat, sira: d.eklenen.includes(x.slug) ? d.eklenen.indexOf(x.slug) + 1 : null, ad: x.mekan.ad})),
    ...v.K.filter(k => d.katman.includes(k.tur)).map(k => ({id: k.id, lng: k.lng, lat: k.lat, tur: k.tur, kucuk: true, ad: k.ad})),
    // İl kimliği düğümleri (yalnız Gourmet): ara iller soluk coğrafi işaret pini; dokununca il sheet'i (Ne Yenir / Ne Alınır).
    ...(R.iller || []).filter(i => i.km > 5 && i.km < R.km - 5).map(i => { const p = ilNokta(R, i.km); return {id: `il-${i.ad}`, lng: p[0], lat: p[1], tur: 'cografi', kucuk: true, soluk: true, ad: i.ad}; })];
  const sekmeHtml = (R, v, d) => {
    const eklenen = d.eklenen.map(s => v.D.find(x => x.slug === s)).filter(Boolean).sort((a, b) => a.km - b.km);
    if (d.sekme === 'duraklar') return eklenen.length
      ? GM.rotaSerit([{uc: true, ad: R.kalkis, alt: 'Kalkış', sonra: `${surus(R, eklenen[0].km)} sürüş · ${Math.max(1, eklenen[0].km)} km`}, ...eklenen.map((x, i) => { const s2 = i < eklenen.length - 1 ? eklenen[i + 1].km : R.km; return {durak: x, sira: i + 1, sapma: {dk: x.uzak <= 1 ? 1 : x.sapma, km: x.km}, sonra: `${surus(R, s2 - x.km)} sürüş · ${GM.sayi(Math.round(s2 - x.km))} km`}; }), {uc: true, ad: R.varis, alt: `Varış · ${GM.sure(R.dk + eklenen.reduce((a, x) => a + (x.uzak <= 1 ? 1 : x.sapma), 0))} toplam`}].map(y => (y.durak ? {...y, durak: {...y.durak, id: y.durak.slug}} : y)))
      : GM.bos({ikon: 'durak', baslik: 'Henüz durak eklemedin', metin: '**Keşfet** sekmesinden yol üstündeki gurme durakları ekle.', eylem: {metin: 'Durak keşfet', tur: 'secondary', veri: {eylem: 'sekme-kesfet'}}});
    // Keşfet başlığı: yol üstü / yola yakın sayacı (web #ygCorr) + sağda "Süz" → Tüm Mekânlar + Hızlı filtreler sheet'i (GM.rotaMekanlarSheet).
    if (d.sekme === 'kesfet') return v.kesif.length ? GM.krListe(v.kesif.map(x => GM.durakKart({...x, id: x.slug}, {sapma: {dk: x.uzak <= 1 ? 1 : x.sapma, km: x.km}, eklendi: d.eklenen.includes(x.slug)})), {ikon: 'neYenir', baslik: `${v.kesif.length} mekân`, alt: `Yol üstü ${v.kesif.filter(x => x.uzak <= 1).length} · Yola yakın ${v.kesif.filter(x => x.uzak > 1).length}`, eylem: GM.btn({metin: 'Süz', ikon: 'filtre', tur: 'secondary', boyut: 'sm', veri: {eylem: 'rota-mekanlar'}})}) : GM.bos({ikon: 'mekan', baslik: 'Bu rotada henüz Dada durağı yok', metin: 'Rotanın geçtiği illerin **coğrafi işaretli lezzetleri** Özet’te.', eylem: {metin: 'Geçtiğin iller', tur: 'secondary', veri: {eylem: 'sekme-ozet'}}});
    if (d.sekme === 'ihtiyac') return GM.yigin([...KATMAN.filter(([t]) => t !== 'neYenir').map(([t, ad]) => { const l = v.K.filter(k => k.tur === t); return l.length ? GM.krListe(l.slice(0, 4).map(k => GM.durakKart(k, {sapma: {dk: GM.katmanSapma(k), km: k.km}})), {ikon: t, tur: 'katman', baslik: `${ad} · ${l.length}`, alt: l.some(k => k.ornek) ? 'Adında “Örnek” yazanlar prototip örneği' : 'OpenStreetMap'}) : ''; }), GM.bilgi({ikon: 'bilgi', metin: 'Yol ihtiyaçları gurme duraklarla eşit ağırlıkta değildir: haritada **gri ve küçük** görünür.'})], 24);
    const iller = (R.iller || []).map(i => ({...i, k: (GMV.ilKimlik || []).find(x => x.ad === i.ad)})).filter(i => i.k);
    return GM.yigin([GM.ozetSerit([{ikon: 'rota', etiket: 'Mesafe', deger: GM.sayi(R.km), birim: 'km'}, {ikon: 'saat', etiket: 'Sürüş', deger: GM.sure(R.dk)}, {ikon: 'durak', etiket: 'Durak', deger: String(eklenen.length)}]),
      GM.krListe([GM.yatay(iller.map(i => GM.ilKart({...i.k, bolge: 'Coğrafi işaret', tescilli: i.k.tescilli.slice(0, 3)}, {km: i.km, sinif: 'is-kompakt'})))], {ikon: 'cografi', tur: 'cografi', baslik: 'Geçtiğin iller', alt: 'Karta dokun: Ne Yenir / Ne Alınır'}),
      GM.krListe([GM.satirlar([{sol: GM.ikonKutu({ikon: 'map', boyut: 'md'}), baslik: 'Google Haritalar', alt: 'Tek bağlantıda en çok 9 ara durak', ok: true, veri: {eylem: 'aktar'}}, {sol: GM.ikonKutu({ikon: 'map-location-dot', boyut: 'md'}), baslik: 'Apple Haritalar', alt: 'Çok duraklı rota', ok: true, veri: {eylem: 'aktar'}}, {sol: GM.ikonKutu({ikon: 'location-arrow', boyut: 'md'}), baslik: 'Yandex', alt: 'Yalnız kalkış ve varış', ok: true, veri: {eylem: 'aktar'}}])], {ikon: 'navigasyon', baslik: 'Rotayı aktar', alt: 'Yol tarifini harita uygulaması verir'}),
      GM.toggle({ad: 'cevrimdisi', ikon: 'cevrimdisi', etiket: 'Çevrimdışı kullan', alt: 'Harita, duraklar, adres ve telefonlar cihaza iner (≈ 48 MB)'})], 24);
  };
  GM.ekran('rota-harita', {
    tur: 'tam', ust: '#/rota', haller: false,
    ciz: ctx => {
      const hal = halEkran(ctx); if (hal) return hal;
      const R = GM.rotaBul(ctx.param.id) || GM.rotaBul('istanbul-izmir'), v = veri(R), d = durum(R.id);
      if (ctx.sorgu.hal === 'bos') v.kesif = [];
      const ust = `${GM.haritaArama({yer: `${R.kalkis} → ${R.varis}`, ad: 'rota-ara', filtreSayi: d.katman.length})}${GM.katmanCipler({ad: 'rota-katman', ogeler: KATMAN.map(([t, m]) => ({tur: t, metin: m, secili: d.katman.includes(t), sayi: t === 'neYenir' ? v.kesif.length : v.K.filter(k => k.tur === t).length}))})}`;
      const bas = GM.yonOzet({sure: `${GM.sayi(R.km)} km · ${GM.sure(R.dk)}`, vurgu: false, alt: d.eklenen.length ? `${d.eklenen.length} durak eklendi · ${GM.rotaSayiMetin(R)}` : GM.rotaSayiMetin(R), eylem: GM.btn({metin: 'Yola çık', ikon: 'arac', boyut: 'sm', git: `#/rota/surus/${R.id}`})});
      const sekme = GM.segment({ad: 'rota-sekme', secili: d.sekme, ogeler: [{ad: 'Duraklar', deger: 'duraklar', sayi: d.eklenen.length || undefined}, {ad: 'Keşfet', deger: 'kesfet'}, {ad: 'İhtiyaçlar', deger: 'ihtiyac'}, {ad: 'Özet', deger: 'ozet'}]});
      return GM.haritaEkran({
        harita: GM.harita({ad: 'rota-h', tam: true, kume: true, koridor: true, kontroller: false, rota: {cizgi: R.cizgi}, pinler: pinler(R, v, d), dolgu: {top: 150, bottom: 360, left: 40, right: 64}}),
        ust, arac: GM.aracSutun([{ikon: 'katman', ad: 'Katman', veri: {eylem: 'katman'}}, {ikon: 'kaydet', ad: GM.rotaKayitliMi(R) ? 'Kaydedildi' : 'Kaydet', veri: {eylem: 'rota-kaydet'}}, {ikon: 'cevrimdisi', ad: 'İndir', veri: {eylem: 'indir'}}, {ikon: 'paylas', ad: 'Paylaş', veri: {eylem: 'paylas'}}]),
        cekmece: GM.cekmece({ad: 'rota-cekmece', durak: 'yarim', bas, etiket: 'Rota durakları', html: GM.yigin([sekme, GM.sonucYuva(sekmeHtml(R, v, d))])})
      });
    },
    sonra: (kok, ctx) => {
      if (halEkran(ctx)) return null;
      const R = GM.rotaBul(ctx.param.id) || GM.rotaBul('istanbul-izmir'), v = veri(R), id = R.id;
      if (ctx.sorgu.hal === 'bos') v.kesif = [];
      const ciz = () => GM.tazele();
      const c = [
        GM.on(kok, 'rota-sekme', s => { yaz(id, {...durum(id), sekme: s}); kok.querySelector('[data-kl-sonuc]').innerHTML = sekmeHtml(R, v, durum(id)); }),
        GM.on(kok, 'rota-katman', l => { yaz(id, {...durum(id), katman: l}); ciz(); }),
        GM.eylem(kok, 'durak-ekle', el => { const d = durum(id); if (!d.eklenen.includes(el.dataset.id)) d.eklenen.push(el.dataset.id); yaz(id, d); const x = v.D.find(y => y.slug === el.dataset.id); GM.toast(`Rotaya eklendi · **+${x?.sapma || 1} dk**`, {tur: 'basari', eylem: 'Geri al', onEylem: () => { const e = durum(id); e.eklenen = e.eklenen.filter(s => s !== el.dataset.id); yaz(id, e); ciz(); }}); ciz(); }),
        GM.eylem(kok, 'durak-cikar', el => { const d = durum(id); d.eklenen = d.eklenen.filter(s => s !== el.dataset.id); yaz(id, d); ciz(); }),
        GM.eylem(kok, 'sekme-kesfet', () => { yaz(id, {...durum(id), sekme: 'kesfet'}); ciz(); }),
        GM.eylem(kok, 'sekme-ozet', () => { yaz(id, {...durum(id), sekme: 'ozet'}); ciz(); }),
        GM.eylem(kok, 'indir', () => GM.toast('Rota **çevrimdışı** için indiriliyor · 48 MB', {ikon: 'cevrimdisi'})),
        GM.eylem(kok, 'paylas', () => GM.paylas({baslik: R.ad, url: `https://dadagourmet.com/dada-route/${R.id}`})),
        GM.eylem(kok, 'aktar', () => GM.aktarSheet({rota: R, duraklar: durum(id).eklenen.map(s => v.D.find(x => x.slug === s)).filter(Boolean)})),
        GM.eylem(kok, 'rota-kaydet', () => GM.rotaKaydet(R, {degisti: ciz})),
        GM.eylem(kok, 'rota-mekanlar', () => GM.rotaMekanlarSheet({rota: R, eklenen: () => durum(id).eklenen, ekle: x => { const e = durum(id); if (!e.eklenen.includes(x.slug)) e.eklenen.push(x.slug); yaz(id, e); GM.toast(`Rotaya eklendi · **${x.uzak > 1 ? `+${x.sapma} dk` : 'yol üstü'}**`, {tur: 'basari'}); ciz(); }, cikar: x => { const e = durum(id); e.eklenen = e.eklenen.filter(y => y !== x.slug); yaz(id, e); ciz(); }})),
        GM.rotaKatmanBagla(kok, R, {harita: 'rota-h', oku: () => durum(id), yaz: d => { yaz(id, d); ciz(); }})
      ];
      // Kart ↔ pin: Keşfet kartına dokununca pin seçilir; pine dokununca kart vurgulanıp görünür kayar.
      const h = kok.querySelector('.gm-harita');
      // İl pini → il sheet'i (Ne Yenir / Ne Alınır + o ildeki duraklar); rotaKatmanBagla ile aynı ekle davranışı.
      c.push(GM.on(kok, 'rota-h', pid => { if (!pid.startsWith('il-')) return; GM.ilSheet({rota: R, il: pid.slice(3), eklenen: durum(id).eklenen, ekle: x => { const e = durum(id); if (!e.eklenen.includes(x.slug)) { e.eklenen.push(x.slug); yaz(id, e); } GM.toast(`Rotaya eklendi · **+${x.sapma} dk**`, {tur: 'basari'}); ciz(); }}); }));
      c.push(GM.on(kok, 'rota-h', pid => { kok.querySelectorAll('.gm-dk').forEach(k => k.classList.toggle('is-secili', k.dataset.durak === pid)); kok.querySelector(`.gm-dk[data-durak="${CSS.escape(pid)}"]`)?.scrollIntoView({block: 'nearest', behavior: GM.azHareket() ? 'auto' : 'smooth'}); }));
      const kartTik = ev => { const k = ev.target.closest('.gm-dk'); if (!k || ev.target.closest('button,a')) return; GM.haritaSec ? GM.haritaSec(h, k.dataset.durak, {zoom: 11}) : GM.haritaOdak(h, k.dataset.durak); };
      kok.addEventListener('click', kartTik); c.push(() => kok.removeEventListener('click', kartTik));
      return () => c.forEach(f => f());
    }
  });
})();
