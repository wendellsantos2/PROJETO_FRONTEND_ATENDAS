<template>
    <TransitionGroup
        class="fixed right-4 top-4 z-[99999] w-full max-w-xs space-y-4 transition-all"
        enterActiveClass="duration-300"
        enterFromClass="translate-x-full opacity-0"
        leaveActiveClass="duration-300"
        leaveToClass="translate-x-full opacity-0"
        moveClass="duration-300"
        tag="ul"
    >
        <LayoutToastItem
            v-for="(item, index) in items"
            :key="item.id"
            v-bind="item"
            @remove="removeToast(index)"
        />
    </TransitionGroup>
</template>

<script setup lang="ts">
    import type { Toast } from "./item.vue";

    const items = ref<Toast[]>([]);

    const addToast = (type: Toast["type"] = "danger", message: Toast["message"] = "Houve um erro") => {
        const existingToast = findToast(type, message);

        if (existingToast) {
            existingToast.frequency = existingToast.frequency + 1;
        }
        else {
            items.value.push({
                id: useGenerateId(),
                type,
                message,
                frequency: 1,
                duration: 3000
            });
        }
    };

    const removeToast = (index: number) => {
        items.value.splice(index, 1);
    };

    const findToast = (type: Toast["type"], message: Toast["message"]) => {
        return items.value.find(({ type: _type, message: _message }) => _type === type && _message === message);
    };

    useBusError().on((e) => {
        addToast("danger", e!);
    });

    useBusSuccess().on((s) => {
        addToast("success", s!);
    });
</script>