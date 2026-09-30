import { ref, computed } from 'vue';

export interface ReminderItem {
  _id: string;
  patientId?: any;
  patientName?: string;
  patientPhone?: string;
  category: 'treatment' | 'payment' | 'general';
  note: string;
  targetDate: string; // YYYY-MM-DD
  leadDays: number;
  reminderDate: string; // YYYY-MM-DD
  status: 'active' | 'completed' | 'hidden';
  snoozedUntil: string | null;
  doctorId?: string;
  createdAt?: string;
  isDue?: boolean;
  isSnoozed?: boolean;
  isToday?: boolean;
}

// Global paylaşılan state
const reminders = ref<ReminderItem[]>([]);
const isLoading = ref<boolean>(false);

export const useReminders = () => {
  const triggerToast = (message: string, type: string = 'info') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message, type }
      }));
    }
  };

  const loadReminders = async (patientId?: string) => {
    try {
      isLoading.value = true;
      const url = patientId ? `/api/reminders?patientId=${patientId}` : '/api/reminders';
      const res: any = await $fetch(url);
      if (res && res.success && Array.isArray(res.data)) {
        reminders.value = res.data;
      }
    } catch (error) {
      console.error('Hatırlatıcılar yüklenirken hata:', error);
    } finally {
      isLoading.value = false;
    }
  };

  // Zamanı gelmiş ve zil panelinde görünecek aktif hatırlatıcılar
  const activeDueReminders = computed(() => {
    return reminders.value.filter(r => r.status === 'active' && r.isDue);
  });

  // Tüm aktif hatırlatıcılar (Vakti gelenler + İleri tarihliler), hedef tarihe göre kronolojik sıralı
  const allActiveReminders = computed(() => {
    return reminders.value
      .filter(r => r.status === 'active')
      .sort((a, b) => (a.targetDate || '').localeCompare(b.targetDate || ''));
  });

  // İleri tarihli aktif hatırlatıcılar (Henüz vakti gelmemiş olanlar)
  const upcomingReminders = computed(() => {
    return reminders.value
      .filter(r => r.status === 'active' && !r.isDue)
      .sort((a, b) => (a.targetDate || '').localeCompare(b.targetDate || ''));
  });

  // Gizlenen hatırlatıcılar
  const hiddenReminders = computed(() => {
    return reminders.value.filter(r => r.status === 'hidden');
  });

  // Ertelenmiş hatırlatıcılar
  const snoozedReminders = computed(() => {
    return reminders.value.filter(r => r.status === 'active' && r.isSnoozed);
  });

  // Yeni Hatırlatıcı Oluştur
  const createReminder = async (payload: {
    note: string;
    targetDate: string;
    leadDays: number;
    category?: 'treatment' | 'payment' | 'general';
    patientId?: string;
    patientName?: string;
    patientPhone?: string;
  }) => {
    try {
      const res: any = await $fetch('/api/reminders', {
        method: 'POST',
        body: payload
      });
      if (res && res.success) {
        triggerToast('✅ Hatırlatıcı başarıyla oluşturuldu.', 'success');
        await loadReminders();
        // Zil panelini yenilemek için olay yay
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('reminders-updated'));
        }
        return res.data;
      }
    } catch (err: any) {
      triggerToast(err.data?.message || 'Hatırlatıcı kaydedilemedi.', 'error');
      throw err;
    }
  };

  // 1. TAMAMLANDI: Kalıcı olarak siler, gizlenenlere ATMAZ
  const completeReminder = async (id: string) => {
    try {
      await $fetch(`/api/reminders/${id}`, {
        method: 'DELETE'
      });
      reminders.value = reminders.value.filter(r => r._id !== id);
      triggerToast('✓ Bildirim tamamlandı olarak silindi.', 'success');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reminders-updated'));
      }
    } catch (err: any) {
      triggerToast('İşlem gerçekleştirilemedi.', 'error');
      console.error('Tamamlanırken hata:', err);
    }
  };

  // 2. ERTELENDİ: Belirtilen tarihe kadar listeden çıkarır
  const snoozeReminder = async (id: string, snoozeDate: string) => {
    try {
      await $fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        body: { snoozedUntil: snoozeDate }
      });
      // Yerel state güncelle
      const item = reminders.value.find(r => r._id === id);
      if (item) {
        item.snoozedUntil = snoozeDate;
        item.isSnoozed = true;
        item.isDue = false;
      }
      triggerToast(`⏱️ Bildirim ${snoozeDate} tarihine kadar ertelendi.`, 'info');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reminders-updated'));
      }
    } catch (err: any) {
      triggerToast('Erteleme işlemi başarısız.', 'error');
      console.error('Ertelenirken hata:', err);
    }
  };

  // 3. TAMAMLANMADI / GİZLE: Arayüzü kalabalık etmesin diye gizlenenlere taşır
  const hideReminder = async (id: string) => {
    try {
      await $fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        body: { status: 'hidden' }
      });
      const item = reminders.value.find(r => r._id === id);
      if (item) {
        item.status = 'hidden';
      }
      triggerToast('Bildirim gizlenenlere taşındı.', 'info');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reminders-updated'));
      }
    } catch (err: any) {
      triggerToast('Gizleme işlemi başarısız.', 'error');
      console.error('Gizlenirken hata:', err);
    }
  };

  // Gizlenen bildirimi geri getir
  const unhideReminder = async (id: string) => {
    try {
      await $fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        body: { status: 'active', snoozedUntil: null }
      });
      const item = reminders.value.find(r => r._id === id);
      if (item) {
        item.status = 'active';
        item.snoozedUntil = null;
        item.isSnoozed = false;
        item.isDue = true;
      }
      triggerToast('Bildirim tekrar aktif listeye alındı.', 'success');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reminders-updated'));
      }
    } catch (err: any) {
      triggerToast('Geri getirme işlemi başarısız.', 'error');
      console.error('Geri getirilirken hata:', err);
    }
  };

  // DOĞRUDAN SİLME (Çöp Kutusu / Sil Butonu): Tek tıkla veritabanından kalıcı olarak siler
  const deleteReminder = async (id: string) => {
    try {
      await $fetch(`/api/reminders/${id}`, {
        method: 'DELETE'
      });
      reminders.value = reminders.value.filter(r => r._id !== id);
      triggerToast('🗑️ Hatırlatıcı kalıcı olarak silindi.', 'success');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reminders-updated'));
      }
    } catch (err: any) {
      triggerToast('Silme işlemi gerçekleştirilemedi.', 'error');
      console.error('Silinirken hata:', err);
    }
  };

  return {
    reminders,
    activeDueReminders,
    allActiveReminders,
    upcomingReminders,
    hiddenReminders,
    snoozedReminders,
    isLoading,
    loadReminders,
    createReminder,
    deleteReminder,
    completeReminder,
    snoozeReminder,
    hideReminder,
    unhideReminder
  };
};
