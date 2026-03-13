<template>
    <div
        ref="container"
        class="flex"
        :class="{ 'mask-transparent-border overflow-auto': !props.overflow }"
    >
        <slot name="containerBefore" />

        <TransitionGroupScale
            tag="ul"
            class="flex h-fit w-full grow flex-col"
            :class="props.classList"
        >
            <slot name="before" :paginationInfo />

            <template v-for="(item, index) in list" :key="item.id">
                <slot
                    :previous="list.at(index-1)"
                    :item
                    :next="list.at(index+1)"
                    :index
                    :first="index === 0"
                    :last="list.length === index+1"
                />
            </template>

            <slot name="after" :paginationInfo />

            <li
                ref="loadMore"
                key="loadMore"
                class="flex flex-col gap-2 text-center"
            >
                <TransitionOpacity mode="out-in">
                    <div v-if="pending || !endPage" class="w-full">
                        <slot name="loading">
                            <p
                                v-if="props.textFirst !== false && pagination.page === 1"
                                class="opacity-50"
                            >
                                {{ props.textFirst }}
                            </p>
                            <p
                                v-else-if="props.textLoading !== false"
                                class="opacity-50"
                            >
                                {{ props.textLoading }}
                            </p>
                        </slot>
                        <BarLoading />
                    </div>

                    <slot v-else-if="asyncData?.size" name="end">
                        <p
                            v-if="props.textEnd !== false"
                            class="opacity-50"
                        >
                            {{ props.textEnd }}
                        </p>
                    </slot>

                    <slot v-else name="empty">
                        <p
                            v-if="props.textEmpty !== false"
                            class="opacity-50"
                        >
                            {{ props.textEmpty }}
                        </p>
                    </slot>
                </TransitionOpacity>
            </li>
        </TransitionGroupScale>

        <slot name="containerAfter" />
    </div>
</template>

<script setup lang="ts"
    generic="
        R extends NitroFetchRequest,
        O extends NitroFetchOptions<R> = NitroFetchOptions<R>,
        IT extends BaseData | undefined = undefined,
        InternalResponse extends TypedInternalResponse<R, unknown, ExtractedRouteMethod<R, O>> = TypedInternalResponse<R, unknown, ExtractedRouteMethod<R, O>>,
        FetchResponse extends BaseList = InternalResponse extends BaseList ? InternalResponse : BaseList,
        FetchData extends NonNullable<FetchResponse['data']> = NonNullable<FetchResponse['data']>,
        Item extends FetchData[0] = FetchData[0],
        ItemPartial extends _DeepPartial<Item> & { id: Item['id'] } = _DeepPartial<Item> & { id: Item['id'] },
        Opts extends Parameters<typeof useFetchData<R, O, true, FetchResponse, FetchData>>[1] = Parameters<typeof useFetchData<R, O, true, FetchResponse, FetchData>>[1],
        ItemTrans extends (IT extends undefined ? Item : _DeepRequired<IT>) = IT extends undefined ? Item : _DeepRequired<IT>
    "
>
    // TODO arrumar tipagem
    // TODO Em transform passar itens parentes (anterior e proximo)

    import type {
        NitroFetchRequest,
        NitroFetchOptions,
        TypedInternalResponse,
        ExtractedRouteMethod
    } from "nitropack/types";

    import type { BaseMultiple } from "api";
    import type { NestedKeyOf } from "~/types";
    import type { _DeepPartial } from "pinia";

    export type BaseData = { id: unknown };
    export type BaseList = BaseMultiple<BaseData>;
    export type _DeepRequired<T> = {
        [K in keyof T]-?: _DeepRequired<NonNullable<T[K]>>;
    };

    const props = withDefaults(defineProps<{
        request: R
        opts?: Opts
        overflow?: boolean
        classList?: string
        textFirst?: string | boolean
        textLoading?: string | boolean
        textEnd?: string | boolean
        textEmpty?: string | boolean
        sortPath?: NestedKeyOf<ItemTrans>
        transform?: (item: ItemPartial) => IT
        cache?: boolean
    }>(), {
        classList: "",
        textFirst: "Buscando dados...",
        textLoading: "Um momento, carregando mais...",
        textEnd: "Aqui foi onde tudo começou :)",
        textEmpty: "Ops, isso está vazio ;(",
        sortPath: undefined,
        transform: undefined,
        cache: true
    });

    const emits = defineEmits<{
        extraResponse: [data: Omit<FetchResponse, "data" | "meta">]
    }>();

    const container = ref<HTMLDivElement>();

    const _transform = (item: ItemPartial): ItemTrans => props.transform
        ? props.transform(item) as unknown as ItemTrans
        : item as unknown as ItemTrans;

    const opsDefault = useMerge({
        keyPrefix: "infinite"
    }, props.opts);

    const opsFetch = useMerge(opsDefault, {
        fetch: {
            params: {
                paginate: "cursor"
            }
        },
        allData: true,
        asyncData: {
            default: () => new Map<ItemTrans["id"], ItemTrans>(),
            transform: ({ data, meta, ...extra }: FetchResponse): Map<ItemTrans["id"], ItemTrans> => {
                const transformed = data?.map((item) => {
                    const itemTrans = _transform(item);

                    return [itemTrans["id"], itemTrans];
                });

                const cache = pagination.value?.cursor
                    ? useNuxtData<Map<ItemTrans["id"], ItemTrans>>(key)?.data.value
                    : undefined;

                emits("extraResponse", extra);

                return new Map<ItemTrans["id"], ItemTrans>([
                    ...(cache || []),
                    ...transformed
                ]);
            }
        }
    });

    const {
        pending,
        filters,
        refresh,
        pagination,
        asyncData,
        key,
        paginationInfo
    } = useFetchData(props.request, opsFetch);

    const endPage = computed(() => {
        return !paginationInfo.value.next_cursor;
    });

    const loadMore = ref<HTMLDivElement>();
    const loadMoreVisible = useElementVisibility(loadMore);

    watchDebounced([loadMoreVisible, endPage, pending], ([isVisible, isEndPage, isLoading]) => {
        if (isVisible && !isEndPage && !isLoading) {
            pagination.value.cursor = paginationInfo.value.next_cursor;
        }
    }, {
        immediate: true,
        debounce: 1000,
        maxWait: 10000
    });

    const upSert = (
        item: ItemPartial,
        opts?: {
            order?: "first" | "last"
            reInsert?: boolean
        }
    ) => {
        opts = useMerge({
            order: "last",
            reInsert: false
        }, opts);

        const oldItem = get(item.id);
        const newItem = _transform(item);
        const merge = useMerge(oldItem, newItem);

        const ids = [...asyncData.value?.keys()];

        if (opts.reInsert && ((opts.order === "first" && ids.at(0) !== merge.id) || (opts.order === "last" && ids.at(-1) !== merge.id))) {
            remove(item.id);
        };

        if (opts.order === "first" && !has(merge.id)) {
            asyncData.value = new Map<Item["id"], Item>([
                [merge.id, merge],
                ...asyncData.value?.entries()
            ]);
        }
        else {
            asyncData.value?.set(item.id, useMerge(merge));
        }

        return merge;
    };

    const get = (id: Item["id"]) => asyncData.value?.get(id) as ItemTrans;
    const has = (id: Item["id"]) => asyncData.value?.has(id) as boolean;
    const remove = (id: Item["id"]) => asyncData.value?.delete(id);

    const reset = () => {
        if (!pagination.value.cursor) {
            refresh();
        }
        else {
            pagination.value.cursor = null;
        }
    };

    const list = computed((): ItemTrans[] => {
        const values = [...(asyncData.value?.values() || [])];

        if (props.sortPath) {
            return useOrderBy(values, props.sortPath as string);
        }

        return values;
    });

    onUnmounted(() => {
        if (!props.cache) {
            asyncData.value?.clear();
        }
    });

    defineExpose({
        container,
        list: readonly(list),
        filters,
        upSert,
        get,
        has,
        remove,
        reset
    });
</script>