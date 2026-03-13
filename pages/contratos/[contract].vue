<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="useCheckPermissions(['create_contract_template', 'update_contract_template'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ contract ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="useCheckPermissions('delete_contract_template')"
                v-show="contract"
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
                placeholder="Contrato de adesão"
                rules="required|min:1"
            />
            <TextareaElement
                name="description"
                label="Descrição"
                placeholder="Contratos de prestação de serviços"
                :rows="3"
            />
            <template v-if="!contract">
                <VFileElement
                    label="Logo"
                    name="logo"
                    accept="image/*"
                    raw
                    rules="required|min:1"
                />
                <VFileElement
                    label="Contrato"
                    name="file"
                    accept="pdf"
                    raw
                    rules="required|min:1"
                />
            </template>
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="o modelo de contrato"
            :action="async () => await useFetchApi(`connectasign/contract-templates/${contract}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "contrato",
        permissions: "provider:sign"
    });

    const {
        contract
    } = useRouteParams({
        create: "create_contract_template",
        update: ["read_contract_template", "update_contract_template"]
    });

    const back = async () => await navigateTo("/contratos");

    const form = ref<Record<string, unknown>>({});

    const { data } = await useAsyncData("contract:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`connectasign/contract-templates/${contract}`);

            form.value = _data;

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!contract
    });

    const upSert = async () => {
        await useFetchApi(`connectasign/contract-templates/${contract || ""}`, {
            method: contract ? "PUT" : "POST",
            body: contract ? form.value : useFormData(form.value)
        });

        await back();
    };

    const confirmeDelete = useModalConfirm();
</script>