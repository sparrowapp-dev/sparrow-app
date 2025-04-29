<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import {
    isDynamicExpressionContent,
    addDynamicExpressionContent,
    updateIsCurrentExpression,
    requestBodyCursorPosition,
  } from "../../../../store";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let isBodyBeautified = false;
  export let onUpdateRequestBody: (data: string) => void = () => {};
  export let updateBeautifiedState: (value: boolean) => void;
  export let selectedBlock;

  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    const originalValue = e.detail;

    // Filter only valid dynamic expression items
    const deItems = $isDynamicExpressionContent.filter(
      (item) =>
        item?.blockName === selectedBlock?.data?.blockName &&
        item?.requestType === "body.raw" &&
        item?.method === "request" &&
        item?.value?.trim() !== "",
    );

    // Step 1: Clean the original string by removing ALL existing [[...]] patterns
    const cleanedValue = originalValue.replace(/\[\[.*?\]\]/g, "");

    // Step 2: Insert expressions at original cursor positions
    let result = cleanedValue;

    // Insert each valid dynamic expression
    for (let item of deItems) {
      const expression = `[[${item.value}]]`;
      const cursor = item.cursor ?? 0;

      // Avoid inserting if value is empty or cursor is out of bounds
      if (item.value.trim() !== "" && cursor >= 0 && cursor <= result.length) {
        result = insertStringAtPosition(result, cursor, expression);
      }
    }

    onUpdateRequestBody(result);
  };

  // Helper function to insert string at a position
  function insertStringAtPosition(
    str: string,
    index: number,
    insertStr: string,
  ) {
    if (index < 0 || index > str.length) return str;
    return str.slice(0, index) + insertStr + str.slice(index);
  }

  let dynamicExpressionItems = $isDynamicExpressionContent?.filter(
    (item: any) =>
      item?.requestType === "body.raw" &&
      item?.method === "request" &&
      item?.blockName === selectedBlock?.data?.blockName,
  );

  const handleOpenDE = (id: string) => {
    const deItems = $isDynamicExpressionContent;
    const updatedItems = deItems.map((item) => {
      if (
        item.blockName === selectedBlock?.data?.blockName &&
        item.method === "request" &&
        item.requestType === "body.raw" &&
        item.id === id
      ) {
        return { ...item, isCurrentOpen: true };
      }
      return item;
    });
    isDynamicExpressionContent.set(updatedItems);
  };

  const removeDynamicExpression = (id: string) => {
    const deItems = $isDynamicExpressionContent;
    const filteredItems = deItems.filter((item) => item.id !== id);
    isDynamicExpressionContent.set(filteredItems);
  };

  const handleSetCursor = (cursorPosition: number) => {
    const cursorData = $requestBodyCursorPosition;
    const blockName = selectedBlock?.data?.blockName;
    if (blockName) {
      let found = false;
      const updatedCursorData = cursorData.map((item) => {
        if (item.blockName === blockName) {
          found = true;
          return { ...item, cursor: cursorPosition };
        }
        return item;
      });
      // If not found, add a new entry
      if (!found) {
        updatedCursorData.push({
          blockName,
          cursor: cursorPosition,
        });
      }
      requestBodyCursorPosition.set(updatedCursorData);
    }
  };
</script>

<div class="request-body position-relative">
  <Editor
    bind:lang
    bind:value
    on:change={handleCodeMirrorChange}
    isEditable={true}
    {isBodyBeautified}
    isDynamicExpression={true}
    {dynamicExpressionItems}
    {handleOpenDE}
    {handleSetCursor}
    {removeDynamicExpression}
    beautifySyntaxCallback={updateBeautifiedState}
  />
</div>
