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

    const width = (element: Element, value?: number) => {
        (element as HTMLElement).style.width = value !== undefined ? `${value}px` : "";
    };

    const expand = (element: Element) => {
        width(element, element.scrollWidth);
    };

    const reduce = (element: Element) => {
        width(element, 0);
    };

    const clear = (element: Element) => {
        width(element);
    };
</script>