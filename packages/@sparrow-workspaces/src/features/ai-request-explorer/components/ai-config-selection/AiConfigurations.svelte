<script lang="ts">
  import type {
    AIModelVariant,
    modelsConfigType,
  } from "@sparrow/common/types/workspace/ai-request-base";
  import type { AiModelProviderEnum } from "@sparrow/common/types/workspace/ai-request-base";
  import { configFormat } from "../../constants";
  import { Button, Toggle } from "@sparrow/library/ui";

  export let isActive = true;
  export let currSelectedModel: AiModelProviderEnum;
  export let currSelectedModelVariant: AIModelVariant;
  export let onUpdateAiConfigurations: (updates: Record<string, any>) => void;
  export let config: modelsConfigType;

  let currentModelConfig;
  $: {
    if (config) {
      currentModelConfig =
        configFormat[currSelectedModel]?.[currSelectedModelVariant] || {}; // Get current model configuration metadata
    }
  }
  $: configEntries = Object.entries(currentModelConfig); // Get configuration entries for the current model

  // Event handler for config changes
  const handleConfigChange = (key, value) => {
    const updatedConfig = { ...config, [key]: value };
    onUpdateAiConfigurations(currSelectedModel, updatedConfig); // Call the update function to persist changes
  };

  // Check if any configuration has been changed from default
  $: hasChanges = configEntries.some(([key, metadata]) => {
    const currentValue =
      config[key] !== undefined ? config[key] : metadata.defaultValue;
    return currentValue !== metadata.defaultValue;
  });

  // Reset to default values
  // Reset to default values
  const handleResetToDefault = () => {
    const defaultConfig = {};
    Object.entries(currentModelConfig).forEach(
      ([key, metadata]: [string, any]) => {
        defaultConfig[key] = metadata.defaultValue;

        // Update the UI elements directly
        if (metadata.dataType === "int" || metadata.dataType === "float") {
          const inputElement = document.getElementById(
            `config-field-${metadata.displayName}`,
          );
          if (inputElement) {
            inputElement.value = metadata.defaultValue || 0;
          }
        } else if (metadata.dataType === "boolean") {
          const toggleElement = document.getElementById(
            `toggle-field-${metadata.displayName}`,
          );
          if (toggleElement) {
            toggleElement.checked = metadata.defaultValue || false;
          }
        }
      },
    );

    onUpdateAiConfigurations(currSelectedModel, defaultConfig);
  };

  // Handle input changes for different types
  const handleInputChange = (key, event) => {
    const format = configFormat[currSelectedModel][currSelectedModelVariant];
    let value = event.target.value;

    if (format[key].dataType === "int" || format[key].dataType === "float") {
      value = parseFloat(value);
      if (isNaN(value)) value = format[key].defaultValue || 0;

      if (format[key].dataType === "int") value = Math.floor(value);

      // Apply min/max constraints
      if (
        format[key].min !== undefined &&
        value < parseFloat(format[key].min)
      ) {
        value = parseFloat(format[key].min);
      }
      if (
        format[key].max !== undefined &&
        value > parseFloat(format[key].max)
      ) {
        value = parseFloat(format[key].max);
      }

      // Update the input field directly with the constrained value
      const inputElement = document.getElementById(
        `config-field-${format[key].displayName}`,
      );
      if (inputElement) {
        inputElement.value = value;
      }
    }

    handleConfigChange(key, value);
  };

  // Handle toggle changes
  const handleToggleChange = (key, value) => {
    handleConfigChange(key, value);
  };

  const getCurrentValue = (key: string, metadata: any) => {
    return config[key] !== undefined ? config[key] : metadata.defaultValue;
  };
</script>

<div class="ai-config-container">
  <div
    class="d-flex justify-content-between align-items-start mb-3"
    style="border-bottom: 0.2px solid var(--bg-ds-surface-300); height: 34px; position: sticky;
      top: 0;
      z-index: 10;
      padding-bottom: 5px;"
  >
    <p
      class="config-header text-ds-font-size-14 text-ds-font-weight-medium mb-0"
    >
      Configurations
    </p>
    <Button
      title={"Reset to default"}
      size={"extra-small"}
      type={"teritiary-regular"}
      disable={!isActive || !hasChanges}
      onClick={handleResetToDefault}
    ></Button>
  </div>

  <div class="config-section">
    {#if configEntries.length === 0}
      <div class="text-center py-4">
        <p class="text-muted">
          No configuration options available for the selected model.
        </p>
      </div>
    {:else}
      {#each configEntries as [key, metadata]}
        {#if !metadata.hidden}
          <!-- Render configuration item -->
          <div
            class="config-item text-ds-font-size-12 mb-3"
            class:option-disabled={metadata.disabled || !isActive}
          >
            <div
              class="d-flex justify-content-between align-items-start mb-2 gap-1"
            >
              <div>
                <div class="fw-medium">{metadata.displayName || key}</div>
                <div class="config-desc text-ds-font-size-11">
                  {metadata.description || ""}
                </div>
              </div>

              {#if metadata.dataType === "boolean"}
                <Toggle
                  id={`toggle-field-${metadata.displayName}`}
                  isActive={config[key]}
                  disabled={!isActive}
                  onChange={(event) => {
                    handleToggleChange(key, event.target.checked);
                  }}
                />
              {:else if metadata.dataType === "int" || metadata.dataType === "float"}
                <div class="config-value d-flex justify-content-end">
                  <input
                    id={`config-field-${metadata.displayName}`}
                    type="number"
                    class="form-control form-control-sm config-input"
                    value={getCurrentValue(key, metadata) || 0}
                    min={metadata.min}
                    max={metadata.max}
                    step={metadata.dataType === "int" ? 1 : 0.1}
                    disabled={!isActive}
                    on:change={(e) => handleInputChange(key, e)}
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
        {/if}
      {/each}
    {/if}
  </div>
</div>

<style>
  .ai-config-container {
    font-family: inter, "sans-serif";
    height: 100%; /* Make sure container has defined height */
    display: flex;
    flex-direction: column;
  }

  .config-section {
    flex: 1; /* Take remaining space */
    overflow-y: auto; /* Enable vertical scrolling */
    padding-right: 4px; /* Add some padding for scrollbar */
  }

  .config-desc {
    color: var(--text-ds-neutral-200);
    font-size: 12px;
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
    width: 70px;
    text-align: right;
    background-color: var(--bg-ds-surface-400);
    color: var(--white-color);
    border: 1px solid var(--bg-ds-surface-300);
    border-radius: 4px;
    padding: 4px 0px;
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

  /* .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  } */

  :global(.form-control:focus) {
    color: var(--white-color);
    box-shadow: none;
  }
</style>
