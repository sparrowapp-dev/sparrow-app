<script lang="ts">
  import Button from "$lib/components/buttons/Button.svelte";
  import ToggleButton from "$lib/components/buttons/ToggleButton.svelte";
  import { RequestMethod } from "$lib/utils/enums";

  import tableColumnIcon from "$lib/assets/tableColumn.svg";
  import barIcon from "$lib/assets/barIcon.svg";
  import { Select } from "$lib/components/inputs";
  import { RequestUrl } from "@workspaces/features/rest-explorer/components";
  import type {
    SendRequestType,
    UpdateRequestMethodType,
    UpdateRequestStateType,
    UpdateRequestUrlType,
  } from "@workspaces/shared/type";
  import { DiskIcon } from "@library/icons";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";

  let componentClass = "";
  export { componentClass as class };

  export let requestUrl: string = "";
  export let httpMethod: string = "";
  export let splitterDirection: string = "";
  export let onSendButtonClicked: SendRequestType;
  export let onUpdateRequestUrl: UpdateRequestUrlType;
  export let onUpdateRequestMethod: UpdateRequestMethodType;
  export let onUpdateRequestState: UpdateRequestStateType;
  export let toggleSaveRequest;
  export let onSaveRequest;

  const handleDropdown = (tab: string) => {
    onUpdateRequestMethod(tab);
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
    headerTheme={"voilet"}
    minBodyWidth={"150px"}
    zIndex={2}
    borderType={"none"}
    menuItem={"v2"}
    bodyTheme={"voilet"}
  />

  <RequestUrl urlText={requestUrl} {onUpdateRequestUrl} />

  <!-- Send button -->
  <Button
    title="Send"
    buttonClassProp=" ms-2 p-2"
    type="primary"
    onClick={onSendButtonClicked}
  />

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
  <div
    class="ms-2 save-disk d-flex align-items-center justify-content-center rounded"
    type="button"
    on:click={async () => {
      const x = await onSaveRequest();
      if (
        x.status === "error" &&
        x.message === "request is not a part of any workspace or collection"
      ) {
        toggleSaveRequest(true);
      } else if (x.status === "success") {
        notifications.success("API request saved");
      }
    }}
  >
    <DiskIcon height={20} width={20} />
  </div>
</div>

<style>
  .save-disk {
    padding: 7px;
    background-color: var(--bg-primary-400);
  }
</style>
