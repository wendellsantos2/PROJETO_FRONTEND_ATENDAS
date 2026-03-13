<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="useCheckPermissions(['create_team', 'update_team'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ team ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="useCheckPermissions('delete_team')"
                v-show="team"
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
                placeholder="Equipe padrão"
                rules="required|min:1"
            />
            <SelectColor
                default="#ffdd00"
                :description="form?.color"
            />
            <TextareaElement
                name="description"
                label="Descrição"
                placeholder="Equipe responsável pelo gerenciamento dos bots"
                :rows="3"
                rules="required|min:1"
            />
            <div class="col-span-full flex flex-row items-center justify-between">
                <span>
                    Função de janela de inatividade
                </span>
                <ToggleElement
                    name="inactivity_enabled"
                    :labels="{ on: 'Sim', off: 'Não' }"
                />
            </div>
            <TransitionHeight>
                <FormElements
                    v-if="form?.inactivity_enabled"
                    class="col-span-full"
                >
                    <TextElement
                        name="inactivity_time"
                        inputType="number"
                        label="Janela de inatividade"
                        placeholder="12"
                        :default="data?.inactivity_time || 0"
                        rules="required|numeric|min:5|max:60"
                        :addons="{
                            after: 'Minutos'
                        }"
                    />
                    <TextElement
                        name="inactivity_message"
                        label="Mensagem de inatividade"
                        placeholder="Oi! Você ainda está por aqui?"
                        :default="data?.inactivity_message || ''"
                        rules="required|min:5"
                    />
                </FormElements>
            </TransitionHeight>
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="a equipe"
            :action="async () => await useFetchApi(`v1/teams/${team}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "equipe"
    });

    const {
        team
    } = useRouteParams({
        create: "create_team",
        update: ["read_team", "update_team"]
    });

    const back = async () => await navigateTo("../equipes");

    const form = ref<Record<string, unknown>>({});

    const { data } = await useAsyncData("team:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v1/teams/${team}`);

            form.value = _data;

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!team
    });

    const upSert = async () => {
        await useFetchApi(`v1/teams/${team || ""}`, {
            method: team ? "PUT" : "POST",
            body: form.value
        })
            .then(async () => {
                await back();
            });
    };

    const confirmeDelete = useModalConfirm();
</script>