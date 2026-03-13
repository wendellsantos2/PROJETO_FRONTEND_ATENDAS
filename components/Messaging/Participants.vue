<template>
    <Modal
        ref="modal"
        title="Participantes"
        :contextInitial
        position="right"
        size="xs"
    >
        <LazyInfiniteList
            ref="infiniteList"
            :key="talkingId"
            v-slot="{ item: participant }"
            :request="`v1/chats/${talkingId}/participations`"
            :opts="{
                asyncData: {
                    immediate: false
                }
            }"
            overflow
            classList="gap-6"
        >
            <li class="flex flex-row items-center gap-2 rounded-xl bg-background-100 p-2 shadow">
                <img
                    :src="participant.avatar_url"
                    :alt="participant.name"
                    class="size-7 rounded-full border-2 bg-background object-cover object-center"
                    :style="`border-color: ${participant.role?.color}`"
                >
                <h6 class="font-medium">
                    {{ participant.name }}
                </h6>
                <Button
                    v-tooltip="'Remover'"
                    color="danger"
                    size="sm"
                    class="ml-auto"
                    :action="async () => await remove(participant.id)"
                >
                    <Icon name="remove" />
                </Button>
            </li>
        </LazyInfiniteList>
        <hr>
        <Vueform
            v-model="modal!.context.form"
            sync
            :endpoint="false"
            class="sticky bottom-0"
            @submit="add"
        >
            <LazySelectUser
                ref="selectUser"
                name="participants"
                label=""
                placeholder="Selecione participantes"
                rules="required"
                multi
                :excludeUsersByChat="talkingId"
            />
            <Button
                class="col-span-full"
                :loading
            >
                <Icon name="userAdd" />
                Adicionar
            </Button>
        </Vueform>
    </Modal>
</template>

<script setup lang="ts">
    import type { InfiniteList, SelectUser } from "#components";
    import type { ComponentExposed } from "~/types";

    const emits = defineEmits<{
        then: []
        finally: []
    }>();

    const {
        talkingId
    } = storeToRefs(useMessagingStore());

    const {
        refresh
    } = useMessagingStore();

    const infiniteList = ref<ComponentExposed<typeof InfiniteList<"v1/chats/:id/participations">>>();
    const selectUser = ref<ComponentExposed<typeof SelectUser>>();

    const contextInitial = {
        id: 0,
        form: {} as Record<string, unknown>
    };

    const modal = useModal<typeof contextInitial>();

    watch(() => modal.value?.open, (v) => {
        if (v) {
            infiniteList.value?.reset();
        }
    });

    const loading = ref(false);

    const add = async () => {
        loading.value = true;

        const body = modal.value?.context.form;

        await useFetchApi(`v1/chats/${talkingId.value}/participations`, {
            method: "POST",
            body: {
                ...body
            }
        })
            .then(() => {
                modal.value?.toggle(false);
                refresh();
                emits("then");
            })
            .finally(() => {
                loading.value = false;
                emits("finally");
            });
    };

    const remove = async (id: number) => {
        await useFetchApi(`v1/chats/${talkingId.value}/participations/${id}`, {
            method: "delete"
        })
            .then(() => {
                infiniteList.value?.remove(id);
                selectUser.value?.refresh();
                refresh();
                emits("then");
            })
            .finally(() => {
                emits("finally");
            });
    };

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>