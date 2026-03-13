<template>
    <LazyModal
        ref="modal"
        :title="`Notificações ${unreadMessagesComputed ? ` (${unreadMessagesComputed})` : ''}`"
        position="left"
    >
        <template #head>
            <Vueform
                v-model="filters"
                sync
                class="order-last w-full sm:order-none sm:w-fit"
            >
                <RadiogroupElement
                    name="read"
                    view="tabs"
                    default="null"
                    :items="{
                        null: 'Todas',
                        false: 'Não lidas',
                        true: 'Lidas'
                    }"
                />
            </Vueform>
        </template>

        <template #default="{ toggle }">
            <InfiniteList
                ref="infiniteList"
                request="v1/notifications"
                :transform
                overflow
                classList="gap-6"
                @extraResponse="unreadMessages = $event?.number_of_unreads ?? 0"
            >
                <template #default="{ item }">
                    <li
                        class="relative z-0 flex w-full flex-row items-center gap-4 rounded-2xl bg-background-100 p-4 transition-all duration-500 hover:bg-soft hover:opacity-100"
                        :class="{ 'opacity-50': !!item.read }"
                    >
                        <NuxtLink
                            :href="item.link"
                            class="absolute inset-0 -z-1 flex"
                            @click="() => {
                                toggle();
                                if (!item.read) {
                                    read(item.id)
                                }
                            }"
                        />

                        <div class="pointer-events-none mr-auto flex flex-col gap-2">
                            <h6 class="font-bold">
                                {{ item.title }}
                            </h6>
                            <p>
                                {{ item.body }}
                            </p>
                        </div>
                        <Button
                            v-if="!item.read"
                            v-tooltip="'Marcar como lida'"
                            color="success"
                            size="sm"
                            :action="async () => await read(item.id)"
                        >
                            <Icon name="doubleCheck" />
                        </Button>
                        <Button
                            v-else
                            v-tooltip="'Desmarcar como lida'"
                            color="danger"
                            size="sm"
                            :action="async () => await unread(item.id)"
                        >
                            <Icon name="remove" />
                        </Button>
                    </li>
                </template>

                <template #after>
                    <li
                        v-show="listUnread?.length"
                        key="listUnread"
                        class="sticky bottom-0 flex h-fit w-full items-center justify-between gap-6 rounded-full bg-contrast p-2 text-background"
                    >
                        <p>
                            Marcar todas as mensagens como lidas?
                        </p>
                        <Button
                            size="sm"
                            class="px-2"
                            :action="async () => await read(listUnread!)"
                        >
                            <Icon name="doubleCheck" />
                            <span>
                                Sim
                            </span>
                        </Button>
                    </li>
                </template>
            </InfiniteList>
        </template>
    </LazyModal>
</template>

<script setup lang="ts">
    import type { InfiniteList } from "#components";
    import type { ComponentExposed } from "~/types";

    const modal = useModal();
    const filters = ref<Record<string, string>>({});
    const infiniteList = ref<ComponentExposed<typeof InfiniteList<"v1/notifications">>>();

    const {
        unread: unreadMessages,
        unreadComputed: unreadMessagesComputed
    } = storeToRefs(useNotificationsStore());

    useNotificationsStore().$onAction(({ name, args }) => {
        if (name === "toggle") {
            modal.value?.toggle(...args);
        }
    });

    watch(filters, (f) => {
        infiniteList.value!.filters = f;
    });

    const transform = (item: Parameters<NonNullable<typeof infiniteList.value>["upSert"]>[0]) => {
        const link = (() => {
            if (item?.ticket_id) {
                return `/tickets/pedidos/${item.ticket_id}`;
            }
            if (item?.chat_id) {
                return `/chat-interno/${item.chat_id}`;
            }
        })();

        return {
            ...item,
            link
        };
    };

    const listUnread = computed(() => {
        return infiniteList.value
            ?.list
            .filter(({ read }) => !read)
            .map(({ id }) => id);
    });

    const read = async (id: string | string[]) => {
        const _ids = typeof id === "string" ? [id] : id;

        await Promise.all(_ids.map((_id) => {
            return useFetchApi("v1/notifications/mark-as-read", {
                method: "POST",
                params: {
                    id: _id
                },
                onResponse () {
                    infiniteList.value?.upSert({
                        id: _id,
                        read: true
                    });
                }
            });
        }));

        unreadMessages.value -= _ids.length;
    };

    const unread = async (id: string) => {
        await useFetchApi("v1/notifications/mark-as-unread", {
            method: "POST",
            params: {
                id
            },
            onResponse () {}
        });

        infiniteList.value?.upSert({
            id,
            read: false
        });

        unreadMessages.value += 1;
    };
</script>