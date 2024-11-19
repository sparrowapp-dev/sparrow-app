<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import { notifications } from "@sparrow/library/ui";
  import { RefreshSchemaIcon } from "@sparrow/library/icons";

  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" | "Graphql" =
    "Graphql";
  export let value = "";
  export let isFetched = false;
  export let onRefreshSchema: () => void = () => {};
  let isBodyBeautified = false;
</script>

{#if isFetched}
  <div
    class="ps-0 pe-0 d-flex flex-column rounded w-100 h-100 position-relative"
  >
    <div style="flex:1; overflow:auto;">
      <div class="d-flex flex-column h-100">
        <div style="flex:1; overflow:auto; position:relative;">
          <Editor
            bind:lang
            bind:value
            isEditable={false}
            class="m-0"
            {isBodyBeautified}
            placeholder={""}
          />
        </div>
        <div
          style="border-top: 1px solid var(--border-secondary-400);"
          class="pt-2 pb-2 d-flex justify-content-between"
        >
          <div></div>
          <div>
            <span
              class="input-cleaner px-2 border-radius-2 py-1 text-fs-12 text-secondary-200"
              role="button"
              on:click={() => {
                onRefreshSchema();
              }}
            >
              <span class="me-2">
                <RefreshSchemaIcon
                  height={"14px"}
                  width={"12px"}
                  color={"var(--text-secondary-200)"}
                />
              </span>
              Refresh Schema</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div>{isFetched}</div>
{/if}

<style>
  .input-cleaner:hover {
    background-color: var(--bg-tertiary-400);
  }
</style>
