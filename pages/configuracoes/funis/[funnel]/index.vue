<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />
            <Button
                v-if="useCheckPermissions(['create_funnel', 'update_funnel'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ funnel ? "Salvar" : "Criar" }}
            </Button>
            <Button
                v-if="funnel && useCheckPermissions('delete_funnel')"
                type="button"
                color="danger"
                @click="() => confirmeDelete?.toggle(true, { id: funnel!, name: data?.name })"
            >
                <Icon name="delete" />
                Deletar
            </Button>
        </LayoutPortal>

        <Vueform
            v-model="formFunnel"
            sync
            :endpoint="false"
        >
            <TextElement
                name="name"
                label="Nome"
                placeholder="Inadimplência"
                rules="required|min:1"
                addClass="sm:col-span-6"
            />

            <TextElement
                name="description"
                label="Descrição"
                placeholder="Filtrando leads inadimplentes..."
                addClass="sm:col-span-6"
            />
        </Vueform>

        <Divider title="Etapas" />

        <Vueform
            v-model="formStages"
            sync
            :endpoint="false"
            :overrideClasses="{
                ListElement: {
                    list: 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4',
                    handle: 'mx-auto',
                    handle_lg: 'size-6 cursor-move'
                },
                ObjectElement: {
                    wrapper: 'flex flex-col'
                }
            }"
            :addClasses="{
                ListElement: {
                    listItem: '!flex flex-col border border-contrast/20 p-4 rounded-xl relative',
                    remove: '!bg-danger !right-0 left-auto translate-x-1/2',
                    removeIcon: '!bg-white',
                    add: { '!mt-0': !formStages.items.length }
                }
            }"
        >
            <ListElement
                v-slot="{ index }"
                name="items"
                :sort="true"
                storeOrder="position"
                :controls="{ remove: false }"
            >
                <ObjectElement :name="index">
                    <Button
                        type="button"
                        color="danger"
                        size="sm"
                        class="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2"
                        :action="() => remove(index)"
                    >
                        <Icon name="close" />
                    </Button>

                    <TextElement
                        name="name"
                        label="Nome"
                        placeholder="Esperando justificativa"
                        rules="required|min:1"
                    />

                    <SelectColor />

                    <div
                        v-if="formStages.items.length === index+1"
                        class="col-span-full flex flex-row items-center justify-between gap-2 sm:col-span-6 lg:col-span-4"
                    >
                        <span>
                            Travar Lead?
                        </span>
                        <ToggleElement
                            name="last_stage"
                            :labels="{ on: 'Sim', off: 'Não' }"
                            :default="false"
                            class="flex flex-none"
                        />
                    </div>

                    <HiddenElement
                        meta
                        name="position"
                    />
                </ObjectElement>
            </ListElement>
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="o funil"
            :action="async () => await useFetchApi(`v1/funnels/${funnel}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    definePageMeta({
        title: "funil"
    });

    const {
        funnel
    } = useRouteParams({
        create: "create_funnel",
        update: ["read_funnel", "update_funnel"]
    });

    const back = async () => await navigateTo("/configuracoes/funis");

    type Funnel = InternalApi["v1/funnels/:id"]["get"]["data"];
    type Stage = InternalApi["v1/funnels/:id/stages/:id"]["get"]["data"];

    const formFunnel = ref<Partial<Funnel>>({});
    const formStages = ref<{ items: Stage[] }>({ items: [] });

    const { data } = await useAsyncData("funnels:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v1/funnels/${funnel}`);
            formFunnel.value = _data;
            formStages.value.items = _data.stages;

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!funnel
    });

    const remove = async (index: number) => {
        const id = formStages.value.items[index].id;

        if (id) {
            await useFetchApi(`v1/funnels/${funnel}/stages/${id}`, {
                method: "DELETE"
            });
        }

        if (index > -1) {
            formStages.value.items.splice(index, 1);
        }
    };

    const upSert = async () => {
        const { data } = await useFetchApi(`v1/funnels/${funnel || ""}`, {
            method: funnel ? "PUT" : "POST",
            body: formFunnel.value
        });

        try {
            const _stages = formStages
                .value
                .items
                .map((value, index, array) => ({
                    ...value,
                    last_stage: index + 1 === array.length ? value.last_stage : false
                }));

            for (let index = 0; index < _stages.length; index++) {
                const {
                    id = 0,
                    ...body
                } = _stages[index];

                await useFetchApi(`v1/funnels/${data.id}/stages/${id || ""}`, {
                    method: id ? "PUT" : "POST",
                    body,
                    onResponse: undefined
                });
            }
        }
        finally {
            if (funnel) {
                await back();
            }
            else {
                await navigateTo(`/configuracoes/funis/${data.id}`);
            };
        }
    };

    const confirmeDelete = useModalConfirm();
</script>