<template>
    <TablePage
        ref="tablePage"
        request="v1/campaigns"
        :thead="[
            { name: 'Nome', slot: 'name' },
            { name: 'Descrição', propertyPath: 'description' },
            { name: 'Template', propertyPath: 'template.name' },
            { name: 'Mensagem', propertyPath: 'template.content' },
            { name: 'Serviço', propertyPath: 'provider.service' }
        ]"
        :itemClick="useCheckPermissions('update_campaign')"
    >
        <template #name="{ name, provider }">
            <span class="flex flex-row items-center gap-2">
                <Icon :name="useProviderIcon('message', provider?.service)" size="1.5rem" />
                {{ name }}
            </span>
        </template>

        <template #actions="{ id, name, status }">
            <Vueform
                v-if="useCheckPermissions('update_campaign')"
                v-tooltip="status ? 'Desativar' : 'Ativar'"
                :removeClasses="{
                    FormElements: {
                        container: ['form-gap-x-gutter'],
                        container_sm: ['form-gap-x-gutter-sm'],
                        container_lg: ['form-gap-x-gutter-lg']
                    }
                }"
            >
                <ToggleElement
                    name="status"
                    :default="status"
                    @change="(status: boolean) => changeStatus(id, status)"
                />
            </Vueform>

            <Button
                v-if="useCheckPermissions('update_campaign')"
                v-tooltip="'Editar'"
                :href="`/campanhas/${id}`"
                color="background"
                size="sm"
            >
                <Icon name="edit" size="1.2rem" />
            </Button>

            <Button
                v-if="useCheckPermissions('delete_campaign')"
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
                    v-if="useCheckPermissions('create_campaign')"
                    :href="`/campanhas/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar campanha
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="a campanha"
                :action="async ({ id }) => await useFetchApi(`v1/campaigns/${id}`, {
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
        icon: "campaign",
        permissions: "read_campaign",
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

    const changeStatus = async (id: number, status: boolean) => {
        await useFetchApi(`v1/campaigns/${id}`, {
            method: "PUT",
            body: {
                status
            }
        })
            .then(() => {
                tablePage.value?.refresh();
            });
    };

    const confirmeDelete = useModalConfirm();
</script>