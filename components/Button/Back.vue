<template>
    <Button
        v-tooltip="{
            content: 'Voltar',
            disabled: !props.min
        }"
        variant="gradient"
        v-bind="bind"
    >
        <Icon name="back" :size="props.iconSize" />
        {{ props.min ? "" : "Voltar" }}
    </Button>
</template>

<script setup lang="ts">
    const props = defineProps<{
        min?: boolean
        iconSize?: string
    }>();

    const {
        $router
    } = useNuxtApp();

    const bind = computed(() => {
        if (window.history.length > 1) {
            return {
                onClick: $router.back
            };
        }
        else {
            return {
                href: "/"
            };
        }
    });
</script>