import loading from "~/.nuxt/loader";

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook("render:html", (html) => {
        html.body.unshift(loading);
    });
});