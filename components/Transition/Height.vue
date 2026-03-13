<!-- eslint-disable vue/attributes-order -->
<template>
    <Transition
        :enterActiveClass="TwClass"
        enterFromClass="opacity-0 !py-0"
        @beforeEnter="reduce"
        @enter="expand"
        @afterEnter="clear"

        :leaveActiveClass="TwClass"
        leaveToClass="opacity-0 !py-0"
        @beforeLeave="expand"
        @leave="reduce"
        @afterLeave="clear"
    >
        <slot />
    </Transition>
</template>

<script setup lang="ts">
    const TwClass = "!transition-all !duration-500 !overflow-hidden";

    const height = (element: Element, value?: number) => {
        (element as HTMLElement).style.height = value !== undefined ? `${value}px` : "";
    };

    const expand = (element: Element) => {
        height(element, element.scrollHeight);
    };

    const reduce = (element: Element) => {
        height(element, 0);
    };

    const clear = (element: Element) => {
        height(element);
    };
</script>