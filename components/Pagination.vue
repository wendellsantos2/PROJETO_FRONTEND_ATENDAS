<template>
    <div class="flex flex-row items-center justify-between gap-6">
        <p
            class="text-sm xs:text-base"
            :class="{ 'max-sm:mx-auto max-sm:text-center': props.pages <= 1 }"
        >
            <strong>{{ props.length }}</strong> <span class="opacity-80">resultado{{ props.length !== 1 ? 's' : '' }} de</span> <strong>{{ props.total }}</strong> <span class="opacity-80">registro{{ props.total !== 1 ? 's' : '' }}</span>
        </p>
        <nav
            v-show="props.pages > 1"
            class="relative flex max-w-[60%] flex-row justify-between rounded-md text-center text-contrast-300 sm:max-w-screen-xs"
            :class="props.addClass"
        >
            <TransitionWidth>
                <Button
                    v-show="buttons.left"
                    size="sm"
                    variant="transparent"
                    class="size-8 flex-none !p-0"
                    @click="emit('change', props.current - 1)"
                >
                    <Icon name="arrowLeft" />
                </Button>
            </TransitionWidth>
            <div
                ref="scroller"
                class="mask-transparent-x no_scrollbar peer flex grow cursor-w-resize flex-row gap-1 overflow-y-visible overflow-x-scroll scroll-smooth px-2 *:flex *:flex-none *:items-center *:justify-center *:px-2"
                @wheel="onWheel"
            >
                <template v-for="index in pagination" :key="index">
                    <button
                        v-if="typeof index === 'number'"
                        :id="_id(index)"
                        class="min-h-8 min-w-8 rounded-full py-1 transition-all duration-300 hover:bg-primary/20 hover:text-primary"
                        :class="{ 'pointer-events-none bg-primary text-white': props.current === index }"
                        @click="emit('change', index)"
                    >
                        {{ index }}
                    </button>
                    <span v-else class="size-8">
                        {{ index }}
                    </span>
                </template>
            </div>
            <TransitionWidth>
                <Button
                    v-show="buttons.right"
                    size="sm"
                    variant="transparent"
                    class="size-8 flex-none !p-0"
                    @click="emit('change', props.current + 1)"
                >
                    <Icon name="arrowRight" />
                </Button>
            </TransitionWidth>
            <div class="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden translate-y-full whitespace-nowrap text-center text-xs font-bold text-danger opacity-0 transition-all duration-300 peer-hover:z-0 peer-hover:opacity-100 lg:block">
                Rolagem para o eixo X.
            </div>
        </nav>
    </div>
</template>

<script setup lang="ts">
    export type Pagination = {
        current: number
        pages: number
        total: number
        length: number
    };

    const props = withDefaults(defineProps<{
        addClass?: string
    } & Pagination>(), {
        addClass: "md:max-w-[20rem]"
    });

    const emit = defineEmits<{
        change: [page: number]
    }>();

    const pagination = computed(() => {
        const start = Math.max(1, props.current - 25);
        const end = Math.min(start + 49, props.pages);

        const pages: (number | string)[] = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (pages.at(0) !== 1) {
            pages.unshift("...");
            pages.unshift(1);
        }

        if (pages.at(-1) !== props.pages) {
            pages.push("...");
            pages.push(props.pages);
        }

        return pages;
    });

    const buttons = computed(() => {
        return {
            left: props.current !== 1,
            right: props.current !== props.pages
        };
    });

    const scroller = ref<HTMLDivElement>();

    const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        scroller.value!.scrollLeft += event.deltaY * 2;
    };

    const _id = (id: number) => `index-${id}`;

    onMounted(() => {
        watch(() => props.current, (id) => {
            if (scroller.value) {
                const element = scroller.value.querySelector(`#${_id(id)}`)!;
                const elementRect = element.getBoundingClientRect();
                const scrollerRect = scroller.value.getBoundingClientRect();
                const left = elementRect.left - scrollerRect.left + scroller.value?.scrollLeft;
                scroller.value.scrollLeft = left - scroller.value?.clientWidth / 2 + element.clientWidth / 2;
            }
        }, {
            immediate: true,
            flush: "post"
        });
    });
</script>

<style scoped lang="postcss">
    .mask-transparent-x {
        mask-image: linear-gradient(
            90deg,
            transparent 0%,
            #000 0.5rem,
            #000 calc(100% - 0.5rem),
            transparent 100%
        );
    }
</style>