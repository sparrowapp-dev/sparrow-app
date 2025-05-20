<script lang="ts">
  import { Button, Navigator, Tooltip } from "@sparrow/library/ui";
  import { ExpressionEditor } from "../components";
  import { TFDynamicExpressionTabsEnum } from "@sparrow/common/types/workspace/testflow";
  import { InfoRegular } from "@sparrow/library/icons";
  import { onMount } from "svelte";
  import DynamicContent from "../components/dynamic-content/DynamicContent.svelte";
  import FunctionsOptions from "../components/function-options/FunctionsOptions.svelte";
  import { isDynamicExpressionContent } from "../../testflow-explorer/store";
  import { captureEvent } from "@app/utils/posthog/posthogConfig";

  export let requestApis: any;
  export let environmentVariables: any;
  export let dynamicExpressionEditorContent;
  export let onInsertExpression;
  let expression = dynamicExpressionEditorContent;
  export let handleAddingNested: (value: string) => void;
  export let selectedBlock;
  export let edges;
  export let onPreviewExpression;
  export let dynamicExpressionPath: string = "";

  let dispatcher;

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
  $: {
    if (
      dynamicExpressionPath === "raw" ||
      dynamicExpressionPath === "urlencoded" ||
      dynamicExpressionPath === "formdata"
    ) {
      dynamicExpressionPath = "body" + " > " + dynamicExpressionPath;
    }
  }

  const getFirstMatchingType = (expression: string) => {
    const types = [
      "response.body",
      "response.header",
      "request.body",
      "request.header",
      "request.parameter",
      "variable",
    ];
    for (const type of types) {
      if (expression.includes(type)) {
        return type;
      }
    }
    return null;
  };

  const handleEventOnClickInsertDE = () => {
    captureEvent("expression_inserted", {
      component: "TestFlowDynamicExpression",
      buttonText: "Insert Dynamic Expression",
      sourceLocation: `${dynamicExpressionPath}`,
      insertType: getFirstMatchingType(expression),
    });
  };
</script>

<div class="d-flex justify-content-between" style="gap: 12px; margin-top:16px;">
  <div class="w-50">
    <ExpressionEditor
      bind:expression
      {onPreviewExpression}
      {handleAddingNested}
      bind:selectedApiRequestType
      bind:dispatcher
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
              bind:dispatcher
              {edges}
            />
          {:else if currentTabId === TFDynamicExpressionTabsEnum.FUNCTIONS}
            <FunctionsOptions bind:expression bind:dispatcher />
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
    <p style="margin: 0px;" class="dynamic-path-title">
      Location: {selectedBlock?.data?.blockName} > {dynamicExpressionPath}
    </p>
  </div>
  <div>
    <Button
      title="Insert Dynamic Content"
      type="primary"
      disable={!expression}
      size="medium"
      onClick={() => {
        handleEventOnClickInsertDE();
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
    /* height: "440px"; */
  }
  .dynamic-path-title {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 1.5;
    letter-spacing: 0px;
    color: #82858a;
  }
</style>
