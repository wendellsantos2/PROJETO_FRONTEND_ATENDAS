<template>
    <SelectElement
        ref="selectElement"
        name="provider_id"
        label="Provedor"
        placeholder="Selecione um provedor"
        search
        :items="providers!"
        :default="providers?.at(0)?.id"
        valueProp="id"
        labelProp="name"
        :native="false"
        rules="required"
        @searchChange="search = $event"
    >
        <template #option="{ option: { service, name } }">
            <div class="flex grow flex-row items-center gap-4 capitalize">
                <Icon :name="useProviderIcon('message', service)" size="1.2rem" />
                {{ name }}
            </div>
        </template>
        <template #single-label="{ value: { service, name } }">
            <div class="flex grow flex-row items-center gap-4 pl-6 capitalize">
                <Icon :name="useProviderIcon('message', service)" size="1.2rem" />
                {{ name }}
            </div>
        </template>
    </SelectElement>
</template>

<script setup lang="ts">
    const selectElement = ref();
    const search = ref("");

    const {
        data: providers,
        refresh
    } = useLazyAsyncData("providers:search", async () => {
        const { data: _data } = await useFetchApi("v1/providers", {
            params: {
                "filter[name]": search.value,
                "filter[allows_outbound]": true,
                "filter[status]": true
            }
        });

        return _data;
    });

    watchDebounced(search, () => refresh(), {
        debounce: 200,
        maxWait: 1000,
        deep: true
    });

    defineExpose({
        data: providers,
        selected: computed(() => providers.value?.find(({ id }) => id === selectElement.value?.value))
    });
</script>