<template>
    <TransitionOpacity>
        <div
            v-if="$user.value?.is_absent"
            class="fixed inset-0 z-999 flex flex-col items-center justify-center gap-4 bg-black/90 p-4 text-center text-white backdrop-blur-md"
        >
            <Icon
                name="user:absence"
                size="7rem"
                class="text-secondary"
            />
            <h4 class="font-bold">
                Você está ausente!
            </h4>
            <p class="max-w-screen-xs italic">
                "{{ $user.value?.absence_motivation }}"
            </p>
            <Button :action="async () => await useUserStore().switchAbsence()">
                Voltar ao trabalho
            </Button>
        </div>
    </TransitionOpacity>
</template>