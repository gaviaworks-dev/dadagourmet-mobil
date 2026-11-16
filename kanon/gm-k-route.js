/* Dada Route referans alternatifleri parçaları (ekranlar/route-ref.js: ref-route-1..4). Gourmet kanonunda karşılığı olmayan parçalar; her biri en yakın kanon ailesinden türer, satır başında yazılı.
   Kural (DADA-ROUTE-REFERANS §7): gurme durak renkli ve fotoğraflı, yol katmanı (yakıt, şarj, ibadet, dinlenme) gri ve küçük; puan, yorum, fiyat uydurulmaz.
   API: GM.saatNokta · GM.lezzetEgri · GM.dagilimCubuk · GM.bolgePaket · GM.kesifKategoriler · GM.gecisRehber · GM.planCubuk · GM.yonPanel · GM.sapmaSatir · GM.yolPano · GM.zamanAkis · GM.lezzetKesim · GM.kesifKart */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, at = GM.at, liste = (...a) => a.filter(Boolean).join(' ');
  const bg = src => (src ? ` style="background-image:url('${esc(src)}')"` : '');
  const KATMAN = ['yakit', 'sarj', 'ibadet', 'dinlenme', 'karavan'];
  // Türkçe saat yazımı: dakika → "08.40" (GM.saatMetin iki nokta üst üste yazar).
  GM.saatNokta = dk => GM.saatMetin(((dk % 1440) + 1440) % 1440).replace(':', '.');

  // ---------- Lezzet eğrisi (komoot yükseklik profili) ----------
  // GM.lezzetProfili ailesi: aynı km ekseni; mekân işaretleri üstte renkli, katman altta gri ve küçük. Eğri = km boyunca önerilen durak yoğunluğu (±12 km çekirdek), GM.rotaOneri'den.
  // Sürükleyince ya da ok tuşuyla imleç gezer, üstteki okuma satırı km · il · yakındaki durak · coğrafi işaret yazar. o: {duraklar, katman, isaret:[{km, metin, tur:'grup'|'il'|'uc', ikon}], secili}
  const egriOku = (v, km) => {
    const il = [...v.I].reverse().find(i => i.km <= km + 1) || v.I[0], yakin = v.D.filter(d => Math.abs(d - km) <= 15).length;
    const enYakin = v.D.length ? Math.round(Math.min(...v.D.map(d => Math.abs(d - km)))) : null, kat = v.K.find(k => Math.abs(k.km - km) <= 8);
    const durak = yakin ? `<b>${yakin} Dada durağı</b> ±15 km` : enYakin != null ? `Dada durağı yok · en yakını ${enYakin} km` : 'Dada durağı yok';
    return `<span class="gm-kr-egri-km"><b>${esc(Math.round(km))}</b><small>km</small></span><span class="gm-satir-metin"><b>${esc(il?.ad || '')}</b><span>${durak}${il?.ye ? ` · ${esc(il.ye)}` : ''}${kat ? ` · ${ik(kat.tur)} ${esc(kat.ad)}` : ''}</span></span>`;
  };
  // Rota kesimleri (komoot yol türü / yüzey şeridi karşılığı): 2 km'lik dilimler, ±15 km içinde önerilen durak varsa "dada", yoksa "il" (yalnız il kimliği ve yol ihtiyacı). Ardışık aynı dilimler birleşir: [{tur, bas, son, km}]
  GM.lezzetKesim = (r, D = []) => { const L = []; for (let x = 0; x < r.km; x += 2) { const tur = D.some(d => Math.abs(d.km - x) <= 15) ? 'dada' : 'il', s = L.at(-1); if (s && s.tur === tur) s.son = Math.min(r.km, x + 2); else L.push({tur, bas: x, son: Math.min(r.km, x + 2)}); } return L.map(k => ({...k, km: Math.round(k.son - k.bas)})); };
  GM.lezzetEgri = (r, o = {}) => {
    const km = r.km, D = (o.duraklar || []).map(d => d.km), W = 342, H = 104, N = 120, sig = 12;
    const yog = Array.from({length: N + 1}, (_, i) => D.reduce((s, d) => s + Math.exp(-((d - i / N * km) ** 2) / (2 * sig * sig)), 0));
    const tepe = Math.max(1, ...yog), y = v => (H - 4 - v / tepe * (H - 16)).toFixed(1);
    const cizgi = yog.map((v, i) => `${i ? 'L' : 'M'}${(i / N * W).toFixed(1)} ${y(v)}`).join('');
    const yuz = v => `${Math.max(0, Math.min(100, v / km * 100)).toFixed(2)}%`;
    const I = (r.iller || []).map(i => { const k = (window.GMV?.ilKimlik || []).find(x => x.ad === i.ad); return {ad: i.ad, km: i.km, ye: k?.tescilli.filter(t => t.tur === 'yenir').slice(0, 1).map(t => t.ad).join('') || ''}; });
    const K = (o.katman || []).filter(k => KATMAN.includes(k.tur));
    const veri = {km, D, I, K: K.map(k => ({km: k.km, tur: k.tur, ad: k.ad}))}, sec = o.secili ?? I[1]?.km ?? km / 2;
    const isaret = (o.isaret || []).map(x => `<span class="${liste('gm-kr-egri-isaret', `is-${x.tur || 'grup'}`)}" style="left:${yuz(x.km)}" title="${esc(x.ad || x.metin)}">${x.ikon ? ik(x.ikon) : `<b>${esc(x.metin)}</b>`}</span>`).join('');
    const kat = K.map((k, n) => `<span class="gm-kr-egri-katman is-${esc(k.tur)}${n % 2 ? ' is-alt' : ''}" style="left:${yuz(k.km)}" title="${esc(k.ad)}">${ik(k.tur)}</span>`).join('');
    const olcek = Array.from({length: Math.floor(km / 100) + 1}, (_, i) => `<span style="left:${yuz(i * 100)}">${i * 100}</span>`).join('');
    return `<figure class="${liste('gm-kr-egri', o.sinif)}" data-egri='${esc(JSON.stringify(veri))}'><div class="gm-kr-egri-oku" aria-live="polite">${egriOku(veri, sec)}</div><div class="gm-kr-egri-isaretler">${isaret}</div><div class="gm-kr-egri-alan" tabindex="0" role="slider" aria-label="Rota boyunca km" aria-valuemin="0" aria-valuemax="${Math.round(km)}" aria-valuenow="${Math.round(sec)}"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path class="gm-kr-egri-dolgu" d="${cizgi}L${W} ${H}L0 ${H}Z"/><path class="gm-kr-egri-cizgi" d="${cizgi}"/></svg>${I.slice(1).map(i => `<i class="gm-kr-egri-il" style="left:${yuz(i.km)}"></i>`).join('')}<span class="gm-kr-egri-imlec" style="left:${yuz(sec)}"></span></div>${o.kesim === false ? '' : `<div class="gm-kr-egri-kesim" role="img" aria-label="${esc(GM.lezzetKesim(r, o.duraklar).map(k => `${k.bas}–${Math.round(k.son)}. km ${k.tur === 'dada' ? 'Dada durağı kesimi' : 'il kimliği kesimi'}`).join(', '))}">${GM.lezzetKesim(r, o.duraklar).map(k => `<i class="is-${k.tur}" style="flex:${(k.son - k.bas).toFixed(1)}"></i>`).join('')}</div>`}<div class="gm-kr-egri-katmanlar">${kat}</div><div class="gm-kr-egri-olcek" aria-hidden="true">${olcek}</div>${o.not ? `<figcaption>${GM.vurgu(o.not)}</figcaption>` : ''}</figure>`;
  };
  const egriGit = (f, km) => {
    const v = JSON.parse(f.dataset.egri), k = Math.max(0, Math.min(v.km, km)), a = f.querySelector('.gm-kr-egri-alan');
    f.querySelector('.gm-kr-egri-imlec').style.left = `${(k / v.km * 100).toFixed(2)}%`; a.setAttribute('aria-valuenow', Math.round(k));
    f.querySelector('.gm-kr-egri-oku').innerHTML = egriOku(v, k);
  };
  let egriSur = null;
  const egriKm = (a, x) => { const r = a.getBoundingClientRect(), v = JSON.parse(a.closest('.gm-kr-egri').dataset.egri); return (x - r.left) / r.width * v.km; };
  document.addEventListener('pointerdown', ev => { const a = ev.target.closest?.('.gm-kr-egri-alan'); if (!a) return; egriSur = {a, id: ev.pointerId}; try { a.setPointerCapture(ev.pointerId); } catch { /* yok */ } egriGit(a.closest('.gm-kr-egri'), egriKm(a, ev.clientX)); });
  document.addEventListener('pointermove', ev => { if (!egriSur || ev.pointerId !== egriSur.id) return; egriGit(egriSur.a.closest('.gm-kr-egri'), egriKm(egriSur.a, ev.clientX)); });
  const egriBirak = ev => { if (egriSur && ev.pointerId === egriSur.id) { egriSur = null; GM.titres?.(); } };
  document.addEventListener('pointerup', egriBirak); document.addEventListener('pointercancel', egriBirak);
  document.addEventListener('keydown', ev => { const a = ev.target.closest?.('.gm-kr-egri-alan'); if (!a || !['ArrowLeft', 'ArrowRight'].includes(ev.key)) return; ev.preventDefault(); egriGit(a.closest('.gm-kr-egri'), +a.getAttribute('aria-valuenow') + (ev.key === 'ArrowRight' ? 10 : -10)); });

  // ---------- Dağılım çubuğu (komoot yol türü / yüzey dağılımı) ----------
  // GM.ilerleme çubuğu ailesi: parçalı tek çubuk + lejant satırları (GM.satir ritmi). ton: 1..4 mor tonları (gurme), notr (yol katmanı, gri). o: {baslik, alt, ogeler:[{ad, sayi, birim, ton, ikon}], kucuk}
  GM.dagilimCubuk = (o = {}) => {
    const L = (o.ogeler || []).filter(x => x.sayi > 0);
    return `<figure class="${liste('gm-kr-dagilim', o.kucuk && 'is-kucuk', o.sinif)}">${o.baslik ? `<figcaption><b>${esc(o.baslik)}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</figcaption>` : ''}<span class="gm-kr-dagilim-cubuk" role="img" aria-label="${esc(L.map(x => `${x.ad} ${x.sayi}`).join(', '))}">${L.map(x => `<i class="is-ton-${esc(x.ton || 1)}" style="flex:${+x.sayi}"></i>`).join('')}</span><ul class="gm-kr-dagilim-lejant">${L.map(x => `<li class="is-ton-${esc(x.ton || 1)}"><i aria-hidden="true">${x.ikon ? ik(x.ikon) : ''}</i><span>${esc(x.ad)}</span><b>${esc(x.sayi)}${x.birim ? ` <small>${esc(x.birim)}</small>` : ''}</b></li>`).join('')}</ul></figure>`;
  };

  // ---------- Bölge paketi (komoot çevrimdışı bölge) ----------
  // GM.webdenRota bant ailesi: ikon kutusu + bölge adları + içerik + boyut + tek eylem. o: {bolgeler, alt, boyut, indirildi}
  GM.bolgePaket = (o = {}) => `<section class="${liste('gm-kr-paket', o.indirildi && 'is-indi')}"><span class="gm-kr-paket-ikon">${ik(o.indirildi ? 'onay' : 'cevrimdisi')}</span><span class="gm-satir-metin"><small>${esc(o.ust || 'Çevrimdışı bölge paketi')}</small><b>${esc((o.bolgeler || []).join(' + '))}</b><span>${esc(o.alt || '')}</span></span>${GM.btn(o.indirildi ? {metin: 'Cihazda', ikon: 'onay', tur: 'tonal', boyut: 'sm', veri: {eylem: 'paket-indir'}, attrs: 'aria-pressed="true"'} : {metin: o.boyut ? `İndir · ${o.boyut}` : 'İndir', ikon: 'cevrimdisi', tur: 'secondary', boyut: 'sm', veri: {eylem: 'paket-indir'}})}</section>`;

  // ---------- Keşif kategorileri (Roadtrippers "Explore") ----------
  // GM.katmanCip ailesi (aynı tür renkleri), dikey düzen: yuvarlak ikon + ad + sayı; tek seçim, kanon çip grubu davranışı (data-cip-grup="tek", gm-degisim). o: {ad, secili, ogeler:[{deger, metin, ikon, tur, sayi}]}
  GM.kesifKategoriler = (o = {}) => `<div class="${liste('gm-kr-kesif', o.sinif)}" role="group" data-cip-grup="tek" data-ad="${esc(o.ad || 'kesif')}" aria-label="${esc(o.etiket || 'Rota boyunca keşfet')}">${(o.ogeler || []).map(x => `<button type="button" class="gm-kr-kesif-oge is-${esc(x.tur || x.deger)}" data-cip="${esc(x.deger)}" aria-pressed="${x.deger === o.secili}"><span class="gm-kr-kesif-ikon">${ik(x.ikon || x.tur)}</span><span class="gm-kr-kesif-ad">${esc(x.metin)}</span><small>${esc(x.sayi ?? '')}</small></button>`).join('')}</div>`;

  // ---------- Keşif kartı (Roadtrippers yer kartı) ----------
  // GM.mekanKart harita türünden türer (aynı foto, tek değer etiket, ad, sapma · fiyat, [puan varsa] · açık durumu; kart-cila 13.11); eylem sağda dikey ikon + etiket (Roadtrippers "Add"), kart tek satır boyunda. o: {sapma:{dk, km}, eklendi, secili}
  GM.kesifKart = (m, o = {}) => { const git = `#/mekan/${m.slug}`; return `<article class="${liste('gm-mk-harita', 'gm-kr-kk', o.secili && 'is-secili')}" data-mekan="${esc(m.slug)}"><a class="gm-mk-harita-foto" href="${esc(git)}" data-git="${esc(git)}" tabindex="-1" aria-label="${esc(m.ad)}">${m.kapak ? `<span class="gm-photo"${bg(m.kapak)}></span>` : `<span class="gm-photo is-yok" aria-hidden="true">${ik('mekan')}</span>`}</a><div class="gm-mk-satir-metin"><a class="gm-card__text" href="${esc(git)}" data-git="${esc(git)}"><h3 class="gm-card__title gm-kirp-1">${esc(m.ad)}</h3></a>${GM.mekanMetaSatir([o.sapma ? GM.sapma(o.sapma) : '', GM.acikDurum(m.acik), GM.fiyat(m.fiyat), GM.mekanPuan(m)])}</div><button type="button" class="gm-kr-kk-ekle" data-eylem="${o.eklendi ? 'durak-cikar' : 'durak-ekle'}" data-id="${esc(m.slug)}" aria-pressed="${!!o.eklendi}" aria-label="${esc(o.eklendi ? `${m.ad} rotada, çıkar` : `${m.ad} durağını rotaya ekle`)}"><span>${ik(o.eklendi ? 'onay' : 'ekle')}</span><small>${o.eklendi ? 'Rotada' : 'Ekle'}</small></button></article>`; };

  // ---------- Geçiş rehberi kartı (Roadtrippers "Interstate Exit Guides") ----------
  // GM.ilKart ailesi (aynı coğrafi işaret listesi), solda yol levhası gibi km plakası; Ye / Al / Dada / Yol satırları. o: {km, il, bolge, ye, al, mekan, yol, secili}
  GM.gecisRehber = (o = {}) => `<article class="${liste('gm-kr-gecis', o.secili && 'is-secili')}" data-durak="${esc(o.id || '')}"><span class="gm-kr-gecis-plaka" aria-label="${esc(`${o.km}. km`)}"><small>km</small><b>${esc(o.km)}</b></span><div class="gm-kr-gecis-govde"><small class="gm-card__category">${esc(o.bolge || 'İl geçişi')}</small><b class="gm-kr-gecis-ad gm-kirp-1">${esc(o.il)}</b><dl>${[['neYenir', 'Ye', o.ye], ['neAlinir', 'Al', o.al], ['mekan', 'Dada', o.mekan], ['yolUstu', 'Yol', o.yol]].filter(x => x[2]).map(([i, e, m]) => `<div class="is-${i}"><dt>${ik(i)}<span>${e}</span></dt><dd class="gm-kirp-1">${esc(m)}</dd></div>`).join('')}</dl></div></article>`;

  // ---------- Güzergâh çubuğu (Roadtrippers "View itinerary") ----------
  // GM.yuzenDugme birincil gövdesinden türer, tam genişlik; durak sayısı rozetli ikon + özet + yukarı ok. Ekranın tek birincil eylemi. o: {metin, ozet, sayi, veri}
  GM.planCubuk = (o = {}) => `<button type="button" class="${liste('gm-kr-plan', o.sinif)}"${at({veri: o.veri, git: o.git})} aria-haspopup="dialog"><span class="gm-kr-plan-ikon">${ik('rota')}${o.sayi ? `<b>${esc(o.sayi)}</b>` : ''}</span><span class="gm-kr-plan-metin"><b>${esc(o.metin)}</b><small>${esc(o.ozet || '')}</small></span>${ik('chevron-up', 'gm-kr-plan-ok')}</button>`;

  // ---------- Yön paneli (Google Maps yol tarifi başlığı) ----------
  // GM.planlayici kapsülü ailesi (aynı ray düğümleri ve alan dizgesi); geri + iki alan + yer değiştir; altında isteğe bağlı satır (araç segmenti). o: {nereden, nereye, git, alt}
  GM.yonPanel = (o = {}) => `<div class="${liste('gm-kr-yon', o.sinif)}"><div class="gm-kr-yon-ust">${GM.ikonBtn({ikon: 'geri', etiket: 'Geri', attrs: 'data-geri'})}<a class="gm-kr-yon-alanlar" href="${esc(o.git || '#/rota/planla')}" data-git="${esc(o.git || '#/rota/planla')}"><span class="gm-plan-ray" aria-hidden="true"><i></i><b></b><i></i></span><span class="gm-plan-alanlar"><span class="gm-plan-alan"><small>Nereden</small><b>${esc(o.nereden)}</b></span><span class="gm-plan-alan"><small>Nereye</small><b>${esc(o.nereye)}</b></span></span></a>${GM.ikonBtn({ikon: 'muadil', etiket: 'Kalkış ve varışı değiştir', veri: {eylem: 'yon-degistir'}, sinif: 'gm-kr-yon-degis'})}</div>${o.alt ? `<div class="gm-kr-yon-alt">${o.alt}</div>` : ''}</div>`;

  // ---------- Sapma satırı (Google Maps "rota boyunca ara" sonucu, Waze sağ kolon) ----------
  // GM.durakKart ailesi (aynı foto / tür ikon kutusu ve metin dizgesi); sapma süresi sağ kolonda hizalı; katman satırı (is-katman) küçük ve gri. d: {id, tur, mekan, ad, alt}; o: {sapma, km, eklendi, secili, eylem:false}
  GM.sapmaSatir = (d, o = {}) => {
    const m = d.mekan, tur = m ? 'mekan' : d.tur, katman = KATMAN.includes(tur), git = m ? `#/mekan/${m.slug}` : null, yol = o.sapma <= 2;
    const kutu = m?.kapak ? `<span class="gm-dk-foto"><span class="gm-photo"${bg(m.kapak)}></span></span>` : `<span class="gm-dk-ikon is-${esc(tur)}">${ik(d.ikon || tur)}</span>`;
    const alt = [m ? [m.kategori, m.ilce || m.il].filter(Boolean).join(' · ') : d.alt, o.km != null ? (o.km < 1 ? 'kalkışta' : `${o.km}. km`) : ''].filter(Boolean).join(' · ');
    const eylem = o.eylem === false ? '' : GM.ikonBtn(o.eklendi ? {ikon: 'onay', etiket: 'Rotada, çıkar', tur: 'tint', secili: true, veri: {eylem: 'durak-cikar', id: d.id}} : {ikon: 'ekle', etiket: `${m ? m.ad : d.ad} durağını ekle`, veri: {eylem: 'durak-ekle', id: d.id}});
    return `<article class="${liste('gm-kr-ss', katman && 'is-katman', o.secili && 'is-secili', o.eklendi && 'is-eklendi')}" data-durak="${esc(d.id || '')}">${kutu}<${git ? `a href="${esc(git)}" data-git="${esc(git)}"` : 'div'} class="gm-satir-metin"><b class="gm-kirp-1">${esc(m ? m.ad : d.ad)}</b><small class="gm-kirp-1">${esc(alt)}</small>${m ? `<span class="gm-mk-meta is-tek">${GM.acikDurum(m.acik)}${GM.fiyat(m.fiyat)}</span>` : ''}</${git ? 'a' : 'div'}><span class="${liste('gm-kr-ss-sapma', yol && 'is-yolustu')}" aria-label="${esc(yol ? 'Yol üstü' : `Rotadan ${o.sapma} dakika sapma`)}">${yol ? `${ik('yolUstu')}<small>Yol üstü</small>` : `<b>+${esc(o.sapma)}</b><small>dk</small>`}</span>${eylem}</article>`;
  };

  // ---------- Yolculuk panosu (Flighty uçuş kartı / Canlı Etkinlik) ----------
  // GM.canliKart koyu yüzeyi + GM.rotaBilet uç düzeni: kod + büyük saat, araç çizgisi, ilerleme yayı, ortada tek durum cümlesi. o: {ust, sag, kalkis:{kod, saat, alt}, varis:{...}, ilerleme 0..1, durum, durumAlt, canli}
  GM.yolPano = (o = {}) => {
    const k = o.kalkis || {}, v = o.varis || {}, p = Math.max(0, Math.min(1, +o.ilerleme || 0)), x = 24 + p * 292;
    // Yay üstündeki y: düz (34) → yumuşak çıkış (24–104) → tepe (8) → iniş (236–316); smoothstep.
    const ss = t => t * t * (3 - 2 * t), y = x <= 24 || x >= 316 ? 34 : x < 104 ? 34 - 26 * ss((x - 24) / 80) : x <= 236 ? 8 : 8 + 26 * ss((x - 236) / 80);
    return `<section class="${liste('gm-kr-pano', o.sinif)}" aria-label="${esc(`${k.kod} ${k.saat} kalkış, ${v.kod} ${v.saat} varış. ${o.durum || ''}`)}"><header class="gm-kr-pano-ust"><small>${o.canli ? '<i class="gm-kr-pano-nabiz" aria-hidden="true"></i>' : ''}${esc(o.ust || 'Dada Route')}</small><small>${esc(o.sag || '')}</small></header><div class="gm-kr-pano-yol"><span class="gm-kr-pano-uc"><b>${esc(k.kod)}</b><em>${esc(k.saat)}</em><small>${esc(k.alt || '')}</small></span><span class="gm-kr-pano-arac" aria-hidden="true"><i></i>${ik('arac')}<i></i></span><span class="gm-kr-pano-uc is-varis"><b>${esc(v.kod)}</b><em>${esc(v.saat)}</em><small>${esc(v.alt || '')}</small></span></div><svg class="gm-kr-pano-yay" viewBox="0 0 340 40" preserveAspectRatio="none" aria-hidden="true"><path class="is-zemin" d="M0 34H24C64 34 64 8 104 8H236C276 8 276 34 316 34H340"/><path class="is-dolu" d="M0 34H24C64 34 64 8 104 8H236C276 8 276 34 316 34H340" pathLength="1" style="stroke-dasharray:${(x / 340).toFixed(3)} 1"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5"/></svg><p class="gm-kr-pano-durum"><b>${esc(o.durum || '')}</b>${o.durumAlt ? `<small>${esc(o.durumAlt)}</small>` : ''}</p></section>`;
  };

  // ---------- Zaman akışı (Flighty yolculuk zaman çizelgesi) ----------
  // GM.rotaSerit ray ailesi + GM.zamanCizelge halleri: solda saat kolonu (büyük saat + fark), rayda tür düğümü, sağda olay; olaylar arası sürüş satırı.
  // tur: uc (kalkış/varış) · il (il geçişi, coğrafi işaret) · katman (yakıt vb., küçük gri) · mekan (fotoğraflı durak kartı). l: [{saat, fark, tur, ikon, etiket, baslik, alt, rozet:{metin, ton}, html, sonra, gecildi, simdi}]
  GM.zamanAkis = (l = [], o = {}) => `<ol class="${liste('gm-kr-za', o.sinif)}">${l.map((x, i) => `<li class="${liste('gm-kr-za-oge', `is-${x.tur || 'il'}`, i === 0 && 'is-ilk', i === l.length - 1 && 'is-son', x.gecildi && 'is-gecildi', x.simdi && 'is-simdi')}"><span class="gm-kr-za-saat"><b>${esc(x.saat)}</b>${x.fark ? (x.farkEylem ? `<button type="button" class="gm-kr-za-fark"${at({veri: x.farkEylem})} aria-label="${esc(`${x.fark}, mola süresini değiştir`)}">${esc(x.fark)}${ik('duzenle')}</button>` : `<small>${esc(x.fark)}</small>`) : ''}</span><span class="gm-kr-za-ray" aria-hidden="true"><i>${ik(x.ikon || {uc: 'baslangic', il: 'cografi', mekan: 'mekan'}[x.tur] || x.tur)}</i></span><div class="gm-kr-za-icerik">${x.etiket ? `<small class="gm-kr-za-etiket">${esc(x.etiket)}${x.rozet ? GM.rozet({...x.rozet, sinif: 'gm-kr-za-rozet'}) : ''}</small>` : ''}${x.baslik ? `<b class="gm-kr-za-baslik">${esc(x.baslik)}</b>` : ''}${x.alt ? `<span class="gm-kr-za-alt">${esc(x.alt)}</span>` : ''}${x.html || ''}${x.sonra ? `<p class="gm-kr-za-surus">${ik('arac')}<span>${esc(x.sonra)}</span></p>` : ''}</div></li>`).join('')}</ol>`;

  // ---------- Düzen ve başlık parçaları (ekran dosyası ham kap yazmasın) ----------
  // Tur başlığı (komoot tur sayfası üstü): GM.rehberManset metin dizgesinden türer; rozet satırı + başlık + alt satır + metrik şeridi (GM.ozetSerit). o: {rozetler:[{metin, ikon, ton}], baslik, alt, metrik:[ozetSerit ögeleri]}
  GM.turBaslik = (o = {}) => `<header class="${liste('gm-kr-tur', o.sinif)}">${o.rozetler?.length ? `<p class="gm-kr-tur-rozet">${o.rozetler.map(GM.rozet).join('')}</p>` : ''}<h1 class="gm-t-page">${esc(o.baslik)}</h1>${o.alt ? `<p class="gm-kr-tur-alt gm-tek-satir"><span>${GM.vurgu(o.alt)}</span></p>` : ''}${o.metrik ? GM.ozetSerit(o.metrik) : ''}</header>`;
  // Dikey kart listesi (GM.durakKart, GM.sapmaSatir, GM.dagilimCubuk dizgeleri): gm-yigin-8 aralığı; isteğe bağlı küçük başlık satırı (numara ya da ikon dairesi; tur: cografi | katman ikon tonu). o: {baslik, alt, sira, ikon, tur}
  GM.krListe = (l = [], o = {}) => `<div class="${liste('gm-kr-liste', o.sinif)}">${o.baslik ? `<div class="${liste('gm-kr-liste-bas', o.tur && `is-${o.tur}`)}">${o.sira != null ? `<b class="gm-kr-liste-sira">${esc(o.sira)}</b>` : o.ikon ? ik(o.ikon) : ''}<span><b>${esc(o.baslik)}</b>${o.alt ? `<small class="gm-kirp-1">${esc(o.alt)}</small>` : ''}</span>${o.eylem ? `<span class="gm-kr-liste-eylem">${o.eylem}</span>` : ''}</div>` : ''}${l.join('')}</div>`;
  // Yön özeti (Google Maps yol tarifi sheet başı): GM.cekmece başlık dizgesi (gm-kl-cekmece-ozet) türevi; büyük süre birincil renkte + km + alt satır + tek eylem. o: {sure, km, alt, eylem (html)}
  // o.vurgu === false: süre mürekkep renginde (ana yön çekmecesi); o.varis: "Varış 16.50" süre satırının yanında.
  GM.yonOzet = (o = {}) => `<p class="${liste('gm-kr-yonozet', o.vurgu === false && 'is-sade')}"><b><em>${esc(o.sure)}</em>${o.km ? ` <span>(${esc(o.km)})</span>` : ''}</b>${o.alt || o.varis ? `<small>${o.varis ? `<strong>Varış ${esc(o.varis)}</strong> · ` : ''}${esc(o.alt || '')}</small>` : ''}</p>${o.eylem || ''}`;

  // =====================================================================
  // Web paritesi (Görev 11, docs/ROUTE-WEB-MOBIL-FARK.md): web Dada Route'ta olup çeşitlerde eksik kalan üç parça. Hepsi sheet; ana ekranı yığmaz.
  // =====================================================================
  // ---------- Rotadaki mekânlar (web "Tüm Mekânlar" #viewAll: arama + Hızlı filtreler + Yol üstü / Yola yakın sayacı + sonuç yok önerileri) ----------
  // Çipler web'in 14 hızlı filtresi (rota_hizli_filtreleri göçü, aynı sıra ve ad). Verisi olmayan çip web'deki gibi pasif (dada-route.js renderFilterBar):
  // Öğle, Kahve, Tatlı, Yöresel mekân verisinde alan yok. Sapma çipleri web detour_tier kuralı: tam yol üstü = rotaya ≤ 1 km, N dk = sapma ≤ N.
  const ves = (d, v) => (d.mekan?.f?.vesile || []).includes(v);
  GM.ROTA_FILTRE = [
    {deger: 'tumu', metin: 'Tümü', f: () => true}, {deger: 'tam', metin: 'Tam Yol Üstü', f: d => d.uzak <= 1},
    {deger: 'dk5', metin: '5 dk’ya kadar', f: d => d.uzak <= 1 || d.sapma <= 5}, {deger: 'dk10', metin: '10 dk’ya kadar', f: d => d.uzak <= 1 || d.sapma <= 10}, {deger: 'dk20', metin: '20 dk’ya kadar', f: d => d.uzak <= 1 || d.sapma <= 20},
    {deger: 'acik', metin: 'Şu An Açık', f: d => d.mekan?.acik === true}, {deger: 'kahvalti', metin: 'Kahvaltı', f: d => ves(d, 'kahvalti')}, {deger: 'ogle', metin: 'Öğle Yemeği'},
    {deger: 'aksam', metin: 'Akşam Yemeği', f: d => ves(d, 'aksam-yemegi')}, {deger: 'kahve', metin: 'Kahve'}, {deger: 'tatli', metin: 'Tatlı'}, {deger: 'yoresel', metin: 'Yöresel Lezzet'},
    {deger: 'hizli', metin: 'Hızlı Mola', f: d => ves(d, 'hizli-yemek')},
    {deger: 'aile', metin: 'Aileye Uygun', f: d => ves(d, 'aile-yemegi') || (d.mekan?.hizmet || []).includes('Çocuk Sandalyesi') || (d.mekan?.nitelik || []).some(n => n.ad === 'Çocuk alanı')}];
  // o: {rota, eklenen: [slug], ekle(d), cikar(d), filtre}. Liste yolculuk sırasıyla (web §8), kart dokunuşu mekân detayına gider (Kaydet, Paylaş, Ziyaret, Hata orada).
  GM.rotaMekanlarSheet = (o = {}) => {
    const R = o.rota, D = GM.rotaOneri(R), s = {filtre: o.filtre || 'tumu', q: ''}, F = k => GM.ROTA_FILTRE.find(x => x.deger === k) || GM.ROTA_FILTRE[0];
    const ekli = d => (o.eklenen?.() || []).includes(d.slug);
    const sonuc = () => D.filter(d => F(s.filtre).f(d) && (!s.q || `${d.mekan.ad} ${d.mekan.ilce || ''} ${d.mekan.il || ''} ${d.mekan.kategori || ''}`.toLocaleLowerCase('tr').includes(s.q)));
    const cipler = () => GM.cipler({ad: 'rm-filtre', tur: 'tek', etiket: 'Hızlı filtreler', secili: s.filtre, ogeler: GM.ROTA_FILTRE.map(x => ({deger: x.deger, metin: x.metin, pasif: !x.f}))});
    const liste_ = () => { const l = sonuc(), yol = l.filter(d => d.uzak <= 1).length;
      const meta = `<p class="gm-kr-rm-meta gm-tek-satir"><b>${GM.sayi(l.length)} mekân</b><span class="gm-nokta" aria-hidden="true">·</span><span>Yol üstü ${GM.sayi(yol)}</span><span class="gm-nokta" aria-hidden="true">·</span><span>Yola yakın ${GM.sayi(l.length - yol)}</span></p>`;
      if (l.length) return meta + GM.yigin(l.map(d => GM.durakKart({...d, id: d.slug}, {sapma: {dk: d.uzak <= 1 ? 1 : d.sapma, km: d.km}, eklendi: ekli(d)})), 8);
      // Sonuç yok (web renderNoResults): toleransı artır · tüm yakın mekânlar · yeni mekân öner (alternatif rota çeşidin kendi ekranında).
      const genis = {tam: 'dk5', dk5: 'dk10', dk10: 'dk20'}[s.filtre];
      return meta + GM.bos({ikon: 'mekan', baslik: 'Bu güzergâhta uygun Dada durağı yok', metin: 'Süzgeci gevşet ya da bildiğin bir mekânı öner.'}) + GM.satirlar([genis ? {ikon: 'yon', baslik: 'Sapma toleransını artır', alt: F(genis).metin, ok: true, veri: {eylem: 'rm-genis', id: genis}} : null, s.filtre !== 'tumu' || s.q ? {ikon: 'katman', baslik: 'Tüm yakın mekânları gör', ok: true, veri: {eylem: 'rm-tumu'}} : null, {ikon: 'ekle', baslik: 'Yeni mekân öner', alt: 'Mekânlar sayfasında öneri formu', ok: true, git: '#/mekanlar'}].filter(Boolean)); };
    return GM.sheet({baslik: 'Rotadaki mekânlar', tam: true, sinif: 'gm-kr-rm-sheet', html: `<div class="gm-yigin">${GM.arama({yer: 'Mekân ara', ad: 'rm-ara', sonuc: false})}<div data-rm-cip>${cipler()}</div><div data-rm-liste>${liste_()}</div></div>`, sonra: (k, h) => {
      const yaz = () => { k.querySelector('[data-rm-liste]').innerHTML = liste_(); };
      const cip = () => { k.querySelector('[data-rm-cip]').innerHTML = cipler(); };
      const inp = k.querySelector('input[type="search"]'), ara = () => { s.q = (inp.value || '').trim().toLocaleLowerCase('tr'); yaz(); };
      inp?.addEventListener('input', ara);
      const deg = ev => { if (ev.detail?.ad !== 'rm-filtre') return; s.filtre = [].concat(ev.detail.deger)[0] || 'tumu'; yaz(); };
      const tik = ev => { const b = ev.target.closest('[data-eylem]'); if (!b) return; const e = b.dataset.eylem, d = D.find(x => x.slug === b.dataset.id);
        if (e === 'durak-ekle' && d) { o.ekle?.(d); yaz(); } else if (e === 'durak-cikar' && d) { o.cikar?.(d); yaz(); } else if (e === 'rm-genis') { s.filtre = b.dataset.id; cip(); yaz(); } else if (e === 'rm-tumu') { s.filtre = 'tumu'; s.q = ''; if (inp) inp.value = ''; cip(); yaz(); } };
      k.addEventListener('gm-degisim', deg); k.addEventListener('click', tik);
      return () => { inp?.removeEventListener('input', ara); k.removeEventListener('gm-degisim', deg); k.removeEventListener('click', tik); };
    }});
  };

  // ---------- Güzergâhımı Kaydet (web form.blade.php #ygSave + misafir kapısı #ygSaveGate) ----------
  // Misafir: GM.uyeDuvar ("Rotanı kaybetme."; "Şimdi değil" = web "Kaydetmeden Devam Et"). Üye: ad alanı en çok 64 karakter, varsayılan "Kalkış → Varış" (web autoRouteName).
  GM.rotaKaydet = (R, o = {}) => {
    if (!GM.uye()) return GM.uyeDuvar({baslik: 'Rotanı kaybetme.', metin: 'Rotanı daha sonra tekrar kullanmak için **hesabına kaydet**; Güzergâhlarım her cihazda açılır.'});
    const adlar = GM.durum.oku('rota-adlar', {}) || {}, kayitli = new Set(GM.durum.oku('rota-kayitli', []) || []);
    // o.cevrimdisi: patron belgesi §3E "Kaydet: çevrimdışı erişim ve sonra kullanmak üzere profile kaydeder" → kayıtla birlikte çevrimdışı paket anahtarı (GM.rotaPaketler).
    const indi = () => GM.rotaPaketler?.().some(p => p.id === R.id);
    const cd = o.cevrimdisi ? GM.toggle({ad: 'rk-cevrimdisi', ikon: 'cevrimdisi', etiket: 'Çevrimdışı da indir', alt: `Harita, duraklar, telefonlar · ${GM.rotaPaketMB(R)} MB`, secili: indi() || !kayitli.has(R.id)}) : '';
    return GM.sheet({baslik: kayitli.has(R.id) ? 'Kayıtlı güzergâh' : 'Güzergâhımı kaydet', html: `<div class="gm-yigin">${GM.input({ad: 'rk-ad', etiket: 'Güzergâh adı', ikon: 'duzenle', deger: adlar[R.id] || `${R.kalkis} → ${R.varis}`, yer: 'Kalkış → Varış', yardim: 'En çok 64 karakter'})}${cd}${GM.p(`${GM.sayi(Math.round(R.km))} km · ${GM.rotaSayiMetin(R)}. Kaydettiğin rota **Güzergâhlarım**’da durur; webde aynı hesapla açılır.`, {ton: 'ikincil'})}</div>`,
      altBar: kayitli.has(R.id) ? GM.btnIkili({metin: 'Kaydı kaldır', veri: {eylem: 'rk-sil'}}, {metin: 'Adı güncelle', ikon: 'kaydet', veri: {eylem: 'rk-kaydet'}}) : GM.btn({metin: 'Güzergâhımı Kaydet', ikon: 'kaydet', tam: true, veri: {eylem: 'rk-kaydet'}}),
      sonra: (k, h) => {
        const inp = k.querySelector('input[name="rk-ad"]'); if (inp) inp.maxLength = 64;
        let cdAcik = o.cevrimdisi ? (indi() || !kayitli.has(R.id)) : false;
        const cdD = GM.on(k, 'rk-cevrimdisi', v => { cdAcik = !!v; });
        const a = GM.eylem(k, 'rk-kaydet', () => { const ad = (inp?.value || '').trim().slice(0, 64) || `${R.kalkis} → ${R.varis}`; GM.durum.yaz('rota-adlar', {...(GM.durum.oku('rota-adlar', {}) || {}), [R.id]: ad}); const l = new Set(GM.durum.oku('rota-kayitli', []) || []); l.add(R.id); GM.durum.yaz('rota-kayitli', [...l]); if (o.cevrimdisi && cdAcik !== indi()) GM.rotaIndir(R, cdAcik); h.kapat(); GM.toast(`**${ad}** Güzergâhlarım’a kaydedildi${o.cevrimdisi && cdAcik ? ` · çevrimdışı iniyor (${GM.rotaPaketMB(R)} MB)` : ''}`, {tur: 'basari', ikon: 'kaydet', eylem: 'Güzergâhlarım', onEylem: () => GM.git('#/rota/rotalarim')}); o.degisti?.(); });
        const b = GM.eylem(k, 'rk-sil', () => { const l = new Set(GM.durum.oku('rota-kayitli', []) || []); l.delete(R.id); GM.durum.yaz('rota-kayitli', [...l]); h.kapat(); GM.toast('Güzergâh Güzergâhlarım’dan çıkarıldı', {ikon: 'kaydet'}); o.degisti?.(); });
        return () => { a(); b(); cdD(); };
      }});
  };
  GM.rotaKayitliMi = R => (GM.durum.oku('rota-kayitli', []) || []).includes(R.id);

  // ---------- Mola süresi (web durak listesi "Tahmini bekleme" ve Güzergâh Planım "Önerilen mola": 15 · 30 · 45 · 60 · 90 dk) ----------
  // o: {ad, dk, sec(dk)}; seçim anında uygulanır, sheet kapanır.
  GM.molaSec = (o = {}) => GM.sheet({baslik: `${o.ad} · mola`, html: `<div class="gm-yigin">${GM.segment({ad: 'mola-dk', etiket: 'Mola süresi', secili: String(o.dk), ogeler: [15, 30, 45, 60, 90].map(x => ({ad: `${x} dk`, deger: String(x)}))})}${GM.p('Mola süresi toplam süreye ve sonraki durakların varış saatine eklenir.', {ton: 'ikincil'})}</div>`,
    sonra: (k, h) => GM.on(k, 'mola-dk', v => { o.sec?.(+v); h.kapat(); })});
})();
/* Aktif rota katmanı (Görev 12 · patron mimari belgesi 15 Kas: 3+4 hibriti iskelet, Komoot istatistik çekmecesi, Google Maps satır/rozet dili).
   Ekranlar: ekranlar/rota-aktif.js (rota-harita, rota-liste, rota-web), ekranlar/rota.js (rota girişi). Sayılar tek kaynak: GM.rotaOneri · GM.rotaKatmani · GMV.ilKimlik.
   API: GM.ROTA_DURAK_SINIR · GM.rotaKategori · GM.rotaEklenen · GM.yolSatir · GM.rotaUst · GM.kmSerit · GM.ihtiyacOzet · GM.sapmaDagilim · GM.rotaAksiyon · GM.rotaPaketler · GM.rotaWebden */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, at = GM.at, liste = (...a) => a.filter(Boolean).join(' ');
  const bg = src => (src ? ` style="background-image:url('${esc(src)}')"` : '');
  const nokta = '<span class="gm-nokta" aria-hidden="true">·</span>';
  // Bir rotaya eklenebilecek durak sayısı (web paneli dadaroute.php: rota başına 1–10 durak; mekân ve mola durakları birlikte sayılır).
  GM.ROTA_DURAK_SINIR = 10;
  // Rota çizgisinde km'ye düşen nokta (iller verisinde koordinat yok, km var).
  const noktaKm = (R, km) => { const c = R.cizgi, top = c.reduce((a, p, i) => a + (i ? GM.km(c[i - 1], p) : 0), 0), h = km / R.km * top; let s = 0; for (let i = 1; i < c.length; i++) { const d = GM.km(c[i - 1], c[i]); if (s + d >= h) return c[i]; s += d; } return c.at(-1); };
  const ilKimlik = R => (R.iller || []).map(i => ({...i, k: (window.GMV?.ilKimlik || []).find(x => x.ad === i.ad)})).filter(i => i.k);
  const tescil = (i, t) => i.k.tescilli.filter(x => x.tur === t).map(x => x.ad);
  const mekanOge = d => ({id: d.slug, tur: 'mekan', mekan: d.mekan, ad: d.mekan.ad, km: d.km, uzak: d.uzak, sapma: d.sapma, lng: d.lng, lat: d.lat});
  const YOL_ALT = [{deger: 'yakit', metin: 'Yakıt', ikon: 'yakit', turler: ['yakit']}, {deger: 'sarj', metin: 'Şarj', ikon: 'sarj', turler: ['sarj']}, {deger: 'ibadet', metin: 'İbadethane', ikon: 'ibadet', turler: ['ibadet']}, {deger: 'mola', metin: 'Mola', ikon: 'dinlenme', turler: ['dinlenme', 'karavan']}];

  // ---------- Kategoriler (Roadtrippers sayaçlı keşif barı; belge §3B) ----------
  // Ne Yenir? = önerilen gurme duraklar · Ne Alınır? = geçilen illerin coğrafi işaretli ürünleri (il başına bir nokta, sayaç ürün sayısı)
  // Geçiş Rehberi = il geçişleri (il kimliği: tarihî ve kültürel lezzet mirası) · Yol İhtiyaçları = yakıt, şarj, ibadethane, mola (dinlenme + karavan).
  // Elektrikli araçta Yol İhtiyaçları şarj ve uzun mola önce gelir; Ne Yenir? sırasında şarj noktasına 1 km'den yakın mekânlar öne alınır.
  // o: {arac:'yakit'|'ev'} → {kat:[{deger, metin, ikon, tur, sayi}], alt:[{deger, metin, ikon, ogeler}], ogeler:{neYenir, neAlinir, rehber, yol}, lezzet, liste(kat, alt), bul(id)}
  GM.rotaKategori = (R, o = {}) => {
    o = {arac: GM.durum.oku('rota-arac', 'yakit') || 'yakit', ...o};
    const ev = o.arac === 'ev', I = ilKimlik(R);
    // Beyar 16 Kas: Yakıtlı → yalnız akaryakıt, Elektrikli → yalnız şarj istasyonu (öteki tür hiç gösterilmez).
    const K = GM.rotaKatmani(R).filter(k => !String(k.id).startsWith('tarihi') && k.tur !== (ev ? 'yakit' : 'sarj')).map(k => ({...k, sapma: GM.katmanSapma(k)})).sort((a, b) => a.km - b.km);
    const sarj = K.filter(k => k.tur === 'sarj');
    let mekan = GM.rotaOneri(R).map(mekanOge);
    if (ev && sarj.length) mekan = mekan.map((x, n) => ({x, n, s: sarj.some(k => GM.km([k.lng, k.lat], [x.lng, x.lat]) <= 1) ? 0 : 1})).sort((a, b) => a.s - b.s || a.n - b.n).map(y => y.x);
    const il = (i, tur, ek) => { const p = noktaKm(R, i.km); return {id: `${tur === 'neAlinir' ? 'al' : 'il'}-${i.ad}`, tur, ad: i.ad, il: i.ad, bolge: i.bolge, km: Math.round(i.km), lng: p[0], lat: p[1], ...ek}; };
    const alinir = I.filter(i => tescil(i, 'alinir').length).map(i => il(i, 'neAlinir', {urunler: tescil(i, 'alinir')}));
    const rehber = I.filter(i => i.km > 5).map(i => il(i, 'cografi', {ye: tescil(i, 'yenir'), al: tescil(i, 'alinir'), varis: i.km >= R.km - 5}));
    const alt = (ev ? ['sarj', 'mola', 'ibadet'] : ['yakit', 'ibadet', 'mola']).map(d => YOL_ALT.find(a => a.deger === d)).map(a => ({...a, ogeler: K.filter(k => a.turler.includes(k.tur))}));
    const ogeler = {neYenir: mekan, neAlinir: alinir, rehber, yol: K};
    const kat = [
      {deger: 'neYenir', metin: 'Ne Yenir?', ikon: 'neYenir', tur: 'neYenir', sayi: mekan.length},
      {deger: 'neAlinir', metin: 'Ne Alınır?', ikon: 'neAlinir', tur: 'neAlinir', sayi: alinir.reduce((t, x) => t + x.urunler.length, 0)},
      {deger: 'rehber', metin: 'Geçiş Rehberi', ikon: 'cografi', tur: 'cografi', sayi: rehber.length},
      {deger: 'yol', metin: 'Yol İhtiyaçları', ikon: ev ? 'sarj' : 'yakit', tur: ev ? 'sarj' : 'yakit', sayi: K.length}];
    const altBul = a => alt.find(x => x.deger === a) || alt[0];
    return {kat, alt, ogeler, altBul, lezzet: new Set(I.flatMap(i => tescil(i, 'yenir'))).size,
      liste: (k, a) => (k === 'yol' ? altBul(a).ogeler : ogeler[k] || mekan),
      bul: id => mekan.find(x => x.id === id) || K.find(x => x.id === id) || alinir.find(x => x.id === id) || rehber.find(x => x.id === id) || (() => { const d = GM.rotaDuraklari(R).find(y => y.slug === id); return d ? mekanOge(d) : null; })()};
  };
  // Rotaya eklenen duraklar: mekân (rota-<id>.eklenen) + mola durağı (rota-<id>.mola, katman kimliği); kalkış–varış arasında km sırasıyla. d: durum, K: GM.rotaKategori
  GM.rotaEklenen = (d, K) => [...new Set([...(d.eklenen || []), ...(d.mola || [])])].map(id => K.bul(id)).filter(x => x && (x.tur === 'mekan' || !['neAlinir', 'cografi'].includes(x.tur))).sort((a, b) => a.km - b.km);

  // ---------- Yol satırı (Google Maps "rota boyunca" satırı; belge §3C) ----------
  // GM.sapmaSatir ailesinden: solda foto ya da tür ikonu, ad + tek meta satırı (mutfak · açık/kapalı; belge §3C), sağda yeşil "Yol üstü" rozeti ya da "+N dk", altında km, sağ kenarda + Ekle.
  // Aynı satır haritada yüzen mini kart olur (o.yuzen: kâğıt kart + tek ×). İl öğeleri (Ne Alınır?, Geçiş Rehberi) km plakası ve il kartına ok taşır.
  // x: GM.rotaKategori öğesi; o: {eklendi, secili, yuzen, eylem:false, sira}
  const kmMetin = km => (km < 1 ? 'kalkışta' : `${GM.sayi(Math.round(km))}. km`);
  GM.yolSatir = (x, o = {}) => {
    const m = x.mekan, il = x.tur === 'neAlinir' || x.tur === 'cografi', yol = !il && x.uzak <= 1, git = m ? `#/mekan/${m.slug}` : null;
    const kutu = m?.kapak ? `<span class="gm-ra-foto"><span class="gm-photo"${bg(m.kapak)}></span>${o.sira ? `<b class="gm-ra-sira">${esc(o.sira)}</b>` : ''}</span>` : `<span class="gm-ra-ikon is-${esc(x.tur)}">${ik(x.tur)}${o.sira ? `<b class="gm-ra-sira">${esc(o.sira)}</b>` : ''}</span>`;
    const yazi = s => `<span>${esc(s)}</span>`;
    const meta = m ? GM.mekanMetaSatir([yazi(m.mutfak?.[0] || m.kategori || 'Restoran'), GM.acikDurum(m.acik)])
      : x.tur === 'neAlinir' ? GM.mekanMetaSatir([GM.ciRozet({kisa: true}), yazi(`${x.urunler.length} ürün`), yazi(x.urunler.join(', '))])
        : x.tur === 'cografi' ? GM.mekanMetaSatir([x.ye.length ? yazi(`Ye: ${x.ye.slice(0, 2).join(', ')}`) : '', x.al.length ? yazi(`Al: ${x.al.slice(0, 2).join(', ')}`) : '', !x.ye.length && !x.al.length ? yazi(x.bolge || 'İl geçişi') : ''])
          : GM.mekanMetaSatir([yazi(GM.KATMAN_AD[x.tur] || ''), x.alt && x.alt !== x.ad ? yazi(x.alt) : '']);
    const sap = il
      ? (o.yuzen ? `<span class="gm-ra-sapma is-km">${ik(x.tur)}<b>${esc(kmMetin(x.km))}</b><small>${esc(x.bolge || 'İl geçişi')}</small></span>` : `<span class="gm-ra-sapma is-km"><b>${esc(GM.sayi(x.km))}</b><small>km</small></span>`)
      : `<span class="${liste('gm-ra-sapma', yol && 'is-yolustu')}" aria-label="${esc(`${yol ? 'Yol üstü' : `Rotadan ${x.sapma} dakika sapma`}, ${kmMetin(x.km)}`)}">${ik(yol ? 'yolUstu' : 'yon')}<b>${yol ? 'Yol üstü' : `+${esc(x.sapma)} dk`}</b><small>${esc(kmMetin(x.km))}</small></span>`;
    const adHtml = `<b class="gm-ra-ad gm-kirp-1">${esc(m ? m.ad : il ? x.ad : x.ad)}</b>`;
    const metin = git ? `<a class="gm-ra-metin" href="${esc(git)}" data-git="${esc(git)}">${adHtml}${meta}</a>` : `<span class="gm-ra-metin">${adHtml}${meta}</span>`;
    const ekle = o.eylem === false ? '' : il
      ? `<button type="button" class="gm-ra-ekle is-il" data-eylem="il-ac" data-id="${esc(x.il)}" aria-label="${esc(`${x.ad} il kartı`)}"><span>${ik('cografi')}</span><small>İl kartı</small></button>`
      : `<button type="button" class="${liste('gm-ra-ekle', o.eklendi && 'is-ekli')}" data-eylem="${o.eklendi ? 'durak-cikar' : 'durak-ekle'}" data-id="${esc(x.id)}" aria-pressed="${!!o.eklendi}" aria-label="${esc(o.eklendi ? `${x.ad} rotada, çıkar` : `${x.ad} durağını rotaya ekle`)}"><span>${ik(o.eklendi ? 'onay' : 'ekle')}</span><small>${o.eklendi ? 'Rotada' : 'Ekle'}</small></button>`;
    const kapat = o.yuzen ? GM.ikonBtn({ikon: 'kapat', etiket: 'Kartı kapat', tur: 'kutu', sinif: 'gm-ra-kapat', veri: {eylem: 'kart-kapat'}}) : '';
    return `<article class="${liste('gm-ra-satir', `is-${x.tur}`, o.yuzen && 'is-yuzen', o.secili && 'is-secili', o.eklendi && 'is-eklendi')}" data-durak="${esc(x.id)}">${kutu}${metin}${sap}${ekle}${kapat}</article>`;
  };
  GM.yolSatirlar = (l = [], o = {}) => `<div class="gm-ra-satirlar" data-liste>${l.join('')}</div>`;

  // ---------- Araç tipi seçimi (Görev 14/16: seçili hâl açıkça görünür) ----------
  // GM.segment'ten türer: seçili düğme primary dolgulu, beyaz yazı + ikon + onay işareti; seçili olmayan sönük. Aktif harita, liste ve planla aynı bileşeni kullanır.
  GM.aracSecim = (o = {}) => GM.segment({etiket: 'Araç tipi', ...o, sinif: liste('gm-ra-arac', o.sinif), ogeler: [{ad: 'Yakıtlı', deger: 'yakit', ikon: 'yakit'}, {ad: 'Elektrikli', deger: 'ev', ikon: 'sarj'}]});

  // ---------- Üst panel: arama + Yakıtlı/Elektrikli + sayaçlı kategori barı (belge §3B; 4. alternatif üstte, 3. alternatif altında) ----------
  // o: {arama (GM.haritaArama), arac (GM.segment), kategori (GM.kesifKategoriler), alt (yol ihtiyaçları çip şeridi), ek (bant)}
  GM.rotaUst = (o = {}) => `${o.arama || ''}<div class="gm-ra-panel">${o.arac || ''}${o.kategori || ''}</div>${o.alt || ''}${o.ek || ''}`;

  // ---------- Km şeridi (belge §4: "Lezzet profili" çizgi grafiği yerine yatay km şeridi; 1. alternatifin İstanbul – Yalova – Bursa çizgisi) ----------
  // Çizgi kalkıştan varışa; il düğümleri, önerilen duraklar küçük nokta, eklenen duraklar numaralı düğüm.
  // Yığılma kuralı: il adları TEK SATIR. Önce uçlar, sonra ara iller km sırasıyla yerleşir; sığmayan adın düğümü kalır, dokununca adı söylenir.
  // Uca 26 px'ten yakın ara düğüm çizilmez (uç düğümle çakışmasın); iki ara düğüm ve numaralı durakla il düğümü arası en az 14 px. o: {duraklar:[{km}], eklenen:[{id, km, ad}], sinif}
  GM.kmSerit = (R, o = {}) => {
    const km = R.km || 1, W = 330, px = v => v / km * W, yuz = v => `${Math.max(0, Math.min(100, v / km * 100)).toFixed(2)}%`, I = R.iller || [];
    const uc = i => i === 0 || i === I.length - 1;
    const ekX = (o.eklenen || []).map(e => px(e.km));
    const dugum = []; I.forEach((il, n) => { const x = px(il.km); if (uc(n) || (x - px(I[0].km) >= 26 && px(I.at(-1).km) - x >= 26 && dugum.every(d => uc(d.n) || Math.abs(d.x - x) >= 14) && ekX.every(e => Math.abs(e - x) >= 14))) dugum.push({il, n, x}); });
    const gen = d => Math.max(d.il.ad.length, 7) * 6.8 + 6, kutu = d => { const w = gen(d); return d.n === 0 ? [d.x, d.x + w] : d.n === I.length - 1 ? [d.x - w, d.x] : [d.x - w / 2, d.x + w / 2]; };
    const yer = []; [...dugum.filter(d => uc(d.n)), ...dugum.filter(d => !uc(d.n))].forEach(d => { const [a, b] = kutu(d); if (yer.every(([p, q]) => a >= q + 8 || b <= p - 8)) { yer.push([a, b]); d.ad = true; } });
    const kmM = v => kmMetin(v);
    const duraklar = (o.duraklar || []).map(d => `<i class="gm-ra-km-nokta" style="--x:${yuz(d.km)}"></i>`).join('');
    const iller = dugum.map(d => `<button type="button" class="${liste('gm-ra-km-il', d.n === 0 && 'is-bas', d.n === I.length - 1 && 'is-son')}" style="--x:${yuz(d.il.km)}" data-km-il="${esc(d.il.ad)}" data-km="${esc(kmM(d.il.km))}" aria-label="${esc(`${d.il.ad}, ${kmM(d.il.km)}`)}"></button>`).join('');
    const ekli = (o.eklenen || []).map((e, n) => `<button type="button" class="gm-ra-km-durak" style="--x:${yuz(e.km)}" data-eylem="km-durak" data-id="${esc(e.id)}" aria-label="${esc(`${n + 1}. durak: ${e.ad}, ${kmM(e.km)}`)}">${n + 1}</button>`).join('');
    const adlar = dugum.filter(d => d.ad).map(d => `<span class="${liste('gm-ra-km-ad', d.n === 0 ? 'is-bas' : d.n === I.length - 1 ? 'is-son' : 'is-orta')}" style="--x:${yuz(d.il.km)}" aria-hidden="true"><b>${esc(d.il.ad)}</b><small>${esc(kmM(d.il.km))}</small></span>`).join('');
    return `<figure class="${liste('gm-ra-km', o.sinif)}" aria-label="${esc(`${R.kalkis}–${R.varis} km şeridi: ${I.map(i => `${i.ad} ${Math.round(i.km)}. km`).join(', ')}`)}"><div class="gm-ra-km-serit"><span class="gm-ra-km-cizgi"></span>${duraklar}${iller}${ekli}</div><div class="gm-ra-km-adlar">${adlar}</div></figure>`;
  };
  // Adı yazılmayan il düğümüne dokunuş: adı ve km'si kısa bildirimle (bütün ekranlarda aynı).
  document.addEventListener('click', ev => { const b = ev.target.closest?.('.gm-ra-km-il[data-km-il]'); if (b) GM.toast(`**${b.dataset.kmIl}** · ${b.dataset.km}`, {ikon: 'cografi'}); });

  // ---------- Rota metrikleri (belge §3D: Mesafe · Süre · Önerilen durak · Bölgesel lezzet tek satırda) ----------
  // GM.ozetSerit (gm-facts) kartından türer; hücre içeriğe göre, değer üstte, ad altta tek satır (ikonsuz: uzun adlar tek satıra sığsın), isteğe bağlı fark satırı. l: [{deger, birim, etiket, alt}]
  GM.rotaMetrik = (l = []) => `<dl class="gm-ra-metrik" style="--n:${l.length}">${l.map(x => `<div><dd>${esc(x.deger)}${x.birim ? `<small>${esc(x.birim)}</small>` : ''}</dd><dt>${esc(x.etiket)}</dt>${x.alt ? `<dd class="gm-ra-metrik-alt">${esc(x.alt)}</dd>` : ''}</div>`).join('')}</dl>`;
  // ---------- Güzergâh ihtiyaç özeti (belge §3D: yakıt, ibadethane, dinlenme tesisi, karavan alanı sayıları) ----------
  // GM.yakininda hücre dilinden: tür ikonu + sayı + ad; dokununca haritada o katman açılır. l: [{deger, tur, ikon, ad, sayi}]
  GM.ihtiyacOzet = (l = []) => `<ul class="gm-ra-iht" aria-label="Güzergâh ihtiyaçları">${l.map(x => `<li><button type="button" class="${liste('gm-ra-iht-oge', `is-${x.tur}`, !x.sayi && 'is-yok')}" data-eylem="ihtiyac-sec" data-id="${esc(x.deger)}" aria-label="${esc(`${x.ad}: ${x.sayi}`)}"><span class="gm-ra-iht-ikon">${ik(x.ikon || x.tur)}</span><b>${esc(GM.sayi(x.sayi))}</b><small>${esc(x.ad)}</small></button></li>`).join('')}</ul>`;
  // Sapma dağılımı (belge §3D: Yol üstü · 5 dk'ya kadar · 6–10 dk · 10 dk üstü): GM.dagilimCubuk verisi; tek kural web detour_tier (yol üstü = rotaya ≤ 1 km).
  GM.sapmaDagilim = (O = []) => [['Yol üstü', x => x.uzak <= 1], ['5 dk’ya kadar', x => x.uzak > 1 && x.sapma <= 5], ['6–10 dk', x => x.uzak > 1 && x.sapma > 5 && x.sapma <= 10], ['10 dk üstü', x => x.uzak > 1 && x.sapma > 10]].map(([ad, f], i) => ({ad, sayi: O.filter(f).length, ton: i + 1}));

  // ---------- Sabit alt aksiyon çubuğu (belge §3E: Kaydet · Paylaş · Aktar · Yola Çık) ----------
  // GM.altEylem gövdesinden (gm-bar); ikincil eylemler etiketli ikon (ikon üstte, ad altta), ana CTA geniş birincil düğme.
  // o: {ogeler:[{ikon, ad, veri, git, basili}], ana:{metin, ikon, veri, git}}
  GM.rotaAksiyon = (o = {}) => `<div class="gm-bar gm-ra-bar"><div class="gm-bar-ic">${(o.ogeler || []).map(x => `<button type="button" class="gm-ra-bar-oge"${x.basili != null ? ` aria-pressed="${!!x.basili}"` : ''}${at({veri: x.veri, git: x.git})}>${ik(x.ikon)}<small>${esc(x.ad)}</small></button>`).join('')}${o.ana ? GM.btn({...o.ana, sinif: liste('gm-ra-bar-ana', o.ana.sinif)}) : ''}</div></div>`;

  // ---------- Çevrimdışı paketler (rota-paketler; çevrimdışı ekranı, aktif harita ve Kaydet ortak) ----------
  GM.rotaPaketler = () => GM.durum.oku('rota-paketler', null) || [{id: 'istanbul-izmir', tarih: '13 Kas 14.20', durum: 'guncel'}, {id: 'istanbul-bursa', tarih: '2 Kas 09.10', durum: 'guncelleme'}, {id: 'izmir-cesme', tarih: '18 Eki 19.45', durum: 'guncel'}];
  GM.rotaPaketMB = R => Math.round(R.km / 10);
  GM.rotaIndir = (R, var_ = true) => { const l = GM.rotaPaketler().filter(p => p.id !== R.id); if (var_) l.unshift({id: R.id, tarih: 'Şimdi', durum: 'guncel'}); GM.durum.yaz('rota-paketler', l); };

  // ---------- Konum seçimi (Görev 14/15: Google/Apple Maps alışkanlığı) ----------
  // Yer havuzu: pilot rotaların kalkış/varış ve geçtiği iller + mekân ilçeleri (veriden; uydurma yer yok). Konumum: konum izniyle.
  GM.KONUMUM = {ad: 'Konumum', alt: 'Kadıköy, İstanbul', il: 'İstanbul', konum: true};
  GM.rotaYerler = () => {
    const R = (window.GMV?.rotalar || []).filter(r => (r.iller || []).length), m = new Map();
    const ekle = (ad, il, alt) => { const k = `${ad}|${il}`; if (ad && !m.has(k)) m.set(k, {ad, il, alt: alt || (ad === il ? 'İl' : il)}); };
    R.forEach(r => { (r.iller || []).forEach(i => ekle(i.ad, i.ad, i.bolge)); ekle(r.varis, (r.iller || []).at(-1)?.ad || r.varis); ekle(r.kalkis, (r.iller || [])[0]?.ad || r.kalkis); });
    (window.GMV?.mekanlar || []).filter(x => (x.ulke || 'Türkiye') === 'Türkiye' && x.ilce && x.il).forEach(x => ekle(x.ilce, x.il, x.il));
    return [...m.values()];
  };
  // Öneri şehirler: pilot rotaların uç şehirleri (kullanıcının seçebileceği hazır güzergâh ucu).
  GM.rotaOneriYerler = () => { const R = (window.GMV?.rotalar || []).filter(r => (r.iller || []).length), Y = GM.rotaYerler(); return [...new Set(R.flatMap(r => [r.kalkis, r.varis]))].map(ad => Y.find(y => y.ad === ad)).filter(Boolean); };
  // Seçilen uçlardan pilot rota: kalkış + varış birebir; yoksa kalkıştan çıkıp varış ilinden geçen rota. Yoksa null.
  GM.rotaEslestir = (a, b) => { const R = (window.GMV?.rotalar || []).filter(r => (r.iller || []).length), il = y => y?.il || y?.ad; if (!a || !b) return null;
    return R.find(r => r.kalkis === il(a) && (r.varis === b.ad || r.varis === il(b))) || R.find(r => r.kalkis === il(a) && (r.iller || []).some(i => i.ad === il(b) && i.km > 5)) || null; };
  const sonArama = () => GM.durum.oku('rota-son-arama', null) || [{ad: 'Bursa', il: 'Bursa', alt: 'Marmara'}, {ad: 'Çeşme', il: 'İzmir', alt: 'İzmir'}, {ad: 'Ankara', il: 'Ankara', alt: 'İç Anadolu'}];
  const norm = t => String(t || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
  // o: {baslik ('Nereye?'), diger:{etiket, ad} (öteki uç, bilgi satırı), konumum (Konumumu kullan satırı), haric:[ad], sec(yer)}
  GM.konumSec = (o = {}) => {
    const Y = GM.rotaYerler(), O = GM.rotaOneriYerler();
    let goster = [];
    const satir = (y, ikon, n) => ({ikon, baslik: y.ad, alt: y.alt, ok: true, veri: {eylem: 'ks-sec', id: n}, sinif: 'gm-ra-ks-yer'});
    const govde = q => {
      goster = [];
      const al = y => { goster.push(y); return goster.length - 1; };
      if (q) {
        const l = Y.filter(y => !(o.haric || []).includes(y.ad) && (norm(y.ad).startsWith(q) || norm(y.il).startsWith(q) || norm(y.ad).includes(` ${q}`))).slice(0, 8);
        return l.length ? GM.satirlar(l.map(y => satir(y, 'pin', al(y)))) : GM.bos({ikon: 'pin', baslik: 'Bu adla yer bulunamadı', metin: 'Şehir ya da ilçe adını yaz; Dada Route şimdilik **Türkiye** içinde çalışır.'});
      }
      const izin = GM.durum.oku('rota-konum-izni', false);
      const son = sonArama().filter(y => !(o.haric || []).includes(y.ad)).slice(0, 4);
      return GM.yigin([
        o.konumum === false ? '' : GM.satirlar([{ikon: 'konum', baslik: 'Konumumu kullan', alt: izin ? `${GM.KONUMUM.alt} · şu anki konumun` : 'Konum izni gerekir; yalnız rota için kullanılır', ok: true, veri: {eylem: 'ks-konum'}, sinif: 'gm-ra-ks-yer is-konum'}]),
        son.length ? `<section class="gm-yigin-8"><p class="gm-t-label gm-ton-ikincil">Son aramalar</p>${GM.satirlar(son.map(y => satir(y, 'gecmis', al(y))))}</section>` : '',
        `<section class="gm-yigin-8"><p class="gm-t-label gm-ton-ikincil">Öneri şehirler</p>${GM.cipler({ad: 'ks-oneri', etiket: 'Öneri şehirler', serit: false, ogeler: O.filter(y => !(o.haric || []).includes(y.ad)).map(y => ({metin: y.ad, ikon: 'cografi', veri: {eylem: 'ks-sec', id: al(y)}}))})}</section>`], 16);
    };
    return GM.sheet({baslik: o.baslik || 'Nereye?', tam: true, sinif: 'gm-ra-ks-sheet', html: `<div class="gm-yigin">${GM.arama({yer: 'Şehir, ilçe ya da semt ara', ad: 'ks-ara', sonuc: false})}${o.diger ? `<p class="gm-t-meta gm-ton-ikincil">${esc(o.diger.etiket)}: <b>${esc(o.diger.ad)}</b></p>` : ''}<div data-ks-liste>${govde('')}</div></div>`, sonra: (k, h) => {
      const inp = k.querySelector('input[type="search"]'), yaz = () => { k.querySelector('[data-ks-liste]').innerHTML = govde(norm((inp?.value || '').trim())); };
      inp?.addEventListener('input', yaz); setTimeout(() => inp?.focus({preventScroll: true}), GM.azHareket() ? 0 : GM.TK.motion.sheet);
      const bitir = y => { if (!y.konum) GM.durum.yaz('rota-son-arama', [y, ...sonArama().filter(x => x.ad !== y.ad)].slice(0, 5)); h.kapat(); o.sec?.(y); };
      const tik = ev => { const b = ev.target.closest('[data-eylem]'); if (!b) return;
        if (b.dataset.eylem === 'ks-sec') bitir(goster[+b.dataset.id]);
        else if (b.dataset.eylem === 'ks-konum') { if (GM.durum.oku('rota-konum-izni', false)) { bitir(GM.KONUMUM); return; }
          GM.dialog({baslik: '“Dada Gourmet” konumunu kullansın mı?', metin: 'Rotanın kalkış noktası ve yol üstündeki duraklara uzaklık için kullanılır.', eylem: 'İzin ver', iptal: 'İzin verme'}).then(ok => { if (!ok) { GM.toast('Konum izni verilmedi; kalkışı **şehir adıyla** seç', {ikon: 'konum'}); return; } GM.durum.yaz('rota-konum-izni', true); GM.toast('Konum izni verildi', {tur: 'basari', ikon: 'konum'}); bitir(GM.KONUMUM); }); } };
      k.addEventListener('click', tik);
      return () => { inp?.removeEventListener('input', yaz); k.removeEventListener('click', tik); };
    }});
  };

  // ---------- Kullanıcının kendi rotaları (Görev 14/17): kaydettikleri + gezdikleri; Rotalarım, Seyahat günlüğü ve #/rota "Rotaların" şeridi ortak ----------
  GM.ROTA_GUNLUK = [{id: 'istanbul-izmir', tarih: '12 Eki 2026', ziyaret: 2, atla: 1}, {id: 'istanbul-ankara', tarih: '21 Eyl 2026', ziyaret: 1, atla: 1}, {id: 'izmir-cesme', tarih: '16 Ağu 2026', ziyaret: 2, atla: 0}, {id: 'istanbul-bursa', tarih: '5 Tem 2026', ziyaret: 1, atla: 1}];
  GM.rotaKayitlilar = () => [...new Set([...(GM.durum.oku('rota-kayitli', []) || []), 'istanbul-izmir', 'izmir-cesme', 'istanbul-ankara'])];
  GM.rotaFavoriler = () => GM.durum.oku('rota-favori', ['izmir-cesme']) || [];
  GM.rotaTarihler = () => GM.durum.oku('rota-tarih', {'istanbul-ankara': '2026-11-21'}) || {};
  // Şerit öğeleri: önce gezdiklerin (en yeni), sonra gezmediğin kayıtlıların; her rota bir kez. → [{R, durum:'gezildi'|'kayitli', etiket, meta, git}]
  GM.rotaKendi = () => {
    const fav = GM.rotaFavoriler(), tar = GM.rotaTarihler(), kisa = t => (t ? new Date(`${t}T12:00:00`).toLocaleDateString('tr-TR', {day: 'numeric', month: 'short'}) : '');
    const gez = GM.ROTA_GUNLUK.map(g => ({R: GM.rotaBul(g.id), g})).filter(x => x.R).map(({R, g}) => ({R, durum: 'gezildi', etiket: `Gezildi · ${g.tarih.split(' ').slice(0, 2).join(' ')}`, meta: `${GM.sayi(Math.round(R.km))} km · ${g.ziyaret}/${g.ziyaret + g.atla} durak`, git: `#/rota/gunluk?id=${R.id}`}));
    const kay = GM.rotaKayitlilar().map(GM.rotaBul).filter(R => R && !gez.some(x => x.R.id === R.id)).map(R => ({R, durum: 'kayitli', etiket: tar[R.id] ? `Yolculuk · ${kisa(tar[R.id])}` : fav.includes(R.id) ? 'Favori' : 'Kayıtlı', meta: `${GM.sayi(Math.round(R.km))} km · ${GM.sure(R.dk)}`, git: `#/rota/${R.id}`}));
    return [...kay.filter(x => x.etiket.startsWith('Yolculuk')), ...gez, ...kay.filter(x => !x.etiket.startsWith('Yolculuk'))];
  };
  // Kendi rota kartı (şerit): GM.rotaKart satir şemasından türer; üstte rota silueti (kâğıt ızgara), siluet üstünde durum rozeti, altta ad + tek meta (kart altı ≤ 2 satır).
  GM.kendiRotaKart = (x = {}) => { const R = x.R; return `<a class="${liste('gm-ra-kr', `is-${x.durum}`)}" href="${esc(x.git)}" data-git="${esc(x.git)}"><span class="gm-ra-kr-sema">${GM.rotaCizgi({rota: {cizgi: R.cizgi}, pinler: [{lng: R.cizgi[0][0], lat: R.cizgi[0][1], uc: true}, {lng: R.cizgi.at(-1)[0], lat: R.cizgi.at(-1)[1], uc: true}], w: 220, h: 132, dolgu: {top: 18, right: 22, bottom: 18, left: 22}})}<span class="gm-ra-kr-rozet">${ik(x.durum === 'gezildi' ? 'onay' : x.etiket.startsWith('Yolculuk') ? 'takvim' : x.etiket === 'Favori' ? 'favori' : 'kaydet')}${esc(x.etiket)}</span></span><b class="gm-ra-kr-ad gm-kirp-1">${esc(R.ad)}</b><small class="gm-ra-kr-meta gm-kirp-1">${esc(x.meta)}</small></a>`; };

  // ---------- Webden gönderilen rota (belge §3A: masaüstünde kurulan rota tek dokunuşla mobilde) ----------
  // Webde aynı hesapla çizilen İstanbul–Bursa: önerilen duraklardan kalkışa en yakın yol üstü mekân + Bursa girişindeki iki mekân (veriden).
  GM.rotaWebden = () => {
    const R = GM.rotaBul('istanbul-bursa'); if (!R) return null;
    const O = GM.rotaOneri(R), bas = O.find(d => d.uzak <= 1 && d.km >= 1) || O[0], son = O.filter(d => d.km > R.km - 10).slice(0, 2);
    const D = [bas, ...son].filter((x, i, l) => x && l.indexOf(x) === i);
    return {R, id: R.id, zaman: '2 dk önce', cihaz: 'Mac · Chrome', duraklar: D, ad: `${R.kalkis} – ${R.varis}`, alt: `${D.length} durak · ${GM.sayi(Math.round(R.km))} km · ${GM.sure(R.dk + D.reduce((t, d) => t + d.sapma, 0))}`};
  };
})();
