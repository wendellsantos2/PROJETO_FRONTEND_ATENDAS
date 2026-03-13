<template>
    <TablePage
        ref="tablePage"
        request="v1/contacts"
        :thead="[
            { name: 'Lead', slot: 'lead' },
            { name: 'Origem do lead', propertyPath: 'source_name' },
            { name: 'Vendedor', slot: 'seller' },
            { name: 'Etapa', propertyPath: 'stage.name' },
            { name: 'Criado', propertyPath: 'created_at', transform: usePastTime }
        ]"
        :opts="{
            preFilters: false,
            fetch: {
                params: {
                    'filter[in_crm]': true
                }
            }
        }"
        :itemClick="false"
    >
        <template #lead="{ avatar_url, name }">
            <div class="flex flex-row items-center gap-3">
                <img
                    :src="avatar_url"
                    class="block size-8 rounded-full bg-background-100 object-cover object-center"
                >
                <p>
                    {{ name }}
                </p>
            </div>
        </template>

        <template #seller="{ user }">
            <div
                v-if="user"
                class="flex flex-row items-center gap-3"
            >
                <img
                    :src="user.avatar_url"
                    class="block size-8 rounded-full bg-background-100 object-cover object-center"
                >
                <p>
                    {{ user.name }}
                </p>
            </div>
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    definePageMeta({
        navOrder: 30,
        permissions: "read_contact",
        layoutConfig: {
            search: true,
            filters: {
                source_name: {
                    type: "text",
                    label: "Origem do lead",
                    placeholder: "Origem do lead"
                },
                seller_id: {
                    type: "multiselect",
                    label: "Vendedores",
                    placeholder: "Selecione os vendedores",
                    items: async name => await useFetchSelect("v1/users", {
                        filters: { name }
                    })
                },
                period: {
                    type: "dates",
                    label: "Período",
                    placeholder: "Selecione o período",
                    valueFormat: "YYYY-MM-DD",
                    mode: "range"
                }
            }
        }
    });

    const tablePage = useTablePage();

    useBusLayout().on((event) => {
        if ("search" in event) {
            tablePage.value!.filters.name = event.search;
        }

        if (event?.filters && tablePage.value!.filters) {
            tablePage.value!.filters = Object.assign(tablePage.value!.filters, event.filters);
        }
    });
</script>