<template>
    <div class="flex flex-col gap-6">
        <Divider>
            <template #left>
                <Vueform
                    v-model="selectedFunnelTypeTab"
                    sync
                >
                    <RadiogroupElement
                        name="read"
                        view="tabs"
                        default="stages"
                        :items="{
                            stages: 'Etapas',
                            automations: 'Automações'
                        }"
                    />
                </Vueform>
            </template>

            <template #right>
                <LazyButton
                    v-if="useCheckPermissions('create_funnel')"
                    variant="gradient"
                    @click="modalUpsert?.toggle()"
                >
                    Nova {{ selectedTypeText }}
                </LazyButton>
            </template>
        </Divider>

        <Table
            :data="selectedFunnelTypeTab.read === 'automations' ? automations : stages"
            :thead="[
                { name: 'Nome', slot: 'name' },
                { name: 'Posição', slot: 'position' }
            ]"
            :itemClick="useCheckPermissions('update_funnel') ? (item) => modalUpsert?.toggle(true, { id: item.id, form: item }) : false"
        >
            <template #name="{ name }">
                {{ name }}
            </template>
            <template #position="{ position }">
                {{ position }}
            </template>
            <template #actions="item">
                <Button
                    v-if="useCheckPermissions('create_funnel')"
                    v-tooltip="'Editar'"
                    color="background"
                    size="sm"
                    @click="modalUpsert?.toggle(true, { id: item.id, form: item })"
                >
                    <Icon name="edit" size="1.2rem" />
                </Button>

                <Button
                    v-if="useCheckPermissions('delete_funnel')"
                    v-tooltip="'Deletar'"
                    color="danger"
                    size="sm"
                    @click="confirmeDelete?.toggle(true, { ...usePick(item, ['id', 'name']) })"
                >
                    <Icon name="delete" size="1.2rem" />
                </Button>
            </template>
        </Table>

        <LazyModal
            ref="modalUpsert"
            :title="`${modalUpsert?.context.id ? 'editar' : 'criar'} ${selectedTypeText}`"
            size="xs"
            :contextInitial
        >
            <Vueform
                v-model="modalUpsert!.context.form"
                sync
                :endpoint="false"
                @submit="() => modalupSert()"
            >
                <TextElement
                    name="name"
                    label="Nome"
                    placeholder="Atendimento"
                    rules="required|min:1"
                />

                <TextElement
                    inputType="number"
                    name="position"
                    label="Posição"
                    placeholder="1"
                    default="1"
                    min="1"
                    rules="required|min:1"
                />

                <Button class="col-span-full" :loading>
                    <Icon name="upload" />
                    Salvar
                </Button>
            </Vueform>
        </LazyModal>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            :the="`a ${selectedTypeText}`"
            complement=""
            :action="async ({ id }) => await useFetchApi(`v1/funnels/${funnelId}/funnel/${id}`, {
                method: 'delete'
            })"
            @then="emits('refresh')"
        />
    </div>
</template>

<script setup lang="ts">
    const props = defineProps<{
        funnelId: number | null
    }>();

    const selectedFunnelTypeTab = ref<Record<string, string>>({});
    const selectedTypeText = computed(() => selectedFunnelTypeTab.value.read === "automations" ? "automação" : "etapa");
    const modalUpsert = useModal<typeof contextInitial>();
    const confirmeDelete = useModalConfirm();
    const contextInitial = {
        id: 0,
        form: {} as Record<string, unknown>
    };

    const emits = defineEmits<{
        refresh: []
    }>();

    const { data: stages, refresh: refreshStages } = await useAsyncData("funnels:stages", async () => {
        const { data } = await useFetchApi(`v1/funnels/${props.funnelId}/stages`);
        return data;
    });

    const { data: automations, refresh: refreshAutomations } = await useAsyncData("funnels:automations", async () => {
        const { data } = await useFetchApi(`v1/funnels/${props.funnelId}/automations`);
        return data;
    });

    const loading = ref(false);

    const modalupSert = async (_id?: number, body?: Partial<{ id: number, name: string }>) => {
        loading.value = true;

        const thatId = _id ?? modalUpsert.value?.context.id;
        const thatBody = body ?? modalUpsert.value?.context.form;

        // TODO: Passar trigger_event e dispatch_action quando for automation
        await useFetchApi(`v1/funnels/${props.funnelId}/${selectedFunnelTypeTab.value.read}/${thatId || ""}`, {
            method: thatId ? "PUT" : "POST",
            body: thatBody
        })
            .then(() => {
                modalUpsert.value?.toggle(false);

                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                selectedFunnelTypeTab.value.read === "automations" ? refreshAutomations() : refreshStages();
                emits("refresh");
            })
            .finally(() => {
                loading.value = false;
            });
    };
</script>