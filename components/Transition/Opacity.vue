<template>
    <Transition
        enterActiveClass="transition-all duration-500"
        enterFromClass="opacity-0"

        leaveActiveClass="transition-all duration-500"
        leaveToClass="opacity-0"
    >
        <slot />
    </Transition>
</template>