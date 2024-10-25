<script lang="ts">
  import { RequestMethod, WorkspaceRole } from "@sparrow/common/enums";

  import { Select } from "@sparrow/library/forms";
  import type {
    SaveRequestType,
    SendRequestType,
    UpdateRequestMethodType,
    UpdateRequestUrlType,
  } from "@sparrow/workspaces/type";
  import { notifications } from "@sparrow/library/ui";
  import { DropButton } from "@sparrow/workspaces/components";
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";
  import { Tooltip } from "@sparrow/library/ui";
  import { DiskIcon } from "@sparrow/library/icons";
  // import type { CancelRequestType } from "@workspaces/common/type/actions";
  let componentClass = "";
  export { componentClass as class };

  export let requestUrl: string;
  export let httpMethod: string;
  export let isSendRequestInProgress: boolean;
  export let onSendButtonClicked: SendRequestType;
  export let onCancelButtonClicked: CancelRequestType;
  export let onUpdateRequestUrl: UpdateRequestUrlType;
  export let onUpdateRequestMethod: UpdateRequestMethodType;
  export let toggleSaveRequest: (flag: boolean) => void;
  export let onSaveRequest: SaveRequestType;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isSave;
  export let isGuestUser = false;
  /**
   * Role of user in active workspace
   */
  export let userRole;

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
    if ((event.metaKey || event.ctrlKey) && event.code === "KeyS") {
      handleSaveRequest();
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
  <!-- Http Method Dropdown -->
  <div class="" style="">
    <Select
      id={"api-request"}
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
      borderRounded={"0px"}
      titleId={httpMethod}
      onclick={handleDropdown}
      borderHighlight={"active"}
      headerHighlight={"hover"}
      minHeaderWidth={"100px"}
      borderActiveType={"none"}
      headerTheme={"violet"}
      zIndex={500}
      borderType={"none"}
      menuItem={"v2"}
      bodyTheme={"violet"}
      isDropIconFilled={true}
      highlightTickedItem={false}
      headerFontSize={"12px"}
      headerHeight={"36px"}
    />
  </div>

  <CodeMirrorInput
    bind:value={requestUrl}
    onUpdateInput={onUpdateRequestUrl}
    placeholder={"Enter a URL"}
    {theme}
    {onUpdateEnvironment}
    {environmentVariables}
    codeId={"url"}
    class={"input-url"}
    {userRole}
    isFocusedOnMount={true}
  />

  <!-- Send button -->
  <span class="ps-2"></span>
  {#if !isSendRequestInProgress}
    <DropButton
      title="Send"
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
          onSendButtonClicked(environmentVariables);
        }
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
  <Tooltip title={"Save"} placement={"bottom"} distance={12} zIndex={10}>
    <button
      class="ms-2 save-disk d-flex align-items-center justify-content-center border-radius-2 border-0"
      on:click={handleSaveRequest}
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      disabled={isSave || userRole === WorkspaceRole.WORKSPACE_VIEWER
        ? true
        : false}
      style="background-color: {isSave ||
      userRole === WorkspaceRole.WORKSPACE_VIEWER
        ? 'var(--icon-secondary-550)'
        : 'var(--bg-secondary-400)'}; color: white;"
    >
      <DiskIcon
        height={22}
        width={22}
        color={isSave || userRole === WorkspaceRole.WORKSPACE_VIEWER
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
