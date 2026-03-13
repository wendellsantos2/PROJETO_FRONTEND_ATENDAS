<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="useCheckPermissions(['create_template', 'update_template'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ template ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="useCheckPermissions('delete_template')"
                v-show="template"
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
                placeholder="Atendimento Inicial"
                rules="required|min:1"
            />
            <TextareaElement
                name="content"
                label="Mensagem"
                placeholder="Seja bem-vindo(a)! Estamos aqui para ajudar"
                :rows="3"
                rules="required|min:1"
            />
            <VFileElement
                ref="file"
                label="Aquivo"
                name="upload_id"
            />
            <div class="col-span-full flex flex-row items-center justify-between">
                <span>
                    Pronto para funcionar?
                </span>
                <ToggleElement
                    name="is_active"
                    :labels="{ on: 'Sim', off: 'Não' }"
                    :default="true"
                />
            </div>
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="o modelo de mensagem"
            :action="async ({ id }) => await useFetchApi(`v1/templates/${id}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    import type { File } from "#components";
    import type { ComponentExposed } from "~/types";

    definePageMeta({
        title: "modelo"
    });

    const {
        template
    } = useRouteParams({
        create: "create_template",
        update: ["read_template", "update_template"]
    });

    const back = async () => await navigateTo("../modelos");

    const form = ref<Record<string, unknown>>({});

    const { data } = await useAsyncData("template:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v1/templates/${template}`);

            form.value = {
                ...useOmit(_data, ["media"]),
                upload_id: _data.media?.id
            };

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!template
    });

    const file = useTemplateRef<{ file: ComponentExposed<typeof File> }>("file");

    const upSert = async () => {
        await useFetchApi(`v1/templates/${template || ""}`, {
            method: template ? "PUT" : "POST",
            body: {
                ...form.value,
                type: file.value?.file.upload.type || "text"
            }
        });

        await back();
    };

    const confirmeDelete = useModalConfirm();
</script>