<script lang="ts">
  import { infoColorBlueIcon as infoIcon } from "@sparrow/library/assets";
  import { crossIcon } from "@sparrow/library/assets";
  import { RequestDataset } from "@sparrow/common/enums";
  import { notifications } from "@sparrow/library/ui";
  import { WithSelect } from "@sparrow/workspaces/hoc";
  import { beautifyIcon as BeautifyIcon } from "@sparrow/library/assets";
  import {
    requestBodySubTypes,
    requestBodyTypes,
  } from "../../../../../../../../@sparrow-common/src/utils/testFlow.helper";
  import { MathFormulaRegular } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import {
    addDynamicExpressionContent,
    isDynamicExpressionContent,
    isDynamicExpressionModalOpen,
    requestBodyCursorPosition,
  } from "../../../../store";

  export let method = "GET";
  export let onUpdateRequestState;
  export let onUpdateRequestBodyLanguage;
  export let updateBeautifiedState: (value: boolean) => void;
  export let requestState;
  export let selectedBlock;

  let handleDropdown = (tab: string) => {
    onUpdateRequestState("requestBodyNavigation", tab);
  };

  let handleRawDropDown = (tab: string) => {
    onUpdateRequestBodyLanguage("requestBodyLanguage", tab);
  };

  const generateUniqueId = () => {
    return "_" + Math.random().toString(36).substr(2, 9);
  };

  const createDynamicExpression = () => {
    const currentCursor = $requestBodyCursorPosition;
    const blockName = selectedBlock?.data?.blockName;

    if (!blockName) return;

    const matchingCursor = currentCursor.find(
      (item) => item.blockName === blockName,
    );
    const cursor = matchingCursor?.cursor ?? 0;

    const existingIndex = $isDynamicExpressionContent.findIndex(
      (item) =>
        item.blockName === blockName &&
        item.requestType === "body.raw" &&
        item.method === "request" &&
        item.cursor === cursor,
    );

    if (existingIndex !== -1) {
      const updated = [...$isDynamicExpressionContent];
      updated[existingIndex] = {
        ...updated[existingIndex],
        isCurrentOpen: true,
      };
      isDynamicExpressionContent.set(updated);
    } else {
      addDynamicExpressionContent(
        generateUniqueId(),
        blockName,
        "body.raw",
        "",
        "",
        "request",
        0,
        true,
        cursor,
      );
    }
    $isDynamicExpressionModalOpen = true;
  };

  let isDeleteMessage = true;
  let isGetMessage = true;
</script>

<div>
  {#if method === "GET" && isGetMessage && false}
    <div class="d-flex error-message py-1 mb-2">
      <div class="info-button d-flex align-items-center justify-content-center">
        <img src={infoIcon} alt="info" />
      </div>
      <small class="w-100"
        >For GET requests, it's uncommon to use a request body. Some frameworks
        support the request body for GET method, but it is generally not
        recommended to use.</small
      >
      <div
        class="cross-button d-flex align-items-center justify-content-center"
      >
        <img
          src={crossIcon}
          alt="info"
          class="cursor-pointer"
          on:click={() => {
            isGetMessage = false;
          }}
        />
      </div>
    </div>
  {:else if method === "DELETE" && isDeleteMessage && false}
    <div class="d-flex error-message py-1 mb-2">
      <div class="info-button d-flex align-items-center justify-content-center">
        <img src={infoIcon} alt="info" />
      </div>
      <small class="w-100"
        >For DELETE requests, it's uncommon to use a request body. Some
        frameworks support the request body for DELETE method, but it is
        generally not recommended to use.</small
      >
      <div
        class="cross-button d-flex align-items-center justify-content-center"
      >
        <img
          src={crossIcon}
          alt="info"
          class="cursor-pointer"
          on:click={() => {
            // deleteMessage = false;
            isDeleteMessage = false;
          }}
        />
      </div>
    </div>
  {/if}
</div>
<div
  class="mb-2 d-flex align-items-center justify-content-between"
  style="gap: 24px;"
>
  <div class="d-flex" style="font-size: 12px;">
    <WithSelect
      id={"hash124"}
      data={requestBodyTypes}
      titleId={requestState.requestBodyNavigation}
      onclick={handleDropdown}
      zIndex={499}
      minHeaderWidth={"101px"}
      disabled={false}
    />
    <span class="pe-3" />
    {#if requestState.requestBodyNavigation === RequestDataset.RAW}
      <WithSelect
        id={"hash987"}
        data={requestBodySubTypes}
        titleId={requestState.requestBodyLanguage}
        onclick={handleRawDropDown}
        zIndex={499}
        minHeaderWidth={"101px"}
        disabled={false}
      />
    {/if}
  </div>

  <div class="d-flex justify-content-end gap-2">
    <div class="d-flex">
      <Button
        size="small"
        type="teritiary-regular"
        title="Insert Dynamic Content"
        startIcon={MathFormulaRegular}
        onClick={() => {
          createDynamicExpression();
        }}
      />
    </div>
    <div>
      {#if requestState.requestBodyNavigation === RequestDataset.RAW}
        <div
          on:click={() => {
            updateBeautifiedState(true);
            notifications.success("Code formatted successfully.");
          }}
          role="button"
          class="icon-container d-flex align-items-center justify-content-center border-radius-2"
        >
          <img src={BeautifyIcon} style="height:10px; width:10px;" />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .error-message {
    background-color: #11253a;
  }
  .error-message small {
    font-size: 12px;
  }
  .info-button,
  .cross-button {
    width: 36px;
  }

  .icon-container {
    height: 24px;
    width: 24px;
  }
  .icon-container:hover {
    background-color: var(--bg-secondary-550);
  }
  .icon-container:active {
    background-color: var(--bg-secondary-600);
  }
</style>
