<template>
    <Modal
        ref="modal"
        v-slot="{ context }"
        title="atendente"
        size="xs"
        classBackdrop="z-[9999]"
        :contextInitial
    >
        <Vueform
            v-model="modal!.context.form"
            sync
            :endpoint="false"
            @submit="changeAttendant"
        >
            <LazySelectUser
                name="attendant_id"
                label=""
                placeholder="Selecione um atendente"
                :default="modal?.context.attendant"
            />
            <Button
                class="col-span-full"
                :loading
                :disabled="context.attendant === context.form?.attendant_id"
            >
                <template v-if="context.attendant">
                    <Icon name="change" size="1.5rem" />
                    Alterar
                </template>
                <template v-else>
                    <Icon name="support" size="1.5rem" />
                    Atribuir
                </template>
            </Button>
        </Vueform>
    </Modal>
</template>

<script setup lang="ts">
    const emits = defineEmits<{
        then: []
    }>();

    const contextInitial = {
        id: 0,
        attendant: 0 as number | undefined,
        form: {} as Record<string, any>
    };

    const modal = useModal<typeof contextInitial>();
    const loading = ref(false);

    const changeAttendant = async () => {
        loading.value = true;

        await useFetchApi(`v1/conversations/${modal.value?.context.id}/change-attendant`, {
            method: "PUT",
            body: modal.value?.context.form
        })
            .finally(() => {
                loading.value = false;
            });

        modal.value?.toggle(false);
        emits("then");
    };

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>