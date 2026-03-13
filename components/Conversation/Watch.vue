<template>
    <Modal
        v-if="useCheckPermissions('read_conversation')"
        ref="modal"
        size="lg"
        position="right"
        classBody="flex flex-col gap-6 grow"
        classBackdrop="!z-[99]"
        :contextInitial
    >
        <template #head="{ context, toggle }">
            <div class="flex flex-col gap-0">
                <component
                    :is="context.conversation?.tags?.length ? 'h5' : 'h2'"
                    class="font-bold capitalize"
                >
                    Conversa <span class="text-secondary">#{{ context.id }}</span>
                </component>
                <div
                    v-if="context.conversation?.tags?.length"
                    class="flex w-full flex-row items-center gap-1"
                >
                    <LazyBadge
                        v-for="(tag) in context.conversation?.tags?.slice(0, 2)"
                        :key="tag.id"
                        :color="tag.color"
                        :name="tag.name"
                    />
                    <span v-if="context.conversation?.tags?.length > 2">
                        + {{ context.conversation?.tags?.length - 2 }}
                    </span>
                </div>
            </div>
            <div class="order-last flex w-full flex-row justify-center gap-4 xs:order-none xs:w-fit">
                <Button
                    v-if="$user.value?.id === context.conversation?.attendant?.id"
                    v-tooltip="'Conversar'"
                    :href="`/mensagens?id=${context.id}`"
                    class="!p-2"
                    @click="toggle(false)"
                >
                    <Icon name="message" />
                </Button>
                <Button
                    v-tooltip="'Etiquetas'"
                    color="customFul"
                    class="bg-orange-600 !p-2 text-white hovact:border-orange-600 hovact:bg-white hovact:text-orange-600"
                    @click="emits('editTags', { id: context.conversation?.id!, tags: context.conversation?.tags })"
                >
                    <Icon name="tag" />
                </Button>
                <Button
                    v-if="useCheckPermissions('update_conversation')"
                    v-tooltip="'Ações do bot'"
                    color="customFul"
                    class="bg-indigo-600 !p-2 text-white hovact:border-indigo-600 hovact:bg-white hovact:text-indigo-600"
                    @click="emits('botAction', { id: context.conversation?.id! })"
                >
                    <Icon name="bot" />
                </Button>
                <Button
                    v-if="useCheckPermissions('update_conversation') && context.conversation?.status === 'closed'"
                    v-tooltip="'Reabrir'"
                    color="secondary"
                    class="!p-2"
                    @click="emits('reopenConversation', { id: context.conversation?.id!, contact: context.conversation?.contact?.name! })"
                >
                    <Icon name="back" />
                </Button>
                <Button
                    v-else-if="useCheckPermissions('close_conversation')"
                    v-tooltip="'Encerrar'"
                    color="secondary"
                    class="!p-2"
                    @click="emits('closeConversation', { id: context.conversation?.id!, contact: context.conversation?.contact?.name! })"
                >
                    <Icon name="chatClose" />
                </Button>
            </div>
        </template>

        <template #default="{ context, toggle }">
            <div class="relative -mx-6 -mb-6 flex grow overflow-hidden rounded-2xl bg-background-100">
                <ConversationChat :talkingId="context.id" noInteraction />
            </div>
            <ul class="flex flex-row gap-6 pt-4 *:flex *:w-full *:items-center *:gap-4">
                <li class="flex-row">
                    <Button
                        v-if="useCheckPermissions('update_contact')"
                        v-tooltip="'Editar contato'"
                        :href="`/contatos/${context.conversation?.contact?.id}`"
                        size="sm"
                        class="z-1 -mr-7 mt-auto flex-none"
                        @click="toggle(false)"
                    >
                        <Icon name="edit" />
                    </Button>
                    <img
                        :src="context.conversation?.contact?.avatar_url"
                        class="size-12 rounded-full bg-background"
                    >
                    <div class="flex flex-col gap-2">
                        <div v-if="context.conversation?.contact?.tags?.length" class="flex w-full flex-row items-center gap-1">
                            <LazyBadge
                                v-for="(tag) in context.conversation?.contact?.tags?.slice(0, 4)"
                                :key="tag.id"
                                :color="tag.color"
                                :name="tag.name"
                                :resumeString="8"
                            />
                            <span v-if="context.conversation?.contact?.tags?.length > 4">
                                + {{ context.conversation?.contact?.tags?.length - 4 }}
                            </span>
                        </div>
                        <h5 class="line-clamp-1 font-medium leading-none">
                            {{ context.conversation?.contact?.name }}
                        </h5>
                        <p class="opacity-50">
                            {{ context.conversation?.contact?.services[context.conversation?.lastMessage?.service?.split("-")?.at(0) ?? ""] }}
                        </p>
                    </div>
                </li>
                <li
                    v-show="context.conversation?.attendant"
                    class="flex-row-reverse text-right"
                >
                    <Button
                        v-if="useCheckPermissions('change_attendant')"
                        v-tooltip="'Trocar atendente'"
                        size="sm"
                        class="z-1 -ml-7 mt-auto"
                        @click="emits('changeAttendant', { id: context.conversation!.id, attendant: context.conversation?.attendant?.id! })"
                    >
                        <Icon name="change" />
                    </Button>
                    <img
                        v-if="context.conversation?.attendant_type === 'user'"
                        :src="context.conversation?.attendant?.avatar_url"
                        class="size-12 rounded-full border-2"
                        :style="`border-color: ${context.conversation?.attendant?.role?.color}`"
                    >
                    <div v-else class="flex size-12 flex-col items-center justify-center rounded-full bg-secondary text-white">
                        <Icon name="bot" size="2rem" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <div v-if="context.conversation?.attendant?.teams?.length" class="flex w-full flex-row items-center justify-end gap-1">
                            <LazyBadge
                                v-for="(tag) in context.conversation?.attendant?.teams?.slice(0, 4)"
                                :key="tag.id"
                                :color="tag.color"
                                :name="tag.name"
                                :resumeString="8"
                            />
                            <span v-if="context.conversation?.attendant?.teams?.length > 4">
                                + {{ context.conversation?.attendant?.teams?.length - 4 }}
                            </span>
                        </div>
                        <h5 class="line-clamp-1 font-medium leading-none">
                            {{ context.conversation?.attendant?.name }}
                        </h5>
                    </div>
                </li>
            </ul>
        </template>
    </Modal>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    const emits = defineEmits<{
        editTags: [{ id: number, tags?: InternalApi["v1/tags"]["get"]["data"] }]
        botAction: [{ id: number }]
        reopenConversation: [{ id: number, contact: string }]
        closeConversation: [{ id: number, contact: string }]
        changeAttendant: [{ id: number, attendant: number }]
    }>();

    const contextInitial: {
        id: number
        conversation?: InternalApi["v1/conversations/:id"]["get"]["data"]
    } = {
        id: 0,
        conversation: undefined
    };

    const modal = useModal<typeof contextInitial>();

    const refresh = async () => {
        const _id = modal.value?.context?.id;

        if (_id && modal.value) {
            const { data: _data } = await useFetchApi(`v1/conversations/${_id}`);
            modal.value.context.conversation = _data;
        }
    };

    watch(() => modal.value?.context?.id, async (_id) => {
        await refresh();
    });

    defineExpose({
        open: modal.value?.open,
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags),
        refresh
    });
</script>