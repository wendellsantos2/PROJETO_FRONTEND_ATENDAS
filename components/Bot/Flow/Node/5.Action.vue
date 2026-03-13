<template>
    <BotFlowNode
        v-bind="props"
        awaitForm
        :default="{
            name: 'Executando algo',
            content: 'Um momento...'
        }"
    >
        <template v-if="options?.length" #form="{ model }">
            <SelectElement
                name="action"
                placeholder="Selecione uma ação"
                default="default_pending_for_company"
                :items="options!"
                search
                :native="false"
                :canClear="false"
                :loading="status === 'pending'"
                rules="required"
                class="nowheel"
            />
            <DynamicFields
                name="parameters"
                :options
                parameter="expected"
                :selected="model?.action"
                :context="model"
                :labels="false"
            />
        </template>
    </BotFlowNode>
</template>

<script setup lang="ts">
    import type { ComponentNode, NodeProps } from "~/types/workflow";

    defineOptions({
        flow: {
            name: "Ação"
        }
    } satisfies ComponentNode);

    const props = defineProps<NodeProps>();

    const { $user } = useNuxtApp();

    const { data: options, status } = useLazyAsyncData("bot:actions", async () => {
        const { data: _data } = await useFetchApi(`v1/companies/${$user.value?.company.id}/settings/bots/actions`);

        return useMap(_data, ({ action, label, expected }) => {
            return {
                value: action,
                label,
                expected
            };
        });
    });
</script>

<style lang="postcss">
    .vue-flow__node-action {
        @apply text-white bg-indigo-600;

        & .vue-flow__handle {
            @apply border-indigo-600
        }
    }
</style>