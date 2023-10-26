<script>
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { bodyEmail, bodyName, requestType } from "$lib/store/api-request";
  import {
    collapsibleState,
    isHorizontalVertical,
  } from "$lib/store/request-response-section";
  import { JSONEditor } from "svelte-jsoneditor";

  //this store for updating dropdown value for JSON , XML
  let handleDropdown = (tab) => {
    requestType.set(tab);
  };

  // let handleContentChange = () => {
  //   bodyText.set(content);
  // };
  // console.log(bodyText);
  let jsonContent = {
    json: {
      name: "Testing",
      email: "testing@testing.com",
    },
  };

  function updateJSONContent(newContent) {
    jsonContent = newContent;
  }
  console.log(jsonContent.json);
  bodyEmail.set(jsonContent.json.email);
  bodyName.set(jsonContent.json.name);

  let isCollaps;
  collapsibleState.subscribe((value) => {
    isCollaps = value;
  });

  let isHorizontalVerticalMode;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));
</script>

<div class="ps-0 {isHorizontalVerticalMode ? "pt-3" : "pt-1"} pe-0 rounded w-100">
  <Dropdown data={["Pretty"]} onclick={handleDropdown} /><span class="px-2" />
  <Dropdown data={["JSON", "XML", "RAW"]} onclick={handleDropdown} />
  <br />
  {#if isHorizontalVerticalMode}
    <div
      class="my-json-editor me-0 editor jse-theme-dark my-json-editor mt-1"
      style="height:{isCollaps ? '492px' : '492px'};"
    >
      <JSONEditor bind:content={jsonContent} on:change={updateJSONContent} />
    </div>
  {:else}
    <div
      class="my-json-editor me-0 editor jse-theme-dark my-json-editor"
      style="height:{isCollaps ? '200px' : '200px'};"
    >
      <JSONEditor bind:content={jsonContent} on:change={updateJSONContent} />
    </div>
  {/if}
</div>

<style>
  @import "svelte-jsoneditor/themes/jse-theme-dark.css";
  .editor {
    height: 492px;
  }

  .my-json-editor {
    /* define a custom theme color */
    --jse-theme-color: var(--blackColor);
    --jse-theme-color-highlight: var(--blackColor);
  }
</style>
