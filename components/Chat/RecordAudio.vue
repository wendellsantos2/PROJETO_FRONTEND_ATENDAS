<template>
    <Button
        v-tooltip="(recording ? 'Parar de g': 'G')+'ravar audio'"
        :color="recording ? 'danger' : 'custom'"
        variant="transparent"
        size="sm"
        class="text-contrast/20"
        :class="{ 'text-success': recording }"
        @click="() => recording ? stop() : start()"
    >
        <Icon
            name="microphone"
            :class="[props.iconClass, { 'animate-pulse': recording }]"
        />
    </Button>
</template>

<script setup lang="ts">
    const props = withDefaults(defineProps<{
        iconClass?: string | string[] | object
    }>(), {
        iconClass: ""
    });

    const emits = defineEmits<{
        setFile: [file: File]
    }>();

    const recording = ref(false);
    let mediaRecorder: MediaRecorder | undefined;
    let chunks: Blob[] = [];

    const start = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.addEventListener("dataavailable", (e) => {
            chunks.push(e.data);
        });

        mediaRecorder.start(1000);
        recording.value = true;
    };

    const stop = () => {
        mediaRecorder?.stop();
        mediaRecorder?.stream.getTracks().forEach(i => i.stop());

        const blob = new Blob(chunks);
        const file = new File([blob], "audio.mp3");

        emits("setFile", file);

        mediaRecorder = undefined;
        chunks = [];
        recording.value = false;
    };

    onMounted(async () => {
        const AudioRecorder = (await import("audio-recorder-polyfill")).default;
        // @ts-ignore
        const mpegEncoder = (await import("audio-recorder-polyfill/mpeg-encoder")).default;

        AudioRecorder.encoder = mpegEncoder;
        AudioRecorder.prototype.mimeType = "audio/mpeg";
        window.MediaRecorder = AudioRecorder;
    });

    onUnmounted(() => {
        stop();
    });
</script>