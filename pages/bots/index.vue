<template>
    <Container
        grid
        addClass="lg:grid-cols-2 2xl:grid-cols-3"
        :pending
        :pagination="paginationInfo"
        @pagination="(v) => pagination.page = v"
    >
        <Card
            v-for="item in data"
            :key="item.id"
            :data="item"
            buttonText="Editar fluxo"
            :toggle="useCheckPermissions('update_bot')"
            :edit="useCheckPermissions('update_bot')"
            :delete="useCheckPermissions('delete_bot')"
            @delete="({ id, name }) => botDelete?.toggle(true, { id, name })"
            @edit="async ({ id }) => await navigateTo(`/bots/${id}`)"
            @toggle="async ({ id, value }) => {
                await upSert(id, { is_active: value })
                refresh();
            }"
        >
            <template #titleAfter>
                <span class="mt-auto inline-flex flex-row items-center gap-1 text-sm font-medium opacity-50">
                    <Icon name="category" size="0.75rem" />
                    {{ useBotTypes(item.type) }}
                </span>
            </template>

            <template #buttons>
                <Button
                    v-if="useCheckPermissions('update_bot')"
                    v-tooltip="'Editar info'"
                    class="!px-2"
                    @click="() => {
                        botId = item.id;
                        bot = item;
                        botUpSert?.toggle()
                    }"
                >
                    <Icon name="edit" />
                </Button>

                <Button
                    v-if="useCheckPermissions('clone_bot')"
                    v-tooltip="'Duplicar'"
                    class="!px-2"
                    color="secondary"
                    :action="async () => await useFetchApi(`v1/bots/${item.id}/clone`, {
                        method: 'POST'
                    })"
                    @then="refresh"
                >
                    <Icon name="duplicate" />
                </Button>

                <Button
                    v-if="useCheckPermissions('clone_bot')"
                    v-tooltip="'Baixar fluxo'"
                    class="!px-2"
                    color="contrast"
                    :action="async () => await download(item)"
                >
                    <Icon name="download" />
                </Button>
            </template>
        </Card>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_bot')"
                    variant="gradient"
                    @click="() => {
                        reset();
                        botUpSert?.toggle();
                    }"
                >
                    <span class="hidden sm:block">
                        Adicionar bot
                    </span>
                    <Icon name="plus" class="sm:hidden" />
                </Button>
            </LayoutPortal>

            <LazyBotUpSert
                ref="botUpSert"
                @then="refresh"
            />

            <LazyBotDelete
                ref="botDelete"
                @then="refresh"
            />
        </template>
    </Container>
</template>

<script setup lang="ts">
    import type { BotDelete, BotUpSert } from "#build/components";

    definePageMeta({
        title: "Bot de atendimento",
        navOrder: 20,
        icon: "bot",
        permissions: "read_bot",
        layoutConfig: {
            search: true,
            filters: {
                type: {
                    type: "multiselect",
                    label: "Tipo",
                    placeholder: "Selecione o tipo",
                    items: useBotTypes()
                }
            }
        }
    });

    const {
        data,
        pending,
        refresh,
        pagination,
        paginationInfo,
        filters
    } = useFetchData("v1/bots");

    const {
        id: botId,
        data: bot
    } = storeToRefs(useBotStore());

    const {
        upSert,
        reset,
        download
    } = useBotStore();

    useBusLayout().on((event) => {
        if ("search" in event) {
            filters.value.name = event.search;
        }

        if (event?.filters && filters.value) {
            filters.value = Object.assign(filters.value, event.filters);
        }
    });

    const botUpSert = ref<InstanceType<typeof BotUpSert>>();
    const botDelete = ref<InstanceType<typeof BotDelete>>();
</script>