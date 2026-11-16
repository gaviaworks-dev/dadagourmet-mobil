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
      ? GM.canliKart({etiket: 'Yol takibi açık', baslik: sira.mekan.ad, alt: `Sıradaki durak · ${sira.km}. km · ${sira.mekan.ilce}`, sure: '1 sa 52 dk', ilerleme: bal ? bal.km / R.km : .55, cipler: [{tur: 'yakit', metin: 'Yakıt +2 dk'}, {tur: 'ibadet', metin: 'Mescit +3 dk'}], git: `#/rota/surus/${R.id}`})
      : GM.planlayici({git: '#/rota/planla?sec=nereye', nereden: (GM.durum.oku('rota-planla', null) || {}).nereden?.ad, nereye: (GM.durum.oku('rota-planla', null) || {}).nereye?.ad})});
    return {R, yolda, D, ust};
  };

  // ---------- (a) Rota merkezi ----------
  GM.ekran('rota', {
    tur: 'sekme', nav: 'rota', baslik: 'Dada Route',
    bos: {ikon: 'rota', baslik: 'Henüz rotan yok', metin: 'İlk rotanı çiz; yol üstündeki **gurme duraklar** rotadan sapma süresiyle gelsin.', eylem: {metin: 'Rota planla', ikon: 'rota', git: '#/rota/planla'}},
    ciz: ctx => {
      const {R, yolda, ust} = girisUst(ctx);
      const K = GM.rotaKategori(R), W = GM.rotaWebden();
      return ust + GM.bolumler([
        W ? {html: GM.webdenRota({ust: `Webden gönderildi · ${W.zaman}`, ad: W.ad, alt: W.alt, git: `#/rota/web/${W.id}`})} : null,
        // Görev 14/17: "Yolun lezzeti" ve fotoğraflı "Hazır rotalar" kaldırıldı; yerine kullanıcının KENDİ rotaları (gezdikleri + kaydettikleri) şerit hâlinde.
        {baslik: 'Rotaların', eylem: 'Tümü', git: '#/rota/rotalarim', html: GM.yatay(GM.rotaKendi().map(GM.kendiRotaKart))},
        // Kategori hapları (Şekil 2): aktif haritanın dört kategorisi; dokununca pilot rota o kategoride açılır.
        {baslik: 'Yol boyunca neler var?', html: GM.yigin([GM.p('Rotanı çizince **gurme durakların** yanında yolun ihtiyaçları da açılır; her biri rotadan **sapma süresiyle** gelir.'), GM.katmanCipler({ad: 'rota-kat-tanit', etiket: 'Rota boyunca kategoriler', ogeler: K.kat.map(k => ({tur: k.tur, deger: k.deger, ikon: k.ikon, metin: k.metin, sayi: k.sayi}))})], 12)},
        // Altyapı kısayolları (belge §3A): çevrimdışı paket, seyahat günlüğü, araç ekranı; kilit ekranı ve rotalarım ek giriş.
        {html: GM.satirlar([{ikon: 'cevrimdisi', baslik: 'Çevrimdışı rotalar', alt: 'Çekmeyen yolda harita, adres ve telefon', git: '#/rota/cevrimdisi', ok: true}, {ikon: 'gecmis', baslik: 'Seyahat günlüğü', alt: 'Tamamlanan rotalar ve duraklar', git: '#/rota/gunluk', ok: true}, {ikon: 'arac', baslik: 'Araç ekranı', alt: 'CarPlay ve Android Auto', git: '#/rota/arac', ok: true}, {ikon: 'mobile-screen', baslik: 'Kilit ekranı', alt: 'Canlı Etkinlik, Dinamik Ada ve yolculuk bildirimleri', git: '#/rota/telefon', ok: true}, {ikon: 'rota', baslik: 'Hazır rotalar', alt: 'Dada seçkisi pilot güzergâhlar', git: '#/rota/hazir', ok: true}])}
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
  // Görev 14/15: konum seçimi Google/Apple Maps alışkanlığında. Nereden / Nereye / ara durak alanına dokununca GM.konumSec (arama, Konumumu kullan + izin,
  // son aramalar, öneri şehirler); ⇅ kalkış ile varışı gerçekten değiştirir. Seçilen uçlardan pilot rota GM.rotaEslestir ile bulunur; yoksa dürüst boş hâl.
  // Rota seçenekleri: panelde Google Routes 3 alternatif döner (WEB-ENVANTERI §3.6); süre/km burada tahmindir. Durak sayısı veriden.
  const SECENEK = r => [
    {id: 'lezzet', ikon: 'neYenir', ad: 'Lezzet yolu', dk: r.dk + 26, km: Math.round(r.km + 18), alt: `${GM.rotaSayi(r).onerilen} önerilen durak${(r.iller || [])[1] ? ` · ${r.iller[1].ad} üzerinden` : ''}`},
    {id: 'hizli', ikon: 'bolt', ad: 'En hızlı', dk: r.dk, km: Math.round(r.km), alt: `${GM.rotaSayi(r).yolUstu} yol üstü durak · otoyol`},
    {id: 'sakin', ikon: 'leaf', ad: 'Sakin yol', dk: r.dk + 48, km: Math.round(r.km + 31), alt: 'Ücretli yol yok · köy lokantaları'}];
  // Web paritesi (Görev 11): pilot güzergâhlar, ara durakta tahmini bekleme (15–90 dk), tolerans "Özel km" (2–30), ara durak sınırı 3, Yeni rota.
  const SIRA = [['oneri', 'Önerilen'], ['sapma', 'En kısa sapma'], ['km', 'Km sırası'], ['acik', 'Açık olanlar önce']];
  const PILOT = ['istanbul-izmir', 'istanbul-ankara', 'ankara-antalya', 'istanbul-bursa', 'izmir-cesme'];
  const pd = () => ({bekle: 45, tol: '10', km: 12, nereden: GM.KONUMUM, nereye: null, ara: [], ...(GM.durum.oku('rota-planla', null) || {})});
  const pdYaz = d => GM.durum.yaz('rota-planla', {...pd(), ...d});
  let secAc = null; // #/rota "Nereye gidiyorsun?" → planla açılır açılmaz konum seçimi
  const pilotCip = serit => GM.cipler({ad: 'plan-pilot', serit, etiket: 'Pilot güzergâhlar', ogeler: PILOT.map(GM.rotaBul).filter(Boolean).map(r => ({metin: r.ad, ikon: 'rota', git: `#/rota/${r.id}`}))});
  GM.ekran('rota-planla', {
    tur: 'alt', baslik: 'Rota planla', ust: '#/rota',
    ustBar: ctx => (ctx.sorgu.adim === 'sonuc' ? {} : {sag: [{ikon: 'yenile', etiket: 'Yeni rota oluştur', veri: {eylem: 'plan-sifirla'}}]}),
    ciz: ctx => {
      const d = pd();
      if (ctx.sorgu.adim === 'sonuc') {
        const r = GM.rotaEslestir(d.nereden, d.nereye), bas = `${d.nereden.ad} → ${d.nereye?.ad || '…'}${d.ara.length ? ` · ${d.ara.length} ara durak` : ''}`;
        if (!r) return GM.bolumler([{html: GM.yigin([`<div class="gm-yigin-8"><p class="gm-t-label gm-ton-ikincil">${GM.esc(bas)}</p><h2 class="gm-t-section">Bu güzergâh henüz yok</h2></div>`, GM.p(`Dada Route şimdilik **pilot rotalarda** çalışıyor. **${d.nereden.il || d.nereden.ad}** çıkışlı bir güzergâh seç ya da varışı değiştir.`)], 16)},
          {baslik: 'Pilot güzergâhlar', html: pilotCip(false)}]);
        return `<div class="gm-ic gm-yigin-24"><div class="gm-yigin-8"><p class="gm-t-label gm-ton-ikincil">${GM.esc(bas)}</p><h2 class="gm-t-section">3 rota bulundu</h2></div>${GM.harita({ad: 'planla-sonuc', yukseklik: '220px', etkilesim: false, kontroller: false, rota: {cizgi: r.cizgi, alternatif: r.id === 'istanbul-izmir' ? GM.rotaBul('istanbul-bursa')?.cizgi : undefined}, pinler: [{lng: r.cizgi[0][0], lat: r.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic'}, {lng: r.cizgi.at(-1)[0], lat: r.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis'}]})}${GM.rotaSecenekler(SECENEK(r), {secili: 'lezzet', rozet: 'Önerilen'})}${GM.bilgi({ikon: 'bilgi', metin: 'Süreler trafiksiz tahmindir; mola süreleri ayrıca eklenir.'})}</div>`;
      }
      const satirlar = [{tur: 'bas', ad: d.nereden.ad, alt: d.nereden.alt, id: 'a'}, ...d.ara.map((x, i) => ({tur: 'ara', ad: x.ad, alt: `Tahmini bekleme ${x.bekle || d.bekle} dk`, id: `d${i}`})), {tur: 'son', ad: d.nereye?.ad, yer: 'Nereye gidiyorsun?', alt: d.nereye?.alt, id: 'b'}];
      return `<div class="gm-ic gm-yigin-24">${GM.durakDuzen(satirlar, {ekleMetin: 'Ara durak ekle (en çok 3)'})}
        ${GM.alan({etiket: 'Pilot güzergâhlar', html: pilotCip()})}
        ${GM.alan({etiket: 'Araç', html: GM.aracSecim({ad: 'arac', secili: GM.durum.oku('rota-arac', 'yakit') || 'yakit'})})}
        ${GM.alan({etiket: 'Duraklar rotadan en çok ne kadar saptırsın?', html: GM.segment({ad: 'tolerans', secili: d.tol, ogeler: [{ad: 'Yol üstü', deger: '0'}, {ad: '5 dk', deger: '5'}, {ad: '10 dk', deger: '10'}, {ad: '20 dk', deger: '20'}, {ad: d.tol === 'ozel' ? `${d.km} km` : 'Özel', deger: 'ozel'}]})})}
        <section class="gm-yigin-8"><p class="gm-t-label gm-ton-ikincil">İhtiyaçlar</p>${GM.toggle({ad: 'mola', ikon: 'dinlenme', etiket: 'Her 2 saatte bir mola öner', alt: 'Dinlenme alanı ya da konaklamalı yeme-içme', secili: true})}${GM.toggle({ad: 'ibadet', ikon: 'cami', etiket: 'Yol üstündeki ibadethaneleri göster', alt: 'Yol ayrım mesafesiyle'})}${GM.toggle({ad: 'alinir', ikon: 'neAlinir', etiket: 'Ne Alınır? duraklarını ekle', alt: 'Yöresel ürün ve kooperatifler', secili: true})}</section></div>`;
    },
    altBar: ctx => { if (ctx.sorgu.adim !== 'sonuc') return GM.altEylem({dugmeler: [{metin: 'Rotayı çiz', ikon: 'rota', veri: {eylem: 'plan-ciz'}, tam: true}]}); const d = pd(), r = GM.rotaEslestir(d.nereden, d.nereye);
      return r ? GM.altEylem({dugmeler: [{metin: 'Rotayı aç', ikon: 'harita', git: `#/rota/${r.id}`, tam: true}]}) : GM.altEylem({dugmeler: [{metin: 'Varışı değiştir', ikon: 'pin', veri: {eylem: 'plan-nereye'}, tam: true}]}); },
    sonra: (kok, ctx) => {
      if (ctx.sorgu.sec) { secAc = ctx.sorgu.sec; GM.yerine('#/rota/planla'); return null; }
      const kap = kok.closest('.gm-ekran') || kok;
      const ucSec = alan => { const d = pd(), nereden = alan === 'nereden';
        GM.konumSec({baslik: nereden ? 'Nereden?' : 'Nereye?', konumum: nereden, diger: nereden ? (d.nereye ? {etiket: 'Nereye', ad: d.nereye.ad} : null) : {etiket: 'Nereden', ad: d.nereden.ad}, haric: [nereden ? d.nereye?.ad : d.nereden.ad].filter(Boolean),
          sec: y => { pdYaz({[alan]: y}); if (ctx.sorgu.adim === 'sonuc') GM.yerine('#/rota/planla?adim=sonuc'); else GM.tazele(); }}); };
      // Özel mesafe (web "Rotadan en fazla uzaklık" 2–30 km, varsayılan 12): seçilince sheet açılır.
      const ozelKm = () => GM.sheet({baslik: 'Rotadan en fazla uzaklık', html: GM.yigin([GM.segment({ad: 'plan-km', etiket: 'Kilometre', secili: String(pd().km), ogeler: [2, 5, 8, 12, 20, 30].map(x => ({ad: `${x} km`, deger: String(x)}))}), GM.p('Mekân, rotaya bu mesafeden yakınsa önerilir. Sapma süresi gidiş-dönüş, 55 km/sa ile hesaplanır.', {ton: 'ikincil'})], 12),
        sonra: (k, h) => GM.on(k, 'plan-km', v => { pdYaz({tol: 'ozel', km: +v}); h.kapat(); GM.tazele(); GM.toast(`Rotadan en çok **${v} km** uzaklıktaki mekânlar`, {ikon: 'yon'}); })});
      const araNo = el => +String(el.closest('.gm-dd-satir')?.dataset.id || el.dataset.id || 'd0').slice(1);
      const c = [
        GM.eylem(kok, 'durak-ekle', () => { const d = pd(); if (d.ara.length >= 3) { GM.toast('Bu rotaya en fazla **3 ara durak** ekleyebilirsin. Yeni durak için birini kaldır.', {ikon: 'bilgi'}); return; }
          GM.konumSec({baslik: 'Ara durak ekle', konumum: false, haric: [d.nereden.ad, d.nereye?.ad, ...d.ara.map(x => x.ad)].filter(Boolean), sec: y => { pdYaz({ara: [...pd().ara, {...y, bekle: 45}]}); GM.tazele(); GM.toast(`**${y.ad}** ara durak oldu`, {tur: 'basari', ikon: 'pin'}); }}); }),
        GM.eylem(kok, 'durak-sil', el => { const once = pd().ara, i = araNo(el), x = once[i]; pdYaz({ara: once.filter((_, j) => j !== i)}); GM.tazele(); GM.toast(`**${x?.ad || 'Durak'}** kaldırıldı`, {eylem: 'Geri al', onEylem: () => { pdYaz({ara: once}); GM.tazele(); }}); }),
        GM.eylem(kok, 'durak-degistir', () => { const d = pd(); if (!d.nereye) { ucSec('nereye'); return; } pdYaz({nereden: d.nereye, nereye: d.nereden}); GM.tazele(); GM.toast(`Kalkış **${d.nereye.ad}**, varış **${d.nereden.ad}** oldu`, {ikon: 'muadil'}); }),
        // Kalkış ve varışta konum seçimi; ara durakta tahmini bekleme (web "Tahmini bekleme").
        GM.eylem(kok, 'durak-sec', el => { const sat = el.closest('.gm-dd-satir'); if (sat?.classList.contains('is-ara')) { const i = araNo(el), x = pd().ara[i]; GM.molaSec({ad: x.ad, dk: x.bekle || pd().bekle, sec: dk => { const l = pd().ara.slice(); l[i] = {...l[i], bekle: dk}; pdYaz({ara: l}); GM.tazele(); }}); } else ucSec(sat?.classList.contains('is-bas') ? 'nereden' : 'nereye'); }),
        GM.eylem(kap, 'plan-ciz', () => { if (!pd().nereye) { GM.toast('Önce **nereye** gideceğini seç', {ikon: 'pin'}); ucSec('nereye'); return; } GM.git('#/rota/planla?adim=sonuc'); }),
        GM.eylem(kap, 'plan-nereye', () => ucSec('nereye')),
        // Araç seçimi aktif haritayla ortak (rota-arac): Elektrikli'de şarj ve uzun mola durakları öne gelir.
        GM.on(kok, 'arac', v => GM.durum.yaz('rota-arac', v)),
        GM.on(kok, 'tolerans', v => (v === 'ozel' ? ozelKm() : pdYaz({tol: v}))),
        // Sırala (web durak sırası, J:261-303): ara durak sıralama ölçütü sheet'i; seçim kalıcı (rota-planla.sira), sheet'te işaretli.
        GM.eylem(kok, 'durak-sirala', () => GM.sheet({baslik: 'Ara durakları sırala', html: GM.yigin([GM.satirlar(SIRA.map(([deger, ad]) => ({ikon: 'sirala', baslik: ad, sag: (pd().sira || 'oneri') === deger ? GM.ik('onay') : '', veri: {eylem: 'plan-sira-sec', id: deger}}))), GM.p('Ara duraklar kalkış ile varış arasında bu ölçüte göre dizilir; rotada geri dönüş olmaz.', {ton: 'ikincil'})], 12),
          sonra: (k, h) => GM.eylem(k, 'plan-sira-sec', el => { const v = el.dataset.id; pdYaz({sira: v}); h.kapat(); GM.tazele(); GM.toast(`Ara duraklar **${SIRA.find(x => x[0] === v)[1].toLocaleLowerCase('tr')}** ölçütüyle dizildi`, {ikon: 'sirala'}); })})),
        GM.eylem(kap, 'plan-sifirla', () => { const once = pd(); GM.durum.yaz('rota-planla', {ara: [], nereye: null}); GM.tazele(); GM.toast('Yeni rota: duraklar ve seçimler **sıfırlandı**', {eylem: 'Geri al', onEylem: () => { GM.durum.yaz('rota-planla', once); GM.tazele(); }}); })];
      if (secAc && ctx.sorgu.adim !== 'sonuc') { const a = secAc; secAc = null; const t = setTimeout(() => { if (!document.querySelector('.gm-ra-ks-sheet')) ucSec(a); }, GM.azHareket() ? 0 :  GM.TK.motion.page); /* iki çizim aynı anda açmasın */ c.push(() => clearTimeout(t)); }
      return () => c.forEach(f => f());
    }
  });

  // ---------- (h) Yol takibi (Yola Çık; Görev 14/19: açık tema, Apple/Google Maps yol takibi dili) ----------
  // Plan: aktif haritada eklenen duraklar (km sırasıyla); yoksa Dada önerisi (yolun ortasına en yakın yakıt + 300. km sonrası ilk gurme durak).
  // Sıradaki = geçilmemiş ilk durak (Geç ile atlananlar rota-<id>.gecildi); hepsi geçildiyse varış. Konum: sıradakine 3 km kala (yaklaşım bildirimi anı).
  // Saatler şimdiki saatten, rotanın km/dk oranıyla (trafiksiz tahmin). Navigasyon harita uygulamasında; yol takibi durakları söyler.
  const ytVeri = ctx => {
    const R = GM.rotaBul(ctx.param.id) || R0(), K = GM.rotaKategori(R), d = GM.durum.oku(`rota-${R.id}`, null) || {}, E = GM.rotaEklenen(d, K);
    let P = E, oneri = false;
    if (!P.length) { oneri = true; const y = K.ogeler.yol.filter(k => k.tur === 'yakit').sort((a, b) => Math.abs(a.km - R.km / 2) - Math.abs(b.km - R.km / 2))[0], m = K.ogeler.neYenir.find(x => x.km > 300) || K.ogeler.neYenir.at(-1); P = [y, m].filter(Boolean).sort((a, b) => a.km - b.km); }
    const gec = new Set(d.gecildi || []), si = P.findIndex(x => !gec.has(x.id)), hedef = si < 0 ? null : P[si];
    const konumKm = Math.max(0, (hedef ? hedef.km : R.km) - 3), hiz = R.dk / R.km;
    const kumul = [0]; R.cizgi.forEach((p, n) => { if (n) kumul.push(kumul[n - 1] + GM.km(R.cizgi[n - 1], p)); });
    const top = kumul.at(-1), i = Math.max(1, kumul.findIndex(k => k >= konumKm / R.km * top)), konum = R.cizgi[i];
    const simdi = GM.simdi().getHours() * 60 + GM.simdi().getMinutes(), eta = km => GM.saatNokta(simdi + Math.round((km - konumKm) * hiz));
    return {R, K, d, E, P, oneri, gec, si, hedef, konumKm, konum, gecilen: R.cizgi.slice(0, i + 1), hiz, eta, kalanKm: Math.round(R.km - konumKm), kalanDk: Math.round((R.km - konumKm) * hiz),
      // Yaklaşım bandı (≤ 3 km): durak adı ve sapma kartta yazılı; bant yalnız anı ve soruyu söyler (tekrar yok).
      uyari: hedef ? {baslik: hedef.km - konumKm < 2 ? 'Durağa geldin' : 'Durağa yaklaşıyorsun', metin: '· durmak ister misin?'} : {baslik: 'Varışa yaklaşıyorsun', metin: '· bütün durakları geçtin'}};
  };
  const kmY = km => (km < 1 ? 'kalkışta' : `${GM.sayi(Math.round(km))}. km`);
  GM.ekran('rota-surus', {
    tur: 'tam', haller: false,
    ciz: ctx => {
      const v = ytVeri(ctx), {R, P, hedef, si, konumKm, konum} = v, m = hedef?.mekan, ses = GM.durum.oku('copilot-ses', true) !== false;
      const sonraki = si < 0 ? null : P[si + 1], uc = [konum, hedef ? [hedef.lng, hedef.lat] : R.cizgi.at(-1), ...(sonraki ? [[sonraki.lng, sonraki.lat]] : [])];
      const sinir = [[Math.min(...uc.map(q => q[0])), Math.min(...uc.map(q => q[1]))], [Math.max(...uc.map(q => q[0])), Math.max(...uc.map(q => q[1]))]];
      const gecildi = x => v.gec.has(x.id) || x.km < konumKm;
      const pinler = [{id: 'yt-varis', lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis', ad: R.varis}, ...P.map((x, n) => ({id: `yt-${x.id}`, lng: x.lng, lat: x.lat, sira: n + 1, ad: x.ad, soluk: gecildi(x), secili: n === si}))];
      const ust = GM.yolTakipUst({rota: `${R.kalkis} → ${R.varis}`, ses, varis: !hedef,
        sira: hedef ? {tur: m ? 'mekan' : hedef.tur, ad: hedef.ad, alt: m ? [m.kategori, m.ilce].filter(Boolean).join(' · ') : GM.KATMAN_AD[hedef.tur], gorsel: m?.kapak, uzak: `${Math.max(1, Math.round(hedef.km - konumKm))} km`, sure: `~${Math.max(1, Math.round((hedef.km - konumKm) * v.hiz))} dk`, sapma: hedef.sapma, yolUstu: hedef.uzak <= 1}
          : {tur: 'varis', ad: R.varis, alt: 'Rotanın sonu', uzak: '3 km', sure: `~${Math.max(1, Math.round(3 * v.hiz))} dk`}});
      // Zaman çizelgesi: kalkış · duraklar (geçildi / sıradaki / sonra) · varış; saatler tahmini.
      const satir = [{saat: v.eta(0), tur: 'uc', ikon: 'baslangic', etiket: 'Kalkış', baslik: R.kalkis, gecildi: true},
        ...P.map((x, n) => ({saat: v.eta(x.km), tur: x.tur === 'mekan' ? 'mekan' : 'katman', ikon: x.tur === 'mekan' ? 'mekan' : x.tur, etiket: gecildi(x) ? (v.gec.has(x.id) ? 'Atlandı' : 'Geçildi') : n === si ? 'Sıradaki' : 'Sonra', baslik: x.ad, alt: `${kmY(x.km)} · ${x.uzak <= 1 ? 'yol üstü' : `+${x.sapma} dk sapma`}`, gecildi: gecildi(x), simdi: n === si})),
        {saat: v.eta(R.km), tur: 'uc', ikon: 'varis', etiket: 'Varış', baslik: R.varis, alt: `${GM.sayi(v.kalanKm)} km kaldı`, simdi: si < 0}];
      const bas = GM.yigin([GM.rotaMetrik([{etiket: 'Varış', deger: v.eta(R.km)}, {etiket: 'Kalan süre', deger: GM.sure(v.kalanDk)}, {etiket: 'Kalan yol', deger: GM.sayi(v.kalanKm), birim: 'km'}]), GM.yolTakipEylem({gec: !!hedef, bitir: !hedef})], 12);
      return GM.haritaEkran({sinif: 'gm-yt',
        harita: GM.harita({ad: 'yt-h', tam: true, kontroller: false, rota: {cizgi: R.cizgi, gecilen: v.gecilen}, konum, yon: 200, sinir, dolgu: {top: 250, bottom: 230, left: 84, right: 84}, pinler, etiket: `${R.ad} yol takibi haritası`}),
        ust,
        cekmece: GM.cekmece({ad: 'yt-cekmece', durak: ['yarim', 'tam'].includes(ctx.sorgu.cekmece) ? ctx.sorgu.cekmece : 'kapali', bas, etiket: 'Yol takibi: duraklar', html: GM.krListe([GM.zamanAkis(satir)], {ikon: 'durak', baslik: `Duraklar · ${P.length}`, alt: v.oneri ? 'Henüz durak eklemedin; Dada’nın önerdiği duraklar' : 'Saatler trafiksiz tahmindir'})})
      });
    },
    sonra: (kok, ctx) => {
      const v = ytVeri(ctx), {R, P, hedef} = v, id = R.id;
      // Sesli uyarı aç/kapa (GM.durum copilot-ses): düğme yerinde güncellenir; yaklaşım bildirimi yazılı gelmeye devam eder.
      const sesYaz = b => { const ac = GM.durum.oku('copilot-ses', true) !== false; b.setAttribute('aria-label', ac ? 'Sesli uyarılar açık' : 'Sesli uyarılar kapalı'); b.innerHTML = GM.ik(ac ? 'sesli' : 'volume-xmark'); };
      const dYaz = e => GM.durum.yaz(`rota-${id}`, {...(GM.durum.oku(`rota-${id}`, null) || {}), ...e});
      const yenile = () => (ctx.sorgu.uyari || ctx.sorgu.cekmece ? GM.yerine(`#/rota/surus/${id}`) : GM.tazele());
      const c = [
        GM.eylem(kok, 'cp-ses', b => { const ac = !(GM.durum.oku('copilot-ses', true) !== false); GM.durum.yaz('copilot-ses', ac); sesYaz(b); GM.titres?.(); GM.toast(ac ? '**Sesli uyarılar açık** · durağa 3 km kala okunur' : '**Sesli uyarılar kapalı** · uyarılar yalnız yazılı gelir', {ikon: ac ? 'sesli' : 'volume-xmark'}); }),
        // Geç: sıradaki durak atlanır, bir sonraki gelir (Geri al). Varışta düğme yok.
        GM.eylem(kok, 'cp-gec', () => { if (!hedef) return; const once = v.d.gecildi || []; dYaz({gecildi: [...new Set([...once, hedef.id])]}); const s = P[v.si + 1]; GM.toast(`**${hedef.ad}** atlandı · sıradaki ${s ? `**${s.ad}**` : `varış **${R.varis}**`}`, {eylem: 'Geri al', onEylem: () => { dYaz({gecildi: once}); yenile(); }}); yenile(); }),
        // Varış: yolculuk biter, Seyahat günlüğü açılır (Görev 14/20: varışta yolculuğu kapatacak eylem yoktu).
        GM.eylem(kok, 'cp-bitir', () => { dYaz({gecildi: []}); GM.git('#/rota/gunluk'); GM.toast(`**${R.ad}** yolculuğu bitti · durakların günlükte`, {tur: 'basari', ikon: 'varis'}); }),
        GM.eylem(kok, 'cp-nav', () => GM.aktarSheet({rota: R, duraklar: P.filter(x => !v.gec.has(x.id) && x.km >= v.konumKm)})),
        // Durak ekle: rotadaki mekânlar (14 hızlı filtre); eklenen durak km sırasıyla çizelgeye girer.
        GM.eylem(kok, 'cp-ekle', () => GM.rotaMekanlarSheet({rota: R, filtre: 'dk10', eklenen: () => (GM.durum.oku(`rota-${id}`, null) || {}).eklenen || [], ekle: x => { const e = (GM.durum.oku(`rota-${id}`, null) || {}).eklenen || []; dYaz({eklenen: [...new Set([...e, x.slug])]}); GM.toast(`**${x.mekan.ad}** durak oldu · ${kmY(x.km)}`, {tur: 'basari'}); yenile(); }, cikar: x => { const e = (GM.durum.oku(`rota-${id}`, null) || {}).eklenen || []; dYaz({eklenen: e.filter(s => s !== x.slug)}); yenile(); }}))
      ];
      // Çekmece başına dokunuş: kapalı → yarım → tam → yarım (sürüklemeye ek).
      const basTik = ev => { const t = ev.target.closest('.gm-kl-cekmece-tut'); if (!t || ev.target.closest('button,a')) return; const e = kok.querySelector('.gm-kl-cekmece'), dd = e?.dataset.durak; GM.cekmeceDurak(e, dd === 'kapali' ? 'yarim' : dd === 'yarim' ? 'tam' : 'yarim'); };
      kok.addEventListener('click', basTik); c.push(() => kok.removeEventListener('click', basTik));
      // Geo-fencing (belge §3E): sıradaki durağa 3 km kala yaklaşım bildirimi kendiliğinden gelir (sesli + yazılı); ?uyari=1 doğrudan açık, ?uyari=0 kapalı.
      const goster = () => { const g = kok.querySelector('[data-yt-uyari]'); if (!g || g.firstChild) return; g.innerHTML = GM.yaklasmaUyari(v.uyari); GM.titres?.(20); };
      if (ctx.sorgu.uyari === '1') goster(); else if (ctx.sorgu.uyari == null) { const t = setTimeout(goster, 2400); c.push(() => clearTimeout(t)); }
      return () => c.forEach(f => f());
    }
  });
})();
/* #/rota/:id aktif rota haritası, #/rota/liste/:id ve #/rota/web/:id: ekranlar/rota-aktif.js (Görev 12, patron mimari belgesi). */
