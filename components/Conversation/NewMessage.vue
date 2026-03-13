<template>
    <LazyModal
        ref="modal"
        v-slot="{ context }"
        title="Enviar Mensagem"
        size="xs"
        :contextInitial
    >
        <Vueform
            v-model="modal!.context.form"
            sync
            :endpoint="false"
            @submit="send"
        >
            <SelectProvider
                ref="selectProvider"
                class="col-span-full"
            />

            <HiddenElement
                v-if="context?.name"
                name="name"
                :meta="true"
            />

            <TextElement
                v-else
                name="name"
                label="Nome"
                placeholder="Amorin silva"
                :disabled="!!context?.name"
                rules="required"
            />

            <HiddenElement
                v-if="context?.recipient"
                name="recipient"
                :meta="true"
            />

            <TransitionOpacity v-else mode="out-in">
                <TextElement
                    v-if="context?.service_type === 'messenger'"
                    name="recipient"
                    label="@ do usuário"
                    placeholder="amorin_silva"
                    rules="required"
                />
                <InputPhone
                    v-else
                    name="recipient"
                    label="Telefone"
                    rules="required"
                />
            </TransitionOpacity>

            <SelectTemplate
                ref="selectTemplate"
                :providerId="context?.form?.provider_id"
            />

            <TransitionHeight mode="out-in">
                <ObjectElement
                    v-if="selectTemplate?.selected?.parameters?.length"
                    :key="selectTemplate?.selected?.id"
                    name="parameters"
                    label="Variáveis do template"
                >
                    <TextElement
                        v-for="(parameter) in selectTemplate?.selected?.parameters"
                        :key="parameter"
                        :name="parameter"
                        :placeholder="parameter"
                        :floating="parameter"
                        rules="required|min:1"
                    />
                </ObjectElement>
            </TransitionHeight>

            <Button
                class="col-span-full"
                :loading
            >
                <Icon name="send" size="1.5rem" />
                Enviar mensagem
            </Button>
        </Vueform>
    </LazyModal>
</template>

<script setup lang="ts">
    import type { SelectProvider, SelectTemplate } from "#components";

    const contextInitial = ref<{
        id: number
        services: Record<string, string> | null
        name: string | null
        phone: string | null
        country_code: string | null
        service_type?: string
        recipient?: string
        form: Record<string, unknown>
    }>({
        id: 0,
        services: null,
        name: null,
        phone: null,
        country_code: null,
        form: {}
    });

    const modal = useModal<typeof contextInitial["value"]>();
    const selectTemplate = ref<InstanceType<typeof SelectTemplate>>();
    const selectProvider = ref<InstanceType<typeof SelectProvider>>();

    watch([
        () => selectProvider.value?.selected,
        () => modal.value?.context.services
    ], ([selected, services]) => {
        contextInitial.value.form.provider_id = selectProvider.value?.selected?.id;

        if (services) {
            const serviceType = selected?.service?.split("-")?.at(0) ?? "";
            modal.value!.context.service_type = serviceType;

            const recipient = services?.[serviceType] ?? "";

            modal.value!.context.recipient = recipient;
            modal.value!.context.form.recipient = recipient;
        }

        if (!modal.value!.context.recipient) {
            modal.value!.context.form.recipient = modal.value!.context.phone;
            modal.value!.context.form.country_code = modal.value!.context.country_code;
        }
    });

    whenever(() => modal.value?.context.name, (name) => {
        modal.value!.context.form.name = name;
    });

    const loading = ref(false);

    const send = async () => {
        loading.value = true;

        const response = await useFetchApi("v1/messages", {
            method: "POST",
            body: {
                ...modal.value?.context?.form,
                type: "template"
            }
        })
            .finally(() => {
                loading.value = false;
            });

        if (response.data?.conversation?.id) {
            await navigateTo({
                path: "/mensagens",
                query: {
                    id: response.data.conversation.id
                }
            });
        }

        modal.value?.toggle(false);
    };

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>