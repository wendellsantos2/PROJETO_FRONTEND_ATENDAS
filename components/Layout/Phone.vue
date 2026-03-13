<template>
    <iframe
        v-if="src && settings?.active"
        ref="iframe"
        name="Ramal Web"
        :src
        :onload
        allow="microphone"
        allowtransparency="true"
        class="w-[335px] rounded-t-3xl bg-transparent transition-all duration-500"
        :class="open ? 'h-[575px]' : 'h-[30px]'"
    />
</template>

<script setup lang="ts">
    const { $user } = useNuxtApp();
    const iframe = ref<HTMLIFrameElement>();
    const open = ref(false);

    const settings = computed(() => {
        return {
            active: $user.value?.settings?.voip_active,
            username: $user.value?.settings?.voip_username,
            token: $user.value?.settings?.voip_token
        };
    });

    const src = computed(() => {
        if (settings.value?.token && settings.value?.username) {
            return `https://novosistema.atendas.com.br/suite/softphone_web.php?token=${settings.value?.token}&ramal=${settings.value?.username}`;
        }

        return "";
    });

    const onload = () => {
        const contentWindow = iframe.value?.contentWindow;

        contentWindow?.postMessage(window.location.origin, src.value);

        window.addEventListener("message", (e: MessageEvent) => {
            switch (e.data) {
                case "abrir": {
                    open.value = true;
                    break;
                }

                case "fechar": {
                    open.value = false;
                    break;
                }
            }
        });
    };

    onMounted(onload);
</script>