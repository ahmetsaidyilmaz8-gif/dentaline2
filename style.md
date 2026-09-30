# TenaxLine Dental Suite - Tasarım Sistemi & Stil Rehberi (style.md)

Bu rehber, **TenaxLine Dental Suite** uygulamasının Tailwind UI esintili, modern, kullanıcı dostu ve klinik atmosferine uygun tasarım ilkelerini tanımlar. Tüm arayüz geliştirmelerinde bu dokümandaki yapı ve renk paletleri esas alınmalıdır.

---

## 1. Renk Paleti (Color Palette)

Klinik yönetimi için temiz, güven veren, hijyenik ve enerjik bir renk paleti belirlenmiştir.

| Rol | Tailwind Sınıfı | Renk Kodu | Açıklama / Kullanım Alanı |
| :--- | :--- | :--- | :--- |
| **Birincil (Ana Tema)** | `teal-600` | `#0d9488` | Marka rengi, butonlar, aktif sekmeler, vurgulanması gereken klinik öğeleri. |
| **Birincil Hafif** | `teal-50` | `#f0fdfa` | Teal butonların arka planı, hafif kart vurguları, bildirim kutuları. |
| **İkincil (Derinlik)** | `slate-900` / `slate-800` | `#0f172a` / `#1e293b` | Başlıklar, koyu temalı kartlar, yan menüler. |
| **Nötr Arka Plan** | `slate-50` / `slate-100` | `#f8fafc` / `#f1f5f9` | Genel sayfa arka planı, pasif alanlar. |
| **Kart Arka Plan** | `white` | `#ffffff` | Kart içerikleri, formlar, tablolar. |

### Durum Renkleri (Status Colors)
- **Beklemede (Pending):** `amber-500` (`#f59e0b`) / Arka Plan: `amber-50` / Metin: `amber-700`
- **Tamamlandı (Completed):** `emerald-500` (`#10b981`) / Arka Plan: `emerald-50` / Metin: `emerald-700`
- **İptal Edildi (Cancelled):** `rose-500` (`#f43f5e`) / Arka Plan: `rose-50` / Metin: `rose-700`

---

## 2. Tipografi (Typography)

Tasarımda okunabilirliği artırmak ve profesyonel bir hava katmak için sans-serif yazı tipleri (Inter, Outfit) tercih edilir.

- **Ana Sayfa / Bölüm Başlıkları:** `text-2xl` veya `text-3xl`, `font-extrabold` veya `font-black`, `tracking-tight`, `text-slate-900`.
- **Kart / Tablo Başlıkları:** `text-base` veya `text-lg`, `font-bold` veya `font-semibold`, `text-slate-800`.
- **Standart Metin / Açıklamalar:** `text-sm` veya `text-base`, `font-medium`, `text-slate-500` veya `text-slate-400`.
- **Sayısal Değerler / Kodlar:** `font-mono`, yüksek kontrastlı ve belirgin (örneğin istatistik sayıları için `text-slate-900`).

---

## 3. Bileşen Tasarım İlkeleri (Tailwind UI Esintili)

### A. Üst Karşılama Paneli (Welcome Header)
- **Yerleşim:** Geniş, yuvarlatılmış (`rounded-2xl` veya `rounded-3xl`), gölgeli (`shadow-sm`) beyaz kart veya degrade geçişli modern kart.
- **İçerik:** Sol tarafta ikon ve karşılama yazısı (koyu ve net başlık, altında destekleyici açıklama), sağ tarafta ise yenileme veya aksiyon butonları.
- **İnteraktiflik:** Yenileme ikonunda `animate-spin` ile yüklenme durumu görselleştirilir.

### B. İstatistik Kartları (KPI Cards)
- **Yapı:** Grid yapısında 4 sütunlu (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- **Görsel Tasarım:**
  - Beyaz zemin, ince sınır çizgisi (`border border-slate-100`), geniş iç dolgu (`p-6`), yuvarlatılmış köşeler (`rounded-2xl`).
  - Sağda pastel arka planlı (`bg-teal-50` vb.) ve renkli bir durum ikonu.
  - Hover durumunda yukarı doğru hafifçe yükselme efekti (`hover:-translate-y-1 transition-all duration-300 shadow-md`).
- **Veri Gösterimi:** Büyük, kalın sayılar (`text-3xl font-black text-slate-800`), altında küçük açıklamalar ve değişim oranları.

### C. Tablolar & Veri Listeleri
- **Çevreleyici Kart:** `rounded-2xl border border-slate-100 shadow-sm overflow-hidden bg-white`.
- **Tablo Başlığı (Header):** `bg-slate-50/60 border-b border-slate-100 px-6 py-4 flex justify-between items-center`.
- **Satırlar:** Her satırda hover efekti (`hover:bg-slate-50/50 transition-colors`).
- **Durum Badgeleri:**
  - Yuvarlatılmış tam kapsül (`rounded-full px-2.5 py-1 text-xs font-semibold`).
  - Badge içinde sol tarafta durum renginde parıldayan veya sabit duran küçük bir nokta (`w-1.5 h-1.5 rounded-full bg-current`).
- **Hızlı İşlemler (Quick Actions):** Butonlar dairesel veya hafif kare (`rounded-xl`), hover durumunda renk değiştiren, yumuşak gölgeli ve `active:scale-95` basılma hissi veren yapıda olmalıdır.

### D. Boş Durum & Demo Veri Yükleme Alanları
- **Seed Uyarısı:** Sıradan bir uyarı kutusu yerine, `bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10` ile tasarlanmış modern bir kart.
- Sol tarafta parıldayan bir ampul ikonu, sağ tarafta ise dikkat çekici, yumuşak gölgeli bir demo yükleme butonu (`bg-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-95`).

---

## 4. Kullanıcı Deneyimi (UX) & Mikro Animasyonlar

- **Basılma Hissiyatı (Micro-interactions):** Tüm tıklanabilir buton ve kartlarda `active:scale-95 transition-all duration-200` sınıfı kullanılmalıdır.
- **Yükleniyor Efektleri (Loading States):** Veriler yenilenirken ikonlarda dönme veya iskelet (skeleton) ekran geçişleri sağlanmalıdır.
- **Odak Tasarımı:** Tablo satırlarında hasta isimlerine tıklandığında belirgin hover durumları (`text-teal-600 underline-offset-4`) eklenmelidir.
