<template>
    <ObjectElement
        :label="props.label"
        :name="props.name"
        :overrideClasses="{
            ObjectElement: {
                wrapper: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 *:rounded-xl',
                wrapper_lg: ''
            },
            ElementLayout: {
                container: 'col-span-1',
                container_lg: 'col-span-1'
            }
        }"
    >
        <ListElement
            v-for="(day, key) in weeks"
            :key
            v-slot="D"
            :name="key"
            :label="day"
            :min="1"
            addText="+"
            class="relative !col-span-1 rounded-md border border-contrast/20 p-2 !text-center"
            :overrideClasses="{
                ElementLabel: {
                    container: ''
                },
                ListElement: {
                    list_lg: 'gap-2',
                    listItem_lg: '',
                    add_lg: 'absolute bottom-1 right-1 rounded-full py-px px-2 mt-2'
                }
            }"
            :addClasses="{
                ListElement: {
                    remove: '!bg-danger',
                    removeIcon: '!bg-white'
                }
            }"
        >
            <TextElement
                v-maska="'##:## - ##:##'"
                :name="D?.index"
                placeholder="00:00 - 00:00"
            />
        </ListElement>
    </ObjectElement>
</template>

<script setup lang="ts">
    import { vMaska } from "maska/vue";

    const props = defineProps<{
        label: string
        name: string
    }>();

    const weeks = {
        monday: "Segunda",
        tuesday: "Terça",
        wednesday: "Quarta",
        thursday: "Quinta",
        friday: "Sexta",
        saturday: "Sábado",
        sunday: "Domingo"
    };
</script>