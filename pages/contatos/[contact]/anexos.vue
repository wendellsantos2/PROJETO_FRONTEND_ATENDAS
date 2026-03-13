<template>
    <Container
        :pending
        :pagination="paginationInfo"
        @pagination="(v) => pagination.page = v"
    >
        <NoData v-if="!data?.length" />
        <ul class="grid gap-6 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            <li
                v-for="({ id: key, link: src }) in data"
                :key
                class="transition-all duration-500"
                :class="{ 'opacity-30': pending }"
            >
                <ViewMedia
                    :src
                    class="aspect-video !rounded-2xl bg-background shadow"
                />
            </li>
        </ul>
    </Container>
</template>

<script setup lang="ts">
    definePageMeta({
        navOrder: 60,
        permissions: {
            satisfyAll: true,
            list: ["read_contact", "read_upload", "read_conversation"]
        }
    });

    const {
        contact
    } = useRouteParams();

    const {
        data,
        paginationInfo,
        pagination,
        pending
    } = useFetchData(`v1/contacts/${contact}/attachments`, {
        fetch: {
            params: {
                per_page: 25
            }
        }
    });
</script>