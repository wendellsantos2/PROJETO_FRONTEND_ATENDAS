export default function (text: string) {
    return text.replace(/<[^>]*>/g, "");
};