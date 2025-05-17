<script lang="ts">
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { notifications, Button } from "@sparrow/library/ui";
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";
  import { Tooltip } from "@sparrow/library/ui";
  import { SaveRegular } from "@sparrow/library/icons";
  import { ModelSelector } from "..";
  import { createEventDispatcher } from "svelte";

  let componentClass = "";
  export { componentClass as class };

  export let onUpdateAIModel;
  export let toggleSaveRequest;
  export let onSaveRequest;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isSave;
  export let userRole;
  export let isSaveLoad = false;
  let isModelSelectorOpen = false;
  export let selectedModelProvider = "openai";
  export let selectedModel = "GPT-3.5 Turbo";

  const dispatch = createEventDispatcher();
  const theme = new UrlInputTheme().build();

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
  const handleModelSelection = (
    provider: string,
    model: { name: string; id: string },
  ) => {
    selectedModelProvider = provider;
    selectedModel = model.name;
    onUpdateAIModel(provider, model.id);
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
          value={`${selectedModelProvider} | ${selectedModel}` ||
            "Select a Model"}
          onUpdateInput={onUpdateAIModel}
          placeholder={"Select a Model"}
          {theme}
          {onUpdateEnvironment}
          {environmentVariables}
          codeId={"url"}
          class={"input-url"}
          {userRole}
          isFocusedOnMount={false}
          disabled={true}
        />
      </div>

      <!-- Model selector dropdown -->
      <ModelSelector
        bind:isOpen={isModelSelectorOpen}
        bind:selectedModelProvider
        bind:selectedModel
        onSelect={handleModelSelection}
      />
    </div>
  </div>

  <Tooltip
    title={"Save (coming soon)"}
    placement={"left-center"}
    distance={12}
    zIndex={10}
  >
    <Button
      type="secondary"
      size="medium"
      loader={isSaveLoad}
      startIcon={isSaveLoad ? "" : SaveRegular}
      onClick={handleSaveRequest}
      disable={true}
    />
    <!-- disable={isSave || userRole === WorkspaceRole.WORKSPACE_VIEWER
        ? true
        : false} -->
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
