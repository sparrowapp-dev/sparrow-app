<script lang="ts">
  import { trashIcon as trashIcon } from "@sparrow/library/assets";
  import editIcon from "../../features/rest-explorer/assets/icons/edit.svg";
  import moreOptions from "../../features/rest-explorer/assets/icons/moreOptions.svg";
  import attachFile from "../../features/rest-explorer/assets/icons/attachFile.svg";
  import type {
    KeyValuePair,
    KeyValuePairWithBase,
  } from "@sparrow/common/interfaces/request.interface";
  import { invoke } from "@tauri-apps/api/core";
  import { crossIcon as close } from "@sparrow/library/assets";
  import { TabularInputTheme } from "../../utils";
  import { CodeMirrorInput } from "..";
  import { Tooltip } from "@sparrow/library/ui";
  export let keyValue: KeyValuePair[] | KeyValuePairWithBase[];
  export let callback: (pairs: KeyValuePair[]) => void;
  export let readable: { key: string; value: string } = {
    key: "",
    value: "",
  };
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isCheckBoxEditable = true;
  export let isTopHeaderRequired = true;
  export let isInputBoxEditable = true;
  let pairs: KeyValuePair[] | KeyValuePairWithBase[] = keyValue;
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

  const extractFileName = (url) => {
    const parts = url.split("\\");
    const fileName = parts[parts.length - 1];
    return fileName;
  };

  const uploadFormFile = async (index) => {
    const filePathResponse = await invoke("fetch_file_command");
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

  const removeFormFile = (index) => {
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
  class="mb-0 me-0 w-100 bg-secondary-700 ps-3 py-0 border-radius-2 section-layout"
>
  <div
    class="d-flex gap-3 align-items-center w-100 {!isTopHeaderRequired
      ? 'd-none'
      : ''}"
  >
    <div style="width:30px; margin-left: 5px;">
      <label class="container">
        <input
          type="checkbox"
          disabled={pairs.length === 1 || !isCheckBoxEditable}
          bind:checked={controller}
          on:input={handleCheckAll}
        />
        <span class="checkmark"></span>
      </label>
    </div>
    <div
      class="d-flex pair-title bg-secondary-700 align-items-center w-100"
      style="font-size: 12px; font-weight: 500;"
    >
      <p class="mb-0 w-50 text-secondary-200 text-fs-12 p-1 ps-2">Key</p>
      <p class="mb-0 w-50 text-secondary-200 text-fs-12 p-1">Value</p>
    </div>
    <div class="pe-1 d-flex">
      <button class="bg-transparent border-0 d-flex d-none" style="">
        <p
          class="text-nowrap text-primary-300 mb-0 me-2"
          style="font-size: 10px;"
        >
          Bulk Edit
        </p>
        <img
          class="my-auto d-none"
          src={editIcon}
          alt="Edit Icon"
          style="height: 10px; width: 10px;"
        />
      </button>
      <button class="bg-transparent border-0 d-flex d-none" style="">
        <img
          class="my-auto"
          src={moreOptions}
          alt="Edit Icon"
          style="height: 10px; width: 10px;"
        />
      </button>
      <div class="h-75 pe-1">
        <button class="border-0" style="width:40px;" />
      </div>
    </div>
  </div>

  <div
    class="w-100"
    style="display:block; position:relative;
      width:200px;
      "
  >
    {#if readable.key || readable.value}
      <div
        aria-label="Toggle Hover"
        class="sortable > div"
        style=" width:100%;"
      >
        <div
          style="padding-top: 1px; background-color:backgroundColor;display: flex;flex-direction: column;width:100%;"
        >
          <div
            class="d-flex w-100 align-items-center justify-content-center gap-3"
          >
            <div style="width:30px;">
              <input
                class="form-check-input"
                type="checkbox"
                disabled
                checked={true}
              />
            </div>

            <div class="d-flex gap-0" style="width:calc(100% - 120px)">
              <div class="w-50 position-relative">
                <input
                  type="text"
                  placeholder=""
                  class=" keyValuePair py-1 w-100"
                  style="font-size: 12px;"
                  disabled
                  bind:value={readable.key}
                />
              </div>
              <div class="w-50 position-relative">
                <input
                  type="text"
                  placeholder=""
                  class=" keyValuePair py-1 w-100"
                  style="font-size: 12px;"
                  disabled
                  bind:value={readable.value}
                />
              </div>
            </div>
            <div class="h-75 pe-1">
              <button class=" border-0" style="width:40px;" />
            </div>
          </div>
        </div>
      </div>
    {/if}
    {#if pairs}
      {#each pairs as element, index}
        <div
          aria-label="Toggle Hover"
          class="sortable > div pair-container"
          style=" width:100%;"
          data-list-key={JSON.stringify({
            name: element.key,
            description: element.value,
            checked: element.checked,
          })}
        >
          <div
            style="padding-top: 1px;  display: flex;flex-direction: column;width:100%;"
          >
            <div
              class="d-flex w-100 align-items-center justify-content-center gap-3 pair-container"
              style="padding-top:3px; padding-bottom:3px; height:24px; padding-bottom:3px;"
            >
              <div style="width:30px; height: 14px;">
                {#if pairs.length - 1 != index || !isInputBoxEditable}
                  <label class="container">
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

              <div class=" d-flex gap-0" style="width:calc(100% - 120px)">
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
                  <div class="w-50">
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
                  <div class="w-50 position-relative">
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
              <div class="h-75 d-flex align-items-center" style="width:48px;">
                {#if pairs.length - 1 != index}
                  {#if isInputBoxEditable}
                    <Tooltip
                      title="Attach"
                      show={isInputBoxEditable &&
                        element.type == "text" &&
                        element.value == ""}
                      placement="bottom-left"
                    >
                      <button
                        class="me-1 d-flex align-items-center justify-content-center bg-secondary-700 border-0 {isInputBoxEditable &&
                        element.type == 'text' &&
                        element.value == ''
                          ? 'opacity-1'
                          : 'opacity-0 pe-none'}"
                        style="width:20px; height:16px;"
                        on:click={() => {
                          uploadFormFile(index);
                        }}
                      >
                        <img src={attachFile} alt="" />
                      </button>
                    </Tooltip>
                    <Tooltip title="Delete" placement="bottom-left">
                      <button
                        class="me-1 d-flex align-items-center justify-content-center bg-secondary-700 border-0"
                        style="width:20px; height:16px;"
                        on:click={() => {
                          deleteParam(index);
                        }}
                      >
                        <img src={trashIcon} alt="" />
                      </button>
                    </Tooltip>
                  {:else}
                    <div style="width:45px;" class="opacity:0;"></div>
                  {/if}
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .keyValuePair {
    background-color: transparent;
    border-radius: 0;
    border: 1px solid transparent;
  }
  .pair-container:nth-child(odd) {
    margin-top: -1px;
  }
  .section-layout {
    border-top: 1px solid var(--border-secondary-500);
    border-bottom: 1px solid var(--border-secondary-500);
  }

  /* The container */
  .container {
    display: block;
    position: relative;
    padding-left: 35px;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 22px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Hide the browser's default checkbox */
  .container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    background-color: transparent;
    border: 2px solid var(--text-secondary-500);
  }

  /* Create a custom checkbox */
  .checkmark {
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
  /* .container:hover input ~ .checkmark {
    background-color: #ccc;
  } */

  /* When the checkbox is checked, add a blue background */
  .container input:checked ~ .checkmark {
    border: none;
    background-color: var(--text-primary-300);
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the checkmark when checked */
  .container input:checked ~ .checkmark:after {
    display: block;
  }

  /* Style the checkmark/indicator */

  .action-icon {
    height: 24px;
    width: 24px;
    border-radius: 2px;
  }

  .action-icon:hover {
    background-color: var(--bg-secondary-500);
  }
  .container .checkmark:after {
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
