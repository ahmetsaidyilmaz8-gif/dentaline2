// https://nuxt.com/docs/api/configuration/nuxt-config
// Updated configuration
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
    componentInspector: true,
    vscode: {
      // Yerel Cursor kullanıldığında VS Code Server çakışmasını önler
      enabled: false
    }
  },
  sourcemap: {
    server: true,
    client: true
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon'
  ],
  tailwindcss: {
    exposeConfig: true,
    config: {
      darkMode: 'class',
      content: [
        "./app/**/*.{vue,js,ts,jsx,tsx}",
        "./components/**/*.{vue,js,ts,jsx,tsx}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./nuxt.config.{js,ts}",
        "./app.vue",
      ],
      theme: {
        extend: {}
      }
    }
  },
  app: {
    head: {
      title: 'TenaxLine | Diş Polikliniği Yönetim Sistemi',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'description', content: 'TenaxLine - Profesyonel Diş Polikliniği Hasta Yönetim Sistemi' },
        { name: 'theme-color', content: '#0d9488' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'TenaxLine' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png?v=2' },
        { rel: 'shortcut icon', href: '/favicon.ico?v=2' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ],
      script: [
        {
          innerHTML: `
            (function() {
              const theme = localStorage.getItem('theme') || 'light';
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            })()
          `,
          type: 'text/javascript'
        }
      ]
    }
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dentaline'
  },
  nitro: {
    routeRules: {
      '/api/backup/**': { maxDuration: 60 }
    }
  }
})
