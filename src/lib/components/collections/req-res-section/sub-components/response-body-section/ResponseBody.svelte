<script lang="ts">
  import { JSONEditor } from "svelte-jsoneditor";
  import angleDown from "$lib/assets/angle-down.svg";
  import downloadIcon from "$lib/assets/download.svg";
  import copyIcon from "$lib/assets/copy.svg";
  // let content = {
  //   text: undefined,
  //   json: {
  //     array: [1, 2, 3],
  //     boolean: true,
  //     color: "#82b92c",
  //     null: null,
  //     number: 123,
  //     object: { a: "b", c: "d" },
  //     string: "Hello World",
  //   },
  // };

  // $: console.log("contents changed:", content);

  let editorRef;

  function refresh() {
    editorRef?.refresh();
  }
</script>

<div
  class="d-flex flex-column w-100 align-items-start justify-content-between mt-3"
>
  <div class="d-flex align-items-center justify-content-between mb-1 w-100">
    <div class="d-flex gap-4 align-items-center justify-content-center">
      <button
        class="d-flex align-items-center justify-content-center bg-backgroundColor border-0 gap-2"
      >
        <p
          style="font-size: 12px;font-weight:400;Line-height:18px"
          class="mb-0 text-whiteColor"
        >
          Pretty
        </p>
        <img src={angleDown} alt="" class="w-100 h-100" />
      </button>

      <button
        class="d-flex align-items-center justify-content-center gap-2 bg-backgroundColor border-0"
      >
        <p
          style="font-size: 12px;font-weight:400;"
          class="mb-0 text-whiteColor"
        >
          JSON
        </p>
        <img src={angleDown} alt="" class="w-100 h-100" />
      </button>
    </div>
    <div class="d-flex align-items-center gap-4">
      <button class=" bg-backgroundColor border-0">
        <img src={downloadIcon} alt="" />
      </button>

      <button class=" bg-backgroundColor border-0">
        <img src={copyIcon} alt="" />
      </button>
    </div>
  </div>
  <div class="my-json-editor editor jse-theme-dark my-json-editor">
    <JSONEditor bind:this={editorRef} readOnly />
  </div>
</div>

<style>
  @import "svelte-jsoneditor/themes/jse-theme-dark.css";
  .editor {
    width: 100%;
    height: 70vh;
    background: #000000;
  }

  .my-json-editor {
    background: var(--blackColor);
    background: #000000;
    /* define a custom theme color */
    --jse-theme-color: var(--blackColor);
    --jse-theme-color-highlight: var(--blackColor);
  }
</style>
