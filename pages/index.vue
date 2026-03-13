<template>
    <Vueform
        class="w-full"
        :endpoint="false"
        @submit="submit"
    >
        <TextElement
            name="username"
            autocomplete="username"
            placeholder="Digite seu nome de usuário ou E-mail"
            rules="required|min:3"
        />
        <TextElement
            :inputType="seePassword ? 'text' : 'password'"
            autocomplete="password"
            name="password"
            placeholder="Digite sua senha"
            rules="required|min:6"
        >
            <template #addon-after>
                <Icon
                    :name="seePassword ? 'eyeOff' : 'eye'"
                    class="transition-all duration-300 hover:text-primary"
                    size="1.5rem"
                    @click="seePassword = !seePassword"
                />
            </template>
        </TextElement>
        <CheckboxElement
            name="connected"
            text="Permanecer conectado"
            :default="true"
            size="sm"
            align="center"
            :addClasses="{
                CheckboxElement: {
                    wrapper: ['justify-center']
                }
            }"
        />
        <Button
            size="lg"
            :loading="loading || $user.loading"
            class="col-span-12 mx-auto w-full"
        >
            <Icon name="login" />
            Entrar
        </Button>
    </Vueform>
</template>

<script setup lang="ts">
    definePageMeta({
        layout: "auth",
        title: "Fazer login",
        scrollToTop: false
    });

    useSeoMeta({
        title: "Login"
    });

    const seePassword = ref(false);
    const { $user } = useNuxtApp();
    const { login } = useUserStore();

    whenever(() => $user.token, async () => {
        await navigateTo("/mensagens");
    }, {
        immediate: true
    });

    const loading = ref(false);

    const submit = async ({ data }: { data: Parameters<typeof login>[0] }) => {
        loading.value = true;

        await login(data)
            .finally(() => {
                loading.value = false;
            });
        ;
    };
</script>