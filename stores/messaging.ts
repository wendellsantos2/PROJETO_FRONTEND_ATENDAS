import type { _DeepPartial } from "pinia";

export const useMessagingStore = defineStore("Messaging", () => {
    const talkingId = ref(0);

    const { data: conversation, refresh, clear } = useLazyAsyncData("chat:id", async () => {
        try {
            const _data = await useFetchApi(`v1/chats/${talkingId.value}`);

            return _data.data;
        }
        catch {
            reset();
        }
    }, {
        immediate: false
    });

    const set = (value: number | _DeepPartial<NonNullable<typeof conversation.value>> & { id: number }) => {
        if (typeof value === "object") {
            talkingId.value = value.id;
            conversation.value = value as any;
        }
        else {
            talkingId.value = value;
            clear();
        }

        if (talkingId.value) {
            refresh();
        }
    };

    const reset = () => {
        talkingId.value = 0;
        clear();
    };

    return {
        talkingId: readonly(talkingId),
        conversation: readonly(conversation),

        refresh,
        set,
        reset
    };
});