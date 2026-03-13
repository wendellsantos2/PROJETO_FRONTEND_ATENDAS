<template>
    <div
        class="z-0 flex flex-col gap-3"
        :class="{ 'nodrag cursor-no-drop': props.selected }"
    >
        <div class="-mx-3 -mt-3 flex flex-row items-center justify-between *:leading-none">
            <TransitionOpacity mode="out-in">
                <span v-if="creating" class="flex flex-row items-center gap-1 opacity-60">
                    <Icon name="loading" />
                    Criando...
                </span>
                <span v-else class="font-bold leading-none opacity-20">
                    #{{ props.id }}
                </span>
            </TransitionOpacity>

            <VMenu
                v-show="!creating"
                placement="right-start"
                :showTriggers="['click', 'focus']"
                :hideTriggers="['click']"
                :skidding="-10"
            >
                <button>
                    <Icon name="menu" />
                </button>

                <template #popper>
                    <ul class="flex flex-col divide-y divide-background/20 *:flex *:cursor-pointer *:flex-row *:items-center *:gap-2 *:p-3 *:transition-all *:duration-300">
                        <li
                            class="hover:bg-warn/20 hover:text-warn"
                            @click="emits('duplicate', node)"
                        >
                            <Icon name="duplicate" />
                            Duplicar
                            <kbd>CTRL + D</kbd>
                        </li>
                        <li
                            class="hover:bg-danger/20 hover:text-danger"
                            @click="removeNodes(props.id)"
                        >
                            <Icon name="delete" />
                            Deletar
                            <kbd>Backspace</kbd>
                        </li>
                    </ul>
                </template>
            </VMenu>
        </div>

        <div
            class="group z-10 flex flex-col gap-3"
            :class="{ 'focus pointer-events-none': !props.selected }"
        >
            <slot v-if="!creating">
                <Handle
                    v-if="props.handleTarget"
                    type="target"
                    :position="Position.Left"
                />
                <Handle
                    v-if="props.handleSource"
                    type="source"
                    :position="Position.Right"
                    connectable="single"
                />
            </slot>

            <BotFlowInputAutosize
                v-model="data.name"
                :placeholder="props?.placeholder?.name"
                class="text-xl font-bold"
            />
            <BotFlowInputAutosize
                v-model="data.content"
                :placeholder="props?.placeholder?.content"
            />

            <Vueform
                v-if="$slots?.form"
                v-model="node.data.payload"
                sync
                :endpoint="false"
                size="sm"
                :default="defaults.payload"
                class="w-full"
            >
                <slot
                    name="form"
                    :model="node.data.payload"
                />
            </Vueform>
            <Icon
                v-else-if="props.awaitForm"
                name="loading"
                size="3rem"
                class="m-auto text-primary"
            />

            <slot name="after" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { NodeProps, NodeData, Node } from "~/types/workflow";
    import { Handle, Position, useNode, useVueFlow } from "@vue-flow/core";

    type Props = {
        handleTarget?: boolean
        handleSource?: boolean
        awaitForm?: boolean
        placeholder?: {
            name?: string
            content?: string
        }
        default?: NodeData
    };

    const props = withDefaults(defineProps<Props & NodeProps>(), {
        handleTarget: true,
        handleSource: true,
        awaitForm: false,
        placeholder: () => ({
            name: "Nome",
            content: "Mensagem (cliente)"
        }),
        default: () => ({
            name: "Nome aqui",
            content: "Mensagem aqui"
        })
    });

    const emits = defineEmits<{
        duplicate: [node: Node]
        update: [Node: Pick<Node, "id" | "data">]
    }>();

    const {
        node
    } = useNode<NodeData>();

    const {
        removeNodes
    } = useVueFlow();

    const defaults = ref(useUnRef(props.data));

    const update = (data: NodeData) => {
        const file = data.file;
        data = useUnRef(data);
        defaults.value = data;

        emits("update", { id: props.id, data: { ...data, file } });
    };

    const creating = computed(() => props.id?.includes("NODE"));

    if (creating.value) {
        useAssign(node.data, {
            payload: {},
            ...props.default,
            ...props.data
        });
    }

    watch(() => node.data, (value) => {
        if (!isEqual(value, defaults.value)) {
            update(value);
        }
    }, {
        deep: true,
        immediate: creating.value
    });

    defineExpose({
        creating
    });
</script>