<script>
  import EditorJS from "@editorjs/editorjs";
  import Header from "@editorjs/header";
  import List from "@editorjs/list";
  import InlineCode from "@editorjs/inline-code";
  import CodeTool from "@editorjs/code";
  import Underline from "@editorjs/underline";
  import Paragraph from "@editorjs/paragraph";
  import edjsParser from "editorjs-parser";
  import { onMount } from "svelte";
  export let value = "[]";
  export let onInput;
  export let id;
  export let isReadOnly = false;
  export let placeholder;

  let parsedValue;
  let editor;

  const parser = new edjsParser();
  onMount(() => {
    if (value) {
      parsedValue = JSON.parse(value);
    }
    editor = new EditorJS({
      inlineToolbar: ["bold", "italic", "underline"],
      inlineToolbar: true,
      holder: id,
      tools: {
        list: {
          class: List,
          inlineToolbar: true,
        },
        header: {
          class: Header,
          inlineToolbar: ["bold", "italic", "underline", "inlineCode"],
          inlineToolbar: true,
          config: {
            levels: [2, 3, 4],
            defaultLevel: 3,
          },
        },
        code: {
          class: CodeTool,
          inlineToolbar: true,
        },
        inlineCode: InlineCode,
        underline: Underline,
        paragraph: {
          class: Paragraph,
          inlineToolbar: ["bold", "italic", "underline", "inlineCode", "list"],
          inlineToolbar: true,
        },
      },
      readOnly: isReadOnly,
      placeholder: placeholder,
      data: {
        blocks: parsedValue,
      },
      onChange: () => {
        saveContent();
      },
    });
  });

  const saveContent = () => {
    if (editor) {
      editor.save().then((changedData) => {
        const data = JSON.stringify(changedData.blocks);
        onInput(data);
      });
    }
  };
  $: {
    if (value && isReadOnly) {
      if (editor?.blocks) {
        editor.blocks.clear();
        editor.render({
          blocks: JSON.parse(value),
        });
      }
    }

    if (
      editor?.readOnly &&
      typeof isReadOnly === "boolean" &&
      editor?.readOnly?.isEnabled !== isReadOnly
    ) {
      editor.readOnly.toggle(isReadOnly);
    }
  }
</script>

<div style="margin-bottom:10px;" on:input={saveContent} id="editorjs"></div>

<style>
  :global(.ce-popover__container) {
    background-color: #262626;
    border: none !important;
    width: 70px !important;
    position: absolute;
    left: 90px;
    right: 90px;
  }
  :global(.ce-popover--nested) {
    position: absolute;
    left: 90px;
    right: 90px;
  }
  :global(.ce-toolbar__actions.ce-toolbar__actions--opened) {
    right: 116%;
  }

  :global(.codex-editor__redactor) {
    border: none;
    overflow-y: auto;
    padding-left: 16px;
    padding-top: 10px;
    min-height: 150px;
    padding-bottom: 30px !important;
    border: 1px solid transparent;
  }

  @media (min-width: 651px) {
    :global(.codex-editor--narrow .codex-editor__redactor) {
      margin-right: 0px;
    }
  }

  :global(.codex-editor__redactor::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.ce-paragraph::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.ce-block__content) {
    background: transparent !important;
    color: white !important;
  }

  :global(.ce-block__content::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.cdx-underline::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.inline-code::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.cdx-block::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.ce-block::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.ce-toolbar__settings-btn) {
    display: none;
    right: 147% !important;
  }

  :global(.ce-toolbar__plus) {
    position: absolute;
    right: 147% !important;
    display: none;
  }

  :global(.ce-block__content) {
    max-width: none !important;
  }

  :global(.cdx-block) {
    padding: 0px;
    width: 100%;
  }

  :global(.code::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.cdx-list__item::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.ce-popover-item--active) {
    background-color: transparent;
  }

  :global(.ce-block i::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.ce-block b::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.ce-header::selection) {
    background-color: var(--bg-primary-300) !important;
    color: white !important;
  }

  :global(.ce-inline-tool--link) {
    display: none;
  }

  :global(.ce-popover) {
    position: absolute;
    left: -91px;
    top: 19px;
    background-color: #262626;
  }

  :global(.inline-code) {
    background-color: #242426 !important;
    color: #d35354;
  }

  :global(.ce-popover__search) {
    background-color: transparent;
  }

  :global(.ce-block--selected) {
    background-color: transparent !important;
    color: transparent !important;
    background: transparent;
  }

  :global(.ce-inline-tool) {
    color: #8e91a4;
    background-color: #262626;
  }

  :global(.ce-inline-tool:hover) {
    color: #8e91a4;
    background-color: #313233;
  }

  :global(.ce-code__textarea.cdx-input) {
    background-color: #242426;
    color: #ffffff;
    border: none;
  }

  :global(.ce-inline-tool--italic:hover) {
    background-color: #313233 !important;
    color: #8e91a4;
  }

  :global(.ce-popover-item-separator) {
    display: none !important;
  }

  :global(.ce-inline-tool--italic) {
    color: #8e91a4;
  }

  :global(.ce-popover-item) {
    color: #8e91a4;
  }

  :global(.ce-popover-item:hover) {
    background-color: #313233 !important;
    color: #8e91a4;
  }
</style>
