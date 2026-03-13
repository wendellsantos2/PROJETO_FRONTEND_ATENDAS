import type { InternalApi } from "nitropack/types";

type Bot = Partial<InternalApi["v1/bots/:id"]["get"]["data"]> & { bot_file?: File };

export const useBotStore = defineStore("bot", () => {
    const id = ref(0);

    const { data, refresh, pending } = useLazyAsyncData("bot:id", async () => {
        return id.value
            ? (await useFetchApi(`v1/bots/${id.value}`)).data as Bot
            : {} as Bot;
    }, {
        default: () => ({} as Bot)
    });

    const set = async (_id: number) => {
        id.value = _id;
        await refresh();
    };

    const upSert = async (_id?: number, body?: Bot) => {
        const thatId = _id ?? id.value;
        const thatBody = body ?? data.value;

        return await useFetchApi(`v1/bots/${thatId || ""}`, {
            method: thatId ? "PUT" : "POST",
            body: thatId ? thatBody : useFormData(thatBody)
        });
    };

    const del = async (_id?: number) => {
        await useFetchApi(`v1/bots/${_id ?? id.value}`, {
            method: "DELETE"
        });
    };

    const reset = () => {
        id.value = 0;
        data.value = {};
    };

    const download = async (bot: Partial<InternalApi["v1/bots/:id"]["get"]["data"]> = data.value) => {
        if (!bot) {
            return;
        }

        const dataExport = await useFetchApi(`v1/bots/${bot.id}/export`);

        const jsonStr = JSON.stringify(dataExport, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = `${bot.id}-${bot.name}-${bot.type}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return {
        id,
        data,
        pending,

        refresh,
        set,
        upSert,
        del,
        reset,
        download
    };
});