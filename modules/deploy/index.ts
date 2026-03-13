import {
    defineNuxtModule,
    createResolver
} from "nuxt/kit";

import {
    readdir,
    readFile,
    writeFile,
    copyFile
} from "node:fs/promises";

export default defineNuxtModule({
    hooks: {
        "nitro:build:public-assets": async (nitro) => {
            const { resolve } = createResolver(import.meta.url);
            const outputDir = (file?: string) => nitro.options.output.dir + (file ? `/${file}` : "");
            const publicDir = nitro.options.output.publicDir;
            const filesTypes: string[] = [];

            const paths = await readdir(publicDir, {
                recursive: true
            });

            paths.forEach((path) => {
                if (path.includes(".")) {
                    const ext = path.split(".").at(-1);

                    if (ext && !filesTypes.includes(ext)) {
                        filesTypes.push(ext);
                    }
                }
            });

            const appYaml = await readFile(resolve("./app.yaml"), "utf8")
                .then((raw) => {
                    raw = raw.replaceAll("<filesTypes>", filesTypes.join("|"));
                    raw = raw.replaceAll("<publicDir>", publicDir.split("/").at(-1)!);
                    return raw;
                });

            await writeFile(outputDir("app.yaml"), appYaml, "utf8");

            const copyF = async (file: string) => {
                await copyFile(resolve(`./${file}`), outputDir(file));
            };

            await copyF("./requirements.txt");
        }
    }
});