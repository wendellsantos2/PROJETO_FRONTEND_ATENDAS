<template>
    <TablePage
        ref="tablePage"
        request="admin/companies"
        :thead="[
            { name: 'id', propertyPath: 'id' },
            { name: 'Nome', propertyPath: 'name' },
            { name: 'CNPJ', propertyPath: 'document_formatted' }
        ]"
        :itemClick="useCheckPermissions('read_company')"
    >
        <template #actions="{ id, name }">
            <Button
                v-if="useCheckPermissions('impersonate_user')"
                v-tooltip="'Membros'"
                color="secondary"
                size="sm"
                @click="members?.toggle(true, { id, name })"
            >
                <Icon name="users" />
            </Button>
            <Button
                v-if="useCheckPermissions('update_company')"
                v-tooltip="'Editar'"
                :href="`/adm/empresas/${id}`"
                color="background"
                size="sm"
            >
                <Icon name="edit" size="1.2rem" />
            </Button>
            <Button
                v-if="useCheckPermissions('delete_company')"
                v-tooltip="'Deletar'"
                color="danger"
                size="sm"
                @click="() => confirmeDelete?.toggle(true, { id, name })"
            >
                <Icon name="delete" size="1.2rem" />
            </Button>
        </template>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_company')"
                    variant="gradient"
                    :href="`/adm/empresas/${enums.paramCreate}`"
                >
                    <span class="hidden sm:block">
                        Adicionar empresa
                    </span>
                    <Icon name="plus" class="sm:hidden" />
                </Button>
            </LayoutPortal>
            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="a empresa"
                :action="async ({ id }) => await useFetchApi(`admin/companies/${id}`, {
                    method: 'delete'
                })"
                @then="tablePage?.refresh"
            />

            <LazyAdmMembers
                v-if="useCheckPermissions('impersonate_user')"
                ref="members"
            />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    import type { AdmMembers } from "#components";

    definePageMeta({
        navOrder: 10,
        permissions: "read_company",
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

    const confirmeDelete = useModalConfirm<{
        id: number
        name: string
    }>();

    const members = ref<InstanceType<typeof AdmMembers>>();
</script>