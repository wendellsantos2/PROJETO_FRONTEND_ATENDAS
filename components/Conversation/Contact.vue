<template>
    <li class="group z-0 flex w-full max-w-full cursor-pointer flex-row items-center gap-3 rounded-2xl border-b-2 border-background-200 bg-background p-4 transition-all duration-300 user-select-none last:border-none">
        <div class="relative h-fit flex-none">
            <img
                :src="conversation.contact.avatar_url"
                :alt="conversation.contact.name"
                class="size-14 rounded-full bg-background object-cover object-center"
            >
            <span class="absolute right-0 top-0 flex aspect-square flex-col items-center justify-center rounded-full bg-white p-px text-black">
                <Icon
                    :name="useProviderIcon('message', conversation?.lastMessage.service)"
                    size="1rem"
                />
            </span>
        </div>
        <div class="flex grow flex-col gap-2">
            <div class="flex w-full flex-row items-center gap-1 whitespace-nowrap text-xs">
                <p v-if="!conversation.tags.length" class="flex flex-row items-center gap-1 text-xs opacity-40">
                    <Icon name="tag" size="0.7rem" />
                    <span class="max-xs:hidden">
                        Sem etiquetas
                    </span>
                </p>
                <template v-else>
                    <LazyBadge
                        v-for="(tag) in conversation.tags.slice(0, maxTags)"
                        :key="tag.id"
                        :color="tag.color"
                        :name="tag.name"
                        :resumeString="resumeStringTag"
                    />
                    <span v-if="conversation.tags.length > maxTags">
                        + {{ conversation.tags.length - maxTags }}
                    </span>
                </template>
                <slot name="afterName">
                    <span class="ml-auto leading-none">
                        {{ useDate(conversation.lastMessage.created_at) }}
                    </span>
                </slot>
            </div>
            <div class="flex flex-row items-center justify-between gap-4">
                <div class="relative h-5 min-w-8 grow">
                    <p
                        v-tooltip="{
                            content: conversation.contact.name,
                            disabled: String(conversation.contact.name).length < lengthName
                        }"
                        class="absolute inset-0 truncate"
                    >
                        {{ useResumeString(conversation.contact.name, lengthName) }}
                    </p>
                </div>
                <div v-if="recipient" class="relative h-3 grow">
                    <p class="absolute inset-0 truncate text-end text-xs leading-none opacity-40">
                        {{ conversation.lastMessage.recipient }}
                    </p>
                </div>
                <span v-show="conversation.unreadMessages" class="inline-flex min-w-[1.3125rem] flex-row items-center justify-center rounded-full bg-primary p-1 text-sm font-medium leading-none text-white shadow">
                    {{ conversation.unreadMessages }}
                </span>
            </div>
            <LazyChatLastMessage
                :isDirect="conversation.lastMessage.is_inbound"
                :content="conversation.lastMessage.content"
                :type="conversation.lastMessage.type"
                :user="conversation.attendant"
            >
                <template v-if="conversation.attendant_type === 'bot'" #sender>
                    <Icon name="bot" />
                </template>

                <span v-if="$slots.afterName" class="ml-auto leading-none">
                    {{ useDate(conversation.lastMessage.created_at) }}
                </span>
            </LazyChatLastMessage>
        </div>
    </li>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    const {
        conversation,
        maxTags = 1,
        resumeStringTag = 8,
        lengthName = 17,
        recipient
    } = defineProps<{
        conversation: InternalApi["v1/conversations/:id"]["get"]["data"]
        maxTags?: number
        resumeStringTag?: number
        lengthName?: number
        recipient?: boolean
    }>();
</script>