<script lang="ts">
  import { trashIcon } from "@sparrow/library/assets";
  import { Input, Switch } from "@sparrow/library/forms";
  import { Tooltip } from "@sparrow/library/ui";
  // Initialize with one empty entry with a unique ID

  export let callback;

  export let pairs = [{ id: 1, inputValue: "", checked: false }];

  const updateParam = (index: number): void => {
    pairs = pairs;
    if (
      pairs.length - 1 === index &&
      // although in readonly mode input is disabled
      // but codemirror internally invokes this function and updates key value
      // so one more extra check here for read only mode
      isInputBoxEditable &&
      (pairs[index].key !== "" || pairs[index].value !== "")
    ) {
      pairs[pairs.length - 1].checked = true;
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
</script>

<div style="background-color: #161617;">
  {#each pairs as event, index (event.id)}
    <div
      class="ps-4 pe-2 d-flex justify-content-between align-items-center bg-secondary-700 w-100"
      style="font-size: 12px; font-weight: 500; margin-bottom: 4px;"
    >
      <div
        class="position-relative w-50 d-flex justify-content-between align-items-center"
      >
        <div class="w-100 me-2 ms-1">
          <Input
            id={`environment-search-${event.id}`}
            type="text"
            bind:value={event.inputValue}
            on:input={(e) => updateParam(index)}
            width={"100%"}
            height={"20px"}
            class="text-fs-12 me-5 bg-secondary-600"
            style="outline:none; background-color:transparent;"
            placeholder="Name"
            defaultBorderColor="transparent"
            hoveredBorderColor={"var(--border-primary-300)"}
            focusedBorderColor={"var(--border-primary-300)"}
            isEditIconRequired={false}
          />
        </div>
        <div class="me-1 mt-1">
          <Switch checked={event.checked} on:click={() => updateCheck(index)} />
        </div>
      </div>

      {#if index !== pairs.length - 1}
        <Tooltip title={"Delete"} placement={"bottom-left"} distance={10}>
          <button
            class="bg-secondary-700 d-flex justify-content-center align-items-center border-0"
            style="width: 24px; height:16px; padding-end"
            on:click={() => deleteParam(index)}
          >
            <img class="trash-icon" src={trashIcon} alt="" />
          </button>
        </Tooltip>
      {:else}
        <div style="width: 16px;"></div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .trash-icon:hover {
    background-color: var(--bg-secondary-500);
  }
</style>
