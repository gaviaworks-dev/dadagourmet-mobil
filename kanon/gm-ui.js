/* Dada Gourmet çekirdek (GM). Diet mobil çekirdeğinin (DD) ad çevirisi; Diet'e özgü Tabağım deposu çıkarıldı. Katalog: kanon/README.md.
   Ekran yığını, yönlendirme, üst bar kabuğu, alt menü, sheet, dialog, toast, kalıcı durum ve bileşen etkileşimleri.
   Bileşen çizicileri gm-cizici.js ve gm-gosterge.js içinde; hepsi HTML string döner, etkileşim burada olay yetkilendirmesiyle çalışır.
   Değerler yalnız GM_TOKENS'tan gelir; sabit süre ya da renk yazılmaz. */
(() => {
  const TK = window.GM_TOKENS;
  const GM = window.GM = window.GM || {};
  GM.TK = TK;
  const M = TK.motion;
  const belge = document;

  // ---------- Küçük yardımcılar ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kisit = (v, a, b) => Math.min(b, Math.max(a, v));
  const ikonAd = k => TK.icons[k] || k;
  const ik = (ad, sinif = '') => `<i class="icon fa-solid fa-${esc(ikonAd(ad))}${sinif ? ' ' + sinif : ''}" aria-hidden="true"></i>`;
  const yay = (el, ad, detail) => el.dispatchEvent(new CustomEvent(ad, {bubbles: true, detail}));
  const degisim = (el, ad, deger, ek = {}) => yay(el, 'gm-degisim', {ad, deger, ...ek});

  // Ortak öznitelikler: git, geri, id, veri:{anahtar:değer}, attrs (ham string), etiket (aria-label).
  const at = (o = {}) => {
    let s = '';
    if (o.git) s += ` data-git="${esc(o.git)}"`;
    if (o.yerine) s += ` data-yerine="${esc(o.yerine)}"`;
    if (o.geri) s += ' data-geri';
    if (o.id) s += ` id="${esc(o.id)}"`;
    if (o.etiket) s += ` aria-label="${esc(o.etiket)}"`;
    if (o.veri) for (const [k, v] of Object.entries(o.veri)) s += ` data-${esc(k)}="${esc(v)}"`;
    if (o.attrs) s += ' ' + o.attrs;
    return s;
  };
  // **vurgu** → <b>; metin önce kaçırılır.
  const vurgu = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const sayi = n => Math.round(+n || 0).toLocaleString('tr-TR');
  const ondalik = (n, b = 1) => (+n || 0).toLocaleString('tr-TR', {maximumFractionDigits: b});
  const sure = dk => { const s = Math.floor(dk / 60), d = Math.round(dk % 60); return [s ? `${s} sa` : '', d || !s ? `${d} dk` : ''].filter(Boolean).join(' '); };
  const iki = n => String(n).padStart(2, '0');
  const saatMetin = dk => `${iki(Math.floor(dk / 60) % 24)}:${iki(Math.round(dk % 60))}`;
  const saatDk = s => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
  const paraTL = n => `${sayi(n)} TL`;

  Object.assign(GM, {esc, ik, at, vurgu, sayi, ondalik, sure, saatMetin, saatDk, paraTL, ikonAd, kisit, yay, degisim, azHareket});

  // Sabit an: uygulamanın şimdisi veriden gelir, canlı saat kullanılmaz.
  GM.simdi = () => {
    const b = window.GMV?.bugun, [y, a, g] = (b?.tarih || '2026-11-13').split('-').map(Number), [h, m] = (b?.simdi || '12:10').split(':').map(Number);
    return new Date(y, a - 1, g, h, m);
  };
  GM.bugunIso = () => window.GMV?.bugun?.tarih || '2026-11-13';

  // Ayarlar > Uygulama ayarları > Titreşim ('titresim', varsayılan açık) kapalıysa titreşmez.
  GM.titres = (ms = 8) => { try { if (GM.durum?.oku('titresim', true) === false) return; navigator.userActivation?.hasBeenActive && navigator.vibrate?.(ms); } catch { /* yok */ } };
  GM.tween = (ms, fn, bitti) => {
    if (azHareket() || !ms) { fn(1); bitti?.(); return () => {}; }
    let dur = false; const t0 = performance.now();
    const ease = t => 1 - (1 - t) ** 3;
    const adim = t => { if (dur) return; const p = kisit((t - t0) / ms, 0, 1); fn(ease(p)); if (p < 1) requestAnimationFrame(adim); else bitti?.(); };
    requestAnimationFrame(adim);
    return () => { dur = true; };
  };
  // Sayaç artışı: el içindeki sayıyı hedefe sayarak getirir. Biçim: data-ondalik varsa ondalıklı.
  GM.say = (el, hedef, o = {}) => {
    const b = o.ondalik ?? +(el.dataset.ondalik || 0), bas = o.bas ?? +(el.dataset.simdiki || 0);
    el.dataset.simdiki = hedef;
    GM.tween(o.sure ?? M.counter, p => { el.textContent = b ? ondalik(bas + (hedef - bas) * p, b) : sayi(bas + (hedef - bas) * p); });
  };

  // ---------- Kalıcı durum ----------
  GM.durum = {
    oku(k, d) { try { const v = localStorage.getItem('gm-' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    yaz(k, v) { try { localStorage.setItem('gm-' + k, JSON.stringify(v)); } catch { /* özel pencere */ } return v; },
    sil(k) { try { localStorage.removeItem('gm-' + k); } catch { /* yok */ } },
    sifirla() { try { Object.keys(localStorage).filter(k => k.startsWith('gm-')).forEach(k => localStorage.removeItem(k)); } catch { /* yok */ } }
  };

  // Yalnız program detayında gerekli büyük veri: GM.yukleVeri('program-gunleri').then(...)
  const veriSoz = {};
  GM.yukleVeri = ad => veriSoz[ad] ||= new Promise((tamam, red) => {
    const s = belge.createElement('script');
    s.src = `veri/${ad}.js`; s.onload = () => tamam(window.GMV); s.onerror = () => { delete veriSoz[ad]; red(new Error(ad)); };
    belge.head.append(s);
  });

  // ---------- Ekran kaydı ve yönlendirme ----------
  const ekranlar = GM._ekranlar = {};
  GM.ekran = (ad, tanim) => { ekranlar[ad] = tanim; };
  GM.ekranTanim = ad => ekranlar[ad] || null;   // #/durumlar kapsam listesi okur

  const R = {yigin: [], sekmeler: {}, idx: 0, anim: [], hazir: false, sahne: null, yiginEl: null};
  const ust = () => R.yigin[R.yigin.length - 1];
  GM.aktif = () => ust() || null;

  const rotaBul = hash => {
    const [yol, q = ''] = hash.split('?');
    const sorgu = Object.fromEntries(new URLSearchParams(q));
    const tablo = window.GM_ROTALAR || {};
    // Kaldırılan ekran adresi: tam ya da önek eşleşmesiyle yeni adrese
    const eski = Object.entries(window.GM_YONLENDIR || {}).find(([k]) => yol === k || (k.endsWith('/') && yol.startsWith(k)));
    if (eski && eski[1] !== yol) { history.replaceState(null, '', eski[1]); return rotaBul(eski[1]); }
    if (tablo[yol]) return {ad: tablo[yol], param: {}, sorgu, hash};
    for (const [desen, ad] of Object.entries(tablo)) {
      if (!desen.includes(':')) continue;
      const adlar = [];
      const re = new RegExp('^' + desen.replace(/:[^/]+/g, m => { adlar.push(m.slice(1)); return '([^/]+)'; }) + '$');
      const m = yol.match(re);
      if (m) return {ad, param: Object.fromEntries(adlar.map((k, i) => [k, decodeURIComponent(m[i + 1])])), sorgu, hash};
    }
    return {ad: 'hata', param: {}, sorgu: {tur: 'bulunamadi', ...sorgu}, hash};
  };

  // Kayıtsız ya da hatalı ekran: kanon hata ekranı kendi içinden çizilir.
  const hataTanim = {
    tur: 'tam',
    ciz: ctx => GM.hataEkran({tur: ctx.sorgu.tur || 'bulunamadi', eylem: {metin: 'Keşfet’e dön', yerine: '#/kesfet'}})
  };

  const barAyar = (e, ctx) => {
    const verilen = (typeof e.ustBar === 'function' ? e.ustBar(ctx) : e.ustBar) || {};
    return {tur: e.tur || 'alt', baslik: typeof e.baslik === 'function' ? e.baslik(ctx) : e.baslik, ...verilen};
  };

  // Misafir ve üye (MBL-FLW-v2.1): oturum yoksa misafirdir. Misafirin yaptıkları cihazda 'yeni-*' anahtarlarında durur, üye olunca aynen kalır.
  try { if (/[?&]uye=1\b/.test(location.hash)) GM.durum.yaz('oturum', {yol: 'giris'}); } catch { /* yok */ }
  // Uygulama sürümü (Ayarlar > Uygulama > Sürüm). Mağaza sürümü belirlenince buradan değişir.
  GM.SURUM = '1.0.0';
  GM.uye = () => !!GM.durum.oku('oturum');
  GM.yeniHesap = () => !GM.uye() || !!GM.durum.oku('oturum')?.misafirden;
  GM.UYE_KILIT = {
    // Profilim merkezi (web 6 sekmeli profil eşi): misafire kapalı; her ekranın kendi ikonu ve cümlesi. Ayarlar ve Çözüm Merkezi misafire açık, kapıyı ekran içinde kurar.
    rezervasyonlar: {ikon: 'rezervasyon', baslik: 'Rezervasyonların', metin: 'Masa ve etkinlik rezervasyonlarını **tek yerden** takip etmek için giriş yap.'},
    favoriler: {ikon: 'favori', baslik: 'Gurme favorilerin', metin: 'Beğendiğin mekân ve lezzetleri **her cihazda** saklamak için giriş yap.'},
    ziyaretler: {ikon: 'ziyaret', baslik: 'Ziyaret geçmişin', metin: '“Ziyaret Ettim” dediğin mekânları ve **seyahat günlüğünü** görmek için giriş yap.'},
    degerlendirmeler: {ikon: 'yildiz', baslik: 'Değerlendirmelerin', metin: 'Yazdığın yorumları ve **puanlarını** görmek için giriş yap.'},
    katkilar: {ikon: 'ekle', baslik: 'Topluluk katkıların', metin: 'Önerdiğin mekân ve etkinliklerin **durumunu** izlemek için giriş yap.'},
    puan: {ikon: 'puanDada', baslik: 'Dada Puan', metin: 'Puan biriktirip **rütbeni yükseltmek** için giriş yap.'},
    rotalarim: {ikon: 'rota', baslik: 'Rotaların', metin: 'Planladığın ve web’den gönderdiğin **rotaları** saklamak için giriş yap.'},
    bildirimler: {ikon: 'bildirim', baslik: 'Bildirimlerin', metin: 'Rezervasyon hatırlatmalarını ve **yakındaki önerileri** almak için giriş yap.'},
    // Görev 12 (envanter L2): ekran adlarıyla eşleşen anahtarlar.
    'rota-rotalarim': {ikon: 'rota', baslik: 'Rotaların', metin: 'Planladığın ve web’den gönderdiğin **rotaları** saklamak için giriş yap.'},
    listelerim: {ikon: 'liste', baslik: 'Listelerin', metin: 'Mekânları **kendi listelerinde** toplamak için giriş yap.'},
    liste: {ikon: 'liste', baslik: 'Listen', metin: 'Bu listeyi görmek ve düzenlemek için **giriş yap**.'},
    etkinliklerim: {ikon: 'etkinlik', baslik: 'Etkinliklerin', metin: 'Katılacağın etkinlikleri ve **biletlerini** tek yerde görmek için giriş yap.'},
    tercihler: {ikon: 'ayarlar', baslik: 'Keşif tercihlerin', metin: 'Önerileri **zevkine göre** ayarlamak için giriş yap.'},
    'profil-duzenle': {ikon: 'profil', baslik: 'Profilin', metin: 'Profil bilgilerini düzenlemek için **giriş yap**.'},
    rezervasyon: {ikon: 'rezervasyon', baslik: 'Rezervasyonun', metin: 'Rezervasyon ayrıntısını görmek için **giriş yap**.'},
    odemelerim: {ikon: 'credit-card', baslik: 'Ödemelerin', metin: 'Ödeme geçmişini, faturalarını ve **kayıtlı kartlarını** görmek için giriş yap.'}
  };
  const SSO = [{yol: 'apple', metin: 'Apple ile devam et', marka: 'apple'}, {yol: 'google', metin: 'Google ile devam et', gorsel: 'assets/marka/sosyal/google.svg'}];
  // Misafirin cihazda biriktirdikleri (favori, rota taslağı) üye olunca hesaba geçer; Gourmet'te sağlık verisi yoktur, açık rıza adımı gerekmez.
  const rizaSheet = yol => { GM.durum.yaz('oturum', {yol, misafirden: true}); GM.tazele(); GM.toast('Hoş geldin, **favorilerin ve rotaların** hesabına geçti', {tur: 'basari'}); };
  GM.uyeDuvar = (o = {}) => GM.sheet({
    baslik: o.baslik || 'Kaydetmek için üye ol',
    html: `<div class="gm-yigin">${GM.p(o.metin || 'Favorilerini ve rotalarını her cihazda saklamak için **10 saniyede** üye ol.')}<div class="gm-yigin-8">${SSO.map(b => GM.btn({...b, tur: 'secondary', tam: true, veri: {eylem: 'uye-sso', id: b.yol}})).join('')}${GM.btn({metin: 'E-posta ile devam et', tur: 'text', tam: true, veri: {eylem: 'uye-eposta'}})}</div></div>`,
    altBar: GM.btn({metin: 'Şimdi değil', tur: 'secondary', tam: true, attrs: 'data-sheet-kapat'}),
    sonra: h => {
      const a = GM.eylem(h, 'uye-sso', el => { const yol = el.dataset.id; h.kapat(); rizaSheet(yol); });
      const b = GM.eylem(h, 'uye-eposta', () => { h.kapat(); GM.git('#/karsilama'); });
      return () => { a(); b(); };
    }
  });
  // Kayıt kancası: misafire özelliğin üye tarafını söyleyen tek satır.
  GM.kanca = (o = {}) => `<button type="button" class="gm-kanca" data-uye-ol="${esc(o.metin)}">${ik(o.ikon || 'lock')}<span>${esc(o.metin)}</span>${ik('chevron-right')}</button>`;

  const HALLER = ['yukleniyor', 'bos', 'hata', 'cevrimdisi', 'giris', 'kilitli'];
  const halsiz = h => h.replace(/([?&])hal=[^&]*&?/, '$1').replace(/[?&]$/, '');
  // Hal içeriği. Çevrimdışı: ağ gerektirmeyen ekran önbellekten çizilir, üstte şerit; e.cevrimici ekranlar (canlı sohbet, analiz, arama) bağlantı hatası verir.
  const halCiz = (hal, e, ctx) => {
    const tekrar = {metin: 'Tekrar dene', ikon: 'yenile', yerine: halsiz(ctx.hash)}, saat = GM.simdi().toTimeString().slice(0, 5).replace(':', '.');
    if (hal === 'yukleniyor') { const t = e.iskelet || 'ekran'; return ['ekran', 'detay', 'profil'].includes(t) ? GM.iskelet(t) : `<div class="gm-ic">${GM.iskelet(t)}</div>`; }
    if (hal === 'bos') return GM.bos({tam: true, ...e.bos});
    if (hal === 'hata') return GM.hataEkran({tur: 'sunucu', eylem: tekrar});
    if (hal === 'giris') return GM.girisGerekli(GM.UYE_KILIT[ctx.ad] || {});
    if (hal === 'kilitli') return GM.premiumKilit();
    return e.cevrimici
      ? `${GM.cevrimdisi('Çevrimdışısın', {saat})}${GM.hataEkran({tur: 'baglanti', eylem: tekrar})}`
      : `${GM.cevrimdisi('Çevrimdışısın', {saat})}${e.ciz(ctx)}`;
  };
  const ciz = g => {
    const {e, ctx, el} = g;
    g.temizle?.(); g.temizle = null;
    let bar = '', icerik = '', alt = '';
    // Durum halleri (?hal=): router her ekrana ortak bileşenle verir; boş hal yalnız e.bos tanımlıysa (yoksa ekran kendisi çizer). e.haller === false: akış ekranları.
    const halAd = e.haller === false ? null : HALLER.includes(ctx.sorgu?.hal) && (ctx.sorgu.hal !== 'bos' || e.bos) ? ctx.sorgu.hal : null;
    const kilit = !halAd && !GM.uye() && GM.UYE_KILIT[g.ad], bekliyor = !halAd && !kilit && e.yukle && !g.yuklendi;
    try {
      if ((e.tur || 'alt') !== 'tam') bar = GM.ustBar(halAd && halAd !== 'cevrimdisi' ? {...barAyar(e, ctx), saydam: false} : kilit ? (e.dock ? {tur: 'sekme'} : {tur: 'alt', baslik: kilit.baslik}) : barAyar(e, ctx));
      icerik = halAd ? halCiz(halAd, e, ctx) : kilit ? GM.girisDuvari({tam: true, ikon: kilit.ikon, baslik: kilit.baslik, metin: kilit.metin, uyeOl: kilit.metin.replace(/\*\*/g, '')}) : bekliyor ? GM.iskelet(e.iskelet || 'ekran') : e.ciz(ctx);
      // Görselli bant (GM.haritaHero / GM.selamBas gorsel) ile başlayan sekme ekranı: header görselin ÜSTÜNDE şeffaf başlar, kayınca solid (Gastro hero kuralı; Görev 7).
      if (!halAd && !kilit && (e.tur || 'alt') === 'sekme' && /^\s*<(section class="gm-hh|header class="gm-selam[^"]*has-gorsel)/.test(icerik)) bar = GM.ustBar({...barAyar(e, ctx), saydam: true});
      if (!kilit && !bekliyor && (!halAd || halAd === 'cevrimdisi' && !e.cevrimici) && e.altBar) alt = e.altBar(ctx) || '';
    } catch (hata) {
      console.error(`[ekran ${g.ad}]`, hata);
      icerik = GM.hataEkran({tur: 'genel', eylem: {metin: 'Keşfet’e dön', yerine: '#/kesfet'}, ikinciller: []});
    }
    el.innerHTML = `${bar}<div class="gm-kaydir"><div class="gm-icerik">${icerik}</div></div>${alt ? `<div class="gm-altbar">${alt}</div>` : ''}`;
    if (window.GMMetin) GMMetin.isle(el);
    el.classList.toggle('has-saydam', !!el.querySelector('.gm-header.is-photo'));
    el.classList.toggle('has-altbar', !!alt);
    el.classList.toggle('has-ust', !!bar);
    if (!el.classList.contains('is-gizli')) el.querySelector('.gm-kaydir').setAttribute('data-scroll', '');
    baglaKaydirma(g);
    if (bekliyor) {
      Promise.resolve().then(() => e.yukle(ctx)).then(() => { g.yuklendi = true; if (g.el.isConnected) ciz(g); })
        .catch(() => { el.querySelector('.gm-icerik').innerHTML = GM.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', veri: {'gm-tazele': 1}}}); });
      return;
    }
    if (!kilit && (!halAd || halAd === 'cevrimdisi' && !e.cevrimici) && e.sonra) { try { g.temizle = e.sonra(el, ctx) || null; } catch (hata) { console.error(`[ekran ${g.ad}]`, hata); } }
  };

  // Üst bar alfası Gastro bannerHeader, panel yapışması kubbeYapis ile aynı kural; kaydırıcı ekrana özeldir.
  const baglaKaydirma = g => {
    const k = g.el.querySelector('.gm-kaydir'), bar = g.el.querySelector('.gm-header'), panel = g.el.querySelector('.gm-panel');
    const altbar = g.el.querySelector('.gm-altbar');
    if (altbar) {
      // Kayan çubuk (GM.kayanBar) mutlak konumlu: kap 0 ölçülür, çocuğun yüksekliği alınır.
      const olc = () => { g.el.style.setProperty('--gm-altbar-h', `${Math.max(altbar.offsetHeight, ...[...altbar.children].map(c => c.offsetHeight))}px`) };
      olc(); const gozcu = new ResizeObserver(olc); gozcu.observe(altbar); [...altbar.children].forEach(c => gozcu.observe(c));
    }
    const foto = bar?.classList.contains('is-photo');
    const esikEl = () => g.el.querySelector('.gm-banner-metin .gm-t-label,.gm-banner-metin h1,.gm-hero-top h1,.gm-gkapak [data-gm-veil-from],.gm-gkapak h1,.gm-hh-baslik,.gm-selam h1') || g.el.querySelector('.gm-banner-metin');
    const kayan = g.el.querySelector('.gm-kayan');
    const guncelle = () => {
      const y = k.scrollTop, r0 = k.getBoundingClientRect();
      if (foto) {
        const e = esikEl(), h = bar.offsetHeight;
        const esik = e ? Math.max(1, Math.min(TK.space[48], e.getBoundingClientRect().top - r0.top + y - h - TK.space[8])) : TK.space[48];
        const a = azHareket() ? (y > 0 ? 1 : 0) : kisit(y / esik, 0, 1);
        bar.style.setProperty('--gm-alfa', a.toFixed(3));
        bar.classList.toggle('is-saydam', a < 1);
      }
      if (panel) panel.classList.toggle('is-yapisik', panel.getBoundingClientRect().top - r0.top <= (bar ? bar.offsetHeight : 0) + 1);
      GM._kalipKaydir?.(g, k, bar);
      if (kayan) { const on = panel ? panel.offsetTop - (bar?.offsetHeight || 0) < y : y > TK.size.banner; kayan.classList.toggle('is-gorunur', on); kayan.inert = !on; }
    };
    k.addEventListener('scroll', guncelle, {passive: true});
    guncelle();
    cekYenileBagla(g, k);
  };

  const giris = r => {
    const e = ekranlar[r.ad] || hataTanim;
    const ctx = {ad: r.ad, param: r.param, sorgu: r.sorgu, hash: r.hash, durum: GM.durum};
    const el = belge.createElement('section');
    el.className = `gm-ekran gm-ekran--${e.tur || 'alt'}${e.dock ? ' has-dock' : ''}`;
    el.dataset.ekran = r.ad;
    return {i: R.idx, hash: r.hash, ad: r.ad, e, ctx, el, temizle: null};
  };

  // Geçiş: ileri sağdan, geri soldan, modal aşağıdan, sekme çapraz solma (ölçü ve eğri Gastro).
  const bitir = () => { R.anim.splice(0).forEach(a => { try { a.finish(); } catch { /* bitmiş */ } }); };
  const oynat = (el, kf, ms, easing) => {
    const a = el.animate(kf, {duration: azHareket() ? 0 : ms, easing, fill: 'none'});
    R.anim.push(a);
    return a.finished.catch(() => {});
  };
  const gizle = el => { el.classList.add('is-gizli'); el.inert = true; el.querySelector('.gm-kaydir')?.removeAttribute('data-scroll'); };
  const goster = el => { el.classList.remove('is-gizli'); el.inert = false; el.querySelector('.gm-kaydir')?.setAttribute('data-scroll', ''); };

  const gecis = (yeni, eski, yon) => {
    // Gastro dg-hareket.css §6 + Flutter DgPageRoute: ileri yeni sayfa 24 sağdan solarak (page, emphasizedDecel), eski 24 sola solarak (pageExit, emphasizedAccel);
    // geri alttaki sayfa 24 soldan gelir, kapanan aynı çıkışla gider; modal 32 aşağıdan, kapanırken aynı yola döner; sekme çapraz solma.
    const E = M.easing, d = TK.space[24], S = {opacity: 1, transform: 'none'};
    const sag = {opacity: 0, transform: `translateX(${d}px)`}, sol = {opacity: 0, transform: `translateX(${-d}px)`}, alt = {opacity: 0, transform: `translateY(${TK.space[32]}px)`};
    // Çıkış pageExit'te biter, giriş page sürer: çıkan sayfa girişin sonuna dek görünmez kalır (fill yok, geri gelmesin).
    const cik = son => [{...S, easing: E.emphasizedAccel}, {...son, offset: M.pageExit / M.page}, son];
    const isler = [];
    if (yon === 'ileri') {
      isler.push(oynat(yeni, [sag, S], M.page, E.emphasizedDecel));
      if (eski) isler.push(oynat(eski, cik(sol), M.page, 'linear'));
    } else if (yon === 'geri') {
      if (eski) { eski.style.zIndex = 2; isler.push(oynat(eski, cik(sol), M.page, 'linear')); }
      isler.push(oynat(yeni, [sol, S], M.page, E.emphasizedDecel));
    } else if (yon === 'modal') {
      yeni.style.zIndex = 2;
      isler.push(oynat(yeni, [alt, S], M.page, E.emphasizedDecel));
    } else if (yon === 'modal-kapat') {
      if (eski) { eski.style.zIndex = 2; isler.push(oynat(eski, [S, alt], M.pageExit, E.emphasizedAccel)); }
    } else {
      isler.push(oynat(yeni, [{opacity: 0}, {opacity: 1}], M.quick, E.standard));
    }
    return Promise.all(isler);
  };

  const dockGuncelle = g => {
    const e = g.e, goster_ = (e.tur === 'sekme') || e.dock === true;
    R.sahne.classList.toggle('has-dock', goster_);
    const aktif = e.nav || (e.tur === 'sekme' ? g.ad : '');
    R.sahne.querySelectorAll('.gm-nav [data-nav]').forEach(a => { a.dataset.nav === aktif ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
  };

  // Yeniden eklemek kaydırma konumunu sıfırlar: sekme ekranı DOM'da kalır, üste z-index ile gelir.
  const sok = g => { if (g.el.parentNode !== R.yiginEl) R.yiginEl.append(g.el); };
  // Sekme ekranı DOM'da kalır: sonra bağları ve temizleme yaşar, yalnız görünümden çekilir. Temizleme ekran kapanınca ya da yeniden çizilince çalışır.
  const kaldir = g => { if (g.e.tur === 'sekme') { if (!R.yigin.includes(g)) gizle(g.el); return; } g.temizle?.(); g.temizle = null; g.el.remove(); };
  // Üstten çekilme: üstüne ekran açıldı, sekme değişti ya da kapanıyor. donus ile çifttir.
  const gizlendi = g => { if (!g || g.gizli) return; g.gizli = true; try { g.e.gizlen?.(g.el, g.ctx); } catch (hata) { console.error(`[ekran ${g.ad}]`, hata); } };

  const sekmeGiris = r => {
    let g = R.sekmeler[r.ad];
    if (g) { g.i = R.idx; g.hash = r.hash; g.donus = true; return g; }
    g = giris(r); R.sekmeler[r.ad] = g; return g;
  };

  const donus = g => { const geldi = g.gizli; g.gizli = false; GM.zilTazele?.(); if (g.e.yenile) { const k = g.el.querySelector('.gm-kaydir'), y = k?.scrollTop || 0; ciz(g); const k2 = g.el.querySelector('.gm-kaydir'); if (k2) k2.scrollTop = y; } if (geldi) g.e.donus?.(g.el, g.ctx); };

  const goruntule = (r, yon, degistir) => {
    bitir();
    const e = ekranlar[r.ad] || hataTanim;
    const eski = ust();
    if (e.tur === 'sekme') {
      const g = sekmeGiris(r), ilk = !g.el.childElementCount;
      if (eski !== g) gizlendi(eski);
      const atilacak = R.yigin.filter(x => x !== g);
      R.yigin = [g];
      sok(g); goster(g.el); g.el.style.zIndex = 3;
      if (ilk) ciz(g); else donus(g);
      dockGuncelle(g);
      gecis(g.el, eski?.el, 'solma').then(() => { g.el.style.zIndex = ''; atilacak.forEach(x => { kaldir(x); x.el.style.zIndex = ''; }); });
      return;
    }
    const g = giris(r);
    gizlendi(eski);
    if (degistir && eski) R.yigin.pop();
    if (yon === 'yeni') { const atilacak = R.yigin.splice(0); gecisSonuTemizle(atilacak); }
    R.yigin.push(g);
    sok(g); goster(g.el); ciz(g); dockGuncelle(g);
    const y = e.tur === 'modal' && yon === 'ileri' ? 'modal' : degistir ? 'solma' : yon;
    gecis(g.el, eski?.el, y === 'yeni' ? 'solma' : y).then(() => {
      g.el.style.zIndex = '';
      if (degistir && eski) kaldir(eski);
      else if (eski && eski.el.isConnected && eski !== g) gizle(eski.el);
    });
  };
  const gecisSonuTemizle = liste => { setTimeout(() => liste.forEach(kaldir), azHareket() ? 0 : M.page); };

  const geriDon = hedefI => {
    bitir();
    const eski = ust();
    gizlendi(eski);
    let n = R.yigin.findIndex(x => x.i === hedefI);
    const atilan = R.yigin.splice(n + 1);
    const g = ust();
    goster(g.el); g.el.style.zIndex = '';
    dockGuncelle(g);
    donus(g);
    gecis(g.el, eski.el, eski.e.tur === 'modal' ? 'modal-kapat' : 'geri').then(() => { atilan.forEach(x => { kaldir(x); x.el.style.zIndex = ''; }); });
  };

  GM.git = hash => {
    if (!R.hazir) { location.hash = hash; return; }
    katmanlariKapat();
    if (ust()?.hash === hash) { ust().el.querySelector('.gm-kaydir')?.scrollTo({top: 0, behavior: azHareket() ? 'auto' : 'smooth'}); return; }
    R.idx += 1;
    history.pushState({gm: R.idx}, '', hash);
    goruntule(rotaBul(hash), 'ileri');
  };
  GM.yerine = hash => {
    if (!R.hazir) { location.replace(hash); return; }
    katmanlariKapat();
    history.replaceState({gm: R.idx}, '', hash);
    goruntule(rotaBul(hash), 'yeni');
  };
  GM.geri = (yedek = '#/kesfet') => {
    if (!R.hazir) { history.back(); return; }
    katmanlariKapat();
    if (R.yigin.length > 1) { history.back(); return; }
    const hedef = ust()?.e.ust || yedek;
    history.replaceState({gm: R.idx}, '', hedef);
    goruntule(rotaBul(hedef), 'geri', true);
  };
  GM.tazele = () => { const g = ust(); if (!g) return; const y = g.el.querySelector('.gm-kaydir')?.scrollTop || 0; ciz(g); const k = g.el.querySelector('.gm-kaydir'); if (k) k.scrollTop = y; };

  addEventListener('popstate', ev => {
    if (!R.hazir) return;
    if (katmanVar()) { katmanlariKapat(); history.pushState({gm: R.idx}, '', ust()?.hash || location.hash); return; }
    const hash = location.hash || '#/kesfet', i = ev.state?.gm;
    if (i == null) { R.idx += 1; history.replaceState({gm: R.idx}, '', hash); goruntule(rotaBul(hash), 'ileri'); return; }
    const onceki = R.idx; R.idx = i;
    if (i < onceki && R.yigin.some(x => x.i === i) && ust().i !== i) geriDon(i);
    else if (ust()?.hash !== hash) goruntule(rotaBul(hash), i < onceki ? 'geri' : 'ileri', i < onceki);
  });

  // ---------- Açılış ----------
  const yukleSirayla = dosyalar => Promise.all(dosyalar.map(ad => new Promise(bitti => {
    const s = belge.createElement('script');
    s.src = `ekranlar/${ad}.js`; s.async = false; s.onload = s.onerror = () => bitti();
    belge.head.append(s);
  })));

  GM.baslat = async () => {
    R.sahne = belge.getElementById('gm-sahne');
    R.sahne.innerHTML = `<div class="gm-ekranlar" id="gm-ekranlar"></div>${GM.altMenu()}<div class="gm-katman" id="gm-katman"></div>`;
    R.yiginEl = belge.getElementById('gm-ekranlar');
    await yukleSirayla(window.GM_EKRAN_DOSYALARI || []);
    R.hazir = true;
    const hash = location.hash && location.hash.length > 2 ? location.hash : '#/splash';
    history.replaceState({gm: 0}, '', hash);
    goruntule(rotaBul(hash), 'yeni');
  };

  // ---------- Katmanlar: sheet, dialog, toast ----------
  const katmanEl = () => {
    let k = belge.getElementById('gm-katman');
    if (!k) { k = belge.createElement('div'); k.id = 'gm-katman'; k.className = 'gm-katman is-serbest'; belge.body.append(k); }
    return k;
  };
  const acik = [];
  const katmanVar = () => acik.length > 0;
  const katmanlariKapat = () => { [...acik].reverse().forEach(a => a.kapat()); };

  const odakKapani = (kok, ev) => {
    if (ev.key !== 'Tab') return;
    const f = [...kok.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
    if (!f.length) { ev.preventDefault(); return; }
    const a = f[0], z = f[f.length - 1];
    if (ev.shiftKey && belge.activeElement === a) { ev.preventDefault(); z.focus(); }
    else if (!ev.shiftKey && belge.activeElement === z) { ev.preventDefault(); a.focus(); }
  };

  // Sheet: Gastro DG.sheet işaretlemesi; telefon kolonunda kalsın diye <dialog> yerine katman. Dönen öğe d: d.kapat(), 'close' olayı, d.kok.
  GM.sheet = (o = {}) => {
    const kat = katmanEl(), onceki = belge.activeElement;
    const kap = belge.createElement('div');
    kap.className = 'gm-sheet-kap';
    const govde = o.html ?? o.govde ?? '', ayak = o.altBar ?? o.ayak ?? '';
    kap.innerHTML = `<div class="gm-perde" data-sheet-perde></div>
      <div class="gm-sheet${o.tam ? ' is-tam' : ''}${o.zorunlu ? ' is-zorunlu' : ''}${o.sinif ? ' ' + esc(o.sinif) : ''}" open role="dialog" aria-modal="true" aria-label="${esc(o.baslik || 'Sayfa')}" tabindex="-1"><div class="gm-tutamak" aria-hidden="true"></div><div class="gm-sheet-bas"><h2 class="gm-t-sheet">${esc(o.baslik || '')}</h2>${o.zorunlu ? '' : `<button class="gm-ibtn" type="button" data-sheet-kapat aria-label="Kapat">${ik('kapat')}</button>`}</div><div class="gm-sheet-govde">${govde}</div>${ayak ? `<div class="gm-sheet-ayak">${ayak}</div>` : ''}</div>`;
    kat.append(kap);
    const d = kap.querySelector('.gm-sheet'), perde = kap.querySelector('.gm-perde');
    if (window.GMMetin) GMMetin.isle(d);
    let bitti = false, temizle = null;
    d.kapat = sonuc => {
      if (bitti) return; bitti = true;
      acik.splice(acik.indexOf(d), 1);
      temizle?.();
      const son = () => { kap.remove(); d.dispatchEvent(new Event('close')); o.kapaninca?.(sonuc); };
      d.classList.add('is-cikis'); perde.classList.add('is-cikis');
      setTimeout(son, azHareket() ? 0 : M.pageExit);
      if (onceki?.isConnected) onceki.focus?.({preventScroll: true});
    };
    d.kok = d;
    acik.push(d);
    kap.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !o.zorunlu) d.kapat(); odakKapani(d, ev); });
    // Açılış hareketi sürerken (en az 300 ms, TK.motion.sheet) perdeye düşen dokunuş kapatmaz: çift dokunuşun ikincisi yeni açılan sheet'i kapatmasın. Hareket ayarından bağımsız.
    const acilis = performance.now(), perdeKilit = Math.max(300, M.sheet);
    kap.addEventListener('click', ev => { if (ev.target.closest('[data-sheet-kapat]') || (ev.target.hasAttribute('data-sheet-perde') && !o.zorunlu && performance.now() - acilis >= perdeKilit)) d.kapat(); });
    // Tutma çubuğundan aşağı sürükle: yarı yükseklik ya da hızlı fırlatma kapatır (Gastro kuralı).
    let y0 = null, t0 = 0;
    const tut = d.querySelector('.gm-tutamak');
    tut.addEventListener('pointerdown', ev => { if (o.zorunlu) return; y0 = ev.clientY; t0 = performance.now(); tut.setPointerCapture(ev.pointerId); d.style.transition = 'none'; });
    tut.addEventListener('pointermove', ev => { if (y0 != null) d.style.transform = `translateY(${Math.max(0, ev.clientY - y0)}px)`; });
    tut.addEventListener('pointerup', ev => { if (y0 == null) return; const dy = ev.clientY - y0, v = dy / Math.max(1, performance.now() - t0); y0 = null; d.style.transition = ''; d.style.transform = ''; if (dy > d.offsetHeight / 2 || v > .7) d.kapat(); });
    d.focus({preventScroll: true});
    if (o.sonra) { const t = o.sonra(d, d); if (typeof t === 'function') temizle = t; }
    return d;
  };

  // Onay: Gastro DG.onay işaretlemesi. Promise<bool>. {baslik, metin, eylem, iptal, yikici}
  GM.dialog = (o = {}) => new Promise(coz => {
    const kat = katmanEl(), onceki = belge.activeElement;
    const kap = belge.createElement('div');
    kap.className = 'gm-dialog-kap';
    // Gastro DG.onay: perdeye dokunmak kapatmaz; yalnız düğmeler ve Esc (geri = false).
    kap.innerHTML = `<div class="gm-perde"></div><div class="gm-diyalog" open role="alertdialog" aria-modal="true" aria-label="${esc(o.baslik || '')}" tabindex="-1"><h2 class="gm-t-sheet">${esc(o.baslik || '')}</h2>${o.metin ? `<p>${vurgu(o.metin)}</p>` : ''}${o.html || ''}<div class="${o.iptal === false ? '' : 'gm-ikili'}">${o.iptal === false ? '' : GM.btn({metin: o.iptal || 'İptal', tur: 'secondary', veri: {'dlg-iptal': 1}})}${GM.btn({metin: o.eylem || 'Tamam', tur: o.yikici ? 'yikici' : 'primary', tam: o.iptal === false, veri: {'dlg-tamam': 1}})}</div></div>`;
    kat.append(kap);
    const d = kap.querySelector('.gm-diyalog');
    const h = {kapat(v = false) { acik.splice(acik.indexOf(h), 1); kap.remove(); if (onceki?.isConnected) onceki.focus?.({preventScroll: true}); coz(v); }};
    acik.push(h);
    kap.addEventListener('click', ev => { if (ev.target.closest('[data-dlg-tamam]')) h.kapat(true); else if (ev.target.closest('[data-dlg-iptal]')) h.kapat(false); });
    kap.addEventListener('keydown', ev => { if (ev.key === 'Escape') h.kapat(false); odakKapani(d, ev); });
    d.focus({preventScroll: true});
  });

  // Snackbar: Gastro DG.bildir işaretlemesi, sırası korunur. GM.toast('Metin', {tur, ikon, eylem, onEylem, sure})
  const toastSira = []; let toastAcik = false, toastBitir = null;
  GM.toastKapat = () => toastBitir?.();
  GM.toast = (metin, o = {}) => { if (o.yerine) { toastSira.length = 0; GM.toastKapat(); } toastSira.push({metin, o}); toastCal(); };
  const toastCal = () => {
    if (toastAcik || !toastSira.length) return;
    toastAcik = true;
    const {metin, o} = toastSira.shift(), kat = katmanEl();
    const ikon = o.ikon || {basari: 'basari', uyari: 'uyari', hata: 'hata', bilgi: 'bilgi'}[o.tur];
    const el = belge.createElement('div');
    el.className = o.tur ? `gm-snack is-${o.tur}` : 'gm-snack'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    el.innerHTML = `${ikon ? ik(ikon) : ''}<span>${vurgu(metin)}</span>${o.eylem ? `<button type="button">${esc(o.eylem)}</button>` : ''}`;
    const g = ust();
    // Gastro .dgu-snack: dock varken sayfa sonu boşluğu (pageEnd), yokken 24; alt eylem çubuğu varsa çubuğun 24 üstü.
    if (g) el.style.setProperty('--gm-snack-alt', `${(R.sahne.classList.contains('has-dock') ? TK.size.pageEnd : TK.space[24]) + (g.el.querySelector('.gm-altbar')?.offsetHeight || 0)}px`);
    kat.append(el);
    requestAnimationFrame(() => el.classList.add('is-on'));
    let bitti = false;
    const kapat = () => {
      if (bitti) return; bitti = true; clearTimeout(z);
      el.classList.remove('is-on');
      setTimeout(() => { el.remove(); toastAcik = false; toastCal(); }, azHareket() ? 0 : M.base);
    };
    toastBitir = kapat;
    const z = setTimeout(kapat, o.sure ?? (o.eylem ? M.toastAction : M.toast));
    el.querySelector('button')?.addEventListener('click', () => { o.onEylem?.(); kapat(); });
  };

  // Çıkış: DOM'da kalan sekmeler eski çizimi taşımasın diye uygulama baştan yüklenir. replaceState hashchange atmaz, router yarışmaz.
  // hedef: çıkıştan sonra açılacak adres (ör. başka hesaba ait bağlantı); varsayılan Keşfet.
  GM.cikis = (hedef = '#/kesfet') => { GM.durum.sifirla(); history.replaceState(null, '', hedef); location.reload(); };

  // ---------- Çekerek yenile ----------
  const cekYenileBagla = (g, k) => {
    if (!g.e.cekYenile) return;
    const y = belge.createElement('div');
    y.className = 'gm-yenile'; y.setAttribute('role', 'status'); y.setAttribute('aria-label', 'Yenileniyor'); y.innerHTML = ik('rotate-right');
    g.el.append(y);
    let y0 = null, d = 0;
    k.addEventListener('touchstart', ev => { if (k.scrollTop > 0) return; y0 = ev.touches[0].clientY; d = 0; y.classList.remove('is-birak'); }, {passive: true});
    k.addEventListener('touchmove', ev => { if (y0 == null) return; d = Math.max(0, ev.touches[0].clientY - y0); if (!d) return; y.classList.add('is-gorunur'); y.style.setProperty('--gm-cek', `${Math.min(TK.space[48] * 2, d / 2)}px`); }, {passive: true});
    k.addEventListener('touchend', async () => {
      if (y0 == null) return; y0 = null; y.classList.add('is-birak');
      if (d / 2 >= TK.space[48]) {
        y.style.setProperty('--gm-cek', `${TK.space[64]}px`); y.classList.add('is-donuyor');
        await g.e.cekYenile(g.ctx);
        GM.tazele(); GM.toast('Güncellendi');
      } else { y.style.setProperty('--gm-cek', '0px'); y.classList.remove('is-gorunur'); }
    });
  };

  // ---------- Canlandırma: yeni çizilen bileşenleri otomatik uyandırır ----------
  const sayaclar = new Set();
  setInterval(() => { sayaclar.forEach(el => { if (!el.isConnected) { sayaclar.delete(el); return; } sayacAdim(el, !!el.closest('.is-gizli')); }); }, 1000);

  const sayacMetin = s => { s = Math.max(0, Math.round(s)); return `${iki(Math.floor(s / 3600))}:${iki(Math.floor(s / 60) % 60)}:${iki(s % 60)}`; };
  GM.sayacMetin = sayacMetin;
  const rakamlar = m => [...m].map(c => (c === ':' ? '<span class="gm-rakam-ayrac">:</span>' : `<span class="gm-rakam">${c}</span>`)).join('');
  GM.rakamlar = rakamlar;
  // Gizli sekmede sayım sürer, yalnız çizim atlanır: dönüşte geçen süre kaybolmaz.
  const sayacAdim = (el, sessiz) => {
    const yon = +(el.dataset.yon || 1), s = (+el.dataset.saniye) + yon;
    el.dataset.saniye = s;
    if (sessiz) return;
    if (el.dataset.c === 'geri') { GM._geriSayimCiz?.(el, s); return; }
    el.innerHTML = GM.sayacHtml(s);
  };

  const yayAc = el => {
    const son = +el.dataset.uzun, gecik = +(el.dataset.gecik || 0);
    if (azHareket()) return;
    el.setAttribute('stroke-dasharray', `0 ${el.dataset.tur || 100}`);
    el.style.visibility = 'hidden';
    setTimeout(() => { el.style.visibility = ''; GM.tween(M.dolum, p => el.setAttribute('stroke-dasharray', `${son * p} ${el.dataset.tur || 100}`)); }, gecik);
  };

  // Görsel yer tutucu, kayan gösterge, sayaç artışı, sıralı belirme: Gastro hareketBaslat parçaları.
  const GORSEL_SEC = '.gm-photo,.gm-puf-foto,.gm-mod-foto,.gm-kucuk-foto,.gm-blok-foto,.gm-banner-foto,.gm-secim-foto';
  const gorselHazirla = kok => kok.querySelectorAll(GORSEL_SEC).forEach(el => {
    if (el.dataset.gorsel) return; const m = /url\(['"]?([^'")]+)['"]?\)/.exec(el.style.backgroundImage || ''); if (!m) return;
    el.dataset.gorsel = '1'; const im = new Image(); im.src = m[1]; if (im.complete) return;
    el.classList.add('is-gorsel-bekliyor'); const bitti = () => el.classList.remove('is-gorsel-bekliyor'); im.onload = bitti; im.onerror = bitti;
  });
  const segGosterge = kok => kok.querySelectorAll('.gm-seg:not(.is-kaydir)').forEach(sg => {
    const b = sg.querySelector('button[aria-selected=true],button[aria-pressed=true]'); if (!b || !sg.offsetWidth) return;
    const ilk = !sg.classList.contains('has-gosterge'); sg.classList.add('has-gosterge'); if (ilk) sg.classList.add('is-ilk');
    sg.style.setProperty('--gm-seg-x', `${b.offsetLeft}px`); sg.style.setProperty('--gm-seg-w', `${b.offsetWidth}px`);
    if (ilk) requestAnimationFrame(() => requestAnimationFrame(() => sg.classList.remove('is-ilk')));
  });
  GM.segGosterge = (kok = belge) => segGosterge(kok);
  const sayacGozcu = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; sayacGozcu.unobserve(e.target);
    const el = e.target, hedef = +el.dataset.sayacHedef;
    GM.tween(M.counter, p => { el.textContent = Math.round(hedef * p).toLocaleString('tr'); });
  }), {threshold: .6});
  const sayacHazirla = kok => { if (azHareket()) return; kok.querySelectorAll('.gm-istatistik dd, .gm-stats b, [data-sayac-anim]').forEach(el => {
    if (el.dataset.sayacHedef) return; const t = el.textContent.trim(); if (!/^\d{1,3}(\.\d{3})*$/.test(t)) return;
    const v = +t.replace(/\./g, ''); if (v < 2) return; el.dataset.sayacHedef = v; sayacGozcu.observe(el);
  }); };
  const siraliBelir = kok => { if (azHareket()) return; kok.querySelectorAll('.gm-izgara, .gm-izgara-3, .gm-uzman-izgara, .gm-rozet-izgara, .gm-satirlar').forEach(k => {
    if (k.dataset.belirdi || k.closest('[inert]')) return; k.dataset.belirdi = '1';
    [...k.children].slice(0, 12).forEach((c, i) => { if (c.getBoundingClientRect().top > innerHeight * 1.2) return; c.style.setProperty('--gm-i', i); c.classList.add('gm-sira-belir'); c.addEventListener('animationend', () => c.classList.remove('gm-sira-belir'), {once: true}); });
  }); };

  GM.canlandir = (kok = belge) => {
    gorselHazirla(kok); segGosterge(kok); sayacHazirla(kok); siraliBelir(kok);
    kok.querySelectorAll('[data-c]:not([data-canli])').forEach(el => {
      el.dataset.canli = 1;
      const c = el.dataset.c;
      if (c === 'yay') yayAc(el);
      else if (c === 'say') { const h = +el.dataset.hedef; el.dataset.simdiki = 0; if (azHareket()) { el.dataset.simdiki = h; return; } GM.say(el, h, {sure: M.dolum}); }
      else if (c === 'bar') requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-canli')));
      else if (c === 'sayac' || c === 'geri') sayaclar.add(el);
      else if (c === 'kadran') GM._kadranCiz?.(el);
      else if (c === 'slider') sliderCiz(el, +el.dataset.deger, true);
      else if (c === 'grafik') GM._grafikCiz?.(el);
      else if (c === 'kubbe') GM.kubbeBoya?.(el);
      else if (c === 'kalip') GM._kalipKur?.(el);
      else if (c === 'harita') GM._haritaKur?.(el);
      else if (c === 'takvim') { const o = JSON.parse(el.dataset.tk), ad = o.ad; GMTakvim.kur(el, o, {sec: v => degisim(el, ad, v)}); }
    });
    if (window.GMCard) GMCard.veils(kok === belge ? belge : kok);
  };
  let bekleyen = false;
  new MutationObserver(() => { if (bekleyen) return; bekleyen = true; requestAnimationFrame(() => { bekleyen = false; GM.canlandir(); }); }).observe(belge.documentElement, {childList: true, subtree: true});

  // ---------- Olay yetkilendirme ----------
  // data-eylem yetkilendirmesi: GM.eylem(kok, 'plan-uygula', (el, ev) => {...}); dönen işlev bağı çözer.
  // GM.dosyaAlan: seçilen dosyanın adı düğmede görünür; vazgeçilirse ilk metne döner.
  belge.addEventListener('change', ev => { const i = ev.target; if (!i.matches?.('.gm-dosya input[type=file]')) return; const s = i.closest('.gm-dosya').querySelector('[data-dosya-ad]'); s.textContent = i.files?.[0]?.name || s.dataset.bos; });
  GM.eylem = (kok, ad, fn) => { const h = ev => { const el = ev.target.closest?.(`[data-eylem="${ad}"]`); if (el && kok.contains(el)) fn(el, ev); }; kok.addEventListener('click', h); return () => kok.removeEventListener('click', h); };
  GM.on = (kok, ad, fn) => { const h = ev => { if (ev.detail?.ad === ad) fn(ev.detail.deger, ev.detail, ev); }; kok.addEventListener('gm-degisim', h); return () => kok.removeEventListener('gm-degisim', h); };

    belge.addEventListener('click', ev => {
    const t = ev.target;
    if (bastirTik) { bastirTik = false; ev.preventDefault(); ev.stopPropagation(); return; }
    const a = t.closest('[data-git],[data-yerine],[data-geri],[data-gm-tazele]');
    if (a && !a.matches('[aria-disabled=true],:disabled')) {
      ev.preventDefault();
      if (a.dataset.git) GM.git(a.dataset.git); else if (a.dataset.yerine) GM.yerine(a.dataset.yerine); else if (a.hasAttribute('data-geri')) GM.geri(); else GM.tazele();
      return;
    }
    if (t.closest('[data-menu]')) { GM.menu?.ac(); return; }
    const seg = t.closest('.gm-seg button');
    if (seg && !seg.closest('[data-takvim]')) {
      const k = seg.closest('.gm-seg'); k.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b === seg));
      if (k.classList.contains('is-kaydir')) seg.scrollIntoView({inline: 'center', block: 'nearest', behavior: azHareket() ? 'auto' : 'smooth'}); else segGosterge(k.parentElement || k);
      degisim(k, k.dataset.ad, seg.dataset.seg); return;
    }
    const cip = t.closest('[data-cip]');
    if (cip) {
      const k = cip.closest('[data-cip-grup]'), tek = k?.dataset.cipGrup === 'tek', on = cip.getAttribute('aria-pressed') === 'true';
      if (tek) k.querySelectorAll('[data-cip]').forEach(b => b.setAttribute('aria-pressed', b === cip));
      else cip.setAttribute('aria-pressed', !on);
      const liste = k ? [...k.querySelectorAll('[data-cip][aria-pressed=true]')].map(b => b.dataset.cip) : [cip.dataset.cip];
      degisim(k || cip, (k || cip).dataset.ad, tek ? cip.dataset.cip : liste);
      return;
    }
    const sec = t.closest('.gm-secim-kart');
    if (sec) {
      const k = sec.closest('.gm-secim-izgara'), tek = sec.getAttribute('role') === 'radio';
      if (tek) k?.querySelectorAll('.gm-secim-kart').forEach(b => b.setAttribute('aria-checked', b === sec));
      else sec.setAttribute('aria-pressed', sec.getAttribute('aria-pressed') !== 'true');
      const liste = k ? [...k.querySelectorAll('.gm-secim-kart[aria-pressed=true],.gm-secim-kart[aria-checked=true]')].map(b => b.dataset.k) : [];
      degisim(k || sec, (k || sec).dataset.ad, tek ? sec.dataset.k : liste);
      return;
    }
    const st = t.closest('[data-adim-yon]');
    if (st) { stepperAdim(st.closest('[data-adimlayici]'), +st.dataset.adimYon); return; }
    const tmz = t.closest('.gm-temizle');
    if (tmz) { const k = tmz.closest('.gm-girdi'), i = k.querySelector('input,textarea'); i.value = ''; k.classList.remove('has-text'); i.focus(); i.dispatchEvent(new Event('input', {bubbles: true})); return; }
    const duy = t.closest('.gm-duygu button');
    if (duy) { const k = duy.closest('.gm-duygu'); k.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === duy)); duy.scrollIntoView({inline: 'center', block: 'nearest', behavior: azHareket() ? 'auto' : 'smooth'}); degisim(k, k.dataset.ad || 'duygu', duy.dataset.deger); return; }
    const uo = t.closest('[data-uye-ol]');
    if (uo) { GM.uyeDuvar({metin: uo.dataset.uyeOl}); return; }
    const su = t.closest('[data-su-ekle],[data-su-cikar]');
    if (su) { suEkle(su.closest('.gm-su'), su.dataset.suCikar ? -su.dataset.suCikar : +su.dataset.suEkle, su.classList.contains('gm-bardak')); return; }
    const por = t.closest('.gm-porsiyon [data-birim]');
    if (por) {
      const k = por.closest('.gm-porsiyon'), st2 = k.querySelector('[data-adimlayici]'), gram = por.dataset.birim === 'gram', onceki = k.querySelector('[data-birim][aria-pressed=true]');
      const toplam = +onceki.dataset.gram * +st2.querySelector('input').value;
      k.querySelectorAll('[data-birim]').forEach(b => b.setAttribute('aria-pressed', b === por));
      Object.assign(st2.dataset, gram ? {min: 10, max: 1000, adim: 10} : {min: .5, max: 20, adim: .5});
      st2.querySelector('input').value = gram ? Math.max(10, Math.round(toplam / 10) * 10) : 1; st2.dataset.birim = por.dataset.birim;
      stepperAdim(st2, 0);
      return;
    }
    const ako = t.closest('.gm-akordiyon .gm-bolum-bas');
    if (ako) { const k = ako.closest('.gm-akordiyon'), b = ako.closest('.gm-ak-bolum'), acilsin = !b.classList.contains('is-acik'); k.querySelectorAll('.gm-ak-bolum').forEach(x => { const on = x === b && acilsin; x.classList.toggle('is-acik', on); x.querySelector('.gm-bolum-bas').setAttribute('aria-expanded', on); x.querySelector('.gm-ak-panel').inert = !on; }); return; }
    const bb = t.closest('.gm-bbox-et,.gm-bbox-nokta');
    if (bb) { const k = bb.closest('.gm-bbox'), oge = bb.parentElement; k.querySelectorAll('.gm-bbox-oge').forEach(b => b.classList.toggle('is-secili', b === oge)); degisim(k, k.dataset.ad || 'bbox', bb.dataset.deger); return; }
    const km = t.closest('.gm-kamera-mod');
    if (km) { const k = km.closest('.gm-kamera'); k.querySelectorAll('.gm-kamera-mod').forEach(b => b.setAttribute('aria-selected', b === km)); k.dataset.mod = km.dataset.deger; k.classList.toggle('is-barkod', km.dataset.deger === 'barkod'); km.scrollIntoView({inline: 'center', block: 'nearest', behavior: azHareket() ? 'auto' : 'smooth'}); const ip = k.querySelector('.gm-kamera-yonerge'); if (ip && km.dataset.ipucu) ip.textContent = km.dataset.ipucu; degisim(k, 'kameraMod', km.dataset.deger); return; }
    const kb = t.closest('[data-kamera]');
    if (kb) { const a = kb.dataset.kamera; if (a === 'kapat') GM.geri(); else if (a === 'flas') { const on = kb.getAttribute('aria-pressed') !== 'true'; kb.setAttribute('aria-pressed', on); GM.toast(on ? 'Flaş açık' : 'Flaş kapalı'); } else if (a === 'cevir') GM.toast('Kamera çevrildi'); else if (a === 'ipucu') kb.closest('.gm-kamera-ipucu')?.remove(); yay(kb, 'gm-kamera', {eylem: a}); return; }
    const sw = t.closest('.gm-swipe-eylem');
    if (sw) { const k = sw.closest('.gm-swipe'); swipeKapat(k); yay(k, 'gm-eylem', {eylem: sw.dataset.eylem, id: k.dataset.id}); return; }
    const ub = t.closest('[data-uzunbas]');
    if (ub && ev.detail === 0) { // klavye ve ekran okuyucu: uzun bas yerine onay
      GM.dialog({baslik: ub.dataset.onayBaslik || ub.textContent.trim(), metin: ub.dataset.onayMetin || '', eylem: ub.dataset.onayEylem || 'Onayla'}).then(v => { if (v) yay(ub, 'gm-onay', {ad: ub.dataset.ad}); });
    }
  });

  belge.addEventListener('input', ev => {
    const t = ev.target, k = t.closest?.('.gm-girdi');
    if (k) k.classList.toggle('has-text', !!t.value);
  });
  belge.addEventListener('change', ev => {
    const t = ev.target;
    if (t.matches?.('.gm-kalem input')) t.closest('.gm-kalem').classList.toggle('is-tamam', t.checked);
    if (t.matches?.('.gm-anahtar input,.gm-secim input')) degisim(t, t.name || t.closest('[data-ad]')?.dataset.ad, t.type === 'radio' ? t.value : t.checked);
  });
  // Bağlantı gibi çalışan a[href="#/..."]
  // Şifreyi göster/gizle (Görev 12, denetim + kimlik ajanı): GM.input şifre alanındaki data-sifre-goster düğmesinin kanon davranışı (Diet'te de eksikti).
  // type password ↔ text, ikon eye ↔ eye-slash, aria-pressed ve aria-label. Bütün şifre alanları (giriş, kayıt, ayarlar › güvenlik …) alır.
  GM.sifreGosterKanon = true;
  belge.addEventListener('click', ev => { const b = ev.target.closest?.('[data-sifre-goster]'), i = b?.closest('.gm-girdi')?.querySelector('input'); if (!i) return;
    const ac = i.type === 'password'; i.type = ac ? 'text' : 'password'; b.setAttribute('aria-pressed', String(ac)); b.setAttribute('aria-label', ac ? 'Şifreyi gizle' : 'Şifreyi göster');
    const ic = b.querySelector('.icon, i'); if (ic) { ic.classList.toggle('fa-eye', !ac); ic.classList.toggle('fa-eye-slash', ac); } });
  belge.addEventListener('click', ev => { const a = ev.target.closest?.('a[href^="#/"]'); if (!a || !R.hazir) return; ev.preventDefault(); if (!bastirTik) GM.git(a.getAttribute('href')); }, true);

  // Adımlayıcı (Gastro DG.adimlayici işaretlemesi)
  const stepperAdim = (k, yon) => {
    const d = k.dataset, i = k.querySelector('input'), v = kisit(+(+i.value + yon * +d.adim).toFixed(3), +d.min, +d.max);
    i.value = v;
    k.querySelector('output').innerHTML = GM.adimDeger(ondalik(v, 2), d.birim);
    k.querySelector('[data-adim-yon="-1"]').disabled = v <= +d.min;
    k.querySelector('[data-adim-yon="1"]').disabled = v >= +d.max;
    const por = k.closest('.gm-porsiyon'); if (por) porsiyonHesap(por);
    degisim(k, k.dataset.ad, v);
    if (yon) GM.titres(4);
  };

  // Porsiyon
  const porsiyonHesap = k => {
    const b = k.querySelector('[data-birim][aria-pressed=true]'), miktar = +k.querySelector('[data-adimlayici] input').value, gram = +b.dataset.gram * miktar, kcal = (+k.dataset.kcal100) * gram / 100;
    k.querySelector('[data-p-gram]').textContent = sayi(gram);
    k.querySelector('[data-p-kcal]').textContent = sayi(kcal);
    degisim(k, k.dataset.ad, {birim: b.dataset.birim, miktar, gram, kcal});
  };

  // Su
  // Yeni bardak eklenirken mevcutlar yerinde kalır: dolum geçişi yalnız değişen bardakta oynar.
  const suEkle = (k, ml, bardak = false) => {
    const hedef = +k.dataset.hedef, once = +k.dataset.deger, yeni = Math.max(0, once + ml), kap = k.querySelector('.gm-su-bardaklar'), n = GM.suBardakSayi(yeni, hedef), sira = GM.suSiradaki(yeni);
    if (yeni === once) return;
    k.dataset.deger = yeni;
    while (kap.children.length > n) kap.lastElementChild.remove();
    while (kap.children.length < n) kap.insertAdjacentHTML('beforeend', GM.suBardakCiz(once, kap.children.length));
    [...kap.children].forEach((b, i) => {
      const oran = GM.suBardakDurum(yeni, i), dolu = oran >= 1;
      b.style.setProperty('--oran', oran.toFixed(3)); b.classList.toggle('is-siradaki', i === sira);
      b.removeAttribute(dolu ? 'data-su-ekle' : 'data-su-cikar'); b.setAttribute(dolu ? 'data-su-cikar' : 'data-su-ekle', GM.SU_BARDAK);
      b.setAttribute('aria-label', `1 su bardağı ${dolu ? 'geri al' : 'ekle'}`);
    });
    GM.say(k.querySelector('[data-su-deger]'), yeni, {bas: once, sure: M.counter});
    const kalan = k.querySelector('[data-su-kalan]');
    if (kalan) kalan.textContent = GM.suKalan(yeni, hedef);
    GM.titres(6);
    degisim(k, k.dataset.ad || 'su', yeni, {eklenen: yeni - once, bardak});
  };

  // ---------- İşaretçi tabanlı etkileşimler ----------
  let bastirTik = false;
  const uzunBaski = {el: null, t: 0};
  const uzunBitir = () => { const b = uzunBaski; if (b.el) b.el.classList.remove('is-basili'); clearTimeout(b.t); b.el = null; };
  const genelUzun = {t: 0, x: 0, y: 0};

  belge.addEventListener('pointerdown', ev => {
    const t = ev.target;
    const ub = t.closest?.('[data-uzunbas]');
    if (ub && !ub.disabled) {
      ev.button === 0 && (uzunBaski.el = ub, ub.classList.add('is-basili'), uzunBaski.t = setTimeout(() => {
        ub.classList.remove('is-basili'); ub.classList.add('is-tamam'); uzunBaski.el = null; bastirTik = true; GM.titres(30);
        setTimeout(() => { bastirTik = false; ub.classList.remove('is-tamam'); }, M.reveal);
        yay(ub, 'gm-onay', {ad: ub.dataset.ad});
      }, +ub.dataset.sure || M.uzunBas));
    }
    const gu = t.closest?.('[data-uzun]');
    if (gu) {
      genelUzun.x = ev.clientX; genelUzun.y = ev.clientY; clearTimeout(genelUzun.t);
      genelUzun.t = setTimeout(() => { bastirTik = true; GM.titres(12); setTimeout(() => { bastirTik = false; }, M.reveal); yay(gu, 'gm-uzun', {ad: gu.dataset.uzun}); }, M.reveal);
    }
    const sl = t.closest?.('.gm-slider-cetvel');
    if (sl) sliderBasla(ev, sl.closest('.gm-slider'));
    const sw = t.closest?.('.gm-swipe-on');
    if (sw) swipeBasla(ev, sw);
    const kd = t.closest?.('.gm-kadran-alan');
    if (kd) GM._kadranBasla?.(ev, kd.closest('.gm-kadran'));
    const gr = t.closest?.('.gm-grafik.is-etkin .gm-grafik-alan');
    if (gr) GM._grafikBasla?.(ev, gr.closest('.gm-grafik'));
  });
  belge.addEventListener('pointermove', ev => {
    if (genelUzun.t && Math.hypot(ev.clientX - genelUzun.x, ev.clientY - genelUzun.y) > TK.space[8]) { clearTimeout(genelUzun.t); genelUzun.t = 0; }
  }, {passive: true});
  ['pointerup', 'pointercancel'].forEach(n => belge.addEventListener(n, () => { uzunBitir(); clearTimeout(genelUzun.t); genelUzun.t = 0; }));
  belge.addEventListener('contextmenu', ev => { if (ev.target.closest?.('[data-uzunbas],[data-uzun]')) ev.preventDefault(); });

  // Orta düğme (Dada Route) uzun bas: hızlı rota işlemleri sheet'i
  belge.addEventListener('gm-uzun', ev => {
    if (ev.detail?.ad !== 'fab') return;
    GM.sheet({baslik: 'Dada Route', html: GM.parcali([
      {ikon: 'rota', baslik: 'Yeni rota planla', alt: 'Çıkış ve varış noktasını seç', git: '#/rota/planla'},
      {ikon: 'navigasyon', baslik: 'Kayıtlı rotama devam et', alt: 'Son rotan ve web’den gönderdiklerin', git: '#/rota/rotalarim'},
      {ikon: 'pin', baslik: 'Yakınımdaki duraklar', alt: 'Konumuna göre gurme duraklar', git: '#/harita'},
      {ikon: 'cevrimdisi', baslik: 'Çevrimdışı rotalar', alt: 'İndirdiğin rotalar ve haritalar', git: '#/rota/cevrimdisi'}
    ])});
  });

  // Biyometrik slider: cetvel sürüklenir, iğne sabit, değer büyük
  const sliderCiz = (k, v, anlik) => {
    const min = +k.dataset.min, adim = +k.dataset.adim, b = adim % 1 ? 1 : 0, s = k.querySelector('.gm-slider-serit');
    s.style.transition = anlik ? 'none' : '';
    s.style.transform = `translateX(${-((v - min) / adim) * TK.size.sliderStep}px)`;
    k.querySelector('.gm-slider-sayi').textContent = ondalik(v, b);
    k.querySelector('.gm-slider-cetvel').setAttribute('aria-valuenow', v);
    k.querySelector('.gm-slider-cetvel').setAttribute('aria-valuetext', `${ondalik(v, b)} ${k.dataset.birim || ''}`);
  };
  GM._sliderCiz = sliderCiz;
  const sliderYaz = (k, v, anlik) => {
    const min = +k.dataset.min, max = +k.dataset.max, adim = +k.dataset.adim;
    v = kisit(Math.round((v - min) / adim) * adim + min, min, max);
    v = +v.toFixed(3);
    if (v !== +k.dataset.deger) { k.dataset.deger = v; GM.titres(2); degisim(k, k.dataset.ad, v); }
    sliderCiz(k, v, anlik);
  };
  const sliderBasla = (ev, k) => {
    const x0 = ev.clientX, v0 = +k.dataset.deger, adim = +k.dataset.adim, c = k.querySelector('.gm-slider-cetvel');
    let sonX = x0, sonT = ev.timeStamp, hiz = 0, gercek = v0;
    c.setPointerCapture(ev.pointerId);
    k.classList.add('is-surukleniyor');
    const hareket = e => {
      gercek = v0 - ((e.clientX - x0) / TK.size.sliderStep) * adim;
      hiz = (e.clientX - sonX) / Math.max(1, e.timeStamp - sonT); sonX = e.clientX; sonT = e.timeStamp;
      sliderYaz(k, gercek, true);
    };
    const son = () => {
      c.removeEventListener('pointermove', hareket); c.removeEventListener('pointerup', son); c.removeEventListener('pointercancel', son);
      k.classList.remove('is-surukleniyor');
      if (Math.abs(hiz) > .3) sliderYaz(k, gercek - (hiz * M.page / TK.size.sliderStep) * adim, false);
      else sliderCiz(k, +k.dataset.deger, false);
    };
    c.addEventListener('pointermove', hareket); c.addEventListener('pointerup', son); c.addEventListener('pointercancel', son);
  };
  belge.addEventListener('keydown', ev => {
    const c = ev.target.closest?.('.gm-slider-cetvel');
    if (c) {
      const k = c.closest('.gm-slider'), a = +k.dataset.adim, d = {ArrowLeft: -a, ArrowDown: -a, ArrowRight: a, ArrowUp: a, PageDown: -a * 10, PageUp: a * 10}[ev.key];
      if (d) { ev.preventDefault(); sliderYaz(k, +k.dataset.deger + d, false); }
    }
    const kd = ev.target.closest?.('.gm-kadran-alan');
    if (kd) GM._kadranTus?.(ev, kd.closest('.gm-kadran'));
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches?.('[data-git][role=button],[data-git]:not(a,button)')) { ev.preventDefault(); ev.target.click(); }
  });

  // Swipe satır
  const swipeKapat = k => { k.querySelector('.gm-swipe-on').style.transform = ''; k.classList.remove('is-acik'); };
  const swipeBasla = (ev, on) => {
    const k = on.closest('.gm-swipe'), w = k.querySelector('.gm-swipe-eylemler').offsetWidth, ilk = k.classList.contains('is-acik') ? -w : 0;
    belge.querySelectorAll('.gm-swipe.is-acik').forEach(d => { if (d !== k) swipeKapat(d); });
    const x0 = ev.clientX, y0 = ev.clientY; let d = 0, yatay = null;
    const hareket = e => {
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (yatay === null) { if (Math.hypot(dx, dy) < TK.space[8]) return; yatay = Math.abs(dx) > Math.abs(dy); if (yatay) { on.setPointerCapture(e.pointerId); k.classList.add('is-surukleniyor'); } else { son(); return; } }
      d = kisit(ilk + dx, -w - TK.space[16], 0);
      on.style.transform = `translateX(${d}px)`;
    };
    const son = () => {
      on.removeEventListener('pointermove', hareket); on.removeEventListener('pointerup', son); on.removeEventListener('pointercancel', son);
      k.classList.remove('is-surukleniyor');
      if (yatay) {
        bastirTik = true; setTimeout(() => { bastirTik = false; }, M.fast);
        if (d < -w * .4) { k.classList.add('is-acik'); on.style.transform = `translateX(${-w}px)`; } else swipeKapat(k);
      }
    };
    on.addEventListener('pointermove', hareket); on.addEventListener('pointerup', son); on.addEventListener('pointercancel', son);
  };
  belge.addEventListener('focusin', ev => { const k = ev.target.closest?.('.gm-swipe-eylem'); if (k) { const s = k.closest('.gm-swipe'); s.classList.add('is-acik'); s.querySelector('.gm-swipe-on').style.transform = `translateX(${-s.querySelector('.gm-swipe-eylemler').offsetWidth}px)`; } });

  // Arama + otomatik tamamlama. GM.aramaKur(kok, {kaynak:q=>[...], son:[...], sec:oge=>{}, en:8})
  const katla = s => String(s).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
  GM.katla = katla;
  GM.vurguluEsles = (metin, q) => {
    const m = String(metin), a = katla(m), b = katla(q.trim());
    const i = b ? a.indexOf(b) : -1;
    if (i < 0 || a.length !== m.length) return esc(m);
    return `${esc(m.slice(0, i))}<mark>${esc(m.slice(i, i + b.length))}</mark>${esc(m.slice(i + b.length))}`;
  };
  GM.aramaKur = (kok, o = {}) => {
    const girdi = kok.querySelector('input'), liste = kok.querySelector('.gm-arama-sonuc') || kok.parentElement.querySelector('.gm-arama-sonuc');
    let sonlar = o.son || []; let z = 0;
    const satirlar = (l, q) => `<div class="gm-satirlar">${l.map((x, i) => (x._son ? GM.satirKap({ikon: 'gecmis', baslik: x.baslik, veri: {'arama-i': i}, ok: false}, GM.ikonBtn({ikon: 'kapat', etiket: 'Sil', veri: {'son-sil': i}})) : GM.satir({...x, baslikHtml: q ? GM.vurguluEsles(x.baslik, q) : esc(x.baslik), veri: {'arama-i': i}, ok: false}))).join('')}</div>`;
    let guncel = [];
    const ciz_ = () => {
      const q = girdi.value.trim();
      if (!q) {
        guncel = sonlar.map(s => (typeof s === 'string' ? {baslik: s, _son: true} : s));
        liste.innerHTML = guncel.length ? `<div class="gm-ara"><span class="gm-t-label gm-ton-ikincil">Son aramalar</span>${GM.btn({metin: 'Temizle', tur: 'text', boyut: 'sm', veri: {'son-temizle': 1}})}</div>${satirlar(guncel, '')}` : '';
      } else {
        guncel = (o.kaynak ? o.kaynak(q) : []).slice(0, o.en || 8);
        liste.innerHTML = guncel.length ? satirlar(guncel, q) : GM.bos({ikon: 'ara_', baslik: 'Sonuç yok', metin: o.bosMetin || `**${q}** için bir şey bulamadık. Daha kısa yazmayı dene.`});
      }
      yay(kok, 'gm-arama', {q, sonuc: guncel});
    };
    const h = () => { clearTimeout(z); z = setTimeout(ciz_, M.press); };
    girdi.addEventListener('input', h);
    liste.addEventListener('click', ev => {
      if (ev.target.closest('[data-son-temizle]')) { sonlar = []; ciz_(); o.sonTemizle?.(); return; }
      const sil = ev.target.closest('[data-son-sil]'); if (sil) { sonlar = sonlar.filter((_, i) => i !== +sil.dataset.sonSil); ciz_(); return; }
      const s = ev.target.closest('[data-arama-i]'); if (!s) return;
      const x = guncel[+s.dataset.aramaI];
      if (x._son) { girdi.value = x.baslik; girdi.closest('.gm-girdi')?.classList.add('has-text'); ciz_(); return; }
      o.sec?.(x);
    });
    ciz_();
    return {yenile: ciz_};
  };
})();
