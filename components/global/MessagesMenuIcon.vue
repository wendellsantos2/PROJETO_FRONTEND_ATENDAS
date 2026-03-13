<template>
    <div
        class="grid"
        :class="{
            'grid-cols-2 grid-rows-2 place-items-center gap-1': typeof providersIcons !== 'string' && providersIcons.length > 1
        }"
    >
        <Icon
            v-if="typeof providersIcons === 'string'"
            :name="providersIcons"
            :size
        />
        <Icon
            v-else-if="providersIcons.length === 0"
            name="chat"
            :size
        />
        <Icon
            v-else-if="providersIcons.length === 1"
            :name="providersIcons[0]"
            :size
        />
        <Icon
            v-for="i in providersIcons"
            v-else
            :key="i"
            :name="i"
            :size="size.slice(1)"
        />
    </div>
</template>

<script setup lang="ts">
    const { $user } = useNuxtApp();

    const size = "1.7rem";

    const providersIcons = computed(() => {
        let icons = $user.value?.activated_providers.map(p => useProviderIcon("message", p));
        icons = Array.from(new Set(icons)).filter(v => v !== "mdi:message-question");

        if (icons && icons.length > 0) {
            return icons.slice(0, 4);
        }
        else {
            return "chat";
        }
    });
</script>