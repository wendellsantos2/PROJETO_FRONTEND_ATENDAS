<template>
    <div class="mask-transparent-border no_scrollbar -mx-4 flex grow snap-x flex-row items-center justify-stretch overflow-auto whitespace-nowrap px-4 text-center [--deg:90deg] *:mx-auto lg:-mx-6 lg:flex-none lg:px-6">
        <TransitionTranslateY v-if="page">
            <ul
                v-if="page.children.length > 1"
                ref="pagesLinks"
                :key="page?.href"
                class="relative flex w-fit flex-row pb-2"
            >
                <li
                    v-for="value in page.children"
                    :key="value.title"
                    class="snap-center snap-always"
                >
                    <NuxtLink
                        :href="value.href"
                        class="block px-2 text-lg font-bold text-contrast/50 transition-all duration-500 hover:text-quarter lg:text-xl"
                        activeClass="!text-contrast"
                        @click="focus"
                    >
                        <span
                            v-show="value?.param"
                            class="mr-2 text-secondary"
                        >
                            #{{ value.param }}
                        </span>
                        <VSvg
                            v-if="value.logo"
                            :name="value.logo"
                            class="*:!h-[1.6875rem] *:!w-auto"
                        />
                        <template v-else>
                            {{ value.title }}
                        </template>
                    </NuxtLink>
                </li>

                <div
                    id="barIndicatorLink"
                    class="absolute inset-x-0 bottom-0 flex h-fit w-full rounded-full bg-background-200 p-px after:ml-[--m] after:block after:h-[2px] after:w-[--w] after:rounded-full after:bg-primary after:transition-all after:duration-500"
                    :style="barPosition"
                />
            </ul>

            <VSvg
                v-else-if="page?.logo"
                :name="page.logo"
                class="*:!h-[2.0625rem] *:!w-auto"
            />

            <h3
                v-else
                :key="`T-${page?.href}`"
                class="text-xl font-bold lg:text-3xl"
            >
                <span
                    v-show="page?.param"
                    class="text-secondary"
                >
                    #{{ page.param }}
                </span>
                {{ page?.title }}
            </h3>
        </TransitionTranslateY>
    </div>
</template>

<script setup lang="ts">
    import { capitalize } from "vue";

    const router = useRouter();
    const route = computed(() => router.currentRoute.value);

    const page = computed(() => {
        const {
            path,
            matched
        } = route.value;

        const pathReplace = path.replace(/\/$/, "");

        const search = pathReplace
            .substring(0, pathReplace.lastIndexOf("/") || undefined)
            .split("/")
            .filter(Boolean);

        let pageSearch: typeof usePages.value[number] | undefined;

        search.forEach((hrefPart) => {
            pageSearch = (pageSearch?.children || usePages.value).find(({ href }) => href.endsWith(`/${hrefPart}`));
        });

        const lastSegment = matched.at(-1)?.path?.split("/")?.at(-1) ?? "";

        if (lastSegment.includes(":") && !lastSegment.includes("?")) {
            pageSearch = pageSearch?.children.find(item => item.href === pathReplace);
        }

        if (pageSearch) {
            if (pageSearch.param === enums.paramCreate) {
                pageSearch.param = capitalize(pageSearch.param);
                pageSearch.children = [];
            }
            else {
                if (!pageSearch.noPage) {
                    pageSearch.children.unshift({ ...pageSearch, children: [] });
                }

                pageSearch.children = pageSearch
                    .children
                    .filter(({ href }) => !href.includes(":"));
            }
        }

        return pageSearch;
    });

    const pagesLinks = ref<HTMLUListElement>();

    const barPosition = computed(() => {
        if (pagesLinks.value) {
            const path = route.value.path;
            const link = pagesLinks.value.querySelector(`[href="${path}"]`)?.getBoundingClientRect();
            const bar = document.querySelector("#barIndicatorLink")?.getBoundingClientRect();

            return `
                --w: ${link?.width}px;
                --m: ${(link?.x ?? 0) - (bar?.x ?? 0)}px;
            `;
        }
        else {
            return undefined;
        }
    });

    const focus = (event: Event) => {
        const target = event.target as HTMLDivElement;
        target.scrollIntoView({ behavior: "smooth", inline: "center" });
    };
</script>