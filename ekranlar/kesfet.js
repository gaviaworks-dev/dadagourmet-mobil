/* Keşfet (ana sayfa, B · Kategori) — Uber ana ekranı kalıbı, TEK hareket modeli (kanon/gm-k-ana.js GM.uberEkran + GM.uberBagla):
   tam ekran canlı harita arkada; alt sayfa üç konumda (harita · orta · tam). Bant, planlayıcı, arama hapı, rota çipleri, harita ve üst bar aynı sayfa konumuna bağlı birlikte hareket eder:
   yukarı → bant kısalır/solar, planlayıcı üst barın altındaki arama hapına döner; aşağı → bant çıkar, harita tam ekran, üstte hap + çipler, altta sayfa başlığı.
   Jestler: sürükleme (tutamak, başlık, içerik, bant), tekerlek/trackpad, iç kaydırma devri, haritayı sürüklemek sayfayı indirir, tutamağa dokunmak sıradaki konum.
   Haritada gerçek veri: 203 mekân pini (kümeli; dokununca sayfada mekân kartı), Bugünün Rotası çizgisi (açılışta canlanır); rota çipi haritayı o rotaya uçurur. Haritayı sürükleyince "Bu alanda ara".
   Web ana sayfa blok sırası sayfada korunur (docs/WEB-ENVANTERI.md §1.3): 1 Bugünün Rotası (bilet) + güven satırı · 2 Konseptler · AS-T1 · 3 Nasıl keşfetmek istersin? · AS-M1 · 4 Yaklaşan Etkinlikler · 5 Gurme Lezzetler · 6 Mekân Bul çağrısı · AS-B1.
   Mobil ekstra (öneri, webde yok): "Rotadaki duraklar" şeridi ve hazır rota çipleri (pilot rotalar). */
(() => {
  const BUGUN = '2026-11-13';
  const veri = () => {
    const R = GM.rotaBul('istanbul-izmir'), M = GMV.mekanlar;
    const duraklar = GM.rotaOneri(R).slice(0, 8), kullanilan = new Set(duraklar.map(d => d.slug));
    const konsept = (GMV.mekanSecenek.konsept || []).filter(k => k.sayi > 0 && !['rezervasyon-aliyor', 'online-rezervasyon', 'wifi', 'kredi-karti', 'bebek-sandalyesi', 'acik-alan'].includes(k.deger))
      .map(k => { const m = M.find(m => m.konsept.includes(k.ad) && m.kapak && !kullanilan.has(m.slug)); if (m) kullanilan.add(m.slug); return {k, m}; }).filter(x => x.m);
    const etk = GMV.etkinlikler.filter(e => e.gorsel && (e.bit || e.tarih) >= BUGUN).sort((a, b) => (b.yerel - a.yerel) || a.tarih.localeCompare(b.tarih)).slice(0, 4);
    const lez = GMV.lezzetler.filter(l => l.gorsel).sort((a, b) => b.tarih.split('.').reverse().join('').localeCompare(a.tarih.split('.').reverse().join(''))).slice(0, 8);
    const rotalar = [R, ...GMV.rotalar.filter(r => r.id !== R.id && r.cizgi?.length)];
    return {R, M, duraklar, konsept, etk, lez, rotalar};
  };
  const HARITA = 'kesfet-harita';
  // Rota bileti (Flighty): kalkış ●──● varış, km · süre · tek kaynak durak sayısı, şimdi çıkarsan varış saati.
  const bilet = (r, bugun) => GM.rotaBilet(r, {etiket: bugun ? r.tema : 'Dada Route', rozet: 'Pilot rota', ozet: `<b>${GM.sayi(r.km)} km</b> · ${GM.sure(r.dk)} · ${GM.rotaSayiMetin(r)}<br>Şimdi çıkarsan varış <b>${GM.varisSaati(r.dk)}</b>`,
    eylem: GM.btn({metin: 'Rotayı aç', ikon: 'harita', git: `#/rota/${r.id}`}) + GM.ikonBtn({ikon: 'paylas', etiket: 'Rotayı paylaş', tur: 'kutu', veri: {eylem: 'rota-paylas', rota: r.id}})});
  // Sayfa başlığı (harita konumunda da görünen tek satır): rota · km · yol üstü durak sayısı (GM.rotaSayi, tek kaynak).
  const ozet = (r, bugun) => GM.cekmeceOzet({baslik: bugun ? 'Bugünün Rotası' : r.ad, alt: `${GM.esc(bugun ? r.ad : r.tema)} · ${GM.sayi(r.km)} km · ${GM.rotaSayi(r).yolUstu} yol üstü`});
  const durakBolum = r => GM.bas('Rotadaki duraklar', {metin: 'Haritada', git: `#/rota/${r.id}`}) + GM.yatay(GM.rotaOneri(r).slice(0, 8).map(d => GM.mekanKart(d.mekan, {sapma: {dk: d.sapma, km: d.km}})));

  GM.ekran('kesfet', {
    tur: 'sekme', nav: 'kesfet', baslik: 'Keşfet',
    bos: {ikon: 'rota', baslik: 'Bugünün rotası hazırlanıyor', metin: 'Pilot rota yayına girince burada görünür. Şimdilik **mekânlara** göz atabilirsin.', eylem: {metin: 'Mekânları keşfet', ikon: 'mekan', git: '#/mekanlar'}},
    ciz: () => {
      const {R, M, konsept, etk, lez, rotalar} = veri();
      const govde = GM.uberSecim(bilet(R, true))
        + GM.guvenSerit([{ikon: 'mekan', metin: `<b>${M.length}</b> mekân yayında`}, {ikon: 'rota', metin: 'Lezzet rotası planlama'}, {ikon: 'etkinlik', metin: 'Haftalık festival takvimi'}])
        + GM.bolumler([
          {id: 'kesfet-duraklar', html: durakBolum(R)},
          {baslik: 'Konseptler', eylem: 'Tamamını Gör', git: '#/mekanlar', html: GM.konseptSerit(konsept.map(x => ({ad: x.k.ad, alt: `${x.k.sayi} mekân`, gorsel: x.m.kapak, git: `#/mekanlar?konsept=${x.k.deger}`})))},
          GM.reklamYeri({kod: 'AS-T1'}),
          {baslik: 'Nasıl keşfetmek istersin?', html: GM.modulIzgara([
            GM.modulKart({ikon: 'rota', baslik: 'Dada Route', alt: 'Yol üstü lezzet durakları', fiil: 'Rota çiz', git: '#/rota', ana: true}),
            GM.modulKart({ikon: 'bul', baslik: 'Mekân Bul', alt: '4 soruda sana uygun mekân', fiil: 'Başla', git: '#/mekan-bul'}),
            GM.modulKart({ikon: 'mekan', baslik: 'Mekânlar', alt: `${M.length} mekân, harita ve liste`, fiil: 'Gözat', git: '#/mekanlar', gorsel: M.filter(m => m.kapakB)[4]?.kapakB}),
            GM.modulKart({ikon: 'lezzet', baslik: 'Gurme Lezzetler', alt: 'Yöresel tatlar ve hikâyeleri', fiil: 'Keşfet', git: '#/lezzetler', gorsel: lez[0]?.gorsel})])},
          GM.reklamYeri({kod: 'AS-M1'}),
          {baslik: 'Yaklaşan Etkinlikler', eylem: 'Tümü', git: '#/etkinlikler', html: GM.yatay(etk.map(e => GM.etkinlikKart(e)), {sinif: 'gm-ka-iki'})},
          {baslik: 'Gurme Lezzetler', eylem: 'Tamamını Gör', git: '#/lezzetler', html: GM.yatay(lez.map(l => GM.icerikKart({gorsel: l.gorsel, kategori: l.kategori, baslik: l.ad, meta: l.sure, git: `#/lezzet/${l.slug}`, sinif: 'gm-ka-puf'})))},
          GM.teaser({ikon: 'bul', baslik: 'Ne aradığını bilmiyor musun?', metin: 'Bütçeni, ortamı ve mutfağı seç; **sana uygun mekânları** sıralayalım.', cipler: [['Kebap', 'kebap'], ['Deniz', 'deniz'], ['Kahvaltı', 'kahvalti'], ['Esnaf Lokantası', 'esnaf']].map(([m, k]) => ({metin: m, git: `#/mekanlar?ara=${k}`})), btn: {metin: 'Mekân Bul', ikon: 'bul', git: '#/mekan-bul'}, sinif: 'gm-ka-teaser'}),
          GM.reklamYeri({kod: 'AS-B1'})
        ]);
      return GM.uberEkran({
        gorsel: 'assets/gorsel/hero/sokak-dikey.webp', baslik: 'Lezzetin <em>rotasını</em> keşfet', ust: GM.planlayici({}), hap: {metin: 'Nereye gidiyorsun?'},
        cipler: GM.rotaCipSerit(rotalar.map((r, i) => ({id: r.id, metin: i ? r.ad : 'Bugünün Rotası', ikon: i ? 'rota' : 'yildiz'})), {secili: R.id}),
        etiket: 'Mekânlar ve Bugünün Rotası haritası',
        harita: {ad: HARITA, kume: true, koridor: true, rota: {cizgi: R.cizgi}, merkez: [30.4, 37.6], zoom: 5.2,
          pinler: M.filter(m => m.lng && m.lat).map(m => ({id: m.slug, lng: m.lng, lat: m.lat, tur: 'mekan', ad: m.ad}))},
        ozet: ozet(R, true), html: govde
      });
    },
    sonra: kok => {
      const {R, M} = veri();
      let rota = R, U = null;
      // Rotaya dön: seçili mekân kartı / alan listesi kapanır, bilet geri gelir, harita rotaya yeniden oturur.
      const rotayaDon = u => { u.pinKart?.(null); u.secimYaz(bilet(rota, rota === R)); u.ozetYaz(ozet(rota, rota === R)); u.kapatGoster(false); GM.haritaSec(u.el, ''); };
      const t = GM.uberBagla(kok, {
        hazir: u => { U = u; },
        kapat: () => uDon(),
        ilk: u => u.ciz(R.cizgi),
        rotaSec: (id, u) => {
          U = u; rota = GM.rotaBul(id) || R; rotayaDon(u);
          const s = kok.querySelector('#kesfet-duraklar'); if (s) s.innerHTML = durakBolum(rota);
          u.ciz(rota.cizgi); u.git('orta');
        },
        pinSec: (id, u) => {
          U = u; const m = GM.mekan(id); if (!m) return;
          const d = GM.rotaOneri(rota).find(x => x.slug === id);
          // Yüzen mekân kartı (Airbnb/Google Maps): sayfa gizlenir, kart alt menünün üstünde tamamen görünür; ikincil eylem gerçek: rotadaki durağı rotaya ekler (rota ekranı ile aynı durum anahtarı).
          u.pinKart(GM.pinKart(m, {durum: d ? {sapma: {dk: d.sapma, km: d.km}} : {},
            eylem: GM.btn({metin: 'Mekânı aç', boyut: 'sm', git: `#/mekan/${m.slug}`}) + (d ? GM.btn({metin: 'Rotaya ekle', tur: 'ikincil', boyut: 'sm', veri: {eylem: 'pin-rotaya-ekle', id: m.slug}}) : GM.btn({metin: 'Rota çiz', tur: 'ikincil', boyut: 'sm', git: '#/rota/planla'}))}));
          u.sec(id);
        },
        alan: (b, u) => {
          U = u; const l = M.filter(m => m.lng && m.lat && b.contains([m.lng, m.lat]));
          u.secimYaz(l.length
            ? GM.mekanSatirlar(l.slice(0, 5).map(m => GM.mekanKart(m, {tur: 'satir'}))) + (l.length > 5 ? GM.btn({metin: `${l.length} mekânın tümünü gör`, ikon: 'mekan', tur: 'ikincil', tam: true, git: '#/mekanlar'}) : '') + GM.btn({metin: 'Rotaya dön', ikon: 'rota', tur: 'metin', tam: true, veri: {eylem: 'rotaya-don'}})
            : GM.bos({ikon: 'harita', baslik: 'Bu alanda mekân yok', metin: 'Haritayı kaydır ya da **uzaklaş**; kümeler mekân sayısını gösterir.', eylem: {metin: 'Rotaya dön', ikon: 'rota', tur: 'ikincil', veri: {eylem: 'rotaya-don'}}}));
          u.ozetYaz(GM.cekmeceOzet({baslik: `Bu alanda ${GM.sayi(l.length)} mekân`, alt: 'Haritada görünen alan'})); u.kapatGoster(true);
          u.git('orta');
        }
      });
      const uDon = () => { if (!U) return; rotayaDon(U); U.ciz(rota.cizgi); };
      const a = GM.eylem(kok, 'rota-paylas', el => { const r = GM.rotaBul(el.dataset.rota) || R; GM.paylas({baslik: r.ad, url: `https://dadagourmet.com/dada-route/${r.id}`}); });
      const b = GM.eylem(kok, 'rotaya-don', uDon), f = GM.eylem(kok, 'pin-kapat', uDon);
      const c = GM.kaydetBagla(kok);
      const e = GM.eylem(kok, 'pin-rotaya-ekle', el => { const k = `rota-${rota.id}`, dd = GM.durum.oku(k, null) || {eklenen: [], sekme: 'kesfet', katman: ['neYenir', 'sarj', 'ibadet']}; if (!dd.eklenen.includes(el.dataset.id)) dd.eklenen.push(el.dataset.id); GM.durum.yaz(k, dd); const x = GM.rotaOneri(rota).find(y => y.slug === el.dataset.id); GM.toast(`${rota.ad} rotasına eklendi · **+${x?.sapma || 1} dk**`, {tur: 'basari'}); el.disabled = true; });
      return () => { t(); a(); b(); c(); e(); f(); };
    }
  });
})();
