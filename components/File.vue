<template>
    <div
        ref="containerDrop"
        class="color-background-auto relative flex flex-col divide-y divide-primary/20 rounded-2xl border-2 border-dashed border-transparent bg-background text-contrast"
        :class="{ 'animate-pulse !border-primary': props.dragEffect && dragEvent }"
    >
        <TransitionHeight>
            <div
                v-if="model || loading"
                class="relative flex items-center justify-center gap-4 p-4"
                :class="{
                    'h-52 flex-row': props.view === 'row',
                    'flex-col': props.view === 'col'
                }"
            >
                <div
                    class="relative overflow-hidden rounded-2xl bg-primary/20"
                    :class="{
                        'h-full min-w-52 max-w-80': props.view === 'row',
                        'aspect-video max-h-80 w-full': props.view === 'col'
                    }"
                >
                    <LazyViewMedia
                        :src="upload?.link"
                        :extension
                        class="size-full"
                    />

                    <TransitionOpacity>
                        <div v-show="loading" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/20 p-4 text-white backdrop-blur-md">
                            <Icon
                                name="uploading"
                                class="text-primary"
                                size="3rem"
                            />
                            <p>
                                Carregando
                            </p>
                        </div>
                    </TransitionOpacity>
                </div>
                <ul
                    class="flex *:flex *:flex-col"
                    :class="{
                        'flex-col gap-2 text-left': props.view === 'row',
                        'flex-row flex-wrap items-center justify-center gap-x-6 gap-y-4 text-center': props.view === 'col'
                    }"
                >
                    <li v-if="props.view === 'row' || name">
                        <span class="text-sm text-contrast-300">
                            Nome:
                        </span>
                        <p class="line-clamp-1">
                            {{ useResumeString(name ?? "DESCONHECIDO", 30) }}
                        </p>
                    </li>
                    <li>
                        <span class="text-sm text-contrast-300">
                            Tipo:
                        </span>
                        <p>
                            {{ extension ?? "DESCONHECIDO" }}
                        </p>
                    </li>
                    <li v-if="props.view === 'row' || Number(formatBytes.at(0))">
                        <span class="text-sm text-contrast-300">
                            Tamanho:
                        </span>
                        <p>
                            {{ formatBytes ?? "DESCONHECIDO" }}
                        </p>
                    </li>
                    <li>
                        <Button
                            size="sm"
                            color="danger"
                            type="button"
                            class="flex flex-row items-center gap-1"
                            :action="async () => await close(true)"
                        >
                            <Icon name="removeAttachment" />
                            Remover
                        </Button>
                    </li>
                </ul>
            </div>
        </TransitionHeight>
        <button
            v-if="props.button"
            type="button"
            class="flex w-full grow flex-row items-center justify-center gap-2 rounded-2xl p-3 text-left transition-all duration-300 hover:bg-primary hover:text-white"
            @click="fileDialog.open"
        >
            <Icon name="file" size="2rem" />
            <div class="flex flex-col">
                <span>
                    {{ file ? "Substituir" : "Adicionar" }} arquivo
                </span>
                <span class="text-xs opacity-50">
                    Clique ou arraste
                </span>
            </div>
        </button>
    </div>
</template>

<script setup lang="ts">
    const props = withDefaults(defineProps<{
        accept?: string
        button?: boolean
        dragEffect?: boolean
        raw?: boolean
        view?: "col" | "row"
        route?: string
        delet?: boolean
    }>(), {
        accept: "*",
        button: true,
        dragEffect: true,
        view: "row",
        route: "v1/uploads",
        delet: true
    });

    const containerDrop = ref<HTMLDivElement>();

    useDropZone(containerDrop, f => setFile(f));

    const fileDialog = useFileDialog({
        reset: true,
        accept: props.accept
    });

    fileDialog.onChange(f => setFile(f));

    const dragEvent = useDragEvent();
    const file = ref<File | null>(null);
    const loading = ref(false);

    const nameSplit = computed(() => file.value?.name.split("."));
    const name = computed(() => nameSplit.value?.at(0));
    const extension = computed(() => nameSplit.value?.at(-1) || upload.value?.link?.split(".")?.at(-1));

    const setFile = async (baseFiles: FileList | File[] | null | undefined) => {
        const _file = baseFiles?.[0];
        const MAX_FILESIZE_IN_MB = 10;

        if (_file) {
            if (_file.size > (MAX_FILESIZE_IN_MB * 1024 * 1024)) {
                useBusError().emit(`Tamanho do arquivo é maior que ${MAX_FILESIZE_IN_MB} MB`);
                close(true);
            }
            else {
                loading.value = true;
                await close(true);
                file.value = _file;
            }
        }
    };

    const formatBytes = computed(() => {
        const bytes = file.value?.size ?? 0;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

        if (bytes === 0) {
            return "0 Byte";
        }

        const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));

        return Math.round((bytes / Math.pow(1024, i))) + " " + sizes[i];
    });

    const model = defineModel<number | null | File>();
    const _route = computed(() => props.route as "v1/uploads");

    const { state: upload, execute } = useAsyncState(async () => {
        try {
            const { data } = await useFetchApi(_route.value, {
                method: "POST",
                body: useFormData({
                    media: file.value
                })
            });

            model.value = data.id;
            upload.value = data;
            return data;
        }
        catch {
            await close(true);
        }
        finally {
            loading.value = false;
        }
    }, null, {
        immediate: false
    });

    const WhenClosingDelete = ref(true);

    const setUpload = async (value: NonNullable<typeof upload.value>, closeDelete: boolean = true) => {
        if (upload.value) {
            await close(true);
        }

        upload.value = value;
        model.value = value.id;
        WhenClosingDelete.value = closeDelete;
    };

    const close = async (remove?: boolean) => {
        if (upload.value?.id && remove && WhenClosingDelete.value && props.delet) {
            await useFetchApi(`${_route.value}/${upload.value?.id}`, {
                method: "DELETE"
            });
        }

        file.value = null;
        model.value = null;
        upload.value = null;

        WhenClosingDelete.value = true;
    };

    watch(file, async (newValue) => {
        if (newValue) {
            if (props.raw) {
                model.value = newValue;

                upload.value = {
                    id: 0,
                    link: URL.createObjectURL(newValue)
                };

                loading.value = false;
            }
            else {
                await execute();
            }
        }
    });

    watch(model, async (newValue) => {
        if (typeof newValue === "number" && newValue !== upload.value?.id) {
            try {
                const response = await useFetchApi(`${_route.value}/${newValue}`);
                upload.value = response.data;
            }
            catch {
                upload.value = {
                    id: newValue,
                    link: ""
                };

                await close();
            }
        }
        else if (!newValue) {
            upload.value = null;
        }
    }, {
        immediate: true
    });

    defineExpose({
        loading,
        dragEvent,
        upload: computed(() => ({
            ...upload.value,
            type: useFileType(upload.value?.link) as ReturnType<typeof useFileType>
        })),

        setUpload,
        setFile,
        close
    });
</script>