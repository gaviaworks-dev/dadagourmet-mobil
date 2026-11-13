/* #/katalog — canlı bileşen kataloğu: her ortak bileşen tüm hâlleriyle, telefonda (390). Yalnız sergiler; tanımlar kanon/gm-*.
   Bölümler: Token · Butonlar · Hâller · Kartlar · Seçim ve rozet · Kabuk · Harita ve rota · İkonlar. ?b=<bölüm> ile doğrudan açılır. */
(() => {
  const TK = GM.TK, esc = GM.esc;
  const oge = (kod, not, html, o = {}) => `<article class="gm-kt-oge" id="kt-${esc(o.id || kod.replace(/[^a-z0-9]+/gi, '-'))}"><header><code>${esc(kod)}</code>${not ? `<span>${esc(not)}</span>` : ''}</header><div class="gm-kt-cerceve${o.gri ? ' is-gri' : ''}${o.koyu ? ' is-koyu' : ''}${o.sifir ? ' is-sifir' : ''}">${html}</div></article>`;
  const d = (ad, html) => `<div class="gm-kt-durum"><small>${esc(ad)}</small>${html}</div>`;
  const s = (...x) => `<div class="gm-kt-sira">${x.join('')}</div>`;
  const BOLUM = [['token', 'Token'], ['buton', 'Butonlar'], ['hal', 'Hâller'], ['kart', 'Kartlar'], ['secim', 'Seçim ve rozet'], ['kabuk', 'Kabuk'], ['harita', 'Harita ve rota'], ['ikon', 'İkonlar']];

  const ornek = () => {
    const M = GMV.mekanlar, m = slug => GM.mekan(slug) || M[0];
    const R = GM.rotaBul('istanbul-izmir'), rk = GM.rotaKartVeri(R, {etiket: 'Ege’ye uzun yol'}), rk2 = GM.rotaKartVeri(GM.rotaBul('izmir-cesme'), {etiket: 'Sahil yolu'}), rk3 = GM.rotaKartVeri(GM.rotaBul('istanbul-bursa'), {etiket: 'Kısa kaçamak'});
    const dk = GM.rotaDuraklari(R, {kapakli: true}), kat = GMV.rotalar.flatMap(x => GM.rotaKatmani(x));
    return {M, m, R, rk, rk2, rk3, dk, kat, e: GMV.etkinlikler.filter(x => x.gorsel), il: GMV.ilKimlik.find(x => x.ad === 'Bursa') || GMV.ilKimlik[0]};
  };

  const token = () => {
    const renk = (grup, ad) => d(ad, `<div class="gm-kt-renkler">${Object.entries(TK.color[grup]).filter(([k]) => !k.startsWith('_')).map(([k, v]) => `<div class="gm-kt-renk"><i style="background:var(--gm-${k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()})"></i><b>${esc(k)}</b><small>${esc(v.value || `→ ${v.ref}`)}</small></div>`).join('')}</div>`);
    const roller = Object.entries(TK.typography).map(([k, r]) => { const a = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(), cls = a === 'subheading' ? 'sub' : a; return `<div class="gm-kt-tip"><span class="gm-t-${cls}">${k === 'label' ? 'ÜST ETİKET' : k.startsWith('numeral') ? '480 km' : 'Bursa’da İskender durağı'}</span><small>${esc(k)} · ${r.size}/${r.weight}/${r.line}</small></div>`; }).join('');
    return [
      oge('color.primary · neutral', 'PANTONE 259 C, krem yok', renk('primary', 'Primary') + renk('neutral', 'Nötr')),
      oge('color.durum · accent', 'başarı, uyarı, tehlike, bilgi, puan', renk('durum', 'Durum') + renk('accent', 'Vurgu')),
      oge('color.katman', 'Dada Route harita katmanları', renk('katman', 'Katman')),
      oge('font · typography', 'Gilroy Medium + ExtraBold; aynı rol her yerde aynı boy', roller),
      oge('space · radius · shadow', 'ara değer yok', d('Boşluk', `<div class="gm-kt-olcu">${Object.entries(TK.space).filter(([k]) => +k).map(([k]) => `<div><i class="gm-kt-kutu" style="width:var(--gm-s-${k});height:var(--gm-s-${k})"></i>${k}</div>`).join('')}</div>`) + d('Radius', `<div class="gm-kt-olcu">${['choice', 'control', 'segment', 'media', 'surface', 'sheet'].map(k => `<div><i class="gm-kt-kutu is-48" style="border-radius:var(--gm-r-${k})"></i>${k}</div>`).join('')}</div>`) + d('Gölge', `<div class="gm-kt-olcu">${['sm', 'md', 'lg'].map(k => `<div><i class="gm-kt-golge" style="box-shadow:var(--gm-sh-${k})"></i>${k}</div>`).join('')}</div>`)),
      oge('overlay · perde', 'fotoğraf üstü metin; smootherstep', s(GM.mekanKart(ornek().m('narimor-urla'), {tur: 'buyuk'}))),
      oge('motion', 'süre ve eğri; azaltılmış harekette anlık', `<div class="gm-kt-hareket">${[['quick', 'standard'], ['base', 'standard'], ['page', 'emphasized-decel'], ['sheet', 'emphasized-decel']].map(([m, e]) => `<button type="button" class="gm-kt-hareket-oge" style="--sure:var(--gm-m-${m});--egri:var(--gm-e-${e})" data-eylem="kt-oynat"><i></i><span>${m} · ${TK.motion[m]} ms</span></button>`).join('')}</div>`)
    ];
  };

  const buton = () => [
    oge('GM.btn · primary', 'görünümde tek ana eylem', s(GM.btn({metin: 'Rotayı başlat', ikon: 'navigasyon'})) + d('Basılı · pasif · yükleniyor', s(GM.btn({metin: 'Basılı', basili: true}), GM.btn({metin: 'Pasif', pasif: true}), GM.btn({metin: 'Kaydediliyor', yukleniyor: true})))),
    oge('GM.btn · secondary', 'alternatif yol', s(GM.btn({metin: 'Durak ekle', ikon: 'ekle', tur: 'secondary'}), GM.btn({metin: 'Pasif', tur: 'secondary', pasif: true}))),
    oge('GM.btn · tertiary (tonal)', 'kart içi hafif eylem', s(GM.btn({metin: 'Rotada', ikon: 'onay', tur: 'tonal'}), GM.btn({metin: 'Yol tarifi', ikon: 'yon', tur: 'tonal', boyut: 'sm'}))),
    oge('GM.btn · ghost (text)', 'satır içi düşük öncelik', s(GM.btn({metin: 'Tümünü gör', tur: 'text'}), GM.btn({metin: 'Şimdi değil', tur: 'text'}))),
    oge('GM.btn · yıkıcı', 'yalnız onay diyaloğunda dolu', s(GM.btn({metin: 'Rotayı sil', tur: 'yikici'}), GM.btn({metin: 'Duraktan çıkar', tur: 'yikici-ikincil'}), GM.btn({metin: 'İptal et', tur: 'yikici-metin'}))),
    oge('GM.btn · küçük · tam · ikili', '44 / 52; ikincil solda', s(GM.btn({metin: 'Küçük', boyut: 'sm'}), GM.btn({metin: 'Küçük', boyut: 'sm', tur: 'secondary'})) + GM.btn({metin: 'Rezervasyon yap', tam: true}) + GM.btnIkili({metin: 'Vazgeç'}, {metin: 'Onayla'})),
    oge('GM.btn · marka', 'sosyal giriş (Gastro/Diet kanonuyla birebir)', `<div class="gm-yigin-8">${GM.btn({metin: 'Apple ile devam et', marka: 'apple', tur: 'secondary', tam: true})}${GM.btn({metin: 'Google ile devam et', gorsel: 'assets/marka/sosyal/google.svg', tur: 'secondary', tam: true})}</div>`),
    oge('GM.ikonBtn', 'duz, kutu, tint, dolu, cam', s(...['duz', 'kutu', 'tint', 'dolu'].map(t => GM.ikonBtn({ikon: 'favori', etiket: t, tur: t})), GM.ikonBtn({ikon: 'paylas', etiket: 'seçili', tur: 'tint', secili: true}), GM.ikonBtn({ikon: 'paylas', etiket: 'pasif', tur: 'kutu', pasif: true})) + d('Cam (fotoğraf üstü)', `<div class="gm-kt-foto">${s(GM.ikonBtn({ikon: 'geri', etiket: 'Geri', tur: 'cam'}), GM.ikonBtn({ikon: 'paylas', etiket: 'Paylaş', tur: 'cam'}), GM.ikonBtn({ikon: 'favori', etiket: 'Favori', tur: 'cam'}))}</div>`)),
    oge('GM.fab · alt menü orta düğmesi', 'yüzen eylem; uzun bas: Dada Route hızlı işlemleri', s(GM.fab({ikon: 'harita', etiket: 'Haritada gör'}), `<span class="gm-kt-fab-merkez">${GM.ik('rota')}</span>`)),
    oge('GM.uzunBas', 'geri alınamaz işlem için basılı tut', GM.uzunBas({ad: 'kt-uzun', metin: 'Basılı tut: rotayı sil', ikon: 'sil', tur: 'yikici'}))
  ];

  const hal = () => [
    oge('GM.iskelet', 'shimmer: kart, satır, liste, ızgara', d('kart', GM.iskelet(1, 'kart')) + d('satir', GM.iskelet(3, 'satir')) + d('izgara', GM.iskelet(4, 'izgara'))),
    oge('GM.ilerleme · GM.adimGosterge', 'dolum ve sayaç', GM.adimGosterge({adim: 2, toplam: 3}) + GM.ilerleme({oran: .42}) + GM.ilerleme({n: 3, hedef: 7, etiket: 'Rota', deger: '7 duraktan 3’ü'}) + d('Sayaç rozeti', s(GM.sayacRozet(3), GM.sayacRozet(12)))),
    oge('GM.geriSayim', 'rezervasyona kalan', GM.geriSayim({saniye: 3 * 3600 + 25 * 60})),
    oge('GM.bos', 'boş sonuç', GM.bos({ikon: 'mekan', baslik: 'Bu filtrelerle mekân yok', metin: 'Bütçeyi **bir kademe** genişletmeyi dene.', eylem: {metin: 'Filtreleri temizle', tur: 'secondary'}})),
    oge('GM.hataEkran', 'bağlantı, sunucu, bulunamadı', GM.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile'}}), {sifir: true}),
    oge('GM.cevrimdisi', 'çevrimdışı şeridi + indirilmiş rota', GM.cevrimdisi('Çevrimdışısın · indirilen rota gösteriliyor', {saat: '12.10'}) + GM.harita({cevrimdisi: true, yukseklik: '160px', rota: {cizgi: ornek().R.cizgi}, pinler: ornek().dk.slice(0, 3).map((x, i) => ({lng: x.lng, lat: x.lat, sira: i + 1}))})),
    oge('GM.girisGerekli · GM.uyeDuvar', 'misafir', GM.girisGerekli(GM.UYE_KILIT.favoriler) + GM.btn({metin: 'Üye duvarını aç', tur: 'secondary', veri: {eylem: 'kt-uye'}}), {sifir: true}),
    oge('GM.toast', 'snackbar: bilgi, başarı, hata, eylemli', s(GM.btn({metin: 'Bilgi', tur: 'secondary', boyut: 'sm', veri: {eylem: 'kt-toast', id: 'bilgi'}}), GM.btn({metin: 'Başarı', tur: 'secondary', boyut: 'sm', veri: {eylem: 'kt-toast', id: 'basari'}}), GM.btn({metin: 'Eylemli', tur: 'secondary', boyut: 'sm', veri: {eylem: 'kt-toast', id: 'eylem'}})))
  ];

  const kart = () => {
    const o = ornek(), m = o.m;
    return [
      oge('GM.mekanKart · buyuk', 'editoryal kapak; metin fotoğraf üstünde', GM.mekanKart(m('narimor-urla'), {tur: 'buyuk', etiket: 'Dada Seçkisi'})),
      oge('GM.mekanKart · kompakt', 'yatay şerit kartı (230)', GM.yatay(o.M.filter(x => x.kapakB).slice(1, 5).map(x => GM.mekanKart(x, {kayitli: x.slug === 'mikla'})))),
      oge('GM.mekanKart · yatay', 'liste içi kart', `<div class="gm-yigin">${o.M.filter(x => x.kapakB).slice(5, 7).map(x => GM.mekanKart(x, {tur: 'yatay'})).join('')}</div>`),
      oge('GM.mekanKart · satir', 'liste satırı; rota bağlamında sapma', o.dk.slice(0, 3).map((x, i) => GM.mekanKart(x.mekan, {tur: 'satir', sapma: {dk: x.sapma, km: x.km}, sira: i === 0 ? 1 : null, aciklama: i === 1, secili: i === 2})).join('')),
      oge('GM.mekanKart · harita', 'harita üstü kayan kart', GM.mekanKart(o.dk[0].mekan, {tur: 'harita', sapma: {dk: o.dk[0].sapma, km: o.dk[0].km}, eylem: GM.btn({metin: 'Durağa ekle', ikon: 'ekle', boyut: 'sm'}) + GM.btn({metin: 'Yol tarifi', ikon: 'yon', tur: 'secondary', boyut: 'sm'})}), {gri: true}),
      oge('GM.rotaKart · kapak', 'dergi kapağı + rota silueti + ilerleme', GM.yatay([GM.rotaKart(o.rk, {ilerleme: {n: 3, toplam: 7}}), GM.rotaKart(o.rk2), GM.rotaKart(o.rk3)])),
      oge('GM.rotaKart · genis · satir', 'yatay kapak, liste satırı', GM.rotaKart(o.rk2, {tur: 'genis'}) + `<div class="gm-satirlar">${GM.rotaKart(o.rk, {tur: 'satir', ilerleme: {n: 3, toplam: 7}})}${GM.rotaKart(o.rk3, {tur: 'satir'})}</div>`),
      oge('GM.durakKart', 'mekân ve katman durakları; ekle / rotada', `<div class="gm-yigin-8">${GM.durakKart({...o.dk[1], mekan: o.dk[1].mekan}, {sira: 2, sapma: {dk: o.dk[1].sapma, km: o.dk[1].km}})}${GM.durakKart({...o.dk[2], mekan: o.dk[2].mekan}, {eklendi: true, sapma: {dk: 1, km: o.dk[2].km}})}${['sarj', 'ibadet', 'dinlenme', 'yakit'].map(t => { const k = o.kat.find(x => x.tur === t); return k ? GM.durakKart(k, {sapma: {dk: Math.max(1, Math.round(k.uzak * 3)), km: k.km}}) : ''; }).join('')}</div>`),
      oge('GM.rotaSerit', 'itinerary: duraklar arası sürüş', GM.rotaSerit([{uc: true, ad: 'İstanbul', alt: 'Kadıköy çıkışı', saat: '08.00', sonra: '1 sa 35 dk sürüş · 152 km'}, {durak: {...o.dk[3], mekan: o.dk[3].mekan}, sira: 1, saat: '09.40', sapma: {dk: o.dk[3].sapma}, sonra: '2 sa 10 dk sürüş', gecildi: true}, {durak: o.kat.find(x => x.tur === 'sarj'), sira: 2, saat: '12.00', simdi: true, sonra: '45 dk şarj · yürüme mesafesinde esnaf lokantası'}, {uc: true, ad: 'İzmir', alt: 'Varış', saat: '14.10'}])),
      oge('GM.ilKart', 'il/bölge kimlik kartı (coğrafi işaret)', GM.ilKart({...o.il, bolge: 'Marmara · coğrafi işaretli', tescilli: o.il.tescilli.slice(0, 5)}, {km: 152})),
      oge('GM.etkinlikKart', 'kart · satır', GM.yatay(o.e.slice(0, 3).map(x => GM.etkinlikKart(x))) + `<div class="gm-satirlar">${o.e.slice(3, 5).map(x => GM.etkinlikKart(x, {tur: 'satir'})).join('')}</div>`),
      oge('GM.lezzetKart', 'Ne Yenir? · Ne Alınır?', GM.yatay([GM.lezzetKart({ad: 'Bursa İskender', alt: 'Bursa', tur: 'yenir'}), GM.lezzetKart({ad: 'Gemlik Zeytini', alt: 'Bursa · coğrafi işaret', tur: 'alinir'}), GM.lezzetKart({ad: 'Kestane Şekeri', alt: 'Bursa', tur: 'alinir'})])),
      oge('GM.satir · GM.satirlar', 'liste satırı (Gastro)', GM.satirlar([{ikon: 'rezervasyon', baslik: 'Rezervasyonlarım', alt: '1 yaklaşan', ok: true}, {ikon: 'favori', baslik: 'Gurme Favorilerim', alt: '12 mekân · 4 lezzet', ok: true}, {ikon: 'puanDada', baslik: 'Dada Puan', deger: '340', ok: true}]))
    ];
  };

  const secim = () => [
    oge('GM.cipler', 'filtre (çoklu) · seçim (tek) · sayılı', d('Çoklu', GM.cipler({ad: 'kt-c1', ogeler: [{metin: 'Esnaf lokantası', deger: 'e'}, {metin: 'Şef masası', deger: 's', sayi: 51}, {metin: 'Yol üstü mola', deger: 'm'}, {metin: 'Pazar kahvaltısı', deger: 'k'}], secili: ['s'], serit: true})) + d('Tek', GM.cipler({ad: 'kt-c2', tur: 'tek', ogeler: ['₺', '₺₺', '₺₺₺', '₺₺₺₺'].map((x, i) => ({metin: x, deger: String(i + 1)})), secili: '3'}))),
    oge('GM.katmanCipler', 'Dada Route katmanları', GM.katmanCipler({ad: 'kt-k', ogeler: [{tur: 'neYenir', metin: 'Ne Yenir?', secili: true, sayi: 12}, {tur: 'neAlinir', metin: 'Ne Alınır?', sayi: 8}, {tur: 'yakit', metin: 'Yakıt', sayi: 14}, {tur: 'sarj', metin: 'Şarj', secili: true, sayi: 6}, {tur: 'ibadet', metin: 'İbadethane', sayi: 12}, {tur: 'dinlenme', metin: 'Dinlenme', sayi: 8}, {tur: 'karavan', metin: 'Karavan', sayi: 6}]})),
    oge('GM.segment', 'sekme ailesi; kayan gösterge', GM.segment({ad: 'kt-s', secili: 'y', ogeler: [{ad: 'Yerel', deger: 'y'}, {ad: 'Uluslararası', deger: 'u'}]}) + GM.segment({ad: 'kt-s2', secili: 'g', kaydir: true, ogeler: ['Genel', 'Menü', 'Lezzetler', 'Etkinlikler', 'Yorumlar'].map(x => ({ad: x, deger: x[0].toLowerCase()}))})),
    oge('GM.puan · GM.fiyat · GM.acikDurum · GM.sapma', 'puan uydurulmaz: değerlendirme yoksa ★ –', s(GM.puan({deger: 4.7, sayi: 128}), GM.puan({}), GM.puan({deger: 4.7, buyuk: true})) + s(...[1, 2, 3, 4].map(n => GM.fiyat(n))) + s(GM.acikDurum(true, {metin: 'Açık · 23.00’e kadar'}), GM.acikDurum(false, {metin: 'Kapalı · 12.00’de açılır'})) + s(GM.sapma({dk: 1, km: 112}), GM.sapma({dk: 6, km: 240}))),
    oge('GM.nitelikler', 'doğrulanmış mikro ikonlar (web kart-nitelik)', GM.nitelikler([{ad: 'Vale', ikon: 'square-parking'}, {ad: 'Glütensiz seçenek', ikon: 'wheat-awn-circle-exclamation'}, {ad: 'Evcil hayvan kabul edilir', ikon: 'paw'}, {ad: 'Çocuk alanı', ikon: 'children'}, {ad: 'Teras', ikon: 'umbrella-beach'}]) + GM.nitelikler([{ad: 'Vale', ikon: 'square-parking'}, {ad: 'Glütensiz seçenek', ikon: 'wheat-awn-circle-exclamation'}, {ad: 'Evcil hayvan kabul edilir', ikon: 'paw'}, {ad: 'Çocuk alanı', ikon: 'children'}], {etiketli: true})),
    oge('GM.rozet · GM.durumRozet', 'rozet ve rezervasyon durumu', s(GM.rozet({metin: 'Dada Seçkisi', ikon: 'yildiz'}), GM.rozet({metin: 'Yeni açıldı', ton: 'notr'})) + s(GM.durumRozet({metin: 'Onaylandı', ton: 'basari', ikon: 'onay'}), GM.durumRozet({metin: 'Bekliyor', ton: 'uyari', ikon: 'saat'}), GM.durumRozet({metin: 'İptal', ton: 'hata', ikon: 'kapat'}), GM.durumRozet({metin: 'İnceleniyor', ton: 'notr'}))),
    oge('GM.toggle · GM.checkbox · GM.stepper', 'form', GM.toggle({ad: 'kt-t', etiket: 'Yaklaşma uyarısı', alt: 'Durağa 3 km kala sesli uyarı', ikon: 'sesli', secili: true}) + GM.checkbox({ad: 'kt-cb', etiket: 'Glütensiz seçenek', secili: true}) + GM.alan({etiket: 'Kişi sayısı', html: GM.stepper({ad: 'kt-st', deger: 2, min: 1, max: 12})})),
    oge('GM.input · GM.arama', 'arama ve form alanı', GM.arama({ad: 'kt-a', yer: 'Mekân, lezzet ya da şehir ara'}) + GM.input({ad: 'kt-i', etiket: 'Alerjen notu', yer: 'Ör. fıstık alerjim var', yardim: 'İşletmeye rezervasyonla iletilir.'}) + GM.input({ad: 'kt-i2', etiket: 'E-posta', deger: 'ornek@', hata: 'Geçerli bir e-posta yaz.'}))
  ];

  const kabuk = () => [
    oge('GM.ustBar · sekme', 'solid; logo · ara · zil · menü', `<div class="gm-kt-kabuk">${GM.ustBar({tur: 'sekme'})}</div>`, {sifir: true}),
    oge('GM.ustBar · alt / şeffaf', 'hero üstünde şeffaf → kayınca solid', `<div class="gm-kt-kabuk">${GM.ustBar({tur: 'alt', baslik: 'Mekânlar'})}</div><div class="gm-kt-kabuk is-foto" style="background-image:url('${ornek().m('narimor-urla').kapakB}')">${GM.ustBar({tur: 'banner', saydam: true, sag: [{ikon: 'paylas', etiket: 'Paylaş'}, {ikon: 'favori', etiket: 'Favori'}]})}</div>`, {sifir: true}),
    oge('GM.altMenu', '5’li; ortada Dada Route', `<div class="gm-kt-kabuk is-alt">${GM.altMenu()}</div>`, {sifir: true}),
    oge('GM.menu · GM.sheet · GM.dialog · filtre · sırala · takvim', 'katmanlar (dokun)', `<div class="gm-yigin-8">${[['menu', 'Yan menüyü aç'], ['sheet', 'Bottom sheet (rezervasyon)'], ['dialog', 'Onay penceresi (popup)'], ['filtre', 'Filtre sheet’i'], ['sirala', 'Sıralama sheet’i'], ['takvim', 'Takvim sheet’i']].map(([k, t]) => GM.btn({metin: t, tur: 'secondary', tam: true, veri: {eylem: 'kt-katman', id: k}})).join('')}</div>`),
    oge('GM.takvim', 'rezervasyon tarihi; dolu günler noktalı', GM.takvim({ad: 'kt-tk', noktalar: {'2026-11-14': ['uyari'], '2026-11-15': ['uyari']}})),
    oge('GM.slotlar', 'saat slotu (rezervasyon)', GM.slotlar({ad: 'kt-sl', gruplar: [{ad: 'Öğle', slotlar: [{saat: '12:30'}, {saat: '13:00', pasif: true}, {saat: '13:30'}]}, {ad: 'Akşam', slotlar: [{saat: '19:00'}, {saat: '19:30'}, {saat: '20:00'}, {saat: '21:00', pasif: true}]}], secili: '19:30'}))
  ];

  const harita = () => {
    const o = ornek(), r = o.R, d0 = o.dk;
    return [
      oge('GM.pin', 'kanon işaret dili (docs/HARITA-ISARET.md): hepsi yuvarlak; ad yalnız seçiliyken', d('Mekân', s(GM.pin({}), GM.pin({gorsel: o.m('mikla').kapak, ad: 'Mikla'}), GM.pin({sira: 3}), GM.pin({soluk: true}), GM.pin({secili: true, ad: 'Mikla'}))) + d('Katmanlar (küçük, katman rengi)', s(...['neYenir', 'neAlinir', 'yakit', 'sarj', 'ibadet', 'dinlenme', 'karavan', 'cografi'].map(t => GM.pin({tur: t})))) + d('Uçlar · küme · konum · rota süresi', s(GM.pin({tur: 'baslangic', ikon: 'baslangic'}), GM.pin({tur: 'varis', ikon: 'varis'}), GM.kume({n: 4}), GM.kume({n: 18}), GM.kume({n: 64}), GM.konumNokta({yon: 30}), GM.rotaSure({metin: GM.sure(o.R.dk), secili: true}), GM.rotaSure({metin: GM.sure(o.R.dk + 29), alt: true}))), {gri: true}),
      oge('GM.harita · rota', 'rota çizgisi, yol üstü koridoru, duraklar', GM.harita({ad: 'kt-h1', yukseklik: '300px', koridor: true, rota: {cizgi: r.cizgi}, pinler: [{lng: r.cizgi[0][0], lat: r.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic'}, {lng: r.cizgi.at(-1)[0], lat: r.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis'}, ...o.kat.filter(k => ['sarj', 'ibadet', 'yakit'].includes(k.tur)).slice(0, 6).map(k => ({lng: k.lng, lat: k.lat, tur: k.tur, kucuk: true, id: k.id}))]})),
      oge('GM.harita · mekânlar', 'küme, seçili pin, konum', GM.harita({ad: 'kt-h2', yukseklik: '260px', kume: true, merkez: [29.0, 41.045], zoom: 11.6, konum: [29.01, 41.04], yon: 20, pinler: o.M.filter(x => x.il === 'İstanbul').slice(0, 40).map((x, i) => ({id: x.slug, lng: x.lng, lat: x.lat, secili: x.slug === 'mikla', ad: x.slug === 'mikla' ? x.ad : null}))})),
      oge('GM.harita · koyu (sürüş)', 'Co-Pilot / gece', GM.harita({ad: 'kt-h3', yukseklik: '220px', stil: 'koyu', rota: {cizgi: GM.rotaBul('istanbul-bursa').cizgi, gecilen: GM.rotaBul('istanbul-bursa').cizgi.slice(0, 50)}, konum: GM.rotaBul('istanbul-bursa').cizgi[50], yon: 160, merkez: GM.rotaBul('istanbul-bursa').cizgi[50], zoom: 9.5})),
      oge('GM.rotaCizgi', 'statik rota şeması (kart, çevrimdışı)', GM.rotaCizgi({rota: {cizgi: r.cizgi}, pinler: d0.slice(0, 4).map(x => ({lng: x.lng, lat: x.lat}))}))
    ];
  };

  const ikon = () => [oge('GM.ik', 'Font Awesome Free Solid (dolu); anlam sözlüğü', `<div class="gm-kt-ikonlar">${Object.entries(TK.icons).filter(([k]) => !k.startsWith('_')).map(([k, v]) => `<div>${GM.ik(v)}<small>${esc(k)}</small></div>`).join('')}</div>`)];

  const ICERIK = {token, buton, hal, kart, secim, kabuk, harita, ikon};
  GM.ekran('katalog', {
    tur: 'alt', baslik: 'Bileşen kataloğu', ust: '#/kesfet', haller: false,
    ciz: ctx => { const b = ICERIK[ctx.sorgu.b] ? ctx.sorgu.b : 'token'; return `<div class="gm-kt"><div class="gm-kt-nav">${GM.segment({ad: 'kt-bolum', secili: b, kaydir: true, ogeler: BOLUM.map(([k, a]) => ({ad: a, deger: k}))})}</div><div class="gm-kt-bolum gm-yigin-24">${ICERIK[b]().join('')}</div></div>`; },
    sonra: (kok, ctx) => {
      const c = [];
      c.push(GM.on(kok, 'kt-bolum', v => GM.yerine(`#/katalog?b=${v}`)));
      c.push(GM.eylem(kok, 'kt-toast', el => GM.toast({bilgi: 'Rota **çevrimdışı** için indirildi', basari: 'Durak **rotana eklendi**', eylem: 'Mikla **favorilere** eklendi'}[el.dataset.id], {tur: el.dataset.id === 'eylem' ? undefined : el.dataset.id, eylem: el.dataset.id === 'eylem' ? 'Geri al' : undefined})));
      c.push(GM.eylem(kok, 'kt-uye', () => GM.uyeDuvar()));
      c.push(GM.eylem(kok, 'kt-oynat', el => { el.classList.remove('is-oyna'); void el.offsetWidth; el.classList.add('is-oyna'); }));
      c.push(GM.eylem(kok, 'kt-katman', el => {
        const k = el.dataset.id;
        if (k === 'menu') GM.menu.ac();
        else if (k === 'sheet') GM.sheet({baslik: 'Masa ayırt', html: `<div class="gm-yigin">${GM.alan({etiket: 'Kişi', html: GM.stepper({ad: 'kt-k', deger: 2, min: 1, max: 12})})}${GM.slotlar({ad: 'kt-s', gruplar: [{ad: 'Bu akşam', slotlar: [{saat: '19:00'}, {saat: '19:30'}, {saat: '20:30'}]}], secili: '19:30'})}${GM.input({ad: 'kt-n', etiket: 'Alerjen notu', yer: 'İsteğe bağlı'})}</div>`, altBar: GM.btn({metin: 'Rezervasyonu onayla', tam: true, attrs: 'data-sheet-kapat'})});
        else if (k === 'dialog') GM.dialog({baslik: 'Rota silinsin mi?', metin: 'İndirilen harita da **cihazdan silinir**.', eylem: 'Sil', iptal: 'Vazgeç', yikici: true});
        else if (k === 'filtre') GM.filtreSheet({baslik: 'Filtrele', gruplar: [{baslik: 'Amaç', ad: 'amac', ikon: 'bul', ogeler: [{metin: 'Hızlı esnaf', deger: 'esnaf'}, {metin: 'Şef masası', deger: 'sef'}, {metin: 'Pazar kahvaltısı', deger: 'kahvalti'}]}, {baslik: 'Bütçe', ad: 'butce', ikon: 'fiyat', ogeler: ['₺', '₺₺', '₺₺₺', '₺₺₺₺'].map((x, i) => ({metin: x, deger: String(i + 1)}))}, {baslik: 'Nitelik', ad: 'nitelik', ikon: 'onay', ogeler: [{metin: 'Glütensiz', deger: 'g'}, {metin: 'Otopark', deger: 'o'}, {metin: 'Açık teras', deger: 't'}]}]});
        else if (k === 'sirala') GM.siralaSheet({baslik: 'Sırala', secenekler: [['onerilen', 'Önerilen', 'yildiz'], ['yakin', 'En yakın', 'pin'], ['sapma', 'En az sapma', 'yon'], ['fiyat', 'Fiyat (artan)', 'fiyat']], secili: 'onerilen'});
        else if (k === 'takvim') GM.takvimSheet({ad: 'kt-ts', baslik: 'Tarih seç'});
      }));
      return () => c.forEach(f => f());
    }
  });
})();
