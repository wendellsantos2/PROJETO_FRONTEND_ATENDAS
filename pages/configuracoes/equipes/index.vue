<template>
    <Container
        grid
        :pending
        :pagination="paginationInfo"
        @pagination="(v) => pagination.page = v"
    >
        <li
            v-for="item in data"
            :key="item.id"
            class="relative flex flex-col items-center gap-5 rounded-3xl bg-background p-4 text-center shadow"
            :style="`--color: ${item.color}`"
        >
            <span class="absolute right-0 top-0 size-7 translate-x-1 rounded-full bg-[--color]" />
            <div class="_users z-0 flex flex-row items-center -space-x-4 *:size-12 *:rounded-full *:border-2 *:border-background *:bg-background-100 rtl:space-x-reverse">
                <img
                    v-for="(user) in item.users?.slice(0, 5)"
                    :key="user.id"
                    v-tooltip="user.name"
                    :src="user.avatar_url"
                    class="block object-cover object-center outline outline-2 outline-[--color] last:-z-1"
                >
                <span
                    v-for="i in (5 - item.users.length)"
                    :key="i"
                    class="flex flex-col items-center justify-center text-[--color]"
                    :style="useBacklightStyle(item.color)"
                >
                    <Icon name="userQuestion" />
                </span>
            </div>
            <div class="flex grow flex-col gap-1">
                <h5 class="font-bold">
                    {{ item.name }}
                </h5>
                <p class="line-clamp-2">
                    {{ item.description }}
                </p>
            </div>
            <div class="flex flex-row items-center gap-2">
                <Badge
                    color="contrast"
                    :name="`${item.totalUsers} membros`"
                    :icon="false"
                    size="sm"
                />
                <Badge
                    color="success"
                    :name="`${item.totalOnlineUsers} Online`"
                    :icon="false"
                    size="sm"
                />
            </div>
            <div class="flex flex-row items-center gap-2">
                <Button
                    v-if="useCheckPermissions('update_team')"
                    :href="`/configuracoes/equipes/${item.id}`"
                >
                    Editar equipe
                </Button>

                <Button
                    v-if="useCheckPermissions('delete_team')"
                    v-tooltip="'Deletar'"
                    color="danger"
                    class="!px-2"
                    @click="confirmeDelete?.toggle(true, { id: item.id, name: item.name })"
                >
                    <Icon name="delete" size="1.3rem" />
                </Button>
            </div>
        </li>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_team')"
                    :href="`/configuracoes/equipes/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar equipe
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="a equipe"
                :action="async ({ id }) => await useFetchApi(`v1/teams/${id}`, {
                    method: 'delete'
                })"
                @then="refresh"
            />
        </template>
    </container>
</template>

<script setup lang="ts">
    definePageMeta({
        navOrder: 30,
        permissions: "read_team",
        layoutConfig: {
            search: true
        }
    });

    const {
        data,
        pending,
        filters,
        pagination,
        paginationInfo,
        refresh
    } = useFetchData("v1/teams", {
        fetch: {
            params: {
                per_page: 16
            }
        }
    });

    useBusLayout().on((event) => {
        if ("search" in event) {
            filters.value.name = event.search;
        }
    });

    const confirmeDelete = useModalConfirm();
</script>

<style scoped lang="postcss">
    ._users {
        :nth-child(3) {
            @apply z-10 size-16;
        }

        :nth-child(4) {
            @apply z-1
        }
    }
</style>