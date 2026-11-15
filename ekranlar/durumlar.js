/* Durum hâlleri (#/durumlar): gizli geliştirici menüsü (Dada Diet #/durumlar kalıbı); menüde ve alt navigasyonda yok.
 * Bir hâl seç (Normal, Yükleniyor, Boş, Hata, Çevrimdışı, Giriş gerekli, Kilitli), sonra ekranı aç: rota ?hal= ile açılır, hâli router ortak bileşenle çizer
 * (kanon/gm-ui.js halCiz). Boş hâl e.bos tanımlı ekranda ortak, değilse ekranın kendi boş hâli. Ekrana özgü hâller OZEL listesinde (paket raporlarından).
 * Rotalar GM_ROTALAR'dan gruplanır (arşiv #/alt, #/ref ve geliştirici adresleri hariç); parametreli rotalar gerçek kayıtla açılır. Seçili hâl: GM.durum 'durumlar-hal'. */
(() => {
  const HALLER = [['', 'Normal'], ['yukleniyor', 'Yükleniyor'], ['bos', 'Boş'], ['hata', 'Hata'], ['cevrimdisi', 'Çevrimdışı'], ['giris', 'Giriş gerekli'], ['kilitli', 'Kilitli']];
  const GRUP = [
    ['Ana sekmeler', 'kesfet', /^#\/(kesfet|mekanlar|mekan\/|mekan-bul|etkinlikler$|profil$)/],
    ['Dada Route', 'rota', /^#\/rota/],
    ['Açılış ve kimlik', 'profil', /^#\/(splash|karsilama|onboarding|giris|kayit|sifremi-unuttum|iki-adim|kilit)/],
    ['Keşif ve içerik', 'kesfet', /^#\/(ara|bildirimler|mekan-oner|etkinlik|lezzet|rehber)/],
    ['Profilim', 'profil', /^#\/profil\//],
    ['Hesap, destek ve yasal', 'ayarlar', /^#\/(ayarlar|cozum-merkezi|gorus-bildir|sss|iletisim|yasal|kurumsal|paketlerim|pro$)/],
    ['İşletme', 'mekan', /^#\/isletme/],
    ['Sistem', 'uyari', /^#\/(bakim|guncelle|oturum-doldu|yetki-yok|izin-reddi|hata)/]
  ];
  // Ekrana özgü hâller: paket raporları geldikçe lider ekler (ekran kendi ?hal= değeriyle çizer).
  // Paket raporlarından (tasks/ajan/<paket>.md, 15 Kas): her satır ekranın kendi ?hal= ya da adım değeriyle açılır.
  const OZEL = [
    ['right-to-bracket', 'Giriş · hatalı şifre', '#/giris?hal=hatali'],
    ['lock', 'Giriş · deneme hakkı bitti', '#/giris?hal=kilitli'],
    ['hourglass-half', 'Giriş · çok fazla deneme (429)', '#/giris?hal=cok-deneme'],
    ['fingerprint', 'Giriş · hızlı giriş', '#/giris?hal=hizli'],
    ['user-plus', 'Kayıt · e-posta zaten kayıtlı', '#/kayit?hal=eposta-var'],
    ['envelope-circle-check', 'Kayıt · e-posta doğrulama', '#/kayit?adim=dogrula'],
    ['envelope', 'Kayıt · kod geçersiz', '#/kayit?adim=dogrula&hal=gecersiz'],
    ['circle-check', 'Kayıt · hesap hazır', '#/kayit?hal=tamam'],
    ['key', 'Şifre · bağlantı gönderildi', '#/sifremi-unuttum?adim=gonderildi'],
    ['key', 'Şifre · bağlantının süresi doldu', '#/sifremi-unuttum?adim=yeni&hal=sure-doldu'],
    ['shield-halved', 'İki adım · hatalı kod', '#/iki-adim?hal=hatali'],
    ['shield-halved', 'İki adım · kurtarma kodu', '#/iki-adim?mod=kurtarma'],
    ['fingerprint', 'Kilit · tanınmadı', '#/kilit?hal=basarisiz'],
    ['fingerprint', 'Kilit · Android istemi', '#/kilit?dene=1&platform=android'],
    ['location-dot', 'Onboarding · konum izni reddedildi', '#/onboarding?adim=konum&hal=red'],
    ['bell-slash', 'Onboarding · bildirim izni reddedildi', '#/onboarding?adim=bildirim&hal=red'],
    ['utensils', 'Mekânlar · süzgeç sonucu yok', '#/mekanlar?hal=sonuc-yok'],
    ['triangle-exclamation', 'Mekânlar · sonraki sayfa yüklenemedi', '#/mekanlar?hal=sayfa-hata'],
    ['store-slash', 'Mekân · bulunamadı', '#/mekan/mikla?hal=bulunamadi'],
    ['door-closed', 'Mekân · kalıcı kapalı', '#/mekan/mikla?hal=kapali'],
    ['calendar-xmark', 'Rezervasyon · kapalı', '#/mekan/mikla?hal=rez-kapali'],
    ['calendar-xmark', 'Rezervasyon · slot yok', '#/mekan/mikla?hal=slot-yok'],
    ['circle-exclamation', 'Rezervasyon · gönderilemedi', '#/mekan/mikla?hal=rez-hata'],
    ['calendar-check', 'Rezervasyon · sheet açık', '#/mekan/mikla?rez=1'],
    ['wand-magic-sparkles', 'Mekân Bul · cevapsız adım', '#/mekan-bul?adim=2&hal=cevapsiz'],
    ['location-dot', 'Mekân Bul · konum izni kapalı', '#/mekan-bul?adim=1&hal=konum-red'],
    ['hourglass-end', 'Mekân Bul · günlük hak bitti', '#/mekan-bul?hal=limit'],
    ['magnifying-glass', 'Mekân Bul · sonuç yok', '#/mekan-bul/sonuclar?hal=sonuc-yok'],
    ['sliders', 'Mekân Bul · eşiği gevşet', '#/mekan-bul/sonuclar?hal=gevsek'],
    ['plus', 'Mekân öner · alan hatası', '#/mekan-oner?uye=1&hal=alan-hata'],
    ['circle-check', 'Mekân öner · gönderildi', '#/mekan-oner?uye=1&hal=gonderildi'],
    ['route', 'Rota · hesaplanıyor', '#/rota/istanbul-izmir?hal=yukleniyor'],
    ['route', 'Rota · çizilemedi', '#/rota/istanbul-izmir?hal=hata'],
    ['location-crosshairs', 'Rota · konum izni yok', '#/rota/istanbul-izmir?hal=konum'],
    ['cloud-arrow-down', 'Rota · çevrimdışı paket', '#/rota/istanbul-izmir?hal=cevrimdisi'],
    ['ban', 'Rota · durak sınırı doldu', '#/rota/istanbul-izmir?hal=sinir'],
    ['charging-station', 'Rota · Elektrikli, şarj yok', '#/rota/istanbul-izmir?arac=ev&kat=yol&alt=sarj'],
    ['layer-group', 'Rota · çekmece tam', '#/rota/istanbul-izmir?cekmece=tam'],
    ['bell', 'Co-Pilot · yaklaşım uyarısı', '#/rota/surus/istanbul-izmir?uyari=1'],
    ['calendar-days', 'Etkinlikler · sonuç yok', '#/etkinlikler?hal=sonuc-yok'],
    ['calendar-days', 'Etkinlikler · takvim', '#/etkinlikler?gorunum=takvim'],
    ['map', 'Etkinlikler · harita', '#/etkinlikler?gorunum=harita'],
    ['calendar-xmark', 'Etkinlik · bulunamadı', '#/etkinlik/yok?hal=bulunamadi'],
    ['plus', 'Etkinlik öner · eksik alan', '#/etkinlik-oner?uye=1&hal=eksik'],
    ['bowl-food', 'Lezzetler · kategoride yazı yok', '#/lezzetler?hal=kategori-bos'],
    ['file-circle-exclamation', 'Lezzet · metin yüklenemedi', '#/lezzet/beypazari-kurusunun-gevrek-dokusu-nasil-olusur?hal=metin-yok'],
    ['city', 'Rehber · bulunamadı', '#/rehber/yok?hal=bulunamadi'],
    ['magnifying-glass', 'Arama · yazıyor', '#/ara?hal=yaziyor'],
    ['magnifying-glass', 'Arama · sonuç yok', '#/ara?q=zzz&hal=sonuc-yok'],
    ['bell-slash', 'Bildirimler · izin kapalı', '#/bildirimler?uye=1&hal=izin-kapali'],
    ['credit-card', 'Ödemelerim · faturalar', '#/odemelerim?uye=1&sekme=faturalar'],
    ['list', 'Listelerim · sınır (Pro)', '#/profil/listeler?uye=1'],
    ['trophy', 'Puan · liderlik', '#/profil/puan?uye=1&sekme=liderlik'],
    ['user-xmark', 'Hesabı sil', '#/ayarlar/sil?uye=1'],
    ['scale-balanced', 'Yasal · sonuç yok', '#/yasal?q=zzz&hal=sonuc-yok'],
    ['hourglass-half', 'Yasal belge · bilgi bekleniyor', '#/yasal/yas-siniri'],
    ['life-ring', 'Çözüm merkezi · talep detayı', '#/cozum-merkezi?uye=1&sekme=talepler'],
    ['comment-dots', 'Görüş · form hatası', '#/gorus-bildir?hal=form-hata'],
    ['comment-dots', 'Görüş · gönderildi', '#/gorus-bildir?hal=tamam'],
    ['store', 'İşletme · başvuru inceleniyor', '#/isletme/basvuru?hal=inceleniyor'],
    ['store', 'İşletme · başvuru reddedildi', '#/isletme/basvuru?hal=reddedildi'],
    ['file-circle-exclamation', 'İşletme · belge zorunlu', '#/isletme/basvuru?adim=5&hal=form-hata'],
    ['chart-line', 'İşletme paneli', '#/isletme?uye=1&rol=isletme'],
    ['screwdriver-wrench', 'Bakım · dönüş saati belli değil', '#/bakim?hal=sure-yok'],
    ['circle-up', 'Güncelleme · isteğe bağlı', '#/guncelle?tur=istege-bagli'],
    ['location-dot', 'İzin reddi · konum', '#/izin-reddi?tur=konum'],
    ['camera', 'İzin reddi · kamera (Android)', '#/izin-reddi?tur=kamera&platform=android'],
    ['user-lock', 'Yetki yok · başka hesap', '#/yetki-yok?tur=baska-hesap']
  ];
  const PENCERE = [['basari', 'onay', 'Başarı bildirimi'], ['geri', 'yenile', 'Geri al bildirimi'], ['hata', 'uyari', 'Hata bildirimi'], ['sil', 'sil', 'Silme onayı'], ['cikis', 'cikis', 'Çıkış onayı']];
  const pencere = id => ({
    basari: () => GM.toast('**Kaydedildi**', {tur: 'basari'}),
    geri: () => GM.toast('Favorilerden çıkarıldı', {ikon: 'sil', eylem: 'Geri al', onEylem: () => GM.toast('Favori **geri alındı**', {ikon: 'onay'})}),
    hata: () => GM.toast('Kaydedilemedi, **tekrar dene**', {tur: 'hata'}),
    sil: () => GM.dialog({baslik: 'Rota silinsin mi?', metin: 'Bu rota ve durakları **kalıcı olarak** silinir.', eylem: 'Sil', iptal: 'Vazgeç', yikici: true}),
    cikis: () => GM.dialog({baslik: 'Çıkış yapılsın mı?', metin: 'Bu cihazdaki **favorilerin ve rota taslakların** hesabında kalır.', eylem: 'Çıkış yap', iptal: 'Vazgeç', yikici: true})
  })[id]?.();
  const hal = () => GM.durum.oku('durumlar-hal', '');
  const ornek = r => {
    const V = window.GMV || {};
    return r.replace(/:slug/, () => /etkinlik/.test(r) ? V.etkinlikler?.[0]?.slug ?? '' : /lezzet/.test(r) ? V.lezzetler?.[0]?.slug ?? '' : /rehber/.test(r) ? (V.ilKimlik?.[0]?.slug ?? 'izmir') : /yasal/.test(r) ? 'kvkk' : /kurumsal/.test(r) ? 'hakkimizda' : 'mikla')
      .replace(/:id/, () => /rota/.test(r) ? 'istanbul-izmir' : '1').replace(/:bolum/, () => /isletme/.test(r) ? 'rezervasyonlar' : 'bildirimler');
  };
  const ad = r => { const e = GM.ekranTanim((window.GM_ROTALAR || {})[r]); const b = e && (typeof e.baslik === 'function' ? null : e.baslik); return b || r.replace('#/', ''); };
  const adres = r => { const h = hal(), u = ornek(r); return h ? `${u}${u.includes('?') ? '&' : '?'}hal=${h}` : u; };
  GM.ekran('durumlar', {
    tur: 'alt', baslik: 'Durum hâlleri', ust: '#/ekranlar', haller: false,
    ciz: () => {
      const rotalar = Object.keys(window.GM_ROTALAR || {}).filter(r => !/^#\/(alt|ref|yer|harita-deneme|katalog|alternatifler|ekranlar|durumlar|widget)\b/.test(r));
      const secHal = hal();
      return `<div class="gm-ic gm-yigin-24">${GM.p('Bir **hâl** seç, sonra ekranı aç. Ortak hâlleri router çizer; ekrana özgü hâller ayrı listede.')}
        <section class="gm-yigin-8"><h2 class="gm-t-section">Hâl</h2>${GM.cipler({ad: 'durum-hal', tur: 'tek', secili: secHal, ogeler: HALLER.map(([d, m]) => ({deger: d, metin: m}))})}</section>
        ${GRUP.map(([g, ik, re]) => { const l = rotalar.filter(r => re.test(r)); return l.length ? `<section class="gm-yigin-8"><h2 class="gm-t-section">${GM.esc(g)}</h2>${GM.satirlar(l.map(r => ({ikon: ik, baslik: ad(r), alt: adres(r), git: adres(r)})))}</section>` : ''; }).join('')}
        ${OZEL.length ? `<section class="gm-yigin-8"><h2 class="gm-t-section">Ekrana özgü hâller</h2>${GM.satirlar(OZEL.map(([ik, b, g]) => ({ikon: ik, baslik: b, alt: g, git: g})))}</section>` : ''}
        <section class="gm-yigin-8"><h2 class="gm-t-section">Bildirim ve onay pencereleri</h2>${GM.satirlar(PENCERE.map(([id, ik, b]) => ({ikon: ik, baslik: b, veri: {eylem: 'durum-pencere', id}})))}</section></div>`;
    },
    sonra: el => {
      const a = GM.on(el, 'durum-hal', d => { GM.durum.yaz('durumlar-hal', [].concat(d)[0] || ''); GM.tazele(); });
      const b = GM.eylem(el, 'durum-pencere', x => pencere(x.dataset.id));
      return () => { a(); b(); };
    }
  });
})();
