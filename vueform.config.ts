/* eslint-disable camelcase */
import pt_BR from "@vueform/vueform/locales/pt_BR";
import tailwind from "@vueform/vueform/themes/tailwind";
import { defineConfig } from "@vueform/vueform";

const ptBR = useMerge(pt_BR, {
    validation: {
        required: "O campo é obrigatório."
    }
});

export default defineConfig({
    theme: tailwind,
    locales: { ptBR },
    locale: "ptBR",
    validateOn: "step",
    displayErrors: false,
    floatPlaceholders: false,
    size: "lg",
    addClasses: {
        Vueform: {
            form: "text-start"
        },
        ToggleElement: {
            toggle: {
                container: ["border border-background"]
            }
        }
    },
    overrideClasses: {
        ElementError: {
            container: "font-bold text-danger mt-1",
            container_lg: "text-sm tracking-wider"
        },
        TextElement: {
            inputContainer_danger: "!border !border-2 border-danger bg-danger/20"
        },
        ToggleElement: {
            toggle: {
                toggleOff: "bg-primary border-primary text-white justify-end",
                toggleOn: "bg-secondary border-secondary text-black justify-start"
            }
        }
    },
    removeClasses: {
        ToggleElement: {
            toggle: {
                container: ["focus:form-ring"]
            }
        }
    }
});