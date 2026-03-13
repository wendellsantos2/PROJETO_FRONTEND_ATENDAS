import {
    defineNuxtModule,
    createResolver,
    addTemplate,
    addServerPlugin,
    addPlugin
} from "nuxt/kit";

import {
    readFile
} from "node:fs/promises";

export default defineNuxtModule({
    async setup () {
        const { resolve } = createResolver(import.meta.url);

        const html = await readFile(resolve("./loading.html"), "utf8");

        addTemplate({
            filename: "loader.ts",
            write: true,
            getContents: () => "export default `" + html + "`;"
        });

        addServerPlugin(resolve("./plugins/server.ts"));

        const srcPluginClient = resolve("./plugins/client.ts");

        addPlugin({
            src: srcPluginClient,
            mode: "client"
        });
    }
});