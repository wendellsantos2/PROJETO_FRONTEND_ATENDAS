<template>
    <Icon
        v-if="metadata?.cpf_validado"
        v-tooltip="`CPF ${String(metadata?.cpf_situacao).toLocaleLowerCase()} na receita federal`"
        v-bind="bind"
    />
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    const {
        metadata
    } = defineProps<{
        metadata: InternalApi["v1/contacts/:id"]["get"]["data"]["metadata"]
    }>();

    const bind = computed(() => {
        return {
            Sim: {
                name: "shieldCheck",
                class: "text-success"
            },
            Não: {
                name: "shieldAttention",
                class: "text-danger"
            },
            undefined: {
                name: "",
                class: ""
            }
        }[`${metadata?.cpf_validado}`];
    });
</script>