<script lang="ts">
  import { Button, Navigator, Tooltip } from "@sparrow/library/ui";
  import { ExpressionEditor } from "../components";
  import { TFDynamicExpressionTabsEnum } from "@sparrow/common/types/workspace/testflow";
  import { InfoRegular } from "@sparrow/library/icons";
  import { onMount } from "svelte";
  import DynamicContent from "../components/dynamic-content/DynamicContent.svelte";
  import FunctionsOptions from "../components/function-options/FunctionsOptions.svelte";
  import { isDynamicExpressionContent } from "../../testflow-explorer/store";

  export let requestApis: any;
  export let environmentVariables: any;
  export let dynamicExpressionEditorContent;
  export let onInsertExpression;
  let expression = dynamicExpressionEditorContent;
  export let handleAddingNested: (value: string) => void;
  export let selectedBlock;

  export let onPreviewExpression;

  let currentTabId: TFDynamicExpressionTabsEnum =
    TFDynamicExpressionTabsEnum.DYNAMICCONTENT;

  let tabs: {
    name: string;
    id: TFDynamicExpressionTabsEnum;
    count: number;
  }[] = [];

  const refreshTabs = () => [
    {
      name: "Dynamic Content",
      id: TFDynamicExpressionTabsEnum.DYNAMICCONTENT,
      count: 0,
    },
    {
      name: "Functions",
      id: TFDynamicExpressionTabsEnum.FUNCTIONS,
      count: 0,
    },
  ];

  let responseNavigation = "Dynamic Content";
  let selectedApiRequestType: string = "";

  onMount(() => {
    tabs = refreshTabs();
  });

  const onTabClick = (tabId: TFDynamicExpressionTabsEnum) => {
    currentTabId = tabId;
    updateExpressionNavigation(tabId);
  };

  const updateExpressionNavigation = (tab: TFDynamicExpressionTabsEnum) => {
    if (tab === TFDynamicExpressionTabsEnum.DYNAMICCONTENT) {
      responseNavigation = "Dynamic Content";
    } else if (tab === TFDynamicExpressionTabsEnum.FUNCTIONS) {
      responseNavigation = "Functions";
    }
  };
  $: currentOpenItem = $isDynamicExpressionContent.find(
    (item) => item.isCurrentOpen,
  );
  let cursorPosition: number | null = 0;
</script>

<div class="d-flex justify-content-between" style="gap: 12px;">
  <div class="w-50">
    <ExpressionEditor
      bind:expression
      {onPreviewExpression}
      {handleAddingNested}
      bind:selectedApiRequestType
      bind:cursorPosition
    />
  </div>
  <div class="w-50">
    <div class="dynamic-content-container d-flex flex-column" style="gap:16px;">
      <div class="d-flex justify-content-between align-items-center">
        <Navigator {tabs} {currentTabId} {onTabClick} />
        <Tooltip
          title="Use previous API requests, functions and variables to build custom expressions. Click items to insert them into the editor."
          placement="bottom-center"
          size="small"
        >
          <Button type="secondary" startIcon={InfoRegular} size="small" />
        </Tooltip>
      </div>
      <div>
        {#key currentTabId}
          {#if currentTabId === TFDynamicExpressionTabsEnum.DYNAMICCONTENT}
            <DynamicContent
              bind:expression
              {selectedBlock}
              {requestApis}
              {environmentVariables}
              bind:selectedApiRequestType
              bind:cursorPosition
            />
          {:else if currentTabId === TFDynamicExpressionTabsEnum.FUNCTIONS}
            <FunctionsOptions bind:expression />
          {/if}
        {/key}
      </div>
    </div>
  </div>
</div>
<div
  class="d-flex flex-row justify-content-between align-items-center"
  style="margin-top: 24px;"
>
  <div>
    <!-- <p style="margin: 0px;">
      {currentOpenItem?.blockName} > {currentOpenItem?.method} > {currentOpenItem?.requestType}
      > {currentOpenItem?.key}
    </p> -->
  </div>
  <div>
    <Button
      title="Insert Dynamic Content"
      type="primary"
      size="medium"
      onClick={() => {
        onInsertExpression(expression);
      }}
    />
  </div>
</div>

<style>
  .dynamic-content-container {
    background-color: var(--bg-ds-surface-500);
    padding: 12px;
    border-radius: 4px;
    height: "440px";
  }
</style>
