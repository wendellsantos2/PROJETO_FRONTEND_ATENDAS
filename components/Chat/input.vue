<!-- eslint-disable vue/no-v-html -->
<template>
    <div
        class="relative m-4 mt-0 flex flex-col rounded-[--rounded] bg-background-300"
        :class="props.min ? '[--rounded:1.8rem]' : '[--rounded:2.5rem] sm:m-6 sm:mt-0'"
    >
        <TransitionHeight>
            <div
                v-if="reply"
                :key="reply.id"
                class="flex flex-col gap-3 rounded-t-[--rounded] p-4 *:flex *:flex-row *:gap-3"
            >
                <div class="flex flex-row items-center">
                    <span
                        class="mb-auto w-full text-sm font-medium"
                        :class="{ 'sm:text-base': props.min }"
                    >
                        Responder mensagem
                        <span v-if="reply.sender">
                            de <strong class="text-primary">{{ reply.sender.id === $user.value?.id ? "você mesmo" : `@${reply.sender.name}` }}</strong>
                        </span>
                        <span class="lowercase">
                            enviada {{ usePastTimeRef(reply.created_at) }}
                        </span>
                    </span>
                    <Button
                        color="danger"
                        size="sm"
                        @click="reply = undefined"
                    >
                        <Icon name="close" />
                    </Button>
                </div>
                <div class="text-sm opacity-60">
                    <ViewMedia
                        v-if="reply.media"
                        :src="reply.media.link"
                        :type="reply.type"
                        class="max-h-20 max-w-80 bg-background text-contrast"
                    />
                    <ChatMessage
                        class="line-clamp-5 text-sm"
                        :content="reply.content"
                    />
                </div>
            </div>
        </TransitionHeight>
        <TransitionHeight>
            <LazyFile
                v-show="file?.upload.id || file?.loading"
                ref="file"
                :button="false"
                :dragEffect="false"
                v-bind="props.upload"
                class="!bg-transparent"
            />
        </TransitionHeight>
        <!-- TODO COLOCAR COMO UM SLOT -->
        <LazyChatSelectTemplate
            v-if="props.selectTemplate"
            v-model="message"
            @setMedia="(media) => file?.setUpload(media, false)"
        />
        <slot />
        <div
            ref="containerInput"
            class="z-10 order-last flex flex-row items-end overflow-hidden rounded-[2.5rem] border border-dashed border-transparent shadow-md transition-all duration-300 *:p-2"
            :class="[
                props.addClass,
                { 'animate-pulse !border-primary': file?.dragEvent }
            ]"
        >
            <div
                v-if="$user.value?.avatar_url && !props.min"
                class="hidden  xs:block "
            >
                <img
                    :src="$user.value?.avatar_url"
                    :alt="$user.value?.name"
                    class="size-10 rounded-full bg-contrast object-cover object-center lg:size-12"
                >
            </div>

            <textarea
                ref="inputMessage"
                v-model="message"
                placeholder="Digite sua mensagem..."
                class="mask-transparent-border my-auto max-h-40 grow resize-none bg-transparent py-2 outline-none [--size:0.5rem] focus:placeholder:text-primary"
                @paste="file?.setFile($event.clipboardData?.files)"
                @keydown.enter.exact.prevent="send"
                @keydown.enter.ctrl="message += `\n`"
            />

            <TransitionGroup
                enterActiveClass="transition-all duration-500"
                enterFromClass="opacity-0 !-mr-[2.375rem]"
                leaveActiveClass="transition-all duration-500"
                leaveToClass="opacity-0 !-mr-[2.375rem]"
                tag="div"
                class="flex flex-row items-center !pr-0 *:mr-2 *:size-[2.375rem]"
            >
                <LazyEmojiPicker
                    v-if="$screen.lg"
                    key="emoji"
                    @select="(e) => message += ` ${e}`"
                >
                    <Button
                        v-tooltip="'Adicionar emoji'"
                        color="custom"
                        variant="transparent"
                        size="sm"
                        class="text-contrast/20"
                        :class="button.class"
                    >
                        <Icon
                            name="emoji"
                            :class="button.icon"
                        />
                    </Button>
                </LazyEmojiPicker>

                <Button
                    v-show="button.show"
                    key="file"
                    v-tooltip="'Anexar arquivo'"
                    color="custom"
                    variant="transparent"
                    size="sm"
                    class="text-contrast/20"
                    :class="button.class"
                    @click="fileDialog.open"
                >
                    <Icon
                        name="attachment"
                        :class="button.icon"
                    />
                </Button>

                <ChatRecordAudio
                    v-show="button.show"
                    key="audio"
                    :iconClass="button.icon"
                    :class="button.class"
                    @setFile="file?.setFile([$event])"
                />

                <Button
                    v-show="!props.min && $screen.sm || allowedSend"
                    key="sender"
                    size="sm"
                    :loading
                    :disabled="!allowedSend"
                    :class="[button.class, { 'lg:size-12': !props.min }]"
                    @click="send"
                >
                    <Icon
                        name="send"
                        :class="[button.icon, { 'md:size-6': !props.min }]"
                    />
                </Button>
            </TransitionGroup>
        </div>
        <div
            v-if="!props.min"
            class="absolute inset-x-0 bottom-0 hidden translate-y-full flex-row divide-x-2 divide-contrast/20 pl-4 pt-1 text-xs *:px-2 lg:flex"
        >
            <span v-if="props.selectTemplate">
                Digite <span class="font-bold text-primary">/NOME</span> ou <span class="font-bold text-primary">/#ID</span> + <kbd>space</kbd> para selecionar modelo
            </span>
            <span>
                Pressione <kbd>CTRL + ENTER</kbd> para quebrar linha
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { File } from "#components";
    import type { Reply } from "./Reply.vue";

    export interface SenderParams {
        content: string
        type: ReturnType<typeof useFileType>
        upload_id?: number
        reply_to?: string | number
    };

    const props = withDefaults(defineProps<{
        sender: (data: SenderParams) => Promise<void>
        addClass?: string
        watchReset?: string | number | boolean
        min?: boolean
        selectTemplate?: boolean
        upload?: {
            route?: string
            delet?: boolean
        }
    }>(), {
        addClass: "bg-background",
        watchReset: undefined
    });

    const { $screen } = useNuxtApp();

    const button = computed(() => ({
        show: ((!props.min && $screen.value.sm) || !allowedSend.value),
        class: "!p-2 flex-none",
        icon: "size-5"
    }));

    const containerInput = ref<HTMLDivElement>();
    const file = ref<InstanceType<typeof File>>();

    useDropZone(containerInput, f => file.value?.setFile(f));

    const fileDialog = useFileDialog({
        reset: true
    });

    fileDialog.onChange(f => file.value?.setFile(f));

    const reply = ref<Reply>();

    const {
        textarea: inputMessage,
        input: message
    } = useTextareaAutosize({});

    const allowedSend = computed(() => {
        return !loading.value && !file.value?.loading && (!!message.value.trim() || !!(file.value?.upload?.id));
    });

    const loading = ref(false);

    const send = async () => {
        if (allowedSend.value) {
            loading.value = true;

            try {
                await props.sender({
                    type: file.value?.upload?.type,
                    content: message.value,
                    upload_id: file.value?.upload?.id,
                    reply_to: reply.value?.id
                });

                message.value = "";
                file.value?.close();
                reply.value = undefined;
            }
            finally {
                loading.value = false;
            }
        }
    };

    watch(() => props.watchReset, async () => {
        message.value = "";
        reply.value = undefined;
        file.value?.close(true);
        await new Promise(resolve => setTimeout(resolve, 600));
        inputMessage.value?.focus();
    }, {
        immediate: true
    });

    defineExpose({
        reply: (msg: Reply) => {
            reply.value = msg;
        }
    });
</script>