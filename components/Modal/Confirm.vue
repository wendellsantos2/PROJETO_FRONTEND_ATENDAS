<template>
    <Modal
        ref="modal"
        v-slot="contextSlot"
        :title="props.title"
        :contextInitial="props.contextInitial"
        classBackdrop="!z-[9999]"
        size="xs"
    >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-if="_text" v-html="_text" />

        <slot v-bind="contextSlot" />

        <Button
            :color="props.button.color"
            class="w-full"
            :action="async () => await props.action(contextSlot.context)"
            @finally="emit('finally')"
            @then="() => {
                contextSlot.toggle(false);
                emit('then')
            }"
        >
            {{ props.button?.text ?? `Sim, ${props.title}` }}
        </Button>
    </Modal>
</template>

<script setup lang="ts" generic="Context extends ContextBase">
    import type { UnwrapRef } from "vue";
    import type { ContextBase } from "./Index.vue";
    import type { Color } from "~/components/Button/Index.vue";

    const props = withDefaults(defineProps<{
        title: string
        text?: string | boolean
        the?: string
        complement?: string
        button?: {
            color?: Color
            text?: string
        }
        contextInitial?: Context
        action: (context: UnwrapRef<Context> | Context) => Promise<unknown>
    }>(), {
        text: undefined,
        the: "",
        complement: "#{id} {name}",
        button: () => ({
            color: "danger"
        }),
        contextInitial: undefined
    });

    const emit = defineEmits<{
        then: []
        finally: []
    }>();

    const modal = useModal<Context>();

    const _text = computed(() => {
        if (props.text !== false) {
            const text = typeof props.text === "string" ? props.text : `Deseja mesmo ${props.title} ${props.the} ${props.complement}?`;

            const replace = text?.replace(/#?{(.*?)}/g, (get, key: string) => {
                const value = useGet(modal?.value?.context, key.trim()) ?? "???";
                return get.startsWith("#")
                    ? `<strong class='text-secondary'>#${value}</strong>`
                    : `<strong>${value}</strong>`;
            });

            return replace;
        }

        return false;
    });

    defineExpose({
        open: computed(() => modal.value?.open),
        context: computed(() => modal.value?.context),
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>