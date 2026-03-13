<template>
    <TablePage
        ref="tablePage"
        :request
        :thead="[
            { name: 'Nome', propertyPath: 'name' },
            { name: 'url', propertyPath: 'url' },
            { name: 'Segredo', propertyPath: 'secret' },
            { name: 'Tem mapeamento', propertyPath: 'fields_mapping', transform: (v) => v ? 'Sim' : 'Não' }
        ]"
        :itemClick="useCheckPermissions('update_webhook')"
    >
        <template #actions="item">
            <Button
                v-if="useCheckPermissions('update_webhook')"
                v-tooltip="'Editar'"
                :href="`./webhooks/${item.id}`"
                color="background"
                size="sm"
            >
                <Icon name="edit" size="1.2rem" />
            </Button>

            <Button
                v-if="useCheckPermissions('delete_webhook')"
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
                    v-if="useCheckPermissions('create_webhook')"
                    :href="`./webhooks/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar webhook
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="o webhook"
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
        navOrder: 70,
        alias: ["/adm/empresas/:company/webhooks"],
        permissions: "read_webhook",
        layoutConfig: {
            search: true
        }
    });

    const { $user } = useNuxtApp();

    const {
        company = $user.value?.company.id
    } = useRouteParams();

    const request = `admin/companies/${company}/webhooks` as const;
    const tablePage = useTablePage();

    useBusLayout().on((event) => {
        if ("search" in event) {
            tablePage.value!.filters.name = event.search;
        }
    });

    const confirmeDelete = useModalConfirm();
</script>