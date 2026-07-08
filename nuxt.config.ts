import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Nuxt reads NUXT_APP_BASE_URL from the environment automatically at
  // build time. Set it to "/<repository-name>/" when building for GitHub
  // Pages project sites (see .github/workflows/deploy.yml and README.md).
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'Iv Loterij',
      meta: [
        { name: 'description', content: 'Trekkingsinstrument voor prijzen en winnaars.' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: 'iv-logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap' }
      ]
    }
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()]
  },

  components: [
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components', pathPrefix: false }
  ],

  typescript: {
    strict: true
  }
})
