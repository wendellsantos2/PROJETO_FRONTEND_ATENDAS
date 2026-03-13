<template>
    <Modal
        ref="modal"
        v-slot="{ context }"
        title="Vendedor"
        size="xs"
        :contextInitial
    >
        <Vueform
            v-model="modal!.context.form"
            sync
            :endpoint="false"
            @submit="change"
        >
            <LazySelectUser
                name="user_id"
                label=""
                placeholder="Selecione um vendedor"
                :default="modal?.context.seller"
            />
            <Button
                class="col-span-full"
                :loading
                :disabled="context.seller === context.form?.user_id"
            >
                {{ context.seller ? "Alterar" : "Atribuir" }}
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
        onThen?: (contact: contact) => void
    }>();

    const contextInitial = {
        id: 0,
        seller: 0 as number | undefined,
        form: {
            user_id: 0 as number | undefined
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
        onThen?.(response.data);
    };

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>