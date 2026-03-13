import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { createThemes } from "tw-colors";

const colors = {
    white: {
        DEFAULT: "#FFFFFF",
        100: "#F6F6F6",
        200: "#EEEEEE",
        300: "#E6E6E6"
    },
    black: {
        DEFAULT: "#262626",
        100: "#2F2F2F",
        200: "#373737",
        300: "#3F3F3F"
    }
};

export default <Partial<Config>> {
    darkMode: "class",

    theme: {
        container: {
            center: true,
            padding: "1rem"
        },
        fontFamily: {
            sans: ["Montserrat", "sans-serif"],
            mono: ["Montserrat", "sans-serif"]
        },
        fontSize: {
            xs: "0.625rem",
            sm: "0.75rem",
            base: "0.875rem",
            lg: "1rem",
            xl: "1.125rem",
            "2xl": "1.25rem",
            "3xl": "1.375rem",
            "4xl": "1.5rem",
            "5xl": "1.5625rem"
        },
        extend: {
            screens: {
                xs: "475px"
            },
            colors: {
                primary: "#07B0F3",
                secondary: "#F2884C",
                tertiary: "#044058",
                quarter: "#22F2F2",
                support: "#3D455E",
                soft: "color-mix(in srgb, #07B0F3 20%, hsl(var(--twc-background)) 100%)",
                danger: "#DC2626",
                warn: "#ca8a04",
                success: "#16A34A",
                ...colors
            }
        }
    },

    content: [
        "./vueform.config.ts",
        "./node_modules/@vueform/vueform/themes/tailwind/**/*.vue",
        "./node_modules/@vueform/vueform/themes/tailwind/**/*.js"
    ],

    plugins: [
        require("@vueform/vueform/tailwind"),

        plugin(function ({ addVariant }) {
            addVariant("activated", "&.activated");
            addVariant("hovact", ["&:hover", "&:active", "&.activated"]);
        }),

        createThemes({
            light: {
                background: colors.white,
                contrast: colors.black
            },
            dark: {
                background: colors.black,
                contrast: colors.white
            }
        })
    ]
};