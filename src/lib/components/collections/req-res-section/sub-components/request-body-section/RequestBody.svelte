<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { bodyText, requestType } from "$lib/store/api-request";
  import { isHorizontalVertical } from "$lib/store/request-response-section";
  import type { RequestBody } from "$lib/utils/dto/requestbody";
  import { JSONEditor } from "svelte-jsoneditor";

  let handleDropdown = (tab: string) => {
    requestType.set(tab);
  };

  let content: any = {
    text: "",
    json: undefined,
  };

  let isHorizontalVerticalMode: boolean;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  const handleChange = (updatedContent: RequestBody) => {
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

  .my-json-editor {
    --jse-theme-color-highlight: black;
  }
</style>
