<template>
    <div class="grid h-dvh w-dvw grid-cols-[min-content_minmax(0,_1fr)] grid-rows-[min-content_minmax(0,1fr)] overflow-hidden">
        <Body :class="{ 'light:!bg-quarter dark:!bg-tertiary': $user.isImpersonating }" />

        <nav
            class="col-span-2 flex w-full flex-row flex-wrap justify-between gap-4 p-4 transition-all duration-500 lg:justify-center"
            :class="{ 'lg:col-span-1': !$user.isImpersonating }"
        >
            <p
                v-if="$user.isImpersonating && $user.value"
                class="-mx-4 -mt-4 inline w-full grow rounded-b-3xl border-b-2 border-background-200 bg-background px-4 py-2 text-center text-xs lg:order-2 lg:m-0 lg:flex lg:w-auto lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:rounded-none lg:border-none lg:bg-transparent lg:p-0 lg:text-base lg:font-bold"
            >
                <span>
                    Você está logado como: <span class="font-bold">{{ $user.value?.name }} ({{ $user.value?.role.display_name }})</span>
                </span>
                <span class="lg:hidden">
                    na
                </span>
                <span>
                    <span class="lg:capitalize">empresa</span> <span class="text-secondary">#{{ $user.value?.company.id }}</span> {{ $user.value?.company.name }}
                </span>
                <Button
                    color="danger"
                    class="hidden lg:flex"
                    @click="stopImpersonate()"
                >
                    <Icon name="logout" />
                    Deslogar
                </Button>
            </p>

            <Icon
                name="logo"
                size="2.5rem"
                class="flex-none"
            />
            <div
                v-if="!$screen.lg"
                class="relative -mb-2 grow"
            >
                <LayoutTabs class="absolute inset-0" />
            </div>

            <LayoutMenu
                v-model="open"
                class="lg:hidden"
            />
        </nav>

        <nav
            class="-mt-4 ml-[calc(var(--width)*-1)] flex h-full w-[--width] flex-none grow flex-col items-center transition-all duration-500 *:px-4 lg:order-last lg:ml-0 lg:w-auto lg:*:px-3"
            :class="{
                '!ml-0': open,
                '!order-none': $user.isImpersonating
            }"
            style="--width: 15rem"
        >
            <TransitionGroupTranslateX
                tag="ul"
                class="mask-transparent-border -mx-4 my-auto flex flex-col items-start gap-2 overflow-auto p-4 [--size:1rem] lg:items-center"
            >
                <li
                    v-for="(page) in usePages"
                    :key="page.href"
                >
                    <NuxtLink
                        v-tooltip.right="{
                            content: page.title,
                            disabled: !$screen.lg
                        }"
                        :href="page.href"
                        class="flex w-full flex-row place-items-center gap-4 rounded-xl bg-cover p-2 text-contrast/50 transition-all duration-500 hover:text-primary"
                        :class="{ 'bg-primary/20 !text-primary': $route.path.startsWith(page.href) }"
                    >
                        <Icon
                            :name="page.icon!"
                            size="1.7rem"
                        />
                        <span class="lg:hidden">
                            {{ page.title }}
                        </span>
                    </NuxtLink>
                </li>
            </TransitionGroupTranslateX>

            <div class="flex w-full flex-row items-end justify-between gap-2 lg:flex-col lg:items-center">
                <VMenu
                    placement="right-start"
                    :skidding="-180"
                    :arrowPadding="10"
                    :triggers="['hover', 'click']"
                >
                    <div class="relative">
                        <NuxtLink
                            href="/eu"
                            class="block size-12 flex-none overflow-hidden rounded-full border-2 border-transparent max-lg:pointer-events-none"
                            activeClass="!border-primary"
                        >
                            <img
                                v-if="$user.value?.name"
                                :src="$user.value?.avatar_url"
                                :alt="$user.value?.name"
                                class="size-full bg-background-100 object-cover object-center"
                            >
                        </NuxtLink>
                        <Badge
                            v-show="unreadNotifications"
                            color="danger"
                            :name="false"
                            :icon="false"
                            variant="solid"
                            size="xs"
                            class="absolute right-0 top-0"
                        >
                            {{ unreadNotifications }}
                        </Badge>
                    </div>

                    <template #popper>
                        <ul v-close-popper class="flex flex-col divide-y divide-background/20 *:flex *:cursor-pointer *:flex-row *:items-center *:gap-2 *:p-3 *:transition-all *:duration-300">
                            <li class="!cursor-default !flex-col !items-start !gap-0.5 bg-contrast-300">
                                <Badge
                                    :color="$user.value?.role.color"
                                    :name="$user.value?.role.display_name"
                                    :icon="false"
                                    variant="solid"
                                    :resumeString="20"
                                    class="!text-[8px] tracking-wider"
                                />
                                <h6 class="line-clamp-2 font-bold">
                                    <span class="text-secondary">#{{ $user.value?.id }}</span> {{ $user.value?.name }}
                                </h6>
                            </li>
                            <li
                                class="hover:bg-primary/20 hover:text-primary"
                                @click="navigateTo('/eu')"
                            >
                                <Icon name="gear" size="0.8rem" />
                                Configurações
                            </li>
                            <li
                                class="hover:bg-primary/20 hover:text-primary"
                                @click="$colorMode.preference = $colorMode.preference === 'dark' ? 'light' : 'dark'"
                            >
                                <Icon :name="$colorMode.preference === 'dark' ? 'moon' : 'sun'" size="0.8rem" />
                                Tema da interface
                            </li>
                            <li
                                class="hover:bg-primary/20 hover:text-primary"
                                @click="useNotificationsStore().toggle(true)"
                            >
                                <Icon name="notification" size="0.8rem" />
                                Notificações
                                <Badge
                                    v-show="unreadNotifications"
                                    color="danger"
                                    :name="false"
                                    :icon="false"
                                    variant="solid"
                                    size="sm"
                                >
                                    {{ unreadNotifications }}
                                </Badge>
                            </li>
                            <li
                                class="hover:bg-danger/30 hover:text-danger"
                                @click="$user.isImpersonating ? stopImpersonate() : navigateTo('/logout')"
                            >
                                <Icon name="logout" size="0.8rem" />
                                {{ $user.isImpersonating ? `Deslogar de: ${$user.value?.name}` : 'se desconectar' }}
                            </li>
                        </ul>
                    </template>
                </VMenu>
                <span class="text-center text-sm font-medium leading-none tracking-widest opacity-60">
                    v{{ $version }}
                </span>
            </div>
        </nav>

        <main
            class="border-tl-2 relative z-0 flex w-dvw grow flex-col overflow-auto rounded-3xl rounded-br-none border-t-2 border-background-200 bg-background transition-all duration-500 lg:row-span-2 lg:w-auto lg:rounded-tr-none lg:border-l-2 lg:border-t-0"
            :class="{
                'rounded-bl-none': !open && !$screen.lg,
                'border-l-2 after:absolute after:inset-0 after:z-10 after:bg-black/0 after:backdrop-blur-sm': open,
                'border-t-2 lg:!row-span-1': $user.isImpersonating
            }"
        >
            <TransitionHeight>
                <div
                    v-show="pageOpts"
                    v-if="!$route.meta?.layoutConfig?.fullScreen"
                >
                    <div class="mask-transparent-border no_scrollbar flex flex-row items-center justify-between gap-6 overflow-auto whitespace-nowrap p-4 [--deg:90deg] [--size:1rem] sm:p-6 sm:[--size:1.5rem]">
                        <LayoutTabs v-if="$screen.lg" />

                        <div class="flex grow flex-row justify-end gap-4">
                            <div
                                v-show="headerBeforeChild"
                                id="layoutHeaderBefore"
                                ref="layoutHeaderBefore"
                                class="flex flex-row gap-4"
                            />

                            <TransitionOpacity>
                                <Button
                                    v-show="$route.meta?.layoutConfig?.filters && useCheckPermissions($route.meta?.layoutConfig?.filterPermissions)"
                                    :color="filtersCount ? 'secondary' : 'background'"
                                    variant="outline"
                                    class="relative !p-3 text-contrast/50"
                                    @click="modalFilters?.toggle()"
                                >
                                    <Icon name="filter" />
                                    <span v-show="filtersCount" class="text-sm font-medium leading-none">
                                        {{ filtersCount }}
                                    </span>
                                </Button>
                            </TransitionOpacity>

                            <TransitionOpacity>
                                <Vueform
                                    v-show="$route.meta?.layoutConfig?.search"
                                    v-model="formSearch"
                                    sync
                                    :endpoint="false"
                                    :removeClasses="{
                                        FormElements: {
                                            container: ['form-gap-x-gutter'],
                                            container_sm: ['form-gap-x-gutter-sm'],
                                            container_lg: ['form-gap-x-gutter-lg']
                                        }
                                    }"
                                    class="grow sm:max-w-80"
                                >
                                    <TextElement
                                        name="search"
                                        inputType="search"
                                        placeholder="Pesquisar"
                                    >
                                        <template #addon-after>
                                            <Icon name="search" />
                                        </template>
                                    </TextElement>
                                </Vueform>
                            </TransitionOpacity>

                            <div
                                v-show="headerAfterChild"
                                id="layoutHeaderAfter"
                                ref="layoutHeaderAfter"
                                class="flex flex-row gap-4"
                            />
                        </div>
                    </div>
                </div>
            </TransitionHeight>

            <slot />
        </main>

        <div
            v-if="$screen.lg"
            class="pointer-events-none fixed bottom-0 right-0 z-[99] flex flex-row items-end justify-end gap-4 *:pointer-events-auto last:*:!rounded-tr-none"
        >
            <LazyLayoutMessaging
                v-if="!$route.path.startsWith('/chat-interno')"
            />
            <LazyLayoutPhone />
        </div>

        <LazyModal
            ref="modalFilters"
            title="filtros"
            size="xs"
        >
            <Vueform
                ref="formFilters"
                v-model="filters"
                sync
                :endpoint="false"
                :schema="schemaFilters"
            />
            <div class="flex flex-row form-gap-gutter-lg *:w-full">
                <Button @click="sendFilters()">
                    Aplicar
                </Button>
                <Button
                    v-show="filtersCount"
                    color="danger"
                    @click="() => {
                        formFilters?.reset();
                        sendFilters()
                    }"
                >
                    Limpar
                </Button>
            </div>
        </LazyModal>

        <LazyLayoutViewMedia />
        <LazyLayoutNotifications />
        <LazyLayoutAbsence />
    </div>
</template>

<script setup lang="ts">
    import type { Filters } from "~/composables/useFetch";

    const open = ref(false);

    const {
        $user,
        $router,
        $screen
    } = useNuxtApp();

    const {
        stopImpersonate
    } = useUserStore();

    const route = computed(() => $router.currentRoute.value);

    const layoutHeaderBefore = ref<HTMLDivElement>();
    const headerBeforeChild = ref(0);

    useMutationObserver(layoutHeaderBefore, ([{ target }]) => {
        headerBeforeChild.value = target.childNodes.length;
    }, {
        childList: true
    });

    const layoutHeaderAfter = ref<HTMLDivElement>();
    const headerAfterChild = ref(0);

    useMutationObserver(layoutHeaderAfter, ([{ target }]) => {
        headerAfterChild.value = target.childNodes.length;
    }, {
        childList: true
    });

    const pageOpts = computed(() => {
        return $screen.value.lg || !!headerBeforeChild.value || !!headerAfterChild.value || route.value.meta?.layoutConfig?.search || route.value.meta?.layoutConfig?.filters;
    });

    const formSearch = ref<Record<string, string>>({});

    watch(formSearch, (newValue) => {
        if (!([null, undefined].includes(newValue?.search as any))) {
            useBusLayout().emit(newValue);
        }
    }, {
        deep: true
    });

    // TODO mudar para um esquema com Provider/Inject
    const modalFilters = useModal();
    const formFilters = ref();
    const filters = ref<Filters>({});
    const storageFilters = useLocalStorage<Record<string, Filters>>("page:filters", {});
    let filtersDefaults: Record<string, unknown> = {};

    const schemaFilters = computedWithControl(
        () => route.value?.meta?.layoutConfig?.filters,
        () => {
            const config = route.value?.meta?.layoutConfig?.filters ?? {};

            if (route.value?.meta?.layoutConfig?.filterPersist) {
                if (!isObject(storageFilters.value[route.value.path])) {
                    storageFilters.value[route.value.path] = {};
                }

                filters.value = storageFilters.value[route.value.path];
            }

            filtersDefaults = {};

            const map = Object.entries(config).map(([key, value]) => {
                if (value?.type && ["select", "multiselect"].includes(value.type)) {
                    value.native = false;
                }

                if (value?.type === "multiselect") {
                    value.hideSelected = false;
                    value.closeOnSelect = false;
                    value.closeOnDeselect = false;
                }

                if (typeof value?.items === "function") {
                    value.search = true;
                    value.delay = 1000;
                }

                // TODO remover, usar default
                if (value?.empty) {
                    filtersDefaults[key] = value.empty;
                }

                if (route.value?.meta?.layoutConfig?.filterPersist) {
                    value.onChange = (v) => {
                        if (String(v) === String(value.default)) {
                            delete storageFilters.value[route.value.path][key];
                        }
                        else {
                            storageFilters.value[route.value.path][key] = v;
                        }
                    };
                }

                return [key, value] as const;
            });

            return useFromPairs(map);
        }
    );

    const filtersCount = computed(() => {
        return Object.entries(filters.value)
            .filter(([key, value]) => {
                if (String(schemaFilters.value[key]?.default) === String(value)) {
                    return false;
                }
                else if (isArray(value)) {
                    return !!value.length;
                }
                else if (isObject(value)) {
                    return !!Object.values(filters.value).length;
                }
                else {
                    return !(["", null, undefined].includes(value));
                }
            })
            .length;
    });

    const sendFilters = async () => {
        const dataFilters = useUnRef(filters.value);

        Object.entries(filtersDefaults).forEach(([key, value]: any) => {
            const filter = dataFilters?.[key] as any;

            if ([null, undefined, ""].includes(filter) || (isArray(filter) && !filter?.length)) {
                dataFilters[key] = value;
            }
        });

        await nextTick();

        useBusLayout().emit({ filters: dataFilters });
        modalFilters.value?.toggle(false);
    };

    useNuxtApp().hook("page:loading:end", () => {
        if (route.value?.meta?.layoutConfig?.immediate) {
            sendFilters();
        }
    });

    $router.afterEach(() => {
        open.value = false;
        formSearch.value = {};
        filters.value = {};
    });

    const {
        unreadComputed: unreadNotifications
    } = storeToRefs(useNotificationsStore());

    const user = useUserStore();

    usePusher({
        name: "private-users.{id}",
        id: () => user.token?.user_id ?? 0
    }, {
        upsertUser (_data) {
            user.data = useMerge(user.data, _data);
        }
    });
</script>

<style scoped lang="postcss">
    nav ul::-webkit-scrollbar {
        @apply size-1;
    }
</style>