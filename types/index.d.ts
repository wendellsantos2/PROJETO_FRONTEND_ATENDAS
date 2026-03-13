export type NestedKeyOf<ObjectType extends object> =
    {
        [Key in keyof NonNullable<ObjectType> & (string | number)]:
        NonNullable<ObjectType[Key]> extends object
            ? (NonNullable<ObjectType[Key]> extends any[] ? `${Key}` : `${Key}` | `${Key}.${NestedKeyOf<NonNullable<ObjectType[Key]>>}`)
            : `${Key}`
    }[keyof ObjectType & (string | number)];

export type ComponentExposed<T> =
    T extends new () => infer E ? E :
        T extends (props: any, ctx: any, expose: (exposed: infer E) => any, ...args: any) => any ? NonNullable<E> :
            {};