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

  let componentClass = "";
  export { componentClass as class };

  export let requestUrl: string = "";
  export let httpMethod: string = "";
  export let splitterDirection: string = "";
  export let onSendButtonClicked: SendRequestType;
  export let onUpdateRequestUrl: UpdateRequestUrlType;
  export let onUpdateRequestMethod: UpdateRequestMethodType;
  export let onUpdateRequestState: UpdateRequestStateType;

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
    buttonClassProp="p-2"
    type="primary"
    onClick={onSendButtonClicked}
  />

  <!-- Switch pane layout button -->
  <ToggleButton
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
      // restSplitterDirection.set(e.detail);
    }}
  />
</div>

<style>
</style>
