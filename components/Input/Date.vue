<template>
    <TextElement
        ref="input"
        :name
        :label
        rules="required"
        inputType="date"
        @paste="paste"
    />
</template>

<script setup lang="ts">
    const {
        name = "birthdate",
        label = "Data de nascimento"
    } = defineProps<{
        name?: string
        label?: string
    }>();

    const input = useTemplateRef("input");

    const paste = (event: ClipboardEvent) => {
        const text = event.clipboardData?.getData("Text")?.trim()?.replace(/[-\s.]/g, "/");

        try {
            if (text && text.length === 10 && input.value) {
                const [day, month, year] = text.split("/").map(Number);

                const date = new Date(year, month - 1, day);
                const ISO = date.toISOString().split("T")[0];
                input.value.update(ISO);
                return;
            }

            throw "";
        }
        catch {
            useBusError().emit("Texto colado não é uma data valida");
            return;
        }
    };
</script>