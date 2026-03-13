export default function (condition: boolean): void {
    const _class = "overflow-hidden";

    if (condition) {
        document.body.classList.add(_class);
    }
    else {
        document.body.classList.remove(_class);
    }
}