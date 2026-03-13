<template>
    <section class="grow">
        <LayoutPortal to="HeaderBefore">
            <div class="w-40" />
        </LayoutPortal>

        <Vueform
            v-model="form"
            sync
            class="absolute left-4 top-4 w-40 sm:left-6 sm:top-6 lg:left-auto lg:right-[22.5rem]"
        >
            <SelectElement
                name="funnel"
                object
                :items="funnels.data.value!"
                valueProp="id"
                labelProp="name"
                search
                :loading="funnels.status.value === 'pending'"
                :canClear="false"
                @searchChange="searchFunnel = $event"
            />
        </Vueform>

        <TransitionOpacity mode="out-in">
            <div
                v-if="stages?.length"
                class="relative h-full grow"
            >
                <TransitionGroupTranslateXN
                    tag="ul"
                    class="mask-transparent-border absolute inset-0 flex size-full snap-x snap-mandatory scroll-pl-4 flex-row gap-6 overflow-auto p-4 !pt-0 [--deg:90deg] [--size:1rem] sm:scroll-pl-6 sm:p-6 sm:[--size:1.5rem]"
                >
                    <li
                        v-for="stage in stages"
                        :key="stage.id"
                        class="flex flex-none snap-start snap-always flex-col rounded-2xl border border-secondary bg-background-100 transition-all duration-300 sm:w-[30rem]"
                        :class="[
                            {
                                'animate-pulse border-2 border-dashed ': dragData && stage.id !== dragData.stage?.id,
                                'opacity-60': stage.last_stage
                            },
                            stages.length > 1 ? 'w-[calc(100dvw-4rem)]' : 'w-full'
                        ]"
                        :style="`border-color: ${stage.color}; background-color: color-mix(in hsl, ${stage.color} 10%, transparent 100%)`"
                        @drop.prevent="onDrop(stage)"
                        @dragenter.prevent
                        @dragover.prevent
                    >
                        <InfiniteList
                            :ref="(e) => refer(e, stage.id)"
                            request="v1/contacts"
                            :opts="{
                                keyPrefix: `stage:${stage.id}`,
                                preFilters: false,
                                fetch: {
                                    params: {
                                        'filter[stage_id]': stage.id
                                    }
                                }
                            }"
                            textEnd="Arraste e solte aqui"
                            textEmpty="Arraste e solte aqui"
                            class="grow p-4 [--size:1rem] sm:p-6 sm:[--size:1.5rem]"
                            classList="gap-6"
                        >
                            <template #before>
                                <Badge
                                    key="title"
                                    tag="li"
                                    :color="stage.color"
                                    variant="solid"
                                    :name="stage.name"
                                    :icon="stage.last_stage ? 'lock' : false"
                                    :resumeString="99"
                                    size="none"
                                    class="sticky top-0 z-1 w-full justify-center p-3 !text-center text-lg"
                                />
                            </template>

                            <template #default="{ item }">
                                <li
                                    class="relative flex flex-col justify-between gap-4 rounded-2xl bg-background p-4 shadow user-select-none"
                                    :draggable="!stage.last_stage"
                                    @dragstart="dragStart($event, item)"
                                    @click="funnel?.toggle(true, { id: item.id, funnel_id: item.funnel!.id, stage_id: item.stage!.id, form: {} })"
                                >
                                    <div class="flex flex-row items-center gap-4">
                                        <div class="relative">
                                            <img
                                                :src="item.avatar_url"
                                                :alt="item.name"
                                                class="size-14 flex-none rounded-full bg-background-100"
                                            >
                                            <span
                                                v-if="item.source_name"
                                                v-tooltip="`Origem: ${item.source_name}`"
                                                :name="`origem:${item.source_name}`"
                                                class="absolute right-0 top-0 flex rounded-full bg-background p-1"
                                            >
                                                <Icon :name="`origem:${item.source_name}`" />
                                            </span>
                                        </div>
                                        <div class="flex grow flex-col">
                                            <span class="text-xs font-bold leading-none text-primary">
                                                #{{ item.id }}
                                            </span>
                                            <h4 class="font-bold">
                                                {{ item.name }}
                                            </h4>
                                        </div>
                                        <NuxtLink
                                            :href="`/contatos/${item.id}`"
                                            class="mb-auto opacity-50 transition-all duration-500 hover:text-primary hover:opacity-100"
                                            @click.stop
                                        >
                                            <Icon name="linkOut" />
                                        </NuxtLink>
                                    </div>
                                    <ul class="grid flex-col gap-4 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-contrast/20 sm:*:px-4 sm:first:*:pl-0 sm:last:*:pr-0">
                                        <li
                                            v-for="([label, value], key) in [['E-Mail', item.email], ['Telefone', item.phone]]"
                                            :key
                                        >
                                            <span class="text-sm font-medium opacity-50">
                                                {{ label }}
                                            </span>
                                            <p class="truncate">
                                                {{ value ?? '- - -' }}
                                            </p>
                                        </li>
                                    </ul>
                                    <div class="flex flex-row flex-wrap items-center justify-between gap-4">
                                        <Badge
                                            :icon="false"
                                            :name="false"
                                            :color="item.metadata?.color || undefined"
                                            size="sm"
                                            class="normal-case"
                                        >
                                            Criado
                                            <span class="lowercase">
                                                {{ usePastTime(item.created_at) }}
                                            </span>
                                        </Badge>
                                        <div class="flex flex-row items-center gap-4">
                                            <Button
                                                v-tooltip="`Vendedor: ${item.user.name}`"
                                                color="background"
                                                size="sm"
                                                class="!p-0"
                                                @click.stop="seller?.toggle(true, { id: item.id, seller: item.user.id, form: {} })"
                                            >
                                                <img
                                                    :src="item.user.avatar_url"
                                                    :alt="item.user.name"
                                                    class="size-8 rounded-full"
                                                >
                                            </Button>
                                            <Button
                                                v-tooltip="item.last_conversation ? 'Ver Conversa' : 'Conversar'"
                                                color="secondary"
                                                size="sm"
                                                class="p-1.5"
                                                @click.stop="item.last_conversation
                                                    ? conversationWatch?.toggle(true, { id: item.last_conversation.id, conversation: item.last_conversation })
                                                    : newMessage?.toggle(true, { ...usePick(item, ['id', 'name', 'services', 'phone', 'country_code']), form: {} })
                                                "
                                            >
                                                <Icon
                                                    name="message"
                                                    size="1.2rem"
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            </template>
                        </InfiniteList>
                    </li>
                </TransitionGroupTranslateXN>
            </div>

            <Container
                v-else
                class="h-full"
                addClass="items-center justify-center"
            >
                <h4>
                    Ops, nenhum{{ funnels.data.value?.length ? 'a etapa' : ' funil' }} disponível {{ funnels.data.value?.length ? 'para esse funil' : '' }} :(
                </h4>
                <Button
                    v-if="useCheckPermissions(['create_funnel', 'update_funnel'])"
                    :href="`/configuracoes/funis/${form.funnel || 'criar'}`"
                >
                    Configurar
                </Button>
            </Container>
        </TransitionOpacity>

        <LazyCRMFunnel
            ref="funnel"
            @then="(contact, old) => {
                contactsList[(old.stage_id ?? 0)]?.remove(contact.id);
                contactsList[(contact?.stage?.id ?? 0)]?.upSert(contact, { order: 'first' });
            }"
        />

        <LazyContactSeller
            ref="seller"
            @then="contactsList[($event?.stage?.id ?? 0)]?.upSert($event)"
        />

        <LazyConversationNewMessage
            ref="newMessage"
        />

        <LazyConversationWatch
            ref="conversationWatch"
        />
    </section>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";
    import type { InfiniteList } from "#components";
    import type { ComponentExposed } from "~/types";

    type Contact = InternalApi["v1/contacts/:id"]["get"]["data"];
    type Stage = InternalApi["v1/funnels/:id/stages/:id"]["get"]["data"];

    definePageMeta({
        navOrder: 20,
        permissions: "read_contact",
        layoutConfig: {
            search: true
        }
    });

    const searchFunnel = ref("");

    const funnels = await useAsyncData("funnels", async () => {
        const { data: _data } = await useFetchApi("v1/funnels", {
            params: {
                "filter[name]": searchFunnel.value
            }
        });

        return _data;
    });

    watchDebounced(searchFunnel, () => funnels.refresh(), {
        debounce: 200,
        maxWait: 1000,
        deep: true
    });

    const form = useLocalStorage("crm:kanban", {
        funnel: funnels.data.value?.at(0)
    });

    const { data: stages } = await useAsyncData("stages", async () => {
        const { data: _data } = await useFetchApi(`v1/funnels/${form.value.funnel?.id}/stages`, {
            params: {
                sort: "position"
            }
        });

        return _data;
    }, {
        watch: [() => form.value.funnel],
        immediate: !!form.value.funnel
    });

    const dragData = ref<Contact | null>(null);
    const dragEvent = useDragEvent();

    watch(dragEvent, (v) => {
        if (v === false) {
            dragData.value = null;
        }
    });

    const dragStart = (event: DragEvent, contact: Contact) => {
        if (event.dataTransfer) {
            event.dataTransfer.clearData();
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.dropEffect = "move";

            dragData.value = contact;
        }
    };

    type ContactsList = ComponentExposed<typeof InfiniteList<"v1/contacts">>;
    const contactsList: Record<number, ContactsList> = {};

    useBusLayout().on((event) => {
        if ("search" in event) {
            Object.values(contactsList).forEach((contact) => {
                contact.filters.name = event.search;
            });
        }
    });

    const refer = (el: Element | globalThis.ComponentPublicInstance | null, stage: Stage["id"]) => {
        if (el) {
            contactsList[stage] = el as unknown as ContactsList;
        }
        else {
            delete contactsList?.[stage];
        }
    };

    const onDrop = async (stage: Stage) => {
        try {
            const contact = dragData.value!;

            if (!contact.stage || contact.stage.id === stage.id) {
                return;
            }

            const move = (remove: Stage["id"], add: Stage) => {
                const _contact = useMerge({}, contact, {
                    funnel: form.value.funnel,
                    stage: add
                });

                contactsList[remove]?.remove(_contact.id);
                contactsList[add.id]?.upSert(_contact, { order: "first" });
            };

            move(contact.stage.id, stage);

            try {
                await useFetchApi(`v1/contacts/${contact.id}`, {
                    method: "PUT",
                    body: {
                        funnel_id: form.value.funnel?.id,
                        stage_id: stage.id
                    }
                });
            }
            catch {
                move(stage.id, contact.stage);
            }
        }
        catch {
            return;
        }
    };

    const funnel = useTemplateRef("funnel");
    const seller = useTemplateRef("seller");
    const newMessage = useTemplateRef("newMessage");
    const conversationWatch = useTemplateRef("conversationWatch");
    const { $user } = useNuxtApp();

    const channel = useCheckPermissions("manager_contact")
        ? {
            name: "private-companies.{id}",
            id: $user.value?.company.id ?? 0
        } as const
        : {
            name: "private-users.{id}",
            id: $user.value?.id ?? 0
        } as const;

    usePusher(channel, {
        upsertContact (_data) {
            contactsList[(_data?.stage?.id ?? 0)]?.upSert(_data, { order: "first" });
        },
        removeStageContact ({ id, funnel, stage }) {
            if (funnel.id === form.value.funnel?.id) {
                contactsList[stage.id]?.remove(id);
            }
        }
    });
</script>