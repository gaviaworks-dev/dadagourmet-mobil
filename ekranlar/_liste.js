/* Ekran dosyaları ve rota tablosu (ortak dosya, yalnız lead değiştirir). 404 olan dosya sessizce atlanır.
   Görev 12 (15 Kas): patron A · Dada ailesi yönünü seçti → ana rotalar A çeşitlerine bağlı; B/C ve referanslı çeşitler #/alt/*, #/ref/* adreslerinde ARŞİV (silinmez).
   Paket sahipliği (tasks/ajan/A-TAMAMLAMA-BRIEF.md): kimlik · kesif · icerik · profil · ortak · route · a-cila. */
window.GM_EKRAN_DOSYALARI = [
  'gecici', 'katalog', 'kesfet', 'ana-alternatif', 'mekanlar', 'mekan', 'alternatifler', 'rota', 'rota-ek', 'ekranlar', 'ana-ref', 'liste-ref', 'detay-ref', 'route-ref', 'widget',
  // Görev 12 paketleri (dosya yoksa sessizce atlanır; *-veri dosyaları ekrandan önce yüklenir)
  'kimlik',
  'kesif-veri', 'ara', 'bildirimler', 'mekan-bul',
  'icerik-veri', 'etkinlik', 'lezzet',
  'profil-veri', 'profil',
  'ortak-veri', 'ayarlar', 'destek', 'yasal', 'sistem', 'isletme', 'durumlar',
  'rota-aktif', 'route-arsiv'
];
window.GM_ROTALAR = {
  // ---- Ana sekmeler (A · Dada ailesi) ----
  '#/kesfet': 'ana-a', '#/mekanlar': 'mekanlar-a', '#/mekan/:slug': 'mekan-a',
  // ---- Dada Route (patron mimari belgesi 15 Kas: giriş → aktif harita → istatistik çekmecesi) ----
  '#/rota': 'rota', '#/rota/planla': 'rota-planla', '#/rota/ozet/:id': 'rota-ozet', '#/rota/telefon': 'rota-telefon', '#/rota/arac': 'rota-arac', '#/rota/cevrimdisi': 'rota-cevrimdisi', '#/rota/gunluk': 'rota-gunluk', '#/rota/rotalarim': 'rota-rotalarim', '#/rota/hazir': 'rota-hazir',
  '#/rota/surus/:id': 'rota-surus', '#/rota/liste/:id': 'rota-liste', '#/rota/web/:id': 'rota-web', '#/rota/:id': 'rota-harita',
  // ---- Kimlik (paket kimlik) ----
  '#/splash': 'splash', '#/karsilama': 'karsilama', '#/onboarding': 'onboarding', '#/giris': 'giris', '#/kayit': 'kayit', '#/sifremi-unuttum': 'sifre', '#/iki-adim': 'iki-adim', '#/kilit': 'kilit',
  // ---- Keşif (paket kesif) ----
  '#/ara': 'ara', '#/bildirimler': 'bildirimler', '#/mekan-bul': 'mekan-bul', '#/mekan-bul/adim': 'mekan-bul-adim', '#/mekan-bul/sonuclar': 'mekan-bul-sonuc', '#/mekan-oner': 'mekan-oner',
  // ---- İçerik (paket icerik) ----
  '#/etkinlikler': 'etkinlikler', '#/etkinlik/:slug': 'etkinlik', '#/etkinlik-oner': 'etkinlik-oner', '#/lezzetler': 'lezzetler', '#/lezzet/:slug': 'lezzet', '#/rehberler': 'rehberler', '#/rehber/:slug': 'rehber',
  // ---- Profilim (paket profil) ----
  '#/profil': 'profil', '#/profil/duzenle': 'profil-duzenle', '#/profil/rezervasyonlar': 'rezervasyonlar', '#/profil/rezervasyon/:id': 'rezervasyon', '#/profil/favoriler': 'favoriler', '#/profil/ziyaretler': 'ziyaretler', '#/profil/degerlendirmeler': 'degerlendirmeler', '#/profil/katkilar': 'katkilar', '#/profil/puan': 'puan', '#/profil/listeler': 'listelerim', '#/profil/liste/:id': 'liste', '#/profil/etkinlikler': 'etkinliklerim', '#/profil/tercihler': 'tercihler',
  // ---- Hesap, destek, yasal, sistem, işletme (paket ortak) ----
  '#/ayarlar': 'ayarlar', '#/ayarlar/:bolum': 'ayarlar-bolum', '#/cozum-merkezi': 'cozum', '#/gorus-bildir': 'gorus', '#/sss': 'sss', '#/iletisim': 'iletisim',
  '#/yasal': 'yasal', '#/yasal/:slug': 'yasal-belge', '#/kurumsal/:slug': 'kurumsal', '#/paketlerim': 'paketlerim', '#/odemelerim': 'odemelerim', '#/pro': 'pro',
  '#/isletme': 'isletme', '#/isletme/basvuru': 'isletme-basvuru', '#/isletme/:bolum': 'isletme-bolum',
  '#/bakim': 'bakim', '#/guncelle': 'guncelle', '#/oturum-doldu': 'oturum-doldu', '#/yetki-yok': 'yetki-yok', '#/izin-reddi': 'izin-reddi', '#/durumlar': 'durumlar',
  // ---- Katalog, widget, geliştirici ----
  '#/ekranlar': 'ekranlar', '#/widget/:no': 'widget', '#/yer/:kod': 'yer', '#/hata': 'hata', '#/harita-deneme': 'harita-deneme', '#/katalog': 'katalog', '#/alternatifler': 'alternatifler',
  // ---- ARŞİV: karar sayfasının seçilmeyen çeşitleri (silinmez) ----
  '#/alt/ana-a': 'ana-a', '#/alt/ana-b': 'kesfet', '#/alt/ana-c': 'ana-c',
  '#/alt/liste-a': 'mekanlar-a', '#/alt/liste-b': 'mekanlar-b', '#/alt/liste-c': 'mekanlar-c',
  '#/alt/detay-a/:slug': 'mekan-a', '#/alt/detay-b/:slug': 'mekan-b', '#/alt/detay-c/:slug': 'mekan-c',
  '#/ref/route-0': 'ref-route-0', '#/ref/ana-1': 'ref-ana-1', '#/ref/liste-1': 'ref-liste-1', '#/ref/detay-1/:slug': 'ref-detay-1', '#/ref/route-1': 'ref-route-1', '#/ref/ana-2': 'ref-ana-2', '#/ref/liste-2': 'ref-liste-2', '#/ref/detay-2/:slug': 'ref-detay-2', '#/ref/route-2': 'ref-route-2', '#/ref/ana-3': 'ref-ana-3', '#/ref/liste-3': 'ref-liste-3', '#/ref/detay-3/:slug': 'ref-detay-3', '#/ref/route-3': 'ref-route-3', '#/ref/ana-4': 'ref-ana-4', '#/ref/liste-4': 'ref-liste-4', '#/ref/detay-4/:slug': 'ref-detay-4', '#/ref/route-4': 'ref-route-4'
};
window.GM_YONLENDIR = {};
