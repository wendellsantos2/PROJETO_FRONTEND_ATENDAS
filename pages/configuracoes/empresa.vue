<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <Button
                v-if="useCheckPermissions(['update_company', 'manager_company'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ company ? "Salvar" : "Criar" }}
            </Button>
            <Button
                v-if="company && company !== $user.value?.company.id && useCheckPermissions('delete_company')"
                type="button"
                color="danger"
                @click="confirmeDelete?.toggle(true, { id: company, name: data?.name })"
            >
                <Icon name="delete" />
                Deletar
            </Button>
        </LayoutPortal>

        <Vueform
            v-model="form"
            sync
            :endpoint="false"
            class="w-full"
            @submit="upSert"
        >
            <TextElement
                name="name"
                label="Nome"
                placeholder="Atendas"
                rules="required|min:1"
                addClass="sm:col-span-6"
            />

            <TextElement
                v-maska="'##.###.###/####-##'"
                name="document"
                label="CNPJ"
                placeholder="##.###.###/####-##"
                addClass="sm:col-span-6"
                :disabled="!useCheckPermissions('update_company')"
            />

            <WeeksFields
                label="horários de funcionamento"
                name="business_hours"
            />

            <ObjectElement name="settings">
                <Divider
                    title="Mensageria"
                    class="col-span-full"
                />

                <TextElement
                    v-maska="'##:##'"
                    name="conversation_inactivity_time"
                    label="Tempo de inatividade"
                    placeholder="12:00"
                    rules="required|min:1"
                    addClass="md:col-span-6 xl:col-span-4 row-span-2"
                    :addons="{
                        after: 'Minutos'
                    }"
                />

                <TextElement
                    name="conversation_inactivity_message"
                    label="Mensagem de inatividade"
                    placeholder="Ainda está ai?"
                    addClass="md:col-span-6 xl:col-span-4 row-span-2"
                />

                <div class="col-span-full flex flex-row items-center justify-between gap-4 md:col-span-6 xl:col-span-4">
                    <span>
                        Janela de inatividade funcionando?
                    </span>
                    <ToggleElement
                        name="conversation_inactivity_active"
                        :default="false"
                        :labels="{ on: 'Sim', off: 'Não' }"
                    />
                </div>

                <div class="col-span-full flex flex-row items-center justify-between gap-4 md:col-span-6 xl:col-span-4">
                    <span>
                        Mostrar nome do atendente?
                    </span>
                    <ToggleElement
                        name="message_add_attendant_name"
                        :default="false"
                        :labels="{ on: 'Sim', off: 'Não' }"
                        addClass="col-span-4"
                    />
                </div>

                <div class="col-span-full flex flex-row items-center justify-between gap-4 md:col-span-6 xl:col-span-4">
                    <span>
                        Distribuir conversas automaticamente?
                    </span>
                    <ToggleElement
                        name="conversation_distribution_enabled"
                        :default="false"
                        :labels="{ on: 'Sim', off: 'Não' }"
                        addClass="col-span-4"
                    />
                </div>

                <div
                    v-if="useCheckPermissions(['create_provider', 'update_provider'])"
                    class="col-span-full flex flex-row items-center justify-between gap-4 md:col-span-6 xl:col-span-4"
                >
                    <span>
                        Transcrever audios?
                    </span>
                    <ToggleElement
                        name="transcription_enabled"
                        :default="false"
                        :labels="{ on: 'Sim', off: 'Não' }"
                        addClass="col-span-4"
                    />
                </div>
            </ObjectElement>

            <ObjectElement
                v-if="!company"
                name="user"
            >
                <div class="col-span-full flex flex-row items-center gap-4 py-6">
                    <h4 class="font-medium">
                        Usuário administrador
                    </h4>
                    <hr class="grow">
                </div>

                <TextElement
                    name="name"
                    label="Nome"
                    placeholder="Ryan santos"
                    rules="required|min:1"
                    addClass="sm:col-span-6 xl:col-span-3"
                />

                <TextElement
                    name="email"
                    label="E-mail"
                    placeholder="email@exemple.com"
                    rules="required|email"
                    addClass="sm:col-span-6 xl:col-span-3"
                />

                <TextElement
                    autocomplete="new-password"
                    name="password"
                    label="Senha"
                    placeholder="********"
                    rules="confirmed|min:8"
                    addClass="sm:col-span-6 xl:col-span-3"
                />

                <TextElement
                    autocomplete="new-password"
                    name="password_confirmation"
                    label="Confirme a senha"
                    placeholder="********"
                    rules="min:8"
                    addClass="sm:col-span-6 xl:col-span-3"
                />
            </ObjectElement>
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="a empresa"
            :action="async () => await useFetchApi(`admin/companies/${company}`, {
                method: 'delete'
            })"
            @then="navigateTo('/adm/empresas')"
        />
    </Container>
</template>

<script setup lang="ts">
    import { vMaska } from "maska/vue";

    definePageMeta({
        alias: ["/adm/empresas/:company"],
        navOrder: 10,
        permissions: ["manager_company", "read_company"]
    });

    const { $user } = useNuxtApp();

    const {
        company = $user.value?.company.id
    } = useRouteParams({
        create: ["manager_company", "create_company"],
        update: ["manager_company", "read_company", "update_company"]
    });

    const form = ref<Record<string, unknown>>({});

    const {
        data,
        refresh,
        error
    } = await useAsyncData("companies:id", async () => {
        const { data: _data } = await useFetchApi(`admin/companies/${company}`);

        form.value = {
            ..._data,
            document_number: _data.document
        };

        return _data;
    }, {
        immediate: !!company
    });

    if (error.value) {
        throw useOmit(error.value, ["message"]);
    }

    const upSert = async () => {
        await useFetchApi(`admin/companies/${company || ""}`, {
            method: company ? "PUT" : "POST",
            body: {
                ...form.value,
                document_number: form.value?.document_number || null
            }
        })
            .then(async (res) => {
                if (company) {
                    await refresh();
                }
                else {
                    await navigateTo(`/adm/empresas/${res.data.id}`);
                }
            });
    };

    const confirmeDelete = useModalConfirm();
</script>