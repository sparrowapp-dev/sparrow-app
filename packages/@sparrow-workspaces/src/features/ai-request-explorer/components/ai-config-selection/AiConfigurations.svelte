<!-- This component is functional yet -->
<script>
  import { Input } from "@sparrow/library/forms";
  import { Toggle } from "@sparrow/library/ui";

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

  // Event handler for config changes
  function handleConfigChange(key, value) {
    config[key] = value;
  }
</script>

<div class="ai-config-container">
  <div
    class="d-flex justify-content-between align-items-start mb-3"
    style="border-bottom: 0.8px solid #272935; height: 34px;"
  >
    <p class="config-header mb-0">Configuration</p>
    <button
      class="btn btn-sm btn-link text-ds-font-size-12 disabled"
      style="color: #62656A; text-decoration: none; font-size: 12px;"
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

  <!-- <div class="config-item mb-3 option-disabled">
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
  </div> -->

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
          on:input={(e) =>
            handleConfigChange("maxTokens", parseInt(e.target.value))}
        />
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
      </div>
    </div>
  </div>
</div>

<style>
  .config-header {
    font-size: 14px;
    font-weight: 400;
    font-style: inter, "sans-serif";
  }

  .config-item {
    font-size: 12px;
    font-style: inter, "sans-serif";
  }
  .config-input {
    font-size: 12px;
    font-style: inter, "sans-serif";
  }
  .config-desc {
    color: #b6b7b9;
  }
  .ai-config-container {
    padding: 0;
    height: 100%;
    overflow-y: auto;
    background-color: transparent;
    color: #fff;
  }

  .config-input {
    width: 60px;
    text-align: right;
    background-color: #222630;
    color: #fff;
    border-color: #343a40;
  }

  .config-value {
    min-width: 70px;
    text-align: right;
  }

  .option-disabled {
    opacity: 0.5;
  }

  :global(.form-control:focus) {
    background-color: #212529;
    color: #fff;
    border-color: #0d6efd;
    box-shadow: none;
  }
</style>
