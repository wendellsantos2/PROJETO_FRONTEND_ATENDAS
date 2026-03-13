<template>
    <div class="flex flex-row items-center gap-4 py-6">
        <slot name="left">
            <h4 class="font-medium">
                {{ props.title }}
            </h4>
        </slot>
        <hr class="grow" :class="hrLeft">
        <slot name="middle" />
        <hr v-if="$slots?.middle" class="grow" :class="hrRight">
        <slot name="right" />
    </div>
</template>

<script setup lang="ts">
    const props = defineProps<{
        title?: string
        hrLeft?: string
        hrRight?: string
    }>();
</script>