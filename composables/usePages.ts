import { capitalize } from "vue";

const {
    $router
} = useNuxtApp();

export default computed(() => {
    const map = $router
        .getRoutes()
        .filter(({ meta: { navOrder, title, permissions, layout } }) => {
            if ((title || navOrder) && ["default", "undefined"].includes(String(layout))) {
                return useCheckPermissions(permissions);
            }

            return false;
        })
        .map(({ name, meta, path }) => {
            let param;

            const href = path.replace(/\/:(\w+)(\(\))?(\?)?/g, (match, p) => {
                if (match.includes("?")) {
                    return "";
                }

                param = $router.currentRoute.value.params[p];
                return param ? `/${param}` : match;
            });

            return {
                title: capitalize(meta.title ?? name?.toString().split("-").at(-1) ?? ""),
                order: meta.navOrder!,
                icon: meta?.icon,
                logo: meta?.logo,
                noPage: meta.noPage,
                children: [],
                param: param && path.split("/").at(-1)?.includes(":") ? param : undefined,
                href
            };
        })
        .sort((a, b) => {
            const aHrefLength = a.href.split("/").length;
            const bHrefLength = b.href.split("/").length;

            if (aHrefLength !== bHrefLength) {
                return aHrefLength - bHrefLength;
            }

            return a.order - b.order;
        });

    type Page = Omit<typeof map[number], "children"> & {
        children: Page[]
    };

    const createChildren = (pages: Page[], page: Page, hrefParts: string[] = []) => {
        if (hrefParts.length === 0) {
            hrefParts = page
                .href
                .split("/")
                .filter(v => !v.includes("?") && Boolean(v));
        }

        const hrefFirst = hrefParts.at(0);

        if (hrefParts.length === 1) {
            pages.push(page);
        }
        else {
            const pageFind = pages.find(({ href }) => href.endsWith(`/${hrefFirst}`));

            if (pageFind) {
                createChildren(pageFind.children, page, hrefParts.slice(1));
            }
        }
    };

    const reduce = map.reduce((previous, current) => {
        createChildren(previous, current);

        return previous;
    }, [] as Page[]);

    return reduce
        .filter(({ noPage, children }) => noPage ? children.length : true);
});