<script lang="ts">
  import { createEventDispatcher } from "svelte";

  // Props
  export let steps = ["1h", "6h", "12h", "24h"]; // Reference steps that are always visible
  export let className = "";
  export let currentValue = 2; // Current numeric value
  export let minValue = 1;
  export let maxValue = 24;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Reference step values (always visible)
  const referenceValues = [1, 6, 12, 24];

  // Calculate progress percentage based on current value
  $: progressPercentage =
    ((currentValue - minValue) / (maxValue - minValue)) * 100;

  // Calculate position for each step label based on their actual values
  $: stepPositions = referenceValues.map(
    (value) => ((value - minValue) / (maxValue - minValue)) * 100,
  );

  // Handle step clicks (jump to reference values)
  function handleStepClick(stepIndex) {
    const newValue = referenceValues[stepIndex];
    currentValue = newValue;
    dispatch("change", { value: newValue });
  }

  // Handle continuous slider change
  function handleSliderChange(e) {
    const sliderValue = parseInt(e.target.value);
    currentValue = sliderValue;
    dispatch("change", { value: sliderValue });
  }

  // Find which reference step should be highlighted (only if exact match)
  $: activeStepIndex = referenceValues.findIndex((val) => val === currentValue);

  // Check if current value is a reference value
  $: isReferenceValue = referenceValues.includes(currentValue);
</script>

<div class="progress-bar-container {className}">
  <!-- Progress Bar Container -->
  <div class="progress-track-container">
    <!-- Background Track -->
    <div class="progress-track">
      <!-- Active Progress -->
      <div class="progress-active" style="width: {progressPercentage}%"></div>
    </div>

    <!-- Slider Handle -->
    <div class="progress-handle" style="left: {progressPercentage}%">
      <!-- Remove the current-value-label from here -->
    </div>

    <!-- Continuous Range Input (1-24) -->
    <input
      type="range"
      min={minValue}
      max={maxValue}
      bind:value={currentValue}
      on:input={handleSliderChange}
      class="progress-input"
    />
  </div>

  <!-- Combined Labels Container - UPDATED -->
  <div class="labels-container">
    <!-- Current Step Label (positioned below the handle) - ONLY SHOW IF NOT A REFERENCE VALUE -->
    {#if !isReferenceValue}
      <div class="current-value-label" style="left: {progressPercentage}%">
        {currentValue}h
      </div>
    {/if}

    <!-- Reference Step Labels (positioned exactly where they should be) -->
    {#each steps as step, index}
      <button
        on:click={() => handleStepClick(index)}
        class="step-label {index === activeStepIndex ? 'active' : ''}"
        style="left: {stepPositions[index]}%; transform: translateX(-50%);"
      >
        {step}
      </button>
    {/each}
  </div>
</div>

<style>
  .progress-bar-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .progress-track-container {
    position: relative;
    margin-bottom: 8px;
    height: 12px;
  }

  .progress-track {
    width: 100%;
    height: 12px;
    background-color: var(--bg-ds-surface-400);
    border-radius: 6px;
    position: relative;
    overflow: hidden;
  }

  .progress-active {
    height: 12px;
    background-color: var(--bg-ds-primary-500);
    border-radius: 6px;
    transition: width 0.2s ease-out;
  }

  .progress-handle {
    position: absolute;
    top: 50%;
    width: 16px;
    height: 16px;
    background-color: var(--bg-ds-neutral-50);
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transform: translate(-50%, -50%);
    z-index: 2;
    transition: left 0.2s ease-out;
    border: 1.5px solid var(--bg-ds-primary-500);
  }

  .progress-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 3;
  }

  .labels-container {
    position: relative;
    width: 100%;
    height: 28px; /* Single height for both current and reference labels */
  }

  .current-value-label {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    color: white;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    text-align: center;
    transition: left 0.2s ease-out;
    z-index: 4; /* Higher z-index to appear above reference labels */
    /* ADDED: Match step-label padding and structure */
    padding: 4px 8px;
    border-radius: 4px;
    line-height: 1; /* Match line height */
    height: fit-content; /* Ensure consistent height */
  }

  .step-label {
    position: absolute;
    top: 0; /* Same top position as current value label */
    padding: 4px 8px;
    border-radius: 4px;
    transition: color 0.2s;
    background: none;
    border: none;
    color: #64748b;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
    z-index: 1; /* Lower z-index so current value appears above */
    line-height: 1; /* ADDED: Consistent line height */
    height: fit-content; /* ADDED: Ensure consistent height */
  }

  .step-label:hover {
    color: #e2e8f0;
  }

  .step-label.active {
    color: white;
    font-weight: 500;
  }
</style>
