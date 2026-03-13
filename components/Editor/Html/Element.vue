<template>
    <ElementLayout>
        <template #element>
            <EditorHtml ref="editor" v-model="value" />
        </template>
    </ElementLayout>
</template>

<script lang="js">
    // Esse componente serve apenas registrar no vueForm
    import { defineElement } from "@vueform/vueform";

    export default defineElement({
        name: "EditorHtmlElement",

        props: {
        },

        setup () {
            const editor = ref(null);

            return {
                editor
            };
        }
    });
</script>