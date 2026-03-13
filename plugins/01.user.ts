export default defineNuxtPlugin((nuxtApp) => {
    const {
        token,
        headers,
        data,
        loading,
        originalToken,
        isImpersonating
    } = storeToRefs(useUserStore());

    const {
        authenticated,
        refresh
    } = useUserStore();

    nuxtApp.hook("app:created", () => {
        refresh();
    });

    return {
        provide: {
            user: readonly({
                token,
                headers,
                value: data,
                loading,
                originalToken,
                isImpersonating,
                authenticated
            })
        }
    };
});