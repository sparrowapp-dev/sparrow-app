<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { bodyText, requestType } from "$lib/store/api-request";
  import {
    collapsibleState,
    isHorizontalVertical,
  } from "$lib/store/request-response-section";
  import { JSONEditor } from "svelte-jsoneditor";

  //this store for updating dropdown value for JSON , XML
  let handleDropdown = (tab) => {
    requestType.set(tab);
  };

  let content = {
    text: "", // can be used to pass a stringified JSON document instead
    json: undefined,
  };

  let isCollaps: any;
  collapsibleState.subscribe((value) => {
    isCollaps = value;
  });

  let isHorizontalVerticalMode: any;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  const handleChange = (updatedContent: any) => {
    bodyText.set(updatedContent.text);
    content = updatedContent;
  };
</script>

<div
  class="ps-0 {isHorizontalVerticalMode ? 'pt-3' : 'pt-2'} pe-0 rounded w-100"
>
  <div class="mb-2">
    <Dropdown data={["Pretty"]} onclick={handleDropdown} />
    <span class="pe-3" />
    <Dropdown data={["JSON", "XML", "RAW"]} onclick={handleDropdown} />
  </div>
  <div
    style="height:{isHorizontalVerticalMode ? '200px' : '400px'}"
    class="my-json-editor --jse-contents-background-color me-0 editor jse-theme-dark my-json-editor mt-0"
  >
    <JSONEditor
      {content}
      onChange={handleChange}
      mainMenuBar={false}
      navigationBar={false}
      mode="text"
    />
  </div>
</div>

<style>
  @import "svelte-jsoneditor/themes/jse-theme-dark.css";

  .--jse-contents-background-color {
    --jse-background-color: black;
  }

  /* define a custom theme color */
  .my-json-editor {
    /* define a custom theme color */
    --jse-theme-color: #ef1717;
    --jse-theme-color-highlight: #687177;
  }
</style>
