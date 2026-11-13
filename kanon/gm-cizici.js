/* Dada Gourmet bileşen çizicileri (Diet mobil dd-cizici.js ad çevirisi): Gastro dg-ui.js işaretlemesi, ad ve marka dışında aynı. Hepsi HTML string döner. Katalog: kanon/README.md */
(() => {
  const GM = window.GM, {esc, ik, at, vurgu, sayi, ondalik} = GM;
  const TK = GM.TK;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const bg = src => (src ? ` style="background-image:url('${esc(src)}')"` : '');

  // ---------- Metin ----------
  GM.p = (metin, o = {}) => `<p class="${liste(o.orta && 'gm-orta-metin', o.ton && `gm-ton-${o.ton}`, o.meta && 'gm-t-meta', o.sinif)}">${vurgu(metin)}</p>`;
  GM.metinBlok = (o = {}) => `<div class="${liste('gm-yigin-8', o.orta && 'gm-orta-metin', o.sinif)}">${o.etiket ? `<span class="gm-t-label gm-ton-ikincil">${esc(o.etiket)}</span>` : ''}<h${o.h || 2} class="gm-t-${o.rol || 'page'}">${esc(o.baslik)}</h${o.h || 2}>${o.metin ? GM.p(o.metin, {ton: 'ikincil'}) : ''}</div>`;
  GM.makale = html => `<div class="gm-metin">${html}</div>`;

  // ---------- Avatar, küçük foto, görsel ----------
  // boyut Gastro ölçeği: 20, 40, 56, 96
  GM.avatar = (o = {}) => { const b = o.boyut || 40; return `<span class="${liste('gm-avatar', `s${b}`, o.sinif)}" aria-hidden="true"${bg(o.gorsel)}>${o.gorsel ? '' : esc(String(o.harf ?? o.ad ?? '?').trim().slice(0, 1).toLocaleUpperCase('tr'))}</span>`; };
  GM.kucukFoto = (src, ikon = 'image') => (src ? `<span class="gm-kucuk-foto"${bg(src)} aria-hidden="true"></span>` : `<span class="gm-kucuk-foto" aria-hidden="true">${ik(ikon)}</span>`);
  // Besin görseli: görsel yoksa harf ya da ikon; küçük foto ölçüsünde, ikon kutusu dili.
  GM.gorsel = (o = {}) => (o.src ? `<span class="${liste('gm-kucuk-foto', o.sinif)}"${bg(o.src)} aria-hidden="true"></span>` : `<span class="${liste('gm-kucuk-foto is-yok', `is-${o.ton || 'primary'}`, o.sinif)}" aria-hidden="true">${o.ikon ? ik(o.ikon) : `<b>${esc(String(o.ad || '?').trim().charAt(0).toLocaleUpperCase('tr'))}</b>`}</span>`);
  GM.makroTon = b => { const m = [['protein', (b.P || 0) * 4], ['karb', (b.K || 0) * 4], ['yag', (b.Y || 0) * 9]].sort((x, y) => y[1] - x[1])[0]; return m[1] > 0 ? m[0] : 'primary'; };
  // İkon kutusu: Gastro eylem ve parçalı ikon kutusunun tek adı. boyut sm 32, md 40, lg 44; ton primary, notr, protein, karb, yag, lif, bilgi, basari, uyari, hata
  GM.ikonKutu = (o = {}) => `<span class="${liste('gm-ik', `is-${o.boyut || 'md'}`, `is-${o.ton || 'primary'}`, o.sinif)}" aria-hidden="true">${ik(o.ikon)}</span>`;

  // ---------- Rozet ----------
  GM.rozet = (o = {}) => `<span class="${liste('gm-rozet', o.ton === 'notr' && 'is-notr', o.ton && o.ton !== 'notr' && o.ton !== 'primary' && `is-${o.ton}`, o.sinif)}">${o.ikon ? ik(o.ikon) : ''}${esc(o.metin)}</span>`;
  const DURUM = {taslak: ['Taslak', 'notr', 'pen'], planli: ['Planlı', 'uyari', 'clock'], tamamlandi: ['Tamamlandı', 'basari', 'flag-checkered'], aktif: ['Aktif', 'basari', 'circle-check'], bekliyor: ['Bekliyor', 'uyari', 'hourglass-half'], iptal: ['İptal edildi', 'notr', 'ban'], basarisiz: ['Başarısız', 'hata', 'circle-xmark']};
  // GM.durumRozet({metin, ton, ikon}) ya da GM.durumRozet({kod:'aktif'})
  GM.durumRozet = (o = {}) => { const [a, t, i] = DURUM[o.kod] || []; return `<span class="gm-durum-rozet is-${esc(o.ton || t || 'notr')}">${ik(o.ikon || i || 'circle-info')}<span>${esc(o.metin ?? a)}</span></span>`; };
  GM.sayacRozet = n => `<span class="gm-sayac">${esc(n)}</span>`;
  GM.madalya = (o = {}) => `<span class="${liste('gm-madalya', o.hal === 'ilerliyor' && 'is-ilerliyor', o.hal === 'kilitli' && 'is-kilitli', o.boy && `is-${o.boy}`)}" aria-hidden="true">${ik(o.ikon || 'medal')}${o.hal === 'kilitli' ? `<span class="gm-madalya-kilit">${ik('lock')}</span>` : ''}</span>`;

  // ---------- Çip ----------
  GM.cip = (o = {}) => `<button type="button" class="${liste('gm-chip', o.kucuk && 'is-kucuk', o.sinif)}"${o.deger != null ? ` data-cip="${esc(o.deger)}" aria-pressed="${!!o.secili}"` : ''}${o.pasif ? ' disabled' : ''}${at(o)}>${o.gorsel ? `<img src="${esc(o.gorsel)}" alt="" loading="lazy">` : ''}${o.ikon ? ik(o.ikon) : ''}<span>${esc(o.metin)}</span>${o.sayi != null ? `<span class="gm-chip-sayi">${esc(o.sayi)}</span>` : ''}${o.kapat ? ik('kapat') : ''}</button>`;
  GM.cipler = (o = {}) => { const sec = [].concat(o.secili ?? []); return `<div class="${liste(o.serit === false ? 'gm-sira' : 'gm-serit', o.sinif)}" data-cip-grup="${o.tur || 'coklu'}" data-ad="${esc(o.ad || '')}" role="group"${o.etiket ? ` aria-label="${esc(o.etiket)}"` : ''}>${o.ogeler.map(x => GM.cip({...x, metin: x.metin ?? x.ad, secili: sec.includes(x.deger)})).join('')}</div>`; };

  // ---------- Segment: Gastro'daki tek sekme ailesi ----------
  const segDugme = (x, sec) => `<button type="button" role="tab" data-seg="${esc(x.deger)}" aria-selected="${x.deger === sec}"${x.pasif ? ' disabled' : ''}${x.veri ? at({veri: x.veri}) : ''}>${x.ikon ? ik(x.ikon) : ''}${esc(x.ad)}${x.sayi != null ? ` <span class="gm-seg-sayi">${esc(x.sayi)}</span>` : ''}</button>`;
  GM.segment = (o = {}) => `<div class="${liste('gm-seg', o.kaydir && 'is-kaydir', o.sinif)}" role="tablist" data-ad="${esc(o.ad || '')}" aria-label="${esc(o.etiket || o.ad || '')}">${o.ogeler.map(x => segDugme(x, o.secili)).join('')}</div>`;
  GM.sekmeler = o => GM.segment({...o, kaydir: true});
  // Gün sekmesi: segment is-kaydir. ogeler [{ad:'Pzt', deger, sayi}]
  GM.gunSekme = o => GM.segment({...o, kaydir: true, ogeler: o.ogeler.map(x => ({...x, ad: x.ad ?? x.etiket}))});
  GM.adimGosterge = (o = {}) => `<div class="gm-adim" role="progressbar" aria-valuemin="0" aria-valuemax="${o.toplam}" aria-valuenow="${o.adim}" aria-label="Adım ${o.adim} / ${o.toplam}">${Array.from({length: o.toplam}, (_, i) => `<i${i < o.adim ? ' class="is-on"' : ''}></i>`).join('')}</div>`;
  // Gastro DG.ilerleme: etiketli satır ya da çıplak progress. Geriye uyum: {oran}
  GM.ilerleme = (o = {}) => { const n = o.n ?? (o.oran ?? 0) * 100, h = o.hedef ?? 100, bar = `<progress class="gm-ilerleme" max="${+h || 1}" value="${Math.min(+n || 0, +h || 1)}" aria-label="${esc(o.etiket || 'İlerleme')}"></progress>`; return o.etiket && o.satir !== false ? `<div class="gm-ilerleme-satir"><div class="gm-ilerleme-bas"><span>${esc(o.etiket)}</span><b>${esc(o.deger ?? `${sayi(n)} / ${sayi(h)}`)}</b></div>${bar}</div>` : bar; };

  // ---------- Düğmeler ----------
  const BT = {secondary: 'ikincil', tonal: 'tonlu', text: 'metin', yikici: 'yikici', cam: 'cam', ikincil: 'ikincil', tonlu: 'tonlu', metin: 'metin', 'yikici-ikincil': 'ikincil', 'yikici-metin': 'metin'};
  // Tehlikeli ikincil ve metin: ikincil/metin gövdesi + is-yikici (--gm-tehlike yazı; yapı Gastro .dgu-satir.is-yikici, renk Diet). Dolu --gm-tehlike yalnız onay diyaloğunun eylemi ('yikici').
  const YK = {'yikici-ikincil': 1, 'yikici-metin': 1};
  GM.donen = () => '<span class="gm-kamera-yukleniyor is-satir" aria-hidden="true"></span>';
  // tur primary | secondary | tonal | text | yikici | yikici-ikincil | yikici-metin | cam; boyut sm; tam, pasif, yukleniyor (is-mesgul), ikon
  GM.btn = (o = {}) => { const c = liste('gm-btn', BT[o.tur] && `gm-btn--${BT[o.tur]}`, YK[o.tur] && 'is-yikici', o.boyut === 'sm' && 'gm-btn--sm', o.tam && 'gm-btn--tam', o.yukleniyor && 'is-mesgul', o.basili && 'is-basili', o.sinif), ic = `${o.marka ? `<i class="icon fa-brands fa-${esc(o.marka)}" aria-hidden="true"></i>` : o.gorsel ? `<img class="gm-btn-marka" src="${esc(o.gorsel)}" alt="">` : o.ikon ? ik(o.ikon) : ''}<span>${esc(o.metin)}</span>`; return `<button class="${c}" type="${o.tip || 'button'}"${o.pasif || o.yukleniyor ? ' disabled' : ''}${o.yukleniyor ? ' aria-busy="true"' : ''}${at(o)}>${ic}</button>`; };
  // tur duz | kutu (sheet kapat zemini) | tint (girdi sesi) | dolu | cam
  GM.ikonBtn = (o = {}) => `<button class="${liste('gm-ibtn', o.tur && o.tur !== 'duz' && `is-${o.tur}`, o.sinif)}" type="${o.tip || 'button'}"${o.secili != null ? ` aria-pressed="${!!o.secili}"` : ''}${o.pasif ? ' disabled' : ''}${at(o)}>${ik(o.ikon)}</button>`;
  GM.fab = (o = {}) => `<button class="${liste('gm-fab is-ekran', o.sinif)}" type="button"${o.pasif ? ' disabled' : ''}${at(o)}>${ik(o.ikon || 'ekle')}</button>`;
  // İkili düğme dizilimi (Gastro .dgu-ikili, DG.onay): eşit iki sütun, ikincil solda, birincil sağda. ikincil tur varsayılanı secondary.
  GM.btnIkili = (ikincil, birincil, o = {}) => `<div class="${liste('gm-ikili', o.sinif)}">${GM.btn({tur: 'secondary', ...ikincil})}${GM.btn(birincil)}</div>`;
  GM.uzunBas = (o = {}) => `<div class="gm-uzun-kap"><button type="button" class="${liste('gm-btn', BT[o.tur] && `gm-btn--${BT[o.tur]}`, YK[o.tur] && 'is-yikici', 'gm-btn--tam', 'gm-uzun', o.sinif)}" data-uzunbas data-ad="${esc(o.ad || '')}"${o.sure ? ` data-sure="${o.sure}" style="--gm-uzun-sure:${+o.sure}ms"` : ''} data-onay-baslik="${esc(o.onayBaslik || o.metin)}" data-onay-metin="${esc(o.onayMetin || '')}" data-onay-eylem="${esc(o.onayEylem || o.metin)}"${o.pasif ? ' disabled' : ''}${at(o)}><i class="gm-uzun-dolgu"></i>${o.ikon ? ik(o.ikon) : ''}<span>${esc(o.metin)}</span></button>${o.yardim ? `<small class="gm-yardim">${esc(o.yardim)}</small>` : ''}</div>`;
  GM.link = (o = {}) => `<a class="gm-head__link section-heading-action" href="${esc(o.git || '#/kesfet')}" aria-label="${esc(o.aria || o.metin)}">${esc(o.metin)} ${ik('tumu')}</a>`;

  // ---------- Form ----------
  GM.input = (o = {}) => { const id = o.id || `f-${o.ad || Math.random().toString(36).slice(2, 7)}`; return `<div class="${liste('gm-alan', o.hata && 'is-hata', o.sinif)}">${o.etiket ? `<label for="${esc(id)}">${esc(o.etiket)}${o.zorunlu ? ' *' : ''}</label>` : ''}<div class="${liste('gm-girdi', o.deger && 'has-text')}">${o.ikon ? ik(o.ikon) : ''}${o.cokSatir ? `<textarea${o.hata ? ' aria-invalid="true"' : ''} id="${esc(id)}" name="${esc(o.ad || '')}" placeholder="${esc(o.yer || '')}"${o.pasif ? ' disabled' : ''}>${esc(o.deger || '')}</textarea>` : `<input${o.hata ? ' aria-invalid="true"' : ''} id="${esc(id)}" name="${esc(o.ad || '')}" type="${esc(o.tur || 'text')}" placeholder="${esc(o.yer || '')}" value="${esc(o.deger ?? '')}"${o.pasif ? ' disabled' : ''}${o.mod ? ` inputmode="${esc(o.mod)}"` : ''} autocomplete="${esc(o.otomatik || 'off')}">`}${o.birim ? `<span class="gm-yardim">${esc(o.birim)}</span>` : ''}${o.temizle && !o.cokSatir ? `<button class="gm-ibtn gm-temizle" type="button" aria-label="Temizle">${ik('kapat')}</button>` : ''}${o.tur === 'password' ? `<button class="gm-ibtn" type="button" data-sifre-goster aria-label="Şifreyi göster">${ik('eye')}</button>` : ''}${o.sag || ''}</div>${o.hata ? `<p class="gm-hata">${ik('uyari')}${esc(o.hata)}</p>` : ''}${o.yardim ? `<p class="gm-yardim">${esc(o.yardim)}</p>` : ''}</div>`; };
  // Seçim alanı: girdi görünümlü düğme, sheet'te radyo listesi.
  GM.secAlan = (o = {}) => { const sec = (o.secenekler || []).find(([d]) => String(d) === String(o.deger)); return `<div class="${liste('gm-alan', o.hata && 'is-hata')}"><label id="l-${esc(o.ad)}" for="f-${esc(o.ad)}">${esc(o.etiket)}${o.zorunlu ? '<span aria-hidden="true"> *</span>' : ''}</label><div class="gm-girdi gm-secici"><button type="button" id="f-${esc(o.ad)}" class="gm-secici-dugme"${o.hata ? ' aria-invalid="true"' : ''} data-sec-alan="${esc(o.ad)}" data-yer="${esc(o.yer || 'Seç')}" data-secenekler="${esc(JSON.stringify(o.secenekler || []))}" aria-haspopup="dialog"><span${sec ? '' : ' class="is-yer"'}>${esc(sec ? sec[1] : o.yer || 'Seç')}</span></button><span class="gm-secici-ok" aria-hidden="true">${ik('ac')}</span><input type="hidden" name="${esc(o.ad)}" value="${esc(sec ? sec[0] : '')}"></div>${o.hata ? `<p class="gm-hata">${ik('uyari')}${esc(o.hata)}</p>` : ''}${o.yardim ? `<p class="gm-yardim">${esc(o.yardim)}</p>` : ''}</div>`; };
  GM.arama = (o = {}) => `<div class="${liste('gm-arama', o.sinif)}" role="search"><div class="${liste('gm-girdi', o.deger && 'has-text')}">${ik('ara_')}<input type="search" name="${esc(o.ad || 'q')}" placeholder="${esc(o.yer || 'Ara')}" value="${esc(o.deger || '')}" aria-label="${esc(o.yer || 'Ara')}" autocomplete="off" enterkeyhint="search"><button class="gm-ibtn gm-temizle" type="button" aria-label="Temizle">${ik('kapat')}</button>${o.mikrofon ? `<button class="gm-ibtn gm-girdi-ses" type="button" aria-label="Sesle ara"${at({git: o.mikrofon === true ? '#/ai/ses' : o.mikrofon})}>${ik('mikrofon')}</button>` : ''}${o.filtre ? `<button class="gm-ibtn" type="button" aria-label="Filtrele" data-eylem="filtre">${ik('filtre')}</button>` : ''}${o.sonEk || ''}</div>${o.sonuc === false ? '' : '<div class="gm-arama-sonuc"></div>'}</div>`;
  GM.adimDeger = (v, birim) => `<b>${esc(v)}</b>${birim ? `<span>${esc(birim)}</span>` : ''}`;
  // Adımlayıcı: Gastro DG.adimlayici. API: GM.stepper
  GM.stepper = (o = {}) => { const {deger = 1, min = 1, max = 99, adim = 1, birim = ''} = o; return `<div class="gm-adimlayici" role="group" aria-label="${esc(o.aria || o.ad || '')}" data-adimlayici data-ad="${esc(o.ad || '')}" data-min="${min}" data-max="${max}" data-adim="${adim}" data-birim="${esc(birim)}"><button type="button" data-adim-yon="-1" aria-label="Azalt"${+deger <= min ? ' disabled' : ''}>${ik('minus')}</button><span class="gm-adim-deger"><output aria-live="polite">${GM.adimDeger(ondalik(deger, 2), birim)}</output><span class="gm-adim-iz" aria-hidden="true">${GM.adimDeger('0'.repeat(Math.max(2, String(max).length)), birim)}</span></span><input type="hidden" name="${esc(o.ad || '')}" value="${esc(deger)}"><button type="button" data-adim-yon="1" aria-label="Artır"${+deger >= max ? ' disabled' : ''}>${ik('plus')}</button></div>`; };
  // Gastro DG.secim; alt verilince Gastro profil.js:496 yapısı (span.gm-satir-metin > span + small).
  const secimEt = (o, tur) => `<label class="gm-secim"><input type="${tur}" name="${esc(o.ad || '')}" value="${esc(o.deger ?? '1')}"${o.secili ? ' checked' : ''}${o.pasif ? ' disabled' : ''}><span>${o.alt ? `<span class="gm-satir-metin"><span>${o.etiketHtml || esc(o.etiket)}</span><small>${esc(o.alt)}</small></span>` : o.etiketHtml || esc(o.etiket)}</span></label>`;
  // Dosya alanı (Gastro ayarlar.js dosyaAlan): ikincil tam genişlik düğme görünümlü etiket + gizli file input; seçilince adı düğmede görünür (gm-ui.js).
  // {ad, etiket, metin ('Dosya seç'), ikon, kabul (accept), yardim}. Prototipte dosya yüklenmez, yalnız adı kayda geçer.
  GM.dosyaAlan = (o = {}) => `<div class="gm-alan"><span class="gm-etiket">${esc(o.etiket || 'Ek dosya')} <span class="gm-ops">(isteğe bağlı)</span></span><label class="gm-btn gm-btn--ikincil gm-btn--tam gm-dosya">${ik(o.ikon || 'paperclip')}<span data-dosya-ad data-bos="${esc(o.metin || 'Dosya seç')}">${esc(o.metin || 'Dosya seç')}</span><input class="gm-sr" type="file" name="${esc(o.ad || 'dosya')}" accept="${esc(o.kabul || 'image/jpeg,image/png,image/webp,application/pdf')}"></label>${o.yardim ? `<p class="gm-yardim">${esc(o.yardim)}</p>` : ''}</div>`;
  GM.checkbox = (o = {}) => secimEt(o, 'checkbox');
  GM.radio = (o = {}) => secimEt(o, 'radio');
  GM.anahtar = (o = {}) => `<label class="gm-anahtar"><input type="checkbox" name="${esc(o.ad || '')}"${o.secili ? ' checked' : ''}${o.pasif ? ' disabled' : ''} aria-label="${esc(o.etiket || o.ad || '')}"><i></i></label>`;
  // Anahtarlı satır: Gastro satır + anahtar.
  GM.toggle = (o = {}) => `<div class="gm-satir">${o.ikon ? `<span class="gm-satir-ikon">${ik(o.ikon)}</span>` : ''}<span class="gm-satir-metin"><span>${esc(o.etiket)}</span>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span>${GM.anahtar(o)}</div>`;
  GM.slider = (o = {}) => {
    const {min, max, adim = 1, birim = '', deger = min} = o, n = Math.round((max - min) / adim), her = o.etiketHer || 10, et = [];
    for (let i = 0; i <= n; i += her) et.push(`<span style="--i:${i}">${ondalik(min + i * adim, adim % 1 && her * adim % 1 ? 1 : 0)}</span>`);
    return `<div class="gm-slider" data-c="slider" data-ad="${esc(o.ad || '')}" data-min="${min}" data-max="${max}" data-adim="${adim}" data-deger="${deger}" data-birim="${esc(birim)}"><output class="gm-slider-deger"><b class="gm-slider-sayi gm-t-numeral-xl">${ondalik(deger, adim % 1 ? 1 : 0)}</b><span>${esc(birim)}</span></output><div class="gm-slider-cetvel" role="slider" tabindex="0" aria-label="${esc(o.etiket || birim)}" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${deger}"><div class="gm-slider-serit" style="--adet:${n};--her:${her}">${et.join('')}</div><i class="gm-slider-igne"></i></div></div>`;
  };
  GM.porsiyon = (o = {}) => {
    const sec = o.birimler.find(b => b.birim === o.secili) || o.birimler[0], miktar = o.miktar ?? 1, gram = sec.gram * miktar, g = sec.birim === 'gram';
    return `<div class="gm-porsiyon" data-ad="${esc(o.ad || 'porsiyon')}" data-kcal100="${+o.kcal100 || 0}"><div class="gm-serit" role="group" aria-label="Birim">${o.birimler.map(b => `<button type="button" class="gm-chip" data-birim="${esc(b.birim)}" data-gram="${b.gram}" aria-pressed="${b === sec}">${esc(b.birim)}</button>`).join('')}</div><div class="gm-ara">${GM.stepper({ad: `${o.ad || 'porsiyon'}-miktar`, deger: miktar, min: g ? 10 : .5, max: g ? 1000 : 20, adim: g ? 10 : .5, birim: sec.birim})}<div class="gm-porsiyon-ozet"><b class="gm-t-stat"><span data-p-kcal>${sayi((o.kcal100 || 0) * gram / 100)}</span> kcal</b><small class="gm-t-meta gm-ton-ikincil"><span data-p-gram>${sayi(gram)}</span> g</small></div></div></div>`;
  };
  const KESIR = [[.25, '¼'], [.5, '½'], [.75, '¾'], [1, '1'], [1.5, '1½'], [2, '2'], [2.5, '2½'], [3, '3']].map(([deger, metin]) => ({deger, metin}));
  GM.kesirIzgara = (o = {}) => `<div class="gm-kesir" data-cip-grup="tek" data-ad="${esc(o.ad || 'kesir')}">${(o.ogeler || KESIR).map(k => GM.cip({...k, secili: k.deger === (o.secili ?? 1)})).join('')}</div>`;
  GM.puan = (o = {}) => { const PUAN = ['Çok kötü', 'Kötü', 'İdare eder', 'İyi', 'Harika']; return `<fieldset class="gm-puan"><legend class="gm-sr">${esc(o.etiket || 'Puanın')}</legend><div class="gm-puan-yildizlar">${[5, 4, 3, 2, 1].map(n => `<input type="radio" id="p-${esc(o.ad)}-${n}" name="${esc(o.ad)}" value="${n}"${n === o.deger ? ' checked' : ''}><label for="p-${esc(o.ad)}-${n}" aria-label="${n} yıldız, ${PUAN[n - 1]}">${ik('yildiz')}</label>`).join('')}</div>${o.deger ? `<span class="gm-puan-etiket">${PUAN[o.deger - 1]}</span>` : ''}</fieldset>`; };

  // Telefon alanı: Gastro DG.telefon; yalnız TR (+90), ülke sheet'i taşınmadı.
  // Telefon: Gastro DG.telefon yapısı — ülke düğmesi (bayrak 24×18 + kod + ok), görünür alan biçimli ("5xx xxx xx xx"), gönderilen değer gizli alanlarda:
  // name=ad yalnız rakam, name=ulkeAd ISO. Ülke seçim sheet'i taşınmadı: düğme aria-disabled. {ad, ulkeAd, etiket, deger, zorunlu, opsiyonel, hata, yardim}
  const telBicim = r => [r.slice(0, 3), r.slice(3, 6), r.slice(6, 8), r.slice(8, 10)].filter(Boolean).join(' ');
  GM.telefon = (o = {}) => { const ad = o.ad || 'telefon', r = String(o.deger || '').replace(/\D/g, '').replace(/^0/, '').slice(0, 10); return `<div class="${liste('gm-alan', o.hata && 'is-hata')}" data-telefon="${esc(ad)}"><label for="f-${esc(ad)}">${esc(o.etiket || 'Telefon')}${o.zorunlu ? ' *' : ''}${o.opsiyonel ? ' <span class="gm-ops">(isteğe bağlı)</span>' : ''}</label><div class="gm-girdi gm-telefon"><button type="button" class="gm-telefon-ulke" data-telefon-ulke aria-haspopup="dialog" aria-disabled="true" aria-label="Ülke kodu — şu an Türkiye +90"><img class="gm-telefon-bayrak" src="assets/flags/tr.svg" width="24" height="18" alt=""><span>+90</span>${ik('ac')}</button><input id="f-${esc(ad)}" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="5__ ___ __ __" value="${esc(telBicim(r))}"${o.zorunlu ? ' required' : ''}><input type="hidden" name="${esc(ad)}" value="${esc(r)}"><input type="hidden" name="${esc(o.ulkeAd || 'telefon_ulke')}" value="TR"></div>${o.hata ? `<p class="gm-hata">${ik('uyari')}${esc(o.hata)}</p>` : ''}${o.yardim ? `<p class="gm-yardim">${esc(o.yardim)}</p>` : ''}</div>`; };
  // Gastro dg-ui.js:542: yazarken gizli alana rakam, görünür alana biçim; hata hali kalkar.
  document.addEventListener('input', e => { const t = e.target; if (t.type !== 'tel') return; const k = t.closest('[data-telefon]'); if (!k) return; const r = t.value.replace(/\D/g, '').replace(/^0/, '').slice(0, 10); k.querySelector('input[type=hidden]').value = r; t.value = telBicim(r); k.classList.remove('is-hata'); });

  // ---------- Üst bar, alt menü ----------
  const logo = () => `<a class="gm-logo" href="#/kesfet" aria-label="Dada Gourmet ana sayfa"><img src="assets/marka/dadagourmet-beyaz.svg" alt="Dada Gourmet"></a>`;
  GM.ustBtn = (o = {}) => (typeof o === 'string' ? o : `<button class="gm-hbtn${o.ara ? ' gm-hara' : ''}" type="button" aria-label="${esc(o.etiket || '')}"${at({...o, etiket: undefined})}>${ik(o.ikon)}${o.sayi ? GM.sayacRozet(o.sayi) : ''}</button>`);
  const MENU = {ikon: 'bars', etiket: 'Menü', attrs: 'data-menu'}, ZIL = () => ({ikon: 'bildirim', etiket: 'Bildirimler', git: '#/bildirimler', attrs: 'data-zil', sayi: GM.bildirimSayi() || undefined}), ARA = {ikon: 'ara_', etiket: 'Ara', git: '#/ara', ara: true};
  // Mesaj kutusu (Instagram'daki gibi zilin yanında): diyetisyen sohbeti; rozet okunmamış diyetisyen mesajı (uzman.js / profil.js ile aynı kural).
  GM.ustVarsayilan = () => [ARA, ZIL(), MENU];
  // Okunmamış sayısı: veri + kullanıcının okuduğu ve sildiği id'ler. Yığındaki bütün üst barlar birlikte tazelenir.
  GM.bildirimSayi = () => { if (!GM.uye()) return 0; const dus = new Set([...GM.durum.oku('bildirim-okundu', []), ...GM.durum.oku('bildirim-silinen', [])].map(String)); return [...(GM.yeniHesap() ? [] : window.GMV?.bildirimler || []), ].filter(b => !b.okundu && !dus.has(String(b.id))).length; };
  GM.zilTazele = () => { [['[data-zil]', GM.bildirimSayi()]].forEach(([sec, n]) => document.querySelectorAll(sec).forEach(b => { const r = b.querySelector('.gm-sayac'); if (!n) r?.remove(); else if (r) r.textContent = n; else b.insertAdjacentHTML('beforeend', GM.sayacRozet(n)); })); };
  document.addEventListener('gm-bildirim', GM.zilTazele);
  // tur sekme | alt | banner | modal; saydam: görsel üstünde başlar. sekme: logo · ara · zil · menü. alt: geri · başlık · eylem · menü.
  GM.ustBar = (o = {}) => {
    const tur = o.tur || 'alt', foto = o.saydam ?? tur === 'banner', kok = tur === 'sekme' || (tur === 'banner' && o.geri === false);
    const sinif = liste('gm-header', foto && 'is-photo');
    if (kok) return `<header class="${sinif}">${o.sol ?? logo()}<span class="gm-hbosluk"></span>${(o.sag ?? GM.ustVarsayilan()).map(GM.ustBtn).join('')}</header>`;
    if (tur === 'modal') return `<header class="${sinif}">${GM.ustBtn({ikon: 'kapat', etiket: 'Kapat', geri: true})}<span class="gm-htitle gm-kirp-1">${esc(o.baslik || '')}</span>${(o.sag || []).map(GM.ustBtn).join('')}</header>`;
    return `<header class="${sinif}">${o.sol ?? GM.ustBtn({ikon: 'geri', etiket: 'Geri', geri: true})}<span class="gm-htitle gm-kirp-1">${esc(o.baslik || '')}</span>${(o.sag || []).map(GM.ustBtn).join('')}${o.menu === false ? '' : GM.ustBtn(MENU)}</header>`;
  };
  GM.altMenu = () => `<div class="gm-dock"><nav class="gm-nav" aria-label="Alt menü">${TK.nav.items.map(n => (n.center
    ? `<a href="${n.href}" data-uzun="fab" aria-label="${esc(n.label)}"><span class="gm-fab">${ik(n.icon)}</span><span>${esc(n.label)}</span></a>`
    : `<a href="${n.href}" data-nav="${n.id}">${ik(n.icon)}<span>${esc(n.label)}</span></a>`)).join('')}</nav></div>`;

  // ---------- Geri bildirim yüzeyleri ----------
  // Uyarı bandı: Gastro DG.ipucu kalıbı, dört durum tonu. {ton, baslik, metin, ikon, eylem}
  GM.ipucu = (o = {}) => `<aside class="${liste('gm-ipucu', o.ton && `is-${o.ton}`, o.eylem && 'is-eylemli', o.sinif)}"><span class="gm-ipucu-ikon" aria-hidden="true">${ik(o.ikon || 'ipucu')}</span><div>${o.baslik ? `<h4>${esc(o.baslik)}</h4>` : ''}<p>${o.html ?? vurgu(o.metin || '')}</p></div>${o.eylem ? GM.btn({tur: 'secondary', boyut: 'sm', ...o.eylem}) : ''}</aside>`;
  GM.bant = (o = {}) => GM.ipucu({...o, ton: o.ton || 'bilgi', ikon: o.ikon || {bilgi: 'bilgi', basari: 'basari', uyari: 'uyari', hata: 'hata'}[o.ton || 'bilgi']});
  GM.bilgi = (o = {}) => `<div class="gm-bilgi">${o.etiket ? `<span class="gm-t-label">${o.ikon ? ik(o.ikon) : ''}${esc(o.etiket)}</span>` : ''}${o.metin ? GM.p(o.metin) : ''}${o.html || ''}</div>`;
  GM.veriYok = metin => `<p class="gm-veri-yok">${ik('bilgi')}<span>${vurgu(metin)}</span></p>`;
  // Çevrimdışı şeridi: içeriğin üstüne yapışır, ekran önbellekten gösterilir. {saat} son eşitleme.
  GM.cevrimdisi = (metin = 'Bağlantı yok, kayıtlar bu cihazda duruyor', o = {}) => `<div class="gm-cevrimdisi" role="status">${ik('wifi')}<span>${esc(metin)}</span>${o.saat ? `<small>Son eşitleme ${esc(o.saat)}</small>` : ''}</div>`;
  // Boş durum: Gastro DG.durum. {ikon, baslik, metin, eylem (btn seçenekleri), tam}
  GM.bos = (o = {}) => `<div class="${liste('gm-durum', o.tam && 'is-tam', o.sinif)}"><span class="gm-durum-ikon">${ik(o.ikon || 'bilgi')}</span><h2 class="gm-t-section">${esc(o.baslik)}</h2>${o.metin ? `<p>${vurgu(o.metin)}</p>` : ''}${o.eylem ? GM.btn(o.eylem) : ''}${o.ikincil ? GM.btn({tur: 'text', ...o.ikincil}) : ''}</div>`;
  // Gastro DG.vizor: durum sahnesinin üst parçası.
  const ISARET = {soru: 'question', bulanik: 'droplet-slash', baglanti: 'wifi', yemek: 'utensils', uyari: 'triangle-exclamation', hata: 'circle-exclamation'};
  GM.vizor = (o = {}) => `<div class="${liste('gm-sahne-ust is-koyu gm-vizor', o.kompakt && 'is-kompakt', o.sinif)}"><div class="gm-sahne-cerceve${o.bulanik ? ' is-bulanik' : ''}"><span class="gm-sahne-foto"${bg(o.foto)}></span><i class="gm-kose is-ust-sol"></i><i class="gm-kose is-ust-sag"></i><i class="gm-kose is-alt-sol"></i><i class="gm-kose is-alt-sag"></i>${o.tarama ? '<i class="gm-vizor-tarama" aria-hidden="true"></i>' : ''}${o.isaret ? `<span class="gm-sahne-isaret" aria-hidden="true">${ik(ISARET[o.isaret] || o.isaret)}</span>` : ''}</div>${o.yonerge ? `<p class="gm-sahne-not">${ik(o.yonerge.ikon || 'gizlilik')}<span>${esc(o.yonerge.metin ?? o.yonerge)}</span></p>` : ''}${o.ek || ''}</div>`;
  const eylemBtn = (e, tur) => (e ? GM.btn({...e, tur: tur || e.tur, tam: true}) : '');
  // Gastro DG.durumSahne. {tema:'koyu'|'acik', gorsel, isaret, baslik, metin, not, ana, ikinciller, ipuclari:[[ikon,baslik,alt]], ipucuBaslik, ipucuParcali, oneriler (html dizi), onerilerBaslik}
  GM.durumSahne = (o = {}) => {
    const koyu = o.tema === 'koyu', isr = ISARET[o.isaret] || o.isaret || 'bilgi';
    const gorsel = koyu ? GM.vizor({foto: o.gorsel, isaret: isr, bulanik: o.isaret === 'bulanik', yonerge: o.not ? {metin: o.not} : ''}) : `<div class="gm-sahne-ust"><span class="gm-sahne-rozet" aria-hidden="true">${ik(isr)}</span></div>`;
    const ipuc = o.ipuclari?.length ? `<section class="gm-sahne-ek"><h2 class="gm-t-sub">${esc(o.ipucuBaslik || 'İpuçları')}</h2>${o.ipucuParcali ? GM.parcali(o.ipuclari.map(([ikon, baslik, alt]) => ({ikon, baslik, alt, bilgi: true}))) : `<ul class="gm-sahne-ipuclari">${o.ipuclari.map(([i, b, a]) => `<li><span class="gm-sahne-ipucu-ikon" aria-hidden="true">${ik(i)}</span><span><b>${esc(b)}</b>${a ? `<small>${esc(a)}</small>` : ''}</span></li>`).join('')}</ul>`}</section>` : '';
    const oner = o.oneriler?.length ? `<section class="gm-sahne-ek"><h2 class="gm-t-sub">${esc(o.onerilerBaslik || 'Belki bunlardan biri?')}</h2><div class="gm-serit gm-sahne-oneriler">${o.oneriler.join('')}</div></section>` : '';
    return `<div class="gm-sahne${koyu ? ' is-koyu' : ''}">${gorsel}<div class="gm-sahne-panel"><div class="gm-sahne-metin"><h1 class="gm-t-page">${esc(o.baslik)}</h1>${o.metin ? `<p>${vurgu(o.metin)}</p>` : ''}</div><div class="gm-sahne-eylem">${eylemBtn(o.ana)}${(o.ikinciller || []).map(e => eylemBtn(e, 'secondary')).join('')}</div>${ipuc}${oner}</div></div>`;
  };
  const HATA = {
    baglanti: {isaret: 'baglanti', baslik: 'Bağlantı yok', metin: 'İnternet bağlantını kontrol edip **tekrar dene**.', ipucuBaslik: 'Kontrol edebileceklerin', ipuclari: [['wifi', 'Wi-Fi ya da mobil veri', 'Bağlantının açık olduğundan emin ol.'], ['plane', 'Uçak modu', 'Açıksa kapat.'], ['rotate-right', 'Yeniden dene', 'Bağlantı gelince ekran kaldığı yerden açılır.']]},
    genel: {isaret: 'uyari', baslik: 'Bir şeyler ters gitti', metin: 'Beklenmedik bir hata oluştu. **Biraz sonra** tekrar dene.'},
    sunucu: {isaret: 'server', baslik: 'Sunucuya ulaşamadık', metin: 'Sorun bizde, **kayıtların güvende**. Birkaç dakika sonra tekrar dene.', ipucuBaslik: 'Bu sırada', ipuclari: [['mobile-screen', 'Kayıtların cihazında', 'Bağlantı düzelince kendiliğinden eşitlenir.']]},
    zaman: {isaret: 'hourglass-half', baslik: 'Yanıt gecikti', metin: 'Sunucu zamanında yanıt vermedi. **Tekrar dene.**'},
    bulunamadi: {isaret: 'ara_', baslik: 'Bu sayfa burada değil', metin: 'Bağlantı eskimiş olabilir. **Keşfet’e dönüp** oradan devam edebilirsin.'}
  };
  GM.hataEkran = (o = {}) => { const h = {...HATA[o.tur || 'genel'], ...o}; return GM.durumSahne({...h, ana: o.eylem || {metin: 'Tekrar dene', ikon: 'yenile', veri: {'gm-tazele': 1}}, ikinciller: o.ikinciller ?? (o.tur === 'bulunamadi' ? [] : [{metin: 'Keşfet’e dön', ikon: 'house', yerine: '#/kesfet'}])}); };
  // Kilitli (premium) hal: durum sahnesi + Pro kademesinin özellikleri (GMV.uye.kademeler, uydurma yok) + Pro'ya geç / Şimdi değil.
  GM.premiumKilit = (o = {}) => {
    const k = (window.GMV?.uye?.kademeler || []).find(x => x.kod === (o.kademe || 'pro')) || {tamAd: 'Dada Gourmet Pro', ozellikler: [], fiyat: null};
    // Karar 1 (11 Kasım): Pro satışa açılmadıysa (GMV.uye.pro.satista === false) her girişte aynı dil: durum metni, "Yakında", pasif düğme.
    const p = window.GMV?.uye?.pro || {}, kapali = p.satista === false, ad = k.ad || 'Pro';
    return GM.durumSahne({isaret: 'lock', baslik: o.baslik || `${k.tamAd} ile açılır`, metin: o.metin || `Bu bölüm **${ad}** üyelikte. ${kapali ? p.durumMetni : (k.ozet || '')}`.trim(), ipucuBaslik: `${ad} ile gelenler`,
      ipuclari: [...(kapali ? [['clock', p.rozet, p.fiyatNotu]] : []), ...(k.ozellikler || []).slice(0, 5).map(x => ['circle-check', x])],
      ana: kapali ? {metin: `${p.dugme} · ${p.rozet}`, ikon: k.ikon || 'bolt', pasif: true} : {metin: k.fiyat ? `${ad}’ya geç · ${sayi(k.fiyat)} TL/ay` : `${ad}’ya geç`, ikon: k.ikon || 'bolt', git: GM.uye() ? '#/paketlerim' : '#/pro'},
      ikinciller: [...(kapali ? [{metin: k.tamAd, ikon: 'bolt', git: '#/pro'}] : []), {metin: 'Şimdi değil', geri: true}]});
  };
  // Giriş duvarı (Gastro DG.girisDuvari, dg-ui.js 88): durum + eşit ikili düğme (Üye ol ikincil, Giriş yap birincil) + "Giriş yapınca" maddeleri.
  // {ikon, baslik, metin, sunar:[[ikon, baslik, alt]], uyeOl (gerekçe: data-uye-ol ile üyelik sheet'i), tam (sunar yoksa dikeyde ortalı)}
  GM.girisDuvari = (o = {}) => `<div class="gm-duvar"><div class="${liste('gm-durum', o.tam && !o.sunar?.length && 'is-tam')}"><span class="gm-durum-ikon">${ik(o.ikon || 'lock')}</span><h2 class="gm-t-section">${esc(o.baslik || 'Önce giriş yap')}</h2>${o.metin ? `<p>${vurgu(o.metin)}</p>` : ''}<div class="gm-ikili">${GM.btn({metin: 'Üye ol', tur: 'secondary', ...(o.uyeOl ? {veri: {'uye-ol': o.uyeOl}} : {git: '#/karsilama'})})}${GM.btn({metin: 'Giriş yap', git: '#/giris'})}</div></div>${o.sunar?.length ? `<section class="gm-ic gm-yigin-12" aria-label="Giriş yapınca"><h2 class="gm-t-label">Giriş yapınca</h2>${GM.maddeler(o.sunar)}</section>` : ''}</div>`;
  // Giriş gerekli hal (?hal=giris, ekran içi kapılar): giriş duvarı, tam ekran.
  GM.girisGerekli = (o = {}) => GM.girisDuvari({tam: true, metin: 'Bu bölüm **hesabına bağlı**. Giriş yapınca kayıtların her cihazda seninle olur.', ...o});
  // Gastro DG.izinIstemi. {ikon, gorsel, baslik, metin, maddeler, izin, alternatif:{metin,git}, red, reddedildi:{baslik,metin}} → {html, bar}
  GM.maddeler = l => `<ul class="gm-izin-maddeler">${l.map(([i, t, a]) => `<li><span class="gm-izin-madde-ikon" aria-hidden="true">${ik(i)}</span><span><b>${esc(t)}</b>${a ? `<small>${esc(a)}</small>` : ''}</span></li>`).join('')}</ul>`;
  GM.izinIstemi = (o = {}) => {
    const r = !!o.red, b = r ? o.reddedildi : o;
    const html = `<div class="gm-izin${r ? ' is-red' : ''}">${GM.gulucuk({gorsel: o.gorsel, rozet: r ? 'lock' : o.ikon, red: r})}<div class="gm-ic gm-izin-govde"><h1 class="gm-t-page">${esc(b.baslik)}</h1><p class="gm-izin-metin">${vurgu(b.metin)}</p>${!r && o.maddeler?.length ? GM.maddeler(o.maddeler) : ''}</div></div>`;
    const ikinci = o.alternatif ? GM.btn({metin: o.alternatif.metin, tur: 'secondary', git: o.alternatif.git}) : GM.btn({metin: 'Şimdi değil', tur: 'secondary', geri: true});
    return {html, bar: `<div class="gm-bar"><div class="gm-bar-ic">${ikinci}${r ? GM.btn({metin: 'Ayarları aç', ikon: 'ayar', attrs: 'data-izin-ayar'}) : GM.btn({metin: o.izin || 'İzin ver', attrs: 'data-izin-ver'})}</div></div>`};
  };

  // ---------- İskelet (Gastro DG.iskelet) ----------
  const isk = (cls, ek = '') => `<span class="gm-iskelet ${cls}"${ek}></span>`;
  const ISK = {
    kart: () => `<div class="gm-isk-kart">${isk('is-kart')}${isk('is-etiket')}${isk('is-satir')}${isk('is-satir is-kisa')}<span class="gm-isk-yazar">${isk('is-avatar20')}${isk('is-satir is-ad')}</span></div>`,
    satir: () => `<div class="gm-isk-satir">${isk('is-kucuk')}<span class="gm-isk-metin">${isk('is-satir')}${isk('is-satir is-kisa')}</span></div>`,
    liste: () => `<div class="gm-isk-satir is-kart">${isk('is-liste-foto')}<span class="gm-isk-metin">${isk('is-etiket')}${isk('is-satir')}${isk('is-satir is-kisa')}</span></div>`,
    izgara: () => isk('is-kare')
  };
  // tur kart | satir | liste | izgara | detay | profil | ekran. Eski sıra da kabul: GM.iskelet('liste', 3)
  GM.iskelet = (a = 4, b = 'kart') => {
    let tur = b, n = a; if (typeof a === 'string') { tur = a; n = typeof b === 'number' ? b : 4; }
    if (tur === 'ekran') tur = 'detay';
    if (tur === 'detay') return `<div class="gm-isk-detay" aria-busy="true" inert>${isk('is-kapak')}<div class="gm-ic gm-yigin-12">${isk('is-baslik')}${isk('is-satir is-kisa')}<span class="gm-isk-cipler">${isk('is-cip')}${isk('is-cip')}${isk('is-cip')}</span>${Array.from({length: n}, (_, i) => isk(`is-satir${i % 3 === 2 ? ' is-kisa' : ''}`)).join('')}</div></div>`;
    if (tur === 'profil') return `<div class="gm-isk-profil" aria-busy="true" inert>${isk('is-kapak is-kisa-kapak')}<span class="gm-isk-avatar">${isk('is-avatar96')}</span><div class="gm-ic gm-yigin-12">${isk('is-baslik is-orta')}${isk('is-satir is-orta is-kisa')}<span class="gm-isk-sayac">${isk('is-sayi')}${isk('is-sayi')}${isk('is-sayi')}${isk('is-sayi')}</span>${isk('is-sekme')}</div></div>`;
    const kap = tur === 'satir' ? 'gm-yigin' : tur === 'liste' ? 'gm-yigin-12' : tur === 'izgara' ? 'gm-izgara-3' : 'gm-izgara';
    return `<div class="${kap}" aria-busy="true" inert>${Array.from({length: n}, () => (ISK[tur] || ISK.kart)()).join('')}</div>`;
  };

  // ---------- Liste ----------
  // satir: Gastro DG.satir. {ikon, sol, gorsel, baslik, baslikHtml, alt, ek, ozet, deger, sag, ok, git, veri, duz, yikici, sinif}
  // Diet ekleri: ek = metin sütununda alt satırın altına HTML (durum rozeti; sağda yer kaplayıp başlığı daraltmaz), ozet = alt en çok 2 satır.
  GM.satir = (o = {}) => {
    const sol = o.sol || (o.gorsel !== undefined ? GM.gorsel({src: o.gorsel, ad: o.baslik, ton: o.gorselTon}) : o.avatar ? GM.avatar(o.avatar) : o.ikon ? `<span class="gm-satir-ikon">${ik(o.ikon)}</span>` : '');
    const tik = !o.duz && (o.git || o.yerine || o.geri || o.veri || o.attrs);
    const ic = `${sol}<span class="gm-satir-metin"><span>${o.baslikHtml || esc(o.baslik)}</span>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}${o.ek || ''}</span>${o.deger != null ? `<b class="gm-satir-deger">${esc(o.deger)}</b>` : ''}${o.sag || ''}${(o.ok ?? !!tik) ? ik('satirOk') : ''}`;
    const c = liste('gm-satir', o.yikici && 'is-yikici', o.ozet && 'is-ozet', o.sinif);
    return tik ? `<button class="${c}" type="button"${at(o)}>${ic}</button>` : `<div class="${c}"${o.duz ? at({...o, git: undefined, veri: undefined}) : ''}>${ic}</div>`;
  };
  // Eylemli satır kabı: satır + sonda ayrı ikon düğmeleri (son aramalar).
  GM.satirKap = (satir, dugmeler = '') => `<div class="gm-satir-kap">${typeof satir === 'string' ? satir : GM.satir(satir)}${dugmeler}</div>`;
  GM.satirlar = (ogeler, o = {}) => `<div class="${liste('gm-satirlar', o.sinif)}">${ogeler.map(x => (typeof x === 'string' ? x : GM.satir(x))).join('')}</div>`;
  // Gastro DG.parcali. ogeler [{ikon, baslik, alt, git, veri, attrs, ana, yikici, bilgi, rozet}], {aria, kutu:'yatay'|'izgara'}
  GM.parcali = (ogeler, o = {}) => `<ul class="${liste('gm-parcali', o.kutu && `is-${o.kutu}`)}"${o.aria ? ` aria-label="${esc(o.aria)}"` : ''}>${ogeler.map(x => { const ic2 = `${x.rozet ? `<span class="gm-rozet gm-parcali-rozet">${esc(x.rozet)}</span>` : ''}${x.avatar ? GM.avatar({...x.avatar, boyut: 56}) : `<span class="gm-parcali-ikon" aria-hidden="true">${ik(x.ikon || 'satirOk')}</span>`}<span class="gm-parcali-metin"><b>${esc(x.baslik)}</b>${x.alt && !o.kutu ? `<small>${esc(x.alt)}</small>` : ''}</span>${x.bilgi ? '' : ik('satirOk', 'gm-parcali-ok')}`, c = liste('gm-parcali-oge', x.ana && 'is-ana', x.yikici && 'is-yikici', x.bilgi && 'is-bilgi'); return `<li>${x.bilgi ? `<div class="${c}">${ic2}</div>` : `<button class="${c}" type="button"${x.pasif ? ' aria-disabled="true"' : ''}${at(x)}>${ic2}</button>`}</li>`; }).join('')}</ul>`;
  // Bölüm başlığı: Gastro DG.bas (.gm-head). Önünde ikon yok.
  // Alt sayfa grupları (Gastro ortak/sayfalar/ayarlar.css .ay-gruplar, Flutter SettingsGroups): tek zemin, başlık + kartsız ince ayraçlı satırlar, grup arası 24.
  // gruplar: [{baslik, eylem, satirlar:[GM.satir seçenekleri | html], html}] · o.bas: grupların üstüne (profil kartı, açıklama)
  GM.gruplar = (gruplar, o = {}) => `<div class="gm-ic gm-gruplar">${o.bas || ''}${gruplar.filter(Boolean).map(g => (typeof g === 'string' ? g : `<section class="gm-grup">${g.baslik ? GM.bas(g.baslik, g.eylem) : ''}${g.satirlar ? GM.satirlar(g.satirlar) : ''}${g.html || ''}</section>`)).join('')}</div>`;
  GM.bas = (baslik, eylem) => `<div class="gm-head"><h2>${esc(baslik)}</h2>${eylem?.html ?? (eylem ? GM.link({metin: eylem.metin || 'Tümü', git: eylem.git, aria: `${baslik} tümü`}) : '')}</div>`;
  // Bölüm: Gastro .gm-bolum (padding 32 gutter). {baslik, eylem, git, html, gri, ic:false kabuksuz, id}
  GM.bolum = (o = {}) => `<section class="${liste(o.ic !== false && 'gm-bolum', o.gri && 'is-gri', o.sinif)}"${at({id: o.id})}>${o.baslik ? GM.bas(o.baslik, o.eylem ? (typeof o.eylem === 'string' ? {metin: o.eylem, git: o.git} : o.eylem) : null) : ''}${o.html || ''}</section>`;
  GM.yatay = (ogeler, o = {}) => `<div class="${liste('gm-serit', o.kart && 'is-kart', o.sinif)}">${ogeler.join('')}</div>`;
  GM.ikiliSerit = (ogeler, etiket = 'Liste') => `<section class="gm-pairs" aria-roledescription="carousel" aria-label="${esc(etiket)}"><div class="gm-pairs__track" tabindex="0">${ogeler.map(h => `<div class="gm-pairs__item">${h}</div>`).join('')}</div></section>`;
  // Sayaç bandı: Gastro .gm-istatistik. [{deger, etiket}], {yalin}
  GM.stat = (ogeler, o = {}) => `<dl class="${liste('gm-istatistik', o.yalin && 'is-yalin', o.sinif)}" data-sutun="${ogeler.length}">${ogeler.map(x => `<div><dt>${esc(x.etiket)}</dt><dd>${esc(x.deger)}${x.birim ? ` ${esc(x.birim)}` : ''}</dd></div>`).join('')}</dl>`;
  // Foto üstü sayaç şeridi: Gastro .gm-stats. [{deger, etiket}]
  GM.stats = l => `<p class="gm-stats${l.length === 1 ? ' is-tek' : ''}">${l.map(x => `<span><b>${esc(x.deger)}</b> ${esc(x.etiket)}</span>`).join('<span class="gm-stats-ayrac" aria-hidden="true"></span>')}</p>`;
  // Üçlü özet: Gastro .gm-ozet. [{ikon, etiket, deger, birim}]
  GM.ozet = l => `<div class="gm-ozet">${l.map(x => `<div><small>${x.ikon ? ik(x.ikon) : ''} ${esc(x.etiket)}</small><b class="gm-t-stat">${esc(x.deger)}</b>${x.birim ? `<small>${esc(x.birim)}</small>` : ''}</div>`).join('')}</div>`;
  // Akordiyon: tek açık. [{baslik, alt, ikon, icerik}], {acik}. Akordeon (details): GM.ako
  GM.akordiyon = (bolumler, o = {}) => { const ad = o.ad || `ak${Math.random().toString(36).slice(2, 6)}`, acik = o.acik ?? 0, basIc = b => `<span class="gm-bolum-ikon" aria-hidden="true">${ik(b.ikon || 'layer-group')}</span><span class="gm-bolum-metin"><b>${esc(b.baslik)}</b>${b.alt ? `<small>${esc(b.alt)}</small>` : ''}</span><span class="gm-bolum-sag">${b.sag || ''}${ik('ac')}</span>`; return `<div class="gm-akordiyon" data-akordiyon>${bolumler.map((b, i) => { const on = i === acik; return `<section class="gm-ak-bolum${on ? ' is-acik' : ''}"><h3 class="gm-ak-h"><button type="button" class="gm-bolum-bas" id="${ad}-b${i}" aria-expanded="${on}" aria-controls="${ad}-g${i}">${basIc(b)}</button></h3><div class="gm-ak-panel" id="${ad}-g${i}" role="region" aria-labelledby="${ad}-b${i}"${on ? '' : ' inert'}><div class="gm-ak-ic">${b.icerik || ''}</div></div></section>`; }).join('')}</div>`; };
  GM.ako = (o = {}) => `<div class="gm-akordeon"><details${o.acik ? ' open' : ''}><summary><span>${esc(o.baslik)}</span>${ik('ac')}</summary><div class="gm-ak-govde">${o.html || ''}</div></details></div>`;

  // ---------- Ekran kabuğu ----------
  // Kubbe (liste-v2): banner 320 + sayaç + panel. Detay (detay-v2): perde:'kart', rol:'display', etiket. {gorsel, baslik, alt, etiket, stat, html, perde, rol}
  GM.kubbe = (o = {}) => { const kart = o.perde === 'kart'; return `<section class="${liste('gm-banner', kart && 'is-kart gm-veil-bottom', o.rol === 'display' && 'is-detay')}"${kart ? '' : ' data-c="kubbe"'}><div class="gm-banner-foto"${bg(o.gorsel)}></div>${kart ? '<span class="gm-banner-ust" aria-hidden="true"></span><span class="gm-banner-golge" aria-hidden="true"></span>' : ''}<div class="gm-banner-metin"${kart ? ' data-gm-veil-from' : ''}>${o.etiket ? `<span class="gm-t-label">${esc(o.etiket)}</span>` : ''}<h1 class="gm-t-${o.rol || 'page'}">${esc(o.baslik)}</h1>${o.alt ? `<p>${esc(o.alt)}</p>` : ''}${o.stat ? GM.stats(o.stat) : ''}</div></section><div class="gm-panel${o.arac ? ' gm-liste-panel' : ''}">${o.arac || ''}${o.arac ? `<div class="gm-liste-icerik">${o.html || ''}</div>` : o.html || ''}</div>`; };
  const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  // Gastro kubbeBoya: liste-v2 paintBanner eğrisi (49 durak).
  GM.kubbeBoya = banner => {
    const title = banner?.querySelector('h1'); if (!title || !title.offsetParent) return;
    const px = n => TK.space[n], h = banner.offsetHeight, textTop = title.getBoundingClientRect().top - banner.getBoundingClientRect().top;
    const at_ = Math.max(0, textTop - px(24)), start = Math.max(0, at_ - px(48) * 2), full = .8, end = .9;
    const lower = y => (y <= at_ ? full * smooth((y - start) / Math.max(1, at_ - start)) : full + (end - full) * smooth((y - at_) / Math.max(1, h - at_)));
    const H = TK.size.header, upper = y => .76 * (1 - smooth((y - H) / (px(48) * 2))), a = y => 1 - (1 - upper(y)) * (1 - lower(y));
    banner.style.setProperty('--gm-veil', `linear-gradient(180deg,${Array.from({length: 49}, (_, i) => `color-mix(in srgb,var(--gm-overlay) ${(a(h * i / 48) * 100).toFixed(2)}%,transparent) ${(i * 100 / 48).toFixed(3)}%`).join(',')})`);
  };
  // Gülücük kapak (Gastro DG.gulucuk): hero; {gorsel, icerik|html, rozet, red, baslik, alt, etiket, kisa}
  GM.gulucuk = (o = {}) => { const metin = o.baslik ? `<div class="gm-foto-metin" data-gm-veil-from>${o.etiket ? `<span class="gm-t-label">${esc(o.etiket)}</span>` : ''}<h1 class="gm-t-${o.rol || 'display'}">${esc(o.baslik)}</h1>${o.alt ? `<p class="gm-t-meta">${esc(o.alt)}</p>` : ''}</div>` : ''; return `<div class="${liste('gm-gkap', o.rozet && 'has-rozet', o.sinif)}"><section class="gm-gulucuk gm-gkapak gm-veil-top gm-veil-bottom${o.ust ? ' is-ust' : ''}${o.perde === 'tam' ? ' is-perdeli' : ''}"${bg(o.gorsel)}><span class="gm-gkapak-golge" aria-hidden="true"></span><span class="gm-gkapak-isik" aria-hidden="true"></span>${o.icerik ?? o.html ?? ''}${metin}</section>${o.rozet ? `<span class="gm-gkapak-rozet${o.red ? ' is-red' : ''}" aria-hidden="true">${ik(o.rozet)}</span>` : ''}</div>`; };
  // Profil başı: Gastro DG.profilBas. {ad, alt, kapak, eylem, sayaclar:[{deger,etiket}]}
  GM.profilBas = (o = {}) => `<header class="gm-profil-bas"><div class="gm-profil-kapak gm-gulucuk${o.ust ? ' is-ust' : ''}"${bg(o.kapak)}></div><div class="gm-profil-kimlik">${GM.avatar({ad: o.ad, gorsel: o.gorsel, boyut: 96, sinif: o.avatarSinif})}<div class="gm-profil-ad"><h1 class="gm-t-page">${esc(o.ad)}</h1>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}${o.eylem || ''}</div></div>${o.sayaclar?.length ? `<div class="gm-ic">${GM.stat(o.sayaclar)}</div>` : ''}</header>`;
  GM.banner = (o = {}) => `<${o.git ? 'button type="button"' : 'div'} class="gm-feature gm-feature-kart"${at({git: o.git})}><div class="gm-feature__media"><span class="gm-feature__visual"><span class="gm-photo"${bg(o.gorsel)}></span></span><span class="gm-feature__veil" aria-hidden="true"></span><div class="gm-feature__info"><div class="gm-card__text">${o.etiket ? `<span class="gm-card__category">${esc(o.etiket)}</span>` : ''}<h3 class="gm-card__title">${esc(o.baslik)}</h3></div>${o.alt ? `<div class="gm-author"><span class="gm-author__name">${esc(o.alt)}</span></div>` : ''}${o.stat ? GM.stats(o.stat) : ''}</div></div></${o.git ? 'button' : 'div'}>`;
  // Alt eylem çubuğu: Gastro .gm-bar + cook-bar ikonları. {dugmeler:[btn seçenekleri|html], ikonlar:[{ikon,sayi,ad,basili,veri}], sol}
  GM.altEylem = (o = {}) => `<div class="gm-bar"><div class="gm-bar-ic">${o.sol ? `<div class="gm-bar-sol">${o.sol}</div>` : ''}${o.ikonlar ? `<div class="gm-bar-ikonlar">${o.ikonlar.map(x => `<button type="button" class="gm-bar-ikon" aria-label="${esc(x.ad || '')}"${x.basili != null ? ` aria-pressed="${!!x.basili}"` : ''}${at({git: x.git, veri: x.veri, attrs: x.attrs})}>${ik(x.ikon)}${x.sayi != null ? `<small>${esc(x.sayi)}</small>` : ''}</button>`).join('')}</div>` : ''}${(o.dugmeler || []).map(b => (typeof b === 'string' ? b : GM.btn(b))).join('')}</div></div>`;
  // Kayan alt çubuk: Gastro DG.eylemCubugu; banner geçilince belirir. eylemler: [{ikon, ad, sayi, basili (aria-pressed), git, veri, attrs}]; aria-label sayıyı da okur.
  GM.kayanBar = (o = {}) => `<div class="gm-bar gm-kayan" inert><div class="gm-bar-ic"><div class="gm-kayan-kim">${o.gorsel ? `<span class="gm-kayan-foto"${bg(o.gorsel)} aria-hidden="true"></span>` : ''}<b class="gm-kayan-baslik">${esc(o.baslik)}</b></div><div class="gm-kayan-eylem">${(o.eylemler || []).map(x => `<button type="button" class="gm-kayan-btn"${x.basili != null ? ` aria-pressed="${!!x.basili}"` : ''} aria-label="${esc(x.ad)}${x.sayi != null ? ` (${esc(x.sayi)})` : ''}"${at({...x, etiket: undefined})}>${ik(x.ikon)}${x.sayi != null ? `<small>${esc(x.sayi)}</small>` : ''}</button>`).join('')}</div></div></div>`;

  // ---------- Kartlar ----------
  GM.kart = (o = {}) => `<${o.git ? 'button type="button"' : 'div'} class="${liste('gm-kart', o.gri && 'is-gri', o.sinif)}"${at({git: o.git})}>${o.html || ''}</${o.git ? 'button' : 'div'}>`;
  // Eylem kartı: Gastro .gm-eylem (80, 44 ikon). {ikon, baslik, alt, rozet, git, veri, secili, bilgi}
  GM.eylemKart = (o = {}) => `<${o.bilgi ? 'div' : 'button type="button"'} class="${liste('gm-eylem', o.secili && 'is-secili', o.bilgi && 'is-bilgi', o.altSatir === 2 && 'is-iki-satir', o.sinif)}"${at(o)}><span class="gm-eylem-ikon" aria-hidden="true">${ik(o.ikon)}</span><span class="gm-eylem-metin"><b>${esc(o.baslik)}${o.rozet ? GM.rozet({metin: o.rozet}) : ''}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span>${o.bilgi ? '<span></span>' : ik('satirOk')}</${o.bilgi ? 'div' : 'button'}>`;
  // İçerik kartı: Gastro DG.puf (.dgu-puf) birebir: foto 4:3, altında kategori etiketi (label, büyük harf) · başlık (2 satır) · meta.
  // {gorsel, kategori, baslik, meta, metaIkon ('saat'), git}. Kategori fotoğraf üstü rozet değil (eski Diet eki .gm-puf-rozet kaldırıldı).
  GM.icerikKart = (o = {}) => `<button type="button" class="${liste('gm-puf', !o.meta && 'is-metasiz', o.sinif)}"${at(o)}>${o.gorsel ? `<span class="gm-puf-foto"${bg(o.gorsel)}></span>` : `<span class="gm-puf-foto is-yok" aria-hidden="true">${ik(o.ikon || 'image')}</span>`}<span class="gm-puf-metin">${o.kategori ? `<small>${esc(o.kategori)}</small>` : ''}<b>${esc(o.baslik)}</b>${o.meta ? `<span>${ik(o.metaIkon || 'saat')}${esc(o.meta)}</span>` : ''}</span></button>`;
  // Bildirim: Gastro .gm-bildirim; okunmamış kalın + tint kutu, nokta yok.
  GM.bildirimSatir = (b, o = {}) => `<button type="button" class="${liste('gm-bildirim', !b.okundu && 'is-okunmadi', o.sinif)}"${at({git: o.git, veri: {id: b.id}})}><span class="gm-bildirim-ikon" aria-hidden="true">${ik(b.ikon)}</span><span class="gm-bildirim-metin"><b>${esc(b.baslik)}</b><p>${esc(b.metin)}</p><small class="gm-bildirim-meta">${b.okundu ? '' : GM.durumRozet({metin: 'Yeni', ton: 'basari'})}<span>${esc([o.meta ?? b.tur_ad, b.zaman].filter(Boolean).join(' · '))}</span></small></span></button>`;
  GM.yorum = (o = {}) => `<div class="gm-yorum">${o.ad ? GM.avatar({ad: o.ad}) : ''}<div class="gm-yorum-metin">${o.ad ? `<b>${esc(o.ad)}</b>` : ''}<p>${esc(o.metin)}</p>${o.meta ? `<small>${esc(o.meta)}</small>` : ''}</div></div>`;
  // Yorum bölümü: Gastro DG.yorumBolumu. {baslik, yorumlar:[{yazar, tarih, puan, metin}], ozet:{puan, sayi, dagilim:[[yildiz,adet]]}, bos}
  const yildiz = (v, c = '') => `<span class="gm-uz-stars ${c}" aria-hidden="true">${[1, 2, 3, 4, 5].map(n => `<i class="icon fa-solid fa-star${n <= Math.round(v) ? ' on' : ''}"></i>`).join('')}</span>`;
  GM.yorumBolumu = (o = {}) => {
    const Y = o.yorumlar || [], z = o.ozet, mx = z ? Math.max(1, ...z.dagilim.map(x => x[1])) : 1;
    const oz = z?.puan ? `<div class="gm-uz-rating"><div class="gm-uz-rating-score"><b>${esc(ondalik(z.puan, 1))}</b>${yildiz(z.puan)}<small>${esc(z.sayi)} değerlendirme</small></div><ul class="gm-uz-rating-bars">${z.dagilim.map(([st, c]) => `<li><span class="gm-uz-bar-label">${st}${ik('yildiz')}</span><span class="gm-uz-bar-track"><i style="width:${c / Math.max(z.sayi, mx) * 100}%"></i></span><span class="gm-uz-bar-count">${c}</span></li>`).join('')}</ul></div>` : '';
    const liste_ = Y.length ? `<div class="gm-yrm-liste">${Y.map(y => `<article class="review"><div class="review-head"><span class="avatar" aria-hidden="true">${esc(String(y.yazar || '?').slice(0, 1).toLocaleUpperCase('tr'))}</span><div class="gm-uz-review-who"><span class="gm-uz-review-ad"><b>${esc(y.yazar)}</b></span><span class="gm-uz-review-meta">${esc(y.tarih || '')}</span></div>${y.puan ? yildiz(y.puan, 'gm-uz-review-stars') : ''}</div><p>${esc(y.metin)}</p></article>`).join('')}</div>` : `<div class="review-empty"><span class="gm-uz-box-icon">${ik('comment-dots')}</span><p>${esc(o.bos || 'Henüz yorum yapılmamış. İlk yorumu sen yaz.')}</p></div>`;
    return `<section class="gm-yrm"><div class="gm-yrm-bas"><span class="gm-t-label">${ik('comments')} Yorumlar</span><h2 class="gm-t-section">${esc(o.baslik || 'Yorumlar')} (${sayi(Y.length)})</h2></div>${oz}${liste_}</section>`;
  };
  // Paylaş sheet'i: Gastro DG.paylas birebir — 3 sütun marka ızgarası + tek satır bağlantı alanı ve "Kopyala" (+ cihaz paylaşımı varsa "Diğer uygulamalar").
  // {baslik, url, alt, kopyala (varsayılan true; false kopya satırını gizler)}. Kopyalama başarısızsa alan seçilir, kullanıcı elle kopyalar.
  GM.paylas = (o = {}) => {
    const url = o.url || location.href, baslik = o.baslik || document.title, u = encodeURIComponent(url), t = encodeURIComponent(baslik), fab = n => `<i class="icon fa-brands fa-${n}" aria-hidden="true"></i>`;
    const K = [['Facebook', fab('facebook-f'), 'facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`], ['X', fab('x-twitter'), 'x', `https://twitter.com/intent/tweet?url=${u}&text=${t}`], ['WhatsApp', fab('whatsapp'), 'whatsapp', `https://wa.me/?text=${t}%20${u}`], ['Telegram', fab('telegram'), 'telegram', `https://t.me/share/url?url=${u}&text=${t}`], ['Pinterest', fab('pinterest-p'), 'pinterest', `https://pinterest.com/pin/create/button/?url=${u}&description=${t}`], ['E-posta', ik('envelope'), 'eposta', `mailto:?subject=${t}&body=${u}`]];
    const kopya = o.kopyala === false ? '' : `<div class="gm-paylas-kopya"><label class="gm-girdi">${ik('link')}<input type="text" readonly value="${esc(url)}" aria-label="Paylaşım bağlantısı"></label>${GM.btn({metin: 'Kopyala', tur: 'secondary', ikon: 'copy', attrs: 'data-kopyala aria-label="Bağlantıyı kopyala"'})}</div>`;
    const yerel = navigator.share ? `<div class="gm-paylas-yerel">${GM.btn({metin: 'Diğer uygulamalar', tur: 'text', ikon: 'share-from-square', attrs: 'data-yerel'})}</div>` : '';
    return GM.sheet({baslik: 'Paylaş', html: `${o.alt ? `<p class="gm-paylas-ne">${esc(o.alt)}</p>` : ''}<ul class="gm-paylas-izgara" aria-label="Paylaşım kanalları">${K.map(([a, i, m, h]) => `<li><a class="gm-paylas-oge" data-marka="${m}" href="${h}" target="_blank" rel="noopener" aria-label="${a} ile paylaş"><span class="gm-paylas-ikon">${i}</span><span class="gm-paylas-ad">${a}</span></a></li>`).join('')}</ul>${kopya}${yerel}`, sonra: d => {
      const tik = e => {
        const k = e.target.closest('[data-kopyala]');
        if (k) {
          e.preventDefault();
          let is; try { is = navigator.clipboard.writeText(url); } catch { is = Promise.reject(); }
          Promise.resolve(is).then(() => { k.innerHTML = `${ik('onay')}<span>Kopyalandı</span>`; k.dataset.kopyalandi = ''; GM.toast('Bağlantı kopyalandı', {ikon: 'link'}); }, () => { const i = d.querySelector('.gm-paylas-kopya input'); i.focus(); i.select(); GM.toast('Bağlantıyı seçip kopyalayabilirsin'); });
        } else if (e.target.closest('[data-yerel]')) { e.preventDefault(); navigator.share({title: baslik, url}).catch(() => {}); d.kapat(); } else if (e.target.closest('.gm-paylas-oge')) setTimeout(() => d.kapat(), 0);
      };
      d.addEventListener('click', tik);
      return () => d.removeEventListener('click', tik);
    }});
  };
  // İçerik bloğu: Gastro DG.icerikBlok (docs/51 DgContentBlock) — numara + başlık + bölüm paylaş; altında görsel (4:3, figcaption) ve metin (.gm-metin), ya da video.
  // {no, baslik, html, gorsel, aciklama, video:{poster}, id, paylasUrl}. Paylaş düğmesi (data-blok-paylas) aşağıdaki genel dinleyiciyle GM.paylas açar.
  GM.icerikBlok = (o = {}) => `<section class="gm-blok"${o.id ? ` id="${esc(o.id)}"` : ''}><header class="gm-blok-bas">${o.no != null ? `<span class="gm-blok-no" aria-hidden="true">${esc(o.no)}</span>` : ''}<h2>${esc(o.baslik)}</h2><button type="button" class="gm-ibtn" data-blok-paylas="${esc(o.paylasUrl || (location.href.split('#')[0] + (o.id ? `#${o.id}` : '')))}" data-blok-baslik="${esc(o.baslik)}" aria-label="“${esc(o.baslik)}” bölümünü paylaş">${ik('paylas')}</button></header>${o.gorsel ? `<figure class="gm-blok-gorsel"><span class="gm-blok-foto" role="img" aria-label="${esc(o.aciklama || o.baslik)}"${bg(o.gorsel)}></span>${o.aciklama ? `<figcaption>${esc(o.aciklama)}</figcaption>` : ''}</figure>` : ''}${o.html ? `<div class="gm-metin">${o.html}</div>` : ''}${o.video ? `<div class="gm-oynatici gm-blok-video"${bg(o.video.poster)}><button class="gm-oynatici-dugme" type="button" aria-label="Videoyu oynat">${ik('play')}</button></div>` : ''}</section>`;
  // Gastro dg-ui genel dinleyicisi: bölüm paylaş. Ekran kendi dinleyicisiyle zaten bir paylaş sheet'i açtıysa ikinciyi açmaz.
  document.addEventListener('click', e => {
    const b = e.target.closest?.('[data-blok-paylas]');
    if (!b || document.querySelector('.gm-sheet-kap .gm-paylas-izgara')) return;
    GM.paylas({baslik: b.dataset.blokBaslik, url: b.dataset.blokPaylas, alt: b.dataset.blokBaslik});
  });

  // ---------- Seçim ----------
  // Gastro DG.secimKart. {k|deger|id, ad, alt, ikon, olcek (1-5), gorsel, secili, tek}
  GM.secimKart = (o = {}) => { const on = o.ikon ? `<span class="gm-secim-on gm-secim-ikon" aria-hidden="true">${ik(o.ikon)}</span>` : o.olcek ? `<span class="gm-secim-on gm-secim-olcek" aria-hidden="true">${[1, 2, 3, 4, 5].map(x => `<i class="${x <= o.olcek ? 'is-on' : ''}"></i>`).join('')}</span>` : ''; const k = o.k ?? o.deger ?? o.id; return `<button type="button" class="${liste('gm-secim-kart', o.gorsel ? 'is-foto' : !on && 'is-metin')}" data-k="${esc(k)}" ${o.tek ? `role="radio" aria-checked="${!!o.secili}"` : `aria-pressed="${!!o.secili}"`}>${o.gorsel ? `<span class="gm-secim-foto"${bg(o.gorsel)} aria-hidden="true"></span>` : on}<span class="gm-secim-metin"><b>${esc(o.ad)}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span><span class="gm-secim-kutu" aria-hidden="true"><span class="choice-mark">${ik('onay')}</span></span></button>`; };
  // Izgara: {ad, ogeler, secili, coklu, duzen:'tek'|'iki'|'uc'|'orta'}
  GM.secimler = (o = {}) => { const s = [].concat(o.secili ?? []); return `<div class="${liste('gm-secim-izgara', ...[].concat(o.duzen ?? 'tek').flatMap(d => String(d).split('-')).map(d => ({tek: 'is-tek', uc: 'is-uc', orta: 'is-orta'}[d])), o.sinif)}" role="${o.coklu ? 'group' : 'radiogroup'}" data-ad="${esc(o.ad || '')}">${o.ogeler.map(x => { const k = x.k ?? x.deger ?? x.id; return GM.secimKart({...x, k, tek: !o.coklu, secili: s.includes(k)}); }).join('')}</div>`; };
  // Onboarding adım şablonu: .gm-adim üstte, geri aynı satırda; altta .gm-bar.
  GM.onbSablon = (o = {}) => `<div class="gm-onb"><div class="gm-onb-ust">${o.geri === false ? '<span class="gm-onb-bos"></span>' : `<button class="gm-ibtn" type="button" data-geri aria-label="Geri">${ik('geri')}</button>`}${GM.adimGosterge({adim: o.adim, toplam: o.toplam})}${o.atla ? GM.btn({metin: o.atla.metin || 'Atla', tur: 'text', ...o.atla}) : '<span class="gm-onb-bos"></span>'}</div><div class="gm-onb-govde gm-yigin">${GM.metinBlok({baslik: o.baslik, metin: o.alt, rol: 'page', h: 1})}${o.neden ? GM.btn({metin: o.neden, tur: 'text', veri: {eylem: 'neden'}, sinif: 'gm-onb-neden'}) : ''}<div class="gm-onb-icerik">${o.html || ''}</div></div>${o.devam === false ? '' : `<div class="gm-onb-alt">${GM.btn({metin: 'Devam', tam: true, ...(o.devam || {})})}${o.altMetin ? `<small class="gm-yardim">${esc(o.altMetin)}</small>` : ''}</div>`}</div>`;
  // ---------- Diet kartları ----------
  // Program kartı: GMCard ailesi. tur card (dikey 4:5) | row (satır) | tile (foto üstü) | feature (öne çıkan) | aktif (eylem kartı + ilerleme)
  GM.programKart = (p, o = {}) => {
    const tur = o.tur === 'liste' ? 'row' : o.tur === 'rail' ? 'tile' : o.tur || 'card';
    const git = o.git ?? `#/program/${p.slug}`;
    if (tur === 'aktif') return `<button type="button" class="gm-eylem gm-eylem-program" data-git="${esc(git)}"><span class="gm-kayan-foto"${bg(p.kapak)} aria-hidden="true"></span><span class="gm-eylem-metin"><b>${esc(p.ad)}</b>${GM.ilerleme({n: o.gun, hedef: o.toplam, etiket: `${o.gun}. gün`, deger: `${o.toplam} gün`})}</span>${ik('satirOk')}</button>`;
    return GMCard.kart({baslik: p.ad, kategori: p.kategori, gorsel: p.kapak, sureGun: p.sureGun, ogun: p.gunlukOgun, alt: [p.kcalMin ? `${sayi(p.kcalMin)}-${sayi(p.kcalMax)} kcal` : '', p.zorluk].filter(Boolean).join(' · '), git, kayitli: o.kayitli, id: p.slug}, tur);
  };
  // Diyetisyen kartı (Beyar revize, 10 Kasım: şef kartı kalıbı reddedildi; web vitrin kartı onaylı). Dört tür:
  //   liste (varsayılan liste görünümü; 'tam' eş anlamlı): kompakt pazar yeri kartı — avatar 56 dolu ton · ad + "unvan · N yıl" · sağda fiyat/seans;
  //     uzmanlık çipleri (en çok 2 + "+N"); ikonlu meta (şehir · görüşme · uygunluk rozeti); gm-ikili eşit iki düğme. Kart dokununca profile gider.
  //   kart (ızgara): web vitrin kartı — tonlu kapak bandı + uzmanlık ikonu, banda binen avatar 64, ad, unvan, 1 çip, "şehir · fiyat", "Profili gör".
  //   satir: yazar satırı (avatar 40).
  // {git (null: kart bağlantısız), eylem, ikincil, uygun:{metin, ton}, fiyat (TL; varsayılan tek seans), not (meta satırına ek metin)}. eylem.secili → tonal + onay hali.
  // Fotoğraf verisi yok (webde de yok): web KART_TONLARI fikri, dolu ton zemin + beyaz harf; ton kişinin veri sırasından (GM.uzmanTon).
  const UZ_IKON = {'Kilo Yönetimi': 'weight-scale', 'Sporcu Beslenmesi': 'dumbbell', 'Gebelik & Emzirme': 'person-pregnant', 'Geriatri Beslenmesi': 'person-cane', 'Hormonal Denge & PCOS': 'venus', 'Bağırsak Sağlığı': 'seedling', 'Çocuk & Ergen Beslenmesi': 'child', 'Klinik / Hastalık Beslenmesi': 'stethoscope', 'Vejetaryen & Vegan': 'leaf', 'İnsülin Direnci & Diyabet': 'droplet', 'Yeme Davranışı': 'brain', 'Onkoloji Beslenmesi': 'ribbon'};
  const uzTon = d => { const i = (window.GMV?.diyetisyenler || []).findIndex(x => x.slug === d.slug); return `gm-uz-ton-${(i < 0 ? [...String(d.slug || d.ad || '')].reduce((n, c) => n + c.charCodeAt(0), 0) : i) % 3}`; };
  GM.uzmanTon = uzTon;
  const uzHarf = d => esc(String(d.harf || d.ad || '?').trim().slice(0, 1).toLocaleUpperCase('tr'));
  const uzFiyat = (d, o) => o.fiyat ?? d.paketler?.find(p => p.id === 'tek')?.fiyat;
  const uzGorusme = d => { const t = d.gorusmeTurleri || []; return t.length > 1 ? 'Online, yüz yüze' : t[0] || d.gorusme || ''; };
  const uzCipler = (l, n) => `${l.slice(0, n).map(x => `<span class="gm-uzk-cip">${esc(x)}</span>`).join('')}${l.length > n ? `<span class="gm-uzk-cip">+${l.length - n}</span>` : ''}`;
  const uzLink = (d, git, ic) => (git ? `<button type="button" class="gm-uzk-link" data-git="${esc(git)}" aria-label="${esc(d.ad)} profilini gör">${ic}</button>` : `<span class="gm-uzk-link">${ic}</span>`);
  GM.diyetisyenKart = (d, o = {}) => {
    const tur = o.tur === 'tam' ? 'liste' : o.tur || 'kart', git = o.git === null ? null : o.git ?? `#/uzman/profil/${d.slug}`, e = o.eylem, fiyat = uzFiyat(d, o);
    if (tur === 'satir') return `<div class="gm-yazar"><button type="button" class="gm-yazar-kim"${git ? ` data-git="${esc(git)}"` : ''} aria-label="${esc(d.ad)} profili">${GM.avatar({ad: d.harf || d.ad, sinif: uzTon(d)})}<span class="gm-yazar-metin"><span class="gm-yazar-ad"><b>${esc(d.ad)}</b>${d.dogrulandi ? GM.rozet({metin: 'Onaylı', ikon: 'dogrulandi'}) : ''}</span><small>${esc([d.unvan, d.sehir].filter(Boolean).join(' · '))}</small></span></button>${e ? GM.btn({tur: 'tonal', boyut: 'sm', sinif: 'gm-yazar-takip', ...e}) : ''}</div>`;
    if (tur === 'liste') {
      const ad = `<b class="gm-uzk-ad">${esc(d.ad)}</b>${d.dogrulandi ? `<span class="gm-uzk-onay" role="img" aria-label="Doğrulandı">${ik('dogrulandi')}</span>` : ''}`;
      const meta = [d.sehir && `<span>${ik('location-dot')}${esc(d.sehir)}</span>`, uzGorusme(d) && `<span>${ik('video')}${esc(uzGorusme(d))}</span>`, o.not && `<span>${esc(o.not)}</span>`].filter(Boolean).join('');
      const birincil = e ? GM.btn({boyut: 'sm', ...(e.secili ? {tur: 'tonal', ikon: 'onay'} : {}), ...e, secili: undefined}) : '';
      const ikincil = o.ikincil ? GM.btn({tur: 'secondary', boyut: 'sm', ...o.ikincil}) : '';
      return `<article class="${liste('gm-uzk', git && 'is-link')}" aria-label="${esc(d.ad)}"><div class="gm-uzk-ust">${GM.avatar({ad: d.harf || d.ad, boyut: 56, sinif: uzTon(d)})}<div class="gm-uzk-kim">${uzLink(d, git, ad)}<small>${esc([d.unvan, d.deneyimYil && `${d.deneyimYil} yıl`].filter(Boolean).join(' · '))}</small></div>${fiyat != null ? `<div class="gm-uzk-fiyat"><b>${esc(GM.paraTL(fiyat))}</b><small>seans</small></div>` : ''}</div>${d.uzmanliklar?.length ? `<div class="gm-uzk-cipler">${uzCipler(d.uzmanliklar, 2)}</div>` : ''}<div class="gm-uzk-meta">${meta}${o.uygun ? GM.durumRozet({metin: o.uygun.metin, ton: o.uygun.ton || 'basari', ikon: o.uygun.ikon || 'takvim'}) : ''}</div>${birincil || ikincil ? `<div class="gm-ikili">${ikincil}${birincil}</div>` : ''}</article>`;
    }
    // kart (ızgara): web vitrin kartı
    const metaK = [d.sehir, fiyat != null && GM.paraTL(fiyat)].filter(Boolean).join(' · ');
    return `<article class="${liste('gm-uzk-kart', uzTon(d), git && 'is-link')}" aria-label="${esc(d.ad)}"><span class="gm-uzk-bant" aria-hidden="true">${ik(UZ_IKON[d.uzmanliklar?.[0]] || 'leaf')}</span><span class="gm-uzk-kart-avatar" aria-hidden="true">${uzHarf(d)}</span>${uzLink(d, git, `<b class="gm-uzk-ad">${esc(d.kisaAd || d.ad)}</b>`)}${d.unvan ? `<small class="gm-uzk-unvan">${esc(d.unvan)}</small>` : ''}${d.uzmanliklar?.length ? `<div class="gm-uzk-cipler">${uzCipler(d.uzmanliklar, 1)}</div>` : ''}${metaK ? `<small class="gm-uzk-kart-meta">${esc(metaK)}</small>` : ''}${e?.secili ? GM.durumRozet({metin: e.metin, ton: 'basari', ikon: 'onay'}) : ''}<span class="gm-uzk-git" aria-hidden="true">Profili gör${ik('arrow-right')}</span></article>`;
  };
  // Sonsuz liste ve meşgul düğme: Gastro DG.sonsuz, DG.mesgul.
  GM.sonsuz = (kap, yukle, {bas = 2} = {}) => {
    let n = bas, bekle = false; const son = document.createElement('div'); son.className = 'gm-sonsuz-son'; kap.after(son);
    const g = document.createElement('div'); g.className = 'gm-alt-yukleniyor'; g.setAttribute('role', 'status'); g.setAttribute('aria-label', 'Yükleniyor'); g.innerHTML = '<i></i><i></i><i></i>'; g.hidden = true; son.before(g);
    const io = new IntersectionObserver(es => { if (!es[0].isIntersecting || bekle) return; bekle = true; g.hidden = false; setTimeout(() => { const h = yukle(n++); g.hidden = true; bekle = false; if (!h) { io.disconnect(); son.remove(); g.remove(); return; } kap.insertAdjacentHTML('beforeend', h); }, GM.azHareket() ? 0 : TK.motion.reveal); }, {root: kap.closest('.gm-kaydir'), rootMargin: '200px'});
    io.observe(son); return io;
  };
  GM.mesgul = (b, is = TK.motion.reveal * 2) => { if (!b) return Promise.resolve(); b.setAttribute('aria-busy', 'true'); b.disabled = true; const bit = () => { b.removeAttribute('aria-busy'); b.disabled = false; }; return (is && is.then ? is : new Promise(r => setTimeout(r, is))).then(v => { bit(); return v; }); };
})();
