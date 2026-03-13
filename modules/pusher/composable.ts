/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Channel } from "pusher-js";
import type { Channels } from "~/types/pusher";
import { defu } from "defu";

type BaseChannels = {
    [K in keyof Channels["public"]]: Channels["public"][K]
} & {
    [K in keyof Channels["private"] as `private-${K}`]: Channels["private"][K]
};

const activesChannels: Record<string, string> = {};

type ID = string | number;

export default function <
    C extends keyof BaseChannels,
    E extends keyof BaseChannels[C]
> (
    channel: C | {
        name: C
        id: ID | Ref<ID> | ComputedRef<ID> | (() => (ID))
    },
    events: {
        [K in E]: (data: BaseChannels[C][K]) => void
    },
    opts?: {
        key?: string
        autoUnsubscribe?: boolean | (() => (boolean))
        delay?: number
    }
) {
    const _opts = defu(opts, {
        key: useRouter().currentRoute.value.path,
        autoUnsubscribe: true,
        delay: 500
    });

    const channelName = computed<C | string | undefined>(() => {
        if (typeof channel === "object") {
            let id: ID;

            switch (typeof channel.id) {
                case "object": {
                    id = channel.id.value;
                    break;
                }

                case "function": {
                    id = channel.id();
                    break;
                }

                default: {
                    id = channel.id;
                    break;
                }
            }

            return id ? channel.name.replace("{id}", `${id}`).trim() : undefined;
        }

        return channel;
    });

    let eventsList: Record<string, any[]> = {};
    const eventsEntries = Object.keys(events)
        .map((name) => {
            const func = (data: any) => {
                if (eventsList[name] === undefined) {
                    eventsList[name] = [];
                }

                eventsList[name].unshift(data);

                if (eventsList[name].length === 1) {
                    emit(name);
                }
            };

            return [name, func] as const;
        });

    const emit = async (name: string) => {
        const func = events[name as E];

        func(eventsList[name].at(-1));

        await new Promise(resolve => setTimeout(resolve, _opts.delay));

        if (eventsList[name]) {
            eventsList[name].pop();

            if (eventsList[name].length) {
                emit(name);
            }
        }
    };

    let pusherChannel: Channel;

    onMounted(() => {
        watch(channelName, (newValue) => {
            pusherChannel?.unsubscribe();
            eventsList = {};

            if (newValue) {
                pusherChannel = pusher.subscribe(newValue);

                activesChannels[_opts.key] = pusherChannel.name;

                eventsEntries.forEach((event) => {
                    pusherChannel.bind(...event);
                });
            }
        }, {
            immediate: true
        });
    });

    const canUnsubscribe = () => {
        const { autoUnsubscribe } = _opts;
        const resOpt = typeof autoUnsubscribe === "function"
            ? autoUnsubscribe()
            : autoUnsubscribe !== false;

        if (resOpt) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete activesChannels[_opts.key];

            eventsEntries.forEach((event) => {
                pusherChannel?.unbind(...event);
            });
        }

        const search = Object
            .entries(activesChannels)
            .filter(([_, c]) => c === channelName.value);

        if (search.length > 0) {
            return false;
        }

        return resOpt;
    };

    onUnmounted(() => {
        if (canUnsubscribe()) {
            pusherChannel?.unsubscribe();
        }

        eventsList = {};
    });
};