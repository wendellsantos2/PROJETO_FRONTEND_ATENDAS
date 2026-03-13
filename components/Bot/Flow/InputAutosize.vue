<template>
    <textarea
        ref="textarea"
        v-model="model"
        class="group[.focus]:bg-secondary/40 w-full resize-none rounded-md bg-transparent p-1 text-center caret-secondary transition-colors duration-300 focus:bg-black/20"
        :placeholder="props.placeholder"
    />
</template>

<script setup lang="ts">
    const props = defineProps<{
        placeholder?: string
    }>();

    const model = defineModel<string>();

    const {
        textarea
    } = useTextareaAutosize({
        input: model
    });
</script>

<style scoped lang="postcss">
    textarea {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    textarea::-webkit-scrollbar {
        display: none;
    }
</style>