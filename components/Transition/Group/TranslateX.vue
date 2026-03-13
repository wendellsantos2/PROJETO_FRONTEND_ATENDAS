<template>
    <TransitionGroup
        enterActiveClass="transition-all duration-500 -z-10"
        enterFromClass="opacity-0 scale-90 -translate-x-full"

        leaveActiveClass="transition-all duration-500 !absolute -z-10"
        leaveToClass="opacity-0 scale-90 translate-x-full"

        moveClass="transition-all duration-500"
        appear
    >
        <slot />
    </TransitionGroup>
</template>