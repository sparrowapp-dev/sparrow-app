<script lang="ts">
  import { WorkspaceRole } from "@sparrow/common/enums";

  import type {
    SaveRequestType,
    UpdateRequestUrlType,
  } from "@sparrow/workspaces/type";
  import { Button, notifications } from "@sparrow/library/ui";
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";
  import { Tooltip } from "@sparrow/library/ui";
  import { SaveRegular } from "@sparrow/library/icons";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
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
  export let isSaveLoad = false;
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
      notifications.success("WebSocket request saved successfully.");
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
    {userRole}
  />

  <!-- Send button -->
  <Button
    title={webSocket?.status === "connected" ? "Disconnect" : "Connect"}
    type="primary"
    customWidth={"96px"}
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
  <Tooltip title={"Save"} placement={"bottom-center"} distance={12} zIndex={10}>
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
