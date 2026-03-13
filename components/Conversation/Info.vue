<template>
    <div class="relative">
        <TransitionOpacity mode="out-in">
            <div
                v-if="conversation"
                :key="conversation?.id"
                class="mask-transparent-border absolute inset-0 flex flex-col gap-6 overflow-auto p-6 pb-12"
            >
                <div class="flex flex-col items-center gap-4">
                    <img
                        :src="conversation?.contact.avatar_url"
                        :alt="conversation?.contact.name"
                        class="size-36 rounded-full object-cover object-center"
                    >
                    <h5 class="text-center font-medium">
                        {{ conversation?.contact.name }}
                        <Button
                            v-if="useCheckPermissions('update_contact')"
                            v-tooltip="'Editar contato'"
                            :href="`/contatos/${conversation?.contact.id}`"
                            size="sm"
                        >
                            <Icon name="edit" />
                        </Button>
                    </h5>
                    <p v-if="conversation?.contact?.phone" class="-mt-4 opacity-50">
                        {{ conversation?.contact.phone }}
                    </p>
                    <ul class="flex flex-row flex-wrap items-center justify-center gap-4">
                        <li
                            v-for="(value) in useKeys(conversation?.contact.services)"
                            :key="value"
                            class="flex rounded-full bg-background-200 p-3"
                        >
                            <Icon :name="useProviderIcon('message', value)" size="1.5rem" />
                        </li>
                    </ul>
                </div>
                <div class="grid gap-6 xs:grid-cols-2 md:grid-cols-1">
                    <ConversationTags
                        :conversationId="conversation?.id!"
                        :tags="conversation?.tags!"
                        autoSave
                        class="col-span-full"
                    />
                    <Button
                        v-if="useCheckPermissions('change_attendant')"
                        class="xs:col-span-full sm:col-span-2 md:col-span-1"
                        @click="changeAttendant?.toggle(true, { id: conversation?.id!, attendant: conversation?.attendant?.id, form: { attendant_id: conversation?.attendant?.id } })"
                    >
                        <Icon name="support" />
                        Alterar atendente
                    </Button>
                    <Button
                        v-if="useCheckPermissions('provider:crm')"
                        color="warn"
                        class="xs:col-span-full sm:col-span-2 md:col-span-1"
                        @click="funnel?.toggle(true, { id: conversation?.contact.id!, funnel_id: conversation?.contact.funnel?.id, stage_id: conversation?.contact.stage?.id, form: {} })"
                    >
                        <Icon name="filter" />
                        {{ conversation?.contact.funnel ? "Alterar" : "Atribuir" }} funil/etapa
                    </Button>
                    <Button color="secondary" @click="reset">
                        <Icon name="minimize" />
                        Fechar
                    </Button>
                    <Button
                        v-if="useCheckPermissions('close_conversation')"
                        color="danger"
                        @click="modalClose?.toggle(true, { id: conversation?.id!, contact: conversation?.contact?.name! })"
                    >
                        <Icon name="chatClose" />
                        Encerrar
                    </Button>
                </div>
            </div>
        </TransitionOpacity>

        <LazyConversationChangeAttendant
            ref="changeAttendant"
            @then="reset"
        />

        <LazyCRMFunnel
            ref="funnel"
            @then="conversation!.contact = $event"
        />

        <LazyConversationClose
            ref="modalClose"
            @then="reset"
        />
    </div>
</template>

<script setup lang="ts">
    const {
        conversation
    } = storeToRefs(useConversationStore());

    const {
        reset
    } = useConversationStore();

    const changeAttendant = useTemplateRef("changeAttendant");
    const funnel = useTemplateRef("funnel");
    const modalClose = useTemplateRef("modalClose");
</script>