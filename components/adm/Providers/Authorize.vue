<template>
    <Button
        v-tooltip="'Autenticar'"
        target="_blank"
        color="tertiary"
        size="sm"
        @click="open"
    >
        <Icon name="login" size="1.2rem" />
    </Button>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    const props = defineProps<{
        provider: InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]
    }>();

    const { apiBase } = useRuntimeConfig().public;
    const baseUrl = apiBase?.replace("api", "");
    const service = props.provider.service === "instagram" ? "facebook" : props.provider.service;
    const url = `${baseUrl}third-party/${service}/${props.provider.id}/authorize`;
    const width = 600;
    const height = 600;
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);
    const open = () => window.open(url, "_blank", `width=${width},height=${height},top=${top},left=${left}`);
</script>