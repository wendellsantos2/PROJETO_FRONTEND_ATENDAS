<template>
    <div class="fixed inset-0 z-999 flex flex-col items-center justify-center gap-4 bg-background">
        <p>
            Ops, algo deu errado
        </p>
        <h1 class="text-[10rem] font-black leading-none">
            {{ props.error.statusCode }}
        </h1>
        <p>
            {{ props.error.message || errorMessages?.[props.error.statusCode] }}
        </p>
        <ButtonBack />
    </div>
</template>

<script setup lang="ts">
    import type { NuxtError } from "#app";

    const props = defineProps<{
        error: NuxtError
    }>();

    const errorMessages: Record<number, string> = {
        400: "Ops! Requisição inválida.",
        401: "Faça login para acessar.",
        403: "Acesso negado!",
        404: "Nada encontrado aqui!",
        500: "Eita! Erro no servidor.",
        502: "Erro ao acessar o servidor.",
        503: "Serviço indisponível. Tente mais tarde.",
        504: "Timeout! Tente novamente."
    };
</script>