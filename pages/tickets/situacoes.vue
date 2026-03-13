<template>
    <Container
        grid
        :pending
        :pagination="paginationInfo"
        @pagination="(v) => pagination.page = v"
    >
        <Badge
            v-for="item in data"
            :key="item.id"
            :color="item.color"
            variant="subtle"
            :name="item.name"
            :resumeString="22"
            :icon="false"
            size="none"
            class="!w-full !gap-2 !rounded-3xl p-4 text-lg shadow"
        >
            <div class="ml-auto flex flex-row items-center gap-2">
                <span>
                    {{ item.sort_order }}
                    <Icon name="priority" size="0.8rem" class="-mb-3 -ml-1" />
                </span>
                <Button
                    v-if="useCheckPermissions('update_status')"
                    v-tooltip="'Editar'"
                    class="!px-2"
                    @click="modalUpsert?.toggle(true, { id: item.id, form: item })"
                >
                    <Icon name="edit" size="1rem" />
                </Button>

                <Button
                    v-if="useCheckPermissions('delete_status')"
                    v-tooltip="'Deletar'"
                    color="danger"
                    class="!px-2"
                    @click="confirmeDelete?.toggle(true, usePick(item, ['id', 'name']))"
                >
                    <Icon name="delete" size="1rem" />
                </Button>
            </div>
        </Badge>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_status')"
                    variant="gradient"
                    @click="modalUpsert?.toggle()"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar situação
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModal
                ref="modalUpsert"
                v-slot="{ context }"
                :title="`${modalUpsert?.context.id ? 'editar' : 'criar'} situação`"
                :contextInitial
                size="xs"
            >
                <Vueform
                    v-model="modalUpsert!.context.form"
                    sync
                    :endpoint="false"
                    @submit="upSert"
                >
                    <TextElement
                        name="name"
                        label="Nome"
                        placeholder="parceiro"
                        rules="required|min:1"
                    />

                    <SelectColor
                        :description="context.form?.color"
                    />

                    <TextElement
                        name="sort_order"
                        label="Ordenação"
                        placeholder="0"
                        inputType="number"
                        rules="required"
                    />

                    <SelectElement
                        name="assign_to"
                        label="Tipo de evento"
                        placeholder="Selecione um evento"
                        :native="false"
                        :items="events!"
                        closeOnSelect
                    />

                    <div class="col-span-full flex flex-row items-center justify-between">
                        <span>
                            Visível no kamban de tickets?
                        </span>
                        <ToggleElement
                            name="display_in_kanban"
                            :labels="{ on: 'Sim', off: 'Não' }"
                        />
                    </div>

                    <Button class="col-span-full" :loading>
                        <Icon name="upload" />
                        Salvar
                    </Button>
                </Vueform>
            </LazyModal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="a situação"
                :action="async ({ id }) => await useFetchApi(`v1/statuses/${id}`, {
                    method: 'delete'
                })"
                @then="refresh"
            />
        </template>
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "situações",
        navOrder: 30,
        permissions: "read_status",
        layoutConfig: {
            search: true
        }
    });

    const {
        data,
        pending,
        filters,
        pagination,
        paginationInfo,
        refresh
    } = useFetchData("v1/statuses", {
        fetch: {
            params: {
                sort: "sort_order",
                per_page: 40
            }
        }
    });

    useBusLayout().on((event) => {
        if ("search" in event) {
            filters.value.name = event.search;
        }
    });

    const { $user } = useNuxtApp();

    const contextInitial = {
        id: 0,
        form: {} as Partial<NonNullable<typeof data.value>[0]>
    };

    const modalUpsert = useModal<typeof contextInitial>();

    const loading = ref(false);

    const upSert = async () => {
        loading.value = true;

        const id = modalUpsert.value?.context.id;

        await useFetchApi(`v1/statuses/${id || ""}`, {
            method: id ? "PUT" : "POST",
            body: modalUpsert.value?.context.form
        })
            .then(() => {
                modalUpsert.value?.toggle(false);
                refresh();
            })
            .finally(() => {
                loading.value = false;
            });
    };

    const { data: events } = useLazyAsyncData("tickets:events", async () => {
        return async () => await useFetchSelect(`v1/companies/${$user.value?.company.id}/settings/tickets/events`, {
            fields: false
        });
    });

    const confirmeDelete = useModalConfirm();
</script>