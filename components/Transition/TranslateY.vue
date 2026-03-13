<template>
    <Transition
        enterActiveClass="transition-all duration-500"
        enterFromClass="opacity-0 translate-y-full"

        leaveActiveClass="transition-all duration-500"
        leaveToClass="opacity-0 -translate-y-full"
        mode="out-in"
    >
        <slot />
    </Transition>
</template>