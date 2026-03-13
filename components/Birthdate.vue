<template>
    <p class="inline-flex items-center gap-2">
        {{ useDateFormat(date, 'DD/MM/YYYY') }}

        <span class="opacity-60">
            {{ age }}
        </span>
    </p>
</template>

<script setup lang="ts">
    const {
        date
    } = defineProps<{
        date: string
    }>();

    const age = computed(() => {
        const birthDate = new Date(date);
        const birthYear = birthDate.getFullYear();

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        let age = currentYear - birthYear;

        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();
        const birthMonth = birthDate.getMonth();
        const birthDay = birthDate.getDate();

        if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
            age--;
        }

        return `${age} ano${age === 1 ? "" : "s"}`;
    });
</script>