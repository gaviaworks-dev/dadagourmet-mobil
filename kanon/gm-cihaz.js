/* Telefon özellikleri bileşenleri (E3 + W widget kataloğu): cihaz çerçevesi, kilit ekranı ve StandBy, canlı etkinlik, Dinamik Ada, durum çubuğu çipi,
 * ana ekran widget'ları, hızlı ayar kutucuğu, sesli komut ekranı (Siri / Gemini). Stil kanon/gm-cihaz.css; renkler kanon token'larından, koyu tema çerçeve içinde yerel değişkenlerle.
 * Marka logosu çizilmez (Apple/Google yok): çerçeve sade, durum simgeleri Font Awesome solid, uygulama simgesi Dada Diet'in kendi simgesi.
 *
 * Çerçeve ve sahne
 *   GM.telefonCerceve({platform:'ios'|'android', tema:'acik'|'koyu', icerik, saat, kilit:{tarih, satir, aksesuar:[html]}, durumCip, ada, adaMin, yatay, etkilesimli, cercevesiz, etiket, sinif})
 *     Tam telefon. kilit verilirse kilit ekranı başlığı (kilit simgesi, tarih, büyük saat; iOS'ta altta fener/kamera düğmeleri, Android'de parmak izi) çizilir;
 *     iOS'ta kilit.satir tarih satırındaki satır içi widget, kilit.aksesuar saatin altındaki widget sırası (GM.kilitWidget).
 *     iOS'ta Dinamik Ada (ada; adaMin verilirse ada bölünür, yanında minimal daire), Android'de kamera deliği. saat telefonun sistem saatidir (tr biçimi 17:10).
 *     yatay: StandBy (durum çubuğu yok, ada solda). etkilesimli: içinde dokunulabilir öğe var (role=group; yoksa role=img). durumCip: Android canlı çip (GM.durumCipi).
 *   GM.cihazKesit({platform, tema, saat, ada, adaMin, durumCip, icerik, etiket}) telefonun üst kesiti, altı solar.
 *   GM.anaEkran({widgetlar:[html], uygulama:{ad, gorsel}|false, simge, simgeler:[{ikon, renk}], dockSimgeler, tarih, ara, dock, pasif}) dört sütunlu simge ızgarası: widget hücre kaplar (küçük 2×2, orta 4×2, büyük 4×4),
 *     simgeler: markasız genel simge yerleri (cam kare + Font Awesome glifi, renk Diet token adı: primary, bilgi, karb, protein, lif, slate…),
 *     ardından uygulama simgesi ve simge sayısı kadar nötr simge yeri; iOS'ta Ara hapı (ara:false gizler), Android'de tarih satırı; dock: altta dört boş simge yeri;
 *     pasif: arka plan (inert, ekran okuyucudan gizli; Denetim Merkezi ve sesli komut altında).
 *   GM.telefonUygulama({rota, platform, baslik}) widget'a dokununca açılan uygulama: gerçek rota telefon ekranı ölçeğinde (iframe, dokunma kapalı).
 *   GM.telefonOlcek(kok) → durdur: kok altındaki uygulama ekranlarının ölçeğini (--tel-olcek) genişliğe göre tutar.
 * Canlı etkinlik
 *   GM.canliEtkinlik({platform, durum:'oruc'|'pencere'|'randevu', baslik, etiket, gecenSn, oran, kalanMetin, bas, bit, eylem, eylemKisa, eylemKod, eylemAc, kalanSn, kisi, harf, tur, saat, bitti, sureMetin})
 *     bitti: iOS bitiş içeriği (sayaç durur, sureMetin "8 sa" geçti; Ada'dan kalkar, kilit ekranında kısa süre kalır).
 *     iOS kilit ekranı Live Activity kartı ya da Android kalıcı bildirim (Android 16 Live Update). randevu: kalanSn geri sayar. eylem iOS'ta düğme olur (oruçta başlıkta kısa hap: eylemKisa;
 *     görüşmede tam genişlik; kart ≤ 160 pt):
 *     eylemKod verilirse data-wg-eylem, eylemAc verilirse uygulamayı açan data-wg-ac (ekran dinler); ikisi de yoksa yalnız görünüm.
 *   GM.dinamikAda({tur:'kompakt'|'genis'|'minimal', durum, ...canliEtkinlik alanları}) iOS Dinamik Ada içeriği (cihazKesit ada / adaMin).
 *     İki etkinlik aynı anda: ikisi de minimal (ada = bitişik minimal, adaMin = ayrık daire); ada kaymaz, sistem saati kesilmez.
 *   GM.durumCipi({durum, gecenSn, kalanSn}) Android durum çubuğu canlı çipi.
 * Widget: eski aile (GM.widget, GM.widgetKalori/Su/Oruc/Ogun/Diyetisyen, GM.widgetDugme) W2'de kaldırıldı; yerine Widget v2 (GM.wg*, aşağıda bölüm başında).
 *   GM.kilitWidget({tur:'daire'|'dikdortgen'|'satir', ikon, deger, oran, baslik, metin, sayac, alt, ac, aria}) iOS kilit ekranı widget'ı (tek renk; duvar:'gorsel'
 *     çerçevede kilit ekranı tonunda: iOS vibrant görünümü, uygulama rengi değil).
 * Kilit ekranı (W2; çerçeve: GM.telefonCerceve({duvar:'gorsel', sigdir:true, kilit:{tarih, satir, aksesuar, acik}}), acik: Face ID ile açılmış kilit simgesi)
 *   GM.canliOgunKarti({ogunler:[{id, ad, kcal, planKcal, durum:'dolu'|'bos'|'atlandi', oran, gorsel, ayir, siradaki, yeni, eylem:{kod, id}|{ac}}], kalan, oncekiKalan,
 *     seri:{sayi, bugun, yeni}, ac, acDugme (rota: başlıkta "Aç" hapı), alt, sinif}) kalan null: "Kalori hedefin yok" tek satır günlük öğün Live Activity kartı: kalan kalori (oncekiKalan verilirse sayı ondan akar: data-lo-eski/-yeni),
 *     seri alevi (bugün sayılmadıysa sönük), 4 öğün halkası (öğün rengi, illüstrasyon, "+" ya da onay); "+" = App Intent Button (data-wg-eylem + data-id).
 *   GM.canliOrucKarti({baslik, faz, kalanSn, kalanMetin, oran, bas, bit, isaretler:[0–1], eylem:{kod|ac, metin, aria}, bitti:{baslik, metin}, ac, sinif})
 *     oruç Live Activity kartı: kalan süre geri sayar, renkli ilerleme ve faz işaretleri, "Bitir".
 *   GM.canliIzinSatiri({uygulama, kapaniyor}) iOS'un ilk Canlı Etkinlik izin satırı (İzin Verme / İzin Ver → data-wg-izin="red"|"ver"); kartın alt'ına verilir.
 *   GM.kilitBildirim({ogeler:[{baslik, metin, zaman, ac, kisi:{harf}}], acik, yeni}) bildirim yığını (data-kb-yigin açar/kapar). GM.kilitAlt([html]) alt yarı yuvası.
 *   GM.telefonSigdir(kok) → durdur: is-sigdir çerçevelerinin yüksekliğini görünür alana göre tutar. GM.OGUN_GORSEL {kahvalti, ogle, aksam, ara} illüstrasyonlar.
 *   GM.standby({sol, sag}) StandBy'da iki widget (çerçeve yatay; gece kırmızı tonu çerçeve sinif 'is-gece').
 *   GM.hizliAyarlar({platform, saat, tarih, kutucuklar:[{ad, alt, ikon, hal:'aktif'|'pasif'|'kullanilamaz', eylem, ac, bizim, genis}]}) Android Hızlı Ayarlar paneli / iOS Denetim Merkezi.
 * Sesli komut
 *   GM.komutEkran({platform, komut, hal:'dinliyor'|'sonuc', sonuc, arka}) · GM.komutSonuc({ikon, ton, baslik, metin, deger, birim, oran, satirlar, alt})
 *   GM.komutOynat(el, sonuc) .gm-komut'u dinliyor → sonuç akışıyla yeniden oynatır (azHareket'te doğrudan sonuç); sonuç görününce sonuc() çağrılır (kaydı yazar); durdurma işlevi döner.
 * Sağlık bağlantısı (E1; E2 aynı pencereyi kullanır)
 *   GM.sistemIzinPenceresi({platform:'ios'|'android', servis:{ad, ikon}, uygulama:{ad, simge}, oku:[{id, ad, ikon, acik}], yaz:[...], yol, aciklama, bekle})
 *     → Promise<{izin:boolean, oku:{id:bool}, yaz:{id:bool}}>. Telefonun kendi sağlık izni sayfası (iOS Sağlık erişimi / Android Health Connect):
 *     nötr sistem yüzeyi, marka rengi ve marka logosu yok (uygulama simgesi Dada Diet'in kendi simgesi). Kapatma yok; İzin Verme ya da İzin Ver.
 *     iOS: üst çubukta İzin Verme / İzin Ver, gri gruplu zemin, "Tümünü Aç", yazma ve okuma grupları. Android: başlık soru cümlesi, "Tümüne izin ver" anahtarı,
 *     okuma ve yazma grupları, altta İzin verme / İzin ver. Hiçbir tür açık değilken İzin Ver pasif. bekle (ms): İzin Ver'de dönen halka, sonra kapanır.
 *     Sayfa değişip pencere kapanırsa {izin:false} döner.
 *   GM.cihazIzinAdim({gorsel, ikon, ton, baslik, metin, maddeler, ek, adim, toplam}) GM.izinIstemi gövdesi + servis tonu (ton: GM.ikonKutu tonu; rozet ve madde ikonları
 *     o tonda) + ek html (bağlantı, akordiyon) + isteğe bağlı adım göstergesi. Alt çubuk ekranın (GM.altEylem).
 *   GM.cihazBasari({baslik, metin, maddeler:[[ikon, baslik, alt]], ana, ikinciller, ipucuBaslik}) başarı sahnesi: GM.durumSahne onay rozeti yayla belirir,
 *     onay işareti ardından gelir, maddeler sırayla belirir (gm-hareket gm-dol / gm-sira-gir; azHareket'te anlık).
 *   GM.cihazYonlar({ad, yonler:[{yon:'oku'|'yaz', secili, etiket, pasif}]}) satır sonu yön ikonu + anahtar çifti (↓ okunur, ↑ yazılır); anahtar adı `${ad}-${yon}`,
 *     gm-degisim olayı GM.anahtar'ınki. GM.cihazYonAciklama({gelen, giden}) yön ikonlarının tek satırlık açıklaması.
 *   .gm-cdonen (GM.btn sinif): düğme ikonu döner ("Eşitleniyor…"); pasif halde soluklaşmaz.
 * Yardımcılar
 *   GM.cihazHalka({tur:'kalori'|'su'|'oruc'|'pencere'|'kilit', oran, boyut:'xs'|'sm'|'md'|'lg'|'kw', orta, aria, ustunde}) halka (kalori 270° açık yay = GM.halka; oruç geçişi = GM.orucSayac renkleri)
 *   GM.cihazCubuk({tur, oran}) ince ilerleme çubuğu · GM.cihazSayac(sn, {bicim:'tam'|'kisa'}) saniye saniye akan süre · GM.cihazGeriSayac(sn, {bicim:'dk'}) geri sayım · GM.cihazAdimlar([metin]) numaralı adımlar (**vurgu**)
 */
(() => {
  const GM = window.GM, {esc, ik, vurgu, sayi, kisit, sure} = GM;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const SIMGE = 'assets/marka/ikon-512.png';
  const iki = n => String(n).padStart(2, '0');

  // ---------- Süre: ileri (geçen) ya da geri (kalan) saniye saniye akar; başlangıç damgası, kayma yok ----------
  const sureMetin = (sn, bicim) => {
    sn = Math.max(0, Math.floor(sn));
    const s = Math.floor(sn / 3600), d = Math.floor(sn / 60) % 60;
    // kisa ve dk: sistem sayacı gibi; bir saatin altında dakika:saniye (0:42, 12:05), üstünde saat:dakika:saniye (3:10:22). İlk dakikada da akar.
    if (bicim === 'dakika') return String(Math.ceil(sn / 60));   // minimal ada: kalan dakika
    if (bicim === 'sa') { const t = Math.ceil(sn / 60); return `${Math.floor(t / 60)}:${iki(t % 60)}`; }   // küçük halka: saat:dakika
    if (bicim === 'kisa' || bicim === 'dk') return s ? `${s}:${iki(d)}:${iki(sn % 60)}` : `${d}:${iki(sn % 60)}`;
    return `${iki(s)}:${iki(d)}:${iki(sn % 60)}`;
  };
  GM.cihazSayac = (sn = 0, o = {}) => `<span class="gm-csayac" data-cihaz-sayac="${Math.round(Date.now() - sn * 1000)}" data-bicim="${o.bicim || 'tam'}">${sureMetin(sn, o.bicim)}</span>`;
  GM.cihazGeriSayac = (sn = 0, o = {}) => `<span class="gm-csayac" data-cihaz-geri="${Math.round(Date.now() + sn * 1000)}" data-bicim="${o.bicim || 'dk'}">${sureMetin(sn, o.bicim || 'dk')}</span>`;
  setInterval(() => {
    if (document.hidden) return;
    document.querySelectorAll('[data-cihaz-sayac],[data-cihaz-geri]').forEach(el => {
      if (el.closest('.is-gizli')) return;
      const sn = el.dataset.cihazGeri ? Math.ceil((+el.dataset.cihazGeri - Date.now()) / 1000) : (Date.now() - +el.dataset.cihazSayac) / 1000;
      const m = sureMetin(sn, el.dataset.bicim);
      if (el.textContent !== m) el.textContent = m;
    });
  }, 1000);

  // ---------- Halka ve çubuk ----------
  GM.cihazHalka = (o = {}) => {
    const tur = o.tur || 'kalori', yay = tur === 'kalori', oran = kisit(o.oran || 0, 0, 1);
    const stil = `--cih-o:${oran.toFixed(3)};--bas:${yay ? 225 : 0}deg;--aci:${yay ? 270 : 360}deg`;
    return `<span class="${liste('gm-chalka', `is-${tur}`, `is-${o.boyut || 'sm'}`, o.ustunde && 'is-ustunde', o.sinif)}" style="${stil}"${o.aria ? ` role="img" aria-label="${esc(o.aria)}"` : ' aria-hidden="true"'}><span class="gm-chalka-iz"></span>${yay ? '<span class="gm-chalka-izuc is-bas"></span><span class="gm-chalka-izuc is-son"></span>' : ''}${oran > 0 ? '<span class="gm-chalka-yay"></span><span class="gm-chalka-uc is-bas"></span><span class="gm-chalka-uc is-son"></span>' : ''}${o.orta ? `<span class="gm-chalka-orta">${o.orta}</span>` : ''}</span>`;
  };
  GM.cihazCubuk = (o = {}) => `<span class="${liste('gm-ccubuk', `is-${o.tur || 'oruc'}`)}" style="--cih-o:${kisit(o.oran || 0, 0, 1).toFixed(3)}" aria-hidden="true"><i></i></span>`;
  const RITIM_IKON = {oruc: 'hourglass-half', pencere: 'utensils', randevu: 'video'};

  // ---------- Çerçeve ----------
  const simgeler = p => `<span class="gm-tel-simgeler" aria-hidden="true">${p === 'ios' ? ik('signal') + ik('wifi') : ik('wifi') + ik('signal')}${ik('battery-three-quarters')}</span>`;
  const durumCubugu = o => `<div class="gm-tel-durum"><span class="gm-tel-durum-sol">${o.kilit ? '' : `<b>${esc(o.saat || '')}</b>`}${o.durumCip || ''}</span>${simgeler(o.platform)}</div>`;
  // iOS kilit ekranı: tarih satırında satır içi widget (accessoryInline), saatin altında en fazla dört yuvalık widget sırası (daire 1, dikdörtgen 2 yuva).
  const kilitBas = o => o.platform === 'ios'
    ? `<div class="gm-tel-kilit"><span class="gm-tel-kilit-ikon" aria-hidden="true">${ik(o.kilit.acik ? 'lock-open' : 'lock')}</span><small>${esc(o.kilit.tarih || '')}${o.kilit.satir ? `<span class="gm-tel-kilit-satir">${o.kilit.satir}</span>` : ''}</small><b>${esc(o.saat || '')}</b>${o.kilit.aksesuar?.length ? `<span class="gm-tel-kilit-aks">${o.kilit.aksesuar.join('')}</span>` : ''}</div>`
    : `<div class="gm-tel-kilit"><b>${esc(o.saat || '')}</b><small>${esc(o.kilit.tarih || '')}</small></div>`;
  // El feneri (iOS kilit ekranı sol alt denetimi): Font Awesome Free'de fener yok; kanon glifi, renk currentColor.
  const FENER = '<svg class="gm-tel-fener" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M8.2 2h7.6A1.2 1.2 0 0 1 17 3.2V6l-2 4v10.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 20.5V10L7 6V3.2A1.2 1.2 0 0 1 8.2 2zM7.6 5.1h8.8v1.1H7.6zM12 12.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 1 0 0-2.6z"/></svg>';
  const tepe = o => (o.platform === 'ios' ? `<span class="${liste('gm-tel-ada', o.adaMin && 'is-bolunmus')}">${o.ada || ''}</span>${o.adaMin ? `<span class="gm-tel-ada-min">${o.adaMin}</span>` : ''}` : '<span class="gm-tel-delik"></span>');
  // duvar:'gorsel' gerçek duvar kâğıdı (assets/gorsel/telefon, temaya göre) ve kilit ekranı tonu; sigdir: telefonun tamamı görünür alana sığar (GM.telefonSigdir).
  // cercevesiz: telefonun kendisi zaten dışarıda çiziliyorsa (karar sayfası iPhone çerçevesi + iframe) çerçeve yok, ekran tam yükseklik (100svh).
  const kok = (o, ek) => liste('gm-tel', `is-${o.platform || 'ios'}`, `is-${o.tema || 'acik'}`, o.yatay && 'is-yatay', o.duvar === 'gorsel' && 'is-duvar-gorsel', o.sigdir && !o.cercevesiz && 'is-sigdir', o.cercevesiz && 'is-cercevesiz', ek, o.sinif);
  // etkilesimli: içinde dokunulabilir widget ya da kutucuk varsa çerçeve resim değil gruptur (role=group); yoksa role=img.
  const rol = o => (o.etkilesimli ? 'role="group"' : 'role="img"');
  GM.telefonCerceve = (o = {}) => {
    const p = o.platform || 'ios';
    // Yatay (StandBy): durum çubuğu ve alt çubuk yok, ada solda dikey.
    if (o.yatay) return `<figure class="${kok({...o, platform: p})}" ${rol(o)} aria-label="${esc(o.etiket || '')}"><div class="gm-tel-govde"><div class="gm-tel-ekran"><span class="gm-tel-ada is-dikey"></span><div class="gm-tel-icerik">${o.icerik || ''}</div></div></div></figure>`;
    return `<figure class="${kok({...o, platform: p})}" ${rol(o)} aria-label="${esc(o.etiket || '')}"><div class="gm-tel-govde"><div class="gm-tel-ekran"><span class="gm-tel-duvar"></span>${tepe({...o, platform: p})}${durumCubugu({...o, platform: p})}<div class="${liste('gm-tel-icerik', o.kilit && 'is-kilit')}">${o.kilit ? kilitBas({...o, platform: p}) : ''}${o.icerik || ''}</div>${o.kilit && p === 'android' ? `<span class="gm-tel-parmak" aria-hidden="true">${ik('fingerprint')}</span>` : ''}${o.kilit && p === 'ios' ? `<span class="gm-tel-kilit-dugmeler" aria-hidden="true"><span>${FENER}</span><span>${ik('camera')}</span></span>` : ''}<span class="gm-tel-cubuk"></span></div></div></figure>`;
  };
  GM.cihazKesit = (o = {}) => {
    const p = o.platform || 'ios';
    return `<figure class="${kok({...o, platform: p}, 'is-kesit')}" ${rol(o)} aria-label="${esc(o.etiket || '')}"><div class="gm-tel-govde"><div class="gm-tel-ekran"><span class="gm-tel-duvar"></span>${tepe({...o, platform: p})}${durumCubugu({...o, platform: p})}${o.icerik ? `<div class="gm-tel-icerik">${o.icerik}</div>` : ''}</div></div></figure>`;
  };
  // Ana ekran: dört sütunlu simge ızgarası. Widget hücre kaplar (küçük 2×2, orta 4×2, büyük 4×4); boş hücrelere uygulama simgesi ve
  // nötr simge yerleri gelir (başka uygulamanın logosu çizilmez). simge: boş simge yeri sayısı.
  GM.anaEkran = (o = {}) => `<div class="${liste('gm-tel-ana', o.sinif)}"${o.pasif ? ' inert aria-hidden="true"' : ''}>${o.tarih ? `<p class="gm-tel-gun">${esc(o.tarih)}</p>` : ''}<div class="gm-tel-izgara">${(o.widgetlar || []).join('')}${o.uygulama === false ? '' : `<span class="gm-tel-uyg"><img src="${esc(o.uygulama?.gorsel || SIMGE)}" alt=""><small>${esc(o.uygulama?.ad || 'Dada Diet')}</small></span>`}${'<span class="gm-tel-uyg is-bos" aria-hidden="true"><i></i></span>'.repeat(o.simge || 0)}${(o.simgeler || []).map(x => `<span class="gm-tel-uyg is-simge" aria-hidden="true"><i style="--sg:var(--gm-${esc(x.renk || 'slate')})">${ik(x.ikon)}</i>${x.ad ? `<small>${esc(x.ad)}</small>` : ''}</span>`).join('')}</div>${o.ara === false ? '' : `<span class="gm-tel-ara" aria-hidden="true">${ik('magnifying-glass')}<span>Ara</span></span>`}${o.dock ? `<span class="${liste('gm-tel-dock', o.dockSimgeler && 'is-simgeli')}" aria-hidden="true">${o.dockSimgeler ? o.dockSimgeler.map(x => `<span class="gm-tel-uyg is-simge"><i style="--sg:var(--gm-${esc(x.renk || 'slate')})">${ik(x.ikon)}</i></span>`).join('') : '<i></i>'.repeat(4)}</span>` : ''}</div>`;
  // Widget'a dokununca açılan uygulama: hedef rotanın kendisi, telefon ekranı ölçeğinde (iframe; dokunma kapalı). Ölçek GM.telefonOlcek ile.
  GM.telefonUygulama = (o = {}) => `<div class="gm-tel-uygulama" data-tel-uyg="${o.platform === 'android' ? 412 : 393}"><iframe src="index.html${esc(o.rota || '#/bugun')}" title="${esc(o.baslik || 'Dada Diet')}" tabindex="-1" aria-hidden="true"></iframe></div>`;
  GM.telefonOlcek = kok => {
    const ayarla = el => { const g = el.offsetWidth;   // dönüşümden bağımsız yerleşim genişliği (açılış animasyonu ölçeği karıştırmaz)
      if (g) el.style.setProperty('--tel-olcek', (g / +el.dataset.telUyg).toFixed(4)); };
    const ro = new ResizeObserver(l => l.forEach(x => ayarla(x.target)));
    const bagla = () => kok.querySelectorAll('[data-tel-uyg]').forEach(el => { if (el.dataset.olcekli) return; el.dataset.olcekli = '1'; ayarla(el); ro.observe(el); });
    const mo = new MutationObserver(bagla);
    mo.observe(kok, {childList: true, subtree: true});
    bagla();
    return () => { ro.disconnect(); mo.disconnect(); };
  };
  // Telefonun tamamı görünür alana sığsın (kaydırmadan): .gm-tel.is-sigdir için kaydırma alanındaki konumundan kalan yüksekliği --tel-yuk olarak yazar;
  // genişlik CSS'te bu yükseklikten (9:19,5) hesaplanır. Çok kısa pencerede alt sınır 520 (telefon okunaksız küçülmez). Durdurma işlevi döner.
  GM.telefonSigdir = kok => {
    const pay = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gm-s-12')) || 12;
    const ayarla = () => kok.querySelectorAll('.gm-tel.is-sigdir').forEach(el => {
      const sc = el.closest('[data-scroll]'), r = el.getBoundingClientRect();
      const ustY = sc ? r.top - sc.getBoundingClientRect().top + sc.scrollTop : r.top + scrollY, gorH = sc ? sc.clientHeight : innerHeight;
      const yuk = `${Math.round(Math.max(gorH - ustY - pay(), 520))}px`;
      if (el.style.getPropertyValue('--tel-yuk') !== yuk) el.style.setProperty('--tel-yuk', yuk);
    });
    const sc = kok.querySelector('[data-scroll]') || kok.closest('[data-scroll]');
    const ro = new ResizeObserver(ayarla);
    if (sc) ro.observe(sc);
    const mo = new MutationObserver(ayarla);
    mo.observe(kok, {childList: true, subtree: true});
    addEventListener('resize', ayarla);
    ayarla();
    return () => { ro.disconnect(); mo.disconnect(); removeEventListener('resize', ayarla); };
  };

  // ---------- Canlı etkinlik ----------
  // durum: 'oruc'|'pencere' (Ritim sayacı) ya da 'randevu' (diyetisyen görüşmesi: kalanSn geri sayar, kisi, harf, eylem düğmesi).
  // Android bildirim eylemi (yalnız asıl eylem; bildirime dokunmak uygulamayı zaten açar). Dokunma hedefi 48 dp.
  const canliEylem = o => (!o.eylem ? '' : o.eylemKod || o.eylemAc
    ? `<button type="button"${o.eylemKod ? ` data-wg-eylem="${esc(o.eylemKod)}"` : ` data-wg-ac="${esc(o.eylemAc)}"`}>${esc(o.eylem)}</button>` : `<span>${esc(o.eylem)}</span>`);
  // W2: yalnız Android kalıcı bildirimi kaldı (görüşme; oruç ve günlük kart için GM.androidCanli). iPhone kilit ekranı kartları: GM.canliOgunKarti, GM.canliOrucKarti, GM.canliRandevuKarti.
  GM.canliEtkinlik = (o = {}) => {
    if (o.durum === 'rota') return GM.androidCanli({...o, tur: 'rota'});   // rota türü: Dada Route Co-Pilot (aşağıda, Gourmet bloğu)
    const d = o.durum || 'oruc', yuzde = Math.round(kisit(o.oran || 0, 0, 1) * 100), randevu = d === 'randevu';
    return `<div class="${liste('gm-canli', 'is-android', `is-${d}`)}">
        <div class="gm-canli-ust"><span class="gm-canli-glif" aria-hidden="true">${ik(RITIM_IKON[d])}</span><span>Dada Diet</span><span aria-hidden="true">·</span><span>${esc(o.etiket || 'Ritim')}</span><span aria-hidden="true">·</span>${randevu ? GM.cihazGeriSayac(o.kalanSn) : GM.cihazSayac(o.gecenSn)}</div>
        <div class="gm-canli-govde"><div class="gm-canli-metin"><b>${esc(o.baslik)}</b><small>${esc(randevu ? `${o.kisi || ''} · ${o.saat || ''}` : `${o.kalanMetin}${yuzde ? ` · %${yuzde}` : ''} · bitiş ${o.bit || ''}`)}</small></div><img src="${SIMGE}" alt=""></div>
        ${randevu ? '' : GM.cihazCubuk({tur: d, oran: o.oran})}
        ${o.eylem ? `<div class="gm-canli-eylemler">${canliEylem(o)}</div>` : ''}
      </div>`;
  };

  // Dinamik Ada: kompakt (tek etkinlik: adanın iki yanı), genis (basılı tutunca), minimal (iki etkinlik: ikisi de minimal; biri adaya bitişik
  // (cihazKesit ada + adaMin ile ada hafif genişler), öteki ayrık daire). Minimal canlı bilgi taşır: oruçta halka, görüşmede kalan dakika.
  GM.dinamikAda = (o = {}) => {
    if (o.durum === 'rota') return GM.adaV2({...o, etkinlik: 'rota'});
    const d = o.durum || 'oruc', randevu = d === 'randevu';
    const sol = randevu ? `<span class="gm-ada-kisi">${esc(o.harf || '')}</span>` : GM.cihazHalka({tur: d, oran: o.oran, boyut: 'xs'});
    if (o.tur === 'minimal') return `<span class="${liste('gm-ada', 'is-minimal', `is-${d}`)}">${randevu ? `<b>${GM.cihazGeriSayac(o.kalanSn, {bicim: 'dakika'})}</b>` : GM.cihazHalka({tur: d, oran: o.oran, boyut: 'xs', orta: ''})}</span>`;
    if (o.tur === 'genis') {
      if (randevu) return `<span class="${liste('gm-ada', 'is-genis', 'is-randevu')}"><span class="gm-ada-ust"><span class="gm-ada-kisi is-buyuk">${esc(o.harf || '')}</span><i></i>${GM.cihazGeriSayac(o.kalanSn)}</span><span class="gm-ada-metin"><b>${esc(o.baslik)}</b><small>${esc(o.kisi || '')} · ${esc(o.saat || '')}</small></span>${o.eylem ? `<button type="button" class="gm-ada-dugme"${o.eylemAc ? ` data-wg-ac="${esc(o.eylemAc)}"` : o.eylemKod ? ` data-wg-eylem="${esc(o.eylemKod)}"` : ' disabled'}>${ik('video')}<span>${esc(o.eylem)}</span></button>` : ''}</span>`;
      // Üst satır kameranın iki yanına ayrılır (solda halka, sağda sayaç, ortası kamera); başlık ve kalan kameranın altında başlar.
      return `<span class="${liste('gm-ada', 'is-genis', `is-${d}`)}"><span class="gm-ada-ust">${GM.cihazHalka({tur: d, oran: o.oran, boyut: 'sm', orta: ik(RITIM_IKON[d])})}<i></i>${GM.cihazSayac(o.gecenSn)}</span><span class="gm-ada-metin"><b>${esc(o.baslik)}</b><small>${esc(o.kalanMetin)}</small></span>${GM.cihazCubuk({tur: d, oran: o.oran})}<span class="gm-ada-alt"><span>${esc(o.bas)}</span><span>${esc(o.bit)}</span></span></span>`;
    }
    return `<span class="${liste('gm-ada', 'is-kompakt', `is-${d}`)}">${sol}<i></i>${randevu ? GM.cihazGeriSayac(o.kalanSn) : GM.cihazSayac(o.gecenSn, {bicim: 'kisa'})}</span>`;
  };
  // Android durum çubuğu canlı çipi (Android 16 Live Updates; kısa metin): oruçta geçen süre, randevuda kalan süre.
  GM.durumCipi = (o = {}) => o.durum === 'rota' ? GM.androidCip({...o, tur: 'rota'}) : `<span class="${liste('gm-tel-cip', `is-${o.durum || 'oruc'}`)}">${ik(RITIM_IKON[o.durum || 'oruc'])}${o.durum === 'randevu' ? GM.cihazGeriSayac(o.kalanSn) : GM.cihazSayac(o.gecenSn, {bicim: 'kisa'})}</span>`;

  // ---------- Kilit ekranı widget'ları (iOS accessory; tek renk, kilit ekranı yazı rengine uyar) ----------
  // tur: 'daire' (accessoryCircular: halka + ikon + değer), 'dikdortgen' (accessoryRectangular: başlık, metin, isteğe bağlı çubuk), 'satir' (accessoryInline: tarih satırında ikon + kısa metin).
  // iOS 17+ accessory widget'lar Button taşıyabilir; bu katalogda kilit ekranı widget'ları bilgi gösterir, dokunmak uygulamayı açar (ac).
  GM.kilitWidget = (o = {}) => {
    const t = o.tur || 'daire', ac = o.ac ? ` data-wg-ac="${esc(o.ac)}"` : '';
    if (t === 'satir') return `<button type="button" class="gm-kw is-satir"${ac} aria-label="${esc(o.aria || o.metin)}">${ik(o.ikon)}<span>${esc(o.metin)}</span></button>`;
    if (t === 'dikdortgen') return `<button type="button" class="gm-kw is-dikdortgen"${ac} aria-label="${esc(o.aria || `${o.baslik}, ${o.metin}`)}"><b>${ik(o.ikon)}<span>${esc(o.baslik)}</span></b><span>${o.sayac || esc(o.metin)}</span>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}${o.oran != null ? `<span class="gm-kw-cubuk" style="--cih-o:${kisit(o.oran, 0, 1).toFixed(3)}"><i></i></span>` : ''}</button>`;
    return `<button type="button" class="gm-kw is-daire"${ac} aria-label="${esc(o.aria || o.deger)}">${GM.cihazHalka({tur: 'kilit', oran: o.oran ?? 0, boyut: 'kw', orta: `${ik(o.ikon)}<b>${esc(o.deger)}</b>`})}</button>`;
  };

  // ---------- Kilit ekranı (W2): Canlı Etkinlik kartları, izin satırı, bildirim yığını ----------
  // Kartlar iOS 17+ Live Activity kilit ekranı sunumudur (≤ 160 pt). Düğmeler App Intent Button karşılığı: data-wg-eylem (+ data-id) kaydı yazar,
  // data-wg-ac uygulamayı açar; kartın kendisine dokunmak (widgetURL) uygulamayı açar. Görseller assets/gorsel/telefon (Higgsfield, metinsiz).
  const TG = 'assets/gorsel/telefon/';
  GM.OGUN_GORSEL = {kahvalti: `${TG}kahve.webp`, ogle: `${TG}corba.webp`, aksam: `${TG}salata.webp`, ara: `${TG}elma.webp`};
  const ALEV = `${TG}alev.webp`;
  const lacKapak = (ac, etiket) => (ac ? `<button type="button" class="gm-lac-ac" data-wg-ac="${esc(ac)}" aria-label="${esc(etiket)}"></button>` : '');
  const lacMarka = (ikon, metin) => `<span class="gm-lac-marka"><span class="gm-lac-glif" aria-hidden="true">${ik(ikon)}</span><span>${esc(metin)}</span></span>`;
  // Öğün halkası: renk öğünün (is-<id>), oran yenen/planlı (dolu = 1). eylem {kod, id} kaydı yazar, {ac} uygulamayı açar (misafir: plan öğünü yok, ne yediğini uygulamada ekler).
  const ogunHalka = x => {
    const dolu = x.durum === 'dolu', atlandi = x.durum === 'atlandi', oran = kisit(dolu ? x.oran ?? 1 : 0, 0, 1);
    const ic = `<span class="gm-lo-halka" aria-hidden="true"><span class="gm-lo-iz"></span>${oran > 0 ? '<span class="gm-lo-yay"></span>' : ''}<img src="${esc(x.gorsel || GM.OGUN_GORSEL[x.id] || GM.OGUN_GORSEL.ara)}" alt=""><span class="gm-lo-rozet">${ik(dolu ? 'check' : atlandi ? 'minus' : 'plus')}</span></span><b>${esc(x.ad)}</b><small>${atlandi ? 'Atlandı' : `${sayi(dolu ? x.kcal || 0 : 0)} kcal`}</small>`;
    const sinif = liste('gm-lo-ogun', `is-${x.id}`, dolu && 'is-dolu', atlandi && 'is-atlandi', x.siradaki && 'is-siradaki', x.ayir && 'is-ayrik', x.yeni && 'is-yeni');
    const stil = `style="--cih-o:${oran.toFixed(3)}"`;
    if (!dolu && !atlandi && x.eylem?.kod) return `<button type="button" class="${sinif}" ${stil} data-wg-eylem="${esc(x.eylem.kod)}" data-id="${esc(x.eylem.id || x.id)}" aria-label="${esc(`${x.ad} ekle${x.planKcal ? `, ${sayi(x.planKcal)} kcal` : ''}${x.siradaki ? ', sıradaki öğün' : ''}`)}">${ic}</button>`;
    if (!dolu && !atlandi && x.eylem?.ac) return `<button type="button" class="${sinif}" ${stil} data-wg-ac="${esc(x.eylem.ac)}" aria-label="${esc(`${x.ad} ekle, Dada Diet’te açılır`)}">${ic}</button>`;
    return `<span class="${sinif}" ${stil} role="img" aria-label="${esc(`${x.ad}: ${dolu ? `kaydedildi, ${sayi(x.kcal || 0)} kcal` : atlandi ? 'atlandı' : 'henüz eklenmedi'}`)}">${ic}</span>`;
  };
  // seri: {sayi, bugun (bugün sayıldı mı), yeni (sayı bu dokunuşla arttı)}
  const seriRozet = s => `<span class="${liste('gm-lo-seri', !s.bugun && 'is-sonuk', s.yeni && 'is-yeni')}" role="img" aria-label="${esc(!s.sayi && !s.bugun ? 'Seri henüz başlamadı' : `${s.sayi} günlük seri${s.bugun ? '' : ', bugün henüz sayılmadı'}`)}"><img src="${ALEV}" alt=""><b>${sayi(s.sayi || 0)}</b></span>`;
  GM.canliOgunKarti = (o = {}) => {
    const l = o.ogunler || [], s = o.seri || {sayi: 0}, n = l.filter(x => x.durum === 'dolu').length;
    const alt = !s.sayi && !s.bugun ? 'Seri’ni başlat!' : !s.bugun ? 'Seriyi sürdür!' : `${n} / ${l.length} öğün`;
    const kalan = o.kalan == null ? '' : `<b class="${liste('gm-lo-kalan', o.oncekiKalan != null && 'is-yeni')}"${o.oncekiKalan != null ? ` data-lo-eski="${esc(Math.max(0, o.oncekiKalan))}" data-lo-yeni="${esc(Math.max(0, Math.abs(o.kalan)))}"` : ''}>${sayi(Math.abs(o.kalan))}</b>`;
    const etiket = `Dada Diet, günün öğünleri: ${o.kalan == null ? 'hedef yok' : o.kalan >= 0 ? `${sayi(o.kalan)} kcal kaldı` : `${sayi(-o.kalan)} kcal fazla`}, ${n} / ${l.length} öğün`;
    return `<section class="${liste('gm-lac', 'is-ogun', o.eski && 'is-eski', o.sinif)}" aria-label="${esc(`${etiket}${o.eski ? `, son güncelleme ${o.eski}` : ''}`)}">${lacKapak(o.ac, 'Dada Diet’te Bugün’ü aç')}
      <div class="gm-lac-ic">
        <div class="gm-lo-bas"><span class="gm-lo-ozet">${kalan}<span class="${liste('gm-lo-birim', o.kalan == null && 'is-yok')}"><small>${o.kalan == null ? 'Kalori hedefin yok' : o.kalan < 0 ? 'kcal fazla' : 'kcal kaldı'}</small><small>${o.eski ? `${ik('clock-rotate-left')} ${esc(`Son güncelleme ${o.eski}`)}` : esc(o.kalan == null ? 'Hedefini Dada Diet’te belirle' : alt)}</small></span></span><span class="gm-lo-sag">${seriRozet(s)}${o.acDugme ? `<button type="button" class="gm-lac-dugme is-ac" data-wg-ac="${esc(o.acDugme)}" aria-label="Dada Diet’i aç"><span>Aç</span></button>` : ''}</span></div>
        <div class="gm-lo-ogunler">${l.map(ogunHalka).join('')}</div>
      </div>${o.alt || ''}
    </section>`;
  };
  // Oruç kartı: kalanSn geri sayar (ActivityKit Text(timerInterval:)); oran ilerleme; isaretler: faz sınırları (0–1); eylem {kod}|{ac} "Bitir".
  // bitti: {baslik, metin} bitiş içeriği (sayaç durur, kart kısa süre kalır).
  GM.canliOrucKarti = (o = {}) => {
    const oran = kisit(o.oran || 0, 0, 1), yuzde = Math.round(oran * 100);
    const dugme = o.bitti || !o.eylem ? '' : `<button type="button" class="gm-lac-dugme"${o.eylem.kod ? ` data-wg-eylem="${esc(o.eylem.kod)}"` : ` data-wg-ac="${esc(o.eylem.ac)}"`} aria-label="${esc(o.eylem.aria || 'Orucu bitir')}">${ik('stop')}<span>${esc(o.eylem.metin || 'Bitir')}</span></button>`;
    const cubuk = `<span class="gm-lr-cubuk" style="--cih-o:${(o.bitti ? 1 : oran).toFixed(3)}" aria-hidden="true"><i></i>${(o.isaretler || []).map(x => `<span class="gm-lr-isaret" style="--x:${kisit(x, 0, 1).toFixed(3)}"></span>`).join('')}</span>`;
    const govde = o.bitti
      ? `<div class="gm-lr-sure is-bitti"><span class="gm-lr-tik" aria-hidden="true">${ik('check')}</span><span class="gm-lr-sayac"><b>${esc(o.bitti.baslik)}</b><small>${esc(o.bitti.metin || '')}</small></span></div>`
      : `<div class="gm-lr-sure"><span class="gm-lr-sayac">${o.kalanSn > 0 ? `<b>${GM.cihazGeriSayac(o.kalanSn)}</b><small>kaldı</small>` : `<b>Hedefine ulaştın</b>`}</span><span class="gm-lr-bitis"><small>Bitiş</small><b>${esc(o.bit || '')}</b></span></div>`;
    const etiket = o.bitti ? `Dada Diet, oruç: ${o.bitti.baslik}` : `Dada Diet, oruç: ${o.kalanMetin || ''}, bitiş ${o.bit || ''}, yüzde ${yuzde}`;
    return `<section class="${liste('gm-lac', 'is-oruc', o.bitti && 'is-bitti', o.eski && 'is-eski', o.sinif)}" aria-label="${esc(`${etiket}${o.eski ? `, son güncelleme ${o.eski}` : ''}`)}">${lacKapak(o.ac, 'Dada Diet’te Ritim’i aç')}
      <div class="gm-lac-ic">
        <div class="gm-lac-bas">${lacMarka('hourglass-half', o.baslik || 'Oruç')}${o.eski ? `<small>${ik('clock-rotate-left')} ${esc(o.eski)}</small>` : o.faz ? `<small>${esc(o.faz)}</small>` : ''}${dugme}</div>
        ${govde}${cubuk}
        <div class="gm-lr-alt"><span>${esc(o.bas ? `Başlangıç ${o.bas}` : '')}</span><span>${o.bitti ? '' : `%${yuzde}`}</span></div>
      </div>
    </section>`;
  };
  // Görüşme kartı (diyetisyen görüşmesi): kalan süre geri sayar, "Görüşmeye katıl" uygulamayı görüşmede açar (eylem.ac).
  GM.canliRandevuKarti = (o = {}) => `<section class="gm-lac is-randevu" aria-label="${esc(`Dada Diet, ${o.baslik || 'görüşme'}: ${o.kisi || ''}, başlangıç ${o.saat || ''}`)}">${lacKapak(o.ac || '#/uzman', 'Dada Diet’te Uzmanım’ı aç')}
      <div class="gm-lac-ic">
        <div class="gm-lac-bas">${lacMarka('video', 'Görüşme')}<small>${esc([o.tur, o.saat ? `başlangıç ${o.saat}` : ''].filter(Boolean).join(' · '))}</small></div>
        <div class="gm-lr-sure"><span class="gm-w2-kisi"><span class="gm-w2-avatar" aria-hidden="true">${esc(o.harf || '')}</span><span><b>${esc(o.baslik || '')}</b><small>${esc(o.kisi || '')}</small></span></span><span class="gm-lr-sayac is-randevu"><b>${GM.cihazGeriSayac(o.kalanSn || 0)}</b><small>kaldı</small></span></div>
        ${o.eylem ? `<button type="button" class="gm-lac-dugme is-tam"${o.eylem.ac ? ` data-wg-ac="${esc(o.eylem.ac)}"` : ''} aria-label="Görüşmeye katıl">${ik('video')}<span>Görüşmeye katıl</span></button>` : ''}
      </div>
    </section>`;
  // iOS'un ilk Canlı Etkinlik izni: kartın altında sistem satırı (marka rengi yok). data-wg-izin="red"|"ver" (ekran dinler). kapaniyor: verildi, satır kapanır.
  GM.canliIzinSatiri = (o = {}) => `<div class="${liste('gm-lizin', o.kapaniyor && 'is-kapaniyor')}"${o.kapaniyor ? ' aria-hidden="true"' : ''}><div class="gm-lizin-ic"><p>${esc(`${o.uygulama || 'Dada Diet'} Canlı Etkinlikleri’ne İzin Verilsin mi?`)}</p><div class="gm-lizin-dugmeler"><button type="button" data-wg-izin="red"${o.kapaniyor ? ' tabindex="-1"' : ''}>İzin Verme</button><button type="button" data-wg-izin="ver"${o.kapaniyor ? ' tabindex="-1"' : ''}>İzin Ver</button></div></div></div>`;
  // Bildirim yığını (iOS 16+ kilit ekranı, "Yığın" düzeni): en yeni üstte; kapalıyken arkadakiler kenar olarak görünür, dokununca açılır (data-kb-yigin).
  // ogeler:[{baslik, metin, zaman, ac, kisi:{harf}|null}] kisi: iletişim bildirimi (gönderen baş harfi + uygulama simgesi rozeti).
  GM.kilitBildirim = (o = {}) => {
    const l = o.ogeler || [], acik = o.acik || l.length < 2;
    if (!l.length) return '';
    const ikon = x => (x.kisi ? `<span class="gm-kb-ikon is-kisi" aria-hidden="true"><span>${esc(x.kisi.harf || '')}</span><img src="${SIMGE}" alt=""></span>` : `<span class="gm-kb-ikon" aria-hidden="true"><img src="${SIMGE}" alt=""></span>`);
    const oge = (x, i) => {
      const ic = `${ikon(x)}<span class="gm-kb-metin"><span class="gm-kb-bas"><b>${esc(x.baslik)}</b><small>${esc(x.zaman || '')}</small></span><span class="gm-kb-govde">${esc(x.metin)}</span></span>`;
      return acik && x.ac ? `<li><button type="button" class="gm-kb-oge" data-wg-ac="${esc(x.ac)}" aria-label="${esc(`${x.baslik}, ${x.zaman || ''}: ${x.metin}`)}">${ic}</button></li>` : `<li${!acik && i ? ' aria-hidden="true"' : ''}><span class="gm-kb-oge">${ic}</span></li>`;
    };
    return `<div class="${liste('gm-kb', acik ? 'is-acik' : 'is-yigin', l.length > 2 && 'is-cok', o.yeni && 'is-yeni')}">
      ${l.length > 1 && acik ? `<div class="gm-kb-ust"><b>Bildirimler</b><button type="button" class="gm-kb-az" data-kb-yigin aria-expanded="true">${ik('chevron-up')}<span>Daha az</span></button></div>` : ''}
      <ul class="gm-kb-liste">${l.map(oge).join('')}</ul>
      ${acik ? '' : `<button type="button" class="gm-kb-yigin" data-kb-yigin aria-expanded="false" aria-label="${esc(`${l.length} bildirim; en yenisi ${l[0].baslik}. Hepsini göster`)}"></button>`}
    </div>`;
  };
  // Kartlar ve bildirimler kilit ekranının alt yarısında, fener/kamera sırasının üstünde toplanır.
  GM.kilitAlt = (l = []) => (l.filter(Boolean).length ? `<div class="gm-kalt">${l.filter(Boolean).join('')}</div>` : '');

  // ---------- Widget v2 (W2 b–e): ana ekran (iOS WidgetKit / Android Material You), StandBy, Dinamik Ada ----------
  // Kilit ekranı kartlarıyla aynı dil: öğün/metrik rengi (token --gm-metrik-*, --gm-ogun-*), illüstrasyon, cam yüzey, renkli halka, "+" rozeti.
  // Boylar (iPhone 393 pt): küçük 158×158, orta 338×158, büyük 338×354 (ızgarada 2×2, 4×2, 4×4). Android aynı hücreler, Material You yüzeyi (CSS).
  // Düğmeler App Intent Button / Glance eylemi: data-wg-eylem (+ data-id); uygulamayı açan bağlantılar ve gövde data-wg-ac. Olayları ekran dinler.
  // renk: kalori | su | oruc | protein | karb | yag | seri | pencere
  const rh = (renk, oran, orta = '', boy = 'md', ek = '') => `<span class="${liste('gm-rh', `is-${renk}`, `is-${boy}`, ek)}" style="--cih-o:${kisit(oran || 0, 0, 1).toFixed(3)}" aria-hidden="true"><i class="gm-rh-iz"></i>${oran > 0 ? '<i class="gm-rh-yay"></i>' : ''}${orta ? `<span class="gm-rh-orta">${orta}</span>` : ''}</span>`;
  GM.renkHalka = (o = {}) => rh(o.renk || 'kalori', o.oran, o.orta, o.boy, o.sinif);
  const w2Dugme = d => `<button type="button" class="${liste('gm-w2-dugme', d.ton && `is-${d.ton}`, d.tam && 'is-tam', d.yalniz && 'is-yalniz')}"${d.kod ? ` data-wg-eylem="${esc(d.kod)}"${d.id ? ` data-id="${esc(d.id)}"` : ''}` : ` data-wg-ac="${esc(d.ac || '')}"`} aria-label="${esc(d.aria || d.metin)}">${ik(d.ikon || 'plus')}${d.yalniz ? '' : `<span>${esc(d.metin)}</span>`}</button>`;
  GM.w2Dugme = w2Dugme;
  const w2Bas = (ikon, metin, renk, sag = '') => `<span class="${liste('gm-w2-bas', `is-${renk}`)}">${ikon.startsWith('<') ? ikon : ik(ikon)}<b>${esc(metin)}</b>${sag ? `<small>${sag}</small>` : ''}</span>`;
  // eski: çevrimdışı; son veri soluk durur, sağ üstte son güncelleme saati (widget yeniden çizilemedi). hal: 'giris' | 'pro' (w2Hal).
  GM.w2Kabuk = (o = {}) => `<div class="${liste('gm-w2', `is-${o.boy || 'kucuk'}`, `is-${o.tur || 'ozet'}`, o.eski && 'is-eski', o.sinif)}">${o.ac ? `<button type="button" class="gm-w2-ac" data-wg-ac="${esc(o.ac)}" aria-label="${esc(`${o.etiket || ''}${o.eski ? `. Son güncelleme ${o.eski}` : ''}`)}"></button>` : ''}<div class="gm-w2-ic">${o.eski ? `<small class="gm-w2-damga" aria-hidden="true">${ik('clock-rotate-left')}${esc(o.eski)}</small>` : ''}${o.icerik || ''}</div></div>`;
  // Giriş yok: tek mesaj, gövde #/giris açar, düğme yok. Pro'ya özel: Dada Diet Pro + GMV.uye.pro rozeti ("Yakında") ve durum metni, pasif; gövde #/pro açar.
  // Hangi widget'ın Pro'ya özel olacağı ürün kararı bekliyor (Pro satışta değil); ekran örneği tek widget'ta gösterir.
  const w2Hal = (o, tur, ikon, ad, renk) => {
    const boy = o.boy || 'kucuk';
    if (o.hal === 'giris') return GM.w2Kabuk({boy, tur, ac: '#/giris', sinif: 'is-hal', etiket: `${ad}: giriş yap`, icerik: `${w2Bas(ikon, ad, renk)}${yok('right-to-bracket', 'Giriş yap', boy === 'kucuk' ? '' : 'Günün burada görünsün', '#/giris', boy === 'kucuk' ? '' : 'Giriş yap')}`});
    if (o.hal === 'pro') return GM.w2Kabuk({boy, tur, ac: '#/pro', sinif: 'is-hal is-pro', etiket: `${ad}: Dada Diet Pro ile açılacak, ${o.pro?.rozet || ''}`, icerik: `${w2Bas(ikon, ad, renk)}<span class="gm-w2-iskelet" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="gm-w2-yok">${ik('bolt')}<b>Dada Diet Pro</b><span class="gm-w2-rozet is-pro">${esc(o.pro?.rozet || '')}</span>${boy === 'kucuk' ? '' : `<small>${esc(o.pro?.metin || '')}</small>`}</span>`});
    return null;
  };
  const L = ml => `${(ml / 1000).toLocaleString('tr-TR', {maximumFractionDigits: 1})} L`;
  const yok = (ikon, baslik, metin, ac, dugme) => `<span class="gm-w2-yok">${ik(ikon)}<b>${esc(baslik)}</b>${metin ? `<small>${esc(metin)}</small>` : ''}${dugme ? w2Dugme({ac, ikon: 'arrow-right', metin: dugme, ton: 'ikincil'}) : ''}</span>`;
  const MAKRO_AD = [['P', 'Protein', 'protein'], ['K', 'Karbonhidrat', 'karb'], ['Y', 'Yağ', 'yag']];
  const makroSatirlari = m => `<span class="gm-w2-makrolar">${MAKRO_AD.map(([k, ad, r]) => { const x = m[k]; return `<span class="${liste('gm-w2-makro', `is-${r}`)}"><span><b>${ad}</b><small>${sayi(Math.round(x.alinan))} / ${sayi(x.hedef)} g</small></span><span class="gm-w2-cubuk is-${r}" style="--cih-o:${kisit(x.alinan / (x.hedef || 1), 0, 1).toFixed(3)}"><i></i></span></span>`; }).join('')}</span>`;
  const makroHalkalari = m => `<span class="gm-w2-mhalkalar">${MAKRO_AD.map(([k, ad, r]) => { const x = m[k]; return `<span class="gm-w2-mhalka">${rh(r, x.alinan / (x.hedef || 1), `<b>${sayi(Math.round(x.alinan))}</b>`, 'sm')}<small>${ad === 'Karbonhidrat' ? 'Karb.' : ad}</small></span>`; }).join('')}</span>`;
  const suSatir = (s, eylem) => `<span class="gm-w2-susatir">${ik('droplet')}<span><b>${sayi(s.icilen)}</b><small>/ ${sayi(s.hedef)} ml</small></span><span class="gm-w2-cubuk is-su" style="--cih-o:${kisit(s.icilen / (s.hedef || 1), 0, 1).toFixed(3)}"><i></i></span>${eylem ? w2Dugme({...eylem, ikon: 'plus', metin: `${sayi(s.bardak || 200)} ml`, aria: `Bir bardak su ekle, ${sayi(s.bardak || 200)} ml`, ton: 'su'}) : ''}</span>`;
  const kalanOrta = (kalan, boy) => (kalan < 0 ? `<b>+${sayi(-kalan)}</b><small>fazla</small>` : `<b>${sayi(kalan)}</b><small>${boy === 'kucuk' ? 'kaldı' : 'kcal kaldı'}</small>`);

  // Günün özeti: kalan kalori halkası; orta: makro çubukları; büyük: + dört öğün ("+") ve su (+200 ml).
  GM.wgOzet = (o = {}) => {
    const h_ = w2Hal(o, 'ozet', 'fire-flame-curved', 'Günün özeti', 'kalori');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', ac = o.ac || '#/bugun';
    if (o.hedef == null) return GM.w2Kabuk({eski: o.eski, boy, tur: 'ozet', ac, etiket: 'Günün özeti: kalori hedefi yok. Dada Diet’te aç', icerik: `${w2Bas('fire-flame-curved', boy === 'kucuk' ? 'Kalori' : 'Günün özeti', 'kalori')}${yok('bullseye', 'Kalori hedefin yok', boy === 'kucuk' ? '' : 'Hedefini belirle, kalanın burada görünsün', ac, boy === 'kucuk' ? '' : 'Hedef belirle')}`});
    const kalan = o.hedef - o.alinan, oran = o.alinan / o.hedef, n = (o.ogunler || []).filter(x => x.durum === 'dolu').length;
    const etiket = `Günün özeti: ${kalan >= 0 ? `${sayi(kalan)} kcal kaldı` : `${sayi(-kalan)} kcal fazla`}, ${sayi(o.alinan)} / ${sayi(o.hedef)} kcal. Dada Diet’te aç`;
    if (boy === 'kucuk') return GM.w2Kabuk({eski: o.eski, boy, tur: 'ozet', ac, etiket, icerik: `${w2Bas('fire-flame-curved', 'Kalori', 'kalori')}<span class="gm-w2-merkez">${rh('kalori', oran, kalanOrta(kalan, boy), 'lg')}</span><small class="gm-w2-not">${sayi(o.alinan)} / ${sayi(o.hedef)} kcal</small>`});
    const ust = `<span class="gm-w2-yan">${rh('kalori', oran, kalanOrta(kalan, boy), 'xl')}<span class="gm-w2-sag">${w2Bas('fire-flame-curved', 'Günün özeti', 'kalori', `${n}/${(o.ogunler || []).length} öğün`)}${o.makro ? makroSatirlari(o.makro) : `<small class="gm-w2-not">${sayi(o.alinan)} / ${sayi(o.hedef)} kcal</small>`}</span></span>`;
    if (boy === 'orta') return GM.w2Kabuk({eski: o.eski, boy, tur: 'ozet', ac, etiket, icerik: ust});
    return GM.w2Kabuk({eski: o.eski, boy, tur: 'ozet', ac, etiket, icerik: `${ust}<span class="gm-w2-ayrac"></span><span class="gm-w2-ogunler">${(o.ogunler || []).map(ogunHalka).join('')}</span>${o.su ? suSatir(o.su, o.suEylem) : ''}`});
  };
  // Su: tek dokunuşla +200 ml (App Intent). Küçük: damla halkası + değer + düğme; orta: bardak ızgarası.
  GM.wgSu = (o = {}) => {
    const h_ = w2Hal(o, 'su', 'droplet', 'Su', 'su');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', ac = o.ac || '#/bugun', hedef = o.hedef || 1, icilen = o.icilen || 0, bardak = o.bardak || 200, kalan = Math.max(0, hedef - icilen);
    const etiket = `Su: ${sayi(icilen)} / ${sayi(hedef)} ml. Dada Diet’te aç`;
    const dugme = o.eylem ? w2Dugme({...o.eylem, ikon: 'plus', metin: `${sayi(bardak)} ml`, aria: `Bir bardak su ekle, ${sayi(bardak)} ml`, ton: 'su', tam: boy === 'kucuk'}) : '';
    const halka = b => rh('su', icilen / hedef, `<img src="${TG}damla.webp" alt="">`, b);
    const deger = `<span class="gm-w2-deger is-su"><b${o.yeni ? ' class="is-yeni"' : ''}>${L(icilen)}</b><small>/ ${L(hedef)}</small></span>`;
    if (boy === 'kucuk') return GM.w2Kabuk({eski: o.eski, boy, tur: 'su', ac, etiket, icerik: `${w2Bas('droplet', 'Su', 'su', `%${Math.round(Math.min(1, icilen / hedef) * 100)}`)}<span class="gm-w2-yan is-sik">${halka('md')}${deger}</span>${dugme}`});
    const n = Math.max(Math.ceil(hedef / bardak), Math.ceil(icilen / bardak)), dolu = icilen / bardak;
    const bardaklar = Array.from({length: n}, (_, i) => `<i class="${liste('gm-w2-bardak', i < Math.floor(dolu) ? 'is-dolu' : i < dolu ? 'is-yarim' : '')}">${ik('glass-water')}</i>`).join('');
    return GM.w2Kabuk({eski: o.eski, boy, tur: 'su', ac, etiket, icerik: `<span class="gm-w2-yan">${halka('xl')}<span class="gm-w2-sag">${w2Bas('droplet', 'Su', 'su')}${deger}<small class="gm-w2-not">${kalan ? `${sayi(kalan)} ml kaldı · ${Math.ceil(kalan / bardak)} bardak` : 'Bugünkü hedef tamam'}</small><span class="gm-w2-bardaklar" aria-hidden="true">${bardaklar}</span>${dugme}</span></span>`});
  };
  // Öğünler: küçük sıradaki öğün; orta dört halka ("+"); büyük satırlar (illüstrasyon, saat, kcal, "+").
  GM.wgOgunler = (o = {}) => {
    const h_ = w2Hal(o, 'ogunler', 'utensils', 'Öğünler', 'kalori');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', ac = o.ac || '#/bugun', l = o.ogunler || [], n = l.filter(x => x.durum === 'dolu').length;
    const etiket = `Öğünler: ${n} / ${l.length} kayıtlı${o.kalan != null ? `, ${sayi(Math.max(0, o.kalan))} kcal kaldı` : ''}. Dada Diet’te aç`;
    const sag = o.kalan != null ? `${sayi(Math.max(0, o.kalan))} kcal kaldı` : `${n}/${l.length}`;
    if (boy === 'kucuk') {
      const s = l.find(x => x.siradaki) || l.find(x => x.durum === 'bos');
      if (!s) return GM.w2Kabuk({eski: o.eski, boy, tur: 'ogunler', ac, etiket, icerik: `${w2Bas('utensils', 'Öğünler', 'kalori', `${n}/${l.length}`)}${yok('circle-check', 'Bugünün öğünleri tamam', o.kalan != null ? `${sayi(Math.max(0, o.kalan))} kcal kaldı` : '')}`});
      return GM.w2Kabuk({eski: o.eski, boy, tur: 'ogunler', ac, etiket, icerik: `${w2Bas('utensils', 'Sıradaki', 'kalori', esc(s.saat || ''))}<span class="gm-w2-merkez is-ogun">${ogunHalka({...s, ad: s.ad})}</span><small class="gm-w2-not">${s.planKcal ? `${sayi(s.planKcal)} kcal planlı` : 'Ne yediğini ekle'}</small>`});
    }
    if (boy === 'orta') return GM.w2Kabuk({eski: o.eski, boy, tur: 'ogunler', ac, etiket, icerik: `${w2Bas('utensils', 'Bugünün öğünleri', 'kalori', sag)}<span class="gm-w2-ogunler">${l.map(ogunHalka).join('')}</span>`});
    const satir = x => {
      const dolu = x.durum === 'dolu', dugme = !dolu && x.durum !== 'atlandi' && x.eylem ? w2Dugme({...(x.eylem.kod ? {kod: x.eylem.kod, id: x.eylem.id || x.id} : {ac: x.eylem.ac}), ikon: 'plus', metin: 'Ekle', aria: `${x.ad} ekle${x.planKcal ? `, ${sayi(x.planKcal)} kcal` : ''}`, ton: 'ogun'}) : `<span class="gm-w2-tik" role="img" aria-label="${esc(dolu ? 'Kaydedildi' : 'Atlandı')}">${ik(dolu ? 'check' : 'minus')}</span>`;
      return `<span class="${liste('gm-w2-ogsatir', `is-${x.id}`, dolu && 'is-dolu', x.siradaki && 'is-siradaki', x.yeni && 'is-yeni')}" style="--cih-o:${dolu ? 1 : 0}"><span class="gm-lo-halka is-satir" aria-hidden="true"><span class="gm-lo-iz"></span>${dolu ? '<span class="gm-lo-yay"></span>' : ''}<img src="${esc(x.gorsel || GM.OGUN_GORSEL[x.id] || GM.OGUN_GORSEL.ara)}" alt=""></span><span class="gm-w2-ogad"><b>${esc(x.tamAd || x.ad)}</b><small>${esc([x.saat, dolu ? `${sayi(x.kcal || 0)} kcal` : x.planKcal ? `${sayi(x.planKcal)} kcal planlı` : ''].filter(Boolean).join(' · '))}</small></span>${dugme}</span>`;
    };
    const ozetler = `<span class="gm-w2-ozetler"><span><small>Kalan</small><b>${o.kalan != null ? `${sayi(Math.max(0, o.kalan))} kcal` : '—'}</b></span><span><small>Öğün</small><b>${n} / ${l.length}</b></span><span><small>Su</small><b>${o.su ? `${L(o.su.icilen)} / ${L(o.su.hedef)}` : '—'}</b></span></span>`;
    return GM.w2Kabuk({eski: o.eski, boy, tur: 'ogunler', ac, etiket, icerik: `${w2Bas('utensils', 'Bugünün öğünleri', 'kalori', sag)}<span class="gm-w2-ogsatirlar">${l.map(satir).join('')}</span>${ozetler}`});
  };
  // Oruç: oruçta kalan süre geri sayar (Text(timerInterval:)), halka ve faz çubuğu, Bitir; başlamamışken hedef süre ve Başlat (ilerleme yok, karar 3).
  GM.wgOruc = (o = {}) => {
    const h_ = w2Hal(o, 'oruc', 'hourglass-half', 'Oruç', 'oruc');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', ac = o.ac || '#/ritim', baslik = `Oruç${o.ad ? ` · ${o.ad}` : ''}`;
    if (o.tur === 'plansiz' || o.tur === 'kapali') return GM.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket: `Oruç: ${o.baslik || 'plan yok'}. Dada Diet’te aç`, icerik: `${w2Bas('hourglass-half', 'Oruç', 'oruc')}${yok('moon', o.baslik || 'Oruç planı yok', boy === 'kucuk' ? '' : o.alt || 'Ritim’de bir plan seç')}`});
    const dugme = o.eylem ? w2Dugme({...o.eylem, ikon: /baslat/.test(o.eylem.kod || '') || o.eylem.ac ? 'play' : 'stop', metin: o.eylem.metin, ton: 'oruc', tam: boy === 'kucuk'}) : '';
    // Bitir'den sonra: onay halkası, süre ve yeniden "Başlat"
    if (o.bitti) return GM.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket: `Oruç bitti, ${o.bitti}`, icerik: `${w2Bas('hourglass-half', baslik, 'oruc')}<span class="gm-w2-yan is-sik">${rh('pencere', 1, ik('check'), 'md')}<small class="gm-w2-not"><b>Oruç bitti</b><br>${esc(o.bitti)}</small></span>${dugme}`});
    if (o.tur !== 'oruc') {
      const metin = o.tur === 'pencere' ? `Pencere ${o.kapanis}’e kadar` : 'Başlamaya hazır';
      const orta = `<b>${o.hedefSaat || 16}</b><small>sa hedef</small>`;
      if (boy === 'kucuk') return GM.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket: `Oruç başlamadı: ${metin}. Dada Diet’te aç`, icerik: `${w2Bas('hourglass-half', baslik, 'oruc')}<span class="gm-w2-yan is-sik">${rh('oruc', 0, orta, 'md')}<small class="gm-w2-not">${esc(metin)}</small></span>${dugme}`});
      return GM.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket: `Oruç başlamadı: ${metin}. Dada Diet’te aç`, icerik: `<span class="gm-w2-yan">${rh('oruc', 0, orta, 'xl')}<span class="gm-w2-sag">${w2Bas('hourglass-half', baslik, 'oruc')}<span class="gm-w2-deger is-oruc"><b>${esc(o.tur === 'pencere' ? 'Yeme penceresi açık' : 'Oruç başlamadı')}</b></span><small class="gm-w2-not">${esc(metin)}${o.tur === 'pencere' && o.kalanDk != null ? ` · ${sure(o.kalanDk)} kaldı` : ''}</small>${dugme}</span></span>`});
    }
    const kalanSn = Math.max(0, o.hedefSaat * 3600 - o.gecenSn), sayac = kalanSn > 0 ? GM.cihazGeriSayac(kalanSn, {bicim: boy === 'kucuk' ? 'sa' : 'dk'}) : 'Tamam';
    const etiket = `Oruç: ${kalanSn > 0 ? `${sure(Math.ceil(kalanSn / 60))} kaldı` : 'hedefine ulaştın'}, bitiş ${o.bit}. Dada Diet’te aç`;
    if (boy === 'kucuk') return GM.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket, icerik: `${w2Bas('hourglass-half', baslik, 'oruc')}<span class="gm-w2-yan is-sik">${rh('oruc', o.oran, `<b>${sayac}</b><small>kaldı</small>`, 'md')}<small class="gm-w2-not">Bitiş<br><b>${esc(o.bit)}</b></small></span>${dugme}`});
    const cubuk = `<span class="gm-lr-cubuk is-w2" style="--cih-o:${kisit(o.oran, 0, 1).toFixed(3)}" aria-hidden="true"><i></i>${(o.isaretler || []).map(x => `<span class="gm-lr-isaret" style="--x:${kisit(x, 0, 1).toFixed(3)}"></span>`).join('')}</span>`;
    return GM.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket, icerik: `<span class="gm-w2-yan">${rh('oruc', o.oran, `<b>${Math.round(o.oran * 100)}%</b><small>${esc(o.faz || '')}</small>`, 'xl')}<span class="gm-w2-sag">${w2Bas('hourglass-half', baslik, 'oruc')}<span class="gm-w2-deger is-oruc"><b>${sayac}</b><small>kaldı</small></span>${cubuk}<small class="gm-w2-not">${esc(o.bas)} → ${esc(o.bit)}</small>${dugme}</span></span>`});
  };
  // Diyetisyen: sıradaki görüşme ve son mesaj; yanıt yazmak uygulamada (bağlantı).
  GM.wgDiyetisyen = (o = {}) => {
    const h_ = w2Hal(o, 'diyetisyen', 'user-doctor', 'Diyetisyen', 'diyetisyen');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', d = o.dyt;
    if (!d) return GM.w2Kabuk({eski: o.eski, boy, tur: 'diyetisyen', ac: '#/uzman/bul', etiket: 'Diyetisyen: henüz diyetisyenin yok. Diyetisyen bul', icerik: `${w2Bas('user-doctor', 'Diyetisyen', 'diyetisyen')}${yok('user-doctor', 'Diyetisyenin yok', boy === 'kucuk' ? '' : 'Sana uygun diyetisyeni bul, görüşmen burada görünsün', '#/uzman/bul', boy === 'kucuk' ? '' : 'Diyetisyen bul')}`});
    const kisi = `<span class="gm-w2-kisi"><span class="gm-w2-avatar" aria-hidden="true">${esc(d.harf)}</span><span><b>${esc(d.kisaAd)}</b><small>${esc(d.unvan || '')}</small></span></span>`;
    const r = d.randevu, rv = r ? `<span class="gm-w2-randevu"><span class="gm-w2-takvim" aria-hidden="true"><small>${esc(r.ay)}</small><b>${esc(r.gunNo)}</b></span><span><b>${esc(`${r.gun} ${r.saat}`)}</b><small>${esc([r.kalan, r.tur].filter(Boolean).join(' · '))}</small></span></span>` : '<small class="gm-w2-not">Planlı görüşme yok</small>';
    const etiket = `Diyetisyen ${d.kisaAd}${r ? `, görüşme ${r.gun} ${r.saat}` : ''}${d.mesajlar?.length ? `, son mesaj: ${d.mesajlar[d.mesajlar.length - 1].metin}` : ''}. Dada Diet’te aç`;
    if (boy === 'kucuk') {
      const kisiK = `<span class="gm-w2-kisi"><span class="gm-w2-avatar" aria-hidden="true">${esc(d.harf)}</span><span><b>${esc(d.kisaAd)}</b></span></span>`;
      const rvK = r ? `<span class="gm-w2-randevu"><span class="gm-w2-takvim" aria-hidden="true"><small>${esc(r.ay)}</small><b>${esc(r.gunNo)}</b></span><span><b>${esc(`${r.gun} ${r.saat}`)}</b><small>${esc(r.kalan || '')}</small></span></span>` : '<small class="gm-w2-not">Planlı görüşme yok</small>';
      return GM.w2Kabuk({eski: o.eski, boy, tur: 'diyetisyen', ac: '#/uzman', etiket, icerik: `${kisiK}${rvK}`});
    }
    const balon = m => `<span class="${liste('gm-w2-balon', m.kim === 'ben' && 'is-ben')}"><span>${esc(m.metin)}</span><small>${esc(m.zaman || '')}</small></span>`;
    const ms = (d.mesajlar || []).slice(boy === 'buyuk' ? -2 : -1);
    const yanit = w2Dugme({ac: '#/uzman/sohbet', ikon: 'reply', metin: 'Yanıtla', ton: 'diyetisyen'});
    if (boy === 'orta') return GM.w2Kabuk({eski: o.eski, boy, tur: 'diyetisyen', ac: '#/uzman/sohbet', etiket, icerik: `<span class="gm-w2-ust">${kisi}<span class="gm-w2-sagust">${d.okunmamis ? `<span class="gm-w2-rozet">${sayi(d.okunmamis)}</span>` : ''}${yanit}</span></span>${ms.length ? balon(ms[ms.length - 1]) : '<small class="gm-w2-not">Henüz mesaj yok</small>'}${rv}`});
    return GM.w2Kabuk({eski: o.eski, boy, tur: 'diyetisyen', ac: '#/uzman/sohbet', etiket, icerik: `<span class="gm-w2-ust">${kisi}${d.okunmamis ? `<span class="gm-w2-rozet">${sayi(d.okunmamis)}</span>` : ''}</span><span class="gm-w2-balonlar">${ms.map(balon).join('')}</span>${r ? `<span class="gm-w2-rkart">${rv}${w2Dugme({ac: '#/uzman', ikon: 'video', metin: 'Görüşme', ton: 'ikincil'})}</span>` : ''}<span class="gm-w2-alt">${yanit}</span>`});
  };
  // Haftalık ilerleme: son 7 gün kalori (hedef çizgisi), büyükte su; seri alevi.
  GM.wgHafta = (o = {}) => {
    const h_ = w2Hal(o, 'hafta', 'chart-simple', 'Haftalık ilerleme', 'kalori');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', l = o.gunler || [], hedef = o.hedef || Math.max(1, ...l.map(x => x.kcal || 0)), tavan = Math.max(hedef * 1.25, ...l.map(x => x.kcal || 0)), kayitli = l.filter(x => x.kcal != null && !x.bugun);
    const ort = kayitli.length ? Math.round(kayitli.reduce((t, x) => t + x.kcal, 0) / kayitli.length) : null;
    const etiket = `Haftalık ilerleme: ${o.seri?.sayi || 0} günlük seri${ort ? `, son 7 gün ortalaması ${sayi(ort)} kcal` : ''}. Dada Diet’te aç`;
    const cubuklar = (alan, h, renk) => `<span class="${liste('gm-w2-grafik', `is-${renk}`)}" style="--h:${kisit(h / tavan, 0, 1).toFixed(3)}" aria-hidden="true">${l.map(x => `<span class="${liste('gm-w2-gun', x.bugun && 'is-bugun', x[alan] == null && 'is-bos', x[alan] > h * 1.08 && 'is-ustunde')}" style="--o:${kisit((x[alan] || 0) / tavan, 0, 1).toFixed(3)}"><i></i><small>${esc(x.gun.slice(0, 1))}</small></span>`).join('')}<i class="gm-w2-hedef"></i></span>`;
    const seri = `<span class="${liste('gm-lo-seri', !o.seri?.bugun && 'is-sonuk')}" role="img" aria-label="${esc(`${o.seri?.sayi || 0} günlük seri`)}"><img src="${ALEV}" alt=""><b>${sayi(o.seri?.sayi || 0)}</b></span>`;
    if (boy === 'kucuk') return GM.w2Kabuk({eski: o.eski, boy, tur: 'hafta', ac: '#/saglik', etiket, icerik: `<span class="gm-w2-ust">${w2Bas('chart-simple', 'Hafta', 'kalori')}${seri}</span>${cubuklar('kcal', hedef, 'kalori')}<small class="gm-w2-not">${ort ? `Ort. ${sayi(ort)} kcal` : 'Kayıtlar burada birikir'}</small>`});
    const ust = `<span class="gm-w2-ust">${w2Bas('chart-simple', 'Son 7 gün', 'kalori', ort ? `ort. ${sayi(ort)} kcal` : '')}${seri}</span>`;
    if (boy === 'orta') return GM.w2Kabuk({eski: o.eski, boy, tur: 'hafta', ac: '#/saglik', etiket, icerik: `${ust}${cubuklar('kcal', hedef, 'kalori')}`});
    const suH = o.suHedef || 2200, suTavan = suH * 1.25;
    const suCubuk = `<span class="gm-w2-grafik is-su" aria-hidden="true">${l.map(x => `<span class="${liste('gm-w2-gun', x.bugun && 'is-bugun', x.suMl == null && 'is-bos')}" style="--o:${kisit((x.suMl || 0) / suTavan, 0, 1).toFixed(3)}"><i></i><small>${esc(x.gun.slice(0, 1))}</small></span>`).join('')}<i class="gm-w2-hedef" style="--h:${(suH / suTavan).toFixed(3)}"></i></span>`;
    // Özet yalnız kayıtların istatistiği (kural yok): ortalama, en yüksek gün, seri.
    const ust_ = kayitli.reduce((m, x) => (!m || x.kcal > m.kcal ? x : m), null);
    const ozetler = `<span class="gm-w2-ozetler"><span><small>Ortalama</small><b>${ort ? `${sayi(ort)} kcal` : '—'}</b></span><span><small>En yüksek</small><b>${ust_ ? `${esc(ust_.gun)} ${sayi(ust_.kcal)}` : '—'}</b></span><span><small>Seri</small><b>${sayi(o.seri?.sayi || 0)} gün</b></span></span>`;
    return GM.w2Kabuk({eski: o.eski, boy, tur: 'hafta', ac: '#/saglik', etiket, icerik: `${ust}<small class="gm-w2-etiket">${ik('fire-flame-curved')}Kalori · hedef ${sayi(hedef)}</small>${cubuklar('kcal', hedef, 'kalori')}<small class="gm-w2-etiket is-su">${ik('droplet')}Su · hedef ${L(suH)}</small>${suCubuk}${ozetler}`});
  };

  // ---------- Dinamik Ada v2 (W2 b): öğün/su (günlük) ve oruç Canlı Etkinlikleri ----------
  // tur: 'kompakt' (tek etkinlik; dokununca genişler: data-ada="<etkinlik>"; genişte boş yere dokunmak data-ada="kompakt"), 'genis' (basılı tutunca; düğmeler App Intent), 'minimal' (iki etkinlik: biri adaya bitişik, öteki ayrık daire).
  // etkinlik 'oruc': {oran, kalanSn, ad, faz, bas, bit, isaretler, eylem:{kod}}; 'gunluk': {kalan, ogunler, su:{icilen, hedef, bardak}, suEylem:{kod}, seri}.
  GM.adaV2 = (o = {}) => {
    if (o.etkinlik === 'rota') return GM.adaRota(o);
    const e = o.etkinlik || 'oruc', t = o.tur || 'kompakt', oruc = e === 'oruc';
    const sol = oruc ? rh('oruc', o.oran, ik('hourglass-half'), 'ada') : rh('kalori', o.hedef ? (o.hedef - o.kalan) / o.hedef : 0, ik('fire-flame-curved'), 'ada');
    if (t === 'minimal') return `<span class="${liste('gm-ada2', 'is-minimal', `is-${e}`)}">${oruc ? rh('oruc', o.oran, '', 'ada') : rh('kalori', o.hedef ? (o.hedef - o.kalan) / o.hedef : 0, '', 'ada')}</span>`;
    if (t === 'kompakt') {
      const sag = oruc ? `<b class="is-oruc">${o.kalanSn > 0 ? GM.cihazGeriSayac(o.kalanSn, {bicim: 'kisa'}) : 'Tamam'}</b>` : `<b class="is-kalori">${o.kalan == null ? '—' : sayi(Math.max(0, o.kalan))}<small>kcal</small></b>`;
      return `<button type="button" class="${liste('gm-ada2', 'is-kompakt', `is-${e}`)}" data-ada="${e}" aria-label="${esc(oruc ? `Oruç: ${o.kalanSn > 0 ? `${sure(Math.ceil(o.kalanSn / 60))} kaldı` : 'hedefine ulaştın'}. Genişlet` : `Bugün: ${o.kalan == null ? 'hedef yok' : `${sayi(Math.max(0, o.kalan))} kcal kaldı`}. Genişlet`)}">${sol}<i></i>${sag}</button>`;
    }
    // Genişletilmiş hal Apple bölgeleriyle (≤ 160 pt): leading ve trailing kameranın iki yanında, center altında, bottom en altta.
    if (oruc) {
      const cubuk = `<span class="gm-lr-cubuk is-ada" style="--cih-o:${kisit(o.oran, 0, 1).toFixed(3)}" aria-hidden="true"><i></i>${(o.isaretler || []).map(x => `<span class="gm-lr-isaret" style="--x:${kisit(x, 0, 1).toFixed(3)}"></span>`).join('')}</span>`;
      return `<span class="${liste('gm-ada2', 'is-genis', 'is-oruc')}"><button type="button" class="gm-ada2-kapat" data-ada="kompakt" aria-label="Küçült"></button>
        <span class="gm-ada2-ust">${rh('oruc', o.oran, ik('hourglass-half'), 'ada-md')}<i></i><span class="gm-ada2-sayac"><b>${o.kalanSn > 0 ? GM.cihazGeriSayac(o.kalanSn) : 'Tamam'}</b><small>${o.kalanSn > 0 ? 'kaldı' : 'hedefine ulaştın'}</small></span></span>
        <span class="gm-ada2-orta"><b>Oruç · ${esc(o.ad || '')}</b><small>${esc([o.faz, `bitiş ${o.bit}`].filter(Boolean).join(' · '))}</small></span>
        <span class="gm-ada2-alt is-cubuk"><small>${esc(o.bas || '')}</small>${cubuk}<small>${esc(o.bit || '')}</small>${o.eylem ? `<button type="button" class="gm-ada2-dugme is-oruc" data-wg-eylem="${esc(o.eylem.kod)}" aria-label="Orucu bitir">${ik('stop')}<span>Bitir</span></button>` : ''}</span></span>`;
    }
    const s = o.su || {}, l = o.ogunler || [];
    return `<span class="${liste('gm-ada2', 'is-genis', 'is-gunluk')}"><button type="button" class="gm-ada2-kapat" data-ada="kompakt" aria-label="Küçült"></button>
      <span class="gm-ada2-ust"><span class="gm-ada2-kalan"><b class="${liste(o.oncekiKalan != null && 'is-yeni')}"${o.oncekiKalan != null ? ` data-lo-eski="${esc(Math.max(0, o.oncekiKalan))}" data-lo-yeni="${esc(Math.max(0, o.kalan ?? 0))}"` : ''}>${o.kalan == null ? '—' : sayi(Math.max(0, o.kalan))}</b><small>kcal kaldı</small></span><i></i><span class="gm-ada2-su">${ik('droplet')}<b>${L(s.icilen || 0)}</b><small>/ ${L(s.hedef || 0)}</small></span></span>
      <span class="gm-ada2-alt is-ogun"><span class="gm-ada2-ogunler">${l.map(ogunHalka).join('')}</span><span class="gm-ada2-sag">${o.seri ? `<span class="${liste('gm-lo-seri', !o.seri.bugun && 'is-sonuk')}" role="img" aria-label="${esc(`${o.seri.sayi} günlük seri`)}"><img src="${ALEV}" alt=""><b>${sayi(o.seri.sayi)}</b></span>` : ''}${o.suEylem ? `<button type="button" class="gm-ada2-dugme is-su" data-wg-eylem="${esc(o.suEylem.kod)}" aria-label="Bir bardak su ekle, ${sayi(s.bardak || 200)} ml">${ik('plus')}<span>${sayi(s.bardak || 200)} ml</span></button>` : ''}</span></span></span>`;
  };

  // ---------- Android canlı bildirim v2 (W2 e): Android 16 Live Update (ProgressStyle) ve mesaj bildirimi ----------
  // tur 'oruc': ilerleme çubuğu (faz bölümleri), kalan süre, "Orucu bitir"; 'gunluk': öğün halkaları, kalan kalori, "+ <sıradaki öğün>" ve "+200 ml";
  // 'mesaj': MessagingStyle (gönderen, mesaj, Yanıtla uygulamayı açar). Eylem düğmeleri bildirim eylemi (48 dp).
  GM.androidCanli = (o = {}) => {
    if (o.tur === 'rota' || o.tur === 'bildirim') return GM.androidRota(o);
    const t = o.tur || 'oruc', ust = (ikon, metin, sag) => `<span class="gm-acb-ust"><span class="gm-acb-glif">${ik(ikon)}</span><span>Dada Diet</span><span aria-hidden="true">·</span><span>${esc(metin)}</span>${o.eski ? `<span aria-hidden="true">·</span><small class="gm-acb-eski">${ik('clock-rotate-left')} ${esc(o.eski)}</small>` : sag ? `<span aria-hidden="true">·</span>${sag}` : ''}</span>`;
    const eylem = e => `<button type="button"${e.kod ? ` data-wg-eylem="${esc(e.kod)}"${e.id ? ` data-id="${esc(e.id)}"` : ''}` : ` data-wg-ac="${esc(e.ac)}"`}>${esc(e.metin)}</button>`;
    if (t === 'mesaj') return `<div class="${liste('gm-acb', 'is-mesaj', o.eski && 'is-eski')}">${ust('comment', 'Diyetisyen', `<small>${esc(o.zaman || '')}</small>`)}<span class="gm-acb-govde"><span class="gm-w2-avatar" aria-hidden="true">${esc(o.harf || '')}</span><span class="gm-acb-metin"><b>${esc(o.baslik)}</b><span>${esc(o.metin)}</span></span></span><span class="gm-acb-eylemler">${eylem({ac: '#/uzman/sohbet', metin: 'Yanıtla'})}</span></div>`;
    if (t === 'gunluk') {
      const l = o.ogunler || [], s = o.su || {}, sira = l.find(x => x.siradaki && x.eylem);
      return `<div class="${liste('gm-acb', 'is-gunluk', o.eski && 'is-eski')}">${ust('utensils', 'Bugün', `<small>${l.filter(x => x.durum === 'dolu').length}/${l.length} öğün</small>`)}
        <span class="gm-acb-govde"><span class="gm-acb-metin"><b>${o.kalan == null ? 'Kalori hedefin yok' : `${sayi(Math.max(0, o.kalan))} kcal kaldı`}</b><span>${esc(`Su ${sayi(s.icilen || 0)} / ${sayi(s.hedef || 0)} ml`)}</span></span><span class="gm-acb-ogunler">${l.map(x => `<span class="${liste('gm-acb-ogun', `is-${x.id}`, x.durum === 'dolu' && 'is-dolu', x.yeni && 'is-yeni')}" style="--cih-o:${x.durum === 'dolu' ? 1 : 0}" role="img" aria-label="${esc(`${x.ad}: ${x.durum === 'dolu' ? 'kaydedildi' : 'henüz yok'}`)}"><span class="gm-lo-halka is-acb"><span class="gm-lo-iz"></span>${x.durum === 'dolu' ? '<span class="gm-lo-yay"></span>' : ''}<img src="${esc(GM.OGUN_GORSEL[x.id] || GM.OGUN_GORSEL.ara)}" alt=""></span></span>`).join('')}</span></span>
        <span class="gm-acb-eylemler">${sira ? eylem(sira.eylem.kod ? {kod: sira.eylem.kod, id: sira.eylem.id || sira.id, metin: `+ ${sira.ad}`} : {ac: sira.eylem.ac, metin: `+ ${sira.ad}`}) : ''}${o.suEylem ? eylem({...o.suEylem, metin: `+${sayi(s.bardak || 200)} ml su`}) : ''}</span></div>`;
    }
    const kalanSn = Math.max(0, (o.hedefSaat || 16) * 3600 - (o.gecenSn || 0));
    return `<div class="${liste('gm-acb', 'is-oruc', o.bitti && 'is-bitti', o.eski && 'is-eski')}">${ust('hourglass-half', `Oruç · ${o.ad || ''}`, o.bitti ? '' : GM.cihazGeriSayac(kalanSn))}
      <span class="gm-acb-govde"><span class="gm-acb-metin"><b>${esc(o.bitti ? 'Oruç bitti' : kalanSn > 0 ? `${sure(Math.ceil(kalanSn / 60))} kaldı` : 'Hedefine ulaştın')}</b><span>${esc(o.bitti ? `${o.bitti} · pencere açıldı` : [o.faz, `bitiş ${o.bit}`].filter(Boolean).join(' · '))}</span></span><img src="${SIMGE}" alt=""></span>
      <span class="gm-lr-cubuk is-acb" style="--cih-o:${kisit(o.bitti ? 1 : o.oran, 0, 1).toFixed(3)}" aria-hidden="true"><i></i>${(o.isaretler || []).map(x => `<span class="gm-lr-isaret" style="--x:${kisit(x, 0, 1).toFixed(3)}"></span>`).join('')}</span>
      ${!o.bitti && o.eylem ? `<span class="gm-acb-eylemler">${eylem({...o.eylem, metin: 'Orucu bitir'})}</span>` : ''}</div>`;
  };
  // Android 16 durum çubuğu çipi (Live Update kısa metni): oruçta kalan süre.
  GM.androidCip = (o = {}) => o.tur === 'rota' ? `<span class="gm-tel-cip is-rota">${ik('route')}<span>${esc(o.metin || '')}</span></span>` : `<span class="gm-tel-cip is-v2">${ik('hourglass-half')}${GM.cihazGeriSayac(Math.max(0, o.kalanSn || 0), {bicim: 'kisa'})}</span>`;

  // ---------- StandBy (iOS, yatay şarjda): iki widget yan yana, arka planları kalkar; gece kırmızı ton çerçevenin is-gece sınıfıyla ----------
  GM.standby = (o = {}) => `<div class="gm-sb"><div class="gm-sb-yuva">${o.sol || ''}</div><div class="gm-sb-yuva">${o.sag || ''}</div></div>`;

  // ---------- Hızlı ayarlar (Android Quick Settings kutucuğu) ve Denetim Merkezi (iOS 18 denetimi) ----------
  // kutucuklar: [{ad, alt, ikon, hal:'aktif'|'pasif'|'kullanilamaz', eylem, ac, bizim}] Android Tile durumları: aktif = STATE_ACTIVE (açık), pasif = STATE_INACTIVE
  // (kapalı / tek seferlik eylemin hazır hali), kullanilamaz = STATE_UNAVAILABLE (dokunulmaz). bizim olmayanlar telefonun kendi nötr kutucuklarıdır (dokunulmaz).
  GM.hizliAyarlar = (o = {}) => {
    const p = o.platform || 'ios', l = o.kutucuklar || [];
    const kut = k => {
      const yok = k.hal === 'kullanilamaz';
      const tag = k.bizim ? 'button type="button"' : 'span', v = k.bizim ? `${!yok && k.eylem ? ` data-wg-eylem="${esc(k.eylem)}"` : ''}${!yok && k.ac ? ` data-wg-ac="${esc(k.ac)}"` : ''}${yok ? ' disabled' : ''} aria-label="${esc(`${k.ad}${k.alt ? `, ${k.alt}` : ''}`)}"` : ' aria-hidden="true"';
      return `<${tag} class="${liste('gm-ha-kut', `is-${k.hal || 'pasif'}`, k.genis && 'is-genis', k.bizim && 'is-bizim', k.renk && `is-${k.renk}`)}"${v}><span class="gm-ha-ikon">${ik(k.ikon)}</span>${k.genis || p === 'android' ? `<span class="gm-ha-metin"><b>${esc(k.ad)}</b>${k.alt ? `<small>${esc(k.alt)}</small>` : ''}</span>` : ''}</${k.bizim ? 'button' : 'span'}>`;
    };
    if (p === 'android') return `<div class="gm-ha is-android"><div class="gm-ha-ust"><b>${esc(o.saat || '')}</b><small>${esc(o.tarih || '')}</small></div><span class="gm-ha-parlak" aria-hidden="true">${ik('sun')}<i></i></span><div class="gm-ha-izgara">${l.map(kut).join('')}</div><span class="gm-ha-tutamak" aria-hidden="true"></span></div>`;
    return `<div class="gm-ha is-ios"><div class="gm-ha-izgara">${l.map(kut).join('')}<span class="gm-ha-kaydirici" aria-hidden="true">${ik('sun')}<i></i></span><span class="gm-ha-kaydirici" aria-hidden="true">${ik('volume-high')}<i></i></span></div></div>`;
  };

  // ---------- Sesli komut ----------
  GM.komutSonuc = (o = {}) => `<div class="${liste('gm-ksonuc', `is-${o.ton || 'kalori'}`)}">
    <span class="gm-ksonuc-ust"><img src="${SIMGE}" alt=""><span>Dada Diet</span></span>
    <span class="gm-ksonuc-bas"><span class="gm-ksonuc-ikon">${ik(o.ikon || 'check')}</span><span><b>${esc(o.baslik)}</b>${o.metin ? `<small>${esc(o.metin)}</small>` : ''}</span></span>
    ${o.deger != null ? `<span class="gm-ksonuc-deger"><b>${esc(o.deger)}</b><small>${esc(o.birim || '')}</small></span>` : ''}
    ${o.oran != null ? GM.cihazCubuk({tur: o.ton === 'su' ? 'su' : 'kalori', oran: o.oran}) : ''}
    ${o.satirlar?.length ? `<span class="gm-ksonuc-satirlar">${o.satirlar.map(s => `<small>${esc(s)}</small>`).join('')}</span>` : ''}
    ${o.alt ? `<span class="gm-ksonuc-alt">${vurgu(o.alt)}</span>` : ''}
  </div>`;
  GM.komutEkran = (o = {}) => {
    const p = o.platform || 'ios', hal = o.hal || 'sonuc';
    const dalga = `<span class="gm-komut-dalga" aria-hidden="true">${'<i></i>'.repeat(5)}</span>`;
    if (p === 'android') {
      return `<div class="gm-komut is-android" data-hal="${hal}"><div class="gm-komut-arka" aria-hidden="true" inert>${o.arka || ''}</div><span class="gm-komut-perde"></span>
        <div class="gm-komut-sayfa"><span class="gm-komut-tutamak"></span><p class="gm-komut-soz"><q>${esc(o.komut)}</q></p><p class="gm-komut-dinle">${dalga}<span>Dinliyor…</span></p><div class="gm-komut-kart">${o.sonuc || ''}</div><span class="gm-komut-mik" aria-hidden="true">${ik('microphone')}</span></div></div>`;
    }
    return `<div class="gm-komut is-ios" data-hal="${hal}"><div class="gm-komut-arka" aria-hidden="true" inert>${o.arka || ''}</div><span class="gm-komut-perde"></span><span class="gm-komut-isilti" aria-hidden="true"></span>
      <div class="gm-komut-kart">${o.sonuc || ''}</div><p class="gm-komut-soz">${dalga}<q>${esc(o.komut)}</q></p></div>`;
  };
  GM.komutOynat = (el, sonuc) => {
    if (!el) return () => {};
    el.dataset.hal = 'dinliyor';
    if (GM.azHareket()) { el.dataset.hal = 'sonuc'; sonuc?.(); return () => {}; }
    void el.offsetWidth;
    const z = setTimeout(() => { el.dataset.hal = 'sonuc'; sonuc?.(); }, 1800);
    return () => clearTimeout(z);
  };

  // ---------- Adımlar ----------
  GM.cihazAdimlar = (l = [], o = {}) => `<ol class="${liste('gm-cadimlar', o.sinif)}">${l.map((m, i) => `<li><span class="gm-cadim-no" aria-hidden="true">${i + 1}</span><span>${vurgu(m)}</span></li>`).join('')}</ol>`;

  // ---------- Sağlık bağlantısı: telefonun izin penceresi ----------
  const YON_IKON = {oku: 'arrow-down', yaz: 'arrow-up'};
  GM.cihazYonlar = (o = {}) => `<span class="gm-cyonlar">${(o.yonler || []).map(y => `<span class="${liste('gm-cyon', `is-${y.yon}`)}">${ik(YON_IKON[y.yon])}${GM.anahtar({ad: `${o.ad}-${y.yon}`, etiket: y.etiket, secili: y.secili, pasif: y.pasif})}</span>`).join('')}</span>`;
  GM.cihazYonAciklama = (o = {}) => `<p class="gm-cyon-aciklama">${o.gelen ? `<span>${ik(YON_IKON.oku)}${esc(o.gelen)}</span>` : ''}${o.giden ? `<span>${ik(YON_IKON.yaz)}${esc(o.giden)}</span>` : ''}</p>`;

  GM.cihazIzinAdim = (o = {}) => `<div class="${liste('gm-izin gm-cizin', o.ton && `is-${o.ton}`)}">${GM.gulucuk({gorsel: o.gorsel, rozet: o.ikon})}<div class="gm-ic gm-izin-govde">${o.toplam ? `<div class="gm-cizin-adim">${GM.adimGosterge({adim: o.adim, toplam: o.toplam})}</div>` : ''}<h1 class="gm-t-page">${esc(o.baslik)}</h1><p class="gm-izin-metin">${vurgu(o.metin || '')}</p>${o.maddeler?.length ? GM.maddeler(o.maddeler) : ''}${o.ek || ''}</div></div>`;

  GM.cihazBasari = (o = {}) => `<div class="gm-cbasari">${GM.durumSahne({isaret: 'circle-check', baslik: o.baslik, metin: o.metin, ipucuBaslik: o.ipucuBaslik || 'İlk eşitlemede gelenler', ipuclari: o.maddeler, ana: o.ana, ikinciller: o.ikinciller || []})}</div>`;

  const SIZIN = {
    ios: {baslik: 'Sağlık Erişimi', red: 'İzin Verme', ver: 'İzin Ver', tumu: 'Tümünü Aç', tumuKapat: 'Tümünü Kapat',
      giris: (u, s) => `“${u}”, ${s} verilerine erişmek ve onları güncellemek istiyor.`,
      yaz: u => `“${u}” uygulamasının veri yazmasına izin ver:`, oku: u => `“${u}” uygulamasının veri okumasına izin ver:`, aciklama: 'Uygulama açıklaması'},
    android: {baslik: 'Health Connect', red: 'İzin verme', ver: 'İzin ver', tumu: 'Tümüne izin ver',
      giris: (u, s) => `${u} uygulamasının ${s} verilerine erişmesine izin verilsin mi?`,
      yaz: u => `${u} uygulamasının yazmasına izin ver`, oku: u => `${u} uygulamasının okumasına izin ver`, aciklama: 'Bu uygulama verilerini neden kullanıyor?'}
  };
  GM.sistemIzinPenceresi = (o = {}) => new Promise(coz => {
    const p = o.platform === 'android' ? 'android' : 'ios', M = SIZIN[p], u = o.uygulama?.ad || 'Dada Diet', simge = o.uygulama?.simge || SIMGE;
    const oku = o.oku || [], yaz = o.yaz || [], hepsi = [...oku.map(t => ['oku', t]), ...yaz.map(t => ['yaz', t])];
    const sec = {oku: Object.fromEntries(oku.map(t => [t.id, !!t.acik])), yaz: Object.fromEntries(yaz.map(t => [t.id, !!t.acik]))};
    const tumuAcik = () => hepsi.every(([y, t]) => sec[y][t.id]), biri = () => hepsi.some(([y, t]) => sec[y][t.id]);
    const satir = (y, t) => `<div class="gm-sizin-satir">${t.ikon ? `<span class="gm-sizin-ikon" aria-hidden="true">${ik(t.ikon)}</span>` : ''}<span class="gm-sizin-ad">${esc(t.ad)}</span>${GM.anahtar({ad: `sizin-${y}-${t.id}`, etiket: `${t.ad}, ${y === 'oku' ? 'okuma' : 'yazma'}`, secili: sec[y][t.id]})}</div>`;
    const grup = (y, l) => (l.length ? `<p class="gm-sizin-etiket">${esc(M[y](u))}</p><div class="gm-sizin-kart">${l.map(t => satir(y, t)).join('')}</div>` : '');
    const tumuHtml = () => (p === 'ios'
      ? `<div class="gm-sizin-kart"><button type="button" class="gm-sizin-baglanti" data-sizin="tumu">${esc(tumuAcik() ? M.tumuKapat : M.tumu)}</button></div>`
      : `<div class="gm-sizin-kart"><div class="gm-sizin-satir is-tumu"><span class="gm-sizin-ad">${esc(M.tumu)}</span>${GM.anahtar({ad: 'sizin-tumu', etiket: M.tumu, secili: tumuAcik()})}</div></div>`);
    const verBtn = `<button type="button" class="gm-sizin-dugme is-ana" data-sizin="ver"${biri() ? '' : ' disabled'}>${esc(M.ver)}</button>`;
    const redBtn = `<button type="button" class="gm-sizin-dugme" data-sizin="red">${esc(M.red)}</button>`;
    const servis = `<span class="gm-sizin-servis" aria-hidden="true">${ik(o.servis?.ikon || 'heart-pulse')}</span>`;
    const ust = p === 'ios'
      ? `<div class="gm-sizin-bar">${redBtn}<h2>${esc(M.baslik)}</h2>${verBtn}</div>`
      : `<div class="gm-sizin-bar"><span class="gm-sizin-simge is-kucuk" aria-hidden="true"><img src="${esc(simge)}" alt=""></span>${servis}</div>`;
    const bas = p === 'ios'
      ? `<div class="gm-sizin-uyg"><span class="gm-sizin-simge" aria-hidden="true"><img src="${esc(simge)}" alt=""></span><p>${esc(M.giris(u, o.servis?.ad || 'Sağlık'))}</p></div>`
      : `<div class="gm-sizin-uyg"><h2>${esc(M.giris(u, o.servis?.ad || 'Health Connect'))}</h2><p>${esc(`${u} uygulamasının okuyup yazabileceği verileri seç.`)}</p></div>`;
    const not = `${o.aciklama ? `<p class="gm-sizin-etiket">${esc(M.aciklama)}</p><div class="gm-sizin-kart is-metin"><p>${esc(o.aciklama)}</p></div>` : ''}${o.yol ? `<p class="gm-sizin-not">${esc(`İzinleri istediğin an ${o.yol} bölümünden değiştirebilirsin.`)}</p>` : ''}`;
    const govde = p === 'ios' ? `${tumuHtml()}${grup('yaz', yaz)}${grup('oku', oku)}` : `${tumuHtml()}${grup('oku', oku)}${grup('yaz', yaz)}`;
    let sonuc = {izin: false, oku: sec.oku, yaz: sec.yaz};
    GM.sheet({
      baslik: p === 'ios' ? M.baslik : `${o.servis?.ad || 'Health Connect'} izni`, tam: true, zorunlu: true, sinif: `gm-sizin-sheet is-${p}`,
      html: `<div class="${liste('gm-sizin', `is-${p}`)}">${ust}<div class="gm-sizin-govde">${bas}${govde}${not}</div>${p === 'android' ? `<div class="gm-sizin-alt">${redBtn}${verBtn}</div>` : ''}</div>`,
      kapaninca: () => coz(sonuc),
      sonra: d => {
        const ver = () => d.querySelector('[data-sizin="ver"]');
        const yenile = () => {
          const b = ver(); if (b) b.disabled = !biri();
          const t = d.querySelector('[data-sizin="tumu"]'); if (t) t.textContent = tumuAcik() ? M.tumuKapat : M.tumu;
          const a = d.querySelector('input[name="sizin-tumu"]'); if (a) a.checked = tumuAcik();
        };
        const hepsiniYap = v => { hepsi.forEach(([y, t]) => { sec[y][t.id] = v; const g = d.querySelector(`input[name="sizin-${y}-${t.id}"]`); if (g) g.checked = v; }); yenile(); };
        const c = [
          ...hepsi.map(([y, t]) => GM.on(d, `sizin-${y}-${t.id}`, v => { sec[y][t.id] = v; yenile(); })),
          GM.on(d, 'sizin-tumu', v => hepsiniYap(v))
        ];
        const tik = ev => {
          const b = ev.target.closest('[data-sizin]'); if (!b || b.disabled) return;
          const e = b.dataset.sizin;
          if (e === 'tumu') hepsiniYap(!tumuAcik());
          else if (e === 'red') { sonuc = {izin: false, oku: sec.oku, yaz: sec.yaz}; d.kapat(); }
          else if (e === 'ver') {
            sonuc = {izin: true, oku: {...sec.oku}, yaz: {...sec.yaz}};
            const bek = GM.azHareket() ? 0 : +o.bekle || 0;
            if (!bek) { d.kapat(); return; }
            b.setAttribute('aria-busy', 'true'); d.querySelectorAll('[data-sizin]').forEach(x => { x.disabled = true; });
            setTimeout(() => d.kapat(), bek);
          }
        };
        d.addEventListener('click', tik);
        return () => { c.forEach(f => f()); d.removeEventListener('click', tik); };
      }
    });
  });
})();

/* ---------- Biyometrik istem (E4): telefonun kimlik doğrulama penceresi ----------
 * GM.biyometrikIstem({platform:'ios'|'ios-touch'|'android', neden, sonuc:'basari'|'basarisiz', sure}) → Promise<'basari'|'basarisiz'|'iptal'|'sifre'>
 *   ios: ortada kare sistem kutusu (yüz tarama simgesi + "Face ID"), tararken köşeler nabız atar; altta İptal.
 *   ios-touch: sistem uyarısı ("“Dada Diet” için Touch ID", gerekçe, parmak izi), altta İptal.
 *   android: alttan sayfa (BiometricPrompt): uygulama simgesi, "Dada Diet’i aç", gerekçe, halkalı parmak izi, durum satırı, "Şifre kullan" metin düğmesi.
 *   Haller data-hal: tarama → basari (simge onay işaretine döner, çizilerek) | basarisiz (hata tonu, sallanma). Sonuçta İptal ve Şifre kullan kalkar.
 *   Süreler hareket ayarından bağımsızdır: azaltılmış harekette istem aynı süre görünür, yalnız animasyonlar durur. Perdeye dokunmak, Esc ve sayfa değişimi = iptal.
 *   Nötr sistem yüzeyi: marka rengi ve resmi glif yok; yüz tarama simgesi genel çizim (köşe çerçeve + ifadesiz yüz).
 * İkon: `yuz-tarama` (GM.ik('yuz-tarama'), GM.btn/satır/ikonKutu ikon adı olarak) gm-cihaz.css'te maske ile tanımlı. */
(() => {
  const GM = window.GM, {esc, ik} = GM;
  const SIMGE = 'assets/marka/ikon-512.png';
  const YUZ = '<svg class="gm-bistem-yuz" viewBox="0 0 24 24" aria-hidden="true"><g class="gm-bistem-kose"><path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/></g><g class="gm-bistem-ic-yuz"><path d="M9 9v1.5"/><path d="M15 9v1.5"/><path d="M12 9v4.5h-1"/><path d="M9.5 16.5h5"/></g></svg>';
  const ONAY = '<svg class="gm-bistem-onay" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" pathLength="1"/><path d="M7.5 12.5l3 3 6-6.5" pathLength="1"/></svg>';
  const M = {
    ios: {ad: 'Face ID', tarama: 'Face ID', basari: 'Doğrulandı', basarisiz: 'Tanınmadı'},
    'ios-touch': {ad: 'Touch ID', tarama: 'Parmağını Ana ekran düğmesine koy', basari: 'Doğrulandı', basarisiz: 'Tanınmadı, tekrar dene'},
    android: {ad: 'Parmak izi', tarama: 'Parmak izi sensörüne dokun', basari: 'Doğrulandı', basarisiz: 'Tanınmadı'}
  };
  GM.biyometrikIstem = (o = {}) => new Promise(coz => {
    const p = M[o.platform] ? o.platform : 'ios', m = M[p], neden = o.neden || 'Dada Diet’i açmak için';
    const kat = document.getElementById('gm-katman') || document.body;
    const glif = `<span class="gm-bistem-glif">${p === 'ios' ? YUZ : ik('fingerprint', 'gm-bistem-parmak')}${ONAY}</span>`;
    const durum = `<span class="gm-bistem-durum" aria-live="polite">${esc(m.tarama)}</span>`;
    const govde = p === 'ios'
      ? `<div class="gm-bistem-kutu" tabindex="-1">${glif}${durum}</div><button type="button" class="gm-bistem-iptal" data-bistem="iptal">İptal</button>`
      : p === 'ios-touch'
        ? `<div class="gm-bistem-kutu" tabindex="-1"><div class="gm-bistem-ic"><b class="gm-bistem-baslik">“Dada Diet” için Touch ID</b><p>${esc(neden)}</p>${glif}${durum}</div><button type="button" class="gm-bistem-dugme" data-bistem="iptal">İptal</button></div>`
        : `<div class="gm-bistem-kutu" tabindex="-1"><div class="gm-bistem-ic"><span class="gm-bistem-simge" aria-hidden="true"><img src="${SIMGE}" alt=""></span><b class="gm-bistem-baslik">Dada Diet’i aç</b><p>${esc(neden)}</p>${glif}${durum}</div><div class="gm-bistem-ayak"><button type="button" class="gm-bistem-dugme" data-bistem="sifre">Şifre kullan</button></div></div>`;
    const kap = document.createElement('div');
    kap.className = `gm-bistem is-${p}`;
    kap.dataset.hal = 'tarama';
    kap.setAttribute('role', 'dialog'); kap.setAttribute('aria-modal', 'true'); kap.setAttribute('aria-label', m.ad);
    kap.innerHTML = `<div class="gm-bistem-perde" data-bistem="iptal"></div>${govde}`;
    kat.append(kap);
    const onceki = document.activeElement;
    kap.querySelector('.gm-bistem-kutu').focus({preventScroll: true});
    let bitti = false, t1 = 0, t2 = 0;
    const kapat = s => {
      if (bitti) return; bitti = true;
      clearTimeout(t1); clearTimeout(t2); removeEventListener('hashchange', gec); removeEventListener('popstate', gec);
      kap.classList.add('is-cikis');
      setTimeout(() => { kap.remove(); if (onceki?.isConnected) onceki.focus?.({preventScroll: true}); coz(s); }, GM.azHareket() ? 0 : GM.TK.motion.base);
    };
    const gec = () => kapat('iptal');
    addEventListener('hashchange', gec); addEventListener('popstate', gec);
    kap.addEventListener('click', ev => { const b = ev.target.closest('[data-bistem]'); if (b && kap.dataset.hal === 'tarama') kapat(b.dataset.bistem); });
    kap.addEventListener('keydown', ev => { if (ev.key === 'Escape' && kap.dataset.hal === 'tarama') kapat('iptal'); });
    const sure = +o.sure || GM.TK.motion.reveal * 4;
    t1 = setTimeout(() => {
      const s = o.sonuc === 'basarisiz' ? 'basarisiz' : 'basari';
      kap.dataset.hal = s;
      kap.querySelector('.gm-bistem-durum').textContent = m[s];
      kap.querySelectorAll('[data-bistem]:not(.gm-bistem-perde)').forEach(b => { b.disabled = true; });
      GM.titres(s === 'basari' ? 12 : 30);
      t2 = setTimeout(() => kapat(s), s === 'basari' ? GM.TK.motion.reveal * 2 : GM.TK.motion.reveal * 3);
    }, sure);
  });
  // Telefonun sistem uyarısı (ör. iOS "… Face ID kullanmak istiyor"): nötr yüzey, iOS'ta yan yana iki eşit metin düğmesi, Android'de sağa yaslı metin düğmeleri.
  // GM.sistemUyari({platform, baslik, metin, red, ver}) → Promise<boolean|null>. Perde kapatmaz (sistem seçim ister); Esc = false (red);
  // rota değişirse (geri tuşu, adres) uyarı kapanır ve null döner: seçim yapılmadı, çağıran red sayar ama kalıcı karar yazmaz.
  GM.sistemUyari = (o = {}) => new Promise(coz => {
    const p = o.platform === 'android' ? 'android' : 'ios';
    const kat = document.getElementById('gm-katman') || document.body;
    const kap = document.createElement('div');
    kap.className = `gm-bistem is-uyari is-${p === 'android' ? 'android-uyari' : 'ios-uyari'}`;
    kap.dataset.hal = 'uyari';
    kap.setAttribute('role', 'alertdialog'); kap.setAttribute('aria-modal', 'true'); kap.setAttribute('aria-label', o.baslik || '');
    kap.innerHTML = `<div class="gm-bistem-perde"></div><div class="gm-bistem-kutu" tabindex="-1"><div class="gm-bistem-ic"><b class="gm-bistem-baslik">${esc(o.baslik || '')}</b>${o.metin ? `<p>${esc(o.metin)}</p>` : ''}</div><div class="gm-bistem-ikili"><button type="button" class="gm-bistem-dugme is-ikincil" data-uyari="0">${esc(o.red || 'İzin Verme')}</button><button type="button" class="gm-bistem-dugme" data-uyari="1">${esc(o.ver || 'İzin Ver')}</button></div></div>`;
    kat.append(kap);
    const onceki = document.activeElement;
    kap.querySelector('.gm-bistem-kutu').focus({preventScroll: true});
    let bitti = false;
    const gec = () => kapat(null);
    addEventListener('hashchange', gec); addEventListener('popstate', gec);
    const kapat = v => {
      if (bitti) return; bitti = true;
      removeEventListener('hashchange', gec); removeEventListener('popstate', gec);
      kap.classList.add('is-cikis');
      setTimeout(() => { kap.remove(); if (onceki?.isConnected) onceki.focus?.({preventScroll: true}); coz(v); }, GM.azHareket() ? 0 : GM.TK.motion.base);
    };
    kap.addEventListener('click', ev => { const b = ev.target.closest('[data-uyari]'); if (b) kapat(b.dataset.uyari === '1'); });
    kap.addEventListener('keydown', ev => { if (ev.key === 'Escape') kapat(false); });
  });
})();

/* ---------- Rota türü (Dada Gourmet · Dada Route Co-Pilot; DADA-ROUTE-REFERANS §5 i, aile F2–F5, F9) ----------
 * Diet'in oruç kartı (GM.canliOrucKarti), Dinamik Ada v2 (GM.adaV2) ve Android canlı bildirimi (GM.androidCanli) dilinden türer; aynı kabuk sınıfları (gm-lac, gm-ada2, gm-acb),
 * rota rengi primary → on-dark-accent. Turn-by-turn yok: yalnız sıradaki durak, kalan km/dk, ilerleme ve "Geç". Uygulama adı Dada Gourmet, simge assets/marka/ikon-512.png.
 *   GM.canliRotaKarti({rota:{kalkis, varis}, durak:{tur, ad, gorsel, uzak, sure, sapma}, oran, isaretler:[{x, gecildi}], kalan, varis, eylem:{kod|ac}, bitti:{baslik, metin}, ac, alt, sinif})
 *     iPhone kilit ekranı Canlı Etkinlik kartı (≤ 160 pt). bitti: 8 saat sınırında bitiş içeriği (çubuk durur, "Geç" kalkar).
 *   GM.adaRota({tur:'kompakt'|'genis'|'minimal', durak, oran, rota, eylem, baska}) (baska: minimal, başka uygulamanın etkinliği) = GM.adaV2({etkinlik:'rota'}) = GM.dinamikAda({durum:'rota'}).
 *   GM.androidRota({tur:'rota'|'bildirim', ...}) = GM.androidCanli({tur:'rota'}): Android 16 Live Update (ProgressStyle) ya da sıradan bildirim {ikon, baslik, metin, zaman, eylemler:[metin]}.
 *   GM.androidCip({tur:'rota', metin}) durum çubuğu çipi ("3 km"). */
(() => {
  const GM = window.GM, {esc, ik, kisit} = GM;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const SIMGE = 'assets/marka/ikon-512.png', UYG = 'Dada Gourmet';
  const glif = d => (d?.gorsel ? `<span class="gm-lrt-foto"><img src="${esc(d.gorsel)}" alt=""></span>` : `<span class="gm-lrt-ikon is-${esc(d?.tur || 'mekan')}">${ik(d?.tur && d.tur !== 'mekan' ? GM.ikonAd(d.tur) : 'utensils')}</span>`);
  const sapmaMetin = d => (d?.sapma == null ? '' : d.sapma <= 2 ? 'yol üstü' : `+${d.sapma} dk sapma`);
  // Yolculuk çubuğu (Flighty B1; Görev 9 düzeltmesi "İzmir'deki daire"): dolu kısım + şimdiki konum noktası + yol üstü duraklar küçük işaret.
  // Uçlarda halka yok; kalkış/varış etiketi çubuğun içine ya da yanına değil, altındaki ayrı satıra (GM.rotaUclar) yazılır. Hiçbir şey çakışmaz:
  // konum noktasına çok yakın işaret (|x - oran| < 0,03) ve uçlardaki (%3) şehir içi duraklar çizilmez (sıradaki durak metinde, uçlar etikette yazılı). isaretler:[{x, gecildi, tur:'mekan'|'yol'}]
  // (mekan: Dada durağı, marka tonunda nokta; yol: yakıt/şarj, nötr küçük işaret). bitti: konum noktası kalkar.
  GM.rotaIlerleme = (o = {}, ek = '') => {
    const oran = kisit(o.oran || 0, 0, 1);
    return `<span class="${liste('gm-lr-cubuk', 'is-rota', ek)}" style="--cih-o:${oran.toFixed(3)}" aria-hidden="true"><i></i>${(o.isaretler || []).filter(x => x.x >= 0.03 && x.x <= 0.97 && (o.bitti || Math.abs(x.x - oran) >= 0.03)).map(x => `<span class="${liste('gm-lrt-nokta', x.gecildi && 'is-gecildi', x.tur === 'yol' && 'is-yol')}" style="--x:${kisit(x.x, 0, 1).toFixed(3)}"></span>`).join('')}${o.bitti ? '' : '<span class="gm-lrt-konum"></span>'}</span>`;
  };
  // Çubuğun altındaki etiket satırı: solda kalkış (+ geçilen), sağda varış (+ kalan ya da saat); ortası boş kalır.
  GM.rotaUclar = (sol, sag, ek = '') => `<span class="${liste('gm-lrt-uclar', ek)}"><span>${sol || ''}</span><span>${sag || ''}</span></span>`;
  const yol = (o, ek = '') => GM.rotaIlerleme(o, ek);
  const dugme = (e, sinif, metin = 'Geç') => (e ? `<button type="button" class="${sinif}"${e.kod ? ` data-wg-eylem="${esc(e.kod)}"` : ` data-wg-ac="${esc(e.ac || '')}"`} aria-label="${esc(e.aria || 'Durağı geç')}">${ik('forward')}<span>${esc(metin)}</span></button>` : '');

  GM.canliRotaKarti = (o = {}) => {
    const r = o.rota || {}, d = o.durak || {};
    const etiket = o.bitti ? `${UYG}, Dada Route: ${o.bitti.baslik}` : `${UYG}, Dada Route ${r.kalkis} → ${r.varis}: sıradaki durak ${d.ad}, ${d.uzak}, ${sapmaMetin(d)}; ${o.kalan || ''}, varış ${o.varis || ''}`;
    const govde = o.bitti
      ? `<div class="gm-lr-sure is-bitti"><span class="gm-lr-tik is-rota" aria-hidden="true">${ik('route')}</span><span class="gm-lr-sayac"><b>${esc(o.bitti.baslik)}</b><small>${esc(o.bitti.metin || '')}</small></span></div>`
      : `<div class="gm-lrt-durak">${glif(d)}<span class="gm-lrt-metin"><small>Sıradaki durak</small><b>${esc(d.ad)}</b></span><span class="gm-lrt-mesafe"><b>${esc(d.uzak || '')}</b><small>${esc([d.sure, sapmaMetin(d)].filter(Boolean).join(' · '))}</small></span></div>`;
    // Satırlar: başlık (marka · kalan, Geç) · sıradaki durak · çubuk · uç etiketleri (kalkış | varış + saat). eski: son güncelleme saati (çevrimdışı).
    const sagUst = o.eski ? `${ik('clock-rotate-left')} ${esc(o.eski)}` : esc(o.kalan ? `${o.kalan} kaldı` : `${r.kalkis || ''} → ${r.varis || ''}`);
    return `<section class="${liste('gm-lac', 'is-rota', o.bitti && 'is-bitti', o.eski && 'is-eski', o.sinif)}" aria-label="${esc(`${etiket}${o.eski ? `, son güncelleme ${o.eski}` : ''}`)}">${o.ac ? `<button type="button" class="gm-lac-ac" data-wg-ac="${esc(o.ac)}" aria-label="Dada Route’u aç"></button>` : ''}
      <div class="gm-lac-ic">
        <div class="gm-lac-bas"><span class="gm-lac-marka"><span class="gm-lac-glif" aria-hidden="true">${ik('route')}</span><span>Dada Route</span></span><small>${sagUst}</small>${o.bitti ? '' : dugme(o.eylem, 'gm-lac-dugme')}</div>
        ${govde}
        <div class="gm-lrt-yol">${yol(o)}${GM.rotaUclar(esc(r.kalkis || ''), `${esc(r.varis || '')}${o.varis ? ` · <b>${esc(o.varis)}</b>` : ''}`)}</div>
        ${o.once ? `<small class="gm-lrt-once">${ik(o.once.tur === 'sarj' ? 'charging-station' : 'gas-pump')}<span>Önce: <b>${esc(o.once.ad)}</b> · ${esc([o.once.turAd, o.once.uzak].filter(Boolean).join(' '))}</span></small>` : ''}
      </div>${o.alt || ''}
    </section>`;
  };

  // Dinamik Ada (F2): kompakt = durak ikonu | "3 km"; genis = ad + sapma + çubuk + "Geç"; minimal = yolculuk oranı halkası (iki etkinlikte).
  GM.adaRota = (o = {}) => {
    const t = o.tur || 'kompakt', d = o.durak || {}, r = o.rota || {};
    const halka = (boy, orta) => `<span class="gm-rh is-rota is-${boy}" style="--cih-o:${kisit(o.oran || 0, 0, 1).toFixed(3)}" aria-hidden="true"><i class="gm-rh-iz"></i>${o.oran > 0 ? '<i class="gm-rh-yay"></i>' : ''}${orta ? `<span class="gm-rh-orta">${orta}</span>` : ''}</span>`;
    // baska: aynı anda süren başka uygulamanın etkinliği (ör. harita uygulamasının navigasyonu); içeriği çizilmez, nötr glif.
    if (t === 'minimal') return o.baska ? `<span class="${liste('gm-ada2', 'is-minimal', 'is-baska')}">${ik('location-arrow')}</span>` : `<span class="${liste('gm-ada2', 'is-minimal', 'is-rota')}">${halka('ada', ik('route'))}</span>`;
    if (t === 'kompakt') return `<button type="button" class="${liste('gm-ada2', 'is-kompakt', 'is-rota')}" data-ada="rota" aria-label="${esc(`Sıradaki durak ${d.ad}, ${d.uzak}. Genişlet`)}">${glif({...d, gorsel: null})}<i></i><b class="is-rota">${esc(d.uzak || '')}</b></button>`;
    return `<span class="${liste('gm-ada2', 'is-genis', 'is-rota')}"><button type="button" class="gm-ada2-kapat" data-ada="kompakt" aria-label="Küçült"></button>
      <span class="gm-ada2-ust">${glif(d)}<i></i><span class="gm-ada2-sayac is-rota"><b>${esc(d.uzak || '')}</b><small>${esc(d.sure || '')}</small></span></span>
      <span class="gm-ada2-orta"><b>${esc(d.ad || '')}</b><small>${esc(sapmaMetin(d))}</small></span>
      <span class="gm-ada2-alt is-cubuk is-rota"><span class="gm-lrt-yol">${yol(o, 'is-ada')}${GM.rotaUclar(esc(r.kalkis || ''), `${esc(r.varis || '')}${o.varis ? ` · ${esc(o.varis)}` : ''}`)}</span>${dugme(o.eylem, 'gm-ada2-dugme is-rota')}</span></span>`;
  };

  // Android 16 Live Update (ProgressStyle) ya da sıradan bildirim (yaklaşma, il girişi, yemek saati). Eylemler bildirim düğmesidir (48 dp).
  GM.androidRota = (o = {}) => {
    const ust = (ikon, sag) => `<span class="gm-acb-ust"><span class="gm-acb-glif is-rota">${ik(ikon)}</span><span>${UYG}</span><span aria-hidden="true">·</span><span>${esc(sag)}</span></span>`;
    const eylemler = l => (l?.length ? `<span class="gm-acb-eylemler">${l.map(e => `<button type="button"${e.kod ? ` data-wg-eylem="${esc(e.kod)}"` : e.ac ? ` data-wg-ac="${esc(e.ac)}"` : ''}>${esc(e.metin || e)}</button>`).join('')}</span>` : '');
    if (o.tur === 'bildirim') return `<div class="${liste('gm-acb', 'is-rota', 'is-bildirim')}">${ust(o.ikon || 'route', [o.kanal || 'Dada Route', o.zaman].filter(Boolean).join(' · '))}<span class="gm-acb-govde"><span class="gm-acb-metin"><b>${esc(o.baslik)}</b><span>${esc(o.metin)}</span></span>${o.gorsel ? `<img class="is-kare" src="${esc(o.gorsel)}" alt="">` : ''}</span>${eylemler(o.eylemler)}</div>`;
    const d = o.durak || {}, r = o.rota || {};
    return `<div class="${liste('gm-acb', 'is-rota', o.bitti && 'is-bitti')}">${ust('route', `${r.kalkis || ''} → ${r.varis || ''}`)}
      <span class="gm-acb-govde"><span class="gm-acb-metin"><b>${esc(`${d.uzak || ''} · ${d.ad || ''}`)}</b><span>${esc(['Sıradaki durak', d.sure, sapmaMetin(d)].filter(Boolean).join(' · '))}</span></span>${d.gorsel ? `<img class="is-kare" src="${esc(d.gorsel)}" alt="">` : `<img src="${SIMGE}" alt="">`}</span>
      ${yol(o, 'is-acb')}${GM.rotaUclar(esc(o.kalan || r.kalkis || ''), o.varis ? `${esc(r.varis || '')} · Varış ${esc(o.varis)}` : esc(r.varis || ''), 'is-acb')}
      ${eylemler(o.eylemler)}</div>`;
  };
})();
/* ---------- Gourmet widget'ları (Görev 7.2): Diet Widget v2 kabuğundan (GM.w2Kabuk, gm-w2 sınıfları, aynı boylar, dokunma ve hal kuralları) türer ----------
 *   GM.wgRota({boy, hal:'yolda'|'hazir'|'giris', rota:{id, kalkis, varis}, durak:{tur, ad, gorsel, uzak, sure, sapma}, oran, isaretler, kalan, varis, yolUstu, sonraki:[{tur, ad, uzak}],
 *     eylem:{kod}, kayitlilar:[{id, ad, ozet, kisa, cizgi}], eski})  Dada Route: canlı yolculuk (sıradaki durak, kalan km/dk, yol üstü durak sayısı) ya da kayıtlı rotayı hızlı başlat.
 *   GM.wgYakin({boy, konum, mekanlar:[{slug, ad, kategori, ilce, mesafe, gorsel, acik}], eski})  konuma en yakın Dada mekânları (fotoğraflı).
 *   GM.wgPlan({boy, rez:{slug, ad, gun, ay, gunAd, saat, kisi, durum:'onay'|'talep', gorsel}|null, etkinlik:{slug, ad, gun, ay, yer, kalan, gorsel}|null, sonraki:[{ad, gun, ay, yer}] (büyük boy), eski})  yaklaşan rezervasyon ve etkinlik.
 *   Sayılar ekrandan gelir (GM.rotaSayi tek kaynak); widget hesap yapmaz. Android'de aynı widget Material You yüzeyiyle çizilir (gm-cihaz.css .gm-tel.is-android .gm-w2). */
(() => {
  const GM = window.GM, {esc, ik, kisit} = GM;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const bas = (ikon, metin, renk, sag = '') => `<span class="${liste('gm-w2-bas', `is-${renk}`)}">${ik(ikon)}<b>${esc(metin)}</b>${sag ? `<small>${sag}</small>` : ''}</span>`;
  const dugme = d => GM.w2Dugme(d);
  const foto = (src, sinif = 'gm-wr-kucukfoto') => (src ? `<span class="${sinif}"><img src="${esc(src)}" alt=""></span>` : '');
  const glif = d => (d?.gorsel ? foto(d.gorsel) : `<span class="gm-wr-glif is-${esc(d?.tur || 'mekan')}">${ik(d?.tur && d.tur !== 'mekan' ? d.tur : 'utensils')}</span>`);
  const sapma = d => (d?.sapma == null ? '' : d.sapma <= 2 ? 'yol üstü' : `+${d.sapma} dk`);
  // Ortak yolculuk çubuğu (GM.rotaIlerleme); kalkış/varış etiketi altında ayrı satır, uçlarda halka yok.
  const yol = o => `<span class="gm-wr-yol">${GM.rotaIlerleme(o, 'is-w2')}${o.rota?.kalkis ? GM.rotaUclar(esc(o.rota.kalkis), esc(o.rota.varis || '')) : ''}</span>`;
  const cip = (ikon, metin) => `<span class="gm-wr-cip">${ik(ikon)}<span>${esc(metin)}</span></span>`;
  const giris = (boy, tur, ikon, ad, renk) => GM.w2Kabuk({boy, tur, ac: '#/giris', sinif: 'is-hal', etiket: `${ad}: giriş yap`, icerik: `${bas(ikon, ad, renk)}<span class="gm-w2-yok">${ik('right-to-bracket')}<b>Giriş yap</b>${boy === 'kucuk' ? '' : '<small>Rotaların ve rezervasyonların burada görünsün</small>'}</span>`});

  GM.wgRota = (o = {}) => {
    const boy = o.boy || 'kucuk', d = o.durak || {}, r = o.rota || {};
    if (o.hal === 'giris') return giris(boy, 'rota', 'route', 'Dada Route', 'rota');
    if (o.hal === 'hazir') {
      const l = o.kayitlilar || [];
      if (!l.length) return GM.w2Kabuk({boy, tur: 'rota', ac: '#/rota/planla', etiket: 'Dada Route: kayıtlı rota yok, rota planla', icerik: `${bas('route', 'Dada Route', 'rota')}<span class="gm-w2-yok">${ik('route')}<b>Rotanı çiz</b>${boy === 'kucuk' ? '' : '<small>Kaydettiğin rota burada tek dokunuşla başlar</small>'}</span>`});
      const sema = (x, w, h) => `<span class="gm-wr-sema">${GM.rotaCizgi({rota: {cizgi: x.cizgi}, pinler: [{lng: x.cizgi[0][0], lat: x.cizgi[0][1], uc: true}, {lng: x.cizgi.at(-1)[0], lat: x.cizgi.at(-1)[1], uc: true}], w, h, dolgu: {top: 12, right: 12, bottom: 12, left: 12}, sinif: 'is-w2'})}</span>`;
      const satir = x => `<span class="${liste('gm-wr-satir', x.bugun && 'is-bugun')}">${sema(x, 64, 64)}<span class="gm-wr-metin"><b>${esc(x.ad)}</b><small>${esc(x.bugun ? `Bugün yola çıkıyorsun · ${x.yolUstu} yol üstü durak hazır` : x.ozet)}</small></span>${dugme({kod: 'rota-baslat', id: x.id, ikon: 'play', metin: 'Yola çık', aria: `${x.ad}: yola çık`, ton: 'rota'})}</span>`;
      const ilk = l[0];
      if (boy === 'kucuk') return GM.w2Kabuk({boy, tur: 'rota', ac: `#/rota/ozet/${ilk.id}`, etiket: `Kayıtlı rota ${ilk.ad}, ${ilk.ozet}. Başlat`, icerik: `${bas('route', 'Kayıtlı rota', 'rota')}${sema(ilk, 120, 56)}<span class="gm-wr-metin"><b>${esc(ilk.ad)}</b><small>${esc(ilk.kisa || ilk.ozet)}</small></span>${dugme({kod: 'rota-baslat', id: ilk.id, ikon: 'play', metin: 'Yola çık', tam: true, ton: 'rota'})}`});
      return GM.w2Kabuk({boy, tur: 'rota', ac: '#/rota/rotalarim', etiket: `Kayıtlı rotalar: ${l.map(x => x.ad).join(', ')}`, icerik: `${bas('route', 'Kayıtlı rotalar', 'rota', `${l.length}`)}<span class="gm-wr-liste">${l.slice(0, boy === 'orta' ? 2 : 4).map(satir).join('')}</span>${boy === 'buyuk' ? dugme({ac: '#/rota/planla', ikon: 'plus', metin: 'Yeni rota', tam: true, ton: 'ikincil'}) : ''}`});
    }
    const etiket = `Dada Route ${r.kalkis} → ${r.varis}: sıradaki ${d.ad}, ${d.uzak}, ${sapma(d)}; ${o.kalan}; ${o.yolUstu} yol üstü durak`;
    const ac = `#/rota/surus/${r.id || ''}`;
    if (boy === 'kucuk') return GM.w2Kabuk({eski: o.eski, boy, tur: 'rota', ac, etiket, icerik: `${bas('route', 'Sıradaki', 'rota', esc(d.sure || ''))}<span class="gm-wr-km"><b>${esc(d.uzak)}</b></span><span class="gm-wr-metin"><b>${esc(d.ad)}</b><small>${esc(sapma(d))}</small></span>${yol({...o, rota: {}})}`});
    const ust = `<span class="gm-wr-durak">${glif(d)}<span class="gm-wr-metin"><small>Sıradaki durak</small><b>${esc(d.ad)}</b><small>${esc([d.sure, sapma(d)].filter(Boolean).join(' · '))}</small></span><span class="gm-wr-km is-sag"><b>${esc(d.uzak)}</b></span></span>`;
    const alt = `<span class="gm-wr-alt"><small>${esc(o.kalan || '')}</small>${cip('road', `${o.yolUstu} yol üstü`)}</span>`;
    const yolSay = boy === 'buyuk' && o.yolSayi ? `<span class="gm-wr-alt is-sol">${o.yolSayi.map(x => cip(x.ikon, x.metin)).join('')}</span>` : '';
    if (boy === 'orta') return GM.w2Kabuk({eski: o.eski, boy, tur: 'rota', ac, etiket, icerik: `${bas('route', `${r.kalkis} → ${r.varis}`, 'rota', o.varis ? `Varış ${esc(o.varis)}` : '')}${ust}${yol(o)}${alt}`});
    const sonraki = (o.sonraki || []).slice(0, 3).map(x => `<span class="gm-wr-satir is-ince"><span class="gm-wr-glif is-${esc(x.tur)} is-kucuk">${ik(x.tur === 'mekan' ? 'utensils' : x.tur)}</span><span class="gm-wr-metin"><b>${esc(x.ad)}</b></span><small class="gm-wr-sagmetin">${esc(x.uzak)}</small></span>`).join('');
    return GM.w2Kabuk({eski: o.eski, boy, tur: 'rota', ac, etiket, icerik: `${bas('route', `${r.kalkis} → ${r.varis}`, 'rota', o.varis ? `Varış ${esc(o.varis)}` : '')}${ust}${yol(o)}${alt}${yolSay}<span class="gm-w2-ayrac"></span><small class="gm-w2-etiket">Sonra</small><span class="gm-wr-liste">${sonraki}</span><span class="gm-wr-dugmeler">${dugme({kod: o.eylem?.kod || 'rota-gec', ikon: 'forward', metin: 'Geç', ton: 'ikincil', aria: 'Durağı geç'})}${dugme({ac, ikon: 'location-arrow', metin: 'Navigasyonda aç', ton: 'rota'})}</span>`});
  };

  GM.wgYakin = (o = {}) => {
    const boy = o.boy || 'kucuk', l = o.mekanlar || [], m = l[0];
    if (!m) return GM.w2Kabuk({boy, tur: 'yakin', ac: '#/mekanlar', etiket: 'Yakınında Dada mekânı yok', icerik: `${bas('location-dot', 'Yakınında', 'yakin')}<span class="gm-w2-yok">${ik('location-crosshairs')}<b>Konum kapalı</b>${boy === 'kucuk' ? '' : '<small>Konumuna izin ver, yakındaki mekânlar görünsün</small>'}</span>`});
    const durum = x => (x.acik == null ? '' : `<span class="${liste('gm-wr-acik', x.acik ? 'is-acik' : 'is-kapali')}">${x.acik ? 'Açık' : 'Kapalı'}</span>`);
    const etiket = `Yakınında, ${o.konum || ''}: ${l.slice(0, 3).map(x => `${x.ad} ${x.mesafe}`).join(', ')}`;
    if (boy === 'kucuk') return GM.w2Kabuk({eski: o.eski, boy, tur: 'yakin', sinif: 'is-fotolu', ac: `#/mekan/${m.slug}`, etiket, icerik: `${foto(m.gorsel, 'gm-wr-zemin')}<span class="gm-wr-ust">${bas('location-dot', 'Yakınında', 'yakin', esc(m.mesafe))}</span><span class="gm-wr-metin is-foto"><small>${esc([m.kategori, m.ilce].filter(Boolean).join(' · '))}</small><b>${esc(m.ad)}</b></span>`});
    const satir = x => `<span class="gm-wr-satir">${foto(x.gorsel)}<span class="gm-wr-metin"><b>${esc(x.ad)}</b><small>${esc([x.kategori, x.ilce].filter(Boolean).join(' · '))}</small></span><span class="gm-wr-sag"><b>${esc(x.mesafe)}</b>${durum(x)}</span></span>`;
    if (boy === 'orta') return GM.w2Kabuk({eski: o.eski, boy, tur: 'yakin', ac: '#/mekanlar', etiket, icerik: `${bas('location-dot', 'Yakınında', 'yakin', esc(o.konum || ''))}<span class="gm-wr-liste">${l.slice(0, 2).map(satir).join('')}</span>`});
    return GM.w2Kabuk({eski: o.eski, boy, tur: 'yakin', ac: '#/mekanlar', etiket, icerik: `${bas('location-dot', 'Yakınında', 'yakin', esc(o.konum || ''))}<span class="gm-wr-kapak">${foto(m.gorsel, 'gm-wr-zemin')}<span class="gm-wr-metin is-foto"><small>${esc([m.kategori, m.mesafe].filter(Boolean).join(' · '))}</small><b>${esc(m.ad)}</b></span></span><span class="gm-wr-liste">${l.slice(1, 4).map(satir).join('')}</span>`});
  };

  GM.wgPlan = (o = {}) => {
    const boy = o.boy || 'kucuk', z = o.rez, e = o.etkinlik;
    if (o.hal === 'giris') return giris(boy, 'plan', 'calendar-check', 'Planların', 'plan');
    const takvim = (gun, ay) => `<span class="gm-wr-takvim" aria-hidden="true"><small>${esc(ay)}</small><b>${esc(gun)}</b></span>`;
    const rozet = d => `<span class="${liste('gm-wr-rozet', d === 'onay' ? 'is-onay' : 'is-talep')}">${ik(d === 'onay' ? 'check' : 'hourglass-half')}${d === 'onay' ? 'Onaylandı' : 'Onay bekliyor'}</span>`;
    const rezBlok = z ? `<span class="gm-wr-plan">${takvim(z.gun, z.ay)}<span class="gm-wr-metin"><small>Rezervasyon · ${esc(z.gunAd)}</small><b>${esc(z.ad)}</b><small>${esc(z.saat)} · ${esc(z.kisi)} kişi</small></span></span>` : `<span class="gm-wr-plan is-bos">${ik('calendar-check')}<span class="gm-wr-metin"><b>Rezervasyon yok</b><small>Mekânlardan masa ayırt</small></span></span>`;
    const etkBlok = e ? `<span class="gm-wr-plan">${foto(e.gorsel)}<span class="gm-wr-metin"><small>Etkinlik · ${esc(e.kalan)}</small><b>${esc(e.ad)}</b><small>${esc(`${e.gun} ${e.ay} · ${e.yer}`)}</small></span></span>` : '';
    const etiket = `Planların: ${z ? `${z.ad} rezervasyonu ${z.gun} ${z.ay} ${z.saat}, ${z.durum === 'onay' ? 'onaylandı' : 'onay bekliyor'}` : 'rezervasyon yok'}${e ? `; ${e.ad}, ${e.gun} ${e.ay}` : ''}`;
    if (boy === 'kucuk') return GM.w2Kabuk({eski: o.eski, boy, tur: 'plan', ac: z ? `#/mekan/${z.slug}` : '#/etkinlikler', etiket, icerik: z
      ? `${bas('calendar-check', 'Rezervasyon', 'plan')}<span class="gm-wr-buyuktarih">${takvim(z.gun, z.ay)}<span class="gm-wr-km"><b>${esc(z.saat)}</b></span></span><span class="gm-wr-metin"><b>${esc(z.ad)}</b><small>${esc(z.gunAd)} · ${esc(z.kisi)} kişi</small></span>${rozet(z.durum)}`
      : `${bas('calendar-days', 'Etkinlik', 'plan')}${etkBlok}`});
    const gor = boy === 'orta' ? `${rezBlok}<span class="gm-w2-ayrac"></span>${etkBlok}` : `${rezBlok}${z ? rozet(z.durum) : ''}<span class="gm-w2-ayrac"></span>${e ? `<span class="gm-wr-kapak is-etkinlik">${foto(e.gorsel, 'gm-wr-zemin')}<span class="gm-wr-metin is-foto"><small>Etkinlik · ${esc(e.kalan)}</small><b>${esc(e.ad)}</b><small>${esc(`${e.gun} ${e.ay} · ${e.yer}`)}</small></span></span>` : ''}${(o.sonraki || []).length ? `<span class="gm-wr-liste">${o.sonraki.slice(0, 2).map(x => `<span class="gm-wr-satir is-ince"><span class="gm-wr-takvim is-kucuk" aria-hidden="true"><small>${esc(x.ay)}</small><b>${esc(x.gun)}</b></span><span class="gm-wr-metin"><b>${esc(x.ad)}</b></span><small class="gm-wr-sagmetin">${esc(x.yer)}</small></span>`).join('')}</span>` : ''}${dugme({ac: '#/etkinlikler', ikon: 'calendar-days', metin: 'Takvimim', tam: true, ton: 'ikincil'})}`;
    return GM.w2Kabuk({eski: o.eski, boy, tur: 'plan', ac: z ? `#/mekan/${z.slug}` : '#/etkinlikler', etiket, icerik: `${bas('calendar-check', 'Yaklaşan', 'plan')}${gor}`});
  };
})();
/* ---------- Gourmet widget'ları, ikinci dalga (docs/WIDGET-ARASTIRMA.md §4 G4–G8, §1.5 StandBy, §1.8 Android Live Update). Aynı W2 kabuğu ve gm-wr-* parçaları ----------
 *   GM.wgSofra({boy, ogun:{ad, ikon, saat}, mekanlar:[{slug, ad, semt, mesafe, gorsel, acik}], bos:{baslik, metin}})  G5: saatine göre öğün etiketi + yakındaki açık Dada mekânları.
 *   GM.wgMasam({boy, hal:'yaklasan'|'sonra', rez:{slug, ad, saat, gunAd, kisi, durum:'onay'|'talep', semt, gorsel}, kalan})  G4: dev saat + durum metni; saat geçince "nasıldı?" + Ziyaret Ettim.
 *   GM.wgTakvim({boy, etkinlik:{slug, ad, tur, gun, ay, yer, kalanGun, gorsel}, hatirlat})  G6: dev gün sayısı; orta boyda Hatırlat anahtarı (Toggle, App Intent).
 *   GM.wgLezzet({boy, yazi:{slug, ad, kategori, sure, gorsel}, kayitli, alt})  G7: editoryal kapak + başlık; Kaydet düğmesi.
 *   GM.wgDefter({boy, puan, bekleyen, rutbe, sonraki, kalan, oran, rozet:{ad, ikon}})  G8: sonraki rütbeye kalan puan halkası (kesinleşen dolu, bekleyen ayrı).
 *   GM.wgKoleksiyon({boy, baslik, sayi, ogeler:[{ad, gorsel, alt}]})  kaydedilenler (ızgara).
 *   GM.standbyGourmet({sol:{ust, buyuk, ad, alt}, sag:{...}})  StandBy (yatay, şarjda): arka plansız, büyük metin; sayfa dikey iframe'de 90° döner.
 *   GM.androidPerde({saat, tarih, icerik}) bildirim perdesi · GM.androidLiveUpdate({baslik, metin, zaman, noktalar:[{x, tur, gecildi}], oran, eylemler, gorsel})
 *     Android 16 ProgressStyle: sistem yüzeyi (marka rengiyle boyama yok; marka yalnız küçük ikon, iz ikonu ve Dada durak noktalarında) · GM.androidSurekli({baslik, metin, zaman, oran, eylemler}) Android ≤15 ongoing yedeği ya da (oran yoksa) sıradan bildirim. */
(() => {
  const GM = window.GM, {esc, ik, kisit} = GM;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const bas = (ikon, metin, renk, sag = '') => `<span class="${liste('gm-w2-bas', `is-${renk}`)}">${ik(ikon)}<b>${esc(metin)}</b>${sag ? `<small>${sag}</small>` : ''}</span>`;
  const foto = (src, sinif = 'gm-wr-kucukfoto') => (src ? `<span class="${sinif}"><img src="${esc(src)}" alt=""></span>` : '');
  const durumMetin = x => (x.acik == null ? '' : x.acik ? 'Açık' : 'Kapalı');   // anlam metinde (tinted kipte renk kaybolur)

  GM.wgSofra = (o = {}) => {
    const boy = o.boy || 'kucuk', og = o.ogun || {}, l = o.mekanlar || [], m = l[0];
    const ust = bas(og.ikon || 'utensils', og.ad || 'Sofra saati', 'yakin', esc(og.saat || ''));
    if (!m) return GM.w2Kabuk({boy, tur: 'yakin', ac: '#/mekanlar', etiket: `${og.ad}: ${o.bos?.baslik || ''}`, icerik: `${ust}<span class="gm-w2-yok">${ik('mug-hot')}<b>${esc(o.bos?.baslik || 'Yakında açık mekân yok')}</b>${boy === 'kucuk' ? '' : `<small>${esc(o.bos?.metin || '')}</small>`}</span>`});
    const satir = x => `<span class="gm-wr-satir">${foto(x.gorsel)}<span class="gm-wr-metin"><b>${esc(x.ad)}</b><small>${esc([x.semt, durumMetin(x)].filter(Boolean).join(' · '))}</small></span><span class="gm-wr-sagmetin">${esc(x.mesafe)}</span></span>`;
    const etiket = `${og.ad}, ${og.saat}: ${l.slice(0, 3).map(x => `${x.ad} ${x.mesafe} ${durumMetin(x)}`).join(', ')}`;
    if (boy === 'kucuk') return GM.w2Kabuk({boy, tur: 'yakin', sinif: 'is-fotolu', ac: `#/mekan/${m.slug}`, etiket, icerik: `${foto(m.gorsel, 'gm-wr-zemin')}<span class="gm-wr-ust">${ust}</span><span class="gm-wr-metin is-foto"><small>${esc([m.semt, m.mesafe, durumMetin(m)].filter(Boolean).join(' · '))}</small><b>${esc(m.ad)}</b></span>`});
    if (boy === 'orta') return GM.w2Kabuk({boy, tur: 'yakin', ac: '#/mekanlar', etiket, icerik: `${ust}<span class="gm-wr-ikiz">${foto(m.gorsel, 'gm-wr-kare')}<span class="gm-wr-liste">${l.slice(0, 3).map(satir).join('')}</span></span>`});
    return GM.w2Kabuk({boy, tur: 'yakin', ac: '#/mekanlar', etiket, icerik: `${ust}<span class="gm-wr-kapak">${foto(m.gorsel, 'gm-wr-zemin')}<span class="gm-wr-metin is-foto"><small>${esc([m.semt, m.mesafe, durumMetin(m)].filter(Boolean).join(' · '))}</small><b>${esc(m.ad)}</b></span></span><span class="gm-wr-liste">${l.slice(1, 4).map(satir).join('')}</span>${o.alt ? `<small class="gm-w2-etiket">${esc(o.alt)}</small>` : ''}`});
  };

  GM.wgMasam = (o = {}) => {
    const boy = o.boy || 'kucuk', z = o.rez || {}, durum = z.durum === 'onay' ? 'Onaylandı' : 'Mekân onayı bekleniyor';
    if (o.hal === 'sonra') {
      const icerik = `${bas('calendar-check', 'Masam', 'plan')}${boy === 'orta' ? `<span class="gm-wr-ikiz">${foto(z.gorsel, 'gm-wr-kare')}<span class="gm-wr-sor"><b>${esc(z.ad)} nasıldı?</b><small>${esc(`${z.gunAd} ${z.saat} · ${z.kisi} kişi`)}</small>${GM.w2Dugme({kod: 'ziyaret-ettim', id: z.slug, ikon: 'circle-check', metin: 'Ziyaret Ettim', ton: 'rota'})}</span></span>` : `<span class="gm-wr-sor"><b>${esc(z.ad)} nasıldı?</b><small>${esc(`${z.gunAd} ${z.saat}`)}</small></span>${GM.w2Dugme({kod: 'ziyaret-ettim', id: z.slug, ikon: 'circle-check', metin: 'Ziyaret Ettim', tam: true, ton: 'rota'})}`}`;
      return GM.w2Kabuk({boy, tur: 'plan', ac: `#/mekan/${z.slug}`, etiket: `${z.ad} nasıldı? Ziyaret Ettim`, icerik});
    }
    const etiket = `Masam: ${z.ad}, ${z.gunAd} ${z.saat}, ${z.kisi} kişi, ${durum}${o.kalan ? `, ${o.kalan}` : ''}`;
    const saat = `<span class="gm-wr-saat"><b>${esc(z.saat)}</b>${o.kalan ? `<small>${esc(o.kalan)}</small>` : ''}</span>`;
    if (boy === 'kucuk') return GM.w2Kabuk({boy, tur: 'plan', ac: `#/mekan/${z.slug}`, etiket, icerik: `${bas('calendar-check', 'Masam', 'plan', esc(z.gunAd))}${saat}<span class="gm-wr-metin"><b>${esc(z.ad)}</b><small>${esc(`${z.kisi} kişi · ${durum}`)}</small></span>`});
    return GM.w2Kabuk({boy, tur: 'plan', ac: `#/mekan/${z.slug}`, etiket, icerik: `${bas('calendar-check', 'Masam', 'plan', esc(z.gunAd))}<span class="gm-wr-ikiz">${foto(z.gorsel, 'gm-wr-kare')}<span class="gm-wr-masa">${saat}<span class="gm-wr-metin"><b>${esc(z.ad)}</b><small>${esc(`${z.semt} · ${z.kisi} kişi`)}</small><small>${esc(durum)}</small></span><span class="gm-wr-bag">${ik('location-arrow')}Yol tarifi</span></span></span>`});
  };

  GM.wgTakvim = (o = {}) => {
    const boy = o.boy || 'kucuk', e = o.etkinlik || {};
    const gun = `<span class="gm-wr-saat"><b>${esc(e.kalanGun)}</b><small>gün</small></span>`;
    const etiket = `Lezzet Takvimi: ${e.ad}, ${e.kalanGun} gün sonra, ${e.gun} ${e.ay}, ${e.yer}. Hatırlatma ${o.hatirlat ? 'açık' : 'kapalı'}`;
    if (boy === 'kucuk') return GM.w2Kabuk({boy, tur: 'plan', ac: `#/etkinlik/${e.slug}`, etiket, icerik: `${bas('calendar-days', 'Lezzet Takvimi', 'plan')}${gun}<span class="gm-wr-metin"><b>${esc(e.ad)}</b><small>${esc(`${e.gun} ${e.ay} · ${e.yer}`)}</small></span>`});
    const anahtar = `<button type="button" class="${liste('gm-wr-anahtar', o.hatirlat && 'is-acik')}" role="switch" aria-checked="${!!o.hatirlat}" data-wg-eylem="hatirlat" data-id="${esc(e.slug)}"><span>Hatırlat</span><i aria-hidden="true"></i></button>`;
    return GM.w2Kabuk({boy, tur: 'plan', ac: `#/etkinlik/${e.slug}`, etiket, icerik: `${bas('calendar-days', 'Lezzet Takvimi', 'plan', esc(e.tur || ''))}<span class="gm-wr-ikiz">${foto(e.gorsel, 'gm-wr-kare')}<span class="gm-wr-masa">${gun}<span class="gm-wr-metin"><b>${esc(e.ad)}</b><small>${esc(`${e.gun} ${e.ay} · ${e.yer}`)}</small></span>${anahtar}</span></span>`});
  };

  GM.wgLezzet = (o = {}) => {
    const boy = o.boy || 'orta', y = o.yazi || {};
    const kaydet = GM.w2Dugme({kod: 'lezzet-kaydet', id: y.slug, ikon: o.kayitli ? 'bookmark' : 'bookmark', metin: o.kayitli ? 'Kaydedildi' : 'Kaydet', ton: 'ikincil', aria: o.kayitli ? 'Kaydedildi' : 'Yazıyı kaydet'});
    const etiket = `Günün Gurme Lezzeti: ${y.ad}, ${y.kategori}, ${y.sure}`;
    const metin = `<span class="gm-wr-dergi"><small>${esc(y.kategori)}</small><b>${esc(y.ad)}</b><small>${esc([y.sure, o.alt].filter(Boolean).join(' · '))}</small></span>`;
    if (boy === 'orta') return GM.w2Kabuk({boy, tur: 'lezzet', ac: `#/lezzet/${y.slug}`, etiket, icerik: `<span class="gm-wr-ikiz is-genis">${foto(y.gorsel, 'gm-wr-kare is-uzun')}<span class="gm-wr-masa">${bas('book-open', 'Günün lezzeti', 'lezzet')}${metin}${kaydet}</span></span>`});
    return GM.w2Kabuk({boy, tur: 'lezzet', sinif: 'is-fotolu', ac: `#/lezzet/${y.slug}`, etiket, icerik: `${foto(y.gorsel, 'gm-wr-zemin')}<span class="gm-wr-ust">${bas('book-open', 'Günün Gurme Lezzeti', 'lezzet')}</span><span class="gm-wr-alttaki">${metin}${kaydet}</span>`});
  };

  GM.wgDefter = (o = {}) => {
    const boy = o.boy || 'kucuk', oran = kisit(o.oran || 0, 0, 1);
    const halka = `<span class="gm-wr-halka" style="--cih-o:${oran.toFixed(3)};--cih-b:${kisit(o.bekleyenOran || 0, 0, 1).toFixed(3)}" aria-hidden="true"><i class="gm-wr-halka-iz"></i><i class="gm-wr-halka-bek"></i><i class="gm-wr-halka-yay"></i><span><b>${esc(o.kalan)}</b><small>puan</small></span></span>`;
    const etiket = `Gurme Defterim: ${o.rutbe}, ${o.sonraki} rütbesine ${o.kalan} puan; ${o.puan} puan${o.bekleyen ? `, ${o.bekleyen} bekleyen` : ''}`;
    if (boy === 'kucuk') return GM.w2Kabuk({boy, tur: 'defter', ac: '#/profil', etiket, icerik: `${bas('medal', 'Gurme Defterim', 'lezzet')}<span class="gm-w2-merkez">${halka}</span><span class="gm-wr-metin is-orta"><b>${esc(o.sonraki)}’ye</b><small>${esc(o.rutbe)} · ${esc(o.puan)} puan</small></span>`});
    return GM.w2Kabuk({boy, tur: 'defter', ac: '#/profil', etiket, icerik: `${bas('medal', 'Gurme Defterim', 'lezzet', `${esc(o.puan)} puan`)}<span class="gm-wr-ikiz">${halka}<span class="gm-wr-masa"><span class="gm-wr-metin"><small>Rütbe</small><b>${esc(o.rutbe)}</b><small>${esc(o.sonraki)}’ye ${esc(o.kalan)} puan</small></span>${o.bekleyen ? `<small class="gm-w2-etiket">${esc(o.bekleyen)} puan onay bekliyor</small>` : ''}${o.rozet ? `<span class="gm-wr-rozet2">${ik(o.rozet.ikon)}<span><small>Son rozet</small><b>${esc(o.rozet.ad)}</b></span></span>` : ''}</span></span>`});
  };

  GM.wgKoleksiyon = (o = {}) => {
    const boy = o.boy || 'orta', l = o.ogeler || [];
    return GM.w2Kabuk({boy, tur: 'defter', ac: '#/profil', etiket: `${o.baslik}: ${o.sayi}`, icerik: `${bas('bookmark', o.baslik || 'Kaydettiklerim', 'lezzet', esc(String(o.sayi ?? l.length)))}<span class="${liste('gm-wr-izgara', `is-${boy}`)}">${l.slice(0, boy === 'buyuk' ? 6 : 3).map(x => `<span class="gm-wr-izgara-oge">${foto(x.gorsel, 'gm-wr-zemin')}<span class="gm-wr-metin is-foto"><b>${esc(x.ad)}</b>${x.alt ? `<small>${esc(x.alt)}</small>` : ''}</span></span>`).join('')}</span>`});
  };

  GM.standbyGourmet = (o = {}) => {
    const yuva = x => `<span class="gm-sbg-yuva"><small>${ik(x.ikon || 'utensils')}${esc(x.ust || '')}</small><b>${esc(x.buyuk || '')}</b><span>${esc(x.ad || '')}</span><small>${esc(x.alt || '')}</small></span>`;
    return `<section class="${liste('gm-sbg', o.gece && 'is-gece')}" role="img" aria-label="${esc(o.etiket || 'StandBy')}"><div class="gm-sbg-yatay">${yuva(o.sol || {})}${yuva(o.sag || {})}</div></section>`;
  };

  GM.androidPerde = (o = {}) => `<div class="gm-ap"><div class="gm-ap-ust"><b>${esc(o.saat || '')}</b><small>${esc(o.tarih || '')}</small></div><div class="gm-ap-ayar" aria-hidden="true">${['wifi', 'signal', 'location-dot', 'moon'].map((x, i) => `<span class="${i < 3 ? 'is-acik' : ''}">${ik(x)}</span>`).join('')}</div><div class="gm-ap-liste">${o.icerik || ''}</div></div>`;
  const eylemler = l => (l?.length ? `<span class="gm-alu-eylem">${l.map(e => `<button type="button"${e.kod ? ` data-wg-eylem="${esc(e.kod)}"` : e.ac ? ` data-wg-ac="${esc(e.ac)}"` : ''}>${esc(e.metin)}</button>`).join('')}</span>` : '');
  const ustSatir = o => `<span class="gm-alu-ust"><img src="assets/marka/ikon-512.png" alt=""><span>Dada Gourmet</span><span aria-hidden="true">·</span><span>${esc(o.zaman || 'şimdi')}</span>${o.alarm ? ik('bell') : ''}</span>`;
  GM.androidLiveUpdate = (o = {}) => `<article class="gm-alu" aria-label="${esc(`Dada Gourmet canlı güncelleme: ${o.baslik}. ${o.metin}`)}">${ustSatir(o)}<span class="gm-alu-govde"><span class="gm-alu-metin"><b>${esc(o.baslik)}</b><span>${esc(o.metin)}</span></span>${o.gorsel ? `<img class="gm-alu-foto" src="${esc(o.gorsel)}" alt="">` : ''}</span>
    <span class="gm-alu-cubuk" style="--cih-o:${kisit(o.oran || 0, 0, 1).toFixed(3)}" aria-hidden="true"><i class="gm-alu-dolu"></i>${(o.noktalar || []).map(n => `<span class="${liste('gm-alu-nokta', `is-${n.tur === 'mekan' ? 'mekan' : 'yol'}`, n.gecildi && 'is-gecildi')}" style="--x:${kisit(n.x, 0, 1).toFixed(3)}"></span>`).join('')}<span class="gm-alu-iz">${ik('car-side')}</span></span>${eylemler(o.eylemler)}</article>`;
  GM.androidSurekli = (o = {}) => `<article class="${o.oran == null ? 'gm-alu' : 'gm-alu is-eski'}" aria-label="${esc(`Dada Gourmet ${o.oran == null ? 'bildirimi' : 'sürekli bildirim'}: ${o.baslik}. ${o.metin}`)}">${ustSatir(o)}<span class="gm-alu-govde"><span class="gm-alu-metin"><b>${esc(o.baslik)}</b><span>${esc(o.metin)}</span></span>${o.gorsel ? `<img class="gm-alu-foto" src="${esc(o.gorsel)}" alt="">` : ''}</span>${o.oran == null ? '' : `<progress class="gm-alu-klasik" max="100" value="${Math.round(kisit(o.oran, 0, 1) * 100)}"></progress>`}${eylemler(o.eylemler)}</article>`;
})();
/* ---------- Widget yüzeyi (Görev 9): tek ekran telefon yüzeyi ve yeniden tasarlanan Gourmet widget'ları (gm-wy-*; stil gm-cihaz.css "Widget yüzeyi") ----------
 * Ekran ekranlar/widget.js (#/widget/yuzey). Ölçü cqi: iOS 393 pt ekranda 1 pt ≈ 0,2545cqi; Android 412 dp aynı genişliğe ölçeklenir.
 *   GM.wyTelefon({platform, tema, kip:'renkli'|'seffaf', saat, ada, adaMin, durumCip, icerik, kilit:{tarih, satir, aksesuar:[html], kontroller:[{ikon, svg}]}, alt, etiket, sinif})
 *     çerçevesiz tam sayfa telefon ekranı (390×844): iOS durum çubuğu (saat, sinyal, Wi‑Fi, pil) ve Dinamik Ada / Android saat solda ve kamera deliği; duvar kâğıdı tema + kipe göre;
 *     kilit: iOS kilit ekranı (tarih + satır içi widget, büyük saat, tek ton widget sırası, altta iki denetim) ya da Android kilit ekranı (saat ve tarih solda).
 *   GM.wyAna({platform, hucreler:[html], dock:[uyg], tarih})  ana ekran: iOS 4 sütun (68 pt, ara 22 pt) × 6 satır (60 pt, ara 38 pt) ızgara, Ara hapı, Dock;
 *     Android: tek bakışta (tarih), 4 sütun ızgara, Dock ve arama çubuğu. Hücre: GM.wyKabuk(...) ya da GM.wyUyg({ad, ikon, renk}|{ad, gorsel}).
 *   GM.wyKabuk({boy:'kucuk'|'orta'|'buyuk', tur, ac, etiket, icerik, eski, foto, sinif})  iOS köşe 22 pt, iç kenar 16 pt; Android köşe 28 dp, Material You yüzeyi.
 *   Widget'lar (hal:'giris'|'bos'; eski:'HH.MM' çevrimdışı damgası): GM.wyRota (G2), GM.wyRotalar (G3), GM.wyYolculuk, GM.wySofra (G5), GM.wyMasam (G4),
 *     GM.wyTakvim (G6), GM.wyLezzet (G7), GM.wyDefter (G8), GM.wyKoleksiyon. Sayılar ekrandan gelir; widget hesap yapmaz, uydurmaz.
 *   GM.wyStandby({platform, gece, saat, tarih, sol, sag})  yatay sayfa (844×390): iOS StandBy (iki widget, arka plan yok, gece kırmızı tek ton) / Android şarj ekranı (saat + widget).
 *   GM.wyBildirim({platform, baslik, metin, zaman, gorsel, eylemler, genis})  sıradan bildirim (iOS kart, genis: basılı tutunca açılan zengin bildirim).
 *   GM.wyMasaKarti({rez, kalanSn, eylem}) iOS 26 zamanlanmış Canlı Etkinlik (rezervasyon) · GM.wyAdaMasa({tur:'kompakt'|'genis', rez, kalanSn}) aynı etkinliğin Dinamik Ada hali. */
(() => {
  const GM = window.GM, {esc, ik, kisit} = GM;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const SIMGE = 'assets/marka/ikon-512.png';
  const BOY = {kucuk: 's', orta: 'm', buyuk: 'l'};
  const FENER = '<svg class="gm-tel-fener" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M8.2 2h7.6A1.2 1.2 0 0 1 17 3.2V6l-2 4v10.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 20.5V10L7 6V3.2A1.2 1.2 0 0 1 8.2 2zM7.6 5.1h8.8v1.1H7.6zM12 12.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 1 0 0-2.6z"/></svg>';

  // ---------- Telefon ekranı ----------
  const sistem = p => `<span class="${liste('gm-wy-sistem', p === 'android' && 'is-and')}" aria-hidden="true">${p === 'android' ? ik('wifi') : ''}<span class="gm-wy-sinyal"><i></i><i></i><i></i><i></i></span>${p === 'android' ? '' : ik('wifi')}<span class="gm-wy-pil"><i></i></span></span>`;
  const kilitIos = (o, k) => `<div class="gm-wy-kilit"><span class="gm-wy-kilit-ikon" aria-hidden="true">${ik('lock')}</span><p class="gm-wy-kilit-tarih"><span>${esc((k.satir && k.tarihKisa) || k.tarih || '')}</span>${k.satir ? `<span class="gm-wy-kilit-satir">${k.satir}</span>` : ''}</p><b class="gm-wy-kilit-saat">${esc(o.saat || '')}</b>${k.aksesuar?.length ? `<span class="gm-wy-kilit-aks">${k.aksesuar.join('')}</span>` : ''}</div>`;
  const kilitAnd = (o, k) => `<div class="gm-wy-kilit is-and"><b class="gm-wy-kilit-saat">${esc(o.saat || '')}</b><p class="gm-wy-kilit-tarih">${esc(k.tarih || '')}</p></div>`;
  const kontroller = k => `<span class="gm-wy-kontroller" aria-hidden="true">${(k.kontroller || [{svg: FENER}, {ikon: 'camera'}]).map(x => `<span class="${liste(x.etiket && 'is-etiketli')}">${x.svg || ik(x.ikon)}${x.etiket ? `<small>${esc(x.etiket)}</small>` : ''}</span>`).join('')}</span>`;
  GM.wyTelefon = (o = {}) => {
    const p = o.platform === 'android' ? 'android' : 'ios', ios = p === 'ios', k = o.kilit;
    const sinif = liste('gm-tel', `is-${p}`, o.tema === 'koyu' ? 'is-koyu' : 'is-acik', 'is-cercevesiz', 'is-wy', o.kip && `is-wy-${o.kip}`, k && 'is-wy-kilitli', o.sinif);
    const tepe = ios ? `<span class="${liste('gm-tel-ada', o.adaMin && 'is-bolunmus')}">${o.ada || ''}</span>${o.adaMin ? `<span class="gm-tel-ada-min">${o.adaMin}</span>` : ''}` : '<span class="gm-tel-delik"></span>';
    const durum = `<div class="gm-tel-durum gm-wy-durum"><span class="gm-tel-durum-sol">${k && ios ? '' : `<b>${esc(o.saat || '')}</b>`}${o.durumCip || ''}</span>${sistem(p)}</div>`;
    const kilit = k ? (ios ? kilitIos(o, k) : kilitAnd(o, k)) : '';
    const altlar = k ? (ios ? kontroller(k) : `<span class="gm-wy-parmak" aria-hidden="true">${ik('fingerprint')}</span>`) : '';
    return `<figure class="${sinif}" role="group" aria-label="${esc(o.etiket || '')}"><div class="gm-tel-govde"><div class="gm-tel-ekran"><span class="gm-tel-duvar"></span>${tepe}${durum}<div class="${liste('gm-tel-icerik', k && 'is-wy-kilit')}">${kilit}${o.icerik || ''}</div>${altlar}${o.alt || ''}<span class="gm-tel-cubuk"></span></div></div></figure>`;
  };

  // ---------- Ana ekran ----------
  GM.wyUyg = (x = {}) => (x.gorsel
    ? `<span class="gm-wy-uyg is-dada"><img src="${esc(x.gorsel)}" alt="">${x.ad ? `<small>${esc(x.ad)}</small>` : ''}</span>`
    : `<span class="gm-wy-uyg" aria-hidden="true"><i style="--sg:var(--gm-${esc(x.renk || 'slate')})">${ik(x.ikon || 'circle')}</i>${x.ad ? `<small>${esc(x.ad)}</small>` : ''}</span>`);
  GM.wyAna = (o = {}) => {
    const and = o.platform === 'android';
    const dock = (o.dock || []).length ? `<span class="gm-wy-dock" aria-hidden="true">${o.dock.map(x => GM.wyUyg({...x, ad: ''})).join('')}</span>` : '';
    const ara = and ? `<span class="gm-wy-gara" aria-hidden="true">${ik('magnifying-glass')}<span>Ara</span>${ik('microphone')}${ik('camera')}</span>` : `<span class="gm-wy-ara" aria-hidden="true">${ik('magnifying-glass')}<span>Ara</span></span>`;
    return `<div class="${liste('gm-wy-ana', and && 'is-and')}">${and && o.tarih ? `<p class="gm-wy-bakis">${esc(o.tarih)}</p>` : ''}<div class="gm-wy-izgara">${(o.hucreler || []).join('')}</div>${and ? `${dock}${ara}` : `${ara}${dock}`}</div>`;
  };

  // ---------- Kabuk ve parçalar ----------
  GM.wyKabuk = (o = {}) => `<div class="${liste('gm-wy', `is-${BOY[o.boy] || 's'}`, o.tur && `is-${o.tur}`, o.foto && 'is-foto', o.eski && 'is-eski', o.hal && 'is-hal', o.sinif)}">${o.ac ? `<button type="button" class="gm-wy-ac" data-wg-ac="${esc(o.ac)}" aria-label="${esc(`${o.etiket || ''}${o.eski ? `. Son güncelleme ${o.eski}` : ''}`)}"></button>` : ''}<div class="gm-wy-ic">${o.icerik || ''}</div>${o.eski ? `<small class="gm-wy-damga" aria-hidden="true">${ik('clock-rotate-left')}${esc(o.eski)}</small>` : ''}</div>`;
  const bas = (ikon, metin, sag = '') => `<span class="gm-wy-bas">${ik(ikon)}<b>${esc(metin)}</b>${sag ? `<small>${sag}</small>` : ''}</span>`;
  const foto = (src, sinif = 'gm-wy-foto') => (src ? `<span class="${sinif}"><img src="${esc(src)}" alt=""></span>` : '');
  const dugme = d => `<button type="button" class="${liste('gm-wy-dugme', d.ton && `is-${d.ton}`, d.tam && 'is-tam', d.yalniz && 'is-yalniz')}"${d.kod ? ` data-wg-eylem="${esc(d.kod)}"${d.id ? ` data-id="${esc(d.id)}"` : ''}` : ` data-wg-ac="${esc(d.ac || '')}"`} aria-label="${esc(d.aria || d.metin)}">${d.ikon ? ik(d.ikon) : ''}${d.yalniz ? '' : `<span>${esc(d.metin)}</span>`}</button>`;
  const ipucu = m => (m ? `<small class="gm-wy-ipucu">${ik('location-crosshairs')}<span>${esc(m)}</span></small>` : '');
  const ad = (b, s, sinif) => `<span class="${liste('gm-wy-ad', sinif)}"><b>${esc(b)}</b>${s ? `<small>${s}</small>` : ''}</span>`;
  // Giriş yok / ilk gün: tek mesaj, gövde ilgili sayfayı açar; içerik uydurulmaz.
  const hal = (o, tur, ikon, baslik, mesaj, alt, ac, eylem) => GM.wyKabuk({boy: o.boy, tur, ac, hal: true, eski: o.eski, etiket: `${baslik}: ${mesaj}`, icerik: `${bas(ikon, baslik)}<span class="gm-wy-hal">${ik(o.hal === 'giris' ? 'right-to-bracket' : ikon)}<b>${esc(mesaj)}</b>${o.boy !== 'kucuk' && alt ? `<small>${esc(alt)}</small>` : ''}${o.boy !== 'kucuk' && eylem ? dugme(eylem) : ''}</span>`});
  const glif = d => (d?.gorsel ? foto(d.gorsel, 'gm-wy-glif is-foto') : `<span class="${liste('gm-wy-glif', `is-${esc(d?.tur || 'mekan')}`)}">${ik(d?.tur === 'yakit' ? 'gas-pump' : d?.tur === 'sarj' ? 'charging-station' : 'utensils')}</span>`);
  const halka = (oran, ic, bek) => `<span class="gm-wy-halka" style="--cih-o:${kisit(oran || 0, 0, 1).toFixed(3)};--cih-b:${kisit(bek || 0, 0, 1).toFixed(3)}" aria-hidden="true"><i class="gm-wy-halka-iz"></i>${bek ? '<i class="gm-wy-halka-bek"></i>' : ''}<i class="gm-wy-halka-yay"></i><span>${ic}</span></span>`;

  // ---------- G2 · Sıradaki Durak (Dada Route canlı yolculuk; Flighty biniş kartı + Apple Haritalar varış dili) ----------
  // Baş bilgi sıradaki DADA durağı; yol katmanındaki ara durak (yakıt/şarj) yalnız ikincil satır "Önce: …" (nötr glif).
  // o: {boy, rota:{id, kalkis, varis, cizgi}, durak:{ad, turAd, il, ilce, uzak, sure, varis, sapma (dk), sapmaMetin:'Yol üstü'|'+7 dk', gorsel},
  //     once:{ad, tur, turAd, uzak}, oran, isaretler, konum:[lng, lat], gecilen, kalan, kalanSure, varis, sonraki:[{ad, gorsel, uzak, sapma}],
  //     ilKimlik (yalnız veride varsa), ipucu, oneri:{ad, ozet} (bos), hal, eski}
  const once = x => (x ? `<small class="gm-wy-once">${ik(x.tur === 'sarj' ? 'charging-station' : 'gas-pump')}<span>Önce: <b>${esc(x.ad)}</b> · ${esc([x.turAd, x.uzak].filter(Boolean).join(' '))}</span></small>` : '');
  const serit = (o, r) => `<span class="gm-wy-serit"><small>${esc(r.kalkis || '')}</small>${GM.rotaIlerleme(o, 'is-wy')}<small>${esc(r.varis || '')}</small></span>`;
  const siluet = (r, konum) => `<span class="gm-wy-siluet">${r.cizgi?.length ? GM.rotaKapakCizgi({rota: {cizgi: r.cizgi}, iller: konum ? [{lng: konum[0], lat: konum[1]}] : [], w: 150, h: 150, dolgu: {top: 16, right: 16, bottom: 16, left: 16}}) : ''}<small>${esc(`${r.kalkis || ''} → ${r.varis || ''}`)}</small></span>`;
  GM.wyRota = (o = {}) => {
    const boy = o.boy || 'kucuk', d = o.durak || {}, r = o.rota || {};
    if (o.hal === 'giris') return hal(o, 'rota', 'route', 'Dada Route', 'Giriş yap', 'Rotaların ve canlı yolculuğun burada görünsün', '#/giris');
    if (o.hal === 'bos') return hal(o, 'rota', 'route', 'Dada Route', 'Rotanı çiz', o.oneri ? `Bugünün Rotası: ${o.oneri.ad} · ${o.oneri.ozet}` : 'Yol üstündeki lezzetler yolculukta burada', '#/rota/planla', boy === 'buyuk' && {ac: '#/rota/planla', ikon: 'route', metin: 'Rota planla', ton: 'ana'});
    const ac = `#/rota/surus/${r.id || ''}`;
    const etiket = `Dada Route ${r.kalkis} → ${r.varis}: sıradaki Dada durağı ${d.ad}, ${d.ilce || ''} ${d.il || ''}, ${d.uzak}, ${d.sure}, ${d.sapmaMetin || ''}, varış ${d.varis}${o.once ? `; önce ${o.once.ad} ${o.once.turAd || ''} ${o.once.uzak}` : ''}${o.ipucu ? `. ${o.ipucu}` : ''}`;
    const sapma = d.sapmaMetin ? `<span class="gm-wy-sapma">${ik(/üstü/.test(d.sapmaMetin) ? 'road' : 'arrow-turn-up')}${esc(d.sapmaMetin)}</span>` : '';
    if (boy === 'kucuk') return GM.wyKabuk({boy, tur: 'rota', foto: true, ac, eski: o.eski, etiket, sinif: 'is-durak', icerik: `${foto(d.gorsel, 'gm-wy-zemin is-derin')}<span class="gm-wy-ust-satir"><small class="gm-wy-foto-etiket">${ik('route')}Sıradaki durak</small>${sapma}</span><span class="gm-wy-alt"><span class="gm-wy-dev is-foto">${esc(d.uzak)}</span><small class="gm-wy-sure">${esc(d.sure)}</small>${ad(d.ad, esc(d.ilce || ''))}</span>`});
    if (boy === 'orta') return GM.wyKabuk({boy, tur: 'rota', ac, eski: o.eski, etiket, sinif: 'is-durak', icerik: `<span class="gm-wy-yan is-durak"><span class="gm-wy-kare is-durak">${d.gorsel ? `<img src="${esc(d.gorsel)}" alt="">` : ''}${sapma}</span><span class="gm-wy-sutun">${bas('route', 'Sıradaki durak', `Varış <b>${esc(d.varis)}</b>`)}${ad(d.ad, esc([d.turAd, d.il].filter(Boolean).join(' · ')), 'is-durak')}<span class="gm-wy-dev is-orta">${esc(d.uzak)}<small>${esc(d.sure)}</small></span>${serit(o, r)}${once(o.once)}</span></span>`});
    const liste_ = (o.sonraki || []).slice(0, 3).map(x => `<span class="gm-wy-satir">${foto(x.gorsel, 'gm-wy-kucuk')}${ad(x.ad, esc([x.uzak, x.sapma].filter(Boolean).join(' · ')))}</span>`).join('');
    return GM.wyKabuk({boy, tur: 'rota', ac, eski: o.eski, etiket, sinif: 'is-durak', icerik: `<span class="gm-wy-kahraman">${foto(d.gorsel, 'gm-wy-zemin is-derin')}<span class="gm-wy-ust-satir"><small class="gm-wy-foto-etiket">${ik('route')}Sıradaki durak</small>${sapma}</span><span class="gm-wy-kahraman-alt">${ad(d.ad, esc([d.turAd, d.ilce, d.il].filter(Boolean).join(' · ')), 'is-buyuk')}<span class="gm-wy-mesafe is-foto"><b>${esc(d.uzak)}</b><small>${esc(`${d.sure} · varış ${d.varis}`)}</small></span></span></span>`
      + `<span class="gm-wy-yan is-rota-alt">${siluet(r, o.konum)}<span class="gm-wy-sutun"><small class="gm-wy-etiket"><span>Sonra</span><span>${esc(`${r.varis} ${o.varis}`)}</span></small><span class="gm-wy-liste">${liste_}</span></span></span>`
      + `${once(o.once)}${o.ilKimlik ? `<small class="gm-wy-once is-il">${ik('certificate')}<span>${esc(o.ilKimlik)}</span></small>` : ''}${dugme({ac, ikon: 'location-arrow', metin: 'Navigasyonda aç', tam: true, ton: 'ana'})}${ipucu(o.ipucu)}`});
  };
  // Yolculuk: geçilen yolun halkası, kalan ve varış; orta: + rota şeridi; büyük: + durgun rota silueti ve ara sayılar.
  GM.wyYolculuk = (o = {}) => {
    const boy = o.boy || 'kucuk';
    if (o.hal) return hal({...o, boy}, 'rota', 'flag-checkered', 'Yolculuk', o.hal === 'giris' ? 'Giriş yap' : 'Yolculuk yok', o.hal === 'giris' ? 'Canlı yolculuğun burada görünsün' : 'Yola çıkınca kalan yol ve varış burada', o.hal === 'giris' ? '#/giris' : '#/rota/planla');
    const r = o.rota || {}, yuzde = Math.round(kisit(o.oran || 0, 0, 1) * 100), ac = `#/rota/surus/${r.id || ''}`;
    const etiket = `Yolculuk ${r.kalkis} → ${r.varis}: yüzde ${yuzde}, ${o.kalan} kaldı, ${r.varis} varış ${o.varis}`;
    const h = halka(o.oran, `<b>%${yuzde}</b><small>yol</small>`);
    if (boy === 'kucuk') return GM.wyKabuk({boy, tur: 'rota', ac, eski: o.eski, etiket, icerik: `${bas('flag-checkered', 'Yolculuk')}<span class="gm-wy-merkez">${h}</span>${ad(`${r.varis} ${o.varis}`, esc(`${o.kalan} kaldı`), 'is-orta')}`});
    const ozet = `<span class="gm-wy-sutun">${ad(`${r.varis} ${o.varis}`, esc(`${o.kalan} · ${o.kalanSure} kaldı`), 'is-buyuk')}<small class="gm-wy-etiket"><span>${esc(`${o.gecilen} geride`)}</span></small></span>`;
    if (boy === 'orta') return GM.wyKabuk({boy, tur: 'rota', ac, eski: o.eski, etiket, icerik: `${bas('flag-checkered', `${r.kalkis} → ${r.varis}`)}<span class="gm-wy-yan is-defter">${h}${ozet}</span>${serit(o, r)}`});
    const sayi = (o.sayilar || []).map(x => `<span class="gm-wy-sayi">${ik(x.ikon)}<b>${esc(x.deger)}</b><small>${esc(x.ad)}</small></span>`).join('');
    return GM.wyKabuk({boy, tur: 'rota', ac, eski: o.eski, etiket, icerik: `${bas('flag-checkered', `${r.kalkis} → ${r.varis}`)}<span class="gm-wy-yan is-defter">${h}${ozet}</span>${serit(o, r)}<span class="gm-wy-yan is-rota-alt">${siluet(r, o.konum)}<span class="gm-wy-sayilar">${sayi}</span></span>`});
  };
  // Widget galerisi (iOS "Widget Ekle" / Android widget seçici önizlemesi): bulanık duvar kâğıdı, ortada tek widget seçili boyda, adı, açıklaması, boy noktaları.
  // o: {widget:html, boy, boylar:['kucuk','orta','buyuk'], ad, aciklama, platform}
  GM.wyGaleri = (o = {}) => `<div class="${liste('gm-wy-galeri', o.platform === 'android' && 'is-and')}"><span class="gm-wy-galeri-uyg"><img src="${SIMGE}" alt=""><b>Dada Gourmet</b></span><div class="${liste('gm-wy-galeri-izgara', `is-${o.boy || 'kucuk'}`)}">${o.widget || ''}</div><b class="gm-wy-galeri-ad">${esc(o.ad || '')}</b><small class="gm-wy-galeri-aciklama">${esc(o.aciklama || '')}</small><span class="gm-wy-galeri-noktalar" role="img" aria-label="${esc(`Boylar: ${(o.boylar || []).map(b => ({kucuk: 'küçük', orta: 'orta', buyuk: 'büyük'}[b])).join(', ')}; seçili ${({kucuk: 'küçük', orta: 'orta', buyuk: 'büyük'})[o.boy] || ''}`)}">${(o.boylar || []).map(b => `<i class="${b === o.boy ? 'is-secili' : ''}"></i>`).join('')}</span><span class="gm-wy-galeri-ekle" aria-hidden="true">${ik('plus')}<span>Widget Ekle</span></span></div>`;
  // G3 · Rotalarım: tek dokunuşla "Yola çık" (App Intent; Canlı Etkinliği başlatır). aktif: süren yolculuğun rotası "Yolda".
  GM.wyRotalar = (o = {}) => {
    const boy = o.boy || 'orta', l = o.kayitlilar || [];
    if (o.hal === 'giris') return hal(o, 'rota', 'bookmark', 'Rotalarım', 'Giriş yap', 'Rotanı kaybetme: kaydettiğin rota burada tek dokunuşla başlar', '#/giris');
    if (!l.length) return hal({...o, hal: 'bos'}, 'rota', 'bookmark', 'Rotalarım', 'Kayıtlı rota yok', 'Rotanı kaydet, burada tek dokunuşla yola çık', '#/rota/planla');
    const sema = (x, w, h) => `<span class="gm-wy-sema">${GM.rotaCizgi({rota: {cizgi: x.cizgi}, pinler: [{lng: x.cizgi[0][0], lat: x.cizgi[0][1], uc: true}, {lng: x.cizgi.at(-1)[0], lat: x.cizgi.at(-1)[1], uc: true}], w, h, dolgu: {top: 10, right: 10, bottom: 10, left: 10}, sinif: 'is-w2'})}</span>`;
    const sag = x => (x.aktif ? `<span class="gm-wy-durum-yazi">${ik('location-arrow')}Yolda</span>` : dugme({kod: 'rota-baslat', id: x.id, ikon: 'play', metin: 'Yola çık', aria: `${x.ad}: yola çık`, ton: 'ana'}));
    const satir = x => `<span class="${liste('gm-wy-satir', 'is-rota', x.aktif && 'is-aktif')}">${sema(x, 64, 64)}${ad(x.ad, esc(x.aktif ? `Yolculuk sürüyor · %${x.yuzde}` : x.ozet))}${sag(x)}</span>`;
    const etiket = `Rotalarım: ${l.map(x => x.ad).join(', ')}`;
    if (boy === 'kucuk') { const x = l.find(y => !y.aktif) || l[0];
      return GM.wyKabuk({boy, tur: 'rota', ac: `#/rota/ozet/${x.id}`, eski: o.eski, etiket: `Kayıtlı rota ${x.ad}, ${x.ozet}`, icerik: `${bas('bookmark', 'Rotalarım')}${sema(x, 120, 50)}${ad(x.ad, esc(x.kisa || x.ozet))}${dugme({kod: 'rota-baslat', id: x.id, ikon: 'play', metin: 'Yola çık', tam: true, ton: 'ana'})}`}); }
    return GM.wyKabuk({boy, tur: 'rota', ac: '#/rota/rotalarim', eski: o.eski, etiket, icerik: `${bas('bookmark', 'Rotalarım', esc(String(l.length)))}<span class="gm-wy-liste is-rotalar">${l.slice(0, boy === 'orta' ? 2 : 4).map(satir).join('')}</span>${boy === 'buyuk' ? dugme({ac: '#/rota/planla', ikon: 'plus', metin: 'Yeni rota', tam: true, ton: 'ikincil'}) : ''}`});
  };

  // ---------- G5 · Sofra Saati: günün saatine göre öğün, yakındaki açık Dada mekânları ----------
  // o: {boy, ogun:{ad, ikon, saat}, gun:[{ad, durum:'gecti'|'simdi'|'sonra'}], mekanlar:[{slug, ad, semt, mesafe, gorsel, acik}], bolge, bos:{baslik, metin}, ipucu, eski}
  const acikMetin = x => (x.acik == null ? '' : x.acik ? 'Açık' : 'Kapalı');   // anlam metinde (renklendirilmiş kipte renk kaybolur)
  GM.wySofra = (o = {}) => {
    const boy = o.boy || 'kucuk', og = o.ogun || {}, l = o.mekanlar || [], m = l[0];
    const ust = bas(og.ikon || 'utensils', og.ad || 'Sofra Saati', esc([og.saat, boy === 'kucuk' ? '' : o.bolge].filter(Boolean).join(' · ')));
    const etiket = `Sofra Saati, ${og.ad} ${og.saat}: ${m ? l.slice(0, 3).map(x => `${x.ad} ${x.mesafe} ${acikMetin(x)}`).join(', ') : o.bos?.baslik || ''}`;
    if (!m) return GM.wyKabuk({boy, tur: 'sofra', ac: '#/mekanlar', eski: o.eski, etiket, icerik: `${ust}<span class="gm-wy-hal">${ik('mug-hot')}<b>${esc(o.bos?.baslik || 'Yakında açık Dada mekânı yok')}</b>${boy === 'kucuk' ? '' : `<small>${esc(o.bos?.metin || '')}</small>`}</span>`});
    const serit = (o.gun || []).length ? `<span class="gm-wy-gun" aria-hidden="true">${o.gun.map(g => `<span class="${liste('gm-wy-gun-oge', `is-${g.durum}`)}"><i></i><small>${esc(g.ad)}</small></span>`).join('')}</span>` : '';
    if (boy === 'kucuk') return GM.wyKabuk({boy, tur: 'sofra', foto: true, ac: `#/mekan/${m.slug}`, eski: o.eski, etiket, icerik: `${foto(m.gorsel, 'gm-wy-zemin')}<span class="gm-wy-etiket-cip">${ik(og.ikon || 'utensils')}${esc(og.ad)}</span><span class="gm-wy-alt">${ad(m.ad, esc([m.mesafe, acikMetin(m)].filter(Boolean).join(' · ')))}</span>`});
    const karo = x => `<span class="gm-wy-karo">${foto(x.gorsel, 'gm-wy-zemin')}${ad(x.ad, esc([x.mesafe, acikMetin(x)].filter(Boolean).join(' · ')))}</span>`;
    if (boy === 'orta') return GM.wyKabuk({boy, tur: 'sofra', ac: '#/mekanlar', eski: o.eski, etiket, icerik: `${ust}<span class="${liste('gm-wy-karolar', l.length < 3 && `is-n${l.length}`)}">${l.slice(0, 3).map(karo).join('')}</span>`});
    const satir = x => `<span class="gm-wy-satir">${foto(x.gorsel, 'gm-wy-kucuk')}${ad(x.ad, esc([x.semt, acikMetin(x)].filter(Boolean).join(' · ')))}<small class="gm-wy-sag">${esc(x.mesafe)}</small></span>`;
    return GM.wyKabuk({boy, tur: 'sofra', ac: '#/mekanlar', eski: o.eski, etiket, icerik: `${ust}${serit}<span class="gm-wy-kapak">${foto(m.gorsel, 'gm-wy-zemin')}${ad(m.ad, esc([m.semt, m.mesafe, acikMetin(m)].filter(Boolean).join(' · ')))}</span><span class="gm-wy-liste">${l.slice(1, 4).map(satir).join('')}</span>${ipucu(o.ipucu)}`});
  };

  // ---------- G4 · Masam: rezervasyon geri sayımı; saat geçince "nasıldı? · Ziyaret Ettim" ----------
  // o: {boy, hal:'yaklasan'|'sonra'|'bos'|'giris', rez:{slug, ad, saat, gunAd, kisi, durum:'onay'|'talep', semt, gorsel}, kalan, eski}
  GM.wyMasam = (o = {}) => {
    const boy = o.boy === 'buyuk' ? 'orta' : o.boy || 'kucuk', z = o.rez || {}, durum = z.durum === 'onay' ? 'Onaylandı' : 'Mekân onayı bekleniyor';
    if (o.hal === 'giris') return hal({...o, boy}, 'masam', 'calendar-check', 'Masam', 'Giriş yap', 'Rezervasyonlarını görmek için giriş yap', '#/giris');
    if (o.hal === 'bos') return hal({...o, boy}, 'masam', 'calendar-check', 'Masam', 'Rezervasyonun yok', 'Rezervasyon alan mekânlardan masa ayırt', '#/mekanlar', {ac: '#/mekanlar', ikon: 'magnifying-glass', metin: 'Mekân bul', ton: 'ikincil'});
    const ac = `#/mekan/${z.slug}`;
    if (o.hal === 'sonra') {
      const soru = `<span class="gm-wy-soru"><b>${esc(z.ad)} nasıldı?</b><small>${esc(`${z.gunAd} ${z.saat}`)}</small></span>`, zd = dugme({kod: 'ziyaret-ettim', id: z.slug, ikon: 'circle-check', metin: 'Ziyaret Ettim', tam: boy === 'kucuk', ton: 'ana'});
      return GM.wyKabuk({boy, tur: 'masam', ac, eski: o.eski, etiket: `${z.ad} nasıldı? Ziyaret Ettim`, icerik: boy === 'kucuk' ? `${bas('calendar-check', 'Masam')}${soru}${zd}` : `<span class="gm-wy-yan">${foto(z.gorsel, 'gm-wy-kare')}<span class="gm-wy-sutun">${bas('calendar-check', 'Masam')}${soru}${zd}</span></span>`});
    }
    const etiket = `Masam: ${z.ad}, ${z.gunAd} ${z.saat}, ${z.kisi} kişi, ${durum}${o.kalan ? `, ${o.kalan} sonra` : ''}`;
    const saat = `<span class="gm-wy-dev is-saat">${esc(z.saat)}</span>`;
    const kalan = o.kalan ? `<small class="gm-wy-kalan">${ik('clock')}${esc(`${o.kalan} sonra`)}</small>` : '';
    if (boy === 'kucuk') return GM.wyKabuk({boy, tur: 'masam', ac, eski: o.eski, etiket, icerik: `${bas('calendar-check', 'Masam', esc(z.gunAd))}${saat}${ad(z.ad, esc(`${z.kisi} kişi · ${durum}`))}${kalan}`});
    return GM.wyKabuk({boy, tur: 'masam', ac, eski: o.eski, etiket, icerik: `<span class="gm-wy-yan">${foto(z.gorsel, 'gm-wy-kare')}<span class="gm-wy-sutun">${bas('calendar-check', 'Masam', esc(z.gunAd))}${saat}${ad(z.ad, esc(`${z.semt} · ${z.kisi} kişi · ${durum}`))}<span class="gm-wy-alt-satir">${kalan}<span class="gm-wy-bag">${ik('location-arrow')}Yol tarifi</span></span></span></span>`});
  };

  // ---------- G6 · Lezzet Takvimi: etkinlik geri sayımı, Hatırlat anahtarı ----------
  GM.wyTakvim = (o = {}) => {
    const boy = o.boy === 'buyuk' ? 'orta' : o.boy || 'kucuk', e = o.etkinlik || {}, baslik = o.baslik || 'Lezzet Takvimi';
    if (!e.ad) return hal({...o, boy}, 'takvim', 'calendar-days', baslik, 'Şu anda yaklaşan etkinlik yok', '', '#/etkinlikler');
    const etiket = `${baslik}: ${e.ad}, ${e.kalanGun} gün sonra, ${e.gun} ${e.ay}, ${e.yer}${o.misafir ? '' : `. Hatırlatma ${o.hatirlat ? 'açık' : 'kapalı'}`}`;
    const gun = `<span class="gm-wy-dev is-gun">${esc(e.kalanGun)}<small>gün</small></span>`, ac = `#/etkinlik/${e.slug}`;
    if (boy === 'kucuk') return GM.wyKabuk({boy, tur: 'takvim', ac, eski: o.eski, etiket, icerik: `${bas('calendar-days', baslik)}${gun}${ad(e.ad, esc(`${e.gun} ${e.ay} · ${e.yer}`), 'is-iki')}`});
    const anahtar = o.misafir ? `<span class="gm-wy-bag">${ik('right-to-bracket')}Hatırlatma için giriş yap</span>` : `<button type="button" class="${liste('gm-wy-anahtar', o.hatirlat && 'is-acik')}" role="switch" aria-checked="${!!o.hatirlat}" data-wg-eylem="hatirlat" data-id="${esc(e.slug)}"><span>Hatırlat</span><i aria-hidden="true"></i></button>`;
    return GM.wyKabuk({boy, tur: 'takvim', ac, eski: o.eski, etiket, icerik: `<span class="gm-wy-yan">${foto(e.gorsel, 'gm-wy-kare')}<span class="gm-wy-sutun">${bas('calendar-days', baslik, esc(e.tur || ''))}${gun}${ad(e.ad, esc(`${e.gun} ${e.ay} · ${e.yer}`))}${anahtar}</span></span>`});
  };

  // ---------- G7 · Günün Gurme Lezzeti (editoryal; özel font yalnız başlıkta) ----------
  GM.wyLezzet = (o = {}) => {
    const boy = o.boy || 'orta', y = o.yazi || {}, ac = `#/lezzet/${y.slug}`;
    const etiket = `Günün Gurme Lezzeti: ${y.ad}, ${y.kategori}, ${y.sure}`;
    const kaydet = o.misafir ? '' : dugme({kod: 'lezzet-kaydet', id: y.slug, ikon: 'bookmark', metin: o.kayitli ? 'Kaydedildi' : 'Kaydet', ton: boy === 'orta' ? 'ikincil' : 'cam', yalniz: boy === 'orta', aria: o.kayitli ? 'Kaydedildi' : 'Yazıyı kaydet'});
    const dergi = `<span class="gm-wy-dergi"><small>${esc(y.kategori)}</small><b>${esc(y.ad)}</b></span>`;
    if (boy === 'kucuk') return GM.wyKabuk({boy, tur: 'lezzet', foto: true, ac, eski: o.eski, etiket, icerik: `${foto(y.gorsel, 'gm-wy-zemin')}<span class="gm-wy-etiket-cip">${ik('book-open')}Günün lezzeti</span><span class="gm-wy-alt"><span class="gm-wy-dergi"><b>${esc(y.ad)}</b></span></span>`});
    if (boy === 'orta') return GM.wyKabuk({boy, tur: 'lezzet', ac, eski: o.eski, etiket, icerik: `<span class="gm-wy-yan is-genis">${foto(y.gorsel, 'gm-wy-kare is-uzun')}<span class="gm-wy-sutun">${bas('book-open', 'Günün Gurme Lezzeti')}${dergi}<span class="gm-wy-alt-satir"><small class="gm-wy-kalan">${esc(y.sure || '')}</small>${kaydet}</span></span></span>`});
    return GM.wyKabuk({boy, tur: 'lezzet', foto: true, ac, eski: o.eski, etiket, icerik: `${foto(y.gorsel, 'gm-wy-zemin')}<span class="gm-wy-etiket-cip">${ik('book-open')}Günün Gurme Lezzeti</span><span class="gm-wy-alt">${dergi}${y.ozet ? `<p class="gm-wy-ozet">${esc(y.ozet)}</p>` : ''}<span class="gm-wy-alt-satir"><small class="gm-wy-kalan">${esc(y.sure || '')}</small>${kaydet}</span></span>`});
  };

  // ---------- G8 · Gurme Defterim: sonraki rütbeye kalan puan (kesinleşen dolu, bekleyen soluk) ----------
  // o: {boy, puan, bekleyen, rutbe, sonraki, kalan, oran, bekleyenOran, rutbeler:[{ad, esik}], rozet:{ad, ikon}, hal}
  GM.wyDefter = (o = {}) => {
    const boy = o.boy || 'kucuk';
    if (o.hal === 'giris') return hal(o, 'defter', 'medal', 'Gurme Defterim', 'Giriş yap', 'Ziyaret ettiğin mekânlar ve puanın burada birikir', '#/giris');
    const etiket = `Gurme Defterim: ${o.rutbe}, ${o.sonraki} rütbesine ${o.kalan} puan; ${o.puan} puan${o.bekleyen ? `, ${o.bekleyen} onay bekliyor` : ''}`;
    const h = halka(o.oran, `<b>${esc(o.kalan)}</b><small>puan</small>`, o.bekleyenOran);
    if (boy === 'kucuk') return GM.wyKabuk({boy, tur: 'defter', ac: '#/profil', eski: o.eski, etiket, icerik: `${bas('medal', 'Gurme Defterim')}<span class="gm-wy-merkez">${h}</span>${ad(o.hedef || `${o.sonraki}’ye`, esc(`${o.rutbe} · ${o.puan} puan`), 'is-orta')}`});
    const merdiven = `<span class="gm-wy-merdiven" aria-hidden="true">${(o.rutbeler || []).map((x, i, a) => { const sonraki = a[i + 1]?.esik ?? x.esik, oran = o.puan >= sonraki ? 1 : o.puan < x.esik ? 0 : (o.puan - x.esik) / Math.max(1, sonraki - x.esik); return `<span class="${liste('gm-wy-basamak', x.ad === o.rutbe && 'is-simdi')}" style="--cih-o:${kisit(i === a.length - 1 ? (o.puan >= x.esik ? 1 : 0) : oran, 0, 1).toFixed(3)}"><i></i><small>${esc(x.ad)}</small></span>`; }).join('')}</span>`;
    return GM.wyKabuk({boy, tur: 'defter', ac: '#/profil', eski: o.eski, etiket, icerik: `${bas('medal', 'Gurme Defterim', esc(`${o.puan} puan`))}<span class="gm-wy-yan is-defter">${h}<span class="gm-wy-sutun">${ad(o.rutbe, esc(`${o.hedef || `${o.sonraki}’ye`} ${o.kalan} puan`), 'is-buyuk')}${o.bekleyen ? `<small class="gm-wy-etiket">${esc(`${o.bekleyen} puan mekân onayı bekliyor`)}</small>` : '<small class="gm-wy-etiket">Ziyaret ettiğin mekânlar burada birikir</small>'}</span></span>${merdiven}`});
  };
  // Kaydettiklerim: fotoğraf karoları (orta 3, büyük 6).
  GM.wyKoleksiyon = (o = {}) => {
    const boy = o.boy || 'orta', l = o.ogeler || [];
    if (o.hal === 'giris') return hal(o, 'defter', 'bookmark', 'Kaydettiklerim', 'Giriş yap', 'Kaydettiğin mekânlar burada', '#/giris');
    if (!l.length) return hal({...o, hal: 'bos'}, 'defter', 'bookmark', 'Kaydettiklerim', 'Henüz kayıt yok', 'Beğendiğin mekânı kaydet, burada dursun', '#/mekanlar');
    return GM.wyKabuk({boy, tur: 'defter', ac: '#/profil', eski: o.eski, etiket: `${o.baslik || 'Kaydettiklerim'}: ${o.sayi} mekân`, icerik: `${bas('bookmark', o.baslik || 'Kaydettiklerim', esc(String(o.sayi ?? l.length)))}<span class="${liste('gm-wy-karolar', boy === 'buyuk' && 'is-alti')}">${l.slice(0, boy === 'buyuk' ? 6 : 3).map(x => `<span class="gm-wy-karo">${foto(x.gorsel, 'gm-wy-zemin')}${ad(x.ad, esc(x.alt || ''))}</span>`).join('')}</span>`});
  };

  // ---------- StandBy (iOS) / şarj ekranı (Android): yatay tam sayfa ----------
  // yuva: {ikon, ust, buyuk, birim, ad, alt, oran, isaretler, halka}; gece: iOS gece kipi (her şey tek ton kırmızı).
  const sbYuva = x => `<span class="gm-wy-sb-yuva"><small class="gm-wy-sb-ust">${ik(x.ikon || 'utensils')}${esc(x.ust || '')}</small>${x.halka != null ? halka(x.halka, `<b>${esc(x.buyuk)}</b><small>${esc(x.birim || '')}</small>`) : `<b class="gm-wy-sb-buyuk">${esc(x.buyuk || '')}${x.birim ? `<small>${esc(x.birim)}</small>` : ''}</b>`}<span class="gm-wy-sb-ad">${esc(x.ad || '')}</span><small class="gm-wy-sb-alt">${esc(x.alt || '')}</small>${x.oran != null ? GM.rotaIlerleme({oran: x.oran, isaretler: x.isaretler}, 'is-wy') : ''}<span class="gm-wy-sb-sayfa" aria-hidden="true"><i></i><i></i><i></i></span></span>`;
  GM.wyStandby = (o = {}) => (o.platform === 'android'
    ? `<section class="${liste('gm-wy-sb', 'is-and', o.gece && 'is-gece')}" role="img" aria-label="${esc(o.etiket || '')}"><span class="gm-wy-sb-saat"><b>${esc(o.saat || '')}</b><small>${esc(o.tarih || '')}</small></span><span class="gm-wy-sb-kart">${o.sagHtml || sbYuva(o.sag || {})}</span></section>`
    : `<section class="${liste('gm-wy-sb', o.gece && 'is-gece')}" role="img" aria-label="${esc(o.etiket || '')}">${sbYuva(o.sol || {})}${sbYuva(o.sag || {})}</section>`);

  // ---------- Bildirim (sıradan; Canlı Etkinlik ya da Live Update olmayan) ----------
  GM.wyBildirim = (o = {}) => {
    const e = (o.eylemler || []).map(x => `<button type="button"${x.kod ? ` data-wg-eylem="${esc(x.kod)}"` : ` data-wg-ac="${esc(x.ac || '')}"`}>${x.ikon ? ik(x.ikon) : ''}<span>${esc(x.metin)}</span></button>`).join('');
    if (o.platform === 'android') return GM.androidSurekli({baslik: o.baslik, metin: o.metin, zaman: o.zaman, gorsel: o.gorsel, eylemler: o.eylemler});
    return `<article class="${liste('gm-wy-bil', o.genis && 'is-genis', o.banner && 'is-banner')}" aria-label="${esc(`Dada Gourmet bildirimi: ${o.baslik}. ${o.metin}`)}">${o.genis && o.gorsel ? `<img class="gm-wy-bil-kapak" src="${esc(o.gorsel)}" alt="">` : ''}<span class="gm-wy-bil-govde"><img class="gm-wy-bil-simge" src="${SIMGE}" alt=""><span class="gm-wy-bil-metin"><span><b>${esc(o.baslik)}</b><small>${esc(o.zaman || 'şimdi')}</small></span><span>${esc(o.metin)}</span></span>${!o.genis && o.gorsel ? `<img class="gm-wy-bil-foto" src="${esc(o.gorsel)}" alt="">` : ''}</span>${o.genis && e ? `<span class="gm-wy-bil-eylem">${e}</span>` : ''}</article>`;
  };

  // ---------- Rezervasyon Canlı Etkinliği (iOS 26 zamanlanmış başlatma: saatten ~2 saat önce, kullanıcı izniyle) ----------
  GM.wyMasaKarti = (o = {}) => {
    const z = o.rez || {}, durum = z.durum === 'onay' ? 'Onaylandı' : 'Mekân onayı bekleniyor';
    return `<section class="${liste('gm-lac', 'is-rota', 'is-masa', o.eski && 'is-eski')}" aria-label="${esc(`Dada Gourmet, Masam: ${z.ad}, ${z.gunAd} ${z.saat}, ${durum}`)}"><button type="button" class="gm-lac-ac" data-wg-ac="#/mekan/${esc(z.slug)}" aria-label="Rezervasyonu aç"></button>
      <div class="gm-lac-ic">
        <div class="gm-lac-bas"><span class="gm-lac-marka"><span class="gm-lac-glif" aria-hidden="true">${ik('utensils')}</span><span>Masam</span></span><small>${o.eski ? `${ik('clock-rotate-left')} ${esc(o.eski)}` : esc(`${z.gunAd} · ${z.semt || ''}`)}</small><button type="button" class="gm-lac-dugme" data-wg-ac="#/mekan/${esc(z.slug)}" aria-label="Yol tarifi">${ik('location-arrow')}<span>Yol tarifi</span></button></div>
        <div class="gm-lrt-durak">${z.gorsel ? `<span class="gm-lrt-foto"><img src="${esc(z.gorsel)}" alt=""></span>` : ''}<span class="gm-lrt-metin"><small>${esc(durum)}</small><b>${esc(z.ad)}</b></span><span class="gm-lrt-mesafe"><b>${esc(z.saat)}</b><small>${GM.cihazGeriSayac(o.kalanSn || 0)} kaldı</small></span></div>
      </div></section>`;
  };
  GM.wyAdaMasa = (o = {}) => {
    const z = o.rez || {}, sayac = GM.cihazGeriSayac(o.kalanSn || 0, {bicim: 'kisa'});
    if (o.tur !== 'genis') return `<button type="button" class="gm-ada2 is-kompakt is-rota" data-ada="masa" aria-label="${esc(`${z.ad} ${z.saat}. Genişlet`)}"><span class="gm-lrt-ikon is-mekan">${ik('utensils')}</span><i></i><b class="is-rota">${sayac}</b></button>`;
    return `<span class="gm-ada2 is-genis is-rota is-masa"><button type="button" class="gm-ada2-kapat" data-ada="kompakt" aria-label="Küçült"></button>
      <span class="gm-ada2-ust">${z.gorsel ? `<span class="gm-lrt-foto"><img src="${esc(z.gorsel)}" alt=""></span>` : ''}<i></i><span class="gm-ada2-sayac is-rota"><b>${esc(z.saat)}</b><small>${sayac} kaldı</small></span></span>
      <span class="gm-ada2-orta"><b>${esc(z.ad)}</b><small>${esc(`${z.gunAd} · ${z.durum === 'onay' ? 'Onaylandı' : 'Mekân onayı bekleniyor'}`)}</small></span>
      <span class="gm-ada2-alt is-masa"><button type="button" class="gm-ada2-dugme is-rota" data-wg-ac="#/mekan/${esc(z.slug)}" aria-label="Yol tarifi">${ik('location-arrow')}<span>Yol tarifi</span></button></span></span>`;
  };
})();
