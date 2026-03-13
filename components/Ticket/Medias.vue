<template>
    <Modal
        ref="modal"
        v-slot="{ context }"
        title="Anexos"
        :contextInitial
    >
        <LazyViewMedia
            v-for="(item) in context.media"
            :key="item.id"
            :src="item.link"
        />
    </Modal>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    const contextInitial = {
        id: 0,
        media: [] as InternalApi["v1/tickets/:id/comments/:id"]["get"]["data"]["media"]
    };

    const modal = useModal<typeof contextInitial>();

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>