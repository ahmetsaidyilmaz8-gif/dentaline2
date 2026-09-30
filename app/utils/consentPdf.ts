import { COMMON_CONSENT_HEADER, CONSENT_TEMPLATES } from '~/constants/consentForms';

export interface ConsentFormData {
  _id?: string;
  formType?: string;
  formTitle?: string;
  toothNumber?: string;
  acceptanceText?: string;
  acceptanceSignatureBase64?: string;
  contentSummary?: string;
  signatureBase64: string;
  signerName?: string;
  doctorName?: string;
  doctorSignatureBase64?: string;
  patientName?: string;
  signedAt?: string | Date;
  signedAtFormatted?: string;
  createdAt?: string | Date;
}

export interface PatientDataForPdf {
  firstName?: string;
  lastName?: string;
  tcNo?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
}

/**
 * Resmi tıbbi ve hukuki standartlarda, A4 sayfasına tam sığacak
 * saf vektörel ve kristal netliğinde HTML şablonu üretir.
 */
export function generateConsentPrintHtml(form: ConsentFormData, patient: PatientDataForPdf = {}): { html: string; fileName: string; title: string } {
  const patientFullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || form.patientName || 'Hasta';
  const formTitle = form.formTitle || 'Aydınlatılmış Onam Formu';
  const template = (form.formType && CONSENT_TEMPLATES[form.formType]) || null;

  // Güvenli dosya adı üretimi
  const safePatientName = patientFullName.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, '_');
  const safeFormTitle = formTitle.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, '_');
  const fileName = `Onam_Formu_${safePatientName}_${safeFormTitle}.pdf`;

  // Belge Tarihi
  let dateStr = form.signedAtFormatted || '';
  if (!dateStr && form.signedAt) {
    try {
      dateStr = new Date(form.signedAt).toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      dateStr = String(form.signedAt);
    }
  }
  if (!dateStr) {
    dateStr = new Date().toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const applicationText = template?.application || 'Hastanın durumuna uygun diş hekimliği tedavisi ve restoratif/cerrahi müdahale yapılması.';
  const risksList = template?.risks || [
    'Lokal anesteziye bağlı geçici uyuşukluk, hematom veya hassasiyet.',
    'Müdahale sonrasında geçici sızı, çiğneme hassasiyeti veya hafif şişlik.',
    'Biyolojik faktörlere ve kemik yapısına bağlı iyileşme sürecinde ek kontroller gerekebilme ihtimali.'
  ];
  const commitmentText = template?.text || 'Uygulanacak tedavi, olası riskler, alternatifler ve ücret şartları tarafıma sözlü ve yazılı olarak anlatılmıştır. Tedaviyi onaylıyorum.';
  const docRef = form._id ? `ONAM-${form._id.slice(-8).toUpperCase()}` : `ONAM-${Date.now().toString().slice(-8)}`;

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>${formTitle} - ${patientFullName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 8mm 12mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 8.5pt;
      line-height: 1.4;
    }
    .doc-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }
    /* Üst Başlık */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2.5px solid #0d9488;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .logo-badge {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #0d9488;
      color: #ffffff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
      vertical-align: middle;
      margin-right: 8px;
    }
    .clinic-title {
      font-size: 14pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
      margin: 0;
      line-height: 1.1;
    }
    .clinic-sub {
      font-size: 7.5pt;
      font-weight: 700;
      color: #0d9488;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 2px 0 0 0;
    }
    .ref-badge {
      display: inline-block;
      background: #f0fdfa;
      color: #0f766e;
      border: 1px solid #99f6e4;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }
    /* Belge Başlığı */
    .title-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
      text-align: center;
      margin-bottom: 8px;
    }
    .form-heading {
      font-size: 11pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      margin: 0;
      letter-spacing: 0.2px;
    }
    .form-subheading {
      font-size: 7.5pt;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    /* Hasta Bilgi Tablosu */
    .patient-table {
      width: 100%;
      border-collapse: collapse;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      margin-bottom: 8px;
      table-layout: fixed;
    }
    .patient-table td {
      padding: 5px 8px;
      border-right: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .patient-table td:last-child {
      border-right: none;
    }
    .label-meta {
      font-size: 6.5pt;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      display: block;
      margin-bottom: 2px;
    }
    .val-meta {
      font-size: 8.5pt;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
      display: block;
    }
    /* Bölümler */
    .sec-block {
      margin-bottom: 7px;
      padding-left: 8px;
      border-left: 3px solid #0d9488;
    }
    .sec-title {
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      margin: 0 0 2px 0;
      letter-spacing: 0.2px;
    }
    .sec-text {
      font-size: 7.5pt;
      color: #334155;
      margin: 0;
      line-height: 1.4;
      text-align: justify;
    }
    .risk-list {
      margin: 0;
      padding-left: 14px;
      font-size: 7.5pt;
      color: #334155;
      line-height: 1.35;
    }
    .risk-list li {
      margin-bottom: 1.5px;
    }
    /* Bölüm 4: Hasta Rıza ve El Yazısı */
    .acceptance-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 6px;
      padding: 7px 9px;
      margin-bottom: 9px;
    }
    .handwriting-frame {
      background: #ffffff;
      border: 1.5px dashed #d97706;
      border-radius: 5px;
      padding: 6px 8px;
      margin-top: 6px;
    }
    /* İmza Tablosu */
    .sig-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 10px 0;
      margin-bottom: 8px;
      table-layout: fixed;
    }
    .sig-cell-doctor {
      width: 50%;
      vertical-align: top;
      border: 1.5px solid #cbd5e1;
      border-radius: 7px;
      padding: 7px 9px;
      background: #f8fafc;
    }
    .sig-cell-patient {
      width: 50%;
      vertical-align: top;
      border: 1.5px solid #0d9488;
      border-radius: 7px;
      padding: 7px 9px;
      background: #f0fdfa;
    }
    .sig-inner-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 1px dashed #cbd5e1;
      margin-bottom: 5px;
      padding-bottom: 3px;
    }
    .sig-canvas-box {
      height: 52px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      margin: 5px 0 3px 0;
      padding: 2px;
    }
    /* Dipnot */
    .divider-line {
      height: 1px;
      background: #e2e8f0;
      width: 100%;
      margin: 6px 0 4px 0;
    }
    .footer-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="doc-container">
    
    <!-- ÜST BAŞLIK -->
    <table class="header-table">
      <tr>
        <td style="vertical-align: middle;">
          <div style="display: flex; align-items: center;">
            <div class="logo-badge">✦</div>
            <div>
              <h1 class="clinic-title">TENAXLINE AĞIZ VE DİŞ SAĞLIĞI POLİKLİNİĞİ</h1>
              <p class="clinic-sub">Özel Sağlık Hizmetleri & Diş Hekimliği Kliniği</p>
            </div>
          </div>
        </td>
        <td style="text-align: right; vertical-align: middle; white-space: nowrap;">
          <span class="ref-badge">TDB Standart Yasal Belge</span>
          <div style="font-size: 7.5pt; color: #64748b; margin-top: 3px; font-family: monospace;">Ref: <strong>${docRef}</strong></div>
          <div style="font-size: 7.5pt; color: #64748b; margin-top: 1px;">Tarih: <strong>${dateStr}</strong></div>
        </td>
      </tr>
    </table>

    <!-- BELGE BAŞLIĞI -->
    <div class="title-card">
      <h2 class="form-heading">${formTitle}</h2>
      <p class="form-subheading">Hasta Bilgilendirilmiş ve Aydınlatılmış Onam, Hekim Malpraktis ve Tedavi Ücret Mutabakatı</p>
    </div>

    <!-- HASTA DETAY TABLOSU -->
    <table class="patient-table">
      <tr>
        <td style="width: 24%;">
          <span class="label-meta">Hasta Adı Soyadı</span>
          <strong class="val-meta">${patientFullName}</strong>
        </td>
        <td style="width: 19%;">
          <span class="label-meta">T.C. Kimlik No</span>
          <strong class="val-meta" style="font-family: monospace;">${patient.tcNo || 'Belirtilmemiş'}</strong>
        </td>
        <td style="width: 19%;">
          <span class="label-meta">İletişim / Tel</span>
          <strong class="val-meta" style="font-family: monospace;">${patient.phone || 'Belirtilmemiş'}</strong>
        </td>
        <td style="width: 18%;">
          <span class="label-meta" style="color: #0d9488;">Uygulanacak Diş</span>
          <strong class="val-meta" style="color: #0d9488;">${form.toothNumber ? 'Diş ' + form.toothNumber : 'Genel / Tüm'}</strong>
        </td>
        <td style="width: 20%;">
          <span class="label-meta">İmzalayan / Temsilci</span>
          <strong class="val-meta">${form.signerName || patientFullName}</strong>
        </td>
      </tr>
    </table>

    <!-- 1. ORTAK ÜST HÜKÜM -->
    <div class="sec-block" style="border-left-color: #0d9488;">
      <h3 class="sec-title" style="color: #0f766e;">1. Genel Bilgilendirme, Ücret Mutabakatı ve Biyolojik Risk Beyanı</h3>
      <p class="sec-text">${COMMON_CONSENT_HEADER}</p>
    </div>

    <!-- 2. UYGULAMA METNİ -->
    <div class="sec-block" style="border-left-color: #3b82f6;">
      <h3 class="sec-title" style="color: #1d4ed8;">2. Planlanan Tedavi ve Müdahale Detayı (Uygulama)</h3>
      <p class="sec-text">${applicationText} ${form.toothNumber ? `(Uygulanacak Diş No: ${form.toothNumber})` : ''}</p>
    </div>

    <!-- 3. RİSKLER VE KOMPLİKASYONLAR -->
    <div class="sec-block" style="border-left-color: #e11d48;">
      <h3 class="sec-title" style="color: #be123c;">3. Tedaviye Özgü Olası Riskler, Yan Etkiler ve Komplikasyonlar</h3>
      <ul class="risk-list">
        ${risksList.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>

    <!-- 4. HASTA RIZA VE EL YAZISI -->
    <div class="acceptance-box">
      <h3 style="margin: 0 0 3px 0; font-size: 8.5pt; font-weight: 800; color: #92400e; text-transform: uppercase;">
        4. Hasta Rıza, Onay ve Taahhüt Beyanı
      </h3>
      <p style="margin: 0 0 6px 0; font-size: 7.5pt; color: #78350f; line-height: 1.45; text-align: justify;">
        ${commitmentText}
      </p>
      <div class="handwriting-frame">
        <div style="font-weight: 700; font-size: 7.5pt; margin-bottom: 4px; color: #92400e;">
          Hasta Kendi El Yazısı Beyanı (Parmak / Dijital Kalem İle):
        </div>
        ${
          form.acceptanceSignatureBase64
            ? `<div style="height: 38px; display: flex; align-items: center;"><img src="${form.acceptanceSignatureBase64}" alt="Hasta El Yazısı" style="max-height: 36px; max-width: 100%; object-fit: contain;" /></div>`
            : `<span style="font-style: italic; color: #b45309; font-weight: 700; font-size: 8.5pt;">"${form.acceptanceText || 'Okudum, anladım, kabul ediyorum.'}"</span>`
        }
      </div>
    </div>

    <!-- İMZA ALANLARI -->
    <table class="sig-table">
      <tr>
        <!-- HEKİM -->
        <td class="sig-cell-doctor">
          <table class="sig-inner-table">
            <tr>
              <td style="text-align: left; vertical-align: middle;">
                <strong style="font-size: 8pt; color: #0f172a; text-transform: uppercase;">Bilgilendiren Diş Hekimi</strong>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <span style="background: #0d9488; color: #ffffff; font-size: 6.5pt; font-weight: 700; padding: 2px 5px; border-radius: 3px;">
                  ✓ HEKİM ONAYI
                </span>
              </td>
            </tr>
          </table>
          <div style="font-size: 7.5pt; color: #334155; margin-bottom: 2px;">
            <strong>Hekim:</strong> ${form.doctorName || 'Dt. M. Selman'}
          </div>
          <div class="sig-canvas-box">
            ${
              form.doctorSignatureBase64
                ? `<img src="${form.doctorSignatureBase64}" alt="Hekim İmzası" style="max-height: 48px; max-width: 95%; object-fit: contain;" />`
                : `<div style="text-align: center;"><span style="font-size: 7.5pt; color: #94a3b8; font-style: italic; display: block;">Dt. Kaşe ve İmza Alanı</span><span style="font-size: 7pt; color: #64748b;">${form.doctorName || 'Dt. M. Selman'}</span></div>`
            }
          </div>
          <div style="font-size: 7pt; color: #0d9488; text-align: center; font-weight: 600;">
            ${form.doctorSignatureBase64 ? 'Elektronik Hekim İmzası ile Onaylanmıştır' : 'TenaxLine Diş Hekimliği Kadrosu'}
          </div>
        </td>

        <!-- HASTA / VASİ -->
        <td class="sig-cell-patient">
          <table class="sig-inner-table" style="border-bottom-color: #99f6e4;">
            <tr>
              <td style="text-align: left; vertical-align: middle;">
                <strong style="font-size: 8pt; color: #0f766e; text-transform: uppercase;">Onam Veren Hasta / Vasi</strong>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <span style="background: #10b981; color: #ffffff; font-size: 6.5pt; font-weight: 700; padding: 2px 5px; border-radius: 3px;">
                  ✓ DİJİTAL ONAYLI
                </span>
              </td>
            </tr>
          </table>
          <div style="font-size: 7.5pt; color: #334155; margin-bottom: 1px;">
            <strong>Adı Soyadı:</strong> ${form.signerName || patientFullName}
          </div>
          <div style="font-size: 7pt; color: #64748b; margin-bottom: 3px; font-family: monospace;">
            <strong>Zaman Damgası:</strong> ${dateStr}
          </div>
          <div class="sig-canvas-box" style="border-color: #ccfbf1;">
            ${
              form.signatureBase64
                ? `<img src="${form.signatureBase64}" alt="Hasta İmzası" style="max-height: 48px; max-width: 95%; object-fit: contain;" />`
                : `<span style="font-size: 7.5pt; color: #94a3b8; font-style: italic;">İmza Görseli</span>`
            }
          </div>
          <div style="font-size: 7pt; color: #0f766e; text-align: center; font-weight: 600;">
            Parmak/Kalem İmzası ile Dijital Ortamda Kayıt Altına Alınmıştır
          </div>
        </td>
      </tr>
    </table>

    <!-- DİPNOT -->
    <div class="divider-line"></div>
    <table class="footer-table">
      <tr>
        <td style="text-align: left; vertical-align: middle;">
          Bu belge 1219 sayılı Tababet Kanunu, Hasta Hakları Yönetmeliği ve KVKK kapsamında tanzim edilmiştir.
        </td>
        <td style="text-align: right; vertical-align: middle; white-space: nowrap; font-family: monospace;">
          Sayfa 1/1 • TenaxLine Dental Suite
        </td>
      </tr>
    </table>

  </div>
</body>
</html>`;

  return { html, fileName, title: formTitle };
}

/**
 * Tarayıcının resmi ve dahili PDF / Yazdırma motorunu tetikler.
 * Hiçbir piksellenme veya kayma olmadan %100 vektörel A4 çıktısı sağlar.
 */
export async function downloadConsentPdf(form: ConsentFormData, patient: PatientDataForPdf = {}): Promise<boolean> {
  const { html, fileName } = generateConsentPrintHtml(form, patient);

  return new Promise((resolve) => {
    // Görünmez bir iframe ile mevcut sayfayı bozmadan doğrudan yazdırma/PDF diyaloğunu açar
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      // Iframe desteklenmezse yeni sekmede aç
      printConsentForm(form, patient);
      resolve(true);
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    // İmzalar ve görseller yüklendikten sonra pencereyi tetikle
    const triggerPrint = async () => {
      const imgs = Array.from(doc.images);
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((r) => {
            img.onload = r;
            img.onerror = r;
          });
        })
      );

      // Fontların ve düzenin oturması için kısa gecikme
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve(true);
        } catch {
          // Fallback
          printConsentForm(form, patient);
          resolve(true);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 30000);
        }
      }, 200);
    };

    triggerPrint();
  });
}

/**
 * Belgeyi tarayıcının yazdırma/PDF penceresine yönlendirir.
 */
export function printConsentForm(form: ConsentFormData, patient: PatientDataForPdf = {}) {
  const { html } = generateConsentPrintHtml(form, patient);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Lütfen tarayıcınızın açılır pencere (pop-up) engelleyicisini kapatınız.');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };
}
