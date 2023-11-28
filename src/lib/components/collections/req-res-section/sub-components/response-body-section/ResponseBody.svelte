<script lang="ts">
  import downloadIcon from "$lib/assets/download.svg";
  import copyIcon from "$lib/assets/copy.svg";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import copyToClipBoard from "$lib/utils/copyToClipboard";
  import { notifications } from "$lib/utils/notifications";
  import {
    RequestDataType,
    ResponseFormatter,
  } from "$lib/utils/enums/request.enum";
  import MonacoEditorResponse from "$lib/components/monaco-editor/MonacoEditorResponse.svelte";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";

  export let response;
  export let apiState;
  export let collectionsMethods: CollectionsMethods;

  let fileExtension: string;
  /**
   * @description Copy API response to users clipboard.
   */
  const handleCopy = async () => {
    const jsonString = response?.body;
    await copyToClipBoard(jsonString);
    notifications.success("Copied to Clipboard");
  };

  const handleTypeDropdown: (tab: string) => void = (tab) => {
    collectionsMethods.updateRequestState(tab, "responseRaw");
  };

  $: {
    if (apiState) {
      if (apiState.responseRaw === RequestDataType.JSON) {
        fileExtension = "json";
      } else if (apiState.responseRaw === RequestDataType.XML) {
        fileExtension = "xml";
      } else if (apiState.responseRaw === RequestDataType.HTML) {
        fileExtension = "html";
      } else if (apiState.responseRaw === RequestDataType.TEXT) {
        fileExtension = "txt";
      } else if (apiState.responseRaw === RequestDataType.JAVASCRIPT) {
        fileExtension = "js";
      }
    }
  }

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
      <div class="bg-dullBackground rounded" style="height: 22px;">
        <button
          on:click={() => {
            collectionsMethods.updateRequestState(
              ResponseFormatter.PRETTY,
              "responseFormatter",
            );
          }}
          class="rounded btn-formatter {apiState.responseFormatter ===
          ResponseFormatter.PRETTY
            ? 'bg-lightBackground'
            : ''}"
        >
          Pretty
        </button>
        <button
          on:click={() => {
            collectionsMethods.updateRequestState(
              ResponseFormatter.RAW,
              "responseFormatter",
            );
          }}
          class="rounded btn-formatter {apiState.responseFormatter ===
          ResponseFormatter.RAW
            ? 'bg-lightBackground'
            : ''}">Raw</button
        >
      </div>
      {#if apiState.responseFormatter === ResponseFormatter.PRETTY}
        <button
          class="d-flex align-items-center justify-content-center gap-2 bg-backgroundColor border-0"
        >
          <Dropdown
            dropdownId={"hash565"}
            title={apiState.responseRaw}
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
      {/if}
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
  <div class="w-100" style="background-color:black;">
    <MonacoEditorResponse
      rawTab={apiState.responseRaw}
      rawValue={response.body}
      formatter={apiState.responseFormatter}
    />
  </div>
</div>

<style>
  .btn-formatter {
    outline: none;
    background-color: transparent;
    border: none;
    font-size: 12px;
    padding: 2px 4px;
    width: 46px;
    height: 22px;
    transform: translateY(-3px);
  }
</style>
