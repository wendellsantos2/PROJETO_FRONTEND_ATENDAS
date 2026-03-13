<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="!note"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                Criar
            </Button>
        </LayoutPortal>

        <Vueform
            v-model="form"
            sync
            :endpoint="false"
            class="m-auto w-full max-w-screen-xs"
        >
            <TextareaElement
                name="content"
                label="Descrição"
                placeholder="Esse contato ..."
                rules="required|min:1"
            />
        </Vueform>
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "observação"
    });

    const {
        contact,
        note
    } = useRouteParams({
        create: "update_contact",
        update: "update_contact"
    });

    const back = async () => await navigateTo("../observacoes");

    const {
        data: form
    } = await useAsyncData("contact:note:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v1/contacts/${contact}/notes/${note}`);

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!note
    });

    const upSert = async () => {
        await useFetchApi(`v1/contacts/${contact}/notes/${note || ""}`, {
            method: note ? "PUT" : "POST",
            body: form.value
        })
            .then(async () => {
                await back();
            });
    };
</script>