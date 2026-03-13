<template>
    <TablePage
        ref="tablePage"
        :request="`v1/contacts/${contact}/appointments`"
        :thead="[
            { name: 'Id', propertyPath: 'id' },
            { name: 'Titulo', propertyPath: 'title' },
            { name: 'Descrição', propertyPath: 'description' },
            { name: 'Começa em', propertyPath: 'start_in', transform: useDate },
            { name: 'Termina em', propertyPath: 'finish_in', transform: useDate },
            { name: 'Duração', slot: 'duration' }
        ]"
        :itemClick="useCheckPermissions('update_contact')"
    >
        <template #duration="{ start_in, finish_in }">
            {{ usePastTime(start_in, { finishAt: finish_in, prefix: false }) }}
        </template>

        <template #actions="{ id, title }">
            <Button
                v-if="useCheckPermissions('update_contact')"
                v-tooltip="'Editar'"
                :href="`/contatos/${contact}/compromissos/${id}`"
                color="background"
                size="sm"
            >
                <Icon name="edit" size="1.2rem" />
            </Button>

            <Button
                v-if="useCheckPermissions('delete_contact')"
                v-tooltip="'Deletar'"
                color="danger"
                size="sm"
                @click="confirmeDelete?.toggle(true, { id, title })"
            >
                <Icon name="delete" size="1.2rem" />
            </Button>
        </template>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('update_contact')"
                    :href="`/contatos/${contact}/compromissos/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar compromisso
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                complement="a compromisso #{id} {title}"
                :action="async ({ id }) => await useFetchApi(`v1/contacts/${contact}/appointments/${id}`, {
                    method: 'delete'
                })"
                @then="tablePage?.refresh"
            />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    definePageMeta({
        navOrder: 50,
        permissions: "read_contact"
    });

    const {
        contact
    } = useRouteParams();

    const tablePage = useTablePage();
    const confirmeDelete = useModalConfirm();
</script>