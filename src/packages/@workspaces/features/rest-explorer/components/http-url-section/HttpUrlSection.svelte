<script lang="ts">
  import { RequestMethod } from "$lib/utils/enums";

  import { Select } from "$lib/components/inputs";
  import type {
    SaveRequestType,
    SendRequestType,
    UpdateRequestMethodType,
    UpdateRequestUrlType,
  } from "@workspaces/common/type";
  import { DiskIcon } from "@library/icons";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import DropButton from "$lib/components/buttons/DropButton.svelte";
  import { CodeMirrorInput } from "../../../../common/components";
  import { UrlInputTheme } from "../../../../common/utils/";

  let componentClass = "";
  export { componentClass as class };

  export let requestUrl: string;
  export let httpMethod: string;
  export let isSendRequestInProgress: boolean;
  export let onSendButtonClicked: SendRequestType;
  export let onUpdateRequestUrl: UpdateRequestUrlType;
  export let onUpdateRequestMethod: UpdateRequestMethodType;
  export let toggleSaveRequest: (flag: boolean) => void;
  export let onSaveRequest: SaveRequestType;
  export let environmentVariables;
  export let onUpdateEnvironment;

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
      notifications.success("API request saved");
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
</script>

<div class={`d-flex ${componentClass}`}>
  <!-- Http Method Dropdown -->
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
    borderRounded={false}
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
  />

  <CodeMirrorInput
    bind:urlText={requestUrl}
    {onUpdateRequestUrl}
    placeholder={"Enter an URL"}
    {theme}
    {onUpdateEnvironment}
    {environmentVariables}
    codeId={"url"}
  />

  <!-- Send button -->
  <span class="ps-2"></span>
  <DropButton
    title="Send"
    type="default"
    disable={isSendRequestInProgress ? true : false}
    onClick={() => {
      onSendButtonClicked(environmentVariables);
    }}
  />

  <div
    class="ms-2 save-disk d-flex align-items-center justify-content-center border-radius-2"
    role="button"
    on:click={handleSaveRequest}
  >
    <DiskIcon height={20} width={20} />
  </div>
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .save-disk {
    padding: 7px;
    background-color: var(--bg-secondary-400);
  }
</style>
