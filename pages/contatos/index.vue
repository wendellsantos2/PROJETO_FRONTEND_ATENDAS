<template>
    <TablePage
        ref="tablePage"
        request="v1/contacts"
        :thead="[
            { name: 'Nome', slot: 'name' },
            { name: 'KYC', slot: 'kyc', show: useCheckPermissions('provider:kyc') },
            { name: 'Etiquetas', slot: 'tags' },
            { name: 'Celular', slot: 'phone' },
            { name: 'E-mail', propertyPath: 'email' },
            { name: 'CPF', slot: 'cpf' }
        ]"
        :opts="{
            preFilters: false
        }"
        :itemClick="useCheckPermissions(['read_contact', 'update_contact'])"
    >
        <template #kyc="{ metadata }">
            <Badge
                v-if="metadata?.kyc_status"
                v-bind="useKycStatus(metadata.kyc_status)"
                :resumeString="0"
                size="sm"
                variant="subtle"
            />
        </template>

        <template #name="{ avatar_url, name }">
            <div class="flex flex-row items-center gap-3">
                <img
                    :src="avatar_url"
                    class="block size-8 rounded-full bg-background object-cover object-center"
                >
                <p>
                    {{ name }}
                </p>
            </div>
        </template>

        <template #tags="{ tags }">
            <template v-if="tags?.at(0)">
                <Badge
                    :color="tags.at(0)?.color"
                    :name="tags.at(0)?.name"
                    :resumeString="20"
                    :icon="false"
                    size="sm"
                />
                <span v-show="tags.length > 1">
                    + {{ tags.length-1 }}
                </span>
            </template>
        </template>

        <template #phone="{ country_code, phone }">
            <template v-if="country_code && phone">
                {{ new Mask({ mask: useCountryDDIFind('code', country_code)?.mask }).masked(phone) }}
            </template>
        </template>

        <template #cpf="{ document_formatted, metadata }">
            <p v-if="document_formatted" class="inline-flex w-full items-center justify-between gap-2">
                {{ document_formatted }}

                <LazyContactFlagCPF
                    :metadata
                />
            </p>
        </template>

        <template #actions="_data">
            <Button
                v-if="useCheckPermissions('create_message')"
                v-tooltip="'Enviar mensagem'"
                size="sm"
                color="contrast"
                @click="conversationNewMessage?.toggle(true, { ...usePick(_data, ['id', 'name', 'services', 'phone', 'country_code']), form: {} })"
            >
                <Icon name="email" size="1.2rem" />
            </Button>
            <Button
                v-if="useCheckPermissions('update_contact')"
                v-tooltip="'Editar'"
                :href="`/contatos/${_data.id}`"
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
                @click="() => confirmeDelete?.toggle(true, { id: _data.id, name: _data.name })"
            >
                <Icon name="delete" size="1.2rem" />
            </Button>
        </template>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_contact')"
                    :href="`/contatos/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar contato
                    </span>
                </Button>
            </LayoutPortal>

            <LazyConversationNewMessage
                ref="conversationNewMessage"
            />

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="o contato"
                :action="async ({ id }) => await useFetchApi(`v1/contacts/${id}`, {
                    method: 'delete'
                })"
                @then="tablePage?.refresh"
            />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    import type { ConversationNewMessage } from "#components";
    import type { ComponentExposed } from "~/types";
    import { Mask } from "maska";

    definePageMeta({
        navOrder: 30,
        icon: "contacts",
        permissions: "read_contact",
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

    const conversationNewMessage = ref<ComponentExposed<typeof ConversationNewMessage>>();
    const confirmeDelete = useModalConfirm();
    const { $user } = useNuxtApp();

    usePusher({
        name: "private-companies.{id}",
        id: $user.value?.company.id ?? 0
    }, {
        upsertContact (_data) {
            tablePage.value?.upSert(_data);
        },
        deleteContact ({ id }) {
            tablePage.value?.remove(id);
        }
    }, {
        delay: 1500
    });
</script>