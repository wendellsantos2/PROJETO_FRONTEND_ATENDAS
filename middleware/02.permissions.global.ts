export default defineNuxtRouteMiddleware(async (to) => {
    const requirePermissions = to.meta?.permissions;

    if (requirePermissions !== undefined) {
        if (!useCheckPermissions(requirePermissions)) {
            useBusError().emit("Você não tem permissão para acessar essa pagina");
            return await navigateTo("/mensagens");
        }
    }
});