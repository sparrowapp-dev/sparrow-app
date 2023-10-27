<script>
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

  // console.log(bodyText);
  // let jsonContent = {
  //   json: {
  //     name: "kashif",
  //     email: "kashif@gmail.com",
  //   },
  // };

  let jsonContent = {
    json: {},
  };

  bodyText.set(jsonContent.json);

  console.log(jsonContent.json);

  let isCollaps;
  collapsibleState.subscribe((value) => {
    isCollaps = value;
  });

  let isHorizontalVerticalMode;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));
</script>

<div
  class="ps-0 {isHorizontalVerticalMode ? 'pt-3' : 'pt-1'} pe-0 rounded w-100"
>
  <Dropdown data={["Pretty"]} onclick={handleDropdown} /><span class="px-2" />
  <Dropdown data={["JSON", "XML", "RAW"]} onclick={handleDropdown} />
  <br />
  {#if isHorizontalVerticalMode}
    <div
      class="my-json-editor --jse-contents-background-color bg-blackColor me-0 editor jse-theme-dark my-json-editor mt-1"
      style="height:{isCollaps ? '492px' : '492px'};"
    >
      <JSONEditor
        bind:content={jsonContent.json}
        mainMenuBar={false}
        navigationBar={false}
        mode="text"
      />
    </div>
  {:else}
    <div
      class="my-json-editor --jse-contents-background-color bg-blackColor me-0 editor jse-theme-dark my-json-editor mt-1"
      style="height:{isCollaps ? '200px' : '200px'};"
    >
      <JSONEditor
        bind:content={jsonContent.json}
        mainMenuBar={false}
        navigationBar={false}
        mode="text"
      />
    </div>
  {/if}
</div>

<style>
  @import "svelte-jsoneditor/themes/jse-theme-dark.css";
  .editor {
    height: 492px;
  }

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
