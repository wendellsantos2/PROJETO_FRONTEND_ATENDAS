function luminance (r: number, g: number, b: number): number {
    const a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export const useContrastTheme = computed(() => useColorMode().value === "dark" ? "#000000" : "#FFFFFF");

export function useContrast (color: string) {
    if (!color?.startsWith("#")) {
        return useContrastTheme.value;
    }

    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);

    const lum = luminance(r, g, b);

    return lum > 0.179 ? "#000000" : "#FFFFFF";
}

export type Color = `#${string}` | `hsl(var(--${string}))` | `var(--${string})`;

export function useBacklight (color: Color, contrast?: Color) {
    return `color-mix(in srgb, ${color} 30%, ${contrast ?? useContrast(color)} 70%)`;
}

export function useBacklightStyle (...args: Parameters<typeof useBacklight>) {
    return `background-color: ${useBacklight(...args)}`;
}