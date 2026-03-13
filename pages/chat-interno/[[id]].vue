<template>
    <section class="flex grow flex-row justify-end overflow-hidden bg-background-100 max-sm:rounded-b-none lg:m-6 lg:mt-0 lg:rounded-3xl">
        <MessagingList
            ref="chatList"
            class="w-full flex-none sm:max-w-80"
            @create="upSert?.toggle()"
        />

        <div
            class="relative flex w-full flex-none flex-col overflow-hidden bg-background shadow-sm transition-all duration-500 max-lg:!rounded-r-none sm:grow sm:rounded-3xl lg:m-4 lg:ml-0 lg:w-0"
            :class="talkingId ? 'max-lg:!rounded-none' : 'mr-[-100%] sm:mr-0 sm:w-0'"
        >
            <TransitionOpacity mode="out-in">
                <div
                    v-if="!talkingId"
                    class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                    <VSvg
                        name="logo"
                        size="10rem"
                        class="opacity-15"
                    />
                </div>
                <div v-else class="flex grow flex-col">
                    <Transition
                        enterFromClass="opacity-0 -translate-y-full"
                        leaveToClass="opacity-0 -translate-y-full"
                        mode="out-in"
                    >
                        <div
                            :key="talkingId"
                            class="flex w-full flex-row items-center justify-center gap-4 p-4 text-center transition-all duration-500 sm:p-6"
                        >
                            <Button
                                class="!p-2 lg:hidden"
                                variant="transparent"
                                @click="reset()"
                            >
                                <Icon name="back" />
                            </Button>

                            <h5 class="font-bold">
                                {{ conversation?.name }}
                            </h5>
                            <div
                                v-if="conversation?.id && !conversation?.direct_message"
                                class="ml-auto flex flex-row items-center justify-center gap-4"
                            >
                                <Button
                                    v-tooltip="'Editar'"
                                    size="sm"
                                    @click="upSert?.toggle(true, { id: conversation.id, name: conversation?.name, form: {} })"
                                >
                                    <Icon name="edit" />
                                </Button>
                                <Button
                                    v-tooltip="'Participantes'"
                                    color="secondary"
                                    size="sm"
                                    @click="participants?.toggle()"
                                >
                                    <Icon name="users" />
                                </Button>
                            </div>
                        </div>
                    </Transition>
                    <hr class="mx-4 sm:mx-6">

                    <MessagingConversation />
                </div>
            </TransitionOpacity>
        </div>

        <LazyMessagingUpSert
            ref="upSert"
            @created="(data) => chatList?.upSert(data)"
        />

        <LazyMessagingParticipants
            v-if="!conversation?.direct_message"
            ref="participants"
        />
    </section>
</template>

<script setup lang="ts">
    import type { MessagingList, MessagingParticipants, MessagingUpSert } from "#components";

    definePageMeta({
        key: "Messaging",
        title: "Chat interno",
        navOrder: 50,
        icon: "message"
    });

    const {
        talkingId,
        conversation
    } = storeToRefs(useMessagingStore());

    const {
        set,
        reset
    } = useMessagingStore();

    const route = useRoute();

    watch(() => route.params.id, (newId) => {
        const _newId = Number(newId);

        if (_newId && _newId !== talkingId.value) {
            set(_newId);
        }
    }, {
        immediate: true
    });

    onMounted(() => {
        watch(talkingId, (newId) => {
            const path = newId ? `/${newId}` : "";

            navigateTo(`/chat-interno${path}`);
        }, {
            immediate: true
        });
    });

    const upSert = ref<InstanceType<typeof MessagingUpSert>>();
    const participants = ref<InstanceType<typeof MessagingParticipants>>();
    const chatList = ref<InstanceType<typeof MessagingList>>();
</script>