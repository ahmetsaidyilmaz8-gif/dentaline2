<template>
  <AppModal
    :isOpen="isOpen"
    title="⏰ Yeni Hatırlatıcı Ekle"
    width="lg"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4 text-xs sm:text-sm">
      
      <!-- 1. Kategori Seçimi (Tedavi vs Ödeme vs Genel) -->
      <div>
        <label class="block font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider text-[11px]">
          Hatırlatıcı Türü
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            type="button"
            @click="category = 'treatment'"
            :class="[
              category === 'treatment'
                ? 'bg-teal-500/15 border-teal-500 text-teal-700 dark:text-teal-300 font-bold ring-2 ring-teal-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
              'py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all'
            ]"
          >
            <span>🦷</span>
            <span>Tedavi</span>
          </button>

          <button
            type="button"
            @click="category = 'payment'"
            :class="[
              category === 'payment'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
              'py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all'
            ]"
          >
            <span>💳</span>
            <span>Ödeme</span>
          </button>

          <button
            type="button"
            @click="category = 'general'"
            :class="[
              category === 'general'
                ? 'bg-indigo-500/15 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold ring-2 ring-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
              'py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all'
            ]"
          >
            <span>📌</span>
            <span>Genel</span>
          </button>
        </div>
      </div>

      <!-- 2. Hasta Seçimi veya Bilgisi -->
      <div>
        <label class="block font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider text-[11px]">
          İlgili Hasta
        </label>
        
        <!-- Eğer hasta dışarıdan sabit geldiyse (örn. Hasta Detay Sayfası) -->
        <div
          v-if="initialPatientId || initialPatientName"
          class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
              👤
            </span>
            <div>
              <div class="font-bold text-slate-800 dark:text-white text-xs">
                {{ selectedPatientName || initialPatientName }}
              </div>
              <div v-if="selectedPatientPhone || initialPatientPhone" class="text-[10px] text-slate-400 font-mono">
                {{ selectedPatientPhone || initialPatientPhone }}
              </div>
            </div>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            Seçili Hasta
          </span>
        </div>

        <!-- Eğer hasta seçimi açıksa (Ödemeler sayfası veya Genel panel) -->
        <div v-else class="space-y-2">
          <PatientSearchSelect
            v-model="selectedPatientId"
            :patients="allPatients"
            placeholder="Hasta seçiniz veya arayınız..."
          />
          <div v-if="!selectedPatientId" class="flex items-center gap-2">
            <span class="text-[11px] text-slate-400">veya Serbest İsim:</span>
            <input
              type="text"
              v-model="manualPatientName"
              placeholder="İsimsiz hasta / Not için isim"
              class="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      <!-- 3. Serbest Not Alanı (Zorunlu) -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="block font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px]">
            Serbest Not / Açıklama <span class="text-rose-500">*</span>
          </label>
          <span class="text-[10px] text-slate-400">Örn: "Dycal+Ojenol kontrolü, daimi dolgu"</span>
        </div>
        <textarea
          v-model="note"
          rows="3"
          required
          :placeholder="notePlaceholder"
          class="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white outline-none resize-none transition-all leading-relaxed"
        ></textarea>

        <!-- Hızlı Şablon Etiketleri (Tıklayınca nota ekler) -->
        <div class="mt-1.5 flex flex-wrap gap-1.5">
          <button
            v-for="chip in currentChips"
            :key="chip"
            type="button"
            @click="appendChip(chip)"
            class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-300 text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700 transition-colors"
          >
            + {{ chip }}
          </button>
        </div>
      </div>

      <!-- 4. Hedef Tarih -->
      <div>
        <label class="block font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider text-[11px]">
          Hedef Tarih <span class="text-rose-500">*</span>
        </label>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="date"
            v-model="targetDate"
            required
            class="py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs sm:text-sm outline-none focus:border-teal-500"
          />
          
          <!-- Hızlı Tarih Seçim Butonları -->
          <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              @click="addDaysToTarget(3)"
              class="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap"
            >
              +3 Gün
            </button>
            <button
              type="button"
              @click="addDaysToTarget(7)"
              class="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap"
            >
              +1 Hafta
            </button>
            <button
              type="button"
              @click="addDaysToTarget(15)"
              class="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap"
            >
              +15 Gün
            </button>
            <button
              type="button"
              @click="addDaysToTarget(30)"
              class="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap"
            >
              +1 Ay
            </button>
          </div>
        </div>
      </div>

      <!-- 5. Önceden Uyarı (Lead Days) -->
      <div>
        <label class="block font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider text-[11px]">
          Önceden Uyarı (Zil Paneline Ne Zaman Düşsün?)
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          <button
            v-for="opt in leadOptions"
            :key="opt.value"
            type="button"
            @click="leadDays = opt.value"
            :class="[
              leadDays === opt.value
                ? 'bg-teal-600 text-white font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium',
              'py-2 px-1.5 rounded-xl text-center text-xs transition-all flex flex-col items-center justify-center'
            ]"
          >
            <span>{{ opt.label }}</span>
            <span class="text-[9px] opacity-80">{{ opt.sub }}</span>
          </button>
        </div>
      </div>

      <!-- 6. Dinamik Bilgi Kutusu: Bildirimin zile düşeceği tarih -->
      <div class="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2">
        <span class="text-base shrink-0">🔔</span>
        <div>
          <span class="font-bold">Zil Bildirimi Tarihi: </span>
          <span class="font-bold underline">{{ formattedReminderDate }}</span>
          <p class="text-[11px] opacity-80 mt-0.5">
            Bu tarihten itibaren üstteki bildirim zili panelinde ve kırmızı sayaçta görünecektir.
          </p>
        </div>
      </div>

      <!-- Modal Aksiyon Butonları -->
      <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          @click="$emit('close')"
          :disabled="isSubmitting"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Vazgeç
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <Icon v-else name="heroicons:check" class="w-4 h-4" />
          <span>{{ isSubmitting ? 'Kaydediliyor...' : 'Hatırlatıcıyı Kaydet' }}</span>
        </button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useReminders } from '~/composables/useReminders';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  initialCategory: {
    type: String,
    default: 'treatment'
  },
  initialPatientId: {
    type: String,
    default: ''
  },
  initialPatientName: {
    type: String,
    default: ''
  },
  initialPatientPhone: {
    type: String,
    default: ''
  },
  initialNote: {
    type: String,
    default: ''
  },
  initialTargetDate: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'created']);

const { createReminder } = useReminders();

const category = ref<'treatment' | 'payment' | 'general'>('treatment');
const selectedPatientId = ref('');
const manualPatientName = ref('');
const note = ref('');
const targetDate = ref('');
const leadDays = ref(0);
const isSubmitting = ref(false);
const allPatients = ref<any[]>([]);

// Hızlı Şablon Etiketleri
const treatmentChips = [
  'Dycal+Ojenol kontrolü, daimi dolgu',
  'Dikiş alma & iyileşme kontrolü',
  'Kanal pansuman değişimi',
  'Geçici kuron değişimi / prova',
  'İmplant kemik kontrolü'
];

const paymentChips = [
  '3.500 TL ödeme',
  'Kalan tedavi borcu tahsilatı',
  'Taksit ödemesi kontrolü',
  'Laboratuvar bedeli ödemesi',
  'Elden nakit ödeme sözü'
];

const generalChips = [
  'Röntgen kontrolü',
  'Hasta durumunu telefonla sorgula',
  'Reçete & antibiyotik takibi',
  'Konsültasyon kontrolü'
];

const currentChips = computed(() => {
  if (category.value === 'treatment') return treatmentChips;
  if (category.value === 'payment') return paymentChips;
  return generalChips;
});

const notePlaceholder = computed(() => {
  if (category.value === 'treatment') return 'Örn: Dycal+Ojenol kontrolü, daimi dolgu yapılacak...';
  if (category.value === 'payment') return 'Örn: 3.500 TL kalan ödeme tahsil edilecek...';
  return 'Örn: Hasta durum kontrolü, reçete takibi...';
});

const leadOptions = [
  { label: 'Aynı Gün', sub: 'Tam vaktinde', value: 0 },
  { label: '1 Gün Önce', sub: '24 saat önce', value: 1 },
  { label: '2 Gün Önce', sub: '48 saat önce', value: 2 },
  { label: '3 Gün Önce', sub: '3 gün önce', value: 3 },
  { label: '1 Hafta', sub: '7 gün önce', value: 7 }
];

// Tarihe gün ekleme
const addDaysToTarget = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  targetDate.value = `${y}-${m}-${day}`;
};

// Seçili hasta detayları
const selectedPatient = computed(() => {
  return allPatients.value.find(p => p._id === selectedPatientId.value);
});

const selectedPatientName = computed(() => {
  if (selectedPatient.value) {
    return `${selectedPatient.value.firstName} ${selectedPatient.value.lastName}`;
  }
  return manualPatientName.value;
});

const selectedPatientPhone = computed(() => {
  return selectedPatient.value?.phone || '';
});

// Hatırlatma Tarihi Hesaplama (targetDate - leadDays)
const calculatedReminderDate = computed(() => {
  if (!targetDate.value) return '';
  const parts = targetDate.value.split('-').map(Number);
  if (parts.length < 3) return targetDate.value;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() - (Number(leadDays.value) || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
});

const formattedReminderDate = computed(() => {
  if (!calculatedReminderDate.value) return 'Tarih seçiniz';
  const parts = calculatedReminderDate.value.split('-');
  if (parts.length < 3) return calculatedReminderDate.value;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
});

const appendChip = (chipText: string) => {
  if (!note.value) {
    note.value = chipText;
  } else if (!note.value.includes(chipText)) {
    note.value = `${note.value} • ${chipText}`;
  }
};

// Hastaları yükle
const loadPatients = async () => {
  try {
    const res: any = await $fetch('/api/patients');
    if (Array.isArray(res)) {
      allPatients.value = res;
    }
  } catch (err) {
    console.error('Hastalar yüklenemedi:', err);
  }
};

// Props değiştiğinde formu sıfırla / ayarla
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      category.value = (props.initialCategory as any) || 'treatment';
      selectedPatientId.value = props.initialPatientId || '';
      manualPatientName.value = props.initialPatientName || '';
      note.value = props.initialNote || '';
      
      if (props.initialTargetDate) {
        targetDate.value = props.initialTargetDate;
      } else {
        // Varsayılan: 7 gün sonra
        addDaysToTarget(7);
      }
      leadDays.value = 1; // Varsayılan 1 gün önce uyarı
    }
  },
  { immediate: true }
);

onMounted(() => {
  loadPatients();
});

const handleSubmit = async () => {
  if (!note.value.trim()) return;
  if (!targetDate.value) return;

  try {
    isSubmitting.value = true;
    const finalPatientId = selectedPatientId.value || props.initialPatientId || undefined;
    const finalPatientName = selectedPatientName.value || props.initialPatientName || undefined;
    const finalPatientPhone = selectedPatientPhone.value || props.initialPatientPhone || undefined;

    const created = await createReminder({
      category: category.value,
      note: note.value.trim(),
      targetDate: targetDate.value,
      leadDays: Number(leadDays.value) || 0,
      patientId: finalPatientId,
      patientName: finalPatientName,
      patientPhone: finalPatientPhone
    });

    emit('created', created);
    emit('close');
  } catch (error) {
    console.error('Hatırlatıcı kaydedilemedi:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
