/* Mekânlar listesi — üç alternatif (web /mekanlar, docs/WEB-ENVANTERI.md §1.2, §2.1, §2.4). Web özelliği eksiltilmez: 14 süzgeç grubu sayılarıyla, 8 sıralama, liste/harita, konum hiyerarşisi (ülke → şehir → ilçe → semt), 24'lük sayfa (sonsuz kaydırma).
   A · Dada ailesi: Gastro liste-v2 kalıbı (kubbe başlık + yapışkan araç + sonuç satırı + ızgara/liste).
   B · Kategori: Google Maps / Resy — arkada gerçek harita, üç duraklı çekmece, satır ↔ pin senkronu, yüzen Liste/Harita geçişi.
   C · Son nesil: The Infatuation rehber manşeti + numaralı editoryal kartlar + AllTrails yüzen Harita düğmesi; harita kipinde Watch Duty sağ araç sütunu ve pinle senkron kart şeridi.
   Puan, yorum, görüntülenme uydurulmaz (★ –). Kaydet misafirde üye duvarını açar (GM.kaydetBagla). */
(() => {
  const M = () => GMV.mekanlar, S = () => GMV.mekanSecenek;
  const SAYFA = 24, BEKLE = () => (GM.azHareket() ? 0 : GM.TK.motion.oneri.skeletonDelay);
  const VESILE_IKON = {'ozel-gunler': 'champagne-glasses', 'romantik-bulusma': 'heart', 'is-yemegi': 'briefcase', 'turistik-kesif': 'camera', 'arkadas-bulusmasi': 'user-group', 'uzun-sohbet': 'comment-dots', 'kahvalti': 'mug-saucer', 'dogum-gunu': 'cake-candles', 'aile-yemegi': 'children', 'gece-yemekleri': 'moon', 'evlilik-teklifi': 'ring', 'grup-yemekleri': 'users', 'hizli-yemek': 'bolt', 'aksam-yemegi': 'utensils'};
  const SIRA_AD = Object.fromEntries(GM.MEKAN_SIRALA.map(([v, a]) => [v, a]));

  // ---------- Ortak durum ve davranış ----------
  // Durum: {secili:{grup:[deger]}, q, sira, gorunum}; sorgudan başlar (#/mekanlar?konsept=sef-restorani, ?ara=kebap, ?il=istanbul).
  const durumKur = ctx => { const s = {}; GM.MEKAN_GRUPLAR.forEach(([g]) => { if (ctx.sorgu[g]) s[g] = String(ctx.sorgu[g]).split(','); }); return {hash: ctx.hash, secili: s, q: ctx.sorgu.ara || '', sira: 'onerilen', gorunum: 'izgara', sayfa: 1}; };
  const konumAl = s => ({il: s.il?.length === 1 ? s.il[0] : null, ilce: s.il?.length <= 1 && s.ilce?.length === 1 ? s.ilce[0] : null, semt: s.il?.length <= 1 && s.ilce?.length <= 1 && s.semt?.length === 1 ? s.semt[0] : null, ek: s.il?.length > 1 ? `${s.il.length} şehir` : null});
  const konumKoy = (s, k) => { s.il = k.il ? [k.il] : []; s.ilce = k.ilce ? [k.ilce] : []; s.semt = k.semt ? [k.semt] : []; };
  const sonuc = (d, kaynak = M()) => GM.mekanSirala(GM.mekanSuz(kaynak, d.secili, d.q), d.sira);
  const kayitli = () => GM.kayitliMekanlar();
  const bos = d => GM.bos({ikon: 'mekan', baslik: 'Bu filtreyle henüz mekân yok', metin: d.q ? `“${d.q}” için **eşleşen mekân** bulamadık. Aramayı kısaltmayı ya da süzgeçleri gevşetmeyi dene.` : 'Süzgeçleri **gevşetmeyi** ya da başka bir şehir seçmeyi dene.', eylem: {metin: 'Filtreleri temizle', tur: 'secondary', ikon: 'yenile', veri: {eylem: 'temizle'}}});
  const siralaAc = (d, f) => GM.siralaSheet({baslik: 'Sırala', secenekler: GM.MEKAN_SIRALA, secili: d.sira, sec: v => {
    d.sira = v; f();
    if (v === 'yakin') GM.toast('Konumun paylaşılmadı; **Önerilen** sırası gösteriliyor', {ikon: 'konum'});
    else if (v === 'puan' || v === 'yorum') GM.toast('Henüz değerlendirme yok; **Önerilen** sırası gösteriliyor', {ikon: 'yildiz'});
  }});
  const filtreAc = (d, f) => GM.mekanFiltreSheet({secili: d.secili, q: d.q, uygula: s => { d.secili = s; f(); }});
  const konumAc = (d, f) => GM.konumSheet({secili: konumAl(d.secili), sec: k => { konumKoy(d.secili, k); f(); }});
  // Arama: 250 ms sonra süzer (motion.oneri.inputDebounce); temizle düğmesi aynı olayı atar.
  const aramaBagla = (kok, d, f) => { let z; const h = ev => { if (!ev.target.matches('input[name="q"]')) return; clearTimeout(z); z = setTimeout(() => { d.q = ev.target.value; f(); }, GM.TK.motion.oneri.inputDebounce); }; kok.addEventListener('input', h); return () => { clearTimeout(z); kok.removeEventListener('input', h); }; };
  const cipEsle = (kok, ad, secili) => kok.querySelectorAll(`[data-cip-grup][data-ad="${ad}"] [data-cip]`).forEach(b => b.setAttribute('aria-pressed', [].concat(secili).includes(b.dataset.cip)));
  const kaydirUst = (kok, el) => { const k = kok.querySelector('.gm-kaydir'); if (!k || !el) return; const ust = el.getBoundingClientRect().top - k.getBoundingClientRect().top; if (ust < 0) k.scrollTo({top: k.scrollTop + ust - GM.TK.space[64] * 2, behavior: GM.azHareket() ? 'auto' : 'smooth'}); };
  const ozetMetin = (d, n) => [GM.konumYaz(konumAl(d.secili)).at(-1), SIRA_AD[d.sira].toLocaleLowerCase('tr') + ' sırada'].join(' · ');
  const temizle = (kok, d) => { d.secili = {}; d.q = ''; kok.querySelectorAll('input[name="q"]').forEach(i => { i.value = ''; i.closest('.gm-girdi')?.classList.remove('has-text'); }); };

  // ================= A · Dada ailesi (Gastro liste-v2) =================
  let A = null;
  // Dada Route bağlamı (Gourmet'e özgü): yol üstü durak kartında foto rozeti, liste görünümünde sapma.
  const aKart = (m, d, ks) => { const b = GM.mekanRotada(m.slug); return GM.mekanKart(m, {tur: d.gorunum === 'liste' ? 'yatay' : 'kompakt', kayitli: ks.has(m.slug), etiket: b?.uzak <= 1 ? 'Yol üstü' : null, etiketTon: 'basari', etiketIkon: 'yolUstu', sapma: d.gorunum === 'liste' && b ? {dk: b.sapma, km: b.km} : null}); };
  // Yığılma kuralı 2: konum seçici tek başına satır değil; sonuç satırında sayının solunda kompakt etiket.
  const aKonum = (d, n) => GM.konumSecici({konum: konumAl(d.secili), tur: 'etiket', sayi: n});
  const aSonuc = d => {
    const l = sonuc(d), ks = kayitli();
    const durum = GM.listeDurum({sayi: l.length, birim: 'mekân', gorunum: d.gorunum, siraliAktif: d.sira !== 'onerilen', on: aKonum(d, l.length)});
    return {l, html: l.length ? durum + GM.listeSonuc(l.slice(0, SAYFA).map(m => aKart(m, d, ks)), {gorunum: d.gorunum}) : durum + aBos(d)};
  };
  const kategoriSerit = d => GM.cipSerit({ad: 'kategori', tur: 'tek', etiket: 'Mekân kategorisi', secili: d.secili.kategori?.[0] ?? '', ogeler: [{metin: 'Tümü', deger: '', ikon: 'mekan'}, ...S().kategori.map(k => ({metin: k.ad, deger: k.deger, sayi: k.sayi, gorsel: M().find(m => m.f.kategori?.includes(k.deger) && m.kapak)?.kapak}))]});
  const vesileTema = d => GM.listeTema({ad: 'vesile', tur: 'coklu', baslik: 'Ne için arıyorsun?', etiket: 'Deneyim ve kullanım amacı', secili: d.secili.vesile || [], ogeler: [...S().vesile].filter(v => v.deger !== 'aksam-yemegi').sort((a, b) => b.sayi - a.sayi).slice(0, 10).map(v => ({metin: v.ad, deger: v.deger, sayi: v.sayi, ikon: VESILE_IKON[v.deger]}))});

  // A boş sonuç: süzgeç/arama eşleşmedi (Gastro "Süzgeçleri temizle"); sonuç sayısı satırı yerinde kalır.
  const aBos = d => GM.bos({ikon: 'mekan', baslik: 'Bu süzgeçle mekân yok', metin: d.q ? `“${d.q}” için **eşleşen mekân** bulamadık. Aramayı kısaltmayı ya da süzgeçleri gevşetmeyi dene.` : 'Seçtiğin süzgeçlere uyan mekân yok. **Süzgeçleri gevşet** ya da başka bir şehir seç.', eylem: {metin: 'Süzgeçleri temizle', tur: 'secondary', ikon: 'yenile', veri: {eylem: 'temizle'}}, ikincil: {metin: 'Mekân Bul ile ara', git: '#/mekan-bul'}});
  // Ekrana özgü hâl: ?hal=sonuc-yok → kayıt olmayan fiyat süzgeci (Ekonomik ₺) seçili açılır; "Süzgeçleri temizle" gerçekten temizler.
  const aDurumKur = ctx => { const d = durumKur(ctx); if (ctx.sorgu.hal === 'sonuc-yok') d.secili.fiyat = ['1']; return d; };

  GM.ekran('mekanlar-a', {
    tur: 'banner', baslik: 'Mekânlar', ust: '#/kesfet', iskelet: 'kart',
    // İlk açılışta iskelet (Gastro liste-v2): veri yerelde, kısa bekleme kanon skeletonDelay.
    yukle: () => new Promise(r => setTimeout(r, BEKLE())),
    cekYenile: () => new Promise(r => setTimeout(r, GM.TK.motion.reveal * 2)),
    bos: {ikon: 'mekan', baslik: 'Henüz mekân eklenmedi', metin: 'Yeni mekânlar **eklendikçe** burada listelenecek.', eylem: {metin: 'Keşfet’e dön', tur: 'secondary', yerine: '#/kesfet'}},
    ciz: ctx => {
      if (!A || A.hash !== ctx.hash) A = aDurumKur(ctx);
      const d = A, s = aSonuc(d);
      return GM.kubbe({
        gorsel: GM.mekan('mikla')?.kapakB || M()[0].kapakB, etiket: 'Dada Gourmet', baslik: 'Mekânlar',
        stat: [{deger: GM.sayi(M().length), etiket: 'mekân'}, {deger: S().il.length, etiket: 'şehir'}, {deger: GM.sayi(M().filter(m => GM.mekanRotada(m.slug)).length), etiket: 'rotada'}],
        arac: GM.listeArac({yer: 'Mekân, mutfak ya da semt ara', ad: 'q', deger: d.q, filtreSayi: GM.filtreSay(d.secili), serit: kategoriSerit(d)}),
        html: GM.eylemKart({ikon: 'bul', baslik: 'Mekân Bul', alt: '4 soruda sana uygun mekân', git: '#/mekan-bul'}) + vesileTema(d) + GM.sonucYuva(s.html)
      });
    },
    sonra: (kok) => {
      const d = A, c = [];
      let io = null;
      // Sonsuz kaydırma: 24'lük sayfa, alt yükleme göstergesi, sonda "Hepsi bu kadar · N mekân".
      const sonsuz = l => { io?.disconnect(); const kap = kok.querySelector('[data-kl-sonuc] .gm-liste-grid, [data-kl-sonuc] .gm-liste-rows'); if (!kap) return; const ks = kayitli(); io = GM.sonsuzListe(kap, l, m => aKart(m, d, ks), {sayfa: SAYFA, birim: 'mekân'}); };
      const ciz = (iskelet = true) => {
        const kap = kok.querySelector('[data-kl-sonuc]'), s = aSonuc(d);
        io?.disconnect(); kap.querySelectorAll('.gm-sonsuz-son,.gm-alt-yukleniyor,.gm-sonsuz-hata,.gm-liste-son').forEach(x => x.remove());
        if (iskelet && s.l.length) {
          kap.innerHTML = GM.listeDurum({sayi: s.l.length, birim: 'mekân', gorunum: d.gorunum, siraliAktif: d.sira !== 'onerilen', on: aKonum(d, s.l.length)}) + GM.listeSonucKap(d.gorunum === 'liste' ? GM.iskelet(3, 'satir') : GM.iskelet(4, 'kart'));
          kaydirUst(kok, kap);
          clearTimeout(ciz.z); ciz.z = setTimeout(() => { if (!kap.isConnected) return; kap.innerHTML = aSonuc(d).html; sonsuz(s.l); }, BEKLE());
        } else { kap.innerHTML = s.html; sonsuz(s.l); if (iskelet) kaydirUst(kok, kap); }
      };
      const arac = () => {
        GM.filtreSayiYaz(kok, GM.filtreSay(d.secili));
        cipEsle(kok, 'kategori', d.secili.kategori?.[0] ?? ''); cipEsle(kok, 'vesile', d.secili.vesile || []);
        const k = kok.querySelector('.gm-kl-konum'); if (k) k.outerHTML = aKonum(d, sonuc(d).length);
      };
      const yenile = () => { arac(); ciz(); };
      sonsuz(sonuc(d));
      c.push(GM.kaydetBagla(kok), aramaBagla(kok, d, () => ciz()));
      c.push(GM.eylem(kok, 'filtre', () => filtreAc(d, yenile)));
      c.push(GM.eylem(kok, 'sirala', () => siralaAc(d, () => { arac(); ciz(); kok.querySelector('.gm-liste-sort-button')?.classList.toggle('is-active', d.sira !== 'onerilen'); })));
      c.push(GM.eylem(kok, 'konum', () => konumAc(d, yenile)));
      c.push(GM.eylem(kok, 'temizle', () => { temizle(kok, d); yenile(); GM.toast('Süzgeçler **temizlendi**', {ikon: 'yenile'}); }));
      c.push(GM.on(kok, 'kategori', v => { d.secili.kategori = v ? [v] : []; arac(); ciz(); }));
      c.push(GM.on(kok, 'vesile', v => { d.secili.vesile = v; arac(); ciz(); }));
      c.push(GM.on(kok, 'gorunum', v => { d.gorunum = v; ciz(false); }));
      return () => { io?.disconnect(); clearTimeout(ciz.z); c.forEach(f => f()); };
    }
  });

  // ================= B · Kategori (Google Maps / Resy: harita + çekmece) =================
  let B = null;
  const HIZLI = [['acik', 'simdi', 'Şimdi açık', 'saat'], ['acik', 'rezervasyon', 'Rezervasyon alıyor', 'rezervasyon'], ['fiyat', '3', 'Üst orta', 'fiyat'], ['fiyat', '4', 'Lüks', 'fiyat'], ['konsept', 'sef-restorani', 'Şef restoranı', 'sef'], ['konsept', 'deniz-kenari', 'Deniz kenarı', 'teras'], ['konsept', 'manzarali', 'Manzaralı', 'harita']];
  const hizliSecili = d => HIZLI.filter(([g, v]) => d.secili[g]?.includes(v)).map(([g, v]) => `${g}:${v}`);
  const bPinler = l => l.map(m => ({id: m.slug, lng: m.lng, lat: m.lat, ad: m.ad}));
  const bHarita = l => GM.harita({ad: 'b-harita', tam: true, kume: true, kontroller: false, etiket: 'Mekân haritası', pinler: bPinler(l), dolgu: {top: 136, bottom: 400, left: 40, right: 40}});
  const bSatir = (m, ks, sec) => { const b = GM.mekanRotada(m.slug); return GM.mekanKart(m, {tur: 'satir', kayitli: ks.has(m.slug), secili: m.slug === sec, sapma: b ? {dk: b.sapma, km: b.km} : null}); };
  const bOzet = d => (d.alan ? ['Harita alanında', SIRA_AD[d.sira].toLocaleLowerCase('tr') + ' sırada'].join(' · ') : ozetMetin(d));
  const alanda = (l, a) => (a ? l.filter(m => m.lng >= a[0] && m.lng <= a[2] && m.lat >= a[1] && m.lat <= a[3]) : l);
  const bListe = (l, d) => (l.length ? GM.mekanSatirlar(l.slice(0, SAYFA).map(m => bSatir(m, kayitli(), d.secim))) : bos(d));
  const bSirala = GM.ikonBtn({ikon: 'sirala', etiket: 'Sırala', tur: 'kutu', veri: {eylem: 'sirala'}});
  const bYuzenO = durak => (durak === 'tam' ? {metin: 'Harita', ikon: 'harita', veri: {eylem: 'gecis'}} : {metin: 'Liste', ikon: 'list', veri: {eylem: 'gecis'}});
  const bYuzen = durak => GM.yuzenDugme(bYuzenO(durak));

  GM.ekran('mekanlar-b', {
    tur: 'tam', baslik: 'Mekânlar', ust: '#/kesfet', iskelet: 'satir',
    bos: {ikon: 'mekan', baslik: 'Henüz mekân eklenmedi', metin: 'Yeni mekânlar **eklendikçe** haritada görünecek.', eylem: {metin: 'Keşfet’e dön', tur: 'secondary', yerine: '#/kesfet'}},
    ciz: ctx => {
      if (!B || B.hash !== ctx.hash) B = {...durumKur(ctx), durak: 'yarim', secim: null, alan: null};
      const d = B, l = alanda(sonuc(d), d.alan);
      return GM.haritaEkran({
        harita: bHarita(sonuc(d)),
        ust: GM.haritaArama({yer: 'Mekân, mutfak ya da semt ara', ad: 'q', deger: d.q, filtreSayi: GM.filtreSay(d.secili)}) + GM.haritaCipSerit({ad: 'hizli', on: GM.konumSecici({konum: konumAl(d.secili), yuzen: true}), ogeler: HIZLI.map(([g, v, a, i]) => ({metin: a, deger: `${g}:${v}`, ikon: i})), secili: hizliSecili(d)}),
        cekmece: GM.cekmece({ad: 'b-liste', durak: d.durak, sayi: l.length, birim: 'mekân', alt: bOzet(d), eylem: bSirala, etiket: 'Mekân listesi', html: bListe(l, d)}),
        arac: GM.alanDugme(), secim: true, yuzen: GM.yuzenDugme({...bYuzenO(d.durak), yer: 'serbest'})
      });
    },
    sonra: kok => {
      const d = B, c = [];
      const harita = () => kok.querySelector('.gm-harita'), cek = () => kok.querySelector('.gm-kl-cekmece'), hsec = () => kok.querySelector('.gm-kl-hsecim');
      let l = alanda(sonuc(d), d.alan), io = null;
      const sonsuz = () => { io?.disconnect(); const kap = kok.querySelector('.gm-kl-cekmece [data-liste]'); if (!kap || l.length <= SAYFA) return; const ks = kayitli(); io = GM.sonsuz(kap, n => { const p = l.slice((n - 1) * SAYFA, n * SAYFA); return p.length ? p.map(m => bSatir(m, ks, d.secim)).join('') : ''; }); };
      const kartGizle = () => { hsec().classList.remove('is-gorunur'); };
      const secimKart = m => { hsec().innerHTML = GM.mekanKart(m, {tur: 'harita', secili: true, eylem: GM.btn({metin: 'Mekânı aç', ikon: 'mekan', boyut: 'sm', git: `#/mekan/${m.slug}`}) + GM.btn({metin: 'Yol tarifi', ikon: 'yon', tur: 'secondary', boyut: 'sm', veri: {eylem: 'yol', id: m.slug}})}); hsec().classList.add('is-gorunur'); };
      const satirSec = (slug, kaydir) => {
        d.secim = slug;
        kok.querySelectorAll('.gm-kl-cekmece .gm-mk-satir').forEach(r => r.classList.toggle('is-secili', r.dataset.mekan === slug));
        const r = kok.querySelector(`.gm-kl-cekmece .gm-mk-satir[data-mekan="${CSS.escape(slug)}"]`), g = kok.querySelector('.gm-kl-cekmece-govde');
        if (kaydir && r && g) g.scrollTo({top: r.offsetTop - g.offsetTop - GM.TK.space[8], behavior: GM.azHareket() ? 'auto' : 'smooth'});
      };
      // Pin görünür alanın ortasına gelsin: çekmecenin örttüğü yüksekliğin yarısı kadar yukarı.
      const odak = slug => { const e = cek(), H = kok.getBoundingClientRect(), c = hsec(), kart = c.classList.contains('is-gorunur') ? c.offsetHeight + GM.TK.space[24] : 0; const ortu = H.bottom - e.getBoundingClientRect().top + kart; GM.haritaSec(harita(), slug, {zoom: 14, kaydir: [0, Math.round(-ortu / 2 + GM.TK.space[48])]}); };
      const ciz = () => {
        const tum = sonuc(d); l = alanda(tum, d.alan); if (!l.some(m => m.slug === d.secim)) d.secim = null;
        const e = cek(), govde = e.querySelector('.gm-kl-cekmece-govde');
        e.querySelector('.gm-kl-cekmece-ozet b').textContent = `${GM.sayi(l.length)} mekân`;
        e.querySelector('.gm-kl-cekmece-ozet small').textContent = bOzet(d);
        govde.innerHTML = l.length ? GM.iskelet(4, 'satir') : bos(d);
        clearTimeout(ciz.z); ciz.z = setTimeout(() => { if (!govde.isConnected) return; govde.innerHTML = bListe(l, d); govde.scrollTop = 0; sonsuz(); }, l.length ? BEKLE() : 0);
        // Harita yalnız pin kümesi değişince yeniden kurulur (sıralama haritayı tazelemez).
        const anahtar = tum.map(m => m.slug).sort().join(); if (anahtar !== ciz.anahtar) { ciz.anahtar = anahtar; harita().outerHTML = bHarita(tum); hareketBagla(); } kartGizle(); alanPil(false);
        GM.filtreSayiYaz(kok, GM.filtreSay(d.secili)); cipEsle(kok, 'hizli', hizliSecili(d));
        const k = kok.querySelector('.gm-kl-konum'); if (k) k.outerHTML = GM.konumSecici({konum: konumAl(d.secili), yuzen: true});
        if (d.durak === 'kapali') GM.cekmeceDurak(e, 'yarim');
      };
      ciz.anahtar = sonuc(d).map(m => m.slug).sort().join();
      // Harita alanında ara (Google Maps): kullanıcı haritayı kaydırınca hap çıkar; dokununca liste görünen alanla süzülür, harita yerinde kalır.
      let hareket = null, sinir = null;
      const alanPil = on => kok.querySelector('.gm-kl-alan')?.classList.toggle('is-gorunur', on);
      const hareketBagla = () => { hareket?.(); hareket = GM.haritaHareket(harita(), b => { sinir = b; alanPil(true); }); };
      hareketBagla(); c.push(() => hareket?.());
      sonsuz();
      c.push(GM.kaydetBagla(kok), aramaBagla(kok, d, ciz));
      c.push(GM.eylem(kok, 'filtre', () => filtreAc(d, ciz)), GM.eylem(kok, 'sirala', () => siralaAc(d, ciz)), GM.eylem(kok, 'konum', () => { d.alan = null; konumAc(d, ciz); }));
      c.push(GM.eylem(kok, 'alan-ara', () => { if (!sinir) return; d.alan = [sinir.getWest(), sinir.getSouth(), sinir.getEast(), sinir.getNorth()]; ciz(); if (d.durak === 'kapali') GM.cekmeceDurak(cek(), 'yarim'); }));
      c.push(GM.eylem(kok, 'temizle', () => { temizle(kok, d); ciz(); }));
      c.push(GM.eylem(kok, 'yol', el => { const m = GM.mekan(el.dataset.id); GM.toast(`**${m.ad}** için yol tarifi Haritalar’da açılıyor`, {ikon: 'yon'}); }));
      c.push(GM.on(kok, 'hizli', v => { HIZLI.forEach(([g, x]) => { const on = v.includes(`${g}:${x}`), s = d.secili[g] || []; d.secili[g] = on ? [...new Set([...s, x])] : s.filter(y => y !== x); }); ciz(); }));
      // Çekmece durağı: yüzen düğme metni; kapalıda seçili kart görünür, yarım/tamda gizlenir.
      c.push(GM.on(kok, 'b-liste', v => { d.durak = v; kok.querySelector('[data-yuzen]').innerHTML = bYuzen(v); if (v !== 'kapali') kartGizle(); else if (d.secim) secimKart(GM.mekan(d.secim)); }));
      c.push(GM.eylem(kok, 'gecis', () => GM.cekmeceDurak(cek(), d.durak === 'tam' ? 'kapali' : 'tam')));
      // Satıra dokunuş (bağlantı ve kaydet dışı): pin seçilir, harita ona kayar; tam durakta yarıma iner.
      const satirTik = ev => { const r = ev.target.closest('.gm-kl-cekmece .gm-mk-satir'); if (!r || ev.target.closest('a,button')) return; if (d.durak === 'tam') GM.cekmeceDurak(cek(), 'yarim'); satirSec(r.dataset.mekan, false); requestAnimationFrame(() => odak(r.dataset.mekan)); };
      kok.addEventListener('click', satirTik); c.push(() => kok.removeEventListener('click', satirTik));
      // Pine dokunuş: satır vurgulanır ve listede kayar; çekmece kapalıysa altta mekân kartı çıkar.
      c.push(GM.on(kok, 'b-harita', slug => { satirSec(slug, true); if (d.durak === 'kapali') secimKart(GM.mekan(slug)); odak(slug); }));
      return () => { io?.disconnect(); clearTimeout(ciz.z); c.forEach(f => f()); };
    }
  });

  // ================= C · Son nesil (rehber manşeti + editoryal sıra + yüzen harita + araç sütunu) =================
  let C = null;
  // Koleksiyon: [konsept değeri, giriş cümlesi]. Sekme ve manşet adı web konsept adıdır (GMV.mekanSecenek.konsept); Tümü = "Gurme rehber". Sayılar veriden.
  const KOLEKSIYON = [
    ['', 'Dada Gourmet’te yayında olan bütün **gurme duraklar**, Dada Route ile yol üstünde.'],
    ['sef-restorani', 'Tadım menüsünden açık mutfağa, **şefin imzasını** taşıyan sofralar.'],
    ['deniz-kenari', 'Dalga sesine karşı **deniz ürünleri**, Ege ve Akdeniz mutfağı.'],
    ['manzarali', 'Boğaz’dan koylara, **manzarası** kadar mutfağıyla da anılan mekânlar.'],
    ['tarihi', 'Konaklardan hanlara, **tarihi yapılarda** kurulan sofralar.'],
    ['tas-konak', 'Kapadokya’dan Ege köylerine, **taş konak** sofraları.'],
    ['terasli', 'Şehrin üstünde, **teraslarda** akşam yemeği.'],
    ['yoresel-lezzet-noktasi', 'Bölgesinin ürününü ve tarifini **yerinde** sunan duraklar.']
  ].map(([v, metin]) => [v, v ? S().konsept.find(k => k.deger === v)?.ad || v : 'Gurme rehber', metin]);
  const kolKaynak = d => (d.kol ? M().filter(m => m.f.konsept?.includes(d.kol)) : M());
  const cKart = (m, i, d, ks) => (d.gorunum === 'liste' ? GM.mekanKart(m, {tur: 'satir', sira: i + 1, kayitli: ks.has(m.slug), sapma: (b => (b ? {dk: b.sapma, km: b.km} : null))(GM.mekanRotada(m.slug))}) : GM.mekanEditoryal(m, {sira: i + 1, kayitli: ks.has(m.slug), rota: GM.mekanRotada(m.slug)}));
  const cSonuc = d => { const l = sonuc(d, kolKaynak(d)), ks = kayitli(); return {l, html: GM.listeDurum({sayi: l.length, birim: 'mekân', gorunum: d.gorunum, siraliAktif: d.sira !== 'onerilen', on: GM.konumSecici({konum: konumAl(d.secili), tur: 'etiket', sayi: l.length})}) + (l.length ? GM.listeSonucKap((d.gorunum === 'liste' ? GM.mekanSatirlar : GM.editoryalListe)(l.slice(0, SAYFA).map((m, i) => cKart(m, i, d, ks)))) : bos(d))}; };
  // Manşet özeti seçili konum ve süzgeçlerle sayılır (arama metni hariç): mekân · şehir (şehir seçiliyse ilçe) · fiyat aralığı.
  const cManset = d => {
    const k = KOLEKSIYON.find(x => x[0] === (d.kol || '')), l = GM.mekanSuz(kolKaynak(d), d.secili), f = l.map(m => m.fiyat).filter(Boolean), yer = konumAl(d.secili);
    const rotada = l.filter(m => GM.mekanRotada(m.slug)).length;
    const alan = yer.il ? [new Set(l.map(m => m.ilce)).size, 'ilçe'] : [new Set(l.map(m => m.il)).size, 'şehir'];
    const fiyat = f.length ? GM.fiyat(Math.min(...f)) + (Math.max(...f) > Math.min(...f) ? ` – ${GM.fiyat(Math.max(...f))}` : '') : '';
    return GM.rehberManset({etiket: k[0] ? 'Dada rehberi · Mekân konsepti' : 'Dada rehberi', baslik: k[1], metin: k[2], ozet: [`<b>${GM.sayi(l.length)}</b> mekân`, `<b>${alan[0]}</b> ${alan[1]}`, rotada ? `<b>${rotada}</b> Dada Route’ta` : '', fiyat].filter(Boolean)});
  };
  // Harita kipi: numaralı pinler (liste sırası), ≤ 40 mekânda kümesiz; sağda araç sütunu, altta pinle senkron kart şeridi.
  const cPinler = (l, sec) => l.map((m, i) => ({id: m.slug, lng: m.lng, lat: m.lat, aria: `${i + 1}. ${m.ad}`, ...(l.length <= 40 ? {sira: i + 1} : {}), secili: m.slug === sec, ad: m.ad}));
  const cHaritaKip = d => {
    const l = sonuc(d, kolKaynak(d)), ks = kayitli();
    return GM.haritaEkran({altEkran: true,
      harita: GM.harita({ad: 'c-harita', tam: true, kume: l.length > 40, kontroller: false, etiket: 'Rehber haritası', pinler: cPinler(l, d.secim), dolgu: {top: 48, bottom: 208, left: 40, right: 88}}),
      arac: GM.aracSutun([{ikon: 'filtre', ad: 'Süzgeç', sayi: GM.filtreSay(d.secili), veri: {eylem: 'filtre'}}, {ikon: 'sirala', ad: 'Sırala', veri: {eylem: 'sirala'}, secili: d.sira !== 'onerilen'}, {ikon: 'pin', ad: 'Konum', veri: {eylem: 'konum'}, secili: !!d.secili.il?.length}, {ikon: 'konum', ad: 'Yakınım', veri: {eylem: 'yakinim'}}]),
      alt: GM.yuzenDugme({metin: 'Liste', ikon: 'list', veri: {eylem: 'kip'}}) + (l.length ? GM.haritaKartlar(l.slice(0, 60).map((m, i) => GM.mekanKart(m, {tur: 'harita', sira: i + 1, secili: m.slug === d.secim, kayitli: ks.has(m.slug)}))) : GM.haritaKartlar([GM.bos({ikon: 'mekan', baslik: 'Bu filtreyle henüz mekân yok', eylem: {metin: 'Filtreleri temizle', tur: 'secondary', veri: {eylem: 'temizle'}}})]))
    });
  };

  GM.ekran('mekanlar-c', {
    tur: 'alt', baslik: 'Mekânlar', ust: '#/kesfet', iskelet: 'liste',
    ustBar: () => ({sag: [{ikon: 'paylas', etiket: 'Rehberi paylaş', veri: {eylem: 'paylas'}}]}),
    bos: {ikon: 'mekan', baslik: 'Henüz mekân eklenmedi', metin: 'Yeni mekânlar **eklendikçe** rehbere girecek.', eylem: {metin: 'Keşfet’e dön', tur: 'secondary', yerine: '#/kesfet'}},
    ciz: ctx => {
      if (!C || C.hash !== ctx.hash) C = {...durumKur(ctx), kol: ctx.sorgu.koleksiyon || '', kip: ctx.sorgu.kip === 'harita' ? 'harita' : 'liste', secim: null};
      const d = C;
      if (d.kip === 'harita') return cHaritaKip(d);
      return GM.rehberSekme({ad: 'koleksiyon', etiket: 'Koleksiyonlar', secili: d.kol || '', ogeler: KOLEKSIYON.map(([v, a]) => ({ad: v ? a : 'Tümü', deger: v}))})
        + GM.rehberMansetKap(cManset(d))
        + GM.listeArac({yer: 'Rehberde ara', ad: 'q', deger: d.q, filtreSayi: GM.filtreSay(d.secili)})
        + GM.listeGovde(cSonuc(d).html)
        + GM.yuzenDugme({metin: 'Harita', ikon: 'harita', veri: {eylem: 'kip'}, yer: 'sabit'});
    },
    sonra: kok => {
      const d = C, c = [];
      let io = null;
      const sonsuz = l => { io?.disconnect(); const kap = kok.querySelector('[data-kl-sonuc] [data-liste]'); if (!kap || l.length <= SAYFA) return; const ks = kayitli(); io = GM.sonsuz(kap, n => { const p = l.slice((n - 1) * SAYFA, n * SAYFA); return p.length ? p.map((m, i) => cKart(m, (n - 1) * SAYFA + i, d, ks)).join('') : ''; }); };
      const ciz = (iskelet = true) => {
        if (d.kip === 'harita') { GM.tazele(); return; }
        const kap = kok.querySelector('[data-kl-sonuc]'); io?.disconnect(); kap.querySelectorAll('.gm-sonsuz-son,.gm-alt-yukleniyor').forEach(x => x.remove());
        kok.querySelector('[data-manset]').innerHTML = cManset(d); GM.filtreSayiYaz(kok, GM.filtreSay(d.secili));
        const s = cSonuc(d);
        if (iskelet && s.l.length) { kap.innerHTML = GM.listeDurum({sayi: s.l.length, birim: 'mekân', gorunum: d.gorunum, siraliAktif: d.sira !== 'onerilen', on: GM.konumSecici({konum: konumAl(d.secili), tur: 'etiket', sayi: s.l.length})}) + GM.listeSonucKap(GM.iskelet(d.gorunum === 'liste' ? 3 : 2, d.gorunum === 'liste' ? 'satir' : 'liste')); kaydirUst(kok, kap); clearTimeout(ciz.z); ciz.z = setTimeout(() => { if (!kap.isConnected) return; kap.innerHTML = cSonuc(d).html; sonsuz(s.l); }, BEKLE()); }
        else { kap.innerHTML = s.html; sonsuz(s.l); }
      };
      c.push(GM.kaydetBagla(kok));
      c.push(GM.eylem(kok, 'filtre', () => filtreAc(d, ciz)), GM.eylem(kok, 'sirala', () => siralaAc(d, ciz)), GM.eylem(kok, 'konum', () => konumAc(d, ciz)));
      c.push(GM.eylem(kok, 'temizle', () => { temizle(kok, d); ciz(); }));
      c.push(GM.eylem(kok, 'kip', () => { d.kip = d.kip === 'harita' ? 'liste' : 'harita'; GM.tazele(); kok.querySelector('.gm-kaydir')?.scrollTo({top: 0}); }));
      c.push(GM.eylem(kok, 'yakinim', () => GM.toast('Konumun paylaşılmadı; harita **tüm rehberi** gösteriyor', {ikon: 'konum'})));
      c.push(GM.eylem(kok, 'paylas', () => GM.paylas({baslik: 'Dada Gourmet rehberi', url: 'https://dadagourmet.com/mekanlar'})));
      if (d.kip === 'liste') {
        sonsuz(sonuc(d, kolKaynak(d)));
        c.push(aramaBagla(kok, d, () => ciz()));
        c.push(GM.on(kok, 'koleksiyon', v => { d.kol = v; ciz(); }));
        c.push(GM.on(kok, 'gorunum', v => { d.gorunum = v; ciz(false); }));
      } else {
        // Kart şeridi ↔ pin: kaydırma durunca ortadaki kartın pini seçilir; pine dokununca kart ortaya gelir.
        const el = () => kok.querySelector('.gm-harita'), serit = kok.querySelector('[data-hkart]');
        let elle = false, z;
        const kartSec = slug => serit?.querySelectorAll('.gm-mk-harita').forEach(k => k.classList.toggle('is-secili', k.dataset.mekan === slug));
        const sec = (slug, kaydir) => { d.secim = slug; kartSec(slug); GM.haritaSec(el(), slug, {zoom: 11, kaydir: [0, -GM.TK.space[64]]}); if (kaydir) { const k = serit?.querySelector(`[data-mekan="${CSS.escape(slug)}"]`); if (k) { elle = true; serit.scrollTo({left: k.offsetLeft - (serit.clientWidth - k.offsetWidth) / 2, behavior: GM.azHareket() ? 'auto' : 'smooth'}); setTimeout(() => { elle = false; }, GM.TK.motion.page * 2); } } };
        if (serit) { const h = () => { if (elle) return; clearTimeout(z); z = setTimeout(() => { const o = serit.scrollLeft + serit.clientWidth / 2, k = [...serit.children].reduce((a, b) => (Math.abs(b.offsetLeft + b.offsetWidth / 2 - o) < Math.abs(a.offsetLeft + a.offsetWidth / 2 - o) ? b : a)); if (k?.dataset.mekan && k.dataset.mekan !== d.secim) sec(k.dataset.mekan, false); }, GM.TK.motion.quick); }; serit.addEventListener('scroll', h, {passive: true}); c.push(() => serit.removeEventListener('scroll', h)); }
        c.push(GM.on(kok, 'c-harita', slug => sec(slug, true)));
      }
      return () => { io?.disconnect(); clearTimeout(ciz.z); c.forEach(f => f()); };
    }
  });

  // Cila turu (Görev 6): kayıtlar ekranlar/ana-alternatif.js'tekiyle aynı, yalnız iyilesti eklendi (son kayıt geçerli).
  GM.alternatifKaydet({ekran: 'liste', kod: 'liste-a', sira: 1, ad: 'Liste · A Dada ailesi', referans: 'Dada Gastro liste-v2', alinan: 'Fotoğraflı başlık, yapışkan arama ve süzgeç, kategori çipleri, ızgara/liste.', gerekce: 'Gastro/Diet listesiyle aynı davranış; öğrenme maliyeti yok.', git: '#/alt/liste-a', iyilesti: 'Yol üstü durak rozeti ve liste görünümünde rota sapması, başlıkta rotadaki mekân sayısı, Diet/Gastro kalıbındaki Mekân Bul eylem kartı.'});
  GM.alternatifKaydet({ekran: 'liste', kod: 'liste-b', sira: 2, ad: 'Liste · B Kategori', referans: 'Google Maps + Resy', alinan: 'Arkada harita, 3 duraklı liste çekmecesi, kart ↔ pin senkronu.', gerekce: 'Mekânın nerede olduğu karar için ilk bilgi; harita ve liste tek ekranda.', git: '#/alt/liste-b', iyilesti: 'Google Maps’in “Bu alanda ara” hapı (liste görünen alanla süzülür, harita yerinde kalır) ve satırda Dada Route sapması.'});
  GM.alternatifKaydet({ekran: 'liste', kod: 'liste-c', sira: 3, ad: 'Liste · C Son nesil', referans: 'The Infatuation + AllTrails + Watch Duty', alinan: 'Koleksiyon sekmeleri, rehber manşeti, numaralı büyük kartlar, yüzen harita + araç sütunu.', gerekce: 'Editoryal rehber hissi; Gourmet’in seçki ürünü olduğunu vurgular.', git: '#/alt/liste-c', iyilesti: 'Sekme ve başlıklar web konsept adlarında; manşet özetinde “N Dada Route’ta”, rota durağı kartlarında rotaya götüren yol üstü/sapma etiketi; kanon 24 ritmi.'});
})();
