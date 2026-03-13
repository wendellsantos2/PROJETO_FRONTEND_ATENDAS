export const useNotificationsStore = defineStore("notifications", () => {
    const unread = ref(0);
    const unreadComputed = computed(() => unread.value < 100 ? (unread.value ? String(unread.value) : "") : "99+");

    // Apenas para ser referenciado em /components/Layout/Notifications.vue
    const toggle = (to?: boolean) => {
        return to;
    };

    return {
        unread,
        unreadComputed,
        toggle
    };
});