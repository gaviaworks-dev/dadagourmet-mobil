/* Bildirimler (#/bildirimler). Diet mobil bildirimler.js kalıbı (Gastro arama.js S2): üst barda ayar ikonu, baş bloğu ("N okunmamış" + Tümünü okundu + açıklama),
 *   tür süzgeci çip şeridi + tarih çipi, gün grupları (Bugün · Dün · Bu hafta · Daha önce), satır başına üç nokta sheet'i (aç · okundu/okunmadı · sil), okunmamışa "Yeni" rozeti.
 * Kaynak GMX.bildirimler (ekranlar/profil-veri.js): rezervasyon hatırlatması, 12.30 öğle ve 19.00 akşam önerisi, etkinlik, Dada Puan, rota yaklaşma, katkı, güvenlik; her biri b.hedef adresine gider.
 * Sonsuz kaydırma: ilk sayfa 10 bildirim, GM.sonsuz ile sayfa sayfa; grup başlığı yalnız grubun ilk bildiriminde basılır; son sayfada "Hepsi bu kadar".
 * Kalıcı: bildirim-okundu, bildirim-silinen (id listesi; kanon GM.bildirimSayi). Her değişimde document'e 'gm-bildirim' olayı gider, zil GM.zilTazele ile tazelenir.
 * İzin: durum 'bildirim-izin' === 'reddedildi' ya da ?hal=izin-kapali → listenin üstünde uyarı bandı (#/izin-reddi?tur=bildirim).
 * #/bildirimler?tur=oneri süzgeci açar, ?tarih=bugun|hafta|ay|aralik&bas=…&son=… tarih süzgecini açar, ?hal=bos boş hal, ?hal=hata bağlantı hatası. Yeni hesapta (GM.yeniHesap) liste boştur. */
(() => {
  const SAYFA = 10;
  const TURLER = [['rezervasyon', 'Rezervasyon', 'rezervasyon'], ['oneri', 'Öneri', 'utensils'], ['etkinlik', 'Etkinlik', 'etkinlik'], ['puan', 'Puan', 'puanDada'], ['rota', 'Rota', 'rota'], ['katki', 'Katkı', 'ekle'], ['guvenlik', 'Güvenlik', 'gizlilik']];
  const GRUPLAR = ['Bugün', 'Dün', 'Bu hafta', 'Daha önce'];
  const AYLAR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const turAd = t => TURLER.find(x => x[0] === t)?.[1] || 'Bildirim';
  const okunan = () => GM.durum.oku('bildirim-okundu', []) || [];
  const silinen = () => GM.durum.oku('bildirim-silinen', []) || [];
  const yayinla = () => { document.dispatchEvent(new CustomEvent('gm-bildirim')); GM.zilTazele?.(); };
  const okunduYaz = ids => { GM.durum.yaz('bildirim-okundu', [...new Set([...okunan(), ...ids])]); yayinla(); };
  const nk = s => String(s ?? '').replace(/(\d{1,2}):(\d{2})/g, '$1.$2');
  const gunEkle = (s, n) => { const [y, a, g] = s.split('-').map(Number); return new Date(Date.UTC(y, a - 1, g + n)).toISOString().slice(0, 10); };
  const gunFark = iso => Math.round((Date.parse(`${GM.bugunIso()}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)) / 864e5);
  const grupAd = b => { const f = gunFark(b.tarih); return f <= 0 ? 'Bugün' : f === 1 ? 'Dün' : f < 7 ? 'Bu hafta' : 'Daha önce'; };
  const tarihMetin = iso => { const [, a, g] = iso.split('-').map(Number); return `${g} ${AYLAR[a - 1]}`; };
  const zamanMetin = b => (gunFark(b.tarih) <= 1 ? nk(b.saat) : `${tarihMetin(b.tarih)} · ${nk(b.saat)}`);
  const tumu = () => (GM.yeniHesap() ? [] : [...(window.GMX?.bildirimler || [])]).sort((x, y) => `${y.tarih}${y.saat}`.localeCompare(`${x.tarih}${x.saat}`));
  const liste = ctx => (ctx.sorgu.hal === 'bos' || !GM.uye() ? [] : tumu().filter(b => !silinen().includes(b.id)).map(b => ({...b, okundu: !!b.okundu || okunan().includes(b.id)})));
  const suzgec = ctx => { const t = ctx.suz ?? ctx.sorgu.tur ?? ''; return TURLER.some(x => x[0] === t) ? t : ''; };
  const izinKapali = ctx => ctx.sorgu.hal === 'izin-kapali' || GM.durum.oku('bildirim-izin', null) === 'reddedildi';

  // Tarih süzgeci (Gastro bildirimler TARIH): Tüm zamanlar · Bugün · Son 7 gün · Son 30 gün · Tarih aralığı seç (GM.takvimSheet, uçlar dahil).
  const TARIH = [['tum', 'Tüm zamanlar', null], ['bugun', 'Bugün', 0], ['hafta', 'Son 7 gün', 7], ['ay', 'Son 30 gün', 30], ['aralik', 'Tarih aralığı seç', null]];
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  const tarihSuz = ctx => {
    if (!ctx.tarih) {
      const t = TARIH.some(x => x[0] === ctx.sorgu.tarih) ? ctx.sorgu.tarih : 'tum', a = [ctx.sorgu.bas, ctx.sorgu.son].filter(x => ISO.test(x || '')).sort();
      ctx.tarih = t === 'aralik' && a.length !== 2 ? 'tum' : t; ctx.aralik = t === 'aralik' && a.length === 2 ? a : null; ctx.tarihOdak = ctx.tarih !== 'tum';
    }
    return ctx.tarih;
  };
  const aralikAd = ([a, b]) => (a === b ? GM.tarihKisa(a) : `${GM.tarihKisa(a)} – ${GM.tarihKisa(b)}`);
  const tarihAd = ctx => (tarihSuz(ctx) === 'aralik' ? aralikAd(ctx.aralik) : TARIH.find(x => x[0] === tarihSuz(ctx))[1]);
  const tarihUyar = ctx => b => {
    const t = tarihSuz(ctx); if (t === 'tum') return true;
    if (t === 'aralik') return b.tarih >= ctx.aralik[0] && b.tarih <= ctx.aralik[1];
    return b.tarih >= gunEkle(GM.bugunIso(), -TARIH.find(x => x[0] === t)[2]) && b.tarih <= GM.bugunIso();
  };

  const BOS = {ikon: 'bildirim', baslik: 'Şimdilik sessiz', metin: 'Rezervasyon hatırlatması, **12.30 ve 19.00 önerileri** ya da puan haberi geldiğinde burada görünür.', eylem: {metin: 'Bildirim ayarları', ikon: 'ayar', tur: 'secondary', git: '#/ayarlar/bildirimler'}};
  const izinBant = () => GM.bant({ton: 'uyari', ikon: 'bell-slash', baslik: 'Bildirimler kapalı', metin: 'Telefonunda **Dada Gourmet bildirimleri** kapalı; hatırlatmalar gelmez, liste burada kalır.', eylem: {metin: 'Bildirimleri aç', git: '#/izin-reddi?tur=bildirim'}});
  // Satır: GM.satirKap = bildirim + üç nokta. "tür · zaman" metası ve okunmamışta "Yeni" rozeti kanondan (GM.bildirimSatir).
  const satir = b => GM.satirKap(GM.bildirimSatir({...b, baslik: nk(b.baslik), metin: nk(b.metin), zaman: zamanMetin(b)}, {meta: turAd(b.tur)}), GM.ikonBtn({ikon: 'more', etiket: `${nk(b.baslik)}: seçenekler`, veri: {eylem: 'b-daha', id: String(b.id)}}));
  // Sayfa: [bas, son) aralığındaki bildirimler, gruplarına bölünür; grup başlığı yalnız grubun ilk bildirimi bu sayfadaysa basılır.
  const sayfaHtml = (g, bas) => {
    const parca = g.slice(bas, bas + SAYFA); if (!parca.length) return '';
    const bloklar = []; let i = 0;
    while (i < parca.length) {
      const ad = grupAd(parca[i]), blok = []; while (i < parca.length && grupAd(parca[i]) === ad) blok.push(parca[i++]);
      const ilk = g.findIndex(b => grupAd(b) === ad) >= bas;
      bloklar.push(`<section class="gm-yigin-8">${ilk ? `<p class="gm-t-label gm-ton-ikincil">${ad}</p>` : ''}${GM.satirlar(blok.map(satir))}</section>`);
    }
    return bloklar.join('') + (bas + SAYFA >= g.length ? GM.veriYok(`**Hepsi bu kadar** · ${g.length} bildirim`) : '');
  };
  const basBlok = (l, suz, ctx) => {
    const n = l.filter(b => !b.okundu).length, tarihAcik = tarihSuz(ctx) !== 'tum';
    const tarihCip = {metin: tarihAd(ctx), ikon: 'calendar-days', etiket: `Tarih süzgeci: ${tarihAd(ctx)}`, veri: {eylem: 'tarih-sec'}, attrs: `aria-haspopup="dialog" aria-pressed="${tarihAcik}"`};
    const cip = GM.cipler({ad: 'bildirim-tur', tur: 'tek', etiket: 'Bildirim süzgeci', secili: suz, ogeler: [{metin: 'Tümü', deger: '', sayi: l.length}, ...TURLER.map(([deger, metin, ikon]) => ({metin, ikon, deger})), tarihCip]});
    return `<div class="gm-yigin-12">${izinKapali(ctx) ? izinBant() : ''}<div class="gm-ara"><span class="gm-t-sub" role="status">${n ? `${n} okunmamış` : 'Hepsi okundu'}</span><span class="gm-sira">${n ? GM.btn({metin: 'Tümünü okundu', ikon: 'onay', tur: 'text', boyut: 'sm', veri: {eylem: 'hepsi-okundu'}}) : `<span class="gm-t-meta gm-ton-ikincil">${l.length} bildirim</span>`}${l.length ? GM.ikonBtn({ikon: 'sil', etiket: 'Bildirimleri temizle', veri: {eylem: 'temizle'}}) : ''}</span></div>${GM.p('Rezervasyon, **12.30 ve 19.00 önerileri**, etkinlik, puan ve rota bildirimlerin tek akışta.', {ton: 'ikincil', meta: true})}${cip}</div>`;
  };
  const gorunen = ctx => { const suz = suzgec(ctx); return liste(ctx).filter(b => !suz || b.tur === suz).filter(tarihUyar(ctx)); };

  let hataGosterildi = false;
  GM.ekran('bildirimler', {
    tur: 'alt',
    baslik: 'Bildirimler',
    ust: '#/kesfet',
    yenile: true,
    iskelet: 'liste',
    bos: BOS,
    ustBar: () => (GM.uye() ? {sag: [{ikon: 'ayar', etiket: 'Bildirim ayarları', git: '#/ayarlar/bildirimler'}]} : {}),
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, GM.azHareket() ? 0 : GM.TK.motion.reveal));
    },
    cekYenile: () => new Promise(tamam => setTimeout(tamam, GM.TK.motion.reveal)),
    ciz: ctx => {
      const l = liste(ctx);
      if (!l.length) return `${izinKapali(ctx) && GM.uye() ? `<div class="gm-ic">${izinBant()}</div>` : ''}${GM.bos({...BOS, tam: true})}`;
      const suz = suzgec(ctx), tarihAcik = tarihSuz(ctx) !== 'tum', g = gorunen(ctx);
      const bosMetin = suz && tarihAcik ? 'Seçtiğin tür ya da **tarih aralığında** bildirim yok.'
        : tarihAcik ? `**${tarihAd(ctx)}** için bildirimin yok.` : `Şu an **${turAd(suz).toLocaleLowerCase('tr')}** türünde bildirimin yok.`;
      const govde = g.length
        ? {html: `<div class="gm-yigin" data-bildirim-liste>${sayfaHtml(g, 0)}</div>`}
        : {html: GM.bos({ikon: 'filtre', baslik: 'Bu süzgeçte bildirim yok', metin: bosMetin, eylem: {metin: 'Süzgeci sıfırla', tur: 'secondary', veri: {eylem: 'suz-sifirla'}}})};
      return GM.gruplar([govde], {bas: basBlok(l, suz, ctx)});
    },
    sonra: (kok, ctx) => {
      // Son dokunulan süzgeç şeritte görünür kalsın.
      { const r = kok.querySelector('[data-ad="bildirim-tur"]'), b = r?.querySelector(ctx.tarihOdak ? '[data-eylem="tarih-sec"]' : '[data-cip][aria-pressed=true]'); if (b) r.scrollLeft += b.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - b.offsetWidth) / 2; }
      // Sonsuz kaydırma: sayfa n (2'den başlar) → [ (n-1)*10, n*10 ); boş dönünce durur.
      const kap = kok.querySelector('[data-bildirim-liste]'), g = gorunen(ctx);
      const io = kap && g.length > SAYFA ? GM.sonsuz(kap, n => sayfaHtml(g, (n - 1) * SAYFA) || null) : null;
      const bul = id => tumu().find(x => String(x.id) === String(id));
      const hepsiOku = () => { okunduYaz(liste(ctx).map(b => b.id)); GM.tazele(); GM.toast('Bildirimler **okundu** sayıldı', {ikon: 'onay'}); };
      const geriAl = once => () => { GM.durum.yaz('bildirim-silinen', once); yayinla(); GM.tazele(); };
      const temizle = () => {
        const once = silinen();
        GM.durum.yaz('bildirim-silinen', [...new Set([...once, ...gorunen(ctx).map(b => b.id)])]); yayinla(); GM.tazele();
        GM.toast('Bildirimler **temizlendi**', {ikon: 'sil', eylem: 'Geri al', yerine: true, onEylem: geriAl(once)});
      };
      const sil = b => {
        const once = silinen();
        GM.durum.yaz('bildirim-silinen', [...once, b.id]); yayinla(); GM.tazele();
        GM.toast('Bildirim silindi', {ikon: 'sil', eylem: 'Geri al', yerine: true, onEylem: geriAl(once)});
      };
      // Okunmadı yalnız bu cihazda okunmuş sayılan bildirime geri verilir; zil sayacı aynı listeyi okur.
      const okunmadi = b => { GM.durum.yaz('bildirim-okundu', okunan().filter(x => x !== b.id)); yayinla(); GM.tazele(); GM.toast('Bildirim **okunmadı** olarak işaretlendi', {ikon: 'bildirim', yerine: true}); };
      const ac = ev => { const el = ev.target.closest('.gm-bildirim'); if (!el || !kok.contains(el)) return; const b = bul(el.dataset.id); if (!b) return; okunduYaz([b.id]); GM.git(b.hedef); };
      kok.addEventListener('click', ac);
      const baglar = [
        GM.eylem(kok, 'hepsi-okundu', hepsiOku),
        GM.eylem(kok, 'temizle', () => GM.dialog({baslik: 'Bildirimler temizlensin mi?', metin: `Bu süzgeçteki **${gorunen(ctx).length} bildirim** silinir.`, eylem: 'Temizle', iptal: 'Vazgeç', yikici: true}).then(ok => { if (ok) temizle(); })),
        GM.eylem(kok, 'suz-sifirla', () => { ctx.suz = ''; ctx.tarih = 'tum'; ctx.aralik = null; ctx.tarihOdak = false; GM.tazele(); }),
        GM.eylem(kok, 'tarih-sec', () => GM.siralaSheet({baslik: 'Tarih', etiket: 'Tarih aralığı', secili: tarihSuz(ctx), secenekler: TARIH.map(([d, m]) => [d, m]), sec: v => {
          if (v !== 'aralik') { ctx.tarih = v; ctx.aralik = null; ctx.tarihOdak = true; GM.tazele(); return; }
          // Seçim sheet'i kapanırken takvim açılır; Vazgeç önceki süzgeci korur.
          setTimeout(async () => {
            const bugun = GM.bugunIso(), onceki = tarihSuz(ctx) === 'aralik' ? ctx.aralik : null;
            const r = await GM.takvimSheet({baslik: 'Tarih aralığı', mod: 'aralik', max: bugun, ...(onceki ? {aralik: onceki, odak: onceki[1]} : {}), hizli: [['Son 3 gün', -3], ['Son 1 hafta', -7], ['Son 1 ay', -30]]});
            if (!Array.isArray(r) || r.length !== 2 || !r[0] || !r[1]) return;
            ctx.aralik = [...r].sort(); ctx.tarih = 'aralik'; ctx.tarihOdak = true; GM.tazele();
          });
        }})),
        GM.on(kok, 'bildirim-tur', v => { ctx.suz = v || ''; ctx.tarihOdak = false; GM.tazele(); }),
        GM.eylem(kok, 'b-daha', el => {
          const b = bul(el.dataset.id); if (!b) return;
          const okundu = !!b.okundu || okunan().includes(b.id), geriAlinir = !b.okundu && okunan().includes(b.id);
          GM.sheet({
            baslik: nk(b.baslik),
            html: GM.satirlar([
              {ikon: 'arrow-right', baslik: 'İlgili sayfaya git', veri: {eylem: 's-ac'}, attrs: 'data-sheet-kapat'},
              !okundu ? {ikon: 'onay', baslik: 'Okundu olarak işaretle', veri: {eylem: 's-okundu'}, attrs: 'data-sheet-kapat', ok: false}
                : geriAlinir ? {ikon: 'bildirim', baslik: 'Okunmadı olarak işaretle', veri: {eylem: 's-okunmadi'}, attrs: 'data-sheet-kapat', ok: false} : null,
              {ikon: 'sil', baslik: 'Bildirimi sil', yikici: true, veri: {eylem: 's-sil'}, attrs: 'data-sheet-kapat', ok: false}
            ].filter(Boolean)),
            sonra: d => {
              const c = [
                GM.eylem(d, 's-ac', () => { okunduYaz([b.id]); GM.git(b.hedef); }),
                GM.eylem(d, 's-okundu', () => { okunduYaz([b.id]); GM.tazele(); GM.toast('Bildirim **okundu** sayıldı', {ikon: 'onay', yerine: true}); }),
                GM.eylem(d, 's-okunmadi', () => okunmadi(b)),
                GM.eylem(d, 's-sil', () => sil(b))
              ];
              return () => c.forEach(f => f());
            }
          });
        })
      ];
      return () => { io?.disconnect(); kok.removeEventListener('click', ac); baglar.forEach(c => c()); };
    }
  });
})();
