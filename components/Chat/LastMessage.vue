<template>
    <div class="flex flex-row items-center gap-1 truncate *:text-sm">
        <Icon
            v-if="props.user?.id === $user.value?.id"
            class="text-primary opacity-50"
            name="send"
        />
        <span
            v-else-if="!props.isDirect && props.user"
            class="inline-flex size-fit opacity-50"
        >
            <slot name="sender">
                <img
                    v-tooltip="props.user.name"
                    :src="props.user.avatar_url"
                    class="inline-flex size-4 rounded-full"
                >
            </slot>
        </span>
        <div
            v-if="props.content"
            class="relative h-4 grow opacity-50"
        >
            <p class="absolute inset-0 truncate text-sm">
                {{ useResumeString(props.content, 70) }}
            </p>
        </div>
        <span v-else class="flex flex-row items-center gap-1 opacity-50">
            <Icon
                :name="[
                    'file',
                    'image',
                    'audio',
                    'video',
                    'file'
                ].includes(props.type) ? props.type : 'fileUnknown'"
            />
            {{ {
                text: 'texto',
                image: 'imagem',
                audio: 'audio',
                video: 'video',
                file: 'arquivo'
            }[props.type] }}
        </span>

        <slot />
    </div>
</template>

<script setup lang="ts">
    const props = defineProps<{
        isDirect: boolean
        content: string
        type: "audio" | "video" | "image" | "text" | "file"
        user: {
            id: number
            name: string
            avatar_url: string
        } | null
    }>();
</script>