<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    @click.self="onClose"
  >
    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[94vh] overflow-y-auto flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Başlık Alanı -->
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Icon name="heroicons:document-check" class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-slate-800 dark:text-white">TDB Standart Aydınlatılmış Onam Formu</h3>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60">
                Hukuki & Malpraktis Güvencesi
              </span>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Hasta: <strong class="text-slate-700 dark:text-slate-200">{{ patientName }}</strong>
            </p>
          </div>
        </div>
        <button
          @click="onClose"
          class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Onam Türü ve Diş No Seçimi -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="sm:col-span-2 space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Onam Türü Seçiniz
          </label>
          <select
            v-model="selectedFormType"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          >
            <option value="endodonti">1. Endodontik Tedavi (Kanal Tedavisi) Onamı</option>
            <option value="cerrahi">2. Cerrahi ve Diş Çekimi (Gömülü 20'lik Dahil) Onamı</option>
            <option value="implant">3. Dental İmplant Cerrahisi Onamı</option>
            <option value="sabit_protez">4. Sabit Protez (Zirkonyum, E-Max, Köprü) Onamı</option>
            <option value="hareketli_protez">5. Hareketli Protez (Damak, Çıtçıtlı Protez) Onamı</option>
            <option value="restoratif">6. Restoratif Diş Tedavisi (Dolgu / İnley-Onley) Onamı</option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>🦷 Diş No</span>
          </label>
          <input
            v-model="toothNumber"
            type="text"
            placeholder="Örn: 16, 21, 46"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:font-normal"
          />
        </div>
      </div>

      <!-- A. Ortak Üst Hüküm (Her Formun Başında Otomatik Yer Alır) -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
            <Icon name="heroicons:shield-check" class="w-4 h-4" />
            <span>Ortak Üst Hüküm (Ücret Mutabakatı & Biyolojik Risk Beyanı)</span>
          </span>
          <span class="text-[10px] text-slate-400">Tüm formlar için zorunlu</span>
        </div>
        <div class="p-3.5 bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/40 rounded-2xl text-xs leading-relaxed text-teal-950 dark:text-teal-200 font-medium">
          {{ COMMON_CONSENT_HEADER }}
        </div>
      </div>

      <!-- B. Seçilen Tedaviye Özgü Uygulama ve Komplikasyon/Risk Metinleri -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 text-amber-500" />
            <span>{{ activeTemplate.title }} — Komplikasyonlar & Riskler</span>
          </label>
          <span class="text-[11px] text-slate-400">Lütfen hastaya okutunuz</span>
        </div>

        <div
          class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs leading-relaxed text-slate-600 dark:text-slate-300 max-h-44 overflow-y-auto space-y-2.5 select-text"
        >
          <!-- Uygulama Özeti -->
          <div class="pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
            <strong class="text-slate-800 dark:text-slate-200 font-bold block mb-0.5">Uygulama:</strong>
            <p>{{ activeTemplate.application }}</p>
          </div>

          <!-- Komplikasyonlar -->
          <div>
            <strong class="text-slate-800 dark:text-slate-200 font-bold block mb-1">Olası Komplikasyonlar & Riskler:</strong>
            <ul class="space-y-1.5 pl-1">
              <li
                v-for="(risk, idx) in activeTemplate.risks"
                :key="idx"
                class="flex items-start gap-2 text-slate-600 dark:text-slate-300"
              >
                <span class="text-rose-500 font-black shrink-0 mt-0.5">•</span>
                <span>{{ risk }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Hasta Rıza Beyanı ("Okudum, anladım, kabul ediyorum") -->
      <div class="space-y-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-900/60 rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Icon name="heroicons:shield-check" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Yasal Rıza Beyanı ("Okudum, anladım, kabul ediyorum")</span>
            </label>
            <p class="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-0.5">
              Sağlık Bakanlığı & TDB mevzuatı uyarınca ispat yükümlülüğü için zorunlu hasta beyanıdır.
            </p>
          </div>

          <!-- Mod Seçimi (Hızlı Onay vs Manuel Kalemle Çizim) -->
          <div class="inline-flex p-0.5 bg-amber-200/50 dark:bg-amber-900/40 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              @click="acceptanceMode = 'quick'"
              :class="[
                acceptanceMode === 'quick'
                  ? 'bg-white dark:bg-slate-800 text-amber-950 dark:text-amber-200 shadow-2xs'
                  : 'text-amber-800/80 dark:text-amber-300/80 hover:text-amber-950',
                'px-2.5 py-1 rounded-lg transition-all'
              ]"
            >
              ✓ Tek Tık / Klavye
            </button>
            <button
              type="button"
              @click="acceptanceMode = 'draw'"
              :class="[
                acceptanceMode === 'draw'
                  ? 'bg-white dark:bg-slate-800 text-amber-950 dark:text-amber-200 shadow-2xs'
                  : 'text-amber-800/80 dark:text-amber-300/80 hover:text-amber-950',
                'px-2.5 py-1 rounded-lg transition-all'
              ]"
            >
              ✍️ Manuel Çizim
            </button>
          </div>
        </div>

        <!-- 1. Hızlı Tek Tık / Onay Kutucuğu Modu (Varsayılan ve Tavsiye Edilen) -->
        <div v-if="acceptanceMode === 'quick'" class="space-y-2.5">
          <div
            @click="toggleAcceptanceCheck"
            class="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/60 cursor-pointer hover:border-amber-400 transition-all select-none group"
          >
            <input
              type="checkbox"
              id="acceptanceCheck"
              v-model="isAcceptanceChecked"
              @click.stop
              class="w-5 h-5 rounded-md border-amber-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <span class="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200 block group-hover:text-amber-800 dark:group-hover:text-amber-100 transition-colors">
                "Okudum, anladım, kabul ediyorum."
              </span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Hastanın aydınlatıldığını ve tedaviyi hür iradesiyle kabul ettiğini onaylar.
              </span>
            </div>
            <button
              type="button"
              @click.stop="quickFillAcceptance"
              class="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-lg transition-colors shrink-0 shadow-2xs border border-amber-300/60"
              title="Otomatik yaz"
            >
              ✍️ Otomatik Doldur
            </button>
          </div>

          <!-- Düzenlenebilir Metin Kutusu (İsterse klavyeden ekleme yapabilir) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>Beyan Metni (Düzenlenebilir):</span>
              <span class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ Otomatik dijital el yazısı olarak PDF'e işlenir
              </span>
            </div>
            <input
              v-model="acceptanceText"
              type="text"
              placeholder='Örn: "Okudum, anladım, kabul ediyorum."'
              @input="isAcceptanceChecked = Boolean(acceptanceText.trim())"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:font-normal font-sans"
            />
          </div>
        </div>

        <!-- 2. Manuel Ekrana Çizerek Yazma Modu (Opsiyonel / Kalemli Tabletler İçin) -->
        <div v-else class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-amber-800/80 dark:text-amber-400/80">
              Dijital kalem veya parmakla aşağıdaki kutucuğa yazınız:
            </span>
            <button
              type="button"
              @click="fillHandwrittenAcceptance"
              class="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-900 dark:text-amber-300 font-bold"
            >
              <Icon name="heroicons:sparkles" class="w-3.5 h-3.5" />
              <span>Örnek Yazı Ekle</span>
            </button>
          </div>
          <DigitalSignaturePad
            ref="acceptanceSigPadRef"
            heightClass="h-28 sm:h-32"
            placeholder='Parmağınız veya dijital kalemle "Okudum, anladım, kabul ediyorum" yazınız'
            lineLabel="✍️ Hasta Kendi El Yazısı Alanı"
            emptyPrompt='Lütfen kutu içine "Okudum, anladım, kabul ediyorum" yazınız'
            drawnPrompt="✓ Hasta el yazısı beyanı kaydedildi"
            badgeText="El Yazısı Alındı"
            clearBtnLabel="Yazıyı Temizle"
          />
        </div>
      </div>

      <!-- İmzalayan Kişi (Hasta veya Kanuni Vasi) -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          İmzalayan Adı Soyadı (Hasta veya Kanuni Vasi)
        </label>
        <input
          v-model="signerName"
          type="text"
          placeholder="İmzalayan kişi adı soyadı"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
        />
      </div>

      <!-- Dokunmatik İmza Alanı & Otomatik Zaman Damgası (Hasta / Vasi) -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Icon name="heroicons:pencil" class="w-3.5 h-3.5 text-teal-600" />
            <span>Hasta / Vasi İmzası</span>
          </label>
          <span class="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            İmzalanma Zamanı: {{ currentTimeStamp }}
          </span>
        </div>

        <DigitalSignaturePad ref="sigPadRef" />
      </div>

      <!-- Hekim Bilgisi & Dijital Hekim İmzası -->
      <div class="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
              Dt
            </div>
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Bilgilendiren Diş Hekimi ve İmza
              </h4>
              <p class="text-[11px] text-slate-400 dark:text-slate-500">
                Hekim dijital imza ve kaşe alanı
              </p>
            </div>
          </div>
          <span class="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 px-2 py-0.5 rounded-md">
            Hekim Dijital Onayı
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Hekim Adı Soyadı
            </label>
            <input
              v-model="doctorName"
              type="text"
              placeholder="Dt. M. Selman"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            />
            <p class="text-[10px] text-slate-400 mt-1">
              Kliniğin uygulayıcı hekimi
            </p>
          </div>

          <div class="sm:col-span-2 space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Icon name="heroicons:pencil" class="w-3.5 h-3.5 text-teal-600" />
                <span>Hekim Dijital İmzası</span>
              </label>
            </div>
            <DigitalSignaturePad ref="doctorSigPadRef" />
          </div>
        </div>
      </div>

      <!-- Alt Butonlar -->
      <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
        <button
          type="button"
          @click="onClose"
          class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold transition-colors"
        >
          Vazgeç
        </button>

        <button
          type="button"
          :disabled="isSubmitting"
          @click="handleSave(true)"
          class="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          title="Kaydet ve derhal PDF olarak indir"
        >
          <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <Icon v-else name="heroicons:arrow-down-tray" class="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Kaydet & PDF İndir</span>
        </button>

        <button
          type="button"
          :disabled="isSubmitting"
          @click="handleSave(false)"
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <Icon v-else name="heroicons:check" class="w-4 h-4" />
          <span>Onayla ve Kaydet</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import DigitalSignaturePad from './DigitalSignaturePad.vue';
import { COMMON_CONSENT_HEADER, CONSENT_TEMPLATES } from '~/constants/consentForms';
import { downloadConsentPdf } from '~/utils/consentPdf';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true }
});

const emit = defineEmits(['close', 'saved']);

const sigPadRef = ref(null);
const doctorSigPadRef = ref(null);
const acceptanceSigPadRef = ref(null);
const acceptanceMode = ref('quick'); // 'quick' (tek tık/klavye) veya 'draw' (manuel çizim)
const isAcceptanceChecked = ref(true);
const selectedFormType = ref('endodonti');
const toothNumber = ref('');
const acceptanceText = ref('Okudum, anladım, kabul ediyorum.');
const signerName = ref('');
const doctorName = ref('Dt. M. Selman');
const isSubmitting = ref(false);
const currentTimeStamp = ref('');
let timer = null;

const updateTimeStamp = () => {
  currentTimeStamp.value = new Date().toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const toggleAcceptanceCheck = () => {
  isAcceptanceChecked.value = !isAcceptanceChecked.value;
  if (isAcceptanceChecked.value && !acceptanceText.value.trim()) {
    acceptanceText.value = 'Okudum, anladım, kabul ediyorum.';
  }
};

const quickFillAcceptance = () => {
  isAcceptanceChecked.value = true;
  acceptanceText.value = 'Okudum, anladım, kabul ediyorum.';
};

const fillHandwrittenAcceptance = () => {
  acceptanceSigPadRef.value?.writeText('Okudum, anladım, kabul ediyorum.');
};

// Yargıtay ve Sağlık Bakanlığı ispat kriteri için şık el yazısı formatında görsel üretir
const generateHandwrittenBase64 = (text) => {
  if (typeof document === 'undefined') return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'italic 600 26px "Segoe Script", "Brush Script MT", "Caveat", "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-0.015);
    ctx.fillText(text, 0, 0);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('El yazısı görseli üretilemedi:', err);
    return '';
  }
};

const activeTemplate = computed(() => {
  return CONSENT_TEMPLATES[selectedFormType.value] || CONSENT_TEMPLATES.endodonti;
});

watch(() => props.patientName, (newVal) => {
  if (newVal && !signerName.value) {
    signerName.value = newVal;
  }
}, { immediate: true });

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    signerName.value = props.patientName;
    acceptanceMode.value = 'quick';
    isAcceptanceChecked.value = true;
    acceptanceText.value = 'Okudum, anladım, kabul ediyorum.';
    toothNumber.value = '';
    if (!doctorName.value) doctorName.value = 'Dt. M. Selman';
    updateTimeStamp();
    setTimeout(() => {
      sigPadRef.value?.clear();
      doctorSigPadRef.value?.clear();
      acceptanceSigPadRef.value?.clear();
    }, 100);
  }
});

const onClose = () => {
  emit('close');
};

const handleSave = async (downloadPdf = false) => {
  // 1. Rıza Beyanı Kontrolü
  if (acceptanceMode.value === 'quick') {
    if (!isAcceptanceChecked.value && !acceptanceText.value.trim()) {
      alert('Lütfen "Okudum, anladım, kabul ediyorum" onay kutucuğunu işaretleyiniz veya beyanınızı yazınız.');
      return;
    }
  } else {
    const isPadDrawn = acceptanceSigPadRef.value && !acceptanceSigPadRef.value.isEmpty();
    if (!isPadDrawn && !acceptanceText.value.trim()) {
      alert('Lütfen el yazısı alanına yazınızı yazınız veya "Tek Tıkla Onay" moduna geçiniz.');
      return;
    }
  }

  // 2. İmza Kontrolü
  if (!sigPadRef.value || sigPadRef.value.isEmpty()) {
    alert("Lütfen önce hasta/vasi imza kutusuna imzanızı atınız.");
    return;
  }

  if (!signerName.value.trim()) {
    alert("Lütfen imzalayan kişi adını giriniz.");
    return;
  }

  isSubmitting.value = true;
  try {
    const signatureImage = sigPadRef.value.toDataURL('image/png');
    const doctorSignatureImage = doctorSigPadRef.value && !doctorSigPadRef.value.isEmpty()
      ? doctorSigPadRef.value.toDataURL('image/png')
      : '';

    let acceptanceSignatureImage = '';
    if (acceptanceMode.value === 'quick') {
      const textToRender = acceptanceText.value.trim() || 'Okudum, anladım, kabul ediyorum.';
      acceptanceSignatureImage = generateHandwrittenBase64(textToRender);
    } else {
      acceptanceSignatureImage = acceptanceSigPadRef.value && !acceptanceSigPadRef.value.isEmpty()
        ? acceptanceSigPadRef.value.toDataURL('image/png')
        : generateHandwrittenBase64(acceptanceText.value.trim() || 'Okudum, anladım, kabul ediyorum.');
    }
    const template = activeTemplate.value;
    const now = new Date();
    const formattedDate = now.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // TDB tam yasal metin derlemesi
    const fullContent = [
      `[ORTAK ÜST HÜKÜM / ÜCRET & BİYOLOJİK RİSK MUTABAKATI]`,
      COMMON_CONSENT_HEADER,
      ``,
      `[UYGULAMA]`,
      template.application,
      ...(toothNumber.value.trim() ? [`İlgili Diş No: ${toothNumber.value.trim()}`] : []),
      ``,
      `[KOMPLİKASYONLAR VE RİSKLER]`,
      ...template.risks.map(r => `• ${r}`),
      ``,
      `[HASTA RIZA VE ONAY BEYANI]`,
      `"${acceptanceText.value.trim() || 'Okudum, anladım, kabul ediyorum.'}"`,
      template.text
    ].join('\n');

    const payload = {
      patientId: props.patientId,
      patientName: props.patientName,
      formType: selectedFormType.value,
      formTitle: template.title,
      toothNumber: toothNumber.value.trim(),
      acceptanceText: acceptanceText.value.trim() || 'Okudum, anladım, kabul ediyorum.',
      acceptanceSignatureBase64: acceptanceSignatureImage,
      doctorName: doctorName.value.trim() || 'Dt. M. Selman',
      doctorSignatureBase64: doctorSignatureImage,
      contentSummary: fullContent,
      signatureBase64: signatureImage,
      signerName: signerName.value.trim(),
      signedAt: now,
      signedAtFormatted: formattedDate
    };

    const res = await $fetch('/api/consent-forms', {
      method: 'POST',
      body: payload
    });

    if (downloadPdf) {
      try {
        await downloadConsentPdf(res, { firstName: props.patientName });
      } catch (err) {
        console.error('PDF indirme hatası:', err);
      }
    }

    emit('saved', res);
    onClose();
  } catch (error) {
    console.error(error);
    alert(error?.data?.message || 'Onam formu kaydedilirken hata oluştu.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  updateTimeStamp();
  timer = setInterval(updateTimeStamp, 10000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
