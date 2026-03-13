<template>
    <SelectElement
        ref="selectElement"
        name="template_id"
        label="Template de mensagem"
        placeholder="Selecione um template"
        valueProp="id"
        labelProp="name"
        :native="false"
        :items="templates!"
        :loading="status === 'pending'"
        search
        closeOnSelect
        rules="required"
        @searchChange="search = $event"
    >
        <template #description>
            <div
                v-if="selected"
                class="flex"
            >
                <VMenu
                    placement="right-start"
                    :triggers="['hover', 'click']"
                >
                    <button class="inline-flex cursor-pointer gap-1 font-medium text-primary user-select-none">
                        <Icon name="message" /> Ver mensagem
                    </button>

                    <template #popper>
                        <div class="flex max-w-96 flex-col gap-2 p-2 text-center">
                            <LazyViewMedia
                                v-if="selected.media?.link"
                                :src="selected.media?.link"
                                class="bg-contrast-200"
                            />
                            <span>
                                {{ selected?.content }}
                            </span>
                        </div>
                    </template>
                </VMenu>
            </div>
        </template>
    </SelectElement>
</template>

<script setup lang="ts">
    const { $user } = useNuxtApp();

    const props = defineProps<{
        providerId?: number
    }>();

    const selectElement = ref();

    const provider = useLazyAsyncData("provider:id", async () => {
        if (props.providerId) {
            const _data = await useFetchApi(`admin/companies/${$user.value?.company.id}/providers/${props.providerId}`);

            return _data.data;
        }
    }, {
        immediate: !!props.providerId,
        watch: [() => props.providerId]
    });

    const validProvider = computed(() => {
        const _provider = provider.data.value;

        if (_provider === undefined) {
            return undefined;
        }

        const permitted = ["whatsapp-vonage", "whatsapp"];

        return _provider && permitted.includes(_provider.service) ? _provider : null;
    });

    const search = ref("");

    const {
        data: templates,
        refresh,
        status
    } = useLazyAsyncData("templates:search", async () => {
        const _data = await useFetchApi("v1/templates", {
            params: {
                "filter[name]": search.value,
                "filter[service]": validProvider.value?.service,
                "filter[waba_id]": validProvider.value?.metadata?.waba_id
            }
        });

        return _data.data;
    }, {
        immediate: (!!validProvider.value || validProvider.value === null || !props.providerId)
    });

    watch(validProvider, async () => {
        selectElement.value?.update(null);
        await refresh();
    });

    watchDebounced(search, () => refresh(), {
        debounce: 200,
        maxWait: 1000,
        deep: true
    });

    const selected = computedWithControl(
        () => selectElement.value?.value,
        () => templates.value?.find(({ id }) => id === selectElement.value?.value)
    );

    defineExpose({
        data: templates,
        selected
    });
</script>