<script lang="ts">
  import { onMount } from "svelte";
  import { TabularInput } from "@sparrow/workspaces/components";
  import { createDeepCopy } from "@sparrow/common/utils";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events, ItemType } from "@sparrow/common/enums";
  import { extractQueryParams } from "../../../../../../@sparrow-common/src/utils/testFlow.helper";
  import {
    addDynamicExpressionContent,
    isDynamicExpressionModalOpen,
  } from "../../store";
  import {
    isDynamicExpressionContent,
    updateIsCurrentExpression,
  } from "../../store";

  export let requestUrl;
  export let selectedBlock;
  export let params;
  export let environmentVariables;
  export let authParameter;
  let isBulkEditRequired = false;
  export let onUpdateRequestState;
  export let isBulkEditActive;
  let bulkEditParamsPlaceholder =
    "Usage - Manage multiple parameters.  Format - Key: Value";
  let queryParams = params;
  // let bulkEditParamsPlaceholder = `Usage: Use bulk edit to manage multiple parameters quickly.Separate each entry with a new line.
  // Format: Parameter-Key: Parameter-Value
  // Example: userID: Sparrow12 `;

  /**
   * Handles changes to query parameters.
   * - Updates `queryParams` in state.
   * - Builds query string from checked pairs.
   * - Updates the `requestUrl` accordingly.
   *
   * @param {KeyValuePair[]} pairs - Array of key-value pairs with isChecked flag.
   */
  const handleParamsChange = (pairs: KeyValuePair[]): void => {
    onUpdateRequestState("queryParams", pairs);

    const queryString = pairs
      .filter((pair) => pair.key.trim() !== "" && pair.checked === true)
      .map(
        (pair) =>
          `${encodeURIComponent(pair.key)}=${encodeURIComponent(pair.value)}`,
      )
      .join("&");

    const baseUrl = requestUrl.split("?")[0];
    const updatedUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    onUpdateRequestState("url", updatedUrl);
  };

  const toggleBulkEdit = (value: boolean) => {
    MixpanelEvent(Events.Bulk_Edit_Parameters);
    onUpdateRequestState({ isParameterBulkEditActive: value });
  };

  const setInitialParams = () => {
    const urlParams = extractQueryParams(requestUrl);
    const mergedArray = params;
    const keyWithValues = $isDynamicExpressionContent.filter((item) => {
      return (
        item?.blockName === selectedBlock?.data?.blockName &&
        item?.requestType === "queryParams" &&
        item?.method === "request"
      );
    });
    // Add params only if key doesn't already exist
    for (const param of urlParams) {
      if (
        param.key.trim() !== "" &&
        !mergedArray.some(
          (ele: object) => ele?.key.trim() !== param?.key.trim(),
        )
      ) {
        mergedArray.push({
          key: param.key,
          value: param.value,
          checked: param.checked,
        });
      }
    }

    for (const param of mergedArray) {
      const cleanedValue = param.value
        .replace(/\[\[.*?\]\]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      param.value = cleanedValue;
    }

    // Add the Dynamic expression value
    for (const dynamicParam of keyWithValues) {
      if (dynamicParam.key.trim() !== "" && dynamicParam.value.trim() !== "") {
        const existingParam = mergedArray.find(
          (ele) => ele?.key.trim() === dynamicParam.key.trim(),
        );

        if (existingParam) {
          // Step 1: Remove any existing [[...]] part from the value (if it exists)
          const cleanedValue = existingParam.value
            .replace(/\[\[.*?\]\]/g, "")
            .trim();

          // Step 2: Check if the dynamic value already exists in the cleaned value
          const newDynamicValue = `[[${dynamicParam.value}]]`;

          // Step 3: Only add the value with [[...]] if it doesn't already exist
          existingParam.value = cleanedValue
            ? `${cleanedValue} ${newDynamicValue}`
            : newDynamicValue;
        }
      }
    }

    // If nothing found, add an empty param
    if (mergedArray.length === 0) {
      queryParams = [{ key: "", value: "", checked: true }];
    }

    handleParamsChange(mergedArray);
  };

  onMount(() => {
    if (requestUrl !== "") {
      setInitialParams();
    }
  });

  function generateUniqueId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }

  const checkIfExists = (
    id: string,
    blockName: string,
    requestType: string,
    key: string,
    method: string,
    index: number,
  ) => {
    const items = $isDynamicExpressionContent;
    return items.some(
      (item) =>
        item.blockName === blockName &&
        item.requestType === requestType &&
        item.key === key &&
        item.method === method &&
        item.index === index,
    );
  };

  const handleDynamicExpression = (key: string, index: number, id: string) => {
    if (id) {
      if (
        checkIfExists(
          id,
          selectedBlock?.data?.blockName,
          "queryParams",
          key,
          "request",
          index,
        )
      ) {
        updateIsCurrentExpression(
          id,
          selectedBlock?.data?.blockName,
          "queryParams",
          "request",
          key,
          index,
        );
        return;
      }
    }
    addDynamicExpressionContent(
      generateUniqueId(),
      selectedBlock?.data?.blockName,
      "queryParams",
      key,
      "",
      "request",
      index,
      true,
    );
  };

  const handleRemoveDynamicExpression = (
    key: string,
    index: number,
    id: string,
  ) => {
    const updatedItems = $isDynamicExpressionContent.filter(
      (item) =>
        !(
          item?.id === id &&
          item?.blockName === selectedBlock?.data?.blockName &&
          item?.requestType === "queryParams" &&
          item?.method === "request" &&
          item?.key === key &&
          item?.index === index
        ),
    );

    isDynamicExpressionContent.set(updatedItems);
  };

  const handleOpenCurrentDynamicExpression = (
    key: string,
    index: number,
    id: string,
  ) => {
    const itemIndex = $isDynamicExpressionContent.findIndex(
      (item) =>
        item?.id === id &&
        item?.blockName === selectedBlock?.data?.blockName &&
        item?.requestType === "queryParams" &&
        item?.method === "request" &&
        item?.key === key &&
        item?.index === index,
    );
    if (itemIndex !== -1) {
      const updatedItem = {
        ...$isDynamicExpressionContent[itemIndex],
        isCurrentOpen: true,
      };

      // Create a new array with the updated item
      $isDynamicExpressionContent = [
        ...$isDynamicExpressionContent.slice(0, itemIndex),
        updatedItem,
        ...$isDynamicExpressionContent.slice(itemIndex + 1),
      ];
    }
    $isDynamicExpressionModalOpen = true;
  };

  let DynamicExpressionParams;

  const getDEByKeyAndValue = (
    key: string,
    value: string,
    index: number,
    blockName: string,
  ): any => {
    const data = $isDynamicExpressionContent?.filter(
      (item: any) =>
        item?.requestType === "queryParams" &&
        item?.method === "request" &&
        item?.blockName === blockName &&
        item?.key === key &&
        item?.index === index,
    );
    return data;
  };

  const handleDynamicNewExpression = (key: string, index: number) => {
    addDynamicExpressionContent(
      generateUniqueId(),
      selectedBlock?.data?.blockName,
      "queryParams",
      key,
      "",
      "request",
      index,
      true,
    );
  };

  const handleRemoveDynamicExpressionKey = (key: string, index: number) => {
    const updatedItems = $isDynamicExpressionContent.filter(
      (item) =>
        !(
          item?.blockName === selectedBlock?.data?.blockName &&
          item?.requestType === "queryParams" &&
          item?.method === "request" &&
          item?.key === key &&
          item?.index === index
        ),
    );

    isDynamicExpressionContent.set(updatedItems);
  };

  $: {
    const paramsWithDE = $isDynamicExpressionContent.filter(
      (item) =>
        item?.blockName === selectedBlock?.data?.blockName &&
        item?.requestType === "queryParams" &&
        item?.method === "request",
    );
    // Now create the final params array
    DynamicExpressionParams = params.map((param: any) => {
      const matchingDE = paramsWithDE.filter(
        (deItem) => deItem.key === param.key,
      );
      return {
        ...param,
        DE: matchingDE,
      };
    });
  }

  isDynamicExpressionContent.subscribe(() => {
    setInitialParams();
  });
</script>

<section class="w-100" style="">
  <TabularInput
    isInputBoxEditable={true}
    isCheckBoxEditable={true}
    isTopHeaderRequired={true}
    {isBulkEditRequired}
    bulkEditPlaceholder={bulkEditParamsPlaceholder}
    {isBulkEditActive}
    onToggleBulkEdit={toggleBulkEdit}
    readable={authParameter}
    keyValue={createDeepCopy(params)}
    callback={handleParamsChange}
    onUpdateEnvironment={() => {}}
    {environmentVariables}
    dynamicExpression={true}
    {getDEByKeyAndValue}
    blockName={selectedBlock?.data?.blockName}
    {handleDynamicExpression}
    {handleRemoveDynamicExpression}
    {handleOpenCurrentDynamicExpression}
    {handleDynamicNewExpression}
    {handleRemoveDynamicExpressionKey}
  />
</section>
