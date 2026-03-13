<template>
    <li
        class="relative flex w-full max-w-sm flex-row items-center justify-between gap-2 overflow-hidden rounded-2xl p-3 shadow-md"
        :class="color"
        @mouseenter="removeRemoveToastTimeout()"
        @mouseleave="createRemoveToastTimeout()"
    >
        <p class="line-clamp-2 size-full text-sm font-medium">
            {{ message }}
        </p>
        <div
            v-if="frequency && frequency > 1"
            class="flex size-6 h-fit flex-row items-end font-medium leading-none opacity-60"
        >
            <span>{{ frequency }}</span>
            <span class="text-xs">x</span>
        </div>
        <Button
            color="danger"
            size="sm"
            class="size-6 flex-none border-none bg-transparent shadow-none"
            @click="emit('remove')"
        >
            <Icon name="close" />
        </Button>
        <span
            class="absolute inset-x-0 bottom-0 h-1 w-full translate-x-0 rounded-r-sm bg-current transition-all duration-[--duration]"
            :class="{ '!-translate-x-full transition-none': !showBar }"
            :style="`--duration: ${duration}ms`"
        />
    </li>
</template>

<script setup lang="ts">
    const colors = /* @tw */ {
        danger: "bg-danger text-white",
        success: "bg-success text-white"
    };

    export interface Toast {
        id: string
        type: keyof typeof colors
        message: string
        duration: number
        frequency: number
    }

    const props = defineProps<Toast>();

    const emit = defineEmits(["remove"]);
    const showBar = ref(false);

    const color = computed(() => colors[props.type]);

    const removeToastTimeoutRef = ref<NodeJS.Timeout | number | null>(null);

    const createRemoveToastTimeout = () => {
        showBar.value = true;

        removeToastTimeoutRef.value = setTimeout(() => {
            emit("remove");
        }, props.duration);
    };

    const removeRemoveToastTimeout = () => {
        showBar.value = false;
        clearTimeout(removeToastTimeoutRef.value as number);
    };

    watch(() => props.frequency, async (f) => {
        if (f) {
            removeRemoveToastTimeout();
        }

        await new Promise(resolve => setTimeout(resolve, 300));
        createRemoveToastTimeout();
    }, {
        immediate: true
    });
</script>