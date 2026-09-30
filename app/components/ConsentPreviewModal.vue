<template>
  <AppModal
    :isOpen="isOpen"
    title="Aydınlatılmış Onam Belgesi Detayı & PDF"
    width="xl"
    @close="$emit('close')"
  >
    <div v-if="form" class="space-y-4">
      <!-- Belge Önizleme Kağıdı -->
      <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 select-text">
        <!-- Başlık -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-teal-600 pb-3 gap-2">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
              ✦
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900 leading-tight">
                TENAXLINE AĞIZ VE DİŞ SAĞLIĞI POLİKLİNİĞİ
              </h3>
              <p class="text-[11px] font-semibold text-teal-600 tracking-wide uppercase">
                Özel Sağlık Hizmetleri & Diş Hekimliği Kliniği
              </p>
            </div>
          </div>
          <div class="text-left sm:text-right">
            <span class="inline-block bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
              TDB Standart Belge
            </span>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">
              Ref: <strong class="text-slate-700">{{ form._id ? 'ONAM-' + form._id.slice(-8).toUpperCase() : 'ONAM-YENİ' }}</strong>
            </div>
            <div class="text-[10px] text-slate-500">
              Tarih: <strong class="text-slate-700">{{ form.signedAtFormatted || formattedDate }}</strong>
            </div>
          </div>
        </div>

        <!-- Belge Başlığı -->
        <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
          <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {{ form.formTitle || 'Aydınlatılmış Onam Formu' }}
          </h4>
          <p class="text-[11px] text-slate-500 mt-0.5">
            Hasta Aydınlatılmış Onam, Hekim Malpraktis ve Tedavi Ücret Mutabakatı
          </p>
        </div>

        <!-- Hasta Bilgileri -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-100/70 border border-slate-200 rounded-xl p-3 text-xs">
          <div>
            <span class="text-[10px] font-bold uppercase text-slate-500 block">Hasta Adı</span>
            <strong class="text-slate-900">{{ patientFullName }}</strong>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase text-slate-500 block">T.C. Kimlik No</span>
            <strong class="text-slate-900 font-mono">{{ patient?.tcNo || 'Belirtilmemiş' }}</strong>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase text-slate-500 block">İletişim</span>
            <strong class="text-slate-900 font-mono">{{ patient?.phone || 'Belirtilmemiş' }}</strong>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase text-slate-500 block">İlgili Diş No</span>
            <strong class="text-teal-700 font-bold font-mono">{{ form.toothNumber ? '🦷 ' + form.toothNumber : 'Genel / Belirtilmemiş' }}</strong>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase text-slate-500 block">İmzalayan Kişi</span>
            <strong class="text-slate-900">{{ form.signerName || patientFullName }}</strong>
          </div>
        </div>

        <!-- 1. Ortak Üst Hüküm -->
        <div class="border-l-4 border-teal-600 pl-3 space-y-1">
          <h5 class="text-xs font-bold text-teal-700 uppercase tracking-wider">
            1. Genel Bilgilendirme, Ücret Mutabakatı ve Biyolojik Risk Beyanı
          </h5>
          <p class="text-xs text-slate-600 leading-relaxed text-justify">
            {{ COMMON_CONSENT_HEADER }}
          </p>
        </div>

        <!-- 2. Uygulama Detayı -->
        <div class="border-l-4 border-blue-500 pl-3 space-y-1">
          <h5 class="text-xs font-bold text-blue-700 uppercase tracking-wider">
            2. Planlanan Tedavi ve Müdahale Detayı (Uygulama)
          </h5>
          <p class="text-xs text-slate-600 leading-relaxed">
            {{ activeTemplate?.application || 'Hastanın durumuna uygun diş hekimliği tedavisi ve restoratif/cerrahi müdahale yapılması.' }}
            <span v-if="form.toothNumber" class="font-bold text-blue-900 ml-1">
              (İşlem Yapılacak Diş No: {{ form.toothNumber }})
            </span>
          </p>
        </div>

        <!-- 3. Riskler ve Komplikasyonlar -->
        <div class="border-l-4 border-rose-500 pl-3 space-y-1">
          <h5 class="text-xs font-bold text-rose-700 uppercase tracking-wider">
            3. Tedaviye Özgü Olası Riskler, Yan Etkiler ve Komplikasyonlar
          </h5>
          <ul class="text-xs text-slate-600 space-y-1 pl-1">
            <li v-for="(risk, idx) in risksList" :key="idx" class="flex items-start gap-1.5">
              <span class="text-rose-500 font-bold">•</span>
              <span>{{ risk }}</span>
            </li>
          </ul>
        </div>

        <!-- 4. Yasal Rıza Beyanı -->
        <div class="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
          <h5 class="text-xs font-bold text-amber-800 uppercase tracking-wider">
            4. Hasta Rıza, Onay ve Taahhüt Beyanı
          </h5>
          <!-- Hasta El Yazısı / Onay Metni -->
          <div v-if="form.acceptanceSignatureBase64 || form.acceptanceText" class="p-3 bg-white border border-amber-300 rounded-xl space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Hasta Kendi El Yazısı Beyanı (Parmak / Dijital Kalem İle):
              </span>
              <span class="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                ✓ Biyometrik El Yazısı
              </span>
            </div>
            <div v-if="form.acceptanceSignatureBase64" class="h-16 bg-amber-50/30 border border-amber-200/80 rounded-lg flex items-center justify-center p-1 overflow-hidden">
              <img
                :src="form.acceptanceSignatureBase64"
                alt="Hasta El Yazısı Beyanı"
                class="max-h-14 w-auto object-contain"
              />
            </div>
            <p v-else class="text-xs font-bold text-amber-950 italic">"{{ form.acceptanceText }}"</p>
          </div>
          <p class="text-xs text-amber-900 leading-relaxed">
            {{ activeTemplate?.text || 'Uygulanacak tedavi, riskler, alternatifler ve maliyet şartları tarafıma sözlü ve yazılı olarak anlatılmıştır. Tedaviyi onaylıyorum.' }}
          </p>
        </div>

        <!-- İmza Alanları -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <!-- Hekim Alanı -->
          <div class="border border-teal-200 rounded-xl p-3.5 bg-slate-50/50">
            <div class="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
              <strong class="text-xs text-slate-800 uppercase">Bilgilendiren Diş Hekimi</strong>
              <span class="px-1.5 py-0.5 rounded bg-teal-600 text-white text-[9px] font-bold">
                ✓ HEKİM DİJİTAL ONAYI
              </span>
            </div>
            <div class="text-xs text-slate-700 mb-1">
              <strong>Hekim Adı:</strong> {{ form.doctorName || 'Dt. M. Selman' }}
            </div>
            <div class="text-[10px] text-slate-500 mb-2">
              Hastaya yapılacak işlem, riskler, maliyet ve alternatifler ayrıntılı olarak anlatılmıştır.
            </div>
            <div class="h-14 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden">
              <img
                v-if="form.doctorSignatureBase64"
                :src="form.doctorSignatureBase64"
                alt="Hekim İmzası"
                class="max-h-12 w-auto object-contain"
              />
              <span v-else class="text-[10px] text-slate-400 italic">Dt. Kaşe ve İmza</span>
            </div>
            <div class="text-[10px] text-slate-500 text-center mt-1 font-medium">
              TenaxLine Diş Hekimliği Kadrosu
            </div>
          </div>

          <!-- Hasta / Vasi İmza Alanı -->
          <div class="border-2 border-teal-500 rounded-xl p-3.5 bg-teal-50/40">
            <div class="flex items-center justify-between border-b border-teal-200 pb-1.5 mb-2">
              <strong class="text-xs text-teal-800 uppercase">Onam Veren Hasta / Vasi</strong>
              <span class="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold">
                ✓ DİJİTAL ONAYLI
              </span>
            </div>
            <div class="text-xs text-slate-700 mb-1">
              <strong>Adı Soyadı:</strong> {{ form.signerName || patientFullName }}
            </div>
            <div class="text-[10px] text-slate-500 font-mono mb-2">
              <strong>Zaman Damgası:</strong> {{ form.signedAtFormatted || formattedDate }}
            </div>
            <div class="h-14 bg-white border border-teal-200 rounded-lg flex items-center justify-center p-1 overflow-hidden">
              <img
                v-if="form.signatureBase64"
                :src="form.signatureBase64"
                alt="Hasta İmzası"
                class="max-h-12 w-auto object-contain"
              />
              <span v-else class="text-[10px] text-slate-400 italic">İmza Yok</span>
            </div>
            <div class="text-[9px] text-teal-700 text-center mt-1 font-semibold">
              Parmak/Kalem İmzası ile Kayıt Altına Alınmıştır
            </div>
          </div>
        </div>

        <!-- Resmi Dipnot -->
        <div class="border-t border-slate-200 pt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-1">
          <span>Bu belge 1219 sayılı Kanun ve TDB etik kuralları çerçevesinde düzenlenmiştir.</span>
          <span class="font-mono">TenaxLine Dental Suite</span>
        </div>
      </div>
    </div>

    <!-- Modal Alt Butonları -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <button
          type="button"
          @click="handlePrint"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Icon name="heroicons:printer" class="w-4 h-4" />
          <span>Yazdır</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Kapat
          </button>
          <button
            type="button"
            :disabled="isDownloading"
            @click="handleDownload"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95"
          >
            <Icon v-if="isDownloading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <Icon v-else name="heroicons:arrow-down-tray" class="w-4 h-4" />
            <span>PDF Olarak İndir</span>
          </button>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { COMMON_CONSENT_HEADER, CONSENT_TEMPLATES } from '~/constants/consentForms';
import { downloadConsentPdf, printConsentForm } from '~/utils/consentPdf';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  form: { type: Object, default: null },
  patient: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['close']);

const isDownloading = ref(false);

const patientFullName = computed(() => {
  const p = props.patient || {};
  return `${p.firstName || ''} ${p.lastName || ''}`.trim() || props.form?.patientName || 'Hasta';
});

const activeTemplate = computed(() => {
  if (!props.form?.formType) return null;
  return CONSENT_TEMPLATES[props.form.formType] || null;
});

const risksList = computed(() => {
  if (activeTemplate.value?.risks) {
    return activeTemplate.value.risks;
  }
  return [
    'Lokal anesteziye bağlı geçici uyuşukluk veya hematom.',
    'Müdahale sonrası hafif ağrı veya hassasiyet.',
    'Biyolojik nedenlerle ek kontroller gerekebilme ihtimali.'
  ];
});

const formattedDate = computed(() => {
  if (props.form?.signedAt) {
    try {
      return new Date(props.form.signedAt).toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(props.form.signedAt);
    }
  }
  return new Date().toLocaleString('tr-TR');
});

const handleDownload = async () => {
  if (!props.form) return;
  isDownloading.value = true;
  try {
    await downloadConsentPdf(props.form, props.patient);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Onam formu PDF olarak başarıyla indirildi.', type: 'success' }
    }));
  } catch (err) {
    console.error(err);
    alert('PDF oluşturulurken bir hata meydana geldi.');
  } finally {
    isDownloading.value = false;
  }
};

const handlePrint = () => {
  if (!props.form) return;
  printConsentForm(props.form, props.patient);
};
</script>
