declare module "permissions" {
    export type CRUDPermissions = [
        "company",
        "team",
        "user",
        "provider",
        "tag",
        "upload",
        "contact",
        "template",
        "conversation",
        "message",
        "role",
        "bot",
        "campaign",
        "category",
        "status",
        "priority",
        "funnel",
        "webhook",
        "contract_template",
        "automation",
        "dashboard",
        "form",
        "gamification"
    ];

    export type SpecificPermissions = [[
        "company",
        "manager"
    ], [
        "conversation",
        "create" | "delete" | "update" | "close" | "change_attendant" | "manager"
    ], [
        "message",
        "delete" | "update"
    ], [
        "team",
        "view" | "create" | "update" | "delete" | "assign"
    ], [
        "user",
        "impersonate"
    ], [
        "bot",
        "clone"
    ], [
        "mail_template",
        "create" | "update" | "delete"
    ], [
        "ticket",
        "delete" | "assign" | "manager"
    ], [
        "category",
        "assign"
    ], [
        "application",
        "read" | "create" | "delete"
    ], [
        "stage",
        "create" | "update"
    ], [
        "permission",
        "assign"
    ], [
        "role",
        "assign"
    ], [
        "tag",
        "assign"
    ], [
        "provider",
        "has_ai"
    ], [
        "contact",
        "manager"
    ], [
        "attendant",
        "change"
    ]];

    export type CRUDBase = "create" | "read" | "update" | "delete";

    export type GeneratePermissions<
        T extends string = CRUDPermissions[number],
        A extends string = CRUDBase
    > = `${A}_${T}`;

    type GenerateSpecificPermissions =
        SpecificPermissions[number] extends [infer Entity extends string, infer Actions extends string]
            ? GeneratePermissions<Entity, Actions>
            : never;

    export type Permissions =
      | `provider:${Providers}`
      | "has_backoffice_access"
      | GeneratePermissions
      | GenerateSpecificPermissions
    ;

    export default Permissions;

    export type PermissionsProp =
      | Permissions
      | Permissions[]
      | { list: Permissions[], satisfyAll: boolean };
}