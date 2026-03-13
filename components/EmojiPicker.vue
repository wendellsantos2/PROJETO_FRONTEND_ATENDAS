<template>
    <VDropdown>
        <slot />

        <template #popper>
            <Vueform
                class="p-2 pb-0"
                :removeClasses="{
                    FormElements: {
                        container: ['form-gap-x-gutter'],
                        container_sm: ['form-gap-x-gutter-sm'],
                        container_lg: ['form-gap-x-gutter-lg']
                    }
                }"
            >
                <TextElement
                    name="search"
                    inputType="search"
                    placeholder="Procurar Emojis"
                    size="sm"
                    @change="(v: string) => search = v"
                >
                    <template #addon-after>
                        <Icon name="filter" />
                    </template>
                </TextElement>
            </Vueform>
            <RecycleScroller
                class="mask-transparent-border h-44 w-56 p-2 text-center [--size:0.5rem]"
                listTag="ul"
                itemTag="li"
                :items="emojis"
                :buffer="20"
                :itemSize="40"
                :gridItems="5"
            >
                <template v-if="recent.length && !search" #before>
                    <span class="col-span-full mb-2 inline-flex w-full text-left text-sm">
                        Recentes
                    </span>
                    <ul class="grid grid-cols-5">
                        <li
                            v-for="(emoji) in recent"
                            :key="emoji"
                            class="size-10"
                            :class="classLi"
                            @click="select(emoji)"
                        >
                            {{ emoji }}
                        </li>
                    </ul>
                    <hr class="col-span-full my-2">
                </template>

                <template #default="{ item }">
                    <span class="size-full" :class="classLi" @click="select(item)">
                        {{ item }}
                    </span>
                </template>
            </RecycleScroller>
        </template>
    </VDropdown>
</template>

<script setup lang="ts">
    import { RecycleScroller } from "vue-virtual-scroller";
    import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
    import emojilib from "emojilib";

    const emits = defineEmits<{
        select: [emoji: string]
    }>();

    const classLi = "size-10 flex items-center p-1 text-xl justify-center cursor-pointer rounded-lg border-2 border-transparent transition-[border] duration-300 hover:border-primary";

    const recent = useLocalStorage<string[]>("recent-emojis", []);
    const search = ref("");
    const keys = useKeys(emojilib);

    const emojis = computed(() => {
        if (search.value) {
            return useFilter(keys, (key) => {
                return useSome<string>((emojilib as any)[key], (name) => {
                    return name.includes(search.value);
                });
            });
        }

        return keys;
    });

    const select = (emoji: string) => {
        usePull(recent.value, emoji);

        if (recent.value.length >= 10) {
            recent.value.pop();
        }

        recent.value.unshift(emoji);

        emits("select", emoji);
    };
</script>