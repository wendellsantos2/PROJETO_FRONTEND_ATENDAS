<template>
    <ModalConfirm
        ref="modal"
        title="Deletar"
        the="o bot"
        :action="async ({ id }) => await del(Number(id))"
        @then="emit('then')"
        @finally="emit('finally')"
    />
</template>

<script setup lang="ts">
    const emit = defineEmits<{
        then: []
        finally: []
    }>();

    const modal = useModalConfirm<{
        id: number
        name: string
    }>();

    const {
        id,
        data
    } = storeToRefs(useBotStore());

    const {
        del
    } = useBotStore();

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => {
            if (!ags?.[1]) {
                ags[1] = { id: id.value, name: data.value?.name ?? "" };
            }

            modal.value?.toggle(...ags);
        }
    });
</script>