import type { Filters } from "./useFetch";

export function useBusError () {
    return useEventBus<string | null>("error");
};

export function useBusSuccess () {
    return useEventBus<string | null>("success");
};

export function useBusLayout () {
    return useEventBus<{
        search?: string
        filters?: Filters
    }>("layout");
};

export function useViewMedia () {
    return useEventBus<{
        src: string
    }>("view:media");
};