<script>
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { JSONEditor } from "svelte-jsoneditor";

  let content = {
    text: `
      {
        "nameS": "Testing",
        "email": "testing@testing.com"
      }`,
    json: {
      name: "Testing",
      email: "testing45@testing.com",
    },
  };

  $: console.log("contents changed:", content);

  let handleDropdown = (tab) => {
    console.log(tab);
  };
</script>

<div class=" ps-2 pt-3 pe-0 rounded w-100">
  <Dropdown data={["Pretty"]} onclick={handleDropdown} /><span class="px-2" />
  <Dropdown data={["JSON", "XML", "RAW"]} onclick={handleDropdown} />
  <br />
  <br />
  <div class="my-json-editor editor jse-theme-dark my-json-editor">
    <JSONEditor bind:content />
  </div>
</div>

<style>
  @import "svelte-jsoneditor/themes/jse-theme-dark.css";
  .editor {
    width: 100%;
    height: 60vh;
    padding: 0px;
    /* background: #000000; */
  }

  .my-json-editor {
    /* define a custom theme color */
    --jse-theme-color: var();
    --jse-theme-color-highlight: #687177;
  }
</style>
