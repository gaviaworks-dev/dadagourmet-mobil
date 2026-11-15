/* Yasal merkez ve kurumsal sayfalar (destek-yasal ajanı, Görev 12). Dada Diet mobil ekranlar/yasal.js + kurumsal.js ile birebir yapı, içerik Gourmet webden.
 * Rotalar: #/yasal → 'yasal' (dizin), #/yasal/:slug → 'yasal-belge' (metin), #/kurumsal/:slug → 'kurumsal' (hakkimizda, kunye, nasil-calisir, basin).
 * Veri GMX.yasal (ortak-veri.js; panel yasal varlıkları, 31 belge / 4 grup, metin değiştirilmez) ve GMX.kurumsal (web hakkimizda, kunye, iletisim).
 * Metin çizici GM.yasalMetin (Diet DD.yasalMetin eşi; burada tanımlı, kurumsal da kullanır): doldurulmamış [yer tutucu] ekranda çizilmez;
 *   yer tutucu içeren cümle ya da ";" yan cümlesi düşer, boş kalan madde/paragraf/bölüm çizilmez.
 * Gövdesi hukuki incelemede olan belge (bekliyor: true): dizinde ve metin başında sakin "Bilgi bekleniyor" durum rozeti; metinde kapsam paragrafı ve web kaynağındaki durum cümlesi.
 * Hâller: yasal ?q=<arama>, ?hal=sonuc-yok (eşleşmeyen arama), router ?hal=yukleniyor|hata|cevrimdisi|bos.
 *   yasal-belge ?bolum=N (o bölüm açık), ?icindekiler=acik, bekliyor örneği #/yasal/yas-siniri, bilinmeyen slug → bulunamadı.
 *   kurumsal: #/kurumsal/hakkimizda|kunye|nasil-calisir|basin (basin: içerik bekleniyor), bilinmeyen slug → bulunamadı. */
(() => {
  const Y = () => GMX.yasal, K = () => GMX.kurumsal;
  const esc = s => GM.esc(s);

  // ---------- Ortak metin çizici (GM.yasalMetin) ----------
  const YT = /\[[^\]]+\]/, YT_G = /\[[^\]]+\]/g;
  const metinYaz = t => esc(t.replace(YT_G, ''));
  const temizle = html => {
    if (!YT.test(html || '')) return html || '';
    return html.split(/(?<=[.!?])\s+(?=[<A-ZÇĞİÖŞÜ"])/).map(c => {
      if (!YT.test(c)) return c;
      const l = c.split(/;\s+/).filter(x => !YT.test(x));
      return l.length ? l.join('; ').replace(/[\s,;:]*$/, '').replace(/([^.!?])$/, '$1.') : '';
    }).filter(Boolean).join(' ');
  };
  // Zengin metin: yalnız strong/em/code ve uygulama içi bağlantı (#/…); geri kalan düz metin.
  const zengin = html => {
    const t = document.createElement('template'); t.innerHTML = html || '';
    const yaz = n => [...n.childNodes].map(c => {
      if (c.nodeType === 3) return metinYaz(c.textContent);
      if (c.nodeType !== 1) return '';
      const ad = c.tagName.toLowerCase(), ic = yaz(c);
      if (['strong', 'em', 'code', 'b'].includes(ad)) return `<${ad === 'b' ? 'strong' : ad}>${ic}</${ad === 'b' ? 'strong' : ad}>`;
      if (ad === 'a') { const h = c.getAttribute('href') || ''; return h.startsWith('#/') ? `<a href="${esc(h)}" data-git="${esc(h)}">${ic}</a>` : ic; }
      return ic;
    }).join('');
    return yaz(t.content);
  };
  const duz = html => { const t = document.createElement('template'); t.innerHTML = html || ''; return t.content.textContent.replace(/\s+/g, ' ').trim(); };
  const yerTutucu = x => {
    const t = duz(x); if (!YT.test(t)) return false;
    return duz(temizle(x)).replace(/^[^:[\]—–]{1,60}(?::|\s[—–-])\s*/, '').replace(/[\s.,;:·()/—–-]/g, '') === '';
  };
  const blokHtml = ([t, x]) => {
    if (t === 'h2' || t === 'h3') return `<${t}>${zengin(x)}</${t}>`;
    if (t === 'ul' || t === 'ol') { const l = x.filter(li => !yerTutucu(li)); return l.length ? `<${t}>${l.map(li => `<li>${zengin(temizle(li))}</li>`).join('')}</${t}>` : ''; }
    return yerTutucu(x) ? '' : `<p>${zengin(temizle(x))}</p>`;
  };
  const bolumle = bloklar => {
    const giris = [], bolumler = [];
    bloklar.forEach(b => { if (b[0] === 'h2') bolumler.push({baslik: duz(b[1]), bloklar: []}); else (bolumler.length ? bolumler[bolumler.length - 1].bloklar : giris).push(b); });
    const NO = /^\d+\.\s*/, ALT = /^\d+\.(\d+)\s/;
    return {giris, bolumler: bolumler.filter(b => b.bloklar.some(x => blokHtml(x))).map((b, i) => NO.test(b.baslik)
      ? {baslik: b.baslik.replace(NO, `${i + 1}. `), bloklar: b.bloklar.map(([t, x]) => (t === 'h3' && typeof x === 'string' ? [t, x.replace(ALT, `${i + 1}.$1 `)] : [t, x]))}
      : b)};
  };
  const ozet = (b, yedek = '') => {
    const l = b.bloklar.flatMap(([t, x]) => (t === 'p' ? [x] : t === 'ul' || t === 'ol' ? x : [])).filter(x => !yerTutucu(x));
    const s = l.find(x => !YT.test(duz(x))) ?? l[0];
    return s ? duz(temizle(s)) : yedek;
  };
  GM.yasalMetin = {zengin, duz, yerTutucu, temizle, blokHtml, bolumle, ozet};

  // Gövdesi hukuki incelemede olan belge (web kaynağındaki durum cümlesi).
  const BEKLIYOR_ROZET = () => GM.durumRozet({metin: 'Bilgi bekleniyor', ton: 'uyari', ikon: 'hourglass-half'});
  const BEKLIYOR_METIN = 'Bu metnin kapsamı belirlenmiş, gövdesi **hukuki inceleme** sürecindedir. Yürürlüğe girdiğinde bu sayfada yayımlanacaktır.';
  // Başlık bloğu: başlık + tek meta satırı (bekleyen belgede durum rozeti meta satırında; denetim Tur 6).
  const baslikMeta = (baslik, metaHtml, rozet) => `<div class="gm-yigin-8"><h1 class="gm-t-page">${GM.esc(baslik)}</h1><p class="gm-t-meta gm-ton-ikincil gm-tek-satir">${metaHtml}${rozet ? ` · ${BEKLIYOR_ROZET()}` : ''}</p></div>`;
  const metaMetin = m => `Sürüm ${m.surum} · Son güncelleme ${GM.tarihUzun(m.guncelleme || m.yururluk)}`;

  // ---------- Dizin ----------
  const sira = () => Y().dizin.gruplar.flatMap(g => g.kalemler.filter(s => Y().metinler[s]));
  const kalemSatir = (slug, alt) => {
    const m = Y().metinler[slug];
    return {ikon: m.ikon, baslik: m.baslik, ...(m.bekliyor && alt == null ? {ek: BEKLIYOR_ROZET()} : {alt: alt ?? metaMetin(m)}), git: `#/yasal/${slug}`};
  };
  // Aranan: belge adı, sonra bölüm başlıkları (h2, h3). Bölüm eşleşirse satır o bölümü açar.
  const aranacaklar = () => Y().dizin.gruplar.flatMap(g => g.kalemler.filter(s => Y().metinler[s]).map(slug => {
    const m = Y().metinler[slug], bolumler = bolumle(m.bloklar).bolumler;
    return {slug, grup: g.baslik.replace(/^[A-D]\.\s*/, ''), ad: m.baslik, basliklar: bolumler.map((b, i) => [i, [b.baslik, ...b.bloklar.filter(([t]) => t === 'h3').map(([, x]) => duz(x))]])};
  }));
  const ara = q => {
    const a = GM.katla(q);
    return aranacaklar().map(x => {
      if (GM.katla(x.ad).includes(a)) return {...kalemSatir(x.slug, x.grup), baslikHtml: GM.vurguluEsles(x.ad, q)};
      const b = x.basliklar.find(([, l]) => l.some(s => GM.katla(s).includes(a)));
      if (!b) return null;
      return {...kalemSatir(x.slug, `Bölüm: ${b[1].find(t => GM.katla(t).includes(a))}`), git: `#/yasal/${x.slug}?bolum=${b[0] + 1}`};
    }).filter(Boolean);
  };
  const listeHtml = q => {
    if (!q) return Y().dizin.gruplar.map(g => GM.bolum({ic: false, baslik: g.baslik, html: GM.satirlar(g.kalemler.filter(s => Y().metinler[s]).map(s => kalemSatir(s)))})).join('');
    const l = ara(q);
    if (!l.length) return GM.bos({ikon: 'ara_', baslik: 'Eşleşen metin yok', metin: `**${q}** için bir metin bulamadık. Başka bir kelimeyle dene ya da aramayı temizle.`, eylem: {metin: 'Aramayı temizle', tur: 'secondary', veri: {eylem: 'ara-temizle'}}});
    return GM.bolum({ic: false, baslik: `${l.length} metin bulundu`, html: GM.satirlar(l)});
  };
  const dizinCiz = ctx => {
    const D = Y().dizin, q = (ctx.sorgu.hal === 'sonuc-yok' ? 'tapu' : ctx.sorgu.q || '').trim();
    const n = sira().length, bekleyen = sira().filter(s => Y().metinler[s].bekliyor).length;
    return GM.gruplar([
      {html: GM.arama({ad: 'yasal-ara', yer: 'Metin ara', deger: q, sonuc: false})},
      `<div class="gm-yigin-24" data-yuva="liste" aria-live="polite">${listeHtml(q)}</div>`,
      {html: `<div class="gm-yigin-12">${GM.p(`${D.not} **${n} metnin** ${n - bekleyen} tanesi yayımlandı; ${bekleyen} metnin gövdesi hukuki incelemede.`, {meta: true, ton: 'ikincil'})}${GM.satirlar([{ikon: 'id-card', baslik: 'Künye', alt: 'Yayıncı ve yer sağlayıcı bilgileri', git: '#/kurumsal/kunye'}, {ikon: 'envelope', baslik: 'İletişim', alt: 'Bildirim ve talepler için', git: '#/iletisim'}])}</div>`}
    ], {bas: GM.metinBlok({etiket: 'Dada Gourmet', baslik: D.baslik, metin: 'Politika ve yasal bildirimler **tek merkezde**.', h: 1})});
  };

  // ---------- Metin ----------
  const bulunamadi = () => GM.hataEkran({tur: 'bulunamadi', baslik: 'Bu metni bulamadık', metin: 'Adres değişmiş ya da bağlantı eskimiş olabilir. **Bütün metinler** Yasal Metinler sayfasında.', eylem: {metin: 'Yasal Metinler', ikon: 'scale-balanced', yerine: '#/yasal'}});
  const BOS = {ikon: 'file-lines', baslik: 'Metin henüz yayımlanmadı', metin: 'Metin yayımlandığında burada okunabilecek. **Yayımlanan bütün metinler** Yasal Metinler sayfasında.', eylem: {metin: 'Yasal Metinler', ikon: 'scale-balanced', yerine: '#/yasal'}};
  const komsular = slug => {
    const s = sira(), i = s.indexOf(slug);
    return [[s[i - 1], 'Önceki metin', 'arrow-left'], [s[i + 1], 'Sonraki metin', 'arrow-right']].filter(([x]) => x).map(([x, alt, ikon]) => ({ikon, baslik: Y().metinler[x].baslik, alt, git: `#/yasal/${x}`}));
  };
  const metinCiz = (ctx, slug) => {
    const m = Y().metinler[slug];
    if (!m) return bulunamadi();
    const {giris, bolumler} = bolumle(m.bloklar);
    const bas = baslikMeta(m.baslik, m.bekliyor ? `Sürüm ${GM.esc(m.surum)}` : GM.esc(metaMetin(m)), m.bekliyor);
    const ayak = `<div class="gm-yigin-12">${GM.p(`Yürürlük tarihi: ${GM.tarihUzun(m.yururluk)}. ${Y().dizin.ayak}`, {meta: true, ton: 'ikincil'})}${GM.satirlar(komsular(slug))}${GM.btn({metin: 'Tüm yasal metinler', tur: 'secondary', ikon: 'list', tam: true, git: '#/yasal'})}</div>`;
    if (!bolumler.length) return GM.bos({tam: true, ...BOS, baslik: `${m.baslik} henüz yayımlanmadı`});
    if (m.bekliyor) {
      // Kapsam ve (varsa) şimdilik geçerli metinler tek makalede; akordiyona gerek yok.
      return GM.gruplar([
        {html: GM.bant({ton: 'uyari', ikon: 'hourglass-half', metin: BEKLIYOR_METIN})},
        {html: GM.makale(m.bloklar.map(blokHtml).join(''))},
        {html: ayak}
      ], {bas});
    }
    const n = Math.min(bolumler.length, Math.max(1, +ctx.sorgu.bolum || 1)) - 1;
    const toc = GM.akordiyon([{ikon: 'list-ol', baslik: 'İçindekiler', alt: `${bolumler.length} başlık`, icerik: GM.satirlar(bolumler.map((b, i) => ({baslik: b.baslik, veri: {eylem: 'bolum', id: i}, ok: false})))}], {ad: 'toc', acik: ctx.sorgu.icindekiler === 'acik' ? 0 : -1});
    const govde = GM.akordiyon(bolumler.map(b => ({ikon: m.ikon, baslik: b.baslik, alt: ozet(b), icerik: GM.makale(b.bloklar.map(blokHtml).join(''))})), {ad: 'ys', acik: n});
    return GM.gruplar([
      bolumler.length >= 3 && {html: toc},
      giris.length && {html: GM.makale(giris.map(blokHtml).join(''))},
      {html: govde},
      {html: ayak}
    ], {bas});
  };

  // Öğeyi kaydırma kabının başına getirir (üst bar payı düşülür).
  const basaKaydir = (kok, el, yumusak = true) => {
    const k = kok.querySelector('.gm-kaydir'); if (!k || !el) return;
    const bar = kok.querySelector('.gm-header')?.offsetHeight || 0;
    const y = el.getBoundingClientRect().top - k.getBoundingClientRect().top + k.scrollTop - bar;
    k.scrollTo({top: Math.max(0, y), behavior: yumusak && !GM.azHareket() ? 'smooth' : 'auto'});
  };
  const bolumeGit = (kok, i, kaydir = true) => {
    const btn = kok.querySelector(`#ys-b${i}`); if (!btn) return;
    if (btn.getAttribute('aria-expanded') !== 'true') btn.click();
    setTimeout(() => { basaKaydir(kok, btn.closest('.gm-ak-bolum'), kaydir); if (kaydir) btn.focus({preventScroll: true}); }, GM.azHareket() ? 0 : GM.TK.motion.sheet);
  };

  GM.ekran('yasal', {
    tur: 'alt',
    baslik: 'Yasal Metinler',
    iskelet: 'satir',
    bos: {ikon: 'scale-balanced', baslik: 'Yayımlanmış metin yok', metin: 'Yasal metinler yayımlandığında **bu merkezde** listelenir.', eylem: {metin: 'İletişim', ikon: 'envelope', git: '#/iletisim'}},
    ciz: dizinCiz,
    sonra: (kok) => {
      const girdi = kok.querySelector('[name="yasal-ara"]'), yuva = kok.querySelector('[data-yuva="liste"]');
      if (!girdi) return undefined;
      const suz = () => { yuva.innerHTML = listeHtml(girdi.value.trim()); };
      girdi.addEventListener('input', suz);
      const c = GM.eylem(kok, 'ara-temizle', () => { girdi.value = ''; girdi.closest('.gm-girdi')?.classList.remove('has-text'); suz(); girdi.focus(); });
      return () => { girdi.removeEventListener('input', suz); c(); };
    }
  });

  GM.ekran('yasal-belge', {
    tur: 'alt',
    baslik: ctx => Y().metinler[ctx.param.slug]?.baslik || 'Yasal metin',
    iskelet: 'satir',
    bos: BOS,
    ciz: ctx => metinCiz(ctx, ctx.param.slug),
    sonra: (kok, ctx) => {
      if (ctx.sorgu.bolum && +ctx.sorgu.bolum > 1) requestAnimationFrame(() => bolumeGit(kok, +ctx.sorgu.bolum - 1, false));
      return GM.eylem(kok, 'bolum', el => bolumeGit(kok, +el.dataset.id));
    }
  });

  // ---------- Kurumsal ----------
  const baslikBlok = (o, h = 2) => GM.metinBlok({etiket: o.etiket, baslik: o.baslik, metin: o.metin, rol: h === 1 ? 'page' : 'section', h});
  const adimSatir = (a, i) => ({ikon: a.ikon, baslik: `${i + 1}. ${a.baslik}`, alt: a.metin});
  const yasalGrup = () => ({baslik: 'Yasal ve iletişim', satirlar: [
    {ikon: 'scale-balanced', baslik: 'Yasal Metinler', alt: `${sira().length} metin, 4 grup`, git: '#/yasal'},
    {ikon: 'id-card', baslik: 'Künye', alt: 'Yayıncı ve yer sağlayıcı bilgileri', git: '#/kurumsal/kunye'},
    {ikon: 'envelope', baslik: 'İletişim', alt: 'Öneri, bilgi düzeltme, iş birliği', git: '#/iletisim'},
    {ikon: 'circle-question', baslik: 'Sıkça Sorulan Sorular', alt: `${GMX.destek.sss.reduce((t, k) => t + k.sorular.length, 0)} soru`, git: '#/sss'}]});

  const hakkimizda = () => {
    const H = K().hakkimizda;
    return GM.gruplar([
      {html: `<div class="gm-yigin">${baslikBlok(H.hikaye)}${GM.makale(H.hikaye.paragraflar.map(p => `<p>${GM.vurgu(p)}</p>`).join(''))}</div>`},
      {html: GM.ipucu({ikon: 'user-pen', baslik: H.suzgec.baslik, metin: H.suzgec.metin})},
      {html: `<div class="gm-yigin">${baslikBlok(H.secim)}${GM.satirlar(H.secim.adimlar.map(adimSatir))}</div>`},
      {html: GM.ipucu({ton: 'bilgi', ikon: 'flag', metin: H.ihlal, eylem: {metin: 'İletişim formu', git: '#/iletisim?konu=sikayet'}})},
      {html: `<div class="gm-yigin">${baslikBlok(H.davet)}${GM.satirlar(H.davet.kartlar.map(k => ({ikon: k.ikon, baslik: k.baslik, alt: k.metin, git: k.git})))}</div>`},
      yasalGrup()
    ], {bas: `<div class="gm-yigin">${GM.banner({gorsel: H.gorsel, etiket: H.etiket, baslik: H.baslik})}${GM.p(H.alt, {ton: 'ikincil'})}</div>`});
  };

  const kunye = () => {
    const N = K().kunye;
    return GM.gruplar([
      {html: GM.kunye(N.alanlar.map(([ikon, etiket, deger]) => ({ikon, etiket, deger})))},
      {html: GM.ipucu({ikon: 'envelope', metin: N.not, eylem: {metin: 'İletişim formu', git: '#/iletisim'}})},
      {baslik: 'İlgili metinler', satirlar: ['kullanim-kosullari', 'gizlilik', 'kvkk'].filter(s => Y().metinler[s]).map(s => kalemSatir(s))}
    ], {bas: GM.metinBlok({etiket: N.etiket, baslik: N.baslik, metin: 'Yayıncı ve yer sağlayıcı bilgileri.', h: 1})});
  };

  // Nasıl çalışır: web hakkımızda "Nasıl seçiyoruz?" adımları ve iletişim "Mesajın nereye gider?" yolu (webde ayrı sayfa yok; iki bölüm birleşir).
  const nasilCalisir = () => {
    const N = K()['nasil-calisir'], S = K().hakkimizda.secim, L = GMX.destek.iletisim.yol;
    return GM.gruplar([
      {html: `<div class="gm-yigin">${baslikBlok({etiket: 'Listeye giriş', baslik: S.baslik, metin: S.metin})}${GM.satirlar(S.adimlar.map(adimSatir))}</div>`},
      {html: GM.ipucu({ikon: 'user-pen', baslik: K().hakkimizda.suzgec.baslik, metin: K().hakkimizda.suzgec.metin})},
      {html: `<div class="gm-yigin">${baslikBlok({etiket: 'Bildirimler', baslik: L.baslik})}${GM.satirlar(L.adimlar.map(adimSatir))}</div>`},
      {html: GM.btnIkili({metin: 'Mekân öner', ikon: 'store', git: '#/mekan-oner'}, {metin: 'Bize yaz', ikon: 'envelope', git: '#/iletisim'})},
      {baslik: 'İlgili metinler', satirlar: ['isletme-listeleme', 'degerlendirme-politikasi', 'editoryal-politika'].filter(s => Y().metinler[s]).map(s => kalemSatir(s))}
    ], {bas: GM.metinBlok({etiket: N.etiket, baslik: N.baslik, metin: 'Yayıncı ve yer sağlayıcı bilgileri.', h: 1})});
  };

  // Basın ve Medya: içerik yalnız panelde başlık olarak var; webde yayımlanmadı → sakin bekleniyor durumu.
  const basin = () => {
    const B = K().basin;
    return GM.gruplar([
      {html: GM.bos({ikon: 'newspaper', baslik: 'Basın kiti hazırlanıyor', metin: B.alt, eylem: {metin: 'Basın talebi yaz', ikon: 'envelope', git: '#/iletisim?konu=basin'}})},
      yasalGrup()
    ], {bas: baslikMeta(B.baslik, 'Basın bülteni ve görsel kit', true)});
  };

  const SAYFA = {hakkimizda: ['Hakkımızda', hakkimizda], kunye: ['Künye', kunye], 'nasil-calisir': ['Nasıl Çalışır?', nasilCalisir], basin: ['Basın ve Medya', basin]};
  GM.ekran('kurumsal', {
    tur: 'alt',
    baslik: ctx => SAYFA[ctx.param.slug]?.[0] || 'Kurumsal',
    iskelet: 'satir',
    ciz: ctx => (SAYFA[ctx.param.slug] ? SAYFA[ctx.param.slug][1](ctx) : GM.hataEkran({tur: 'bulunamadi', baslik: 'Bu sayfayı bulamadık', metin: 'Adres değişmiş olabilir. **Hakkımızda** sayfasından devam edebilirsin.', eylem: {metin: 'Hakkımızda', ikon: 'circle-info', yerine: '#/kurumsal/hakkimizda'}}))
  });
})();
