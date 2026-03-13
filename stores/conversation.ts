export const useConversationStore = defineStore("conversation", () => {
    const talkingId = ref(0);

    const { data: conversation, refresh } = useLazyAsyncData("conversation", async () => {
        try {
            const _data = await useFetchApi(`v1/conversations/${talkingId.value}`);

            return _data.data;
        }
        catch {
            reset();
        }
    }, {
        immediate: false
    });

    watch(talkingId, (id) => {
        if (id) {
            conversation.value = null;
            refresh();
        }
    });

    const infoOpen = ref(false);

    const infoToggle = (to?: boolean) => {
        infoOpen.value = to ?? !infoOpen.value;
    };

    const reset = () => {
        talkingId.value = 0;
        conversation.value = null;
        infoToggle(false);
    };

    return {
        talkingId,
        conversation,
        infoOpen,

        refresh,
        infoToggle,
        reset
    };
});