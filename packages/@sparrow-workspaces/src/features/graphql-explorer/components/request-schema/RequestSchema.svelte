<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import { RefreshSchemaIcon, WarningIcon } from "@sparrow/library/icons";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" | "Graphql" =
    "Graphql";
  export let value = "";
  export let isFetched = false;
  export let onRefreshSchema: () => void = () => {};
  export let isSchemaFetching = false;
  let isBodyBeautified = false;
</script>

<div class="ps-0 pe-0 d-flex flex-column rounded w-100 h-100 position-relative">
  <div style="flex:1; overflow:auto;">
    <div class="d-flex flex-column h-100">
      {#if isFetched}
        <div style="flex:1; overflow:auto; position:relative;">
          <div class="h-100">
            <Editor
              bind:lang
              bind:value
              isEditable={false}
              class="m-0"
              {isBodyBeautified}
              placeholder={""}
            />
          </div>
        </div>
      {:else}
        <div style="flex: 1;">
          <div class="error-message">
            <div class="error-icon">
              <WarningIcon
                height="16"
                width="16"
                color="var(--icon-danger-200)"
              />
            </div>
            <span class="error-text"
              >"Unable to load schema. Please check the URL and try again."</span
            >
          </div>
        </div>
      {/if}
      <div
        style="border-top: 1px solid var(--border-secondary-400);"
        class="pt-2 pb-2 d-flex justify-content-between"
      >
        <div></div>
        <div>
          <button
            class="input-cleaner px-2 border-radius-2 py-1 text-fs-12 text-secondary-200"
            on:click={async () => {
              onRefreshSchema();
            }}
            disabled={isSchemaFetching}
          >
            <span class="me-2 {isSchemaFetching ? 'rotating' : ''}">
              <RefreshSchemaIcon
                height={"14px"}
                width={"12px"}
                color={"var(--text-secondary-200)"}
              />
            </span>
            Refresh Schema</button
          >
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .input-cleaner {
    cursor: pointer;
    background-color: transparent;
    border: none;
    outline: none;
  }

  .input-cleaner:disabled {
    cursor: not-allowed;
  }

  .input-cleaner:hover:not(:disabled) {
    background-color: var(--bg-tertiary-400);
  }
  .error-message {
    display: flex;
    align-items: center;
    background-color: var(--bg-tertiary-300);
    padding: 10px 15px;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 800px;
  }

  .error-icon {
    margin-right: 10px;
  }

  .error-text {
    color: var(--text-secondary-110);
    font-size: 12px;
  }

  /* Add rotation animation */
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Rotating class */
  .rotating {
    animation: rotate 1s linear infinite;
    display: inline-block;
  }
</style>
