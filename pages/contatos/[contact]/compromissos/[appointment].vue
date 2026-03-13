<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="useCheckPermissions(['create_contact', 'update_contact'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ appointment ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="useCheckPermissions('delete_contact')"
                v-show="appointment"
                type="button"
                color="danger"
                @click="confirmeDelete?.toggle(true, usePick(data!, ['id', 'title']))"
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
                name="title"
                label="Titulo"
                placeholder="Isso e uma compromisso"
                rules="required|min:1"
            />

            <TextareaElement
                name="description"
                label="Descrição"
                placeholder="Esse compromisso ..."
            />

            <DateElement
                name="start_in"
                label="Começa em"
                placeholder="00/00/0000"
                :hour24="true"
                :time="true"
                rules="required"
            />

            <DateElement
                name="finish_in"
                label="Termina em"
                placeholder="00/00/0000"
                :hour24="true"
                :time="true"
            />
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            complement="a compromisso #{id} {title}"
            :action="async ({ id }) => await useFetchApi(`v1/contacts/${contact}/appointments/${id}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "compromisso"
    });

    const {
        contact,
        appointment
    } = useRouteParams({
        create: "create_contact",
        update: ["read_contact", "update_contact"]
    });

    const back = async () => await navigateTo("../compromissos");

    const form = ref<Record<string, unknown>>({});

    const localDateISO = <D extends string | null> (utcDate: D) => {
        if (!utcDate) {
            return utcDate;
        }

        const localDate = new Date(utcDate);
        const timezoneOffset = localDate.getTimezoneOffset() * 60000;

        return new Date(localDate.getTime() - timezoneOffset).toISOString().slice(0, -1);
    };

    const { data } = await useAsyncData("contact:appointment:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v1/contacts/${contact}/appointments/${appointment}`);

            form.value = {
                ..._data,
                start_in: localDateISO(_data.start_in),
                finish_in: localDateISO(_data.finish_in)
            };

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!appointment
    });

    const upSert = async () => {
        await useFetchApi(`v1/contacts/${contact}/appointments/${appointment || ""}`, {
            method: appointment ? "PUT" : "POST",
            body: form.value
        })
            .then(async () => {
                await back();
            });
    };

    const confirmeDelete = useModalConfirm();
</script>