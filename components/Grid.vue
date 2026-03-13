<template>
    <ul class="-m-4 grid grow [clip-path:inset(1rem_1rem_1rem_1rem)]">
        <li
            v-for="(item, key) in _items"
            :key="key"
            class="flex flex-col gap-1 border-b border-r border-contrast/10 p-4"
            :class="item.class"
        >
            <p class="font-bold">
                {{ capitalize(item.name) }}:
            </p>

            <template v-if="item.badge">
                <div
                    v-if="isArray(item.badge)"
                    class="flex flex-row flex-wrap gap-2"
                >
                    <Badge
                        v-for="(_badge, index) in item.badge"
                        :key="index"
                        v-bind="_badge"
                        size="sm"
                    />
                </div>
                <Badge
                    v-else
                    v-bind="item.badge"
                    size="sm"
                />
            </template>

            <p
                v-if="item.description"
                :class="item.classDescription"
            >
                {{ item.description }}
            </p>

            <slot
                v-if="item.slot"
                :name="item.slot"
            />

            <p v-if="(!item.badge || isArray(item.badge) && !item.badge?.length) && !item.description && !$slots?.[item.slot ?? 'default']">
                - - -
            </p>
        </li>
    </ul>
</template>

<script setup lang="ts">
    import type { Badge } from "./Badge.vue";
    import { capitalize } from "vue";

    interface BadgeGrid extends Badge {
        class?: string
    }

    const {
        items
    } = defineProps<{
        items: {
            name: string
            show?: boolean
            class?: string
            classDescription?: string
            badge?: BadgeGrid | BadgeGrid[]
            description?: string | number | null
            slot?: string
        }[]
    }>();

    const _items = items.filter(({ show }) => show !== false);
</script>