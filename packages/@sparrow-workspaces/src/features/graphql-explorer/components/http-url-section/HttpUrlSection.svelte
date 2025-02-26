<script lang="ts">
  import { Button, notifications } from "@sparrow/library/ui";
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";
  import { Tooltip } from "@sparrow/library/ui";
  import {SaveRegular} from "@sparrow/library/icons";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";

  let componentClass = "";
  export { componentClass as class };
  export let requestUrl: string;
  export let isSendRequestInProgress;
  export let onSendButtonClicked;
  export let onCancelButtonClicked;
  export let onUpdateRequestUrl;
  export let toggleSaveRequest;
  export let onSaveRequest;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isSave;
  export let isGraphqlEditable;

  const theme = new UrlInputTheme().build();
  /**
   * @description - save request handler
   */
  const handleSaveRequest = async () => {
    const x = await onSaveRequest();
    if (
      x.status === "error" &&
      x.message === "request is not a part of any workspace or collection"
    ) {
      toggleSaveRequest(true);
    } else if (x.status === "success") {
      notifications.success(
        `${GraphqlRequestDefaultAliasBaseEnum.NAME} request saved successfully.`,
      );
    }
  };

  /**
   * @description - handles different key press
   * @param event - keyboard events
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    const isSaveDisabled = isSave || !isGraphqlEditable ? true : false;
    if (
      !isSaveDisabled &&
      (event.metaKey || event.ctrlKey) &&
      event.code === "KeyS"
    ) {
      event.preventDefault();
      handleSaveRequest();
    } else if ((event.metaKey || event.ctrlKey) && event.code === "KeyS") {
      event.preventDefault();
    } else if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
<<<<<<< HEAD
      onSendButtonClicked(environmentVariables?.filtered || [])
=======
      onSendButtonClicked(environmentVariables?.filtered || []);
>>>>>>> b362302354c8c8c39d740c18cc4c308d7568ae29
    }
  };


</script>

<div class={`d-flex ${componentClass}`} style="display: flex; gap: 6px;">
  <CodeMirrorInput
    bind:value={requestUrl}
    onUpdateInput={onUpdateRequestUrl}
    placeholder={"Enter URL here"}
    {theme}
    {onUpdateEnvironment}
    {environmentVariables}
    codeId={"url"}
    class={"input-url"}
    isFocusedOnMount={true}
  />

  <!-- Send button -->
  {#if !isSendRequestInProgress}
    <Button
      title={"Query"}
      type={"primary"}
      size="medium"
      customWidth={"96px"}
      onClick={() => {
        if (requestUrl === "") {
          const codeMirrorElement = document.querySelector(
            ".input-url .cm-editor",
          );
          if (codeMirrorElement) {
            codeMirrorElement.classList.add("url-red-border");
          }
        } else {
          onSendButtonClicked(environmentVariables?.filtered || []);
        }

        MixpanelEvent(Events.Send_GraphQL_Query, {
          description: "Send GraphQL Query",
        });
      }}
    />
  {:else}
  <Button title="Cancel"
  type="secondary"
  customWidth={"96px"}
  size="medium"
  onClick={() => {
        onCancelButtonClicked();
      }}/>
  {/if}

  <Tooltip title={"Save"} placement={"bottom-center"} distance={12} zIndex={10}>
    <Button
    type="secondary"
    size="medium"
    startIcon={SaveRegular}
    disable={isSave || !isGraphqlEditable ? true : false}
    onClick={() => {
        handleSaveRequest();
        MixpanelEvent(Events.Save_GraphQL_Request, {
          description: "Save GraphQL Request",
        });
      }}
    />
  </Tooltip>
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>

  .save-disk:disabled {
    background-color: var(--bg-secondary-550);
  }
  :global(.url-red-border) {
    border: 1px solid var(--border-danger-200) !important;
  }
  
</style>
