<template>
    <TextElement
        name="color"
        label="Cor"
        inputType="color"
        :default="props.default"
        :addClass="{
            inputContainer: 'overflow-hidden',
            input: '!p-0 -m-2 !w-[104%] !h-[130%]'
        }"
        :description="props.description"
        rules="required|min:1"
    />
</template>

<script setup lang="ts">
    const props = withDefaults(defineProps<{
        default?: `#${string}`
        description?: string
    }>(), {
        default: "#ff6600",
        description: undefined
    });
</script>