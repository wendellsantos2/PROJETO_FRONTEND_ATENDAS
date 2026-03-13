<template>
    <component
        :is="props.tag"
        v-tooltip="{
            content: `<span style='color: color-mix(in srgb, ${_color}, ${useContrastTheme})'>${props.name}</span>`,
            html: true,
            disabled: String(props.name).length < props.resumeString
        }"
        class="inline-flex w-fit flex-row items-center gap-1 whitespace-nowrap rounded-full font-semibold uppercase leading-none"
        :class="[
            _size.class,
            _variant
        ]"
        :style="[
            `--badge-color: ${_color}`,
            `--badge-contrast: ${_contrast}`,
            `--badge-backlight: ${useBacklight(_color, _contrast)}`
        ]"
    >
        <Icon
            v-if="props.icon"
            :name="props.icon"
            :size="_size.icon"
        />
        <span v-if="props.name && props.resumeString" class="truncate">
            {{ useResumeString(props.name, props.resumeString) }}
        </span>
        <slot />
    </component>
</template>

<script setup lang="ts">
    import type { Color } from "~/composables/useColor";
    import { _primary, _secondary, _success, _danger, _warn } from "#tailwind-config/theme/colors";

    const colors = {
        contrast: "hsl(var(--twc-contrast))",
        background: "hsl(var(--twc-background))",
        primary: _primary,
        secondary: _secondary,
        success: _success,
        danger: _danger,
        warn: _warn,
        orange: "#f97316",
        indigo: "#6366f1",
        yellow: "#EAB308",
        pink: "#db2777"
    };

    type Colors = keyof typeof colors;

    const variants = /* @tw */ {
        solid: "bg-[--badge-color] text-[--badge-contrast]",
        outline: "bg-transparent text-[--badge-color] ring-1 ring-[--badge-color]",
        soft: "bg-[--badge-backlight] text-[--badge-color]",
        subtle: "bg-[--badge-backlight] text-[--badge-color] ring-1 ring-[--badge-color]"
    };

    const sizes = /* @tw */ {
        xs: {
            class: "px-1 py-0.5 text-xs",
            icon: "0.625rem"
        },
        sm: {
            class: "px-2 py-1 text-sm",
            icon: "0.75rem"
        },
        none: {
            class: "",
            icon: ""
        }
    };

    export interface Badge {
        color?: Colors | `#${string}` | `hsl(var(${string}))`
        contrast?: ReturnType<typeof useContrast>
        variant?: keyof typeof variants
        size?: keyof typeof sizes
        icon?: string | false
        name?: string | false
        resumeString?: number
        tag?: string
    };

    const props = withDefaults(defineProps<Badge>(), {
        color: "contrast",
        variant: "soft",
        size: "xs",
        icon: "tag",
        name: "???",
        resumeString: 10,
        tag: "span"
    });

    const _color = computed(() => {
        return (colors[props.color as Colors] ?? props.color) as Color;
    });

    const _variant = computed(() => variants[props.variant]);
    const _size = computed(() => sizes[props.size]);

    const _contrast = computed(() => props.contrast ?? useContrast(_color.value));
</script>