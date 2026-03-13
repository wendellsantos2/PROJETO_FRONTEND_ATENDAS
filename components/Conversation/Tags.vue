<template>
    <Vueform
        v-if="useCheckPermissions('assign_tag')"
        v-model="form"
        sync
        :endpoint="false"
    >
        <SelectTags
            label=""
            type="conversation"
        />

        <Button
            v-if="!props.autoSave"
            class="col-span-full"
            :action="update"
            :disabled="!isDifferent"
        >
            <Icon name="upload" />
            Salvar
        </Button>
    </Vueform>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    const props = defineProps<{
        conversationId: number
        tags: InternalApi["v1/conversations/:id"]["get"]["data"]["tags"]
        autoSave?: boolean
    }>();

    const emits = defineEmits<{
        then: []
        finally: []
    }>();

    const form = ref({
        tags: [] as number[]
    });

    const tagsId = computed(() => {
        return props?.tags.map(({ id }) => id);
    });

    watch(tagsId, (t) => {
        form.value.tags = t;
    }, {
        immediate: true,
        deep: true
    });

    const isDifferent = computed(() => !isEqual(tagsId.value, form.value.tags));

    const update = async () => {
        await useFetchApi(`v1/conversations/${props.conversationId}`, {
            method: "PUT",
            body: form.value
        })
            .then(() => emits("then"))
            .finally(() => emits("finally"));
    };

    watchDebounced(form, async () => {
        if (isDifferent.value && props.autoSave) {
            await update();
        }
    }, {
        debounce: 200,
        maxWait: 1000,
        deep: true
    });
</script>