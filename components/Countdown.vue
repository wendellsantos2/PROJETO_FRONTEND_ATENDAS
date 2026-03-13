<!-- eslint-disable vue/no-v-html -->
<template>
    <TransitionTranslateY>
        <slot
            :days
            :hours
            :minutes
            :seconds
            :milliseconds
            :ended
        >
            <div
                key="countdown"
                class="flex flex-row gap-0.5 *:min-w-6"
                :class="computedClass?.({ days, hours, minutes, seconds, milliseconds, ended })"
                v-html="view"
            />
        </slot>
    </TransitionTranslateY>
</template>

<script setup lang="ts">
    export type ComputedClass = (data: {
        days: string
        hours: string
        minutes: string
        seconds: string
        milliseconds: string
        ended: boolean
    }) => string;

    const {
        start,
        end,
        noDays,
        noHours,
        noMinutes,
        noSeconds,
        noMilliseconds,
        computedClass
    } = defineProps<{
        start?: string
        end: string | {
            year?: number
            month?: number
            day?: number
            hours?: number
            minutes?: number
            seconds?: number
        }
        noDays?: boolean
        noHours?: boolean
        noMinutes?: boolean
        noSeconds?: boolean
        noMilliseconds?: boolean
        computedClass?: ComputedClass
    }>();

    const emits = defineEmits<{
        started: []
        ended: []
    }>();

    const startDate = computed(() => start ? new Date(start) : new Date());

    const endDate = computed(() => {
        if (!end) {
            return startDate.value;
        }

        if (typeof end === "string") {
            return new Date(end);
        };

        const {
            year = 0,
            month = 0,
            day = 0,
            hours = 0,
            minutes = 0,
            seconds = 0
        } = end;

        return new Date(
            startDate.value.getFullYear() + year,
            startDate.value.getMonth() + month,
            startDate.value.getDate() + day,
            startDate.value.getHours() + hours,
            startDate.value.getMinutes() + minutes,
            startDate.value.getSeconds() + seconds
        );
    });

    const BASE = "00";
    const days = ref(BASE);
    const hours = ref(BASE);
    const minutes = ref(BASE);
    const seconds = ref(BASE);
    const milliseconds = ref(BASE);
    const ended = ref(true);

    watch(ended, (v) => {
        if (v) {
            emits("ended");
        }
        else {
            emits("started");
        }
    }, {
        immediate: true
    });

    const format = (num: number) => num.toString().padStart(2, "0");

    const {
        pause,
        resume
    } = useIntervalFn(() => {
        const now = new Date();
        const difference = endDate.value.getTime() - now.getTime();

        if (difference > 0) {
            days.value = format(Math.floor(difference / (1000 * 60 * 60 * 24)));
            hours.value = format(Math.floor((difference / (1000 * 60 * 60)) % 24));
            minutes.value = format(Math.floor((difference / (1000 * 60)) % 60));
            seconds.value = format(Math.floor((difference / 1000) % 60));
            milliseconds.value = format(Math.floor(difference % 1000 / 10));
        }
        else {
            days.value = hours.value = minutes.value = seconds.value = milliseconds.value = BASE;
            pause();
            ended.value = true;
        }
    }, 10, {
        immediate: false
    });

    watch([startDate, endDate], () => {
        resume();
        ended.value = false;
    }, {
        immediate: true
    });

    const view = computed(() => {
        const array = [];

        if (!noDays) {
            array.push(days.value);
        };

        if (!noHours) {
            array.push(hours.value);
        };

        if (!noMinutes) {
            array.push(minutes.value);
        };

        if (!noSeconds) {
            array.push(seconds.value);
        };

        if (!noMilliseconds) {
            array.push(milliseconds.value);
        };

        return array.map(i => `<span v-if="!noDays">${i}</span>`).join(":");
    });
</script>