<template>
    <div
        v-if="checkType(['image', 'video'])"
        class="group relative h-full max-w-full cursor-pointer overflow-hidden rounded-2xl"
        @click="emit({ src })"
    >
        <component
            :is="checkType('image') ? 'img' : 'video'"
            :src
            :alt
            class="size-full object-cover object-center transition-all duration-500 group-hover:scale-110 group-hover:saturate-200"
            preload="metadata"
        />
        <div class="absolute bottom-4 right-4 flex flex-row flex-wrap gap-1">
            <Badge
                :name="_extension"
                :icon="_type"
                color="primary"
                variant="solid"
            />
            <Badge
                v-if="alt"
                :name="alt"
                :icon="false"
                color="secondary"
            />
        </div>
    </div>

    <VAudio
        v-else-if="checkType('audio')"
        :src
        controls
        class="max-w-full"
    />

    <a
        v-else
        :href
        target="_blank"
        class="flex flex-row items-center justify-center gap-4 rounded-2xl p-3 text-primary transition-all duration-300"
        :class="{ 'hover:bg-primary hover:text-white hover:shadow': !!href }"
    >
        <Icon
            size="5rem"
            :name="{
                doc: 'fileDoc',
                txt: 'fileTxt',
                csv: 'fileCsv',
                pdf: 'filePdf',
                xsl: 'fileXsl',
                json: 'fileJson'
            }[_extension!] ?? 'fileUnknown'"
        />
        <div>
            <span class="opacity-50">
                {{ (!src && !type && !_extension) ? "Nada anexado" : "Arquivo" }}
            </span>
            <h5 class="font-bold uppercase">
                {{ _extension }}
            </h5>
            <span v-show="href" class="opacity-50">
                Ver
                <Icon name="linkOut" />
            </span>
        </div>
    </a>
</template>

<script setup lang="ts">
    const {
        src = "",
        type = "",
        extension = ""
    } = defineProps<{
        src?: string
        alt?: string
        type?: string
        extension?: string
    }>();

    const {
        emit
    } = useViewMedia();

    const _type = computed(() => type || `${useFileType(extension || src)}`);

    const checkType = (type: string | string[]) => {
        if (typeof type === "string") {
            type = [type];
        }

        return type.includes(_type.value);
    };

    const href = computed(() => {
        return src || undefined;
    });

    const _extension = computed(() => extension || src?.split(".").at(-1)?.split("?").at(0));
</script>