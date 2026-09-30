/**
 * Mobil, tablet ve masaüstü tarayıcılarda dosyaların doğrudan cihazın
 * İndirilenler (Downloads) klasörüne inmesini sağlayan güvenilir indirme yardımcısı.
 */
export function triggerFileDownload(
  content: string | Blob,
  filename: string,
  mimeType: string = 'application/octet-stream'
) {
  if (typeof window === 'undefined') return;

  // 1. Blob oluştur
  // 'application/octet-stream' MIME türü, mobil Safari ve Android Chrome'un
  // dosyayı tarayıcı sekmesinde görüntülemek yerine doğrudan İndirilenler'e kaydetmesini zorunlu kılar.
  const blob = content instanceof Blob
    ? content
    : new Blob([content], { type: `${mimeType};charset=utf-8` });

  const url = URL.createObjectURL(blob);

  // 2. Gizli anchor elementi oluştur
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  document.body.appendChild(a);

  // 3. Tıklama olayını sentetik olarak tetikle
  try {
    a.click();
  } catch {
    const evt = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    a.dispatchEvent(evt);
  }

  // 4. Elementi DOM'dan kaldır
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
  }, 1000);

  // 5. KRİTİK MOBİL DÜZELTME:
  // Android Chrome ve iOS Safari indirme yöneticileri dosyayı arka planda asenkron olarak yazar.
  // URL hemen iptal edilirse mobil indirme başarısız olur. Bu nedenle URL nesnesini 2 dakika canlı tutuyoruz.
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }, 120000);
}
