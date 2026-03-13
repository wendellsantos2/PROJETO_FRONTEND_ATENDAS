<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="useCheckPermissions(['create_role', 'update_role'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ role ? "Salvar" : "Criar" }}
            </Button>
        </LayoutPortal>

        <Vueform
            v-model="form"
            sync
            :endpoint="false"
        >
            <TextElement
                name="display_name"
                label="Nome"
                placeholder="Equipe padrão"
                rules="required|min:1"
                addClass="sm:col-span-6"
            />
            <SelectColor
                default="#00ff33"
                :description="form?.color"
                class="sm:col-span-6"
            />

            <div class="col-span-full grid gap-x-6 gap-y-8 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                <span class="col-span-full">
                    Usuários com essa função poderão:
                </span>
                <CheckboxgroupElement
                    v-for="(permission, key) in permissions"
                    :key
                    :label="permission.at(0)?.group"
                    name="permissions"
                    :items="permission"
                    class="!col-span-1 rounded-xl border border-contrast/20 p-3"
                    :overrideClasses="{
                        ElementLabel: {
                            container: 'bg-background-100 w-fit !px-2 -mt-6 font-medium'
                        }
                    }"
                    :overrideClass="{
                        wrapper: 'flex flex-col gap-3'
                    }"
                    rules="required"
                />
            </div>
        </Vueform>
    </Container>
</template>

<script setup lang="ts">
    import { capitalize } from "vue";

    definePageMeta({
        title: "função"
    });

    const {
        role
    } = useRouteParams({
        create: "create_role",
        update: ["read_role", "update_role"]
    });

    const back = async () => await navigateTo("/configuracoes/funcoes");

    const {
        data: form
    } = await useAsyncData("roles:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v1/roles/${role}`);

            return {
                ...useOmit(_data, ["permissions"]),
                permissions: _data.permissions.map(({ id }) => id)
            };
        }
        catch {
            await back();
        }
    }, {
        default: () => ({
            name: "",
            color: "",
            permissions: []
        }),
        immediate: !!role
    });

    const orderLabel = ["ver", "criar", "atualizar", "excluir"];

    const { data: permissions } = useLazyAsyncData("permissions:search", async () => {
        const { data: _data } = await useFetchApi("v1/permissions", {
            params: {
                per_page: 999
            }
        });

        const transformed = _data.map(({ id: value, display_name: label }) => {
            const group = label.split(" ").at(-1) ?? "";
            return {
                value,
                label: capitalize(label.replace(group, "").replace(/\sde\s*$/, "").trim()),
                group: capitalize(group)
            };
        }).sort((a, b) => {
            const groupComparison = a.group.localeCompare(b.group);

            if (groupComparison !== 0) {
                return groupComparison;
            }

            const labelIndexA = orderLabel.indexOf(a.label.toLowerCase());
            const labelIndexB = orderLabel.indexOf(b.label.toLowerCase());

            if (labelIndexA !== -1 && labelIndexB !== -1) {
                return labelIndexA - labelIndexB;
            }

            if (labelIndexA !== -1) {
                return -1;
            }
            if (labelIndexB !== -1) {
                return 1;
            }

            return a.label.localeCompare(b.label);
        });

        return useGroupBy(transformed, ({ group }) => group.normalize("NFD").replace(/[\u0300-\u036F]/g, ""));
    });

    const user = useUserStore();

    const upSert = async () => {
        await useFetchApi(`v1/roles/${role || ""}`, {
            method: role ? "PUT" : "POST",
            body: form.value
        });

        if (role === user.data?.role?.id) {
            await user.refresh();
        }

        await back();
    };
</script>