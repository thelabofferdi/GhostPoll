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
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            },
        },
        // Cloudflare Workers preset
        preset: 'cloudflare-pages',
        // Enable Node.js compatibility
        cloudflare: {
            pages: {
                routes: {
                    exclude: ['/images/*']
                }
            }
        },
        // Compatibility flags for Cloudflare Workers
        compatibilityFlags: ['nodejs_compat'],
        // Mark client-only dependencies as external
        externals: {
            inline: ['html2canvas']
        },
        // Force single file worker
        rollupConfig: {
            output: {
                inlineDynamicImports: true,
            }
        },
        // Fix for relative URLs in Cloudflare Pages
        experimental: {
            wasm: true
        }
    },

    // Runtime config
    runtimeConfig: {
        upstashRedisUrl: process.env.UPSTASH_REDIS_URL || '',
        upstashRedisToken: process.env.UPSTASH_REDIS_TOKEN || '',
        public: {
            baseUrl: process.env.BASE_URL || 'https://ghostpoll.pages.dev',
        }
    },

    // TypeScript
    typescript: {
        strict: true,
    },
})
