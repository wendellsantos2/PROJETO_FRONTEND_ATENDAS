<template>
    <div class="pointer-events-none relative z-0 flex h-52 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-white-300 bg-white p-4 text-primary">
        <Icon
            name="loading"
            size="2rem"
        />
        <TransitionOpacity>
            <canvas
                v-show="loaded"
                ref="canvas"
                class="absolute inset-0 z-10 w-full"
            />
        </TransitionOpacity>
        <img
            v-if="logo"
            :src="logo"
            class="absolute inset-x-0 top-0 z-20 h-10 w-full object-contain object-right"
        >
    </div>
</template>

<script setup lang="ts">
    import pdfWorker from "../../node_modules/pdfjs-dist/build/pdf.worker.mjs?url";
    import * as pdfjsLib from "pdfjs-dist";

    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

    const {
        link,
        logo
    } = defineProps<{
        link: string
        logo: string | null
    }>();

    const loaded = ref(false);

    const canvas = ref<HTMLCanvasElement>();

    whenever(canvas, async (_canvas) => {
        const context = _canvas.getContext("2d")!;

        const blob = await useFetchApi("v1/attachments/download", {
            params: {
                link
            }
        });

        const buffer = await new Blob([blob], { type: "application/pdf" }).arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1.5 });

        _canvas.height = viewport.height;
        _canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        loaded.value = true;
    }, {
        once: true
    });
</script>