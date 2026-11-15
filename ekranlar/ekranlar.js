/* #/ekranlar — sayfa kataloğu: uygulamanın bütün sayfalarının envanteri (web paneli özellikleri + mobile özel), durumlarıyla.
   Durum: tam (final kalite) · alternatif (karar bekleyen çeşitleri var) · yapiliyor (ajan sürüyor) · yer (yer tutucu: #/yer/:kod içerik planını gösterir).
   Kaynak: docs/WEB-ENVANTERI.md (§1.2, §1.4, §4), patron şartnamesi (docs/patron), docs/DADA-ROUTE-REFERANS.md. */
(() => {
  const G = [
    {ad: 'Açılış ve kimlik', ikon: 'user', not: 'Ortak: Gastro/Diet mobil kanonuyla birebir', s: [
      ['splash', 'Açılış (splash)', 'tam', 'Logo, marka moru zemin; soğuk açılışta 1 sn altı', 'mobil', '#/splash'],
      ['onboarding', 'Karşılama ve izinler', 'tam', 'Konum izni (şartname M4.1: harita ve vitrin konuma göre), bildirim izni (12.30/19.00 öneri + rezervasyon hatırlatma), keşif tercihleri', 'mobil', '#/onboarding'],
      ['karsilama', 'Karşılama', 'tam', 'Üye ol / Giriş yap / Misafir devam; Apple ve Google ile hızlı üyelik', 'mobil', '#/karsilama'],
      ['giris', 'Giriş', 'tam', 'Apple / Google / e-posta, biyometrik hızlı giriş (şartname M4.1)', '/giris', '#/giris'],
      ['kayit', 'Kayıt', 'tam', 'Ad, e-posta, şifre, KVKK; Dada Puan bakiyesi açılır', '/kayit', '#/kayit'],
      ['sifre', 'Şifre sıfırlama', 'tam', 'Bağlantı gönder, yeni şifre, süresi dolmuş bağlantı', '/sifremi-unuttum', '#/sifremi-unuttum'],
      ['iki-adim', 'İki adımlı doğrulama', 'tam', '6 haneli kod, tekrar gönder sayacı, kurtarma kodu; webde yok, ayarlardan açılır', 'mobil', '#/iki-adim'],
      ['kilit', 'Biyometrik kilit', 'tam', 'Face ID / parmak izi (Diet kilit ekranı kalıbı)', 'mobil', '#/kilit']]},
    {ad: 'Keşfet', ikon: 'kesfet', s: [
      ['ana', 'Ana sayfa', 'tam', 'A · Dada ailesi (patron seçimi); B/C ve referanslı çeşitler Arşiv’de', '/', '#/kesfet'],
      ['ara', 'Birleşik arama ve boş sonuç', 'tam', 'Tümü / Mekân / Etkinlik / Lezzet sekmeleri, öneriler, son aramalar, "Şunu mu demek istedin?"', '/gourmet-ara', '#/ara'],
      ['bildirimler', 'Bildirimler', 'tam', 'Rezervasyon hatırlatma, yakındaki imza tabak (12.30/19.00), etkinlik, puan; okundu/sil', '/hesabim/bildirimler', '#/bildirimler?uye=1'],
      ['konum', 'Konum seçici', 'tam', 'Türkiye → şehir → ilçe → semt (liste ekranlarında)', '—', '#/mekanlar']]},
    {ad: 'Mekânlar', ikon: 'mekan', s: [
      ['liste', 'Mekân listesi', 'tam', 'A · Dada ailesi; 14 süzgeç grubu, 8 sıralama, 203 mekân sonsuz kaydırma', '/mekanlar', '#/mekanlar'],
      ['detay', 'Mekân detay', 'tam', 'A · Dada ailesi; 3 adımlı rezervasyon, Ziyaret Ettim', '/mekan/{slug}', '#/mekan/mikla'],
      ['rezervasyon', 'Rezervasyon akışı', 'tam', 'Kişi · tarih + saat slotu + alerjen notu · onay + takvime ekle + yol tarifi', '/mekan/{slug}', '#/mekan/mikla?rez=1'],
      ['ziyaret', 'Ziyaret Ettim + değerlendirme', 'tam', 'Tek tık; yıldız + fotoğraf; +15 Dada Puan yalnız fotoğraflıda', '/mekan/{slug}', '#/mekan/mikla'],
      ['mekan-oner', 'Mekân öner (+50)', 'tam', 'Topluluk katkısı formu; profilde "İnceleniyor → Yayında"', '/mekan-oner', '#/mekan-oner']]},
    {ad: 'Mekân Bul', ikon: 'bul', s: [
      ['mekan-bul', 'Mekân Bul sihirbazı', 'tam', '4 adım: konum + bütçe, ortam (19 konsept), mutfak (18), nitelik (19); eşik %80/%40', '/mekan-bul', '#/mekan-bul'],
      ['mekan-bul-sonuc', 'Mekân Bul sonuçları', 'tam', 'Eşleşme oranlı liste, Düzenle, Yeni arama', '/mekan-bul/sonuclar', '#/mekan-bul/sonuclar']]},
    {ad: 'Dada Route', ikon: 'rota', s: [
      ['rota', 'Rota merkezi', 'tam', 'Planlayıcı, webden gelen rota, son ve hazır rotalar, yol katmanları', '/dada-route', '#/rota'],
      ['rota-planla', 'Rota planlama + 3 seçenek', 'tam', 'Duraklar, Yakıtlı/Elektrikli, sapma toleransı, ihtiyaçlar', '/dada-route/yeni', '#/rota/planla'],
      ['rota-harita', 'Aktif harita + istatistik çekmecesi', 'tam', 'Patron mimarisi: kategori barı, yüzen kart, liste, km şeridi, sapma dağılımı, ihtiyaç özeti', '/dada-route/{rota}', '#/rota/istanbul-izmir'],
      ['copilot', 'Co-Pilot (canlı sürüş)', 'tam', '3 km kala sesli uyarı, sıradaki durak, Geç / Navigasyonda aç', 'mobil', '#/rota/surus/istanbul-izmir?uyari=1'],
      ['rota-ozet', 'Rota özeti ve aktarma', 'tam', 'Google/Apple/Yandex + GPX, kaydet, yola çık', '/dada-route/{rota}', '#/rota/ozet/istanbul-izmir'],
      ['rota-liste', 'Rota boyunca liste', 'tam', 'Google Maps kalıbı: Yol üstü rozeti, km/+dk, Açık/Kapalı, + Ekle; sonsuz kaydırma', '/dada-route/{rota}', '#/rota/liste/istanbul-izmir'],
      ['rota-web', 'Web’den gönderilen rota', 'tam', 'Masaüstünde kurulan rotayı tek dokunuşla aç', '/dada-route', '#/rota/web/istanbul-bursa'],
      ['rota-telefon', 'Kilit ekranı + Dinamik Ada + bildirim', 'tam', 'Co-Pilot canlı etkinliği, yaklaşma ve il kimliği bildirimleri', 'mobil', '#/rota/telefon'],
      ['rota-arac', 'CarPlay / Android Auto', 'tam', 'POI şablonu, en çok 12 durak', 'mobil', '#/rota/arac'],
      ['rota-cevrimdisi', 'Çevrimdışı rotalar', 'tam', 'İndirilen rotalar, boyut, güncelle, sil', 'mobil', '#/rota/cevrimdisi'],
      ['rota-gunluk', 'Seyahat günlüğü', 'tam', 'Tamamlanan rotalar, iz, ziyaretler, gurme pasaportu', 'mobil', '#/rota/gunluk'],
      ['rota-rotalarim', 'Rotalarım', 'tam', 'Kayıtlı ve webden gönderilen rotalar', '/hesabim/listeler/rotalar', '#/rota/rotalarim'],
      ['rota-hazir', 'Hazır rotalar', 'tam', 'Küratörlü rotalar, temalar', '/dada-route', '#/rota/hazir']]},
    {ad: 'Etkinlikler', ikon: 'etkinlik', s: [
      ['etkinlikler', 'Etkinlik listesi (Lezzet Takvimi)', 'tam', 'Yerel / Uluslararası, 10 kategori, Liste/Takvim/Harita', '/etkinlikler', '#/etkinlikler'],
      ['etkinlik', 'Etkinlik detayı', 'tam', 'Katılacağım, takvime ekle, hatırlatma, bilet, paylaş; görsel CC atfı', '/etkinlikler/{slug}', '#/etkinlikler'],
      ['etkinlik-oner', 'Etkinlik öner', 'tam', 'Topluluk etkinlik önerisi; misafir duvarı, eksik alan, gönderildi', '/etkinlik-oner', '#/etkinlik-oner']]},
    {ad: 'Gurme Lezzetler ve Şehir Rehberleri', ikon: 'lezzet', s: [
      ['lezzetler', 'Gurme Lezzetler', 'tam', '12 kategori, En yeni / En çok okunan, arama', '/gurme-lezzetler', '#/lezzetler'],
      ['lezzet', 'Lezzet yazısı', 'tam', 'Okuma, etiketler, paylaş', '/gurme-lezzetler/{slug}', '#/lezzetler'],
      ['rehberler', 'Şehir rehberleri', 'tam', 'Rehber listesi ve detayı', '/sehir-rehberleri', '#/rehberler']]},
    {ad: 'Profilim', ikon: 'profil', not: 'Web 6 sekmeli profil + Hesabım; ortak kısımlar Gastro/Diet ile birebir', s: [
      ['profil', 'Profilim (Dada Puan ve rütbe)', 'tam', 'Puan bakiyesi, rütbe, rozetler, 6 sekmeye giriş', '/hesabim', '#/profil?uye=1'],
      ['rezervasyonlarim', 'Rezervasyonlarım', 'tam', 'Onaylanan / bekleyen, iptal', '/hesabim/gurme-panelim', '#/profil/rezervasyonlar?uye=1'],
      ['favoriler', 'Gurme Favorilerim', 'tam', 'Mekân ve lezzet favorileri', '/hesabim/gurme-favorilerim', '#/profil/favoriler?uye=1'],
      ['ziyaretler', 'Ziyaret Geçmişim', 'tam', 'Ziyaret Ettim kayıtları', '/hesabim/ziyaret-gecmisim', '#/profil/ziyaretler?uye=1'],
      ['degerlendirmeler', 'Değerlendirmelerim', 'tam', 'Yıldız + fotoğraf, durum', '/hesabim/degerlendirmelerim', '#/profil/degerlendirmeler?uye=1'],
      ['katkilar', 'Topluluk Katkılarım', 'tam', 'Önerilen mekân/etkinlik: İnceleniyor / Yayında', '/hesabim/topluluk-katkilarim', '#/profil/katkilar?uye=1'],
      ['puan', 'Puan Durumu ve rozetler', 'tam', '+2 / +15 / +25 / +50 kuralları, günlük 100 sınırı', '/hesabim/puan-durumu', '#/profil/puan?uye=1'],
      ['listelerim', 'Listelerim', 'tam', 'Listeler, rotalar, paylaşılan, taslak', '/hesabim/listeler', '#/profil/listeler?uye=1'],
      ['etkinliklerim', 'Etkinliklerim', 'tam', 'Katıldığım, ilgilendiğim, biletlerim', '/hesabim/etkinlikler', '#/profil/etkinlikler?uye=1'],
      ['tercihler', 'Keşif tercihleri', 'tam', 'Mutfak, ortam, beslenme tercihleri', '/hesabim/kesif-tercihleri', '#/profil/tercihler?uye=1'],
      ['ayarlar', 'Hesap Ayarları', 'tam', 'Bildirimler (12.30/19.00), gizlilik, dil, hesabı sil', '/hesabim/ayarlar', '#/ayarlar?uye=1'],
      ['cozum', 'Çözüm Merkezi', 'tam', 'SSS, talepler, öneri', '/hesabim/cozum-merkezi', '#/cozum-merkezi'],
      ['odeme', 'Ödemeler ve paketler / Pro', 'tam', 'Paketlerim, ödemelerim, Pro (satış kapalıysa yakında)', '/hesabim/paketlerim', '#/paketlerim?uye=1'],
      ['odemelerim', 'Ödemelerim', 'tam', 'Geçmiş, faturalar, kayıtlı kartlar, iade; tahsilat yokken dürüst boş hâller', '/hesabim/odemelerim', '#/odemelerim?uye=1']]},
    {ad: 'Ortak sayfalar', ikon: 'bilgi', not: 'Gastro/Diet mobil kanonuyla birebir', s: [
      ['gorus', 'Görüş Bildir', 'tam', 'Gastro/Diet ile aynı form', '/geri-bildirim', '#/gorus-bildir'],
      ['sss', 'Sıkça sorulan sorular', 'tam', 'Gruplu akordiyon, arama, sonuç yok', '/sss', '#/sss'],
      ['iletisim', 'İletişim', 'tam', 'Web iletişim bilgileri, form, mesajın yolu', '/iletisim', '#/iletisim'],
      ['yasal', 'Yasal merkez', 'tam', '31 belge, 4 grup', '/yasal', '#/yasal'],
      ['kurumsal', 'Hakkımızda · Künye · İletişim · SSS', 'tam', 'Şirket bilgisi Gastro ile aynı', '/hakkimizda', '#/kurumsal/hakkimizda'],
      ['isletme', 'İşletme başvurusu', 'tam', 'İşletmeni ekle', '/isletme/basvurular/yeni', '#/isletme'],
      ['isletme-panel', 'İşletme paneli (sahip)', 'tam', 'Web panelinin 17 özelliği: rezervasyon onay/ret, değerlendirme yanıtı, fotoğraf, saatler, talepler; mobile uymayanlar “Web panelinde”', '/isletme/panel', '#/isletme?uye=1&rol=isletme'],
      ['isletme-basvuru', 'İşletme başvurusu', 'tam', '5 adım, belge zorunlu, İnceleniyor / Onaylandı / Reddedildi', '/isletme/basvurular/yeni', '#/isletme/basvuru']]},
    {ad: 'Sistem hâlleri', ikon: 'uyari', s: [
      ['hata', 'Bulunamadı / hata', 'tam', 'Kanon hata ekranı', '404', '#/hata'],
      ['cevrimdisi', 'Çevrimdışı', 'tam', 'Şerit + önbellekten çizim; harita şema görünümü', 'mobil', '#/kesfet?hal=cevrimdisi'],
      ['bakim', 'Bakım · güncelleme · oturum doldu · izin reddedildi', 'tam', 'Diet sistem ekranları kalıbı', 'mobil', '#/bakim'],
      ['durumlar', 'Durum hâlleri (gizli)', 'tam', 'Bütün rotalar × ortak hâller ve ekrana özgü hâller; bildirim ve onay pencereleri', '—', '#/durumlar']]},
    {ad: 'Geliştirici', ikon: 'katman', s: [
      ['katalog', 'Bileşen kataloğu', 'tam', 'Her bileşen tüm hâlleriyle', '—', '#/katalog'],
      ['alternatifler', 'Tasarım alternatifleri', 'tam', 'Ekran ekran yan yana çeşitler', '—', '#/alternatifler']]}
  ];
  const ROZ = {tam: {metin: 'Tam', ton: 'basari', ikon: 'onay'}, alternatif: {metin: 'Karar bekliyor', ton: 'uyari', ikon: 'saat'}, yapiliyor: {metin: 'Yapılıyor', ton: 'notr', ikon: 'yenile'}, yer: {metin: 'Yer tutucu', ton: 'notr'}};
  const hepsi = () => G.flatMap(g => g.s.map(x => ({g, kod: x[0], ad: x[1], durum: x[2], icerik: x[3], kaynak: x[4], git: x[5]})));
  GM.ekran('ekranlar', {
    tur: 'alt', baslik: 'Ekran kataloğu', ust: '#/kesfet', haller: false,
    ciz: () => {
      const l = hepsi(), say = d => l.filter(x => x.durum === d).length;
      return `<div class="gm-ic gm-yigin-24">${GM.p(`Uygulamanın **${l.length} sayfası**: web panelindeki bütün özellikler ve mobile özel ekranlar. Hepsi final kalitede; her satır ekranı açar. Hâller için gizli **Durum hâlleri** sayfası.`)}${GM.stat([{deger: String(say('tam')), etiket: 'sayfa'}, {deger: String(G.length), etiket: 'modül'}, {deger: String(say('yer')), etiket: 'yer tutucu'}])}${G.map(g => `<section class="gm-yigin-8"><h2 class="gm-t-section">${GM.esc(g.ad)}</h2>${g.not ? `<p class="gm-t-label gm-ton-ikincil">${GM.esc(g.not)}</p>` : ''}${GM.satirlar(g.s.map(x => ({ikon: g.ikon, baslik: x[1], alt: x[3], ozet: true, ek: GM.durumRozet(ROZ[x[2]]), git: x[5] || `#/yer/${x[0]}`, ok: true})))}</section>`).join('')}</div>`;
    }
  });
  // Yer tutucu: sayfanın adı, içerik planı, web karşılığı.
  GM.ekran('yer', {
    tur: 'alt', ust: '#/ekranlar', haller: false,
    baslik: ctx => (hepsi().find(x => x.kod === ctx.param.kod) || {}).ad || 'Ekran',
    ciz: ctx => { const x = hepsi().find(y => y.kod === ctx.param.kod) || {ad: 'Ekran', icerik: '', kaynak: '—', g: {}}; return `<div class="gm-ic gm-yigin-24">${GM.bos({ikon: x.g.ikon || 'mobile-screen', baslik: x.ad, metin: 'Bu ekran **seçimden sonra** final kalitede çizilecek. Bileşenleri kanonda hazır.'})}${GM.bilgi({etiket: 'İçerik planı', ikon: 'bilgi', metin: x.icerik})}${GM.satirlar([{ikon: 'web', baslik: 'Web karşılığı', alt: x.kaynak}, {ikon: 'katman', baslik: 'Modül', alt: x.g.ad || ''}])}</div>`; }
  });
})();
