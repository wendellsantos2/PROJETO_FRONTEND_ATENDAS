<template>
    <div
        class="flex grow flex-col gap-4 sm:gap-6 sm:px-6 sm:pb-6"
        :class="{ 'pb-4': props.pagination }"
    >
        <slot name="before" />

        <div
            class="relative grow overflow-hidden rounded-3xl bg-background-100"
            :class="{ 'max-sm:rounded-b-none': !props.pagination }"
        >
            <TransitionHeight>
                <BarLoading
                    v-show="_pending"
                    class="relative z-10 w-full bg-transparent"
                />
            </TransitionHeight>

            <TransitionGroupScale
                v-if="props.grid"
                tag="ul"
                class="grid auto-rows-min"
                :class="[classe, props.addClass ?? 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4']"
            >
                <Suspense
                    suspensible
                    @pending="suspensePending = true"
                    @resolve="suspensePending = false"
                >
                    <slot />
                </Suspense>
            </TransitionGroupScale>
            <div
                v-else
                class="flex flex-col"
                :class="[classe, props.addClass]"
            >
                <Suspense
                    suspensible
                    @pending="suspensePending = true"
                    @resolve="suspensePending = false"
                >
                    <slot />
                </Suspense>
            </div>
        </div>

        <LazyPagination
            v-if="props.pagination"
            v-bind="props.pagination"
            class="mx-4 sm:mx-0"
            @change="(v) => emits('pagination', v)"
        />

        <slot name="after" />
    </div>
</template>

<script setup lang="ts">
    import type { Pagination } from "./Pagination.vue";

    const props = defineProps<{
        pending?: boolean
        grid?: boolean
        addClass?: string
        pagination?: Pagination
    }>();

    const emits = defineEmits<{
        pagination: [page: number]
    }>();

    const suspensePending = ref(true);
    const _pending = computed(() => props.pending || suspensePending.value);
    const classe = "mask-transparent-border absolute inset-0 grow gap-6 overflow-auto px-4 py-6 [--size:1rem] sm:p-6 sm:[--size:1.5rem]";
</script>