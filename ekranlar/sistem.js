/* Sistem ekranları (paket ortak, isletme ajanı). Dada Diet mobil bakim.js, guncelle.js, oturum-doldu.js, yetki-yok.js, izinler.js (reddedildi hâli) ile birebir yapı:
 * ortak GM.durumSahne, tur 'tam', haller: false (akış ekranı; ?hal= ortak hâlleri uygulanmaz, ekrana özgü ?hal= değerleri aşağıda).
 *  #/bakim         ?hal=sure-yok: sunucu dönüş saati vermedi. Varsayılan: tahmini dönüş = sabit an + 1 sa (sunucudan gelir).
 *  #/guncelle      Varsayılan zorunlu (geri yok). ?tur=istege-bagli: "Şimdi değil" geri döner.
 *  #/oturum-doldu  ?eposta=<adres> giriş formuna taşınır (yoksa Ayarlar profil e-postası, o da yoksa hesap e-postası). Tekrar giriş #/giris?eposta=.
 *  #/yetki-yok     Varsayılan: bu bölüm bu hesaba kapalı. ?tur=baska-hesap&mod=dogrula|sifre|sil(&eposta=): e-postadaki bağlantı başka hesaba ait,
 *                  "Çıkış yap ve devam et" GM.dialog onayıyla GM.cikis(bağlantının sayfası). ?tur=isletme: başka işletmenin paneli (sahiplik yok).
 *  #/izin-reddi    ?tur=konum|bildirim|kamera (varsayılan konum), ?platform=ios|android. Diet izin reddedildi sahnesi: koyu sahne + numaralı Ayarlar adımları.
 *                  "Ayarları aç" izni verilmiş sayar (durum konum-izin / bildirim-izin / kamera-izin = 'verildi'), geri döner, toast; "Şimdi değil" geri.
 *                  Her türde izinsiz devam yolu ikincil düğmede (şehir seçerek mekânlar, bildirim ekranı, galeriden fotoğraf). ?donus=#/x dönüş adresi. */
(() => {
  const ad = 'Dada Gourmet';
  const hesapEposta = () => GM.durum.oku('hesap-ayar', {})?.profil?.eposta || (GM.yeniHesap() ? '' : window.GMX?.hesap?.kullanici?.eposta || window.GMV?.kullanici?.eposta || '');

  // ---------- Bakım ----------
  const donusSaat = () => { const t = GM.simdi(); t.setHours(t.getHours() + 1, 0, 0, 0); return t.toTimeString().slice(0, 5).replace(':', '.'); };
  GM.ekran('bakim', {
    haller: false,
    tur: 'tam',
    ciz: ctx => GM.durumSahne({
      isaret: 'screwdriver-wrench', baslik: 'Kısa bir bakımdayız',
      metin: ctx.sorgu.hal === 'sure-yok' ? `${ad}’i iyileştiriyoruz. **Dönüş saati henüz belli değil**; favorilerin ve rotaların güvende.` : `${ad}’i iyileştiriyoruz. **Tahmini dönüş ${donusSaat()}**; favorilerin ve rotaların güvende.`,
      ipucuBaslik: 'Bu sırada', ipuclari: [['route', 'İndirdiğin rotalar açılır', 'Çevrimdışı kaydettiğin rotalar bakımda da yolda seninle.'], ['mobile-screen', 'Kayıtların bu cihazda', 'Bakım bitince kendiliğinden eşitlenir.']],
      ana: {metin: 'Tekrar dene', ikon: 'yenile', veri: {eylem: 'tekrar'}},
      ikinciller: [{metin: 'Çevrimdışı rotalar', ikon: 'download', git: '#/rota/cevrimdisi'}]
    }),
    sonra: kok => GM.eylem(kok, 'tekrar', el => GM.mesgul(el).then(() => GM.yerine('#/kesfet')))
  });

  // ---------- Güncelleme ----------
  const IPUCLARI = () => [['shield-halved', 'Kayıtların korunur', 'Güncelleme favorilerini, listelerini ve rotalarını silmez.'], ['user', 'Oturumun açık kalır', 'Güncellemeden sonra kaldığın yerden devam edersin.'], ['mobile-screen', 'Yüklü sürüm', `${ad} ${GM.SURUM}`]];
  const MAGAZA = {metin: 'Mağazada güncelle', ikon: 'arrow-up-right-from-square', veri: {eylem: 'magaza'}};
  GM.ekran('guncelle', {
    haller: false,
    tur: 'tam',
    ciz: ctx => (ctx.sorgu.tur === 'istege-bagli'
      ? GM.durumSahne({isaret: 'circle-up', baslik: 'Yeni sürüm hazır', metin: `${ad}’in yeni sürümünü yükleyebilirsin. **Şimdi değil** dersen bu sürümle devam edersin.`, ipucuBaslik: 'Bilmen gerekenler', ipuclari: IPUCLARI(), ana: MAGAZA, ikinciller: [{metin: 'Şimdi değil', geri: true}]})
      : GM.durumSahne({isaret: 'circle-up', baslik: 'Güncellemen gerekiyor', metin: `Kullandığın sürüm artık desteklenmiyor. Devam etmek için **${ad}’i güncelle**.`, ipucuBaslik: 'Bilmen gerekenler', ipuclari: IPUCLARI(), ana: MAGAZA, ikinciller: []})),
    sonra: kok => GM.eylem(kok, 'magaza', el => GM.mesgul(el).then(() => GM.toast('**Mağaza sayfası** açılıyor', {ikon: 'circle-up', yerine: true})))
  });

  // ---------- Oturum süresi doldu ----------
  GM.ekran('oturum-doldu', {
    haller: false,
    tur: 'tam',
    ciz: ctx => {
      const ep = ctx.sorgu.eposta || hesapEposta();
      return GM.durumSahne({
        isaret: 'hourglass-end', baslik: 'Oturumun sona erdi',
        metin: ep ? `Güvenliğin için oturumunu kapattık. **${ep}** ile tekrar giriş yap, kaldığın yerden devam et.` : 'Güvenliğin için oturumunu kapattık. **Tekrar giriş yap**, kaldığın yerden devam et.',
        ipucuBaslik: 'Kayıtların duruyor', ipuclari: [['heart', 'Favorilerin ve listelerin', 'Oturumun kapanması kayıtlarını silmez.'], ['right-to-bracket', 'Aynı hesapla gir', 'Aynı e-postayla giriş yaptığında rotalarına ve Dada Puan’ına ulaşırsın.']],
        ana: {metin: 'Tekrar giriş yap', ikon: 'right-to-bracket', yerine: ep ? `#/giris?eposta=${encodeURIComponent(ep)}` : '#/giris'},
        ikinciller: [{metin: 'Yardım al', ikon: 'circle-question', git: '#/cozum-merkezi'}]
      });
    }
  });

  // ---------- Erişim yok ----------
  const MOD = {
    dogrula: 'E-posta doğrulama bağlantısını açtın ama şu an **farklı bir hesapla** giriş yapmış durumdasın. Doğrulama bu yüzden tamamlanmadı.',
    sifre: 'Şifre sıfırlama bağlantısını açtın ama şu an **farklı bir hesapla** giriş yapmış durumdasın. Yeni şifre ekranı bu yüzden açılmadı.',
    sil: 'Hesap silme onay bağlantısını açtın ama şu an **farklı bir hesapla** giriş yapmış durumdasın. Açık olan hesabında hiçbir şey değişmedi.'
  };
  const HEDEF = {dogrula: '#/giris', sifre: '#/sifremi-unuttum', sil: '#/kesfet'};
  const simdiki = () => (GM.uye() ? hesapEposta() || 'Açık olan hesap' : 'Bu cihazdaki hesap');
  GM.ekran('yetki-yok', {
    haller: false,
    tur: 'tam',
    ciz: ctx => {
      const tur = ctx.sorgu.tur;
      if (tur === 'baska-hesap') {
        return GM.durumSahne({isaret: 'arrow-right-arrow-left', baslik: 'Bu bağlantı başka bir hesaba ait', metin: MOD[ctx.sorgu.mod] || MOD.dogrula, ipucuBaslik: 'Hesaplar', ipucuParcali: true,
          ipuclari: [['user', 'Şu an açık olan hesap', simdiki()], ['envelope', 'Bağlantının ait olduğu hesap', ctx.sorgu.eposta || 'E-postandaki hesap']],
          ana: {metin: 'Çıkış yap ve devam et', ikon: 'right-from-bracket', veri: {eylem: 'cikis-devam'}}, ikinciller: [{metin: 'Bu hesapta kal', ikon: 'house', yerine: '#/kesfet'}]});
      }
      if (tur === 'isletme') {
        return GM.durumSahne({isaret: 'store', baslik: 'Bu işletme paneli sana kapalı', metin: 'Bu mekânın paneli **sahibi ya da yetkilisi** olan hesaplara açılır. Mekân senin işletmense sahiplik başvurusu yapabilirsin.',
          ipucuBaslik: 'Olası sebepler', ipuclari: [['user', 'Farklı bir hesap', 'İşletmeyi başka bir e-postayla kaydetmiş olabilirsin.'], ['hourglass-half', 'Başvuru sürüyor', 'Sahiplik onaylanınca panel kendiliğinden açılır.']],
          ana: {metin: 'İşletme merkezi', ikon: 'store', yerine: '#/isletme'}, ikinciller: [{metin: 'Yardım al', ikon: 'circle-question', git: '#/cozum-merkezi'}]});
      }
      return GM.durumSahne({isaret: 'user-lock', baslik: 'Bu bölüm sana kapalı', metin: 'Bu içerik **açık olan hesabına** tanımlı değil. Yanlış hesapla girmiş olabilirsin.',
        ipucuBaslik: 'Olası sebepler', ipuclari: [['user', 'Farklı bir hesap', 'Doğru hesapla giriş yaptığında bu bölüm açılır.'], ['link', 'Başkasının bağlantısı', 'Bağlantı sana başka bir hesaptan gönderilmiş olabilir.']],
        ana: {metin: 'Keşfet’e dön', ikon: 'house', yerine: '#/kesfet'}, ikinciller: [{metin: 'Yardım al', ikon: 'circle-question', git: '#/cozum-merkezi'}]});
    },
    sonra: (kok, ctx) => GM.eylem(kok, 'cikis-devam', () => {
      const mod = HEDEF[ctx.sorgu.mod] ? ctx.sorgu.mod : 'dogrula', donus = mod === 'sil' ? 'Çıkıştan sonra bağlantıyı **doğru hesapla** yeniden açabilirsin.' : 'Çıkıştan sonra **bağlantının sayfası** açılır.';
      return GM.dialog({baslik: 'Çıkış yapılsın mı?', metin: `Bu cihazdaki **kayıtların ve tercihlerin** silinir. ${donus}`, eylem: 'Çıkış yap', iptal: 'Vazgeç'})
        .then(ok => { if (ok) GM.cikis(mod === 'dogrula' && ctx.sorgu.eposta ? `${HEDEF.dogrula}?eposta=${encodeURIComponent(ctx.sorgu.eposta)}` : HEDEF[mod]); });
    })
  });

  // ---------- İzin reddedildi ----------
  const AYAR = ['Ayarlar’ı aç', 'Telefonunun Ayarlar uygulaması.'];
  const UYG = ['Uygulamalar › Dada Gourmet', 'Uygulama listesinden Dada Gourmet’i seç.'];
  const BUL = ['Dada Gourmet’i bul', 'Listede aşağı kaydır, Dada Gourmet’e dokun.'];
  const IZIN = {
    konum: {
      gorsel: 'assets/gorsel/hero/sokak-dikey.webp', ikon: 'location-crosshairs',
      baslik: 'Konum izni kapalı', metin: 'Yakınındaki mekânları sıralamak ve **Dada Route**’ta yolunu izlemek için konum izni gerekir. Bu sırada mekânları **şehir ve semt** seçerek süzebilirsin.',
      ipucu: 'Konum iznini açmak için',
      ios: [AYAR, BUL, ['Konum › Uygulamayı Kullanırken', 'Seç, uygulamaya dön.']],
      android: [AYAR, UYG, ['İzinler › Konum', '“Yalnızca uygulama kullanılırken izin ver” seç.']],
      alternatif: {metin: 'Şehir seçerek devam et', ikon: 'map-location-dot', yerine: '#/mekanlar'},
      tamam: '**Konum izni** açıldı', toastIkon: 'location-dot'
    },
    bildirim: {
      gorsel: 'assets/gorsel/hero/sokak-panorama.webp', ikon: 'bildirim',
      baslik: 'Bildirim izni kapalı', metin: 'Rezervasyon hatırlatmaları ve **yol üstündeki duraklar** için bildirim izni gerekir. Bildirimlerin uygulama içinde **Bildirimler** ekranında yine toplanır.',
      ipucu: 'Bildirimleri açmak için',
      ios: [AYAR, ['Bildirimler › Dada Gourmet', 'Bildirimler listesinde Dada Gourmet’i bul.'], ['Bildirimlere İzin Ver’i aç', 'Anahtarı aç, uygulamaya dön.']],
      android: [AYAR, UYG, ['Bildirimler’i aç', 'Dada Gourmet bildirimleri anahtarını aç.']],
      alternatif: {metin: 'Bildirimler ekranı', ikon: 'bildirim', yerine: '#/bildirimler'},
      tamam: '**Bildirimler** açıldı', toastIkon: 'bildirim'
    },
    kamera: {
      gorsel: 'assets/gorsel/hero/tabak.webp', ikon: 'kamera',
      baslik: 'Kamera izni kapalı', metin: 'Değerlendirmene ve mekân önerine **fotoğraf çekmek** için kamera izni gerekir. Bu sırada fotoğrafı **galeriden** seçebilirsin.',
      ipucu: 'Kamera iznini açmak için',
      ios: [AYAR, BUL, ['Kamera’yı aç', 'Anahtarı aç, uygulamaya dön.']],
      android: [AYAR, UYG, ['İzinler › Kamera', '“Yalnızca uygulama kullanılırken izin ver” seç.']],
      alternatif: {metin: 'Galeriden seç', ikon: 'images', veri: {eylem: 'galeri'}},
      tamam: '**Kamera izni** açıldı', toastIkon: 'kamera'
    }
  };
  const turAl = ctx => (IZIN[ctx.sorgu.tur] ? ctx.sorgu.tur : 'konum');
  const platform = ctx => (ctx.sorgu.platform === 'android' || (!ctx.sorgu.platform && /Android/i.test(navigator.userAgent)) ? 'android' : 'ios');
  const donus = ctx => (/^#\//.test(ctx.sorgu.donus || '') ? ctx.sorgu.donus : '#/kesfet');
  GM.ekran('izin-reddi', {
    haller: false,
    tur: 'tam',
    ciz: ctx => {
      const x = IZIN[turAl(ctx)];
      return GM.durumSahne({
        tema: 'koyu', gorsel: x.gorsel, isaret: x.ikon, baslik: x.baslik, metin: x.metin,
        ana: {metin: 'Ayarları aç', ikon: 'ayar', veri: {eylem: 'izin-ayar'}}, ikinciller: [x.alternatif, {metin: 'Şimdi değil', veri: {eylem: 'izin-don'}}],
        ipucuBaslik: x.ipucu, ipucuParcali: true, ipuclari: x[platform(ctx)].map(([b, a], i) => [String(i + 1), b, a])
      });
    },
    sonra: (kok, ctx) => {
      const tur = turAl(ctx), x = IZIN[tur];
      const c = [
        GM.eylem(kok, 'izin-ayar', el => GM.mesgul(el).then(() => { GM.durum.yaz(`${tur}-izin`, 'verildi'); GM.geri(donus(ctx)); GM.toast(x.tamam, {tur: 'basari', ikon: x.toastIkon}); })),
        GM.eylem(kok, 'izin-don', () => GM.geri(donus(ctx))),
        GM.eylem(kok, 'galeri', () => GM.toast('**Galeri** açılıyor; fotoğrafını seçebilirsin', {ikon: 'images', yerine: true}))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
