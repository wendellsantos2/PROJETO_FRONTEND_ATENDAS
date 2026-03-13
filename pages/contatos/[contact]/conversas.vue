<template>
    <TablePage
        ref="tablePage"
        :request="`v2/contacts/${contact}/conversations`"
        :opts="{
            preFilters: false,
            fetch: {
                params: {
                    include: 'tags,contact'
                }
            }
        }"
        :thead="[
            { name: 'Contato', slot: 'contact' },
            { name: 'Atendente', slot: 'attendant' },
            { name: 'Origem', propertyPath: 'origin' },
            { name: 'Etiquetas', slot: 'tags' },
            { name: 'Equipe', slot: 'team' },
            { name: 'Situação', slot: 'status' },
            { name: 'Ultima iteração', propertyPath: 'last_interaction', transform: usePastTime }
        ]"
        :itemClick="(conversation) => conversationTableModals?.modalWatch?.toggle(true, { id: conversation.id, conversation })"
    >
        <template #contact="{ contact: { avatar_url, name } }">
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

        <template #attendant="{ attendant, attendant_type }">
            <div v-if="attendant" class="flex flex-row items-center gap-3">
                <img
                    v-if="attendant_type === 'user'"
                    :src="attendant.avatar_url"
                    class="block size-8 rounded-full bg-background-100 object-cover object-center"
                >
                <Icon
                    v-else
                    name="bot"
                    size="1.5rem"
                    class="opacity-50"
                />
                <p>
                    {{ attendant.name }}
                </p>
            </div>
        </template>

        <template #tags="{ tags }">
            <template v-if="tags.at(0)">
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

        <template #team="{ team }">
            <Badge
                v-if="team"
                :color="team.color"
                :name="team.name"
                icon="team"
                variant="solid"
                size="sm"
            />
        </template>

        <template #status="{ status }">
            <Badge
                v-bind="statusTag(status)"
                :resumeString="20"
                :icon="false"
                size="sm"
            />
        </template>

        <template #actions="conversation">
            <ConversationTableActionsMenu :conversation :conversationTableModals />
        </template>

        <template #after>
            <ConversationTableModals ref="conversationTableModals" />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";
    import type { ConversationTableModals } from "~/components/Conversation/Table/ActionsMenu.vue";

    definePageMeta({
        title: "conversas",
        navOrder: 10,
        permissions: {
            satisfyAll: true,
            list: ["read_contact", "read_conversation", "manager_conversation"]
        },
        layoutConfig: {
            filters: {
                status: {
                    type: "multiselect",
                    label: "Situação",
                    placeholder: "Selecione a situação",
                    items: async (name) => {
                        const { $user } = useNuxtApp();
                        return await useFetchSelect(`v1/companies/${$user.value?.company.id}/settings/conversations/statuses`, {
                            filters: { name },
                            fields: false
                        });
                    }
                },
                period: {
                    type: "dates",
                    label: "Período",
                    placeholder: "Selecione o período",
                    valueFormat: "YYYY-MM-DD",
                    mode: "range"
                }
            }
        }
    });

    const {
        contact
    } = useRouteParams();

    const tablePage = useTablePage();
    const conversationTableModals = ref<ConversationTableModals>();

    useBusLayout().on((event) => {
        if (event?.filters && tablePage.value?.filters) {
            tablePage.value.filters = Object.assign(tablePage.value.filters, event.filters);
        }
    });

    const statusTag = (status: InternalApi["v1/conversations/:id"]["get"]["data"]["status"]) => {
        const [name, color] = ({
            created: ["Bot", "indigo"],
            pending: ["Pendente", "warn"],
            started: ["Em atendimento", "success"],
            closed: ["Finalizada", "danger"],
            campaign: ["Em campanha", "pink"],
            ignored: ["Ignorada", "orange"],
            window_closed: ["Janela fechada", "#451a03"],
            nps: ["nps", "yellow"]
        } as const)?.[status] ?? [status, undefined];

        return {
            name,
            color
        };
    };
</script>