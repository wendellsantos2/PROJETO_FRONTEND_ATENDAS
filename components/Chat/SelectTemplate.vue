<template>
    <TransitionHeight>
        <TransitionGroupScale
            v-if="identifier"
            tag="ul"
            class="relative -mb-4 flex size-full max-h-40 grow flex-col overflow-auto rounded-t-[--rounded] pb-4 *:p-2"
        >
            <BarLoading v-show="pending" class="!p-0" />

            <li
                v-for="(value) in data"
                :key="value.name"
                class="flex cursor-pointer flex-row items-center gap-2 transition-all duration-300 hover:bg-primary hover:text-white"
                @click="set(value)"
            >
                <span class="flex flex-row items-center gap-1 rounded-full bg-secondary p-1 px-2 text-sm font-bold leading-none text-background">
                    /{{ value.name.replaceAll(" ", "-").toLowerCase() }}
                    <span class="rounded-full bg-background-200 px-2 py-0.5 leading-none text-contrast">
                        #{{ value.id }}
                    </span>
                </span>
                <Icon :name="useFileType(value.media?.link) ?? ''" />
                <div class="relative h-full grow">
                    <p class="absolute inset-0 truncate">
                        {{ value.content }}
                    </p>
                </div>
            </li>

            <li v-show="!data?.length">
                <p class="pl-5 text-contrast-300">
                    <Icon name="ops" />
                    Nenhum template encontrado
                </p>
            </li>
        </TransitionGroupScale>
    </TransitionHeight>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    const model = defineModel<string>();

    const emits = defineEmits<{
        setMedia: [media: InternalApi["v1/uploads/:id"]["get"]["data"]]
    }>();

    const identifier = computed(() => {
        return model.value?.startsWith("/") ? model.value?.split(" ")?.at(0) : "";
    });

    const name = computed(() => {
        return identifier.value?.replace(/^\//, "").replaceAll("-", " ").toLowerCase();
    });

    const id = computed(() => {
        return name.value?.startsWith("#") ? Number(name.value?.replace("#", "").toLowerCase()) : null;
    });

    const {
        data,
        pending,
        filters
    } = useFetchData("v1/templates", {
        keyPrefix: "chat",
        fetch: {
            params: {
                "filter[is_active]": true
            }
        }
    });

    const set = (value: InternalApi["v1/templates/:id"]["get"]["data"]) => {
        model.value = value.content;
        if (value.media) {
            emits("setMedia", value.media);
        }
    };

    watch(identifier, () => {
        if (id.value !== null) {
            filters.value.name = "";
            filters.value.id = id.value;
        }
        else {
            filters.value.name = name.value;
            filters.value.id = "";
        }
    });

    watch(model, () => {
        if (
            data.value?.length
            && name.value
            && (model.value?.split("").at(-1) === " ")
            && (data.value?.at(0)?.name.toLowerCase() === name.value.toLowerCase() || data.value?.at(0)?.id === id.value)
        ) {
            set(data.value.at(0)!);
        }
    });
</script>