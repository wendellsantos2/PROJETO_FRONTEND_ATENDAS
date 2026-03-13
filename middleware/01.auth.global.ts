export default defineNuxtRouteMiddleware(async (to) => {
    const protect = ["default", "undefined"].includes(String(to.meta.layout));

    if (!protect) {
        return;
    }

    const {
        $user
    } = useNuxtApp();

    if (!(await $user.authenticated())) {
        return navigateTo("/");
    }
});