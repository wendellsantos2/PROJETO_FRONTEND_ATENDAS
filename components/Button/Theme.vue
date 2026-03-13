<template>
    <ClientOnly fallback="tema...">
        <button
            v-tooltip.right="{
                content: `Tema da interface: ${isDark ? 'Dark' : 'light'}`,
                disabled: !$screen.value.lg
            }"
            class="color-background-auto relative z-0 flex size-auto cursor-pointer items-center justify-between rounded-full bg-background text-lg"
            :class="props.class"
            v-bind="$attrs"
            @click="toggle"
        >
            <Icon
                name="sun"
                :class="[_class, isLight]"
            />
            <Icon
                name="moon"
                :class="[_class, isDark]"
            />

            <span
                class="absolute inset-y-0 left-0 z-0 block h-full w-1/2 p-1 transition-all duration-300 ease-linear"
                :class="{ 'translate-x-full': isDark }"
            >
                <span class="block size-full rounded-full bg-primary" />
            </span>
        </button>
    </ClientOnly>
</template>

<script setup lang="ts">
    defineOptions({
        inheritAttrs: false
    });

    const props = withDefaults(defineProps<{
        class?: string
        iconClass?: string
    }>(), {
        class: "bg-background"
    });

    const _class = computed(() => `relative z-1 m-1.5 opacity-50 transition-all duration-300 ease-linear ${props.iconClass}`);

    const colorMode = useColorMode();

    const toggle = () => {
        colorMode.preference = colorMode.preference === "dark" ? "light" : "dark";
    };

    const active = "text-white !opacity-100";

    const isLight = computed(() => {
        return colorMode.value === "light" ? active : null;
    });

    const isDark = computed(() => {
        return colorMode.value === "dark" ? active : null;
    });
</script>