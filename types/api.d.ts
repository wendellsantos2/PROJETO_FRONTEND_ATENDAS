declare module "api" {
    export interface Message {
        message: string
    }

    export interface Base<T> extends Partial<Message> {
        data: T
    }

    export interface BaseMultiple<T> extends Partial<Message> {
        data: T[]

        links: {
            first: string
            last: string
            prev: string
            next: string
        }

        meta: {
            current_page: number
            from: string
            last_page: number
            path: string
            per_page: number
            to: string
            total: number
            next_cursor?: string | null
            prev_cursor?: string | null
        }
    }

    export interface DynamicField {
        label: string
        type: "text" | "select" | "number" | "input" | "textarea" | "color"
        name: string
        default?: string | number | object
        options?: Record<string, unknown>
        fetch?: {
            route: string
            value: string
            label: string
            params: Record<string, string>
        }
    }

    export type DynamicFields = Record<string, DynamicField>;
}