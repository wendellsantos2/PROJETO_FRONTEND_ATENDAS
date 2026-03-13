<template>
    <div class="flex grow flex-col">
        <div class="relative grow">
            <TransitionTranslateX>
                <InfiniteList
                    v-if="talkingId"
                    ref="infiniteList"
                    :key="talkingId"
                    :request
                    :cache="false"
                    :transform
                    class="absolute inset-0 z-0 flex-col-reverse px-4 py-6"
                    :class="{ 'lg:px-6': !props.min }"
                    classList="flex-col-reverse gap-6"
                >
                    <template #default="{ index, item, next }">
                        <li
                            :id="item.elementId"
                            :key="item.id"
                            class="group z-0 flex w-fit flex-row gap-2"
                            :class="{
                                'ml-auto': item.isCurrentUser,
                                'pl-14': !isFirstOfSequence(item, next) && !conversation?.direct_message && !props.min
                            }"
                        >
                            <img
                                v-if="isFirstOfSequence(item, next) && !item.isCurrentUser && !conversation?.direct_message && !props.min"
                                :src="item.sender.avatar_url"
                                :alt="item.sender.name"
                                class="size-12 rounded-full border-2 bg-background object-cover object-center"
                                :style="`border-color: ${item.sender.role?.color}`"
                            >
                            <div class="flex flex-col gap-1">
                                <div
                                    v-if="isFirstOfSequence(item, next) && !item.isCurrentUser && !conversation?.direct_message"
                                    class=" flex flex-row gap-1"
                                    :class="{ 'ml-5': !props.min }"
                                >
                                    <img
                                        v-if="props.min"
                                        :src="item.sender.avatar_url"
                                        :alt="item.sender.name"
                                        class="size-5 rounded-full border bg-background object-cover object-center"
                                        :style="`border-color: ${item.sender.role?.color}`"
                                    >
                                    <span class="text-sm font-medium">
                                        {{ item.sender.name }}
                                    </span>
                                </div>
                                <div class="flex flex-row items-center gap-2">
                                    <Button
                                        v-tooltip="'Responder'"
                                        color="secondary"
                                        variant="transparent"
                                        size="sm"
                                        class="text-current opacity-20 group-hover:opacity-100"
                                        :class="{ 'order-2': !item.isCurrentUser }"
                                        @click="chatInput?.reply(item)"
                                    >
                                        <Icon name="reply" />
                                    </Button>
                                    <div
                                        class="flex w-fit min-w-44 max-w-md flex-col gap-2 rounded-[2.5rem] p-4 shadow"
                                        :class="item.isCurrentUser ? '!bg-primary text-white !rounded-br-none' : 'bg-background-100 !rounded-bl-none'"
                                    >
                                        <LazyChatReply
                                            v-if="item.reply_to"
                                            :replyTo="item.reply_to"
                                            :direct="conversation?.direct_message"
                                            class="rounded-3xl border border-[--color] text-contrast"
                                            :class="item.isCurrentUser ? '!rounded-br-none' : '!rounded-bl-none'"
                                            :style="[
                                                `--color: ${item.reply_to.sender?.role?.color || _tertiary}`,
                                                useBacklightStyle('var(--color)')
                                            ]"
                                        />
                                        <ViewMedia
                                            v-if="item.media"
                                            :src="item.media.link"
                                            :type="item.type"
                                            class="w-full min-w-72 bg-background-100 text-contrast"
                                        />
                                        <ChatMessage :content="item.content" />
                                    </div>
                                </div>
                                <span
                                    class="text-xs"
                                    :class="{ 'ml-auto': item.isCurrentUser }"
                                >
                                    {{ item.createdHours }}
                                </span>
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
            </TransitionTranslateX>
        </div>

        <ChatInput
            ref="chatInput"
            :sender
            :watchReset="talkingId"
            :min="props.min"
            addClass="bg-background-100"
        />
    </div>
</template>

<script setup lang="ts">
    import type { SenderParams } from "../Chat/input.vue";
    import type { ComponentExposed } from "~/types";
    import type { ChatInput, InfiniteList } from "#components";
    import { _tertiary } from "#tailwind-config/theme/colors";

    const props = defineProps<{
        min?: boolean
    }>();

    const request = computed(() => `v1/chats/${talkingId.value}/messages` as const);

    type MessagesList = ComponentExposed<typeof InfiniteList<typeof request.value>>;
    type ItemUpSert = Parameters<NonNullable<MessagesList>["upSert"]>[0];
    type ItemGet = ReturnType<NonNullable<MessagesList>["get"]>;

    const emits = defineEmits<{
        upSertChatMessage: [message: ItemGet]
    }>();

    const {
        talkingId,
        conversation
    } = storeToRefs(useMessagingStore());

    const infiniteList = ref<MessagesList>();
    const { $user } = useNuxtApp();

    const transform = (item: ItemUpSert) => ({
        ...item,
        elementId: `message-${item.id}`,
        isCurrentUser: item?.sender?.id ? item.sender.id === $user.value?.id : undefined,
        createdHours: item.created_at ? useDateFormat(item.created_at, "HH:mm").value : undefined
    });

    const isFirstOfSequence = (item: ItemGet, next?: ItemGet) => {
        return item.sender.id !== next?.sender.id || (new Date(item.created_at).toDateString() !== new Date(next.created_at).toDateString());
    };

    const sound = useSound("send-pop");

    const upSert = (item: ItemUpSert) => {
        const IsNew = !infiniteList.value?.has(item.id);
        const inserted = infiniteList.value?.upSert(item, { order: "first" });

        if (IsNew && inserted) {
            sound?.play();
            emits("upSertChatMessage", inserted);
        }
    };

    const sender = async ({ content, upload_id, type, reply_to }: SenderParams) => {
        const { data } = await useFetchApi(`v1/chats/${talkingId.value}/messages`, {
            method: "POST",
            body: {
                content,
                upload_id,
                reply_to,
                type: type || "text"
            },
            onResponse () {}
        });

        upSert(data);
        await nextTick();
        infiniteList.value?.container?.scrollTo({ top: 0 });
    };

    usePusher({
        name: "private-chats.{id}",
        id: talkingId
    }, {
        upsertChatMessage: upSert
    }, {
        key: "internal_chat_conversation",
        autoUnsubscribe: () => {
            const layout = useRouter().currentRoute.value.meta.layout;
            return !(typeof layout === "undefined" || layout === "default");
        }
    });

    const chatInput = ref<ComponentExposed<typeof ChatInput>>();
</script>