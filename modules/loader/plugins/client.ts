export default defineNuxtPlugin((plugin) => {
    const callback = () => {
        const element = document.querySelector<HTMLElement>("#LOADING");

        if (element) {
            element.style.opacity = "0";
            element.style.transform = "scale(1.5)";

            setTimeout(() => {
                element.style.display = "none";
            }, 510);
        }
    };

    plugin.hook("app:suspense:resolve", callback);
    plugin.hook("app:error", callback);
});