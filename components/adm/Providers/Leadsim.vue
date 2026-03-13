<template>
    <AdmProvidersDefaults
        :request="`third-party/leadsim/${props.provider.id}/defaults`"
        :provider
        @then="emits('then')"
    >
        <div class="col-span-full flex flex-row items-center justify-between">
            <span>
                Salvar Lead automaticamente?
            </span>
            <ToggleElement
                name="auto_save_lead"
                :labels="{ on: 'Sim', off: 'Não' }"
            />
        </div>

        <SelectElement
            name="funnel_step_id"
            label="Funil"
            placeholder="Selecione um Funil"
            :native="false"
            :items="getInfo('step_funnels')"
            closeOnSelect
        />
        <SelectElement
            name="segment_id"
            label="Segmento"
            placeholder="Selecione um segmento"
            :native="false"
            :items="getInfo('segments')"
            closeOnSelect
        />
        <SelectElement
            name="sales_channel_id"
            label="Canal de vendas"
            placeholder="Selecione um canal"
            :native="false"
            :items="getInfo('salesChannel')"
            closeOnSelect
        />
        <SelectElement
            name="product_id"
            label="Produto"
            placeholder="Selecione um produto"
            :native="false"
            :items="getInfo('products')"
            closeOnSelect
        />
        <SelectElement
            name="activitie_id"
            label="Atividade"
            placeholder="Selecione uma atividade"
            :native="false"
            :items="getInfo('activitiesType')"
            closeOnSelect
        />
    </AdmProvidersDefaults>

    <Button
        v-slot="scope"
        v-tooltip="'Sincronizar infos da empresa'"
        color="success"
        size="sm"
        noChangeLoading
        :action="async () => await useFetchApi(`third-party/leadsim/${provider.id}/infos`, {
            method: 'POST'
        })"
        @then="emits('then')"
    >
        <Icon name="sync" size="1.2rem" :class="{ 'animate-spin': scope.loading }" />
    </Button>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    const props = defineProps<{
        provider: InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]
    }>();

    const emits = defineEmits<{
        then: []
    }>();

    const { data: infos } = useLazyAsyncData("leadsim:infos", async () => {
        const { data: _data } = await useFetchApi("third-party/leadsim/infos");
        return _data;
    });

    type Infos = InternalApi["third-party/leadsim/infos"]["get"]["data"];

    const getInfo = <K extends keyof NonNullable<Infos>> (parameter: K) => {
        const select = infos.value?.[parameter];

        if (!isArray(select)) {
            return;
        }

        return useMap(select, (v) => {
            return {
                value: v?.id,
                label: v?.title
            };
        });
    };
</script>