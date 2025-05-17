<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { Navigator } from "@sparrow/library/ui";
  import {
    ChannelRegular,
    OpenAIVectorIcon,
    AnthropicVectorIcon,
    GoogleVectorIcon,
    DeepseekVectorIcon,
    CheckMarkIcon,
  } from "@sparrow/library/icons";

  // Types
  export let selectedModelProvider: string;
  export let selectedModel: string | undefined = undefined;
  export let isOpen: boolean = false;

  // Props
  export let onSelect: (
    provider: string,
    model: { name: string; id: string },
  ) => void;

  const dispatch = createEventDispatcher();

  // Available providers and their models
  const providers = [
    {
      name: "openai",
      id: "openai",
      disabled: false,
      icon: OpenAIVectorIcon,
      models: [
        { name: "GPT-4o", id: "gpt-4o" },
        { name: "GPT 4o Mini", id: "gpt-4o-mini" },
        { name: "GPT 4.5 Preview", id: "gpt-4.5-preview" },
        { name: "GPT 4 Turbo", id: "gpt-4-turbo" },
        { name: "GPT-4", id: "gpt-4" },
        { name: "GPT 4.1", id: "gpt-4.1" },
        { name: "o1", id: "o1" },
        { name: "o1 Mini", id: "o1-mini" },
        { name: "o3 Mini", id: "o3-mini" },
        { name: "GPT-3.5 Turbo", id: "gpt-3.5-turbo" },
      ],
    },
    {
      name: "Anthropic",
      id: "anthropic",
      disabled: true,
      icon: AnthropicVectorIcon,
      models: [
        { name: "Claude 3 Opus", id: "claude-3-opus" },
        { name: "Claude 3 Sonnet", id: "claude-3-sonnet" },
        { name: "Claude 3 Haiku", id: "claude-3-haiku" },
        { name: "Claude 3.5 Sonnet", id: "claude-3.5-sonnet" },
        { name: "Claude 3.5 Haiku", id: "claude-3.5-haiku" },
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
    {
      name: "DeepSeek",
      id: "deepseek",
      disabled: true,
      icon: DeepseekVectorIcon,
      models: [
        { name: "DeepSeek Coder", id: "deepseek-coder" },
        { name: "DeepSeek Chat", id: "deepseek-chat" },
      ],
    },
  ];

  // Current active provider
  let activeProvider =
    providers.find((p) => p.name === selectedModelProvider) || providers[0];
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
    selectedModel = model.name;
    onSelect(activeProvider.name, model);
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
    <hr class="m-0" style="color: #62656A;" />
    <div
      class="p-3 overflow-auto models-container"
      transition:fade={{ duration: 100 }}
    >
      <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2">
        {#each activeProvider.models as model}
          <div class="col">
            <div
              class=" h-10 model-card p-2 {selectedModel === model.name
                ? 'selected-card'
                : ''}"
              on:click={() => handleModelSelection(model)}
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
                        color={selectedModel === model.name
                          ? "#6894F9"
                          : undefined}
                      />
                    </span>
                  </div>
                  <span
                    class="fw-medium text-ds-font-size-12"
                    style="font-family: inter, sans-serif; {selectedModel ===
                    model.name
                      ? 'color: #6894F9;'
                      : ''}">{model.name}</span
                  >
                </div>
                {#if selectedModel === model.name}
                  <div class="checkmark-container">
                    <CheckMarkIcon size={"16px"} color="#6894F9" />
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

<style>
  /* Custom styles for elements that Bootstrap can't easily handle */
  .dropdown-menu-custom {
    background-color: var(--bg-ds-surface-600);
    border-radius: 4px;
    z-index: 1000;
  }

  .models-container {
    max-height: 230px;
    min-height: 100px;
  }

  .model-card {
    width: 208px;
    border: 1px solid #272935;
    border-radius: 4px;
    background-color: var(--bg-ds-surface-500);
    transition: background-color 0.2s ease;
  }

  .model-card:hover {
    background-color: var(--bg-secondary-600);
    background-color: #222630;
  }

  .selected-card {
    /* background-color: var(--bg-secondary-450) !important;
    border: 1px solid var(--border-primary-300) !important; */
  }

  .checkmark-container {
    margin-right: 4px;
  }
</style>
