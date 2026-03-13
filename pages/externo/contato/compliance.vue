<template>
    <div
        v-if="!token"
        class="flex h-screen w-screen items-center justify-center"
    >
        <Notice
            type="error"
            title="Erro!"
            description="Não conseguimos encontrar esse formulário!"
            class="!w-fit"
        />
    </div>

    <iframe
        v-else
        class="h-screen w-full"
        :src="`https://cadastro.io/${token}`"
        allow="geolocation;camera;fullscreen;accelerometer;gyroscope;magnetometer;"
    />
</template>

<script setup lang="ts">
    definePageMeta({
        layout: false,
        scrollToTop: false
    });

    useSeoMeta({
        title: "Formulário de KYC"
    });

    const router = useRouter();
    const token = ref<string | null>(router.currentRoute.value.query.token as string || null);
</script>