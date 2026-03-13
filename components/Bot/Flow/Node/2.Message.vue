<template>
    <BotFlowNode
        v-bind="props"
        :default="{
            name: 'Explicando',
            content: 'Para entendermos seu caso melhor responda a seguir'
        }"
    />
</template>

<script setup lang="ts">
    import type { ComponentNode, NodeProps } from "~/types/workflow";

    defineOptions({
        flow: {
            name: "Mensagem"
        }
    } satisfies ComponentNode);

    const props = defineProps<NodeProps>();
</script>

<style lang="postcss">
    .vue-flow__node-message {
        @apply bg-secondary text-black;

        & .vue-flow__handle {
            @apply border-secondary;
        }
    }
</style>