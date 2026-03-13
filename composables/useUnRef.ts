type MutableDeep<T> = {
    -readonly [P in keyof T]: T[P] extends object ? MutableDeep<T[P]> : T[P];
};

export default function <T extends object | Ref<object>, R = MutableDeep<T>> (data: T) {
    return JSON.parse(JSON.stringify(data)) as R;
};