<script lang="ts">
  import ModalWrapperV1 from "@library/ui/modal/Modal.svelte";
  import Spinner from "@library/ui/spinner/Spinner.svelte";
  import { notifications } from "@library/ui/toast/Toast";
  import { RequestDataType, RequestDataset } from "$lib/utils/enums";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { ImportCurlViewModel } from "./ImportCurl.viewModel.old";
  import { v4 as uuidv4 } from "uuid";
  export let onClick: (flag: boolean) => void;
  export let collectionsMethods: CollectionsMethods;
  const _viewImportCurl = new ImportCurlViewModel();
  let importCurl = "";
  let progressBar = {
    isLoading: false,
  };

  const checkBodyType = (type: string) => {
    const contentTypeMapping: { [key: string]: string } = {
      "application/json": RequestDataType.JSON,
      "application/xml": RequestDataType.XML,
      "application/x-www-form-urlencoded": RequestDataset.URLENCODED,
      "multipart/form-data": RequestDataset.FORMDATA,
      "application/javascript": RequestDataType.JAVASCRIPT,
      "text/plain": RequestDataType.TEXT,
      "text/html": RequestDataType.HTML,
    };

    return contentTypeMapping[type] || RequestDataset.NONE;
  };
  const handleImport = async () => {
    progressBar.isLoading = true;
    const response = await _viewImportCurl.importCollectionFromCurl(importCurl);
    if (response.isSuccessful) {
      const sampleRequest = generateSampleRequest(
        UntrackedItems.UNTRACKED + uuidv4(),
        new Date().toString(),
      );
      if (response.data.data.request.selectedRequestBodyType) {
        const bodyType = checkBodyType(
          response.data.data.request.selectedRequestBodyType,
        );
        if (bodyType === RequestDataset.NONE) {
          sampleRequest.property.request.state.dataset = bodyType;
        } else if (
          bodyType !== RequestDataset.URLENCODED &&
          bodyType !== RequestDataset.FORMDATA
        ) {
          sampleRequest.property.request.state.dataset = RequestDataset.RAW;
          sampleRequest.property.request.state.raw = bodyType;
        } else {
          sampleRequest.property.request.state.dataset = bodyType;
        }
      }
      sampleRequest.name = response.data.data.name ?? "";
      sampleRequest.description = response.data.data.description ?? "";
      sampleRequest.type = response.data.data.type ?? ItemType.REQUEST;
      sampleRequest.property.request.method = response.data.data.request.method;
      sampleRequest.property.request.url = response.data.data.request.url;
      sampleRequest.property.request.body = response.data.data.request.body;
      sampleRequest.property.request.headers =
        response.data.data.request.headers;
      sampleRequest.property.request.queryParams =
        response.data.data.request.queryParams;
      sampleRequest.property.request.auth = response.data.data.request.auth;
      sampleRequest.property.request.state.auth =
        response.data.data.request.selectedRequestAuthType;

      collectionsMethods.handleCreateTab(sampleRequest);
      moveNavigation("right");
      onClick(false);
      progressBar.isLoading = false;
      notifications.success("API request is imported successfully.");
    } else {
      progressBar.isLoading = false;
      if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error(
          "Failed to import API request. Please check the cURL text and try again.",
        );
      }
    }
  };
</script>

<ModalWrapperV1
  title={"Import via cURL"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={true}
  handleModalState={onClick}
>
  <div class="sparrow-fs-14 text-muted mt-3">
    <p>Paste cURL here</p>
  </div>
  <div class="textarea-div rounded border-0">
    <textarea
      bind:value={importCurl}
      class="form-control border-0 rounded bg-blackColor textarea-class"
      placeholder="Copy and paste cURL of the API request"
    />
  </div>
  <button
    class="btn-primary d-flex align-items-center justify-content-center border-0 w-100 py-2 fs-6 rounded"
    on:click={() => {
      handleImport();
    }}
  >
    <span class="me-3">
      {#if progressBar.isLoading}
        <Spinner size={"16px"} />
      {/if}</span
    >
    Import API Request</button
  >
</ModalWrapperV1>

<style lang="scss">
  .textarea-div {
    height: 120px;
    border: 2px solid red;
  }
  .textarea-class {
    height: 80%;
  }
  .btn-primary {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }
</style>
