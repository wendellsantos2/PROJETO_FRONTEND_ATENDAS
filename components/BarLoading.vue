<template>
    <div
        key="bar-loading"
        class="bar-loading flex h-fit w-full rounded-full bg-background-200 p-px after:block after:h-1.75 after:w-1/3 after:rounded-full after:bg-primary"
    />
</template>

<style scoped lang="postcss">
    .bar-loading::after {
        animation: barLoading 0.5s cubic-bezier(0.77, 0, 0.175, 1) infinite alternate-reverse;
    }

    @keyframes barLoading {
        to {
            transform: translate(200%);
        }
    }
</style>