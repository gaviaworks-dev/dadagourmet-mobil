/* Dada Route kanonu (Gourmet'e özgü; docs/DADA-ROUTE-REFERANS.md ana yönleri). Aileden türeme yazılı:
   GM.durakDuzen (planlama satırı; GM.rotaSerit + Gastro sürükle satırı) · GM.rotaSecenek (3 rota alternatifi; GM.eylemKart ailesi, Yandex/Citymapper) ·
   GM.copilot (koyu durak asistanı; Gastro pişirme modu + Diet canlı etkinlik dili) · GM.yaklasmaUyari (Citymapper tek cümle uyarı) · GM.ucluSerit (Apple Maps varış şeridi) ·
   GM.webdenRota (derin bağlantı rozeti; GM.bant ailesi). */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, liste = (...a) => a.filter(Boolean).join(' ');
  // Planlama durak satırı: ray düğümü (kalkış/ara/varış) + alan + tutamak/sil. o: {tur:'bas'|'ara'|'son', ad, yer, id}
  GM.durakDuzen = (l = [], o = {}) => `<ol class="${liste('gm-dd', o.sinif)}" data-ad="${esc(o.ad || 'duraklar')}">${l.map((x, i) => `<li class="gm-dd-satir is-${x.tur}" data-id="${esc(x.id || i)}"><span class="gm-dd-ray" aria-hidden="true"><i>${x.tur === 'bas' ? ik('baslangic') : x.tur === 'son' ? ik('varis') : esc(i)}</i></span><button type="button" class="gm-dd-alan" data-eylem="durak-sec" data-id="${esc(x.id || i)}"><small>${esc(x.tur === 'bas' ? 'Nereden' : x.tur === 'son' ? 'Nereye' : `Ara durak ${i}`)}</small><b class="${x.ad ? '' : 'is-yer'}">${esc(x.ad || x.yer || 'Yer seç')}</b>${x.alt ? `<span>${esc(x.alt)}</span>` : ''}</button>${x.tur === 'ara' ? `<span class="gm-dd-eylem">${GM.ikonBtn({ikon: 'grip-lines', etiket: 'Sırala', tur: 'duz', attrs: 'data-surukle', veri: {eylem: 'durak-sirala', id: x.id || i}})}${GM.ikonBtn({ikon: 'sil', etiket: 'Durağı sil', tur: 'duz', veri: {eylem: 'durak-sil', id: x.id || i}})}</span>` : x.tur === 'bas' ? `<span class="gm-dd-eylem">${GM.ikonBtn({ikon: 'right-left', etiket: 'Kalkış ve varışı değiştir', tur: 'duz', veri: {eylem: 'durak-degistir'}})}</span>` : ''}</li>`).join('')}${o.ekle === false ? '' : `<li class="gm-dd-ekle"><span class="gm-dd-ray" aria-hidden="true"><i>${ik('ekle')}</i></span>${GM.btn({metin: o.ekleMetin || 'Ara durak ekle', tur: 'text', veri: {eylem: 'durak-ekle'}})}</li>`}</ol>`;
  // Rota alternatifi kartı: ad, süre, km, gurme durak sayısı, fark; küçük şema. o: {secili, rozet}
  GM.rotaSecenek = (x, o = {}) => `<button type="button" class="${liste('gm-rs-sec', o.secili && 'is-secili')}" aria-pressed="${!!o.secili}" data-cip="${esc(x.id)}">${x.cizgi ? `<span class="gm-rs-sec-sema">${GM.rotaCizgi({rota: {cizgi: x.cizgi}, pinler: [], w: 88, h: 88, dolgu: {top: 10, right: 10, bottom: 10, left: 10}})}</span>` : `<span class="gm-rs-sec-ikon">${ik(x.ikon || 'rota')}</span>`}<span class="gm-satir-metin"><span class="gm-rs-sec-bas"><b>${esc(x.ad)}</b>${o.rozet ? `<em>${esc(o.rozet)}</em>` : ''}</span><span class="gm-rs-sec-sure">${esc(GM.sure(x.dk))}<small>${esc(GM.sayi(x.km))} km</small></span><small>${esc(x.alt)}</small></span>${ik('onay', 'gm-rs-sec-onay')}</button>`;
  GM.rotaSecenekler = (l, o = {}) => `<div class="gm-rs-secler" data-cip-grup="tek" data-ad="${esc(o.ad || 'rota-secenek')}" role="radiogroup" aria-label="Rota seçenekleri">${l.map((x, i) => GM.rotaSecenek(x, {secili: x.id === o.secili, rozet: i === 0 ? o.rozet : null})).join('')}</div>`;
  // Webden gelen rota (derin bağlantı): GM.bant ailesi; ikon + metin + "Aç".
  GM.webdenRota = (o = {}) => `<a class="gm-webden" href="${esc(o.git)}" data-git="${esc(o.git)}"><span class="gm-webden-ikon">${ik('web')}</span><span class="gm-satir-metin"><small>${esc(o.ust || 'Webden gönderildi')}</small><b>${esc(o.ad)}</b><span>${esc(o.alt || '')}</span></span><span class="gm-webden-ac">Aç${ik('tumu')}</span></a>`;
  // Apple Maps tipi üçlü varış şeridi: varış · kalan süre · kalan km
  GM.ucluSerit = l => `<dl class="gm-uclu">${l.map(x => `<div><dt>${esc(x.etiket)}</dt><dd>${esc(x.deger)}</dd></div>`).join('')}</dl>`;
  // Yaklaşma uyarısı (3–5 km): tek fiilli başlık + konuşma balonu; TTS metniyle aynı cümle.
  GM.yaklasmaUyari = (o = {}) => `<div class="gm-yaklas" role="alert"><span class="gm-yaklas-ikon">${ik('sesli')}</span><span class="gm-satir-metin"><b>${esc(o.baslik)}</b><span>${esc(o.metin)}</span></span></div>`;
  // Co-Pilot: koyu tam ekran durak asistanı. o: {harita, uyari, sirada:{tur, ad, alt, uzak, sure, sapma, gorsel}, yaklasan:[{tur, ad, uzak}], cipler, uclu}
  GM.copilot = (o = {}) => {
    const s = o.sirada || {};
    return `<section class="gm-cp">${o.harita ? `<div class="gm-cp-harita">${GM.harita({...o.harita, stil: 'koyu', etkilesim: false, kontroller: false, tam: true})}</div>` : ''}<div class="gm-cp-govde">${o.uyari ? GM.yaklasmaUyari(o.uyari) : ''}<article class="gm-cp-sirada"><small class="gm-cp-etiket">Sıradaki durak</small><div class="gm-cp-sirada-ust">${s.gorsel ? `<span class="gm-cp-foto"><span class="gm-photo" style="background-image:url('${esc(s.gorsel)}')"></span></span>` : `<span class="gm-dk-ikon is-${esc(s.tur || 'mekan')}">${ik(s.tur || 'mekan')}</span>`}<span class="gm-satir-metin"><b>${esc(s.ad)}</b><span>${esc(s.alt || '')}</span></span></div><div class="gm-cp-mesafe"><b>${esc(s.uzak)}</b><span>${esc(s.sure)}</span>${s.sapma != null ? GM.sapma({dk: s.sapma}) : ''}</div></article>${o.yaklasan?.length ? `<ul class="gm-cp-yaklasan">${o.yaklasan.map(y => `<li><span class="gm-cp-yk-ikon is-${esc(y.tur)}">${ik(y.tur)}</span><span>${esc(y.ad)}</span><b>${esc(y.uzak)}</b></li>`).join('')}</ul>` : ''}<div class="gm-cp-dugmeler">${GM.btn({metin: 'Geç', ikon: 'forward', tur: 'secondary', veri: {eylem: 'cp-gec'}})}${GM.btn({metin: 'Navigasyonda aç', ikon: 'navigasyon', veri: {eylem: 'cp-nav'}})}</div>${o.cipler ? `<div class="gm-cp-ara"><small>Yol üstünde ara</small>${GM.katmanCipler({ad: 'cp-ara', ogeler: o.cipler})}</div>` : ''}${o.uclu ? GM.ucluSerit(o.uclu) : ''}</div></section>`;
  };
})();
/* Dada Route kanonu, ek ekranlar (DADA-ROUTE-REFERANS §5 d–l). Her bileşenin türediği aile satır başında yazılı.
   API: GM.yigin · GM.KATMAN_GRUP · GM.rotaKatmanSay · GM.rotaKatmanSheet · GM.durakBaglam · GM.yakininda · GM.molaEsi · GM.durakSheet · GM.ilSheet · GM.aktarSheet
        GM.rotaKatmanBagla · GM.paketSatir · GM.depolama · GM.pasaport · GM.aracEkrani */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, liste = (...a) => a.filter(Boolean).join(' ');
  const durakIkon = (tur, buyuk) => `<span class="${liste('gm-dk-ikon', `is-${tur}`, buyuk && 'gm-ds-ikon')}" aria-hidden="true">${ik(tur === 'mekan' ? 'mekan' : tur)}</span>`;
  // Yığın: ekran dosyası ham kap yazmasın diye kanon aralık sınıfları (gm-yigin-4/8/12/24, 16 = gm-yigin).
  GM.yigin = (l = [], aralik = 16) => `<div class="${aralik === 16 ? 'gm-yigin' : `gm-yigin-${aralik}`}">${l.filter(Boolean).join('')}</div>`;

  // ---------- Katman sayıları (tek kaynak: GM.rotaOneri + GM.rotaKatmani + GMV.ilKimlik) ----------
  GM.KATMAN_AD = {neYenir: 'Ne Yenir?', neAlinir: 'Ne Alınır?', cografi: 'İl kimliği', yakit: 'Yakıt', sarj: 'Şarj', ibadet: 'İbadethane', dinlenme: 'Dinlenme', karavan: 'Karavan'};
  GM.KATMAN_GRUP = [{ad: 'Gastronomi', ogeler: ['neYenir', 'neAlinir', 'cografi']}, {ad: 'Yol', ogeler: ['yakit', 'sarj']}, {ad: 'İhtiyaç', ogeler: ['ibadet', 'dinlenme', 'karavan']}];
  const ilKimlikleri = R => (R.iller || []).map(i => ({...i, k: (window.GMV?.ilKimlik || []).find(x => x.ad === i.ad)})).filter(i => i.k);
  const sarjTip = k => (/\bAC\b/.test(k.ad) ? 'ac' : 'dc');
  GM.katmanSapma = k => (k.sapma != null ? k.sapma : Math.max(1, Math.round((k.uzak || 0) * 2 / 55 * 60)));
  // o: {secki, sarj:'tumu'|'dc'|'ac'} → {tur: {sayi, alt, ornek, nokta}} (nokta: haritada pin olarak görünür mü)
  GM.rotaKatmanSay = (R, o = {}) => {
    const oneri = GM.rotaOneri(R).filter(d => !o.secki || (d.mekan.seckiler || []).includes('rota')), I = ilKimlikleri(R), K = GM.rotaKatmani(R);
    const alinir = I.reduce((t, i) => t + i.k.tescilli.filter(x => x.tur === 'alinir').length, 0);
    const s = {
      neYenir: {sayi: oneri.length, alt: `Gurme duraklar · ${oneri.filter(d => d.uzak <= 1).length} yol üstü`, nokta: true},
      neAlinir: {sayi: alinir, alt: 'Coğrafi işaretli ürün · il kartlarında', nokta: false},
      cografi: {sayi: I.length, alt: I.length ? I.slice(0, 3).map(i => i.ad).join(', ') + (I.length > 3 ? ` +${I.length - 3}` : '') : 'Bu rotada il kartı yok', nokta: false}
    };
    ['yakit', 'sarj', 'ibadet', 'dinlenme', 'karavan'].forEach(t => {
      const l = K.filter(k => k.tur === t && (t !== 'sarj' || !o.sarj || o.sarj === 'tumu' || sarjTip(k) === o.sarj));
      s[t] = {sayi: l.length, ornek: l.some(k => k.ornek), nokta: true, alt: l.length ? `İlki ${l[0].km}. km${t === 'yakit' ? ' · OpenStreetMap' : ''}` : 'Bu rotada yok'};
    });
    return s;
  };

  // ---------- (d) Katmanlar sheet'i ----------
  // GM.filtreSheet iskeletinden türer (gruplu, sayaçlı, sabit iki düğmeli ayak; F13) ama seçim satırı GM.toggle'dır: katman aç/kapa tek dokunuştur.
  // Gastronomi grubu üstte (§7 madde 2), "Yalnız Dada seçkisi" anahtarı en üstte (ViaMichelin K14), şarjda DC/AC alt süzgeci (web).
  // o: {rota, secili:[tur], secki, sarj, uygula({katman, secki, sarj})}
  GM.rotaKatmanSheet = (o = {}) => {
    const R = o.rota, d = {katman: [...(o.secili || [])], secki: !!o.secki, sarj: o.sarj || 'tumu'};
    const nokta = () => { const s = GM.rotaKatmanSay(R, d); return d.katman.reduce((t, k) => t + (s[k]?.nokta ? s[k].sayi : 0), 0); };
    // Noktası olmayan katman (bu rotada 0) kapalı ve pasif görünür; seçim durumda kalır, başka rotada geri gelir.
    const satir = (t, s) => GM.satir({sol: durakIkon(t), baslik: GM.KATMAN_AD[t], alt: s.alt, deger: GM.sayi(s.sayi), sag: GM.anahtar({ad: `katman-${t}`, etiket: GM.KATMAN_AD[t], secili: d.katman.includes(t) && !!s.sayi, pasif: !s.sayi}), sinif: 'gm-ks-satir'});
    const sarjVar = () => GM.rotaKatmani(R, 'sarj').length > 0;
    const govde = () => { const s = GM.rotaKatmanSay(R, d); return `<div class="gm-ks">
      <div class="gm-ks-secki">${GM.toggle({ad: 'katman-secki', ikon: 'puanDada', etiket: 'Yalnız Dada seçkisi', alt: 'Dada Route seçkisindeki mekânlar', secili: d.secki})}</div>
      ${GM.KATMAN_GRUP.map(g => `<section class="gm-ks-grup"><h3 class="gm-ks-baslik"><span>${esc(g.ad)}</span><small>${g.ogeler.filter(t => d.katman.includes(t)).length}/${g.ogeler.length} açık</small></h3><div class="gm-ks-liste">${g.ogeler.map(t => satir(t, s[t]) + (t === 'sarj' && d.katman.includes('sarj') && sarjVar() ? `<div class="gm-ks-alt">${GM.segment({ad: 'katman-sarj-tip', etiket: 'Şarj türü', secili: d.sarj, ogeler: [{ad: 'Tümü', deger: 'tumu'}, {ad: 'DC hızlı', deger: 'dc'}, {ad: 'AC', deger: 'ac'}]})}</div>` : '')).join('')}</div></section>`).join('')}
      ${GM.bilgi({metin: 'Yakıt istasyonları OpenStreetMap verisidir (ODbL).'})}</div>`; };
    const ayak = () => GM.btnIkili({metin: 'Sıfırla', veri: {eylem: 'ks-sifirla'}}, {metin: `Uygula · ${GM.sayi(nokta())} nokta`, veri: {eylem: 'ks-uygula'}});
    return GM.sheet({baslik: 'Katmanlar', tam: true, sinif: 'gm-ks-sheet', html: `<div data-ks-govde>${govde()}</div>`, altBar: `<div data-ks-ayak>${ayak()}</div>`, sonra: (k, h) => {
      const ciz = () => { const y = k.querySelector('.gm-sheet-govde').scrollTop; k.querySelector('[data-ks-govde]').innerHTML = govde(); k.querySelector('[data-ks-ayak]').innerHTML = ayak(); k.querySelector('.gm-sheet-govde').scrollTop = y; };
      const deg = ev => { const {ad, deger} = ev.detail || {}; if (!ad) return;
        if (ad === 'katman-secki') d.secki = !!deger;
        else if (ad === 'katman-sarj-tip') d.sarj = deger;
        else if (ad.startsWith('katman-')) { const t = ad.slice(7); d.katman = deger ? [...new Set([...d.katman, t])] : d.katman.filter(x => x !== t); }
        else return; GM.titres?.(); ciz(); };
      k.addEventListener('gm-degisim', deg);
      const tik = ev => { if (ev.target.closest('[data-eylem="ks-sifirla"]')) { d.katman = ['neYenir']; d.secki = false; d.sarj = 'tumu'; ciz(); } if (ev.target.closest('[data-eylem="ks-uygula"]')) { o.uygula?.({...d}); h.kapat(); } };
      k.addEventListener('click', tik);
      return () => { k.removeEventListener('gm-degisim', deg); k.removeEventListener('click', tik); };
    }});
  };

  // ---------- (e) Durak detayı ----------
  // Bağlam satırı: GM.sapma ailesi (yol üstü/+N dk + km) + yoldan uzaklık; web #ygDetail "Rotadan X km · Yaklaşık +N dk".
  GM.durakBaglam = (o = {}) => `<p class="gm-ds-baglam">${ik('rota')}<span>Rotanın <b>${esc(o.km)}. km</b>’si</span><span class="gm-nokta" aria-hidden="true">·</span><span>${o.uzak <= 1 ? 'Yol üstü' : `Yoldan ${esc(GM.ondalik(o.uzak))} km`}</span><span class="gm-nokta" aria-hidden="true">·</span><b class="${liste('gm-ds-sapma', o.sapma <= 2 && 'is-yolustu')}">${o.sapma <= 2 ? 'Süre eklemez' : `+${esc(o.sapma)} dk`}</b></p>`;
  // "Yakınında" üçlü ikon satırı (HalalTrip K15): GM.ozetSerit (gm-facts) hücre dilinden türer; yoksa soluk "Yok".
  GM.yakininda = (l = []) => `<ul class="gm-yk" aria-label="Yakınında">${l.map(x => `<li class="${liste(`is-${x.tur}`, !x.deger && 'is-yok')}">${durakIkon(x.tur)}<span><small>${esc(x.ad)}</small><b>${esc(x.deger || 'Yok')}</b></span></li>`).join('')}</ul>`;
  const yakinBul = (R, d) => [['ibadet', 'İbadethane'], ['yakit', 'Yakıt'], ['sarj', 'Şarj']].map(([t, ad]) => {
    const l = GM.rotaKatmani(R, t).filter(k => k.id !== d.id).map(k => Math.abs(k.km - d.km)).sort((a, b) => a - b);
    return {tur: t, ad, deger: l.length && l[0] <= 25 ? (l[0] < 1 ? 'Yanında' : `${Math.round(l[0])} km`) : ''};
  });
  // Şarj + yemek eşi (ABRP K7, PlugShare K8; web: istasyona ≤ 1 km Dada mekânı, en çok 4; yoksa örnek eş). Yürüme 80 m/dk.
  GM.molaEsi = (R, k) => {
    const yakin = GM.rotaDuraklari(R).map(d => ({d, m: Math.round(GM.km([k.lng, k.lat], [d.lng, d.lat]) * 1000)})).filter(x => x.m <= 1000).sort((a, b) => a.m - b.m).slice(0, 4);
    if (yakin.length) return yakin.map(x => GM.durakKart({...x.d, id: x.d.slug, alt: `${GM.sayi(x.m)} m · ${Math.max(1, Math.round(x.m / 80))} dk yürüme`}, {eylem: false, kucuk: true})).join('');
    if (k.eslesme) return GM.durakKart({tur: 'neYenir', ikon: 'mekan', ad: k.eslesme.ad, alt: `${GM.sayi(k.eslesme.metre)} m · ${Math.max(1, Math.round(k.eslesme.metre / 80))} dk yürüme`}, {eylem: false, kucuk: true});
    return '';
  };
  // Durak sheet'i: GM.sheet (yarım) + GM.durakKart başlık dili + GM.btnIkili ayak (§5e ana yön). d: katman noktası ya da GM.rotaOneri öğesi (mekan alanlı).
  // o: {rota, durak, eklendi, ekle(d), cikar(d)}
  GM.durakSheet = (o = {}) => {
    const R = o.rota, d = o.durak, m = d.mekan, tur = m ? 'mekan' : d.tur, sapma = GM.katmanSapma(d), sarj = tur === 'sarj', dc = sarj && sarjTip(d) === 'dc';
    const bas = `<header class="gm-ds-bas">${m?.kapak ? `<span class="gm-ds-foto"><span class="gm-photo" style="background-image:url('${esc(m.kapak)}')"></span></span>` : durakIkon(tur, true)}<span class="gm-satir-metin"><small class="gm-card__category">${esc(m ? [m.kategori, m.mutfak?.[0]].filter(Boolean).join(' · ') : GM.KATMAN_AD[tur] || 'Durak')}</small><b>${esc(m ? m.ad : d.ad)}</b><span>${esc(m ? GM.konumMetin(m, 'kisa') : d.alt || '')}</span></span></header>`;
    const mola = sarj ? `<section class="gm-ds-mola"><div class="gm-ds-mola-bas">${durakIkon('sarj')}<span class="gm-satir-metin"><small>${dc ? 'DC hızlı' : 'AC'} · %20 → %80</small><b>~${dc ? 26 : 100} dk şarj molası</b></span></div>${GM.molaEsi(R, d) ? `<p class="gm-t-label gm-ton-ikincil">Yürüme mesafesinde</p><div class="gm-yigin-8">${GM.molaEsi(R, d)}</div>` : ''}</section>` : '';
    const html = `<div class="gm-ds">${bas}${GM.durakBaglam({km: d.km, uzak: d.uzak, sapma})}${mola}<section class="gm-yigin-8"><p class="gm-t-label gm-ton-ikincil">Yakınında</p>${GM.yakininda(yakinBul(R, d))}</section>${m ? GM.satirlar([{ikon: 'mekan', baslik: 'Mekânı incele', alt: 'Menü, saatler, adres ve telefon', git: `#/mekan/${m.slug}`}]) : ''}${sarj ? GM.bilgi({metin: 'Şarj süresi %20’den %80’e tahmindir; araca ve istasyona göre değişir.'}) : ''}</div>`;
    const ayak = GM.btnIkili({metin: 'Yol tarifi', ikon: 'navigasyon', veri: {eylem: 'ds-yol'}}, o.eklendi ? {metin: 'Rotada', ikon: 'onay', tur: 'tonal', veri: {eylem: 'ds-cikar'}} : {metin: 'Rotaya ekle', ikon: 'ekle', veri: {eylem: 'ds-ekle'}});
    return GM.sheet({baslik: 'Rotadaki durak', sinif: 'gm-ds-sheet', html, altBar: ayak, sonra: (k, h) => {
      const t = ev => {
        if (ev.target.closest('[data-eylem="ds-ekle"]')) { h.kapat(); o.ekle?.(d); }
        else if (ev.target.closest('[data-eylem="ds-cikar"]')) { h.kapat(); o.cikar?.(d); }
        else if (ev.target.closest('[data-eylem="ds-yol"]')) GM.aktarSheet({rota: R, hedef: {ad: m ? m.ad : d.ad}});
      };
      k.addEventListener('click', t); return () => k.removeEventListener('click', t);
    }});
  };

  // ---------- (f) İl kimlik kartı: tam hali ----------
  // GM.ilKart'ın sheet hali: aynı coğrafi işaret tonu ve ikonları; tescilli ürünler Ne Yenir / Ne Alınır diye ayrılır, altta o ildeki rota durakları (GM.durakKart).
  // o: {rota, il (ad), ekle(d), eklenen:[slug]}
  GM.ilSheet = (o = {}) => {
    const R = o.rota, i = (R?.iller || []).find(x => x.ad === o.il) || {ad: o.il}, k = (window.GMV?.ilKimlik || []).find(x => x.ad === o.il) || {tescilli: []};
    const kolon = (tur, baslik) => { const l = k.tescilli.filter(x => x.tur === tur); return l.length ? `<section class="gm-is-kolon is-${tur === 'alinir' ? 'neAlinir' : 'neYenir'}"><h3>${ik(tur === 'alinir' ? 'neAlinir' : 'neYenir')}<span>${esc(baslik)}</span><small>${l.length}</small></h3><ul>${l.map(x => `<li><b>${esc(x.ad)}</b>${x.yer ? `<small>${ik('pin')}${esc(x.yer)}</small>` : ''}</li>`).join('')}</ul></section>` : ''; };
    const D = R ? GM.rotaOneri(R).filter(d => d.mekan.il === o.il) : [];
    const html = `<div class="gm-is"><header class="gm-is-bas">${durakIkon('cografi', true)}<span class="gm-satir-metin"><small class="gm-card__category">${esc([i.bolge, i.km != null ? `Rotanın ${i.km}. km’si` : ''].filter(Boolean).join(' · '))}</small><b>${esc(o.il)}</b><span>${GM.sayi(k.tescilli.length)} coğrafi işaretli lezzet</span></span></header>
      ${kolon('yenir', 'Ne Yenir?')}${kolon('alinir', 'Ne Alınır?')}
      <section class="gm-yigin-8"><p class="gm-t-label gm-ton-ikincil">${esc(o.il)}’da rotaya yakın gurme duraklar</p>${D.length ? `<div class="gm-yigin-8">${D.map(d => GM.durakKart({...d, id: d.slug}, {sapma: {dk: d.sapma, km: d.km}, eklendi: (o.eklenen || []).includes(d.slug)})).join('')}</div>` : GM.p('Bu ilde rotaya 10 km’den yakın Dada mekânı yok.', {ton: 'ikincil'})}</section>
      ${GM.bilgi({metin: 'Coğrafi işaretler TÜRKPATENT tescil kayıtlarıdır. Sürüş sırasında bu kart açılmaz; il sınırında yalnız bildirim gelir.'})}</div>`;
    return GM.sheet({baslik: 'İl kimliği', tam: true, sinif: 'gm-is-sheet', html, sonra: (kk, h) => GM.eylem(kk, 'durak-ekle', el => { const d = D.find(x => x.slug === el.dataset.id); if (d) { h.kapat(); o.ekle?.(d); } })});
  };

  // ---------- (g) Navigasyona aktar ----------
  // GM.satirlar + GM.ikonKutu (rota.js "Navigasyonda aç" ile aynı satır dili); sınır her satırın altında açıkça yazılı, sağda bu rotaya etkisi (rozet).
  // Web (WEB-ENVANTERI §3.5): Google tek bağlantıda 9 ara durak (telefonda 3, fazlası etap), Apple iOS 18.4+, Yandex yalnız uçlar. Waze (patron belgesi §3E) tek hedef alır. GPX mobil ektir.
  // o: {rota, duraklar:[...ara durak], hedef:{ad} (tek durağa yol tarifi)}
  GM.aktarSheet = (o = {}) => {
    const R = o.rota, n = (o.duraklar || []).length, tek = !!o.hedef, etap = Math.max(1, Math.ceil(n / 3));
    const rozet = (metin, ton) => GM.durumRozet({metin, ton, ikon: ton === 'uyari' ? 'uyari' : 'onay'});
    const satirlar = tek
      ? [{ikon: 'map-location-dot', baslik: 'Apple Haritalar', alt: 'Bu durağa yol tarifi', id: 'apple'}, {ikon: 'map', baslik: 'Google Haritalar', alt: 'Bu durağa yol tarifi', id: 'google'}, {ikon: 'car-side', baslik: 'Waze', alt: 'Bu durağa yol tarifi', id: 'waze'}, {ikon: 'location-arrow', baslik: 'Yandex Navigasyon', alt: 'Bu durağa yol tarifi', id: 'yandex'}]
      // Patron belgesi §3E sırası: Apple Maps · Google Maps · Waze; Yandex (Türkiye'de yaygın) ve dosya seçenekleri ardından.
      : [{ikon: 'map-location-dot', baslik: 'Apple Haritalar', alt: 'Çok duraklı rota iOS 18.4 ve sonrasında; öncesinde yalnız varış', id: 'apple', sag: rozet('Uygun', 'basari')},
        {ikon: 'map', baslik: 'Google Haritalar', alt: 'Tek bağlantıda en çok 9 ara durak; telefonda 3, fazlası etaplara bölünür', id: 'google', sag: n > 3 ? rozet(`${etap} etap`, 'uyari') : rozet('Tek bağlantı', 'basari')},
        {ikon: 'car-side', baslik: 'Waze', alt: 'Tek hedef: sıradaki durağa ya da varışa; ara duraklar sırayla açılır', id: 'waze', sag: n ? rozet('Durak durak', 'uyari') : rozet('Uygun', 'basari')},
        {ikon: 'location-arrow', baslik: 'Yandex Navigasyon', alt: 'Yalnız kalkış ve varış; ara duraklar aktarılmaz', id: 'yandex', sag: n ? rozet('Duraklar düşer', 'uyari') : rozet('Uygun', 'basari')},
        // Web rota-katman-panel.js "Tek rota bağlantısı" (R3.6d): bütün duraklar tek adreste, açan kişi uygulamayı seçer.
        {ikon: 'link', baslik: 'Tek rota bağlantısı', alt: 'Bütün duraklar tek adreste; açan kişi Google, Apple ya da Yandex’i seçer', id: 'bag', sag: rozet('Kopyala', 'notr')},
        {ikon: 'file-export', baslik: 'GPX dosyası', alt: 'Rota çizgisi ve duraklar; Garmin ve diğer uygulamalar için', id: 'gpx', sag: rozet('Dosya', 'notr')}];
    const html = `<div class="gm-yigin">${GM.p(tek ? `**${o.hedef.ad}** için yol tarifi harita uygulamasında açılır.` : `**${R.kalkis} → ${R.varis}** · ${n ? `${n} ara durak` : 'ara durak yok'}. Navigasyon harita uygulamasında sürer; yol takibi durak uyarılarını vermeye devam eder.`, {ton: 'ikincil'})}
      ${GM.satirlar(satirlar.map(x => ({sol: GM.ikonKutu({ikon: x.ikon, boyut: 'md', ton: 'notr'}), baslik: x.baslik, alt: x.alt, sag: x.sag || '', ok: !x.sag, veri: {eylem: 'aktar-hedef', id: x.id}, sinif: 'gm-ak-satir'})))}</div>`;
    return GM.sheet({baslik: tek ? 'Yol tarifi' : 'Navigasyona aktar', html, sonra: (k, h) => GM.eylem(k, 'aktar-hedef', el => { const x = satirlar.find(s => s.id === el.dataset.id); h.kapat(); GM.toast(x.id === 'bag' ? '**Tek rota bağlantısı** kopyalandı' : x.id === 'gpx' ? `**${R ? R.ad : ''}.gpx** hazırlandı · paylaşım açılıyor` : `**${x.baslik}** açılıyor${!tek && x.id === 'google' && n > 3 ? ` · ${etap} etap` : ''}`, {ikon: x.id === 'gpx' ? 'file-export' : 'navigasyon'}); })});
  };

  // ---------- Rota haritası bağlayıcısı (rota.js tek satırla çağırır) ----------
  // Katman düğmesi / süzgeç → GM.rotaKatmanSheet; katman pini ya da İhtiyaçlar kartı → GM.durakSheet; il kartı → GM.ilSheet. Durum rota-<id> (eklenen + mola + secki + sarj).
  // o: {harita (GM.harita ad), oku(), yaz(d)}
  GM.rotaKatmanBagla = (kok, R, o = {}) => {
    const K = GM.rotaKatmani(R), oku = () => ({eklenen: [], mola: [], katman: [], ...(o.oku?.() || {})});
    const durakAc = k => { const d = oku(); GM.durakSheet({rota: R, durak: k, eklendi: (d.mola || []).includes(k.id),
      ekle: x => { const e = oku(); o.yaz?.({...e, mola: [...new Set([...(e.mola || []), x.id])]}); GM.toast(`Mola durağı eklendi · **+${GM.katmanSapma(x)} dk**`, {tur: 'basari', eylem: 'Geri al', onEylem: () => { const g = oku(); o.yaz?.({...g, mola: (g.mola || []).filter(i => i !== x.id)}); }}); },
      cikar: x => { const e = oku(); o.yaz?.({...e, mola: (e.mola || []).filter(i => i !== x.id)}); GM.toast('Mola durağı çıkarıldı'); }}); };
    const sheetAc = () => { const d = oku(); GM.rotaKatmanSheet({rota: R, secili: d.katman, secki: d.secki, sarj: d.sarj, uygula: x => o.yaz?.({...oku(), ...x})}); };
    const ilAc = ad => GM.ilSheet({rota: R, il: ad, eklenen: oku().eklenen, ekle: x => { const e = oku(); if (!e.eklenen.includes(x.slug)) o.yaz?.({...e, eklenen: [...e.eklenen, x.slug]}); GM.toast(`Rotaya eklendi · **+${x.sapma} dk**`, {tur: 'basari'}); }});
    const tik = ev => {
      if (ev.target.closest('[data-eylem="katman"],[data-eylem="filtre"]')) { sheetAc(); return; }
      const il = ev.target.closest('.gm-il'); if (il && kok.contains(il)) { const ad = il.querySelector('.gm-il-bas b')?.textContent; if (ad) ilAc(ad); return; }
      const kart = ev.target.closest('.gm-dk'); if (!kart || ev.target.closest('button,a')) return;
      const k = K.find(x => x.id === kart.dataset.durak); if (k) durakAc(k);
    };
    const pin = ev => { if (ev.detail?.ad !== o.harita) return; const k = K.find(x => x.id === ev.detail.deger); if (k) durakAc(k); };
    kok.addEventListener('click', tik); kok.addEventListener('gm-degisim', pin);
    return () => { kok.removeEventListener('click', tik); kok.removeEventListener('gm-degisim', pin); };
  };

  // ---------- (k) Çevrimdışı paket ----------
  // Paket satırı: GM.rotaKart satir (şema + metin) türevi; içerik ikonları (komoot/Organic Maps), durum rozeti (GM.durumRozet), indirilirken GM.ilerleme.
  // o: {rota, boyut, tarih, durum:'guncel'|'guncelleme'|'iniyor', oran, inen, pinSayi, git}
  GM.paketSatir = (o = {}) => {
    const r = o.rota, iniyor = o.durum === 'iniyor';
    const sema = GM.rotaCizgi({rota: {cizgi: r.cizgi}, pinler: [{lng: r.cizgi[0][0], lat: r.cizgi[0][1], uc: true}, {lng: r.cizgi.at(-1)[0], lat: r.cizgi.at(-1)[1], uc: true}], w: 112, h: 112, dolgu: {top: 14, right: 14, bottom: 14, left: 14}});
    const icerik = [['harita', 'Harita'], ['pin', `${o.pinSayi} pin`], ['pin', 'Adres'], ['telefon', 'Telefon']];
    const durum = iniyor ? '' : o.durum === 'guncelleme' ? GM.durumRozet({metin: 'Güncelleme', ton: 'uyari', ikon: 'yenile'}) : GM.durumRozet({metin: 'Cihazda', ton: 'basari', ikon: 'onay'});
    // Güncelleme düğmesi sağ kolonda silin üstünde (satır ≤ 3: ad · boyut + durum · içerik; yığılma kuralı).
    const eylem = iniyor ? GM.ikonBtn({ikon: 'kapat', etiket: 'İndirmeyi durdur', veri: {eylem: 'pk-durdur', id: r.id}}) : `<span class="gm-pk-eylem">${o.durum === 'guncelleme' ? GM.ikonBtn({ikon: 'yenile', etiket: `${r.ad} paketini güncelle`, tur: 'tint', veri: {eylem: 'pk-guncelle', id: r.id}}) : ''}${GM.ikonBtn({ikon: 'sil', etiket: `${r.ad} paketini sil`, veri: {eylem: 'pk-sil', id: r.id}})}</span>`;
    return `<article class="${liste('gm-pk', iniyor && 'is-iniyor')}" data-paket="${esc(r.id)}"><a class="gm-pk-sema" href="#/rota/${esc(r.id)}" data-git="#/rota/${esc(r.id)}" tabindex="-1" aria-hidden="true">${sema}</a><div class="gm-pk-metin"><a class="gm-pk-ad" href="#/rota/${esc(r.id)}" data-git="#/rota/${esc(r.id)}">${esc(r.ad)}</a>
      ${iniyor ? `<div class="gm-pk-iniyor">${GM.ilerleme({oran: o.oran, etiket: `${r.ad} indiriliyor`, satir: false})}<small>%${Math.round(o.oran * 100)} · ${esc(o.inen)} / ${esc(o.boyut)}</small></div>` : `<span class="gm-pk-meta-satir"><small class="gm-pk-meta">${esc(o.boyut)} · ${esc(String(o.tarih || '').replace(/ \d{1,2}\.\d{2}$/, ''))}</small>${durum}</span><ul class="gm-pk-icerik" aria-label="Paket içeriği">${icerik.map(([i, a]) => `<li>${ik(i)}<span>${esc(a)}</span></li>`).join('')}</ul>`}
      </div>${eylem}</article>`;
  };
  // Depolama özeti: GM.ilerleme çubuğunun parçalı hali (iOS Depolama); l: [{ad, mb, ton:'rota'|'karo'}], bos: cihazda boş alan metni.
  GM.depolama = (o = {}) => { const top = (o.parcalar || []).reduce((t, x) => t + x.mb, 0), olcek = Math.max(top, o.olcek || top) || 1; return `<section class="gm-dp" aria-label="Depolama"><div class="gm-dp-bas"><b>${GM.sayi(top)} MB</b><small>${esc(o.alt || '')}</small></div><div class="gm-dp-cubuk" role="img" aria-label="${esc((o.parcalar || []).map(x => `${x.ad} ${x.mb} MB`).join(', '))}">${(o.parcalar || []).map(x => `<i class="is-${esc(x.ton)}" style="--pay:${(x.mb / olcek).toFixed(3)}"></i>`).join('')}</div><ul class="gm-dp-aciklama">${(o.parcalar || []).map(x => `<li class="is-${esc(x.ton)}"><i aria-hidden="true"></i><span>${esc(x.ad)}</span><b>${GM.sayi(x.mb)} MB</b></li>`).join('')}</ul></section>`; };

  // ---------- (l) Gurme pasaportu ----------
  // GM.rotaBilet (Flighty bileti) ailesinden: koyu primary kart, yıl etiketi, sayı ızgarası (GM.stat dili), il damgaları (coğrafi işaret ikonu).
  // o: {yil, sayilar:[{deger, etiket}], iller:[{ad, tarih}], not}
  GM.pasaport = (o = {}) => `<section class="gm-pp" aria-label="${esc(`Gurme pasaportu ${o.yil}`)}"><header class="gm-pp-bas"><span class="gm-pp-amblem" aria-hidden="true">${ik('cografi')}</span><span><small>Gurme pasaportu</small><b>${esc(o.yil)}</b></span></header><dl class="gm-pp-sayi">${(o.sayilar || []).map(x => `<div><dd>${esc(x.deger)}</dd><dt>${esc(x.etiket)}</dt></div>`).join('')}</dl>${o.iller?.length ? `<ul class="gm-pp-damga" aria-label="Gidilen iller">${o.iller.map(x => `<li><span>${ik('cografi')}<b>${esc(x.ad)}</b><small>${esc(x.tarih || '')}</small></span></li>`).join('')}</ul>` : ''}${o.not ? `<p class="gm-pp-not">${esc(o.not)}</p>` : ''}</section>`;

  // ---------- (j) Araç ekranı: CarPlay / Android Auto ----------
  // GM.telefonCerceve ailesinden (gm-cihaz: çerçeve, cqi ölçeği, sistem yazısı, marka logosu yok). CarPlay POI şablonu: harita + en çok 12 satırlık liste, seçince
  // ayrıntı paneli "Yol tarifi / Geç" (iki adım); Android Auto aynı içerik, kendi kabuğu (sol ray, Material yüzey). Fotoğraf, arama, katman yok (§7 madde 3).
  // o: {platform:'carplay'|'auto', ad, saat, baslik, ogeler:[{tur, ad, alt, sapma, uzak, lng, lat}], secili:index|null, uyari:{baslik, metin}, harita:{cizgi, gecilen, konum, yon}, etiket}
  GM.aracEkrani = (o = {}) => {
    const p = o.platform || 'carplay', l = (o.ogeler || []).slice(0, 12), s = o.secili != null ? l[o.secili] : null;
    // Harita: GM.harita koyu, dokunmasız; liste panelinin altında kalmasın diye sol dolgu. Pinler listedeki sırayla numaralı.
    const h = o.harita || {}, c = h.cizgi || [];
    // Görünen alan: konumdan sıradaki üç durağa (rotanın tamamı değil; konum noktası ile 1 numaralı pin ayrışsın); CarPlay haritası da yaklaşan bölümü gösterir.
    const nk = [...l.slice(0, 3).map(x => [x.lng, x.lat]), ...(h.konum ? [h.konum] : [])], sinir = nk.length > 1 ? [[Math.min(...nk.map(q => q[0])), Math.min(...nk.map(q => q[1]))], [Math.max(...nk.map(q => q[0])), Math.max(...nk.map(q => q[1]))]] : undefined;
    const sema = c.length ? GM.harita({ad: o.ad || `arac-${p}`, stil: 'koyu', etkilesim: false, kontroller: false, tam: true, etiket: 'Rota haritası', rota: {cizgi: c, gecilen: h.gecilen}, konum: h.konum, yon: h.yon, sinir,
      dolgu: {top: 24, right: 40, bottom: 24, left: o.uyari ? 24 : 170}, pinler: l.map((x, i) => ({id: `ae-${i}`, lng: x.lng, lat: x.lat, sira: i + 1, secili: i === o.secili}))}) : '';
    // Satır: numara rozeti (haritadaki pinle aynı), ad + tür, sağda mesafe ve sapma. Tür ikonu numara rozetinin rengidir (gurme primary, yol katmanı nötr).
    const satir = (x, i) => `<li class="${liste('gm-ae-satir', i === o.secili && 'is-secili')}"><span class="gm-ae-no is-${esc(x.tur)}">${i + 1}</span><span class="gm-ae-metin"><b>${esc(x.ad)}</b><small>${esc(x.alt)}</small></span><span class="gm-ae-sag"><b>${esc(x.uzak)}</b><small>${x.sapma <= 2 ? 'Yol üstü' : `+${esc(x.sapma)} dk`}</small></span></li>`;
    const panel = s
      ? `<div class="gm-ae-panel is-detay"><div class="gm-ae-pbas"><span class="gm-ae-geri">${ik('chevron-left')}</span><b>${o.secili + 1}. durak</b></div><div class="gm-ae-detay"><span class="gm-ae-ikon is-${esc(s.tur)} is-buyuk">${ik(s.tur === 'mekan' ? 'mekan' : s.tur)}</span><span class="gm-ae-metin"><b>${esc(s.ad)}</b><small>${esc(s.alt)}</small></span><p>${esc(s.uzak)} · ${s.sapma <= 2 ? 'Yol üstü' : `+${esc(s.sapma)} dk sapma`}</p></div><div class="gm-ae-dugmeler"><span class="is-ana">${ik('navigasyon')}Yol tarifi</span><span>${ik('forward')}Geç</span></div></div>`
      : `<div class="gm-ae-panel"><div class="gm-ae-pbas"><b>${esc(o.baslik || 'Rotandaki duraklar')}</b><small>${l.length}</small></div><ol class="gm-ae-liste">${l.map(satir).join('')}</ol></div>`;
    const yan = p === 'carplay'
      ? `<aside class="gm-ae-yan" aria-hidden="true"><b>${esc(o.saat || '')}</b><span class="gm-ae-sinyal">${ik('signal')}</span><span class="gm-ae-uyg">${ik('map')}</span><span class="gm-ae-uyg">${ik('music')}</span><span class="gm-ae-uyg is-biz"><img src="assets/marka/ikon-512.png" alt=""></span><span class="gm-ae-izgara">${ik('table-cells-large')}</span></aside>`
      : `<aside class="gm-ae-yan" aria-hidden="true"><span class="gm-ae-uyg is-biz"><img src="assets/marka/ikon-512.png" alt=""></span><span class="gm-ae-uyg">${ik('map')}</span><span class="gm-ae-uyg">${ik('music')}</span><span class="gm-ae-uyg">${ik('bell')}</span><span class="gm-ae-izgara">${ik('table-cells-large')}</span><b>${esc(o.saat || '')}</b></aside>`;
    const uyari = o.uyari ? `<div class="gm-ae-uyari" role="alert"><span class="gm-ae-ikon is-mekan">${ik('sesli')}</span><span class="gm-ae-metin"><b>${esc(o.uyari.baslik)}</b><small>${esc(o.uyari.metin)}</small></span><span class="gm-ae-dugmeler is-satir"><span class="is-ana">Ekle</span><span>Geç</span></span></div>` : '';
    return `<figure class="${liste('gm-ae', `is-${p}`)}" role="img" aria-label="${esc(o.etiket || '')}"><div class="gm-ae-govde"><div class="gm-ae-ekran">${yan}<div class="gm-ae-alan"><div class="gm-ae-harita">${sema}</div>${o.uyari ? '' : panel}${uyari}<span class="gm-ae-olcek" aria-hidden="true">${ik('plus')}${ik('minus')}</span></div></div></div></figure>`;
  };
})();
/* Yol takibi (Görev 14/19): Co-Pilot'un açık temalı hâli. Apple/Google Maps yol takibi dili: üstte sıradaki durak kartı (kalan km + dk büyük),
   ortada büyük harita, altta çekmece: varış · kalan · mesafe şeridi, Geç / Navigasyonda aç / Durak ekle, durak zaman çizelgesi (geçildi · sıradaki · sonra).
   API: GM.yolTakipUst · GM.yolTakipEylem. Zaman çizelgesi GM.zamanAkis (gm-k-route.js). */
(() => {
  const esc = s => GM.esc(s), ik = GM.ik, liste = (...a) => a.filter(Boolean).join(' ');
  // Üst: kapat · başlık (rota) · ses; altında sıradaki durak kartı. o: {rota, ses, sira:{tur, ad, alt, gorsel, uzak, sure, sapma, yolUstu}, varis (son durak bitti mi)}
  GM.yolTakipUst = (o = {}) => {
    const s = o.sira || {};
    const kutu = s.gorsel ? `<span class="gm-yt-foto"><span class="gm-photo" style="background-image:url('${esc(s.gorsel)}')"></span></span>` : `<span class="gm-yt-ikon is-${esc(s.tur || 'varis')}">${ik(s.tur === 'mekan' ? 'mekan' : s.tur || 'varis')}</span>`;
    const rozet = s.sapma == null ? '' : GM.sapma({dk: s.yolUstu ? 1 : s.sapma});
    return `<div class="gm-yt-bar">${GM.ikonBtn({ikon: 'kapat', etiket: 'Yol takibini kapat', tur: 'kutu', attrs: 'data-geri'})}<span class="gm-yt-bar-metin"><b>Yol takibi</b><small class="gm-kirp-1">${esc(o.rota || '')}</small></span>${GM.ikonBtn({ikon: o.ses ? 'sesli' : 'volume-xmark', etiket: o.ses ? 'Sesli uyarılar açık' : 'Sesli uyarılar kapalı', tur: 'kutu', veri: {eylem: 'cp-ses'}})}</div>
      <article class="${liste('gm-yt-sira', o.varis && 'is-varis')}" aria-live="polite"><div data-yt-uyari></div><div class="gm-yt-sira-ust"><span class="gm-yt-sira-mesafe"><b>${esc(s.uzak || '')}</b><small>${esc(s.sure || '')}</small></span><span class="gm-yt-sira-metin"><small class="gm-t-label">${esc(o.varis ? 'Varış' : 'Sıradaki durak')}</small><b class="gm-kirp-1">${esc(s.ad || '')}</b><span class="gm-mk-meta gm-tek-satir"><span>${esc(s.alt || '')}</span>${rozet ? `<span class="gm-nokta" aria-hidden="true">·</span>${rozet}` : ''}</span></span>${kutu}</div></article>`;
  };
  // Eylem satırı: Geç (ikincil; varışta Bitir) · Yol tarifi (birincil, navigasyonda aç) · Durak ekle (ikincil). o: {gec:false, bitir}
  GM.yolTakipEylem = (o = {}) => `<div class="gm-yt-eylem">${o.bitir ? GM.btn({metin: 'Bitir', ikon: 'varis', tur: 'secondary', veri: {eylem: 'cp-bitir'}, attrs: 'aria-label="Yolculuğu bitir"'}) : o.gec === false ? '' : GM.btn({metin: 'Geç', ikon: 'forward', tur: 'secondary', veri: {eylem: 'cp-gec'}})}${GM.btn({metin: 'Yol tarifi', ikon: 'navigasyon', veri: {eylem: 'cp-nav'}, attrs: 'aria-label="Navigasyonda aç: yol tarifi harita uygulamasında"'})}${GM.btn({metin: 'Durak ekle', ikon: 'ekle', tur: 'secondary', veri: {eylem: 'cp-ekle'}})}</div>`;
})();
