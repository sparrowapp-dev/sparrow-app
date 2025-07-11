<script lang="ts">
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { notifications, Button } from "@sparrow/library/ui";
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";
  import { Tooltip } from "@sparrow/library/ui";
  import { CodeRegular, SaveRegular } from "@sparrow/library/icons";
  import { ModelOptions } from "..";
  import { createEventDispatcher } from "svelte";
  import {
    ModelVariantIdNameMapping,
    ModelIdNameMapping,
    AiModelProviderEnum,
  } from "@sparrow/common/types/workspace/ai-request-base";
  import type { Conversation } from "@sparrow/common/types/workspace/ai-request-tab";

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
  export let onUpdateAiConversation;
  let isModelSelectorOpen = false;
  export let selectedModelProvider = "openai";
  export let selectedModel = "gpt-4o";
  export let onModelSwitch: () => void;
  export let openGetCodePopup: () => void;

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
  const handleModelSelection = async (
    provider: string,
    model: { name: string; id: string },
  ) => {
    const isNewProvider = selectedModelProvider !== provider;
    selectedModelProvider = provider;
    selectedModel = model.id;
    await onUpdateAIModel(provider, model.id);
    if (isNewProvider) {
      onModelSwitch();
    }
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
      notifications.success("AI request saved successfully.");
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
          value={selectedModelProvider && selectedModel
            ? `${ModelIdNameMapping[selectedModelProvider]} | ${ModelVariantIdNameMapping[selectedModel]}`
            : ""}
          onUpdateInput={onUpdateAIModel}
          placeholder={"Select a Model"}
          {theme}
          {onUpdateEnvironment}
          {environmentVariables}
          codeId={"url"}
          class={"no-caret-input"}
          {userRole}
          isFocusedOnMount={false}
          disabled={true}
        />
      </div>

      <!-- Model selector dropdown -->
      <ModelOptions
        bind:isOpen={isModelSelectorOpen}
        bind:selectedModelProvider
        bind:selectedModel
        onSelect={handleModelSelection}
      />
    </div>
  </div>

  <!-- GetCode button -->
  <Button
    title="Get Code"
    type="primary"
    startIcon={CodeRegular}
    customWidth={"112px"}
    onClick={openGetCodePopup}
    disable={!selectedModelProvider}
  />

  <!-- {console.log(" info :>> ", isSave, userRole, WorkspaceRole.WORKSPACE_VIEWER)} -->
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

  /* Hide caret for this specific instance */
  :global(.no-caret-input .cm-editor) {
    caret-color: transparent;
  }

  /* This will ensure cursor doesn't show even when focused */
  :global(.no-caret-input .cm-content) {
    caret-color: transparent;
  }
</style>
