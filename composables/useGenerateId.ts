export default function (prefix: string = "") {
    const random = (Math.random() + 1).toString(36).substring(2, 12);
    return (prefix ? `${prefix}-` : prefix) + `${random}-${new Date().toISOString().replaceAll("-", ":")}`;
}