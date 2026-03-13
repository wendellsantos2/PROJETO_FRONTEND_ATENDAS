<template>
    <Modal
        ref="modal"
        v-slot="{ context, toggle }"
        size="xs"
        title="Como usar"
        :contextInitial="{
            id: 0,
            secret: '' as string | undefined
        }"
    >
        <Notice
            v-if="context.secret"
            type="error"
            :title="false"
        >
            <div class="m-4 flex flex-col gap-2 font-medium">
                <p>
                    Este é o segredo:
                </p>
                <strong class="rounded-md bg-background p-2">
                    {{ context.secret }}
                </strong>
                <p>
                    Assim que você fechar esta tela, ele não poderá ser visto novamente.
                </p>
            </div>
        </Notice>

        <p>
            Para gerar seu token de acesso ao Atentas, envie uma solicitação para a rota da API
            <strong class="inline-flex flex-row gap-1 *:rounded-md *:bg-background-100 *:px-2">
                <span class="text-danger">POST</span>
                <span class="text-secondary">/oauth/token</span>
            </strong>
            com o seguinte body:
        </p>

        <div class="flex flex-col gap-1 break-all rounded-2xl bg-background-100 p-3 font-medium">
            <span class="text-warn">{</span>
            <span
                v-for="(value, key) in {
                    grant_type: 'authorization_code',
                    client_id: context.id || '{APP_ID}',
                    client_secret: context.secret || '{APP_SECRET}',
                    scope: '{SCOPE}'
                }"
                :key
                class="pl-4"
            >
                <span class="text-primary">{{ key }}</span>
                <span>: </span>
                <span v-if="typeof value === 'number'" class="text-pink-600">{{ value }}</span>
                <span v-else-if="value.includes('}')" class="text-danger">{{ value }}</span>
                <span v-else class="text-success">"{{ value }}"</span>
            </span>
            <span class="text-warn">}</span>
        </div>
        <Button @click="toggle(false)">
            Entendi
        </Button>
    </Modal>
</template>

<script setup lang="ts">
    const modal = useTemplateRef("modal");

    defineExpose({
        open: computed(() => modal.value?.open),
        context: computed(() => modal.value?.context),
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>