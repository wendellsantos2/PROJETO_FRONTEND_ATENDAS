import type { InternalApi } from "nitropack/types";
import { _primary, _success, _danger, _warn } from "#tailwind-config/theme/colors";

export type KycStatus = InternalApi["v2/kyc/transactions/:id"]["get"]["data"]["status"];

export const useKycStatusObj = {
    approved: {
        name: "Aprovado",
        icon: "check",
        color: _success
    },
    reproved: {
        name: "Reprovado",
        icon: "error",
        color: _danger
    },
    processing: {
        name: "Processando",
        icon: "pending",
        color: _primary
    },
    pending: {
        name: "Pendente",
        icon: "clock",
        color: _primary
    },
    pending_ocr: {
        name: "Pendente",
        icon: "clock",
        color: _primary
    },
    waiting_documents: {
        name: "Aguardando documentos",
        icon: "documents",
        color: _primary
    },
    initialize: {
        name: "Aguardando início",
        icon: "flag",
        color: _warn
    }
} as Record<KycStatus, {
    name: string
    icon: string
    color: `#${string}`
}>;

export function useKycStatus (status: KycStatus | Lowercase<KycStatus>) {
    return useKycStatusObj[status];
};