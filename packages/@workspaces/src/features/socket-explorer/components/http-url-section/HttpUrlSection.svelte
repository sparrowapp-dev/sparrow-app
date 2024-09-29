<script lang="ts">
  import { WorkspaceRole } from "@deprecate/utils/enums";

  import type {
    SaveRequestType,
    UpdateRequestUrlType,
  } from "@sparrow/workspaces/common/type";
  import { notifications } from "@sparrow/library/ui";
  import { DropButton } from "@sparrow/workspaces/common/components";
  import { CodeMirrorInput } from "../../../../common/components";
  import { UrlInputTheme } from "../../../../common/utils/";
  import { Tooltip } from "@sparrow/library/ui";
  import { DiskIcon } from "@sparrow/library/icons";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
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
      notifications.success("WebSocket request saved");
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
          MixpanelEvent(Events.WebSocket_Disconnected);
        } else if (webSocket?.status === "disconnected" || !webSocket?.status) {
          onConnect(environmentVariables);
          MixpanelEvent(Events.WebSocket_Connected);
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
