<template>
    <ModalConfirm
        ref="modalConfirm"
        title="encerrar"
        complement="a conversa #{id} com {contact}"
        :action="async ({ id }) => await useFetchApi(`v1/conversations/${id}/close`, {
            method: 'PUT'
        })"
        @then="emits('then')"
        @finally="emits('finally')"
    />
</template>

<script setup lang="ts">
    const modalConfirm = useModalConfirm<{
        id: number
        contact: string
    }>();

    const emits = defineEmits<{
        then: []
        finally: []
    }>();

    defineExpose({
        open: modalConfirm.value?.open,
        toggle: (...ags: Parameters<NonNullable<typeof modalConfirm.value>["toggle"]>) => modalConfirm.value?.toggle(...ags)
    });
</script>