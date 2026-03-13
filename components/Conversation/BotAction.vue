<template>
    <Modal
        ref="modal"
        v-slot="{ context }"
        title="Ação de bot"
        size="xs"
        :contextInitial
    >
        <Vueform
            v-model="modal!.context.form"
            sync
            :endpoint="false"
            class="w-full"
            @submit="submit()"
        >
            <SelectElement
                name="action"
                :items="options!"
                label="Ação"
                placeholder="Selecione uma ação"
                :native="false"
                search
                :loading="pending"
                default="default_pending_for_company"
                rules="required"
                class="nowheel"
            />
            <DynamicFields
                name="parameters"
                :options
                parameter="expected"
                :selected="context.form?.action"
                :context="modal!.context.form"
                labels
            />
            <Button
                class="col-span-full"
                :loading
            >
                Executar
            </Button>
        </Vueform>
    </Modal>
</template>

<script setup lang="ts">
    const contextInitial = {
        id: 0,
        form: {
            action: ""
        } as {
            action?: string
        }
    };

    const modal = useModal<typeof contextInitial>();

    const emits = defineEmits<{
        then: []
        finally: []
    }>();

    const { $user } = useNuxtApp();

    const { data: options, pending } = useLazyAsyncData("bots:actions", async () => {
        const _data = await useFetchApi(`v1/companies/${$user.value?.company.id}/settings/bots/actions`);

        return useMap(_data.data, ({ action, label, expected }) => {
            return {
                value: action,
                label,
                expected
            };
        });
    });

    const loading = ref(false);

    const submit = async () => {
        loading.value = true;

        await useFetchApi(`v1/conversations/${modal.value!.context!.id}`, {
            method: "PUT",
            body: modal.value!.context!.form
        })
            .finally(() => {
                loading.value = false;
                emits("finally");
            });

        modal.value?.toggle(false);
        emits("then");
    };

    defineExpose({
        open: modal.value?.open,
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>