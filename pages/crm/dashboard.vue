<template>
    <section class="grid grow auto-rows-min gap-6 overflow-auto p-6 md:grid-cols-2 lg:pt-0">
        <div
            v-for="({ title, chart, ...bind }, key) in charts"
            :key
            class="flex flex-col overflow-hidden rounded-3xl bg-background-100"
        >
            <h5 class="p-4 font-semibold">
                {{ title }}
            </h5>
            <component
                :is="chart"
                v-bind="bind"
                class="aspect-video"
            />
        </div>
    </section>
</template>

<script setup lang="ts">
    import type { ChartData } from "chart.js";
    import { Bar } from "vue-chartjs";

    definePageMeta({
        navOrder: 10,
        icon: "crm",
        logo: "crm",
        permissions: "read_contact"
    });

    const {
        data
    } = useAsyncData("v1/dashboard-data", async () => {
        const { data } = await useFetchApi("v1/dashboard-data");
        return data;
    }, {
        default: () => ({
            leads_by_origin: [],
            conversion_by_origin: [],
            leads_by_stage: [],
            time_by_stage: [],
            time_to_conversion: []
        })
    });

    const charts = computed(() => [
        {
            title: "Distribuição de Leads por Origem",
            chart: Bar,
            data: {
                labels: data.value.leads_by_origin.map(({ source_name, qty }) => `${source_name || "Desconhecido"} (${qty})`),
                datasets: [
                    {
                        label: "",
                        data: data.value.leads_by_origin.map(({ qty }) => qty)
                    }
                ]
            } satisfies ChartData<"bar">
        },
        {
            title: "% Conversão por Canal de Origem",
            chart: Bar,
            data: {
                labels: data.value.conversion_by_origin.map(({ source_name, qty }) => `${source_name || "Desconhecido"} (${qty})`),
                datasets: [
                    {
                        label: "",
                        data: data.value.conversion_by_origin.map(({ qty }) => qty)
                    }
                ]
            } satisfies ChartData<"bar">
        },
        {
            title: "Contagem de Leads por Etapa no Kanban",
            chart: Bar,
            data: {
                labels: data.value.leads_by_stage.map(({ name, qty }) => `${name} (${qty})`),
                datasets: [
                    {
                        label: "",
                        data: data.value.leads_by_stage.map(({ qty }) => qty)
                    }
                ]
            } satisfies ChartData<"bar">
        },
        {
            title: "Tempo Médio por Etapa no Kanban",
            chart: Bar,
            data: {
                labels: data.value.time_by_stage.map(({ name, waiting_time }) => `${name} (${waiting_time})`),
                datasets: [
                    {
                        label: "",
                        data: data.value.time_by_stage.map(({ waiting_time }) => Number(waiting_time))
                    }
                ]
            } satisfies ChartData<"bar">
        },
        {
            title: "Tempo Médio de Conversão",
            chart: Bar,
            data: {
                labels: data.value.time_to_conversion.map(({ month, conversion_time }) => `${month} (${conversion_time})`),
                datasets: [
                    {
                        label: "",
                        data: data.value.time_to_conversion.map(({ conversion_time }) => Number(conversion_time))
                    }
                ]
            } satisfies ChartData<"bar">
        }
    ]);
</script>