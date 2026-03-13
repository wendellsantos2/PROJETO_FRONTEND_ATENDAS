<template>
    <TablePage
        ref="tablePage"
        request="v1/users"
        :thead="[
            { name: 'Nome', slot: 'user' },
            { name: 'Função', slot: 'role' },
            { name: 'Equipes', slot: 'teams' },
            { name: 'E-mail', propertyPath: 'email' }
        ]"
        :itemClick="useCheckPermissions('update_user')"
    >
        <template #user="{ avatar_url, role, name, online, score }">
            <div class="flex flex-row items-center gap-4">
                <img
                    :src="avatar_url"
                    class="m-1 block size-10 rounded-full border-2 border-transparent bg-background object-cover object-center outline outline-2 outline-secondary"
                    :style="`outline-color: ${role.color}`"
                >
                <div class="flex flex-col gap-1">
                    <div class="flex flex-row items-center gap-2">
                        <h6 class="font-medium">
                            {{ name }}
                        </h6>
                        <Badge
                            :name="`${online ? 'On' : 'Off'}line`"
                            :color="online ? 'success' : 'danger'"
                            variant="solid"
                            contrast="#FFFFFF"
                            :icon="false"
                        />
                    </div>
                    <div class="flex flex-row gap-1 text-contrast/20">
                        <Icon
                            v-for="(s) in 5"
                            :key="s"
                            name="ph:star-fill"
                            :class="{ 'text-warn': s <= score }"
                        />
                        ({{ score }})
                    </div>
                </div>
            </div>
        </template>

        <template #teams="{ teams }">
            <template v-if="teams.at(0)">
                <Badge
                    :color="teams.at(0)?.color"
                    :name="teams.at(0)?.name"
                    :resumeString="20"
                    :icon="false"
                    size="sm"
                />
                <span v-show="teams.length > 1">
                    + {{ teams.length-1 }}
                </span>
            </template>
        </template>

        <template #role="{ role }">
            <Badge
                :color="role?.color"
                :name="role.display_name"
                :resumeString="20"
                :icon="false"
                size="sm"
            />
        </template>

        <template #actions="{ id, name }">
            <Button
                v-if="useCheckPermissions('impersonate_user') && id !== $user.value?.id && !$user.isImpersonating"
                v-tooltip="'Logar como esse usuário'"
                color="warn"
                size="sm"
                :action="async () => useUserStore().impersonate(id)"
            >
                <Icon name="login" size="1.2rem" />
            </Button>

            <Button
                v-if="useCheckPermissions('update_user')"
                v-tooltip="'Editar'"
                :href="`/configuracoes/usuarios/${id}`"
                color="background"
                size="sm"
            >
                <Icon name="edit" size="1.2rem" />
            </Button>

            <Button
                v-if="useCheckPermissions('delete_user')"
                v-tooltip="'Deletar'"
                color="danger"
                size="sm"
                @click="confirmeDelete?.toggle(true, { id, name })"
            >
                <Icon name="delete" size="1.2rem" />
            </Button>
        </template>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_user')"
                    :href="`/configuracoes/usuarios/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar usuário
                    </span>
                </Button>
            </LayoutPortal>

            <LazyModalConfirm
                ref="confirmeDelete"
                title="deletar"
                the="o usuário"
                :action="async ({ id }) => await useFetchApi(`v1/users/${id}`, {
                    method: 'delete'
                })"
                @then="tablePage?.refresh"
            />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "usuários",
        navOrder: 20,
        permissions: "read_user",
        layoutConfig: {
            search: true
        }
    });

    const tablePage = useTablePage();

    useBusLayout().on((event) => {
        if ("search" in event) {
            tablePage.value!.filters.name = event.search;
        }
    });

    const confirmeDelete = useModalConfirm();
</script>