/* #/alternatifler — karar sayfası: 3 ekran × 3 çeşit. Her çeşit bir referans katmanından:
   A · Dada ailesi (Gastro/Diet mobil kanonu, tutarlılık) · B · Kategori (global restoran/rota/rehber uygulamaları) · C · Son nesil (ödüllü harita/rota/seyahat tasarımları).
   Bileşenler üçünde de aynı kanondan; değişen kompozisyon. Ayrıntı: docs/REFERANSLAR.md, docs/ALTERNATIFLER.md. */
(() => {
  const EKRAN = [
    {ad: 'Ana sayfa', ikon: 'kesfet', cesit: [
      ['A', 'Dada ailesi', 'Gastro “Ne pişirsem?” hero kalıbı: fotoğraf slayt, vurgulu başlık, sekmeli arama paneli (Rota / Mekân / Etkinlik), popüler çipler, sayı şeridi.', '#/alt/ana-a'],
      ['B', 'Kategori', 'Google Maps + Citymapper + Flighty: mor bant + planlayıcı, gerçek harita, Bugünün Rotası bileti, rotandaki duraklar.', '#/alt/ana-b'],
      ['C', 'Son nesil', 'Roadtrippers/Any Distance hikâye kapakları, Flighty canlı yolculuk kartı, AllTrails’ten lezzet profili şeridi.', '#/alt/ana-c']]},
    {ad: 'Mekân listesi', ikon: 'mekan', cesit: [
      ['A', 'Dada ailesi', 'Gastro liste-v2: banner başlık, yapışkan filtre ve sıralama, kart ızgarası.', '#/alt/liste-a'],
      ['B', 'Kategori', 'Google Maps/Resy: harita + sürüklenebilir liste sheet’i, kart ↔ pin senkronu.', '#/alt/liste-b'],
      ['C', 'Son nesil', 'AllTrails/The Infatuation/Watch Duty: büyük kart akışı, yüzen harita, araç sütunu.', '#/alt/liste-c']]},
    {ad: 'Mekân detay', ikon: 'rezervasyon', cesit: [
      ['A', 'Dada ailesi', 'Gastro detay-v2: fotoğraf banner, özet şeridi, yapışkan sekmeler, alt eylem çubuğu.', '#/alt/detay-a/mikla'],
      ['B', 'Kategori', 'Michelin/Resy: hero + rozet, 4’lü eylem şeridi, “Neden seviyoruz”, rezervasyon çubuğu.', '#/alt/detay-b/mikla'],
      ['C', 'Son nesil', 'Google Maps/Watch Duty: harita üstü yarım sheet, rota bağlamı (+dk sapma), yukarı çekince tam içerik.', '#/alt/detay-c/mikla']]},
    {ad: 'Dada Route (ayrı araştırma, ana yönler)', ikon: 'rota', cesit: [
      ['1', 'Rota merkezi', 'Orta düğme: planlayıcı, webden gelen rota, son rotalar, hazır rotalar, yol katmanları.', '#/rota'],
      ['2', 'Rota planlama', 'Duraklar (en çok 3 ara), Yakıtlı/Elektrikli, sapma toleransı, ihtiyaçlar → 3 rota seçeneği.', '#/rota/planla'],
      ['3', 'Rota haritası', 'Harita + 3 duraklı çekmece: Duraklar · Keşfet · İhtiyaçlar · Özet; pinde +dk sapma.', '#/rota/istanbul-izmir'],
      ['4', 'Co-Pilot', 'Koyu durak asistanı; 3 km kala sesli uyarı, Geç / Navigasyonda aç.', '#/rota/surus/istanbul-izmir?uyari=1']]}
  ];
  const EKRANLAR = [['ana', 'Ana sayfa'], ['liste', 'Mekân listesi'], ['detay', 'Mekân detay'], ['route', 'Dada Route ana ekranı']];
  GM.ekran('alternatifler', {
    tur: 'alt', baslik: 'Tasarım alternatifleri', ust: '#/kesfet', haller: false,
    ciz: () => `<div class="gm-ic gm-yigin-24">${GM.p('Dört ekran, her biri **yan yana çeşitleriyle**. Her kartın altında referans uygulama, ondan alınan kalıp ve bir cümlelik gerekçe var. Bileşenler hepsinde aynı kanondan (Gastro ve Diet mobille tutarlı).')}${GM.bilgi({etiket: 'Referans sırası', ikon: 'bilgi', metin: '1) Dada Gastro ve Dada Diet mobil · 2) Kategorideki global uygulamalar · 3) Ödüllü ve son nesil tasarımlar.'})}${EKRANLAR.map(([k, ad]) => { const l = GM.alternatifler(k); return `<section class="gm-yigin-12"><h2 class="gm-t-section">${GM.esc(ad)} · ${l.length} çeşit</h2>${GM.yatay(l.map(GM.alternatifKart))}</section>`; }).join('')}${GM.btn({metin: 'Masaüstünde yan yana aç', ikon: 'web', tur: 'secondary', tam: true, attrs: 'onclick="location.href=\'karar/\'"'})}</div>`
  });
})();
