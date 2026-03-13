<template>
    <MultiselectElement
        v-if="props.multi"
        v-bind="bind"
        :hideSelected="false"
        :closeOnSelect="false"
        :closeOnDeselect="false"
    >
        <template #option="{ option: { name, color } }">
            <div class="flex grow flex-row items-center gap-4 capitalize">
                <span class="rounded-full p-3" :style="`background-color: ${color}`" />
                <span>
                    {{ name }}
                </span>
            </div>
        </template>
    </MultiselectElement>
    <SelectElement
        v-else
        v-bind="bind"
        closeOnSelect
    >
        <template #option="{ option: { name, color } }">
            <div class="flex grow flex-row items-center gap-4 capitalize">
                <span class="rounded-full p-3" :style="`background-color: ${color}`" />
                <span>
                    {{ name }}
                </span>
            </div>
        </template>
        <template #single-label="{ value: { name, color } }">
            <div class="flex grow flex-row items-center gap-4 pl-4 capitalize">
                <span class="rounded-full p-3" :style="`background-color: ${color}`" />
                <span>
                    {{ name }}
                </span>
            </div>
        </template>
    </SelectElement>
</template>

<script setup lang="ts">
    const props = defineProps<{
        multi?: boolean
    }>();

    const element = ref();

    const { data: categories } = useLazyAsyncData("categories:search", async () => {
        const { data: _data } = await useFetchApi("v1/categories", {
            params: {
                per_page: 999
            }
        });

        return _data;
    }, {
        default: () => []
    });

    const bind = {
        ref: "element",
        name: "category_id",
        label: "Categoria",
        placeholder: "Selecione uma categoria",
        native: false,
        search: true,
        items: categories!,
        valueProp: "id",
        labelProp: "name"
    };

    defineExpose({
        data: categories.value,
        selected: computed(() => {
            if (props.multi) {
                return categories.value?.filter(({ id }) => element.value?.value.includes(id));
            }

            return categories.value?.find(({ id }) => id === element.value?.value);
        })
    });
</script>