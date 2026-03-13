<!-- eslint-disable vue/no-v-html -->
<template>
    <p
        v-if="!(['', null, undefined].includes(_content))"
        class="message break-words"
        v-html="_content"
    />
</template>

<script setup lang="ts">
    const props = defineProps<{
        content?: string | null
    }>();

    const _content = computed(() => {
        if (!props.content) {
            return props.content;
        }

        const regex = /(?<!<a[^>]*>)(http|https):\/\/[^ ]*(?![^<]*<\/a>)/g;
        const message = props.content?.replaceAll(regex, "<a href=\"$&\" target=\"_black\">$&</a>");

        return message?.replaceAll("\n", "<br/>");
    });
</script>

<style lang="postcss">
    .message a[href] {
        @apply font-medium break-all text-primary underline-offset-0 transition-all duration-300 hover:underline-offset-4 hover:underline;
    }

    :is(.\!bg-primary, .bg-primary) :is(.message a[href]) {
        @apply text-tertiary;
    }
</style>