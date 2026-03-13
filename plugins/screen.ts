import { _screens } from "#tailwind-config/theme";

export default defineNuxtPlugin(() => {
    const { width } = useWindowSize();

    const expectedWidth = Object.entries(_screens).map(([k, v]) => [k, parseInt((v).replace("px", ""))] as const);

    const screen = computed(() => {
        const map = expectedWidth.map(([k, v]) => [k, v <= width.value]);

        return Object.fromEntries(map) as Record<keyof typeof _screens, boolean>;
    });

    return {
        provide: {
            screen
        }
    };
});