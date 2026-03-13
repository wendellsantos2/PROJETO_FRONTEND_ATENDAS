<template>
    <TransitionTranslateY>
        <InfiniteList
            ref="infiniteList"
            :key="props.talkingId"
            :request
            :opts="{
                fetch: {
                    params: {
                        'include': 'media',
                        'filter[conversation_id]': props.talkingId
                    }
                }
            }"
            :cache="false"
            :transform
            class="absolute inset-0 z-0 flex-col-reverse px-4 py-6 lg:px-6"
            classList="flex-col-reverse gap-6"
        >
            <template #default="{ index, item, next }">
                <li
                    :id="item.elementId"
                    class="group flex w-fit flex-row items-center gap-2"
                    :class="{ 'right-0 ml-auto': !item.is_inbound }"
                >
                    <Button
                        v-if="!props.noInteraction"
                        v-tooltip="'Responder'"
                        color="secondary"
                        variant="transparent"
                        size="sm"
                        class="text-current opacity-20 group-hover:opacity-100"
                        :class="{ 'order-2': item.is_inbound }"
                        @click="emits('reply', item)"
                    >
                        <Icon name="reply" />
                    </Button>
                    <Icon
                        :name="!item.is_inbound ? 'teenyicons:right-solid' : 'teenyicons:left-solid'"
                        size="1.5rem"
                        class="top-4 mb-auto mt-3.5 drop-shadow-sm"
                        :class="!item.is_inbound ? 'text-soft order-2 -ml-4' : 'text-background -mr-4'"
                    />
                    <div
                        class="flex w-fit min-w-44 max-w-md flex-col rounded-2xl p-2 shadow"
                        :class="!item.is_inbound ? '!bg-soft' : 'bg-background'"
                    >
                        <LazyChatReply
                            v-if="item.reply_to"
                            :replyTo="useOmit(item.reply_to, 'sender')"
                            direct
                            class="rounded-2xl"
                            :class="!item.is_inbound ? 'bg-background' : 'bg-soft'"
                        />
                        <div class="flex flex-col gap-3 p-2">
                            <ViewMedia
                                v-if="item.media"
                                :src="item.media.link"
                                :type="item.type"
                                class="w-full min-w-72 bg-background-100 text-contrast"
                            />
                            <ChatMessage :content="item.content" />
                        </div>
                        <div
                            class="ml-auto flex flex-row items-center gap-1 text-xs"
                        >
                            <Button
                                v-tooltip="'Ver detalhes da mensagem'"
                                size="sm"
                                variant="transparent"
                                class="!rounded-full"
                                @click="conversationMessageInfo?.toggle(true, { id: item.id })"
                            >
                                <Icon :name="useProviderIcon('message', item.service)" />
                            </Button>
                            <span>
                                {{ item.createdHours }}
                            </span>
                            <TransitionOpacity mode="out-in">
                                <Icon
                                    v-if="item.statusDefine"
                                    :name="item.statusDefine.icon"
                                    :class="item.statusDefine.class"
                                    size="1rem"
                                />
                            </TransitionOpacity>
                            <TransitionOpacity mode="out-in">
                                <Button
                                    v-if="!props.noInteraction"
                                    v-show="item.resend"
                                    v-tooltip="'Reenviar'"
                                    size="sm"
                                    color="success"
                                    class="!rounded-full"
                                    :action="async () => await useFetchApi(`v1/messages/${item.id}/resend`, {
                                        method: 'POST'
                                    })"
                                >
                                    <Icon name="send" size="0.8rem" />
                                </Button>
                            </TransitionOpacity>
                        </div>
                    </div>
                </li>

                <LazyChatDateBar
                    :id="item.id"
                    :index
                    :date="item.created_at"
                    :nextDate="next?.created_at"
                    class="bg-background-100"
                />
            </template>

            <template #containerAfter>
                <LazyConversationMessageInfo ref="conversationMessageInfo" />
            </template>
        </InfiniteList>
    </TransitionTranslateY>
</template>

<script setup lang="ts">
    import type { ConversationMessageInfo, InfiniteList } from "#components";
    import type { ComponentExposed } from "~/types";

    const props = defineProps<{
        talkingId: number
        noInteraction?: boolean
    }>();

    const request = "v1/messages" as const;

    type MessagesList = ComponentExposed<typeof InfiniteList<typeof request>>;
    type ItemUpSert = Parameters<NonNullable<MessagesList>["upSert"]>[0];
    type ItemGet = ReturnType<NonNullable<MessagesList>["get"]>;

    const emits = defineEmits<{
        reply: [message: ItemGet]
        lastMessage: [message: ItemGet]
    }>();

    const infiniteList = ref<MessagesList>();

    const statusDefine = {
        created: {
            icon: "uploading",
            class: "text-primary"
        },
        submitted: {
            icon: "uploading",
            class: "text-primary"
        },
        delivered: {
            icon: "check",
            class: ""
        },
        rejected: {
            icon: "attention",
            class: "text-warn"
        },
        undeliverable: {
            icon: "error",
            class: "text-danger"
        },
        read: {
            icon: "doubleCheck",
            class: "text-success"
        }
    };

    const transform = (item: ItemUpSert) => ({
        ...item,
        elementId: `message-${item.id}`,
        statusDefine: item?.status ? statusDefine[item.status] : undefined,
        resend: item?.status ? !["delivered", "submitted", "read"].includes(item?.status) : undefined,
        createdHours: item.created_at ? useDateFormat(item.created_at, "HH:mm").value : undefined
    });

    const sound = useSound("send");

    const upSert = (item: ItemUpSert) => {
        const IsNew = !infiniteList.value?.has(item.id);
        const inserted = infiniteList.value?.upSert(item, { order: "first" });

        if (IsNew && inserted) {
            sound?.play();
            emits("lastMessage", inserted);
        }
    };

    usePusher({
        name: "private-conversations.{id}",
        id: () => props.talkingId
    }, {
        upsertMessage: upSert
    });

    defineExpose({
        upSert,
        viewLast: async () => {
            await nextTick();
            infiniteList.value?.container?.scrollTo({ top: 0 });
        }
    });

    const conversationMessageInfo = ref<InstanceType<typeof ConversationMessageInfo>>();
</script>