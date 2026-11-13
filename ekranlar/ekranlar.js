/* #/ekranlar — sayfa kataloğu: uygulamanın bütün sayfalarının envanteri (web paneli özellikleri + mobile özel), durumlarıyla.
   Durum: tam (final kalite) · alternatif (karar bekleyen çeşitleri var) · yapiliyor (ajan sürüyor) · yer (yer tutucu: #/yer/:kod içerik planını gösterir).
   Kaynak: docs/WEB-ENVANTERI.md (§1.2, §1.4, §4), patron şartnamesi (docs/patron), docs/DADA-ROUTE-REFERANS.md. */
(() => {
  const G = [
    {ad: 'Açılış ve kimlik', ikon: 'user', not: 'Ortak: Gastro/Diet mobil kanonuyla birebir', s: [
      ['splash', 'Açılış (splash)', 'yer', 'Logo, marka moru zemin; soğuk açılışta 1 sn altı', 'mobil'],
      ['onboarding', 'Karşılama ve izinler', 'yer', 'Konum izni (şartname M4.1: harita ve vitrin konuma göre), bildirim izni (12.30/19.00 öneri + rezervasyon hatırlatma), keşif tercihleri', 'mobil'],
      ['giris', 'Giriş', 'yer', 'Apple / Google / e-posta, biyometrik hızlı giriş (şartname M4.1)', '/giris'],
      ['kayit', 'Kayıt', 'yer', 'Ad, e-posta, şifre, KVKK; Dada Puan bakiyesi açılır', '/kayit'],
      ['sifre', 'Şifre sıfırlama', 'yer', 'Bağlantı gönder, yeni şifre, süresi dolmuş bağlantı', '/sifremi-unuttum'],
      ['kilit', 'Biyometrik kilit', 'yer', 'Face ID / parmak izi (Diet kilit ekranı kalıbı)', 'mobil']]},
    {ad: 'Keşfet', ikon: 'kesfet', s: [
      ['ana', 'Ana sayfa', 'alternatif', 'A/B/C + referanslı çeşitler', '/', '#/alternatifler'],
      ['ara', 'Birleşik arama ve boş sonuç', 'yer', 'Tümü / Mekân / Etkinlik / Lezzet sekmeleri, öneriler, son aramalar, "Şunu mu demek istedin?"', '/gourmet-ara'],
      ['bildirimler', 'Bildirimler', 'yer', 'Rezervasyon hatırlatma, yakındaki imza tabak (12.30/19.00), etkinlik, puan; okundu/sil', '/hesabim/bildirimler'],
      ['konum', 'Konum seçici', 'tam', 'Türkiye → şehir → ilçe → semt (liste ekranlarında)', '—', '#/alt/liste-a']]},
    {ad: 'Mekânlar', ikon: 'mekan', s: [
      ['liste', 'Mekân listesi', 'alternatif', 'A/B/C + referanslı çeşitler; 14 süzgeç grubu, 8 sıralama', '/mekanlar', '#/alternatifler'],
      ['detay', 'Mekân detay', 'alternatif', 'A/B/C + referanslı çeşitler', '/mekan/{slug}', '#/alternatifler'],
      ['rezervasyon', 'Rezervasyon akışı', 'tam', 'Kişi · tarih + saat slotu + alerjen notu · onay + takvime ekle + yol tarifi', '/mekan/{slug}', '#/alt/detay-b/mikla'],
      ['ziyaret', 'Ziyaret Ettim + değerlendirme', 'tam', 'Tek tık; yıldız + fotoğraf; +15 Dada Puan yalnız fotoğraflıda', '/mekan/{slug}', '#/alt/detay-a/mikla'],
      ['mekan-oner', 'Mekân öner (+50)', 'yer', 'Topluluk katkısı formu; profilde "İnceleniyor → Yayında"', '/mekan-oner']]},
    {ad: 'Mekân Bul', ikon: 'bul', s: [
      ['mekan-bul', 'Mekân Bul sihirbazı', 'yer', '4 adım: konum + bütçe, ortam (19 konsept), mutfak (18), nitelik (19); eşik %80/%40', '/mekan-bul'],
      ['mekan-bul-sonuc', 'Mekân Bul sonuçları', 'yer', 'Eşleşme oranlı liste, Düzenle, Yeni arama', '/mekan-bul/sonuclar']]},
    {ad: 'Dada Route', ikon: 'rota', s: [
      ['rota', 'Rota merkezi', 'tam', 'Planlayıcı, webden gelen rota, son ve hazır rotalar, yol katmanları', '/dada-route', '#/rota'],
      ['rota-planla', 'Rota planlama + 3 seçenek', 'tam', 'Duraklar, Yakıtlı/Elektrikli, sapma toleransı, ihtiyaçlar', '/dada-route/yeni', '#/rota/planla'],
      ['rota-harita', 'Rota haritası + durak çekmecesi', 'alternatif', 'Ana yön + referanslı çeşitler', '/dada-route/{rota}', '#/alternatifler'],
      ['copilot', 'Co-Pilot (canlı sürüş)', 'tam', '3 km kala sesli uyarı, sıradaki durak, Geç / Navigasyonda aç', 'mobil', '#/rota/surus/istanbul-izmir?uyari=1'],
      ['rota-ozet', 'Rota özeti ve aktarma', 'tam', 'Google/Apple/Yandex + GPX, kaydet, yola çık', '/dada-route/{rota}', '#/rota/ozet/istanbul-izmir'],
      ['rota-telefon', 'Kilit ekranı + Dinamik Ada + bildirim', 'tam', 'Co-Pilot canlı etkinliği, yaklaşma ve il kimliği bildirimleri', 'mobil', '#/rota/telefon'],
      ['rota-arac', 'CarPlay / Android Auto', 'tam', 'POI şablonu, en çok 12 durak', 'mobil', '#/rota/arac'],
      ['rota-cevrimdisi', 'Çevrimdışı rotalar', 'tam', 'İndirilen rotalar, boyut, güncelle, sil', 'mobil', '#/rota/cevrimdisi'],
      ['rota-gunluk', 'Seyahat günlüğü', 'tam', 'Tamamlanan rotalar, iz, ziyaretler, gurme pasaportu', 'mobil', '#/rota/gunluk'],
      ['rota-rotalarim', 'Rotalarım', 'tam', 'Kayıtlı ve webden gönderilen rotalar', '/hesabim/listeler/rotalar', '#/rota/rotalarim'],
      ['rota-hazir', 'Hazır rotalar', 'tam', 'Küratörlü rotalar, temalar', '/dada-route', '#/rota/hazir']]},
    {ad: 'Etkinlikler', ikon: 'etkinlik', s: [
      ['etkinlikler', 'Etkinlik listesi (Lezzet Takvimi)', 'yer', 'Yerel / Uluslararası, 10 kategori, Liste/Takvim/Harita', '/etkinlikler'],
      ['etkinlik', 'Etkinlik detayı', 'yer', 'Katılacağım, takvime ekle, hatırlatma, bilet, paylaş; görsel CC atfı', '/etkinlikler/{slug}']]},
    {ad: 'Gurme Lezzetler ve Şehir Rehberleri', ikon: 'lezzet', s: [
      ['lezzetler', 'Gurme Lezzetler', 'yer', '12 kategori, En yeni / En çok okunan, arama', '/gurme-lezzetler'],
      ['lezzet', 'Lezzet yazısı', 'yer', 'Okuma, etiketler, paylaş', '/gurme-lezzetler/{slug}'],
      ['rehberler', 'Şehir rehberleri', 'yer', 'Rehber listesi ve detayı', '/sehir-rehberleri']]},
    {ad: 'Profilim', ikon: 'profil', not: 'Web 6 sekmeli profil + Hesabım; ortak kısımlar Gastro/Diet ile birebir', s: [
      ['profil', 'Profilim (Dada Puan ve rütbe)', 'yer', 'Puan bakiyesi, rütbe, rozetler, 6 sekmeye giriş', '/hesabim'],
      ['rezervasyonlarim', 'Rezervasyonlarım', 'yer', 'Onaylanan / bekleyen, iptal', '/hesabim/gurme-panelim'],
      ['favoriler', 'Gurme Favorilerim', 'yer', 'Mekân ve lezzet favorileri', '/hesabim/gurme-favorilerim'],
      ['ziyaretler', 'Ziyaret Geçmişim', 'yer', 'Ziyaret Ettim kayıtları', '/hesabim/ziyaret-gecmisim'],
      ['degerlendirmeler', 'Değerlendirmelerim', 'yer', 'Yıldız + fotoğraf, durum', '/hesabim/degerlendirmelerim'],
      ['katkilar', 'Topluluk Katkılarım', 'yer', 'Önerilen mekân/etkinlik: İnceleniyor / Yayında', '/hesabim/topluluk-katkilarim'],
      ['puan', 'Puan Durumu ve rozetler', 'yer', '+2 / +15 / +25 / +50 kuralları, günlük 100 sınırı', '/hesabim/puan-durumu'],
      ['listelerim', 'Listelerim', 'yer', 'Listeler, rotalar, paylaşılan, taslak', '/hesabim/listeler'],
      ['etkinliklerim', 'Etkinliklerim', 'yer', 'Katıldığım, ilgilendiğim, biletlerim', '/hesabim/etkinlikler'],
      ['tercihler', 'Keşif tercihleri', 'yer', 'Mutfak, ortam, beslenme tercihleri', '/hesabim/kesif-tercihleri'],
      ['ayarlar', 'Hesap Ayarları', 'yer', 'Bildirimler (12.30/19.00), gizlilik, dil, hesabı sil', '/hesabim/ayarlar'],
      ['cozum', 'Çözüm Merkezi', 'yer', 'SSS, talepler, öneri', '/hesabim/cozum-merkezi'],
      ['odeme', 'Ödemeler ve paketler / Pro', 'yer', 'Paketlerim, ödemelerim, Pro (satış kapalıysa yakında)', '/hesabim/paketlerim']]},
    {ad: 'Ortak sayfalar', ikon: 'bilgi', not: 'Gastro/Diet mobil kanonuyla birebir', s: [
      ['gorus', 'Görüş Bildir', 'yer', 'Gastro/Diet ile aynı form', '/geri-bildirim'],
      ['yasal', 'Yasal merkez', 'yer', '31 belge, 4 grup', '/yasal'],
      ['kurumsal', 'Hakkımızda · Künye · İletişim · SSS', 'yer', 'Şirket bilgisi Gastro ile aynı', '/hakkimizda'],
      ['isletme', 'İşletme başvurusu', 'yer', 'İşletmeni ekle', '/isletme/basvurular/yeni']]},
    {ad: 'Sistem hâlleri', ikon: 'uyari', s: [
      ['hata', 'Bulunamadı / hata', 'tam', 'Kanon hata ekranı', '404', '#/hata'],
      ['cevrimdisi', 'Çevrimdışı', 'tam', 'Şerit + önbellekten çizim; harita şema görünümü', 'mobil', '#/alt/ana-b?hal=cevrimdisi'],
      ['bakim', 'Bakım · güncelleme · oturum doldu · izin reddedildi', 'yer', 'Diet sistem ekranları kalıbı', 'mobil']]},
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
      return `<div class="gm-ic gm-yigin-24">${GM.p(`Uygulamanın **${l.length} sayfası**: web panelindeki bütün özellikler ve mobile özel ekranlar. Tam olanlar açılır; yer tutucular içerik planını gösterir.`)}${GM.stat([{deger: String(say('tam')), etiket: 'tam'}, {deger: String(say('alternatif')), etiket: 'karar bekliyor'}, {deger: String(say('yapiliyor')), etiket: 'yapılıyor'}, {deger: String(say('yer')), etiket: 'yer tutucu'}])}${G.map(g => `<section class="gm-yigin-8"><h2 class="gm-t-section">${GM.esc(g.ad)}</h2>${g.not ? `<p class="gm-t-label gm-ton-ikincil">${GM.esc(g.not)}</p>` : ''}${GM.satirlar(g.s.map(x => ({ikon: g.ikon, baslik: x[1], alt: x[3], ozet: true, ek: GM.durumRozet(ROZ[x[2]]), git: x[5] || `#/yer/${x[0]}`, ok: true})))}</section>`).join('')}</div>`;
    }
  });
  // Yer tutucu: sayfanın adı, içerik planı, web karşılığı.
  GM.ekran('yer', {
    tur: 'alt', ust: '#/ekranlar', haller: false,
    baslik: ctx => (hepsi().find(x => x.kod === ctx.param.kod) || {}).ad || 'Ekran',
    ciz: ctx => { const x = hepsi().find(y => y.kod === ctx.param.kod) || {ad: 'Ekran', icerik: '', kaynak: '—', g: {}}; return `<div class="gm-ic gm-yigin-24">${GM.bos({ikon: x.g.ikon || 'mobile-screen', baslik: x.ad, metin: 'Bu ekran **seçimden sonra** final kalitede çizilecek. Bileşenleri kanonda hazır.'})}${GM.bilgi({etiket: 'İçerik planı', ikon: 'bilgi', metin: x.icerik})}${GM.satirlar([{ikon: 'web', baslik: 'Web karşılığı', alt: x.kaynak}, {ikon: 'katman', baslik: 'Modül', alt: x.g.ad || ''}])}</div>`; }
  });
})();
