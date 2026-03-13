<template>
    <LazyButton
        v-slot="scope"
        v-tooltip="'Sincronizar templates do whatsapp oficial'"
        color="success"
        size="sm"
        noChangeLoading
        :action="async () => await useFetchApi(`third-party/whatsapp/sync-templates/${provider.id}`)"
        @then="emits('then')"
    >
        <Icon name="sync" size="1.2rem" :class="{ 'animate-spin': scope.loading }" />
    </LazyButton>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    const {
        provider
    } = defineProps<{
        provider: InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]
    }>();

    const emits = defineEmits<{
        then: []
    }>();
</script>