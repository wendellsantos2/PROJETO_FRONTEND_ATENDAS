<template>
    <TablePage
        ref="tablePage"
        request="v1/funnels"
        :thead="[
            { name: 'Id', propertyPath: 'id' },
            { name: 'Nome', propertyPath: 'name' },
            { name: 'Descrição', propertyPath: 'description' }
        ]"
        :opts="{
            preFilters: false
        }"
        :itemClick="useCheckPermissions('update_funnel')"
    >
        <template #actions="_data">
            <Button
                v-if="useCheckPermissions('update_funnel')"
                v-tooltip="'Editar'"
                :href="`funis/${_data.id}`"
                color="background"
                size="sm"
            >
                <Icon name="edit" size="1.2rem" />
            </Button>
            <Button
                v-if="useCheckPermissions('delete_funnel')"
                v-tooltip="'Deletar'"
                color="danger"
                size="sm"
                @click="() => confirmeDelete?.toggle(true, { id: _data.id, name: _data.name })"
            >
                <Icon name="delete" size="1.2rem" />
            </Button>
        </template>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_funnel')"
                    :href="`funis/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar funil
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="o funil"
                :action="async ({ id }) => await useFetchApi(`v1/funnels/${id}`, {
                    method: 'delete'
                })"
                @then="tablePage?.refresh"
            />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    definePageMeta({
        navOrder: 30,
        permissions: "read_funnel",
        layoutConfig: {
            search: true
        }
    });

    const tablePage = useTablePage();

    useBusLayout().on((event) => {
        if ("search" in event) {
            tablePage.value!.filters.search = event.search;
        }
    });

    const confirmeDelete = useTemplateRef("confirmeDelete");
</script>