/* Etkinlikler (Lezzet Takvimi) — icerik paketi. Rotalar: #/etkinlikler (alt menü sekmesi) · #/etkinlik/:slug · #/etkinlik-oner.
   Web kaynağı: dadagourmet-prototip etkinlikler/, etkinlik-detay/ ve docs/WEB-ENVANTERI.md §4.1. Veri GMV.etkinlikler (126) + GMX.etkinlikEk/etkinlikDetay
   (ekranlar/icerik-veri.js: canlı açıklama paragrafları, Bir bakışta, program, katılımcı profili, ücret, bilet bağlantısı, kapak künyesi CC).
   Liste = Gastro liste-v2 (kubbe + yapışkan araç): bölge segmenti Türkiye / Uluslararası, 10 kategori çipi (bölgede kaydı olmayan gizlenir, web gibi),
   arama, 6 süzgeç grubu (Tarih · Konum · Tür · Katılımcı · Ücret · Diğer), 5 sıralama, Liste / Takvim / Harita görünümü; listede ızgara/satır,
   12'lik sonsuz kaydırma ve "Hepsi bu kadar" bitişi; geçmiş etkinlikler listenin sonunda "Sona eren etkinlikler" ayracıyla.
   Detay = Gastro detay-v2 (banner + özet şeridi + gövde + alt eylem çubuğu): Katılacağım, Takvime ekle (.ics), Hatırlatma, Kaydet, Paylaş, Bilet,
   konum haritası (yuvarlak pin), rota köprüsü, takvimdeki diğer etkinlikler, kapak künyesi (CC lisans atfı, eserin yanında: panel _kapak-kunyesi kuralı).
   Kayıtlar (GM.durum): 'etkinlik-katilim' (Katılacağım), 'etkinlik-kayit' (Kaydet/İlgilendiğim), 'etkinlik-hatirlatma' {slug: önce}, 'katki-etkinlik' (öneriler).
   Üyede tohum GMX.hesap.etkinliklerim (profil paketi); misafirde boş ve bu eylemler üye duvarını açar.
   Ekrana özgü hâller: #/etkinlikler?hal=sonuc-yok · ?gorunum=takvim|harita · #/etkinlik/:slug?hal=bulunamadi · #/etkinlik-oner?hal=gonderildi|eksik. */
(() => {
  const X = () => window.GMX || {};
  const bugun = () => GM.bugunIso();
  const tum = () => GMV.etkinlikler || [];
  const bul = slug => tum().find(e => e.slug === slug) || null;
  const ek = e => X().etkinlikEk?.[e.slug] || {};
  const dt = e => X().etkinlikDetay?.[e.slug] || null;
  const gecmis = e => e.bit < bugun();
  const suruyor = e => e.tarih <= bugun() && e.bit >= bugun();
  const KATEGORI = () => X().etkinlikKategori || [];
  const katAd = k => KATEGORI().find(x => x.deger === k)?.ad || k;
  const AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const AY_UZUN = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const par = s => s.split('-').map(Number);
  const isoTarih = s => new Date(`${s}T12:00:00`);
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const gunEkle = (s, n) => { const d = isoTarih(s); d.setDate(d.getDate() + n); return iso(d); };
  const gunFark = (a, b) => Math.round((isoTarih(b) - isoTarih(a)) / 864e5);
  // "13–22 Kas" · "10 Eki – 6 Ara" · "23 Kas" (+ yıl bugünkü yıldan farklıysa)
  const aralik = (e, o = {}) => {
    const [y1, a1, g1] = par(e.tarih), [y2, a2, g2] = par(e.bit), yil = y2 !== par(bugun())[0] || o.yil ? ` ${y2}` : '', ay = o.uzun ? AY_UZUN : AY;
    if (e.tarih === e.bit) return `${g1} ${ay[a1 - 1]}${yil}`;
    if (y1 === y2 && a1 === a2) return `${g1}–${g2} ${ay[a2 - 1]}${yil}`;
    return `${g1} ${ay[a1 - 1]}${y1 !== y2 ? ` ${y1}` : ''} – ${g2} ${ay[a2 - 1]}${yil}`;
  };
  // Başlık adı (denetim Tur 10): banner başlığı en çok 2 satır, anlamlı yerde biter. Sırayla: tire sonrası alt başlık düşer; uzun adda
  // parantez içi kısa ad (Hotel Show 2026) alınır, "Uluslararası" düşer; hâlâ uzunsa yıl sonrası ("ProWein Düsseldorf 2027 …") ya da kelime sınırında kesilir. Tam ad "Bir bakışta"da.
  const BAS_EN = 40;
  const kisaAd = e => {
    let a = e.ad.split(/ [–-] /)[0].trim();
    const par = a.match(/\(([^)]+)\)\s*$/);
    if (a.length > BAS_EN && par && par[1].length <= BAS_EN) a = par[1];
    if (a.length > BAS_EN) a = a.replace(/ Uluslararası /, ' ');   // tam ad Bir bakışta'da kalır
    if (a.length <= BAS_EN) return a;
    const yil = a.match(/^(.{12,}?\b20\d\d)\b/);
    if (yil && yil[1].length <= BAS_EN) return yil[1];
    return `${a.slice(0, BAS_EN).replace(/[\s,;:/]+\S*$/, '').replace(/\s+(ve|ile|de|da)$/, '')}…`;
  };
  const yerMetin = e => [e.yer, e.il && e.il !== e.yer ? e.il : null].filter(Boolean).join(', ');

  // ---------- Kullanıcı kayıtları ----------
  const H = () => X().hesap || {};
  const liste = (anahtar, tohum) => GM.durum.oku(anahtar, GM.yeniHesap() ? [] : tohum() || []) || [];
  const katilim = () => liste('etkinlik-katilim', () => H().etkinliklerim?.katilacagim);
  const kayit = () => liste('etkinlik-kayit', () => [...new Set([...(H().etkinliklerim?.ilgilendigim || []), ...(H().favoriler?.etkinlik || [])])]);
  const hatirlatma = () => GM.durum.oku('etkinlik-hatirlatma', {}) || {};
  const cevir = (anahtar, l, slug) => { const on = !l.includes(slug); GM.durum.yaz(anahtar, on ? [...l, slug] : l.filter(x => x !== slug)); return on; };

  // ---------- Kartlar ----------
  const meta = e => `${aralik(e)} · ${e.yer}`;
  const satirKart = e => GM.etkinlikKart({...e, il: e.il === e.yer ? null : e.il, tur: gecmis(e) ? `${e.tur} · Sona erdi` : e.tur}, {tur: 'satir'});
  const izgaraKart = e => GM.icerikKart({gorsel: e.gorsel, ikon: 'etkinlik', kategori: gecmis(e) ? 'Sona erdi' : e.tur, baslik: e.ad, meta: meta(e), metaIkon: 'takvim', git: `#/etkinlik/${e.slug}`});
  const satirlar = l => `<div class="gm-satirlar gm-ka-satirlar">${l.map(satirKart).join('')}</div>`;

  // ================= Liste (#/etkinlikler) =================
  const SAYFA = 12, ANAHTAR = 'etkinlik-liste';
  const GRUPLAR = ['tarih', 'konum', 'tur', 'profil', 'ucret', 'diger'];
  const TARIH = [['bugun', 'Bugün'], ['bu-hafta', 'Bu hafta'], ['bu-hafta-sonu', 'Bu hafta sonu'], ['gelecek-hafta', 'Gelecek hafta'], ['bu-ay', 'Bu ay'], ['gecmis', 'Geçmiş etkinlikler']];
  const DIGER = [['kontenjan', 'Kontenjanı bulunan', 'users'], ['acik-hava', 'Açık hava', 'tree'], ['vegan', 'Vegan seçenekli', 'vegan'], ['cocuk-dostu', 'Çocuk dostu', 'cocuk'], ['dada-onerdigi', 'Dada’nın önerdiği', 'yildiz']];
  const PROFIL_IKON = {'Herkese Açık': 'door-open', 'Çocuk': 'child', 'Aile': 'people-roof', 'Çiftler': 'heart', 'Arkadaş Grupları': 'user-group', 'Kurumsal / Ekip': 'briefcase', 'Gastronomi Profesyonelleri': 'user-tie'};
  const SIRALAR = [['onerilen', 'Önerilen', 'wand-magic-sparkles'], ['en_yeni', 'En yeni', 'clock'], ['fiyat_artan', 'Fiyat: düşükten yükseğe', 'arrow-up-wide-short'], ['simdi_acik', 'Şimdi açık', 'door-open'], ['rezervasyon_uygun', 'Rezervasyon uygunluğu', 'rezervasyon']];
  const BASLIK = {tarih: 'Tarih', konum: 'Konum', tur: 'Etkinlik türü', profil: 'Katılımcı profili', ucret: 'Ücret', diger: 'Diğer filtreler'};
  const IKON = {tarih: 'takvim', konum: 'pin', tur: 'festival', profil: 'kisi', ucret: 'fiyat', diger: 'filtre'};
  const GORUNUM = [{ad: 'Liste', deger: 'liste', ikon: 'list'}, {ad: 'Takvim', deger: 'takvim', ikon: 'takvim'}, {ad: 'Harita', deger: 'harita', ikon: 'harita'}];
  const bosF = () => Object.fromEntries(GRUPLAR.map(g => [g, []]));

  // Tarih süzgeci (web tarihUy): geçmiş dışındakiler bitmemiş etkinliklerden; hafta Pazartesi başlar.
  const tarihUyar = (e, d) => {
    if (d === 'gecmis') return gecmis(e);
    if (gecmis(e)) return false;
    const b = bugun(), hg = (isoTarih(b).getDay() + 6) % 7, kes = (a, z) => e.tarih <= z && e.bit >= a;
    if (d === 'bugun') return kes(b, b);
    if (d === 'bu-hafta') return kes(b, gunEkle(b, 6 - hg));
    if (d === 'bu-hafta-sonu') return kes(gunEkle(b, 5 - hg), gunEkle(b, 6 - hg));
    if (d === 'gelecek-hafta') return kes(gunEkle(b, 7 - hg), gunEkle(b, 13 - hg));
    if (d === 'bu-ay') { const [y, a] = par(b); return kes(b, iso(new Date(y, a, 0, 12))); }
    return true;
  };
  const konumAd = e => (e.yerel ? e.yer : e.ulke);   // Türkiye'de şehir, Uluslararası'nda ülke (web Konum: ülke → şehir)
  const eslesir = (e, g, v) => {
    const x = ek(e);
    if (g === 'tarih') return tarihUyar(e, v);
    if (g === 'konum') return konumAd(e) === v;
    if (g === 'tur') return (x.t || [e.tur]).includes(v);
    if (g === 'profil') return (x.p || []).includes(v);
    if (g === 'ucret') return v === 'ucretsiz' && !!x.u;
    if (g === 'diger') return (x.d || []).includes(v);
    return true;
  };
  const katlanmis = new Map();
  const aranan = e => { if (!katlanmis.has(e.slug)) katlanmis.set(e.slug, GM.katla(`${e.ad} ${e.yer} ${e.il} ${ek(e).y || ''} ${e.tur}`)); return katlanmis.get(e.slug); };
  const bolgede = (s, e) => !!e.yerel === (s.bolge === 'yerel');
  const suz = (s, f = s.f, haric, o = {}) => {
    const q = GM.katla(s.q || '').split(/\s+/).filter(Boolean);
    return tum().filter(e => bolgede(s, e) && (o.kat === false || !s.kat || (ek(e).k || []).includes(s.kat)) && GRUPLAR.every(g => g === haric || !f[g].length || f[g].some(v => eslesir(e, g, v))) && q.every(p => aranan(e).includes(p)));
  };
  const say = (s, f, g, v) => suz(s, f, g).filter(e => eslesir(e, g, v)).length;
  // Önerilen (web dizi): yaklaşanlar önde tarih sırasıyla, festival ve hasat deneyimi öne; sona erenler sonda yeniden eskiye.
  // En yeni ve fiyat canlı sıralama listesinin çekim kopyası; Şimdi açık süren etkinlikler, Rezervasyon uygunluğu canlı listesindeki yaklaşanlar (ikisi de süzgeç).
  const harman = e => (ek(e).k || []).some(k => k === 'gastronomi-festivalleri' || k === 'uretim-hasat-bag-deneyimleri');
  const sirala = (l, sira) => {
    const canli = X().etkinlikSira?.[sira];
    if (sira === 'simdi_acik') return l.filter(suruyor).sort((a, b) => a.bit.localeCompare(b.bit));
    if (canli) { const yer = new Map(canli.map((s, i) => [s, i])); return l.filter(e => yer.has(e.slug) && (sira !== 'rezervasyon_uygun' || !gecmis(e))).sort((a, b) => yer.get(a.slug) - yer.get(b.slug)); }
    return [...l].sort((a, b) => {
      if (gecmis(a) !== gecmis(b)) return gecmis(a) ? 1 : -1;
      if (gecmis(a)) return b.bit.localeCompare(a.bit);
      if (harman(a) !== harman(b)) return harman(a) ? -1 : 1;
      return a.tarih.localeCompare(b.tarih) || a.ad.localeCompare(b.ad, 'tr');
    });
  };
  const secenek = (s, g) => {
    if (g === 'tarih') return TARIH.map(([deger, ad]) => ({deger, ad}));
    if (g === 'konum') { const m = new Map(); tum().filter(e => bolgede(s, e)).forEach(e => m.set(konumAd(e), (m.get(konumAd(e)) || 0) + 1)); return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr')).map(([ad]) => ({deger: ad, ad})); }
    if (g === 'tur') return [...new Set(tum().flatMap(e => ek(e).t || [e.tur]))].map(ad => ({deger: ad, ad}));
    if (g === 'profil') return Object.keys(PROFIL_IKON).map(ad => ({deger: ad, ad, ikon: PROFIL_IKON[ad]}));
    if (g === 'ucret') return [{deger: 'ucretsiz', ad: 'Ücretsiz'}];
    return DIGER.map(([deger, ad, ikon]) => ({deger, ad, ikon}));
  };
  const secimSayi = s => GRUPLAR.reduce((n, g) => n + s.f[g].length, 0) + (s.kat ? 1 : 0);
  const oku = sorgu => {
    const d = GM.durum.oku(ANAHTAR, {}) || {};
    const s = {bolge: d.bolge === 'dunya' ? 'dunya' : 'yerel', kat: '', q: '', f: bosF(), sira: SIRALAR.some(x => x[0] === d.sira) ? d.sira : 'onerilen', gorunum: GORUNUM.some(x => x.deger === d.gorunum) ? d.gorunum : 'liste', duzen: d.duzen === 'izgara' ? 'izgara' : 'liste', gun: bugun(), gosterilen: SAYFA, secim: null};
    if (sorgu.bolge) s.bolge = sorgu.bolge === 'dunya' ? 'dunya' : 'yerel';
    if (sorgu.kategori && KATEGORI().some(k => k.deger === sorgu.kategori)) s.kat = sorgu.kategori;
    if (sorgu.q) s.q = sorgu.q;
    if (sorgu.gorunum && GORUNUM.some(x => x.deger === sorgu.gorunum)) s.gorunum = sorgu.gorunum;
    if (sorgu.tarih && TARIH.some(([v]) => v === sorgu.tarih)) s.f.tarih = [sorgu.tarih];
    if (sorgu.hal === 'sonuc-yok') { s.bolge = 'yerel'; s.kat = 'cocuk-aile-etkinlikleri'; s.f.tarih = ['bu-hafta']; }
    return s;
  };
  const yaz = s => GM.durum.yaz(ANAHTAR, {bolge: s.bolge, sira: s.sira, gorunum: s.gorunum, duzen: s.duzen});

  // ---------- Parçalar ----------
  const bolgeSeg = s => GM.segment({ad: 'bolge', etiket: 'Etkinlik bölgesi', secili: s.bolge, ogeler: [{ad: 'Türkiye', deger: 'yerel', ikon: 'pin', sayi: tum().filter(e => e.yerel).length}, {ad: 'Uluslararası', deger: 'dunya', ikon: 'earth-europe', sayi: tum().filter(e => !e.yerel).length}]});
  // Kategori çipleri: bölgede kaydı olan kategoriler (web: başka bölgede olanlar gizlenir), sayı bölge + diğer süzgeçlerle.
  const katSerit = s => {
    const taban = suz(s, s.f, null, {kat: false});
    const l = KATEGORI().filter(k => tum().some(e => bolgede(s, e) && (ek(e).k || []).includes(k.deger)) || s.kat === k.deger);
    return GM.cipSerit({ad: 'kat', tur: 'tek', etiket: 'Etkinlik kategorisi', secili: s.kat, ogeler: [{metin: 'Tümü', deger: '', ikon: 'takvim', sayi: taban.length}, ...l.map(k => ({metin: k.ad, deger: k.deger, ikon: k.ikon, sayi: taban.filter(e => (ek(e).k || []).includes(k.deger)).length}))]});
  };
  const gorunumSeg = s => GM.segment({ad: 'gorunum-tur', etiket: 'Görünüm', secili: s.gorunum, ogeler: GORUNUM});
  const secimler = s => {
    const ad = (g, v) => secenek(s, g).find(x => x.deger === v)?.ad ?? v;
    const l = [...(s.kat ? [{metin: katAd(s.kat), kapat: true, etiket: `${katAd(s.kat)} seçimini kaldır`, veri: {eylem: 'kaldir', id: 'kat|'}}] : []), ...GRUPLAR.flatMap(g => s.f[g].map(v => ({metin: ad(g, v), kapat: true, etiket: `${ad(g, v)} seçimini kaldır`, veri: {eylem: 'kaldir', id: `${g}|${v}`}})))];
    return l.length ? GM.listeTema({ad: 'secimler', baslik: 'Seçimlerin', ogeler: l}) : '';
  };
  const bosSonuc = s => GM.listeBos({ikon: 'etkinlik', baslik: 'Bu seçimle etkinlik bulunamadı', metin: s.q ? `“**${s.q}**” için etkinlik yok. Filtre azaltmayı ya da **diğer sekmeye** bakmayı dene.` : 'Filtre azaltmayı dene ya da **diğer sekmeye** bak.', eylem: {metin: 'Filtreleri temizle', tur: 'secondary', ikon: 'yenile', veri: {eylem: 'temizle'}}});
  const sonNot = n => GM.veriYok(`Hepsi bu kadar: **${GM.sayi(n)} etkinliğin** tamamını gördün.`);
  const gecmisAyrac = () => '<p class="gm-t-label gm-ton-ikincil" data-gecmis-ayrac>Sona eren etkinlikler</p>';
  // Liste görünümü dilimi: satır düzeninde yaklaşan → sona eren geçişine ayraç satırı girer (ızgarada kart rozeti "Sona erdi").
  const dilim = (l, bas, son, s) => l.slice(bas, son).map((e, k) => { const i = bas + k; return s.duzen === 'izgara' ? izgaraKart(e) : `${i > 0 && gecmis(e) && !gecmis(l[i - 1]) ? gecmisAyrac() : ''}${satirKart(e)}`; }).join('');
  const listeGovde = (s, l) => {
    const durum = GM.listeDurum({sayi: l.length, birim: 'etkinlik', gorunum: s.duzen, siraliAktif: s.sira !== 'onerilen'});
    if (!l.length) return `${durum}${bosSonuc(s)}`;
    const ic = dilim(l, 0, s.gosterilen, s);
    return `${durum}${s.duzen === 'izgara' ? GM.listeSonuc([ic], {gorunum: 'izgara'}) : GM.listeSonucKap(`<div class="gm-liste-rows"><div class="gm-satirlar gm-ka-satirlar">${ic}</div></div>`)}${l.length <= s.gosterilen ? sonNot(l.length) : ''}`;
  };
  // Takvim: ayın etkinlik günleri noktalı (en çok 3), seçili günün etkinlikleri altta.
  const noktalar = l => { const n = {}; l.forEach(e => { for (let g = e.tarih, i = 0; g <= e.bit && i < 400; g = gunEkle(g, 1), i++) n[g] = (n[g] || 0) + 1; }); return Object.fromEntries(Object.entries(n).map(([g, k]) => [g, Array(Math.min(3, k)).fill('etkinlik')])); };
  const gunListe = (s, l) => {
    const o = l.filter(e => e.tarih <= s.gun && e.bit >= s.gun).sort((a, b) => a.tarih.localeCompare(b.tarih));
    const [y, a, g] = par(s.gun), bas = GM.bas(`${g} ${AY_UZUN[a - 1]} ${y}`, {html: `<span class="gm-t-meta gm-ton-ikincil">${o.length ? `${o.length} etkinlik` : 'Etkinlik yok'}</span>`});
    return `<section class="gm-yigin-8" data-gun-liste>${bas}${o.length ? satirlar(o) : GM.veriYok('Bu günde etkinlik yok. **Noktalı günlere** dokun ya da başka aya geç.')}</section>`;
  };
  const takvimGovde = (s, l) => {
    const yak = l.filter(e => !gecmis(e));
    return `<p class="gm-liste-sayi"><b>${GM.sayi(l.length)} etkinlik</b> takvimde · ${GM.sayi(yak.length)} yaklaşan</p>${GM.takvim({ad: 'etk-gun', secili: s.gun, odak: s.gun, noktalar: noktalar(l)})}${gunListe(s, l)}`;
  };
  // Harita: yuvarlak pin + küme; seçili pinin kartı haritanın altında; yaklaşık konum notu (web).
  const haritaPinler = l => l.filter(e => e.lng != null).map(e => ({id: e.slug, lng: e.lng, lat: e.lat, ad: e.ad, ikon: 'etkinlik', secili: false}));
  const secimKart = (s, l) => { const e = l.find(x => x.slug === s.secim); return e ? GM.kart({html: satirlar([e])}) : GM.veriYok('Bir **işarete** dokun; etkinliğin kartı burada açılır.'); };
  const haritaGovde = (s, l) => {
    const p = haritaPinler(l);
    if (!p.length) return GM.listeBos({ikon: 'harita', baslik: 'Haritada gösterilecek etkinlik yok', metin: 'Bu filtrelerde **konumu olan** etkinlik yok. Filtre azaltmayı dene.', eylem: {metin: 'Filtreleri temizle', tur: 'secondary', veri: {eylem: 'temizle'}}});
    return `<p class="gm-liste-sayi"><b>${GM.sayi(p.length)} etkinlik</b> haritada</p>${GM.harita({ad: 'etk-harita', yukseklik: 'var(--gm-size-map-hlg)', kume: true, etiket: 'Etkinlik haritası', pinler: p})}<div data-harita-secim>${secimKart(s, l)}</div>${GM.p('Haritadaki işaretlerin bir kısmı **şehir merkezine** yerleştirilmiş yaklaşık konumlardır, etkinliğin tam adresi değildir.', {meta: true, ton: 'ikincil'})}`;
  };
  const icerik = s => {
    const l = sirala(suz(s), s.sira);
    const govde = s.gorunum === 'takvim' ? takvimGovde(s, l) : s.gorunum === 'harita' ? haritaGovde(s, l) : listeGovde(s, l);
    return `${secimler(s)}${gorunumSeg(s)}<div class="gm-yigin" data-etk-govde>${govde}</div>`;
  };
  const heroStat = () => { const y = tum().filter(e => !gecmis(e)); return [{deger: GM.sayi(y.length), etiket: 'yaklaşan'}, {deger: GM.sayi(new Set(y.map(e => e.yer)).size), etiket: 'şehir'}, {deger: GM.sayi(y.filter(e => ek(e).u).length), etiket: 'ücretsiz'}]; };

  let L = null;
  GM.ekran('etkinlikler', {
    tur: 'sekme', nav: 'etkinlik', baslik: 'Etkinlikler', iskelet: 'satir',
    ustBar: () => ({saydam: true}),
    // Sekme DOM'da kalır: başka adresten (?bolge=, ?kategori=) gelince yeniden çizilir.
    donus: (kok, ctx) => { if (L && L.hash !== ctx.hash) GM.tazele(); },
    bos: {ikon: 'etkinlik', baslik: 'Şu anda yaklaşan etkinlik yok', metin: 'Yeni festival ve tadımlar **eklendikçe** Lezzet Takvimi’nde görünür. Bildiğin bir etkinliği önerebilirsin.', eylem: {metin: 'Etkinlik öner', ikon: 'ekle', git: '#/etkinlik-oner'}},
    yukle: () => new Promise(r => setTimeout(r, GM.azHareket() ? 0 : GM.TK.motion.oneri.skeletonDelay)),
    cekYenile: () => new Promise(r => setTimeout(r, GM.TK.motion.reveal)),
    ciz: ctx => {
      if (!L || L.hash !== ctx.hash) L = {...oku(ctx.sorgu), hash: ctx.hash};
      const s = L;
      return GM.kubbe({
        gorsel: 'assets/gorsel/etkinlik/alba-beyaz-truf-fuari-2026.webp', etiket: 'Lezzet Takvimi', baslik: 'Etkinlikler',
        stat: heroStat(),
        arac: GM.listeArac({yer: 'Etkinlik, şehir veya mekân ara', ad: 'q', deger: s.q, filtreSayi: secimSayi(s) - (s.kat ? 1 : 0), segment: bolgeSeg(s), serit: katSerit(s)}),
        html: `<div class="gm-yigin">${GM.eylemKart({ikon: 'calendar-plus', baslik: 'Etkinlik öner', alt: 'Editör onayıyla takvime eklenir', git: '#/etkinlik-oner'})}<div class="gm-yigin" data-etk-icerik>${icerik(s)}</div></div>`
      });
    },
    sonra: kok => {
      const s = L; if (!s) return null;
      const yer = kok.querySelector('[data-etk-icerik]'), arac = kok.querySelector('.gm-liste-arac'), rail = kok.querySelector('.gm-liste-rail'), kaydir = kok.querySelector('.gm-kaydir'), c = [];
      let io = null, bekle = 0;
      const sonsuzKur = () => {
        io?.disconnect(); io = null;
        if (s.gorunum !== 'liste') return;
        const l = sirala(suz(s), s.sira);
        if (l.length <= s.gosterilen) return;
        const kap = yer.querySelector('.gm-liste-grid, .gm-liste-rows > .gm-satirlar'); if (!kap) return;
        io = GM.sonsuz(kap, () => {
          const bas = s.gosterilen, son = Math.min(l.length, bas + SAYFA); if (bas >= son) return '';
          s.gosterilen = son;
          if (son >= l.length) setTimeout(() => { const g = yer.querySelector('[data-etk-govde]'); if (g && !g.querySelector(':scope > .gm-veri-yok')) g.insertAdjacentHTML('beforeend', sonNot(l.length)); });
          return dilim(l, bas, son, s);
        });
      };
      const seritCiz = () => { const x = rail.firstElementChild?.scrollLeft || 0; rail.innerHTML = katSerit(s); if (rail.firstElementChild) rail.firstElementChild.scrollLeft = x; };
      const hizala = () => { if (!arac.classList.contains('is-stuck')) return; const fark = yer.getBoundingClientRect().top - arac.getBoundingClientRect().bottom; if (fark < 0) kaydir.scrollTop += fark; };
      const icCiz = (iskelet = true) => {
        io?.disconnect();
        s.gosterilen = SAYFA;
        if (iskelet && s.gorunum === 'liste') {
          yer.innerHTML = `${secimler(s)}${gorunumSeg(s)}<div class="gm-yigin" data-etk-govde>${GM.iskelet(s.duzen === 'izgara' ? 4 : 3, s.duzen === 'izgara' ? 'kart' : 'satir')}</div>`;
          clearTimeout(icCiz.z); icCiz.z = setTimeout(() => { if (!yer.isConnected) return; yer.innerHTML = icerik(s); sonsuzKur(); }, GM.azHareket() ? 0 : GM.TK.motion.oneri.skeletonDelay);
        } else { yer.innerHTML = icerik(s); sonsuzKur(); }
      };
      const guncelle = () => { icCiz(); seritCiz(); GM.filtreSayiYaz(kok, secimSayi(s) - (s.kat ? 1 : 0)); yaz(s); hizala(); };
      sonsuzKur();
      { const r = rail.firstElementChild, c2 = r?.querySelector('[aria-pressed=true]'); if (c2) r.scrollLeft += c2.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - c2.offsetWidth) / 2; }

      const girdi = arac.querySelector('input');
      const ara = () => { clearTimeout(bekle); bekle = setTimeout(() => { s.q = girdi.value.trim(); guncelle(); }, GM.TK.motion.oneri.inputDebounce); };
      const enter = ev => { if (ev.key === 'Enter') girdi.blur(); };
      girdi.addEventListener('input', ara); girdi.addEventListener('keydown', enter);
      const canli = d => {
        const b = document.querySelector('[data-filtre-uygula]'); if (!b) return;
        const n = suz(s, d).length;
        b.querySelector('span').textContent = n ? `${GM.sayi(n)} sonucu gör` : 'Sonuç yok'; b.disabled = !n;
        const sh = b.closest('.gm-sheet');
        GRUPLAR.forEach(g => secenek(s, g).forEach(x => { const cnt = sh?.querySelector(`input[name="${g}"][value="${CSS.escape(x.deger)}"]`)?.closest('.gm-option')?.querySelector('.gm-option__count'); if (cnt) cnt.textContent = say(s, d, g, x.deger); }));
      };
      c.push(
        GM.on(kok, 'bolge', v => { s.bolge = v; s.f.konum = []; if (s.kat && !tum().some(e => bolgede(s, e) && (ek(e).k || []).includes(s.kat))) s.kat = ''; guncelle(); }),
        GM.on(kok, 'kat', v => { s.kat = s.kat === v ? '' : v; guncelle(); }),
        GM.on(kok, 'gorunum-tur', v => { s.gorunum = v; s.secim = null; icCiz(false); yaz(s); }),
        GM.on(kok, 'gorunum', v => { s.duzen = v; icCiz(false); yaz(s); }),
        GM.on(kok, 'etk-gun', v => { s.gun = v; const k = yer.querySelector('[data-gun-liste]'); if (k) k.outerHTML = gunListe(s, sirala(suz(s), s.sira)); }),
        GM.on(kok, 'etk-harita', v => { s.secim = v; const k = yer.querySelector('[data-harita-secim]'); if (k) k.innerHTML = secimKart(s, sirala(suz(s), s.sira)); }),
        GM.eylem(kok, 'filtre', () => GM.filtreSheet({
          baslik: 'Etkinlikleri filtrele',
          gruplar: GRUPLAR.map(g => ({baslik: BASLIK[g], ad: g, ikon: IKON[g], tur: g === 'tarih' ? 'tek' : 'coklu', ogeler: secenek(s, g).map(x => ({metin: x.ad, deger: x.deger, ikon: x.ikon, sayi: say(s, s.f, g, x.deger)})).filter(x => x.sayi > 0 || s.f[g].includes(x.deger))})),
          secili: s.f, eylem: `${GM.sayi(suz(s).length)} sonucu gör`, degisti: canli,
          uygula: d => { s.f = {...bosF(), ...Object.fromEntries(GRUPLAR.map(g => [g, (d[g] || []).map(String)]))}; guncelle(); }
        })),
        GM.eylem(kok, 'sirala', () => GM.siralaSheet({baslik: 'Sırala', secenekler: SIRALAR, secili: s.sira, sec: v => { s.sira = v; guncelle(); kok.querySelector('.gm-liste-sort-button')?.classList.toggle('is-active', v !== 'onerilen'); }})),
        GM.eylem(kok, 'kaldir', el => { const [g, v] = el.dataset.id.split('|'); if (g === 'kat') s.kat = ''; else s.f[g] = s.f[g].filter(x => x !== v); guncelle(); }),
        GM.eylem(kok, 'temizle', () => { s.f = bosF(); s.kat = ''; s.q = ''; girdi.value = ''; girdi.closest('.gm-girdi')?.classList.remove('has-text'); guncelle(); })
      );
      return () => { clearTimeout(bekle); clearTimeout(icCiz.z); io?.disconnect(); girdi.removeEventListener('input', ara); girdi.removeEventListener('keydown', enter); c.forEach(f => f()); };
    }
  });

  // ================= Detay (#/etkinlik/:slug) =================
  const KUNYE_IKON = {Ad: 'tag', 'Kimler katılabilir': 'kisi', 'Tür': 'festival', Tarih: 'takvim', Yer: 'pin', 'Ücret': 'fiyat', 'Yaş Sınırı': 'user-check', Kontenjan: 'users', 'Organizatör': 'building'};
  const ilkCumle = s => { if (s.includes('**')) return s; const i = s.search(/[;:]|[,.](?=\s|$)/), bas = i > 0 ? s.slice(0, i) : s; return bas.split(' ').length > 9 ? s : `**${bas}**${s.slice(bas.length)}`; };
  const hakkinda = (e, d) => { const l = d?.h?.length ? d.h : [e.ozet]; return GM.makale(l.map(p => GM.p(ilkCumle(p))).join('')); };
  // Bölüm başlığı altı tek satır açıklama (REVIZE-14: gm-t-meta).
  const altMetin = m => `<p class="gm-t-meta gm-ton-ikincil gm-kirp-1">${GM.esc(m)}</p>`;
  const program = (e, d) => {
    if (d?.pr?.s?.length) return `<div class="gm-yigin-12">${d.pr.n ? '' : altMetin('Organizatörün duyurduğu akış')}${GM.satirlar(d.pr.s.map(([saat, m]) => { const [, gun, ad] = m.match(/^(\d{1,2} \S+) – (.+)$/) || [, null, m]; return {ikon: 'saat', baslik: ad, alt: gun, deger: saat}; }))}${d.pr.n ? GM.p(ilkCumle(d.pr.n), {meta: true, ton: 'ikincil'}) : ''}</div>`;
    const dogru = (d?.pd || '').split(' · ')[0] || `${e.tarih.slice(0, 4)} takvim bilgisi doğrulandı`;
    return `<div class="gm-yigin-12">${GM.p('Detaylı program, saat ve katılım koşulları organizatör tarafından duyurulduğunda **burada yer alacak**. Güncel bilgi için organizatörün resmî duyurularını takip edebilirsin.')}<div class="gm-sira gm-tek-satir">${GM.durumRozet({metin: dogru, ton: 'basari', ikon: 'basari'})}${GM.durumRozet({metin: 'Detaylı program henüz açıklanmadı', ton: 'notr', ikon: 'saat'})}</div></div>`;
  };
    const bakista = (e, d) => {
    const ya = d?.ya || {}, kim = (ek(e).kim || []).map(([, a]) => a).join(', '), l = [['Ad', kisaAd(e) !== e.ad ? e.ad : null], ['Tür', ya['Tür'] || e.tur], ['Kimler katılabilir', kim], ['Tarih', aralik(e, {uzun: true, yil: true})], ['Yer', ya.Yer || ek(e).y || yerMetin(e)], ['Ücret', ya['Ücret'] || ek(e).c], ['Yaş Sınırı', ya['Yaş Sınırı']], ['Kontenjan', ya.Kontenjan], ['Organizatör', ya['Organizatör']]].filter(([, v]) => v);
    return `<div class="gm-yigin-12">${GM.kunye(l.map(([etiket, deger]) => ({ikon: KUNYE_IKON[etiket] || 'bilgi', etiket, deger})))}${d?.kd ? GM.satirlar([{ikon: 'dogrulandi', baslik: 'Resmî kaynak', alt: `Son doğrulama ${GM.tarihKisa(d.kd.t)} ${d.kd.t.slice(0, 4)}`, veri: {eylem: 'etk-kaynak'}}]) : ''}${kunyeSatir(d)}</div>`;
  };
  const konum = e => (e.lng == null ? '' : `<div class="gm-yigin-12">${altMetin(ek(e).y || yerMetin(e))}${GM.harita({ad: 'etk-konum', zoom: 11, merkez: [e.lng, e.lat], pinler: [{id: e.slug, lng: e.lng, lat: e.lat, ad: e.yer, ikon: 'etkinlik', secili: true}], etiket: `${e.ad} konumu`})}${ek(e).a ? GM.p('İşaret **şehir merkezine** yerleştirilmiş yaklaşık konumdur, etkinliğin tam adresi değildir.', {meta: true, ton: 'ikincil'}) : ''}</div>`);
  const kopru = e => GM.teaser({ikon: 'rota', baslik: 'Etkinlik yolculuğunu lezzet rotasına çevir', metin: 'Gittiğin şehirde Dada Gourmet rehberindeki **mekânları keşfet**; istersen Gurme Lezzetler’de bölgenin öne çıkanlarına göz at.', cipler: [{metin: 'Mekânları keşfet', ikon: 'mekan', git: e.yerel ? `#/mekanlar?il=${GM.katla(e.yer).replace(/\s+/g, '-')}` : '#/mekanlar'}, {metin: 'Gurme Lezzetler', ikon: 'lezzet', git: '#/lezzetler'}], btn: {metin: 'Rotanı planla', ikon: 'rota', tur: 'secondary', git: '#/rota/planla'}});
  // Takvimdeki diğer etkinlikler: aynı bölgede bu etkinlikten sonra başlayan ilk üç yaklaşan (yoksa en yakın yaklaşanlar).
  const digerleri = e => { const y = tum().filter(x => x.slug !== e.slug && !gecmis(x) && !!x.yerel === !!e.yerel).sort((a, b) => a.tarih.localeCompare(b.tarih)); const sonra = y.filter(x => x.tarih >= e.tarih); return (sonra.length >= 3 ? sonra : y).slice(0, 3); };
  const digerBolum = e => { const l = digerleri(e); return l.length ? {baslik: 'Takvimdeki diğer etkinlikler', eylem: {metin: 'Tüm takvim', git: `#/etkinlikler?bolge=${e.yerel ? 'yerel' : 'dunya'}`}, html: satirlar(l)} : null; };
  const kunyeSatir = d => (d?.ks?.y ? GM.satirlar([{ikon: 'image', baslik: `Kapak görseli: ${d.ks.y}`, alt: [d.ks.l, 'Wikimedia Commons'].filter(Boolean).join(' · '), veri: {eylem: 'etk-kunye'}}]) : '');
  const bulunamadi = () => GM.hataEkran({tur: 'bulunamadi', baslik: 'Etkinlik bulunamadı', metin: 'Bu etkinlik takvimden kalkmış ya da bağlantı eskimiş olabilir. **Lezzet Takvimi**’nden devam et.', eylem: {metin: 'Etkinliklere dön', ikon: 'etkinlik', yerine: '#/etkinlikler'}});
  const dVeri = ctx => (ctx.sorgu.hal === 'bulunamadi' ? null : bul(ctx.param.slug));
  const kalanMetin = e => { if (gecmis(e)) return 'Sona erdi'; if (suruyor(e)) return 'Sürüyor'; const n = gunFark(bugun(), e.tarih); return n === 1 ? 'Yarın' : `${n} gün`; };
  const sure = e => gunFark(e.tarih, e.bit) + 1;
  const ucretKisa = e => (ek(e).u ? 'Ücretsiz' : ek(e).c ? 'Ücretli' : '–');

  // ---------- Detay eylemleri ----------
  const icsIndir = e => {
    const tarih = s => s.replace(/-/g, ''), son = gunEkle(e.bit, 1);
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dada Gourmet//Lezzet Takvimi//TR', 'BEGIN:VEVENT', `UID:${e.slug}@dadagourmet.com`, `DTSTART;VALUE=DATE:${tarih(e.tarih)}`, `DTEND;VALUE=DATE:${tarih(son)}`, `SUMMARY:${e.ad}`, `LOCATION:${ek(e).y || yerMetin(e)}`, `URL:https://dadagourmet.com/etkinlikler/${e.slug}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], {type: 'text/calendar'})); a.download = `${e.slug}.ics`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); } catch { /* indirme yok */ }
    GM.toast('**Takvim dosyası** indirildi; açınca takvimine eklenir', {ikon: 'calendar-plus'});
  };
  const ONCE = [['7g', '1 hafta önce', 7], ['3g', '3 gün önce', 3], ['1g', '1 gün önce', 1], ['3s', '3 saat önce', 0]];
  const hatirlatmaSheet = (e, kok) => {
    const h = hatirlatma(), sec = h[e.slug] || '', kalan = gunFark(bugun(), e.tarih);
    if (kalan <= 0) { GM.toast('Etkinlik **başladı**; hatırlatma kurulamaz', {ikon: 'bildirim'}); return; }
    const satir = ([d, ad, gun]) => GM.radio({ad: 'once', deger: d, etiket: ad, alt: kalan > gun || gun === 0 ? GM.tarihUzun(gunEkle(e.tarih, -gun)) : 'Bu tarih geçti', pasif: !(kalan > gun || gun === 0), secili: sec === d});
    GM.sheet({
      baslik: 'Hatırlatma kur',
      html: `<div class="gm-yigin">${GM.p(`**${e.ad}** başlamadan önce bildirim gönderelim.`)}<div class="gm-yigin-8" role="radiogroup" aria-label="Hatırlatma zamanı">${ONCE.map(satir).join('')}</div>${GM.takvimAlan({ad: 'ozel', etiket: 'Özel zaman', yer: 'Tarih seç', max: e.tarih, min: bugun(), deger: /^\d{4}-/.test(sec) ? sec : ''})}</div>`,
      altBar: `<div class="gm-ikili">${GM.btn({metin: sec ? 'Kaldır' : 'Vazgeç', tur: sec ? 'yikici-ikincil' : 'secondary', veri: {eylem: 'hat-kaldir'}})}${GM.btn({metin: 'Kaydet', veri: {eylem: 'hat-kaydet'}})}</div>`,
      sonra: d => {
        const k = GM.eylem(d, 'hat-kaydet', () => {
          const v = d.querySelector('input[name="once"]:checked')?.value || d.querySelector('input[name="ozel"]')?.value || '';
          if (!v) { GM.toast('Bir **zaman** seç', {ikon: 'uyari'}); return; }
          GM.durum.yaz('etkinlik-hatirlatma', {...hatirlatma(), [e.slug]: v}); d.kapat(); boya(kok, e);
          GM.toast(`Hatırlatma kuruldu: **${ONCE.find(x => x[0] === v)?.[1] || GM.tarihUzun(v)}**`, {ikon: 'bildirim', tur: 'basari'});
        });
        const r = GM.eylem(d, 'hat-kaldir', () => { if (sec) { const y = {...hatirlatma()}; delete y[e.slug]; GM.durum.yaz('etkinlik-hatirlatma', y); boya(kok, e); GM.toast('Hatırlatma kaldırıldı', {ikon: 'bildirim'}); } d.kapat(); });
        return () => { k(); r(); };
      }
    });
  };
  const disAc = (url, metin) => GM.dialog({baslik: 'Dış bağlantı açılsın mı?', metin: `${metin} **${new URL(url).hostname}** adresinde açılır.`, eylem: 'Aç', iptal: 'Vazgeç'}).then(ok => { if (ok) window.open(url, '_blank', 'noopener'); });
  const kunyeSheet = (e, d) => GM.sheet({
    baslik: 'Kapak künyesi',
    html: `<div class="gm-yigin">${GM.p(`Kapak görseli: **${d.ks.y}** · ${d.ks.l}.${/BY-SA/i.test(d.ks.l) ? ' Bu kapak özgün eserin yeniden boyutlandırılmış türevidir ve **aynı lisansla** paylaşılır.' : ''}`)}${GM.satirlar([d.ks.lu ? {ikon: 'scale-balanced', baslik: 'Lisans metni', alt: d.ks.l, veri: {eylem: 'dis', id: d.ks.lu}} : null, d.ks.k ? {ikon: 'image', baslik: 'Kaynak', alt: 'Wikimedia Commons', veri: {eylem: 'dis', id: d.ks.k}} : null].filter(Boolean))}</div>`,
    sonra: h => GM.eylem(h, 'dis', el => disAc(el.dataset.id, 'Bağlantı'))
  });
  const boya = (kok, e) => {
    const kat = katilim().includes(e.slug), kay = kayit().includes(e.slug), hat = !!hatirlatma()[e.slug];
    kok.querySelectorAll('[data-eylem="etk-kaydet"]').forEach(b => { b.setAttribute('aria-pressed', kay); b.setAttribute('aria-label', kay ? 'Kaydedildi' : 'Kaydet'); });
    kok.querySelectorAll('[data-eylem="etk-hatirlat"]').forEach(b => { b.setAttribute('aria-pressed', hat); b.setAttribute('aria-label', hat ? 'Hatırlatma kurulu' : 'Hatırlatma kur'); });
    kok.querySelectorAll('[data-eylem="etk-katil"]').forEach(b => { b.classList.toggle('is-basili', kat); const s = b.querySelector('span'); if (s) s.textContent = kat ? 'Katılıyorsun' : 'Katılacağım'; const i = b.querySelector('.icon'); if (i) i.className = `icon fa-solid fa-${kat ? 'check' : 'calendar-check'}`; });
  };
  const kapi = (baslik, metin) => { if (GM.uye()) return false; GM.uyeDuvar({baslik, metin}); return true; };

  GM.ekran('etkinlik', {
    tur: 'banner', nav: 'etkinlik', ust: '#/etkinlikler', iskelet: 'detay',
    baslik: ctx => { const e = bul(ctx.param.slug); return e ? kisaAd(e) : 'Etkinlik'; },
    bos: {ikon: 'etkinlik', baslik: 'Etkinlik bulunamadı', metin: 'Bu etkinlik takvimden kalkmış olabilir. **Lezzet Takvimi**’nden devam et.', eylem: {metin: 'Etkinliklere dön', ikon: 'etkinlik', yerine: '#/etkinlikler'}},
    yukle: () => new Promise(r => setTimeout(r, GM.azHareket() ? 0 : GM.TK.motion.fast)),
    ustBar: ctx => (dVeri(ctx) ? {menu: false, sag: [{ikon: 'paylas', etiket: 'Paylaş', veri: {eylem: 'etk-paylas'}}, {ikon: 'kaydet', etiket: 'Kaydet', veri: {eylem: 'etk-kaydet'}, attrs: `aria-pressed="${kayit().includes(ctx.param.slug)}"`}]} : {saydam: false}),
    ciz: ctx => {
      const e = dVeri(ctx); if (!e) return bulunamadi();
      const d = dt(e), x = ek(e), bitti = gecmis(e);
      const kat = (x.k || []).map(katAd)[0];
      return GM.detay({
        // Başlık bloğu ≤3 satır: ad 1 satıra sığıyorsa üst yazı (tür · kategori) kalır; 2 satırsa tür meta satırına iner (tek satır: tür · tarih · şehir).
        gorsel: e.gorsel, baslik: kisaAd(e),
        ...(kisaAd(e).length <= 18 ? {etiket: [e.tur, kat !== e.tur ? kat : null].filter(Boolean).join(' · '), caps: [{ikon: 'takvim', metin: aralik(e)}, {ikon: 'pin', metin: yerMetin(e)}]} : {caps: [{ikon: 'festival', metin: e.tur}, {ikon: 'takvim', metin: aralik(e)}, {ikon: 'pin', metin: e.yer}]}),
        // Baş: özet şeridi + uyarı + editör satırı + bilet tek yığında (REVIZE-14/12: bilet üstteki öğeye yapışmaz).
        bas: `<div class="gm-yigin" data-etk-bas>${GM.ozetSerit([
          {ikon: 'saat', etiket: bitti ? 'Durum' : suruyor(e) ? 'Durum' : 'Kalan', deger: kalanMetin(e)},
          {ikon: 'takvim', etiket: 'Süre', deger: String(sure(e)), birim: 'gün'},
          {ikon: 'fiyat', etiket: 'Ücret', deger: ucretKisa(e)}
        ]) + (bitti ? GM.ipucu({ton: 'uyari', ikon: 'saat', baslik: 'Bu etkinlik sona erdi', metin: `${aralik(e, {uzun: true, yil: true})} tarihlerinde yapıldı. **Yaklaşan etkinliklere** göz atabilirsin.`, eylem: {metin: 'Takvim', ikon: 'etkinlik', git: `#/etkinlikler?bolge=${e.yerel ? 'yerel' : 'dunya'}`}}) : '')
          + (d?.g ? GM.kisiSatir({ad: 'Dada Gourmet', boyut: 40, baslik: 'Lezzet Takvimi', alt: d.kd ? `Takvim bilgisi doğrulandı · ${GM.tarihKisa(d.kd.t)} ${d.kd.t.slice(0, 4)}` : 'Dada Gourmet editörü', sag: GM.gozSayi(d.g)}) : '')
          + (x.b && !bitti ? GM.btn({metin: 'Bilet / Rezervasyon', ikon: 'ticket', tur: 'secondary', tam: true, veri: {eylem: 'etk-bilet'}}) : '')}<span aria-hidden="true"></span></div>`,
        // REVIZE-14 madde 3: detay bölümleri zebra (Diet .dd-icerikler). Panelin içine, iç boşluksuz yuvaya (sekmeler yuvası) girer; tam genişlik.
        sekmeler: GM.bolumler([
        {baslik: 'Etkinlik hakkında', html: hakkinda(e, d)},
        {baslik: 'Program & Katılım', html: program(e, d)},
        {baslik: 'Bir bakışta', html: bakista(e, d)},
        e.lng == null ? null : {baslik: 'Konum', html: konum(e)},
        bitti ? null : kopru(e),
        digerBolum(e)
      ])
      });
    },
    altBar: ctx => {
      const e = dVeri(ctx); if (!e) return '';
      if (gecmis(e)) return GM.altEylem({dugmeler: [{metin: 'Yaklaşan etkinlikler', ikon: 'etkinlik', tam: true, git: `#/etkinlikler?bolge=${e.yerel ? 'yerel' : 'dunya'}`}]});
      const kat = katilim().includes(e.slug);
      return GM.altEylem({ikonlar: [
        {ikon: 'calendar-plus', ad: 'Takvime ekle', veri: {eylem: 'etk-ics'}},
        {ikon: 'bildirim', ad: 'Hatırlatma kur', basili: !!hatirlatma()[e.slug], veri: {eylem: 'etk-hatirlat'}}
      ], dugmeler: [{metin: kat ? 'Katılıyorsun' : 'Katılacağım', ikon: kat ? 'onay' : 'rezervasyon', basili: kat, veri: {eylem: 'etk-katil'}}]});
    },
    donus: (kok, ctx) => { const e = dVeri(ctx); if (e) boya(kok, e); },
    sonra: (kok, ctx) => {
      const e = dVeri(ctx); if (!e) return null;
      const d = dt(e), x = ek(e);
      boya(kok, e);
      const c = [
        GM.eylem(kok, 'etk-katil', () => {
          if (kapi('Katılımını kaydet', 'Katılacağın etkinlikleri **Etkinliklerim**’de toplamak ve hatırlatma almak için üye ol.')) return;
          const on = cevir('etkinlik-katilim', katilim(), e.slug); boya(kok, e); GM.titres(10);
          GM.toast(on ? '**Katılacağım** listene eklendi' : 'Katılım kaldırıldı', {ikon: 'rezervasyon', tur: on ? 'basari' : undefined, eylem: on ? 'Etkinliklerim' : undefined, onEylem: () => GM.git('#/profil/etkinlikler')});
        }),
        GM.eylem(kok, 'etk-kaydet', () => {
          if (kapi('Kaydetmek için giriş yap', 'Etkinlikleri **kaydetmek** ve sonra dönmek için üye ol.')) return;
          const on = cevir('etkinlik-kayit', kayit(), e.slug); boya(kok, e); GM.titres(10);
          GM.toast(on ? '**İlgilendiğim** etkinliklere eklendi' : 'Kayıt kaldırıldı', {ikon: 'kaydet'});
        }),
        GM.eylem(kok, 'etk-hatirlat', () => { if (kapi('Hatırlatma için üye ol', 'Etkinlik başlamadan önce **bildirim** almak için üye ol.')) return; hatirlatmaSheet(e, kok); }),
        GM.eylem(kok, 'etk-ics', () => icsIndir(e)),
        GM.eylem(kok, 'etk-bilet', () => x.b && disAc(x.b, 'Bilet ve rezervasyon organizatörün sitesinde,')),
        GM.eylem(kok, 'etk-kaynak', () => d?.kd?.u && disAc(d.kd.u, 'Organizatörün resmî duyurusu')),
        GM.eylem(kok, 'etk-kunye', () => d?.ks && kunyeSheet(e, d)),
        GM.eylem(kok, 'etk-paylas', () => GM.paylas({baslik: e.ad, alt: `${aralik(e, {uzun: true, yil: true})} · ${yerMetin(e)}`, url: `https://dadagourmet.com/etkinlikler/${e.slug}`}))
      ];
      return () => c.forEach(f => f());
    }
  });

  // ================= Etkinlik öner (#/etkinlik-oner) =================
  // Panel EtkinlikOnerisiGonderIstegi: Etkinlik adı* · Etkinlik türü* · Şehir / yer* · Başlangıç tarihi (opsiyonel) · Neden öneriyorsun?* (en az 10 karakter).
  // Yalnız üye gönderir (authorize: Hesap); misafire giriş kapısı. Gönderilen öneri 'katki-etkinlik'e (İnceleniyor) yazılır; Dada Puan verilmez (panel).
  const F = {ad: '', tur: '', yer: '', tarih: '', neden: ''};
  const formHata = f => ({ad: f.ad.trim().length < 2 ? 'Etkinliğin adını yaz.' : '', tur: f.tur ? '' : 'Etkinlik türünü seç.', yer: f.yer.trim().length < 2 ? 'Şehir ya da yer yaz.' : '', neden: f.neden.trim().length < 10 ? 'Neden önerdiğini en az 10 karakterle anlat.' : ''});
  let form = {...F}, hatalar = null, gonderildi = null;
  const onerForm = () => {
    const h = hatalar || {};
    return `<div class="gm-ic gm-yigin-24">${GM.metinBlok({etiket: 'Topluluk katkısı', baslik: 'Etkinlik öner', metin: '**Editör onayıyla** takvime eklenir.', rol: 'page', h: 1})}
      ${hatalar && Object.values(h).some(Boolean) ? GM.bant({ton: 'hata', baslik: 'Birkaç alan eksik', metin: 'İşaretli alanları **doldurup** yeniden gönder.'}) : ''}
      <form class="gm-yigin" data-oner-form novalidate>
        ${GM.input({ad: 'ad', etiket: 'Etkinlik adı', yer: 'Ör. Urla Bağ Bozumu Şenliği', deger: form.ad, zorunlu: true, hata: h.ad})}
        ${GM.secAlan({ad: 'tur', etiket: 'Etkinlik türü', yer: 'Kategori seç', secenekler: KATEGORI().map(k => [k.deger, k.ad]), deger: form.tur, zorunlu: true, hata: h.tur})}
        ${GM.input({ad: 'yer', etiket: 'Şehir / yer', ikon: 'pin', yer: 'Ör. İzmir, Urla', deger: form.yer, zorunlu: true, hata: h.yer})}
        ${GM.takvimAlan({ad: 'tarih', etiket: 'Başlangıç tarihi', yer: 'Biliyorsan seç', deger: form.tarih, min: bugun(), yardim: 'İsteğe bağlı'})}
        ${GM.input({ad: 'neden', etiket: 'Neden öneriyorsun?', yer: 'Etkinliği öne çıkaran ne? Resmî duyuru varsa nereden gördün?', deger: form.neden, cokSatir: true, zorunlu: true, hata: h.neden, yardim: 'En az 10 karakter'})}
      </form>
      ${GM.bilgi({etiket: 'Sonra ne olur?', ikon: 'bilgi', metin: 'Önerin **İnceleniyor** olarak Topluluk Katkılarım’a düşer. Editör tarih ve kaynağı doğruladığında takvimde yayınlanır.'})}</div>`;
  };
  GM.ekran('etkinlik-oner', {
    tur: 'alt', baslik: 'Etkinlik öner', ust: '#/etkinlikler',
    ciz: ctx => {
      if (!GM.uye()) return GM.girisDuvari({tam: true, ikon: 'calendar-plus', baslik: 'Etkinlik önermek için giriş yap', metin: 'Önerilerin **hesabına bağlı** olarak incelenir; durumunu Topluluk Katkılarım’dan izlersin.', uyeOl: 'Etkinlik önermek için üye ol', sunar: ['Bildiğin festival ve tadımları takvime öner', 'Önerinin durumunu Topluluk Katkılarım’da izle', 'Yayına giren önerilerle Hasat Habercisi rozetini kazan']});
      if (ctx.sorgu.hal === 'gonderildi' || gonderildi) {
        const ad = gonderildi?.ad || 'Urla Bağ Bozumu Şenliği';
        return GM.durumSahne({tema: 'basari', isaret: 'onay', baslik: 'Önerin editöre ulaştı', metin: `**${ad}** incelemeye alındı. Editör doğruladığında Lezzet Takvimi’nde yayınlanır; durumunu Topluluk Katkılarım’dan izleyebilirsin.`, ana: {metin: 'Katkılarım', ikon: 'ekle', yerine: '#/profil/katkilar'}, ikinciller: [{metin: 'Etkinliklere dön', ikon: 'etkinlik', yerine: '#/etkinlikler'}]});
      }
      if (ctx.sorgu.hal === 'eksik' && !hatalar) hatalar = formHata(form);
      return onerForm();
    },
    altBar: ctx => (GM.uye() && ctx.sorgu.hal !== 'gonderildi' && !gonderildi ? GM.altEylem({dugmeler: [{metin: 'Öneriyi gönder', ikon: 'gonder', tam: true, veri: {eylem: 'oner-gonder'}}]}) : ''),
    gizlen: () => { gonderildi = null; },
    sonra: kok => {
      const f = kok.querySelector('[data-oner-form]'); if (!f) return () => { gonderildi = null; };
      const oku2 = () => { const v = n => f.querySelector(`[name="${n}"]`)?.value || ''; form = {ad: v('ad'), tur: v('tur'), yer: v('yer'), tarih: v('tarih'), neden: v('neden')}; };
      const degis = () => oku2();
      f.addEventListener('input', degis); f.addEventListener('change', degis);
      const c = GM.eylem(kok, 'oner-gonder', el => {
        oku2(); hatalar = formHata(form);
        if (Object.values(hatalar).some(Boolean)) { GM.tazele(); GM.toast('Eksik alanları **tamamla**', {ikon: 'uyari'}); return; }
        GM.mesgul(el).then(() => {
          GM.durum.yaz('katki-etkinlik', [{id: `k-${Date.now()}`, tur: 'etkinlik', ad: form.ad, kategori: form.tur, yer: form.yer, tarih: form.tarih || null, neden: form.neden, durum: 'inceleniyor', gonderim: bugun()}, ...(GM.durum.oku('katki-etkinlik', []) || [])]);
          gonderildi = {ad: form.ad}; form = {...F}; hatalar = null; GM.titres(12); GM.tazele();
        });
      });
      return () => { f.removeEventListener('input', degis); f.removeEventListener('change', degis); c(); };
    }
  });
})();
