export default function (url: string = "") {
    const extension = url.split(".").at(-1)?.split("?").at(0)?.toLowerCase();

    switch (extension) {
        case "":
            return undefined;

        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "webp":
        case "svg":
            return "image";

        case "mp3":
        case "wav":
        case "flac":
            return "audio";

        case "mp4":
        case "avi":
        case "mov":
            return "video";

        default:
            return "file";
    }
}