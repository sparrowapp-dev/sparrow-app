<script>
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { bodyEmail, bodyName, requestType } from "$lib/store/api-request";
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
</script>

<div class="ps-0 pt-3 pe-0 rounded w-100">
  <Dropdown data={["Pretty"]} onclick={handleDropdown} /><span class="px-2" />
  <Dropdown data={["JSON", "XML", "RAW"]} onclick={handleDropdown} />
  <br />
  <div class="my-json-editor me-0 editor jse-theme-dark my-json-editor mt-1">
    <JSONEditor bind:content={jsonContent} on:change={updateJSONContent} />
  </div>
</div>

<style>
  @import "svelte-jsoneditor/themes/jse-theme-dark.css";
  .editor {
    height: 55vh;
  }

  .my-json-editor {
    /* define a custom theme color */
    --jse-theme-color: var(--blackColor);
    --jse-theme-color-highlight: var(--blackColor);
  }
</style>
