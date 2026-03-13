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
            <div class="flex grow flex-col gap-1">
                <h5 class="font-bold">
                    {{ item.display_name }}
                </h5>
                <p>
                    Pessoas atribuídas a essa função:
                </p>
            </div>
            <div class="_users z-0 flex flex-row items-center -space-x-4 *:size-12 *:rounded-full *:border-2 *:border-background rtl:space-x-reverse">
                <img
                    v-for="(user) in item.users?.slice(0, 5)"
                    :key="user.id"
                    v-tooltip="{
                        content: content(user.name, user.online),
                        html: true
                    }"
                    :src="user.avatar_url"
                    class="block bg-background object-cover object-center outline outline-2 last:-z-1"
                    :class="user.online ? 'outline-success' : 'outline-danger'"
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
            <div class="flex flex-row items-center gap-2">
                <Button
                    v-if="useCheckPermissions('update_role')"
                    :href="`/configuracoes/funcoes/${item.id}`"
                >
                    Editar função
                </Button>
            </div>
        </li>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_role')"
                    :href="`/configuracoes/funcoes/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar função
                    </span>
                </Button>
            </LayoutPortal>
        </template>
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "Funções",
        navOrder: 40,
        permissions: "read_role",
        layoutConfig: {
            search: true
        }
    });

    const {
        data,
        pending,
        filters,
        pagination,
        paginationInfo
    } = useFetchData("v1/roles", {
        fetch: {
            params: {
                per_page: 16
            }
        },
        transform (_data) {
            return _data?.map((v) => {
                return {
                    ...v,
                    permissions: v?.permissions?.map(({ id }) => id)
                };
            });
        }
    });

    useBusLayout().on((event) => {
        if ("search" in event) {
            filters.value.name = event.search;
        }
    });

    const content = (name: string, online: boolean) => `${name} <span class="rounded-lg ml-2 py-1 px-2 font-medium ${online ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}">${online ? "Online" : "Offline"}</span>`;
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