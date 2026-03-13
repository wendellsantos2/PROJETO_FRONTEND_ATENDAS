export default function <T extends Record<string, any>> (data: T) {
    const formData = new FormData();

    for (const key in data) {
        formData.append(key, data[key]);
    }

    return formData;
}