<template>
    <section class="flex grow flex-row justify-end overflow-hidden md:gap-6 md:p-6 md:pt-0">
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                class="md:hidden"
                @click="open = !open"
            >
                <Icon name="details" />
                Detalhes
            </Button>

            <Button
                v-if="!data?.completed_at"
                color="contrast"
                @click="upSert?.toggle(true, {
                    id,
                    user_id: data?.user?.id,
                    status_id: data?.status?.id,
                    priority_id: data?.priority?.id,
                    form: {
                        ...data,
                        tags: data?.tags?.map(({ id }) => id),
                        category_id: data?.category.id
                    }
                })"
            >
                <Icon name="edit" />
                Editar
            </Button>
            <Button
                v-if="useCheckPermissions('assign_ticket') && !data?.completed_at"
                color="success"
                @click="confirmeCompleted?.toggle(true)"
            >
                <Icon name="check" />
                Concluir
            </Button>
            <Button
                v-if="useCheckPermissions('delete_ticket')"
                type="button"
                color="danger"
                @click="confirmeDelete?.toggle(true)"
            >
                <Icon name="delete" />
                Deletar
            </Button>
        </LayoutPortal>

        <LazyTicketComments
            :ticket="data!"
            class="w-full flex-none rounded-3xl pr-0 max-md:rounded-b-none md:order-last md:w-auto md:grow"
        />

        <div
            class="flex w-72 flex-none flex-col p-4 !pt-0 transition-all duration-500 *:rounded-3xl *:px-4 *:py-6 sm:p-6 md:w-60 md:p-0"
            :class="{
                'animate-pulse blur-sm': pending,
                '-mr-72 md:mr-0': !open
            }"
        >
            <div class="relative flex !w-full flex-col justify-between gap-4 !whitespace-normal bg-support !pt-8 !normal-case !leading-tight text-white before:absolute before:inset-x-0 before:bottom-0 before:mx-4 before:h-2 before:translate-y-1/2 before:bg-gradient-to-r before:from-support before:from-50% before:to-background before:to-50% before:bg-[17px_4px,100%_4px] after:absolute after:left-1/2 after:top-0 after:size-12 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-background after:transition-all after:duration-500">
                <div class="flex flex-row items-center gap-2 text-left">
                    <img
                        :src="data?.user.avatar_url"
                        :alt="data?.user.name"
                        class="size-16 rounded-full border-2 bg-background"
                        :style="`border-color: ${data?.user.role.color}`"
                    >
                    <div class="flex flex-col gap-1">
                        <h5 class="font-medium">
                            {{ data?.user.name }}
                        </h5>
                        <Badge
                            :color="data?.category.color"
                            variant="solid"
                            :name="data?.category.name"
                            icon="category"
                            class="px-2 py-0.75"
                        />
                    </div>
                </div>
                <div class="flex flex-row flex-wrap gap-4">
                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-medium">
                            Prioridade
                        </span>

                        <Badge
                            :color="data?.priority?.color"
                            variant="subtle"
                            :name="data?.priority?.name"
                            icon="priority"
                            :resumeString="8"
                            class="px-2 py-0.75"
                        />
                    </div>

                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-medium">
                            Situação
                        </span>

                        <Badge
                            :color="data?.status?.color"
                            variant="subtle"
                            :name="data?.status?.name"
                            icon="clock"
                            :resumeString="8"
                            class="px-2 py-0.75"
                        />
                    </div>
                </div>
            </div>
            <div class="relative flex grow flex-col overflow-hidden bg-background-200 shadow-md">
                <div class="flex flex-row flex-wrap gap-2">
                    <h4 class="w-full font-bold">
                        {{ data?.subject }}
                    </h4>
                    <Badge
                        v-for="tag in data?.tags"
                        :key="tag.id"
                        :color="tag.color"
                        :name="tag.name"
                    />
                </div>

                <div class="mask-transparent-border relative -mr-4 grow overflow-auto">
                    <p class="absolute inset-x-0 inline-block py-6 pr-4">
                        {{ data?.content }}
                    </p>
                </div>

                <div class="mt-auto flex flex-row flex-wrap items-center justify-center gap-4 text-center *:grow *:rounded-full *:border *:border-contrast-300 *:px-2 *:py-0.25 *:text-sm">
                    <span>
                        <strong>{{ data?.total_comments }}</strong> Cometário{{ data?.total_comments === 1 ? "" : "s" }}
                    </span>
                    <span
                        :class="{ 'cursor-pointer select-none transition-all duration-300 hover:border-primary hover:bg-white hover:text-primary': data?.media.length }"
                        @click="data?.media.length ? medias?.toggle(true, { id, media: data?.media }) : null"
                    >
                        <strong>{{ data?.media.length }}</strong> Anexo{{ data?.media.length === 1 ? "" : "s" }}
                    </span>
                </div>
            </div>
        </div>

        <LazyTicketUpSert
            ref="upSert"
            @then="refresh"
        />

        <LazyTicketMedias
            ref="medias"
        />

        <LazyModalConfirm
            ref="confirmeCompleted"
            title="concluir"
            :button="{ color: 'success' }"
            v-bind="confirmBind({
                method: 'PUT',
                body: {
                    completed: true
                }
            })"
            @then="back"
        />

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            v-bind="confirmBind({ method: 'delete' })"
            @then="back"
        />
    </section>
</template>

<script setup lang="ts">
    import type { NitroFetchOptions } from "nitropack/types";
    import type { TicketUpSert, TicketMedias } from "#components";
    import type { ComponentExposed } from "~/types";

    definePageMeta({
        title: "ticket"
    });

    const id = Number(useRoute().params.id.toString());
    const back = async () => await navigateTo("/tickets/pedidos");

    if (!id) {
        await back();
        useBusError().emit("Identificador não é um número");
    }

    const open = ref(false);

    const { data, refresh, pending } = await useAsyncData("ticket:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v1/tickets/${id}`);

            return _data;
        }
        catch {
            await back();
        }
    });

    const upSert = ref<ComponentExposed<typeof TicketUpSert>>();
    const medias = ref<ComponentExposed<typeof TicketMedias>>();

    const confirmBind = (fetchOpts?: NitroFetchOptions<"v1/tickets/:id">) => ({
        contextInitial: {
            id,
            name: data.value?.subject,
            user: data.value?.user.name
        },
        complement: "o ticket #{id} {name} de {user}",
        action: async ({ id }: { id: number }) => await useFetchApi(`v1/tickets/${id}`, fetchOpts)
    });

    const confirmeCompleted = useModalConfirm();
    const confirmeDelete = useModalConfirm();
</script>