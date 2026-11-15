/* Dada Route ekranları. Patron mimari belgesi (15 Kas) §3A: sekmeye dokununca boş harita değil yönlendirici giriş (1. alternatif = giriş kapısı).
   #/rota (a) giriş: "Yolun lezzetini planla" + Konumum / Nereye gidiyorsun? (→ planla), Web'den gönderildi kartı (→ #/rota/web/:id), yolun lezzeti km şeridi,
   son ve hazır rotalar, "Yol boyunca neler var?" kategori hapları (→ aktif harita o kategoride), altta Çevrimdışı rotalar · Seyahat günlüğü · Araç ekranı. Orta düğmenin uzun basışı aynı içeriğin kısa sheet'idir (gm-ui.js).
   #/rota/planla (b) planlama: duraklar (kalkış, ara ≤ 3 panel kuralı, varış), araç Yakıtlı/Elektrikli (web), sapma toleransı, ihtiyaç tercihleri → ?adim=sonuc 3 rota seçeneği.
   #/rota/surus/:id (h) Co-Pilot (Yola Çık): koyu durak asistanı; turn-by-turn yok, navigasyon dış haritaya devredilir; yaklaşım bildirimi 3 km kala kendiliğinden (?uyari=1 açık, 0 kapalı). */
(() => {
  const R0 = () => GM.rotaBul('istanbul-izmir');
  const kapakli = r => GM.rotaKartVeri(r, {gorsel: GM.rotaDuraklari(r).find(d => d.mekan.kapakB)?.mekan.kapakB || GM.rotaDuraklari(r).find(d => d.mekan.kapak)?.mekan.kapak});

  // Giriş kahramanı: planlayıcı ya da yolda canlı kart.
  const girisUst = ctx => {
    const R = R0(), yolda = ctx.sorgu.yolda === '1', D = GM.rotaOneri(R);
    const sira = D.find(d => d.km > 300) || D[0], bal = (R.iller || []).find(i => i.ad === 'Balıkesir');
    const ust = GM.selamBas({gorsel: 'assets/gorsel/hero/sokak-dikey.webp', ust: yolda ? 'Yolculuk sürüyor · İstanbul – İzmir' : 'Dada Route', baslikHtml: yolda ? 'Sıradaki durak <em>yaklaşıyor</em>' : 'Yolun <em>lezzetini</em> planla', html: yolda
      ? GM.canliKart({etiket: 'Co-Pilot açık', baslik: sira.mekan.ad, alt: `Sıradaki durak · ${sira.km}. km · ${sira.mekan.ilce}`, sure: '1 sa 52 dk', ilerleme: bal ? bal.km / R.km : .55, cipler: [{tur: 'yakit', metin: 'Yakıt +2 dk'}, {tur: 'ibadet', metin: 'Mescit +3 dk'}], git: `#/rota/surus/${R.id}`})
      : GM.planlayici({})});
    return {R, yolda, D, ust};
  };

  // ---------- (a) Rota merkezi ----------
  GM.ekran('rota', {
    tur: 'sekme', nav: 'rota', baslik: 'Dada Route',
    bos: {ikon: 'rota', baslik: 'Henüz rotan yok', metin: 'İlk rotanı çiz; yol üstündeki **gurme duraklar** rotadan sapma süresiyle gelsin.', eylem: {metin: 'Rota planla', ikon: 'rota', git: '#/rota/planla'}},
    ciz: ctx => {
      const {R, yolda, ust} = girisUst(ctx);
      const son = ['istanbul-bursa', 'izmir-cesme', 'istanbul-ankara'].map(GM.rotaBul).filter(Boolean);
      const hazir = ['istanbul-izmir', 'izmir-cesme', 'ankara-antalya', 'ankara-trabzon', 'istanbul-bursa'].map(GM.rotaBul).filter(Boolean);
      const K = GM.rotaKategori(R), W = GM.rotaWebden(), n = GM.rotaSayi(R);
      return ust + GM.bolumler([
        W ? {html: GM.webdenRota({ust: `Webden gönderildi · ${W.zaman}`, ad: W.ad, alt: W.alt, git: `#/rota/web/${W.id}`})} : null,
        // Yolun lezzeti: pilot rotanın yatay km şeridi (belge §4: lezzet profili eğrisi yerine İstanbul – Yalova – Bursa çizgisi).
        yolda ? null : {baslik: `Yolun lezzeti · ${R.ad}`, eylem: 'Haritada', git: `#/rota/${R.id}`, html: GM.yigin([GM.p(`**${n.onerilen} önerilen durak**, ${n.yolUstu} tanesi yol üstünde; geçtiğin illerde **${K.lezzet} coğrafi işaretli lezzet**.`), GM.kmSerit(R, {duraklar: K.ogeler.neYenir})], 16)},
        {baslik: 'Son rotaların', eylem: 'Tümü', git: '#/rota/rotalarim', html: GM.satirlar(son.map(r => GM.rotaKart(GM.rotaKartVeri(r), {tur: 'satir'})))},
        {baslik: 'Hazır rotalar', eylem: 'Tümü', git: '#/rota/hazir', html: GM.yatay(hazir.map((r, i) => GM.rotaKart(kapakli(r), {kayitli: i === 1})))},
        // Kategori hapları (Şekil 2): aktif haritanın dört kategorisi; dokununca pilot rota o kategoride açılır.
        {baslik: 'Yol boyunca neler var?', html: GM.yigin([GM.p('Rotanı çizince **gurme durakların** yanında yolun ihtiyaçları da açılır; her biri rotadan **sapma süresiyle** gelir.'), GM.katmanCipler({ad: 'rota-kat-tanit', etiket: 'Rota boyunca kategoriler', ogeler: K.kat.map(k => ({tur: k.tur, deger: k.deger, ikon: k.ikon, metin: k.metin, sayi: k.sayi}))})], 12)},
        // Altyapı kısayolları (belge §3A): çevrimdışı paket, seyahat günlüğü, araç ekranı; kilit ekranı ve rotalarım ek giriş.
        {html: GM.satirlar([{ikon: 'cevrimdisi', baslik: 'Çevrimdışı rotalar', alt: 'Çekmeyen yolda harita, adres ve telefon', git: '#/rota/cevrimdisi', ok: true}, {ikon: 'gecmis', baslik: 'Seyahat günlüğü', alt: 'Tamamlanan rotalar ve duraklar', git: '#/rota/gunluk', ok: true}, {ikon: 'arac', baslik: 'Araç ekranı', alt: 'CarPlay ve Android Auto', git: '#/rota/arac', ok: true}, {ikon: 'mobile-screen', baslik: 'Kilit ekranı', alt: 'Canlı Etkinlik, Dinamik Ada ve yolculuk bildirimleri', git: '#/rota/telefon', ok: true}])}
      ]);
    },
    sonra: (kok, ctx) => {
      // Kategori hapı seçim değil yönlendirmedir: pilot rotanın aktif haritası o kategoride açılır.
      const tik = ev => { const c = ev.target.closest('[data-ad="rota-kat-tanit"] [data-cip]'); if (!c) return; ev.preventDefault(); ev.stopPropagation(); GM.git(`#/rota/${R0().id}?kat=${encodeURIComponent(c.dataset.cip)}`); };
      kok.addEventListener('click', tik, true); return () => kok.removeEventListener('click', tik, true);
    }
  });

  // Arşiv ref-route-0 (Görev 12 öncesi #/rota) lider dosyasında: ekranlar/route-arsiv.js.

  // ---------- (b) Planlama ----------
  // Rota seçenekleri: panelde Google Routes 3 alternatif döner (WEB-ENVANTERI §3.6); süre/km burada prototip örneğidir. Durak sayısı veriden: sapma toleransı içinde kalan mekânlar.
  const SECENEK = () => { const r = R0(), D = GM.rotaDuraklari(r); return [
    {id: 'lezzet', ikon: 'neYenir', ad: 'Lezzet yolu', dk: r.dk + 26, km: Math.round(r.km + 18), alt: `${GM.rotaSayi(r).onerilen} önerilen durak · Bursa üzerinden`},
    {id: 'hizli', ikon: 'bolt', ad: 'En hızlı', dk: r.dk, km: Math.round(r.km), alt: `${GM.rotaSayi(r).yolUstu} yol üstü durak · otoyol`},
    {id: 'sakin', ikon: 'leaf', ad: 'Sakin yol', dk: r.dk + 48, km: Math.round(r.km + 31), alt: 'Ücretli yol yok · köy lokantaları'}]; };
  // Web paritesi (Görev 11): pilot güzergâhlar (panelin 5 TR pilotu), ara durakta tahmini bekleme (15–90 dk), tolerans "Özel km" (2–30, web kaydırıcı), ara durak sınırı 3, Yeni rota.
  const SIRA = [['oneri', 'Önerilen'], ['sapma', 'En kısa sapma'], ['km', 'Km sırası'], ['acik', 'Açık olanlar önce']];
  const PILOT = ['istanbul-izmir', 'istanbul-ankara', 'ankara-antalya', 'istanbul-bursa', 'izmir-cesme'];
  const pd = () => ({bekle: 45, tol: '10', km: 12, ...(GM.durum.oku('rota-planla', null) || {})});
  const pdYaz = d => GM.durum.yaz('rota-planla', {...pd(), ...d});
  GM.ekran('rota-planla', {
    tur: 'alt', baslik: 'Rota planla', ust: '#/rota',
    ustBar: ctx => (ctx.sorgu.adim === 'sonuc' ? {} : {sag: [{ikon: 'yenile', etiket: 'Yeni rota oluştur', veri: {eylem: 'plan-sifirla'}}]}),
    ciz: ctx => {
      if (ctx.sorgu.adim === 'sonuc') {
        const r = R0();
        return `<div class="gm-ic gm-yigin-24"><div class="gm-yigin-8"><p class="gm-t-label gm-ton-ikincil">İstanbul → İzmir · 1 ara durak</p><h2 class="gm-t-section">3 rota bulundu</h2></div>${GM.harita({ad: 'planla-sonuc', yukseklik: '220px', etkilesim: false, kontroller: false, rota: {cizgi: r.cizgi, alternatif: GM.rotaBul('istanbul-bursa').cizgi}, pinler: [{lng: r.cizgi[0][0], lat: r.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic'}, {lng: r.cizgi.at(-1)[0], lat: r.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis'}]})}${GM.rotaSecenekler(SECENEK(), {secili: 'lezzet', rozet: 'Önerilen'})}${GM.bilgi({ikon: 'bilgi', metin: 'Süreler trafiksiz tahmindir; mola süreleri ayrıca eklenir.'})}</div>`;
      }
      const d = pd();
      return `<div class="gm-ic gm-yigin-24">${GM.alan({etiket: 'Pilot güzergâhlar', html: GM.cipler({ad: 'plan-pilot', etiket: 'Pilot güzergâhlar', ogeler: PILOT.map(GM.rotaBul).filter(Boolean).map(r => ({metin: r.ad, ikon: 'rota', git: `#/rota/${r.id}`}))})})}
        ${GM.durakDuzen([{tur: 'bas', ad: 'Konumum', alt: 'Kadıköy, İstanbul', id: 'a'}, {tur: 'ara', ad: 'Bursa', alt: `Tahmini bekleme ${d.bekle} dk`, id: 'd1'}, {tur: 'son', ad: 'İzmir', alt: 'Alsancak', id: 'b'}], {ekleMetin: 'Ara durak ekle (en çok 3)'})}
        ${GM.alan({etiket: 'Araç', html: GM.segment({ad: 'arac', secili: GM.durum.oku('rota-arac', 'yakit') || 'yakit', ogeler: [{ad: 'Yakıtlı', deger: 'yakit', ikon: 'yakit'}, {ad: 'Elektrikli', deger: 'ev', ikon: 'sarj'}]})})}
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
        // Araç seçimi aktif haritayla ortak (rota-arac): Elektrikli'de şarj ve uzun mola durakları öne gelir.
        GM.on(kok, 'arac', v => GM.durum.yaz('rota-arac', v)),
        GM.on(kok, 'tolerans', v => (v === 'ozel' ? ozelKm() : pdYaz({tol: v}))),
        // Sırala (web durak sırası, J:261-303): ara durak sıralama ölçütü sheet'i; seçim kalıcı (rota-planla.sira), sheet'te işaretli.
        GM.eylem(kok, 'durak-sirala', () => GM.sheet({baslik: 'Ara durakları sırala', html: GM.yigin([GM.satirlar(SIRA.map(([deger, ad]) => ({ikon: 'sirala', baslik: ad, sag: (pd().sira || 'oneri') === deger ? GM.ik('onay') : '', veri: {eylem: 'plan-sira-sec', id: deger}}))), GM.p('Ara duraklar kalkış ile varış arasında bu ölçüte göre dizilir; rotada geri dönüş olmaz.', {ton: 'ikincil'})], 12),
          sonra: (k, h) => GM.eylem(k, 'plan-sira-sec', el => { const v = el.dataset.id; pdYaz({sira: v}); h.kapat(); GM.tazele(); GM.toast(`Ara duraklar **${SIRA.find(x => x[0] === v)[1].toLocaleLowerCase('tr')}** ölçütüyle dizildi`, {ikon: 'sirala'}); })})),
        GM.eylem(kap, 'plan-sifirla', () => { const once = pd(); GM.durum.yaz('rota-planla', null); GM.tazele(); GM.toast('Yeni rota: duraklar ve seçimler **sıfırlandı**', {eylem: 'Geri al', onEylem: () => { pdYaz(once); GM.tazele(); }}); })];
      return () => c.forEach(f => f());
    }
  });

  // ---------- (h) Co-Pilot ----------
  // Sıradaki durak: aktif haritada eklenen ilk durak (rota-<id>, km sırasıyla); yoksa Dada önerisi (300. km sonrası ilk gurme durak). Konum: o durağa 3 km kala.
  const cpVeri = ctx => {
    const R = GM.rotaBul(ctx.param.id) || R0(), K = GM.rotaKategori(R), E = GM.rotaEklenen(GM.durum.oku(`rota-${R.id}`, null) || {}, K), D = K.ogeler.neYenir;
    const sira = E[0] || D.find(d => d.km > 300) || D[0];
    const kumul = [0]; R.cizgi.forEach((p, n) => { if (n) kumul.push(kumul[n - 1] + GM.km(R.cizgi[n - 1], p)); });
    const hedefKm = Math.max(0, sira.km - 3), i = Math.max(1, kumul.findIndex(k => k >= hedefKm)), kalanKm = Math.round(R.km - hedefKm);
    return {R, E, sira, hedefKm, konum: R.cizgi[i], gecilen: R.cizgi.slice(0, i + 1), kalanKm, uyari: {baslik: `3 km sonra sağda: ${sira.ad}`, metin: sira.uzak <= 1 ? 'Yol üstünde, süre eklemez. Durmak ister misin?' : `Rotadan +${sira.sapma} dk. Durmak ister misin?`}};
  };
  GM.ekran('rota-surus', {
    tur: 'tam', haller: false,
    ciz: ctx => {
      const {R, E, sira, hedefKm, konum, gecilen, kalanKm, uyari} = cpVeri(ctx), m = sira.mekan;
      const kat = GM.rotaKatmani(R).filter(k => k.km > hedefKm && !String(k.id).startsWith('tarihi')).slice(0, 2);
      const simdi = GM.simdi().getHours() * 60 + GM.simdi().getMinutes(), kalanDk = Math.round(kalanKm / R.km * R.dk);
      const ses = GM.durum.oku('copilot-ses', true) !== false;
      return `${GM.ustBar({tur: 'modal', baslik: 'Co-Pilot', sag: [{ikon: ses ? 'sesli' : 'volume-xmark', etiket: ses ? 'Sesli uyarılar açık' : 'Sesli uyarılar kapalı', veri: {eylem: 'cp-ses'}}]})}${GM.copilot({
        harita: {ad: 'cp-harita', rota: {cizgi: R.cizgi, gecilen}, konum, yon: 200, merkez: konum, zoom: 11.5, pinler: [{id: 'cp-sira', lng: sira.lng, lat: sira.lat, sira: E.length ? 1 : null, tur: m ? 'mekan' : sira.tur, ad: sira.ad}]},
        uyari: ctx.sorgu.uyari === '1' ? uyari : null,
        sirada: {tur: m ? 'mekan' : sira.tur, ad: sira.ad, alt: m ? [m.kategori, m.ilce].filter(Boolean).join(' · ') : GM.KATMAN_AD[sira.tur], gorsel: m?.kapak, uzak: '3 km', sure: '~4 dk', sapma: sira.uzak <= 1 ? 1 : sira.sapma},
        yaklasan: kat.map(k => ({tur: k.tur, ad: k.ad, uzak: `${Math.max(1, Math.round(k.km - hedefKm))} km`})),
        cipler: [{tur: 'yakit', metin: 'Yakıt'}, {tur: 'sarj', metin: 'Şarj'}, {tur: 'ibadet', metin: 'Mescit'}, {tur: 'dinlenme', metin: 'Mola'}],
        uclu: [{etiket: 'Varış', deger: GM.saatNokta(simdi + kalanDk)}, {etiket: 'Kalan', deger: GM.sure(kalanDk)}, {etiket: 'Mesafe', deger: `${kalanKm} km`}]
      })}`;
    },
    sonra: (kok, ctx) => {
      const {R, E, uyari} = cpVeri(ctx);
      // Sesli uyarı aç/kapa (GM.durum copilot-ses): üst bar düğmesi yerinde güncellenir (açık: volume-high tam beyaz, kapalı: volume-xmark; aria-pressed yok, kanonda basılı ikon soluk morlaşır), yaklaşım bildirimi yazılı gelmeye devam eder.
      const sesYaz = b => { const ac = GM.durum.oku('copilot-ses', true) !== false; b.setAttribute('aria-label', ac ? 'Sesli uyarılar açık' : 'Sesli uyarılar kapalı'); b.removeAttribute('aria-pressed'); b.innerHTML = GM.ik(ac ? 'sesli' : 'volume-xmark'); };
      kok.querySelectorAll('[data-eylem="cp-ses"]').forEach(sesYaz);
      const c = [GM.eylem(kok, 'cp-ses', b => { const ac = !(GM.durum.oku('copilot-ses', true) !== false); GM.durum.yaz('copilot-ses', ac); sesYaz(b); GM.titres?.(); GM.toast(ac ? '**Sesli uyarılar açık** · durağa 3 km kala okunur' : '**Sesli uyarılar kapalı** · uyarılar yalnız yazılı gelir', {ikon: ac ? 'sesli' : 'volume-xmark'}); }),
        GM.eylem(kok, 'cp-gec', () => GM.toast('Durak geçildi, **sıradaki** gösteriliyor', {eylem: 'Geri al'})), GM.eylem(kok, 'cp-nav', () => GM.aktarSheet({rota: R, duraklar: E}))];
      // Geo-fencing (belge §3E): yola çıkınca durağa 3 km kala yaklaşım bildirimi kendiliğinden gelir (sesli + yazılı); ?uyari=1 doğrudan açık, ?uyari=0 kapalı.
      // Harita kutusu esnek (gövde yüksekliğine göre); MapLibre tuvali kutu büyüyünce yeniden ölçülür (aksi hâlde altta boyanmamış bant kalır).
      const hEl = kok.querySelector('.gm-cp-harita .gm-harita'), olc = () => { const m = hEl?._harita; if (!m) return; try { m.resize(); m.jumpTo({center: m.getCenter(), zoom: m.getZoom()}); m.triggerRepaint(); } catch { /* yok */ } };
      if (hEl) { const ro = new ResizeObserver(olc); ro.observe(hEl); let n = 0; const iv = setInterval(() => { const m = hEl._harita; if (m) { olc(); m.once('idle', olc); } if (m || ++n > 30) clearInterval(iv); }, 200); c.push(() => { ro.disconnect(); clearInterval(iv); }); }
      if (ctx.sorgu.uyari == null) { const t = setTimeout(() => { const g = kok.querySelector('.gm-cp-govde'); if (!g || g.querySelector('.gm-yaklas')) return; g.insertAdjacentHTML('afterbegin', GM.yaklasmaUyari(uyari)); GM.titres?.(20); }, 2400); c.push(() => clearTimeout(t)); }
      return () => c.forEach(f => f());
    }
  });
})();
/* #/rota/:id aktif rota haritası, #/rota/liste/:id ve #/rota/web/:id: ekranlar/rota-aktif.js (Görev 12, patron mimari belgesi). */
