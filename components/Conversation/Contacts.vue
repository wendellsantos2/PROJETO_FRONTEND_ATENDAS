<template>
    <div
        ref="element"
        class="flex grow flex-col"
    >
        <div class="relative z-10 flex flex-row items-center gap-3 px-4 sm:px-6">
            <img
                v-if="$user.value?.name"
                :src="$user.value?.avatar_url"
                :alt="$user.value?.name"
                class="size-20 rounded-full bg-background-100 object-cover object-center"
            >
            <div class="grow">
                <p class="line-clamp-2 font-semibold">
                    {{ $user.value?.name }}
                </p>
                <span class="text-sm font-medium opacity-60">
                    {{ $user.value?.role.display_name }}
                </span>
            </div>
            <Button
                v-if="useCheckPermissions('create_message')"
                v-tooltip="'Enviar nova mensagem'"
                size="sm"
                color="background"
                class="flex-none p-2"
                @click="conversationNewMessage?.toggle()"
            >
                <Icon name="email" />
            </Button>
        </div>
        <Vueform
            v-model="filters"
            class="m-6 !mb-0"
            :endpoint="false"
            sync
        >
            <TextElement
                name="search"
                inputType="search"
                placeholder="Procure por contatos"
            >
                <template #addon-after>
                    <Icon name="filter" />
                </template>
            </TextElement>
        </Vueform>

        <div class="relative grow">
            <InfiniteList
                ref="infiniteList"
                v-slot="{ item: conversation, last }"
                request="v1/conversations"
                :opts="{
                    fetch: {
                        params: {
                            'include': 'tags,contact,attendant',
                            'filter[attendant_id]': $user.value?.id,
                            'filter[status]': 'started'
                        }
                    }
                }"
                :transform="(it) => {
                    if (it?.lastMessage?.content) {
                        it.lastMessage.content = useClearFormat(it.lastMessage.content);
                    }

                    return it;
                }"
                textEmpty="Parece que você ainda não tem conversas :/"
                :textEnd="false"
                class="absolute inset-0 px-4 py-6 sm:px-6"
            >
                <ConversationContact
                    :conversation
                    class="hover:bg-background-100"
                    :class="{
                        '!border-none': last,
                        '!bg-soft': talkingId === conversation.id
                    }"
                    @click="() => {
                        talkingId === conversation.id ? reset() : talkingId = conversation.id
                        conversation.unreadMessages = 0
                    }"
                />
            </InfiniteList>
        </div>

        <LazyConversationNewMessage
            ref="conversationNewMessage"
        />
    </div>
</template>

<script setup lang="ts">
    import type { ConversationNewMessage, InfiniteList } from "#components";
    import type { ComponentExposed } from "~/types";

    const {
        $user
    } = useNuxtApp();

    const {
        talkingId
    } = storeToRefs(useConversationStore());

    const {
        reset
    } = useConversationStore();

    const filters = ref<{ search?: string }>({});
    const infiniteList = ref<ComponentExposed<typeof InfiniteList<"v1/conversations">>>();

    onMounted(() => {
        watch(filters, ({ search }) => {
            infiniteList.value!.filters.search = search;
        }, {
            deep: true
        });
    });

    const sound = useSound("notification");

    const notification = useWebNotification({
        lang: "PT",
        title: "Nova mensagem",
        tag: "chat",
        silent: true,
        renotify: true
    });

    usePusher({
        name: "private-users.{id}",
        id: $user.value?.id ?? 0
    }, {
        upsertConversation (_data) {
            if (_data.status !== "started") {
                return;
            }

            infiniteList.value?.upSert(_data, { order: "first", reInsert: true });

            if (_data.id !== talkingId.value) {
                sound?.play();

                if (document?.hidden) {
                    notification.show({
                        title: useResumeString(_data.contact.name, 35),
                        body: useResumeString(_data.lastMessage.content, 35),
                        icon: _data.contact.avatar_url
                    });
                }
            }
        },

        closedConversation (_data) {
            dropConversation(_data.id, "Essa conversa foi encerrada");
        },

        closeConversationByAttendant (_data) {
            dropConversation(_data.id, "Você não é mais o atendente da conversa");
        }
    });

    const dropConversation = (id: number, msg: string) => {
        infiniteList.value?.remove(id);

        if (id === talkingId.value) {
            useBusError().emit(msg);
            reset();
        }
    };

    const conversationNewMessage = ref<InstanceType<typeof ConversationNewMessage>>();
    const element = ref<HTMLElement>();

    defineExpose({
        element
    });
</script>