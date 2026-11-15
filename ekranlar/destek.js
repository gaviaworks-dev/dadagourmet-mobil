/* Destek ekranları (destek-yasal ajanı, Görev 12). Dada Diet mobil cozum-merkezi.js + gorus-bildir.js + kurumsal.js (iletisim, sss) ile birebir yapı; içerik Gourmet webden (GMX.destek).
 * Rotalar: #/cozum-merkezi → 'cozum', #/gorus-bildir → 'gorus', #/sss → 'sss', #/iletisim → 'iletisim'.
 *
 * cozum: sayfa başlığı + kaydırmalı segment Sık sorulanlar · Taleplerim · Yeni talep · Öneri ve şikâyet (?sekme=sss|talepler|yeni|oneri).
 *   Misafir: SSS ve Öneri açık; Taleplerim ve Yeni talep sekme içinde giriş kapısı (GM.girisGerekli tam:false). Üye: adrese ?uye=1.
 *   Talepler: GM.durum 'destek-talepleri' (varsayılan GMX.destek.talepler; yeni hesapta []), durum süzgeci, 8'erli sonsuz kaydırma + "Hepsi bu kadar · N talep".
 *   Talep detayı sheet'te (?talep=<id> açık başlar; bilinmeyen id → "Talep bulunamadı"): yazışma, "Sorunum çözüldü", "Talebi kapat", kapalıysa "Talebi yeniden aç", açıkken yanıt yazma.
 *   Hâller: ?hal=bos (talep yok), ?hal=yeni-hata (yeni talep alan hataları), ?hal=form-hata (öneri formu hataları), ?hal=tamam (öneri gönderildi),
 *   router ?hal=yukleniyor|hata|cevrimdisi. Çekip yenile var.
 * gorus: konu kartları (Önerim var · Bir sorum var · Teknik sorun · İhlal bildirimi · Puan ver) → konuya göre alanlar (ekran görüntüsü GM.dosyaAlan) → e-posta → KVKK onayı.
 *   ?konu=oneri|soru|teknik|ihlal|puan, ?hal=form-hata, ?hal=gonderiliyor, ?hal=tamam (&eposta=1). Gönderim GM.durum 'gorus-gonderimleri'.
 * sss: gruplu akordiyon (4 kategori), arama (?q=), ?hal=sonuc-yok, router ?hal=yukleniyor|hata.
 * iletisim: web iletişim (başlık, bilgiler, form, mesajın yolu). ?konu=genel|oneri|sikayet|icerik|is-birligi|basin|teknik, ?hal=form-hata, ?hal=tamam.
 *   Gönderim GM.durum 'iletisim-gonderimleri'. */
(() => {
  const D = () => GMX.destek;
  const EPOSTA = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/, BAGLANTI = /^https?:\/\/\S+\.\S+/;
  const simdiSaat = () => { const d = GM.simdi(); return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`; };
  const tarihMetin = iso => (iso === GM.bugunIso() ? 'Bugün' : GM.tarihKisa(iso));
  const zengin = h => (GM.yasalMetin ? GM.yasalMetin.zengin(h) : GM.esc(h));
  // Üye bilgisi: Ayarlar'da değiştirildiyse o, yoksa hesap verisi; misafirde ve yeni hesapta boş.
  const kisi = () => {
    if (!GM.uye()) return {ad: '', soyad: '', eposta: '', telefon: ''};
    const k = GM.yeniHesap() ? {} : (GMX.hesap?.kullanici || {}), p = GM.durum.oku('hesap-ayar', {})?.profil || {};
    return {ad: p.ad ?? k.ad ?? '', soyad: p.soyad ?? k.soyad ?? '', eposta: p.eposta ?? k.eposta ?? '', telefon: p.telefon ?? k.telefon ?? ''};
  };
  // Form yardımcıları (Gastro alanHata): düzeltilen alanın hatası kalkar; hatalı ilk alana yalnız iç kaydırıcı kayar.
  const hataKaldir = el => { const a = el?.closest('.gm-alan.is-hata'); if (a) { a.classList.remove('is-hata'); a.querySelector(':scope > .gm-hata')?.remove(); a.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid')); } };
  const hatayaGit = (kok, kap) => {
    const a = kap.querySelector('.gm-alan.is-hata'), k = kok.querySelector('.gm-kaydir');
    if (!a) return;
    k?.scrollTo({top: Math.max(0, a.getBoundingClientRect().top - k.getBoundingClientRect().top + k.scrollTop - k.clientHeight / 3), behavior: GM.azHareket() ? 'auto' : 'smooth'});
    a.querySelector('input:not([type=hidden]),textarea,button')?.focus({preventScroll: true});
  };
  const temizHata = h => { Object.keys(h).forEach(k => { if (!h[k]) delete h[k]; }); return h; };
  const kvkkAlan = (ad, secili, hata) => GM.alan({etiket: 'Kişisel veriler', zorunlu: true, hata, html: `<div class="gm-yigin-8">${GM.checkbox({ad, etiket: 'KVKK Aydınlatma Metni’ni okudum, onaylıyorum.', secili})}${GM.btn({metin: 'Aydınlatma Metni’ni oku', ikon: 'file-lines', tur: 'text', boyut: 'sm', git: '#/yasal/kvkk'})}</div>`});
  const sssSay = () => D().sss.reduce((t, k) => t + k.sorular.length, 0);

  // ================= Çözüm Merkezi =================
  const talepler = ctx => (ctx?.sorgu.hal === 'bos' ? [] : GM.durum.oku('destek-talepleri', null) || (GM.yeniHesap() ? [] : D().talepler));
  const talepYaz = l => GM.durum.yaz('destek-talepleri', l);
  const son = t => t.mesajlar[t.mesajlar.length - 1];
  const sirali = l => l.slice().sort((a, b) => `${son(b).tarih}${son(b).saat}`.localeCompare(`${son(a).tarih}${son(a).saat}`));
  const DURUM = {
    acik: {metin: 'Açık', ton: 'notr', ikon: 'inbox', filtre: 'Açık'},
    yanit: {metin: 'Yanıtın bekleniyor', ton: 'uyari', ikon: 'reply', filtre: 'Yanıt bekliyor'},
    cozulen: {metin: 'Çözüldü', ton: 'basari', ikon: 'circle-check', filtre: 'Çözülen'},
    kapali: {metin: 'Kapandı', ton: 'notr', ikon: 'lock', filtre: 'Kapatılan'}
  };
  const SAYFA = 8;
  const SEKMELER = ['sss', 'talepler', 'yeni', 'oneri'];
  const sekme = ctx => ctx.sekme || (SEKMELER.includes(ctx.sorgu.sekme) ? ctx.sorgu.sekme
    : ctx.sorgu.yeni || ctx.sorgu.hal === 'yeni-hata' ? 'yeni'
    : ['form-hata', 'tamam'].includes(ctx.sorgu.hal) ? 'oneri'
    : ctx.sorgu.hal === 'bos' || ctx.sorgu.talep ? 'talepler' : 'sss');
  const misafirKapi = (baslik, metin) => GM.girisGerekli({ikon: 'inbox', baslik, metin, tam: false});

  // ---------- Talepler ----------
  const talepSatir = t => GM.satir({ikon: DURUM[t.durum].ikon, baslik: t.baslik, alt: `${DURUM[t.durum].metin} · ${t.konu} · ${tarihMetin(son(t).tarih)}`, veri: {eylem: 'talep-ac', id: t.id}});
  const suzulmus = (ctx, suz) => sirali(talepler(ctx)).filter(t => !suz || t.durum === suz);
  const talepPanel = (ctx, suz) => {
    if (!GM.uye()) return misafirKapi('Taleplerin için giriş yap', 'Destek taleplerin **hesabına bağlı**. Giriş yapınca açtığın talepleri ve yanıtları burada görürsün.');
    const tum = talepler(ctx), l = suzulmus(ctx, suz), acik = tum.filter(t => t.durum === 'acik' || t.durum === 'yanit').length;
    if (!tum.length) return GM.bos({ikon: 'inbox', baslik: 'Henüz destek talebin yok', metin: 'Bir sorun yaşarsan ya da bir şey sormak istersen **ilk talebini** buradan açabilirsin.', eylem: {metin: 'Yeni talep', ikon: 'ekle', veri: {eylem: 'yeni-talep'}}, ikincil: {metin: 'Sık sorulanlara bak', veri: {eylem: 'sss-git'}}});
    const cip = GM.cipler({ad: 'talep-suz', tur: 'tek', etiket: 'Talep durumu süzgeci', secili: suz || '', ogeler: [{metin: 'Tümü', deger: '', sayi: tum.length}, ...Object.entries(DURUM).map(([k, v]) => ({metin: v.filtre, deger: k, sayi: tum.filter(t => t.durum === k).length}))]});
    const liste = l.length
      ? `<div class="gm-satirlar" data-talep-liste>${l.slice(0, SAYFA).map(talepSatir).join('')}</div>`
      : GM.bos({ikon: 'filtre', baslik: 'Bu durumda talebin yok', metin: 'Seçtiğin durumda talep bulunmuyor; **Tümü** ile hepsini görebilirsin.', eylem: {metin: 'Tüm talepleri göster', tur: 'secondary', veri: {eylem: 'talep-tumu'}}});
    return `<div class="gm-yigin">${GM.p(acik ? `**${acik} talebin** açık; destek ekibi talepleri sırayla yanıtlar. ${D().calisma}` : `Açık talebin yok; **kapanan talepler** de burada saklanır. ${D().calisma}`, {ton: 'ikincil', meta: true})}${cip}${liste}</div>`;
  };

  // Talep detayı (sheet gövdesi ve ayağı).
  const detayGovde = t => {
    const kapali = t.durum === 'kapali' || t.durum === 'cozulen';
    let gun = '';
    const yazisma = t.mesajlar.map(m => { const g = tarihMetin(m.tarih), ayrac = g !== gun ? GM.gunAyrac(g) : ''; gun = g; return ayrac + GM.balon({kim: m.kim === 'ben' ? 'ben' : 'o', harf: 'D', metin: m.metin.replace(/\n/g, ' · '), saat: m.saat}); }).join('');
    const durum = kapali
      ? `<div class="gm-yigin-12">${GM.bant({ton: 'bilgi', ikon: 'lock', metin: 'Bu talep kapandı. Sorun sürüyorsa **yeniden açabilir** ya da yeni talep oluşturabilirsin.'})}${GM.btn({metin: 'Talebi yeniden aç', ikon: 'rotate-left', tur: 'secondary', tam: true, veri: {eylem: 'yeniden-ac'}})}</div>`
      : `<div class="gm-yigin-12">${t.durum === 'yanit' ? GM.bant({ton: 'uyari', ikon: 'reply', metin: 'Destek ekibi **senden yanıt bekliyor**. Aşağıdan yazabilirsin.'}) : GM.p('Destek ekibi talepleri **sırayla** yanıtlar.', {ton: 'ikincil', meta: true})}${GM.btn({metin: 'Sorunum çözüldü', ikon: 'circle-check', tur: 'tonal', tam: true, veri: {eylem: 'cozuldu'}})}${GM.btn({metin: 'Talebi kapat', ikon: 'lock', tur: 'text', tam: true, veri: {eylem: 'kapat'}})}</div>`;
    return `<div class="gm-yigin">
      <div class="gm-yigin-12"><div class="gm-ara"><span class="gm-t-meta gm-ton-ikincil">#${GM.esc(t.id)}</span>${GM.durumRozet(DURUM[t.durum])}</div><h3 class="gm-t-section">${GM.esc(t.baslik)}</h3>${GM.kunye([{ikon: 'tag', etiket: 'Konu', deger: t.konu}, {ikon: 'takvim', etiket: 'Açılış', deger: GM.tarihUzun(t.tarih)}, {ikon: 'comments', etiket: 'Mesaj', deger: String(t.mesajlar.length)}])}</div>
      <div class="gm-yigin-12">${GM.bas('Yazışma')}${yazisma}</div>
      ${durum}
    </div>`;
  };
  const detayAyak = t => (t.durum === 'kapali' || t.durum === 'cozulen' ? '' : GM.mesajGiris({ad: 'yanit', yer: 'Yanıt yaz'}));
  const talepSheet = (ctx, id, yenile) => {
    const bul = () => talepler(ctx).find(x => x.id === id);
    if (!bul()) {
      GM.sheet({baslik: 'Destek talebi', html: GM.bos({ikon: 'ara_', baslik: 'Talep bulunamadı', metin: `**#${id}** numaralı talep silinmiş ya da numarası yanlış olabilir. Taleplerinden yeniden bakabilirsin.`, eylem: {metin: 'Taleplerime dön', tur: 'secondary', attrs: 'data-sheet-kapat'}})});
      return;
    }
    GM.sheet({
      baslik: 'Destek talebi', tam: true,
      html: detayGovde(bul()), altBar: detayAyak(bul()),
      sonra: d => {
        const ciz = () => {
          d.querySelector('.gm-sheet-govde').innerHTML = detayGovde(bul());
          const a = detayAyak(bul()); let ayak = d.querySelector('.gm-sheet-ayak');
          if (!ayak && a) { ayak = document.createElement('div'); ayak.className = 'gm-sheet-ayak'; d.append(ayak); }
          if (ayak) { ayak.innerHTML = a; ayak.hidden = !a; }
          yenile();
        };
        const guncelle = f => { talepYaz(talepler(ctx).map(x => (x.id === id ? f(x) : x))); ciz(); };
        const gonder = ev => {
          if (!ev.target.matches('[data-mesaj]')) return;
          ev.preventDefault();
          const i = ev.target.querySelector('input'), metin = i.value.trim();
          if (metin.length < 3) { GM.toast('Yanıtın **en az 3 karakter** olmalı', {tur: 'hata', yerine: true}); return; }
          guncelle(x => ({...x, durum: 'acik', mesajlar: [...x.mesajlar, {kim: 'ben', tarih: GM.bugunIso(), saat: simdiSaat(), metin}]}));
          GM.toast('Yanıtın talebe **eklendi**', {ikon: 'gonder'});
        };
        d.addEventListener('submit', gonder);
        const c = [
          () => d.removeEventListener('submit', gonder),
          GM.eylem(d, 'cozuldu', () => { guncelle(x => ({...x, durum: 'cozulen'})); GM.toast('Talep **çözüldü** olarak kapatıldı', {tur: 'basari', ikon: 'circle-check'}); }),
          GM.eylem(d, 'kapat', () => { guncelle(x => ({...x, durum: 'kapali'})); GM.toast('Talep **kapatıldı**', {ikon: 'lock'}); }),
          GM.eylem(d, 'yeniden-ac', () => { guncelle(x => ({...x, durum: 'acik'})); GM.toast('Talep **yeniden açıldı**', {ikon: 'rotate-left'}); }),
          GM.eylem(d, 'ek', () => GM.toast('Ekran görüntüsünü **Yeni talep** formundan ekleyebilirsin; yazışmaya yalnız metin gider', {ikon: 'ek', yerine: true})),
          GM.eylem(d, 'ses-mesaj', () => GM.toast('Destek talepleri **yazılı** yanıtlanır', {ikon: 'mikrofon', yerine: true}))
        ];
        return () => c.forEach(f => f());
      }
    });
  };

  // ---------- Sık sorulanlar (sekme) ----------
  const sssAko = (l, araniyor) => GM.akordiyon(l.map(s => ({baslik: s.soru, alt: araniyor ? s.kategori : null, ikon: s.ikon, icerik: GM.p(s.yanit)})), {acik: -1});
  const tumSorular = () => D().sss.flatMap(k => k.sorular.map(s => ({...s, kategori: k.kategori})));
  const sssPanel = (kat, ara) => {
    const q = GM.katla(ara || '');
    const l = q ? tumSorular().filter(s => GM.katla(`${s.soru} ${s.yanit}`).includes(q)) : D().sss.find(k => k.kategori === kat).sorular;
    if (!l.length) return GM.bos({ikon: 'ara_', baslik: 'Aramana uyan soru yok', metin: 'Farklı bir kelime dene ya da **sorunu bize yaz**.', eylem: {metin: 'Yeni talep', ikon: 'ekle', tur: 'secondary', veri: {eylem: 'yeni-talep'}}});
    return `<div class="gm-yigin-12">${q ? GM.p(`**“${ara.trim()}”** için ${l.length} soru bulundu.`, {ton: 'ikincil', meta: true}) : ''}${sssAko(l, !!q)}</div>`;
  };
  const hizliHtml = () => GM.akordiyon(D().hizli.map(h => ({ikon: h.ikon, baslik: h.baslik, icerik: GM.makale(`<p><strong>Nerede?</strong> ${zengin(h.nerede)}</p><p><strong>Sorun sürerse</strong> ${zengin(h.surerse)}</p>`)})), {acik: -1, ad: 'hizli'});
  const sssBolum = ctx => `<div class="gm-yigin">
    ${GM.arama({ad: 'sss-ara', yer: 'Sorunu birkaç kelimeyle yaz', sonuc: false})}
    ${GM.cipler({ad: 'sss-kat', tur: 'tek', etiket: 'Soru kategorileri', secili: ctx.kat, ogeler: D().sss.map(k => ({metin: k.kategori, ikon: k.ikon, deger: k.kategori, sayi: k.sorular.length}))})}
    <div data-yuva="sss">${sssPanel(ctx.kat)}</div>
    <div class="gm-yigin-8">${GM.bas('Hızlı çözümler')}${hizliHtml()}</div>
    <div class="gm-yigin-8">${GM.bas('Bize yaz')}${GM.satirlar([
      {ikon: 'circle-question', baslik: 'Bütün sorular', alt: `${sssSay()} soru, ${D().sss.length} kategori`, git: '#/sss'},
      {ikon: 'comment-dots', baslik: 'Görüş bildir', alt: 'Öneri, soru, teknik sorun ya da puan', git: '#/gorus-bildir'},
      {ikon: 'envelope', baslik: 'İletişim', alt: 'İş birliği, basın, bilgi düzeltme', git: '#/iletisim'}])}</div>
  </div>`;

  // ---------- Yeni talep ----------
  const yeniForm = (t, h) => `<div class="gm-yigin" data-talep-form>
    ${GM.p('Talebin **destek ekibine** iletilir; ekip talepleri sırayla yanıtlar ve cevap bu ekrana düşer.', {ton: 'ikincil'})}
    ${GM.alan({etiket: 'Konu', zorunlu: true, hata: h.konu, html: GM.cipler({ad: 'talep-konu', tur: 'tek', serit: false, secili: t.konu, ogeler: D().talepKonulari.map(k => ({metin: k, deger: k, kucuk: true}))})})}
    ${GM.input({ad: 'talep-baslik', etiket: 'Başlık', yer: 'Sorunu kısaca özetle', deger: t.baslik, zorunlu: true, hata: h.baslik})}
    ${GM.input({ad: 'talep-mesaj', etiket: 'Mesajın', yer: 'Ne oldu, hangi ekranda, ne zaman?', deger: t.mesaj, cokSatir: true, zorunlu: true, hata: h.mesaj})}
    ${GM.dosyaAlan({ad: 'talep-dosya', etiket: 'Ekran görüntüsü', metin: 'Ekran görüntüsü ekle', ikon: 'image', yardim: 'JPG, PNG, WebP ya da PDF · en çok 5 MB · tek dosya.'})}
    ${GM.veriYok('Kart numarası, şifre gibi **hassas bilgileri** mesaja yazma.')}
    ${GM.btn({metin: 'Talebi gönder', ikon: 'gonder', tam: true, veri: {eylem: 'talep-gonder'}})}
  </div>`;
  const yeniDogrula = t => {
    const b = t.baslik.trim(), m = t.mesaj.trim();
    return temizHata({konu: t.konu ? '' : 'Bir konu seç.', baslik: !b ? 'Başlığı yaz.' : b.length < 3 ? 'Başlık en az 3 karakter olmalı.' : '', mesaj: !m ? 'Mesaj alanı boş; ne olduğunu birkaç cümleyle anlat.' : m.length < 10 ? 'Mesajın en az 10 karakter olmalı.' : ''});
  };
  const yeniPanel = ctx => {
    if (!GM.uye()) return misafirKapi('Talep açmak için giriş yap', 'Destek talebi **hesabına bağlı** açılır. Hızlı bir öneri ya da şikâyet için **Öneri ve şikâyet** sekmesini kullanabilirsin.');
    if (!ctx.yeni) {
      const konu = D().talepKonulari.includes(ctx.sorgu.konu) ? ctx.sorgu.konu : '';
      ctx.yeni = {t: {konu, baslik: '', mesaj: ''}, h: {}};
      if (ctx.sorgu.hal === 'yeni-hata') { ctx.yeni.t.baslik = 'Ro'; ctx.yeni.h = yeniDogrula(ctx.yeni.t); }
    }
    return yeniForm(ctx.yeni.t, ctx.yeni.h);
  };
  const talepGonder = (kok, ctx) => {
    const y = kok.querySelector('[data-yuva="yeni"]'), f = y.querySelector('[data-talep-form]'), t = ctx.yeni.t;
    Object.assign(t, {konu: f.querySelector('[data-ad="talep-konu"] [aria-pressed="true"]')?.dataset.cip || '', baslik: f.querySelector('[name="talep-baslik"]').value, mesaj: f.querySelector('[name="talep-mesaj"]').value});
    const dosya = f.querySelector('[name="talep-dosya"]')?.files?.[0]?.name;
    ctx.yeni.h = yeniDogrula(t);
    if (Object.keys(ctx.yeni.h).length) { y.innerHTML = yeniForm(t, ctx.yeni.h); hatayaGit(kok, y); GM.toast('**Eksik alanları** kontrol et', {tur: 'hata', yerine: true}); return null; }
    const id = Date.now().toString(16).slice(-8).toUpperCase();
    talepYaz([{id, baslik: t.baslik.trim(), konu: t.konu, durum: 'acik', tarih: GM.bugunIso(), mesajlar: [{kim: 'ben', tarih: GM.bugunIso(), saat: simdiSaat(), metin: dosya ? `${t.mesaj.trim()}\nEk: ${dosya}` : t.mesaj.trim()}]}, ...talepler(ctx)]);
    ctx.yeni = null;
    return id;
  };

  // ---------- Öneri ve şikâyet ----------
  const O = () => D().oneri;
  const oneriTaslak = () => ({...kisi(), tur: '', alan: '', mesaj: '', kvkk: false});
  const oneriDogrula = t => {
    const ep = t.eposta.trim(), m = t.mesaj.trim();
    return temizHata({
      ad: t.ad.trim() ? '' : 'Adını yaz.', soyad: t.soyad.trim() ? '' : 'Soyadını yaz.',
      eposta: !ep ? 'E‑posta adresini yaz; cevabı bu adrese göndeririz.' : EPOSTA.test(ep) ? '' : 'Geçerli bir e‑posta adresi yaz (ad@site.com).',
      telefon: !t.telefon || /^5\d{9}$/.test(t.telefon) ? '' : 'Başında 0 olmadan 10 haneli cep numaranı yaz.',
      tur: t.tur ? '' : 'Öneri mi şikâyet mi, birini seç.', alan: t.alan ? '' : 'Hangi alanla ilgili, seç ki doğru ekibe ulaşsın.',
      mesaj: !m ? 'Mesaj alanı boş; ne olduğunu birkaç cümleyle anlat.' : m.length < O().mesajEnAz ? `En az ${O().mesajEnAz} karakter yaz.` : '',
      kvkk: t.kvkk ? '' : 'Göndermek için onay kutusunu işaretle.'
    });
  };
  const oneriForm = (t, h) => `<div class="gm-yigin" data-oneri-form>
    ${GM.p('Yıldız (*) ile işaretli alanlar zorunlu. Cevabımız **e‑posta adresine** gelir.', {ton: 'ikincil'})}
    ${GM.input({ad: 'o-ad', etiket: 'Ad', yer: 'Adın', otomatik: 'given-name', deger: t.ad, zorunlu: true, hata: h.ad})}
    ${GM.input({ad: 'o-soyad', etiket: 'Soyad', yer: 'Soyadın', otomatik: 'family-name', deger: t.soyad, zorunlu: true, hata: h.soyad})}
    ${GM.input({ad: 'o-eposta', etiket: 'E‑posta', ikon: 'envelope', tur: 'email', mod: 'email', otomatik: 'email', yer: 'ad@site.com', deger: t.eposta, zorunlu: true, hata: h.eposta})}
    ${GM.telefon({ad: 'o-telefon', ulkeAd: 'o-telefon-ulke', etiket: 'Telefon', deger: t.telefon, opsiyonel: true, hata: h.telefon})}
    ${GM.alan({etiket: 'Türü', zorunlu: true, hata: h.tur, html: GM.cipler({ad: 'o-tur', tur: 'tek', serit: false, etiket: 'Türü', secili: t.tur, ogeler: O().turler.map(x => ({metin: x, deger: x, kucuk: true}))})})}
    ${GM.secAlan({ad: 'o-alan', etiket: 'İlgili alan', zorunlu: true, secenekler: O().alanlar.map(x => [x, x]), deger: t.alan, yer: 'Seç', hata: h.alan, yardim: h.alan ? '' : 'Alan seçimi mesajı ilgili ekibe yönlendirir.'})}
    ${GM.input({ad: 'o-mesaj', etiket: 'Mesajın', yer: 'Önerini ya da şikâyetini buraya yazabilirsin', deger: t.mesaj, cokSatir: true, zorunlu: true, hata: h.mesaj, yardim: h.mesaj ? '' : `En az ${O().mesajEnAz}, en çok ${GM.sayi(O().mesajEnCok)} karakter.`})}
    ${kvkkAlan('o-kvkk', t.kvkk, h.kvkk)}
    ${GM.p(O().donus, {meta: true, ton: 'ikincil'})}
    ${GM.btn({metin: 'Gönder', ikon: 'gonder', tam: true, veri: {eylem: 'oneri-gonder'}})}
  </div>`;
  const oneriTamam = () => GM.bos({ikon: 'circle-check', baslik: 'Mesajın bize ulaştı', metin: `Teşekkürler! Cevabımız **e‑posta adresine** gelir. ${O().donus}`, eylem: {metin: 'Forma dön', tur: 'secondary', veri: {eylem: 'oneri-yeni'}}});
  const oneriPanel = ctx => {
    if (!ctx.oneri) {
      ctx.oneri = {t: oneriTaslak(), h: {}, tamam: ctx.sorgu.hal === 'tamam'};
      if (ctx.sorgu.hal === 'form-hata') { const t = ctx.oneri.t; t.eposta = t.eposta ? t.eposta.replace(/\.[^.]+$/, '') : 'ad@site'; ctx.oneri.h = oneriDogrula(t); }
    }
    return ctx.oneri.tamam ? oneriTamam() : oneriForm(ctx.oneri.t, ctx.oneri.h);
  };
  const oneriBagla = (kok, ctx) => {
    const y = kok.querySelector('[data-yuva="oneri"]');
    if (!y) return [];
    const cizO = () => { y.innerHTML = oneriPanel(ctx); const m = y.querySelector('[name="o-mesaj"]'); if (m) m.maxLength = O().mesajEnCok; };
    cizO();
    const oku = () => {
      const t = ctx.oneri.t, v = ad => y.querySelector(`[name="${ad}"]`)?.value ?? '';
      Object.assign(t, {ad: v('o-ad'), soyad: v('o-soyad'), eposta: v('o-eposta'), telefon: v('o-telefon').replace(/\D/g, ''), alan: v('o-alan'), mesaj: v('o-mesaj'), kvkk: !!y.querySelector('[name="o-kvkk"]')?.checked});
    };
    const girdi = ev => hataKaldir(ev.target);
    y.addEventListener('input', girdi);
    y.addEventListener('change', girdi);
    return [
      () => { y.removeEventListener('input', girdi); y.removeEventListener('change', girdi); },
      GM.on(kok, 'o-tur', (v, _d, ev) => { ctx.oneri.t.tur = v || ''; hataKaldir(ev.target); }),
      GM.on(kok, 'o-alan', (v, _d, ev) => { ctx.oneri.t.alan = v; hataKaldir(ev.target); }),
      GM.eylem(kok, 'oneri-yeni', () => { ctx.oneri = {t: oneriTaslak(), h: {}, tamam: false}; cizO(); }),
      GM.eylem(kok, 'oneri-gonder', el => {
        oku();
        ctx.oneri.h = oneriDogrula(ctx.oneri.t);
        if (Object.keys(ctx.oneri.h).length) { cizO(); hatayaGit(kok, y); GM.toast('**Eksik alanları** kontrol et', {tur: 'hata', yerine: true}); return; }
        GM.mesgul(el).then(() => {
          const t = ctx.oneri.t;
          GM.durum.yaz('oneri-gonderimleri', [{id: `O-${Date.now().toString(36).toUpperCase()}`, tarih: GM.bugunIso(), saat: simdiSaat(), uye: GM.uye(), ad: t.ad.trim(), soyad: t.soyad.trim(), eposta: t.eposta.trim(), telefon: t.telefon || null, tur: t.tur, alan: t.alan, mesaj: t.mesaj.trim()}, ...(GM.durum.oku('oneri-gonderimleri', []) || [])]);
          ctx.oneri.tamam = true;
          cizO();
          kok.querySelector('.gm-kaydir')?.scrollTo({top: 0, behavior: GM.azHareket() ? 'auto' : 'smooth'});
        });
      })
    ];
  };

  const bekle = ms => new Promise(r => setTimeout(r, GM.azHareket() ? 0 : ms));
  GM.ekran('cozum', {
    tur: 'alt',
    baslik: 'Çözüm Merkezi',
    iskelet: 'liste',
    yukle: () => bekle(GM.TK.motion.reveal),
    cekYenile: () => bekle(GM.TK.motion.reveal * 2),
    ciz: ctx => {
      ctx.kat ||= D().sss[0].kategori;
      const s = sekme(ctx), acik = GM.uye() ? talepler(ctx).filter(t => t.durum === 'acik' || t.durum === 'yanit').length : 0;
      const seg = GM.segment({ad: 'cm-sekme', etiket: 'Çözüm Merkezi bölümleri', kaydir: true, secili: s, ogeler: [{ad: 'Sık sorulanlar', deger: 'sss'}, {ad: 'Taleplerim', deger: 'talepler', sayi: acik || null}, {ad: 'Yeni talep', deger: 'yeni'}, {ad: 'Öneri ve şikâyet', deger: 'oneri'}]});
      const panel = (k, html) => `<div data-panel="${k}"${k === s ? '' : ' hidden'}>${html}</div>`;
      return GM.gruplar([
        {html: seg},
        {html: `${panel('sss', sssBolum(ctx))}${panel('talepler', `<div data-yuva="talep">${talepPanel(ctx, ctx.suz)}</div>`)}${panel('yeni', `<div data-yuva="yeni">${yeniPanel(ctx)}</div>`)}${panel('oneri', `<div data-yuva="oneri">${oneriPanel(ctx)}</div>`)}`}
      ], {bas: GM.metinBlok({baslik: 'Çözüm Merkezi', metin: D().giris})});
    },
    sonra: (kok, ctx) => {
      const ara = kok.querySelector('[name="sss-ara"]'), sss = kok.querySelector('[data-yuva="sss"]'), kat = kok.querySelector('[data-ad="sss-kat"]');
      const araGir = () => { const q = ara.value.trim(); kat.hidden = !!q; sss.innerHTML = sssPanel(ctx.kat, q); };
      ara.addEventListener('input', araGir);
      const sekmeye = k => kok.querySelector(`.gm-seg [data-seg="${k}"]`)?.click();
      // Seçili sekme (ör. ?sekme=oneri) kayan şeritte görünür başlar.
      const serit = kok.querySelector('.gm-seg.is-kaydir'), secili = serit?.querySelector('[aria-selected="true"]');
      if (serit && secili) serit.scrollLeft = Math.max(0, serit.scrollLeft + secili.getBoundingClientRect().left - serit.getBoundingClientRect().left - (serit.clientWidth - secili.offsetWidth) / 2);
      // Talep listesi: ilk 8 çizili, gerisi sonsuz kaydırma; sonda "Hepsi bu kadar · N talep".
      let io = null;
      const sonsuzBagla = () => { io?.disconnect(); const kap = kok.querySelector('[data-talep-liste]'); io = kap ? GM.sonsuzListe(kap, suzulmus(ctx, ctx.suz), t => talepSatir(t), {sayfa: SAYFA, birim: 'talep'}) : null; };
      const talepCiz = () => { kok.querySelector('[data-yuva="talep"]').innerHTML = talepPanel(ctx, ctx.suz); sonsuzBagla(); };
      const segSayi = () => { const b = kok.querySelector('.gm-seg [data-seg="talepler"]'); if (!b || !GM.uye()) return; const n = talepler(ctx).filter(t => t.durum === 'acik' || t.durum === 'yanit').length; b.innerHTML = `Taleplerim${n ? ` <span class="gm-seg-sayi">${n}</span>` : ''}`; };
      const ac = id => talepSheet(ctx, id, () => { talepCiz(); segSayi(); });
      sonsuzBagla();
      const c = [
        () => { ara.removeEventListener('input', araGir); io?.disconnect(); },
        GM.on(kok, 'cm-sekme', v => { ctx.sekme = v; kok.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== v; }); }),
        GM.eylem(kok, 'yeni-talep', () => sekmeye('yeni')),
        GM.eylem(kok, 'sss-git', () => sekmeye('sss')),
        GM.eylem(kok, 'talep-tumu', () => { ctx.suz = null; talepCiz(); }),
        GM.eylem(kok, 'talep-ac', el => ac(el.dataset.id)),
        GM.on(kok, 'talep-suz', v => { ctx.suz = v || null; talepCiz(); }),
        GM.on(kok, 'sss-kat', v => { ctx.kat = v; sss.innerHTML = sssPanel(v); }),
        GM.on(kok, 'talep-konu', (_v, _d, ev) => hataKaldir(ev.target)),
        (() => { const y = kok.querySelector('[data-yuva="yeni"]'), g = ev => hataKaldir(ev.target); y.addEventListener('input', g); return () => y.removeEventListener('input', g); })(),
        ...oneriBagla(kok, ctx),
        GM.eylem(kok, 'talep-gonder', el => {
          const id = talepGonder(kok, ctx);
          if (!id) return;
          GM.mesgul(el).then(() => {
            ctx.sekme = 'talepler';
            ctx.suz = null;
            GM.tazele();
            GM.toast(`**#${id}** numaralı talebin açıldı`, {tur: 'basari', ikon: 'inbox', eylem: 'Aç', onEylem: () => ac(id)});
          });
        })
      ];
      if (ctx.sorgu.talep && GM.uye() && !ctx.talepAcildi) { ctx.talepAcildi = true; requestAnimationFrame(() => ac(ctx.sorgu.talep)); }
      return () => c.forEach(f => f());
    }
  });

  // ================= Görüş Bildir =================
  const G = () => D().gorus;
  const SPEC = {
    oneri: {alan: true, dosya: true, mesaj: 'Önerini anlat', mesajYer: 'Neyi geliştirelim, ne iyi çalışıyor?', mesajZ: true, epostaZ: false},
    soru: {ek: ['soruKonulari', 'Sorunun konusu'], mesaj: 'Sorunu yaz', mesajYer: 'Merak ettiğin şeyi birkaç cümleyle yaz', mesajZ: true, epostaZ: true},
    teknik: {ek: ['teknikYerler', 'Sorunu nerede yaşadın?'], dosya: true, mesaj: 'Sorunu kısaca anlat', mesajYer: 'Ne yaptın, ne oldu?', mesajZ: true, epostaZ: false},
    ihlal: {link: true, ek: ['ihlalTurleri', 'İhlal türü'], dosya: true, mesaj: 'Açıklama', mesajYer: 'İhlali kısaca anlat', mesajZ: true, epostaZ: true},
    puan: {puan: true, mesaj: 'Eklemek istediğin bir şey var mı?', mesajYer: 'İsteğe bağlı', mesajZ: false, epostaZ: false}
  };
  const konuAl = k => (SPEC[k] ? k : 'oneri');
  const uyeEposta = () => kisi().eposta;
  const gorusTaslak = k => ({konu: konuAl(k), alan: G().alanlar[0], ek: '', link: '', mesaj: '', eposta: uyeEposta(), puan: 0, izin: !!uyeEposta(), kvkk: false});
  const gorusDogrula = t => {
    const s = SPEC[t.konu], h = {}, ep = t.eposta.trim();
    if (s.ek && !t.ek) h.ek = 'Bir seçenek seç.';
    if (s.link) h.link = !t.link.trim() ? 'İhlal içeren sayfanın bağlantısını yaz.' : BAGLANTI.test(t.link.trim()) ? '' : 'Geçerli bir bağlantı yaz (https:// ile).';
    if (s.puan && !t.puan) h.puan = 'Bir puan seç.';
    if (s.mesajZ && !t.mesaj.trim()) h.mesaj = 'Mesaj alanı boş; ne olduğunu birkaç cümleyle anlat.';
    if (s.epostaZ && !ep) h.eposta = 'E‑posta adresini yaz; cevabı bu adrese göndeririz.';
    else if (ep && !EPOSTA.test(ep)) h.eposta = 'Geçerli bir e‑posta adresi yaz (ad@site.com).';
    if (!t.kvkk) h.kvkk = 'Göndermek için onay kutusunu işaretle.';
    return temizHata(h);
  };
  const gorusPanel = (t, h) => {
    const s = SPEC[t.konu], uye = !!uyeEposta() && t.eposta.trim() === uyeEposta();
    const ek = s.ek ? GM.secAlan({ad: 'gb-ek', etiket: s.ek[1], zorunlu: true, secenekler: G()[s.ek[0]].map(x => [x, x]), deger: t.ek, yer: 'Seç', hata: h.ek}) : '';
    const alan = s.alan ? GM.alan({etiket: 'İlgili alan', html: GM.cipler({ad: 'gb-alan', tur: 'tek', serit: false, etiket: 'İlgili alan', secili: t.alan, ogeler: G().alanlar.map(a => ({metin: a, deger: a, kucuk: true}))})}) : '';
    const link = s.link ? GM.input({ad: 'gb-link', etiket: 'İhlal içeren sayfanın bağlantısı', tur: 'url', mod: 'url', yer: 'https://', deger: t.link, hata: h.link, zorunlu: true}) : '';
    const puan = s.puan ? GM.alan({etiket: 'Dada Gourmet deneyimini nasıl puanlarsın?', zorunlu: true, hata: h.puan, html: GM.yildizSec({ad: 'gb-puan', deger: t.puan, etiket: 'Dada Gourmet deneyimini nasıl puanlarsın?'})}) : '';
    const mesaj = GM.input({ad: 'gb-mesaj', etiket: s.mesaj, yer: s.mesajYer, deger: t.mesaj, cokSatir: true, zorunlu: s.mesajZ, hata: h.mesaj});
    const dosya = s.dosya ? GM.dosyaAlan({ad: 'gb-dosya', etiket: 'Ekran görüntüsü', metin: 'Ekran görüntüsü ekle', ikon: 'image', kabul: 'image/jpeg,image/png,image/webp', yardim: 'JPG, PNG ya da WebP · en çok 5 MB.'}) : '';
    const eposta = GM.input({ad: 'gb-eposta', etiket: s.epostaZ ? (t.konu === 'soru' ? 'E‑posta adresin (cevap için)' : 'E‑posta adresin') : 'E‑posta adresin (isteğe bağlı)', ikon: 'envelope', tur: 'email', mod: 'email', otomatik: 'email', yer: 'ad@site.com', deger: t.eposta, zorunlu: s.epostaZ, hata: h.eposta, yardim: h.eposta ? '' : uye ? 'Hesabındaki adres; istersen değiştirebilirsin.' : s.epostaZ ? 'Cevabı bu adrese göndeririz.' : 'Bırakırsan gerektiğinde bu adresten döneriz.'});
    const izin = s.epostaZ ? '' : GM.checkbox({ad: 'gb-izin', etiket: 'Gerekirse bu konuda benimle e‑posta ile iletişime geçilebilir.', secili: t.izin});
    return `<div class="gm-yigin">${alan}${link}${ek}${puan}${mesaj}${dosya}${eposta}${izin}</div>`;
  };
  const gorusForm = (t, h, mesgul) => GM.gruplar([
    {baslik: 'Konu seç', html: GM.secimler({ad: 'gb-konu', duzen: ['uc', 'orta'], secili: t.konu, ogeler: G().konular.map(x => ({k: x.k, ad: x.ad, ikon: x.ikon}))})},
    {baslik: G().konular.find(x => x.k === t.konu).ad, html: `<div data-yuva="gb-panel">${gorusPanel(t, h)}</div>`},
    {html: `<div class="gm-yigin">${kvkkAlan('gb-kvkk', t.kvkk, h.kvkk)}${GM.btn({metin: 'Gönder', ikon: 'gonder', tam: true, yukleniyor: mesgul, veri: {eylem: 'gorus-gonder'}})}</div>`}
  ], {bas: GM.p('Önerin, şikâyetin ya da sorun: **hepsine kulak veriyoruz**.', {ton: 'ikincil'})});
  const gorusTamam = ctx => GM.durumSahne({
    isaret: 'circle-check', baslik: 'Görüşün bize ulaştı',
    metin: `${G().tamam}${ctx.sorgu.eposta ? '; bir e‑posta adresi bıraktığın için gerektiğinde oradan döneriz' : ''}.`,
    ana: {metin: 'Forma dön', ikon: 'comment-dots', yerine: '#/gorus-bildir'},
    ikinciller: [{metin: 'Keşfet’e dön', ikon: 'house', yerine: '#/kesfet'}]
  });

  GM.ekran('gorus', {
    tur: 'alt',
    baslik: 'Görüş Bildir',
    iskelet: 'satir',
    ciz: ctx => {
      const hal = ctx.sorgu.hal;
      if (hal === 'tamam') return gorusTamam(ctx);
      if (!ctx.t) {
        ctx.t = gorusTaslak(ctx.sorgu.konu);
        ctx.h = {};
        if (hal === 'form-hata') { ctx.t.eposta = ctx.t.eposta ? ctx.t.eposta.replace(/\.[^.]+$/, '') : 'ad@site'; ctx.h = gorusDogrula(ctx.t); }
      }
      return `<form data-gorus-form novalidate>${gorusForm(ctx.t, ctx.h, hal === 'gonderiliyor')}</form>`;
    },
    sonra: (kok, ctx) => {
      if (ctx.sorgu.hal === 'tamam') return undefined;
      const f = kok.querySelector('[data-gorus-form]');
      const oku = () => {
        const t = ctx.t, v = ad => f.querySelector(`[name="${ad}"]`);
        if (v('gb-mesaj')) t.mesaj = v('gb-mesaj').value;
        if (v('gb-eposta')) t.eposta = v('gb-eposta').value;
        if (v('gb-link')) t.link = v('gb-link').value;
        if (v('gb-ek')) t.ek = v('gb-ek').value;
        const p = f.querySelector('.gm-yildiz-sec'); if (p) t.puan = +p.dataset.deger || 0;
        if (v('gb-izin')) t.izin = v('gb-izin').checked;
        t.kvkk = !!v('gb-kvkk')?.checked;
      };
      const ciz = () => { f.innerHTML = gorusForm(ctx.t, ctx.h, false); };
      const girdi = ev => { hataKaldir(ev.target); if (ev.target.name === 'gb-eposta' && uyeEposta()) { const y = ev.target.closest('.gm-alan')?.querySelector(':scope > .gm-yardim'); if (y) y.hidden = ev.target.value.trim() !== uyeEposta(); } };
      const yildiz = ev => { if (ev.target.closest('.gm-yildiz-sec')) hataKaldir(ev.target); };
      const submit = ev => { ev.preventDefault(); f.querySelector('[data-eylem="gorus-gonder"]')?.click(); };
      f.addEventListener('input', girdi);
      f.addEventListener('change', girdi);
      f.addEventListener('click', yildiz);
      f.addEventListener('submit', submit);
      const c = [
        () => { f.removeEventListener('input', girdi); f.removeEventListener('change', girdi); f.removeEventListener('click', yildiz); f.removeEventListener('submit', submit); },
        GM.on(kok, 'gb-konu', v => { if (!v || v === ctx.t.konu) return; oku(); ctx.t.konu = konuAl(v); ctx.t.ek = ''; ctx.h = {}; ciz(); }),
        GM.on(kok, 'gb-alan', v => { if (v) ctx.t.alan = v; }),
        GM.on(kok, 'gb-ek', (v, _d, ev) => { ctx.t.ek = v; hataKaldir(ev.target); }),
        GM.eylem(kok, 'gorus-gonder', el => {
          oku();
          ctx.h = gorusDogrula(ctx.t);
          if (Object.keys(ctx.h).length) { ciz(); hatayaGit(kok, f); GM.toast('**Eksik alanları** kontrol et', {tur: 'hata', yerine: true}); return; }
          const t = ctx.t, s = SPEC[t.konu], dosya = f.querySelector('[name="gb-dosya"]')?.files?.[0]?.name || null;
          GM.mesgul(el).then(() => {
            const kayit = {id: `G-${Date.now().toString(36).toUpperCase()}`, konu: t.konu, tarih: GM.bugunIso(), saat: simdiSaat(), uye: GM.uye(), mesaj: t.mesaj.trim(), eposta: t.eposta.trim() || null, izin: s.epostaZ || t.izin, dosya,
              ...(s.alan ? {alan: t.alan} : {}), ...(s.ek ? {ek: t.ek} : {}), ...(s.link ? {link: t.link.trim()} : {}), ...(s.puan ? {puan: t.puan} : {})};
            GM.durum.yaz('gorus-gonderimleri', [kayit, ...(GM.durum.oku('gorus-gonderimleri', []) || [])]);
            ctx.t = null;
            GM.yerine(`#/gorus-bildir?hal=tamam${kayit.eposta ? '&eposta=1' : ''}`);
          });
        })
      ];
      return () => c.forEach(x => x());
    }
  });

  // ================= SSS =================
  const sssSayfaPanel = q => {
    if (!q) return D().sss.map(k => GM.bolum({ic: false, baslik: k.kategori, html: sssAko(k.sorular, false)})).join('');
    const a = GM.katla(q), l = tumSorular().filter(s => GM.katla(`${s.soru} ${s.yanit}`).includes(a));
    if (!l.length) return GM.bos({ikon: 'ara_', baslik: 'Aramana uyan soru yok', metin: `**“${q}”** için soru bulamadık. Farklı bir kelime dene ya da **sorunu bize yaz**.`, eylem: {metin: 'Talep aç', ikon: 'ekle', tur: 'secondary', git: '#/cozum-merkezi?sekme=yeni'}, ikincil: {metin: 'Aramayı temizle', veri: {eylem: 'ara-temizle'}}});
    return `<div class="gm-yigin-12">${GM.p(`**“${q}”** için ${l.length} soru bulundu.`, {meta: true, ton: 'ikincil'})}${sssAko(l, true)}</div>`;
  };
  GM.ekran('sss', {
    tur: 'alt',
    baslik: 'Sıkça Sorulan Sorular',
    iskelet: 'satir',
    bos: {ikon: 'circle-question', baslik: 'Henüz soru yok', metin: 'Sık sorulan sorular eklendiğinde burada olacak. **Sorunu bize yaz**, cevaplayalım.', eylem: {metin: 'İletişim', ikon: 'envelope', git: '#/iletisim'}},
    ciz: ctx => {
      const q = (ctx.sorgu.hal === 'sonuc-yok' ? 'fatura' : ctx.sorgu.q || '').trim();
      return GM.gruplar([
        {html: GM.arama({ad: 'sss-ara', yer: 'Sorunu birkaç kelimeyle yaz', deger: q, sonuc: false})},
        `<div class="gm-yigin-24" data-yuva="sss" aria-live="polite">${sssSayfaPanel(q)}</div>`,
        {html: GM.ipucu({ikon: 'headset', baslik: 'Cevabını bulamadın mı?', metin: `Çözüm Merkezi’nden **talep aç**; ${D().calisma.replace(/^Destek ekibi /, 'ekip ')}`, eylem: {metin: 'Talep aç', git: '#/cozum-merkezi?sekme=yeni'}})}
      ], {bas: GM.metinBlok({etiket: 'Yardım', baslik: 'Sıkça Sorulan Sorular', metin: `${sssSay()} soru, ${D().sss.length} kategori.`, h: 1})});
    },
    sonra: kok => {
      const girdi = kok.querySelector('[name="sss-ara"]'), yuva = kok.querySelector('[data-yuva="sss"]');
      const suz = () => { yuva.innerHTML = sssSayfaPanel(girdi.value.trim()); };
      girdi.addEventListener('input', suz);
      const c = GM.eylem(kok, 'ara-temizle', () => { girdi.value = ''; girdi.closest('.gm-girdi')?.classList.remove('has-text'); suz(); girdi.focus(); });
      return () => { girdi.removeEventListener('input', suz); c(); };
    }
  });

  // ================= İletişim =================
  const L = () => D().iletisim;
  const konuVar = k => L().form.konular.some(([v]) => v === k);
  const iletisimDogrula = d => temizHata({
    ad: d.ad.trim() ? '' : 'Adını yaz.', soyad: d.soyad.trim() ? '' : 'Soyadını yaz.',
    eposta: !d.eposta.trim() ? 'E‑posta adresini yaz; cevabı bu adrese göndeririz.' : EPOSTA.test(d.eposta.trim()) ? '' : 'Geçerli bir e‑posta adresi yaz (ad@site.com).',
    telefon: !d.telefon || /^5\d{9}$/.test(d.telefon) ? '' : 'Başında 0 olmadan 10 haneli cep numaranı yaz.',
    konu: konuVar(d.konu) ? '' : 'Bir konu seç; mesajın doğru ekibe gitsin.',
    mesaj: !d.mesaj.trim() ? 'Mesaj alanı boş; ne olduğunu birkaç cümleyle anlat.' : d.mesaj.trim().length < 10 ? 'En az 10 karakter yaz.' : '',
    onay: d.onay ? '' : 'Göndermek için onay kutusunu işaretle.'
  });
  const iletisimForm = (d, h) => {
    const F = L().form, n = Object.keys(h).length;
    return `<div class="gm-yigin">
      ${n ? GM.bant({ton: 'hata', baslik: 'Mesaj gönderilemedi', metin: `Aşağıdaki **${n} alanı** kontrol et.`}) : ''}
      ${GM.input({ad: 'i-ad', etiket: 'Ad', yer: 'Adın', zorunlu: true, deger: d.ad, hata: h.ad, otomatik: 'given-name'})}
      ${GM.input({ad: 'i-soyad', etiket: 'Soyad', yer: 'Soyadın', zorunlu: true, deger: d.soyad, hata: h.soyad, otomatik: 'family-name'})}
      ${GM.input({ad: 'i-eposta', etiket: 'E‑posta', zorunlu: true, tur: 'email', mod: 'email', ikon: 'envelope', yer: 'ad@site.com', deger: d.eposta, hata: h.eposta, otomatik: 'email'})}
      ${GM.telefon({ad: 'i-telefon', ulkeAd: 'i-telefon-ulke', etiket: 'Telefon', opsiyonel: true, deger: d.telefon, hata: h.telefon})}
      ${GM.secAlan({ad: 'i-konu', etiket: 'Konu', zorunlu: true, secenekler: F.konular, deger: d.konu || '', yer: 'Konu seç', hata: h.konu, yardim: h.konu ? '' : F.konuYardim})}
      ${GM.input({ad: 'i-mesaj', etiket: 'Mesajın', yer: 'Mesajını buraya yaz', zorunlu: true, cokSatir: true, deger: d.mesaj, hata: h.mesaj, yardim: h.mesaj ? '' : `En çok ${GM.sayi(F.mesajEnCok)} karakter.`})}
      ${GM.alan({etiket: 'Onay', zorunlu: true, hata: h.onay, html: `<div class="gm-yigin-8">${GM.checkbox({ad: 'i-onay', etiket: 'KVKK Aydınlatma Metni’ni okudum; mesajımın yanıtlanması için verilerimin işlenmesini onaylıyorum.', secili: d.onay})}${GM.btn({metin: 'Aydınlatma Metni’ni oku', tur: 'text', boyut: 'sm', ikon: 'file-lines', git: '#/yasal/kvkk'})}</div>`})}
      ${GM.p(F.not, {meta: true, ton: 'ikincil'})}
      ${GM.btn({metin: 'Mesajı gönder', ikon: 'gonder', tam: true, veri: {eylem: 'iletisim-gonder'}})}
    </div>`;
  };
  const adimSatir = (a, i) => ({ikon: a.ikon, baslik: `${i + 1}. ${a.baslik}`, alt: a.metin});
  const yolGrup = () => ({baslik: L().yol.baslik, satirlar: L().yol.adimlar.map(adimSatir)});
  const bilgiGrup = () => ({html: `<div class="gm-yigin-12">${GM.kunye(L().bilgiler.flatMap(([ikon, etiket, deger]) => (ikon === 'clock' ? deger.split(' · ').map((d, i) => (i ? {ikon: 'pen-to-square', etiket: 'Form', deger: d.replace(/^Form\s*/, '')} : {ikon, etiket: 'Destek', deger: d.replace(/\s*–\s*/, '–')})) : [{ikon, etiket, deger}])))}${GM.btn({metin: 'E‑posta adresini kopyala', ikon: 'kopyala', tur: 'secondary', tam: true, veri: {eylem: 'eposta-kopyala'}})}</div>`});
  const digerGrup = () => ({baslik: 'Başka yollar', satirlar: [
    {ikon: 'circle-question', baslik: 'Sıkça Sorulan Sorular', alt: `${sssSay()} soru`, git: '#/sss'},
    {ikon: 'inbox', baslik: 'Çözüm Merkezi', alt: 'Taleplerin ve yanıtlar', git: '#/cozum-merkezi'},
    {ikon: 'store', baslik: 'Mekân öner', alt: 'Bildiğin bir mekânı editörlere gönder', git: '#/mekan-oner'}]});
  const iletisimIlk = ctx => {
    const k = kisi();
    if (ctx.sorgu.hal === 'form-hata') return {ad: k.ad, soyad: '', eposta: 'deniz@posta', telefon: '', konu: '', mesaj: '', onay: false};
    return {...k, konu: konuVar(ctx.sorgu.konu) ? ctx.sorgu.konu : '', mesaj: '', onay: false};
  };
  GM.ekran('iletisim', {
    tur: 'alt',
    baslik: 'İletişim',
    iskelet: 'satir',
    ciz: ctx => {
      const bas = GM.metinBlok({etiket: L().etiket, baslik: L().baslik, metin: 'Öneri, bilgi düzeltme ya da **iş birliği**: doğru ekibe yönlendirelim.', h: 1});
      if (ctx.sorgu.hal === 'tamam') return GM.gruplar([{html: GM.bos({ikon: 'circle-check', baslik: 'Mesajın gönderildi', metin: `Teşekkürler! Cevabımız **e‑posta adresine** gelir. ${D().oneri.donus}`, eylem: {metin: 'Keşfet’e dön', ikon: 'house', yerine: '#/kesfet'}, ikincil: {metin: 'Yeni mesaj yaz', yerine: '#/iletisim'}})}, yolGrup()], {bas});
      if (!ctx.d) { ctx.d = iletisimIlk(ctx); ctx.h = ctx.sorgu.hal === 'form-hata' ? iletisimDogrula(ctx.d) : {}; }
      return GM.gruplar([
        bilgiGrup(),
        {html: `<div class="gm-yigin">${GM.metinBlok({baslik: L().form.baslik, metin: L().form.metin, rol: 'section'})}<div data-yuva="form">${iletisimForm(ctx.d, ctx.h)}</div></div>`},
        yolGrup(),
        digerGrup()
      ], {bas});
    },
    sonra: (kok, ctx) => {
      if (ctx.sorgu.hal === 'tamam') return undefined;
      const y = kok.querySelector('[data-yuva="form"]');
      const sinir = () => { const m = y.querySelector('[name="i-mesaj"]'); if (m) m.maxLength = L().form.mesajEnCok; };
      sinir();
      const oku = () => { const v = ad => y.querySelector(`[name="${ad}"]`)?.value ?? ''; Object.assign(ctx.d, {ad: v('i-ad'), soyad: v('i-soyad'), eposta: v('i-eposta'), telefon: v('i-telefon').replace(/\D/g, ''), konu: v('i-konu'), mesaj: v('i-mesaj'), onay: !!y.querySelector('[name="i-onay"]')?.checked}); };
      const girdi = ev => hataKaldir(ev.target);
      y.addEventListener('input', girdi);
      y.addEventListener('change', girdi);
      const c = [
        () => { y.removeEventListener('input', girdi); y.removeEventListener('change', girdi); },
        GM.on(kok, 'i-konu', (_v, _d, ev) => hataKaldir(ev.target)),
        GM.eylem(kok, 'eposta-kopyala', () => {
          const e = L().bilgiler.find(([i]) => i === 'envelope')?.[2] || GMX.sirket.eposta;
          (navigator.clipboard?.writeText(e) || Promise.reject()).then(() => GM.toast(`**${e}** kopyalandı`, {ikon: 'kopyala', yerine: true}), () => GM.toast(`E‑posta: **${e}**`, {ikon: 'envelope', yerine: true}));
        }),
        GM.eylem(kok, 'iletisim-gonder', el => {
          oku();
          ctx.h = iletisimDogrula(ctx.d);
          if (Object.keys(ctx.h).length) { y.innerHTML = iletisimForm(ctx.d, ctx.h); sinir(); hatayaGit(kok, y); GM.toast('**Eksik alanları** kontrol et', {tur: 'hata', yerine: true}); return; }
          if (!navigator.onLine) { GM.toast('Çevrimdışısın; mesaj **bağlantı gelince** gönderilebilir', {tur: 'hata', ikon: 'baglanti', yerine: true}); return; }
          GM.mesgul(el).then(() => {
            const d = ctx.d;
            GM.durum.yaz('iletisim-gonderimleri', [{id: `I-${Date.now().toString(36).toUpperCase()}`, tarih: GM.bugunIso(), saat: simdiSaat(), uye: GM.uye(), ad: d.ad.trim(), soyad: d.soyad.trim(), eposta: d.eposta.trim(), telefon: d.telefon || null, konu: d.konu, mesaj: d.mesaj.trim()}, ...(GM.durum.oku('iletisim-gonderimleri', []) || [])]);
            ctx.d = null;
            GM.yerine('#/iletisim?hal=tamam');
          });
        })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
