<template>
    <main class="z-0 flex h-dvh w-dvw min-w-60 flex-col overflow-hidden xs:relative xs:bg-[url('/images/login/2.jpg')] xs:bg-cover xs:bg-center xs:p-6 xs:after:absolute xs:after:inset-0 xs:after:-z-10 xs:after:bg-black/70 xs:after:backdrop-blur-sm">
        <Html class="overflow-hidden" />

        <div class="flex size-full grow flex-col overflow-hidden xs:m-auto xs:max-w-screen-xs xs:rounded-3xl xs:border xs:border-contrast/10 xs:bg-background xs:shadow-md xs:transition-colors xs:duration-500">
            <Transition
                enterActiveClass="!transition-all !duration-300"
                enterFromClass="!opacity-0"

                leaveActiveClass="!transition-all !duration-500"
                leaveToClass="!opacity-0"
            >
                <button
                    v-show="isClosed"
                    class="absolute inset-0 z-[99999] flex flex-col items-center justify-center text-white transition-all duration-500"
                    :class="chat?.id ? 'bg-secondary' : 'bg-primary'"
                    @click="postMessage('expand')"
                >
                    <span class="relative">
                        <Icon
                            name="chat"
                            size="2rem"
                            :class="{ 'animate-pulse': chat?.id }"
                        />
                        <TransitionOpacity>
                            <span
                                v-show="notification"
                                class="absolute right-0 top-0 min-h-4 min-w-4 rounded-full bg-danger p-0.5 text-sm leading-none text-white"
                            >
                                {{ notification }}
                            </span>
                        </TransitionOpacity>
                    </span>
                </button>
            </Transition>

            <div class="flex flex-row items-start justify-between gap-4 p-4 pb-0 leading-none">
                <TransitionTranslateX mode="out-in">
                    <h5
                        v-if="!chat?.id"
                        class="font-bold"
                    >
                        Iniciar chat
                    </h5>
                    <div
                        v-else
                        class="flex flex-row gap-2"
                    >
                        <div class="flex size-8 flex-col items-center justify-center overflow-hidden rounded-full bg-soft text-primary">
                            <Icon
                                v-if="chat.attendant_type === 'bot'"
                                name="bot"
                                size="1rem"
                            />
                            <img
                                v-else-if="chat.attendant"
                                :src="chat.attendant.avatar_url"
                                :alt="chat.attendant.name"
                                class="size-full object-cover object-center"
                            >
                        </div>
                        <div class="flex flex-col gap-1">
                            <h6 v-if="chat.attendant" class="line-clamp-1 pb-0.5 font-bold">
                                {{ chat.attendant.name }}
                            </h6>
                            <span class="text-xs font-medium text-secondary">
                                #{{ chat.id }}
                            </span>
                        </div>
                    </div>
                </TransitionTranslateX>
                <ButtonTheme />
                <Button
                    v-tooltip="'Minimizar'"
                    color="danger"
                    size="sm"
                    class="flex-none xs:hidden"
                    @click="postMessage('minimize')"
                >
                    <Icon name="minimize" />
                </Button>
            </div>

            <TransitionTranslateX>
                <WebchatFinished
                    v-if="finished"
                />
                <WebchatConversation
                    v-else-if="chat?.id"
                    :chat
                    :to="urlParams.to"
                    @newMessage="newMessage"
                    @updateConversation="chat = useMerge(chat, $event)"
                    @closedConversation="finish"
                />
                <WebchatForm
                    v-else
                    v-bind="urlParams"
                    @then="chat = $event"
                />
            </TransitionTranslateX>
        </div>
    </main>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    type Webchat = InternalApi["webchat/:to"]["get"]["data"];

    definePageMeta({
        layout: false
    });

    const requiredUrlParams = ["to"] as const;
    const urlParams = useUrlSearchParams<Record<typeof requiredUrlParams[number], string>>();

    requiredUrlParams.forEach((par) => {
        if (!urlParams[par]) {
            throw createError(`O parâmero obrigatório '${par}' não foi encontrado na url`);
        }
    });

    const isClosed = useMediaQuery("(max-width: 5rem)");
    const chat = useLocalStorage("atendas:webchat", {} as Webchat | null);

    if (chat.value?.id) {
        const { data: newChat } = await useFetchApi(`webchat/${urlParams.to}`, {
            params: {
                conversation_id: chat.value.id
            },
            onResponseError: undefined
        });

        chat.value = newChat.status === "closed" ? null : newChat;
    }

    const notification = ref(0);
    const newMessage = () => {
        if (isClosed.value) {
            notification.value++;
        }
    };

    watch(isClosed, () => {
        notification.value = 0;
    });

    const finished = ref(false);
    const finish = () => {
        finished.value = true;

        useTimeoutFn(() => {
            chat.value = null;
            finished.value = false;
        }, 5 * 1000);
    };

    const postMessage = (type: string) => {
        window.parent.postMessage({
            sender: "atendas:webchat",
            type
        }, "*");
    };

    onMounted(() => {
        postMessage("mounted");
    });
</script>