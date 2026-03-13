<template>
    <TablePage
        ref="tablePage"
        :request="`admin/companies/${company}/providers`"
        :opts="{
            preFilters: false
        }"
        :thead="[
            { name: 'Id', propertyPath: 'id' },
            { name: 'Nome', slot: 'name' },
            { name: 'Tipo', propertyPath: 'type', transform: useProviderName },
            { name: 'Serviço', propertyPath: 'service' },
            { name: 'Identificador', slot: 'sender' }
        ]"
        :itemClick="useCheckPermissions('update_provider')"
    >
        <template #name="provider">
            <span class="flex flex-row items-center gap-2">
                <Icon :name="useProviderIcon(provider.type, provider.service)" size="1.5rem" />
                {{ provider.name }}
            </span>
        </template>
        <template #sender="provider">
            <span v-if="provider?.sender">
                {{ provider.sender }}
            </span>
        </template>
        <template #actions="provider">
            <LazyAdmProvidersAuthorize
                v-if="['hubspot', 'x', 'instagram', 'messenger'].includes(provider.service)"
                :provider
                @then="tablePage?.refresh()"
            />
            <LazyAdmProvidersWhatsappAtendas
                v-if="provider.service === 'whatsapp-atendas'"
                :provider
                @then="tablePage?.refresh()"
            />
            <LazyAdmProvidersLeadsim
                v-if="provider.service === 'leadsim'"
                :provider
                @then="tablePage?.refresh()"
            />
            <LazyAdmProvidersHubspot
                v-if="provider.service === 'hubspot'"
                :provider
                @then="tablePage?.refresh()"
            />
            <LazyAdmProvidersWebchat
                v-if="provider.service === 'webchat'"
                :provider
                @then="tablePage?.refresh()"
            />
            <LazyAdmProvidersWhatsappSyncTemplates
                v-if="['whatsapp-vonage', 'whatsapp'].includes(provider.service)"
                :provider
                @then="tablePage?.refresh()"
            />
            <Vueform
                v-if="useCheckPermissions('update_provider')"
                :removeClasses="{
                    FormElements: {
                        container: ['form-gap-x-gutter'],
                        container_sm: ['form-gap-x-gutter-sm'],
                        container_lg: ['form-gap-x-gutter-lg']
                    }
                }"
            >
                <ToggleElement
                    :key="provider.status"
                    v-tooltip="provider.status ? 'Desativar' : 'Ativar'"
                    name="status"
                    :default="provider.status"
                    @change="changeStatus(provider.id, $event)"
                />
            </Vueform>
            <LazyButton
                v-if="useCheckPermissions('update_provider')"
                v-tooltip="'Editar'"
                :href="`./provedores/${provider.id}`"
                color="background"
                size="sm"
            >
                <Icon name="edit" size="1.2rem" />
            </LazyButton>
            <LazyButton
                v-if="useCheckPermissions('delete_provider')"
                v-tooltip="'Deletar'"
                color="danger"
                size="sm"
                @click="() => confirmeDelete?.toggle(true, usePick(provider, ['id', 'name', 'service']))"
            >
                <Icon name="delete" size="1.2rem" />
            </LazyButton>
        </template>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_provider')"
                    :href="`./provedores/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar provedor
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="o provedor da {service}"
                :action="async ({ id }) => await useFetchApi(`admin/companies/${company}/providers/${id}`, {
                    method: 'delete'
                })"
                @then="tablePage?.refresh()"
            />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    definePageMeta({
        alias: ["/adm/empresas/:company/provedores"],
        navOrder: 11,
        permissions: "read_provider",
        layoutConfig: {
            search: true,
            filters: {
                type: {
                    type: "multiselect",
                    label: "Tipo",
                    placeholder: "Selecione os tipos",
                    items: Object.entries(providers).map(([value, { name: label }]) => ({ value, label }))
                },
                status: {
                    type: "select",
                    label: "Situação",
                    placeholder: "Selecione a situação",
                    items: [{
                        value: "true",
                        label: "Ativado"
                    }, {
                        value: "false",
                        label: "Desativado"
                    }]
                }
            }
        }
    });

    const { $user } = useNuxtApp();

    const {
        company = $user.value?.company.id
    } = useRouteParams();

    const tablePage = useTemplateRef("tablePage");

    useBusLayout().on((event) => {
        if ("search" in event) {
            tablePage.value!.filters.name = event.search;
        }

        if (event?.filters && tablePage.value!.filters) {
            tablePage.value!.filters = Object.assign(tablePage.value!.filters, event.filters);
        }
    });

    const changeStatus = async (provider: number, status: boolean) => {
        await useFetchApi(`admin/companies/${company}/providers/${provider}`, {
            method: "PUT",
            body: { status }
        });
    };

    const confirmeDelete = useModalConfirm();
</script>