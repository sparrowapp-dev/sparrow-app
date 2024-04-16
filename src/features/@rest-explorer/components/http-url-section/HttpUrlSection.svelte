<script lang="ts">
  import Button from "$lib/components/buttons/Button.svelte";
  import ToggleButton from "$lib/components/buttons/ToggleButton.svelte";
  import CodeMirror from "$lib/components/editor/CodeMirror.svelte";
  import { RequestMethod } from "$lib/utils/enums";

  import tableColumnIcon from "$lib/assets/tableColumn.svg";
  import barIcon from "$lib/assets/barIcon.svg";
  import { Select } from "$lib/components/inputs";

  let componentClass = "";
  export { componentClass as class };

  export let onSendButtonClicked = () => {};
  export let onUpdateRequestUrl = (url: string) => {};
  export let onUpdateRequestMethod = (tab: string) => {};
  export let requestUrl;
  export let httpMethod;

  const handleDropdown = (tab: string) => {
    // httpMethod = tab;
    onUpdateRequestMethod(tab);
  };

  let _requestUrl = "";
  requestUrl.subscribe({
    next: (data: string) => {
      _requestUrl = data;
    },
    error: (error: string) => {
      console.error("Error fetching request url:", error);
    },
  });

  let _httpMethod = "";
  httpMethod.subscribe({
    next: (data: string) => {
      _httpMethod = data;
    },
    error: (error: string) => {
      console.error("Error fetching request method:", error);
    },
  });
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
    titleId={_httpMethod}
    onclick={handleDropdown}
    headerTheme={"transparent"}
    borderHighlight={"active"}
    headerHighlight={"hover"}
    minBodyWidth={"150px"}
    zIndex={2}
    menuItem={"v2"}
  />

  <!-- Url input box -->
  <!-- <CodeMirror bind:rawValue={requestUrl} class="ms-2" codeMirrorStyle="url" /> -->
  <input
    type="text"
    bind:value={_requestUrl}
    on:input={() => {
      onUpdateRequestUrl(_requestUrl);
    }}
  />

  <!-- Send button -->
  <Button
    title="Send"
    buttonClassProp="p-2"
    type="primary"
    onClick={onSendButtonClicked}
  />

  <!-- Switch pane layout button -->
  <ToggleButton
    toggleButtons={[
      {
        name: "",
        id: "horizontal",
        icon: tableColumnIcon,
        isSelected: true,
      },
      {
        name: "",
        id: "vertical",
        icon: barIcon,
        isSelected: false,
      },
    ]}
  />
</div>

<style>
</style>
