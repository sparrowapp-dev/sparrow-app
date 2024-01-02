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

  let trackParanthesis: unknown[] = [];
  let trackCursor: number;
  let tempText = "";
  let focusedInput;
  let focusedElement;
  const mockData = [
    {
      key: "asus",
      value: "val asus",
      type: "G",
      environment: "Global Variables",
    },
    {
      key: "dell",
      value: "val dell",
      type: "E",
      environment: "NT Variables",
    },
    {
      key: "lenovo",
      value: "val lenovo",
      type: "E",
      environment: "NJ Variables",
    },
  ];

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

  let filterData = [];
  const filterEnvironments = () => {
    filterData = mockData.filter((element) => {
      if (
        element.key
          .toLowerCase()
          .includes(
            tempText
              ?.substring(trackParanthesis[1] + 1, trackCursor)
              .toLowerCase(),
          )
      ) {
        return true;
      }
    });
  };
  $: {
    if (trackCursor) {
      if (trackParanthesis.length === 2) filterEnvironments();
    }
    if (trackParanthesis) {
      if (trackParanthesis.length === 2 && trackCursor) filterEnvironments();
    }
  }

  const balanceParanthesis = (url: string) => {
    const stack = [];
    let response: unknown[] = [];
    for (let i = 0; i < url.length; i++) {
      if (url[i] === "{") {
        stack.push({
          index: i,
          character: "{",
        });
      } else if (url[i] === "}") {
        stack.pop();
      }
    }
    if (
      stack.length >= 1
      //  && stack[1].character === "{"
    ) {
      response = [stack[0].index, stack[stack.length - 1].index];
    }
    return response;
  };

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

  const func = (event) => {
    trackCursor = event.target.selectionStart;
    console.log("cursor", trackCursor);
  };
  let handleInputValue = () => {
    trackParanthesis = balanceParanthesis(tempText);
    console.log(trackParanthesis);
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
            <img
              src={dragIcon}
              alt=""
              class="d-none"
              style="cursor:grabbing;"
            />
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
        class="sortable > div position-relative"
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
                    tempText = element.key;
                    handleInputValue();
                  }}
                  on:keyup={(e) => {
                    func(e);
                  }}
                  on:blur={() => {
                    setTimeout(() => {
                      tempText = "";
                      trackParanthesis = [];
                      trackCursor = undefined;
                      filterData = [];
                    }, 200);
                  }}
                  on:focus={(e) => {
                    tempText = element.key;
                    focusedInput = index;
                    focusedElement = "key";
                    handleInputValue();
                  }}
                />
                {#if focusedInput === index && focusedElement === "key" && trackParanthesis.length === 2 && filterData.length > 0}
                  <div class="select-environment-popup d-flex p-3">
                    <div class="left-panel w-50">
                      {#each filterData as mock}
                        <p
                          on:click={() => {
                            const preUrl = element.key?.substring(
                              0,
                              trackParanthesis[0],
                            );
                            const postUrl = element.key?.substring(
                              trackCursor,
                              element.key.length,
                            );
                            element.key =
                              preUrl + "{{" + mock.key + "}}" + postUrl;
                            updateParam(index);
                            handleInputValue;
                          }}
                        >
                          <span>{mock.type}</span>
                          <span>{mock.key}</span>
                        </p>
                      {/each}
                    </div>
                    <div class="right-panel w-50">
                      <p>ENVIRONMENT</p>
                      <p>VALUE</p>
                    </div>
                    <div class="w-100">
                      <p>
                        showing Dev environment variables and Global variables
                      </p>
                    </div>
                  </div>
                {/if}
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
                    tempText = element.value;
                    handleInputValue();
                  }}
                  on:keyup={(e) => {
                    func(e);
                  }}
                  on:blur={() => {
                    setTimeout(() => {
                      tempText = "";
                      trackParanthesis = [];
                      trackCursor = undefined;
                      filterData = [];
                    }, 200);
                  }}
                  on:focus={(e) => {
                    tempText = element.value;
                    focusedInput = index;
                    focusedElement = "value";
                    handleInputValue();
                  }}
                />
                {#if focusedInput === index && focusedElement === "value" && trackParanthesis.length === 2 && filterData.length > 0}
                  <div class="select-environment-popup d-flex p-3">
                    <div class="left-panel w-50">
                      {#each filterData as mock}
                        <p
                          on:click={() => {
                            const preUrl = element.value?.substring(
                              0,
                              trackParanthesis[0],
                            );
                            const postUrl = element.value?.substring(
                              trackCursor,
                              element.value.length,
                            );
                            element.value =
                              preUrl + "{{" + mock.key + "}}" + postUrl;
                            updateParam(index);
                            handleInputValue;
                          }}
                        >
                          <span>{mock.type}</span>
                          <span>{mock.key}</span>
                        </p>
                      {/each}
                    </div>
                    <div class="right-panel w-50">
                      <p>ENVIRONMENT</p>
                      <p>VALUE</p>
                    </div>
                    <div class="w-100">
                      <p>
                        showing Dev environment variables and Global variables
                      </p>
                    </div>
                  </div>
                {/if}
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

<style>
  .select-environment-popup {
    width: 400px;
    height: 300px;
    position: absolute;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background-color: black;
    z-index: 5;
    flex-wrap: wrap;
  }
  .select-environment-popup .left-panel {
    height: 300px;
  }
  .select-environment-popup .right-panel {
    height: 300px;
  }
</style>
