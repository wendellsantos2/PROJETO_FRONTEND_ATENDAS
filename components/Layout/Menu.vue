<template>
    <label class="hamburger cursor-pointer">
        <input
            v-model="model"
            type="checkbox"
            class="peer hidden"
        >
        <svg viewBox="0 0 32 32" class="h-10 *:fill-none *:stroke-contrast *:stroke-2 peer-checked:*:stroke-danger">
            <path class="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22" />
            <path class="line" d="M7 16 27 16" />
        </svg>
    </label>
</template>

<script setup lang="ts">
    const model = defineModel<boolean>();
</script>

<style scoped lang="postcss">
    svg {
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .line {
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: stroke 0.5s linear,
                    stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                    stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .line-top-bottom {
        stroke-dasharray: 12 63;
    }

    .hamburger input:checked + svg {
        transform: rotate(-45deg);
    }

    .hamburger input:checked + svg .line-top-bottom {
        stroke-dasharray: 20 300;
        stroke-dashoffset: -32.42;
    }
</style>