import type { PermissionsProp, Permissions } from "permissions";

export default function (prop?: PermissionsProp) {
    if (!prop) {
        return true;
    }

    const requirePermissions: Permissions[] = [];
    let satisfyAll = false;

    if (isString(prop)) {
        requirePermissions.push(prop);
    }
    else if (isArray(prop)) {
        requirePermissions.push(...prop);
    }
    else {
        requirePermissions.push(...prop.list);
        satisfyAll = prop.satisfyAll;
    }

    if (!requirePermissions.length) {
        return true;
    }

    const { $user } = useNuxtApp();

    if (satisfyAll) {
        return requirePermissions.every(permission => $user.value?.permissions?.[permission]);
    }
    else {
        return requirePermissions.some(permission => $user.value?.permissions?.[permission]);
    }
}