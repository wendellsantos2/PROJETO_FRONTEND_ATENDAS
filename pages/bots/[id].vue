<template>
    <section class="flex size-full grow flex-col">
        <VueFlow
            :nodes="data?.nodes"
            :edges="data?.edges"
            :applyChanges="false"
            :maxZoom="1"
            :minZoom="0.18"
            fitViewOnInit
            :selectNodesOnDrag="false"
            :defaultEdgeOptions="{
                type: 'smoothstep',
                markerEnd: MarkerType.ArrowClosed
            }"
            :connectionRadius="50"
            :connectionMode="ConnectionMode.Strict"
            class="grow border-2 border-dashed border-transparent transition-all duration-300"
            :class="{
                'animate-pulse rounded-3xl !border-secondary': dragEvent
            }"
            @drop.prevent="onDrop"
            @dragenter.prevent
            @dragover.prevent
            @keydown.ctrl.d.prevent="duplicateEvent"
        >
            <Background
                :size="2"
                :gap="20"
                :patternColor="`${_primary}80`"
            />

            <Controls
                v-if="$screen.lg"
                position="bottom-left"
            >
                <ControlButton @click="flowSidebar?.toggle()">
                    <Icon
                        name="arrowLeft"
                        class="transition-transform duration-300"
                        :class="flowSidebar?.open ? '-rotate-90' : 'rotate-90'"
                    />
                </ControlButton>
            </Controls>

            <TransitionOpacity>
                <div
                    v-show="status === 'pending'"
                    class="absolute inset-0 z-9 flex flex-col items-center justify-center gap-4 bg-primary/20 backdrop-blur-sm"
                >
                    <Icon name="loading" size="3rem" />
                    Carregando fluxo...
                </div>
            </TransitionOpacity>

            <div class="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center justify-center gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
                <h1 class="hidden font-bold lg:block">
                    <span class="text-secondary">
                        #{{ id ? id : "Criando" }}
                    </span>
                    {{ bot?.name }}
                </h1>

                <div class="pointer-events-auto flex flex-row gap-4 *:!p-2 lg:order-last">
                    <ButtonBack
                        min
                        iconSize="1.3rem"
                    />
                    <Button
                        v-tooltip="'Editar info'"
                        @click="botUpSert?.toggle()"
                    >
                        <Icon name="edit" size="1.3rem" />
                    </Button>
                    <Button
                        v-if="useCheckPermissions('clone_bot')"
                        v-tooltip="'Baixar fluxo'"
                        color="contrast"
                        :action="async () => await download({ id, ...bot })"
                        :disabled="!data?.nodes.length"
                    >
                        <Icon name="download" size="1.3rem" />
                    </Button>
                    <Button
                        v-if="useCheckPermissions('clone_bot')"
                        v-tooltip="'Importar'"
                        color="secondary"
                        @click="flowImport?.toggle(true)"
                    >
                        <Icon name="flow" size="1.3rem" />
                    </Button>
                    <Button
                        v-slot="scope"
                        v-tooltip="'Atualizar'"
                        color="success"
                        :action="refresh"
                        noChangeLoading
                    >
                        <Icon name="sync" size="1.3rem" :class="{ 'animate-spin': scope.loading }" />
                    </Button>
                    <Button
                        v-if="useCheckPermissions('delete_bot')"
                        v-tooltip="'Deletar'"
                        color="danger"
                        @click="botDelete?.toggle()"
                    >
                        <Icon name="delete" size="1.3rem" />
                    </Button>
                </div>

                <div class="flex flex-col items-center">
                    <TransitionTranslateY mode="out-in">
                        <Badge
                            v-if="wasUpdates"
                            icon="uploading"
                            color="warn"
                            name="Salvando progresso"
                            :resumeString="99"
                            variant="subtle"
                            size="sm"
                        />
                        <Badge
                            v-else-if="saved"
                            icon="check"
                            color="success"
                            name="Progresso salvo"
                            :resumeString="99"
                            variant="subtle"
                            size="sm"
                        />
                    </TransitionTranslateY>
                </div>
            </div>

            <template
                v-for="{ component, key } in nodeTypes"
                #[`node-${key}`]="props"
                :key="key"
            >
                <component
                    :is="component"
                    v-bind="props"
                    @update="update('UPSERT', $event)"
                    @duplicate="duplicate"
                />
            </template>
        </VueFlow>

        <LazyBotFlowSidebar
            v-if="$screen.lg"
            ref="flowSidebar"
            :nodeTypes="Object.fromEntries(nodeTypes.filter((v) => v.checkPermission).map(({ key, name }) => [key, name]))"
        />

        <LazyBotUpSert
            ref="botUpSert"
        />

        <LazyBotFlowImport
            ref="flowImport"
            :botId="id"
            :length="data?.nodes.length ?? 0"
            @refresh="refresh()"
        />

        <LazyBotDelete
            ref="botDelete"
            @then="navigateTo('/bots')"
        />
    </section>
</template>

<script setup lang="ts">
    import type { BotDelete, BotUpSert, BotFlowImport, BotFlowSidebar } from "#components";
    import type { Element, GraphNode, Node, ComponentNode, NodeData, Workflow, NodePartial } from "~/types/workflow";
    import type { Edge } from "@vue-flow/core";
    import { ConnectionMode, MarkerType, VueFlow, useVueFlow } from "@vue-flow/core";
    import "@vue-flow/core/dist/style.css";
    import { Background } from "@vue-flow/background";
    import { ControlButton, Controls } from "@vue-flow/controls";
    import "@vue-flow/controls/dist/style.css";
    import { _primary } from "#tailwind-config/theme/colors";

    definePageMeta({
        title: "bot",
        permissions: "update_bot",
        layoutConfig: {
            fullScreen: true
        }
    });

    const back = async () => await navigateTo("/bots");
    const pageId = Number(useRoute().params.id.toString());

    if (!Number(pageId)) {
        useBusError().emit("Identificador não é um número");
        await back();
    }

    const {
        set,
        reset,
        download
    } = useBotStore();

    await set(pageId)
        .catch(async () => {
            await back();
        });

    const {
        id,
        data: bot
    } = storeToRefs(useBotStore());

    useSeoMeta({
        title: () => bot.value.name!
    });

    const importNodes = import.meta.glob<true, string, ComponentNode>("/components/Bot/Flow/Node/**/!(*Index).vue", {
        eager: true,
        import: "default"
    });

    const nodeTypes = Object.entries(importNodes).map(([key, component]) => {
        const _key = key?.split("/")?.at(-1)?.split(".")?.at(-2)?.toLowerCase() ?? "";
        const _component = markRaw(component);

        return {
            name: _component?.flow?.name ?? _key,
            key: _key,
            component: _component,
            checkPermission: useCheckPermissions(_component?.flow?.permissions)
        };
    });

    const {
        setInteractive,
        addEdges,
        updateNode,
        addNodes,
        removeNodes,
        findNode,
        getSelectedNodes,
        screenToFlowCoordinate,
        viewportRef,
        onConnect,
        onNodesChange,
        onEdgesChange
    } = useVueFlow();

    const { $screen } = useNuxtApp();

    watch(() => $screen.value.lg, v => setInteractive(v), {
        immediate: true
    });

    const toSever = (node: NodePartial) => {
        return {
            ...usePick(node, ["type", "position"]),
            ...node?.data
        };
    };

    const toClient = ({ id, type, position, payload, ...additional }: Workflow & Pick<NodeData, "file">) => {
        return {
            id: String(id),
            type,
            position,
            data: {
                payload: payload || {},
                ...additional
            }
        };
    };

    const route = `v1/bots/${pageId}/workflows` as const;

    const {
        data,
        status,
        refresh
    } = useLazyAsyncData("bot:workflows", async () => {
        const { data: _data } = await useFetchApi(route);

        flowSidebar.value?.toggle(!_data.length);

        const nodes = [] as Node[];
        const edges = [] as Edge[];

        _data.forEach((item) => {
            nodes.push(toClient(item));

            if (item?.payload?.options?.length) {
                item?.payload?.options?.forEach((option) => {
                    if (option?.next_workflow) {
                        edges.push({
                            id: `${option.id}=>${option.next_workflow}`,
                            source: String(item.id),
                            sourceHandle: option.id,
                            target: String(option.next_workflow),
                            animated: true
                        });
                    }
                });
            }
            else if (item?.next_workflow) {
                edges.push({
                    id: `${item.id}=>${item.next_workflow}`,
                    source: String(item.id),
                    target: String(item.next_workflow)
                });
            }
        });

        return {
            nodes,
            edges
        };
    });

    onConnect((params) => {
        let animated = false;

        if (params.sourceHandle) {
            animated = true;
        }

        addEdges({
            ...params,
            id: `${params.sourceHandle || params.source}=>${params.targetHandle || params.target}`,
            animated
        });
    });

    type TypesUpdates = "UPSERT" | "DELETE";
    type KeyUpdates = `${TypesUpdates}:${Node["id"]}`;
    type ItemUpdate = {
        id: Node["id"]
        body: Node["data"] & Partial<Pick<Node, "position" | "type">>
        file: NonNullable<Node["data"]>["file"]
    };

    const updateList = ref<Record<KeyUpdates, ItemUpdate>>({});

    const update = (type: TypesUpdates, node: NodePartial) => {
        const file = node.data?.file;

        node = useUnRef(node);

        const request = {
            id: node.id,
            body: toSever(node),
            file
        };

        const key = `${type}:${request.id}` as const;

        if (key in updateList.value) {
            request.body = useAssign(updateList.value[key]?.body, request.body);
        };

        updateList.value[key] = request;
    };

    const wasUpdates = computed(() => !!Object.keys(updateList.value).length);
    const saved = refAutoReset(false, 2000);

    watchDebounced(updateList, async (list) => {
        const map = (Object.entries(list) as [KeyUpdates, ItemUpdate][])
            .map(([key, request]) => {
                let func = async () => {};

                switch (key.split(":")[0] as TypesUpdates) {
                    case "UPSERT": {
                        const method = request.id?.includes("NODE") ? "POST" : "PUT";
                        const url = method === "POST" ? route : `${route}/${request.id}` as const;

                        func = async () => {
                            try {
                                const { data } = await useFetchApi(url, {
                                    method,
                                    body: request.body,
                                    onResponse: undefined
                                });

                                if (method === "POST") {
                                    updateNode(request.id, toClient({ ...data, file: request.file }));
                                }
                            }
                            catch {
                                if (method === "POST") {
                                    removeNodes(request.id);
                                }
                            }
                        };

                        break;
                    }

                    case "DELETE": {
                        if (!request.id.includes("NODE")) {
                            func = async () => await useFetchApi(`${route}/${request.id}`, {
                                method: "DELETE",
                                onResponse: undefined
                            });
                        }

                        break;
                    }
                }

                return async () => {
                    await func().finally(() => {
                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete updateList.value[key];
                    });
                };
            });

        try {
            await Promise.all(map.map(f => f()));
        }
        finally {
            saved.value = true;
        }
    }, {
        debounce: 1000,
        maxWait: 5000,
        deep: true
    });

    onNodesChange(async (changes) => {
        for (const change of changes) {
            switch (change.type) {
                case "add": {
                    update("UPSERT", change.item);
                    break;
                }

                case "position": {
                    if (change.position) {
                        update("UPSERT", {
                            id: change.id,
                            position: change.position
                        });
                    }
                    break;
                }

                case "remove": {
                    update("DELETE", usePick(change, "id"));
                    break;
                }
            }
        }
    });

    onEdgesChange((changes) => {
        for (const change of changes) {
            if (["add", "remove"].includes(change.type)) {
                const {
                    source,
                    sourceHandle,
                    target
                } = change.type === "add"
                    ? { source: (change.item.sourceNode as Node), sourceHandle: change.item.sourceHandle, target: change.item.target }
                    : change.type === "remove"
                        ? { source: findNode<NodeData>(change.source), sourceHandle: change.sourceHandle, target: change.target }
                        : { source: undefined, sourceHandle: null, target: null };

                const data = {} as NodeData;

                if (source?.data?.payload?.options?.length) {
                    data.payload = {
                        ...source.data.payload,
                        options: source?.data.payload.options.map((opt) => {
                            if (opt && opt?.id === sourceHandle) {
                                opt.next_workflow = change.type === "remove" ? null : target;
                            }

                            return opt;
                        })
                    };
                }
                else {
                    data.next_workflow = change.type === "remove" ? null : target;
                }

                update("UPSERT", { id: source!.id, data });
            }
        }
    });

    const dragEvent = useDragEvent();

    const onDrop = (event: DragEvent) => {
        if (event.target !== viewportRef.value?.firstChild) {
            return;
        }

        const dragData: {
            type: string
            data?: NodeData
        } = {
            type: "message",
            data: {}
        };

        const transferType = event.dataTransfer?.getData("vueflow");
        const transferFiles = event.dataTransfer?.files;
        const transferText = event.dataTransfer?.getData("text") ?? "";

        if (transferType) {
            dragData.type = transferType;
        }
        else if (transferFiles?.length) {
            dragData.type = "media";
            dragData.data!.file = markRaw(transferFiles);
        }
        else if (transferText) {
            dragData.type = "message";
            dragData.data!.content = transferText;
        }
        else {
            return;
        }

        const position = screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY
        });

        const newNode: Element = {
            id: useGenerateId("NODE"),
            ...dragData,
            position
        };

        addNodes(newNode);
    };

    const duplicateEvent = (event: Event) => {
        const tagName = (event.target as HTMLElement)?.tagName;

        if (!["INPUT", "TEXTAREA"].includes(tagName)) {
            getSelectedNodes.value.forEach((node) => {
                duplicate(node);
            });
        }
    };

    const duplicate = (node: GraphNode) => {
        node = useUnRef(node);

        node.data.next_workflow = null;

        node.data?.payload?.options?.map((option) => {
            option.id = useGenerateId("OPTION");
            option.next_workflow = null;
            return option;
        });

        addNodes({
            id: useGenerateId("NODE"),
            ...usePick(node, ["type", "data"]),
            position: {
                x: node.position.x + node.dimensions.width + 50,
                y: node.position.y
            }
        });
    };

    const flowSidebar = ref<InstanceType<typeof BotFlowSidebar>>();
    const flowImport = ref<InstanceType<typeof BotFlowImport>>();
    const botUpSert = ref<InstanceType<typeof BotUpSert>>();
    const botDelete = ref<InstanceType<typeof BotDelete>>();

    useEventListener("beforeunload", (event) => {
        if (wasUpdates.value) {
            event.preventDefault();
        }
    });

    onBeforeUnmount(() => {
        reset();
    });
</script>