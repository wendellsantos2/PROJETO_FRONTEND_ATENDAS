<template>
    <Modal
        ref="modal"
        title="Membros"
        :contextInitial
        position="right"
        size="xs"
    >
        <template #head>
            <Vueform
                v-model="searchMembers"
                sync
                :endpoint="false"
                class="order-last w-full"
            >
                <TextElement
                    name="search"
                    inputType="search"
                    placeholder="Pesquisar"
                >
                    <template #addon-after>
                        <Icon name="search" />
                    </template>
                </TextElement>
            </Vueform>
        </template>

        <template #default="{ toggle, context }">
            <InfiniteList
                ref="infiniteList"
                :key="context.id"
                v-slot="{ item: member }"
                :request="`admin/companies/${context.id}/users`"
                :opts="{
                    asyncData: {
                        immediate: false
                    }
                }"
                overflow
                classList="gap-6"
            >
                <li class="flex flex-row items-center gap-2 rounded-xl bg-background-100 p-2 shadow">
                    <img
                        :src="member.avatar_url"
                        :alt="member.name"
                        class="size-7 rounded-full border-2 bg-background object-cover object-center"
                        :style="`border-color: ${member.role?.color}`"
                    >
                    <div class="flex flex-row items-center gap-2">
                        <h6 class="font-medium">
                            {{ member.name }}
                        </h6>
                        <Badge
                            :name="`${member.online ? 'On' : 'Off'}line`"
                            :color="member.online ? 'success' : 'danger'"
                            variant="solid"
                            contrast="#FFFFFF"
                            :icon="false"
                        />
                    </div>
                    <Button
                        v-tooltip="'Logar como esse usuário'"
                        color="warn"
                        size="sm"
                        class="ml-auto"
                        :action="async () => {
                            await useUserStore().impersonate(member.id)
                            toggle(false)
                        }"
                    >
                        <Icon name="login" />
                    </Button>
                </li>
            </InfiniteList>
        </template>
    </Modal>
</template>

<script setup lang="ts">
    import type { InfiniteList } from "#components";
    import type { ComponentExposed } from "~/types";

    const infiniteList = ref<ComponentExposed<typeof InfiniteList<"admin/companies/:id/users">>>();
    const searchMembers = ref<Record<string, string>>({});

    const contextInitial = {
        id: 0,
        name: ""
    };

    const modal = useModal<typeof contextInitial>();

    watch(() => modal.value?.open, async (v) => {
        if (v) {
            await nextTick();
            infiniteList.value?.reset();
        }
        else {
            searchMembers.value.search = "";
        }
    });

    watch(searchMembers, (newValue) => {
        if (!([null, undefined].includes(newValue?.search as any)) && newValue.search.length > 0) {
            infiniteList.value!.filters.name = newValue.search;
        }
    }, {
        deep: true
    });

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>