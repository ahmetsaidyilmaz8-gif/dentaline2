export const useAuth = () => {
  const authCookie = useCookie<string | null>('tenax_auth', {
    maxAge: 60 * 60 * 24 * 30, // 30 gün geçerli
    path: '/'
  });
  const doctorIdCookie = useCookie<string | null>('tenax_doctor_id', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  });
  const doctorNameCookie = useCookie<string | null>('tenax_doctor_name', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  });
  const doctorUsernameCookie = useCookie<string | null>('tenax_doctor_username', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  });

  // Çevrimdışı / WebView kalıcılık kurtarma
  if (process.client) {
    try {
      if (!authCookie.value && localStorage.getItem('tenax_auth') === 'logged_in') {
        authCookie.value = 'logged_in';
      }
      if (!doctorIdCookie.value && localStorage.getItem('tenax_doctor_id')) {
        doctorIdCookie.value = localStorage.getItem('tenax_doctor_id');
      }
      if (!doctorNameCookie.value && localStorage.getItem('tenax_doctor_name')) {
        doctorNameCookie.value = localStorage.getItem('tenax_doctor_name');
      }
      if (!doctorUsernameCookie.value && localStorage.getItem('tenax_doctor_username')) {
        doctorUsernameCookie.value = localStorage.getItem('tenax_doctor_username');
      }
    } catch {
      // localStorage erişim istisnalarını sessizce yut
    }
  }

  const isAuthenticated = computed(() => {
    return authCookie.value === 'logged_in' && !!doctorIdCookie.value;
  });

  const currentDoctor = computed(() => {
    let name = doctorNameCookie.value;
    let id = doctorIdCookie.value;
    let username = doctorUsernameCookie.value;

    if (process.client && (!id || !name)) {
      try {
        id = id || localStorage.getItem('tenax_doctor_id') || '';
        name = name || localStorage.getItem('tenax_doctor_name') || 'Diş Hekimi';
        username = username || localStorage.getItem('tenax_doctor_username') || '';
      } catch {}
    }

    return {
      id: id || '',
      name: name || 'Diş Hekimi',
      username: username || ''
    };
  });

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res: any = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      });

      if (res?.success && res?.user) {
        authCookie.value = 'logged_in';
        doctorIdCookie.value = res.user.id;
        doctorNameCookie.value = res.user.name;
        doctorUsernameCookie.value = res.user.username;

        if (process.client) {
          try {
            localStorage.setItem('tenax_auth', 'logged_in');
            localStorage.setItem('tenax_doctor_id', res.user.id);
            localStorage.setItem('tenax_doctor_name', res.user.name);
            localStorage.setItem('tenax_doctor_username', res.user.username);
          } catch {}
        }

        return { success: true };
      }

      return {
        success: false,
        message: 'Giriş başarısız oldu.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.data?.message || err.message || 'Kullanıcı adı veya şifre hatalı!'
      };
    }
  };

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // sessizce geç
    }

    authCookie.value = null;
    doctorIdCookie.value = null;
    doctorNameCookie.value = null;
    doctorUsernameCookie.value = null;

    if (process.client) {
      try {
        localStorage.removeItem('tenax_auth');
        localStorage.removeItem('tenax_doctor_id');
        localStorage.removeItem('tenax_doctor_name');
        localStorage.removeItem('tenax_doctor_username');
      } catch {}
    }

    const router = useRouter();
    router.push('/login');
  };

  return {
    isAuthenticated,
    currentDoctor,
    login,
    logout
  };
};
