<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { Navigator } from "@sparrow/library/ui";

  // Types
  export let selectedModelProvider: string = "Anthropic";
  export let selectedModel: string | undefined = undefined;
  export let isOpen: boolean = false;

  // Props
  export let onSelect: (provider: string, model: string) => void;

  const dispatch = createEventDispatcher();

  // Available providers and their models
  const providers = [
    {
      name: "Anthropic",
      id: "anthropic",
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
      models: [
        { name: "Gemini Pro", id: "gemini-pro" },
        { name: "Gemini Ultra", id: "gemini-ultra" },
      ],
    },
    {
      name: "OpenAI",
      id: "openai",
      models: [
        { name: "GPT-4o", id: "gpt-4o" },
        { name: "GPT-4", id: "gpt-4" },
        { name: "GPT-3.5 Turbo", id: "gpt-3.5-turbo" },
      ],
    },
    {
      name: "DeepSeek",
      id: "deepseek",
      models: [
        { name: "DeepSeek Coder", id: "deepseek-coder" },
        { name: "DeepSeek Chat", id: "deepseek-chat" },
      ],
    },
  ];

  // Current active provider
  let activeProvider =
    providers.find((p) => p.name === selectedModelProvider) || providers[0];

  // Navigation tabs setup
  let tabs = providers.map((provider) => ({
    name: provider.name,
    id: provider.id,
    count: 0,
  }));

  // Handle tab changes
  const onTabClick = (tabId: string) => {
    activeProvider = providers.find((p) => p.id === tabId) || providers[0];
  };

  // Handle model selection
  const handleModelSelection = (model: { name: string; id: string }) => {
    selectedModel = model.name;
    onSelect(activeProvider.name, model.name);
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
    class="model-selector-dropdown"
    bind:this={dropdownRef}
    transition:fly={{ y: -5, duration: 200 }}
  >
    <div class="provider-tabs">
      <Navigator {tabs} {onTabClick} currentTabId={activeProvider.id} />
    </div>

    <div class="models-list" transition:fade={{ duration: 100 }}>
      {#each activeProvider.models as model}
        <div
          class="model-item"
          class:selected={selectedModel === model.name}
          on:click={() => handleModelSelection(model)}
        >
          <div class="model-icon">
            {#if selectedModel === model.name}
              <div class="selected-indicator"></div>
            {/if}
          </div>
          <span>{model.name}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .model-selector-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: var(--bg-ds-surface-600);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    overflow: hidden;
    margin-top: 3px;
  }

  .provider-tabs {
    border-bottom: 1px solid var(--border-secondary-200);
  }

  .models-list {
    max-height: 250px;
    overflow-y: auto;
    padding: 8px 0;
  }

  .model-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .model-item:hover {
    background-color: var(--bg-ds-surface-500);
  }

  .model-item.selected {
    background-color: var(--bg-secondary-450);
  }

  .model-icon {
    width: 16px;
    height: 16px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .selected-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--text-primary-100);
  }
</style>
