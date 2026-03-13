<template>
    <BotFlowNode
        v-bind="props"
        awaitForm
        :default="{
            name: 'Resposta com AI',
            content: 'Gere (apenas) uma frase de boas-vindas à empresa'
        }"
        :placeholder="{
            content: 'Comando para AI'
        }"
        :class="{
            'pointer-events-none opacity-30': !useCheckPermissions('has_ai_provider')
        }"
    >
        <template
            v-if="options?.length && useCheckPermissions('has_ai_provider')"
            #form="{ model }"
        >
            <SelectElement
                name="provider_id"
                placeholder="Selecione uma AI"
                :default="options?.at(0)?.value"
                :items="options!"
                search
                :native="false"
                :canClear="false"
                :loading="status === 'pending'"
                class="nowheel"
            />
            <DynamicFields
                name="parameters"
                :options
                parameter="expected"
                :selected="model?.provider_id"
                :context="model"
                :labels="false"
            />
        </template>
    </BotFlowNode>
</template>

<script setup lang="ts">
    import type { NodeProps, ComponentNode } from "~/types/workflow";

    defineOptions({
        flow: {
            name: "AI (inteligência artificial)",
            permissions: "has_ai_provider"
        }
    } satisfies ComponentNode);

    const props = defineProps<NodeProps>();

    const { $user } = useNuxtApp();

    const { data: options, status } = useLazyAsyncData("bot:ais", async () => {
        const _data = await useFetchApi(`v1/companies/${$user.value?.company.id}/settings/bots/ais`);

        return useMap(_data.data, ({ id, name, expected }) => {
            return {
                value: id,
                label: name,
                expected
            };
        });
    });
</script>

<style lang="postcss">
    .vue-flow__node-ai {
        @apply bg-amber-500 text-black;

        & .vue-flow__handle {
            @apply border-amber-500;
        }
    }
</style>