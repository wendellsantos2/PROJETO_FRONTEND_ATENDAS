<template>
    <LazyConversationWatch
        ref="modalWatch"
        @editTags="modalTags?.toggle(true, $event)"
        @botAction="botAction?.toggle(true, { ...$event, form: {} })"
        @reopenConversation="modalReopen?.toggle(true, $event)"
        @closeConversation="modalClose?.toggle(true, $event)"
        @changeAttendant="changeAttendant?.toggle(true, { ...$event, form: { attendant_id: $event?.attendant } })"
    />

    <LazyModal
        v-if="useCheckPermissions('assign_tag')"
        v-slot="{ toggle, context }"
        ref="modalTags"
        title="Etiquetas"
        size="xs"
        :contextInitial="{
            id: 0,
            tags: []
        }"
    >
        <ConversationTags
            :conversationId="context.id"
            :tags="context.tags"
            @then="() => {
                toggle(false);
                modalWatch?.refresh();
            }"
        />
    </LazyModal>

    <LazyConversationBotAction
        v-if="useCheckPermissions('update_conversation')"
        ref="botAction"
        @then="modalWatch?.refresh()"
    />

    <LazyConversationChangeAttendant
        v-if="useCheckPermissions('change_attendant')"
        ref="changeAttendant"
        @then="modalWatch?.refresh()"
    />

    <LazyModalConfirm
        v-if="useCheckPermissions('update_conversation')"
        ref="modalReopen"
        title="reabrir"
        complement="a conversa #{id} com {contact}"
        :button="{ color: 'warn' }"
        :contextInitial="{ id: 0 }"
        :action="async ({ id }) => await update(id, { action: 'reopen' })"
        @then="modalWatch?.refresh()"
    />

    <LazyConversationClose
        v-if="useCheckPermissions('close_conversation')"
        ref="modalClose"
        @then="modalWatch?.refresh()"
    />
</template>

<script lang="ts" setup>
    import type { ConversationBotAction, ConversationChangeAttendant, ConversationClose, ConversationWatch } from "#components";
    import type { ComponentExposed } from "~/types";

    const modalWatch = ref<ComponentExposed<typeof ConversationWatch>>();
    const modalTags = useModal();
    const changeAttendant = ref<ComponentExposed<typeof ConversationChangeAttendant>>();
    const botAction = ref<ComponentExposed<typeof ConversationBotAction>>();
    const modalReopen = useModalConfirm();
    const modalClose = ref<ComponentExposed<typeof ConversationClose>>();

    const update = async (id: number, body: Record<string, unknown>) => {
        await useFetchApi(`v1/conversations/${id}`, {
            method: "PUT",
            body
        });
    };

    defineExpose({
        modalWatch,
        modalTags,
        changeAttendant,
        botAction,
        modalReopen,
        modalClose
    });
</script>