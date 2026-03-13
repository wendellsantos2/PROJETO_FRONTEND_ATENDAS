import type {
    GraphNode as _GraphNode,
    Node as _Node,
    NodeProps as _NodeProps,
    Element as _Element
} from "@vue-flow/core";
import type { PermissionsProp } from "permissions";
import type { InternalApi } from "nitropack/types";
import type { Component } from "vue";

export type Workflow = InternalApi["v1/bots/:id/workflows/:id"]["get"]["data"];
export type Omitted = Omit<Workflow, "id" | "type" | "position">;

export type NodeData = Partial<Omitted & {
    file: FileList
    payload: NonNullable<Workflow["payload"]>
}>;

export type GraphNode = _GraphNode<NodeData>;
export type Node = _Node<NodeData>;
export type NodePartial = Partial<Node> & Pick<Node, "id">;
export type NodeProps = _NodeProps<NodeData>;
export type Element = _Element<NodeData>;

export type ComponentNode = Component & {
    flow: Pick<NodeData, "name"> & {
        permissions?: PermissionsProp
    }
};