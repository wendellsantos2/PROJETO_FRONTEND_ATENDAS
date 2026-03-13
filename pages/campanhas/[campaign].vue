<template>
    <div class="flex grow">
        <NuxtPage />
    </div>
</template>

<script lang="ts">
    import type { NuxtError } from "#app";
    import type { _AsyncData } from "#app/composables/asyncData";
    import type { InternalApi } from "nitropack/types";

    type Campaign = InternalApi["v1/campaigns/:id"]["get"]["data"] | null;

    export const symbolKey = Symbol() as InjectionKey<_AsyncData<Campaign, NuxtError | null>>;
</script>

<script setup lang="ts">
    const {
        campaign
    } = useRouteParams({
        create: "create_campaign",
        update: ["read_campaign", "update_campaign"]
    });

    const asyncData = await useAsyncData("campaign:id", async () => {
        const { data: _data } = await useFetchApi(`v1/campaigns/${campaign}`);

        return _data;
    }, {
        immediate: !!campaign
    });

    if (asyncData.error.value) {
        throw createError({
            ...asyncData.error.value,
            fatal: true
        });
    }

    provide(symbolKey, asyncData);
</script>