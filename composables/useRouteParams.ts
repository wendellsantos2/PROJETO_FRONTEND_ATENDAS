import type { PermissionsProp } from "permissions";

export default function <T extends Record<string, "number" | "string">> (
    permission?: {
        create?: PermissionsProp
        update?: PermissionsProp
    },
    types?: T
) {
    const route = useRoute();

    const params = Object
        .entries(route.params)
        .map(([key, value]) => {
            let _value;

            const type = value === enums.paramCreate ? "create" : "update";

            if (!useCheckPermissions(permission?.[type])) {
                throw createError({
                    statusCode: 403,
                    fatal: true
                });
            };

            if (type === "create") {
                _value = null;
            }
            else {
                _value = types?.[key] === "string" ? String(value) : Number(value);
            }

            return [key, _value] as const;
        });

    return Object.fromEntries(params) as ({
        [K in keyof T]: null | (T[K] extends "string" ? string : number)
    } & Record<string, null | number>);
}