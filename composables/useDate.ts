export default function (stringAt?: string | null) {
    if (!stringAt) {
        return stringAt;
    }

    const date = new Date(stringAt);
    const now = new Date();

    const isSameYear = now.getFullYear() === date.getFullYear();
    const isSameMonth = isSameYear && now.getMonth() === date.getMonth();
    const isSameDay = isSameMonth && now.getDate() === date.getDate();

    const year = isSameYear ? "" : `/${date.getFullYear()}`;
    const month = isSameMonth ? "" : `/${String(date.getMonth() + 1).padStart(2, "0")}`;
    const day = isSameDay ? "" : `${String(date.getDate()).padStart(2, "0")}`;
    const dayMonth = isSameDay ? "" : `${day}${month}${year} · `;

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${dayMonth}${hours}:${minutes}`;
};