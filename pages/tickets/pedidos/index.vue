<template>
    <section
        v-if="statuses?.length"
        class="relative grow"
    >
        <LayoutPortal to="HeaderBefore">
            <Button
                variant="gradient"
                @click="upSert?.toggle()"
            >
                <Icon name="plus" class="md:hidden lg:block xl:hidden" />
                <span class="hidden md:block lg:hidden xl:block">
                    Adicionar ticket
                </span>
            </Button>
        </LayoutPortal>

        <TransitionGroupTranslateX
            tag="ul"
            class="mask-transparent-border absolute inset-0 flex size-full snap-x snap-mandatory scroll-pl-4 flex-row gap-6 overflow-auto p-4 !pt-0 [--deg:90deg] [--size:1rem] sm:scroll-pl-6 sm:p-6 sm:[--size:1.5rem]"
        >
            <li
                v-for="status in statuses"
                :key="status.id"
                class="flex flex-none snap-start snap-always flex-col rounded-2xl border-2 border-dashed border-transparent bg-background-100 transition-all duration-300 sm:w-[30rem]"
                :class="[
                    {
                        'animate-pulse !border-secondary': _dragEvent
                    },
                    statuses.length > 1 ? 'w-[calc(100dvw-4rem)]' : 'w-full'
                ]"
                @drop="onDrop($event, status)"
            >
                <InfiniteList
                    :ref="(e) => refer(e, status.id)"
                    request="v1/tickets"
                    :opts="{
                        keyPrefix: `status:${status.id}`,
                        preFilters: false,
                        fetch: {
                            params: {
                                'filter[status_id]': status.id
                            }
                        }
                    }"
                    sortPath="priority.id"
                    class="grow p-4 [--size:1rem] sm:p-6 sm:[--size:1.5rem]"
                    classList="gap-6"
                >
                    <template #before>
                        <Badge
                            key="title"
                            tag="li"
                            :color="status.color"
                            variant="solid"
                            :name="status.name"
                            :icon="false"
                            :resumeString="99"
                            size="none"
                            class="sticky top-0 z-1 w-full justify-center p-3 !text-center text-lg"
                        />
                    </template>

                    <template #default="{ item }">
                        <li
                            class="relative flex flex-col justify-between gap-4 rounded-2xl bg-background p-4 shadow"
                            :class="{ 'border border-success shadow-success/50': item.completed_at }"
                            :draggable="!item.completed_at && canDragging"
                            @dragstart="dragStart($event, item)"
                        >
                            <span
                                v-tooltip="item?.category.name"
                                class="absolute inset-y-0 left-0 my-8 w-2 -translate-x-1/2 rounded-full"
                                :style="`background-color: ${item?.category.color}`"
                            />
                            <div class="flex flex-row items-center gap-4">
                                <img
                                    v-tooltip="item?.user.name"
                                    :src="item?.user.avatar_url"
                                    :alt="item?.user.name"
                                    class="size-16 rounded-full border-2 border-transparent bg-background outline outline-2"
                                    :style="`outline-color: ${item?.user?.role?.color}`"
                                >
                                <div class="flex flex-col gap-1">
                                    <h4 class="font-bold">
                                        {{ item.subject }}
                                    </h4>
                                    <span
                                        v-if="item.deadline"
                                        class="text-sm font-medium opacity-50"
                                    >
                                        SLA {{ useDateFormat(item.deadline, "DD/MM/YY").value }}
                                    </span>
                                </div>
                            </div>
                            <p class="line-clamp-2 text-contrast-300">
                                {{ item.content }}
                            </p>
                            <div class="flex flex-row flex-wrap items-center justify-between gap-4">
                                <span class="rounded-full bg-contrast/50 px-2 py-0.5 text-sm font-medium text-background">
                                    Aberto
                                    <span class="lowercase">
                                        {{ usePastTime(item.created_at) }}
                                    </span>
                                </span>
                                <div class="flex flex-row items-center gap-4">
                                    <Button
                                        v-if="[item.attendant?.id, item.user?.id].includes($user.value?.id)"
                                        v-tooltip="(item.completed_at ? 'Comentários' : 'Comentar') + (item.unread_comments_number > 0 ? ` | ${item.unread_comments_number} comentários não lidos` : '')"
                                        :href="`/tickets/pedidos/${item.id}`"
                                        color="quarter"
                                        size="sm"
                                        class="relative overflow-visible p-1.5"
                                    >
                                        <span
                                            v-if="item.unread_comments_number > 0"
                                            class="absolute -right-1 -top-1 z-2 inline-flex aspect-square h-4 items-center justify-center rounded-full bg-warn px-1 text-[.6rem] font-bold text-white"
                                        >
                                            {{ item.unread_comments_number < 1000 ? item.unread_comments_number : '999+' }}
                                        </span>
                                        <Icon name="comments" size="1.2rem" />
                                    </Button>
                                    <Button
                                        v-if="!item.completed_at"
                                        v-tooltip="'Editar'"
                                        color="primary"
                                        size="sm"
                                        class="p-1.5"
                                        @click="upSert?.toggle(true, {
                                            id: item.id,
                                            user_id: item?.user?.id,
                                            status_id: item?.status?.id,
                                            priority_id: item?.priority?.id,
                                            form: {
                                                ...item,
                                                tags: item?.tags?.map(({ id }) => id),
                                                category_id: item?.category.id
                                            }
                                        })"
                                    >
                                        <Icon name="edit" size="1.2rem" />
                                    </Button>
                                    <Badge
                                        v-tooltip="`Prioridade: ${item.priority?.name ?? 'Não definida'}`"
                                        size="none"
                                        :icon="false"
                                        :name="false"
                                        :color="item.priority?.color"
                                        class="p-1.5"
                                        :class="{ 'opacity-40': !item.priority }"
                                    >
                                        <Icon name="priority" size="1.3rem" />
                                    </Badge>
                                    <Badge
                                        v-if="item.completed_at"
                                        v-tooltip="`Concluído desde ${useDate(item.completed_at)}`"
                                        size="none"
                                        :icon="false"
                                        :name="false"
                                        color="success"
                                        class="p-1.5"
                                    >
                                        <Icon name="check" size="1.3rem" />
                                    </Badge>
                                </div>
                            </div>
                        </li>
                    </template>
                </InfiniteList>
            </li>
        </TransitionGroupTranslateX>

        <LazyTicketUpSert
            ref="upSert"
        />
    </section>

    <Container
        v-else
        addClass="items-center justify-center"
    >
        <h4>
            Ops, nenhuma situação disponível :(
        </h4>
        <Button
            v-if="useCheckPermissions(['create_status', 'update_status'])"
            href="/tickets/situacoes"
        >
            Configurar
        </Button>
    </Container>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";
    import type { InfiniteList, TicketUpSert } from "#components";
    import type { ComponentExposed } from "~/types";

    type TicketsList = ComponentExposed<typeof InfiniteList<"v1/tickets">>;
    type Ticket = Parameters<TicketsList["upSert"]>["0"];
    type Status = InternalApi["v1/statuses/:id"]["get"]["data"];

    definePageMeta({
        title: "Tickets",
        navOrder: 10,
        layoutConfig: {
            search: true,
            filters: {
                status_id: {
                    type: "multiselect",
                    label: "Situação",
                    placeholder: "Selecione as situações",
                    items: async name => await useFetchSelect("v1/statuses", {
                        filters: {
                            name
                        }
                    })
                },
                user_id: {
                    type: "multiselect",
                    label: "Usuários",
                    placeholder: "Selecione os usuários",
                    items: async name => await useFetchSelect("v1/users", {
                        filters: { name }
                    })
                },
                priority_id: {
                    type: "multiselect",
                    label: "Prioridades",
                    placeholder: "Selecione as prioridades",
                    items: async name => await useFetchSelect("v1/priorities", {
                        filters: { name }
                    })
                },
                category_id: {
                    type: "multiselect",
                    label: "Categorias",
                    placeholder: "Selecione as categorias",
                    items: async name => await useFetchSelect("v1/categories", {
                        filters: { name }
                    })
                },
                tag_id: {
                    type: "multiselect",
                    label: "Etiquetas",
                    placeholder: "Selecione as etiquetas",
                    items: async name => await useFetchSelect("v1/tags", {
                        filters: {
                            name,
                            type: "ticket"
                        }
                    })
                }
            }
        }
    });

    const { $user } = useNuxtApp();
    const statusIds = ref<number[]>([]);

    const { data: statuses } = useLazyAsyncData("tickets:statuses", async () => {
        const { data: _data } = await useFetchApi("v1/statuses", {
            params: {
                sort: "sort_order",
                "filter[id]": statusIds.value,
                "filter[display_in_kanban]": true
            }
        });

        return _data;
    }, {
        server: false,
        watch: [statusIds]
    });

    const ticketsList: Record<number, TicketsList> = {};

    const refer = (el: Element | globalThis.ComponentPublicInstance | null, status: number) => {
        el
            ? ticketsList[status] = el as unknown as TicketsList
            : delete ticketsList?.[status];
    };

    useBusLayout().on((event) => {
        if ("search" in event) {
            Object.values(ticketsList).forEach((ticket) => {
                ticket.filters.subject = event.search;
            });
        }

        if (event?.filters?.status_id) {
            statusIds.value = (event.filters.status_id as number[]);
            delete event.filters.status_id;
        }

        if (event?.filters && Object.keys(event?.filters).length) {
            Object.values(ticketsList).forEach((ticket) => {
                ticket.filters = Object.assign(ticket.filters, event.filters);
            });
        }
    });

    const canDragging = false;
    const dragEvent = useDragEvent();
    const _dragEvent = computed(() => dragEvent.value && canDragging);

    const dragStart = (event: DragEvent, ticket: Ticket) => {
        if (event.dataTransfer && canDragging && !ticket.completed_at) {
            event.dataTransfer.clearData();
            event.dataTransfer.setData("ticket", JSON.stringify(ticket));
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.dropEffect = "move";
        }
    };

    const onDrop = async (event: DragEvent, status: Status) => {
        try {
            const data = JSON.parse(event.dataTransfer?.getData("ticket") || "") as Ticket;

            if (data?.status?.id === status.id) {
                return;
            }

            await useFetchApi(`v1/tickets/${data.id}`, {
                method: "PUT",
                body: {
                    status_id: status.id
                }
            });

            ticketsList[data!.status!.id!]?.remove(data.id);

            data.status = status;
            ticketsList[status.id]?.upSert(data);
        }
        catch {
            return;
        }
    };

    const upSert = ref<InstanceType<typeof TicketUpSert>>();

    usePusher({
        name: "private-users.{id}",
        id: $user.value?.id ?? 0
    }, {
        upsertTicket (data) {
            if (data.status) {
                ticketsList[data.status.id]?.upSert(data);
            }
        },

        commentTicket (data) {
            const get = ticketsList[data.status_id]?.get(data.id);

            ticketsList[data.status_id]?.upSert({
                id: data.id,
                unread_comments_number: get.unread_comments_number + 1
            });
        },

        changeStatusTicket (data) {
            const ticket = ticketsList[data.status_from]?.get(data.ticket_id);

            ticketsList[data.status_from]?.remove(data.ticket_id);
            ticketsList[data.status_to]?.upSert(ticket);
        }
    });
</script>