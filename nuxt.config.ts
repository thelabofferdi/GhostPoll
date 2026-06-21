// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxtjs/tailwindcss',
        '@vueuse/nuxt',
    ],

    compatibilityDate: '2026-01-20',

    devtools: { enabled: true },

    // Nitro configuration (Backend)
    nitro: {
        routeRules: {
            '/api/**': {
                cors: true,
                headers: {
                    // Security: Restrict CORS to specific origins in production
                    // In development, allow localhost. In production, set ALLOWED_ORIGINS env var
                    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || (process.env.NODE_ENV === 'production' ? 'https://ghostpoll.pages.dev' : '*'),
                    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Credentials': 'false' // Set to 'true' only if needed with specific origins
                }
            },
        },
        preset: process.env.NITRO_PRESET || 'node-server',
        // Mark client-only dependencies as external
        externals: {
            inline: ['html2canvas']
        },
    },

    // Runtime config
    runtimeConfig: {
        redisUrl: process.env.REDIS_URL || '',
        public: {
            baseUrl: process.env.NUXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000',
        }
    },

    // TypeScript
    typescript: {
        strict: true,
    },
})
