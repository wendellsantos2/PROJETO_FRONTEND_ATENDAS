<template>
    <Modal
        ref="modal"
        title="Detalhes da mensagem"
        size="xs"
    >
        <ul class="flex flex-col gap-3">
            <li>
                <strong>ID: </strong>
                <Fallback :pending tag="span">
                    {{ data?.id }}
                </Fallback>
            </li>
            <li v-show="data?.sent_by">
                <strong>Atendente: </strong>
                <Fallback :pending tag="span">
                    {{ data?.sent_by }}
                </Fallback>
            </li>
            <li>
                <strong>Enviado de: </strong>
                <Fallback :pending tag="span">
                    {{ data?.is_inbound ? data?.recipient : data?.sender }}
                </Fallback>
            </li>
            <li>
                <strong>Recebido por: </strong>
                <Fallback :pending tag="span">
                    {{ data?.is_inbound ? data?.sender : data?.recipient }}
                </Fallback>
            </li>
            <li>
                <strong>Serviço usado: </strong>
                <Fallback :pending tag="span">
                    {{ data?.service }}
                </Fallback>
            </li>
            <p v-show="data?.media?.link">
                <strong>Mídia: </strong>
                <Fallback :pending>
                    <a :href="data?.media?.link" target="_blank" class="link">
                        {{ {
                            text: 'texto',
                            image: 'imagem',
                            audio: 'audio',
                            video: 'video',
                            file: 'arquivo'
                        }[data?.type!] }}
                    </a>
                </Fallback>
            </p>
            <li>
                <strong>Criada em: </strong>
                <Fallback :pending tag="span">
                    {{ useDateFormat(data?.created_at, 'DD/MM/YY - HH:mm').value }}
                </Fallback>
            </li>
            <p v-show="data?.created_at !== data?.updated_at">
                <strong>Atualizada em: </strong>
                <Fallback :pending tag="span">
                    {{ useDateFormat(data?.updated_at, 'DD/MM/YY - HH:mm').value }}
                </Fallback>
            </p>
            <li>
                <strong>Status: </strong>
                <Fallback :pending tag="span">
                    {{ {
                        created: "Criada",
                        submitted: "Enviando",
                        delivered: "Entregue",
                        rejected: "Rejeitada pelo serviço",
                        undeliverable: "Não entregue",
                        read: "Lida"
                    }?.[data?.status!] ?? data?.status }}
                </Fallback>
            </li>
        </ul>
    </Modal>
</template>

<script setup lang="ts">
    const modal = useModal<{
        id: string
    }>();

    const { data, refresh, pending } = useLazyAsyncData("messageInfo", async () => {
        return (await useFetchApi(`v1/messages/${modal.value?.context.id}`)).data;
    }, {
        immediate: false
    });

    whenever(() => !!modal?.value?.context?.id, () => refresh());

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>