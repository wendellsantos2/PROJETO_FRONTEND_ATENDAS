<template>
    <ElementLayout>
        <template #element>
            <EditorJson ref="editor" v-model="value" />
        </template>

        <template #after>
            <slot name="after" :model="value" />
        </template>
    </ElementLayout>
</template>

<script lang="js">
    // Esse componente serve apenas registrar no vueForm
    import { defineElement } from "@vueform/vueform";

    export default defineElement({
        name: "EditorJsonElement",

        props: {
            rules: {
                required: false,
                default: "json"
            }
        },

        setup () {
            const editor = ref(null);

            return {
                editor
            };
        }
    });
</script>