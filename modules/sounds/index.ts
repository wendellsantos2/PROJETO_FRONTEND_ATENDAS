import {
    defineNuxtModule,
    createResolver,
    addTemplate,
    updateTemplates,
    addImports
} from "nuxt/kit";

import {
    readdir
} from "node:fs/promises";

export default defineNuxtModule({
    async setup (_options, nuxt) {
        const { resolve } = createResolver(import.meta.url);
        const dir = "public/sounds";

        const getContents = async () => {
            const paths = await readdir(dir, {
                recursive: true
            });

            const sounds = Object.fromEntries(paths.map((path) => {
                const key = path.split("/").at(-1)?.split(".").at(0)?.toLowerCase() ?? "undefined";

                return [key, `/sounds/${path}`];
            }));

            return `export default ${JSON.stringify(sounds)}`;
        };

        const template = addTemplate({
            filename: "sounds.ts",
            write: true,
            getContents
        });

        nuxt.hook("builder:watch", async (_event, path) => {
            if (path.startsWith(dir)) {
                await updateTemplates({ filter: t => t.filename === template.filename });
            }
        });

        addImports({
            name: "default",
            as: "useSound",
            from: resolve("./composable.ts")
        });
    }
});