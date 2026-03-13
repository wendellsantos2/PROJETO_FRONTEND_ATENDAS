<template>
    <ClientOnly>
        <Teleport to="#teleports">
            <Transition
                enterFromClass="!bg-stone-950/0 !backdrop-blur-0"
                leaveToClass="!bg-stone-950/0 !backdrop-blur-0"
                appear
            >
                <div
                    v-show="isOpen"
                    class="scrollbar modal fixed inset-0 z-999 flex overflow-hidden bg-stone-950/80 backdrop-blur-md transition-all duration-300 ease-in-out"
                    :class="[
                        variant.backdrop.base,
                        variant.backdrop[props.size],
                        props.classBackdrop
                    ]"
                    @click="outside"
                >
                    <Transition
                        v-bind="variant.transition"
                        appear
                    >
                        <div
                            v-show="isOpen"
                            class="mt-auto flex max-h-full w-full flex-col overflow-hidden border-white/10 bg-background transition-all duration-300 ease-in-out"
                            :class="[
                                sizes[props.size],
                                variant.container.base,
                                variant.container[props.size],
                                props.classContainer
                            ]"
                        >
                            <slot
                                name="container"
                                v-bind="bind"
                            >
                                <div
                                    class="flex flex-row flex-wrap items-center justify-between gap-6 px-4 pt-6 xs:px-6"
                                    :class="props.classHead"
                                >
                                    <h2
                                        v-if="$slots?.title || props.title"
                                        class="font-bold capitalize"
                                    >
                                        <slot
                                            name="title"
                                            v-bind="bind"
                                        >
                                            {{ props.title }}
                                        </slot>
                                    </h2>

                                    <slot
                                        name="head"
                                        v-bind="bind"
                                    />

                                    <Button
                                        color="danger"
                                        size="sm"
                                        class="flex-none"
                                        @click="toggle(false)"
                                    >
                                        <Icon name="close" size="1.3rem" />
                                    </Button>
                                </div>
                                <div
                                    class="mask-transparent-border overflow-auto px-4 py-6 xs:p-6"
                                    :class="[variant.body, props.classBody]"
                                >
                                    <slot v-bind="bind" />
                                </div>
                            </slot>
                        </div>
                    </Transition>
                </div>
            </Transition>
        </Teleport>
    </ClientOnly>
</template>

<script setup lang="ts" generic="Context extends ContextBase">
    import type { UnwrapRef } from "vue";

    export type ContextBase = {
        [key: string | number]: unknown
        id: string | number
    };

    const sizes = /* @tw */ {
        xs: "max-w-screen-xs",
        sm: "max-w-screen-sm",
        md: "max-w-screen-md",
        lg: "max-w-screen-lg"
    };

    const variants = /* @tw */ {
        center: {
            backdrop: {
                base: "pt-10",
                xs: "xs:py-10",
                sm: "sm:py-10",
                md: "md:py-10",
                lg: "lg:py-10"
            },
            transition: {
                enterFromClass: "translate-y-32 scale-90",
                leaveToClass: "translate-y-32 scale-90"
            },
            container: {
                base: "mt-auto border-t rounded-t-3xl",
                xs: "xs:m-auto xs:border xs:rounded-3xl",
                sm: "sm:m-auto sm:border sm:rounded-3xl",
                md: "md:m-auto md:border md:rounded-3xl",
                lg: "lg:m-auto lg:border lg:rounded-3xl"
            },
            body: ""
        },
        left: {
            backdrop: {
                base: "",
                xs: "",
                sm: "",
                md: "",
                lg: ""
            },
            transition: {
                enterFromClass: "-translate-x-32",
                leaveToClass: "-translate-x-32"
            },
            container: {
                base: "mr-auto grow h-full overflow-hidden",
                xs: "xs:rounded-r-3xl xs:border-r",
                sm: "sm:rounded-r-3xl sm:border-r",
                md: "md:rounded-r-3xl md:border-r",
                lg: "lg:rounded-r-3xl lg:border-r"
            },
            body: "grow"
        },
        right: {
            backdrop: {
                base: "",
                xs: "",
                sm: "",
                md: "",
                lg: ""
            },
            transition: {
                enterFromClass: "translate-x-32",
                leaveToClass: "translate-x-32"
            },
            container: {
                base: "ml-auto grow h-full overflow-hidden",
                xs: "xs:rounded-l-3xl xs:border-l",
                sm: "sm:rounded-l-3xl sm:border-l",
                md: "md:rounded-l-3xl md:border-l",
                lg: "lg:rounded-l-3xl lg:border-l"
            },
            body: "grow"
        }
    };

    const props = withDefaults(defineProps<{
        title?: string
        size?: keyof typeof sizes
        position?: keyof typeof variants
        classContainer?: string
        classBackdrop?: string
        classHead?: string
        classBody?: string
        contextInitial?: Context
    }>(), {
        size: "sm",
        position: "center",
        classContainer: "",
        classHead: "",
        classBody: "flex flex-col gap-6",
        contextInitial: () => ({ id: 0 } as Context)
    });

    const isOpen = ref(false);
    const delayOpen = ref(isOpen.value);

    const variant = computed(() => {
        const get = variants[props.position];

        get.transition.enterFromClass += " opacity-0";
        get.transition.leaveToClass += " opacity-0";

        return get;
    });

    const context = ref<Context>(useUnRef(props.contextInitial));

    const toggle = async (to?: boolean, _context?: Context) => {
        isOpen.value = to ?? !isOpen.value;
        useBodyOverflow(isOpen.value);

        if (!isOpen.value) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        delayOpen.value = isOpen.value;
        context.value = useUnRef(_context ?? props.contextInitial) as UnwrapRef<Context>;
    };

    const open = computed(() => delayOpen.value);
    const bind = computed(() => ({
        open: open.value,
        context: context.value,
        toggle
    }));

    const outside = (event: MouseEvent) => {
        if (event.target === event.currentTarget) {
            toggle(false);
        }
    };

    defineExpose({
        open,
        context,
        toggle
    });
</script>

<style scoped lang="postcss">
    .mask-transparent-b {
        mask-image: linear-gradient(
            180deg,
            #000 calc(100% - 1rem),
            transparent 100%
        );
    }
</style>