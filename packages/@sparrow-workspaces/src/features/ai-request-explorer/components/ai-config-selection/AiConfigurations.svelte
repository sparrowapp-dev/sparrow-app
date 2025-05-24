<script lang="ts">
  import type {
    AIModelVariant,
    AnthropicModelsConfig,
    DeepSeekModelsConfig,
    GeminiModelsConfig,
    OpenAiModelsConfig,
  } from "@sparrow/common/types/workspace/ai-request-base";
  import type { AiModelProviderEnum } from "@sparrow/common/types/workspace/ai-request-base";
  import { configFormat } from "@sparrow/common/types/workspace/ai-request-dto";
  import { Toggle } from "@sparrow/library/ui";

  // Props
  export let isActive = true;
  export let currSelectedModel: AiModelProviderEnum;
  export let currSelectedModelVariant: AIModelVariant;
  export let onUpdateAiConfigurations: (updates: Record<string, any>) => void;
  export let config:
    | OpenAiModelsConfig
    | AnthropicModelsConfig
    | DeepSeekModelsConfig
    | GeminiModelsConfig;

  // Get current model configuration metadata
  $: currentModelConfig =
    configFormat[currSelectedModel]?.[currSelectedModelVariant] || {};

  // Get configuration entries for the current model
  $: configEntries = Object.entries(currentModelConfig);

  // Event handler for config changes
  const handleConfigChange = (key, value) => {
    const updatedConfig = { ...config, [key]: value };

    // Call the update function to persist changes
    onUpdateAiConfigurations(currSelectedModel, updatedConfig);
  };

  // Reset to default values
  const handleResetToDefault = () => {
    console.log("in handleResetToDefault() :>> ");
    const defaultConfig = {};

    Object.entries(currentModelConfig).forEach(
      ([key, metadata]: [string, any]) => {
        defaultConfig[key] = metadata.defaultValue;
      },
    );

    console.log("def :>> ", defaultConfig);
    onUpdateAiConfigurations(currSelectedModel, defaultConfig);
  };

  // Handle input changes for different types
  const handleInputChange = (key, event) => {
    console.log("in handleInputChange() :>> ");
    console.log("key :>> ", key);
    const format = configFormat[currSelectedModel][currSelectedModelVariant];
    let value = event.target.value;

    if (format.type === "number") {
      value = parseFloat(value);
      if (isNaN(value)) return;

      // Apply min/max constraints
      if (format.min !== undefined && value < parseFloat(format.min)) {
        value = parseFloat(format.min);
      }
      if (format.max !== undefined && value > parseFloat(format.max)) {
        value = parseFloat(format.max);
      }
    }

    handleConfigChange(key, value);
  };

  // Handle toggle changes
  const handleToggleChange = (key, value) => {
    console.log("in handleToggleChange :>> ", key, value);
    handleConfigChange(key, value);
  };

  const getCurrentValue = (key: string, metadata: any) => {
    return config[key] !== undefined ? config[key] : metadata.defaultValue;
  };
</script>

<div class="ai-config-container">
  <div
    class="d-flex justify-content-between align-items-start mb-3"
    style="border-bottom: 0.8px solid var(--bg-ds-surface-300); height: 34px;"
  >
    <p
      class="config-header text-ds-font-size-14 text-ds-font-weight-medium mb-0"
    >
      Configurations
    </p>
    <button
      class="btn btn-sm btn-link text-ds-font-size-12"
      class:disabled={!isActive}
      style="color: var(--bg-ds-neutral-500); text-decoration: none; font-size: 12px;"
      on:click={handleResetToDefault}
      disabled={!isActive}
    >
      Reset to default
    </button>
  </div>

  {#if configEntries.length === 0}
    <div class="text-center py-4">
      <p class="text-muted">
        No configuration options available for the selected model.
      </p>
    </div>
  {:else}
    {#each configEntries as [key, metadata]}
      <div
        class="config-item text-ds-font-size-12 mb-3"
        class:option-disabled={!isActive}
      >
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="fw-medium">{metadata.displayName || key}</div>
            <div class="config-desc text-ds-font-size-11">
              {metadata.description || ""}
            </div>
          </div>

          {#if metadata.type === "boolean"}
            <Toggle
              isActive={getCurrentValue(key, metadata)}
              disabled={!isActive}
              onChange={(event) =>
                handleToggleChange(key, event.target.checked)}
            />
          {:else if metadata.type === "number"}
            <div class="config-value d-flex justify-content-end">
              <input
                type="number"
                class="form-control form-control-sm config-input"
                value={getCurrentValue(key, metadata) || 0}
                min={metadata.min}
                max={metadata.max}
                step={key === "maxTokens" ? "1" : "0.1"}
                disabled={!isActive}
                on:input={(e) => handleInputChange(key, e)}
              />
            </div>
          {:else}
            <!-- <div class="config-value d-flex justify-content-end">
              <input
                type="text"
                class="form-control form-control-sm config-input"
                value={value || ""}
                disabled={!isActive}
                on:input={(e) => handleInputChange(key, e)}
              />
            </div> -->
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .ai-config-container {
    font-family: inter, "sans-serif";
  }
  .config-header {
  }

  .config-item {
  }

  .config-desc {
    color: var(--text-ds-neutral-200);
    font-size: 11px;
    margin-top: 2px;
  }

  .ai-config-container {
    padding: 0;
    height: 100%;
    overflow-y: auto;
    background-color: transparent;
    color: var(--white-color);
  }

  .config-input {
    font-size: 12px;
    /* font-family: inter, "sans-serif"; */
    width: 70px;
    text-align: right;
    background-color: var(--bg-ds-surface-400);
    color: var(--white-color);
    border: 1px solid var(--bg-ds-surface-300);
    border-radius: 4px;
    padding: 4px 8px;
  }

  .config-input:focus {
    border-color: var(--bg-ds-primary-500);
    outline: none;
    box-shadow: 0 0 0 2px rgba(var(--bg-ds-primary-500-rgb), 0.2);
  }

  .config-value {
    min-width: 70px;
    text-align: right;
  }

  .option-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  :global(.form-control:focus) {
    color: var(--white-color);
    box-shadow: none;
  }
</style>
