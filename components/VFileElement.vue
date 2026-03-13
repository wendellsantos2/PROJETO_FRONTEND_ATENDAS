<template>
    <ElementLayout>
        <template #element>
            <File
                ref="file"
                v-model="value"
                :accept
                :raw
                :view
            />
        </template>
    </ElementLayout>
</template>

<script lang="js">
    // Esse componente serve apenas registrar File no vueForm
    import { defineElement } from "@vueform/vueform";

    export default defineElement({
        name: "VFileElement",

        props: {
            accept: {
                type: String,
                required: false
            },
            raw: {
                type: Boolean,
                required: false
            },
            view: {
                type: String,
                required: false
            }
        },

        setup () {
            const file = ref(null);

            return {
                file
            };
        }
    });
</script>