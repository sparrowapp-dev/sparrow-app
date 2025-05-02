<script lang="ts">
  import { writable } from "svelte/store";
  import { Button } from "@sparrow/library/ui";
  import { Editor } from "@sparrow/library/forms";
  import { selectedRequestTypes } from "../../../testflow-explorer/store";

  export let expression = "";
  export let handleAddingNested: (value: string) => void;
  export let selectedApiRequestType: string;
  export let onPreviewExpression;
  export let cursorPosition: number | null = 0;

  let expressionPreviewResult = "";
  let expressionErrorResult = "";
  let expressionResultContentType = "Text";
  let data: any = {};
  let topLevelKeys: any[] = [];

  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    expression = e.detail;
  };

  export const customSuggestions = writable<any[]>([]);
  $: {
    data = $selectedRequestTypes;
    topLevelKeys = [];

    if (data && typeof data === "object" && Object.keys(data).length > 0) {
      if (selectedApiRequestType === "body") {
        topLevelKeys = Object.keys(data);
      } else {
        topLevelKeys = Object.values(data).filter(
          (item: any) => item?.key && item?.checked,
        );
      }

      // update the writable store
      const suggestions = topLevelKeys.map((key: any) =>
        selectedApiRequestType === "body"
          ? { label: key, type: "property" }
          : { label: key.key, type: "property" },
      );

      customSuggestions.set(suggestions);
    }
  }

  const handleSetProperties = (value?: any, type?: string) => {
    if (selectedApiRequestType === "body") {
      if (["raw", "formdata", "urlencoded"].includes(type || "")) {
        handleAddingNested(type);
        if (type === "raw" && typeof value === "string") {
          try {
            const jsonObject = JSON.parse(value);
            const rawContent = Object.keys(jsonObject);
            console.log(rawContent);
          } catch (e) {
            console.error("Invalid JSON string in raw body:", e);
          }
        }
      }
    }
  };
</script>

<div
  class="expression-editor d-flex flex-column"
  style="max-width: 540px; min-width: 240px; gap: 8px;"
>
  <div class="d-flex flex-column" style="gap: 8px;">
    <p class="expression-title-text m-0">Expression Editor</p>
    <div>
      <div class="expression-textarea-editor">
        <Editor
          lang={"JavaScript"}
          placeholder={"Select API data, functions, or variables from the panel."}
          bind:value={expression}
          on:change={handleCodeMirrorChange}
          isEditable={true}
          isEnterKeyNotAllowed={true}
          bind:cursorPosition
        />
      </div>
      <div>
        {#if Array.isArray(topLevelKeys) && topLevelKeys.length > 0}
          {#each topLevelKeys as value}
            <div
              class="cursor-pointer hover:bg-light p-1"
              on:click={() => {
                if (selectedApiRequestType !== "body") {
                  handleSetProperties(value.value);
                } else {
                  const content = data[value];
                  handleSetProperties(content, value);
                }
              }}
            >
              <p class="m-0">
                {selectedApiRequestType === "body" ? value : value.key}
              </p>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
  <div>
    <div
      class="expression-result-container d-flex flex-row justify-content-between"
    >
      <div class="expression-result-text m-0" style="height:120px;">
        <Editor
          lang={expressionResultContentType}
          placeholder={"Expression result"}
          bind:value={expressionPreviewResult}
          on:change={() => {}}
          isEditable={false}
        />
      </div>
      <Button
        type="link-primary"
        title="Run Preview"
        size="small"
        disable={!expression}
        onClick={async () => {
          expressionPreviewResult = "";
          expressionErrorResult = "";
          expressionResultContentType = "Text";
          const res = await onPreviewExpression(expression);
          if (res.status === "pass") {
            if (res.result === undefined) {
              expressionPreviewResult = "undefined";
            } else if (res.result === null) {
              expressionPreviewResult = "null";
            } else {
              expressionPreviewResult = res.result;
            }
            expressionResultContentType = res.contentType;
          } else {
            expressionErrorResult = res.result;
          }
        }}
      />
    </div>
    <p class="text-fs-12 mb-0" style="color: var(--text-ds-danger-300)">
      {expressionErrorResult}
    </p>
  </div>
</div>

<style>
  .expression-editor {
    background-color: var(--bg-ds-surface-500);
    padding: 12px;
    border-radius: 4px;
    height: 440px;
  }

  .expression-title-text,
  .expression-result-text,
  .expression-textarea-editor,
  .expression-textarea-editor::placeholder {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 143%;
    letter-spacing: 0;
  }

  .expression-title-text {
    color: var(--text-ds-neutral-200);
  }

  .expression-result-text {
    /* color: var(--text-ds-neutral-400); */
  }

  .expression-result-container {
    padding: 4px 8px;
    border-radius: 4px;
    background-color: var(--bg-ds-surface-400);
  }

  .expression-textarea-editor {
    background-color: var(--bg-ds-surface-400);
    border: none;
    border-radius: 4px;
    color: var(--text-ds-neutral-50);
    height: 200px;
    outline: none;
    caret-color: var(--bg-ds-primary-300);
    resize: none;
  }
  .expression-textarea-editor:hover {
    outline: 1px solid var(--border-ds-neutral-300) !important;
  }
  .expression-textarea-editor:focus {
    outline: 2px solid var(--bg-ds-primary-300);
  }

  .expression-textarea-editor::placeholder {
    color: var(--text-ds-neutral-400);
  }

  .m-0 {
    margin: 0 !important;
  }
</style>
