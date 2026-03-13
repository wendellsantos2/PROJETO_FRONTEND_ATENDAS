<template>
    <Transition
        enterActiveClass="transition-all duration-500"
        enterFromClass="opacity-0 translate-x-full scale-90"

        leaveActiveClass="transition-all duration-500"
        leaveToClass="opacity-0 -translate-x-full scale-90"
        mode="out-in"
    >
        <slot />
    </Transition>
</template>