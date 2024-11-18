<script lang="ts">
  import { beautifyIcon } from "@sparrow/library/assets";
  import { Editor } from "@sparrow/library/forms";
  import { CleanerIcon } from "@sparrow/library/icons";
  import { notifications } from "@sparrow/library/ui";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" | "Graphql" =
    "Graphql";
  export let value = "";
  export let onUpdateRequestQuery: (data: string) => void = () => {};
  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestQuery(e.detail);
  };
  export let onClearQuery;
  let isBodyBeautified = false;
  const updateBeautifiedState = (value: boolean) => {
    isBodyBeautified = value;
  };
</script>

<div class="ps-0 pe-0 d-flex flex-column rounded w-100 h-100 position-relative">
  <div style="flex:1; overflow:auto;">
    <div class="d-flex flex-column h-100">
      <div style="flex:1; overflow:auto; position:relative;">
        {#if value}
          <div
            on:click={() => {
              updateBeautifiedState(true);
              notifications.success("Code formatted successfully.");
            }}
            role="button"
            class="icon-container d-flex align-items-center justify-content-center border-radius-2"
            style="position:absolute; top:0px; right:0; z-index:10;"
          >
            <img src={beautifyIcon} style="height:10px; width:10px;" />
          </div>
        {/if}
        <Editor
          bind:lang
          bind:value
          on:change={handleCodeMirrorChange}
          isEditable={true}
          class="m-0"
          {isBodyBeautified}
          beautifySyntaxCallback={updateBeautifiedState}
          placeholder={""}
        />
      </div>
      {#if value}
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
                onClearQuery();
              }}
            >
              <span class="me-2"
                ><CleanerIcon
                  height={"14px"}
                  width={"12px"}
                  color={"var(--text-secondary-200)"}
                /></span
              >
              Clear Query</span
            >
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .input-cleaner:hover {
    background-color: var(--bg-tertiary-400);
  }
</style>
