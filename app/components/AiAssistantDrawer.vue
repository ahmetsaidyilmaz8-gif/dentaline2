<template>
  <div>
    <!-- Sabit AI Asistan Butonu (Mobilde Sol Altta, Masaüstünde Sağ Altta - Hamburger Menüyle Çakışmaz) -->
    <div class="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 lg:left-auto lg:right-6 lg:bottom-6 z-40 flex items-center">
      <button
        @click="toggleDrawer"
        class="relative group flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-600 text-white rounded-2xl shadow-xl shadow-teal-600/30 hover:shadow-teal-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-teal-400/30"
        title="Yapay Zeka Klinik Asistanı"
      >
        <span class="absolute -top-1 -right-1 flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-teal-400"></span>
        </span>
        <Icon name="heroicons:sparkles" class="w-5 h-5 text-teal-100 group-hover:rotate-12 transition-transform duration-300" />
        <span class="text-xs font-bold tracking-wide">AI Asistan</span>
      </button>
    </div>

    <!-- Asistan Modal / Pencere -->
    <Transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-8 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transform transition duration-200 ease-in"
      leave-to-class="translate-y-8 opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed bottom-20 left-3 right-3 sm:left-6 sm:right-auto lg:left-auto lg:right-6 z-50 sm:w-[440px] max-h-[85vh] h-[640px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors"
      >
        <!-- Başlık Çubuğu -->
        <div class="px-5 py-4 bg-gradient-to-r from-teal-600/10 via-emerald-600/10 to-transparent border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Icon name="heroicons:sparkles" class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">Klinik Asistanı</h3>
                <span class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  Gemini Flash
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Randevu ve Hatırlatıcı Yönetimi</p>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button
              v-if="messages.length > 1"
              @click="clearChat"
              class="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-xs"
              title="Sohbeti Temizle"
            >
              <Icon name="heroicons:trash" class="w-4 h-4" />
            </button>
            <button
              @click="isOpen = false"
              class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Hızlı Komut Butonları -->
        <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            v-for="chip in quickChips"
            :key="chip.text"
            @click="sendQuickPrompt(chip.prompt)"
            class="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700/80 rounded-lg whitespace-nowrap shadow-2xs hover:border-teal-500 transition-colors"
          >
            {{ chip.text }}
          </button>
        </div>

        <!-- Mesaj Listesi (Kaydırılabilir) -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 text-xs">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="[
              msg.role === 'user' ? 'justify-end' : 'justify-start',
              'flex gap-2.5'
            ]"
          >
            <!-- AI Avatar -->
            <div
              v-if="msg.role === 'assistant'"
              class="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5"
            >
              <Icon name="heroicons:sparkles" class="w-3.5 h-3.5" />
            </div>

            <!-- Mesaj Balonu -->
            <div
              :class="[
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl rounded-tr-xs shadow-md shadow-teal-600/10'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl rounded-tl-xs shadow-2xs',
                'max-w-[85%] px-3.5 py-2.5 leading-relaxed break-words whitespace-pre-wrap font-medium'
              ]"
            >
              <div v-html="formatMessage(msg.content)"></div>
            </div>
          </div>

          <!-- Düşünüyor / Yükleniyor İndikatörü -->
          <div v-if="isLoading" class="flex gap-2.5 justify-start items-center">
            <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shrink-0">
              <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5 animate-spin" />
            </div>
            <div class="bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-2xl rounded-tl-xs border border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
              <span class="ml-1 text-[11px]">İşleniyor...</span>
            </div>
          </div>
        </div>

        <!-- Alt Giriş Kutusu -->
        <div class="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          <form @submit.prevent="sendMessage" class="flex items-end gap-2">
            <div class="relative flex-1">
              <textarea
                ref="inputRef"
                v-model="userInput"
                @keydown.enter.exact.prevent="sendMessage"
                rows="1"
                placeholder="Örn: 'Yarın 14:00'e Melike'ye kontrol randevusu yaz'..."
                class="w-full px-3.5 py-2.5 pr-10 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white resize-none max-h-24 transition-all"
                :disabled="isLoading"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="!userInput.trim() || isLoading"
              class="h-9 w-9 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm"
              title="Gönder"
            >
              <Icon name="heroicons:paper-airplane" class="w-4 h-4 -rotate-45" />
            </button>
          </form>
          <div class="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1">
            <span>Enter: Gönder • Shift+Enter: Yeni Satır</span>
            <span>Doğal Dille Klinik Yönetimi</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';

const isOpen = ref(false);
const isLoading = ref(false);
const userInput = ref('');
const inputRef = ref(null);
const messagesContainer = ref(null);

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('toggle-ai-assistant', toggleDrawer);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('toggle-ai-assistant', toggleDrawer);
  }
});

const initialWelcome = `Merhaba! Ben **TenaxLine Klinik Asistanınızım** 🩺✨

Bana doğrudan Türkçe talimat verebilirsiniz:
* 👤 *"Leyla Karagöl"* veya *"Berivan Peker hasta bilgisi"*
* 🔍 *"Berivan Peker bakiye sorgula"* veya *"Leyla Karagöl borcu ne kadar?"*
* 📅 *"Yarın saat 14:30'a Melike Bağdat'a kontrol randevusu yaz"*
* ⏰ *"27 Eylül'e Sude İpek için kanal tedavisi hatırlatıcısı ekle"*
* 💳 *"Ahmet Yılmaz için 15 Ekim'e 5.000 TL taksit ödeme hatırlatıcısı ekle"*
* ⏸️ *"Melike Bağdat'ın randevusunu ertele"*
* 🗑️ *"Melike Bağdat'ın randevusunu sil/iptal et"*
* 📝 *"Ahmet Yılmaz'ın randevu notunu düzenle: Panoramik film çekilecek"*
* 📋 *"Bugün hangi randevularım var?"*

Size nasıl yardımcı olabilirim?`;

const messages = ref([
  { role: 'assistant', content: initialWelcome }
]);

const quickChips = [
  { text: '👤 Hasta Bilgisi / Arama', prompt: 'Kayıtlı bir hastanın iletişim ve bakiye bilgilerini sorgulamak istiyorum.' },
  { text: '🔍 Bakiye / Borç Sorgula', prompt: 'Hastanın kalan borcunu ve ne kadar ödediğini öğrenmek istiyorum.' },
  { text: '📋 Bugünün Randevuları', prompt: 'Bugün hangi randevularım var?' },
  { text: '📅 Yarına Randevu Ekle', prompt: 'Yarın saat 11:00\'e kontrol randevusu oluşturmak istiyorum.' },
  { text: '⏰ Tedavi Hatırlatıcısı Ekle', prompt: 'Hastaya tedavi takibi için hatırlatıcı eklemek istiyorum.' },
  { text: '💳 Ödeme Hatırlatıcısı Ekle', prompt: 'Hastaya kalan bakiye için ödeme hatırlatıcısı eklemek istiyorum.' },
  { text: '⏸️ Randevu Ertele', prompt: 'Randevunun durumunu ertelendi olarak güncellemek istiyorum.' },
  { text: '🗑️ Randevu Sil', prompt: 'Hastanın randevusunu silmek istiyorum.' },
  { text: '📝 Randevu Notu Yaz', prompt: 'Randevunun notunu düzenlemek istiyorum.' }
];

const toggleDrawer = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom();
      inputRef.value?.focus();
    });
  }
};

const sendQuickPrompt = (prompt) => {
  userInput.value = prompt;
  sendMessage();
};

const clearChat = () => {
  messages.value = [{ role: 'assistant', content: initialWelcome }];
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatMessage = (content) => {
  if (!content) return '';
  let formatted = content
    // 1. Satır başı asteriks/tire liste imlerini kurşun noktaya dönüştür (italik yıldızlarıyla çakışmayı kesinlikle önler)
    .replace(/^([ \t]*)[*-][ \t]+/gm, '$1• ')
    // 2. Rakam ve ay adı ayrışmasını onar (örn: 2\n7 Eylül -> 27 Eylül veya 27\nEylül -> 27 Eylül)
    .replace(/(\b\d)\s*\n\s*(\d\s+(?:Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık))/gi, '$1$2')
    .replace(/(\b\d{1,2})\s*\n\s*(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)/gi, '$1 $2')
    // 3. Kalın metinler: **kalın**
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    // 4. İtalik metinler: *italik* (güvenli eşleşme)
    .replace(/(?<!\*)\*([^\*\n]+)\*(?!\*)/g, '<em class="italic">$1</em>')
    // 5. Satır içi kod: `kod`
    .replace(/`([^`\n]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px]">$1</code>');
  return formatted;
};

const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || isLoading.value) return;

  messages.value.push({ role: 'user', content: text });
  userInput.value = '';
  isLoading.value = true;
  nextTick(() => scrollToBottom());

  try {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
    const activeCalendarDate = (typeof window !== 'undefined' && window.__activeCalendarDate) || null;
    const res = await $fetch('/api/ai/chat', {
      method: 'POST',
      body: {
        messages: messages.value.map(m => ({ role: m.role, content: m.content })),
        timeZone: userTimeZone,
        calendarDate: activeCalendarDate
      }
    });

    const reply = res?.reply || 'İşleminiz tamamlandı.';
    messages.value.push({ role: 'assistant', content: reply });

    // Sayfadaki takvim, randevular ve bildirim/hatırlatıcı merkezinin anlık güncellenmesi için eventleri tetikle
    window.dispatchEvent(new CustomEvent('refresh-stats'));
    window.dispatchEvent(new CustomEvent('reminders-updated'));
  } catch (error) {
    console.error('AI iletişim hatası:', error);
    messages.value.push({
      role: 'assistant',
      content: `⚠️ Üzgünüm, isteğiniz işlenirken bir sorun oluştu: ${error.message || 'Bilinmeyen hata'}`
    });
  } finally {
    isLoading.value = false;
    nextTick(() => {
      scrollToBottom();
      inputRef.value?.focus();
    });
  }
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
