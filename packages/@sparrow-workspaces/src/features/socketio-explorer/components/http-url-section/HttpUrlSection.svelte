<script lang="ts">
  import { WorkspaceRole } from "@sparrow/common/enums";

  import type {
    SaveRequestType,
    UpdateRequestUrlType,
  } from "@sparrow/workspaces/type";
  import { notifications, Button } from "@sparrow/library/ui";
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";
  import { Tooltip } from "@sparrow/library/ui";
  import { SaveRegular } from "@sparrow/library/icons";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
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
      notifications.success(
        `${SocketIORequestDefaultAliasBaseEnum.NAME} request saved successfully.`,
      );
    }
  };
</script>

<div class={` ${componentClass}`} style="display: flex; gap: 6px;">

   <div class="w-100 d-flex align-items-center position-relative ">
    <div class="position-absolute top-0" style="width: calc(100% );">
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
    </div>
  </div>

  <!-- Send button -->
  <Button
    title={webSocket?.status === "connected"
      ? "Disconnect"
      : webSocket?.status === "connecting"
        ? "Cancel"
        : "Connect"}
    type={webSocket?.status === "connecting" ? "secondary" : "primary"}
    customWidth={"96px"}
    loader={webSocket?.status === "disconnecting"}
    disable={webSocket?.status === "disconnecting"}
    onClick={() => {
      if (requestUrl === "") {
        const codeMirrorElement = document.querySelector(
          ".input-url .cm-editor",
        );
        if (codeMirrorElement) {
          codeMirrorElement.classList.add("url-red-border");
        }
      } else {
        if (
          webSocket?.status === "connected" ||
          webSocket?.status === "connecting"
        ) {
          onDisconnect();
          MixpanelEvent(Events.SocketIO_Disconnected);
        } else if (webSocket?.status === "disconnected" || !webSocket?.status) {
          onConnect(environmentVariables);
          MixpanelEvent(Events.SocketIO_Connected);
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
  :global(.url-red-border) {
    border: 1px solid var(--border-danger-200) !important;
  }
</style>
