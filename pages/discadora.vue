<template>
    <div class="relative flex size-full grow">
        <div class="m-auto flex max-w-screen-xs flex-col gap-2">
            Um momento, estamos carregando a integração...
            <BarLoading />
        </div>
        <TransitionOpacity>
            <iframe
                v-show="show"
                class="absolute inset-0 size-full"
                src="https://novosistema.atendas.com.br/suite"
                @load="show = true"
            />
        </TransitionOpacity>
    </div>
</template>

<script setup lang="ts">
    definePageMeta({
        navOrder: 41,
        icon: "carbon:phone-ip",
        permissions: "provider:dazsoft",
        layoutConfig: {
            fullScreen: true
        }
    });

    const show = ref(false);
</script>