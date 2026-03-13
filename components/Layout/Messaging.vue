<template>
    <div
        class="flex w-96 flex-col justify-start overflow-hidden rounded-t-3xl border border-b-0 border-contrast/20 bg-background-100 shadow-md transition-all duration-500"
        :class="open ? 'h-[30rem]' : 'h-8'"
    >
        <div
            class="group sticky top-0 z-1 flex flex-row justify-between gap-1 bg-background-100 transition-all duration-500"
            :class="open ? 'pointer-events-none p-4 *:pointer-events-auto' : 'cursor-pointer px-4 py-1 hover:bg-primary hover:text-white'"
        >
            <div
                v-show="!open"
                class="absolute inset-0"
                @click="toggle"
            />
            <TransitionGroupTranslateX
                tag="div"
                class="flex flex-row items-center gap-1"
            >
                <Button
                    v-show="talkingId"
                    variant="transparent"
                    size="sm"
                    @click="reset"
                >
                    <Icon name="arrowLeft" />
                </Button>
                <h6 v-show="!talkingId" class="font-bold">
                    Chat
                </h6>
                <span
                    v-show="chatList?.unreadMessages"
                    class="ml-1 inline-flex min-w-[1.3125rem] flex-row items-center justify-center rounded-full bg-primary p-1 text-sm font-medium leading-none text-white shadow transition-all duration-500"
                    :class="{ 'group-hover:bg-tertiary': !open }"
                >
                    {{ chatList?.unreadMessages }}
                </span>
            </TransitionGroupTranslateX>
            <TransitionOpacity mode="out-in">
                <h6
                    v-show="conversation?.name"
                    :key="conversation?.name"
                    class="inline-flex items-center gap-1 truncate"
                >
                    {{ conversation?.name }}
                    <span
                        v-show="unreadOpenChat"
                        class="inline-flex min-w-[1.3125rem] flex-row items-center justify-center rounded-full bg-secondary p-1 text-sm font-medium leading-none text-white shadow"
                    >
                        {{ unreadOpenChat }}
                    </span>
                </h6>
            </TransitionOpacity>
            <Button
                color="danger"
                variant="transparent"
                size="sm"
                class="z-10"
                @click="toggle"
            >
                <Icon
                    name="down"
                    class="transition-all duration-300"
                    :class="{ 'rotate-180': !open }"
                />
            </Button>
        </div>
        <div class="flex grow flex-row justify-end overflow-hidden *:w-full *:flex-none">
            <LazyMessagingList
                ref="chatList"
                min
                @create="upSert?.toggle()"
            />
            <Transition
                enterFromClass="mr-[-100%]"
                leaveToClass="mr-[-100%]"
            >
                <LazyMessagingConversation
                    v-show="talkingId"
                    min
                    class="overflow-hidden rounded-t-3xl bg-background transition-all duration-500"
                    @upSertChatMessage="() => {
                        if (!open) {
                            unreadOpenChat++
                        }
                    }"
                />
            </Transition>
        </div>

        <LazyMessagingUpSert
            ref="upSert"
            @created="(data) => chatList?.upSert(data)"
        />
    </div>
</template>

<script setup lang="ts">
    import type { MessagingUpSert, MessagingList } from "#components";

    const open = ref(false);
    const unreadOpenChat = ref(0);

    const toggle = () => {
        open.value = !open.value;

        if (open.value) {
            unreadOpenChat.value = 0;
        }
    };

    const {
        talkingId,
        conversation
    } = storeToRefs(useMessagingStore());

    const {
        reset
    } = useMessagingStore();

    const upSert = ref<InstanceType<typeof MessagingUpSert>>();
    const chatList = ref<InstanceType<typeof MessagingList>>();
</script>