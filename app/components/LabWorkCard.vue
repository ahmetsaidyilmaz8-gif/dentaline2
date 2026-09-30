<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
  >
    <!-- Üst Başlık & Durum Rozeti -->
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <h4 class="font-bold text-base text-slate-800 dark:text-slate-100">
            {{ labItem.workType }}
          </h4>
          <!-- Diş Numaraları Çipleri -->
          <span
            v-if="labItem.toothNumbers && labItem.toothNumbers.length > 0"
            class="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-mono font-bold text-xs border border-teal-200/60 dark:border-teal-800"
          >
            Diş: {{ labItem.toothNumbers.join(', ') }}
          </span>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-2">
          <span class="font-semibold text-slate-600 dark:text-slate-300">{{ labItem.patientName }}</span>
          <span>•</span>
          <span>Teknisyen / Lab: <strong>{{ labItem.labName }}</strong></span>
        </p>
      </div>

      <!-- Durum Rozeti -->
      <span
        :class="[
          statusConfig[labItem.status]?.badgeClass || 'bg-slate-100 text-slate-600',
          'px-3 py-1 rounded-full text-xs font-bold shrink-0 border'
        ]"
      >
        {{ statusConfig[labItem.status]?.label || labItem.status }}
      </span>
    </div>

    <!-- Detay Bilgileri Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs border border-slate-100 dark:border-slate-800/60">
      <div>
        <span class="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Renk / Ton</span>
        <span class="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block font-mono">
          {{ labItem.shadeColor || 'A2' }}
        </span>
      </div>

      <div>
        <span class="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Gönderim Tarihi</span>
        <span class="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 block">
          {{ formatDate(labItem.sentDate) }}
        </span>
      </div>

      <div>
        <span class="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Beklenen Teslim</span>
        <span
          :class="[
            isOverdue(labItem.expectedDate, labItem.status) ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-200 font-semibold',
            'mt-0.5 block'
          ]"
        >
          {{ formatDate(labItem.expectedDate) }}
          <span v-if="isOverdue(labItem.expectedDate, labItem.status)" class="text-[10px] block text-rose-500">Gecikti</span>
        </span>
      </div>

      <div>
        <span class="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Lab Ücreti</span>
        <span class="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block font-mono">
          {{ labItem.price ? formatCurrency(labItem.price) : '—' }}
        </span>
      </div>
    </div>

    <!-- Notlar Varsa -->
    <div v-if="labItem.notes" class="text-xs text-slate-500 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-xl p-2.5 flex items-start gap-2">
      <Icon name="heroicons:information-circle" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <span>{{ labItem.notes }}</span>
    </div>

    <!-- Aksiyon Butonları -->
    <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
      <!-- Durum Değiştirme Butonları -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- 1. Teknisyende -> Kliniğe Geldi -->
        <button
          v-if="labItem.status === 'sent'"
          type="button"
          @click="changeStatus('received')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Icon name="heroicons:check-circle" class="w-4 h-4" />
          <span>✓ Kliniğe Geldi Olarak İşaretle</span>
        </button>

        <!-- 2. Kliniğe Ulaştı Durumundaki Eylemler -->
        <template v-if="labItem.status === 'received'">
          <!-- WhatsApp Bildirim Butonu -->
          <button
            type="button"
            @click="notifyPatientWhatsApp"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all active:scale-95"
            title="Hastaya WhatsApp'la işin kliniğe ulaştığını bildir"
          >
            <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" />
            <span>💬 Hastaya WhatsApp'la Bildir</span>
          </button>

          <!-- Hastaya Takıldı Butonu -->
          <button
            type="button"
            @click="changeStatus('fitted')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all active:scale-95"
          >
            <Icon name="heroicons:check" class="w-4 h-4" />
            <span>Hastaya Takıldı</span>
          </button>

          <!-- Revizyona Gönder Butonu -->
          <button
            type="button"
            @click="changeStatus('revision')"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold transition-all"
          >
            <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" />
            <span>Revizyona Gönder</span>
          </button>
        </template>

        <!-- 3. Revizyonda ise Tekrar Geldi Butonu -->
        <button
          v-if="labItem.status === 'revision'"
          type="button"
          @click="changeStatus('received')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
        >
          <Icon name="heroicons:arrow-path" class="w-4 h-4" />
          <span>✓ Revizyondan Geldi</span>
        </button>

        <!-- 4. Tamamlanmış (Fitted) Durumunda Geri Alma Butonu -->
        <button
          v-if="labItem.status === 'fitted'"
          type="button"
          @click="changeStatus('received')"
          class="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium transition-colors"
        >
          <Icon name="heroicons:arrow-uturn-left" class="w-3.5 h-3.5" />
          <span>Durumu Geri Al</span>
        </button>
      </div>

      <!-- Sağ Eylemler: Sil & Düzenle -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          @click="$emit('edit', labItem)"
          class="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
          title="Laboratuvar İşini Düzenle"
        >
          <Icon name="heroicons:pencil-square" class="w-4 h-4" />
        </button>
        <button
          type="button"
          @click="$emit('delete', labItem._id)"
          class="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          title="Laboratuvar İşini Sil"
        >
          <Icon name="heroicons:trash" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  labItem: { type: Object, required: true },
  patientPhone: { type: String, default: '' }
});

const emit = defineEmits(['status-change', 'delete', 'edit']);

const statusConfig = {
  sent: {
    label: 'Teknisyende',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  },
  received: {
    label: 'Kliniğe Ulaştı',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  fitted: {
    label: 'Hastaya Takıldı',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
  },
  revision: {
    label: 'Revizyonda',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const formatCurrency = (val) => {
  if (!val) return '0 ₺';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
};

const isOverdue = (expectedDate, status) => {
  if (!expectedDate || status === 'fitted' || status === 'received') return false;
  return new Date(expectedDate) < new Date(new Date().setHours(0, 0, 0, 0));
};

const changeStatus = (newStatus) => {
  emit('status-change', { id: props.labItem._id, status: newStatus });
};

// WhatsApp ile Bildir
const notifyPatientWhatsApp = () => {
  const phone = props.patientPhone;
  if (!phone) {
    alert("Hastaya ait kayıtlı telefon numarası bulunamadı.");
    return;
  }

  const patientName = props.labItem.patientName || 'Hastamız';
  const teethStr = props.labItem.toothNumbers && props.labItem.toothNumbers.length > 0 
    ? ` (${props.labItem.toothNumbers.join(', ')} no'lu diş)` 
    : '';

  const message = `Sayın ${patientName}, laboratuvara gönderilen ${props.labItem.workType}${teethStr} işiniz kliniğimize ulaşmıştır. Prova ve yapıştırma seansınız için randevu oluşturmak üzere bize yazabilirsiniz.`;
  
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
  if (!cleanPhone.startsWith('90')) cleanPhone = '90' + cleanPhone;

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
</script>
