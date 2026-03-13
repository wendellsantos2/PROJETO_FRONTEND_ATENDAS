<template>
    <div>
        <LazyButton
            v-tooltip="'Gerenciamento de sessão'"
            color="tertiary"
            size="sm"
            @click="modal?.toggle()"
        >
            <Icon name="userSession" size="1.2rem" />
        </LazyButton>

        <LazyModal
            ref="modal"
            title="sessão whatsapp atendas"
            size="xs"
        >
            <div
                class="flex flex-row items-center justify-center gap-4 rounded-2xl p-4 text-left transition-all duration-300"
                :class="style.class"
            >
                <Icon
                    :name="style?.icon"
                    size="3.25rem"
                />
                <div class="flex flex-col gap-1">
                    <h5 class="font-semibold">
                        {{ style.name }}
                    </h5>
                    <p class="italic">
                        {{ metadata?.session ?? "----" }}
                    </p>
                </div>
            </div>
            <TransitionHeight>
                <div v-if="['connecting', 'reconnecting'].includes(metadata?.status!)">
                    <div
                        class="relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl bg-background-200 p-4"
                    >
                        <Icon name="qrcode" size="2rem" />
                        <span>
                            Um momento, estamos carregando o QRCode...
                        </span>
                        <BarLoading />
                        <TransitionOpacity mode="out-in">
                            <img
                                v-if="metadata?.qrcode"
                                :key="metadata.attempts"
                                :src="metadata?.qrcode+`?v=${useGenerateId()}`"
                                class="absolute inset-0 size-full border-8 border-white object-cover"
                            >
                        </TransitionOpacity>
                    </div>
                </div>
            </TransitionHeight>
            <TransitionOpacity mode="out-in">
                <LazyButton
                    v-if="metadata?.status === 'disconnected'"
                    :action="async () => await useFetchApi(`third-party/whatsapp/session/${provider.id}/login`, {
                        method: 'POST'
                    })"
                    class="flex-none"
                    @then="emits('then')"
                >
                    <Icon name="login" />
                    Conectar
                </LazyButton>
                <Button
                    v-else
                    color="danger"
                    :action="async () => await useFetchApi(`third-party/whatsapp/session/${provider.id}/logout`, {
                        method: 'POST'
                    })"
                    class="flex-none"
                    @then="emits('then')"
                >
                    <Icon name="logout" />
                    Desconectar
                </Button>
            </TransitionOpacity>
        </LazyModal>
    </div>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";
    import type { Channels } from "~/types/pusher";

    type Metadata = Channels["private"]["companies.{id}"]["wppConnectSetup"];

    const {
        provider
    } = defineProps<{
        provider: InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]
    }>();

    const emits = defineEmits<{
        then: []
    }>();

    const metadata = ref<Metadata>();

    watch(() => provider, () => {
        metadata.value = {
            provider_id: provider.id,
            ...provider.metadata
        } as Metadata;
    }, {
        immediate: true
    });

    const style = computed(() => {
        return {
            disconnected: {
                class: "bg-danger text-white",
                icon: "disconnected",
                name: "Desconectado"
            },
            connecting: {
                class: "bg-warn text-white",
                icon: "connecting",
                name: "Aguardado conexão..."
            },
            connected: {
                class: "bg-success text-white",
                icon: "connected",
                name: "Conectado"
            },
            reconnecting: {
                class: "bg-secondary text-black",
                icon: "loading",
                name: "Reconectando..."
            },
            undefined: {
                class: "bg-background-200",
                icon: "",
                name: "???"
            }
        }[`${metadata.value?.status}`];
    });

    const modal = useTemplateRef("modal");
    const { $user } = useNuxtApp();

    usePusher({
        name: "private-companies.{id}",
        id: $user.value?.company.id ?? 0
    }, {
        wppConnectSetup (_data) {
            if (_data.provider_id === provider.id) {
                metadata.value = _data;
            }
        }
    });
</script>