<template>
    <section class="m-auto flex w-full max-w-screen-xs flex-col gap-6 p-4">
        <div class="mx-auto flex flex-row items-center gap-6 px-6">
            <div class="relative flex-none">
                <img
                    v-if="$user.value?.name"
                    :src="$user.value?.avatar_url"
                    :alt="$user.value?.name"
                    class="size-28 rounded-full bg-background-100 object-cover object-center shadow"
                >
                <Button
                    v-tooltip="'Editar foto'"
                    size="sm"
                    class="absolute bottom-0 right-0"
                    @click="modalChangeAvatar?.toggle(true)"
                >
                    <Icon name="edit" />
                </Button>
            </div>
            <div class="flex grow flex-col gap-2">
                <Badge
                    :color="$user.value?.role.color"
                    :name="$user.value?.role.display_name"
                    :icon="false"
                    variant="solid"
                    :resumeString="20"
                />
                <h2 class="line-clamp-2 font-bold leading-none">
                    <span class="text-secondary">#{{ $user.value?.id }}</span> {{ $user.value?.name }}
                </h2>
                <p class="opacity-60">
                    {{ $user.value?.email }}
                </p>
            </div>
        </div>

        <div class="grid gap-6 *:w-full xs:grid-cols-2">
            <Button
                color="contrast"
                @click="useNotificationsStore().toggle(true)"
            >
                <Icon name="notification" />
                Notificações
                <Badge
                    v-show="unreadNotifications"
                    color="danger"
                    :name="false"
                    :icon="false"
                    variant="solid"
                    size="sm"
                >
                    {{ unreadNotifications }}
                </Badge>
            </Button>
            <Button
                color="warn"
                @click="modalAbsence?.toggle(true)"
            >
                <Icon name="user:absence" />
                Ausência
            </Button>
        </div>

        <ul class="rounded-2xl bg-background-100 p-4 *:flex *:flex-row *:items-start *:justify-between *:gap-4 *:border-b *:border-contrast/10 *:py-4 first:*:pt-0 last:*:border-none last:*:pb-0">
            <li>
                <p class="my-auto">
                    Tema da interface
                </p>
                <ButtonTheme />
            </li>
            <li v-for="(sound, key) in sounds" :key>
                <p class="my-auto">
                    {{ sound.label }}
                </p>
                <Vueform
                    class="flex-none"
                    sync
                    :removeClasses="{
                        FormElements: {
                            container: ['form-gap-x-gutter'],
                            container_sm: ['form-gap-x-gutter-sm'],
                            container_lg: ['form-gap-x-gutter-lg']
                        }
                    }"
                >
                    <ToggleElement
                        name="permitted"
                        :default="sound.permitted.value"
                        @change="sound.permitted.value = $event"
                    />
                </Vueform>
            </li>
        </ul>

        <Button
            color="danger"
            @click="$user.isImpersonating ? stopImpersonate() : navigateTo('/logout')"
        >
            <Icon name="logout" />
            {{ $user.isImpersonating ? `Deslogar de: ${$user.value?.name}` : 'se desconectar' }}
        </Button>

        <LazyModal
            ref="modalChangeAvatar"
            title="Mudar avatar"
            size="xs"
        >
            <Vueform
                v-model="formAvatar"
                sync
                :endpoint="false"
            >
                <VFileElement
                    name="upload_id"
                    accept=".png,.jpg,.jpeg,.webp"
                />
            </Vueform>

            <div class="flex flex-row form-gap-gutter-lg *:w-full">
                <Button
                    :action="changeAvatar"
                    :disabled="formAvatar?.upload_id === null"
                >
                    Alterar
                </Button>
            </div>
        </LazyModal>

        <LazyModal
            ref="modalAbsence"
            v-slot="{ context, toggle }"
            title="Ausência"
            size="xs"
            :contextInitial="{ id: 0, form: {} }"
        >
            <Vueform
                v-model="modalAbsence!.context.form"
                sync
                :endpoint="false"
            >
                <TextareaElement
                    name="motivation"
                    placeholder="Vou estar ausente pois..."
                    :rows="5"
                />
            </Vueform>

            <div class="flex flex-row form-gap-gutter-lg *:w-full">
                <Button
                    :action="async () => useUserStore().switchAbsence(context.form.motivation)"
                    @then="toggle(false)"
                >
                    Ficar ausente
                </Button>
            </div>
        </LazyModal>
    </section>
</template>

<script setup lang="ts">
    import soundsList from "#build/sounds";

    definePageMeta({
        layoutConfig: {
            fullScreen: true
        }
    });

    const {
        $user
    } = useNuxtApp();

    const {
        unreadComputed: unreadNotifications
    } = storeToRefs(useNotificationsStore());

    const soundsLabels: typeof soundsList = {
        "notification-incoming": "Som de atualização de conversa (Chat interno)",
        notification: "Som de atualização de conversa (Mensageiria)",
        "send-comment": "Som de novos cometários (Ticket)",
        "send-pop": "Som de novas mensagens (Chat interno)",
        send: "Som de nova mensagem (Mensageiria)"
    };

    const sounds = (Object.keys(soundsList) as ((keyof typeof soundsList)[])).map(key => ({
        ...useSound(key)!,
        label: soundsLabels[key] ?? key
    }));

    const {
        stopImpersonate,
        refresh
    } = useUserStore();

    const modalChangeAvatar = useTemplateRef("modalChangeAvatar");

    const formAvatar = ref({
        upload_id: undefined as undefined | number
    });

    whenever(() => modalChangeAvatar.value?.open, () => {
        formAvatar.value.upload_id = $user.value?.upload_id;
    });

    const changeAvatar = async () => {
        await useFetchApi(`v1/users/${$user.value?.id}`, {
            method: "PUT",
            body: {
                upload_id: formAvatar.value?.upload_id
            }
        });

        await refresh();
        modalChangeAvatar.value?.toggle(false);
    };

    const modalAbsence = useTemplateRef("modalAbsence");
</script>