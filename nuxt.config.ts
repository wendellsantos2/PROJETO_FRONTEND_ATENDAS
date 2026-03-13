export default defineNuxtConfig({
    modules: [
        "@nuxt/eslint",
        "@pinia/nuxt",
        "pinia-plugin-persistedstate/nuxt",
        "@nuxtjs/google-fonts",
        "@nuxtjs/tailwindcss",
        "@nuxtjs/color-mode",
        "@vueuse/nuxt",
        "@vueform/nuxt",
        "nuxt-lodash",
        "floating-vue/nuxt",
        "@nuxt/icon"
    ],

    ssr: false,

    devtools: {
        enabled: true
    },

    app: {
        head: {
            titleTemplate: "%s %separator Atendas",

            htmlAttrs: {
                lang: "pt-BR"
            },

            link: [
                { rel: "icon", type: "image/x-icon", href: "/favicon/favicon.ico" },
                { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon/1.png" },
                { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon/2.png" },
                { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon/3.png" },
                { rel: "icon", type: "image/png", sizes: "512x512", href: "/favicon/4.png" },
                { rel: "apple-touch-icon", type: "image/png", sizes: "180x180", href: "/favicon/apple-icon.png" }
            ]
        },

        pageTransition: {
            name: "page",
            mode: "out-in"
        },

        layoutTransition: {
            name: "layout",
            mode: "out-in"
        }
    },

    colorMode: {
        fallback: "dark",
        classSuffix: ""
    },

    runtimeConfig: {
        public: {
            apiBase: "",
            broadcastUrl: "",
            broadcastKey: "",
            broadcastCluster: ""
        }
    },

    compatibilityDate: "2024-07-08",

    typescript: {
        strict: true
    },

    eslint: {
        config: {
            stylistic: true
        }
    },

    googleFonts: {
        download: false,
        families: {
            Montserrat: [100, 200, 300, 400, 500, 600, 700, 800, 900]
        }
    },

    icon: {
        customCollections: [{
            prefix: "",
            dir: "./assets/icons"
        }]
    },

    tailwindcss: {
        exposeConfig: true
    }
});