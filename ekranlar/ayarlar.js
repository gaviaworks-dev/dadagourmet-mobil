/* Hesap ayarları (#/ayarlar, #/ayarlar/:bolum), Paketlerim (#/paketlerim), Pro (#/pro). Diet mobil ayarlar.js kalıbı (Gastro ortak/sayfalar/ayarlar.js):
 * hub = parçalı profil kartı + başlıklı kartsız gruplar (GM.gruplar), Çıkış ayrı Oturum grubunda; her bölüm alt ekrandır ve yine GM.gruplar ile kurulur.
 * İçerik Gourmet web Hesap Ayarları (WEB-ENVANTERI §4.5): bildirim tercihleri (12.30 öğle, 19.00 akşam önerisi dahil), gizlilik, konum, dil, güvenlik, uygulama, veri, silme.
 * Misafir (GM.uye() yok): hub giriş çağrısı + Uygulama, Yardım, Yasal; uygulama, dil ve konum bölümleri açık, hesaba bağlı bölümler GM.girisGerekli.
 * Durum: hesap-ayar {profil, bildirim:{eposta, sessiz}, gizlilik, konum, dil:{dil, birim}, guvenlik:{sifre, sifreTarih, ikiAdim, yontem, sso, kapatilan}, veri},
 *   bildirim-ayar {tur:boolean} uygulama kanalı, bildirim-izin / konum-izin ('verildi' | 'reddedildi'), konum-sehir, uygulama-kilidi {acik, gecikme}, hizli-giris, titresim, pro-haber.
 * Yeni hesapta (GM.yeniHesap) kişisel alanlar boş, oturum yalnız bu cihaz. Paket ve fiyat: GMX.hesap.kademeler (Pro webde ₺99/ay, fiyat onay bekliyor; uygulama içi satın alma kapalı). */
(() => {
  const H = () => GMX.hesap;
  const BOLUM = {bildirimler: 'Bildirim tercihleri', gizlilik: 'Profil görünürlüğü', konum: 'Konum', dil: 'Dil ve bölge', guvenlik: 'Güvenlik', uygulama: 'Uygulama ayarları', veri: 'Verilerim', sil: 'Hesabımı sil'};
  const MISAFIR_ACIK = ['uygulama', 'dil', 'konum'];
  const GIRIS = {
    bildirimler: ['bildirim', 'Bildirimlerini **kanal kanal** seçmek ve öneri saatlerini ayarlamak için giriş yap.'],
    gizlilik: ['eye', 'Profilinin ve değerlendirmelerinin **kimlere göründüğünü** seçmek için giriş yap.'],
    guvenlik: ['lock', 'Şifreni, **iki adımlı doğrulamayı** ve uygulama kilidini yönetmek için giriş yap.'],
    veri: ['database', 'Verilerini **indirmek** için giriş yap.'],
    sil: ['trash-can', 'Hesabını **silmek** için önce giriş yap.']
  };
  const YASAL = [['kvkk', 'KVKK Aydınlatma Metni', 'file-lines'], ['gizlilik', 'Gizlilik Politikası', 'user-shield'], ['kullanim-kosullari', 'Kullanım Koşulları', 'file-contract'], ['cerez', 'Çerez Politikası', 'cookie-bite']];
  const GECIKME = [['hemen', 'Hemen', 'bolt'], ['1', '1 dakika sonra', 'clock'], ['5', '5 dakika sonra', 'hourglass-half']];
  const SEHIRLER = ['İstanbul', 'İzmir', 'Ankara', 'Antalya', 'Muğla', 'Bursa', 'Nevşehir', 'Gaziantep', 'Hatay', 'Trabzon'];
  const VARS = {
    bildirim: {eposta: {}, sessiz: '22-07'},
    gizlilik: {acik: true, yorumAd: true, liderlik: true, liste: 'ozel'},
    konum: {hassas: true, arkaPlan: false},
    dil: {dil: 'tr', birim: 'km'},
    guvenlik: {sifreTarih: '2026-08-14', ikiAdim: false, yontem: 'sms', sso: {apple: true, google: false}, kapatilan: []},
    veri: {onbellekMb: 86}
  };
  const tum = () => GM.durum.oku('hesap-ayar', {}) || {};
  const ayar = b => ({...VARS[b], ...(GM.yeniHesap() && b === 'guvenlik' ? {sifreTarih: null, sso: {apple: false, google: false}} : {}), ...(tum()[b] || {})});
  const ayarYaz = (b, ek) => GM.durum.yaz('hesap-ayar', {...tum(), [b]: {...(tum()[b] || {}), ...ek}});
  const kisi = () => ({...H().kullanici, ...(GM.yeniHesap() ? {ad: '', soyad: '', kullaniciAdi: '', telefon: ''} : {}), ...(tum().profil || {})});
  const adSoyad = () => { const p = kisi(); return `${p.ad || ''} ${p.soyad || ''}`.trim(); };
  const secAd = (l, v) => (l.find(([d]) => d === v) || [])[1] || '';
  const gunFark = iso => Math.round((GM.simdi() - new Date(`${iso}T12:00:00`)) / 864e5);
  const once = iso => { if (!iso) return 'henüz değiştirilmedi'; const g = gunFark(iso); return g < 1 ? 'bugün' : g < 30 ? `${g} gün önce` : `${Math.round(g / 30)} ay önce`; };
  // Sistem izni: kayıtlı hesapta önceden verilmiş sayılır; yeni hesapta ve misafirde onboarding yanıtı yoksa sorulmadı.
  const izin = k => GM.durum.oku(k, null) || (GM.uye() && !GM.yeniHesap() ? 'verildi' : 'sorulmadi');
  const push = () => ({...Object.fromEntries(H().bildirimTurleri.map(t => [t.id, t.push])), ...(GM.durum.oku('bildirim-ayar', {}) || {})});
  const eposta = () => ({...Object.fromEntries(H().bildirimTurleri.map(t => [t.id, t.eposta])), ...ayar('bildirim').eposta});
  const kilit = () => ({acik: false, gecikme: 'hemen', ...(GM.durum.oku('uygulama-kilidi', {}) || {})});
  const kilitAd = () => { const p = kilit().platform; return p === 'android' ? 'Parmak izi' : p === 'ios-touch' ? 'Touch ID' : 'Face ID'; };
  const sehir = () => GM.durum.oku('konum-sehir', null) || kisi().sehir || 'İstanbul';
  // Liste sayısı Listelerim ile tek kaynak (profil.js GMX.hesapListeler: silinenler düşer); yüklenmemişse tohum + kullanıcının listeleri.
  const listeSayi = () => (GMX.hesapListeler ? GMX.hesapListeler().length : (GM.yeniHesap() ? 0 : H().listeler.length) + (GM.durum.oku('listeler', []) || []).length);
  const SINIR = () => H().listeSiniri || 3;
  const kapali = b => !GM.uye() && !MISAFIR_ACIK.includes(b);

  // ---------- Ortak gruplar ----------
  const yardimGrup = () => ({baslik: 'Yardım', satirlar: [
    {ikon: 'circle-question', baslik: 'Sık sorulan sorular', git: '#/sss'},
    {ikon: 'headset', baslik: 'Çözüm merkezi', alt: 'Destek taleplerin ve yanıtları', git: '#/cozum-merkezi'},
    {ikon: 'envelope', baslik: 'İletişim', git: '#/iletisim'},
    {ikon: 'comment-dots', baslik: 'Görüş bildir', git: '#/gorus-bildir'},
    {ikon: 'building', baslik: 'Hakkımızda', git: '#/kurumsal/hakkimizda'}
  ]});
  const yasalGrup = () => ({baslik: 'Yasal', satirlar: [{ikon: 'scale-balanced', baslik: 'Yasal metinler', alt: 'KVKK, gizlilik, kullanım koşulları, çerezler', git: '#/yasal'}]});
  const dilOzet = () => { const d = ayar('dil'); return `${d.dil === 'en' ? 'English' : 'Türkçe'} · Türkiye · ${d.birim === 'mil' ? 'mil' : 'km'}`; };
  const acikSayi = () => H().bildirimTurleri.filter(t => !t.sabit && push()[t.id]).length;

  // ---------- Hub ----------
  const misafirHub = () => GM.gruplar([
    {baslik: 'Uygulama', satirlar: [
      {ikon: 'mobile-screen', baslik: 'Uygulama ayarları', alt: 'Titreşim, çevrimdışı rotalar, önbellek', git: '#/ayarlar/uygulama'},
      {ikon: 'globe', baslik: 'Dil ve bölge', alt: dilOzet(), git: '#/ayarlar/dil'},
      {ikon: 'konum', baslik: 'Konum', alt: `Varsayılan şehir ${sehir()}`, git: '#/ayarlar/konum'}
    ]},
    yardimGrup(), yasalGrup()
  ], {bas: GM.girisDuvari({ikon: 'user', baslik: 'Hesap ayarların için giriş yap', metin: 'Bildirim tercihlerin, profil görünürlüğün ve **güvenlik ayarların** burada; hesabını silme de.', sunar: [['bell', 'Bildirim tercihleri', '12.30 ve 19.00 önerileri, rezervasyon hatırlatması'], ['eye', 'Profil görünürlüğü', 'Değerlendirmelerinde ve liderlikte adın'], ['lock', 'Güvenlik', 'Şifre, iki adımlı doğrulama, uygulama kilidi']]})});

  const hub = () => {
    if (!GM.uye()) return misafirHub();
    const p = kisi(), ad = adSoyad(), g = ayar('guvenlik'), gz = ayar('gizlilik'), k = kilit();
    return GM.gruplar([
      {baslik: 'Hesap', satirlar: [
        {ikon: 'user', baslik: 'Profil bilgilerim', alt: p.kullaniciAdi ? `@${p.kullaniciAdi} · ${p.eposta}` : 'Ad, kullanıcı adı, e-posta, telefon', git: '#/profil/duzenle'},
        {ikon: 'eye', baslik: 'Profil görünürlüğü', alt: gz.acik ? 'Profilin herkese açık' : 'Profilin gizli', git: '#/ayarlar/gizlilik'},
        {ikon: 'bell', baslik: 'Bildirim tercihleri', alt: `${acikSayi()} tür açık · 12.30 ve 19.00 önerileri`, git: '#/ayarlar/bildirimler'},
        {ikon: 'konum', baslik: 'Konum', alt: `${izin('konum-izin') === 'verildi' ? 'İzin açık' : 'İzin kapalı'} · ${sehir()}`, git: '#/ayarlar/konum'},
        {ikon: 'lock', baslik: 'Güvenlik', alt: `Kilit ${k.acik ? 'açık' : 'kapalı'} · iki adımlı doğrulama ${g.ikiAdim ? 'açık' : 'kapalı'}`, git: '#/ayarlar/guvenlik'}
      ]},
      {baslik: 'Keşif', satirlar: [{ikon: 'filtre', baslik: 'Keşif tercihlerim', alt: 'Mutfak, mekân türü, şehir, bütçe', git: '#/profil/tercihler'}]},
      {baslik: 'Üyelik', satirlar: [
        {ikon: 'box-open', baslik: 'Paketlerim', alt: `${p.paket || 'Ücretsiz'} · ${listeSayi()} / ${SINIR()} liste`, git: '#/paketlerim'},
        {ikon: 'credit-card', baslik: 'Ödemelerim', alt: 'Tahsilat yok · faturalar, kartlar, iadeler', git: '#/odemelerim'},
        {ikon: 'bolt', baslik: 'Dada Gourmet Pro', alt: 'Reklamsız, kendi rotan, geniş sınırlar', git: '#/pro'}
      ]},
      {baslik: 'Uygulama', satirlar: [
        {ikon: 'mobile-screen', baslik: 'Uygulama ayarları', alt: 'Titreşim, çevrimdışı rotalar, önbellek', git: '#/ayarlar/uygulama'},
        {ikon: 'globe', baslik: 'Dil ve bölge', alt: dilOzet(), git: '#/ayarlar/dil'}
      ]},
      {baslik: 'Veri ve hesap', satirlar: [
        {ikon: 'database', baslik: 'Verilerim', alt: 'Gör ve indir', git: '#/ayarlar/veri'},
        {ikon: 'trash-can', baslik: 'Hesabımı sil', git: '#/ayarlar/sil', yikici: true}
      ]},
      yardimGrup(),
      {baslik: 'Yasal', satirlar: [{ikon: 'scale-balanced', baslik: 'Yasal metinler', git: '#/yasal'}, ...YASAL.map(([s, b, i]) => ({ikon: i, baslik: b, git: `#/yasal/${s}`}))]},
      {baslik: 'Oturum', satirlar: [{ikon: 'cikis', baslik: 'Çıkış yap', veri: {eylem: 'cikis'}, ok: false, yikici: true}]},
      {html: GM.veriYok(`Dada Gourmet **${GM.SURUM}**`)}
    ], {bas: GM.parcali([{avatar: {ad: ad || 'D', gorsel: p.foto}, baslik: ad || 'Adını ekle', alt: `${p.paket || 'Ücretsiz'} · Profil bilgilerim`, git: '#/profil/duzenle'}], {aria: 'Profil'})});
  };
  const hubBagla = kok => [GM.eylem(kok, 'cikis', () => GM.dialog({baslik: 'Çıkış yapılsın mı?', metin: 'Bu cihazdaki **oturumun ve kayıtlı tercihlerin** silinir; hesabın ve listelerin kalır.', eylem: 'Çıkış yap', iptal: 'Vazgeç', yikici: true}).then(ok => { if (ok) GM.cikis(); }))];

  // ---------- Bildirim tercihleri ----------
  const izinBant = (tur, metin) => {
    const d = izin(`${tur}-izin`);
    if (d === 'verildi') return '';
    return GM.bant({ton: 'uyari', ikon: tur === 'bildirim' ? 'bell-slash' : 'location-crosshairs', baslik: d === 'reddedildi' ? `${tur === 'bildirim' ? 'Bildirim' : 'Konum'} izni kapalı` : `${tur === 'bildirim' ? 'Bildirim' : 'Konum'} izni verilmedi`, metin, eylem: {metin: d === 'reddedildi' ? 'Ayarları aç' : 'İzin ver', git: `#/izin-reddi?tur=${tur}`}});
  };
  const turToggle = (t, kanal) => GM.toggle({ad: `${kanal}-${t.id}`, ikon: t.ikon, etiket: t.ad, alt: t.sabit ? 'Kapatılamaz' : t.alt, secili: t.sabit || (kanal === 'p' ? push() : eposta())[t.id], pasif: t.sabit});
  const bildirimler = () => {
    const T = H().bildirimTurleri, oneri = T.filter(t => ['ogle', 'aksam'].includes(t.id)), diger = T.filter(t => !['ogle', 'aksam'].includes(t.id)), s = ayar('bildirim').sessiz;
    return GM.gruplar([
      izinBant('bildirim', 'Telefonunda **Dada Gourmet bildirimleri** kapalı; seçimlerin saklanır ama bildirim gelmez.') ? {html: izinBant('bildirim', 'Telefonunda **Dada Gourmet bildirimleri** kapalı; seçimlerin saklanır ama bildirim gelmez.')} : null,
      {baslik: 'Öneri saatleri', html: `<div class="gm-yigin-12">${GM.p('Öğle ve akşam yemeği saatinde **yakınındaki açık mekânlardan** bir öneri. Konumun kapalıysa varsayılan şehrin kullanılır.', {ton: 'ikincil', meta: true})}${GM.satirlar(oneri.map(t => turToggle(t, 'p')))}</div>`},
      {baslik: 'Uygulama bildirimleri', satirlar: diger.map(t => turToggle(t, 'p'))},
      {baslik: 'E-posta', satirlar: T.filter(t => t.eposta || t.sabit || ['rezervasyon', 'etkinlik', 'katki', 'kampanya'].includes(t.id)).map(t => turToggle(t, 'e'))},
      {baslik: 'Sessiz saatler', satirlar: [{ikon: 'moon', baslik: 'Sessiz saatler', alt: 'Bu aralıkta rezervasyon hatırlatması dışında bildirim gelmez', deger: secAd(H().sessizSaatler, s), veri: {eylem: 'sessiz'}}]}
    ]);
  };
  const bildirimBagla = kok => {
    const h = ev => {
      const ad = ev.detail?.ad || '', v = ev.detail?.deger, [kanal, id] = [ad.slice(0, 1), ad.slice(2)], t = H().bildirimTurleri.find(x => x.id === id);
      if (!t || ad[1] !== '-') return;
      if (kanal === 'p') GM.durum.yaz('bildirim-ayar', {...(GM.durum.oku('bildirim-ayar', {}) || {}), [id]: v});
      else if (kanal === 'e') ayarYaz('bildirim', {eposta: {...ayar('bildirim').eposta, [id]: v}});
      else return;
      GM.toast(`**${t.ad}** ${kanal === 'e' ? 'e-postası ' : ''}${v ? 'açıldı' : 'kapatıldı'}`, {ikon: t.ikon, yerine: true});
    };
    kok.addEventListener('gm-degisim', h);
    return [() => kok.removeEventListener('gm-degisim', h),
      GM.eylem(kok, 'sessiz', () => GM.siralaSheet({baslik: 'Sessiz saatler', secili: ayar('bildirim').sessiz, secenekler: H().sessizSaatler.map(([d, a]) => [d, a, d === 'kapali' ? 'bell' : 'moon']), sec: v => { ayarYaz('bildirim', {sessiz: v}); GM.tazele(); GM.toast(`Sessiz saatler: **${secAd(H().sessizSaatler, v)}**`, {ikon: 'moon', yerine: true}); }}))];
  };

  // ---------- Gizlilik ----------
  const gizlilik = () => {
    const g = ayar('gizlilik');
    return GM.gruplar([
      {html: GM.p('Profilinin, değerlendirmelerinin ve listelerinin **kimlere göründüğünü** buradan seç. Verilerini indirmek için Verilerim’e git.', {ton: 'ikincil'})},
      {satirlar: [GM.toggle({ad: 'gz-acik', ikon: 'eye', etiket: 'Profilim herkese açık', alt: 'Kapalıyken rozetlerin ve listelerin yalnız sana görünür', secili: g.acik})]},
      {baslik: 'Topluluk', satirlar: [
        GM.toggle({ad: 'gz-yorumAd', ikon: 'yildiz', etiket: 'Değerlendirmelerimde adım görünsün', alt: 'Kapalıyken “Gurme üye” olarak görünürsün', secili: g.yorumAd}),
        GM.toggle({ad: 'gz-liderlik', ikon: 'ranking-star', etiket: 'Liderlikte görün', alt: 'Kapalıyken yalnız kendi sıranı görürsün', secili: g.liderlik})
      ]},
      {baslik: 'Yeni listelerin görünürlüğü', html: `<div class="gm-yigin-8" role="radiogroup" aria-label="Yeni listelerin görünürlüğü">${[['ozel', 'Gizli', 'Yalnız ben görürüm'], ['paylasilabilir', 'Bağlantısı olan görebilir', 'Bağlantıyı paylaştığın kişiler açar']].map(([d, e, a]) => GM.radio({ad: 'gz-liste', deger: d, etiket: e, alt: a, secili: g.liste === d})).join('')}</div>`},
      {satirlar: [{ikon: 'database', baslik: 'Verilerim', alt: 'Gör ve indir', git: '#/ayarlar/veri'}]}
    ]);
  };
  const gizlilikBagla = kok => {
    const h = ev => {
      const ad = ev.detail?.ad || ''; if (!ad.startsWith('gz-')) return;
      const k = ad.slice(3), v = ev.detail.deger; ayarYaz('gizlilik', {[k]: v});
      const M = {acik: ['Profilin herkese açık', 'Profilin gizlendi'], yorumAd: ['Değerlendirmelerinde adın görünür', 'Değerlendirmelerinde adın gizlendi'], liderlik: ['Liderlikte görünürsün', 'Liderlikte gizlendin']};
      GM.toast(k === 'liste' ? `Yeni listeler: **${v === 'ozel' ? 'Gizli' : 'Bağlantısı olan görebilir'}**` : `**${M[k][v ? 0 : 1]}**`, {ikon: 'eye', yerine: true});
    };
    kok.addEventListener('gm-degisim', h);
    return [() => kok.removeEventListener('gm-degisim', h)];
  };

  // ---------- Konum ----------
  const konum = () => {
    const k = ayar('konum'), d = izin('konum-izin');
    return GM.gruplar([
      {html: GM.p('Harita, Keşfet vitrini ve **yakınındaki öneriler** konumuna göre sıralanır. Konum kapalıyken varsayılan şehrin kullanılır.', {ton: 'ikincil'})},
      d !== 'verildi' ? {html: izinBant('konum', 'Konum izni olmadan **yakınımdaki mekânlar** ve rota yaklaşma uyarısı çalışmaz.')} : null,
      {baslik: 'İzin', satirlar: [{ikon: 'konum', baslik: 'Konum izni', alt: d === 'verildi' ? 'Uygulamayı kullanırken' : d === 'reddedildi' ? 'Kapalı · telefon ayarlarından açılır' : 'Henüz sorulmadı', duz: true, sag: GM.durumRozet(d === 'verildi' ? {metin: 'Açık', ton: 'basari', ikon: 'onay'} : {metin: 'Kapalı', ton: 'uyari', ikon: 'uyari'})}]},
      {baslik: 'Kullanım', satirlar: [
        GM.toggle({ad: 'kn-hassas', ikon: 'location-crosshairs', etiket: 'Hassas konum', alt: 'Yakınındaki mekânlar metre hassasiyetinde', secili: k.hassas, pasif: d !== 'verildi'}),
        GM.toggle({ad: 'kn-arkaPlan', ikon: 'rota', etiket: 'Rota sırasında arka planda', alt: 'Yalnız aktif rotada; durağa 3 km kala uyarı için', secili: k.arkaPlan, pasif: d !== 'verildi'})
      ]},
      {baslik: 'Varsayılan şehir', satirlar: [{ikon: 'sehir', baslik: 'Şehir', alt: 'Konum kapalıyken öneriler bu şehirden', deger: sehir(), veri: {eylem: 'sehir'}}]}
    ]);
  };
  const konumBagla = kok => {
    const h = ev => { const ad = ev.detail?.ad || ''; if (!ad.startsWith('kn-')) return; const k = ad.slice(3), v = ev.detail.deger; ayarYaz('konum', {[k]: v}); GM.toast(`**${k === 'hassas' ? 'Hassas konum' : 'Arka planda konum'}** ${v ? 'açıldı' : 'kapatıldı'}`, {ikon: 'konum', yerine: true}); };
    kok.addEventListener('gm-degisim', h);
    return [() => kok.removeEventListener('gm-degisim', h),
      GM.eylem(kok, 'sehir', () => GM.siralaSheet({baslik: 'Varsayılan şehir', secili: sehir(), secenekler: SEHIRLER.map(s => [s, s, 'sehir']), sec: v => { GM.durum.yaz('konum-sehir', v); GM.tazele(); GM.toast(`Varsayılan şehir **${v}**`, {ikon: 'sehir', yerine: true}); }}))];
  };

  // ---------- Dil ve bölge ----------
  const dil = () => {
    const d = ayar('dil');
    return GM.gruplar([
      {baslik: 'Uygulama dili', html: `<div class="gm-yigin-8" role="radiogroup" aria-label="Uygulama dili">${GM.radio({ad: 'dl-dil', deger: 'tr', etiket: 'Türkçe', secili: d.dil !== 'en'})}${GM.radio({ad: 'dl-dil', deger: 'en', etiket: 'English', alt: 'Yakında', secili: d.dil === 'en', pasif: true})}</div>`},
      {baslik: 'Bölge', satirlar: [
        {ikon: 'globe', baslik: 'Ülke', deger: 'Türkiye', ok: false},
        {ikon: 'fiyat', baslik: 'Para birimi', deger: '₺ TL', ok: false},
        {ikon: 'saat', baslik: 'Saat biçimi', deger: '24 saat', ok: false}
      ]},
      {baslik: 'Uzaklık birimi', html: `<div class="gm-yigin-8" role="radiogroup" aria-label="Uzaklık birimi">${GM.radio({ad: 'dl-birim', deger: 'km', etiket: 'Kilometre', secili: d.birim !== 'mil'})}${GM.radio({ad: 'dl-birim', deger: 'mil', etiket: 'Mil', secili: d.birim === 'mil'})}</div>`},
      {html: GM.p('Mekân adları ve menüler **mekânın kendi dilinde** kalır; rota mesafeleri seçtiğin birimle yazılır.', {ton: 'ikincil', meta: true})}
    ]);
  };
  const dilBagla = kok => {
    const h = ev => { const ad = ev.detail?.ad; if (ad === 'dl-dil') { ayarYaz('dil', {dil: ev.detail.deger}); GM.toast('Uygulama dili **Türkçe**', {ikon: 'globe', yerine: true}); } if (ad === 'dl-birim') { ayarYaz('dil', {birim: ev.detail.deger}); GM.toast(`Uzaklık birimi **${ev.detail.deger === 'mil' ? 'mil' : 'kilometre'}**`, {ikon: 'ruler', yerine: true}); } };
    kok.addEventListener('gm-degisim', h);
    return [() => kok.removeEventListener('gm-degisim', h)];
  };

  // ---------- Güvenlik ----------
  const oturumlar = () => (GM.yeniHesap() ? H().oturumlar.filter(o => o.bu) : H().oturumlar.filter(o => !ayar('guvenlik').kapatilan.includes(o.id)));
  const guvenlik = () => {
    const g = ayar('guvenlik'), k = kilit(), ka = kilitAd(), hizli = !!GM.durum.oku('hizli-giris', false), o = oturumlar(), sso = g.sso || {};
    const ssoSatir = (id, ad, ikon) => ({ikon, baslik: ad, alt: sso[id] ? 'Bağlı' : 'Bağlı değil', duz: true, sag: GM.btn(sso[id] ? {metin: 'Kaldır', tur: 'secondary', boyut: 'sm', veri: {eylem: 'sso', id}} : {metin: 'Bağla', tur: 'tonal', boyut: 'sm', veri: {eylem: 'sso', id}})});
    return GM.gruplar([
      {baslik: 'Uygulama kilidi', satirlar: [
        GM.toggle({ad: 'kl-acik', ikon: ka === 'Face ID' ? 'face-smile' : 'fingerprint', etiket: `${ka} ile kilitle`, alt: 'Rezervasyonların, listelerin ve Dada Puan’ın kilit altında', secili: k.acik}),
        ...(k.acik ? [{ikon: 'clock', baslik: 'Kilitlenme', alt: 'Uygulamadan çıkınca', deger: secAd(GECIKME, k.gecikme), veri: {eylem: 'gecikme'}}] : []),
        {ikon: 'lock', baslik: 'Kilit ekranını dene', git: '#/kilit?dene=1'}
      ]},
      {baslik: 'Giriş', satirlar: [
        GM.toggle({ad: 'hizli-giris', ikon: 'bolt', etiket: `${ka} ile hızlı giriş`, alt: 'Şifre yazmadan bu cihazdan giriş', secili: hizli}),
        {ikon: 'key', baslik: 'Şifre', alt: `Son değişim ${once(g.sifreTarih)}`, veri: {eylem: 'sifre'}},
        GM.toggle({ad: 'iki-adim', ikon: 'shield-halved', etiket: 'İki adımlı doğrulama', alt: 'Girişte telefonuna gelen kod da istenir', secili: g.ikiAdim}),
        ...(g.ikiAdim ? [{ikon: g.yontem === 'uygulama' ? 'mobile-screen' : 'comment-sms', baslik: 'Doğrulama yöntemi', deger: g.yontem === 'uygulama' ? 'Doğrulayıcı uygulama' : 'SMS', veri: {eylem: 'yontem'}}] : [])
      ]},
      {baslik: 'Giriş yöntemleri', satirlar: [
        {ikon: 'envelope', baslik: 'E-posta ve şifre', alt: kisi().eposta, duz: true, sag: GM.durumRozet({metin: 'Ana yöntem', ton: 'notr', ikon: 'onay'})},
        ssoSatir('apple', 'Apple', 'mobile-screen'), ssoSatir('google', 'Google', 'globe')
      ]},
      {baslik: 'Açık oturumlar', satirlar: o.map(x => ({ikon: x.ikon, baslik: x.cihaz, alt: `${x.yer} · ${x.zaman}`, duz: true, sag: x.bu ? GM.durumRozet({metin: 'Bu cihaz', ton: 'basari', ikon: 'onay'}) : GM.btn({metin: 'Kapat', tur: 'secondary', boyut: 'sm', veri: {eylem: 'oturum-kapat', id: x.id}})})),
        html: o.length > 1 ? `<div class="gm-sira">${GM.btn({metin: 'Diğer oturumları kapat', ikon: 'cikis', tur: 'yikici-metin', boyut: 'sm', veri: {eylem: 'oturum-hepsi'}})}</div>` : ''}
    ]);
  };
  const kurallar = () => H().giris.sifreKurallari;
  const sifreForm = (d = {}, h = {}) => `<div class="gm-yigin">${GM.input({ad: 'mevcut', etiket: 'Mevcut şifre', ikon: 'lock', tur: 'password', deger: d.mevcut, hata: h.mevcut, otomatik: 'current-password'})}${GM.input({ad: 'yeni', etiket: 'Yeni şifre', ikon: 'key', tur: 'password', deger: d.yeni, hata: h.yeni, otomatik: 'new-password', yardim: H().giris.sifreKurali})}${GM.input({ad: 'tekrar', etiket: 'Yeni şifre (tekrar)', ikon: 'key', tur: 'password', deger: d.tekrar, hata: h.tekrar, otomatik: 'new-password'})}</div>`;
  const veIle = l => (l.length > 1 ? `${l.slice(0, -1).join(', ')} ve ${l[l.length - 1]}` : l[0] || '');
  const sifreSheet = () => GM.sheet({baslik: 'Şifreyi değiştir', html: `<div data-yuva="sifre">${sifreForm()}</div>`, altBar: GM.btn({metin: 'Şifremi kaydet', ikon: 'onay', tam: true, veri: {eylem: 'sifre-kaydet'}}), sonra: s => GM.eylem(s, 'sifre-kaydet', el => {
    const v = a => s.querySelector(`[name="${a}"]`)?.value || '', d = {mevcut: v('mevcut'), yeni: v('yeni'), tekrar: v('tekrar')};
    const eksik = kurallar().filter(k => !new RegExp(k.desen).test(d.yeni)).map(k => k.ad), kayitli = ayar('guvenlik').sifre || H().giris.sifre;
    const h = {mevcut: !d.mevcut ? 'Mevcut şifreni yaz' : d.mevcut !== kayitli && !GM.yeniHesap() ? 'Mevcut şifre hatalı' : '', yeni: !d.yeni ? 'Yeni şifreni yaz' : eksik.length ? `Şifrende eksik: ${veIle(eksik)}` : d.yeni === d.mevcut ? 'Yeni şifre eskisiyle aynı olamaz' : '', tekrar: d.yeni && d.yeni !== d.tekrar ? 'Şifreler birbiriyle aynı değil' : ''};
    if (h.mevcut || h.yeni || h.tekrar) { s.querySelector('[data-yuva="sifre"]').innerHTML = sifreForm(d, h); GM.titres(20); return; }
    GM.mesgul(el).then(() => { ayarYaz('guvenlik', {sifre: d.yeni, sifreTarih: GM.bugunIso()}); s.kapat(); GM.tazele(); GM.toast('Şifren **güncellendi**; diğer cihazlarda yeniden giriş istenir', {tur: 'basari'}); });
  })});
  const guvenlikBagla = kok => {
    const h = ev => {
      const ad = ev.detail?.ad, v = ev.detail?.deger;
      if (ad === 'kl-acik') {
        if (!v) { GM.durum.yaz('uygulama-kilidi', {...kilit(), acik: false}); GM.tazele(); GM.toast('**Uygulama kilidi** kapatıldı', {ikon: 'lock-open', yerine: true}); return; }
        GM.biyometrikIstem({platform: kilit().platform || 'ios', neden: 'Uygulama kilidini açmak için'}).then(s => {
          if (s === 'basari') { GM.durum.yaz('uygulama-kilidi', {...kilit(), acik: true}); GM.toast(`**${kilitAd()}** ile kilit açıldı`, {tur: 'basari'}); } else GM.toast('Doğrulama olmadı; **kilit kapalı** kaldı', {ikon: 'bilgi'});
          GM.tazele();
        });
      }
      if (ad === 'hizli-giris') { GM.durum.yaz('hizli-giris', v); GM.toast(`**${kilitAd()} ile hızlı giriş** ${v ? 'açıldı' : 'kapatıldı'}`, {ikon: 'bolt', yerine: true}); }
      if (ad === 'iki-adim') { ayarYaz('guvenlik', {ikiAdim: v}); GM.tazele(); GM.toast(v ? 'İki adımlı doğrulama **açıldı**; kod SMS ile gelir' : 'İki adımlı doğrulama **kapatıldı**', {ikon: 'shield-halved', yerine: true}); }
    };
    kok.addEventListener('gm-degisim', h);
    return [() => kok.removeEventListener('gm-degisim', h),
      GM.eylem(kok, 'gecikme', () => GM.siralaSheet({baslik: 'Kilitlenme', secili: kilit().gecikme, secenekler: GECIKME, sec: v => { GM.durum.yaz('uygulama-kilidi', {...kilit(), gecikme: v}); GM.tazele(); }})),
      GM.eylem(kok, 'yontem', () => GM.siralaSheet({baslik: 'Doğrulama yöntemi', secili: ayar('guvenlik').yontem, secenekler: [['sms', 'SMS', 'comment-sms'], ['uygulama', 'Doğrulayıcı uygulama', 'mobile-screen']], sec: v => { ayarYaz('guvenlik', {yontem: v}); GM.tazele(); }})),
      GM.eylem(kok, 'sifre', sifreSheet),
      GM.eylem(kok, 'sso', el => {
        const id = el.dataset.id, ad = id === 'apple' ? 'Apple' : 'Google', sso = ayar('guvenlik').sso || {};
        if (sso[id]) { GM.dialog({baslik: `${ad} bağlantısı kaldırılsın mı?`, metin: `Bundan sonra **${ad}** ile giriş yapamazsın; e-posta ve şifren kalır.`, eylem: 'Kaldır', iptal: 'Vazgeç', yikici: true}).then(ok => { if (!ok) return; ayarYaz('guvenlik', {sso: {...sso, [id]: false}}); GM.tazele(); GM.toast(`**${ad}** bağlantısı kaldırıldı`, {ikon: 'bilgi'}); }); return; }
        GM.mesgul(el).then(() => { ayarYaz('guvenlik', {sso: {...sso, [id]: true}}); GM.tazele(); GM.toast(`**${ad}** hesabın bağlandı`, {tur: 'basari'}); });
      }),
      GM.eylem(kok, 'oturum-kapat', el => { const x = H().oturumlar.find(o => o.id === el.dataset.id); GM.dialog({baslik: 'Oturum kapatılsın mı?', metin: `**${x.cihaz}** cihazındaki oturum kapanır.`, eylem: 'Kapat', iptal: 'Vazgeç', yikici: true}).then(ok => { if (!ok) return; ayarYaz('guvenlik', {kapatilan: [...ayar('guvenlik').kapatilan, x.id]}); GM.tazele(); GM.toast(`**${x.cihaz}** oturumu kapatıldı`, {ikon: 'cikis'}); }); }),
      GM.eylem(kok, 'oturum-hepsi', () => GM.dialog({baslik: 'Diğer oturumlar kapatılsın mı?', metin: 'Bu cihaz dışındaki **bütün oturumlar** kapanır.', eylem: 'Hepsini kapat', iptal: 'Vazgeç', yikici: true}).then(ok => { if (!ok) return; ayarYaz('guvenlik', {kapatilan: H().oturumlar.filter(o => !o.bu).map(o => o.id)}); GM.tazele(); GM.toast('Diğer oturumlar **kapatıldı**', {ikon: 'cikis'}); }))];
  };

  // ---------- Uygulama ----------
  const titresim = () => GM.durum.oku('titresim', true) !== false;
  const izinAlt = k => ({verildi: 'Açık · telefon ayarlarından yönetilir', reddedildi: 'Kapalı · telefon ayarlarından açılır'}[izin(k)] || 'Henüz izin verilmedi');
  const uygulama = () => GM.gruplar([
    {baslik: 'Genel', satirlar: [
      {ikon: 'globe', baslik: 'Dil ve bölge', alt: dilOzet(), git: '#/ayarlar/dil'},
      GM.toggle({ad: 'titresim', ikon: 'mobile-screen-button', etiket: 'Titreşim', alt: 'Kayıtta ve onaylarda kısa titreşim', secili: titresim()})
    ]},
    {baslik: 'Rota ve telefon', satirlar: [
      {ikon: 'cevrimdisi', baslik: 'Çevrimdışı rotalar', alt: 'İndirilen rotalar ve boyutları', git: '#/rota/cevrimdisi'},
      {ikon: 'table-cells-large', baslik: 'Telefon özellikleri', alt: 'Kilit ekranı, Dinamik Ada, widget', git: '#/rota/telefon'},
      {ikon: 'carplay', baslik: 'CarPlay ve Android Auto', git: '#/rota/arac'}
    ]},
    {baslik: 'İzinler', satirlar: [
      {ikon: 'bell', baslik: 'Bildirim izni', alt: izinAlt('bildirim-izin'), git: izin('bildirim-izin') === 'verildi' ? '#/ayarlar/bildirimler' : '#/izin-reddi?tur=bildirim'},
      {ikon: 'konum', baslik: 'Konum izni', alt: izinAlt('konum-izin'), git: '#/ayarlar/konum'}
    ]},
    {baslik: 'Depolama', satirlar: [
      {ikon: 'broom', baslik: 'Önbelleği temizle', alt: `Görseller ve geçici dosyalar · ${GM.sayi(ayar('veri').onbellekMb)} MB`, veri: {eylem: 'onbellek'}, ok: false},
      {ikon: 'rotate-left', baslik: 'Uygulamayı sıfırla', alt: 'Bu cihazdaki oturum ve ayarlar silinir', veri: {eylem: 'sifirla'}, ok: false, yikici: true}
    ]},
    {baslik: 'Hakkında', satirlar: [{ikon: 'circle-info', baslik: 'Dada Gourmet', deger: `Sürüm ${GM.SURUM}`, ok: false}]},
    {baslik: 'Yasal metinler', satirlar: [{ikon: 'scale-balanced', baslik: 'Tüm yasal metinler', git: '#/yasal'}, ...YASAL.map(([s, b, i]) => ({ikon: i, baslik: b, git: `#/yasal/${s}`}))]}
  ]);
  const uygulamaBagla = kok => [
    GM.on(kok, 'titresim', v => { GM.durum.yaz('titresim', v); if (v) GM.titres(12); GM.toast(`**Titreşim** ${v ? 'açıldı' : 'kapatıldı'}`, {ikon: 'mobile-screen-button', yerine: true}); }),
    GM.eylem(kok, 'onbellek', () => GM.dialog({baslik: 'Önbellek temizlensin mi?', metin: 'Görseller yeniden indirilir; **listelerin ve çevrimdışı rotaların** silinmez.', eylem: 'Temizle', iptal: 'Vazgeç'}).then(ok => { if (!ok) return; ayarYaz('veri', {onbellekMb: 0}); GM.tazele(); GM.toast('Önbellek **temizlendi**', {tur: 'basari'}); })),
    GM.eylem(kok, 'sifirla', () => GM.dialog({baslik: 'Uygulama sıfırlansın mı?', metin: 'Bu cihazdaki **oturum, ayarlar ve çevrimdışı rotalar** silinir; uygulama ilk açılıştaki gibi başlar.', eylem: 'Sıfırla', iptal: 'Vazgeç', yikici: true}).then(ok => { if (!ok) return; GM.durum.sifirla(); history.replaceState(null, '', '#/splash'); location.reload(); }))
  ];

  // ---------- Verilerim ----------
  const veri = () => GM.gruplar([
    {html: GM.p('Hesabındaki kayıtların bir kopyasını **makinece okunur bir dosya** olarak isteyebilirsin. Paket hazırlanınca e-posta adresine bağlantı gelir.', {ton: 'ikincil'})},
    {baslik: 'Pakette neler var?', html: GM.maddeler([['user', 'Profil ve tercihler', 'Ad, iletişim, keşif tercihlerin'], ['rezervasyon', 'Rezervasyonların', 'Talepler, onaylar, ziyaretler'], ['favori', 'Favoriler ve listeler', 'Mekân, lezzet, etkinlik, rota'], ['yildiz', 'Değerlendirmeler ve katkılar', 'Puanların, fotoğrafların, önerilerin'], ['puanDada', 'Dada Puan hareketlerin', 'Kesinleşen, bekleyen, düşen'], ['rota', 'Rotaların', 'Kaydettiğin ve web’den gönderdiğin']])},
    {satirlar: [{ikon: 'download', baslik: 'Verilerimi indir', alt: kisi().eposta, veri: {eylem: 'indir'}, ok: false}]},
    {baslik: 'İlgili', satirlar: [
      {ikon: 'eye', baslik: 'Profil görünürlüğü', git: '#/ayarlar/gizlilik'},
      {ikon: 'file-lines', baslik: 'KVKK Aydınlatma Metni', git: '#/yasal/kvkk'},
      {ikon: 'trash-can', baslik: 'Hesabımı sil', git: '#/ayarlar/sil', yikici: true}
    ]}
  ]);
  const veriBagla = kok => [GM.eylem(kok, 'indir', el => GM.mesgul(el).then(() => GM.toast(`Veri paketin hazırlanıyor; hazır olunca **${kisi().eposta}** adresine gelir`, {tur: 'basari', ikon: 'download'})))];

  // ---------- Hesabımı sil ----------
  const SIL_METIN = 'HESABIMI SİL';
  const sil = () => GM.gruplar([
    {html: GM.bant({ton: 'hata', baslik: '30 gün bekleme', metin: 'Silme talebinden sonra hesabın **30 gün** askıda kalır. Bu sürede giriş yaparsan silme iptal olur; sonra geri alınamaz.'})},
    {baslik: 'Neler silinir?', html: GM.maddeler([['user', 'Profilin ve giriş bilgilerin', 'Apple ve Google bağlantıları dahil'], ['rezervasyon', 'Rezervasyon geçmişin', 'Bekleyen taleplerin iptal edilir'], ['favori', 'Favorilerin, listelerin ve rotaların', 'Paylaştığın bağlantılar açılmaz'], ['puanDada', 'Dada Puan’ın ve rozetlerin', 'Puan başka hesaba aktarılmaz']])},
    {html: GM.p('Yayındaki değerlendirmelerin ve kabul edilen önerilerin **adın kaldırılarak** sitede kalır.', {ton: 'ikincil', meta: true})},
    {baslik: 'Onay', html: `<div class="gm-yigin">${GM.checkbox({ad: 'sil-onay', etiket: 'Silinecekleri okudum, anladım'})}${GM.input({ad: 'sil-yaz', etiket: `Onaylamak için ${SIL_METIN} yaz`, yer: SIL_METIN, otomatik: 'off'})}<div data-yuva="sil-btn">${GM.btn({metin: 'Hesabımı sil', ikon: 'trash-can', tur: 'yikici', tam: true, pasif: true, veri: {eylem: 'sil'}})}</div>${GM.btn({metin: 'Vazgeç', tur: 'secondary', tam: true, geri: true})}</div>`}
  ]);
  const silBagla = kok => {
    const hazir = () => kok.querySelector('[name="sil-onay"]')?.checked && (kok.querySelector('[name="sil-yaz"]')?.value || '').trim().toLocaleUpperCase('tr') === SIL_METIN;
    const guncelle = () => { const b = kok.querySelector('[data-eylem="sil"]'); if (b) b.disabled = !hazir(); };
    kok.addEventListener('input', guncelle); kok.addEventListener('change', guncelle);
    return [() => { kok.removeEventListener('input', guncelle); kok.removeEventListener('change', guncelle); },
      GM.eylem(kok, 'sil', () => { if (!hazir()) return; GM.dialog({baslik: 'Hesabın silinsin mi?', metin: '30 gün içinde giriş yapmazsan **hesabın kalıcı olarak silinir**.', eylem: 'Hesabımı sil', iptal: 'Vazgeç', yikici: true}).then(ok => { if (!ok) return; GM.toast('Silme talebin alındı; **30 gün** içinde giriş yaparsan iptal olur', {ikon: 'trash-can'}); setTimeout(() => GM.cikis('#/karsilama'), GM.azHareket() ? 0 : GM.TK.motion.reveal * 4); }); })];
  };

  const CIZ = {bildirimler, gizlilik, konum, dil, guvenlik, uygulama, veri, sil};
  const BAGLA = {bildirimler: bildirimBagla, gizlilik: gizlilikBagla, konum: konumBagla, dil: dilBagla, guvenlik: guvenlikBagla, uygulama: uygulamaBagla, veri: veriBagla, sil: silBagla};

  GM.ekran('ayarlar', {
    tur: 'alt', baslik: 'Hesap ayarları', ust: '#/profil', iskelet: 'satir', yenile: true,
    ciz: () => hub(),
    sonra: kok => { const c = GM.uye() ? hubBagla(kok) : []; return () => c.forEach(f => f()); }
  });
  GM.ekran('ayarlar-bolum', {
    tur: 'alt', ust: '#/ayarlar', iskelet: 'satir', yenile: true,
    baslik: ctx => BOLUM[ctx.param.bolum] || 'Hesap ayarları',
    ciz: ctx => {
      const b = ctx.param.bolum;
      if (!CIZ[b]) return GM.hataEkran({tur: 'bulunamadi', eylem: {metin: 'Hesap ayarlarına dön', yerine: '#/ayarlar'}, ikinciller: []});
      if (kapali(b)) return GM.girisGerekli({ikon: GIRIS[b][0], baslik: BOLUM[b], metin: GIRIS[b][1]});
      return CIZ[b](ctx);
    },
    sonra: (kok, ctx) => { const b = ctx.param.bolum; if (!CIZ[b] || kapali(b)) return null; const c = BAGLA[b]?.(kok, ctx) || []; return () => c.forEach(f => f()); }
  });

  // ---------- Paketlerim ve Pro ----------
  const K = () => H().kademeler;
  const hucre = v => (v === true ? 'Var' : v === false ? 'Yok' : v);
  const kademeSatir = (k, o = {}) => ({ikon: k.ikon, baslik: k.fiyat ? `${k.ad} · ${k.fiyat}${k.birim && k.birim !== 'her zaman' ? ` ${k.birim}` : ''}` : k.ad, alt: k.ozet, ozet: true, ek: k.not ? GM.durumRozet({metin: k.not, ton: k.k === 'pro-max' ? 'notr' : 'uyari', ikon: k.k === 'pro-max' ? 'clock' : 'hourglass-half'}) : o.mevcut === k.k ? GM.durumRozet({metin: 'Mevcut paketin', ton: 'basari', ikon: 'onay'}) : '', ...(o.git ? {git: o.git} : {duz: true})});
  const karsilastir = ctx => {
    const i = {ucretsiz: 1, pro: 2, 'pro-max': 3}[ctx.kademe || 'pro'];
    return `<div class="gm-yigin-12">${GM.segment({ad: 'kademe', secili: ctx.kademe || 'pro', ogeler: K().map(k => ({ad: k.ad, deger: k.k}))})}${GM.satirlar(H().matris.map(r => ({baslik: r[0], deger: hucre(r[i]), ok: false})))}</div>`;
  };
  const proBant = () => { const p = H().proDurum; return GM.bant({ton: 'bilgi', ikon: 'clock', baslik: `Pro · ${p.rozet}`, metin: `${p.durumMetni} ${p.fiyatNotu}`}); };
  const haberToggle = () => GM.toggle({ad: 'pro-haber', ikon: 'bell', etiket: 'Açılınca haber ver', alt: 'Pro satın alımı açılınca tek bildirim', secili: !!GM.durum.oku('pro-haber', false)});
  const haberBagla = kok => GM.on(kok, 'pro-haber', v => { GM.durum.yaz('pro-haber', v); GM.toast(v ? 'Pro açılınca **haber vereceğiz**' : 'Pro bildirimi **kapatıldı**', {ikon: 'bell', yerine: true}); });

  GM.ekran('paketlerim', {
    tur: 'alt', baslik: 'Paketlerim', ust: '#/profil', iskelet: 'satir', yenile: true,
    ciz: ctx => {
      if (!GM.uye()) return `${GM.girisGerekli({ikon: 'box-open', baslik: 'Paketlerin', metin: 'Paketini ve **kullanım sınırlarını** görmek için giriş yap.'})}<div class="gm-ic">${GM.btn({metin: 'Dada Gourmet Pro’yu incele', ikon: 'bolt', tur: 'text', tam: true, git: '#/pro'})}</div>`;
      const p = kisi(), n = listeSayi(), mevcut = 'ucretsiz';
      return GM.gruplar([
        {baslik: 'Mevcut paketin', satirlar: [kademeSatir(K()[0], {mevcut})], html: GM.veriYok(p.uyelikTarih ? `**${p.uyelikTarih}**’dan beri üyesin.` : '**Bugün** üye oldun.')},
        {baslik: 'Kullanımın', html: `<div class="gm-yigin">${GM.ilerleme({etiket: 'Listelerim', n: Math.min(n, SINIR()), hedef: SINIR(), deger: `${n} / ${SINIR()} liste`})}${GM.ilerleme({etiket: 'Mekân Bul sihirbazı (bugün)', n: 0, hedef: 3, deger: '0 / 3 tur'})}${n >= SINIR() ? GM.bant({ton: 'bilgi', metin: `**${SINIR()} listenin hepsini** kullanıyorsun; yeni liste Pro’da açılır (Pro’da 25 liste).`}) : ''}</div>`},
        {baslik: 'Paket kademeleri', eylem: {metin: 'Pro', git: '#/pro'}, satirlar: K().map(k => kademeSatir(k, {mevcut, git: '#/pro'}))},
        {baslik: 'Karşılaştır', html: karsilastir(ctx)},
        {baslik: 'Pro’ya geçiş', html: `<div class="gm-yigin-12">${proBant()}${GM.btn({metin: 'Pro’ya geç · Yakında', ikon: 'bolt', tam: true, pasif: true})}${GM.satirlar([haberToggle()])}</div>`},
        {baslik: 'Ödemeler', satirlar: [{ikon: 'credit-card', baslik: 'Ödemelerim', alt: 'Tahsilat yok · faturalar, kartlar, iadeler', git: '#/odemelerim'}]}
      ]);
    },
    sonra: (kok, ctx) => { if (!GM.uye()) return null; const c = [haberBagla(kok), GM.on(kok, 'kademe', v => { ctx.kademe = v; GM.tazele(); })]; return () => c.forEach(f => f()); }
  });

  GM.ekran('pro', {
    tur: 'banner', baslik: 'Dada Gourmet Pro', ust: '#/paketlerim', iskelet: 'detay', yenile: true,
    ciz: ctx => GM.kubbe({gorsel: 'assets/gorsel/hero/tabak.webp', etiket: 'Pro', baslik: 'Dada Gourmet Pro', alt: 'Pro, keşfinin tamamını açar', html: `<div class="gm-ic gm-yigin-24">
      ${GM.p('Pro’da **reklamlar kalkar**, kendi rotanı oluşturur, durak ziyaretlerini işaretler ve rotanı bağlantıyla paylaşırsın. Aylık aboneliktir; istediğin an yükseltir ya da bırakırsın.')}
      ${GM.maddeler([['ban', 'Reklamsız deneyim', 'Tüm Pro planlarda reklam yok.'], ['rota', 'Kendi rotan', 'Pro’da 5 rota, Pro Max’ta sınırsız; durak işaretleme ve paylaşım.'], ['list', 'Liste ve keşif sınırları', '25 liste, Mekân Bul’da günde 25 tur, son 12 ay ziyaret defteri.']])}
      ${proBant()}
      <div class="gm-yigin-12">${GM.bas('Planlar')}${GM.satirlar(K().map(k => kademeSatir(k, {mevcut: GM.uye() ? 'ucretsiz' : null})))}</div>
      <div class="gm-yigin-12">${GM.bas('Planları karşılaştır')}${karsilastir(ctx)}</div>
      ${GM.uye() ? GM.satirlar([haberToggle()]) : ''}
    </div>`}),
    altBar: () => GM.altEylem({dugmeler: [GM.uye() ? {metin: 'Haber ver', ikon: 'bell', tur: 'secondary', veri: {eylem: 'haber'}} : {metin: 'Ücretsiz üye ol', tur: 'secondary', git: '#/karsilama'}, {metin: 'Pro · Yakında', ikon: 'bolt', pasif: true}]}),
    sonra: (kok, ctx) => {
      const c = [GM.on(kok, 'kademe', v => { ctx.kademe = v; GM.tazele(); }), GM.eylem(kok, 'haber', () => { GM.durum.yaz('pro-haber', true); GM.tazele(); GM.toast('Pro açılınca **haber vereceğiz**', {ikon: 'bell', tur: 'basari', yerine: true}); })];
      if (GM.uye()) c.push(haberBagla(kok));
      return () => c.forEach(f => f());
    }
  });
  // ---------- Ödemelerim (#/odemelerim): web hesabim/odemelerim (Abonelik ödemeleri · Faturalar · Kayıtlı kartlar · İade talepleri), Diet odemelerim.js kalıbı ----------
  // Pro satışa açılmadığı için tahsilat, fatura, kart ve iade kaydı yoktur: her sekme dürüst boş hâl; uydurma tutar yok. Fatura bilgisi ve kampanya kodu çalışır.
  // ?sekme=gecmis|faturalar|kartlar|iade. Durum: 'fatura-bilgi' {tip, ad, eposta, il, adres, unvan, vergiDairesi, vkn}.
  const ODEME_SEKME = [['gecmis', 'Ödemeler'], ['faturalar', 'Faturalar'], ['kartlar', 'Kartlar'], ['iade', 'İadeler']];   // kısa etiket: dört sekme kaydırmadan sığar
  const ODEME_BOS = {
    gecmis: {ikon: 'credit-card', baslik: 'Henüz ödemen yok', metin: 'Pro satışa açılıp üyelik aldığında **abonelik ödemelerin** burada listelenir.', eylem: {metin: 'Pro’yu incele', ikon: 'bolt', tur: 'secondary', git: '#/pro'}},
    faturalar: {ikon: 'file-invoice', baslik: 'Faturan yok', metin: 'Üyelik, rehber ve iade faturaların **e-arşiv** olarak burada durur; e-postana da gönderilir.'},
    kartlar: {ikon: 'credit-card', baslik: 'Kayıtlı kartın yok', metin: 'Kart, ödeme kuruluşunun **güvenli sayfasında** saklanır; Dada Gourmet kart numaranı görmez. Kart ekleme Pro satışıyla açılır.', eylem: {metin: 'Kart ekle · Yakında', ikon: 'ekle', tur: 'secondary', pasif: true}},
    iade: {ikon: 'rotate-left', baslik: 'İade talebin yok', metin: 'İade ya da itiraz talebin olursa **sonucu ve tutarı** burada görünür.', eylem: {metin: 'Çözüm merkezi', tur: 'secondary', git: '#/cozum-merkezi'}}
  };
  const fatura = () => ({tip: 'bireysel', ad: adSoyad(), eposta: kisi().eposta || '', il: kisi().sehir || '', adres: '', ...(GM.durum.oku('fatura-bilgi', {}) || {})});
  const faturaForm = (f, h = {}) => `<div class="gm-yigin">${GM.alan({etiket: 'Fatura tipi', html: `<div class="gm-yigin-8" role="radiogroup" aria-label="Fatura tipi">${[['bireysel', 'Bireysel', 'TC kimlik numarası gerekmez'], ['kurumsal', 'Kurumsal', 'Unvan, vergi dairesi ve vergi numarası']].map(([d, e, a]) => GM.radio({ad: 'fb-tip', deger: d, etiket: e, alt: a, secili: f.tip === d})).join('')}</div>`})}
    ${GM.input({ad: 'fb-ad', etiket: 'Ad soyad', zorunlu: true, deger: f.ad, hata: h.ad})}
    ${GM.input({ad: 'fb-eposta', etiket: 'Fatura e-postası', zorunlu: true, ikon: 'envelope', tur: 'email', mod: 'email', deger: f.eposta, hata: h.eposta})}
    <div data-fb-kurum${f.tip === 'kurumsal' ? '' : ' hidden'}>${GM.input({ad: 'fb-unvan', etiket: 'Şirket unvanı', zorunlu: true, deger: f.unvan, hata: h.unvan})}<div class="gm-ikili">${GM.input({ad: 'fb-vd', etiket: 'Vergi dairesi', deger: f.vergiDairesi})}${GM.input({ad: 'fb-vkn', etiket: 'Vergi no', mod: 'numeric', deger: f.vkn, hata: h.vkn})}</div></div>
    ${GM.secAlan({ad: 'fb-il', etiket: 'İl', deger: f.il, yer: 'Seç', secenekler: SEHIRLER.map(x => [x, x])})}
    ${GM.input({ad: 'fb-adres', etiket: 'Adres (isteğe bağlı)', cokSatir: true, deger: f.adres})}</div>`;
  const faturaSheet = () => GM.sheet({baslik: 'Fatura bilgileri', tam: true, html: `<div data-fb>${faturaForm(fatura())}</div>`, altBar: GM.btnIkili({metin: 'Vazgeç', attrs: 'data-sheet-kapat'}, {metin: 'Kaydet', ikon: 'onay', veri: {eylem: 'fb-kaydet'}}), sonra: d => {
    const v = a => d.querySelector(`[name="${a}"]`)?.value?.trim() ?? '';
    const tipDinle = ev => { if (ev.target.name === 'fb-tip') d.querySelector('[data-fb-kurum]').hidden = ev.target.value !== 'kurumsal'; };
    d.addEventListener('change', tipDinle);
    const e = GM.eylem(d, 'fb-kaydet', () => {
      const f = {tip: d.querySelector('[name="fb-tip"]:checked')?.value || 'bireysel', ad: v('fb-ad'), eposta: v('fb-eposta'), unvan: v('fb-unvan'), vergiDairesi: v('fb-vd'), vkn: v('fb-vkn').replace(/\D/g, ''), il: v('fb-il'), adres: v('fb-adres')};
      const h = {ad: f.ad ? '' : 'Adını yaz', eposta: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.eposta) ? '' : 'Geçerli bir e-posta adresi yaz', unvan: f.tip === 'kurumsal' && !f.unvan ? 'Unvanı yaz' : '', vkn: f.tip === 'kurumsal' && f.vkn && !/^\d{10,11}$/.test(f.vkn) ? 'Vergi no 10 ya da 11 rakam' : ''};
      if (Object.values(h).some(Boolean)) { d.querySelector('[data-fb]').innerHTML = faturaForm(f, h); return; }
      GM.durum.yaz('fatura-bilgi', f); d.kapat(); GM.tazele(); GM.toast('Fatura bilgilerin **kaydedildi**', {tur: 'basari'});
    });
    return () => { e(); d.removeEventListener('change', tipDinle); };
  }});
  GM.ekran('odemelerim', {
    tur: 'alt', baslik: 'Ödemelerim', ust: '#/paketlerim', iskelet: 'satir', yenile: true,
    bos: ODEME_BOS.gecmis,
    ciz: ctx => {
      const s = ODEME_SEKME.some(([k]) => k === (ctx.sekme || ctx.sorgu.sekme)) ? (ctx.sekme || ctx.sorgu.sekme) : 'gecmis', f = fatura();
      return GM.gruplar([
        {baslik: 'Sıradaki tahsilat', html: `<div class="gm-yigin-12">${GM.p('**Ücretsiz** paketindesin; planlı bir tahsilatın yok. Pro satışa açıldığında yenileme tarihi ve tutarı burada görünür.', {ton: 'ikincil'})}${GM.btn({metin: 'Paketlerim', ikon: 'box-open', tur: 'secondary', tam: true, git: '#/paketlerim'})}</div>`},
        {html: `<div class="gm-yigin-12">${GM.segment({ad: 'odeme-sekme', secili: s, etiket: 'Ödemelerim bölümleri', ogeler: ODEME_SEKME.map(([deger, ad]) => ({ad, deger}))})}${GM.bos(ODEME_BOS[s])}</div>`},
        {baslik: 'Fatura bilgileri', satirlar: [{ikon: f.tip === 'kurumsal' ? 'building' : 'user', baslik: f.tip === 'kurumsal' ? (f.unvan || 'Kurumsal fatura') : (f.ad || 'Bireysel fatura'), alt: [f.tip === 'kurumsal' ? 'Kurumsal' : 'Bireysel', f.eposta, f.il].filter(Boolean).join(' · '), veri: {eylem: 'fatura'}}]},
        {baslik: 'Kampanya kodu', html: `<div class="gm-yigin-12"><div data-kod>${GM.input({ad: 'kod', etiket: 'Kod', ikon: 'ticket', yer: 'Ör. GURME2026', yardim: 'Kod Pro üyeliğe geçerken uygulanır.'})}</div>${GM.btn({metin: 'Kodu uygula', ikon: 'onay', tur: 'secondary', tam: true, veri: {eylem: 'kod'}})}</div>`}
      ]);
    },
    sonra: (kok, ctx) => {
      const c = [
        (() => { const b = kok.querySelector('.gm-seg.is-kaydir [aria-selected=true]'), k = b?.parentElement; if (b && k) k.scrollLeft = b.offsetLeft - (k.clientWidth - b.offsetWidth) / 2; return () => {}; })(),
        GM.on(kok, 'odeme-sekme', v => { ctx.sekme = v; GM.tazele(); }),
        GM.eylem(kok, 'fatura', faturaSheet),
        GM.eylem(kok, 'kod', el => {
          const k = (kok.querySelector('[name="kod"]')?.value || '').trim().toLocaleUpperCase('tr');
          if (!k) { kok.querySelector('[data-kod]').innerHTML = GM.input({ad: 'kod', etiket: 'Kod', ikon: 'ticket', yer: 'Ör. GURME2026', hata: 'Kodu yaz'}); return; }
          GM.mesgul(el, GM.TK.motion.reveal).then(() => GM.toast(`**${k}** şu an kullanılamıyor; kodlar Pro satışa açılınca geçerli olur`, {ikon: 'ticket', yerine: true}));
        })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
