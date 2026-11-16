/* Ana sayfa alternatifleri (karar için). B = ekranlar/kesfet.js (kategori: harita hero + Bugünün Rotası bileti).
   A · Dada ailesi: Gastro "Ne pişirsem?" / Diet Bugün hero kalıbı birebir (fotoğraf slayt hero, vurgulu başlık, sekmeli arama paneli, popüler çipler, sayı şeridi, gülücük alt kenar, alterne bölümler).
   C · Son nesil: rota hikâye kapakları (Roadtrippers/Any Distance/Strava) + lezzet profili şeridi (AllTrails yükseklik profili) + canlı yolculuk kartı (Flighty).
   Üçünde de web ana sayfa blokları aynı sırada (docs/WEB-ENVANTERI.md §1.3). */
(() => {
  const BUGUN = '2026-11-13';
  const ortak = () => {
    const R = GM.rotaBul('istanbul-izmir'), M = GMV.mekanlar;
    const duraklar = GM.rotaOneri(R).slice(0, 8), kullanilan = new Set(duraklar.map(d => d.slug));
    const konsept = (GMV.mekanSecenek.konsept || []).filter(k => k.sayi > 0 && !['rezervasyon-aliyor', 'online-rezervasyon', 'wifi', 'kredi-karti', 'bebek-sandalyesi', 'acik-alan'].includes(k.deger))
      .map(k => { const m = M.find(m => m.konsept.includes(k.ad) && m.kapak && !kullanilan.has(m.slug)); if (m) kullanilan.add(m.slug); return {k, m}; }).filter(x => x.m);
    const etk = GMV.etkinlikler.filter(e => e.gorsel && (e.bit || e.tarih) >= BUGUN).sort((a, b) => (b.yerel - a.yerel) || a.tarih.localeCompare(b.tarih)).slice(0, 4);
    const lez = GMV.lezzetler.filter(l => l.gorsel).sort((a, b) => b.tarih.split('.').reverse().join('').localeCompare(a.tarih.split('.').reverse().join(''))).slice(0, 8);
    const bloklar = {
      konsept: {baslik: 'Konseptler', eylem: 'Tamamını Gör', git: '#/mekanlar', html: GM.konseptSerit(konsept.map(x => ({ad: x.k.ad, alt: `${x.k.sayi} mekân`, gorsel: x.m.kapak, git: `#/mekanlar?konsept=${x.k.deger}`})))},
      // Görev 14/2 (patron): Konsept'in altında "Mekânlar" şeridi — önerilen sıradan, rota ve konsept kartlarında kullanılmamış kapaklı mekânlar.
      mekan: {baslik: 'Mekânlar', eylem: 'Tümü', git: '#/mekanlar', html: GM.yatay(GM.mekanSirala(M.filter(m => m.kapak && !kullanilan.has(m.slug)), 'onerilen').slice(0, 8).map(m => GM.mekanKart(m, {kayitli: GM.kayitliMekanlar().has(m.slug)})))},
      modul: {baslik: 'Nasıl keşfetmek istersin?', html: GM.modulIzgara([
        GM.modulKart({ikon: 'rota', baslik: 'Dada Route', alt: 'Yol üstü lezzet durakları', fiil: 'Rota çiz', git: '#/rota', ana: true}),
        GM.modulKart({ikon: 'bul', baslik: 'Mekân Bul', alt: '4 soruda sana uygun mekân', fiil: 'Başla', git: '#/mekan-bul'}),
        GM.modulKart({ikon: 'mekan', baslik: 'Mekânlar', alt: `${M.length} mekân, harita ve liste`, fiil: 'Gözat', git: '#/mekanlar', gorsel: GMV.mekanlar.filter(m => m.kapakB)[4]?.kapakB}),
        GM.modulKart({ikon: 'lezzet', baslik: 'Gurme Lezzetler', alt: 'Yöresel tatlar ve hikâyeleri', fiil: 'Keşfet', git: '#/lezzetler', gorsel: lez[0]?.gorsel})])},
      etkinlik: {baslik: 'Yaklaşan Etkinlikler', eylem: 'Tümü', git: '#/etkinlikler', html: GM.yatay(etk.map(e => GM.etkinlikKart(e)), {sinif: 'gm-ka-iki'})},
      lezzet: {baslik: 'Gurme Lezzetler', eylem: 'Tamamını Gör', git: '#/lezzetler', html: GM.yatay(lez.map(l => GM.icerikKart({gorsel: l.gorsel, kategori: l.kategori, baslik: l.ad, meta: l.sure, git: `#/lezzet/${l.slug}`, sinif: 'gm-ka-puf'})))},
      // Şehir rehberi (mobil ek; web ana sayfada yok, /sehir-rehberleri'nde yayındaki tek rehber İstanbul): sayılar yayındaki mekânlardan.
      rehber: (() => { const l = M.filter(m => m.il === 'İstanbul'), g = l.find(m => m.slug === 'mikla')?.kapakB || l.find(m => m.kapakB)?.kapakB; return {baslik: 'Şehir Rehberleri', eylem: 'Tümü', git: '#/rehberler', html: GM.seckiKapak({gorsel: g, rozet: {ikon: 'harita', metin: 'Şehir rehberi'}, baslik: 'İstanbul', alt: `<b>${GM.sayi(l.length)}</b> mekân · <b>${new Set(l.map(m => m.ilce)).size}</b> ilçe`, git: '#/rehber/istanbul'})}; })(),
      teaser: GM.teaser({ikon: 'bul', baslik: 'Ne aradığını bilmiyor musun?', metin: 'Bütçeni, ortamı ve mutfağı seç; **sana uygun mekânları** sıralayalım.', cipler: [['Kebap', 'kebap'], ['Deniz', 'deniz'], ['Kahvaltı', 'kahvalti'], ['Esnaf Lokantası', 'esnaf']].map(([m, k]) => ({metin: m, git: `#/mekanlar?ara=${k}`})), btn: {metin: 'Mekân Bul', ikon: 'bul', git: '#/mekan-bul'}, sinif: 'gm-ka-teaser'})
    };
    return {R, M, duraklar, etk, lez, bloklar};
  };

  // ---------- A · Dada ailesi ----------
  GM.ekran('ana-a', {
    tur: 'sekme', nav: 'kesfet', baslik: 'Keşfet', bos: {ikon: 'rota', baslik: 'Öneriler hazırlanıyor', metin: 'Yeni mekân ve rotalar yayına girince burada görünür. Şimdilik **mekânlara** göz atabilirsin.', eylem: {metin: 'Mekânları keşfet', ikon: 'mekan', git: '#/mekanlar'}},
    ustBar: () => ({saydam: true}),
    // Çekip yenile: etkinlik ve lezzet rayı veriden yeniden kurulur (sabit an GM.simdi).
    cekYenile: () => new Promise(r => setTimeout(r, GM.TK.motion.reveal * 2)),
    // Mekân kartı kalbi tek favori anahtarına yazar (GM.kaydetBagla; misafirde üye duvarı).
    sonra: kok => GM.kaydetBagla(kok),
    ciz: () => {
      const {R, M, duraklar, etk, lez, bloklar: B} = ortak();
      const slayt = GMV.mekanlar.filter(m => m.kapakB).sort((a, b) => (b.slug === 'narimor-urla') - (a.slug === 'narimor-urla')).slice(0, 3);
      const hero = GM.heroAna({
        etiket: 'Öne çıkan mekânlar',
        slaytlar: slayt.map(m => ({gorsel: m.kapakB, baslik: m.ad, alt: [m.kategori, GM.konumMetin(m)].filter(Boolean).join(' · '), git: `#/mekan/${m.slug}`})),
        sinif: 'gm-ka-hero',
        ustEtiket: 'Lezzetin rotası',
        baslikHtml: 'Nereye <em>gidiyoruz?</em>',
        altBaslik: 'Yol üstü lezzet durakları, tek rotada.',
        // Revize 16 Kas #1 (Beyar): "Rota Planla" sekmesi kalktı; Dada Route girişi alt menünün ortasındaki düğme. Varsayılan Mekân Ara.
        icerik: GM.aramaPanel({ad: 'ana-a-ara', secili: 'mekan', sekmeler: [
          {ad: 'Mekân Ara', deger: 'mekan', yer: 'Mekân, mutfak ya da semt ara', git: '#/ara', ikon: 'ara_'},
          {ad: 'Etkinlik', deger: 'etkinlik', yer: 'Festival, tadım, atölye ara', git: '#/etkinlikler', ikon: 'etkinlik'}]})
      });
      return hero + GM.bolumler([
        // Reklam yuvaları (lider kararı 15 Kas): patron kararına dek ekranda yer kaplamaz; yalnız DOM'da gizli işaret (Flutter yeri).
        {...B.konsept, html: B.konsept.html + GM.reklamIsaret('AS-T1')}, B.mekan, {...B.modul, html: B.modul.html + GM.reklamIsaret('AS-M1')}, B.etkinlik, B.lezzet, B.rehber, B.teaser + GM.reklamIsaret('AS-B1')
      ]);
    }
  });

  // ---------- C · Son nesil ----------
  GM.ekran('ana-c', {
    tur: 'sekme', nav: 'kesfet', baslik: 'Keşfet', bos: {ikon: 'rota', baslik: 'Bugünün rotası hazırlanıyor', metin: 'Pilot rota yayına girince burada görünür. Şimdilik **mekânlara** göz atabilirsin.', eylem: {metin: 'Mekânları keşfet', ikon: 'mekan', git: '#/mekanlar'}},
    ciz: () => {
      const {R, duraklar, bloklar: B} = ortak();
      const kapaklar = ['istanbul-izmir', 'izmir-cesme', 'istanbul-bursa', 'ankara-antalya', 'istanbul-ankara'].map(GM.rotaBul).filter(Boolean)
        .map((r, i) => GM.rotaKart(GM.rotaKartVeri(r, {etiket: i ? r.tema : 'Bugünün Rotası', gorsel: GM.rotaDuraklari(r).find(d => d.mekan.kapakB)?.mekan.kapakB || GM.rotaDuraklari(r).find(d => d.mekan.kapak)?.mekan.kapak}), {sinif: 'is-hikaye gm-ka-rk'}));
      const ust = GM.selamBas({gorsel: 'assets/gorsel/hero/sokak-panorama.webp', ust: 'Cuma, 13 Kasım · İstanbul', baslikHtml: 'Bugün <em>nereye</em>?', html: GM.planlayici({})});
      // Canlı kart (örnek an: Balıkesir'e girildi): sıradaki durak, kalan süre ve sıradaki yakıt/mescit rotadan hesaplanır; sabit sayı yazılmaz.
      const konum = (R.iller || []).find(i => i.ad === 'Balıkesir')?.km ?? R.km / 2, D = GM.rotaOneri(R), sira = D.find(d => d.km > konum) || D.at(-1);
      const kalan = Math.round(R.dk * Math.max(0, sira.km - konum) / R.km), siradaki = tur => GM.rotaKatmani(R, tur).filter(k => k.km > konum && !k.ornek).sort((a, b) => a.km - b.km)[0];
      const cip = (tur, ad) => { const k = siradaki(tur); return k ? {tur, metin: `${ad} · ${GM.sayi(k.km - konum)} km sonra`} : null; };
      const canli = GM.canliOzetKart({baslik: sira.mekan.ad, meta: `${sira.km}. km · ${sira.mekan.ilce} · varış ${GM.varisSaati(kalan)}`, sure: GM.sure(kalan), ilerleme: konum / R.km, cipler: [cip('yakit', 'Yakıt'), cip('ibadet', 'Mescit')].filter(Boolean), git: `#/rota/${R.id}`});
      return ust + GM.yatay(kapaklar, {sinif: 'is-hikaye'}) + GM.bolumler([
        {baslik: 'Canlı yolculuk', eylem: 'Rotayı aç', git: `#/rota/${R.id}`, html: canli},
        {baslik: 'Lezzet profili', eylem: 'Rotayı aç', git: `#/rota/${R.id}`, html: GM.lezzetProfili(R, {duraklar: GM.rotaOneri(R), katman: GM.rotaKatmani(R)})},
        B.konsept, GM.reklamYeri({kod: 'AS-T1'}), B.modul, GM.reklamYeri({kod: 'AS-M1'}), B.etkinlik, B.lezzet, B.teaser, GM.reklamYeri({kod: 'AS-B1'})
      ]);
    }
  });
})();
/* Mevcut A/B/C kayıtları (karar sayfası) */
[
  {ekran: 'ana', kod: 'ana-a', sira: 1, ad: 'Ana · A Dada ailesi', referans: 'Dada Gastro "Ne pişirsem?" + Dada Diet Bugün', alinan: 'Fotoğraf slayt hero, vurgulu başlık, sekmeli arama paneli, popüler çipler, sayı şeridi, gülücük alt kenar.', gerekce: 'Gastro ve Diet ile birebir aile; kullanıcı üç uygulamada aynı ana sayfayı tanır.', iyilesti: 'Bugünün Rotası kartında şimdi çıkarsan varış saati; konseptler web sırasında; ekranda ham sınıf kalmadı (GM.yigin, GM.modulIzgara); boş hâl metni. Yığılma turu: slaytta tür ve konum tek satır, rota kartında etiket foto üstü rozet, etkinlik ve lezzet kartlarında tür foto üstünde + ad tek satır, sayı şeridi ve Mekân Bul çipleri hiçbir genişlikte kırılmaz.', git: '#/alt/ana-a'},
  {ekran: 'ana', kod: 'ana-b', sira: 2, ad: 'Ana · B Kategori', referans: 'Uber + Google Maps + Apple Maps + Citymapper + Flighty', alinan: 'Uber ana ekranı: tam ekran canlı harita, üstte yüzen "Nereye gidiyorsun?" planlayıcısı ve rota çipleri, üç konumlu alt sayfa ve iç kaydırma devri (Apple Maps), yukarıda arama hapına dönen planlayıcı; Google Maps "Bu alanda ara"; Flighty bileti.', gerekce: 'Dada Route bir harita ürünü; harita ilk ekranda canlı, pin ya da rota çipi tek dokunuşta alt sayfayı o mekâna/rotaya çevirir.', iyilesti: 'Tek hareket modeli: bant, planlayıcı, arama hapı, rota çipleri, harita ve üst bar tek sayfa konumuna bağlı birlikte oynar (harita · orta · tam); sürükleme + tekerlek/trackpad + iç kaydırma devri, haritayı sürüklemek sayfayı indirir; 203 gerçek pin, rota çipi haritayı uçurur, Bu alanda ara.', git: '#/alt/ana-b'},
  {ekran: 'ana', kod: 'ana-c', sira: 3, ad: 'Ana · C Son nesil', referans: 'Roadtrippers + Any Distance + Flighty + AllTrails', alinan: 'Rota hikâye kapakları, canlı yolculuk kartı, km eksenli lezzet profili.', gerekce: 'Rotayı hikâye gibi anlatır; yolculuk sürerken canlı durum öne çıkar.', iyilesti: 'Canlı kartta sabit yazılmış süre ve +dk çipleri kalktı: kalan süre, varış, sıradaki yakıt/mescit rotadan hesaplanıyor; ilk kapak Bugünün Rotası etiketli; eksik AS-T1/AS-B1 yerleri eklendi. Yığılma turu: hikâye kapaklarında etiket rozet, özet tek satır; canlı kart iki satır (durak + kalan süre · km, ilçe, varış, yakıt çipi); kartlarda en çok iki satır.', git: '#/alt/ana-c'},
  {ekran: 'liste', kod: 'liste-a', sira: 1, ad: 'Liste · A Dada ailesi', referans: 'Dada Gastro liste-v2', alinan: 'Fotoğraflı başlık, yapışkan arama ve süzgeç, kategori çipleri, ızgara/liste.', gerekce: 'Gastro/Diet listesiyle aynı davranış; öğrenme maliyeti yok.', git: '#/alt/liste-a'},
  {ekran: 'liste', kod: 'liste-b', sira: 2, ad: 'Liste · B Kategori', referans: 'Google Maps + Resy', alinan: 'Arkada harita, 3 duraklı liste çekmecesi, kart ↔ pin senkronu.', gerekce: 'Mekânın nerede olduğu karar için ilk bilgi; harita ve liste tek ekranda.', git: '#/alt/liste-b'},
  {ekran: 'liste', kod: 'liste-c', sira: 3, ad: 'Liste · C Son nesil', referans: 'The Infatuation + AllTrails + Watch Duty', alinan: 'Koleksiyon sekmeleri, rehber manşeti, numaralı büyük kartlar, yüzen harita + araç sütunu.', gerekce: 'Editoryal rehber hissi; Gourmet’in seçki ürünü olduğunu vurgular.', git: '#/alt/liste-c'},
  {ekran: 'detay', kod: 'detay-a', sira: 1, ad: 'Detay · A Dada ailesi', referans: 'Dada Gastro detay-v2', alinan: 'Fotoğraf banner, özet şeridi, yapışkan sekmeler, alt eylem çubuğu.', gerekce: 'Gastro tarif detayıyla aynı iskelet; tutarlılık en yüksek.', git: '#/alt/detay-a/mikla'},
  {ekran: 'detay', kod: 'detay-b', sira: 2, ad: 'Detay · B Kategori', referans: 'Michelin Guide + Resy + Google Maps', alinan: 'Galeri hero, rozetler, 4’lü eylem şeridi, "Neden seviyoruz", yapışkan rezervasyon.', gerekce: 'Restoran uygulamalarının alıştırdığı düzen; rezervasyon her an elde.', git: '#/alt/detay-b/mikla'},
  {ekran: 'detay', kod: 'detay-c', sira: 3, ad: 'Detay · C Son nesil', referans: 'Google Maps + Watch Duty + Roadtrippers', alinan: 'Harita üstü 3 duraklı detay sheet’i, rota bağlamı (+dk, km).', gerekce: 'Dada Route’tan gelen kullanıcı haritadan kopmadan karar verir.', git: '#/alt/detay-c/mikla'},
  {ekran: 'route', kod: 'route-a', sira: 1, ad: 'Route · Ana yön (araştırma)', referans: 'Gastro orta düğme sheet’i + Roadtrippers + Waze + Flighty', alinan: 'Merkez: planlayıcı, webden rota, son ve hazır rotalar; harita + Duraklar/Keşfet/İhtiyaçlar/Özet çekmecesi.', gerekce: 'DADA-ROUTE-REFERANS §6 ana yönleri; aileyle tutarlı.', git: '#/rota'}
].forEach(GM.alternatifKaydet);
