<script lang="ts">
  import { notifications } from "@sparrow/library/ui";
  import { DropButton } from "@sparrow/workspaces/components";
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";
  import { Tooltip } from "@sparrow/library/ui";
  import { DiskIcon } from "@sparrow/library/icons";
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
      onSendButtonClicked(environmentVariables);
    }
  };

  let isHovered = false;

  function handleMouseEnter() {
    isHovered = true;
  }

  function handleMouseLeave() {
    isHovered = false;
  }
</script>

<div class={`d-flex ${componentClass}`}>
  <CodeMirrorInput
    bind:value={requestUrl}
    onUpdateInput={onUpdateRequestUrl}
    placeholder={"Enter a URL"}
    {theme}
    {onUpdateEnvironment}
    {environmentVariables}
    codeId={"url"}
    class={"input-url"}
    isFocusedOnMount={true}
  />

  <!-- Send button -->
  <span class="ps-2"></span>
  {#if !isSendRequestInProgress}
    <DropButton
      title="Query"
      type="default"
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
    <DropButton
      title="Cancel"
      type="dark"
      onClick={() => {
        onCancelButtonClicked();
      }}
    />
  {/if}

  <Tooltip title={"Save"} placement={"bottom-center"} distance={12} zIndex={10}>
    <button
      class="ms-2 save-disk d-flex align-items-center justify-content-center border-radius-2 border-0"
      on:click={() => {
        handleSaveRequest();
        MixpanelEvent(Events.Save_GraphQL_Request, {
          description: "Save GraphQL Request",
        });
      }}
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      disabled={isSave || !isGraphqlEditable ? true : false}
      style="background-color: {isSave || !isGraphqlEditable
        ? 'var(--icon-secondary-550)'
        : 'var(--bg-secondary-400)'}; color: white;"
    >
      <DiskIcon
        height={22}
        width={22}
        color={isSave || !isGraphqlEditable
          ? "var(--icon-secondary-380)"
          : isHovered
            ? "var(--icon-primary-200)"
            : "var(--icon-secondary-100)"}
      />
    </button>
  </Tooltip>
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .save-disk {
    padding: 7px;
    background-color: var(--bg-secondary-400);
  }

  .save-disk:disabled {
    background-color: var(--bg-secondary-550);
  }
  :global(.url-red-border) {
    border: 1px solid var(--border-danger-200) !important;
  }
</style>
