<script lang="ts">
  import EditorJS from "@editorjs/editorjs";
  import Header from "@editorjs/header";
  import List from "@editorjs/list";
  import InlineCode from "@editorjs/inline-code";
  import CodeTool from "@editorjs/code";
  import Underline from "@editorjs/underline";
  import Paragraph from "@editorjs/paragraph";
  import edjsParser from "editorjs-parser";
  import { onMount } from "svelte";
  import { MarkdownFormatter } from "@sparrow/common/utils";
  /**
   * add commments like this
   */
  /**
   * JSON string representing the initial value of the Editor.js instance
   */
  export let value = "[]";

  /**
   *function to handle input changes in the editor
   */
  export let onInput = () => {};

  /**
   * ID of the DOM element that will serve as the container for the editor
   */
  export let id = "";

  /**
   * Boolean flag to determine if the editor should be in read-only mode
   */
  export let isReadOnly = false;

  /**
   * Placeholder text to display when the editor is empty
   */
  export let placeholder = "";

  let editor: EditorJS;

  const parser = new edjsParser();
  onMount(async () => {
    let parsedValue = [];
    if (value) {
      try {
        parsedValue = JSON.parse(value) || [];
      } catch (e) {
        const formatter = new MarkdownFormatter();
        const editorData = await formatter.FormatData(value);
        parsedValue = editorData?.blocks || [];
      }
    }
    editor = new EditorJS({
      holder: id,
      tools: {
        list: {
          class: List,
          inlineToolbar: true,
        },
        header: {
          class: Header,
          inlineToolbar: ["bold", "italic", "underline", "inlineCode", "list"],
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

  /**
   * Saves the current content of the editor and triggers the onInput callback
   * with the updated content.
   */
  const saveContent = () => {
    if (editor) {
      editor.save().then((changedData) => {
        const data = JSON.stringify(changedData.blocks);
        onInput(data);
      });
    }
  };

  // Reactive statement to update the editor when certain conditions change - When doc is generating.
  const docRerender = async () => {
    if (editor) {
      if (editor?.blocks) {
        editor.blocks.clear();
      }
      if (editor?.render) {
        let renderObject = [];
        try {
          renderObject = JSON?.parse(value) || [];
        } catch (e) {
          const formatter = new MarkdownFormatter();
          const editorData = await formatter.FormatData(value);
          renderObject = editorData?.blocks || [];
        }
        editor.render({
          blocks: renderObject,
        });
      }
    }
  };
  $: {
    if (value && isReadOnly) {
      docRerender();
    }
  }
</script>

<div on:input={saveContent} id="editorjs"></div>

<style>
  :global(.ce-popover__container) {
    background-color: #262626;
    border: none !important;
    width: 70px !important;
    position: absolute;
    left: 90px !important;
    right: 90px;
  }
  :global(.ce-popover--nested) {
    position: absolute;
    left: 0px !important;
    right: 10px !important;
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
    display: none !important ;
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
