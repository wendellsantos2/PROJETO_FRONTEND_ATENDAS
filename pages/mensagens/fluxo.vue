<template>
    <section class="mask-transparent-border flex size-full snap-x snap-mandatory scroll-pl-4 flex-row gap-6 overflow-auto p-4 !pt-0 [--deg:90deg] [--size:1rem] sm:scroll-pl-6 sm:p-6 sm:[--size:1.5rem]">
        <article
            v-for="(step, status) in steps"
            :key="status"
            class="relative flex w-[calc(100%-2rem)] flex-none grow snap-start snap-always flex-col overflow-hidden rounded-2xl bg-background-100 lg:w-[calc(50%-2rem)] 2xl:flex-1"
        >
            <InfiniteList
                :ref="(e) => refer(e, status)"
                request="v1/conversations"
                :opts="{
                    keyPrefix: `conversations:flow:${status}`,
                    preFilters: false,
                    fetch: {
                        params: {
                            'include': 'contact,tags',
                            'filter[status]': status,
                            ...step.params
                        }
                    },
                    asyncData: {
                        immediate: false
                    }
                }"
                class="absolute inset-0 p-4 [--size:1rem] sm:p-6 sm:[--size:1.5rem]"
                classList="gap-6"
            >
                <template #before>
                    <li
                        class="sticky top-0 z-5 flex flex-row items-center justify-between rounded-full bg-current px-4 py-2"
                        :class="step.class"
                    >
                        <span class="font-medium text-white">
                            {{ step.name }}
                        </span>
                        <span class="flex rounded-full bg-white p-1.25">
                            <Icon
                                :name="step.icon"
                                size="1.5rem"
                            />
                        </span>
                    </li>
                </template>
                <template #default="{ item: conversation }">
                    <ConversationContact
                        :conversation
                        :maxTags="2"
                        :resumeStringTag="$screen.value.xs ? undefined : 0"
                        :lengthName="35"
                        recipient
                        :class="useCheckPermissions('read_conversation') ? 'hover:bg-soft': '!cursor-default'"
                        @click="useCheckPermissions('read_conversation') ? conversationTableModals?.modalWatch?.toggle(true, { id: conversation.id, conversation }) : void 0"
                    >
                        <template #afterName>
                            <Badge
                                v-if="conversation.team"
                                :color="conversation.team?.color"
                                :name="conversation.team?.name"
                                icon="team"
                                variant="solid"
                                class="ml-auto"
                            />
                            <ConversationTableActionsMenu
                                :conversation
                                :conversationTableModals
                                class="translate-x-1/2"
                                :class="{ 'ml-0': conversation.team }"
                            >
                                <button class="flex">
                                    <Icon name="menu" size="1rem" />
                                </Button>
                            </ConversationTableActionsMenu>
                        </template>
                    </ConversationContact>
                </template>
            </InfiniteList>
        </article>

        <LazyConversationTableModals ref="conversationTableModals" />
    </section>
</template>

<script setup lang="ts">
    import type { InfiniteList } from "#components";
    import type { ConversationTableModals } from "~/components/Conversation/Table/ActionsMenu.vue";
    import type { ComponentExposed } from "~/types";

    definePageMeta({
        title: "fluxo de conversas",
        navOrder: 30,
        layoutConfig: {
            search: true,
            immediate: true,
            filters: {
                attendant_id: {
                    type: "multiselect",
                    label: "Atendente",
                    placeholder: "Selecione o atendente",
                    empty: ["all"],
                    items: async name => await useFetchSelect("v1/users", {
                        filters: { name }
                    })
                }
            },
            filterPermissions: "manager_conversation"
        }
    });

    const steps: Record<string, {
        name: string
        icon: string
        class: string
        params?: Record<string, string>
    }> = {
        pending: {
            name: "Mensagens pendentes",
            icon: "hourglass",
            class: "text-secondary",
            params: {
                sort: "updated_at"
            }
        },
        started: {
            name: "Mensagens em Chat",
            icon: "chat",
            class: "text-primary"
        },
        closed: {
            name: "Mensagens atendidas",
            icon: "check",
            class: "text-success"
        }
    };

    type GroupConversations = ComponentExposed<typeof InfiniteList<"v1/conversations">>;

    const groupConversations: Record<string, GroupConversations> = {};

    const refer = (el: Element | globalThis.ComponentPublicInstance | null, status: string) => {
        el
            ? groupConversations[status] = el as unknown as GroupConversations
            : delete groupConversations?.[status];
    };

    useBusLayout().on((event) => {
        if ("search" in event) {
            Object.values(groupConversations).forEach((conversations) => {
                conversations.filters.search = event.search;
            });
        }

        if (event?.filters && Object.keys(event?.filters).length) {
            Object.values(groupConversations).forEach((conversations) => {
                conversations.filters = Object.assign(conversations.filters, event.filters);
            });
        }
    });

    const stepsKeys = Object.keys(steps);
    const { $user } = useNuxtApp();

    const channel = useCheckPermissions("manager_conversation")
        ? {
            name: "private-companies.{id}",
            id: $user.value?.company.id ?? 0
        } as const
        : {
            name: "private-users.{id}",
            id: $user.value?.id ?? 0
        } as const;

    usePusher(channel, {
        upsertConversation (_data) {
            stepsKeys.forEach((step) => {
                if (_data.status !== step) {
                    groupConversations?.[step]?.remove(_data.id);
                }
            });

            let order: "first" | "last" | undefined = undefined;
            let reInsert: boolean | undefined = undefined;

            if (_data.status !== "pending") {
                order = "first";
                reInsert = true;
            }

            groupConversations?.[_data.status]?.upSert(_data, { order, reInsert });
        },

        closeConversationByAttendant ({ id, status }) {
            groupConversations?.[status]?.remove(id);
        }
    });

    const conversationTableModals = ref<ConversationTableModals>();
</script>