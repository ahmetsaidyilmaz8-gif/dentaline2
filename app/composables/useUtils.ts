// Global yardımcı fonksiyonlar ve sabitler
export const useUtils = () => {

  // Tarihleri GG.AA.YYYY formatında görüntüler
  const formatDate = (dateStr: string | Date | undefined): string => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return String(dateStr);
    }
  };

  // Tarihleri "9 Haziran 2026 Salı" formatında uzun görüntüler
  const formatDateLong = (dateStr: string | Date | undefined): string => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return String(dateStr);
    }
  };

  // Tarih ve Saati GG.AA.YYYY SA:DK formatında görüntüler
  const formatDateTime = (dateStr: string | Date | undefined): string => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(dateStr);
    }
  };

  // Bugünü YYYY-MM-DD dizesi olarak döner (input[type="date"] için)
  const todayStr = (): string => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Yaş hesaplar
  const calculateAge = (birthDateStr: string | undefined): number | null => {
    if (!birthDateStr) return null;
    try {
      const birth = new Date(birthDateStr);
      const today = new Date();
      if (isNaN(birth.getTime())) return null;
      let age = today.getFullYear() - birth.getFullYear();
      const mDiff = today.getMonth() - birth.getMonth();
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  // Para birimi formatlama (örn: 1.250,00 ₺)
  const formatCurrency = (amount: number | string | undefined): string => {
    const n = Number(amount) || 0;
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(n) + ' ₺';
  };

  // TC Kimlik No Algoritma Doğrulaması
  const validateTC = (tc: string): boolean => {
    if (!tc || tc.length !== 11) return false;
    if (!/^\d{11}$/.test(tc)) return false;
    if (tc[0] === '0') return false;
    const digits = tc.split('').map(Number);
    const odd = (digits[0] ?? 0) + (digits[2] ?? 0) + (digits[4] ?? 0) + (digits[6] ?? 0) + (digits[8] ?? 0);
    const even = (digits[1] ?? 0) + (digits[3] ?? 0) + (digits[5] ?? 0) + (digits[7] ?? 0);
    const d10 = (odd * 7 - even) % 10;
    const d11 = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
    return d10 === digits[9] && d11 === digits[10];
  };

  // Telefon Formatlama (örn: (532) 123 45 67)
  const formatPhone = (phone: string | undefined): string => {
    if (!phone) return '—';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)} ${clean.slice(6, 8)} ${clean.slice(8)}`;
    } else if (clean.length === 11 && clean[0] === '0') {
      return `(${clean.slice(1, 4)}) ${clean.slice(4, 7)} ${clean.slice(7, 9)} ${clean.slice(9)}`;
    }
    return phone;
  };

  // İsmin baş harflerinden avatar rengi sınıfı üretir (Tailwind uyumlu)
  const getAvatarColorClass = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) % 5;
    }
    const colors = [
      'bg-teal-500 text-white',
      'bg-sky-500 text-white',
      'bg-indigo-500 text-white',
      'bg-cyan-500 text-white',
      'bg-emerald-500 text-white',
    ];
    return colors[hash] ?? 'bg-teal-500 text-white';
  };

  // İsmin baş harflerini getirir
  const getInitials = (firstName: string | undefined, lastName: string | undefined): string => {
    const f = (firstName || '').trim();
    const l = (lastName || '').trim();
    if (f && l) return (f.charAt(0) + l.charAt(0)).toUpperCase();
    if (f) return f.slice(0, 2).toUpperCase();
    return '?';
  };

  // Sabit Listeler
  const PROCEDURES = [
    'Muayene',
    'Diş Çekimi',
    'Dolgu',
    'Kanal Tedavisi',
    'Protetik Kaplama (Kron)',
    'Köprü',
    'İmplant',
    'Diş Temizliği (Tartar)',
    'Ortodonti Kontrolü',
    'Diş Beyazlatma',
    'Porselen Kaplama',
    'Radyografi (Röntgen)',
    'Diş Eti Tedavisi',
    'Flor Uygulaması',
    'Plak Tedavisi',
    'Ağız Koruyucu Aparey',
    'Geçici Dolgu',
    'Diş Taşı Temizliği',
    'Diğer',
  ];

  const BLOOD_TYPES = ['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-', 'Bilinmiyor'];

  const PAYMENT_METHODS = [
    { value: 'cash', label: 'Nakit', icon: '💵' },
    { value: 'card', label: 'Kredi/Banka Kartı', icon: '💳' },
    { value: 'transfer', label: 'Havale/EFT', icon: '🏦' },
    { value: 'other', label: 'Diğer', icon: '📋' },
  ];

  const getPaymentMethodLabel = (value: string): string => {
    return PAYMENT_METHODS.find(m => m.value === value)?.label || value;
  };

  const getPaymentMethodIcon = (value: string): string => {
    return PAYMENT_METHODS.find(m => m.value === value)?.icon || '📋';
  };

  const APPOINTMENT_STATUSES: Record<string, { label: string; class: string; icon: string }> = {
    pending: { label: 'Bekliyor', class: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50', icon: 'clock' },
    completed: { label: 'Tamamlandı', class: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50', icon: 'check-circle' },
    cancelled: { label: 'İptal Edildi', class: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50', icon: 'x-circle' },
    noshow: { label: 'Gelmedi', class: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700', icon: 'minus-circle' },
    postponed: { label: 'Ertelendi', class: 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50', icon: 'arrow-path' },
  };

  const getStatusInfo = (status: string) => {
    return APPOINTMENT_STATUSES[status] || { label: status, class: 'bg-gray-50 text-gray-500 border-gray-200', icon: 'info' };
  };

  // FDI Diş Haritası Durumları
  const TOOTH_STATUSES: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    healthy: { label: 'Sağlıklı', color: 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', icon: '✓' },
    filled: { label: 'Dolgu', color: 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: '◼' },
    inlay_onlay: { label: 'İnley / Onley', color: 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30', icon: '▰', },
    decay: { label: 'Çürük', color: 'border-rose-500 dark:border-rose-400 text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30', icon: '●' },
    rootcanal: { label: 'Kanal Tedavisi', color: 'border-orange-500 dark:border-orange-400 text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', icon: '⊕' },
    lesion_cyst: { label: 'Periapikal Lezyon / Kist', color: 'border-red-500 dark:border-red-400 text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', icon: '☁' },
    crown: { label: 'Kuron / Kaplama', color: 'border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/30', icon: '♦' },
    bridge: { label: 'Köprü', color: 'border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', icon: '━' },
    veneer: { label: 'Lamine', color: 'border-cyan-500 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30', icon: '▧' },
    implant: { label: 'İmplant', color: 'border-violet-500 dark:border-violet-400 text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30', icon: '⬡' },
    impacted: { label: 'Gömülü Diş', color: 'border-fuchsia-500 dark:border-fuchsia-400 text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', icon: '⧇' },
    missing: { label: 'Eksik Diş', color: 'border-slate-500 dark:border-slate-500 text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', icon: '◌' },
    extraction: { label: 'Diş Çekimi', color: 'border-rose-600 dark:border-rose-400 text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30', icon: '✕' },
    scaling: { label: 'Diş Taşı Temizliği', color: 'border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: '⁕' },
    curettage: { label: 'Küretaj', color: 'border-lime-500 dark:border-lime-400 text-lime-600 dark:text-lime-400', bg: 'bg-lime-50 dark:bg-lime-950/30', icon: '✃' },
  };

  const getToothStatusInfo = (status: string) => {
    return TOOTH_STATUSES[status] || TOOTH_STATUSES.healthy;
  };

  return {
    formatDate,
    formatDateLong,
    formatDateTime,
    todayStr,
    calculateAge,
    formatCurrency,
    validateTC,
    formatPhone,
    getAvatarColorClass,
    getInitials,
    PROCEDURES,
    BLOOD_TYPES,
    PAYMENT_METHODS,
    getPaymentMethodLabel,
    getPaymentMethodIcon,
    APPOINTMENT_STATUSES,
    getStatusInfo,
    TOOTH_STATUSES,
    getToothStatusInfo,
  };
};
