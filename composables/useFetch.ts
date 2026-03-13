import type { AsyncDataOptions, _Transform } from "#app/composables/asyncData";
import type { NitroFetchRequest, NitroFetchOptions, TypedInternalResponse, ExtractedRouteMethod } from "nitropack/types";
import type { NestedKeyOf } from "~/types";
import { useBusSuccess, useMerge, useRuntimeConfig } from "#imports";

export type Filters = Record<string, string | number | undefined | null | Array<string | number | undefined | null>>;

export const useFetchApi = $fetch.create({
    async onRequest ({ options }) {
        options.baseURL = useRuntimeConfig().public.apiBase;

        const { $user } = useNuxtApp();

        if ($user.token) {
            options.headers = new Headers({
                ...options.headers,
                ...$user.headers,
                "X-Socket-Id": pusher.connection.socket_id
            });
        }

        if (options.query) {
            const map = Object
                .entries(options.query)
                .filter(([_, value]) => ((!([null, undefined, ""].includes(value)) && !isArray(value)) || !!value?.length))
                .map(([key, value]) => {
                    if (isArray(value)) {
                        value = value.join(",");
                    }

                    return [key, value];
                });

            options.query = Object.fromEntries(map);
        }
    },

    onResponse ({ response: { _data, ok } }) {
        if (_data?.message && ok) {
            useBusSuccess().emit(_data.message);
        }
    },

    async onResponseError ({ response: { _data, status } }) {
        const busError = useBusError();

        if (typeof _data?.data === "object") {
            const values = Object.values(_data?.data) as string[][];
            values.forEach((arrayErrors) => {
                arrayErrors?.forEach(m => busError.emit(m));
            });
        }
        else {
            busError.emit(_data?.message);
        }

        if ([401].includes(status) && ["default", "undefined"].includes(String(useRoute().meta.layout))) {
            await navigateTo("/logout");
        }
    }
});

export const useFetchSelect = async <
    R extends NitroFetchRequest,
    O extends NitroFetchOptions<R>,
    DataR = TypedInternalResponse<R, unknown, ExtractedRouteMethod<R, O>>,
    DataT = DataR extends { data: unknown } ? DataR["data"] : DataR,
    DataO = DataT extends (infer U)[] ? U : DataT,
    KeyOf = DataO extends object ? NestedKeyOf<DataO> : never
> (
    request: R,
    opts?: {
        fetch?: O
        filters?: Filters
        fields?: KeyOf[] | false
        value?: KeyOf
        label?: KeyOf
    }
) => {
    opts = useMerge({
        fetch: {},
        filters: {},
        fields: [],
        value: "id",
        label: "name"
    }, opts);

    const filters = Object.fromEntries(
        Object
            .entries(opts.filters!)
            .map(([key, value]) => [`filter[${key}]`, value])
    );

    const fields = opts?.fields === false
        ? null
        : [opts.value, opts.label, ...opts.fields!];

    const fetchOpts = useMerge(opts.fetch!, {
        params: {
            fields,
            ...filters
        }
    });

    const response = await useFetchApi(request, fetchOpts) as any;
    const data = response?.data;

    if (opts.fields === false) {
        return data;
    }

    const array = (isObject(data) ? Object.values(data) : data) ?? [];

    return useMap(array, (option) => {
        return {
            value: useGet(option, (opts.value as string)),
            label: useGet(option, (opts.label as string)),
            ...usePick(option, (opts.fields as string[] || []))
        };
    });
};

// TODO Remover 'preFilters'
// TODO Auxiliar para configurar filtros base (São o ponto de partida e default em reset) e reativos
// TODO Adicionar Tipagem a parâmetros ('sort', 'filters[]', 'fields')
// TODO Adicionar reset
// TODO Mudar forma de alterar filtros e paginação reativos com função com merge
// TODO Disponibilizar dados extras de rotas (são dados que vem na raiz da requisição não sendo 'data', 'meta')
// TODO criar useFetchList (auxiliar de tabelas e listas infinitas com MAP) extender useFetchData e não pode ser adicionado item a lista se tiver filtro (reativo) ativo

export function useFetchData <
    R extends NitroFetchRequest,
    O extends NitroFetchOptions<R>,
    AllData extends boolean = false,
    Data = TypedInternalResponse<R, unknown, "get">,
    DataT = (AllData extends true ? Data : Data extends { data: unknown } ? Data["data"] : Data),
    DataTF = DataT,
    DataATF = DataT
> (
    request: R,
    opts?: {
        allData?: AllData
        keyPrefix?: string
        preFilters?: boolean
        transform?: _Transform<DataT, DataTF>
        fetch?: O
        asyncData?: AsyncDataOptions<DataT, DataATF>
    }
) {
    const key = request.toString().replace(/(\/\d+)/g, ":id") + (opts?.keyPrefix ? `::${opts?.keyPrefix}` : "");

    const filters = ref<Filters>({});

    const _filters = computed(() => {
        return useMap(filters.value, (value, key) => {
            const splitKey = key.split(">");

            return {
                key: splitKey.at(0)!,
                path: splitKey.at(1)?.replaceAll(":", "."),
                value
            };
        })
            .filter(v => v.value);
    });

    const paramsFilters = computed(() => {
        return useFromPairs(_filters.value.map(({ key, value }) => [`filter[${key}]`, value]));
    });

    const pagination = ref({
        page: opts?.fetch?.params?.page ?? 1,
        per_page: opts?.fetch?.params?.per_page ?? null,
        cursor: opts?.fetch?.params?.cursor ?? null
    });

    const paginationInfo = ref({
        current: 0,
        per_page: 0,
        pages: 0,
        total: 0,
        length: 0,
        next_cursor: null,
        prev_cursor: null
    });

    const { data: asyncData, pending, refresh } = useLazyAsyncData(key, async () => {
        const fetchOpts = useMerge({}, opts?.fetch, {
            params: {
                ...paramsFilters.value,
                ...pagination.value
            }
        });

        const response = await useFetchApi(request, fetchOpts) as any;

        paginationInfo.value = {
            current: response.meta.current_page,
            per_page: response.meta.per_page,
            pages: response.meta.last_page,
            total: response.meta.total,
            length: response?.data?.length ?? 0,
            next_cursor: response.meta?.next_cursor ?? null,
            prev_cursor: response.meta?.prev_cursor ?? null
        };

        return opts?.allData ? response : response?.data;
    }, {
        server: false,
        ...opts?.asyncData
    });

    watchDebounced(pagination, () => {
        refresh();
    }, {
        debounce: 200, maxWait: 1000, deep: true
    });

    watchDebounced(paramsFilters, () => {
        if (opts?.fetch?.params?.paginate === "cursor") {
            if (!pagination.value.cursor) {
                refresh();
            }
            else {
                pagination.value.cursor = null;
            }
        }
        else {
            if (pagination.value.page === 1) {
                refresh();
            }
            else {
                pagination.value.page = 1;
            }
        }
    }, {
        debounce: 200, maxWait: 1000, deep: true
    });

    const data = computed((): typeof asyncData.value => {
        let _asyncData: DataTF extends undefined ? DataT : DataTF = (opts?.transform?.(asyncData.value as any) ?? asyncData.value) as any;

        if (!isArray(_asyncData)) {
            _asyncData = useValuesIn(_asyncData);
        }

        if (_filters.value && (opts?.preFilters ?? true)) {
            const formate = <T>(value: T) => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036F]/g, "");

            const filtered = useFilter(_asyncData!, (item) => {
                return useEvery(_filters.value, (filter) => {
                    const value = useGet(item, filter.path ?? filter.key);
                    return value && formate(value).includes(formate(filter.value));
                });
            });

            return useOrderBy(filtered, (item) => {
                return useSumBy(_filters.value, (filter) => {
                    const value = useGet(item, filter.path ?? filter.key);
                    return value ? formate(value).search(formate(filter.value)) : Infinity;
                });
            });
        }

        return _asyncData;
    });

    return {
        filters,
        pagination,
        paginationInfo: readonly(paginationInfo),
        pending,
        refresh,
        asyncData,
        data,
        key
    };
};