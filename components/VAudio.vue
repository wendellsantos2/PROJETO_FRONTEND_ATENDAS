<template>
    <div class="flex flex-row items-center gap-4 rounded-full p-2">
        <button type="button" class="flex aspect-square rounded-full bg-primary p-2 text-white" @click="playing = !playing">
            <Icon
                :name="playing ? 'line-md:play-filled-to-pause-transition' : 'line-md:pause-to-play-filled-transition'"
                size="2rem"
            />
        </button>
        <audio
            ref="audio"
            class="hidden"
            :src="props.src"
        />
        <div class="relative grow">
            <input
                v-model="currentTime"
                type="range"
                class="color-auto h-3 w-full cursor-pointer appearance-none rounded-full bg-current"
                min="0"
                :max="duration"
                step="1"
                @mousedown="mousedown"
                @mouseup="mouseup"
            >
            <span class="absolute right-2 translate-y-full whitespace-nowrap text-sm">
                {{ timeFormat(currentTime) }}
                /
                {{ timeFormat(duration) }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
    const props = withDefaults(defineProps<{
        src?: string
    }>(), {
        src: ""
    });

    const audio = ref<HTMLAudioElement>();
    const playing = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const altering = ref(false);

    watch(playing, (newValue) => {
        newValue ? audio.value?.play() : audio.value?.pause();
    });

    const mousedown = () => {
        altering.value = true;
    };

    const mouseup = () => {
        audio.value!.currentTime = currentTime.value;
        altering.value = false;
    };

    const timeFormat = (_seconds: number | undefined = 0): string => {
        if (_seconds) {
            const seconds = _seconds % 60;
            const minutos = Math.floor(_seconds / 60);

            return `${minutos}:${seconds.toString().padStart(2, "0")}`;
        }
        else {
            return "0:00";
        }
    };

    const backgroundSize = computed(() => {
        return `${(currentTime.value / duration.value) * 100}% 100%`;
    });

    onMounted(() => {
        audio.value!.onloadeddata = () => {
            duration.value = Math.floor(audio.value!.duration);
        };

        audio.value!.ontimeupdate = () => {
            if (!altering.value) {
                currentTime.value = Math.floor(audio.value!.currentTime);
            }
        };

        audio.value!.onended = () => {
            playing.value = false;
            currentTime.value = 0;
        };
    });
</script>

<style scoped lang="postcss">
    input {
        background-size: v-bind(backgroundSize);

        @apply bg-gradient-to-t from-primary to-primary bg-no-repeat;

        &::-webkit-slider-thumb {
            @apply appearance-none size-6 bg-primary rounded-full;
        }
    }
</style>