/* Gourmet'e özgü bileşenler (Gastro/Diet'te yok). Her biri en yakın kanon ailesinden türer:
   mekân kartları → GMCard (gm-card / gm-feature / gm-tile sınıfları, aynı perde ve kaydet), satır → GM.satir ritmi, rozet → GM.rozet, çip → GM.cip.
   Veri: GMV.mekanlar (veri/mekanlar.js), GMV.rotalar. Puan kaynakta yoksa "★ –" yazılır (web); puan, yorum, görüntülenme uydurulmaz.
   API: GM.fiyat · GM.puan · GM.acikDurum · GM.nitelikler · GM.konumMetin · GM.mekanKart · GM.rotaKart · GM.durakKart · GM.rotaSerit · GM.etkinlikKart · GM.lezzetKart · GM.ilKart · GM.katmanCip · GM.sapma · GM.rotaOzet */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, at = GM.at, liste = (...a) => a.filter(Boolean).join(' ');
  const bg = src => (src ? ` style="background-image:url('${esc(src)}')"` : '');
  const foto = (src, ikon = 'mekan') => (src ? `<span class="gm-photo"${bg(src)}></span>` : `<span class="gm-photo is-yok" aria-hidden="true">${ik(ikon)}</span>`);

  // ---------- Küçük parçalar ----------
  // Fiyat seviyesi ₺–₺₺₺₺: dolu kısım kalın, kalan soluk (web disc-price-pill ile aynı bilgi).
  // Gilroy'da ₺ glifi yok: işaret Font Awesome turkish-lira-sign ile çizilir (aynı genişlik, aynı ağırlık).
  const lira = n => `<i class="fa-solid fa-turkish-lira-sign" aria-hidden="true"></i>`.repeat(n);
  GM.fiyat = (n, o = {}) => { n = +n || 0; if (!n) return ''; return `<span class="${liste('gm-fiyat', o.foto && 'is-foto', o.sinif)}" role="img" aria-label="Fiyat seviyesi ${n}/4"><b>${lira(n)}</b>${n < 4 ? `<s>${lira(4 - n)}</s>` : ''}</span>`; };
  // Puan: yıldız + değer (+ sayı). Değer yoksa "Yeni" (puan uydurulmaz).
  // Değerlendirme yoksa web gibi "★ –" (P:_kart-meta); "Yeni" yalnız ilk yayından sonraki 7 gün içindir (GM.yeniRozet).
  GM.puan = (o = {}) => o.deger == null
    ? `<span class="${liste('gm-puan', 'is-bos', o.foto && 'is-foto', o.sinif)}" role="img" aria-label="Henüz değerlendirme yok">${ik('yildiz')}<b>–</b></span>`
    : `<span class="${liste('gm-puan', o.buyuk && 'is-buyuk', o.foto && 'is-foto', o.sinif)}" role="img" aria-label="${esc(`Puan ${o.deger}${o.sayi ? `, ${o.sayi} değerlendirme` : ''}`)}">${ik('yildiz')}<b>${esc(String(o.deger).replace('.', ','))}</b>${o.sayi ? `<small>(${esc(o.sayi)})</small>` : ''}</span>`;
  // Açık/kapalı: nokta + metin. acik null ise çizilmez.
  GM.acikDurum = (acik, o = {}) => (acik == null ? '' : `<span class="${liste('gm-acik', acik ? 'is-acik' : 'is-kapali', o.foto && 'is-foto', o.sinif)}"><i aria-hidden="true"></i>${esc(o.metin || (acik ? 'Açık' : 'Kapalı'))}</span>`);
  // Doğrulanmış nitelik mikro ikonları (web kart-nitelik): yalnız ikon, ad aria-label; en çok n, fazlası +N.
  GM.nitelikler = (l = [], o = {}) => { if (!l.length) return ''; const n = o.en || 4, g = l.slice(0, n); return `<span class="${liste('gm-nitelik', o.etiketli && 'is-etiketli', o.sinif)}" role="list" aria-label="Doğrulanmış nitelikler">${g.map(x => `<span role="listitem" title="Doğrulanmış: ${esc(x.ad)}">${ik(x.ikon)}${o.etiketli ? `<span>${esc(x.ad)}</span>` : `<span class="gm-sr">Doğrulanmış: ${esc(x.ad)}</span>`}</span>`).join('')}${l.length > n ? `<span role="listitem" class="gm-nitelik-fazla">+${l.length - n}</span>` : ''}</span>`; };
  // Konum metni: global hiyerarşi ülke → şehir → ilçe → semt; kartta kısa (semt · ilçe), detayda uzun.
  GM.konumMetin = (m, tur = 'kisa') => (tur === 'uzun' ? [m.semt, m.ilce, m.il, m.ulke] : [m.semt || m.ilce, m.semt ? m.ilce : m.il]).filter(Boolean).join(tur === 'uzun' ? ' › ' : ', ');
  // Rota bağlamı: rotadan sapma süresi ve rotanın km'si ("+4 dk · 112. km"); yol üstü ≤1 km.
  GM.sapma = (o = {}) => `<span class="${liste('gm-sapma', o.dk <= 2 && 'is-yolustu', o.sinif)}">${ik(o.dk <= 2 ? 'yolUstu' : 'yon')}<b>${o.dk <= 2 ? 'Yol üstü' : `+${esc(o.dk)} dk`}</b>${o.km ? `<small>${esc(o.km)}. km</small>` : ''}</span>`;

  // ---------- Mekân kartı ----------
  // tur: buyuk (gm-feature 4:3, metin foto üstünde) · kompakt (gm-card 4:5; ızgara ve şerit) · yatay (gm-card--row) · satir (liste satırı) · harita (harita üstü kayan kart)
  // o: {git, kayitli, sapma:{dk,km}, mesafe:'1,2 km', sira, etiket (rota durumu; buyukte foto rozeti), etiketTon, etiketIkon, secili, eylem}
  // Yığılma kuralı (docs/YIGILMA-KURALI.md, Görev 10): foto altında en çok 2 satır — kalın ad (1 satır) · tek meta satırı (.gm-tek-satir: yer · ₺ · durum; asla kırılmaz,
  // ₺ bölünmez, sığmazsa önce yer kısalır). Kategori etiketi fotoğrafın sol üstünde rozet (tek rozet satırı), sağ üstte kaydet kutusu. Puan yoksa kartta hiç yazılmaz.
  // Satır türleri (foto yanda): etiket satırı · ad · tek meta satırı (en çok 3, başlık bloğu kuralı).
  const mekanGit = m => `#/mekan/${m.slug}`;
  const nokta = '<span class="gm-nokta" aria-hidden="true">·</span>';
  // Etiket: tek değer. "Restoran" genel olduğundan varsa mutfak öne geçer; Fine Dining / Otel Restoranı tür olarak kalır.
  GM.mekanEtiket = m => ((!m.kategori || m.kategori === 'Restoran') && m.mutfak?.[0]) || m.kategori || m.mutfak?.[0] || '';
  // Etiket büyük harfle yazılır: yabancı ad kendi dilinde büyür (lang="tr" altında "Fine Dining" → "FİNE DİNİNG" olmasın).
  const ETIKET_DIL = {'Fine Dining': 'en'};
  const dilAt = e => (ETIKET_DIL[e] ? ` lang="${ETIKET_DIL[e]}"` : '');
  GM.mekanEtiketSpan = (m, sinif) => { const e = GM.mekanEtiket(m); return e ? `<span class="${liste('gm-card__category', sinif)}"${dilAt(e)}>${esc(e)}</span>` : ''; };
  // Rozette kısa ad (webdeki kategori/mutfak adının kısaltması; yeni kategori yok): rozet dar ızgara kartında da tam okunur, "…" ile bitmez.
  const ETIKET_KISA = {'Otel Restoranı': 'Otel', 'Tematik Restoran': 'Tematik', 'Türk Mutfağı': 'Türk', 'Akdeniz Mutfağı': 'Akdeniz', 'Ege Mutfağı': 'Ege', 'İtalyan Mutfağı': 'İtalyan', 'Japon Mutfağı': 'Japon', 'Anadolu Mutfağı': 'Anadolu', 'Fransız Mutfağı': 'Fransız', 'Kebap / Ocakbaşı': 'Ocakbaşı'};
  GM.mekanEtiketKisa = m => { const e = GM.mekanEtiket(m); return ETIKET_KISA[e] || (e.endsWith(' Mutfağı') ? e.slice(0, -8) : e); };
  // Foto üstü rozet satırı (sol üst): kategori etiketi (+ ekranın vurgu rozeti, ör. "Dada Seçkisi"). Tek satır, kaydet kutusuyla çakışmaz.
  GM.mekanRozet = (m, o = {}) => { const e = GM.mekanEtiket(m), k = GM.mekanEtiketKisa(m); const l = [o.rozet ? `<span class="${liste('gm-mk-rozet', o.rozetTon && `is-${esc(o.rozetTon)}`)}">${esc(o.rozet)}</span>` : '', e ? `<span class="gm-mk-rozet is-etiket"${dilAt(e)}${k !== e ? ` title="${esc(e)}" aria-label="${esc(e)}"` : ''}>${esc(k)}</span>` : ''].filter(Boolean); return l.length ? `<div class="gm-mk-ust">${l.join('')}</div>` : ''; };
  // Kartta yer: ızgara ve satırda tek değer (ilçe), geniş kartta (büyük, TheFork, editoryal, OpenTable) "semt, ilçe".
  GM.mekanYer = (m, genis) => `<span class="gm-mk-yer">${esc(genis ? GM.konumMetin(m) : m.ilce || m.semt || m.il || '')}</span>`;
  // Puan yalnız gerçekten varsa (uydurma yok; boş "★ –" kartta gürültü).
  GM.mekanPuan = (m, o = {}) => (m.puan == null ? '' : GM.puan({deger: m.puan, foto: o.foto}));
  // Durum: rota sapması > ekranın rota etiketi > mesafe > (geniş kartta rezervasyon) ; yoksa açık/kapalı. Geniş kartta açık/kapalı + bir ek durum. l: {genis, km}
  GM.mekanDurum = (m, o = {}, l = {}) => {
    const ek = o.sapma ? GM.sapma({dk: o.sapma.dk, km: l.km ? o.sapma.km : null})
      : o.etiket ? `<span class="${liste('gm-mk-durum', o.etiketTon && `is-${esc(o.etiketTon)}`)}">${o.etiketIkon ? ik(o.etiketIkon) : ''}${esc(o.etiket)}</span>`
      : o.mesafe ? `<span class="gm-mk-mesafe">${ik('pin')}${esc(o.mesafe)}</span>`
      : l.genis && m.rezervasyon ? `<span class="gm-mk-rez">${ik('rezervasyon')}Rezervasyon</span>` : '';
    return l.genis ? [GM.acikDurum(m.acik, {foto: l.foto}), ek] : [ek || GM.acikDurum(m.acik)];
  };
  // Meta satırı: parçalar nokta ile, .gm-tek-satir (asla kırılmaz; yer kısalır, gerekirse kaydırılır ve sağda solar).
  // Görev 12 (denetim): görünür metni ya da ikonu olmayan parça (boş fiyat kabı) süzülür; "Ürgüp · · Açık" gibi çift ayraç kalmaz.
  GM.mekanMetaSatir = (l = [], o = {}) => { const p = l.flat().filter(x => x && (String(x).replace(/<[^>]*>/g, '').trim() || /<(i|svg|img)\b/.test(String(x)))); return p.length ? `<span class="${liste('gm-mk-meta gm-tek-satir', o.foto && 'is-foto', o.sinif)}">${p.join(nokta)}</span>` : ''; };
  const kaydet = (m, o, kutu) => `<button class="${liste('gm-save', kutu && 'gm-mk-kaydet')}" type="button" aria-label="Favorilere ekle" aria-pressed="${!!o.kayitli}" data-eylem="kaydet" data-id="${esc(m.slug)}">${ik('favori')}</button>`;
  const ad = (m, o, git, etiketli) => `<a class="gm-card__text" href="${esc(git)}" data-git="${esc(git)}">${etiketli ? GM.mekanEtiketSpan(m) : ''}<h3 class="gm-card__title">${o.sira ? `<span class="gm-mk-sira">${esc(o.sira)}</span>` : ''}${esc(m.ad)}</h3></a>`;
  // Satır türleri: etiket · ad · tek meta (puan · yer · ₺ · durum).
  const satirMeta = (m, o, l = {}) => GM.mekanMetaSatir([GM.mekanPuan(m), GM.mekanYer(m), GM.fiyat(m.fiyat), GM.mekanDurum(m, o, l)]);
  GM.mekanKart = (m, o = {}) => {
    const tur = o.tur || 'kompakt', git = o.git || mekanGit(m), gorsel = `href="${esc(git)}" data-git="${esc(git)}" tabindex="-1" aria-label="${esc(m.ad)}"`;
    if (tur === 'buyuk') return `<article class="gm-feature gm-mk is-buyuk"><div class="gm-feature__media"><a class="gm-feature__visual" ${gorsel}>${foto(m.kapakB || m.kapak)}</a><span class="gm-feature__veil" aria-hidden="true"></span>${GM.mekanRozet(m, {rozet: o.etiket, rozetTon: o.etiketTon})}${kaydet(m, o, true)}<div class="gm-feature__info">${ad(m, o, git)}${GM.mekanMetaSatir([GM.mekanPuan(m, {foto: true}), GM.mekanYer(m, true), GM.fiyat(m.fiyat, {foto: true}), GM.mekanDurum(m, {...o, etiket: null}, {foto: true})], {foto: true})}</div></div></article>`;
    if (tur === 'yatay') return `<article class="gm-card gm-card--row gm-mk is-yatay"><div class="gm-card__media"><a class="gm-card__visual" ${gorsel}>${foto(m.kapak)}</a></div><div class="gm-card__body">${ad(m, o, git, true)}${satirMeta(m, o)}</div>${kaydet(m, o)}</article>`;
    if (tur === 'satir') return `<article class="gm-mk-satir${o.secili ? ' is-secili' : ''}" data-mekan="${esc(m.slug)}"><a class="gm-mk-satir-foto" ${gorsel}>${foto(m.kapak)}${o.sira ? `<span class="gm-mk-sira is-foto">${esc(o.sira)}</span>` : ''}</a><div class="gm-mk-satir-metin">${ad(m, {...o, sira: null}, git, true)}${satirMeta(m, o)}</div>${kaydet(m, o)}</article>`;
    if (tur === 'harita') return `<article class="gm-mk-harita${o.secili ? ' is-secili' : ''}" data-mekan="${esc(m.slug)}"><a class="gm-mk-harita-foto" ${gorsel}>${foto(m.kapak)}</a><div class="gm-mk-satir-metin">${ad(m, o, git, true)}${satirMeta(m, o, {km: true})}</div>${o.eylem ? `<div class="gm-mk-eylem gm-ikili">${o.eylem}</div>` : ''}</article>`;
    return `<article class="gm-card gm-mk is-kompakt"><div class="gm-card__media"><a class="gm-card__visual" ${gorsel}>${foto(m.kapak)}</a>${GM.mekanRozet(m)}${kaydet(m, o, true)}</div><div class="gm-card__body">${ad(m, o, git)}${GM.mekanMetaSatir([GM.mekanPuan(m), GM.mekanYer(m), GM.fiyat(m.fiyat), GM.mekanDurum(m, o)])}</div></article>`;
  };
  // .gm-tek-satir sağ solması yalnız satır taşınca: sığan satıra is-sigar (Görev 10; sığan son öğe solmasın). Çizimden ve boyuttan sonra bir kez ölçülür.
  // Kartta kısalan yer adı (.gm-mk-yer) "…" yerine solarak biter: Gilroy'da "…" glifi yok, tarayıcı kırpınca sağda boşluk bırakıyordu.
  const sigarOlc = () => { document.querySelectorAll('.gm-tek-satir').forEach(e => { if (e.clientWidth) e.classList.toggle('is-sigar', e.scrollWidth <= e.clientWidth + 1); }); document.querySelectorAll('.gm-mk-meta > .gm-mk-yer').forEach(e => { if (e.clientWidth) e.classList.toggle('is-kesik', e.scrollWidth > e.clientWidth + 1); }); };
  let sigarBekle = 0; const sigarIste = () => { cancelAnimationFrame(sigarBekle); sigarBekle = requestAnimationFrame(sigarOlc); };
  new MutationObserver(sigarIste).observe(document.documentElement, {childList: true, subtree: true});
  addEventListener('resize', sigarIste); document.fonts?.ready.then(sigarIste);

  // ---------- Rota ----------
  // Rota özeti: "480 km · 5 sa 40 dk · 6 durak"
  // durak: kullanıcının rotaya eklediği duraklar; mekan: önerilen gurme durak sayısı (GM.rotaOneri, tek kaynak).
  GM.rotaOzet = r => [r.km != null ? `${GM.sayi(r.km)} km` : '', r.dk != null ? GM.sure(r.dk) : '', r.durak != null ? `${r.durak} durak` : r.mekan != null ? `${r.mekan} önerilen durak` : ''].filter(Boolean).join(' · ');
  // Rota kartı: tur kapak (dikey dergi kapağı + rota silueti) · satir (küçük şema + metin) · genis (yatay kapak). ilerleme: {n, toplam}
  // Sayıya iyelik eki (3. tekil): okunuşun son sözcüğüne göre ünlü uyumu ve kaynaştırma. 1’i 2’si 3’ü 6’sı 9’u 10’u 40’ı 100’ü 0’ı.
  GM.sayiEk = n => { const v = Math.abs(Math.trunc(+n || 0)), s = String(v);
    const EK1 = ['ı', 'i', 'si', 'ü', 'ü', 'i', 'sı', 'si', 'i', 'u'], EK10 = ['', 'u', 'si', 'u', 'ı', 'si', 'ı', 'i', 'i', 'ı'];
    const ek = v === 0 ? 'ı' : v % 10 ? EK1[v % 10] : v % 100 ? EK10[(v % 100) / 10] : v % 1000 ? 'ü' : v % 1e6 ? 'i' : 'u';
    return `${s}’${ek}`; };
  GM.rotaKart = (r, o = {}) => {
    const tur = o.tur || 'kapak', git = o.git || `#/rota/${r.id}`;
    const sema = tur === 'satir' ? GM.rotaCizgi({rota: {cizgi: r.cizgi}, pinler: (r.duraklar || []).map((d, i, a) => ({lng: d.lng, lat: d.lat, uc: i === 0 || i === a.length - 1})), w: 112, h: 112, dolgu: {top: 14, right: 14, bottom: 14, left: 14}}) : GM.rotaKapakCizgi({rota: {cizgi: r.cizgi}, iller: r.iller, w: 280, h: tur === 'genis' ? 150 : 200});
    const ilerleme = o.ilerleme ? `<span class="gm-rk-ilerleme" role="progressbar" aria-valuenow="${o.ilerleme.n}" aria-valuemax="${o.ilerleme.toplam}" aria-label="${esc(`${o.ilerleme.toplam} duraktan ${o.ilerleme.n} tamam`)}"><i style="--oran:${(o.ilerleme.n / o.ilerleme.toplam).toFixed(3)}"></i></span><small class="gm-rk-ilerleme-metin">${esc(o.ilerleme.toplam)} duraktan ${esc(GM.sayiEk(o.ilerleme.n))}</small>` : '';
    if (tur === 'satir') return `<a class="gm-rk-satir" href="${esc(git)}" data-git="${esc(git)}"><span class="gm-rk-satir-sema">${sema}</span><span class="gm-satir-metin"><small class="gm-card__category">${esc(r.etiket || r.tema || 'Rota')}</small><b>${esc(r.ad)}</b><small>${esc(GM.rotaOzet(r))}</small>${ilerleme}</span>${ik('satirOk', 'gm-satir-ok')}</a>`;
    return `<article class="${liste('gm-rk', `is-${tur}`, o.sinif)}"><a class="gm-rk-kapak" href="${esc(git)}" data-git="${esc(git)}" aria-label="${esc(r.ad)}">${r.gorsel ? `<span class="gm-photo"${bg(r.gorsel)}></span><span class="gm-rk-perde" aria-hidden="true"></span>` : ''}<span class="gm-rk-sema">${sema}</span><span class="gm-rk-metin"><small class="gm-rk-etiket">${esc(r.etiket || r.tema || 'Dada Route')}</small><b class="gm-rk-ad">${esc(r.ad)}</b><span class="gm-rk-ozet">${esc(GM.rotaOzet(r))}</span>${ilerleme}</span></a>${o.kaydet === false ? '' : `<button class="gm-save" type="button" aria-label="Rotayı kaydet" aria-pressed="${!!o.kayitli}" data-eylem="kaydet" data-id="${esc(r.id)}">${ik('kaydet')}</button>`}</article>`;
  };
  // Durak kartı: rota üstü durak (mekân ya da katman). o: {sira, sapma, eklendi, eylem:false, kucuk}
  GM.durakKart = (d, o = {}) => {
    const tur = d.tur || 'mekan', m = d.mekan, ad = m ? m.ad : d.ad, git = m ? `#/mekan/${m.slug}` : null;
    const ikonKutu = m?.kapak ? `<span class="gm-dk-foto">${foto(m.kapak)}</span>` : `<span class="gm-dk-ikon is-${esc(tur)}">${ik(d.ikon || {neYenir: 'neYenir', neAlinir: 'neAlinir', yakit: 'yakit', sarj: 'sarj', ibadet: 'ibadet', dinlenme: 'dinlenme', karavan: 'karavan', cografi: 'cografi'}[tur] || 'durak')}</span>`;
    const alt = [d.alt || (m ? [m.kategori, m.il].filter(Boolean).join(' · ') : ''), m ? GM.fiyat(m.fiyat) : ''].filter(Boolean);
    const eylem = o.eylem === false ? '' : o.eklendi ? GM.btn({metin: 'Rotada', ikon: 'onay', tur: 'tonal', boyut: 'sm', veri: {eylem: 'durak-cikar', id: d.id}, attrs: 'aria-pressed="true"'}) : GM.btn({metin: 'Ekle', ikon: 'ekle', tur: 'secondary', boyut: 'sm', veri: {eylem: 'durak-ekle', id: d.id}});
    return `<article class="${liste('gm-dk', `is-${tur}`, o.kucuk && 'is-kucuk', o.secili && 'is-secili', o.sinif)}" data-durak="${esc(d.id || '')}">${o.sira != null ? `<span class="gm-dk-sira">${esc(o.sira)}</span>` : ''}${ikonKutu}<${git ? `a href="${esc(git)}" data-git="${esc(git)}"` : 'div'} class="gm-satir-metin"><b class="gm-kirp-1">${esc(ad)}</b>${alt.length ? `<small class="gm-kirp-1">${alt.map(x => x.startsWith('<') ? x : esc(x)).join('<span class="gm-nokta" aria-hidden="true">·</span>')}</small>` : ''}${o.sapma ? GM.sapma(o.sapma) : ''}</${git ? 'a' : 'div'}>${eylem}</article>`;
  };
  // Rota şeridi (itinerary): duraklar arası sürüş satırlı dikey çizelge. l: [{durak, sure:'35 dk', km, saat}]
  GM.rotaSerit = (l = [], o = {}) => `<ol class="${liste('gm-rs', o.sinif)}">${l.map((x, i) => `<li class="${liste('gm-rs-oge', i === 0 && 'is-ilk', i === l.length - 1 && 'is-son', x.gecildi && 'is-gecildi', x.simdi && 'is-simdi')}"><span class="gm-rs-ray" aria-hidden="true"><i>${x.uc ? ik(i === 0 ? 'baslangic' : 'varis') : esc(x.sira ?? i)}</i></span><div class="gm-rs-icerik">${x.saat ? `<small class="gm-rs-saat">${esc(x.saat)}</small>` : ''}${x.uc ? `<div class="gm-rs-uc"><b>${esc(x.ad)}</b>${x.alt ? `<small>${esc(x.alt)}</small>` : ''}</div>` : GM.durakKart(x.durak, {eylem: x.eylem ?? false, sapma: x.sapma, kucuk: true, eklendi: x.eklendi})}${x.sonra ? `<p class="gm-rs-surus">${ik('arac')}<span>${esc(x.sonra)}</span></p>` : ''}</div></li>`).join('')}</ol>`;
  // Katman çipi (Yakıt, Şarj, İbadethane...): GM.cip ailesi, renkli ikon kutusu + sayı
  GM.katmanCip = (o = {}) => `<button type="button" class="${liste('gm-chip', 'gm-katman-cip', `is-${o.tur}`, o.kucuk && 'is-kucuk')}" aria-pressed="${!!o.secili}" data-cip="${esc(o.deger || o.tur)}"><span class="gm-katman-cip-ikon">${ik(o.ikon || o.tur)}</span><span>${esc(o.metin)}</span>${o.sayi != null ? `<span class="gm-chip-sayi">${esc(o.sayi)}</span>` : ''}</button>`;
  GM.katmanCipler = (o = {}) => `<div class="gm-serit${o.sinif ? ' ' + o.sinif : ''}" data-cip-grup="coklu" data-ad="${esc(o.ad || 'katman')}" role="group" aria-label="${esc(o.etiket || 'Katmanlar')}">${(o.ogeler || []).map(GM.katmanCip).join('')}</div>`;

  // ---------- Etkinlik, lezzet, il kartı ----------
  const AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  GM.tarihBlok = iso => { const [y, a, g] = String(iso || '').split('-').map(Number); return g ? `<span class="gm-tarih-blok" aria-label="${g} ${AY[a - 1]} ${y}"><b>${g}</b><small>${AY[a - 1]}</small></span>` : ''; };
  // Etkinlik kartı: tur kart (görsel 4:3 + tarih bloğu) · satir
  GM.etkinlikKart = (e, o = {}) => {
    const git = o.git || `#/etkinlik/${e.slug}`, yer = [e.yer, e.il].filter(Boolean).join(', ');
    if (o.tur === 'satir') return `<a class="gm-ek-satir" href="${esc(git)}" data-git="${esc(git)}">${GM.tarihBlok(e.tarih)}<span class="gm-satir-metin"><small class="gm-card__category">${esc(e.tur || 'Etkinlik')}</small><b class="gm-kirp-2">${esc(e.ad)}</b><small>${ik('pin')} ${esc(yer)}</small></span>${e.gorsel ? `<span class="gm-ek-satir-foto">${foto(e.gorsel, 'etkinlik')}</span>` : ''}</a>`;
    return `<article class="gm-card gm-ek"><div class="gm-card__media gm-ek-media"><a class="gm-card__visual" href="${esc(git)}" data-git="${esc(git)}" tabindex="-1" aria-label="${esc(e.ad)}">${foto(e.gorsel, 'etkinlik')}</a><span class="gm-ek-tarih">${GM.tarihBlok(e.tarih)}</span>${o.kaydet === false ? '' : `<button class="gm-save" type="button" aria-label="Takvime kaydet" aria-pressed="${!!o.kayitli}" data-eylem="kaydet" data-id="${esc(e.slug)}">${ik('kaydet')}</button>`}</div><div class="gm-card__body"><a class="gm-card__text" href="${esc(git)}" data-git="${esc(git)}"><span class="gm-card__category">${esc(e.tur || 'Etkinlik')}</span><h3 class="gm-card__title">${esc(e.ad)}</h3></a><div class="gm-mk-meta">${ik('pin')}<span class="gm-kirp-1">${esc(yer)}</span></div></div></article>`;
  };
  // Lezzet kartı (Ne Yenir? imza tabak / Ne Alınır? yöresel ürün): kare görsel + tür rozeti
  GM.lezzetKart = (l, o = {}) => { const tur = l.tur === 'alinir' ? 'neAlinir' : 'neYenir', git = o.git || (l.slug ? `#/lezzet/${l.slug}` : null); return `<${git ? `a href="${esc(git)}" data-git="${esc(git)}"` : 'div'} class="${liste('gm-lz', `is-${tur}`, o.sinif)}"><span class="gm-lz-foto">${foto(l.gorsel, tur)}<span class="gm-lz-tur">${ik(tur)}${tur === 'neAlinir' ? 'Ne Alınır?' : 'Ne Yenir?'}</span></span><b class="gm-kirp-2">${esc(l.ad)}</b>${l.alt ? `<small class="gm-kirp-1">${esc(l.alt)}</small>` : ''}</${git ? 'a' : 'div'}>`; };
  // İl/bölge kimlik kartı (coğrafi işaret): rotada bir ile girilince açılır. o: {km}
  GM.ilKart = (k, o = {}) => `<article class="${liste('gm-il', o.sinif)}"><div class="gm-il-bas"><span class="gm-dk-ikon is-cografi">${ik('cografi')}</span><span class="gm-satir-metin"><small class="gm-card__category">${esc(k.bolge || 'Coğrafi işaret')}${o.km != null ? ` · ${esc(o.km)}. km` : ''}</small><b>${esc(k.ad)}</b></span></div>${k.tescilli?.length ? `<ul class="gm-il-liste">${k.tescilli.map(x => `<li>${ik(x.tur === 'alinir' ? 'neAlinir' : 'neYenir')}<span>${esc(x.ad)}</span></li>`).join('')}</ul>` : ''}${k.metin ? `<p class="gm-kirp-2">${esc(k.metin)}</p>` : ''}</article>`;
})();
/* Veri erişimi: ekranlar veriye bu yardımcılarla ulaşır (Flutter'da depo katmanı karşılığı). */
(() => {
  GM.mekan = slug => (window.GMV?.mekanlar || []).find(m => m.slug === slug) || null;
  GM.rotaBul = id => (window.GMV?.rotalar || []).find(r => r.id === id) || null;
  // Rota durakları mekân nesnesiyle; o: {en: n, yolUstu: true (≤1 km), kapakli: true}
  GM.rotaDuraklari = (r, o = {}) => (r?.duraklar || []).map(d => ({...d, mekan: GM.mekan(d.slug)})).filter(d => d.mekan && (!o.yolUstu || d.uzak <= 1) && (!o.kapakli || d.mekan.kapakB)).slice(0, o.en || 99);
  // TEK KAYNAK (Görev 3): bir rotanın "önerilen gurme durakları" = rotaya ≤10 km, kapaklı, aynı ilçeden en çok 2 mekân, km sırasıyla.
  // Her ekran sayıyı buradan alır: önerilen (liste uzunluğu), yol üstü (önerilenden ≤1 km), eklenen (kullanıcının rotaya eklediği; rota-<id> durumu).
  GM.rotaOneri = r => { const ilce = {}; return GM.rotaDuraklari(r).filter(d => d.mekan.kapak && (ilce[d.mekan.ilce] = (ilce[d.mekan.ilce] || 0) + 1) <= 2).sort((a, b) => a.km - b.km); };
  GM.rotaSayi = r => { const l = GM.rotaOneri(r), e = GM.durum.oku(`rota-${r.id}`, null)?.eklenen || []; return {onerilen: l.length, yolUstu: l.filter(d => d.uzak <= 1).length, eklenen: e.length}; };
  GM.rotaSayiMetin = r => { const n = GM.rotaSayi(r); return `${n.onerilen} önerilen durak${n.yolUstu ? ` · ${n.yolUstu} yol üstü` : ''}`; };
  GM.rotaKatmani = (r, tur) => (r?.katman || []).filter(k => !tur || k.tur === tur);
  // Kart için rota özeti nesnesi: {id, ad, tema, km, dk, durak, cizgi, duraklar:[{lng,lat}], gorsel}
  GM.rotaKartVeri = (r, o = {}) => { const d = GM.rotaOneri(r), YER = window.GMV?.yerler || {}; const g = o.gorsel || d.find(x => x.mekan.kapakB)?.mekan.kapakB || d[0]?.mekan.kapak; return {id: r.id, ad: r.ad, tema: r.tema, etiket: o.etiket || r.tema, km: Math.round(r.km), dk: r.dk, durak: o.durak, mekan: d.length, cizgi: r.cizgi, iller: (r.iller || []).slice(1, -1).map(i => { const k = r.cizgi[Math.min(r.cizgi.length - 1, Math.round(i.km / r.km * (r.cizgi.length - 1)))]; return {lng: k[0], lat: k[1]}; }), duraklar: [{lng: r.cizgi[0][0], lat: r.cizgi[0][1]}, {lng: r.cizgi.at(-1)[0], lat: r.cizgi.at(-1)[1]}], gorsel: g}; };
})();
/* Ana sayfa parçaları (Dada Route başrolde). Kalıp: harita hero (Google Maps/Watch Duty), bilet kartı (Flighty), planlayıcı kapsülü (Citymapper).
   GM.haritaHero · GM.planlayici · GM.rotaBilet · GM.guvenSerit · GM.modulKart · GM.teaser · GM.reklamYeri */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, liste = (...a) => a.filter(Boolean).join(' ');
  // Harita hero: tam genişlik gerçek harita + üstte marka perdesi (beyaz logo okunur) + başlık + altta yüzen içerik (bilet).
  GM.haritaHero = (o = {}) => `<section class="${liste('gm-hh', o.sinif)}"><div class="${liste('gm-hh-ust', o.gorsel && 'has-gorsel')}">${o.gorsel ? `<span class="gm-bant-foto" style="background-image:url('${esc(o.gorsel)}')" aria-hidden="true"></span>` : ''}${o.ustEtiket ? `<small class="gm-hh-etiket">${esc(o.ustEtiket)}</small>` : ''}${o.baslik ? `<h1 class="gm-hh-baslik">${o.baslik}</h1>` : ''}${o.ust || ''}</div><div class="gm-hh-harita">${GM.harita({...o.harita, tam: true, kontroller: false, etiket: o.etiket || 'Rota haritası'})}<div class="gm-hh-alt">${o.alt || ''}</div></div></section>`;
  // Planlayıcı kapsülü: Nereden → Nereye; dokununca planlama ekranı. o: {nereden, nereye, git}
  GM.planlayici = (o = {}) => `<a class="${liste('gm-plan', o.koyu && 'is-koyu', o.sinif)}" href="${esc(o.git || '#/rota/planla')}" data-git="${esc(o.git || '#/rota/planla')}"><span class="gm-plan-ray" aria-hidden="true"><i></i><b></b><i></i></span><span class="gm-plan-alanlar"><span class="gm-plan-alan"><small>Nereden</small><b>${esc(o.nereden || 'Konumum')}</b></span><span class="gm-plan-alan"><small>Nereye</small><b class="${o.nereye ? '' : 'is-yer'}">${esc(o.nereye || 'Nereye gidiyorsun?')}</b></span></span><span class="gm-plan-git" aria-hidden="true">${ik('rota')}</span></a>`;
  // Rota bileti: üst etiket + rozet, kalkış ●──● varış, özet, eylem. Flighty bilet kalıbı, Gourmet kartı (r24, sh-md).
  GM.rotaBilet = (r, o = {}) => `<article class="${liste('gm-bilet', o.sinif)}"><header class="gm-bilet-bas"><small class="gm-card__category">${esc(o.etiket || 'Bugünün Rotası')}</small>${o.rozet ? `<span class="gm-bilet-rozet">${esc(o.rozet)}</span>` : ''}</header><div class="gm-bilet-yol"><span class="gm-bilet-uc"><small>Kalkış</small><b>${esc(r.kalkis)}</b></span><span class="gm-bilet-cizgi" aria-hidden="true"><i></i>${ik('arac')}<i></i></span><span class="gm-bilet-uc is-varis"><small>Varış</small><b>${esc(r.varis)}</b></span></div><p class="gm-bilet-ozet">${o.ozet || esc(GM.rotaOzet(r))}</p>${o.eylem ? `<div class="gm-bilet-eylem">${o.eylem}</div>` : ''}</article>`;
  // Güven satırı (web 1a): üç kısa vaat, ikonlu.
  GM.guvenSerit = l => `<ul class="gm-guven">${l.map(x => `<li>${ik(x.ikon)}<span>${x.metin}</span></li>`).join('')}</ul>`;
  // Keşif modülü (web "Nasıl keşfetmek istersin?" 2×2): görselli kare kart, ikon + ad + eylem fiili.
  GM.modulKart = (o = {}) => `<a class="${liste('gm-modul', o.ana && 'is-ana', o.sinif)}" href="${esc(o.git)}" data-git="${esc(o.git)}">${o.gorsel ? `<span class="gm-photo" style="background-image:url('${esc(o.gorsel)}')"></span><span class="gm-modul-perde" aria-hidden="true"></span>` : ''}<span class="gm-modul-ikon">${ik(o.ikon)}</span><span class="gm-modul-metin"><b>${esc(o.baslik)}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span><span class="gm-modul-fiil">${esc(o.fiil || 'Aç')}${ik('tumu')}</span></a>`;
  // Teaser (web Mekân Bul çağrısı): başlık, metin, hızlı çipler, düğme; tint yüzey.
  GM.teaser = (o = {}) => `<section class="${liste('gm-teaser', o.sinif)}">${o.ikon ? `<span class="gm-teaser-ikon">${ik(o.ikon)}</span>` : ''}<h2 class="gm-t-section">${esc(o.baslik)}</h2>${o.metin ? GM.p(o.metin) : ''}${o.cipler ? `<div class="gm-teaser-cipler">${o.cipler.map(c => `<a class="gm-chip" href="${esc(c.git)}" data-git="${esc(c.git)}">${c.ikon ? ik(c.ikon) : ''}<span>${esc(c.metin)}</span></a>`).join('')}</div>` : ''}${o.btn ? GM.btn({tam: true, ...o.btn}) : ''}</section>`;
  // Reklam yeri (web AS-* alanları): içerik değil, yer; boşken kibar yer tutucu.
  GM.reklamYeri = (o = {}) => `<aside class="gm-reklam" aria-label="Reklam"><small>Reklam</small><span>${esc(o.kod || '')}</span></aside>`;
})();
/* Gastro "Ne pişirsem?" arama paneli kalıbı (Gastro ana-v3 hero içi panel): sekmeli beyaz panel + tek alan + git düğmesi; popüler çipler (foto üstü); Gourmet: Rota / Mekân / Etkinlik. */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik;
  // o: {ad, sekmeler:[{ad, deger, yer, git, ikon}], secili}
  GM.aramaPanel = (o = {}) => { const S = o.sekmeler || [], sec = S.find(x => x.deger === o.secili) || S[0]; return `<div class="gm-arpanel" data-arpanel='${esc(JSON.stringify(S.map(x => ({deger: x.deger, yer: x.yer, git: x.git, ikon: x.ikon}))))}'>${GM.segment({ad: o.ad || 'arama-sekme', secili: sec.deger, ogeler: S.map(x => ({ad: x.ad, deger: x.deger}))})}<a class="gm-arpanel-alan" href="${esc(sec.git)}" data-git="${esc(sec.git)}"><span class="gm-arpanel-ikon">${ik(sec.ikon || 'ara_')}</span><span class="gm-arpanel-yer">${esc(sec.yer)}</span><span class="gm-arpanel-git" aria-hidden="true">${ik('tumu')}</span></a></div>`; };
  document.addEventListener('gm-degisim', ev => { const p = ev.target.closest?.('[data-arpanel]'); if (!p || !ev.target.matches('.gm-seg')) return; const x = JSON.parse(p.dataset.arpanel).find(s => s.deger === ev.detail.deger); if (!x) return; const a = p.querySelector('.gm-arpanel-alan'); a.dataset.git = x.git; a.href = x.git; a.querySelector('.gm-arpanel-yer').textContent = x.yer; a.querySelector('.gm-arpanel-ikon').innerHTML = ik(x.ikon || 'ara_'); });
  // Popüler çipler (foto üstü, Gastro "Popüler" satırı)
  GM.populer = (o = {}) => `<div class="gm-populer"><small>${esc(o.etiket || 'Popüler')}</small><div class="gm-populer-cipler">${(o.ogeler || []).map(x => `<a class="gm-populer-cip" href="${esc(x.git)}" data-git="${esc(x.git)}">${esc(x.metin)}</a>`).join('')}</div></div>`;
})();
/* Son nesil ana sayfa parçaları: selamlı başlık (Gentler Streak/Tiimo), canlı yolculuk kartı (Flighty), lezzet profili şeridi (AllTrails yükseklik profili). */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, liste = (...a) => a.filter(Boolean).join(' ');
  // Selamlı başlık: mor zemin üstünde tarih/konum satırı, sayfa başlığı (vurgulu kelime), altında yuva.
  GM.selamBas = (o = {}) => `<header class="${liste('gm-selam', o.gorsel && 'has-gorsel', o.sinif)}">${o.gorsel ? `<span class="gm-bant-foto" style="background-image:url('${esc(o.gorsel)}')" aria-hidden="true"></span>` : ''}${o.ust ? `<small>${esc(o.ust)}</small>` : ''}<h1>${o.baslikHtml || esc(o.baslik || '')}</h1>${o.html || ''}</header>`;
  // Canlı yolculuk kartı: aktif rota durumu; Live Activity ile aynı bilgi. o: {etiket, baslik, alt, sure, ilerleme 0..1, cipler:[{tur, metin}], git}
  GM.canliKart = (o = {}) => `<a class="gm-yck" href="${esc(o.git || '#/rota')}" data-git="${esc(o.git || '#/rota')}"><span class="gm-yck-ust"><span class="gm-yck-nabiz" aria-hidden="true"></span><small>${esc(o.etiket || 'Yolculuk')}</small><b class="gm-yck-sure">${esc(o.sure || '')}</b></span><span class="gm-yck-ad">${esc(o.baslik || '')}</span><small class="gm-yck-alt">${esc(o.alt || '')}</small><span class="gm-yck-yol" aria-hidden="true"><i style="--oran:${(+o.ilerleme || 0).toFixed(3)}"></i><b style="--oran:${(+o.ilerleme || 0).toFixed(3)}">${ik('arac')}</b></span>${o.cipler?.length ? `<span class="gm-yck-cipler">${o.cipler.map(c => `<span class="gm-yck-cip is-${esc(c.tur)}">${ik(c.tur)}${esc(c.metin)}</span>`).join('')}</span>` : ''}</a>`;
  // Lezzet profili: km ekseninde yatay kayan şerit; mekân durakları üstte (fotoğraflı düğüm), yol katmanları altta (gri, küçük). Kaydırınca ortadaki durak seçilir ve alttaki kart değişir.
  GM.lezzetProfili = (r, o = {}) => {
    const D = (o.duraklar || []).filter(d => d.mekan), K = (o.katman || []).filter(k => ['yakit', 'sarj', 'ibadet', 'dinlenme', 'karavan'].includes(k.tur)), km = r.km, gen = Math.max(900, Math.round(km * 2.2));
    const I = (r.iller || []).map(i => ({...i, kimlik: (window.GMV?.ilKimlik || []).find(k => k.ad === i.ad)})).filter(i => i.kimlik);
    const x = v => Math.round(24 + (v / km) * (gen - 48));
    // Aynı bölgedeki (≈60 km) mekânlar kümelenir: en çok 2 fotoğraflı düğüm + "+N" düğümü; düğümler rotanın içine doğru açılır, gerçek km'den uzaklaşmaz.
    const grup = {}; D.forEach((d, i) => { (grup[Math.round(d.km / 60)] ||= []).push({d, i}); });
    const secilen = Object.values(grup).flatMap(g => g.slice(0, 2));
    const durak = Object.values(grup).map(g => { const yon = g[0].d.km > km / 2 ? -1 : 1, x0 = x(g[0].d.km); return g.slice(0, 2).map((y, n) => `<button type="button" class="gm-lp-durak${y.i === secilen[0].i ? ' is-secili' : ''}" style="left:${x0 + yon * n * 40}px" data-lp="m${secilen.indexOf(y)}" aria-label="${esc(`${y.d.mekan.ad}, ${y.d.km}. km`)}"><span class="gm-photo" style="background-image:url('${esc(y.d.mekan.kapak)}')"></span></button>`).join('') + (g.length > 2 ? `<span class="gm-lp-fazla" style="left:${x0 + yon * 80}px">+${g.length - 2}</span>` : ''); }).join('');
    const il = I.map((i, n) => `<button type="button" class="gm-lp-il" style="left:${x(i.km)}px" data-lp="i${n}"><span>${ik('cografi')}${esc(i.ad)}</span></button>`).join('');
    const kat = K.map((k, n) => `<span class="gm-lp-katman is-${esc(k.tur)}${n % 2 ? ' is-alt' : ''}" style="left:${x(k.km)}px" title="${esc(k.ad)}">${ik(k.tur)}</span>`).join('');
    const olcek = Array.from({length: Math.floor(km / 100) + 1}, (_, i) => `<span class="gm-lp-km" style="left:${x(i * 100)}px">${i * 100} km</span>`).join('');
    const veri = {m: secilen.map(({d}) => ({slug: d.mekan.slug, km: d.km, sapma: d.sapma})), i: I.map(i => ({ad: i.ad, km: i.km}))};
    return `<div class="gm-lp" data-lp-veri='${esc(JSON.stringify(veri))}'><div class="gm-lp-serit" tabindex="0" aria-label="Rota boyunca duraklar ve iller"><div class="gm-lp-tuval" style="width:${gen}px"><span class="gm-lp-eksen" aria-hidden="true"></span>${olcek}${kat}${il}${durak}<span class="gm-lp-uc is-bas" style="left:${x(0)}px">${esc(r.kalkis)}</span><span class="gm-lp-uc is-son" style="left:${x(km)}px">${esc(r.varis)}</span></div></div><div class="gm-lp-kart">${D[0] ? GM.mekanKart(D[0].mekan, {tur: 'harita', sapma: {dk: D[0].sapma, km: D[0].km}}) : ''}</div></div>`;
  };
  GM._lpKart = (lp, kod) => { const v = JSON.parse(lp.dataset.lpVeri), n = +kod.slice(1); if (kod[0] === 'm') { const d = v.m[n]; return GM.mekanKart(GM.mekan(d.slug), {tur: 'harita', sapma: {dk: d.sapma, km: d.km}}); } const i = v.i[n], k = (GMV.ilKimlik || []).find(x => x.ad === i.ad); return GM.ilKart({...k, bolge: 'Coğrafi işaretli lezzetler', tescilli: k.tescilli.slice(0, 6)}, {km: i.km}); };
  document.addEventListener('click', ev => { const b = ev.target.closest?.('.gm-lp-durak,.gm-lp-il'); if (!b) return; const lp = b.closest('.gm-lp'); lp.querySelectorAll('.gm-lp-durak,.gm-lp-il').forEach(x => x.classList.toggle('is-secili', x === b)); b.scrollIntoView({inline: 'center', block: 'nearest', behavior: GM.azHareket() ? 'auto' : 'smooth'}); lp.querySelector('.gm-lp-kart').innerHTML = GM._lpKart(lp, b.dataset.lp); GM.titres?.(); });
})();
/* Alternatif kaydı (karar sayfası #/alternatifler bunu okur). Her alternatif ekran dosyası kendini kaydeder:
   GM.alternatifKaydet({ekran:'ana'|'liste'|'detay'|'route', kod, ad:'Ana · Citymapper kalıbı', referans:'Citymapper (Europas 2015)', alinan:'neyi aldı (tek cümle)', gerekce:'neden (tek cümle)', git:'#/...', sira}) */
(() => {
  const L = GM._alternatifler = GM._alternatifler || [];
  GM.alternatifKaydet = o => { const i = L.findIndex(x => x.kod === o.kod); if (i >= 0) L[i] = o; else L.push(o); };
  GM.alternatifler = ekran => L.filter(x => !ekran || x.ekran === ekran).sort((a, b) => (a.sira ?? 99) - (b.sira ?? 99));
})();
/* Alternatif kartı (karar sayfası): telefon oranında küçük resim (GM.ekranKucuk ailesi, büyük) + ad + referans + alınan + gerekçe + Aç. */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik;
  GM.alternatifKart = (o = {}) => `<article class="gm-altk"><a class="gm-altk-kucuk" href="${esc(o.git)}" data-git="${esc(o.git)}" aria-label="${esc(o.ad)} aç"><img src="assets/alternatif/${esc(o.kod)}.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="gm-altk-yok" aria-hidden="true">${ik('mobile-screen')}</span></a><div class="gm-altk-metin"><b>${esc(o.ad)}</b><small class="gm-altk-ref">${esc(o.referans)}</small>${o.alinan ? `<p><span>Alınan:</span> ${esc(o.alinan)}</p>` : ''}${o.gerekce ? `<p><span>Neden:</span> ${esc(o.gerekce)}</p>` : ''}</div>${GM.btn({metin: 'Aç', ikon: 'tumu', tur: 'secondary', boyut: 'sm', tam: true, git: o.git})}</article>`;
})();
