<script lang="ts">
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import type {
    KeyValuePair,
    KeyValuePairWithBase,
  } from "$lib/utils/interfaces/request.interface";
  import { invoke } from "@tauri-apps/api/core";
  import close from "$lib/assets/close.svg";
  import { TabularInputTheme } from "../../utils";
  import { CodeMirrorInput } from "../";
  type Mode = "READ" | "WRITE";

  export let keyValue: KeyValuePair[] | KeyValuePairWithBase[];
  export let callback: (pairs: KeyValuePair[]) => void;
  export let mode: Mode = "WRITE";
  export let readable: { key: string; value: string } = {
    key: "",
    value: "",
  };
  export let environmentVariables;
  export let type: "file" | "text" = "text";
  export let onUpdateEnvironment;
  let pairs: KeyValuePair[] | KeyValuePairWithBase[] = keyValue;
  let controller: boolean = false;

  const theme = new TabularInputTheme().build();

  $: {
    if (keyValue) {
      pairs = keyValue;
      let flag: boolean = false;
      for (let i = 0; i < pairs.length - 1; i++) {
        if (pairs[i].checked === false) {
          flag = true;
        }
      }
      if (mode === "READ" && pairs[pairs.length - 1].checked === false) {
        flag = true;
      }
      if (flag) {
        controller = false;
      } else {
        controller = true;
      }
    }
  }

  const updateParam = (index: number): void => {
    pairs.forEach((elem, i) => {
      if (i === index) {
        elem.checked = true;
      }
    });
    pairs = pairs;
    if (
      pairs.length - 1 === index &&
      mode === "WRITE" &&
      (pairs[index].key !== "" || pairs[index].value !== "")
    ) {
      pairs.push({ key: "", value: "", checked: false });
      pairs = pairs;
    }
    callback(pairs);
  };
  let loaded = true;
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
    loaded = false;
    setTimeout(() => {
      loaded = true;
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
      } else if (mode === "READ") {
        elem.checked = flag;
      }
      return elem;
    });
    pairs = filteredKeyValue;
    callback(pairs);
  };
</script>

{#if loaded}
  <div class="mb-0 me-0 w-100 bg-secondary-700 ps-3 py-2 border-radius-2">
    <div class="d-flex gap-3 pb-2 align-items-center w-100 ps-2">
      <div style="width:30px;">
        <input
          class="form-check-input"
          type="checkbox"
          bind:checked={controller}
          on:input={handleCheckAll}
        />
      </div>
      <div
        class="d-flex pair-title bg-secondary-700 align-items-center w-100"
        style="font-size: 12px; font-weight: 500;"
      >
        <p class="mb-0 w-50 text-secondary-200 text-fs-12 p-1 ps-2">Name</p>
        <p class="mb-0 w-50 text-secondary-200 text-fs-12 p-1 ps-1">Value</p>
      </div>
      <div class="h-75 pe-1">
        <button class="border-0" style="width:40px;" />
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
              class="d-flex w-100 align-items-center justify-content-center gap-3 mb-2"
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
                    placeholder="Enter Key"
                    class=" keyValuePair py-1 w-100"
                    style="font-size: 12px;"
                    disabled
                    bind:value={readable.key}
                  />
                </div>
                <div class="w-50 position-relative">
                  <input
                    type="text"
                    placeholder="Enter Value"
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
              class="d-flex w-100 align-items-center justify-content-center gap-3 pair-container pb-2"
            >
              <img
                src={dragIcon}
                alt=""
                class="d-none"
                style="cursor:grabbing;"
              />
              <div style="width:30px;">
                {#if pairs.length - 1 != index || mode === "READ"}
                  <input
                    class="form-check-input"
                    type="checkbox"
                    bind:checked={element.checked}
                    on:input={() => {
                      updateCheck(index);
                    }}
                  />
                {/if}
              </div>

              <div class=" d-flex gap-0" style="width:calc(100% - 120px)">
                <div class="w-50 position-relative">
                  <CodeMirrorInput
                    bind:urlText={element.key}
                    onUpdateRequestUrl={() => {
                      updateParam(index);
                    }}
                    disabled={mode == "READ" ? true : false}
                    placeholder={"Add Name"}
                    {theme}
                    {environmentVariables}
                    {onUpdateEnvironment}
                  />
                </div>
                {#if type === "file"}
                  <div class="w-50">
                    <div
                      class="position-relative rounded p-1 d-flex backgroundColor"
                      style="height: 27px;"
                    >
                      {#if element.value === ""}
                        <input
                          type="text"
                          class="form-control keyValuePair py-1"
                          readonly
                          style="z-index:4; font-size:13px;
                    position: absolute;
                      top:0;
                      left:0;
                      right:0;
                      bottom:-1;"
                          placeholder="Choose File"
                        />
                        <input
                          class="form-input"
                          type="text"
                          id="formdata-file"
                          on:click={() => {
                            uploadFormFile(index);
                          }}
                          style="opacity: 0;
                      position: absolute;
                      top:0;
                      left:0;
                      right:0;
                      bottom:0;
                      z-index:10;
                      "
                        />
                      {:else}
                        <input
                          type="text"
                          class="keyValuePair py-1"
                          readonly
                          style="z-index:4; font-size:13px;
                    position: absolute;
                      top:0;
                      left:0;
                      right:0;
                      bottom:-1;"
                          placeholder=""
                        />
                        <div
                          class="position-absolute"
                          style="height:18px; z-index: 5;
                      
                      font-size:13px;
                    
                      top:0;
                      left:0px;"
                        >
                          <span style="font-size:10px;" class="m-1"
                            >{element.value}</span
                          >
                          <img
                            src={close}
                            alt=""
                            style="cursor:pointer;"
                            on:click={() => {
                              removeFormFile(index);
                            }}
                          />
                        </div>
                      {/if}
                    </div>
                  </div>
                {:else}
                  <div class="w-50 position-relative">
                    <CodeMirrorInput
                      bind:urlText={element.value}
                      onUpdateRequestUrl={() => {
                        updateParam(index);
                      }}
                      placeholder={"Value"}
                      disabled={mode == "READ" ? true : false}
                      {theme}
                      {environmentVariables}
                      {onUpdateEnvironment}
                    />
                  </div>
                {/if}
              </div>
              {#if pairs.length - 1 != index}
                <div class="h-75 pe-1">
                  <button class="bg-secondary-700 border-0" style="width:40px;">
                    {#if mode !== "READ"}
                      <img
                        src={trashIcon}
                        on:click={() => {
                          deleteParam(index);
                        }}
                        alt=""
                      />
                    {/if}
                  </button>
                </div>
              {:else}
                <div class="h-75 pe-1">
                  <button
                    class="bg-backgroundColor border-0"
                    style="width:40px;"
                  />
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  input[type="checkbox"] {
    margin-top: 6px;
    border-radius: 2px;
    height: 12px;
    width: 12px;
    transform: scale(1.2);
    cursor: pointer;
  }

  input[type="text"] {
    padding: 4px !important;
    outline: none !important;
  }

  input:checked {
    background-color: var(--primary-btn-color) !important;
    border: none;
  }
  .keyValuePair {
    background-color: transparent;
    border-radius: 0;
    border: 1px solid transparent;
  }
  .pair-container:nth-child(odd) {
    margin-top: -1px;
  }
</style>
