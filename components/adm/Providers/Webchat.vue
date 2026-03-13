<template>
    <Button
        v-tooltip="'Incorporar'"
        color="contrast"
        size="sm"
        @click="modal?.toggle(true)"
    >
        <Icon name="code" size="1.2rem" />
    </Button>

    <LazyModal
        ref="modal"
        title="Incorporar webchat"
        size="xs"
    >
        <p>
            Para incorporar o webchat em um site, copie e cole o código abaixo dentro da tag <code class="font-bold text-secondary">&lt;head&gt;</code> ou logo antes do fechamento da tag <code class="font-bold text-secondary">&lt;/body&gt;</code>
        </p>

        <code
            ref="code"
            class="break-all rounded-2xl bg-background-100 p-4"
        >
            <span class="text-contrast/50">&lt;</span>
            <span class="text-primary">script</span>
            <span class="text-warn"> src</span>=<span class="text-success">"{{ useRequestURL().origin }}/externo/webchat/index.js"</span>
            <span class="text-warn"> data-to</span>=<span class="text-success">"{{ props.provider.sender }}"</span>
            <span class="text-contrast/50">&gt;&lt;/</span>
            <span class="text-primary">script</span>
            <span class="text-contrast/50">&gt;</span>
        </code>
        <Button
            :color="copied ? 'success' : 'primary'"
            @click="copy(code?.innerText ?? '')"
        >
            <Icon :name="copied ? 'check' : 'copy'" />
            {{ copied ? 'Copiado!' : 'Copiar' }}
        </Button>
    </LazyModal>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    const props = defineProps<{
        provider: InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]
    }>();

    const modal = useModal();
    const code = ref<HTMLDivElement>();
    const {
        copy,
        copied
    } = useClipboard();
</script>