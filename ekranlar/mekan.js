/* Mekân detayı · üç alternatif. Rotalar: #/mekan/:slug ve #/alt/detay-a/:slug → mekan-a, #/alt/detay-b/:slug → mekan-b, #/alt/detay-c/:slug → mekan-c.
   Web kaynağı: docs/WEB-ENVANTERI.md §2.3 (bölüm sırası ve alanlar, mikla örneği), §2.5 rezervasyon, §2.6 değerlendirme. Web özelliği eksiltilmez:
   galeri, künye (konsept, mutfak, fiyat, semt, şu an açık/kapalı, özellikler), Genel Bakış (açıklama, editör notu, deneyim, ne için uygun, özellikler),
   Ne Yenir? / Ne Alınır? (örnek), Menü (+ alerjen bilgilendirmesi), Yorumlar, Adres & Saatler, Tarifler, Route bandı, benzer mekânlar, bilgi tazeliği;
   eylemler Ziyaret Ettim, Listeye ekle, Değerlendir, Fotoğraf ekle, Paylaş, Bilgi hatası, Kaydet, Haritada göster, Dada Route'a ekle, Rezervasyon.
   A · Dada ailesi: Gastro detay-v2 kalıbı (banner + özet şeridi + açıklama + yapışkan sekme + alt eylem çubuğu).
   B · Kategori: Michelin/Resy/Google Maps D1 (fotoğraf sahnesi, kimlik, 4'lü eylem, "Neden seviyoruz", 5 sekme, yapışkan rezervasyon).
   C · Son nesil: Google Maps/Watch Duty/Roadtrippers D2 (gerçek harita + üç duraklı detay sheet'i, rota bağlamı).
   Mobil ekstra (webde yok, öneri): B "Etkinlikler" sekmesindeki yakındaki etkinlikler (mekân–etkinlik ilişkisi webde yok), "Lezzetler"de ilin coğrafi
   işaretli ürünleri (web Route il kartı verisi), C'deki rota bağlamı kartı ve yakındaki mekân pinleri. Puan, yorum uydurulmaz. */
(() => {
  const BUGUN = GM.bugunIso();
  const FIYAT = ['', 'Ekonomik', 'Orta', 'Üst Orta', 'Lüks'];
  const nokta = s => String(s || '').replace(':', '.');

  // ---------- Veri ----------
  const veri = slug => {
    const m = GM.mekan(slug); if (!m) return null;
    const d = GM.mekanDetayVeri(slug);
    const galeri = d.galeri?.length ? d.galeri : [m.kapakB || m.kapak].filter(Boolean).map(src => ({src, alt: `${m.ad} kapak fotoğrafı`}));
    const rota = (GMV.rotalar || []).map(R => ({R, d: R.duraklar.find(x => x.slug === slug)})).filter(x => x.d).sort((a, b) => a.d.sapma - b.d.sapma || a.d.km - b.d.km)[0] || null;
    const ozellik = [...new Set([...(m.hizmet || []), ...(d.ozellik || [])])];
    const uzak = x => GM.km([m.lng, m.lat], [x.lng, x.lat]);
    const benzer = (d.benzer || []).map(GM.mekan).filter(Boolean);
    if (benzer.length < 3) GMV.mekanlar.filter(x => x.slug !== slug && x.kapak && !benzer.includes(x) && (x.kategori === m.kategori || x.il === m.il)).sort((a, b) => uzak(a) - uzak(b)).slice(0, 6 - benzer.length).forEach(x => benzer.push(x));
    const yakin = GMV.mekanlar.filter(x => x.slug !== slug && uzak(x) < 4 && uzak(x) > .3).sort((a, b) => uzak(a) - uzak(b)).slice(0, 10);
    const etk = (GMV.etkinlikler || []).filter(e => (e.bit || e.tarih) >= BUGUN && e.lng != null).map(e => ({e, km: uzak(e)})).sort((a, b) => a.km - b.km).slice(0, 3);
    return {m, d, galeri, rota, ozellik, benzer, yakin, etk, il: (GMV.ilKimlik || []).find(k => k.ad === m.il), acik: GM.mekanAcik(m, d), fav: GM.mekanKayit.var('favori', slug), ziyaret: GM.mekanKayit.var('ziyaret', slug)};
  };
  const bulunamadi = () => GM.hataEkran({tur: 'bulunamadi', baslik: 'Mekân bulunamadı', metin: 'Bu mekân yayından kalkmış ya da bağlantı eskimiş olabilir. **Mekânlar** listesinden devam et.', eylem: {metin: 'Mekânlara dön', ikon: 'mekan', yerine: '#/mekanlar'}});

  // ---------- Ortak bölümler (kanon parçalarıyla) ----------
  const bas = (baslik, metin) => GM.metinBlok({baslik, metin, rol: 'section', h: 3});
  const editor = (v, o = {}) => (v.d.editorNotu ? GM.editorNot({ust: o.ust || 'Dada Gourmet', baslik: o.baslik || 'Editör Notu', etiket: v.d.editorNotu.etiket, metin: v.d.editorNotu.metin}) : '');
  const aciklama = v => GM.aciklama({metin: (v.d.aciklama || [v.m.tanitim]).filter(Boolean).join(' '), satir: 4});
  // o.serit (Görev 14/5, Detay-A): satırlar yerine yatay kart şeridi.
  const deneyim = (v, o = {}) => (v.d.deneyim?.length ? `<section class="gm-yigin-12">${bas('Mekân Deneyimi', 'Gitmeden önce bilmekte fayda var')}${o.serit ? GM.bilgiKartSerit(v.d.deneyim.map(x => ({ikon: x.ikon, baslik: x.ad, metin: x.deger})), {etiket: 'Mekân deneyimi'}) : GM.satirlar(v.d.deneyim.map(x => ({ikon: x.ikon, baslik: x.ad, alt: x.deger})))}</section>` : '');
  // o.tekSatir (Detay-A, yığılma kuralı 2): tek vesile çip olarak sağı boş satır bırakmaz; tam genişlik satır olarak durur.
  const uygun = (v, o = {}) => { const l = v.d.vesile || (v.m.vesile || []).map(ad => ({ikon: 'yildiz', ad})); if (!l.length) return ''; if (o.tekSatir && l.length === 1) return `<section class="gm-yigin-12">${bas('Mekân Ne İçin Uygun', 'Bu mekân hangi buluşmaya yakışır')}${GM.satirlar([{ikon: l[0].ikon, baslik: l[0].ad, alt: 'Editörün önerdiği buluşma'}])}</section>`; return `<section>${bas('Mekân Ne İçin Uygun', 'Bu mekân hangi buluşmaya yakışır')}${GM.ozellikSerit({on: l.map(x => ({ikon: x.ikon, metin: x.ad})), etiket: false})}</section>`; };
  const ozellikler = v => (v.ozellik.length || v.m.nitelik?.length ? `<section>${bas('Mekân Özellikleri', 'Bu mekânda neler var')}${GM.ozellikSerit({on: (v.m.nitelik || []).map(x => ({ikon: x.ikon, metin: x.ad})), ogeler: v.ozellik.map(x => ({ikon: 'onay', metin: x})), etiket: v.m.nitelik?.length ? 'Hizmetler' : false})}</section>` : '');
  const rotaKart = v => (v.rota ? `<section class="gm-yigin-12">${bas('Dada Route durağı', 'Bu mekân hazır bir rotanın üstünde')}${GM.rotaKart(GM.rotaKartVeri(v.rota.R, {etiket: v.rota.d.uzak <= 1 ? 'Yol üstü' : `+${v.rota.d.sapma} dk sapma`}), {tur: 'satir'})}</section>` : '');
  const adres = v => `<section class="gm-yigin">${bas('Adres & Saatler', v.acik.metin || '')}${GM.adresKart(v.m, v.d)}${v.d.saatler ? GM.saatTablo(v.d.saatler) : GM.veriYok('Çalışma saatleri **henüz girilmedi**.')}</section>`;
  const menu = v => `${GM.bos({ikon: 'menu', baslik: 'Menü henüz girilmedi', metin: 'İşletme menüsünü eklediğinde **fiyat, rozet ve alerjenleriyle** burada görünür.'})}${GM.bant({ton: 'uyari', ikon: 'gizlilik', baslik: 'Alerjen bilgilendirmesi', metin: 'Bu mekân henüz alerjen bilgisi paylaşmadı; hassasiyetin varsa **siparişten önce** mutlaka sor.'})}${v.d.tarifler ? tarif(v) : ''}`;
  const tarif = v => `<section class="gm-yigin-12">${bas('Bu Mutfaktan Tarifler', 'Evde dene · DadaGastro')}${GM.satirlar([{ikon: 'neYenir', baslik: v.d.tarifler.metin, alt: 'dadagastro.com’da açılır', veri: {eylem: 'mk-tarif'}}])}</section>`;
  const lezzet = (v, tur) => { const l = tur === 'alinir' ? v.d.neAlinir : v.d.neYenir; if (!l?.length) return ''; const yen = tur !== 'alinir'; return `<section class="gm-yigin-12">${bas(yen ? 'Ne Yenir?' : 'Ne Alınır?', yen ? 'Bu mekânda denenmesi önerilen imza tabaklar' : 'Mekândan paketli alınabilecek yerel ürünler; satış yok, bilgi var')}${v.d.ornek ? `<div class="gm-sira">${GM.rozet({metin: 'Örnek içerik', ton: 'notr', ikon: 'bilgi'})}</div>` : ''}${GM.yatay(l.map(x => GM.lezzetKart({ad: x.ad, alt: x.kaynak || x.alt, tur: x.tur})))}</section>`; };
  const ilLezzet = v => (v.il?.tescilli?.length ? `<section class="gm-yigin-12">${bas(`${v.m.il} lezzetleri`, 'Coğrafi işaretli ürünler · Dada Route il kartı')}${GM.ilKart({...v.il, bolge: 'Coğrafi işaret'})}</section>` : '');
  const yorum = v => `${GM.yorumBolumu({yorumlar: [], bos: 'Bu mekân için henüz onaylanmış bir yorum yok. İlk değerlendiren sen ol.'})}<div class="gm-ikili">${GM.btn({metin: 'Değerlendir', ikon: 'yildiz', tur: 'secondary', veri: {eylem: 'mk-degerlendir'}})}${GM.btn({metin: 'Fotoğraf ekle', ikon: 'kamera', tur: 'secondary', veri: {eylem: 'mk-foto'}})}</div>${GM.p('Fotoğraflı değerlendirme **+15 Dada Puan** kazandırır; yorumlar denetim sonrası yayınlanır.', {meta: true, ton: 'ikincil'})}`;
  const etkinlik = v => `${GM.veriYok('Bu mekâna bağlı **etkinlik** henüz yok.')}${v.etk.length ? `<section class="gm-yigin-12">${bas('Yakındaki etkinlikler', 'Mekâna en yakın yaklaşan etkinlikler')}<div class="gm-satirlar">${v.etk.map(x => GM.etkinlikKart(x.e, {tur: 'satir'})).join('')}</div></section>` : ''}`;
  // o.zebra (Görev 14/3, Detay-A): kuyruk GM.bolumler zebrasında; tazelik satırı ve gizli reklam işareti son bölümün içine girer (ayrı boş bölüm olmasın).
  const kuyrukZebra = (v, o = {}) => {
    const son = [o.sahiplen || '', GM.tazelik(v.d.dogrulama, {hata: true}), o.reklamGizli ? GM.reklamIsaret('MD-END') : ''].join('');
    const l = [o.rota === false ? null : GM.teaser({ikon: 'rota', baslik: 'Bu mekân yol üstünde mi?', metin: 'Nereden nereye gittiğini yaz; güzergâhın boyunca **uğrayabileceğin mekânları** haritada gör.', btn: {metin: 'Güzergâhını planla', ikon: 'rota', tur: 'secondary', git: `#/rota/planla?durak=${v.m.slug}`}}),
      v.benzer.length ? {baslik: 'Benzer mekânlar', eylem: 'Tümü', git: '#/mekanlar', html: GM.yatay(v.benzer.map(x => GM.mekanKart(x, {kayitli: GM.mekanKayit.var('favori', x.slug)})))} : null].filter(Boolean);
    const x = l.at(-1), ek = h => `<div class="gm-yigin">${h}${son}</div>`; if (typeof x === 'string') l[l.length - 1] = ek(x); else if (x) x.html = ek(x.html); else l.push(son);
    return GM.bolumler(l);
  };
  const kuyruk = (v, o = {}) => o.zebra ? kuyrukZebra(v, o) : [
    o.rota === false ? '' : GM.teaser({ikon: 'rota', baslik: 'Bu mekân yol üstünde mi?', metin: 'Nereden nereye gittiğini yaz; güzergâhın boyunca **uğrayabileceğin mekânları** haritada gör.', btn: {metin: 'Güzergâhını planla', ikon: 'rota', tur: 'secondary', git: `#/rota/planla?durak=${v.m.slug}`}}),
    o.reklam === false ? '' : o.reklamGizli ? GM.reklamIsaret('MD-END') : GM.reklamYeri({kod: 'MD-END'}),
    v.benzer.length ? `<section>${GM.bas('Benzer mekânlar', {metin: 'Tümü', git: '#/mekanlar'})}${GM.yatay(v.benzer.map(x => GM.mekanKart(x, {kayitli: GM.mekanKayit.var('favori', x.slug)})))}</section>` : '',
    o.hata === false ? '' : GM.tazelik(v.d.dogrulama, {hata: true})
  ].join('');
  const fotolar = v => (v.galeri.length > 1 ? `<section class="gm-yigin-12">${bas(`Fotoğraflar (${v.galeri.length})`, 'Dokun, tümünü gör')}${GM.fotoSerit(v.galeri)}</section>` : '');
  // Resy "Need to Know": rezervasyon koşulu, alerjen, saatler; her satır kendi sheet'ini açar.
  const bilgiSatir = v => `<section class="gm-yigin-12">${bas('Bilmen gerekenler', 'Gitmeden önce üç kısa not')}${GM.satirlar([v.m.rezervasyon ? {ikon: 'rezervasyon', baslik: 'Rezervasyon koşulları', alt: 'Talep · onayla kesinleşir', veri: {eylem: 'mk-bilgi', id: 'rez'}} : null, {ikon: 'gizlilik', baslik: 'Alerjen ve beslenme', alt: v.d.alerjen ? 'Mekân bilgi paylaştı' : 'Henüz paylaşılmadı, sormayı unutma', veri: {eylem: 'mk-bilgi', id: 'alerjen'}}, {ikon: 'saat', baslik: 'Çalışma saatleri', alt: v.acik.metin || 'Henüz girilmedi', veri: {eylem: 'mk-bilgi', id: 'saat'}}].filter(Boolean))}</section>`;
  // Roadtrippers "along the route": bu mekândan sonra gelen rota durakları (gerçek rota verisi, sapma ve km ile).
  const sonrakiDuraklar = v => { if (!v.rota) return ''; const l = GM.rotaDuraklari(v.rota.R).filter(x => x.km > v.rota.d.km && x.mekan.kapak).sort((a, b) => a.km - b.km).slice(0, 3); return l.length ? `<section class="gm-yigin-12">${bas(`${v.rota.R.ad} · sonraki duraklar`, 'Bu duraktan sonra güzergâhta seni bekleyenler')}<div class="gm-yigin-8">${l.map(x => GM.durakKart({...x, mekan: x.mekan}, {eylem: false, sapma: {dk: x.sapma, km: x.km}})).join('')}</div></section>` : ''; };
  const genel = (v, o = {}) => (o.zebra ? GM.bolumler : l => l.join(''))([o.fotolar ? fotolar(v) : '', o.aciklama === false ? '' : aciklama(v), o.editor === false ? '' : editor(v), deneyim(v, {serit: o.zebra}), uygun(v, o), ozellikler(v), o.bilgi ? bilgiSatir(v) : '', o.adres ? adres(v) : '', rotaKart(v), o.il ? ilLezzet(v) : ''].filter(Boolean));
  const kaydetBtn = v => ({ikon: 'favori', ad: 'Kaydet', basili: v.fav, veri: {eylem: 'mk-kaydet'}});
  const ortak = {
    iskelet: 'detay', ust: '#/mekanlar',
    yukle: () => GM.yukleVeri('mekan-detay'),
    baslik: ctx => GM.mekan(ctx.param.slug)?.ad || 'Mekân',
    sonra: (kok, ctx) => { const v = veri(ctx.param.slug); if (!v) return null; return GM.mekanEylemBagla(kok, v.m, v.d, {galeri: v.galeri, rota: v.rota, odak: [v.m.lng, v.m.lat]}); }
  };

  // ---------- A · Dada ailesi (Gastro detay-v2) ----------
  // Ekrana özgü hâller (?hal=): bulunamadi · kapali (işletme kalıcı kapandı) · rez-kapali (çevrim içi talep almıyor) · slot-yok (seçilen gün dolu) · rez-hata (talep gönderilemedi).
  // ?rez=1 ya da slot-yok / rez-hata: rezervasyon sheet'i açılışta açılır (misafirde üye duvarı). Ortak hâller (yukleniyor, bos, hata, cevrimdisi) router'da.
  const aHal = ctx => ctx.sorgu.hal || '';
  const aVeri = ctx => { if (aHal(ctx) === 'bulunamadi') return null; const v = veri(ctx.param.slug); if (!v) return null; const h = aHal(ctx); const rezKapali = h === 'rez-kapali' || h === 'kapali' || !v.m.rezervasyon; return {...v, kapandi: h === 'kapali', rezKapali, ozellik: rezKapali ? v.ozellik.filter(x => !/^Rezervasyon/.test(x)) : v.ozellik}; };
  const aBant = v => (v.kapandi
    ? GM.ipucu({ton: 'hata', ikon: 'store-slash', baslik: 'Bu mekân kalıcı olarak kapandı', metin: 'İşletme **yayından kalktı**; bilgiler arşiv için duruyor. Aynı türde açık mekânlar aşağıda.'})
    : v.rezKapali && v.m.rezervasyon ? GM.ipucu({ton: 'uyari', ikon: 'rezervasyon', baslik: 'Rezervasyon şu an kapalı', metin: `Mekân çevrim içi talep **almıyor**${v.d.tel ? '; masa için telefonla sorabilirsin' : '; gitmeden önce mekâna danış'}.`, eylem: v.d.tel ? {metin: 'Ara', ikon: 'telefon', veri: {eylem: 'mk-ara'}} : null}) : '');
  // "Bu işletme sizin mi?" (Beyar 16 Kas, Google İşletme Profili): son bölümün içinde tek satır → #/sahiplen/<slug>. Doğrulanmış sahibi varsa (veride sahip, prototipte ?sahipli=1) yok;
  // açık talep varsa (GM.durum 'sahiplen-talepler'[slug]) alt satır inceleniyor der.
  const sahiplen = (v, ctx) => { if (v.d.sahip || v.m.sahip || ctx.sorgu.sahipli === '1') return ''; const t = (GM.durum.oku('sahiplen-talepler', {}) || {})[v.m.slug]; return GM.satirlar([{ikon: 'store', baslik: 'Bu işletme sizin mi?', alt: t ? 'Sahiplenme talebin inceleniyor' : 'Sahiplenme talebi gönder, mekânı panelinden yönet', git: `#/sahiplen/${v.m.slug}`, ok: true}]); };
  GM.ekran('mekan-a', {...ortak, tur: 'banner',
    bos: {ikon: 'mekan', baslik: 'Mekân bulunamadı', metin: 'Bu mekân yayından kalkmış ya da bağlantı eskimiş olabilir. **Mekânlar** listesinden devam et.', eylem: {metin: 'Mekânlara dön', ikon: 'mekan', yerine: '#/mekanlar'}},
    ustBar: ctx => (aVeri(ctx) ? {menu: false, sag: [{ikon: 'favori', etiket: 'Favorilere ekle', veri: {eylem: 'mk-kaydet'}, attrs: `aria-pressed="${GM.mekanKayit.var('favori', ctx.param.slug)}"`}, {ikon: 'paylas', etiket: 'Paylaş', veri: {eylem: 'mk-paylas'}}, {ikon: 'more', etiket: 'Daha fazla', veri: {eylem: 'mk-daha'}}]} : {saydam: false}),
    ciz: ctx => {
      const v = aVeri(ctx); if (!v) return bulunamadi();
      const {m, d} = v, s = d.saatler?.[(GM.simdi().getDay() + 6) % 7 + 1];
      const sekme = [
        {ad: 'Genel Bakış', deger: 'genel', html: genel(v, {aciklama: false, fotolar: true, il: true, tekSatir: true, zebra: true})},
        ...(d.neYenir?.length ? [{ad: 'Ne Yenir?', deger: 'ne-yenir', html: lezzet(v, 'yenir')}] : []),
        ...(d.neAlinir?.length ? [{ad: 'Ne Alınır?', deger: 'ne-alinir', html: lezzet(v, 'alinir')}] : []),
        {ad: 'Menü', deger: 'menu', html: menu({...v, d: {...d, tarifler: null}})},
        {ad: 'Yorumlar', deger: 'yorumlar', sayi: d.yorumSayi ?? 0, html: yorum(v)},
        {ad: 'Adres & Saatler', deger: 'adres', html: adres(v)},
        ...(d.tarifler ? [{ad: 'Tarifler', deger: 'tarifler', html: tarif(v)}] : [])
      ];
      const bugun = v.kapandi ? {ikon: 'saat', etiket: 'Durum', deger: 'Kapandı', alt: 'kalıcı'} : s ? {ikon: 'saat', etiket: 'Bugün', deger: v.acik.acik ? 'Açık' : nokta(v.acik.acilis || s[0]), alt: v.acik.acik ? `${nokta(s[1])} kapanış` : (v.acik.acilis ? 'açılış' : 'kapalı')} : {ikon: 'saat', etiket: 'Şu an', deger: v.acik.metin || '–'};
      return GM.detay({
        gorsel: v.galeri[0]?.src || m.kapak, etiket: [m.kategori, m.mutfak?.[0]].filter(Boolean).join(' · '), baslik: m.ad,
        caps: [m.puan == null ? null : {ikon: 'yildiz', metin: String(m.puan).replace('.', ',')}, {ikon: 'pin', metin: GM.konumMetin(m)}, v.rota && !v.kapandi ? {ikon: 'rota', metin: 'Rota durağı'} : null].filter(x => x && x.metin),
        bas: GM.ozetSerit([
          {ikon: 'yildiz', etiket: 'Puan', deger: m.puan == null ? '–' : String(m.puan).replace('.', ','), alt: m.puan == null ? 'Henüz yok' : null},
          {ikon: 'fiyat', etiket: 'Fiyat', deger: FIYAT[m.fiyat] || '–', alt: m.fiyat ? '₺'.repeat(m.fiyat) : 'Henüz yok'},
          bugun
        ]) + aBant(v) + (d.editorNotu || d.goruntulenme ? GM.kisiSatir({ad: 'Dada Gourmet', boyut: 40, baslik: 'Dada Gourmet editörü', alt: d.editorNotu ? `${d.editorNotu.etiket}${d.dogrulama ? ` · ${d.dogrulama.tarih}` : ''}` : 'Mekân bilgisi', sag: GM.gozSayi(d.goruntulenme)}) : '') + GM.ozellikSerit({etiket: 'Özellikler', ogeler: [...(m.nitelik || []).map(x => ({ikon: x.ikon, metin: x.ad})), ...v.ozellik.map(x => ({ikon: 'onay', metin: x}))]}) + aciklama(v),
        sekmeler: GM.detaySekmeler({ad: 'mka', kaydir: true, ogeler: sekme}),
        kuyruk: kuyruk(v, {rota: !v.kapandi, reklamGizli: true, zebra: true, sahiplen: sahiplen(v, ctx)})
      });
    },
    // Alt çubuk: Ziyaret Ettim (basılı hâl) · Yorumlar (sayılı, sekmeye atlar) · Haritada göster + tek ana eylem (rezervasyon / yol tarifi / benzerleri).
    altBar: ctx => {
      const v = aVeri(ctx); if (!v) return '';
      const ana = v.kapandi ? {metin: 'Benzer mekânlar', ikon: 'mekan', git: `#/mekanlar?kategori=${v.m.f?.kategori?.[0] || ''}`} : v.rezKapali ? {metin: 'Yol tarifi', ikon: 'yon', veri: {eylem: 'mk-yol'}} : {metin: 'Rezervasyon', ikon: 'rezervasyon', veri: {eylem: 'mk-rez'}};
      return GM.altEylem({ikonlar: [{ikon: 'ziyaret', ad: 'Ziyaret Ettim', basili: v.ziyaret, veri: {eylem: 'mk-ziyaret'}}, {ikon: 'sohbet', ad: 'Yorumlar', sayi: v.d.yorumSayi ?? 0, veri: {eylem: 'mk-sekme', id: 'yorumlar'}}, {ikon: 'harita', ad: 'Haritada göster', veri: {eylem: 'mk-harita'}}], dugmeler: [ana]});
    },
    sonra: (kok, ctx) => {
      const v = aVeri(ctx); if (!v) return null;
      const h = aHal(ctx), rez = {slotYok: h === 'slot-yok', hata: h === 'rez-hata', adim: h === 'slot-yok' ? 2 : 1};
      const t = GM.mekanEylemBagla(kok, v.m, v.d, {galeri: v.galeri, rota: v.rota, odak: [v.m.lng, v.m.lat], rez});
      const k = GM.kaydetBagla(kok); // benzer mekân kartlarının kalbi aynı favori anahtarına yazar
      // Derin bağlantı: rezervasyon sheet'i ekran oturunca açılır (bildirimden "Masa ayırt", hâl kareleri).
      const z = (ctx.sorgu.rez === '1' || rez.slotYok || rez.hata) && !v.rezKapali ? setTimeout(() => kok.querySelector('.gm-altbar [data-eylem="mk-rez"]')?.click(), GM.TK.motion.page) : 0;
      return () => { clearTimeout(z); t?.(); k(); };
    }
  });

  // ---------- B · Kategori (Michelin / Resy / Google Maps D1) ----------
  GM.ekran('mekan-b', {...ortak, tur: 'banner',
    ustBar: ctx => (GM.mekan(ctx.param.slug) ? {menu: false, sag: [{ikon: 'harita', etiket: 'Haritada göster', veri: {eylem: 'mk-harita'}}, {ikon: 'more', etiket: 'Daha fazla', veri: {eylem: 'mk-daha'}}]} : {saydam: false}),
    ciz: ctx => {
      const v = veri(ctx.param.slug); if (!v) return bulunamadi();
      const {m, d} = v;
      const lez = [lezzet(v, 'yenir'), lezzet(v, 'alinir'), ilLezzet(v)].join('');
      return GM.galeriHero({gorseller: v.galeri, etiket: `${m.ad} fotoğrafları`})
        + GM.kimlikPanel(GM.mekanKimlik(m, d)
          + (v.rota ? GM.rotaBaglam({baslik: `${v.rota.R.ad} rotasında`, sapma: {dk: v.rota.d.sapma, km: v.rota.d.km}, alt: v.rota.d.uzak <= 1 ? 'Güzergâhtan ayrılmadan' : `Güzergâhtan ${GM.ondalik(v.rota.d.uzak, 1)} km içeride`}) : '')
          + GM.eylemDortlu([kaydetBtn(v), {ikon: 'ziyaret', ad: 'Ziyaret Ettim', adBasili: 'Gittim', basili: v.ziyaret, veri: {eylem: 'mk-ziyaret'}}, {ikon: 'rota', ad: 'Rotaya ekle', adBasili: 'Rotada', basili: GM.mekanKayit.var('durak', m.slug), veri: {eylem: 'mk-durak'}}, {ikon: 'paylas', ad: 'Paylaş', veri: {eylem: 'mk-paylas'}}])
          + (d.editorNotu ? editor(v, {ust: 'Editör notu', baslik: 'Neden seviyoruz'}) : GM.aciklama({metin: m.tanitim || '', satir: 3})))
        + GM.detaySekmeler({ad: 'mkb', kaydir: true, ogeler: [
          {ad: 'Genel', deger: 'genel', html: genel(v, {editor: false, adres: true, bilgi: true})},
          {ad: 'Menü', deger: 'menu', html: menu(v)},
          {ad: 'Lezzetler', deger: 'lezzet', html: lez || GM.bos({ikon: 'neYenir', baslik: 'Lezzet kartı henüz yok', metin: 'Mekânın **imza tabakları** ve yöresel ürünleri girildiğinde burada görünür.'})},
          {ad: 'Etkinlikler', deger: 'etkinlik', html: etkinlik(v)},
          {ad: 'Yorumlar', deger: 'yorum', sayi: d.yorumSayi ?? 0, html: yorum(v)}
        ]})
        + GM.detayKuyruk(kuyruk(v));
    },
    altBar: ctx => {
      const v = veri(ctx.param.slug); if (!v) return '';
      return v.m.rezervasyon
        ? GM.rezBar({baslik: 'Masa ayırt', alt: v.acik.acilis ? `Bugün ${nokta(v.acik.acilis)}${GM.saatEki(v.acik.acilis, 'den')} itibaren` : 'Onayla kesinleşir', altIkon: 'saat', eylem: {metin: 'Rezervasyon', ikon: 'rezervasyon', veri: {eylem: 'mk-rez'}}})
        : GM.rezBar({baslik: 'Rezervasyon almıyor', alt: GM.konumMetin(v.m), altIkon: 'pin', eylem: {metin: 'Yol tarifi', ikon: 'yon', veri: {eylem: 'mk-yol'}}});
    }
  });

  // ---------- C · Son nesil (harita üstü detay sheet'i, D2) ----------
  GM.ekran('mekan-c', {...ortak, tur: 'tam', iskelet: 'harita-sheet',
    ciz: ctx => {
      const v = veri(ctx.param.slug); if (!v) return bulunamadi();
      const {m, d} = v, R = v.rota?.R, rd = v.rota?.d, kd = 0.018;
      const pinler = [...(R ? [{lng: R.cizgi[0][0], lat: R.cizgi[0][1], tur: 'baslangic', ikon: 'baslangic'}, {lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], tur: 'varis', ikon: 'varis'}] : []), ...v.yakin.map(x => ({id: x.slug, lng: x.lng, lat: x.lat, soluk: true, aria: x.ad})), {id: m.slug, lng: m.lng, lat: m.lat, secili: true, ad: m.ad}];
      const durak = GM.mekanKayit.var('durak', m.slug), durakAd = R ? 'Durağa ekle' : 'Rotaya ekle';
      const ozet = [
        R ? GM.rotaBaglam({baslik: `${R.ad} rotasında`, sapma: {dk: rd.sapma, km: rd.km}, alt: rd.uzak <= 1 ? 'Güzergâhtan ayrılmadan' : `Güzergâhtan ${GM.ondalik(rd.uzak, 1)} km içeride`}) : GM.rotaBaglam({ikon: 'pin', baslik: GM.konumMetin(m, 'uzun'), alt: v.yakin.length ? `Yakınında ${v.yakin.length} mekân daha` : 'Rotana eklemek için dokun'}),
        GM.btnIkili({metin: 'Yol tarifi', ikon: 'yon', veri: {eylem: 'mk-yol'}}, {metin: durak ? 'Rotada' : durakAd, ikon: durak ? 'onay' : 'ekle', veri: {eylem: 'mk-durak'}, sinif: durak ? 'gm-btn--tonlu' : '', attrs: `aria-pressed="${durak}" data-metin-basili="Rotada" data-metin-normal="${durakAd}" data-ikon-basili="onay" data-ikon-normal="ekle"`}),
        GM.eylemCipleri([m.rezervasyon ? GM.cip({metin: 'Rezervasyon', ikon: 'rezervasyon', veri: {eylem: 'mk-rez'}}) : '', GM.cip({metin: 'Ziyaret Ettim', ikon: 'ziyaret', veri: {eylem: 'mk-ziyaret'}, attrs: `aria-pressed="${v.ziyaret}"`}), d.tel ? GM.cip({metin: 'Ara', ikon: 'telefon', veri: {eylem: 'mk-ara'}}) : '', GM.cip({metin: 'Listeye ekle', ikon: 'list-ul', veri: {eylem: 'mk-liste'}}), GM.cip({metin: 'Değerlendir', ikon: 'yildiz', veri: {eylem: 'mk-degerlendir'}})]),
        GM.fotoSerit(v.galeri),
        GM.tazelik(d.dogrulama, {hata: true})
      ].join('');
      const sekme = [
        {ad: 'Genel', deger: 'genel', html: genel(v)},
        {ad: 'Menü', deger: 'menu', html: menu(v)},
        {ad: 'Yorumlar', deger: 'yorum', sayi: d.yorumSayi ?? 0, html: yorum(v)},
        {ad: 'Adres & Saatler', deger: 'adres', html: adres(v)},
        ...(d.neYenir?.length || d.neAlinir?.length || v.il ? [{ad: 'Lezzetler', deger: 'lezzet', html: [lezzet(v, 'yenir'), lezzet(v, 'alinir'), ilLezzet(v)].join('')}] : [])
      ];
      return GM.haritaSheet({
        etiket: `${m.ad} ayrıntıları`,
        harita: {ad: 'mkc-harita', kume: true, koridor: !!R, rota: R ? {cizgi: R.cizgi} : null, pinler, sinir: [[m.lng - kd, m.lat - kd * .6], [m.lng + kd, m.lat + kd * .6]], dolgu: {top: 72, bottom: 400, left: 32, right: 32}, etiket: `${m.ad} çevresi haritası`},
        sol: GM.ikonBtn({ikon: 'geri', etiket: 'Geri', geri: true}),
        sag: GM.ikonBtn({ikon: 'harita', etiket: 'Haritada aç', veri: {eylem: 'mk-harita'}}) + GM.ikonBtn({ikon: 'more', etiket: 'Daha fazla', veri: {eylem: 'mk-daha'}}),
        bas: GM.haritaSheetBas(GM.mekanKimlik(m, d, {kompakt: true, meta: {mutfak: false, goz: false}}), GM.ikonBtn({ikon: 'favori', etiket: 'Favorilere ekle', tur: 'kutu', secili: v.fav, veri: {eylem: 'mk-kaydet'}}) + GM.ikonBtn({ikon: 'paylas', etiket: 'Paylaş', tur: 'kutu', veri: {eylem: 'mk-paylas'}})),
        ozet,
        icerik: GM.detaySekmeler({ad: 'mkc', kaydir: true, ogeler: sekme}) + GM.detayKuyruk(sonrakiDuraklar(v) + kuyruk(v, {rota: !R, reklam: false, hata: false}))
      });
    },
    sonra: (kok, ctx) => {
      const t = ortak.sonra(kok, ctx); if (!t) return null;
      // Yakındaki pine dokununca o mekânın detayı aynı kalıpta açılır.
      const p = GM.on(kok, 'mkc-harita', id => { if (id && id !== ctx.param.slug) GM.yerine(`#/alt/detay-c/${id}`); });
      return () => { t(); p(); };
    }
  });
  // Cila turu (Görev 6): A/B/C kayıtları ana-alternatif.js'tekiyle aynı, iyilesti eklendi (bu dosya sonra yüklenir, son kayıt geçerli).
  GM.alternatifKaydet({ekran: 'detay', kod: 'detay-a', sira: 1, ad: 'Detay · A Dada ailesi', referans: 'Dada Gastro detay-v2', alinan: 'Fotoğraf banner, özet şeridi, yapışkan sekmeler, alt eylem çubuğu.', gerekce: 'Gastro tarif detayıyla aynı iskelet; tutarlılık en yüksek.', git: '#/alt/detay-a/mikla', iyilesti: 'Gastro yazar satırı (editör · görüntülenme), sayılı alt çubuk (Yorumlar 0 → sekmeye atlar), üst barda Kaydet/Paylaş, il coğrafi işaret kartı, doğru Dada Puan dili.'});
  GM.alternatifKaydet({ekran: 'detay', kod: 'detay-b', sira: 2, ad: 'Detay · B Kategori', referans: 'Michelin Guide + Resy + Google Maps', alinan: 'Galeri hero, rozetler, 4’lü eylem şeridi, "Neden seviyoruz", yapışkan rezervasyon.', gerekce: 'Restoran uygulamalarının alıştırdığı düzen; rezervasyon her an elde.', git: '#/alt/detay-b/mikla', iyilesti: 'Kimlik panelinde rota bağlamı kartı (+dk · km), Resy "Bilmen gerekenler" satırları, fotoğrafa Gastro marka ışığı, rezervasyon onayında +25 Dada Puan.'});
  GM.alternatifKaydet({ekran: 'detay', kod: 'detay-c', sira: 3, ad: 'Detay · C Son nesil', referans: 'Google Maps + Watch Duty + Roadtrippers', alinan: 'Harita üstü 3 duraklı detay sheet’i, rota bağlamı (+dk, km).', gerekce: 'Dada Route’tan gelen kullanıcı haritadan kopmadan karar verir.', git: '#/alt/detay-c/mikla', iyilesti: 'Watch Duty tazelik damgası yarım sheet’te, Roadtrippers "sonraki duraklar" (rotada bu duraktan sonrakiler, sapmalı), kompakt başlık ve kümelenmiş pinler.'});
})();
