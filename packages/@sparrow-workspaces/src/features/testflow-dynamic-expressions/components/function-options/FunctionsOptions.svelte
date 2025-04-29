<script lang="ts">
  import { Search } from "@sparrow/library/forms";
  import { AddRegular } from "@sparrow/library/icons";
  import { FunctionOptionData } from "../../utils";

  let data = FunctionOptionData;
  export let handleFunctionType: (label: string, data: any) => void;
  let searchFunction = "";
  $: filteredData = searchFunction
    ? data.filter(
        (item) =>
          item.type.toLowerCase().includes(searchFunction.toLowerCase()) ||
          item.description.toLowerCase().includes(searchFunction.toLowerCase()),
      )
    : data;
</script>

<div class="functions-container d-flex flex-column">
  <Search placeholder="Search" variant="primary" bind:value={searchFunction} />
  <div class="functions-items-container" style="overflow-y:auto; gap:2px;">
    {#each filteredData as item}
      <div
        class="function-item d-flex flex-row justify-content-between align-items-center"
        on:click={() => {
          handleFunctionType(item.type, item);
        }}
      >
        <div class="d-flex justify-content-start flex-column">
          <p style="margin: 0px;" class="function-item-title">{item.type}</p>
          <p style="margin: 0px;" class="function-item-description">
            {item.description}
          </p>
        </div>
        <div style="margin-right: 6px;">
          <AddRegular size="16px" color="var(--icon-ds-neutral-50)" />
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .functions-items-container {
    border: 1px solid var(--bg-ds-surface-100);
    height: 334px;
    border-radius: 4px;
    padding: 8px;
    overflow-y: auto;
    overflow: hidden;
  }

  .functions-container {
    gap: 8px;
  }

  .function-item {
    padding: 4px 8px;
    height: 44px;
    border-radius: 4px;
    background-color: var(--bg-ds-surface-600);
  }
  .function-item:hover {
    background-color: var(--bg-ds-surface-400);
  }
  .function-item:active {
    background-color: var(--bg-ds-surface-700);
  }
  .function-item-title {
    font-family: "JetBrains Mono", monospace;
    color: var(--text-ds-neutral-50);
    font-weight: 400;
    font-size: 12px;
    line-height: 150%;
    letter-spacing: 0;
  }
  .function-item-description {
    font-family: "Inter", sans-serif;
    color: var(--text-ds-neutral-300);
    font-weight: 400;
    font-size: 12px;
    line-height: 143%;
    letter-spacing: 0;
  }
</style>
