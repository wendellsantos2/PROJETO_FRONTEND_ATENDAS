<template>
    <TransitionHeight>
        <div
            v-show="open"
            class="relative"
        >
            <span
                ref="resizer"
                class="absolute -top-2 left-1/2 h-2 w-10 -translate-x-1/2 -translate-y-full cursor-ns-resize rounded-full border border-background bg-contrast transition-all duration-300 user-select-none hover:bg-secondary"
            />

            <div class="overflow-hidden rounded-t-3xl bg-background-200">
                <div
                    class="mask-transparent-border flex max-h-[80vh] flex-col gap-6 overflow-auto p-6"
                    :style="`height: ${height / 16}rem`"
                >
                    <ul class="flex w-full flex-row flex-wrap items-center justify-center gap-6 text-center">
                        <li
                            v-for="(name, key) in props.nodeTypes"
                            :key="key"
                            class="!relative inline-flex min-w-40 flex-col items-center justify-center rounded-full !border-transparent px-4 py-2"
                            :class="`vue-flow__node-${key}`"
                            :draggable="true"
                            @dragstart="dragStart($event, key)"
                        >
                            <strong>
                                {{ name }}
                            </strong>
                        </li>
                    </ul>
                    <hr>

                    <ul class="flex w-full flex-row flex-wrap items-center justify-center gap-4 text-center">
                        <li>
                            <strong>
                                Variáveis de texto disponíveis:
                            </strong>
                        </li>
                        <li
                            v-for="(variable) in variables"
                            :key="variable"
                            class="rounded-lg bg-soft px-2 py-1 font-medium"
                        >
                            {{ "{"+"{"+variable+"}"+"}" }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </TransitionHeight>
</template>

<script setup lang="ts">
    const props = defineProps<{
        nodeTypes: Record<string, string>
    }>();

    const open = ref(false);
    const height = useLocalStorage("bot-sidebar-height", 165);
    const resizer = ref<HTMLSpanElement>();
    const { pressed } = useMousePressed({ target: resizer });
    const mouse = useMouse();

    const watchMouse = watchPausable(() => mouse.y.value, () => {
        const h = window.innerHeight - mouse.y.value - 12;
        height.value = h > 0 ? h : 0;
    });

    watchMouse.pause();

    watch(pressed, (v) => {
        v ? watchMouse.resume() : watchMouse.pause();
    });

    function dragStart (event: DragEvent, type: string) {
        if (event.dataTransfer) {
            event.dataTransfer.clearData();
            event.dataTransfer.setData("vueflow", type);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.dropEffect = "move";
        }
    }

    const { $user } = useNuxtApp();

    const {
        data: variables
    } = useAsyncData("variables", async () => {
        const { data: _data } = await useFetchApi(`v1/companies/${$user.value?.company.id}/settings/bots/variables`);
        return _data;
    }, {
        server: false
    });

    defineExpose({
        open: computed(() => open.value),

        toggle: (to?: boolean) => {
            open.value = to ?? !open.value;
        }
    });
</script>