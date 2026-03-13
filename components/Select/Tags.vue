<template>
    <TagsElement
        name="tags"
        label="Etiquetas"
        placeholder="Selecione as etiquetas"
        :closeOnSelect="false"
        :search="true"
        :items="tags!"
        :addClasses="{
            TagsElement: {
                select: {
                    tags: 'gap-2 !p-2 !mt-0'
                }
            }
        }"
    >
        <template #tag="{ option, handleTagRemove, disabled }: any">
            <Badge
                :color="option?.color"
                :name="option.label"
            >
                <button
                    v-if="!disabled"
                    v-tooltip.bottom="'Remover'"
                    type="button"
                    class="flex rounded-full bg-danger p-px text-white transition-all duration-300 hover:bg-white hover:text-danger"
                    @click="handleTagRemove(option, $event)"
                >
                    <Icon name="close" size="0.7rem" />
                </button>
            </Badge>
        </template>
        <template #option="{ option: { label, color } }">
            <Badge
                :color
                :name="label"
                size="sm"
            />
        </template>
    </TagsElement>
</template>

<script setup lang="ts">
    const props = defineProps<{
        type?: string
    }>();

    const { data: tags } = useLazyAsyncData(`select:tags:${props.type}`, async () => {
        const _data = await useFetchApi("v1/tags", {
            params: {
                per_page: 99,
                "filter[type]": props.type
            }
        });

        return _data.data.map(({ id, name, color }) => {
            return {
                value: id,
                label: name,
                color
            };
        });
    });
</script>