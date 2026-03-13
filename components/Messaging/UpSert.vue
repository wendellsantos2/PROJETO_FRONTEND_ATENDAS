<template>
    <Modal
        ref="modal"
        :title="`${modal?.context.id ? 'editar' : 'criar'} conversa`"
        :contextInitial
        size="xs"
    >
        <Vueform
            ref="vueform"
            v-model="modal!.context.form"
            sync
            :endpoint="false"
            @submit="upSert"
        >
            <div
                v-if="!modal?.context?.id"
                class="col-span-full flex flex-row items-center justify-between"
            >
                <span>
                    Mensagem direta?
                </span>
                <ToggleElement
                    name="direct_message"
                    :labels="{ on: 'Sim', off: 'Não' }"
                />
            </div>

            <TransitionHeight>
                <TextElement
                    v-if="modal?.context?.id || !modal?.context?.form?.direct_message"
                    name="name"
                    label="Nome do grupo"
                    placeholder="Planejamento X"
                    :default="modal?.context?.name"
                    rules="required|min:1"
                />
            </TransitionHeight>

            <LazySelectUser
                v-if="!modal?.context?.id"
                name="participants"
                label="Participantes"
                placeholder="Selecione participantes"
                excludeUser
                :multi="!modal?.context.form?.direct_message"
                rules="required"
            />

            <Button class="col-span-full" :loading>
                <Icon name="upload" />
                Salvar
            </Button>
        </Vueform>
    </Modal>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    type Chat = InternalApi["v1/chats"]["get"]["data"][0];

    const emits = defineEmits<{
        created: [chat: Chat]
        then: []
        finally: []
    }>();

    const contextInitial = {
        id: 0,
        name: "",
        form: {
            direct_message: true
        } as Record<string, unknown>
    };
    const { set } = useMessagingStore();

    const modal = useModal<typeof contextInitial>();
    const loading = ref(false);
    const vueform = ref();

    const upSert = async () => {
        loading.value = true;

        const id = modal.value?.context.id;
        const body = modal.value?.context.form;

        if (body?.participants && !isArray(body?.participants)) {
            body.participants = [body?.participants];
        }

        await useFetchApi(`v1/chats/${id || ""}`, {
            method: id ? "PUT" : "POST",
            body
        })
            .then(({ data }) => {
                modal.value?.toggle(false);
                data.id === id ? set(data) : emits("created", data);

                emits("then");
            })
            .finally(() => {
                loading.value = false;
                vueform.value?.reset();
                emits("finally");
            });
    };

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>