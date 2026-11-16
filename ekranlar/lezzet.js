/* Gurme Lezzetler ve Şehir Rehberleri (sahibi: lezzet-ara, Görev 12). Rotalar: #/lezzetler · #/lezzet/:slug · #/rehberler · #/rehber/:slug.
 * Kalıp: Diet ipuclari/ipucu (Gastro liste-v2 + püf detayı). İlk sürümdeki fikirler (icerik ajanı) korunarak yeniden yazıldı.
 * Web: /gurme-lezzetler (12 kategori, En Yeni / En Çok Okunan, ?q=, 24'lük sayfa → mobilde sonsuz kaydırma), /gurme-lezzetler/{slug}
 * (kategori, başlık, yazar, tarih, okuma, son güncelleme, görüntülenme, H2 bölümler, Okuyucunun Dikkatine, etiketler → ?q=, Paylaş, İlgili Keşifler),
 * /sehir-rehberleri (+ /{slug}): yayındaki editör rehberi İstanbul; mobilde coğrafi işaret kimliği ya da yayında mekânı olan her şehir (GMX.sehirler).
 * Veri: GMV.lezzetler (440), GMX (kesif-veri.js: kategori, okunma sırası, lezzet → il, coğrafi işaret → yazı, şehirler, editör rehberi),
 * yazı gövdesi tembel: veri/lezzet-govde.js (GM.yukleVeri; yüklenemezse özet + sakin not, metin uydurulmaz). Puan/okunma sayısı uydurulmaz:
 * görüntülenme yalnız canlıdan gelen 249 yazıda.
 * Ekrana özgü hâller: #/lezzetler?hal=kategori-bos | sonuc-yok · #/lezzet/:slug?hal=bulunamadi | metin-yok · #/rehberler?hal=sonuc-yok · #/rehber/:slug?hal=bulunamadi.
 * Dış bağlantı: #/lezzetler?kategori=<deger>&siralama=populer&q=metin · #/rehberler?bolge=Ege.
 * Kalıcı: 'lezzet-kayit' (yazı slug listesi; üyede tohum GMX.hesap.favoriler.lezzet; misafirde üye duvarı). */
(() => {
  const L = () => GMV.lezzetler || [];
  const X = () => window.GMX || {};
  const SAYFA = 24, BEKLE = () => (GM.azHareket() ? 0 : GM.TK.motion.oneri.skeletonDelay);
  const kategoriler = () => X().lezzetKategori || [];
  const katBul = v => kategoriler().find(k => k.deger === v || k.ad === v) || null;
  const katIkon = ad => katBul(ad)?.ikon || 'book-open';
  const iso = t => String(t || '').split('.').reverse().join('-');
  const tarih = l => GM.tarihUzun(iso(l.tarih));
  const dk = l => parseInt(l.sure, 10) || null;
  const okunma = l => X().lezzetOku?.[l.slug] ?? 9999;
  const bul = slug => L().find(l => l.slug === slug) || null;
  const webUrl = l => `https://dadagourmet.com/gurme-lezzetler/${l.slug}`;
  const kayitlar = () => GM.durum.oku('lezzet-kayit', GM.yeniHesap() ? [] : (X().hesap?.favoriler?.lezzet || [])) || [];
  const govdeOf = slug => GMV.lezzetGovde?.[slug] || null;
  const yaziGit = l => `#/lezzet/${l.slug}`;

  // Liste sayfası başı (Görev 14, Beyar: ortak hero = Mekân Bul): GM.selamBas (kısa foto + mor perde + üst yazı + <em> vurgulu başlık + kavis);
  // sayı şeridi hero'nun altında (GM.stat yalın, etkinlikler ile aynı); altında yapışkan araç (arama, segment, çipler) ve liste. Kalıp: mekan-bul.js, rota.js.
  const listeUst = o => `${GM.selamBas({gorsel: o.gorsel, ust: o.ust, baslikHtml: o.baslikHtml})}<div class="gm-ic">${GM.stat(o.stat, {yalin: true})}</div>${o.arac}<div class="gm-liste-icerik">${o.html}</div>`;

  // ================= Liste (#/lezzetler) =================
  const SURE = [{deger: '3', ad: '3 dk', min: 0, max: 3}, {deger: '4-5', ad: '4-5 dk', min: 4, max: 5}, {deger: '6-8', ad: '6-8 dk', min: 6, max: 8}, {deger: '9', ad: '9 dk ve üstü', min: 9, max: 99}];
  const SIRALAR = [['yeni', 'En yeni', 'clock'], ['populer', 'En çok okunan', 'fire'], ['kisa', 'En kısa okuma', 'hourglass-start'], ['ad', 'A’dan Z’ye', 'arrow-down-a-z']];
  const GRUPLAR = ['kategori', 'sure'];
  const bosF = () => ({kategori: [], sure: []});
  const durumKur = ctx => {
    const q = ctx.sorgu, s = {hash: ctx.hash, q: q.q || '', sira: SIRALAR.some(x => x[0] === q.siralama) ? q.siralama : 'yeni', gorunum: 'izgara', f: bosF(), bosKat: false};
    if (katBul(q.kategori)) s.f.kategori = [katBul(q.kategori).deger];
    if (q.hal === 'kategori-bos') { s.f.kategori = ['gastronomi-seyahati']; s.bosKat = true; }
    if (q.hal === 'sonuc-yok') s.q = 'sufle';
    return s;
  };
  const secimSayi = s => GRUPLAR.reduce((n, g) => n + s.f[g].length, 0);
  const metinler = new Map();
  const metin = l => { if (!metinler.has(l.slug)) metinler.set(l.slug, GM.katla(`${l.ad} ${l.ozet} ${l.kategori} ${l.etiket.join(' ')}`)); return metinler.get(l.slug); };
  const eslesir = (l, g, v) => { if (g === 'kategori') return katBul(v)?.ad === l.kategori; const a = SURE.find(x => x.deger === v), d = dk(l); return !!a && d != null && d >= a.min && d <= a.max; };
  // ?hal=kategori-bos: seçili kategori henüz yazısı olmayan kategori gibi davranır (kategori boş hâli).
  const suz = (s, f = s.f, haric) => {
    const q = GM.katla(s.q).split(/\s+/).filter(Boolean);
    if (s.bosKat && haric !== 'kategori' && f.kategori.length) return [];
    return L().filter(l => GRUPLAR.every(g => g === haric || !f[g].length || f[g].some(v => eslesir(l, g, v))) && q.every(p => metin(l).includes(p)));
  };
  const say = (s, f, g, v) => (s.bosKat && g === 'kategori' && f.kategori.includes(v) ? 0 : suz(s, f, g).filter(l => eslesir(l, g, v)).length);
  const sirala = (l, sira) => {
    if (sira === 'yeni') return l;   // veri canlının "En Yeni" sırasında gelir (web lezzetler.js)
    const ad = (a, b) => a.ad.localeCompare(b.ad, 'tr');
    return [...l].sort({populer: (a, b) => okunma(a) - okunma(b), kisa: (a, b) => (dk(a) ?? 99) - (dk(b) ?? 99) || ad(a, b), ad}[sira]);
  };

  // Kart (yığılma kuralı 3): kategori foto üstünde hap (gm-ka-puf; tek kelimelik kısa ad, "…" ile bitmez), başlık en çok 2 satır, altında okuma süresi (Görev 14/9, Beyar: kırpma yerine 2 satır; kart altı en çok 3 satır).
  // Kapaksız yazı (193/440, canlıda kapak yok): kategori tonlu zemin + büyük kategori ikonu (token değişkeni; kanon: .gm-puf-foto.is-yok). Sıra görsele göre değişmez.
  const kart = l => { const k = katBul(l.kategori); return GM.icerikKart({gorsel: l.gorsel, ikon: katIkon(l.kategori), kategori: k?.kisa || l.kategori, baslik: l.ad, meta: l.sure, git: yaziGit(l), sinif: 'gm-ka-puf is-iki-satir', attrs: !l.gorsel && k?.ton ? `style="--gm-puf-ton:var(--gm-${k.ton});--gm-puf-ton-fg:var(--gm-${k.tonFg})"` : ''}); };
  const satir = l => GM.satir({sol: GM.gorsel({src: l.gorsel, ikon: katIkon(l.kategori)}), baslik: l.ad, alt: `${l.kategori} · ${l.sure}`, git: yaziGit(l)});
  const ogeler = (l, s) => l.map(s.gorunum === 'liste' ? satir : kart);
  const sonucHtml = (l, s) => GM.listeSonuc(s.gorunum === 'liste' ? [GM.satirlar(ogeler(l, s))] : ogeler(l, s), {gorunum: s.gorunum});
  const segment = s => GM.segment({ad: 'sira', etiket: 'Sıralama', secili: ['yeni', 'populer'].includes(s.sira) ? s.sira : '', ogeler: [{ad: 'En yeni', deger: 'yeni'}, {ad: 'En çok okunan', deger: 'populer'}]});
  const serit = s => GM.cipSerit({ad: 'kategori', tur: 'tek', etiket: 'Kategori', secili: s.f.kategori.length === 1 ? s.f.kategori[0] : s.f.kategori.length ? null : '', ogeler: [{metin: 'Hepsi', deger: '', ikon: 'layer-group', sayi: suz(s, s.f, 'kategori').length}, ...kategoriler().map(k => ({metin: k.ad, deger: k.deger, ikon: k.ikon, sayi: say(s, s.f, 'kategori', k.deger)}))]});
  const ad = (g, v) => (g === 'kategori' ? katBul(v)?.ad : SURE.find(x => x.deger === v)?.ad) ?? v;
  const secimler = s => GM.listeTema({ad: 'secimler', baslik: 'Seçimlerin', ogeler: GRUPLAR.flatMap(g => s.f[g].map(v => ({metin: ad(g, v), kapat: true, etiket: `${ad(g, v)} seçimini kaldır`, veri: {eylem: 'kaldir', id: `${g}|${v}`}})))});
  const bosHtml = s => {
    if (s.bosKat) { const k = katBul(s.f.kategori[0]); return GM.listeBos({ikon: k?.ikon || 'book-open', baslik: 'Bu kategoride henüz yazı yok', metin: `**${k?.ad || 'Bu kategori'}** için yazılar yayınlandıkça burada listelenecek. Bu sırada **diğer kategorilere** göz atabilirsin.`, eylem: {metin: 'Tüm yazılar', tur: 'secondary', ikon: 'layer-group', veri: {eylem: 'temizle'}}}); }
    return GM.listeBos({ikon: 'book-open', baslik: 'Bu aramayla eşleşen keşif yok', metin: s.q ? `“**${s.q}**” için yazı bulamadık. Daha kısa yazmayı ya da **seçimlerini temizlemeyi** dene.` : 'Bu seçimlere uyan yazı yok. **Seçimlerini temizleyip** yeniden bak.', eylem: {metin: 'Seçimleri temizle', tur: 'secondary', ikon: 'yenile', veri: {eylem: 'temizle'}}});
  };
  const icerik = (s, l) => {
    const bas = secimSayi(s) > 1 || s.f.sure.length ? secimler(s) : '';
    const durum = GM.listeDurum({sayi: l.length, birim: 'yazı', gorunum: s.gorunum, siraliAktif: s.sira !== 'yeni'});
    return `${bas}${durum}${l.length ? sonucHtml(l.slice(0, SAYFA), s) : bosHtml(s)}`;
  };
  // Liste başı kısayolu (süzgeçsizken): Şehir Rehberleri.
  const ustKartlar = () => {
    // Görev 14/8: kaydedilen yazılar burada gösterilmez; Hesabım › Gurme Favorilerim › Lezzet ('lezzet-kayit').
    const sh = (X().sehirler?.() || []).filter(s => s.gorsel).length;
    return `${sh ? GM.eylemKart({ikon: 'sehir', baslik: 'Şehir Rehberleri', alt: `${sh} şehir rehberi · coğrafi işaretli lezzetler`, git: '#/rehberler'}) : ''}`;
  };

  let A = null, hataListe = false;
  GM.ekran('lezzetler', {
    tur: 'alt', baslik: 'Gurme Lezzetler', ust: '#/kesfet', iskelet: 'kart',
    ustBar: () => ({saydam: true}),   // hero (GM.selamBas) üstünde saydam, kayınca solid (etkinlikler, Mekân Bul kalıbı)
    bos: {ikon: 'book-open', baslik: 'Henüz yayınlanmış yazı yok', metin: 'Editörlerimiz yeni lezzet hikâyeleri **hazırlıyor**. Bu arada mekânlara göz at.', eylem: {metin: 'Mekânlar', ikon: 'mekan', yerine: '#/mekanlar'}},
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataListe) { hataListe = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(r => setTimeout(r, BEKLE()));
    },
    cekYenile: () => new Promise(r => setTimeout(r, GM.TK.motion.reveal * 2)),
    ciz: ctx => {
      if (!L().length) return GM.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: '#/lezzetler'}});
      if (!A || A.hash !== ctx.hash) A = durumKur(ctx);
      const s = A, kapak = sirala(L().filter(l => l.gorsel), 'populer')[0];
      return listeUst({
        gorsel: kapak?.gorsel, ust: 'Gurme Lezzetler',   // hero görseli tekrar etmez (lider): en çok okunan kapaklı yazının kapağı
        baslikHtml: 'Sofranın <em>hikâyesi</em>',
        stat: [{deger: GM.sayi(L().length), etiket: 'yazı'}, {deger: kategoriler().length, etiket: 'kategori'}, {deger: katBul('sefler-gastronomi-insanlari')?.sayi ?? 0, etiket: 'söyleşi'}],
        arac: GM.listeArac({yer: 'Yazı, lezzet ya da etiket ara', ad: 'q', deger: s.q, filtreSayi: secimSayi(s), segment: segment(s), serit: serit(s)}),
        html: `${s.q || secimSayi(s) ? '' : ustKartlar()}${GM.sonucYuva(icerik(s, sirala(suz(s), s.sira)))}`
      });
    },
    sonra: kok => {
      const s = A; if (!s) return null;
      const yuva = kok.querySelector('[data-kl-sonuc]'), arac = kok.querySelector('.gm-liste-arac'), girdi = arac?.querySelector('input'), c = [];
      let io = null, z = 0;
      const sonsuz = l => { io?.disconnect(); const kap = yuva.querySelector('.gm-liste-grid, .gm-liste-rows > .gm-satirlar'); if (kap) io = GM.sonsuzListe(kap, l, x => (s.gorunum === 'liste' ? satir(x) : kart(x)), {sayfa: SAYFA, birim: 'yazı'}); };
      const seritCiz = () => { const r = arac.querySelector('.gm-liste-rail'); if (!r) return; const x = r.firstElementChild?.scrollLeft || 0; r.innerHTML = serit(s); if (r.firstElementChild) r.firstElementChild.scrollLeft = x; };
      const segCiz = () => { const r = arac.querySelector('.gm-liste-scope'); if (r) r.innerHTML = segment(s); };
      // Yapışık araçta süzgeç değişince liste başı aracın hemen altına gelir (Diet ipuclari hizala).
      const ust = () => { const fark = yuva.getBoundingClientRect().top - arac.getBoundingClientRect().bottom; if (fark < 0) kok.querySelector('.gm-kaydir').scrollTop += fark; };
      // Süzgeç değişince: araç güncellenir, sonuç yuvası önce iskelet, sonra sonuç (mekanlar-a kalıbı).
      const ciz = (iskelet = true) => {
        const l = sirala(suz(s), s.sira);
        io?.disconnect(); yuva.parentNode.querySelectorAll('.gm-liste-son').forEach(x => x.remove());
        if (iskelet && l.length) {
          yuva.innerHTML = GM.listeDurum({sayi: l.length, birim: 'yazı', gorunum: s.gorunum, siraliAktif: s.sira !== 'yeni'}) + GM.listeSonucKap(s.gorunum === 'liste' ? GM.iskelet(4, 'satir') : GM.iskelet(4, 'kart'));
          clearTimeout(ciz.z); ciz.z = setTimeout(() => { if (!yuva.isConnected) return; yuva.innerHTML = icerik(s, l); sonsuz(l); }, BEKLE());
        } else { yuva.innerHTML = icerik(s, l); sonsuz(l); }
      };
      const guncelle = () => { GM.filtreSayiYaz(arac, secimSayi(s)); seritCiz(); segCiz(); ciz(); ust(); };
      sonsuz(sirala(suz(s), s.sira));
      { const r = arac.querySelector('.gm-kok-chip-rail'), b = r?.querySelector('[aria-pressed=true]'); if (b) r.scrollLeft += b.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - b.offsetWidth) / 2; }
      const yazildi = () => { clearTimeout(z); z = setTimeout(() => { s.q = girdi.value.trim(); s.bosKat = false; guncelle(); }, GM.TK.motion.oneri.inputDebounce); };
      const enter = ev => { if (ev.key === 'Enter') girdi.blur(); };
      girdi?.addEventListener('input', yazildi); girdi?.addEventListener('keydown', enter);
      const canli = d => {
        const b = document.querySelector('[data-filtre-uygula]'), sh = b?.closest('.gm-sheet'); if (!b) return;
        const n = suz(s, d).length; b.querySelector('span').textContent = n ? `${GM.sayi(n)} yazıyı gör` : 'Sonuç yok'; b.disabled = !n;
        GRUPLAR.forEach(g => (g === 'kategori' ? kategoriler() : SURE).forEach(x => { const e = sh.querySelector(`input[name="${g}"][value="${x.deger}"]`)?.closest('.gm-option')?.querySelector('.gm-option__count'); if (e) e.textContent = say(s, d, g, x.deger); }));
      };
      c.push(
        GM.on(kok, 'kategori', v => { s.f.kategori = v ? [v] : []; s.bosKat = false; guncelle(); }),
        GM.on(kok, 'sira', v => { s.sira = v; guncelle(); }),
        GM.on(kok, 'gorunum', v => { s.gorunum = v; ciz(false); }),
        GM.eylem(kok, 'sirala', () => GM.siralaSheet({baslik: 'Sırala', secenekler: SIRALAR, secili: s.sira, sec: v => { s.sira = v; guncelle(); }})),
        GM.eylem(kok, 'filtre', () => GM.filtreSheet({
          baslik: 'Yazıları filtrele',
          gruplar: [{baslik: 'Kategori', ad: 'kategori', ikon: 'layer-group', tur: 'coklu', ogeler: kategoriler().map(k => ({metin: k.ad, deger: k.deger, ikon: k.ikon, sayi: say(s, s.f, 'kategori', k.deger)}))}, {baslik: 'Okuma süresi', ad: 'sure', ikon: 'saat', tur: 'coklu', ogeler: SURE.map(x => ({metin: x.ad, deger: x.deger, sayi: say(s, s.f, 'sure', x.deger)}))}],
          secili: s.f, eylem: `${GM.sayi(suz(s).length)} yazıyı gör`, degisti: canli,
          uygula: d => { s.f = {kategori: (d.kategori || []).map(String), sure: (d.sure || []).map(String)}; s.bosKat = false; guncelle(); }
        })),
        GM.eylem(kok, 'kaldir', el => { const [g, v] = el.dataset.id.split('|'); s.f[g] = s.f[g].filter(x => x !== v); guncelle(); }),
        GM.eylem(kok, 'temizle', () => { s.f = bosF(); s.q = ''; s.bosKat = false; if (girdi) { girdi.value = ''; girdi.closest('.gm-girdi')?.classList.remove('has-text'); } guncelle(); GM.toast('Seçimler **temizlendi**', {ikon: 'yenile'}); })
      );
      return () => { io?.disconnect(); clearTimeout(z); clearTimeout(ciz.z); girdi?.removeEventListener('input', yazildi); girdi?.removeEventListener('keydown', enter); c.forEach(f => f()); };
    }
  });

  // ================= Yazı (#/lezzet/:slug) =================
  // Özet web'deki başlık altı yazıdır: ilk cümlesi kalın. Web kalını olmayan paragrafta kısa ilk yan cümle kalın (Diet ipucu kuralı).
  const ilkCumle = t => { const m = String(t || '').match(/^(.+?[.?!:])(\s|$)/); return m ? `**${m[1]}**${t.slice(m[1].length)}` : `**${t}**`; };
  const yanCumle = p => { if (p.includes('**')) return p; const i = p.search(/[;:]|[,.](?=\s|$)/), bas = i > 0 ? p.slice(0, i) : ''; return bas && bas.split(' ').length <= 8 ? `**${bas}**${p.slice(bas.length)}` : p; };
  const yalin = t => GM.katla(String(t || '').replace(/\*\*/g, '')).replace(/[^a-z0-9]+/g, ' ').trim();
  const paragraf = p => (Array.isArray(p) ? `<div class="gm-yigin-8">${p.map(x => GM.madde({metin: x, tur: 'notr'})).join('')}</div>` : GM.p(yanCumle(p)));
  const govdeHtml = (l, g) => {
    const giris = g.b.filter(b => !b[0]).flatMap(b => b[1]).filter(p => yalin(p) !== yalin(l.ozet));
    const bolumler = g.b.filter(b => b[0]), orta = Math.max(0, Math.floor(bolumler.length / 2) - 1);
    const alinti = (g.a || []).map(a => GM.alinti({metin: a.replace(/^[“"]|[”"]$/g, '')})).join('');
    const kesik = /(\.\.\.|…)\s*$/.test(l.ozet);
    return `${GM.makale(`${kesik && (giris.length || bolumler.length) ? '' : GM.p(ilkCumle(l.ozet))}${giris.map(paragraf).join('')}`)}${bolumler.map((b, i) => `${GM.icerikBlok({no: i + 1, baslik: b[0], html: b[1].map(paragraf).join(''), id: `b${i + 1}`, paylasUrl: `${webUrl(l)}#b${i + 1}`})}${i === orta ? alinti : ''}`).join('')}`;
  };
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'dış site'; } };
  const kaynaklar = g => (g?.k?.length ? GM.akordiyon([{baslik: 'Kaynaklar', alt: `${g.k.length} kaynak`, ikon: 'book-open', icerik: GM.satirlar(g.k.map((u, i) => ({ikon: 'link', baslik: host(u), alt: `Kaynak ${i + 1}`, veri: {eylem: 'lz-kaynak', id: u}})))}], {acik: -1}) : '');
  const kunye = (l, g) => GM.kisiSatir({ad: 'Dada Gourmet', boyut: 40, baslik: 'Dada Gourmet Editör Ekibi', alt: `${l.sure} · ${tarih(l)}`, sag: GM.gozSayi(g?.g)});
  const guncel = g => (g?.u ? GM.p(`Son güncelleme **${GM.tarihUzun(g.u)}**`, {meta: true, ton: 'ikincil'}) : '');
  // İlgili Keşifler: aynı kategori, okunma sırasıyla; kapaklı yazı önce.
  const ilgili = l => { const a = L().filter(x => x.slug !== l.slug && x.kategori === l.kategori).sort((x, y) => okunma(x) - okunma(y)); return [...a.filter(x => x.gorsel), ...a.filter(x => !x.gorsel)].slice(0, 4); };
  // İlgili mekânlar (mobil öneri; webde yok): yazının ili (bölge, etiket) ya da mutfağı (etiket/başlıkta mutfak adı) yayındaki mekânlarla eşleşirse; yoksa bölüm çıkmaz.
  const GENEL_MUTFAK = new Set(['turk', 'dunya', 'yoresel', 'modern', 'fuzyon', 'ev']);
  const yaziIller = l => [...new Set([...(X().lezzetIl?.[l.slug] || []), ...l.etiket.filter(e => (GMV.mekanlar || []).some(m => m.il === e))])];
  const ilgiliMekan = l => {
    const iller = yaziIller(l), kelime = new Set(yalin(`${l.ad} ${l.etiket.join(' ')}`).split(' '));
    const mutfak = (GMV.mekanSecenek?.mutfak || []).filter(x => { const k = yalin(x.ad).split(' ')[0]; return /mutfa/.test(yalin(x.ad)) && !GENEL_MUTFAK.has(k) && kelime.has(k); }).map(x => x.deger);
    const l2 = (GMV.mekanlar || []).filter(m => iller.includes(m.il) || m.f?.mutfak?.some(v => mutfak.includes(v)));
    return [...l2.filter(m => m.kapak), ...l2.filter(m => !m.kapak)].slice(0, 5);
  };
  const sehirKartlari = l => yaziIller(l).map(il => X().sehir?.(X().slug(il))).filter(Boolean).map(s => GM.eylemKart({ikon: 'sehir', baslik: `${s.ad} şehir rehberi`, alt: [s.mekan && `${s.mekan} mekân`, s.tescil.length && `${s.tescil.length} coğrafi işaret`].filter(Boolean).join(' · ') || 'Şehir kimliği', git: `#/rehber/${s.slug}`})).join('');
  // Etiket şeridi kaydırmalı (gm-serit): gm-yigin ızgarasının dışında, kendi bölümünde durur (ızgara kolonu şerit genişliğine açılmasın).
  const etiketler = l => ({baslik: 'Etiketler', html: GM.cipler({ad: 'etiket', etiket: 'Etiketler', ogeler: l.etiket.map(e => ({metin: e, ikon: 'tag', kucuk: true, git: `#/lezzetler?q=${encodeURIComponent(e)}`}))})});
  const kayitBoya = (kok, slug) => { const on = kayitlar().includes(slug); kok.querySelectorAll('[data-eylem="lz-kaydet"]').forEach(b => { b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Kaydedildi' : 'Kaydet'); }); };
  const yazilmadi = () => GM.hataEkran({tur: 'bulunamadi', baslik: 'Bu yazı burada değil', metin: 'Bağlantı eskimiş olabilir. **Gurme Lezzetler**’de aynı konudaki yazıları bulabilirsin.', eylem: {metin: 'Gurme Lezzetler', ikon: 'book-open', yerine: '#/lezzetler'}});
  const dVeri = ctx => (ctx.sorgu.hal === 'bulunamadi' ? null : bul(ctx.param.slug));

  let hataYazi = false;
  GM.ekran('lezzet', {
    tur: 'banner', ust: '#/lezzetler', iskelet: 'detay',
    baslik: ctx => dVeri(ctx)?.kategori || 'Gurme Lezzetler',
    ustBar: ctx => (dVeri(ctx) ? {menu: false, sag: [{ikon: 'kaydet', etiket: 'Kaydet', veri: {eylem: 'lz-kaydet'}}, {ikon: 'paylas', etiket: 'Paylaş', veri: {eylem: 'lz-paylas'}}]} : {saydam: false}),
    // Gövde tembel yüklenir; dosya yoksa ya da yüklenemezse ekran özetle açılır (hata ekranına düşmez).
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataYazi) { hataYazi = true; return Promise.reject(new Error('baglanti')); }
      return Promise.all([GM.yukleVeri('lezzet-govde').catch(() => null), new Promise(r => setTimeout(r, GM.azHareket() ? 0 : GM.TK.motion.fast))]);
    },
    ciz: ctx => {
      const l = dVeri(ctx);
      if (!l) return yazilmadi();
      const g = ctx.sorgu.hal === 'metin-yok' ? null : govdeOf(l.slug), k = katBul(l.kategori), mk = ilgiliMekan(l), il = ilgili(l), ks = GM.kayitliMekanlar();
      const ilk = yaziIller(l)[0];
      return GM.kubbe({
        // Başlık bloğu ≤ 3 satır (kural 5): kategori · başlık; okuma ve tarih künye satırında.
        perde: 'kart', gorsel: l.gorsel, etiket: l.kategori, baslik: l.ad,
        html: GM.bolumler([`<div class="gm-yigin">${kunye(l, g)}${g ? govdeHtml(l, g) : `${GM.makale(GM.p(ilkCumle(l.ozet)))}${GM.veriYok('Yazının tamamı **yüklenemedi**. Özeti okuyabilir ya da yeniden deneyebilirsin.')}${GM.btn({metin: 'Tekrar dene', ikon: 'yenile', tur: 'secondary', tam: true, veri: {eylem: 'lz-yeniden'}})}`}${g?.n ? GM.ipucu({ikon: 'uyari', ton: 'uyari', baslik: 'Okuyucunun Dikkatine', metin: ilkCumle(g.n)}) : ''}${kaynaklar(g)}${guncel(g)}${sehirKartlari(l)}</div>`, etiketler(l)
          , (mk.length ? ({baslik: 'İlgili mekânlar', eylem: 'Tümü', git: ilk ? `#/mekanlar?il=${X().slug(ilk)}` : '#/mekanlar', html: GM.mekanSatirlar(mk.map(m => GM.mekanKart(m, {tur: 'satir', kayitli: ks.has(m.slug)})))}) : '')
          , (il.length ? ({baslik: 'İlgili Keşifler', eylem: 'Tümü', git: `#/lezzetler?kategori=${k?.deger || ''}`, html: `<div class="gm-izgara">${il.map(kart).join('')}</div>`}) : '')])
      });
    },
    altBar: ctx => {
      const l = dVeri(ctx);
      return l ? GM.kayanBar({gorsel: l.gorsel, baslik: l.ad, eylemler: [{ikon: 'kaydet', ad: 'Kaydet', basili: kayitlar().includes(l.slug), veri: {eylem: 'lz-kaydet'}}, {ikon: 'paylas', ad: 'Paylaş', veri: {eylem: 'lz-paylas'}}]}) : '';
    },
    donus: (kok, ctx) => { const l = dVeri(ctx); if (l) kayitBoya(kok, l.slug); },
    sonra: (kok, ctx) => {
      const l = dVeri(ctx);
      if (!l) return null;
      // Üst bar ekran kökünün içinde: kaydet/paylaş dinleyicileri ekran kökünde.
      kayitBoya(kok, l.slug);
      const c = [
        GM.kaydetBagla(kok),
        GM.eylem(kok, 'lz-kaydet', () => {
          if (!GM.uye()) { GM.uyeDuvar({baslik: 'Yazıyı kaydet', metin: 'Gurme lezzet yazılarını **Gurme Favorilerim**’de toplamak için üye ol.'}); return; }
          const k = kayitlar(), on = !k.includes(l.slug);
          GM.durum.yaz('lezzet-kayit', on ? [...k, l.slug] : k.filter(x => x !== l.slug));
          kayitBoya(kok, l.slug); GM.titres(10);
          GM.toast(on ? '**Gurme Favorilerim**’e eklendi' : 'Kayıt kaldırıldı', {ikon: 'kaydet', eylem: on ? 'Gör' : undefined, onEylem: () => GM.git('#/profil/favoriler?sekme=lezzet')});
        }),
        GM.eylem(kok, 'lz-paylas', () => GM.paylas({baslik: l.ad, alt: l.ozet, url: webUrl(l)})),
        // Gövde yüklenemediyse (ya da ?hal=metin-yok): veri yeniden istenir, yazı hâlsiz adresle yeniden açılır.
        GM.eylem(kok, 'lz-yeniden', el => GM.mesgul(el, GM.yukleVeri('lezzet-govde')).then(() => GM.yerine(`#/lezzet/${l.slug}`), () => GM.toast('Yazı **yüklenemedi**; bağlantını kontrol et', {tur: 'hata'}))),
        GM.eylem(kok, 'lz-kaynak', el => GM.dialog({baslik: 'Kaynak açılsın mı?', metin: `Kaynak **${host(el.dataset.id)}** adresinde, uygulamanın dışında açılır.`, eylem: 'Aç', iptal: 'Vazgeç'}).then(ok => { if (ok) window.open(el.dataset.id, '_blank', 'noopener'); }))
      ];
      return () => c.forEach(f => f());
    }
  });

  // ================= Şehir rehberleri (#/rehberler) =================
  // Web /sehir-rehberleri: yayındaki editör rehberi (İstanbul) başta; mobilde coğrafi işaret kimliği ya da yayında mekânı olan her şehir (sayılar canlı veriden).
  // Görev 14/10 (lider kararı A): listede yalnız gerçek görseli olan şehirler; görselsiz şehrin sayfası #/rehber/<slug>'da açık (arama, yazı bağları).
  const sehirler = () => (X().sehirler?.() || []).filter(s => s.gorsel);
  const BOLGELER = () => Object.keys(X().bolge || {}).filter(b => sehirler().some(s => s.bolge === b));
  const R_SIRA = [['onerilen', 'Önerilen', 'wand-magic-sparkles'], ['mekan', 'En çok mekân', 'mekan'], ['cografi', 'En çok coğrafi işaret', 'cografi'], ['ad', 'A’dan Z’ye', 'arrow-down-a-z']];
  const KAPSAM = [['mekan', 'Mekânı olan', 'mekan', s => s.mekan > 0], ['cografi', 'Coğrafi işaretli', 'cografi', s => s.tescil.length > 0], ['rota', 'Rotası olan', 'rota', s => s.rota.length > 0], ['etkinlik', 'Etkinliği olan', 'etkinlik', s => s.etkinlik.length > 0]];
  const sehirMeta = s => [s.mekan ? `${s.mekan} mekân` : null, s.tescil.length ? `${s.tescil.length} coğrafi işaret` : null, !s.mekan && s.rota.length ? `${s.rota.length} rota` : null].filter(Boolean).slice(0, 2).join(' · ') || s.bolge || '';
  // Kart altı tek meta (yığılma kuralı 1): mekânı olan şehirde mekân sayısı, yoksa coğrafi işaret sayısı.
  const kartMeta = s => (s.mekan ? `${s.mekan} mekân` : s.tescil.length ? `${s.tescil.length} coğrafi işaret` : s.rota.length ? `${s.rota.length} rota` : s.bolge || '');
  const sehirKart = s => GM.icerikKart({gorsel: s.gorsel, ikon: 'sehir', kategori: s.editor ? 'Editör' : (s.bolge || 'Şehir').replace(' Anadolu', s.bolge === 'İç Anadolu' ? ' Anadolu' : ''), baslik: s.ad, meta: kartMeta(s), metaIkon: s.mekan ? 'pin' : 'cografi', git: `#/rehber/${s.slug}`, sinif: 'gm-ka-puf'});
  const sehirSatir = s => GM.satir({sol: GM.gorsel({src: s.gorsel, ikon: 'sehir'}), baslik: s.ad, alt: [s.editor ? 'Editör rehberi' : s.bolge, sehirMeta(s)].filter(Boolean).join(' · '), git: `#/rehber/${s.slug}`});
  const rDurum = ctx => ({hash: ctx.hash, q: ctx.sorgu.hal === 'sonuc-yok' ? 'Rize' : ctx.sorgu.q || '', bolge: BOLGELER().includes(ctx.sorgu.bolge) ? ctx.sorgu.bolge : '', kapsam: [], sira: 'onerilen', gorunum: 'izgara'});
  const rSuz = (d, haric) => { const q = GM.katla(d.q).trim(); return sehirler().filter(s => (haric === 'bolge' || !d.bolge || s.bolge === d.bolge) && (haric === 'kapsam' || d.kapsam.every(k => KAPSAM.find(x => x[0] === k)?.[3](s))) && (!q || GM.katla(`${s.ad} ${s.bolge || ''} ${s.tescil.map(t => t.ad).join(' ')}`).includes(q))); };
  const rSirala = (l, sira) => (sira === 'onerilen' ? l : [...l].sort({mekan: (a, b) => b.mekan - a.mekan, cografi: (a, b) => b.tescil.length - a.tescil.length, ad: (a, b) => a.ad.localeCompare(b.ad, 'tr')}[sira] || (() => 0)));
  const rSerit = d => GM.cipSerit({ad: 'bolge', tur: 'tek', etiket: 'Bölge', secili: d.bolge, ogeler: [{metin: 'Tümü', deger: '', ikon: 'layer-group', sayi: rSuz(d, 'bolge').length}, ...BOLGELER().map(b => ({metin: b, deger: b, sayi: rSuz({...d, bolge: b}).length}))]});
  const rOgeler = (l, d) => l.map(d.gorunum === 'liste' ? sehirSatir : sehirKart);
  const rIcerik = d => {
    const l = rSirala(rSuz(d), d.sira);
    const durum = GM.listeDurum({sayi: l.length, birim: 'şehir', gorunum: d.gorunum, siraliAktif: d.sira !== 'onerilen'});
    if (!l.length) return durum + GM.listeBos({ikon: 'sehir', baslik: 'Bu şehir için rehber yok', metin: d.q ? `“**${d.q}**” için şehir bulamadık. Rehberler **yayındaki mekânlardan** ve coğrafi işaret kayıtlarından üretilir.` : 'Seçtiğin süzgeçlere uyan şehir yok. **Süzgeçleri temizleyip** yeniden bak.', eylem: {metin: 'Süzgeçleri temizle', tur: 'secondary', ikon: 'yenile', veri: {eylem: 'temizle'}}});
    return durum + GM.listeSonuc(d.gorunum === 'liste' ? [GM.satirlar(rOgeler(l.slice(0, 12), d))] : rOgeler(l.slice(0, 12), d), {gorunum: d.gorunum});
  };
  const editorKapak = () => {
    const s = sehirler().find(x => x.editor); if (!s) return '';
    return GM.seckiKapak({gorsel: s.gorsel, rozet: {ikon: 'rehber', metin: 'Editör rehberi'}, baslik: s.ad, alt: `<b>${GM.sayi(s.mekan)}</b> mekân · <b>${s.ilce}</b> ilçe · ${GM.esc(X().rehber[s.slug].ozet)}`, git: `#/rehber/${s.slug}`});
  };
  const yontem = () => GM.bolum({ic: false, baslik: 'Rehberde ne var, ne yok?', html: GM.satirlar((X().rehberYontem || []).map(x => ({ikon: x.ikon, baslik: x.baslik, alt: x.metin.replace(/\*\*/g, ''), ozet: true})))});
  const kopruHtml = () => `<div class="gm-yigin-12">${GM.eylemKart({ikon: 'rota', baslik: 'Dada Route', alt: 'Güzergâhını kur, yol üstündeki durakları gör', git: '#/rota/planla'})}${GM.eylemKart({ikon: 'bul', baslik: 'Mekân Bul', alt: 'O güne uygun mekânı birkaç soruyla bul', git: '#/mekan-bul'})}</div>`;
  const kopru = () => ({baslik: 'Şehri seçtin, sıra planda', html: kopruHtml()});
  const kopruBolum = () => GM.bolum({ic: false, baslik: 'Şehri seçtin, sıra planda', html: kopruHtml()});

  let RD = null;
  GM.ekran('rehberler', {
    tur: 'alt', baslik: 'Şehir Rehberleri', ust: '#/kesfet', iskelet: 'kart',
    ustBar: () => ({saydam: true}),   // hero (GM.selamBas) üstünde saydam, kayınca solid (etkinlikler, Mekân Bul kalıbı)
    bos: {ikon: 'sehir', baslik: 'Henüz yayınlanmış şehir rehberi yok', metin: 'Rehberler **yayına girdikçe** burada listelenir. Bu arada mekânlara göz at.', eylem: {metin: 'Mekânlar', ikon: 'mekan', yerine: '#/mekanlar'}},
    yukle: () => new Promise(r => setTimeout(r, BEKLE())),
    cekYenile: () => new Promise(r => setTimeout(r, GM.TK.motion.reveal * 2)),
    ciz: ctx => {
      if (!RD || RD.hash !== ctx.hash) RD = rDurum(ctx);
      const d = RD, S = sehirler(), tescil = S.reduce((n, s) => n + s.tescil.length, 0);
      return listeUst({
        gorsel: GM.mekan('lacivert-restaurant')?.kapakB || sehirler()[0]?.gorsel, ust: 'Şehir Rehberleri',   // İstanbul (Boğaz) mekân kapağı; editör kartından ve öteki hero'lardan farklı (sokak-panorama Profil'de)
        baslikHtml: 'Şehrin <em>lezzet</em> haritası',
        stat: [{deger: S.length, etiket: 'şehir rehberi'}, {deger: GM.sayi((GMV.mekanlar || []).length), etiket: 'mekân'}, {deger: GM.sayi(tescil), etiket: 'coğrafi işaret'}],
        arac: GM.listeArac({yer: 'Şehir ya da yöresel ürün ara', ad: 'q', deger: d.q, filtreSayi: d.kapsam.length, serit: rSerit(d)}),
        html: `${d.q || d.bolge || d.kapsam.length ? '' : editorKapak()}${GM.sonucYuva(rIcerik(d))}${yontem()}${kopruBolum()}`
      });
    },
    sonra: kok => {
      const d = RD; if (!d) return null;
      const yuva = kok.querySelector('[data-kl-sonuc]'), arac = kok.querySelector('.gm-liste-arac'), girdi = arac?.querySelector('input'), c = [];
      let io = null, z = 0;
      const sonsuz = () => { io?.disconnect(); const kap = yuva.querySelector('.gm-liste-grid, .gm-liste-rows > .gm-satirlar'); if (kap) io = GM.sonsuzListe(kap, rSirala(rSuz(d), d.sira), x => (d.gorunum === 'liste' ? sehirSatir(x) : sehirKart(x)), {sayfa: 12, birim: 'şehir'}); };
      const ciz = () => { io?.disconnect(); yuva.parentNode.querySelectorAll('.gm-liste-son').forEach(x => x.remove()); yuva.innerHTML = rIcerik(d); sonsuz(); };
      const arc = () => { GM.filtreSayiYaz(arac, d.kapsam.length); const r = arac.querySelector('.gm-liste-rail'); if (r) { const x = r.firstElementChild?.scrollLeft || 0; r.innerHTML = rSerit(d); r.firstElementChild.scrollLeft = x; } };
      const yenile = () => { arc(); ciz(); };
      sonsuz();
      const yazildi = () => { clearTimeout(z); z = setTimeout(() => { d.q = girdi.value.trim(); yenile(); }, GM.TK.motion.oneri.inputDebounce); };
      girdi?.addEventListener('input', yazildi);
      c.push(
        GM.on(kok, 'bolge', v => { d.bolge = v || ''; yenile(); }),
        GM.on(kok, 'gorunum', v => { d.gorunum = v; ciz(); }),
        GM.eylem(kok, 'sirala', () => GM.siralaSheet({baslik: 'Sırala', secenekler: R_SIRA, secili: d.sira, sec: v => { d.sira = v; ciz(); }})),
        GM.eylem(kok, 'filtre', () => GM.filtreSheet({
          baslik: 'Şehirleri süz',
          gruplar: [{baslik: 'Rehberde olan', ad: 'kapsam', ikon: 'layer-group', tur: 'coklu', ogeler: KAPSAM.map(([v, a, i, f]) => ({metin: a, deger: v, ikon: i, sayi: rSuz({...d, kapsam: []}).filter(f).length}))}],
          secili: {kapsam: d.kapsam}, eylem: 'Şehirleri göster',
          uygula: s => { d.kapsam = (s.kapsam || []).map(String); yenile(); }
        })),
        GM.eylem(kok, 'temizle', () => { d.q = ''; d.bolge = ''; d.kapsam = []; if (girdi) { girdi.value = ''; girdi.closest('.gm-girdi')?.classList.remove('has-text'); } yenile(); })
      );
      return () => { io?.disconnect(); clearTimeout(z); girdi?.removeEventListener('input', yazildi); c.forEach(f => f()); };
    }
  });

  // ================= Şehir rehberi (#/rehber/:slug) =================
  // Bölümler zebra (Görev 14, GM.bolumler). Şehir kimliği: editör metni (yalnız yayındaki rehberde), coğrafi işaretli lezzetler (TÜRKPATENT sicili, GMV.ilKimlik), ilçe ve mutfak dağılımı,
  // mekânlar, şehirden geçen rotalar, etkinlikler, şehirle ilgili yazılar. Editör metni olmayan şehirde sakin bilgi notu; sayılar canlı veriden.
  const tescilKart = (t, s) => { const y = X().tescilYazi?.[t.ad], l = y && bul(y); return GM.lezzetKart({ad: t.ad, tur: t.tur, gorsel: l?.gorsel, alt: t.yer || s.ad}, {git: l ? yaziGit(l) : `#/ara?q=${encodeURIComponent(t.ad)}`}); };
  const dagilim = (l, f) => { const m = new Map(); l.forEach(x => [].concat(f(x) || []).forEach(k => m.set(k, (m.get(k) || 0) + 1))); return [...m].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), 'tr')); };
  const sehirYok = () => GM.hataEkran({tur: 'bulunamadi', baslik: 'Bu rehber burada değil', metin: 'Bağlantı eskimiş olabilir. **Şehir Rehberleri**’nden yayındaki şehirlere bakabilirsin.', eylem: {metin: 'Şehir Rehberleri', ikon: 'sehir', yerine: '#/rehberler'}});
  const editorMetin = s => {
    const r = X().rehber?.[s.slug];
    if (!r) return GM.veriYok(`**${s.ad}** için editör rehberi henüz yayında değil; aşağıdakiler şehirdeki **yayındaki kayıtlardan** derlendi.`);
    return `${GM.makale(`${GM.p(`**${r.ozet}**`)}${GM.p(r.giris)}`)}${r.bolumler.map(b => `<h2 class="gm-t-section">${GM.esc(b.baslik)}</h2>${GM.makale(GM.p(yanCumle(b.metin)))}`).join('')}`;
  };
  const rVeri = ctx => (ctx.sorgu.hal === 'bulunamadi' ? null : X().sehir?.(ctx.param.slug) || null);

  GM.ekran('rehber', {
    tur: 'banner', ust: '#/rehberler', iskelet: 'detay',
    baslik: ctx => rVeri(ctx)?.ad || 'Şehir Rehberi',
    ustBar: ctx => (rVeri(ctx) ? {menu: false, sag: [{ikon: 'paylas', etiket: 'Paylaş', veri: {eylem: 'rh-paylas'}}]} : {saydam: false}),
    yukle: () => new Promise(r => setTimeout(r, GM.azHareket() ? 0 : GM.TK.motion.fast)),
    ciz: ctx => {
      const s = rVeri(ctx);
      if (!s) return sehirYok();
      const r = X().rehber?.[s.slug], M = (GMV.mekanlar || []).filter(m => m.il === s.ad), ks = GM.kayitliMekanlar(), sec = GMV.mekanSecenek || {};
      const mekanlar = [...M.filter(m => m.kapak && m.seckiler?.length), ...M.filter(m => m.kapak && !m.seckiler?.length), ...M.filter(m => !m.kapak)].slice(0, 5);
      const ilce = dagilim(M, m => m.ilce), mutfak = dagilim(M, m => m.mutfak);
      const ilceDeger = a => (sec.ilce || []).find(i => i.ad === a && i.il === s.slug)?.deger, mutfakDeger = a => (sec.mutfak || []).find(i => i.ad === a)?.deger;
      const rotalar = s.rota.map(GM.rotaBul).filter(Boolean), etk = s.etkinlik.map(x => (GMV.etkinlikler || []).find(e => e.slug === x)).filter(Boolean).slice(0, 3), yazilar = s.yazi.map(bul).filter(Boolean);
      const yenir = s.tescil.filter(t => t.tur !== 'alinir'), alinir = s.tescil.filter(t => t.tur === 'alinir');
      const sicil = [yenir.length ? `**${yenir.length}** yemek` : '', alinir.length ? `**${alinir.length}** yöresel ürün` : ''].filter(Boolean).join(' ve ');
      return GM.kubbe({
        perde: 'kart', gorsel: s.gorsel, etiket: r ? 'Şehir rehberi' : s.bolge || 'Şehir kimliği', baslik: s.ad,
        stat: [s.mekan && {deger: GM.sayi(s.mekan), etiket: 'mekân'}, s.ilce && {deger: s.ilce, etiket: 'ilçe'}, s.tescil.length && {deger: s.tescil.length, etiket: 'coğrafi işaret'}, !s.mekan && s.rota.length && {deger: s.rota.length, etiket: 'rota'}].filter(Boolean),
        html: GM.bolumler([`<div class="gm-yigin">${editorMetin(s)}${r ? GM.btn({metin: r.cta, ikon: 'mekan', tam: true, git: `#/mekanlar?il=${s.slug}`}) : ''}</div>`
          , (s.tescil.length ? ({baslik: 'Coğrafi işaretli lezzetler', html: `<div class="gm-yigin-12">${GM.p(`TÜRKPATENT sicilinde **${s.ad}** adına kayıtlı ${sicil}.`, {ton: 'ikincil'})}${GM.yatay([...yenir, ...alinir].map(t => tescilKart(t, s)))}</div>`}) : '')
          , (M.length ? ({baslik: 'Mekânlar', eylem: {metin: `Tümü (${GM.sayi(M.length)})`, git: `#/mekanlar?il=${s.slug}`}, html: GM.mekanSatirlar(mekanlar.map(m => GM.mekanKart(m, {tur: 'satir', kayitli: ks.has(m.slug)})))}) : '')
          , (ilce.length > 1 ? ({baslik: 'İlçe dağılımı', html: GM.satirlar(ilce.slice(0, 6).map(([a, n]) => ({ikon: 'pin', baslik: a, deger: `${n} mekân`, git: ilceDeger(a) ? `#/mekanlar?il=${s.slug}&ilce=${encodeURIComponent(ilceDeger(a))}` : `#/mekanlar?il=${s.slug}`})))}) : '')
          , (mutfak.length > 1 ? ({baslik: 'Öne çıkan mutfaklar', html: GM.cipler({ad: 'mutfak', etiket: 'Mutfaklar', ogeler: mutfak.slice(0, 8).map(([a, n]) => ({metin: a, sayi: n, git: mutfakDeger(a) ? `#/mekanlar?il=${s.slug}&mutfak=${mutfakDeger(a)}` : `#/mekanlar?il=${s.slug}`}))})}) : '')
          , ({baslik: 'Bu şehirden geçen rotalar', html: rotalar.length ? `<div class="gm-yigin-12">${rotalar.map(x => GM.rotaKart(GM.rotaKartVeri(x), {tur: 'satir'})).join('')}</div>` : GM.eylemKart({ikon: 'rota', baslik: `${s.ad} için rota kur`, alt: 'Dada Route ile yol üstü durakları gör', git: '#/rota/planla'})})
          , (etk.length ? ({baslik: 'Şehirdeki etkinlikler', eylem: 'Tümü', git: '#/etkinlikler', html: `<div class="gm-yigin-12">${etk.map(e => GM.etkinlikKart(e, {tur: 'satir'})).join('')}</div>`}) : '')
          , (yazilar.length ? ({baslik: 'Gurme Lezzetler’den', eylem: yazilar.length > 4 ? 'Tümü' : null, git: `#/lezzetler?q=${encodeURIComponent(s.ad)}`, html: `<div class="gm-izgara">${yazilar.slice(0, 4).map(kart).join('')}</div>`}) : '')
          , kopru()])
      });
    },
    altBar: ctx => {
      const s = rVeri(ctx);
      return s ? GM.kayanBar({gorsel: s.gorsel, baslik: s.ad, eylemler: [{ikon: 'rota', ad: 'Rota kur', git: '#/rota/planla'}, {ikon: 'paylas', ad: 'Paylaş', veri: {eylem: 'rh-paylas'}}]}) : '';
    },
    sonra: (kok, ctx) => {
      const s = rVeri(ctx);
      if (!s) return null;
      const c = [GM.kaydetBagla(kok), GM.eylem(kok, 'rh-paylas', () => GM.paylas({baslik: `${s.ad} · Şehir Rehberi`, alt: X().rehber?.[s.slug]?.ozet || sehirMeta(s), url: `https://dadagourmet.com/sehir-rehberleri/${s.slug}`}))];
      return () => c.forEach(f => f());
    }
  });
})();
