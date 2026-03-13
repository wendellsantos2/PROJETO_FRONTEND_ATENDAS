<template>
    <TransitionOpacity mode="out-in">
        <component
            :is="props.tag"
            v-if="props.tag && _validate"
        >
            <slot />
        </component>

        <slot v-else-if="_validate" />

        <Icon
            v-else
            name="loading"
            :size="`${props.size}rem`"
            class="text-primary"
        />
    </TransitionOpacity>
</template>

<script setup lang="ts" generic="T">
    const props = withDefaults(defineProps<{
        size?: number
        pending?: boolean
        validade?: T
        tag?: string
    }>(), {
        size: 1.3,
        validade: undefined,
        tag: undefined
    });

    const _validate = computed(() => {
        return props.validade !== undefined || !props.pending;
    });
</script>