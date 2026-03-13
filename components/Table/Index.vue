<template>
    <div class="mask-transparent-border -mx-4 -mb-6 flex flex-col gap-4 overflow-auto px-4 pb-6 [--deg:90deg] [--size:1rem] sm:-mx-6 sm:px-6 sm:[--size:1.5rem]">
        <div
            v-if="!!$slots?.actionsBatch && props.data?.length && itemsBatch.length"
            class="flex flex-row flex-wrap items-center gap-4"
        >
            <span class="text-sm opacity-60">
                {{ itemsBatch.length }} items <br> selecionados
            </span>
            <slot
                name="actionsBatch"
                :items="itemsBatch"
            />
        </div>

        <table class="relative z-0 w-full table-auto text-left">
            <thead class="sticky top-0 -z-10">
                <tr>
                    <th
                        v-if="!!$slots?.actionsBatch && props.data?.length"
                        class="px-3"
                    >
                        <TableCheckbox
                            :checked="!useDifference(dataIDS, itemsBatch).length"
                            @change="(checked) => checked ? usePullAll(itemsBatch, dataIDS) : itemsBatch = useUnion(itemsBatch, dataIDS)"
                        />
                    </th>
                    <th
                        v-for="({ name }, index) in theadFull"
                        :key="index"
                        scope="col"
                        class="whitespace-nowrap px-3 pb-2 text-sm font-semibold uppercase tracking-wide opacity-50"
                        :class="{ 'text-end': name === 'Ações' }"
                    >
                        {{ name }}
                    </th>
                </tr>
            </thead>

            <TransitionGroupScale
                tag="tbody"
            >
                <template
                    v-for="(value, index) in props.data"
                    :key="value.id"
                >
                    <tr
                        class="group rounded-2xl shadow-md *:bg-background *:p-3 *:transition-all *:duration-500 first:*:rounded-l-2xl last:*:rounded-r-2xl"
                        :class="{
                            'PENDING': props.pending,
                            'cursor-pointer *:hover:bg-primary *:hover:text-white': !!_itemClick,
                            '*:hover:bg-primary/50': !_itemClick
                        }"
                        :style="`--d: ${index*50}ms`"
                        @click="itemClicked($event, value)"
                    >
                        <td
                            v-if="!!$slots?.actionsBatch"
                            class="w-0"
                        >
                            <div class="flex flex-row items-center">
                                <TableCheckbox
                                    v-model="itemsBatch"
                                    :value="value.id"
                                />
                            </div>
                        </td>

                        <td
                            v-for="(cell, i) in theadDefined"
                            v-show="cell.show"
                            :key="cell.name"
                            class="max-w-xs"
                            :class="[{
                                'w-px': i === theadDefined.length - 1 || cell.propertyPath === 'id',
                                'truncate whitespace-nowrap *:truncate': !props.noAbbreviate === true
                            }, cell.class]"
                        >
                            <slot
                                :name="cell.slot"
                                :_emptyCell="props.emptyCell"
                                v-bind="value"
                            >
                                <p v-if="$slots?.[cell.slot]">
                                    {{ props.emptyCell }}
                                </p>
                                <Component
                                    :is="renderProperty(value, cell.propertyPath, cell.transform)"
                                    v-else
                                />
                            </slot>
                        </td>

                        <td
                            v-if="!!$slots?.actions"
                            class="w-fit"
                        >
                            <div
                                :id="actionId(value.id)"
                                class="flex flex-row items-center justify-end gap-2 *:flex-none"
                            >
                                <slot
                                    v-if="!itemsBatch.length"
                                    name="actions"
                                    :_emptyCell="props.emptyCell"
                                    v-bind="value"
                                >
                                    <p>
                                        {{ props.emptyCell }}
                                    </p>
                                </slot>
                                <span v-else>
                                    . . .
                                </span>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="index + 1 < (props.data?.length ?? 0)" :key="`space${value.id}`" class="h-6" />
                </template>
            </TransitionGroupScale>

            <TransitionOpacity>
                <tfoot v-show="!props.data?.length">
                    <tr>
                        <td :colspan="theadFull.length">
                            <LazyNoData :class="{ PENDING: props.pending }" />
                        </td>
                    </tr>
                </tfoot>
            </TransitionOpacity>
        </table>

        <LazyPagination
            v-if="props.pagination"
            v-bind="props.pagination"
            class="sticky left-0"
            @change="(v) => emits('pagination', v)"
        />
    </div>
</template>

<script setup lang="ts"
    generic="
        Data extends BaseData,
        Item extends NonNullable<Data>[0] = NonNullable<Data>[0]
    "
>
    import type { NestedKeyOf } from "~/types/index";
    import type { Pagination } from "../Pagination.vue";
    import { Mask } from "maska";

    export type BaseData = Array<{ id: string | number }> | null | undefined;

    export interface Props<_Data extends BaseData, _Item extends NonNullable<_Data>[0] = NonNullable<_Data>[0]> {
        data: _Data
        thead: {
            name: string
            propertyPath?: NestedKeyOf<_Item>
            slot?: string
            show?: boolean
            transform?: string | string[] | ((getProperty: never) => unknown)
            class?: string
        }[]
        pending?: boolean
        itemClick?: string | ((item: _Item) => void) | boolean
        noAbbreviate?: boolean
        emptyCell?: string
        pagination?: Pagination
    }

    export type SlotProps<_Item extends NonNullable<BaseData>[0] = NonNullable<BaseData>[0]> = {
        _emptyCell: string
    } & _Item;

    export interface Slots<_Item extends NonNullable<BaseData>[0] = NonNullable<BaseData>[0]> {
        before: () => unknown
        after: () => unknown
        actions: (props: SlotProps<_Item>) => unknown
        actionsBatch: (props: SlotProps<{ items: _Item["id"][] }>) => unknown
        [key: string]: (props: SlotProps<_Item>) => unknown
    }

    const props = withDefaults(defineProps<Props<Data, Item>>(), {
        emptyCell: "- - -"
    });

    const emits = defineEmits<{
        pagination: [page: number]
    }>();

    const slots = useSlots();

    const theadDefined = computed(() => {
        return props.thead.map((head, index) => {
            return {
                ...head,
                show: head.show ?? true,
                slot: head.slot ?? `coll${index}`
            };
        });
    });

    const theadFull = computed(() => {
        const thead = theadDefined.value.filter(v => v.show);

        if (slots?.actions) {
            thead.push({
                name: "Ações",
                show: true,
                slot: "actions"
            });
        }

        return thead;
    });

    const itemsBatch = ref<Item["id"][]>([]);
    const deselect = () => {
        itemsBatch.value = [];
    };
    const dataIDS = computed(() => props.data?.map(({ id }) => id));

    const renderProperty = (data: NonNullable<typeof props.data>[0], propertyPath?: string, transform?: typeof props.thead[0]["transform"]) => {
        let value = "? Undefined ?";

        if (propertyPath) {
            const get = useGet(data, propertyPath);

            if (get !== undefined) {
                if (isArray(transform) || typeof transform === "string") {
                    const mask = new Mask({ mask: transform });
                    transform = (v: unknown) => v ? mask.masked(String(v)) : v;
                }

                const res = transform ? transform(get as never) : get;
                value = [null, undefined, ""].includes(res) ? props.emptyCell : res;
            }
        }

        return crateComponent(value, propertyPath);
    };

    const crateComponent = (text: string, propertyPath?: string) => {
        if (propertyPath === "id") {
            return h(
                "strong",
                {
                    class: "text-secondary"
                },
                `#${text}`
            );
        }

        if ((/^(http|https):\/\/[^ "]+$/).test(text)) {
            return h(
                "a",
                {
                    href: text,
                    target: "_black",
                    class: "link font-medium group-hover:text-secondary"
                },
                text
            );
        }

        return h("p", text);
    };

    const _itemClick = computed(() => {
        switch (typeof props.itemClick) {
            case "undefined":
            case "boolean":
            case "string": {
                let path = props.itemClick;

                if (itemsBatch.value.length || path === false) {
                    return undefined;
                }

                if (["", undefined, true].includes(path)) {
                    path = route.value.path;
                }

                const to = (item: Item) => `${path}/${item.id}`.replace(/\/\//g, "/");

                return async (item: Item) => await navigateTo(to(item));
            }

            case "function": {
                const func = props.itemClick;
                return async (item: Item) => await func(item);
            }
        }

        return undefined;
    });

    const actionId = (id: Item["id"]) => `TABLE-TD-ACTION-${id}`;
    const route = useRouter().currentRoute;

    const itemClicked = async (event: MouseEvent, item: Item) => {
        const actionCell = document.querySelector(`#${actionId(item.id)}`);
        const target = event.target as HTMLElement;

        if (!actionCell?.contains(target) || actionCell === target) {
            await _itemClick.value?.(item);
        }
    };

    defineExpose({
        deselect
    });
</script>

<style scoped lang="postcss">
    .PENDING {
        @apply pointer-events-none animate-pulse blur-sm [animation-delay:var(--d)] [animation-duration:0.5s];
    }
</style>