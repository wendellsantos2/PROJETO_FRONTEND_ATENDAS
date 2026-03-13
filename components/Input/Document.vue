<template>
    <TextElement
        v-maska="'###.###.###-##'"
        name="document_number"
        label="CPF"
        placeholder="000.000.000-00"
        :rules="['required', 'min:14', formatting]"
        @change="change = $event"
    />
</template>

<script setup lang="ts">
    import { vMaska } from "maska/vue";
    import { Validator } from "@vueform/vueform";

    const change = ref();

    const formatting = class extends Validator {
        init () {
            watch(change, () => {
                this.revalidate();
            });
        }

        get msg () {
            return "Dígitos verificadores do CPF inválidos";
        }

        check (value: string) {
            value = value.replace(/\D/g, "");

            if (value.length < 11) {
                return true;
            }

            let sum = 0;

            for (let i = 0; i < 9; i++) {
                sum += parseInt(value[i]) * (10 - i);
            }

            let remainder = sum % 11;
            const firstDigit = remainder < 2 ? 0 : 11 - remainder;

            sum = 0;

            for (let i = 0; i < 10; i++) {
                sum += parseInt(value[i]) * (11 - i);
            }

            remainder = sum % 11;
            const secondDigit = remainder < 2 ? 0 : 11 - remainder;

            return value.slice(-2) === `${firstDigit}${secondDigit}`;
        }
    };
</script>