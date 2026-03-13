<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="useCheckPermissions(['create_provider', 'update_provider'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ provider ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="useCheckPermissions('delete_provider')"
                v-show="provider"
                type="button"
                color="danger"
                @click="confirmeDelete?.toggle(true, usePick(data!, ['id', 'name', 'service']))"
            >
                <Icon name="delete" />
                Deletar
            </Button>
        </LayoutPortal>

        <Vueform
            v-model="form"
            sync
            :endpoint="false"
            class="my-auto"
        >
            <TextElement
                name="name"
                label="Nome"
                placeholder="whatsapp"
                rules="required|min:1"
                addClass="row-span-2 sm:col-span-6 lg:col-span-4"
            />

            <SelectElement
                name="service"
                :items="availableProviders!"
                label="Provedor"
                placeholder="Selecione um provedor"
                :native="false"
                search
                :canClear="false"
                :loading="status === 'pending'"
                :default="data?.service"
                :disabled="!!provider && !replace"
                rules="required"
                addClass="row-span-2 sm:col-span-6 lg:col-span-4"
            />

            <HiddenElement
                name="type"
                :meta="true"
            />

            <TransitionHeight appear>
                <div
                    v-if="form?.type === 'message'"
                    class="col-span-full flex flex-row items-center justify-between sm:col-span-6 lg:col-span-4"
                >
                    <span>
                        Bots podem funcionar?
                    </span>
                    <ToggleElement
                        name="bot_enabled"
                        :labels="{ on: 'Sim', off: 'Não' }"
                        :default="true"
                    />
                </div>
            </TransitionHeight>

            <div class="col-span-full flex flex-row items-center justify-between sm:col-span-6 lg:col-span-4">
                <span>
                    Pronto para funcionar?
                </span>
                <ToggleElement
                    name="status"
                    :labels="{ on: 'Sim', off: 'Não' }"
                    :default="true"
                />
            </div>

            <LazyDynamicFields
                ref="dynamicFields"
                :if="!provider || replace"
                title="Credenciais"
                name="credentials"
                parameter="fields"
                :options="availableProviders"
                :selected="form?.service"
                :context="form"
                :routeReplace="{
                    company_id: company
                }"
                addClass="sm:col-span-6 lg:col-span-4"
            />

            <Notice
                type="warning"
                class="col-span-full"
            >
                <p class="m-4 text-center font-medium">
                    As credenciais não podem ser editadas após serem criadas.
                    <span v-if="provider && !replace">
                        Se desejar substituir completamente,
                        <Button
                            color="danger"
                            class="px-3"
                            size="sm"
                            @click="replace = true"
                        >
                            Clique aqui
                        </Button>
                    </span>
                </p>
            </Notice>
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="o provedor da {service}"
            :action="async () => await useFetchApi(`admin/companies/${company}/providers/${provider}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    definePageMeta({
        title: "provedor",
        alias: ["/adm/empresas/:company/provedores/:provider()"]
    });

    type Provider = InternalApi["admin/companies/:id/providers/:id"]["get"]["data"];

    const { $user } = useNuxtApp();

    const {
        provider,
        company = $user.value?.company.id
    } = useRouteParams({
        create: "create_provider",
        update: ["read_provider", "update_provider"]
    });

    const back = async () => await navigateTo("../provedores");

    const form = ref<Partial<Provider>>({});

    const { data } = await useAsyncData("provider:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`admin/companies/${company}/providers/${provider}`);

            form.value = _data;

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!provider
    });

    const replace = ref(false);

    const dynamicFields = useTemplateRef("dynamicFields");

    watch(() => dynamicFields.value?.optionSelected?.type, (_type) => {
        form.value.type = _type as Provider["type"];
    });

    const {
        data: availableProviders,
        status
    } = useLazyAsyncData("available-providers", async () => {
        return await useFetchSelect("available-providers", {
            value: "value",
            label: "label",
            fields: ["fields", "expected", "type"]
        });
    });

    const upSert = async () => {
        await useFetchApi(`admin/companies/${company}/providers/${provider || ""}`, {
            method: provider ? "PUT" : "POST",
            body: form.value
        })
            .then(async () => {
                await back();
            });
    };

    const confirmeDelete = useModalConfirm();
</script>