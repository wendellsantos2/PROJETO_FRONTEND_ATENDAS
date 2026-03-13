<template>
    <Container
        grid
        addClass="md:grid-cols-2 2xl:grid-cols-3"
        :pending
        :pagination="paginationInfo"
        @pagination="(v) => pagination.page = v"
    >
        <Card
            v-for="item in data"
            :key="item.id"
            :data="{
                ...item,
                description: item.content
            }"
            :toggle="useCheckPermissions('update_template')"
            :edit="useCheckPermissions('update_template')"
            :delete="useCheckPermissions('delete_template')"
            @edit="async ({ id }) => await navigateTo(`/mensagens/modelos/${id}`)"
            @toggle="({ id, value }) => active(id, value)"
            @delete="({ id, name }) => confirmeDelete?.toggle(true, { id, name })"
        >
            <ViewMedia class="!h-48 !rounded-2xl bg-background-100" :src="item.media?.link" />
        </Card>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_template')"
                    :href="`/mensagens/modelos/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar modelo
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="o modelo de mensagem"
                :action="async ({ id }) => await useFetchApi(`v1/templates/${id}`, {
                    method: 'delete'
                })"
                @then="refresh"
            />
        </template>
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "modelos",
        navOrder: 20,
        permissions: "read_template",
        layoutConfig: {
            search: true
        }
    });

    const {
        data,
        pending,
        refresh,
        pagination,
        paginationInfo,
        filters
    } = useFetchData("v1/templates", {
        fetch: {
            params: {
                per_page: 12
            }
        }
    });

    useBusLayout().on((event) => {
        if ("search" in event) {
            filters.value.name = event.search;
        }
    });

    const active = async (id: number, value: boolean) => {
        await useFetchApi(`v1/templates/${id}`, {
            method: "PUT",
            body: {
                is_active: value
            }
        });

        await refresh();
    };

    const confirmeDelete = useModalConfirm();
</script>