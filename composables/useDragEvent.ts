export default function () {
    const dragEvent = ref(false);

    useEventListener("dragenter", () => {
        dragEvent.value = true;
    });

    useEventListener(["dragend", "drop"], () => {
        dragEvent.value = false;
    });

    return dragEvent;
}