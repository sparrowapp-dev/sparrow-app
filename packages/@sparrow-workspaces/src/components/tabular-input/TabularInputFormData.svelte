<script lang="ts">
  import { trashIcon as trashIcon } from "@sparrow/library/assets";
  import { AttachmentIcon } from "@sparrow/library/icons";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  import { invoke } from "@tauri-apps/api/core";
  import { crossIcon as close } from "@sparrow/library/assets";
  import { TabularInputTheme } from "../../utils";
  import { CodeMirrorInput } from "..";
  import { Tooltip } from "@sparrow/library/ui";
  export let keyValue: {
    key: string;
    value: string;
    checked: boolean;
    type: "text" | "file";
    base: string;
  }[];
  export let callback: (pairs: KeyValuePair[]) => void;
  export let readable: { key: string; value: string } = {
    key: "",
    value: "",
  };
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isCheckBoxEditable = true;
  export let isTopHeaderRequired = true;
  export let isBulkEditRequired = false;
  export let isInputBoxEditable = true;
  export let isWebApp = false;
  let pairs = keyValue;
  let controller: boolean = false;

  const theme = new TabularInputTheme().build();

  $: {
    if (keyValue) {
      identifySelectAllState();
    }
  }

  /**
   * @description - calculates the select all checkbox state - weather checked or not
   */
  const identifySelectAllState = () => {
    pairs = [];
    pairs = keyValue;
    controller = false;
    if (pairs.length > 1) {
      let isUncheckedExist: boolean = false;
      for (let i = 0; i < pairs.length - 1; i++) {
        if (pairs[i].checked === false) {
          isUncheckedExist = true;
          break;
        }
      }
      if (isUncheckedExist) {
        controller = false;
      } else {
        controller = true;
      }
    }
  };

  const updateParam = (index: number): void => {
    pairs = pairs;
    if (
      pairs.length - 1 === index &&
      isInputBoxEditable &&
      (pairs[index].key !== "" || pairs[index].value !== "")
    ) {
      pairs[pairs.length - 1].checked = true;
      pairs.push({
        key: "",
        value: "",
        checked: false,
        type: "text",
        base: "",
      });
      pairs = pairs;
    }
    callback(pairs);
  };
  const deleteParam = (index: number): void => {
    if (pairs.length > 1) {
      let filteredKeyValue = pairs.filter((elem, i) => {
        if (i !== index) {
          return true;
        }
        return false;
      });
      pairs = filteredKeyValue;
    }
    callback(pairs);
    setTimeout(() => {
      pairs[pairs.length - 1].key = "";
      pairs[pairs.length - 1].value = "";
    }, 0);
  };

  const updateCheck = (index: number): void => {
    let filteredKeyValue = pairs.map((elem, i) => {
      if (i === index) {
        elem.checked = !elem.checked;
      }
      return elem;
    });
    pairs = filteredKeyValue;
    callback(pairs);
  };

  const extractFileName = (url: string) => {
    const parts = url.split("\\");
    const fileName = parts[parts.length - 1];
    return fileName;
  };

  const uploadFormFile = async (index: number) => {
    const filePathResponse = (await invoke("fetch_file_command")) as string;
    if (filePathResponse !== "Canceled") {
      const filename = extractFileName(filePathResponse);
      const updatedFilePath = filePathResponse;
      let filteredPair = pairs.map((elem, i) => {
        if (i == index) {
          elem.type = "file";
          elem.value = filename;
          elem.base = updatedFilePath;
        }
        return elem;
      });
      pairs = filteredPair;
      callback(pairs);
      updateParam(index);
    }
  };

  const removeFormFile = (index: number) => {
    let filteredPair = pairs.map((elem, i) => {
      if (i == index) {
        elem.value = "";
        elem.base = "";
        elem.type = "text";
      }
      return elem;
    });
    pairs = filteredPair;
    callback(pairs);
  };

  const handleCheckAll = (): void => {
    let flag: boolean;
    if (controller === true) {
      flag = false;
    } else {
      flag = true;
    }
    let filteredKeyValue = pairs.map((elem, i) => {
      if (i !== pairs.length - 1) {
        elem.checked = flag;
      } else if (!isInputBoxEditable) {
        elem.checked = flag;
      }
      return elem;
    });
    pairs = filteredKeyValue;
    callback(pairs);
  };
</script>

<div
  class="mb-0 me-0 w-100 py-0 border-radius-2 section-layout"
  style="overflow:hidden;"
>
  <div
    class="px-3 d-flex align-items-center w-100 pair-header-row {!isTopHeaderRequired
      ? 'd-none'
      : ''}"
    style="position:relative;"
  >
    <div style="height:14px; width:14px;" class="me-3">
      <label class="checkbox-parent">
        <input
          type="checkbox"
          disabled={pairs.length === 1 || !isCheckBoxEditable}
          bind:checked={controller}
          on:input={handleCheckAll}
        />
        <span class="checkmark"></span>
      </label>
    </div>

    <div class="d-flex gap-0" style="width: calc(100% - 180px);">
      <div
        class="w-50 position-relative text-fs-12 text-secondary-200 fw-bold"
        style="padding-left: 6px;"
      >
        Key
      </div>
      <div
        class="w-50 position-relative text-fs-12 text-secondary-200 fw-bold"
        style="padding-left: 56px;"
      >
        Value
      </div>
    </div>
    <div style="width:140px;" class="ms-3 d-flex align-items-center">
      <div class="w-100 d-flex">
        <div class="w-100 d-flex justify-content-end">
          <button
            class="bg-transparent border-0 mt-1 d-flex {!isBulkEditRequired
              ? 'invisible'
              : ''}"
            style=""
          >
            <p
              class="text-nowrap text-primary-300 mb-0 me-0"
              style="font-size: 10px; font-weight:400;"
            >
              Bulk Edit
            </p>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="w-100" style="display:block; position:relative;">
    {#if pairs}
      {#each pairs as element, index}
        <div class="pair-data-row w-100 px-3 d-flex align-items-center">
          <div style="height:14px; width:14px;" class="me-3">
            {#if pairs.length - 1 != index || !isInputBoxEditable}
              <label class="checkbox-parent">
                <input
                  type="checkbox"
                  bind:checked={element.checked}
                  on:input={() => {
                    updateCheck(index);
                  }}
                  disabled={!isCheckBoxEditable}
                />
                <span class="checkmark"></span>
              </label>
            {/if}
          </div>

          <div class="d-flex gap-0" style="width: calc(100% - 86px);">
            <div class="w-50 position-relative d-flex align-items-center">
              <CodeMirrorInput
                bind:value={element.key}
                onUpdateInput={() => {
                  updateParam(index);
                }}
                disabled={!isInputBoxEditable ? true : false}
                placeholder={"Add Key"}
                {theme}
                {environmentVariables}
                {onUpdateEnvironment}
              />
            </div>
            {#if element.type === "file"}
              <div class="w-50 position-relative d-flex align-items-center">
                <div
                  class="position-relative rounded p-1 d-flex backgroundColor"
                >
                  <div
                    class="bg-keyValuePairColor d-flex h-fit rounded"
                    style="padding: 1px 4px;"
                  >
                    <p style="font-size:10px;" class="mb-0 me-1">
                      {element.value ? element.value : "corrupted-file"}
                    </p>
                    <img
                      src={close}
                      alt=""
                      class="my-auto"
                      style="cursor:pointer; height: 10px; width: 10px;"
                      on:click={() => {
                        if (isInputBoxEditable) {
                          removeFormFile(index);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            {:else}
              <div class="w-50 position-relative d-flex align-items-center">
                <CodeMirrorInput
                  bind:value={element.value}
                  onUpdateInput={() => {
                    updateParam(index);
                  }}
                  placeholder={"Add Value"}
                  disabled={!isInputBoxEditable ? true : false}
                  {theme}
                  {environmentVariables}
                  {onUpdateEnvironment}
                />
              </div>
            {/if}
          </div>
          <div
            class="ms-3 d-flex align-items-center justify-content-between"
            style="width:40px;"
          >
            {#if pairs.length - 1 != index}
              {#if isInputBoxEditable}
                {#if !isWebApp}
                  <Tooltip
                    title="Attach"
                    show={isInputBoxEditable &&
                      element.type == "text" &&
                      element.value == ""}
                    placement="bottom"
                  >
                    <button
                      class="d-flex align-items-center justify-content-center bg-secondary-700 border-0 {isInputBoxEditable &&
                      element.type == 'text' &&
                      element.value == ''
                        ? 'opacity-1'
                        : 'opacity-0 pe-none'}"
                      style="width:16px; height:16px; padding:2px;"
                      on:click={() => {
                        uploadFormFile(index);
                      }}
                    >
                      <AttachmentIcon
                        height={"12px"}
                        width={"12px"}
                        color={"var(--icon-secondary-200)"}
                      />
                    </button>
                  </Tooltip>
                {/if}
                <Tooltip title="Delete" placement="bottom">
                  <button
                    class="d-flex align-items-center justify-content-center bg-secondary-700 border-0"
                    style="width:16px; height:16px;"
                    on:click={() => {
                      deleteParam(index);
                    }}
                  >
                    <img src={trashIcon} style="height:100%; width: 100%;" />
                  </button>
                </Tooltip>
              {:else}
                <div style="width:45px;" class="opacity:0;"></div>
              {/if}
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .pair-header-row {
    border-top: 0.5px solid var(--border-secondary-315);
    padding-top: 3px;
    padding-bottom: 3px;
    background-color: var(--bg-secondary-880);
    height: 26px;
  }
  .pair-data-row:first-child {
    border-top: none !important;
    height: 24px !important;
  }
  .pair-data-row {
    padding-top: 3px;
    padding-bottom: 3px;
    height: calc(24px);
    background-color: var(--bg-secondary-700);
  }

  /* The checkbox-parent */
  .checkbox-parent {
    display: block;
    position: relative;
    /* padding-left: 35px;
    margin-bottom: 12px; */
    cursor: pointer;
    font-size: 22px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Hide the browser's default checkbox */
  .checkbox-parent input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    background-color: transparent;
    border: 2px solid var(--text-secondary-500);
  }

  /* Create a custom checkbox */
  .checkbox-parent .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 14px;
    width: 14px;
    border-radius: 3px;
    background-color: transparent;
    border: 2px solid var(--text-secondary-500);
  }

  /* On mouse-over, add a grey background color */
  /* .checkbox-parent:hover input ~ .checkmark {
    background-color: #ccc;
  } */

  /* When the checkbox is checked, add a blue background */
  .checkbox-parent input:checked ~ .checkmark {
    border: none;
    background-color: var(--text-primary-300);
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .checkbox-parent .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the checkmark when checked */
  .checkbox-parent input:checked ~ .checkmark:after {
    display: block;
  }

  /* Style the checkmark/indicator */
  .checkbox-parent .checkmark:after {
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid var(--text-secondary-850);
    border-width: 0 2px 2px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
</style>
