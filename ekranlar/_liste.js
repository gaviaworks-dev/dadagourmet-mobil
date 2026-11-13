/* Ekran dosyaları ve rota tablosu (ortak dosya, yalnız lead değiştirir). 404 olan dosya sessizce atlanır. */
window.GM_EKRAN_DOSYALARI = ['gecici', 'katalog', 'kesfet', 'ana-alternatif', 'mekanlar', 'mekan', 'alternatifler', 'rota', 'rota-ek', 'ekranlar', 'ana-ref', 'liste-ref', 'detay-ref', 'route-ref', 'widget'];
window.GM_ROTALAR = {
  '#/kesfet': 'kesfet', '#/mekan-bul': 'mekan-bul', '#/rota': 'rota', '#/rota/planla': 'rota-planla', '#/rota/ozet/:id': 'rota-ozet', '#/rota/telefon': 'rota-telefon', '#/rota/arac': 'rota-arac', '#/rota/cevrimdisi': 'rota-cevrimdisi', '#/rota/gunluk': 'rota-gunluk', '#/rota/rotalarim': 'rota-rotalarim', '#/rota/hazir': 'rota-hazir', '#/ekranlar': 'ekranlar', '#/widget/:no': 'widget', '#/yer/:kod': 'yer', '#/ref/ana-1': 'ref-ana-1', '#/ref/liste-1': 'ref-liste-1', '#/ref/detay-1/:slug': 'ref-detay-1', '#/ref/route-1': 'ref-route-1', '#/ref/ana-2': 'ref-ana-2', '#/ref/liste-2': 'ref-liste-2', '#/ref/detay-2/:slug': 'ref-detay-2', '#/ref/route-2': 'ref-route-2', '#/ref/ana-3': 'ref-ana-3', '#/ref/liste-3': 'ref-liste-3', '#/ref/detay-3/:slug': 'ref-detay-3', '#/ref/route-3': 'ref-route-3', '#/ref/ana-4': 'ref-ana-4', '#/ref/liste-4': 'ref-liste-4', '#/ref/detay-4/:slug': 'ref-detay-4', '#/ref/route-4': 'ref-route-4', '#/rota/surus/:id': 'rota-surus', '#/rota/:id': 'rota-harita', '#/etkinlikler': 'etkinlikler', '#/profil': 'profil', '#/hata': 'hata',
  '#/harita-deneme': 'harita-deneme', '#/katalog': 'katalog', '#/alternatifler': 'alternatifler',
  '#/alt/ana-a': 'ana-a', '#/alt/ana-b': 'kesfet', '#/alt/ana-c': 'ana-c',
  '#/mekanlar': 'mekanlar-a', '#/alt/liste-a': 'mekanlar-a', '#/alt/liste-b': 'mekanlar-b', '#/alt/liste-c': 'mekanlar-c',
  '#/mekan/:slug': 'mekan-a', '#/alt/detay-a/:slug': 'mekan-a', '#/alt/detay-b/:slug': 'mekan-b', '#/alt/detay-c/:slug': 'mekan-c'
};
window.GM_YONLENDIR = {};
