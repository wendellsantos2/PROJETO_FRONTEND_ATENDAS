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
                <Button
                    v-if="useCheckPermissions('update_category')"
                    v-tooltip="'Editar'"
                    class="!px-2"
                    @click="modalUpsert?.toggle(true, { id: item.id, form: item })"
                >
                    <Icon name="edit" size="1rem" />
                </Button>

                <Button
                    v-if="useCheckPermissions('delete_category')"
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
                    v-if="useCheckPermissions('create_category')"
                    variant="gradient"
                    @click="modalUpsert?.toggle()"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar categoria
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModal
                ref="modalUpsert"
                v-slot="{ context }"
                :title="`${modalUpsert?.context.id ? 'editar' : 'criar'} categoria`"
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

                    <Button class="col-span-full" :loading>
                        <Icon name="upload" />
                        Salvar
                    </Button>
                </Vueform>
            </LazyModal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="a categoria"
                :action="async ({ id }) => await useFetchApi(`v1/categories/${id}`, {
                    method: 'delete'
                })"
                @then="refresh"
            />
        </template>
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        navOrder: 20,
        permissions: "read_category",
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
    } = useFetchData("v1/categories", {
        fetch: {
            params: {
                per_page: 40
            }
        }
    });

    useBusLayout().on((event) => {
        if ("search" in event) {
            filters.value.name = event.search;
        }
    });

    const contextInitial = {
        id: 0,
        form: {} as Partial<NonNullable<typeof data.value>[0]>
    };

    const modalUpsert = useModal<typeof contextInitial>();

    const loading = ref(false);

    const upSert = async () => {
        loading.value = true;

        const id = modalUpsert.value?.context.id;

        await useFetchApi(`v1/categories/${id || ""}`, {
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

    const confirmeDelete = useModalConfirm();
</script>