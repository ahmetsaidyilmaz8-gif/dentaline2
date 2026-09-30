<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <!-- Arka plan atmosferik Sisifos görseli ve ışık efektleri -->
    <div class="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
      <!-- Sisifos Kusursuz Geçişli Görsel Katmanı -->
      <div class="relative w-[850px] h-[850px] sm:w-[1000px] sm:h-[1000px] lg:w-[1150px] lg:h-[1150px] flex items-center justify-center">
        <img
          src="/sisyphus_bg.png"
          alt="TenaxLine Atmospheric Background"
          class="w-full h-full object-contain opacity-85 filter blur-[1px] select-none scale-105"
        />
        <!-- Ortam ışığı ve teal aura -->
        <div class="absolute inset-0 bg-teal-500/25 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none"></div>
      </div>
      <!-- İnce genel atmosferik koyuluk -->
      <div class="absolute inset-0 bg-slate-950/20 pointer-events-none"></div>
    </div>

    <!-- Login Kartı -->
    <div class="w-full max-w-md bg-slate-900/55 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl shadow-slate-950/90 relative z-10">
      <!-- Başlık (Sadece TenaxLine) -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-transparent drop-shadow-sm">
          TenaxLine
        </h1>
        <p class="text-xs text-teal-400 font-semibold tracking-widest uppercase mt-1.5">Dental Suite Portal</p>
        <p class="text-slate-400 text-xs mt-2">Devam etmek için lütfen giriş yapın</p>
      </div>

      <!-- Hata Bildirimi -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="errorMessage" class="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs font-medium">
          <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{{ errorMessage }}</span>
        </div>
      </Transition>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Kullanıcı Adı -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Kullanıcı Adı
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon name="heroicons:user" class="w-5 h-5" />
            </div>
            <input
              v-model="username"
              type="text"
              required
              placeholder="Kullanıcı adınızı girin"
              class="w-full bg-slate-950/60 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-white rounded-xl pl-11 pr-4 py-3 text-sm placeholder-slate-500 outline-none transition-all duration-200"
            />
          </div>
        </div>

        <!-- Şifre -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Şifre
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon name="heroicons:lock-closed" class="w-5 h-5" />
            </div>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Şifrenizi girin"
              class="w-full bg-slate-950/60 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-white rounded-xl pl-11 pr-11 py-3 text-sm placeholder-slate-500 outline-none transition-all duration-200"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Giriş Yap Butonu -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full mt-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon v-if="isLoading" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
          <span v-else class="flex items-center gap-2">
            Giriş Yap
            <Icon name="heroicons:arrow-right" class="w-4 h-4" />
          </span>
        </button>
      </form>

      <!-- Alt Bilgi -->
      <div class="mt-8 pt-6 border-t border-slate-800/60 text-center">
        <p class="text-slate-500 text-[11px]">
          TenaxLine Poliklinik Güvenli Erişim Sistemi v2.0
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
});

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);

const { login } = useAuth();
const router = useRouter();

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;

  // Kısa süreli görsel yüklenme efekti
  await new Promise(resolve => setTimeout(resolve, 300));

  const result = await login(username.value, password.value);

  if (result.success) {
    router.push('/');
  } else {
    errorMessage.value = result.message || 'Giriş başarısız oldu.';
  }

  isLoading.value = false;
};
</script>
