<template>
    <li
        v-if="!_nextDate || _nextDate !== _date"
        :key="`dateBar${props.id}`"
        class="sticky -top-6 flex w-full flex-row items-center py-6"
        :style="`z-index: -${props.index+1}`"
    >
        <hr class="grow">
        <span class="rounded-full border border-current px-3 py-1 opacity-20">
            {{ _date }}
        </span>
        <hr class="grow">
    </li>
</template>

<script setup lang="ts">
    const props = defineProps<{
        id: string | number
        index: number
        date: string
        nextDate?: string
    }>();

    const nowDateFormat = useDateFormat(new Date(), "DD/MM/YYYY").value;

    const dateFormat = (date: string = "") => {
        const createdDateFormat = useDateFormat(new Date(date), "DD/MM/YYYY").value;
        return createdDateFormat === nowDateFormat ? "Hoje" : createdDateFormat;
    };

    const _date = computed(() => dateFormat(props.date));
    const _nextDate = computed(() => dateFormat(props.nextDate));
</script>