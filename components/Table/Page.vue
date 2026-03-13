<template>
    <Container
        :pending
        :pagination="paginationInfo"
        @pagination="(v) => pagination.page = v"
    >
        <template v-if="$slots.before" #before>
            <slot name="before" />
        </template>

        <template #default>
            <Table
                ref="table"
                v-bind="props"
                :data
                :pending
                class="-mt-6 grow pt-6"
            >
                <template v-for="(_, slot) of tableSlots" #[slot]="scope">
                    <slot :name="slot" v-bind="scope" />
                </template>
            </Table>
        </template>

        <template v-if="$slots.after" #after>
            <slot name="after" />
        </template>
    </Container>
</template>

<script setup lang="ts"
    generic="
        R extends NitroFetchRequest,
        O extends NitroFetchOptions<R> = NitroFetchOptions<R>,
        InternalResponse extends TypedInternalResponse<R, unknown, ExtractedRouteMethod<R, O>> = TypedInternalResponse<R, unknown, ExtractedRouteMethod<R, O>>,
        FetchResponse extends BaseList = InternalResponse extends BaseList ? InternalResponse : BaseList,
        FetchData extends NonNullable<FetchResponse['data']> = NonNullable<FetchResponse['data']>,
        Item extends FetchData[0] = FetchData[0],
        Opts extends Parameters<typeof useFetchData<R, O, true, InternalResponse, FetchData>>[1] = Parameters<typeof useFetchData<R, O, true, InternalResponse, FetchData>>[1],
    "
>
    import type { NitroFetchRequest, NitroFetchOptions, ExtractedRouteMethod, TypedInternalResponse } from "nitropack/types";
    import type { Props, BaseData, Slots } from "./Index.vue";
    import type { BaseMultiple } from "api";
    import type { ComponentExposed } from "~/types";
    import type { Table } from "#components";

    export type BaseList = BaseMultiple<NonNullable<BaseData>[0]>;

    const props = withDefaults(defineProps<{
        request: R
        opts?: Opts
    } & Omit<Props<FetchData>, "data">>(), {
        itemClick: undefined,
        opts: undefined
    });

    defineSlots<Slots<Item>>();

    const tableSlots = useOmit(useSlots(), ["before", "after"]);

    const mergeOpts = useMerge({
        keyPrefix: "tablePage"
    }, props.opts);

    const {
        data,
        asyncData,
        pending,
        pagination,
        paginationInfo,
        filters,
        refresh
    } = useFetchData(props.request, mergeOpts);

    const upSert = (newItem: Item) => {
        const index = getIndex(newItem.id);

        if (index !== undefined) {
            const oldItem = asyncData.value![index];

            asyncData.value![index] = useMerge(oldItem, newItem);
        }
        else {
            asyncData.value?.unshift(newItem);

            if (paginationInfo.value.per_page <= (asyncData.value?.length ?? 0)) {
                const lastId = asyncData.value?.at(-1)?.id;

                if (lastId !== undefined) {
                    remove(lastId);
                }
            }
        }
    };

    const get = (itemId: Item["id"]) => {
        const index = getIndex(itemId);
        return index !== undefined ? asyncData.value?.[index] : index;
    };

    const getIndex = (itemId: Item["id"]) => {
        const index = asyncData.value?.findIndex(({ id }) => id === itemId);
        return [undefined, -1].includes(index) ? undefined : index;
    };

    const remove = (itemId: Item["id"]) => {
        const index = getIndex(itemId);

        if (index) {
            asyncData.value?.splice(index, 1);
        }
    };

    const table = ref<ComponentExposed<typeof Table>>();

    defineExpose({
        deselect: () => table.value?.deselect(),
        filters,
        paginationInfo,
        asyncData,
        refresh,
        upSert,
        get,
        remove
    });
</script>