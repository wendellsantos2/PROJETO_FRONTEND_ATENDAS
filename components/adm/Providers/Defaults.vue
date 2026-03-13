<template>
    <div>
        <LazyButton
            v-tooltip="'Configurar valores padrão'"
            color="quarter"
            size="sm"
            @click="modal?.toggle(true, { id: 0, form: props.provider.metadata?.defaults ?? {} })"
        >
            <Icon name="gear" size="1.2rem" />
        </LazyButton>

        <LazyModal
            ref="modal"
            title="valores padrão"
            size="xs"
            :contextInitial
        >
            <Vueform
                v-model="modal!.context.form"
                sync
                :endpoint="false"
                @submit="submit"
            >
                <slot />

                <Button class="col-span-full" :loading>
                    <Icon name="upload" />
                    Salvar
                </Button>
            </Vueform>
        </LazyModal>
    </div>
</template>

<script setup lang="ts" generic="R extends NitroFetchRequest">
    import type { InternalApi, NitroFetchRequest } from "nitropack/types";

    const props = defineProps<{
        provider: InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]
        request: R
    }>();

    const emits = defineEmits<{
        then: []
    }>();

    const contextInitial = {
        id: 0,
        form: props.provider.metadata?.defaults ?? {}
    };

    const modal = useModal<typeof contextInitial>();
    const loading = ref(false);

    const submit = async () => {
        loading.value = true;

        await useFetchApi<unknown>(props.request, {
            method: "POST",
            body: modal.value?.context.form
        })
            .finally(() => {
                loading.value = false;
            })
            .then(() => {
                modal.value?.toggle(false);
                emits("then");
            });
    };
</script>