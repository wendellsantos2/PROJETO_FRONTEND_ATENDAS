import {
    defineNuxtModule,
    createResolver,
    addTemplate,
    updateTemplates,
    addComponent
} from "nuxt/kit";

import {
    readdir
} from "node:fs/promises";

export default defineNuxtModule({
    async setup (_options, nuxt) {
        const { resolve } = createResolver(import.meta.url);
        const dir = "assets/svgs";

        const getContents = async () => {
            const paths = await readdir(dir, {
                recursive: true
            });

            const svgs = paths
                .filter(path => path?.split(".").at(-1) === "svg")
                .map(path => ({
                    key: path.replaceAll("/", ":")?.split(".").at(0)?.toLowerCase() ?? "undefined",
                    path: `${dir}/${path}`
                }));

            const lines = svgs.map(({ key, path }) => `"${key}": () => import("${path}?raw").then(m => m["default"])`);

            return `
                export type Names = ${svgs.map(({ key }) => `"${key}"`).join(" | ")};
                export const svgsImports: Record<Names, (() => Promise<string>)> = {${lines}};
                export default svgsImports;
            `.replace(/(?<=^|\n) +/g, "").trim();
        };

        const template = addTemplate({
            filename: "svgs.ts",
            write: true,
            getContents
        });

        nuxt.hook("builder:watch", async (_event, path) => {
            if (path.startsWith(dir)) {
                await updateTemplates({ filter: t => t.filename === template.filename });
            }
        });

        addComponent({
            name: "VSvg",
            filePath: resolve("./VSvg.vue")
        });
    }
});