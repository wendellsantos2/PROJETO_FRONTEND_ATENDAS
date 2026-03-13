<template>
    <TablePage
        ref="tablePage"
        request="v2/dashboards"
        :thead="[
            { name: 'ID', propertyPath: 'id' },
            { name: 'Nome', propertyPath: 'name' },
            { name: 'widgets', propertyPath: 'widgets.length' }
        ]"
        :itemClick="useCheckPermissions('update_dashboard')"
    >
        <template #actions="{ id, name }">
            <Button
                v-if="useCheckPermissions('update_dashboard')"
                v-tooltip="'Editar'"
                :href="`/dashboard/modelos/${id}`"
                color="background"
                size="sm"
            >
                <Icon name="edit" size="1.2rem" />
            </Button>

            <Button
                v-if="useCheckPermissions('delete_dashboard')"
                v-tooltip="'Deletar'"
                color="danger"
                size="sm"
                @click="confirmeDelete?.toggle(true, { id, name })"
            >
                <Icon name="delete" size="1.2rem" />
            </Button>
        </template>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_dashboard')"
                    :href="`/dashboard/modelos/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar modelo
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="o modelo de dashboard"
                :action="async ({ id }) => await useFetchApi(`v2/dashboards/${id}`, {
                    method: 'delete'
                })"
                @then="tablePage?.refresh"
            />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    definePageMeta({
        navOrder: 10,
        permissions: "read_dashboard",
        layoutConfig: {
            search: true
        }
    });

    const tablePage = useTablePage();

    useBusLayout().on((event) => {
        if ("search" in event) {
            tablePage.value!.filters.name = event.search;
        }
    });

    const confirmeDelete = useModalConfirm();
</script>