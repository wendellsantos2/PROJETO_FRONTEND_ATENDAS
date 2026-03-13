import { version } from "~/package.json";

export default defineNuxtPlugin((_nuxtApp) => {
    return {
        provide: {
            version
        }
    };
});