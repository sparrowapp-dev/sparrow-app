<script lang="ts">
  import { JSONEditor, Mode } from "svelte-jsoneditor";
  import downloadIcon from "$lib/assets/download.svg";
  import copyIcon from "$lib/assets/copy.svg";
  import { responseText } from "$lib/store/api-request";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";

  import copyToClipBoard from "$lib/utils/copyToClipboard";

  import { notifications } from "$lib/utils/notifications";

  let jsonText: any;
  let content: any;

  let downloadedData: string = "";
  responseText.subscribe((value) => {
    jsonText = value;

    content = {
      text: undefined,
      json: jsonText.response,
    };
    const data: string = JSON.stringify(content.json);
    downloadedData = "data:text/json;charset=utf-8," + encodeURIComponent(data);
  });

  async function handleCopy() {
    if (jsonText && jsonText.response) {
      const jsonString = JSON.stringify(jsonText.response, null, 2);
      await copyToClipBoard(jsonString);
    }
    notifications.success("Copy To Clipboard");
  }

  let fileStyle: string = "prettier";
  const handlePrettierDropdown: (tab: string) => void = (tab) => {
    if (tab === "Prettier") {
      fileStyle = "prettier";
    }
  };

  let fileExtension: string = "json";
  const handleTypeDropdown: (tab: string) => void = (tab) => {
    if (tab === "JSON") {
      fileExtension = "json";
    } else if (tab === "XML") {
      fileExtension = "xml";
    } else if (tab === "RAW") {
      fileExtension = "text";
    }
  };

  const handleDownloaded = () => {
    notifications.success("Response downloaded");
  };
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between mt-2 w-100"
>
  <div class="d-flex align-items-center justify-content-between mb-1 w-100">
    <div class="d-flex gap-4 align-items-center justify-content-center">
      <button
        class="d-flex align-items-center justify-content-center bg-backgroundColor border-0 gap-2"
      >
        <Dropdown data={["Pretty"]} onclick={handlePrettierDropdown} />
      </button>

      <button
        class="d-flex align-items-center justify-content-center gap-2 bg-backgroundColor border-0"
      >
        <Dropdown data={["JSON", "XML", "RAW"]} onclick={handleTypeDropdown} />
      </button>
    </div>
    <div class="d-flex align-items-center gap-4">
      <a
        on:click={handleDownloaded}
        class=" bg-backgroundColor border-0"
        href={downloadedData}
        download={`response.${fileExtension}`}
      >
        <img src={downloadIcon} alt="" />
      </a>

      <button class=" bg-backgroundColor border-0" on:click={handleCopy}>
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
      mode={Mode.text}
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
    --jse-theme-color: var(--blackColor);
    --jse-theme-color-highlight: var(--blackColor);
  }
</style>
