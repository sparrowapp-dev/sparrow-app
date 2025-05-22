<script lang="ts">
  import { beautifyIcon } from "@sparrow/library/assets";
  import { Editor } from "@sparrow/library/forms";
  import { BroomRegular, CleanerIcon } from "@sparrow/library/icons";
  import { Button, notifications } from "@sparrow/library/ui";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" | "Graphql" =
    "Graphql";
  export let value = "";
  export let onUpdateRequestQuery: (data: string) => void = () => {};
  export let isError = false;
  export let errorMessage = "";
  export let errorStartIndex = 0;
  export let errorEndIndex = 0;
  export let onClearQuery;
  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestQuery(e.detail);
  };
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
        <div class="h-100">
          <Editor
            bind:lang
            bind:value
            on:change={handleCodeMirrorChange}
            isEditable={true}
            class="m-0"
            {isBodyBeautified}
            beautifySyntaxCallback={updateBeautifiedState}
            placeholder={""}
            isErrorVisible={isError}
            {errorMessage}
            {errorStartIndex}
            {errorEndIndex}
          />
        </div>
      </div>
    </div>
  </div>
  <div class="d-flex justify-content-end">
    <Button
      size="small"
      type="teritiary-regular"
      startIcon={BroomRegular}
      title="Clear Query"
      onClick={onClearQuery}
    />
  </div>
</div>
