<template>
    <AdmProvidersWhatsappAtendasConnect
        :provider
        @then="emits('then')"
    />
    <AdmProvidersWhatsappAtendasTranscript
        v-if="useCheckPermissions(['create_provider', 'update_provider'])"
        :provider
        @then="emits('then')"
    />
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