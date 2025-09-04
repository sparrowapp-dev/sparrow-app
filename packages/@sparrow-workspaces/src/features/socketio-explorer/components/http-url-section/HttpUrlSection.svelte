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
  let isConnected;

  const theme = new UrlInputTheme().build();

  /**
   * @description - Check if user has internet connection
   */
  const checkInternetConnection = async (): Promise<boolean> => {
    if (!navigator.onLine) {
      return false;
    }
    try {
      const response = await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
        signal: AbortSignal.timeout(2000),
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * @description - Handle connection with internet check
   */
  const handleConnect = async () => {
    const hasInternet = await checkInternetConnection();

    if (!hasInternet) {
      notifications.error(
        "No internet connection detected. Please check your network connection and try again.",
      );
      return;
    }

    try {
      onConnect(environmentVariables);
      MixpanelEvent(Events.SocketIO_Connected);
    } catch (error) {
      notifications.error(
        "Failed to establish connection. Please check your network and try again.",
      );
    }
  };

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

  /**
   * @description - Handle button click for connect/disconnect
   */
  const handleConnectionToggle = async () => {
    if (requestUrl === "") {
      const codeMirrorElement = document.querySelector(".input-url .cm-editor");
      if (codeMirrorElement) {
        codeMirrorElement.classList.add("url-red-border");
      }
      notifications.error("Please enter a valid URL");
      return;
    }

    if (
      webSocket?.status === "connected" ||
      webSocket?.status === "connecting"
    ) {
      onDisconnect();
      MixpanelEvent(Events.SocketIO_Disconnected);
    } else if (webSocket?.status === "disconnected" || !webSocket?.status) {
      await handleConnect();
    }
  };

  $: isConnected = webSocket?.status === "connected";

  // Listen for online/offline events
  $: if (typeof window !== "undefined") {
    const handleOnline = () => {
      notifications.success("Internet connection restored");
    };

    const handleOffline = () => {
      notifications.warning("Internet connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  }
</script>

<div class={` ${componentClass}`} style="display: flex; gap: 6px;">
  <div class="w-100 d-flex align-items-center position-relative">
    <div class="position-absolute top-0" style="width: calc(100% );">
      <CodeMirrorInput
        bind:value={requestUrl}
        onUpdateInput={onUpdateRequestUrl}
        placeholder={"Enter URL here"}
        {theme}
        {onUpdateEnvironment}
        {environmentVariables}
        codeId={"url"}
        disabled={isConnected}
        class={"input-url"}
        {userRole}
      />
    </div>
  </div>

  <!-- Connect/Disconnect button -->
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
    onClick={handleConnectionToggle}
  />

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

<style>
  :global(.url-red-border) {
    border: 1px solid var(--border-danger-200) !important;
  }
</style>
