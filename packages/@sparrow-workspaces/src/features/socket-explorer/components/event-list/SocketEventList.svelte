<script lang="ts">
  import { trashIcon } from "@sparrow/library/assets";
  import { Input, Switch } from "@sparrow/library/forms";
  import { Tooltip } from "@sparrow/library/ui";

  // Initialize with one empty entry with a unique ID
  let events = [{ id: 1, inputValue: "", checked: false }];

  function handleInputChange(index, value) {
    events = events.map((entry, i) =>
      i === index ? { ...entry, inputValue: value } : entry,
    );
  }

  function handleSwitchChange(index) {
    events = events.map((entry, i) =>
      i === index ? { ...entry, checked: !entry.checked } : entry,
    );
  }

  function deleteEntry(index) {
    // Remove the entry at the specified index
    events = events.filter((_, i) => i !== index);

    // Ensure there’s always an empty entry at the end if list is not empty
    if (events.length === 0 || events[events.length - 1].inputValue !== "") {
      events = [...events, { id: Date.now(), inputValue: "", checked: false }];
    }
  }

  function addEmptyEntry() {
    events = [...events, { id: Date.now(), inputValue: "", checked: false }];
  }

  $: {
    if (events && events.length > 0) {
      const lastEntry = events[events.length - 1];
      if (lastEntry && lastEntry.inputValue !== "") {
        addEmptyEntry();
      }
    } else if (!events.length) {
      addEmptyEntry();
    }
  }
</script>

<div style="background-color: #161617;">
  {#each events as entry, index (entry.id)}
    <div
      class="ps-4 pe-2 d-flex justify-content-between align-items-center bg-secondary-700 w-100"
      style="font-size: 12px; font-weight: 500; margin-bottom: 4px;"
    >
      <div
        class="position-relative w-50 d-flex justify-content-between align-items-center"
      >
        <div class="w-100 me-2 ms-1">
          <Input
            id={`environment-search-${entry.id}`}
            type="text"
            bind:value={entry.inputValue}
            on:input={(e) => handleInputChange(index, e.target.value)}
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
          <Switch
            checked={entry.checked}
            on:click={() => handleSwitchChange(index)}
          />
        </div>
      </div>

      {#if index !== events.length - 1}
        <Tooltip title={"Delete"} placement={"bottom-left"} distance={10}>
          <button
            class="bg-secondary-700 d-flex justify-content-center align-items-center border-0"
            style="width: 24px; height:16px; padding-end"
            on:click={() => deleteEntry(index)}
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
