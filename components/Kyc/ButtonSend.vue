<template>
    <Button
        :color
        :variant
        :disabled
        :action="async () => await useFetchApi(`v2/kyc/transactions/${transaction}/new-attempt`, {
            method: 'POST'
        })"
        @then="emits('then', new Date().toISOString())"
    >
        <Icon name="send" />
        <Countdown
            v-slot="{ ended }"
            :start="lastAttempt"
            :end="{ minutes: 5 }"
            noDays
            noHours
            @started="disabled = true"
            @ended="disabled = false"
        >
            <template v-if="ended">
                Reenviar
            </template>
        </Countdown>
    </Button>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";
    import type { Color, Variant } from "~/components/Button/Index.vue";

    const {
        color = "warn",
        transaction,
        lastAttempt
    } = defineProps<{
        color?: Color
        variant?: Variant
        transaction: InternalApi["v2/kyc/transactions/:transaction"]["get"]["data"]["id"]
        lastAttempt: InternalApi["v2/kyc/transactions/:transaction"]["get"]["data"]["last_attempt"]
    }>();

    const emits = defineEmits<{
        then: [at: string]
    }>();

    const disabled = ref(false);
</script>