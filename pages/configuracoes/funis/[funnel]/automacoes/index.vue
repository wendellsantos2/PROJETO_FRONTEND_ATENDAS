<template>
    <TablePage
        ref="tablePage"
        request="v2/automations"
        :opts="{
            fetch: {
                params: {
                    'filter[funnel_id]': funnel
                }
            }
        }"
        :thead="[
            { name: 'Id', propertyPath: 'id' },
            { name: 'Evento', propertyPath: 'trigger_event.title' },
            { name: 'Ação', propertyPath: 'dispatch_action.title' },
            { name: 'Condição', propertyPath: 'dispatch_condition.title' },
            { name: 'Intervalo', propertyPath: 'dispatch_delay', transform: (v) => v ? `${v} segundos` : 'Imediato' }
        ]"
        :itemClick="useCheckPermissions('update_automation')"
    >
        <template #actions="{ id }">
            <Button
                v-if="useCheckPermissions('update_automation')"
                v-tooltip="'Editar'"
                :href="`automacoes/${id}`"
                color="background"
                size="sm"
            >
                <Icon name="edit" size="1.2rem" />
            </Button>

            <Button
                v-if="useCheckPermissions('delete_automation')"
                v-tooltip="'Deletar'"
                color="danger"
                size="sm"
                @click="confirmeDelete?.toggle(true, { id })"
            >
                <Icon name="delete" size="1.2rem" />
            </Button>
        </template>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_automation')"
                    :href="`automacoes/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar automação
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                complement="a automação #{id}"
                :action="async ({ id }) => await useFetchApi(`v2/automations/${id}`, {
                    method: 'delete'
                })"
                @then="tablePage?.refresh"
            />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "automações",
        navOrder: 10,
        permissions: "read_automation"
    });

    const {
        funnel
    } = useRouteParams();

    const tablePage = useTablePage();
    const confirmeDelete = useModalConfirm();
</script>