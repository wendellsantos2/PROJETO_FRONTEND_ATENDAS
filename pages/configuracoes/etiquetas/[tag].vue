<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="useCheckPermissions(['create_tag', 'update_tag'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ tag ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="useCheckPermissions('delete_tag')"
                v-show="tag"
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
                placeholder="parceiro"
                rules="required|min:1"
            />

            <SelectElement
                name="type"
                label="Tipo"
                placeholder="Selecione um tipo"
                :native="false"
                :items="types!"
                closeOnSelect
                rules="required"
            />

            <SelectColor
                default="#ff6600"
                :description="form?.color"
            />
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="a etiqueta"
            :action="async () => await useFetchApi(`v1/tags/${tag}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "etiqueta"
    });

    const {
        tag
    } = useRouteParams({
        create: "create_tag",
        update: ["read_tag", "update_tag"]
    });

    const back = async () => await navigateTo("../etiquetas");

    const form = ref<Record<string, unknown>>({});

    const { data } = await useAsyncData("tag:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v1/tags/${tag}`);

            form.value = _data;

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!tag
    });

    const { $user } = useNuxtApp();

    const { data: types } = useLazyAsyncData("tags:types", async () => {
        return async () => await useFetchSelect(`v1/companies/${$user.value?.company.id}/settings/tags/types`, {
            fields: false
        });
    });

    const upSert = async () => {
        await useFetchApi(`v1/tags/${tag || ""}`, {
            method: tag ? "PUT" : "POST",
            body: form.value
        })
            .then(async () => {
                await back();
            });
    };

    const confirmeDelete = useModalConfirm();
</script>