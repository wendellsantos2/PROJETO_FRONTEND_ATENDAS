<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />
            <Button
                v-if="useCheckPermissions(['create_campaign', 'update_campaign'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ campaign ? "Salvar" : "Criar" }}
            </Button>
            <Button
                v-if="!!campaign && useCheckPermissions('delete_campaign')"
                type="button"
                color="danger"
                @click="() => confirmeDelete?.toggle(true, { id: campaign!, name: data?.name })"
            >
                <Icon name="delete" />
                Deletar
            </Button>
        </LayoutPortal>

        <Vueform
            v-model="form"
            sync
            :endpoint="false"
            class="my-auto"
        >
            <TextElement
                name="name"
                label="Nome"
                placeholder="Vem ser atendas"
                rules="required|min:1"
                addClass="sm:col-span-6 lg:col-span-4"
            />

            <SelectProvider
                class="sm:col-span-6 lg:col-span-4"
            />

            <SelectTemplate
                :providerId="form?.provider_id"
                :default="data?.template?.id"
                class="sm:col-span-6 lg:col-span-4"
            />

            <SelectElement
                name="bot_id"
                label="Bot de atendimento"
                placeholder="Selecione um bot"
                :native="false"
                :search="true"
                :items="bots!"
                closeOnSelect
                addClass="sm:col-span-6 lg:col-span-4"
            />

            <DateElement
                name="scheduled_at"
                label="Data de incio"
                placeholder="00/00/0000"
                description="Ao informar uma data ele vai tornar o status como ativo na data passada"
                addClass="sm:col-span-6 lg:col-span-4"
            />

            <DateElement
                name="scheduled_until"
                label="Data de fim"
                placeholder="00/00/0000"
                description="Ao informar uma data ele vai tornar o status como desativado na data passada"
                addClass="sm:col-span-6 lg:col-span-4"
            />

            <TextareaElement
                name="description"
                label="Descrição"
                placeholder="Campanha de anúncio atendas..."
                :rows="4"
                addClass="sm:col-span-6 lg:col-span-4 row-span-3"
            />

            <div class="col-span-full flex flex-row items-center justify-between gap-2 sm:col-span-6 lg:col-span-4">
                <span>
                    Usar cadência aleatória?
                </span>
                <ToggleElement
                    name="random_cadence"
                    :labels="{ on: 'Sim', off: 'Não' }"
                    :default="false"
                    class="flex flex-none"
                />
            </div>

            <TransitionHeight mode="out-in">
                <TextElement
                    v-if="!form?.random_cadence"
                    inputType="number"
                    name="cadence"
                    label="Cadência de envio"
                    placeholder="5"
                    :addons="{
                        after: 'segundos'
                    }"
                    description="Cadências inferiores a 5 segundos são de sua responsabilidade quanto a possíveis bloqueios pelo provedor"
                    rules="required"
                    addClass="sm:col-span-6 sm:row-span-3 lg:col-span-4"
                    :addClasses="{
                        ElementDescription: {
                            container: { '!text-danger !opacity-100 transition-all': form?.cadence < 5 }
                        }
                    }"
                />
                <div
                    v-else-if="$screen.value.lg"
                    Class="row-span-3"
                />
            </TransitionHeight>

            <div class="col-span-full flex flex-row items-center justify-between gap-2 sm:col-span-6 lg:col-span-4">
                <span>
                    Usar horários de funcionamento da customizado?
                </span>
                <ToggleElement
                    name="custom_frequency"
                    :labels="{ on: 'Sim', off: 'Não' }"
                    :default="false"
                    class="flex flex-none"
                />
            </div>

            <TransitionHeight>
                <LazyWeeksFields
                    v-if="form?.custom_frequency"
                    label="horários de funcionamento"
                    name="frequency"
                    class="lg:order-last"
                />
            </TransitionHeight>

            <div class="col-span-full flex flex-row items-center justify-between gap-2 sm:col-span-6 lg:col-span-4">
                <span>
                    Pronto para funcionar?
                </span>
                <ToggleElement
                    name="status"
                    :labels="{ on: 'Sim', off: 'Não' }"
                    :default="false"
                    class="flex flex-none"
                />
            </div>
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="a campanha"
            :action="async () => await useFetchApi(`v1/campaigns/${campaign}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    import type { SelectTemplate } from "#components";
    import { symbolKey } from "../[campaign].vue";

    definePageMeta({
        title: "campanha"
    });

    const {
        campaign
    } = useRouteParams();

    const back = async () => await navigateTo("/campanhas");

    const {
        data
    } = inject(symbolKey)!;

    const form = ref({
        ...useOmit(data.value, ["provider", "template", "bot"]),
        provider_id: data.value?.provider?.id,
        template_id: data.value?.template?.id,
        bot_id: data.value?.bot?.id
    });

    const { data: bots } = useLazyAsyncData("bots:search", async () => {
        const _data = await useFetchApi("v1/bots", {
            params: {
                "filter[type]": "campaign",
                "filter[is_active]": true,
                per_page: 99
            }
        });

        return _data.data.map((v) => {
            return {
                value: v.id,
                label: v.name
            };
        });
    });

    const upSert = async () => {
        const response = await useFetchApi(`v1/campaigns/${campaign || ""}`, {
            method: campaign ? "PUT" : "POST",
            body: form.value
        });

        if (campaign) {
            await back();
        }
        else {
            await navigateTo({
                path: `/campanhas/${response.data.id}`,
                replace: true
            });
        }
    };

    const confirmeDelete = useModalConfirm();
</script>