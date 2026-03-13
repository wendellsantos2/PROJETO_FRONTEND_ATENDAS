<!-- eslint-disable vue/no-v-html -->
<template>
    <span
        class="_SVG block"
        :class="{ _SVG_CURRENTCOLOR: currentcolor }"
        v-html="icon"
    />
</template>

<script setup lang="ts">
    import { type Names, svgsImports } from "#build/svgs";

    const props = withDefaults(defineProps<{
        name: Names
        currentcolor?: boolean
    }>(), {
        currentcolor: false
    });

    const loading = `<span class="text-warn animate-ping">${props.name}...</span>`;

    const icon = computedAsync(async () => {
        try {
            return await svgsImports[props.name]();
        }
        catch {
            console.error(`[VSVG] o svg '${props.name}' não existe em 'assets/svgs'`);
            return loading;
        }
    }, loading);
</script>

<style>
    ._SVG svg {
        width: 100%;
        height: auto;
    }

    ._SVG._SVG_CURRENTCOLOR,
    ._SVG._SVG_CURRENTCOLOR * {
        fill: currentColor !important;
    }
</style>