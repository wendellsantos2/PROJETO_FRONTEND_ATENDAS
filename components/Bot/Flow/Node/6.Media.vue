<template>
    <BotFlowNode
        ref="flowNode"
        v-bind="props"
        :default="{
            name: 'Enviando mídia',
            content: 'Olha isso'
        }"
    >
        <template #form>
            <VFileElement
                ref="fileElement"
                name="upload_id"
                view="col"
            />
            <HiddenElement
                ref="messageType"
                name="message_type"
                :meta="true"
                default="file"
            />
        </template>
    </BotFlowNode>
</template>

<script setup lang="ts">
    import type { NodeProps, ComponentNode } from "~/types/workflow";
    import type { BotFlowNode, File } from "#components";
    import type { ComponentExposed } from "~/types";

    defineOptions({
        flow: {
            name: "Mídia"
        }
    } satisfies ComponentNode);

    const props = defineProps<NodeProps>();

    const fileElement = ref<{ file: InstanceType<typeof File> }>();
    const messageType = ref();

    watch(() => fileElement.value?.file?.upload?.type, (v) => {
        v ? messageType.value?.update(v) : messageType.value?.reset();
    });

    const flowNode = ref<ComponentExposed<typeof BotFlowNode>>();

    onMounted(() => {
        if (!flowNode.value?.creating) {
            const dropFile = props.data?.file;

            if (dropFile) {
                fileElement.value?.file?.setFile(dropFile);
            }
        }
    });
</script>

<style lang="postcss">
    .vue-flow__node-media {
        @apply bg-fuchsia-600 text-white;

        & .vue-flow__handle {
            @apply border-fuchsia-600;
        }
    }
</style>