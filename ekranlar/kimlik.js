/* Görev 12 · paket kimlik: açılış ve kimlik ekranları (Dada Diet mobil splash, karsilama, onboarding, giris, kilit ile birebir yapı; içerik Gourmet web giris/, kayit/, sifremi-unuttum/, sifre-yenile/).
 * Ekranlar (ad · rota): splash #/splash · karsilama #/karsilama · onboarding #/onboarding?adim=konum|bildirim|tercih · giris #/giris · kayit #/kayit
 *   · sifre #/sifremi-unuttum · iki-adim #/iki-adim · kilit #/kilit. Hepsi akış ekranıdır (haller: false); ekrana özgü hâller ?hal= ile:
 *   giris: hatali, kilitli (deneme hakkı bitti), cok-deneme (429, geri sayım), hizli (kayıtlı hesapla biyometrik giriş), hata (ilk denemede bağlantı hatası), cevrimdisi
 *   kayit: eposta-var, tamam (hesap hazır + Dada Puan açıldı), hata, cevrimdisi; ?adim=dogrula e-posta doğrulama (?hal=zaten|gecersiz)
 *   sifre: ?adim=gonderildi|yeni, ?hal=sure-doldu (?adim=yeni&hal=sure-doldu), hata, cevrimdisi
 *   iki-adim: hatali, kilitli (?mod=kurtarma kurtarma kodu), hata, cevrimdisi
 *   onboarding: red (bulunulan izin adımında reddedildi hâli)
 *   karsilama: açılış intro'su (Gastro vitrini; ?modul=1–4, ?kal=1 döngüsüz, ?intro=1 baştan — ilk açılışta bir kez, durum 'intro')
 *   kilit: basarisiz, kilitlendi, iptal, kullanilamaz (?dene=1 Ayarlar'dan deneme, ?platform=ios|ios-touch|android, ?sonuc=basarisiz|kilitlendi)
 * Hesap verisi GMX.hesap (ekranlar/profil-veri.js): giris {eposta, sifre, denemeHakki, kilitDk, kodUzunluk, ikiAdimKod, yenidenGonderSn, baglantiDk, kurtarmaKodlari, sifreKurali, sifreKurallari},
 *   kullanici, bildirimTurleri, tercihGruplari, rutbeler, puanKurallari. Gourmet'te sağlık verisi yok, açık rıza adımı yok.
 * Durum anahtarları: 'oturum' {yol, yeni, misafirden} (yeni hesapta GM.yeniHesap() true; kayıtlı hesabın verisi okunmaz) · 'son-hesap' {eposta, ad} (Beni hatırla: hızlı giriş)
 *   · 'hesap-ayar'.guvenlik {sifre, sifreTarih, ikiAdim, yontem, kurtarmaKalan, kullanilan} · 'hesap-ayar'.profil {ad, soyad, eposta, telefon} · 'dada-puan' {bakiye, bekleyen, rutbe, acilis}
 *   · 'onboarding' {adim, konum, bildirim, bitti} · 'konum-izin' / 'bildirim-izin' 'verildi'|'reddedildi'|'sonra' · 'bildirim-ayar' {rezervasyon, ogle, aksam}
 *   · 'kesif-tercih' {mutfak, konsept, ortam} (GMX.hesap.tercihGruplari adları) · 'uygulama-kilidi' {acik, gecikme, platform, faceIzin, sonAcilis, bekliyor, sonra}.
 * Uygulama kilidi (GM.uygulamaKilidi: durum, yaz, cihaz, istem, kilitli, GECIKME, gecikmeAd; Ayarlar › Güvenlik okur): üye + kilit açıkken soğuk açılışta splash #/kilit'e geçer,
 *   arka plandan dönüşte seçilen gecikme geçtiyse bulunulan ekranın yerine kilit açılır; açılınca ?sonra adresine dönülür. "Şifreyle aç" #/giris?sonra=… ile girer. */
(() => {
  const enc = encodeURIComponent;
  const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const VARSAYILAN = {denemeHakki: 5, kilitDk: 15, kodUzunluk: 6, yenidenGonderSn: 30, baglantiDk: 30, kurtarmaKodlari: [], sifreKurallari: [], sifreKurali: ''};
  const HS = () => window.GMX?.hesap || {};
  const G = () => ({...VARSAYILAN, ...(HS().giris || {})});
  const KUL = () => HS().kullanici || {};
  const SSO = [{yol: 'apple', ad: 'Apple', metin: 'Apple ile devam et', marka: 'apple'}, {yol: 'google', ad: 'Google', metin: 'Google ile devam et', gorsel: 'assets/marka/sosyal/google.svg'}];
  const bekle = n => (GM.azHareket() ? 0 : GM.TK.motion.reveal * n);
  const yol = ctx => ctx.hash.split('?')[0];
  const halsiz = h => h.replace(/([?&])hal=[^&]*&?/, '$1').replace(/[?&]$/, '');
  const ayirac = '<p class="gm-t-meta gm-ton-ikincil gm-orta-metin" data-gm-hece="yok">ya da e-posta ile</p>';
  const ssoIkili = eylem => `<div class="gm-ikili">${SSO.map(b => GM.btn({metin: b.ad, etiket: b.metin, tur: 'secondary', ...(b.gorsel ? {gorsel: b.gorsel} : {marka: b.marka}), veri: {eylem, id: b.yol}})).join('')}</div>`;
  const mekanGorsel = (...sluglar) => { const l = window.GMV?.mekanlar || []; const m = sluglar.map(s => l.find(x => x.slug === s)).find(x => x?.kapakB) || l.find(x => x.kapakB); return m?.kapakB || m?.kapak || ''; };

  // ---------- Ortak durum ----------
  const tum = () => GM.durum.oku('hesap-ayar', {}) || {};
  const ayarYaz = (b, ek) => { const t = tum(); GM.durum.yaz('hesap-ayar', {...t, [b]: {...(t[b] || {}), ...ek}}); };
  const guvenlik = () => ({ikiAdim: false, yontem: 'sms', ...(tum().guvenlik || {})});
  const kayitliSifre = () => tum().guvenlik?.sifre || G().sifre;
  const telefon = () => tum().profil?.telefon || KUL().telefon || '';
  const tamAd = () => [KUL().ad, KUL().soyad].filter(Boolean).join(' ');
  const sonHesap = () => GM.durum.oku('son-hesap', null);

  // Ağ: navigator çevrimdışıysa ya da ?hal=hata ilk denemedeyse bağlantı hatası (her ekranda bir kez). ?hal=cevrimdisi ağ şart ekranlarda bağlantı hatası ekranı.
  const baglantiYok = ctx => {
    if (navigator.onLine === false) return true;
    if (ctx.sorgu.hal === 'hata' && !ctx.hataGosterildi) { ctx.hataGosterildi = true; return true; }
    return false;
  };
  const baglantiToast = () => GM.toast('**Bağlantı yok.** Bağlanınca yeniden dene.', {tur: 'hata'});
  const cevrimdisi = ctx => ctx.sorgu.hal === 'cevrimdisi';
  const cevrimdisiEkran = ctx => `${GM.cevrimdisi('Çevrimdışısın')}${GM.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: halsiz(ctx.hash)}, ikinciller: []})}`;

  // Platform: ?platform=ios|ios-touch|android (uygulama kilidinde kalır) → kayıtlı → tarayıcı. Sistem uyarısı ios | android.
  const PLATFORM = ['ios', 'ios-touch', 'android'];
  const KILIT = 'uygulama-kilidi';
  const kilitDurum = () => ({acik: false, gecikme: 'hemen', ...(GM.durum.oku(KILIT, {}) || {})});
  const kilitYaz = ek => GM.durum.yaz(KILIT, {...kilitDurum(), ...ek});
  const platform = () => {
    const s = new URLSearchParams(location.hash.split('?')[1] || '').get('platform');
    if (PLATFORM.includes(s)) { if (kilitDurum().platform !== s) kilitYaz({platform: s}); return s; }
    const k = kilitDurum().platform;
    return PLATFORM.includes(k) ? k : /Android/i.test(navigator.userAgent) ? 'android' : 'ios';
  };
  const sistem = () => (platform() === 'android' ? 'android' : 'ios');

  // Oturum açılışı: kayıtlı hesap ({yol}) ya da yeni hesap ({yol, yeni, misafirden}: misafirin cihazdaki kayıtları hesaba geçer, kayıtlı hesabın verisi okunmaz).
  const oturumYaz = (yolAd, yeni) => {
    GM.durum.yaz('oturum', yeni ? {yol: yolAd, yeni: true, misafirden: true} : {yol: yolAd});
    if (kilitDurum().bekliyor) kilitYaz({bekliyor: false, sonAcilis: Date.now()});
  };
  const puanAc = () => { if (!GM.durum.oku('dada-puan')) GM.durum.yaz('dada-puan', {bakiye: 0, bekleyen: 0, rutbe: HS().rutbeler?.[0]?.k || 'merakli', acilis: GM.simdi().toISOString().slice(0, 10)}); };
  const onbBitti = () => !!GM.durum.oku('onboarding', {})?.bitti;
  const sonrakiAcilis = () => (onbBitti() ? '#/kesfet' : '#/onboarding');

  // ---------- Uygulama kilidi ----------
  const P = {
    ios: {ad: 'Face ID', ikon: 'yuz-tarama', ac: 'Face ID ile aç', giris: 'Face ID ile giriş yap', tanimadi: 'Face ID seni tanımadı', ipucu: 'Yüzünü telefona dönük tut, ön kamerayı elinle örtme.', kullanilamaz: {baslik: 'Face ID izni kapalı', metin: 'Telefonunun **Ayarlar › Dada Gourmet** bölümünden Face ID’ye izin ver. O zamana dek şifrenle açarsın.'}},
    'ios-touch': {ad: 'Touch ID', ikon: 'fingerprint', ac: 'Touch ID ile aç', giris: 'Touch ID ile giriş yap', tanimadi: 'Touch ID parmak izini tanımadı', ipucu: 'Parmağını kuru tut ve düğmeye tam yerleştir.', kullanilamaz: {baslik: 'Touch ID kurulu değil', metin: 'Telefonunun **Ayarlar › Touch ID ve Parola** bölümünden parmak izi ekle. O zamana dek şifrenle açarsın.'}},
    android: {ad: 'Parmak izi ya da yüz', ikon: 'fingerprint', ac: 'Parmak iziyle aç', giris: 'Parmak iziyle giriş yap', tanimadi: 'Parmak izin tanınmadı', ipucu: 'Parmağını kuru tut ve sensörün tamamına yerleştir.', kullanilamaz: {baslik: 'Parmak izi ya da yüz kayıtlı değil', metin: '**Güvenlik ayarlarından** parmak izi ya da yüz ekle. O zamana dek şifrenle açarsın.'}}
  };
  const GECIKME = [['hemen', 'Hemen', 'bolt'], ['1', '1 dakika sonra', 'clock'], ['5', '5 dakika sonra', 'hourglass-half']];
  const GECIKME_MS = {hemen: 0, 1: 60e3, 5: 300e3};
  // Dönüş adresi olamayanlar: açılış ve kimlik akışı.
  const DONUSSUZ = /^#\/(splash|karsilama|onboarding|kilit|giris|kayit|iki-adim|sifremi-unuttum)(?=[/?]|$)|^#\/?$/;
  const donus = h => (h && h.startsWith('#/') && !DONUSSUZ.test(h) ? h : null);
  const kilitli = () => kilitDurum().acik && GM.uye();
  const cihaz = () => { const p = platform(); return {platform: p, ios: p !== 'android', ...P[p]}; };
  const kilitAdres = (h, oto) => { const s = donus(h) || kilitDurum().sonra || '#/kesfet'; kilitYaz({bekliyor: true, sonra: s}); return `#/kilit?sonra=${enc(s)}${oto ? '&oto=1' : ''}`; };
  // Biyometrik istem: iOS'ta Face ID ilk kullanımda telefonun sistem uyarısıyla izin sorulur, sonra kanon GM.biyometrikIstem.
  // → Promise<'basari'|'basarisiz'|'iptal'|'sifre'|'izin-yok'>
  const istem = (o = {}) => {
    const c = cihaz();
    const izin = c.platform !== 'ios' ? Promise.resolve(true)
      : kilitDurum().faceIzin === true ? Promise.resolve(true)
      : kilitDurum().faceIzin === false ? Promise.resolve(false)
      : GM.sistemUyari({platform: 'ios', baslik: '“Dada Gourmet” Face ID kullanmak istiyor', metin: 'Uygulamayı açarken ve giriş yaparken kimliğini doğrulamak için Face ID kullanılır.', red: 'İzin Verme', ver: 'İzin Ver'}).then(ok => { if (ok !== null) kilitYaz({faceIzin: ok}); return ok; });
    return izin.then(ok => (ok === null ? 'iptal' : ok ? GM.biyometrikIstem({platform: c.platform, neden: o.neden || 'Dada Gourmet’i açmak için', sonuc: o.sonuc}) : 'izin-yok'));
  };
  GM.uygulamaKilidi = {durum: kilitDurum, yaz: kilitYaz, cihaz, istem, kilitli, GECIKME, gecikmeAd: v => (GECIKME.find(([k]) => k === v) || GECIKME[0])[1]};
  // Arka plandan dönüş: seçilen gecikme geçtiyse bulunulan ekranın yerine kilit (geri tuşu kilidi atlamaz); açılınca o ekrana dönülür.
  let gizlendi = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { gizlendi = Date.now(); return; }
    const a = GM.aktif()?.hash || location.hash;
    if (!gizlendi || !kilitli() || DONUSSUZ.test(a) || Date.now() - gizlendi < (GECIKME_MS[kilitDurum().gecikme] ?? 0)) return;
    gizlendi = 0; GM.yerine(kilitAdres(a, true));
  });

  // ---------- Açılış intro'su (Gastro birebir: Açılış kolajı → Karşılama vitrini → tercihler) ----------
  // İlk açılışta bir kez: splash 'intro' bayrağı yoksa karşılamaya, varsa Keşfet'e geçer. Bayrak Atla, Başla ya da Giriş yap ile yazılır (GM.durum, localStorage try/catch).
  // ?intro=1 (adres ya da sayfa sorgusu; menüdeki "Intro'yu tekrar göster") bayrağı siler ve ilk açılış sırasını baştan oynatır: kolaj (splash) → karşılama.
  const INTRO = 'intro';
  const introBitir = () => GM.durum.yaz(INTRO, 'tamam');
  try {
    if (/[?&]intro=1\b/.test(`${location.search}${location.hash}`)) {
      GM.durum.sil(INTRO);
      if (!/^#\/(splash|karsilama)(?=[?]|$)/.test(location.hash)) history.replaceState(null, '', `${location.pathname}#/splash`);
    }
  } catch { /* yok */ }

  // ---------- Splash ----------
  // Mekân kolajı, mor perde ve logo (kanon GM.acilis = Gastro Açılış · Kolaj). Dokununca hemen geçer.
  // Üye Keşfet (kilit açıksa önce kilit); onboarding'i yarıda bırakan kaldığı adıma; intro'yu görmeyen karşılamaya; gören Keşfet'e.
  const splashHedef = () => {
    if (GM.uye()) return kilitli() ? kilitAdres('#/kesfet', true) : '#/kesfet';
    const o = GM.durum.oku('onboarding', {}) || {};
    if (o.adim && !o.bitti) return `#/onboarding?adim=${o.adim}`;
    return GM.durum.oku(INTRO) === 'tamam' || o.bitti ? '#/kesfet' : '#/karsilama';
  };
  GM.ekran('splash', {
    haller: false,
    tur: 'tam',
    // Koyu kök (kanon html.gm-ac-koyu): ilk yüklemede index.html koyar; menüden (#/splash?intro=1) gelişte burada eklenir, GM.acilisCik kaldırır.
    ciz: ctx => { if (ctx.sorgu.intro === '1') GM.durum.sil(INTRO); document.documentElement.classList.add('gm-ac-koyu'); return GM.acilis({gorseller: (window.GMV?.mekanlar || []).filter(m => m.kapak).slice(0, 15).map(m => m.kapak)}); },
    sonra: kok => {
      // Süre Gastro Açılış · Kolaj ile aynı: reveal × 5 (azaltılmış harekette reveal); çıkış GM.acilisCik (düzleşme + 1.08 + solma, base sonra geçiş).
      const gec = () => GM.acilisCik(kok, () => GM.yerine(splashHedef()));
      const zaman = setTimeout(gec, GM.azHareket() ? GM.TK.motion.reveal : GM.TK.motion.reveal * 5), bag = GM.eylem(kok, 'gec', gec);
      return () => { clearTimeout(zaman); bag(); };
    }
  });

  const bagla = (metin, bag) => bag.reduce((p, [ad, git]) => p.replace(GM.esc(ad), `<a href="${git}" data-git="${git}">${GM.esc(ad)}</a>`), metin);
  const ssoGiris = (el, ctx, yeni) => {
    if (navigator.onLine === false || (ctx && baglantiYok(ctx))) { baglantiToast(); return; }
    const b = SSO.find(x => x.yol === el.dataset.id);
    GM.mesgul(el, bekle(2)).then(() => {
      if (yeni) {
        oturumYaz(b.yol, true); puanAc();
        GM.yerine(sonrakiAcilis());
        GM.toast(`**${b.ad}** ile hesabın açıldı; **Dada Puan** bakiyen hazır`, {tur: 'basari'});
        return;
      }
      girisTamam(b.yol);
    });
  };

  // ---------- Karşılama · Vitrin (açılış intro'su) ----------
  // Gastro karşılama vitrini birebir: gülücük kapakta modülün gerçek görseli, logo üstte; modül ikonu, adı, kısa açıklaması ve kanıt satırı (GMV sayıları) altta.
  // Altta modül ikon seçici (nokta göstergesi; seçilinin üstünde çizgi) ve "Hesabın var mı? Giriş yap · Üye ol"; çubukta Atla (→ Keşfet) · Başla (→ onboarding).
  // Modüller kendiliğinden döner (heroAutoplay); dokunma, seçici ya da kapakta yatay kaydırma döngüyü durdurur. ?modul=1–4 başlangıç modülü, ?kal=1 döngüsüz.
  // Görseller ana sayfa hero'su (Narımor, Levan, Townhouse, sokak), giriş (Levan) ve kilit (Lacivert) kapaklarıyla çakışmaz.
  const vitrin = () => {
    const V = window.GMV || {}, M = V.mekanlar || [], R = V.rotalar || [], E = V.etkinlikler || [], L = V.lezzetler || [];
    const sehir = new Set(M.map(m => m.il).filter(Boolean)).size;   // etkinlik görselleri 400 px: tam ekran kapakta bulanık kalır, 800 px mekân kapağı kullanılır
    return [
      {ad: 'Mekânlar', ikon: 'mekan', gorsel: mekanGorsel('360-istanbul'), kisa: 'Mutfağa, şehre ve fiyata göre bul.', kanit: ['pin', `${GM.sayi(M.length)} mekân · ${sehir} şehir`]},
      {ad: 'Dada Route', ikon: 'rota', gorsel: mekanGorsel('karnas-vineyards-bodrum'), kisa: 'Yol üstündeki lezzet duraklarını bul.', kanit: ['rota', `${R.length} hazır rota${R[0] ? ` · ${R[0].ad}` : ''}`]},
      {ad: 'Etkinlik ve Lezzet', ikon: 'etkinlik', gorsel: mekanGorsel('herise-istanbul', 'giritli-restoran'), kisa: 'Festivaller, tadımlar ve gurme yazılar.', kanit: ['etkinlik', `${GM.sayi(E.length)} etkinlik · ${GM.sayi(L.length)} lezzet yazısı`]},
      {ad: 'Profilim', ikon: 'favori', gorsel: mekanGorsel('aida-vino-e-cucina'), kisa: 'Kaydet, listeni kur, puan topla.', kanit: ['puanDada', 'Dada Puan ve rozetler']}
    ];
  };
  const modMetin = m => `<div class="gm-ac-metin gm-ac-gir" aria-live="polite"><div class="gm-ac-bas"><span class="gm-ac-mikon">${GM.ik(m.ikon)}</span></div><h1 class="gm-t-display">${GM.esc(m.ad)}</h1><p class="gm-t-body">${GM.esc(m.kisa)}</p><p class="gm-ac-kanit">${GM.ik(m.kanit[0])}<span>${GM.esc(m.kanit[1])}</span></p></div>`;
  const KAYDIR = 40;   // px: yatay kaydırma eşiği
  GM.ekran('karsilama', {
    haller: false,
    tur: 'tam',
    ciz: ctx => {
      if (ctx.sorgu.intro === '1') GM.durum.sil(INTRO);
      const MOD = vitrin(), i = Math.max(0, Math.min(MOD.length - 1, (Number(ctx.sorgu.modul) || 1) - 1));
      ctx.mod = ctx.mod ?? i;
      const m = MOD[ctx.mod];
      const kapak = GM.gulucuk({gorsel: m.gorsel, sinif: 'gm-ac-kapak', icerik: `<img class="gm-ac-logo" src="assets/marka/dadagourmet-beyaz.svg" alt="Dada Gourmet"><div data-metin data-gm-veil-from>${modMetin(m)}</div>`});
      const secici = `<div class="gm-ac-secici" role="group" aria-label="Dada Gourmet'i tanı" style="--n:${MOD.length}">${MOD.map((x, k) => `<button type="button" data-mod="${k}" aria-pressed="${k === ctx.mod}" aria-label="${GM.esc(x.ad)}"><span class="gm-ac-mikon">${GM.ik(x.ikon)}</span></button>`).join('')}</div>`;
      const giris = `<p class="gm-ac-giris">Hesabın var mı? <a href="#/giris" data-git="#/giris" data-intro-bitti>Giriş yap</a> · <a href="#/kayit" data-git="#/kayit" data-intro-bitti>Üye ol</a></p>`;
      return `<div class="gm-ac-k3">${kapak}<div class="gm-ac-alt">${secici}${giris}</div></div>`;
    },
    altBar: () => GM.altEylem({dugmeler: [{metin: 'Atla', tur: 'secondary', veri: {eylem: 'atla'}}, {metin: 'Başla', ikon: 'tumu', veri: {eylem: 'basla'}}]}),
    sonra: (kok, ctx) => {
      const MOD = vitrin();
      MOD.forEach(x => { if (x.gorsel) new Image().src = x.gorsel; });
      const sahne = kok.querySelector('.gm-gkapak'), metin = kok.querySelector('[data-metin]'), dugme = [...kok.querySelectorAll('[data-mod]')];
      let zaman = 0, dur = GM.azHareket() || ctx.sorgu.kal === '1';
      const perde = () => { if (!window.GMCard) return; delete sahne.dataset.perde; GMCard.veils(kok); };
      const sira = () => { clearTimeout(zaman); if (!dur) zaman = setTimeout(() => { if (!kok.isConnected) return; if (kok.closest('.is-gizli') || document.hidden) { sira(); return; } goster(ctx.mod + 1); }, GM.TK.motion.heroAutoplay); };
      const goster = k => {
        ctx.mod = (k + MOD.length) % MOD.length;
        const m = MOD[ctx.mod];
        sahne.style.backgroundImage = `url('${m.gorsel}')`;
        dugme.forEach((b, j) => b.setAttribute('aria-pressed', String(j === ctx.mod)));
        metin.innerHTML = modMetin(m); perde();
        sira();
      };
      const durdur = () => { dur = true; clearTimeout(zaman); };
      const tik = ev => {
        const b = ev.target.closest('[data-mod]');
        if (b) { durdur(); goster(Number(b.dataset.mod)); return; }
        if (ev.target.closest('[data-intro-bitti]')) introBitir();
      };
      // Kapakta yatay kaydırma: sola sonraki, sağa önceki modül (dikey kaydırma sayfada kalır).
      let x0 = null, y0 = 0;
      const bas = ev => { x0 = ev.clientX; y0 = ev.clientY; };
      const birak = ev => {
        if (x0 == null) return;
        const dx = ev.clientX - x0, dy = ev.clientY - y0; x0 = null;
        if (Math.abs(dx) < KAYDIR || Math.abs(dx) < Math.abs(dy)) return;
        durdur(); goster(ctx.mod + (dx < 0 ? 1 : -1));
      };
      kok.addEventListener('click', tik);
      sahne.addEventListener('pointerdown', bas); sahne.addEventListener('pointerup', birak); sahne.addEventListener('pointercancel', () => { x0 = null; });
      const c = [
        GM.eylem(kok, 'atla', () => { introBitir(); GM.yerine('#/kesfet'); }),
        GM.eylem(kok, 'basla', () => { introBitir(); GM.yerine(sonrakiAcilis()); })
      ];
      document.fonts?.ready.then(perde);
      sira();
      return () => { clearTimeout(zaman); kok.removeEventListener('click', tik); sahne.removeEventListener('pointerdown', bas); sahne.removeEventListener('pointerup', birak); c.forEach(f => f()); };
    }
  });

  // ---------- Onboarding ----------
  // Tek soru tek adım (Diet onboarding kalıbı, GM.onbSablon): konum izni → bildirim izni → keşif tercihleri → #/kesfet. Adım ?adim= ile yığına girer, geri tuşu çalışır.
  // İzin adımları telefonun sistem uyarısını açar (GM.sistemUyari, platforma göre); reddedilince adım red hâline geçer (?hal=red ile de), Ayarları aç izni verilmiş sayar.
  const ADIMLAR = ['konum', 'bildirim', 'tercih'];
  const ONB = 'onboarding';
  const onb = () => GM.durum.oku(ONB, {}) || {};
  const onbYaz = ek => GM.durum.yaz(ONB, {...onb(), ...ek});
  const adimAl = ctx => (ADIMLAR.includes(ctx.sorgu.adim) ? ctx.sorgu.adim : ADIMLAR.find(a => onb()[a] == null) || ADIMLAR[0]);
  const BILDIRIM = ['rezervasyon', 'ogle', 'aksam'];
  const bildirimSecim = () => ({rezervasyon: true, ogle: true, aksam: true, ...(onb().bildirimSecim || {})});
  const TERCIH = ['mutfak', 'konsept', 'ortam'];
  const tercihGrup = a => (HS().tercihGruplari || []).find(g => g.a === a);
  const tercihler = () => ({mutfak: [], konsept: [], ortam: [], ...(GM.durum.oku('kesif-tercih', {}) || {})});
  const tercihSayi = t => TERCIH.reduce((n, a) => n + (t[a]?.length || 0), 0);
  const NEDEN = {
    konum: {baslik: 'Konumunu neden istiyoruz?', metin: 'Konumun **yakınındaki mekânları** sıralamak, haritayı bulunduğun yerden açmak ve Dada Route’ta yol üstündeki durakları önermek için kullanılır. Yalnız uygulama açıkken okunur; reklam için kullanılmaz.', bag: ['Konum Verisi Politikası', '#/yasal/konum-verisi']},
    bildirim: {baslik: 'Hangi bildirimler gelir?', metin: 'Yalnız seçtiğin türler gelir. Öğle önerisi **12.30**, akşam önerisi **19.00** civarında; rezervasyon hatırlatması masandan önce. Güvenlik uyarıları her zaman açıktır.', bag: ['Bildirim tercihleri', '#/ayarlar/bildirimler']}
  };
  const redBant = a => (a === 'konum'
    ? GM.bant({ton: 'uyari', baslik: 'Konum izni kapalı', metin: 'Harita ve vitrin **seçtiğin şehre** göre açılır. İzni telefonunun **Ayarlar › Dada Gourmet › Konum** bölümünden açabilirsin.', eylem: {metin: 'Ayarları aç', veri: {eylem: 'ayar'}}})
    : GM.bant({ton: 'uyari', baslik: 'Bildirim izni kapalı', metin: 'Rezervasyon onayın ve hatırlatmaların **e-postayla** gelir. İzni telefonunun **Ayarlar › Bildirimler** bölümünden açabilirsin.', eylem: {metin: 'Ayarları aç', veri: {eylem: 'ayar'}}}));
  const onbRed = (ctx, a) => (a === 'konum' || a === 'bildirim') && (onb()[a] === 'reddedildi' || ctx.sorgu.hal === 'red');
  const adimHtml = ctx => {
    const a = adimAl(ctx), n = ADIMLAR.indexOf(a) + 1, red = onbRed(ctx, a);
    const ortak = {adim: n, toplam: ADIMLAR.length};
    if (a === 'konum') return GM.onbSablon({...ortak,
      baslik: 'Yakınındaki sofraları gösterelim', alt: 'Harita ve vitrin **konumuna göre** sıralanır.', neden: 'Konumum nasıl kullanılır?',
      atla: red ? null : {metin: 'Şimdi değil', veri: {eylem: 'atla'}},
      devam: red ? {metin: 'Devam', ikon: 'tumu', veri: {eylem: 'ileri'}} : {metin: 'Konumuma izin ver', ikon: 'konum', veri: {eylem: 'izin'}},
      html: red ? redBant(a) : `<div class="gm-yigin-24">${GM.maddeler([['pin', 'Yakınındaki mekânlar', 'Vitrin ve harita bulunduğun yerden başlar.'], ['rota', 'Yol üstü duraklar', 'Dada Route rotandaki sofraları konumuna göre sıralar.'], ['saatler', 'Şu an açık olanlar', 'Yakınında açık mekânları önce görürsün.']])}</div>`
    });
    if (a === 'bildirim') {
      const s = bildirimSecim(), turler = (HS().bildirimTurleri || []).filter(t => BILDIRIM.includes(t.id));
      return GM.onbSablon({...ortak,
        baslik: 'Doğru saatte haber verelim', alt: 'Öğle ve akşam **yakındaki öneriler**, masan yaklaşınca hatırlatma.', neden: 'Hangi bildirimler gelir?',
        atla: red ? null : {metin: 'Şimdi değil', veri: {eylem: 'atla'}},
        devam: red ? {metin: 'Devam', ikon: 'tumu', veri: {eylem: 'ileri'}} : {metin: 'Bildirimlere izin ver', ikon: 'bildirim', veri: {eylem: 'izin'}},
        html: red ? redBant(a) : `<div class="gm-yigin-24">${GM.satirlar(turler.map(t => GM.toggle({ad: `bildirim-${t.id}`, ikon: t.ikon, etiket: t.ad, alt: t.alt, secili: s[t.id]})))}${GM.ipucu({ikon: 'moon', metin: 'Sessiz saatlerde (**22.00–07.00**) bildirim gelmez; istediğin an **Ayarlar**dan değiştirirsin.'})}</div>`
      });
    }
    const t = tercihler(), sayi = tercihSayi(t);
    const grup = (a2, baslik) => { const g = tercihGrup(a2); if (!g) return ''; return `<section class="gm-yigin-12"><h2 class="gm-t-section">${GM.esc(baslik)}</h2>${GM.cipler({ad: `tercih-${a2}`, serit: false, etiket: baslik, secili: t[a2], ogeler: g.secenek.map(([ad, ikon]) => ({metin: ad, deger: ad, ikon: ikon || undefined}))})}</section>`; };
    return GM.onbSablon({...ortak,
      baslik: 'Neleri seversin?', alt: 'Seçimlerin **vitrin ve rota önerilerini** sıralar.',
      atla: {metin: 'Atla', veri: {eylem: 'atla'}},
      devam: {metin: 'Keşfetmeye başla', ikon: 'kesfet', veri: {eylem: 'ileri'}},
      altMetin: sayi ? `${sayi} seçili` : 'İstediğin kadar seç',
      html: `<div class="gm-yigin-24">${grup('mutfak', 'Sevdiğin mutfaklar')}${grup('konsept', 'Mekân tarzı')}${grup('ortam', 'Ortam ve kullanım')}</div>`
    });
  };
  const izinUyari = a => {
    const s = sistem();
    if (a === 'konum') return GM.sistemUyari(s === 'android'
      ? {platform: s, baslik: 'Dada Gourmet uygulamasının bu cihazın konumuna erişmesine izin verilsin mi?', red: 'İzin verme', ver: 'Uygulama kullanılırken'}
      : {platform: s, baslik: '“Dada Gourmet” konumunu kullansın mı?', metin: 'Yakınındaki mekânları ve rota duraklarını göstermek için konumun kullanılır.', red: 'İzin Verme', ver: 'Uygulamayı Kullanırken İzin Ver'});
    return GM.sistemUyari(s === 'android'
      ? {platform: s, baslik: 'Dada Gourmet uygulamasının size bildirim göndermesine izin verilsin mi?', red: 'İzin verme', ver: 'İzin ver'}
      : {platform: s, baslik: '“Dada Gourmet” Size Bildirim Göndermek İstiyor', metin: 'Bildirimler uyarılar, sesler ve simge işaretleri içerebilir. Bunlar Ayarlar’da yapılandırılabilir.', red: 'İzin Verme', ver: 'İzin Ver'});
  };
  GM.ekran('onboarding', {
    haller: false,
    tur: 'tam',
    ust: '#/karsilama',
    ciz: adimHtml,
    sonra: (kok, ctx) => {
      const a = adimAl(ctx);
      if (onb().adim !== a && !onb().bitti) onbYaz({adim: a});
      const ileri = () => {
        const i = ADIMLAR.indexOf(a);
        if (i < ADIMLAR.length - 1) { GM.git(`#/onboarding?adim=${ADIMLAR[i + 1]}`); return; }
        onbYaz({bitti: true, adim: null});
        GM.yerine('#/kesfet');
        GM.toast(tercihSayi(tercihler()) ? 'Hazırsın; vitrin **tercihlerine göre** sıralandı' : 'Hazırsın; **Keşfet** seni bekliyor', {tur: 'basari'});
      };
      const verildi = () => {
        GM.durum.yaz(`${a}-izin`, 'verildi'); onbYaz({[a]: 'verildi'});
        if (a === 'bildirim') { const s = bildirimSecim(); GM.durum.yaz('bildirim-ayar', {...(GM.durum.oku('bildirim-ayar', {}) || {}), ...s}); }
        GM.toast(a === 'konum' ? '**Konum** açıldı; yakınındakiler önce gelir' : '**Bildirimler** açıldı', {tur: 'basari', ikon: a === 'konum' ? 'konum' : 'bildirim'});
        ileri();
      };
      const c = [
        GM.eylem(kok, 'neden', () => { const n = NEDEN[a]; if (!n) return; GM.sheet({baslik: n.baslik, html: GM.p(n.metin), altBar: GM.btn({metin: n.bag[0], ikon: 'tumu', tur: 'secondary', tam: true, git: n.bag[1]})}); }),
        GM.eylem(kok, 'izin', () => izinUyari(a).then(ok => {
          if (ok === null) return;
          if (ok) { verildi(); return; }
          GM.durum.yaz(`${a}-izin`, 'reddedildi'); onbYaz({[a]: 'reddedildi'}); GM.tazele();
        })),
        GM.eylem(kok, 'ayar', verildi),
        GM.eylem(kok, 'atla', () => {
          if (a === 'tercih') { onbYaz({tercih: 'atlandi'}); ileri(); return; }
          GM.durum.yaz(`${a}-izin`, 'sonra'); onbYaz({[a]: 'sonra'}); ileri();
        }),
        GM.eylem(kok, 'ileri', () => { if (a === 'tercih') onbYaz({tercih: 'secildi'}); else if (onb()[a] == null) onbYaz({[a]: 'reddedildi'}); ileri(); })
      ];
      BILDIRIM.forEach(id => c.push(GM.on(kok, `bildirim-${id}`, v => onbYaz({bildirimSecim: {...bildirimSecim(), [id]: v}}))));
      TERCIH.forEach(t => c.push(GM.on(kok, `tercih-${t}`, v => {
        const y = {...tercihler(), [t]: [].concat(v || [])}; GM.durum.yaz('kesif-tercih', y);
        const alt = kok.querySelector('.gm-onb-alt .gm-yardim'), n = tercihSayi(y); if (alt) alt.textContent = n ? `${n} seçili` : 'İstediğin kadar seç';
      })));
      return () => c.forEach(f => f());
    }
  });

  // ---------- Giriş ----------
  // Gastro hesap.js giriş sırası: gülücük kapak + saydam üst bar, sosyal düğmeler, "ya da e-posta ile", form, "Hesabın yok mu?"; "Giriş yap" altBar'da.
  // Kayıtlı hesap (GMX.hesap.giris; Ayarlar'da değişen şifre hesap-ayar.guvenlik.sifre). Hatalı şifre deneme hakkını harcar, bitince giriş kilitlenir.
  // Hızlı giriş: Beni hatırla ile girilmiş hesap ('son-hesap') ya da ?hal=hizli → hesap satırı + biyometrik giriş (GM.biyometrikIstem); "Başka hesapla giriş yap" formu açar.
  // İki adım açıksa (hesap-ayar.guvenlik.ikiAdim) e-posta + şifre başarısı #/iki-adim'e gider. ?sonra=<rota> giriş sonrası dönülecek yer (uygulama kilidi şifreyle açılış).
  let sonraHedef = null;
  const sonraAl = s => (s && /^#\/(?!giris|kilit|iki-adim|kayit|sifremi-unuttum)/.test(s) ? s : null);
  const girisTamam = (yolAd = 'giris', mesaj) => {
    const h = sonraHedef || '#/kesfet'; sonraHedef = null;
    oturumYaz(yolAd, false);
    GM.yerine(h);
    GM.toast(mesaj || `Tekrar hoş geldin, **${KUL().ad || 'gurme'}**`, {tur: 'basari'});
  };
  const girisForm = (d, h = {}) => `<div class="gm-yigin">
    ${GM.input({ad: 'eposta', etiket: 'E-posta', ikon: 'envelope', tur: 'email', mod: 'email', yer: 'ad@site.com', deger: d.eposta, hata: h.eposta, otomatik: 'username'})}
    ${GM.input({ad: 'sifre', etiket: 'Şifre', ikon: 'lock', tur: 'password', yer: 'Şifren', deger: d.sifre, hata: h.sifre, otomatik: 'current-password'})}
  </div>`;
  // Giriş kilidi: deneme hakkı biterse (tur 'deneme') ya da sunucu çok fazla deneme derse (429, tur 'sunucu'; ?hal=cok-deneme) kilitDk boyunca giriş kapalı.
  // Bantta canlı geri sayım (data-geri-sayim); süre dolunca kilit kalkar. Gerçek kilit 'giris-kilit' {bitis, tur} durumunda kalır, ekrandan çıkıp dönünce sürer.
  const kilitKalan = ctx => Math.max(0, (ctx.kilitBitis || 0) - Date.now());
  const girisKilit = ctx => kilitKalan(ctx) > 0;
  const sureMetin = ms => { const t = Math.ceil(ms / 1000), dk = Math.floor(t / 60), sn = t % 60; return [dk && `${dk}\u00a0dk`, (sn || !dk) && `${sn}\u00a0sn`].filter(Boolean).join('\u00a0'); };   // bölünmez boşluk: süre tek parça kalır
  const kilitKur = (ctx, tur, kalici) => { ctx.kilitBitis = Date.now() + G().kilitDk * 60e3; ctx.kilitTur = tur; if (kalici) GM.durum.yaz('giris-kilit', {bitis: ctx.kilitBitis, tur}); };
  const denemeBant = ctx => {
    if (girisKilit(ctx)) {
      const sayac = `<b data-geri-sayim>${sureMetin(kilitKalan(ctx))}</b>`;
      return ctx.kilitTur === 'sunucu'
        ? GM.bant({ton: 'hata', baslik: 'Çok fazla giriş denemesi', html: `Bu cihazdan çok sayıda giriş denendi. ${sayac} sonra tekrar dene.`, eylem: {metin: 'Şifremi sıfırla', veri: {eylem: 'unuttum'}}})
        : GM.bant({ton: 'hata', baslik: 'Giriş geçici olarak kilitlendi', html: `Çok sayıda hatalı şifre girildi. ${sayac} sonra yeniden dene ya da şifreni sıfırla.`, eylem: {metin: 'Şifremi sıfırla', veri: {eylem: 'unuttum'}}});
    }
    const n = ctx.deneme || 0, kalan = G().denemeHakki - n;
    return n && kalan > 0 ? GM.bant({ton: 'uyari', metin: `**${kalan} deneme hakkın** kaldı. Şifreni hatırlamıyorsan sıfırlayabilirsin.`}) : '';
  };
  // Ayarlar › Güvenlik "Face ID ile hızlı giriş" kapalıysa ('hizli-giris' false) kayıtlı hesap olsa da form açılır.
  const hizliMi = ctx => !ctx.baskaHesap && (ctx.sorgu.hal === 'hizli' || (!!sonHesap() && GM.durum.oku('hizli-giris', true) !== false)) && !['hatali', 'kilitli', 'cok-deneme'].includes(ctx.sorgu.hal) && !girisKilit(ctx);
  const girisKapak = alt => GM.gulucuk({gorsel: mekanGorsel('levan-urla'), etiket: 'Dada Gourmet', baslik: 'Tekrar hoş geldin', alt, ust: true});
  const giris = ctx => {
    if (cevrimdisi(ctx)) return cevrimdisiEkran(ctx);
    sonraHedef = sonraAl(ctx.sorgu.sonra);
    if (ctx.ilk === undefined) {
      ctx.ilk = true;
      if (ctx.sorgu.hal === 'hatali') { ctx.deneme = 1; ctx.taslak = {eposta: G().eposta, sifre: ''}; ctx.hatalar = {sifre: 'E-posta ya da şifre hatalı'}; }
      if (ctx.sorgu.hal === 'kilitli') { ctx.deneme = G().denemeHakki; ctx.taslak = {eposta: G().eposta, sifre: ''}; kilitKur(ctx, 'deneme'); }
      if (ctx.sorgu.hal === 'cok-deneme') { ctx.taslak = {eposta: G().eposta, sifre: ''}; kilitKur(ctx, 'sunucu'); }
      const k = GM.durum.oku('giris-kilit', null);
      if (!ctx.kilitBitis && k?.bitis > Date.now()) { ctx.kilitBitis = k.bitis; ctx.kilitTur = k.tur; ctx.deneme = G().denemeHakki; }
    }
    if (hizliMi(ctx)) {
      const s = sonHesap() || {eposta: G().eposta, ad: tamAd()}, c = cihaz();
      return `${girisKapak('Kayıtlı hesabınla tek dokunuşla gir.')}${GM.gruplar([
        `<div class="gm-yigin-12">${GM.satirlar([GM.satir({avatar: {ad: s.ad || s.eposta, boyut: 40}, baslik: s.ad || 'Kayıtlı hesap', alt: s.eposta, sag: GM.btn({metin: 'Değiştir', tur: 'text', boyut: 'sm', veri: {eylem: 'baska'}})})])}${GM.p(`Şifren bu cihazda saklı; **${c.ios ? c.ad : 'parmak izin ya da yüzün'}** ile yazmadan girersin.`, {meta: true, ton: 'ikincil'})}</div>`
      ])}`;
    }
    // Alanlar boş açılır; e-posta yalnız ?eposta= ya da bu cihazda kayıtlı hesaptan ('son-hesap') gelir, şifre hiç dolmaz.
    const d = ctx.taslak || {eposta: ctx.sorgu.eposta || sonHesap()?.eposta || '', sifre: ''};
    return `${girisKapak('Kaldığın yerden devam et.')}${GM.gruplar([
      `<div class="gm-yigin-12">${ssoIkili('sso')}${GM.p('Dada Gastro ya da Dada Diet hesabın varsa **aynı hesapla** giriş yapabilirsin.', {orta: true, meta: true, ton: 'ikincil'})}</div>`,
      ayirac,
      `<div class="gm-yigin-12"><div data-yuva="form">${girisForm(d, ctx.hatalar)}</div><div class="gm-ara">${GM.checkbox({ad: 'hatirla', etiket: 'Beni hatırla', secili: true})}${GM.btn({metin: 'Şifremi unuttum', tur: 'text', boyut: 'sm', veri: {eylem: 'unuttum'}})}</div><div data-yuva="deneme">${denemeBant(ctx)}</div></div>`,
      GM.btn({metin: 'Hesabın yok mu? Üye ol', tur: 'text', tam: true, git: '#/kayit'})
    ])}`;
  };
  const girisBar = ctx => {
    if (cevrimdisi(ctx)) return '';
    if (hizliMi(ctx)) { const c = cihaz(); return GM.altEylem({dugmeler: [{metin: c.giris, ikon: c.ikon, tam: true, veri: {eylem: 'biyometrik'}}]}); }
    return GM.altEylem({dugmeler: [{metin: 'Giriş yap', ikon: 'right-to-bracket', tam: true, pasif: girisKilit(ctx), veri: {eylem: 'giris'}}]});
  };
  const girisBagla = (kok, ctx) => {
    const v = ad => kok.querySelector(`[name="${ad}"]`)?.value ?? '';
    const formCiz = (d, h) => { ctx.taslak = d; ctx.hatalar = h; const y = kok.querySelector('[data-yuva="form"]'); if (y) y.innerHTML = girisForm(d, h); };
    // Geri sayım: saniyede bir bant güncellenir; süre dolunca kilit ve deneme sayacı sıfırlanır, Giriş yap açılır.
    let t = 0;
    const sayacKur = () => {
      clearInterval(t);
      if (!girisKilit(ctx)) return;
      t = setInterval(() => {
        const el = kok.querySelector('[data-geri-sayim]');
        if (girisKilit(ctx)) { if (el) el.textContent = sureMetin(kilitKalan(ctx)); return; }
        clearInterval(t); ctx.kilitBitis = 0; ctx.deneme = 0; ctx.hatalar = {}; GM.durum.sil('giris-kilit'); GM.tazele();
        GM.toast('**Giriş yeniden açıldı**; tekrar deneyebilirsin', {ikon: 'lock-open'});
      }, 1000);
    };
    sayacKur();
    return [
      () => clearInterval(t),
      GM.eylem(kok, 'unuttum', () => GM.git(`#/sifremi-unuttum?eposta=${enc(v('eposta').trim())}`)),
      GM.eylem(kok, 'baska', () => { ctx.baskaHesap = true; GM.durum.sil?.('son-hesap'); GM.tazele(); }),
      GM.eylem(kok, 'biyometrik', el => {
        if (baglantiYok(ctx)) { baglantiToast(); return; }
        el.disabled = true;
        istem({neden: 'Dada Gourmet’e giriş yapmak için', sonuc: ctx.sorgu.sonuc === 'basarisiz' ? 'basarisiz' : 'basari'}).then(s => {
          el.disabled = false;
          if (s === 'basari') { girisTamam('giris'); return; }
          if (s === 'iptal') return;
          ctx.baskaHesap = true; ctx.taslak = {eposta: (sonHesap() || {}).eposta || G().eposta, sifre: ''}; GM.tazele();
          GM.toast(s === 'basarisiz' ? `**${cihaz().tanimadi}.** Şifrenle giriş yap.` : s === 'izin-yok' ? `**${cihaz().kullanilamaz.baslik}.** Şifrenle giriş yap.` : 'Şifrenle giriş yap', {ikon: 'lock'});
        });
      }),
      GM.eylem(kok, 'giris', el => {
        const d = {eposta: v('eposta').trim(), sifre: v('sifre')};
        const h = {eposta: !d.eposta ? 'E-posta adresini yaz' : EPOSTA.test(d.eposta) ? '' : 'Geçerli bir e-posta adresi gir', sifre: d.sifre ? '' : 'Şifreni gir'};
        if (h.eposta || h.sifre) { formCiz(d, h); return; }
        if (baglantiYok(ctx)) { baglantiToast(); return; }
        const hatirla = kok.querySelector('[name="hatirla"]')?.checked;
        GM.mesgul(el, bekle(2)).then(() => {
          if (d.eposta.toLocaleLowerCase('tr') === String(G().eposta).toLocaleLowerCase('tr') && d.sifre === kayitliSifre()) {
            if (hatirla) GM.durum.yaz('son-hesap', {eposta: d.eposta, ad: tamAd()});
            if (guvenlik().ikiAdim) { ikiDeneme = 0; GM.git(`#/iki-adim?eposta=${enc(d.eposta)}${sonraHedef ? `&sonra=${enc(sonraHedef)}` : ''}`); } else girisTamam('giris');
            return;
          }
          ctx.deneme = (ctx.deneme || 0) + 1;
          formCiz({...d, sifre: ''}, {sifre: 'E-posta ya da şifre hatalı'});
          kok.querySelector('[data-yuva="deneme"]').innerHTML = denemeBant(ctx);
          if (ctx.deneme >= G().denemeHakki) { kilitKur(ctx, 'deneme', true); kok.querySelector('[data-yuva="deneme"]').innerHTML = denemeBant(ctx); el.disabled = true; sayacKur(); }
          GM.titres(20);
        });
      }),
      GM.eylem(kok, 'sso', el => ssoGiris(el, ctx, false))
    ];
  };

  // ---------- İki adımlı doğrulama ----------
  // Gastro iki-adim: kod alanı, yeniden gönder sayacı, kurtarma kodu yolu (?mod=kurtarma), "Farklı hesapla giriş yap". Deneme hakkı iki modda ortak.
  let ikiDeneme = 0;
  const kurtarmaKodlari = () => guvenlik().kodlar || G().kurtarmaKodlari || [];
  const rakam = s => String(s || '').replace(/\D/g, '');
  const telMaske = t => (t ? `+90 ${t.slice(0, 3)} ••• •• ${t.slice(-2)}` : '');
  const ikiKilit = () => ikiDeneme >= G().denemeHakki;
  const ikiBant = kurtarma => {
    const kalan = G().denemeHakki - ikiDeneme;
    if (!ikiDeneme) return '';
    return kalan > 0
      ? GM.bant({ton: 'uyari', metin: `**${kalan} deneme hakkın** kaldı. ${kurtarma ? 'Kodu tire olmadan da yazabilirsin.' : 'Koda ulaşamıyorsan kurtarma kodu kullanabilirsin.'}`})
      : GM.bant({ton: 'hata', baslik: 'Doğrulama geçici olarak kilitlendi', metin: `Çok sayıda hatalı kod girildi. **${G().kilitDk} dakika** sonra yeniden giriş yap.`, eylem: {metin: 'Girişe dön', yerine: '#/giris'}});
  };
  const ikiAlan = (kurtarma, d = '', h = '') => (kurtarma
    ? GM.input({ad: 'kod', etiket: 'Kurtarma kodu', ikon: 'key', mod: 'numeric', yer: rakam(kurtarmaKodlari()[0] || '000000').replace(/\d/g, '0'), deger: d, hata: h, otomatik: 'off', pasif: ikiKilit()})
    : GM.input({ad: 'kod', etiket: 'Doğrulama kodu', ikon: 'hashtag', mod: 'numeric', yer: `${G().kodUzunluk} haneli kod`, deger: d, hata: h, otomatik: 'one-time-code', pasif: ikiKilit()}));
  const ikiEk = ctx => `${ctx.sorgu.eposta ? `&eposta=${enc(ctx.sorgu.eposta)}` : ''}${ctx.sorgu.sonra ? `&sonra=${enc(ctx.sorgu.sonra)}` : ''}`;
  const ikiGec = (kurtarma, sms, ctx) => (kurtarma
    ? GM.btn({metin: sms ? 'SMS koduyla gir' : 'Uygulama koduyla gir', ikon: sms ? 'comment-sms' : 'mobile-screen', tur: 'secondary', tam: true, pasif: ikiKilit(), yerine: `#/iki-adim?mod=kod${ikiEk(ctx)}`})
    : GM.btn({metin: 'Kurtarma kodu kullan', ikon: 'key', tur: 'secondary', tam: true, pasif: ikiKilit(), yerine: `#/iki-adim?mod=kurtarma${ikiEk(ctx)}`}));
  const ikiAdim = ctx => {
    if (cevrimdisi(ctx)) return cevrimdisiEkran(ctx);
    const kurtarma = ctx.sorgu.mod === 'kurtarma', sms = guvenlik().yontem !== 'uygulama', n = G().kodUzunluk, tel = telMaske(telefon());
    if (ctx.ilk === undefined) {
      ctx.ilk = true;
      if (ctx.sorgu.hal === 'kilitli') ikiDeneme = G().denemeHakki;
      if (ctx.sorgu.hal === 'hatali') { ikiDeneme = Math.max(1, ikiDeneme); ctx.taslak = ''; ctx.hata = kurtarma ? 'Kurtarma kodu geçersiz ya da daha önce kullanılmış' : 'Kod hatalı ya da süresi dolmuş'; }
    }
    const metin = kurtarma
      ? 'Telefonuna ulaşamıyorsan **kurtarma kodlarından** birini yaz; her kod bir kez geçer.'
      : sms ? `${tel ? `**${tel}**` : 'Kayıtlı telefon'} numarasına gönderdiğimiz **${n} haneli kodu** yaz.` : `Doğrulayıcı uygulamanın ürettiği **${n} haneli kodu** yaz.`;
    const deger = ctx.taslak ?? (kurtarma ? '' : G().ikiAdimKod || '');
    return `<div class="gm-ic gm-yigin-24">${GM.metinBlok({baslik: kurtarma ? 'Kurtarma koduyla gir' : 'Kimliğini doğrula', metin})}<div class="gm-yigin-12"><div data-yuva="kod">${ikiAlan(kurtarma, deger, ctx.hata)}</div><div data-yuva="deneme">${ikiBant(kurtarma)}</div>${!kurtarma && sms ? '<div data-yuva="tekrar"></div>' : ''}</div><div class="gm-yigin-8"><div data-yuva="gec">${ikiGec(kurtarma, sms, ctx)}</div>${GM.btn({metin: 'Farklı hesapla giriş yap', tur: 'text', tam: true, yerine: '#/giris'})}</div></div>`;
  };
  const ikiAdimBagla = (kok, ctx) => {
    const kurtarma = ctx.sorgu.mod === 'kurtarma', sms = guvenlik().yontem !== 'uygulama', n = G().kodUzunluk, kodlar = kurtarmaKodlari().map(rakam), kurUzun = kodlar[0]?.length || 6;
    sonraHedef = sonraAl(ctx.sorgu.sonra);
    let sayacDur = () => {};
    const kilitle = () => {
      sayacDur(); sayacDur = () => {};
      const t = kok.querySelector('[data-yuva="tekrar"]'); if (t) t.innerHTML = '';
      kok.querySelector('[data-yuva="gec"]').innerHTML = ikiGec(kurtarma, sms, ctx);
    };
    const hazirla = () => { const a = kok.querySelector('[name="kod"]'); if (a) a.maxLength = kurtarma ? (kurtarmaKodlari()[0] || '').length || 7 : n; };
    const alanCiz = (d, h) => { ctx.taslak = d; ctx.hata = h; kok.querySelector('[data-yuva="kod"]').innerHTML = ikiAlan(kurtarma, d, h); hazirla(); };
    hazirla();
    const c = [GM.eylem(kok, 'iki-dogrula', el => {
      if (ikiKilit()) return;
      const k = (kok.querySelector('[name="kod"]')?.value || '').trim(), r = rakam(k);
      const h = kurtarma
        ? (!k ? 'Kurtarma kodunu yaz' : /[^\d\s-]/.test(k) || r.length !== kurUzun ? `Kurtarma kodu ${kurUzun} rakamdan oluşur` : '')
        : (!k ? 'Kodu yaz' : /[^\d\s]/.test(k) ? 'Kod yalnız rakamdan oluşur' : r.length !== n ? `Kod ${n} haneli olmalı` : '');
      if (h) { alanCiz(k, h); return; }
      if (ctx.hata) alanCiz(k, '');
      if (baglantiYok(ctx)) { baglantiToast(); return; }
      const g = guvenlik(), kullanilan = g.kullanilan || [], kalanHak = g.kurtarmaKalan ?? kodlar.length;
      GM.mesgul(el, bekle(2)).then(() => {
        if (kurtarma ? kodlar.includes(r) && !kullanilan.includes(r) && kalanHak > 0 : r === G().ikiAdimKod) {
          ikiDeneme = 0;
          if (!kurtarma) { girisTamam('giris'); return; }
          const kalan = kalanHak - 1;
          ayarYaz('guvenlik', {kurtarmaKalan: kalan, kullanilan: [...kullanilan, r]});
          girisTamam('giris', `Giriş yaptın; **${kalan} kurtarma kodun** kaldı`);
          return;
        }
        ikiDeneme += 1;
        alanCiz('', kurtarma ? 'Kurtarma kodu geçersiz ya da daha önce kullanılmış' : 'Kod hatalı ya da süresi dolmuş');
        kok.querySelector('[data-yuva="deneme"]').innerHTML = ikiBant(kurtarma);
        if (ikiKilit()) { el.disabled = true; kilitle(); }
        GM.titres(20);
      });
    })];
    const tel = telMaske(telefon());
    if (!kurtarma && sms && !ikiKilit()) sayacDur = sayac(kok, () => GM.toast(`Yeni kod **${tel || 'telefonuna'}** gönderildi`, {ikon: 'comment-sms'}));
    c.push(() => sayacDur());
    return c;
  };

  // Yeniden gönder: süre dolana dek pasif ("29 sn sonra yeniden gönder"), sonra etkin metin düğmesi. Dönen işlev aralığı durdurur.
  const sayac = (kok, gonder, hazir = false) => {
    const y = kok.querySelector('[data-yuva="tekrar"]');
    if (!y) return () => {};
    let kalan = G().yenidenGonderSn, t = null;
    const ciz = () => { y.innerHTML = kalan > 0 ? GM.btn({metin: `${kalan} sn sonra yeniden gönder`, tur: 'text', tam: true, pasif: true}) : GM.btn({metin: 'Yeniden gönder', ikon: 'rotate-right', tur: 'text', tam: true, veri: {eylem: 'tekrar-gonder'}}); };
    const basla = () => { kalan = G().yenidenGonderSn; ciz(); clearInterval(t); t = setInterval(() => { kalan -= 1; ciz(); if (kalan <= 0) clearInterval(t); }, 1000); };
    const e = GM.eylem(kok, 'tekrar-gonder', () => { gonder(); basla(); });
    if (hazir) { kalan = 0; ciz(); } else basla();
    return () => { clearInterval(t); e(); };
  };

  // ---------- Şifre sıfırlama (#/sifremi-unuttum) ----------
  // Web sifremi-unuttum/ + sifre-yenile/: e-posta → ?adim=gonderildi (hesabın varlığını sızdırmayan yanıt) → bağlantıyı açınca ?adim=yeni (kurallar, tekrar) → girişe dön.
  // ?hal=sure-doldu bağlantı geçersiz ya da süresi dolmuş: yeni bağlantı iste. Yeni şifre hesap-ayar.guvenlik.sifre'ye yazılır; giriş yeni şifreyi kabul eder.
  // Adım ?adim=gonderildi|yeni (eski ?hal=gonderildi|yeni de açılır); ?hal=sure-doldu yeni şifre bağlantısının geçersiz hâli (?adim=yeni&hal=sure-doldu).
  const sifreAdim = ctx => {
    const q = ctx.sorgu, a = ['gonderildi', 'yeni'].includes(q.adim) ? q.adim : ['gonderildi', 'yeni'].includes(q.hal) ? q.hal : '';
    return q.hal === 'sure-doldu' ? 'sure-doldu' : a;
  };
  const sifreEksik = s => (G().sifreKurallari || []).filter(k => !new RegExp(k.desen).test(s)).map(k => k.ad);
  const veIle = l => (l.length > 1 ? `${l.slice(0, -1).join(', ')} ve ${l[l.length - 1]}` : l[0] || '');
  const epostaAlan = (d, h) => GM.input({ad: 'eposta', etiket: 'Kayıtlı e-posta adresin', ikon: 'envelope', tur: 'email', mod: 'email', yer: 'ad@site.com', deger: d, hata: h, otomatik: 'email'});
  const yeniForm = (d, h = {}) => `<div class="gm-yigin">${GM.input({ad: 'yeni', etiket: 'Yeni şifren', ikon: 'key', tur: 'password', yer: 'En az 8 karakter', deger: d.yeni, hata: h.yeni, otomatik: 'new-password', yardim: G().sifreKurali})}${GM.input({ad: 'tekrar', etiket: 'Yeni şifren (tekrar)', ikon: 'key', tur: 'password', yer: 'Tekrar yaz', deger: d.tekrar, hata: h.tekrar, otomatik: 'new-password'})}</div>`;
  const sifre = ctx => {
    if (cevrimdisi(ctx)) return cevrimdisiEkran(ctx);
    const a = sifreAdim(ctx), ep = ctx.sorgu.eposta || '';
    if (a === 'sure-doldu') return `<div class="gm-ic gm-yigin-24">${GM.bos({ikon: 'link-slash', baslik: 'Bağlantının süresi dolmuş', metin: `Bu sıfırlama bağlantısı geçersiz ya da süresi dolmuş. Bağlantılar **${G().baglantiDk} dakika** geçerlidir ve yalnız bir kez kullanılır. ${ep ? `**${ep}** adresine` : 'E-posta adresine'} yeni bir bağlantı gönderelim.`})}${GM.btn({metin: 'Yeni bağlantı gönder', ikon: 'gonder', tam: true, veri: {eylem: 'yeni-baglanti'}})}</div>`;
    if (a === 'gonderildi') return `<div class="gm-ic gm-yigin-24">${GM.bos({ikon: 'envelope-circle-check', baslik: 'Bağlantıyı gönderdik', metin: `${ep ? `**${ep}**` : 'Bu adres'} kayıtlıysa birkaç dakika içinde şifre sıfırlama bağlantısı gelir. Gelen kutunu ve spam klasörünü kontrol et.`})}<div class="gm-yigin-8">${GM.btn({metin: 'Bağlantıyı açtım', ikon: 'link', tam: true, yerine: `#/sifremi-unuttum?adim=yeni${ep ? `&eposta=${enc(ep)}` : ''}`})}<div data-yuva="tekrar"></div></div></div>`;
    if (a === 'yeni') return `<div class="gm-ic gm-yigin-24">${GM.metinBlok({baslik: 'Yeni şifreni belirle', metin: `Bağlantı **${ep || G().eposta}** hesabı için açıldı. Yeni şifreni iki kez yaz.`})}<div data-yuva="form">${yeniForm(ctx.taslak || {}, ctx.hatalar)}</div>${GM.p(`Bağlantı **${G().baglantiDk} dakika** geçerlidir ve yalnız bir kez kullanılabilir.`, {meta: true, ton: 'ikincil'})}</div>`;
    return `<div class="gm-ic gm-yigin-24">${GM.metinBlok({baslik: 'Şifreni mi unuttun?', metin: 'Sorun değil. E-posta adresini yaz, **sıfırlama bağlantısını** gönderelim.'})}<div data-yuva="form">${epostaAlan(ctx.taslak?.eposta ?? ep, ctx.hatalar?.eposta)}</div>${GM.p('Bu form istismara karşı **hız sınırlamasıyla** korunur.', {meta: true, ton: 'ikincil'})}</div>`;
  };
  const sifreBar = ctx => {
    if (cevrimdisi(ctx)) return '';
    const a = sifreAdim(ctx), ep = ctx.sorgu.eposta || '';
    if (a === 'gonderildi' || a === 'sure-doldu') return GM.altEylem({dugmeler: [{metin: 'Girişe dön', tur: 'secondary', tam: true, yerine: `#/giris${ep ? `?eposta=${enc(ep)}` : ''}`}]});
    return GM.altEylem({dugmeler: [a === 'yeni' ? {metin: 'Şifremi güncelle', ikon: 'onay', tam: true, veri: {eylem: 'sifre-kaydet'}} : {metin: 'Sıfırlama bağlantısı gönder', ikon: 'gonder', tam: true, veri: {eylem: 'gonder'}}]});
  };
  const sifreBagla = (kok, ctx) => {
    const v = ad => kok.querySelector(`[name="${ad}"]`)?.value ?? '';
    const c = [
      GM.eylem(kok, 'gonder', el => {
        const ep = v('eposta').trim(), h = !ep ? 'E-posta adresini yaz' : EPOSTA.test(ep) ? '' : 'Geçerli bir e-posta adresi gir';
        if (h) { ctx.taslak = {eposta: ep}; ctx.hatalar = {eposta: h}; kok.querySelector('[data-yuva="form"]').innerHTML = epostaAlan(ep, h); return; }
        if (baglantiYok(ctx)) { baglantiToast(); return; }
        GM.mesgul(el, bekle(2)).then(() => GM.yerine(`#/sifremi-unuttum?adim=gonderildi&eposta=${enc(ep)}`));
      }),
      GM.eylem(kok, 'yeni-baglanti', el => {
        const ep = ctx.sorgu.eposta || '';
        if (!EPOSTA.test(ep)) { GM.yerine('#/sifremi-unuttum'); return; }
        if (baglantiYok(ctx)) { baglantiToast(); return; }
        GM.mesgul(el, bekle(2)).then(() => GM.yerine(`#/sifremi-unuttum?adim=gonderildi&eposta=${enc(ep)}`));
      }),
      GM.eylem(kok, 'sifre-kaydet', el => {
        const d = {yeni: v('yeni'), tekrar: v('tekrar')}, eksik = sifreEksik(d.yeni);
        const h = {yeni: !d.yeni ? 'Yeni şifreni yaz' : eksik.length ? `Şifrende eksik: ${veIle(eksik)}` : '', tekrar: !d.tekrar && d.yeni ? 'Yeni şifreni tekrar yaz' : d.yeni === d.tekrar ? '' : 'İki şifre birbirini tutmuyor'};
        if (h.yeni || h.tekrar) { ctx.taslak = d; ctx.hatalar = h; kok.querySelector('[data-yuva="form"]').innerHTML = yeniForm(d, h); return; }
        if (baglantiYok(ctx)) { baglantiToast(); return; }
        GM.mesgul(el, bekle(2)).then(() => {
          ayarYaz('guvenlik', {sifre: d.yeni, sifreTarih: GM.simdi().toISOString().slice(0, 10)});
          GM.yerine(`#/giris?eposta=${enc(ctx.sorgu.eposta || G().eposta)}`);
          GM.toast('Şifren **güncellendi**; yeni şifrenle giriş yap', {tur: 'basari'});
        });
      })
    ];
    if (sifreAdim(ctx) === 'gonderildi') c.push(sayac(kok, () => GM.toast(`Bağlantı ${ctx.sorgu.eposta ? `**${ctx.sorgu.eposta}** adresine` : ''} yeniden gönderildi`, {ikon: 'envelope'})));
    return c;
  };

  // ---------- Üye ol (#/kayit) ----------
  // Web kayit/: Ad*, Soyad*, E-posta*, Telefon (isteğe bağlı), Şifre* (beş kural), tekrar*, Kullanım Koşulları*, KVKK Aydınlatma + Gizlilik*. Apple/Google ile de açılır.
  // Başarı: yeni hesap oturumu, profil hesap-ayar.profil'e, Dada Puan bakiyesi açılır (?hal=tamam): rütbe ve puan kuralları + "Tercihlerimi seç" (onboarding) / "Sonra".
  // Kayıtlı adres (GMX.hesap.giris.eposta) ya da ?hal=eposta-var: "Bu e-postayla bir hesap var" + Giriş yap. İşletme hesabı başvuru formuna gider.
  const KAYIT_BAG = [['Kullanım Koşulları', '#/yasal/kullanim-kosullari'], ['KVKK Aydınlatma Metni', '#/yasal/kvkk'], ['Gizlilik Politikası', '#/yasal/gizlilik']];
  const kayitForm = (d = {}, h = {}) => `<div class="gm-yigin">
    ${GM.input({ad: 'ad', etiket: 'Ad', ikon: 'user', yer: 'Adın', deger: d.ad, hata: h.ad, otomatik: 'given-name'})}
    ${GM.input({ad: 'soyad', etiket: 'Soyad', ikon: 'user', yer: 'Soyadın', deger: d.soyad, hata: h.soyad, otomatik: 'family-name'})}
    ${GM.input({ad: 'eposta', etiket: 'E-posta', ikon: 'envelope', tur: 'email', mod: 'email', yer: 'ad@site.com', deger: d.eposta, hata: h.eposta, otomatik: 'email'})}
    ${GM.input({ad: 'telefon', etiket: 'Telefon (isteğe bağlı)', ikon: 'phone', tur: 'tel', mod: 'tel', yer: '5__ ___ __ __', deger: d.telefon, hata: h.telefon, otomatik: 'tel-national', yardim: 'Rezervasyon ve hatırlatmalar için; profilinde gizli kalır.'})}
    ${GM.input({ad: 'sifre', etiket: 'Şifre', ikon: 'lock', tur: 'password', yer: 'En az 8 karakter', deger: d.sifre, hata: h.sifre, otomatik: 'new-password', yardim: G().sifreKurali})}
    ${GM.input({ad: 'tekrar', etiket: 'Şifre tekrarı', ikon: 'lock', tur: 'password', yer: 'Tekrar yaz', deger: d.tekrar, hata: h.tekrar, otomatik: 'new-password'})}
  </div>`;
  // GM.makale bağlantı rengini verir (yasal metin adları altı çizili).
  const onaylar = (d = {}) => GM.makale(`${GM.checkbox({ad: 'kosullar', secili: d.kosullar, etiketHtml: bagla(GM.esc('Kullanım Koşulları’nı okudum, kabul ediyorum.'), KAYIT_BAG)})}${GM.checkbox({ad: 'kvkk', secili: d.kvkk, etiketHtml: bagla(GM.esc('KVKK Aydınlatma Metni’ni ve Gizlilik Politikası’nı okudum, onaylıyorum.'), KAYIT_BAG)})}`);
  const varBant = ep => GM.bant({ton: 'uyari', baslik: 'Bu e-postayla bir hesap var', metin: `**${ep}** zaten kayıtlı. Giriş yap ya da şifreni sıfırla.`, eylem: {metin: 'Giriş yap', yerine: `#/giris?eposta=${enc(ep)}`}});
  const kayitTamam = () => {
    const p = tum().profil || {}, ep = p.eposta || '', r = (HS().rutbeler || [])[0], pk = HS().puanKurallari || [], b = GM.durum.oku('dada-puan', {}) || {};
    const dogru = !!p.epostaDogrulandi, puanMetin = '**Dada Puan** hesabın açıldı; ilk değerlendirmenle puan biriktirmeye başlarsın.';
    const metin = !ep ? puanMetin : dogru ? `**${ep}** doğrulandı. ${puanMetin}` : `${puanMetin} **${ep}** adresini doğrulayınca rezervasyon onayların e-postana gelir.`;
    return `<div class="gm-ic gm-yigin-24">${GM.bos({ikon: 'basari', baslik: `Hesabın hazır${p.ad ? `, ${p.ad}` : ''}`, metin})}
      ${ep && !dogru ? GM.bant({ton: 'uyari', baslik: 'E-postan doğrulanmadı', metin: 'Gelen kutundaki **6 haneli kodu** yazarak doğrula.', eylem: {metin: 'Şimdi doğrula', yerine: `#/kayit?adim=dogrula&eposta=${enc(ep)}`}}) : ''}
      ${GM.ozetSerit([{ikon: 'puanDada', etiket: 'Dada Puan', deger: GM.sayi(b.bakiye || 0)}, ...(r ? [{ikon: r.ikon, etiket: 'Rütbe', deger: r.ad}] : [])])}
      ${pk.length ? `<section class="gm-yigin-12"><h2 class="gm-t-section">Puan nasıl kazanılır?</h2>${GM.satirlar(pk.map(k => GM.satir({ikon: k.ikon, baslik: k.ad, alt: k.onay, deger: `+${k.tutar}`})))}</section>` : ''}</div>`;
  };
  // ---------- E-posta doğrulama (#/kayit?adim=dogrula&eposta=) ----------
  // Kayıttan sonra: adrese gönderilen 6 haneli kod, yeniden gönder sayacı, "Yanlış adres mi yazdın?" (adresi düzelt sheet'i). Doğrulanınca hesap-ayar.profil.epostaDogrulandi
  // ve #/kayit?hal=tamam. "Sonra" doğrulamadan devam eder. ?hal=zaten adres zaten doğrulanmış (kod alanı yok, Devam et); ?hal=gecersiz kod geçersiz ya da süresi dolmuş:
  // yeniden gönder hemen açıktır, yeni kod istenene dek her kod reddedilir.
  const dogrulaMi = ctx => ctx.sorgu.adim === 'dogrula';
  const dogrulaEp = ctx => ctx.sorgu.eposta || tum().profil?.eposta || '';
  const kodAlan = (d = '', h = '') => GM.input({ad: 'kod', etiket: 'Doğrulama kodu', ikon: 'hashtag', mod: 'numeric', yer: `${G().kodUzunluk} haneli kod`, deger: d, hata: h, otomatik: 'one-time-code'});
  const gecersizBant = () => GM.bant({ton: 'hata', baslik: 'Kod geçersiz ya da süresi dolmuş', metin: 'Bu kod artık kullanılamıyor. **Yeniden gönder** ile yeni kod iste ve gelen kutuna düşen son kodu yaz.'});
  const dogrula = ctx => {
    const ep = dogrulaEp(ctx);
    if (ctx.sorgu.hal === 'zaten') return `<div class="gm-ic">${GM.bos({ikon: 'envelope-circle-check', baslik: 'Bu adres zaten doğrulanmış', metin: `${ep ? `**${ep}**` : 'E-posta adresin'} daha önce doğrulandı. Yeniden kod girmene gerek yok.`})}</div>`;
    if (ctx.gecersiz === undefined) ctx.gecersiz = ctx.sorgu.hal === 'gecersiz';
    return `<div class="gm-ic gm-yigin-24">${GM.metinBlok({baslik: 'E-postanı doğrula', metin: ep ? `**${ep}** adresine ${G().kodUzunluk} haneli bir kod gönderdik. Birkaç dakika içinde gelmezse spam klasörüne bak.` : `E-posta adresine gelen **${G().kodUzunluk} haneli kodu** yaz.`})}<div class="gm-yigin-12"><div data-yuva="uyari">${ctx.gecersiz ? gecersizBant() : ''}</div><div data-yuva="kod">${kodAlan(ctx.taslak, ctx.hata)}</div><div data-yuva="tekrar"></div></div>${GM.btn({metin: 'Yanlış adres mi yazdın?', tur: 'text', tam: true, veri: {eylem: 'adres-duzelt'}})}</div>`;
  };
  const dogrulaBar = ctx => (ctx.sorgu.hal === 'zaten'
    ? GM.altEylem({dugmeler: [{metin: 'Devam et', ikon: 'tumu', tam: true, yerine: '#/kayit?hal=tamam'}]})
    : GM.altEylem({dugmeler: [{metin: 'Sonra', tur: 'secondary', yerine: '#/kayit?hal=tamam'}, {metin: 'Doğrula', ikon: 'onay', veri: {eylem: 'kod-dogrula'}}]}));
  const yeniEpAlan = (d, h) => GM.input({ad: 'yeni-eposta', etiket: 'E-posta', ikon: 'envelope', tur: 'email', mod: 'email', yer: 'ad@site.com', deger: d, hata: h, otomatik: 'email'});
  const dogrulaBagla = (kok, ctx) => {
    if (ctx.sorgu.hal === 'zaten') return [];
    const ep = dogrulaEp(ctx), n = G().kodUzunluk;
    const hazirla = () => { const a = kok.querySelector('[name="kod"]'); if (a) a.maxLength = n; };
    const alanCiz = (k, h) => { ctx.taslak = k; ctx.hata = h; kok.querySelector('[data-yuva="kod"]').innerHTML = kodAlan(k, h); hazirla(); };
    hazirla();
    return [
      sayac(kok, () => {
        GM.toast(`Yeni kod **${ep || 'e-posta adresine'}** gönderildi`, {ikon: 'envelope'});
        if (!ctx.gecersiz) return;
        ctx.gecersiz = false; kok.querySelector('[data-yuva="uyari"]').innerHTML = ''; alanCiz('', '');
      }, ctx.gecersiz),
      GM.eylem(kok, 'adres-duzelt', () => GM.sheet({
        baslik: 'E-posta adresini düzelt',
        html: `<div class="gm-yigin">${GM.p('Kodu **yeni adresine** gönderelim; eski adrese giden kod geçersiz olur.')}<div data-yuva="yeni-ep">${yeniEpAlan(ep)}</div></div>`,
        altBar: GM.btn({metin: 'Kodu gönder', ikon: 'gonder', tam: true, veri: {eylem: 'yeni-ep'}}),
        sonra: sh => GM.eylem(sh, 'yeni-ep', () => {
          const y = (sh.querySelector('[name="yeni-eposta"]')?.value || '').trim();
          const h = !y ? 'E-posta adresini yaz' : !EPOSTA.test(y) ? 'Geçerli bir e-posta adresi gir' : y.toLocaleLowerCase('tr') === String(G().eposta).toLocaleLowerCase('tr') ? 'Bu e-postayla bir hesap var' : '';
          if (h) { sh.querySelector('[data-yuva="yeni-ep"]').innerHTML = yeniEpAlan(y, h); return; }
          sh.kapat(); ayarYaz('profil', {eposta: y, epostaDogrulandi: false});
          GM.yerine(`#/kayit?adim=dogrula&eposta=${enc(y)}`);
          GM.toast(`Kod **${y}** adresine gönderildi`, {ikon: 'envelope'});
        })
      })),
      GM.eylem(kok, 'kod-dogrula', el => {
        const k = (kok.querySelector('[name="kod"]')?.value || '').replace(/\s/g, '');
        const h = !k ? 'Kodu yaz' : !/^\d+$/.test(k) ? 'Kod yalnız rakamdan oluşur' : k.length !== n ? `Kod ${n} haneli olmalı` : '';
        if (h) { alanCiz(k, h); return; }
        if (baglantiYok(ctx)) { baglantiToast(); return; }
        GM.mesgul(el, bekle(2)).then(() => {
          if (ctx.gecersiz) { alanCiz('', 'Kod geçersiz ya da süresi dolmuş; Yeniden gönder ile yeni kod iste'); GM.titres(20); return; }
          ayarYaz('profil', {...(ep ? {eposta: ep} : {}), epostaDogrulandi: true});
          GM.yerine('#/kayit?hal=tamam');
          GM.toast('E-postan **doğrulandı**', {tur: 'basari'});
        });
      })
    ];
  };

  const kayit = ctx => {
    if (cevrimdisi(ctx)) return cevrimdisiEkran(ctx);
    if (ctx.sorgu.hal === 'tamam') return kayitTamam();
    if (dogrulaMi(ctx)) return dogrula(ctx);
    if (ctx.ilk === undefined) {
      ctx.ilk = true;
      if (ctx.sorgu.hal === 'eposta-var') { ctx.taslak = {ad: KUL().ad, soyad: KUL().soyad, eposta: G().eposta}; ctx.hatalar = {eposta: 'Bu e-postayla bir hesap var'}; ctx.varEp = G().eposta; }
    }
    return GM.gruplar([
      GM.metinBlok({baslik: 'Aramıza katıl', metin: '**1 dakikada** Dada Gourmet hesabını oluştur; beğendiğin yerleri kaydetmeye hemen başla.', rol: 'page', h: 1}),
      ssoIkili('sso'),
      ayirac,
      `<div class="gm-yigin-12"><div data-yuva="form">${kayitForm(ctx.taslak, ctx.hatalar)}</div><div data-yuva="var">${ctx.varEp ? varBant(ctx.varEp) : ''}</div><div data-yuva="onay">${onaylar(ctx.taslak)}</div><div data-yuva="onay-hata">${ctx.onayHata ? GM.bant({ton: 'hata', metin: 'Devam etmek için **iki onayı da** işaretle.'}) : ''}</div></div>`,
      `<div class="gm-yigin-8">${GM.btn({metin: 'Zaten üye misin? Giriş yap', tur: 'text', tam: true, yerine: '#/giris'})}${GM.btn({metin: 'İşletme hesabı için başvur', ikon: 'store', tur: 'text', tam: true, git: '#/isletme/basvuru'})}</div>`
    ]);
  };
  const kayitBar = ctx => {
    if (cevrimdisi(ctx)) return '';
    if (dogrulaMi(ctx) && ctx.sorgu.hal !== 'tamam') return dogrulaBar(ctx);
    if (ctx.sorgu.hal === 'tamam') return GM.altEylem({dugmeler: [{metin: 'Sonra', tur: 'secondary', yerine: '#/kesfet'}, onbBitti() ? {metin: 'Keşfetmeye başla', ikon: 'kesfet', yerine: '#/kesfet'} : {metin: 'Tercihlerimi seç', ikon: 'tumu', yerine: '#/onboarding'}]});
    return GM.altEylem({dugmeler: [{metin: 'Hesabımı oluştur', ikon: 'user-plus', tam: true, veri: {eylem: 'kayit'}}]});
  };
  const kayitBagla = (kok, ctx) => {
    if (ctx.sorgu.hal === 'tamam') return [];
    if (dogrulaMi(ctx)) return dogrulaBagla(kok, ctx);
    const v = ad => kok.querySelector(`[name="${ad}"]`)?.value ?? '';
    const isaret = ad => !!kok.querySelector(`[name="${ad}"]`)?.checked;
    return [
      GM.eylem(kok, 'sso', el => ssoGiris(el, ctx, true)),
      GM.eylem(kok, 'kayit', el => {
        const d = {ad: v('ad').trim(), soyad: v('soyad').trim(), eposta: v('eposta').trim(), telefon: v('telefon').trim(), sifre: v('sifre'), tekrar: v('tekrar'), kosullar: isaret('kosullar'), kvkk: isaret('kvkk')};
        const tel = rakam(d.telefon).replace(/^0/, ''), eksik = sifreEksik(d.sifre);
        const h = {
          ad: d.ad ? '' : 'Adını gir', soyad: d.soyad ? '' : 'Soyadını gir',
          eposta: !d.eposta ? 'E-posta adresini yaz' : EPOSTA.test(d.eposta) ? '' : 'Geçerli bir e-posta adresi gir',
          telefon: d.telefon && tel.length !== 10 ? 'Geçerli bir telefon numarası gir (10 hane)' : '',
          sifre: !d.sifre ? 'Bir şifre belirle' : eksik.length ? `Şifrende eksik: ${veIle(eksik)}` : '',
          tekrar: !d.tekrar && d.sifre ? 'Şifreni tekrar yaz' : d.sifre === d.tekrar ? '' : 'İki şifre birbirini tutmuyor'
        };
        const hataVar = Object.values(h).some(Boolean), onayYok = !d.kosullar || !d.kvkk;
        ctx.taslak = d; ctx.hatalar = h; ctx.onayHata = onayYok; ctx.varEp = null;
        const ciz = () => {
          kok.querySelector('[data-yuva="form"]').innerHTML = kayitForm(d, ctx.hatalar);
          kok.querySelector('[data-yuva="var"]').innerHTML = ctx.varEp ? varBant(ctx.varEp) : '';
          kok.querySelector('[data-yuva="onay-hata"]').innerHTML = ctx.onayHata ? GM.bant({ton: 'hata', metin: 'Devam etmek için **iki onayı da** işaretle.'}) : '';
        };
        if (hataVar || onayYok) { ciz(); kok.querySelector('.gm-alan.is-hata, [data-yuva="onay-hata"] .gm-ipucu')?.scrollIntoView({block: 'center', behavior: GM.azHareket() ? 'auto' : 'smooth'}); GM.titres(20); return; }
        if (baglantiYok(ctx)) { baglantiToast(); return; }
        GM.mesgul(el, bekle(2)).then(() => {
          if (d.eposta.toLocaleLowerCase('tr') === String(G().eposta).toLocaleLowerCase('tr')) {
            ctx.varEp = d.eposta; ctx.hatalar = {eposta: 'Bu e-postayla bir hesap var'}; ciz(); GM.titres(20); return;
          }
          oturumYaz('kayit', true);
          ayarYaz('profil', {ad: d.ad, soyad: d.soyad, eposta: d.eposta, telefon: tel});
          ayarYaz('guvenlik', {sifre: d.sifre, sifreTarih: GM.simdi().toISOString().slice(0, 10)});
          puanAc();
          GM.yerine(`#/kayit?adim=dogrula&eposta=${enc(d.eposta)}`);
        });
      })
    ];
  };

  // ---------- Kimlik ekranları (tek kalıp) ----------
  const KIMLIK = {
    giris: {baslik: 'Giriş yap', ust: '#/karsilama', saydam: true, ciz: giris, bar: girisBar, bagla: girisBagla, ana: 'giris'},
    'iki-adim': {baslik: 'İki adımlı doğrulama', ust: '#/giris', ciz: ikiAdim, bar: ctx => (cevrimdisi(ctx) ? '' : GM.altEylem({dugmeler: [{metin: 'Doğrula', ikon: 'onay', tam: true, pasif: ikiKilit(), veri: {eylem: 'iki-dogrula'}}]})), bagla: ikiAdimBagla},
    sifre: {baslik: 'Şifremi unuttum', ust: '#/giris', ciz: sifre, bar: sifreBar, bagla: sifreBagla},
    kayit: {baslik: ctx => (ctx.sorgu.hal === 'tamam' ? 'Hoş geldin' : dogrulaMi(ctx) ? 'E-posta doğrulama' : 'Üye ol'), ust: '#/karsilama', ciz: kayit, bar: kayitBar, bagla: kayitBagla}
  };
  // Şifreyi göster/gizle: kanon GM.input şifre alanına data-sifre-goster düğmesi koyar ama davranışı yok (Diet kanonunda da yok). Burada:
  // type password ↔ text, ikon eye ↔ eye-slash, aria-pressed ve aria-label güncellenir. Kanon davranışı eklenirse (GM.sifreGosterKanon) bu atlanır.
  const sifreGoster = ev => {
    if (GM.sifreGosterKanon) return;
    const b = ev.target.closest?.('[data-sifre-goster]'), i = b?.closest('.gm-girdi')?.querySelector('input');
    if (!i) return;
    const ac = i.type === 'password';
    i.type = ac ? 'text' : 'password';
    b.setAttribute('aria-pressed', String(ac)); b.setAttribute('aria-label', ac ? 'Şifreyi gizle' : 'Şifreyi göster');
    const ic = b.querySelector('.icon'); if (ic) { ic.classList.toggle('fa-eye', !ac); ic.classList.toggle('fa-eye-slash', ac); }
  };
  const ENTER = '[data-eylem="giris"],[data-eylem="gonder"],[data-eylem="sifre-kaydet"],[data-eylem="iki-dogrula"],[data-eylem="kayit"],[data-eylem="kod-dogrula"]';
  Object.entries(KIMLIK).forEach(([ad, k]) => GM.ekran(ad, {
    haller: false,   // akış ekranı: ortak ?hal= hâlleri uygulanmaz; ekrana özgü hâller yukarıda
    cevrimici: true,
    tur: 'alt',
    ust: k.ust,
    baslik: ctx => (typeof k.baslik === 'function' ? k.baslik(ctx) : k.baslik),
    ustBar: ctx => ({menu: false, saydam: !!k.saydam && !cevrimdisi(ctx)}),
    ciz: k.ciz,
    altBar: k.bar,
    sonra: (kok, ctx) => {
      if (cevrimdisi(ctx)) return null;
      const c = k.bagla(kok, ctx);
      // Enter birincil eylemi tetikler (sabit çubuktaki düğme kökün dışında kalabilir: ekran öğesinin tamamında aranır).
      const tus = ev => { if (ev.key === 'Enter' && ev.target.matches?.('input')) { ev.preventDefault(); kok.querySelector(ENTER)?.click(); } };
      kok.addEventListener('keydown', tus);
      kok.addEventListener('click', sifreGoster);
      return () => { c.forEach(f => f?.()); kok.removeEventListener('keydown', tus); kok.removeEventListener('click', sifreGoster); };
    }
  }));

  // ---------- Uygulama kilidi ekranı ----------
  // Karşılama kabuğu (GM.karsilamaKabuk) + hâl bandı; biyometrik istem kendiliğinden (?oto=1: soğuk açılış, arka plandan dönüş) ya da düğmeyle başlar.
  const KILIT_HALLER = ['basarisiz', 'kilitlendi', 'iptal', 'kullanilamaz'];
  const dene = ctx => ctx.sorgu.dene === '1';
  const btnAc = (c, metin = c.ac) => GM.btn({metin, ikon: c.ikon, tam: true, veri: {eylem: 'dogrula'}});
  const btnIkinci = (ctx, ana = false) => (dene(ctx)
    ? GM.btn({metin: 'Vazgeç', tur: ana ? 'secondary' : 'text', tam: true, veri: {eylem: 'vazgec'}})
    : GM.btn({metin: 'Şifreyle aç', ikon: 'key', tur: ana ? 'primary' : 'text', tam: true, veri: {eylem: 'sifre'}}));
  const yalnizSifre = h => h === 'kilitlendi' || h === 'kullanilamaz';
  const kilitHal = (ctx, c) => {
    if (ctx.hal === 'basarisiz') return [GM.bant({ton: 'uyari', baslik: c.tanimadi, metin: `${c.ipucu} **Tekrar dene** ya da şifrenle aç.`}), btnAc(c, 'Tekrar dene'), btnIkinci(ctx)];
    if (ctx.hal === 'kilitlendi') return [GM.bant({ton: 'hata', baslik: `${c.ad} geçici olarak durdu`, metin: 'Çok sayıda başarısız denemeden sonra telefonun doğrulamayı **bir süre durdurdu**.'}), btnIkinci(ctx, true)];
    if (ctx.hal === 'iptal') return [GM.bant({ton: 'bilgi', baslik: 'Doğrulama iptal edildi', metin: 'Hazır olduğunda **yeniden dene** ya da şifrenle aç.'}), btnAc(c), btnIkinci(ctx)];
    if (ctx.hal === 'kullanilamaz') return [GM.bant({ton: 'uyari', ...c.kullanilamaz}), btnIkinci(ctx, true)];
    return [btnAc(c), btnIkinci(ctx)];
  };
  const kilitAc = ctx => {
    kilitYaz({sonAcilis: Date.now(), bekliyor: false});
    const s = donus(ctx.sorgu.sonra);
    if (dene(ctx)) { GM.geri('#/ayarlar'); GM.toast(`**${cihaz().ad}** çalışıyor`, {tur: 'basari', ikon: cihaz().ikon}); return; }
    GM.yerine(s || '#/kesfet');
  };
  const sifreyleAc = ctx => {
    const s = donus(ctx.sorgu.sonra) || kilitDurum().sonra || '#/kesfet';
    GM.yerine(`#/giris?eposta=${enc((sonHesap() || {}).eposta || tum().profil?.eposta || G().eposta)}&sonra=${enc(s)}`);
  };
  const kilitDogrula = ctx => {
    const so = ctx.sorgu.sonuc;
    return istem({neden: 'Dada Gourmet’i açmak için', sonuc: so === 'basarisiz' || so === 'kilitlendi' ? 'basarisiz' : 'basari'}).then(s => {
      if (s === 'basari') { kilitAc(ctx); return; }
      if (s === 'sifre' && !dene(ctx)) { sifreyleAc(ctx); return; }
      ctx.hal = s === 'basarisiz' ? (so === 'kilitlendi' ? 'kilitlendi' : 'basarisiz') : s === 'izin-yok' ? 'kullanilamaz' : 'iptal';
      GM.tazele();
    });
  };
  GM.ekran('kilit', {
    haller: false,
    tur: 'tam',
    ciz: ctx => {
      if (ctx.hal === undefined) ctx.hal = KILIT_HALLER.includes(ctx.sorgu.hal) ? ctx.sorgu.hal : '';
      const c = cihaz();
      return GM.karsilamaKabuk({
        gorsel: mekanGorsel('lacivert-restaurant', 'rumelihisari-iskele'),
        baslik: 'Dada Gourmet kilitli',
        // Başlık bloğu ≤ 3 satır (yığılma kuralı 5): başlık tek satır, açıklama en çok iki satır.
        metin: `Favorilerin ve rotaların **kilit altında**. ${yalnizSifre(ctx.hal) && !dene(ctx) ? 'Şifrenle devam edebilirsin.' : c.ios ? `${c.ad} ile aç.` : 'Parmak izinle ya da yüzünle aç.'}`,
        html: `<div class="gm-yigin-12" aria-live="polite">${kilitHal(ctx, c).join('')}</div>`
      });
    },
    sonra: (kok, ctx) => {
      const c = [
        GM.eylem(kok, 'dogrula', () => kilitDogrula(ctx)),
        GM.eylem(kok, 'sifre', () => sifreyleAc(ctx)),
        GM.eylem(kok, 'vazgec', () => GM.geri('#/ayarlar'))
      ];
      let t = 0;
      if (!ctx.hal && !ctx.oto && ctx.sorgu.oto) { ctx.oto = true; t = setTimeout(() => kilitDogrula(ctx), GM.TK.motion.reveal); }
      return () => { clearTimeout(t); c.forEach(f => f()); };
    }
  });
})();
