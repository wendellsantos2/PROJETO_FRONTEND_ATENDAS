<template>
    <VMenu
        placement="right-start"
        :skidding="-10"
        class="ml-auto"
        @show="() => fetchConversation()"
    >
        <slot v-if="$slots.default" />
        <Button
            v-else
            size="sm"
            color="contrast"
        >
            <Icon name="menu" size="1.2rem" />
        </Button>
        <template #popper>
            <ul
                v-close-popper
                class="flex flex-col divide-y divide-background/20 *:flex *:cursor-pointer *:flex-row *:items-center *:gap-2 *:p-3 *:transition-all *:duration-300"
            >
                <template v-if="typeof data !== 'number' && !pending">
                    <li
                        v-if="data?.status === 'closed'"
                        class="!cursor-default bg-background/20"
                    >
                        <img
                            v-if="data?.attendant_type === 'user'"
                            :src="data?.attendant?.avatar_url"
                            class="size-10 rounded-full outline outline-2"
                            :style="`outline-color: ${data?.attendant?.role?.color}`"
                        >
                        <Icon v-else name="bot" size="2.5rem" />
                        <span class="text-sm font-medium">
                            <span class="text-xs">
                                Atendido por: <br>
                            </span>
                            {{ data?.attendant?.name }}
                        </span>
                    </li>
                    <li
                        v-else-if="useCheckPermissions('change_attendant')"
                        class="hover:bg-background/20 hover:text-background"
                        @click="conversationTableModals?.changeAttendant?.toggle(true, { id: data?.id, attendant: data?.attendant?.id, form: { attendant_id: data?.attendant?.id } })"
                    >
                        <template v-if="data?.attendant_type !== 'bot'">
                            <img
                                :src="data?.attendant?.avatar_url"
                                class="size-5 rounded-full border-2"
                                :style="`border-color: ${data?.attendant?.role?.color}`"
                            >
                            {{ data?.attendant?.name }}
                            <Icon name="change" />
                        </template>
                        <template v-else>
                            <Icon name="support" />
                            Atribuir atendente
                        </template>
                    </li>
                    <li
                        v-if="useCheckPermissions('read_conversation')"
                        class="hover:bg-blue-600/30 hover:text-blue-50 dark:hover:bg-blue-600/20 dark:hover:text-blue-800"
                        @click="conversationTableModals?.modalWatch?.toggle(true, { id: data?.id, conversation: data })"
                    >
                        <Icon name="eye" />
                        Assistir
                    </li>
                    <li
                        v-if="useCheckPermissions('assign_tag')"
                        class="hover:bg-orange-600/20 hover:text-orange-100 dark:hover:bg-orange-600/20 dark:hover:text-orange-800"
                        @click="conversationTableModals?.modalTags?.toggle(true, { id: data?.id, tags: data?.tags })"
                    >
                        <Icon name="tag" />
                        Etiquetas
                    </li>
                    <li
                        v-if="useCheckPermissions('update_contact')"
                        class="hover:bg-emerald-500/20 hover:text-emerald-500"
                        @click="navigateTo(`/contatos/${data?.contact.id}`)"
                    >
                        <Icon name="userEdit" />
                        Editar contato
                    </li>
                    <li
                        v-if="useCheckPermissions('update_conversation')"
                        class="hover:bg-indigo-600/40 hover:text-indigo-100 dark:hover:bg-indigo-600/20 dark:hover:text-indigo-800"
                        @click="conversationTableModals?.botAction?.toggle(true, { id: data?.id, form: {} })"
                    >
                        <Icon name="bot" />
                        Ações do bot
                    </li>
                    <li
                        v-if="useCheckPermissions('update_conversation') && data?.status === 'closed'"
                        class="hover:bg-yellow-600/20 hover:text-yellow-100 dark:hover:bg-yellow-600/20 dark:hover:text-yellow-800"
                        @click="conversationTableModals?.modalReopen?.toggle(true, { id: data?.id, contact: data?.contact?.name! })"
                    >
                        <Icon name="back" />
                        Reabrir
                    </li>
                    <li
                        v-else-if="useCheckPermissions('close_conversation')"
                        class="hover:bg-red-600/20 hover:text-red-100 dark:hover:bg-red-600/20 dark:hover:text-red-800"
                        @click="conversationTableModals?.modalClose?.toggle(true, { id: data?.id!, contact: data?.contact?.name! })"
                    >
                        <Icon name="chatClose" />
                        Encerrar
                    </li>
                </template>
                <li v-else>
                    Carregando...
                </li>
            </ul>
        </template>
    </VMenu>
</template>

<script lang="ts" setup>
    import type { InternalApi } from "nitropack/types";
    import type { ConversationChangeAttendant, ConversationClose, ConversationWatch, Modal, ModalConfirm, ConversationBotAction } from "#components";
    import type { ComponentExposed } from "~/types";

    export interface ConversationTableModals {
        modalWatch: ComponentExposed<typeof ConversationWatch>
        modalTags: ComponentExposed<typeof Modal>
        changeAttendant: ComponentExposed<typeof ConversationChangeAttendant>
        botAction: ComponentExposed<typeof ConversationBotAction>
        modalReopen: ComponentExposed<typeof ModalConfirm>
        modalClose: ComponentExposed<typeof ConversationClose>
    }

    interface Props {
        conversation: InternalApi["v1/conversations/:id"]["get"]["data"] | number
        conversationTableModals?: ConversationTableModals
    }

    const props = defineProps<Props>();
    const data = ref<InternalApi["v1/conversations/:id"]["get"]["data"] | number>(props.conversation);
    const pending = ref(false);

    const fetchConversation = async () => {
        if (typeof data.value !== "number") {
            return;
        }
        pending.value = true;
        const { data: _data } = await useFetchApi(`v1/conversations/${props.conversation}`);
        data.value = _data;
        pending.value = false;
    };
</script>