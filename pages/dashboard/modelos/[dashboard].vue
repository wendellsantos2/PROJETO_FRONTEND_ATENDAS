<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />
            <Button
                v-if="useCheckPermissions(['create_dashboard', 'update_dashboard'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ dashboard ? "Salvar" : "Criar" }}
            </Button>
            <Button
                v-if="dashboard && useCheckPermissions('delete_dashboard')"
                type="button"
                color="danger"
                @click="() => confirmeDelete?.toggle(true, { id: dashboard!, name: data?.name })"
            >
                <Icon name="delete" />
                Deletar
            </Button>
        </LayoutPortal>

        <Vueform
            v-model="formDashboard"
            sync
            :endpoint="false"
        >
            <TextElement
                name="name"
                label="Nome"
                placeholder="Vendas"
                rules="required|min:1"
            />
        </Vueform>

        <template v-if="$screen.value.lg">
            <Divider title="widgets">
                <template #right>
                    <Button @click="addWidget()">
                        <Icon name="plus" />
                    </Button>
                </template>
            </Divider>

            <Vueform
                v-model="widgets.form"
                sync
                :endpoint="false"
                :overrideClasses="{
                    ObjectElement: {
                        container: 'h-full flex flex-col itens-center bg-background p-4 rounded-xl relative'
                    },
                    ElementLayout: {
                        outerWrapper: 'm-auto w-full max-w-xs'
                    }
                }"
            >
                <GridLayout
                    v-model:layout="widgets.layout"
                    :colNum="12"
                    :margin="[16, 16]"
                    :rowHeight="250"
                    isDraggable
                    isResizable
                    verticalCompact
                    useCssTransforms
                    class="col-span-full min-h-[16.5625rem] rounded-xl border border-contrast/20"
                >
                    <template #item="{ item }">
                        <ObjectElement :name="item.i">
                            <Button
                                type="button"
                                color="danger"
                                size="sm"
                                class="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2"
                                :action="() => removeWidget(item.i)"
                            >
                                <Icon name="close" />
                            </Button>

                            <SelectElement
                                name="type"
                                label="Tipo"
                                placeholder="Selecione um tipo"
                                search
                                :canClear="false"
                                :items="enums.dashboard"
                                :native="false"
                                rules="required"
                                @change="(value: string) => {
                                    if (!widgets.form[item.i].query?.supportedTypes?.includes(value)) {
                                        widgets.form[item.i].query = undefined
                                    }
                                }"
                            />

                            <SelectElement
                                name="query"
                                label="Consulta"
                                placeholder="Selecione uma consulta"
                                search
                                :canClear="false"
                                object
                                :items="queries?.map((queri) => ({ ...queri, disabled: !queri.supportedTypes.includes(widgets.form[item.i]?.type) }))"
                                valueProp="id"
                                labelProp="name"
                                :description="widgets.form[item.i].query?.description"
                                rules="required"
                            />
                        </ObjectElement>
                    </template>
                </GridLayout>
            </vueform>
        </template>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="o modelo de dashboard"
            :action="async () => await useFetchApi(`v2/dashboards/${dashboard}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";
    import { GridLayout } from "grid-layout-plus";

    definePageMeta({
        title: "modelo"
    });

    let {
        dashboard
    } = useRouteParams({
        create: "create_dashboard",
        update: ["read_dashboard", "update_dashboard"]
    });

    const back = async () => await navigateTo("/dashboard/modelos");

    type Dashboard = InternalApi["v2/dashboards/:dashboard"]["get"]["data"];
    type Widget = InternalApi["v2/dashboards/:dashboard/widgets/:widget"]["get"]["data"];

    const formDashboard = ref<Partial<Dashboard>>({});

    const widgets = ref<{
        form: Record<string, Widget>
        layout: NonNullable<Widget["metadata"]>[]
    }>({
        form: {},
        layout: []
    });

    const { data } = await useAsyncData("dashboards:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v2/dashboards/${dashboard}`);
            formDashboard.value = useOmit(_data, "widgets");

            _data.widgets.forEach((widget) => {
                if (widget.metadata) {
                    widgets.value.form[widget.id] = widget;

                    widgets.value.layout.push({
                        ...widget.metadata,
                        i: String(widget.id)
                    });
                }
            });

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!dashboard
    });

    const {
        data: queries
    } = await useLazyAsyncData("widgets:queries", async () => {
        const { data } = await useFetchApi("v2/dashboards/widgets/queries", {
            params: {
                per_page: 999
            }
        });
        return data;
    });

    const addWidget = () => {
        widgets.value.layout.push({
            x: (widgets.value.layout.length * 2) % 12,
            y: widgets.value.layout.length + 12,
            w: 3,
            h: 1,
            i: `_${crypto.randomUUID()}`
        });
    };

    const removeWidget = async (id: string | number) => {
        id = String(id);

        const index = widgets.value.layout.findIndex(item => item.i === id);

        if (!id.startsWith("_")) {
            await useFetchApi(`v2/dashboards/${dashboard!}/widgets/${id}`, {
                method: "DELETE"
            });
        }

        if (index > -1) {
            widgets.value.layout.splice(index, 1);
        }
    };

    const upSert = async () => {
        const { data } = await useFetchApi(`v2/dashboards/${dashboard || ""}`, {
            method: dashboard ? "PUT" : "POST",
            body: formDashboard.value
        });

        dashboard = data.id;

        const _widgets = Object
            .entries(widgets.value.form)
            .map(([id, widget]) => {
                return {
                    ...widget,
                    id: id.startsWith("_") ? 0 : Number(id),
                    metadata: useOmit(widgets.value.layout.find(item => item.i === id), ["i", "moved"])
                };
            });

        for (let index = 0; index < _widgets.length; index++) {
            const {
                id,
                query,
                ...body
            } = _widgets[index];

            await useFetchApi(`v2/dashboards/${data.id}/widgets/${id || ""}`, {
                method: id ? "PUT" : "POST",
                body: {
                    ...body,
                    query_id: query.id
                },
                onResponse: undefined
            });
        }

        await back();
    };

    const confirmeDelete = useModalConfirm();
</script>

<style lang="css" scoped>
    .vgl-layout::before {
        position: absolute;
        width: 100%;
        height: 100%;
        content: '';
        background-image:
            linear-gradient(to right, hsl(var(--twc-contrast) / 0.2) 0.0625rem, transparent 0.0625rem),
            linear-gradient(to bottom, hsl(var(--twc-contrast) / 0.2) 0.0625rem, transparent 0.0625rem);
        background-repeat: repeat;
        background-position: -0.0625rem -0.0625rem;
        background-size: calc(100% / 12 + 0.0625rem) calc(15.625rem + 24px);
    }

    :deep(.vgl-item) {
        border: 2px;
        border-color: var(--twc-contrast-200);
    }

    :deep(.vgl-item__resizer) {
        --vgl-resizer-border-color: var(--vf-primary);
        --vgl-resizer-size: 1rem;

        right: 0.3125rem;
        bottom: 0.3125rem;
    }
</style>