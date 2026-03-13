<template>
    <div class="flex grow flex-col overflow-hidden bg-background-100">
        <div class="relative grow">
            <InfiniteList
                ref="infiniteList"
                :request
                :transform
                class="absolute inset-0 z-0 flex-col-reverse p-6"
                classList="flex-col-reverse gap-6"
            >
                <template #default="{ index, item, next }">
                    <li
                        class="flex flex-col gap-1"
                        :class="{
                            'ml-auto': item.isInbound
                        }"
                    >
                        <div
                            class="flex w-fit min-w-44 max-w-md flex-col gap-2 rounded-[2.5rem] p-4 shadow"
                            :class="item.isInbound ? '!bg-primary text-white !rounded-br-none' : 'bg-background !rounded-bl-none'"
                        >
                            <ViewMedia
                                v-for="(media) in item.media"
                                :key="media?.id"
                                :src="media?.link"
                                class="w-full min-w-72 bg-background-100 text-contrast"
                            />
                            <ChatMessage :content="item.content" />
                        </div>
                        <span
                            class="text-xs"
                            :class="{ 'ml-auto': item.isInbound }"
                        >
                            {{ item.createdHours }}
                        </span>
                    </li>

                    <LazyChatDateBar
                        :id="item.id"
                        :index
                        :date="item.created_at"
                        :nextDate="next?.created_at"
                        class="bg-background-100"
                    />
                </template>
            </InfiniteList>
        </div>

        <p
            v-if="props.ticket.completed_at"
            class="p-4 text-center font-bold text-success"
        >
            Ticket concluído desde {{ useDate(props.ticket.completed_at) }}
        </p>
        <ChatInput
            v-else
            :sender
        />
    </div>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";
    import type { SenderParams } from "../Chat/input.vue";
    import type { ComponentExposed } from "~/types";
    import type { InfiniteList } from "#components";

    const props = defineProps<{
        ticket: InternalApi["v1/tickets/:id"]["get"]["data"]
    }>();

    const request = `v1/tickets/${props.ticket.id}/comments` as const;

    type CommentsList = ComponentExposed<typeof InfiniteList<typeof request>>;
    type ItemUpSert = Parameters<NonNullable<CommentsList>["upSert"]>[0];

    const infiniteList = ref<CommentsList>();
    const { $user } = useNuxtApp();

    const transform = (item: ItemUpSert) => ({
        ...item,
        isInbound: $user.value?.id === item?.user?.id,
        createdHours: useDateFormat(item.created_at, "HH:mm").value
    });

    const sound = useSound("send-comment");

    const upSert = (item: ItemUpSert) => {
        const soundPlay = !infiniteList.value?.has(item.id);

        infiniteList.value?.upSert(item, { order: "first" });

        if (soundPlay) {
            sound?.play();
        }
    };

    const sender = async ({ content, upload_id }: SenderParams) => {
        const { data } = await useFetchApi(`v1/tickets/${props.ticket.id}/comments`, {
            method: "POST",
            body: {
                content,
                upload_id
            },
            onResponse () {}
        });

        upSert(data);
        await nextTick();
        infiniteList.value?.container?.scrollTo({ top: 0 });
    };

    usePusher({
        name: "private-tickets.{id}",
        id: props.ticket.id
    }, {
        upsertComment (_data) {
            upSert(_data);
        }
    });
</script>