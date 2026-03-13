<template>
    <div class="flex size-full grow flex-col overflow-hidden">
        <div class="relative grow">
            <InfiniteList
                ref="infiniteList"
                :request
                :opts="{
                    fetch: {
                        params: {
                            conversation_id: props.chat.id
                        },
                        onResponseError: undefined
                    }
                }"
                :cache="false"
                :transform
                class="absolute inset-0 z-0 flex-col-reverse p-4 [--size:1rem]"
                classList="flex-col-reverse gap-6"
            >
                <template #default="{ index, item, next }">
                    <li
                        :id="item.elementId"
                        class="group flex w-fit flex-row items-center gap-2 text-left"
                        :class="{ 'right-0 ml-auto': item.is_inbound }"
                    >
                        <Button
                            v-tooltip="'Responder'"
                            color="secondary"
                            variant="transparent"
                            size="sm"
                            class="text-current opacity-20 group-hover:opacity-100"
                            :class="{ 'order-2': !item.is_inbound }"
                            @click="chatInput?.reply(useOmit(item, 'sender'))"
                        >
                            <Icon name="reply" />
                        </Button>
                        <Icon
                            :name="item.is_inbound ? 'teenyicons:right-solid' : 'teenyicons:left-solid'"
                            size="1.5rem"
                            class="top-4 mb-auto mt-3.5 drop-shadow-sm"
                            :class="item.is_inbound ? 'text-soft order-2 -ml-4' : 'text-background-100 -mr-4'"
                        />
                        <div
                            class="flex w-fit min-w-44 max-w-md flex-col rounded-2xl p-2 shadow"
                            :class="item.is_inbound ? '!bg-soft' : 'bg-background-100'"
                        >
                            <LazyChatReply
                                v-if="item.reply_to"
                                :replyTo="useOmit(item.reply_to, 'sender')"
                                direct
                                class="rounded-2xl"
                                :class="item.is_inbound ? 'bg-background-100' : 'bg-soft'"
                            />
                            <div class="flex flex-col gap-3 p-2">
                                <ViewMedia
                                    v-if="item.media"
                                    :src="item.media.link"
                                    :type="item.type"
                                    class="w-full bg-background-100 text-contrast"
                                />
                                <ChatMessage :content="item.content" />
                            </div>
                            <div
                                class="ml-auto flex flex-row items-center gap-1 text-xs"
                            >
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
                            </div>
                        </div>
                    </li>

                    <LazyChatDateBar
                        :id="item.id"
                        :index
                        :date="item.created_at"
                        :nextDate="next?.created_at"
                        class="bg-background"
                    />
                </template>
            </InfiniteList>
        </div>

        <ChatInput
            ref="chatInput"
            :sender
            :upload="{
                route: `webchat/${props.to}/upload`,
                delet: false
            }"
            min
            addClass="bg-background-100"
        />
    </div>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";
    import type { ChatInput, InfiniteList } from "#components";
    import type { ComponentExposed } from "~/types";
    import type { SenderParams } from "../Chat/input.vue";

    type Webchat = InternalApi["webchat/:to/init"]["post"]["data"];

    const props = defineProps<{
        chat: Webchat
        to: string
    }>();

    const request = `webchat/${props.to}/messages` as const;

    type MessagesList = ComponentExposed<typeof InfiniteList<typeof request>>;
    type ItemUpSert = Parameters<NonNullable<MessagesList>["upSert"]>[0];

    const emits = defineEmits<{
        newMessage: []
        updateConversation: [Webchat]
        closedConversation: []
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
        createdHours: item.created_at ? useDateFormat(item.created_at, "HH:mm").value : undefined
    });

    const sound = useSound("send");

    const upSert = (item: ItemUpSert) => {
        const IsNew = !infiniteList.value?.has(item.id);
        const inserted = infiniteList.value?.upSert(item, { order: "first" });

        if (IsNew && inserted) {
            sound?.play();
            emits("newMessage");
        }
    };

    const sender = async ({ content, upload_id, type, reply_to }: SenderParams) => {
        const { data } = await useFetchApi(request, {
            method: "POST",
            body: {
                conversation_id: props.chat.id,
                recipient: props.chat.lastMessage.recipient,
                content,
                upload_id,
                reply_to,
                type: type || "text"
            },
            onResponse: undefined,
            onResponseError: undefined
        });

        upSert(data);
        await nextTick();
        infiniteList.value?.container?.scrollTo({ top: 0 });
    };

    usePusher({
        name: `webchat-${props.to}.{id}` as "webchat-{to}.{id}",
        id: props.chat.id
    }, {
        upsertMessage: upSert,
        updateConversation: data => emits("updateConversation", data),
        closedConversation: () => emits("closedConversation")
    });

    const chatInput = ref<ComponentExposed<typeof ChatInput>>();
</script>