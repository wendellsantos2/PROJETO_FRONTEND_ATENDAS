<template>
    <TablePage
        ref="tablePage"
        request="v1/kanban-logs"
        :thead="[
            { name: 'Vendedor', slot: 'seller' },
            { name: 'Lead', slot: 'lead' },
            { name: 'Etapa', propertyPath: 'stage.name' },
            { name: 'Tempo de Espera', propertyPath: 'waiting_time', transform: formatMinutes },
            { name: 'Atendimento', propertyPath: 'created_at', transform: useDate },
            { name: 'Situação', propertyPath: 'status' }
        ]"
        :opts="{
            preFilters: false
        }"
        :itemClick="false"
    >
        <template #seller="{ user }">
            <div
                v-if="user"
                class="flex flex-row items-center gap-3"
            >
                <img
                    :src="user.avatar_url"
                    class="block size-8 rounded-full bg-background-100 object-cover object-center"
                >
                <p>
                    {{ user.name }}
                </p>
            </div>
        </template>

        <template #lead="{ contact: { avatar_url, name } }">
            <div class="flex flex-row items-center gap-3">
                <img
                    :src="avatar_url"
                    class="block size-8 rounded-full bg-background-100 object-cover object-center"
                >
                <p>
                    {{ name }}
                </p>
            </div>
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "Relatório",
        navOrder: 40,
        permissions: "read_contact"
    });

    const formatMinutes = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const min = minutes % 60;

        const stringHours = hours ? `${hours} hora${hours === 1 ? "" : "s"} ` : "";

        return `${stringHours}${min} minuto${min === 1 ? "" : "s"}`;
    };
</script>