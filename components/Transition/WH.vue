<!-- eslint-disable vue/attributes-order -->
<template>
    <Transition
        :enterActiveClass="TwClass"
        enterFromClass="opacity-0"
        @beforeEnter="reduce"
        @enter="expand"
        @afterEnter="clear"

        :leaveActiveClass="TwClass"
        leaveToClass="opacity-0"
        @beforeLeave="expand"
        @leave="reduce"
        @afterLeave="clear"
    >
        <slot />
    </Transition>
</template>

<script setup lang="ts">
    const TwClass = "!transition-all !duration-500 !overflow-hidden";

    const height = (element: Element, width?: number, height?: number) => {
        (element as HTMLElement).style.width = width !== undefined ? `${width}px` : "";
        (element as HTMLElement).style.height = height !== undefined ? `${height}px` : "";
    };

    const expand = (element: Element) => {
        height(element, element.scrollWidth, element.scrollHeight);
    };

    const reduce = (element: Element) => {
        height(element, 0, 0);
    };

    const clear = (element: Element) => {
        height(element);
    };
</script>