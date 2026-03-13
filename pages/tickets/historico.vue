<template>
    <TablePage
        ref="tablePage"
        request="v1/tickets"
        :opts="{
            preFilters: false,
            fetch: {
                params: {
                    include: 'tags'
                }
            }
        }"
        :thead="[
            { name: 'Assunto', propertyPath: 'subject' },
            { name: 'Usuário', slot: 'user' },
            { name: 'Atendente', slot: 'attendant' },
            { name: 'Etiquetas', slot: 'tags' },
            { name: 'Situação', slot: 'status' },
            { name: 'SLA', propertyPath: 'deadline', transform: useDate },
            { name: 'Criado em', propertyPath: 'created_at', transform: useDate },
            { name: 'Concluído em', propertyPath: 'completed_at', transform: useDate }
        ]"
        itemClick="/tickets/pedidos"
    >
        <template #user="{ user: { avatar_url, name } }">
            <div class="flex flex-row items-center gap-3">
                <img
                    :src="avatar_url"
                    class="block size-8 rounded-full bg-background object-cover object-center"
                >
                <p>
                    {{ name }}
                </p>
            </div>
        </template>

        <template #attendant="{ attendant }">
            <div v-if="attendant" class="flex flex-row items-center gap-3">
                <img
                    :src="attendant.avatar_url"
                    class="block size-8 rounded-full bg-background-100 object-cover object-center"
                >
                <p>
                    {{ attendant.name }}
                </p>
            </div>
        </template>

        <template #tags="{ tags }">
            <template v-if="tags?.at(0)">
                <Badge
                    :color="tags.at(0)?.color"
                    :name="tags.at(0)?.name"
                    :resumeString="20"
                    :icon="false"
                    size="sm"
                />
                <span v-show="tags.length > 1">
                    + {{ tags.length-1 }}
                </span>
            </template>
        </template>

        <template #status="{ status }">
            <Badge
                :color="status?.color"
                :name="status?.name"
                :icon="false"
                size="sm"
            />
        </template>

        <template #actions="{ id, completed_at }">
            <Button

                v-tooltip="completed_at ? 'Comentários' : 'Comentar'"
                :href="`/tickets/pedidos/${id}`"
                color="quarter"
                size="sm"
            >
                <Icon name="comments" />
            </Button>
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "histórico",
        navOrder: 11,
        permissions: "manager_ticket",
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

    const tablePage = useTablePage();

    useBusLayout().on((event) => {
        if (event?.filters && tablePage.value?.filters) {
            tablePage.value.filters = Object.assign(tablePage.value.filters, event.filters);
        }
    });
</script>