<template>
    <BotFlowNode
        v-bind="props"
        :handleSource="!options.length"
        :default="{
            name: 'Pergunta sobre o problema',
            content: 'Digite uma breve descrição do seu problema'
        }"
    >
        <template #after>
            <TransitionGroup
                v-show="options.length"
                :name="props.selected ? 'list' : ''"
                tag="ul"
                class="z-0 flex grow flex-col gap-3"
            >
                <li
                    v-for="(value, index) in options"
                    :key="value.id"
                    class="relative flex grow flex-row items-center gap-2"
                >
                    <div class="flex shrink-0 grow-0 items-center gap-0.5">
                        <button
                            class="grid aspect-square size-4 place-items-center rounded-full transition-all hover:bg-white/20 disabled:opacity-40"
                            :disabled="index === 0"
                            @click="changeOrder(value.step - 1, value.step)"
                        >
                            <Icon name="arrowUp" size="0.8rem" />
                        </button>
                        <input
                            :value="value!.step"
                            type="number"
                            min="1"
                            :max="options.length"
                            class="no_arrows w-[2.5ch] rounded-md bg-transparent text-center caret-secondary transition-colors duration-300 hover:bg-white/20 focus:bg-black/20"
                            @change="changeOrder(($event.target as HTMLInputElement).value as any, value!.step!, $event as InputEvent)"
                            @click="event => (event.target as HTMLInputElement).select()"
                            @input="event => (event.target as HTMLInputElement).value = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '')"
                        >
                        <button
                            class="grid aspect-square size-4 place-items-center rounded-full transition-all hover:bg-white/20 disabled:opacity-40"
                            :disabled="index === options.length - 1"
                            @click="changeOrder(value.step + 1, value.step)"
                        >
                            <Icon name="arrowDown" size="0.8rem" />
                        </button>
                    </div>

                    <div class="relative -mr-4 flex h-fit grow flex-col pr-4">
                        <BotFlowInputAutosize
                            v-model="value.name"
                            :placeholder="`Opção ${index + 1}`"
                            class="min-h-8 w-full bg-white/20 pr-2"
                        />

                        <div class="absolute right-4 top-0 flex -translate-y-1/2 flex-row gap-1 *:!p-0.5">
                            <Button
                                v-tooltip="'Duplicar opção'"
                                size="sm"
                                color="warn"
                                @click="push(useOmit(value, ['id', 'step']))"
                            >
                                <Icon name="duplicate" size="0.6rem" />
                            </Button>

                            <Button
                                v-tooltip="'Remover opção'"
                                size="sm"
                                color="danger"
                                @click="remove(index)"
                            >
                                <Icon name="delete" size="0.6rem" />
                            </Button>
                        </div>

                        <Handle
                            :id="value?.id"
                            :key="index"
                            type="source"
                            :position="Position.Right"
                        />
                    </div>
                </li>
            </TransitionGroup>

            <Button
                size="sm"
                color="success"
                class="w-full"
                @click="push({
                    name: `Opção ${options.length + 1}`,
                    step: options.length + 1
                })"
            >
                <Icon name="add" />
                Opção
            </Button>

            <TransitionOpacity>
                <span
                    v-show="!options.length"
                    class="mx-auto max-w-56 text-sm italic"
                >
                    Sem nenhuma opção qualquer valor passado vai prosseguir o fluxo
                </span>
            </TransitionOpacity>
        </template>
    </BotFlowNode>
</template>

<script setup lang="ts">
    import type { NodeProps, ComponentNode, NodeData } from "~/types/workflow";
    import { Handle, Position, useNode, useVueFlow } from "@vue-flow/core";

    defineOptions({
        flow: {
            name: "Entrada de dados"
        }
    } satisfies ComponentNode);

    const props = defineProps<NodeProps>();

    const {
        node
    } = useNode<NodeData>();

    const {
        removeEdges
    } = useVueFlow();

    const options = computed(() => (node.data.payload?.options ?? []).sort((a, b) => a.step - b.step));

    const update = (value: typeof options.value) => {
        node.data.payload!.options = value;

        if (node.data.next_workflow) {
            removeEdges(`${node.id}=>${node.data.next_workflow}`);
            node.data.next_workflow = null;
        }
    };

    const push = (value: Partial<typeof options.value[0]>) => update([...options.value, useAssign({
        id: useGenerateId("OPTION"),
        name: `Opção ${options.value.length + 1}`,
        step: options.value.length + 1,
        next_workflow: null
    }, value)]);

    const remove = (index: number) => {
        update(options.value.filter((_, i) => {
            return i !== index;
        }));
    };

    const changeOrder = (newIndex: number, oldIndex: number, event?: InputEvent) => {
        if (newIndex === oldIndex || newIndex > options.value.length || newIndex < 1) {
            if (event) {
                (event?.target as HTMLInputElement).value = String(oldIndex);
            }

            return;
        }

        const optAtNewIndex = options.value.findIndex(option => Number(option?.step) === Number(newIndex));
        const optAtOldIndex = options.value.findIndex(option => Number(option?.step) === Number(oldIndex));

        if (optAtNewIndex !== -1 && optAtOldIndex !== -1) {
            const copy = useUnRef(options.value);

            copy[optAtNewIndex].step = oldIndex;
            copy[optAtOldIndex].step = newIndex;

            update(copy);
        }
    };
</script>

<style lang="postcss">
    .vue-flow__node-input {
        @apply bg-tertiary text-white;

        & .vue-flow__handle {
            @apply border-tertiary
        }
    }

    .vue-flow {
        & .list-move,
        & .list-enter-active,
        & .list-leave-active {
            @apply transition-all duration-300
        }

        & .list-enter-from,
        & .list-leave-to {
            @apply opacity-0;
        }

        & .list-leave-active {
            @apply absolute;
        }
    }
</style>