<template>
    <section class="flex size-full grow flex-row justify-end overflow-hidden">
        <ConversationContacts class="w-dvw flex-none pt-6 sm:max-w-80 lg:pt-0" />

        <div
            class="flex h-full w-dvw flex-none flex-col transition-all duration-500 sm:grow xl:w-0"
            :class="[
                talkingId ? 'sm:w-dvw' : 'mr-[-100dvw] sm:mr-0 sm:w-0',
                infoOpen ? 'lg:w-full' : 'lg:w-0'
            ]"
        >
            <LazyConversationHeader />
            <div class="flex size-full flex-row justify-end overflow-hidden lg:grow">
                <div
                    class="flex w-full flex-none flex-col overflow-hidden rounded-3xl bg-background-100 transition-all duration-500 max-xl:rounded-b-none md:w-auto md:grow"
                    :class="infoOpen ? 'xl:mb-6' : 'lg:rounded-r-none'"
                >
                    <TransitionOpacity mode="out-in">
                        <div v-if="!talkingId" class="flex grow flex-col items-center justify-center gap-4 p-4 text-center sm:p-6">
                            <Icon name="logo" size="10rem" class="opacity-15" />
                            <p>
                                Selecione um contato para iniciar a conversa
                            </p>
                        </div>
                        <div v-else class="flex grow flex-col">
                            <div class="relative grow">
                                <LazyConversationChat
                                    ref="conversationChat"
                                    :talkingId
                                    @lastMessage="(message) => {
                                        if (conversation) {
                                            conversation.lastMessage = message
                                        }
                                    }"
                                    @reply="chatInput?.reply(useOmit($event, 'sender'))"
                                />
                            </div>
                            <LazyChatInput
                                ref="chatInput"
                                :watchReset="talkingId"
                                :sender
                                selectTemplate
                            >
                                <TransitionHeight>
                                    <p
                                        v-if="conversation && conversation.lastMessage.service.includes('whatsapp') && conversation.contact.services.whatsapp !== conversation.lastMessage.recipient"
                                        class="z-10 -mb-6 rounded-t-[--rounded] bg-background bg-gradient-to-t from-warn/20 to-warn/20 px-6 pb-8 pt-2 font-medium text-warn"
                                    >
                                        Cuidado! você vai enviar mensagem para: <strong class="text-danger">{{ conversation.lastMessage.recipient }}</strong> e não para <strong>{{ conversation.contact.services.whatsapp }}</strong> registrado no contato
                                    </p>
                                </TransitionHeight>
                            </LazyChatInput>
                        </div>
                    </TransitionOpacity>
                </div>
                <LazyConversationInfo
                    class="w-full flex-none transition-all duration-500 md:w-80"
                    :class="{ 'mr-[-100%] md:-mr-80': !infoOpen }"
                />
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
    import type { ConversationChat, ChatInput, ConversationContacts } from "#components";
    import type { SenderParams } from "~/components/Chat/input.vue";
    import type { ComponentExposed } from "~/types";

    definePageMeta({
        navOrder: 10,
        icon: "MessagesMenuIcon"
    });

    const {
        talkingId,
        conversation,
        infoOpen
    } = storeToRefs(useConversationStore());

    const route = useRoute();
    const queryId = Number(route.query.id);

    if (queryId) {
        talkingId.value = queryId;
    }

    const {
        reset
    } = useConversationStore();

    const conversationChat = ref<InstanceType<typeof ConversationChat>>();
    const chatInput = ref<ComponentExposed<typeof ChatInput>>();

    const sender = async ({ content, type, upload_id, reply_to }: SenderParams) => {
        const { data } = await useFetchApi("v1/messages", {
            method: "POST",
            body: {
                conversation_id: conversation.value?.id,
                sender: conversation.value?.lastMessage.sender,
                recipient: conversation.value?.lastMessage.recipient,
                service: conversation.value?.lastMessage.service,
                type: type || "text",
                content,
                upload_id,
                reply_to
            },
            onResponse () {}
        });

        conversationChat.value?.upSert(data);
        conversationChat.value?.viewLast();
    };

    onUnmounted(() => {
        reset();
    });
</script>