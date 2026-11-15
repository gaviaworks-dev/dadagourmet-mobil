/* Mekân Bul (alt menü sekmesi) · sonuçlar · Mekân Öner. Paket: kesif / mekan-bul ajanı (Görev 12; temel sürüm ana-liste-detay).
   Web kaynağı: docs/WEB-ENVANTERI.md §4.2 (4 adım: konum + bütçe · ortam (19 konsept + Fark Etmez) · mutfak (18, 3 aile sekmesi) · nitelik (hizmet 9,
   beslenme 6, ulaşım 4, zaman 2)), web prototip assets/js/sayfa/mekan-bul.js (eşleşme, ağırlık, eşik, boş sonuçlar) ve §4.7 Mekân Öner (+50 Dada Puan, §5).
   Eşleşme webdeki gibi: oran = tutan kriterlerin ağırlığı / seçilen kriterlerin toplamı (ortam 40, bütçe 20, mutfak 15, her nitelik 15, şimdi açık 15,
   rezervasyon 10); %80 ve üzeri "En Uygun Seçenekler", %40-80 "Yakın Alternatifler", eşik gevşetilince %40 altı "Diğer Seçenekler" (canlının 3. grubu).
   Konum eşleşme değil süzgeçtir. Hiçbir mekânda verisi olmayan seçim boş sonuç + öneri verir. Puan, yorum uydurulmaz.
   Rotalar: #/mekan-bul (sekme: giriş; ?adim=1-4 sihirbaz, ?duzenle=1 sonuçtan düzenleme; seçim sorgusu derin bağlantı),
   #/mekan-bul/sonuclar (?ortam=…&butce=…&mutfak=…&nitelik=…&il=…&ilce=…&simdi=1&rez=1), #/mekan-oner.
   Ekrana özgü hâller: mekan-bul ?hal=cevapsiz (adim=2) | konum-red | konum-zaman | limit · sonuç ?hal=sonuc-yok | konum-yok | esik | gevsek · öneri ?hal=alan-hata | gonderildi (misafir: yumuşak kapı, taslak girişten sonra gönderilir). */
(() => {
  const ANAHTAR = 'mekan-bul', TOPLAM = 4, SAYFA = 12;
  const AGIRLIK = {ortam: 40, butce: 20, mutfak: 15, nitelik: 15, simdi: 15, rez: 10}, ESIK = {uygun: 0.8, yakin: 0.4};
  const M = () => GMV.mekanlar, SEC = () => GMV.mekanSecenek;
  const has = (m, g, d) => (m.f?.[g] || []).includes(d);
  const BEKLE = () => (GM.azHareket() ? 0 : GM.TK.motion.reveal);

  // ---------- Seçenekler (web tohum ve kodları; ikonlar FA solid) ----------
  const YONTEM = [['hepsi', 'earth-europe', 'Fark Etmez', 'Tüm Türkiye'], ['bolge', 'city', 'Bölge Seç', 'Şehir, ilçe'], ['mevcut', 'location-crosshairs', 'Konumumu Kullan', 'Yakınımdakiler'], ['harita', 'map-location-dot', 'Haritadan Seç', 'Bölgeyi tarif et']];
  const BUTCE = [['1', 'coins', 'Ekonomik', '₺'], ['2', 'wallet', 'Orta', '₺₺'], ['3', 'gem', 'Üst Orta', '₺₺₺'], ['4', 'crown', 'Lüks', '₺₺₺₺'], ['', 'shuffle', 'Bütçe Önemli Değil', 'Hepsini göster']];
  const ORTAM = [['butik-restoran', 'gem', 'Butik'], ['tarihi', 'landmark', 'Tarihi'], ['modern', 'cube', 'Modern'], ['geleneksel', 'scroll', 'Geleneksel'], ['minimalist', 'feather', 'Minimalist'], ['luks', 'champagne-glasses', 'Lüks'], ['doga-icinde', 'leaf', 'Doğa İçinde'], ['bahceli-restoran', 'tree', 'Bahçeli'], ['terasli', 'sun', 'Teraslı'], ['manzarali', 'binoculars', 'Manzaralı'], ['deniz-kenari', 'anchor', 'Deniz Kenarı'], ['gol-kenari', 'water', 'Göl Kenarı'], ['dag-yayla', 'mountain', 'Dağ / Yayla'], ['ciftlikten-sofraya-restoran', 'tractor', 'Çiftlik / Köy'], ['tas-konak', 'archway', 'Taş Konak'], ['endustriyel', 'industry', 'Endüstriyel'], ['sanat-ve-kultur', 'palette', 'Sanat ve Kültür'], ['yoresel-lezzet-noktasi', 'store', 'Yerel Lezzet Noktası'], ['sef-restorani', 'star', 'Şef Restoranı']].map(([k, i, ad]) => ({k, ikon: i, ad, alan: 'konsept', kod: [k]}));
  const SEKME = [
    ['ogun', 'mug-saucer', 'Öğün', 'Öğün ve Lezzet', [['kahvalti-serpme', 'egg', 'Kahvaltı / Serpme'], ['kebap-ocakbasi', 'fire', 'Kebap / Ocakbaşı'], ['deniz-urunleri', 'fish', 'Deniz Ürünleri']]],
    ['turk', 'map-location-dot', 'Yöresel', 'Türk ve Yöresel', [['turk-mutfagi', 'star-and-crescent', 'Türk Mutfağı'], ['anadolu-mutfagi', 'wheat-awn', 'Anadolu Mutfağı'], ['ege-mutfagi', 'leaf', 'Ege Mutfağı'], ['akdeniz-mutfagi', 'lemon', 'Akdeniz Mutfağı'], ['karadeniz-mutfagi', 'fish-fins', 'Karadeniz Mutfağı'], ['guneydogu-mutfagi', 'mug-hot', 'Güneydoğu Mutfağı'], ['dogu-anadolu-mutfagi', 'cheese', 'Doğu Anadolu Mutfağı'], ['ic-anadolu-mutfagi', 'bread-slice', 'İç Anadolu Mutfağı']]],
    ['dunya', 'earth-americas', 'Dünya', 'Dünya Mutfakları', [['italyan-mutfagi', 'pizza-slice', 'İtalyan Mutfağı'], ['fransiz-mutfagi', 'wine-glass', 'Fransız Mutfağı'], ['japon-mutfagi', 'fish', 'Japon Mutfağı'], ['cin-mutfagi', 'bowl-rice', 'Çin Mutfağı'], ['kore-mutfagi', 'fire-burner', 'Kore Mutfağı'], ['hint-mutfagi', 'mortar-pestle', 'Hint Mutfağı'], ['meksika-mutfagi', 'pepper-hot', 'Meksika Mutfağı']]]
  ].map(([k, ikon, kisa, ad, l]) => ({k, ikon, kisa, ad, ogeler: l.map(([d, i, a]) => ({k: d, ikon: i, ad: a, alan: 'mutfak', kod: [d]}))}));
  const MUTFAK = SEKME.flatMap(s => s.ogeler);
  const NITELIK = [
    ['hizmet', 'bell-concierge', 'Hizmetler', 'hizmet', [['acik-alan', 'umbrella-beach', 'Açık alan / Teras', 'acik-alan bahce teras'], ['cocuk', 'children', 'Çocuk dostu', 'cocuk-dostu bebek-sandalyesi bebek-bakim-alani'], ['evcil', 'paw', 'Evcil hayvan', 'evcil-hayvan-dostu'], ['wifi', 'wifi', 'Wi-Fi / Çalışma', 'wifi calismaya-uygun'], ['muzik', 'music', 'Canlı müzik', 'canli-muzik'], ['kart', 'credit-card', 'Kredi kartı', 'kredi-karti'], ['paket', 'bag-shopping', 'Paket / Gel-al', 'paket-servis gel-al'], ['klima', 'temperature-half', 'Klima / Isıtma', 'klima-isitma'], ['grup', 'people-group', 'Grup / Özel gün', 'grup-rezervasyonu ozel-gun']]],
    ['beslenme', 'leaf', 'Beslenme', 'beslenme', [['vegan', 'seedling', 'Vegan', 'vegan'], ['vejetaryen', 'carrot', 'Vejetaryen', 'vejetaryen'], ['glutensiz', 'wheat-awn-circle-exclamation', 'Glütensiz', 'glutensiz'], ['sekersiz', 'cubes-stacked', 'Şekersiz', 'sekersiz'], ['saglikli', 'apple-whole', 'Sağlıklı / Organik', 'saglikli-beslenme organik-urun-odakli'], ['alerjen', 'triangle-exclamation', 'Alerjen bilgisi', 'alerjen-bilgisi']]],
    ['ulasim', 'wheelchair', 'Ulaşım ve erişim', 'ulasim', [['otopark', 'square-parking', 'Otopark / Vale', 'otopark ozel-otopark vale'], ['toplu', 'train-subway', 'Toplu taşıma', 'toplu-tasimaya-yakin metroya-yakin'], ['engelli', 'wheelchair-move', 'Engelli erişimi', 'engelli-erisimi tekerlekli-sandalye-erisimi giris-rampasi asansor'], ['bebek-arabasi', 'baby-carriage', 'Bebek arabası', 'bebek-arabasiyla-erisim']]]
  ].map(([g, ikon, baslik, alan, l]) => ({g, ikon, baslik, ogeler: l.map(([k, i, ad, kod]) => ({k, ikon: i, ad, alan, kod: kod.split(' ')}))}));
  const ZAMAN = [{k: 'simdi', ikon: 'door-open', ad: 'Şimdi açık olmalı', kisa: 'Şimdi açık', alan: 'acik', kod: ['simdi']}, {k: 'rez', ikon: 'calendar-check', ad: 'Rezervasyon alıyor olmalı', kisa: 'Rezervasyon alıyor', alan: 'hizmet', kod: ['rezervasyon-aliyor', 'online-rezervasyon']}];
  const uy = x => m => x.kod.some(k => has(m, x.alan, k));
  const KUTU = Object.fromEntries([...ORTAM, ...MUTFAK, ...NITELIK.flatMap(n => n.ogeler), ...ZAMAN].map(x => [x.k, x]));
  // Kutudaki mekân sayısı (web: 0 gizlenmez, "Kayıt yok" yazar; boş seçim sonuçta öneri verir). Bir kez sayılır.
  const sayilar = {};
  const say = x => (sayilar[x.k] ??= M().filter(uy(x)).length);
  const sayiMetin = n => (n ? `${GM.sayi(n)} mekân` : 'Kayıt yok');
  const butceSay = k => M().filter(m => has(m, 'fiyat', k)).length;

  // ---------- Durum (GM.durum: sekme dönüşünde ve sonuç ekranında aynı seçim) ----------
  const BOS = () => ({adim: 1, yontem: 'hepsi', konum: {}, tarif: '', mesafe: 25, nokta: null, butce: '', ortam: [], mutfak: [], nitelik: [], simdi: false, rez: false, sekme: 'ogun'});
  const oku = () => ({...BOS(), ...(GM.durum.oku(ANAHTAR, {}) || {})});
  const yaz = d => GM.durum.yaz(ANAHTAR, d);
  // Adres sorgusundan seçim (web adresYaz/okuma ile aynı anahtarlar): ilk açılışta ve sonuç derin bağlantısında.
  const SORGU = ['ortam', 'mutfak', 'nitelik', 'butce', 'il', 'ilce', 'simdi', 'rez'];
  const sorgudan = (q, d = BOS()) => {
    const l = a => String(q[a] || '').split(',').filter(Boolean);
    if (q.il) { d.yontem = 'bolge'; d.konum = {il: q.il, ilce: q.ilce || null}; }
    if (q.butce != null && BUTCE.some(b => b[0] === String(q.butce))) d.butce = String(q.butce);
    ['ortam', 'mutfak', 'nitelik'].forEach(a => { if (q[a]) d[a] = l(a).filter(k => k === 'fark-etmez' || KUTU[k]); });
    if (q.simdi === '1') d.simdi = true; if (q.rez === '1') d.rez = true;
    return d;
  };
  const sorgulu = q => SORGU.some(a => q[a] != null);
  // Sekme ekranı tek örnektir ve ctx.sorgu ilk girişte kalır: adım (?adim=1-4, ?duzenle=1) ve ekrana özgü hâl her çizimde adres çubuğundan okunur.
  // Sihirbaz adımları alt menüsüz akış ekranında (#/mekan-bul/adim, tur 'alt'); rota tabloda yoksa adımlar sekmede çizilir (eski davranış).
  const AKIS = () => !!window.GM_ROTALAR?.['#/mekan-bul/adim'];
  const hashSorgu = () => (/^#\/mekan-bul(\/adim)?(\?|$)/.test(location.hash) ? Object.fromEntries(new URLSearchParams(location.hash.split('?')[1] || '')) : null);
  const adimAdres = (n, duzenle) => (n ? `${AKIS() ? '#/mekan-bul/adim' : '#/mekan-bul'}?adim=${n}${duzenle ? '&duzenle=1' : ''}` : '#/mekan-bul');
  const konumVar = d => !!d?.nokta;

  // ---------- Eşleşme (web mekan-bul.js) ----------
  const ilAd = d => (SEC().il || []).find(x => x.deger === d)?.ad || d, ilceAd = d => (SEC().ilce || []).find(x => x.deger === d)?.ad || d;
  const katla = s => GM.katla ? GM.katla(s) : String(s).toLocaleLowerCase('tr');
  const tarifYer = t => { const k = katla(t); if (!k) return []; const ilce = (SEC().ilce || []).filter(o => k.includes(katla(o.ad))).map(o => ['ilce', o.deger]); return ilce.length ? ilce : (SEC().il || []).filter(o => k.includes(katla(o.ad))).map(o => ['il', o.deger]); };
  const konumdaMi = d => {
    if (d.yontem === 'bolge' && d.konum?.il) return m => has(m, 'il', d.konum.il) && (!d.konum.ilce || has(m, 'ilce', d.konum.ilce));
    if (d.yontem === 'mevcut' && d.nokta) return m => GM.km([d.nokta.lng, d.nokta.lat], [m.lng, m.lat]) <= d.mesafe;
    if (d.yontem === 'harita') { const y = tarifYer(d.tarif); if (y.length) return m => y.some(([g, v]) => has(m, g, v)); }
    return () => true;
  };
  const coklu = (l, tur, baslik, ikon) => {
    if (!l.length) return null; const adlar = l.map(x => x.ad);
    return {tur, ad: adlar.join(', '), cipler: l, agirlik: AGIRLIK[tur], ikon, uy: m => l.some(x => uy(x)(m)), neden: m => l.filter(x => uy(x)(m)).map(x => x.ad).join(', '), eksik: `${baslik}: ${adlar.join(', ')} yok`, yok: `${l.length > 1 ? `Seçtiğin ${baslik.toLocaleLowerCase('tr')} seçeneklerinde` : `${adlar[0]} için`} kayıt henüz yok.`};
  };
  const kriterler = d => {
    const k = [], o = coklu(d.ortam.filter(x => x !== 'fark-etmez').map(x => KUTU[x]).filter(Boolean), 'ortam', 'Ortam', 'layer-group'), mu = coklu(d.mutfak.map(x => KUTU[x]).filter(Boolean), 'mutfak', 'Mutfak', 'utensils');
    // sil: kriteri çıkaran seçim (sonuç yokken "gevşet" önerisi; sayısı gerçekten yeniden hesaplanır).
    if (o) k.push({...o, sil: x => ({...x, ortam: ['fark-etmez']})});
    if (d.butce) { const b = BUTCE.find(x => x[0] === d.butce); k.push({tur: 'butce', ad: `${b[2]} (${b[3]})`, kisa: b[2], ikon: b[1], agirlik: AGIRLIK.butce, uy: m => has(m, 'fiyat', d.butce), eksik: `Bütçe: ${b[2]} değil`, yok: `${b[2]} (${b[3]}) fiyat seviyesinde kayıt henüz yok.`, oneri: [['Üst orta fiyat', '#/mekanlar?fiyat=3', '3'], ['Lüks fiyat', '#/mekanlar?fiyat=4', '4']], sil: x => ({...x, butce: ''})}); }
    if (mu) k.push({...mu, sil: x => ({...x, mutfak: []})});
    d.nitelik.map(x => KUTU[x]).filter(Boolean).forEach(x => k.push({tur: 'nitelik', ad: x.ad, ikon: x.ikon, agirlik: AGIRLIK.nitelik, uy: uy(x), eksik: `${x.ad} yok`, yok: `${x.ad} kaydı henüz yok.`, sil: y => ({...y, nitelik: y.nitelik.filter(z => z !== x.k)})}));
    ZAMAN.forEach(x => { if (d[x.k]) k.push({tur: x.k, ad: x.kisa, ikon: x.ikon, agirlik: AGIRLIK[x.k], uy: uy(x), eksik: `${x.kisa} değil`, yok: `${x.kisa} kaydı henüz yok.`, sil: y => ({...y, [x.k]: false})}); });
    return k;
  };
  const hesapla = d => {
    const k = kriterler(d), pay = k.reduce((t, c) => t + c.agirlik, 0), yerde = konumdaMi(d);
    const l = M().filter(yerde).map(m => { const tut = k.filter(c => c.uy(m)), p = tut.reduce((t, c) => t + c.agirlik, 0); return {m, oran: pay ? p / pay : 1, yuzde: pay ? Math.round(p / pay * 100) : 100, tut, kalan: k.filter(c => !c.uy(m))}; });
    return {k, l: l.sort((a, b) => b.oran - a.oran || (b.m.kapak ? 1 : 0) - (a.m.kapak ? 1 : 0))};
  };
  const sonuc = d => {
    const {k, l} = hesapla(d), veriYok = k.find(c => !M().some(c.uy));
    if (veriYok) return {k, tur: 'veri-yok', veriYok};
    if (!l.length) return {k, tur: 'konum-yok'};
    // Canlının üçüncü grubu (oran < %40) "eşiği gevşet" ile açılır; yalnız en az bir kriteri tutan mekânlar.
    const uygun = l.filter(s => s.oran >= ESIK.uygun), yakin = l.filter(s => s.oran >= ESIK.yakin && s.oran < ESIK.uygun), diger = l.filter(s => s.oran < ESIK.yakin && s.tut.length);
    return {k, tur: uygun.length + yakin.length ? 'tamam' : 'yakin-yok', uygun, yakin, diger};
  };
  const sonucSay = s => (s.tur === 'tamam' ? s.uygun.length + s.yakin.length : 0);

  // ---------- Sihirbaz çizimi ----------
  // Başlık bloğu kuralı (≤3 satır: adım etiketi · başlık · tek satır açıklama): açıklamalar 390'da tek satır.
  const ADIM = [['Konum ve bütçe', 'Nerede, ne kadar?', 'İkisi de **fark etmez** olabilir.'], ['Ortam', 'Nasıl bir ortam?', 'Birden çok seçebilirsin; **biri** yeter.'], ['Mutfak', 'Ne yemek istersin?', '**Seçmezsen** mutfak kriter olmaz.'], ['Nitelikler', 'Senin için önemli olan', '**Hiç seçmeden** de devam edebilirsin.']];
  const secimler = (ad, l, secili, o = {}) => GM.secimler({ad, coklu: o.coklu !== false, duzen: 'iki', secili, ogeler: l.map(x => ({k: x.k, ikon: x.ikon, ad: x.ad, alt: x.alt ?? sayiMetin(say(x))}))});
  const altBolum = (baslik, html, sag) => `<section class="gm-kl-mb-bolum">${GM.sihirbazAltBas({baslik, sag})}${html}</section>`;
  const altAlan = (ad, d, html) => `<div class="gm-kl-mb-bolum" data-mb-alt="${ad}"${d.yontem === ad ? '' : ' hidden'}>${html}</div>`;
  const konumDurum = d => (d.nokta ? `Konumun: **${d.nokta.ad || 'alındı'}** · ${d.mesafe} km içinde **${GM.sayi(M().filter(konumdaMi({...d, yontem: 'mevcut'})).length)} mekân** var.` : 'Konum izni istenir. Vermezsen **Bölge Seç** ile devam edebilirsin.');
  // Konum hatası (sakin hata + elle şehir seç): red = izin verilmedi (kod 1), zaman = zaman aşımı / alınamadı (kod 2-3, destek yok).
  const konumHata = (d, o = {}) => (d.nokta ? null : o.konumHata || d.konumHata || null);
  const hataBant = tur => `<div class="gm-yigin-12">${tur === 'red'
    ? GM.bant({ton: 'uyari', baslik: 'Konum izni kapalı', metin: 'Yakınındaki mekânları bulmak için **konum iznine** ihtiyacımız var. İzni ayarlardan açabilir ya da şehri **elle seçebilirsin**.', eylem: {metin: 'İzni aç', git: '#/izin-reddi'}})
    : GM.bant({ton: 'uyari', baslik: 'Konum alınamadı', metin: 'Konumun **zamanında alınamadı**; kapalı alanda ya da zayıf sinyalde olabilir. Tekrar dene ya da şehri elle seç.', eylem: {metin: 'Tekrar dene', ikon: 'yenile', veri: {eylem: 'mb-konum'}}})}${GM.btn({metin: 'Şehri elle seç', ikon: 'city', tur: 'secondary', tam: true, veri: {eylem: 'mb-sehir'}})}</div>`;
  const a1 = (d, o = {}) => altBolum('Nerede?', GM.secimler({ad: 'mb-yontem', duzen: 'iki', secili: d.yontem, ogeler: YONTEM.map(([k, ikon, ad, alt]) => ({k, ikon, ad, alt}))})
      + altAlan('bolge', d, GM.konumSecici({konum: d.konum, sayi: M().filter(konumdaMi({...d, yontem: 'bolge'})).length}))
      + altAlan('mevcut', d, `${konumHata(d, o) ? hataBant(konumHata(d, o)) : ''}${GM.slider({ad: 'mb-mesafe', min: 1, max: 50, deger: d.mesafe, birim: 'km', etiket: 'Arama yarıçapı'})}${GM.btn({metin: d.nokta ? 'Konumu yenile' : 'Konumumu bul', ikon: 'location-crosshairs', tur: 'secondary', tam: true, veri: {eylem: 'mb-konum'}})}<p class="gm-kl-mb-hesap" data-mb-konum role="status">${GM.vurgu(konumDurum(d))}</p>`)
      + altAlan('harita', d, GM.input({ad: 'mb-tarif', etiket: 'Bölgeyi tarif et', ikon: 'map-location-dot', yer: 'Ör. Urla bağ yolu, Kadıköy çevresi', deger: d.tarif, yardim: 'Yazdığın il ya da ilçe adını eşleriz; eşleşmezse konum süzülmez.'})))
    + altBolum('Bütçen ne?', GM.secimler({ad: 'mb-butce', secili: d.butce, ogeler: BUTCE.map(([k, ikon, ad, alt]) => ({k, ikon, ad, alt: k ? `${alt} · ${sayiMetin(butceSay(k))}` : alt}))}) + GM.p('Fiyatlar değişebileceği için **tahmini fiyat seviyesi** (₺) gösterilir.', {meta: true, ton: 'ikincil'}));
  // Cevapsız adım: ortam seçilmeden ilerlenirse (ya da ?adim=3-4 derin bağlantısı) adım 2 uyarıyla açılır.
  const a2 = (d, o = {}) => (o.hata ? `<div data-mb-hata>${GM.bant({ton: 'uyari', baslik: 'Önce bir ortam seç', metin: 'Sonuçlar ortama göre sıralanır; **en az bir ortam** seç ya da **Fark Etmez**’i işaretle.'})}</div>` : '') + altBolum('Ortam ve atmosfer', secimler('mb-ortam', [...ORTAM, {k: 'fark-etmez', ikon: 'shuffle', ad: 'Fark Etmez', alt: 'Hepsini tara'}], d.ortam), `<span class="gm-t-meta gm-ton-ikincil" data-mb-sayi="ortam">${ortamSayi(d)}</span>`)
    + GM.p('**Fark Etmez** ortamı kriter dışı bırakır; başka bir ortam seçince kendiliğinden kalkar.', {meta: true, ton: 'ikincil'});
  const ortamSayi = d => (d.ortam.includes('fark-etmez') ? 'Fark etmez' : d.ortam.length ? `${d.ortam.length} seçili` : 'En az bir seçim');
  const a3 = d => `<section class="gm-kl-mb-bolum">${GM.input({ad: 'mb-mutfak-ara', ikon: 'ara_', yer: 'Mutfak ara…', etiket: '', otomatik: 'off'})}<div data-mb-seg>${GM.segment({ad: 'mb-sekme', secili: d.sekme, etiket: 'Mutfak ailesi', ogeler: SEKME.map(s => ({ad: s.kisa, deger: s.k, ikon: s.ikon, sayi: s.ogeler.filter(x => d.mutfak.includes(x.k)).length || null}))})}</div>${SEKME.map(s => `<div class="gm-kl-mb-bolum" data-mb-panel="${s.k}"${s.k === d.sekme ? '' : ' hidden'}><div data-mb-aile hidden>${GM.sihirbazAltBas({baslik: s.ad})}</div>${secimler(`mb-mutfak-${s.k}`, s.ogeler, d.mutfak)}</div>`).join('')}<div data-mb-ara-yok hidden>${GM.veriYok('Aramana uyan **mutfak** yok.')}</div></section>`;
  const nitOzet = (g, d) => g.ogeler.filter(x => d.nitelik.includes(x.k)).map(x => x.ad).join(', ');
  const sayac = (ad, n) => `<span data-mb-sayac="${ad}">${n ? GM.sayacRozet(n) : ''}</span>`;
  const a4 = d => GM.akordiyon([
    ...NITELIK.map(g => ({ikon: g.ikon, baslik: g.baslik, alt: nitOzet(g, d) || `${g.ogeler.length} seçenek`, sag: sayac(g.g, g.ogeler.filter(x => d.nitelik.includes(x.k)).length), icerik: secimler(`mb-nit-${g.g}`, g.ogeler, d.nitelik)})),
    {ikon: 'calendar-check', baslik: 'Ne zaman gideceksin?', alt: ZAMAN.filter(x => d[x.k]).map(x => x.kisa).join(', ') || 'Şimdi açık, rezervasyon', sag: sayac('zaman', ZAMAN.filter(x => d[x.k]).length), icerik: `<div class="gm-satirlar">${ZAMAN.map(x => GM.toggle({ad: `mb-${x.k}`, ikon: x.ikon, etiket: x.ad, alt: sayiMetin(say(x)), secili: d[x.k]})).join('')}</div>`}
  ], {ad: 'mb-nit', acik: 0}) + GM.p('Birleşik etiketlerde **biri yeter** (ör. Otopark / Vale).', {meta: true, ton: 'ikincil'});
  // Ayak (dock üstünde yapışık): Geri / Devam. Adım 3'te mutfak seçilmediyse birincil "Atla" (adım atlanır, mutfak kriter olmaz).
  // Sonuçtan düzenlemeye gelindiyse (?duzenle=1) birincil her adımda "Sonuçları gör" (güncel seçimle), ikincil sıradaki adım.
  const ileriMetin = (d, n) => (n === TOPLAM ? 'Sonuçları gör' : n === 3 && !d.mutfak.length ? 'Atla' : 'Devam');
  const ayakDugme = (d, n, o = {}) => (o.duzenle
    ? [{metin: n < TOPLAM ? 'Sonraki' : 'Geri', ikon: n < TOPLAM ? 'tumu' : 'geri', tur: 'secondary', veri: {eylem: n < TOPLAM ? 'mb-sonraki' : 'mb-geri'}}, {metin: 'Sonuçları gör', ikon: 'ara_', veri: {eylem: 'mb-guncelle'}}]
    : [{metin: 'Geri', ikon: 'geri', tur: 'secondary', veri: {eylem: 'mb-geri'}}, {metin: ileriMetin(d, n), ikon: n === TOPLAM ? 'ara_' : 'tumu', veri: {eylem: 'mb-ileri'}}]);
  // Akış ekranında Geri/Devam kanon altBar'da (GM.altEylem, alt menü yok); sekmede (rota yoksa) dock üstüne yapışan ayak.
  const adimHtml = (d, n, o = {}) => { const [ad, baslik, metin] = ADIM[n - 1]; return `<div class="gm-kl-mb gm-kl-mb-gecis" data-mb>${GM.sihirbazBas({adim: n, toplam: TOPLAM, ad, baslik, metin})}${[a1, a2, a3, a4][n - 1](d, o)}${o.altta ? '' : GM.sihirbazAyak(ayakDugme(d, n, o).map(GM.btn).join(''))}</div>`; };

  // ---------- Giriş (sekme açılışı, ?adim yok): web hero "Sana göre mekânı bulalım" + son arama + 4 adım + eşleşme kuralı + Mekân Öner ----------
  const ADIM_IKON = ['pin', 'katman', 'lezzet', 'onay'];
  const adimOzet = (d, i) => [
    () => [d.yontem === 'bolge' && d.konum?.il ? [ilAd(d.konum.il), d.konum.ilce && ilceAd(d.konum.ilce)].filter(Boolean).join(' / ') : d.yontem === 'mevcut' && d.nokta ? `${d.mesafe} km içinde` : d.yontem === 'harita' && d.tarif ? d.tarif : 'Tüm Türkiye', d.butce ? BUTCE.find(b => b[0] === d.butce)?.[2] : 'Bütçe fark etmez'].join(' · '),
    () => (d.ortam.includes('fark-etmez') ? 'Fark etmez' : d.ortam.map(k => KUTU[k]?.ad).filter(Boolean).join(', ')),
    () => d.mutfak.map(k => KUTU[k]?.ad).filter(Boolean).join(', '),
    () => [...d.nitelik.map(k => KUTU[k]?.ad), ...ZAMAN.filter(x => d[x.k]).map(x => x.kisa)].filter(Boolean).join(', ')
  ][i]();
  const giris = d => {
    const var_ = d.ortam.length > 0, s = var_ ? sonuc(d) : null, n = s ? sonucSay(s) : 0;
    // Görev 14/6: arama düğmesi hero'nun içinden çıktı, hero'nun hemen altında.
    const ust = GM.selamBas({gorsel: 'assets/gorsel/hero/tabak.webp', ust: 'Mekân Bul', baslikHtml: 'Sana göre <em>mekânı</em> bulalım'});
    const dugme = `<div class="gm-ic">${GM.btn({metin: var_ ? 'Yeni aramaya başla' : 'Aramaya başla', ikon: 'bul', tam: true, veri: {eylem: var_ ? 'mb-sifirla' : 'mb-basla'}})}</div>`;
    return ust + dugme + GM.bolumler([
      var_ ? {baslik: 'Son araman', html: `<div class="gm-yigin-12">${GM.etiketBulut(ozetCipler(d, s.k))}${GM.p(n ? `Seçimlerine **${GM.sayi(n)} mekân** uyuyor; ${GM.sayi(s.uygun.length)} tanesi %80 ve üzeri.` : 'Bu seçimde **sonuç yok**; seçimi değiştirmeyi dene.')}${GM.btnIkili({metin: 'Düzenle', ikon: 'sliders', git: adimAdres(1, true)}, {metin: 'Sonuçları gör', ikon: 'tumu', git: '#/mekan-bul/sonuclar'})}</div>`} : null,
      {baslik: '4 kısa adım', html: GM.satirlar(ADIM.map(([ad, baslik], i) => ({ikon: ADIM_IKON[i], baslik: `${i + 1}. ${ad}`, alt: (var_ && adimOzet(d, i)) || baslik, git: adimAdres(i + 1), ok: true})))},
      {baslik: 'Nasıl eşleştiriyoruz?', html: GM.p('Her mekânı seçtiğin kriterlerle karşılaştırırız: **ortam 40**, bütçe 20, mutfak 15, her nitelik 15, şimdi açık 15, rezervasyon 10 puan. Oran yalnız seçtiklerinden hesaplanır; **%80 ve üzeri** en uygun, %40 ve üzeri yakın alternatif.')},
      {html: GM.eylemKart({ikon: 'ekle', baslik: 'Aradığın mekân yok mu?', alt: 'Mekân öner · +50 Dada Puan', git: '#/mekan-oner'})}
    ]);
  };
  // Ekrana özgü hâl ?hal=limit (eski ad kota): günlük hak bitti. Web paket matrisi (WEB-ENVANTERI §4.8): Ücretsiz günde 3, Pro günde 25, Pro Max sınırsız.
  // Yenilenme gece yarısı (günlük hak; saat webde yazılı değil, 00.00 varsayıldı). Pro satışı uygulamada açık değil: düğme #/pro tanıtımına gider.
  const limit = () => { const d = oku(); return GM.durumSahne({isaret: 'hourglass-half', baslik: 'Bugünkü arama hakkın doldu', metin: 'Ücretsiz pakette Mekân Bul **günde 3 arama** yapar. Hakkın **yarın 00.00’da** yenilenir; Pro’da günde 25 arama.',
    ana: {metin: 'Pro’ya geç', ikon: 'bolt', git: '#/pro'}, ikinciller: [d.ortam.length ? {metin: 'Son sonuçlarını aç', ikon: 'gecmis', git: '#/mekan-bul/sonuclar'} : null, {metin: 'Mekânlara göz at', ikon: 'mekan', git: '#/mekanlar'}].filter(Boolean),
    ipucuBaslik: 'Paketlere göre günlük arama', ipucuParcali: true, ipuclari: [['user', 'Ücretsiz', 'Günde 3 arama'], ['bolt', 'Pro', 'Günde 25 arama'], ['gem', 'Pro Max', 'Sınırsız arama']]}); };
  // Adım çözümü: 1-4 dışı → giriş; ortam seçilmeden 3-4 istenirse adım 2 (cevapsız adım).
  const coz = q => { const ist = +q.adim || 0, d = oku(); let n = ist >= 1 && ist <= TOPLAM ? ist : 0; if (n > 2 && !d.ortam.length) n = 2; return {d, ist, n, duzenle: q.duzenle === '1' && n > 0}; };
  let ortamHata = false;

  // Ortak tanım: akis=false sekme (#/mekan-bul: giriş; rota yoksa adımlar da), akis=true adım ekranı (#/mekan-bul/adim).
  const adimIstek = q => +q.adim >= 1 || /^(konum-(red|zaman)|cevapsiz)$/.test(q.hal || '');
  const adimEkran = akis => ({
    ciz: ctx => {
      const q = hashSorgu() || ctx.sorgu;
      if (!akis && (q.hal === 'limit' || q.hal === 'kota')) return limit();
      if (akis && !+q.adim) q.adim = '1';
      // Seçim sorgulu derin bağlantı (#/mekan-bul?adim=2&ortam=terasli): seçim yazılır, adres sadeleşir (her çizimde yeniden yazılmasın).
      if (sorgulu(q)) { yaz(sorgudan(q)); history.replaceState(history.state, '', adimAdres(+q.adim || 0) + (q.hal ? `${+q.adim ? '&' : '?'}hal=${q.hal}` : '')); }
      const {d, ist, n, duzenle} = coz(q);
      if (!akis && AKIS() && adimIstek(q)) return giris(d);   // sekmeye gelen adım bağı akış ekranına yönlenir (sonra)
      if (/^konum-(red|zaman)$/.test(q.hal || '')) return adimHtml({...d, yontem: 'mevcut', nokta: null}, 1, {konumHata: q.hal.slice(6), altta: akis});
      if (!n) return giris(d);
      return adimHtml(d, n, {duzenle, altta: akis, hata: ortamHata || q.hal === 'cevapsiz' || (ist > 2 && n === 2)});
    },
    altBar: akis ? ctx => { const q = hashSorgu() || ctx.sorgu, {d, n, duzenle} = coz({...q, adim: q.adim || '1'}); return GM.altEylem({dugmeler: ayakDugme(d, n || 1, {duzenle})}); } : undefined,
    sonra: (kok, ctx) => {
      const q = hashSorgu() || ctx.sorgu;
      if (!akis && (q.hal === 'limit' || q.hal === 'kota')) return null;
      if (akis && !+q.adim) q.adim = '1';
      if (!akis && AKIS() && adimIstek(q)) { const a = Math.max(1, +q.adim || 1); setTimeout(() => GM.yerine(`#/mekan-bul/adim?adim=${a}${q.duzenle === '1' ? '&duzenle=1' : ''}${q.hal ? `&hal=${q.hal}` : ''}`)); return null; }
      const {ist, n, duzenle} = coz(q), d = /^konum-(red|zaman)$/.test(q.hal || '') ? {...oku(), yontem: 'mevcut', nokta: null} : oku(), c = [], kap = () => kok.querySelector('[data-mb]');
      const kaydet = () => yaz(d);
      // Adım geçişi: adres yerinde değişir (sekme yığına girmez), ekran yeniden çizilir, kaydırma başa.
      const gec = (m, dz = duzenle) => {
        ortamHata = false;
        if (akis && !m) { GM.geri('#/mekan-bul'); return; }                        // adım 1'de Geri: girişe
        if (!akis && AKIS() && m) { GM.git(adimAdres(m, dz)); return; }          // girişten akışa
        history.replaceState(history.state, '', adimAdres(m, dz && m > 0)); GM.tazele(); GM.aktif()?.el.querySelector('.gm-kaydir')?.scrollTo({top: 0});
      };
      if (ist > 2 && n === 2) { history.replaceState(history.state, '', adimAdres(2, duzenle)); GM.toast('Önce **ortam** seç; mutfak ve niteliklere sonra geçebilirsin', {tur: 'uyari'}); }
      c.push(GM.eylem(kok, 'mb-basla', () => gec(1, false)));
      c.push(GM.eylem(kok, 'mb-sifirla', () => { yaz(BOS()); GM.toast('Yeni arama · **seçimler temizlendi**', {ikon: 'yenile'}); gec(1, false); }));
      if (!n) return () => c.forEach(f => f());
      // Adım 1
      c.push(GM.on(kok, 'mb-yontem', v => { d.yontem = v; kaydet(); kok.querySelectorAll('[data-mb-alt]').forEach(e => { e.hidden = e.dataset.mbAlt !== v; }); }));
      c.push(GM.eylem(kok, 'konum', () => GM.konumSheet({secili: d.konum, sec: k => { d.konum = {il: k.il || null, ilce: k.ilce || null}; kaydet(); const b = kok.querySelector('.gm-kl-konum'); if (b) b.outerHTML = GM.konumSecici({konum: d.konum, sayi: M().filter(konumdaMi(d)).length}); }})));
      c.push(GM.on(kok, 'mb-mesafe', v => { d.mesafe = +v; kaydet(); const p = kok.querySelector('[data-mb-konum]'); if (p) p.innerHTML = GM.vurgu(konumDurum(d)); }));
      // Konumumu bul: cihaz konumu (navigator.geolocation, 8 sn). İzin yoksa ya da zaman aşımında sakin hata bandı + "Şehri elle seç".
      // Ad: en yakın kayıtlı mekânın ilçesi ve ili ("Kadıköy, İstanbul yakını"); uzak konumda yarıçapta 0 mekân dürüstçe yazılır.
      c.push(GM.eylem(kok, 'mb-konum', el => {
        const bitir = () => { kaydet(); GM.tazele(); };
        const hata = tur => { d.nokta = null; d.konumHata = tur; if (tur === 'red') GM.durum.yaz('konum-izin', 'reddedildi'); bitir(); };
        if (!navigator.geolocation) { hata('zaman'); return; }
        GM.mesgul(el, new Promise(r => navigator.geolocation.getCurrentPosition(x => {
          const n = {lat: x.coords.latitude, lng: x.coords.longitude}, y = M().reduce((a, m) => { const k = GM.km([n.lng, n.lat], [m.lng, m.lat]); return k < a.k ? {k, m} : a; }, {k: Infinity, m: null});
          d.nokta = {...n, ad: y.m ? `${[y.m.ilce, y.m.il].filter(Boolean).join(', ')} yakını` : 'Konumun'}; d.konumHata = null; GM.durum.yaz('konum-izin', 'verildi'); bitir(); r();
        }, e => { hata(e?.code === 1 ? 'red' : 'zaman'); r(); }, {timeout: 8000, maximumAge: 60000})));
      }));
      c.push(GM.eylem(kok, 'mb-sehir', () => { d.yontem = 'bolge'; d.konumHata = null; kaydet(); GM.tazele(); GM.konumSheet({secili: d.konum, sec: k => { d.konum = {il: k.il || null, ilce: k.ilce || null}; kaydet(); GM.tazele(); }}); }));
      const giris_ = ev => {
        const i = ev.target;
        if (i.name === 'mb-tarif') { d.tarif = i.value.trim(); kaydet(); }
        if (i.name === 'mb-mutfak-ara') araUygula(i.value);
      };
      kok.addEventListener('input', giris_); c.push(() => kok.removeEventListener('input', giris_));
      c.push(GM.on(kok, 'mb-butce', v => { d.butce = v; kaydet(); }));
      // Adım 2: Fark Etmez tek başına kalır; başka ortam seçilince kendisi kalkar. Seçim yapılınca cevapsız adım uyarısı kalkar.
      c.push(GM.on(kok, 'mb-ortam', v => {
        const yeniFark = v.includes('fark-etmez') && !d.ortam.includes('fark-etmez');
        d.ortam = yeniFark ? ['fark-etmez'] : v.length > 1 ? v.filter(x => x !== 'fark-etmez') : v; kaydet();
        kok.querySelectorAll('[data-ad="mb-ortam"] .gm-secim-kart').forEach(b => b.setAttribute('aria-pressed', d.ortam.includes(b.dataset.k)));
        const s = kok.querySelector('[data-mb-sayi="ortam"]'); if (s) s.textContent = ortamSayi(d);
        if (d.ortam.length) { ortamHata = false; kok.querySelector('[data-mb-hata]')?.remove(); }
      }));
      // Adım 3: sekmeler seçimi silmez; arama bütün aileleri tarar, eşleşen kartlar aile başlığıyla görünür. Seçim yoksa birincil "Atla".
      const ileriYaz = () => { const b = kok.querySelector('[data-eylem="mb-ileri"] span'); if (b) b.textContent = ileriMetin(d, n); };
      const segSay = () => SEKME.forEach(s => { const b = kok.querySelector(`[data-ad="mb-sekme"] [data-seg="${s.k}"]`); if (!b) return; const k = s.ogeler.filter(x => d.mutfak.includes(x.k)).length; b.querySelector('.gm-seg-sayi')?.remove(); if (k) b.insertAdjacentHTML('beforeend', ` <span class="gm-seg-sayi">${k}</span>`); });
      SEKME.forEach(s => c.push(GM.on(kok, `mb-mutfak-${s.k}`, v => { d.mutfak = [...d.mutfak.filter(k => !s.ogeler.some(x => x.k === k)), ...v]; kaydet(); segSay(); ileriYaz(); })));
      c.push(GM.on(kok, 'mb-sekme', v => { d.sekme = v; kaydet(); kok.querySelectorAll('[data-mb-panel]').forEach(p => { p.hidden = p.dataset.mbPanel !== v; }); }));
      const araUygula = t => {
        const k = katla(t.trim()); let es = 0;
        const seg = kok.querySelector('[data-mb-seg]'); if (seg) seg.hidden = !!k;
        kok.querySelectorAll('[data-mb-panel]').forEach(p => {
          let m = 0; p.querySelectorAll('.gm-secim-kart').forEach(b => { const on = !k || katla(b.querySelector('b').textContent).includes(k); b.hidden = !on; if (on) m++; });
          p.hidden = k ? !m : p.dataset.mbPanel !== d.sekme; es += m;
        });
        kok.querySelectorAll('[data-mb-aile]').forEach(e => { e.hidden = !k; });
        const y = kok.querySelector('[data-mb-ara-yok]'); if (y) y.hidden = !k || es > 0;
      };
      // Adım 4: grup başlığı seçim sayısını ve kısa ad özetini taşır (web B9).
      const nitBoya = () => { NITELIK.forEach(g => { const k = g.ogeler.filter(x => d.nitelik.includes(x.k)).length, s = kok.querySelector(`[data-mb-sayac="${g.g}"]`); if (s) { s.innerHTML = k ? GM.sayacRozet(k) : ''; const sm = s.closest('.gm-bolum-bas')?.querySelector('.gm-bolum-metin small'); if (sm) sm.textContent = nitOzet(g, d) || `${g.ogeler.length} seçenek`; } }); const z = ZAMAN.filter(x => d[x.k]), s = kok.querySelector('[data-mb-sayac="zaman"]'); if (s) { s.innerHTML = z.length ? GM.sayacRozet(z.length) : ''; const sm = s.closest('.gm-bolum-bas')?.querySelector('.gm-bolum-metin small'); if (sm) sm.textContent = z.map(x => x.kisa).join(', ') || 'Şimdi açık, rezervasyon'; } };
      NITELIK.forEach(g => c.push(GM.on(kok, `mb-nit-${g.g}`, v => { d.nitelik = [...d.nitelik.filter(k => !g.ogeler.some(x => x.k === k)), ...v]; kaydet(); nitBoya(); })));
      ZAMAN.forEach(x => c.push(GM.on(kok, `mb-${x.k}`, v => { d[x.k] = !!v; kaydet(); nitBoya(); })));
      // Gezinme ve doğrulama (web: bölge seçildiyse il zorunlu, konumda nokta zorunlu, ortamda en az bir seçim). Adım 1'de Geri girişe döner.
      const dogrula = () => {
        const uyar = t => { GM.toast(t, {tur: 'uyari'}); GM.titres(20); return false; };
        if (n === 1 && d.yontem === 'bolge' && !d.konum?.il) return uyar('Bir **il** seç ya da **Fark Etmez**’i işaretle');
        if (n === 1 && d.yontem === 'mevcut' && !d.nokta) return uyar('Önce **Konumumu bul**’a dokun ya da başka bir yol seç');
        if (n >= 2 && !d.ortam.length) { if (n === 2) { ortamHata = true; GM.tazele(); } else gec(2); return uyar('Devam etmek için **en az bir ortam** seç'); }
        return true;
      };
      c.push(GM.eylem(kok, 'mb-geri', () => gec(n - 1)));
      c.push(GM.eylem(kok, 'mb-sonraki', () => { if (dogrula()) gec(n + 1); }));
      c.push(GM.eylem(kok, 'mb-ileri', () => { if (!dogrula()) return; if (n < TOPLAM) gec(n + 1); else GM.git('#/mekan-bul/sonuclar'); }));
      // Düzenlemeden sonuç: yığındaki eski sonuç ekranı yerine güncel sonuç açılır (geri girişe döner).
      c.push(GM.eylem(kok, 'mb-guncelle', () => { if (dogrula()) GM.yerine('#/mekan-bul/sonuclar'); }));
      if (kap() && n === 3) araUygula('');
      return () => c.forEach(f => f());
    }
  });
  GM.ekran('mekan-bul', {tur: 'sekme', nav: 'bul', baslik: 'Mekân Bul', iskelet: 'liste', yenile: true, ...adimEkran(false)});
  GM.ekran('mekan-bul-adim', {tur: 'alt', baslik: 'Mekân Bul', ust: '#/mekan-bul', iskelet: 'liste', yenile: true, ...adimEkran(true)});

  // ---------- Sonuçlar ----------
  const ozetCipler = (d, k) => [
    d.yontem === 'bolge' && d.konum?.il ? {ikon: 'location-dot', ad: [ilAd(d.konum.il), d.konum.ilce && ilceAd(d.konum.ilce)].filter(Boolean).join(' / ')} : null,
    d.yontem === 'mevcut' && d.nokta ? {ikon: 'location-crosshairs', ad: `${d.mesafe} km içinde`} : null,
    d.yontem === 'harita' && d.tarif ? {ikon: 'map-location-dot', ad: `${d.tarif}${tarifYer(d.tarif).length ? '' : ' · eşleşmedi'}`} : null,
    d.ortam.includes('fark-etmez') ? {ikon: 'shuffle', ad: 'Ortam: Fark Etmez'} : null,
    ...k.flatMap(c => (c.cipler || [c]).map(x => ({ikon: x.ikon, ad: x.ad})))
  ].filter(Boolean);
  const KISA = {ortam: 'Ortam', mutfak: 'Mutfak', butce: 'Bütçe'};
  const hesapSatir = k => (k.length ? `**Oran:** tutan kriterlerin ağırlığı / seçtiğin kriterlerin toplamı (${k.map(c => `${KISA[c.tur] || c.ad} ${c.agirlik}`).join(' + ')}).` : 'Kriter seçmedin; bütün mekânlar **%100** uygun sayılır.');
  // Ekran durumu: sıralama, görünüm, eşik gevşetme. Seçim değişince gevşetme sıfırlanır.
  let R = {anahtar: '', sira: 'oran', gorunum: 'izgara', gevsek: false};
  const SIRALA = [['oran', 'Eşleşme oranı', 'hedef'], ['yakin', 'En yakın', 'konum'], ['fiyat', 'Fiyat: düşükten yükseğe', 'fiyat'], ['ad', 'Ada göre (A–Z)', 'arrow-down-a-z']];
  const SIRA_FN = {fiyat: (a, b) => (a.m.fiyat || 9) - (b.m.fiyat || 9) || b.oran - a.oran, ad: (a, b) => a.m.ad.localeCompare(b.m.ad, 'tr'), yakin: (a, b) => (R.nokta ? GM.km([R.nokta.lng, R.nokta.lat], [a.m.lng, a.m.lat]) - GM.km([R.nokta.lng, R.nokta.lat], [b.m.lng, b.m.lat]) : 0)};
  const sirali = l => (SIRA_FN[R.sira] ? [...l].sort(SIRA_FN[R.sira]) : l);
  const grup = (l = [], bas) => (l.length ? [{bas: {...bas, sayi: l.length}}, ...sirali(l)] : []);
  // Gruplar web sırasıyla; sıralama grup içinde uygulanır (grup eşiği değişmez).
  const ogeler = s => [
    ...grup(s.uygun, {baslik: 'En Uygun Seçenekler', ikon: 'bolt', not: `%${Math.round(ESIK.uygun * 100)} ve üzeri uyum`}),
    ...grup(s.yakin, {baslik: 'Yakın Alternatifler', ikon: 'compass', not: 'Bir ya da iki kriteri karşılamayanlar'}),
    ...(R.gevsek ? grup(s.diger, {baslik: 'Diğer Seçenekler', ikon: 'sliders', not: `%${Math.round(ESIK.yakin * 100)} altı · en az bir kriteri tutanlar`}) : [])
  ];
  const uyumEt = x => ({etiket: `%${x.yuzde} uyum`, etiketTon: x.oran >= ESIK.uygun ? 'basari' : null, etiketIkon: 'bolt'});
  // Düz kart listesi: grup başlığı ilk kartın onBas'ında (sonsuz sayfa ve "Hepsi bu kadar · N mekân" yalnız mekân sayar).
  // Yığılma kuralı 2: ızgarada tek sayılı grubun son kartı (1 sonuçlu grup dahil) sağı boş satır bırakmasın diye tam genişlik kart olur (sonTek).
  // Yığılma kuralı 3: bu kart GM.mekanKart 'buyuk' (kategori kısa adla ve uyum oranı görselin üstünde rozet; altta ad · tek meta, 2 satır).
  const birlestir = l => { const r = []; let b = null, g = []; const kapa = () => { if (g.length % 2) g[g.length - 1].sonTek = true; r.push(...g); g = []; }; l.forEach(x => { if (x.bas) { kapa(); b = x.bas; } else { g.push({...x, onBas: b}); b = null; } }); kapa(); return r; };
  const kart = (x, ks, yatay) => (yatay ? GM.mekanKart(x.m, {tur: 'yatay', kayitli: ks.has(x.m.slug), ...uyumEt(x)})
    : GM.eslesmeKart(x.m, {yuzde: x.yuzde, tut: x.tut.length, toplam: x.tut.length + x.kalan.length, kayitli: ks.has(x.m.slug)}));
  // Kartları gruplarına yerleştirir: her grup kendi bölümünde (başlık + ızgara/liste); tek kalan son kart ızgaranın altında liste satırı.
  const yerlestir = (kap, l, ks) => l.forEach(x => {
    const izgara = R.gorunum !== 'liste';
    // Görev 14/7: her grup zebra bölüm (.gm-icerikler > section) + kanon bölüm başlığı GM.bas (sağda sayı) + tek satır gm-t-meta açıklama.
    if (x.onBas) kap.insertAdjacentHTML('beforeend', `<section>${GM.bas(x.onBas.baslik, {html: `<span class="gm-t-meta gm-ton-ikincil">${GM.sayi(x.onBas.sayi)} mekân</span>`})}<p class="gm-t-meta gm-ton-ikincil gm-tek-satir">${GM.esc(x.onBas.not)}</p>${GM.listeSonuc([], {gorunum: R.gorunum})}</section>`);
    const sec = kap.lastElementChild;
    if (izgara && x.sonTek) { sec.insertAdjacentHTML('beforeend', GM.listeSonuc([GM.mekanKart(x.m, {tur: 'buyuk', kayitli: ks.has(x.m.slug), etiket: `%${x.yuzde} uyum`, etiketTon: x.oran >= ESIK.uygun ? 'basari' : null})], {gorunum: 'liste'})); return; }
    [...sec.querySelectorAll('.gm-liste-grid, .gm-liste-rows')].pop().insertAdjacentHTML('beforeend', kart(x, ks, !izgara));
  });
  // Gevşetme önerileri: her kriter (ve konum süzgeci) çıkarılınca kaç mekân %40 üstüne çıkar — gerçekten yeniden hesaplanır, 0 olan gösterilmez.
  const gevsetler = (s, d) => [...s.k.filter(c => c.sil).map(c => ({ad: c.kisa || c.ad, sil: c.sil})), d.yontem !== 'hepsi' ? {ad: 'Konum süzgeci', sil: x => ({...x, yontem: 'hepsi'})} : null]
    .filter(Boolean).map(g => ({...g, n: sonucSay(sonuc(g.sil(d)))})).filter(g => g.n);
  const bosSonuc = (s, d) => {
    const oneri = (s.veriYok?.oneri || []).map(([a, git, f]) => { const n = butceSay(f); return n ? GM.cip({metin: `${a} · ${GM.sayi(n)} mekân`, ikon: 'fiyat', git}) : ''; }).filter(Boolean);
    const gev = gevsetler(s, d); SD.gevset = gev;
    const cikar = gev.map((g, i) => GM.cip({metin: `${g.ad} olmadan · ${GM.sayi(g.n)}`, ikon: 'kapat', veri: {eylem: 'mb-cikar', id: i}}));
    const [baslik, metin] = s.tur === 'veri-yok' ? ['Bu seçimde sonuç yok', `${s.veriYok.yok} **Seçimi değiştir** ya da mekânı bize öner.`] : s.tur === 'konum-yok' ? ['Bu konumda mekân bulamadık', '**Konumu genişlet** ya da başka bir bölge seç.'] : ['Seçimlerine yakın mekân bulamadık', `Hiçbir mekân seçimlerine **%${Math.round(ESIK.yakin * 100)} ve üzerinde** uymuyor. Eşiği gevşet ya da bir kriteri çıkar.`];
    const esik = s.tur === 'yakin-yok' && s.diger?.length ? GM.btn({metin: `Eşiği gevşet · ${GM.sayi(s.diger.length)} mekân`, ikon: 'sliders', tur: 'secondary', tam: true, veri: {eylem: 'mb-gevset'}}) : '';
    return `${GM.bos({ikon: 'compass', baslik, metin, eylem: {metin: 'Seçimi değiştir', ikon: 'sliders', veri: {eylem: 'mb-duzenle'}}, ikincil: {metin: 'Mekân öner · +50 Dada Puan', git: '#/mekan-oner'}})}`
      + (esik || cikar.length || oneri.length ? `<div class="gm-kl-mb-bolum">${GM.sihirbazAltBas({baslik: 'Seçimi gevşet'})}<div class="gm-yigin-12">${esik}${cikar.length || oneri.length ? `<div class="gm-serit">${[...cikar, ...oneri].join('')}</div>` : ''}</div></div>` : '');
  };
  let SD = null;
  // Ekrana özgü hâller: sonuc-yok (kaydı olmayan bütçe), konum-yok (eşleşmeyen bölge tarifi), esik (%40 üstü yok → eşiği gevşet önerisi), gevsek (gevşetilmiş liste).
  const HAL_SONUC = {
    'sonuc-yok': {ortam: ['terasli'], butce: '1'},
    'konum-yok': {yontem: 'harita', tarif: 'Kadıköy', ortam: ['tas-konak'], nitelik: ['muzik']},
    esik: {yontem: 'bolge', konum: {il: 'nevsehir', ilce: null}, ortam: ['doga-icinde'], nitelik: ['vegan', 'muzik', 'evcil']},
    gevsek: {yontem: 'bolge', konum: {il: 'nevsehir', ilce: null}, ortam: ['doga-icinde'], nitelik: ['vegan', 'muzik', 'evcil']}
  };
  const sonucDurum = ctx => (HAL_SONUC[ctx.sorgu.hal] ? {...BOS(), ...HAL_SONUC[ctx.sorgu.hal]} : sorgulu(ctx.sorgu) ? sorgudan(ctx.sorgu) : oku());

  GM.ekran('mekan-bul-sonuc', {
    tur: 'alt', nav: 'bul', baslik: 'Sonuçlar', ust: '#/mekan-bul', iskelet: 'kart',
    // Eşleşme hesaplanıyor (Diet program-bul kalıbı): kısa iskelet, sonra sonuç.
    yukle: () => new Promise(r => setTimeout(r, BEKLE())),
    cekYenile: () => new Promise(r => setTimeout(r, BEKLE() * 2)),
    // Üst bar: seçim yokken düzenle / yeni arama, sonuç yokken harita gösterilmez (ölü düğme yok).
    ustBar: ctx => { const d = sonucDurum(ctx), s = d.ortam.length ? sonuc(d) : null, n = s ? sonucSay(s) || ((R.gevsek || ctx.sorgu.hal === 'gevsek') ? s.diger?.length || 0 : 0) : 0; return {sag: [d.ortam.length ? {ikon: 'sliders', etiket: 'Seçimleri düzenle', veri: {eylem: 'mb-duzenle'}} : null, n ? {ikon: 'harita', etiket: 'Haritada gör', veri: {eylem: 'mb-harita'}} : null, d.ortam.length ? {ikon: 'yenile', etiket: 'Yeni arama', veri: {eylem: 'mb-yeni'}} : null].filter(Boolean)}; },
    bos: {ikon: 'compass', baslik: 'Bu seçimde sonuç yok', metin: 'Seçimlerine uyan mekân bulamadık. **Seçimi değiştir** ya da mekânı bize öner.', eylem: {metin: 'Mekân Bul’a dön', ikon: 'sliders', yerine: '#/mekan-bul?adim=1'}, ikincil: {metin: 'Mekân öner', git: '#/mekan-oner'}},
    ciz: ctx => {
      const d = sonucDurum(ctx);
      if (!d.ortam.length) return GM.bos({tam: true, ikon: 'bul', baslik: 'Önce birkaç seçim yap', metin: 'Mekân Bul **4 kısa adımda** seçimlerine uyan mekânları sıralar; en az bir ortam seçmen yeter.', eylem: {metin: 'Mekân Bul’a başla', ikon: 'bul', yerine: '#/mekan-bul?adim=1'}});
      const anahtar = JSON.stringify(d); if (R.anahtar !== anahtar) R = {...R, anahtar, gevsek: ctx.sorgu.hal === 'gevsek'};
      R.nokta = d.nokta || null;
      const s = sonuc(d), ks = GM.kayitliMekanlar(), liste = s.tur === 'tamam' || (R.gevsek && s.diger?.length) ? birlestir(ogeler(s)) : [];
      SD = {d, s, liste};
      const n = liste.length;
      // Görev 14/7: başlık Gastro/Diet bölüm başlığı kanonu (GM.bas / .gm-head) + tek satır gm-t-meta; bölümler zebra (.gm-icerikler).
      const bas = `${GM.bas(n ? 'Sana uygun mekânlar' : 'Sonuç bulunamadı')}<p class="gm-t-meta gm-ton-ikincil">${GM.vurgu(n ? `**${GM.sayi(n)} mekân** · ${s.uygun.length ? `**${GM.sayi(s.uygun.length)}** tanesi %80 üzeri` : '**en yakınlar** oranla'}` : '**Düzenle** ile seçimini değiştir.')}</p>`;
      // Seçim satırı (yığılma kuralı 1-2): solda tek satır seçim çipleri (.gm-tek-satir solması), sağda sırala + görünüm; sonuçsuzken Düzenle.
      // GM.listeDurum kullanılmaz: `:root .gm-liste-status` üst payı (24) çiple sayaç arasında boşluk açıyordu; sayı başlık metninde.
      const ozet = `<div class="gm-kl-mb-ozet">${GM.etiketBulut(ozetCipler(d, s.k)) || '<span></span>'}${n ? GM.ikonBtn({ikon: 'sirala', etiket: 'Sırala', tur: 'kutu', secili: R.sira !== 'oran', veri: {eylem: 'sirala'}}) + GM.ikonBtn({ikon: R.gorunum === 'liste' ? 'table-cells-large' : 'list', etiket: R.gorunum === 'liste' ? 'Izgara görünümü' : 'Liste görünümü', tur: 'kutu', veri: {eylem: 'mb-gorunum'}}) : GM.btn({metin: 'Düzenle', ikon: 'sliders', tur: 'text', boyut: 'sm', veri: {eylem: 'mb-duzenle'}})}</div>`;
      const gevset = n && !R.gevsek && s.diger.length ? GM.btn({metin: `Eşiği gevşet · %40 altı ${GM.sayi(s.diger.length)} mekân`, ikon: 'sliders', tur: 'secondary', tam: true, veri: {eylem: 'mb-gevset'}}) : '';
      // Oran açıklaması üst bölümde (çip satırının altında); kartlar sonra'da grup bölümlerine yerleştirilir (çizimle aynı karede, boş görünmez).
      const hesap = n ? `<p class="gm-kl-mb-hesap">${GM.vurgu(hesapSatir(s.k))}</p>` : '';
      const ust = `<section><div class="gm-yigin-12">${bas}${ozet}${hesap}</div></section>`;
      const son = GM.teaser({ikon: 'mekan', baslik: 'Aradığın mekân listede yok mu?', metin: 'Bildiğin bir mekânı öner; editör onayından geçerse **+50 Dada Puan** kazanırsın.', btn: {metin: 'Mekân öner', ikon: 'ekle', tur: 'secondary', git: '#/mekan-oner'}});
      // Sonuçlu: üst bölüm + grup bölümleri aynı .gm-icerikler içinde (sonsuz kaydırma yeni grubu yeni bölüm olarak ekler); gevşet + öneri altta.
      return n ? `<div class="gm-icerikler" data-mb-sonuc>${ust}</div><div class="gm-ic gm-yigin-24">${gevset}${son}</div>` : GM.bolumler([ust.replace(/^<section>|<\/section>$/g, ''), {html: bosSonuc(s, d)}]);
    },
    sonra: (kok, ctx) => {
      const c = [], {d, s, liste = []} = SD || {}; let io = null;
      // Sonsuz kaydırma: 12 kart + grup başlıkları, sonraki sayfalar alt yükleme göstergesiyle, sonda "Hepsi bu kadar · N mekân".
      const kap = kok.querySelector('[data-mb-sonuc]');
      if (kap && liste.length) {
        const ks = GM.kayitliMekanlar(), son = () => kap.insertAdjacentHTML('afterend', GM.listeSon({sayi: liste.length, birim: 'mekân'}));
        yerlestir(kap, liste.slice(0, SAYFA), ks);
        if (liste.length <= SAYFA) son();
        else {
          let bitti = false;
          io = GM.sonsuz(kap, p => {
            if (bitti) return '';
            const parca = liste.slice((p - 1) * SAYFA, p * SAYFA); if (!parca.length) return '';
            yerlestir(kap, parca, ks);
            if (p * SAYFA >= liste.length) { bitti = true; setTimeout(() => { io?.disconnect(); kap.parentNode?.querySelectorAll(':scope > .gm-sonsuz-son, :scope > .gm-alt-yukleniyor, :scope > .gm-sonsuz-hata').forEach(x => x.remove()); son(); }); }
            return ' ';   // kartlar yerleştirildi; GM.sonsuz'a "devam" işareti
          });
        }
      }
      c.push(GM.kaydetBagla(kok));
      // Düzenle: seçim (sorgudan ya da hâlden gelmiş olabilir) kaydedilir, sihirbaz 1. adımda düzenleme kipinde açılır ("Sonuçları güncelle").
      c.push(GM.eylem(kok, 'mb-duzenle', () => { if (d) yaz(d); GM.git(adimAdres(1, true)); }));
      c.push(GM.eylem(kok, 'mb-yeni', () => { yaz(BOS()); R = {anahtar: '', sira: 'oran', gorunum: R.gorunum, gevsek: false}; GM.toast('Yeni arama · **seçimler temizlendi**', {ikon: 'yenile'}); GM.git(adimAdres(1)); }));
      c.push(GM.eylem(kok, 'sirala', () => GM.siralaSheet({baslik: 'Sırala', secenekler: SIRALA, secili: R.sira, sec: v => {
        if (v === 'yakin' && !konumVar(d)) { GM.toast('Konumun paylaşılmadı; **eşleşme oranı** sırası gösteriliyor', {ikon: 'konum'}); v = 'oran'; }
        R.sira = v; GM.tazele();
      }})));
      c.push(GM.eylem(kok, 'mb-gorunum', () => { R.gorunum = R.gorunum === 'liste' ? 'izgara' : 'liste'; GM.tazele(); }));
      c.push(GM.eylem(kok, 'mb-gevset', () => { R.gevsek = true; GM.tazele(); GM.toast(`Eşik gevşetildi · **%${Math.round(ESIK.yakin * 100)} altı** da listede`, {ikon: 'sliders'}); }));
      // Kriter çıkar: yeni seçim kaydedilir, sonuç hâlsiz adreste yeniden açılır.
      c.push(GM.eylem(kok, 'mb-cikar', el => { const g = SD?.gevset?.[+el.dataset.id]; if (!g) return; yaz(g.sil(d)); GM.toast(`**${g.ad}** çıkarıldı`, {ikon: 'kapat'}); GM.yerine('#/mekan-bul/sonuclar'); }));
      // Haritada gör: listedeki mekânlar yuvarlak pin + küme (docs/HARITA-ISARET.md); pine dokununca uyum oranlı seçili kart.
      c.push(GM.eylem(kok, 'mb-harita', () => {
        const l = SD?.liste || [];
        if (!l.length) { GM.toast('Haritada gösterilecek **mekân yok**', {ikon: 'harita'}); return; }
        GM.sheet({baslik: `Haritada · ${GM.sayi(l.length)} mekân`, tam: true,
          html: `<div class="gm-yigin">${GM.harita({ad: 'mb-harita', yukseklik: 'var(--gm-size-map-hlg)', kume: true, etiket: 'Sonuç haritası', konum: d?.nokta ? [d.nokta.lng, d.nokta.lat] : null, pinler: l.map(x => ({id: x.m.slug, lng: x.m.lng, lat: x.m.lat, ad: x.m.ad}))})}<div data-mb-hsec aria-live="polite">${GM.p('Bir **pine** dokun; mekânın uyum oranı ve bilgisi burada görünür.', {meta: true, ton: 'ikincil'})}</div></div>`,
          sonra: h => {
            const a = GM.on(h, 'mb-harita', id => { const x = l.find(y => y.m.slug === id); if (!x) return; h.querySelector('[data-mb-hsec]').innerHTML = GM.mekanKart(x.m, {tur: 'harita', secili: true, ...uyumEt(x), eylem: GM.btn({metin: 'Mekânı aç', ikon: 'mekan', boyut: 'sm', git: `#/mekan/${x.m.slug}`}) + GM.btn({metin: 'Yol tarifi', ikon: 'yon', tur: 'secondary', boyut: 'sm', veri: {eylem: 'mb-yol', id: x.m.slug}})}); });
            const b = GM.eylem(h, 'mb-yol', el => { const m = GM.mekan(el.dataset.id); GM.toast(`**${m.ad}** için yol tarifi Haritalar’da açılıyor`, {ikon: 'yon'}); });
            return () => { a(); b(); };
          }});
      }));
      // Oran rozeti: tutan ve eksik kriterler (web .mb-reasons) sheet'te.
      c.push(GM.eylem(kok, 'mb-neden', el => {
        const x = (SD?.liste || []).find(y => y.m.slug === el.dataset.id); if (!x) return;
        const li = [...x.tut.map(c_ => `<li>${GM.ik('circle-check')}<span>${GM.esc(c_.neden ? c_.neden(x.m) : c_.ad)}</span></li>`), ...x.kalan.map(c_ => `<li class="is-eksik">${GM.ik('circle-xmark')}<span>${GM.esc(c_.eksik || `${c_.ad} yok`)}</span></li>`)].join('');
        GM.sheet({baslik: x.m.ad, html: `<div class="gm-yigin">${GM.p(`Seçimlerine **%${x.yuzde}** uyuyor · ${x.tut.length} / ${x.tut.length + x.kalan.length} kriter.`, {ton: 'ikincil'})}<ul class="gm-kl-neden">${li || `<li>${GM.ik('circle-check')}<span>Kriter seçmedin; bütün mekânlar uygun sayılır.</span></li>`}</ul></div>`, altBar: GM.btn({metin: 'Mekânı aç', ikon: 'mekan', tam: true, git: `#/mekan/${x.m.slug}`, attrs: 'data-sheet-kapat'})});
      }));
      return () => { io?.disconnect(); c.forEach(f => f()); };
    }
  });

  // ---------- Mekân Öner (+50 Dada Puan) ----------
  // Web K alanları: Mekân adı, Şehir / konum, Mekân tipi, Neden öneriyorsun?, Görsel. P'de konum serbest metin (bkz. §4.7): mobil de serbest metin.
  // Misafir kapısı yumuşak (web formu misafire açık; Diet kalıbı): form herkese açık, misafir "Gönder"e basınca taslak GM.durum 'mekan-oner-taslak'ta
  // saklanır ve üyelik sheet'i açılır; giriş/üyelikten sonra ekran yeniden çizilince taslak kendiliğinden gönderilir. Fotoğraflar taslağa girmez.
  // Kayıt GM.durum 'katkilar' (Profil > Katkılarım: İnceleniyor): {id, tur:'mekan', ad, il, ilce, tip, kategori, neden, foto, durum, puan, tarih}.
  const TASLAK = 'mekan-oner-taslak';
  const TIP = ['Restoran', 'Kafe', 'Kahvaltı Mekânı', 'Tatlıcı', 'Pastane', 'Fırın', 'Kahveci', 'Çay Evi', 'Sokak Lezzetleri', 'Esnaf Lokantası', 'Fine Dining', 'Otel Restoranı', 'Gurme Market', 'Sağlıklı Beslenme Mekânı', 'Lokanta', 'Dondurmacı', 'Brunch Mekânı', 'Hızlı Servis Restoranı', 'Fast Casual Restoranı', 'Casual Dining Restoranı', 'Tematik Restoran', 'Üçüncü Nesil Kahveci'];
  const NEDEN_EN = 20, NEDEN_MAX = 1000;
  const HATA = {'mo-ad': 'Mekânın adını yaz.', 'mo-konum': 'Şehir ya da konumu yaz.', 'mo-tip': 'Mekân tipini seç.', 'mo-neden': `Neden önerdiğini en az ${NEDEN_EN} karakterle anlat.`};
  const oneriForm = (v = {}, h = {}) => `<div class="gm-ic gm-yigin-24">${GM.metinBlok({etiket: 'Topluluk katkısı', baslik: 'Bildiğin bir mekânı öner', metin: 'Editör doğrular, **uygunsa eklenir**.', rol: 'page', h: 1})}`
    + GM.ipucu({ikon: 'puanDada', baslik: '+50 Dada Puan', metin: 'Önerin **yayına girince** puan hesabına geçer. Kabul edilmeyen öneri puan kazandırmaz.'})
    + `<div class="gm-yigin" data-mo-form>${GM.input({ad: 'mo-ad', etiket: 'Mekân adı', zorunlu: true, yer: 'Ör. Köy Sofrası', deger: v['mo-ad'], hata: h['mo-ad']})}${GM.input({ad: 'mo-konum', etiket: 'Şehir / konum', zorunlu: true, ikon: 'pin', yer: 'Ör. Urla, İzmir', deger: v['mo-konum'], hata: h['mo-konum']})}${GM.secAlan({ad: 'mo-tip', etiket: 'Mekân tipi', zorunlu: true, yer: 'Seç', deger: v['mo-tip'], secenekler: TIP.map(t => [t, t]), hata: h['mo-tip']})}${GM.input({ad: 'mo-neden', etiket: 'Neden öneriyorsun?', zorunlu: true, cokSatir: true, yer: 'Ne yedin, neyi sevdin, kime önerirsin?', deger: v['mo-neden'], hata: h['mo-neden'], yardim: `En az ${NEDEN_EN} karakter.`})}${GM.alan({etiket: 'Görsel (isteğe bağlı)', html: GM.fotoEkle({ad: 'mo-foto', en: 3}), yardim: 'Kendi çektiğin fotoğraflar; en fazla 3.'})}</div>`
    + (GM.uye() ? '' : GM.bant({ton: 'bilgi', ikon: 'lock', baslik: 'Göndermek için giriş gerekecek', metin: 'Önerin hesabına bağlanır ve puan kazandırır. Gönder’e basınca giriş istenir; yazdıkların **kaybolmaz**, girişten sonra kendiliğinden gönderilir.'}))
    + GM.p('Göndererek önerinin **Dada Gourmet editörlerince** incelenmesini kabul edersin. Kişisel verilerin KVKK Aydınlatma Metni’ne göre işlenir.', {meta: true, ton: 'ikincil'}) + '</div>';
  const gonderildi = k => GM.durumSahne({isaret: 'circle-check', baslik: 'Önerin bize ulaştı', metin: `**${k?.ad || 'Önerdiğin mekân'}** editör incelemesinde. Yayına girince **+50 Dada Puan** hesabına geçer; durumunu Katkılarım’dan izleyebilirsin.`, ana: {metin: 'Katkılarım', ikon: 'ekle', yerine: '#/profil/katkilar'}, ikinciller: [{metin: 'Bir mekân daha öner', ikon: 'mekan', veri: {eylem: 'mo-yeni'}}, {metin: 'Keşfet’e dön', ikon: 'kesfet', yerine: '#/kesfet'}], ipucuBaslik: 'Sırada ne var?', ipuclari: [['magnifying-glass', 'İnceleniyor', 'Editör bilgileri ve konumu doğrular.'], ['circle-check', 'Yayında · +50', 'Mekân sayfası açılınca puan kesinleşir.'], ['bell', 'Bildirim', 'Sonuç bildirim olarak gelir.']]});
  const ORNEK_HATA = {'mo-ad': '', 'mo-konum': 'Urla', 'mo-neden': 'Çok güzel'};
  GM.ekran('mekan-oner', {
    tur: 'alt', baslik: 'Mekân öner', ust: '#/mekan-bul', iskelet: 'liste',
    ciz: ctx => {
      if (ctx.sorgu.hal === 'gonderildi') return gonderildi(GM.durum.oku('katkilar', [])?.at(-1) || {ad: 'Köy Sofrası'});
      if (ctx.sorgu.hal === 'alan-hata') { const h = {}; Object.entries({...ORNEK_HATA, 'mo-tip': ''}).forEach(([k, val]) => { if (k === 'mo-neden' ? val.length < NEDEN_EN : !val) h[k] = HATA[k]; }); return oneriForm(ORNEK_HATA, h); }
      // Taslak (misafirken yazılan) form alanlarına geri gelir.
      return oneriForm(GM.durum.oku(TASLAK, null)?.v || {});
    },
    altBar: ctx => (ctx.sorgu.hal === 'gonderildi' ? '' : GM.altEylem({dugmeler: [{metin: 'Öneriyi gönder', ikon: 'gonder', tam: true, veri: {eylem: 'mo-gonder'}}]})),
    sonra: (kok, ctx) => {
      const c = [], f = () => kok.querySelector('[data-mo-form]');
      const gonder = (v, el, foto) => {
        const [ilce, il] = String(v['mo-konum'] || '').split(',').map(x => x.trim());
        GM.mesgul(el, BEKLE() * 2).then(() => {
          GM.durum.yaz('katkilar', [...(GM.durum.oku('katkilar', []) || []), {id: `k-${Date.now()}`, tur: 'mekan', ad: v['mo-ad'], il: il || ilce, ilce: il ? ilce : '', tip: v['mo-tip'], kategori: v['mo-tip'], neden: v['mo-neden'].slice(0, NEDEN_MAX), foto, durum: 'inceleniyor', puan: 50, tarih: GM.bugunIso()}]);
          GM.durum.sil(TASLAK); GM.titres(12); GM.yerine('#/mekan-oner?hal=gonderildi');
        });
      };
      const deger = ad => (kok.querySelector(`[name="${ad}"]`)?.value || '').trim();
      // Alan hatası (GM.input hata kalıbı): alanı is-hata yapar, altına tek satır ileti; yazınca kalkar.
      const hataYaz = (ad, m) => { const a = kok.querySelector(`[name="${ad}"]`)?.closest('.gm-alan'); if (!a) return; a.classList.toggle('is-hata', !!m); a.querySelector(':scope > .gm-hata')?.remove(); const i = a.querySelector('input:not([type=hidden]),textarea,button'); if (m) { i?.setAttribute('aria-invalid', 'true'); a.insertAdjacentHTML('beforeend', `<p class="gm-hata" role="alert">${GM.ik('uyari')}${GM.esc(m)}</p>`); } else i?.removeAttribute('aria-invalid'); };
      const gir = ev => { const n = ev.target.name; if (HATA[n] && ev.target.closest('.gm-alan')?.classList.contains('is-hata')) hataYaz(n, ''); };
      kok.addEventListener('input', gir); c.push(() => kok.removeEventListener('input', gir));
      c.push(GM.on(kok, 'mo-tip', () => hataYaz('mo-tip', '')));
      c.push(GM.eylem(kok, 'mo-yeni', () => GM.yerine('#/mekan-oner')));
      c.push(GM.eylem(kok, 'mo-gonder', el => {
        if (!f()) return;
        const v = Object.fromEntries(Object.keys(HATA).map(k => [k, deger(k)])), h = {};
        Object.keys(HATA).forEach(k => { const x = v[k]; h[k] = (k === 'mo-neden' ? x.length < NEDEN_EN : !x) ? HATA[k] : ''; hataYaz(k, h[k]); });
        const ilk = Object.keys(h).find(k => h[k]);
        if (ilk) { kok.querySelector(`[name="${ilk}"]`)?.closest('.gm-alan')?.scrollIntoView({block: 'center', behavior: GM.azHareket() ? 'auto' : 'smooth'}); GM.toast('Eksik alanları **tamamla**', {tur: 'hata'}); GM.titres(20); return; }
        if (!GM.uye()) {
          GM.durum.yaz(TASLAK, {v, bekliyor: true});
          GM.uyeDuvar({baslik: 'Önerini göndermek için giriş yap', metin: 'Önerin hesabına bağlanır; yayına girince **+50 Dada Puan** kazanırsın. Yazdıkların saklandı, girişten sonra **kendiliğinden gönderilir**.'});
          return;
        }
        gonder(v, el, kok.querySelectorAll('.gm-fe-kare').length);
      }));
      // Girişten sonra (üyelik sheet'i GM.tazele ile ekranı yeniden çizer) bekleyen taslak gönderilir.
      const t = GM.durum.oku(TASLAK, null);
      if (GM.uye() && t?.bekliyor && ctx.sorgu.hal !== 'gonderildi') setTimeout(() => { if (kok.isConnected) { GM.toast('Taslağın **gönderiliyor**', {ikon: 'gonder'}); gonder(t.v, kok.querySelector('[data-eylem="mo-gonder"]'), 0); } }, BEKLE());
      return () => c.forEach(x => x());
    }
  });
})();
