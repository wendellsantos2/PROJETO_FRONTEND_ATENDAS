<template>
    <Modal
        ref="modal"
        size="lg"
        :contextInitial
        classContainer="relative h-full"
    >
        <template #title="{ context: { type } }">
            Ver {{ type === "image" ? "imagem" : "video" }}
        </template>

        <template #container="{ toggle, context: { src, type } }">
            <Button
                color="danger"
                size="sm"
                class="absolute right-6 top-6 z-999"
                @click="toggle(false)"
            >
                <Icon name="close" size="1.3rem" />
            </Button>
            <img
                v-if="type === 'image'"
                :src
                class="h-full object-scale-down user-select-none"
            >
            <video
                v-else
                :src
                controls
                autoplay
                class="h-full object-scale-down"
            />
        </template>
    </Modal>
</template>

<script setup lang="ts">
    const modal = useTemplateRef("modal");
    const contextInitial = {
        id: 0,
        src: "",
        type: undefined as ReturnType<typeof useFileType>
    };

    useViewMedia().on(({ src }) => {
        modal.value?.toggle(true, { id: 0, src, type: useFileType(src) });
    });
</script>