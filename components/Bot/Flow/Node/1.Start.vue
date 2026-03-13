<template>
    <BotFlowNode
        v-bind="props"
        :handleTarget="false"
        :default="{
            name: 'Boas vindas',
            content: 'Olá, bem vindo {{contato_nome}}! 👋'
        }"
    />
</template>

<script setup lang="ts">
    import type { ComponentNode, NodeProps } from "~/types/workflow";

    defineOptions({
        flow: {
            name: "Iniciador"
        }
    } satisfies ComponentNode);

    const props = defineProps<NodeProps>();
</script>

<style lang="postcss">
    .vue-flow__node-start {
        @apply bg-contrast text-background;

        & .vue-flow__handle {
            @apply border-contrast;
        }
    }
</style>