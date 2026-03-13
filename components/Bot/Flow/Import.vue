<template>
    <Modal
        ref="modal"
        v-slot="{ context }"
        title="Importar"
        size="xs"
        :contextInitial
    >
        <Vueform
            v-model="modal!.context.form"
            sync
            :endpoint="false"
            @submit="submit"
        >
            <VFileElement
                name="bot_file"
                accept=".json"
                raw
            />
            <LazyNotice
                type="warning"
                :title="false"
                description="Ao importar o arquivo, você estará substituindo o fluxo atual. Isso significa que todo o fluxo atual será excluído."
                class="col-span-full"
            />
            <Button
                color="secondary"
                :loading="context.loading"
                class="col-span-full"
            >
                Importar
            </Button>
        </Vueform>
    </Modal>
</template>

<script setup lang="ts">
    const props = defineProps<{
        botId: number
        length: number
    }>();

    const emits = defineEmits<{
        refresh: []
    }>();

    const contextInitial = {
        id: 0,
        loading: false,
        form: {}
    };

    const modal = useModal<typeof contextInitial>();

    const submit = async () => {
        modal.value!.context.loading = true;

        await useFetchApi(`v1/bots/${props.botId}/import`, {
            method: "POST",
            body: useFormData(modal.value!.context.form)
        })
            .then(() => {
                refresh();
            })
            .catch(() => {
                modal.value!.context.loading = false;
            });
    };

    const refresh = async () => {
        emits("refresh");

        await new Promise(resolve => setTimeout(resolve, 2000));

        if (props.length) {
            modal.value!.toggle(false);
        }
        else {
            await new Promise(resolve => setTimeout(resolve, 3000));
            refresh();
        }
    };

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>