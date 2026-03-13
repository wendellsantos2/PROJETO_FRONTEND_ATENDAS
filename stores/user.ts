import type { InternalApi } from "nitropack/types";
import { useCookie } from "#app";

const cookieOptions = {
    sameSite: "lax",
    secure: true,
    priority: "high",
    encode: encodeURIComponent,
    decode: decodeURIComponent
} as const;

const customStorage: Pick<Storage, "getItem" | "setItem"> = {
    getItem: (key) => {
        return useCookie<string>(key, cookieOptions).value;
    },
    setItem: (key, value) => {
        const expiresIn = /"expires_in":"([^",{}]*)"/g.exec(value)?.[1];
        const expires = !expiresIn ? undefined : new Date(expiresIn);

        useCookie(key, {
            ...cookieOptions,
            expires
        }).value = value;
    }
};

export const useUserStore = defineStore("user", () => {
    const token = ref<InternalApi["auth/token"]["post"] | null>(null);
    const originalToken = ref<InternalApi["impersonate"]["post"] | null>(null);

    const headers = computed(() => (
        !token.value
            ? { }
            : {
                Authorization: `${token.value.token_type} ${token.value.access_token}`,
                "X-Company-Id": `${token.value.company_id}`
            }
    ));

    const data = ref<InternalApi["me"]["get"]["data"] | null>(null);
    const loading = ref(false);

    const refresh = async () => {
        if (!token.value) {
            data.value = null;
            return;
        }

        loading.value = true;

        const { data: _data } = await useFetchApi("me", {
            onResponseError () {
                logout();
            }
        })
            .finally(() => {
                loading.value = false;
            });

        _data?.activated_providers?.forEach((provider) => {
            _data!.permissions[`provider:${provider}`] = true;
        });

        data.value = _data;
    };

    const authenticated = async () => {
        if (!token.value) {
            await logout();
        }
        else if (!data.value) {
            await refresh();
        }

        return !!data.value?.id && !!token.value;
    };

    const login = async (data: {
        username: string
        password: string
        connected: boolean
    }) => {
        const response = await useFetchApi("auth/token", {
            method: "POST",
            body: data
        });

        if (!data?.connected) {
            response.expires_in = "";
        }

        token.value = response;
    };

    const logout = async () => {
        if (token.value) {
            await useFetchApi("auth/token", {
                method: "DELETE",
                onResponse () {},
                ignoreResponseError: true
            });
        }

        token.value = null;
        originalToken.value = null;
        data.value = null;
    };

    const switchAbsence = async (motivation?: string) => {
        await useFetchApi("v1/users/switch-absence", {
            body: { motivation },
            method: "post"
        });

        await refresh();
    };

    const impersonate = async (id: number) => {
        if (!token.value) {
            return;
        }

        if (isImpersonating.value) {
            useBusError().emit("Você já está se passado por um usuário!");
            return;
        }

        const response = await useFetchApi("impersonate", {
            method: "POST",
            body: {
                user_id: id
            }
        });

        originalToken.value = token.value;
        token.value = response;
        data.value = null;

        reloadNuxtApp({
            path: "/dashboard"
        });
    };

    // TODO remover token na api
    const stopImpersonate = async () => {
        await useFetchApi("auth/token", {
            method: "DELETE",
            onResponse () {},
            ignoreResponseError: true
        });

        token.value = originalToken.value;
        data.value = null;
        originalToken.value = null;

        reloadNuxtApp({
            path: "/adm/empresas"
        });
    };

    const isImpersonating = computed(() => originalToken.value !== null);

    return {
        token,
        headers,
        loading,
        data,
        originalToken,
        isImpersonating,

        login,
        logout,
        refresh,
        authenticated,
        switchAbsence,
        impersonate,
        stopImpersonate
    };
}, {
    persist: [
        {
            pick: ["token"],
            key: "token-user",
            storage: customStorage
        },
        {
            pick: ["originalToken"],
            key: "token-original",
            storage: customStorage
        },
        {
            pick: ["data"],
            key: "data-user",
            storage: piniaPluginPersistedstate.sessionStorage()
        }
    ]
});