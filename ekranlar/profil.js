/* Profilim (#/profil) ve Gurme Panelim ekranları: web Hesabım (6 sekmeli Gurme Panelim + Listelerim, Etkinliklerim, Keşif Tercihlerim) eşi,
 *   Diet mobil profil.js kalıbında (GM.profilBas + "Profili düzenle" + GM.gruplar: başlıklı kartsız satır grupları, Çıkış ayrı Oturum grubunda).
 * Ekranlar (ad · rota): profil #/profil (alt menü sekmesi) · profil-duzenle #/profil/duzenle · rezervasyonlar #/profil/rezervasyonlar · rezervasyon #/profil/rezervasyon/:id
 *   · favoriler #/profil/favoriler · ziyaretler #/profil/ziyaretler · degerlendirmeler #/profil/degerlendirmeler · katkilar #/profil/katkilar · puan #/profil/puan
 *   · listelerim #/profil/listeler · liste #/profil/liste/:id · etkinliklerim #/profil/etkinlikler · tercihler #/profil/tercihler.
 * Veri: GMX.hesap (ekranlar/profil-veri.js) tohum kayıtları + kullanıcının uygulamada yaptıkları (GM.durum). Yeni hesapta (GM.yeniHesap()) tohum okunmaz.
 *   Ortak anahtarlar (başka ekranlar yazar): 'rezervasyonlar' (mekân detay rezervasyon akışı), 'mekan-favori' (tek favori anahtarı, GM.mekanKayit; kayıtlı hesapta GMX.hesapTohumla bir kez doldurur),
 *   'mekan-ziyaret', 'mekan-degerlendirme', 'mekan-liste', 'listeler' (GM.mekanKayit, GM.listeyeEkle), 'lezzet-kayit' (lezzet.js), 'etkinlik-katilim' ve 'etkinlik-kayit' (etkinlik.js),
 *   'rota-favori', 'rota-kayitli' (Dada Route), 'katkilar' (mekân öner), 'katki-etkinlik' (etkinlik öner), 'kesif-tercih' (onboarding ve Tercihlerim), 'hesap-ayar'.profil.
 *   Bu dosyanın anahtarları: 'rez-iptal' (iptal edilen rezervasyon id), 'degerlendirme-kaldirilan',
 *   'liste-degisim' {id: {ad, gorunurluk, kalem}}, 'liste-silinen'.
 * Dada Puan hareketleri kayıtlardan türer (tek kaynak): gerçekleşen rezervasyon +25 (mekân başına bir kez), değerlendirme puanlama +2 ve fotoğraflı +15
 *   (yayında kesin, incelemede bekleyen), mekân önerisi +50 (yayında kesin, incelemede bekleyen, reddedilince düşer); etkinlik önerisi ve Ziyaret Ettim puan kazandırmaz.
 * Hâller: ortak ?hal=yukleniyor|bos|hata|cevrimdisi|giris router'dan; sekme ?sekme=<ad> (rezervasyonlar: onaylanan|bekleyen|gecmis; favoriler: mekan|lezzet|etkinlik|rota;
 *   degerlendirmeler: tumu|yayinda|inceleniyor; katkilar: inceleniyor|yayinda|reddedildi; listelerim: listeler|paylasilan|taslak; etkinliklerim: katilacagim|katildigim|ilgilendigim|biletler);
 *   puan ?sayfa=<n>. Uzun listeler (favoriler, ziyaretler) sonsuz kaydırır (sayfa 10), puan hareketleri sayfalıdır. Misafirde Profilim kendi kapısını çizer; diğerleri GM.UYE_KILIT. */
(() => {
  const H = () => window.GMX?.hesap || {};
  const yeni = () => GM.yeniHesap();
  const bugun = () => GM.bugunIso();
  const oku = (k, d) => GM.durum.oku(k, d) ?? d;
  const tohum = (k, t) => oku(k, yeni() ? [] : (t() || []));
  const uniq = l => [...new Set(l)];
  const tum = () => oku('hesap-ayar', {});
  const ayarYaz = (b, ek) => GM.durum.yaz('hesap-ayar', {...tum(), [b]: {...(tum()[b] || {}), ...ek}});
  const kisi = () => ({...H().kullanici, ...(yeni() ? {ad: '', soyad: '', kullaniciAdi: '', telefon: '', sehir: '', hakkimda: ''} : {}), ...(tum().profil || {})});
  const adSoyad = p => `${p.ad || ''} ${p.soyad || ''}`.trim();
  const nk = s => String(s ?? '').replace(/(\d{1,2}):(\d{2})/g, '$1.$2');
  const GUN = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const gunNo = iso => new Date(`${iso}T12:00:00`).getDay();
  const tarihK = iso => (iso.slice(0, 4) === bugun().slice(0, 4) ? GM.tarihKisa(iso) : `${GM.tarihKisa(iso)} ${iso.slice(0, 4)}`);
  const gunFark = iso => Math.round((new Date(`${iso}T12:00:00`) - new Date(`${bugun()}T12:00:00`)) / 864e5);
  const tarihGun = iso => (window.GMTakvim?.uzun ? GMTakvim.uzun(iso) : GM.tarihUzun(iso));
  const talepNo = id => { let h = 7; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) % 1e6; return `RZ-${String(h).padStart(6, '0')}`; };
  const goreli = iso => { const g = gunFark(iso); return g === 0 ? 'Bugün' : g === 1 ? 'Yarın' : g === -1 ? 'Dün' : `${GM.tarihKisa(iso)} ${GUN[gunNo(iso)]}`; };
  const M = slug => GM.mekan(slug);
  const E = slug => (window.GMV?.etkinlikler || []).find(e => e.slug === slug) || null;
  const L = slug => (window.GMV?.lezzetler || []).find(l => l.slug === slug) || null;
  const yer = m => [m.ilce || m.semt, m.il].filter((x, i, l) => x && l.indexOf(x) === i).join(', ');
  const KAPAK = 'assets/gorsel/hero/sokak-panorama.webp';
  const bekle = () => new Promise(t => setTimeout(t, GM.azHareket() ? 0 : GM.TK.motion.reveal));
  const anlik = l => Object.fromEntries(l.map(k => [k, GM.durum.oku(k, null)]));
  const geriYukle = s => { Object.entries(s).forEach(([k, v]) => (v == null ? GM.durum.sil(k) : GM.durum.yaz(k, v))); GM.tazele(); };
  const geriToast = (s, metin, ikon = 'sil') => GM.toast(metin, {ikon, eylem: 'Geri al', yerine: true, onEylem: () => geriYukle(s)});
  const sekmeAl = (ctx, l, vars) => { const s = ctx.sekme || ctx.sorgu.sekme; return l.some(([k]) => k === s) ? s : vars; };
  // Sığan şerit sabit; sığmayan (o.kaydir) kayar ve sağda solar (.gm-tek-satir, yığılma kuralı 1).
  const segment = (ad, secili, l, o = {}) => GM.segment({ad, secili, kaydir: !!o.kaydir, sinif: o.kaydir ? 'gm-tek-satir' : '', etiket: 'Sekmeler', ogeler: l.map(([deger, a, sayi]) => ({ad: a, deger, sayi}))});
  // Kayan segmentte seçili sekme görünür alana gelsin (adresle doğrudan açılışta).
  const segOdak = kok => { const b = kok.querySelector('.gm-seg.is-kaydir [aria-selected=true]'), k = b?.parentElement; if (b && k) k.scrollLeft = b.offsetLeft - (k.clientWidth - b.offsetWidth) / 2; };
  const bosKucuk = o => GM.bos({ikon: o.ikon, baslik: o.baslik, metin: o.metin, eylem: o.eylem});
  const sayiEk = (n, tekil) => `${GM.sayi(n)} ${tekil}`;

  // ---------- Sonsuz kaydırma: kanon GM.sonsuzListe (ilk sayfa çizimde, sonrası sayfa sayfa; bitişte GM.listeSon, yükleme göstergesi kalkar) ----------
  const SAYFA = 10;
  const sayfali = (l, fn) => `<div data-sayfa>${GM.satirlar(l.slice(0, SAYFA).map(fn))}</div>`;
  const sonsuzBagla = (kok, l, fn, birim) => {
    const io = GM.sonsuzListe(kok.querySelector('[data-sayfa] > .gm-satirlar'), l, x => fn(x), {sayfa: SAYFA, birim});
    return () => io.disconnect();
  };

  // ---------- Rezervasyonlar (web Rezervasyonlarım; panel GurmePanelimServisi durumları) ----------
  const REZ_HAL = {talep: ['Onay bekleniyor', 'uyari', 'saat'], onaylandi: ['Onaylandı', 'basari', 'onay'], reddedildi: ['Onaylanmadı', 'hata', 'xmark'], iptal: ['İptal edildi', 'notr', 'ban'], gerceklesti: ['Gerçekleşti · +25', 'basari', 'circle-check'], gelmedi: ['Gelinmedi', 'notr', 'user-xmark']};
  const MASA = {farketmez: 'Fark etmez', bahce: 'Bahçe', teras: 'Teras', pencere_kenari: 'Pencere kenarı', sakin_kose: 'Sakin köşe', grup_masasi: 'Grup masası'};
  const OZEL = {standart: 'Standart', dogum_gunu: 'Doğum günü', yildonumu: 'Yıldönümü', is_yemegi: 'İş yemeği'};
  const BITTI = ['iptal', 'reddedildi', 'gerceklesti', 'gelmedi'];
  const rezler = () => {
    const iptal = oku('rez-iptal', []);
    const kul = oku('rezervasyonlar', []).map(r => ({...r, hal: r.hal || 'talep', durum: OZEL[r.durum] ? r.durum : 'standart'}));
    return [...kul, ...(yeni() ? [] : H().rezervasyonlar || [])].map(r => ({...r, hal: iptal.includes(r.id) ? 'iptal' : r.hal, m: M(r.slug)})).filter(r => r.m && r.tarih);
  };
  const rezSekme = r => (r.tarih < bugun() || BITTI.includes(r.hal) ? 'gecmis' : r.hal === 'onaylandi' ? 'onaylanan' : 'bekleyen');
  const rezRozet = r => { const [metin, ton, ikon] = REZ_HAL[r.hal] || REZ_HAL.talep; return GM.durumRozet({metin, ton, ikon}); };
  // Rozet yalnız durumlar karıştığında (Geçmiş sekmesi, profil kısayolu); Onaylanan ve Bekleyen sekmesinde segment durumu söyler (yığılma kuralı).
  const rezSatir = (r, rozet = true) => GM.satir({gorsel: r.m.kapak, baslik: r.m.ad, alt: `${goreli(r.tarih)} · ${nk(r.saat)} · ${r.kisi} kişi`, ek: rozet ? rezRozet(r) : '', git: `#/profil/rezervasyon/${r.id}`});
  // Saati geçen onaylı rezervasyon değerlendirmeye çağırır (web şartname akış 5); değerlendirilmişse çağrı yok.
  const degerlendirdi = slug => degerler().some(d => d.slug === slug);
  const cagrilar = () => rezler().filter(r => ['onaylandi', 'gerceklesti'].includes(r.hal) && r.tarih < bugun() && gunFark(r.tarih) >= -14 && !degerlendirdi(r.slug));
  const cagriBant = r => GM.bant({ton: 'bilgi', ikon: 'yildiz', baslik: `${r.m.ad} ziyaretin nasıldı?`, metin: `**${GM.tarihKisa(r.tarih)}** tarihli rezervasyonun geçti. Puanla; tabak fotoğrafı eklersen **+17 bekleyen puan**.`, eylem: {metin: 'Değerlendir', veri: {eylem: 'degerlendir', id: r.slug}}});
  const degerlendirBagla = kok => GM.eylem(kok, 'degerlendir', el => { const m = M(el.dataset.id); if (m) GM.degerlendirAkis(m, {degisti: () => GM.tazele()}); });

  // ---------- Favoriler (web Gurme Favorilerim) ----------
  const tohumla = () => window.GMX?.hesapTohumla?.();
  const favMekan = () => { tohumla(); return uniq(oku('mekan-favori', []).map(x => x.slug || x).reverse()).filter(M); };
  const favLezzet = () => tohum('lezzet-kayit', () => H().favoriler?.lezzet).filter(L);
  const favEtkinlik = () => uniq(tohum('etkinlik-kayit', () => uniq([...(H().etkinliklerim?.ilgilendigim || []), ...(H().favoriler?.etkinlik || [])]))).filter(E);
  const favRota = () => oku('rota-favori', ['izmir-cesme']).filter(id => GM.rotaBul(id));
  const etkinlikTarih = e => (e.bit && e.bit !== e.tarih ? `${GM.tarihKisa(e.tarih)} – ${tarihK(e.bit)}` : tarihK(e.tarih));
  const FAV = {
    mekan: {ad: 'Mekân', birim: 'mekân', liste: favMekan, oge: s => { const m = M(s); return {gorsel: m.kapak, baslik: m.ad, alt: [m.kategori, yer(m)].filter(Boolean).join(' · '), git: `#/mekan/${s}`}; },
      bos: {ikon: 'favori', baslik: 'Henüz favori mekânın yok', metin: 'Mekân kartındaki **kalp** ile beğendiklerini buraya topla.', eylem: {metin: 'Mekânları keşfet', git: '#/mekanlar'}}},
    lezzet: {ad: 'Lezzet', birim: 'lezzet yazısı', liste: favLezzet, oge: s => { const l = L(s); return {gorsel: l.gorsel, baslik: l.ad, alt: l.kategori || l.sure, git: `#/lezzet/${s}`}; },
      bos: {ikon: 'lezzet', baslik: 'Kayıtlı lezzet yazın yok', metin: 'Gurme Lezzetler’de beğendiğin yazıyı **kaydet**; burada toplanır.', eylem: {metin: 'Gurme Lezzetler', git: '#/lezzetler'}}},
    etkinlik: {ad: 'Etkinlik', birim: 'etkinlik', liste: favEtkinlik, oge: s => { const e = E(s); return {gorsel: e.gorsel, baslik: e.ad, alt: `${etkinlikTarih(e)} · ${e.yer}`, git: `#/etkinlik/${s}`}; },
      bos: {ikon: 'etkinlik', baslik: 'Kayıtlı etkinliğin yok', metin: 'Lezzet Takvimi’nde ilgini çeken etkinliği **kaydet**.', eylem: {metin: 'Etkinlikler', git: '#/etkinlikler'}}},
    rota: {ad: 'Rota', birim: 'rota', liste: favRota, oge: id => { const r = GM.rotaBul(id); return {ikon: 'rota', baslik: r.ad, alt: GM.rotaOzet(r), git: `#/rota/${id}`}; },
      bos: {ikon: 'rota', baslik: 'Favori rotan yok', metin: 'Dada Route’ta bir rotayı **favorilere** ekle; yola çıkmadan burada bulursun.', eylem: {metin: 'Hazır rotalar', git: '#/rota/hazir'}}}
  };
  const favCikar = (tur, id) => {
    const once = anlik(['mekan-favori', 'lezzet-kayit', 'etkinlik-kayit', 'rota-favori']);
    if (tur === 'mekan') GM.mekanKayit.yaz('favori', id, false);
    else {
      const k = {lezzet: 'lezzet-kayit', etkinlik: 'etkinlik-kayit', rota: 'rota-favori'}[tur];
      GM.durum.yaz(k, FAV[tur].liste().filter(x => x !== id));
    }
    GM.tazele();
    geriToast(once, 'Favorilerden **çıkarıldı**', 'favori');
  };

  // ---------- Ziyaretler, değerlendirmeler, katkılar ----------
  const ziyaretler = () => {
    tohumla();
    const l = oku('mekan-ziyaret', []).map(z => ({slug: z.slug || z, gun: z.gun || bugun()})).sort((a, b) => b.gun.localeCompare(a.gun)), gor = new Set();
    return l.filter(z => M(z.slug) && !gor.has(z.slug) && gor.add(z.slug)).sort((a, b) => b.gun.localeCompare(a.gun));
  };
  const degerler = () => {
    const kal = oku('degerlendirme-kaldirilan', []);
    const kul = oku('mekan-degerlendirme', []).map(d => ({id: `kul-${d.slug}`, slug: d.slug, puan: d.puan || 0, foto: d.foto || 0, durum: d.durum || 'inceleniyor', tarih: d.tarih || bugun(), kul: true}));
    const kulSlug = new Set(kul.map(d => d.slug));
    return [...kul, ...(yeni() ? [] : (H().degerlendirmeler || []).filter(d => !kal.includes(d.id) && !kulSlug.has(d.slug)))].filter(d => M(d.slug)).sort((a, b) => b.tarih.localeCompare(a.tarih));
  };
  const degerPuan = d => (d.puan ? 2 : 0) + (d.foto ? 15 : 0);
  const katkilar = () => {
    const kul = [...oku('katkilar', []), ...oku('katki-etkinlik', [])].map(k => ({...k, tarih: k.tarih || k.gonderim || bugun(), yer: k.yer || [k.ilce, k.il].filter(Boolean).join(', '), kul: true}));
    return [...kul, ...(yeni() ? [] : H().katkilar || [])].sort((a, b) => b.tarih.localeCompare(a.tarih));
  };
  const katkiAd = k => (k.slug ? M(k.slug)?.ad : k.etkinlik ? E(k.etkinlik)?.ad : k.ad) || k.ad || 'Öneri';
  const katkiYer = k => (k.slug ? yer(M(k.slug)) : k.etkinlik ? E(k.etkinlik)?.yer : k.yer) || '';
  const katkiGit = k => (k.durum === 'yayinda' ? (k.slug ? `#/mekan/${k.slug}` : k.etkinlik ? `#/etkinlik/${k.etkinlik}` : null) : null);

  // ---------- Dada Puan: kayıtlardan türeyen hareketler, rütbe, rozetler ----------
  const hareketler = () => {
    const l = [], rezGor = new Set();
    rezler().filter(r => r.hal === 'gerceklesti').sort((a, b) => a.tarih.localeCompare(b.tarih)).forEach(r => { if (rezGor.has(r.slug)) return; rezGor.add(r.slug); l.push({ad: `${r.m.ad} rezervasyonu`, ikon: 'rezervasyon', tutar: 25, durum: 'kesin', tarih: r.tarih, git: `#/profil/rezervasyon/${r.id}`}); });
    degerler().forEach(d => { const t = degerPuan(d); if (t) l.push({ad: `${M(d.slug).ad} değerlendirmesi`, ikon: d.foto ? 'kamera' : 'yildiz', tutar: t, durum: d.durum === 'yayinda' ? 'kesin' : 'bekliyor', tarih: d.tarih, git: '#/profil/degerlendirmeler'}); });
    katkilar().filter(k => k.tur !== 'etkinlik').forEach(k => l.push({ad: `${katkiAd(k)} önerisi`, ikon: 'pin', tutar: 50, durum: k.durum === 'yayinda' ? 'kesin' : k.durum === 'reddedildi' ? 'dustu' : 'bekliyor', tarih: k.onay || k.tarih, git: '#/profil/katkilar'}));
    return l.sort((a, b) => b.tarih.localeCompare(a.tarih));
  };
  const puanOzet = () => {
    const h = hareketler(), top = d => h.filter(x => x.durum === d).reduce((t, x) => t + x.tutar, 0), kesin = top('kesin');
    const R = H().rutbeler || [{ad: 'Meraklı', esik: 0, ikon: 'heart'}], i = R.reduce((s, r, j) => (kesin >= r.esik ? j : s), 0);
    return {kesin, bekleyen: top('bekliyor'), rutbe: R[i], sonraki: R[i + 1] || null, h};
  };
  const olcumler = () => {
    const d = degerler().filter(x => x.durum === 'yayinda'), k = katkilar().filter(x => x.durum === 'yayinda');
    return {degerlendirme: d.length, foto: d.filter(x => x.foto).length, oneriMekan: k.filter(x => x.tur !== 'etkinlik').length, oneriEtkinlik: k.filter(x => x.tur === 'etkinlik').length,
      rezervasyon: rezler().filter(r => r.hal === 'gerceklesti').length, ziyaret: ziyaretler().length, randevu: 0};
  };
  const rozetler = () => { const o = olcumler(); return (H().rozetler || []).map(r => { const n = Math.min(o[r.olcu] || 0, r.esik); return {...r, n, hedef: r.esik, hal: n >= r.esik ? 'kazanildi' : n > 0 ? 'ilerliyor' : 'kilitli', alt: n >= r.esik ? 'Kazanıldı' : `${n} / ${r.esik}`}; }); };
  const rozetSheet = id => { const r = rozetler().find(x => x.id === id); if (!r) return; GM.sheet({baslik: r.ad, html: `<div class="gm-yigin">${GM.madalya({ikon: r.ikon, hal: r.hal === 'kazanildi' ? '' : r.hal, boy: 'buyuk'})}${GM.p(r.hal === 'kazanildi' ? `Bu rozeti **kazandın**. ${r.nasil}` : `**Nasıl kazanılır?** ${r.nasil}`)}${r.hal !== 'kazanildi' ? GM.ilerleme({n: r.n, hedef: r.hedef, etiket: 'İlerleme'}) : ''}</div>`}); };

  // ---------- Listeler, etkinlikler, rotalar ----------
  const GORUNUR = {ozel: 'Gizli · yalnız ben', paylasilabilir: 'Bağlantısı olan görebilir'};
  const listeler = () => {
    const sil = oku('liste-silinen', []), deg = oku('liste-degisim', {}), mk = oku('mekan-liste', []);
    const kul = oku('listeler', []).map(x => ({gorunurluk: 'ozel', taslak: false, guncel: bugun(), ...x, kalem: uniq([...(x.kalem || []), ...mk.filter(k => k.liste === x.ad).map(k => k.slug)]), kul: true}));
    return [...kul, ...(yeni() ? [] : H().listeler || [])].filter(x => !sil.includes(x.id)).map(x => { const d = deg[x.id] || {}; return {...x, ...d, kalem: (d.kalem || x.kalem || []).filter(M)}; }).sort((a, b) => b.guncel.localeCompare(a.guncel));
  };
  GMX.hesapListeler = listeler;   // Paketlerim kullanım sayacı aynı listeyi okur
  const SINIR = () => H().listeSiniri || 3;
  const sinirSheet = () => GM.sheet({baslik: 'Liste sınırına ulaştın', html: `<div class="gm-yigin">${GM.p(`Ücretsiz pakette en çok **${SINIR()} liste** kurabilirsin. Yeni liste için bir listeyi silebilir ya da **Pro**’ya geçebilirsin.`)}${GM.satirlar((H().kademeler || []).map(k => ({ikon: k.ikon, baslik: k.ad, deger: (H().matris || []).find(r => r[0] === 'Listelerim')?.[{ucretsiz: 1, pro: 2, 'pro-max': 3}[k.k]] || '', ok: false})))}${GM.bant({ton: 'bilgi', ikon: 'clock', baslik: `Pro · ${H().proDurum?.rozet || 'Yakında'}`, metin: H().proDurum?.durumMetni || ''})}</div>`, altBar: GM.btnIkili({metin: 'Şimdi değil', attrs: 'data-sheet-kapat'}, {metin: 'Paketlerim', ikon: 'box-open', git: '#/paketlerim', attrs: 'data-sheet-kapat'})});
  const listeDegis = (id, ek) => { const d = oku('liste-degisim', {}); GM.durum.yaz('liste-degisim', {...d, [id]: {...(d[id] || {}), ...ek, guncel: bugun()}}); };
  const etkinlikBitti = e => (e.bit || e.tarih) < bugun();
  const katilim = () => uniq(tohum('etkinlik-katilim', () => H().etkinliklerim?.katilacagim)).filter(E);
  const katilacagim = () => katilim().filter(s => !etkinlikBitti(E(s))).sort((a, b) => E(a).tarih.localeCompare(E(b).tarih));
  const katildigim = () => uniq([...katilim().filter(s => etkinlikBitti(E(s))), ...(yeni() ? [] : H().etkinliklerim?.katildigim || [])]).filter(E).sort((a, b) => E(b).tarih.localeCompare(E(a).tarih));
  const rotalar = () => (yeni() ? oku('rota-kayitli', []) : uniq([...oku('rota-kayitli', []), 'istanbul-izmir', 'izmir-cesme', 'istanbul-ankara'])).filter(id => GM.rotaBul(id));
  const tercih = () => ({...(yeni() ? {} : H().tercihVarsayilan || {}), ...oku('kesif-tercih', {})});

  // =====================================================================
  // Profilim (#/profil): alt menü sekmesi
  // =====================================================================
  const profilBas = (p, pz) => GM.profilBas({
    ad: adSoyad(p) || 'Adını ekle', alt: [p.kullaniciAdi && `@${p.kullaniciAdi}`, pz.rutbe.ad].filter(Boolean).join(' · '), kapak: KAPAK, ust: true,
    eylem: GM.durumRozet({metin: p.paket || 'Ücretsiz', ton: 'notr', ikon: 'profil'}),
    sayaclar: [{deger: GM.sayi(ziyaretler().length), etiket: 'Ziyaret'}, {deger: GM.sayi(degerler().length), etiket: 'Değerlendirme'}, {deger: GM.sayi(pz.kesin), etiket: 'Dada Puan'}]
  });
  const puanBolum = pz => {
    const s = pz.sonraki, kaz = rozetler().filter(r => r.hal !== 'kilitli').slice(0, 3);
    return `<div class="gm-yigin-12">${GM.eylemKart({ikon: 'puanDada', baslik: `${GM.sayi(pz.kesin)} puan · ${pz.rutbe.ad}`, alt: s ? `${s.ad} rütbesine ${GM.sayi(s.esik - pz.kesin)} puan` : 'En yüksek rütbedesin', git: '#/profil/puan'})}${s ? GM.ilerleme({n: pz.kesin - pz.rutbe.esik, hedef: s.esik - pz.rutbe.esik, etiket: `${pz.rutbe.ad} → ${s.ad}`, deger: `${GM.sayi(pz.kesin)} / ${GM.sayi(s.esik)}`}) : ''}${pz.bekleyen ? GM.veriYok(`**${GM.sayi(pz.bekleyen)} puan** onay bekliyor`) : ''}${kaz.length ? GM.rozetIzgara({ogeler: kaz}) : ''}</div>`;
  };
  const misafirProfil = () => GM.profilBas({ad: 'Misafir', alt: 'Dada Gourmet’e hoş geldin', kapak: KAPAK, ust: true}) + GM.gruplar([
    {html: GM.girisDuvari({ikon: 'profil', baslik: 'Profilini oluştur', metin: 'Rezervasyonların, favorilerin ve **Dada Puan**’ın her cihazda seninle olsun.', sunar: [['medal', 'Dada Puan ve rütbe', 'Değerlendirme, öneri ve rezervasyonla puan kazan'], ['calendar-check', 'Rezervasyonların', 'Onay durumunu tek yerden izle'], ['heart', 'Favorilerin ve listelerin', 'Mekân, lezzet, etkinlik ve rota']]})},
    {baslik: 'Keşif', satirlar: [
      {ikon: 'filtre', baslik: 'Keşif tercihlerim', alt: 'Mutfak, mekân türü, şehir', git: '#/profil/tercihler'},
      {ikon: 'rota', baslik: 'Rotalarım', alt: 'Bu cihazda kayıtlı rotaların', git: '#/rota/rotalarim'}
    ]},
    {baslik: 'Uygulama', satirlar: [
      {ikon: 'ayar', baslik: 'Ayarlar', alt: 'Uygulama, dil ve konum', git: '#/ayarlar'},
      {ikon: 'bolt', baslik: 'Dada Gourmet Pro', alt: 'Reklamsız deneyim, kendi rotan', git: '#/pro'}
    ]},
    {baslik: 'Destek', satirlar: [
      {ikon: 'circle-question', baslik: 'Sık sorulan sorular', git: '#/sss'},
      {ikon: 'comment-dots', baslik: 'Görüş bildir', git: '#/gorus-bildir'}
    ]}
  ]);
  const uyeProfil = () => {
    const p = kisi(), pz = puanOzet(), r = rezler(), sira = r.filter(x => rezSekme(x) !== 'gecmis').sort((a, b) => `${a.tarih}${a.saat}`.localeCompare(`${b.tarih}${b.saat}`))[0];
    const say = s => r.filter(x => rezSekme(x) === s).length, d = degerler(), bil = GM.bildirimSayi(), t = tercih();
    const cagri = cagrilar()[0];
    return profilBas(p, pz) + GM.gruplar([
      cagri && {html: cagriBant(cagri)},
      {baslik: 'Dada Puan', eylem: {git: '#/profil/puan'}, html: puanBolum(pz)},
      sira && {baslik: 'Sıradaki rezervasyonun', eylem: {git: '#/profil/rezervasyonlar'}, satirlar: [rezSatir(sira)]},
      {baslik: 'Gurme Panelim', satirlar: [
        {ikon: 'rezervasyon', baslik: 'Rezervasyonlarım', alt: r.length ? `${say('onaylanan')} onaylı · ${say('bekleyen')} bekleyen` : 'Henüz rezervasyonun yok', git: '#/profil/rezervasyonlar'},
        {ikon: 'favori', baslik: 'Gurme Favorilerim', alt: `${sayiEk(favMekan().length, 'mekân')} · ${sayiEk(favLezzet().length, 'lezzet')} · ${sayiEk(favEtkinlik().length, 'etkinlik')}`, git: '#/profil/favoriler'},
        {ikon: 'ziyaret', baslik: 'Ziyaret Geçmişim', alt: sayiEk(ziyaretler().length, 'mekân'), git: '#/profil/ziyaretler'},
        {ikon: 'yildiz', baslik: 'Değerlendirmelerim', alt: `${d.filter(x => x.durum === 'yayinda').length} yayında · ${d.filter(x => x.durum !== 'yayinda').length} inceleniyor`, git: '#/profil/degerlendirmeler'},
        {ikon: 'users', baslik: 'Topluluk Katkılarım', alt: `${sayiEk(katkilar().length, 'öneri')}`, git: '#/profil/katkilar'},
        {ikon: 'puanDada', baslik: 'Puan Durumu ve Rozetler', alt: `${rozetler().filter(x => x.hal === 'kazanildi').length} / ${rozetler().length} rozet · ${pz.rutbe.ad}`, git: '#/profil/puan'}
      ]},
      {baslik: 'Listelerim ve planlarım', satirlar: [
        {ikon: 'list-ul', baslik: 'Listelerim', alt: sayiEk(listeler().length, 'liste'), git: '#/profil/listeler'},
        {ikon: 'rota', baslik: 'Rotalarım', alt: sayiEk(rotalar().length, 'kayıtlı rota'), git: '#/rota/rotalarim'},
        {ikon: 'etkinlik', baslik: 'Etkinliklerim', alt: `${katilacagim().length} katılacağım · ${favEtkinlik().length} ilgilendiğim`, git: '#/profil/etkinlikler'},
        {ikon: 'filtre', baslik: 'Keşif tercihlerim', alt: (t.mutfak || []).slice(0, 2).join(', ') || 'Mutfak, mekân türü, şehir', git: '#/profil/tercihler'}
      ]},
      {baslik: 'Hesabım', satirlar: [
        {ikon: 'box-open', baslik: 'Paketlerim', alt: `${p.paket || 'Ücretsiz'} · Pro yakında`, git: '#/paketlerim'},
        {ikon: 'credit-card', baslik: 'Ödemelerim', alt: 'Tahsilat yok · faturalar ve kartlar', git: '#/odemelerim'},
        {ikon: 'bildirim', baslik: 'Bildirimler', alt: bil ? `${bil} okunmamış` : 'Hepsi okundu', git: '#/bildirimler'},
        {ikon: 'ayar', baslik: 'Hesap ayarları', alt: p.eposta || 'Profil, bildirim, güvenlik', git: '#/ayarlar'}
      ]},
      {baslik: 'Destek', satirlar: [
        {ikon: 'headset', baslik: 'Çözüm merkezi', alt: 'Destek taleplerin ve yanıtları', git: '#/cozum-merkezi'},
        {ikon: 'comment-dots', baslik: 'Görüş bildir', git: '#/gorus-bildir'},
        {ikon: 'circle-question', baslik: 'Sık sorulan sorular', git: '#/sss'}
      ]},
      {baslik: 'Oturum', satirlar: [{ikon: 'cikis', baslik: 'Çıkış yap', veri: {eylem: 'cikis'}, ok: false, yikici: true}]}
    ], {bas: GM.btn({metin: 'Profili düzenle', ikon: 'duzenle', tur: 'secondary', boyut: 'sm', tam: true, git: '#/profil/duzenle'})});
  };
  GM.ekran('profil', {
    tur: 'banner', nav: 'profil', dock: true, ustBar: {geri: false}, baslik: 'Profilim', iskelet: 'profil', yenile: true,
    yukle: bekle, cekYenile: bekle,
    ciz: () => (GM.uye() ? uyeProfil() : misafirProfil()),
    sonra: kok => {
      const c = [
        degerlendirBagla(kok),
        GM.eylem(kok, 'rozet', el => rozetSheet(el.dataset.id)),
        GM.eylem(kok, 'cikis', () => GM.dialog({baslik: 'Çıkış yapılsın mı?', metin: 'Bu cihazdaki **oturumun ve kayıtların** silinir; hesabın ve Dada Puan’ın durur.', eylem: 'Çıkış yap', iptal: 'Vazgeç', yikici: true}).then(ok => { if (ok) GM.cikis(); }))
      ];
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // Profili düzenle (#/profil/duzenle): web Hesap Ayarları › Profil
  // =====================================================================
  const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, KULLANICI = /^[a-z0-9._]{3,24}$/, HAKKIMDA = 160;
  const SEHIRLER = ['İstanbul', 'İzmir', 'Ankara', 'Antalya', 'Muğla', 'Bursa', 'Nevşehir', 'Gaziantep', 'Hatay', 'Trabzon', 'Eskişehir', 'Çanakkale'];
  const telBicim = t => String(t || '').replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
  const profilForm = (t, h = {}) => `<div class="gm-yigin">
    <div class="gm-ikili">${GM.input({ad: 'ad', etiket: 'Ad', zorunlu: true, deger: t.ad, hata: h.ad, otomatik: 'given-name'})}${GM.input({ad: 'soyad', etiket: 'Soyad', zorunlu: true, deger: t.soyad, hata: h.soyad, otomatik: 'family-name'})}</div>
    ${GM.input({ad: 'kullaniciAdi', etiket: 'Kullanıcı adı', zorunlu: true, ikon: 'at', deger: t.kullaniciAdi, hata: h.kullaniciAdi, yardim: 'Değerlendirmelerinde ve listelerinde bu adla görünürsün.'})}
    ${GM.input({ad: 'eposta', etiket: 'E-posta', zorunlu: true, ikon: 'envelope', tur: 'email', mod: 'email', deger: t.eposta, hata: h.eposta, otomatik: 'email', yardim: 'Değiştirirsen yeni adrese doğrulama bağlantısı gider.'})}
    ${GM.telefon({ad: 'telefon', opsiyonel: true, deger: telBicim(t.telefon), hata: h.telefon})}
    ${GM.secAlan({ad: 'sehir', etiket: 'Yaşadığın şehir', deger: t.sehir, yer: 'Seç (isteğe bağlı)', secenekler: SEHIRLER.map(s => [s, s]), yardim: 'Keşfet ve bildirim önerileri konum kapalıyken bu şehre göre gelir.'})}
    ${GM.input({ad: 'hakkimda', etiket: 'Hakkımda', cokSatir: true, deger: t.hakkimda, yer: 'Sevdiğin sofralardan kısaca bahset', hata: h.hakkimda, yardim: `${(t.hakkimda || '').length} / ${HAKKIMDA}`})}
  </div>`;
  GM.ekran('profil-duzenle', {
    tur: 'alt', baslik: 'Profili düzenle', ust: '#/profil', iskelet: 'satir',
    ciz: ctx => {
      if (!GM.uye()) return GM.girisGerekli({ikon: 'profil', baslik: 'Profil bilgilerin', metin: 'Adını, kullanıcı adını ve fotoğrafını **düzenlemek** için giriş yap.'});
      const p = kisi(), t = ctx.taslak || p, ad = adSoyad(p);
      return GM.gruplar([
        {baslik: 'Profil fotoğrafı', html: `<div class="gm-yigin-12">${GM.satirlar([GM.satir({avatar: {ad: ad || 'D', gorsel: p.foto, boyut: 56}, baslik: ad || 'Adını ekle', alt: 'JPG, PNG ya da WebP · en az 200 × 200', sag: GM.btn({metin: 'Değiştir', tur: 'tonal', boyut: 'sm', veri: {eylem: 'foto'}}), duz: true})])}${GM.p('Adın ve fotoğrafın **değerlendirmelerinde** ve paylaştığın listelerde görünür.', {ton: 'ikincil', meta: true})}</div>`},
        {baslik: 'Kişisel bilgiler', html: `<div data-yuva="form">${profilForm(t, ctx.hatalar)}</div>`},
        {baslik: 'Görünürlük ve tercihler', satirlar: [
          {ikon: 'eye', baslik: 'Profil görünürlüğü', alt: 'Değerlendirme, liste ve liderlik', git: '#/ayarlar/gizlilik'},
          {ikon: 'filtre', baslik: 'Keşif tercihlerim', alt: 'Mutfak, mekân türü, şehir', git: '#/profil/tercihler'}
        ]}
      ]);
    },
    altBar: () => (GM.uye() ? GM.altEylem({dugmeler: [{metin: 'Değişiklikleri kaydet', ikon: 'onay', tam: true, veri: {eylem: 'kaydet'}}]}) : ''),
    sonra: (kok, ctx) => {
      if (!GM.uye()) return null;
      const v = ad => kok.querySelector(`[name="${ad}"]`)?.value ?? '';
      const c = [
        GM.eylem(kok, 'foto', () => GM.sheet({baslik: 'Profil fotoğrafı', html: GM.satirlar([
          {ikon: 'kamera', baslik: 'Fotoğraf çek', veri: {eylem: 'f-sec'}, attrs: 'data-sheet-kapat', ok: false},
          {ikon: 'galeri', baslik: 'Galeriden seç', veri: {eylem: 'f-sec'}, attrs: 'data-sheet-kapat', ok: false},
          {ikon: 'sil', baslik: 'Fotoğrafı kaldır', veri: {eylem: 'f-sil'}, attrs: 'data-sheet-kapat', ok: false, yikici: true}
        ]), sonra: d => { const a = GM.eylem(d, 'f-sec', () => GM.toast('Fotoğraf **yüklendi**; kaydedince profilinde görünür', {ikon: 'kamera'})); const b = GM.eylem(d, 'f-sil', () => { ayarYaz('profil', {foto: null}); GM.tazele(); GM.toast('Fotoğraf kaldırıldı', {ikon: 'sil'}); }); return () => { a(); b(); }; }})),
        GM.eylem(kok, 'kaydet', el => {
          const t = {...kisi(), ad: v('ad').trim(), soyad: v('soyad').trim(), kullaniciAdi: v('kullaniciAdi').trim().replace(/^@/, '').toLocaleLowerCase('tr'), eposta: v('eposta').trim(), telefon: v('telefon').replace(/\D/g, ''), sehir: v('sehir'), hakkimda: v('hakkimda').trim()};
          const h = {ad: t.ad ? '' : 'Adını yaz', soyad: t.soyad ? '' : 'Soyadını yaz', kullaniciAdi: !t.kullaniciAdi ? 'Kullanıcı adı seç' : KULLANICI.test(t.kullaniciAdi) ? '' : '3-24 karakter; harf, rakam, nokta ya da alt çizgi',
            eposta: !t.eposta ? 'E-posta adresini yaz' : EPOSTA.test(t.eposta) ? '' : 'Geçerli bir e-posta adresi yaz', telefon: !t.telefon || /^5\d{9}$/.test(t.telefon) ? '' : 'Telefon 5 ile başlayan 10 rakam olmalı', hakkimda: t.hakkimda.length > HAKKIMDA ? `En çok ${HAKKIMDA} karakter` : ''};
          if (Object.values(h).some(Boolean)) { ctx.taslak = t; ctx.hatalar = h; kok.querySelector('[data-yuva="form"]').innerHTML = profilForm(t, h); GM.titres(20); return; }
          GM.mesgul(el, GM.TK.motion.reveal).then(() => {
            const once = kisi(), epDegisti = t.eposta !== once.eposta;
            ayarYaz('profil', {ad: t.ad, soyad: t.soyad, kullaniciAdi: t.kullaniciAdi, eposta: t.eposta, telefon: t.telefon, sehir: t.sehir, hakkimda: t.hakkimda});
            ctx.taslak = null; ctx.hatalar = null; GM.tazele();
            GM.toast(epDegisti ? `Profilin güncellendi; **${t.eposta}** adresine doğrulama bağlantısı gönderildi` : 'Profilin **güncellendi**', {tur: 'basari'});
          });
        })
      ];
      const hk = kok.querySelector('[name="hakkimda"]'), sayac = () => { const y = hk?.closest('.gm-alan')?.querySelector('.gm-yardim'); if (y) y.textContent = `${hk.value.length} / ${HAKKIMDA}`; };
      hk?.addEventListener('input', sayac);
      return () => { c.forEach(f => f()); hk?.removeEventListener('input', sayac); };
    }
  });

  // =====================================================================
  // Rezervasyonlarım (#/profil/rezervasyonlar) ve detay (#/profil/rezervasyon/:id)
  // =====================================================================
  const REZ_SEKME = [['onaylanan', 'Onaylanan'], ['bekleyen', 'Bekleyen'], ['gecmis', 'Geçmiş']];
  const REZ_BOS = {
    onaylanan: {ikon: 'rezervasyon', baslik: 'Onaylı masan yok', metin: 'Mekân sahibi talebini onaylayınca rezervasyonun **burada** görünür.'},
    bekleyen: {ikon: 'saat', baslik: 'Bekleyen talebin yok', metin: 'Rezervasyon alan bir mekânın sayfasından **masa talebi** gönderebilirsin.', eylem: {metin: 'Mekânları keşfet', git: '#/mekanlar'}},
    gecmis: {ikon: 'gecmis', baslik: 'Geçmiş rezervasyonun yok', metin: 'Gerçekleşen, iptal edilen ve onaylanmayan rezervasyonların **burada** kalır.'}
  };
  GM.ekran('rezervasyonlar', {
    tur: 'alt', baslik: 'Rezervasyonlarım', ust: '#/profil', iskelet: 'liste', yenile: true, yukle: bekle, cekYenile: bekle,
    bos: {ikon: 'rezervasyon', baslik: 'Henüz rezervasyon talebin yok', metin: 'Rezervasyon alan bir mekânın sayfasından **masa talebi** gönderebilirsin; onay durumu burada görünür.', eylem: {metin: 'Mekânları keşfet', git: '#/mekanlar'}},
    ciz: ctx => {
      const r = rezler();
      if (!r.length) return GM.bos({tam: true, ...GM.ekranTanim('rezervasyonlar').bos});
      const grup = Object.fromEntries(REZ_SEKME.map(([k]) => [k, r.filter(x => rezSekme(x) === k)]));
      grup.onaylanan.sort((a, b) => `${a.tarih}${a.saat}`.localeCompare(`${b.tarih}${b.saat}`)); grup.bekleyen.sort((a, b) => a.tarih.localeCompare(b.tarih)); grup.gecmis.sort((a, b) => b.tarih.localeCompare(a.tarih));
      const s = sekmeAl(ctx, REZ_SEKME, grup.onaylanan.length ? 'onaylanan' : grup.bekleyen.length ? 'bekleyen' : 'gecmis'), l = grup[s];
      return GM.gruplar([
        {html: segment('rez-sekme', s, REZ_SEKME.map(([k, a]) => [k, a, grup[k].length]))},
        ...cagrilar().slice(0, 1).map(x => ({html: cagriBant(x)})),
        l.length ? {satirlar: l.map(r => rezSatir(r, s === 'gecmis'))} : {html: bosKucuk(REZ_BOS[s])},
        {html: GM.p('Talebin **mekân sahibinin onayıyla** kesinleşir. Gerçekleşen her rezervasyon mekân başına bir kez **+25 Dada Puan** kazandırır.', {ton: 'ikincil', meta: true})}
      ]);
    },
    sonra: (kok, ctx) => {
      const c = [GM.on(kok, 'rez-sekme', v => { ctx.sekme = v; GM.tazele(); }), degerlendirBagla(kok)];
      return () => c.forEach(f => f());
    }
  });
  const takvimeEkle = r => {
    const [y, a, g] = r.tarih.split('-'), [h, dd] = r.saat.split(':'), son = String(Math.min(23, +h + 2)).padStart(2, '0');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dada Gourmet//TR', 'BEGIN:VEVENT', `UID:${r.id}@dadagourmet.com`, `DTSTART:${y}${a}${g}T${h}${dd}00`, `DTEND:${y}${a}${g}T${son}${dd}00`, `SUMMARY:${r.m.ad} · ${r.kisi} kişi`, `LOCATION:${GM.konumMetin ? GM.konumMetin(r.m, 'uzun') : yer(r.m)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const u = URL.createObjectURL(new Blob([ics], {type: 'text/calendar'})), l = Object.assign(document.createElement('a'), {href: u, download: `${r.slug}-rezervasyon.ics`});
    l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000);
    GM.toast('Takvim dosyası **hazır**', {ikon: 'takvim'});
  };
  const rezDurumBant = r => {
    const gecti = r.tarih < bugun(), dg = degerlendirdi(r.slug);
    if (r.hal === 'talep') return GM.bant({ton: 'uyari', ikon: 'saat', baslik: 'Mekân sahibi onayı bekleniyor', metin: 'Talebin **mekâna iletildi**. Onaylanınca ya da başka saat önerilince bildirim gelir.'});
    if (r.hal === 'onaylandi' && !gecti) return GM.bant({ton: 'basari', ikon: 'onay', baslik: 'Masan ayrıldı', metin: `**${tarihGun(r.tarih)} ${nk(r.saat)}** için masan hazır. **24 saat ve 2 saat önce** hatırlatırız.`});
    if (r.hal === 'onaylandi' || r.hal === 'gerceklesti') return GM.bant({ton: r.hal === 'gerceklesti' ? 'basari' : 'bilgi', ikon: r.hal === 'gerceklesti' ? 'circle-check' : 'yildiz', baslik: r.hal === 'gerceklesti' ? 'Rezervasyon gerçekleşti' : 'Ziyaretin nasıldı?', metin: r.hal === 'gerceklesti' ? `**+25 Dada Puan** hesabına geçti.${dg ? '' : ' Mekânı puanlarsan **+2**, fotoğraf eklersen **+15** daha.'}` : 'Mekân sahibi ziyaretini işaretleyince **+25 Dada Puan** kesinleşir. Bu arada mekânı puanlayabilirsin.', eylem: dg ? null : {metin: 'Değerlendir', veri: {eylem: 'degerlendir', id: r.slug}}});
    if (r.hal === 'reddedildi') return GM.bant({ton: 'hata', ikon: 'xmark', baslik: 'Mekân talebini onaylamadı', metin: r.neden ? `**Neden:** ${r.neden}` : 'Mekân bu saat için **masa ayıramadı**.'});
    if (r.hal === 'iptal') return GM.bant({ton: 'bilgi', ikon: 'ban', baslik: 'Rezervasyon iptal edildi', metin: 'Talebin **mekândan geri çekildi**; puan ya da ücret işlemi yok.'});
    return GM.bant({ton: 'bilgi', ikon: 'user-xmark', baslik: 'Gelinmedi', metin: 'Mekân bu rezervasyonu **gelinmedi** olarak işaretledi.'});
  };
  GM.ekran('rezervasyon', {
    tur: 'alt', baslik: 'Rezervasyon', ust: '#/profil/rezervasyonlar', iskelet: 'detay', yenile: true,
    ciz: ctx => {
      const r = rezler().find(x => x.id === ctx.param.id);
      if (!r) return GM.hataEkran({tur: 'bulunamadi', eylem: {metin: 'Rezervasyonlarım', ikon: 'rezervasyon', yerine: '#/profil/rezervasyonlar'}});
      const gelecekte = r.tarih >= bugun() && ['talep', 'onaylandi'].includes(r.hal);
      const kunye = [
        {ikon: 'takvim', etiket: 'Tarih', deger: tarihGun(r.tarih)}, {ikon: 'saat', etiket: 'Saat', deger: nk(r.saat)},
        {ikon: 'kisi', etiket: 'Kişi', deger: `${r.kisi} kişi${r.cocuk ? ` · ${r.cocuk} çocuk` : ''}`},
        r.masa && r.masa !== 'farketmez' && {ikon: 'chair', etiket: 'Masa', deger: MASA[r.masa] || r.masa},
        r.durum && r.durum !== 'standart' && {ikon: 'festival', etiket: 'Özel durum', deger: OZEL[r.durum] || r.durum},
        r.alerjen && {ikon: 'gizlilik', etiket: 'Alerjen notu', deger: r.alerjen},
        r.not && {ikon: 'comment-dots', etiket: 'Özel istek', deger: r.not},
        {ikon: 'hashtag', etiket: 'Talep no', deger: talepNo(r.id)}
      ].filter(Boolean);
      return GM.gruplar([
        {html: GM.satirlar([GM.satir({gorsel: r.m.kapak, baslik: r.m.ad, alt: [r.m.kategori, yer(r.m)].filter(Boolean).join(' · '), git: `#/mekan/${r.slug}`})])},
        {html: rezDurumBant(r)},
        {baslik: 'Rezervasyon bilgileri', html: GM.kunye(kunye)},
        gelecekte && {html: `<div class="gm-yigin-12"><div class="gm-ikili">${GM.btn({metin: 'Takvime ekle', ikon: 'takvim', tur: 'secondary', veri: {eylem: 'takvim'}})}${GM.btn({metin: 'Yol tarifi', ikon: 'yon', tur: 'secondary', veri: {eylem: 'yol'}})}</div>${GM.btn({metin: 'Rezervasyonu iptal et', ikon: 'ban', tur: 'yikici-metin', tam: true, veri: {eylem: 'iptal'}})}</div>`},
        !gelecekte && {html: GM.btn({metin: r.hal === 'reddedildi' ? 'Başka saat dene' : 'Yeniden rezervasyon', ikon: 'rezervasyon', tur: 'secondary', tam: true, git: `#/mekan/${r.slug}`})},
        {html: GM.p('Değişiklik için **mekânla doğrudan** iletişime geç; sorun yaşarsan Çözüm merkezine yaz.', {ton: 'ikincil', meta: true})},
        {satirlar: [{ikon: 'headset', baslik: 'Bu rezervasyonla ilgili destek', git: '#/cozum-merkezi'}]}
      ]);
    },
    sonra: (kok, ctx) => {
      const r = () => rezler().find(x => x.id === ctx.param.id);
      const c = [
        degerlendirBagla(kok),
        GM.eylem(kok, 'takvim', () => { const x = r(); if (x) takvimeEkle(x); }),
        GM.eylem(kok, 'yol', () => { const x = r(); if (x) window.open(`https://www.google.com/maps/dir/?api=1&destination=${x.m.lat},${x.m.lng}`, '_blank', 'noopener'); }),
        GM.eylem(kok, 'iptal', () => { const x = r(); if (!x) return; GM.dialog({baslik: 'Rezervasyon iptal edilsin mi?', metin: `**${x.m.ad}** · ${GM.tarihKisa(x.tarih)} ${nk(x.saat)} talebin mekândan geri çekilir.`, eylem: 'İptal et', iptal: 'Vazgeç', yikici: true}).then(ok => {
          if (!ok) return; GM.durum.yaz('rez-iptal', uniq([...oku('rez-iptal', []), x.id])); GM.tazele(); GM.toast('Rezervasyonun **iptal edildi**', {ikon: 'ban'});
        }); })
      ];
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // Gurme Favorilerim (#/profil/favoriler): Mekân · Lezzet · Etkinlik · Rota, sonsuz kaydırma, çıkar + geri al
  // =====================================================================
  const FAV_SIRA = ['mekan', 'lezzet', 'etkinlik', 'rota'];
  const favSatir = tur => id => { const o = FAV[tur].oge(id); return GM.satirKap(GM.satir({...o, ok: false}), GM.ikonBtn({ikon: 'favori', tur: 'tint', secili: true, etiket: `${o.baslik}: favorilerden çıkar`, veri: {eylem: 'fav-cikar', id}})); };
  GM.ekran('favoriler', {
    tur: 'alt', baslik: 'Gurme Favorilerim', ust: '#/profil', iskelet: 'liste', yenile: true, yukle: bekle, cekYenile: bekle,
    bos: {ikon: 'favori', baslik: 'Henüz favorin yok', metin: 'Mekân, lezzet yazısı, etkinlik ve rotaları **kalp** ile favorilerine ekle.', eylem: {metin: 'Keşfetmeye başla', git: '#/kesfet'}},
    ciz: ctx => {
      const say = Object.fromEntries(FAV_SIRA.map(k => [k, FAV[k].liste().length]));
      const s = sekmeAl(ctx, FAV_SIRA.map(k => [k]), FAV_SIRA.find(k => say[k]) || 'mekan'), l = FAV[s].liste();
      return GM.gruplar([
        {html: segment('fav-sekme', s, FAV_SIRA.map(k => [k, FAV[k].ad, say[k]]), {kaydir: true})},
        {html: l.length ? sayfali(l, favSatir(s)) : bosKucuk(FAV[s].bos)}
      ]);
    },
    sonra: (kok, ctx) => {
      const s = sekmeAl(ctx, FAV_SIRA.map(k => [k]), FAV_SIRA.find(k => FAV[k].liste().length) || 'mekan');
      const c = [
        sonsuzBagla(kok, FAV[s].liste(), favSatir(s), FAV[s].birim),
        (segOdak(kok), GM.on(kok, 'fav-sekme', v => { ctx.sekme = v; GM.tazele(); kok.querySelector('.gm-kaydir').scrollTop = 0; })),
        GM.eylem(kok, 'fav-cikar', el => favCikar(s, el.dataset.id))
      ];
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // Ziyaret Geçmişim (#/profil/ziyaretler): sonsuz kaydırma, satır menüsü
  // =====================================================================
  const ziyaretSatir = z => { const m = M(z.slug); return GM.satirKap(GM.satir({gorsel: m.kapak, baslik: m.ad, alt: `${tarihK(z.gun)} · ${yer(m)}`, git: `#/mekan/${z.slug}`, ok: false}), GM.ikonBtn({ikon: 'more', etiket: `${m.ad}: seçenekler`, veri: {eylem: 'z-daha', id: z.slug}})); };
  GM.ekran('ziyaretler', {
    tur: 'alt', baslik: 'Ziyaret Geçmişim', ust: '#/profil', iskelet: 'liste', yenile: true, yukle: bekle, cekYenile: bekle,
    bos: {ikon: 'ziyaret', baslik: 'Henüz ziyaret kaydın yok', metin: 'Gittiğin mekânın sayfasında **Ziyaret Ettim**’e dokun; seyahat günlüğün burada birikir.', eylem: {metin: 'Mekânları keşfet', git: '#/mekanlar'}},
    ciz: () => {
      const l = ziyaretler();
      if (!l.length) return GM.bos({tam: true, ...GM.ekranTanim('ziyaretler').bos});
      const iller = new Set(l.map(z => M(z.slug).il)), ay = bugun().slice(0, 7);
      return GM.gruplar([
        {html: GM.stat([{deger: GM.sayi(l.length), etiket: 'Mekân'}, {deger: GM.sayi(iller.size), etiket: 'Şehir'}, {deger: GM.sayi(l.filter(z => z.gun.startsWith(ay)).length), etiket: 'Bu ay'}])},
        {html: GM.p('**Ziyaret Ettim** puan kazandırmaz; mekânı puanlarsan **+2**, fotoğraf eklersen **+15 Dada Puan**.', {ton: 'ikincil', meta: true})},
        {html: sayfali(l, ziyaretSatir)}
      ]);
    },
    sonra: kok => {
      const c = [
        sonsuzBagla(kok, ziyaretler(), ziyaretSatir, 'ziyaret'),
        GM.eylem(kok, 'z-daha', el => {
          const slug = el.dataset.id, m = M(slug); if (!m) return;
          GM.sheet({baslik: m.ad, html: GM.satirlar([
            {ikon: 'mekan', baslik: 'Mekân sayfasını aç', git: `#/mekan/${slug}`, attrs: 'data-sheet-kapat'},
            !degerlendirdi(slug) && {ikon: 'yildiz', baslik: 'Değerlendir', alt: 'Puanlama +2 · fotoğraflı +15', veri: {eylem: 'z-deger'}, attrs: 'data-sheet-kapat', ok: false},
            {ikon: 'sil', baslik: 'Ziyaret geçmişinden çıkar', veri: {eylem: 'z-sil'}, attrs: 'data-sheet-kapat', ok: false, yikici: true}
          ].filter(Boolean)), sonra: d => {
            const a = GM.eylem(d, 'z-deger', () => GM.degerlendirAkis(m, {degisti: () => GM.tazele()}));
            const b = GM.eylem(d, 'z-sil', () => {
              const once = anlik(['mekan-ziyaret']);
              GM.mekanKayit.yaz('ziyaret', slug, false);
              GM.tazele(); geriToast(once, 'Ziyaret geçmişinden **çıkarıldı**');
            });
            return () => { a(); b(); };
          }});
        })
      ];
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // Değerlendirmelerim (#/profil/degerlendirmeler): Tümü · Yayında · İnceleniyor; incelemedekini kaldır
  // =====================================================================
  const DEGER_SEKME = [['tumu', 'Tümü'], ['yayinda', 'Yayında'], ['inceleniyor', 'İnceleniyor']];
  // Yayındaki satırda kazanılan puan sağda; incelemedeki satır durum rozeti ve Kaldır düğmesi taşır.
  const degerSatir = d => {
    const m = M(d.slug), t = degerPuan(d), yay = d.durum === 'yayinda';
    const satir = GM.satir({gorsel: m.kapak, baslik: m.ad, ek: GM.mekanMetaSatir([yay ? '' : '<b>İnceleniyor</b>', `${d.puan || '–'}/5`, d.foto ? `${d.foto} fotoğraf` : '', tarihK(d.tarih)].filter(Boolean)), deger: t ? `+${t}` : null, git: `#/mekan/${d.slug}`, ok: yay});
    return yay ? satir : GM.satirKap(satir, GM.ikonBtn({ikon: 'sil', etiket: `${m.ad}: değerlendirmeyi kaldır`, veri: {eylem: 'dg-kaldir', id: d.id}}));
  };
  GM.ekran('degerlendirmeler', {
    tur: 'alt', baslik: 'Değerlendirmelerim', ust: '#/profil', iskelet: 'liste', yenile: true, yukle: bekle, cekYenile: bekle,
    bos: {ikon: 'yildiz', baslik: 'Henüz değerlendirmen yok', metin: 'Gittiğin mekânı puanla; fotoğraf eklersen **+15 Dada Puan** kazanırsın.', eylem: {metin: 'Ziyaret geçmişim', git: '#/profil/ziyaretler'}},
    ciz: ctx => {
      const l = degerler();
      if (!l.length) return GM.bos({tam: true, ...GM.ekranTanim('degerlendirmeler').bos});
      const s = sekmeAl(ctx, DEGER_SEKME, 'tumu'), g = l.filter(d => s === 'tumu' || (s === 'yayinda' ? d.durum === 'yayinda' : d.durum !== 'yayinda'));
      return GM.gruplar([
        {html: segment('dg-sekme', s, DEGER_SEKME.map(([k, a]) => [k, a, k === 'tumu' ? l.length : l.filter(d => (k === 'yayinda' ? d.durum === 'yayinda' : d.durum !== 'yayinda')).length]))},
        g.length ? {satirlar: g.map(degerSatir)} : {html: bosKucuk({ikon: 'saat', baslik: 'İncelemede değerlendirmen yok', metin: 'Gönderdiğin değerlendirmeler **denetimden** geçince yayına girer.'})},
        {html: GM.p('Değerlendirmeler **moderasyon onayıyla** yayına girer; puanlama **+2**, fotoğraflı değerlendirme **+15 Dada Puan**. Mekân ve etkinlik değerlendirmelerin tek akışta.', {ton: 'ikincil', meta: true})}
      ]);
    },
    sonra: (kok, ctx) => {
      const c = [
        GM.on(kok, 'dg-sekme', v => { ctx.sekme = v; GM.tazele(); }),
        GM.eylem(kok, 'dg-kaldir', el => {
          const d = degerler().find(x => x.id === el.dataset.id); if (!d) return;
          GM.dialog({baslik: 'Değerlendirme kaldırılsın mı?', metin: `**${M(d.slug).ad}** değerlendirmen incelemeden çekilir; bekleyen **+${degerPuan(d)} puan** düşer.`, eylem: 'Kaldır', iptal: 'Vazgeç', yikici: true}).then(ok => {
            if (!ok) return;
            const once = anlik(['degerlendirme-kaldirilan', 'mekan-degerlendirme']);
            if (d.kul) GM.mekanKayit.yaz('degerlendirme', d.slug, false); else GM.durum.yaz('degerlendirme-kaldirilan', uniq([...oku('degerlendirme-kaldirilan', []), d.id]));
            GM.tazele(); geriToast(once, 'Değerlendirme **kaldırıldı**');
          });
        })
      ];
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // Topluluk Katkılarım (#/profil/katkilar): İnceleniyor · Yayında · Reddedildi
  // =====================================================================
  const KATKI_SEKME = [['inceleniyor', 'İnceleniyor'], ['yayinda', 'Yayında'], ['reddedildi', 'Reddedildi']];
  const katkiSatir = k => {
    const mekan = k.tur !== 'etkinlik', rozet = k.durum === 'yayinda' ? {metin: mekan ? 'Yayında · +50 kesinleşti' : 'Yayında', ton: 'basari', ikon: 'circle-check'} : k.durum === 'reddedildi' ? {metin: 'Yayınlanmadı', ton: 'hata', ikon: 'xmark'} : {metin: mekan ? 'İnceleniyor · +50 bekleyen' : 'İnceleniyor', ton: 'uyari', ikon: 'saat'};
    const alt = k.durum === 'reddedildi' && k.neden ? k.neden : [mekan ? 'Mekân önerisi' : 'Etkinlik önerisi', katkiYer(k), tarihK(k.tarih)].filter(Boolean).join(' · ');
    return GM.satir({ikon: mekan ? 'pin' : 'etkinlik', baslik: katkiAd(k), alt, ozet: k.durum === 'reddedildi', ek: GM.durumRozet(rozet), git: katkiGit(k)});
  };
  GM.ekran('katkilar', {
    tur: 'alt', baslik: 'Topluluk Katkılarım', ust: '#/profil', iskelet: 'liste', yenile: true, yukle: bekle, cekYenile: bekle,
    bos: {ikon: 'ekle', baslik: 'Henüz önerin yok', metin: 'Rehberde olmayan bir mekânı öner; kabul edilirse **+50 Dada Puan** kazanırsın.', eylem: {metin: 'Mekân öner', ikon: 'ekle', git: '#/mekan-oner'}},
    ciz: ctx => {
      const l = katkilar();
      if (!l.length) return GM.bos({tam: true, ...GM.ekranTanim('katkilar').bos, ikincil: {metin: 'Etkinlik öner', git: '#/etkinlik-oner'}});
      const s = sekmeAl(ctx, KATKI_SEKME, l.some(k => k.durum === 'inceleniyor') ? 'inceleniyor' : 'yayinda'), g = l.filter(k => k.durum === s);
      const BOS = {inceleniyor: ['saat', 'İncelemede önerin yok', 'Gönderdiğin öneriler **editör onayından** sonra yayına girer.'], yayinda: ['circle-check', 'Yayında önerin yok', 'Kabul edilen önerilerin **burada** görünür.'], reddedildi: ['xmark', 'Reddedilen önerin yok', 'Yayınlanmayan önerilerin **nedeniyle** burada görünür.']}[s];
      return GM.gruplar([
        {html: segment('kt-sekme', s, KATKI_SEKME.map(([k, a]) => [k, a, l.filter(x => x.durum === k).length]))},
        g.length ? {satirlar: g.map(katkiSatir)} : {html: bosKucuk({ikon: BOS[0], baslik: BOS[1], metin: BOS[2]})},
        {html: `<div class="gm-yigin-12">${GM.btnIkili({metin: 'Etkinlik öner', ikon: 'etkinlik', git: '#/etkinlik-oner'}, {metin: 'Mekân öner', ikon: 'ekle', git: '#/mekan-oner'})}${GM.p('Kabul edilen mekân önerisi **+50 Dada Puan** kazandırır; etkinlik önerisi puan kazandırmaz.', {ton: 'ikincil', meta: true})}</div>`}
      ]);
    },
    sonra: (kok, ctx) => GM.on(kok, 'kt-sekme', v => { ctx.sekme = v; GM.tazele(); })
  });

  // =====================================================================
  // Puan Durumu ve Rozetler (#/profil/puan): sayaçlar, kurallar, rozetler, rütbe merdiveni, sayfalı hareketler
  // =====================================================================
  const HAREKET_SAYFA = 10;
  const HAREKET_DURUM = {kesin: 'Kesinleşti', bekliyor: 'Onay bekliyor', dustu: 'Düştü · onaylanmadı'};
  // Rozetlerim'in 4 sekmesi (web hesabim/rozetlerim: Koleksiyon · Kademem · Puan Defteri · Liderlik) Puan Durumu'nun içinde: ?sekme=defter|koleksiyon|kademe|liderlik.
  // Liderlik yalnız kendi yerini gösterir (web kuralı); sıra numarası uydurulmaz, bu ayın kesinleşen puanı ve görünürlük ayarı gösterilir.
  const PUAN_SEKME = [['defter', 'Defter'], ['koleksiyon', 'Rozetler'], ['kademe', 'Kademe'], ['liderlik', 'Liderlik']];
  const defterHtml = (ctx, pz) => {
    const h = pz.h, top = Math.max(1, Math.ceil(h.length / HAREKET_SAYFA)), sayfa = Math.min(top, Math.max(1, +(ctx.sayfa || ctx.sorgu.sayfa) || 1));
    return [
      {baslik: 'Puan nasıl kazanılır?', html: `<div class="gm-yigin-12">${GM.satirlar([...(H().puanKurallari || []).map(k => ({ikon: k.ikon, baslik: k.ad, alt: k.onay, deger: `+${k.tutar}`})), {ikon: 'ziyaret', baslik: 'Ziyaret Ettim', alt: 'Seyahat günlüğüne yazılır', deger: 'Puan yok'}])}${GM.bant({ton: 'bilgi', metin: `Puan önce **bekleyen** yazılır, onayda **kesinleşir**; ret ya da silmede düşer. Günde en çok **${H().gunlukSinir || 100} puan** kazanılır; puan ayrıcalık vaat etmez.`})}</div>`},
      {baslik: 'Puan hareketleri', eylem: {html: `<span class="gm-t-meta gm-ton-ikincil">${GM.sayi(h.length)} hareket</span>`}, html: h.length
        ? `<div class="gm-yigin-12">${GM.satirlar(h.slice((sayfa - 1) * HAREKET_SAYFA, sayfa * HAREKET_SAYFA).map(x => ({ikon: x.ikon, baslik: x.ad, alt: `${tarihK(x.tarih)} · ${HAREKET_DURUM[x.durum]}`, deger: `+${x.tutar}`, git: x.git})))}${GM.sayfalama({sayfa, toplam: top})}</div>`
        : bosKucuk(GM.ekranTanim('puan').bos)}
    ];
  };
  const koleksiyonHtml = () => { const r = rozetler(); return [
    {html: GM.p(`**${r.filter(x => x.hal === 'kazanildi').length} / ${r.length} rozet** kazandın. Rozet yalnız **onaylanmış** eylemden gelir; rozete dokununca nasıl kazanıldığını görürsün.`, {ton: 'ikincil'})},
    ...(H().rozetAileleri || [{k: null, ad: 'Rozetler'}]).map(a => ({baslik: a.ad, eylem: {html: `<span class="gm-t-meta gm-ton-ikincil">${r.filter(x => !a.k || x.aile === a.k).filter(x => x.hal === 'kazanildi').length} / ${r.filter(x => !a.k || x.aile === a.k).length}</span>`}, html: GM.rozetIzgara({ogeler: r.filter(x => !a.k || x.aile === a.k)})}))
  ]; };
  const kademeHtml = pz => { const R = H().rutbeler || []; return [
    {html: GM.p(`Rütben **kesinleşen puandan** gelir. Şu an **${pz.rutbe.ad}** rütbesindesin${pz.sonraki ? `; **${pz.sonraki.ad}** için ${GM.sayi(pz.sonraki.esik - pz.kesin)} puan kaldı` : ''}.`, {ton: 'ikincil'})},
    {baslik: 'Rütbe merdiveni', satirlar: R.map((r, i) => { const son = R[i + 1], on = r === pz.rutbe; return {ikon: r.ikon, baslik: r.ad, alt: son ? `${GM.sayi(r.esik)}–${GM.sayi(son.esik - 1)} kesinleşen puan` : `${GM.sayi(r.esik)} ve üzeri`, ek: on ? GM.durumRozet({metin: 'Şu anki rütben', ton: 'basari', ikon: 'onay'}) : pz.kesin >= r.esik ? GM.durumRozet({metin: 'Geçildi', ton: 'notr', ikon: 'circle-check'}) : '', duz: true}; })}
  ]; };
  const liderlikHtml = pz => {
    const ay = bugun().slice(0, 7), buAy = pz.h.filter(x => x.durum === 'kesin' && x.tarih.startsWith(ay)).reduce((t, x) => t + x.tutar, 0), gor = tum().gizlilik?.liderlik !== false;
    return [
      {html: GM.stat([{deger: GM.sayi(buAy), etiket: 'Bu ay kesinleşen'}, {deger: pz.rutbe.ad, etiket: 'Rütbe'}])},
      {html: GM.bant({ton: 'bilgi', ikon: 'ranking-star', baslik: 'Liderlik yalnız senin yerini gösterir', metin: 'Sıralama ay sonunda **kesinleşen puanla** hesaplanır; başka üyelerin adı ve puanı gösterilmez.'})},
      {satirlar: [{ikon: 'eye', baslik: 'Liderlikte görün', alt: gor ? 'Açık · adınla sayılırsın' : 'Kapalı · anonim sayılırsın', git: '#/ayarlar/gizlilik'}]}
    ];
  };
  GM.ekran('puan', {
    tur: 'alt', baslik: 'Puan Durumu', ust: '#/profil', iskelet: 'liste', yenile: true, yukle: bekle, cekYenile: bekle,
    bos: {ikon: 'puanDada', baslik: 'Henüz puan hareketin yok', metin: 'Değerlendirme yaz, mekân öner ya da rezervasyonunu gerçekleştir; **Dada Puan** biriksin.', eylem: {metin: 'Mekânları keşfet', git: '#/mekanlar'}},
    ciz: ctx => {
      const pz = puanOzet(), s = pz.sonraki, sek = sekmeAl(ctx, PUAN_SEKME, 'defter');
      const govde = {defter: () => defterHtml(ctx, pz), koleksiyon: koleksiyonHtml, kademe: () => kademeHtml(pz), liderlik: () => liderlikHtml(pz)}[sek]();
      return GM.gruplar([
        {html: `<div class="gm-yigin-12">${GM.stat([{deger: GM.sayi(pz.kesin), etiket: 'Kesinleşen'}, {deger: GM.sayi(pz.bekleyen), etiket: 'Bekleyen'}, {deger: pz.rutbe.ad, etiket: 'Rütbe'}])}${s ? GM.ilerleme({n: pz.kesin - pz.rutbe.esik, hedef: s.esik - pz.rutbe.esik, etiket: `${s.ad} rütbesine`, deger: `${GM.sayi(s.esik - pz.kesin)} puan kaldı`}) : ''}</div>`},
        {html: segment('puan-sekme', sek, PUAN_SEKME)},
        ...govde
      ]);
    },
    sonra: (kok, ctx) => {
      const c = [
        (segOdak(kok), GM.on(kok, 'puan-sekme', v => { ctx.sekme = v; GM.tazele(); })),
        GM.eylem(kok, 'rozet', el => rozetSheet(el.dataset.id)),
        GM.eylem(kok, 'sayfa', el => { ctx.sayfa = +el.dataset.id; GM.tazele(); kok.querySelector('.gm-sayfalama')?.closest('.gm-grup')?.scrollIntoView({block: 'start'}); })
      ];
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // Listelerim (#/profil/listeler) ve liste detayı (#/profil/liste/:id)
  // =====================================================================
  const LISTE_SEKME = [['listeler', 'Listelerim'], ['paylasilan', 'Paylaştığım'], ['taslak', 'Taslaklar']];
  const listeSatir = x => { const m = M(x.kalem[0]); return GM.satir({gorsel: m?.kapak, ikon: m ? undefined : 'list-ul', baslik: x.ad, alt: `${sayiEk(x.kalem.length, 'mekân')} · ${GORUNUR[x.gorunurluk] || GORUNUR.ozel}`, git: `#/profil/liste/${x.id}`}); };
  const listeForm = (x = {}) => `<div class="gm-yigin">${GM.input({ad: 'ls-ad', etiket: 'Liste adı', zorunlu: true, deger: x.ad, yer: 'Ör. Ege kaçamağı'})}${GM.alan({etiket: 'Kimler görebilir?', html: `<div class="gm-yigin-8" role="radiogroup" aria-label="Kimler görebilir?">${Object.entries(GORUNUR).map(([k, a]) => GM.radio({ad: 'ls-gor', deger: k, etiket: a, alt: k === 'ozel' ? 'Yalnız sen görürsün' : 'Bağlantıyı paylaştığın herkes açar', secili: (x.gorunurluk || 'ozel') === k})).join('')}</div>`})}${GM.input({ad: 'ls-aciklama', etiket: 'Açıklama (isteğe bağlı)', cokSatir: true, deger: x.aciklama, yer: 'Bu listeyi neden kurdun?'})}</div>`;
  const formOku = d => ({ad: (d.querySelector('[name="ls-ad"]')?.value || '').trim().slice(0, 64), gorunurluk: d.querySelector('[name="ls-gor"]:checked')?.value || 'ozel', aciklama: (d.querySelector('[name="ls-aciklama"]')?.value || '').trim()});
  GM.ekran('listelerim', {
    tur: 'alt', baslik: 'Listelerim', ust: '#/profil', iskelet: 'liste', yenile: true, yukle: bekle, cekYenile: bekle,
    ciz: ctx => {
      const l = listeler(), s = sekmeAl(ctx, LISTE_SEKME, 'listeler');
      const g = {listeler: l.filter(x => !x.taslak), paylasilan: l.filter(x => !x.taslak && x.gorunurluk === 'paylasilabilir'), taslak: l.filter(x => x.taslak)};
      const sabit = s === 'listeler' ? [{ikon: 'favori', baslik: 'Gurme Favorilerim', alt: `${sayiEk(favMekan().length, 'mekân')} · sabit liste`, git: '#/profil/favoriler'}, {ikon: 'rota', baslik: 'Gastronomi rotalarım', alt: sayiEk(rotalar().length, 'kayıtlı rota'), git: '#/rota/rotalarim'}] : [];
      const BOS = {listeler: ['list-ul', 'Henüz listen yok', 'Mekânları **kendi listelerinde** topla: bir hafta sonu kaçamağı, iş yemeği, doğum günü.'], paylasilan: ['paylas', 'Paylaştığın liste yok', 'Bir listeyi **bağlantısı olan görebilir** yaparsan burada görünür.'], taslak: ['duzenle', 'Taslak listen yok', 'Yarım bıraktığın listeler **burada** bekler.']}[s];
      return GM.gruplar([
        {html: `<div class="gm-yigin-12">${segment('ls-sekme', s, LISTE_SEKME.map(([k, a]) => [k, a, g[k].length]))}${GM.ilerleme({etiket: 'Ücretsiz pakette liste', n: Math.min(l.length, SINIR()), hedef: SINIR(), deger: `${l.length} / ${SINIR()} liste`})}</div>`},
        sabit.length && {satirlar: sabit},
        g[s].length ? {baslik: s === 'listeler' ? 'Mekân listelerim' : null, satirlar: g[s].map(listeSatir)} : {html: bosKucuk({ikon: BOS[0], baslik: BOS[1], metin: BOS[2]})}
      ]);
    },
    altBar: () => GM.altEylem({dugmeler: [{metin: 'Yeni liste', ikon: 'ekle', tam: true, veri: {eylem: 'ls-yeni'}}]}),
    sonra: (kok, ctx) => {
      const c = [
        GM.on(kok, 'ls-sekme', v => { ctx.sekme = v; GM.tazele(); }),
        GM.eylem(kok, 'ls-yeni', () => (listeler().length >= SINIR() ? sinirSheet() : GM.sheet({baslik: 'Yeni liste', html: listeForm(), altBar: GM.btnIkili({metin: 'Vazgeç', attrs: 'data-sheet-kapat'}, {metin: 'Oluştur', ikon: 'onay', veri: {eylem: 'ls-olustur'}}), sonra: d => GM.eylem(d, 'ls-olustur', () => {
          const f = formOku(d);
          if (!f.ad) { d.querySelector('[name="ls-ad"]')?.closest('.gm-alan')?.classList.add('is-hata'); GM.toast('Listeye bir **ad** ver', {tur: 'hata'}); return; }
          const id = `l-${Date.now()}`;
          GM.durum.yaz('listeler', [...oku('listeler', []), {id, ...f, taslak: false, kalem: [], guncel: bugun()}]);
          d.kapat(); GM.toast(`**${f.ad}** oluşturuldu`, {tur: 'basari'}); GM.git(`#/profil/liste/${id}`);
        })})))
      ];
      return () => c.forEach(f => f());
    }
  });
  const LISTE_SIRA = [['eklenme', 'Eklenme'], ['ad', 'Ada göre'], ['sehir', 'Şehre göre']];
  GM.ekran('liste', {
    tur: 'alt', ust: '#/profil/listeler', iskelet: 'liste', yenile: true,
    baslik: ctx => listeler().find(x => x.id === ctx.param.id)?.ad || 'Liste',
    ciz: ctx => {
      if (!GM.uye()) return GM.girisGerekli({ikon: 'list-ul', baslik: 'Listelerin', metin: 'Mekânları **kendi listelerinde** toplamak için giriş yap.'});
      const x = listeler().find(y => y.id === ctx.param.id);
      if (!x) return GM.hataEkran({tur: 'bulunamadi', eylem: {metin: 'Listelerim', ikon: 'list-ul', yerine: '#/profil/listeler'}});
      const sira = LISTE_SIRA.some(([k]) => k === ctx.sira) ? ctx.sira : 'eklenme';
      const l = x.kalem.map(M).filter(Boolean);
      if (sira === 'ad') l.sort((a, b) => a.ad.localeCompare(b.ad, 'tr')); else if (sira === 'sehir') l.sort((a, b) => `${a.il}${a.ilce}`.localeCompare(`${b.il}${b.ilce}`, 'tr'));
      return GM.gruplar([
        {html: `<div class="gm-yigin-12"><div class="gm-ara"><span class="gm-t-sub">${GM.esc(sayiEk(l.length, 'mekân'))}</span>${GM.durumRozet({metin: x.taslak ? 'Taslak' : GORUNUR[x.gorunurluk] || GORUNUR.ozel, ton: 'notr', ikon: x.gorunurluk === 'paylasilabilir' ? 'link' : 'lock'})}</div>${x.aciklama ? GM.p(x.aciklama, {ton: 'ikincil'}) : ''}<div class="gm-ikili">${GM.btn({metin: 'Düzenle', ikon: 'duzenle', tur: 'secondary', veri: {eylem: 'ls-duzenle'}})}${GM.btn({metin: 'Paylaş', ikon: 'paylas', tur: 'secondary', veri: {eylem: 'ls-paylas'}})}</div></div>`},
        l.length ? {html: `<div class="gm-yigin-12">${segment('ls-sira', sira, LISTE_SIRA)}${GM.satirlar(l.map(m => GM.satirKap(GM.satir({gorsel: m.kapak, baslik: m.ad, alt: [m.kategori, yer(m)].filter(Boolean).join(' · '), git: `#/mekan/${m.slug}`, ok: false}), GM.ikonBtn({ikon: 'kapat', etiket: `${m.ad}: listeden çıkar`, veri: {eylem: 'ls-cikar', id: m.slug}}))))}</div>`}
          : {html: bosKucuk({ikon: 'list-ul', baslik: 'Bu liste boş', metin: 'Mekân sayfasında **Listeye ekle** ile bu listeyi doldur.', eylem: {metin: 'Mekânları keşfet', git: '#/mekanlar'}})}
      ]);
    },
    sonra: (kok, ctx) => {
      if (!GM.uye()) return null;
      const x = () => listeler().find(y => y.id === ctx.param.id);
      const c = [
        GM.on(kok, 'ls-sira', v => { ctx.sira = v; GM.tazele(); }),
        GM.eylem(kok, 'ls-cikar', el => {
          const y = x(); if (!y) return; const once = anlik(['liste-degisim', 'mekan-liste']);
          listeDegis(y.id, {kalem: y.kalem.filter(s => s !== el.dataset.id)});
          if (y.kul) GM.durum.yaz('mekan-liste', oku('mekan-liste', []).filter(k => !(k.slug === el.dataset.id && k.liste === y.ad)));
          GM.tazele(); geriToast(once, 'Listeden **çıkarıldı**');
        }),
        GM.eylem(kok, 'ls-paylas', () => {
          const y = x(); if (!y) return;
          const ac = () => GM.paylas({baslik: y.ad, url: `https://dadagourmet.com/hesabim/listeler/${y.id}`, alt: `${sayiEk(y.kalem.length, 'mekân')} · Dada Gourmet listesi`});
          if (y.gorunurluk === 'paylasilabilir' && !y.taslak) { ac(); return; }
          GM.dialog({baslik: 'Bağlantı açılsın mı?', metin: 'Bu liste **gizli**. Paylaşmak için görünürlüğü **bağlantısı olan görebilir** yapalım mı?', eylem: 'Aç ve paylaş', iptal: 'Vazgeç'}).then(ok => { if (!ok) return; listeDegis(y.id, {gorunurluk: 'paylasilabilir', taslak: false}); GM.tazele(); ac(); });
        }),
        GM.eylem(kok, 'ls-duzenle', () => {
          const y = x(); if (!y) return;
          GM.sheet({baslik: 'Listeyi düzenle', html: `<div class="gm-yigin">${listeForm(y)}${GM.btn({metin: 'Listeyi sil', ikon: 'sil', tur: 'yikici-metin', tam: true, veri: {eylem: 'ls-sil'}})}</div>`, altBar: GM.btnIkili({metin: 'Vazgeç', attrs: 'data-sheet-kapat'}, {metin: 'Kaydet', ikon: 'onay', veri: {eylem: 'ls-kaydet'}}), sonra: d => {
            const a = GM.eylem(d, 'ls-kaydet', () => { const f = formOku(d); if (!f.ad) { GM.toast('Listeye bir **ad** ver', {tur: 'hata'}); return; } listeDegis(y.id, {...f, taslak: false}); d.kapat(); GM.tazele(); GM.toast('Liste **güncellendi**', {tur: 'basari'}); });
            const b = GM.eylem(d, 'ls-sil', () => GM.dialog({baslik: 'Liste silinsin mi?', metin: `**${y.ad}** ve içindeki **${y.kalem.length} mekân** kaydı silinir; mekânlar favorilerinde kalır.`, eylem: 'Sil', iptal: 'Vazgeç', yikici: true}).then(ok => {
              if (!ok) return; const once = anlik(['liste-silinen']);
              GM.durum.yaz('liste-silinen', uniq([...oku('liste-silinen', []), y.id])); d.kapat(); GM.yerine('#/profil/listeler');
              GM.toast(`**${y.ad}** silindi`, {ikon: 'sil', eylem: 'Geri al', onEylem: () => geriYukle(once)});
            }));
            return () => { a(); b(); };
          }});
        })
      ];
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // Etkinliklerim (#/profil/etkinlikler): Katılacağım · Katıldığım · İlgilendiğim · Biletlerim
  // =====================================================================
  // Satır: başlık + tek meta (tür · tarih · yer), .gm-tek-satir (yığılma kuralı 1 ve 3).
  // Uzun fuar adlarında " – " sonrası alt başlıktır; satırda ana ad kalır, tam ad detayda.
  const etkSatir = e => GM.satir({gorsel: e.gorsel, baslikHtml: `<span class="gm-kirp-1">${GM.esc(e.ad.split(' – ')[0])}</span>`, ek: GM.mekanMetaSatir([e.tur, etkinlikTarih(e), e.yer].filter(Boolean).map(GM.esc)), git: `#/etkinlik/${e.slug}`});
  const ETK_SEKME = [['katilacagim', 'Katılacağım'], ['katildigim', 'Katıldığım'], ['ilgilendigim', 'İlgilendiğim'], ['biletler', 'Biletlerim']];
  GM.ekran('etkinliklerim', {
    tur: 'alt', baslik: 'Etkinliklerim', ust: '#/profil', iskelet: 'liste', yenile: true, yukle: bekle, cekYenile: bekle,
    ciz: ctx => {
      const g = {katilacagim: katilacagim(), katildigim: katildigim(), ilgilendigim: favEtkinlik().filter(s => !katilim().includes(s)), biletler: []};
      const s = sekmeAl(ctx, ETK_SEKME, 'katilacagim'), l = g[s];
      const BOS = {
        katilacagim: {ikon: 'etkinlik', baslik: 'Katılacağın etkinlik yok', metin: 'Lezzet Takvimi’nde bir etkinliğe **Katılacağım** de; hatırlatma kurarız.', eylem: {metin: 'Etkinlikler', git: '#/etkinlikler'}},
        katildigim: {ikon: 'gecmis', baslik: 'Geçmiş etkinliğin yok', metin: 'Katıldığın etkinlikler bittikten sonra **burada** kalır.'},
        ilgilendigim: {ikon: 'kaydet', baslik: 'İlgilendiğin etkinlik yok', metin: 'Etkinlik kartındaki **kaydet** ile ilgilendiklerini topla.', eylem: {metin: 'Etkinlikler', git: '#/etkinlikler'}},
        biletler: {ikon: 'ticket', baslik: 'Biletlerin burada değil', metin: 'Bilet satışı **Dada Gourmet üzerinden yapılmıyor**; biletini etkinliğin kendi satış noktasından alırsın. Katılacağın etkinlikler Katılacağım sekmesinde.', eylem: {metin: 'Katılacağım', tur: 'secondary', veri: {eylem: 'etk-katilacagim'}}}
      };
      return GM.gruplar([
        {html: segment('etk-sekme', s, ETK_SEKME.map(([k, a]) => [k, a, k === 'biletler' ? null : g[k].length]), {kaydir: true})},
        l.length ? {satirlar: l.map(x => etkSatir(E(x)))} : {html: bosKucuk(BOS[s])},
        {baslik: 'Etkinlik kayıtların', satirlar: [
          {ikon: 'yildiz', baslik: 'Etkinlik değerlendirmelerim', git: '#/profil/degerlendirmeler'},
          {ikon: 'ekle', baslik: 'Etkinlik önerilerim', alt: 'Topluluk katkıların', git: '#/profil/katkilar'},
          {ikon: 'festival', baslik: 'Etkinlik öner', alt: 'Lezzet Takvimi’nde olmayan bir etkinlik', git: '#/etkinlik-oner'}
        ]}
      ]);
    },
    sonra: (kok, ctx) => {
      segOdak(kok);
      const c = [GM.on(kok, 'etk-sekme', v => { ctx.sekme = v; GM.tazele(); }), GM.eylem(kok, 'etk-katilacagim', () => { ctx.sekme = 'katilacagim'; GM.tazele(); })];
      return () => c.forEach(f => f());
    }
  });

  // =====================================================================
  // Keşif Tercihlerim (#/profil/tercihler): web 8 alan, tek kaydet akışı (Kaydet / Vazgeç). Misafirde bu cihazda tutulur.
  // =====================================================================
  const tercihCip = (g, sec) => GM.cipler({ad: `tr-${g.a}`, tur: 'coklu', serit: false, secili: sec, etiket: g.baslik, ogeler: g.secenek.map(([ad, ikon, etiket]) => ({metin: etiket || ad, deger: ad, ikon: ikon || undefined}))});
  GM.ekran('tercihler', {
    tur: 'alt', baslik: 'Keşif tercihlerim', ust: '#/profil', iskelet: 'satir',
    ciz: ctx => {
      const t = ctx.taslak || tercih(), G = H().tercihGruplari || [], n = G.reduce((s, g) => s + (t[g.a] || []).length, 0);
      return GM.gruplar([
        {html: `<div class="gm-yigin-12">${GM.p('Seçimlerin kaydedilir; **mekân, rota ve 12.30 / 19.00 önerilerinde** kullanılır. Rehberde henüz mekânı olmayan bir mutfağı da seçebilirsin.', {ton: 'ikincil'})}${GM.uye() ? '' : GM.kanca({metin: 'Üye olunca tercihlerin hesabına geçer', ikon: 'profil'})}</div>`},
        ...G.map(g => ({baslik: g.baslik, eylem: {html: `<span class="gm-t-meta gm-ton-ikincil">${(t[g.a] || []).length ? `${(t[g.a] || []).length} seçili` : 'Seçilmedi'}</span>`}, html: `<div class="gm-yigin-8">${tercihCip(g, t[g.a] || [])}${g.a === 'alerjen' ? GM.veriYok('Eleme kesin güvence değildir; ciddi alerjide **mekâna doğrudan** sor.') : ''}</div>`})),
        {html: GM.veriYok(`Toplam **${n} seçim**`)}
      ]);
    },
    altBar: ctx => GM.altEylem({dugmeler: [{metin: 'Vazgeç', tur: 'secondary', pasif: !ctx.taslak, veri: {eylem: 'tr-vazgec'}}, {metin: 'Kaydet', ikon: 'onay', pasif: !ctx.taslak, veri: {eylem: 'tr-kaydet'}}]}),
    sonra: (kok, ctx) => {
      const G = H().tercihGruplari || [];
      const c = G.map(g => GM.on(kok, `tr-${g.a}`, v => {
        const t = {...(ctx.taslak || tercih())}, eski = t[g.a] || [];
        let yeniL = [].concat(v || []);
        if (g.tekil) { const ek = yeniL.filter(x => !eski.includes(x)); yeniL = ek.includes(g.tekil) ? [g.tekil] : yeniL.filter(x => x !== g.tekil); }
        t[g.a] = yeniL; ctx.taslak = t; GM.tazele();
      }));
      c.push(GM.eylem(kok, 'tr-vazgec', () => { ctx.taslak = null; GM.tazele(); GM.toast('Değişiklikler **geri alındı**', {ikon: 'rotate-left'}); }));
      c.push(GM.eylem(kok, 'tr-kaydet', el => GM.mesgul(el, GM.TK.motion.reveal).then(() => { GM.durum.yaz('kesif-tercih', ctx.taslak); ctx.taslak = null; GM.tazele(); GM.toast('Keşif tercihlerin **kaydedildi**', {tur: 'basari'}); })));
      return () => c.forEach(f => f());
    }
  });
})();
