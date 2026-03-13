<!-- eslint-disable vue/no-v-html -->
<template>
    <div class="flex flex-col gap-2 p-4 text-sm">
        <div class="flex flex-row justify-between gap-4">
            <p class="text-sm">
                Em resposta a
                <strong v-if="!direct && props.replyTo.sender">
                    {{ props.replyTo.sender.id === $user.value?.id ? "você" : `@${props.replyTo.sender.name}` }}
                </strong>
            </p>
            <button
                v-tooltip="'Navegar até a mensagem'"
                class="opacity-60 transition-all duration-300 hover:text-primary"
                @click="scrollToElement(props.replyTo.id)"
            >
                <Icon name="linkOut" size="0.8rem" />
            </button>
        </div>
        <div
            class="flex flex-row gap-3 opacity-60"
            :class="isAudio('flex-col', 'flex-row')"
        >
            <ViewMedia
                v-if="props.replyTo.media"
                :src="props.replyTo.media.link"
                :type="props.replyTo.type"
                class="h-min max-h-20 bg-background-100 text-contrast"
                :class="isAudio('w-full grow', 'aspect-video grow')"
            />
            <div
                v-if="!(['', null, undefined].includes(props.replyTo.content))"
                class="grow"
            >
                <ChatMessage
                    class="text-sm"
                    :class="isAudio('line-clamp-1', 'line-clamp-4')"
                    :content="props.replyTo.content"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" generic="R extends Reply">
    import type { InternalApi } from "nitropack/types";

    export type BaseReply = InternalApi["v1/chats/:id/messages/:id"]["get"]["data"];

    export interface Reply extends Pick<BaseReply, "content" | "media" | "type" | "created_at"> {
        id: string | number
        sender?: Pick<BaseReply["sender"], "name" | "id">
    };

    const props = defineProps<{
        replyTo: R
        direct?: boolean
    }>();

    const isAudio = (yes: string, no: string) => {
        return props.replyTo.type === "audio" ? yes : no;
    };

    const scrollToElement = (elementId: Reply["id"]) => {
        const element = document.querySelector(`#message-${elementId}`);

        if (!element) {
            useBusError().emit("Essa mensagem não foi carregada ainda");
            return;
        }

        element.scrollIntoView({ behavior: "smooth", inline: "center" });
    };
</script>