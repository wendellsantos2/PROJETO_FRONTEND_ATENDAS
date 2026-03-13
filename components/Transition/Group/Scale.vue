<template>
    <TransitionGroup
        appearActiveClass="!transition-all !duration-500 !-z-10"

        enterActiveClass="!transition-all !duration-500 !-z-10"
        enterFromClass="!opacity-0 !scale-90 -translate-y-full"

        leaveActiveClass="!transition-all !duration-500 !absolute !-z-10 !top-0"
        leaveToClass="!opacity-0 !scale-90"

        moveClass="!transition-all !duration-500"
        appear
    >
        <slot />
    </TransitionGroup>
</template>