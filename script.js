/*
  randevular: localStorage anahtari, kayitli randevu dizisi
  randevuKaydet: yeni randevuyu diziye ekleyip localStorage'a yazar
  randevulariYukle: randevularim sayfasinda tabloyu olusturur
  randevuIptal: secilen randevuyu listeden siler
  aktifRandevulariGetir: iptal edilmemis randevulari dondurur
  durum-aktif, iptal-buton: randevu durumu ve iptal dugmesi
  doktorlariFiltrele: secilen bolume gore doktor listesini gunceller
  tcVeTelefonKontrol: TC ve telefonun 11 hane olup olmadigini kontrol eder
  saatleriYukle: saat slotlarini olusturur, dolu saatleri isaretler
  doluSaatleriGetir: secili doktor ve tarihteki dolu saatleri dondurur
  tarihSeciminiHazirla: 2026 ay listesini doldurur
  gunleriGuncelle: secilen aya gore gunleri doldurur
  secilenTarihiGuncelle: gizli randevuTarihi alanini gunceller
  saatSec: secilen saati kaydeder
  saatListesi: uygun randevu saatleri
  hastaneKaydir: ana sayfa hastane slaytini kaydirir
  konumAcKapat: konum detay kutusunu acar/kapatir
*/
var saatListesi = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
var hastaneKaydirAktif = 0;
var ayListesi = [
  { no: '01', ad: 'Ocak' }, { no: '02', ad: 'Subat' }, { no: '03', ad: 'Mart' },
  { no: '04', ad: 'Nisan' }, { no: '05', ad: 'Mayis' }, { no: '06', ad: 'Haziran' },
  { no: '07', ad: 'Temmuz' }, { no: '08', ad: 'Agustos' }, { no: '09', ad: 'Eylul' },
  { no: '10', ad: 'Ekim' }, { no: '11', ad: 'Kasim' }, { no: '12', ad: 'Aralik' }
];

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('randevuFormu');
  if (form) {
    var bolumKutusu = document.getElementById('bolumSecimi');
    var doktorKutusu = document.getElementById('doktorSecimi');
    var tarihKutusu = document.getElementById('randevuTarihi');
    var saatButon = document.getElementById('saatAcButon');
    var saatPanel = document.getElementById('saatPanel');
    var tarihAy = document.getElementById('tarihAy');
    var tarihGun = document.getElementById('tarihGun');
    tarihSeciminiHazirla();
    tarihAy.addEventListener('change', function () { gunleriGuncelle(); tarihDegisti(); });
    tarihGun.addEventListener('change', tarihDegisti);
    bolumKutusu.addEventListener('change', function () { doktorlariFiltrele(); saatiSifirla(); });
    doktorKutusu.addEventListener('change', function () { saatiSifirla(); saatleriYukle(); });
    function tarihDegisti() {
      secilenTarihiGuncelle();
      saatiSifirla();
      if (!saatPanel.classList.contains('gizli')) saatleriYukle();
    }
    doktorlariFiltrele();
    saatButon.addEventListener('click', function () {
      if (!doktorKutusu.value) { alert('Once doktor seciniz.'); return; }
      if (!tarihKutusu.value) { alert('Lutfen randevu tarihi secin.'); return; }
      saatPanel.classList.toggle('gizli');
      if (!saatPanel.classList.contains('gizli')) saatleriYukle();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var tcDeger = document.getElementById('tcKimlik').value;
      var telDeger = document.getElementById('telefonNumarasi').value;
      if (!tcVeTelefonKontrol(tcDeger, telDeger)) return;
      if (!tarihKutusu.value) { alert('Lutfen randevu tarihi secin.'); return; }
      var secilenSaat = document.getElementById('randevuSaati').value;
      if (!secilenSaat) { alert('Lutfen randevu saati secin.'); return; }
      if (doluSaatleriGetir(doktorKutusu.value, tarihKutusu.value).indexOf(secilenSaat) !== -1) {
        alert('Bu tarih ve saatte randevu dolu.');
        saatiSifirla();
        saatleriYukle();
        return;
      }
      randevuKaydet({
        ad: document.getElementById('hastaAd').value,
        soyad: document.getElementById('hastaSoyad').value,
        babaAdi: document.getElementById('babaAdi').value,
        tc: tcDeger.replace(/\D/g, ''),
        telefon: telDeger.replace(/\D/g, ''),
        bolum: bolumKutusu.value,
        doktor: doktorKutusu.value,
        tarih: tarihKutusu.value,
        saat: secilenSaat
      });
      alert('Randevu basariyla alindi!');
      form.reset();
      tarihSeciminiHazirla();
      saatiSifirla();
      doktorlariFiltrele();
      saatPanel.classList.add('gizli');
    });
  }
  var liste = document.getElementById('randevuListesi');
  if (liste) {
    randevulariYukle(liste);
    liste.addEventListener('click', function (e) {
      if (e.target.classList.contains('iptal-buton')) {
        randevuIptal(parseInt(e.target.dataset.sira, 10));
      }
    });
  }
  var izgara = document.getElementById('hastaneIzgara');
  if (izgara) {
    document.getElementById('hastaneOnceki').addEventListener('click', function () { hastaneKaydir(hastaneKaydirAktif - 1); });
    document.getElementById('hastaneSonraki').addEventListener('click', function () { hastaneKaydir(hastaneKaydirAktif + 1); });
    document.querySelectorAll('.konum-ac').forEach(function (btn) {
      btn.addEventListener('click', function () { konumAcKapat(btn); });
    });
    hastaneKaydir(0);
    window.addEventListener('resize', function () { hastaneKaydir(hastaneKaydirAktif); });
  }
});

function hastaneSonSayfa() {
  return window.innerWidth <= 768 ? 3 : 1;
}

function hastaneKaydir(guncel) {
  var izgara = document.getElementById('hastaneIzgara');
  if (!izgara) return;
  hastaneKaydirAktif = Math.max(0, Math.min(hastaneSonSayfa(), guncel));
  var adim = window.innerWidth <= 768 ? 25 : 50;
  izgara.style.transform = 'translateX(-' + (hastaneKaydirAktif * adim) + '%)';
  document.getElementById('hastaneOnceki').disabled = hastaneKaydirAktif === 0;
  document.getElementById('hastaneSonraki').disabled = hastaneKaydirAktif === hastaneSonSayfa();
}

function konumAcKapat(btn) {
  var detay = btn.nextElementSibling;
  detay.classList.toggle('gizli');
  btn.classList.toggle('acik');
}

function saatiSifirla() {
  var saatInput = document.getElementById('randevuSaati');
  var saatButon = document.getElementById('saatAcButon');
  if (!saatInput) return;
  saatInput.value = '';
  if (saatButon) saatButon.textContent = 'Saat seciniz';
}

function tarihSeciminiHazirla() {
  var ayKutusu = document.getElementById('tarihAy');
  var gunKutusu = document.getElementById('tarihGun');
  var gizliTarih = document.getElementById('randevuTarihi');
  if (!ayKutusu || !gunKutusu) return;
  var bugun = bugunTarihi();
  var baslangicAy = 1;
  if (bugun >= '2026-01-01' && bugun <= '2026-12-31') baslangicAy = parseInt(bugun.split('-')[1], 10);
  else if (bugun > '2026-12-31') baslangicAy = 13;
  ayKutusu.innerHTML = '<option value="">Ay seciniz</option>';
  ayListesi.forEach(function (ay) {
    if (parseInt(ay.no, 10) >= baslangicAy) {
      ayKutusu.innerHTML += '<option value="' + ay.no + '">' + ay.ad + ' 2026</option>';
    }
  });
  gunKutusu.innerHTML = '<option value="">Gun seciniz</option>';
  gunKutusu.disabled = true;
  if (gizliTarih) gizliTarih.value = '';
}

function gunleriGuncelle() {
  var ayKutusu = document.getElementById('tarihAy');
  var gunKutusu = document.getElementById('tarihGun');
  if (!ayKutusu || !gunKutusu) return;
  var ay = ayKutusu.value;
  gunKutusu.innerHTML = '<option value="">Gun seciniz</option>';
  if (!ay) { gunKutusu.disabled = true; secilenTarihiGuncelle(); return; }
  var bugun = bugunTarihi();
  var minGun = 1;
  var maxGun = new Date(2026, parseInt(ay, 10), 0).getDate();
  if (bugun.startsWith('2026-' + ay + '-')) minGun = parseInt(bugun.split('-')[2], 10);
  for (var g = minGun; g <= maxGun; g++) {
    var gun = g < 10 ? '0' + g : '' + g;
    gunKutusu.innerHTML += '<option value="' + gun + '">' + gun + '</option>';
  }
  gunKutusu.disabled = false;
  secilenTarihiGuncelle();
}

function secilenTarihiGuncelle() {
  var ay = document.getElementById('tarihAy').value;
  var gun = document.getElementById('tarihGun').value;
  var gizli = document.getElementById('randevuTarihi');
  if (gizli) gizli.value = ay && gun ? '2026-' + ay + '-' + gun : '';
}

function bugunTarihi() {
  var d = new Date();
  var ay = d.getMonth() + 1;
  var gun = d.getDate();
  return d.getFullYear() + '-' + (ay < 10 ? '0' : '') + ay + '-' + (gun < 10 ? '0' : '') + gun;
}

function tarihGoster(tarih) {
  if (!tarih) return '-';
  var p = tarih.split('-');
  return p[2] + '.' + p[1] + '.' + p[0];
}

function doluSaatleriGetir(doktor, tarih) {
  return aktifRandevulariGetir()
    .filter(function (r) { return r.doktor === doktor && r.tarih === tarih && r.saat; })
    .map(function (r) { return r.saat; });
}

function saatleriYukle() {
  var izgara = document.getElementById('saatIzgarasi');
  var doktor = document.getElementById('doktorSecimi').value;
  var tarih = document.getElementById('randevuTarihi').value;
  if (!izgara || !doktor || !tarih) return;
  var dolu = doluSaatleriGetir(doktor, tarih);
  var secili = document.getElementById('randevuSaati').value;
  izgara.innerHTML = '';
  saatListesi.forEach(function (saat) {
    var kutu = document.createElement('button');
    kutu.type = 'button';
    kutu.className = 'saat-slot';
    kutu.textContent = saat;
    if (dolu.indexOf(saat) !== -1) {
      kutu.classList.add('dolu');
      kutu.disabled = true;
    } else {
      if (saat === secili) kutu.classList.add('secili');
      kutu.addEventListener('click', function () { saatSec(saat); });
    }
    izgara.appendChild(kutu);
  });
}

function saatSec(saat) {
  document.getElementById('randevuSaati').value = saat;
  document.getElementById('saatAcButon').textContent = saat;
  document.getElementById('saatPanel').classList.add('gizli');
  saatleriYukle();
}

function tcVeTelefonKontrol(tc, telefon) {
  if (tc.replace(/\D/g, '').length !== 11) {
    alert('Gecerli bir TC no girin.');
    return false;
  }
  if (telefon.replace(/\D/g, '').length !== 11) {
    alert('Gecerli bir telefon numarasi girin.');
    return false;
  }
  return true;
}

function doktorlariFiltrele() {
  var bolum = document.getElementById('bolumSecimi').value;
  var doktorKutusu = document.getElementById('doktorSecimi');
  var secenekler = doktorKutusu.querySelectorAll('option');
  doktorKutusu.value = '';
  secenekler.forEach(function (secenek) {
    if (!secenek.value) {
      secenek.textContent = bolum ? 'Doktor seciniz' : 'Once bolum seciniz';
      secenek.hidden = false;
      return;
    }
    secenek.hidden = !bolum || secenek.dataset.bolum !== bolum;
  });
  doktorKutusu.disabled = !bolum;
}

function randevuKaydet(kayit) {
  var mevcut = JSON.parse(localStorage.getItem('randevular') || '[]');
  mevcut.push(kayit);
  localStorage.setItem('randevular', JSON.stringify(mevcut));
}

function aktifRandevulariGetir() {
  return JSON.parse(localStorage.getItem('randevular') || '[]').filter(function (r) { return !r.iptal; });
}

function randevuIptal(sira) {
  var veriler = aktifRandevulariGetir();
  if (!veriler[sira]) return;
  veriler.splice(sira, 1);
  localStorage.setItem('randevular', JSON.stringify(veriler));
  randevulariYukle(document.getElementById('randevuListesi'));
}

function randevulariYukle(hedef) {
  var veriler = aktifRandevulariGetir();
  localStorage.setItem('randevular', JSON.stringify(veriler));
  if (!veriler.length) {
    hedef.innerHTML = '<p class="bos-mesaj">Henuz randevunuz bulunmuyor.</p>';
    return;
  }
  var html = '<table class="randevu-tablo"><thead><tr><th>Ad</th><th>Soyad</th><th>Baba Adi</th><th>TC</th><th>Bolum</th><th>Doktor</th><th>Tarih</th><th>Saat</th><th>Durum</th></tr></thead><tbody>';
  veriler.forEach(function (r, sira) {
    var ad = r.ad || (r.hasta ? r.hasta.split(' ')[0] : '-');
    var soyad = r.soyad || (r.hasta ? r.hasta.split(' ').slice(1).join(' ') : '-');
    var baba = r.babaAdi || '-';
    var durum = '<span class="durum-aktif">Aktif</span> <button type="button" class="iptal-buton" data-sira="' + sira + '">Iptal</button>';
    html += '<tr><td>' + ad + '</td><td>' + soyad + '</td><td>' + baba + '</td><td>' + r.tc + '</td><td>' + r.bolum + '</td><td>' + r.doktor + '</td><td>' + tarihGoster(r.tarih) + '</td><td>' + (r.saat || '-') + '</td><td class="durum-hucre">' + durum + '</td></tr>';
  });
  hedef.innerHTML = html + '</tbody></table>';
}
