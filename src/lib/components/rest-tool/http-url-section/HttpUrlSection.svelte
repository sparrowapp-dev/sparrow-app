<script lang="ts">
  import Button from "$lib/components/buttons/Button.svelte";
  import ToggleButton from "$lib/components/buttons/ToggleButton.svelte";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import CodeMirror from "$lib/components/editor/CodeMirror.svelte";
  import { RequestMethod } from "$lib/utils/enums";

  import tableColumnIcon from "$lib/assets/tableColumn.svg";
  import barIcon from "$lib/assets/barIcon.svg";

  let componentClass = "";
  export { componentClass as class };

  export let onSendButtonClicked = () => {};
  export let requestUrl: string;
</script>

<div class={`d-flex ${componentClass}`}>
  <!-- Http Method Dropdown -->
  <Dropdown
    dropdownId="api-request"
    dropDownType={{ type: "text", title: "GET" }}
    staticCustomStyles={[
      {
        id: "api-request-options-container",
        styleKey: "minWidth",
        styleValue: "120px",
      },
    ]}
    staticClasses={[
      {
        id: "api-request-btn-div",
        classToAdd: ["px-2", "py-3", "border", "rounded"],
      },
      {
        id: "api-request-options-container",
        classToAdd: ["start-0", "bg-backgroundDropdown"],
      },
    ]}
    data={[
      {
        name: "GET",
        id: RequestMethod.GET,
        dynamicClasses: "text-getColor",
      },
      {
        name: "POST",
        id: RequestMethod.POST,
        dynamicClasses: "text-postColor",
      },
      {
        name: "PUT",
        id: RequestMethod.PUT,
        dynamicClasses: "text-putColor",
      },
      {
        name: "DELETE",
        id: RequestMethod.DELETE,
        dynamicClasses: "text-deleteColor",
      },
      {
        name: "PATCH",
        id: RequestMethod.PATCH,
        dynamicClasses: "text-patchColor",
      },
    ]}
  ></Dropdown>

  <!-- Url input box -->
  <CodeMirror bind:rawValue={requestUrl} class="ms-2" codeMirrorStyle="url" />

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
