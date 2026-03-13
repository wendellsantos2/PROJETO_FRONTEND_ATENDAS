const types = {
    chat: "Chat",
    campaign: "Campanha",
    nps: "NPS"
};

export default function <K extends keyof typeof types | undefined = undefined> (type?: K) {
    return type ? types[type] : types as K extends undefined ? typeof types : string;
}