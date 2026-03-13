<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ mail ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="mail && useCheckPermissions('delete_mail_template')"
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
        >
            <TextElement
                name="name"
                label="Nome"
                placeholder="Boas vindas"
                rules="required|min:1"
                addClass="md:col-span-6"
            />
            <TextElement
                name="subject"
                label="Assunto"
                placeholder="Seja bem-vindo à equipe Atendas!"
                rules="required|min:1"
                addClass="md:col-span-6"
            />
            <EditorHtmlElement
                name="html_template"
                label="Modelo HTML"
                :addClasses="{
                    ElementLayout: {
                        innerWrapper: ['*:min-h-[calc(78vh-6rem)]']
                    }
                }"
                rules="required|min:100"
            />
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="o modelo"
            :action="async () => await useFetchApi(`v1/mail-templates/${mail}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "E-mail",
        permissions: "provider:smtp"
    });

    const {
        mail
    } = useRouteParams({
        create: "create_mail_template",
        update: ["read_mail_template", "update_mail_template"]
    });

    const back = async () => await navigateTo("/emails");

    const form = ref<Record<string, any>>({});

    const { data } = await useAsyncData("email:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v1/mail-templates/${mail}`);

            form.value = _data;

            return _data;
        }
        catch {
            await back();
        }
    }, {
        server: false,
        immediate: !!mail
    });

    const upSert = async () => {
        await useFetchApi(`v1/mail-templates/${mail || ""}`, {
            method: mail ? "PUT" : "POST",
            body: useOmitBy(form.value, v => [null, undefined].includes(v))
        })
            .then(async () => {
                await back();
            });
    };

    const confirmeDelete = useModalConfirm();
</script>