<script lang="ts">
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import { onDestroy } from "svelte";
  import type { KeyValuePairWithBase } from "$lib/utils/interfaces/request.interface";
  import close from "$lib/assets/close.svg";
  import { invoke } from "@tauri-apps/api";
  export let keyValue: KeyValuePairWithBase[];
  export let callback;

  let pairs: KeyValuePairWithBase[] = keyValue;
  let controller: boolean = false;

  $: {
    if (keyValue) {
      pairs = keyValue;
      let flag: boolean = false;
      for (let i = 0; i < pairs.length - 1; i++) {
        if (pairs[i].checked === false) {
          flag = true;
        }
      }
      if (flag) {
        controller = false;
      } else {
        controller = true;
      }
    }
  }

  const updateParam = (index) => {
    pairs.forEach((elem, i) => {
      if (i == index) {
        elem.checked = true;
      }
    });
    pairs = pairs;
    if (pairs.length - 1 === index) {
      pairs.push({ key: "", value: "", checked: false, base: "" });
      pairs = pairs;
    }
    callback(pairs);
  };

  const deleteParam = (index) => {
    if (pairs.length > 1) {
      let filteredKeyValue = pairs.filter((elem, i) => {
        if (i != index) {
          return true;
        }
        return false;
      });
      pairs = filteredKeyValue;
    }
    callback(pairs);
  };
  const updateCheck = (index) => {
    let filteredKeyValue = pairs.map((elem, i) => {
      if (i == index) {
        elem.checked = !elem.checked;
      }
      return elem;
    });
    pairs = filteredKeyValue;
    callback(pairs);
  };
  let files;

  const extractFileName = (url) => {
  const parts = url.split('\\');
  const fileName = parts[parts.length - 1];
  return fileName;
  }

  const uploadFormFile = async (index) => {
    const filePathResponse = await invoke("fetch_file_command");
    if(filePathResponse !== "Canceled") { 
      const filename = extractFileName(filePathResponse);
      const updatedFilePath = "#@#" + filePathResponse;
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
      }
      return elem;
    });
    pairs = filteredKeyValue;
    callback(pairs);
  };

  onDestroy(() => {});
</script>

<div class="mt-3 me-0 w-100">
  <div class="d-flex gap-2">
    <div style="width:40px;">
      <input
        class="form-check-input"
        type="checkbox"
        bind:checked={controller}
        on:input={handleCheckAll}
      />
    </div>
    <div
      class=" d-flex gap-2 text-requestBodyColor align-items-center"
      style="font-size: 12px; font-weight: 500; width:100%;"
    >
      <p class="flex-grow-1 w-100">Key</p>
      <p class="flex-grow-1 w-100">Value</p>
    </div>
    <div style="width:60px;" />
  </div>

  <div
    class="w-100"
    style="display:block; position:relative;
        width:200px;
        "
  >
    {#each pairs as element, index}
      <div
        aria-label="Toggle Hover"
        class="sortable > div"
        style="cursor:default; width:100%;"
        data-list-key={JSON.stringify({
          name: element.key,
          description: element.value,
          checked: element.checked,
        })}
      >
        <div
          style="padding-top: 1px; background-color:backgroundColor;display: flex;flex-direction: column;width:100%;"
        >
          <div
            class="d-flex w-100 align-items-center justify-content-center gap-3 mb-2"
          >
            <img
              src={dragIcon}
              alt=""
              class="d-none"
              style="cursor:grabbing;"
            />
            <div style="width:30px;">
              {#if pairs.length - 1 != index}
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

            <div class="w-100 d-flex gap-2">
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Key"
                  class="form-control bg-keyValuePairColor py-1 border-0"
                  style="font-size: 13px;"
                  bind:value={element.key}
                  on:input={() => {
                    updateParam(index);
                  }}
                />
              </div>
              <div class="flex-grow-1 w-100">
                <div
                  class="position-relative rounded p-1 d-flex"
                  style="background-color: black; height: 27px;"
                >
                  {#if element.value === ""}
                    <input
                      type="text"
                      class="bg-keyValuePairColor form-control border-0 py-1"
                      readonly
                      style="z-index:4; font-size:13px;
                    position: absolute;
                      top:0;
                      left:0;
                      right:0;
                      bottom:0;"
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
                    <div
                      class="border-rounded"
                      style="height:18px; display:inline-flex; background-color:var(--background-color);"
                    >
                      <span style="font-size:10px; margin:4px;"
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
            </div>
            {#if pairs.length - 1 != index}
              <div class="h-75 pe-1">
                <button class="bg-backgroundColor border-0" style="width:40px;">
                  <img
                    src={trashIcon}
                    on:click={() => {
                      deleteParam(index);
                    }}
                    alt=""
                  />
                </button>
              </div>
            {:else}
              <div class="h-75 pe-1">
                <button class="bg-backgroundColor border-0" style="width:40px;">
                  <img src="" alt="" />
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
