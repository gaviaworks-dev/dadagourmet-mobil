/* Sağ çekmece menü: Gastro ortak-menu.js (V4) + mobil 1.0.1 dg_drawer.dart / app_drawer.dart (10 Kasım Gastro geçişinde yeniden kıyaslandı). %86 / en çok 360, hesap kartı, kayan kısayollar, başlıksız gezinme blokları, tek açık akordeon, dil, sosyal ve yasal ayak. API: GM.menu.ac(), GM.menu.kapat(). */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik;
  // Gezinme Gastro mobil 1.0.1 çekmecesinin kalıbıdır (app_drawer.dart): hesap kartı + 4 kısayol, başlıksız iki blok, ayak. İçerik Gourmet web çekmecesi.
  // Gourmet çekmecesi (web mobil çekmecesi: 5 menü kalemi + Görüş Bildir; üye bloğu Hesabım; WEB-ENVANTERI §1.1, §4.5).
  const hesapGrubu = {id: 'hesap', label: 'Hesabım', icon: 'user', children: [
    {id: 'rez', label: 'Rezervasyonlarım', icon: 'calendar-check', git: '#/profil/rezervasyonlar'},
    {id: 'fav', label: 'Gurme Favorilerim', icon: 'heart', git: '#/profil/favoriler'},
    {id: 'ziy', label: 'Ziyaret Geçmişim', icon: 'circle-check', git: '#/profil/ziyaretler'},
    {id: 'deg', label: 'Değerlendirmelerim', icon: 'star', git: '#/profil/degerlendirmeler'},
    {id: 'kat', label: 'Topluluk Katkılarım', icon: 'users', git: '#/profil/katkilar'},
    {id: 'puan', label: 'Puan Durumu ve Rozetler', icon: 'medal', git: '#/profil/puan'},
    {id: 'liste', label: 'Listelerim', icon: 'list', git: '#/profil/listeler'},
    {id: 'rotalarim', label: 'Rotalarım', icon: 'route', git: '#/rota/rotalarim'},
    {id: 'bildirim', label: 'Bildirimler', icon: 'bell', git: '#/bildirimler'},
    {id: 'paket', label: 'Paketlerim', icon: 'box-open', git: '#/paketlerim'},
    {id: 'odeme', label: 'Ödemelerim', icon: 'credit-card', git: '#/odemelerim'},
    {id: 'isletmelerim', label: 'İşletmelerim', icon: 'store', git: '#/isletme'},
    {id: 'etk', label: 'Etkinliklerim', icon: 'calendar-days', git: '#/profil/etkinlikler'},
    {id: 'terc', label: 'Keşif Tercihlerim', icon: 'sliders', git: '#/profil/tercihler'},
    {id: 'ayar', label: 'Hesap Ayarları', icon: 'gear', git: '#/ayarlar'},
    {id: 'cozum', label: 'Çözüm Merkezi', icon: 'headset', git: '#/cozum-merkezi'},
    {id: 'cikis', label: 'Çıkış', icon: 'right-from-bracket', eylem: 'cikis'}]};
  // Görev 14/13 (Beyar): gruplama Dada Diet çekmecesiyle aynı kalıp — Ana Sayfa + konu grupları (tek açık akordeon), ikinci blok Hesabım · Pro · Görüş Bildir.
  // Gruplar web ana menüsünün modülleri: Mekânlar · Dada Route · Lezzet ve Etkinlik. Mekân Öner ve İşletmeni Ekle satır değil, öne çıkan eylem kartları (14/14, eylemler()).
  const BLOKLAR = () => [[
    {id: 'kesfet', label: 'Ana Sayfa', icon: 'house', git: '#/kesfet'},
    {id: 'mekan-grup', label: 'Mekânlar', icon: 'utensils', children: [
      {id: 'mekanlar', label: 'Tüm Mekânlar', icon: 'utensils', git: '#/mekanlar'},
      {id: 'bul', label: 'Mekân Bul', icon: 'wand-magic-sparkles', git: '#/mekan-bul'},
      {id: 'rehber', label: 'Şehir Rehberleri', icon: 'city', git: '#/rehberler'}]},
    {id: 'rota-grup', label: 'Dada Route', icon: 'route', children: [
      {id: 'rota', label: 'Rota Planla', icon: 'route', git: '#/rota'},
      {id: 'rotalarim', label: 'Rotalarım', icon: 'bookmark', git: '#/rota/rotalarim'},
      {id: 'hazir', label: 'Hazır Rotalar', icon: 'map', git: '#/rota/hazir'},
      {id: 'cevrimdisi', label: 'Çevrimdışı Rotalar', icon: 'cloud-arrow-down', git: '#/rota/cevrimdisi'},
      {id: 'gunluk', label: 'Seyahat Günlüğü', icon: 'book-open', git: '#/rota/gunluk'}]},
    {id: 'icerik-grup', label: 'Lezzet ve Etkinlik', icon: 'bowl-food', children: [
      {id: 'lezzet', label: 'Gurme Lezzetler', icon: 'bowl-food', git: '#/lezzetler'},
      {id: 'etkinlik', label: 'Etkinlikler', icon: 'calendar-days', git: '#/etkinlikler'},
      {id: 'etkinlik-oner', label: 'Etkinlik Öner', icon: 'calendar-plus', git: '#/etkinlik-oner'}]}
  ], [
    ...(GM.uye() ? [hesapGrubu] : []),
    {id: 'pro', label: 'Dada Gourmet Pro', icon: 'bolt', git: '#/pro'},
    {id: 'gorus', label: 'Görüş Bildir', icon: 'comment-dots', git: '#/gorus-bildir'}
  ]];
  // 14/14 (Beyar 16 Kas düzeltmesi): Mekân Öner ve İşletmeni Ekle menünün geri kalanıyla AYNI blok + satır yapısında, hafifçe öne çıkan:
  // açık mor blok zemini, mor ikon kutusu, adın altında kısa açıklama, sağda ok. (Önceki kesikli kartlar menüden kopuk duruyordu.)
  const eylemler = () => `<div class="gm-menu-blok gm-menu-eylem">${[['#/mekan-oner', 'circle-plus', 'Mekân Öner', '+50 Dada Puan kazan'], ['#/isletme', 'store', 'İşletmeni Ekle', 'Ücretsiz başvuru']].map(([g, i, b, a]) => `<div class="gm-menu-item"><a class="gm-menu-row" href="${esc(g)}" data-menu-git="${esc(g)}"><span class="gm-menu-ic">${ik(i)}</span><span class="gm-menu-label">${esc(b)}<small>${esc(a)}</small></span><span class="gm-menu-chev">${ik('chevron-right')}</span></a></div>`).join('')}</div>`;
  const kisayollar = () => [['#/rota/rotalarim', 'route', 'Rotalarım'], ['#/profil/rezervasyonlar', 'calendar-check', 'Rezervasyonlarım'], ['#/profil/favoriler', 'heart', 'Favorilerim'], ['#/profil/puan', 'medal', 'Dada Puan']];
  // Dil: Ayarlar > Dil ile aynı iki dil ve aynı kayıt (hesap-ayar.dil.dil). Tasarım öğesi: uygulama TR çalışır, diller Flutter aşamasında gelir.
  const DILLER = [['tr', 'Türkçe'], ['en', 'English']];
  const dilKod = () => GM.durum.oku('hesap-ayar', {})?.dil?.dil || 'tr';
  const dilAd = () => (DILLER.find(([k]) => k === dilKod()) || DILLER[0])[1];
  // Sosyal (karar 5, 11 Kasım): Diet web'de adresli sosyal hesap yok (web footer + Laravel adressiz ikonu basmıyor) → menüde sosyal satırı yok. Adres gelince web'in platformları: Instagram, YouTube, Pinterest.
  // Yasal ayak (Paket 1, 1b): web footer kurumsal sırası (_src/kabuk/menu.mjs footerKurumsal: Hakkımızda · Editoryal ve Bilimsel Kurul · Künye · İletişim), sonra SSS ve Yasal Metinler. Hepsi gerçek rota.
  const YASAL = [['#/kurumsal/hakkimizda', 'Hakkımızda'], ['#/kurumsal/kunye', 'Künye'], ['#/iletisim', 'İletişim'], ['#/sss', 'SSS'], ['#/yasal', 'Yasal Metinler']];
  const aktif = () => (GM.aktif()?.hash || location.hash).split('?')[0];
  const satir = (x, alt) => { const on = x.git === aktif(); return `<a class="gm-menu-row${alt ? ' gm-menu-subrow' : ''}${on ? ' is-active' : ''}" href="${esc(x.git || '')}" data-menu-git="${esc(x.git || '')}"${x.yakinda ? ' data-menu-yakinda' : ''}${x.eylem ? ` data-menu-eylem="${esc(x.eylem)}"` : ''}${on ? ' aria-current="page"' : ''}><span class="gm-menu-ic">${ik(x.icon)}</span><span class="gm-menu-label">${esc(x.label)}</span></a>`; };
  const grup = x => { const acik = x.children.some(c => c.git === aktif()); return `<div class="gm-menu-item gm-menu-group${acik ? ' is-open' : ''}"><button class="gm-menu-row gm-menu-toggle" type="button" aria-expanded="${acik}"><span class="gm-menu-ic">${ik(x.icon)}</span><span class="gm-menu-label">${esc(x.label)}</span><span class="gm-menu-chev">${ik('chevron-down')}</span></button><div class="gm-menu-sub"${acik ? '' : ' inert'}><div class="gm-menu-sub-in">${x.children.map(c => satir(c, true)).join('')}</div></div></div>`; };
  const kullanici = () => { if (!GM.uye()) return `<p class="gm-menu-hello"><b>Merhaba</b><span>Favorilerini, rotalarını ve Dada Puan’ını korumak için giriş yap.</span></p><div class="gm-menu-auth">${GM.btn({metin: 'Giriş Yap', boyut: 'sm', attrs: 'data-menu-git="#/giris"'})}${GM.btn({metin: 'Üye Ol', tur: 'secondary', boyut: 'sm', attrs: 'data-menu-eylem="uye" data-menu-git=""'})}</div>`; const k = {...(window.GMX?.hesap?.kullanici || window.GMV?.kullanici || {}), ...(GM.durum.oku('hesap-ayar', {})?.profil || {})}; return `<a class="gm-menu-profile" href="#/profil" data-menu-git="#/profil"><span class="gm-menu-avatar" aria-hidden="true">${esc(String(k.ad || 'D').slice(0, 1))}</span><span class="gm-menu-who"><b>${esc([k.ad, k.soyad].filter(Boolean).join(' ') || 'Profilim')}</b><small>${ik('puanDada')} Dada Puan ve rozetler</small></span><span class="gm-menu-go">Profilim ${ik('chevron-right')}</span></a><div class="gm-menu-shortcuts">${kisayollar().map(([g, i, t, n]) => `<a class="gm-menu-short" href="${g}" data-menu-git="${g}">${ik(i)}<span>${esc(t)}</span>${n ? `<b class="gm-menu-sayac">${n}</b>` : ''}</a>`).join('')}</div>`; };
  const ayak = () => `<footer class="gm-menu-foot"><div class="gm-menu-item gm-menu-group gm-menu-lang"><button class="gm-menu-row gm-menu-toggle" type="button" aria-expanded="false"><span class="gm-menu-ic">${ik('globe')}</span><span class="gm-menu-label">Dil: <b>${esc(dilAd())}</b></span><span class="gm-menu-chev">${ik('chevron-down')}</span></button><div class="gm-menu-sub" inert><div class="gm-menu-sub-in" role="radiogroup" aria-label="Dil">${DILLER.map(([k, d]) => { const on = k === dilKod(); return `<button class="gm-menu-row gm-menu-subrow gm-menu-lang-opt" type="button" role="radio" aria-checked="${on}" data-menu-dil="${k}"><span class="gm-menu-ic">${on ? ik('onay') : ''}</span><span class="gm-menu-label">${esc(d)}</span></button>`; }).join('')}</div></div></div><div class="gm-menu-meta"><div class="gm-menu-legal">${YASAL.map(([g, t]) => `<a href="${g}" data-menu-git="${g}"${g === aktif() ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</div></div></footer>`;
  // Dada ailesi hesabı: tek hesapla giriş; Gourmet'ten yalnız profil ve favori mekânlar eşitlenir (Gourmet'te sağlık verisi yoktur).
  const bagliSheet = () => { const d = GM.durum.oku('bagli-uygulamalar', {}); return GM.sheet({
    baslik: 'Bağlı Uygulamalar',
    html: `<div class="gm-yigin">${GM.p('**Profilin ve favori mekânların** bağladığın Dada uygulamalarıyla eşitlenir; rezervasyon ve ödeme bilgilerin **paylaşılmaz**.')}${GM.toggle({ad: 'bagli-gastro', ikon: 'utensils', etiket: 'Dada Gastro', secili: !!d.gastro})}${GM.toggle({ad: 'bagli-fit', ikon: 'dumbbell', etiket: 'Dada Fit', secili: !!d.fit})}</div>`,
    sonra: h => { [['bagli-gastro', 'gastro', 'Dada Gastro'], ['bagli-fit', 'fit', 'Dada Fit']].forEach(([ad, k, m]) => GM.on(h, ad, v => { GM.durum.yaz('bagli-uygulamalar', {...GM.durum.oku('bagli-uygulamalar', {}), [k]: v}); GM.toast(`**${m}** ${v ? 'bağlandı' : 'bağlantısı kapatıldı'}`, {ikon: 'arrows-rotate'}); })); }
  }); };
  let acikEl = null;
  const kapat = () => { if (!acikEl) return; const k = acikEl; acikEl = null; k.querySelector('.gm-menu').classList.remove('is-in'); k.querySelector('.gm-perde').classList.add('is-cikis'); setTimeout(() => k.remove(), GM.azHareket() ? 0 : GM.TK.motion.drawer); };
  const ac = () => {
    if (acikEl) return;
    const kat = document.getElementById('gm-katman') || document.body, k = document.createElement('div');
    k.className = 'gm-menu-kap';
    k.innerHTML = `<div class="gm-perde" data-menu-kapat></div><div class="gm-menu" role="dialog" aria-modal="true" aria-label="Menü" tabindex="-1"><div class="gm-menu-panel"><div class="gm-menu-head"><a class="gm-menu-logo" href="#/kesfet" data-menu-git="#/kesfet" aria-label="Dada Gourmet ana sayfa"><img src="assets/marka/dadagourmet-renkli.svg" alt="Dada Gourmet"></a><button class="gm-menu-close" type="button" data-menu-kapat aria-label="Kapat">${ik('kapat')}</button></div><div class="gm-menu-scroll"><div class="gm-menu-user">${kullanici()}</div><nav class="gm-menu-nav" aria-label="Menü">${BLOKLAR().map(b => `<div class="gm-menu-blok">${b.map(x => (x.children ? grup(x) : `<div class="gm-menu-item">${satir(x)}</div>`)).join('')}</div>`).join('')}${eylemler()}</nav>${ayak()}</div></div></div>`;
    kat.append(k); acikEl = k;
    requestAnimationFrame(() => k.querySelector('.gm-menu').classList.add('is-in'));
    k.querySelector('.gm-menu').focus({preventScroll: true});
    k.addEventListener('keydown', e => { if (e.key === 'Escape') kapat(); });
    k.addEventListener('click', e => {
      if (e.target.closest('[data-menu-kapat]')) { kapat(); return; }
      const t = e.target.closest('.gm-menu-toggle');
      if (t) { const g = t.closest('.gm-menu-group'), on = !g.classList.contains('is-open'); g.closest('.gm-menu-nav,.gm-menu-foot').querySelectorAll('.gm-menu-group').forEach(x => { const a = x === g && on; x.classList.toggle('is-open', a); x.querySelector('.gm-menu-toggle').setAttribute('aria-expanded', a); x.querySelector('.gm-menu-sub').inert = !a; }); if (on && g.classList.contains('gm-menu-lang')) setTimeout(() => g.scrollIntoView({block: 'end', behavior: GM.azHareket() ? 'auto' : 'smooth'}), GM.TK.motion.base); return; }
      const dl = e.target.closest('[data-menu-dil]'); if (dl) { e.preventDefault(); kapat(); const h = GM.durum.oku('hesap-ayar', {}) || {}; GM.durum.yaz('hesap-ayar', {...h, dil: {...(h.dil || {}), dil: dl.dataset.menuDil}}); GM.toast(`Dil: **${dl.textContent.trim()}**`, {tur: 'basari'}); return; }
      if (e.target.closest('[data-menu-yakinda]')) { e.preventDefault(); kapat(); GM.toast('Yakında', {ikon: 'bilgi'}); return; }
      const a = e.target.closest('[data-menu-git]');
      if (a) { e.preventDefault(); e.stopPropagation(); kapat(); if (a.dataset.menuEylem === 'cikis') GM.dialog({baslik: 'Çıkış yapılsın mı?', metin: 'Bu cihazdaki **kayıtların ve tercihlerin** silinir.', eylem: 'Çıkış yap', iptal: 'Vazgeç', yikici: true}).then(ok => { if (ok) GM.cikis(); }); else if (a.dataset.menuEylem === 'bagli') bagliSheet(); else if (a.dataset.menuEylem === 'uye') GM.uyeDuvar(); else if (a.dataset.menuGit) GM.git(a.dataset.menuGit); }
    });
  };
  GM.menu = {ac, kapat};
})();
