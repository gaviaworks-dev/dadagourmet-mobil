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
  GM.kesifKart = (m, o = {}) => { const git = `#/mekan/${m.slug}`; return `<article class="${liste('gm-mk-harita', 'gm-kr-kk', o.secili && 'is-secili')}" data-mekan="${esc(m.slug)}"><a class="gm-mk-harita-foto" href="${esc(git)}" data-git="${esc(git)}" tabindex="-1" aria-label="${esc(m.ad)}">${m.kapak ? `<span class="gm-photo"${bg(m.kapak)}></span>` : `<span class="gm-photo is-yok" aria-hidden="true">${ik('mekan')}</span>`}</a><div class="gm-mk-satir-metin"><a class="gm-card__text" href="${esc(git)}" data-git="${esc(git)}">${GM.mekanEtiketSpan(m, 'gm-kirp-1')}<h3 class="gm-card__title gm-kirp-1">${esc(m.ad)}</h3></a>${GM.mekanMetaSatir([o.sapma ? GM.sapma(o.sapma) : '', GM.fiyat(m.fiyat)])}${GM.mekanMetaSatir([GM.mekanPuan(m), GM.acikDurum(m.acik)])}</div><button type="button" class="gm-kr-kk-ekle" data-eylem="${o.eklendi ? 'durak-cikar' : 'durak-ekle'}" data-id="${esc(m.slug)}" aria-pressed="${!!o.eklendi}" aria-label="${esc(o.eklendi ? `${m.ad} rotada, çıkar` : `${m.ad} durağını rotaya ekle`)}"><span>${ik(o.eklendi ? 'onay' : 'ekle')}</span><small>${o.eklendi ? 'Rotada' : 'Ekle'}</small></button></article>`; };

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
  GM.zamanAkis = (l = [], o = {}) => `<ol class="${liste('gm-kr-za', o.sinif)}">${l.map((x, i) => `<li class="${liste('gm-kr-za-oge', `is-${x.tur || 'il'}`, i === 0 && 'is-ilk', i === l.length - 1 && 'is-son', x.gecildi && 'is-gecildi', x.simdi && 'is-simdi')}"><span class="gm-kr-za-saat"><b>${esc(x.saat)}</b>${x.fark ? `<small>${esc(x.fark)}</small>` : ''}</span><span class="gm-kr-za-ray" aria-hidden="true"><i>${ik(x.ikon || {uc: 'baslangic', il: 'cografi', mekan: 'mekan'}[x.tur] || x.tur)}</i></span><div class="gm-kr-za-icerik">${x.etiket ? `<small class="gm-kr-za-etiket">${esc(x.etiket)}${x.rozet ? GM.rozet({...x.rozet, sinif: 'gm-kr-za-rozet'}) : ''}</small>` : ''}${x.baslik ? `<b class="gm-kr-za-baslik">${esc(x.baslik)}</b>` : ''}${x.alt ? `<span class="gm-kr-za-alt">${esc(x.alt)}</span>` : ''}${x.html || ''}${x.sonra ? `<p class="gm-kr-za-surus">${ik('arac')}<span>${esc(x.sonra)}</span></p>` : ''}</div></li>`).join('')}</ol>`;

  // ---------- Düzen ve başlık parçaları (ekran dosyası ham kap yazmasın) ----------
  // Tur başlığı (komoot tur sayfası üstü): GM.rehberManset metin dizgesinden türer; rozet satırı + başlık + alt satır + metrik şeridi (GM.ozetSerit). o: {rozetler:[{metin, ikon, ton}], baslik, alt, metrik:[ozetSerit ögeleri]}
  GM.turBaslik = (o = {}) => `<header class="${liste('gm-kr-tur', o.sinif)}">${o.rozetler?.length ? `<p class="gm-kr-tur-rozet">${o.rozetler.map(GM.rozet).join('')}</p>` : ''}<h1 class="gm-t-page">${esc(o.baslik)}</h1>${o.alt ? `<p class="gm-kr-tur-alt">${GM.vurgu(o.alt)}</p>` : ''}${o.metrik ? GM.ozetSerit(o.metrik) : ''}</header>`;
  // Dikey kart listesi (GM.durakKart, GM.sapmaSatir, GM.dagilimCubuk dizgeleri): gm-yigin-8 aralığı; isteğe bağlı küçük başlık satırı (numara ya da ikon dairesi; tur: cografi | katman ikon tonu). o: {baslik, alt, sira, ikon, tur}
  GM.krListe = (l = [], o = {}) => `<div class="${liste('gm-kr-liste', o.sinif)}">${o.baslik ? `<div class="${liste('gm-kr-liste-bas', o.tur && `is-${o.tur}`)}">${o.sira != null ? `<b class="gm-kr-liste-sira">${esc(o.sira)}</b>` : o.ikon ? ik(o.ikon) : ''}<span><b>${esc(o.baslik)}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span></div>` : ''}${l.join('')}</div>`;
  // Yön özeti (Google Maps yol tarifi sheet başı): GM.cekmece başlık dizgesi (gm-kl-cekmece-ozet) türevi; büyük süre birincil renkte + km + alt satır + tek eylem. o: {sure, km, alt, eylem (html)}
  // o.vurgu === false: süre mürekkep renginde (ana yön çekmecesi); o.varis: "Varış 16.50" süre satırının yanında.
  GM.yonOzet = (o = {}) => `<p class="${liste('gm-kr-yonozet', o.vurgu === false && 'is-sade')}"><b><em>${esc(o.sure)}</em>${o.km ? ` <span>(${esc(o.km)})</span>` : ''}</b>${o.alt || o.varis ? `<small>${o.varis ? `<strong>Varış ${esc(o.varis)}</strong> · ` : ''}${esc(o.alt || '')}</small>` : ''}</p>${o.eylem || ''}`;
})();
