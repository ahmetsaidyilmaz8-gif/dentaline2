export default defineNuxtRouteMiddleware((to) => {
  const authCookie = useCookie<string | null>('tenax_auth');
  const doctorIdCookie = useCookie<string | null>('tenax_doctor_id');

  let isLoggedIn = authCookie.value === 'logged_in' && !!doctorIdCookie.value;

  // Çevrimdışı ve WebView toleransı: Eğer cookie okunamadıysa localStorage'dan kontrol et
  if (!isLoggedIn && process.client) {
    try {
      const localAuth = localStorage.getItem('tenax_auth');
      const localDoctorId = localStorage.getItem('tenax_doctor_id');
      if (localAuth === 'logged_in' && localDoctorId) {
        isLoggedIn = true;
        authCookie.value = 'logged_in';
        doctorIdCookie.value = localDoctorId;
      }
    } catch {}
  }

  // Giriş yapmamış kullanıcıyı /login sayfasına yönlendir
  if (!isLoggedIn && to.path !== '/login') {
    return navigateTo('/login');
  }

  // Zaten giriş yapmış kullanıcıyı /login yerine ana sayfaya yönlendir
  if (isLoggedIn && to.path === '/login') {
    return navigateTo('/');
  }
});
