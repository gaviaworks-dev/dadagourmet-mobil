/* Ana sayfa referans kalıpları (ekranlar/ana-ref.js: Citymapper · Michelin Guide · Airbnb · Komoot). Kanonda karşılığı olmayan parçalar; her biri en yakın kanon ailesinden türer (başındaki yorum).
   Stil: kanon/gm-k-ana.css (gm-ka-*). Veri uydurulmaz: süre farkları GM.rotaOneri sapmalarından, rozetler web alanlarından (seckiler, dadaOnerdi) gelir.
   API: GM.konseptIkon · GM.modulIzgara · GM.bindirBant · GM.bindirYuva · GM.buyukBaslik · GM.ustSabit · GM.karakterOzet · GM.ilanAkis · GM.bolgeKart · GM.abPanel · GM.karakterOge · GM.karakterBagla · GM.kisayollar · GM.yakinKart · GM.seckiKapak · GM.seckiKart · GM.aramaKapsul · GM.ikonSekme · GM.ikonSekmeBagla · GM.yolculukKart · GM.ilanKart · GM.hizmetIzgara · GM.deneyimKart · GM.turKart · GM.turProfil · GM.varisSaati · GM.bilesimCubuk · GM.koleksiyonKart · GM.konseptIzgara · GM.konseptSerit · GM.anaSatirlar · GM.canliOzetKart */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, liste = (...a) => a.filter(Boolean).join(' ');
  const bg = src => (src ? ` style="background-image:url('${esc(src)}')"` : '');
  const foto = (src, ikon = 'mekan') => (src ? `<span class="gm-photo"${bg(src)}></span>` : `<span class="gm-photo is-yok" aria-hidden="true">${ik(ikon)}</span>`);
  const git = g => (g ? ` href="${esc(g)}" data-git="${esc(g)}"` : '');

  // Web konsept değeri → Font Awesome solid ikon (konsept şeritleri ve seçki rozetleri tek eşlemeden okur).
  const KONSEPT_IKON = {'butik-restoran': 'store', tarihi: 'landmark', modern: 'building', geleneksel: 'mortar-pestle', luks: 'gem', 'doga-icinde': 'tree', 'bahceli-restoran': 'seedling', terasli: 'umbrella-beach', manzarali: 'mountain-sun', 'deniz-kenari': 'water', 'dag-yayla': 'mountain', 'tas-konak': 'house-chimney', 'sanat-ve-kultur': 'palette', 'yoresel-lezzet-noktasi': 'wheat-awn', 'sef-restorani': 'kitchen-set'};
  GM.konseptIkon = deger => KONSEPT_IKON[deger] || 'utensils';
  // Varış saati (Citymapper "Arrive 17:04" / Flighty): uygulamanın şimdisinden (GM.simdi, veriden gelir) dk sonrası, "16.50" biçiminde.
  GM.varisSaati = dk => { const d = new Date(GM.simdi().getTime() + Math.round(+dk || 0) * 60000); return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`; };
  // Keşif modülü ızgarası: GM.modulKart dizgelerinin 2×2 kabı (gm-gourmet.css .gm-modul-izgara); ekran dosyası ham sınıf yazmasın diye.
  GM.modulIzgara = (l = []) => `<div class="gm-modul-izgara">${l.join('')}</div>`;
  // Bindirmeli bant (GM.selamBas türevi): görselli mor bandın altı uzar, ardından gelen GM.bindirYuva içeriği banda biner (Citymapper paneli, Komoot tur kartı).
  GM.bindirBant = (o = {}) => GM.selamBas({...o, sinif: liste('gm-ka-bindir', o.sinif)});
  GM.bindirYuva = html => `<div class="gm-ka-bindir-yuva">${html}</div>`;
  // Büyük başlık (Michelin "Restaurants"): GM.rehberManset (gm-kl-manset) metin dizgesinden türer; fotoğrafsız, beyaz; altında yuva (arama). o: {ust, baslik, metin, html}
  GM.buyukBaslik = (o = {}) => `<header class="gm-ka-baslik"><div class="gm-ka-baslik-ust">${o.ust ? `<small>${esc(o.ust)}</small>` : ''}<h1>${esc(o.baslik)}</h1>${o.metin ? `<p>${GM.vurgu(o.metin)}</p>` : ''}</div>${o.html || ''}</header>`;
  // Yapışkan üst şerit (Airbnb arama + kategori): kaydırınca ekranın üstünde kalır; içine GM.aramaKapsul + GM.ikonSekme.
  GM.ustSabit = html => `<div class="gm-ka-ust">${html}</div>`;

  // ---------- Citymapper ----------
  // A→B paneli (Citymapper Start/End + mod ızgarası): GM.planlayici kapsülünden türer (aynı ray, alan ve kâğıt kart), altına rota karakteri ızgarası eklenir.
  // o: {nereden, nereye, git, etiket (üst satır), rozet, karakterler: GM.karakterOge dizgeleri, ad}
  GM.abPanel = (o = {}) => `<section class="${liste('gm-ka-ab', o.sinif)}" aria-label="${esc(o.etiket || 'Rota planla')}">${o.etiket ? `<header class="gm-ka-ab-bas"><small class="gm-card__category">${esc(o.etiket)}</small>${o.rozet ? `<span class="gm-bilet-rozet">${esc(o.rozet)}</span>` : ''}</header>` : ''}<div class="gm-ka-ab-yol"><span class="gm-plan-ray" aria-hidden="true"><i></i><b></b><i></i></span><a class="gm-ka-ab-alanlar"${git(o.git || '#/rota/planla')}><span class="gm-plan-alan"><small>Nereden</small><b data-ab="nereden">${esc(o.nereden || 'Konumum')}</b></span><span class="gm-plan-alan"><small>Nereye</small><b data-ab="nereye" class="${o.nereye ? '' : 'is-yer'}">${esc(o.nereye || 'Nereye gidiyorsun?')}</b></span></a>${GM.ikonBtn({ikon: 'arrow-right-arrow-left', etiket: 'Yönü çevir', tur: 'kutu', sinif: 'gm-ka-ab-cevir', veri: {eylem: 'ab-cevir'}})}</div>${o.karakterler?.length ? `<div class="gm-ka-kar" role="radiogroup" aria-label="Rota karakteri" data-ka-kar="${esc(o.ad || 'karakter')}">${o.karakterler.join('')}</div>` : ''}</section>`;
  // Rota karakteri hücresi (Citymapper mod hücresi): yığılma kuralı 3 — iki satır: ikon + ad · süre + fark hapı. Varış (o.alt) görünür satıra yığılmaz: erişilebilir adda ve seçili karakterin özet satırında (GM.karakterOzet). o: {deger, ikon, ad, alt, dk, fark, secili}
  GM.karakterOge = (o = {}) => { const s = Math.floor(o.dk / 60), d = Math.round(o.dk % 60); return `<button type="button" class="${liste('gm-ka-kar-oge', o.secili && 'is-secili')}" role="radio" aria-checked="${!!o.secili}" data-kar="${esc(o.deger)}" aria-label="${esc([o.ad, GM.sure(o.dk), o.alt].filter(Boolean).join(', '))}"><span class="gm-ka-kar-ust"><span class="gm-ka-kar-ikon">${ik(o.ikon)}</span><b class="gm-ka-kar-ad">${esc(o.ad)}</b></span><span class="gm-ka-kar-alt"><span class="gm-ka-kar-sure">${s ? `<b>${s}</b><small>sa</small>` : ''}<b>${d}</b><small>dk</small></span>${o.fark ? `<span class="gm-ka-kar-fark">+${esc(o.fark)} dk</span>` : `<span class="gm-ka-kar-fark is-sifir">En kısa</span>`}</span></button>`; };
  // Seçili karakter özeti (Citymapper "Suggested" satırı): solda açıklama, sağda süre.
  GM.karakterOzet = (o = {}) => `<p class="gm-ka-kar-ozet"><span>${o.sol || ''}</span><span>${o.sag || ''}</span></p>`;
  // Seçim: tek seçili hücre (radio); fn(deger) seçili karakterle çağrılır. Yönü çevir düğmesi iki alanı yer değiştirir.
  GM.karakterBagla = (kok, fn) => {
    const h = ev => {
      const b = ev.target.closest('[data-kar]'); if (b && kok.contains(b)) { const g = b.closest('[data-ka-kar]'); g.querySelectorAll('[data-kar]').forEach(x => { const on = x === b; x.classList.toggle('is-secili', on); x.setAttribute('aria-checked', on); }); fn?.(b.dataset.kar); return; }
      const c = ev.target.closest('[data-eylem="ab-cevir"]'); if (!c || !kok.contains(c)) return;
      const p = c.closest('.gm-ka-ab'), a = p.querySelector('[data-ab="nereden"]'), z = p.querySelector('[data-ab="nereye"]'); if (z.classList.contains('is-yer')) return; [a.textContent, z.textContent] = [z.textContent, a.textContent]; c.classList.toggle('is-cevrik');
    };
    kok.addEventListener('click', h); return () => kok.removeEventListener('click', h);
  };
  // Kısayollar (Citymapper Ev / İş / kayıtlı yerler): GM.guvenSerit ikon + metin dizgesinden türer; yuvarlak ikon kutusu, ad, küçük alt satır. l: [{ikon, ad, alt, git}]
  GM.kisayollar = (l = [], o = {}) => `<nav class="${liste('gm-ka-kisa', o.sinif)}" aria-label="${esc(o.etiket || 'Kısayollar')}">${l.map(x => `<a class="gm-ka-kisa-oge"${git(x.git)}><span class="gm-ka-kisa-ikon">${ik(x.ikon)}</span><span class="gm-ka-kisa-metin"><b>${esc(x.ad)}</b>${x.alt ? `<small>${esc(x.alt)}</small>` : ''}</span></a>`).join('')}</nav>`;

  // ---------- Michelin Guide ----------
  // Yakınımda kartı (Michelin "Near Me"): GM.adresKart haritasından türer (statik GM.harita + kâğıt gövde); altta tek satır bağlantı. o: {harita (GM.harita o), metin, sayi, git}
  GM.yakinKart = (o = {}) => `<article class="${liste('gm-ka-yakin', o.sinif)}">${GM.harita({yukseklik: 'var(--gm-size-map-h)', etkilesim: false, kontroller: false, ...o.harita})}<a class="gm-ka-yakin-alt"${git(o.git)}><span class="gm-ka-yakin-ikon">${ik('pin')}</span><span class="gm-satir-metin"><b>${esc(o.metin)}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span>${ik('satirOk', 'gm-satir-ok')}</a></article>`;
  // Seçki kapağı (Michelin editoryal kapak + ödül satırı): GM.mekanKart 'buyuk' (gm-feature perde, foto üstü metin) türevi. Yığılma kuralı 3: rozet foto üstünde sol üst hap, altta iki satır — ad · tek satır özet (.gm-tek-satir). o: {gorsel, rozet:{ikon, metin}, baslik, alt, git, sema}
  GM.seckiKapak = (o = {}) => `<a class="${liste('gm-ka-kapak', o.sinif)}"${git(o.git)}>${foto(o.gorsel)}<span class="gm-ka-kapak-perde" aria-hidden="true"></span>${o.rozet ? `<span class="gm-ka-hap">${ik(o.rozet.ikon)}${esc(o.rozet.metin)}</span>` : ''}${o.sema ? `<span class="gm-ka-kapak-sema">${o.sema}</span>` : ''}<span class="gm-ka-kapak-metin"><b class="gm-ka-kapak-ad">${esc(o.baslik)}</b>${o.alt ? `<span class="gm-ka-kapak-alt gm-tek-satir">${o.alt}</span>` : ''}</span></a>`;
  // Seçki kartı (Michelin "My Favorites"): gm-card ailesi; 4:3 foto. Yığılma kuralı 3: ödül rozeti foto üstünde sol üst hap (metinsizse yalnız ikon), gövdede iki satır — ad · konum. o: {gorsel, ikon, rozet, baslik, alt, git, id}
  GM.seckiKart = (o = {}) => `<article class="gm-card gm-ka-secki"><div class="gm-card__media"><a class="gm-card__visual"${git(o.git)} tabindex="-1" aria-label="${esc(o.baslik)}">${foto(o.gorsel)}</a><span class="${liste('gm-ka-hap', !o.rozet && 'is-ikon')}"${o.rozet ? '' : ' aria-hidden="true"'}>${ik(o.ikon || 'rota')}${o.rozet ? esc(o.rozet) : ''}</span>${o.id ? `<button class="gm-save" type="button" aria-label="Favorilere ekle" aria-pressed="false" data-eylem="kaydet" data-id="${esc(o.id)}">${ik('favori')}</button>` : ''}</div><a class="gm-card__body gm-ka-secki-govde"${git(o.git)}><b class="gm-card__title">${esc(o.baslik)}</b>${o.alt ? `<small class="gm-ka-secki-alt">${esc(o.alt)}</small>` : ''}</a></article>`;

  // ---------- Airbnb ----------
  // Arama kapsülü (Airbnb "Start your search"): GM.planlayici kapsülünden türer (kâğıt, sh-md), tek satır, ortalı; dokununca arama ekranı. o: {baslik, alt, git}
  // o.alan: sola yaslı arama alanı görünümü (Michelin arama çubuğu).
  GM.aramaKapsul = (o = {}) => `<a class="${liste('gm-ka-kapsul', o.alan && 'is-alan', o.sinif)}"${git(o.git || '#/ara')}>${ik('ara_')}<span class="gm-ka-kapsul-metin"><b>${esc(o.baslik || 'Ara')}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span></a>`;
  // İkonlu sekme şeridi (Airbnb kategori şeridi): GM.segment (role=tablist, kaydırmalı) türevi; ikon üstte, ad altta, seçilide alt çizgi. o: {ad, secili, ogeler:[{deger, metin, ikon}]}
  GM.ikonSekme = (o = {}) => `<div class="${liste('gm-ka-isekme', o.sinif)}" role="tablist" data-ka-sekme="${esc(o.ad || 'sekme')}" aria-label="${esc(o.etiket || 'Kategoriler')}">${(o.ogeler || []).map(x => `<button type="button" role="tab" class="gm-ka-isekme-oge" aria-selected="${x.deger === o.secili}" data-deger="${esc(x.deger)}">${ik(x.ikon)}<span>${esc(x.metin)}</span></button>`).join('')}</div>`;
  GM.ikonSekmeBagla = (kok, fn) => {
    const h = ev => { const b = ev.target.closest('.gm-ka-isekme-oge'); if (!b || !kok.contains(b) || b.getAttribute('aria-selected') === 'true') return; b.parentElement.querySelectorAll('.gm-ka-isekme-oge').forEach(x => x.setAttribute('aria-selected', x === b)); b.scrollIntoView({block: 'nearest', inline: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); fn?.(b.dataset.deger); };
    kok.addEventListener('click', h); return () => kok.removeEventListener('click', h);
  };
  // Yolculuk kartı (Airbnb "View trip details"): GM.rotaBilet kâğıt kartından türer; solda metin, sağda rota şeması kutusu (takvim kutusu yerine).
  // Yığılma kuralı 3: iki satır — ad + rozet (aynı satır) · tek satır özet (.gm-tek-satir; sığmazsa kayar). Bağlam etiketi ("Bugünün Rotası") bölüm başlığında. o: {rozet, baslik, alt, git, sema}
  GM.yolculukKart = (o = {}) => `<a class="${liste('gm-ka-yolculuk', o.sinif)}"${git(o.git)}><span class="gm-ka-yolculuk-metin"><span class="gm-ka-yolculuk-ust"><b>${esc(o.baslik)}</b>${o.rozet ? `<span class="gm-bilet-rozet">${esc(o.rozet)}</span>` : ''}</span>${o.alt ? `<small class="gm-tek-satir">${esc(o.alt)}</small>` : ''}</span><span class="gm-ka-yolculuk-sema" aria-hidden="true">${o.sema || ''}</span></a>`;
  // İlan kartı (Airbnb liste kartı): GM.mekanKart 'kompakt' türevi (gm-card, gm-save); büyük foto. Yığılma kuralı 3 (kart-cila ortak yardımcıları): foto üstü rozet + etiket (GM.mekanRozet), altta iki satır — ad + sağında puan (yalnız varsa) ya da açık durumu · tek meta (semt, ilçe · ₺ [· durum, puan varsa]). o: {rozet, kayitli}
  GM.ilanKart = (m, o = {}) => { const g = o.git || `#/mekan/${m.slug}`, puan = GM.mekanPuan(m), durum = GM.mekanDurum(m).join(''); return `<article class="gm-card gm-ka-ilan"><div class="gm-card__media gm-ka-ilan-medya"><a class="gm-card__visual"${git(g)} tabindex="-1" aria-label="${esc(m.ad)}">${foto(m.kapakB || m.kapak)}</a>${GM.mekanRozet(m, {rozet: o.rozet})}<button class="gm-save" type="button" aria-label="Favorilere ekle" aria-pressed="${!!o.kayitli}" data-eylem="kaydet" data-id="${esc(m.slug)}">${ik('favori')}</button></div><a class="gm-card__body gm-ka-ilan-govde"${git(g)}><span class="gm-ka-ilan-ust"><b class="gm-card__title">${esc(m.ad)}</b>${puan || durum}</span>${GM.mekanMetaSatir([GM.mekanYer(m, true), GM.fiyat(m.fiyat), puan ? durum : ''])}</a></article>`; };
  // İlan akışı: büyük kartlar alt alta (Airbnb ana akış).
  GM.ilanAkis = (l = []) => `<div class="gm-ka-akis">${l.join('')}</div>`;
  // Hizmet ızgarası (Airbnb "Services" kutuları): GM.modulKart (gm-modul) türevi; tint kare kutuda ikon, altında ad. 4'lü tek satır. l: [{ikon, ad, git, ana}]
  GM.hizmetIzgara = (l = []) => `<div class="gm-ka-hizmet">${l.map(x => `<a class="${liste('gm-ka-hizmet-oge', x.ana && 'is-ana')}"${git(x.git)}><span class="gm-ka-hizmet-kutu">${ik(x.ikon)}</span><b>${esc(x.ad)}</b>${x.alt ? `<small>${esc(x.alt)}</small>` : ''}</a>`).join('')}</div>`;
  // Kısa tarih aralığı (deneyim kartı meta satırı): "10–14 Kas", "25 Kas – 2 Ara", tek gün "11 Ara". ISO tarih/bit alanlarından.
  const AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const kisaTarih = e => { const p = t => { const [, a, g] = String(t || '').split('-').map(Number); return g ? {a, g} : null; }; const b = p(e.tarih), s = p(e.bit); if (!b) return e.zaman || ''; if (!s || (s.a === b.a && s.g === b.g)) return `${b.g} ${AY[b.a - 1]}`; return s.a === b.a ? `${b.g}–${s.g} ${AY[b.a - 1]}` : `${b.g} ${AY[b.a - 1]} – ${s.g} ${AY[s.a - 1]}`; };
  // Deneyim kartı (Airbnb Experiences): GM.etkinlikKart (gm-card gm-ek) türevi; dikey 4:5 foto, "Dada önerdi" hapı (web dadaOnerdi). Yığılma kuralı 3: altta iki satır — ad (1 satır) · tek meta (kısa tarih · il).
  GM.deneyimKart = (e, o = {}) => { const g = o.git || `#/etkinlik/${e.slug}`; return `<article class="gm-card gm-ka-deneyim"><div class="gm-card__media gm-ka-deneyim-medya"><a class="gm-card__visual"${git(g)} tabindex="-1" aria-label="${esc(e.ad)}">${foto(e.gorsel, 'etkinlik')}</a>${e.dadaOnerdi ? `<span class="gm-ka-hap">Dada önerdi</span>` : ''}<button class="gm-save" type="button" aria-label="Takvime kaydet" aria-pressed="false" data-eylem="kaydet" data-id="${esc(e.slug)}">${ik('kaydet')}</button></div><a class="gm-card__body gm-ka-deneyim-govde"${git(g)}><b class="gm-card__title">${esc(e.ad)}</b>${GM.mekanMetaSatir([`<span>${esc(kisaTarih(e))}</span>`, e.yer || e.il ? `<span class="gm-mk-yer">${esc(e.yer || e.il)}</span>` : ''])}</a></article>`; };

  // ---------- Komoot ----------
  // Tur kartı (Komoot tur kartı): GM.rotaKart kapak ailesinden türer (şema + foto, gm-save); medya bölünmüş (şema | iki foto), sayı ızgarası (AllTrails/Komoot 4'lü), bileşim çubukları, eylem.
  // o: {ust, rozet, baslik, alt, git, sema, fotolar:[2], sayilar:[{deger, birim, etiket}], profil: GM.turProfil dizgesi, bilesim: GM.bilesimCubuk dizgeleri, eylem}
  GM.turKart = (o = {}) => `<article class="${liste('gm-ka-tur', o.sinif)}"><a class="gm-ka-tur-medya"${git(o.git)} aria-label="${esc(o.baslik)}"><span class="gm-ka-tur-sema">${o.sema || ''}</span><span class="gm-ka-tur-fotolar">${(o.fotolar || []).slice(0, 2).map(f => foto(f)).join('')}</span></a><div class="gm-ka-tur-govde"><header class="gm-bilet-bas"><small class="gm-card__category">${esc(o.ust || 'Dada Route')}</small>${o.rozet ? `<span class="gm-bilet-rozet">${esc(o.rozet)}</span>` : ''}</header><a class="gm-ka-tur-ad"${git(o.git)}><b>${esc(o.baslik)}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</a>${o.sayilar?.length ? `<dl class="gm-ka-tur-sayi">${o.sayilar.map(s => `<div><dt>${esc(s.etiket)}</dt><dd><b>${esc(s.deger)}</b>${s.birim ? `<small>${esc(s.birim)}</small>` : ''}</dd></div>`).join('')}</dl>` : ''}${o.profil || ''}${(o.bilesim || []).join('')}${o.eylem ? `<div class="gm-bilet-eylem">${o.eylem}</div>` : ''}</div></article>`;
  // Bileşim çubuğu (Komoot yol türleri / yüzey): GM.lezzetProfili eksen ailesi; yığılmış yatay çubuk + değerli açıklama satırları. o: {baslik, tekSutun, ogeler:[{ad, deger, metin}]} — renk sırası token rampası (is-1..6).
  GM.bilesimCubuk = (o = {}) => { const L = (o.ogeler || []).filter(x => x.deger > 0), t = L.reduce((a, x) => a + x.deger, 0) || 1; return `<div class="${liste('gm-ka-bilesim', o.tekSutun && 'is-tek')}"><small class="gm-ka-bilesim-bas">${esc(o.baslik)}</small><span class="gm-ka-bilesim-cubuk" role="img" aria-label="${esc(`${o.baslik}: ${L.map(x => `${x.ad} ${x.metin}`).join(', ')}`)}">${L.map((x, i) => `<i class="is-${i % 6 + 1}" style="--pay:${(x.deger / t).toFixed(4)}"></i>`).join('')}</span><ul class="gm-ka-bilesim-liste">${L.map((x, i) => `<li><i class="is-${i % 6 + 1}" aria-hidden="true"></i><span>${esc(x.ad)}</span><b>${esc(x.metin)}</b></li>`).join('')}</ul></div>`; };
  // Tur profili (Komoot yükselti profili): GM.lezzetProfili km ekseni ailesinden türer; üstte km cetveli, uç işaretleri (A/B) ve il sınırları, altta yoğunluk alanı (rotaya ≤10 km mekân sayısı, km dilimi başına; karekök ölçek, küçük kümeler de görünsün), tabanda yol katmanı çentikleri.
  // o: {km, dilim:[sayı...] (eşit km dilimleri), iller:[{ad, km}], katman:[{km, tur}], kalkis, varis, etiket}
  GM.turProfil = (o = {}) => {
    const km = o.km || 1, D = (o.dilim || []).map(Math.sqrt), enc = Math.max(1, ...D), W = 300, H = 56, x = v => (v / km).toFixed(4);
    const nok = D.map((v, i) => [((i + .5) / D.length) * W, H - (v / enc) * (H - 6)]);
    const yol = nok.length ? `M0 ${H} L0 ${nok[0][1].toFixed(1)} ${nok.map(([a, b]) => `L${a.toFixed(1)} ${b.toFixed(1)}`).join(' ')} L${W} ${nok.at(-1)[1].toFixed(1)} L${W} ${H} Z` : '';
    const cizgi = nok.length ? `M0 ${nok[0][1].toFixed(1)} ${nok.map(([a, b]) => `L${a.toFixed(1)} ${b.toFixed(1)}`).join(' ')} L${W} ${nok.at(-1)[1].toFixed(1)}` : '';
    const adim = km > 300 ? 100 : km > 120 ? 50 : 20, cetvel = Array.from({length: Math.floor(km / adim) + 1}, (_, i) => i * adim).filter(v => (km - v) / km > .2);
    let son = -1; const iller = (o.iller || []).filter(i => i.km > 0 && i.km < km).map(i => ({...i, ad: (i.km - son) / km > .14 && i.km / km < .82 ? ((son = i.km), i.ad) : ''}));
    return `<figure class="${liste('gm-ka-profil', o.sinif)}" aria-label="${esc(o.etiket || 'Rota profili')}"><div class="gm-ka-profil-cetvel" aria-hidden="true">${cetvel.map(v => `<span style="--x:${x(v)}">${GM.sayi(v)} km</span>`).join('')}<span class="is-son">${GM.sayi(km)} km</span></div><div class="gm-ka-profil-alan"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path class="gm-ka-profil-dolgu" d="${yol}"/><path class="gm-ka-profil-cizgi" d="${cizgi}"/></svg>${iller.map(i => `<span class="gm-ka-profil-il" style="--x:${x(i.km)}">${i.ad ? `<small>${esc(i.ad)}</small>` : ''}</span>`).join('')}<span class="gm-ka-profil-uc is-a" title="${esc(o.kalkis || '')}">A</span><span class="gm-ka-profil-uc is-b" title="${esc(o.varis || '')}">B</span></div><div class="gm-ka-profil-taban" aria-hidden="true">${(o.katman || []).map(k => `<i class="is-${esc(k.tur)}" style="--x:${x(k.km)}"></i>`).join('')}</div>${o.alt ? `<figcaption class="gm-ka-profil-alt gm-tek-satir">${o.alt}</figcaption>` : ''}</figure>`;
  };
  // Koleksiyon kartı (Komoot Collections): GM.rotaKart 'kapak' türevi; üç fotoğraflı mozaik kapak, altında ad ve özet. o: {fotolar:[3], ust, baslik, alt, git}
  GM.koleksiyonKart = (o = {}) => `<a class="${liste('gm-ka-kol', o.sinif)}"${git(o.git)}><span class="gm-ka-kol-mozaik">${(o.fotolar || []).slice(0, 3).map(f => foto(f, 'rota')).join('')}</span><span class="gm-ka-kol-metin">${o.ust ? `<small class="gm-card__category">${esc(o.ust)}</small>` : ''}<b>${esc(o.baslik)}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span></a>`;
  // Bölge kartı (Komoot bölge kartları): GM.ilKart verisinden (GMV.ilKimlik) türer, kâğıt kart; il + bölge/km satırı, tescilli lezzetlerden ilk 3'ü ikonlu satır, fazlası "+N". o: {km}
  GM.bolgeKart = (k, o = {}) => { const T = k.tescilli || []; return `<article class="${liste('gm-ka-bolge', o.sinif)}"><header class="gm-ka-bolge-bas"><span class="gm-ka-bolge-ikon">${ik('cografi')}</span><span class="gm-satir-metin"><small class="gm-card__category">${esc([k.bolge, o.km == null ? '' : o.km < 1 ? 'Çıkış' : `${GM.sayi(o.km)}. km`].filter(Boolean).join(' · '))}</small><b>${esc(k.ad)}</b></span></header><ul class="gm-ka-bolge-liste">${T.slice(0, 3).map(x => `<li class="is-${x.tur === 'alinir' ? 'alinir' : 'yenir'}">${ik(x.tur === 'alinir' ? 'neAlinir' : 'neYenir')}<span>${esc(x.ad)}</span></li>`).join('')}</ul>${T.length > 3 ? `<small class="gm-ka-bolge-fazla">+${T.length - 3} tescilli lezzet</small>` : ''}</article>`; };
  // Konsept ızgarası (Komoot spor türü ızgarası): GM.seritKartlar (gm-strip) türevi; 2 sütun, yuvarlak köşeli foto, altında ad + sayı. l: [{ad, alt, gorsel, git}]
  GM.konseptIzgara = (l = []) => `<div class="gm-ka-kizgara">${l.map(x => `<a class="gm-ka-kizgara-oge"${git(x.git)}><span class="gm-ka-kizgara-foto">${foto(x.gorsel)}</span><span class="gm-ka-kizgara-metin"><b>${esc(x.ad)}</b>${x.alt ? `<small>${esc(x.alt)}</small>` : ''}</span></a>`).join('')}</div>`;
  // Konsept şeridi (ana sayfa): GM.seritKartlar çıktısının kendisi (kanon işaretlemesi aynen), yalnız gm-ka-strip türev sınıfı eklenir — yığılma kuralı 3: ad tek satır (uzun konsept adı "Yerel Lezzet Noktası" iki satıra kırılıp sayıyla 3 satır olmasın).
  GM.konseptSerit = (l = []) => GM.seritKartlar(l).replace('<div class="gm-strip">', '<div class="gm-strip gm-ka-strip">');
  // Satır listesi (ana sayfa): GM.mekanSatirlar kabının aynısı + gm-ka-satirlar türev sınıfı — etkinlik satırında ad tek satır (etiket · ad · yer; kart-cila satır kuralı).
  GM.anaSatirlar = (l = []) => `<div class="gm-kl-satirlar gm-ka-satirlar" data-liste>${l.join('')}</div>`;
  // Canlı yolculuk kartı, iki satır (Flighty canlı kartı): GM.canliKart (gm-yck) türevi. Yığılma kuralı 3: satır 1 — nabız + sıradaki durak adı + kalan süre (sağda); satır 2 — tek meta (.gm-tek-satir: km · ilçe · varış, ardından yakıt/mescit çipleri); altında ilerleme çubuğu.
  // "Yolculuğun sürüyor" bağlamı bölüm başlığındadır (kartta tekrar edilmez). o: {baslik, sure, meta, cipler:[{tur, metin}], ilerleme (0–1), git}
  GM.canliOzetKart = (o = {}) => { const g = o.git || '#/rota', oran = Math.min(1, Math.max(0, +o.ilerleme || 0)).toFixed(3); return `<a class="${liste('gm-yck gm-ka-yck', o.sinif)}"${git(g)}><span class="gm-yck-ust"><span class="gm-yck-nabiz" aria-hidden="true"></span><b class="gm-ka-yck-ad">${esc(o.baslik || '')}</b><b class="gm-yck-sure">${esc(o.sure || '')}</b></span><span class="gm-ka-yck-meta gm-tek-satir">${esc(o.meta || '')}${(o.cipler || []).map(c => `<span class="gm-yck-cip is-${esc(c.tur)}">${ik(c.tur)}${esc(c.metin)}</span>`).join('')}</span><span class="gm-yck-yol" role="progressbar" aria-label="Yolculuk ilerlemesi" aria-valuenow="${Math.round(oran * 100)}" aria-valuemax="100"><i style="--oran:${oran}"></i><b style="--oran:${oran}">${ik('arac')}</b></span></a>`; };
})();
/* Uber kalıbı ana sayfa (ana-b, ekranlar/kesfet.js) — TEK hareket modeli: bütün ekran tek bir durum değişkenine (alt sayfanın üst kenarı, y) bağlıdır.
   Üç konum: harita (sayfa küçük, harita tam ekran) · orta (açılış: görselli bant + planlayıcı, ortada harita, altta sayfa) · tam (sayfa yukarıda, üst bar solid + arama hapı).
   y'den iki ilerleme türer: --ka-s1 (orta→tam) ve --ka-s0 (orta→harita); bant, planlayıcı, arama hapı, çipler, harita perdesi ve üst bar saydamlığı aynı karede bu iki değerden okunur — hiçbir öğe yerinde kalmaz.
   Jestler (Apple Maps): sürükleme (tutamak, başlık ya da içerik), tekerlek/trackpad, iç kaydırma devri (içerik yalnız tam konumda kayar; tepedeyken aşağı çekmek sayfayı indirir), haritaya dokunup sürüklemek sayfayı haritaya indirir, tutamağa dokunmak sıradaki konuma geçer.
   Oturma: hızla izdüşen konuma en yakın durak, ≈300 ms ease-out (GM.TK.motion.page). Hareket azaltılmışsa anında.
   API: GM.rotaCipSerit · GM.cekmeceOzet · GM.uberSecim · GM.aramaHap · GM.uberEkran · GM.haritaRotaCiz · GM.uberBagla */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, liste = (...a) => a.filter(Boolean).join(' ');
  const kisit = (v, a, b) => Math.min(b, Math.max(a, v)), az = () => !!(GM.azHareket?.() || matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Rota çip şeridi (Uber "Where to?" altı öneriler): GM.populer foto üstü çip ailesi; düğme, tek seçim (aria-pressed). l: [{id, metin, ikon}]
  GM.rotaCipSerit = (l = [], o = {}) => `<div class="${liste('gm-ka-rcip', o.sinif)}" role="group" aria-label="${esc(o.etiket || 'Hazır rotalar')}">${l.map(x => `<button type="button" class="gm-ka-rcip-oge" data-ka-rota="${esc(x.id)}" aria-pressed="${x.id === o.secili}">${x.ikon ? ik(x.ikon) : ''}<span>${esc(x.metin)}</span></button>`).join('')}</div>`;
  // Sayfa başlığı: GM.cekmece özet satırı (gm-kl-cekmece-ozet) — başlık + alt satır; sağda isteğe bağlı eylem.
  GM.cekmeceOzet = (o = {}) => `<p class="gm-kl-cekmece-ozet" data-ka-ozet><b>${esc(o.baslik)}</b>${o.alt ? `<small>${o.alt}</small>` : ''}</p>${o.eylem || ''}`;
  // Seçim yuvası: sayfanın başında; rota bileti ya da seçili mekân kartı buraya yazılır.
  // Yüzen mekân kartı (Airbnb harita kartı + Google Maps yer önizlemesi): pin seçilince haritanın üstünde, alt menünün 12 üstünde tek kart. Solda 96 kare görsel; sağda ad (kalın, tek satır) + sağ üstte tek × (kanon ikon düğmesi), tek meta (.gm-tek-satir: tür · ilçe · ₺ · durum), eylem satırı. o: {git, durum (GM.mekanDurum o), eylem}
  GM.pinKart = (m, o = {}) => { const g = o.git || `#/mekan/${m.slug}`, git = h => ` href="${esc(h)}" data-git="${esc(h)}"`, foto = src => (src ? `<span class="gm-photo" style="background-image:url('${esc(src)}')"></span>` : `<span class="gm-photo is-yok" aria-hidden="true">${ik('mekan')}</span>`); return `<article class="gm-ka-pk" aria-label="${esc(m.ad)}"><a class="gm-ka-pk-foto"${git(g)} tabindex="-1" aria-hidden="true" draggable="false">${foto(m.kapak || m.kapakB)}</a><div class="gm-ka-pk-govde"><div class="gm-ka-pk-ust"><a class="gm-ka-pk-ad"${git(g)} draggable="false">${esc(m.ad)}</a>${GM.ikonBtn({ikon: 'kapat', etiket: 'Kartı kapat', tur: 'kutu', sinif: 'gm-ka-pk-kapat', veri: {eylem: 'pin-kapat'}})}</div>${GM.mekanMetaSatir([GM.mekanEtiket(m) ? `<span>${esc(GM.mekanEtiket(m))}</span>` : '', GM.mekanYer(m), GM.fiyat(m.fiyat), GM.mekanDurum(m, o.durum || {})])}<div class="gm-ka-pk-eylem">${o.eylem || ''}</div></div></article>`; };
  GM.uberSecim = html => `<div class="gm-ka-secim" data-ka-secim aria-live="polite">${html}</div>`;
  // Arama hapı (Uber "Nereye?" / Google Maps arama çubuğu): GM.aramaKapsul'dan türer, tek satır; planlayıcı kartı küçülünce bunun yerine görünür.
  GM.aramaHap = (o = {}) => `<a class="gm-ka-u-hap" href="${esc(o.git || '#/rota/planla')}" data-git="${esc(o.git || '#/rota/planla')}">${ik('ara_')}<span>${esc(o.metin || 'Nereye gidiyorsun?')}</span><span class="gm-ka-u-hap-ikon" aria-hidden="true">${ik('rota')}</span></a>`;
  // Ekran iskeleti. İlk öğe <section class="gm-hh …>: çekirdek üst barı görselin üstünde saydam açar (gm-ui.js).
  // o: {gorsel, baslik (html), ust (planlayıcı + çip yuvası dışı html), hap:{metin, git}, cipler (html), harita (GM.harita o), ozet (html), html (sayfa gövdesi), etiket, sayfaEtiket}
  GM.uberEkran = (o = {}) => `<section class="gm-hh gm-ka-uber" data-konum="orta"><div class="gm-ka-u-harita">${GM.harita({...o.harita, tam: true, kontroller: false, etiket: o.etiket || 'Harita'})}</div><div class="gm-hh-ust has-gorsel gm-ka-u-bant">${o.gorsel ? `<span class="gm-bant-foto" style="background-image:url('${esc(o.gorsel)}')" aria-hidden="true"></span>` : ''}${o.baslik ? `<h1 class="gm-hh-baslik">${o.baslik}</h1>` : ''}<div class="gm-ka-u-plan">${o.ust || ''}</div></div><div class="gm-ka-u-ust">${o.gorsel ? `<span class="gm-bant-foto" style="background-image:url('${esc(o.gorsel)}')" aria-hidden="true"></span>` : ''}<button type="button" class="gm-ka-u-geri" data-ka-geri aria-label="Ana görünüme dön">${ik('geri')}</button>${GM.aramaHap(o.hap)}</div><div class="gm-ka-u-cip">${o.cipler || ''}</div>${GM.alanDugme({})}<button type="button" class="gm-ka-u-liste" data-ka-liste>${ik('list')}<span>Listeyi göster</span></button><section class="gm-ka-u-sayfa" aria-label="${esc(o.sayfaEtiket || 'Keşif sayfası')}"><div class="gm-ka-u-tut" data-ka-tut><button type="button" class="gm-ka-u-tutamak" data-ka-tutamak aria-label="Sayfayı büyüt"><span aria-hidden="true"></span></button><div class="gm-ka-u-bas">${o.ozet || ''}<button type="button" class="gm-ka-u-kapat" data-ka-kapat aria-label="Kapat" hidden>${ik('kapat')}</button><button type="button" class="gm-ka-u-ac" data-ka-ac aria-label="Sayfayı aç"><span class="gm-ka-u-ac-ipucu">Yukarı çek</span>${ik('ac')}</button></div></div><div class="gm-ka-u-govde" data-ka-govde>${o.html || ''}</div></section><div class="gm-ka-u-pinkart" data-ka-pinkart aria-live="polite" hidden></div></section>`;
  // Rotayı haritada göster: sınıra uç (fitBounds) ve çizgiyi baştan sona canlandır (MapLibre kaynağı gm-rota; şema kipinde yalnız şema).
  GM.haritaRotaCiz = (el, cizgi, o = {}) => {
    const m = el?._harita, src = m?.getSource?.('gm-rota'); if (!src || !cizgi?.length) return;
    const b = cizgi.reduce(([[a, c], [d, e]], [x, y]) => [[Math.min(a, x), Math.min(c, y)], [Math.max(d, x), Math.max(e, y)]], [[180, 90], [-180, -90]]);
    const sure = az() ? 0 : GM.TK.motion.page * 4, cizgiYaz = l => src.setData({type: 'Feature', geometry: {type: 'LineString', coordinates: l}});
    m.fitBounds(b, {padding: o.dolgu || 40, duration: az() ? 0 : GM.TK.motion.page * 2.5, maxZoom: 11});
    cancelAnimationFrame(el._kaCiz); if (!sure) { cizgiYaz(cizgi); return; }
    const t0 = performance.now(), adim = t => { const k = kisit((t - t0) / sure, 0, 1), e = 1 - (1 - k) ** 3; cizgiYaz(cizgi.slice(0, Math.max(2, Math.ceil(cizgi.length * e)))); if (k < 1) el._kaCiz = requestAnimationFrame(adim); };
    el._kaCiz = requestAnimationFrame(adim);
  };
  const SIRA = ['tam', 'orta', 'harita'];
  // Bağla. o: {hazir(u), rotaSec(id, u), pinSec(id, u), alan(sinir, u), kapat(u), ilk(u)}. u: {el, git(konum), ciz(cizgi), sec(id), secimYaz(html), ozetYaz(html)}. Döner: temizle.
  GM.uberBagla = (kok, o = {}) => {
    const s = kok.querySelector('.gm-ka-uber'); if (!s) return () => {};
    const q = x => s.querySelector(x), band = q('.gm-ka-u-bant'), sayfa = q('.gm-ka-u-sayfa'), govde = q('[data-ka-govde]'), tut = q('[data-ka-tut]'), ust = q('.gm-ka-u-ust'), cip = q('.gm-ka-u-cip'), hKap = q('.gm-ka-u-harita'), hEl = q('.gm-harita'), alanBtn = q('.gm-kl-alan');
    const bar = kok.classList.contains('has-saydam') ? kok.querySelector('.gm-header') : null, nav = () => kok.querySelector('.gm-nav') || document.querySelector('.gm-nav');
    const pkEl = q('[data-ka-pinkart]');
    let K = null, y = 0, konum = 'orta', anim = 0, oynuyor = false, tekerden = false;
    // Ölç: konumlar ve yerleşim değerleri section koordinatında (px).
    const olc = () => {
      const H = s.clientHeight, r0 = s.getBoundingClientRect(); if (!H) return false;
      const hb = bar ? Math.max(0, bar.getBoundingClientRect().bottom - r0.top) : 0, hapH = ust.querySelector('.gm-ka-u-geri').offsetHeight, cipH = cip.offsetHeight, bandH = band.offsetHeight, tutH = tut.offsetHeight;
      // Alt sınır: alt menü kabının (gm-dock, kâğıt zemin) üst kenarı; sayfa başlığının metni bunun üstünde biter, alttaki boşluğu dock'un kâğıdı verir (yarım satır asla kalmaz).
      const dk = (kok.closest('.gm-kok') || document).querySelector('.gm-dock'), dr = dk && getComputedStyle(dk).visibility !== 'hidden' ? dk.getBoundingClientRect() : null, n = nav(), nr = n?.getBoundingClientRect();
      const alt = dr && dr.height ? dr.top - r0.top + GM.TK.space[8] : nr && nr.height ? nr.top - r0.top - GM.TK.space[8] : H;
      const ustY = hb + GM.TK.space[8], tam = ustY + hapH + GM.TK.space[12], harita = Math.round(alt - tutH), orta = Math.round(kisit(bandH + GM.TK.space[24] * 8 + GM.TK.space[8], tam + GM.TK.space[64], harita - GM.TK.space[64])); // orta (Uber): hero · canlı harita şeridi (200) · sayfa (başlık + kompakt bilet alt menünün üstünde)
      // Mor üst bölüm her konumda kanon kavisiyle biter (gm-hh-ust alt köşeleri); harita konumunda çipler kavisin altına iner.
      const R = parseFloat(getComputedStyle(s).getPropertyValue('--gm-r-surface')) || GM.TK.space[24];
      K = {H, hb, ustY, tam, orta, harita, bandH, cipH, R, cipOrta: bandH - cipH - GM.TK.space[16], cipHarita: tam + R + GM.TK.space[8]};
      s.style.setProperty('--ka-ust-y', `${ustY}px`); s.style.setProperty('--ka-tam-y', `${tam}px`); s.style.setProperty('--ka-sayfa-h', `${H - tam}px`); s.style.setProperty('--ka-alan-y', `${K.cipHarita + cipH + GM.TK.space[8]}px`); s.style.setProperty('--ka-liste-y', `${harita - GM.TK.space[12]}px`); s.style.setProperty('--ka-pk-alt', `${Math.round(H - (dr && dr.height ? dr.top - r0.top : nr && nr.height ? nr.top - r0.top : H) + GM.TK.space[12])}px`);
      return true;
    };
    // Uygula: y → bütün ekranın durumu (tek kare).
    const uygula = () => {
      if (!K) return;
      const s1 = kisit((K.orta - y) / (K.orta - K.tam), 0, 1), s0 = kisit((y - K.orta) / (K.harita - K.orta), 0, 1), m = Math.max(s0, s1);
      const st = (k, v) => s.style.setProperty(k, v);
      st('--ka-y', `${y.toFixed(1)}px`); st('--ka-s0', s0.toFixed(3)); st('--ka-s1', s1.toFixed(3)); st('--ka-m', m.toFixed(3));
      st('--ka-bant-y', `${(-K.bandH * Math.max(s0, s1 * .8)).toFixed(1)}px`);
      st('--ka-cip-y', `${(s0 > 0 ? K.cipOrta + (K.cipHarita - K.cipOrta) * s0 : K.cipOrta - K.bandH * .8 * s1).toFixed(1)}px`);
      s.classList.toggle('is-harita', s0 > .5); s.classList.toggle('is-tam', y <= K.tam + 1); sayfa.classList.toggle('is-yapisik', y <= K.tam + 1); s.classList.toggle('is-hap', m > .5);
      if (bar) { bar.style.setProperty('--gm-alfa', m.toFixed(3)); bar.classList.toggle('is-saydam', m < .999); }
    };
    const etiket = konum => konum === 'tam' ? 'Sayfayı küçült' : konum === 'harita' ? 'Ana görünüme dön' : 'Sayfayı büyüt';
    let oncekiKonum = 'orta';
    const bitti = () => {
      oynuyor = false; if (tekerden) { tekerden = false; sogu = performance.now() + 400; }
      s.dataset.konum = konum; if (konum !== 'tam') govde.scrollTop = 0;
      q('[data-ka-tutamak]').setAttribute('aria-label', etiket(konum)); q('[data-ka-ac]').setAttribute('aria-label', etiket(konum));
      if (konum !== oncekiKonum) { if (s.classList.contains('is-ipucu')) { s.classList.remove('is-ipucu'); try { GM.durum.yaz('kesfet-ipucu', true); } catch { /* yok */ } } if (konum !== 'tam') yerles(); oncekiKonum = konum; }
      GM.degisim(s, 'uber-konum', konum);
    };
    // Pin kartı açıkken sayfa gizli: yukarı jest en çok ortaya (hero + harita şeridi) çıkar, tam konum yok.
    const ustSinir = () => (s.classList.contains('is-pin') ? K.orta : K.tam);
    const git = (ad, ops = {}) => {
      if (ad === 'tam' && s.classList.contains('is-pin')) ad = 'orta';
      olc(); if (!K || !(ad in K)) return; cancelAnimationFrame(anim); konum = ad;
      const y0 = y, d = K[ad] - y0, sure = az() ? 0 : (ops.sure ?? GM.TK.motion.page), t0 = performance.now();
      if (!sure || Math.abs(d) < 1) { y = K[ad]; uygula(); bitti(); return; }
      oynuyor = true; const adim = t => { const k = kisit((t - t0) / sure, 0, 1), e = 1 - (1 - k) ** 3; y = y0 + d * e; uygula(); if (k < 1) anim = requestAnimationFrame(adim); else bitti(); };
      anim = requestAnimationFrame(adim);
    };
    // Bırakınca: hızla 180 ms ileri izdüşüm, en yakın konum.
    const otur = (v = 0) => { const p = y + v * 180; git(SIRA.reduce((a, b) => (Math.abs(K[b] - p) < Math.abs(K[a] - p) ? b : a), 'orta')); };
    // Yön adımı: jestin BAŞLADIĞI konumdan o yöndeki ilk durak (bir jest = bir adım; aşırı kaydırma bir sonrakine atlamaz).
    const yon = (dir, bas) => { const l = SIRA.map(a => [a, K[a]]); const c = dir < 0 ? l.filter(([, v]) => v < bas - 1).sort((a, b) => b[1] - a[1])[0] : l.filter(([, v]) => v > bas + 1).sort((a, b) => a[1] - b[1])[0]; return c ? c[0] : null; };
    // ---- Sürükleme (fare, dokunma, kalem) ----
    let g = null, bastir = false, momentum = 0;
    const ornek = ev => { g.iz.push([performance.now(), ev.clientY]); while (g.iz.length > 2 && performance.now() - g.iz[0][0] > 90) g.iz.shift(); };
    const hiz = () => { const a = g.iz[0], b = g.iz.at(-1); return a && b && b[0] > a[0] ? (b[1] - a[1]) / (b[0] - a[0]) : 0; };
    const basla = ev => {
      if (ev.button > 0 || !olc()) return;
      const kartta = s.classList.contains('is-pin') && pkEl?.contains(ev.target), sayfada = kartta || sayfa.contains(ev.target) || (band.contains(ev.target) && !cip.contains(ev.target)), haritada = hKap.contains(ev.target);
      if (!sayfada && !haritada) return;
      cancelAnimationFrame(momentum);
      g = {id: ev.pointerId, sy: ev.clientY, y0: y, st: govde.scrollTop, mod: null, sayfada, icerik: govde.contains(ev.target), iz: [[performance.now(), ev.clientY]]};
    };
    const hareket = ev => {
      if (!g || ev.pointerId !== g.id) return;
      const dy = ev.clientY - g.sy; ornek(ev);
      if (!g.mod) {
        if (Math.abs(dy) < 6) return;
        if (!g.sayfada) { g = null; if (konum !== 'harita') git('harita'); return; } // haritayı sürüklemek sayfayı indirir; harita kendi kaydırmasını sürdürür
        g.mod = g.icerik && konum === 'tam' && !(dy > 0 && govde.scrollTop <= 0) ? 'kaydir' : 'sayfa';
        cancelAnimationFrame(anim); try { sayfa.setPointerCapture(g.id); } catch { /* yok */ }
        s.classList.add('is-surukle'); g.sy = ev.clientY; g.y0 = y; g.st = govde.scrollTop;
        return;
      }
      if (g.mod === 'kaydir') { govde.scrollTop = g.st - dy; if (dy > 0 && govde.scrollTop <= 0 && g.st - dy < 0) { g.mod = 'sayfa'; g.sy = ev.clientY; g.y0 = y; } return; }
      y = kisit(g.y0 + dy, ustSinir(), K.harita); uygula();
    };
    const birak = ev => {
      if (!g || ev.pointerId !== g.id) return; const x = g; g = null; s.classList.remove('is-surukle');
      if (!x.mod) return; bastir = true; setTimeout(() => { bastir = false; }, 80);
      const v = (() => { g = x; const h = hiz(); g = null; return h; })();
      if (x.mod === 'sayfa') { otur(v); return; }
      let hz = -v * 16; const ad = () => { govde.scrollTop += hz; hz *= .94; if (Math.abs(hz) > .5) momentum = requestAnimationFrame(ad); }; if (!az()) momentum = requestAnimationFrame(ad);
    };
    const tikYakala = ev => { if (bastir) { ev.stopPropagation(); ev.preventDefault(); bastir = false; } };
    // ---- Tekerlek / trackpad ----
    // Soğuma: tekerlekle konuma oturunca 400 ms içinde gelen olaylar sayfayı oynatmaz (her olay süreyi uzatır).
    // Kilit: bir tekerlek dizisi içeriği kaydırarak başladıysa, içerik tepeye vardığında aynı dizi sayfayı indirmez (yeni jest gerekir; Apple Maps).
    let tekerT = 0, tekerBas = null, kilit = 0, sogu = 0;
    const teker = ev => {
      if (!K || (hKap.contains(ev.target) && !sayfa.contains(ev.target))) return; // harita kendi yakınlaştırmasını yapar
      const dy = ev.deltaMode === 1 ? ev.deltaY * 16 : ev.deltaY; if (!dy) return;
      const tamda = Math.abs(y - K.tam) < 1, simdi = performance.now();
      if (tamda && (dy > 0 || govde.scrollTop > 0)) { kilit = simdi + 220; if (!sayfa.contains(ev.target)) { ev.preventDefault(); govde.scrollTop += dy; } return; } // içerik kayar
      if (tamda && simdi < kilit) { kilit = simdi + 220; ev.preventDefault(); return; }
      if (simdi < sogu || (tekerden && oynuyor)) { if (!oynuyor) sogu = simdi + 400; ev.preventDefault(); return; } // bir tekerlek dizisi = bir konum adımı (fare çentikleri ve trackpad ataleti zincirlenmez)
      ev.preventDefault(); cancelAnimationFrame(anim);
      if (tekerBas == null) { olc(); tekerBas = y; }
      y = kisit(y - dy, ustSinir(), K.harita); uygula(); s.classList.add('is-surukle');
      clearTimeout(tekerT); tekerT = setTimeout(() => { s.classList.remove('is-surukle'); const d = y - tekerBas, bas = tekerBas; tekerBas = null; const n = Math.abs(d) > GM.TK.space[24] ? yon(Math.sign(d), bas) : null; sogu = performance.now() + 400; tekerden = true; if (n) git(n); else otur(); }, 140);
    };
    // ---- Dokunuşlar ----
    const tik = ev => {
      // Sayfa başlığının her yeri (tutamak, başlık, "Aç") dokunma alanıdır: orta → tam, tam/harita → orta. Geri oku ve "Listeyi göster" ortaya döner.
      if (ev.target.closest('[data-ka-geri],[data-ka-liste]')) { git('orta'); return; }
      if (ev.target.closest('[data-ka-kapat]')) { o.kapat?.(u); return; } // seçimi kapat (Apple Maps yer kartı X'i): başlıkta, her konumda görünür
      const t = ev.target.closest('[data-ka-tut]'); if (t && s.contains(t) && !ev.target.closest('a,[data-eylem]')) { git(konum === 'orta' ? 'tam' : 'orta'); return; }
      const r = ev.target.closest('[data-ka-rota]'); if (r && s.contains(r)) { s.querySelectorAll('[data-ka-rota]').forEach(x => x.setAttribute('aria-pressed', x === r)); o.rotaSec?.(r.dataset.kaRota, u); return; }
      const a = ev.target.closest('[data-eylem="alan-ara"]'); if (a && s.contains(a)) { a.classList.remove('is-gorunur'); if (hEl._harita) o.alan?.(hEl._harita.getBounds(), u); }
    };
    const degis = ev => { if (ev.target === hEl && ev.detail?.deger && ev.detail.ad !== 'uber-konum') o.pinSec?.(ev.detail.deger, u); };
    const dolgu = (ad = konum) => K && s.classList.contains('is-pin') && pkEl ? {top: Math.round(ad === 'orta' ? K.bandH + 16 : K.cipHarita + K.cipH + 16), bottom: Math.round(s.getBoundingClientRect().bottom - pkEl.getBoundingClientRect().top + 16), left: 32, right: 32} : K ? (ad === 'harita' ? {top: Math.round(K.cipHarita + K.cipH + 16), bottom: Math.round(K.H - K.harita + 16), left: 32, right: 32} : {top: Math.round(K.bandH + 16), bottom: Math.round(K.H - K.orta + 16), left: 32, right: 32}) : 32;
    // Odak: haritanın neye oturduğu (rota sınırı ya da pin). Sayfa konumu değişince görünür alana göre yeniden yerleşir; kullanıcı haritayı oynatınca odak bırakılır.
    let odak = null;
    const sinir = c => c.reduce(([[a, b], [d, e]], [x, z]) => [[Math.min(a, x), Math.min(b, z)], [Math.max(d, x), Math.max(e, z)]], [[180, 90], [-180, -90]]);
    function yerles() {
      const m = hEl._harita; if (!m || !K) return; const d = dolgu(), sure = az() ? 0 : GM.TK.motion.page;
      if (odak?.b) m.fitBounds(odak.b, {padding: d, duration: sure, maxZoom: 11});
      else if (odak?.id) GM.haritaSec(hEl, odak.id, {zoom: Math.max(m.getZoom(), 13), kaydir: [0, Math.round((d.top - d.bottom) / 2)]});
      else m.easeTo({padding: d, duration: sure});
    }
    const u = {
      el: hEl, git,
      konum: () => konum,
      ciz: cizgi => { odak = {b: sinir(cizgi)}; alanBtn?.classList.remove('is-gorunur'); GM.haritaRotaCiz(hEl, cizgi, {dolgu: dolgu(konum === 'tam' ? 'orta' : konum)}); },
      sec: id => { odak = {id}; alanBtn?.classList.remove('is-gorunur'); const d = dolgu(s.classList.contains('is-pin') ? 'harita' : 'orta'); GM.haritaSec(hEl, id, {zoom: 13, kaydir: [0, Math.round((d.top - d.bottom) / 2)]}); },
      birak: () => { odak = null; },
      kapatGoster: v => { const b = q('[data-ka-kapat]'); if (b) b.hidden = !v; },
      secimYaz: html => { const yv = q('[data-ka-secim]'); if (yv) { yv.innerHTML = html; govde.scrollTop = 0; } },
      ozetYaz: html => { const yv = q('[data-ka-ozet]'); if (yv) yv.outerHTML = html; },
      // Yüzen pin kartı: html → kart açılır, sayfa gizlenir (harita konumuna iner); kart açıkken yukarı jest = hero + harita şeridi (orta), aşağı = harita. null → kart kapanır, o anki konumun sayfası geri gelir.
      pinKart: html => {
        if (!pkEl) return;
        if (html) { if (!s.classList.contains('is-pin')) pinOnce = konum; pkEl.innerHTML = html; pkEl.hidden = false; s.classList.add('is-pin'); if (konum !== 'harita') git('harita'); }
        else if (s.classList.contains('is-pin')) { pkEl.hidden = true; pkEl.innerHTML = ''; s.classList.remove('is-pin'); pinOnce = null; yerles(); }
      },
      pinAcik: () => s.classList.contains('is-pin')
    };
    let pinOnce = null;
    // Haritanın boş yerine dokunmak (sürüklemeden) pin kartını kapatır.
    let hb0 = null; const hBas = ev => { hb0 = [ev.clientX, ev.clientY]; };
    const hTik = ev => { if (!s.classList.contains('is-pin') || !hb0 || Math.hypot(ev.clientX - hb0[0], ev.clientY - hb0[1]) > 6) return; if (ev.target.closest('[data-pin-id],.gm-pin,.gm-kume,button,a')) return; if (ev.target.closest('canvas')) o.kapat?.(u); };
    // Kümeye dokunmak o kümeye iki kademe yakınlaşır (kümeler açılır, tekil pin görünür).
    const kTik = ev => { const k = ev.target.closest('.gm-kume'), m = hEl._harita; if (!k || !m || !hb0 || Math.hypot(ev.clientX - hb0[0], ev.clientY - hb0[1]) > 6) return; const r = m.getContainer().getBoundingClientRect(), kr = k.getBoundingClientRect(); odak = null; m.easeTo({center: m.unproject([kr.x + kr.width / 2 - r.x, kr.y + kr.height / 2 - r.y]), zoom: Math.min(m.getZoom() + 2, 16), duration: az() ? 0 : GM.TK.motion.page}); };
    hKap.addEventListener('pointerdown', hBas); hKap.addEventListener('click', hTik); hKap.addEventListener('click', kTik);
    o.hazir?.(u);
    const ro = new ResizeObserver(() => { if (olc()) { y = K[konum]; uygula(); } });
    ro.observe(s); ro.observe(band);
    s.addEventListener('pointerdown', basla); document.addEventListener('pointermove', hareket); document.addEventListener('pointerup', birak); document.addEventListener('pointercancel', birak);
    s.addEventListener('click', tikYakala, true); s.addEventListener('click', tik); s.addEventListener('gm-degisim', degis); s.addEventListener('wheel', teker, {passive: false});
    const hrk = GM.haritaHareket(hEl, () => { odak = null; alanBtn?.classList.add('is-gorunur'); });
    // Esc: hangi konumda olursa olsun ana görünüme (orta) döner.
    const tus = ev => { if (ev.key === 'Escape' && !kok.classList.contains('is-gizli') && s.classList.contains('is-pin')) { ev.preventDefault(); o.kapat?.(u); return; } if (ev.key === 'Escape' && !kok.classList.contains('is-gizli') && konum !== 'orta') { ev.preventDefault(); git('orta'); } };
    document.addEventListener('keydown', tus);
    if (olc()) { y = K.orta; uygula(); bitti(); }
    // Keşfedilebilirlik: ilk açılışta "Yukarı çek" ipucu ve sayfa bir kez hafifçe zıplar (600 ms); kullanıcı konum değiştirince ipucu kalıcı kapanır.
    let ziplaT = 0;
    if (!GM.durum?.oku?.('kesfet-ipucu', false)) {
      s.classList.add('is-ipucu');
      if (!az()) ziplaT = setTimeout(() => { if (konum !== 'orta' || g || oynuyor) return; const y0 = y, t0 = performance.now(), sure = GM.TK.motion.page * 2; oynuyor = true; const adim = t => { const k = kisit((t - t0) / sure, 0, 1); y = y0 - GM.TK.space[24] * Math.sin(Math.PI * k) * (1 - k * .3); uygula(); if (k < 1) anim = requestAnimationFrame(adim); else { y = y0; uygula(); oynuyor = false; } }; anim = requestAnimationFrame(adim); }, GM.TK.motion.page * 3);
    }
    // İlk açılış: harita yüklenince Bugünün Rotası çizgisi canlanır.
    let iptal = false; const bekle = () => { if (iptal || !hEl.isConnected) return; const mm = hEl._harita; if (!mm) { setTimeout(bekle, 300); return; } const bas = () => { if (iptal) return; try { mm.setMinZoom(4.8); mm.setMaxBounds([[14, 22], [56, 56]]); } catch { /* yok */ } o.ilk?.(u); }; if (mm.getSource('gm-rota')) bas(); else mm.once('load', () => setTimeout(bas, 0)); };
    bekle();
    return () => {
      iptal = true; cancelAnimationFrame(anim); cancelAnimationFrame(momentum); clearTimeout(tekerT); clearTimeout(ziplaT); ro.disconnect(); hrk(); document.removeEventListener('keydown', tus); hKap.removeEventListener('pointerdown', hBas); hKap.removeEventListener('click', hTik); hKap.removeEventListener('click', kTik);
      s.removeEventListener('pointerdown', basla); document.removeEventListener('pointermove', hareket); document.removeEventListener('pointerup', birak); document.removeEventListener('pointercancel', birak);
      s.removeEventListener('click', tikYakala, true); s.removeEventListener('click', tik); s.removeEventListener('gm-degisim', degis); s.removeEventListener('wheel', teker);
      if (bar) bar.style.removeProperty('--gm-alfa');
    };
  };
})();
