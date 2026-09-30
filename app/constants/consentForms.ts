// Türk Dişhekimleri Birliği (TDB) standartlarına ve hekim malpraktis/ücret mutabakatına uygun kapsamlı onam şablonları

export const COMMON_CONSENT_HEADER = 
  "Uygulanacak tedavinin amacı, süreci, alternatif tedavi yöntemleri ve olası tüm risk/komplikasyonları tarafıma hekimim tarafından sözlü ve yazılı olarak açıkça anlatılmıştır. İşlem öncesinde kararlaştırılan toplam tedavi bedelini, ödeme koşullarını ve anlaşılan ücreti bildiğimi, bu ücreti eksiksiz ödemeyi kabul ve taahhüt ettiğimi; tedavinin hekimimin kontrolü dışındaki biyolojik nedenlerle başarısız olması durumunda dahi yapılan mesleki müdahale, sarf malzeme ve laboratuvar bedellerinden sorumlu olduğumu kabul ve beyan ederim.";

export interface ConsentTemplateItem {
  title: string;
  shortTitle: string;
  application: string;
  risks: string[];
  text: string;
}

export const CONSENT_TEMPLATES: Record<string, ConsentTemplateItem> = {
  endodonti: {
    title: "Endodontik Tedavi (Kanal Tedavisi) Onam Formu",
    shortTitle: "Endodonti (Kanal Tedavisi)",
    application: "İlgili dişin enfekte pulpa dokusunun temizlenmesi, şekillendirilmesi ve kök kanallarının doldurulması.",
    risks: [
      "Kök anatomisinin aşırı eğri, kalsifiye (tıkalı) veya dar olması durumunda kanal aletlerinin kök içinde kırılabilme (file fracture) veya perforasyon (kök delinmesi) riski bulunmaktadır.",
      "Seans aralarında veya sonrasında hafif/orta şiddette ağrı, baskı hassasiyeti ve akut alevlenme (flare-up/şişlik) görülebilir; bu durum geçicidir ve ilaç tedavisi gerektirebilir.",
      "İleri derece kemik yıkımı veya kistik lezyon bulunan dişlerde kanal tedavisine rağmen lezyonun iyileşmeme riski vardır; bu takdirde re-treatment (yenileme), apikal rezeksiyon (cerrahi) veya dişin çekimi gerekebilir.",
      "Kanal tedavili dişler canlılığını kaybettiği için kırılganlaşır. Tedavi sonrası hekimin önerdiği restorasyon (onley, zirkon/kaplama) yapılmazsa dişin dikey kırılma (vertical root fracture) ve çekim riski hastaya aittir."
    ],
    text: "Kanal aletlerinin eğri/dar köklerde kırılma riski, perforasyon, alevlenme ve kök ucunda iyileşmeyen lezyonlarda apikal cerrahi veya çekim gerekliliği anlatılmıştır. Tedavi sonrası üst restorasyonun gecikmesi kaynaklı dikey diş kırıklarının sorumluluğu hastaya aittir. Kararlaştırılan tedavi bedeli ve ödeme şartları onaylanmıştır."
  },
  cerrahi: {
    title: "Cerrahi ve Diş Çekimi (Gömülü 20'lik Dahil) Onam Formu",
    shortTitle: "Cerrahi ve Diş Çekimi",
    application: "Hasarlı, enfekte, periyodontal harabiyete uğramış veya gömülü/yarı gömülü dişlerin çekimi.",
    risks: [
      "Lokal anesteziye bağlı geçici hissizlik, hematom (morarma) veya alerjik reaksiyonlar görülebilir.",
      "Alt çene arka dişlerin çekiminde mandibular kanala yakınlık sebebiyle alt dudak ve dilde geçici (nadir hallerde kalıcı) his kaybı/parestezi gelişebilir.",
      "Üst arka dişlerin çekiminde maksiller sinüs tabanının açılması (sinüs perforasyonu) ihtimali vardır.",
      "Kök ucu kırılması durumunda kemik harabiyetini önlemek amacıyla kırık kök ucu yerinde bırakılabilir veya ek cerrahi yapılabilir.",
      "Çekim sonrası hekimin talimatlarına (tükürmeme, sıcak yememe, sigara içmeme) uyulmaması halinde gelişebilecek şiddetli ağrılı alveolit (kuru soket / dry socket) enfeksiyonu ve gecikmiş iyileşme riskini kabul ediyorum."
    ],
    text: "Lokal anestezi riskleri, sinir komşuluğuna bağlı geçici/kalıcı his kaybı (parestezi), maksiller sinüs perforasyonu, kök ucu kırığı ve çekim sonrası kurallara uyulmaması halinde alveolit (kuru soket) riski tarafıma anlatılmıştır. Kararlaştırılan ücreti ödemeyi kabul ediyorum."
  },
  implant: {
    title: "Dental İmplant Cerrahisi Onam Formu",
    shortTitle: "Dental İmplant Cerrahisi",
    application: "Çene kemiğine yapay titanyum/seramik diş kökü (implant) yerleştirilmesi ve gerekirse kemik tozu (greft/membran/sinüs lifting) uygulanması.",
    risks: [
      "İmplantın çene kemiğiyle kaynamaması (osseointegrasyon kaybı/erken dönem implant kaybı) biyolojik nedenlerle, sigara kullanımıyla veya sistemik hastalıklarla ortaya çıkabilir; bu takdirde implantın çıkartılması ve belirli bir süre sonra tekrarı gerekebilir.",
      "Operasyon sonrası şişlik, morarma, ağrı, trismus (çene açmada kısıtlılık) beklenen süreçlerdir.",
      "Anatomik komşuluklar sebebiyle geçici/kalıcı his kaybı veya maksiller sinüs komplikasyonları riski mevcuttur.",
      "İmplant cerrahisi ile implant üstü protez ücretlerinin ayrı olabileceği, protez aşamasına geçilmeden önceki iyileşme sürecinin kemik kalitesine göre değişebileceği tarafıma açıklanmıştır."
    ],
    text: "İmplantın kemikle kaynamama (erken kayıp) riski, sinir zedelenmesi, anatomik komplikasyonlar ve kemik tozu gerekebileceği tarafıma izah edilmiştir. Cerrahi ve protez aşamalarının bedelleri konusunda mutabık kalınmıştır."
  },
  sabit_protez: {
    title: "Sabit Protez (Zirkonyum / Kaplama / Köprü) Onam Formu",
    shortTitle: "Sabit Protez (Zirkonyum/E-Max/Köprü)",
    application: "Dişlerin aşındırılarak (preparasyon) laboratuvarda hazırlanan estetik kaplama veya köprüler ile restore edilmesi.",
    risks: [
      "Kesim işlemi sonrası dişlerde özellikle ilk haftalarda sıcak-soğuk hassasiyeti normaldir. İleri ve geçmeyen hassasiyet durumlarında dişlere ek olarak kanal tedavisi yapılması gerekebilir.",
      "Porselen ve seramik materyaller sert darbe, travma veya parafonksiyonel alışkanlıklar (gece diş sıkma/bruksizm, sert gıda kırma) neticesinde çatlayabilir veya kırılabilir (chipping). Gece plağı önerilmişse kullanılmaması kaynaklı hasarlar hastanın sorumluluğundadır.",
      "Hasta tarafından onaylanan renk (skala seçimi) ve form, daimi simantasyon (yapıştırma) yapıldıktan sonra değiştirilemez; söküm ve yeniden yapım ek maliyete tabidir.",
      "Köprü gövdelerinin altının özel diş ipleri ve arayüz fırçalarıyla temizlenmemesi durumunda oluşacak diş eti çekilmesi veya destek dişlerin çürümesinden hekim sorumlu tutulamaz."
    ],
    text: "Kesim sonrası geçici hassasiyet ve gerekebilecek kanal tedavisi riski, porselen chipping (kırılma/çatlama) ihtimali izah edilmiştir. Onayladığım renk ve form yapıştırıldıktan sonra değiştirilemez. Tedavi ve laboratuvar bedeli onaylanmıştır."
  },
  hareketli_protez: {
    title: "Hareketli Protez (Damak / Çıtçıtlı Protez) Onam Formu",
    shortTitle: "Hareketli Protez (Damak/Çıtçıtlı)",
    application: "Eksik dişlerin doku ve diş destekli takıp çıkartılabilen protezlerle tamamlanması.",
    risks: [
      "Protezin tesliminden sonra vuruklar, ağızda yara oluşumu, konuşma ve çiğneme adaptasyon güçlüğü, tat alma hissinin değişmesi ve tükürük artışı ilk haftalarda normaldir; hekim kontrolleriyle aşındırma (uyumlama) seansları gerektirir.",
      "Çene kemiğinin zamanla erimesine bağlı olarak protezin stabilitesi/tutuculuğu azalabilir; belirli aralıklarla besleme (astar) veya protezin yenilenmesi gerekebilir.",
      "Çıtçıtlı (hassas tutuculu) protezlerdeki plastik yuvalar (lastikler) zamanla aşınır ve periyodik olarak ücreti karşılığında değiştirilmesi rutin bir bakımdır."
    ],
    text: "İlk haftalardaki vuruk, yara, konuşma güçlüğü ve alışma süreci anlatılmıştır. Kemik erimesine bağlı protezin tutuculuğunun azalabileceği ve lastik/parça değişimlerinin periyodik bakım gerektirdiği kabul edilmiştir."
  },
  restoratif: {
    title: "Restoratif Diş Tedavisi (Dolgu / İnley-Onley) Onam Formu",
    shortTitle: "Restoratif Tedavi (Dolgu)",
    application: "Çürük veya kırık diş dokusunun temizlenerek estetik kompozit dolgu maddeleriyle doldurulması.",
    risks: [
      "Derin çürük temizliği sonrasında pulpanın korunması için kuafaj (ilaçlı taban) uygulanabilir. İşlem sonrasında dişte geri dönüşsüz pulpitis (ağrı/zonklama) gelişirse dişe kanal tedavisi uygulanması gerekebilir.",
      "Dolgu sonrasında çiğneme esnasında yükseklik veya hafif hassasiyet oluşabilir; küçük bir tesviye/yükseklik alma seansı ile düzeltilir.",
      "Renklendirici gıda tüketimi ve yetersiz ağız hijyenine bağlı olarak dolgu sınırlarında zamanla renklenme veya ikincil çürük oluşma riski hastanın bakımına bağlıdır."
    ],
    text: "Derin çürüklerde dolgu sonrası ağrının geçmemesi durumunda kanal tedavisine geçilebileceği, yükseklik ve çiğneme hassasiyeti olabileceği tarafıma aktarılmıştır. Ücret kabul edilmiştir."
  }
};
