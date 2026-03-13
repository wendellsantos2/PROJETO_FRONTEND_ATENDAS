<template>
    <EditorJsonElement
        name="fields_mapping"
        label="Mapeamento de variáveis (JSON)"
    >
        <template #after="{ model }">
            <ul class="col-span-full mt-4 flex w-full flex-row flex-wrap gap-3 text-center text-sm *:font-medium">
                <li class="opacity-60">
                    Variáveis disponíveis:
                </li>
                <li
                    v-for="(variable) in variables"
                    :key="variable"
                    class="rounded-lg bg-soft px-2 py-1"
                    :class="{ 'opacity-30': model?.includes(variable) }"
                >
                    {{ variable }}
                </li>
            </ul>
        </template>
    </EditorJsonElement>
</template>

<script setup lang="ts">
    const { $user } = useNuxtApp();

    const { data: variables } = useLazyAsyncData("webhooks:variables", async () => {
        const { data } = await useFetchApi(`v1/companies/${$user.value?.company.id}/settings/webhooks/variables`);

        return data;
    });
</script>