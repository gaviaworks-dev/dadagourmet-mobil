/* Mekân listesi — referanslı alternatifler (Görev 4). Her biri tek bir uygulamanın kalıbından doğrudan beslenir; A/B/C (ekranlar/mekanlar.js) tekrarlanmaz.
   ref-liste-1 TheFork: hap süzgeçler + bölümlü süzgeç sayfası (zaman segmenti, puan ve fiyat kaydırıcısı), geniş fotoğraflı kart. İndirim yok.
   ref-liste-2 OpenTable: kişi · tarih · saat kapsülü önde; yalnız rezervasyon alan mekânlar; satırda talep saatleri, uymuyorsa "Bildir".
   ref-liste-3 Beli: kişisel sıralı listeler (Gittim / Gideceğim) + Keşfet; Gittim'e eklenen mekân ikili karşılaştırmayla yerleşir, puan üretilmez.
   ref-liste-4 Mapstr: renkli etiket pinleri, soldan açılan etiket paneli (sayılı), liste görünümünde etiket grupları.
   Veri GMV.mekanlar (f = web süzgeç değerleri); puan, yorum, müsaitlik uydurulmaz. Kaydet misafirde üye duvarı (GM.kaydetBagla). */
(() => {
  const M = () => GMV.mekanlar, S = () => GMV.mekanSecenek, SAYFA = 24;
  const BEKLE = () => (GM.azHareket() ? 0 : GM.TK.motion.oneri.skeletonDelay);
  const ks = () => GM.kayitliMekanlar();
  const konumGrup = k => ({il: k.il ? [k.il] : [], ilce: k.ilce ? [k.ilce] : [], semt: k.semt ? [k.semt] : []});
  const konumKisa = k => GM.konumYaz(k).at(-1);
  const bos = (eylem = 'temizle') => GM.bos({ikon: 'mekan', baslik: 'Bu filtreyle henüz mekân yok', metin: 'Süzgeçleri **gevşetmeyi** ya da başka bir şehir seçmeyi dene.', eylem: {metin: 'Filtreleri temizle', tur: 'secondary', ikon: 'yenile', veri: {eylem}}});
  const aramaBagla = (kok, d, f) => { let z; const h = ev => { if (!ev.target.matches('input[name="q"]')) return; clearTimeout(z); z = setTimeout(() => { d.q = ev.target.value; f(); }, GM.TK.motion.oneri.inputDebounce); }; kok.addEventListener('input', h); return () => { clearTimeout(z); kok.removeEventListener('input', h); }; };
  // Sonsuz kaydırma: ilk 24 çizilir, kalanı GM.sonsuz ile eklenir. kap: [data-liste]
  const sonsuzKur = (kok, l, kart) => { const kap = kok.querySelector('[data-kl-sonuc] [data-liste]'); if (!kap || l.length <= SAYFA) return null; return GM.sonsuz(kap, n => { const p = l.slice((n - 1) * SAYFA, n * SAYFA); return p.length ? p.map((m, i) => kart(m, (n - 1) * SAYFA + i)).join('') : ''; }); };
  const grupOge = g => (S()[g] || []).map(x => ({metin: x.ad, deger: x.deger, sayi: x.sayi}));
  const cipGrup = (ad, sec, o = {}) => GM.cipler({ad, serit: false, ogeler: o.ogeler || grupOge(ad), secili: sec || [], etiket: o.etiket});

  // ================= ref-liste-1 · TheFork kalıbı =================
  let T = null;
  const TF_BOS = {zaman: '', puanAlt: '', fiyatUst: '4', kategori: [], konsept: [], mutfak: [], vesile: [], hizmet: [], beslenme: [], ulasim: [], acikEk: [], seckiler: []};
  const tfSecili = (s, k) => ({...konumGrup(k), kategori: s.kategori, konsept: s.konsept, mutfak: s.mutfak, vesile: s.vesile, hizmet: s.hizmet, beslenme: s.beslenme, ulasim: s.ulasim, seckiler: s.seckiler,
    acik: [s.zaman, ...(s.acikEk || [])].filter(Boolean), fiyat: +s.fiyatUst < 4 ? ['1', '2', '3', '4'].slice(0, +s.fiyatUst) : [], puan: s.puanAlt ? [s.puanAlt] : []});
  // Yol üstü (Gourmet'e özgü hap): hazır bir Dada Route rotasında ≤1 km sapmalı önerilen durak (GM.mekanRotada, GM.rotaOneri tek kaynak).
  const tfSonuc = (d, s = d.s) => GM.mekanSirala(GM.mekanSuz(M(), tfSecili(s, d.konum), d.q), d.sira).filter(m => !d.yolustu || GM.mekanRotada(m.slug)?.uzak <= 1);
  const tfSay = s => ['kategori', 'konsept', 'mutfak', 'vesile', 'hizmet', 'beslenme', 'ulasim', 'acikEk', 'seckiler'].reduce((n, g) => n + (s[g]?.length || 0), 0) + (s.zaman ? 1 : 0) + (s.puanAlt ? 1 : 0) + (+s.fiyatUst < 4 ? 1 : 0);
  const PUAN = [{deger: '', metin: 'Tümü', kisa: 'Tümü'}, {deger: '3.5', metin: '3,5 ve üzeri', kisa: '3,5+'}, {deger: '4', metin: '4,0 ve üzeri', kisa: '4,0+'}, {deger: '4.5', metin: '4,5 ve üzeri', kisa: '4,5+'}];
  const FIYAT = [{deger: '1', metin: 'Yalnız ekonomik', kisa: 'Ekonomik'}, {deger: '2', metin: 'Ortaya kadar', kisa: 'Orta'}, {deger: '3', metin: 'Üst ortaya kadar', kisa: 'Üst orta'}, {deger: '4', metin: 'Tümü', kisa: 'Lüks'}];
  const ZAMAN = [{ad: 'Her zaman', deger: ''}, {ad: 'Şimdi', deger: 'simdi'}, {ad: 'Bugün', deger: 'bugun'}, {ad: 'Hafta sonu', deger: 'hafta-sonu'}];
  const ACIK_EK = (S().acik || []).filter(x => ['gece', 'sabah', 'rezervasyon'].includes(x.deger)).map(x => ({metin: x.ad, deger: x.deger, sayi: x.sayi}));
  const tfBolumFiyat = s => GM.secimBolum({baslik: 'Ortalama puan', ikon: 'yildiz', html: GM.aralik({ad: 'puanAlt', etiket: 'En az', ogeler: PUAN, secili: s.puanAlt, yardim: 'Henüz **değerlendirme yok**; puan süzgeci değerlendirmeler geldikçe sonuç verir.'})}) + GM.secimBolum({baslik: 'Fiyat seviyesi', ikon: 'fiyat', html: GM.aralik({ad: 'fiyatUst', etiket: 'En çok', ogeler: FIYAT, secili: s.fiyatUst})});
  const tfTumu = s => [
    GM.secimBolum({baslik: 'Ne zaman?', ikon: 'takvim', html: GM.segment({ad: 'zaman', etiket: 'Ne zaman', ogeler: ZAMAN, secili: s.zaman})}),
    tfBolumFiyat(s),
    GM.secimBolum({baslik: 'Mutfak türü', ikon: 'lezzet', html: cipGrup('mutfak', s.mutfak)}),
    GM.secimBolum({baslik: 'Ortam ve konsept', ikon: 'katman', html: cipGrup('konsept', s.konsept)}),
    GM.secimBolum({baslik: 'Deneyim ve kullanım amacı', ikon: 'kisi', html: cipGrup('vesile', s.vesile)}),
    GM.secimBolum({baslik: 'Mekân kategorisi', ikon: 'mekan', html: cipGrup('kategori', s.kategori)}),
    GM.secimBolum({baslik: 'Hizmet ve özellikler', ikon: 'onay', html: cipGrup('hizmet', s.hizmet)}),
    GM.secimBolum({baslik: 'Beslenme tercihleri', ikon: 'vegan', html: cipGrup('beslenme', s.beslenme)}),
    GM.secimBolum({baslik: 'Ulaşım ve erişilebilirlik', ikon: 'engelsiz', html: cipGrup('ulasim', s.ulasim)}),
    GM.secimBolum({baslik: 'Saat ve rezervasyon', ikon: 'saat', html: cipGrup('acikEk', s.acikEk, {ogeler: ACIK_EK})}),
    GM.secimBolum({baslik: 'Dada Seçkileri', ikon: 'puanDada', html: cipGrup('seckiler', s.seckiler)})
  ].join('');
  const TF_HAP = [['mutfak', 'Mutfak', 'lezzet'], ['fiyat', 'Fiyat ve puan', 'fiyat'], ['konsept', 'Ortam', 'katman'], ['vesile', 'Amaç', 'kisi']];
  const tfHaplar = d => GM.yatay([
    GM.filtreHap({metin: 'Süzgeçler', ikon: 'filtre', ana: true, sayi: tfSay(d.s), ok: false, veri: {eylem: 'hap', id: 'tumu'}}),
    GM.filtreHap({metin: 'Yol üstü', ikon: 'yolUstu', ok: false, secili: !!d.yolustu, veri: {eylem: 'yolustu'}}),
    GM.filtreHap({metin: GM.MEKAN_SIRALA.find(x => x[0] === d.sira)[1], ikon: 'sirala', secili: d.sira !== 'onerilen', veri: {eylem: 'sirala'}}),
    GM.filtreHap({metin: konumKisa(d.konum), ikon: 'pin', secili: !!d.konum.il, veri: {eylem: 'konum'}}),
    GM.filtreHap({metin: 'Şimdi açık', ikon: 'saat', ok: false, secili: d.s.zaman === 'simdi', veri: {eylem: 'simdi'}}),
    ...TF_HAP.map(([g, a, i]) => { const n = g === 'fiyat' ? (d.s.puanAlt ? 1 : 0) + (+d.s.fiyatUst < 4 ? 1 : 0) : d.s[g].length; const tek = g !== 'fiyat' && n === 1 ? (S()[g] || []).find(x => x.deger === d.s[g][0])?.ad : null; return GM.filtreHap({metin: tek || a, ikon: i, sayi: tek ? 0 : n, secili: n > 0, veri: {eylem: 'hap', id: g}}); })
  ]);
  const tfIcerik = (d, l = tfSonuc(d)) => (l.length ? GM.bas(`${GM.sayi(l.length)} mekân`) + GM.mekanSatirlar(l.slice(0, SAYFA).map(m => GM.mekanForkKart(m, {kayitli: ks().has(m.slug), rota: GM.mekanRotada(m.slug)}))) : bos());

  GM.ekran('ref-liste-1', {
    tur: 'alt', baslik: 'Mekânlar', ust: '#/alternatifler', iskelet: 'liste',
    bos: {ikon: 'mekan', baslik: 'Henüz mekân eklenmedi', metin: 'Yeni mekânlar **eklendikçe** burada listelenecek.', eylem: {metin: 'Keşfet’e dön', tur: 'secondary', yerine: '#/kesfet'}},
    ciz: ctx => {
      if (!T || T.hash !== ctx.hash) T = {hash: ctx.hash, q: '', sira: 'onerilen', konum: {}, s: JSON.parse(JSON.stringify(TF_BOS))};
      return GM.yapiskanArac(GM.arama({yer: 'Mekân, mutfak ya da semt ara', ad: 'q', deger: T.q, sonuc: false}) + `${tfHaplar(T)}`) + GM.listeGovde(tfIcerik(T));
    },
    sonra: kok => {
      const d = T, c = []; let io = null;
      const kart = m => GM.mekanForkKart(m, {kayitli: ks().has(m.slug), rota: GM.mekanRotada(m.slug)});
      const ciz = (iskelet = true) => {
        const kap = kok.querySelector('[data-kl-sonuc]'), l = tfSonuc(d); io?.disconnect(); kap.querySelectorAll('.gm-sonsuz-son,.gm-alt-yukleniyor').forEach(x => x.remove());
        const yat = kok.querySelector('.gm-kl-yarac > .gm-serit'), x = yat?.scrollLeft || 0; if (yat) { yat.outerHTML = tfHaplar(d); kok.querySelector('.gm-kl-yarac > .gm-serit').scrollLeft = x; }
        const bitir = () => { kap.innerHTML = tfIcerik(d, l); io = sonsuzKur(kok, l, kart); };
        if (iskelet && l.length) { kap.innerHTML = GM.iskelet(2, 'liste'); clearTimeout(ciz.z); ciz.z = setTimeout(() => kap.isConnected && bitir(), BEKLE()); } else bitir();
        kok.querySelector('.gm-kaydir')?.scrollTo({top: 0});
      };
      const sheetAc = id => {
        const tek = id !== 'tumu', g = TF_HAP.find(x => x[0] === id);
        GM.secimSheet({baslik: tek ? (id === 'fiyat' ? 'Fiyat ve puan' : g[1]) : 'Süzgeçler', tam: !tek, d: d.s, bos: tek ? {...d.s, ...(id === 'fiyat' ? {puanAlt: '', fiyatUst: '4'} : {[id]: []})} : TF_BOS, birim: 'mekân',
          ciz: s => (!tek ? tfTumu(s) : id === 'fiyat' ? tfBolumFiyat(s) : GM.secimBolum({baslik: {mutfak: 'Mutfak türü', konsept: 'Ortam ve konsept', vesile: 'Deneyim ve kullanım amacı'}[id], ikon: g[2], html: cipGrup(id, s[id])})),
          say: s => tfSonuc(d, s).length, uygula: s => { d.s = s; ciz(); }});
      };
      io = sonsuzKur(kok, tfSonuc(d), kart);
      c.push(GM.kaydetBagla(kok), aramaBagla(kok, d, () => ciz(false)));
      c.push(GM.eylem(kok, 'hap', el => sheetAc(el.dataset.id)));
      c.push(GM.eylem(kok, 'yolustu', () => { d.yolustu = !d.yolustu; ciz(); }));
      c.push(GM.eylem(kok, 'simdi', () => { d.s.zaman = d.s.zaman === 'simdi' ? '' : 'simdi'; ciz(); }));
      c.push(GM.eylem(kok, 'sirala', () => GM.siralaSheet({baslik: 'Sırala', secenekler: GM.MEKAN_SIRALA, secili: d.sira, sec: v => { d.sira = v; ciz(); if (['yakin', 'puan', 'yorum'].includes(v)) GM.toast(v === 'yakin' ? 'Konumun paylaşılmadı; **Önerilen** sırası gösteriliyor' : 'Henüz değerlendirme yok; **Önerilen** sırası gösteriliyor', {ikon: v === 'yakin' ? 'konum' : 'yildiz'}); }})));
      c.push(GM.eylem(kok, 'konum', () => GM.konumSheet({secili: d.konum, sec: k => { d.konum = k; ciz(); }})));
      c.push(GM.eylem(kok, 'temizle', () => { d.s = JSON.parse(JSON.stringify(TF_BOS)); d.konum = {}; d.yolustu = false; ciz(); }));
      return () => { io?.disconnect(); clearTimeout(ciz.z); c.forEach(f => f()); };
    }
  });

  // ================= ref-liste-2 · OpenTable kalıbı =================
  let O = null;
  // Tarih seçenekleri uygulamanın sabit anından (GM.bugunIso, Cuma 13 Kasım); açıklık verisi: bugün → "bugun", hafta sonu → "hafta-sonu" (web süzgeç değerleri).
  const TARIH = [['bugun', 'Bugün', 'Bugün', 'bugun'], ['yarin', 'Yarın', 'Cmt 14 Kas', 'hafta-sonu'], ['pazar', 'Pazar', 'Paz 15 Kas', 'hafta-sonu']];
  const SAAT = ['12:00', '13:00', '19:00', '19:30', '20:00', '20:30', '21:00', '22:30'];
  const saatMetin = s => s.replace(':', '.');
  const kaydirSaat = (s, dk) => GM.saatMetin(GM.saatDk(s) + dk);
  const OT_HIZLI = [['rota', 'yolustu', 'Yol üstü', 'yolUstu'], ['vesile', 'romantik-bulusma', 'Romantik', 'heart'], ['konsept', 'sef-restorani', 'Şef restoranı', 'sef'], ['mutfak', 'deniz-urunleri', 'Deniz ürünleri', 'fish'], ['mutfak', 'italyan-mutfagi', 'İtalyan', 'pizza-slice'], ['konsept', 'manzarali', 'Manzaralı', 'mountain-sun'], ['hizmet', 'online-rezervasyon', 'Online rezervasyon', 'bolt']];
  // Uygunluk veriden: rezervasyon alıyor + o gün açık (+ 22.00 sonrası "gece açık", 11.00 öncesi "sabah açık"). Saatler talep saatidir, müsaitlik değildir.
  const uygunluk = (m, d) => {
    const t = TARIH.find(x => x[0] === d.tarih), a = m.f.acik || [];
    if (!a.includes(t[3])) return {kapali: `${t[1]} kapalı`};
    if (d.saat >= '22:00' && !a.includes('gece')) return {kapali: `Saat ${saatMetin(d.saat)} için açık değil`};
    if (d.saat < '11:00' && !a.includes('sabah')) return {kapali: `Saat ${saatMetin(d.saat)} için açık değil`};
    return {saatler: [-30, 0, 30].map(x => kaydirSaat(d.saat, x)).filter(s => s >= '11:00' && s <= '23:30').map(s => ({saat: saatMetin(s), deger: s}))};
  };
  const otSecili = d => { const s = {...konumGrup(d.konum), ...d.secili}; OT_HIZLI.filter(([g]) => g !== 'rota').forEach(([g, v]) => { if (d.hizli.includes(`${g}:${v}`)) s[g] = [...new Set([...(s[g] || []), v])]; }); return s; };
  // Yol üstü hızlı süzgeci: yolculukta masa (Dada Route önerilen durağı, ≤1 km).
  const otSonuc = (d, z = d) => { const l = GM.mekanSuz(M().filter(m => m.rezervasyon && (!d.hizli.includes('rota:yolustu') || GM.mekanRotada(m.slug)?.uzak <= 1)), otSecili(d), d.q).map(m => ({m, u: uygunluk(m, z)})); return [...l.filter(x => !x.u.kapali), ...l.filter(x => x.u.kapali)]; };
  const otKart = (x, d) => GM.mekanSlotSatir(x.m, {...x.u, anlik: x.m.f.hizmet?.includes('online-rezervasyon'), kayitli: ks().has(x.m.slug), bildir: d.bildir?.includes(x.m.slug), rota: GM.mekanRotada(x.m.slug)});
  const otIcerik = (d, l = otSonuc(d)) => { const n = l.filter(x => !x.u.kapali).length; return l.length ? GM.bas(`${GM.sayi(n)} mekân ${saatMetin(d.saat)} için talep alıyor`) + GM.mekanSatirlar(l.slice(0, SAYFA).map(x => otKart(x, d))) : bos(); };
  const otArac = d => GM.kisiZaman({kisi: d.kisi, tarih: TARIH.find(x => x[0] === d.tarih)[2], saat: saatMetin(d.saat)}) + GM.haritaCipSerit({ad: 'ot-hizli', etiket: 'Hızlı süzgeçler', on: GM.filtreHap({metin: 'Süzgeç', ikon: 'filtre', ana: true, ok: false, sayi: GM.filtreSay(d.secili), veri: {eylem: 'filtre'}}) + GM.filtreHap({metin: konumKisa(d.konum), ikon: 'pin', secili: !!d.konum.il, veri: {eylem: 'konum'}}), ogeler: OT_HIZLI.map(([g, v, a, i]) => ({metin: a, deger: `${g}:${v}`, ikon: i})), secili: d.hizli});

  GM.ekran('ref-liste-2', {
    tur: 'alt', baslik: 'Masa bul', ust: '#/alternatifler', iskelet: 'liste',
    bos: {ikon: 'mekan', baslik: 'Henüz mekân eklenmedi', metin: 'Yeni mekânlar **eklendikçe** burada listelenecek.', eylem: {metin: 'Keşfet’e dön', tur: 'secondary', yerine: '#/kesfet'}},
    ciz: ctx => {
      if (!O || O.hash !== ctx.hash) O = {hash: ctx.hash, kisi: 2, tarih: 'bugun', saat: '20:00', q: '', hizli: [], secili: {}, konum: {}, bildir: []};
      return GM.yapiskanArac(otArac(O)) + GM.listeGovde(otIcerik(O));
    },
    sonra: kok => {
      const d = O, c = []; let io = null;
      const ciz = (iskelet = true) => {
        const kap = kok.querySelector('[data-kl-sonuc]'), l = otSonuc(d); io?.disconnect(); kap.querySelectorAll('.gm-sonsuz-son,.gm-alt-yukleniyor').forEach(x => x.remove());
        const a = kok.querySelector('.gm-kl-yarac'), x = a.querySelector('.gm-serit')?.scrollLeft || 0; a.innerHTML = otArac(d); a.querySelector('.gm-serit').scrollLeft = x;
        const bitir = () => { kap.innerHTML = otIcerik(d, l); io = sonsuzKur(kok, l, x => otKart(x, d)); };
        if (iskelet && l.length) { kap.innerHTML = GM.iskelet(3, 'satir'); clearTimeout(ciz.z); ciz.z = setTimeout(() => kap.isConnected && bitir(), BEKLE()); } else bitir();
        kok.querySelector('.gm-kaydir')?.scrollTo({top: 0});
      };
      io = sonsuzKur(kok, otSonuc(d), x => otKart(x, d));
      c.push(GM.kaydetBagla(kok));
      c.push(GM.eylem(kok, 'kisi-zaman', () => GM.secimSheet({baslik: 'Kaç kişi, ne zaman?', tam: false, d: {kisi: d.kisi, tarih: d.tarih, saat: d.saat}, bos: {kisi: 2, tarih: 'bugun', saat: '20:00'},
        ciz: z => GM.secimBolum({baslik: 'Kişi sayısı', ikon: 'kisi', html: GM.stepper({ad: 'kisi', deger: z.kisi, min: 1, max: 12, aria: 'Kişi sayısı'})}) + GM.secimBolum({baslik: 'Tarih', ikon: 'takvim', html: GM.segment({ad: 'tarih', etiket: 'Tarih', ogeler: TARIH.map(([v, a]) => ({ad: a, deger: v})), secili: z.tarih})}) + GM.secimBolum({baslik: 'Saat', ikon: 'saat', html: GM.cipler({ad: 'saat', tur: 'tek', serit: false, ogeler: SAAT.map(s => ({metin: saatMetin(s), deger: s})), secili: z.saat})}),
        say: z => otSonuc(d, z).filter(x => !x.u.kapali).length, birim: 'mekân', uygula: z => { Object.assign(d, {kisi: +z.kisi, tarih: z.tarih, saat: z.saat}); ciz(); }})));
      c.push(GM.eylem(kok, 'filtre', () => GM.mekanFiltreSheet({kaynak: M().filter(m => m.rezervasyon), secili: d.secili, q: d.q, uygula: s => { d.secili = s; ciz(); }})));
      c.push(GM.eylem(kok, 'konum', () => GM.konumSheet({secili: d.konum, sec: k => { d.konum = k; ciz(); }})));
      c.push(GM.eylem(kok, 'temizle', () => { d.secili = {}; d.hizli = []; d.konum = {}; ciz(); }));
      c.push(GM.on(kok, 'ot-hizli', v => { d.hizli = v; ciz(); }));
      // Saat ve Bildir: rezervasyon yalnız üyeye açık (web); misafir üye duvarını görür.
      const duvar = () => GM.uyeDuvar({baslik: 'Rezervasyon için üye ol', metin: 'Masa talebi göndermek ve rezervasyonlarını **tek yerden** izlemek için üye ol.'});
      c.push(GM.eylem(kok, 'slot', el => { if (!GM.uye()) { duvar(); return; } const m = GM.mekan(el.dataset.id), t = TARIH.find(x => x[0] === d.tarih); GM.dialog({baslik: 'Rezervasyon talebi', metin: `**${m.ad}** · ${d.kisi} kişi · ${t[2]} ${saatMetin(el.dataset.saat)}. İşletme onaylayınca bildirim gelir.`, eylem: 'Talebi gönder', iptal: 'Vazgeç'}).then(ok => ok && GM.toast(`Talebin **${m.ad}**’a gönderildi`, {tur: 'basari'})); }));
      c.push(GM.eylem(kok, 'bildir', el => { if (!GM.uye()) { duvar(); return; } const m = GM.mekan(el.dataset.id); el.setAttribute('aria-pressed', 'true'); GM.toast(`**${m.ad}** bu saatte talep almaya başlarsa haber vereceğiz`, {ikon: 'bildirim'}); }));
      return () => { io?.disconnect(); clearTimeout(ciz.z); c.forEach(f => f()); };
    }
  });

  // ================= ref-liste-3 · Beli kalıbı =================
  let B = null;
  const BELI_SEKME = d => [{ad: 'Gittim', deger: 'gittim', sayi: GM.listem.oku('gittim').length}, {ad: 'Gideceğim', deger: 'gidecegim', sayi: GM.listem.oku('gidecegim').length}, {ad: 'Keşfet', deger: 'kesfet'}];
  const beliListe = d => { const s = {...konumGrup(d.konum), ...d.secili}; if (d.sekme === 'kesfet') return GM.mekanSuz(M(), s, d.q); const id = new Set(GM.mekanSuz(M(), s, d.q).map(m => m.slug)); return GM.listem.oku(d.sekme).filter(x => id.has(x)).map(GM.mekan).filter(Boolean); };
  const beliSatir = (m, d) => { const g = GM.listem.var('gittim', m.slug), w = GM.listem.var('gidecegim', m.slug);
    if (d.sekme === 'gittim') return GM.listeSiraSatir(m, {sira: GM.listem.oku('gittim').indexOf(m.slug) + 1, eylem: GM.ikonBtn({ikon: 'more', etiket: `${m.ad} için seçenekler`, veri: {eylem: 'sira-menu', id: m.slug}})});
    return GM.listeOneriSatir(m, {gittim: g, gidecegim: w}); };
  // Gittim özeti veriden: mekân · şehir · en sık mutfak; listedeki mekânlar bir hazır rotada toplanıyorsa o rotaya çağrı (Gourmet'e özgü).
  const beliOzet = l => { const say = {}; l.forEach(m => m.mutfak.forEach(x => { say[x] = (say[x] || 0) + 1; })); const enc = Object.entries(say).sort((a, b) => b[1] - a[1])[0]; return GM.stat([{deger: GM.sayi(l.length), etiket: 'mekân'}, {deger: new Set(l.map(m => m.il)).size, etiket: 'şehir'}, ...(enc ? [{deger: enc[1], etiket: enc[0]}] : [])]); };
  const beliRota = l => { const r = {}; l.forEach(m => { const b = GM.mekanRotada(m.slug); if (b) (r[b.rota.id] = r[b.rota.id] || {...b.rota, n: 0}).n += 1; }); const en = Object.values(r).sort((a, b) => b.n - a.n)[0]; return en && en.n >= 1 ? GM.eylemKart({ikon: 'rota', baslik: `${en.ad} rotasında ${en.n} mekânın var`, alt: 'Dada Route’ta durak olarak aç', git: `#/rota/${en.id}`}) : ''; };
  const beliBaslik = (d, n, l = []) => (d.sekme === 'gittim' ? GM.bas('Sıran') + GM.p('En çok sevdiğin en üstte. Sıra **karşılaştırmayla** kurulur; puan verilmez.', {meta: true}) + beliOzet(l) : d.sekme === 'gidecegim' ? GM.bas(`Gideceklerin · ${GM.sayi(n)}`) : GM.bas(`Keşfet · ${GM.sayi(n)} mekân`) + GM.p('Gittiysen **Gittim** de, listende yerini bulalım; gitmek istiyorsan **kaydet**.', {meta: true}));
  const beliBos = d => (d.sekme === 'gittim' ? GM.bos({ikon: 'circle-check', baslik: 'Gittiğin mekânları sırala', metin: 'Keşfet’te gittiğin bir mekâna **Gittim** de; birkaç karşılaştırmayla listendeki yerini bulalım.', eylem: {metin: 'Keşfet’e geç', ikon: 'kesfet', veri: {eylem: 'kesfete'}}}) : d.sekme === 'gidecegim' ? GM.bos({ikon: 'kaydet', baslik: 'Gideceğin mekânlar burada', metin: 'Keşfet’te bir mekânı **kaydet**; gidince tek dokunuşla sıralarsın.', eylem: {metin: 'Keşfet’e geç', ikon: 'kesfet', veri: {eylem: 'kesfete'}}}) : bos());
  const beliKanca = () => (GM.uye() ? '' : GM.kanca({metin: 'Listelerini her cihazda saklamak için üye ol', ikon: 'lock'}));
  const beliIcerik = (d, l = beliListe(d)) => {
    if (d.gorunum === 'harita') return GM.harita({ad: 'beli-harita', yukseklik: 'calc(var(--gm-ekran-h) - var(--gm-ust-h) - var(--gm-s-64) * 3)', kume: d.sekme === 'kesfet' || l.length > 40, etiket: 'Liste haritası', pinler: l.map((m, i) => ({id: m.slug, lng: m.lng, lat: m.lat, ad: m.ad, ...(d.sekme === 'gittim' && l.length <= 40 ? {sira: i + 1} : {})})), dolgu: {top: 40, bottom: 40, left: 40, right: 40}}) + (l.length ? '' : beliBos(d));
    return l.length ? beliBaslik(d, l.length, l) + (d.sekme === 'gittim' ? beliRota(l) : '') + GM.mekanSatirlar(l.slice(0, SAYFA).map(m => beliSatir(m, d))) + beliKanca() : beliBos(d) + beliKanca();
  };
  const beliArac = d => GM.segment({ad: 'beli-sekme', etiket: 'Listeler', ogeler: BELI_SEKME(d), secili: d.sekme}) + GM.haritaCipSerit({ad: 'beli-yok', on: GM.filtreHap({metin: d.gorunum === 'harita' ? 'Liste' : 'Harita', ikon: d.gorunum === 'harita' ? 'list' : 'harita', ana: true, ok: false, veri: {eylem: 'gorunum'}}) + GM.filtreHap({metin: konumKisa(d.konum), ikon: 'pin', secili: !!d.konum.il, veri: {eylem: 'konum'}}) + GM.filtreHap({metin: 'Süzgeç', ikon: 'filtre', sayi: GM.filtreSay(d.secili), secili: GM.filtreSay(d.secili) > 0, veri: {eylem: 'filtre'}}), ogeler: []});

  GM.ekran('ref-liste-3', {
    tur: 'alt', baslik: 'Listelerim', ust: '#/alternatifler', iskelet: 'satir',
    bos: {ikon: 'mekan', baslik: 'Henüz mekân eklenmedi', metin: 'Yeni mekânlar **eklendikçe** burada listelenecek.', eylem: {metin: 'Keşfet’e dön', tur: 'secondary', yerine: '#/kesfet'}},
    ustBar: () => ({sag: [{ikon: 'paylas', etiket: 'Listemi paylaş', veri: {eylem: 'liste-paylas'}}]}),
    ciz: ctx => {
      if (!B || B.hash !== ctx.hash) B = {hash: ctx.hash, sekme: ctx.sorgu.sekme || (GM.listem.oku('gittim').length ? 'gittim' : 'kesfet'), gorunum: 'liste', q: '', secili: {}, konum: {}};
      return GM.yapiskanArac(beliArac(B) + (B.sekme === 'kesfet' ? GM.arama({yer: 'Mekân, mutfak ya da semt ara', ad: 'q', deger: B.q, sonuc: false}) : '')) + GM.listeGovde(beliIcerik(B));
    },
    sonra: kok => {
      const d = B, c = []; let io = null;
      const tazele = () => { const y = kok.querySelector('.gm-kaydir')?.scrollTop || 0; GM.tazele(); kok.querySelector('.gm-kaydir')?.scrollTo({top: y}); };
      io = d.gorunum === 'liste' ? sonsuzKur(kok, beliListe(d), m => beliSatir(m, d)) : null;
      c.push(GM.kaydetBagla(kok), aramaBagla(kok, d, () => { io?.disconnect(); const kap = kok.querySelector('[data-kl-sonuc]'); kap.innerHTML = beliIcerik(d); io = sonsuzKur(kok, beliListe(d), m => beliSatir(m, d)); }));
      c.push(GM.on(kok, 'beli-sekme', v => { d.sekme = v; GM.tazele(); kok.querySelector('.gm-kaydir')?.scrollTo({top: 0}); }));
      c.push(GM.eylem(kok, 'liste-paylas', () => GM.paylas({baslik: 'Dada Gourmet listem', url: 'https://dadagourmet.com/listem'})));
      c.push(GM.eylem(kok, 'kesfete', () => { d.sekme = 'kesfet'; GM.tazele(); }));
      c.push(GM.eylem(kok, 'gorunum', () => { d.gorunum = d.gorunum === 'harita' ? 'liste' : 'harita'; GM.tazele(); }));
      c.push(GM.eylem(kok, 'konum', () => GM.konumSheet({secili: d.konum, sec: k => { d.konum = k; GM.tazele(); }})));
      c.push(GM.eylem(kok, 'filtre', () => GM.mekanFiltreSheet({secili: d.secili, q: d.q, uygula: s => { d.secili = s; GM.tazele(); }})));
      c.push(GM.eylem(kok, 'temizle', () => { d.secili = {}; d.konum = {}; d.q = ''; GM.tazele(); }));
      // Gittim: gideceklerden çıkar, ikili karşılaştırmayla sıraya yerleştir. Zaten listedeyse sırası söylenir.
      const yerlestir = slug => { const m = GM.mekan(slug); GM.listem.cikar('gidecegim', slug); const l = GM.listem.oku('gittim').filter(x => x !== slug);
        GM.kiyasla({yeni: slug, liste: l, bitti: i => { GM.listem.yaz('gittim', [...l.slice(0, i), slug, ...l.slice(i)]); tazele(); GM.toast(l.length ? `**${m.ad}** listende **${i + 1}.** sırada` : `İlk mekânın: **${m.ad}**`, {tur: 'basari', eylem: 'Listeyi gör', onEylem: () => { d.sekme = 'gittim'; GM.tazele(); }}); }}); };
      c.push(GM.eylem(kok, 'gittim', el => { const slug = el.dataset.id; if (GM.listem.var('gittim', slug)) { GM.toast(`**${GM.mekan(slug).ad}** listende **${GM.listem.oku('gittim').indexOf(slug) + 1}.** sırada`, {eylem: 'Yeniden sırala', onEylem: () => yerlestir(slug)}); return; } yerlestir(slug); }));
      c.push(GM.eylem(kok, 'gidecegim', el => { const slug = el.dataset.id, m = GM.mekan(slug); if (GM.listem.var('gidecegim', slug)) { GM.listem.cikar('gidecegim', slug); GM.toast(`**${m.ad}** gideceklerinden çıktı`); } else { GM.listem.ekle('gidecegim', slug); GM.toast(`**${m.ad}** gideceklerinde`, {ikon: 'kaydet'}); } tazele(); }));
      c.push(GM.eylem(kok, 'sira-menu', el => { const slug = el.dataset.id, m = GM.mekan(slug); GM.siralaSheet({baslik: m.ad, etiket: 'Seçenekler', secenekler: [['yeniden', 'Yeniden sırala', 'sirala'], ['tasi', 'Gideceklerime taşı', 'kaydet'], ['cikar', 'Listeden çıkar', 'sil']], secili: null, sec: v => {
        if (v === 'yeniden') yerlestir(slug);
        else if (v === 'tasi') { GM.listem.cikar('gittim', slug); GM.listem.ekle('gidecegim', slug); tazele(); GM.toast(`**${m.ad}** gideceklerine taşındı`); }
        else { const once = GM.listem.oku('gittim'); GM.listem.cikar('gittim', slug); tazele(); GM.toast(`**${m.ad}** listeden çıktı`, {eylem: 'Geri al', onEylem: () => { GM.listem.yaz('gittim', once); tazele(); }}); }
      }}); }));
      return () => { io?.disconnect(); c.forEach(f => f()); };
    }
  });

  // ================= ref-liste-4 · Mapstr kalıbı =================
  let P = null;
  const has = (m, g, v) => (m.f[g] || []).includes(v);
  // Etiketler veriden (mutfak, konsept); pin rengi ilk eşleşen etiketin rengidir. Kişisel etiketler: Kaydettiklerim (favori), Gideceğim (kişisel liste).
  const ETIKET = [
    {id: 'deniz', ad: 'Deniz ürünleri', ikon: 'fish', renk: 1, esle: m => has(m, 'mutfak', 'deniz-urunleri')},
    {id: 'sef', ad: 'Şef restoranı', ikon: 'sef', renk: 2, esle: m => has(m, 'konsept', 'sef-restorani')},
    {id: 'kebap', ad: 'Kebap ve ocakbaşı', ikon: 'fire-flame-curved', renk: 3, esle: m => has(m, 'mutfak', 'kebap-ocakbasi')},
    {id: 'dunya', ad: 'Dünya mutfağı', ikon: 'globe', renk: 4, esle: m => ['italyan-mutfagi', 'japon-mutfagi', 'fransiz-mutfagi', 'hint-mutfagi', 'meksika-mutfagi'].some(v => has(m, 'mutfak', v))},
    {id: 'anadolu', ad: 'Anadolu ve yöresel', ikon: 'wheat-awn', renk: 5, esle: m => ['anadolu-mutfagi', 'guneydogu-mutfagi', 'ic-anadolu-mutfagi'].some(v => has(m, 'mutfak', v)) || has(m, 'konsept', 'yoresel-lezzet-noktasi')},
    {id: 'ege', ad: 'Ege ve Akdeniz', ikon: 'lemon', renk: 6, esle: m => has(m, 'mutfak', 'ege-mutfagi') || has(m, 'mutfak', 'akdeniz-mutfagi')},
    {id: 'manzara', ad: 'Manzaralı', ikon: 'mountain-sun', renk: 7, esle: m => has(m, 'konsept', 'manzarali')},
    {id: 'turk', ad: 'Türk mutfağı', ikon: 'mekan', renk: 8, esle: m => has(m, 'mutfak', 'turk-mutfagi')}
  ];
  const KISISEL = [{id: 'kayitli', ad: 'Kaydettiklerim', ikon: 'favori', renk: 10, esle: m => ks().has(m.slug)}, {id: 'gidecek', ad: 'Gideceğim', ikon: 'kaydet', renk: 9, esle: m => GM.listem.var('gidecegim', m.slug)}];
  // Rota etiketleri (Gourmet'e özgü): hazır Dada Route rotalarının önerilen durakları (GM.rotaOneri); tek rota seçiliyse çizgisi haritaya çizilir.
  const ROTA_ET = (GMV.rotalar || []).map(r => ({r, l: new Set(GM.rotaOneri(r).map(x => x.slug))})).filter(x => x.l.size).map(x => ({id: `rota:${x.r.id}`, ad: x.r.ad, ikon: 'rota', renk: 2, rota: x.r, esle: m => x.l.has(m.slug)}));
  const pinEtiket = m => ETIKET.find(e => e.esle(m)) || ETIKET.at(-1);
  const mpListe = d => { const tum = [...KISISEL, ...ETIKET, ...ROTA_ET], sec = tum.filter(e => d.etiket.includes(e.id)); return GM.mekanSuz(M(), konumGrup(d.konum), d.q).filter(m => !sec.length || sec.some(e => e.esle(m))); };
  const mpPin = (m, sec) => { const e = pinEtiket(m), kisisel = KISISEL.some(k => k.esle(m)); return {id: m.slug, lng: m.lng, lat: m.lat, aria: `${m.ad} · ${e.ad}`, ikon: e.ikon, sinif: `gm-kl-et-${e.renk}${kisisel ? ' is-kayitli' : ''}`, secili: m.slug === sec, ad: m.ad}; };
  const mpPanel = d => GM.etiketPanel({acik: d.panel, baslik: 'Etiketlerim', alt: `${GM.sayi(M().length)} yer · ${ETIKET.length + KISISEL.length + ROTA_ET.length} etiket`, ogeler: [...KISISEL.map((e, i) => ({...e, sayi: M().filter(e.esle).length, secili: d.etiket.includes(e.id), ayrac: i ? null : 'Kişisel'})), ...ETIKET.map((e, i) => ({...e, sayi: M().filter(e.esle).length, secili: d.etiket.includes(e.id), ayrac: i ? null : 'Mutfak ve ortam'})), ...ROTA_ET.map((e, i) => ({...e, sayi: GM.rotaSayi(e.rota).onerilen, secili: d.etiket.includes(e.id), ayrac: i ? null : 'Dada Route rotaları'}))]});
  const mpUst = d => { const n = d.etiket.length; return GM.haritaArama({yer: 'Haritamda ara', ad: 'q', deger: d.q, filtre: false}) + GM.haritaCipSerit({ad: 'mp-yok', on: GM.filtreHap({metin: n ? `${n} etiket` : 'Etiketler', ikon: 'tag', ana: true, ok: false, veri: {eylem: 'etiket-panel'}}) + GM.filtreHap({metin: konumKisa(d.konum), ikon: 'pin', secili: !!d.konum.il, veri: {eylem: 'konum'}}) + [...KISISEL, ...ETIKET, ...ROTA_ET].filter(e => d.etiket.includes(e.id)).map(e => GM.filtreHap({metin: e.ad, ikon: e.ikon, secili: true, ok: false, sinif: `gm-kl-et-${e.renk}`, veri: {eylem: 'etiket-cikar', id: e.id}})).join(''), ogeler: []}); };
  const mpGruplar = d => { const l = mpListe(d), g = new Map(); l.forEach(m => { const e = pinEtiket(m); (g.get(e) || g.set(e, []).get(e)).push(m); }); return l.length ? ETIKET.filter(e => g.has(e)).map(e => GM.etiketBaslik({...e, sayi: g.get(e).length}) + GM.mekanSatirlar(g.get(e).slice(0, d.acilan.includes(e.id) ? 99 : 4).map(m => GM.mekanKart(m, {tur: 'satir', kayitli: ks().has(m.slug)}))) + (g.get(e).length > 4 && !d.acilan.includes(e.id) ? GM.btn({metin: `${g.get(e).length - 4} mekân daha`, tur: 'text', ikon: 'ac', veri: {eylem: 'grup-ac', id: e.id}}) : '')).join('') : bos('mp-temizle'); };

  GM.ekran('ref-liste-4', {
    tur: 'tam', baslik: 'Haritam', ust: '#/alternatifler', iskelet: 'satir',
    bos: {ikon: 'mekan', baslik: 'Henüz mekân eklenmedi', metin: 'Yeni mekânlar **eklendikçe** burada listelenecek.', eylem: {metin: 'Keşfet’e dön', tur: 'secondary', yerine: '#/kesfet'}},
    ciz: ctx => {
      if (!P || P.hash !== ctx.hash) P = {hash: ctx.hash, etiket: [], konum: {}, q: '', panel: ctx.sorgu.panel === '1', gorunum: ctx.sorgu.gorunum === 'liste' ? 'liste' : 'harita', secim: null, acilan: []};
      const d = P, l = mpListe(d), rs = ROTA_ET.filter(e => d.etiket.includes(e.id)), rota = rs.length === 1 ? rs[0].rota : null;
      if (d.gorunum === 'liste') return GM.yapiskanArac(mpUst(d)) + GM.listeGovde(mpGruplar(d)) + GM.yuzenDugme({metin: 'Harita', ikon: 'harita', veri: {eylem: 'mp-gorunum'}, yer: 'sabit'});
      return GM.haritaEkran({
        harita: GM.harita({ad: 'mp-harita', tam: true, kume: !rota, koridor: !!rota, rota: rota ? {cizgi: rota.cizgi} : undefined, kontroller: false, etiket: 'Etiketli harita', pinler: l.map(m => mpPin(m, d.secim)), dolgu: {top: 168, bottom: 112, left: 56, right: 56}}),
        ust: mpUst(d), arac: mpPanel(d), secim: true,
        yuzen: GM.yuzenDugme({metin: 'Liste', ikon: 'list', sayi: l.length, veri: {eylem: 'mp-gorunum'}, yer: 'serbest'})
      });
    },
    sonra: kok => {
      const d = P, c = [];
      const harita = () => kok.querySelector('.gm-harita'), hsec = () => kok.querySelector('.gm-kl-hsecim');
      const yenile = () => { d.secim = null; GM.tazele(); };
      c.push(GM.kaydetBagla(kok), aramaBagla(kok, d, () => { const y = kok.querySelector('input[name="q"]'); yenile(); const i = kok.querySelector('input[name="q"]'); if (i && y) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }));
      c.push(GM.eylem(kok, 'etiket-panel', () => { d.panel = !d.panel; kok.querySelector('[data-etiket-panel]')?.classList.toggle('is-acik', d.panel); if (d.gorunum === 'liste' && d.panel) { d.gorunum = 'harita'; GM.tazele(); } }));
      c.push(GM.eylem(kok, 'etiket-cikar', el => { d.etiket = d.etiket.filter(x => x !== el.dataset.id); yenile(); }));
      c.push(GM.eylem(kok, 'mp-gorunum', () => { d.gorunum = d.gorunum === 'harita' ? 'liste' : 'harita'; d.panel = false; GM.tazele(); }));
      c.push(GM.eylem(kok, 'konum', () => GM.konumSheet({secili: d.konum, sec: k => { d.konum = k; yenile(); }})));
      c.push(GM.eylem(kok, 'mp-temizle', () => { d.etiket = []; d.konum = {}; d.q = ''; yenile(); }));
      c.push(GM.eylem(kok, 'grup-ac', el => { d.acilan.push(el.dataset.id); GM.tazele(); }));
      // Etiket dokunuşu: süzgeç değişir, harita yeniden kurulur, panel açık kalır.
      const etiketTik = ev => { const b = ev.target.closest('[data-etiket]'); if (!b) return; const id = b.dataset.etiket; d.etiket = d.etiket.includes(id) ? d.etiket.filter(x => x !== id) : [...d.etiket, id]; d.panel = true; yenile(); };
      kok.addEventListener('click', etiketTik); c.push(() => kok.removeEventListener('click', etiketTik));
      // Pine dokunuş: altta mekân kartı (etiket rengi rozetiyle), harita pine yakınlaşır.
      c.push(GM.on(kok, 'mp-harita', slug => { const m = GM.mekan(slug), e = pinEtiket(m); d.secim = slug; d.panel = false; kok.querySelector('[data-etiket-panel]')?.classList.remove('is-acik');
        hsec().innerHTML = GM.mekanKart(m, {tur: 'harita', secili: true, eylem: GM.btn({metin: 'Mekânı aç', ikon: 'mekan', boyut: 'sm', git: `#/mekan/${slug}`}) + GM.btn({metin: e.ad, ikon: e.ikon, tur: 'secondary', boyut: 'sm', veri: {eylem: 'etiket-sec', id: e.id}})}); hsec().classList.add('is-gorunur');
        GM.haritaSec(harita(), slug, {zoom: 13, kaydir: [0, -GM.TK.space[64] * 1.5]}); }));
      c.push(GM.eylem(kok, 'etiket-sec', el => { d.etiket = [el.dataset.id]; yenile(); }));
      return () => c.forEach(f => f());
    }
  });

  // ---------- Karşılaştırma sayfası kayıtları (#/alternatifler) ----------
  GM.alternatifKaydet({ekran: 'liste', kod: 'ref-liste-1', sira: 4, ad: 'Liste · TheFork kalıbı', referans: 'TheFork (Avrupa’nın önde gelen rezervasyon uygulaması; ödül doğrulanmadı)', alinan: 'Hap süzgeçler ve alt alta bölümlü süzgeç sayfası: zaman segmenti, ortalama puan ve fiyat kaydırıcısı, canlı sonuç sayılı düğme.', gerekce: 'Webin 14 süzgeç grubunu akordeonsuz, tek kaydırmada ve en sık kullanılanları üstte hap olarak sunar.', git: '#/ref/liste-1', iyilesti: 'Gourmet’e özgü “Yol üstü” hapı (Dada Route önerilen durakları), kartta rotaya götüren sapma etiketi, tek seçimde hapın seçimin adını göstermesi.'});
  GM.alternatifKaydet({ekran: 'liste', kod: 'ref-liste-2', sira: 5, ad: 'Liste · OpenTable kalıbı', referans: 'OpenTable (kategoride global lider; ödül doğrulanmadı)', alinan: 'Kişi · tarih · saat kapsülü ve satırda saat düğmeleri; o saatte talep almayan mekânda Bildir.', gerekce: 'Rezervasyon alan 161 mekânı “bu akşam nereye?” sorusuyla listeler; açıklık verisi gerçek, saatler talep saatidir.', git: '#/ref/liste-2', iyilesti: 'Yolculukta masa: “Yol üstü” hızlı süzgeci ve satırda rotaya götüren “Yol üstü · İstanbul – İzmir” etiketi; kapalı satır soluk, sheet düğmesi kısa.'});
  GM.alternatifKaydet({ekran: 'liste', kod: 'ref-liste-3', sira: 6, ad: 'Liste · Beli kalıbı', referans: 'Beli (restoran sıralama uygulaması; ödül doğrulanmadı)', alinan: 'Gittim / Gideceğim listeleri ve yeni mekânı ikili karşılaştırmayla sıraya yerleştirme.', gerekce: 'Puan uydurmadan kişisel sıralama verir; Keşfet sekmesi tüm mekân listesini ve süzgeçleri korur.', git: '#/ref/liste-3', iyilesti: 'Gittim sekmesinde kişisel özet (mekân · şehir · en sık mutfak) ve listendekileri hazır rotada açan Dada Route çağrısı, listeyi paylaş.'});
  GM.alternatifKaydet({ekran: 'liste', kod: 'ref-liste-4', sira: 7, ad: 'Liste · Mapstr kalıbı', referans: 'Mapstr (kişisel harita uygulaması; ödül doğrulanmadı)', alinan: 'Renkli etiket pinleri ve soldan açılan sayılı etiket paneli; liste görünümünde etiket grupları.', gerekce: 'Mutfak ve ortamı haritada renkle okutur, kişisel kayıtları aynı haritada ayırt eder.', git: '#/ref/liste-4', iyilesti: 'Panelde “Dada Route rotaları” etiket grubu: rota seçilince önerilen durakları ve rota çizgisi koridoruyla haritada; kişisel renkler ayrıştı.'});
})();
