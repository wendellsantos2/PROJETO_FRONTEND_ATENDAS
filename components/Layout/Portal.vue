<template>
    <Teleport
        v-if="!disabled"
        :to="id"
    >
        <slot />
    </Teleport>
</template>

<script setup lang="ts">
    const props = defineProps<{
        to: "HeaderAfter" | "HeaderBefore"
    }>();

    const id = computed(() => `#layout${props.to}`);

    const { hook } = useNuxtApp();

    const disabled = ref(true);

    let traveled = 0;

    const check = async () => {
        if (document.querySelector(id.value) || traveled >= 60) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
        traveled++;
        await check();
    };

    hook("page:finish", async () => {
        await check();
        disabled.value = false;
    });
</script>