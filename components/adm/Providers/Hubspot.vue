<template>
    <AdmProvidersDefaults
        :request="`third-party/hubspot/${props.provider.id}/defaults`"
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
        <LazyFieldsMapping
            name="contact_fields_mapping"
        />
    </AdmProvidersDefaults>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    const props = defineProps<{
        provider: InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]
    }>();

    const emits = defineEmits<{
        then: []
    }>();
</script>