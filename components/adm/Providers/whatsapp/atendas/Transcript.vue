<template>
    <LazyButton
        v-tooltip="activated ? 'Esse provedor só transcreve a mensagem e não armazena nenhum dado do whatsapp conectado' : 'Esse provedor transcreve a mensagem e armazena dados do whatsapp conectado'"
        :color="activated ? 'success' : 'warn'"
        size="sm"
        :action="toggle"
    >
        <Icon name="speech" size="1.2rem" />
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

    const activated = computed(() => provider.metadata.only_transcript);

    const toggle = async () => {
        await useFetchApi(`third-party/whatsapp/session/${provider.id}/only-transcript`, {
            method: "POST",
            body: {
                only_transcript: !activated.value
            }
        });

        emits("then");
    };
</script>