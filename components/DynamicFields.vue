<template>
    <TransitionHeight mode="out-in">
        <ObjectElement
            v-if="props.if && fields.length"
            :key="props.selected"
            :name="props.name"
        >
            <LazyDivider
                v-if="props.title"
                :title="props.title"
                class="col-span-full"
            />
            <component
                :is="component"
                v-for="({ component, ...bind }) in fields"
                :key="bind.name"
                v-bind="bind"
            />
        </ObjectElement>
    </TransitionHeight>
</template>

<script setup lang="ts" generic="OPT extends Options, P extends DynamicFieldKeys<NonNullable<OPT>[0]>">
import type { DynamicField, DynamicFields } from "api";
    import { SelectColor } from "#components";

    export type Options = {
        [key: string]: unknown
        value: string | number
        label: string | number
    }[] | null;

    export type DynamicFieldKeys<T> = {
        [K in keyof T]: T[K] extends DynamicFields | undefined ? K : never
    }[keyof T];

    const props = withDefaults(defineProps<{
        if?: boolean
        title?: string
        name: string
        options: OPT
        parameter?: P
        selected?: string | number
        labels?: boolean
        context?: Record<string | number, unknown>
        routeReplace?: Record<string, unknown>
        addClass?: string
    }>(), {
        if: true,
        title: undefined,
        parameter: undefined,
        selected: undefined,
        labels: true
    });

    const optionSelected = computed(() => {
        return props.options?.find(({ value }) => value === props.selected);
    });

    const printLabel = (text: string) => {
        return props.labels ? text : undefined;
    };

    const fields = computed(() => {
        const selected = optionSelected.value?.[(props.parameter as string) ?? props.name] as DynamicFields ?? {};

        return Object
            .entries(selected)
            .map(([_, { type, options, fetch, ...item }]) => {
                const base = {
                    ...item,
                    label: printLabel(item.label),
                    placeholder: item.label,
                    default: item.default,
                    class: props.addClass
                };

                switch (type) {
                    case "number":
                    case "text":
                    case "input":
                        return {
                            ...base,
                            component: "TextElement",
                            rules: type === "number" ? "numeric" : undefined
                        };

                    case "textarea":
                        return {
                            ...base,
                            component: "TextareaElement",
                            rows: 3
                        };

                    case "color":
                        return {
                            ...base,
                            component: SelectColor
                        };

                    case "select":
                        return {
                            ...base,
                            component: "SelectElement",
                            class: "nowheel",
                            native: false,
                            search: true,
                            ...(options ? { items: options } : fetcher(fetch))
                        };
                }
            });
    });

    const replace = (string: string) => {
        const contextMatches = string.match(/\{[^}]+\}/g);

        if (contextMatches) {
            string = contextMatches.reduce((result, match) => {
                const key = match.slice(1, -1);

                if (key.startsWith("context.")) {
                    const value = useGet(props.context, key.slice(8));
                    return value ? result?.replace(match, String(value)) : "";
                }
                if (props.routeReplace?.[key]) {
                    return result?.replace(match, String(props.routeReplace[key]));
                }

                return "";
            }, string);
        }

        return string;
    };

    const fetcher = (opts: DynamicField["fetch"]) => {
        if (!opts) {
            return {};
        }

        const _opts = JSON.parse(JSON.stringify(opts)) as typeof opts;

        _opts.route = replace(_opts.route);

        Object
            .entries(_opts.params ?? {})
            .forEach(([key, value]) => {
                if (typeof value === "string") {
                    _opts.params[key] = replace(value);
                }
            });

        if (_opts.route && Object.values(_opts.params ?? {}).every(value => value)) {
            return {
                key: `${_opts.route}?${Object.values(_opts.params ?? {}).join("_")}`,
                delay: 1000,
                items: async (search: string) => await useFetchSelect(_opts.route, {
                    filters: {
                        [_opts.label]: search
                    },
                    fetch: {
                        params: {
                            ..._opts.params,
                            per_page: 99
                        }
                    },
                    label: _opts.label,
                    value: _opts.value
                })
            };
        }
        else {
            return {
                items: [],
                disabled: true
            };
        }
    };

    defineExpose({
        optionSelected,
        fields
    });
</script>