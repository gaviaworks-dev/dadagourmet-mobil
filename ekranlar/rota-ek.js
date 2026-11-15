/* Dada Route, kalan ekranlar (docs/DADA-ROUTE-REFERANS.md §5 d–l, §6 ana yönleri). Yalnız kanon bileşenleri (gm-route.js ek blok, gm-cihaz.js rota türü).
   #/rota/ozet/:id (g) özet + Aktar sheet'i, Kaydet / Yola çık · #/rota/telefon (i) Canlı Etkinlik, Dinamik Ada, bildirimler · #/rota/arac (j) CarPlay / Android Auto
   #/rota/cevrimdisi (k) paket yönetimi · #/rota/gunluk (l) seyahat günlüğü (?id= ayrıntı) · #/rota/rotalarim · #/rota/hazir.
   (d) katman sheet'i, (e) durak sheet'i, (f) il kartı sheet'i kanon bileşenidir; rota haritası (rota.js) ve rota özeti GM.rotaKatmanBagla ile açar.
   Durum: rota-<id> (eklenen mekân slug'ları, mola = katman kimlikleri; rota.js ile ortak) · rota-paketler (çevrimdışı) · rota-kayitli · rota-telefon-gorunum · rota-arac-gorunum.
   Sayılar GM.rotaOneri / GM.rotaKatmani / GM.rotaKatmanSay'dan; süre ve saatler 08.00 kalkışa göre tahmin; boyut, tarih, ziyaret prototip örneği (ekranda yazılı). */
(() => {
  const R0 = () => GM.rotaBul('istanbul-izmir');
  const durumOku = id => ({eklenen: [], mola: [], katman: ['neYenir', 'sarj', 'ibadet'], ...(GM.durum.oku(`rota-${id}`, null) || {})});
  const durumYaz = (id, d) => GM.durum.yaz(`rota-${id}`, d);
  // Kapak: varışa en yakın kapaklı durak (aynı kalkışlı rotalar aynı fotoğrafla açılmasın).
  const kapakli = r => { const l = GM.rotaDuraklari(r).filter(d => d.mekan.kapakB || d.mekan.kapak).sort((a, b) => b.km - a.km); return GM.rotaKartVeri(r, {gorsel: l[0] && (l[0].mekan.kapakB || l[0].mekan.kapak)}); };
  const MOLA = {mekan: 45, yakit: 10, ibadet: 15, dinlenme: 20, karavan: 30};
  const molaDk = k => (k.tur === 'sarj' ? (/\bAC\b/.test(k.ad) ? 100 : 26) : MOLA[k.tur] || 15);
  const saat = dk => GM.saatMetin(dk).replace(':', '.');            // uygulama metni 08.00
  const sistem = dk => GM.saatMetin(dk);                             // telefonun saati 08:00
  const tarihiDegil = k => !String(k.id).startsWith('tarihi');       // tarihi yapılar gösterilmez (Beyar 12 Kas)
  const MB = r => Math.round(r.km / 10);                             // paket boyutu tahmini (rota.js "≈ 48 MB" ile aynı kural)
  // Görünüm değişince: adreste sorgu varsa sorgusuz adrese geçilir (durum kazanır), yoksa yerinde yeniden çizilir (kaydırma korunur).
  const yenile = (ctx, adres) => (Object.keys(ctx.sorgu || {}).length ? GM.yerine(adres) : GM.tazele());

  // ---------- Plan: rotaya eklenen duraklar (rota-<id>), yoksa Dada önerisi ----------
  // Öneri: yolun ortasına en yakın yakıt molası + 300. km sonrası ilk gurme durak (Co-Pilot ve merkezle aynı kural).
  // Mola: web Güzergâh Planım "Önerilen mola" (15–90 dk) durak başına; seçilmemişse türün varsayılanı. Durum rota-<id>.molaDk {kimlik: dk}.
  let MD = {};
  const mekanDurak = d => ({tip: 'mekan', km: d.km, d: {...d, id: d.slug}, sapma: d.sapma, mola: MD[d.slug] ?? MOLA.mekan, ad: d.mekan.ad, uzak: d.uzak || 0});
  const katmanDurak = k => ({tip: 'katman', km: k.km, d: k, sapma: GM.katmanSapma(k), mola: MD[k.id] ?? molaDk(k), ad: k.ad, uzak: k.uzak || 0});
  const plan = R => {
    const s = durumOku(R.id), D = GM.rotaDuraklari(R), K = GM.rotaKatmani(R); MD = s.molaDk || {};
    // eklenen: mekân slug'ı (Keşfet) ya da katman kimliği (rota.js İhtiyaçlar kartındaki Ekle); mola: durak sheet'inden eklenen katman kimlikleri.
    let l = [...s.eklenen.map(x => D.find(d => d.slug === x)).filter(Boolean).map(mekanDurak), ...[...new Set([...s.eklenen, ...(s.mola || [])])].map(i => K.find(k => k.id === i)).filter(Boolean).map(katmanDurak)];
    const oneri = !l.length;
    if (oneri) {
      const O = GM.rotaOneri(R), yakit = K.filter(k => k.tur === 'yakit').sort((a, b) => Math.abs(a.km - R.km / 2) - Math.abs(b.km - R.km / 2))[0];
      l = [yakit && katmanDurak(yakit), (O.find(d => d.km > 300) || O.at(-1)) && mekanDurak(O.find(d => d.km > 300) || O.at(-1))].filter(Boolean);
    }
    l.sort((a, b) => a.km - b.km);
    // Zaman çizelgesi: ortalama hız rotanın kendi süresinden; sapma sürüşe, mola ayrı eklenir.
    const hiz = R.dk / R.km; let t = 480, km0 = 0;
    l = l.map(x => { const surus = Math.round((x.km - km0) * hiz + x.sapma), varis = t + surus, o = {...x, surus, surusKm: Math.round(x.km - km0), varis, cikis: varis + x.mola}; t = o.cikis; km0 = x.km; return o; });
    const son = Math.round((R.km - km0) * hiz);
    return {l, oneri, hiz, son, varis: t + son, surus: l.reduce((a, x) => a + x.surus, 0) + son, mola: l.reduce((a, x) => a + x.mola, 0), ekKm: Math.round(l.reduce((a, x) => a + x.uzak * 2, 0))};
  };
  // Plan üstünde km → saat (dk) ve saat → km (telefon senaryoları).
  const anKm = (P, km) => { let t = 480, k0 = 0; for (const x of P.l) { if (km <= x.km) return Math.round(t + (km - k0) * P.hiz); t = x.cikis; k0 = x.km; } return Math.round(t + (km - k0) * P.hiz); };
  const kmAn = (P, dk) => { let t = 480, k0 = 0; for (const x of P.l) { if (dk <= x.varis) return k0 + (dk - t) / P.hiz; if (dk <= x.cikis) return x.km; t = x.cikis; k0 = x.km; } return Math.min(P.l.length ? k0 + (dk - t) / P.hiz : (dk - 480) / P.hiz, 1e9); };
  const seritOgeleri = (R, P) => [
    {uc: true, ad: R.kalkis, alt: 'Kalkış', saat: '08.00', sonra: P.l.length ? `${GM.sure(P.l[0].surus)} sürüş · ${GM.sayi(P.l[0].surusKm)} km` : `${GM.sure(P.son)} sürüş · ${GM.sayi(R.km)} km`},
    ...P.l.map((x, i) => ({durak: {...x.d, alt: `${x.tip === 'mekan' ? 'Yemek molası' : `${GM.KATMAN_AD[x.d.tur]} molası`} · ${GM.sure(x.mola)}`}, sira: i + 1, sapma: {dk: x.sapma, km: x.km}, saat: `${saat(x.varis)} – ${saat(x.cikis)}`,
      sonra: i < P.l.length - 1 ? `${GM.sure(P.l[i + 1].surus)} sürüş · ${GM.sayi(P.l[i + 1].surusKm)} km` : `${GM.sure(P.son)} sürüş · ${GM.sayi(Math.round(R.km - x.km))} km`})),
    {uc: true, ad: R.varis, alt: 'Varış', saat: `~${saat(P.varis)}`}];
  // Kayıtlı güzergâhlar (web Güzergâhlarım): kaydedilenler + prototip örneği üç rota; favori, yolculuk tarihi ve ziyaret durumdan (rota-favori, rota-tarih), ziyaret sayısı seyahat günlüğünden.
  const kayitlilar = GM.rotaKayitlilar, favoriler = GM.rotaFavoriler, tarihler = GM.rotaTarihler;   // ortak kaynak (gm-k-route.js)
  const tarihMetin = t => (t ? new Date(`${t}T12:00:00`).toLocaleDateString('tr-TR', {day: 'numeric', month: 'short', year: 'numeric'}) : '');
  const paketler = () => GM.rotaPaketler();                         // ortak kaynak (gm-k-route.js): aktif harita, Kaydet ve bu ekranlar aynı listeyi okur

  // ---------- (g) Rota özeti ve aktarma ----------
  GM.ekran('rota-ozet', {
    tur: 'alt', baslik: 'Rota özeti', ust: '#/rota',
    ustBar: () => ({sag: [{ikon: 'paylas', etiket: 'Paylaş', veri: {eylem: 'oz-paylas'}}]}),
    ciz: ctx => {
      const R = GM.rotaBul(ctx.param.id) || R0(), P = plan(R), indi = paketler().some(p => p.id === R.id), kayitli = kayitlilar().includes(R.id), g = GUNLUK.find(x => x.id === R.id), ek = P.surus + P.mola - R.dk;
      const iller = (R.iller || []).map(i => ({...i, k: (GMV.ilKimlik || []).find(x => x.ad === i.ad)})).filter(i => i.k);
      const harita = GM.harita({ad: 'oz-h', yukseklik: '200px', etkilesim: false, kontroller: false, rota: {cizgi: R.cizgi}, dolgu: {top: 28, right: 28, bottom: 28, left: 28},
        pinler: [{lng: R.cizgi[0][0], lat: R.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic'}, {lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis'}, ...P.l.map((x, i) => ({lng: x.d.lng, lat: x.d.lat, sira: i + 1}))]});
      return GM.bolumler([
        {html: GM.yigin([GM.rehberManset({sinif: 'is-ic', etiket: R.tema || 'Dada Route', baslik: `${R.kalkis} → ${R.varis}`, ozet: [`Kalkış 08.00`, `Varış ~${saat(P.varis)}`, `${P.l.length} durak`, `${GM.rotaSayi(R).yolUstu} yol üstü mekân`]}), harita,
          // Web Güzergâh Planım toplamı: normal yolculuk · duraklarla birlikte (eklenen süre ve mesafe alt satırda).
          GM.rotaMetrik([{etiket: 'Mesafe', deger: GM.sayi(Math.round(R.km)), birim: 'km'}, {etiket: 'Normal yolculuk', deger: GM.sure(R.dk)}, {etiket: 'Duraklarla', deger: GM.sure(P.surus + P.mola), alt: `+${GM.sure(ek)} · +${P.ekKm} km`}])], 16)},
        {baslik: 'Durak durak', eylem: {metin: 'Düzenle', git: `#/rota/${R.id}`}, html: GM.yigin([GM.rotaSerit(seritOgeleri(R, P)),
          GM.bant({ton: 'bilgi', metin: `${P.oneri ? 'Rotaya henüz durak eklemedin; özet **Dada’nın önerdiği** duraklarla hazırlandı. ' : ''}Saatler 08.00 kalkışa göre tahmindir; çalışma saatleri doğrulanmadı.`, eylem: {metin: 'Molalar', veri: {eylem: 'oz-mola'}}})], 16)},
        iller.length ? {baslik: 'Geçtiğin iller', html: GM.yatay(iller.map(i => GM.ilKart({...i.k, bolge: i.km ? `${i.km}. km` : 'Kalkış', tescilli: i.k.tescilli.slice(0, 3)}, {sinif: 'is-kompakt'})))} : null,
        {baslik: 'Aktar ve indir', html: GM.yigin([GM.satirlar([{ikon: 'navigasyon', baslik: 'Navigasyona aktar', alt: 'Google, Apple, Yandex ya da GPX dosyası', veri: {eylem: 'oz-aktar'}}]),
          GM.toggle({ad: 'oz-cevrimdisi', ikon: 'cevrimdisi', etiket: 'Çevrimdışı indir', alt: `Harita, pinler, adres ve telefonlar · ≈ ${MB(R)} MB`, secili: indi})], 8)},
        // Web Güzergâhlarım kart eylemleri (favori, yolculuk tarihi, ziyaretler, kopyala, sil): kayıtlı rotada; Tekrar Kullan = Yola çık, Düzenle = Durak durak › Düzenle, Paylaş = üst bar.
        kayitli ? {baslik: 'Kayıtlı güzergâh', html: GM.satirlar([
          {ikon: 'favori', baslik: 'Favori', sag: GM.anahtar({ad: 'oz-favori', etiket: 'Favori', secili: favoriler().includes(R.id)})},
          {ikon: 'takvim', baslik: 'Yolculuk tarihi', deger: tarihMetin(tarihler()[R.id]) || 'Seç', ok: true, veri: {eylem: 'oz-tarih'}},
          g ? {ikon: 'ziyaret', baslik: 'Ziyaretler', deger: `${g.ziyaret}/${g.ziyaret + g.atla}`, ok: true, git: `#/rota/gunluk?id=${R.id}`} : null,
          {ikon: 'copy', baslik: 'Kopyasını oluştur', ok: true, veri: {eylem: 'oz-kopya'}},
          {ikon: 'sil', baslik: 'Güzergâhı sil', veri: {eylem: 'oz-sil'}}].filter(Boolean))} : null
      ]);
    },
    altBar: () => GM.altEylem({dugmeler: [GM.btnIkili({metin: 'Kaydet', ikon: 'kaydet', veri: {eylem: 'oz-kaydet'}}, {metin: 'Yola çık', ikon: 'navigasyon', veri: {eylem: 'oz-yola'}})]}),
    sonra: (kok, ctx) => {
      const R = GM.rotaBul(ctx.param.id) || R0(), id = R.id, aktar = () => GM.aktarSheet({rota: R, duraklar: plan(R).l});
      // Ekran kökü üst barı ve alt çubuğu da kapsar (gm-ekran); eylemler tek yerden.
      const kap = kok.closest('.gm-ekran') || kok;
      const c = [
        GM.rotaKatmanBagla(kok, R, {oku: () => durumOku(id), yaz: d => { durumYaz(id, d); GM.tazele(); }}),
        GM.eylem(kap, 'oz-aktar', aktar),
        GM.eylem(kap, 'oz-paylas', () => GM.paylas({baslik: R.ad, url: `https://dadagourmet.com/dada-route/${R.id}`})),
        GM.eylem(kap, 'oz-kaydet', () => GM.rotaKaydet(R, {cevrimdisi: true, degisti: GM.tazele})),
        // Mola süreleri (web Önerilen mola): durak seçilir, süre GM.molaSec ile; plan ve saatler yeniden hesaplanır.
        GM.eylem(kap, 'oz-mola', () => { const P = plan(R); GM.sheet({baslik: 'Mola süreleri', html: GM.satirlar(P.l.map(x => ({sol: GM.ikonKutu({ikon: x.tip === 'mekan' ? 'mekan' : x.d.tur, boyut: 'md', ton: 'notr'}), baslik: x.ad, alt: `${saat(x.varis)} varış · ${x.km}. km`, deger: GM.sure(x.mola), ok: true, veri: {eylem: 'oz-mola-sec', id: x.d.id}}))), sonra: (k, h) => GM.eylem(k, 'oz-mola-sec', el => { const x = P.l.find(y => String(y.d.id) === el.dataset.id); h.kapat(); GM.molaSec({ad: x.ad, dk: x.mola, sec: dk => { const d = durumOku(id); durumYaz(id, {...d, molaDk: {...(d.molaDk || {}), [x.d.id]: dk}}); GM.tazele(); GM.toast(`${x.ad} · mola **${GM.sure(dk)}**`, {ikon: 'saat'}); }}); })}); }),
        GM.on(kok, 'oz-favori', v => { const l = new Set(favoriler()); v ? l.add(id) : l.delete(id); GM.durum.yaz('rota-favori', [...l]); GM.toast(v ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı', {ikon: 'favori'}); }),
        GM.eylem(kap, 'oz-tarih', () => GM.sheet({baslik: 'Yolculuk tarihi', html: GM.yigin([GM.input({ad: 'oz-tarih-g', etiket: 'Tarih', tur: 'date', deger: tarihler()[id] || ''}), GM.p('Tarih verdiğin rota **Yaklaşan yolculuklar**’da görünür; sistem kendiliğinden tarih atamaz.', {ton: 'ikincil'})], 12), altBar: GM.btn({metin: 'Kaydet', tam: true, veri: {eylem: 'oz-tarih-kaydet'}}), sonra: (k, h) => GM.eylem(k, 'oz-tarih-kaydet', () => { const v = k.querySelector('input[name="oz-tarih-g"]')?.value || ''; const t = {...tarihler()}; if (v) t[id] = v; else delete t[id]; GM.durum.yaz('rota-tarih', t); h.kapat(); GM.tazele(); GM.toast(v ? `Yolculuk tarihi **${tarihMetin(v)}**` : 'Yolculuk tarihi kaldırıldı', {ikon: 'takvim'}); })})),
        GM.eylem(kap, 'oz-kopya', () => GM.toast(`**${R.ad} (kopya)** Güzergâhlarım’a eklendi`, {tur: 'basari', ikon: 'copy'})),
        GM.eylem(kap, 'oz-sil', () => GM.dialog({baslik: 'Bu güzergâh silinsin mi?', metin: `**${R.ad}** Güzergâhlarım’dan kalkar; ziyaret işaretleri de silinir.`, eylem: 'Sil', iptal: 'Vazgeç', yikici: true}).then(ok => { if (!ok) return; const l = new Set(GM.durum.oku('rota-kayitli', []) || []); l.delete(id); GM.durum.yaz('rota-kayitli', [...l]); GM.toast(`**${R.ad}** silindi`); GM.git('#/rota/rotalarim'); })),
        GM.eylem(kap, 'oz-yola', () => GM.sheet({baslik: 'Yola çık', html: GM.yigin([
          GM.eylemKart({ikon: 'sesli', baslik: 'Dada yol takibiyle', alt: 'Durak uyarıları uygulamada, navigasyon harita uygulamasında', rozet: 'Önerilen', altSatir: 2, veri: {eylem: 'yc-copilot'}}),
          GM.eylemKart({ikon: 'navigasyon', baslik: 'Yalnız harita uygulamasına aktar', alt: 'Google, Apple, Yandex ya da GPX', veri: {eylem: 'yc-aktar'}})], 12),
          sonra: (k, h) => { const a = GM.eylem(k, 'yc-copilot', () => { h.kapat(); GM.git(`#/rota/surus/${id}`); }), b = GM.eylem(k, 'yc-aktar', () => { h.kapat(); aktar(); }); return () => { a(); b(); }; }})),
        GM.on(kok, 'oz-cevrimdisi', v => {
          const l = paketler().filter(p => p.id !== id); if (v) l.unshift({id, tarih: 'Şimdi', durum: 'guncel'}); GM.durum.yaz('rota-paketler', l);
          GM.toast(v ? `**${R.ad}** indiriliyor · ${MB(R)} MB` : 'Çevrimdışı paket silindi', {ikon: 'cevrimdisi', eylem: v ? 'Paketler' : undefined, onEylem: () => GM.git('#/rota/cevrimdisi')});
        })
      ];
      return () => c.forEach(f => f());
    }
  });

  // ---------- (i) Kilit ekranı Canlı Etkinliği, Dinamik Ada, bildirimler ----------
  // Senaryolar plan üstündeki anlardır: yola çıkış (ilk izin), il girişi (il kimliği bildirimi), 12.30 yemek önerisi (şartname M1.10), 3 km kala (yaklaşma),
  // 8. saat (uzun rota Ankara–Trabzon: Canlı Etkinlik bitiş içeriği, aile F3). Sayılar plandan; "Geç" ve bildirime dokunma uygulamayı açar.
  const TEL = 'rota-telefon-gorunum';
  const SEN = {
    cikis: {ad: 'Yola çıkış', ikon: 'baslangic'}, il: {ad: 'İl girişi', ikon: 'cografi'}, yemek: {ad: '12.30 önerisi', ikon: 'mekan'},
    yaklasma: {ad: '3 km kala', ikon: 'sesli'}, sekiz: {ad: '8. saat', ikon: 'saat'}
  };
  const telGor = ctx => { const g = {senaryo: 'yaklasma', gor: 'kilit', platform: 'ios', tema: 'acik', yigin: 'acik', ...(GM.durum.oku(TEL, null) || {})}; ['senaryo', 'gor', 'platform', 'tema'].forEach(k => { if (ctx.sorgu[k]) g[k] = ctx.sorgu[k]; }); if (!SEN[g.senaryo]) g.senaryo = 'yaklasma'; return g; };
  const sahne = sen => {
    const R = sen === 'sekiz' ? GM.rotaBul('ankara-trabzon') : R0(), P = plan(R);
    const O = GM.rotaOneri(R), son = P.l.at(-1);
    let km = sen === 'cikis' ? 10 : sen === 'il' ? (R.iller.find(i => i.ad === 'Bursa')?.km || 139) : sen === 'yemek' ? kmAn(P, 750) : sen === 'sekiz' ? kmAn(P, 480 + 480) : (son ? son.km - 3 : R.km - 3);
    km = Math.max(1, Math.min(R.km - 1, km));
    const dk = anKm(P, km), sira = P.l.find(x => x.km > km), kalanKm = Math.round(R.km - km);
    const kalanDk = Math.round((R.km - km) * P.hiz) + P.l.filter(x => x.km > km).reduce((a, x) => a + x.mola + x.sapma, 0);
    const durak = sira ? {tur: sira.tip === 'mekan' ? 'mekan' : sira.d.tur, ad: sira.ad, gorsel: sira.d.mekan?.kapak, uzak: `${GM.sayi(Math.max(1, Math.round(sira.km - km)))} km`, sure: `~${GM.sure(Math.max(1, Math.round((sira.km - km) * P.hiz)))}`, sapma: sira.sapma}
      : {tur: 'varis', ad: R.varis, uzak: `${kalanKm} km`, sure: `~${GM.sure(kalanDk)}`};
    const etkinlik = {rota: {kalkis: R.kalkis, varis: R.varis}, durak, oran: km / R.km, isaretler: P.l.map(x => ({x: x.km / R.km, gecildi: x.km <= km})), kalan: `Kalan ${GM.sayi(kalanKm)} km · ${GM.sure(kalanDk)}`, varis: saat(dk + kalanDk), eylem: {kod: 'rota-gec', aria: 'Durağı geç'}, ac: `#/rota/surus/${R.id}`};
    // Bildirimler (yeniden eskiye). İl kimliği bildirimindeki ürünler GMV.ilKimlik'ten (TÜRKPATENT tescilli).
    const bursa = (GMV.ilKimlik || []).find(x => x.ad === 'Bursa'), y = bursa?.tescilli.find(x => x.tur === 'yenir'), a = bursa?.tescilli.find(x => x.tur === 'alinir');
    const ilB = {baslik: 'Bursa’ya girdin', metin: `${y?.ad}, ${a?.ad} ve ${bursa ? bursa.tescilli.length - 2 : 0} coğrafi işaretli lezzet daha. Durunca il kartını aç.`, ikon: 'cografi'};
    const yemekD = O.filter(d => d.km > kmAn(P, 750)).sort((p, q) => p.sapma - q.sapma || p.km - q.km)[0];
    const yemekB = yemekD && {baslik: 'Öğle yemeği vakti', metin: `${yemekD.mekan.ad} rotanda, ${Math.round(yemekD.km - kmAn(P, 750))} km sonra · ${yemekD.sapma <= 2 ? 'süre eklemez' : `+${yemekD.sapma} dk`}. Eklemek için dokun.`, ikon: 'mekan', gorsel: yemekD.mekan.kapak};
    const yakB = son && {baslik: `3 km sonra sağda: ${son.ad}`, metin: `Rotadan +${son.sapma} dk · ${son.d.mekan?.kategori || GM.KATMAN_AD[son.d.tur]}. Durmak ister misin?`, ikon: 'sesli', gorsel: son.d.mekan?.kapak, eylemler: ['Ekle', 'Geç']};
    const zaman = (b, t) => b && {...b, zaman: t};
    const B = {cikis: [], il: [zaman(ilB, 'şimdi')], yemek: [zaman(yemekB, 'şimdi'), zaman(ilB, saat(anKm(P, 139)))], yaklasma: [zaman(yakB, 'şimdi'), zaman(yemekB, '12.30'), zaman(ilB, saat(anKm(P, 139)))], sekiz: [{baslik: 'Canlı Etkinlik sona erdi', metin: 'Yolculuğun sürüyor; sıradaki durak ve kalan yol Dada Route’ta ve widget’ta.', zaman: 'şimdi', ikon: 'saat'}]}[sen].filter(Boolean);
    return {R, P, km, dk, etkinlik, B, bitti: sen === 'sekiz'};
  };
  GM.ekran('rota-telefon', {
    tur: 'alt', baslik: 'Kilit ekranı ve bildirimler', ust: '#/rota',
    ciz: ctx => {
      const g = telGor(ctx), s = sahne(g.senaryo), ios = g.platform === 'ios', e = s.etkinlik, sa = sistem(s.dk);
      const kart = GM.canliRotaKarti({...e, bitti: s.bitti ? {baslik: 'Yolculuk sürüyor', metin: 'Canlı Etkinlik 8 saatte biter · kalan yol uygulamada'} : null, alt: g.senaryo === 'cikis' ? GM.canliIzinSatiri({uygulama: 'Dada Gourmet'}) : ''});
      const iosB = GM.kilitBildirim({ogeler: s.B.map(b => ({baslik: b.baslik, metin: b.metin, zaman: b.zaman, ac: '#/rota/surus/istanbul-izmir'})), acik: g.yigin !== 'kapali'});
      const andB = s.B.map(b => GM.androidCanli({tur: 'bildirim', ikon: b.ikon, baslik: b.baslik, metin: b.metin, zaman: b.zaman, gorsel: b.gorsel, eylemler: b.eylemler})).join('');
      const andCanli = GM.androidCanli({tur: 'rota', ...e, eylemler: [{metin: 'Geç', kod: 'rota-gec'}, {metin: 'Navigasyonda aç', ac: `#/rota/surus/${s.R.id}`}]});
      const aks = [GM.kilitWidget({tur: 'dikdortgen', ikon: 'route', baslik: 'Dada Route', metin: e.durak.ad, alt: `${e.durak.uzak} · varış ${e.varis}`, oran: e.oran, ac: `#/rota/surus/${s.R.id}`})];
      const tarih = ios ? 'Cuma 13 Kasım' : 'Cum, 13 Kas';
      let telefon;
      if (g.gor === 'ada' && ios) {
        const ada = tur => GM.adaV2({etkinlik: 'rota', tur, ...e});
        telefon = GM.yigin([
          GM.alan({etiket: 'Kısa hal', yardim: 'Sıradaki durağın simgesi ve kalan mesafe; dokununca genişler.', html: GM.cihazKesit({platform: 'ios', tema: g.tema, duvar: 'gorsel', sinif: 'is-duvar-rota', saat: sa, ada: ada('kompakt'), etiket: `Dinamik Ada kısa hali: ${e.durak.ad}, ${e.durak.uzak}`})}),
          GM.alan({etiket: 'Geniş hal', yardim: 'Basılı tutunca: durak adı, sapma, yolculuk çubuğu ve Geç.', html: GM.cihazKesit({platform: 'ios', tema: g.tema, duvar: 'gorsel', sinif: 'is-duvar-rota', saat: sa, ada: ada('genis'), etiket: `Dinamik Ada geniş hali: ${e.durak.ad}`})}),
          GM.alan({etiket: 'İki etkinlik', yardim: 'Harita uygulamasının navigasyonu da sürerken ikisi de en küçük hale geçer; Dada’nınki yolculuk oranı halkasıdır.', html: GM.cihazKesit({platform: 'ios', tema: g.tema, duvar: 'gorsel', sinif: 'is-duvar-rota', saat: sa, ada: ada('minimal'), adaMin: GM.adaV2({etkinlik: 'rota', tur: 'minimal', baska: true}), etiket: 'Dinamik Ada, iki etkinlik: ikisi de minimal'})})], 16);
      } else if (g.gor === 'ada') {
        telefon = GM.alan({etiket: 'Telefon açıkken: durum çubuğu', yardim: 'Kalan mesafe saatin yanında çip olarak durur (Android 16 ve sonrası).', html: GM.cihazKesit({platform: 'android', tema: g.tema, duvar: 'gorsel', sinif: 'is-duvar-rota', saat: sa, durumCip: GM.androidCip({tur: 'rota', metin: e.durak.uzak}), icerik: GM.kilitAlt([andCanli]), etiket: `Durum çubuğunda ${e.durak.uzak}`})});
      } else if (ios) {
        telefon = GM.telefonCerceve({platform: 'ios', tema: g.tema, saat: sa, etkilesimli: true, duvar: 'gorsel', sinif: 'is-duvar-rota', sigdir: true, kilit: {tarih, satir: GM.kilitWidget({tur: 'satir', ikon: 'route', metin: `Varış ${e.varis}`, ac: `#/rota/surus/${s.R.id}`, aria: `Varış ${e.varis}, Yol takibinde aç`}), aksesuar: aks, acik: s.B.length > 0},
          icerik: GM.kilitAlt([kart, iosB]), etiket: `iPhone kilit ekranı, ${SEN[g.senaryo].ad}: Dada Route Canlı Etkinliği, sıradaki ${e.durak.ad} ${e.durak.uzak}${s.B.length ? `, ${s.B.length} bildirim` : ''}`});
      } else {
        telefon = GM.telefonCerceve({platform: 'android', tema: g.tema, saat: sa, etkilesimli: true, duvar: 'gorsel', sinif: 'is-duvar-rota', sigdir: true, kilit: {tarih}, durumCip: s.bitti ? '' : GM.androidCip({tur: 'rota', metin: e.durak.uzak}),
          icerik: GM.kilitAlt([s.bitti ? '' : andCanli, andB]), etiket: `Android kilit ekranı, ${SEN[g.senaryo].ad}: Dada Route canlı bildirimi${s.B.length ? ` ve ${s.B.length} bildirim` : ''}`});
      }
      const metin = {
        cikis: `**Yola çıkış.** Yol takibi ilk açıldığında iPhone **Canlı Etkinlik izni** ister; ret halinde uyarılar yalnız uygulama açıkken gelir. Kart: sıradaki durak, kalan km ve dk, kalkış–varış çubuğu.`,
        il: `**İl girişi.** Bursa sınırı geçilince il kimliği **yalnız bildirim** olarak gelir; kart araç durunca açılır. Ürünler TÜRKPATENT coğrafi işaret kayıtlarından.`,
        yemek: `**12.30 ve 19.00 önerisi.** Yemek saatinde rotanın önündeki en az saptıran Dada mekânı önerilir (şartname: akıllı bildirim).`,
        yaklasma: `**3 km kala.** Yaklaşma uyarısı sesli okunur, aynı cümle bildirimde ve yol takibinde görünür. **Geç** durağı atlar, **Ekle** rotaya alır.`,
        sekiz: `**8. saat.** iPhone bir Canlı Etkinliği en çok 8 saat günceller. Uzun rotada (Ankara–Trabzon) etkinlik **“Yolculuk sürüyor”** bitiş içeriğiyle biter, Ada’dan kalkar; kalan yol uygulamada ve widget’ta sürer. Android’de bu sınır yok.`
      }[g.senaryo];
      return GM.bolumler([
        {html: GM.yigin([GM.segment({ad: 'tel-gor', etiket: 'Görünüm', secili: g.gor, ogeler: [{ad: 'Kilit ekranı', deger: 'kilit', ikon: 'lock'}, {ad: ios ? 'Dinamik Ada' : 'Durum çubuğu', deger: 'ada', ikon: 'mobile-screen'}]}), telefon], 16)},
        {html: GM.yigin([GM.cipler({ad: 'tel-senaryo', tur: 'tek', etiket: 'An', secili: g.senaryo, ogeler: Object.entries(SEN).map(([k, x]) => ({metin: x.ad, deger: k, ikon: x.ikon}))}), GM.p(metin, {ton: 'ikincil'})], 12)},
        {html: GM.yigin([GM.alan({etiket: 'Telefon', html: GM.segment({ad: 'tel-platform', etiket: 'Telefon', secili: g.platform, ogeler: [{ad: 'iPhone', deger: 'ios'}, {ad: 'Android', deger: 'android'}]})}),
          GM.alan({etiket: 'Görünüm', html: GM.segment({ad: 'tel-tema', etiket: 'Tema', secili: g.tema, ogeler: [{ad: 'Açık', deger: 'acik', ikon: 'sun'}, {ad: 'Koyu', deger: 'koyu', ikon: 'moon'}]})})], 16)},
        {baslik: 'Kurallar', html: GM.maddeler([['route', 'Turn-by-turn yok', 'Navigasyon harita uygulamasında; Dada yalnız durakları söyler.'], ['saat', '8 saat sınırı', 'Canlı Etkinlik 8 saat güncellenir, bitiş içeriği kilit ekranında kısa süre kalır.'], ['bell', 'İzin tetikte', 'Bildirim izni ilk yaklaşma uyarısında, “Her zaman” konum izni Yol takibi ilk açıldığında istenir.'], ['sesli', 'Sesli uyarı', '3 km kala tek cümle okunur; komut dinlenmez.']])}
      ]);
    },
    sonra: (kok, ctx) => {
      const yaz = (k, v) => { GM.durum.yaz(TEL, {...telGor({sorgu: {}}), ...Object.fromEntries(Object.entries(ctx.sorgu).filter(([a]) => ['senaryo', 'gor', 'platform', 'tema'].includes(a))), [k]: v}); yenile(ctx, '#/rota/telefon'); };
      const c = ['gor', 'platform', 'tema'].map(k => GM.on(kok, `tel-${k}`, v => yaz(k, v)));
      c.push(GM.on(kok, 'tel-senaryo', v => { const x = [].concat(v)[0] || v; if (x && SEN[x]) yaz('senaryo', x); }));
      const tik = ev => {
        // Bildirim yığını: "Daha az" daraltır, yığına dokunmak açar (iOS kilit ekranı); seçim görünümde kalır.
        const yg = ev.target.closest('[data-kb-yigin]'); if (yg) { const ac = yg.getAttribute('aria-expanded') !== 'true'; GM.durum.yaz(TEL, {...telGor({sorgu: {}}), yigin: ac ? 'acik' : 'kapali'}); GM.tazele(); return; }
        const e = ev.target.closest('[data-wg-eylem],[data-wg-ac],[data-wg-izin],[data-ada]'); if (!e) return;
        if (e.dataset.wgEylem) GM.toast('Durak geçildi · **sıradaki** gösteriliyor', {eylem: 'Geri al'});
        else if (e.dataset.wgIzin) GM.toast(e.dataset.wgIzin === 'ver' ? 'Canlı Etkinlik açıldı' : 'Uyarılar yalnız uygulama açıkken gelir');
        else if (e.dataset.ada) GM.toast(e.dataset.ada === 'kompakt' ? 'Ada küçüldü' : 'Basılı tutunca **geniş hal** açılır');
        else if (e.dataset.wgAc) GM.git(e.dataset.wgAc);
      };
      kok.addEventListener('click', tik); c.push(() => kok.removeEventListener('click', tik));
      c.push(GM.telefonSigdir(kok));
      return () => c.forEach(f => f());
    }
  });

  // ---------- (j) CarPlay / Android Auto ----------
  // POI şablonu: sıradaki en çok 12 durak (gurme + yol katmanları, km sırasıyla), harita; seçince "Yol tarifi / Geç". Konum: Bursa çıkışı (rotanın 140. km'si).
  const ARAC = 'rota-arac-gorunum';
  GM.ekran('rota-arac', {
    tur: 'alt', baslik: 'Araç ekranı', ust: '#/rota',
    ciz: ctx => {
      const g = {platform: 'carplay', gor: 'liste', ...(GM.durum.oku(ARAC, null) || {}), ...Object.fromEntries(['platform', 'gor'].filter(k => ctx.sorgu[k]).map(k => [k, ctx.sorgu[k]]))};
      const R = R0(), P = plan(R), km = 140;
      const l = [...GM.rotaOneri(R).map(d => ({tur: 'mekan', ad: d.mekan.ad, alt: [d.mekan.kategori, d.mekan.ilce].filter(Boolean).join(' · '), km: d.km, sapma: d.sapma, lng: d.lng, lat: d.lat})),
        ...GM.rotaKatmani(R).filter(tarihiDegil).map(k => ({tur: k.tur, ad: k.ad, alt: [GM.KATMAN_AD[k.tur], k.alt !== k.ad ? k.alt : ''].filter(Boolean).join(' · '), km: k.km, sapma: GM.katmanSapma(k), lng: k.lng, lat: k.lat}))]
        .filter(x => x.km > km + 8).sort((a, b) => a.km - b.km).slice(0, 12).map(x => ({...x, uzak: `${GM.sayi(Math.round(x.km - km))} km`}));
      const kumul = [0]; R.cizgi.forEach((p, n) => { if (n) kumul.push(kumul[n - 1] + GM.km(R.cizgi[n - 1], p)); });
      const i = Math.max(1, kumul.findIndex(k => k >= km)), secili = Math.max(0, l.findIndex(x => x.tur === 'mekan'));
      const ilk = l.find(x => x.tur === 'mekan') || l[0];
      const ekran = GM.aracEkrani({platform: g.platform, ad: `arac-${g.platform}-${g.gor}`, saat: sistem(anKm(P, km)), baslik: 'Rotandaki duraklar', ogeler: l, secili: g.gor === 'durak' ? secili : null,
        uyari: g.gor === 'uyari' ? {baslik: `3 km sonra sağda: ${ilk.ad}`, metin: `${ilk.alt} · ${ilk.sapma <= 2 ? 'yol üstü' : `+${ilk.sapma} dk`}`} : null,
        harita: {cizgi: R.cizgi, gecilen: R.cizgi.slice(0, i + 1), konum: R.cizgi[i], yon: 200},
        etiket: `${g.platform === 'carplay' ? 'CarPlay' : 'Android Auto'} ekranı: ${g.gor === 'uyari' ? `yaklaşma uyarısı, ${ilk.ad}` : g.gor === 'durak' ? `seçili durak ${l[secili]?.ad}, Yol tarifi ve Geç` : `rotandaki ${l.length} durak listesi ve harita`}`});
      return GM.bolumler([
        {html: GM.yigin([ekran, GM.segment({ad: 'arac-gor', etiket: 'Ekran', secili: g.gor, ogeler: [{ad: 'Liste', deger: 'liste'}, {ad: 'Durak', deger: 'durak'}, {ad: 'Uyarı', deger: 'uyari'}]}),
          GM.p({liste: '**Rotandaki duraklar:** sıradaki en çok 12 durak, rotadan sapma süresiyle; harita aynı sırayı numaralı gösterir.', durak: '**İkinci adım:** durak seçilince yalnız iki düğme kalır. **Yol tarifi** harita uygulamasına devreder, **Geç** listeden düşürür.', uyari: '**Yaklaşma uyarısı:** 3 km kala sesli okunur; ekranda tek cümle ve iki düğme. Liste kapanmaz, uyarı üstte durur.'}[g.gor], {ton: 'ikincil'})], 16)},
        {html: GM.alan({etiket: 'Araç', html: GM.segment({ad: 'arac-platform', etiket: 'Araç', secili: g.platform, ogeler: [{ad: 'CarPlay', deger: 'carplay', ikon: 'carplay'}, {ad: 'Android Auto', deger: 'auto', ikon: 'arac'}]})})},
        {baslik: 'Araç ekranı kuralları', html: GM.maddeler([['list-ol', 'En çok 12 durak', 'Nokta şablonu: harita ve kısa liste; sıra km’ye göre.'], ['ban', 'Fotoğraf, arama ve katman yok', 'Sürücünün gözü yolda kalır; seçim telefondan yapılır.'], ['route', 'En çok iki adım', 'Liste → durak; yol tarifi harita uygulamasına devredilir.'], ['sesli', 'Uyarı sesli', '3 km kala tek cümle; dokunmadan geçilebilir.']])},
        {html: GM.bant({ton: 'uyari', baslik: 'Yetki gerekiyor', metin: 'CarPlay ve Android Auto yalnız onaylı uygulama kategorilerine açılır; Dada Route’un hangi kategoride onay alacağı belli değil. **Yetki gelmezse:** rota çok duraklı olarak harita uygulamasına aktarılır, durak uyarıları bildirim ve sesli uyarıyla gelir.'})}
      ]);
    },
    sonra: (kok, ctx) => {
      const yaz = (k, v) => { GM.durum.yaz(ARAC, {platform: 'carplay', gor: 'liste', ...(GM.durum.oku(ARAC, null) || {}), ...Object.fromEntries(['platform', 'gor'].filter(a => ctx.sorgu[a]).map(a => [a, ctx.sorgu[a]])), [k]: v}); yenile(ctx, '#/rota/arac'); };
      const c = [GM.on(kok, 'arac-gor', v => yaz('gor', v)), GM.on(kok, 'arac-platform', v => yaz('platform', v))];
      return () => c.forEach(f => f());
    }
  });

  // ---------- (k) Çevrimdışı paket yönetimi ----------
  GM.ekran('rota-cevrimdisi', {
    tur: 'alt', baslik: 'Çevrimdışı rotalar', ust: '#/rota',
    bos: {ikon: 'cevrimdisi', baslik: 'Henüz indirilen rota yok', metin: 'Rota özetinde **Çevrimdışı indir**’i aç; harita, duraklar, adres ve telefonlar internet çekmeyen yolda da açılır.', eylem: {metin: 'Rotalarıma git', git: '#/rota/rotalarim'}},
    ciz: () => {
      const L = paketler().map(p => ({...p, r: GM.rotaBul(p.id)})).filter(p => p.r), iniyor = GM.durum.oku('rota-paket-iniyor', 'istanbul-ankara'), I = iniyor && GM.rotaBul(iniyor);
      const pin = r => GM.rotaOneri(r).length + GM.rotaKatmani(r).length;
      const top = L.reduce((t, p) => t + MB(p.r), 0), kayitli = ['ankara-antalya', 'ankara-trabzon'].map(GM.rotaBul).filter(r => r && !L.some(p => p.id === r.id) && r.id !== iniyor);
      if (!L.length && !I) return GM.bos({tam: true, ikon: 'cevrimdisi', baslik: 'Henüz indirilen rota yok', metin: 'Rota özetinde **Çevrimdışı indir**’i aç; harita, duraklar, adres ve telefonlar internet çekmeyen yolda da açılır.', eylem: {metin: 'Rotalarıma git', git: '#/rota/rotalarim'}});
      const R = L[0]?.r || R0();
      return GM.bolumler([
        {html: GM.depolama({parcalar: [{ad: 'Harita karoları', mb: Math.round(top * .8), ton: 'karo'}, {ad: 'Duraklar, adres ve telefonlar', mb: top - Math.round(top * .8), ton: 'rota'}], alt: 'Dada Gourmet · cihazda 23,4 GB boş', olcek: top})},
        I ? {baslik: 'İndiriliyor', html: GM.paketSatir({rota: I, durum: 'iniyor', oran: .62, inen: `${Math.round(MB(I) * .62)} MB`, boyut: `${MB(I)} MB`, pinSayi: pin(I)})} : null,
        L.length ? {baslik: `İndirilen rotalar · ${L.length}`, html: GM.yigin([`${L.map(p => GM.paketSatir({rota: p.r, durum: p.durum, boyut: `${MB(p.r)} MB`, tarih: p.tarih, pinSayi: pin(p.r)})).join('')}`, kayitli.length ? GM.btn({metin: `Kayıtlı ${kayitli.length} rotamı indir`, ikon: 'cevrimdisi', tur: 'secondary', tam: true, veri: {eylem: 'pk-toplu'}}) : ''], 8)} : null,
        {baslik: 'Bağlantı yokken', html: GM.yigin([GM.harita({ad: 'cd-h', yukseklik: '220px', cevrimdisi: true, etkilesim: false, kontroller: false, dolgu: {top: 64, right: 32, bottom: 28, left: 32}, rota: {cizgi: R.cizgi}, pinler: [{lng: R.cizgi[0][0], lat: R.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic'}, {lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis'}, ...GM.rotaOneri(R).slice(-4).map(d => ({lng: d.lng, lat: d.lat, tur: 'mekan'}))]}),
          GM.p(`**${R.ad}** paketi cihazda, son eşitleme ${L[0]?.tarih || 'şimdi'}. Harita, pinler, adres ve telefonlar cihazdan açılır. **Eksik olan:** anlık açık/kapalı durumu ve yeni yorumlar; bağlantı gelince güncellenir.`, {ton: 'ikincil'})], 12)},
        {baslik: 'İndirme', html: GM.yigin([GM.toggle({ad: 'pk-wifi', ikon: 'wifi', etiket: 'Yalnız Wi-Fi ile indir', alt: 'Mobil veriyle büyük paket inmez', secili: GM.durum.oku('rota-paket-wifi', true)}), GM.toggle({ad: 'pk-oto', ikon: 'yenile', etiket: 'Kayıtlı rotaları güncel tut', alt: 'Değişen duraklar Wi-Fi’da arka planda iner', secili: GM.durum.oku('rota-paket-oto', false)}),
          GM.bilgi({metin: 'Paket boyutu rota uzunluğuna göre değişir; çoğunu harita karoları oluşturur.'})], 8)}
      ]);
    },
    sonra: kok => {
      const yaz = l => { GM.durum.yaz('rota-paketler', l); GM.tazele(); };
      const c = [
        GM.eylem(kok, 'pk-sil', el => { const r = GM.rotaBul(el.dataset.id); GM.dialog({baslik: 'Paket silinsin mi?', metin: `**${r.ad}** cihazdan silinir (${MB(r)} MB). Rota kayıtlı kalır; istediğinde yeniden indirirsin.`, eylem: 'Sil', iptal: 'Vazgeç', yikici: true}).then(ok => { if (!ok) return; const once = paketler(); yaz(once.filter(p => p.id !== r.id)); GM.toast(`**${r.ad}** paketi silindi`, {eylem: 'Geri al', onEylem: () => yaz(once)}); }); }),
        GM.eylem(kok, 'pk-guncelle', el => { yaz(paketler().map(p => (p.id === el.dataset.id ? {...p, durum: 'guncel', tarih: 'Şimdi'} : p))); GM.toast('Paket güncellendi · **değişen 3 durak** indi', {tur: 'basari', ikon: 'yenile'}); }),
        GM.eylem(kok, 'pk-durdur', el => { const r = GM.rotaBul(el.dataset.id); GM.durum.yaz('rota-paket-iniyor', ''); GM.tazele(); GM.toast(`**${r.ad}** indirmesi durduruldu`, {eylem: 'Geri al', onEylem: () => { GM.durum.yaz('rota-paket-iniyor', r.id); GM.tazele(); }}); }),
        GM.eylem(kok, 'pk-toplu', () => GM.toast('Kayıtlı rotaların **Wi-Fi’da** sırayla iner', {ikon: 'cevrimdisi'})),
        GM.on(kok, 'pk-wifi', v => GM.durum.yaz('rota-paket-wifi', !!v)), GM.on(kok, 'pk-oto', v => GM.durum.yaz('rota-paket-oto', !!v))
      ];
      return () => c.forEach(f => f());
    }
  });

  // ---------- (l) Seyahat günlüğü ----------
  // Tamamlanan rotalar prototip örneğidir (tarih, ziyaret edilen ve atlanan duraklar); puan ve yorum yazılmaz, yalnız "Değerlendir" eylemi.
  const GUNLUK = GM.ROTA_GUNLUK;                                   // ortak kaynak (gm-k-route.js): #/rota "Rotaların" şeridi de okur
  // Duraklar: şehirden çıkarken ilk yol üstü mekân, varışa yakın biri (atlanan) ve son mekân; km sırasıyla.
  const yolculuk = g => { const R = GM.rotaBul(g.id), O = GM.rotaOneri(R).filter(d => d.uzak <= 2), a = O.find(d => d.km >= 10) || O[0], z = O.at(-1), m = O.filter(d => d !== a && d !== z).at(-1);
    const sec = [a, m, z].filter((x, i, l) => x && l.indexOf(x) === i).slice(0, g.ziyaret + g.atla).sort((p, q) => p.km - q.km); return {...g, R, D: sec.map((d, i) => ({d, ziyaret: i !== 1 || !g.atla}))}; };
  GM.ekran('rota-gunluk', {
    tur: 'alt', baslik: ctx => (ctx.sorgu.id ? 'Yolculuk' : 'Seyahat günlüğü'), ust: '#/rota',
    cekYenile: () => new Promise(r => setTimeout(r, GM.TK.motion.reveal * 2)),
    ciz: ctx => {
      const Y = GUNLUK.map(yolculuk).filter(y => y.R);
      const y = ctx.sorgu.id && Y.find(x => x.id === ctx.sorgu.id);
      if (y) {
        const R = y.R, hiz = R.dk / R.km;
        let t = 9 * 60 + 15; const ogeler = [{saat: saat(t), baslik: `${R.kalkis} · kalkış`, hal: 'tamam', ikon: 'baslangic'}];
        y.D.forEach(({d, ziyaret: z}, i) => { t += Math.round((d.km - (y.D[i - 1]?.d.km || 0)) * hiz); ogeler.push({saat: saat(t), baslik: d.mekan.ad, hal: z ? 'tamam' : 'soluk', metin: `${d.mekan.kategori} · ${d.mekan.ilce} · ${d.km}. km`, rozetler: [z ? {metin: 'Ziyaret edildi', ton: 'basari', ikon: 'onay'} : {metin: 'Atlandı', ton: 'notr', ikon: 'forward'}], eylemler: [z ? {metin: 'Değerlendir', ikon: 'yildiz', veri: {eylem: 'gn-deger', id: d.slug}} : {metin: 'Ziyaret ettim', ikon: 'ziyaret', veri: {eylem: 'gn-ziyaret', id: d.slug}}]}); if (z) t += 50; });
        t += Math.round((R.km - (y.D.at(-1)?.d.km || 0)) * hiz); ogeler.push({saat: saat(t), baslik: `${R.varis} · varış`, hal: 'tamam', ikon: 'varis'});
        const n = y.D.filter(x => x.ziyaret).length;
        return GM.bolumler([
          {html: GM.yigin([GM.rehberManset({sinif: 'is-ic', etiket: `Tamamlandı · ${y.tarih}`, baslik: R.ad, ozet: [`${GM.sayi(R.km)} km`, `${(R.iller || []).length || 1} il`, `${n}/${y.D.length} durak`]}),
            GM.harita({ad: 'gn-h', yukseklik: '220px', etkilesim: false, kontroller: false, rota: {cizgi: R.cizgi}, dolgu: {top: 28, right: 28, bottom: 28, left: 28}, pinler: [{lng: R.cizgi[0][0], lat: R.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic'}, {lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis'}, ...y.D.map(({d, ziyaret: z}, i) => ({lng: d.lng, lat: d.lat, sira: i + 1, soluk: !z}))]}),
            GM.ozetSerit([{ikon: 'rota', etiket: 'Mesafe', deger: GM.sayi(R.km), birim: 'km'}, {ikon: 'saat', etiket: 'Yolda', deger: GM.sure(t - 555)}, {ikon: 'ziyaret', etiket: 'Ziyaret', deger: `${n}/${y.D.length}`}])], 16)},
          {baslik: 'Durak durak', html: GM.zamanCizelge({etiket: 'Yolculuğun zaman çizelgesi', ogeler})},
          {html: GM.yigin([GM.bant({ton: 'bilgi', ikon: 'puanDada', baslik: 'Dada Puan', metin: 'Ziyaret puan vermez; **fotoğraflı değerlendirme** onaylanınca +15 Dada Puan kazanırsın.'})], 12)}
        ]);
      }
      const iller = [...new Set(Y.flatMap(x => (x.R.iller || []).map(i => i.ad)))], kimlik = iller.map(a => (GMV.ilKimlik || []).find(k => k.ad === a)).filter(Boolean);
      const ilkTarih = a => Y.slice().reverse().find(x => (x.R.iller || []).some(i => i.ad === a))?.tarih.split(' ').slice(0, 2).join(' ');
      return GM.bolumler([
        {html: GM.pasaport({yil: '2026', sayilar: [{deger: GM.sayi(Y.reduce((s, x) => s + x.R.km, 0)), etiket: 'km yol'}, {deger: String(iller.length), etiket: 'il'}, {deger: String(kimlik.reduce((s, k) => s + k.tescilli.length, 0)), etiket: 'coğrafi işaretli lezzet'}, {deger: String(Y.reduce((s, x) => s + x.D.filter(d => d.ziyaret).length, 0)), etiket: 'ziyaret ettiğin durak'}],
          iller: iller.map(a => ({ad: a, tarih: ilkTarih(a)})), not: 'Coğrafi işaret sayısı geçtiğin illerin TÜRKPATENT kayıtlarıdır.'})},
        {baslik: 'Tamamlanan rotalar', html: GM.satirlar(Y.map(x => GM.rotaKart(GM.rotaKartVeri(x.R, {etiket: `${x.tarih} · ${x.D.filter(d => d.ziyaret).length}/${x.D.length} ziyaret`, durak: x.D.length}), {tur: 'satir', git: `#/rota/gunluk?id=${x.id}`})))}
      ]);
    },
    altBar: ctx => (ctx.sorgu.id ? GM.altEylem({dugmeler: [{metin: 'Bu rotayı tekrar planla', ikon: 'rota', git: `#/rota/ozet/${ctx.sorgu.id}`, tam: true}]}) : ''),
    sonra: kok => {
      const c = [
        GM.eylem(kok, 'gn-deger', el => { const m = GM.mekan(el.dataset.id); if (m) GM.degerlendirAkis(m, {}); }),
        GM.eylem(kok, 'gn-ziyaret', el => { const m = GM.mekan(el.dataset.id); if (m) GM.ziyaretAkis(m, {degisti: () => GM.toast(`**${m.ad}** ziyaret edildi olarak işaretlendi`, {tur: 'basari'})}); })
      ];
      return () => c.forEach(f => f());
    }
  });

  // ---------- Rotalarım (kayıtlı + webden gelen) ----------
  GM.ekran('rota-rotalarim', {
    tur: 'alt', baslik: 'Rotalarım', ust: '#/rota',
    // Çekip yenile: kayıtlı ve webden gelen rotalar hesapla eşitlenir (mekanlar.js kalıbı; bitişte kabuk "Güncellendi" bildirimini verir, ikinci toast yok).
    cekYenile: () => new Promise(r => setTimeout(r, GM.TK.motion.reveal * 2)),
    bos: {ikon: 'rota', baslik: 'Henüz kayıtlı rotan yok', metin: 'Planladığın rotayı **Kaydet** ile buraya al; webde çizdiğin rotalar da burada görünür.', eylem: {metin: 'Rota planla', git: '#/rota/planla'}},
    ciz: () => {
      // Web §12 dört kategori: Son kullanılanlar · Favoriler · Yaklaşan yolculuklar (tarih verilmiş, geçmemiş) · Tamamlanan rotalar (eklenen durakların hepsi ziyaret edilmiş).
      const paket = new Set(paketler().map(p => p.id)), tum = kayitlilar().map(GM.rotaBul).filter(Boolean), kat = GM.durum.oku('rota-kayit-kat', 'son'), bugun = GM.bugunIso?.() || '2026-11-13';
      const fav = favoriler(), tar = tarihler(), bitti = id => { const g = GUNLUK.find(x => x.id === id); return !!g && !g.atla; };
      const KAT = [{deger: 'son', metin: 'Son kullanılanlar', f: () => true}, {deger: 'fav', metin: 'Favoriler', f: r => fav.includes(r.id)}, {deger: 'yakin', metin: 'Yaklaşan yolculuklar', f: r => !!tar[r.id] && tar[r.id] >= bugun}, {deger: 'bitti', metin: 'Tamamlanan rotalar', f: r => bitti(r.id)}];
      const kayit = tum.filter((KAT.find(k => k.deger === kat) || KAT[0]).f);
      const ilerleme = r => { const g = GUNLUK.find(x => x.id === r.id); return g ? {n: g.ziyaret, toplam: g.ziyaret + g.atla} : undefined; };
      const etiket = r => { const g = ilerleme(r); return [fav.includes(r.id) ? 'Favori' : 'Kayıtlı', tar[r.id] ? tarihMetin(tar[r.id]) : '', paket.has(r.id) ? 'çevrimdışı' : '', g ? `${g.n}/${g.toplam} ziyaret` : ''].filter(Boolean).join(' · '); };
      return GM.bolumler([
        GM.uye() ? null : {html: GM.bant({ton: 'bilgi', baslik: 'Güzergâhların hesabına bağlı', metin: 'Misafir olarak kurduğun rota **yalnız bu cihazda** saklanır. Her cihazdan açmak ve ziyaretlerini işaretlemek için giriş yap.', eylem: {metin: 'Giriş yap', veri: {eylem: 'rr-giris'}}})},
        {baslik: 'Webden gelen', html: GM.yigin([(W => (W ? GM.webdenRota({ust: `Webden gönderildi · ${W.zaman}`, ad: W.ad, alt: W.alt, git: `#/rota/web/${W.id}`}) : ''))(GM.rotaWebden()), GM.p('Webde **Dada Route**’ta çizdiğin rota, aynı hesapla açtığında burada belirir.', {ton: 'ikincil', meta: true})], 12)},
        {baslik: `Kaydettiklerin · ${tum.length}`, html: GM.yigin([GM.cipler({ad: 'rr-kat', tur: 'tek', etiket: 'Kategori', secili: kat, ogeler: KAT.map(k => ({deger: k.deger, metin: k.metin, sayi: tum.filter(k.f).length || undefined}))}),
          kayit.length ? GM.satirlar(kayit.map(r => GM.rotaKart(GM.rotaKartVeri(r, {etiket: etiket(r)}), {tur: 'satir', git: `#/rota/ozet/${r.id}`}))) : GM.bos({ikon: 'rota', baslik: 'Bu kategoride güzergâh yok', metin: kat === 'yakin' ? 'Rota özetinde **Yolculuk tarihi** ver; yaklaşan yolculuklar burada toplanır.' : 'Başka bir kategoriye bak.'})], 12)}
      ]);
    },
    altBar: () => GM.altEylem({dugmeler: [{metin: 'Yeni rota planla', ikon: 'rota', git: '#/rota/planla', tam: true}]}),
    sonra: kok => { const c = [GM.on(kok, 'rr-kat', v => { GM.durum.yaz('rota-kayit-kat', [].concat(v)[0] || 'son'); GM.tazele(); }), GM.eylem(kok, 'rr-giris', () => GM.uyeDuvar({baslik: 'Rotanı kaybetme.', metin: 'Güzergâhlarını hesabına bağla; her cihazdan aç, ziyaretlerini işaretle.'}))]; return () => c.forEach(f => f()); }
  });

  // ---------- Hazır rotalar (temalara göre) ----------
  // Kaynak: panelin 5 TR pilot güzergâhı + gömülü Ankara–Trabzon (web §3.3); Paris–Lyon panelde yok. Tema rotanın kendi uzunluğundan ve kıyısından.
  const TEMA = [{deger: 'tumu', metin: 'Tümü'}, {deger: 'uzun', metin: 'Uzun yol', ikon: 'rota'}, {deger: 'kisa', metin: 'Kısa kaçamak', ikon: 'arac'}, {deger: 'sahil', metin: 'Sahil', ikon: 'umbrella-beach'}];
  const temaUy = (r, t) => t === 'tumu' || (t === 'uzun' && r.km > 300) || (t === 'kisa' && r.km <= 200) || (t === 'sahil' && /Ege|Sahil|Akdeniz|Karadeniz/.test(r.tema || ''));
  const hazirListe = t => ['istanbul-izmir', 'ankara-antalya', 'istanbul-bursa', 'izmir-cesme', 'ankara-trabzon', 'istanbul-ankara'].map(GM.rotaBul).filter(r => r && temaUy(r, t));
  GM.ekran('rota-hazir', {
    tur: 'alt', baslik: 'Hazır rotalar', ust: '#/rota',
    cekYenile: () => new Promise(r => setTimeout(r, GM.TK.motion.reveal * 2)),
    ciz: () => {
      const t = GM.durum.oku('rota-hazir-tema', 'tumu'), l = hazirListe(t);
      return GM.bolumler([
        {html: GM.yigin([GM.rehberManset({sinif: 'is-ic', etiket: 'Dada Route seçkisi', baslik: 'Yola lezzetle çık', metin: 'Durak, mola ve **il lezzetleri** hazır.'}),
          GM.cipler({ad: 'hazir-tema', tur: 'tek', etiket: 'Tema', secili: t, ogeler: TEMA})], 12)},
        {html: GM.sonucYuva(GM.yigin(l.map(r => GM.rotaKart(kapakli(r), {tur: 'genis', git: `#/rota/ozet/${r.id}`})), 16))},
        {html: GM.bilgi({metin: 'Editoryal rotalar (şehir rotası, tema ve mevsim, etkinlik) panelde yayınlandıkça burada temalarıyla listelenir.'})}
      ]);
    },
    sonra: kok => GM.on(kok, 'hazir-tema', v => { const x = [].concat(v)[0] || 'tumu'; GM.durum.yaz('rota-hazir-tema', x); const y = kok.querySelector('[data-kl-sonuc]'); if (y) y.innerHTML = GM.yigin(hazirListe(x).map(r => GM.rotaKart(kapakli(r), {tur: 'genis', git: `#/rota/ozet/${r.id}`})), 16); })
  });
})();
