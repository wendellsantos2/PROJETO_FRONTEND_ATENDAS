import "nitropack/types";
import type { BaseMultiple, Base, Message, DynamicFields } from "api";
import type { Permissions } from "permissions";
import type { ChartType } from "chart.js";

declare module "nitropack/types" {
    export interface InternalApi {
        "auth/token": {
            post: {
                token_type: string
                expires_in: string
                access_token: string
                user_id: number
                user_name: string
                company_id: number
            }

            delete: Message
        }

        impersonate: {
            post: InternalApi["auth/token"]["post"]
        }

        "broadcasting/auth": {
            post: {
                auth: string
            }
        }

        me: {
            get: InternalApi["v1/users/:id"]["get"]
        }

        "v1/users/:id": {
            get: Base<{
                id: number
                name: string
                email: string
                avatar_url: string
                upload_id: number
                online: boolean
                score: number
                settings: Record<string, string | number>
                absence_motivation: string | null
                is_absent: boolean
                company: {
                    id: number
                    name: string
                    document: string
                    document_formatted: string
                    business_hours: InternalApi["admin/companies/:id"]["get"]["data"]["business_hours"] | null
                    kyc_form_hash?: string
                }
                has_backoffice_access: boolean
                permissions: Record<Permissions, boolean>
                role: Omit<InternalApi["v1/roles/:id"]["get"]["data"], "company" | "permissions">
                teams: InternalApi["v1/teams"]["get"]["data"]
                categories: InternalApi["v1/categories"]["get"]["data"]
                activated_providers: InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]["service"][]
            }>

            put: InternalApi["v1/users/:id"]["get"]
            delete: Message
        }

        "v1/users": {
            get: BaseMultiple<InternalApi["v1/users/:id"]["get"]["data"]>
            post: InternalApi["v1/users/:id"]["get"]
        }

        "v1/conversations/:id": {
            get: Base<{
                id: number
                started_at: string
                closed_at: string
                updated_at: string
                last_interaction: string
                unreadMessages: number
                attendant_type: "bot" | "user"
                origin: string
                status: keyof InternalApi["v1/companies/:id/settings/conversations/statuses"]["get"]["data"]
                tags: InternalApi["v1/tags"]["get"]["data"]
                contact: InternalApi["v1/contacts/:id"]["get"]["data"]
                attendant: InternalApi["v1/users/:id"]["get"]["data"] | null
                lastMessage: InternalApi["v1/messages/:id"]["get"]["data"]
                team?: InternalApi["v1/teams/:id"]["get"]["data"]
            }>

            put: Message
        }

        "v1/conversations": {
            get: BaseMultiple<InternalApi["v1/conversations/:id"]["get"]["data"]>
        }

        "v1/conversations/:id/close": {
            put: Message
        }

        "v1/conversations/:id/change-attendant": {
            put: Message
        }

        "v1/messages/:id": {
            get: Base<{
                id: string
                sender: string
                recipient: string
                is_inbound: boolean
                service: InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]["service"]
                type: "text" | "image" | "audio" | "video" | "file"
                content: string
                sent_by: string
                status: "created" | "submitted" | "delivered" | "rejected" | "undeliverable" | "read"
                reply_to: Omit<InternalApi["v1/messages/:id"]["get"]["data"], "reply_to"> | null
                media: InternalApi["v1/uploads/:id"]["get"]["data"] | null
                metadata: null | string
                created_at: string
                updated_at: string
            }>
        }

        "v1/messages": {
            get: BaseMultiple<InternalApi["v1/messages/:id"]["get"]["data"]>
            post: Base<InternalApi["v1/messages/:id"]["get"]["data"] & {
                conversation: InternalApi["v1/conversations/:id"]["get"]["data"]
            }>
        }

        "v1/messages/:id/resend": {
            post: Message
        }

        "v1/uploads/:id": {
            get: Base<{
                id: number
                link: string
            }>
            delete: Message
        }

        "v1/uploads": {
            get: BaseMultiple<InternalApi["v1/uploads/:id"]["get"]["data"]>
            post: InternalApi["v1/uploads/:id"]["get"]
        }

        "v1/attachments/download": {
            get: Blob
        }

        "admin/companies/:id/providers/:id": {
            get: Base<{
                id: number
                name: string
                service: string
                type: "message" | "ai" | "other"
                sender?: string
                status: boolean
                metadata: {
                    [key: string]: unknown
                    defaults?: Record<string, unknown>
                    only_transcript?: boolean
                }
            }>

            put: InternalApi["admin/companies/:id/providers/:id"]["get"]
            delete: Message
        }

        "admin/companies/:id/providers": {
            get: BaseMultiple<InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]>
            post: InternalApi["admin/companies/:id/providers/:id"]["get"]
        }

        "v1/providers": {
            get: BaseMultiple<InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]>
        }

        "v1/bots/:id": {
            get: Base<{
                id: number
                name: string
                description: string
                is_active: boolean
                type: "chat" | "campaign" | "nps"
                created_at: string
                updated_at: string

                workflows?: InternalApi["v1/workflows/:id"]["get"]["data"]
            }>

            put: InternalApi["v1/bots/:id"]["get"]
            delete: Message
        }

        "v1/bots": {
            get: BaseMultiple<InternalApi["v1/bots/:id"]["get"]["data"]>
            post: InternalApi["v1/bots/:id"]["get"]
        }

        "v1/bots/:id/clone": {
            post: Message
        }

        "v1/bots/:id/export": {
            get: InternalApi["v1/bots/:id/workflows"]["get"]
        }

        "v1/bots/:id/import": {
            post: Message
        }

        "v1/bots/:id/workflows/:id": {
            get: Base<{
                id: number
                name: string
                type: string
                content: string
                position: {
                    x: number
                    y: number
                }
                next_workflow: string | null
                payload: Partial<{
                    condition: string
                    action: string
                    provider_id: string
                    options: {
                        id: string
                        name: string
                        step: number
                        next_workflow: string | null
                    }[]
                    parameters: Record<string, any>
                    message_type: "image" | "file" | "audio" | "video"
                    upload_id: number | null
                }> | null
            }>

            put: InternalApi["v1/bots/:id/workflows/:id"]["get"]
            delete: Message
        }

        "v1/bots/:id/workflows": {
            get: BaseMultiple<InternalApi["v1/bots/:id/workflows/:id"]["get"]["data"]>
            post: InternalApi["v1/bots/:id/workflows/:id"]["get"]
        }

        "v1/companies/:id/settings/bots/conditions": {
            get: Base<Record<string, {
                label: string
                condition: string
                expected?: DynamicFields
            }>>
        }

        "v1/companies/:id/settings/bots/actions": {
            get: Base<Record<string, {
                label: string
                action: string
            } & Pick<InternalApi["v1/companies/:id/settings/bots/conditions"]["get"]["data"][0], "expected">>>
        }

        "v1/companies/:id/settings/bots/ais": {
            get: Base<({
                id: string
                name: string
                service: string
                type: string
            } & Pick<InternalApi["v1/companies/:id/settings/bots/conditions"]["get"]["data"][0], "expected">)[]>
        }

        "v1/companies/:id/settings/conversations/statuses": {
            get: Base<{
                campaign: "Campanha"
                closed: "Finalizada"
                created: "Bot"
                ignored: "Ignorada"
                pending: "Pendente"
                started: "Em Atendimento"
                window_closed: "Janela Fechada"
            }>
        }

        "v1/templates/:id": {
            get: Base<{
                id: number
                name: string
                type: string
                content: string
                is_active: boolean
                media: InternalApi["v1/uploads"]["post"]["data"] | null
                buttons: any
                parameters: string[]
            }>

            put: InternalApi["v1/templates/:id"]["get"]
            delete: Message
        }

        "v1/templates": {
            get: BaseMultiple<InternalApi["v1/templates/:id"]["get"]["data"]>
            post: InternalApi["v1/templates/:id"]["get"]
        }

        "v1/teams/:id": {
            get: Base<{
                id: number
                name: string
                description: string
                color: `#${string}`
                inactivity_enabled: boolean
                inactivity_time: number
                inactivity_message: string | null
                users: InternalApi["v1/users"]["get"]["data"]
                totalUsers: number
                totalOnlineUsers: number
            }>

            put: InternalApi["v1/teams/:id"]["get"]
            delete: Message
        }

        "v1/teams": {
            get: BaseMultiple<InternalApi["v1/teams/:id"]["get"]["data"]>
            post: InternalApi["v1/teams/:id"]["get"]
        }

        "v1/tags/:id": {
            get: Base<{
                id: number
                name: string
                type: string
                color: `#${string}`
            }>

            put: InternalApi["v1/tags/:id"]["get"]
            delete: Message
        }

        "v1/tags": {
            get: BaseMultiple<InternalApi["v1/tags/:id"]["get"]["data"]>
            post: InternalApi["v1/tags/:id"]["get"]
        }

        "v1/funnels/:id": {
            get: Base<{
                id: number
                name: string
                description: string | null
                stages: InternalApi["v1/funnels/:id/stages"]["get"]["data"]
            }>

            put: InternalApi["v1/funnels/:id"]["get"]
            delete: Message
        }

        "v1/funnels": {
            get: BaseMultiple<InternalApi["v1/funnels/:id"]["get"]["data"]>
            post: InternalApi["v1/funnels/:id"]["get"]
        }

        "v1/funnels/:id/stages/:id": {
            get: Base<{
                id: number
                name: string
                color: `#${string}`
                last_stage: boolean
                position: number
            }>

            put: InternalApi["v1/funnels/:id/stages/:id"]["get"]
            delete: Message
        }

        "v1/funnels/:id/stages": {
            get: BaseMultiple<InternalApi["v1/funnels/:id/stages/:id"]["get"]["data"]>
            post: InternalApi["v1/funnels/:id/stages/:id"]["get"]
        }

        "v1/contacts/:id": {
            get: Base<{
                id: number
                name: string
                birthdate: string | null
                document: string
                document_formatted: string
                email: string
                phone: string
                phone_code: string
                phone_e164: string
                country_code: string
                avatar_url: string
                upload_id: number
                tags: InternalApi["v1/tags"]["get"]["data"]
                services: Record<string, string>
                metadata: {
                    [key: string]: unknown | undefined
                    kyc_status?: Lowercase<InternalApi["v2/kyc/transactions/:id"]["get"]["status"]>
                    hubspot_id?: string
                    cpf_validado?: "Sim" | "Não"
                    cpf_nome_completo?: string
                    forma_de_pagamento?: string
                    kyc_last_attempt?: string
                    kyc_origin?: string
                    color?: `#${string}` | null
                }
                conversation_id: number
                user: InternalApi["v1/users/:id"]["get"]["data"] | null
                source_name: string | null
                last_conversation: InternalApi["v1/conversations/:id"]["get"]["data"] | null
                funnel: InternalApi["v1/funnels/:id"]["get"]["data"] | null
                stage: InternalApi["v1/funnels/:id/stages/:id"]["get"]["data"] | null
                sent_at: string
                send: boolean
                created_at: string
            }>

            put: InternalApi["v1/contacts/:id"]["get"]
            delete: Message
        }

        "v1/contacts": {
            get: BaseMultiple<InternalApi["v1/contacts/:id"]["get"]["data"]>
            post: InternalApi["v1/contacts/:id"]["get"]
        }

        "v1/contacts/import": {
            post: Message
        }

        "v1/contacts/:id/notes/:id": {
            get: Base<{
                id: number
                content: string
                created_at: string
            }>

            put: InternalApi["v1/contacts/:id/notes/:id"]["get"]
            delete: Message
        }

        "v1/contacts/:id/notes": {
            get: BaseMultiple<InternalApi["v1/contacts/:id/notes/:id"]["get"]["data"]>
            post: InternalApi["v1/contacts/:id/notes/:id"]["get"]
        }

        "v1/contacts/:id/calls": {
            get: BaseMultiple<{
                id: number
                phone_number: string
                phone_extension: string
                status: "fail" | "completed" | "cancelled" | "in_service" | "pending"
                started_at: string | null
                finished_at: string | null
            }>
        }

        "v1/contacts/:id/appointments/:id": {
            get: Base<{
                id: number
                title: string
                description: string | null
                start_in: string
                finish_in: string | null
                location: string | null
                user: InternalApi["v1/users/:id"]["get"]["data"]
            }>

            put: InternalApi["v1/contacts/:id/appointments/:id"]["get"]
            delete: Message
        }

        "v1/contacts/:id/appointments": {
            get: BaseMultiple<InternalApi["v1/contacts/:id/appointments/:id"]["get"]["data"]>
            post: InternalApi["v1/contacts/:id/appointments/:id"]["get"]
        }

        "v1/contacts/:id/attachments": {
            get: BaseMultiple<{
                id: number
                link: string
            }>
        }

        "v1/roles/:id": {
            get: Base<{
                id: number
                name: string
                display_name: string
                color: `#${string}`
                permissions: InternalApi["v1/permissions"]["get"]["data"]
                users: InternalApi["v1/users"]["get"]["data"]
            }>

            put: InternalApi["v1/roles/:id"]["get"]
            delete: Message
        }

        "v1/roles": {
            get: BaseMultiple<InternalApi["v1/roles/:id"]["get"]["data"]>
            post: InternalApi["v1/roles/:id"]["get"]
        }

        "v1/permissions": {
            get: Base<{
                id: number
                display_name: string
            }[]>
        }

        "admin/companies/:id": {
            get: Base<{
                id: number
                name: string
                document: string
                document_formatted: string
                providers: InternalApi["admin/companies/:id/providers"]["get"]["data"]
                settings: {
                    conversation_inactivity_active: boolean
                    conversation_inactivity_time: string
                    conversation_inactivity_message: string
                    message_add_attendant_name: boolean
                    conversation_distribution_enabled: boolean
                    transcription_enabled: boolean
                }
                business_hours: {
                    friday: Array<string>
                    monday: Array<string>
                    sunday: Array<string>
                    tuesday: Array<string>
                    saturday: Array<string>
                    thursday: Array<string>
                    wednesday: Array<string>
                    exceptions: Record<string, Array<string>>
                }
            }>

            put: InternalApi["admin/companies/:id"]["get"]
            delete: Message
        }

        "admin/companies": {
            get: BaseMultiple<InternalApi["admin/companies/:id"]["get"]["data"]>
            post: InternalApi["admin/companies/:id"]["get"]
        }

        "v1/companies/:id/settings/bots/variables": {
            get: Base<string[]>
        }

        "available-providers": {
            get: Base<Record<string, {
                label: string
                value: string
                type: InternalApi["admin/companies/:id/providers/:id"]["get"]["data"]["type"]
                fields: DynamicFields
                expected: DynamicFields
            }>>
        }

        "third-party/dazsoft/ramais": {
            get: Base<{
                text: string
                value: string
                data: {
                    user: string
                    token: string
                }
            }[]>
        }

        "third-party/whatsapp/sync-templates/:id": {
            get: Message
        }

        "v1/campaigns/:id": {
            get: Base<{
                id: number
                name: string
                description: string
                status: boolean
                template: InternalApi["v1/templates/:id"]["get"]["data"] | null
                bot: InternalApi["v1/bots/:id"]["get"]["data"] | null
                provider: InternalApi["admin/companies/:id/providers/:id"]["get"]["data"] | null
                parameters: Array<string>
                scheduled_at: string | null
                scheduled_until: string | null
                random_cadence: boolean
                cadence: number
                custom_frequency: boolean
                frequency: InternalApi["admin/companies/:id"]["get"]["data"]["business_hours"] | null
                created_at: string
                updated_at: string
            }>

            put: InternalApi["v1/campaigns/:id"]["get"]
            delete: Message
        }

        "v1/campaigns": {
            get: BaseMultiple<InternalApi["v1/campaigns/:id"]["get"]["data"]>
            post: InternalApi["v1/campaigns/:id"]["get"]
        }

        "v1/campaigns/:id/contacts/:id": {
            put: Message
        }

        "v1/mail-templates/:id": {
            get: Base<{
                id: number
                name: string
                subject: string
                html_template: string
            }>

            put: InternalApi["v1/mail-templates/:id"]["get"]["data"]
            delete: Message
        }

        "v1/mail-templates": {
            get: BaseMultiple<InternalApi["v1/mail-templates/:id"]["get"]["data"]>
            post: Message
        }

        "v1/tickets/:id": {
            get: Base<InternalApi["v1/tickets"]["get"]["data"][0] & {
                company: InternalApi["admin/companies/:id"]["get"]["data"]
                media: InternalApi["v1/uploads"]["get"]["data"]
            }>

            put: InternalApi["v1/tickets/:id"]["get"]
            delete: Message
        }

        "v1/tickets": {
            get: BaseMultiple<{
                id: number
                subject: string
                content: string
                status: InternalApi["v1/statuses/:id"]["get"]["data"] | null
                priority: InternalApi["v1/priorities/:id"]["get"]["data"] | null
                user: InternalApi["v1/users/:id"]["get"]["data"]
                attendant: InternalApi["v1/users/:id"]["get"]["data"] | null
                total_comments: number
                category: InternalApi["v1/categories/:id"]["get"]["data"]
                tags: InternalApi["v1/tags"]["get"]["data"]
                deadline: string
                created_at: string
                updated_at: string
                completed_at: string
                unread_comments_number: number
            }>
            post: InternalApi["v1/tickets"]["get"]["data"][0]
        }

        "v1/tickets/:id/comments/:id": {
            get: Base<{
                id: number
                content: string
                user: InternalApi["v1/users/:id"]["get"]["data"]
                media?: InternalApi["v1/uploads"]["get"]["data"]
                created_at: string
                updated_at: string
            }>

            put: InternalApi["v1/tickets/:id/comments/:id"]["get"]
            delete: Message
        }

        "v1/tickets/:id/comments": {
            get: BaseMultiple<InternalApi["v1/tickets/:id/comments/:id"]["get"]["data"]>
            post: InternalApi["v1/tickets/:id/comments/:id"]["get"]
        }

        "v1/categories/:id": {
            get: Base<{
                id: number
                name: string
                color: `#${string}`
                created_at: string
                updated_at: string
                deleted_at: string
            }>

            put: InternalApi["v1/categories/:id"]["get"]
            delete: Message
        }

        "v1/categories": {
            get: BaseMultiple<InternalApi["v1/categories/:id"]["get"]["data"]>
            post: InternalApi["v1/categories/:id"]["get"]
        }

        "v1/statuses/:id": {
            get: Base<{
                id: number
                name: string
                color: `#${string}`
                sort_order: number
                display_in_kanban: boolean
                assign_to: string | null
                created_at: string
                updated_at: string
                deleted_at: string
            }>

            put: InternalApi["v1/statuses/:id"]["get"]
            delete: Message
        }

        "v1/statuses": {
            get: BaseMultiple<InternalApi["v1/statuses/:id"]["get"]["data"]>
            post: InternalApi["v1/statuses/:id"]["get"]
        }

        "v1/priorities/:id": {
            get: Base<{
                id: number
                name: string
                color: `#${string}`
                created_at: string
                updated_at: string
                deleted_at: string
            }>

            put: InternalApi["v1/priorities/:id"]["get"]
            delete: Message
        }

        "v1/priorities": {
            get: BaseMultiple<InternalApi["v1/priorities/:id"]["get"]["data"]>
            post: InternalApi["v1/priorities/:id"]["get"]
        }

        "v1/chats/:id": {
            get: Base<{
                id: number
                name: string
                direct_message: boolean
                last_message: InternalApi["v1/chats/:id/messages/:id"]["get"]["data"] | null
                participants: Array<InternalApi["v1/chats/:id/messages/:id"]["get"]["data"]["sender"]>
                unread_messages: number
                created_at: string
                updated_at: string
            }>

            put: InternalApi["v1/chats/:id"]["get"]
            delete: Message
        }

        "v1/chats": {
            get: BaseMultiple<InternalApi["v1/chats/:id"]["get"]["data"]> & {
                unread_messages: number
            }

            post: InternalApi["v1/chats/:id"]["get"]
        }

        "v1/chats/:id/messages/:id": {
            get: Base<{
                id: number
                content: string
                reply_to: Omit<InternalApi["v1/chats/:id/messages/:id"]["get"]["data"], "reply_to">
                sender: Pick<InternalApi["v1/users/:id"]["get"]["data"], "id" | "name" | "avatar_url" | "role">
                type: InternalApi["v1/messages/:id"]["get"]["data"]["type"]
                media: InternalApi["v1/uploads"]["post"]["data"] | null
                created_at: string
                updated_at: string
            }>
        }

        "v1/chats/:id/messages": {
            get: BaseMultiple<InternalApi["v1/chats/:id/messages/:id"]["get"]["data"]>
            post: InternalApi["v1/chats/:id/messages/:id"]["get"]
        }

        "v1/chats/:id/participations/:id": {
            get: Base<InternalApi["v1/chats/:id"]["get"]["data"]["participants"][0]>
            put: Message
            delete: Message
        }

        "v1/chats/:id/participations": {
            get: BaseMultiple<InternalApi["v1/chats/:id/participations/:id"]["get"]["data"]>
            post: Message
        }

        "v1/notifications": {
            get: BaseMultiple<{
                id: string
                created_at: string
                read: boolean
                title: string
                body: string
                chat_id?: number
                ticket_id?: number
            }> & {
                number_of_reads: number
                number_of_unreads: number
            }
        }

        "v1/notifications/mark-as-unread": {
            post: Message
        }

        "v1/notifications/mark-as-read": {
            post: Message
        }

        "third-party/whatsapp/session/:id/login": {
            post: Base<{
                qrcode: string | null
                status: "disconnected" | "connected" | "connecting" | "reconnecting"
                attempts: number
                session: string | null
            }>
        }

        "third-party/whatsapp/session/:id/logout": {
            post: InternalApi["third-party/whatsapp/session/:id/login"]["post"]
        }

        "third-party/leadsim/infos": {
            get: Base<{
                funnels: Array<{
                    id: number
                    companie_user_id: number
                    title: string
                    created_at: string
                    funnel_step: Array<{
                        id: number
                        title: string
                    }>
                }>
                salesChannel: Array<{
                    id: number
                    companie_user_id: number
                    title: string
                }>
                segments: Array<{
                    id: number
                    companie_user_id: number
                    title: string
                }>
                activitiesType: Array<{
                    id: number
                    companie_user_id: number
                    title: string
                }>
                products: Array<{
                    id: number
                    title: string
                    value: string
                    is_active: boolean
                    is_product: boolean
                    created_at: string
                }>
                defaults: {
                    auto_save_lead: boolean
                    funnel_step_id: number
                    segment_id: number
                    sales_channel_id: number
                    product_id: number
                    activitie_id: number
                }
                provider_id: number
                step_funnels: Array<{
                    id: number
                    title: string
                }>
            }>

            post: Message
        }

        "v1/companies/:id/settings/tags/types": {
            get: Base<Record<string, string>>
        }

        "admin/companies/:id/users": {
            get: InternalApi["v1/users"]["get"]
        }

        "admin/companies/:company/apps/:id": {
            get: Base<{
                id: number
                name: string
                description: string
                app_id: number
                redirect: string
                created_at: string
                updated_at: string
            }>

            put: InternalApi["admin/companies/:company/apps/:id"]["get"]

            delete: Message
        }

        "admin/companies/:company/apps": {
            get: BaseMultiple<InternalApi["admin/companies/:company/apps/:id"]["get"]["data"]>

            post: InternalApi["admin/companies/:company/apps/:id"]["get"] & {
                app_secret: string
            }
        }

        "admin/companies/:company/webhooks/:id": {
            get: Base<{
                id: number
                name: string
                url: string
                secret: string | null
                fields_mapping: string | null
                created_at: string
                updated_at: string
            }>

            put: InternalApi["admin/companies/:company/webhooks/:id"]["get"]

            delete: Message
        }

        "admin/companies/:company/webhooks": {
            get: BaseMultiple<InternalApi["admin/companies/:company/webhooks/:id"]["get"]["data"]>

            post: InternalApi["admin/companies/:company/webhooks/:id"]["get"]
        }

        "v1/companies/:company/settings/webhooks/variables": {
            get: Base<string[]>
        }

        "webchat/:to": {
            get: Base<{
                id: number
                status: InternalApi["v1/conversations/:id"]["get"]["data"]["status"]
                origin: string
                started_at: string
                closed_at: string
                updated_at: string
                last_interaction: string
                attendant_type: "bot" | "user"
                attendant: InternalApi["v1/users/:id"]["get"]["data"] | null
                lastMessage: InternalApi["webchat/:to/messages"]["post"]["data"]
                unreadMessages: number
            }>
        }

        "webchat/:to/init": {
            post: InternalApi["webchat/:to"]["get"]
        }

        "webchat/:to/messages": {
            get: BaseMultiple<{
                id: string
                sender: string
                recipient: string
                service: string
                is_inbound: boolean
                type: InternalApi["v1/messages/:id"]["get"]["data"]["type"]
                content: string
                status: InternalApi["v1/messages/:id"]["get"]["data"]["status"]
                sent_by: string
                media: InternalApi["v1/uploads/:id"]["get"]["data"] | null
                reply_to: Omit<InternalApi["webchat/:to/messages"]["get"]["data"][0], "reply_to">
                created_at: string
                updated_at: string
            }>

            post: Base<InternalApi["webchat/:to/messages"]["get"]["data"][0]>
        }

        "third-party/whatsapp/session/:provider/only-transcript": {
            post: Message
        }

        "v1/users/switch-absence": {
            post: Message
        }

        "connectasign/contract-templates/:id": {
            get: Base<{
                id: number
                name: string
                link: string
                logo_link: string | null
                description: string
                creator: {
                    id: number
                }
            }>

            put: InternalApi["connectasign/contract-templates/:id"]["get"]["data"]
            delete: Message
        }

        "connectasign/contract-templates": {
            get: BaseMultiple<InternalApi["connectasign/contract-templates/:id"]["get"]["data"]>
            post: Message
        }

        "connectasign/contracts": {
            get: BaseMultiple<{
                id: number
                status: "active" | "completed" | "draft"
                original_url: string
                signed_url: string | null
                creator: {
                    id: number
                    name: string
                }
                signers: Array<{
                    id: number
                    name: string
                    type: string
                    status: string
                }>
            }>
        }

        "v1/sellers-ranking": {
            get: BaseMultiple<{
                id: number
                name: string
                avatar_url: string
                score: number
            }>
        }

        "v1/kanban-logs": {
            get: BaseMultiple<{
                contact: {
                    id: number
                    name: string
                    email: string
                    phone: string
                    source_name: string | null
                    avatar_url: string
                    created_at: string
                    user: {
                        id: number
                        name: string
                        email: string
                        avatar_url: string
                        role: InternalApi["v1/roles/:id"]["get"]["data"] | null
                    }
                    stage: {
                        id: number
                    }
                }
                user: {
                    id: number
                    name: string
                    email: string
                    avatar_url: string
                    role: InternalApi["v1/roles/:id"]["get"]["data"] | null
                }
                stage: {
                    id: number
                    name: string
                }
                waiting_time: number
                status: string
                created_at: string
            }>
        }

        "v1/dashboard-data": {
            get: Base<{
                leads_by_origin: Array<{
                    source_name: string | null
                    qty: number
                }>
                conversion_by_origin: Array<{
                    source_name: string | null
                    qty: number
                }>
                leads_by_stage: Array<{
                    name: string
                    position: number
                    qty: number
                }>
                time_by_stage: Array<{
                    waiting_time: string
                    position: number
                    name: string
                }>
                time_to_conversion: Array<{
                    month: string
                    conversion_time: string
                }>
            }>
        }

        // V2
        "v2/contacts/:contact/conversations": {
            get: InternalApi["v1/conversations"]["get"]
        }

        "v2/kyc/transactions/:transaction": {
            get: Base<{
                id: string
                name: string
                birthdate: string
                status: "approved" | "reproved" | "processing" | "pending" | "waiting_documents"
                origin: string
                type: string
                cpf: string | null
                fraud: boolean
                reason: string | null
                is_financial_responsible: boolean
                created_at: string
                last_attempt: string
                started_at: string
                attempts: number
                contact_id: number | null
                service: string | null
                recipient: string | null
                country_code: string | null
                original_contract_link: string | null
                signed_contract_link: string | null
                images: {
                    front: string
                    back: string
                    selfie: string
                }
                metadata: {
                    [key: string]: string
                    fullName: string
                    dateOfBirth: string
                    placeOfBirth: string
                    dateOfIssue: string
                    idNumber: string
                    idNumber2: string
                }
                rules: {
                    [key: string]: boolean
                    has_document: boolean
                    cpf_query: boolean
                    over_18: boolean
                    valid_cpf_number: boolean
                    valid_rg_number: boolean
                    parameters_and_document_are_equals: boolean
                    facematch_is_equal: boolean
                    accepted_terms: boolean
                }
                user: InternalApi["v1/users/:id"]["get"]["data"]
                extra_attributes: {
                    [key: string]: unknown
                    forma_de_pagamento?: string
                    metodo?: string
                    kyc_origin?: string
                }
                parent: Omit<InternalApi["v2/kyc/transactions/:transaction"]["get"]["data"], "parent">
            }>
        }

        "v2/kyc/transactions": {
            get: BaseMultiple<InternalApi["v2/kyc/transactions/:transaction"]["get"]["data"]>
        }

        "v2/kyc/transactions/:transaction/new-attempt": {
            post: Message
        }

        "v2/batch/conversations": {
            post: Message
        }

        "v2/automations/:id": {
            get: Base<{
                id: number
                automationable: {
                    id: number
                    type: "stage"
                }
                trigger_event: InternalApi["v2/settings/automations/:type"]["get"]["data"][string]
                dispatch_action: InternalApi["v2/settings/automations/:type"]["get"]["data"][string]
                dispatch_condition: InternalApi["v2/settings/automations/:type"]["get"]["data"][string] | null
                dispatch_delay: number | null
                payload: {
                    action: Record<string, unknown>
                    condition: Record<string, unknown>
                } | null
            }>

            put: InternalApi["v2/automations/:id"]["get"]
            delete: Message
        }

        "v2/automations": {
            get: BaseMultiple<InternalApi["v2/automations/:id"]["get"]["data"]>
            post: InternalApi["v2/automations/:id"]["get"]
        }

        "v2/settings/automations/:type": {
            get: Base<Record<string, {
                name: string
                title: string
                expected?: DynamicFields
            }>>
        }

        "v2/dashboards/widgets/queries": {
            get: BaseMultiple<{
                id: number
                name: string
                description: string
                supportedTypes: (keyof typeof enums.dashboard)[]
            }>
        }

        "v2/dashboards/:dashboard": {
            get: Base<{
                id: number
                name: string
                widgets: InternalApi["v2/dashboards/:dashboard/widgets"]["get"]["data"]
            }>

            put: InternalApi["v2/dashboards/chart/:chart"]["get"]
            delete: Message
        }

        "v2/dashboards": {
            get: BaseMultiple<InternalApi["v2/dashboards"]["get"]["data"]>

            post: InternalApi["v2/dashboards"]["get"]
        }

        "v2/dashboards/:dashboard/widgets/:widget": {
            get: Base<{
                id: number
                query: InternalApi["v2/dashboards/widgets/queries"]["get"]["data"][number]
                metadata: {
                    x: number
                    y: number
                    w: number
                    h: number
                    i: string
                } | null
            } & ({
                type: keyof Omit<typeof enums.dashboard, "counter" | "table">
                payload: {
                    labels: Array<string>
                    datasets: Array<{
                        data: Array<number>
                        label: string
                    }> | null
                } | null
            } | {
                type: "table"
                payload: {
                    columns: Array<string> | null
                    rows: Array<Array<unknown>> | null
                }
            } | {
                type: "counter"
                payload: number
            })>

            put: InternalApi["v2/dashboards/:dashboard/widgets"]["get"]
            delete: Message
        }

        "v2/dashboards/:dashboard/widgets": {
            get: BaseMultiple<InternalApi["v2/dashboards/:dashboard/widgets/:widget"]["get"]["data"]>

            post: InternalApi["v2/dashboards/:dashboard/widgets/:widget"]["get"]
        }
    }
}