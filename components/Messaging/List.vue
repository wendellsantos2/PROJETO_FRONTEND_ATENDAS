<template>
    <div class="flex w-full grow flex-col">
        <div
            class="flex flex-row items-center gap-4 px-4"
            :class="{ 'pt-6 sm:px-6': !props.min }"
        >
            <Button
                v-tooltip="'Criar conversa'"
                variant="gradient"
                class="flex-none !p-3"
                @click="emits('create')"
            >
                <Icon name="plus" />
            </Button>

            <Vueform
                v-model="filters"
                :endpoint="false"
                sync
                class="grow"
                :removeClasses="{
                    FormElements: {
                        container: ['form-gap-x-gutter'],
                        container_sm: ['form-gap-x-gutter-sm'],
                        container_lg: ['form-gap-x-gutter-lg']
                    }
                }"
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
        </div>

        <div class="relative grow">
            <InfiniteList
                ref="infiniteList"
                v-slot="{ item }"
                request="v1/chats"
                :opts="{
                    preFilters: false
                }"
                :transform
                :textEnd="false"
                class="absolute inset-0 px-4 py-6"
                :class="{ 'sm:px-6': !props.min }"
                @extraResponse="unreadMessages = $event?.unread_messages"
            >
                <li
                    class="flex cursor-pointer flex-row items-center gap-3 rounded-2xl p-3 transition-all duration-300 user-select-none hover:bg-background-300"
                    :class="{ '!bg-soft shadow-sm': talkingId === item.id }"
                    @click="() => {
                        talkingId === item.id ? reset() : set(useOmit(item, ['participants']))
                    }"
                >
                    <div :class="props.min ? '*:size-12' : '*:size-16'">
                        <div
                            v-if="isArray(item.participants)"
                            class="grid grid-cols-2 gap-0.5 overflow-hidden rounded-full bg-contrast"
                        >
                            <img
                                v-for="(participant) in item.participants.slice(0, 3)"
                                :key="participant.id"
                                :src="participant.avatar_url"
                                :alt="participant.name"
                                class="size-full rounded object-cover object-center"
                            >
                            <span
                                v-if="item.participants.length > 3"
                                class="flex bg-contrast font-semibold text-primary"
                                :class="props.min ? 'text-xs p-0.5' : 'text-sm p-1'"
                            >
                                + {{ item.participants.length - 3 }}
                            </span>
                        </div>
                        <img
                            v-else
                            :src="item.participants?.avatar_url"
                            :alt="item.participants?.name"
                            class="rounded-full border-2 bg-background object-cover object-center"
                            :style="`border-color: ${item.participants?.role?.color}`"
                        >
                    </div>
                    <div class="flex grow flex-col gap-1">
                        <div class="flex flex-row items-center justify-between gap-4">
                            <div class="relative h-6 grow">
                                <h5
                                    v-tooltip="{
                                        content: item.name,
                                        disabled: String(item.name).length < 20
                                    }"
                                    class="absolute inset-0 truncate font-bold"
                                    :class="props.min ? 'text-base' : 'text-lg'"
                                >
                                    {{ useResumeString(item.name, 20) }}
                                </h5>
                            </div>
                            <span class="ml-auto text-sm leading-none">
                                {{ usePastTimeRef(item.last_message?.created_at ?? item.created_at, { short: true }) }}
                            </span>
                        </div>
                        <LazyChatLastMessage
                            v-if="item.last_message"
                            :isDirect="item.direct_message"
                            :content="item.last_message.content"
                            :type="item.last_message.type"
                            :user="item.last_message.sender"
                        >
                            <span v-show="item?.unread_messages" class="inline-flex min-w-[1.3125rem] flex-row items-center justify-center rounded-full bg-primary p-1 text-sm font-medium leading-none text-white shadow">
                                {{ item?.unread_messages }}
                            </span>
                        </LazyChatLastMessage>
                    </div>
                </li>
            </InfiniteList>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { InfiniteList } from "#components";
    import type { InternalApi } from "nitropack/types";
    import type { ComponentExposed } from "~/types";

    const props = defineProps<{
        min?: boolean
    }>();

    const emits = defineEmits<{
        create: []
    }>();

    const { $user } = useNuxtApp();

    const {
        talkingId,
        conversation
    } = storeToRefs(useMessagingStore());

    const {
        set,
        reset
    } = useMessagingStore();

    const unreadMessages = ref(0);
    const filters = ref<{ search?: string }>({});
    const infiniteList = ref<ComponentExposed<typeof InfiniteList<"v1/chats">>>();

    onMounted(() => {
        watch(filters, ({ search }) => {
            infiniteList.value!.filters.search = search;
        }, {
            deep: true
        });
    });

    const transform = (item: InternalApi["v1/chats/:id"]["get"]["data"]) => {
        const participants = item.direct_message ? item.participants?.find?.(({ id }) => id !== $user.value?.id) : item.participants;

        return {
            ...item,
            participants
        };
    };

    const sound = useSound("notification-incoming");
    const route = useRouter().currentRoute;

    usePusher({
        name: "private-users.{id}",
        id: $user.value?.id ?? 0
    }, {
        upsertChat (_data) {
            const get = infiniteList.value?.get(_data.id);
            const newMessage = _data?.last_message?.id !== get?.last_message?.id;

            if (
                _data.id !== talkingId.value
                && _data?.last_message
                && newMessage
            ) {
                _data.unread_messages = (get?.unread_messages ?? 0) + 1;
                unreadMessages.value++;
                sound?.play();
            }

            infiniteList.value?.upSert(_data, {
                order: "first",
                reInsert: (!_data?.last_message || newMessage)
            });
        }
    }, {
        key: "internal_chat",
        autoUnsubscribe: () => {
            const layout = route.value.meta.layout;
            return !(typeof layout === "undefined" || layout === "default");
        }
    });

    watch(conversation, (newValue) => {
        if (newValue) {
            const _newValue = useUnRef(newValue);
            unreadMessages.value -= _newValue.unread_messages;

            if (unreadMessages.value < 0) {
                unreadMessages.value = 0;
            }

            _newValue.unread_messages = 0;
            infiniteList.value?.upSert(_newValue);
        }
    }, {
        deep: true
    });

    defineExpose({
        unreadMessages: readonly(unreadMessages),
        upSert: (...ags: Parameters<NonNullable<typeof infiniteList.value>["upSert"]>) => infiniteList.value?.upSert(...ags)
    });
</script>