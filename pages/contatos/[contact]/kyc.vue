<template>
    <KycPage
        ref="listing"
        :contact="contact!"
    />
</template>

<script setup lang="ts">
    definePageMeta({
        title: "KYC",
        navOrder: 30,
        permissions: {
            satisfyAll: true,
            list: ["provider:kyc", "read_contact"]
        }
    });

    const {
        contact
    } = useRouteParams();
</script>