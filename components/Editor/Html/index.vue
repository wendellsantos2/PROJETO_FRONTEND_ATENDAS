<template>
    <div class="relative z-0 flex min-h-52 resize-y flex-col overflow-hidden form-radius-input-lg form-bg-input">
        <nav class="-mb-4 flex w-full flex-row *:w-full *:cursor-pointer *:p-2 *:pb-6 *:transition-all *:duration-300 hover:*:bg-secondary hover:*:text-black activated:*:bg-primary activated:*:text-white">
            <button :class="{ activated: editing }" @click="editing = true">
                <Icon name="editor" />
                Editar
            </button>
            <button :class="{ activated: !editing }" @click="editing = false">
                <Icon name="preview" />
                Preview
            </button>
        </nav>
        <div class="relative z-1 flex grow overflow-hidden border-2 form-radius-input-lg form-bg-input form-border-color-input *:grow">
            <div
                ref="editor"
                class="absolute inset-0"
            />

            <Transition
                enterActiveClass="transition-all duration-500"
                enterFromClass="opacity-0 translate-x-full"

                leaveActiveClass="transition-all duration-500"
                leaveToClass="opacity-0 translate-x-full"
                mode="out-in"
            >
                <iframe
                    v-show="!editing"
                    :srcdoc="`
                        <!doctype html>
                        <html>
                            <body style='padding: 0; margin: 0'>${model}</body>
                        </html>`
                    "
                    class="absolute inset-0 size-full bg-background"
                />
            </Transition>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { tokyoNight } from "@ddietr/codemirror-themes/tokyo-night";
    import { EditorView, keymap, lineNumbers } from "@codemirror/view";
    import { EditorState } from "@codemirror/state";
    import { defaultKeymap, indentWithTab } from "@codemirror/commands";
    import { autocompletion } from "@codemirror/autocomplete";
    import { html } from "@codemirror/lang-html";

    const editor = ref<HTMLDivElement>();
    const editing = ref(true);
    const model = defineModel<string>();

    let view: EditorView;

    onMounted(() => {
        view = new EditorView({
            state: EditorState.create({
                doc: model.value,
                extensions: [
                    keymap.of([...defaultKeymap, indentWithTab]),
                    tokyoNight,
                    lineNumbers(),
                    autocompletion(),
                    html(),
                    EditorState.tabSize.of(4),
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            model.value = update.state.doc.toString();
                        }
                    })
                ]
            }),
            parent: editor.value
        });

        watch(model, (newValue) => {
            const current = view.state.doc.toString();

            if (newValue !== current) {
                view.dispatch({
                    changes: { from: 0, to: view.state.doc.length, insert: newValue }
                });
            }
        }, {
            immediate: true
        });
    });

    onUnmounted(() => {
        view.destroy();
    });
</script>

<style scoped lang="postcss">
    :deep(.cm-editor) {
        @apply size-full;

        *::selection {
            color: currentColor
        }

        .cm-scroller {
            @apply overflow-auto form-py-input-lg;

            &::-webkit-scrollbar-thumb {
                @apply bg-white/50;
                scrollbar-color: theme(colors[white][DEFAULT]) initial;
            }
        }
    }
</style>