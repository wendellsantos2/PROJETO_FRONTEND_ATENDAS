<template>
    <BotFlowNode
        v-bind="props"
        :handleSource="false"
        :default="{
            name: 'Fim do atendimento',
            content: 'Seu atendimento chegou ao fim'
        }"
    />
</template>

<script setup lang="ts">
    import type { ComponentNode, NodeProps } from "~/types/workflow";

    defineOptions({
        flow: {
            name: "Finalizador"
        }
    } satisfies ComponentNode);

    const props = defineProps<NodeProps>();
</script>

<style lang="postcss">
    .vue-flow__node-finish {
        @apply bg-danger text-white;

        & .vue-flow__handle {
            @apply border-danger;
        }
    }
</style>