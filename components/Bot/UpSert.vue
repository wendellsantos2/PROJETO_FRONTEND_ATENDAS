<template>
    <Modal
        ref="modal"
        :title="`${id ? 'editar' : 'criar'} bot`"
        size="xs"
    >
        <Vueform
            v-model="data"
            sync
            :endpoint="false"
            class="min-w-96"
            @submit="submit"
        >
            <TextElement
                name="name"
                label="Nome"
                placeholder="Atendimento Inicial"
                rules="required|min:1"
            />
            <SelectElement
                name="type"
                label="Tipo"
                default="chat"
                :items="useBotTypes()"
                :native="false"
                :canClear="false"
                rules="required"
            />
            <TextareaElement
                name="description"
                label="Descrição"
                placeholder="No primeiro contato, solicita e registra os dados do cliente na base para um atendimento personalizado"
                :rows="3"
                rules="required|min:1"
            />
            <VFileElement
                v-if="!id"
                name="bot_file"
                accept=".json"
                label="Arquivo de fluxo"
                raw
            />

            <LazyNotice
                v-show="!!data?.bot_file"
                type="warning"
                :title="false"
                description="Ao utilizar o método de importação, pode demorar um pouco mais para criar o fluxo."
                class="col-span-full"
            />

            <Button class="col-span-full" :loading>
                <template v-if="id">
                    <Icon name="upload" />
                    Salvar
                </template>
                <template v-else>
                    Proximo
                    <Icon name="arrowRight" />
                </template>
            </Button>
        </Vueform>
    </Modal>
</template>

<script setup lang="ts">
    const emit = defineEmits<{
        then: []
        finally: []
    }>();

    const modal = useModal();

    const {
        id,
        data
    } = storeToRefs(useBotStore());

    const {
        upSert
    } = useBotStore();

    const loading = ref(false);

    const submit = async () => {
        loading.value = true;

        try {
            const response = await upSert();

            if (!id.value) {
                if (data.value?.bot_file) {
                    const check = async () => {
                        const { data } = await useFetchApi(`v1/bots/${response.data.id}/workflows`);

                        if (!data.length) {
                            await new Promise(resolve => setTimeout(resolve, 5000));
                            await check();
                        }
                    };

                    await check();
                }

                await navigateTo(`/bots/${response.data.id}`);
            }
            else {
                emit("then");
                modal.value?.toggle(false);
            }
        }
        finally {
            emit("finally");
            loading.value = false;
        }
    };

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => {
            modal.value?.toggle(...ags);
        }
    });
</script>