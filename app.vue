<template>
    <div>
        <Head>
            <Meta name="color-scheme" :content="`only ${$colorMode.preference}`" />
        </Head>

        <Body class="bg-background" />

        <NuxtLoadingIndicator
            :color="`linear-gradient(90deg, ${_primary} 0%, ${_secondary} 100%)`"
            :height="5"
        />

        <LazyLayoutToast />

        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
    import { capitalize } from "vue";
    import { _primary, _secondary } from "#tailwind-config/theme/colors";

    const route = useRouter().currentRoute;

    useSeoMeta({
        title: () => capitalize(route.value.meta.title?.toString() || useStartCase(route.value.name?.toString()?.replace("index", "")?.split("-").join(" ") || ""))
    });
</script>

<style lang="postcss">
    .page-enter-active,
    .page-leave-active,
    .layout-enter-active,
    .layout-leave-active {
        @apply transition-all duration-500 ease-in-out
    }

    .page-enter-from,
    .page-leave-to {
        @apply opacity-0 scale-95
    }

    .layout-enter-from,
    .layout-leave-to {
        @apply blur-sm opacity-0
    }
</style>