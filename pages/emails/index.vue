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
                description: item.subject
            }"
            :edit="useCheckPermissions('update_mail_template')"
            :delete="useCheckPermissions('delete_mail_template')"
            @delete="({ id, name }) => confirmeDelete?.toggle(true, { id, name })"
            @edit="async ({ id }) => await navigateTo(`/emails/${id}`)"
        >
            <iframe
                :srcdoc="`
                        <!doctype html>
                        <html>
                            <body style='padding: 0; margin: 0'>${item.html_template}</body>
                        </html>`
                "
                scrolling="no"
                class="h-50 pointer-events-none w-full rounded-2xl border-2 border-white-300 bg-white-300"
            />
        </Card>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_mail_template')"
                    :href="`/emails/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <span class="hidden sm:block">
                        Adicionar modelo
                    </span>
                    <Icon name="plus" class="sm:hidden" />
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="o modelo de E-mail"
                :action="async ({ id }) => await useFetchApi(`v1/mail-templates/${id}`, {
                    method: 'delete'
                })"
                @then="refresh"
            />
        </template>
    </container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "Modelos de E-mail",
        navOrder: 31,
        icon: "mdi:email-fast-outline",
        permissions: "provider:smtp",
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
    } = useFetchData("v1/mail-templates");

    useBusLayout().on((event) => {
        if ("search" in event) {
            filters.value.name = event.search;
        }
    });

    const confirmeDelete = useModalConfirm();
</script>