import {
    defineNuxtModule,
    createResolver,
    addImports,
    addPlugin
} from "nuxt/kit";

export default defineNuxtModule({
    async setup () {
        const { resolve } = createResolver(import.meta.url);

        addPlugin({
            src: resolve("./plugin.ts"),
            mode: "client"
        });

        addImports({
            name: "default",
            as: "usePusher",
            from: resolve("./composable.ts")
        });
    }
});