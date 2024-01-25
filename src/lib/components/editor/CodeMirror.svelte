<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { RequestDataType } from "$lib/utils/enums/request.enum";
  import { isHorizontal } from "$lib/store/request-response-section";
  import { EditorView } from "codemirror";
  import { javascript } from "@codemirror/lang-javascript";
  import { baseTheme, basicSetup, jsonSetup } from "./codeMirrorTheme";
  import { EditorState, Compartment } from "@codemirror/state";
  import { html } from "@codemirror/lang-html";
  import { xml } from "@codemirror/lang-xml";
  export let currentTabId: string;
  export let rawTab: RequestDataType;
  export let rawValue: string;
  export let handleRawChange: (data: string) => void;
  let selectedTabId = currentTabId;
  const languageConf = new Compartment();
  let codeMirrorEditorDiv: HTMLDivElement;
  let codeMirrorView: EditorView;
  const updateExtensionView = EditorView.updateListener.of((update) => {
    const userInput = update.state.doc.toString();
    handleRawChange(userInput);
  });
  function initalizeCodeMirrorEditor(value: string) {
    let state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        baseTheme,
        updateExtensionView,
        languageConf.of([]),
      ],
    });
    codeMirrorView = new EditorView({
      parent: codeMirrorEditorDiv,
      state: state,
    });
  }
  onMount(() => {
    initalizeCodeMirrorEditor(rawValue);
  });
  afterUpdate(() => {
    if (selectedTabId !== currentTabId) {
      codeMirrorView.dispatch({
        changes: {
          from: 0,
          to: codeMirrorView.state.doc.length,
          insert: rawValue,
        },
      });
      selectedTabId = currentTabId;
    }
    if (rawTab === RequestDataType.HTML) {
      codeMirrorView.dispatch({
        effects: languageConf.reconfigure(
          html({
            matchClosingTags: true,
            selfClosingTags: true,
            autoCloseTags: true,
          }),
        ),
      });
    } else if (rawTab === RequestDataType.JAVASCRIPT) {
      codeMirrorView.dispatch({
        effects: languageConf.reconfigure(
          javascript({ jsx: true, typescript: true }),
        ),
      });
    } else if (rawTab === RequestDataType.JSON) {
      codeMirrorView.dispatch({
        effects: languageConf.reconfigure(jsonSetup),
      });
    } else if (rawTab === RequestDataType.XML) {
      codeMirrorView.dispatch({
        effects: languageConf.reconfigure(xml()),
      });
    } else {
      codeMirrorView.dispatch({
        effects: languageConf.reconfigure([]),
      });
    }
  });

  let isHorizontalMode: boolean;
  const isHorizontalUnsubscribe = isHorizontal.subscribe((value) => {
    isHorizontalMode = value;
  });

  onDestroy(() => {
    isHorizontalUnsubscribe();
  });
</script>

<div id="code-editor" bind:this={codeMirrorEditorDiv} />

<style>
  #code-editor {
    width: 99%;
    height: 250px;
  }
</style>
