<script lang="ts">
  import { JSONEditor } from "svelte-jsoneditor";
  import angleDown from "$lib/assets/angle-down.svg";
  import downloadIcon from "$lib/assets/download.svg";
  import copyIcon from "$lib/assets/copy.svg";
  import { responseText } from "$lib/store/api-request";
  import {
    collapsibleState,
    isHorizontalVertical,
  } from "$lib/store/request-response-section";

  let jsonText: any;
  let content: any;
  responseText.subscribe((value) => {
    jsonText = value;
    content = {
      text: undefined,
      json: jsonText.response,
    };
  });
  // $: console.log("contents changed:", content);

  let isCollaps: any;
  collapsibleState.subscribe((value) => {
    isCollaps = value;
  });

  let isHorizontalVerticalMode: any;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between mt-2 w-100"
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
  <div
    class="my-json-editor --jse-contents-background-color me-0 editor jse-theme-dark my-json-editor mt-1 w-100"
  >
    <JSONEditor
      bind:content
      readOnly
      mainMenuBar={false}
      navigationBar={false}
      mode="text"
      askToFormat={true}
    />
  </div>
</div>

<style>
  @import "svelte-jsoneditor/themes/jse-theme-dark.css";
  .editor {
    height: 400px;
  }

  .--jse-contents-background-color {
    --jse-background-color: black;
  }

  .my-json-editor {
    background: var(--blackColor);
    /* define a custom theme color */
    --jse-theme-color: var(--blackColor);
    --jse-theme-color-highlight: var(--blackColor);
  }
</style>
