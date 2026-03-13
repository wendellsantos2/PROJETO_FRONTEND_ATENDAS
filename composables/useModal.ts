import type { Modal, ModalConfirm } from "#build/components";
import type { ContextBase } from "~/components/Modal/Index.vue";
import type { ComponentExposed } from "~/types";

export function useModal <T extends ContextBase> () {
    return ref<ComponentExposed<typeof Modal<T>>>();
}

export function useModalConfirm <T extends ContextBase> () {
    return ref<ComponentExposed<typeof ModalConfirm<T>>>();
}