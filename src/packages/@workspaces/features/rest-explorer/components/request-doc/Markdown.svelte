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
  export let requestDoc;
  export let onUpdateRequestDescription;
  export let response;
  export let id;
  export let isReadOnly;

  let parsedValue;
  let editor;

  const parser = new edjsParser();
  onMount(() => {
    if (requestDoc) {
      parsedValue = JSON.parse(requestDoc);
    } else {
      parsedValue = [];
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
          // inlineToolbar: ["bold", "italic", "underline", "inlineCode", "list"],
          inlineToolbar: true,
        },
      },
      readOnly: isReadOnly,
      placeholder: "Add Documentation",
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
        onUpdateRequestDescription(data);
        let parsedValue = JSON.parse(data);
      });
    }
  };
  $: {
    if (response) {
      if (editor.blocks) {
        editor.blocks.clear();
      }
      editor.blocks.render(response);
    }
  }
</script>

<div style="margin-bottom:10px;" on:input={saveContent} id="editorjs"></div>
