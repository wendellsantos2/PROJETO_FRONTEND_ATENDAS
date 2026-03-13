import sounds from "#build/sounds";

export default function <N extends keyof typeof sounds> (name: N) {
    if (import.meta.client) {
        const audio = new Audio(sounds[name]);
        const storage = useLocalStorage("sounds_permitted", {} as Record<N, boolean>);

        return {
            ...audio,
            play: async () => {
                if (storage.value?.[name] !== false) {
                    await audio.play();
                }
            },
            permitted: computed({
                get: () => {
                    return storage.value?.[name] !== false;
                },
                set: (to: boolean = true) => {
                    storage.value[name] = to;
                    audio.play();
                }
            })
        };
    }

    return undefined;
};