/* Ana sayfa · referanslı alternatifler (ref-ana-1..4). Her biri tek bir ödüllü/küresel uygulamanın kalıbından beslenir; görünüm Gourmet kanonundan (kanon/gm-k-ana.js).
   Web ana sayfa blok sırası her birinde korunur (docs/WEB-ENVANTERI.md §1.3): Bugünün Rotası · Konseptler · AS-T1 · Nasıl keşfetmek istersin? · AS-M1 · Yaklaşan Etkinlikler · Gurme Lezzetler · Mekân Bul çağrısı · AS-B1.
   Veri uydurulmaz: süre farkları GM.rotaOneri sapmalarından, durak sayıları GM.rotaSayi'dan (tek kaynak), rozetler web alanlarından (seckiler, dadaOnerdi, rezervasyon). */
(() => {
  const BUGUN = '2026-11-13';
  const KONSEPT_DISI = ['rezervasyon-aliyor', 'online-rezervasyon', 'wifi', 'kredi-karti', 'bebek-sandalyesi', 'acik-alan'];
  const ortak = () => {
    const R = GM.rotaBul('istanbul-izmir'), M = GMV.mekanlar, D = GM.rotaOneri(R), n = GM.rotaSayi(R);
    const kullanilan = new Set(D.slice(0, 8).map(d => d.slug));
    // Konseptler web sırasıyla (P:konseptleriGetir = mekanSecenek sırası); 0 mekânlı konsept gizlenir (WEB-ENVANTERI §1.3).
    const konsept = (GMV.mekanSecenek.konsept || []).filter(k => k.sayi > 0 && !KONSEPT_DISI.includes(k.deger))
      .map(k => { const m = M.find(m => m.konsept.includes(k.ad) && m.kapak && !kullanilan.has(m.slug)); if (m) kullanilan.add(m.slug); return {k, m}; }).filter(x => x.m);
    const etk = GMV.etkinlikler.filter(e => e.gorsel && (e.bit || e.tarih) >= BUGUN).sort((a, b) => (b.yerel - a.yerel) || a.tarih.localeCompare(b.tarih)).slice(0, 4);
    const lez = GMV.lezzetler.filter(l => l.gorsel).sort((a, b) => b.tarih.split('.').reverse().join('').localeCompare(a.tarih.split('.').reverse().join(''))).slice(0, 8);
    const ozet = `<b>${GM.sayi(R.km)} km</b> · ${GM.sure(R.dk)} · ${GM.rotaSayiMetin(R)}`;
    const pinUc = [{lng: R.cizgi[0][0], lat: R.cizgi[0][1], uc: true}, {lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], uc: true}];
    const B = {
      modul: {baslik: 'Nasıl keşfetmek istersin?', html: GM.modulIzgara([
        GM.modulKart({ikon: 'rota', baslik: 'Dada Route', alt: 'Yol üstü lezzet durakları', fiil: 'Rota çiz', git: '#/rota', ana: true}),
        GM.modulKart({ikon: 'bul', baslik: 'Mekân Bul', alt: '4 soruda sana uygun mekân', fiil: 'Başla', git: '#/mekan-bul'}),
        GM.modulKart({ikon: 'mekan', baslik: 'Mekânlar', alt: `${M.length} mekân, harita ve liste`, fiil: 'Gözat', git: '#/mekanlar', gorsel: M.filter(m => m.kapakB)[4]?.kapakB}),
        GM.modulKart({ikon: 'lezzet', baslik: 'Gurme Lezzetler', alt: 'Yöresel tatlar ve hikâyeleri', fiil: 'Keşfet', git: '#/lezzetler', gorsel: lez[0]?.gorsel})])},
      etkinlik: {baslik: 'Yaklaşan Etkinlikler', eylem: 'Tümü', git: '#/etkinlikler', html: GM.yatay(etk.map(e => GM.etkinlikKart(e)), {sinif: 'gm-ka-iki'})},
      lezzet: {baslik: 'Gurme Lezzetler', eylem: 'Tamamını Gör', git: '#/lezzetler', html: GM.yatay(lez.map(l => GM.icerikKart({gorsel: l.gorsel, kategori: l.kategori, baslik: l.ad, meta: l.sure, git: `#/lezzet/${l.slug}`, sinif: 'gm-ka-puf'})))},
      teaser: GM.teaser({ikon: 'bul', baslik: 'Ne aradığını bilmiyor musun?', metin: 'Bütçeni, ortamı ve mutfağı seç; **sana uygun mekânları** sıralayalım.', cipler: [['Kebap', 'kebap'], ['Deniz', 'deniz'], ['Kahvaltı', 'kahvalti'], ['Esnaf Lokantası', 'esnaf']].map(([m, k]) => ({metin: m, git: `#/mekanlar?ara=${k}`})), btn: {metin: 'Mekân Bul', ikon: 'bul', git: '#/mekan-bul'}, sinif: 'gm-ka-teaser'})
    };
    return {R, M, D, n, konsept, etk, lez, ozet, pinUc, B};
  };
  // ?hal=bos: pilot rota ve içerik yokken (web: Bugünün Rotası kaydı yoksa blok basılmaz; konsept/etkinlik boş metinleri).
  const BOS = {ikon: 'rota', baslik: 'Bugünün rotası hazırlanıyor', metin: 'Pilot rota yayına girince burada görünür. Şimdilik **mekânlara** göz atabilirsin.', eylem: {metin: 'Mekânları keşfet', ikon: 'mekan', git: '#/mekanlar'}};
  const tarih = 'Cuma, 13 Kasım';

  // ---------- 1 · Citymapper kalıbı ----------
  // A→B en üstte (Bugünün Rotası dolu gelir), altında rota karakteri ızgarası: her karakter rotadaki önerilen duraklardan seçilir, süre = rota süresi + durak sapmaları.
  const KARAKTER = [
    {deger: 'lezzet', ad: 'Lezzet yolu', ikon: 'utensils', suz: d => d.uzak <= 1},
    {deger: 'sef', ad: 'Şef masası', ikon: 'kitchen-set', suz: d => d.mekan.konsept.includes('Şef Restoranı')},
    {deger: 'sahil', ad: 'Sahil yolu', ikon: 'water', suz: d => d.mekan.konsept.includes('Deniz Kenarı')},
    {deger: 'manzara', ad: 'Manzaralı', ikon: 'mountain-sun', suz: d => d.mekan.konsept.includes('Manzaralı')},
    {deger: 'deniz', ad: 'Balık ve deniz', ikon: 'fish', suz: d => d.mekan.mutfak.includes('Deniz Ürünleri')},
    {deger: 'butik', ad: 'Butik sofralar', ikon: 'store', suz: d => d.mekan.konsept.includes('Butik')}
  ];
  // Duraklar yola yayılır: rota üç km dilimine bölünür, her dilimden en az sapan eşleşen durak; eksik kalırsa en az sapanlarla tamamlanır (3 durak).
  const yay = (R, l) => { const s = [], az = (a, b) => a.sapma - b.sapma; for (let i = 0; i < 3; i++) { const d = l.filter(x => !s.includes(x) && x.km >= R.km * i / 3 && x.km < R.km * (i + 1) / 3).sort(az)[0]; if (d) s.push(d); } l.filter(x => !s.includes(x)).sort(az).slice(0, 3 - s.length).forEach(d => s.push(d)); return s.sort((a, b) => a.km - b.km); };
  const karakterler = (R, D) => [{deger: 'hizli', ad: 'En hızlı', ikon: 'gauge-high', dk: R.dk, fark: 0, duraklar: []}]
    .concat(KARAKTER.map(k => { const l = yay(R, D.filter(k.suz)); const f = l.reduce((t, d) => t + d.sapma, 0); return {...k, duraklar: l, fark: f, dk: R.dk + f}; }).filter(k => k.duraklar.length >= 2))
    .slice(0, 6).map(k => ({...k, alt: `Varış ${GM.varisSaati(k.dk)}`}));
  const karakterListe = (R, k) => k.duraklar.length
    ? GM.karakterOzet({sol: `<b>${GM.esc(k.ad)}</b> · ${k.duraklar.length} durak · +${k.fark} dk`, sag: `Varış <b>${GM.varisSaati(k.dk)}</b>`}) + GM.mekanSatirlar(k.duraklar.map(d => GM.mekanKart(d.mekan, {tur: 'satir', sapma: {dk: d.sapma, km: d.km}})))
      + GM.btn({metin: 'Bu duraklarla başla', ikon: 'rota', tam: true, git: `#/rota/${R.id}`})
    : GM.karakterOzet({sol: '<b>En hızlı</b> · durak eklenmez', sag: `Varış <b>${GM.varisSaati(R.dk)}</b>`}) + GM.btn({metin: 'Rotayı aç', ikon: 'harita', tam: true, git: `#/rota/${R.id}`});

  GM.ekran('ref-ana-1', {
    tur: 'sekme', nav: 'kesfet', baslik: 'Keşfet', bos: BOS,
    ciz: () => {
      const {R, D, konsept, etk, B} = ortak(), K = karakterler(R, D), sec = K[1] || K[0];
      const ust = GM.bindirBant({gorsel: 'assets/gorsel/hero/sokak-dikey.webp', ust: `${tarih} · Bugünün Rotası`, baslikHtml: 'Hangi <em>yoldan</em> gidelim?'})
        + GM.bindirYuva(GM.abPanel({etiket: 'Bugünün Rotası', rozet: 'Pilot rota', nereden: R.kalkis, nereye: R.varis, git: `#/rota/${R.id}`, ad: 'ref1-kar', karakterler: K.map(k => GM.karakterOge({...k, secili: k === sec}))})
          + GM.kisayollar([
            {ikon: 'rota', ad: 'Hazır rotalar', alt: `${GMV.rotalar.length} pilot rota`, git: '#/rota/hazir'},
            {ikon: 'favori', ad: 'Favori mekânlar', alt: `${GM.kayitliMekanlar().size} kayıtlı`, git: '#/profil'},
            {ikon: 'kaydet', ad: 'Rotalarım', alt: 'Kaydettiğin rotalar', git: '#/rota/rotalarim'},
            {ikon: 'download', ad: 'Çevrimdışı', alt: 'Haritayı indir', git: '#/rota/cevrimdisi'}]));
      return ust + GM.bolumler([
        {id: 'ref1-liste', baslik: 'Yol üstü duraklar', eylem: 'Haritada', git: `#/rota/${R.id}`, html: karakterListe(R, sec)},
        {baslik: 'Konseptler', eylem: 'Tamamını Gör', git: '#/mekanlar', html: GM.konseptSerit(konsept.map(x => ({ad: x.k.ad, alt: `${x.k.sayi} mekân`, gorsel: x.m.kapak, git: `#/mekanlar?konsept=${x.k.deger}`})))},
        GM.reklamYeri({kod: 'AS-T1'}), B.modul, GM.reklamYeri({kod: 'AS-M1'}),
        {baslik: 'Yaklaşan Etkinlikler', eylem: 'Tümü', git: '#/etkinlikler', html: GM.anaSatirlar(etk.map(e => GM.etkinlikKart(e, {tur: 'satir'})))},
        B.lezzet, B.teaser, GM.reklamYeri({kod: 'AS-B1'})
      ]);
    },
    sonra: kok => {
      const {R, D} = ortak(), K = karakterler(R, D);
      const a = GM.karakterBagla(kok, deger => { const k = K.find(x => x.deger === deger), s = kok.querySelector('#ref1-liste'); if (!k || !s) return; s.innerHTML = GM.bas(k.duraklar.length ? `${k.ad} durakları` : 'Yol üstü duraklar', {metin: 'Haritada', git: `#/rota/${R.id}`}) + karakterListe(R, k); });
      const b = GM.kaydetBagla(kok);
      return () => { a(); b(); };
    }
  });

  // ---------- 2 · Michelin Guide kalıbı ----------
  // Sade büyük başlık + arama, "Yakınımda" mini harita kartı, editoryal seçki kapağı ve ödül satırlı seçki kartları (rozet = web seckiler alanı; ödül uydurulmaz).
  GM.ekran('ref-ana-2', {
    tur: 'sekme', nav: 'kesfet', baslik: 'Keşfet', bos: BOS,
    ciz: () => {
      const {R, M, D, konsept, ozet, pinUc, B} = ortak();
      const il = 'İstanbul', yakin = M.filter(m => m.il === il && m.lng && m.lat);
      const lng = yakin.map(m => m.lng).sort((a, b) => a - b), lat = yakin.map(m => m.lat).sort((a, b) => a - b), q = (l, p) => l[Math.floor((l.length - 1) * p)];
      const secki = GMV.mekanSecenek.seckiler?.find(s => s.deger === 'rota')?.ad || 'Dada Route Durağı';
      const kapak = D.slice(8).find(d => d.mekan.kapakB)?.mekan.kapakB || D.find(d => d.mekan.kapakB)?.mekan.kapakB;
      return GM.buyukBaslik({ust: 'Dada Gourmet rehberi', baslik: 'Bugün ne yesek?', metin: `Dada editörlerinin yol üstü seçkisi: **${GM.sayi(M.length)} mekân** ve **${GMV.rotalar.length} pilot rota**. Kartlardaki rozet, mekânın bir Dada Route durağı olduğunu gösterir.`, html: GM.aramaKapsul({alan: true, baslik: 'Mekân, rota ya da lezzet ara', git: '#/ara'})}) + GM.bolumler([
        {baslik: 'Yakınımda', eylem: 'Haritada', git: '#/mekanlar', html: GM.yakinKart({harita: {ad: 'ref2-yakin', kume: true, sinir: [[q(lng, .05), q(lat, .05)], [q(lng, .95), q(lat, .95)]], pinler: yakin.map(m => ({id: m.slug, lng: m.lng, lat: m.lat, tur: 'mekan', ad: m.ad})), etiket: `${il} mekânları haritada`}, metin: `${il}’da ${yakin.length} mekân`, alt: 'Konumun kapalı · şehir seçimine göre', git: '#/mekanlar'})},
        {baslik: 'Bugünün Rotası', eylem: 'Rotayı aç', git: `#/rota/${R.id}`, html: GM.seckiKapak({gorsel: kapak, rozet: {ikon: 'rota', metin: 'Pilot rota · Dada Route'}, baslik: R.ad, alt: ozet, git: `#/rota/${R.id}`, sema: GM.rotaCizgi({rota: {cizgi: R.cizgi}, pinler: pinUc, w: 120, h: 96, dolgu: {top: 8, right: 8, bottom: 8, left: 8}, sinif: 'is-kapak'})})
          + GM.yatay(D.slice(0, 8).map(d => GM.seckiKart({gorsel: d.mekan.kapak, ikon: 'rota', rozet: secki, baslik: d.mekan.ad, alt: [d.km < 1 ? 'Çıkışta' : `${d.km}. km`, d.uzak <= 1 ? 'Yol üstü' : '', GM.konumMetin(d.mekan)].filter(Boolean).join(' · '), git: `#/mekan/${d.slug}`, id: d.slug})))},
        {baslik: 'Konseptler', eylem: 'Tamamını Gör', git: '#/mekanlar', html: GM.yatay(konsept.map(x => GM.seckiKart({gorsel: x.m.kapak, ikon: GM.konseptIkon(x.k.deger), baslik: x.k.ad, alt: `${x.k.sayi} mekân`, git: `#/mekanlar?konsept=${x.k.deger}`})))},
        GM.reklamYeri({kod: 'AS-T1'}), B.modul, GM.reklamYeri({kod: 'AS-M1'}), B.etkinlik, B.lezzet, B.teaser, GM.reklamYeri({kod: 'AS-B1'})
      ]);
    },
    sonra: kok => GM.kaydetBagla(kok)
  });

  // ---------- 3 · Airbnb kalıbı ----------
  // Yapışkan arama kapsülü + konsept ikon sekmeleri; sekme alttaki büyük fotoğraflı akışı süzer. Yolculuk kartı = Bugünün Rotası, deneyim kartları = etkinlikler.
  const akis = (M, k) => {
    const l = M.filter(m => m.konsept.includes(k.ad) && (m.kapakB || m.kapak)).slice(0, 3);
    return GM.bas(`${k.ad} mekânlar`, {metin: 'Tümü', git: `#/mekanlar?konsept=${k.deger}`}) + GM.ilanAkis(l.map(m => GM.ilanKart(m, {rozet: m.rezervasyon ? 'Rezervasyon alıyor' : m.seckiler?.includes('rota') ? 'Dada Route durağı' : ''})))
      + GM.btn({metin: `${k.sayi} mekânın tümünü gör`, tur: 'ikincil', tam: true, git: `#/mekanlar?konsept=${k.deger}`});
  };
  GM.ekran('ref-ana-3', {
    tur: 'sekme', nav: 'kesfet', baslik: 'Keşfet', bos: BOS,
    ciz: () => {
      const {R, M, konsept, etk, B} = ortak(), K = konsept.map(x => x.k);
      return GM.ustSabit(GM.aramaKapsul({baslik: 'Nereye gidiyorsun?', alt: 'Mekân · Rota · Etkinlik · Lezzet', git: '#/ara'}) + GM.ikonSekme({ad: 'konsept', etiket: 'Konseptler', secili: K[0].deger, ogeler: K.map(k => ({deger: k.deger, metin: k.ad, ikon: GM.konseptIkon(k.deger)}))}))
        + GM.bolumler([
          {baslik: 'Bugünün Rotası', eylem: 'Rotayı aç', git: `#/rota/${R.id}`, html: GM.yolculukKart({rozet: 'Pilot rota', baslik: `${R.kalkis} → ${R.varis}`, alt: `${GM.sayi(R.km)} km · ${GM.sure(R.dk)} · ${GM.rotaSayiMetin(R)} · varış ${GM.varisSaati(R.dk)}`, git: `#/rota/${R.id}`, sema: GM.rotaCizgi({rota: {cizgi: R.cizgi}, pinler: [{lng: R.cizgi[0][0], lat: R.cizgi[0][1], uc: true}, {lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], uc: true}], w: 96, h: 96, dolgu: {top: 12, right: 12, bottom: 12, left: 12}})})},
          {id: 'ref3-akis', html: akis(M, K[0])},
          GM.reklamYeri({kod: 'AS-T1'}),
          {baslik: 'Nasıl keşfetmek istersin?', html: GM.hizmetIzgara([{ikon: 'rota', ad: 'Dada Route', alt: 'Rota çiz', git: '#/rota', ana: true}, {ikon: 'bul', ad: 'Mekân Bul', alt: 'Başla', git: '#/mekan-bul'}, {ikon: 'mekan', ad: 'Mekânlar', alt: 'Gözat', git: '#/mekanlar'}, {ikon: 'lezzet', ad: 'Lezzetler', alt: 'Keşfet', git: '#/lezzetler'}])},
          GM.reklamYeri({kod: 'AS-M1'}),
          {baslik: 'Yaklaşan Etkinlikler', eylem: 'Tümü', git: '#/etkinlikler', html: GM.yatay(etk.map(e => GM.deneyimKart(e)))},
          B.lezzet, B.teaser, GM.reklamYeri({kod: 'AS-B1'})
        ]);
    },
    sonra: kok => {
      const {M, konsept} = ortak();
      const a = GM.ikonSekmeBagla(kok, deger => { const x = konsept.find(c => c.k.deger === deger), s = kok.querySelector('#ref3-akis'); if (x && s) s.innerHTML = akis(M, x.k); });
      const b = GM.kaydetBagla(kok);
      return () => { a(); b(); };
    }
  });

  // ---------- 4 · Komoot kalıbı ----------
  // Tur kartı (bölünmüş medya, 4'lü sayı ızgarası, yol/durak bileşim çubukları), yol boyunca il kartları, Dada Route koleksiyonları, konsept ızgarası.
  const koleksiyonlar = () => {
    const kullanilan = new Set(), R = GMV.rotalar.filter(r => r.cizgi?.length), bolge = r => new Set((r.iller || []).map(i => i.bolge));
    return [
      {baslik: 'Uzun yol sofraları', l: R.filter(r => r.km >= 400 && r.id !== 'paris-lyon')},
      {baslik: 'Ege ve Akdeniz’e', l: R.filter(r => bolge(r).has('Ege') || bolge(r).has('Akdeniz'))},
      {baslik: 'Kısa kaçamaklar', l: R.filter(r => r.km < 200)},
      {baslik: 'Yurt dışı', l: R.filter(r => r.id === 'paris-lyon')}
    ].filter(k => k.l.length).map(k => {
      // Mozaik: her rotadan sırayla bir durak fotoğrafı; aynı görsel iki kez kullanılmaz.
      const f = [], havuz = k.l.map(r => GM.rotaOneri(r).filter(d => d.mekan.kapak).map(d => d.mekan.kapak).reverse());
      for (let i = 0; f.length < 3 && i < 40; i++) { const p = havuz[i % havuz.length]; let g; while ((g = p.pop()) && (kullanilan.has(g) || f.includes(g))); if (g) { f.push(g); kullanilan.add(g); } }
      return {...k, fotolar: f, alt: `${k.l.length} rota · ${GM.sayi(k.l.reduce((t, r) => t + r.km, 0))} km`};
    });
  };
  GM.ekran('ref-ana-4', {
    tur: 'sekme', nav: 'kesfet', baslik: 'Keşfet', bos: BOS,
    ciz: () => {
      const {R, D, n, konsept, B} = ortak();
      const iller = (R.iller || []).map((i, x, a) => ({...i, pay: (a[x + 1]?.km ?? R.km) - i.km}));
      const kat = Object.entries(D.reduce((t, d) => ({...t, [d.mekan.kategori]: (t[d.mekan.kategori] || 0) + 1}), {})).sort((a, b) => b[1] - a[1]);
      const foto = D.filter(d => d.mekan.kapakB), s = Math.floor(R.dk / 60), dk = String(R.dk % 60).padStart(2, '0');
      // Profil (Komoot yükselti profili karşılığı): rotaya ≤10 km TÜM mekânların km dilimlerine dağılımı; tabanda yol katmanları.
      const DILIM = 32, dilim = Array(DILIM).fill(0); GM.rotaDuraklari(R).forEach(d => { dilim[Math.min(DILIM - 1, Math.floor(d.km / R.km * DILIM))]++; });
      const ilSay = Object.entries(D.reduce((t, d) => ({...t, [d.mekan.il]: (t[d.mekan.il] || 0) + 1}), {})).sort((a, b) => b[1] - a[1]).slice(0, 2);
      const profil = GM.turProfil({km: R.km, dilim, iller: R.iller, katman: GM.rotaKatmani(R).filter(k => !k.ornek && ['yakit', 'sarj', 'ibadet', 'dinlenme'].includes(k.tur)), kalkis: R.kalkis, varis: R.varis, etiket: `${R.ad} lezzet yoğunluğu profili`,
        alt: `En yoğun: ${ilSay.map(([i, v]) => `<b>${GM.esc(i)}</b> ${v}`).join(' · ')} durak · çentik: yakıt, mola`});
      const tur = GM.turKart({ust: 'Bugünün Rotası', rozet: 'Pilot rota', baslik: R.ad, alt: `${R.tema} · ${R.kalkis} → ${R.varis}`, git: `#/rota/${R.id}`,
        sema: GM.rotaCizgi({rota: {cizgi: R.cizgi}, pinler: [...D.map(d => ({lng: d.lng, lat: d.lat})), {lng: R.cizgi[0][0], lat: R.cizgi[0][1], uc: true}, {lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], uc: true}], w: 210, h: 192, dolgu: {top: 18, right: 18, bottom: 18, left: 18}}),
        fotolar: [foto[0]?.mekan.kapakB, foto.at(-1)?.mekan.kapakB],
        sayilar: [{etiket: 'Mesafe', deger: GM.sayi(R.km), birim: 'km'}, {etiket: 'Süre', deger: `${s}:${dk}`, birim: 'sa'}, {etiket: 'Önerilen', deger: n.onerilen, birim: 'durak'}, {etiket: 'Yol üstü', deger: n.yolUstu, birim: 'durak'}],
        profil,
        bilesim: [GM.bilesimCubuk({baslik: 'Geçtiği iller', ogeler: iller.map(i => ({ad: i.ad, deger: i.pay, metin: `${GM.sayi(i.pay)} km`}))}), GM.bilesimCubuk({baslik: 'Durak türleri', tekSutun: true, ogeler: kat.map(([k, v]) => ({ad: k, deger: v, metin: `${v} durak`}))})],
        eylem: GM.btn({metin: 'Rotayı aç', ikon: 'harita', git: `#/rota/${R.id}`}) + GM.ikonBtn({ikon: 'paylas', etiket: 'Rotayı paylaş', tur: 'kutu', veri: {eylem: 'rota-paylas'}})});
      const ilKart = (R.iller || []).map(i => ({i, k: (GMV.ilKimlik || []).find(k => k.ad === i.ad)})).filter(x => x.k?.tescilli?.length).map(x => GM.bolgeKart({...x.k, bolge: x.i.bolge}, {km: x.i.km}));
      return GM.bindirBant({gorsel: 'assets/gorsel/hero/tabak.webp', ust: `${tarih} · Dada Route`, baslikHtml: 'Bugünün <em>turu</em> hazır'}) + GM.bindirYuva(tur) + GM.bolumler([
        ilKart.length ? {baslik: 'Yol boyunca', eylem: 'Rotada', git: `#/rota/${R.id}`, html: GM.yatay(ilKart)} : null,
        {baslik: 'Dada Route koleksiyonları', eylem: 'Tümü', git: '#/rota/hazir', html: GM.yatay(koleksiyonlar().map(k => GM.koleksiyonKart({...k, git: '#/rota/hazir'})))},
        {baslik: 'Konseptler', eylem: 'Tamamını Gör', git: '#/mekanlar', html: GM.konseptIzgara(konsept.slice(0, 6).map(x => ({ad: x.k.ad, alt: `${x.k.sayi} mekân`, gorsel: x.m.kapakB || x.m.kapak, git: `#/mekanlar?konsept=${x.k.deger}`})))},
        GM.reklamYeri({kod: 'AS-T1'}), B.modul, GM.reklamYeri({kod: 'AS-M1'}), B.etkinlik, B.lezzet, B.teaser, GM.reklamYeri({kod: 'AS-B1'})
      ]);
    },
    sonra: kok => GM.eylem(kok, 'rota-paylas', () => GM.paylas({baslik: 'Bugünün Rotası', url: 'https://dadagourmet.com/dada-route/istanbul-izmir'}))
  });
})();
[
  {ekran: 'ana', kod: 'ref-ana-1', sira: 4, ad: 'Ana · Citymapper kalıbı', referans: 'Citymapper (The Europas 2015 Grand Prix)', alinan: 'A→B paneli en üstte, altında süre farklı "rota karakteri" ızgarası (Lezzet yolu, Şef masası, Sahil…) ve kayıtlı yer kısayolları.', gerekce: 'Gourmet’in asıl sorusu "bu yolda nerede yerim?"; karakter seçmek rotayı tek dokunuşta lezzete çevirir.', iyilesti: 'Her karakterde Citymapper gibi varış saati; duraklar artık yolun başına yığılmıyor, rotanın üç dilimine yayılıyor; konseptler web sırasında, boş hâl metni. Yığılma turu: süre kartları iki satır (ad · süre + fark); varış saati seçili karakterin özet satırında.', git: '#/ref/ana-1'},
  {ekran: 'ana', kod: 'ref-ana-2', sira: 5, ad: 'Ana · Michelin Guide kalıbı', referans: 'The MICHELIN Guide (kategoride küresel referans)', alinan: 'Sade büyük başlık + arama, "Yakınımda" mini harita kartı, editoryal seçki kapağı ve ad üstünde ödül satırlı kartlar.', gerekce: 'Gourmet bir seçki rehberi; rozet dili gerçek "Dada Route Durağı" seçkisinden gelir, uydurma ödül yok.', iyilesti: 'Editoryal giriş paragrafı (gerçek sayılar, iki yana yaslı, kalın vurgu); rozet satırı yol üstü durağı ayırıyor; Yakınımda haritası kümeler okunsun diye geniş kadraj; konseptler web sırasında. Yığılma turu: seçki rozeti foto üstünde, kartta ad · konum; kapakta ad · tek satır özet.', git: '#/ref/ana-2'},
  {ekran: 'ana', kod: 'ref-ana-3', sira: 6, ad: 'Ana · Airbnb kalıbı', referans: 'Airbnb (kategori lideri; Core77 Design Award 2011 Notable — Apple Design Award doğrulanamadı)', alinan: 'Yapışkan arama kapsülü + ikonlu kategori sekmeleri, yaklaşan yolculuk kartı, büyük fotoğraflı ilan akışı, deneyim kartları.', gerekce: 'Konseptler Gourmet’in kategorisi; sekme akışı süzünce fotoğraf karar verdirir, etkinlikler deneyim gibi okunur.', iyilesti: 'Sekme değişince akış kademeli belirerek geliyor, kartlarda basılı hâl; yolculuk kartında şimdi çıkarsan varış saati; sekmeler web konsept sırasında. Yığılma turu: yolculuk kartında ad + Pilot rota hapı · tek satır özet; ilan kartı ad + açık durumu · semt · ₺ (boş puan gösterilmez); deneyim kartı ad · kısa tarih · şehir.', git: '#/ref/ana-3'},
  {ekran: 'ana', kod: 'ref-ana-4', sira: 7, ad: 'Ana · Komoot kalıbı', referans: 'Komoot (Garmin Connect IQ App of the Year 2023; Walkers’ App of the Year 2022)', alinan: 'Tur kartı (harita + foto, 4’lü sayı ızgarası, yol türü bileşim çubukları), bölge kartları, koleksiyonlar, spor türü ızgarası.', gerekce: 'Dada Route bir tur ürünü; rotanın km, il ve durak bileşimini tek kartta ölçülü gösterir.', iyilesti: 'Komoot yükselti profilinin karşılığı eklendi: km cetvelli lezzet yoğunluğu profili (A/B, il sınırları, yakıt-mola çentikleri); konseptler web sırasında. Yığılma turu: profil açıklaması tek satır; koleksiyon kartında ad · özet.', git: '#/ref/ana-4'}
].forEach(GM.alternatifKaydet);
