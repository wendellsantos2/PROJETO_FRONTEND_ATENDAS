<template>
    <BotFlowNode
        awaitForm
        v-bind="props"
        :default="{
            name: 'Validando dados',
            content: 'Um momento...'
        }"
    >
        <Handle
            type="target"
            :position="Position.Top"
            class="!bg-warn"
        />
        <Handle
            :id="props.data.payload?.options?.find((v) => v?.step === 0)?.id"
            type="source"
            :position="Position.Left"
            class="!bg-danger"
            connectable="single"
        />
        <Handle
            :id="props.data.payload?.options?.find((v) => v?.step === 1)?.id"
            type="source"
            :position="Position.Right"
            class="!bg-success"
            connectable="single"
        />

        <template v-if="options?.length" #form="{ model }">
            <SelectElement
                name="condition"
                placeholder="Selecione uma condição"
                default="default_check_opening_hours"
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
                :selected="model?.condition"
                :context="model"
                :labels="false"
            />

            <HiddenElement
                name="options"
                meta
                :default="([
                    {
                        id: useGenerateId('OPTION'),
                        name: 'Falso',
                        step: 0,
                        next_workflow: null
                    },
                    {
                        id: useGenerateId('OPTION'),
                        name: 'Verdadeiro',
                        step: 1,
                        next_workflow: null
                    }
                ] satisfies OPTS)"
            />
        </template>
    </BotFlowNode>
</template>

<script setup lang="ts">
    import type { NodeProps, ComponentNode } from "~/types/workflow";
    import { Handle, Position } from "@vue-flow/core";

    type OPTS = NonNullable<NodeProps["data"]["payload"]>["options"];

    defineOptions({
        flow: {
            name: "Condição"
        }
    } satisfies ComponentNode);

    const props = defineProps<NodeProps>();

    const { $user } = useNuxtApp();

    const { data: options, status } = useLazyAsyncData("bot:conditions", async () => {
        const { data: _data } = await useFetchApi(`v1/companies/${$user.value?.company.id}/settings/bots/conditions`);

        return useMap(_data, ({ condition, label, expected }) => {
            return {
                value: condition,
                label,
                expected
            };
        });
    });
</script>

<style lang="postcss">
    .vue-flow__node-condition {
        @apply bg-quarter text-black;

        & .vue-flow__handle {
            @apply border-quarter;
        }
    }
</style>