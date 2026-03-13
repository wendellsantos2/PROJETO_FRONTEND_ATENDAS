<template>
    <div class="inline-flex items-center">
        <label class="relative flex cursor-pointer items-center">
            <input
                id="check"
                v-model="model"
                :value
                :checked
                type="checkbox"
                class="peer size-4 cursor-pointer appearance-none rounded-md border border-contrast/20 transition-all checked:bg-primary"
                @click.stop
                @change="onChange?.(!($event.target as HTMLInputElement).checked, $event)"
            >
            <span class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="size-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="1"
                >
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
            </span>
        </label>
    </div>
</template>

<script setup lang="ts" generic="V extends string | number">
    const {
        value,
        checked,
        onChange
    } = defineProps<{
        value?: V
        checked?: boolean
        onChange?: (checked: boolean, payload: Event) => void
    }>();

    const model = defineModel<V>();
</script>