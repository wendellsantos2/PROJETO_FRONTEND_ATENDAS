import Pusher from "pusher-js";

declare global {
    // eslint-disable-next-line no-var
    var pusher: Pusher;
}

export default defineNuxtPlugin(() => {
    const {
        broadcastUrl,
        broadcastKey,
        broadcastCluster
    } = useRuntimeConfig().public;

    globalThis.pusher = new Pusher(broadcastKey, {
        cluster: broadcastCluster,
        forceTLS: true,
        authorizer: (channel) => {
            return {
                authorize (socketId, callback) {
                    useFetchApi("broadcasting/auth", {
                        method: "POST",
                        body: {
                            socket_id: socketId,
                            channel_name: channel.name
                        }
                    })
                        .then((response) => {
                            callback(null, response);
                        })
                        .catch((error) => {
                            callback(error, null);
                        });
                }
            };
        },
        wsHost: broadcastUrl
    });
});