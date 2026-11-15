/* ARŞİV (Görev 12, silme yok): eski "Route · Ana yön" merkezi — 5a99326'daki #/rota ekranı, karar sayfası arşivi için #/ref/route-0'da.
   Yeni Dada Route patron belgesine göre #/rota'da (ekranlar/rota.js). Bu dosya değiştirilmez; yalnız karar sayfası arşivi açar. */
(() => {

  const R0 = () => GM.rotaBul('istanbul-izmir');
  const kapakli = r => GM.rotaKartVeri(r, {gorsel: GM.rotaDuraklari(r).find(d => d.mekan.kapakB)?.mekan.kapakB || GM.rotaDuraklari(r).find(d => d.mekan.kapak)?.mekan.kapak});
  const KATMAN_CIP = [{tur: 'neYenir', metin: 'Ne Yenir?'}, {tur: 'neAlinir', metin: 'Ne Alınır?'}, {tur: 'yakit', metin: 'Yakıt'}, {tur: 'sarj', metin: 'Şarj'}, {tur: 'ibadet', metin: 'İbadethane'}, {tur: 'dinlenme', metin: 'Dinlenme'}, {tur: 'karavan', metin: 'Karavan'}, {tur: 'cografi', metin: 'İl kimliği'}];

  GM.ekran('ref-route-0', {
    tur: 'sekme', nav: 'rota', ust: '#/alternatifler', baslik: 'Dada Route',
    bos: {ikon: 'rota', baslik: 'Henüz rotan yok', metin: 'İlk rotanı çiz; yol üstündeki **gurme duraklar** rotadan sapma süresiyle gelsin.', eylem: {metin: 'Rota planla', ikon: 'rota', git: '#/rota/planla'}},
    ciz: ctx => {
      const R = R0(), yolda = ctx.sorgu.yolda === '1', D = GM.rotaOneri(R);
      const sira = D.find(d => d.km > 300) || D[0], bal = (R.iller || []).find(i => i.ad === 'Balıkesir');
      const ust = GM.selamBas({gorsel: 'assets/gorsel/hero/sokak-dikey.webp', ust: yolda ? 'Yolculuk sürüyor · İstanbul – İzmir' : 'Dada Route', baslikHtml: yolda ? 'Sıradaki durak <em>yaklaşıyor</em>' : 'Yolun <em>lezzetini</em> planla', html: yolda
        ? GM.canliKart({etiket: 'Co-Pilot açık', baslik: sira.mekan.ad, alt: `Sıradaki durak · ${sira.km}. km · ${sira.mekan.ilce}`, sure: '1 sa 52 dk', ilerleme: bal ? bal.km / R.km : .55, cipler: [{tur: 'yakit', metin: 'Yakıt +2 dk'}, {tur: 'ibadet', metin: 'Mescit +3 dk'}], git: `#/rota/surus/${R.id}`})
        : GM.planlayici({})});
      const son = ['istanbul-bursa', 'izmir-cesme', 'istanbul-ankara'].map(GM.rotaBul).filter(Boolean);
      const hazir = ['istanbul-izmir', 'izmir-cesme', 'ankara-antalya', 'ankara-trabzon', 'istanbul-bursa'].map(GM.rotaBul).filter(Boolean);
      return ust + GM.bolumler([
        {html: GM.webdenRota({ust: 'Webden gönderildi · 2 dk önce', ad: 'İstanbul – Bursa', alt: '3 ara durak · İskender, kestane şekeri, Gemlik zeytini', git: '#/rota/istanbul-bursa'})},
        // Yalnız Gourmet: pilot rotanın lezzet profili (AllTrails profil kalıbı) — durak fotoğrafları km ekseninde, il kimliği düğümleri arada; dokununca kart değişir.
        yolda ? null : {baslik: `Yolun lezzeti · ${R.ad}`, eylem: 'Haritada', git: `#/rota/${R.id}`, html: GM.yigin([GM.p(`**${GM.rotaSayiMetin(R)}**; aradaki illerde coğrafi işaretli lezzetler. Fotoğrafa ya da ile dokun.`), GM.lezzetProfili(R, {duraklar: D, katman: GM.rotaKatmani(R)})], 12)},
        {baslik: 'Son rotaların', eylem: 'Tümü', git: '#/rota/rotalarim', html: GM.satirlar(son.map(r => GM.rotaKart(GM.rotaKartVeri(r), {tur: 'satir'})))},
        {baslik: 'Hazır rotalar', eylem: 'Tümü', git: '#/rota/hazir', html: GM.yatay(hazir.map((r, i) => GM.rotaKart(kapakli(r), {kayitli: i === 1})))},
        {baslik: 'Yol boyunca neler var?', html: GM.yigin([GM.p('Rotanı çizince **gurme durakların** yanında yolun ihtiyaçları da açılır; her biri rotadan **sapma süresiyle** gelir.'), GM.katmanCipler({ad: 'rota-katman-tanit', ogeler: KATMAN_CIP.map((k, i) => ({...k, secili: i < 2}))})], 12)},
        {html: GM.satirlar([{ikon: 'cevrimdisi', baslik: 'Çevrimdışı rotalar', alt: 'İnternet çekmeyen yolda harita, adres ve telefonlar', git: '#/rota/cevrimdisi', ok: true}, {ikon: 'gecmis', baslik: 'Seyahat günlüğü', alt: 'Tamamladığın rotalar ve ziyaret ettiğin duraklar', git: '#/rota/gunluk', ok: true}, {ikon: 'arac', baslik: 'Araç ekranı', alt: 'CarPlay ve Android Auto', git: '#/rota/arac', ok: true}])}
      ]);
    }
  });

  // ---------- (b) Planlama ----------
  // Rota seçenekleri: panelde Google Routes 3 alternatif döner (WEB-ENVANTERI §3.6); süre/km burada prototip örneğidir. Durak sayısı veriden: sapma toleransı içinde kalan mekânlar.
  const SECENEK = () => { const r = R0(), D = GM.rotaDuraklari(r); return [
    {id: 'lezzet', ikon: 'neYenir', ad: 'Lezzet yolu', dk: r.dk + 26, km: Math.round(r.km + 18), alt: `${GM.rotaSayi(r).onerilen} önerilen durak · Bursa üzerinden`},
    {id: 'hizli', ikon: 'bolt', ad: 'En hızlı', dk: r.dk, km: Math.round(r.km), alt: `${GM.rotaSayi(r).yolUstu} yol üstü durak · otoyol`},
    {id: 'sakin', ikon: 'leaf', ad: 'Sakin yol', dk: r.dk + 48, km: Math.round(r.km + 31), alt: 'Ücretli yol yok · köy lokantaları'}]; };
  // Web paritesi (Görev 11): pilot güzergâhlar (panelin 5 TR pilotu), ara durakta tahmini bekleme (15–90 dk), tolerans "Özel km" (2–30, web kaydırıcı), ara durak sınırı 3, Yeni rota.
  const PILOT = ['istanbul-izmir', 'istanbul-ankara', 'ankara-antalya', 'istanbul-bursa', 'izmir-cesme'];
  const pd = () => ({bekle: 45, tol: '10', km: 12, ...(GM.durum.oku('rota-planla', null) || {})});
  const pdYaz = d => GM.durum.yaz('rota-planla', {...pd(), ...d});
})();
