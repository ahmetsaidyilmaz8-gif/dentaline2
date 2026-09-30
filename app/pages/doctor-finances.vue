<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

useHead({
  title: 'Hekim Hak Edişleri & Kasa Havuzu - TenaxLine'
});

// State
const activeTab = ref<'finances' | 'doctors' | 'monthly'>('finances');
const isLoading = ref(true);
const isSubmitting = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

// Aylık Hekim Hak Ediş & İşlem Raporu State (1'inden Ay Sonuna Kadar)
const selectedReportDoctorId = ref<string>('all');
const selectedReportYear = ref<number>(new Date().getFullYear());
const selectedReportMonth = ref<string>(''); // örn: '2026-01'
const monthlyReportData = ref<any>(null);
const isMonthlyLoading = ref(false);
const activeTransactionSubTab = ref<'treatments' | 'payments' | 'payouts'>('treatments');
const treatmentSearchQuery = ref('');

// Veriler
const financesData = ref<any>({
  totalClinicCollections: 0,
  totalDoctorEarnings: 0,
  totalDoctorPayouts: 0,
  totalPendingDoctorEarnings: 0,
  totalClinicCash: 0,
  doctorBalances: [],
  recentPayouts: []
});


const doctorsList = ref<any[]>([]);
const searchDoctorQuery = ref('');
const doctorStatusFilter = ref<'all' | 'active' | 'inactive'>('all');

// Modallar
const isPayoutModalOpen = ref(false);
const isEditPayoutModalOpen = ref(false);
const isAddDoctorModalOpen = ref(false);
const isEditDoctorModalOpen = ref(false);
const isDeleteDoctorModalOpen = ref(false);

// Form State: Hekime Ödeme Yap
const payoutForm = ref({
  doctorId: '',
  amount: null as number | null,
  paymentMethod: 'cash',
  date: new Date().toISOString().split('T')[0],
  notes: ''
});

// Form State: Hekim Ödemesini Düzenle / Değiştir
const editPayoutForm = ref({
  id: '',
  doctorId: '',
  doctorName: '',
  amount: null as number | null,
  paymentMethod: 'cash',
  date: '',
  notes: ''
});


// Form State: Hekim Ekle / Düzenle
const doctorForm = ref({
  id: '',
  name: '',
  username: '',
  password: '',
  title: 'Diş Hekimi',
  phone: '',
  email: '',
  type: 'percentage' as 'percentage' | 'salary',
  rate: 30,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  isActive: true,
  notes: ''
});

const selectedDoctorForDelete = ref<any>(null);

// Bildirim temizleyici
function showNotification(type: 'success' | 'error', msg: string) {
  if (type === 'success') {
    successMsg.value = msg;
    errorMsg.value = '';
    setTimeout(() => { successMsg.value = ''; }, 4000);
  } else {
    errorMsg.value = msg;
    successMsg.value = '';
    setTimeout(() => { errorMsg.value = ''; }, 5000);
  }
}

// Para Formatı
function formatCurrency(val: number | undefined | null) {
  if (val === undefined || val === null) return '₺0';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(val);
}

// Tarih Formatı
function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return new Date(dateStr).toLocaleDateString('tr-TR');
  } catch {
    return dateStr;
  }
}

// Verileri Yükle
async function loadData() {
  isLoading.value = true;
  try {
    const [financesRes, doctorsRes] = await Promise.all([
      $fetch('/api/doctors/finances'),
      $fetch('/api/doctors')
    ]);

    financesData.value = financesRes || {};
    doctorsList.value = ((doctorsRes as any[]) || []).filter(
      (d: any) => !d.name?.toLowerCase().includes('klinik') && d.username !== 'klinik'
    );
    const msy = doctorsList.value.find((d: any) => d.name?.toLowerCase().includes('selman'));
    if (msy && (selectedReportDoctorId.value === 'all' || !selectedReportDoctorId.value)) {
      selectedReportDoctorId.value = msy._id;
    }
    await loadMonthlyReport();
  } catch (err: any) {
    showNotification('error', err.data?.message || 'Veriler yüklenirken hata oluştu.');
  } finally {
    isLoading.value = false;
  }
}

// Aylık Hekim Hak Ediş & İşlem Raporu Yükle
async function loadMonthlyReport(month?: string) {
  isMonthlyLoading.value = true;
  try {
    const params: any = {
      year: selectedReportYear.value,
      doctorId: selectedReportDoctorId.value
    };
    if (month !== undefined) {
      selectedReportMonth.value = month;
    }
    if (selectedReportMonth.value) {
      params.month = selectedReportMonth.value;
    }

    const res: any = await $fetch('/api/doctors/monthly-report', { params });
    monthlyReportData.value = res;
    if (!selectedReportMonth.value && res?.activeMonth?.month) {
      selectedReportMonth.value = res.activeMonth.month;
    }
  } catch (err: any) {
    showNotification('error', err.data?.message || 'Aylık hekim raporu yüklenemedi.');
  } finally {
    isMonthlyLoading.value = false;
  }
}

function switchToMonthlyTab(doctorId?: string) {
  if (doctorId) {
    selectedReportDoctorId.value = doctorId;
  }
  activeTab.value = 'monthly';
  loadMonthlyReport();
}

function selectMonthForDetail(monthStr: string) {
  selectedReportMonth.value = monthStr;
  loadMonthlyReport(monthStr);
  if (typeof document !== 'undefined') {
    setTimeout(() => {
      const el = document.getElementById('monthly-detail-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  }
}

function selectQuickPeriod(type: 'current' | 'previous' | 'all') {
  const now = new Date();
  const currentY = now.getFullYear();
  const currentM = now.getMonth() + 1;

  if (type === 'current') {
    selectedReportYear.value = currentY;
    const mStr = `${currentY}-${String(currentM).padStart(2, '0')}`;
    selectedReportMonth.value = mStr;
    loadMonthlyReport(mStr);
  } else if (type === 'previous') {
    let prevY = currentY;
    let prevM = currentM - 1;
    if (prevM === 0) {
      prevM = 12;
      prevY -= 1;
    }
    selectedReportYear.value = prevY;
    const mStr = `${prevY}-${String(prevM).padStart(2, '0')}`;
    selectedReportMonth.value = mStr;
    loadMonthlyReport(mStr);
  } else {
    selectedReportMonth.value = '';
    loadMonthlyReport('');
  }
}

function printMonthlyStatement() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

// Filtrelenmiş Aktif Ay Tedavi İşlemleri
const filteredActiveTreatments = computed(() => {
  const list = monthlyReportData.value?.activeMonthTransactions?.treatments || [];
  if (!treatmentSearchQuery.value.trim()) return list;
  const q = treatmentSearchQuery.value.toLowerCase();
  return list.filter((t: any) => {
    const pName = t.patient?.name?.toLowerCase() || '';
    const proc = t.procedure?.toLowerCase() || '';
    const tooth = t.tooth?.toLowerCase() || '';
    const notes = t.notes?.toLowerCase() || '';
    return pName.includes(q) || proc.includes(q) || tooth.includes(q) || notes.includes(q);
  });
});

onMounted(() => {
  loadData();
});


// Filtrelenmiş Hekim Listesi
const filteredDoctors = computed(() => {
  return doctorsList.value.filter(doc => {
    // Statü Filtresi
    if (doctorStatusFilter.value === 'active' && !doc.isActive) return false;
    if (doctorStatusFilter.value === 'inactive' && doc.isActive) return false;

    // Arama
    if (!searchDoctorQuery.value.trim()) return true;
    const q = searchDoctorQuery.value.toLowerCase();
    const nameMatch = doc.name?.toLowerCase().includes(q);
    const titleMatch = doc.title?.toLowerCase().includes(q);
    const phoneMatch = doc.phone?.toLowerCase().includes(q);
    const usernameMatch = doc.username?.toLowerCase().includes(q);
    return nameMatch || titleMatch || phoneMatch || usernameMatch;
  });
});

// Hekime Ödeme Yap Modalını Aç
function openPayoutModal(doctor?: any) {
  payoutForm.value = {
    doctorId: doctor ? doctor._id : (doctorsList.value[0]?._id || ''),
    amount: doctor && doctor.finances?.pendingBalance > 0 ? doctor.finances.pendingBalance : null,
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    notes: doctor ? `${doctor.name} hak ediş ödemesi` : ''
  };
  isPayoutModalOpen.value = true;
}

// Seçilen hekimin kalan bekleyen hak edişi
const selectedDoctorPendingBalance = computed(() => {
  const doc = doctorsList.value.find(d => d._id === payoutForm.value.doctorId);
  return doc?.finances?.pendingBalance || 0;
});

// Hekime Ödeme Kaydet
async function handleSavePayout() {
  if (!payoutForm.value.doctorId || !payoutForm.value.amount || payoutForm.value.amount <= 0) {
    showNotification('error', 'Lütfen hekim ve geçerli bir ödeme tutarı giriniz.');
    return;
  }

  isSubmitting.value = true;
  try {
    await $fetch('/api/doctors/payouts', {
      method: 'POST',
      body: payoutForm.value
    });

    showNotification('success', 'Hekime hak ediş ödemesi başarıyla kaydedildi.');
    isPayoutModalOpen.value = false;
    await Promise.all([
      loadData(),
      loadMonthlyReport()
    ]);
  } catch (err: any) {
    showNotification('error', err.data?.message || 'Ödeme kaydedilemedi.');
  } finally {
    isSubmitting.value = false;
  }
}

// Hekim Ödeme Düzenleme Modalını Aç
function openEditPayoutModal(payout: any) {
  editPayoutForm.value = {
    id: payout._id,
    doctorId: payout.doctorId?._id || payout.doctorId || '',
    doctorName: payout.doctorId?.name || payout.doctor?.name || 'Hekim',
    amount: payout.amount !== undefined ? payout.amount : null,
    paymentMethod: payout.paymentMethod || 'cash',
    date: payout.date || new Date().toISOString().split('T')[0],
    notes: payout.notes || ''
  };
  isEditPayoutModalOpen.value = true;
}

// Hekim Ödeme Değişikliğini Kaydet (PUT)
async function handleUpdatePayout() {
  if (!editPayoutForm.value.id || !editPayoutForm.value.amount || editPayoutForm.value.amount <= 0) {
    showNotification('error', 'Lütfen geçerli bir ödeme tutarı giriniz.');
    return;
  }

  isSubmitting.value = true;
  try {
    await $fetch(`/api/doctors/payouts/${editPayoutForm.value.id}`, {
      method: 'PUT',
      body: {
        amount: editPayoutForm.value.amount,
        date: editPayoutForm.value.date,
        paymentMethod: editPayoutForm.value.paymentMethod,
        notes: editPayoutForm.value.notes
      }
    });

    showNotification('success', 'Hekim ödeme tutarı ve bilgileri başarıyla güncellendi.');
    isEditPayoutModalOpen.value = false;
    await Promise.all([
      loadData(),
      loadMonthlyReport()
    ]);
  } catch (err: any) {
    showNotification('error', err.data?.message || 'Ödeme güncellenemedi.');
  } finally {
    isSubmitting.value = false;
  }
}

// Hekim Ödeme Kaydı Sil
async function handleDeletePayout(payoutId: string) {
  if (!confirm('Bu hekim hak ediş ödeme kaydını silmek istediğinize emin misiniz? Hekimin havuzdaki bekleyen bakiyesi tekrar artacaktır.')) {
    return;
  }

  try {
    await $fetch(`/api/doctors/payouts/${payoutId}`, {
      method: 'DELETE'
    });
    showNotification('success', 'Ödeme kaydı silindi ve hekim bakiyesi güncellendi.');
    await Promise.all([
      loadData(),
      loadMonthlyReport()
    ]);
  } catch (err: any) {
    showNotification('error', err.data?.message || 'Ödeme kaydı silinemedi.');
  }
}

// Yeni Hekim Ekle Modalını Aç
function openAddDoctorModal() {
  doctorForm.value = {
    id: '',
    name: '',
    username: '',
    password: '',
    title: 'Diş Hekimi',
    phone: '',
    email: '',
    type: 'percentage',
    rate: 30,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
    notes: ''
  };
  isAddDoctorModalOpen.value = true;
}

// Hekim Düzenle Modalını Aç
function openEditDoctorModal(doc: any) {
  doctorForm.value = {
    id: doc._id,
    name: doc.name || '',
    username: doc.username || '',
    password: '',
    title: doc.title || 'Diş Hekimi',
    phone: doc.phone || '',
    email: doc.email || '',
    type: doc.type || 'percentage',
    rate: doc.rate !== undefined ? doc.rate : 30,
    startDate: doc.startDate || '',
    endDate: doc.endDate || '',
    isActive: doc.isActive !== undefined ? doc.isActive : true,
    notes: doc.notes || ''
  };
  isEditDoctorModalOpen.value = true;
}

// Hekim Ekle Kaydet
async function handleCreateDoctor() {
  if (!doctorForm.value.name.trim()) {
    showNotification('error', 'Lütfen hekim adını giriniz.');
    return;
  }

  isSubmitting.value = true;
  try {
    await $fetch('/api/doctors', {
      method: 'POST',
      body: {
        name: doctorForm.value.name.trim(),
        username: doctorForm.value.username.trim() || undefined,
        password: doctorForm.value.password || '123456',
        title: doctorForm.value.title.trim(),
        phone: doctorForm.value.phone.trim(),
        email: doctorForm.value.email.trim(),
        type: doctorForm.value.type,
        rate: Number(doctorForm.value.rate) || 0,
        startDate: doctorForm.value.startDate,
        endDate: doctorForm.value.endDate,
        isActive: doctorForm.value.isActive,
        notes: doctorForm.value.notes.trim()
      }
    });

    showNotification('success', 'Yeni hekim başarıyla kaydedildi.');
    isAddDoctorModalOpen.value = false;
    await loadData();
  } catch (err: any) {
    showNotification('error', err.data?.message || 'Hekim kaydedilirken hata oluştu.');
  } finally {
    isSubmitting.value = false;
  }
}

// Hekim Güncelle
async function handleUpdateDoctor() {
  if (!doctorForm.value.id || !doctorForm.value.name.trim()) {
    showNotification('error', 'Lütfen hekim adını giriniz.');
    return;
  }

  isSubmitting.value = true;
  try {
    const payload: any = {
      name: doctorForm.value.name.trim(),
      title: doctorForm.value.title.trim(),
      phone: doctorForm.value.phone.trim(),
      email: doctorForm.value.email.trim(),
      type: doctorForm.value.type,
      rate: Number(doctorForm.value.rate) || 0,
      startDate: doctorForm.value.startDate,
      endDate: doctorForm.value.endDate,
      isActive: doctorForm.value.isActive,
      notes: doctorForm.value.notes.trim()
    };

    if (doctorForm.value.password.trim()) {
      payload.password = doctorForm.value.password.trim();
    }

    await $fetch(`/api/doctors/${doctorForm.value.id}`, {
      method: 'PUT',
      body: payload
    });

    showNotification('success', 'Hekim bilgileri ve çalışma şartları güncellendi.');
    isEditDoctorModalOpen.value = false;
    await loadData();
  } catch (err: any) {
    showNotification('error', err.data?.message || 'Hekim güncellenemedi.');
  } finally {
    isSubmitting.value = false;
  }
}

// Hekim Silme / Pasife Alma Onayı
function confirmDeleteDoctor(doc: any) {
  selectedDoctorForDelete.value = doc;
  isDeleteDoctorModalOpen.value = true;
}

async function handleDeleteDoctor() {
  if (!selectedDoctorForDelete.value) return;

  isSubmitting.value = true;
  try {
    const res: any = await $fetch(`/api/doctors/${selectedDoctorForDelete.value._id}`, {
      method: 'DELETE'
    });

    showNotification('success', res.message || 'İşlem tamamlandı.');
    isDeleteDoctorModalOpen.value = false;
    selectedDoctorForDelete.value = null;
    await loadData();
  } catch (err: any) {
    showNotification('error', err.data?.message || 'Hekim silinirken hata oluştu.');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Üst Başlık & Eylemler -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/25">
            <Icon name="heroicons:scale" class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hekim Hak Edişleri & Kasa Havuzu</h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Klinik genel kasası, hekim hak ediş havuzları, hakediş oranları ve hekim personel kayıtları
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <NuxtLink
          to="/payments?tab=expenses"
          class="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95"
        >
          <Icon name="heroicons:arrow-trending-down" class="w-4 h-4" />
          <span>Klinik Masrafları & Giderler</span>
        </NuxtLink>

        <button
          @click="openAddDoctorModal"
          class="px-4 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95"
        >
          <Icon name="heroicons:user-plus" class="w-4 h-4" />
          <span>Yeni Hekim Ekle</span>
        </button>

        <button
          @click="openPayoutModal()"
          class="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 active:scale-95"
        >
          <Icon name="heroicons:banknotes" class="w-4 h-4" />
          <span>Hekime Ödeme Yap</span>
        </button>
      </div>
    </div>

    <!-- Bildirim Mesajları -->
    <div v-if="successMsg" class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
      <Icon name="heroicons:check-circle" class="w-5 h-5 flex-shrink-0" />
      <span>{{ successMsg }}</span>
    </div>

    <div v-if="errorMsg" class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
      <Icon name="heroicons:exclamation-circle" class="w-5 h-5 flex-shrink-0" />
      <span>{{ errorMsg }}</span>
    </div>

    <!-- 5 Adet Finansal KPI Kartı (Tahsilat, Hekim Hakedişi, Klinik Giderleri, Poliklinik Net Kazancı, Havuz) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      <!-- 1. Toplam Klinik Cirosu -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Toplam Tahsilat</span>
          <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {{ formatCurrency(financesData?.summary?.totalCollections ?? financesData.totalClinicCollections) }}
          </div>
          <span class="text-xs text-slate-400 font-semibold mt-0.5 block">Kliniğe giren brüt para</span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Icon name="heroicons:arrow-trending-up" class="w-6 h-6" />
        </div>
      </div>

      <!-- 2. Hekim Hak Edişleri Toplamı -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-amber-500 font-bold uppercase tracking-wider block">Hekim Hakedişleri</span>
          <div class="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
            {{ formatCurrency(financesData?.summary?.totalDoctorEarnings ?? financesData.totalDoctorEarnings) }}
          </div>
          <span class="text-xs text-slate-400 font-semibold mt-0.5 block">Hekimlere ayrılan pay</span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Icon name="heroicons:scale" class="w-6 h-6" />
        </div>
      </div>

      <!-- 3. Toplam Klinik Giderleri -->
      <NuxtLink
        to="/payments?tab=expenses"
        class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-rose-300 dark:hover:border-rose-700 transition-colors group cursor-pointer"
        title="Klinik masraflarını ve gider tablosunu aç"
      >
        <div>
          <span class="text-xs text-rose-500 font-bold uppercase tracking-wider block group-hover:underline">Toplam Giderler ➔</span>
          <div class="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
            {{ formatCurrency(financesData?.summary?.totalClinicExpenses || 0) }}
          </div>
          <span class="text-xs text-slate-400 font-semibold mt-0.5 block">Kira, depo, lab ve faturalar</span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <Icon name="heroicons:arrow-trending-down" class="w-6 h-6" />
        </div>
      </NuxtLink>

      <!-- 4. Poliklinik Net Kazancı -->
      <div
        :class="[
          (financesData?.summary?.netClinicProfit || 0) >= 0
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900 border-emerald-300 dark:border-emerald-800'
            : 'bg-gradient-to-br from-rose-50 to-rose-100/40 dark:from-rose-950/30 dark:to-slate-900 border-rose-300 dark:border-rose-800',
          'p-5 rounded-2xl border shadow-sm flex items-center justify-between'
        ]"
      >
        <div>
          <span class="text-xs font-black uppercase tracking-wider block text-emerald-700 dark:text-emerald-400">Poliklinik Net Kazancı</span>
          <div
            :class="[
              (financesData?.summary?.netClinicProfit || 0) >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400',
              'text-2xl font-black font-mono mt-1'
            ]"
          >
            {{ formatCurrency(financesData?.summary?.netClinicProfit || 0) }}
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 block">[Tahsilat - Hekim - Gider]</span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <Icon name="heroicons:building-library" class="w-6 h-6" />
        </div>
      </div>

      <!-- 5. Havuzda Bekleyen Hak Ediş -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Havuzda Bekleyen</span>
          <div class="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
            {{ formatCurrency(financesData?.summary?.totalPendingDoctorEarnings ?? financesData.totalPendingDoctorEarnings) }}
          </div>
          <span class="text-xs text-slate-400 font-semibold mt-0.5 block">Hekimlere ödenecek bakiye</span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Icon name="heroicons:scale" class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- Sekmeler -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="px-4 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-2 overflow-x-auto">
        <button
          @click="activeTab = 'finances'"
          :class="[
            activeTab === 'finances'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 shadow-sm font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold',
            'inline-flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs sm:text-sm transition-all whitespace-nowrap'
          ]"
        >
          <Icon name="heroicons:scale" class="w-4 h-4" />
          <span>Kasa & Hak Ediş Havuzu</span>
        </button>

        <button
          @click="switchToMonthlyTab()"
          :class="[
            activeTab === 'monthly'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 shadow-sm font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold',
            'inline-flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs sm:text-sm transition-all whitespace-nowrap'
          ]"
        >
          <Icon name="heroicons:calendar-days" class="w-4 h-4 text-indigo-500" />
          <span>Aylık Hekim Hak Ediş & İşlem Raporu</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold">1-31 Gün</span>
        </button>

        <button
          @click="activeTab = 'doctors'"
          :class="[
            activeTab === 'doctors'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 shadow-sm font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold',
            'inline-flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs sm:text-sm transition-all whitespace-nowrap'
          ]"
        >
          <Icon name="heroicons:users" class="w-4 h-4" />
          <span>Hekim Kadrosu & Personel ({{ doctorsList.length }})</span>
        </button>
      </div>

      <!-- SEKME 1: KASA & HAK EDİŞ HAVUZU -->
      <div v-if="activeTab === 'finances'" class="p-5 space-y-6">
        <!-- Hekim Hak Ediş Bakiyeleri Tablosu -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Icon name="heroicons:user-group" class="w-4 h-4 text-amber-500" />
              <span>Hekim Hak Ediş Durumu & Cari Dengesi</span>
            </h3>
            <span class="text-xs text-slate-400">Tahsilatlara göre otomatik hesaplanan hak edişler</span>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Hekim</th>
                  <th class="py-3 px-4">Çalışma Şartı</th>
                  <th class="py-3 px-4 text-right">Toplam Tahsilat</th>
                  <th class="py-3 px-4 text-right">Hak Ediş (Cari)</th>
                  <th class="py-3 px-4 text-right">Ödenen Hak Ediş</th>
                  <th class="py-3 px-4 text-right">Havuzda Bekleyen</th>
                  <th class="py-3 px-4 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr v-if="doctorsList.length === 0">
                  <td colspan="7" class="py-6 text-center text-slate-400">Kayıtlı hekim bulunamadı.</td>
                </tr>
                <tr v-for="doc in doctorsList" :key="doc._id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {{ doc.name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <span class="font-bold text-slate-800 dark:text-white block">{{ doc.name }}</span>
                        <span class="text-[11px] text-slate-400 block">{{ doc.title || 'Diş Hekimi' }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span v-if="doc.type === 'percentage'" class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      %{{ doc.rate }} Hak Ediş
                    </span>
                    <span v-else class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Sabit Maaş
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                    {{ formatCurrency(doc.finances?.totalCollections || 0) }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-white">
                    {{ formatCurrency(doc.finances?.totalEarned || 0) }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {{ formatCurrency(doc.finances?.totalPaid || 0) }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono">
                    <span
                      :class="[
                        (doc.finances?.pendingBalance || 0) > 0 ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-slate-400 font-semibold'
                      ]"
                    >
                      {{ formatCurrency(doc.finances?.pendingBalance || 0) }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                      <button
                        @click="switchToMonthlyTab(doc._id)"
                        class="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                        title="Aylık Hak Ediş & İşlem Raporunu Aç"
                      >
                        <Icon name="heroicons:calendar-days" class="w-3.5 h-3.5" />
                        <span>Aylık Rapor</span>
                      </button>
                      <button
                        @click="openPayoutModal(doc)"
                        class="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Icon name="heroicons:banknotes" class="w-3.5 h-3.5" />
                        <span>Ödeme Yap</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Hekime Yapılan Ödemelerin Geçmiş Dökümü (DoctorPayouts) -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Icon name="heroicons:document-text" class="w-4 h-4 text-slate-400" />
              <span>Hekim Hak Ediş Ödeme Geçmişi (Kasadan Çıkanlar)</span>
            </h3>
            <span class="text-xs text-slate-400 font-mono">{{ financesData.recentPayouts?.length || 0 }} Ödeme Kaydı</span>
          </div>

          <div v-if="!financesData.recentPayouts || financesData.recentPayouts.length === 0" class="p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <Icon name="heroicons:banknotes" class="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p class="text-xs text-slate-400 mt-2 font-medium">Henüz hekimlere yapılmış bir hak ediş ödemesi kaydı bulunmuyor.</p>
          </div>

          <div v-else class="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Tarih</th>
                  <th class="py-3 px-4">Hekim</th>
                  <th class="py-3 px-4">Ödeme Şekli</th>
                  <th class="py-3 px-4">Açıklama / Not</th>
                  <th class="py-3 px-4 text-right">Ödenen Tutar</th>
                  <th class="py-3 px-4 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr v-for="payout in financesData.recentPayouts" :key="payout._id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4 font-mono text-slate-500">{{ formatDate(payout.date) }}</td>
                  <td class="py-3 px-4 font-bold text-slate-800 dark:text-white">{{ payout.doctorId?.name || 'Hekim' }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {{ payout.paymentMethod === 'cash' ? 'Nakit' : (payout.paymentMethod === 'transfer' ? 'Havale / EFT' : 'Diğer') }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-slate-500 text-xs">{{ payout.notes || '-' }}</td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {{ formatCurrency(payout.amount) }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        @click="openEditPayoutModal(payout)"
                        class="p-1.5 text-slate-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        title="Ödemeyi Düzenle / Tutarı Değiştir"
                      >
                        <Icon name="heroicons:pencil" class="w-4 h-4" />
                      </button>
                      <button
                        @click="handleDeletePayout(payout._id)"
                        class="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Ödeme Kaydını Sil"
                      >
                        <Icon name="heroicons:trash" class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SEKME 2: AYLIK HEKİM HAK EDİŞ & İŞLEM RAPORU (1'İNDEN AY SONUNA KADAR) -->
      <div v-if="activeTab === 'monthly'" class="p-5 space-y-6">
        <!-- Filtre ve Kontrol Çubuğu -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Icon name="heroicons:calendar-days" class="w-5 h-5" />
              </span>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Aylık Hekim Hak Ediş & İşlem Cetveli</h3>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                1'inden Ay Sonuna
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hekimin her ay yaptığı tedavileri, işlem cirolarını, hak ediş kazançlarını ve tahsilatları otomatik hesaplar.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Hekim Seçimi -->
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-semibold text-slate-500">Hekim:</span>
              <select
                v-model="selectedReportDoctorId"
                @change="loadMonthlyReport()"
                class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none shadow-sm"
              >
                <option value="all">Tüm Poliklinik (Ortak)</option>
                <option v-for="d in doctorsList" :key="d._id" :value="d._id">
                  {{ d.name }} ({{ d.type === 'percentage' ? `%${d.rate}` : 'Sabit' }})
                </option>
              </select>
            </div>

            <!-- Yıl Seçimi -->
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-semibold text-slate-500">Yıl:</span>
              <select
                v-model="selectedReportYear"
                @change="loadMonthlyReport()"
                class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none shadow-sm font-mono"
              >
                <option :value="2026">2026</option>
                <option :value="2025">2025</option>
                <option :value="2024">2024</option>
                <option :value="2023">2023</option>
              </select>
            </div>

            <!-- Hızlı Dönem Butonları -->
            <div class="inline-flex rounded-xl bg-slate-200/60 dark:bg-slate-900/60 p-1 gap-1 text-xs">
              <button
                @click="selectQuickPeriod('current')"
                class="px-2.5 py-1.5 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all"
              >
                Bu Ay
              </button>
              <button
                @click="selectQuickPeriod('previous')"
                class="px-2.5 py-1.5 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all"
              >
                Geçen Ay
              </button>
              <button
                @click="selectQuickPeriod('all')"
                class="px-2.5 py-1.5 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all"
              >
                Tüm Yıl
              </button>
            </div>

            <!-- Yazdır / Ekstre Al Butonu -->
            <button
              @click="printMonthlyStatement"
              class="px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              title="Aylık Bordro / Ekstre Yazdır"
            >
              <Icon name="heroicons:printer" class="w-4 h-4" />
              <span>Ekstre Yazdır</span>
            </button>
          </div>
        </div>

        <!-- Dönem KPI Özet Kartları (4 Adet) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <!-- 1. Yapılan Tedavi Sayısı & Ciro -->
          <div class="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div>
              <span class="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Yapılan İşlemler</span>
              <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {{ monthlyReportData?.yearSummary?.totalTreatments || 0 }} <span class="text-xs font-bold text-slate-400">Adet</span>
              </div>
              <span class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold font-mono mt-0.5 block">
                Ciro: {{ formatCurrency(monthlyReportData?.yearSummary?.totalFee || 0) }}
              </span>
            </div>
            <div class="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Icon name="heroicons:sparkles" class="w-5 h-5" />
            </div>
          </div>

          <!-- 2. Hekim Hak Ediş Kazancı -->
          <div class="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div>
              <span class="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Hekim Hak Edişi</span>
              <div class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {{ formatCurrency(monthlyReportData?.yearSummary?.totalTreatmentEarning || 0) }}
              </div>
              <span class="text-xs text-slate-400 font-medium mt-0.5 block">
                Anlaşma: %{{ monthlyReportData?.doctorRate || 30 }} Hak Ediş
              </span>
            </div>
            <div class="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Icon name="heroicons:banknotes" class="w-5 h-5" />
            </div>
          </div>

          <!-- 3. Dönem Kasa Tahsilatı -->
          <div class="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div>
              <span class="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Kasa Tahsilatı</span>
              <div class="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
                {{ formatCurrency(monthlyReportData?.yearSummary?.totalCollections || 0) }}
              </div>
              <span class="text-xs text-slate-400 font-medium mt-0.5 block">
                Tahsilat Payı: {{ formatCurrency(monthlyReportData?.yearSummary?.totalPaymentEarning || 0) }}
              </span>
            </div>
            <div class="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Icon name="heroicons:arrow-trending-up" class="w-5 h-5" />
            </div>
          </div>

          <!-- 4. Hekime Ödenen & Kalan Bakiye -->
          <div class="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div>
              <span class="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Kalan Net Hak Ediş</span>
              <div class="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                {{ formatCurrency(monthlyReportData?.yearSummary?.netTreatmentBalance || 0) }}
              </div>
              <span class="text-xs text-slate-400 font-medium mt-0.5 block">
                Ödenen: {{ formatCurrency(monthlyReportData?.yearSummary?.totalPayouts || 0) }}
              </span>
            </div>
            <div class="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Icon name="heroicons:scale" class="w-5 h-5" />
            </div>
          </div>
        </div>

        <!-- 12 Aylık Karşılaştırmalı Takvim Cetveli (Ocak - Aralık) -->
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div class="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon name="heroicons:table-cells" class="w-4 h-4 text-indigo-500" />
              <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                {{ selectedReportYear }} Yılı Aylık Hekim Kazanç ve İşlem Cetveli
              </h4>
            </div>
            <span class="text-xs text-slate-400">
              İşlemleri açmak ve tek tek incelemek için aya tıklayınız
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Dönem / Ay</th>
                  <th class="py-3 px-4 text-center">İşlem Adedi</th>
                  <th class="py-3 px-4 text-right">İşlem Cirosu</th>
                  <th class="py-3 px-4 text-right">Hekim Hak Edişi (%{{ monthlyReportData?.doctorRate || 30 }})</th>
                  <th class="py-3 px-4 text-right">Tahsilat</th>
                  <th class="py-3 px-4 text-right">Hekime Ödenen</th>
                  <th class="py-3 px-4 text-right">Kalan Hak Ediş</th>
                  <th class="py-3 px-4 text-center">İşlem Dökümü</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr
                  v-for="m in monthlyReportData?.months"
                  :key="m.month"
                  :class="[
                    selectedReportMonth === m.month
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30 ring-1 ring-inset ring-indigo-500/30'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40',
                    'transition-colors cursor-pointer'
                  ]"
                  @click="selectMonthForDetail(m.month)"
                >
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2">
                      <span
                        :class="[
                          selectedReportMonth === m.month ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
                          'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono flex-shrink-0'
                        ]"
                      >
                        {{ m.monthNumber }}
                      </span>
                      <div>
                        <span class="font-bold text-slate-900 dark:text-white block">{{ m.monthName }}</span>
                        <span class="text-[11px] text-slate-400 font-mono block">01 - {{ m.daysInMonth }} {{ m.shortName }}</span>
                      </div>
                    </div>
                  </td>

                  <td class="py-3.5 px-4 text-center">
                    <span
                      :class="[
                        m.treatmentCount > 0 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold' : 'text-slate-400',
                        'px-2.5 py-0.5 rounded-full text-xs font-mono inline-block'
                      ]"
                    >
                      {{ m.treatmentCount }} İşlem
                    </span>
                  </td>

                  <td class="py-3.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {{ formatCurrency(m.totalTreatmentFee) }}
                  </td>

                  <td class="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {{ formatCurrency(m.treatmentEarning) }}
                  </td>

                  <td class="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                    {{ formatCurrency(m.totalPaymentAmount) }}
                  </td>

                  <td class="py-3.5 px-4 text-right font-mono text-blue-600 dark:text-blue-400 font-medium">
                    {{ formatCurrency(m.totalPayout) }}
                  </td>

                  <td class="py-3.5 px-4 text-right font-mono">
                    <span
                      :class="[
                        m.netTreatmentBalance > 0 ? 'text-amber-600 dark:text-amber-400 font-black' : (m.netTreatmentBalance < 0 ? 'text-rose-600 font-bold' : 'text-slate-400 font-medium')
                      ]"
                    >
                      {{ formatCurrency(m.netTreatmentBalance) }}
                    </span>
                  </td>

                  <td class="py-3.5 px-4 text-center">
                    <button
                      @click.stop="selectMonthForDetail(m.month)"
                      :class="[
                        selectedReportMonth === m.month
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mx-auto'
                      ]"
                    >
                      <Icon name="heroicons:eye" class="w-3.5 h-3.5" />
                      <span>{{ selectedReportMonth === m.month ? 'Seçili Ay' : 'İşlemleri Aç' }}</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SEÇİLEN AYIN DETAYLI İŞLEM DÖKÜMÜ (HER AYIN 1'İNDEN SON GÜNÜNE KADAR) -->
        <div id="monthly-detail-section" class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden pt-2">
          <!-- Başlık ve Alt Sekmeler -->
          <div class="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  {{ monthlyReportData?.activeMonthTransactions?.monthName || 'Seçili Ay' }} İşlem Dökümü
                </h3>
                <span class="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  {{ formatDate(monthlyReportData?.activeMonthTransactions?.startDate) }} - {{ formatDate(monthlyReportData?.activeMonthTransactions?.endDate) }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                Ayın 1'inden ay sonuna kadar hekimin yaptığı işlemler tek tek listelenmektedir.
              </p>
            </div>

            <!-- Alt Sekmeler -->
            <div class="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
              <button
                @click="activeTransactionSubTab = 'treatments'"
                :class="[
                  activeTransactionSubTab === 'treatments'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
                  'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5'
                ]"
              >
                <Icon name="heroicons:clipboard-document-list" class="w-4 h-4" />
                <span>Yapılan Tedaviler ({{ monthlyReportData?.activeMonthTransactions?.treatmentCount || 0 }})</span>
              </button>

              <button
                @click="activeTransactionSubTab = 'payments'"
                :class="[
                  activeTransactionSubTab === 'payments'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
                  'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5'
                ]"
              >
                <Icon name="heroicons:credit-card" class="w-4 h-4" />
                <span>Tahsilatlar ({{ monthlyReportData?.activeMonthTransactions?.payments?.length || 0 }})</span>
              </button>

              <button
                @click="activeTransactionSubTab = 'payouts'"
                :class="[
                  activeTransactionSubTab === 'payouts'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
                  'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5'
                ]"
              >
                <Icon name="heroicons:banknotes" class="w-4 h-4" />
                <span>Ödemeler ({{ monthlyReportData?.activeMonthTransactions?.payouts?.length || 0 }})</span>
              </button>
            </div>
          </div>

          <!-- ALT SEKME 1: YAPILAN TEDAVİLER / İŞLEMLER -->
          <div v-if="activeTransactionSubTab === 'treatments'" class="p-4 space-y-3">
            <!-- Arama Kutusu -->
            <div class="flex items-center justify-between gap-3">
              <div class="relative flex-1 max-w-sm">
                <Icon name="heroicons:magnifying-glass" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="treatmentSearchQuery"
                  type="text"
                  placeholder="Hasta, işlem adı veya diş no ile ara..."
                  class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div class="text-xs font-semibold text-slate-500">
                Gösterilen: <b class="text-slate-800 dark:text-white">{{ filteredActiveTreatments.length }}</b> / {{ monthlyReportData?.activeMonthTransactions?.treatmentCount || 0 }} İşlem
              </div>
            </div>

            <!-- Tedavi Tablosu -->
            <div class="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th class="py-3 px-4">Tarih</th>
                    <th class="py-3 px-4">Hasta Adı Soyadı</th>
                    <th class="py-3 px-4 text-center">Diş No</th>
                    <th class="py-3 px-4">Yapılan İşlem / Tedavi</th>
                    <th class="py-3 px-4 text-right">İşlem Ücreti</th>
                    <th class="py-3 px-4 text-right">Hekim Hak Edişi</th>
                    <th class="py-3 px-4">Hekim / Açıklama</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr v-if="filteredActiveTreatments.length === 0">
                    <td colspan="7" class="py-8 text-center text-slate-400">
                      Bu ayda hekime ait kayıtlı tedavi/işlem bulunamadı.
                    </td>
                  </tr>
                  <tr
                    v-for="t in filteredActiveTreatments"
                    :key="t._id"
                    class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td class="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {{ formatDate(t.date) }}
                    </td>

                    <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <NuxtLink
                        v-if="t.patient?._id"
                        :to="`/patients/${t.patient._id}`"
                        class="hover:text-indigo-600 hover:underline flex items-center gap-1.5"
                      >
                        <span>{{ t.patient.name }}</span>
                        <span v-if="t.patient.phone" class="text-[10px] font-mono text-slate-400 font-normal">({{ t.patient.phone }})</span>
                      </NuxtLink>
                      <span v-else>{{ t.patient?.name || 'Hasta' }}</span>
                    </td>

                    <td class="py-3 px-4 text-center">
                      <span v-if="t.tooth" class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                        {{ t.tooth }}
                      </span>
                      <span v-else class="text-slate-400">-</span>
                    </td>

                    <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                      {{ t.procedure }}
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {{ formatCurrency(t.fee) }}
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      <div class="flex items-center justify-end gap-1">
                        <span>{{ formatCurrency(t.doctorEarning) }}</span>
                        <span class="text-[10px] text-slate-400 font-normal">(%{{ t.doctorRate }})</span>
                      </div>
                    </td>

                    <td class="py-3 px-4 text-slate-400 text-xs">
                      <div class="truncate max-w-xs" :title="t.notes">
                        <span v-if="t.doctor?.name" class="font-semibold text-slate-500 mr-1">{{ t.doctor.name }}:</span>
                        {{ t.notes || '-' }}
                      </div>
                    </td>
                  </tr>
                </tbody>
                <!-- Alt Toplam Satırı -->
                <tfoot v-if="filteredActiveTreatments.length > 0" class="bg-slate-50 dark:bg-slate-800/90 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                  <tr>
                    <td colspan="4" class="py-3 px-4 text-right text-slate-700 dark:text-slate-300 uppercase text-xs">
                      Dönem Toplamı ({{ filteredActiveTreatments.length }} İşlem):
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-slate-900 dark:text-white">
                      {{ formatCurrency(filteredActiveTreatments.reduce((sum, item) => sum + item.fee, 0)) }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-black">
                      {{ formatCurrency(filteredActiveTreatments.reduce((sum, item) => sum + item.doctorEarning, 0)) }}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- ALT SEKME 2: ALINAN TAHSİLATLAR -->
          <div v-if="activeTransactionSubTab === 'payments'" class="p-4 space-y-3">
            <div class="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th class="py-3 px-4">Tarih</th>
                    <th class="py-3 px-4">Hasta Adı</th>
                    <th class="py-3 px-4">Ödeme Yöntemi</th>
                    <th class="py-3 px-4 text-right">Tahsil Edilen Tutar</th>
                    <th class="py-3 px-4 text-right">Hekim Hak Ediş Payı</th>
                    <th class="py-3 px-4">Açıklama</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr v-if="!monthlyReportData?.activeMonthTransactions?.payments?.length">
                    <td colspan="6" class="py-8 text-center text-slate-400">
                      Bu ayda hekime ait kayıtlı tahsilat bulunamadı.
                    </td>
                  </tr>
                  <tr
                    v-for="p in monthlyReportData?.activeMonthTransactions?.payments"
                    :key="p._id"
                    class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td class="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{{ formatDate(p.date) }}</td>
                    <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">{{ p.patient?.name || 'Hasta' }}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {{ p.method === 'cash' ? 'Nakit' : (p.method === 'card' ? 'Kredi Kartı' : 'Havale') }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {{ formatCurrency(p.amount) }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {{ formatCurrency(p.doctorEarning) }}
                    </td>
                    <td class="py-3 px-4 text-slate-400 text-xs">{{ p.notes || '-' }}</td>
                  </tr>
                </tbody>
                <tfoot v-if="monthlyReportData?.activeMonthTransactions?.payments?.length" class="bg-slate-50 dark:bg-slate-800/90 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                  <tr>
                    <td colspan="3" class="py-3 px-4 text-right text-slate-700 dark:text-slate-300 uppercase text-xs">Toplam Tahsilat:</td>
                    <td class="py-3 px-4 text-right font-mono text-slate-900 dark:text-white">
                      {{ formatCurrency(monthlyReportData?.activeMonthTransactions?.totalCollectedAmount) }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-black">
                      {{ formatCurrency(monthlyReportData?.activeMonthTransactions?.totalDoctorPaymentEarning) }}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- ALT SEKME 3: HEKİME YAPILAN ÖDEMELER -->
          <div v-if="activeTransactionSubTab === 'payouts'" class="p-4 space-y-3">
            <div class="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th class="py-3 px-4">Tarih</th>
                    <th class="py-3 px-4">Hekim</th>
                    <th class="py-3 px-4">Ödeme Şekli</th>
                    <th class="py-3 px-4 text-right">Ödenen Tutar</th>
                    <th class="py-3 px-4">Açıklama</th>
                    <th class="py-3 px-4 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr v-if="!monthlyReportData?.activeMonthTransactions?.payouts?.length">
                    <td colspan="6" class="py-8 text-center text-slate-400">
                      Bu ayda hekime yapılmış bir ödeme kaydı bulunamadı.
                    </td>
                  </tr>
                  <tr
                    v-for="po in monthlyReportData?.activeMonthTransactions?.payouts"
                    :key="po._id"
                    class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td class="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{{ formatDate(po.date) }}</td>
                    <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">{{ po.doctor?.name || 'Hekim' }}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {{ po.paymentMethod === 'cash' ? 'Nakit' : 'Banka / Havale' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                      {{ formatCurrency(po.amount) }}
                    </td>
                    <td class="py-3 px-4 text-slate-400 text-xs">{{ po.notes || '-' }}</td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex items-center justify-center gap-1">
                        <button
                          @click="openEditPayoutModal(po)"
                          class="p-1.5 text-slate-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          title="Ödemeyi Düzenle / Tutarı Değiştir"
                        >
                          <Icon name="heroicons:pencil" class="w-4 h-4" />
                        </button>
                        <button
                          @click="handleDeletePayout(po._id)"
                          class="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Ödeme Kaydını Sil"
                        >
                          <Icon name="heroicons:trash" class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- SEKME 3: HEKİM KADROSU & PERSONEL YÖNETİMİ -->
      <div v-if="activeTab === 'doctors'" class="p-5 space-y-4">
        <!-- Arama ve Filtreleme -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="relative flex-1 max-w-md">
            <Icon name="heroicons:magnifying-glass" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchDoctorQuery"
              type="text"
              placeholder="Hekim adı, telefon veya uzmanlık ile ara..."
              class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
            />
          </div>

          <div class="flex items-center gap-2">
            <select
              v-model="doctorStatusFilter"
              class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Tüm Personel</option>
              <option value="active">Aktif Çalışanlar</option>
              <option value="inactive">İşten Ayrılanlar</option>
            </select>

            <button
              @click="openAddDoctorModal"
              class="px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Icon name="heroicons:plus" class="w-3.5 h-3.5" />
              <span>Hekim Ekle</span>
            </button>
          </div>
        </div>

        <!-- Hekim Kartları Izgarası -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="doc in filteredDoctors"
            :key="doc._id"
            class="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
          >
            <div>
              <!-- Üst: Ad, Ünvan, Durum -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/20">
                    {{ doc.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <h4 class="font-bold text-base text-slate-800 dark:text-white leading-tight">{{ doc.name }}</h4>
                    <span class="text-xs text-slate-400 font-medium">{{ doc.title || 'Diş Hekimi' }}</span>
                  </div>
                </div>

                <span
                  :class="[
                    doc.isActive !== false
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
                    'px-2 py-0.5 rounded-full text-[11px] font-bold border'
                  ]"
                >
                  {{ doc.isActive !== false ? 'Aktif Çalışan' : 'İşten Ayrıldı' }}
                </span>
              </div>

              <!-- İletişim Bilgileri -->
              <div class="mt-3.5 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <div v-if="doc.phone" class="flex items-center gap-2">
                  <Icon name="heroicons:phone" class="w-3.5 h-3.5 text-slate-400" />
                  <span class="font-mono">{{ doc.phone }}</span>
                </div>
                <div v-if="doc.email" class="flex items-center gap-2">
                  <Icon name="heroicons:envelope" class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ doc.email }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="heroicons:user" class="w-3.5 h-3.5 text-slate-400" />
                  <span>Kullanıcı: <b class="font-mono text-slate-700 dark:text-slate-200">{{ doc.username }}</b></span>
                </div>
              </div>

              <!-- İşe Başlama & Ayrılma Tarihleri Bölümü -->
              <div class="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 flex items-center gap-1">
                    <Icon name="heroicons:calendar-days" class="w-3.5 h-3.5" />
                    <span>İşe Başlama Tarihi:</span>
                  </span>
                  <span class="font-bold font-mono text-slate-700 dark:text-slate-200">
                    {{ formatDate(doc.startDate) }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-slate-400 flex items-center gap-1">
                    <Icon name="heroicons:arrow-right-on-rectangle" class="w-3.5 h-3.5" />
                    <span>İşten Ayrılma Tarihi:</span>
                  </span>
                  <span class="font-bold font-mono text-slate-700 dark:text-slate-200">
                    {{ doc.endDate ? formatDate(doc.endDate) : 'Devam Ediyor' }}
                  </span>
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800">
                  <span class="text-slate-400">Hak Ediş Şartı:</span>
                  <span class="font-bold text-indigo-600 dark:text-indigo-400">
                    {{ doc.type === 'percentage' ? `%${doc.rate} Yüzdelik` : 'Sabit Maaş' }}
                  </span>
                </div>
              </div>

              <!-- Notlar (Varsa) -->
              <div v-if="doc.notes" class="mt-2.5 text-xs text-slate-400 italic">
                "{{ doc.notes }}"
              </div>
            </div>

            <!-- Eylem Butonları -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center gap-2">
              <button
                @click="openEditDoctorModal(doc)"
                class="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Icon name="heroicons:pencil" class="w-3.5 h-3.5" />
                <span>Düzenle</span>
              </button>

              <button
                @click="openPayoutModal(doc)"
                class="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                title="Hekime Ödeme Yap"
              >
                <Icon name="heroicons:banknotes" class="w-3.5 h-3.5" />
                <span>Öde</span>
              </button>

              <button
                @click="confirmDeleteDoctor(doc)"
                class="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30"
                title="Hekimi Sil / Arşivle"
              >
                <Icon name="heroicons:trash" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 1: HEKİME ÖDEME YAP -->
    <div v-if="isPayoutModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Icon name="heroicons:banknotes" class="w-5 h-5" />
            </div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Hekime Hak Ediş Ödemesi Yap</h3>
          </div>
          <button @click="isPayoutModalOpen = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Hekim Seçiniz</label>
            <select
              v-model="payoutForm.doctorId"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white font-medium"
            >
              <option v-for="doc in doctorsList" :key="doc._id" :value="doc._id">
                {{ doc.name }} (Bekleyen: {{ formatCurrency(doc.finances?.pendingBalance || 0) }})
              </option>
            </select>
          </div>

          <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
            <span class="text-xs text-amber-700 dark:text-amber-300 font-medium">Hekimin Havuzdaki Bakiyesi:</span>
            <span class="font-bold font-mono text-sm text-amber-800 dark:text-amber-200">
              {{ formatCurrency(selectedDoctorPendingBalance) }}
            </span>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ödenecek Tutar (TL)</label>
            <input
              v-model.number="payoutForm.amount"
              type="number"
              min="1"
              placeholder="Örn: 5000"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white font-bold"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ödeme Yöntemi</label>
              <select
                v-model="payoutForm.paymentMethod"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
              >
                <option value="cash">Elden / Nakit</option>
                <option value="transfer">Banka Havalesi / EFT</option>
                <option value="other">Diğer</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ödeme Tarihi</label>
              <input
                v-model="payoutForm.date"
                type="date"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Açıklama / Makbuz Notu</label>
            <input
              v-model="payoutForm.notes"
              type="text"
              placeholder="Örn: Temmuz ayı hak ediş ödemesi"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            @click="isPayoutModalOpen = false"
            class="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs sm:text-sm font-bold"
          >
            İptal
          </button>
          <button
            @click="handleSavePayout"
            :disabled="isSubmitting"
            class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <span>Ödemeyi Onayla & Kasadan Düş</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 1B: HEKİM ÖDEMESİNİ DÜZENLE / DEĞİŞTİR -->
    <div v-if="isEditPayoutModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Icon name="heroicons:pencil-square" class="w-5 h-5" />
            </div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Hekim Ödemesini Düzenle</h3>
          </div>
          <button @click="isEditPayoutModalOpen = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3.5 text-xs sm:text-sm">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Hekim:</span>
            <span class="font-bold text-sm text-slate-800 dark:text-white">
              {{ editPayoutForm.doctorName }}
            </span>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ödenen Tutar (TL) <span class="text-rose-500">*</span></label>
            <input
              v-model.number="editPayoutForm.amount"
              type="number"
              min="1"
              step="any"
              required
              placeholder="Örn: 9000"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white font-bold"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ödeme Yöntemi</label>
              <select
                v-model="editPayoutForm.paymentMethod"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
              >
                <option value="cash">Elden / Nakit</option>
                <option value="transfer">Banka Havalesi / EFT</option>
                <option value="other">Diğer</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ödeme Tarihi</label>
              <input
                v-model="editPayoutForm.date"
                type="date"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Açıklama / Makbuz Notu</label>
            <input
              v-model="editPayoutForm.notes"
              type="text"
              placeholder="Örn: Eylül ayı hak ediş ödemesi"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            @click="isEditPayoutModalOpen = false"
            class="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs sm:text-sm font-bold"
          >
            İptal
          </button>
          <button
            @click="handleUpdatePayout"
            :disabled="isSubmitting"
            class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
          >
            <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: YENİ HEKİM EKLE -->
    <div v-if="isAddDoctorModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
              <Icon name="heroicons:user-plus" class="w-5 h-5" />
            </div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Yeni Hekim Kaydet</h3>
          </div>
          <button @click="isAddDoctorModalOpen = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ad Soyad *</label>
            <input
              v-model="doctorForm.name"
              type="text"
              placeholder="Örn: Dr. Dt. Ahmet Yılmaz"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-semibold text-slate-800 dark:text-white"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ünvan / Uzmanlık</label>
              <input
                v-model="doctorForm.title"
                type="text"
                placeholder="Örn: Ortodontist, Diş Hekimi"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Telefon Numarası</label>
              <input
                v-model="doctorForm.phone"
                type="text"
                placeholder="0532..."
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Çalışma / Hak Ediş Türü</label>
              <select
                v-model="doctorForm.type"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
              >
                <option value="percentage">Yüzdelik Hak Ediş (%)</option>
                <option value="salary">Sabit Maaşlı</option>
              </select>
            </div>
            <div v-if="doctorForm.type === 'percentage'">
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Hak Ediş Oranı (%)</label>
              <input
                v-model.number="doctorForm.rate"
                type="number"
                min="0"
                max="100"
                placeholder="30"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono font-bold text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <!-- İşe Başlama ve Ayrılma Tarihleri -->
          <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Icon name="heroicons:calendar" class="w-3.5 h-3.5 text-slate-400" />
                <span>İşe Başlama Tarihi</span>
              </label>
              <input
                v-model="doctorForm.startDate"
                type="date"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Icon name="heroicons:arrow-right-on-rectangle" class="w-3.5 h-3.5 text-slate-400" />
                <span>İşten Ayrılma Tarihi</span>
              </label>
              <input
                v-model="doctorForm.endDate"
                type="date"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block">Halen çalışıyorsa boş bırakınız</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kullanıcı Adı (Giriş için)</label>
              <input
                v-model="doctorForm.username"
                type="text"
                placeholder="Örn: ahmet"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Giriş Şifresi</label>
              <input
                v-model="doctorForm.password"
                type="password"
                placeholder="Varsayılan: 123456"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Personel Notları</label>
            <input
              v-model="doctorForm.notes"
              type="text"
              placeholder="Örn: Salı ve Perşembe günleri klinikte"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            @click="isAddDoctorModalOpen = false"
            class="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs sm:text-sm font-bold"
          >
            İptal
          </button>
          <button
            @click="handleCreateDoctor"
            :disabled="isSubmitting"
            class="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <span>Hekimi Kaydet</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 3: HEKİM DÜZENLE -->
    <div v-if="isEditDoctorModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Icon name="heroicons:pencil" class="w-5 h-5" />
            </div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Hekim Bilgilerini Düzenle</h3>
          </div>
          <button @click="isEditDoctorModalOpen = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ad Soyad *</label>
            <input
              v-model="doctorForm.name"
              type="text"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-semibold text-slate-800 dark:text-white"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ünvan / Uzmanlık</label>
              <input
                v-model="doctorForm.title"
                type="text"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Telefon Numarası</label>
              <input
                v-model="doctorForm.phone"
                type="text"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Çalışma / Hak Ediş Türü</label>
              <select
                v-model="doctorForm.type"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
              >
                <option value="percentage">Yüzdelik Hak Ediş (%)</option>
                <option value="salary">Sabit Maaşlı</option>
              </select>
            </div>
            <div v-if="doctorForm.type === 'percentage'">
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Hak Ediş Oranı (%)</label>
              <input
                v-model.number="doctorForm.rate"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono font-bold text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <!-- İşe Başlama ve Ayrılma Tarihleri Düzenleme -->
          <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Icon name="heroicons:calendar" class="w-3.5 h-3.5 text-slate-400" />
                <span>İşe Başlama Tarihi</span>
              </label>
              <input
                v-model="doctorForm.startDate"
                type="date"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Icon name="heroicons:arrow-right-on-rectangle" class="w-3.5 h-3.5 text-slate-400" />
                <span>İşten Ayrılma Tarihi</span>
              </label>
              <input
                v-model="doctorForm.endDate"
                type="date"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div>
              <span class="font-bold text-slate-800 dark:text-white block">Çalışma Durumu</span>
              <span class="text-xs text-slate-400 block">İşten ayrılan hekimleri pasife alabilirsiniz</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="doctorForm.isActive" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Şifre Değiştir (İsteğe bağlı)</label>
            <input
              v-model="doctorForm.password"
              type="password"
              placeholder="Değiştirmek istemiyorsanız boş bırakınız"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Notlar</label>
            <input
              v-model="doctorForm.notes"
              type="text"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            @click="isEditDoctorModalOpen = false"
            class="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs sm:text-sm font-bold"
          >
            İptal
          </button>
          <button
            @click="handleUpdateDoctor"
            :disabled="isSubmitting"
            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 4: HEKİM SİLME ONAYI -->
    <div v-if="isDeleteDoctorModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Hekim Kaydını Sil</h3>
            <p class="text-xs text-slate-400">Bu işlem geri alınamaz.</p>
          </div>
        </div>

        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <b class="font-bold text-slate-900 dark:text-white">{{ selectedDoctorForDelete?.name }}</b> isimli hekim kaydını silmek veya arşivlemek istediğinize emin misiniz?
        </p>
        <div class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs">
          <b>Not:</b> Hekime ait geçmiş işlem, ödeme veya randevu bulunuyorsa sistem finansal tutarlılık için hekimi kalıcı silmek yerine durumunu "İşten Ayrıldı" olarak pasife alır.
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            @click="isDeleteDoctorModalOpen = false"
            class="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-bold"
          >
            Vazgeç
          </button>
          <button
            @click="handleDeleteDoctor"
            :disabled="isSubmitting"
            class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <span>Onayla & Sil</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body {
    background: #ffffff !important;
    color: #0f172a !important;
  }
  aside,
  header,
  nav,
  button,
  .no-print {
    display: none !important;
  }
  #monthly-detail-section {
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
  }
}
</style>

