<script lang="ts">
  import { RequestMethod, WorkspaceRole } from "@sparrow/common/enums";
  import { Select } from "@sparrow/library/forms";
  import { notifications, Button } from "@sparrow/library/ui";
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";
  import { Tooltip } from "@sparrow/library/ui";
  import { SaveRegular } from "@sparrow/library/icons";
  import { ModelSelector } from "..";
  import { createEventDispatcher } from "svelte";

  let componentClass = "";
  export { componentClass as class };

  export let requestUrl;
  export let httpMethod;
  export let isSendRequestInProgress;
  export let onSendButtonClicked;
  export let onCancelButtonClicked;
  export let onUpdateRequestUrl;
  export let onUpdateRequestMethod;
  export let toggleSaveRequest;
  export let onSaveRequest;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isSave;
  export let userRole;
  export let isSaveLoad = false;

  const dispatch = createEventDispatcher();
  const theme = new UrlInputTheme().build();

  // Model selector state
  let isModelSelectorOpen = true;
  let selectedModelProvider = "";
  let selectedModel = "";

  // Toggle model selector
  const toggleModelSelector = () => {
    if (!isModelSelectorOpen) {
      setTimeout(() => {
        // isModelSelectorOpen = !isModelSelectorOpen;
        isModelSelectorOpen = true;
      }, 2);
    }
  };

  // Handle model selection
  const handleModelSelection = (provider: string, model: string) => {
    selectedModelProvider = provider;
    selectedModel = model;
    onUpdateRequestUrl(model);
  };

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
      notifications.success("API request saved successfully.");
    }
  };

  /**
   * @description - handles different key press
   * @param event - keyboard events
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    const isSaveDisabled =
      isSave || userRole === WorkspaceRole.WORKSPACE_VIEWER ? true : false;
    if (
      !isSaveDisabled &&
      (event.metaKey || event.ctrlKey) &&
      event.code === "KeyS"
    ) {
      event.preventDefault();
      handleSaveRequest();
    } else if ((event.metaKey || event.ctrlKey) && event.code === "KeyS") {
      event.preventDefault();
    } else if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      onSendButtonClicked(environmentVariables);
    }
  };

  let isHovered = false;

  function handleMouseEnter() {
    isHovered = true;
  }

  function handleMouseLeave() {
    isHovered = false;
  }

  function handleInputClick() {
    toggleModelSelector();
  }
</script>

<div class={`d-flex ${componentClass}`} style="display: flex; gap: 6px;">
  <div class="w-100 d-flex align-items-center position-relative">
    <div class="position-absolute top-0" style="width: calc(100% );">
      <!-- Wrap with a div to handle the click event -->
      <div on:click={handleInputClick} style="cursor: pointer;">
        <CodeMirrorInput
          value={selectedModel || "Select a Model"}
          onUpdateInput={onUpdateRequestUrl}
          placeholder={"Select a Model"}
          {theme}
          {onUpdateEnvironment}
          {environmentVariables}
          codeId={"url"}
          class={"input-url"}
          {userRole}
          isFocusedOnMount={false}
          readonly={true}
        />
      </div>

      <!-- Model selector dropdown -->
      <ModelSelector
        bind:isOpen={isModelSelectorOpen}
        {selectedModelProvider}
        {selectedModel}
        onSelect={handleModelSelection}
      />
    </div>
  </div>

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
<svelte:window on:keydown={handleKeyPress} />

<style>
  .save-disk {
    padding: 7px;
    background-color: var(--bg-secondary-400);
  }

  .save-disk:disabled {
    background-color: var(--bg-secondary-550);
  }
  :global(.url-red-border) {
    border: 1px solid var(--border-danger-200) !important;
  }
</style>
