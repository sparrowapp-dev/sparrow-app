<script lang="ts">
  import { trashIcon as trashIcon } from "@sparrow/library/assets";
  import {
    AttachRegular,
    DeleteRegular,
    ReOrderDotsRegular,
  } from "@sparrow/library/icons";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  import { invoke } from "@tauri-apps/api/core";
  import { crossIcon as close } from "@sparrow/library/assets";
  import { TabularInputTheme } from "../../utils";
  import { CodeMirrorInput } from "..";
  import { Button, Tooltip } from "@sparrow/library/ui";
  import { onMount } from "svelte";
  import { Base64Converter } from "@sparrow/common/utils";
  import { Checkbox } from "@sparrow/library/forms";
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
  let pairsContainer: HTMLElement;

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

  /**
   * Scrolls the container to bring the newly added row into view
   */
  const scrollToNewRow = () => {
    setTimeout(() => {
      if (pairsContainer) {
        const lastRow = pairsContainer.lastElementChild;
        if (lastRow) {
          lastRow.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }
    }, 50);
  };

  const updateParam = async (index: number): Promise<void> => {
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
      callback(pairs);

      scrollToNewRow();
    } else {
      callback(pairs);
    }
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

  let fileInput: HTMLInputElement;
  let selectedFileIndex = 0;
  const uploadFormFile = async (index: number) => {
    if (isWebApp) {
      selectedFileIndex = index;
      fileInput?.click();
      return;
    }
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

  onMount(() => {
    fileInput = document.getElementById("fileInput") as HTMLInputElement;
    fileInput?.addEventListener("change", async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (files?.length) {
        const filename = files[0].name;
        const base64Converter = new Base64Converter();
        const data = await base64Converter.fileToBase64(files[0]);
        let filteredPair = pairs.map((elem, i) => {
          if (i == selectedFileIndex) {
            elem.type = "file";
            elem.value = filename;
            elem.base = data;
          }
          return elem;
        });
        pairs = filteredPair;
        callback(pairs);
        updateParam(selectedFileIndex);
      }
      // Reset the input to allow re-uploading the same file
      target.value = "";
    });
  });

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

<input type="file" id="fileInput" style="display: none" />

<div
  class="mb-0 me-0 py-0 section-layout w-100"
  style="overflow:visible; border-radius:4px;"
>
  <div
    class="w-100 d-flex align-items-center pair-header-row {!isTopHeaderRequired
      ? 'd-none'
      : ''}"
    style="position:relative; "
  >
    <div style=" width:24px; margin-right:12px;" class="">
      <Checkbox
        disabled={pairs.length === 1 || !isCheckBoxEditable}
        checked={controller}
        on:input={handleCheckAll}
      />
    </div>

    <div class="d-flex gap-0" style="width: calc(100% - 180px);">
      <div
        class="w-50 position-relative header-text"
        style="padding-left: 6px;"
      >
        Key
      </div>
      <div
        class="w-50 position-relative header-text"
        style="padding-left: 62px;"
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
  <div
    class="w-100"
    style="display:block; position:relative;"
    bind:this={pairsContainer}
  >
    {#if pairs}
      {#each pairs as element, index}
        <div
          class="pair-data-row w-100 d-flex align-items-center px-1"
          style="position:relative"
        >
          <!-- <div class="button-container">
            <Button
              size="extra-small"
              type="teritiary-regular"
              startIcon={ReOrderDotsRegular}
            />
          </div> -->
          <div style=" width:24px;" class="me-2">
            {#if pairs.length - 1 != index || !isInputBoxEditable}
              <Checkbox
                checked={element.checked}
                on:input={() => {
                  updateCheck(index);
                }}
                disabled={!isCheckBoxEditable}
              />
            {/if}
          </div>

          <div class="d-flex gap-0" style="width: calc(100% - 86px);">
            <div class="w-50 d-flex align-items-center">
              <div
                class="position-absolute top-0"
                style="width: calc(50% - 48px);"
              >
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
              <div class="w-50 d-flex align-items-center">
                <div
                  class="position-absolute top-0 left-6"
                  style="width: calc(50% - 48px);"
                >
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
              </div>
            {/if}
          </div>
          <div
            class="ms-1 d-flex align-items-center justify-content-between gap-1"
            style="width:40px;"
          >
            {#if pairs.length - 1 != index}
              {#if isInputBoxEditable}
                <!-- {#if !isWebApp} -->
                <Tooltip
                  title="Attach"
                  show={isInputBoxEditable &&
                    element.type == "text" &&
                    element.value == ""}
                  placement="bottom-center"
                >
                  <button
                    class="button-container d-flex align-items-center justify-content-center border-0 {isInputBoxEditable &&
                    element.type == 'text' &&
                    element.value == ''
                      ? 'opacity-1'
                      : 'opacity-0 pe-none'}"
                    style="width:16px; height:16px; padding:2px; background:transparent;"
                    on:click={() => {
                      uploadFormFile(index);
                    }}
                  >
                    <AttachRegular
                      size={"16px"}
                      color={"var(--icon-ds-neutral-100)"}
                    />
                  </button>
                </Tooltip>
                <!-- {/if} -->
                <Tooltip
                  title={"Delete"}
                  placement={"bottom-center"}
                  distance={10}
                >
                  <div class="button-container">
                    <Button
                      buttonClassProp=""
                      size="extra-small"
                      type="teritiary-regular"
                      startIcon={DeleteRegular}
                      onClick={() => {
                        deleteParam(index);
                      }}
                    />
                  </div>
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
    padding-top: 3px;
    padding-bottom: 3px;
    background-color: var(--bg-ds-surface-400);
    height: 28px;
    padding-left: 4px;
    padding-right: 1rem;
  }
  .pair-data-row:first-child {
    border-top: none !important;
    height: 28px !important;
  }
  .pair-data-row {
    padding-top: 3px;
    padding-bottom: 3px;
    padding-right: 20px;
    padding-left: 2px;
    height: calc(28px);
    background-color: var(--bg-ds-surface-600);
    border-top: 1px solid var(--bg-ds-surface-400);
  }
  .pair-data-row:hover {
    background-color: var(--bg-ds-surface-500);
  }
  .trash-icon {
    background: transparent;
  }
  .trash-icon:hover {
    background-color: var(--bg-ds-surface-300);
  }
  .trash-icon:focus-visible {
    border: 2px solid var(--bg-ds-primary-300);
  }
  .header-text {
    color: var(--text-ds-neutral-200);
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
  }
  .pair-data-row:hover .button-container {
    opacity: 1;
    visibility: visible;
  }
  .button-container {
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.1s ease-in-out,
      visibility 0.1s;
  }
</style>
