<template>
    <Container
        grid
        addClass="md:grid-cols-2 2xl:grid-cols-3"
        :pending
        :pagination="paginationInfo"
        @pagination="(v) => pagination.page = v"
    >
        <Card
            v-for="item in data"
            :key="item.id"
            :data="item"
            :edit="useCheckPermissions('update_contract_template')"
            :delete="useCheckPermissions('delete_contract_template')"
            @delete="({ id, name }) => confirmDelete?.toggle(true, { id, name })"
            @edit="async ({ id }) => await navigateTo(`/contratos/${id}`)"
        >
            <ContractPreview
                :link="item.link"
                :logo="item.logo_link"
            />
        </Card>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_contract_template')"
                    :href="`/contratos/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar modelo
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmDelete"
                title="deletar"
                the="o modelo de contrato"
                :action="async ({ id }) => await useFetchApi(`connectasign/contract-templates/${id}`, {
                    method: 'delete'
                })"
                @then="refresh"
            />
        </template>
    </container>
</template>

<script setup lang="ts">
    definePageMeta({
        navOrder: 44,
        icon: "contract",
        permissions: {
            list: ["provider:sign", "read_contract_template"],
            satisfyAll: true
        },
        layoutConfig: {
            search: true
        }
    });

    const {
        data,
        pending,
        refresh,
        pagination,
        paginationInfo,
        filters
    } = useFetchData("connectasign/contract-templates");

    useBusLayout().on((event) => {
        if ("search" in event) {
            filters.value.name = event.search;
        }
    });

    const confirmDelete = useTemplateRef("confirmDelete");
</script>