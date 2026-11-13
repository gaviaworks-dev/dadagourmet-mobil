/* Gastro'da karşılığı olmayan Diet bileşenleri: en yakın Gastro ailesinden türer (tasks/gastro-esleme.md §4). Katalog: kanon/README.md */
(() => {
  const GM = window.GM, {esc, ik, at, vurgu, sayi, ondalik, kisit, sure} = GM;
  const TK = GM.TK, M = TK.motion;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const yuvarla = n => +n.toFixed(2);

  const yayYol = (cx, cy, r, a0, a1) => { const p = a => [cx + r * Math.cos(a), cy + r * Math.sin(a)].map(yuvarla); const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`; };
  const rad = d => d * Math.PI / 180;

  // ---------- Metabolik halka: 270 derece açık yay; planlı öğün silik yay, öğünler kesit olarak işlenir ----------
  // {hedef, alinan, planli, kesitler:[kcal...], boyut:'lg'|'md', etiket, yan:[{deger,etiket},{...}], cumle, foto (gülücük içinde), git}
  GM.halka = (o = {}) => {
    const {hedef = 1, alinan = 0, planli = 0, boyut = 'lg'} = o;
    const asim = alinan > hedef, kalan = Math.abs(hedef - alinan);
    const oran = kisit(alinan / hedef, 0, 1) * 100, plan = asim ? 0 : kisit(planli / hedef, 0, 1 - oran / 100) * 100;
    const b = boyut === 'lg' ? TK.size.ringLg : TK.size.ringMd, st = boyut === 'lg' ? TK.size.ringStroke : TK.size.ringStrokeMd, c = b / 2, r = b / 2 - st / 2, A0 = 135, ACI = 270, yol = yayYol(c, c, r, rad(A0), rad(A0 + ACI));
    let toplam = 0;
    const kesit = asim ? '' : (o.kesitler || []).slice(0, -1).map(k => { toplam += k; const a = rad(A0 + ACI * toplam / hedef), x = Math.cos(a), y = Math.sin(a); return `<line class="gm-halka-kesit" x1="${yuvarla(c + (r - st / 2 - 2) * x)}" y1="${yuvarla(c + (r - st / 2 - 2) * y)}" x2="${yuvarla(c + (r + st / 2 + 2) * x)}" y2="${yuvarla(c + (r + st / 2 + 2) * y)}"/>`; }).join('');
    const yayEl = (sinif, u, gecik = 0) => `<path class="${sinif}" d="${yol}" pathLength="100" stroke-dasharray="${yuvarla(u)} 100" data-c="yay" data-uzun="${yuvarla(u)}" data-gecik="${gecik}"/>`;
    const halka = `<div class="${liste('gm-halka', `gm-halka--${boyut}`, asim && 'is-ustunde', o.foto && 'is-foto', o.sinif)}" role="img" aria-label="${esc(`Hedef ${sayi(hedef)} kcal, alınan ${sayi(alinan)} kcal, ${asim ? 'hedefin üstünde' : 'kalan'} ${sayi(kalan)} kcal`)}"${at({git: o.git})}>
      <svg viewBox="0 0 ${b} ${b}" aria-hidden="true"><path class="gm-halka-iz" d="${yol}"/>${plan > .5 ? yayEl('gm-halka-plan', oran + plan, M.reveal) : ''}${oran > 0 ? yayEl('gm-halka-dolu', oran) : ''}${kesit}</svg>
      <div class="gm-halka-orta"><small>${esc(o.etiket ?? (asim ? 'Hedefin üstünde' : 'Kalan'))}</small><b class="${boyut === 'lg' ? 'gm-t-numeral-xl' : 'gm-t-numeral-lg'}">${asim ? '+' : ''}<span data-c="say" data-hedef="${Math.round(kalan)}">${sayi(kalan)}</span></b></div>
      <small class="gm-halka-hedef">${esc(o.alt ?? `/ ${sayi(hedef)} kcal`)}</small>
    </div>`;
    const yan = x => `<div class="gm-halka-yan"><b class="gm-t-numeral-md">${esc(x.deger)}</b><small>${esc(x.etiket)}</small></div>`;
    const govde = o.yan ? `<div class="gm-halka-kap${o.foto ? ' is-foto' : ''}">${yan(o.yan[0])}${halka}${yan(o.yan[1])}</div>` : halka;
    return o.cumle ? `<div class="gm-yigin-12">${govde}${GM.p(o.cumle, {orta: true, ton: 'ikincil'})}</div>` : govde;
  };
  // Mini halka: öğün satırı (sm, 44) ve hafta şeridi (xs, 24). İçinde ikon olabilir. {oran, ikon, boyut, ton, silik}
  GM.halkaMini = (o = {}) => {
    const u = yuvarla(kisit(o.oran || 0, 0, 1) * 100), bb = o.boyut || 'sm', b = bb === 'xs' ? TK.size.ringXs : TK.size.ringMini, st = bb === 'xs' ? TK.size.ringXsStroke : TK.size.ringMiniStroke, c = b / 2, r = b / 2 - st / 2;
    return `<span class="${liste('gm-mini', `gm-mini--${bb}`, `is-${o.ton || 'primary'}`, o.silik && 'is-silik', o.foto && 'has-foto', o.sinif)}" aria-hidden="true">${o.foto ? `<span class="gm-mini-foto" style="background-image:url('${esc(o.foto)}')"></span>` : ''}<svg viewBox="0 0 ${b} ${b}"><circle class="gm-mini-iz" cx="${c}" cy="${c}" r="${r}"/>${u > 0 ? `<circle class="gm-mini-dolu" cx="${c}" cy="${c}" r="${r}" pathLength="100" stroke-dasharray="${u} 100" data-c="yay" data-uzun="${u}" transform="rotate(-90 ${c} ${c})"/>` : ''}</svg>${o.ikon ? ik(o.ikon) : ''}</span>`;
  };

  // ---------- Makro çubukları ----------
  const MAKRO = [['P', 'Protein', 'protein'], ['K', 'Karbonhidrat', 'karb'], ['Y', 'Yağ', 'yag'], ['Lif', 'Lif', 'lif']];
  // makro: {P:{alinan,hedef},...}; tur: dort (tek kart, 4 sütun) | liste (tam genişlik satır, sağda yüzde; sheet için)
  GM.makroCubuk = (makro, o = {}) => `<div class="${liste('gm-makro', `is-${o.tur || 'dort'}`, o.kart === false && 'is-yalin', o.sinif)}"${at({git: o.git, veri: o.veri})}>${MAKRO.map(([k, ad, ton]) => {
    const m = makro[k] || {alinan: 0, hedef: 1}, oran = kisit(m.alinan / m.hedef, 0, 1), ustunde = m.alinan > m.hedef;
    const yol = `<span class="gm-makro-yol" role="progressbar" aria-label="${esc(ad)}" aria-valuenow="${Math.round(m.alinan)}" aria-valuemax="${Math.round(m.hedef)}"><i data-c="bar" style="--oran:${oran.toFixed(3)}"></i></span>`;
    return `<div class="${liste('gm-makro-oge', `is-${ton}`, ustunde && 'is-ustunde')}"><span class="gm-makro-ad">${esc(o.tur === 'liste' ? ad : ad === 'Karbonhidrat' ? 'Karb.' : ad)}</span><span class="gm-makro-deger"><b>${sayi(m.alinan)}</b> / ${sayi(m.hedef)} g</span>${o.tur === 'liste' ? `<span class="gm-makro-yuzde">%${Math.round(m.alinan / m.hedef * 100)}</span>` : ''}${yol}</div>`;
  }).join('')}</div>`;

  // ---------- Oruç sayacı: tam daire, faz işaretleri halkaya oturur ----------
  // {durum:'oruc'|'pencere'|'bos'|'bitti', gecenDk, hedefSaat, rozet, fazlar, canli, altMetin, git, veri}
  // Saat:dakika orantılı rakamla (Gilroy'da sabit hücre "1"in yanında boşluk bırakıyordu), saniye küçük ve hücreli (her saniye kaymasın).
  GM.sayacHtml = sn => { const m = GM.sayacMetin(sn); return `<span class="gm-t-numeral-xl gm-oruc-ana">${esc(m.slice(0, 5))}</span><span class="gm-oruc-sn">${GM.rakamlar(m.slice(5))}</span>`; };
  // Görünüm (11 Kasım v2, oruç uygulamaları kalıbı: Zero, Simple, FastBreak): açık gri iz, marka yeşilinde halka boyunca geçişli ilerleme (oruç koyu, pencere açık yeşil),
  // ucunda kâğıt düğme, iz içinde hedefin her saati için çentik, ortada gölgeli kâğıt disk; disk içinde durum rozeti, "Geçen süre · %", saat, alt metin.
  GM.orucSayac = (o = {}) => {
    const {gecenDk = 0, hedefSaat = 16, durum = 'oruc'} = o;
    const hedefDk = hedefSaat * 60, oran = durum === 'bitti' ? 1 : durum === 'bos' ? 0 : kisit(gecenDk / hedefDk, 0, 1), r = 135, c = 148;
    const fazlar = durum === 'oruc' || durum === 'bitti' ? (o.fazlar || []).filter(f => f.baslangicSaat > 0 && f.baslangicSaat < hedefSaat) : [];
    const gecenSaat = durum === 'bitti' ? hedefSaat : gecenDk / 60;
    const isaret = fazlar.map(f => `<span class="gm-oruc-faz${gecenSaat >= f.baslangicSaat ? ' is-gecti' : ''}" style="--a:${yuvarla(f.baslangicSaat / hedefSaat * 360)}deg"><i>${ik(f.ikon)}</i></span>`).join('');
    // Saat çentikleri: izin iç kenarında, hedefin her saati için bir; geçilenler renkli.
    const centik = Array.from({length: hedefSaat}, (_, i) => { const a = rad(i / hedefSaat * 360 - 90), p = k => [c + k * Math.cos(a), c + k * Math.sin(a)].map(yuvarla); const [x1, y1] = p(112), [x2, y2] = p(i % 4 ? 116 : 118); return `<line class="${i / hedefSaat <= oran && oran > 0 ? 'is-gecti' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }).join('');
    const uzun = yuvarla(oran * 100), ton = {oruc: 'basari', pencere: 'basari', bitti: 'basari', bos: 'notr'}[durum];
    const metin = o.rozet || {oruc: 'Oruçtasın', pencere: 'Yeme penceresi açık', bitti: 'Tamamlandı', bos: 'Hazır'}[durum];
    const etiket = {oruc: `Geçen süre · %${Math.round(oran * 100)}`, pencere: `Geçen süre · %${Math.round(oran * 100)}`, bitti: 'Toplam süre', bos: 'Hedef'}[durum];
    const zaman = durum === 'bos'
      ? `<b class="gm-oruc-zaman"><span class="gm-t-numeral-xl gm-oruc-ana">${esc(hedefSaat)}</span><span class="gm-oruc-sn"> saat</span></b>`
      : `<b class="gm-oruc-zaman" ${o.canli === false || durum === 'bitti' ? '' : `data-c="sayac" data-saniye="${gecenDk * 60}"`}>${GM.sayacHtml(gecenDk * 60)}</b>`;
    const merkez = `<div class="gm-oruc-orta">${GM.durumRozet({metin, ton, ikon: {oruc: 'oruc', pencere: 'pencere', bitti: 'onay', bos: 'saat'}[durum]})}<span class="gm-oruc-etiket">${esc(etiket)}</span>${zaman}<small>${esc(o.altMetin || `Hedef ${hedefSaat} saat`)}</small></div>`;
    // İlerleme: halka boyunca dönen renk geçişi (conic, maske ile şerit); açılışta uç düğmesiyle birlikte dolar (data-c="bar" → is-canli).
    const svg = `<svg viewBox="0 0 296 296" aria-hidden="true"><circle class="gm-oruc-iz" cx="${c}" cy="${c}" r="${r}"/><g class="gm-oruc-centik">${centik}</g></svg>${oran > 0 ? `<span class="gm-oruc-yay${oran >= 1 ? ' is-tam' : ''}" data-c="bar" style="--o:${yuvarla(oran)}" aria-hidden="true"></span>` : ''}`;
    return `<div class="${liste('gm-oruc', `is-${durum}`, o.sinif)}">${svg}${isaret}${uzun > 0 && uzun < 100 ? `<span class="gm-oruc-uc" data-c="bar" style="--a:${yuvarla(oran * 360)}deg"><i></i></span>` : ''}${o.git || o.veri ? `<button type="button" class="gm-oruc-dokun"${at({git: o.git, veri: o.veri, etiket: 'Fazları göster'})}>${merkez}</button>` : merkez}</div>`;
  };
  // Kompakt oruç pili (Bugün). {durum, baslik, alt, oran, git}
  GM.orucPil = (o = {}) => {
    const uzun = yuvarla(kisit(o.oran || 0, 0, 1) * 100);
    return `<button type="button" class="${liste('gm-pil', `is-${o.durum || 'pencere'}`, o.sinif)}"${at(o)}><svg viewBox="0 0 40 40" aria-hidden="true"><circle class="gm-pil-iz" cx="20" cy="20" r="16"/><circle class="gm-pil-dolu" cx="20" cy="20" r="16" pathLength="100" stroke-dasharray="${uzun} 100" transform="rotate(-90 20 20)"/></svg><span class="gm-pil-ikon">${ik(o.ikon || (o.durum === 'oruc' ? 'oruc' : 'pencere'))}</span><span class="gm-pil-metin"><b>${esc(o.baslik)}</b><small>${esc(o.alt || '')}</small></span>${ik('satirOk', 'gm-satir-ok')}</button>`;
  };

  // ---------- Denge Skoru: yarım kadran, bileşen başına segment ----------
  GM.skorTon = s => (s >= 70 ? 'iyi' : s >= 40 ? 'orta' : 'notr');
  // {skor, etiket, fark, bilesenler:[{ad,puan,enCok}], hazirlaniyor:{gun,toplam}}
  GM.dengeSkor = (o = {}) => {
    const cx = 132, cy = 136, r = 112, ton = o.hazirlaniyor ? 'notr' : GM.skorTon(o.skor || 0);
    // Tek yay: bileşen kırılımı GM.dengeSatirlar'dadır. Parçalı yay yarım dolmuş yükleme göstergesi gibi okunuyordu (Beyar, 10 Kasım).
    const d = yayYol(cx, cy, r, Math.PI, 2 * Math.PI), u = o.hazirlaniyor ? yuvarla(o.hazirlaniyor.gun / o.hazirlaniyor.toplam * 100) : kisit(o.skor || 0, 0, 100);
    const yaylar = `<path class="gm-skor-iz" d="${d}"/>${u > 0 ? `<path class="gm-skor-dolu" d="${d}" pathLength="100" stroke-dasharray="${u} 100" data-c="yay" data-uzun="${u}"/>` : ''}`;
    const orta = o.hazirlaniyor
      ? `<span class="gm-t-sub">Hazırlanıyor</span><b class="gm-t-numeral-lg">${esc(o.hazirlaniyor.gun)}<span class="gm-skor-bolu">/${esc(o.hazirlaniyor.toplam)} gün</span></b>`
      : `<span class="gm-skor-sozcuk">${esc(o.etiket || '')}</span><b class="gm-t-numeral-xl"><span data-c="say" data-hedef="${o.skor}">${esc(o.skor)}</span><span class="gm-skor-bolu">/100</span></b>${o.fark ? `<small>${esc(o.fark)}</small>` : ''}`;
    return `<div class="${liste('gm-skor', `is-${ton}`, o.sinif)}" role="img" aria-label="${esc(`Denge Skoru ${o.skor ?? ''} / 100 ${o.etiket || ''}`)}"><svg viewBox="0 0 264 148" aria-hidden="true">${yaylar}</svg><div class="gm-skor-orta">${orta}</div></div>`;
  };

  // ---------- Çizgi grafik ----------
  const egri = n => n.map((p, i) => { if (!i) return `M${p[0]} ${p[1]}`; const a = n[i - 1], dx = (p[0] - a[0]) / 2; return `C${yuvarla(a[0] + dx)} ${a[1]} ${yuvarla(p[0] - dx)} ${p[1]} ${p[0]} ${p[1]}`; }).join('');
  // {seri:[{etiket,deger}]|[sayi], tur:'spark'|'eksenli', hedef, secili (indeks), birim, ton, ad, hedefEtiket}
  GM.grafik = (o = {}) => {
    const seri = (o.seri || []).map(x => (typeof x === 'number' ? {etiket: '', deger: x} : x)), n = seri.length, tur = o.tur || 'spark';
    if (!n) return '';
    const onceki = (o.onceki || []).map(x => (typeof x === 'number' ? x : x.deger)), ham = (o.ham || []).map(x => (typeof x === 'number' ? x : x.deger));
    const dk = seri.map(x => x.deger).concat(o.hedef ?? [], onceki, ham);
    let min = Math.min(...dk), max = Math.max(...dk); const pay = (max - min || 1) * .15; min -= pay; max += pay;
    const X = i => yuvarla(n > 1 ? i / (n - 1) * 100 : 50), Y = v => yuvarla(50 - (v - min) / (max - min) * 50);
    const nokta = seri.map((x, i) => [X(i), Y(x.deger)]);
    const d = egri(nokta), alan = `${d}L100 50L0 50Z`;
    const ton = o.ton || 'primary';
    const svg = `<svg viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true"><path class="gm-grafik-alanboya" d="${alan}"/>${tur === 'eksenli' ? [12.5, 25, 37.5].map(y => `<line class="gm-grafik-kilavuz" x1="0" x2="100" y1="${y}" y2="${y}"/>`).join('') : ''}${o.hedef != null ? `<line class="gm-grafik-hedef" x1="0" x2="100" y1="${Y(o.hedef)}" y2="${Y(o.hedef)}"/>` : ''}${onceki.length ? `<path class="gm-grafik-onceki" d="${egri(onceki.map((v, i) => [yuvarla(i / (onceki.length - 1) * 100), Y(v)]))}"/>` : ''}${ham.length ? `<path class="gm-grafik-ham" d="${egri(ham.map((v, i) => [yuvarla(i / (ham.length - 1) * 100), Y(v)]))}"/>` : ''}<path class="gm-grafik-cizgi" d="${d}"/></svg>`;
    if (tur === 'spark') return `<div class="gm-grafik is-spark is-${ton}" aria-hidden="true"><div class="gm-grafik-alan" data-c="bar">${svg}</div></div>`;
    const b = o.ondalik ?? 1, sec = o.secili ?? n - 1, yEt = [max - pay, (max + min) / 2, min + pay];
    const her = n <= 5 ? 1 : Math.ceil((n - 1) / 3);
    return `<div class="${liste('gm-grafik is-eksenli is-etkin', `is-${ton}`, o.sinif)}" data-c="grafik" data-ad="${esc(o.ad || 'grafik')}" data-secili="${sec}" data-birim="${esc(o.birim || '')}" data-ondalik="${b}" data-noktalar='${esc(JSON.stringify(seri.map((x, i) => [X(i), Y(x.deger), x.deger, x.etiket])))}'>
      <div class="gm-grafik-gorunum"><div class="gm-grafik-y">${yEt.map(v => `<span>${ondalik(v, b)}</span>`).join('')}</div>
      <div class="gm-grafik-alan" role="slider" tabindex="0" aria-label="${esc(o.etiket || 'Grafik')}" aria-valuemin="0" aria-valuemax="${n - 1}" aria-valuenow="${sec}" data-yatay data-c="bar">${svg}${o.hedef != null ? `<span class="gm-grafik-hedef-et" style="--y:${Y(o.hedef) * 2}%">${esc(o.hedefEtiket || `Hedef ${ondalik(o.hedef, b)}`)}</span>` : ''}<i class="gm-grafik-cubuk"></i><i class="gm-grafik-nokta"></i><span class="gm-grafik-balon"></span></div></div>
      <div class="gm-grafik-x">${seri.map((x, i) => `<span style="--x:${X(i)}%">${i % her === 0 ? esc(x.etiket) : ''}</span>`).join('')}</div></div>`;
  };
  // Grafik kartı: başlık cümledir. {cumle, deger, birim, fark, farkTon, donemler:[{ad,deger}], donem, ad, grafik (html), alt:[{deger,etiket}]}
  GM.grafikKart = (o = {}) => `<div class="gm-kart gm-grafik-kart"><div class="gm-yigin-4">${o.deger != null ? `<div class="gm-metrik-deger"><b class="gm-t-numeral-lg">${esc(o.deger)}</b>${o.birim ? `<small>${esc(o.birim)}</small>` : ''}${o.fark ? `<span class="gm-metrik-fark is-${o.farkTon || 'notr'}">${esc(o.fark)}</span>` : ''}</div>` : ''}${o.cumle ? GM.p(o.cumle, {meta: true, ton: 'ikincil'}) : ''}</div>${o.grafik || ''}${o.donemler ? GM.segment({ad: o.ad || 'donem', ogeler: o.donemler, secili: o.donem}) : ''}${o.alt ? GM.stat(o.alt, {yalin: true}) : ''}</div>`;
  GM._grafikCiz = (el, i = +el.dataset.secili) => {
    const n = JSON.parse(el.dataset.noktalar), p = n[kisit(i, 0, n.length - 1)];
    el.dataset.secili = i;
    const a = el.querySelector('.gm-grafik-alan');
    a.style.setProperty('--x', `${p[0]}%`); a.style.setProperty('--y', `${p[1] * 2}%`);
    a.setAttribute('aria-valuenow', i);
    const bal = el.querySelector('.gm-grafik-balon');
    bal.innerHTML = `<b>${ondalik(p[2], +el.dataset.ondalik)} ${esc(el.dataset.birim)}</b>${p[3] ? `<small>${esc(p[3])}</small>` : ''}`;
    bal.classList.toggle('is-sag', p[0] > 70); bal.classList.toggle('is-sol', p[0] < 30);
  };
  GM._grafikBasla = (ev, el) => {
    const a = el.querySelector('.gm-grafik-alan'), n = JSON.parse(el.dataset.noktalar);
    const sec = e => {
      const r = a.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 100;
      let en = 0; n.forEach((p, i) => { if (Math.abs(p[0] - x) < Math.abs(n[en][0] - x)) en = i; });
      if (en !== +el.dataset.secili) { GM._grafikCiz(el, en); GM.titres(2); GM.degisim(el, el.dataset.ad, en, {deger2: n[en][2]}); }
    };
    a.setPointerCapture(ev.pointerId); sec(ev);
    const son = () => { a.removeEventListener('pointermove', sec); a.removeEventListener('pointerup', son); a.removeEventListener('pointercancel', son); };
    a.addEventListener('pointermove', sec); a.addEventListener('pointerup', son); a.addEventListener('pointercancel', son);
  };

  // ---------- Dairesel saat seçici: 24 saat kadranı, oruç penceresi yayı ----------
  // {ad, deger:'12:00', pencereSaat, etiket, adim}
  // Aralık dışındaki değer sınırda durur. Hangi sınır: sürüklemede önceki değere, dokunuşta parmağa yakın olan. min > max gece yarısını geçen aralıktır.
  const kadranSinir = (a, b, v, yakin) => { if (a <= b ? v >= a && v <= b : v >= a || v <= b) return v; const d = (x, y) => { const k = Math.abs(x - y) % 1440; return Math.min(k, 1440 - k); }; return d(yakin, a) <= d(yakin, b) ? a : b; };
  GM.saatKadran = (o = {}) => {
    const saat = x => (typeof x === 'number' ? x : GM.saatDk(x)), sinirli = o.min != null && o.max != null, mn = sinirli ? saat(o.min) : null, mx = sinirli ? saat(o.max) : null;
    const ham = saat(o.deger || '12:00'), dk = sinirli ? kadranSinir(mn, mx, ham, ham) : ham, c = 140, r = 118;
    const cizgi = Array.from({length: 24}, (_, h) => { const a = h / 24 * 2 * Math.PI, s = Math.sin(a), n = -Math.cos(a), b = h % 6 === 0; return `<line class="gm-kadran-cizgi${b ? ' is-buyuk' : ''}" x1="${yuvarla(c + 102 * s)}" y1="${yuvarla(c + 102 * n)}" x2="${yuvarla(c + (b ? 94 : 98) * s)}" y2="${yuvarla(c + (b ? 94 : 98) * n)}"/>`; }).join('');
    return `<div class="gm-kadran" data-c="kadran" data-ad="${esc(o.ad || 'saat')}" data-deger="${dk}" data-pencere="${(o.pencereSaat || 0) * 60}" data-adim="${o.adim || 15}"${o.noktali ? ' data-noktali' : ''}${sinirli ? ` data-min="${mn}" data-max="${mx}"` : ''}>
      <div class="gm-kadran-alan" role="slider" tabindex="0" aria-label="${esc(o.etiket || 'Saat')}" aria-valuemin="${sinirli ? mn : 0}" aria-valuemax="${sinirli ? mx : 1439}" aria-valuenow="${dk}" aria-valuetext="${esc(GM.saatMetin(dk))}" data-yatay>
        <svg viewBox="0 0 280 280" aria-hidden="true"><circle class="gm-kadran-iz" cx="${c}" cy="${c}" r="${r}"/><circle class="gm-kadran-yay" cx="${c}" cy="${c}" r="${r}" pathLength="100" transform="rotate(-90 ${c} ${c})"/>${cizgi}</svg>
        ${[[0, '00'], [6, '06'], [12, '12'], [18, '18']].map(([h, m]) => `<span class="gm-kadran-et" style="--a:${h * 15}deg"><span>${m}</span></span>`).join('')}
        ${o.pencereSaat ? '<span class="gm-kadran-uc"><i></i></span>' : ''}<span class="gm-kadran-tut"><i></i></span>
        <div class="gm-kadran-orta"><small>${esc(o.etiket || 'Saat')}</small><b class="gm-t-numeral-lg" data-kadran-saat>${esc(o.noktali ? GM.saatMetin(dk).replace(':', '.') : GM.saatMetin(dk))}</b>${o.pencereSaat ? `<small data-kadran-bitis></small>` : ''}</div>
      </div></div>`;
  };
  GM._kadranCiz = el => {
    const v = +el.dataset.deger, p = +el.dataset.pencere, g = 1440;
    const a = el.querySelector('.gm-kadran-alan');
    a.style.setProperty('--a', `${v / g * 360}deg`); a.style.setProperty('--b', `${(v + p) % g / g * 360}deg`);
    const y = el.querySelector('.gm-kadran-yay');
    y.setAttribute('stroke-dasharray', `${p / g * 100} 100`); y.setAttribute('stroke-dashoffset', `${-v / g * 100}`);
    el.querySelector('[data-kadran-saat]').textContent = 'noktali' in el.dataset ? GM.saatMetin(v).replace(':', '.') : GM.saatMetin(v);
    const b = el.querySelector('[data-kadran-bitis]'); if (b) b.textContent = `${'noktali' in el.dataset ? GM.saatMetin((v + p) % g).replace(':', '.') : GM.saatMetin((v + p) % g)}’e kadar`;
    a.setAttribute('aria-valuenow', v); a.setAttribute('aria-valuetext', GM.saatMetin(v));
  };
  const kadranYaz = (el, v, dokunus) => { const adim = +el.dataset.adim; v = ((Math.round(v / adim) * adim) % 1440 + 1440) % 1440; if (el.dataset.min != null) v = kadranSinir(+el.dataset.min, +el.dataset.max, v, dokunus ? v : +el.dataset.deger); if (v !== +el.dataset.deger) { el.dataset.deger = v; GM._kadranCiz(el); GM.titres(2); GM.degisim(el, el.dataset.ad, GM.saatMetin(v), {dakika: v}); } };
  GM._kadranBasla = (ev, el) => {
    const a = el.querySelector('.gm-kadran-alan');
    let ilk = true;
    const hesap = e => { const r = a.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; kadranYaz(el, ((Math.atan2(x, -y) / (2 * Math.PI)) * 1440 + 1440) % 1440, ilk); ilk = false; };
    a.setPointerCapture(ev.pointerId); el.classList.add('is-surukleniyor'); hesap(ev);
    const son = () => { el.classList.remove('is-surukleniyor'); a.removeEventListener('pointermove', hesap); a.removeEventListener('pointerup', son); a.removeEventListener('pointercancel', son); };
    a.addEventListener('pointermove', hesap); a.addEventListener('pointerup', son); a.addEventListener('pointercancel', son);
  };
  GM._kadranTus = (ev, el) => { const a = +el.dataset.adim, d = {ArrowLeft: -a, ArrowDown: -a, ArrowRight: a, ArrowUp: a}[ev.key]; if (d) { ev.preventDefault(); kadranYaz(el, +el.dataset.deger + d); } };

  // ---------- Takvim: Gastro dg-takvim (gm-takvim.js) ----------
  // {ad, gorunum:'ay'|'hafta', mod:'tek'|'aralik', secili, aralik, noktalar:{iso:['uyari','gecti']}, halkalar:{iso:oran}, min, max, gorunumSec, gecis, baslik}
  GM.takvim = (o = {}) => `<div class="${liste('gm-takvim-kap', o.sinif)}" data-c="takvim" data-tk='${esc(JSON.stringify({bugun: GM.bugunIso(), secili: GM.bugunIso(), ...o}))}'></div>`;
  GM.takvimSheet = (o = {}) => GMTakvim.sec({bugun: GM.bugunIso(), ...o});
  GM.takvimAlan = o => GMTakvim.alan(o);
  GM.tarihUzun = s => GMTakvim.uzun(s).split(',')[0];
  GM.tarihKisa = s => GMTakvim.kisa(s);

  // ---------- Öğün, besin ----------
  // ogunKart(ogun, {git, hedef}): durum dolu | planli | degisti | atlandi | bos. Mini halka 44/6, ad, kcal, öğeler; sağda +. Planlıda üç hızlı durum.
  const OGUN_PAY = {kahvalti: .25, ogle: .35, aksam: .3, ara: .1};
  const OGUN_ALT = {degisti: 'Plandan değiştirildi', atlandi: 'Atlandı'};
  GM.ogunKart = (x, o = {}) => {
    const durum = x.durum || (x.besinler?.length ? 'dolu' : 'bos');
    const adlar = (x.besinler || []).map(b => b.ad.split(' (')[0]);
    const ozet = OGUN_ALT[durum] && durum === 'atlandi' ? '' : adlar.slice(0, 3).join(', ') + (adlar.length > 3 ? ` +${adlar.length - 3}` : '');
    const gunluk = o.gunlukHedef ?? window.GMV?.bugun?.hedefKcal ?? 1650;
    const hedef = o.hedef ?? x.hedefKcal ?? Math.round(gunluk * (OGUN_PAY[x.id] ?? OGUN_PAY[String(x.id).split('-')[0]] ?? .15));
    const git = o.git ?? `#/ogun/${x.id}`, dolu = durum === 'dolu' || durum === 'degisti';
    const kcalSatir = o.hedefsiz ? (dolu ? `Yenilen: <b>${sayi(x.kcal)} kcal</b>` : 'Henüz kayıt yok') : dolu ? `<span class="gm-ogun-kcal">Yenilen: <b>${sayi(x.kcal)} kcal</b></span> · <span class="gm-ogun-kcal">Hedef: ${sayi(hedef)} kcal</span>` : durum === 'planli' ? `Planlı · ${sayi(x.kcal)} kcal` : durum === 'atlandi' ? 'Atlandı' : `Hedef ${sayi(hedef)} kcal`;
    // Plan durumu Gastro üçlü seçimidir (.dgu-seg, Dolabım "Yer" alanı gibi etiketli): seçim kalır, plandan gelen öğünde karardan sonra da görünür (x.planSecim).
    const planSecim = x.planSecim ?? (durum === 'planli' ? '' : null);
    // Plan kararı: ayrı küçük eylem düğmeleri (Beyar kararı, Gastro eylem düğmesi kalıbı); seçilen düğme dolu + onay ikonu, diğerleri ikincil.
    const plan = planSecim != null && o.durumlar !== false ? `<div class="gm-ogun-plan" role="group" aria-label="${esc(x.ad)}: plana göre">${[['uygula', 'Uydum'], ['degistir', 'Değiştirdim'], ['atla', 'Atladım']].map(([e, m]) => GM.btn({metin: m, ikon: planSecim === e ? 'onay' : undefined, tur: planSecim === e ? 'primary' : 'secondary', boyut: 'sm', veri: {eylem: `plan-${e}`, id: x.id}, attrs: `aria-pressed="${planSecim === e}"`})).join('')}</div>` : '';
    return `<article class="${liste('gm-ogun', `is-${durum}`, o.sinif)}" data-ogun="${esc(x.id)}"><button type="button" class="gm-ogun-ust" data-git="${esc(git)}">${GM.halkaMini({oran: dolu ? (o.hedefsiz ? 1 : x.kcal / hedef) : 0, foto: x.foto, ikon: x.foto ? null : durum === 'atlandi' ? 'forward' : x.ikon || 'ogun', silik: !dolu})}<span class="gm-satir-metin"><span class="gm-ogun-ad">${esc(x.ad)}${x.saat ? `<small>${esc(x.saat)}</small>` : ''}${durum === 'degisti' ? GM.durumRozet({metin: 'Değişti', ton: 'uyari', ikon: 'duzenle'}) : ''}</span><small>${kcalSatir}</small>${ozet ? `<small class="gm-kirp-1">${esc(ozet)}</small>` : ''}</span></button><span class="gm-ogun-ekle">${GM.ikonBtn({ikon: 'ekle', etiket: `${x.ad} ekle`, tur: 'tint', veri: {eylem: 'ogun-ekle', id: x.id}})}</span>${plan}</article>`;
  };
  GM.ogunListe = (l, o = {}) => `<div class="gm-satirlar gm-ogunler">${l.map(x => GM.ogunKart(x, o)).join('')}</div>`;
  // Tabak kartı: GMCard tile ailesi, kare medya, cam kcal metası, perde metin konumundan. Fotoğraf yargı aracı değil: puan ve renk yok.
  const tabakGit = (k, git) => (typeof git === 'function' ? git(k) : git ? String(git).replace(':id', k.id) : `#/kayit/${k.id}`);
  const tabakKart = (k, o = {}) => { const etiket = o.kucuk ? k.ogun : [k.ogun, k.saat].filter(Boolean).join(' · '); return `<article class="${liste('gm-tile gm-tabak', o.kucuk && 'is-kucuk')}"><a class="gm-tile__media" href="${esc(tabakGit(k, o.git))}" aria-label="${esc([k.ogun, k.ad, k.kcal != null ? `${sayi(k.kcal)} kcal` : ''].filter(Boolean).join(', '))}">${k.foto ? `<span class="gm-photo" style="background-image:url('${esc(k.foto)}')"></span>` : `<span class="gm-photo image-failed">${ik('tabak')}</span>`}<span class="gm-tile__veil" aria-hidden="true"></span>${k.kcal != null ? `<span class="gm-meta" aria-hidden="true"><span>${ik('kalori')}${sayi(k.kcal)} kcal</span></span>` : ''}<span class="gm-tile__info"><span class="gm-card__category">${esc(etiket || '')}</span>${o.kucuk || !k.ad ? '' : `<span class="gm-card__title">${esc(k.ad)}</span>`}</span></a></article>`; };
  GM.tabakKart = tabakKart;
  // Gün başlıklı ızgara: {gunler:[{baslik, ozet, kayitlar}], git}. git: işlev ya da ':id' kalıbı; varsayılan #/kayit/:id.
  GM.tabakIzgara = (o = {}) => `<div class="gm-tabak-gunler">${(o.gunler || []).filter(g => g.kayitlar?.length).map(g => `<section class="gm-tabak-gun">${GM.bas(g.baslik, g.ozet ? {html: `<small class="gm-tabak-ozet">${esc(g.ozet)}</small>`} : null)}<div class="gm-tabak-izgara">${g.kayitlar.map(k => tabakKart(k, {git: o.git})).join('')}</div></section>`).join('')}</div>`;
  // Bugün şeridi: küçük kartlar, sonda Tümü.
  GM.tabakSerit = (l, o = {}) => `<div class="gm-strip gm-tabak-serit">${l.map(k => `<div class="gm-strip-oge">${tabakKart(k, {git: o.git, kucuk: true})}</div>`).join('')}<a class="gm-strip-oge gm-tabak-tumu" href="${esc(o.tumu || '#/tabaklarim')}">${ik('arrow-right')}<b>${esc(o.tumuMetin || 'Tümü')}</b></a></div>`;
  // Kaydın nereden geldiği; güven varsa yüzde. Yargı değil, bilgi: nötr rozet.
  const KAYNAK = {kamera: ['Fotoğraftan', 'kamera'], galeri: ['Galeriden', 'image'], ses: ['Sesle', 'mikrofon'], arama: ['Aramadan', 'ara_'], barkod: ['Barkoddan', 'barkod']};
  GM.kayitKaynak = (kaynak, guven) => { const [m, i] = KAYNAK[kaynak] || ['Elle', 'duzenle']; return GM.durumRozet({metin: guven != null ? `${m} · Güven %${Math.round(guven)}` : m, ton: 'notr', ikon: i}); };
  // Birkaç kelime: serbest metin + hazır öneriler. Her değişimde gm-degisim, ad = o.ad: deger birleşik not, detay {oneriler, serbest}.
  GM.oneriNot = (o = {}) => { const ad = o.ad || 'not'; return `<section class="gm-oneri-not" data-oneri-not="${esc(ad)}">${GM.input({ad, etiket: o.etiket || 'Birkaç kelime ekle', yer: o.yer || 'Ne eklemek istersin?', deger: o.deger})}${GM.cipler({ad: `${ad}-oneri`, etiket: 'Hazır öneriler', secili: o.secili, ogeler: (o.oneriler || []).map(x => (typeof x === 'string' ? {metin: x, deger: x} : x))})}</section>`; };
  const oneriYay = k => { const ad = k.dataset.oneriNot, serbest = k.querySelector('input').value.trim(), oneriler = [...k.querySelectorAll('[data-cip][aria-pressed=true]')].map(b => b.dataset.cip); GM.degisim(k, ad, [...oneriler, serbest].filter(Boolean).join(', '), {oneriler, serbest}); };
  document.addEventListener('input', ev => { const k = ev.target.closest?.('[data-oneri-not]'); if (k) oneriYay(k); });
  document.addEventListener('gm-degisim', ev => { const k = ev.target.closest?.('[data-oneri-not]'); if (k && ev.detail.ad === `${k.dataset.oneriNot}-oneri`) oneriYay(k); });
  // besinSatir(b, {swipe, eylemler, git, veri, sag, alt, ek, deger (null: sağda kcal yok), ok})
  GM.besinSatir = (b, o = {}) => {
    const alt = o.alt ?? [b.miktar != null ? `${ondalik(b.miktar, 2)} ${b.birim || ''}`.trim() : '', b.gram ? `${sayi(b.gram)} g` : ''].filter(Boolean).join(' · ');
    const satir = GM.satir({sol: GM.gorsel({src: b.gorsel, ad: b.ad, ton: GM.makroTon(b)}), baslik: b.ad, alt, ek: o.ek, deger: 'deger' in o ? o.deger : b.kcal != null ? `${sayi(b.kcal)} kcal` : null, git: o.git, veri: o.veri, sag: o.sag, ok: o.ok ?? false, duz: !!o.sag});
    if (!o.swipe) return satir;
    const ey = o.eylemler || [{eylem: 'miktar', ikon: 'duzenle', metin: 'Miktar', ton: 'notr'}, {eylem: 'sil', ikon: 'sil', metin: 'Sil', ton: 'yikici'}];
    return `<div class="gm-swipe" data-id="${esc(b.id ?? b.slug)}"><div class="gm-swipe-eylemler">${ey.map(e => `<button type="button" class="gm-swipe-eylem is-${e.ton || 'notr'}" data-eylem="${esc(e.eylem)}">${ik(e.ikon)}<span>${esc(e.metin)}</span></button>`).join('')}</div><div class="gm-swipe-on">${satir}</div></div>`;
  };

  // Metrik kartı: Gastro .gm-kart yüzeyi. deger:null tire gösterir, çıplak 0 yazılmaz.
  GM.metrikKart = (o = {}) => `<${o.git ? 'button type="button"' : 'div'} class="${liste('gm-kart gm-metrik', o.sinif)}"${at({git: o.git})}><div class="gm-ara"><span class="gm-yardim">${esc(o.etiket)}</span>${o.ikon ? GM.ikonKutu({ikon: o.ikon, boyut: 'sm', ton: o.ton || 'primary'}) : ''}</div><div class="gm-metrik-deger"><b class="gm-t-numeral-lg">${esc(o.deger ?? '––')}</b>${o.birim ? `<small>${esc(o.birim)}</small>` : ''}</div>${o.degisim ? `<span class="gm-metrik-fark is-${o.degisimTon || 'notr'}">${o.degisimIkon ? ik(o.degisimIkon) : ''}${esc(o.degisim)}</span>` : ''}${o.seri ? GM.grafik({seri: o.seri, tur: 'spark', ton: o.grafikTon}) : ''}</${o.git ? 'button' : 'div'}>`;

  // ---------- Su, duygu ----------
  // Su kartı: hedef bardak bardak görünür, kısmi bardak kısmi dolar. Sıradaki bardak + ile bir bardak ekler. kayitEylem geçmiş sheet'ini açar.
  // adimlar: ml ya da {ml, metin}. Hedef ve kalan bardakla da söylenir; 1 bardak 200 ml.
  GM.SU_BARDAK = 200;
  GM.suBardak = ml => Math.ceil(ml / GM.SU_BARDAK);
  GM.suKalan = (icilen, hedef) => (icilen >= hedef ? 'Hedefe ulaştın' : `${GM.suBardak(hedef - icilen)} bardak kaldı`);
  GM.suBardakDurum = (icilen, i) => kisit((icilen - i * GM.SU_BARDAK) / GM.SU_BARDAK, 0, 1);
  // Bardak sayısı hedefle sınırlı değildir: her zaman bir sonraki bardak vardır. Boş bardak ekler, dolu bardak bir bardak geri alır.
  GM.suSiradaki = icilen => Math.floor(icilen / GM.SU_BARDAK);
  GM.suBardakSayi = (icilen, hedef) => Math.max(GM.suBardak(hedef), GM.suSiradaki(icilen) + 1);
  GM.suBardakCiz = (icilen, i) => { const oran = GM.suBardakDurum(icilen, i), dolu = oran >= 1; return `<button type="button" class="${liste('gm-bardak', i === GM.suSiradaki(icilen) && 'is-siradaki')}" style="--oran:${oran.toFixed(3)};--i:${i}" ${dolu ? 'data-su-cikar' : 'data-su-ekle'}="${GM.SU_BARDAK}" aria-label="1 su bardağı ${dolu ? 'geri al' : 'ekle'}"><span class="gm-bardak-ic"><i></i></span><span class="gm-bardak-arti" aria-hidden="true">${ik('ekle')}</span></button>`; };
  GM.suBardaklar = (icilen, hedef) => `<div class="gm-su-bardaklar" role="group" aria-label="${esc(`${GM.suBardak(hedef)} bardaklık hedef`)}">${Array.from({length: GM.suBardakSayi(icilen, hedef)}, (_, i) => GM.suBardakCiz(icilen, i)).join('')}</div>`;
  GM.suKart = (o = {}) => {
    const {icilen = 0, hedef = 2000, adimlar = [200, 500]} = o, dugmeler = adimlar.map(a => (typeof a === 'number' ? {ml: a, metin: `+${a} ml`} : a));
    return `<div class="${liste('gm-kart gm-su', o.sinif)}" data-deger="${icilen}" data-hedef="${hedef}" data-ad="${esc(o.ad || 'su')}"><div class="gm-ara"><span class="gm-su-baslik">${ik('su')}<span class="gm-t-card">Su</span></span>${o.kayitEylem ? `<button type="button" class="gm-su-kayit"${at({veri: {eylem: o.kayitEylem}})}><span>Kayıtlar</span>${ik('chevron-right')}</button>` : ''}</div><div class="gm-yigin-4"><div class="gm-su-sayi"><b class="gm-t-numeral-lg" data-su-deger>${sayi(icilen)}</b><small>/ ${sayi(hedef)} ml · ${GM.suBardak(hedef)} bardak</small></div><small class="gm-su-kalan" data-su-kalan aria-live="polite">${GM.suKalan(icilen, hedef)}</small></div>${GM.suBardaklar(icilen, hedef)}<div class="gm-su-dugmeler">${dugmeler.map(d => GM.btn({metin: d.metin, tur: 'tonal', boyut: 'sm', veri: {'su-ekle': d.ml}})).join('')}</div></div>`;
  };
  // Hızlı miktar karoları. {ogeler:[{ml, ad, ikon}], eylem}: dokunuş eklemedir, id miktardır.
  GM.suMiktarlar = (o = {}) => `<div class="gm-su-miktarlar">${(o.ogeler || []).map(x => `<button type="button" class="gm-su-miktar"${at({veri: {eylem: o.eylem, id: x.ml}})}>${ik(x.ikon)}<b>${sayi(x.ml)} ml</b><small>${esc(x.ad)}</small></button>`).join('')}</div>`;
  // Haftalık su çubukları. {gunler:[{etiket, ml, bugun}], hedef}: kesik çizgi hedeftir, renk yargı taşımaz.
  GM.suHafta = (o = {}) => {
    const l = o.gunler || [], ust = Math.max(o.hedef || 0, ...l.map(x => x.ml)) || 1;
    return `<div class="gm-su-hafta" role="img" aria-label="${esc(l.map(x => `${x.etiket} ${sayi(x.ml)} ml`).join(', '))}"><div class="gm-su-hafta-alan" style="--hedef:${(o.hedef / ust).toFixed(3)}">${l.map(x => `<i class="${liste('gm-su-cubuk', x.bugun && 'is-bugun')}" style="--oran:${(x.ml / ust).toFixed(3)}"></i>`).join('')}</div><div class="gm-su-hafta-gunler">${l.map(x => `<span class="${x.bugun ? 'is-bugun' : ''}">${esc(x.etiket)}</span>`).join('')}</div></div>`;
  };
  // ---------- Zaman çizelgesi: günün saatli kalemleri (Bugünün öğünleri). Faz çizelgesinin saat kolonlu kardeşi ----------
  // {ogeler:[{saat, baslik, ikon, rozetler:[{metin, ton, ikon}], metin, notlar:[{ikon, metin}], hal:'tamam'|'soluk'|'odak', eylemler:[{metin, ikon, tur, veri}]}], etiket}
  GM.zamanCizelge = (o = {}) => `<ol class="${liste('gm-zc', o.sinif)}"${o.etiket ? ` aria-label="${esc(o.etiket)}"` : ''}>${(o.ogeler || []).map(x => `<li class="${liste(x.hal === 'tamam' && 'is-tamam', x.hal === 'soluk' && 'is-soluk', x.hal === 'odak' && 'is-odak')}"><span class="gm-zc-saat">${esc(x.saat)}</span><span class="gm-zc-isaret" aria-hidden="true">${ik(x.hal === 'tamam' ? 'onay' : x.hal === 'soluk' ? 'kapat' : x.ikon || 'saat')}</span><div class="gm-zc-govde"><div class="gm-zc-bas"><span class="gm-t-card">${esc(x.baslik)}</span>${(x.rozetler || []).map(r => GM.durumRozet(r)).join('')}</div>${x.metin ? `<p class="gm-zc-metin">${vurgu(x.metin)}</p>` : ''}${(x.notlar || []).map(n => `<span class="gm-zc-not">${ik(n.ikon || 'bilgi')}<span>${esc(n.metin)}</span></span>`).join('')}${x.eylemler?.length ? `<div class="gm-zc-eylem">${x.eylemler.map(e => GM.btn({boyut: 'sm', tur: 'secondary', ...e})).join('')}</div>` : ''}</div></li>`).join('')}</ol>`;
  // Rozet ızgarası (Gastro .dgu-rozet-izgara): {ogeler:[{id, ad, ikon, alt, hal:'kazanildi'|'ilerliyor'|'kilitli', n, hedef}]}; dokunuş data-eylem="rozet" data-id
  GM.rozetIzgara = (o = {}) => `<ul class="gm-rozet-izgara">${(o.ogeler || []).map(r => `<li><button type="button" class="${liste('gm-rozet-hucre', r.hal === 'kilitli' && 'is-kilitli')}"${at({veri: {eylem: o.eylem || 'rozet', id: r.id}})} aria-label="${esc(`${r.ad}: ${r.hal === 'kazanildi' ? 'kazanıldı' : r.hal === 'ilerliyor' ? `ilerleme ${r.n} / ${r.hedef}` : 'kazanılmadı'}`)}">${GM.madalya({ikon: r.ikon, hal: r.hal === 'kazanildi' ? '' : r.hal})}<span class="gm-rozet-ad">${esc(r.ad)}</span>${r.hal === 'ilerliyor' && r.hedef ? GM.ilerleme({oran: r.n / r.hedef}) : `<span class="gm-rozet-alt">${esc(r.alt || '')}</span>`}</button></li>`).join('')}</ul>`;
  // Kilit ekranı önizlemesi: görsel + perde üstünde saat ve bildirim.
  GM.kilitEkrani = (o = {}) => `<figure class="${liste('gm-kilit', o.sinif)}" role="img" aria-label="${esc(`Kilit ekranı önizlemesi: ${o.baslik}. ${o.metin}`)}"><span class="gm-photo" style="background-image:url('${esc(o.gorsel || 'assets/gorsel/hero/ritim-su.webp')}')"></span><span class="gm-kilit-perde"></span><div class="gm-kilit-saat"><small>${esc(o.tarih)}</small><b>${esc(o.saat)}</b></div><div class="gm-kilit-bildirim"><img src="assets/marka/ikon-512.png" alt=""><div class="gm-kilit-metin"><div class="gm-ara"><small>Dada Diet</small><small>${esc(o.zaman || 'şimdi')}</small></div><b>${esc(o.baslik)}</b><span>${esc(o.metin)}</span></div></div></figure>`;
  // Su hatırlatması: su ekranı ve Profil > Bildirimler aynı parçadır. Durum: bildirim-ayar.su, su-sessiz {bas, bit}.
  const dakika = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const noktali = s => s.replace(':', '.');
  const sessizde = (dk, bas, bit) => (bas === bit ? false : bas < bit ? dk >= bas && dk < bit : dk >= bas || dk < bit);
  const sonrakiSaat = (bas, bit) => { const h0 = GM.simdi().getHours(); for (let i = 1; i <= 24; i += 1) { const h = (h0 + i) % 24; if (!sessizde(h * 60, dakika(bas), dakika(bit))) return `${String(h).padStart(2, '0')}:00`; } return null; };
  // Etiketli alan: Gastro .dgu-alan > .dgu-etiket (dolabim.js takip türü, tazelik; ayarlar puan). Girdi olmayan kontrol (segment, çip, adımlayıcı, porsiyon, liste) için etiket + yardım + hata.
  // {etiket, html, yardim, hata, zorunlu, id, sinif}. Grup erişilebilir adını etiketten alır.
  GM.alan = (o = {}) => { const id = o.id || `e-${Math.random().toString(36).slice(2, 7)}`; return `<div class="${liste('gm-alan', o.hata && 'is-hata', o.sinif)}" role="group" aria-labelledby="${esc(id)}"><span class="gm-etiket" id="${esc(id)}">${esc(o.etiket)}${o.zorunlu ? ' *' : ''}</span>${o.html || ''}${o.hata ? `<p class="gm-hata" role="alert">${ik('uyari')}${esc(o.hata)}</p>` : ''}${o.yardim ? `<p class="gm-yardim">${esc(o.yardim)}</p>` : ''}</div>`; };
  // Saat seçimi: yarım saatlik yerel seçici; tarayıcı diline bakmadan 24 saat gösterir.
  // Saat alanı: Gastro saat alanı (DG.alan tur:'time', Flutter DgTimeField) gibi kutuya dokununca alttan kadran açılır. Seçim gizli input'a yazılır, 'change' ve gm-degisim atılır.
  GM.saatSec = (o = {}) => `<div class="gm-alan"><span class="gm-etiket" id="l-${esc(o.ad)}">${esc(o.etiket)}</span><div class="gm-girdi gm-secici"><button type="button" class="gm-secici-dugme" data-saat-alan="${esc(o.ad)}" data-adim="${esc(o.adim || 30)}" aria-labelledby="l-${esc(o.ad)}" aria-haspopup="dialog"><span>${esc(noktali(o.deger || '12:00'))}</span></button><span class="gm-secici-ok" aria-hidden="true">${ik('saat')}</span><input type="hidden" name="${esc(o.ad)}" value="${esc(o.deger || '12:00')}"></div>${o.yardim ? `<p class="gm-yardim">${esc(o.yardim)}</p>` : ''}</div>`;
  document.addEventListener('click', ev => {
    const b = ev.target.closest?.('[data-saat-alan]'); if (!b) return;
    const girdi = b.parentElement.querySelector('input[type="hidden"]'), baslik = document.getElementById(b.getAttribute('aria-labelledby'))?.textContent || 'Saat';
    let deger = girdi.value;
    GM.sheet({baslik, html: GM.saatKadran({ad: '_saat', deger, adim: +b.dataset.adim || 30, etiket: baslik, noktali: true}), altBar: GM.btn({metin: 'Tamam', tam: true, veri: {eylem: 'saat-tamam'}}),
      sonra: d => { GM.on(d, '_saat', v => { deger = typeof v === 'number' ? GM.saatMetin(v) : v; }); GM.eylem(d, 'saat-tamam', () => { girdi.value = deger; b.querySelector('span').textContent = noktali(deger); girdi.dispatchEvent(new Event('change', {bubbles: true})); GM.degisim(b, b.dataset.saatAlan, deger); d.kapat(); }); }});
  });
  GM.suSonrakiSaat = () => { const {bas, bit} = GM.suHatirlatmaDurum(); return noktali(sonrakiSaat(bas, bit) || '18:00'); };
  GM.suHatirlatmaDurum = () => ({acik: GM.durum.oku('bildirim-ayar', {}).su ?? true, bas: '23:00', bit: '08:00', ...GM.durum.oku('su-sessiz', {})});
  const suHatirlatmaIc = () => {
    const {acik, bas, bit} = GM.suHatirlatmaDurum(), sonraki = sonrakiSaat(bas, bit), an = GM.simdi();
    const tarih = `${an.toLocaleDateString('tr-TR', {weekday: 'long'})}, ${an.toLocaleDateString('tr-TR', {day: 'numeric', month: 'long'})}`;
    return `${GM.toggle({ad: 'su-hatirlat', ikon: 'bell', etiket: 'Saat başı hatırlat', alt: acik && sonraki ? `Sıradaki ${noktali(sonraki)}` : 'Kapalı', secili: acik})}${acik ? `<div class="gm-yigin-8"><span class="gm-t-card">Sessiz saatler</span><div class="gm-ikili">${GM.saatSec({ad: 'su-sessiz-bas', etiket: 'Başlangıç', deger: bas})}${GM.saatSec({ad: 'su-sessiz-bit', etiket: 'Bitiş', deger: bit})}</div><small class="gm-yardim">${bas === bit ? 'Sessiz saat yok; hatırlatma her saat gelir.' : `${noktali(bas)}–${noktali(bit)} arasında hatırlatma gelmez.`}</small></div><div class="gm-yigin-8"><span class="gm-t-card">Bildirim görünümü</span>${GM.kilitEkrani({saat: noktali(sonraki || '18:00'), tarih, baslik: 'Su zamanı', metin: `1 su bardağı (${GM.SU_BARDAK} ml) içmeye ne dersin?`})}</div>` : ''}`;
  };
  GM.suHatirlatma = () => `<div class="gm-yigin-12" data-su-hatirlatma>${suHatirlatmaIc()}</div>`;
  GM.suHatirlatmaBagla = kok => {
    const ciz = () => { const y = kok.querySelector('[data-su-hatirlatma]'); if (y) { y.innerHTML = suHatirlatmaIc(); if (window.GMMetin) GMMetin.isle(y); } };
    const anahtar = GM.on(kok, 'su-hatirlat', v => { GM.durum.yaz('bildirim-ayar', {...GM.durum.oku('bildirim-ayar', {}), su: v}); ciz(); GM.toast(`**Su hatırlatması** ${v ? 'açıldı' : 'kapatıldı'}`, {ikon: v ? 'bell' : 'bell-slash'}); });
    const saat = ev => { const ad = ev.target.name; if (!['su-sessiz-bas', 'su-sessiz-bit'].includes(ad) || !ev.target.value) return; const {bas, bit} = GM.suHatirlatmaDurum(); GM.durum.yaz('su-sessiz', {bas, bit, [ad === 'su-sessiz-bas' ? 'bas' : 'bit']: ev.target.value}); ciz(); };
    kok.addEventListener('change', saat);
    return () => { anahtar?.(); kok.removeEventListener('change', saat); };
  };
  // Tabak bölmeleri: dört bölmeli daire, ortada skor. {bolme:{sebze, protein, karb, yag}, skor}
  // ---------- Tabak: dört bölmeli tabak + oran satırları (Diet'e özgü; Gastro kart ve tipografi ölçüsünde) ----------
  // Renk eşlemesi tek yerde: tabaktaki dilim = satırdaki nokta. sebze primary, protein, karb, yağ makro token'ları.
  const TABAK_SIRA = ['sebze', 'protein', 'karb', 'yag'];
  const TABAK_IDEAL = {sebze: {ad: 'Sebze', aralik: [40, 50]}, protein: {ad: 'Protein', aralik: [20, 25]}, karb: {ad: 'Karbonhidrat', aralik: [20, 25]}, yag: {ad: 'Sağlıklı yağ', aralik: [5, 10]}};
  const tabakIdeal = o => ({...TABAK_IDEAL, ...(o || {})});
  const dilim = (a0, a1, R) => {
    if (a1 - a0 >= 359.99) return `M50 ${50 - R}A${R} ${R} 0 1 1 49.99 ${50 - R}Z`;
    const p = a => [50 + R * Math.cos(rad(a - 90)), 50 + R * Math.sin(rad(a - 90))].map(yuvarla), [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M50 50L${x0} ${y0}A${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}Z`;
  };
  // {bolme:{sebze, protein, karb, yag} yüzde, skor, bos, ideal:{id:{ad, aralik}}}. bos (ya da toplam 0): ideal oranın kesik çizgili silik kılavuzu.
  GM.tabakBolme = (o = {}) => {
    const R = 40, uid = `tb${Math.random().toString(36).slice(2, 7)}`, ideal = tabakIdeal(o.ideal), b = o.bolme || {};
    const bos = o.bos || !TABAK_SIRA.some(id => +b[id] > 0);
    const deger = bos ? Object.fromEntries(TABAK_SIRA.map(id => [id, (ideal[id].aralik[0] + ideal[id].aralik[1]) / 2])) : b;
    const top = TABAK_SIRA.reduce((t, id) => t + Math.max(0, +deger[id] || 0), 0) || 1;
    let a = 0; const parca = [];
    TABAK_SIRA.forEach(id => { const v = Math.max(0, +deger[id] || 0); if (!v) return; const a1 = a + v / top * 360; parca.push({id, a0: a, a1}); a = a1; });
    const ayrac = parca.length > 1 ? parca.map(x => { const r = rad(x.a0 - 90); return `<line class="gm-tabak-ayrac" x1="50" y1="50" x2="${yuvarla(50 + R * Math.cos(r))}" y2="${yuvarla(50 + R * Math.sin(r))}"/>`; }).join('') : '';
    const dilimler = parca.map(x => `<path class="gm-tabak-dilim is-${x.id}"${bos ? '' : ` fill="url(#${uid}-${x.id})"`} d="${dilim(x.a0, x.a1, R)}"/>`).join('');
    const grad = bos ? '' : TABAK_SIRA.map(id => `<radialGradient id="${uid}-${id}" class="is-${id}" cx="50" cy="50" r="${R}" gradientUnits="userSpaceOnUse"><stop class="gm-tabak-ic" offset=".38"/><stop class="gm-tabak-dis" offset="1"/></radialGradient>`).join('');
    const etiket = bos ? `İdeal tabak: ${TABAK_SIRA.map(id => `${ideal[id].ad} yüzde ${ideal[id].aralik[0]}-${ideal[id].aralik[1]}`).join(', ')}` : `${TABAK_SIRA.map(id => `${ideal[id].ad} yüzde ${Math.round(+b[id] || 0)}`).join(', ')}. Denge puanı ${o.skor ?? '–'} / 100`;
    return `<div class="${liste('gm-tabak-bolme', bos && 'is-bos', o.sinif)}" role="img" aria-label="${esc(etiket)}"><svg viewBox="0 0 100 100" aria-hidden="true"><defs>${grad}<radialGradient id="${uid}-isik" cx="36" cy="30" r="52" gradientUnits="userSpaceOnUse"><stop class="gm-tabak-isik" offset="0"/><stop class="gm-tabak-isik is-son" offset="1"/></radialGradient></defs><circle class="gm-tabak-kuyu" cx="50" cy="50" r="${R + 1.5}"/>${dilimler}${ayrac}${bos ? '' : `<circle cx="50" cy="50" r="${R}" fill="url(#${uid}-isik)"/>`}</svg><span class="gm-tabak-orta">${bos ? '<small>İdeal</small><b class="gm-tabak-hedef">tabak</b>' : `<b>${esc(o.skor ?? '–')}</b><small>/100</small>`}</span></div>`;
  };
  // Oran satırı: nokta + ad + şu anki yüzde; çubukta ideal aralık bandı (tint) ve değer dolgusu (makro rengi); altta durum ve ideal aralık.
  // {id: sebze|protein|karb|yag, ad, deger, aralik:[alt, ust], bos}
  GM.tabakOran = (o = {}) => {
    const [alt, ust] = o.aralik || TABAK_IDEAL[o.id]?.aralik || [0, 100], v = Math.max(0, Math.min(100, Math.round(+o.deger || 0)));
    const durum = o.bos ? null : v < alt ? ['az', v < alt / 2 ? 'Az' : 'Biraz az', 'arrow-down'] : v > ust ? ['fazla', 'Fazla', 'arrow-up'] : ['ideal', 'İdeal aralıkta', 'circle-check'];
    return `<div class="${liste('gm-oran', `is-${o.id}`, o.bos && 'is-bos')}" style="--v:${v / 100};--alt:${alt / 100};--ust:${ust / 100}"><div class="gm-oran-bas"><i class="gm-oran-nokta" aria-hidden="true"></i><span class="gm-oran-ad">${esc(o.ad || TABAK_IDEAL[o.id]?.ad || o.id)}</span>${o.bos ? '' : `<b class="gm-oran-deger">%${v}</b>`}</div><div class="gm-oran-yol" aria-hidden="true"><i class="gm-oran-bant"></i>${o.bos ? '' : '<i class="gm-oran-dolgu"></i>'}</div><div class="gm-oran-alt">${durum ? `<span class="gm-oran-durum is-${durum[0]}">${ik(durum[2])}${durum[1]}</span>` : ''}<small>ideal %${alt}-${ust}</small></div></div>`;
  };
  // {bolme, ideal, bos}: dört satır tabakla aynı sırada.
  GM.tabakOranlar = (o = {}) => { const ideal = tabakIdeal(o.ideal); return `<div class="gm-oranlar">${TABAK_SIRA.map(id => GM.tabakOran({id, ad: ideal[id].ad, aralik: ideal[id].aralik, deger: o.bolme?.[id], bos: o.bos})).join('')}</div>`; };
  // Sağlık uyarısı: seviye dikkat ya da acil; sheet gövdesidir, yönlendirme düğmesi taşımaz.
  GM.saglikUyari = (o = {}) => `<div class="${liste('gm-saglik-uyari', `is-${o.seviye || 'dikkat'}`)}">${GM.ikonKutu({ikon: o.seviye === 'acil' ? 'hata' : 'uyari', boyut: 'lg', ton: o.seviye === 'acil' ? 'hata' : 'uyari'})}${o.belirti ? GM.durumRozet({metin: o.belirti, ton: o.seviye === 'acil' ? 'hata' : 'uyari', ikon: o.ikon}) : ''}<p>${vurgu(o.metin)}</p></div>`;
  // Soru etiketi Gastro puan alanı gibi (.dgu-alan > .dgu-etiket, ayarlar.js görüş puanı); seçenekler ikonlu düğme.
  GM.duygu = (o = {}) => { const grup = `<div class="gm-duygu" data-ad="${esc(o.ad || 'duygu')}" role="group" aria-label="${esc(o.soru || 'Duygu')}">${(o.secenekler || []).map(s => `<button type="button" data-deger="${esc(s.id)}" aria-pressed="${s.id === o.secili}">${ik(s.ikon)}<span>${esc(s.ad)}</span></button>`).join('')}</div>`; return o.soru ? GM.alan({etiket: o.soru, html: grup, sinif: o.sinif}) : grup; };

  // ---------- Ne Yedim? kamerası (eski adı Dada AI). Gastro DG.kamera işaretlemesi + mod şeridi ----------
  const kameraBtn = (eylem, ikon, aria, ek = '', sinif = '') => `<button class="gm-kamera-ibtn${sinif}" type="button" data-kamera="${eylem}" aria-label="${esc(aria)}"${ek}>${ik(ikon)}</button>`;
  // {baslik, onizleme|gorsel, belgeler:{menu,tahlil,barkod}, modlar, mod, yonerge, ipucu:{baslik,metin}, baglam, analiz, flas, durum:'canli'|'yukleniyor'}
  // Barkod vizörü de görsel + perde ile kurulur: düz koyu yüzey yok. data-kamera olayı: 'gm-kamera' {eylem: cek|galeri|cevir|flas|kapat}
  GM.kamera = (o = {}) => {
    const modlar = o.modlar || [], m = modlar.find(x => x.id === o.mod) || modlar[0] || {}, durum = o.durum || 'canli', barkod = m.id === 'barkod', foto = o.onizleme ?? o.gorsel;
    const ipucu = o.ipucu ? `<aside class="gm-kamera-ipucu"><div><b>${esc(o.ipucu.baslik)}</b>${kameraBtn('ipucu', 'kapat', 'İpucunu kapat')}</div><p>${esc(o.ipucu.metin)}</p></aside>` : '';
    const belgeler = Object.entries(o.belgeler || (o.belge ? {[m.id]: o.belge} : {})).map(([k, h]) => `<div class="gm-kamera-belge" data-belge="${esc(k)}">${h}</div>`).join('');
    return `<section class="${liste('gm-kamera', barkod && 'is-barkod', o.analiz && 'is-analiz', o.ornek && 'is-ornek')}" data-mod="${esc(m.id || 'tabak')}" aria-label="${esc(o.baslik || 'Kamera')}">${foto ? `<span class="gm-kamera-foto" style="background-image:url('${esc(foto)}')"></span>` : ''}<header class="gm-kamera-bas">${kameraBtn('kapat', 'kapat', 'Kapat')}<div>${o.baglam ? `<button type="button" class="gm-kamera-baglam" data-kamera="baglam">${esc(o.baglam)}${ik('ac')}</button>` : `<b>${esc(o.baslik || 'Ne Yedim?')}</b>`}</div>${kameraBtn('flas', 'bolt', 'Flaş aç / kapat', ` aria-pressed="${!!o.flas}"`)}</header><div class="gm-kamera-vizor" aria-hidden="true">${belgeler}<i class="gm-kamera-ag"></i><span></span><span></span><span></span><span></span>${barkod || o.tarama ? '<i class="gm-kamera-tarama"></i>' : ''}</div>${durum === 'yukleniyor' ? '<span class="gm-kamera-yukleniyor" role="status" aria-label="Kamera açılıyor"></span>' : ''}<div class="gm-kamera-alt"><p class="gm-kamera-yonerge" role="status">${esc(o.analiz || o.yonerge || m.ipucu || 'Çerçevenin içine al')}</p>${ipucu}<div class="gm-kamera-kontrol">${kameraBtn('galeri', 'galeri', 'Galeriden seç', '', ' gm-kamera-galeri')}<button class="gm-kamera-deklansor" type="button" data-kamera="cek" aria-label="Fotoğraf çek">${ik('kamera')}</button>${kameraBtn('mikrofon', 'mikrofon', 'Sesle anlat')}</div><div class="gm-kamera-modlar" role="tablist">${modlar.map(x => `<button type="button" role="tab" class="gm-kamera-mod" data-deger="${esc(x.id)}" data-ipucu="${esc(x.ipucu || '')}" aria-selected="${x.id === m.id}">${esc(x.ad)}</button>`).join('')}</div></div></section>`;
  };
  // İzin reddedildi sahnesi: Gastro kamera.izinSahne
  GM.kameraIzinSahne = (o = {}) => GM.durumSahne({tema: 'koyu', gorsel: o.gorsel, isaret: 'kamera', baslik: o.baslik || 'Kamera izni gerekli', metin: o.metin || 'Fotoğraf çekmek için **kamera izni** gerekir. **Galeriden de** seçebilirsin.', ana: {metin: 'Ayarları aç', ikon: 'ayar', attrs: 'data-izin-ayar'}, ikinciller: [{metin: 'Galeriden seç', ikon: 'galeri', attrs: 'data-kamera="galeri"'}], ipucuBaslik: 'Kamera iznini açmak için', ipucuParcali: true, ipuclari: [['ayar', 'Ayarlar’ı aç', 'Ayarlar’da Dada Diet’i bul.'], ['kamera', 'Kamerayı aç', 'Kamera iznini “İzin ver” yap.'], ['arrow-rotate-left', 'Uygulamaya dön', 'Kamera kendiliğinden açılır.']]});
  // Kâğıt önizleme: vizörde HTML kâğıt. tur menu | tahlil | barkod
  GM.belge = (o = {}) => (o.tur === 'barkod'
    ? `<div class="gm-belge is-barkod"><span class="gm-barkod-cubuk" aria-hidden="true">${[...String(o.ean || '8690000000012')].map((c, i) => `<i style="--g:${(+c % 3) + 1};--b:${((+c + i) % 2) + 1}"></i>`).join('').repeat(3)}</span><small>${esc(o.ean || '8690000000012')}</small></div>`
    : o.tur === 'tahlil'
      ? `<div class="gm-belge is-tahlil"><div class="gm-belge-bas"><b>${esc(o.baslik)}</b><small>${esc(o.alt || '')}</small></div><div class="gm-belge-tablo"><span>Test</span><span>Sonuç</span><span>Referans</span>${(o.satirlar || []).map(s => `<span>${esc(s.ad)}</span><b>${esc(s.deger)}</b><span>${esc(s.referans)}</span>`).join('')}</div></div>`
      : `<div class="gm-belge is-menu"><div class="gm-belge-bas"><b>${esc(o.baslik)}</b><small>${esc(o.alt || '')}</small></div>${(o.gruplar || []).map(g => `<div class="gm-belge-grup"><span class="gm-belge-grup-ad">${esc(g.ad)}</span>${g.satirlar.map(s => `<div class="gm-belge-satir"><span>${esc(s.ad)}</span><i></i><span>${esc(s.fiyat)}</span></div>`).join('')}</div>`).join('')}</div>`);
  GM.analizAdimlari = (o = {}) => GM.parcali((o.adimlar || []).map((a, i) => ({ikon: i < o.etkin ? 'onay' : i === o.etkin ? 'rotate-right' : 'circle', baslik: a, bilgi: true})));
  // Bbox: varsayılan yüzen hap etiket, çerçeve yalnız seçili halde. En çok etiketAdet hap, kalanı nokta. Etiket kenara itilir.
  const basHarfler = s => String(s).split(' ').map(k => k.charAt(0).toLocaleUpperCase('tr') + k.slice(1)).join(' ');
  GM.bbox = (o = {}) => {
    const l = (o.kutular || []).map(k => { const b = k.bbox || k; return {...k, b, cx: b.x + b.w / 2, cy: b.y + b.h / 2}; });
    const onde = [...l].sort((a, b) => (b.kcal || 0) - (a.kcal || 0)).slice(0, o.etiketAdet ?? 4).map(k => k.id);
    if (o.secili && !onde.includes(o.secili)) onde[onde.length - 1] = o.secili;
    // Sol ve sağ etiket aynı satıra düşmez: dar ekranda hap genişliği çakışmaya yol açar.
    const yerlestir = grup => { grup.sort((a, b) => a.cy - b.cy); let y = 6; grup.forEach(k => { k.ly = Math.max(k.cy, y); y = k.ly + 11; }); let t = 94; [...grup].reverse().forEach(k => { k.ly = Math.min(k.ly, t); t = k.ly - 11; }); grup.forEach(k => { const sol = k.cx < 50; k.lx = sol ? 3 : 97; k.yan = sol ? 'is-sol' : 'is-sag'; }); };
    const et = l.filter(k => onde.includes(k.id));
    yerlestir(et);
    const cizgi = et.map(k => `<line x1="${yuvarla(k.cx)}" y1="${yuvarla(k.cy)}" x2="${k.lx}" y2="${yuvarla(k.ly)}"/>`).join('');
    return `<div class="${liste('gm-bbox', o.sinif)}" data-ad="${esc(o.ad || 'bbox')}"><span class="gm-photo" style="background-image:url('${esc(o.gorsel)}')"></span><svg class="gm-bbox-cizgiler" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${cizgi}</svg>${l.map(k => `<div class="${liste('gm-bbox-oge', k.id === o.secili && 'is-secili', k.yan)}" style="--x:${k.b.x}%;--y:${k.b.y}%;--w:${k.b.w}%;--h:${k.b.h}%;--cx:${yuvarla(k.cx)}%;--cy:${yuvarla(k.cy)}%${k.lx != null ? `;--lx:${k.lx}%;--ly:${yuvarla(k.ly)}%` : ''}"><i class="gm-bbox-cerceve"></i><button type="button" class="gm-bbox-nokta" data-deger="${esc(k.id)}" aria-label="${esc(k.ad)}"><i></i></button>${k.lx != null ? `<button type="button" class="gm-bbox-et" data-deger="${esc(k.id)}" tabindex="-1">${esc(basHarfler(k.ad))}${k.kcal != null ? ` · <b>${sayi(k.kcal)} kcal</b>` : ''}</button>` : ''}</div>`).join('')}</div>`;
  };
  GM.guvenRozet = g => GM.durumRozet({metin: g >= 90 ? 'Eminim' : g >= 80 ? 'Büyük ihtimalle' : 'Kontrol et', ton: g >= 90 ? 'basari' : g >= 80 ? 'notr' : 'uyari', ikon: g >= 90 ? 'onay' : g >= 80 ? 'circle-info' : 'uyari'});
  GM.aiSatir = (b, o = {}) => GM.satir({sol: GM.gorsel({src: b.gorsel ?? null, ad: b.ad, ton: GM.makroTon(b)}), baslik: b.ad, alt: `${sayi(b.gram)} g · ${sayi(b.kcal)} kcal`, sag: `${GM.guvenRozet(b.guven)}${GM.ikonBtn({ikon: 'duzenle', etiket: `${b.ad} düzelt`, veri: {eylem: 'duzelt', id: b.id}})}`, ok: false, duz: true, sinif: liste('gm-ai-satir', o.secili && 'is-secili'), attrs: `data-ai-id="${esc(b.id)}"`});
  GM.varsayim = (o = {}) => `<button type="button" class="gm-veri-yok gm-varsayim"${at(o)}>${ik('bilgi')}<span>${vurgu(o.metin)}</span>${o.eylem ? `<b>${esc(o.eylem)}</b>` : ''}</button>`;
  // ---------- Tabağım: alt nav'ın üstünde yüzer kart + alttan açılan sayfa (GM.tabagim, gm-ui.js) ----------
  // Gastro menü tepsisinden (.bul-tepsi-ac, bul.js) türer: kart radius 24, sh-md, 12/16 iç boşluk. Görseller Gastro .dgu-medya gibi span + background-image cover.
  // Kapalı: üst üste en çok 3 yuvarlak görsel (+N rozeti), toplam kcal, enerji payına göre 3 renkli makro çubuğu ve gramlar, sağda "Öğüne ekle".
  // Sağ üst köşedeki çarpı kartı küçültür (öğeler silinmez): sağda, öğe sayısı rozetli yuvarlak tabak düğmesi kalır; dokununca kart geri açılır.
  // Dokununca GM.tabagim.ac() (data-tabagim-ac); "Öğüne ekle" GM.tabagim.kaydet() (data-tabagim-kaydet); çarpı data-tabagim-kucult, mini düğme data-tabagim-buyut. Boş tabakta çizilmez.
  const TABAK_MAKRO = [['P', 'protein', 'Protein', 4], ['K', 'karb', 'Karbonhidrat', 4], ['Y', 'yag', 'Yağ', 9]];
  const tabakFoto = x => (x.gorsel ? `<span class="gm-tabagim-foto" style="background-image:url('${esc(x.gorsel)}')"></span>` : `<span class="gm-tabagim-foto is-yok">${ik('tabak')}</span>`);
  GM.tabagimFotolar = l => `<span class="gm-tabagim-fotolar" aria-hidden="true">${l.slice(0, 3).map(tabakFoto).join('')}${l.length > 3 ? `<span class="gm-tabagim-fazla">+${l.length - 3}</span>` : ''}</span>`;
  // {P, K, Y} gram. Çubuk enerji payını (4/4/9 kcal) gösterir, altında gramlar.
  GM.tabagimMakro = (t, o = {}) => {
    const e = TABAK_MAKRO.map(([k, , , c]) => (t[k] || 0) * c), top = e.reduce((a, b) => a + b, 0);
    const aria = TABAK_MAKRO.map(([k, , ad]) => `${ad} ${sayi(t[k] || 0)} g`).join(', ');
    return `<span class="${liste('gm-tabagim-makro', o.genis && 'is-genis')}"><span class="gm-tabagim-cubuk" role="img" aria-label="${esc(aria)}">${top ? TABAK_MAKRO.map(([, ton], i) => `<i class="is-${ton}" style="--pay:${(e[i] / top).toFixed(3)}"></i>`).join('') : ''}</span><span class="gm-tabagim-gram" aria-hidden="true">${TABAK_MAKRO.map(([k, ton, ad], i) => (o.genis ? `<span class="is-${ton}"><b>${ad}</b><span>${sayi(t[k] || 0)} g</span></span>` : `<span class="is-${ton}"><b>${k}</b>${sayi(t[k] || 0)}${i === 2 ? ' g' : ''}</span>`)).join('')}</span></span>`;
  };
  GM.tabagimKcal = kcal => `<b class="gm-tabagim-kcal">${sayi(kcal)}<small>kcal</small></b>`;
  // {liste, toplam, eylem, ogun:{ad}, kucuk}. Eski çağrı {adet, kcal, ogeler} de çizilir.
  GM.tabagimBar = (o = {}) => {
    const l = o.liste || o.ogeler || [], t = o.toplam || {adet: o.adet ?? l.length, kcal: o.kcal ?? 0};
    if (!t.adet) return '';
    if (o.kucuk) return `<div class="gm-tabagim is-kucuk"><button type="button" class="gm-tabagim-mini" data-tabagim-buyut aria-label="Tabağımı göster: ${esc(t.adet)} öğe, ${sayi(t.kcal)} kcal">${ik('tabak')}<span class="gm-tabagim-mini-sayi" aria-hidden="true">${esc(t.adet)}</span></button></div>`;
    return `<div class="gm-tabagim"><div class="gm-tabagim-kart"><button type="button" class="gm-tabagim-ac" data-tabagim-ac aria-label="Tabağımı aç: ${esc(t.adet)} öğe, ${sayi(t.kcal)} kcal">${GM.tabagimFotolar(l)}<span class="gm-tabagim-ozet">${GM.tabagimKcal(t.kcal)}${GM.tabagimMakro(t)}</span></button>${GM.btn({metin: o.eylem || 'Öğüne ekle', boyut: 'sm', sinif: 'gm-tabagim-ekle', etiket: o.ogun ? `${o.eylem || 'Öğüne ekle'}: ${o.ogun.ad}` : undefined, veri: {'tabagim-kaydet': 1}})}<button type="button" class="gm-tabagim-kucult" data-tabagim-kucult aria-label="Tabağı küçült">${ik('kapat')}</button></div></div>`;
  };
  // Sayfa listesi: görsel, ad, porsiyon (adımlayıcı ×0,5), kcal; sola kaydırınca Sil (gm-eylem 'tabagim-sil'). Boşsa ekleme yolları.
  const porsiyonAlt = x => [x.miktar != null && !/^(g|gram)$/.test(x.birim || '') ? `${ondalik(x.miktar, 2)} ${x.birim || ''}`.trim() : '', x.gram ? `${sayi(x.gram)} g` : x.miktar != null ? `${sayi(x.miktar)} g` : ''].filter(Boolean).join(' · ');
  GM.besinSatirAlt = porsiyonAlt;
  GM.tabagimListe = l => (l.length
    ? `<div class="gm-tabagim-liste">${GM.satirlar(l.map(x => GM.besinSatir(x, {swipe: true, eylemler: [{eylem: 'tabagim-sil', ikon: 'sil', metin: 'Sil', ton: 'yikici'}], alt: porsiyonAlt(x), deger: null, ek: `<b class="gm-tabagim-oge-kcal">${sayi(x.kcal || 0)} kcal</b>`, sag: GM.stepper({ad: `tabagim-kat:${x.id}`, deger: x.kat || 1, min: .5, max: 10, adim: .5, aria: `${x.ad} porsiyon`})})))}<p class="gm-tabagim-ipucu">${ik('left-long')}<span>Çıkarmak için satırı sola kaydır</span></p></div>`
    : `<div class="gm-yigin">${GM.bos({ikon: 'tabak', baslik: 'Tabağın boş', metin: 'Ne yediğini fotoğraf, arama, barkod ya da sesle ekle; **hepsi burada birikir**.'})}${GM.satirlar([
      {ikon: 'kamera', baslik: 'Fotoğraf çek', alt: 'Tabağını tanıyalım', git: '#/ai/kamera'},
      {ikon: 'ara_', baslik: 'Besin ara', alt: 'Listeden seç', git: '#/besin-ara'},
      {ikon: 'barkod', baslik: 'Barkod tara', alt: 'Paketli ürün ekle', git: '#/ai/kamera?mod=barkod'},
      {ikon: 'mikrofon', baslik: 'Sesle anlat', alt: 'Ne yediğini söyle', git: '#/ai/ses'}
    ])}</div>`);
  // Öneri kartı: Gastro .gm-kart + .gm-eylem.is-secili dili; en uygun hali yeşil çerçeve.
  // Menü satırı sağı: tahmini kalori önde, puan altta.
  GM.menuDeger = (o = {}) => `<span class="gm-menu-deger"><b>≈ ${sayi(o.kcal)} kcal</b>${o.puan != null ? GM.skorRozet({skor: o.puan}) : ''}</span>`;
  GM.oneriKart = (o = {}) => `<article class="${liste('gm-kart gm-oneri', o.enUygun && 'is-en-uygun', o.sinif)}"><div class="gm-oneri-ust">${GM.gorsel({src: o.gorsel, ad: o.ad})}<div class="gm-satir-metin">${o.enUygun ? GM.durumRozet({metin: o.rozet || 'En uygun', ton: 'basari', ikon: 'onay'}) : ''}<span class="gm-t-card gm-kirp-2">${esc(o.ad)}</span>${o.makro ? '' : `<small>${esc([`${sayi(o.kcal)} kcal`, o.P != null ? `${sayi(o.P)} g protein` : ''].filter(Boolean).join(' · '))}</small>`}</div>${o.puan != null ? GM.skorRozet({skor: o.puan}) : ''}</div>${o.makro ? GM.ozetSerit([{ikon: 'kalori', etiket: 'Kalori', deger: sayi(o.kcal), birim: 'kcal'}, {ikon: 'protein', etiket: 'Protein', deger: sayi(o.P), birim: 'g'}, {ikon: 'karb', etiket: 'Karb.', deger: sayi(o.K), birim: 'g'}, {ikon: 'yag', etiket: 'Yağ', deger: sayi(o.Y), birim: 'g'}]) : ''}${o.gerekce ? GM.p(o.gerekce, {ton: 'ikincil', meta: true}) : ''}${o.uyari ? `<p class="gm-hata is-uyari">${ik('uyari')}${esc(o.uyari)}</p>` : ''}${o.eylem ? GM.btn({boyut: 'sm', tam: true, tur: o.enUygun ? 'primary' : 'secondary', ...o.eylem}) : ''}</article>`;

  // ---------- Ses ve sohbet ----------
  GM.sesDalga = (o = {}) => `<div class="${liste('gm-dalga', o.aktif !== false && 'is-aktif')}" aria-hidden="true">${Array.from({length: o.adet || 28}, (_, i) => `<i style="--i:${i};--h:${(.28 + .72 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * .6))).toFixed(2)}"></i>`).join('')}</div>`;
  GM.transkript = (o = {}) => GM.bilgi({etiket: o.etiket || 'Duyduğum', html: `<p>${vurgu(o.metin)}${o.canli ? '<i class="gm-imlec"></i>' : ''}</p>`});
  GM.sifreliRozet = (o = {}) => GM.durumRozet({metin: o.metin || 'Uçtan uca şifreli', ton: 'basari', ikon: 'sifreli'});
  GM.balon = (o = {}) => `<div class="gm-balon-kap is-${o.kim === 'ben' ? 'ben' : 'o'}">${o.kim !== 'ben' && o.harf ? GM.avatar({ad: o.harf, boyut: 20}) : ''}<div class="gm-balon"><p>${vurgu(o.metin)}</p>${o.ek ? `<span class="gm-balon-ek">${ik(o.ek.ikon || 'ek')}${esc(o.ek.ad || o.ek)}</span>` : ''}<time>${esc(o.saat || '')}${o.kim === 'ben' ? ik('check-double') : ''}</time></div></div>`;
  GM.gunAyrac = metin => `<div class="gm-gun-ayrac">${GM.rozet({metin, ton: 'notr'})}</div>`;
  // Mesaj yazma (modern sohbet kalıbı): solda yuvarlak ek düğmesi, ortada tek parça hap giriş (içinde mikrofon), yazınca mikrofonun yerine yuvarlak gönder. Üstte isteğe bağlı hazır mesaj çipleri.
  GM.mesajGiris = (o = {}) => `<div class="gm-bar gm-mesaj-bar">${o.oneriler?.length ? `<div class="gm-mesaj-oneri" aria-label="Hazır mesajlar">${o.oneriler.map(m => GM.cip({metin: m, kucuk: true, veri: {eylem: 'soru', soru: m}})).join('')}</div>` : ''}<form class="gm-mesaj" data-mesaj>${GM.ikonBtn({ikon: 'plus', etiket: 'Dosya ya da fotoğraf ekle', tur: 'tint', sinif: 'gm-mesaj-ek', veri: {eylem: 'ek'}})}<label class="gm-mesaj-kutu"><input name="${esc(o.ad || 'mesaj')}" placeholder="${esc(o.yer || 'Mesaj yaz')}" aria-label="${esc(o.yer || 'Mesaj yaz')}" autocomplete="off" enterkeyhint="send">${GM.ikonBtn({ikon: 'mikrofon', etiket: 'Sesli mesaj', sinif: 'gm-mesaj-ses', veri: {eylem: 'ses-mesaj'}})}</label>${GM.ikonBtn({ikon: 'gonder', etiket: 'Gönder', tur: 'dolu', tip: 'submit', sinif: 'gm-mesaj-gonder'})}</form></div>`;

  // ---------- Geri sayım, faz, kıyas ----------
  GM._geriSayimCiz = (el, s) => { s = Math.max(0, s); const v = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60]; el.querySelectorAll('[data-gs]').forEach((b, i) => { b.textContent = iki2(v[i]); }); };
  const iki2 = n => String(n).padStart(2, '0');
  // Yalnız randevu. İstatistik bandı dili.
  GM.geriSayim = (o = {}) => { const s = o.saniye || 0, v = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60], et = ['gün', 'saat', 'dk', 'sn']; return `<dl class="${liste('gm-istatistik gm-geri', o.sinif)}" data-sutun="4" ${o.canli === false ? '' : `data-c="geri" data-saniye="${s}" data-yon="-1"`} role="timer">${v.map((x, i) => `<div><dt>${et[i]}</dt><dd data-gs>${iki2(x)}</dd></div>`).join('')}</dl>`; };
  GM.fazCizelge = (o = {}) => { const ei = (o.fazlar || []).findIndex(f => f.id === o.etkin); return `<ol class="${liste('gm-faz', o.sinif)}">${(o.fazlar || []).map((f, i) => `<li class="${i < ei ? 'is-gecti' : i === ei ? 'is-etkin' : ''}"><span class="gm-faz-isaret">${ik(f.ikon)}</span><div class="gm-faz-metin"><div class="gm-ara"><span class="gm-t-card">${esc(f.ad)}</span><small>${esc(f.aralik)}</small></div>${i === ei ? GM.durumRozet({metin: 'Şu an buradasın', ton: 'basari', ikon: 'onay'}) : ''}<p class="gm-t-meta gm-ton-ikincil">${vurgu(i === ei && f.aciklama ? f.aciklama : f.kisa)}</p></div></li>`).join('')}</ol>`; };
  GM.kiyasTablo = (o = {}) => {
    // Ekranda görünen değerle (1 ondalık) karşılaştırılır: ikisi de 0 g ya da eşit görünüyorsa kazanan yok.
    const r1 = x => Math.round((+x || 0) * 10) / 10;
    const kazanan = s => { const a = r1(s.a), b = r1(s.b); if (!s.iyi || a === b) return ''; return (s.iyi === 'az') === (a < b) ? 'a' : 'b'; };
    const hucre = (s, k, t) => `<span class="${t === k ? 'is-kazanan' : ''}">${t === k ? ik('onay') : ''}<b>${ondalik(s[k], s.birim === 'kcal' ? 0 : 1)}</b> <small>${esc(s.birim || '')}</small></span>`;
    const bas = x => `<span class="gm-kiyas-bas">${GM.gorsel({src: x.gorsel ?? null, ad: x.ad, ton: GM.makroTon(x)})}<span class="gm-t-meta gm-kirp-2">${esc(x.ad)}</span></span>`;
    return `<div class="${liste('gm-kart gm-kiyas', o.sinif)}"><div class="gm-kiyas-ust">${bas(o.a)}${GM.ikonKutu({ikon: 'kiyas', boyut: 'sm', ton: 'notr'})}${bas(o.b)}</div><div class="gm-satirlar">${(o.satirlar || []).map(s => { const k = kazanan(s); return `<div class="gm-kiyas-satir">${hucre(s, 'a', k)}<em>${esc(s.ad)}</em>${hucre(s, 'b', k)}</div>`; }).join('')}</div></div>`;
  };

  // ---------- Ürün skoru, tahlil, paket ----------
  GM.skorRozet = (o = {}) => { const t = GM.skorTon(o.skor); return `<span class="${liste('gm-skor-rozet', `is-${t}`, o.buyuk && 'is-buyuk')}" aria-label="${esc(`${o.skor} / 100`)}"><b>${esc(o.skor)}</b><small>/100</small></span>`; };
  GM.skorKart = (o = {}) => { const t = GM.skorTon(o.skor); return `<${o.git ? 'button type="button"' : 'div'} class="${liste('gm-eylem gm-skor-kart', `is-${t}`, o.sinif)}"${at({git: o.git})}><span class="gm-eylem-ikon" aria-hidden="true">${ik(o.ikon || 'barkod')}</span><span class="gm-eylem-metin"><b>${esc(o.ad)}</b><small>${esc([o.kategori, o.etiket].filter(Boolean).join(' · '))}</small></span>${GM.skorRozet({skor: o.skor})}</${o.git ? 'button' : 'div'}>`; };
  GM.icerikUyari = (o = {}) => { const d = o.durum || 'notr'; return `<div class="gm-satir gm-icerik-uyari is-${d}"><span class="gm-satir-ikon">${ik({iyi: 'basari', dikkat: 'uyari', notr: 'circle-minus'}[d])}</span><span class="gm-satir-metin"><span>${esc(o.metin)}</span>${o.aciklama ? `<small>${esc(o.aciklama)}</small>` : ''}</span></div>`; };
  const referans = (r, v) => {
    const m = String(r).replace(/,/g, '.').match(/([\d.]+)\s*-\s*([\d.]+)/), lt = String(r).replace(/,/g, '.').match(/<\s*([\d.]+)/), gt = String(r).replace(/,/g, '.').match(/>\s*([\d.]+)/);
    let a, b;
    if (m) { a = +m[1]; b = +m[2]; } else if (lt) { a = 0; b = +lt[1]; } else if (gt) { a = +gt[1]; b = a * 2; } else return {sol: .25, gen: .5, nokta: .5};
    const min = Math.min(a - (b - a) * .5, v), max = Math.max(b + (b - a) * .5, v), o = x => (x - min) / (max - min || 1);
    return {sol: o(a), gen: o(b) - o(a), nokta: o(v)};
  };
  GM.tahlilSatir = (o = {}) => {
    const v = parseFloat(String(o.deger).replace(',', '.')), r = referans(o.referans, v), d = o.durum || 'normal', [et, ikon] = {normal: ['Normal', 'onay'], dusuk: ['Düşük', 'arrow-down'], yuksek: ['Yüksek', 'arrow-up']}[d];
    return `<div class="gm-tahlil is-${d}"><div class="gm-ara"><span>${esc(o.ad)}</span><b>${esc(typeof o.deger === 'number' ? ondalik(o.deger, 1) : o.deger)}${o.birim ? ` <small>${esc(o.birim)}</small>` : ''}</b></div><div class="gm-tahlil-yol" style="--sol:${r.sol.toFixed(3)};--gen:${r.gen.toFixed(3)};--nokta:${kisit(r.nokta, 0, 1).toFixed(3)}"><i class="gm-tahlil-aralik"></i><i class="gm-tahlil-nokta"></i></div><div class="gm-ara"><small class="gm-yardim">Referans ${esc(o.referans)}${o.birim ? ` ${esc(o.birim)}` : ''}</small>${GM.durumRozet({metin: et, ton: d === 'normal' ? 'basari' : 'uyari', ikon})}</div>${o.aciklama ? GM.p(o.aciklama, {ton: 'ikincil', meta: true}) : ''}</div>`;
  };
  // Paket: seçim kartı ailesi.
  GM.paketler = (o = {}) => `<div class="gm-secim-izgara is-tek gm-paketler" role="radiogroup" data-ad="${esc(o.ad || 'paket')}">${(o.ogeler || []).map(p => `<button type="button" class="gm-secim-kart is-metin gm-paket" role="radio" data-k="${esc(p.id)}" aria-checked="${p.id === o.secili}"><span class="gm-secim-metin"><b>${esc(p.ad)}</b><small>${esc(`${p.seans} görüşme · ${p.sure}`)}</small>${p.rozet ? GM.rozet({metin: p.rozet}) : ''}<b class="gm-paket-fiyat">${esc(GM.paraTL(p.fiyat))}</b><span class="gm-paket-kapsam">${(p.kapsam || []).map(k => `<small>${ik('onay')}${esc(k)}</small>`).join('')}</span></span><span class="gm-secim-kutu" aria-hidden="true"><span class="choice-mark">${ik('onay')}</span></span></button>`).join('')}</div>`;

  // ---------- Referans eklentileri ----------
  GM.icgoruKart = (o = {}) => `<div class="gm-yigin-8">${GM.ipucu({ikon: 'wand-magic-sparkles', html: `<b>${esc(o.baslik)}</b> ${vurgu(o.metin || '')}`})}${o.yanitlar ? `<div class="gm-sira">${o.yanitlar.map(y => GM.cip({kucuk: true, ...y})).join('')}</div>` : ''}</div>`;
  GM.soruCipleri = (o = {}) => `<div class="gm-serit">${(o.sorular || []).map(q => { const x = typeof q === 'string' ? {metin: q} : q; return GM.cip({...x, veri: {eylem: 'soru', soru: x.metin}}); }).join('')}</div>`;
  GM.tamamlanmaKart = (o = {}) => `<div class="gm-feature gm-tamam"><div class="gm-feature__media"><span class="gm-feature__visual"><span class="gm-photo" style="background-image:url('${esc(o.gorsel || 'assets/gorsel/hero/ritim-sakin.webp')}')"></span></span><span class="gm-feature__veil" aria-hidden="true"></span><div class="gm-feature__info"><div class="gm-card__text">${o.bas ? `<span class="gm-card__category">${esc(`${o.bas} - ${o.bit}`)}</span>` : ''}<h3 class="gm-card__title">${esc(o.baslik)}</h3></div>${o.alt ? `<div class="gm-author"><span class="gm-author__name">${esc(o.alt)}</span></div>` : ''}</div></div>${o.eylem ? GM.btn({tam: true, tur: 'tonal', ...o.eylem}) : ''}</div>`;
  // Zaman kartı: beyaz Gastro kartı içinde iki ikonlu satır (başlangıç → bitiş, aralarında kesik çizgi), sağda küçük ikincil düğme, altta tek satır not.
  // GM.zamanHucreler([{ikon, etiket, deger, alt, eylem ('Düzenle' varsayılan, false: yok), id}], {not}) — düğme data-eylem="zaman-duzenle" data-id.
  GM.zamanHucre = (o = {}) => `<li class="gm-zaman"><span class="gm-zaman-ikon" aria-hidden="true">${ik(o.ikon || 'saat')}</span><span class="gm-zaman-metin"><small>${esc(o.etiket)}</small><b>${esc(o.deger)}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span>${o.eylem === false ? '' : GM.btn({metin: o.eylem || 'Düzenle', tur: 'secondary', boyut: 'sm', etiket: `${o.etiket}: ${o.eylem || 'Düzenle'}`, veri: {eylem: 'zaman-duzenle', id: o.id || ''}})}</li>`;
  GM.zamanHucreler = (l, o = {}) => `<div class="gm-kart gm-zaman-kart"><ol class="gm-zaman-cizgi">${l.map(GM.zamanHucre).join('')}</ol>${o.not ? `<p class="gm-zaman-not">${ik('bilgi')}<span>${vurgu(o.not)}</span></p>` : ''}</div>`;
  GM.madde = (o = {}) => `<div class="gm-madde is-${o.tur || 'arti'}">${ik({arti: 'circle-plus', eksi: 'circle-minus', notr: 'circle'}[o.tur || 'arti'])}<span>${vurgu(o.metin)}</span></div>`;
  GM.etiketJeton = (o = {}) => GM.cip({metin: o.metin, kapat: true, kucuk: true, sinif: `gm-jeton is-${o.durum || 'notr'}`, veri: {eylem: 'jeton-sil', id: o.id ?? o.metin}});
  GM.randevuSatir = (o = {}) => `<${o.git ? 'button type="button"' : 'div'} class="gm-eylem gm-randevu"${at({git: o.git})}><span class="gm-eylem-ikon gm-randevu-tarih" aria-hidden="true"><b>${esc(o.gun)}</b><small>${esc(o.ay)}</small></span><span class="gm-eylem-metin"><b>${esc(o.baslik)}</b><small>${esc([o.saat, o.alt].filter(Boolean).join(' · '))}</small></span>${o.durum ? GM.durumRozet({metin: o.durum, ikon: 'saat'}) : ik('satirOk')}</${o.git ? 'button' : 'div'}>`;
  GM.belgeSatir = (o = {}) => GM.satir({ikon: o.ikon || 'tahlil', baslik: o.baslik, alt: [o.alt, o.tarih].filter(Boolean).join(' · '), git: o.git, veri: o.veri});
  GM.gizlilikBant = metin => GM.veriYok(metin || 'Bu dosyaya **yalnız sen ve diyetisyenin** erişebilir.');
  GM.slotlar = (o = {}) => `<div class="gm-yigin-12" data-cip-grup="tek" data-ad="${esc(o.ad || 'slot')}">${(o.gruplar || []).map(g => `<div class="gm-yigin-8"><span class="gm-yardim">${esc(g.ad)}</span><div class="gm-sira">${g.slotlar.map(s => GM.cip({metin: String(s.saat).replace(':', '.'), deger: s.saat, secili: s.saat === o.secili, pasif: s.pasif})).join('')}</div></div>`).join('')}</div>`;
  GM.pencereBant = (o = {}) => { const b = GM.saatDk(o.bas) / 1440, e = GM.saatDk(o.bit) / 1440, n = GM.saatDk(o.simdi || '12:00') / 1440; return `<${o.git ? 'button type="button"' : 'div'} class="gm-kart gm-pencere"${at({git: o.git})}>${o.baslik ? `<div class="gm-ara"><span>${esc(o.baslik)}</span><small class="gm-yardim">${esc(o.alt || '')}</small></div>` : ''}<div class="gm-pencere-yol" style="--b:${b.toFixed(4)};--e:${e.toFixed(4)};--n:${n.toFixed(4)}"><i class="gm-pencere-acik"></i><i class="gm-pencere-simdi"></i></div><div class="gm-pencere-et"><span>00</span><span style="--p:${b.toFixed(4)}">${esc(String(o.bas).replace(':', '.'))}</span><span style="--p:${e.toFixed(4)}">${esc(String(o.bit).replace(':', '.'))}</span><span>24</span></div></${o.git ? 'button' : 'div'}>`; };
  // İşaretlenebilir kalem: Gastro alışveriş listesi kalemi (ortak/sayfalar/profil.css .pf-kalem, Flutter DgCheckedItem). Tamamlanınca ad soluk ve üstü çizili; cizgi:false seçimde (öneri) çizgi yok.
  GM.gorevSatir = (o = {}) => `<li class="${liste('gm-kalem', o.tamam && 'is-tamam', o.cizgi === false && 'is-secim')}"><label class="gm-secim"><input type="checkbox" name="${esc(o.id || 'gorev')}" value="1"${o.tamam ? ' checked' : ''}${o.pasif ? ' disabled' : ''}><span class="gm-kalem-metin"><span class="gm-kalem-ad">${esc(o.baslik)}</span>${o.alt ? `<small class="gm-kalem-alt">${esc(o.alt)}</small>` : ''}</span></label>${o.sil ? GM.ikonBtn({ikon: 'sil', etiket: `${o.baslik} kaldır`, veri: {eylem: o.sil, id: o.id}}) : ''}</li>`;
  GM.gorevListe = (ogeler, o = {}) => `<ul class="${liste('gm-satirlar gm-kalemler', o.sinif)}"${o.etiket ? ` aria-label="${esc(o.etiket)}"` : ''}>${ogeler.map(x => GM.gorevSatir({cizgi: o.cizgi, ...x})).join('')}</ul>`;
  GM.modulListe = (o = {}) => `<div class="gm-yigin-8">${o.ozet ? `<span class="gm-yardim">${esc(o.ozet)}</span>` : ''}${GM.parcali((o.ogeler || []).map(m => ({ikon: m.durum === 'tamam' ? 'onay' : m.durum === 'kilitli' ? 'sifreli' : 'play', baslik: m.baslik, alt: m.alt, git: m.git, ana: m.durum === 'siradaki', pasif: m.durum === 'kilitli', bilgi: m.durum === 'kilitli'})))}</div>`;
  GM.uyumRozet = (o = {}) => GM.durumRozet({metin: `Sana uyumu %${o.oran}`, ikon: 'hedef', ton: o.oran >= 70 ? 'basari' : o.oran >= 40 ? 'uyari' : 'notr'});
  GM.yolculuk = (o = {}) => { const oran = kisit((o.bas - o.simdi) / ((o.bas - o.hedef) || 1), 0, 1); return GM.ilerleme({n: oran * 100, hedef: 100, etiket: o.etiket || 'Yolculuğun', deger: `${ondalik(o.simdi, 1)} / ${ondalik(o.hedef, 1)} ${o.birim || 'kg'}`}); };
  // Denge bileşen satırları: solda bileşen rengiyle tonlu yuvarlak ikon (protein, sebze, tahıl, yağ), sağda ad + puan, aynı renkte ilerleme, altında yorum; satırlar ince çizgiyle ayrılır.
  const DENGE_TON = {protein: 'protein', sebze: 'sebze', tahil: 'karb', karb: 'karb', yag: 'yag', lif: 'lif'};
  GM.dengeSatirlar = l => `<div class="gm-denge-satirlar">${(l || []).map(b => `<div class="gm-denge-oge is-${DENGE_TON[b.id] || 'sebze'}"><span class="gm-denge-ikon" aria-hidden="true">${ik(b.ikon || 'tabak')}</span><div class="gm-denge-govde"><div class="gm-denge-bas"><b>${esc(b.ad)}</b><span><b>${esc(b.puan)}</b> / ${esc(b.enCok)}</span></div>${GM.ilerleme({n: b.puan, hedef: b.enCok, etiket: `${b.ad}: ${b.puan} / ${b.enCok}`, satir: false})}${b.yorum ? `<small class="gm-yardim">${esc(b.yorum)}</small>` : ''}</div></div>`).join('')}</div>`;
  GM.fotoIzgara = l => `<div class="gm-izgara-3">${l.map(x => `<button type="button" class="gm-medya gm-foto-kare"${at(x)}><span class="gm-photo" style="background-image:url('${esc(x.gorsel)}')"></span>${x.saat ? `<span class="gm-meta">${esc(x.saat)}</span>` : ''}</button>`).join('')}</div>`;
})();
