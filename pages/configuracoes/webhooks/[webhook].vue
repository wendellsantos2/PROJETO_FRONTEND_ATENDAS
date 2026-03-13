<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="useCheckPermissions(['create_webhook', 'update_webhook'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ webhook ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="useCheckPermissions('delete_webhook')"
                v-show="webhook"
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
                name="url"
                label="Url"
                placeholder="https://example.com/callback"
                rules="required|min:1"
            />
            <TextElement
                name="secret"
                label="Segredo"
                placeholder="*#*#*#*#*#*#*"
            />
            <LazyFieldsMapping />
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="o webhook"
            :action="async () => await useFetchApi(`admin/companies/${company}/webhooks/${webhook}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "webhook",
        alias: ["/adm/empresas/:company/webhooks/:webhook()"]
    });

    const { $user } = useNuxtApp();

    const {
        webhook,
        company = $user.value?.company.id
    } = useRouteParams({
        create: "create_webhook",
        update: ["read_webhook", "update_webhook"]
    });

    const back = async () => await navigateTo("../webhooks");

    const form = ref<Record<string, unknown>>({});

    const { data } = await useAsyncData("webhook:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`admin/companies/${company}/webhooks/${webhook}`);

            form.value = _data;

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!webhook
    });

    const upSert = async () => {
        await useFetchApi(`admin/companies/${company}/webhooks/${webhook || ""}`, {
            method: webhook ? "PUT" : "POST",
            body: form.value
        })
            .then(async () => {
                await back();
            });
    };

    const confirmeDelete = useModalConfirm();
</script>