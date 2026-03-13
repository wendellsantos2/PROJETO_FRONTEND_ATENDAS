<template>
    <Icon
        name="loading"
        size="5rem"
        class="text-primary"
    />
</template>

<script setup lang="ts">
    definePageMeta({
        layout: "auth",
        title: "Encerrando sua sessão",
        scrollToTop: false
    });

    useUserStore()
        .logout()
        .then(async () => await navigateTo("/"));
</script>