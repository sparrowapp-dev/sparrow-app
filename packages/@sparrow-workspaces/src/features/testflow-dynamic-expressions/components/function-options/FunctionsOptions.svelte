<script lang="ts">
  import { Search } from "@sparrow/library/forms";
  import { AddRegular } from "@sparrow/library/icons";
  import { FunctionOptionData } from "../../utils";
  import { captureEvent } from "@app/utils/posthog/posthogConfig";

  export let expression: string;
  export let cursorPosition: number | null;
  let data = FunctionOptionData;
  let hoveredFunctionType: string | null = null;
  let searchFunction = "";
  $: filteredData = searchFunction
    ? data.filter(
        (item) =>
          item.type.toLowerCase().includes(searchFunction.toLowerCase()) ||
          item.description.toLowerCase().includes(searchFunction.toLowerCase()),
      )
    : data;

  const handleFunctionType = (functionItem: any) => {
    if (cursorPosition && cursorPosition < expression.length) {
      expression =
        expression.slice(0, cursorPosition) +
        functionItem.type +
        expression.slice(cursorPosition);
      return;
    } else if (expression.endsWith(".")) {
      expression += functionItem.type;
    } else {
      expression += "." + functionItem.type;
    }
  };

  const handleEventOnSelectFunction = (
    funtionType: string,
    category_name: string | undefined,
  ) => {
    captureEvent("function_inserted", {
      component: "FunctionOptions",
      function_name: funtionType,
      category_name: category_name,
    });
  };
</script>

<div class="functions-container d-flex flex-column">
  <Search placeholder="Search" variant="primary" bind:value={searchFunction} />
  <div class="functions-items-container" style="overflow-y:auto; gap:2px;">
    {#each filteredData as item}
      <div
        class="function-item d-flex flex-row justify-content-between align-items-center"
        on:mouseenter={() => (hoveredFunctionType = item.type)}
        on:mouseleave={() => (hoveredFunctionType = null)}
        on:click={() => {
          handleEventOnSelectFunction(item?.type, item?.category);
          handleFunctionType(item);
        }}
      >
        <div class="d-flex justify-content-start flex-column">
          <p style="margin: 0px;" class="function-item-title">{item.type}</p>
          <p style="margin: 0px;" class="function-item-description">
            {item.description}
          </p>
        </div>
        {#if hoveredFunctionType === item.type}
          <div style="margin-right: 6px;">
            <AddRegular size="16px" color="var(--icon-ds-neutral-50)" />
          </div>
        {/if}
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
