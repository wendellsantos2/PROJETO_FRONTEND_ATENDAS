<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="useCheckPermissions(['create_application', 'update_application'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ app ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="useCheckPermissions('delete_application')"
                v-show="app"
                type="button"
                color="danger"
                @click="confirmeDelete?.toggle(true, usePick(data!, ['id', 'name']))"
            >
                <Icon name="delete" />
                Deletar
            </Button>
        </LayoutPortal>

        <Vueform
            v-model="form"
            sync
            :endpoint="false"
            class="m-auto w-full max-w-screen-xs"
        >
            <TextElement
                name="name"
                label="Nome"
                placeholder="Aplicação externa"
                rules="required|min:1"
            />
            <TextElement
                name="redirect"
                label="URL de redirecionamento"
                placeholder="https://example.com/callback"
                rules="required|min:1"
            />
            <TextareaElement
                name="description"
                label="Descrição"
                placeholder="Aplicação responsável por fazer integração com..."
                :rows="3"
                rules="required|min:1"
            />
        </Vueform>

        <ConfigsAppInfo ref="modalUse" />

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="a aplicação"
            :action="async () => await useFetchApi(`admin/companies/${company}/apps/${app}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "aplicação",
        alias: ["/adm/empresas/:company/aplicacoes/:app()"]
    });

    const { $user } = useNuxtApp();

    const {
        app,
        company = $user.value?.company.id
    } = useRouteParams({
        create: "create_application",
        update: ["read_application", "update_application"]
    });

    const modalUse = useTemplateRef("modalUse");
    const back = async () => await navigateTo("../aplicacoes");

    const form = ref<Record<string, unknown>>({});

    const { data } = await useAsyncData("app:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`admin/companies/${company}/apps/${app}`);

            form.value = _data;

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!app
    });

    const upSert = async () => {
        const response = await useFetchApi(`admin/companies/${company}/apps/${app || ""}`, {
            method: app ? "PUT" : "POST",
            body: form.value
        });

        if ("app_secret" in response) {
            modalUse.value?.toggle(true, {
                id: response.data.app_id,
                secret: response.app_secret
            });
        }

        if (!app) {
            watch(() => modalUse.value?.open, async (open) => {
                if (!open) {
                    await back();
                }
            }, {
                once: true
            });
        }
        else {
            await back();
        }
    };

    const confirmeDelete = useModalConfirm();
</script>