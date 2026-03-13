// TODO registar ícones globalmente ('provider:...' ou so como está aqui)

export const providers = {
    message: {
        name: "Mensageria",
        icons: {
            whatsapp: "logos:whatsapp-icon",
            messenger: "logos:messenger",
            telegram: "logos:telegram",
            viber: "basil:viber-solid",
            x: "hugeicons:new-twitter",
            sms: "fa6-solid:comment-sms",
            instagram: "skill-icons:instagram",
            webchat: "ri:chat-smile-2-line"
        }
    },
    ai: {
        name: "Inteligência artificial",
        icons: {
            openai: "simple-icons:openai"
        }
    },
    other: {
        name: "Outros",
        icons: {
            dazsoft: "dazsoft",
            leadsim: "leadsim",
            gt7: "gt7",
            hubspot: "hubspot",
            feegow: "feegow",
            smtp: "mdi:email-sync-outline",
            kyc: "kyc",
            sign: "contract",
            crm: "crm"
        }
    }
} satisfies Record<string, {
    name: string
    icons: Record<string, string>
}>;

export type Types = keyof typeof providers;
export type Providers =
  | keyof typeof providers.message.icons
  | keyof typeof providers.ai.icons
  | keyof typeof providers.other.icons;

export function useProviderName (type: Types) {
    return providers?.[type]?.name;
}

export function useProviderIcon (type: Types = "message", key: string = "") {
    const split = key?.split("-").at(0) ?? "";
    return (providers?.[type]?.icons as Record<string, string>)?.[split] ?? "mdi:message-question";
};