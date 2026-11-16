/* Hesap paketi verisi (GMX.hesap, GMX.bildirimler): kimlik, profil, ayarlar ve bildirim ekranlarının ortak kaynağı.
 * Kaynak: Gourmet web prototipi (hesabim/, giris/, kayit/, pro/, assets/js/rozet-veri.js, liste-veri.js, _src/veri/paket-kademeleri.mjs)
 * ve docs/WEB-ENVANTERI.md §4.5-4.8. Mekân, etkinlik ve lezzet adları GMV'den slug ile okunur; burada yalnız kullanıcının kendi kayıtları durur.
 * Sabit an GM.simdi() (13 Kasım 2026 12.10); tarihler buna göre. Yeni hesapta (GM.yeniHesap()) bu kayıtlar okunmaz, kullanıcının kendi işlemleri (GM.durum) okunur.
 * Kullanıcı yorumu metni tutulmaz (web Değerlendirmelerim yalnız puan ve fotoğraf işaretini gösterir). */
window.GMX = window.GMX || {};
GMX.hesap = {
  kullanici: {ad: 'Deniz', soyad: 'Aydın', kullaniciAdi: 'denizaydin', eposta: 'deniz@posta.com', telefon: '5321234567', sehir: 'İstanbul', hakkimda: '', uyelikTarih: 'Mart 2026', paket: 'Ücretsiz'},
  giris: {
    eposta: 'deniz@posta.com', sifre: 'Gurme2026!', denemeHakki: 5, kilitDk: 15, kodUzunluk: 6, ikiAdimKod: '482913', yenidenGonderSn: 30, baglantiDk: 30,
    kurtarmaKodlari: ['731-204', '558-019', '906-347', '214-880', '673-512'],
    sifreKurali: 'En az 8 karakter; büyük harf, küçük harf, rakam ve sembol.',
    sifreKurallari: [{ad: 'en az 8 karakter', desen: '.{8,}'}, {ad: 'büyük harf', desen: '[A-ZÇĞİÖŞÜ]'}, {ad: 'küçük harf', desen: '[a-zçğıöşü]'}, {ad: 'rakam', desen: '\\d'}, {ad: 'sembol', desen: '[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]'}]
  },
  // Açık oturumlar (web Hesap Ayarları › Güvenlik › oturumlar)
  oturumlar: [
    {id: 'bu', cihaz: 'iPhone · Dada Gourmet', yer: 'İstanbul', zaman: 'Şu an', ikon: 'mobile-screen', bu: true},
    {id: 'mac', cihaz: 'Mac · Safari', yer: 'İstanbul', zaman: 'Dün 21.40', ikon: 'laptop'},
    {id: 'ipad', cihaz: 'iPad · Dada Gourmet', yer: 'İzmir', zaman: '2 Kas', ikon: 'tablet-screen-button'}
  ],
  // Bildirim türleri: uygulama (push) ve e-posta kanalı varsayılanı. Saat önerileri 12.30 ve 19.00 (şartname M4); güvenlik uyarısı kapatılamaz.
  bildirimTurleri: [
    {id: 'rezervasyon', ad: 'Rezervasyon hatırlatması', alt: 'Masandan 24 saat ve 2 saat önce; onay ve ret', ikon: 'rezervasyon', push: true, eposta: true},
    {id: 'ogle', ad: 'Öğle önerisi · 12.30', alt: 'Yakınında açık şef sofraları', ikon: 'sun', push: true, eposta: false},
    {id: 'aksam', ad: 'Akşam önerisi · 19.00', alt: 'Akşam yemeği için yakındaki mekânlar', ikon: 'moon', push: true, eposta: false},
    {id: 'etkinlik', ad: 'Etkinlikler', alt: 'İlgilendiğin ve katılacağın etkinlikler yaklaşınca', ikon: 'etkinlik', push: true, eposta: true},
    {id: 'puan', ad: 'Dada Puan ve rozetler', alt: 'Puanın kesinleşince, rozet kazanınca', ikon: 'puanDada', push: true, eposta: false},
    {id: 'rota', ad: 'Rota yaklaşma', alt: 'Rotandaki durağa 3 km kala', ikon: 'rota', push: true, eposta: false},
    {id: 'katki', ad: 'Katkıların', alt: 'Önerin ve değerlendirmen incelenince', ikon: 'ekle', push: true, eposta: true},
    {id: 'kampanya', ad: 'Kampanya ve Pro fırsatları', alt: 'Ayda en çok iki kez', ikon: 'bolt', push: false, eposta: false},
    {id: 'guvenlik', ad: 'Güvenlik uyarıları', alt: 'Yeni cihazda giriş, şifre değişimi', ikon: 'gizlilik', push: true, eposta: true, sabit: true}
  ],
  sessizSaatler: [['22-07', '22.00–07.00'], ['23-08', '23.00–08.00'], ['00-06', '00.00–06.00'], ['kapali', 'Kapalı']],

  // ---------- Gurme Panelim (web 6 sekme) ----------
  // Rezervasyon durumları (panel GurmePanelimServisi): talep · onaylandi · reddedildi · iptal · gerceklesti · gelmedi
  rezervasyonlar: [
    {id: 'rz-mikla', slug: 'mikla', tarih: '2026-11-15', saat: '20:00', kisi: 2, cocuk: 0, masa: 'pencere_kenari', durum: 'standart', alerjen: 'Fıstık alerjisi', not: '', hal: 'onaylandi'},
    {id: 'rz-aseka', slug: 'aseka-karakoy', tarih: '2026-11-19', saat: '19:00', kisi: 2, cocuk: 0, masa: 'farketmez', durum: 'standart', alerjen: '', not: '', hal: 'talep'},
    {id: 'rz-narimor', slug: 'narimor-urla', tarih: '2026-11-21', saat: '19:30', kisi: 4, cocuk: 0, masa: 'bahce', durum: 'dogum_gunu', alerjen: '', not: 'Pasta getireceğiz.', hal: 'talep'},
    {id: 'rz-calipso', slug: 'calipso-fish', tarih: '2026-11-11', saat: '20:00', kisi: 2, cocuk: 0, masa: 'farketmez', durum: 'standart', alerjen: '', not: '', hal: 'onaylandi'},
    {id: 'rz-araf', slug: 'araf-istanbul', tarih: '2026-11-08', saat: '19:30', kisi: 2, cocuk: 0, masa: 'farketmez', durum: 'standart', alerjen: '', not: '', hal: 'gerceklesti'},
    {id: 'rz-topaz', slug: 'topaz', tarih: '2026-10-25', saat: '21:00', kisi: 2, cocuk: 0, masa: 'pencere_kenari', durum: 'standart', alerjen: '', not: '', hal: 'reddedildi', neden: 'Bu saatte masa kalmadı; mekân 19.30’u önerdi.'},
    {id: 'rz-sans', slug: 'sans-restaurant', tarih: '2026-10-12', saat: '20:30', kisi: 3, cocuk: 1, masa: 'bahce', durum: 'standart', alerjen: '', not: '', hal: 'gerceklesti'},
    {id: 'rz-park', slug: 'park-fora', tarih: '2026-10-03', saat: '20:00', kisi: 2, cocuk: 0, masa: 'teras', durum: 'standart', alerjen: '', not: '', hal: 'iptal'},
    {id: 'rz-kassandra', slug: 'kassandra-fethiye', tarih: '2026-09-14', saat: '20:00', kisi: 2, cocuk: 0, masa: 'teras', durum: 'yildonumu', alerjen: '', not: '', hal: 'gerceklesti'}
  ],
  // Gurme Favorilerim (web: Mekânlar · Tabaklar; mobil sekmeleri Mekân · Lezzet · Etkinlik · Rota). Rota favorisi Dada Route'un 'rota-favori' kaydıdır.
  favoriler: {
    mekan: ['mikla', 'levan-urla', 'od-urla', 'aseka-karakoy', 'gallada', 'murver', 'okra-istanbul', 'alaf-kurucesme', 'bebek-balikci', 'telezzuz', 'herise-istanbul', 'narimor-urla', 'rabbit-hole-olympos', 'the-club-bodrum', 'antalya-balikevi', 'macakizi-restaurant-bodrum', 'revithia', 'naya-dreamland', 'aheste', '360-istanbul', 'kassandra-fethiye', 'sans-restaurant', 'topaz', 'calipso-fish'],
    lezzet: ['kore-mutfaginda-fermantasyon-kulturu', 'safran-cigdem-cicegi-baharat-hikayesi', 'cam-bali-anzer-bali-ve-kestane-bali', 'tulum-peyniri-topragin-altinda-olgunlasan-lezzet', 'hatay-mutfagini-sekillendiren-cografya-ve-kultur', 'tarhana-kisa-hazirlanan-bir-miras', 'osmanli-mutfaginin-balkan-sofralarina-etkisi', 'portekiz-mutfaginin-vazgecilmez-lezzetleri-nelerdir', 'skandinav-mutfagi', 'tahin-ile-susam-ezmesi-ayni-sey-mi', 'kuzey-afrika-mutfagi', 'orta-asya-bozkir-mutfagi'],
    etkinlik: ['alba-beyaz-truf-fuari-2026', 'bocuse-dor-2027', 'madrid-fusion-2027', 'zibelemaerit-bern-2026', 'fete-du-citron-menton-2027', 'sagra-del-pesce-camogli-2027']
  },
  // Ziyaret Geçmişim ("Ziyaret Ettim", puan kazandırmaz)
  ziyaretler: [
    {slug: 'araf-istanbul', gun: '2026-11-08'}, {slug: 'calipso-fish', gun: '2026-11-11'}, {slug: 'aseka-karakoy', gun: '2026-11-01'}, {slug: 'mikla', gun: '2026-10-30'},
    {slug: 'topaz', gun: '2026-10-26'}, {slug: 'okra-istanbul', gun: '2026-10-18'}, {slug: 'sans-restaurant', gun: '2026-10-12'}, {slug: 'murver', gun: '2026-10-04'},
    {slug: 'gallada', gun: '2026-09-27'}, {slug: 'levan-urla', gun: '2026-09-20'}, {slug: 'od-urla', gun: '2026-09-19'}, {slug: 'kassandra-fethiye', gun: '2026-09-14'},
    {slug: 'bebek-balikci', gun: '2026-08-30'}, {slug: 'alaf-kurucesme', gun: '2026-08-16'}, {slug: '360-istanbul', gun: '2026-07-25'}
  ],
  // Değerlendirmelerim: puan n/5 ve fotoğraf işareti (metin tutulmaz). durum yayinda | inceleniyor. Puan: puanlama +2, fotoğraflı +15.
  degerlendirmeler: [
    {id: 'dg-mikla', slug: 'mikla', puan: 5, foto: 2, durum: 'inceleniyor', tarih: '2026-11-10'},
    {id: 'dg-aseka', slug: 'aseka-karakoy', puan: 4, foto: 1, durum: 'yayinda', tarih: '2026-11-02'},
    {id: 'dg-topaz', slug: 'topaz', puan: 4, foto: 0, durum: 'yayinda', tarih: '2026-10-27'},
    {id: 'dg-okra', slug: 'okra-istanbul', puan: 5, foto: 3, durum: 'yayinda', tarih: '2026-10-19'},
    {id: 'dg-murver', slug: 'murver', puan: 4, foto: 0, durum: 'yayinda', tarih: '2026-10-05'},
    {id: 'dg-gallada', slug: 'gallada', puan: 5, foto: 2, durum: 'yayinda', tarih: '2026-09-28'},
    {id: 'dg-levan', slug: 'levan-urla', puan: 5, foto: 1, durum: 'yayinda', tarih: '2026-09-21'},
    {id: 'dg-kassandra', slug: 'kassandra-fethiye', puan: 4, foto: 0, durum: 'yayinda', tarih: '2026-09-15'}
  ],
  // Topluluk Katkılarım: inceleniyor | yayinda | reddedildi. Kabul edilen mekân önerisi +50, etkinlik önerisi +25 Dada Puan (Beyar 16 Kas).
  katkilar: [
    {id: 'k-ciya', tur: 'mekan', ad: 'Çiya Sofrası', yer: 'Kadıköy, İstanbul', durum: 'inceleniyor', tarih: '2026-11-12'},
    {id: 'k-levan', tur: 'mekan', slug: 'levan-urla', durum: 'yayinda', tarih: '2026-09-02', onay: '2026-11-05'},
    {id: 'k-safran', tur: 'etkinlik', etkinlik: '10-uluslararasi-safran-hasadi-festivali-2026', durum: 'yayinda', tarih: '2026-10-08', onay: '2026-10-11'},
    {id: 'k-ciya-kebap', tur: 'mekan', ad: 'Çiya Kebap', yer: 'Kadıköy, İstanbul', durum: 'reddedildi', tarih: '2026-10-18', onay: '2026-10-21', neden: 'Adres ve iletişim bilgisi doğrulanamadı. Bilgi eklenirse yeniden değerlendirilir.'}
  ],
  // Dada Puan kuralları (panel config/puan-eylemleri.php, prototip dgPuan.KURAL)
  puanKurallari: [
    {k: 'puanlama', ikon: 'yildiz', ad: 'Puanlama', tutar: 2, onay: 'Moderasyon onayında kesinleşir'},
    {k: 'foto', ikon: 'kamera', ad: 'Fotoğraflı değerlendirme', tutar: 15, onay: 'Moderasyon onayında kesinleşir'},
    {k: 'rezervasyon', ikon: 'rezervasyon', ad: 'Gerçekleşen rezervasyon', tutar: 25, onay: 'Mekân başına bir kez, ziyaretten sonra'},
    {k: 'oneri', ikon: 'pin', ad: 'Kabul edilen mekân önerisi', tutar: 50, onay: 'Editör onayında kesinleşir'},
    {k: 'oneriEtkinlik', ikon: 'etkinlik', ad: 'Kabul edilen etkinlik önerisi', tutar: 25, onay: 'Editör onayında kesinleşir'}
  ],
  gunlukSinir: 100,
  // Rütbe merdiveni ve rozetler: web rozet-veri.js (Beyar onaylı set)
  rutbeler: [
    {k: 'merakli', ikon: 'heart', ad: 'Meraklı', esik: 0}, {k: 'lezzet-avcisi', ikon: 'utensils', ad: 'Lezzet Avcısı', esik: 100},
    {k: 'gurme', ikon: 'bowl-food', ad: 'Gurme', esik: 300}, {k: 'usta-gurme', ikon: 'user-tie', ad: 'Usta Gurme', esik: 700}, {k: 'sef-masasi', ikon: 'gem', ad: 'Şef Masası', esik: 1500}
  ],
  rozetAileleri: [
    {k: 'degerlendirme', ikon: 'star', ad: 'Değerlendirme', not: 'Yayına giren değerlendirmelerin ve tabak fotoğrafların.'},
    {k: 'katki', ikon: 'location-dot', ad: 'Topluluk katkısı', not: 'Editör onayından geçip yayına giren önerilerin.'},
    {k: 'masa', ikon: 'calendar-check', ad: 'Rezervasyon ve etkinlik', not: 'Gerçekleşen rezervasyonların ve etkinlik randevuların.'},
    {k: 'ziyaret', ikon: 'circle-check', ad: 'Ziyaret', not: 'Ziyaret Ettim ile işaretlediğin mekânlar.'}
  ],
  rozetler: [
    {id: 'ilk-tadim', aile: 'degerlendirme', ikon: 'star', ad: 'İlk Tadım', olcu: 'degerlendirme', esik: 1, nasil: 'İlk değerlendirmen yayına girsin.'},
    {id: 'gurme-kalem', aile: 'degerlendirme', ikon: 'pen-nib', ad: 'Gurme Kalem', olcu: 'degerlendirme', esik: 5, nasil: 'Beş değerlendirmen yayına girsin.'},
    {id: 'tabak-avcisi', aile: 'degerlendirme', ikon: 'camera', ad: 'Tabak Avcısı', olcu: 'foto', esik: 3, nasil: 'Fotoğraflı üç değerlendirmen yayına girsin.'},
    {id: 'kasif', aile: 'katki', ikon: 'location-dot', ad: 'Kâşif', olcu: 'oneriMekan', esik: 1, nasil: 'İlk mekân önerin yayına girsin.'},
    {id: 'hasat-habercisi', aile: 'katki', ikon: 'calendar-plus', ad: 'Hasat Habercisi', olcu: 'oneriEtkinlik', esik: 1, nasil: 'İlk etkinlik önerin yayına girsin.'},
    {id: 'masa-mudavimi', aile: 'masa', ikon: 'utensils', ad: 'Masa Müdavimi', olcu: 'rezervasyon', esik: 1, nasil: 'İlk rezervasyonun gerçekleşsin.'},
    {id: 'yol-arkadasi', aile: 'ziyaret', ikon: 'circle-check', ad: 'Yol Arkadaşı', olcu: 'ziyaret', esik: 3, nasil: 'Üç mekânı Ziyaret Ettim ile işaretle.'},
    {id: 'etkinlik-dostu', aile: 'masa', ikon: 'ticket', ad: 'Etkinlik Dostu', olcu: 'randevu', esik: 1, nasil: 'Lezzet Takvimi’nden ilk etkinlik randevunu oluştur.'}
  ],
  listeSiniri: 3,   // Ücretsiz pakette en çok 3 liste (web paket matrisi; Pro 25, Pro Max sınırsız)
  // Listelerim: web liste-veri.js (görünürlük: ozel = Gizli, yalnız ben · paylasilabilir = Bağlantısı olan görebilir)
  listeler: [
    {id: 'bogazda-aksam-yemegi', ad: 'Boğaz’da akşam yemeği', gorunurluk: 'paylasilabilir', taslak: false, kalem: ['mikla', 'alaf-kurucesme', 'bebek-balikci', 'rumelihisari-iskele', 'lacivert-restaurant'], guncel: '2026-11-09'},
    {id: 'urlada-bag-ve-sofra', ad: 'Urla’da bağ ve sofra', gorunurluk: 'paylasilabilir', taslak: false, kalem: ['od-urla', 'levan-urla', 'hus-sarapcilik', 'teruar-urla'], guncel: '2026-10-28'},
    {id: 'kapadokyada-yoresel-sofralar', ad: 'Kapadokya’da yöresel sofralar', gorunurluk: 'ozel', taslak: false, kalem: ['revithia', 'prokopi-restaurant', 'tandir-house-restaurant-cappadocia'], guncel: '2026-10-14'}
  ],
  // Etkinliklerim (web 7 sekme; bilet satışı Dada Gourmet üzerinden yapılmıyor)
  etkinliklerim: {
    katilacagim: ['hostech-by-tusid-istanbul-2026', 'festa-del-torrone-cremona-2026', 'zibelemaerit-bern-2026'],
    katildigim: ['10-uluslararasi-safran-hasadi-festivali-2026', 'ibaktech-istanbul-2026', 'festa-dell-uva-merano-2026'],
    ilgilendigim: ['alba-beyaz-truf-fuari-2026', 'bocuse-dor-2027', 'madrid-fusion-2027', 'fete-du-citron-menton-2027', 'sagra-del-pesce-camogli-2027']
  },
  // Keşif Tercihlerim (web kesif-tercihleri: canlı KesifTercihiKaydetIstegi seçenekleri, kısaltılmış gruplar)
  tercihGruplari: [
    {a: 'mutfak', ikon: 'utensils', baslik: 'Sevdiğim mutfaklar', secenek: [['Türk Mutfağı', 'utensils'], ['Ege Mutfağı', 'fish'], ['Akdeniz Mutfağı', 'lemon'], ['Anadolu Mutfağı', 'wheat-awn'], ['Deniz Ürünleri', 'fish'], ['Kebap / Ocakbaşı', 'fire'], ['İtalyan Mutfağı', 'pizza-slice'], ['Japon Mutfağı', 'bowl-rice'], ['Fransız Mutfağı', 'wine-glass'], ['Dünya Mutfağı', 'globe']]},
    {a: 'konsept', ikon: 'store', baslik: 'Mekân tercihlerim', secenek: [['Şef Restoranı', 'star'], ['Fine Dining', 'champagne-glasses'], ['Butik', 'gem'], ['Bahçeli', 'tree'], ['Deniz Kenarı', 'water'], ['Manzaralı', 'mountain-sun'], ['Tarihi', 'landmark'], ['Esnaf Lokantası', 'bowl-food'], ['Yerel Lezzet Noktası', 'store'], ['Üçüncü Nesil Kahveci', 'mug-hot']]},
    {a: 'etkinlik', ikon: 'etkinlik', baslik: 'Etkinlik ilgi alanlarım', secenek: [['Tadım Etkinlikleri', 'wine-glass'], ['Üretim, Hasat ve Bağ Deneyimleri', 'wheat-awn'], ['Gastronomi Festivalleri', 'tents'], ['Şef Buluşmaları ve Söyleşiler', 'microphone'], ['Mutfak Atölyeleri', 'kitchen-set'], ['Pop-up ve Konuk Şef Etkinlikleri', 'user-tie']]},
    {a: 'sehir', ikon: 'city', baslik: 'Şehir ve bölge', secenek: [['İstanbul'], ['İzmir'], ['Muğla'], ['Antalya'], ['Ankara'], ['Nevşehir'], ['Gaziantep'], ['Hatay'], ['Bursa'], ['Trabzon']]},
    {a: 'fiyat', ikon: 'fiyat', baslik: 'Fiyat aralığım', secenek: [['1', null, 'Ekonomik ₺'], ['2', null, 'Orta ₺₺'], ['3', null, 'Üst orta ₺₺₺'], ['4', null, 'Lüks ₺₺₺₺']]},
    {a: 'beslenme', ikon: 'vegan', baslik: 'Beslenme', tekil: 'Fark etmez', secenek: [['Vegan', 'seedling'], ['Vejetaryen', 'carrot'], ['Glutensiz', 'wheat-awn-circle-exclamation'], ['Laktozsuz', 'glass-water'], ['Helal', 'certificate'], ['Fark etmez', 'shuffle']]},
    {a: 'alerjen', ikon: 'uyari', baslik: 'Kaçındığım alerjenler', secenek: [['Gluten', 'wheat-awn'], ['Süt ve süt ürünleri', 'cow'], ['Yumurta', 'egg'], ['Fındık ve sert kabuklu yemişler', 'tree'], ['Yer fıstığı', 'seedling'], ['Susam', 'circle-dot'], ['Balık', 'fish'], ['Kabuklu deniz ürünleri', 'shrimp']]},
    {a: 'ortam', ikon: 'list-check', baslik: 'Ortam ve kullanım', secenek: [['Rezervasyon', 'calendar-check'], ['Bahçe / Teras', 'umbrella-beach'], ['Aile Dostu', 'children'], ['Canlı Müzik', 'music'], ['Otopark', 'square-parking'], ['Engelli Erişimi', 'wheelchair-move'], ['Kart Geçerli', 'credit-card']]}
  ],
  tercihVarsayilan: {mutfak: ['Türk Mutfağı', 'Ege Mutfağı', 'Deniz Ürünleri'], konsept: ['Şef Restoranı', 'Bahçeli', 'Deniz Kenarı'], etkinlik: ['Tadım Etkinlikleri', 'Gastronomi Festivalleri'], sehir: ['İstanbul', 'İzmir', 'Muğla'], fiyat: ['2', '3'], beslenme: ['Fark etmez'], alerjen: ['Yer fıstığı'], ortam: ['Rezervasyon', 'Bahçe / Teras']},
  // Paket kademeleri (web _src/veri/paket-kademeleri.mjs; panel PaketKademesi). Pro fiyatı webde ₺99/ay, panelde "Fiyat onay bekliyor"; uygulama içi satın alma henüz açık değil.
  kademeler: [
    {k: 'ucretsiz', ad: 'Ücretsiz', ikon: 'user', fiyat: '₺0', birim: 'her zaman', ozet: 'Gourmet’i keşfetmeye bugün başlamak için yeterli. Süresi dolmaz, tahsilat alınmaz.'},
    {k: 'pro', ad: 'Pro', ikon: 'bolt', fiyat: '₺99', birim: '/ ay', not: 'Fiyat onay bekliyor', one: true, ozet: 'Mekân keşfinin, listelerin ve Dada Route’un tamamı; düzenli dışarıda yiyen biri için.'},
    {k: 'pro-max', ad: 'Pro Max', ikon: 'gem', fiyat: null, not: 'Satışa açılmadı', ozet: 'Pro’nun tamamı, üstüne sınırsız liste, sınırsız rota ve rotanı herkese açık yayınlama.'}
  ],
  // Özellik matrisi (web 34 satırdan Pro farkını gösteren satırlar): [ad, ücretsiz, pro, proMax]
  matris: [
    ['Reklam', 'Reklam var', 'Reklamsız', 'Reklamsız'],
    ['Mekân Bul sihirbazı', 'Günde 3 tur', 'Günde 25 tur', 'Sınırsız'],
    ['Listelerim', '3 liste', '25 liste', 'Sınırsız'],
    ['Ziyaret Ettiklerim defteri', 'Son 30 gün', 'Son 12 ay', 'Sınırsız'],
    ['Keşif tercihleri', 'Temel', 'Gelişmiş', 'Gelişmiş'],
    ['Rozetler', 'Temel', 'Gelişmiş', 'Gelişmiş'],
    ['Kendi rotanı oluşturma', false, '5 rota', 'Sınırsız'],
    ['Durak ziyaret işaretleme ve ilerleme', false, true, true],
    ['Rotanı bağlantıyla paylaşma', false, true, true],
    ['Rotanı herkese açık yayınlama', false, false, true],
    ['Destek', 'Standart', 'Öncelikli', 'Öncelikli']
  ],
  proDurum: {satista: false, rozet: 'Yakında', dugme: 'Pro’ya geç', durumMetni: 'Uygulama içi satın alma **henüz açılmadı**; açılınca haber veririz.', fiyatNotu: 'Webde ₺99 / ay; fiyat onay bekliyor.'}
};

// Bildirimler: Gourmet bildirim türleri (rezervasyon, 12.30/19.00 öneri, etkinlik, puan, rota yaklaşma, katkı, güvenlik). Her biri gerçek bir adrese gider.
// tarih + saat sabit ana göre (13 Kasım 2026 12.10); grup ekranda tarihten hesaplanır.
GMX.bildirimler = [
  {id: 'b1', tur: 'rezervasyon', ikon: 'star', baslik: 'Calipso Fish ziyaretin nasıldı?', metin: '11 Kasım tarihli rezervasyonun geçti. Puanla, fotoğraf eklersen +17 bekleyen puan.', tarih: '2026-11-13', saat: '11:40', hedef: '#/profil/rezervasyon/rz-calipso'},
  {id: 'b2', tur: 'etkinlik', ikon: 'etkinlik', baslik: 'HOSTECH by TUSİD yarın bitiyor', metin: 'Katılacağın fuarın son günü 14 Kasım.', tarih: '2026-11-13', saat: '10:00', hedef: '#/etkinlik/hostech-by-tusid-istanbul-2026'},
  {id: 'b3', tur: 'puan', ikon: 'puanDada', baslik: 'Mikla değerlendirmen inceleniyor', metin: 'Onaylanınca +17 Dada Puan kesinleşir.', tarih: '2026-11-13', saat: '09:15', hedef: '#/profil/degerlendirmeler'},
  {id: 'b4', tur: 'oneri', ikon: 'moon', baslik: 'Akşam önerisi · 19.00', metin: 'Karaköy’de AŞEKA Karaköy bu akşam açık.', tarih: '2026-11-12', saat: '19:00', hedef: '#/mekan/aseka-karakoy', okundu: true},
  {id: 'b5', tur: 'rezervasyon', ikon: 'rezervasyon', baslik: 'Rezervasyonun onaylandı', metin: 'Mikla · 15 Kasım Pazar 20.00 · 2 kişi.', tarih: '2026-11-12', saat: '16:20', hedef: '#/profil/rezervasyon/rz-mikla'},
  {id: 'b6', tur: 'oneri', ikon: 'sun', baslik: 'Öğle önerisi · 12.30', metin: 'Asmalı Mescit’te Aheste öğle servisinde.', tarih: '2026-11-12', saat: '12:30', hedef: '#/mekan/aheste', okundu: true},
  {id: 'b7', tur: 'katki', ikon: 'ekle', baslik: 'Önerin incelemeye alındı', metin: 'Çiya Sofrası önerin editör onayında; kabul edilirse +50 Dada Puan.', tarih: '2026-11-12', saat: '10:05', hedef: '#/profil/katkilar'},
  {id: 'b8', tur: 'rota', ikon: 'rota', baslik: 'Urla’ya 3 km kaldı', metin: 'İzmir – Çeşme rotanda Levan yol üstünde.', tarih: '2026-11-10', saat: '13:10', hedef: '#/rota/izmir-cesme', okundu: true},
  {id: 'b9', tur: 'puan', ikon: 'puanDada', baslik: '+25 Dada Puan kesinleşti', metin: 'Araf İstanbul rezervasyonun gerçekleşti.', tarih: '2026-11-09', saat: '11:00', hedef: '#/profil/puan'},
  {id: 'b10', tur: 'rezervasyon', ikon: 'rezervasyon', baslik: 'Talebin mekâna iletildi', metin: 'Narımor Urla · 21 Kasım 19.30 · 4 kişi; onay bekleniyor.', tarih: '2026-11-09', saat: '09:30', hedef: '#/profil/rezervasyon/rz-narimor'},
  {id: 'b11', tur: 'oneri', ikon: 'moon', baslik: 'Akşam önerisi · 19.00', metin: 'Kadıköy’de Araf İstanbul bu akşam açık.', tarih: '2026-11-08', saat: '19:00', hedef: '#/mekan/araf-istanbul', okundu: true},
  {id: 'b12', tur: 'guvenlik', ikon: 'gizlilik', baslik: 'Yeni cihazda oturum açıldı', metin: 'iPad · Dada Gourmet, İzmir. Sen değilsen oturumu kapat.', tarih: '2026-11-07', saat: '22:14', hedef: '#/ayarlar/guvenlik', okundu: true},
  {id: 'b13', tur: 'etkinlik', ikon: 'etkinlik', baslik: 'Festa del Torrone başladı', metin: 'Cremona’daki nuga şenliği 22 Kasım’a kadar sürüyor.', tarih: '2026-11-07', saat: '10:00', hedef: '#/etkinlik/festa-del-torrone-cremona-2026', okundu: true},
  {id: 'b14', tur: 'puan', ikon: 'medal', baslik: 'Yeni rozet: Kâşif', metin: 'İlk mekân önerin yayına girdi.', tarih: '2026-11-05', saat: '15:40', hedef: '#/profil/puan', okundu: true},
  {id: 'b15', tur: 'katki', ikon: 'ekle', baslik: 'Levan önerin yayında', metin: '+50 Dada Puan hesabına geçti.', tarih: '2026-11-05', saat: '15:38', hedef: '#/mekan/levan-urla', okundu: true},
  {id: 'b16', tur: 'oneri', ikon: 'sun', baslik: 'Öğle önerisi · 12.30', metin: 'Beyoğlu’nda Mürver öğle servisinde.', tarih: '2026-11-04', saat: '12:30', hedef: '#/mekan/murver', okundu: true},
  {id: 'b17', tur: 'puan', ikon: 'puanDada', baslik: '+17 Dada Puan kesinleşti', metin: 'AŞEKA Karaköy değerlendirmen yayına girdi.', tarih: '2026-11-03', saat: '14:20', hedef: '#/profil/degerlendirmeler', okundu: true},
  {id: 'b18', tur: 'etkinlik', ikon: 'etkinlik', baslik: 'Safran Hasadı Festivali başlıyor', metin: 'Safranbolu’da 1-4 Kasım; katılacağın etkinlik.', tarih: '2026-10-31', saat: '10:00', hedef: '#/etkinlik/10-uluslararasi-safran-hasadi-festivali-2026', okundu: true},
  {id: 'b19', tur: 'rezervasyon', ikon: 'rezervasyon', baslik: 'Rezervasyonun onaylanmadı', metin: 'Topaz İstanbul: bu saatte masa kalmadı; mekân 19.30’u önerdi.', tarih: '2026-10-24', saat: '18:05', hedef: '#/profil/rezervasyon/rz-topaz', okundu: true},
  {id: 'b20', tur: 'katki', ikon: 'ekle', baslik: 'Önerin yayınlanmadı', metin: 'Çiya Kebap: adres ve iletişim bilgisi doğrulanamadı.', tarih: '2026-10-21', saat: '11:30', hedef: '#/profil/katkilar', okundu: true},
  {id: 'b21', tur: 'puan', ikon: 'puanDada', baslik: '+17 Dada Puan kesinleşti', metin: 'Okra İstanbul değerlendirmen yayına girdi.', tarih: '2026-10-20', saat: '16:00', hedef: '#/profil/degerlendirmeler', okundu: true},
  {id: 'b22', tur: 'rota', ikon: 'rota', baslik: 'Çevrimdışı rota hazır', metin: 'İzmir – Çeşme rotası telefonuna indirildi.', tarih: '2026-10-17', saat: '09:00', hedef: '#/rota/cevrimdisi', okundu: true},
  {id: 'b23', tur: 'puan', ikon: 'medal', baslik: 'Rütben yükseldi: Lezzet Avcısı', metin: 'Kesinleşen puanın 100’ü geçti.', tarih: '2026-10-13', saat: '12:00', hedef: '#/profil/puan', okundu: true},
  {id: 'b24', tur: 'puan', ikon: 'puanDada', baslik: '+25 Dada Puan kesinleşti', metin: 'Şans Restaurant rezervasyonun gerçekleşti.', tarih: '2026-10-13', saat: '11:50', hedef: '#/profil/puan', okundu: true},
  {id: 'b25', tur: 'rezervasyon', ikon: 'rezervasyon', baslik: 'Masan bu akşam 20.30’da', metin: 'Şans Restaurant · 3 kişi, 1 çocuk · bahçe.', tarih: '2026-10-12', saat: '18:30', hedef: '#/profil/rezervasyon/rz-sans', okundu: true},
  {id: 'b26', tur: 'oneri', ikon: 'moon', baslik: 'Akşam önerisi · 19.00', metin: 'Beyoğlu’nda GALLADA by Fatih Tutak bu akşam açık.', tarih: '2026-10-09', saat: '19:00', hedef: '#/mekan/gallada', okundu: true},
  {id: 'b27', tur: 'rezervasyon', ikon: 'rezervasyon', baslik: 'Rezervasyonunu iptal ettin', metin: 'Park Fora · 3 Ekim 20.00.', tarih: '2026-10-02', saat: '21:10', hedef: '#/profil/rezervasyon/rz-park', okundu: true}
];

// Kayıtlı hesabın kanon kayıtlarına tohum (bir kez): favori mekânlar ve ziyaretler GM.mekanKayit anahtarlarında durur ('mekan-favori', 'mekan-ziyaret'),
// böylece mekân kartı ve detaydaki kalp / Ziyaret Ettim ile profil aynı kaydı gösterir. Yeni hesapta ve misafirde yazılmaz; anahtar varsa dokunulmaz.
GMX.hesapTohumla = () => {
  try {
    if (!window.GM?.uye?.() || GM.yeniHesap()) return;
    const h = GMX.hesap;
    if (GM.durum.oku('mekan-favori', null) == null) GM.durum.yaz('mekan-favori', h.favoriler.mekan.slice().reverse().map(slug => ({slug})));
    if (GM.durum.oku('mekan-ziyaret', null) == null) GM.durum.yaz('mekan-ziyaret', h.ziyaretler.map(z => ({...z})));
  } catch (e) { /* özel pencere */ }
};
GMX.hesapTohumla();
