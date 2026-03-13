<template>
    <TablePage
        ref="tablePage"
        request="v1/conversations"
        :opts="{
            preFilters: false,
            fetch: {
                params: {
                    include: 'tags,contact,attendant'
                }
            },
            asyncData: {
                immediate: false
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

        <template #actionsBatch="{ items }">
            <Button
                color="success"
                size="sm"
                class="px-2"
                @click="confirmBatch?.toggle(true, { id: 'reopen', title: 'reabrir', color: 'success', ids: items })"
            >
                Reabrir
            </Button>
            <Button
                color="danger"
                size="sm"
                class="px-2"
                @click="confirmBatch?.toggle(true, { id: 'close', title: 'encerrar', color: 'danger', ids: items })"
            >
                Encerrar
            </Button>
        </template>

        <template #actions="conversation">
            <ConversationTableActionsMenu :conversation :conversationTableModals />
        </template>

        <template #after>
            <ConversationTableModals ref="conversationTableModals" />

            <LazyModalConfirm
                ref="confirmBatch"
                :complement="`as ${confirmBatch?.context?.ids?.length} conversas`"
                :title="confirmBatch?.context?.title ?? ''"
                :button="{
                    color: confirmBatch?.context?.color
                }"
                :contextInitial="confirmBatchContext"
                :action="async ({ id, ids }) => await useFetchApi('v2/batch/conversations', {
                    method: 'POST',
                    body: {
                        action: id,
                        ids
                    }
                })"
                @then="tablePage?.deselect()"
            />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";
    import type { Color } from "~/components/Button/Index.vue";
    import type { ConversationTableModals } from "~/components/Conversation/Table/ActionsMenu.vue";

    definePageMeta({
        title: "histórico",
        navOrder: 11,
        permissions: "manager_conversation",
        layoutConfig: {
            immediate: true,
            filters: {
                contact_id: {
                    type: "multiselect",
                    label: "Contato",
                    placeholder: "Selecione o contato",
                    items: async name => await useFetchSelect("v1/contacts", {
                        filters: { name }
                    })
                },
                attendant_id: {
                    type: "multiselect",
                    label: "Atendente",
                    placeholder: "Selecione o atendente",
                    empty: ["all"],
                    items: async name => await useFetchSelect("v1/users", {
                        filters: { name }
                    })
                },
                tags: {
                    type: "multiselect",
                    label: "Etiquetas",
                    placeholder: "Selecione as etiquetas",
                    items: async name => await useFetchSelect("v1/tags", {
                        filters: {
                            name,
                            type: "conversation"
                        }
                    })
                },
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

    const confirmBatchContext = {
        id: "",
        title: "",
        color: "success" as Color,
        ids: [0]
    };

    const confirmBatch = useModalConfirm<typeof confirmBatchContext>();
</script>