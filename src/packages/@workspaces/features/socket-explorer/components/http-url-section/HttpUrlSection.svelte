<script lang="ts">
  import { WorkspaceRole } from "$lib/utils/enums";

  import type {
    SaveRequestType,
    UpdateRequestUrlType,
  } from "@workspaces/common/type";
  import { notifications } from "@library/ui/toast/Toast";
  import DropButton from "$lib/components/buttons/DropButton.svelte";
  import { CodeMirrorInput } from "../../../../common/components";
  import { UrlInputTheme } from "../../../../common/utils/";
  import Tooltip from "@library/ui/tooltip/Tooltip.svelte";
  import { DiskIcon } from "@library/icons";
  let componentClass = "";
  export { componentClass as class };

  export let requestUrl: string | undefined;
  export let onUpdateRequestUrl: UpdateRequestUrlType;
  export let toggleSaveRequest: (flag: boolean) => void;
  export let onSaveSocket: SaveRequestType;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isSave;
  export let isGuestUser = false;
  export let onConnect;
  export let webSocket;
  export let onDisconnect;
  /**
   * Role of user in active workspace
   */
  export let userRole;

  const theme = new UrlInputTheme().build();
  /**
   * @description - save request handler
   */
  const handleSaveRequest = async () => {
    const x = await onSaveSocket();
    if (
      x.status === "error" &&
      x.message === "request is not a part of any workspace or collection"
    ) {
      toggleSaveRequest(true);
    } else if (x.status === "success") {
      notifications.success("API request saved");
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
    placeholder={"Enter an URL"}
    {theme}
    {onUpdateEnvironment}
    {environmentVariables}
    codeId={"url"}
    class={"input-url"}
    {userRole}
  />

  <!-- Send button -->
  <span class="ps-2"></span>
  <DropButton
    title={webSocket?.status === "connected" ? "Disconnect" : "Connect"}
    type="default"
    loader={webSocket?.status === "connecting" ||
      webSocket?.status === "disconnecting"}
    disable={webSocket?.status === "connecting" ||
      webSocket?.status === "disconnecting"}
    onClick={() => {
      if (requestUrl === "") {
        const codeMirrorElement = document.querySelector(
          ".input-url .cm-editor",
        );
        if (codeMirrorElement) {
          codeMirrorElement.classList.add("url-red-border");
        }
      } else {
        if (webSocket?.status === "connected") {
          onDisconnect();
        } else if (webSocket?.status === "disconnected" || !webSocket?.status) {
          onConnect(environmentVariables);
        }
      }
    }}
  />
  <Tooltip title={"Save"} placement={"bottom"} distance={12} zIndex={10}>
    <button
      class="ms-2 save-disk d-flex align-items-center justify-content-center border-radius-2 border-0"
      on:click={handleSaveRequest}
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      disabled={isSave || userRole === WorkspaceRole.WORKSPACE_VIEWER
        ? true
        : false}
    >
      <DiskIcon
        height={22}
        width={22}
        color={isHovered && !isSave && !isGuestUser
          ? "var(--icon-primary-200)"
          : "var(--icon-secondary-100)"}
      />
    </button>
  </Tooltip>
</div>

<!-- <svelte:window on:keydown={handleKeyPress} /> -->

<style>
  .save-disk {
    padding: 7px;
    background-color: var(--bg-secondary-400);
  }
  :global(.url-red-border) {
    border: 1px solid var(--border-danger-200) !important;
  }
</style>
