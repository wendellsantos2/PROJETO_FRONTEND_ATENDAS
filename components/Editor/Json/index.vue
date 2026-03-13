<template>
    <div
        ref="editor"
    />
</template>

<script setup lang="ts">
    import { tokyoNight } from "@ddietr/codemirror-themes/tokyo-night";
    import { EditorView, keymap, lineNumbers } from "@codemirror/view";
    import { EditorState } from "@codemirror/state";
    import { defaultKeymap, indentWithTab } from "@codemirror/commands";
    import { linter } from "@codemirror/lint";
    import { json, jsonLanguage, jsonParseLinter } from "@codemirror/lang-json";

    const model = defineModel<string>();
    const editor = ref<HTMLDivElement>();
    const empty = "{\n\t\n}";

    const stringify = (value: string) => {
        return value.replace(/(\n||' {2}')/, "");
    };

    let view: EditorView;

    onMounted(() => {
        view = new EditorView({
            state: EditorState.create({
                doc: model.value || empty,
                extensions: [
                    keymap.of([...defaultKeymap, indentWithTab]),
                    tokyoNight,
                    jsonLanguage,
                    lineNumbers(),
                    json(),
                    linter(jsonParseLinter(), {
                        delay: 300
                    }),
                    EditorState.tabSize.of(4),
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            model.value = stringify(update.state.doc.toString());
                        }
                    })
                ]
            }),
            parent: editor.value
        });

        watch(model, (newValue) => {
            const current = stringify(view.state.doc.toString());

            if (newValue !== current) {
                view.dispatch({
                    changes: { from: 0, to: view.state.doc.length, insert: newValue || empty }
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
        @apply size-full min-h-52 overflow-hidden form-radius-input-lg;

        *::selection {
            color: currentColor
        }

        .cm-scroller {
            @apply overflow-auto grow form-py-input-lg;

            &::-webkit-scrollbar-thumb {
                @apply bg-white/50;
                scrollbar-color: theme(colors[white][DEFAULT]) initial;
            }
        }
    }
</style>