<template>
    <MultiselectElement
        v-if="props.multi"
        v-bind="bind"
        :hideSelected="false"
        :closeOnSelect="false"
        :closeOnDeselect="false"
    >
        <template #option="{ option: { name, avatar_url, role } }">
            <div class="flex grow flex-row items-center gap-4 capitalize">
                <img
                    :src="avatar_url"
                    class="size-8 rounded-full border-2"
                    :style="`border-color: ${role.color}`"
                >
                <span>
                    {{ name }}
                </span>
            </div>
        </template>
    </MultiselectElement>
    <SelectElement
        v-else
        v-bind="bind"
        closeOnSelect
    >
        <template #option="{ option: { name, avatar_url, role } }">
            <div class="flex grow flex-row items-center gap-4 capitalize">
                <img
                    :src="avatar_url"
                    class="size-8 rounded-full border-2"
                    :style="`border-color: ${role.color}`"
                >
                <span>
                    {{ name }}
                </span>
            </div>
        </template>
        <template #single-label="{ value: { name, avatar_url, role } }">
            <div class="flex grow flex-row items-center gap-4 pl-6 capitalize">
                <img
                    :src="avatar_url"
                    class="size-8 rounded-full border-2"
                    :style="`border-color: ${role.color}`"
                >
                <span>
                    {{ name }}
                </span>
            </div>
        </template>
    </SelectElement>
</template>

<script setup lang="ts">
    const props = defineProps<{
        multi?: boolean
        excludeUser?: true | number | number[]
        excludeUsersByChat?: number | number[]
    }>();

    const element = ref();
    const _multi = ref(props.multi);

    watch(() => props.multi, (v) => {
        element.value?.reset();
        _multi.value = v;
    });

    const { $user } = useNuxtApp();
    const search = ref("");
    const excludeUser = computed(() => props.excludeUser === true ? $user.value?.id : (props.excludeUser || undefined));
    const excludeUsersByChat = computed(() => props.excludeUsersByChat || undefined);

    const { data: users, pending, refresh } = useLazyAsyncData("users:search", async () => {
        const { data: _data } = await useFetchApi("v1/users", {
            params: {
                "filter[name]": search.value,
                "filter[exclude_users]": excludeUser.value,
                "filter[exclude_participants_by_chat]": excludeUsersByChat.value,
                per_page: 10
            }
        });

        return _data.map(v => useOmit(v, ["activated_providers", "settings", "company"]));
    });

    watchDebounced(search, () => refresh(), {
        debounce: 200,
        maxWait: 1000,
        deep: true
    });

    watch(excludeUser, (newValue, oldValue) => {
        if (
            (isArray(newValue) && isArray(oldValue))
                ? useXor(newValue, oldValue).length > 0
                : newValue !== oldValue
        ) {
            refresh();
        }
    });

    const bind = computed(() => ({
        ref: "element",
        name: "user_id",
        label: "Usuário",
        placeholder: "Selecione um usuário",
        native: false,
        search: true,
        items: users.value!,
        loading: pending.value,
        valueProp: "id",
        labelProp: "name",
        onSearchChange: (v: string) => (search.value = v)
    }));

    defineExpose({
        data: users.value,
        refresh,
        selected: computed(() => {
            if (props.multi) {
                return users.value?.filter(({ id }) => element.value?.value.includes(id));
            }

            return users.value?.find(({ id }) => id === element.value?.value);
        })
    });
</script>