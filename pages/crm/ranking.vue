<template>
    <div class="flex grow flex-col">
        <ul
            v-if="topSellers"
            class="mb-6 grid gap-6 px-6 xs:grid-cols-2 md:grid-cols-3"
        >
            <li
                v-for="(top, key) in topSellers"
                :key
                class="top flex grow flex-row items-center gap-4 rounded-2xl bg-background-100 p-2 sm:p-4"
                :class="{ 'col-span-full md:col-span-1': key === 0 }"
            >
                <span class="number -ml-2 text-[2.5rem] font-bold leading-none opacity-30 sm:-ml-4 xl:text-[4rem]">
                    {{ key+1 }}º
                </span>
                <div class="flex flex-row items-center gap-3">
                    <img
                        :src="top.avatar_url"
                        class="block size-10 rounded-full bg-background object-cover object-center xl:size-16"
                    >
                    <div class="flex flex-col gap-1 *:leading-none">
                        <h6 class="line-clamp-1 font-semibold xl:text-2xl">
                            {{ top.name }}
                        </h6>
                        <span>
                            {{ top.score }} pontos
                        </span>
                    </div>
                </div>
            </li>
        </ul>

        <TablePage
            ref="tablePage"
            request="v1/sellers-ranking"
            :thead="[
                { name: 'Vendedor', slot: 'seller' },
                { name: 'Pontos', propertyPath: 'score' }
            ]"
            :itemClick="false"
        >
            <template #seller="{ name, avatar_url }">
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
        </TablePage>
    </div>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";
    import type { ComponentExposed } from "~/types";
    import type { TablePage } from "#components";

    type Ranking = InternalApi["v1/sellers-ranking"]["get"]["data"];

    definePageMeta({
        navOrder: 50,
        permissions: "read_contact",
        layoutConfig: {
            search: true
        }
    });

    const tablePage = ref<ComponentExposed<typeof TablePage<"v1/sellers-ranking">>>();

    useBusLayout().on((event) => {
        if ("search" in event) {
            tablePage.value!.filters.search = event.search;
        }
    });

    const topSellers = ref<Ranking>();

    watch(() => tablePage.value?.asyncData, () => {
        if (!tablePage.value?.filters?.search && tablePage.value?.paginationInfo.current === 1) {
            topSellers.value = tablePage.value?.asyncData?.splice(0, 3);
        }
    });
</script>

<style lang="css" scoped>
    .number {
        mask-image: linear-gradient(90deg, transparent 0%, #000 100%);
    }

    .top {
        &:nth-child(1) {
            background: linear-gradient(135deg, #ffd90033, #c5a60033);
        }

        &:nth-child(2) {
            background: linear-gradient(135deg, #c0c0c033, #80808033);
        }

        &:nth-child(3) {
            background: linear-gradient(135deg, #cd7f3233, #8b451333);
        }
    }
</style>