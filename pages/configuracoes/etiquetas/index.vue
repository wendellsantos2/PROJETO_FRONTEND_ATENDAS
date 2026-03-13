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
            size="none"
            class="!w-full !gap-2 !rounded-3xl p-4 text-lg shadow"
        >
            <div class="ml-auto flex flex-row items-center gap-2">
                <Button
                    v-if="useCheckPermissions('update_tag')"
                    v-tooltip="'Editar'"
                    :href="`/configuracoes/etiquetas/${item.id}`"
                    class="!px-2"
                >
                    <Icon name="edit" size="1rem" />
                </Button>

                <Button
                    v-if="useCheckPermissions('delete_tag')"
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
                    v-if="useCheckPermissions('create_tag')"
                    :href="`/configuracoes/etiquetas/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar etiqueta
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="a etiqueta"
                :action="async ({ id }) => await useFetchApi(`v1/tags/${id}`, {
                    method: 'delete'
                })"
                @then="refresh"
            />
        </template>
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        navOrder: 50,
        permissions: "read_tag",
        layoutConfig: {
            search: true,
            filters: {
                type: {
                    type: "multiselect",
                    label: "Tipo",
                    placeholder: "Selecione o tipo",
                    items: async (name) => {
                        const { $user } = useNuxtApp();
                        return await useFetchSelect(`v1/companies/${$user.value?.company.id}/settings/tags/types`, {
                            filters: { name },
                            fields: false
                        });
                    }
                }
            }
        }
    });

    const {
        data,
        pending,
        filters,
        pagination,
        paginationInfo,
        refresh
    } = useFetchData("v1/tags", {
        preFilters: false,
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

        if (event?.filters && filters.value) {
            filters.value = Object.assign(filters.value, event.filters);
        }
    });

    const confirmeDelete = useModalConfirm();
</script>