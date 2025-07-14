<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { Button } from "@sparrow/library/ui";
  import { FileUpload, TextUpload } from "../components";
  import { InfoIcon } from "@sparrow/library/icons";

  export let currentWorkspaceId;
  export let onCloseModal;
  export let onItemCreated;
  export let collectionList;

  export let onGetOapiTextFromURL; // Sends http request to the URL and get the (JSON / XML) text of Oapi                               (1)

  export let onValidateOapiText; // Sends the (JSON / XML) text to the server (checks format and syntax) and returns true or false      (2)
  export let onValidateOapiFile; // Sends the (JSON / XML) file to the server (checks format and syntax) and returns true or false      (2)

  export let onImportOapiText; // Sends the (JSON / XML) text to backend and create a collection                                        (3)
  export let onImportOapiFile; // Sends the (JSON / XML) file to backend and create a collection                                        (3)

  export let onImportPostmanCollection;
  export let isActiveSyncRequired;
  export let isActiveSyncPlanModalOpen;

  let isInputDataTouched = false;
  let importType: string = "text";

  let isInfoIconHovered = false;

  const handleMouseEnter = () => {
    isInfoIconHovered = true;
  };

  const handleMouseLeave = () => {
    isInfoIconHovered = false;
  };
</script>

<div class="d-flex pt-3">
  <div class="form-check import-type-inp">
    <input
      class="form-check-input"
      type="radio"
      name="flexRadioDefault"
      id="flexRadioDefault1"
      value="text"
      bind:group={importType}
      on:click={() => {
        isInputDataTouched = false;
      }}
    />
    <label class="form-check-label text-fs-14" for="flexRadioDefault1">
      Paste Text
    </label>
  </div>
  <div class="form-check import-type-inp">
    <input
      class="form-check-input"
      type="radio"
      name="flexRadioDefault"
      id="flexRadioDefault2"
      value="file"
      bind:group={importType}
      on:click={() => {
        isInputDataTouched = false;
      }}
    />
    <label class="form-check-label text-fs-14" for="flexRadioDefault2">
      Upload File
    </label>
  </div>
  {#if importType === "file"}
    <div
      class="info-icon"
      style="margin-left: auto;"
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
    >
      <InfoIcon
        height={"17px"}
        width={"17px"}
        color={isInfoIconHovered
          ? "var(--icon-primary-300)"
          : "var(--icon-secondary-100)"}
      />
      {#if isInfoIconHovered}
        <div class="tooltip">
          Nested folders display is not supported.<br />
          They will be flattened during import.
          <div class="tooltip-arrow"></div>
        </div>
      {/if}
    </div>
  {/if}
</div>
<br />

<div class="d-flex flex-column align-items-center justify-content-end rounded">
  <div
    class="w-100"
    style="display: {importType === 'text' ? 'block' : 'none'};"
  >
    <TextUpload
      {currentWorkspaceId}
      {onCloseModal}
      {onGetOapiTextFromURL}
      {onValidateOapiText}
      {onImportOapiText}
      {isActiveSyncRequired}
      {onImportPostmanCollection}
      bind:isActiveSyncPlanModalOpen
    />
  </div>

  <div
    class="w-100"
    style="display: {importType === 'file' ? 'block' : 'none'};"
  >
    <FileUpload
      {currentWorkspaceId}
      {onCloseModal}
      {onValidateOapiFile}
      {onImportOapiFile}
    />
  </div>

  <p class="importData-whiteColor my-3 sparrow-fs-14 fw-light">OR</p>
  <Button
    title={"Create Empty Collection"}
    size={"large"}
    onClick={() => {
      onItemCreated("collection", {
        workspaceId: currentWorkspaceId,
        collection: collectionList,
      });
      onCloseModal();
    }}
    type={"primary"}
    customWidth={"100%"}
  />
</div>
<div style="margin-top: 20px; justify-content:center" class="d-flex">
  <p
    class="text-ds-font-size-12 text-ds-font-weight-medium text-ds-line-height-150"
    style="color: var(--text-ds-neutral-300); text-align: center;"
  >
    For active sync, only swagger or localhost links are supported. Uploading
    files or pasting OpenAPI JSON text will create a normal collection.
  </p>
</div>

<style lang="scss">
  .import-type-inp {
    padding: 1% 2%;
    margin-right: 5%;
  }

  .import-type-inp input {
    margin-left: 0;
    margin-right: 5px;
    border-width: 2px;
  }

  .info-icon {
    margin-top: 1%;
    margin-right: 1%;
    display: inline-block;
    position: relative;
  }

  .tooltip {
    position: absolute;
    top: 110%;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--bg-secondary-530);
    color: var(--text-secondary-1000);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 1;
    opacity: 1;
  }

  .tooltip-arrow {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent var(--bg-secondary-530) transparent;
  }

  .info-icon:hover {
    cursor: pointer;
  }

  textarea {
    width: 100%;
    resize: vertical;
    height: calc(100px) !important;
    margin-bottom: 5%;
    outline: none;
  }

  input {
    outline: none;
  }

  .form-check-input {
    border: 1px solid var(--border-secondary-100);
    background-color: var(--bg-tertiary-300) !important;
    background-image: none !important;
  }

  .form-check-input:checked:hover {
    border: 3px solid var(--border-primary-300);
    background-color: var(--bg-tertiary-300);
    outline: 5px solid var(--border-tertiary-300);
    outline-offset: -1px;
  }

  .form-check-input:hover {
    border: 3px solid var(--border-primary-300);
    background-color: var(--bg-tertiary-300);
    outline: 5px solid var(--border-tertiary-300);
    outline-offset: -1px;
  }

  .form-check-input:checked {
    background-color: var(--bg-tertiary-750) !important;
    border: 4.5px solid var(--border-primary-300) !important;
  }

  .form-check-label {
    color: var(--text-secondary-100);
  }

  .required-mark {
    color: var(--text-ds-danger-400);
    font-family: "Inter", sans-serif;
  }
</style>
