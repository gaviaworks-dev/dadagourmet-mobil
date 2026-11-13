/* Dada Route ana ekranı (rota haritası + duraklar) için referans alternatifleri. Ana yön: ekranlar/rota.js #/rota/:id (tam harita + 4 sekmeli çekmece); bunlar onu tekrar etmez.
   Her biri tek bir uygulamanın kalıbından beslenir (docs/DADA-ROUTE-REFERANS.md §3–§4); kalıp alınır, görünüm kopyalanmaz.
   ref-route-1 komoot: tur sayfası, km ekseninde lezzet eğrisi, durak dağılımı, öne çıkanlar, bölge paketi.
   ref-route-2 Roadtrippers: haritada rota boyunca keşif kategorileri, kayan yer kartı + "Ekle", güzergâh çubuğu → güzergâh sheet'i, il geçiş rehberi.
   ref-route-3 Google Maps: yol tarifi paneli, haritada alternatif rota balonları, "Rota boyunca ara" çipleri, sağ kolonda +dk sonuç listesi.
   ref-route-4 Flighty: yolculuk panosu + kalkış saatine göre yeniden hesaplanan zaman çizelgesi, bildirim tercihleri.
   Veri: GMV.rotalar (rota ?rota= ile değişir, varsayılan istanbul-izmir), durak sayısı yalnız GM.rotaOneri / GM.rotaSayi, eklenen duraklar ana ekranla ortak (rota-<id>).
   Süre: sapma dk = uzaklık km × 2 / 55 × 60; sürüş dk = rotanın km/dk oranı (trafiksiz tahmin). Katman adında "Örnek" yazanlar prototip örneği, yakıt OSM. */
(() => {
  const rota = ctx => GM.rotaBul(ctx.sorgu.rota) || GM.rotaBul('istanbul-izmir');
  const durum = id => GM.durum.oku(`rota-${id}`, null) || {eklenen: [], sekme: 'kesfet', katman: ['neYenir', 'sarj', 'ibadet']};
  const yaz = (id, d) => GM.durum.yaz(`rota-${id}`, d);
  const yerel = (k, v) => ({...v, ...(GM.durum.oku(`route-ref-${k}`, null) || {})});
  const yerelYaz = (k, d) => GM.durum.yaz(`route-ref-${k}`, {...(GM.durum.oku(`route-ref-${k}`, null) || {}), ...d});
  const liste2 = (...a) => a.filter(Boolean).join(' ');
  const sapmaDk = uzak => Math.max(1, Math.round(uzak * 2 / 55 * 60));
  const surusDk = (R, km) => Math.round(km / R.km * R.dk);
  const KAT_AD = {yakit: 'Yakıt', sarj: 'Şarj', ibadet: 'İbadethane', dinlenme: 'Dinlenme', karavan: 'Karavan'};
  const iller = R => (R.iller || []).map(i => ({...i, k: (GMV.ilKimlik || []).find(x => x.ad === i.ad)})).filter(i => i.k);
  const tescil = (i, tur, n = 2) => (i.k?.tescilli || []).filter(t => t.tur === tur).slice(0, n).map(t => t.ad);
  const kod = s => s.slice(0, 3).toLocaleUpperCase('tr');
  // Rota üstünde km'ye düşen nokta (il geçişleri için; iller verisinde koordinat yok, km var).
  const noktaKm = (R, km) => { const c = R.cizgi; let s = 0; const top = c.reduce((a, p, i) => a + (i ? GM.km(c[i - 1], p) : 0), 0), h = km / R.km * top; for (let i = 1; i < c.length; i++) { const d = GM.km(c[i - 1], c[i]); if (s + d >= h) return c[i]; s += d; } return c.at(-1); };
  const ucPinler = R => [{id: 'bas', lng: R.cizgi[0][0], lat: R.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic', ad: R.kalkis}, {id: 'son', lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis', ad: R.varis}];
  // Önerilen durak kümeleri: aradaki boşluk 40 km'yi aşınca yeni küme ("İstanbul çıkışı", "İzmir girişi").
  const kumeler = (R, O) => { const g = []; O.forEach(d => { const s = g.at(-1); if (s && d.km - s.at(-1).km <= 40) s.push(d); else g.push([d]); }); return g.map(l => ({l, il: l[0].mekan.il, bas: l[0].km, son: l.at(-1).km, ad: `${l[0].mekan.il} ${l[0].km < R.km * .2 ? 'çıkışı' : l[0].km > R.km * .8 ? 'girişi' : ''}`.trim(), lng: l.reduce((a, d) => a + d.lng, 0) / l.length, lat: l.reduce((a, d) => a + d.lat, 0) / l.length})); };
  // Eklenen duraklar (ana ekranla ortak durum): km sırasıyla mekân nesnesiyle.
  const eklenenler = (R, O) => durum(R.id).eklenen.map(s => O.find(d => d.slug === s) || GM.rotaDuraklari(R).find(d => d.slug === s)).filter(Boolean).sort((a, b) => a.km - b.km);
  // Durak ekle / çıkar: "Geri al"lı toast (aile F14), ekran yeniden çizilir.
  const durakBagla = (kok, R) => {
    const D = GM.rotaDuraklari(R);
    return [
      GM.eylem(kok, 'durak-ekle', el => { const d = durum(R.id), id = el.dataset.id; if (!d.eklenen.includes(id)) d.eklenen.push(id); yaz(R.id, d); const x = D.find(y => y.slug === id); GM.toast(`Rotaya eklendi · **${x && x.uzak > 1 ? `+${x.sapma} dk` : 'yol üstü'}**`, {tur: 'basari', eylem: 'Geri al', onEylem: () => { const e = durum(R.id); e.eklenen = e.eklenen.filter(s => s !== id); yaz(R.id, e); GM.tazele(); }}); GM.tazele(); }),
      GM.eylem(kok, 'durak-cikar', el => { const d = durum(R.id); d.eklenen = d.eklenen.filter(s => s !== el.dataset.id); yaz(R.id, d); GM.toast('Durak rotadan çıkarıldı', {eylem: 'Geri al', onEylem: () => { const e = durum(R.id); e.eklenen.push(el.dataset.id); yaz(R.id, e); GM.tazele(); }}); GM.tazele(); }),
      GM.eylem(kok, 'paylas', () => GM.paylas({baslik: R.ad, url: `https://dadagourmet.com/dada-route/${R.id}`}))
    ];
  };
  // Tam ekran harita çeşitleri router hallerini kapatır (haller:false); ?hal=hata|yukleniyor burada kanon parçalarıyla çizilir, ?hal=bos veriyi boşaltır.
  const halEkran = ctx => (ctx.sorgu.hal === 'hata' ? GM.hataEkran({tur: 'sunucu', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: ctx.hash.replace(/[?&]hal=hata/, '')}, ikinciller: [{metin: 'Dada Route’a dön', ikon: 'rota', yerine: '#/rota'}]}) : ctx.sorgu.hal === 'yukleniyor' ? GM.iskelet('harita-sheet') : null);
  const aktar = () => GM.sheet({baslik: 'Navigasyonda aç', html: GM.satirlar([{sol: GM.ikonKutu({ikon: 'map', boyut: 'md'}), baslik: 'Google Haritalar', alt: 'Mobilde en çok 3 ara durak; fazlası etaplara bölünür', ok: true}, {sol: GM.ikonKutu({ikon: 'map-location-dot', boyut: 'md'}), baslik: 'Apple Haritalar', alt: 'En çok 14 ara durak', ok: true}, {sol: GM.ikonKutu({ikon: 'location-arrow', boyut: 'md'}), baslik: 'Yandex Navigasyon', alt: 'Yalnız kalkış ve varış', ok: true}])});

  // =====================================================================
  // ref-route-1 · komoot kalıbı: tur sayfası
  // =====================================================================
  GM.ekran('ref-route-1', {
    tur: 'alt', baslik: '',
    bos: {ikon: 'rota', baslik: 'Bu rotanın tur sayfası henüz yok', metin: 'Rota çizilince **lezzet profili**, durak dağılımı ve bölge paketi burada açılır.', eylem: {metin: 'Rota planla', ikon: 'rota', git: '#/rota/planla'}},
    ustBar: () => ({saydam: true, sag: [{ikon: 'paylas', etiket: 'Paylaş', veri: {eylem: 'paylas'}}]}),
    ciz: ctx => {
      const R = rota(ctx), O = GM.rotaOneri(R), G = kumeler(R, O), I = iller(R), K = GM.rotaKatmani(R), n = GM.rotaSayi(R), d = durum(R.id);
      const ara = I.filter(i => i.km > 5 && i.km < R.km - 5 && !G.some(g => g.il === i.ad));
      const pinler = [...ucPinler(R), ...ara.map(i => { const p = noktaKm(R, i.km); return {id: `il-${i.ad}`, lng: p[0], lat: p[1], tur: 'cografi', kucuk: true, soluk: true, ad: i.ad}; }), ...G.map((g, i) => ({id: `g${i}`, lng: g.lng, lat: g.lat, sira: i + 1, etiket: `${g.l.length} durak`, sinif: 'gm-kr-grup', ad: g.ad}))];
      // Uç işaretleri, bir küme uca %6'dan yakınsa çizilmez (komoot A/B ile 1 üst üste binmesin).
      const uc = (km, ikon, ad) => (G.some(g => Math.abs((g.bas + g.son) / 2 - km) < R.km * .06) ? [] : [{km, tur: 'uc', ikon, ad}]);
      const isaret = [...uc(0, 'baslangic', R.kalkis), ...ara.filter(i => !G.some(g => Math.abs((g.bas + g.son) / 2 - i.km) < R.km * .06)).map(i => ({km: i.km, tur: 'il', ikon: 'cografi', ad: i.ad})), ...G.map((g, i) => ({km: (g.bas + g.son) / 2, metin: String(i + 1), ad: g.ad})), ...uc(R.km, 'varis', R.varis)];
      // Komoot "yol türü" dağılımı yerine: önerilen durakların türü ve rotadan sapması (gurme); yol ihtiyaçları ayrı, gri ve küçük.
      const kat = {}; O.forEach(x => { kat[x.mekan.kategori] = (kat[x.mekan.kategori] || 0) + 1; });
      const katL = Object.entries(kat).sort((a, b) => b[1] - a[1]).map(([ad, sayi], i) => ({ad, sayi, ton: Math.min(4, i + 1)}));
      const sap = [['Yol üstü', x => x.uzak <= 1], ['5 dk’ya kadar', x => x.uzak > 1 && x.sapma <= 5], ['6–10 dk', x => x.uzak > 1 && x.sapma > 5 && x.sapma <= 10], ['10 dk üstü', x => x.uzak > 1 && x.sapma > 10]].map(([ad, f], i) => ({ad, sayi: O.filter(f).length, ton: i + 1}));
      const katmanL = Object.keys(KAT_AD).map(t => ({ad: `${KAT_AD[t]}${K.some(k => k.tur === t && k.ornek) ? ' (örnek)' : ''}`, sayi: K.filter(k => k.tur === t).length, ton: 'notr', ikon: t}));
      const bos = G.length > 1 ? Math.round(G[1].bas - G[0].son) : 0;
      const one = G.map((g, i) => GM.krListe(g.l.slice().sort((a, b) => a.uzak - b.uzak).slice(0, 3).map(x => GM.durakKart({...x, id: x.slug}, {sapma: {dk: x.uzak <= 1 ? 1 : x.sapma, km: x.km}, eklendi: d.eklenen.includes(x.slug)})), {sira: i + 1, baslik: g.ad, alt: `${g.bas === g.son ? `${g.bas}.` : `${g.bas}–${g.son}.`} km · ${g.l.length} önerilen durak`}));
      // Kümeler arası boşluk (komoot yol noktaları arası): geçilen iller ve coğrafi işaretli lezzetleri, mekân uydurmadan.
      const arada = (g1, g2) => { const l = ara.filter(i => i.km > g1.son && i.km < g2.bas); return l.length ? GM.krListe([], {ikon: 'cografi', tur: 'cografi', baslik: `${l.map(i => i.ad).join(' · ')} · ${Math.round(g2.bas - g1.son)} km`, alt: `Dada mekânı yok · coğrafi işaret: ${l.map(i => tescil(i, 'yenir', 1)[0] || tescil(i, 'alinir', 1)[0]).filter(Boolean).join(', ')}`}) : ''; };
      const oneAkis = one.flatMap((h, i) => (i ? [arada(G[i - 1], G[i]), h] : [h])).filter(Boolean);
      return GM.harita({ad: 'r1-h', yukseklik: 'var(--gm-size-map-hlg)', etkilesim: false, kontroller: false, rota: {cizgi: R.cizgi}, pinler, dolgu: {top: 84, bottom: 36, left: 56, right: 56}, etiket: `${R.ad} rota haritası`})
        + GM.bolumler([
          {html: GM.turBaslik({rozetler: [{metin: R.tema || 'Dada Route', ikon: 'arac'}, {metin: 'Tek yön', ton: 'notr'}], baslik: R.ad, alt: `${I.map(i => i.ad).join(' › ')} · **${n.yolUstu} yol üstü durak**`, metrik: [{ikon: 'rota', etiket: 'Mesafe', deger: GM.sayi(Math.round(R.km)), birim: 'km'}, {ikon: 'saat', etiket: 'Sürüş', deger: GM.sure(R.dk)}, {ikon: 'durak', etiket: 'Önerilen', deger: String(n.onerilen)}, {ikon: 'cografi', etiket: 'İl', deger: String(I.length)}]})},
          {baslik: 'Lezzet profili', html: GM.lezzetEgri(R, {duraklar: O, katman: K, isaret, not: bos > 100 ? `Eğri, rota boyunca **önerilen Dada duraklarının yoğunluğu**. ${G[0].son}. ile ${G[1].bas}. km arasında (${bos} km) Dada mekânı yok; bu kesimde il kimliği ve yol ihtiyaçları öne çıkar. Sürükle: km km oku.` : 'Eğri, rota boyunca **önerilen Dada duraklarının yoğunluğu**. Sürükle: km km oku.'})},
          {baslik: 'Durak dağılımı', html: GM.krListe([GM.dagilimCubuk({baslik: 'Rota kesimleri', alt: 'Profilin altındaki şerit, km', ogeler: [['dada', 'Dada durağı kesimi', 1], ['il', 'Yalnız il kimliği ve yol', 'il']].map(([t, ad, ton]) => ({ad, ton, sayi: GM.lezzetKesim(R, O).filter(k => k.tur === t).reduce((a, k) => a + k.km, 0), birim: 'km'}))}), GM.dagilimCubuk({baslik: 'Mekân türü', alt: `${n.onerilen} önerilen durak`, ogeler: katL}), GM.dagilimCubuk({baslik: 'Rotadan sapma', alt: 'Gidiş-dönüş, 55 km/sa ortalama', ogeler: sap}), GM.dagilimCubuk({baslik: 'Yol ihtiyaçları', alt: 'Yakıt OpenStreetMap; “örnek” yazanlar prototip örneği', ogeler: katmanL, kucuk: true})])},
          {baslik: 'Öne çıkanlar', eylem: 'Haritada', git: `#/rota/${R.id}`, html: GM.krListe(oneAkis)},
          {baslik: 'Çevrimdışı', html: GM.bolgePaket({bolgeler: [...new Set(I.map(i => i.bolge))], alt: `Rota koridoru: harita, ${n.onerilen} durak, adres ve telefonlar`, boyut: '48 MB', indirildi: yerel(1, {indi: false}).indi})}
        ]);
    },
    altBar: ctx => { const R = rota(ctx), kayitli = yerel(1, {kayit: false}).kayit; return GM.altEylem({ikonlar: [{ikon: 'kaydet', ad: kayitli ? 'Kaydedildi' : 'Kaydet', basili: kayitli, veri: {eylem: 'r1-kaydet'}}, {ikon: 'duzenle', ad: 'Düzenle', git: '#/rota/planla'}], dugmeler: [{metin: 'Yola çık', ikon: 'navigasyon', git: `#/rota/surus/${R.id}`, tam: true}]}); },
    sonra: (kok, ctx) => {
      const R = rota(ctx);
      const c = [...durakBagla(kok, R),
        GM.eylem(kok, 'paket-indir', () => { const v = !yerel(1, {indi: false}).indi; yerelYaz(1, {indi: v}); GM.toast(v ? 'Bölge paketi **cihaza indi** · 48 MB' : 'Bölge paketi silindi', {ikon: 'cevrimdisi', eylem: 'Geri al', onEylem: () => { yerelYaz(1, {indi: !v}); GM.tazele(); }}); GM.tazele(); }),
        GM.eylem(kok, 'r1-kaydet', () => { const v = !yerel(1, {kayit: false}).kayit; yerelYaz(1, {kayit: v}); GM.toast(v ? '**Rotalarım**’a kaydedildi' : 'Kayıt kaldırıldı', {ikon: 'kaydet'}); GM.tazele(); })];
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // ref-route-2 · Roadtrippers kalıbı: rota boyunca keşif + güzergâh çubuğu
  // =====================================================================
  const r2Veri = R => {
    const O = GM.rotaOneri(R), K = GM.rotaKatmani(R), I = iller(R).filter(i => i.km > 5), D = GM.rotaDuraklari(R);
    const rehber = I.map(i => { const p = noktaKm(R, i.km), m = O.filter(x => Math.abs(x.km - i.km) <= 15).length, yk = K.filter(k => Math.abs(k.km - i.km) <= 30); return {id: `il-${i.ad}`, km: i.km, il: i.ad, bolge: `${i.bolge} · ${i.km >= R.km - 5 ? 'Varış ili' : 'İl geçişi'}`, ye: tescil(i, 'yenir').join(', '), al: tescil(i, 'alinir').join(', '), mekan: m ? `${m} önerilen durak ±15 km` : 'Bu kesimde Dada mekânı yok', yol: yk.length ? yk.map(k => k.ad).slice(0, 2).join(' · ') : '', lng: p[0], lat: p[1]}; });
    const kat = t => K.filter(k => (t === 'mola' ? ['dinlenme', 'karavan'].includes(k.tur) : k.tur === t));
    return {O, K, I, D, rehber, kat};
  };
  const R2_KAT = [{deger: 'yemek', metin: 'Ne Yenir?', tur: 'neYenir'}, {deger: 'rehber', metin: 'Geçiş rehberi', tur: 'cografi'}, {deger: 'yakit', metin: 'Yakıt', tur: 'yakit'}, {deger: 'ibadet', metin: 'İbadethane', tur: 'ibadet'}, {deger: 'mola', metin: 'Mola', tur: 'dinlenme'}];
  const r2Plan = (R, v) => {
    const E = eklenenler(R, v.O), dur = [{uc: true, ad: R.kalkis, alt: 'Kalkış'}];
    let onceki = 0;
    E.forEach((x, i) => { dur[dur.length - 1].sonra = `${GM.sayi(Math.round(x.km - onceki))} km · ${GM.sure(surusDk(R, x.km - onceki))}`; dur.push({durak: {...x, id: x.slug}, sira: i + 1, sapma: {dk: x.uzak <= 1 ? 1 : x.sapma, km: x.km}}); onceki = x.km; });
    dur[dur.length - 1].sonra = `${GM.sayi(Math.round(R.km - onceki))} km · ${GM.sure(surusDk(R, R.km - onceki))}`;
    dur.push({uc: true, ad: R.varis, alt: 'Varış'});
    const ek = E.reduce((a, x) => a + (x.uzak <= 1 ? 1 : x.sapma), 0);
    return {E, ek, html: GM.krListe([GM.ozetSerit([{ikon: 'rota', etiket: 'Mesafe', deger: GM.sayi(Math.round(R.km)), birim: 'km'}, {ikon: 'saat', etiket: 'Süre', deger: GM.sure(R.dk + ek), alt: ek ? `+${ek} dk sapma dahil` : 'Sapma yok'}, {ikon: 'durak', etiket: 'Durak', deger: String(E.length)}]), GM.rotaSerit(dur), E.length ? '' : GM.bilgi({ikon: 'bilgi', metin: 'Haritadaki kartlarda **Ekle**’ye dokun; durak kalkış ile varış arasına km sırasıyla yerleşir.'})])};
  };
  GM.ekran('ref-route-2', {
    tur: 'tam', ust: '#/rota', haller: false,
    ciz: ctx => {
      const hal = halEkran(ctx); if (hal) return hal;
      const R = rota(ctx), v = r2Veri(R), s = yerel(2, {kat: 'yemek'}), kat = ctx.sorgu.kat || s.kat, d = durum(R.id), E = eklenenler(R, v.O);
      if (ctx.sorgu.hal === 'bos') v.O = [];
      const sayi = {yemek: v.O.length, rehber: v.rehber.length, yakit: v.kat('yakit').length, ibadet: v.kat('ibadet').length, mola: v.kat('mola').length};
      const plan = E.map((x, i) => ({id: x.slug, lng: x.lng, lat: x.lat, sira: i + 1, ad: x.mekan.ad}));
      const katPin = kat === 'yemek' ? v.O.filter(x => !d.eklenen.includes(x.slug)).map(x => ({id: x.slug, lng: x.lng, lat: x.lat, etiket: x.uzak <= 1 ? 'Yol üstü' : `+${x.sapma} dk`, ad: x.mekan.ad}))
        : kat === 'rehber' ? v.rehber.map(x => ({id: x.id, lng: x.lng, lat: x.lat, tur: 'cografi', etiket: x.km >= R.km - 5 ? null : x.il, kucuk: x.km >= R.km - 5, ad: x.il}))
          : v.kat(kat).map(k => ({id: k.id, lng: k.lng, lat: k.lat, tur: k.tur, ad: k.ad}));
      const kartlar = kat === 'yemek' ? v.O.map(x => GM.kesifKart(x.mekan, {sapma: {dk: x.uzak <= 1 ? 1 : x.sapma, km: x.km}, eklendi: d.eklenen.includes(x.slug)}))
        : kat === 'rehber' ? v.rehber.map(x => GM.gecisRehber(x))
          : v.kat(kat).map(k => GM.sapmaSatir(k, {sapma: sapmaDk(k.uzak), km: k.km, eylem: false}));
      const ek = E.reduce((a, x) => a + (x.uzak <= 1 ? 1 : x.sapma), 0);
      return GM.haritaEkran({
        harita: GM.harita({ad: 'r2-h', tam: true, kume: kat === 'yemek', kontroller: false, rota: {cizgi: R.cizgi}, pinler: [...katPin, ...plan], dolgu: {top: 190, bottom: 250, left: 36, right: 36}, etiket: `${R.ad}, rota boyunca keşif`}),
        ust: GM.haritaArama({yer: `${R.kalkis} → ${R.varis} boyunca ara`, ad: 'r2-ara'}) + GM.kesifKategoriler({ad: 'r2-kat', secili: kat, ogeler: R2_KAT.map(x => ({...x, sayi: sayi[x.deger]}))}),
        alt: (kartlar.length ? GM.haritaKartlar(kartlar, {etiket: 'Rota boyunca yerler, yatay kaydır'}) : GM.haritaKartlar([GM.bos({ikon: R2_KAT.find(x => x.deger === kat)?.tur || 'durak', baslik: kat === 'yemek' ? 'Bu rotada henüz Dada durağı yok' : 'Bu rotada yok', metin: kat === 'yemek' ? '**Geçiş rehberi**’nde geçtiğin illerin coğrafi işaretli lezzetleri var.' : 'Bu kategoride rota koridorunda nokta bulunamadı.', eylem: kat === 'yemek' ? {metin: 'Geçiş rehberi', tur: 'secondary', boyut: 'sm', veri: {eylem: 'r2-rehber'}} : null})]))
          + GM.planCubuk({metin: 'Güzergâhı gör', ozet: `${E.length ? `${E.length} durak` : 'Durak eklenmedi'} · ${GM.sayi(Math.round(R.km))} km · ${GM.sure(R.dk + ek)}`, sayi: E.length || null, veri: {eylem: 'r2-plan'}})
      });
    },
    sonra: (kok, ctx) => {
      if (halEkran(ctx)) return null;
      const R = rota(ctx), v = r2Veri(R), h = kok.querySelector('.gm-harita');
      const planAc = () => { const p = r2Plan(R, v); GM.sheet({baslik: R.ad, html: p.html, altBar: GM.btnIkili({metin: 'Aktar', ikon: 'navigasyon', veri: {eylem: 'r2-aktar'}}, {metin: 'Yola çık', ikon: 'arac', git: `#/rota/surus/${R.id}`}), sonra: k => { k.addEventListener('click', ev => { if (ev.target.closest('[data-eylem="r2-aktar"]')) aktar(); }); }}); };
      const c = [...durakBagla(kok, R),
        GM.on(kok, 'r2-kat', k => { yerelYaz(2, {kat: k}); GM.tazele(); }),
        GM.eylem(kok, 'r2-plan', planAc),
        GM.eylem(kok, 'r2-rehber', () => { yerelYaz(2, {kat: 'rehber'}); GM.tazele(); }),
        GM.eylem(kok, 'filtre', () => GM.toast('Süzgeç: **açık olanlar**, fiyat, sapma toleransı', {ikon: 'filtre'})),
        // Kart ↔ pin: pine dokununca kart ortaya kayar; kart kaydırılınca ortadaki kartın pini seçilir.
        GM.on(kok, 'r2-h', pid => { const k = kok.querySelector(`.gm-kl-hkart [data-mekan="${CSS.escape(pid)}"], .gm-kl-hkart [data-durak="${CSS.escape(pid)}"]`); k?.scrollIntoView({inline: 'center', block: 'nearest', behavior: GM.azHareket() ? 'auto' : 'smooth'}); })];
      // Ekle / çıkar ekranı yeniden çizer: şerit aynı kartta kalsın (odak kartı kaydedilir, yeniden çizimde haritayı oynatmadan geri konur).
      const odakYaz = ev => { const b = ev.target.closest?.('.gm-kl-hkart [data-eylem="durak-ekle"], .gm-kl-hkart [data-eylem="durak-cikar"]'); if (b) yerelYaz(2, {odak: b.dataset.id}); };
      kok.addEventListener('click', odakYaz, true); c.push(() => kok.removeEventListener('click', odakYaz, true));
      const serit = kok.querySelector('.gm-kl-hkart'), odak = yerel(2, {}).odak;
      let atla = false;
      if (serit && odak) { const k = serit.querySelector(`[data-mekan="${CSS.escape(odak)}"]`); if (k) { atla = true; serit.scrollLeft = k.offsetLeft - (serit.clientWidth - k.offsetWidth) / 2; k.classList.add('is-secili'); } yerelYaz(2, {odak: null}); }
      if (serit) { let t; const kay = () => { if (atla) { atla = false; return; } clearTimeout(t); t = setTimeout(() => { const r = serit.getBoundingClientRect(), orta = r.left + r.width / 2; const k = [...serit.children].sort((a, b) => Math.abs(a.getBoundingClientRect().left + a.offsetWidth / 2 - orta) - Math.abs(b.getBoundingClientRect().left + b.offsetWidth / 2 - orta))[0]; const id = k?.dataset.mekan || k?.dataset.durak; if (id) { serit.querySelectorAll('.is-secili').forEach(x => x.classList.remove('is-secili')); k.classList.add('is-secili'); GM.haritaSec(h, id, {zoom: 10}); } }, 140); }; serit.addEventListener('scroll', kay, {passive: true}); c.push(() => serit.removeEventListener('scroll', kay)); }
      if (ctx.sorgu.plan === '1') setTimeout(planAc, 300);
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // ref-route-3 · Google Maps kalıbı: alternatifli yol tarifi + rota boyunca ara
  // =====================================================================
  // Alternatif rota: aynı kalkışlı başka pilot rotanın ana çizgiden ayrılan kolu (gerçek OSRM parçası) gidiş-dönüş eklenir. İstanbul–İzmir için İstanbul–Bursa kolu: Bursa merkezi üzerinden.
  // Süre farkı sapma kuralıyla (kol km × 2 / 55 × 60); kolun ucundaki Dada mekânları "bu yoldan gelen" duraklardır.
  const r3Alt = R => {
    const A = R.cizgi;
    return (GMV.rotalar || []).filter(x => x.id !== R.id && x.kalkis === R.kalkis && x.cizgi?.length).map(B => {
      const uz = p => Math.min(...A.map(q => GM.km(p, q))), son = uz(B.cizgi.at(-1));
      if (son < 3 || son > 20) return null;
      let j = B.cizgi.length - 1; while (j > 0 && uz(B.cizgi[j - 1]) > .8) j--;
      const kol = B.cizgi.slice(j), kolKm = kol.reduce((a, p, i) => a + (i ? GM.km(kol[i - 1], p) : 0), 0);
      const k = A.reduce((bi, q, i) => (GM.km(q, B.cizgi[j]) < GM.km(A[bi], B.cizgi[j]) ? i : bi), 0);
      const ek = GM.rotaDuraklari(B).filter(d => d.mekan.kapak && GM.rotayaUzaklik([d.lng, d.lat], kol) <= 3);
      return {id: B.id, ad: `${B.varis} üzerinden`, yer: B.varis, kol, cizgi: [...A.slice(0, k + 1), ...kol, ...kol.slice().reverse(), ...A.slice(k)], km: R.km + 2 * kolKm, dk: R.dk + sapmaDk(kolKm), ek};
    }).filter(Boolean).slice(0, 1);
  };
  const R3_ARA = R => [{deger: 'neYenir', metin: 'Restoranlar', ikon: 'neYenir', sayi: GM.rotaSayi(R).onerilen}, ...['yakit', 'sarj', 'ibadet', 'dinlenme', 'karavan'].map(t => ({deger: t, metin: KAT_AD[t], ikon: t, sayi: GM.rotaKatmani(R, t).length})).filter(x => x.sayi || x.deger === 'sarj')];
  GM.ekran('ref-route-3', {
    tur: 'tam', ust: '#/rota', haller: false,
    ciz: ctx => {
      const hal = halEkran(ctx); if (hal) return hal;
      const R = rota(ctx), O = ctx.sorgu.hal === 'bos' ? [] : GM.rotaOneri(R), AL = r3Alt(R), s = yerel(3, {sec: 'ana', ara: 'neYenir', arac: 'yakit'}), d = durum(R.id);
      const alt = AL.find(a => a.id === s.sec), sec = alt || {id: 'ana', km: R.km, dk: R.dk, cizgi: R.cizgi};
      const ara = s.arac === 'ev' && s.ara === 'yakit' ? 'sarj' : s.arac !== 'ev' && s.ara === 'sarj' ? 'yakit' : s.ara;
      // Sonuçlar: Restoranlar = önerilen duraklar (+ seçili alternatifin kolundaki mekânlar); katmanlar sapma kuralıyla.
      const ekM = (alt?.ek || []).map(x => ({...x, kol: true}));
      const sonuc = ara === 'neYenir' ? [...O, ...ekM].map(x => ({d: {...x, id: x.slug}, dk: x.uzak <= 1 ? 1 : x.sapma, km: x.km, ll: [x.lng, x.lat]}))
        : GM.rotaKatmani(R, ara).map(k => ({d: k, dk: sapmaDk(k.uzak), km: k.km, ll: [k.lng, k.lat]}));
      sonuc.sort((a, b) => a.dk - b.dk || a.km - b.km);
      const ortaA = noktaKm(R, R.km * .62), balon = [{id: 'ana', lng: ortaA[0], lat: ortaA[1], tur: 'rota', ikon: 'arac', etiket: s.sec === 'ana' ? GM.sure(R.dk) : `${GM.sure(R.dk)} · en hızlı`, sinif: liste2('gm-kr-balon', s.sec === 'ana' && 'is-secili'), ad: 'En hızlı rota'},
        ...AL.map(a => ({id: a.id, lng: a.kol.at(-1)[0], lat: a.kol.at(-1)[1], tur: 'rota', ikon: 'neYenir', etiket: s.sec === a.id ? GM.sure(a.dk) : `+${a.dk - R.dk} dk · ${a.yer}`, sinif: liste2('gm-kr-balon', s.sec === a.id && 'is-secili'), ad: a.ad}))];
      const sonucPin = sonuc.map(x => (ara === 'neYenir' ? {id: x.d.id, lng: x.ll[0], lat: x.ll[1], etiket: d.eklenen.includes(x.d.id) ? null : x.dk <= 2 ? 'Yol üstü' : `+${x.dk} dk`, sira: d.eklenen.includes(x.d.id) ? d.eklenen.indexOf(x.d.id) + 1 : null, ad: x.d.mekan?.ad} : {id: x.d.id, lng: x.ll[0], lat: x.ll[1], tur: x.d.tur, etiket: `+${x.dk} dk`, ad: x.d.ad}));
      const aciklama = ara === 'neYenir' ? `${sonuc.length} sonuç · ek süre sağda, gidiş-dönüş` : `${sonuc.length} ${KAT_AD[ara]} noktası · ${GM.rotaKatmani(R, ara).some(k => k.ornek) ? '“Örnek” yazanlar prototip örneği' : 'OpenStreetMap'}`;
      const liste = sonuc.length ? GM.krListe(sonuc.map(x => GM.sapmaSatir(x.d, {sapma: x.dk, km: x.km, eklendi: d.eklenen.includes(x.d.id), eylem: ara === 'neYenir' && !x.d.kol ? undefined : false})), {ikon: R3_ARA(R).find(x => x.deger === ara)?.ikon, tur: ara === 'neYenir' ? null : 'katman', baslik: `Rota boyunca · ${R3_ARA(R).find(x => x.deger === ara)?.metin || KAT_AD[ara]}`, alt: aciklama})
        : GM.bos({ikon: ara, baslik: ara === 'neYenir' ? 'Bu rotada henüz Dada durağı yok' : `Rotada ${KAT_AD[ara]} verisi yok`, metin: ara === 'sarj' ? 'Bu pilot rotada **şarj noktası verisi yok**; Elektrikli araçta duraklar şarj süresiyle planlanamaz.' : 'Bu kategoride rota koridorunda nokta bulunamadı.'});
      const simdi = GM.simdi().getHours() * 60 + GM.simdi().getMinutes();
      const bas = GM.yonOzet({sure: GM.sure(sec.dk), km: `${GM.sayi(Math.round(sec.km))} km`, varis: GM.saatNokta(simdi + sec.dk), alt: alt ? `${alt.ad} · +${alt.ek.length} Dada mekânı` : 'En hızlı · trafiksiz', eylem: GM.btn({metin: 'Başlat', ikon: 'navigasyon', git: `#/rota/surus/${R.id}`, boyut: 'sm'})});
      return GM.haritaEkran({
        harita: GM.harita({ad: 'r3-h', tam: true, kume: ara === 'neYenir', kontroller: false, koridor: false, rota: {cizgi: sec.cizgi, alternatif: alt ? R.cizgi : AL[0]?.kol}, pinler: [...(ara === 'neYenir' ? [] : ucPinler(R)), ...sonucPin, ...balon], dolgu: {top: 220, bottom: 380, left: 40, right: 40}, etiket: `${R.ad} yol tarifi`}),
        ust: GM.yonPanel({nereden: R.kalkis, nereye: R.varis, alt: GM.segment({ad: 'r3-arac', secili: s.arac, ogeler: [{ad: 'Yakıtlı', deger: 'yakit', ikon: 'yakit'}, {ad: 'Elektrikli', deger: 'ev', ikon: 'sarj'}]})}) + GM.cipler({ad: 'r3-ara', tur: 'tek', secili: ara, etiket: 'Rota boyunca ara', ogeler: R3_ARA(R).filter(x => s.arac === 'ev' ? x.deger !== 'yakit' : x.deger !== 'sarj')}),
        cekmece: GM.cekmece({ad: 'r3-cekmece', durak: 'yarim', bas, etiket: 'Rota boyunca sonuçlar', html: liste})
      });
    },
    sonra: (kok, ctx) => {
      if (halEkran(ctx)) return null;
      const R = rota(ctx), AL = r3Alt(R), h = kok.querySelector('.gm-harita');
      const c = [...durakBagla(kok, R),
        GM.on(kok, 'r3-ara', a => { yerelYaz(3, {ara: a}); GM.tazele(); }),
        GM.on(kok, 'r3-arac', a => { yerelYaz(3, {arac: a}); GM.tazele(); }),
        GM.eylem(kok, 'yon-degistir', () => GM.toast('Kalkış ve varış **yer değiştirir**; rota yeniden hesaplanır', {ikon: 'muadil'})),
        GM.on(kok, 'r3-h', pid => {
          if (pid === 'ana' || AL.some(a => a.id === pid)) { const once = yerel(3, {sec: 'ana'}).sec; yerelYaz(3, {sec: pid}); if (once !== pid) { const a = AL.find(x => x.id === pid); GM.toast(a ? `**${a.ad}** seçildi · +${a.dk - R.dk} dk` : '**En hızlı rota** seçildi', {ikon: 'rota'}); } GM.tazele(); return; }
          kok.querySelectorAll('.gm-kr-ss').forEach(k => k.classList.toggle('is-secili', k.dataset.durak === pid)); kok.querySelector(`.gm-kr-ss[data-durak="${CSS.escape(pid)}"]`)?.scrollIntoView({block: 'nearest', behavior: GM.azHareket() ? 'auto' : 'smooth'});
        })];
      const tik = ev => { const k = ev.target.closest('.gm-kr-ss'); if (!k || ev.target.closest('button,a')) return; kok.querySelectorAll('.gm-kr-ss').forEach(x => x.classList.toggle('is-secili', x === k)); GM.haritaSec(h, k.dataset.durak, {zoom: 11}); };
      kok.addEventListener('click', tik); c.push(() => kok.removeEventListener('click', tik));
      return () => c.forEach(f => f());
    }
  });
  // =====================================================================
  // ref-route-4 · Flighty kalıbı: yolculuk panosu + zaman çizelgesi
  // =====================================================================
  const MOLA = {mekan: 60, yakit: 10, sarj: 30, ibadet: 20, dinlenme: 15, karavan: 15};
  // Plan: eklenen duraklar (ana ekranla ortak); yoksa önerilen plan = varışa en yakın yol üstü Dada durağı + yolun ortasına en yakın yakıt.
  const r4Plan = R => {
    const O = GM.rotaOneri(R), E = eklenenler(R, O);
    if (E.length) return {oneri: false, l: E.map(x => ({tur: 'mekan', km: x.km, x}))};
    const m = O.filter(x => x.uzak <= 1).at(-1), y = GM.rotaKatmani(R, 'yakit').sort((a, b) => Math.abs(a.km - R.km / 2) - Math.abs(b.km - R.km / 2))[0];
    return {oneri: true, l: [y && {tur: 'yakit', km: y.km, k: y}, m && {tur: 'mekan', km: m.km, x: m}].filter(Boolean).sort((a, b) => a.km - b.km)};
  };
  const ogun = dk => { const s = dk % 1440; return s >= 690 && s <= 870 ? {metin: 'Öğle yemeğine denk', ton: 'basari'} : s >= 1080 && s <= 1290 ? {metin: 'Akşam yemeğine denk', ton: 'basari'} : s >= 420 && s <= 630 ? {metin: 'Kahvaltı saati', ton: 'bilgi'} : null; };
  GM.ekran('ref-route-4', {
    tur: 'alt', baslik: 'Yolculuk',
    ustBar: () => ({sag: [{ikon: 'paylas', etiket: 'Paylaş', veri: {eylem: 'paylas'}}]}),
    bos: {ikon: 'takvim', baslik: 'Planlanmış yolculuk yok', metin: 'Bir rota seç; Dada **kalkış saatine göre** her durağa varış saatini çıkarır.', eylem: {metin: 'Rota planla', ikon: 'rota', git: '#/rota/planla'}},
    ciz: ctx => {
      const R = rota(ctx), s = yerel(4, {kalkis: 480, kip: 'plan'}), yolda = (ctx.sorgu.yolda === '1' || s.kip === 'yolda'), P = r4Plan(R), I = iller(R).filter(i => i.km > 5 && i.km < R.km - 5);
      // Olaylar km sırasıyla: kalkış, il geçişleri, plan durakları, varış. Saat = kalkış + sürüş (rota oranı) + önceki molalar.
      const olay = [...I.map(i => ({tur: 'il', km: i.km, i})), ...P.l].sort((a, b) => a.km - b.km);
      const molaOnce = km => olay.filter(o => o.tur !== 'il' && o.km < km).reduce((a, o) => a + (MOLA[o.tur] || 15), 0);
      // Canlı hal (Flighty "in flight"): konum = yolun ortasındaki il geçişinden 12 km sonrası; kalkış, şimdiki saatin (GM.simdi) bu noktaya denk geleceği saattir.
      const simdi = GM.simdi().getHours() * 60 + GM.simdi().getMinutes(), konumKm = yolda ? Math.round((I.find(i => i.km > R.km * .45)?.km ?? R.km * .55) + 12) : -1;
      const t0 = yolda ? simdi - surusDk(R, konumKm) - molaOnce(konumKm) : +s.kalkis;
      let mola = 0, onceki = 0, simdiVar = false;
      const isle = (x, km) => { if (!yolda) return x; if (km < konumKm) return {...x, gecildi: true}; if (!simdiVar) { simdiVar = true; return {...x, simdi: true}; } return x; };
      const satir = [isle({saat: GM.saatNokta(t0), tur: 'uc', ikon: 'baslangic', etiket: yolda ? 'Kalktın' : 'Kalkış', baslik: R.kalkis, alt: 'Konumundan'}, 0)];
      olay.forEach(o => {
        const var_ = t0 + surusDk(R, o.km) + mola;
        satir.at(-1).sonra = `${GM.sure(surusDk(R, o.km - onceki))} sürüş · ${GM.sayi(Math.round(o.km - onceki))} km`; onceki = o.km;
        if (o.tur === 'il') { const ci = [...tescil(o.i, 'yenir', 1), ...tescil(o.i, 'alinir', 1)]; satir.push(isle({saat: GM.saatNokta(var_), fark: `+${GM.sure(var_ - t0)}`, tur: 'il', etiket: `İl geçişi · ${o.km}. km`, baslik: o.i.ad, alt: ci.length ? `Coğrafi işaret: ${ci.join(', ')}` : ''}, o.km)); return; }
        const dk = MOLA[o.tur] || 15; mola += dk;
        if (o.tur === 'mekan') { const x = o.x; satir.push(isle({saat: GM.saatNokta(var_), fark: `${GM.sure(dk)} mola`, tur: 'mekan', etiket: `Gurme durak · ${x.km}. km`, rozet: ogun(var_), html: GM.durakKart({...x, id: x.slug}, {sapma: {dk: x.uzak <= 1 ? 1 : x.sapma, km: x.km}, eylem: false})}, o.km)); return; }
        satir.push(isle({saat: GM.saatNokta(var_), fark: `${dk} dk`, tur: 'katman', ikon: o.tur, etiket: `${KAT_AD[o.tur]} molası · ${o.km}. km`, baslik: o.k.ad, alt: `+${sapmaDk(o.k.uzak)} dk sapma${o.k.ornek ? ' · prototip örneği' : ' · OpenStreetMap'}`}, o.km));
      });
      const varis = t0 + R.dk + mola;
      satir.at(-1).sonra = `${GM.sure(surusDk(R, R.km - onceki))} sürüş · ${GM.sayi(Math.round(R.km - onceki))} km`;
      satir.push(isle({saat: GM.saatNokta(varis), fark: `+${GM.sure(varis - t0)}`, tur: 'uc', ikon: 'varis', etiket: 'Varış', baslik: R.varis, alt: `${GM.sure(R.dk)} sürüş + ${GM.sure(mola)} mola`}, R.km));
      // Canlı pano: sıradaki gurme durağa kalan süre (yoksa varışa); Flighty "until gate arrival" cümlesi.
      const sonraki = yolda ? P.l.find(o => o.tur === 'mekan' && o.km >= konumKm) : null, hedefDk = sonraki ? surusDk(R, sonraki.km - konumKm) : varis - simdi;
      const tarih = new Date(GM.simdi().getTime() + (yolda ? 0 : 864e5)).toLocaleDateString('tr-TR', {weekday: 'long', day: 'numeric', month: 'long'});
      const pano = GM.yolPano({canli: yolda, ust: yolda ? `Canlı · Bugün, ${tarih}` : `Dada Route · Yarın, ${tarih}`, sag: `${kod(R.kalkis)}–${kod(R.varis)}`, kalkis: {kod: kod(R.kalkis), saat: GM.saatNokta(t0), alt: `${R.kalkis} · ${yolda ? 'Kalktı' : 'Planlandı'}`}, varis: {kod: kod(R.varis), saat: GM.saatNokta(varis), alt: 'Tahmini varış'},
        ilerleme: yolda ? konumKm / R.km : 0, durum: GM.sure(yolda ? hedefDk : varis - t0), durumAlt: yolda ? (sonraki ? `${sonraki.x.mekan.ad} durağına kalan · ${Math.round(sonraki.km - konumKm)} km` : `${R.varis} varışına kalan`) : `Kapıdan kapıya · ${P.l.length} mola dahil`});
      const kip = GM.segment({ad: 'r4-kip', secili: yolda ? 'yolda' : 'plan', ogeler: [{ad: 'Plan', deger: 'plan', ikon: 'takvim'}, {ad: 'Yolda', deger: 'yolda', ikon: 'arac'}]});
      return GM.bolumler([
        {html: GM.yigin([kip, pano, yolda ? GM.yaklasmaUyari({baslik: sonraki ? `Sıradaki durak: ${sonraki.x.mekan.ad}` : `Sıradaki: ${R.varis}`, metin: sonraki ? `${GM.saatNokta(simdi + hedefDk)} civarı varış · durağa 3–5 km kala sesli uyarı gelir` : 'Planında başka gurme durak yok'}) : GM.alan({etiket: 'Kalkış saati', html: GM.segment({ad: 'r4-kalkis', secili: String(t0), ogeler: [420, 480, 540, 600, 660].map(x => ({ad: GM.saatNokta(x), deger: String(x)}))})})], 16)},
        {baslik: 'Zaman çizelgesi', eylem: 'Haritada', git: `#/rota/${R.id}`, html: GM.krListe([P.oneri && !yolda ? GM.bant({ton: 'bilgi', baslik: 'Önerilen plan', metin: 'Henüz durak eklemedin; Dada **varışa en yakın yol üstü durağı** ve yolun ortasındaki yakıtı önerdi. Saatler trafiksiz tahmindir.', eylem: {metin: 'Durak seç', git: `#/rota/${R.id}`}}) : '', GM.zamanAkis(satir)])},
        {baslik: 'Yolculuk bildirimleri', html: GM.satirlar([GM.toggle({ad: 'r4-sabah', ikon: 'bildirim', etiket: 'Sabah özeti', alt: `${GM.saatNokta(t0 - 30)}: durak sayısı, ilk mola ve tahmini varış`, secili: true}), GM.toggle({ad: 'r4-mola', ikon: 'sesli', etiket: 'Durağa yaklaşınca', alt: '3–5 km kala sesli ve yazılı uyarı', secili: true}), GM.toggle({ad: 'r4-il', ikon: 'cografi', etiket: 'Yeni ile girince', alt: 'Coğrafi işaretli lezzetler, araç durunca açılır'})])}
      ]);
    },
    altBar: ctx => { const yolda = ctx.sorgu.yolda === '1' || yerel(4, {kip: 'plan'}).kip === 'yolda'; return GM.altEylem({ikonlar: [{ikon: 'takvim', ad: 'Takvime ekle', veri: {eylem: 'r4-takvim'}}, {ikon: 'navigasyon', ad: 'Navigasyona aktar', veri: {eylem: 'r4-aktar'}}], dugmeler: [{metin: yolda ? 'Co-Pilot’u aç' : 'Yola çık', ikon: yolda ? 'sesli' : 'arac', git: `#/rota/surus/${rota(ctx).id}`, tam: true}]}); },
    sonra: (kok, ctx) => {
      const R = rota(ctx), c = [...durakBagla(kok, R),
        GM.on(kok, 'r4-kip', v => { yerelYaz(4, {kip: v}); if (/[?&]yolda=1/.test(ctx.hash)) GM.yerine(ctx.hash.replace(/[?&]yolda=1/, '')); else GM.tazele(); if (v === 'yolda') GM.toast('Canlı hal: **Co-Pilot** ile aynı bilgi, Canlı Etkinlik’te de görünür', {ikon: 'arac'}); }),
        GM.on(kok, 'r4-kalkis', v => { const once = yerel(4, {kalkis: 480}).kalkis; yerelYaz(4, {kalkis: +v}); GM.tazele(); const f = +v - once; if (f) GM.toast(`Kalkış ${GM.saatNokta(+v)} · bütün saatler **${f > 0 ? '+' : '−'}${GM.sure(Math.abs(f))}** kaydı`, {ikon: 'saat'}); }),
        GM.eylem(kok, 'r4-takvim', () => GM.toast('Yolculuk **takvime** eklendi', {ikon: 'takvim'})),
        GM.eylem(kok, 'r4-aktar', aktar)];
      return () => c.forEach(f => f());
    }
  });

  // ---------- Karar sayfası kayıtları (#/alternatifler) ----------
  // route-a (ana yön) kaydı ekranlar/ana-alternatif.js'te; dosyalar sırayla yüklendiği için burada aynı kayıt "iyilesti" alanıyla yeniden yazılır.
  GM.alternatifKaydet({...(GM.alternatifler('route').find(x => x.kod === 'route-a') || {ekran: 'route', kod: 'route-a', sira: 1, ad: 'Route · Ana yön (araştırma)', referans: 'Gastro orta düğme sheet’i + Roadtrippers + Waze + Flighty', alinan: 'Merkez: planlayıcı, webden rota, son ve hazır rotalar; harita + Duraklar/Keşfet/İhtiyaçlar/Özet çekmecesi.', gerekce: 'DADA-ROUTE-REFERANS §6 ana yönleri; aileyle tutarlı.', git: '#/rota'}), iyilesti: 'Merkeze pilot rotanın lezzet profili, haritaya il kimliği pinleri (dokununca Ne Yenir / Ne Alınır sheet’i) geldi; sürüş süreleri özetle tutarlı, ham sınıflar kanona taşındı, boş/yükleniyor/hata halleri eklendi.'});
  GM.alternatifKaydet({ekran: 'route', kod: 'ref-route-1', sira: 2, ad: 'Route · komoot kalıbı', referans: 'komoot (Garmin Connect IQ App of the Year 2023, şirket beyanı)', alinan: 'Tur sayfası: harita üstte, dört metrik, km ekseninde sürüklenebilir profil (yükseklik yerine lezzet yoğunluğu), yol türü yerine durak türü ve sapma dağılımı, bölge paketi.', gerekce: 'Rotayı yola çıkmadan bir bakışta okutur: lezzetin rotanın neresinde toplandığını ve aradaki boşluğu dürüstçe gösterir.', iyilesti: 'Profilin altına komoot yüzey şeridinin karşılığı geldi (Dada durağı kesimi / yalnız il kimliği kesimi, km cinsinden) ve dağılım km’ye çevrildi; boş hal eklendi.', git: '#/ref/route-1'});
  GM.alternatifKaydet({ekran: 'route', kod: 'ref-route-2', sira: 3, ad: 'Route · Roadtrippers kalıbı', referans: 'Roadtrippers (yol gezisi planlamada kategori lideri; ödül doğrulanmadı)', alinan: 'Haritada rota boyunca keşif kategorileri, kayan yer kartında “Ekle”, sabit güzergâh çubuğu ve otoyol çıkış rehberi yerine il geçiş rehberi.', gerekce: 'Keşif ile plan aynı haritada iki kip olur; durak eklemek tek dokunuş, güzergâh her an bir çubuk uzakta.', iyilesti: 'Yer kartı Roadtrippers’taki gibi tek satıra indi, “Ekle” sağda dikey düğme; boş/yükleniyor/hata halleri ve boş rotada Geçiş rehberine yönlendirme eklendi.', git: '#/ref/route-2'});
  GM.alternatifKaydet({ekran: 'route', kod: 'ref-route-3', sira: 4, ad: 'Route · Google Maps kalıbı', referans: 'Google Maps (navigasyonda global kategori lideri)', alinan: 'Yol tarifi paneli, haritada süre balonlu alternatif rota, “Rota boyunca ara” çipleri ve sağ kolonda +dk ek süreli sonuç listesi.', gerekce: 'Kullanıcının zaten bildiği dil: “bu durak bana kaç dakikaya mal olur” sorusunu her satırda aynı hizada cevaplar.', iyilesti: 'Sheet başı Google imzasıyla süre · mesafe · varış saati; boş/yükleniyor/hata halleri; boş rotada Dada’ya özgü boş durum.', git: '#/ref/route-3'});
  GM.alternatifKaydet({ekran: 'route', kod: 'ref-route-4', sira: 5, ad: 'Route · Flighty kalıbı', referans: 'Flighty (Apple Design Awards 2023, Interaction)', alinan: 'Uçuş kartı gibi yolculuk panosu (kod, büyük saatler, kapıdan kapıya süre) ve kalkış saatine göre yeniden hesaplanan saatli zaman çizelgesi, yolculuk bildirimleri.', gerekce: 'Haritayı değil zamanı öne alır: hangi durağa saat kaçta varılacağını ve öğüne denk gelip gelmediğini gösterir.', iyilesti: 'Flighty’nin canlı hali eklendi (Plan / Yolda): ilerleme yayı, sıradaki gurme durağa kalan süre, geçilen olaylar soluk, şimdiki nabızlı; Co-Pilot’a geçiş.', git: '#/ref/route-4'});
})();
