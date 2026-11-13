/* Mekân detayı · referanslı 4 alternatif (Görev 4). Rotalar: #/ref/detay-1..4/:slug → ref-detay-1..4. A/B/C (ekranlar/mekan.js) ayrı kalır, tekrarlanmaz.
   Her biri tek bir global uygulamanın detay kalıbından beslenir; bileşenler kanon/gm-k-detay.* (Gourmet) ve ortak kanondan gelir. Web alanları
   (docs/WEB-ENVANTERI.md §2.3) eksiltilmez; ek alanlar yalnız Mikla'da var (veri/mekan-detay.js), diğer mekânlarda o bölüm gizlenir.
   Ödül, puan, yorum, fiyat uydurulmaz: Michelin yıldızı yerine Gourmet'in gerçek seçkileri (Dada Route durağı, editör notu) yazılır.
   Mobil ekstra (webde yok): 1'de kişisel "Not", 3'te yakındaki etkinlik biletleri (mekân–etkinlik ilişkisi webde yok). */
(() => {
  const FIYAT = ['', 'Ekonomik', 'Orta', 'Üst Orta', 'Lüks'];
  const nokta = s => String(s || '').replace(':', '.');
  const bulunamadi = () => GM.hataEkran({tur: 'bulunamadi', baslik: 'Mekân bulunamadı', metin: 'Bu mekân yayından kalkmış ya da bağlantı eskimiş olabilir. **Mekânlar** listesinden devam et.', eylem: {metin: 'Mekânlara dön', ikon: 'mekan', yerine: '#/mekanlar'}});
  const bugunMetin = v => (v.acik.acilis ? `Bugün ${nokta(v.acik.acilis)}${GM.saatEki(v.acik.acilis, 'den')} itibaren` : 'Onayla kesinleşir');
  const seckiler = v => [...(v.m.seckiler || []).includes('rota') ? [{ikon: 'rota', ad: 'Dada Route durağı'}] : [], ...(v.d.editorNotu ? [{ikon: 'pen-nib', ad: 'Editör notu'}] : [])];
  const bilinmesi = v => GM.satirlar([
    v.m.rezervasyon ? {ikon: 'rezervasyon', baslik: 'Rezervasyon koşulları', alt: 'Talep · onayla kesinleşir', veri: {eylem: 'mk-bilgi', id: 'rez'}} : null,
    {ikon: 'gizlilik', baslik: 'Alerjen ve beslenme', alt: v.d.alerjen ? 'Mekân bilgi paylaştı' : 'Henüz paylaşılmadı, sormayı unutma', veri: {eylem: 'mk-bilgi', id: 'alerjen'}},
    {ikon: 'saat', baslik: 'Çalışma saatleri', alt: v.acik.metin || 'Henüz girilmedi', veri: {eylem: 'mk-bilgi', id: 'saat'}}
  ].filter(Boolean));
  const benzer = v => (v.benzer.length ? GM.yatay(v.benzer.map(x => GM.mekanKart(x, {kayitli: GM.mekanKayit.var('favori', x.slug)}))) : '');
  // Kuyruk satırı: doğrulama · güncelleme · Hata bildir tek satırda (yığılma kuralı 2: tek başına "Bilgi hatası bildir" satırı yok).
  const kuyrukSatir = v => GM.tazelik(v.d.dogrulama, {hata: true});
  const ortak = {
    tur: 'banner', iskelet: 'detay', ust: '#/mekanlar',
    yukle: () => GM.yukleVeri('mekan-detay'),
    baslik: ctx => GM.mekan(ctx.param.slug)?.ad || 'Mekân',
    sonra: (kok, ctx) => { const v = GM.mekanPaket(ctx.param.slug); if (!v) return null; return GM.mekanEylemBagla(kok, v.m, v.d, {galeri: v.galeri, rota: v.rota, olanaklar: GM.olanaklar(v)}); }
  };
  const rotaBag = v => (v.rota ? GM.rotaBaglam({baslik: `${v.rota.R.ad} rotasında`, sapma: {dk: v.rota.d.sapma, km: v.rota.d.km}, alt: v.rota.d.uzak <= 1 ? 'Güzergâhtan ayrılmadan' : `Güzergâhtan ${GM.ondalik(v.rota.d.uzak, 1)} km içeride`}) : '');
  const ilKart = v => (v.il?.tescilli?.length ? GM.ilKart({...v.il, bolge: 'Coğrafi işaret · Dada Route il kartı'}) : '');
  const bar = sag => ctx => (GM.mekan(ctx.param.slug) ? {menu: false, sag} : {saydam: false});

  // ---------- 1 · Michelin Guide kalıbı: kare fotoğraf, ayırt ediciler, ad + adres + mutfak, 4'lü Favori/Kaydet/Gittim/Not, editoryal görüş, bilgi listesi, olanak ızgarası ----------
  GM.ekran('ref-detay-1', {...ortak,
    ustBar: bar([{ikon: 'harita', etiket: 'Haritada göster', veri: {eylem: 'mk-harita'}}, {ikon: 'paylas', etiket: 'Paylaş', veri: {eylem: 'mk-paylas'}}]),
    ciz: ctx => {
      const v = GM.mekanPaket(ctx.param.slug); if (!v) return bulunamadi();
      const {m, d} = v, ol = GM.olanaklar(v);
      return GM.galeriHero({gorseller: v.galeri, sinif: 'is-kare', etiket: `${m.ad} fotoğrafları`}) + GM.refAkis([
        `${GM.mekanKimlik(m, d, {rozetHtml: GM.ayirtSatir(seckiler(v))})}${GM.eylemDortlu([
          {ikon: 'favori', ad: 'Favori', basili: GM.mekanKayit.var('favori', m.slug), veri: {eylem: 'mk-kaydet'}},
          {ikon: 'kaydet', ad: 'Kaydet', adBasili: 'Listede', basili: GM.mekanKayit.var('liste', m.slug), veri: {eylem: 'mk-liste'}},
          {ikon: 'ziyaret', ad: 'Gittim', basili: GM.mekanKayit.var('ziyaret', m.slug), veri: {eylem: 'mk-ziyaret'}},
          {ikon: 'duzenle', ad: 'Not', adBasili: 'Notun var', basili: GM.mekanKayit.var('not', m.slug), veri: {eylem: 'mk-not'}}])}${rotaBag(v)}`,
        {ust: 'Dada Gourmet’in görüşü', html: `${(d.aciklama || [m.tanitim]).filter(Boolean).map(x => GM.p(x)).join('')}${d.editorNotu ? GM.alinti({metin: d.editorNotu.metin, kaynak: `Dada Gourmet editörü · ${d.editorNotu.etiket}`}) : ''}`},
        {ust: 'Bilgiler', html: GM.satirlar([
          {ikon: 'pin', baslik: d.adres || GM.konumMetin(m, 'uzun'), alt: 'Yol tarifi al', veri: {eylem: 'mk-yol'}},
          d.tel ? {ikon: 'telefon', baslik: d.telefon, alt: 'İşletmeyi ara', veri: {eylem: 'mk-ara'}} : null,
          {ikon: 'saat', baslik: v.acik.metin || 'Çalışma saatleri', alt: d.saatler ? 'Haftalık saatleri gör' : 'Saatler henüz girilmedi', veri: {eylem: 'mk-bilgi', id: 'saat'}},
          m.rezervasyon ? {ikon: 'rezervasyon', baslik: 'Rezervasyon alıyor', alt: 'Talep · onayla kesinleşir', veri: {eylem: 'mk-bilgi', id: 'rez'}} : null,
          {ikon: 'gizlilik', baslik: 'Alerjen bilgisi', alt: d.alerjen ? 'Paylaşıldı' : 'Henüz paylaşılmadı', veri: {eylem: 'mk-bilgi', id: 'alerjen'}}
        ].filter(Boolean))},
        ol.length ? {ust: 'Olanaklar', html: GM.olanakListe(ol, {sutun: 2})} : null,
        {ust: 'Konum', html: `${GM.harita({ad: `r1-${m.slug}`, yukseklik: 'var(--gm-size-map-h)', merkez: [m.lng, m.lat], zoom: 14.2, etkilesim: false, kontroller: false, pinler: [{id: m.slug, lng: m.lng, lat: m.lat, secili: true, ad: m.ad}], etiket: `${m.ad} haritada`})}${GM.p(GM.konumMetin(m, 'uzun'), {meta: true, ton: 'ikincil'})}`},
        v.yakin.length ? {ust: 'Yakında', baslik: 'Yakındaki mekânlar', html: GM.yatay(v.yakin.slice(0, 6).map(x => GM.mekanKart(x, {kayitli: GM.mekanKayit.var('favori', x.slug), mesafe: `${GM.ondalik(GM.km([m.lng, m.lat], [x.lng, x.lat]), 1)} km`})))} : null,
        {html: kuyrukSatir(v), gri: true}
      ]);
    },
    altBar: ctx => { const v = GM.mekanPaket(ctx.param.slug); if (!v) return ''; return GM.altEylem({ikonlar: [...(v.d.tel ? [{ikon: 'telefon', ad: 'Ara', veri: {eylem: 'mk-ara'}}] : []), {ikon: 'yon', ad: 'Yol tarifi', veri: {eylem: 'mk-yol'}}], dugmeler: [v.m.rezervasyon ? {metin: 'Masa ayırt', ikon: 'rezervasyon', veri: {eylem: 'mk-rez'}} : {metin: 'Haritada aç', ikon: 'harita', veri: {eylem: 'mk-harita'}}]}); }
  });

  // ---------- 2 · OpenTable kalıbı: rezervasyon öncelikli; kısa fotoğraf, kimlik, kişi · gün kapsülü + bugün/yarın slot bandı, "Şunun için ideal", menü özeti ----------
  GM.ekran('ref-detay-2', {...ortak,
    ustBar: bar([{ikon: 'favori', etiket: 'Favorilere ekle', veri: {eylem: 'mk-kaydet'}, attrs: 'aria-pressed="false"'}, {ikon: 'paylas', etiket: 'Paylaş', veri: {eylem: 'mk-paylas'}}]),
    ciz: ctx => {
      const v = GM.mekanPaket(ctx.param.slug); if (!v) return bulunamadi();
      const {m, d} = v;
      const ideal = [...(m.vesile || []).map(ad => ({ikon: 'utensils', ad})), ...(m.konsept || []).map(ad => ({ikon: 'yildiz', ad})), ...(d.deneyim || []).filter(x => x.ad === 'Oturma Alanı').map(x => ({ikon: x.ikon, ad: x.deger}))];
      const menu = d.neYenir?.length ? `${GM.satirlar(d.neYenir.map(x => ({ikon: 'neYenir', baslik: x.ad.replace('Örnek tabak: ', ''), alt: d.ornek ? 'Örnek içerik · imza tabak' : 'İmza tabak'})))}${GM.veriYok('Tam menü **henüz girilmedi**; fiyatlar rezervasyonda doğrulanır.')}` : GM.veriYok('Menü **henüz girilmedi**. İşletme eklediğinde burada görünür.');
      return GM.galeriHero({gorseller: v.galeri, sinif: 'is-kisa is-bindir', etiket: `${m.ad} fotoğrafları`}) + GM.refAkis([
        `${GM.mekanKimlik(m, d, {kompakt: true, meta: {mutfak: false, goz: false}})}${rotaBag(v)}`,
        m.rezervasyon ? {ust: 'Masa ayırt', baslik: 'Bir saat seç', html: `${GM.slotBant(m, d, {kisi: 2, not: 'Onayla kesinleşir'})}${GM.p('Saate dokun; alerjen notunu ekleyip **talebini gönder**.', {meta: true, ton: 'ikincil'})}`, gri: true} : {ust: 'Masa', html: GM.veriYok('Bu mekân **rezervasyon almıyor**; doğrudan gidebilirsin.'), gri: true},
        ideal.length ? {baslik: 'Şunun için ideal', html: GM.etiketBulut(ideal)} : null,
        {baslik: 'Menü özeti', html: menu},
        {baslik: 'Bilinmesi gerekenler', html: bilinmesi(v)},
        {baslik: 'Yorumlar', html: `${GM.yorumBolumu({yorumlar: [], bos: 'Bu mekân için henüz onaylanmış bir yorum yok. İlk değerlendiren sen ol.'})}${GM.btn({metin: 'Değerlendir', ikon: 'yildiz', tur: 'secondary', tam: true, veri: {eylem: 'mk-degerlendir'}})}`},
        {baslik: 'Konum', html: GM.adresKart(m, d)},
        v.benzer.length ? {baslik: 'Benzer mekânlar', html: benzer(v)} : null,
        kuyrukSatir(v)
      ], {bindir: true});
    },
    altBar: ctx => { const v = GM.mekanPaket(ctx.param.slug); if (!v) return ''; return v.m.rezervasyon ? GM.rezBar({baslik: 'Masa ayırt · 2 kişi', alt: bugunMetin(v), altIkon: 'saat', eylem: {metin: 'Rezervasyon', ikon: 'rezervasyon', veri: {eylem: 'mk-rez'}}}) : GM.rezBar({baslik: 'Rezervasyon almıyor', alt: GM.konumMetin(v.m), altIkon: 'pin', eylem: {metin: 'Yol tarifi', ikon: 'yon', veri: {eylem: 'mk-yol'}}}); }
  });

  // ---------- 3 · Tock kalıbı: vitrin başlığı + logo karosu, deneyim biletleri (tadım menüsü / à la carte / teras), yakındaki etkinlik biletleri ----------
  const deneyimler = v => {
    const {m, d} = v, servis = (d.deneyim || []).find(x => x.ad === 'Servis Biçimi')?.deger || '', oturma = (d.deneyim || []).find(x => x.ad === 'Oturma Alanı')?.deger || '';
    const saat = d.rezervasyon?.saatler ? `${nokta(d.rezervasyon.saatler[0])}–${nokta(d.rezervasyon.saatler.at(-1))} masa` : 'Akşam masaları', kisi = '1–12 kişi';
    const rez = id => (m.rezervasyon ? {metin: 'Tarih seç', ikon: 'takvim', tur: 'tonal', veri: {eylem: 'mk-rez', id}} : {metin: 'Yol tarifi', ikon: 'yon', tur: 'tonal', veri: {eylem: 'mk-yol'}});
    const l = [];
    if (/tadım/i.test(servis)) l.push({etiket: 'Akşam yemeği', ikon: 'yildiz', gorsel: (v.galeri.find(g => /tadım|tabağ/i.test(g.alt || '')) || {}).src, baslik: 'Tadım menüsü', metin: 'Menü **günlük tedarike** göre değişir; güncel içerik ve fiyat rezervasyonda doğrulanır.', meta: [{ikon: 'saat', metin: saat}, {ikon: 'kisi', metin: kisi}], eylem: rez('')});
    if (/carte/i.test(servis)) l.push({etiket: 'Akşam yemeği', ikon: 'menu', baslik: 'À la carte', metin: 'Üç aşamalı **à la carte** seçim; tabakları masada kendin kurarsın.', meta: [{ikon: 'saat', metin: saat}, {ikon: 'kisi', metin: kisi}], eylem: rez('')});
    if (/teras/i.test(oturma)) l.push({etiket: 'Oturma', ikon: 'teras', gorsel: (v.galeri.find(g => /manzara/i.test(g.alt || '')) || {}).src, baslik: 'Çatı terası masası', metin: 'Rezervasyonda **Teras** tercihini işaretle; yer durumu mekân onayıyla kesinleşir.', meta: [{ikon: 'chair', metin: 'Masa tercihi'}, {ikon: 'kisi', metin: kisi}], eylem: rez('')});
    if (!l.length) l.push({etiket: (m.vesile || [])[0] || m.kategori, ikon: 'rezervasyon', baslik: m.rezervasyon ? 'Masa rezervasyonu' : 'Rezervasyonsuz mekân', metin: m.tanitim || '', meta: [{ikon: 'fiyat', metin: FIYAT[m.fiyat] || ''}, ...(m.rezervasyon ? [{ikon: 'kisi', metin: kisi}] : [])], eylem: rez('')});
    return l.map(GM.deneyimBilet).join('');
  };
  GM.ekran('ref-detay-3', {...ortak,
    ustBar: bar([{ikon: 'paylas', etiket: 'Paylaş', veri: {eylem: 'mk-paylas'}}]),
    ciz: ctx => {
      const v = GM.mekanPaket(ctx.param.slug); if (!v) return bulunamadi();
      const {m, d} = v;
      return GM.vitrinBas({gorsel: v.galeri[0]?.src, logo: v.galeri[1]?.kucuk || null, baslik: m.ad, metaHtml: GM.mekanMeta(m, d, {durum: false, goz: false}),
        sag: GM.ikonBtn({ikon: 'favori', etiket: 'Favorilere ekle', tur: 'kutu', secili: GM.mekanKayit.var('favori', m.slug), veri: {eylem: 'mk-kaydet'}}) + GM.ikonBtn({ikon: 'ziyaret', etiket: 'Ziyaret Ettim', tur: 'kutu', secili: GM.mekanKayit.var('ziyaret', m.slug), veri: {eylem: 'mk-ziyaret'}})})
        + GM.refAkis([
          `${GM.aciklama({metin: (d.aciklama || [m.tanitim]).filter(Boolean).join(' '), satir: 3})}${GM.etiketBulut(v.ozellik.map(ad => ({ikon: 'onay', ad})))}`,
          {ust: 'Deneyimler', baslik: 'Ne ayırtmak istersin?', html: `<div class="gm-yigin">${deneyimler(v)}</div>`, gri: true},
          d.neAlinir?.length ? {ust: 'Paket al · Ne Alınır?', baslik: 'Mekândan eve götür', html: `${GM.p('Paketli yerel ürünler; **satış yok**, bilgi ve yönlendirme var.', {meta: true, ton: 'ikincil'})}<div class="gm-yigin-12">${d.neAlinir.map(x => GM.deneyimBilet({etiket: d.ornek ? 'Örnek içerik' : 'Ne Alınır?', ikon: 'neAlinir', baslik: x.ad.replace('Örnek ürün: ', ''), metin: x.alt, meta: [{ikon: 'onay', metin: x.kaynak || 'Üretici bilgisi'}]})).join('')}</div>`} : null,
          v.etk.length ? {ust: 'Etkinlikler · yakında', baslik: 'Bu mekânın çevresinde', html: `${GM.p('Mekâna bağlı etkinlik henüz yok; **en yakın** yaklaşan etkinlikler:', {meta: true, ton: 'ikincil'})}<div class="gm-yigin-12">${v.etk.map(x => GM.deneyimBilet({tarih: x.e.tarih, etiket: x.e.tur || 'Etkinlik', baslik: x.e.ad, meta: [{ikon: 'pin', metin: [x.e.yer, x.e.il].filter(Boolean).join(', ')}, {ikon: 'yon', metin: `${GM.sayi(Math.round(x.km))} km`}], eylem: {metin: 'Gör', tur: 'secondary', git: `#/etkinlik/${x.e.slug}`}})).join('')}</div>`} : null,
          {baslik: 'Bilinmesi gerekenler', html: bilinmesi(v)},
          {baslik: 'Konum', html: GM.adresKart(m, d)},
          v.benzer.length ? {baslik: 'Benzer mekânlar', html: benzer(v)} : null,
          kuyrukSatir(v)
        ]);
    },
    altBar: ctx => { const v = GM.mekanPaket(ctx.param.slug); if (!v) return ''; return GM.rezBar({baslik: v.m.rezervasyon ? 'Deneyimini seç' : 'Rezervasyon almıyor', alt: v.m.rezervasyon ? bugunMetin(v) : GM.konumMetin(v.m), altIkon: v.m.rezervasyon ? 'saat' : 'pin', eylem: v.m.rezervasyon ? {metin: 'Rezervasyon', ikon: 'rezervasyon', veri: {eylem: 'mk-rez'}} : {metin: 'Yol tarifi', ikon: 'yon', veri: {eylem: 'mk-yol'}}}); }
  });

  // ---------- 4 · Airbnb kalıbı: fotoğraf sahnesi + bindiren panel, ortalı başlık + üçlü özet, editör satırı, öne çıkanlar, olanak listesi, konum haritası, yapışkan fiyat çubuğu ----------
  GM.ekran('ref-detay-4', {...ortak,
    ustBar: bar([{ikon: 'paylas', etiket: 'Paylaş', veri: {eylem: 'mk-paylas'}}, {ikon: 'favori', etiket: 'Favorilere ekle', veri: {eylem: 'mk-kaydet'}, attrs: 'aria-pressed="false"'}]),
    ciz: ctx => {
      const v = GM.mekanPaket(ctx.param.slug); if (!v) return bulunamadi();
      const {m, d} = v, ol = GM.olanaklar(v), s = d.saatler?.[(GM.simdi().getDay() + 6) % 7 + 1];
      const one = [
        v.rota ? {ikon: 'rota', baslik: 'Dada Route durağı', metin: `${v.rota.R.ad} rotasında · ${v.rota.d.uzak <= 1 ? 'yol üstü' : `+${v.rota.d.sapma} dk sapma`}`} : null,
        ...(d.deneyim || []).map(x => ({ikon: x.ikon, baslik: x.ad, metin: x.deger})),
        v.acik.metin?.includes(' · ') ? {ikon: 'saat', baslik: v.acik.acik ? 'Şu an açık' : 'Şu an kapalı', metin: v.acik.metin.replace(/^(Açık|Kapalı) · /, '')} : null
      ].filter(Boolean);
      return GM.galeriHero({gorseller: v.galeri, sinif: 'is-bindir', etiket: `${m.ad} fotoğrafları`}) + GM.refAkis([
        `${GM.ortaBaslik({baslik: m.ad, metaHtml: GM.mekanMeta(m, d, {puan: false, fiyat: false, durum: false, goz: false})})}${GM.ozetSerit([
          {ikon: 'yildiz', etiket: 'Puan', deger: m.puan == null ? '–' : String(m.puan).replace('.', ','), alt: m.puan == null ? 'Henüz yok' : null},
          {ikon: 'fiyat', etiket: 'Fiyat', deger: FIYAT[m.fiyat] || '–'},
          s ? {ikon: 'saat', etiket: 'Bugün', deger: v.acik.acik ? 'Açık' : nokta(v.acik.acilis || s[0]), alt: v.acik.acik ? 'şu an' : 'açılış'} : {ikon: 'saat', etiket: 'Şu an', deger: v.acik.acik == null ? '–' : v.acik.acik ? 'Açık' : 'Kapalı'}])}`,
        d.editorNotu ? `${GM.kisiSatir({ad: 'Dada Gourmet', baslik: 'Dada Gourmet editörü', alt: `${d.editorNotu.etiket}${d.dogrulama ? ` · ${d.dogrulama.tarih}` : ''}`, rozet: 'Editör'})}${GM.p(d.editorNotu.metin, {ton: 'ikincil'})}` : null,
        one.length ? GM.oneCikanlar(one) : null,
        {baslik: 'Hakkında', html: GM.aciklama({metin: (d.aciklama || [m.tanitim]).filter(Boolean).join(' '), satir: 4})},
        ol.length ? {baslik: 'Bu mekânda neler var', html: GM.olanakListe(ol, {en: 5, tumu: ol.length > 5, tumuMetin: `${ol.length} özelliğin tümünü göster`})} : null,
        v.galeri.length > 1 ? {baslik: 'Fotoğraf turu', html: `${GM.fotoSerit(v.galeri)}${GM.btn({metin: 'Tüm fotoğrafları göster', ikon: 'galeri', tur: 'secondary', tam: true, veri: {eylem: 'mk-tumfoto'}})}`} : null,
        {baslik: 'Konum', html: `${GM.harita({ad: `r4-${m.slug}`, yukseklik: 'var(--gm-size-map-h)', merkez: [m.lng, m.lat], zoom: 13.6, etkilesim: false, kontroller: false, pinler: [{id: m.slug, lng: m.lng, lat: m.lat, secili: true, ad: m.ad}], etiket: `${m.ad} haritada`})}${GM.p(`**${GM.konumMetin(m, 'uzun')}**${d.adres ? ` · ${d.adres}` : ''}`)}${GM.btn({metin: 'Haritada aç', ikon: 'harita', tur: 'secondary', veri: {eylem: 'mk-harita'}})}`},
        {baslik: 'Bilinmesi gerekenler', html: bilinmesi(v)},
        v.il?.tescilli?.length ? {baslik: `${m.il} lezzetleri`, html: ilKart(v)} : null,
        v.benzer.length ? {baslik: 'Benzer mekânlar', html: benzer(v)} : null,
        kuyrukSatir(v)
      ], {bindir: true});
    },
    altBar: ctx => { const v = GM.mekanPaket(ctx.param.slug); if (!v) return ''; return GM.rezBar({baslikHtml: `${GM.fiyat(v.m.fiyat)} <span>${GM.esc(FIYAT[v.m.fiyat] || '')}</span>`, alt: v.m.rezervasyon ? `${bugunMetin(v)} · 2 kişi` : 'Rezervasyon almıyor', altIkon: v.m.rezervasyon ? 'saat' : 'pin', eylem: v.m.rezervasyon ? {metin: 'Rezerve et', veri: {eylem: 'mk-rez'}} : {metin: 'Yol tarifi', ikon: 'yon', veri: {eylem: 'mk-yol'}}}); }
  });

  // ---------- Alternatif kaydı (#/ekranlar, #/alternatifler) ----------
  GM.alternatifKaydet({ekran: 'detay', kod: 'ref-detay-1', sira: 4, ad: 'Detay · Michelin Guide kalıbı', referans: 'The MICHELIN Guide (restoran rehberinde global otorite; uygulama ödülü doğrulanamadı)', alinan: 'Metin binmeyen kare fotoğraf, ad üstünde ayırt ediciler satırı, Favori / Kaydet / Gittim / Not dörtlüsü, editoryal görüş ve ince ayraçlı bilgi listesi.', gerekce: 'Gurme rehber kimliğini en sade ve güvenilir dille kurar; yıldız yerine Gourmet’in gerçek seçkilerini gösterir, ödül uydurmaz.', git: '#/ref/detay-1/mikla', iyilesti: 'Editör notu Michelin tipografisinde alıntı bloğu, kimlikte rota bağlamı kartı, fotoğrafa marka ışığı, doğru Dada Puan dili.'});
  GM.alternatifKaydet({ekran: 'detay', kod: 'ref-detay-2', sira: 5, ad: 'Detay · OpenTable kalıbı', referans: 'OpenTable (rezervasyonda global kategori lideri)', alinan: 'Kısa fotoğrafın hemen altında kişi · gün kapsülü ve bugün / yarın slot bandı, "Şunun için ideal" etiketleri, menü özeti.', gerekce: 'Rezervasyon alan mekânda karar anını ilk ekrana taşır; saate tek dokunuşla akışın ikinci adımı açılır.', git: '#/ref/detay-2/mikla', iyilesti: 'Slot bandının altında OpenTable puan satırı karşılığı "+25 Dada Puan" (web kuralı), kimlikte rota bağlamı, slot rayı kartın içinde kırpılıyor.'});
  GM.alternatifKaydet({ekran: 'detay', kod: 'ref-detay-3', sira: 6, ad: 'Detay · Tock kalıbı', referans: 'Tock (tadım menüsü ve biletli deneyim rezervasyonunda global; ödül doğrulanamadı)', alinan: 'Logo karolu vitrin başlığı ve masa yerine deneyim satan bilet kartları (tadım menüsü, à la carte, teras), etkinlik biletleri.', gerekce: 'Şef restoranlarında kullanıcı masa değil deneyim seçer; Gourmet’in fine dining ağırlıklı kataloğuna uyar.', git: '#/ref/detay-3/mikla', iyilesti: 'Deneyim biletleri gerçek mekân fotoğraflarıyla (tadım tabağı, manzara), Tock "Pickup" karşılığı Ne Alınır? paket bileti, vitrin fotoğrafına marka ışığı.'});
  GM.alternatifKaydet({ekran: 'detay', kod: 'ref-detay-4', sira: 7, ad: 'Detay · Airbnb kalıbı', referans: 'Airbnb (konaklama/deneyim ilanında global kategori lideri; ödül doğrulanamadı)', alinan: 'Bindiren panelde ortalı başlık ve üçlü özet, editör satırı, ikonlu öne çıkanlar, olanak listesi + tümünü göster, konum haritası, yapışkan fiyat çubuğu.', gerekce: 'Tanıdık ilan okuma ritmi uzun içeriği taranabilir kılar; fiyat seviyesi ve rezervasyon her an altta durur.', git: '#/ref/detay-4/mikla', iyilesti: 'Üçlü özet Airbnb yumuşak kartına döndü, il coğrafi işaret kartı (ne yenir, ne alınır), fotoğrafa marka ışığı.'});
})();
