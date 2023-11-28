<script lang="ts">
  import downloadIcon from "$lib/assets/download.svg";
  import copyIcon from "$lib/assets/copy.svg";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import copyToClipBoard from "$lib/utils/copyToClipboard";
  import { notifications } from "$lib/utils/notifications";
  import { RequestDataType } from "$lib/utils/enums/request.enum";
  import MonacoEditorResponse from "$lib/components/monaco-editor/MonacoEditorResponse.svelte";

  export let response;

  let CodeFormatter: string = "prettier";
  let fileExtension: string = "json";
  let selectedTab: string = RequestDataType.JSON;

  /**
   * @description Copy API response to users clipboard.
   */
  const handleCopy = async () => {
    const jsonString = response?.body;
    await copyToClipBoard(jsonString);
    notifications.success("Copied to Clipboard");
  }
  
  const handlePrettierDropdown: (tab: string) => void = (tab) => {
    if (tab === "Prettier") {
      CodeFormatter = "prettier";
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
    await writableStream.write(response?.body);
    await writableStream.close();
    notifications.success("Response downloaded");
  };
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between mt-2 w-100"
>
  <div class="d-flex align-items-center justify-content-between mb-2 w-100">
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
          dropdownId={"hash565"}
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
            {
              name: "Javascript",
              id: RequestDataType.JAVASCRIPT,
            },
            {
              name: "Text",
              id: RequestDataType.TEXT,
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
    class="w-100"
    style="background-color:black;"
  >
    <MonacoEditorResponse
      bind:value={response.body}
      rawTab = {selectedTab}
      rawValue = {response.body}
    />
  </div>
</div>
