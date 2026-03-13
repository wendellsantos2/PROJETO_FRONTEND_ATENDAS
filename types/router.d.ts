import type { PermissionsProp } from "permissions";
import type { Names as Svgs } from "#build/svgs";
import "../node_modules/nuxt/dist/pages/runtime/composables";

declare module "../node_modules/nuxt/dist/pages/runtime/composables" {
    interface PageMeta {
        title?: string
        logo?: Svgs
        navOrder?: number
        icon?: string
        noPage?: boolean
        permissions?: PermissionsProp
        layoutConfig?: {
            fullScreen?: boolean
            search?: boolean
            immediate?: boolean
            filters?: Record<string, {
                [key: string]: unknown
                type?: string
                label?: string
                placeholder?: string
                empty?: unknown
                items?: ((search: string) => Promise<any[] | Record<string, any>>) | any[] | Record<string, any>
            }>
            filterPermissions?: PermissionsProp
            filterPersist?: boolean
        }
    }
}