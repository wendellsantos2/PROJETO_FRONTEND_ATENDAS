<template>
    <component
        :is="href ? NuxtLink : 'button'"
        ref="button"
        :href="href"
        class="
            group/button
            inline-flex
            select-none
            flex-row
            items-center
            justify-center
            gap-2
            overflow-hidden
            rounded-full
            border
            border-transparent
            text-center
            font-medium
            tracking-wide
            !transition-all
            !duration-500

            disabled:pointer-events-none
            disabled:cursor-not-allowed

            activated:cursor-not-allowed
            activated:shadow-none
        "
        :class="[
            _color,
            _size,
            { activated: props.activated || _loading }
        ]"
        :disabled="props.disabled ?? _loading"
        :style="persistDimensions"
        @click="click"
    >
        <TransitionTranslateY>
            <Icon v-if="!canChange" name="loading" class="pointer-events-none animate-spin" />
            <span v-else class="pointer-events-none inline-flex items-center justify-center gap-2" :class="props.addClass">
                <slot :loading="_loading" />
            </span>
        </TransitionTranslateY>
    </component>
</template>

<script setup lang="ts">
    import { NuxtLink } from "#components";

    const base = /* @tw */ {
        solid: "shadow",
        outline: "outline outline-2 shadow hovact:outline-transparent",
        transparent: "bg-transparent",
        gradient: "relative z-0 before:bg-gradient-to-r before:absolute before:inset-0 before:-z-1 before:transition-all before:duration-500 before:hovact:opacity-0"
    };

    const colors = /* @tw */ {
        primary: {
            solid: "bg-primary text-white",
            outline: "outline-primary text-primary",
            transparent: "",
            gradient: "from-primary to-quarter text-white",
            hovact: "hovact:bg-contrast hovact:text-primary hovact:border-primary hover:shadow-primary"
        },
        secondary: {
            solid: "bg-secondary text-white",
            outline: "outline-secondary text-secondary",
            transparent: "text-secondary",
            gradient: "",
            hovact: "hovact:bg-contrast hovact:text-secondary hovact:border-secondary hover:shadow-secondary"
        },
        tertiary: {
            solid: "bg-tertiary text-white",
            outline: "outline-tertiary text-tertiary",
            transparent: "text-tertiary",
            gradient: "",
            hovact: "hovact:bg-white hovact:text-tertiary hovact:border-tertiary hover:shadow-tertiary"
        },
        quarter: {
            solid: "bg-quarter text-tertiary",
            outline: "outline-quarter text-quarter",
            transparent: "text-quarter",
            gradient: "",
            hovact: "hovact:bg-tertiary hovact:text-quarter hovact:border-quarter hover:shadow-quarter"
        },
        contrast: {
            solid: "bg-contrast text-background",
            outline: "outline-contrast",
            transparent: "text-contrast",
            gradient: "",
            hovact: "hovact:bg-background hovact:text-contrast hovact:border-contrast hover:shadow-contrast"
        },
        background: {
            solid: "bg-background text-contrast",
            outline: "outline-background",
            transparent: "text-background",
            gradient: "",
            hovact: "color-background-auto hovact:bg-contrast hovact:text-background hovact:border-background hover:shadow-background"
        },
        white: {
            solid: "bg-white text-black",
            outline: "outline-white text-white",
            transparent: "text-white",
            gradient: "",
            hovact: "hovact:bg-black hovact:text-white hovact:border-white hover:shadow-white"
        },
        black: {
            solid: "bg-black text-white",
            outline: "outline-black text-black",
            transparent: "text-black",
            gradient: "",
            hovact: "hovact:bg-white hovact:text-black hovact:border-black hover:shadow-black"
        },
        danger: {
            solid: "bg-danger text-white",
            outline: "outline-danger text-danger",
            transparent: "text-danger",
            gradient: "",
            hovact: "hovact:bg-white hovact:text-danger hovact:border-danger hover:shadow-danger"
        },
        warn: {
            solid: "bg-warn text-white",
            outline: "outline-warn text-warn",
            transparent: "text-warn",
            gradient: "",
            hovact: "hovact:bg-white hovact:text-warn hovact:border-warn hover:shadow-warn"
        },
        success: {
            solid: "bg-success text-white",
            outline: "outline-success text-success",
            transparent: "text-success",
            gradient: "",
            hovact: "hovact:bg-black hovact:text-success hovact:border-success hover:shadow-success"
        },
        custom: {
            solid: "",
            outline: "",
            transparent: "",
            gradient: "",
            hovact: "hovact:bg-contrast hovact:text-primary hovact:border-primary hover:shadow-primary"
        },
        customFul: {
            solid: "",
            outline: "",
            transparent: "",
            gradient: "",
            hovact: ""
        }
    } satisfies Record<string, typeof base & { hovact: string }>;

    const sizes = /* @tw */ {
        sm: "p-1 hover:shadow-[0.1875rem_0.1875rem_0rem]",
        md: "py-2 px-4 text-lg hover:shadow-[0.3125rem_0.3125rem_0rem]",
        lg: "py-3 px-6 text-xl hover:shadow-[0.3125rem_0.3125rem_0rem]"
    };

    export type Color = keyof typeof colors;
    export type Variant = keyof typeof base;
    export type Size = keyof typeof sizes;

    const props = withDefaults(defineProps<{
        href?: string
        color?: Color
        variant?: Variant
        size?: Size
        addClass?: string
        activated?: boolean
        disabled?: boolean
        loading?: boolean
        noChangeLoading?: boolean
        action?: () => Promise<unknown>
    }>(), {
        href: undefined,
        color: "primary",
        variant: "solid",
        size: "md",
        addClass: undefined,
        action: undefined
    });

    const emit = defineEmits<{
        then: []
        finally: []
    }>();

    const _color = computed(() => {
        return `${base?.[props.variant]} ${colors[props.color]?.[props.variant]} ${colors[props.color].hovact}`;
    });

    const _size = computed(() => {
        return sizes[props.size];
    });

    const loadingAction = ref(false);

    const _loading = computed(() => {
        return props.loading || loadingAction.value;
    });

    const click = async () => {
        if (props.action) {
            loadingAction.value = true;

            await Promise.all([
                new Promise(resolve => setTimeout(resolve, 1500)),
                props.action()
            ])
                .then(() => {
                    emit("then");
                })
                .finally(() => {
                    loadingAction.value = false;
                    emit("finally");
                });
        }
    };

    const button = ref<HTMLButtonElement>();
    const canChange = computed(() => {
        return !_loading.value || props.noChangeLoading;
    });

    const persistDimensions = computedAsync(async () => {
        if (canChange.value) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return undefined;
        }

        const rect = button.value?.getBoundingClientRect();

        return [
            `width: ${rect?.width}px`,
            `height: ${rect?.height}px`
        ];
    }, undefined);

    defineExpose({
        click: () => button.value?.click()
    });
</script>