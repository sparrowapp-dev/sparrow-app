<script lang="ts">
  import { JSONEditor, Mode } from "svelte-jsoneditor";
  import downloadIcon from "$lib/assets/download.svg";
  import copyIcon from "$lib/assets/copy.svg";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import copyToClipBoard from "$lib/utils/copyToClipboard";
  import { notifications } from "$lib/utils/notifications";
  import {
    isHorizontalVertical,
  } from "$lib/store/request-response-section";
  import { RequestDataType } from "$lib/utils/enums/request.enum";
  
  export let responseBody;
  export let response;
  
  let content = {
    text: "",
    json: undefined,
  };
  let fileStyle: string = "prettier";
  let isHorizontalVerticalMode: any;
  let fileExtension: string = "json";
  let selectedTab: string = RequestDataType.JSON;
  
  $: {
    if (responseBody) {
      content = {
        text: responseBody,
        json: undefined,
      };
    }
  }

  /**
   * @description Copy API response to users clipboard.
   */
  const handleCopy = async () => {
    const jsonString = content.text;
    await copyToClipBoard(jsonString);
    notifications.success("Copied to Clipboard");
  }
  
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));
  
  const handlePrettierDropdown: (tab: string) => void = (tab) => {
    if (tab === "Prettier") {
      fileStyle = "prettier";
    }
  };


  const handleTypeDropdown: (tab: string) => void = (tab) => {
    selectedTab = tab;
    if (selectedTab === RequestDataType.JSON) {
      fileExtension = "json";
    } else if (selectedTab === RequestDataType.XML) {
      fileExtension = "xml";
    } else if (selectedTab === RequestDataType.HTML) {
      fileExtension = "html";
    }
  };

  /**
   * @description Configures and populates the save-as popup on the user's screen.
   */
  const handleDownloaded = async () => {
    const newHandle = await window.showSaveFilePicker({
      suggestedName: `api_response_${
        response?.status ? response?.status : ""
      }_${response?.time ? response?.time : "0"}ms_${
        response?.size ? response?.size : "0"
      }kb.${fileExtension}`,
      accept: {
        extensions: ["txt", "json", "xml", "js", "html"],
      },
    });
    const writableStream = await newHandle.createWritable();
    // write our file
    await writableStream.write(content.text);
    await writableStream.close();
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
        <Dropdown
          title="pretty"
          data={[
            {
              name: "Pretty",
              id: "pretty",
            },
          ]}
          onclick={handlePrettierDropdown}
        />
      </button>

      <button
        class="d-flex align-items-center justify-content-center gap-2 bg-backgroundColor border-0"
      >
        <Dropdown
          title={selectedTab}
          data={[
            {
              name: "JSON",
              id: RequestDataType.JSON,
            },
            {
              name: "XML",
              id: RequestDataType.XML,
            },
            {
              name: "HTML",
              id: RequestDataType.HTML,
            },
          ]}
          onclick={handleTypeDropdown}
        />
      </button>
    </div>
    <div class="d-flex align-items-center gap-4">
      <button on:click={handleDownloaded} class=" bg-backgroundColor border-0">
        <img src={downloadIcon} alt="" />
      </button>

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
