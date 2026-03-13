import type { TablePage } from "#build/components";
import type { ComponentExposed } from "~/types";

export function useTablePage () {
    return ref<ComponentExposed<typeof TablePage>>();
}