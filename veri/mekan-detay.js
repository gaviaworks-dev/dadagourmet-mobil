/* Mekân detayı ek alanları (galeri, açıklama, editör notu, deneyim, çalışma saatleri, adres, telefon, menü, Ne Yenir? / Ne Alınır?, benzer).
   KAYNAK: dadagourmet-prototip _src/sayfalar/mekan/mikla/index.html (webdeki tek tam detay örneği; satırlar: galeri 17-80, künye 46-80,
   Genel Bakış 112-170, Ne Yenir/Ne Alınır 181-182, Menü 183-204, Yorumlar 206-226, Adres & Saatler 228-262, kenar kutusu 280-292,
   Tarifler 266-276, benzer 319-380). Rezervasyon saatleri: assets/js/sayfa/rez-takvim.js (prototip örneği: 18.00–21.00, 30 dk).
   Görseller assets/gorsel/mekan-detay/ (web assets/o/medya/252-1600, 253-1600, 253-400 kopyası).
   Yalnız webde gerçekten olan alan yazılır; başka mekân için ek alan uydurulmaz (ekran o bölümü gizler ya da boş hali çizer).
   Puan, yorum yok (web: "★ –", Yorumlar 0). Ne Yenir / Ne Alınır webde "prototip örneği" etiketlidir; burada da ornek:true. */
window.GMV = window.GMV || {};
GMV.mekanDetay = {
  mikla: {
    galeri: [
      {src: 'assets/gorsel/mekan-detay/252-1600.webp', kucuk: 'assets/gorsel/mekan/252-400.webp', alt: 'Mikla restoranından gece İstanbul manzarası'},
      {src: 'assets/gorsel/mekan-detay/253-1600.webp', kucuk: 'assets/gorsel/mekan-detay/253-400.webp', alt: 'Mikla restoranında hazırlanan tadım tabağı'}
    ],
    goruntulenme: 18,
    yorumSayi: 0,
    aciklama: [
      '2005 yılında açılan Mikla, The Marmara Pera’nın üst katlarında İstanbul manzarasına karşı hizmet verir. Restoran, 2012’den bu yana **“Yeni Anadolu Mutfağı”** yaklaşımıyla yerel ürünleri ve üreticileri öne çıkarır.',
      'Konuklar üç aşamalı **à la carte** ya da **tadım menüsü** arasında seçim yapabilir. Resmî site menünün günlük tedarike göre değiştiğini belirtir; güncel seçenekler rezervasyon sırasında doğrulanmalıdır.'
    ],
    editorNotu: {etiket: 'Kaynak araştırması', metin: 'Mikla’nın Yeni Anadolu Mutfağı yaklaşımı ile Pera üzerindeki konumu birlikte değerlendirmeye değer. Bu not yerinde ziyaret değil, kaynak araştırmasıdır.'},
    deneyim: [
      {ikon: 'wand-magic-sparkles', ad: 'Atmosfer', deger: 'Pera üzerinde şehir manzaralı restoran'},
      {ikon: 'bell-concierge', ad: 'Servis Biçimi', deger: 'À la carte ve tadım menüsü'},
      {ikon: 'chair', ad: 'Oturma Alanı', deger: 'Restoran ve çatı terası'}
    ],
    vesile: [{ikon: 'utensils', ad: 'Akşam Yemeği'}],
    ozellik: ['Rezervasyon', 'Teras', 'Vejetaryen'],
    // Haftanın günü: 1 Pazartesi … 7 Pazar. Webde Pazar satırı yok: kapalı.
    saatler: {1: ['18:00', '00:00'], 2: ['18:00', '00:00'], 3: ['18:00', '00:00'], 4: ['18:00', '00:00'], 5: ['18:00', '00:00'], 6: ['18:00', '00:00']},
    adres: 'The Marmara Pera, Meşrutiyet Caddesi No:15 · 34430',
    telefon: '+90 (212) 293 5656',
    tel: '+902122935656',
    dogrulama: {metin: 'Bilgiler yakın zamanda doğrulandı', tarih: '16 Eyl 2026'},
    menu: null,
    alerjen: null,
    neYenir: [
      {ad: 'Örnek tabak: Otlu kuzu', alt: 'Tabak adı ve kısa açıklaması işletme ya da editör girince burada görünür.', tur: 'yenir'},
      {ad: 'Örnek tabak: Mevsim zeytinyağlısı', alt: 'Tabak adı ve kısa açıklaması işletme ya da editör girince burada görünür.', tur: 'yenir'},
      {ad: 'Örnek tabak: Ege levreği', alt: 'Tabak adı ve kısa açıklaması işletme ya da editör girince burada görünür.', tur: 'yenir'}
    ],
    neAlinir: [
      {ad: 'Örnek ürün: Zeytinyağı, 500 ml', alt: 'Paketli yerel ürün. Eve ya da ofise götürmek için.', kaynak: 'Üretici veya kooperatif adı burada görünür', tur: 'alinir'},
      {ad: 'Örnek ürün: Nar ekşisi, 250 ml', alt: 'Paketli yerel ürün. Eve ya da ofise götürmek için.', kaynak: 'Üretici veya kooperatif adı burada görünür', tur: 'alinir'}
    ],
    ornek: true,
    tarifler: {metin: 'Anadolu Mutfağı tarifleri · DadaGastro', url: 'https://dadagastro.com/tarifler?mutfak=turk-mutfagi'},
    rezervasyon: {not: 'Talebin mekân sahibine iletilir, onayıyla kesinleşir.', kosul: 'Rezervasyon koşulları işletmeye göre değişir.', saatler: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']},
    benzer: ['aila-restaurant', 'herise-istanbul', 'karnas-vineyards-bodrum']
  }
};
// Rezervasyon formu sabitleri (panel MekanRezervasyonIstegi + prototip mikla:470-560). Ayrıntılı saati olmayan mekânda varsayılan slotlar (rez-takvim.js).
GMV.rezervasyonSecenek = {
  gunIleri: 14, kisiMin: 1, kisiMax: 12, hizli: [1, 2, 3, 4, 6, 8], cocukMax: 20, alerjenMax: 500, notMax: 2000,
  saatler: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'],
  masa: [['farketmez', 'Farketmez', 'shuffle'], ['bahce', 'Bahçe', 'tree'], ['teras', 'Teras', 'umbrella-beach'], ['pencere_kenari', 'Pencere Kenarı', 'window-maximize'], ['sakin_kose', 'Sakin Köşe', 'mug-hot'], ['grup_masasi', 'Grup Masası', 'people-group']],
  durum: [['standart', 'Standart', 'utensils'], ['dogum_gunu', 'Doğum Günü', 'cake-candles'], ['yildonumu', 'Yıldönümü', 'heart'], ['is_yemegi', 'İş Yemeği', 'briefcase']],
  hataKonu: [['konum', 'Konum yanlış'], ['saat', 'Çalışma saati yanlış'], ['kapandi', 'İşletme kapanmış'], ['diger', 'Diğer']]
};
