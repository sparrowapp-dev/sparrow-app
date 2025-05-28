<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { Button, Modal, Navigator } from "@sparrow/library/ui";
  import {
    ChannelRegular,
    OpenAIVectorIcon,
    AnthropicVectorIcon,
    GoogleVectorIcon,
    DeepseekVectorIcon,
    CheckMarkIcon,
  } from "@sparrow/library/icons";

  // Types
  export let selectedModelProvider: string = "openai";
  export let selectedModel: string = "gpt-4o";
  export let isOpen: boolean = false;
  let isModelProviderChangeAlertPopupOpen = false;
  let nextModelSelectRequest;

  // Props
  export let onSelect: (
    provider: string,
    model: { name: string; id: string },
  ) => void;

  const dispatch = createEventDispatcher();

  // Available providers and their models
  const providers = [
    {
      name: "OpenAI",
      id: "openai",
      disabled: false,
      icon: OpenAIVectorIcon,
      models: [
        { name: "GPT 4o", id: "gpt-4o" },
        { name: "GPT 4o Mini", id: "gpt-4o-mini" },
        { name: "GPT 4.5 Preview", id: "gpt-4.5-preview" },
        { name: "GPT 4 Turbo", id: "gpt-4-turbo" },
        { name: "GPT 4", id: "gpt-4" },
        { name: "GPT 4.1", id: "gpt-4.1" },
        { name: "o1", id: "o1" },
        { name: "o1 Mini", id: "o1-mini" },
        { name: "o3 Mini", id: "o3-mini" },
        { name: "GPT 3.5 Turbo", id: "gpt-3.5-turbo" },
      ],
    },
    {
      name: "Anthropic",
      id: "anthropic",
      disabled: false,
      icon: AnthropicVectorIcon,
      models: [
        { name: "Claude 3.5 Sonnet", id: "claude-3-5-sonnet-20241022" },
        { name: "Claude 3.5 Haiku", id: "claude-3-5-haiku-20241022" },
        { name: "Claude 3 Opus", id: "claude-3-opus-20240229" },
        { name: "Claude 3 Haiku", id: "claude-3-haiku-20240307" },
        { name: "Claude 3 Sonnet", id: "claude-3-5-sonnet-20240620" },
      ],
    },
    {
      name: "DeepSeek",
      id: "deepseek",
      disabled: false,
      icon: DeepseekVectorIcon,
      models: [
        { name: "DeepSeek V3", id: "deepseek-chat" },
        { name: "DeepSeek R1", id: "deepseek-reasoner" },
      ],
    },
    {
      name: "Google",
      id: "google",
      disabled: true,
      icon: GoogleVectorIcon,
      models: [
        { name: "Gemini Pro", id: "gemini-pro" },
        { name: "Gemini Ultra", id: "gemini-ultra" },
      ],
    },
  ];

  // Current active provider
  let activeProvider =
    providers.find((p) => p.id === selectedModelProvider) || providers[0];
  let activeModel =
    activeProvider.models.find((model) => model.id === selectedModel) ??
    activeProvider.models[0];

  // Navigation tabs setup
  let tabs = providers.map((provider) => ({
    name: provider.name,
    id: provider.id,
    count: 0,
    icon: provider.icon,
    disabled: provider.disabled,
  }));

  // Handle tab changes
  const onTabClick = (tabId: string) => {
    activeProvider = providers.find((p) => p.id === tabId) || providers[0];
  };

  // Handle model selection
  const handleModelSelection = (model: { name: string; id: string }) => {
    // selectedModel = model.id;
    onSelect(activeProvider.id, model);
    isOpen = false;
    dispatch("close");
  };

  // Close dropdown when clicking outside
  let dropdownRef: HTMLDivElement;

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(event.target as Node) && isOpen) {
      isOpen = false;
      dispatch("close");
    }
  };

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
</script>

{#if isOpen}
  <div
    class="position-absolute top-100 start-0 w-100 mt-1 dropdown-menu-custom shadow"
    bind:this={dropdownRef}
    transition:fly={{ y: -5, duration: 200 }}
  >
    <div
      class="d-flex align-items-center ms-2 border-secondary"
      style="height: 45px;"
    >
      <Navigator {tabs} {onTabClick} currentTabId={activeProvider.id} />
    </div>
    <hr class="m-0" style="color: var(--bg-ds-neutral-500);" />
    <div
      class="p-3 overflow-auto models-container"
      transition:fade={{ duration: 100 }}
    >
      <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2">
        {#each activeProvider.models as model, index}
          <div class="col">
            <div
              class=" h-10 model-card p-2 {selectedModel === model.id
                ? 'selected-card'
                : ''}"
              on:click={() => {
                if (activeProvider.id !== selectedModelProvider) {
                  isModelProviderChangeAlertPopupOpen = true;
                  nextModelSelectRequest = model;
                  return;
                }
                handleModelSelection(model);
              }}
            >
              <div
                class="p-0 d-flex align-items-center justify-content-between"
              >
                <div class="d-flex align-items-center">
                  <div
                    class="me-2 d-flex align-items-center justify-content-center"
                  >
                    <span>
                      <ChannelRegular
                        size={"20px"}
                        color={selectedModel === model.id
                          ? "var(--icon-ds-primary-300)"
                          : undefined}
                      />
                    </span>
                  </div>
                  <span
                    class="fw-medium text-ds-font-size-12"
                    style="font-family: inter, sans-serif; {selectedModel ===
                    model.id
                      ? 'color: var(--text-ds-primary-300)'
                      : ''}">{model.name}</span
                  >
                </div>
                {#if selectedModel === model.id}
                  <div class="checkmark-container">
                    <CheckMarkIcon
                      size={"16px"}
                      color="var(--icon-ds-primary-300)"
                    />
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<Modal
  title={"Confirm Model Change!"}
  type={"dark"}
  zIndex={1000}
  isOpen={isModelProviderChangeAlertPopupOpen}
  width={"42%"}
  handleModalState={() => {
    isModelProviderChangeAlertPopupOpen = false;
    nextModelSelectRequest = null;
  }}
>
  <div class="mt-2 mb-4">
    <p class="lightGray text-fs-14" style="color: lightGray;">
      Changing the model will reset your current conversation and reset any
      model-specific configurations. This action cannot be undone. Are you sure
      you want to proceed?
    </p>
  </div>

  <div class="d-flex justify-content-end gap-2">
    <Button
      title={"Cancel"}
      textClassProp={"fs-6"}
      size={"medium"}
      customWidth={"95px"}
      type={"secondary"}
      onClick={() => {
        isModelProviderChangeAlertPopupOpen = false;
        nextModelSelectRequest = null;
      }}
    ></Button>
    <Button
      title={"Proceed"}
      size={"medium"}
      textClassProp={"fs-6"}
      type={"primary"}
      customWidth={"95px"}
      disable={false}
      onClick={() => {
        handleModelSelection(nextModelSelectRequest);
        isModelProviderChangeAlertPopupOpen = false;
      }}
    ></Button>
  </div>
</Modal>

<style>
  /* Custom styles for elements that Bootstrap can't easily handle */
  .dropdown-menu-custom {
    background-color: var(--bg-ds-surface-600);
    border-radius: 4px;
    z-index: 1000;
  }

  .models-container {
    max-height: 230px;
    min-height: 170px;
  }

  .model-card {
    width: 100%;
    max-width: 210px;
    border-radius: 4px;
    background-color: var(--bg-ds-surface-600);
    border: 1px solid var(--bg-ds-surface-300);
    transition: background-color 0.2s ease;
  }

  .model-card:hover {
    cursor: pointer;
  }

  .checkmark-container {
    margin-right: 4px;
  }
</style>
