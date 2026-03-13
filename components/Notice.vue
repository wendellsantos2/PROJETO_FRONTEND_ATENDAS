<template>
    <TransitionHeight>
        <div
            v-show="$slots.default || props.description"
            class="w-full rounded-2xl border-2"
            :class="_type.class"
        >
            <h6 v-if="_title" class="m-4 flex items-center justify-center gap-2 font-semibold uppercase tracking-wider">
                <Icon
                    :name="_icon"
                    size="1.6rem"
                    class="mb-0.5"
                />
                {{ _title }}
            </h6>
            <slot>
                <p class="m-4 flex flex-row gap-1 text-center font-medium">
                    <Icon
                        v-if="!_title"
                        :name="_type.icon"
                        size="1.3rem"
                        class="flex-none"
                    />
                    {{ props.description }}
                </p>
            </slot>
        </div>
    </TransitionHeight>
</template>

<script setup lang="ts">
    const types = /* @tw */ {
        warning: {
            title: "aviso",
            icon: "attention",
            class: "bg-warn/5 text-warn border-warn"
        },

        error: {
            title: "Ops, um erro ocorreu",
            icon: "error",
            class: "bg-danger/5 text-danger border-danger"
        },

        danger: {
            title: "Ops, um erro ocorreu",
            icon: "error",
            class: "bg-danger/5 text-danger border-danger"
        },

        success: {
            title: "Informação",
            icon: "info",
            class: "bg-success/5 text-success border-success"
        }
    };

    const props = withDefaults(defineProps<{
        type: keyof typeof types
        title?: string | false
        icon?: string | false
        description?: string
    }>(), {
        title: undefined,
        icon: undefined,
        description: undefined
    });

    const _type = computed(() => {
        return types?.[props.type];
    });

    const _title = computed(() => {
        return props.title ?? _type.value.title;
    });

    const _icon = computed(() => {
        return props.icon ?? _type.value.icon;
    });
</script>