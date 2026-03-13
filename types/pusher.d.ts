import type { InternalApi } from "nitropack/types";

export interface Channels {
    public: {
        "webchat-{to}.{id}": {
            upsertMessage: InternalApi["webchat/:to/messages"]["post"]["data"]
            closedConversation: InternalApi["webchat/:to/init"]["post"]["data"]["id"]
            updateConversation: InternalApi["webchat/:to/init"]["post"]["data"]
        }
    }

    private: {
        "users.{id}": {
            upsertUser: Partial<InternalApi["v1/users/:id"]["get"]["data"]>
            upsertConversation: InternalApi["v1/conversations/:id"]["get"]["data"]
            closedConversation: Pick<Channels["private"]["users.{id}"]["upsertConversation"], "id">
            closeConversationByAttendant: Pick<Channels["private"]["users.{id}"]["upsertConversation"], "id">
            upsertChat: InternalApi["v1/chats/:id"]["get"]["data"]
            upsertTicket: InternalApi["v1/tickets/:id"]["get"]["data"]
            commentTicket: Pick<Channels["private"]["tickets.{id}"]["upsertComment"], "id"> & {
                status_id: NonNullable<Channels["private"]["users.{id}"]["upsertTicket"]["status"]>["id"]
            }
            changeStatusTicket: {
                status_from: number
                status_to: number
                ticket_id: number
            }
            removeStageContact: {
                id: InternalApi["v1/contacts/:id"]["get"]["data"]["id"]
                funnel: Pick<NonNullable<InternalApi["v1/contacts/:id"]["get"]["data"]["funnel"]>, "id">
                stage: Pick<NonNullable<InternalApi["v1/contacts/:id"]["get"]["data"]["stage"]>, "id">
            }
            upsertContact: InternalApi["v1/contacts/:id"]["get"]["data"]
        }

        "companies.{id}": {
            upsertConversation: Channels["private"]["users.{id}"]["upsertConversation"]
            wppConnectSetup: InternalApi["third-party/whatsapp/session/:id/login"]["post"]["data"] & { provider_id: number }
            removeStageContact: Channels["private"]["users.{id}"]["removeStageContact"]
            upsertContact: Channels["private"]["users.{id}"]["upsertContact"]
            deleteContact: Pick<InternalApi["v1/contacts/:id"]["get"]["data"], "id">
        }

        "conversations.{id}": {
            upsertMessage: InternalApi["v1/messages/:id"]["get"]["data"]
            updatedStatusMessage: Pick<InternalApi["v1/messages/:id"]["get"]["data"], "id" | "status">
            closedConversation: {
                id: number
            }
        }

        "tickets.{id}": {
            upsertComment: InternalApi["v1/tickets/:id/comments/:id"]["get"]["data"]
            deleteComment: Pick<Channels["private"]["tickets.{id}"]["upsertComment"], "id">
        }

        "chats.{id}": {
            upsertChatMessage: InternalApi["v1/chats/:id/messages/:id"]["get"]["data"]
            deleteChatMessage: Pick<Channels["private"]["chats.{id}"]["upsertChatMessage"], "id">
            joinChatParticipant: InternalApi["v1/chats/:id/messages/:id"]["get"]["data"]["sender"]
            leaveChatParticipant: Pick<Channels["private"]["chats.{id}"]["joinChatParticipant"], "id">
        }

        "campaigns.{id}": Pick<Channels["private"]["companies.{id}"], "upsertContact" | "deleteContact">
    }
}