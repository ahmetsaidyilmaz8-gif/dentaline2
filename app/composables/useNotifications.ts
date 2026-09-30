import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface NotificationItem {
  id: string;
  patientName: string;
  procedure: string;
  time: string;
  date: string;
  type: 'today' | 'tomorrow';
  timeLabel: string;
  isUrgent: boolean;
  diffMins: number;
  patientId?: string;
  doctorName?: string;
}

const NOTIF_STORAGE_KEY = 'tenaxline_sent_notifs';
const DISMISSED_NOTIFS_KEY = 'tenaxline_dismissed_notifs';

export const useNotifications = () => {
  const isSupported = ref<boolean>(false);
  const permission = ref<string>('default');
  const notifications = ref<NotificationItem[]>([]);
  const isLoading = ref<boolean>(false);
  const countdown = ref<number | null>(null);
  let checkInterval: ReturnType<typeof setInterval> | null = null;
  let countdownTimer: any = null;

  // Gizlenen / Silinen bildirimler hafızası
  const getDismissedNotifs = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(DISMISSED_NOTIFS_KEY) || '[]');
    } catch {
      return [];
    }
  };

  const dismissNotification = (id: string) => {
    if (typeof window === 'undefined') return;
    const list = getDismissedNotifs();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DISMISSED_NOTIFS_KEY, JSON.stringify(list));
    }
    notifications.value = notifications.value.filter(n => n.id !== id);
    triggerToast('Bildirim gizlendi/silindi.', 'info');
  };

  const dismissAllNotifications = () => {
    if (typeof window === 'undefined') return;
    const list = getDismissedNotifs();
    notifications.value.forEach(n => {
      if (!list.includes(n.id)) list.push(n.id);
    });
    localStorage.setItem(DISMISSED_NOTIFS_KEY, JSON.stringify(list));
    notifications.value = [];
    triggerToast('Tüm randevu bildirimleri temizlendi.', 'success');
  };

  const resetDismissedNotifications = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DISMISSED_NOTIFS_KEY);
    loadNotifications();
    triggerToast('Gizlenen bildirimler geri getirildi.', 'info');
  };

  // Anti-Spam: Gönderilen bildirimlerin hafızası
  const getSentNotifs = (): Record<string, number> => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  };

  const markNotified = (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      const map = getSentNotifs();
      map[key] = Date.now();
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(map));
    } catch {}
  };

  const hasBeenNotifiedRecently = (key: string, windowMs = 40 * 60 * 1000): boolean => {
    const map = getSentNotifs();
    const timestamp = map[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < windowMs;
  };

  // Hoş ve yumuşak Web Audio hatırlatma sesi
  const playChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Tarayıcı ses politikası engellerse sessizce geç
    }
  };

  // Tarayıcı Bildirim Desteği Kontrolü
  const checkSupport = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      isSupported.value = true;
      permission.value = Notification.permission;
    }
  };

  // Mobil / Tarayıcı Sistem Bildirim İzni İste
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      triggerToast('Tarayıcınız sistem bildirimlerini desteklemiyor. Chrome veya Safari (PWA) kullanabilirsiniz.', 'error');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      permission.value = result;

      if (result === 'granted') {
        triggerToast('✅ Sistem bildirimleri başarıyla aktifleştirildi!', 'success');
        playChime();
        return true;
      } else {
        triggerToast('⚠️ Bildirim izni engellenmiş. Lütfen adres çubuğundaki kilit (🔒) simgesinden izin verin.', 'warning');
        return false;
      }
    } catch (error) {
      console.error('Bildirim izni alınırken hata:', error);
      return false;
    }
  };

  // Sistem / Mobil Bildirimi Düşür
  const sendNativeNotification = async (
    title: string,
    body: string,
    customOptions?: {
      url?: string;
      tag?: string;
      icon?: string;
      vibrate?: number[];
    }
  ): Promise<boolean> => {
    // 1. Her durumda uygulama içi Toast uyarısı ve ses çal
    triggerToast(`🔔 ${title}: ${body}`, 'info');
    playChime();

    if (!isSupported.value || permission.value !== 'granted') return false;

    const targetUrl = customOptions?.url || '/appointments';
    const options: any = {
      body,
      icon: customOptions?.icon || '/icon-192.png',
      badge: '/favicon.png',
      vibrate: customOptions?.vibrate || [200, 100, 200, 100, 200],
      tag: customOptions?.tag || `tenaxline-apt-${Date.now()}`,
      renotify: true,
      data: {
        url: targetUrl
      }
    };

    // 2. Android Chrome ve iOS PWA: Service Worker üzerinden showNotification
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(title, options);
          return true;
        }
      } catch (swErr) {
        console.warn('SW showNotification hatası, fallback deneniyor:', swErr);
      }
    }

    // 3. Masaüstü Tarayıcı Fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(title, options);
        return true;
      } catch (notifErr) {
        console.warn('Native Notification nesnesi oluşturulamadı:', notifErr);
      }
    }

    return false;
  };

  // Anında Test Bildirimi Gönder
  const triggerInstantTest = async () => {
    if (permission.value !== 'granted') {
      const ok = await requestPermission();
      if (!ok) return;
    }

    await sendNativeNotification(
      '⏰ Randevu Yaklaştı (15 dk kaldı)',
      'Ayşe Demir - İmplant Kontrolü (Saat: 18:30)',
      {
        url: '/appointments',
        tag: 'test-appointment-instant'
      }
    );
    triggerToast('📱 Test bildirimi gönderildi! Kilit ekranınızı kontrol edebilirsiniz.', 'success');
  };

  // 5 Saniye Sonra Gecikmeli Kilit Ekranı Testi
  const triggerDelayedLockScreenTest = async (seconds = 5) => {
    if (permission.value !== 'granted') {
      const ok = await requestPermission();
      if (!ok) return;
    }

    if (countdown.value !== null) return;

    countdown.value = seconds;
    triggerToast(`⏱️ Geri sayım başladı (${seconds} sn). Şimdi telefonunuzu kilitleyin veya ana ekrana geçin...`, 'info');

    countdownTimer = setInterval(() => {
      if (countdown.value !== null && countdown.value > 1) {
        countdown.value -= 1;
      } else {
        clearInterval(countdownTimer);
        countdown.value = null;

        sendNativeNotification(
          '🔔 TenaxLine • Randevu Bildirimi',
          'Ahmet Kaya - Zirkonyum Prova (10 dk kaldı) • Açmak için dokunun',
          {
            url: '/appointments',
            tag: 'test-appointment-lockscreen'
          }
        );
      }
    }, 1000);
  };

  // Belirli bir randevunun test bildirimini düşür
  const testAppointmentNotification = (item: NotificationItem) => {
    const doctorSuffix = item.doctorName ? ` • ${item.doctorName}` : '';
    sendNativeNotification(
      `⏰ Randevu Hatırlatıcı (${item.timeLabel})`,
      `${item.patientName} - ${item.procedure} (Saat: ${item.time})${doctorSuffix}`,
      {
        url: '/appointments',
        tag: `apt-${item.id}`
      }
    );
  };

  // Yaklaşan Randevuları API'den Çek ve Analiz Et
  const loadNotifications = async () => {
    try {
      isLoading.value = true;
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const appointments: any = await $fetch('/api/appointments', {
        params: {
          startDate: todayStr,
          endDate: tomorrowStr
        }
      });
      if (!Array.isArray(appointments)) {
        notifications.value = [];
        return;
      }

      const dismissed = getDismissedNotifs();
      const list: NotificationItem[] = [];

      appointments.forEach((apt: any) => {
        if (!apt || apt.status === 'cancelled' || apt.status === 'completed' || apt.status === 'postponed') return;
        if (!apt.date) return;
        const aptId = String(apt._id || '');
        if (aptId && dismissed.includes(aptId)) return;

        const timeStr = apt.time || '09:00';
        const aptDateTime = new Date(`${apt.date}T${timeStr}:00`);
        if (isNaN(aptDateTime.getTime())) return;

        const diffMs = aptDateTime.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        // Güvenli Hasta İsmi Alma
        let patientName = 'Bilinmeyen Hasta';
        let patientIdStr: string | undefined = undefined;

        if (apt.patientId && typeof apt.patientId === 'object') {
          const fn = apt.patientId.firstName || '';
          const ln = apt.patientId.lastName || '';
          patientName = `${fn} ${ln}`.trim() || 'İsimsiz Hasta';
          patientIdStr = apt.patientId._id ? String(apt.patientId._id) : undefined;
        } else if (typeof apt.patientId === 'string' && apt.patientId) {
          patientIdStr = apt.patientId;
        } else if (apt.patientName) {
          patientName = apt.patientName;
        }

        // Hekim İsmi Alma
        let doctorName = '';
        if (apt.doctorId && typeof apt.doctorId === 'object' && apt.doctorId.name) {
          doctorName = apt.doctorId.name;
        }

        // 1. Bugün Yaklaşan Randevular
        if (apt.date === todayStr) {
          let timeLabel = '';
          let isUrgent = false;

          if (diffMins > 0 && diffMins <= 60) {
            timeLabel = `${diffMins} dk kaldı`;
            isUrgent = true;
          } else if (diffMins > 0) {
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            timeLabel = `${hours} sa ${mins} dk`;
          } else if (diffMins <= 0 && diffMins >= -120) {
            timeLabel = 'Şu an / Seans devam ediyor';
            isUrgent = true;
          } else {
            timeLabel = 'Günü geçti';
          }

          list.push({
            id: String(apt._id || Math.random()),
            patientName,
            procedure: apt.procedure || 'Muayene',
            time: timeStr,
            date: apt.date,
            type: 'today',
            timeLabel,
            isUrgent,
            diffMins,
            patientId: patientIdStr,
            doctorName
          });

          // Otomatik Push Bildirimi (Son 30 dk içinde ve henüz gönderilmediyse)
          if (diffMins > 0 && diffMins <= 30 && permission.value === 'granted') {
            const notifKey = `${apt._id}_30min`;
            if (!hasBeenNotifiedRecently(notifKey)) {
              markNotified(notifKey);
              const doctorSuffix = doctorName ? ` • ${doctorName}` : '';
              sendNativeNotification(
                `⏰ Randevu Yaklaştı (${diffMins} dk kaldı)`,
                `${patientName} - ${apt.procedure || 'Muayene'} (Saat: ${timeStr})${doctorSuffix}`,
                {
                  url: '/appointments',
                  tag: `apt-${apt._id}-30m`
                }
              );
            }
          }
        }
        // 2. Yarınki Randevular
        else if (apt.date === tomorrowStr) {
          list.push({
            id: String(apt._id || Math.random()),
            patientName,
            procedure: apt.procedure || 'Muayene',
            time: timeStr,
            date: apt.date,
            type: 'tomorrow',
            timeLabel: 'Yarın',
            isUrgent: false,
            diffMins: diffMins || 9999,
            patientId: patientIdStr,
            doctorName
          });
        }
      });

      // Zamanına göre sırala
      notifications.value = list.sort((a, b) => (a.diffMins || 9999) - (b.diffMins || 9999));
    } catch (err) {
      console.error('Bildirimler yüklenirken hata:', err);
      notifications.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  // Toast Bildirimi Yardımcısı
  const triggerToast = (message: string, type: string = 'info') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message, type }
      }));
    }
  };

  const unreadCount = computed(() => {
    return notifications.value.filter(n => n.type === 'today').length;
  });

  onMounted(() => {
    checkSupport();
    loadNotifications();
    // Her 2 dakikada bir randevu kontrolü
    checkInterval = setInterval(() => {
      loadNotifications();
    }, 2 * 60 * 1000);
  });

  onUnmounted(() => {
    if (checkInterval) clearInterval(checkInterval);
    if (countdownTimer) clearInterval(countdownTimer);
  });

  return {
    isSupported,
    permission,
    notifications,
    unreadCount,
    isLoading,
    countdown,
    requestPermission,
    sendNativeNotification,
    triggerInstantTest,
    triggerDelayedLockScreenTest,
    testAppointmentNotification,
    loadNotifications,
    dismissNotification,
    dismissAllNotifications,
    resetDismissedNotifications
  };
};
