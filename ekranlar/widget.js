/* Widget'lar · iOS ve Android (#/widget/yuzey; karar sayfası "Widget’lar" kaydı: telefon üstte, seçenekler altında). Araştırma: docs/WIDGET-ARASTIRMA.md (§1 platform, §4 G1–G11, §5 yönler, §6 kaçınılacaklar).
   Sorgu: yon a|b|c · platform ios|android · yuzey ana|kilit|standby|canli · boy kucuk|orta|buyuk · saat aksam|sabah|ogle|sonra (yalnız yön B) · tema acik|koyu|renkli|seffaf
          · durum dolu|bos|giris|cevrimdisi · konum tahmini|kesin. İlk değer varsayılan.
   gorunum (yalnız yuzey=ana) ana|tekil · wg durak|yolculuk|rotalar (A) · sofra|masam|takvim (B) · lezzet|defter|kaydedilen (C); yönle uyuşmayan wg → yönün ilk widget'ı (adreste yon yoksa wg yönü belirler).
   tekil: iOS "Widget Ekle" / Android widget seçici önizlemesi (bulanık duvar kâğıdı, tek widget seçili boyda, ad, açıklama, boy noktaları); ana: o widget gerçek ızgarada, diğer ikisi ikincil.
   Sayfa TEK telefon ekranıdır: 390×844 (StandBy 844×390 yatay sayfa). Stil ve parçalar kanonda: kanon/gm-cihaz.js "Widget yüzeyi (Görev 9)" ve rota bloğu (GM.rotaIlerleme ortak yolculuk çubuğu).
   boy: ana ekranda yönün baş widget'ının boyu (iOS 2×2 / 4×2 / 4×4 gerçek ızgara, boşluk öteki widget ve simgelerle dolu).
   yuzey=canli'de boy sunumu seçer: küçük = kilit ekranı (Canlı Etkinlik kartı / Android bildirim perdesi), orta = Dinamik Ada kısa hali (Android: kilit ekranı + durum çipi),
   büyük = Dinamik Ada geniş hali (Android 15 ve altı yedeği). Yön C'de Canlı Etkinlik yok (editoryal içerik uygun değil): yerine Lezzet Takvimi'nin "3 gün önce" hatırlatma bildirimi.
   Yön B'de Android Live Update yaklaşan rezervasyon için açılmaz (Google kuralı): önce sıradan bildirim, "Yola çıktım" deyince Live Update.
   Prototip örneği (kayıtta yazılı): rezervasyon kaydı yoksa bugün 20.00 Mikla (2 kişi, onaylandı); yolculuk İstanbul → İzmir, sıradaki Dada durağı LAST (İzmir, ≈242 km), önce Total yakıt (3,2 km; veride 150–300. km arası Dada durağı yok);
   Dada Puan 580 + 40 bekleyen (rütbe eşikleri web prototipinden); kaydedilenler boşsa yakındaki örnekler. */
(() => {
  const KONUM = [29.0275, 40.9903], AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const SECENEK = {yon: ['a', 'b', 'c'], platform: ['ios', 'android'], yuzey: ['ana', 'kilit', 'standby', 'canli'], gorunum: ['ana', 'tekil'], wg: ['durak', 'yolculuk', 'rotalar', 'sofra', 'masam', 'takvim', 'lezzet', 'defter', 'kaydedilen'], boy: ['kucuk', 'orta', 'buyuk'], saat: ['aksam', 'sabah', 'ogle', 'sonra'],
    tema: ['acik', 'koyu', 'renkli', 'seffaf'], durum: ['dolu', 'bos', 'giris', 'cevrimdisi'], konum: ['tahmini', 'kesin']};
  const ESKI = {1: 'a', 2: 'b', 3: 'c', 4: 'a'};
  const sorgu = no => {
    const q = new URLSearchParams(location.hash.split('?')[1] || ''), s = {};
    Object.entries(SECENEK).forEach(([k, l]) => { s[k] = l.includes(q.get(k)) ? q.get(k) : l[0]; });
    if (ESKI[no] && !q.get('yon')) s.yon = ESKI[no];
    if (no === '4' && !q.get('platform')) s.platform = 'android';
    if (q.get('wg') && !q.get('yon')) s.yon = Object.keys(KATALOG).find(y => KATALOG[y].some(k => k.id === s.wg)) || s.yon;   // doğrudan adres: wg yönü belirler
    return s;
  };
  const dk = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const nokta = d => GM.saatMetin(d).replace(':', '.');
  const mesafe = (km, tahmini) => (km < 1 ? `${tahmini ? '~' : ''}${Math.max(1, Math.round(km * 10)) * 100} m` : tahmini ? `~${Math.round(km)} km` : `${GM.ondalik(km, 1)} km`);
  const yakindakiler = (vesile, tahmini, n = 4) => GMV.mekanlar.filter(m => m.kapak && (!vesile || (m.vesile || []).includes(vesile))).map(m => ({m, d: GM.km(KONUM, [m.lng, m.lat])})).filter(x => x.d < 30)
    .sort((a, b) => (b.m.acik !== false) - (a.m.acik !== false) || a.d - b.d).slice(0, n)
    .map(({m, d}) => ({slug: m.slug, ad: m.ad, semt: m.ilce, mesafe: mesafe(d, tahmini), gorsel: m.kapakB || m.kapak, acik: m.acik}));

  // ---------- Saat (yön B ve sayfa saati) ----------
  const SAAT = {
    sabah: {saat: '08:10', ogun: {ad: 'Kahvaltı', ikon: 'mug-saucer', vesile: 'Kahvaltı'}},
    ogle: {saat: '12:30', ogun: {ad: 'Öğle yemeği', ikon: 'bowl-food', vesile: 'İş Yemeği'}},
    aksam: {saat: '19:00', ogun: {ad: 'Akşam yemeği', ikon: 'utensils', vesile: 'Akşam Yemeği'}},
    sonra: {saat: '21:40', ogun: {ad: 'Gece', ikon: 'moon', vesile: 'Gece Yemekleri'}}
  };
  // Öğün pencereleri (araştırma G5: 07.30, 11.30, 15.00, 18.00, 21.30 sınırları)
  const PENCERE = [['Kahvaltı', '07:30', '11:30'], ['Öğle', '11:30', '15:00'], ['Akşam', '18:00', '21:30'], ['Gece', '21:30', '24:00']];
  const gunSeridi = saat => PENCERE.map(([ad, b, s]) => ({ad, durum: dk(saat) >= dk(s) ? 'gecti' : dk(saat) >= dk(b) ? 'simdi' : 'sonra'}));
  // G8 rütbe eşikleri web prototipinden (K): Meraklı 0, Lezzet Avcısı 100, Gurme 300, Usta Gurme 700, Şef Masası 1500.
  const RUTBE = [{ad: 'Meraklı', esik: 0}, {ad: 'Lezzet Avcısı', esik: 100, e: '’na'}, {ad: 'Gurme', esik: 300, e: '’ye'}, {ad: 'Usta Gurme', esik: 700, e: '’ye'}, {ad: 'Şef Masası', esik: 1500, e: '’na'}];
  const defter = (puan, bekleyen) => {
    const i = RUTBE.findLastIndex(r => puan >= r.esik), r = RUTBE[i], s = RUTBE[i + 1] || r, ara = Math.max(1, s.esik - r.esik);
    return {puan, bekleyen, rutbe: r.ad, sonraki: s.ad, hedef: `${s.ad}${s.e || ''}`, kalan: Math.max(0, s.esik - puan), oran: (puan - r.esik) / ara, bekleyenOran: (puan + bekleyen - r.esik) / ara, rutbeler: RUTBE, rozet: puan ? {ad: 'Yol Arkadaşı', ikon: 'route'} : null};
  };

  // ---------- Veri ----------
  const veri = q => {
    const tahmini = q.konum !== 'kesin';
    // Yön A: İstanbul → İzmir. Baş bilgi sıradaki DADA durağı (LAST, İzmir); veride 150–300. km arasında Dada durağı yok, ara durak planın yakıt molası (Total)
    // yalnız ikincil satır "Önce: …". Konum Total'den 3,2 km önce (≈229. km); süreler GM rota hızından (R.dk / R.km), sapma rota verisinden.
    const R = GM.rotaBul('istanbul-izmir'), D = GM.rotaOneri(R), K = GM.rotaKatmani(R), hiz = R.dk / R.km;
    const yakitlar = K.filter(k => k.tur === 'yakit').sort((a, b) => a.km - b.km), ara = yakitlar.find(k => k.km > R.km * 0.45) || yakitlar.at(-1);
    const KESIN = 3.2, km = ara.km - KESIN, kalanKm = R.km - km, kalanDk = Math.round(kalanKm * hiz), SA = dk('12:46');
    const tek = new Map(); D.forEach(d => tek.set(Math.round((d.km / R.km) * 50), d));   // aynı yerdeki duraklar tek nokta
    const isaretler = [...[...tek.values()].map(d => ({x: d.km / R.km, tur: 'mekan', gecildi: d.km < km})), ...yakitlar.map(k => ({x: k.km / R.km, tur: 'yol', gecildi: k.km < km}))];
    const ileri = D.filter(d => d.km > km), sd = ileri[0], sdKm = sd.km - km, sdDk = Math.round(sdKm * hiz);
    const uzak = x => (tahmini ? `~${Math.round(x)} km` : `${GM.ondalik(x, 1)} km`), sapmaMetin = d => (d.sapma <= 2 ? 'Yol üstü' : `+${d.sapma} dk`);
    // Şimdiki konum: rota çizgisinde 229. km'ye düşen nokta (durgun siluette işaret)
    let top = 0; const c = R.cizgi, uz = c.slice(1).map((p, i) => GM.km(c[i], p)), olcek = R.km / uz.reduce((a, b) => a + b, 0);
    const konum = c.find((p, i) => (top += (uz[i - 1] || 0) * olcek) >= km) || c.at(-1);
    const il = (GMV.ilKimlik || []).find(x => x.ad === sd.mekan.il), tescil = (il?.tescilli || []).filter(x => x.tur === 'yenir').slice(0, 2).map(x => x.ad);
    const yol = {rota: {id: R.id, kalkis: R.kalkis, varis: R.varis, cizgi: R.cizgi}, konum,
      durak: {tur: 'mekan', ad: sd.mekan.ad, turAd: sd.mekan.kategori, il: sd.mekan.il, ilce: sd.mekan.ilce, uzak: uzak(sdKm), sure: `${tahmini ? '~' : ''}${GM.sure(sdDk)}`, varis: nokta(SA + sdDk), sapma: sd.sapma, sapmaMetin: sapmaMetin(sd), gorsel: sd.mekan.kapakB || sd.mekan.kapak},
      once: {ad: ara.ad, tur: 'yakit', turAd: 'yakıt', uzak: tahmini ? '~3 km' : `${GM.ondalik(KESIN, 1)} km`},
      oran: km / R.km, isaretler, gecilen: `${Math.round(km)} km`, kalan: tahmini ? `~${Math.round(kalanKm / 10) * 10} km` : `${Math.round(kalanKm)} km`, kalanSure: GM.sure(kalanDk), varis: nokta(SA + kalanDk),
      sonraki: ileri.slice(1, 4).map(d => ({ad: d.mekan.ad, gorsel: d.mekan.kapak, uzak: uzak(d.km - km), sapma: sapmaMetin(d)})),
      ilKimlik: tescil.length ? `${sd.mekan.il} · coğrafi işaretli: ${tescil.join(', ')}` : '',
      sayilar: [{ikon: 'utensils', deger: String(ileri.length), ad: 'Dada durağı ileride'}, {ikon: 'road', deger: String(ileri.filter(d => d.uzak <= 1).length), ad: 'yol üstü'}, {ikon: 'gas-pump', deger: String(yakitlar.filter(k => k.km > km).length), ad: 'yakıt'}],
      ipucu: tahmini ? 'Kesin mesafe için konum izni' : '', ac: `#/rota/surus/${R.id}`};
    const kayitlilar = [...new Set([...(GM.durum.oku('rota-kayitli', []) || []), 'istanbul-izmir', 'izmir-cesme', 'istanbul-ankara'])].map(GM.rotaBul).filter(Boolean)
      .map(r => ({id: r.id, ad: r.ad, ozet: `${GM.sayi(r.km)} km · ${GM.sure(r.dk)} · ${GM.rotaSayi(r).yolUstu} yol üstü`, kisa: `${GM.sayi(r.km)} km · ${GM.rotaSayi(r).yolUstu} yol üstü`, cizgi: r.cizgi, aktif: r.id === R.id && q.durum !== 'bos', yuzde: Math.round((km / R.km) * 100)}));
    // Yön B: saat, öğün, rezervasyon (kayıt yoksa bugün 20.00 Mikla prototip örneği), etkinlik.
    const S = SAAT[q.saat], kayit = (GM.durum.oku('rezervasyonlar', []) || []).slice(-1)[0], rm = GM.mekan(kayit?.slug || 'mikla');
    const rez = {slug: rm.slug, ad: rm.ad, saat: (kayit?.saat || '20:00').replace(':', '.'), saatDk: dk(kayit?.saat || '20:00'), gunAd: 'Bugün', kisi: kayit?.kisi || 2, durum: kayit ? 'talep' : 'onay', semt: rm.ilce, gorsel: rm.kapakB || rm.kapak, lng: rm.lng, lat: rm.lat};
    const sofra = yakindakiler(S.ogun.vesile, tahmini, 4), oglen = yakindakiler('İş Yemeği', tahmini, 1)[0];
    const bugun = GM.bugunIso(), ev = GMV.etkinlikler.filter(x => x.ulke === 'Türkiye' && x.tarih >= bugun && x.gorsel).sort((a, b) => (a.tarih < b.tarih ? -1 : 1))[0];
    const et = ev && new Date(`${ev.tarih}T00:00`);
    const etkinlik = ev && {slug: ev.slug, ad: ev.ad, tur: ev.tur, gun: String(et.getDate()), ay: AY[et.getMonth()], yer: ev.yer, kalanGun: String(Math.round((et - new Date(`${bugun}T00:00`)) / 864e5)), gorsel: ev.gorsel, tarih: et};
    // Yön C: günün yazısı, Gurme Defterim, kaydedilenler.
    const yz = GMV.lezzetler.filter(l => l.gorsel).sort((a, b) => (b.kategori === 'Gastronomi Seyahati') - (a.kategori === 'Gastronomi Seyahati'))[0];
    const fav = [...GM.kayitliMekanlar()].map(GM.mekan).filter(Boolean), kayitli = (fav.length ? fav : yakindakiler('Romantik Buluşma', tahmini, 6).map(x => GM.mekan(x.slug))).slice(0, 6).map(m => ({ad: m.ad, gorsel: m.kapak, alt: m.ilce}));
    return {tahmini, yol, kayitlilar, R, km, S, rez, sofra, oglen, etkinlik, yazi: yz && {slug: yz.slug, ad: yz.ad, kategori: yz.kategori, sure: yz.sure, gorsel: yz.gorsel, ozet: yz.ozet}, kayitli, kayitliSayi: fav.length || kayitli.length};
  };

  // ---------- Ana ekran simgeleri (markasız genel simge yerleri; Dada Gourmet kendi simgesi) ----------
  const DADA = {ad: 'Dada Gourmet', gorsel: 'assets/marka/ikon-512.png'};
  const UYG = [{ad: 'Takvim', ikon: 'calendar-days', renk: 'tehlike'}, {ad: 'Fotoğraflar', ikon: 'image', renk: 'karb'}, {ad: 'Kamera', ikon: 'camera', renk: 'slate'}, {ad: 'Haritalar', ikon: 'map-location-dot', renk: 'basari'},
    {ad: 'Hava', ikon: 'cloud-sun', renk: 'bilgi'}, {ad: 'Notlar', ikon: 'note-sticky', renk: 'uyari'}, {ad: 'Saat', ikon: 'clock', renk: 'ink'}, {ad: 'Ayarlar', ikon: 'gear', renk: 'muted'},
    {ad: 'Posta', ikon: 'envelope', renk: 'bilgi'}, {ad: 'Podcast', ikon: 'podcast', renk: 'karavan'}, {ad: 'Cüzdan', ikon: 'wallet', renk: 'ink'}, {ad: 'Sağlık', ikon: 'heart', renk: 'tehlike'}];
  const DOCK = [{ikon: 'phone', renk: 'basari'}, {ikon: 'compass', renk: 'bilgi'}, {ikon: 'message', renk: 'basari'}, {ikon: 'music', renk: 'tehlike'}];
  const HUCRE = {kucuk: 4, orta: 8, buyuk: 16};
  const ana = (q, ws, top = 24) => {   // top: ızgara hücresi (Ada genişken bir satır az: 20)
    const dolu = ws.reduce((t, w) => t + HUCRE[w[1]], 0);
    const uyg = [DADA, ...UYG].slice(0, Math.max(0, top - dolu)).map(GM.wyUyg);
    return GM.wyAna({platform: q.platform, hucreler: [...ws.map(w => w[0]), ...uyg], dock: DOCK, tarih: 'Cuma, 13 Kas'});
  };

  // ---------- Yönlerin widget'ları ----------
  // Widget kataloğu (yön başına üç widget; ilk widget yönün başı). boylar: widget'ın desteklediği aileler (galeri noktaları ve ızgara boyu).
  const KATALOG = {
    a: [{id: 'durak', ad: 'Sıradaki Durak', aciklama: 'Yolculukta sıradaki Dada durağı, kalan yol ve varış saati', boylar: ['kucuk', 'orta', 'buyuk']},
      {id: 'yolculuk', ad: 'Yolculuk', aciklama: 'Yolun ne kadarı geçti, ne kadar kaldı, ne zaman varırsın', boylar: ['kucuk', 'orta', 'buyuk']},
      {id: 'rotalar', ad: 'Rotalarım', aciklama: 'Kaydettiğin rotayı tek dokunuşla başlat', boylar: ['kucuk', 'orta']}],
    b: [{id: 'sofra', ad: 'Sofra Saati', aciklama: 'Günün saatine göre yakında açık Dada mekânları', boylar: ['kucuk', 'orta', 'buyuk']},
      {id: 'masam', ad: 'Masam', aciklama: 'Rezervasyonuna kalan süre; saat geçince “nasıldı?”', boylar: ['kucuk', 'orta']},
      {id: 'takvim', ad: 'Lezzet Takvimi', aciklama: 'Etkinliğe kalan gün ve tek dokunuşla Hatırlat', boylar: ['kucuk', 'orta']}],
    c: [{id: 'lezzet', ad: 'Günün Gurme Lezzeti', aciklama: 'Her sabah bir Gurme Lezzetler yazısı', boylar: ['kucuk', 'orta', 'buyuk']},
      {id: 'defter', ad: 'Gurme Defterim', aciklama: 'Dada Puan’ın ve sonraki rütbeye kalan', boylar: ['kucuk', 'orta']},
      {id: 'kaydedilen', ad: 'Kaydettiklerim', aciklama: 'Kaydettiğin mekânlar bir bakışta', boylar: ['orta', 'buyuk']}]
  };
  const SIRA = ['kucuk', 'orta', 'buyuk'];
  const boyUy = (k, boy) => (k.boylar.includes(boy) ? boy : [...k.boylar].sort((a, b) => Math.abs(SIRA.indexOf(a) - SIRA.indexOf(boy)) - Math.abs(SIRA.indexOf(b) - SIRA.indexOf(boy)))[0]);
  const secili = q => KATALOG[q.yon].find(k => k.id === q.wg) || KATALOG[q.yon][0];   // yönle uyuşmayan seçimde yönün ilk widget'ı

  // Widget üreticileri: id → boy → html (hal: giriş yok / ilk gün; eski: çevrimdışı damgası)
  const hal = q => (q.durum === 'giris' ? 'giris' : q.durum === 'bos' ? 'bos' : null);
  const eskiSaat = saat => (saat ? nokta(dk(saat) - 25) : '');
  const ortak = (q, v, saat) => ({hal: hal(q), eski: q.durum === 'cevrimdisi' ? eskiSaat(saat) : ''});
  const W = (q, v) => {
    if (q.yon === 'a') {
      const o = ortak(q, v, '12:46'), yol = {...v.yol, ...o, oneri: {ad: v.R.ad, ozet: `${GM.rotaSayi(v.R).yolUstu} yol üstü durak`}};
      return {durak: b => GM.wyRota({...yol, boy: b}), yolculuk: b => GM.wyYolculuk({...yol, boy: b}),
        rotalar: b => GM.wyRotalar({boy: b, kayitlilar: o.hal ? [] : v.kayitlilar, hal: o.hal === 'giris' ? 'giris' : null, eski: o.eski})};
    }
    if (q.yon === 'b') {
      const o = ortak(q, v, v.S.saat), sonra = q.saat === 'sonra', kalan = v.rez.saatDk - dk(v.S.saat);
      const bos = {baslik: `Yakında ${v.S.ogun.ad.toLocaleLowerCase('tr')} için açık Dada mekânı yok`, metin: v.oglen && q.saat === 'sabah' ? `Öğleye: ${v.oglen.ad} · ${v.oglen.mesafe}` : 'Mekânlar’da şehir rehberine bak'};
      return {sofra: b => GM.wySofra({boy: b, ogun: {...v.S.ogun, saat: v.S.saat.replace(':', '.')}, gun: gunSeridi(v.S.saat), mekanlar: v.sofra, bolge: 'Kadıköy çevresi', bos, ipucu: v.tahmini ? 'Kesin mesafe için konum izni' : '', eski: o.eski}),
        masam: b => GM.wyMasam({boy: b, hal: o.hal || (sonra ? 'sonra' : 'yaklasan'), rez: v.rez, kalan: kalan > 0 ? GM.sure(kalan) : '', eski: o.eski}),
        takvim: b => GM.wyTakvim({boy: b, etkinlik: v.etkinlik, hatirlat: q.durum === 'dolu', misafir: o.hal === 'giris', baslik: o.hal ? 'Yaklaşan etkinlik' : 'Lezzet Takvimi', eski: o.eski})};
    }
    const o = ortak(q, v, '08:30'), d = o.hal === 'bos' ? defter(0, 0) : defter(580, 40);
    return {lezzet: b => GM.wyLezzet({boy: b, yazi: v.yazi, misafir: o.hal === 'giris', eski: o.eski}),
      defter: b => GM.wyDefter({boy: b, ...d, hal: o.hal === 'giris' ? 'giris' : null, eski: o.eski}),
      kaydedilen: b => GM.wyKoleksiyon({boy: b, baslik: 'Kaydettiklerim', sayi: v.kayitliSayi, ogeler: o.hal ? [] : v.kayitli, hal: o.hal === 'giris' ? 'giris' : null, eski: o.eski})};
  };
  // Ana ekran yerleşimi: seçili widget seçili boyda başta (.is-secili: ızgarada 1. satır 1. sütun, belirgin); diğer ikisi ikincil (küçük: s+s+m, orta: m+s+s, büyük: yalnız l), kalan hücreler simge.
  const yerlesim = (q, v, wg = secili(q), boy = q.boy, isaret = true) => {
    const f = W(q, v), b = boyUy(wg, boy), digerleri = KATALOG[q.yon].filter(k => k.id !== wg.id), tercih = b === 'kucuk' ? ['kucuk', 'orta'] : b === 'orta' ? ['kucuk', 'kucuk'] : [];
    const bas = f[wg.id](b);
    return [[isaret ? bas.replace('class="gm-wy ', 'class="gm-wy is-secili ') : bas, b], ...tercih.map((t, i) => { const k = digerleri[i], bb = boyUy(k, t); return [f[k.id](bb), bb]; })];
  };
  const SAYFA_SAATI = (q, v) => (q.yon === 'a' ? '12:46' : q.yon === 'b' ? v.S.saat : '08:30');

  // ---------- Kilit ekranı widget'ları (iOS accessory: tek ton, saat renginde; kişi sayısı ve ad gibi hassas bilgi yok) ----------
  // Dört yuva dolu (iOS: daire + dikdörtgen + daire). Dikdörtgen seçili widget'ın kilit hali (ikon + başlık, büyük değer, kısa etiket); daireler yönün öteki iki widget'ı (değer + birim).
  const bol = m => { const x = String(m || '').match(/^(~?[\d.,%]+)\s*(\S*)/); return x ? [x[1], x[2]] : [String(m || ''), '']; };
  const kilitSeti = (q, v) => {
    const h = hal(q), kw = GM.kilitWidget, e = v.etkinlik, y = v.yol, wg = secili(q);
    const etkDaire = e && kw({tur: 'daire', ikon: 'calendar-days', deger: e.kalanGun, birim: 'gün', oran: 1 - Math.min(1, +e.kalanGun / 30), aria: `${e.ad}: ${e.kalanGun} gün`});
    const dizi = (yuvalar, satir) => { const d = KATALOG[q.yon].filter(k => k.id !== wg.id).map(k => yuvalar[k.id]?.daire).filter(Boolean);
      return {satir, aksesuar: [d[0] && kw({tur: 'daire', ...d[0]}), kw({tur: 'dikdortgen', ...yuvalar[wg.id].kutu}), d[1] && kw({tur: 'daire', ...d[1]})].filter(Boolean)}; };
    if (q.yon === 'a') {
      if (h) return {aksesuar: [kw({tur: 'dikdortgen', ikon: 'route', baslik: 'Dada Route', metin: h === 'giris' ? 'Giriş yap' : 'Rotanı çiz', alt: h === 'giris' ? 'Rotaların burada' : 'Kayıtlı rota yok'})]};
      const [dk_, db] = bol(y.durak.uzak), r = v.kayitlilar.find(x => !x.aktif) || v.kayitlilar[0];
      return dizi({
        durak: {daire: {ikon: 'utensils', deger: dk_, birim: db, aria: `Sıradaki durak ${y.durak.ad} ${y.durak.uzak}`}, kutu: {ikon: 'utensils', baslik: 'Sıradaki durak', metin: y.durak.uzak, alt: `${y.durak.ad} · ${y.durak.varis}`}},
        yolculuk: {daire: {ikon: 'flag-checkered', deger: `%${Math.round(y.oran * 100)}`, oran: y.oran, aria: 'Yolculuğun yüzde kaçı geçti'}, kutu: {ikon: 'flag-checkered', baslik: `${y.rota.kalkis} → ${y.rota.varis}`, metin: `${y.rota.varis} ${y.varis}`, alt: `${y.kalan} kaldı`, oran: y.oran}},
        rotalar: {daire: {ikon: 'bookmark', deger: String(v.kayitlilar.length), birim: 'rota', aria: `${v.kayitlilar.length} kayıtlı rota`}, kutu: {ikon: 'bookmark', baslik: 'Rotalarım', metin: r.ad, alt: r.kisa}}
      }, kw({tur: 'satir', ikon: 'flag-checkered', metin: `Varış ${y.rota.varis} ${y.varis}`}));
    }
    if (q.yon === 'b') {
      const z = v.rez, kalan = z.saatDk - dk(v.S.saat), m = v.sofra[0];
      if (h) return {aksesuar: [etkDaire, kw({tur: 'dikdortgen', ikon: 'calendar-check', baslik: 'Masam', metin: h === 'giris' ? 'Giriş yap' : 'Rezervasyon yok', alt: h === 'giris' ? 'Rezervasyonun burada' : 'Mekânlardan masa ayırt'})].filter(Boolean)};
      const sonra = q.saat === 'sonra', [md, mb] = bol(m?.mesafe), durum = z.durum === 'onay' ? 'Onaylandı' : 'Onay bekleniyor';
      return dizi({
        sofra: {daire: m && {ikon: v.S.ogun.ikon, deger: md, birim: mb, aria: `${v.S.ogun.ad}: ${m.ad} ${m.mesafe}`}, kutu: m ? {ikon: v.S.ogun.ikon, baslik: v.S.ogun.ad, metin: m.ad, alt: [m.mesafe, m.acik ? 'Açık' : 'Kapalı'].join(' · ')} : {ikon: v.S.ogun.ikon, baslik: v.S.ogun.ad, metin: 'Açık mekân yok', alt: 'Mekânlar’a bak'}},
        masam: {daire: !sonra && {ikon: 'calendar-check', deger: kalan >= 60 ? String(Math.round(kalan / 60)) : String(kalan), birim: kalan >= 60 ? 'sa' : 'dk', oran: 1 - Math.min(1, kalan / 720), aria: `${z.ad} rezervasyonuna ${GM.sure(kalan)}`},
          kutu: sonra ? {ikon: 'calendar-check', baslik: 'Masam', metin: `${z.ad} nasıldı?`, alt: 'Ziyaret Ettim için dokun'} : {ikon: 'calendar-check', baslik: 'Masam · Bugün', metin: `${z.saat} · ${z.ad}`, alt: `${durum} · ${GM.sure(kalan)} sonra`}},
        takvim: {daire: e && {ikon: 'calendar-days', deger: e.kalanGun, birim: 'gün', oran: 1 - Math.min(1, +e.kalanGun / 30), aria: `${e.ad}: ${e.kalanGun} gün`}, kutu: e ? {ikon: 'calendar-days', baslik: 'Lezzet Takvimi', metin: `${e.kalanGun} gün · ${e.gun} ${e.ay}`, alt: e.ad} : {ikon: 'calendar-days', baslik: 'Lezzet Takvimi', metin: 'Etkinlik yok', alt: 'Yakında burada'}}
      }, wg.id === 'masam' || sonra ? e && kw({tur: 'satir', ikon: 'calendar-days', metin: `Lezzet Takvimi · ${e.kalanGun} gün`}) : kw({tur: 'satir', ikon: 'calendar-check', metin: `${z.ad} ${z.saat}`}));
    }
    const d = defter(h === 'bos' ? 0 : 580, h === 'bos' ? 0 : 40);
    if (h === 'giris') return {satir: e && kw({tur: 'satir', ikon: 'calendar-days', metin: `Lezzet Takvimi · ${e.kalanGun} gün`}), aksesuar: [etkDaire, kw({tur: 'dikdortgen', ikon: 'medal', baslik: 'Gurme Defterim', metin: 'Giriş yap', alt: 'Puanın burada'})].filter(Boolean)};
    const yz = v.yazi, [sd, sb] = bol(yz?.sure), ks = h === 'bos' ? 0 : v.kayitliSayi;
    return dizi({
      lezzet: {daire: yz && {ikon: 'book-open', deger: sd, birim: sb, aria: `Günün Gurme Lezzeti: ${yz.ad}, ${yz.sure}`}, kutu: {ikon: 'book-open', baslik: 'Günün lezzeti', metin: yz?.ad || '', alt: [yz?.kategori, yz?.sure].filter(Boolean).join(' · ')}},
      defter: {daire: {ikon: 'medal', deger: String(d.kalan), birim: 'puan', oran: d.oran, aria: `${d.hedef} ${d.kalan} puan`}, kutu: {ikon: 'medal', baslik: 'Gurme Defterim', metin: `${d.kalan} puan kaldı`, alt: `Sıradaki: ${d.sonraki}`, oran: d.oran}},
      kaydedilen: {daire: {ikon: 'bookmark', deger: String(ks), birim: 'mekân', aria: `${ks} kayıtlı mekân`}, kutu: {ikon: 'bookmark', baslik: 'Kaydettiklerim', metin: `${ks} mekân`, alt: ks ? v.kayitli.slice(0, 2).map(x => x.ad).join(', ') : 'Beğendiğini kaydet'}}
    }, e && kw({tur: 'satir', ikon: 'calendar-days', metin: `Lezzet Takvimi · ${e.kalanGun} gün`}));
  };
  const TARIH = {ios: 'Cuma 13 Kasım', android: 'Cum, 13 Kas'}, TARIH_KISA = 'Cum 13';   // iOS: satır içi widget varken tarih kısalır

  // ---------- Yüzeyler ----------
  // Android'de şeffaf (Liquid Glass) kip yok: koyu tema; renklendirilmiş = temalı simgeler (Material You), açık zeminde.
  const kip = q => (q.tema === 'renkli' || (q.tema === 'seffaf' && q.platform === 'ios') ? q.tema : '');
  const tema = q => (q.tema === 'acik' || (q.platform === 'android' && q.tema === 'renkli') ? 'acik' : 'koyu');
  const telefon = (q, o) => GM.wyTelefon({...o, platform: q.platform, tema: o.tema || tema(q), kip: o.kip ?? kip(q)});
  const ETIKET = {a: 'Yön A · Co-Pilot', b: 'Yön B · Sofra Saati', c: 'Yön C · Gurme Defter'};

  const anaYuzey = (q, v) => {
    const w = secili(q), boy = boyUy(w, q.boy), saat = SAYFA_SAATI(q, v), BA = {kucuk: 'küçük', orta: 'orta', buyuk: 'büyük'}, dus = boy !== q.boy ? ` (${BA[q.boy]} boyu yok, en yakın boy)` : '';
    if (q.gorunum === 'tekil') return telefon(q, {saat, sinif: 'is-wy-galeri', icerik: GM.wyGaleri({platform: q.platform, widget: W(q, v)[w.id](boy), boy, boylar: w.boylar, ad: w.ad, aciklama: w.aciklama}),
      etiket: `${q.platform === 'ios' ? 'iPhone widget galerisi' : 'Android widget seçici'}: ${w.ad}, ${BA[boy]} boy${dus}`});
    return telefon(q, {saat, ada: q.yon === 'a' && q.platform === 'ios' && !hal(q) ? GM.adaRota({tur: 'kompakt', ...v.yol}) : '', durumCip: q.yon === 'a' && q.platform === 'android' && !hal(q) ? GM.androidCip({tur: 'rota', metin: v.yol.durak.uzak}) : '',
      icerik: ana(q, yerlesim(q, v)), etiket: `${q.platform === 'ios' ? 'iPhone' : 'Android'} ana ekranı, ${ETIKET[q.yon]}: ${w.ad} ${BA[boy]} boy${dus}`});
  };

  const kilitYuzey = (q, v) => {
    const saat = SAYFA_SAATI(q, v);
    if (q.platform === 'ios') return telefon(q, {saat, kilit: {tarih: TARIH.ios, tarihKisa: TARIH_KISA, ...kilitSeti(q, v)}, etiket: `iPhone kilit ekranı, ${ETIKET[q.yon]}: tek tonlu kilit ekranı widget'ları`});
    // Android'de üçüncü taraf kilit ekranı widget'ı yok: kilit ekranında bildirimler (yön A'da Live Update ve durum çipi; yön C'de Lezzet Takvimi'nin 3 gün önce hatırlatması, o günün kilit ekranı).
    if (q.yon === 'c' && v.etkinlik && hal(q) !== 'giris') return canliYuzey({...q, yuzey: 'canli', boy: 'orta'}, v);
    return telefon(q, {saat, kilit: {tarih: TARIH.android}, durumCip: q.yon === 'a' && !hal(q) ? GM.androidCip({tur: 'rota', metin: v.yol.durak.uzak}) : '', icerik: GM.kilitAlt(androidBildirimler(q, v, false)), etiket: `Android kilit ekranı, ${ETIKET[q.yon]}: bildirimler`});
  };

  // Android bildirimleri (perde ya da kilit ekranı): A Live Update (ProgressStyle), B rezervasyon bildirimi, C Lezzet Takvimi.
  const liveUpdate = v => { const y = v.yol;
    return GM.androidLiveUpdate({baslik: `${y.durak.ad} · ${y.durak.uzak}`, metin: `Sıradaki Dada durağı · ${y.durak.sapmaMetin} · önce ${y.once.ad} ${y.once.turAd} ${y.once.uzak}`, gorsel: y.durak.gorsel, zaman: 'şimdi', oran: y.oran,
      noktalar: y.isaretler.filter(n => n.x >= 0.03 && n.x <= 0.97 && Math.abs(n.x - y.oran) >= 0.03), eylemler: [{metin: 'Geç', kod: 'rota-gec'}, {metin: 'Navigasyonda aç', ac: y.ac}]}); };
  const androidBildirimler = (q, v, genis) => {
    const h = hal(q), z = v.rez, e = v.etkinlik;
    if (q.yon === 'a') return h ? [] : [liveUpdate(v)];
    if (q.yon === 'b') return h ? [] : [q.saat === 'sonra'
      ? GM.wyBildirim({platform: 'android', baslik: `${z.ad} nasıldı?`, metin: `${z.gunAd} ${z.saat} · Ziyaretini Ziyaret Geçmişi’ne yaz`, zaman: '21.35', gorsel: z.gorsel, eylemler: [{metin: 'Ziyaret Ettim', kod: 'ziyaret-ettim'}]})
      : GM.wyBildirim({platform: 'android', baslik: `${z.ad} · bugün ${z.saat}`, metin: `${z.durum === 'onay' ? 'Rezervasyonun onaylandı' : 'Mekân onayı bekleniyor'} · ${z.kisi} kişi`, zaman: '18.00', gorsel: z.gorsel, eylemler: [{metin: 'Yola çıktım', kod: 'yola-ciktim'}, {metin: 'Yol tarifi', ac: `#/mekan/${z.slug}`}]})];
    return h === 'giris' || !e ? [] : [GM.wyBildirim({platform: 'android', baslik: 'Lezzet Takvimi · 3 gün kaldı', metin: `${e.ad} · ${e.gun} ${e.ay}, ${e.yer}`, zaman: '10.00', gorsel: e.gorsel, eylemler: genis ? [{metin: 'Takvime Ekle', kod: 'takvime-ekle'}, {metin: 'Hatırlatmayı kapat', kod: 'hatirlat'}] : []})];
  };

  const standbyYuzey = (q, v) => {
    const h = hal(q), y = v.yol, z = v.rez, e = v.etkinlik, gece = q.tema !== 'acik', saat = SAYFA_SAATI(q, v);
    const bosY = (ikon, ust, mesaj, alt) => ({ikon, ust, buyuk: '', ad: mesaj, alt});
    let sol, sag;
    if (q.yon === 'a') {
      sol = h ? bosY('route', 'Dada Route', h === 'giris' ? 'Giriş yap' : 'Rotanı çiz', 'Yolculukta sıradaki durak burada') : {ikon: 'utensils', ust: 'Sıradaki durak', buyuk: y.durak.uzak, ad: y.durak.ad, alt: `${y.durak.sure} · ${y.durak.sapmaMetin} · önce ${y.once.ad} ${y.once.uzak}`};
      sag = h ? bosY('flag-checkered', 'Yolculuk', 'Yolculuk yok', '') : {ikon: 'flag-checkered', ust: `${y.rota.varis} varış`, buyuk: y.varis, ad: `${y.kalan} · ${y.kalanSure}`, alt: `${y.rota.kalkis} → ${y.rota.varis}`, oran: y.oran, isaretler: y.isaretler};
    } else if (q.yon === 'b') {
      const m = v.sofra[0], kalan = z.saatDk - dk(v.S.saat);
      sol = h ? bosY('calendar-check', 'Masam', h === 'giris' ? 'Giriş yap' : 'Rezervasyonun yok', 'Mekânlardan masa ayırt') : q.saat === 'sonra' ? {ikon: 'calendar-check', ust: 'Masam · Bugün', buyuk: z.saat, ad: `${z.ad} nasıldı?`, alt: 'Ziyaret Ettim için dokun'} : {ikon: 'calendar-check', ust: 'Masam · Bugün', buyuk: z.saat, ad: z.ad, alt: `${z.durum === 'onay' ? 'Onaylandı' : 'Onay bekleniyor'} · ${GM.sure(kalan)} sonra`};
      sag = m ? {ikon: v.S.ogun.ikon, ust: `${v.S.ogun.ad} · yakında`, buyuk: m.mesafe, ad: m.ad, alt: [m.semt, m.acik ? 'Açık' : 'Kapalı'].join(' · ')} : bosY(v.S.ogun.ikon, v.S.ogun.ad, 'Yakında açık Dada mekânı yok', '');
    } else {
      const d = defter(h === 'bos' ? 0 : 580, h === 'bos' ? 0 : 40);
      sol = e ? {ikon: 'calendar-days', ust: h ? 'Yaklaşan etkinlik' : 'Lezzet Takvimi', buyuk: e.kalanGun, birim: 'gün', ad: e.ad, alt: `${e.gun} ${e.ay} · ${e.yer}`} : bosY('calendar-days', 'Lezzet Takvimi', 'Yaklaşan etkinlik yok', '');
      sag = h === 'giris' ? bosY('medal', 'Gurme Defterim', 'Giriş yap', 'Puanın burada birikir') : {ikon: 'medal', ust: 'Gurme Defterim', halka: d.oran, buyuk: String(d.kalan), birim: 'puan', ad: d.hedef, alt: `${d.rutbe} · ${d.puan} puan`};
    }
    const etiket = `${q.platform === 'ios' ? 'StandBy (iPhone şarjda yatay)' : 'Android şarj ekranı (yatay)'}, ${ETIKET[q.yon]}${gece ? ', gece görünümü' : ''}`;
    const sb = q.platform === 'android' ? GM.wyStandby({platform: 'android', gece, saat, tarih: TARIH.android, sagHtml: W(q, v)[secili(q).id](boyUy(secili(q), 'orta')), etiket}) : GM.wyStandby({gece, sol, sag, etiket});
    return telefon(q, {saat, tema: 'koyu', kip: '', sinif: 'is-wy-yatay', icerik: sb, etiket});
  };

  // Canlı yüzey: iOS Canlı Etkinlik (kilit kartı) ve Dinamik Ada; Android 16 Live Update + durum çipi; Android 15 ve altı yedeği. Yön C: bildirim.
  const canliYuzey = (q, v) => {
    const h = hal(q), ios = q.platform === 'ios', y = v.yol, z = v.rez, e = v.etkinlik, eski = q.durum === 'cevrimdisi';
    if (h && q.yon !== 'c') return kilitYuzey(q, v);   // yolculuk ya da rezervasyon yokken canlı yüzey açılmaz; kilit ekranı kendi halini gösterir
    if (q.yon === 'a') {
      const kart = GM.canliRotaKarti({...y, durak: {...y.durak, sapma: y.durak.sapma}, eylem: {kod: 'rota-gec'}, ac: y.ac, eski: eski ? '12.21' : ''});
      if (ios) {
        if (q.boy === 'kucuk') return telefon(q, {saat: '12:46', kilit: {tarih: TARIH.ios}, icerik: GM.kilitAlt([kart]), etiket: 'iPhone kilit ekranı: Dada Route Canlı Etkinliği (sıradaki durak, yolculuk çubuğu, Geç)'});
        return telefon(q, {saat: '12:46', sinif: q.boy === 'buyuk' ? 'is-ada-genis' : '', ada: GM.adaRota({tur: q.boy === 'orta' ? 'kompakt' : 'genis', ...y, eylem: {kod: 'rota-gec'}}), icerik: ana(q, yerlesim(q, v, secili(q), 'orta', false), q.boy === 'buyuk' ? 20 : 24), etiket: `Dinamik Ada ${q.boy === 'orta' ? 'kısa hali: durak simgesi ve kalan mesafe' : 'geniş hali: sıradaki durak, yolculuk çubuğu ve Geç'}`});
      }
      if (q.boy === 'kucuk') return telefon(q, {saat: '12:46', durumCip: GM.androidCip({tur: 'rota', metin: y.durak.uzak}), icerik: GM.androidPerde({saat: '12:46', tarih: TARIH.android, icerik: liveUpdate(v)}), etiket: 'Android 16 bildirim perdesi: Dada Route canlı güncellemesi (ProgressStyle), durum çipi'});
      if (q.boy === 'orta') return kilitYuzey(q, v);
      return telefon(q, {saat: '12:46', icerik: GM.androidPerde({saat: '12:46', tarih: TARIH.android, icerik: GM.androidSurekli({baslik: `Sıradaki durak: ${y.durak.ad}`, metin: `${y.durak.uzak} · ${y.kalan} kaldı · varış ${y.varis}`, oran: y.oran, eylemler: [{metin: 'Geç', kod: 'rota-gec'}, {metin: 'Navigasyonda aç', ac: y.ac}]})}), etiket: 'Android 15 ve altı: sürekli bildirim yedeği, klasik ilerleme çubuğu'});
    }
    if (q.yon === 'b') {
      const sonra = q.saat === 'sonra', saat = sonra ? '21:40' : q.saat === 'aksam' ? '19:00' : '18:10', kalanSn = Math.max(0, (z.saatDk - dk(saat)) * 60);
      if (ios) {
        if (q.boy === 'kucuk') return telefon(q, {saat, kilit: {tarih: TARIH.ios}, icerik: GM.kilitAlt([sonra ? GM.wyBildirim({baslik: `${z.ad} nasıldı?`, metin: `${z.gunAd} ${z.saat} · Ziyaret Ettim için dokun`, zaman: '21.35', gorsel: z.gorsel}) : GM.wyMasaKarti({rez: z, kalanSn, eski: eski ? nokta(dk(saat) - 25) : ''})]), etiket: sonra ? `iPhone kilit ekranı: ${z.ad} nasıldı? bildirimi` : `iPhone kilit ekranı: rezervasyon Canlı Etkinliği (iOS 26 zamanlanmış, saatten yaklaşık 2 saat önce başlar): ${z.ad} ${z.saat}`});
        if (sonra) return telefon(q, {saat, icerik: ana(q, yerlesim(q, v, secili(q), 'orta', false)), etiket: 'Rezervasyon saati geçti: Canlı Etkinlik bitti, Masam widget’ı “nasıldı?” soruyor'});
        return telefon(q, {saat, sinif: q.boy === 'buyuk' ? 'is-ada-genis' : '', ada: GM.wyAdaMasa({tur: q.boy === 'orta' ? 'kompakt' : 'genis', rez: z, kalanSn}), icerik: ana(q, yerlesim(q, v, secili(q), 'orta', false), q.boy === 'buyuk' ? 20 : 24), etiket: `Dinamik Ada ${q.boy === 'orta' ? 'kısa hali: rezervasyona kalan süre' : 'geniş hali: Mikla, saat, durum ve Yol tarifi'}`});
      }
      // Android: yaklaşan rezervasyon Live Update olmaz; "Yola çıktım" deyince (orta) Live Update, Android 15 ve altında (büyük) sürekli bildirim.
      const yolKm = GM.km(KONUM, [z.lng, z.lat]) * 1.3, yolDk = Math.round(yolKm * 3), uzak = mesafe(yolKm, v.tahmini);
      if (q.boy === 'kucuk' || sonra) return telefon(q, {saat, icerik: GM.androidPerde({saat, tarih: TARIH.android, icerik: androidBildirimler(q, v, false).join('')}), etiket: 'Android bildirim perdesi: rezervasyon bildirimi (yaklaşan rezervasyon canlı güncelleme olmaz), Yola çıktım eylemi'});
      if (q.boy === 'orta') return telefon(q, {saat, durumCip: GM.androidCip({tur: 'rota', metin: uzak}), icerik: GM.androidPerde({saat, tarih: TARIH.android, icerik: GM.androidLiveUpdate({baslik: `${z.ad} · ${uzak} kaldı`, metin: `Varış ~${nokta(dk(saat) + yolDk)} · masa ${z.saat} · ${z.kisi} kişi`, zaman: 'şimdi', oran: 0.18, noktalar: [], gorsel: z.gorsel, eylemler: [{metin: 'Yol tarifi', ac: `#/mekan/${z.slug}`}, {metin: 'Bitir', kod: 'yolculuk-bitir'}]})}), etiket: 'Android 16: Yola çıktım sonrası rezervasyona giden yolun canlı güncellemesi ve durum çipi'});
      return telefon(q, {saat, icerik: GM.androidPerde({saat, tarih: TARIH.android, icerik: GM.androidSurekli({baslik: `${z.ad} · yoldasın`, metin: `${uzak} · varış ~${nokta(dk(saat) + yolDk)} · masa ${z.saat}`, oran: 0.18, eylemler: [{metin: 'Yol tarifi', ac: `#/mekan/${z.slug}`}]})}), etiket: 'Android 15 ve altı: rezervasyona giden yolun sürekli bildirimi'});
    }
    // Yön C: Canlı Etkinlik yok. Lezzet Takvimi'nin "3 gün önce" hatırlatması (etkinlikten 3 gün önce, 10.00).
    if (!e || h === 'giris') return kilitYuzey(q, v);
    const gun = new Date(e.tarih.getTime() - 3 * 864e5), tarih = ios ? `${['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][gun.getDay()]} ${gun.getDate()} ${['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][gun.getMonth()]}` : `${['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][gun.getDay()]}, ${gun.getDate()} ${AY[gun.getMonth()]}`;
    const bil = genis => GM.wyBildirim({baslik: 'Lezzet Takvimi · 3 gün kaldı', metin: `${e.ad} · ${e.gun} ${e.ay}, ${e.yer}`, zaman: 'şimdi', gorsel: e.gorsel, genis, eylemler: [{metin: 'Takvime Ekle', ikon: 'calendar-plus', kod: 'takvime-ekle'}, {metin: 'Hatırlatmayı kapat', ikon: 'bell-slash', kod: 'hatirlat'}]});
    if (!ios) return q.boy === 'orta' ? telefon(q, {saat: '10:00', kilit: {tarih}, icerik: GM.kilitAlt(androidBildirimler(q, v, true)), etiket: 'Android kilit ekranı: Lezzet Takvimi hatırlatması'})
      : telefon(q, {saat: '10:00', icerik: GM.androidPerde({saat: '10:00', tarih, icerik: androidBildirimler(q, v, true).join('')}), etiket: 'Android bildirim perdesi: Lezzet Takvimi hatırlatması (etkinlikler canlı güncelleme olmaz)'});
    if (q.boy === 'buyuk') return telefon(q, {saat: '10:00', kilit: {tarih}, icerik: GM.kilitAlt([bil(true)]), sinif: 'is-wy-bulanik', etiket: 'iPhone: basılı tutunca açılan Lezzet Takvimi bildirimi; Takvime Ekle ve Hatırlatmayı kapat'});
    return telefon(q, {saat: '10:00', kilit: q.boy === 'orta' ? {tarih, satir: GM.kilitWidget({tur: 'satir', ikon: 'calendar-days', metin: 'Lezzet Takvimi · 3 gün'}), aksesuar: [GM.kilitWidget({tur: 'daire', ikon: 'calendar-days', deger: '3', oran: 0.9, aria: `${e.ad}: 3 gün`})]} : {tarih}, icerik: GM.kilitAlt([bil(false)]), etiket: 'iPhone kilit ekranı: Lezzet Takvimi hatırlatma bildirimi (editoryal içerikte Canlı Etkinlik yok)'});
  };

  const YUZEY = {ana: anaYuzey, kilit: kilitYuzey, standby: standbyYuzey, canli: canliYuzey};

  GM.ekran('widget', {
    tur: 'tam', ust: '#/alternatifler',
    baslik: () => 'Widget’lar',
    ciz: ctx => { const q = sorgu(ctx.param.no); return YUZEY[q.yuzey](q, veri(q)); },
    sonra: kok => {
      const tik = ev => {
        const e = ev.target.closest('[data-wg-eylem]'); if (!e) return;
        const k = e.dataset.wgEylem;
        if (k === 'hatirlat' && e.getAttribute('role') === 'switch') { const acik = e.getAttribute('aria-checked') !== 'true'; e.setAttribute('aria-checked', acik); e.classList.toggle('is-acik', acik); GM.toast(acik ? 'Hatırlatma açıldı · **1 gün önce**' : 'Hatırlatma kapandı'); }
        else if (k === 'hatirlat') GM.toast('Hatırlatma kapandı');
        else if (k === 'ziyaret-ettim') GM.toast('**Ziyaret Geçmişi**’ne yazıldı', {tur: 'basari'});
        else if (k === 'rota-baslat') GM.toast('Yolculuk başladı · **Canlı Etkinlik** açıldı', {tur: 'basari'});
        else if (k === 'lezzet-kaydet') GM.toast('Yazı **kaydedildi**', {tur: 'basari'});
        else if (k === 'takvime-ekle') GM.toast('Etkinlik **takvime eklendi**', {tur: 'basari'});
        else if (k === 'yola-ciktim') GM.toast('Yola çıktın · **canlı güncelleme** açıldı', {tur: 'basari'});
        else if (k === 'yolculuk-bitir') GM.toast('Canlı güncelleme kapandı');
        else GM.toast('Durak geçildi · **sıradaki** gösteriliyor', {eylem: 'Geri al'});
      };
      kok.addEventListener('click', tik); return () => kok.removeEventListener('click', tik);
    }
  });

  GM.alternatifKaydet({ekran: 'widget', kod: 'widget', sira: 1, ad: 'Widget’lar · iOS ve Android', git: '#/widget/yuzey?cerceve=yok&uye=1',
    referans: 'Flighty (Canlı Etkinlik, Dinamik Ada), Apple ve Google Haritalar (yolculuk), Structured (sıradaki iş), (Not Boring) Weather ve Widgetsmith (dev rakam, geri sayım), Android Glance ve Live Updates kılavuzları',
    alinan: 'Gerçek iOS 18/26 ve Pixel ızgarası (küçük 2×2, orta 4×2, büyük 4×4), tek tonlu kilit ekranı widget’ları, StandBy, Canlı Etkinlik ve Dinamik Ada kısa/geniş, Android 16 ProgressStyle canlı güncelleme ve durum çipi; uçta halka olmayan tek yolculuk çubuğu.',
    gerekce: 'Üç yön aynı telefonda karşılaştırılır: A yolculuk (rakipsiz Dada Route), B her gün işe yarayan öğün ve masa, C marka sesi. Prototip örneği: rezervasyon kaydı yoksa bugün 20.00 Mikla (2 kişi, onaylandı); yolculuk İstanbul → İzmir 229. km, sıradaki Dada durağı LAST (İzmir, ~242 km, ~2 sa 22 dk), önce Total yakıt ~3 km; Dada Puan 580 + 40 bekleyen (eşikler web prototipinden); puan, yorum, sponsor yok.',
    // Karar sayfası sözleşmesi: bolum (üç başlık), diger (katlanan "Diğer"), öğe/grup yon (yalnız o yönde görünür); ilk öğe varsayılan. Sunum: seçtirilecek hazır birleşimler.
    sunumlar: [
      {ad: 'Yolda · Canlı Etkinlik + Ada', aciklama: 'İstanbul → İzmir yolculuğu: Dinamik Ada geniş hali, altında Sıradaki Durak', secim: {yon: 'a', platform: 'ios', yuzey: 'canli', wg: 'durak', boy: 'buyuk', gorunum: 'ana', tema: 'acik', durum: 'dolu'}},
      {ad: 'Ana ekran · Co-Pilot', aciklama: 'Sıradaki Durak orta boy, iPhone ana ekranında', secim: {yon: 'a', platform: 'ios', yuzey: 'ana', wg: 'durak', boy: 'orta', gorunum: 'ana', tema: 'acik', durum: 'dolu'}},
      {ad: 'Akşam · Sofra Saati', aciklama: '19.00, yakında açık Dada mekânları', secim: {yon: 'b', platform: 'ios', yuzey: 'ana', wg: 'sofra', boy: 'orta', gorunum: 'ana', saat: 'aksam', tema: 'acik', durum: 'dolu'}},
      {ad: 'Android · Material You', aciklama: 'Pixel ana ekranı, temalı renkler', secim: {yon: 'b', platform: 'android', yuzey: 'ana', wg: 'sofra', boy: 'orta', gorunum: 'ana', saat: 'aksam', tema: 'renkli', durum: 'dolu'}}
    ],
    secenekler: [
      {ad: 'Yön', anahtar: 'yon', bolum: 'Ne gösterilsin', ogeler: [{ad: 'A · Co-Pilot', deger: 'a'}, {ad: 'B · Sofra Saati', deger: 'b'}, {ad: 'C · Gurme Defter', deger: 'c'}]},
      {ad: 'Widget', anahtar: 'wg', bolum: 'Ne gösterilsin', ogeler: Object.entries(KATALOG).flatMap(([yon, l]) => l.map(k => ({ad: k.ad, deger: k.id, yon})))},
      {ad: 'Boy', anahtar: 'boy', bolum: 'Ne gösterilsin', ogeler: [{ad: 'Küçük', deger: 'kucuk'}, {ad: 'Orta', deger: 'orta'}, {ad: 'Büyük', deger: 'buyuk'}]},
      {ad: 'Telefon', anahtar: 'platform', bolum: 'Nerede', ogeler: [{ad: 'iPhone', deger: 'ios', ikon: 'apple'}, {ad: 'Android', deger: 'android', ikon: 'android'}]},
      {ad: 'Yüzey', anahtar: 'yuzey', bolum: 'Nerede', ogeler: [{ad: 'Ana ekran', deger: 'ana'}, {ad: 'Kilit ekranı', deger: 'kilit'}, {ad: 'StandBy', deger: 'standby'}, {ad: 'Canlı', deger: 'canli'}]},
      {ad: 'Görünüm', anahtar: 'gorunum', bolum: 'Nerede', ogeler: [{ad: 'Ana ekranda', deger: 'ana'}, {ad: 'Yalnız bu widget', deger: 'tekil'}]},
      {ad: 'Saat (B)', anahtar: 'saat', bolum: 'Durum', diger: true, yon: 'b', ogeler: [{ad: 'Akşam 19.00', deger: 'aksam'}, {ad: 'Sabah 08.10', deger: 'sabah'}, {ad: 'Öğle 12.30', deger: 'ogle'}, {ad: 'Sonra 21.40', deger: 'sonra'}]},
      {ad: 'Tema', anahtar: 'tema', bolum: 'Durum', diger: true, ogeler: [{ad: 'Açık', deger: 'acik'}, {ad: 'Koyu', deger: 'koyu'}, {ad: 'Renklendirilmiş', deger: 'renkli'}, {ad: 'Şeffaf', deger: 'seffaf'}]},
      {ad: 'Durum', anahtar: 'durum', bolum: 'Durum', diger: true, ogeler: [{ad: 'Dolu', deger: 'dolu'}, {ad: 'İlk gün', deger: 'bos'}, {ad: 'Giriş yok', deger: 'giris'}, {ad: 'Çevrimdışı', deger: 'cevrimdisi'}]},
      {ad: 'Mesafe', anahtar: 'konum', bolum: 'Durum', diger: true, ogeler: [{ad: 'Tahmini', deger: 'tahmini'}, {ad: 'Kesin (izinli)', deger: 'kesin'}]}
    ]});
})();
