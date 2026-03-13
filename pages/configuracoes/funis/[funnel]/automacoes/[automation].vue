<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="useCheckPermissions(['create_automation', 'update_automation'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ automation ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="useCheckPermissions('delete_automation')"
                v-show="automation"
                type="button"
                color="danger"
                @click="confirmeDelete?.toggle(true, usePick(data!, ['id']))"
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
            <HiddenElement
                name="automationable_type"
                default="stage"
                meta
            />
            <SelectElement
                ref="automationableElement"
                name="automationable_id"
                label="Etapa"
                placeholder="Selecione uma etapa"
                search
                :canClear="false"
                :delay="1000"
                :items="(name: string) => useFetchSelect(`v1/funnels/${funnel}/stages`, {
                    filters: { name }
                })"
                addClass="sm:col-span-6 xl:col-span-4"
                rules="required"
            />
            <SelectElement
                name="trigger_event"
                label="Evento"
                placeholder="Selecione um evento"
                search
                :canClear="false"
                :items="settings?.triggers"
                valueProp="name"
                labelProp="title"
                :native="false"
                addClass="sm:col-span-6 xl:col-span-4"
                rules="required"
            />

            <TextElement
                name="dispatch_delay"
                inputType="number"
                label="Intervalo"
                placeholder="0"
                :default="0"
                rules="numeric"
                :addons="{
                    after: 'Segundos'
                }"
                addClass="sm:col-span-6 xl:col-span-4"
            />

            <div class="col-span-full grid grid-cols-12 content-center items-center gap-4">
                <SelectElement
                    name="dispatch_action"
                    label="Ação"
                    placeholder="Selecione um ação"
                    search
                    :canClear="false"
                    :items="settings?.actions"
                    valueProp="name"
                    labelProp="title"
                    :native="false"
                    addClass="sm:col-span-6 xl:col-span-4"
                    rules="required"
                />
                <hr class="mt-6 hidden sm:col-span-6 sm:block xl:col-span-8">
            </div>

            <HiddenElement
                name="payload_action"
                meta
            />

            <LazyDynamicFields
                name="payload_action"
                :options="[{
                    value: 'true',
                    label: 'nada',
                    payload: settings?.actions?.find(({ name }) => name === form.dispatch_action)?.expected
                }]"
                selected="true"
                parameter="payload"
                :routeReplace="{
                    funnel_id: funnel
                }"
                addClass="sm:col-span-6 xl:col-span-4"
            />

            <div class="col-span-full grid grid-cols-12 items-center gap-4">
                <SelectElement
                    name="dispatch_condition"
                    label="Condição"
                    placeholder="Selecione uma condição"
                    search
                    :canClear="false"
                    :items="settings?.conditions"
                    valueProp="name"
                    labelProp="title"
                    :native="false"
                    addClass="sm:col-span-6 xl:col-span-4"
                />
                <hr class="mt-6 hidden sm:col-span-6 sm:block xl:col-span-8">
            </div>

            <HiddenElement
                name="payload_condition"
                meta
            />

            <LazyDynamicFields
                name="payload_condition"
                :options="[{
                    value: 'true',
                    label: 'nada',
                    payload: settings?.conditions?.find(({ name }) => name === form.dispatch_condition)?.expected
                }]"
                selected="true"
                parameter="payload"
                :routeReplace="{
                    funnel_id: funnel
                }"
                addClass="sm:col-span-6 xl:col-span-4"
            />
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            complement="a automação #{id}"
            :action="async () => await useFetchApi(`v2/automations/${automation}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    definePageMeta({
        title: "automação"
    });

    const {
        funnel,
        automation
    } = useRouteParams({
        create: "create_automation",
        update: ["read_automation", "update_automation"]
    });

    const back = async () => await navigateTo("../automacoes");

    const form = ref<Record<string, unknown>>({});

    const { data } = await useAsyncData("automations:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v2/automations/${automation}`);

            form.value = {
                ...useOmit(_data, ["automationable", "trigger_event", "dispatch_action", "dispatch_condition", "payload"]),
                automationable_id: _data.automationable.id,
                trigger_event: _data.trigger_event.name,
                dispatch_action: _data.dispatch_action?.name,
                dispatch_condition: _data.dispatch_condition?.name,
                payload_action: _data.payload?.action,
                payload_condition: _data.payload?.condition
            };

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!automation
    });

    const { data: settings } = useLazyAsyncData("settings:automations", async () => {
        type Type = InternalApi["v2/settings/automations/:type"]["get"]["data"][string][];

        const types = {
            triggers: [] as Type,
            actions: [] as Type,
            conditions: [] as Type
        };

        for (const type in types) {
            const { data: _data } = await useFetchApi(`v2/settings/automations/${type}`);
            types[type as keyof typeof types] = Object.values(_data);
        }

        return types;
    });

    const upSert = async () => {
        await useFetchApi(`v2/automations/${automation || ""}`, {
            method: automation ? "PUT" : "POST",
            body: {
                ...useOmit(form.value, ["payload_action", "payload_condition"]),
                payload: {
                    action: form.value.payload_action,
                    condition: form.value.payload_condition
                }
            }
        })
            .then(async () => {
                await back();
            });
    };

    const confirmeDelete = useModalConfirm();
</script>