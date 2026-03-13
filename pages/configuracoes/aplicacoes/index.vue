<template>
    <TablePage
        ref="tablePage"
        :request
        :thead="[
            { name: 'Nome', propertyPath: 'name' },
            { name: 'Descrição', propertyPath: 'description' },
            { name: 'APP_ID', propertyPath: 'app_id' },
            { name: 'URL de redirecionamento', propertyPath: 'redirect' }
        ]"
        :itemClick="useCheckPermissions('update_application')"
    >
        <template #actions="item">
            <Button
                v-if="useCheckPermissions('update_application')"
                v-tooltip="'Editar'"
                :href="`./aplicacoes/${item.id}`"
                color="background"
                size="sm"
            >
                <Icon name="edit" size="1.2rem" />
            </Button>

            <Button
                v-if="useCheckPermissions('delete_application')"
                v-tooltip="'Deletar'"
                color="danger"
                size="sm"
                @click="confirmeDelete?.toggle(true, usePick(item, ['id', 'name']))"
            >
                <Icon name="delete" size="1.2rem" />
            </Button>
        </template>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_application')"
                    :href="`./aplicacoes/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar aplicação
                    </span>
                </Button>
                <Button
                    color="contrast"
                    class="!px-2.5"
                    @click="modalUse?.toggle()"
                >
                    <Icon name="info" size="1.5rem" />
                </Button>
            </LayoutPortal>

            <ConfigsAppInfo ref="modalUse" />

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="o aplicação"
                :action="async ({ id }) => await useFetchApi(`${request}/${id}`, {
                    method: 'delete'
                })"
                @then="tablePage?.refresh"
            />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "aplicações",
        navOrder: 60,
        alias: ["/adm/empresas/:company/aplicacoes"],
        permissions: "read_application",
        layoutConfig: {
            search: true
        }
    });

    const { $user } = useNuxtApp();

    const {
        company = $user.value?.company.id
    } = useRouteParams();

    const request = `admin/companies/${company}/apps` as const;
    const tablePage = useTablePage();

    useBusLayout().on((event) => {
        if ("search" in event) {
            tablePage.value!.filters.name = event.search;
        }
    });

    const modalUse = useTemplateRef("modalUse");
    const confirmeDelete = useModalConfirm();
</script>