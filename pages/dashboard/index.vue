<template>
    <section class="grow">
        <LayoutPortal to="HeaderBefore">
            <div class="w-40" />
            <Button
                :href="`/dashboard/modelos/${form.dashboard}`"
                variant="gradient"
            >
                <Icon name="edit" class="sm:hidden lg:block xl:hidden" />
                <span class="hidden sm:block lg:hidden xl:block">
                    Editar
                </span>
            </Button>
        </LayoutPortal>

        <Vueform
            v-model="form"
            sync
            class="absolute left-4 top-4 w-40 sm:left-6 sm:top-6 lg:left-auto lg:right-[11.5rem]"
        >
            <SelectElement
                name="dashboard"
                :items="dashboards.data.value!"
                search
                :loading="dashboards.status.value === 'pending'"
                :canClear="false"
                @searchChange="search = $event"
            />
        </Vueform>

        <TransitionOpacity mode="out-in">
            <ul
                v-if="data?.length"
                :key="form.dashboard"
                class="grid grow gap-6 overflow-auto p-6 lg:grid-cols-12 lg:pt-0"
            >
                <li
                    v-for="chart in data"
                    :key="chart.id"
                    class="flex flex-col gap-4 overflow-hidden rounded-3xl bg-background-100 p-4 lg:col-[--col-span] lg:col-start-[--col] lg:row-[--row-span] lg:row-start-[--row]"
                    :style="[
                        `--col: ${(chart.metadata?.x ?? 0) + 1}`,
                        `--col-span: span ${chart.metadata?.w} / span ${chart.metadata?.w}`,
                        `--row: ${(chart.metadata?.y ?? 0) + 1}`,
                        `--row-span: span ${chart.metadata?.h} / span ${chart.metadata?.h}`
                    ]"
                >
                    <div class="flex flex-row items-center gap-4">
                        <h5 class="grow font-semibold">
                            {{ chart.query.name }}
                        </h5>
                        <Button
                            v-tooltip="'Deletar'"
                            color="danger"
                            size="sm"
                            class="flex-none"
                            @click="confirmeDelete?.toggle(true, { id: chart.id, name: chart.query.name })"
                        >
                            <Icon name="delete" />
                        </Button>
                    </div>
                    <strong
                        v-if="chart.type === 'counter'"
                        class="mt-auto text-2xl"
                    >
                        {{ chart.payload }}
                    </strong>
                    <div
                        v-else-if="chart.type === 'table'"
                        class="mask-transparent-border relative -my-4 min-h-80 grow [--size:1rem]"
                    >
                        <Table
                            :thead="chart.payload.columns?.map((name, index) => ({ name, propertyPath: (`${index}` as 'id') })) ?? []"
                            :data="chart.payload.rows?.map((value, index) => ({
                                id: index,
                                ...Object.fromEntries(value.map((v, i) => [`${i}`, v]))
                            }))"
                            class="absolute inset-0 !-mx-4 !mb-0 !px-4 pt-4 ![--size:1rem]"
                        >
                            {{ chart.payload }}
                        </Table>
                    </div>
                    <Chart
                        v-else-if="chart.payload.datasets"
                        :type="chart.type"
                        :data="chart.payload"
                        :options="chart.options"
                        class="my-auto"
                    />
                </li>
            </ul>

            <Container
                v-else
                class="h-full"
                addClass="items-center justify-center"
            >
                <h4>
                    Ops, nenhum widget disponível :(
                </h4>
            </Container>
        </TransitionOpacity>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="o widget"
            :action="async ({ id }) => await useFetchApi(`v2/dashboard/${form.dashboard}/widgets/${id}`, {
                method: 'delete'
            })"
            @then="refresh()"
        />
    </section>
</template>

<script setup lang="ts">
    import type { ChartOptions } from "chart.js";
    import { Chart } from "vue-chartjs";

    function previousMonth () {
        const today = new Date();
        const previous = new Date(today);

        previous.setMonth(today.getMonth() - 1);

        const formatDate = (date: Date) => date.toJSON().split("T")[0];

        return [formatDate(previous), formatDate(today)];
    }

    definePageMeta({
        navOrder: 1,
        icon: "dashboard",
        permissions: "read_dashboard",
        layoutConfig: {
            immediate: true,
            filterPersist: true,
            filters: {
                interval: {
                    type: "select",
                    label: "Intervalo",
                    placeholder: "Selecione a intervalo",
                    canClear: false,
                    items: {
                        daily: "Diário",
                        monthly: "Mensal",
                        annual: "Anual"
                    },
                    default: "daily"
                },
                period: {
                    type: "dates",
                    label: "Período",
                    placeholder: "Selecione o período",
                    valueFormat: "YYYY-MM-DD",
                    mode: "range",
                    default: previousMonth()
                }
            }
        }
    });

    const filters = ref({
        interval: "",
        start_date: "",
        end_date: ""
    });

    useBusLayout().on((event) => {
        if (event?.filters) {
            filters.value = {
                interval: (event.filters?.interval as string) ?? "",
                start_date: (event.filters?.period as string[])?.[0] ?? "",
                end_date: (event.filters?.period as string[])?.[1] ?? ""
            };
        }
    });

    const search = ref("");

    const dashboards = await useAsyncData("dashboards", async () => {
        return await useFetchSelect("v2/dashboards", {
            filters: {
                name: search.value
            }
        });
    });

    watchDebounced(search, () => dashboards.refresh(), {
        debounce: 200,
        maxWait: 1000,
        deep: true
    });

    const form = useLocalStorage("dashboard", {
        dashboard: dashboards.data.value?.at(0)?.value
    });

    const {
        data,
        refresh
    } = await useAsyncData("dashboard", async () => {
        if (!form.value.dashboard) {
            return null;
        }

        const {
            data: { widgets }
        } = await useFetchApi(`v2/dashboards/${form.value.dashboard}`, {
            params: Object.fromEntries(Object.entries(filters.value).map(([key, value]) => [`filter[${key}]`, value]))
        });

        return widgets.map((widget) => {
            if (widget.type === "table" || widget.type === "counter") {
                return widget;
            }

            const datasets = widget?.payload?.datasets?.map(set => ({
                ...set,
                fill: true,
                backgroundColor: colors.slice(0, set.data.length)
            }));

            const options: ChartOptions = {};

            if (["doughnut", "pie"].includes(widget.type)) {
                useMerge(options, {
                    plugins: {
                        legend: {
                            display: true,
                            position: "bottom"
                        }
                    }
                } satisfies ChartOptions);
            }

            return useMerge(widget, {
                payload: {
                    datasets
                },
                options
            });
        });
    }, {
        immediate: false,
        watch: [filters, () => form.value.dashboard]
    });

    const colors = [
        "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF",
        "#33FFF5", "#F5FF33", "#FF3333", "#33FF33", "#3333FF",
        "#FF8C33", "#33FF8C", "#338CFF", "#FF338C", "#8C33FF",
        "#33FFC1", "#C1FF33", "#FF333D", "#33FF3D", "#3D33FF",
        "#FF3333", "#33FF33", "#3333FF", "#FF5733", "#33FF57",
        "#3357FF", "#FF33A1", "#A133FF", "#33FFF5", "#F5FF33",
        "#FF3333", "#33FF33", "#3333FF", "#FF8C33", "#33FF8C",
        "#338CFF", "#FF338C", "#8C33FF", "#33FFC1", "#C1FF33",
        "#FF333D", "#33FF3D", "#3D33FF", "#FF5733", "#33FF57",
        "#3357FF", "#FF33A1", "#A133FF", "#33FFF5", "#F5FF33"
    ];

    const confirmeDelete = useModalConfirm();
</script>