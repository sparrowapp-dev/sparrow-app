<!-- This component is not functional yet -->
<!-- <script>
  import { Input } from "@sparrow/library/forms";
  import { Toggle, Tooltip } from "@sparrow/library/ui";

  // Dummy config data
  //   export let config = {
  let config = {
    streamResponse: true,
    responseFormat: true,
    temperature: 0.5,
    presencePenalty: 0.5,
    frequencyPenalty: 0.5,
    maxTokens: -1,
  };

  let configFormat = {
    streamResponse: {
      type: "boolean",
    },
    responseFormat: {
      type: "boolean",
    },
    temperature: {
      type: "number",
      min: "0",
      max: "1",
    },
    presencePenalty: {
      type: "number",
      min: "0",
      max: "1",
    },
    frequencyPenalty: {
      type: "number",
      min: "0",
      max: "1",
    },
    maxTokens: {
      type: "number",
      min: "-1",
      max: "4095",
    },
  };
  // export let configurations;
  // export let isActive = true;
  // export let onUpdateRequestState;

  // Event handler for config changes
  function handleConfigChange(key, value) {
    config[key] = value;
  }
</script> -->

<!-- <Tooltip title={"Coming Soon"} placement={"top-center"}></Tooltip> -->
<!-- <div class="ai-config-container">
  <div
    class="d-flex justify-content-between align-items-start mb-3"
    style="border-bottom: 0.8px solid var(--bg-ds-surface-300); height: 34px;"
  >
    <p class="config-header mb-0">Configuration</p>
    <button
      class="btn btn-sm btn-link text-ds-font-size-12 disabled"
      style="color: var(--bg-ds-neutral-500); text-decoration: none; font-size: 12px;"
      on:click={() => handleConfigChange("reset", true)}
    >
      Reset to default
    </button>
  </div>

  <div class="config-item mb-3 option-disabled">
    <div class="d-flex justify-content-between align-items-start mb-2">
      <div>
        <div class="fw-medium">Stream Response</div>
        <div class="config-desc">
          Enables real-time output of the model's generated content.
        </div>
      </div>
      <Toggle isActive={true} disabled={true} onChange={() => {}} />
    </div>
  </div>

  <div class="config-item mb-3 option-disabled">
    <div class="d-flex justify-content-between align-items-start mb-2">
      <div>
        <div class="fw-medium">Response Format (JSON)</div>
        <div class="config-desc">
          Forces the model to adhere strictly to JSON formatting in its output.
        </div>
      </div>
      <Toggle isActive={false} disabled={true} onChange={() => {}} />
    </div>
  </div>

  <div class="config-item mb-3 option-disabled">
    <div class="d-flex justify-content-between align-items-start mb-2">
      <div>
        <div class="fw-medium">Temperature</div>
        <div class="config-desc">
          Adjusts the creativity level of the model's responses; higher values
          increase output variability.
        </div>
      </div>
      <div class="config-value d-flex justify-content-end input-disabled">
        <input
          type="text"
          class="form-control form-control-sm config-input"
          value={config.temperature}
          disabled={true}
          on:input={(e) =>
            handleConfigChange("temperature", parseFloat(e.target.value))}
        />
      </div>
    </div>
  </div>

  <div class="config-item mb-3 option-disabled">
    <div class="d-flex justify-content-between align-items-start mb-2">
      <div>
        <div class="fw-medium">Presence Penalty</div>
        <div class="config-desc">
          Controls the frequency with which the model introduces novel or
          unrelated topics.
        </div>
      </div>
      <div class="config-value d-flex justify-content-end">
        <input
          type="text"
          class="form-control form-control-sm config-input"
          value={config.presencePenalty}
          disabled={true}
          on:input={(e) =>
            handleConfigChange("presencePenalty", parseFloat(e.target.value))}
        />
      </div>
    </div>
  </div>

  <div class="config-item mb-3 option-disabled">
    <div class="d-flex justify-content-between align-items-start mb-2">
      <div>
        <div class="fw-medium">Frequency Penalty</div>
        <div class="config-desc">
          Manages the repetition of terms and phrases within the model's output.
        </div>
      </div>
      <div class="config-value d-flex justify-content-end">
        <input
          type="text"
          class="form-control form-control-sm config-input"
          value={config.frequencyPenalty}
          disabled={true}
          on:input={(e) =>
            handleConfigChange("frequencyPenalty", parseFloat(e.target.value))}
        />
      </div>
    </div>
  </div>

  <div class="config-item mb-3 option-disabled">
    <div class="d-flex justify-content-between align-items-start mb-2">
      <div>
        <div class="fw-medium">Max Tokens</div>
        <div class="config-desc">
          Specifies the maximum length of the model's response in tokens (-1
          indicates no limit).
        </div>
      </div>
      <div class="config-value d-flex justify-content-end">
        <input
          type="text"
          class="form-control form-control-sm config-input"
          value={config.maxTokens}
          disabled={true}
          on:input={(e) => {
            handleConfigChange("maxTokens", parseInt(e.target.value));
          }}
        />
      </div>
    </div>
  </div>
</div> -->

<!-- <Input
          type={"text"}
          size={"medium"}
          maxlength={500}
          id={"environment-name"}
          value={2.0}
          variant={"inline"}
          placeholder={""}
          width={"100px"}
          disabled={false}
        /> -->

<!-- <style>
  .config-header {
    font-size: 14px;
    font-weight: 400;
    font-style: inter, "sans-serif";
  }

  .config-item {
    font-size: 12px;
    font-style: inter, "sans-serif";
  }

  .config-desc {
    color: var(--text-ds-neutral-200);
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
    font-style: inter, "sans-serif";
    width: 60px;
    text-align: right;
    background-color: var(--bg-ds-surface-400);
    color: var(--white-color);
    border: none;
  }

  .config-value {
    min-width: 70px;
    text-align: right;
  }

  .option-disabled {
    opacity: 0.5;
  }
</style> -->

<!-- new -->
<script>
  import { Input } from "@sparrow/library/forms";
  import { Toggle, Tooltip } from "@sparrow/library/ui";

  // Props
  export let config = {
    streamResponse: true,
    responseFormat: true,
    temperature: 0.5,
    presencePenalty: 0.5,
    frequencyPenalty: 0.5,
    maxTokens: -1,
  };

  export let configFormat = {
    streamResponse: {
      type: "boolean",
      displayName: "Stream Response",
      description: "Enables real-time output of the model's generated content.",
      defaultValue: true,
    },
    responseFormat: {
      type: "boolean",
      displayName: "Response Format (JSON)",
      description:
        "Forces the model to adhere strictly to JSON formatting in its output.",
      defaultValue: false,
    },
    temperature: {
      type: "number",
      min: "0",
      max: "1",
      displayName: "Temperature",
      description:
        "Adjusts the creativity level of the model's responses; higher values increase output variability.",
      defaultValue: 0.5,
    },
    presencePenalty: {
      type: "number",
      min: "0",
      max: "1",
      displayName: "Presence Penalty",
      description:
        "Controls the frequency with which the model introduces novel or unrelated topics.",
      defaultValue: 0.69,
    },
    frequencyPenalty: {
      type: "number",
      min: "0",
      max: "1",
      displayName: "Frequency Penalty",
      description:
        "Manages the repetition of terms and phrases within the model's output.",
      defaultValue: 0.0,
    },
    maxTokens: {
      type: "number",
      min: "-1",
      max: "4095",
      displayName: "Max Tokens",
      description:
        "Specifies the maximum length of the model's response in tokens (-1 indicates no limit).",
      defaultValue: -1,
    },
  };

  export let configurations;
  export let isActive = true;
  export let onUpdateRequestState;

  // Internal state for config values
  let internalConfig = { ...config };

  // Reactive statement to update internal config when props change
  $: if (config) {
    internalConfig = { ...config };
  }

  // Event handler for config changes
  function handleConfigChange(key, value) {
    // Update internal config
    internalConfig[key] = value;

    // Call the parent update function if provided
    // if (onUpdateRequestState) {
    //   onUpdateRequestState(key, value);
    // }
  }

  // Reset to default values
  function handleReset() {
    const defaultConfig = getDefaultValues();
    internalConfig = { ...defaultConfig };

    // Notify parent of all changes
    // if (onUpdateRequestState) {
    //   Object.keys(defaultConfig).forEach((key) => {
    //     onUpdateRequestState(key, defaultConfig[key]);
    //   });
    // }
  }

  // Get default values based on config format
  function getDefaultValues() {
    const defaults = {};
    Object.keys(configFormat).forEach((key) => {
      const format = configFormat[key];
      defaults[key] =
        format.defaultValue !== undefined
          ? format.defaultValue
          : format.type === "boolean"
            ? false
            : format.type === "number"
              ? parseFloat(format.min) || 0
              : "";
    });
    return defaults;
  }

  // Handle input changes for different types
  function handleInputChange(key, event) {
    const format = configFormat[key];
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
  }

  // Handle toggle changes
  function handleToggleChange(key, value) {
    handleConfigChange(key, value);
  }
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
      on:click={handleReset}
      disabled={!isActive}
    >
      Reset to default
    </button>
  </div>

  {#each Object.keys(configFormat) as key}
    {@const format = configFormat[key]}
    {@const value = internalConfig[key] || format.defaultValue}

    <div
      class="config-item text-ds-font-size-12 mb-3"
      class:option-disabled={!isActive}
    >
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div class="fw-medium">{format.displayName || key}</div>
          <div class="config-desc text-ds-font-size-11">
            {format.description || ""}
          </div>
        </div>

        {#if format.type === "boolean"}
          <Toggle
            isActive={value || false}
            disabled={!isActive}
            onChange={(newValue) => handleToggleChange(key, newValue)}
          />
        {:else if format.type === "number"}
          <div class="config-value d-flex justify-content-end">
            <input
              type="number"
              class="form-control form-control-sm config-input"
              value={value || 0}
              min={format.min}
              max={format.max}
              step={key === "maxTokens" ? "1" : "0.1"}
              disabled={!isActive}
              on:input={(e) => handleInputChange(key, e)}
            />
          </div>
        {:else}
          <div class="config-value d-flex justify-content-end">
            <input
              type="text"
              class="form-control form-control-sm config-input"
              value={value || ""}
              disabled={!isActive}
              on:input={(e) => handleInputChange(key, e)}
            />
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .ai-config-container {
    font-family: inter, "sans-serif";
  }
  .config-header {
  }

  .config-item {
    /* font-size: 12px; */
    /* font-family: inter, "sans-serif"; */
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
