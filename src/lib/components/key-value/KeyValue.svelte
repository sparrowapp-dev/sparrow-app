<script lang="ts">
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import type { KeyValuePair } from "$lib/utils/interfaces/request.interface";

  type Mode = "READ" | "WRITE";

  export let keyValue: KeyValuePair[];
  export let callback: (pairs: KeyValuePair[]) => void;
  export let mode: Mode = "WRITE";
  export let readable: { key: string; value: string } = {
    key: "",
    value: "",
  };

  let pairs: KeyValuePair[] = keyValue;
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
    if (pairs.length - 1 === index) {
      pairs.push({ key: "", value: "", checked: false });
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
    {#if readable.key || readable.value}
      <div
        aria-label="Toggle Hover"
        class="sortable > div"
        style="cursor:default; width:100%;"
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

            <div class="w-100 d-flex gap-2">
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Key"
                  class="form-control bg-keyValuePairColor py-1 border-0"
                  style="font-size: 13px;"
                  disabled
                  bind:value={readable.key}
                />
              </div>
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Value"
                  class="form-control bg-keyValuePairColor py-1 border-0"
                  style="font-size: 13px;"
                  disabled
                  bind:value={readable.value}
                />
              </div>
            </div>
            <div class="h-75 pe-1">
              <button class="bg-backgroundColor border-0" style="width:40px;" />
            </div>
          </div>
        </div>
      </div>
    {/if}
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

            <div class="w-100 d-flex gap-2">
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Key"
                  class="form-control bg-keyValuePairColor py-1 border-0"
                  style="font-size: 13px;"
                  disabled={mode == "READ" ? true : false}
                  bind:value={element.key}
                  on:input={() => {
                    updateParam(index);
                  }}
                />
              </div>
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Value"
                  class="form-control bg-keyValuePairColor py-1 border-0"
                  style="font-size: 13px;"
                  disabled={mode == "READ" ? true : false}
                  bind:value={element.value}
                  on:input={() => {
                    updateParam(index);
                  }}
                />
              </div>
            </div>
            {#if pairs.length - 1 != index}
              <div class="h-75 pe-1">
                <button class="bg-backgroundColor border-0" style="width:40px;">
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
