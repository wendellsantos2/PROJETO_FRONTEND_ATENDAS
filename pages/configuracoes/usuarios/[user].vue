<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ user ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="useCheckPermissions('delete_user')"
                v-show="user"
                type="button"
                color="danger"
                @click="confirmeDelete?.toggle(true, usePick(data!, ['id', 'name']))"
            >
                <Icon name="delete" />
                Deletar
            </Button>
        </LayoutPortal>

        <Vueform
            v-model="form"
            sync
            :endpoint="false"
        >
            <VFileElement
                name="upload_id"
                accept=".png,.jpg,.jpeg,.webp"
                label="Foto de perfil"
                :view="$screen.value.xs && !$screen.value.md || $screen.value.xl ? 'row' : 'col'"
                class="md:col-span-6 md:row-span-4 xl:col-span-4"
            />
            <TextElement
                name="name"
                label="Nome"
                placeholder="Atendas user"
                rules="required|min:1"
                addClass="sm:col-span-6 xl:col-span-4"
            />
            <TextElement
                name="email"
                label="E-mail"
                placeholder="atendas@example.com"
                rules="required|email"
                addClass="sm:col-span-6 xl:col-span-4"
            />

            <SelectElement
                v-if="useCheckPermissions('assign_role')"
                name="role"
                label="Função"
                placeholder="Selecione uma função"
                :native="false"
                :search="true"
                :items="roles!"
                closeOnSelect
                addClass="sm:col-span-6 xl:col-span-4"
            >
                <template #single-label="{ value: { label, color } }">
                    <div class="flex grow flex-row items-center gap-4 pl-6 capitalize">
                        <span class="rounded-full p-3" :style="`background-color: ${color}`" />
                        <span>
                            {{ label }}
                        </span>
                    </div>
                </template>
            </SelectElement>

            <MultiselectElement
                v-if="useCheckPermissions('assign_team')"
                name="teams"
                label="Equipes"
                placeholder="Selecione as equipes"
                :native="false"
                :search="true"
                :items="teams!"
                :hideSelected="false"
                :closeOnSelect="false"
                :closeOnDeselect="false"
                addClass="sm:col-span-6 xl:col-span-4"
            >
                <template #option="{ option: { label, color } }">
                    <div class="flex grow flex-row items-center gap-4 capitalize">
                        <span class="rounded-full p-3" :style="`background-color: ${color}`" />
                        <span>
                            {{ label }}
                        </span>
                    </div>
                </template>
            </MultiselectElement>

            <Divider
                title="Segurança"
                class="col-span-full xl:col-span-8"
            />

            <TextElement
                autocomplete="new-password"
                name="password"
                label="Senha"
                placeholder="********"
                rules="confirmed|min:8"
                addClass="sm:col-span-6 xl:col-span-4"
            />
            <TextElement
                autocomplete="new-password"
                name="password_confirmation"
                label="Confirme a senha"
                placeholder="********"
                rules="min:8"
                addClass="sm:col-span-6 xl:col-span-4"
            />

            <Divider
                title="Mensageria"
                class="col-span-full"
            />

            <TextElement
                inputType="number"
                name="limit_conversations"
                label="Limite de conversas"
                placeholder="5"
                default="5"
                rules="required"
                addClass="sm:col-span-6 xl:col-span-4"
            />

            <LazySelectCategories
                name="categories"
                multi
                addClass="sm:col-span-6 xl:col-span-4"
            />

            <ObjectElement name="settings">
                <LazyUsersSettingsDazsoft
                    v-if="useCheckPermissions('provider:dazsoft')"
                    :contextForm="form"
                />

                <LazyUsersSettingsHubspot
                    v-if="useCheckPermissions('provider:hubspot')"
                />
            </ObjectElement>
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="o usuário"
            :action="async () => await useFetchApi(`v1/users/${user}`, {
                method: 'delete'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "usuário"
    });

    const {
        user
    } = useRouteParams({
        create: "create_user",
        update: ["read_user", "update_user"]
    });

    const back = async () => await navigateTo("/configuracoes/usuarios");

    const form = ref<Record<string, any>>({});

    const { data } = await useAsyncData("user:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v1/users/${user}`);

            form.value = {
                ..._data,
                role: _data.role.id,
                teams: _data.teams.map(({ id }) => id),
                categories: _data.categories.map(({ id }) => id)
            };

            return _data;
        }
        catch {
            await back();
        }
    }, {
        server: false,
        immediate: !!user
    });

    const { data: roles } = useLazyAsyncData("roles:search", async () => {
        const _data = await useFetchApi("v1/roles", {
            params: {
                per_page: 99
            }
        });

        return _data.data.map((v) => {
            return {
                value: v.id,
                label: v.display_name,
                color: v.color
            };
        });
    });

    const { data: teams } = useLazyAsyncData("teams:search", async () => {
        const _data = await useFetchApi("v1/teams", {
            params: {
                per_page: 99
            }
        });

        return _data.data.map((v) => {
            return {
                value: v.id,
                label: v.name,
                color: v.color
            };
        });
    });

    const upSert = async () => {
        await useFetchApi(`v1/users/${user || ""}`, {
            method: user ? "PUT" : "POST",
            body: useOmitBy(form.value, v => [null, undefined].includes(v))
        })
            .then(async () => {
                await back();
            });
    };

    const confirmeDelete = useModalConfirm();
</script>