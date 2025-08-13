<script lang="ts">
  import { RequestMethod, WorkspaceRole } from "@sparrow/common/enums";
  import { Select } from "@sparrow/library/forms";
  import { notifications, Button } from "@sparrow/library/ui";
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";
  import { Tooltip } from "@sparrow/library/ui";
  import { SaveRegular } from "@sparrow/library/icons";

  let componentClass = "";
  export { componentClass as class };

  export let requestUrl;
  export let httpMethod;
  export let isSendRequestInProgress;
  export let onSendButtonClicked;
  export let onCancelButtonClicked;
  export let onUpdateRequestUrl;
  export let onUpdateRequestMethod;
  export let toggleSaveRequest;
  export let onSaveRequest;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isSave;
  export let userRole;
  export let isSaveLoad = false;

  const theme = new UrlInputTheme().build();
  const handleDropdown = (tab: string) => {
    onUpdateRequestMethod(tab);
  };

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
      notifications.success("API request saved successfully.");
    }
  };

  /**
   * @description - handles different key press
   * @param event - keyboard events
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    const isSaveDisabled =
      isSave || userRole === WorkspaceRole.WORKSPACE_VIEWER ? true : false;
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
      if (requestUrl === "") {
        const codeMirrorElement = document.querySelector(
          ".input-url .cm-editor",
        );
        if (codeMirrorElement) {
          codeMirrorElement.classList.add("url-red-border");
        }
      }
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

<div class={`d-flex ${componentClass}`} style="display: flex; gap: 6px;">
  <!-- Http Method Dropdown -->
  <Select
    variant={"secondary"}
    id={"api-request"}
    size={"medium"}
    data={[
      {
        name: "GET",
        id: RequestMethod.GET,
        color: "success",
      },
      {
        name: "POST",
        id: RequestMethod.POST,
        color: "warning",
      },
      {
        name: "PUT",
        id: RequestMethod.PUT,
        color: "secondary",
      },
      {
        name: "DELETE",
        id: RequestMethod.DELETE,
        color: "danger",
      },
      {
        name: "PATCH",
        id: RequestMethod.PATCH,
        color: "patch",
      },
    ]}
    titleId={httpMethod}
    onclick={handleDropdown}
    borderHighlight={"active"}
    headerHighlight={"hover"}
    minHeaderWidth={"100px"}
    borderActiveType={"none"}
    zIndex={500}
    borderType={"none"}
    menuItem={"v2"}
    highlightTickedItem={false}
  />
  <div class="w-100 d-flex align-items-center position-relative">
    <div class="position-absolute top-0" style="width: calc(100% );">
      <CodeMirrorInput
        value={requestUrl}
        onUpdateInput={onUpdateRequestUrl}
        placeholder={"Enter a URL or paste a cURL command"}
        {theme}
        {onUpdateEnvironment}
        {environmentVariables}
        codeId={"url"}
        class={"input-url"}
        {userRole}
        isFocusedOnMount={false}
      />
    </div>
  </div>

  <!-- Send button -->
  {#if !isSendRequestInProgress}
    <Button
      title="Send"
      type="primary"
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
          onSendButtonClicked(environmentVariables);
        }
      }}
    />
  {:else}
    <Button
      type="secondary"
      customWidth={"96px"}
      title="Cancel"
      onClick={() => {
        onCancelButtonClicked();
      }}
    />
  {/if}

  <!-- Switch pane layout button -->
  <!-- <ToggleButton
    selectedToggleId={splitterDirection}
    toggleButtons={[
      {
        name: "",
        id: "vertical",
        icon: tableColumnIcon,
      },
      {
        name: "",
        id: "horizontal",
        icon: barIcon,
      },
    ]}
    on:click={(e) => {
      onUpdateRequestState({ requestSplitterDirection: e.detail });
    }}
  /> -->
  {#if !(userRole === WorkspaceRole.WORKSPACE_VIEWER)}
    <Tooltip
      title={"Save"}
      placement={"bottom-center"}
      distance={12}
      zIndex={10}
    >
      <Button
        type="secondary"
        size="medium"
        loader={isSaveLoad}
        startIcon={isSaveLoad ? "" : SaveRegular}
        onClick={handleSaveRequest}
        disable={isSave || userRole === WorkspaceRole.WORKSPACE_VIEWER
          ? true
          : false}
      />
    </Tooltip>
  {/if}
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
