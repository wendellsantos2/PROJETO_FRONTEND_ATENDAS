<template>
    <Modal
        ref="modal"
        v-slot="{ context }"
        title="CRM Funil"
        size="xs"
        :contextInitial
    >
        <Vueform
            v-model="modal!.context.form"
            sync
            :endpoint="false"
            @submit="change"
        >
            <SelectElement
                name="funnel_id"
                label="Funil"
                placeholder="Selecione uma funil"
                search
                :canClear="false"
                :delay="1000"
                :items="(name: string) => useFetchSelect(`v1/funnels`, {
                    filters: { name }
                })"
                :default="modal?.context.funnel_id"
                rules="required"
            />
            <TransitionHeight mode="out-in">
                <SelectElement
                    v-if="modal?.context.form.funnel_id"
                    :key="modal?.context.form.funnel_id"
                    name="stage_id"
                    label="Etapa"
                    placeholder="Selecione uma etapa"
                    search
                    :canClear="false"
                    :delay="1000"
                    :items="(name: string) => useFetchSelect(`v1/funnels/${modal?.context.form.funnel_id}/stages`, {
                        filters: { name }
                    })"
                    :default="modal?.context.stage_id"
                    rules="required"
                />
            </TransitionHeight>
            <Button
                class="col-span-full"
                :loading
                :disabled="context.funnel_id === context.form?.funnel_id && context.stage_id === context.form?.stage_id"
            >
                {{ context.funnel_id ? "Alterar" : "Atribuir" }}
            </Button>
        </Vueform>
    </Modal>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    type contact = InternalApi["v1/contacts/:id"]["get"]["data"];

    const {
        onThen
    } = defineProps<{
        onThen?: (contact: contact, old: { funnel_id: number | undefined, stage_id: number | undefined }) => void
    }>();

    const contextInitial = {
        id: 0,
        funnel_id: 0 as number | undefined,
        stage_id: 0 as number | undefined,
        form: {
            funnel_id: 0 as number | undefined,
            stage_id: 0 as number | undefined
        }
    };

    const modal = useModal<typeof contextInitial>();
    const loading = ref(false);

    const change = async () => {
        loading.value = true;

        const response = await useFetchApi(`v1/contacts/${modal.value?.context.id}`, {
            method: "PUT",
            body: modal.value?.context.form
        })
            .finally(() => {
                loading.value = false;
            });

        modal.value?.toggle(false);
        onThen?.(response.data, {
            funnel_id: modal.value?.context.funnel_id,
            stage_id: modal.value?.context.stage_id
        });
    };

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>